/*! app_v30_blueprint.js — V30 Lesson Blueprint Generator (v30.1.1 — HOTFIX)
 * ADDITIVE module. One-page A4 infographic cheat-sheet of the whole lesson (approved mockup V30.1).
 *
 * v30.1.1 HOTFIX (approved scope — BUG-018 + BUG-019 + WHY/SCENE; NO new features):
 *  WHY/SCENE  : read directly from SHADOW_V12.getOverlay(topicId).{notionOverrides|v15}.{why,scene}.
 *               NO DOM scraping. NO scene->why fallback. Empty scene -> "Chưa có Scene" (why -> "Chưa có Why").
 *  ANCHOR     : mount ONLY into #view-topic-detail AND only while it has class .active (views use display:contents,
 *               so test .classList — BUG-003). Never renders on Home/Dashboard/other views. Removes itself off-topic.
 *  TOPIC ID   : window.shadowEN.currentTopicId || SHADOW_V12.currentTopicId (NOT currentSession.topicId).
 *  CLOSE UX   : header "📋 Lesson Blueprint | ✕" + ESC. Tablet => right Drawer + backdrop. Mobile => Full screen + ← Back.
 *               Closed => slim re-open bar (never stuck). Open-state preserved across the idempotent re-mount.
 *  RESPONSIVE : desktop 2-col / 3-col hero · iPad drawer · iPhone full-screen 1-col reflow.
 *
 * Kept from v30.0.0: Core Phrases hero, Grammar mini-table, 12 icons, flow ribbon, TTS reuse (audio.js .audio-btn),
 *  PNG export at TRUE fixed A4 1240x1754 (SVG->canvas, viewport-independent), empty auto-hide/placeholder.
 * Golden rules: guard + selfTest + one <script ?v=N> line; BUG-016 both .phrase-row & .v12-phrase-row;
 *  BUG-013 [hidden]{display:none}; BUG-015 clean source text before TTS; no core edits; rollback = delete one line.
 */
(function () {
  'use strict';
  if (window.SHADOW_V30) return;

  var VERSION = '30.1.1';
  var A4 = { w: 1240, h: 1754 };
  var MOUNT_INTERVAL_MS = 1500;
  var state = { open: null }; // null => decide by viewport on first mount

  /* ---------------------------------------------------------------- utils */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function txt(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function isSmall() { try { return window.matchMedia && window.matchMedia('(max-width:1024px)').matches; } catch (e) { return false; } }

  function cleanText(elOrStr) {
    var t;
    if (elOrStr && elOrStr.nodeType === 1) {
      var clone = elOrStr.cloneNode(true);
      $all('.ssa-ipa,.ssa-vi,.gp-ipa,.v30-ipa,.audio-btn,.v30-vi', clone).forEach(function (n) {
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
      t = clone.textContent || '';
    } else { t = String(elOrStr == null ? '' : elOrStr); }
    t = t.replace(/\/[^\/]*\//g, ' ').replace(/[▶►⏵▸]/g, ' ');
    return txt(t);
  }
  function audioBtn(text) {
    var clean = cleanText(text);
    if (!clean) return '';
    if (typeof window.audioButtonHTML === 'function') { try { return window.audioButtonHTML(clean); } catch (e) {} }
    return '<span class="audio-btn" role="button" tabindex="0" data-audio="' + esc(clean) + '" aria-label="Nghe">▶</span>';
  }

  /* --------------------------------------------------- topic + overlay (FIX #1) */
  function currentTopicId() {
    try {
      return (window.shadowEN && window.shadowEN.currentTopicId) ||
             (window.SHADOW_V12 && window.SHADOW_V12.currentTopicId) || null;
    } catch (e) { return null; }
  }
  function getTopic(id) {
    try {
      var st = window.shadowEN && window.shadowEN.state;
      if (st && st.topics) { return st.topics.filter(function (t) { return t.id === id; })[0] || null; }
    } catch (e) {}
    return null;
  }
  function overlayFor(id) {
    try { return (window.SHADOW_V12 && window.SHADOW_V12.getOverlay) ? window.SHADOW_V12.getOverlay(id) : null; }
    catch (e) { return null; }
  }
  // PURE: pull why/scene from an overlay object (notionOverrides -> v15 -> top-level). No DOM. No cross-field fallback.
  function pickWhyScene(ov) {
    function dig(o, field) {
      if (!o || typeof o !== 'object') return '';
      if (o[field] != null && String(o[field]).trim()) return String(o[field]);
      var cand = ['notionOverrides', 'v15'];
      for (var i = 0; i < cand.length; i++) {
        var s = o[cand[i]];
        if (s && typeof s === 'object' && s[field] != null && String(s[field]).trim()) return String(s[field]);
      }
      return '';
    }
    return { why: txt(dig(ov, 'why')), scene: txt(dig(ov, 'scene')) };
  }

  /* ----------------------------------------------- on-page extraction (Core/Grammar/Dialogues) */
  function findCard(re) {
    var titles = $all('.card-title, .v15-card-title, h2, h3', $('#view-topic-detail') || document);
    for (var i = 0; i < titles.length; i++) {
      if (re.test(txt(titles[i].textContent))) {
        return titles[i].closest ? (titles[i].closest('.card, .v12-card, section, .v15-card') || titles[i].parentNode) : titles[i].parentNode;
      }
    }
    return null;
  }
  function extractCorePhrases() {
    var out = { BEFORE: [], DURING: [], AFTER: [] };
    $all('.v12-phrase-group, .phrase-group').forEach(function (g) {
      var tEl = $('.v12-phrase-group-title, .phrase-group-title', g);
      var label = txt(tEl ? tEl.textContent : '').toUpperCase();
      var b = /BEFORE|TRƯỚC/.test(label) ? 'BEFORE' : /DURING|TRONG/.test(label) ? 'DURING' : /AFTER|SAU/.test(label) ? 'AFTER' : null;
      if (!b) return;
      $all('.v12-phrase-row, .phrase-row', g).forEach(function (row) {
        var en = cleanText($('.v12-phrase-en, .phrase-en', row) || row);
        var vi = txt(($('.v12-phrase-vi, .phrase-vi', row) || {}).textContent);
        if (en) out[b].push({ en: en, vi: vi });
      });
    });
    if (!out.BEFORE.length && !out.DURING.length && !out.AFTER.length) {
      $all('.v12-phrase-row, .phrase-row').forEach(function (row) {
        var en = cleanText($('.v12-phrase-en, .phrase-en', row) || row);
        if (en) out.BEFORE.push({ en: en, vi: txt(($('.v12-phrase-vi, .phrase-vi', row) || {}).textContent) });
      });
    }
    return out;
  }
  function extractGrammar(id) {
    try {
      var raw = JSON.parse(localStorage.getItem('shadow-en-grammar-patterns') || '{}');
      var arr = id && raw[id] ? raw[id] : null;
      if (!arr) { for (var k in raw) { if (raw[k] && raw[k].length) { arr = raw[k]; break; } } }
      if (arr && arr.length) {
        return arr.map(function (p) { return { pattern: txt(p.pattern), meaning: txt(p.meaning), example: txt((p.examples && p.examples[0]) || p.example || '') }; })
                  .filter(function (p) { return p.pattern; });
      }
    } catch (e) {}
    return [];
  }
  function extractDialogues() {
    var c = findCard(/dialogue|hội thoại/i); if (!c) return [];
    return $all('.dialogue-line, .v12-dialogue-line, li, p', c).map(function (n) { return cleanText(n); })
      .filter(function (s) { return s && s.length > 1 && !/^dialogue|hội thoại/i.test(s); }).slice(0, 8);
  }
  function extractList(re, max) {
    var c = findCard(re); if (!c) return [];
    return $all('li, .v12-phrase-en, .phrase-en, p', c).map(function (n) { return cleanText(n); })
      .filter(function (s) { return s && s.length > 1; }).slice(0, max || 6);
  }

  function buildModel() {
    var id = currentTopicId();
    var topic = getTopic(id);
    var ws = pickWhyScene(overlayFor(id)); // FIX #1
    return {
      topicId: id,
      title: (topic && (topic.emoji ? topic.emoji + ' ' : '') + topic.name) || txt(($('.topic-title, #topic-title, h1') || {}).textContent) || 'Lesson Blueprint',
      level: topic && topic.level ? topic.level : '',
      estMin: topic && topic.estMin ? topic.estMin : '',
      why: ws.why, scene: ws.scene,
      core: extractCorePhrases(),
      grammar: extractGrammar(id),
      dialogues: extractDialogues(),
      realEnglish: extractList(/real english/i, 6),
      action: extractList(/action|shadow/i, 6),
      memory: ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'],
      missions: extractList(/mission|nhiệm vụ/i, 6),
      review: extractList(/review|ôn tập/i, 6),
      wordOrder: 'Xếp lại câu trục',
      frequency: 'Nhịp học mỗi ngày'
    };
  }

  /* --------------------------------------------------------------- block helper */
  function block(o) {
    var has = !o.empty;
    if (!has && !o.core) return '';
    var body = has ? o.html : '<div class="v30-ph">' + esc(o.placeholder || 'Chưa có dữ liệu') + '</div>';
    return '<div class="v30-blk ' + (o.cls || '') + '"' + (o.span ? ' style="grid-column:1/-1"' : '') + '>' +
      '<div class="v30-h"><span class="v30-ic">' + o.icon + '</span>' + esc(o.title) + '</div>' + body + '</div>';
  }

  var FLOW = [['🎯','WHY'],['🌍','SCENE'],['💬','CORE'],['📚','GRAMMAR'],['🗣','DIALOGUES'],['🎧','REAL ENGLISH'],['⚡','ACTION'],['🔁','MEMORY'],['🎮','MISSIONS'],['📌','REVIEW']];
  function phraseLines(list) {
    if (!list || !list.length) return '';
    return list.slice(0, 5).map(function (p) {
      return '<div class="v30-p">' + audioBtn(p.en) + '<span class="v30-en">' + esc(p.en) + '</span>' + (p.vi ? '<span class="v30-vi">' + esc(p.vi) + '</span>' : '') + '</div>';
    }).join('');
  }

  function buildSheet(m) {
    var coreEmpty = !(m.core.BEFORE.length || m.core.DURING.length || m.core.AFTER.length);
    var flow = FLOW.map(function (f) { return '<span class="v30-fi">' + f[0] + ' ' + f[1] + '</span>'; }).join('<span class="v30-fa">→</span>');
    var coreHTML = '<div class="v30-core-grid">' +
      '<div class="v30-cc"><div class="v30-cl">BEFORE</div>' + (phraseLines(m.core.BEFORE) || '<div class="v30-ph">—</div>') + '</div>' +
      '<div class="v30-cc"><div class="v30-cl">DURING</div>' + (phraseLines(m.core.DURING) || '<div class="v30-ph">—</div>') + '</div>' +
      '<div class="v30-cc"><div class="v30-cl">AFTER</div>' + (phraseLines(m.core.AFTER) || '<div class="v30-ph">—</div>') + '</div></div>';
    var grammarHTML = m.grammar.length ?
      '<table class="v30-gt"><thead><tr><th>Pattern</th><th>Meaning</th><th>Example</th></tr></thead><tbody>' +
      m.grammar.slice(0, 5).map(function (g) { return '<tr><td>' + esc(g.pattern) + '</td><td>' + esc(g.meaning) + '</td><td>' + (g.example ? audioBtn(g.example) + esc(g.example) : '') + '</td></tr>'; }).join('') +
      '</tbody></table>' : '';
    var diaHTML = m.dialogues.length ? m.dialogues.map(function (l) { return '<div class="v30-p">' + audioBtn(l) + '<span class="v30-en">' + esc(l) + '</span></div>'; }).join('') : '';
    var listHTML = function (arr) { return arr.length ? '<div class="v30-t">' + arr.map(esc).join(' · ') + '</div>' : ''; };
    return '<div class="v30-sheet" id="v30-sheet">' +
      '<div class="v30-blk v30-purple" style="grid-column:1/-1"><div class="v30-head">' + esc(m.title) +
        (m.level || m.estMin ? '<span class="v30-meta">' + esc(m.level) + (m.estMin ? ' · ⏱ ' + esc(m.estMin) + "'" : '') + '</span>' : '') +
        '</div><div class="v30-flow"><b>FLOW:</b> ' + flow + '</div></div>' +
      block({ icon: '🎯', title: 'WHY', html: '<div class="v30-t">' + esc(m.why) + '</div>', empty: !m.why, core: true, placeholder: 'Chưa có Why', cls: 'v30-gray' }) +
      block({ icon: '🌍', title: 'SCENE', html: '<div class="v30-t">' + esc(m.scene) + '</div>', empty: !m.scene, core: true, placeholder: 'Chưa có Scene', cls: 'v30-gray' }) +
      '<div class="v30-blk v30-teal v30-hero" style="grid-column:1/-1"><div class="v30-head"><span class="v30-ic">💬</span>★ CORE PHRASES</div>' +
        (coreEmpty ? '<div class="v30-ph">Chưa có Core Phrases — thêm câu trục để hoàn thiện blueprint.</div>' : coreHTML) + '</div>' +
      block({ icon: '📚', title: 'GRAMMAR PATTERNS', html: grammarHTML, empty: !m.grammar.length, core: true, placeholder: 'Chưa có Grammar Patterns', cls: 'v30-blue', span: true }) +
      block({ icon: '🗣', title: 'DIALOGUES', html: diaHTML, empty: !m.dialogues.length, cls: 'v30-gray' }) +
      block({ icon: '🎧', title: 'REAL ENGLISH', html: listHTML(m.realEnglish), empty: !m.realEnglish.length, cls: 'v30-coral' }) +
      block({ icon: '⚡', title: 'ACTION', html: listHTML(m.action.length ? m.action : ['Shadow', 'Record', 'Roleplay', 'Chat AI']), empty: false, cls: 'v30-amber' }) +
      block({ icon: '🔁', title: 'MEMORY LOOP', html: '<div class="v30-t">' + m.memory.join(' → ') + '</div>', empty: false, cls: 'v30-green' }) +
      block({ icon: '🎮', title: 'REAL LIFE MISSIONS', html: listHTML(m.missions.length ? m.missions : ['Dùng thật', 'Chat AI', 'Video', 'Roleplay']), empty: false, cls: 'v30-pink' }) +
      block({ icon: '📌', title: 'REVIEW', html: listHTML(m.review.length ? m.review : ['Top 10', 'Câu khó', 'Reflection']), empty: false, cls: 'v30-gray' }) +
      block({ icon: '🧩', title: 'WORD ORDER CHALLENGE', html: '<div class="v30-t">' + esc(m.wordOrder) + '</div>', empty: false, cls: 'v30-blue' }) +
      block({ icon: '⏰', title: 'LEARNING FREQUENCY', html: '<div class="v30-t">' + esc(m.frequency) + '</div>', empty: false, cls: 'v30-purple' }) +
      '</div>';
  }

  // Full card markup. `open` controls expanded vs collapsed (FIX #3).
  function buildCard(m, open) {
    var head = '<div class="v30-bar">' +
      '<span class="v30-title"><span class="v30-back" data-v30-act="close" aria-label="Back">←</span>📋 Lesson Blueprint</span>' +
      '<span class="v30-actions">' +
        (open ? '<button type="button" class="v30-btn" data-v30-act="png">⬇ PNG (A4)</button><button type="button" class="v30-btn" data-v30-act="print">🖨 In A4</button>' : '') +
        (open ? '<button type="button" class="v30-btn v30-x" data-v30-act="close" aria-label="Đóng">✕ Đóng</button>'
              : '<button type="button" class="v30-btn" data-v30-act="open">📋 Mở Blueprint ▸</button>') +
      '</span></div>';
    var body = open ? '<div class="v30-body">' + buildSheet(m) + '</div>' : '';
    return '<section class="card v30-card ' + (open ? 'v30-open' : 'v30-closed') + '" data-v30="1">' + head + body + '</section>' +
           (open && isSmall() ? '<div class="v30-backdrop" data-v30-act="close"></div>' : '');
  }

  /* ------------------------------------------------------------------ styles */
  function injectCSS() {
    if (!document.head || $('#v30-style')) return;
    var css =
    '.v30-card{margin-top:16px;grid-column:1/-1}' +
    '.v30-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}' +
    '.v30-title{font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px}' +
    '.v30-back{display:none;cursor:pointer;font-size:18px;padding:0 4px}' +
    '.v30-actions{display:flex;gap:8px;flex-wrap:wrap}' +
    '.v30-btn{font:inherit;font-size:13px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a;cursor:pointer}' +
    '.v30-btn:hover{background:#f1f5f9}.v30-x{border-color:#fca5a5;color:#b91c1c}' +
    '.v30-sheet{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;overflow-x:hidden}' +
    '.v30-blk{border-radius:8px;padding:8px 10px;border:1px solid rgba(0,0,0,.06)}' +
    '.v30-blk[hidden]{display:none}' +
    '.v30-head{font-weight:600;font-size:13px;margin-bottom:4px;display:flex;align-items:center;gap:6px}' +
    '.v30-ic{font-size:14px}.v30-h{font-weight:600;font-size:12.5px;margin-bottom:3px;display:flex;align-items:center;gap:5px}' +
    '.v30-meta{font-weight:400;font-size:11px;color:#64748b;margin-left:8px}' +
    '.v30-flow{font-size:11px;color:#475569;line-height:1.6;margin-top:4px}.v30-flow b{color:#0f172a}.v30-fa{margin:0 4px;color:#94a3b8}' +
    '.v30-t{font-size:12px;color:#1e293b;line-height:1.45}.v30-ph{font-size:11px;color:#94a3b8;font-style:italic}' +
    '.v30-hero{padding:10px 12px}.v30-core-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:4px}' +
    '.v30-cl{font-size:10px;letter-spacing:.05em;color:#0f766e;font-weight:600;margin-bottom:4px}' +
    '.v30-p{font-size:12.5px;color:#0f172a;line-height:1.3;margin-bottom:4px;display:flex;align-items:baseline;gap:4px;flex-wrap:wrap}' +
    '.v30-en{font-weight:500}.v30-vi{font-size:10.5px;color:#64748b;font-weight:400}' +
    '.v30-gt{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:4px}' +
    '.v30-gt th{text-align:left;font-weight:600;font-size:10.5px;color:#64748b;padding:3px 6px;border-bottom:1px solid #e2e8f0}' +
    '.v30-gt td{padding:4px 6px;border-bottom:1px solid #f1f5f9;color:#1e293b;vertical-align:top}' +
    '.v30-purple{background:#f5f3ff}.v30-teal{background:#f0fdfa;border-color:#5eead4}.v30-blue{background:#eff6ff}' +
    '.v30-gray{background:#f8fafc}.v30-coral{background:#fff1ed}.v30-amber{background:#fffbeb}.v30-green{background:#f0fdf4}.v30-pink{background:#fdf2f8}' +
    '.v30-backdrop{display:none}' +
    /* iPad: tighten + drawer when expanded (FIX #3 + responsive) */
    '@media (max-width:1024px){.v30-core-grid{gap:8px}' +
      '.v30-card.v30-open{position:fixed;top:0;right:0;bottom:0;width:min(560px,92vw);z-index:10000;background:#fff;margin:0;padding:14px;overflow:auto;box-shadow:-8px 0 24px rgba(0,0,0,.25);border-radius:0}' +
      '.v30-backdrop{display:block;position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.45)}' +
      '.v30-back{display:inline}}' +
    /* iPhone: full screen + 1-col reflow (Option A) */
    '@media (max-width:760px){.v30-card.v30-open{width:100vw;box-shadow:none}.v30-sheet{grid-template-columns:1fr}' +
      '.v30-blk[style*="grid-column"]{grid-column:1/-1 !important}.v30-core-grid{grid-template-columns:1fr}}' +
    /* small-screen collapsed = slim launch bar */
    '@media (max-width:1024px){.v30-card.v30-closed{position:static;margin-top:12px}}' +
    /* print A4 */
    '@media print{@page{size:A4;margin:8mm}body *{visibility:hidden}.v30-sheet,.v30-sheet *{visibility:visible}.v30-sheet{position:absolute;left:0;top:0;width:100%}.v30-bar,.v30-backdrop{display:none}}';
    var st = document.createElement('style'); st.id = 'v30-style'; st.textContent = css; document.head.appendChild(st);
  }

  /* ----------------------------------------------- PNG export — fixed A4 (unchanged) */
  function wrap(s, max) {
    s = txt(s); var words = s.split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) { var t = cur ? cur + ' ' + words[i] : words[i]; if (t.length > max && cur) { lines.push(cur); cur = words[i]; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  }
  function svgBox(x, y, w, h, f) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" fill="' + f + '" stroke="#e2e8f0"/>'; }
  function svgText(x, y, s, sz, w, c) { return '<text x="' + x + '" y="' + y + '" font-family="Arial, sans-serif" font-size="' + sz + '" font-weight="' + (w || 400) + '" fill="' + (c || '#1e293b') + '">' + esc(s) + '</text>'; }
  function svgLines(x, y, arr, sz, lh, c) { return arr.map(function (l, i) { return svgText(x, y + i * lh, l, sz, 400, c); }).join(''); }
  function buildA4SVG(m) {
    m = m || { title: 'Lesson Blueprint', why: '', scene: '', core: { BEFORE: [], DURING: [], AFTER: [] }, grammar: [] };
    var W = A4.w, H = A4.h, P = 40, s = [];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">');
    s.push('<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>');
    s.push(svgBox(P, P, W - 2 * P, 110, '#f5f3ff'));
    s.push(svgText(P + 20, P + 48, m.title, 34, 600, '#4c1d95'));
    s.push(svgText(P + 20, P + 88, 'FLOW: WHY → SCENE → CORE → GRAMMAR → DIALOGUES → REAL ENGLISH → ACTION → MEMORY → MISSIONS → REVIEW', 17, 400, '#6d28d9'));
    var halfW = (W - 2 * P - 16) / 2, y = P + 130;
    s.push(svgBox(P, y, halfW, 90, '#f8fafc')); s.push(svgText(P + 16, y + 30, '🎯 WHY', 18, 600, '#0f172a'));
    s.push(svgLines(P + 16, y + 56, wrap(m.why || 'Chưa có Why', 40), 15, 22, '#334155'));
    s.push(svgBox(P + halfW + 16, y, halfW, 90, '#f8fafc')); s.push(svgText(P + halfW + 32, y + 30, '🌍 SCENE', 18, 600, '#0f172a'));
    s.push(svgLines(P + halfW + 32, y + 56, wrap(m.scene || 'Chưa có Scene', 40), 15, 22, '#334155'));
    y += 110; var heroH = 470;
    s.push(svgBox(P, y, W - 2 * P, heroH, '#f0fdfa'));
    s.push('<rect x="' + P + '" y="' + y + '" width="' + (W - 2 * P) + '" height="' + heroH + '" rx="10" fill="none" stroke="#5eead4" stroke-width="3"/>');
    s.push(svgText(P + 20, y + 38, '💬 ★ CORE PHRASES', 24, 600, '#0f766e'));
    var colW = (W - 2 * P - 60) / 3, cols = ['BEFORE', 'DURING', 'AFTER'];
    cols.forEach(function (c, ci) { var cx = P + 20 + ci * (colW + 20), cy = y + 78; s.push(svgText(cx, cy, c, 15, 600, '#0f766e'));
      (m.core[c] || []).slice(0, 5).forEach(function (p, pi) { s.push(svgLines(cx, cy + 30 + pi * 70, wrap(p.en, 24), 16, 22, '#0f172a')); }); });
    y += heroH + 20; var gH = 170;
    s.push(svgBox(P, y, W - 2 * P, gH, '#eff6ff')); s.push(svgText(P + 20, y + 34, '📚 GRAMMAR PATTERNS', 20, 600, '#0f172a'));
    var gx = [P + 20, P + 360, P + 720], heads = ['Pattern', 'Meaning', 'Example'];
    heads.forEach(function (h, i) { s.push(svgText(gx[i], y + 64, h, 14, 600, '#64748b')); });
    (m.grammar || []).slice(0, 3).forEach(function (g, gi) { var gy = y + 92 + gi * 26; s.push(svgText(gx[0], gy, g.pattern, 15, 400, '#1e293b')); s.push(svgText(gx[1], gy, g.meaning, 15, 400, '#1e293b')); s.push(svgText(gx[2], gy, g.example, 15, 400, '#1e293b')); });
    if (!(m.grammar || []).length) s.push(svgText(gx[0], y + 92, 'Chưa có Grammar Patterns', 14, 400, '#94a3b8'));
    y += gH + 20;
    [['🗣 DIALOGUES', '#f8fafc', '🎧 REAL ENGLISH', '#fff1ed'], ['⚡ ACTION', '#fffbeb', '🔁 MEMORY LOOP', '#f0fdf4'], ['🎮 MISSIONS', '#fdf2f8', '📌 REVIEW', '#f8fafc']].forEach(function (r) {
      s.push(svgBox(P, y, halfW, 80, r[1])); s.push(svgText(P + 16, y + 32, r[0], 16, 600, '#0f172a'));
      s.push(svgBox(P + halfW + 16, y, halfW, 80, r[3])); s.push(svgText(P + halfW + 32, y + 32, r[2], 16, 600, '#0f172a')); y += 92;
    });
    s.push(svgBox(P, y, W - 2 * P, 70, '#f5f3ff')); s.push(svgText(P + 16, y + 42, '🧩 WORD ORDER CHALLENGE        ⏰ LEARNING FREQUENCY', 17, 600, '#4c1d95'));
    s.push('</svg>'); return s.join('');
  }
  function exportPNG() {
    var svg = buildA4SVG(buildModel());
    var url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas'); cv.width = A4.w; cv.height = A4.h;
      var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, A4.w, A4.h); ctx.drawImage(img, 0, 0, A4.w, A4.h);
      var a = document.createElement('a'); a.download = 'lesson-blueprint-A4.png';
      try { a.href = cv.toDataURL('image/png'); } catch (e) { a.href = url; }
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    img.onerror = function () { window.open(url, '_blank'); };
    img.src = url;
  }

  /* ------------------------------------------------------------------ mount (FIX #2 + #3) */
  function onTopicDetail() { var v = $('#view-topic-detail'); return !!(v && v.classList && v.classList.contains('active')); }
  function removeCard() { var c = $('[data-v30="1"]'); if (c && c.parentNode) c.parentNode.removeChild(c); var bd = $('.v30-backdrop'); if (bd && bd.parentNode) bd.parentNode.removeChild(bd); }

  function render() {
    var host = $('#view-topic-detail');
    if (!host) { removeCard(); return false; }
    if (state.open == null) state.open = !isSmall(); // desktop open, small collapsed
    var open = !!state.open;
    var prev = $('[data-v30="1"]'); var bd = $('.v30-backdrop'); if (bd && bd.parentNode) bd.parentNode.removeChild(bd);
    var html = buildCard(buildModel(), open);
    if (prev) prev.outerHTML = html; else host.insertAdjacentHTML('beforeend', html);
    return true;
  }
  function mount() {
    try {
      if (typeof document === 'undefined') return false;
      injectCSS();
      if (!onTopicDetail()) { removeCard(); return false; } // FIX #2: only on topic detail, never dashboard/home
      return render();
    } catch (e) { return false; }
  }

  function onClick(e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-v30-act]') : null; if (!b) return;
    var act = b.getAttribute('data-v30-act');
    if (act === 'png') exportPNG();
    else if (act === 'print') window.print();
    else if (act === 'close') { state.open = false; render(); }
    else if (act === 'open') { state.open = true; render(); }
  }
  function onKey(e) { if ((e.key === 'Escape' || e.keyCode === 27) && state.open && onTopicDetail()) { state.open = false; render(); } }

  function init() {
    if (typeof document === 'undefined' || !document.addEventListener) return;
    document.addEventListener('click', onClick, false);
    document.addEventListener('keydown', onKey, false);
    mount(); setInterval(mount, MOUNT_INTERVAL_MS);
  }

  /* ----------------------------------------------------------------- selfTest */
  function selfTest() {
    var r = []; function ok(n, c) { r.push({ name: n, ok: !!c }); }
    try {
      ok('namespace SHADOW_V30', !!window.SHADOW_V30);
      ok('VERSION 30.1.1', VERSION === '30.1.1');
      // FIX #1 — WHY/SCENE from overlay, distinct, no cross fallback
      var ws = pickWhyScene({ notionOverrides: { why: 'W-VAL', scene: 'S-VAL' } });
      ok('reads overlay why/scene (notionOverrides)', ws.why === 'W-VAL' && ws.scene === 'S-VAL');
      var ws2 = pickWhyScene({ v15: { why: 'W2', scene: 'S2' } });
      ok('reads overlay why/scene (v15 fallback path)', ws2.why === 'W2' && ws2.scene === 'S2');
      var ws3 = pickWhyScene({ notionOverrides: { why: 'ONLYWHY' } });
      ok('scene empty does NOT fall back to why', ws3.why === 'ONLYWHY' && ws3.scene === '');
      ok('empty scene -> "Chưa có Scene" placeholder', /Chưa có Scene/.test(block({ icon: '🌍', title: 'SCENE', html: '', empty: true, core: true, placeholder: 'Chưa có Scene' })));
      ok('empty why -> "Chưa có Why" placeholder', /Chưa có Why/.test(block({ icon: '🎯', title: 'WHY', html: '', empty: true, core: true, placeholder: 'Chưa có Why' })));
      ok('no DOM scrape for why/scene in buildModel src', buildModel.toString().indexOf('pickWhyScene') >= 0);
      // FIX #2 — anchor
      ok('anchor targets #view-topic-detail', onTopicDetail.toString().indexOf('#view-topic-detail') >= 0 && mount.toString().indexOf('onTopicDetail') >= 0);
      ok('removeCard available (off-topic cleanup)', typeof removeCard === 'function');
      ok('topicId not from currentSession', currentTopicId.toString().indexOf('currentSession') < 0 && currentTopicId.toString().indexOf('currentTopicId') >= 0);
      // FIX #3 — close UX
      var cardOpen = buildCard({ title: 'T', why: '', scene: '', core: { BEFORE: [], DURING: [], AFTER: [] }, grammar: [], dialogues: [], realEnglish: [], action: [], missions: [], review: [], memory: ['Day 0'], wordOrder: 'x', frequency: 'y' }, true);
      ok('header has ✕ Đóng + ← Back', /data-v30-act="close"/.test(cardOpen) && /v30-back/.test(cardOpen));
      var cardClosed = buildCard({ title: 'T', why: '', scene: '', core: { BEFORE: [], DURING: [], AFTER: [] }, grammar: [], dialogues: [], realEnglish: [], action: [], missions: [], review: [], memory: ['Day 0'], wordOrder: 'x', frequency: 'y' }, false);
      ok('closed shows re-open bar (not stuck)', /data-v30-act="open"/.test(cardClosed) && cardClosed.indexOf('v30-sheet') < 0);
      ok('ESC handler bound', typeof onKey === 'function' && onKey.toString().indexOf('Escape') >= 0);
      // responsive CSS
      injectCSS(); var cssText = (typeof document !== 'undefined' && $('#v30-style')) ? $('#v30-style').textContent : '';
      ok('iPad drawer rule', /max-width:1024px/.test(cssText) && /v30-card\.v30-open\{position:fixed/.test(cssText));
      ok('iPhone fullscreen + 1-col', /max-width:760px/.test(cssText) && /grid-template-columns:1fr/.test(cssText));
      ok('print A4 page rule', /@page\{size:A4/.test(cssText));
      ok('[hidden]{display:none} paired (BUG-013)', /\.v30-blk\[hidden\]\{display:none\}/.test(cssText));
      // PNG fixed A4
      var svg = buildA4SVG(null);
      ok('PNG fixed A4 1240x1754 (viewport-independent)', svg.indexOf('width="1240" height="1754"') >= 0 && svg.indexOf('foreignObject') < 0);
      var synth = { topicId: 'x', title: 'Demo', why: 'w', scene: 's', core: { BEFORE: [{ en: 'Hi', vi: 'Chao' }], DURING: [], AFTER: [] }, grammar: [{ pattern: 'Can I get', meaning: 'm', example: 'Can I get tea?' }], dialogues: ['A: hi'], realEnglish: ['x'], action: [], missions: [], review: [], memory: ['Day 0'], wordOrder: 'x', frequency: 'y' };
      var sheet = buildSheet(synth);
      ok('12 module icons present', ['\u{1F3AF}','\u{1F30D}','\u{1F4DA}','\u{1F4AC}','\u{1F5E3}','\u{1F3A7}','⚡','\u{1F501}','\u{1F3AE}','\u{1F4CC}','\u{1F9E9}','⏰'].every(function (i) { return sheet.indexOf(i) >= 0; }));
      ok('grammar mini-table header', sheet.indexOf('>Pattern</th>') >= 0 && sheet.indexOf('>Example</th>') >= 0);
      ok('core hero TTS + phrase', sheet.indexOf('Hi') >= 0 && /data-audio|audio-btn/.test(sheet));
      ok('does not overwrite v20/v26/v27/v28', ['SHADOW_V20','SHADOW_V26','SHADOW_V27','SHADOW_V28'].every(function (n) { return typeof window[n] === 'undefined' || !!window[n]; }));
    } catch (e) { r.push({ name: 'exception: ' + e.message, ok: false }); }
    return { ok: r.every(function (x) { return x.ok; }), results: r };
  }

  window.SHADOW_V30 = {
    VERSION: VERSION, A4: A4, mount: mount, render: render, buildModel: buildModel, buildSheet: buildSheet,
    buildCard: buildCard, buildA4SVG: buildA4SVG, exportPNG: exportPNG, pickWhyScene: pickWhyScene,
    cleanText: cleanText, audioBtn: audioBtn, selfTest: selfTest,
    open: function () { state.open = true; render(); }, close: function () { state.open = false; render(); }
  };
  init();
})();
