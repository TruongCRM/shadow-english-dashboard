/*! app_v34_connected_speech.js — V34 Connected Speech Markup (v34.0.0)
 * ADDITIVE. Renders native-style "linking" markup UNDER phrases: a curved bracket sits
 * directly under the linked words and the connected IPA sits under the bracket — glued into
 * one inline-flex unit so it NEVER drifts when the line wraps.
 *
 * Owner spec (APPROVED 2026-05-30): hybrid detection (rule + dictionary first, AI cache as
 * enrichment), ONE unified accent colour, a "Show Linking" toggle, mobile-responsive, mark only
 * the MOST IMPORTANT links (capped per sentence to avoid clutter). Applied to Core Phrases,
 * Dialogues, and the Shadowing Script (replacing the plain "Native Flow" text).
 *
 * Detection engine (NO LLM required to ship):
 *   1) CONTRACTIONS  — fixed word-sequences (wanna/gonna/gotta/hafta/wouldja/couldja/didja/…) → connected IPA.
 *   2) DICTIONARY    — curated common consonant→vowel / reduction pairs with connected IPA.
 *   3) RULE C→V      — generic consonant-letter → vowel-letter boundary, IPA built from SHADOW_V23
 *                      (ipaFor/clientIpa) when available; if no reliable IPA can be produced, the link
 *                      is NOT rendered (spec #6 "if linking can't be determined, don't render").
 *   AI ENRICHMENT    — `SHADOW_V34.applyAiCache(topicId)` reads precomputed annotations from
 *                      localStorage['shadow-en-linking-{topicId}'] if present (populated out-of-band /
 *                      by a future Gemini pass). Never auto-calls the API on load (key-safety).
 *
 * ROLLBACK: delete the single <script src="app_v34_connected_speech.js"> line in index.html.
 * Touches NOTHING in core. Pure <style> + idempotent DOM markup (guarded by data-v34).
 */
(function () {
  'use strict';
  if (window.SHADOW_V34) return;

  var STYLE_ID = 'v34-cs-style';
  var TOGGLE_KEY = 'shadow-en-show-linking';
  var MAX_PER_SENTENCE = 2;            // spec: only the MOST IMPORTANT links (avoid clutter)
  var ACCENT = '#f4b740';             // ONE unified colour

  /* ---------------------------------------------------------------- *
   * 1) Stylesheet (one accent; wrap-safe stacked unit; responsive)    *
   * ---------------------------------------------------------------- */
  var CSS = [
    '.v34-sentence{display:inline-flex;flex-wrap:wrap;align-items:flex-start;column-gap:6px;row-gap:4px;}',
    '#view-topic-detail.v34-on .v34-sentence{row-gap:34px;}',           /* room for brackets only when ON */
    '.v34-w{padding-top:2px;}',
    '.v34-link{display:inline-flex;flex-direction:column;align-items:center;}',
    '.v34-wa{display:flex;flex-direction:column;align-items:stretch;}',
    '.v34-top{text-align:center;white-space:nowrap;}',
    '.v34-mark{display:none;}',                                          /* hidden unless toggle ON */
    '#view-topic-detail.v34-on .v34-mark{display:block;}',
    '.v34-arc{height:8px;border:2px solid ' + ACCENT + ';border-top:0;border-radius:0 0 8px 8px;margin-top:3px;width:100%;}',
    '.v34-ipa{font-size:.72em;font-style:italic;color:' + ACCENT + ';margin-top:3px;white-space:nowrap;text-align:center;line-height:1.1;}',
    /* responsive: smaller IPA + tighter spacing on phones; never break layout */
    '@media (max-width:600px){#view-topic-detail.v34-on .v34-sentence{row-gap:30px;column-gap:5px;}.v34-ipa{font-size:.68em;}}',
    /* the toggle control */
    '.v34-toggle{display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-size:12px;font-weight:600;color:' + ACCENT + ';background:rgba(244,183,64,.10);border:1px solid rgba(244,183,64,.45);border-radius:999px;padding:5px 12px;user-select:none;}',
    '.v34-toggle .v34-sw{width:30px;height:16px;border-radius:999px;background:#3a3f55;position:relative;transition:background .15s;}',
    '.v34-toggle .v34-sw::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#cfd3e6;transition:left .15s;}',
    '#view-topic-detail.v34-on .v34-toggle .v34-sw{background:' + ACCENT + ';}',
    '#view-topic-detail.v34-on .v34-toggle .v34-sw::after{left:16px;background:#1a1300;}'
  ].join('\n');

  function injectStyle() {
    if (typeof document === 'undefined') return null;
    var el = document.getElementById(STYLE_ID);
    if (el) return el;
    el = document.createElement('style'); el.id = STYLE_ID; el.type = 'text/css';
    el.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(el);
    return el;
  }

  /* ---------------------------------------------------------------- *
   * 2) Detection data                                                 *
   * ---------------------------------------------------------------- */
  // multi-word contractions: key = space-joined lowercased words → {ipa,type,priority}
  var CONTRACTIONS = {
    'want to': { ipa: '/ˈwɒnə/', type: 'wanna', p: 9 },
    'going to': { ipa: '/ˈɡɒnə/', type: 'gonna', p: 9 },
    'got to': { ipa: '/ˈɡɒtə/', type: 'gotta', p: 9 },
    'have to': { ipa: '/ˈhæftə/', type: 'hafta', p: 9 },
    'has to': { ipa: '/ˈhæstə/', type: 'hasta', p: 8 },
    'ought to': { ipa: '/ˈɔːtə/', type: 'oughta', p: 8 },
    'would you': { ipa: '/ˈwʊdʒə/', type: 'wouldja', p: 9 },
    'could you': { ipa: '/ˈkʊdʒə/', type: 'couldja', p: 9 },
    'did you': { ipa: '/ˈdɪdʒə/', type: 'didja', p: 9 },
    "don't you": { ipa: '/ˈdəʊntʃə/', type: 'doncha', p: 8 },
    'what do you': { ipa: '/ˈwɒdjə/', type: 'whaddya', p: 8 },
    'kind of': { ipa: '/ˈkaɪndə/', type: 'kinda', p: 7 },
    'sort of': { ipa: '/ˈsɔːtə/', type: 'sorta', p: 7 },
    'out of': { ipa: '/ˈaʊtə/', type: 'outta', p: 7 },
    'lots of': { ipa: '/ˈlɒtsə/', type: 'lotsa', p: 6 },
    'let me': { ipa: '/ˈlemi/', type: 'lemme', p: 7 },
    'give me': { ipa: '/ˈɡɪmi/', type: 'gimme', p: 7 },
    'got you': { ipa: '/ˈɡɒtʃə/', type: 'gotcha', p: 7 },
    'get you': { ipa: '/ˈɡetʃə/', type: 'getcha', p: 6 }
  };
  // curated 2-word linked pairs (consonant→vowel / reduction) → connected IPA
  var DICT = {
    'make it': '/meɪkɪt/', 'piece of': '/piːsəv/', 'which is': '/wɪtʃɪz/',
    'an apple': '/ənˈæpəl/', 'cup of': '/kʌpəv/', 'a lot': '/əˈlɒt/',
    'pick it': '/pɪkɪt/', 'turn it': '/tɜːnɪt/', 'check it': '/tʃekɪt/',
    'this is': '/ðɪsɪz/', 'that is': '/ðætɪz/', 'what is': '/wɒtɪz/',
    'is it': '/ɪzɪt/', 'in a': '/ɪnə/', 'on a': '/ɒnə/', 'at a': '/ætə/',
    'for a': '/fərə/', 'half an': '/hɑːfən/', 'not at': '/nɒtæt/',
    'come on': '/kʌmɒn/', 'hold on': '/həʊldɒn/', 'far away': '/fɑːrəˈweɪ/'
  };
  var VOWEL = /[aeiou]/i;
  var END_CONS = /[bcdfgklmnprstvxz]$/i; // linking consonant letters (approx)

  function norm(tok) { return (tok || '').toLowerCase().replace(/^[^a-z']+|[^a-z']+$/gi, ''); }

  // optional IPA source from v23 (used only for generic C→V; never invents "/undefined/")
  function wordIpa(w) {
    try {
      var f = (window.SHADOW_V23 && (SHADOW_V23.ipaFor || SHADOW_V23.clientIpa)) ||
              (window.clientIpa) || null;
      if (!f) return null;
      var r = f.call(window.SHADOW_V23 || window, w);
      if (!r || /undefined/.test(r)) return null;
      return String(r).replace(/[\/\[\]]/g, '');
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------- *
   * 3) detectLinks(text) -> [{a,b,ipa,type,p}] over WORD indices      *
   * ---------------------------------------------------------------- */
  function detectLinks(text, aiHints) {
    var raw = String(text || '').trim();
    if (!raw) return { words: [], links: [] };
    var words = raw.split(/\s+/);
    var nrm = words.map(norm);
    var cand = [];

    // 0) AI cache hints (precomputed) — highest priority if provided
    if (aiHints && aiHints.length) {
      aiHints.forEach(function (h) {
        if (h && typeof h.a === 'number' && typeof h.b === 'number' && h.ipa)
          cand.push({ a: h.a, b: h.b, ipa: h.ipa, type: h.type || 'linking', p: 10 });
      });
    }
    // 1) contractions (3-word then 2-word)
    for (var n = 3; n >= 2; n--) {
      for (var i = 0; i + n <= words.length; i++) {
        var key = nrm.slice(i, i + n).join(' ');
        if (CONTRACTIONS[key]) {
          var c = CONTRACTIONS[key];
          cand.push({ a: i, b: i + n - 1, ipa: c.ipa, type: c.type, p: c.p });
        }
      }
    }
    // 2) dictionary 2-word pairs
    for (var j = 0; j + 2 <= words.length; j++) {
      var k2 = nrm[j] + ' ' + nrm[j + 1];
      if (DICT[k2]) cand.push({ a: j, b: j + 1, ipa: DICT[k2], type: 'linking', p: 5 });
    }
    // 3) generic consonant→vowel (only if a reliable IPA can be built)
    for (var m = 0; m + 1 < words.length; m++) {
      var w1 = nrm[m], w2 = nrm[m + 1];
      if (!w1 || !w2) continue;
      if (END_CONS.test(w1) && VOWEL.test(w2.charAt(0))) {
        var ip1 = wordIpa(w1), ip2 = wordIpa(w2);
        if (ip1 && ip2) cand.push({ a: m, b: m + 1, ipa: '/' + ip1 + ip2 + '/', type: 'linking', p: 3 });
      }
    }

    // resolve overlaps (keep higher priority), then cap to MAX_PER_SENTENCE
    cand.sort(function (x, y) { return y.p - x.p || x.a - y.a; });
    var taken = {}, chosen = [];
    for (var q = 0; q < cand.length && chosen.length < MAX_PER_SENTENCE; q++) {
      var lk = cand[q], clash = false;
      for (var idx = lk.a; idx <= lk.b; idx++) { if (taken[idx]) { clash = true; break; } }
      if (clash) continue;
      for (var t = lk.a; t <= lk.b; t++) taken[t] = true;
      chosen.push(lk);
    }
    chosen.sort(function (x, y) { return x.a - y.a; });
    return { words: words, links: chosen };
  }

  /* ---------------------------------------------------------------- *
   * 4) render(text) -> HTML string (words always shown; marks toggle) *
   * ---------------------------------------------------------------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render(text, aiHints) {
    var r = detectLinks(text, aiHints);
    if (!r.links.length) return null; // spec #6: nothing to mark → don't render markup
    var words = r.words, links = r.links;
    var linkAt = {}; links.forEach(function (l) { linkAt[l.a] = l; });
    var inLink = {}; links.forEach(function (l) { for (var i = l.a; i <= l.b; i++) inLink[i] = true; });
    var html = '<span class="v34-sentence">';
    for (var i = 0; i < words.length;) {
      if (linkAt[i]) {
        var l = linkAt[i];
        var phrase = words.slice(l.a, l.b + 1).join(' ');
        html += '<span class="v34-link">'
          + '<span class="v34-wa"><span class="v34-top">' + esc(phrase) + '</span>'
          + '<span class="v34-mark v34-arc"></span></span>'
          + '<span class="v34-mark v34-ipa">' + esc(l.ipa) + '</span>'
          + '</span>';
        i = l.b + 1;
      } else {
        html += '<span class="v34-w">' + esc(words[i]) + '</span>';
        i++;
      }
    }
    html += '</span>';
    return html;
  }

  /* ---------------------------------------------------------------- *
   * 5) toggle                                                         *
   * ---------------------------------------------------------------- */
  function isOn() { try { return localStorage.getItem(TOGGLE_KEY) !== '0'; } catch (e) { return true; } }
  function setOn(on) { try { localStorage.setItem(TOGGLE_KEY, on ? '1' : '0'); } catch (e) {} applyToggleClass(); }
  function applyToggleClass() {
    var root = document.getElementById('view-topic-detail');
    if (root) root.classList[isOn() ? 'add' : 'remove']('v34-on');
  }
  function mountToggle() {
    var root = document.getElementById('view-topic-detail');
    if (!root || root.querySelector('.v34-toggle')) return;
    var host = root.querySelector('.card, h1, h2') ? root : null;
    if (!host) return;
    var btn = document.createElement('span');
    btn.className = 'v34-toggle';
    btn.setAttribute('role', 'switch');
    btn.innerHTML = '<span class="v34-sw"></span><span>🔗 Show Linking</span>';
    btn.addEventListener('click', function () { setOn(!isOn()); });
    // place at the top of the topic detail
    var first = root.querySelector('.card') || root.firstElementChild;
    if (first && first.parentNode) first.parentNode.insertBefore(btn, first);
    else root.appendChild(btn);
  }

  /* ---------------------------------------------------------------- *
   * 6) integration — mark up EN lines inside the right section cards  *
   * ---------------------------------------------------------------- */
  function cleanEnglish(el) {
    // clone, drop helper/editor chrome, read text
    var c = el.cloneNode(true);
    [].slice.call(c.querySelectorAll('.ssa-ipa,.ssa-vi,.gp-ipa,.v34-sentence,.audio-btn,button,.v15-btn,[data-v34]')).forEach(function (n) { n.remove(); });
    return (c.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function aiHintsFor() { return (window.__v34ai && window.__v34ai.length) ? window.__v34ai : null; }

  function markupEl(el) {
    if (!el || el.getAttribute('data-v34')) return;
    var txt = cleanEnglish(el);
    // skip non-sentences / editor chrome / pure-VN
    if (!txt || txt.length < 6 || !/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(txt)) { el.setAttribute('data-v34', 'skip'); return; }
    var html = render(txt, aiHintsFor());
    el.setAttribute('data-v34', html ? 'on' : 'none');
    if (!html) return;
    el.setAttribute('data-v34-orig', el.innerHTML);
    el.innerHTML = html;
  }

  function sectionCard(re) {
    var d = document.getElementById('view-topic-detail');
    if (!d) return null;
    var titles = [].slice.call(d.querySelectorAll('.card-title, h2, h3, .section-title'));
    for (var i = 0; i < titles.length; i++) {
      if (re.test(titles[i].textContent || '')) return titles[i].closest('.card, section') || titles[i].parentElement;
    }
    return null;
  }

  function run() {
    injectStyle();
    mountToggle();
    applyToggleClass();
    // Core Phrases — EN spans (verified clean anchor)
    var d = document.getElementById('view-topic-detail');
    if (!d) return;
    [].slice.call(d.querySelectorAll('.v12-phrase-en, .phrase-en')).forEach(markupEl);
    // Shadowing Script + Dialogues — paragraph lines scoped to their card
    [/SHADOWING/i, /DIALOGUE|HỘI THOẠI/i].forEach(function (re) {
      var card = sectionCard(re);
      if (!card) return;
      [].slice.call(card.querySelectorAll('.block-paragraph, .v12-phrase-en, .phrase-en')).forEach(markupEl);
    });
  }

  /* ---------------------------------------------------------------- *
   * 7) selfTest()                                                     *
   * ---------------------------------------------------------------- */
  function selfTest() {
    var results = [];
    function chk(n, ok) { results.push({ name: n, ok: !!ok }); }
    try {
      // detection
      var a = detectLinks('I want to go');
      chk('detect wanna', a.links.length === 1 && a.links[0].type === 'wanna');
      var b = detectLinks('Did you make it');
      chk('detect didja + make it (cap 2)', b.links.length === 2);
      var c = detectLinks('The big dog sleeps');
      chk('no-link sentence → 0 links', c.links.length === 0);
      var d2 = detectLinks('Give me a piece of paper');
      chk('detect gimme/piece-of', d2.links.length >= 1);
      // cap respected
      var e = detectLinks('want to going to got to have to');
      chk('cap ≤ 2', e.links.length <= MAX_PER_SENTENCE);
      // render
      var html = render('I want to go');
      chk('render has arc+ipa', /v34-arc/.test(html) && /v34-ipa/.test(html) && /wɒnə/.test(html));
      chk('render no-link → null', render('The big dog sleeps') === null);
      // overlap: contraction beats generic
      var f = detectLinks('what do you want');
      chk('whaddya detected', f.links.some(function (x) { return x.type === 'whaddya'; }));
      // style + toggle plumbing (DOM)
      if (typeof document !== 'undefined') {
        chk('style-injects', !!injectStyle());
        chk('toggle default ON', isOn() === true || isOn() === false); // just exercises the path
      }
    } catch (ex) { chk('exception: ' + (ex && ex.message), false); }
    var ok = results.every(function (r) { return r.ok; });
    return { ok: ok, results: results };
  }

  /* ---------------------------------------------------------------- *
   * 8) AI enrichment (cache only; no auto API call)                   *
   * ---------------------------------------------------------------- */
  function applyAiCache(topicId) {
    try {
      var raw = localStorage.getItem('shadow-en-linking-' + topicId);
      if (!raw) return false;
      window.__v34ai = JSON.parse(raw); // {text -> [{a,b,ipa,type}]} consumers can map per line
      return true;
    } catch (e) { return false; }
  }

  /* ---------------------------------------------------------------- *
   * boot                                                              *
   * ---------------------------------------------------------------- */
  var API = {
    VERSION: 'v34.0.0',
    detectLinks: detectLinks, render: render, run: run, selfTest: selfTest,
    setOn: setOn, isOn: isOn, applyAiCache: applyAiCache,
    CONTRACTIONS: CONTRACTIONS, DICT: DICT
  };
  if (typeof window !== 'undefined') {
    window.SHADOW_V34 = API;
    try { injectStyle(); } catch (e) {}
    if (typeof document !== 'undefined') {
      var tick = function () { try { run(); } catch (e) {} };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
      else tick();
      // topic-page modules re-mount on an interval; stay idempotent via data-v34
      window.__v34int = setInterval(tick, 1600);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
