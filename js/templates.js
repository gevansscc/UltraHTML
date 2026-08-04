/* templates.js
 * ======================================================================
 * THIS is the file you edit to add or change what a block looks like.
 * Nothing else in the app needs to change — see docs/ADDING-TEMPLATES.md.
 *
 * Each entry in TEMPLATES looks like:
 *
 *   blockName: {
 *     label: "Human name shown in the Insert menu",
 *     hint:  "One line describing what it's for",
 *     snippet: `...default text inserted into the editor...`,
 *     render: function(data) { return "<div ...>...</div>"; }
 *   }
 *
 * `data` is whatever the author typed inside :::blockName ... ::: ,
 * parsed from YAML into a plain JS object. Use MD.inline(text) for
 * single-line text and MD.paragraphs(text) for multi-line text so
 * **bold**, *italic*, and [links](https://...) work and everything
 * is safely HTML-escaped.
 * ====================================================================== */

(function (global) {

  // ---- shared design tokens -------------------------------------------
  // Themes used by the "hero" block. Add new ones here and they instantly
  // show up as valid `theme:` values — no other code to touch.
  const THEMES = {
    navy:     { bg: '#1a2a4a', text: '#e8eef7', eyebrow: '#7a9fd4', meta: '#a8c4e0' },
    dcc:      {bg: '#000000', text: '#e2b222', eyebrow: '#df005f', meta: '#df005f'},
    maroon:   { bg: '#3a1420', text: '#f7e9ec', eyebrow: '#d98ba0', meta: '#e0b3bf' },
    forest:   { bg: '#123326', text: '#e7f3ec', eyebrow: '#7fc9a3', meta: '#a9d9c1' },
    charcoal: { bg: '#242424', text: '#f2f2f2', eyebrow: '#b0b0b0', meta: '#cfcfcf' },
    slate:    { bg: '#2c3440', text: '#eef1f5', eyebrow: '#9fb3c8', meta: '#c2cedb' }
  };
  const FONT = "font-family:Arial,Helvetica,sans-serif;";
  const CARD = "background-color:#ffffff;border:1px solid #e0e0e0;border-radius:10px;padding:24px 28px;" + FONT;
  const LABEL = "margin:0 0 16px 0;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #ebebeb;padding-bottom:10px;";

  // Small colored "tag" palette — shared by the callout block and the
  // schedule block's status pills, so both stay visually consistent and
  // a new color only has to be added in one place.
  const TAGS = {
    info:    { bg: '#eaf2fb', border: '#bcd6f2', text: '#1a4a7a' },
    warning: { bg: '#fdf3e3', border: '#f0d9a6', text: '#8a5a10' },
    success: { bg: '#e9f7ef', border: '#b9e3c6', text: '#1a6a3a' },
    danger:  { bg: '#fbeaea', border: '#f0bcbc', text: '#8a1a1a' }
  };

  function theme(name) { return THEMES[name] || THEMES.navy; }
  function tag(kind) { return TAGS[kind] || TAGS.info; }

  // ---- template registry ------------------------------------------------
  const TEMPLATES = {

    hero: {
      label: 'Hero header',
      hint: 'Big banner for the top of the sheet — title, subtitle, quick facts.',
      snippet:
`:::hero
eyebrow: St. Clair College · Graphic Design
title: GRD311 — Web & Multimedia 1
subtitle: User experience, interface design, and front-end development
theme: navy
badges:
  - 📅 15 weeks
  - 📋 3 projects
  - 🎓 UX + HTML/CSS
:::`,
      render: function (d) {
        const t = theme(d.theme);
        const badges = Array.isArray(d.badges) ? d.badges : [];
        const badgeHtml = badges.map(function (b) {
          return '<span style="font-size:13px;color:' + t.meta + ';">' + MD.inline(b) + '</span>';
        }).join('');
        return (
          '<div style="background-color:' + t.bg + ';border-radius:10px;padding:28px 32px;' + FONT + '">' +
            (d.eyebrow ? '<p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:' + t.eyebrow + ';text-transform:uppercase;letter-spacing:0.08em;">' + MD.inline(d.eyebrow) + '</p>' : '') +
            '<h1 style="margin:0 0 6px 0;font-size:26px;font-weight:600;color:' + t.text + ';">' + MD.inline(d.title || '') + '</h1>' +
            (d.subtitle ? '<p style="margin:0 0 20px 0;font-size:14px;color:' + t.eyebrow + ';">' + MD.inline(d.subtitle) + '</p>' : '') +
            (badgeHtml ? '<div style="display:flex;gap:20px;flex-wrap:wrap;">' + badgeHtml + '</div>' : '') +
          '</div>'
        );
      }
    },

    section: {
      label: 'Text section (1–4 columns)',
      hint: 'A white card with a label, an intro paragraph, and optional side-by-side columns.',
      snippet:
`:::section
label: About this course
body: |
  This course introduces the foundational principles and practices of
  UX and UI design as they apply to multimedia and interactive environments.
columns:
  - heading: First half of class
    text: Core technical competencies — HTML, CSS, responsive layout, and accessibility standards.
  - heading: Second half of class
    text: Creative problem solving and human-centered design — UX research, wireframing, prototyping, and visual interface design.
:::`,
      render: function (d) {
        const cols = Array.isArray(d.columns) ? d.columns : [];
        const colCount = Math.min(Math.max(cols.length, 1), 4);
        const colHtml = cols.map(function (c) {
          return (
            '<div style="background-color:#f5f7fa;border-radius:8px;padding:14px 16px;">' +
              (c.heading ? '<p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#555;">' + MD.inline(c.heading) + '</p>' : '') +
              '<p style="margin:0;font-size:13px;color:#333;line-height:1.6;">' + MD.inline(c.text || '') + '</p>' +
            '</div>'
          );
        }).join('');
        return (
          '<div style="' + CARD + '">' +
            (d.label ? '<p style="' + LABEL + '">' + MD.inline(d.label) + '</p>' : '') +
            (d.body ? MD.paragraphs(d.body, 'margin:0 0 20px 0;font-size:14px;color:#222;line-height:1.75;') : '') +
            (colHtml ? '<div style="display:grid;grid-template-columns:repeat(' + colCount + ',1fr);gap:12px;">' + colHtml + '</div>' : '') +
          '</div>'
        );
      }
    },

    cards: {
      label: 'Card grid',
      hint: 'Row of small equal-width cards — good for project summaries or deliverables.',
      snippet:
`:::cards
label: Projects
items:
  - title: Project 1 — Landing Page
    text: Hand-coded HTML/CSS layout from a wireframe.
  - title: Project 2 — Prototype
    text: Interactive Figma prototype with a tested user flow.
  - title: Project 3 — Case Study
    text: Documented design process and final presentation.
:::`,
      render: function (d) {
        const items = Array.isArray(d.items) ? d.items : [];
        const n = Math.min(Math.max(items.length, 1), 4);
        const itemHtml = items.map(function (it) {
          return (
            '<div style="background-color:#f5f7fa;border-radius:8px;padding:16px 18px;">' +
              (it.title ? '<p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#1a2a4a;">' + MD.inline(it.title) + '</p>' : '') +
              '<p style="margin:0;font-size:13px;color:#333;line-height:1.6;">' + MD.inline(it.text || '') + '</p>' +
            '</div>'
          );
        }).join('');
        return (
          '<div style="' + CARD + '">' +
            (d.label ? '<p style="' + LABEL + '">' + MD.inline(d.label) + '</p>' : '') +
            '<div style="display:grid;grid-template-columns:repeat(' + n + ',1fr);gap:12px;">' + itemHtml + '</div>' +
          '</div>'
        );
      }
    },

    callout: {
      label: 'Callout box',
      hint: 'Colored highlight box for deadlines, warnings, or important notes.',
      snippet:
`:::callout
kind: warning
title: Before you submit
body: Double-check your file names match the naming convention on the syllabus.
:::`,
      render: function (d) {
        const k = tag(d.kind);
        return (
          '<div style="background-color:' + k.bg + ';border:1px solid ' + k.border + ';border-radius:10px;padding:18px 22px;' + FONT + '">' +
            (d.title ? '<p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:' + k.text + ';">' + MD.inline(d.title) + '</p>' : '') +
            (d.body ? MD.paragraphs(d.body, 'margin:0;font-size:13px;color:#333;line-height:1.65;') : '') +
          '</div>'
        );
      }
    },

    schedule: {
      label: 'Weekly schedule',
      hint: 'A list of week ranges with a title each, and an optional colored tag (Quiz, Test, etc.) on the right.',
      snippet:
`:::schedule
label: Weekly Schedule
rows:
  - range: Week 1–2
    title: Foundations
  - range: Week 3–4
    title: Understanding the user
  - range: Week 5–6
    title: Architecture & ideation
    tag: Quiz
    tagKind: warning
  - range: Week 7–8
    title: Visual interface design
  - range: Week 9–10
    title: Prototyping & interactivity
  - range: Week 11–12
    title: Accessibility & real-world application
    tag: Test
    tagKind: danger
  - range: Week 13–15
    title: Final project
    tag: Project 3
    tagKind: success
:::`,
      render: function (d) {
        const rows = Array.isArray(d.rows) ? d.rows : [];
        const rowHtml = rows.map(function (r) {
          const t = r.tag ? tag(r.tagKind) : null;
          return (
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;background-color:#f5f7fa;border-radius:8px;padding:12px 18px;margin-bottom:8px;">' +
              '<div style="display:flex;align-items:center;gap:16px;">' +
                (r.range ? '<span style="display:inline-block;white-space:nowrap;background-color:#dfeaf9;color:#1c5cb8;font-size:12.5px;font-weight:700;border-radius:999px;padding:5px 14px;">' + MD.inline(r.range) + '</span>' : '') +
                '<span style="font-size:14.5px;color:#222;">' + MD.inline(r.title || '') + '</span>' +
              '</div>' +
              (t ? '<span style="display:inline-block;white-space:nowrap;background-color:' + t.bg + ';color:' + t.text + ';border:1px solid ' + t.border + ';font-size:11.5px;font-weight:700;border-radius:999px;padding:4px 12px;">' + MD.inline(r.tag) + '</span>' : '') +
            '</div>'
          );
        }).join('');
        return (
          '<div style="' + CARD + '">' +
            (d.label ? '<p style="' + LABEL + '">' + MD.inline(d.label) + '</p>' : '') +
            '<div>' + rowHtml + '</div>' +
          '</div>'
        );
      }
    },

    stats: {
      label: 'Stat grid (evaluation / breakdown)',
      hint: 'A wrapping grid of small boxes, each with a short label and a big value — good for grading weights.',
      snippet:
`:::stats
label: Evaluation
items:
  - label: Assignments
    value: 15%
  - label: Project 1
    value: 20%
  - label: Project 2
    value: 20%
  - label: Project 3
    value: 20%
  - label: Quiz
    value: 10%
  - label: Test
    value: 15%
:::`,
      render: function (d) {
        const items = Array.isArray(d.items) ? d.items : [];
        const itemHtml = items.map(function (it) {
          return (
            '<div style="background-color:#f5f7fa;border-radius:8px;padding:16px 18px;">' +
              (it.label ? '<p style="margin:0 0 6px 0;font-size:13px;color:#6b7688;">' + MD.inline(it.label) + '</p>' : '') +
              '<p style="margin:0;font-size:24px;font-weight:700;color:#1c2333;">' + MD.inline(it.value || '') + '</p>' +
            '</div>'
          );
        }).join('');
        return (
          '<div style="' + CARD + '">' +
            (d.label ? '<p style="' + LABEL + '">' + MD.inline(d.label) + '</p>' : '') +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">' + itemHtml + '</div>' +
          '</div>'
        );
      }
    },

    list: {
      label: 'List card (schedule / checklist / grading)',
      hint: 'A white card with a heading and a bullet or numbered list.',
      snippet:
`:::list
label: Grading breakdown
style: bullet
items:
  - Weekly assignments — 20%
  - Project 1 — 20%
  - Project 2 — 20%
  - Project 3 — 30%
  - Quiz + test — 10%
:::`,
      render: function (d) {
        const tag = d.style === 'numbered' ? 'ol' : 'ul';
        return (
          '<div style="' + CARD + '">' +
            (d.label ? '<p style="' + LABEL + '">' + MD.inline(d.label) + '</p>' : '') +
            '<' + tag + ' style="margin:0;padding-left:20px;font-size:13px;color:#333;line-height:1.9;">' +
              MD.listItems(d.items) +
            '</' + tag + '>' +
          '</div>'
        );
      }
    },

    divider: {
      label: 'Spacer / divider',
      hint: 'Empty vertical space between blocks — Ultra sections otherwise sit tight together.',
      snippet:
`:::divider
height: 16
:::`,
      render: function (d) {
        const h = parseInt(d.height, 10) || 16;
        return '<div style="height:' + h + 'px;line-height:' + h + 'px;font-size:0;">&nbsp;</div>';
      }
    }

  };

  global.TEMPLATES = TEMPLATES;
  global.THEMES = THEMES;
})(window);
