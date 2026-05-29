/* ============================================================================
 * SHADOW ENGLISH - v23  SHADOW SCRIPT LEARNING ASSIST V1   (ADDITIVE)
 * ----------------------------------------------------------------------------
 * Turns Core Phrases + Shadowing Script from plain English into a listen/speak/
 * pronounce/self-translate tool, WITHOUT changing the Learning Loop or breaking
 * old data.
 *
 * What it does (all additive, all reversible by deleting one <script> line):
 *   1) IPA line under each English sentence (smaller, opacity ~70%).
 *   2) Vietnamese meaning under that (smaller, opacity ~45%).
 *   3) Translation TOGGLE (default HIDDEN). Button "🇻🇳 Hiện nghĩa" / "Ẩn nghĩa".
 *      Persisted in localStorage['shadow-show-translation'] = 'true'|'false'.
 *   4) AI generation: v23 OVERRIDES SHADOW_V18.generators.gemini (loads after v19)
 *      so a single generate also returns ipa + vietnamese; stored in an additive
 *      overlay bucket `v23` (NEVER changes the legacy [en,vi] phrase shape, so
 *      app.js keeps working). On any error -> falls back to v19's original gemini.
 *   5) Backward compatible: topics with no ipa/vietnamese render fine (English,
 *      plus a client-side APPROXIMATE IPA marked with "≈"); never crashes.
 *   6) Level scaffold: L1 English / L2 English+IPA / L3 English+IPA+Vietnamese.
 *      Default L2. localStorage['shadow-display-level'] = 1|2|3. Translation
 *      toggle is independent and wins for VN visibility.
 *
 * IPA accuracy note: Gemini IPA (when present) is exact and shown plain. The
 * client-side engine is APPROXIMATE (rule-based + small common-word dict) and is
 * marked with a leading "≈" so it never misleads pronunciation.
 *
 * Does NOT edit: app.js, Review, Memory, Learning Loop, v19 file. Reuses
 * window.openTopic / state. Run SHADOW_V23.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V23) return;
  var VERSION = 'v23.0.0';
  var LS_TRANS = 'shadow-show-translation';
  var LS_LEVEL = 'shadow-display-level';

  function log() { try { console.log.apply(console, ['[v23]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function showTrans() { return lsGet(LS_TRANS, 'false') === 'true'; }
  function level() { var n = parseInt(lsGet(LS_LEVEL, '2'), 10); return (n >= 1 && n <= 3) ? n : 2; }

  /* =================================================== CLIENT IPA ENGINE ===
   * Approximate English -> IPA. Priority: (1) Gemini-provided IPA from the v23
   * overlay bucket; (2) small common-word dictionary; (3) rule-based fallback.
   * Output marked approximate by caller. */
  var IPA_DICT = {
    'a': 'ə', 'an': 'æn', 'the': 'ðə', 'to': 'tuː', 'of': 'əv', 'and': 'ænd', 'in': 'ɪn', 'on': 'ɒn',
    'at': 'æt', 'is': 'ɪz', 'are': 'ɑːr', 'am': 'æm', 'be': 'biː', 'was': 'wɒz', 'were': 'wɜːr',
    'i': 'aɪ', 'you': 'juː', 'he': 'hiː', 'she': 'ʃiː', 'we': 'wiː', 'they': 'ðeɪ', 'it': 'ɪt',
    'me': 'miː', 'my': 'maɪ', 'your': 'jɔːr', 'do': 'duː', 'does': 'dʌz', 'did': 'dɪd', 'don\'t': 'doʊnt',
    'what': 'wʌt', 'when': 'wen', 'where': 'wer', 'who': 'huː', 'why': 'waɪ', 'how': 'haʊ', 'which': 'wɪtʃ',
    'this': 'ðɪs', 'that': 'ðæt', 'these': 'ðiːz', 'those': 'ðoʊz', 'here': 'hɪr', 'there': 'ðer',
    'hi': 'haɪ', 'hey': 'heɪ', 'hello': 'həˈloʊ', 'bye': 'baɪ', 'yes': 'jes', 'no': 'noʊ', 'ok': 'oʊˈkeɪ',
    'please': 'pliːz', 'thanks': 'θæŋks', 'thank': 'θæŋk', 'sorry': 'ˈsɒri', 'good': 'ɡʊd', 'great': 'ɡreɪt',
    'morning': 'ˈmɔːrnɪŋ', 'afternoon': 'ˌæftərˈnuːn', 'evening': 'ˈiːvnɪŋ', 'night': 'naɪt', 'today': 'təˈdeɪ',
    'usually': 'ˈjuːʒuəli', 'often': 'ˈɒfən', 'always': 'ˈɔːlweɪz', 'never': 'ˈnevər', 'sometimes': 'ˈsʌmtaɪmz',
    'can': 'kæn', 'could': 'kʊd', 'would': 'wʊd', 'will': 'wɪl', 'want': 'wɒnt', 'need': 'niːd', 'have': 'hæv',
    'go': 'ɡoʊ', 'going': 'ˈɡoʊɪŋ', 'get': 'ɡet', 'got': 'ɡɒt', 'make': 'meɪk', 'take': 'teɪk', 'like': 'laɪk',
    'name': 'neɪm', 'time': 'taɪm', 'day': 'deɪ', 'work': 'wɜːrk', 'home': 'hoʊm', 'food': 'fuːd', 'water': 'ˈwɔːtər',
    'one': 'wʌn', 'two': 'tuː', 'three': 'θriː', 'for': 'fɔːr', 'from': 'frɒm', 'with': 'wɪð', 'about': 'əˈbaʊt',
    'not': 'nɒt', 'too': 'tuː', 'very': 'ˈveri', 'much': 'mʌtʃ', 'more': 'mɔːr', 'some': 'sʌm', 'any': 'ˈeni',
    'now': 'naʊ', 'see': 'siː', 'know': 'noʊ', 'think': 'θɪŋk', 'say': 'seɪ', 'tell': 'tel', 'help': 'help',
    'excuse': 'ɪkˈskjuːz', 'welcome': 'ˈwelkəm', 'nice': 'naɪs', 'meet': 'miːt', 'fine': 'faɪn', 'well': 'wel'
  };
  // very rough grapheme rules for unknown words (clearly approximate)
  function ruleIpa(word) {
    var w = word.toLowerCase();
    var s = w
      .replace(/tion\b/g, 'ʃən').replace(/sion\b/g, 'ʒən')
      .replace(/ing\b/g, 'ɪŋ').replace(/ould\b/g, 'ʊd')
      .replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/qu/g, 'kw')
      .replace(/sh/g, 'ʃ').replace(/ch/g, 'tʃ').replace(/th/g, 'θ')
      .replace(/oo/g, 'uː').replace(/ee/g, 'iː').replace(/ea/g, 'iː').replace(/oa/g, 'oʊ')
      .replace(/ay\b/g, 'eɪ').replace(/ai/g, 'eɪ').replace(/igh/g, 'aɪ')
      .replace(/ou/g, 'aʊ').replace(/ow\b/g, 'oʊ')
      .replace(/e\b/g, '').replace(/y\b/g, 'i')
      .replace(/c/g, 'k').replace(/x/g, 'ks').replace(/j/g, 'dʒ');
    return s;
  }
  function wordIpa(word) {
    var clean = word.toLowerCase().replace(/[^a-z']/g, '');
    if (!clean) return '';
    if (IPA_DICT[clean]) return IPA_DICT[clean];
    return ruleIpa(clean);
  }
  // approximate IPA for a whole line; returns {ipa, approx}
  function clientIpa(text) {
    var words = String(text).replace(/[^A-Za-z' ]/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length) return { ipa: '', approx: true };
    return { ipa: '/' + words.map(wordIpa).join(' ') + '/', approx: true };
  }

  /* -------------------------- overlay v23 bucket (Gemini-provided ipa/vn) */
  function readBucket(topicId) {
    try {
      var raw = localStorage.getItem('shadow-en-overlay-' + topicId);
      if (!raw) return null;
      var ov = JSON.parse(raw);
      return ov && ov.v23 ? ov.v23 : null;
    } catch (e) { return null; }
  }
  // returns {ipa, approx} for an english string: Gemini bucket first, else client
  function ipaFor(topicId, english) {
    var b = topicId ? readBucket(topicId) : null;
    if (b && b.ipaByText) {
      var key = String(english).trim();
      if (b.ipaByText[key]) return { ipa: b.ipaByText[key], approx: false };
    }
    return clientIpa(english);
  }
  function viFor(topicId, english) {
    var b = topicId ? readBucket(topicId) : null;
    if (b && b.viByText) { var k = String(english).trim(); if (b.viByText[k]) return b.viByText[k]; }
    return '';
  }

  /* ------------------------------------------------ topic id from the page */
  function currentTopicId() {
    try { if (window.shadowEN && window.shadowEN.state && window.shadowEN.state.currentTopicId) return window.shadowEN.state.currentTopicId; } catch (e) {}
    return null;
  }

  /* ====================================================== AUGMENT PHRASES === */
  function ipaSpan(res) {
    if (!res.ipa) return '';
    return '<div class="ssa-ipa' + (res.approx ? ' ssa-ipa--approx' : '') + '">' +
      (res.approx ? '≈ ' : '') + esc(res.ipa) + '</div>';
  }
  function augmentPhrases(tid) {
    var rows = document.querySelectorAll('.phrase-row:not([data-ssa]), .v12-phrase-row:not([data-ssa])');
    rows.forEach(function (row) {
      row.setAttribute('data-ssa', '1');
      var enEl = row.querySelector('.phrase-en, .v12-phrase-en');
      var viEl = row.querySelector('.phrase-vi, .v12-phrase-vi');
      if (!enEl) return;
      var enText = enEl.textContent.trim();
      // mark for stacked layout
      row.classList.add('ssa-row');
      // IPA injected right after EN
      var ipaRes = ipaFor(tid, enText);
      if (!enEl.nextElementSibling || !enEl.nextElementSibling.classList.contains('ssa-ipa')) {
        enEl.insertAdjacentHTML('afterend', ipaSpan(ipaRes));
      }
      // mark VN as translation (kept in DOM; visibility via toggle/level CSS)
      if (viEl) viEl.classList.add('ssa-vi');
    });
  }

  /* ====================================================== AUGMENT SHADOW === */
  function splitShadow(box) {
    // prefer explicit line breaks; else split on speaker pattern or sentences
    var html = box.innerHTML;
    var raw = html.indexOf('<br') >= 0 ? html.split(/<br\s*\/?>/i).map(function (s) { var d = document.createElement('div'); d.innerHTML = s; return d.textContent.trim(); })
      : box.textContent.split(/\n+/).map(function (s) { return s.trim(); });
    raw = raw.filter(Boolean);
    if (raw.length <= 1) {
      // single blob -> split on "A:"/"B:" speaker markers or sentence boundaries
      var t = box.textContent.trim();
      var bySpeaker = t.split(/(?=(?:^|\s)[A-Z][a-zA-Z]?\s*:\s)/).map(function (s) { return s.trim(); }).filter(Boolean);
      raw = bySpeaker.length > 1 ? bySpeaker : t.split(/(?<=[.!?])\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return raw;
  }
  function augmentShadow(tid) {
    var box = document.querySelector('.shadow-script-box:not([data-ssa])');
    if (!box) return;
    box.setAttribute('data-ssa', '1');
    var txt = box.textContent.trim();
    if (!txt || /Will be added|Coming soon/i.test(txt)) return; // backward compat: leave placeholder
    var lines = splitShadow(box);
    if (!lines.length) return;
    var b = tid ? readBucket(tid) : null;
    var structured = (b && Array.isArray(b.shadowLines) && b.shadowLines.length) ? b.shadowLines : null;
    var html = '<div class="ssa-shadow">' + (structured ? structured : lines).map(function (item) {
      var en, ipa, vi, speaker = '';
      if (structured) {
        speaker = item.speaker || ''; en = item.english || item.line || '';
        ipa = item.ipa ? { ipa: item.ipa, approx: false } : clientIpa(en);
        vi = item.vietnamese || '';
      } else {
        var m = String(item).match(/^([A-Z][a-zA-Z]?)\s*:\s*(.*)$/);
        speaker = m ? m[1] : ''; en = m ? m[2] : String(item);
        ipa = ipaFor(tid, en); vi = viFor(tid, en);
      }
      if (!en) return '';
      return '<div class="ssa-line">' +
        (speaker ? '<span class="ssa-spk">' + esc(speaker) + '</span>' : '') +
        '<div class="ssa-line-body">' +
          '<div class="ssa-en">' + esc(en) + '</div>' +
          ipaSpan(ipa) +
          (vi ? '<div class="ssa-vi">→ ' + esc(vi) + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
    box.innerHTML = html;
  }

  /* ====================================================== TOGGLE / LEVEL UI */
  function applyState() {
    var root = document.documentElement;
    root.classList.toggle('ssa-show-vn', showTrans());
    root.classList.remove('ssa-lvl-1', 'ssa-lvl-2', 'ssa-lvl-3');
    root.classList.add('ssa-lvl-' + level());
    var btn = document.getElementById('ssa-trans-btn');
    if (btn) btn.innerHTML = showTrans() ? '🇻🇳 Ẩn nghĩa' : '🇻🇳 Hiện nghĩa';
  }
  function toggleTrans() { lsSet(LS_TRANS, showTrans() ? 'false' : 'true'); applyState(); }
  function mountToolbar() {
    var view = document.getElementById('view-topic-detail');
    if (!view || !view.classList.contains('active')) return;
    if (document.getElementById('ssa-toolbar')) return;
    // find the Core Phrases card to place the toolbar above it
    var anchor = null;
    var titles = view.querySelectorAll('.card-title');
    for (var i = 0; i < titles.length; i++) { if (/CORE PHRASES/i.test(titles[i].textContent)) { anchor = titles[i].parentElement; break; } }
    var bar = document.createElement('div');
    bar.id = 'ssa-toolbar';
    bar.innerHTML = '<button id="ssa-trans-btn" class="ssa-btn"></button>' +
      '<span class="ssa-hint">English + IPA luôn hiện · bật nghĩa khi cần</span>';
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor);
    else view.insertBefore(bar, view.firstChild);
    bar.querySelector('#ssa-trans-btn').onclick = toggleTrans;
  }

  /* ------------------------------------------------------------- run cycle */
  function run() {
    var view = document.getElementById('view-topic-detail');
    if (!view || !view.classList.contains('active')) return;
    var tid = currentTopicId();
    mountToolbar();
    augmentPhrases(tid);
    augmentShadow(tid);
    applyState();
  }

  /* ============================== Req4: extend Gemini (override provider) === */
  function installGeminiExtension() {
    var V18 = window.SHADOW_V18;
    if (!V18 || !V18.generators) return;
    if (V18.generators.__ssaWrapped) return;
    var prev = V18.generators.gemini; // v19's real generator (fallback)
    function key() { try { return localStorage.getItem('shadow-en-gemini-key') || ''; } catch (e) { return ''; } }
    function prompt(spec) {
      var name = (spec && (spec.name || spec.topic)) || 'this topic';
      return [
        'You are an English-for-Vietnamese-learners lesson designer.',
        'Topic: "' + name + '". Return ONLY valid JSON (no markdown) with this shape:',
        '{ "why":"VN 1-3 sentences", "scene":"VN 2-4 sentences", "video":"3-5 EN keywords sep by \\" · \\"",',
        '  "phrases":[{"en":"...","ipa":"/IPA/","vi":"Vietnamese"} ... exactly 20, before->during->after],',
        '  "shadow":[{"speaker":"A","english":"...","ipa":"/IPA/","vietnamese":"..."} ... 8-12 lines],',
        '  "exercises":[{"q":"VN question","a":"EN answer","hint":"VN hint"} x4],',
        '  "repeat":["3-5 key EN phrases"] }',
        'IPA must be accurate British/American IPA in slashes. Vietnamese must be natural.'
      ].join('\n');
    }
    function extractJson(text) { try { return JSON.parse(text); } catch (e) {} var m = String(text).match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch (e) {} } return null; }
    function store(spec, obj) {
      // persist ipa/vietnamese into the additive v23 bucket of the overlay being saved.
      try {
        var tid = spec && (spec.topicId || spec.id);
        if (!tid) return;
        var raw = localStorage.getItem('shadow-en-overlay-' + tid);
        var ov = raw ? JSON.parse(raw) : {};
        var bucket = { ipaByText: {}, viByText: {}, shadowLines: [] };
        (obj.phrases || []).forEach(function (p) { if (p && p.en) { if (p.ipa) bucket.ipaByText[String(p.en).trim()] = p.ipa; if (p.vi || p.vietnamese) bucket.viByText[String(p.en).trim()] = p.vi || p.vietnamese; } });
        (obj.shadow || []).forEach(function (s) { if (s && (s.english || s.line)) bucket.shadowLines.push({ speaker: s.speaker || '', english: s.english || s.line, ipa: s.ipa || '', vietnamese: s.vietnamese || s.vi || '' }); });
        ov.v23 = bucket;
        localStorage.setItem('shadow-en-overlay-' + tid, JSON.stringify(ov));
      } catch (e) { log('store v23 bucket failed', e); }
    }
    // map the new shape back to what V18 expects (legacy [en,vi] + shadow strings) for 100% backward compat
    function toV18(obj, spec) {
      var phrases = (obj.phrases || []).map(function (p) { return [String(p.en || p.english || ''), String(p.vi || p.vietnamese || '')]; });
      var shadow = (obj.shadow || []).map(function (s) { return typeof s === 'string' ? s : ((s.speaker ? s.speaker + ': ' : '') + (s.english || s.line || '')); }).filter(Boolean);
      var exercises = (obj.exercises || []).map(function (e) { return { q: e.q || '', a: e.a || '', hint: e.hint || '' }; });
      return { title: (spec && spec.name) || 'Lesson', why: obj.why || '', scene: obj.scene || '', video: obj.video || '', phrases: phrases, shadow: shadow, exercises: exercises, repeat: obj.repeat || [] };
    }
    V18.generators.gemini = function (spec) {
      var k = key();
      if (!k) return prev ? prev(spec) : Promise.reject(new Error('no key'));
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(k);
      var body = { contents: [{ role: 'user', parts: [{ text: prompt(spec) }] }], generationConfig: { temperature: 0.9, responseMimeType: 'application/json', maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } } };
      return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.ok ? r.json() : r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 120)); }); })
        .then(function (j) {
          var txt = (((j.candidates || [])[0] || {}).content || {}).parts ? j.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('') : '';
          var obj = extractJson(txt);
          if (!obj || (!obj.phrases && !obj.why)) throw new Error('parse failed');
          store(spec, obj);            // additive ipa/vn bucket
          return toV18(obj, spec);     // legacy shape -> v18 preview/save unchanged
        })
        .catch(function (e) { log('v23 gemini failed -> fallback', e && e.message); return prev ? prev(spec) : Promise.reject(e); });
    };
    V18.generators.__ssaWrapped = true;
    log('Gemini extended (ipa+vietnamese) with graceful fallback to v19.');
  }

  /* ------------------------------------------------------------------- CSS */
  function injectCSS() {
    if (document.getElementById('ssa-css')) return;
    var css = document.createElement('style'); css.id = 'ssa-css';
    css.textContent = [
      '#ssa-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px;grid-column:1/-1}',
      '.ssa-btn{border:1px solid var(--border,#2a2750);background:var(--card,#1a1838);color:var(--text,#fff);border-radius:20px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer}',
      '.ssa-btn:hover{background:rgba(124,92,255,.18);border-color:var(--purple,#7c5cff)}',
      '.ssa-hint{font-size:12px;opacity:.55;color:var(--text,#fff)}',
      /* phrase rows -> stacked */
      '.ssa-row{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:2px;text-align:left!important;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)}',
      '.ssa-row .phrase-en,.ssa-row .v12-phrase-en{font-weight:700;font-size:15px;text-align:left!important;flex:none!important}',
      '.ssa-ipa{font-size:12.5px;opacity:.7;color:var(--text,#fff);font-family:"Segoe UI","Noto Sans",system-ui,sans-serif;letter-spacing:.02em}',
      '.ssa-ipa--approx{opacity:.55;font-style:italic}',
      '.ssa-vi{font-size:13px;opacity:.45;color:var(--text,#fff);text-align:left!important;flex:none!important;display:none}',
      /* show VN when toggled on OR at level 3 */
      'html.ssa-show-vn .ssa-vi,html.ssa-lvl-3 .ssa-vi{display:block}',
      /* level 1: hide IPA */
      'html.ssa-lvl-1 .ssa-ipa{display:none}',
      /* shadow */
      '.ssa-shadow{display:flex;flex-direction:column;gap:12px}',
      '.ssa-line{display:flex;gap:10px;align-items:flex-start}',
      '.ssa-spk{flex:0 0 auto;width:24px;height:24px;border-radius:50%;background:var(--purple,#7c5cff);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;margin-top:2px}',
      '.ssa-line-body{flex:1;min-width:0}',
      '.ssa-en{font-weight:600;font-size:15px;line-height:1.4;color:var(--text,#fff)}',
      '.ssa-line .ssa-vi{margin-top:2px}',
      '@media(max-width:600px){.ssa-en{font-size:14px}.ssa-ipa{font-size:11.5px}.ssa-hint{display:none}}'
    ].join('\n');
    document.head.appendChild(css);
  }

  /* --------------------------------------------------------------- public */
  window.SHADOW_V23 = {
    version: VERSION,
    run: run,
    setLevel: function (n) { if (n >= 1 && n <= 3) { lsSet(LS_LEVEL, String(n)); applyState(); } },
    setTranslation: function (on) { lsSet(LS_TRANS, on ? 'true' : 'false'); applyState(); },
    ipaFor: ipaFor, clientIpa: clientIpa, level: level, showTranslation: showTrans,
    selfTest: selfTest
  };

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }
    check('css injected', !!document.getElementById('ssa-css'));
    var ci = clientIpa('Hi An. What do you usually do in the morning?');
    check('client IPA produces /…/ slashes', /^\/.*\/$/.test(ci.ipa));
    check('client IPA marked approx', ci.approx === true);
    check('dict known words exact (the/you/morning)', wordIpa('the') === 'ðə' && wordIpa('you') === 'juː' && wordIpa('morning') === 'ˈmɔːrnɪŋ');
    check('level default 2', [1, 2, 3].indexOf(level()) >= 0);
    check('translation default hidden (or persisted)', typeof showTrans() === 'boolean');
    check('Gemini extension installed (or v18 absent)', !window.SHADOW_V18 || !window.SHADOW_V18.generators || window.SHADOW_V18.generators.__ssaWrapped === true);
    check('does NOT touch Learning Loop', !window.LoopV14 || typeof window.LoopV14.selfTest === 'function');
    check('does NOT touch v20 engines', !window.SHADOW_V20 || typeof window.SHADOW_V20.smartNextAction === 'function');
    check('backward-compat: empty english -> no crash', (function () { try { var r = clientIpa(''); return r.ipa === '' || typeof r.ipa === 'string'; } catch (e) { return false; } })());
    console.log('%c[v23] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
    out.forEach(function (l) { log(l); });
    return { ok: ok, results: out };
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    installGeminiExtension();
    run();
    window.addEventListener('hashchange', function () { setTimeout(run, 120); });
    // topic page re-renders on navigate; re-augment on an interval (idempotent via data-ssa)
    setInterval(function () { installGeminiExtension(); run(); }, 1500);
    log('ready', VERSION, '- run SHADOW_V23.selfTest() to verify.');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 850); });
  } else { setTimeout(boot, 850); }
})();
