/* parser.js
 * Turns author-written markdown (using ::: blocks) into an array of
 * { name, data, html, error, raw } block objects. Nothing in here knows
 * about hero/section/cards/etc specifically — it just looks names up in
 * window.TEMPLATES, so new templates never require touching this file.
 */
(function (global) {

  const BLOCK_RE = /:::([a-zA-Z][\w-]*)\s*\n([\s\S]*?)\n:::/g;

  // YAML's literal block scalar (`key: |`) is strict about indentation —
  // a paragraph break, a stray colon, or a line indented one space
  // differently than the first line will break it in ways that are hard
  // to explain to a non-YAML-writer. To make multi-paragraph text just
  // work, we find these blocks ourselves before handing anything to the
  // YAML parser, and rewrite them as a single safely-escaped string.
  // That string still contains real blank lines between paragraphs —
  // MD.paragraphs() (in md-helpers.js) is what turns those into <p> tags.
  function normalizeLiteralBlocks(text) {
    const lines = text.split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const start = /^(\s*)([A-Za-z_][\w-]*):\s*\|\s*$/.exec(line);
      if (!start) { out.push(line); i++; continue; }

      const keyIndent = start[1].length;
      i++;
      const collected = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '') { collected.push(''); i++; continue; }
        const lead = l.match(/^(\s*)/)[1].length;
        if (lead > keyIndent) { collected.push(l); i++; continue; }
        break; // dedent back to (or past) the key's own indent = block is over
      }
      while (collected.length && collected[collected.length - 1] === '') collected.pop();

      let minIndent = Infinity;
      collected.forEach(function (l) {
        if (l.trim() !== '') minIndent = Math.min(minIndent, l.match(/^(\s*)/)[1].length);
      });
      if (!isFinite(minIndent)) minIndent = 0;

      const raw = collected.map(function (l) { return l.trim() === '' ? '' : l.slice(minIndent); }).join('\n');
      out.push(start[1] + start[2] + ': ' + JSON.stringify(raw));
    }
    return out.join('\n');
  }

  // A bare hex color like `background: #10182b` is invisible to YAML —
  // "#" starts a comment there, so the value silently disappears instead
  // of erroring. Auto-quote simple "key: #hex" lines so authors can type
  // colors the normal way without knowing that YAML quirk.
  function quoteHexColors(text) {
    return text.split('\n').map(function (line) {
      const m = /^(\s*[A-Za-z_][\w-]*:\s*)(#[0-9a-fA-F]{3,8})(\s*)$/.exec(line);
      return m ? m[1] + '"' + m[2] + '"' + m[3] : line;
    }).join('\n');
  }

  function parseDocument(source) {
    const blocks = [];
    let lastIndex = 0;
    let match;
    BLOCK_RE.lastIndex = 0;

    while ((match = BLOCK_RE.exec(source)) !== null) {
      // capture any stray text between blocks so authors notice typos
      const between = source.slice(lastIndex, match.index).trim();
      if (between) {
        blocks.push(strayTextBlock(between));
      }

      const name = match[1];
      const body = match[2];
      blocks.push(buildBlock(name, body));
      lastIndex = BLOCK_RE.lastIndex;
    }

    const tail = source.slice(lastIndex).trim();
    if (tail) blocks.push(strayTextBlock(tail));

    return blocks;
  }

  function buildBlock(name, body) {
    const template = global.TEMPLATES[name];
    if (!template) {
      return {
        name: name,
        raw: body,
        error: 'Unknown block type "' + name + '". Check spelling, or add it in js/templates.js.',
        html: errorHtml('Unknown block: ' + name, 'This section has no matching template.')
      };
    }
    let data;
    try {
      data = body.trim() ? jsyaml.load(normalizeLiteralBlocks(quoteHexColors(body))) : {};
    } catch (e) {
      return {
        name: name,
        raw: body,
        error: 'Could not read this block — check indentation. (' + e.message + ')',
        html: errorHtml('Formatting problem in "' + name + '" block', e.message)
      };
    }
    let html;
    try {
      html = template.render(data || {});
    } catch (e) {
      return {
        name: name,
        raw: body,
        error: 'This block could not be rendered: ' + e.message,
        html: errorHtml('Problem rendering "' + name + '" block', e.message)
      };
    }
    return { name: name, data: data, raw: body, html: html };
  }

  function strayTextBlock(text) {
    return {
      name: '(unrecognized text)',
      raw: text,
      error: 'This text is outside any ::: block, so it will not appear in the exported HTML.',
      html: errorHtml('Text outside a block', 'Wrap content in a ::: block so it renders. This text is currently ignored.')
    };
  }

  function errorHtml(title, detail) {
    return (
      '<div style="background:#fbeaea;border:1px dashed #d98b8b;border-radius:8px;padding:14px 16px;font-family:Arial,sans-serif;">' +
        '<p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#8a1a1a;">⚠ ' + MD.escapeHtml(title) + '</p>' +
        '<p style="margin:0;font-size:12px;color:#8a1a1a;">' + MD.escapeHtml(detail) + '</p>' +
      '</div>'
    );
  }

  global.parseDocument = parseDocument;
})(window);
