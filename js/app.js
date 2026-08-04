/* app.js — UI wiring. No template-specific knowledge lives here. */
(function () {
  const editor = document.getElementById('editor');
  const previewFrame = document.getElementById('previewFrame');
  const exportList = document.getElementById('exportList');
  const errorBar = document.getElementById('errorBar');
  const insertMenu = document.getElementById('insertMenu');
  const insertBtn = document.getElementById('insertBtn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = { preview: document.getElementById('previewPanel'), export: document.getElementById('exportPanel') };
  const STORAGE_KEY = 'bb-ultra-builder-doc';

  // ---------- build the "Insert block" menu straight from TEMPLATES ----------
  Object.keys(TEMPLATES).forEach(function (key) {
    const t = TEMPLATES[key];
    const item = document.createElement('button');
    item.className = 'menu-item';
    item.type = 'button';
    item.innerHTML = '<span class="menu-item-label">' + t.label + '</span><span class="menu-item-hint">' + t.hint + '</span>';
    item.addEventListener('click', function () {
      insertSnippet(t.snippet);
      insertMenu.classList.remove('open');
    });
    insertMenu.appendChild(item);
  });

  insertBtn.addEventListener('click', function () {
    insertMenu.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!insertMenu.contains(e.target) && e.target !== insertBtn) {
      insertMenu.classList.remove('open');
    }
  });

  function insertSnippet(snippet) {
    const pos = editor.selectionStart;
    const before = editor.value.slice(0, pos);
    const after = editor.value.slice(pos);
    const needsGap = before.trim().length > 0 && !before.endsWith('\n\n');
    const insertion = (needsGap ? '\n\n' : '') + snippet + '\n\n';
    editor.value = before + insertion + after;
    editor.focus();
    render();
    save();
  }

  // ---------- tabs ----------
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      Object.keys(panels).forEach(function (k) { panels[k].classList.toggle('active', k === btn.dataset.tab); });
    });
  });

  // ---------- render ----------
  let debounceTimer;
  editor.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { render(); save(); }, 200);
  });

  function render() {
    const blocks = parseDocument(editor.value);

    // preview: full assembled page inside an iframe so styles are isolated
    const combined = blocks.map(function (b) { return b.html; }).join('\n<div style="height:16px;"></div>\n');
    const pageHtml =
      '<html><head><meta charset="utf-8"><style>' +
      'body{margin:0;background:#eef1f5;padding:32px 24px;} ' +
      '.wrap{max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:16px;}' +
      '</style></head><body><div class="wrap">' + combined + '</div></body></html>';
    previewFrame.srcdoc = pageHtml;

    // export list: one entry per block with its own copy button
    exportList.innerHTML = '';
    const errors = [];
    blocks.forEach(function (b, i) {
      if (b.error) errors.push((i + 1) + '. ' + b.name + ' — ' + b.error);
      const row = document.createElement('div');
      row.className = 'export-row';
      const codeId = 'code-' + i;
      row.innerHTML =
        '<div class="export-row-head">' +
          '<span class="export-row-title">' + (i + 1) + '. ' + escapeHtml(b.name) + '</span>' +
          '<button class="copy-btn" type="button">Copy HTML</button>' +
        '</div>' +
        '<pre class="export-code" id="' + codeId + '">' + escapeHtml(b.html) + '</pre>';
      row.querySelector('.copy-btn').addEventListener('click', function (ev) {
        copyText(b.html, ev.target);
      });
      exportList.appendChild(row);
    });

    if (errors.length) {
      errorBar.textContent = errors.join('   ·   ');
      errorBar.classList.add('visible');
    } else {
      errorBar.classList.remove('visible');
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      const original = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = original; btn.classList.remove('copied'); }, 1400);
    }).catch(function () {
      // fallback for older browsers / non-https local preview
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied ✓';
      setTimeout(function () { btn.textContent = 'Copy HTML'; }, 1400);
    });
  }

  document.getElementById('copyAllBtn').addEventListener('click', function (ev) {
    const blocks = parseDocument(editor.value);
    const combined = blocks.map(function (b) { return b.html; }).join('\n\n');
    copyText(combined, ev.target);
  });

  document.getElementById('downloadHtmlBtn').addEventListener('click', function () {
    const blocks = parseDocument(editor.value);
    const combined = blocks.map(function (b) { return b.html; }).join('\n\n');
    downloadFile('project-sheet.html', combined);
  });

  document.getElementById('downloadMdBtn').addEventListener('click', function () {
    downloadFile('project-sheet.md', editor.value);
  });

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.getElementById('loadExampleBtn').addEventListener('click', function () {
    if (editor.value.trim() && !confirm('Replace the current document with the example?')) return;
    fetch('examples/example.md').then(function (r) { return r.text(); }).then(function (text) {
      editor.value = text;
      render();
      save();
    }).catch(function () {
      alert('Could not load examples/example.md — make sure you are running this through a local server, not opening index.html directly as a file.');
    });
  });

  document.getElementById('newDocBtn').addEventListener('click', function () {
    if (editor.value.trim() && !confirm('Clear the editor and start a new document?')) return;
    editor.value = '';
    render();
    save();
  });

  // ---------- autosave ----------
  function save() {
    try { localStorage.setItem(STORAGE_KEY, editor.value); } catch (e) { /* ignore */ }
  }
  function restore() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (saved) { editor.value = saved; return true; }
    return false;
  }

  // ---------- boot ----------
  if (!restore()) {
    editor.value =
      ':::hero\n' +
      'eyebrow: Your Program · Course Code\n' +
      'title: Course Title Goes Here\n' +
      'subtitle: A short one-line description of the course\n' +
      'theme: navy\n' +
      'badges:\n' +
      '  - 📅 15 weeks\n' +
      '  - 📋 3 projects\n' +
      ':::\n';
  }
  render();
})();
