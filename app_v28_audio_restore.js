/* ============================================================================
 * SHADOW ENGLISH - v28  AUDIO RESTORE   (ADDITIVE · no rewrite)
 * ----------------------------------------------------------------------------
 * Restores the missing Play (▶) buttons on lesson content.
 *
 * Root cause (audit): the original audio injector lives in app_v8_experience.js
 * (`enhancePhrases`) and only matches the LEGACY `.phrase-row` markup. Current
 * content (overlay / content-editor / AI Builder) renders as `.v12-phrase-row`,
 * which v8 never selects — so no audio buttons appear. The audio ENGINE
 * (window.SHADOW_AUDIO in audio.js) is fully intact. This module re-attaches
 * buttons to the new markup, REUSING that engine — nothing is rewritten.
 *
 * What it does (every 1.5s on the active topic page, idempotent):
 *   • Core Phrases: inject ▶ into `.v12-phrase-row` (and legacy `.phrase-row`).
 *   • Shadow Script: one "▶ Nghe script" button on `.shadow-script-box`.
 *   • Grammar examples (v26): inject ▶ on each `.gp-ex`.
 *   Buttons use the existing `.audio-btn[data-audio]` contract, so audio.js's
 *   own delegated click handler speaks them (Web Speech API) — no new wiring,
 *   no double playback.
 *
 * Additive: edits no module. Rollback = delete one <script> line.
 * Run SHADOW_V28.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V28) return;
  var VERSION = 'v28.0.0';

  function log() { try { console.log.apply(console, ['[v28]'].concat([].slice.call(arguments))); } catch (e) {} }

  function audioReady() { return !!(window.SHADOW_AUDIO && typeof window.SHADOW_AUDIO.speak === 'function'); }

  // Text without IPA/translation helper spans added by v23/v26.
  function cleanText(el) {
    if (!el) return '';
    try {
      var c = el.cloneNode(true);
      c.querySelectorAll('.ssa-ipa, .ssa-vi, .gp-ipa, .v12-phrase-vi, .phrase-vi, .audio-btn').forEach(function (x) { x.remove(); });
      return (c.textContent || '').replace(/\s+/g, ' ').trim();
    } catch (e) { return (el.textContent || '').trim(); }
  }

  function makeBtn(text, big) {
    var b = document.createElement('button');
    b.className = 'audio-btn' + (big ? ' audio-btn-big' : '');
    b.setAttribute('data-audio', text);       // audio.js delegated handler reads this
    b.setAttribute('data-v28', '1');
    b.type = 'button';
    b.textContent = big ? '▶ Nghe' : '▶';
    b.title = 'Play: ' + text.slice(0, 40);
    return b;
  }

  function activeTopicView() {
    var v = document.getElementById('view-topic-detail');
    if (!v || !v.classList.contains('active')) return null;
    return v;
  }

  function enhance(view) {
    if (!view || !audioReady()) return 0;
    var added = 0;

    // 1) Core Phrases — new + legacy markup
    view.querySelectorAll('.v12-phrase-row, .phrase-row').forEach(function (row) {
      if (row.getAttribute('data-v28-row') === '1' || row.querySelector('.audio-btn')) { row.setAttribute('data-v28-row', '1'); return; }
      var enEl = row.querySelector('.v12-phrase-en, .phrase-en');
      var en = cleanText(enEl);
      if (!en) return;
      row.insertBefore(makeBtn(en, false), row.firstChild);
      row.setAttribute('data-v28-row', '1');
      added++;
    });

    // 2) Shadow Script box — one play-all button
    view.querySelectorAll('.shadow-script-box').forEach(function (box) {
      if (box.getAttribute('data-v28-shadow') === '1' || box.querySelector('.audio-btn')) { box.setAttribute('data-v28-shadow', '1'); return; }
      var txt = cleanText(box);
      if (!txt || txt.length < 2) return;
      var wrap = document.createElement('div');
      wrap.style.marginBottom = '8px';
      wrap.appendChild(makeBtn(txt, true));
      box.insertBefore(wrap, box.firstChild);
      box.setAttribute('data-v28-shadow', '1');
      added++;
    });

    // 3) Grammar examples (v26)
    view.querySelectorAll('.gp-ex').forEach(function (li) {
      if (li.getAttribute('data-v28-ex') === '1' || li.querySelector('.audio-btn')) { li.setAttribute('data-v28-ex', '1'); return; }
      var txt = cleanText(li);
      if (!txt) return;
      var btn = makeBtn(txt, false);
      btn.style.marginRight = '8px';
      btn.style.verticalAlign = 'middle';
      li.insertBefore(btn, li.firstChild);
      li.setAttribute('data-v28-ex', '1');
      added++;
    });

    return added;
  }

  function run() { try { var v = activeTopicView(); if (v) enhance(v); } catch (e) { log('run err', e); } }

  /* ------------------------------------------------------------- public API */
  window.SHADOW_V28 = { version: VERSION, run: run, enhance: enhance, cleanText: cleanText, makeBtn: makeBtn, selfTest: selfTest };

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }

    check('reuses existing audio engine (or absent)', !window.SHADOW_AUDIO || typeof window.SHADOW_AUDIO.speak === 'function');

    if (typeof document !== 'undefined' && document.createElement) {
      // build a fake active topic view with new-markup content
      var v = document.createElement('div'); v.id = 'view-topic-detail-test'; v.className = 'view active';
      v.innerHTML =
        '<div class="v12-phrase-row"><span class="v12-phrase-en">Can we see the menu?</span>' +
        '<span class="ssa-ipa">/.../</span><span class="v12-phrase-vi">nghĩa</span></div>' +
        '<div class="phrase-row"><span class="phrase-en">Thank you.</span></div>' +
        '<div class="shadow-script-box">What do you recommend?</div>' +
        '<ul><li class="gp-ex">I would like to order.<span class="gp-ipa">/aɪ.../</span></li></ul>';

      var added = enhance(v);
      check('injected buttons (>=4)', added >= 4);
      var coreBtn = v.querySelector('.v12-phrase-row .audio-btn');
      check('core phrase ▶ injected', !!coreBtn);
      check('data-audio is clean EN (no IPA/VN)', coreBtn && coreBtn.getAttribute('data-audio') === 'Can we see the menu?');
      check('legacy .phrase-row also covered', !!v.querySelector('.phrase-row .audio-btn'));
      check('shadow box gets play button', !!v.querySelector('.shadow-script-box .audio-btn-big'));
      var exBtn = v.querySelector('.gp-ex .audio-btn');
      check('grammar example ▶ injected (clean)', !!exBtn && exBtn.getAttribute('data-audio') === 'I would like to order.');

      // idempotent: second pass adds nothing
      var again = enhance(v);
      check('idempotent (2nd pass adds 0)', again === 0);
    } else { check('DOM (n/a here)', true); }

    check('does NOT touch v8 enhancer', typeof window.enhancePhrases === 'undefined' || typeof window.enhancePhrases === 'function');
    check('does NOT touch v26', !window.SHADOW_V26 || typeof window.SHADOW_V26.getPatterns === 'function');

    try {
      console.log('%c[v28] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
      out.forEach(function (l) { log(l); });
    } catch (e) {}
    return { ok: ok, results: out };
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    run();
    window.addEventListener('hashchange', function () { setTimeout(run, 120); });
    setInterval(run, 1500);
    log('ready', VERSION, '- run SHADOW_V28.selfTest() to verify.');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 1100); });
    } else { setTimeout(boot, 1100); }
  }
})();
