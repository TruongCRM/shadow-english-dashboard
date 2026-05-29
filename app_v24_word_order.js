/* ============================================================================
 * SHADOW ENGLISH - v24  WORD ORDER CHALLENGE (Sentence Builder)   (ADDITIVE)
 * ----------------------------------------------------------------------------
 * Turns the existing CORE PHRASES on a topic page into a "rebuild the sentence"
 * drill: the learner sees the words of a phrase shuffled out of order and must
 * mentally re-order them into the full sentence, then taps "Show Answer".
 *
 * Goal: move the learner from RECOGNISING a sentence to ACTIVELY BUILDING it
 *       (structure recall + active speaking), reusing data that already exists.
 *
 * Design (all additive, all reversible by deleting one <script> line):
 *   1) NO new data, NO extra Gemini calls. It reads the Core Phrases already
 *      rendered on the topic page (.phrase-en inside #view-topic-detail).
 *   2) Picks up to 5 useful phrases (2..12 words), shuffles their word order
 *      with a DETERMINISTIC per-phrase seed (Show Answer is stable; chips do
 *      not reshuffle on the 1.5s re-mount).
 *   3) UI: a new card "🧩 WORD ORDER CHALLENGE" appended near the end of the
 *      topic page (after Core Phrases / Missions / Recall). Token pills + a
 *      "👁 Show Answer" button per challenge.
 *   4) Level scaffold: L1 Show Answer (DONE) / L2 Check Answer / L3 Drag&Drop
 *      (NOT implemented — kept simple on purpose).
 *   5) Backward compatible: a topic with no/invalid Core Phrases -> block is
 *      hidden, never crashes; does NOT touch state, overlays, Review, Memory,
 *      Shadow Script, Recall, Dashboard, or any other module.
 *
 * Does NOT edit: app.js, Review, Memory, Learning Loop, Gemini, v12/v15/v17,
 * v20 engines, v22, v23. Pure DOM append, idempotent via data-wo attribute.
 * Run SHADOW_V24.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V24) return;
  var VERSION = 'v24.0.0';
  var MAX_CHALLENGES = 5;
  var MIN_WORDS = 2;
  var MAX_WORDS = 12;

  function log() { try { console.log.apply(console, ['[v24]'].concat([].slice.call(arguments))); } catch (e) {} }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ----------------------------------------------------- challenge builder */
  // Split a sentence into display tokens (words), stripping only outer
  // punctuation per token. Keeps inner apostrophes ("I'd", "Could").
  function tokenize(sentence) {
    var raw = String(sentence == null ? '' : sentence).trim();
    if (!raw) return [];
    return raw.split(/\s+/).map(function (w) {
      // strip leading/trailing punctuation but keep inner ' and -
      return w.replace(/^[^\p{L}\p{N}'’-]+/u, '').replace(/[^\p{L}\p{N}'’-]+$/u, '');
    }).filter(function (w) { return w.length > 0; });
  }

  // Deterministic PRNG (mulberry32) seeded from the phrase text, so the same
  // phrase always shuffles the same way (stable across the re-mount interval).
  function seedFrom(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h >>> 0);
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Returns a shuffled copy of tokens that is guaranteed different from the
  // original order (when length > 1), using the seeded PRNG.
  function shuffleTokens(tokens, seedStr) {
    var n = tokens.length;
    if (n < 2) return tokens.slice();
    var rnd = mulberry32(seedFrom(seedStr));
    var arr = tokens.slice();
    for (var i = n - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    // ensure it differs from the original order; rotate if identical
    var same = arr.every(function (t, k) { return t === tokens[k]; });
    if (same) { arr.push(arr.shift()); }
    return arr;
  }

  // Build a challenge object from a raw English phrase, or null if unsuitable.
  function buildChallenge(phrase) {
    var answer = String(phrase == null ? '' : phrase).trim();
    var tokens = tokenize(answer);
    if (tokens.length < MIN_WORDS || tokens.length > MAX_WORDS) return null;
    return { answer: answer, tokens: tokens, shuffled: shuffleTokens(tokens, answer) };
  }

  // From a list of raw English phrases, pick up to MAX_CHALLENGES challenges
  // (in document order, de-duplicated).
  function buildChallenges(phrases) {
    var out = [], seen = {};
    for (var i = 0; i < phrases.length && out.length < MAX_CHALLENGES; i++) {
      var p = String(phrases[i] == null ? '' : phrases[i]).trim();
      var key = p.toLowerCase();
      if (!p || seen[key]) continue;
      var c = buildChallenge(p);
      if (c) { out.push(c); seen[key] = 1; }
    }
    return out;
  }

  /* ------------------------------------------------------- DOM integration */
  function activeTopicView() {
    var v = document.getElementById('view-topic-detail');
    if (!v) return null;
    return v.classList.contains('active') ? v : null;
  }

  // Read the Core Phrases currently rendered on the topic page.
  function readPhrases(view) {
    var els = view.querySelectorAll('.phrase-row .phrase-en, .v12-phrase-row .v12-phrase-en');
    var out = [];
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim();
      if (t) out.push(t);
    }
    return out;
  }

  function challengeCardHTML(challenges) {
    var items = challenges.map(function (c, idx) {
      var pills = c.shuffled.map(function (tok) {
        return '<span class="wo-pill">' + esc(tok) + '</span>';
      }).join('');
      return '' +
        '<div class="wo-item">' +
        '  <div class="wo-item-head"><span class="wo-num">' + (idx + 1) + '</span></div>' +
        '  <div class="wo-pills">' + pills + '</div>' +
        '  <button type="button" class="wo-show" data-wo-show>👁 Show Answer</button>' +
        '  <div class="wo-answer" hidden>' + esc(c.answer) + '</div>' +
        '</div>';
    }).join('');
    return '' +
      '<div class="card wo-card" id="shadow-v24-root" style="grid-column:1/-1">' +
      '  <div class="card-title">🧩 WORD ORDER CHALLENGE</div>' +
      '  <div class="wo-sub">Sắp xếp các từ thành câu hoàn chỉnh</div>' +
      '  <div class="wo-grid">' + items + '</div>' +
      '</div>';
  }

  function wireCard(root) {
    var btns = root.querySelectorAll('[data-wo-show]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function () {
        var ans = this.parentNode.querySelector('.wo-answer');
        if (!ans) return;
        var hidden = ans.hasAttribute('hidden');
        if (hidden) { ans.removeAttribute('hidden'); this.textContent = '🙈 Ẩn đáp án'; this.classList.add('wo-show-open'); }
        else { ans.setAttribute('hidden', ''); this.textContent = '👁 Show Answer'; this.classList.remove('wo-show-open'); }
      };
    }
  }

  function removeCard() {
    var old = document.getElementById('shadow-v24-root');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  // Main render pass. Idempotent: rebuilds only when the phrase set changes.
  function run() {
    try {
      var view = activeTopicView();
      if (!view) { removeCard(); return; }            // not on a topic page
      var phrases = readPhrases(view);
      var challenges = buildChallenges(phrases);
      if (!challenges.length) { removeCard(); return; } // backward-compat: hide

      var sig = challenges.map(function (c) { return c.answer; }).join('|');
      var existing = document.getElementById('shadow-v24-root');
      if (existing && existing.getAttribute('data-wo') === sig &&
          view.contains(existing)) {
        return; // already rendered for this exact phrase set
      }
      removeCard();
      view.insertAdjacentHTML('beforeend', challengeCardHTML(challenges));
      var root = document.getElementById('shadow-v24-root');
      if (root) { root.setAttribute('data-wo', sig); wireCard(root); }
    } catch (e) { log('run error', e); }
  }

  /* ------------------------------------------------------------------ CSS */
  function injectCSS() {
    if (document.getElementById('wo-css')) return;
    var css = [
      '.wo-card .wo-sub{font-size:12px;color:var(--text-2);margin:-2px 0 14px}',
      '.wo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}',
      '.wo-item{background:var(--card-2);border:1px solid var(--border);border-radius:12px;padding:14px}',
      '.wo-item-head{display:flex;align-items:center;margin-bottom:10px}',
      '.wo-num{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--purple);color:#fff;font-size:12px;font-weight:700}',
      '.wo-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}',
      '.wo-pill{display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap}',
      '.wo-show{appearance:none;cursor:pointer;border:1px solid var(--purple);background:transparent;color:var(--purple);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;transition:background .15s ease,color .15s ease}',
      '.wo-show:hover{background:var(--purple);color:#fff}',
      '.wo-show.wo-show-open{border-color:var(--green);color:var(--green)}',
      '.wo-show.wo-show-open:hover{background:var(--green);color:#fff}',
      '.wo-answer{margin-top:10px;padding:10px 14px;background:rgba(124,92,255,.12);border-left:3px solid var(--purple);border-radius:8px;font-size:14px;font-weight:600;color:var(--text);line-height:1.4}',
      '@media(max-width:520px){.wo-grid{grid-template-columns:1fr}.wo-pill{font-size:13px;padding:6px 12px;white-space:normal}}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'wo-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------- public API */
  window.SHADOW_V24 = {
    version: VERSION,
    run: run,
    tokenize: tokenize,
    shuffleTokens: shuffleTokens,
    buildChallenge: buildChallenge,
    buildChallenges: buildChallenges,
    selfTest: selfTest
  };

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }

    // tokenize strips outer punctuation, keeps inner apostrophe
    var t1 = tokenize('How much does it cost?');
    check('tokenize words count (5)', t1.length === 5);
    check('tokenize strips trailing ? (cost)', t1.indexOf('cost') !== -1 && t1.indexOf('cost?') === -1);
    var t2 = tokenize("I'd like to order a pizza.");
    check('tokenize keeps inner apostrophe (I\'d)', t2[0] === "I'd");
    var tv = tokenize('cá nhân');
    check('tokenize keeps Unicode letters (cá nhân)', tv.length === 2 && tv[0] === 'cá' && tv[1] === 'nhân');

    // shuffle: same length, same multiset, differs from original (len>1)
    var sh = shuffleTokens(t1, 'How much does it cost?');
    check('shuffle preserves length', sh.length === t1.length);
    check('shuffle preserves multiset', sh.slice().sort().join('|') === t1.slice().sort().join('|'));
    check('shuffle differs from original', sh.join(' ') !== t1.join(' '));
    // deterministic: same seed -> same result
    var sh2 = shuffleTokens(t1, 'How much does it cost?');
    check('shuffle deterministic (stable)', sh.join(' ') === sh2.join(' '));

    // buildChallenge filters
    check('1-word phrase rejected', buildChallenge('Hello') === null);
    check('empty phrase rejected', buildChallenge('') === null);
    var c = buildChallenge('Thank you so much');
    check('valid phrase -> challenge', !!c && c.tokens.length === 4 && c.answer === 'Thank you so much');

    // buildChallenges caps at 5, de-dups, skips invalid
    var list = buildChallenges([
      'Can we see the menu, please?',
      'Could I have some water, please?',
      'How much does it cost?',
      "I'd like to order a pizza.",
      'Thank you so much.',
      'Hi',                       // too short -> skipped
      'Thank you so much.'        // dup -> skipped
    ]);
    check('buildChallenges count == 5', list.length === 5);
    check('buildChallenges de-dups + skips short', list.length === 5);

    // does not crash on garbage
    check('garbage input no crash', (function () { try { buildChallenges([null, undefined, 5, {}, '   ']); return true; } catch (e) { return false; } })());

    // does not touch other modules
    check('does NOT touch Learning Loop', !window.LoopV14 || typeof window.LoopV14.selfTest === 'function');
    check('does NOT touch v20 engines', !window.SHADOW_V20 || typeof window.SHADOW_V20.smartNextAction === 'function');
    check('does NOT touch v23 assist', !window.SHADOW_V23 || typeof window.SHADOW_V23.selfTest === 'function');

    // CSS present after injection (in a real browser DOM)
    if (typeof document !== 'undefined' && document.getElementById && document.createElement) {
      try { injectCSS(); } catch (e) {}
      check('css injected', !!document.getElementById('wo-css'));
    }

    try {
      console.log('%c[v24] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
      out.forEach(function (l) { log(l); });
    } catch (e) {}
    return { ok: ok, results: out };
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    run();
    window.addEventListener('hashchange', function () { setTimeout(run, 120); });
    // the topic page re-renders on navigate; re-run on an interval (idempotent
    // via the data-wo signature, so it only rebuilds when the phrase set changes)
    setInterval(run, 1500);
    log('ready', VERSION, '- run SHADOW_V24.selfTest() to verify.');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 900); });
    } else { setTimeout(boot, 900); }
  }
})();
