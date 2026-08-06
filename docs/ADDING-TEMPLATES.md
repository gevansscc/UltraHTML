# Adding or changing block types

The whole system is built so that **one file** — `js/templates.js` — is the
only thing you touch to add a new block type, change what an existing one
looks like, or add a new color theme. The editor, parser, preview, insert
menu, and export panel all read from that file automatically. Nothing else
needs to change.

## How it fits together

```
editor text  →  js/parser.js  →  js/templates.js  →  HTML string
 (:::name)      (splits into      (looks up "name",
                 blocks, parses    calls its render()
                 YAML inside)      function)
```

`parser.js` doesn't know what a "hero" or "cards" block is. It just:

1. Finds text between `:::name` and `:::`
2. Parses that text as YAML into a plain object
3. Looks up `TEMPLATES[name]`
4. Calls `TEMPLATES[name].render(thatObject)`
5. Takes whatever HTML string comes back

That's the whole contract. As long as your new entry in `TEMPLATES`
follows that shape, everything upstream (the insert menu, preview,
export panel) picks it up with zero other changes.

## The shared color-override pattern

Blocks in the "card family" (`section`, `cards`, `stats`, `list`,
`schedule`) all use two shared helpers instead of one fixed look:

```js
cardStyle(d)   // outer card: honors d.background, d.borderColor
labelStyle(d)  // label line: honors d.labelColor
```

Any other color a block uses internally (box background, text color,
etc.) follows the same pattern directly inside that block's own
`render()`: read an optional field off `d`, fall back to the current
default if it's missing. For example, in `cards`:

```js
const boxColor = d.boxColor || '#f5f7fa';
```

If you're adding a new block and want it to support color overrides the
same way, use `cardStyle(d)` / `labelStyle(d)` for the outer card and
label, and add your own `d.<name> || <default>` fallbacks for anything
else it draws. Mention the field names in that block's `hint` string so
they show up in the Insert menu.

One gotcha worth knowing: YAML treats a bare `#` as the start of a
comment, so `background: #10182b` would normally parse as an empty
value. `js/parser.js` auto-quotes simple `key: #hex` lines before handing
them to YAML so authors can type colors without knowing that — if you add
a new place colors can appear (e.g. inside a list item), keep that in
mind.

## Reusing one template's render() from another

`section` calls `TEMPLATES.image.render(...)` directly wherever it needs
to draw an image (a section-level image, or one inside a column), instead
of duplicating the image markup. If you're building a block that should
contain another block's content — a card with an optional image, a
callout that can embed a mini stat, etc. — this is the pattern: call
`TEMPLATES.<name>.render(data)` and drop the returned HTML string in
wherever you need it. Since `TEMPLATES` is fully built before any
`render()` function actually runs, this works regardless of which order
the two entries appear in the file.

## Adding a new block type

Open `js/templates.js` and add a new entry to the `TEMPLATES` object:

```js
TEMPLATES.quote = {
  label: 'Pull quote',
  hint: 'A large highlighted quote or testimonial.',
  snippet:
`:::quote
text: Design is not just what it looks like — design is how it works.
attribution: Steve Jobs
:::`,
  render: function (d) {
    return (
      '<div style="border-left:4px solid #1a2a4a;padding:6px 0 6px 18px;font-family:Arial,sans-serif;">' +
        '<p style="margin:0 0 6px 0;font-size:16px;font-style:italic;color:#222;">' + MD.inline(d.text || '') + '</p>' +
        (d.attribution ? '<p style="margin:0;font-size:12px;color:#888;">— ' + MD.inline(d.attribution) + '</p>' : '') +
      '</div>'
    );
  }
};
```

Save the file, refresh the page. Done:

- It now shows up in **+ Insert block** with your label and hint.
- Typing `:::quote ... :::` in the editor renders it in the preview.
- It gets its own row with a Copy HTML button in the export panel.
- If an author leaves out `attribution`, it just doesn't render that line
  — no error, because the code checks `d.attribution` before using it.

### Rules of thumb for `render()`

- **Never** insert `d.someField` directly into the HTML string. Always run
  text through `MD.inline(text)` (single line) or `MD.paragraphs(text)`
  (multi-line) — this is what escapes stray `<`/`>`/`&` so an author
  can't accidentally break the page, and it's what makes `**bold**` work.
- For a list of plain strings, use `MD.listItems(arr)` inside a `<ul>`/`<ol>`.
- Give every field a sensible fallback (`d.title || ''`) so a block with a
  missing field renders something reasonable instead of the literal word
  "undefined".
- Keep styling **inline** (`style="..."`) and avoid CSS classes — Ultra
  content sections don't reliably carry an external stylesheet with them,
  so anything not inline may not survive the paste.
- Keep fonts to `Arial, Helvetica, sans-serif` (or another very common
  web-safe stack) for the same reason — no `@font-face` or Google Fonts.

## Changing how an existing block looks

Find its `render()` function and edit the HTML string. Because every
block's look lives entirely inside its own `render()` function, changing
one block's colors/spacing/layout can't accidentally affect another
block — there's no shared CSS file for the output to fight over.

## Adding a new color theme (for the hero block)

Themes live in the same file, above `TEMPLATES`:

```js
const THEMES = {
  navy:     { bg: '#1a2a4a', text: '#e8eef7', eyebrow: '#7a9fd4', meta: '#a8c4e0' },
  maroon:   { bg: '#3a1420', text: '#f7e9ec', eyebrow: '#d98ba0', meta: '#e0b3bf' },
  ...
  // add yours:
  gold:     { bg: '#4a3a10', text: '#fbf3e0', eyebrow: '#e0c070', meta: '#eedba0' }
};
```

Authors can now write `theme: gold` in any `:::hero` block. No other file
needs to change. If a block type other than `hero` should also support
themes, have its `render()` function call the same `theme(name)` helper
that's already defined at the top of `templates.js`.

## Things that are safe to change any time

- Wording of `label`/`hint` shown in the insert menu
- The default `snippet` text (what gets inserted for a fresh block)
- Colors, spacing, fonts inside any `render()` function
- Adding fields to a block's expected data (just check for them with
  `d.newField` and give a fallback)

## Things to be careful about

- **Renaming a block** (e.g. `section` → `text-block`) breaks any existing
  markdown documents that already use `:::section`. If you need to rename,
  either keep the old name as an alias (`TEMPLATES['text-block'] =
  TEMPLATES.section;`) or do a find-and-replace across saved `.md` files.
- **Removing a field** that a `render()` function used to read is fine —
  old documents that still have that field in their YAML will just have it
  ignored. **Renaming a field** is the same situation as renaming a block:
  old documents keep using the old name until updated.
- Two blocks should not share the exact same name key in `TEMPLATES` —
  the second one silently wins.

## Where each file's job stops

| File | Job | Do you edit it to add a block type? |
|---|---|---|
| `js/templates.js` | Defines every block: label, hint, default snippet, render() | **Yes — this is the file** |
| `js/parser.js` | Splits editor text into blocks, hands each to templates.js | No |
| `js/md-helpers.js` | Safe inline text formatting (bold/italic/links) plus paragraph/list formatting (`MD.paragraphs()` turns `- `/`1. ` runs into `<ul>`/`<ol>`) used by templates | Only if you want a new inline formatting rule (e.g. `~~strikethrough~~`) |
| `js/app.js` | Wires up buttons, tabs, preview iframe, clipboard copy, autosave | No |
| `index.html` / `css/app.css` | The builder's own interface chrome | No, unless changing the tool's own look |
