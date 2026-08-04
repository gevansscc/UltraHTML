/* parser.js
 * Turns author-written markdown (using ::: blocks) into an array of
 * { name, data, html, error, raw } block objects. Nothing in here knows
 * about hero/section/cards/etc specifically — it just looks names up in
 * window.TEMPLATES, so new templates never require touching this file.
 */
(function (global) {

  const BLOCK_RE = /:::([a-zA-Z][\w-]*)\s*\n([\s\S]*?)\n:::/g;

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
      data = body.trim() ? jsyaml.load(body) : {};
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
