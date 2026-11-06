#!/usr/bin/env python3
"""
guard.py — decide whether a client's change set is a safe content edit.

    python guard.py --repo DIR --base origin/main --head HEAD [--report out.md]

Exit 0 = PASS (only content inside qik regions and media files changed, nothing risky).
Exit 1 = REVIEW (something needs a human: layout, code, new pages, risky markup...).
Exit 2 = usage / git error.

Used in two places with the same rules:
  - the client skill, before it pushes (so the client hears about problems right away)
  - the repo's GitHub Action, which is the real gate (the Action runs the copy on the live
    branch, so a changed guard in the client's branch can't loosen the rules)
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys

MEDIA_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".mp3", ".m4a", ".wav", ".pdf"}
PAGE_EXT = {".html", ".htm"}
MAX_BYTES = 25 * 1024 * 1024

TAG_RE = re.compile(r"<!--\s*(qik(?:-[a-z]+)*|qikform)(?=[\s:]|-->)(.*?)-->", re.S)
OPENERS = {"qik", "qik-text", "qik-img", "qik-portfolio", "qik-gallery", "qik-playlist",
           "qik-nav", "qik-blog-list", "qik-form"}
FIELD = {"qik", "qik-text", "qik-img"}
# content a client edit must never introduce
RISKY = [
    (re.compile(r"<\s*script\b", re.I), "a <script> tag"),
    (re.compile(r"<\s*(iframe|object|embed|frame|frameset)\b", re.I), "an embedded frame/object"),
    (re.compile(r"<\s*(style|link|meta|base|form|input|button)\b", re.I), "page-level markup (<style>/<link>/<meta>/<form>…)"),
    (re.compile(r"\son[a-z]+\s*=", re.I), "an inline event handler (onclick=… etc.)"),
    (re.compile(r"(javascript|vbscript)\s*:", re.I), "a javascript: link"),
    (re.compile(r"data:\s*text/html", re.I), "a data:text/html link"),
    (re.compile(r"\bstyle\s*=", re.I), "inline style attributes"),
]


def git(repo, *args, binary=False):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode(errors="replace").strip())
    return r.stdout if binary else r.stdout.decode("utf-8", errors="replace")


def regions(text):
    """Split a page into (outside_text, [ (kind, name, content), ... ]).
    outside_text keeps the tags themselves, with each top-level region body replaced by a marker."""
    out, regs, stack, pos = [], [], [], 0
    body_start = None
    for m in TAG_RE.finditer(text):
        kind, rest = m.group(1), m.group(2)
        if kind == "qik-blog-meta" or kind == "qikform":
            continue  # self-contained comments; part of the "outside" text
        if kind in OPENERS:
            name = rest.strip().split()[0] if rest.strip() else ""
            if kind in FIELD:
                name = re.split(r"[\s(]", rest.strip(), 1)[0] if rest.strip() else ""
            if not stack:
                out.append(text[pos:m.end()])
                body_start = m.end()
                stack.append((kind, name))
            else:
                stack.append((kind, name))
        elif kind == "qik-end" or kind.endswith("-end"):
            if not stack:
                raise ValueError(f"unbalanced {kind}")
            ok, oname = stack.pop()
            if not stack:
                regs.append((ok, oname, text[body_start:m.start()]))
                out.append("\x00REGION\x00")
                pos = m.start()
        # unknown tags are ordinary comments
    if stack:
        raise ValueError(f"'{stack[0][0]} {stack[0][1]}' is never closed")
    out.append(text[pos:])
    return "".join(out), regs


# --- blog (qikBlog) ----------------------------------------------------------

META_RE = re.compile(r"<!--\s*qik-blog-meta\s*(\{.*?\})\s*qik-blog-meta-end\s*-->", re.S)
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]


def blog_meta(text):
    m = META_RE.search(text)
    if not m:
        return None
    try:
        d = json.loads(m.group(1))
    except json.JSONDecodeError:
        return None
    return d if isinstance(d, dict) else None


def mask_post_head(text):
    """Blank the per-post values that live outside editable regions, so two posts built
    from the same template compare equal. Each mask only matches plain text, so nothing
    can hide inside a masked value."""
    text = META_RE.sub("<!--META-->", text)
    text = re.sub(r"<title>[^<]*</title>", "<title>*</title>", text, flags=re.I)
    text = re.sub(r'(<meta\s+(?:name|property)="(?:description|og:[a-z:_]+|twitter:[a-z:_]+)"\s+content=")[^"<>]*(")',
                  r"\1*\2", text, flags=re.I)
    text = re.sub(r'(<link\s+rel="canonical"\s+href=")[^"<>]*(")', r"\1*\2", text, flags=re.I)
    return text


def fmt_date(iso):
    y, m, d = iso.split("-")
    return f"{MONTHS[int(m) - 1]} {int(d)}, {y}"


def listing_entries(body):
    out = []
    for art in re.findall(r"<article\b.*?</article>", body, re.S):
        href = re.search(r'href="([^"]*)"', art)
        h2 = re.search(r"<h2>(.*?)</h2>", art, re.S)
        tm = re.search(r'datetime="([^"]*)"', art)
        img = re.search(r'<img\b[^>]*src="([^"]*)"', art)
        out.append((href.group(1) if href else "", html.unescape(h2.group(1)).strip() if h2 else "",
                    tm.group(1) if tm else "", img.group(1) if img else ""))
    return out


def listing_html(posts, existing_body):
    """Rebuild the qik-blog-list body in qikEdit's generated format.
    posts: [(href, meta)]. Visible posts, newest first; same-date posts keep their current order."""
    order = {e[0]: i for i, e in enumerate(listing_entries(existing_body))}
    vis = [(h, m) for h, m in posts if not m.get("hidden") and m.get("title") and m.get("date")]
    vis.sort(key=lambda x: (x[1]["date"], -order.get(x[0], -1)), reverse=True)
    parts = []
    for href, m in vis:
        t = html.escape(m["title"], quote=True)
        img = (f'\n      <img src="{html.escape(m["featuredImage"], quote=True)}" alt="{t}" class="post-featured-image">'
               if m.get("featuredImage") else "")
        parts.append(f'  <article class="blog-post-preview">\n    <a href="{href}">{img}\n'
                     f'      <h2>{t}</h2>\n      <time datetime="{m["date"]}">{fmt_date(m["date"])}</time>\n'
                     f'    </a>\n  </article>')
    return "\n" + "\n".join(parts) + "\n"


def tree_posts(repo, ref):
    """[(listing href, meta)] for every post in blog/ at a git ref."""
    files = git(repo, "ls-tree", "-r", "--name-only", ref, "--", "blog").split()
    out = []
    for f in files:
        if f.endswith(".html"):
            m = blog_meta(git(repo, "show", f"{ref}:{f}"))
            if m:
                out.append((f, m))
    return out


def valid_meta(m):
    if not m or not m.get("title") or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(m.get("date", ""))):
        return "qik-blog-meta needs a title and a YYYY-MM-DD date."
    if re.search(r"[<>]", json.dumps(m)):
        return "qik-blog-meta contains < or > characters."
    fi = m.get("featuredImage")
    if fi and not str(fi).startswith("/media/"):
        return "featuredImage must be a /media/ path."
    if "hidden" in m and not isinstance(m["hidden"], bool):
        return "hidden must be true or false."
    return None


def check_region(path, kind, name, old, new, problems):
    if old == new:
        return
    label = f"{path} → {kind} {name}".strip()
    if kind == "qik-blog-list":
        return  # verified against the posts in guard()
    if kind in ("qik-form", "qik-nav"):
        problems.append(f"{label}: this section is managed by Sans Terra (forms, menus, blog listing).")
        return
    # only judge what the edit added, so existing approved markup doesn't trip the check
    for rx, what in RISKY:
        if len(rx.findall(new)) > len(rx.findall(old)):
            problems.append(f"{label}: the edit adds {what}.")
    if kind == "qik-text":
        is_title = re.fullmatch(r"\s*<title>[^<]*</title>\s*", new, re.I)
        if not is_title and re.search(r"<[a-zA-Z/][^>]*>", new):
            problems.append(f"{label}: plain-text field now contains HTML.")
    if kind == "qik-img":
        imgs = re.findall(r"<img\b[^>]*>", new, re.I)
        if len(imgs) != 1:
            problems.append(f"{label}: image field must hold exactly one <img>.")
        for tag in imgs:
            src = re.search(r"\bsrc\s*=\s*[\"']([^\"']*)", tag)
            if src and not src.group(1).startswith("/media/") and src.group(1) not in old:
                problems.append(f"{label}: new image must come from /media/ (got {src.group(1)}).")
    if kind == "qik-portfolio":
        classes = re.findall(r"class\s*=\s*[\"']([^\"']*)", new)
        if not any("portfolio" in c and "item" in c for c in classes):
            problems.append(f"{label}: gallery has no items left, or their structure changed.")
        for src in re.findall(r"(?:src|data-setup|data-more)\s*=\s*[\"']([^\"']*)", new):
            for s in [x.strip() for x in src.split(",") if x.strip()]:
                if not s.startswith("/media/") and s not in old:
                    problems.append(f"{label}: image path outside /media/: {s}")
    for href in re.findall(r"href\s*=\s*[\"']([^\"']*)", new):
        if href not in old and not re.match(r"^(https?://|/|#|mailto:|tel:)", href):
            problems.append(f"{label}: unusual link '{href}'.")


def guard(repo, base, head):
    problems, notes = [], []
    try:
        mb = git(repo, "merge-base", base, head).strip()
        diff = git(repo, "diff", "--name-status", "--no-renames", mb, head)
    except RuntimeError as e:
        return None, [f"git error: {e}"]
    changed = [l.split("\t", 1) for l in diff.splitlines() if l.strip()]
    if not changed:
        return [], ["No changes."]
    added = {p for st, p in changed if st == "A"}
    try:  # optional list of paths that always need review (e.g. legal pages), read from the base
        protected = [l.strip() for l in git(repo, "show", f"{mb}:.github/qik/protected.txt").splitlines()
                     if l.strip() and not l.startswith("#")]
    except RuntimeError:
        protected = []
    for status, path in changed:
        ext = os.path.splitext(path)[1].lower()
        top = path.split("/")[0]
        if any(path == pp or path.startswith(pp.rstrip("/") + "/") for pp in protected):
            problems.append(f"{path}: this page is on the protected list and always needs review.")
            continue
        if top == "media" and ext in MEDIA_EXT:
            if status != "D":
                size = len(git(repo, "show", f"{head}:{path}", binary=True))
                if size > MAX_BYTES:
                    problems.append(f"{path}: file is over 25 MB.")
                notes.append(f"{'Added' if status == 'A' else 'Replaced'} media: {path}")
            else:
                notes.append(f"Deleted media: {path}")
            continue
        if path == "sitemap.xml" and status == "M":
            old, new = git(repo, "show", f"{mb}:{path}"), git(repo, "show", f"{head}:{path}")
            blocks = re.findall(r"\s*<url>.*?</url>", new, re.S)
            extra = [b for b in blocks if b not in old]
            stripped = new
            for b in extra:
                stripped = stripped.replace(b, "", 1)
            locs_ok = all(any(re.search(rf"<loc>[^<]*{re.escape(os.path.splitext(os.path.basename(a))[0])}/?</loc>", b)
                              for a in added) for b in extra)
            if stripped != old or not locs_ok:
                problems.append("sitemap.xml: only new entries for new posts can be added without review.")
            else:
                notes.append(f"Sitemap: added {len(extra)} entr{'y' if len(extra) == 1 else 'ies'}")
            continue
        if ext in PAGE_EXT and status == "A" and path.startswith("blog/") and path.count("/") == 1:
            new_text = git(repo, "show", f"{head}:{path}")
            err = valid_meta(blog_meta(new_text))
            if err:
                problems.append(f"{path}: {err}")
                continue
            try:
                new_out, new_regs = regions(mask_post_head(new_text))
            except ValueError as e:
                problems.append(f"{path}: couldn't read the editable regions ({e}).")
                continue
            template = None
            for f, _ in tree_posts(repo, mb):
                t_out, t_regs = regions(mask_post_head(git(repo, "show", f"{mb}:{f}")))
                if t_out == new_out and [(k, n) for k, n, _ in t_regs] == [(k, n) for k, n, _ in new_regs]:
                    template = t_regs
                    break
            if template is None:
                problems.append(f"{path}: new post doesn't match the layout of an existing post.")
                continue
            for (k, n, o), (_, _, nw) in zip(template, new_regs):
                check_region(path, k, n, o, nw, problems)
            notes.append(f"New blog post: {path}")
            continue
        if ext in PAGE_EXT and status == "M":
            try:
                old_text, new_text = git(repo, "show", f"{mb}:{path}"), git(repo, "show", f"{head}:{path}")
                is_post = blog_meta(old_text) is not None
                if is_post:
                    err = valid_meta(blog_meta(new_text))
                    if err:
                        problems.append(f"{path}: {err}")
                        continue
                    old_text, new_text = mask_post_head(old_text), mask_post_head(new_text)
                old_out, old_regs = regions(old_text)
                new_out, new_regs = regions(new_text)
            except (ValueError, RuntimeError) as e:
                problems.append(f"{path}: couldn't read the editable regions ({e}).")
                continue
            if old_out != new_out:
                problems.append(f"{path}: something outside the editable areas changed (layout, code or tags).")
                continue
            if [(k, n) for k, n, _ in old_regs] != [(k, n) for k, n, _ in new_regs]:
                problems.append(f"{path}: editable areas were added, removed or renamed.")
                continue
            touched = 0
            for (k, n, o), (_, _, nw) in zip(old_regs, new_regs):
                if o != nw:
                    touched += 1
                    check_region(path, k, n, o, nw, problems)
                    if k == "qik-blog-list":
                        want = listing_html(tree_posts(repo, head), o)
                        if listing_entries(nw) != listing_entries(want):
                            problems.append(f"{path}: the blog list doesn't match the posts (it must list every visible post, newest first).")
            if is_post:
                notes.append(f"Edited blog post {path} ({touched} area(s) and/or its settings)")
            else:
                notes.append(f"Edited {touched} area(s) on {path}")
            continue
        verb = {"A": "added", "D": "deleted", "M": "changed"}.get(status, status)
        problems.append(f"{path}: {verb} — only page text, galleries, blog posts and media can be changed without review.")
    return problems, notes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=".")
    ap.add_argument("--base", required=True)
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--report")
    a = ap.parse_args()
    problems, notes = guard(a.repo, a.base, a.head)
    if problems is None:
        print("\n".join(notes))
        return 2
    verdict = "PASS" if not problems else "REVIEW"
    lines = [f"## Content check: {verdict}", ""]
    if problems:
        lines += ["**Needs a person to look at it:**", ""] + [f"- {p}" for p in problems] + [""]
    if notes:
        lines += ["**What changed:**", ""] + [f"- {n}" for n in notes]
    text = "\n".join(lines)
    print(text)
    if a.report:
        with open(a.report, "w") as fh:
            fh.write(text + "\n")
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
