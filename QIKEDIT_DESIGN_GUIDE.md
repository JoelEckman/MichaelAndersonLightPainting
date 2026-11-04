# qikEdit Website Design Guide (Version 3.1)

This document provides a complete guide for building websites that are compatible with the qikEdit visual CMS running on qikSites.js. By following this specification, you can create websites that allow content editing directly in the browser — no downloads or desktop app required.

## Table of Contents

1. [Overview](#overview)
2. [Basic Concepts](#basic-concepts)
3. [qik Tag Types](#qik-tag-types)
4. [Special Section Tags](#special-section-tags)
5. [qikForms Integration](#qikforms-integration)
6. [Best Practices](#best-practices)
7. [Example Implementations](#example-implementations)
8. [Using this guide with an IDE or AI agent](#using-this-guide-with-an-ide-or-ai-agent)
9. [Setting the site up as a Git repository](#setting-the-site-up-as-a-git-repository)
10. [Summary](#summary)

---

## Overview

qikEdit allows website owners to edit their content through a visual WYSIWYG interface served directly by your qikSites.js instance. This is accomplished by adding special comment tags to your HTML, PHP, or JavaScript files that mark regions as editable.

### Key Benefits

- Keep the performance and security benefits of static websites
- Provide a user-friendly editing interface without a separate CMS
- Edit content by clicking directly on the rendered page
- Manage portfolios, galleries, and playlists with structured interfaces
- Edit directly in the browser — no downloads required

### How It Works

1. Developers add qik tags to mark editable regions in their code
2. The site is hosted by qikSites.js and managed through the portal
3. Users open qikEdit in the browser, directly from the portal
4. Users click on tagged regions to edit them
5. Changes are saved and published from within the browser editor

---

## Basic Concepts

### Tag Syntax

All qik tags follow this pattern:

```
[OPENING TAG] [field-name] [(optional description)]
[EDITABLE CONTENT]
[CLOSING TAG]
```

### Field Names

- **Allowed characters**: Letters (uppercase and lowercase), numbers, hyphens (`-`), and underscores (`_`)
- **Best practice**: Use lowercase with hyphens for readability (e.g., `hero-tagline`, `about-text`, `email-address`)
- **Display names**: Hyphens are converted to spaces and each word is title-cased automatically
  - Example: `hero-tagline` → "Hero Tagline"
  - Example: `email-address` → "Email Address"
  - Note: Underscores are preserved in display names (e.g., `my_field` → "My_field")

### Descriptions

- Optional but recommended
- Shown to the user in the editing interface
- Helps clarify what content belongs in the field
- Placed in parentheses after the field name

### Fields the Canvas Can't Show

qikEdit's visual editor draws a clickable outline around every tagged region it can see on the page. Some tagged content never gets an outline because the browser doesn't display it:

- Anything in `<head>` — the page title, meta description, `qik-blog-meta`
- Content inside `<script>` or `<style>`
- Regions inside collapsed drawers, inactive tabs, or `display: none` elements (until site JS reveals them)

All of these are still editable. The **Page Fields** button in the editor sidebar lists every tagged field in the current page, grouped into *Not visible on canvas* and *On canvas*, with a preview of each value. Click any row to edit it in the normal panel. It's also a quick way to audit which fields a page has.

#### Page titles

Never put qik comments *inside* `<title>`. The browser treats everything between `<title>` and `</title>` as literal text, so the comment markers would show up in the browser tab. Wrap the whole element instead:

```html
<!-- qik-text page-title (Browser tab title) --><title>Home</title><!-- qik-end -->
```

qikEdit recognises this pattern: the editor shows only the title text, and saving keeps the `<title>` element intact (any HTML typed into the field is stripped, since `<title>` can only hold text).

---

## qik Tag Types

qikEdit supports nine distinct tag types, each designed for specific content editing needs:

1. **Standard (WYSIWYG)** - Rich text editing with formatting controls
2. **Text-Only** - Plain text, URLs, and code without WYSIWYG formatting
3. **Image** - Swappable images via visual media picker
4. **Portfolio** - Structured collections of work samples and projects
5. **Gallery** - Photo gallery management with image uploads
6. **Playlist** - Audio playlist management
7. **Blog** - Blog post metadata and automatic listing generation
8. **Contact Forms (qik-form)** - Embedded qikForms contact forms (see qikForms Integration section)
9. **Navigation (qik-nav)** - Site navigation menu management with drag-and-drop reordering

**Comment Syntax Compatibility:** All tag types support three comment syntaxes:
- HTML comments (`<!-- -->`) for HTML and PHP files
- JavaScript single-line comments (`//`) for JavaScript files
- JavaScript multi-line comments (`/* */`) for JavaScript files

---

### 1. Standard WYSIWYG Tags

These fields support rich text editing with a visual editor (bold, italic, links, etc.).

#### HTML Comment Syntax

```html
<!-- qik field-name (Description of this field) -->
<p>This content can be edited with WYSIWYG tools.</p>
<p>Multiple paragraphs, <strong>formatting</strong>, and <a href="#">links</a> are supported.</p>
<!-- qik-end -->
```

**Use cases:**
- Hero section text
- About sections
- Article body content
- Any HTML content that benefits from formatting

**Example:**

```html
<!-- qik hero-tagline (Large header text, single line.) -->
<p class="tagline">Professional Voice Over Talent</p>
<!-- qik-end -->

<!-- qik about-text (Primary bio area, paragraph content.) -->
<h2>About Mike</h2>
<p>I'm an actor with over 10 years of experience who also has worked on voice projects for the same time. I am someone who loves to do the weird thing, the "out there" thing, and love adapting to new challenges.</p>
<p>Whether you need a commanding narrator, a friendly spokesperson, or something completely unconventional, I bring authenticity and creativity to every project.</p>
<!-- qik-end -->
```

#### JavaScript Single-Line Comment Syntax

```javascript
// qik field-name (Description of this field)
const value = 'editable content';
// qik-end
```

**Example:**

```javascript
// qik api-key (API key for external service)
const API_KEY = 'sk-1234567890abcdef';
// qik-end
```

#### JavaScript Multi-Line Comment Syntax

```javascript
/* qik field-name (Description of this field) */
const value = 'editable content';
/* qik-end */
```

**Example:**

```javascript
/* qik tracking-code (Google Analytics tracking code) */
gtag('config', 'G-JSCH67PDNK');
/* qik-end */
```

---

### 2. Text-Only Tags

These fields do NOT have WYSIWYG editing—they're for plain text, URLs, file paths, or code snippets.

#### HTML Comment Syntax

```html
<!-- qik-text field-name (Description of this field) -->
Plain text content only
<!-- qik-end -->
```

**Use cases:**
- URLs
- File paths
- Email addresses
- Phone numbers
- Short text snippets that shouldn't contain HTML

**Example:**

```html
<!-- qik-text email-address (Contact email address) -->
mike@mikedeevoiceover.com
<!-- qik-end -->

<!-- qik-text phone-number (Contact phone number) -->
(612) 547-9791
<!-- qik-end -->

<!-- qik-text reel-url (Audio file path for demo reel) -->
/media/commercial-demo.mp3
<!-- qik-end -->
```

#### JavaScript Single-Line Comment Syntax

```javascript
// qik-text field-name (Description of this field)
'plain text value'
// qik-end
```

**Example:**

```javascript
// qik-text audio-file-path (Path to audio file)
'/media/demo-reel.mp3'
// qik-end
```

#### JavaScript Multi-Line Comment Syntax

```javascript
/* qik-text field-name (Description of this field) */
'plain text value'
/* qik-end */
```

**Example:**

```javascript
const audioSources = {
/* qik-text reel1-url (Audio file path for first reel) */
1: '/media/commercial-demo.mp3',
/* qik-end */

/* qik-text reel2-url (Audio file path for second reel) */
2: '/media/radio-demo.mp3'
/* qik-end */
};
```

---

**Note on Lists:** Lists are simply standard WYSIWYG tags that contain `<ul>` or `<ol>` elements. Users can add items by pressing Enter in the editor.

```html
<!-- qik equipment-list (Bulleted list of studio equipment) -->
<ul>
<li>Sound-treated recording room</li>
<li>Rode NT1 Condenser Mic</li>
<li>Behringer MIC500USB Pre-Amp</li>
<li>Professional audio editing software</li>
</ul>
<!-- qik-end -->
```

---

### 3. Image Tags

Image tags allow users to swap individual images on the site via a visual media picker. When a user clicks an image wrapped in `qik-img` tags in the preview, an image selection modal opens showing available images from the `/media` folder, with the option to upload new images and edit alt text.

#### HTML Comment Syntax

```html
<!-- qik-img field-name (Description of this image) -->
<img src="/media/hero.jpg" alt="Hero image">
<!-- qik-end -->
```

**Use cases:**
- Hero/banner images
- Profile photos or team member headshots
- Logo images
- Any standalone image that the site owner should be able to swap without touching code

**Example:**

```html
<!-- qik-img hero-image (Main hero background image) -->
<img src="/media/hero.jpg" alt="Hero image">
<!-- qik-end -->

<!-- qik-img profile-photo (Team member headshot) -->
<img src="/media/profile.jpg" alt="Profile photo">
<!-- qik-end -->

<!-- qik-img logo (Site logo) -->
<img src="/media/logo.png" alt="Company logo">
<!-- qik-end -->
```

#### JavaScript Single-Line Comment Syntax

```javascript
// qik-img field-name (Description)
'<img src="/media/image.jpg" alt="Description">'
// qik-end
```

#### JavaScript Multi-Line Comment Syntax

```javascript
/* qik-img field-name (Description) */
'<img src="/media/image.jpg" alt="Description">'
/* qik-end */
```

#### How Image Tags Work

1. The `qik-img` tag wraps an `<img>` element
2. In the preview, hovering over the image shows a highlight overlay with the field name
3. Clicking the image opens an image selection modal (instead of a text editor)
4. The modal displays the current image, an alt text input, dimension controls (width/height with aspect ratio lock), and a grid of available images from `/media`
5. Users can select an existing image or upload a new one
6. Users can optionally set image dimensions (width and height in pixels). A lock button keeps the aspect ratio proportional — changing one dimension automatically adjusts the other. Leaving dimensions empty renders the image at its natural size
7. On save, the `<img>` tag's `src`, `alt`, and optional `width`/`height` attributes are updated
8. Publishing writes the updated `<img>` tag back to the file

**Dimensions example:**

```html
<!-- Without dimensions (natural size) -->
<img src="/media/hero.jpg" alt="Hero image">

<!-- With dimensions -->
<img src="/media/hero.jpg" alt="Hero image" width="800" height="600">
```

#### What Happens to an Uploaded Image

Every image uploaded through the media picker is processed on the way in, so what a
visitor downloads is never what came off the camera:

- **The longest edge is capped at 2560 px.** Anything larger is scaled down, keeping
  its aspect ratio. Nothing is ever scaled up. Do not write markup that assumes an
  image is available at its original 4000 px width — design for 2560 px as the
  largest an image can be, and for a `width`/`height` well below that in the layout.
- **Orientation is baked in and metadata is stripped.** A phone photo arrives the
  right way up, and no EXIF, GPS or camera data reaches the live site.
- **The format and filename never change.** A `.png` stays a PNG at the same path,
  so existing `src` references keep working.
- **An image that already conforms is stored exactly as uploaded.** If it is within
  the cap and carries no metadata, the server keeps your bytes byte-for-byte — so an
  image you have exported deliberately is never re-compressed, and pushing it again
  from a local folder or a repo never registers as a change.
- **SVGs and animated GIFs pass through untouched**, at whatever size they were
  uploaded.

The cap is per-instance (`MEDIA_MAX_DIMENSION`), so treat 2560 px as the default
ceiling rather than a guarantee.

#### Field Name Rules

Same rules as standard qik tags:
- Allowed characters: letters, numbers, hyphens (`-`), underscores (`_`)
- Best practice: lowercase with hyphens (e.g., `hero-image`, `profile-photo`)
- Display names are automatically generated from field names (e.g., `hero-image` → "Hero Image")

---

## Special Section Tags

### 4. Portfolio Tags

Portfolio sections allow users to manage a collection of portfolio items (projects, case studies, work samples, etc.) with a structured interface.

#### HTML Syntax

```html
<!-- qik-portfolio -->
<section class="portfolio-section" id="portfolio">
<div class="portfolio-container">
<h2>Portfolio</h2>
<div class="portfolio-grid">

<div class="portfolio-item">
<img src="/media/project1.jpg" alt="Project 1" class="portfolio-image">
<div class="portfolio-content">
<h3>Project Title</h3>
<p class="client">Client Name</p>
<p>Project description goes here.</p>
<a href="https://example.com" target="_blank" class="portfolio-link">View Project</a>
</div>
</div>

<div class="portfolio-item">
<img src="/media/project2.jpg" alt="Project 2" class="portfolio-image">
<div class="portfolio-content">
<h3>Another Project</h3>
<p class="client">Another Client</p>
<p>Another project description.</p>
<a href="https://example.com" target="_blank" class="portfolio-link">View Project</a>
</div>
</div>

</div>
</div>
</section>
<!-- qik-portfolio-end -->
```

#### Required Structure

For portfolio items to be editable, each item must:

1. **Be a container element** with a class attribute that meets one of these requirements:
   - **Option A**: Class attribute contains BOTH the word `portfolio` AND the word `item` (anywhere in the class)
   - **Option B**: Class is exactly `portfolio-item`

   **Valid examples:**
   - ✅ `class="portfolio-item"` (contains both words)
   - ✅ `class="work-portfolio-item"` (contains both words)
   - ✅ `class="portfolio-card-item"` (contains both words)
   - ✅ `class="item portfolio"` (both words, different order)
   - ✅ `class="my-portfolio card-item"` (both words in different parts)

   **Invalid examples:**
   - ❌ `class="portfolio"` (missing "item")
   - ❌ `class="portfolio-card"` (missing "item")
   - ❌ `class="work-item"` (missing "portfolio")

2. **Contain specific elements** (all optional, but recommended):
   - **Title**: `<h3>`, `<h2>`, or `<h4>` element (first match is used)
   - **Client**: Element with class exactly `client` OR containing the text `client` anywhere in the class
     - Examples: `<p class="client">`, `<span class="project-client">`, `<div class="client-name">`
   - **Description**: Any `<p>` element that is NOT the client element
   - **Link**: First `<a>` element found (extracts href, text content, and target attribute)
   - **Image**: First `<img>` element found (extracts src attribute)

3. **The qikEdit interface will show fields for:**
   - Title
   - Client
   - Description
   - Image URL
   - Link URL
   - Link Text
   - Link Target (new tab checkbox)
   - Any custom fields defined for this portfolio (see Custom Fields below)

#### Custom Fields

Portfolio sections support any number of custom filterable fields beyond the seven standard ones. Custom fields are stored as `data-*` attributes on each `.portfolio-item` element and are fully compatible with `qikFilter`-based filtering.

There are three ways to add custom fields to a portfolio:

**1. Declare them in the opening tag (recommended for new sites)**

Add a `:fields=` declaration to the `qik-portfolio` comment. Each field is written as `name(type)` and separated by commas:

```html
<!-- qik-portfolio:fields=asin(text),publicationDate(date),fiction(boolean) -->
```

Supported types:

| Type | Input rendered | Stored value |
|------|---------------|--------------|
| `text` | Text input | Any string |
| `date` | Date picker | `YYYY-MM-DD` |
| `boolean` | True / False select | `true` or `false` |

Field names in the declaration may use camelCase (`publicationDate`) — qikEdit will normalise the storage key to lowercase (`publicationdate`) and derive a readable label (`Publication Date`) automatically.

**2. Discovered automatically from existing HTML**

If your `.portfolio-item` elements already carry `data-*` attributes, qikEdit reads them on load and registers the corresponding custom fields automatically — no tag changes required:

```html
<div class="portfolio-item" data-asin="B0XXXXXXXXX" data-fiction="true">
  ...
</div>
```

Attributes belonging to common UI frameworks (`data-bs-*`, `data-v-*`, `data-aos-*`, etc.) are skipped automatically.

**3. Discovered from CSV columns (bulk import)**

Any column in a bulk-import CSV beyond the seven base columns (`title`, `client`, `description`, `imageUrl`, `linkUrl`, `linkText`, `linkNewTab`) is automatically treated as a custom field. The column header becomes the field key and the values are imported into `item.customFields`:

```
title,client,description,imageUrl,linkUrl,linkText,linkNewTab,asin,publicationDate,fiction
My Book,Acme,A great read,/media/book.jpg,https://amazon.com,Buy,yes,B0XXXXXXXXX,2023-01-15,true
```

#### Custom Fields HTML Output

Custom fields are written as `data-*` attributes on the `.portfolio-item` element, making them immediately available to `qikFilter`:

```html
<div class="portfolio-item"
     data-asin="B0XXXXXXXXX"
     data-publicationdate="2023-01-15"
     data-fiction="true">
  ...
</div>
```

#### CSV Round-Trip

The "Download Current Data" CSV export includes one column per custom field definition after the seven base columns. Re-importing that CSV reproduces the same items and field values exactly.

#### JavaScript Syntax

```javascript
// qik-portfolio
// Portfolio items go here
// qik-portfolio-end
```

Or:

```javascript
/* qik-portfolio */
/* Portfolio items go here */
/* qik-portfolio-end */
```

---

### 5. Gallery Tags

Gallery sections allow users to manage photo galleries with a visual interface for adding, removing, and reordering photos.

#### HTML Syntax

```html
<!-- qik-gallery -->
<section class="gallery-section">
<div class="gallery-grid">

<div class="photo-item">
<img src="/media/photo1.jpg" alt="Photo 1">
</div>

<div class="photo-item">
<img src="/media/photo2.jpg" alt="Photo 2">
</div>

<div class="photo-item">
<img src="/media/photo3.jpg" alt="Photo 3">
</div>

</div>
</section>
<!-- qik-gallery-end -->
```

#### Required Structure

For gallery items to be editable, each item must:

1. **Be a container element** with a class attribute that:
   - Is exactly `photo-item`, OR
   - Contains the text `photo-item` anywhere in the class attribute

   **Valid examples:**
   - ✅ `class="photo-item"`
   - ✅ `class="gallery-photo-item"`
   - ✅ `class="photo-item-wrapper"`
   - ✅ `class="main-photo-item-card"`

2. **Contain an `<img>` element** with:
   - `src` attribute (the image URL)
   - `alt` attribute (the image description)

#### JavaScript Syntax

```javascript
// qik-gallery
// Gallery items go here
// qik-gallery-end
```

Or:

```javascript
/* qik-gallery */
/* Gallery items go here */
/* qik-gallery-end */
```

---

### 6. Playlist Tags

Playlist sections allow users to manage audio playlists with a structured interface for adding, removing, and reordering tracks.

#### HTML Syntax

```html
<!-- qik-playlist demo-reels -->
<div class="playlist-container">

<div class="playlist-item" data-audio="/media/commercial-demo.mp3">
<div class="playlist-title">Commercial Demo Reel</div>
</div>

<div class="playlist-item" data-audio="/media/radio-demo.mp3">
<div class="playlist-title">Radio Spot Reel</div>
</div>

<div class="playlist-item" data-audio="/media/halloween-demo.mp3">
<div class="playlist-title">Halloween Reel</div>
</div>

</div>
<!-- qik-playlist-end demo-reels -->
```

**Note:** Playlists require a **name** that must match in both opening and closing tags.

#### Required Structure

For playlist items to be editable, each item must:

1. **Be a container element** with a class attribute that:
   - Is exactly `playlist-item`, OR
   - Contains the text `playlist-item` anywhere in the class attribute

   **Valid examples:**
   - ✅ `class="playlist-item"`
   - ✅ `class="audio-playlist-item"`
   - ✅ `class="playlist-item-wrapper"`
   - ✅ `class="main-playlist-item-card"`

2. **Have a `data-audio` attribute** containing the path to the audio file

3. **Contain a title element** with a class attribute that:
   - Is exactly `playlist-title`, OR
   - Contains the text `playlist-title` anywhere in the class attribute

   **Valid examples:**
   - ✅ `class="playlist-title"`
   - ✅ `class="track-playlist-title"`
   - ✅ `class="playlist-title-text"`

#### JavaScript Syntax

```javascript
// qik-playlist playlist-name
// Playlist items go here
// qik-playlist-end playlist-name
```

Or:

```javascript
/* qik-playlist playlist-name */
/* Playlist items go here */
/* qik-playlist-end playlist-name */
```

---

### 7. Blog Tags (qikBlog)

qikBlog is a blog management feature that enables users to create, manage, and organize blog posts on their qikSites.js-hosted websites. Blog posts are standard HTML files with qik tags, stored in a `/blog/` subdirectory, and automatically listed on a `blog.html` page.

#### Blog Detection

qikBlog features are automatically enabled when a `blog.html` file exists in your website root directory. The Blog Manager will appear in the navigation once qikEdit detects this file.

#### Blog Post Metadata Tag

Each blog post must include a `qik-blog-meta` tag in the `<head>` section containing JSON metadata:

```html
<!-- qik-blog-meta
{
  "title": "My Blog Post Title",
  "date": "2026-01-15",
  "featuredImage": "/media/featured.jpg",
  "hidden": false,
  "tagline": "A brief description for SEO purposes"
}
qik-blog-meta-end -->
```

**Metadata Fields:**
- **title** (required): The blog post title, used in listings and page title
- **date** (required): Publication date in ISO format (YYYY-MM-DD)
- **featuredImage** (optional): Path to featured image, displayed in blog listings
- **hidden** (optional): If `true`, post won't appear in blog.html but remains accessible via direct URL
- **tagline** (optional): SEO description, used in meta description tag

#### Blog Listing Tag

The `blog.html` file must include a `qik-blog-list` section where qikEdit will automatically generate the blog post listings:

```html
<div class="blog-posts-container">
  <!-- qik-blog-list -->
  <!-- AUTO-GENERATED: This section is managed by qikEdit -->
  <!-- qik-blog-list-end -->
</div>
```

When you create, update, or delete blog posts, qikEdit automatically regenerates this section with all visible (non-hidden) posts, sorted by date (newest first).

**Generated HTML Structure:**

```html
<!-- qik-blog-list -->
  <article class="blog-post-preview">
    <a href="blog/my-post.html">
      <img src="/media/image.jpg" alt="Post Title" class="post-featured-image">
      <h2>Post Title</h2>
      <time datetime="2026-01-15">January 15, 2026</time>
    </a>
  </article>
  <article class="blog-post-preview">
    <a href="blog/another-post.html">
      <h2>Another Post</h2>
      <time datetime="2026-01-10">January 10, 2026</time>
    </a>
  </article>
<!-- qik-blog-list-end -->
```

#### Sample blog.html Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- qik-text page-title (Browser tab title) --><title>Blog</title><!-- qik-end -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <!-- qik header-content (Site header area) -->
    <nav>
      <a href="index.html">Home</a>
      <a href="blog.html">Blog</a>
    </nav>
    <!-- qik-end -->
  </header>

  <main>
    <h1><!-- qik blog-heading -->Our Blog<!-- qik-end --></h1>

    <p><!-- qik blog-intro (Blog introduction text) -->
    Welcome to our blog. Here you'll find our latest posts and updates.
    <!-- qik-end --></p>

    <div class="blog-posts-container">
      <!-- qik-blog-list -->
      <!-- AUTO-GENERATED: This section is managed by qikEdit -->
      <!-- qik-blog-list-end -->
    </div>
  </main>

  <footer>
    <!-- qik footer-content (Site footer area) -->
    <p>&copy; 2026 Your Website</p>
    <!-- qik-end -->
  </footer>
</body>
</html>
```

#### Sample Blog Post Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- qik-blog-meta
  {
    "title": "Sample Blog Post",
    "date": "2026-01-15",
    "featuredImage": "/media/sample.jpg",
    "hidden": false,
    "tagline": "This is a sample blog post for demonstration"
  }
  qik-blog-meta-end -->

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Blog Post</title>
  <meta name="description" content="This is a sample blog post for demonstration">
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header>
    <!-- qik header-content (Site header area) -->
    <nav>
      <a href="../index.html">Home</a>
      <a href="../blog.html">Blog</a>
    </nav>
    <!-- qik-end -->
  </header>

  <main class="blog-post">
    <article>
      <h1><!-- qik post-title -->Sample Blog Post<!-- qik-end --></h1>

      <div class="post-content">
        <!-- qik post-body (Main blog post content) -->
        <p>This is the main content of your blog post. Edit this section to add your content.</p>
        <p>You can include images, links, and any HTML formatting.</p>
        <!-- qik-end -->
      </div>
    </article>
  </main>

  <footer>
    <!-- qik footer-content (Site footer area) -->
    <p>&copy; 2026 Your Website</p>
    <!-- qik-end -->
  </footer>
</body>
</html>
```

#### Best Practices for qikBlog

**File Organization:**
- Keep all blog post HTML files in the `/blog/` directory
- Use descriptive, URL-friendly filenames (e.g., `my-first-post.html`, `introducing-new-features.html`)
- Store blog-related images in `/media/` or `/blog/media/` for organization

**Metadata Guidelines:**
- Always include title and date in the `qik-blog-meta` tag
- Use ISO date format (YYYY-MM-DD) for consistent sorting
- Add meaningful taglines for better SEO
- Use the `hidden` field to work on draft posts before publishing

**Content Structure:**
- Use standard qik tags within blog posts for editable content
- Keep a consistent template across all blog posts for uniform styling
- Include navigation back to `blog.html` and your main site

**Creating Your First Post:**
1. Create `blog.html` in your website root with the `qik-blog-list` tags
2. Manually create your first blog post HTML file in `/blog/` directory
3. Include the `qik-blog-meta` tag with all required fields
4. Once you have one post, use qikEdit's "New Post" feature to create additional posts from the template

**Managing Posts:**
- Use the Blog Manager in qikEdit to view all posts
- Click "Settings" to update metadata without editing the full post
- Use "Hidden" to hide posts from the listing while keeping them accessible
- Duplicate existing posts to maintain consistent structure
- qikEdit automatically updates `blog.html` when you create, update, or delete posts

---

## qikForms Integration

### 8. Contact Form Tags (qik-form)

qikForms is an integrated contact form system built into qikSites.js. Forms are created through the portal's Form Builder and embedded directly into your site. No external platform account is required, and all submissions are stored in your local instance's database.

#### How qikForms Works

1. **Create a form** using the Form Builder in the qikSites.js portal
2. **Configure form fields** (name, email, phone, message, etc.) with validation rules
3. **Copy the embed code** from the form builder
4. **Wrap the embed code** with `qik-form` tags in your HTML
5. **Edit forms visually** in qikEdit without touching code

#### Contact Form Tag Structure

Contact form tags wrap the qikForms embed script to make them identifiable and manageable within qikEdit. The embed script is served by the same qikSites.js instance that hosts your site — use an instance-relative path.

**HTML Syntax:**

```html
<!-- qik-form -->
<script
  src="/qikforms/embed.js"
  data-qikadmin-form-id="42"
  async>
</script>
<!-- qik-form-end -->
```

**JavaScript Single-Line Syntax:**

```javascript
// qik-form
const formScript = document.createElement('script');
formScript.src = '/qikforms/embed.js';
formScript.setAttribute('data-qikadmin-form-id', '42');
document.body.appendChild(formScript);
// qik-form-end
```

**JavaScript Multi-Line Syntax:**

```javascript
/* qik-form */
const formScript = document.createElement('script');
formScript.src = '/qikforms/embed.js';
formScript.setAttribute('data-qikadmin-form-id', '42');
document.body.appendChild(formScript);
/* qik-form-end */
```

#### Required Structure

For form tags to be properly detected and editable:

1. **The script tag must include** `data-qikadmin-form-id` attribute with the form ID
2. **The script source** must point to `/qikforms/embed.js` (instance-relative)
3. **Wrap with qik-form tags** for visual identification in qikEdit

#### What qikEdit does with forms

qikEdit treats every form on a page as an editable region and draws an always-visible dashed box around it, labelled with the connected form's name. The box turns red when the form ID doesn't belong to the site, and clicking it opens a picker listing the site's forms so the owner can connect the right one without touching code. Three shapes are recognised:

| In the source | What the editor shows | On save |
|---|---|---|
| `<!-- qik-form -->` + embed script + `<!-- qik-form-end -->` | "Form · *name*" box | Content between the tags is replaced |
| A bare embed script with no qik tags | Same box; the picker notes the tags are missing | The script is wrapped in `qik-form` tags |
| `<!-- qikform -->` on its own | "Form placeholder — click to assign a form" | Upgraded to a full `qik-form` region |

**Don't know the form ID yet?** Leave `<!-- qikform -->` where the form should go, or embed with any ID — if it isn't one of the site's forms, the editor flags it as *not found* and the owner can pick the correct form from the page. Never guess an ID from an example; IDs are instance-wide and a stray one silently renders nothing for visitors.

Several forms on one page are fine; each gets its own box and saves independently.

#### Submission Behaviour

The embed script handles the whole submit lifecycle; the page never needs its own JavaScript for it. Knowing the sequence helps when styling, because the form's final state is not the form at all:

1. **On click** — the submit button is disabled and its label changes to *Sending…* while the request is in flight.
2. **On success** — every field and the button are hidden, and the success message (`.qf-msg--success`) is the only thing left inside the form. The form is not re-shown; a visitor who wants to send another message reloads the page.
   - If the form has a **redirect URL**, the visitor is sent there instead and nothing is collapsed.
3. **On failure** (validation error, spam check, rate limit, network) — the error message (`.qf-msg--error`) appears below the fields and the button is restored to its original label so the visitor can correct and retry.

Because the success message stands alone, style it to read well on its own — not as a footnote under a set of inputs. Give it enough padding and presence to feel like a confirmation, and avoid layouts that depend on the fields still being there (a fixed-height wrapper, for example, will leave a large empty gap).

#### CSS Styling Best Practices

The embed script generates HTML with a predictable set of CSS classes, all prefixed `qf-`. These are safe to override in your site's stylesheet.

| Class | Element | Notes |
|---|---|---|
| `.qikforms-embed` | Outermost container div | Hook for scoping all form styles |
| `.qf-form` | The `<form>` element | Main form target |
| `.qf-group` | Per-field wrapper div | Also wraps the submit button |
| `.qf-req` | Required asterisk `<span>` | Hidden from assistive tech (`aria-hidden`) |
| `.qf-radio-group` | `<fieldset>` for radio options | |
| `.qf-check-group` | `<fieldset>` for checkbox options | |
| `.qf-submit` | Submit `<button>` | |
| `.qf-messages` | Status/feedback container | Has `aria-live="polite"` |
| `.qf-msg` | Individual message `<p>` | |
| `.qf-msg--success` | Modifier on `.qf-msg` | Apply success styles here — after a send this is all that remains of the form |
| `.qf-msg--error` | Modifier on `.qf-msg` | Apply error/failure styles here |
| `.qf-error` | Form-unavailable fallback `<p>` | Shown if the form config cannot be loaded |
| `.qf-hp` | Honeypot field | **Do not style or make visible** — spam protection |

**Minimal styling example:**

```css
/* Scope all overrides under .qikforms-embed to avoid conflicts */
.qikforms-embed {
  max-width: 600px;
  font-family: inherit;
}

.qikforms-embed .qf-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qikforms-embed .qf-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.qikforms-embed .qf-group input,
.qikforms-embed .qf-group textarea,
.qikforms-embed .qf-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.qikforms-embed .qf-submit {
  padding: 0.6rem 1.5rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.qikforms-embed .qf-submit:hover {
  background: #1d4ed8;
}

.qikforms-embed .qf-msg--success {
  color: #15803d;
  background: #f0fdf4;
  padding: 0.75rem;
  border-radius: 4px;
}

.qikforms-embed .qf-msg--error {
  color: #b91c1c;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 4px;
}

/* Never style .qf-hp — it is a spam-protection honeypot */
```

#### Best Practices for qikForms

**Form Creation:**
- Create forms in the portal's Form Builder before embedding
- Configure all fields, validation, and settings before copying the embed code
- Use descriptive form names to easily identify them later

**Embedding Forms:**
- Wrap the generated embed code with `qik-form` / `qik-form-end` tags (a bare embed is still detected, and gets wrapped on first save)
- Use `<!-- qikform -->` as a placeholder when the form hasn't been created yet
- Place forms in logical locations on your site (contact page, footer, etc.)
- Always use the instance-relative `/qikforms/embed.js` path, not an absolute URL

**Form Management:**
- Forms can be edited through qikEdit's visual interface
- Set the success message (or redirect URL) in the Form Builder — after a send it replaces the form entirely, so write it as a complete confirmation
- Changes to form configuration update automatically without code changes
- View submissions in the portal's Forms section

**Security Features:**
- Forms include automatic spam protection via a honeypot field
- Rate limiting prevents abuse
- Submissions are stored only in your local qikSites.js instance — no third-party data sharing

#### Example Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Us</title>
</head>
<body>
  <main>
    <h1>Contact Us</h1>
    <p>Have questions? Send us a message using the form below.</p>

    <!-- qik-form -->
    <script
      src="/qikforms/embed.js"
      data-qikadmin-form-id="42"
      async>
    </script>
    <!-- qik-form-end -->
  </main>
</body>
</html>
```

**Note:** The form must be created in the portal's Form Builder first. The `data-qikadmin-form-id` value comes from the form builder after creating your form.

---

### 9. Navigation Tags (qik-nav)

Navigation tags enable visual management of website navigation menus through qikEdit's interface. Users can add, edit, delete, and reorder navigation links with drag-and-drop functionality, and changes automatically sync across all files containing the same navigation.

#### How Navigation Tags Work

1. **Wrap your navigation** with `qik-nav` tags and give it a unique name
2. **Click the navigation** in qikEdit's preview to open the navigation editor
3. **Manage links** using a visual interface with drag-and-drop reordering
4. **Multi-file sync** automatically updates the navigation across all site files

#### Navigation Tag Structure

Navigation tags wrap the navigation menu container (typically a `<ul>` element) and require a unique name to support multiple navigations per page.

**HTML Syntax:**

```html
<!-- qik-nav main-nav -->
<ul>
  <li><a href="index.html">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="portfolio.html">Portfolio</a></li>
  <li><a href="contact.html">Contact</a></li>
</ul>
<!-- qik-nav-end main-nav -->
```

**JavaScript Single-Line Syntax:**

```javascript
// qik-nav main-nav
const navItems = [
  { text: 'Home', url: 'index.html' },
  { text: 'About', url: 'about.html' }
];
// qik-nav-end main-nav
```

**JavaScript Multi-Line Syntax:**

```javascript
/* qik-nav main-nav */
const navItems = [
  { text: 'Home', url: 'index.html' },
  { text: 'About', url: 'about.html' }
];
/* qik-nav-end main-nav */
```

#### Named Navigation Menus

Navigation tags require a unique name to:
- Support multiple navigations per page (header nav, footer nav, mobile nav)
- Enable multi-file synchronization across the site
- Identify which navigation to edit when clicked

**Example with multiple navigations:**

```html
<!-- Header Navigation -->
<!-- qik-nav header-nav -->
<ul class="main-menu">
  <li><a href="index.html">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="contact.html">Contact</a></li>
</ul>
<!-- qik-nav-end header-nav -->

<!-- Footer Navigation -->
<!-- qik-nav footer-nav -->
<ul class="footer-menu">
  <li><a href="privacy.html">Privacy</a></li>
  <li><a href="terms.html">Terms</a></li>
</ul>
<!-- qik-nav-end footer-nav -->
```

#### Supported Navigation Structures

qikEdit's navigation manager intelligently detects and supports three common navigation patterns:

**1. Standard Navigation (ul > li > a)**

```html
<!-- qik-nav main-nav -->
<ul>
  <li><a href="index.html">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="services.html">Services</a></li>
</ul>
<!-- qik-nav-end main-nav -->
```

**2. Bootstrap Navigation (.nav-item and .nav-link classes)**

```html
<!-- qik-nav main-nav -->
<ul class="nav">
  <li class="nav-item">
    <a class="nav-link" href="index.html">Home</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="about.html">About</a>
  </li>
</ul>
<!-- qik-nav-end main-nav -->
```

**3. Custom Structures**

The navigation manager automatically adapts to your HTML structure, preserving CSS classes and element types when rebuilding navigation after edits.

#### Navigation Editor Features

When you click a navigation in qikEdit's preview, the navigation editor provides:

**Add Links:**
- Click "+ Add Navigation Link" button
- Enter link text and URL
- Optional "Open in new tab" checkbox
- Supports both relative URLs (`about.html`) and absolute URLs (`https://example.com`)

**Edit Links:**
- Click the pencil icon on any navigation item
- Update link text or URL
- Toggle new tab setting

**Delete Links:**
- Click the trash icon on any item
- Confirmation prompt prevents accidental deletion

**Reorder Links:**
- **Drag-and-drop**: Grab the six-dot handle and drag items to reorder
- **Up/Down buttons**: Click arrow buttons to move items one position at a time
- Changes save automatically and update across all files

**Preserved Data:**
- Original CSS classes on list items (`<li>`) are preserved
- Original CSS classes on links (`<a>`) are preserved
- HTML structure and formatting are maintained

#### Multi-File Synchronization

When you save navigation changes, qikEdit automatically:

1. **Recursively scans your entire site** for all HTML and PHP files
   - Searches through all directories in your web root
   - Finds every `.html`, `.htm`, and `.php` file
   - No file naming restrictions — works with any filename

2. **Detects matching navigation tags** by comparing navigation names
   - Checks each file for the specific `qik-nav` tag you edited
   - Only updates files that contain the matching navigation

3. **Updates all instances** simultaneously
   - Preserves CSS classes and HTML structure
   - Strips dynamic "active" classes to prevent conflicts
   - Maintains comment style consistency

4. **Shows progress and confirmation**
   - Progress modal displays files being checked and updated
   - Final message: "Navigation updated in X files"

#### Integration with Page Duplication

When duplicating a page in qikEdit, you can automatically add it to navigation:

1. **Checkbox appears** if qikEdit detects navigation tags in your site
2. **Select the navigation** menu from dropdown (shows all detected navigations)
3. **Choose position**:
   - End of menu (default)
   - Start of menu
   - After Home
4. **Automatic addition** — the new page link is added to all files containing that navigation

#### Active Page Highlighting

qikEdit automatically highlights the current page in navigation during preview:

**How It Works:**
- Detects which file you're currently editing
- Compares navigation link URLs to the current filename
- Adds `qik-active-page` class to matching links and their parent `<li>` elements
- Removes any existing "active" classes to prevent conflicts

**Styling:**
The active page indicator uses:
- Bold text weight
- qikEdit brand color (#8b6f47)
- Subtle underline effect

**Supported URL Formats:**
- Relative URLs: `about.html`, `pages/contact.html`
- Filename-only: `portfolio.html`
- Query strings and anchors are ignored for matching

**Important Notes:**
- Highlighting is **preview-only** and not saved to HTML files
- This prevents hardcoded "active" classes that break on other pages
- Your existing CSS for "active" states will work normally on the live site
- qikEdit strips dynamic active classes when rebuilding navigation to maintain clean HTML

**Customizing Active Styles:**
To style the active page indicator, add CSS to your site:

```css
.qik-active-page {
  font-weight: bold;
  color: #your-brand-color;
  border-bottom: 2px solid #your-brand-color;
}
```

#### Required Structure

For navigation tags to work properly:

1. **Navigation container** must be a `<ul>`, `<nav>`, or `<div>` element
2. **Navigation items** should be `<li>` elements (or match your existing structure)
3. **Links** must be `<a>` elements with `href` attributes
4. **Named tags** — both opening and closing tags must include the same navigation name

#### Best Practices for Navigation Tags

**Naming Convention:**
- Use descriptive names: `main-nav`, `header-nav`, `footer-nav`, `mobile-nav`
- Names should be lowercase with hyphens for consistency
- Names must match in opening and closing tags

**Structure Guidelines:**
- Wrap only the menu container (e.g., `<ul>`), not outer sections or headers
- Keep navigation HTML as simple as possible
- Use CSS classes for styling, not inline styles (preserved during edits)
- Avoid hardcoded "active" classes — qikEdit automatically highlights the current page

**CSS Class Management:**
- All CSS classes on `<li>` and `<a>` elements are preserved during edits
- Dynamic "active" classes (active, current, selected) are automatically stripped to prevent conflicts
- qikEdit adds `qik-active-page` class in preview to highlight the current page
- Original styling and custom classes remain untouched

**Multi-Navigation Sites:**
- Give each navigation a unique name
- Header and footer navigations can share the same name if they should stay synchronized
- Mobile and desktop menus should use different names if they have different items

**File Organization:**
- If using PHP includes for navigation, wrap the include file content with `qik-nav` tags
- For shared navigation across pages, place it in a reusable component file
- Works with any directory structure or file naming convention

#### Example Implementations

**Complete Header with Navigation:**

```html
<header>
  <div class="header-container">
    <div class="logo">
      <a href="index.html">
        <img src="/media/logo.png" alt="<!-- qik-text site-name -->My Website<!-- qik-end -->">
      </a>
    </div>

    <nav class="main-navigation">
      <!-- qik-nav main-nav -->
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="portfolio.html">Portfolio</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
      <!-- qik-nav-end main-nav -->
    </nav>
  </div>
</header>
```

**Bootstrap Navigation Example:**

```html
<nav class="navbar navbar-expand-lg">
  <div class="container">
    <!-- qik-nav header-nav -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link active" href="index.html">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="services.html">Services</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="contact.html">Contact</a>
      </li>
    </ul>
    <!-- qik-nav-end header-nav -->
  </div>
</nav>
```

**Footer Navigation Example:**

```html
<footer>
  <div class="footer-content">
    <div class="footer-navigation">
      <!-- qik-nav footer-nav -->
      <ul class="footer-links">
        <li><a href="privacy.html">Privacy Policy</a></li>
        <li><a href="terms.html">Terms of Service</a></li>
        <li><a href="sitemap.html">Sitemap</a></li>
      </ul>
      <!-- qik-nav-end footer-nav -->
    </div>

    <!-- qik footer-copyright -->
    <p>&copy; 2026 Your Company. All rights reserved.</p>
    <!-- qik-end -->
  </div>
</footer>
```

**PHP Include File Navigation:**

```php
<!-- File: includes/navigation.php -->
<!-- qik-nav main-nav -->
<ul class="menu">
  <li><a href="/index.html">Home</a></li>
  <li><a href="/about.html">About</a></li>
  <li><a href="/services.html">Services</a></li>
  <li><a href="/contact.html">Contact</a></li>
</ul>
<!-- qik-nav-end main-nav -->
```

#### Navigation Features Summary

**Supported:**
- ✅ Add, edit, delete navigation links
- ✅ Drag-and-drop reordering
- ✅ Move up/down buttons
- ✅ External links with "open in new tab" option
- ✅ Relative and absolute URLs
- ✅ Multiple navigations per page
- ✅ Multi-file synchronization across entire site
- ✅ Recursive site scanning (works with any filename)
- ✅ CSS class preservation
- ✅ Standard, Bootstrap, and custom HTML structures
- ✅ Automatic integration with page duplication
- ✅ Active page highlighting in preview (auto-detects current file)
- ✅ Progress indicators during multi-file updates

**Not Currently Supported (Future Enhancement):**
- ❌ Nested/dropdown menus (planned for future release)

#### Troubleshooting Navigation Tags

**Navigation not appearing in preview:**
- Verify both opening and closing tags have matching names
- Check that tags wrap a valid container element (`<ul>`, `<nav>`, or `<div>`)
- Ensure links are inside `<a>` elements with `href` attributes
- Refresh the preview if navigation was recently added

**Changes not saving across all files:**
- Check browser console for debug messages: `[Navigation] Multi-file sync complete: X files updated`
- Verify files contain the exact same navigation name in their `qik-nav` tags
- Check that files are valid HTML/PHP (scanner only processes `.html`, `.htm`, `.php`)

**Active page not highlighting correctly:**
- qikEdit matches navigation links to the current filename
- Link `href` must match the filename (e.g., `about.html` matches `about.html`)
- Works with relative paths — absolute paths or anchors won't match
- Highlighting is visual-only in preview, not saved to HTML

**Original styling lost after editing:**
- This shouldn't happen — CSS classes are preserved during edits
- If it occurs, check that classes are on the `<li>` and `<a>` elements, not wrapper divs
- Note: Dynamic "active" classes are automatically stripped to prevent conflicts
- Report as a bug if non-active styling is consistently lost

---

## Using qik Tags in JavaScript Files

All qik tag types (Standard, Text-Only, Image, Portfolio, Gallery, Playlist, and Contact Forms) can be used within JavaScript files or `<script>` tags using JavaScript comment syntax.

#### Single-Line Comment Syntax

```javascript
// qik field-name (Description)
const value = 'editable content';
// qik-end

// qik-text field-name (Description)
'plain text value'
// qik-end

// qik-img field-name (Description)
'<img src="/media/image.jpg" alt="Description">'
// qik-end

// qik-portfolio
// Portfolio items
// qik-portfolio-end

// qik-gallery
// Gallery items
// qik-gallery-end

// qik-playlist playlist-name
// Playlist items
// qik-playlist-end playlist-name

// qik-form
const formScript = document.createElement('script');
formScript.src = '/qikforms/embed.js';
formScript.setAttribute('data-qikadmin-form-id', '42');
// qik-form-end
```

#### Multi-Line Comment Syntax

```javascript
/* qik field-name (Description) */
const value = 'editable content';
/* qik-end */

/* qik-text field-name (Description) */
'plain text value'
/* qik-end */

/* qik-img field-name (Description) */
'<img src="/media/image.jpg" alt="Description">'
/* qik-end */

/* qik-portfolio */
/* Portfolio items */
/* qik-portfolio-end */

/* qik-gallery */
/* Gallery items */
/* qik-gallery-end */

/* qik-playlist playlist-name */
/* Playlist items */
/* qik-playlist-end playlist-name */

/* qik-form */
const formScript = document.createElement('script');
formScript.src = '/qikforms/embed.js';
formScript.setAttribute('data-qikadmin-form-id', '42');
/* qik-form-end */
```

**Use cases:**
- Configuration values in JavaScript files
- API keys and endpoints
- File paths and URLs in JavaScript arrays/objects
- Dynamic content loaded via JavaScript

**Example:**

```javascript
const config = {
  /* qik-text api-endpoint (API endpoint URL) */
  apiUrl: 'https://api.example.com/v1',
  /* qik-end */

  /* qik-text analytics-id (Google Analytics tracking ID) */
  gaTrackingId: 'G-JSCH67PDNK'
  /* qik-end */
};
```

---

## Best Practices

### 1. Use Descriptive Names and Descriptions

**Good:**

```html
<!-- qik hero-tagline (Large header text for the hero section, single line.) -->
<p class="tagline">Professional Voice Over Talent</p>
<!-- qik-end -->
```

**Bad:**

```html
<!-- qik text1 -->
<p class="tagline">Professional Voice Over Talent</p>
<!-- qik-end -->
```

### 2. Choose the Right Tag Type

- Use **qik** (WYSIWYG) for: Content with formatting, paragraphs, lists
- Use **qik-text** for: URLs, file paths, email addresses, phone numbers, plain text
- Use **qik-img** for: Standalone swappable images (hero images, profile photos, logos)
- Use **qik-portfolio** for: Collections of work samples or projects
- Use **qik-gallery** for: Photo galleries
- Use **qik-playlist** for: Audio playlists
- Use **qik-blog-meta** for: Blog post metadata and automated blog listings
- Use **qik-form** for: Embedded contact forms from the portal Form Builder
- Use **qik-nav** for: Site navigation menus with drag-and-drop management

### 3. Minimize HTML Elements Within Tags

**Important principle:** Include as few HTML elements as possible within qik tags—only include elements that need to be editable.

**Good (minimal elements):**

```html
<!-- qik hero-heading (Main hero heading) -->
<h1>Mike Dee</h1>
<!-- qik-end -->
```

**Bad (unnecessary wrapper):**

```html
<!-- qik hero-heading (Main hero heading) -->
<div class="heading-wrapper">
  <h1>Mike Dee</h1>
</div>
<!-- qik-end -->
```

**Good (text-only for URL):**

```html
<a href="<!-- qik-text email-address (Email address) -->mike@example.com<!-- qik-end -->">
  Email Me
</a>
```

**Bad (entire anchor tag wrapped):**

```html
<!-- qik email-link (Email link) -->
<a href="mailto:mike@example.com">Email Me</a>
<!-- qik-end -->
```

**Why this matters:**
- Cleaner code and easier maintenance
- Users only edit the content that should change
- Prevents accidental modification of structural HTML
- Keeps styling and structure separate from content

### 4. Keep Field Content Focused

Each field should represent one logical piece of content.

**Good (separate, focused fields):**

```html
<a href="mailto:<!-- qik-text contact-email (Contact email address) -->mike@example.com<!-- qik-end -->">
  Email Me
</a>

<a href="tel:<!-- qik-text contact-phone (Contact phone number, no formatting) -->6125479791<!-- qik-end -->">
  <!-- qik-text contact-phone-display (Phone number with formatting) -->(612) 547-9791<!-- qik-end -->
</a>

<!-- qik-text street-address (Street address) -->
123 Main St, City, State 12345
<!-- qik-end -->
```

**Bad (too much bundled together):**

```html
<!-- qik contact-info (All contact information) -->
<div>
<a href="mailto:mike@example.com">mike@example.com</a>
<a href="tel:6125479791">(612) 547-9791</a>
<p>123 Main St, City, State 12345</p>
</div>
<!-- qik-end -->
```

### 5. Use Consistent Naming Conventions

Pick a naming pattern and stick to it:
- `section-field` (e.g., `hero-tagline`, `about-text`, `footer-copyright`)
- `type-field` (e.g., `email-address`, `phone-number`, `image-url`)

### 6. Structure Special Sections Properly

For portfolio, gallery, and playlist sections to work correctly:
- Use the required class names
- Include all expected child elements
- Keep the HTML structure clean and consistent

### 7. Test in qikEdit

After adding qik tags:
1. Open qikEdit from the qikSites.js portal for your site
2. Verify all fields appear in the editor
3. Test editing and publishing changes
4. Check that the "All Fields" view shows hidden fields correctly

### 8. Consider Mobile Responsiveness

Remember that users can toggle between desktop and mobile views in qikEdit. Ensure your editable content looks good in both views.

---

## Example Implementations

### Complete Hero Section

```html
<section class="hero" id="home">
<div class="hero-content">
<!-- qik hero-heading (Main hero heading) -->
<h1>Mike Dee</h1>
<!-- qik-end -->

<!-- qik hero-tagline (Large header text, single line.) -->
<p class="tagline">Professional Voice Over Talent</p>
<!-- qik-end -->

<!-- qik hero-subtitle (Smaller text under the main header, single line.) -->
<p>Bringing scripts to life with versatility and passion</p>
<!-- qik-end -->
</div>
</section>
```

### Complete Contact Section

```html
<section class="contact-section" id="contact">
<div class="contact-container">
<!-- qik contact-heading (Contact section heading) -->
<h2>Let's Work Together</h2>
<!-- qik-end -->

<!-- qik contact-subtitle (Contact section subtitle) -->
<p class="contact-subtitle">Ready to bring your project to life? Get in touch today!</p>
<!-- qik-end -->

<div class="contact-info">
<div class="contact-item">
<span class="contact-icon">📧</span>
<div class="contact-details">
<h3>Email Me</h3>
<a href="mailto:<!-- qik-text contact-email (Contact email address) -->mike@mikedeevoiceover.com<!-- qik-end -->">
<!-- qik-text contact-email-display (Email address display text) -->mike@mikedeevoiceover.com<!-- qik-end -->
</a>
</div>
</div>

<div class="contact-item">
<span class="contact-icon">📱</span>
<div class="contact-details">
<h3>Call Me</h3>
<a href="tel:<!-- qik-text contact-phone-tel (Phone number for tel: link, no spaces or special characters) -->6125479791<!-- qik-end -->">
<!-- qik-text contact-phone-display (Phone number display text) -->(612) 547-9791<!-- qik-end -->
</a>
</div>
</div>
</div>
</div>
</section>
```

### Complete Portfolio Section

```html
<!-- qik-portfolio -->
<section class="portfolio-section" id="portfolio">
<div class="portfolio-container">
<h2>Portfolio</h2>
<div class="portfolio-grid">

<div class="portfolio-item">
<img src="/media/darkpony.jpg" alt="Dark Pony Radio" class="portfolio-image">
<div class="portfolio-content">
<h3>Character Work</h3>
<p class="client">Dark Pony Radio</p>
<p>Bringing diverse characters to life with authentic voices and compelling performances in audio drama productions.</p>
<a href="https://open.spotify.com/show/50SaySABtmIA317gnsSxnG" target="_blank" class="portfolio-link">Listen on Spotify</a>
</div>
</div>

<div class="portfolio-item">
<img src="/media/filmschoolslacker.jpg" alt="Film School Slacker" class="portfolio-image">
<div class="portfolio-content">
<h3>Podcast Voiceover</h3>
<p class="client">Film School Slacker</p>
<p>Professional narration for engaging podcast content with natural delivery and pacing.</p>
<a href="https://filmschoolslacker.com/" target="_blank" class="portfolio-link">Visit Website</a>
</div>
</div>

</div>
</div>
</section>
<!-- qik-portfolio-end -->
```

### Complete Footer with Social Links

```html
<footer>
<div class="social-links">
<a href="<!-- qik-text imdb-link (URL for IMDB profile) -->https://www.imdb.com/name/nm16461651<!-- qik-end -->" target="_blank" rel="noopener noreferrer" aria-label="IMDB Profile">
<i class="fab fa-imdb"></i>
</a>

<a href="<!-- qik-text instagram-link (URL for Instagram profile) -->https://www.instagram.com/mikedeevo<!-- qik-end -->" target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile">
<i class="fab fa-instagram"></i>
</a>
</div>

<!-- qik footer-text (Footer copyright text) -->
<p>© 2025 Mike Dee Voiceover. All rights reserved.</p>
<!-- qik-end -->
</footer>
```

### JavaScript Configuration with qik Tags

```html
<script>
const audioSources = {
// qik-text reel1-url (Audio file path for commercial reel)
1: '/media/commercial-demo.mp3',
// qik-end

// qik-text reel2-url (Audio file path for radio reel)
2: '/media/radio-demo.mp3',
// qik-end

// qik-text reel3-url (Audio file path for halloween reel)
3: '/media/halloween-demo.mp3'
// qik-end
};
</script>
```

### Contact Form with qikForms

```html
<section class="contact-section" id="contact">
<div class="contact-container">
<h2>Get In Touch</h2>
<p>Fill out the form below and we'll get back to you as soon as possible.</p>

<!-- qik-form -->
<script
  src="/qikforms/embed.js"
  data-qikadmin-form-id="42"
  async>
</script>
<!-- qik-form-end -->

</div>
</section>
```

**Note:** The form must be created in the portal's Form Builder first. The `data-qikadmin-form-id` value comes from the form builder after creating your form.

---

## Using this guide with an IDE or AI agent

`QIKEDIT_DESIGN_GUIDE.md` is a first-class part of the qikSites.js developer workflow. It is baked into the application itself, always reflects the version you have installed, and is designed to work alongside the tools you already use.

**How it gets into your project:**

When you link a local folder on the site's **Sync** tab in the qikSites.js portal (the *Folder on your computer* card), `QIKEDIT_DESIGN_GUIDE.md` appears as a server-side file in the scan. Pull it to your project folder with one click — no separate download or setup step.

If your site syncs with a Git repository instead, qikSites keeps a copy at the root of the repo for you; see [Setting the site up as a Git repository](#setting-the-site-up-as-a-git-repository) for how the two fit together.

**Why it belongs at the root of your project:**

Once pulled, the guide sits at the root of your local project folder. Claude Code, Cursor, GitHub Copilot, and other IDE assistants automatically pick up files in the project root as context. Any AI tool that reads your project will instantly understand:

- The full qik tag vocabulary (`qik`, `qik-text`, `qik-img`, `qik-portfolio`, `qik-gallery`, `qik-playlist`, `qik-blog-meta`, `qik-form`, `qik-nav`)
- How to structure editable regions
- Required class names and HTML structure for each tag type
- How to embed forms, write portfolio items, and add navigation — ready to generate correct code on the first try

**Staying current:**

When qikSites.js ships an update that changes the design guide, the file's hash changes. Folder sync will show `QIKEDIT_DESIGN_GUIDE.md` as "modified" the next time you scan, and you can pull the new version with one click. A repo synced with GitHub gets the new version in the next commit qikSites makes. Your local IDE context stays in sync with the installed version automatically.

---

## Setting the site up as a Git repository

qikSites can treat a **repo branch as the source of truth** for a site. Once connected (on the site's **Sync** tab in the portal), a push to that branch updates the live site, and publishing from qikEdit commits back to it. That makes the repo the natural home for a qik-tagged site: PRs, review, CI, and your IDE on one side, the visual editor on the other.

This section covers what to do differently when a site is built to live in a repo.

### Every synced file is publicly served

The live site serves whatever the branch contains, at the same path. `config/notes.txt` in the branch becomes `https://yoursite.com/config/notes.txt`.

**Never commit secrets, credentials, or private notes to a synced branch or subdirectory.** qikSites excludes the obvious ones automatically (`.env`, `.env.*`, `*.pem`, `*.key`, SSH keys, `.npmrc`, `.netrc`, `.htpasswd`), but that is a safety net, not a policy. Treat the synced part of the repo as public the moment you push.

### Repo layout

The sync root maps to the site root, so the branch should be laid out the way the site is served:

```
index.html            →  /
about.html            →  /about
css/site.css          →  /css/site.css
media/hero.jpg        →  /media/hero.jpg
```

If the repo holds more than the site — build sources, docs, several sites — point sync at a subdirectory instead (`sites/acme`), and that folder becomes the site root. One monorepo can host several sites this way, each on its own branch.

### qikSites does not run a build

The branch is served as-is. There is no `npm run build` step on the server, so a site that compiles from Sass, TypeScript, or a static-site generator must have its **built output** in the sync path — either committed, or written there by CI on push. Point sync at the output directory (`dist`, `_site`, `public`) and let the sources live outside it.

Write your qik tags in the templates you author, and make sure your build **preserves HTML comments** — most minifiers strip them by default, and a stripped `<!-- qik: ... -->` is an editable region that has silently disappeared. Configure the minifier to keep comments, or don't minify HTML.

### Use `.qikignore` for everything the site shouldn't serve

Commit a `.qikignore` at the sync root. It uses the same format as folder sync — one path or folder per line, `#` for comments — and repo sync adds `*` globbing and `!` to re-include something:

```
# Sources — the built output is what gets served
src/
scss/
*.config.js

# Working files
drafts/
notes.md

# This site does want its licence published
!LICENSE
```

Ignored paths are skipped in **both** directions: qikSites won't pull them into the site, and won't commit over them when you publish. That makes `.qikignore` the right tool for anything the repo needs but the site doesn't.

Repo-management files are excluded already (`.git`, `.github`, `node_modules`, `README`, licences, changelogs, editor folders), so you only need to list what's specific to your project.

One thing to know if you re-include a file with `!`: qikSites picks a file's content type from its extension, so an extensionless file (`LICENSE`, `CNAME`, `Procfile`) syncs with its bytes intact but is served as a download rather than displayed. Give anything you want rendered in the browser a real extension.

### Don't let tooling rewrite the synced files

qikEdit writes back **only the regions that changed**, leaving the rest of the file byte-for-byte identical. Anything that reformats whole files fights that:

- **Don't run Prettier, a linter with `--fix`, or an HTML formatter over the synced path in CI.** Reformatting every file makes every file look modified on both sides, which turns an ordinary edit into a conflict.
- **Don't have CI commit back to the synced branch.** A workflow that pushes generated files onto the branch will race with qikSites' own commits.
- If you do want a formatter, run it on your *sources*, outside the sync path, before the build writes output.

Keep the same discipline by hand: when you edit a qik-tagged page in your IDE, change what you mean to change rather than re-indenting the file.

### Branch protection

qikSites commits directly to the configured branch. If that branch requires pull requests, status checks, or signed commits, publishing from the editor will fail. Point sync at a branch qikSites is allowed to push to — many teams sync `main` for a straightforward site, or a dedicated `live` branch that `main` merges into when the site is also built from sources.

### Git LFS is not supported

Files stored in Git LFS come back through the API as small pointer text files, not the real content. A site synced from an LFS-backed branch will serve those pointers in place of its images. Keep media as ordinary git objects in the synced path, or upload it through qikEdit instead — media added in the editor is committed back as a normal blob.

Files over 25 MB are skipped in both directions regardless.

### Working in both places at once

Both sides can change independently, and qikSites compares each against the last synced state:

- Edits to **different** files merge without fuss — pull a colleague's repo change while your unpublished editor edits sit untouched.
- Edits to the **same** file from both sides stop sync and raise a conflict. Nothing is overwritten; you choose the repo version or the site version on the site's **Sync** tab.

To avoid conflicts in practice: before a substantial round of work in your IDE, publish or discard anything pending in the editor. Before a substantial round of work in qikEdit, let the latest push land. Content edits belong in qikEdit, structural and template changes belong in the repo — split that way, the two sides rarely touch the same file at the same time.

### Keeping this guide next to your code

`QIKEDIT_DESIGN_GUIDE.md` is a system file — qikSites injects it into every site's file list and never pulls it in as site content. Repo sync keeps a copy at the sync root for you: it's committed alongside your site, so Claude Code, Cursor, Copilot and similar tools pick it up as context and your AI assistant gets the full qik tag vocabulary for free. Editing or deleting that copy in the repo isn't a conflict; qikSites simply writes its own version again on the next commit, and refreshes it when an upgrade changes the guide.

### Checklist for a repo-backed site

- [ ] Built output — not sources — is in the sync path
- [ ] HTML minification preserves comments, so qik tags survive the build
- [ ] `.qikignore` committed at the sync root, covering sources and working files
- [ ] No secrets anywhere in the synced path
- [ ] No formatter or auto-commit CI touching the synced path
- [ ] The synced branch accepts direct pushes
- [ ] Media is ordinary git objects, not LFS
- [ ] `QIKEDIT_DESIGN_GUIDE.md` at the repo root for IDE context (qikSites commits it for you)

---

## Summary

By following this specification, you can create websites that are fully editable through qikEdit's visual interface. The key points are:

1. **Use the right tag type** for your content:
   - **Standard (qik)** — WYSIWYG editing for formatted content
   - **Text-Only (qik-text)** — Plain text, URLs, and values without formatting
   - **Image (qik-img)** — Standalone swappable images
   - **Portfolio (qik-portfolio)** — Work samples and project collections
   - **Gallery (qik-gallery)** — Photo galleries
   - **Playlist (qik-playlist)** — Audio playlists
   - **Blog (qik-blog-meta)** — Blog post metadata and automated listings
   - **Contact Forms (qik-form)** — Embedded forms from the portal Form Builder
   - **Navigation (qik-nav)** — Site navigation menu management with multi-file sync
   - All tag types work in HTML, PHP, and JavaScript files using appropriate comment syntax

2. **Minimize HTML within tags** — Only include elements that need to be editable

3. **Mark editable content** with qik tags using HTML or JavaScript comment syntax

4. **Follow naming conventions** and provide helpful descriptions

5. **Structure special sections properly** with required class names and elements

6. **Test your implementation** in qikEdit from the portal to ensure everything works as expected

7. **Decide where the site lives** — the qikSites database alone, a synced local folder, or a Git repository branch. If you choose a repo, follow [Setting the site up as a Git repository](#setting-the-site-up-as-a-git-repository): keep built output in the sync path, keep secrets out of it, and keep formatters off it.

This approach gives you the best of both worlds: the speed and security of static websites with the convenience of a visual CMS — and the full power of your IDE, your AI tools, and your existing Git workflow when building.
