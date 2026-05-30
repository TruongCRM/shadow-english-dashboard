/* ============================================================================
 * SHADOW ENGLISH - v27  MINDMAP  (Lesson Framework V1, module #12)   (ADDITIVE)
 * ----------------------------------------------------------------------------
 * "🧠 Generate Mindmap" — reads the data already present in the lesson modules
 * and draws a radial mindmap around the topic, matching Lesson Framework V1.
 *
 * Reads (no new data, no required AI):
 *   WHY, SCENE, CORE PHRASES, GRAMMAR PATTERNS (SHADOW_V26), DIALOGUES,
 *   ACTION (Shadowing/Ghi âm/Roleplay/Chat AI), MEMORY LOOP (Day 0..60 + current
 *   stage), REAL LIFE MISSIONS, REVIEW (Active Recall), WORD ORDER CHALLENGE.
 *
 * Output: a self-contained radial SVG (central topic node + colored branch nodes
 * with sub-items). Buttons: ✨ Generate / ↻ Tạo lại / ⬇ Tải PNG (canvas export,
 * no external libs, no foreignObject so PNG export is clean).
 *
 * Additive only: a "🧠 MINDMAP — TỔNG KẾT BÀI HỌC" card appended at the END of
 * the topic page. Does NOT edit any module; reads DOM + SHADOW_V26/state.
 * Generated SVG is cached per-topic so the 1.5s re-mount never wipes it.
 *
 * Run SHADOW_V27.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V27) return;
  var VERSION = 'v27.0.0';

  // concrete hex palette (SVG/PNG must not rely on CSS vars)
  var C = {
    bg: '#0d0b1f', card: '#1a1838', card2: '#221f43', border: '#2a2750',
    text: '#ffffff', text2: '#a8a6c8', text3: '#6b6890',
    purple: '#7c5cff', green: '#22c55e', orange: '#ff8a3d', red: '#ef4444',
    yellow: '#facc15', blue: '#3b82f6', pink: '#ec4899', teal: '#14b8a6'
  };

  var svgCache = {}; // topicId -> svg string (so re-mount keeps the mindmap)

  function log() { try { console.log.apply(console, ['[v27]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clip(s, n) { s = String(s == null ? '' : s).trim().replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  /* ----------------------------------------------------------- topic context */
  function activeTopicView() {
    var v = document.getElementById('view-topic-detail');
    if (!v) return null;
    return v.classList.contains('active') ? v : null;
  }
  function currentTopicId(view) {
    var btn = view.querySelector('[data-action="start-session"][data-topic]');
    return btn ? btn.getAttribute('data-topic') : '_unknown';
  }
  function topicMeta(topicId, view) {
    var name = '', stage = '';
    try {
      var st = window.shadowEN && window.shadowEN.state;
      if (st) { var t = (st.topics || []).filter(function (x) { return x.id === topicId; })[0]; if (t) { name = t.name || ''; stage = t.reviewStage || ''; } }
    } catch (e) {}
    if (!name) { var h = view.querySelector('h1'); name = h ? (h.textContent || '').trim() : 'Lesson'; }
    return { name: name || 'Lesson', stage: stage };
  }
  function cardByTitle(view, re) {
    var titles = view.querySelectorAll('.card-title');
    for (var i = 0; i < titles.length; i++) {
      if (re.test(titles[i].textContent || '')) { return titles[i].closest ? titles[i].closest('.card') : null; }
    }
    return null;
  }
  function textAfterTitle(view, re) {
    var card = cardByTitle(view, re);
    if (!card) return '';
    var p = card.querySelector('p');
    return p ? (p.textContent || '').trim() : '';
  }
  function listItems(view, re, sel) {
    var card = cardByTitle(view, re); if (!card) return [];
    var els = card.querySelectorAll(sel || 'li'); var out = [];
    for (var i = 0; i < els.length; i++) { var t = (els[i].textContent || '').trim(); if (t) out.push(t); }
    return out;
  }

  /* --------------------------------------------------- collect lesson data */
  function collectLesson(view, topicId) {
    var meta = topicMeta(topicId, view);
    var branches = [];

    var why = textAfterTitle(view, /WHY THIS TOPIC/i);
    if (why) branches.push({ key: 'why', icon: '🎯', label: 'WHY', color: C.green, items: [clip(why, 60)] });

    var scene = textAfterTitle(view, /THE SCENE/i);
    if (scene) branches.push({ key: 'scene', icon: '📍', label: 'SCENE', color: C.blue, items: [clip(scene, 60)] });

    var phrases = [];
    var pe = view.querySelectorAll('.phrase-row .phrase-en, .v12-phrase-row .v12-phrase-en');
    for (var i = 0; i < pe.length && phrases.length < 4; i++) { var t = (pe[i].textContent || '').trim(); if (t) phrases.push(clip(t, 26)); }
    if (phrases.length) branches.push({ key: 'core', icon: '⭐', label: 'CORE PHRASES', color: C.yellow, items: phrases });

    var grammar = [];
    try { if (window.SHADOW_V26 && window.SHADOW_V26.getPatterns) { grammar = window.SHADOW_V26.getPatterns(topicId).map(function (p) { return clip(p.pattern, 26); }).slice(0, 4); } } catch (e) {}
    if (grammar.length) branches.push({ key: 'grammar', icon: '📐', label: 'GRAMMAR', color: C.purple, items: grammar });

    var dialogues = [];
    var dt = view.querySelectorAll('.dialogue-title');
    for (var d = 0; d < dt.length && dialogues.length < 3; d++) { var dtx = (dt[d].textContent || '').trim(); if (dtx) dialogues.push(clip(dtx, 26)); }
    if (dialogues.length) branches.push({ key: 'dialogues', icon: '🎭', label: 'DIALOGUES', color: C.teal, items: dialogues });

    // ACTION — framework-fixed practice loop
    branches.push({ key: 'action', icon: '🔁', label: 'ACTION', color: C.orange, items: ['Shadowing', 'Ghi âm', 'Roleplay', 'Chat AI'] });

    // MEMORY LOOP — framework-fixed spaced repetition + current stage
    var memItems = ['Day 0 · 1 · 3 · 7 · 21 · 60'];
    if (meta.stage) memItems.push('Đang ở: ' + meta.stage);
    branches.push({ key: 'memory', icon: '🧠', label: 'MEMORY LOOP', color: C.red, items: memItems });

    var missions = listItems(view, /REAL LIFE MISSIONS/i, 'li').filter(function (x) { return !/coming soon/i.test(x) && !/chưa có/i.test(x); }).slice(0, 3).map(function (x) { return clip(x, 28); });
    if (missions.length) branches.push({ key: 'missions', icon: '🚀', label: 'MISSIONS', color: C.blue, items: missions });

    var recall = listItems(view, /ACTIVE RECALL/i, 'li').filter(function (x) { return !/coming soon/i.test(x) && !/chưa có/i.test(x); }).slice(0, 3).map(function (x) { return clip(x, 28); });
    if (recall.length) branches.push({ key: 'review', icon: '🔄', label: 'REVIEW', color: C.purple, items: recall });

    // WORD ORDER CHALLENGE (#11) — note its presence if the module is live
    if (window.SHADOW_V25 || window.SHADOW_V24) {
      branches.push({ key: 'wordorder', icon: '🧩', label: 'WORD ORDER', color: C.green, items: ['Sắp xếp từ → câu'] });
    }

    return { name: meta.name, stage: meta.stage, branches: branches };
  }

  /* ----------------------------------------------------------- SVG builder */
  function wrapText(s, max, maxLines) {
    var words = String(s).split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
      else { cur = (cur + ' ' + w).trim(); }
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = clip(lines[maxLines - 1] + '…', max); }
    return lines;
  }

  function buildSVG(data) {
    var W = 1180, H = 860, cx = W / 2, cy = H / 2, R = 84;
    var rx = 410, ry = 312;
    var n = data.branches.length;
    var parts = [];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" font-family="Inter,Segoe UI,Arial,sans-serif">');
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + C.bg + '"/>');

    // connectors first (under nodes)
    var nodes = [];
    for (var i = 0; i < n; i++) {
      var ang = (-90 + i * (360 / n)) * Math.PI / 180;
      var nx = cx + rx * Math.cos(ang), ny = cy + ry * Math.sin(ang);
      nodes.push({ b: data.branches[i], x: nx, y: ny, ang: ang });
      var ex = cx + R * Math.cos(ang), ey = cy + R * Math.sin(ang);
      var mx = (ex + nx) / 2, my = (ey + ny) / 2;
      parts.push('<path d="M ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + nx.toFixed(1) + ' ' + ny.toFixed(1) + '" stroke="' + nodes[i].b.color + '" stroke-width="2.5" fill="none" opacity="0.55"/>');
    }

    // branch nodes
    for (var j = 0; j < nodes.length; j++) {
      var nd = nodes[j], b = nd.b;
      var pw = Math.max(132, b.label.length * 9 + 46);
      var ph = 28;
      var topY = nd.y - ph / 2;
      // header pill
      parts.push('<rect x="' + (nd.x - pw / 2).toFixed(1) + '" y="' + topY.toFixed(1) + '" rx="14" ry="14" width="' + pw + '" height="' + ph + '" fill="' + b.color + '"/>');
      parts.push('<text x="' + nd.x.toFixed(1) + '" y="' + (topY + 19).toFixed(1) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#0d0b1f">' + esc(b.icon + ' ' + b.label) + '</text>');
      // items
      for (var k = 0; k < b.items.length; k++) {
        var iy = topY + ph + 16 + k * 16;
        parts.push('<text x="' + nd.x.toFixed(1) + '" y="' + iy.toFixed(1) + '" text-anchor="middle" font-size="11" fill="' + C.text2 + '">• ' + esc(b.items[k]) + '</text>');
      }
    }

    // center node
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + C.card2 + '" stroke="' + C.purple + '" stroke-width="3"/>');
    var nameLines = wrapText((data.name || 'Lesson').toUpperCase(), 13, 3);
    var startY = cy - (nameLines.length - 1) * 11 - 4;
    for (var m = 0; m < nameLines.length; m++) {
      parts.push('<text x="' + cx + '" y="' + (startY + m * 22).toFixed(1) + '" text-anchor="middle" font-size="18" font-weight="800" fill="' + C.text + '">' + esc(nameLines[m]) + '</text>');
    }
    parts.push('<text x="' + cx + '" y="' + (cy + R - 18).toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="700" fill="' + C.text3 + '" letter-spacing="1">MINDMAP</text>');

    parts.push('</svg>');
    return parts.join('');
  }

  /* -------------------------------------------------------- card + actions */
  function cardHTML(topicId) {
    var cached = svgCache[topicId];
    return '' +
      '<div class="card mm-card" id="shadow-v27-root" data-topic="' + esc(topicId) + '" style="grid-column:1/-1">' +
      '  <div class="card-title">🧠 MINDMAP — TỔNG KẾT BÀI HỌC</div>' +
      '  <div class="mm-sub">Tổng hợp toàn bộ bài học thành một sơ đồ tư duy — đúng Lesson Framework</div>' +
      '  <div class="mm-actions">' +
      '    <button type="button" class="mm-btn mm-primary" data-mm-gen>✨ ' + (cached ? 'Tạo lại Mindmap' : 'Generate Mindmap') + '</button>' +
      '    <button type="button" class="mm-btn mm-ghost" data-mm-png ' + (cached ? '' : 'hidden') + '>⬇ Tải PNG</button>' +
      '    <span class="mm-status" data-mm-status></span>' +
      '  </div>' +
      '  <div class="mm-canvas" data-mm-canvas>' + (cached || '') + '</div>' +
      '</div>';
  }

  function wireCard(root, topicId, view) {
    var canvas = root.querySelector('[data-mm-canvas]');
    var pngBtn = root.querySelector('[data-mm-png]');
    var genBtn = root.querySelector('[data-mm-gen]');
    var status = root.querySelector('[data-mm-status]');
    function setStatus(m, c) { if (status) { status.className = 'mm-status ' + (c || ''); status.textContent = m || ''; } }

    function generate() {
      try {
        var data = collectLesson(view, topicId);
        if (!data.branches.length) { setStatus('Chưa đủ dữ liệu bài học để vẽ.', 'mm-bad'); return; }
        var svg = buildSVG(data);
        svgCache[topicId] = svg;
        if (canvas) canvas.innerHTML = svg;
        if (pngBtn) pngBtn.removeAttribute('hidden');
        if (genBtn) genBtn.textContent = '✨ Tạo lại Mindmap';
        setStatus(data.branches.length + ' nhánh từ bài học.', 'mm-ok');
      } catch (e) { setStatus('Lỗi khi tạo mindmap.', 'mm-bad'); log('gen err', e); }
    }
    if (genBtn) genBtn.onclick = generate;

    if (pngBtn) pngBtn.onclick = function () {
      try {
        var svg = svgCache[topicId]; if (!svg) return;
        var img = new Image();
        var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        img.onload = function () {
          var scale = 2, cw = 1180 * scale, ch = 860 * scale;
          var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
          var ctx = cv.getContext('2d'); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          (window.URL || window.webkitURL).revokeObjectURL(url);
          var a = document.createElement('a');
          a.download = 'mindmap-' + topicId + '.png';
          a.href = cv.toDataURL('image/png'); a.click();
          setStatus('Đã tải PNG.', 'mm-ok');
        };
        img.onerror = function () { setStatus('Không tạo được PNG (thử lại).', 'mm-bad'); };
        img.src = url;
      } catch (e) { setStatus('Không tạo được PNG.', 'mm-bad'); }
    };
  }

  function removeCard() { var o = document.getElementById('shadow-v27-root'); if (o && o.parentNode) o.parentNode.removeChild(o); }

  function run() {
    try {
      var view = activeTopicView();
      if (!view) { removeCard(); return; }
      var topicId = currentTopicId(view);
      var existing = document.getElementById('shadow-v27-root');
      if (existing && existing.getAttribute('data-topic') === topicId && view.contains(existing)) return;
      removeCard();
      view.insertAdjacentHTML('beforeend', cardHTML(topicId));
      var root = document.getElementById('shadow-v27-root');
      if (root) wireCard(root, topicId, view);
    } catch (e) { log('run err', e); }
  }

  /* ------------------------------------------------------------------ CSS */
  function injectCSS() {
    if (document.getElementById('mm-css')) return;
    var css = [
      '.mm-card .mm-sub{font-size:12px;color:var(--text-2);margin:-2px 0 14px}',
      '.mm-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}',
      '.mm-btn{appearance:none;cursor:pointer;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;transition:background .15s ease,color .15s ease}',
      '.mm-primary{border:1px solid var(--purple);background:var(--purple);color:#fff}',
      '.mm-primary:hover{background:var(--purple-2)}',
      '.mm-ghost{border:1px solid var(--border);background:transparent;color:var(--text-2)}',
      '.mm-ghost:hover{color:var(--text);border-color:var(--text-3)}',
      '.mm-ghost[hidden]{display:none}',
      '.mm-status{font-size:12px;font-weight:600}',
      '.mm-ok{color:var(--green)}.mm-bad{color:var(--orange)}',
      '.mm-canvas{width:100%;border-radius:12px;overflow:hidden}',
      '.mm-canvas svg{display:block;width:100%;height:auto}'
    ].join('');
    var s = document.createElement('style'); s.id = 'mm-css'; s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------- public API */
  window.SHADOW_V27 = {
    version: VERSION, run: run,
    collectLesson: collectLesson, buildSVG: buildSVG, wrapText: wrapText, clip: clip,
    selfTest: selfTest
  };

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }

    check('clip truncates', clip('abcdefghij', 5).length === 5 && /…$/.test(clip('abcdefghij', 5)));
    var lines = wrapText('one two three four five six', 9, 2);
    check('wrapText respects maxLines', lines.length === 2);

    var data = { name: 'Đi ăn nhà hàng', stage: 'Day 3', branches: [
      { key: 'why', icon: '🎯', label: 'WHY', color: C.green, items: ['gọi món đúng ý'] },
      { key: 'core', icon: '⭐', label: 'CORE PHRASES', color: C.yellow, items: ['Can we see the menu?'] },
      { key: 'grammar', icon: '📐', label: 'GRAMMAR', color: C.purple, items: ["I'd like to + V"] }
    ] };
    var svg = buildSVG(data);
    check('buildSVG returns <svg>', /^<svg[\s\S]*<\/svg>$/.test(svg));
    check('svg has viewBox', /viewBox="0 0 1180 860"/.test(svg));
    check('svg renders branch labels', svg.indexOf('CORE PHRASES') > -1 && svg.indexOf('GRAMMAR') > -1);
    check('svg renders center name', svg.toUpperCase().indexOf('ĐI ĂN') > -1);
    check('svg has bg rect (PNG-safe)', svg.indexOf(C.bg) > -1);
    check('no foreignObject (clean PNG)', svg.indexOf('foreignObject') === -1);

    check('does NOT touch v26', !window.SHADOW_V26 || typeof window.SHADOW_V26.getPatterns === 'function');
    check('does NOT touch v25', !window.SHADOW_V25 || typeof window.SHADOW_V25.selfTest === 'function');
    check('does NOT touch v20 engines', !window.SHADOW_V20 || typeof window.SHADOW_V20.smartNextAction === 'function');

    if (typeof document !== 'undefined' && document.createElement) {
      try { injectCSS(); } catch (e) {}
      check('css injected', !!document.getElementById('mm-css'));
    }

    try {
      console.log('%c[v27] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
      out.forEach(function (l) { log(l); });
    } catch (e) {}
    return { ok: ok, results: out };
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    run();
    window.addEventListener('hashchange', function () { setTimeout(run, 120); });
    setInterval(run, 1500);
    log('ready', VERSION, '- run SHADOW_V27.selfTest() to verify.');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 1050); });
    } else { setTimeout(boot, 1050); }
  }
})();
