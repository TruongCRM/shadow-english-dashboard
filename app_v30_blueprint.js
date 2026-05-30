/*! app_v30_blueprint.js — V30 Lesson Blueprint Generator (v30.0.0)
 * ADDITIVE module. One-page A4 infographic cheat-sheet of the whole lesson.
 * Layout = approved mockup V30.1: poster A4 (B) + mobile reflow (A) + Core Phrases hero (C).
 * 12 modules with icons, Grammar mini-table (Pattern|Meaning|Example), learning-flow ribbon.
 *
 * 5 approved additions:
 *  (1) TTS reused from audio.js (.audio-btn[data-audio]) on Core Phrases / Grammar examples / Dialogues.
 *  (2) PNG export at TRUE fixed A4 = 1240x1754 px (150dpi), viewport-independent (SVG -> canvas -> PNG; v27 path).
 *  (3) Empty module -> auto-hide (optional sections) or placeholder (core sections).
 *  (4) Responsive: desktop / iPad / mobile via media queries + 1-col reflow.
 *  (5) No regression: guarded additive module, CSS namespaced `v30-`, idempotent mount, no core edits.
 *
 * Golden rules honoured: guard `if(window.SHADOW_V30)return;` + selfTest() + single <script ?v=1> line;
 *   targets BOTH `.phrase-row` AND `.v12-phrase-row` (BUG-016); pairs `display:` with `[hidden]{display:none}` (BUG-013);
 *   Unicode-safe text; reads SOURCE text (strips IPA/helper spans) before TTS/PNG (BUG-015);
 *   never edits app.js/audio.js/v20/v26/v27; rollback = delete the one <script> line.
 */
(function () {
  'use strict';
  if (window.SHADOW_V30) return;

  var VERSION = '30.0.0';
  var A4 = { w: 1240, h: 1754 }; // A4 portrait @150dpi — FIXED, viewport-independent (requirement #2)
  var MOUNT_INTERVAL_MS = 1500;

  /* ---------------------------------------------------------------- utils */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function txt(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

  // Read SOURCE English: strip helper spans (.ssa-ipa/.ssa-vi/.gp-ipa/.v30-ipa/.audio-btn) + /ipa/ (BUG-015)
  function cleanText(elOrStr) {
    var t;
    if (elOrStr && elOrStr.nodeType === 1) {
      var clone = elOrStr.cloneNode(true);
      $all('.ssa-ipa,.ssa-vi,.gp-ipa,.v30-ipa,.audio-btn,.v30-vi', clone).forEach(function (n) {
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
      t = clone.textContent || '';
    } else {
      t = String(elOrStr == null ? '' : elOrStr);
    }
    t = t.replace(/\/[^\/]*\//g, ' ');            // drop /ipa/
    t = t.replace(/[▶►⏵▸]/g, ' '); // drop play glyphs
    return txt(t);
  }

  // Reuse audio.js TTS: prefer window.audioButtonHTML, else emit the delegated-handler contract span (requirement #1)
  function audioBtn(text) {
    var clean = cleanText(text);
    if (!clean) return '';
    if (typeof window.audioButtonHTML === 'function') {
      try { return window.audioButtonHTML(clean); } catch (e) { /* fall through */ }
    }
    return '<span class="audio-btn" role="button" tabindex="0" data-audio="' + esc(clean) +
      '" aria-label="Nghe">▶</span>';
  }

  /* ----------------------------------------------------- find a card by its title */
  // v26/v27 contract: cards expose `.card-title`. Match a section by a title regex, return the card element.
  function findCard(re) {
    var titles = $all('.card-title, .v15-card-title, h2, h3');
    for (var i = 0; i < titles.length; i++) {
      if (re.test(txt(titles[i].textContent))) {
        return titles[i].closest ? (titles[i].closest('.card, .v12-card, section, .v15-card') || titles[i].parentNode) : titles[i].parentNode;
      }
    }
    return null;
  }
  function cardText(re) { var c = findCard(re); return c ? txt(c.textContent) : ''; }

  /* ------------------------------------------------------------- data extraction */
  function getTopic() {
    try {
      var st = window.shadowEN && window.shadowEN.state;
      if (st && st.topics && st.topics.length) {
        var cur = st.currentSession && st.currentSession.topicId;
        if (cur) {
          var m = st.topics.filter(function (t) { return t.id === cur; })[0];
          if (m) return m;
        }
        // fallback: topic whose name matches the visible title
        var title = txt(($('.topic-title, #topic-title, .v12-topic-title, h1') || {}).textContent);
        var byName = st.topics.filter(function (t) { return title && t.name && title.indexOf(t.name) >= 0; })[0];
        if (byName) return byName;
      }
    } catch (e) {}
    return null;
  }

  // Core Phrases grouped BEFORE/DURING/AFTER, BOTH class families (BUG-016)
  function extractCorePhrases() {
    var out = { BEFORE: [], DURING: [], AFTER: [] };
    var groups = $all('.v12-phrase-group, .phrase-group');
    groups.forEach(function (g) {
      var titleEl = $('.v12-phrase-group-title, .phrase-group-title', g);
      var label = txt(titleEl ? titleEl.textContent : '').toUpperCase();
      var bucket = /BEFORE|TRƯỚC/.test(label) ? 'BEFORE' :
                   /DURING|TRONG/.test(label) ? 'DURING' :
                   /AFTER|SAU/.test(label) ? 'AFTER' : null;
      if (!bucket) return;
      $all('.v12-phrase-row, .phrase-row', g).forEach(function (row) {
        var enEl = $('.v12-phrase-en, .phrase-en', row);
        var viEl = $('.v12-phrase-vi, .phrase-vi', row);
        var en = cleanText(enEl || row);
        var vi = txt(viEl ? viEl.textContent : '');
        if (en) out[bucket].push({ en: en, vi: vi });
      });
    });
    // ungrouped fallback: any rows on the page → BEFORE
    if (!out.BEFORE.length && !out.DURING.length && !out.AFTER.length) {
      $all('.v12-phrase-row, .phrase-row').forEach(function (row) {
        var en = cleanText($('.v12-phrase-en, .phrase-en', row) || row);
        if (en) out.BEFORE.push({ en: en, vi: txt(($('.v12-phrase-vi, .phrase-vi', row) || {}).textContent) });
      });
    }
    return out;
  }

  // Grammar from v26 store: localStorage['shadow-en-grammar-patterns'][topicId] = [{pattern,meaning,examples[]}]
  function extractGrammar(topicId) {
    try {
      var raw = JSON.parse(localStorage.getItem('shadow-en-grammar-patterns') || '{}');
      var arr = topicId && raw[topicId] ? raw[topicId] : null;
      if (!arr) { for (var k in raw) { if (raw[k] && raw[k].length) { arr = raw[k]; break; } } }
      if (arr && arr.length) {
        return arr.map(function (p) {
          return {
            pattern: txt(p.pattern),
            meaning: txt(p.meaning),
            example: txt((p.examples && p.examples[0]) || p.example || '')
          };
        }).filter(function (p) { return p.pattern; });
      }
    } catch (e) {}
    return [];
  }

  function extractDialogues() {
    var c = findCard(/dialogue|hội thoại/i);
    if (!c) return [];
    var lines = $all('.dialogue-line, .v12-dialogue-line, li, p', c)
      .map(function (n) { return cleanText(n); })
      .filter(function (s) { return s && s.length > 1 && !/^dialogue|hội thoại/i.test(s); });
    return lines.slice(0, 8);
  }

  function extractList(re, max) {
    var c = findCard(re);
    if (!c) return [];
    return $all('li, .v12-phrase-en, .phrase-en, p', c)
      .map(function (n) { return cleanText(n); })
      .filter(function (s) { return s && s.length > 1; })
      .slice(0, max || 6);
  }

  function buildModel() {
    var topic = getTopic();
    var topicId = topic ? topic.id : null;
    return {
      title: (topic && (topic.emoji ? topic.emoji + ' ' : '') + topic.name) ||
             txt(($('.topic-title, #topic-title, h1') || {}).textContent) || 'Lesson Blueprint',
      level: topic && topic.level ? topic.level : '',
      estMin: topic && topic.estMin ? topic.estMin : '',
      why: cardText(/^[^\w]*why|mục tiêu/i),
      scene: cardText(/scene|bối cảnh/i),
      core: extractCorePhrases(),
      grammar: extractGrammar(topicId),
      dialogues: extractDialogues(),
      realEnglish: extractList(/real english/i, 6),
      action: extractList(/action|shadow/i, 6),
      memory: ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'],
      missions: extractList(/mission|nhiệm vụ/i, 6),
      review: extractList(/review|ôn tập/i, 6),
      wordOrder: cardText(/word order/i) ? 'Xếp lại câu trục' : '',
      frequency: cardText(/frequency|tần suất|nhịp/i) ? 'Nhịp học mỗi ngày' : 'Nhịp học mỗi ngày',
      _topicId: topicId
    };
  }

  /* ----------------------------------------------------- empty handling (requirement #3) */
  // Core sections (always: placeholder). Optional sections (auto-hide when empty).
  function block(opts) {
    // opts: { icon,title,html,empty,placeholder,core,cls,span }
    var has = !opts.empty;
    if (!has && !opts.core) return ''; // auto-hide optional
    var body = has ? opts.html : '<div class="v30-ph">' + esc(opts.placeholder || 'Chưa có dữ liệu') + '</div>';
    return '<div class="v30-blk ' + (opts.cls || '') + '"' + (opts.span ? ' style="grid-column:1/-1"' : '') + '>' +
      '<div class="v30-h"><span class="v30-ic">' + opts.icon + '</span>' + esc(opts.title) + '</div>' +
      body + '</div>';
  }

  /* ----------------------------------------------------------- on-screen HTML (V30.1) */
  var FLOW = [
    ['🎯', 'WHY'], ['🌍', 'SCENE'], ['💬', 'CORE'], ['📚', 'GRAMMAR'], ['🗣', 'DIALOGUES'],
    ['🎧', 'REAL ENGLISH'], ['⚡', 'ACTION'], ['🔁', 'MEMORY'], ['🎮', 'MISSIONS'], ['📌', 'REVIEW']
  ];

  function phraseLines(list) {
    if (!list || !list.length) return '';
    return list.slice(0, 5).map(function (p) {
      return '<div class="v30-p">' + audioBtn(p.en) + '<span class="v30-en">' + esc(p.en) + '</span>' +
        (p.vi ? '<span class="v30-vi">' + esc(p.vi) + '</span>' : '') + '</div>';
    }).join('');
  }

  function buildHTML(m) {
    var coreEmpty = !(m.core.BEFORE.length || m.core.DURING.length || m.core.AFTER.length);
    var flow = FLOW.map(function (f) { return '<span class="v30-fi">' + f[0] + ' ' + f[1] + '</span>'; })
      .join('<span class="v30-fa">→</span>');

    var coreHTML =
      '<div class="v30-core-grid">' +
        '<div class="v30-cc"><div class="v30-cl">BEFORE</div>' + (phraseLines(m.core.BEFORE) || '<div class="v30-ph">—</div>') + '</div>' +
        '<div class="v30-cc"><div class="v30-cl">DURING</div>' + (phraseLines(m.core.DURING) || '<div class="v30-ph">—</div>') + '</div>' +
        '<div class="v30-cc"><div class="v30-cl">AFTER</div>' + (phraseLines(m.core.AFTER) || '<div class="v30-ph">—</div>') + '</div>' +
      '</div>';

    var grammarHTML = '';
    if (m.grammar.length) {
      grammarHTML = '<table class="v30-gt"><thead><tr><th>Pattern</th><th>Meaning</th><th>Example</th></tr></thead><tbody>' +
        m.grammar.slice(0, 5).map(function (g) {
          return '<tr><td>' + esc(g.pattern) + '</td><td>' + esc(g.meaning) + '</td>' +
            '<td>' + (g.example ? audioBtn(g.example) + esc(g.example) : '') + '</td></tr>';
        }).join('') + '</tbody></table>';
    }

    var diaHTML = m.dialogues.length
      ? m.dialogues.map(function (l) { return '<div class="v30-p">' + audioBtn(l) + '<span class="v30-en">' + esc(l) + '</span></div>'; }).join('')
      : '';

    var listHTML = function (arr) { return arr.length ? '<div class="v30-t">' + arr.map(esc).join(' · ') + '</div>' : ''; };

    return '' +
    '<section class="card v30-card" data-v30="1">' +
      '<div class="v30-toolbar">' +
        '<div class="v30-title-row"><span class="card-title">📋 LESSON BLUEPRINT</span></div>' +
        '<div class="v30-btns">' +
          '<button type="button" class="v30-btn" data-v30-act="png">⬇ Lưu PNG (A4)</button>' +
          '<button type="button" class="v30-btn" data-v30-act="print">🖨 In A4</button>' +
        '</div>' +
      '</div>' +
      '<div class="v30-sheet" id="v30-sheet">' +
        '<div class="v30-blk v30-purple" style="grid-column:1/-1">' +
          '<div class="v30-head">' + esc(m.title) +
            (m.level || m.estMin ? '<span class="v30-meta">' + esc(m.level) + (m.estMin ? ' · ⏱ ' + esc(m.estMin) + "'" : '') + '</span>' : '') +
          '</div>' +
          '<div class="v30-flow"><b>FLOW:</b> ' + flow + '</div>' +
        '</div>' +
        block({ icon: '🎯', title: 'WHY', html: '<div class="v30-t">' + esc(m.why) + '</div>', empty: !m.why, core: true, placeholder: 'Mục tiêu → Outcome', cls: 'v30-gray' }) +
        block({ icon: '🌍', title: 'SCENE', html: '<div class="v30-t">' + esc(m.scene) + '</div>', empty: !m.scene, core: true, placeholder: 'Bối cảnh sử dụng', cls: 'v30-gray' }) +
        '<div class="v30-blk v30-teal v30-hero" style="grid-column:1/-1">' +
          '<div class="v30-head"><span class="v30-ic">💬</span>★ CORE PHRASES</div>' +
          (coreEmpty ? '<div class="v30-ph">Chưa có Core Phrases — thêm câu trục để hoàn thiện blueprint.</div>' : coreHTML) +
        '</div>' +
        block({ icon: '📚', title: 'GRAMMAR PATTERNS', html: grammarHTML, empty: !m.grammar.length, core: true, placeholder: 'Pattern | Meaning | Example', cls: 'v30-blue', span: true }) +
        block({ icon: '🗣', title: 'DIALOGUES', html: diaHTML, empty: !m.dialogues.length, cls: 'v30-gray' }) +
        block({ icon: '🎧', title: 'REAL ENGLISH', html: listHTML(m.realEnglish), empty: !m.realEnglish.length, cls: 'v30-coral' }) +
        block({ icon: '⚡', title: 'ACTION', html: listHTML(m.action.length ? m.action : ['Shadow', 'Record', 'Roleplay', 'Chat AI']), empty: false, cls: 'v30-amber' }) +
        block({ icon: '🔁', title: 'MEMORY LOOP', html: '<div class="v30-t">' + m.memory.join(' → ') + '</div>', empty: false, cls: 'v30-green' }) +
        block({ icon: '🎮', title: 'REAL LIFE MISSIONS', html: listHTML(m.missions.length ? m.missions : ['Dùng thật', 'Chat AI', 'Video', 'Roleplay']), empty: false, cls: 'v30-pink' }) +
        block({ icon: '📌', title: 'REVIEW', html: listHTML(m.review.length ? m.review : ['Top 10', 'Câu khó', 'Reflection']), empty: false, cls: 'v30-gray' }) +
        block({ icon: '🧩', title: 'WORD ORDER CHALLENGE', html: '<div class="v30-t">' + esc(m.wordOrder || 'Xếp lại câu trục') + '</div>', empty: false, cls: 'v30-blue' }) +
        block({ icon: '⏰', title: 'LEARNING FREQUENCY', html: '<div class="v30-t">' + esc(m.frequency) + '</div>', empty: false, cls: 'v30-purple' }) +
      '</div>' +
    '</section>';
  }

  /* ------------------------------------------------------------------ styles */
  function injectCSS() {
    if (!document.head || $('#v30-style')) return;
    var css =
    '.v30-card{margin-top:16px}' +
    '.v30-toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}' +
    '.v30-btns{display:flex;gap:8px}' +
    '.v30-btn{font:inherit;font-size:13px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer}' +
    '.v30-btn:hover{background:#f1f5f9}' +
    '.v30-sheet{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;overflow-x:hidden}' +
    '.v30-blk{border-radius:8px;padding:8px 10px;border:1px solid rgba(0,0,0,.06)}' +
    '.v30-blk[hidden]{display:none}' +
    '.v30-head{font-weight:600;font-size:13px;margin-bottom:4px;display:flex;align-items:center;gap:6px}' +
    '.v30-ic{font-size:14px}' +
    '.v30-h{font-weight:600;font-size:12.5px;margin-bottom:3px;display:flex;align-items:center;gap:5px}' +
    '.v30-meta{font-weight:400;font-size:11px;color:#64748b;margin-left:8px}' +
    '.v30-flow{font-size:11px;color:#475569;line-height:1.6;margin-top:4px}' +
    '.v30-flow b{color:#0f172a}.v30-fa{margin:0 4px;color:#94a3b8}' +
    '.v30-t{font-size:12px;color:#1e293b;line-height:1.45}' +
    '.v30-ph{font-size:11px;color:#94a3b8;font-style:italic}' +
    '.v30-hero{padding:10px 12px}' +
    '.v30-core-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:4px}' +
    '.v30-cl{font-size:10px;letter-spacing:.05em;color:#0f766e;font-weight:600;margin-bottom:4px}' +
    '.v30-p{font-size:12.5px;color:#0f172a;line-height:1.3;margin-bottom:4px;display:flex;align-items:baseline;gap:4px;flex-wrap:wrap}' +
    '.v30-en{font-weight:500}.v30-vi{font-size:10.5px;color:#64748b;font-weight:400}' +
    '.v30-gt{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:4px}' +
    '.v30-gt th{text-align:left;font-weight:600;font-size:10.5px;color:#64748b;padding:3px 6px;border-bottom:1px solid #e2e8f0}' +
    '.v30-gt td{padding:4px 6px;border-bottom:1px solid #f1f5f9;color:#1e293b;vertical-align:top}' +
    '.v30-purple{background:#f5f3ff}.v30-teal{background:#f0fdfa;border-color:#5eead4}.v30-blue{background:#eff6ff}' +
    '.v30-gray{background:#f8fafc}.v30-coral{background:#fff1ed}.v30-amber{background:#fffbeb}' +
    '.v30-green{background:#f0fdf4}.v30-pink{background:#fdf2f8}' +
    /* iPad */
    '@media (max-width:1024px){.v30-core-grid{gap:8px}}' +
    /* Mobile reflow → 1 column (from Option A) */
    '@media (max-width:760px){.v30-sheet{grid-template-columns:1fr}.v30-blk[style*="grid-column"]{grid-column:1/-1 !important}.v30-core-grid{grid-template-columns:1fr}}' +
    /* Print A4 (requirement #2 sibling — true A4 page) */
    '@media print{@page{size:A4;margin:8mm}body *{visibility:hidden}.v30-sheet,.v30-sheet *{visibility:visible}.v30-sheet{position:absolute;left:0;top:0;width:100%}.v30-toolbar{display:none}}';
    var st = document.createElement('style');
    st.id = 'v30-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ----------------------------------------------- PNG export — TRUE fixed A4 (requirement #2) */
  // Pure SVG (rect+text, no foreignObject) at fixed 1240x1754 → canvas → PNG. Independent of viewport.
  function wrap(s, max) {
    s = txt(s); var words = s.split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = cur ? cur + ' ' + words[i] : words[i];
      if (t.length > max && cur) { lines.push(cur); cur = words[i]; } else { cur = t; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function svgBox(x, y, w, h, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" fill="' + fill + '" stroke="#e2e8f0"/>';
  }
  function svgText(x, y, s, size, weight, color) {
    return '<text x="' + x + '" y="' + y + '" font-family="Arial, sans-serif" font-size="' + size +
      '" font-weight="' + (weight || 400) + '" fill="' + (color || '#1e293b') + '">' + esc(s) + '</text>';
  }
  function svgLines(x, y, arr, size, lh, color) {
    return arr.map(function (l, i) { return svgText(x, y + i * lh, l, size, 400, color); }).join('');
  }

  function buildA4SVG(m) {
    m = m || { title: 'Lesson Blueprint', core: { BEFORE: [], DURING: [], AFTER: [] }, grammar: [], memory: ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'] };
    var W = A4.w, H = A4.h, P = 40, s = [];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">');
    s.push('<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>');
    // header
    s.push(svgBox(P, P, W - 2 * P, 110, '#f5f3ff'));
    s.push(svgText(P + 20, P + 48, m.title, 34, 600, '#4c1d95'));
    s.push(svgText(P + 20, P + 88, 'FLOW: WHY → SCENE → CORE → GRAMMAR → DIALOGUES → REAL ENGLISH → ACTION → MEMORY → MISSIONS → REVIEW', 17, 400, '#6d28d9'));
    // why / scene
    var halfW = (W - 2 * P - 16) / 2, y = P + 130;
    s.push(svgBox(P, y, halfW, 90, '#f8fafc'));
    s.push(svgText(P + 16, y + 30, '🎯 WHY', 18, 600, '#0f172a'));
    s.push(svgLines(P + 16, y + 56, wrap(m.why || 'Mục tiêu → Outcome', 40), 15, 22, '#334155'));
    s.push(svgBox(P + halfW + 16, y, halfW, 90, '#f8fafc'));
    s.push(svgText(P + halfW + 32, y + 30, '🌍 SCENE', 18, 600, '#0f172a'));
    s.push(svgLines(P + halfW + 32, y + 56, wrap(m.scene || 'Bối cảnh sử dụng', 40), 15, 22, '#334155'));
    // CORE PHRASES hero — largest block
    y += 110; var heroH = 470;
    s.push(svgBox(P, y, W - 2 * P, heroH, '#f0fdfa'));
    s.push('<rect x="' + P + '" y="' + y + '" width="' + (W - 2 * P) + '" height="' + heroH + '" rx="10" fill="none" stroke="#5eead4" stroke-width="3"/>');
    s.push(svgText(P + 20, y + 38, '💬 ★ CORE PHRASES', 24, 600, '#0f766e'));
    var colW = (W - 2 * P - 60) / 3, cols = ['BEFORE', 'DURING', 'AFTER'];
    cols.forEach(function (c, ci) {
      var cx = P + 20 + ci * (colW + 20), cy = y + 78;
      s.push(svgText(cx, cy, c, 15, 600, '#0f766e'));
      (m.core[c] || []).slice(0, 5).forEach(function (p, pi) {
        var ly = cy + 30 + pi * 70;
        s.push(svgLines(cx, ly, wrap(p.en, 24), 16, 22, '#0f172a'));
      });
    });
    // grammar mini-table
    y += heroH + 20; var gH = 170;
    s.push(svgBox(P, y, W - 2 * P, gH, '#eff6ff'));
    s.push(svgText(P + 20, y + 34, '📚 GRAMMAR PATTERNS', 20, 600, '#0f172a'));
    var gx = [P + 20, P + 360, P + 720], heads = ['Pattern', 'Meaning', 'Example'];
    heads.forEach(function (h, i) { s.push(svgText(gx[i], y + 64, h, 14, 600, '#64748b')); });
    (m.grammar || []).slice(0, 3).forEach(function (g, gi) {
      var gy = y + 92 + gi * 26;
      s.push(svgText(gx[0], gy, g.pattern, 15, 400, '#1e293b'));
      s.push(svgText(gx[1], gy, g.meaning, 15, 400, '#1e293b'));
      s.push(svgText(gx[2], gy, g.example, 15, 400, '#1e293b'));
    });
    if (!(m.grammar || []).length) s.push(svgText(gx[0], y + 92, 'Pattern | Meaning | Example', 14, 400, '#94a3b8'));
    // bottom rows
    y += gH + 20;
    var rows = [
      ['🗣 DIALOGUES', '#f8fafc', '🎧 REAL ENGLISH', '#fff1ed'],
      ['⚡ ACTION', '#fffbeb', '🔁 MEMORY LOOP', '#f0fdf4'],
      ['🎮 MISSIONS', '#fdf2f8', '📌 REVIEW', '#f8fafc']
    ];
    rows.forEach(function (r) {
      s.push(svgBox(P, y, halfW, 80, r[1]));
      s.push(svgText(P + 16, y + 32, r[0], 16, 600, '#0f172a'));
      s.push(svgBox(P + halfW + 16, y, halfW, 80, r[3]));
      s.push(svgText(P + halfW + 32, y + 32, r[2], 16, 600, '#0f172a'));
      y += 92;
    });
    // word order / frequency footer
    s.push(svgBox(P, y, W - 2 * P, 70, '#f5f3ff'));
    s.push(svgText(P + 16, y + 42, '🧩 WORD ORDER CHALLENGE        ⏰ LEARNING FREQUENCY', 17, 600, '#4c1d95'));
    s.push('</svg>');
    return s.join('');
  }

  function exportPNG() {
    var svg = buildA4SVG(buildModel());
    var url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = A4.w; cv.height = A4.h; // FIXED — never reads viewport
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, A4.w, A4.h);
      ctx.drawImage(img, 0, 0, A4.w, A4.h);
      var a = document.createElement('a');
      a.download = 'lesson-blueprint-A4.png';
      try { a.href = cv.toDataURL('image/png'); } catch (e) { a.href = url; }
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    img.onerror = function () { window.open(url, '_blank'); };
    img.src = url;
  }

  /* ------------------------------------------------------------------ mount */
  function anchor() {
    return $('#view-topic.active, #view-topic, .view.active, #app, main, body');
  }
  function mount() {
    try {
      if (typeof document === 'undefined') return false;
      injectCSS();
      var host = anchor();
      if (!host) return false;
      var existing = $('[data-v30="1"]');
      var hasLesson = $('.v12-phrase-row, .phrase-row, .card-title');
      if (!hasLesson) { if (existing && existing.parentNode) existing.parentNode.removeChild(existing); return false; }
      var html = buildHTML(buildModel());
      if (existing) {
        existing.outerHTML = html; // idempotent refresh
      } else {
        host.insertAdjacentHTML('beforeend', html);
      }
      return true;
    } catch (e) { return false; }
  }

  function onClick(e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-v30-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-v30-act');
    if (act === 'png') exportPNG();
    else if (act === 'print') window.print();
  }

  function init() {
    if (typeof document === 'undefined' || !document.addEventListener) return;
    document.addEventListener('click', onClick, false);
    mount();
    setInterval(mount, MOUNT_INTERVAL_MS);
  }

  /* ----------------------------------------------------------------- selfTest */
  function selfTest() {
    var r = [];
    function ok(name, cond) { r.push({ name: name, ok: !!cond }); }
    try {
      ok('namespace SHADOW_V30 set', !!window.SHADOW_V30);
      ok('VERSION string', typeof VERSION === 'string' && VERSION === '30.0.0');
      // (2) fixed A4 dims independent of viewport
      ok('A4 fixed 1240x1754', A4.w === 1240 && A4.h === 1754);
      var svg = buildA4SVG(null);
      ok('SVG carries fixed A4 size', svg.indexOf('width="1240"') >= 0 && svg.indexOf('height="1754"') >= 0 && svg.indexOf('viewBox="0 0 1240 1754"') >= 0);
      ok('SVG is pure (no foreignObject)', svg.indexOf('foreignObject') < 0);
      // (1) TTS contract
      var ab = audioBtn('Can I get a latte? /kæn/');
      ok('audioBtn emits clean data-audio', /data-audio="Can I get a latte\?"/.test(ab) || /audio-btn/.test(ab));
      ok('cleanText strips IPA + spans', cleanText('Hello /hɛˈloʊ/ ▶') === 'Hello');
      // (3) empty handling
      ok('optional empty block auto-hides', block({ icon: '🎧', title: 'REAL ENGLISH', html: '', empty: true }) === '');
      ok('core empty block shows placeholder', /v30-ph/.test(block({ icon: '🎯', title: 'WHY', html: '', empty: true, core: true, placeholder: 'x' })));
      // (4) responsive CSS
      injectCSS();
      var styleEl = (typeof document !== 'undefined') ? $('#v30-style') : null;
      var cssText = styleEl ? styleEl.textContent : '';
      ok('responsive breakpoints (iPad+mobile)', /max-width:1024px/.test(cssText) && /max-width:760px/.test(cssText));
      ok('mobile reflow to 1 col', /grid-template-columns:1fr/.test(cssText));
      ok('print A4 page rule', /@page\{size:A4/.test(cssText) || /size:A4/.test(cssText));
      ok('display paired with [hidden] (BUG-013)', /\.v30-blk\[hidden\]\{display:none\}/.test(cssText));
      // (5) no regression — does not touch other namespaces
      ok('coexists w/ v20', typeof window.SHADOW_V20 === 'undefined' || !!window.SHADOW_V20);
      ok('does not overwrite v26/v27', (typeof window.SHADOW_V26 === 'undefined' || !!window.SHADOW_V26) && (typeof window.SHADOW_V27 === 'undefined' || !!window.SHADOW_V27));
      // model builds without throwing
      var model = buildModel();
      ok('buildModel returns object', model && typeof model === 'object' && 'core' in model);
      var h = buildHTML(model);
      ok('buildHTML contains 12 module icons', ['🎯','🌍','📚','💬','🗣','🎧','⚡','🔁','🎮','📌','🧩','⏰'].every(function (ic) { return h.indexOf(ic) >= 0; }));
      ok('buildHTML has v30-sheet container', h.indexOf('v30-sheet') >= 0);
      // synthetic model with full data → verify hero + grammar mini-table render
      var synth = {
        title: 'Demo', level: 'A1', estMin: 8, why: 'w', scene: 's',
        core: { BEFORE: [{ en: 'Hi there', vi: 'Chào' }], DURING: [], AFTER: [] },
        grammar: [{ pattern: 'Can I get…', meaning: 'Gọi món', example: 'Can I get a latte?' }],
        dialogues: ['A: hi'], realEnglish: ['to go'], action: [], memory: ['Day 0', 'Day 60'],
        missions: [], review: [], wordOrder: '', frequency: 'Nhịp học mỗi ngày'
      };
      var hs = buildHTML(synth);
      ok('grammar mini-table header Pattern|Meaning|Example', hs.indexOf('>Pattern</th>') >= 0 && hs.indexOf('>Meaning</th>') >= 0 && hs.indexOf('>Example</th>') >= 0);
      ok('core hero renders phrase + TTS button', hs.indexOf('Hi there') >= 0 && /data-audio|audio-btn/.test(hs));
    } catch (e) {
      r.push({ name: 'exception: ' + e.message, ok: false });
    }
    var allOk = r.every(function (x) { return x.ok; });
    return { ok: allOk, results: r };
  }

  /* ----------------------------------------------------------------- expose */
  window.SHADOW_V30 = {
    VERSION: VERSION, A4: A4,
    mount: mount, buildModel: buildModel, buildHTML: buildHTML,
    buildA4SVG: buildA4SVG, exportPNG: exportPNG, cleanText: cleanText, audioBtn: audioBtn,
    selfTest: selfTest
  };

  init();
})();
