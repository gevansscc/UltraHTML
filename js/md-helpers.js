/* md-helpers.js
 * Tiny, dependency-free markdown-ish text formatter.
 * On purpose this does NOT try to be full markdown — it only understands
 * the handful of things a course-sheet author actually needs:
 *   **bold**   *italic*   `code`   [link text](https://example.com)
 * plus, in multi-line fields via MD.paragraphs(): "- " bullet lists and
 * "1. " numbered lists.
 * Anything else is left as plain text and HTML-escaped so authors can't
 * accidentally (or intentionally) break the page.
 *
 * Every template in templates.js should run user-supplied text through
 * MD.inline() (single line) or MD.paragraphs() (multi-line blocks)
 * before dropping it into HTML. Never insert raw user text into the
 * output — always go through one of these two.
 */
(function (global) {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Formats a single line/run of text: bold, italic, code, links.
  function inline(str) {
    if (str === undefined || str === null) return '';
    let s = escapeHtml(String(str));

    // links: [text](url)  — do this before bold/italic so url chars are safe
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (_, text, url) {
      return '<a href="' + url + '" style="color:inherit;text-decoration:underline;" target="_blank" rel="noopener">' + text + '</a>';
    });

    // bold: **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // italic: *text*  (after bold, so ** isn't consumed by this)
    s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');

    // inline code: `code`
    s = s.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:4px;font-size:0.92em;">$1</code>');

    return s;
  }

  // Formats a multi-line block of text into <p> / <ul> / <ol> as needed.
  // Blank line = new block. Single newline inside a paragraph = <br>.
  // A run of consecutive lines that all start with "- " / "* " becomes a
  // bullet list; a run that all start with "1. " (any digits) becomes a
  // numbered list. Mixed content works — paragraphs and lists can appear
  // one after another, separated by blank lines, in the same field.
  function paragraphs(str, pStyle) {
    if (!str) return '';
    const style = pStyle || 'margin:0 0 12px 0;';
    // reuse the paragraph's own color/size/spacing for lists, just add indent
    const listStyle = style + 'padding-left:20px;';
    return String(str)
      .trim()
      .split(/\n\s*\n/)
      .map(function (block) {
        const lines = block.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });

        const isBulleted = lines.length > 0 && lines.every(function (l) { return /^[-*]\s+/.test(l); });
        if (isBulleted) {
          const items = lines.map(function (l) { return '<li>' + inline(l.replace(/^[-*]\s+/, '')) + '</li>'; }).join('');
          return '<ul style="' + listStyle + '">' + items + '</ul>';
        }

        const isNumbered = lines.length > 0 && lines.every(function (l) { return /^\d+[.)]\s+/.test(l); });
        if (isNumbered) {
          const items = lines.map(function (l) { return '<li>' + inline(l.replace(/^\d+[.)]\s+/, '')) + '</li>'; }).join('');
          return '<ol style="' + listStyle + '">' + items + '</ol>';
        }

        const withBreaks = inline(block.trim()).replace(/\n/g, '<br>');
        return '<p style="' + style + '">' + withBreaks + '</p>';
      })
      .join('');
  }

  // Formats a simple list (array of strings) as <li> items with inline formatting.
  function listItems(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(function (item) {
      return '<li>' + inline(item) + '</li>';
    }).join('');
  }

  global.MD = { escapeHtml: escapeHtml, inline: inline, paragraphs: paragraphs, listItems: listItems };
})(window);
