# Using the Ultra Block Builder

This tool lets you build a course/project sheet using simple text, see a live
preview, and copy out the HTML to paste into Blackboard Ultra — no HTML
knowledge required.

## The basic idea

Your document is made of **blocks**. Each block starts with `:::` and a
block name, and ends with `:::`. Inside, you fill in plain `label: value`
lines. For example:

```
:::hero
title: GRD311 — Web & Multimedia 1
subtitle: User experience, interface design, and front-end development
theme: navy
:::
```

That's it — no tags, no closing brackets to match.

## Getting started

1. Open the builder (your GitHub Pages link).
2. Click **+ Insert block**, pick a block type, and it drops a starter
   snippet into the editor with sample text already filled in.
3. Edit the sample text to your own content.
4. Watch the **Preview** tab update as you type.
5. When it looks right, switch to the **HTML for Ultra** tab.

## Getting it into Blackboard Ultra

In Ultra, each block you build corresponds to one "section" of HTML content.

1. In the **HTML for Ultra** tab, find the block you want.
2. Click **Copy HTML** on that block.
3. In Ultra, create a new content section and switch its editor to HTML
   source mode (the `</>` icon), then paste.
4. Repeat for each block, in order.

If you'd rather keep everything as a single Ultra section instead of one
per block, use **Copy all HTML (one section)** at the top of that tab.

You can also **Download .html** (a file you can keep for reference or hand
to someone else) or **Download .md** (your editable source, so you can pick
up editing later or share the raw text with a colleague).

## Formatting text inside a block

Inside any text field you can use:

- `**bold**` → **bold**
- `*italic*` → *italic*
- `` `code` `` → `code`
- `[link text](https://example.com)` → a clickable link

## Writing lists

Some fields (like `badges` or `items`) hold a list instead of one line.
Each item goes on its own line starting with a dash and two spaces of
indent underneath the label:

```
badges:
  - 📅 15 weeks
  - 📋 3 projects
```

Some lists hold small groups of fields instead of plain text (for example,
the columns in a Text Section block, or the cards in a Card Grid block).
Keep the indentation exactly as shown in the inserted snippet — that's
what tells the tool where one item ends and the next begins:

```
columns:
  - heading: First half of class
    text: Core technical competencies — HTML, CSS, responsive layout.
  - heading: Second half of class
    text: UX research, wireframing, prototyping, and visual design.
```

A few pointers on indentation for lists and columns (body paragraphs are
now forgiving about this, but lists/columns still need it):

- Use spaces, not tabs.
- Everything at the same "level" needs the same amount of indent.
- If something looks wrong in the preview, it's almost always a missing
  or uneven space — compare against the original snippet from the
  **+ Insert block** menu.

## Multi-line paragraphs

For a longer paragraph (like a course description), use `body: |` and
then indent the paragraph underneath it:

```
body: |
  This course introduces the foundational principles and practices of
  UX and UI design as they apply to multimedia and interactive
  environments.
```

To start a new paragraph, just leave a blank line:

```
body: |
  First paragraph.

  Second paragraph — this can even include a colon: like this, or
  uneven spacing, and it will still work fine.
```

## Customizing colors

The white-card blocks (Text section, Card grid, Stat grid, List card,
Weekly schedule) all accept optional color fields. Leave them out and you
get the normal look; add any of them to override just that piece. For
example, on a Text section:

```
:::section
label: Custom colors example
background: #10182b
borderColor: #10182b
labelColor: #7a9fd4
textColor: #e8eef7
boxColor: #1f2c4d
headingColor: #a8c4e0
body: |
  This section now has a dark background instead of white.
:::
```

You can write hex colors the normal way (`#10182b`) — no quotes needed.
Each block type accepts a slightly different set of color fields since
they have different parts to color; the **+ Insert block** menu's
description line for each block lists exactly which ones it supports.

## Bullet and numbered lists

Inside any multi-line `body:` field (Text section, Callout box), you can
write a bullet or numbered list right alongside your paragraphs — no
separate block needed. A run of lines all starting with `- ` becomes a
bullet list; a run all starting with `1. ` becomes a numbered list. Leave
a blank line before and after the list, same as a paragraph break:

```
body: |
  Please complete the following before class:

  - Read Chapter 3
  - Watch the intro video
  - Post one discussion question

  Then follow these steps in order:

  1. Open Figma
  2. Duplicate the starter file
  3. Rename it with your last name
```

This is separate from the dedicated **List card** block (which is its
own white card with just a heading and a list) — use that one when the
list *is* the whole block, and inline `- `/`1. ` lists when a list needs
to sit inside a paragraph of other content.

Column text (in a Text section) and item text (in a Card grid) support
the same paragraphs-and-lists formatting — just switch that field from a
single line to a `text: |` block the same way you would for `body:`:

```
columns:
  - heading: First half of class
    text: |
      Core technical topics:

      - HTML & CSS
      - Responsive layout
      - Accessibility basics
```

## Adding images

Click **🖼️ Insert image** in the toolbar and choose a photo from your
computer. It gets shrunk down automatically if it's very large, embedded
directly into the block's `src:` field, and dropped into the editor as a
ready-made `:::image` block — there's nothing to upload anywhere else,
and nothing to link to. The image travels with the HTML you copy into
Ultra.

If you'd rather link to an image that's already hosted somewhere (on the
web, or already in Blackboard's content collection), use **+ Insert
block → Image** instead and paste the URL into `src:` yourself.

Either way, always fill in `alt:` with a short description of the image
— it's what screen readers announce, and it's required for accessibility.

A caveat worth knowing: an embedded (uploaded) image becomes a very long
block of text inside your markdown, since the whole image is encoded
right there in the `src:` value. That's normal, but if a sheet has many
photos it can make the document slow to scroll and the copied HTML very
large. For a sheet with several images, linking to hosted URLs instead of
uploading keeps things lighter.

You can also place an image inside a Text section or inside one column
of a section — see "Body text before and after columns, and images in a
section" below.

## Body text before and after columns, and images in a section

A Text section can have body copy **before** the columns, **after** them,
or both — and can include an image, either as its own element in the
section or inside a specific column.

For the common case (one block of text before, one after), just add
`bodyAfter:` alongside `body:`:

```
:::section
label: Project Overview
body: |
  Intro paragraph goes here.
columns:
  - heading: A
    text: First half.
  - heading: B
    text: Second half.
bodyAfter: |
  Closing paragraph, after the columns.
:::
```

Add an `image:` field the same way to drop a picture into the section —
it renders between `body` and `columns`:

```
:::section
label: Project Overview
body: |
  Intro paragraph.
image:
  src: https://example.com/your-image.jpg
  alt: Describe the image
  caption: Optional caption
  width: 500
columns:
  - heading: A
    text: First half.
:::
```

An image works the same way **inside a column** — just add it to that
column alongside `heading:` and `text:`:

```
columns:
  - heading: First half of class
    image:
      src: https://example.com/your-image.jpg
      alt: Describe the image
    text: Text under the image.
```

### Full control over order (content:)

If you need more than one block of text, more than one image, or an
order other than body → image → columns → bodyAfter — for example two
separate paragraphs with a set of columns in between them — use
`content:` instead of separate `body`/`image`/`columns`/`bodyAfter`
fields. List each piece in the exact order you want it to appear; repeat
any type as many times as you like:

```
:::section
label: Project Overview
content:
  - body: |
      First paragraph.
  - columns:
      - heading: A
        text: Column A text.
      - heading: B
        text: Column B text.
  - image:
      src: https://example.com/your-image.jpg
      alt: Describe the image
  - body: |
      Second paragraph, after everything above it.
:::
```

Don't mix `content:` with `body`/`image`/`columns`/`bodyAfter` in the
same section — if `content:` is present, it's used and the separate
fields are ignored.

## If something looks broken

A pink/orange warning box will appear in the preview instead of your
content, and a message bar appears at the bottom of the screen explaining
what's wrong (an unknown block name, a typo in a keyword, or an
indentation problem). Fix the block named in the message and the warning
will disappear — nothing else on the page is affected, and no HTML gets
exported for a broken block until it's fixed.

## Available block types

Click **+ Insert block** to see the current list with a description of
each — the list is always up to date with what's actually available,
including any new block types someone has added since these instructions
were written.

## Your work is saved automatically

The editor autosaves to your browser as you type, so closing the tab and
coming back later will restore where you left off — on that same browser,
on that same computer. It is **not** saved anywhere else, so for anything
you want to keep long-term, use **Download .md** and save the file
somewhere safe (e.g. your course folder, OneDrive, etc.).
