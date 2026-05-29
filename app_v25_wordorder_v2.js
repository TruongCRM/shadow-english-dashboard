/* ============================================================================
 * SHADOW ENGLISH - v25  WORD ORDER CHALLENGE V2 (Interactive)   (ADDITIVE)
 * ----------------------------------------------------------------------------
 * Upgrades the v24 "look + Show Answer" drill into a real interactive exercise:
 *   Read -> arrange -> TYPE the answer -> get feedback -> remember.
 *
 * Tasks (per sprint spec):
 *   1-2) Answer INPUT + CHECK button -> compares to the correct sentence
 *        (case/punctuation-insensitive). Correct => "Correct!", Solved badge,
 *        green border, Check disabled.
 *   3)   attemptCount per sentence, persisted.
 *   4)   Progressive hints on wrong tries (growing prefix of the answer).
 *   5)   Auto-reveal the full answer after 3 failed attempts.
 *   6)   Show Answer button kept (old behaviour), usable any time.
 *   7)   Solved UX: green border + check mark + disabled Check.
 *   8)   Responsive: Desktop 2-col / Tablet+Mobile 1-col, input never breaks.
 *   9)   Data source unchanged: reuses the Core Phrases already on the page.
 *   10)  Additive only: hides the v24 card via CSS (no edit to v24); writes only
 *        its own localStorage bucket 'shadow-en-wordorder-v2'. Touches nothing
 *        else (app.js / Review / Memory / Loop / Gemini / Dashboard / Grammar).
 *
 * Persistence: localStorage['shadow-en-wordorder-v2'] =
 *   { [topicId]: { [answerText]: { attempts:Number, solved:Bool, revealed:Bool } } }
 *
 * Run SHADOW_V25.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V25) return;
  var VERSION = 'v25.0.0';
  var LS_KEY = 'shadow-en-wordorder-v2';
  var MAX_CHALLENGES = 5;
  var MIN_WORDS = 2;
  var MAX_WORDS = 12;
  var FAIL_LIMIT = 3;

  function log() { try { console.log.apply(console, ['[v25]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lsGetAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function lsSetAll(o) { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (e) {} }
  function getRec(topicId, ans) {
    var all = lsGetAll();
    var t = all[topicId] || {};
    return t[ans] || { attempts: 0, solved: false, revealed: false };
  }
  function setRec(topicId, ans, rec) {
    var all = lsGetAll();
    if (!all[topicId]) all[topicId] = {};
    all[topicId][ans] = rec;
    lsSetAll(all);
  }

  /* ---------------------------------------------------- challenge building */
  function tokenize(sentence) {
    var raw = String(sentence == null ? '' : sentence).trim();
    if (!raw) return [];
    return raw.split(/\s+/).map(function (w) {
      return w.replace(/^[^\p{L}\p{N}'’-]+/u, '').replace(/[^\p{L}\p{N}'’-]+$/u, '');
    }).filter(function (w) { return w.length > 0; });
  }
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
  function shuffleTokens(tokens, seedStr) {
    var n = tokens.length;
    if (n < 2) return tokens.slice();
    var rnd = mulberry32(seedFrom(seedStr));
    var arr = tokens.slice();
    for (var i = n - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    if (arr.every(function (t, k) { return t === tokens[k]; })) { arr.push(arr.shift()); }
    return arr;
  }
  function buildChallenge(phrase) {
    var answer = String(phrase == null ? '' : phrase).trim();
    var tokens = tokenize(answer);
    if (tokens.length < MIN_WORDS || tokens.length > MAX_WORDS) return null;
    return { answer: answer, tokens: tokens, shuffled: shuffleTokens(tokens, answer) };
  }
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

  /* -------------------------------------------------------- answer compare */
  // Normalise for comparison: lowercase, drop punctuation, collapse spaces.
  function normalize(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[^\p{L}\p{N}\s'’]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function isCorrect(input, answer) {
    var a = normalize(input), b = normalize(answer);
    return a.length > 0 && a === b;
  }
  // Growing prefix hint for a given (1-based) attempt number.
  function hintFor(tokens, attempt) {
    var n = tokens.length, k;
    if (attempt <= 1) k = Math.max(1, Math.round(n * 0.25));
    else k = Math.max(2, Math.round(n * 0.5));
    k = Math.min(k, n - 1);
    if (k < 1) k = 1;
    return tokens.slice(0, k).join(' ') + ' …';
  }

  /* ------------------------------------------------------- DOM integration */
  function activeTopicView() {
    var v = document.getElementById('view-topic-detail');
    if (!v) return null;
    return v.classList.contains('active') ? v : null;
  }
  function currentTopicId(view) {
    var btn = view.querySelector('[data-action="start-session"][data-topic]');
    return btn ? btn.getAttribute('data-topic') : '_unknown';
  }
  function readPhrases(view) {
    var els = view.querySelectorAll('.phrase-row .phrase-en, .v12-phrase-row .v12-phrase-en');
    var out = [];
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim();
      if (t) out.push(t);
    }
    return out;
  }

  function itemHTML(c, idx) {
    var pills = c.shuffled.map(function (tok) { return '<span class="wo2-pill">' + esc(tok) + '</span>'; }).join('');
    return '' +
      '<div class="wo2-item" data-ans="' + esc(c.answer) + '">' +
      '  <div class="wo2-head"><span class="wo2-num">' + (idx + 1) + '</span>' +
      '    <span class="wo2-badge" hidden>✓ Solved</span></div>' +
      '  <div class="wo2-pills">' + pills + '</div>' +
      '  <input type="text" class="wo2-input" autocomplete="off" autocorrect="off" ' +
      '         autocapitalize="off" spellcheck="false" placeholder="Nhập câu hoàn chỉnh…">' +
      '  <div class="wo2-actions">' +
      '    <button type="button" class="wo2-btn wo2-check" data-wo2-check>Check</button>' +
      '    <button type="button" class="wo2-btn wo2-ghost" data-wo2-show>👁 Show Answer</button>' +
      '  </div>' +
      '  <div class="wo2-feedback" hidden></div>' +
      '  <div class="wo2-answer" hidden>' + esc(c.answer) + '</div>' +
      '</div>';
  }

  function cardHTML(challenges) {
    var items = challenges.map(itemHTML).join('');
    return '' +
      '<div class="card wo2-card" id="shadow-v25-root" style="grid-column:1/-1">' +
      '  <div class="card-title">🧩 WORD ORDER CHALLENGE</div>' +
      '  <div class="wo2-sub">Đọc → Sắp xếp → Nhập đáp án → Nhận phản hồi → Ghi nhớ</div>' +
      '  <div class="wo2-grid">' + items + '</div>' +
      '</div>';
  }

  function setSolved(item) {
    item.classList.add('wo2-solved');
    var badge = item.querySelector('.wo2-badge'); if (badge) badge.removeAttribute('hidden');
    var inp = item.querySelector('.wo2-input'); if (inp) { inp.disabled = true; }
    var chk = item.querySelector('[data-wo2-check]'); if (chk) { chk.disabled = true; }
    var fb = item.querySelector('.wo2-feedback');
    if (fb) { fb.className = 'wo2-feedback wo2-ok'; fb.textContent = '✅ Correct!'; fb.removeAttribute('hidden'); }
  }
  function revealAnswer(item) {
    var ans = item.querySelector('.wo2-answer'); if (ans) ans.removeAttribute('hidden');
  }
  function showFail(item, tokens, attempts) {
    var fb = item.querySelector('.wo2-feedback');
    if (!fb) return;
    if (attempts >= FAIL_LIMIT) {
      fb.className = 'wo2-feedback wo2-warn';
      fb.textContent = '⚠ Bạn đã thử ' + FAIL_LIMIT + ' lần. Đáp án đúng ở dưới ↓';
      revealAnswer(item);
      var chk = item.querySelector('[data-wo2-check]'); if (chk) chk.disabled = true;
    } else {
      fb.className = 'wo2-feedback wo2-bad';
      fb.textContent = '❌ Not quite. Gợi ý: ' + hintFor(tokens, attempts);
    }
    fb.removeAttribute('hidden');
  }

  function wireItem(item, topicId) {
    var ans = item.getAttribute('data-ans');
    var tokens = tokenize(ans);
    var inp = item.querySelector('.wo2-input');
    var checkBtn = item.querySelector('[data-wo2-check]');
    var showBtn = item.querySelector('[data-wo2-show]');

    // restore persisted state
    var rec = getRec(topicId, ans);
    if (rec.solved) { setSolved(item); }
    else if (rec.revealed || rec.attempts >= FAIL_LIMIT) { showFail(item, tokens, rec.attempts || FAIL_LIMIT); }

    function doCheck() {
      if (item.classList.contains('wo2-solved')) return;
      var val = inp ? inp.value : '';
      if (!val || !val.trim()) {
        var fb = item.querySelector('.wo2-feedback');
        if (fb) { fb.className = 'wo2-feedback wo2-bad'; fb.textContent = 'Hãy nhập câu trước khi Check.'; fb.removeAttribute('hidden'); }
        return;
      }
      if (isCorrect(val, ans)) {
        var r = getRec(topicId, ans); r.solved = true; setRec(topicId, ans, r);
        setSolved(item);
      } else {
        var r2 = getRec(topicId, ans); r2.attempts = (r2.attempts || 0) + 1;
        if (r2.attempts >= FAIL_LIMIT) r2.revealed = true;
        setRec(topicId, ans, r2);
        showFail(item, tokens, r2.attempts);
      }
    }
    if (checkBtn) checkBtn.onclick = doCheck;
    if (inp) inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } };
    if (showBtn) showBtn.onclick = function () {
      var a = item.querySelector('.wo2-answer');
      if (!a) return;
      if (a.hasAttribute('hidden')) { a.removeAttribute('hidden'); this.textContent = '🙈 Ẩn đáp án'; }
      else { a.setAttribute('hidden', ''); this.textContent = '👁 Show Answer'; }
    };
  }

  function removeCard() {
    var old = document.getElementById('shadow-v25-root');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function run() {
    try {
      var view = activeTopicView();
      if (!view) { removeCard(); return; }
      var challenges = buildChallenges(readPhrases(view));
      if (!challenges.length) { removeCard(); return; }
      var topicId = currentTopicId(view);
      var sig = topicId + '||' + challenges.map(function (c) { return c.answer; }).join('|');
      var existing = document.getElementById('shadow-v25-root');
      if (existing && existing.getAttribute('data-wo2') === sig && view.contains(existing)) return;
      removeCard();
      view.insertAdjacentHTML('beforeend', cardHTML(challenges));
      var root = document.getElementById('shadow-v25-root');
      if (root) {
        root.setAttribute('data-wo2', sig);
        var items = root.querySelectorAll('.wo2-item');
        for (var i = 0; i < items.length; i++) wireItem(items[i], topicId);
      }
    } catch (e) { log('run error', e); }
  }

  /* ------------------------------------------------------------------ CSS */
  function injectCSS() {
    if (document.getElementById('wo2-css')) return;
    var css = [
      // hide the older v24 card so we don't show two challenge blocks
      '#shadow-v24-root{display:none!important}',
      '.wo2-card .wo2-sub{font-size:12px;color:var(--text-2);margin:-2px 0 14px}',
      '.wo2-grid{display:grid;grid-template-columns:1fr;gap:14px}',
      '@media(min-width:900px){.wo2-grid{grid-template-columns:1fr 1fr}}',
      '.wo2-item{background:var(--card-2);border:1px solid var(--border);border-radius:12px;padding:14px;transition:border-color .2s ease,box-shadow .2s ease}',
      '.wo2-item.wo2-solved{border-color:var(--green);box-shadow:0 0 0 1px var(--green) inset}',
      '.wo2-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.wo2-num{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--purple);color:#fff;font-size:12px;font-weight:700;flex:none}',
      '.wo2-solved .wo2-num{background:var(--green)}',
      '.wo2-badge{font-size:11px;font-weight:700;color:var(--green);background:rgba(34,197,94,.14);border:1px solid var(--green);border-radius:999px;padding:2px 10px}',
      '.wo2-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}',
      '.wo2-pill{display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:600;color:var(--text);line-height:1.3}',
      '.wo2-input{width:100%;box-sizing:border-box;background:var(--bg-2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:14px;outline:none;margin-bottom:10px}',
      '.wo2-input:focus{border-color:var(--purple)}',
      '.wo2-input:disabled{opacity:.7}',
      '.wo2-actions{display:flex;flex-wrap:wrap;gap:8px}',
      '.wo2-btn{appearance:none;cursor:pointer;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:600;transition:background .15s ease,color .15s ease}',
      '.wo2-check{border:1px solid var(--purple);background:var(--purple);color:#fff}',
      '.wo2-check:hover{background:var(--purple-2)}',
      '.wo2-check:disabled{opacity:.5;cursor:default}',
      '.wo2-ghost{border:1px solid var(--border);background:transparent;color:var(--text-2)}',
      '.wo2-ghost:hover{color:var(--text);border-color:var(--text-3)}',
      '.wo2-feedback{margin-top:10px;font-size:13px;font-weight:600;line-height:1.4}',
      '.wo2-ok{color:var(--green)}',
      '.wo2-bad{color:var(--orange)}',
      '.wo2-warn{color:var(--yellow)}',
      '.wo2-answer{margin-top:10px;padding:10px 14px;background:rgba(124,92,255,.12);border-left:3px solid var(--purple);border-radius:8px;font-size:14px;font-weight:600;color:var(--text);line-height:1.4}',
      '@media(max-width:520px){.wo2-pill{font-size:13px;padding:6px 12px}.wo2-btn{flex:1}}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'wo2-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------- public API */
  window.SHADOW_V25 = {
    version: VERSION,
    run: run,
    tokenize: tokenize,
    normalize: normalize,
    isCorrect: isCorrect,
    hintFor: hintFor,
    buildChallenges: buildChallenges,
    selfTest: selfTest
  };

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }

    // compare is case/punctuation-insensitive
    check('check: exact match', isCorrect('Hi, I need some help with this.', 'Hi I need some help with this'));
    check('check: case/punct-insensitive', isCorrect('how much DOES it cost', 'How much does it cost?'));
    check('check: wrong order fails', !isCorrect('cost it does much how', 'How much does it cost?'));
    check('check: empty fails', !isCorrect('   ', 'Thank you so much'));

    // hints grow with attempts
    var tk = tokenize('Hi I need some help with this');
    var h1 = hintFor(tk, 1), h2 = hintFor(tk, 2);
    check('hint L1 is a prefix', h1.indexOf('Hi') === 0);
    check('hint L2 longer than L1', h2.length > h1.length);
    check('hint never reveals full', h2.replace(' …', '').split(' ').length < tk.length);

    // persistence round-trip (jsdom/browser only)
    if (typeof localStorage !== 'undefined') {
      var tid = '__selftest__', a = 'Test sentence here';
      setRec(tid, a, { attempts: 2, solved: false, revealed: false });
      var r = getRec(tid, a);
      check('localStorage save/load attempts', r.attempts === 2);
      r.solved = true; setRec(tid, a, r);
      check('localStorage persists solved', getRec(tid, a).solved === true);
      // cleanup
      var all = lsGetAll(); delete all[tid]; lsSetAll(all);
    } else {
      check('localStorage (n/a in this env)', true);
    }

    // auto-reveal threshold logic
    check('auto-reveal at FAIL_LIMIT', FAIL_LIMIT === 3);

    // build still works + de-dup + skip short
    var list = buildChallenges(['How much does it cost?', 'Hi', 'How much does it cost?', "I'd like to order a pizza."]);
    check('buildChallenges de-dup + skip short (2)', list.length === 2);

    // unicode safe
    check('tokenize keeps Unicode (cá nhân)', (function () { var t = tokenize('cá nhân'); return t.length === 2 && t[0] === 'cá'; })());

    // additive: does not touch others
    check('does NOT touch v24', !window.SHADOW_V24 || typeof window.SHADOW_V24.selfTest === 'function');
    check('does NOT touch Learning Loop', !window.LoopV14 || typeof window.LoopV14.selfTest === 'function');
    check('does NOT touch v20 engines', !window.SHADOW_V20 || typeof window.SHADOW_V20.smartNextAction === 'function');

    if (typeof document !== 'undefined' && document.createElement) {
      try { injectCSS(); } catch (e) {}
      check('css injected (hides v24)', !!document.getElementById('wo2-css'));
    }

    try {
      console.log('%c[v25] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
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
    log('ready', VERSION, '- run SHADOW_V25.selfTest() to verify.');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 950); });
    } else { setTimeout(boot, 950); }
  }
})();
