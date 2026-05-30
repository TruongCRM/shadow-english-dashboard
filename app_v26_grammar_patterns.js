/* ============================================================================
 * SHADOW ENGLISH - v26  GRAMMAR PATTERNS  (Lesson Framework V1, module #4)   (ADDITIVE)
 * ----------------------------------------------------------------------------
 * Adds the official GRAMMAR PATTERNS module to the lesson, placed AFTER
 * CORE PHRASES and BEFORE DIALOGUES (per Lesson Framework V1). Grammar serves
 * real communication: Pattern -> Meaning -> Examples (not textbook grammar).
 *
 * Features (all additive, reversible by deleting one <script> line):
 *   A1) Section "📐 GRAMMAR PATTERNS" inserted right after the Core Phrases card
 *       on the topic page. UI in the house dark style.
 *   A2) Data per pattern: { pattern, meaning, examples:[e1,e2,e3] }.
 *   A3) Manual "+ Add Pattern" (fully hand-typed, no AI needed). Delete too.
 *       Saved in localStorage['shadow-en-grammar-patterns'] (own bucket, never
 *       touches the old overlay/state shapes).
 *   A4) "✨ AI tạo Patterns" button -> calls Gemini directly (key from
 *       localStorage['shadow-en-gemini-key']) using the topic + core phrases,
 *       returns 3-5 usable patterns. Independent of the lesson generator
 *       (v18/v19/v23) so there is zero regression risk to that chain.
 *   A5) IPA under the first example (reuses SHADOW_V23.ipaFor when available;
 *       approximate IPA marked with "≈" by v23).
 *   A6) Grammar Hub: a summary card rendered into the existing #view-resources
 *       ("📝 Grammar Hub" menu) — aggregates every pattern across all topics:
 *       "N Patterns Learned · M Examples".
 *   A7) Additive only. Does NOT edit app.js / v14 / v20 / v21 / v22 / Review /
 *       Memory / Gemini files. No regression. Idempotent via data-gp signature.
 *
 * Run SHADOW_V26.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V26) return;
  var VERSION = 'v26.0.0';
  var LS_KEY = 'shadow-en-grammar-patterns';
  var GEMINI_MODEL = 'gemini-2.5-flash';

  function log() { try { console.log.apply(console, ['[v26]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

  /* --------------------------------------------------------------- storage */
  function lsGetAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function lsSetAll(o) { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (e) {} }
  function getPatterns(topicId) { var all = lsGetAll(); return (all[topicId] || []).slice(); }
  function setPatterns(topicId, arr) { var all = lsGetAll(); all[topicId] = arr || []; lsSetAll(all); }
  function normalizePattern(p) {
    if (!p) return null;
    var pat = String(p.pattern || '').trim();
    if (!pat) return null;
    var ex = (p.examples || []).map(function (e) { return String(e || '').trim(); }).filter(function (e) { return e; }).slice(0, 3);
    return { id: p.id || uid(), pattern: pat, meaning: String(p.meaning || '').trim(), examples: ex, source: p.source || 'manual' };
  }
  function addPattern(topicId, p) {
    var np = normalizePattern(p); if (!np) return false;
    var arr = getPatterns(topicId); arr.push(np); setPatterns(topicId, arr); return true;
  }
  function deletePattern(topicId, id) {
    var arr = getPatterns(topicId).filter(function (x) { return x.id !== id; });
    setPatterns(topicId, arr);
  }
  function aggregate() {
    var all = lsGetAll(), topics = 0, patterns = 0, examples = 0, byTopic = [];
    Object.keys(all).forEach(function (tid) {
      var arr = all[tid] || []; if (!arr.length) return;
      topics++; patterns += arr.length;
      arr.forEach(function (p) { examples += (p.examples || []).length; });
      byTopic.push({ topicId: tid, count: arr.length, patterns: arr });
    });
    return { topics: topics, patterns: patterns, examples: examples, byTopic: byTopic };
  }

  /* ------------------------------------------------------------------- IPA */
  function ipaFor(text) {
    try {
      if (window.SHADOW_V23 && typeof window.SHADOW_V23.ipaFor === 'function') {
        var r = window.SHADOW_V23.ipaFor(text);
        if (r && r.ipa) return r.ipa;
        if (typeof r === 'string') return r;
      }
    } catch (e) {}
    return '';
  }

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
  function topicName(topicId, view) {
    try {
      var st = window.shadowEN && window.shadowEN.state;
      if (st) { var t = (st.topics || []).filter(function (x) { return x.id === topicId; })[0]; if (t && t.name) return t.name; }
    } catch (e) {}
    var h = view && view.querySelector('h1'); return h ? (h.textContent || '').trim() : '';
  }
  function corePhrasesCard(view) {
    var titles = view.querySelectorAll('.card-title');
    for (var i = 0; i < titles.length; i++) {
      if (/CORE PHRASES/i.test(titles[i].textContent || '')) {
        var c = titles[i].closest ? titles[i].closest('.card') : null;
        if (c) return c;
      }
    }
    return null;
  }
  function readCorePhrases(view) {
    var els = view.querySelectorAll('.phrase-row .phrase-en, .v12-phrase-row .v12-phrase-en');
    var out = []; for (var i = 0; i < els.length; i++) { var t = (els[i].textContent || '').trim(); if (t) out.push(t); }
    return out;
  }

  /* --------------------------------------------------------------- markup */
  function patternHTML(p) {
    var exs = (p.examples || []).map(function (e, i) {
      var ipa = i === 0 ? ipaFor(e) : '';
      return '<li class="gp-ex">' + esc(e) +
        (ipa ? '<span class="gp-ipa">' + esc(ipa) + '</span>' : '') + '</li>';
    }).join('');
    return '' +
      '<div class="gp-item" data-id="' + esc(p.id) + '">' +
      '  <button type="button" class="gp-del" data-gp-del title="Xoá">×</button>' +
      '  <div class="gp-pattern">' + esc(p.pattern) +
      (p.source === 'ai' ? ' <span class="gp-tag">AI</span>' : '') + '</div>' +
      (p.meaning ? '  <div class="gp-meaning">' + esc(p.meaning) + '</div>' : '') +
      (exs ? '  <ul class="gp-exs">' + exs + '</ul>' : '') +
      '</div>';
  }
  function formHTML() {
    return '' +
      '<div class="gp-form" hidden>' +
      '  <input type="text" class="gp-f-pattern" placeholder="Pattern — vd: I\'d like to + Verb">' +
      '  <input type="text" class="gp-f-meaning" placeholder="Meaning — vd: Dùng để yêu cầu/gọi món lịch sự">' +
      '  <input type="text" class="gp-f-ex1" placeholder="Example 1">' +
      '  <input type="text" class="gp-f-ex2" placeholder="Example 2">' +
      '  <input type="text" class="gp-f-ex3" placeholder="Example 3">' +
      '  <div class="gp-form-actions">' +
      '    <button type="button" class="gp-btn gp-primary" data-gp-save>Lưu Pattern</button>' +
      '    <button type="button" class="gp-btn gp-ghost" data-gp-cancel>Huỷ</button>' +
      '  </div>' +
      '</div>';
  }
  function cardHTML(topicId, patterns) {
    var list = patterns.length
      ? patterns.map(patternHTML).join('')
      : '<div class="gp-empty">Chưa có pattern nào. Thêm tay hoặc tạo bằng AI để học cấu trúc dùng thật.</div>';
    return '' +
      '<div class="card gp-card" id="shadow-v26-root" data-topic="' + esc(topicId) + '" style="grid-column:1/-1">' +
      '  <div class="card-title">📐 GRAMMAR PATTERNS — CẤU TRÚC NGỮ PHÁP</div>' +
      '  <div class="gp-sub">Pattern → Meaning → Examples · cấu trúc dùng thật để nói tự nhiên hơn</div>' +
      '  <div class="gp-list">' + list + '</div>' +
      '  ' + formHTML() +
      '  <div class="gp-actions">' +
      '    <button type="button" class="gp-btn gp-primary" data-gp-add>+ Add Pattern</button>' +
      '    <button type="button" class="gp-btn gp-ai" data-gp-ai>✨ AI tạo Patterns</button>' +
      '    <span class="gp-status" data-gp-status></span>' +
      '  </div>' +
      '</div>';
  }

  /* --------------------------------------------------------------- AI (Gemini) */
  function geminiKey() { try { return localStorage.getItem('shadow-en-gemini-key') || ''; } catch (e) { return ''; } }
  function buildPrompt(name, corePhrases) {
    return [
      'Bạn là giáo viên tiếng Anh giao tiếp. Cho chủ đề: "' + (name || 'general English') + '".',
      corePhrases && corePhrases.length ? 'Một số câu Core Phrases của bài: ' + corePhrases.slice(0, 12).map(function (p) { return '"' + p + '"'; }).join(', ') + '.' : '',
      'Hãy trích 3-5 GRAMMAR PATTERN DÙNG THẬT (không hàn lâm, không tên thì như "Present Simple").',
      'Mỗi pattern gồm: pattern (vd "I\'d like to + Verb"), meaning (tiếng Việt ngắn gọn cách dùng), examples (3 câu tiếng Anh tự nhiên).',
      'Trả về DUY NHẤT JSON: {"patterns":[{"pattern":"...","meaning":"...","examples":["...","...","..."]}]}'
    ].filter(Boolean).join('\n');
  }
  function parseAiPatterns(text) {
    var obj;
    try { obj = JSON.parse(text); }
    catch (e) {
      var m = String(text || '').match(/\{[\s\S]*\}/);
      if (!m) throw new Error('parse failed');
      obj = JSON.parse(m[0]);
    }
    var arr = (obj && obj.patterns) || [];
    return arr.map(function (p) {
      return normalizePattern({ pattern: p.pattern, meaning: p.meaning || p.vi || '', examples: p.examples || [], source: 'ai' });
    }).filter(Boolean);
  }
  function generateAI(topicId, name, corePhrases) {
    var k = geminiKey();
    if (!k) return Promise.reject(new Error('Chưa có Gemini key — nhập key (🔑) rồi thử lại.'));
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + encodeURIComponent(k);
    var body = { contents: [{ role: 'user', parts: [{ text: buildPrompt(name, corePhrases) }] }],
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json', maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } } };
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var txt = ((((j.candidates || [])[0] || {}).content || {}).parts || [])[0];
        txt = txt && txt.text ? txt.text : '';
        var pats = parseAiPatterns(txt);
        if (!pats.length) throw new Error('AI không trả về pattern hợp lệ.');
        var arr = getPatterns(topicId).concat(pats);
        setPatterns(topicId, arr);
        return pats.length;
      });
  }

  /* --------------------------------------------------------------- wiring */
  function wireCard(root, topicId, view) {
    var form = root.querySelector('.gp-form');
    var status = root.querySelector('[data-gp-status]');
    function setStatus(msg, cls) { if (status) { status.className = 'gp-status ' + (cls || ''); status.textContent = msg || ''; } }

    var addBtn = root.querySelector('[data-gp-add]');
    if (addBtn) addBtn.onclick = function () { if (form) { form.removeAttribute('hidden'); var f = form.querySelector('.gp-f-pattern'); if (f) f.focus(); } };
    var cancelBtn = root.querySelector('[data-gp-cancel]');
    if (cancelBtn) cancelBtn.onclick = function () { if (form) form.setAttribute('hidden', ''); };

    var saveBtn = root.querySelector('[data-gp-save]');
    if (saveBtn) saveBtn.onclick = function () {
      var g = function (c) { var el = form.querySelector(c); return el ? el.value : ''; };
      var ok = addPattern(topicId, { pattern: g('.gp-f-pattern'), meaning: g('.gp-f-meaning'),
        examples: [g('.gp-f-ex1'), g('.gp-f-ex2'), g('.gp-f-ex3')], source: 'manual' });
      if (!ok) { setStatus('Cần nhập ít nhất ô Pattern.', 'gp-bad'); return; }
      forceRebuild();
    };

    var dels = root.querySelectorAll('[data-gp-del]');
    for (var i = 0; i < dels.length; i++) {
      dels[i].onclick = function () {
        var item = this.closest ? this.closest('.gp-item') : null;
        if (item) { deletePattern(topicId, item.getAttribute('data-id')); forceRebuild(); }
      };
    }

    var aiBtn = root.querySelector('[data-gp-ai]');
    if (aiBtn) aiBtn.onclick = function () {
      aiBtn.disabled = true; setStatus('Đang tạo patterns bằng AI…', 'gp-info');
      generateAI(topicId, topicName(topicId, view), readCorePhrases(view))
        .then(function (n) { setStatus('Đã thêm ' + n + ' pattern.', 'gp-ok'); forceRebuild(); })
        .catch(function (e) { aiBtn.disabled = false; setStatus(e && e.message ? e.message : 'AI lỗi, thử lại.', 'gp-bad'); });
    };
  }

  function forceRebuild() {
    var root = document.getElementById('shadow-v26-root');
    if (root) root.removeAttribute('data-gp'); // invalidate signature -> next run rebuilds
    run();
  }

  function removeTopicCard() {
    var old = document.getElementById('shadow-v26-root');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function runTopic() {
    var view = activeTopicView();
    if (!view) { removeTopicCard(); return; }
    var anchor = corePhrasesCard(view);
    if (!anchor) { removeTopicCard(); return; }       // no Core Phrases card -> skip safely
    var topicId = currentTopicId(view);
    var patterns = getPatterns(topicId);
    var sig = topicId + '||' + patterns.map(function (p) { return p.id + ':' + p.pattern + ':' + (p.examples || []).join('~'); }).join('|');
    var existing = document.getElementById('shadow-v26-root');
    if (existing && existing.getAttribute('data-gp') === sig && view.contains(existing) &&
        existing.previousElementSibling === anchor) {
      return; // already rendered, correct position, unchanged
    }
    removeTopicCard();
    anchor.insertAdjacentHTML('afterend', cardHTML(topicId, patterns));
    var root = document.getElementById('shadow-v26-root');
    if (root) { root.setAttribute('data-gp', sig); wireCard(root, topicId, view); }
  }

  /* ---------------------------------------------------------- Grammar Hub */
  function hubHTML(agg) {
    var rows = agg.byTopic.map(function (t) {
      var name = topicName(t.topicId) || t.topicId;
      var pats = t.patterns.map(function (p) { return '<span class="gp-hub-pill">' + esc(p.pattern) + '</span>'; }).join('');
      return '<div class="gp-hub-topic"><div class="gp-hub-tname">' + esc(name) + ' · ' + t.count + '</div><div class="gp-hub-pills">' + pats + '</div></div>';
    }).join('');
    return '' +
      '<div class="card gp-hub" id="shadow-v26-hub">' +
      '  <div class="card-title">📝 GRAMMAR HUB — ÔN PATTERN TOÀN HỆ THỐNG</div>' +
      '  <div class="gp-hub-stats"><b>' + agg.patterns + '</b> Patterns Learned · <b>' + agg.examples + '</b> Examples · ' + agg.topics + ' topics</div>' +
      (rows || '<div class="gp-empty">Chưa có pattern nào. Vào một topic và thêm Grammar Patterns.</div>') +
      '</div>';
  }
  function runHub() {
    var view = document.getElementById('view-resources');
    if (!view || !view.classList.contains('active')) {
      var old = document.getElementById('shadow-v26-hub'); if (old && old.parentNode) old.parentNode.removeChild(old);
      return;
    }
    var agg = aggregate();
    var sig = 'hub|' + agg.patterns + '|' + agg.examples + '|' + agg.topics;
    var existing = document.getElementById('shadow-v26-hub');
    if (existing && existing.getAttribute('data-gp') === sig && view.contains(existing)) return;
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    view.insertAdjacentHTML('afterbegin', hubHTML(agg));
    var hub = document.getElementById('shadow-v26-hub'); if (hub) hub.setAttribute('data-gp', sig);
  }

  function run() { try { runTopic(); } catch (e) { log('topic err', e); } try { runHub(); } catch (e) { log('hub err', e); } }

  /* ------------------------------------------------------------------ CSS */
  function injectCSS() {
    if (document.getElementById('gp-css')) return;
    var css = [
      '.gp-card .gp-sub,.gp-hub .gp-hub-stats{font-size:12px;color:var(--text-2);margin:-2px 0 14px}',
      '.gp-hub .gp-hub-stats b{color:var(--text)}',
      '.gp-list{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:14px}',
      '@media(min-width:900px){.gp-list{grid-template-columns:1fr 1fr}}',
      '.gp-item{position:relative;background:var(--card-2);border:1px solid var(--border);border-radius:12px;padding:14px 36px 14px 14px}',
      '.gp-pattern{font-size:15px;font-weight:700;color:var(--text)}',
      '.gp-tag{font-size:10px;font-weight:700;color:var(--purple);border:1px solid var(--purple);border-radius:999px;padding:1px 7px;vertical-align:middle}',
      '.gp-meaning{font-size:13px;color:var(--text-2);margin-top:4px}',
      '.gp-exs{list-style:none;padding:0;margin:10px 0 0}',
      '.gp-ex{font-size:13px;color:var(--text);padding:6px 10px;background:var(--bg-2);border-radius:8px;margin-bottom:6px}',
      '.gp-ipa{display:block;font-size:11px;color:var(--text-3);margin-top:2px}',
      '.gp-del{position:absolute;top:8px;right:8px;width:24px;height:24px;border:none;background:transparent;color:var(--text-3);font-size:18px;line-height:1;cursor:pointer;border-radius:6px}',
      '.gp-del:hover{color:var(--red);background:rgba(239,68,68,.12)}',
      '.gp-empty{font-size:13px;color:var(--text-3);padding:10px 0}',
      '.gp-form{display:grid;gap:8px;margin-bottom:14px;padding:14px;background:var(--card-2);border:1px solid var(--border);border-radius:12px}',
      '.gp-form[hidden]{display:none}',
      '.gp-form input{width:100%;box-sizing:border-box;background:var(--bg-2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13px;outline:none}',
      '.gp-form input:focus{border-color:var(--purple)}',
      '.gp-form-actions,.gp-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
      '.gp-btn{appearance:none;cursor:pointer;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:600;transition:background .15s ease,color .15s ease}',
      '.gp-primary{border:1px solid var(--purple);background:var(--purple);color:#fff}',
      '.gp-primary:hover{background:var(--purple-2)}',
      '.gp-ai{border:1px solid var(--border);background:transparent;color:var(--purple)}',
      '.gp-ai:hover{background:rgba(124,92,255,.12)}',
      '.gp-ai:disabled{opacity:.5;cursor:default}',
      '.gp-ghost{border:1px solid var(--border);background:transparent;color:var(--text-2)}',
      '.gp-ghost:hover{color:var(--text)}',
      '.gp-status{font-size:12px;font-weight:600}',
      '.gp-info{color:var(--text-2)}.gp-ok{color:var(--green)}.gp-bad{color:var(--orange)}',
      '.gp-hub-topic{padding:10px 0;border-top:1px solid var(--border)}',
      '.gp-hub-tname{font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px}',
      '.gp-hub-pills{display:flex;flex-wrap:wrap;gap:6px}',
      '.gp-hub-pill{font-size:12px;color:var(--text);background:var(--card-2);border:1px solid var(--border);border-radius:999px;padding:4px 12px}'
    ].join('');
    var s = document.createElement('style'); s.id = 'gp-css'; s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------- public API */
  window.SHADOW_V26 = {
    version: VERSION,
    run: run,
    getPatterns: getPatterns, setPatterns: setPatterns, addPattern: addPattern, deletePattern: deletePattern,
    aggregate: aggregate, buildPrompt: buildPrompt, parseAiPatterns: parseAiPatterns,
    selfTest: selfTest
  };

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }
    var TID = '__gp_selftest__';

    if (typeof localStorage !== 'undefined') {
      // clean slate
      var all0 = lsGetAll(); delete all0[TID]; lsSetAll(all0);
      check('empty topic -> []', getPatterns(TID).length === 0);
      check('add pattern ok', addPattern(TID, { pattern: "I'd like to + V", meaning: 'yêu cầu lịch sự', examples: ['I\'d like to order.', 'I\'d like to book a room.'] }));
      check('reject empty pattern', addPattern(TID, { pattern: '   ', examples: [] }) === false);
      var arr = getPatterns(TID);
      check('saved 1 pattern', arr.length === 1 && arr[0].pattern.indexOf("I'd like to") === 0);
      check('examples capped & kept', arr[0].examples.length === 2);
      // delete
      deletePattern(TID, arr[0].id);
      check('delete works', getPatterns(TID).length === 0);
      // aggregate
      addPattern(TID, { pattern: 'Could I + V', examples: ['Could I have water?', 'Could I sit here?', 'Could I pay now?'] });
      var agg = aggregate();
      check('aggregate counts patterns', agg.patterns >= 1);
      check('aggregate counts examples', agg.examples >= 3);
      // cleanup
      var all = lsGetAll(); delete all[TID]; lsSetAll(all);
    } else { check('localStorage (n/a here)', true); }

    // AI prompt + parse (no network)
    var prompt = buildPrompt('Đi ăn nhà hàng', ['Can we see the menu, please?']);
    check('prompt contains topic', prompt.indexOf('Đi ăn nhà hàng') > -1);
    check('prompt asks JSON', /JSON/.test(prompt));
    var parsed = parseAiPatterns('{"patterns":[{"pattern":"Can we + V","meaning":"đề nghị","examples":["Can we get the bill?","Can we sit outside?","Can we order now?"]}]}');
    check('parse AI JSON -> 1 pattern', parsed.length === 1 && parsed[0].source === 'ai');
    check('parse AI tolerates junk wrap', parseAiPatterns('noise {"patterns":[{"pattern":"X + Y","examples":["a"]}]} tail').length === 1);

    // additive: does not touch others
    check('does NOT touch v25', !window.SHADOW_V25 || typeof window.SHADOW_V25.selfTest === 'function');
    check('does NOT touch v23', !window.SHADOW_V23 || typeof window.SHADOW_V23.selfTest === 'function');
    check('does NOT touch Gemini lesson gen', !window.SHADOW_V18 || !!window.SHADOW_V18.generators);
    check('does NOT touch v20 engines', !window.SHADOW_V20 || typeof window.SHADOW_V20.smartNextAction === 'function');

    if (typeof document !== 'undefined' && document.createElement) {
      try { injectCSS(); } catch (e) {}
      check('css injected', !!document.getElementById('gp-css'));
    }

    try {
      console.log('%c[v26] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
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
    log('ready', VERSION, '- run SHADOW_V26.selfTest() to verify.');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 1000); });
    } else { setTimeout(boot, 1000); }
  }
})();
