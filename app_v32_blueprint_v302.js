/*! app_v32_blueprint_v302.js — V30.2 Blueprint Layout Refinement (v32.0.0)
 * ADDITIVE, layout-only. Re-flows the V30 Lesson Blueprint from a flat "data summary"
 * into a "learning cheat-sheet": CORE PHRASES becomes the dominant zone, BEFORE/DURING/AFTER
 * stay as 3 columns, GRAMMAR shrinks to ~25% (keeps its VN Meaning column), DIALOGUES and
 * REAL ENGLISH each get their own block, and ACTION/MEMORY/MISSIONS/REVIEW/WORD-ORDER/FREQUENCY
 * collapse into a condensed footer strip.
 *
 * PRINCIPLE: touches NOTHING in core (app.js / v20 / Gemini) and does NOT re-render v30's
 * content. It only (1) injects one <style> and (2) tags v30's already-rendered .v30-blk cards
 * with v32-* classes so the stylesheet can re-flow them. Every v30 feature (audio/TTS, IPA,
 * PNG export, close/ESC, drawer/fullscreen) is preserved untouched.
 *
 * ROLLBACK: delete the single <script src="app_v32_blueprint_v302.js"> line in index.html.
 * The blueprint then renders in its original V30.1.1 layout.
 *
 * Reads/anchors (all VERIFIED on live DOM 2026-05-30):
 *   .v30-card  .v30-blk  .v30-hero  .v30-head/.v30-h  .v30-core-grid  .v30-cc  .v30-gt  .v30-p
 */
(function () {
  'use strict';

  var STYLE_ID = 'v32-bp-style';

  /* ------------------------------------------------------------------ *
   * 1) Stylesheet — all layout lives here, scoped to .v30-card.v32      *
   * ------------------------------------------------------------------ */
  var CSS = [
    /* re-flow container: 12-col grid, min-width:0 everywhere to kill the */
    /* BUG-020/021 "narrow column / one-word-per-line" overflow class.    */
    '.v30-card.v32{container-type:inline-size;}',
    '.v30-card.v32 .v32-grid{display:grid !important;grid-template-columns:repeat(12,minmax(0,1fr)) !important;gap:10px !important;align-items:start !important;}',
    '.v30-card.v32 .v30-blk{min-width:0 !important;max-width:100% !important;overflow:hidden !important;}',
    '.v30-card.v32 .v30-blk *{min-width:0;overflow-wrap:break-word;word-break:normal;}',

    /* span + order assignment (desktop) */
    '.v30-card.v32 .v32-title{grid-column:span 12 !important;order:0 !important;}',
    '.v30-card.v32 .v32-why{grid-column:span 6 !important;order:1 !important;}',
    '.v30-card.v32 .v32-scene{grid-column:span 6 !important;order:1 !important;}',
    '.v30-card.v32 .v32-core{grid-column:span 12 !important;order:2 !important;}',
    '.v30-card.v32 .v32-dialogues{grid-column:span 12 !important;order:3 !important;}',
    '.v30-card.v32 .v32-real{grid-column:span 9 !important;order:4 !important;}',
    '.v30-card.v32 .v32-grammar{grid-column:span 3 !important;order:4 !important;}',
    '.v30-card.v32 .v32-minor{grid-column:span 2 !important;order:5 !important;}',

    /* === CORE PHRASES = dominant zone (+~15-20% presence) === */
    '.v30-card.v32 .v32-core{padding:18px 18px 22px !important;border-width:2px !important;}',
    '.v30-card.v32 .v32-core .v30-core-grid{display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:12px !important;}',
    '.v30-card.v32 .v32-core .v30-cc{min-width:0 !important;}',
    '.v30-card.v32 .v32-core .v30-p{font-size:14.5px !important;line-height:1.45 !important;padding:8px 10px !important;}',
    '.v30-card.v32 .v32-core .v30-head{font-size:15px !important;margin-bottom:8px !important;}',
    '.v30-card.v32 .v32-core .v30-cl{font-size:12px !important;}',

    /* === GRAMMAR = mini-table, ~25%, KEEPS Meaning(VN); fixed layout so it never breaks === */
    '.v30-card.v32 .v32-grammar .v30-gt{table-layout:fixed !important;width:100% !important;font-size:11px !important;border-collapse:collapse;}',
    '.v30-card.v32 .v32-grammar .v30-gt th,.v30-card.v32 .v32-grammar .v30-gt td{white-space:normal !important;word-break:break-word !important;overflow-wrap:anywhere !important;padding:4px 5px !important;vertical-align:top !important;line-height:1.35 !important;}',
    '.v30-card.v32 .v32-grammar .v30-gt th:nth-child(1),.v30-card.v32 .v32-grammar .v30-gt td:nth-child(1){width:34% !important;}',
    '.v30-card.v32 .v32-grammar .v30-gt th:nth-child(2),.v30-card.v32 .v32-grammar .v30-gt td:nth-child(2){width:40% !important;}', /* Meaning VN */
    '.v30-card.v32 .v32-grammar .v30-gt th:nth-child(3),.v30-card.v32 .v32-grammar .v30-gt td:nth-child(3){width:26% !important;}',
    '.v30-card.v32 .v32-grammar .v30-h{font-size:12px !important;}',

    /* === REAL ENGLISH = own block === */
    '.v30-card.v32 .v32-real .v30-t{font-size:13px !important;}',

    /* === DIALOGUES = own full-width block === */
    '.v30-card.v32 .v32-dialogues .v30-p{font-size:13.5px !important;}',

    /* === condense ACTION/MEMORY/MISSIONS/REVIEW/WORD-ORDER/FREQUENCY === */
    '.v30-card.v32 .v32-minor{padding:8px 9px !important;}',
    '.v30-card.v32 .v32-minor .v30-h{font-size:10.5px !important;margin-bottom:3px !important;}',
    '.v30-card.v32 .v32-minor,.v30-card.v32 .v32-minor *{font-size:10.5px !important;line-height:1.3 !important;}',

    /* === slim context (WHY/SCENE) === */
    '.v30-card.v32 .v32-why,.v30-card.v32 .v32-scene{padding:9px 11px !important;}',
    '.v30-card.v32 .v32-why *,.v30-card.v32 .v32-scene *{font-size:12px !important;line-height:1.4 !important;}',

    /* ---------------- responsive (container-query on the card) ---------------- */
    '@container (max-width:900px){',
    '  .v30-card.v32 .v32-real{grid-column:span 12 !important;}',
    '  .v30-card.v32 .v32-grammar{grid-column:span 12 !important;}',
    '  .v30-card.v32 .v32-minor{grid-column:span 4 !important;}',
    '}',
    '@container (max-width:560px){',
    '  .v30-card.v32 .v32-why{grid-column:span 12 !important;}',
    '  .v30-card.v32 .v32-scene{grid-column:span 12 !important;}',
    '  .v30-card.v32 .v32-minor{grid-column:span 6 !important;}',
    '  .v30-card.v32 .v32-core .v30-core-grid{grid-template-columns:1fr !important;}',
    '  .v30-card.v32 .v32-grammar .v30-gt{font-size:11px !important;}',
    '}'
  ].join('\n');

  function injectStyle() {
    if (typeof document === 'undefined') return null;
    var el = document.getElementById(STYLE_ID);
    if (el) return el;
    el = document.createElement('style');
    el.id = STYLE_ID;
    el.type = 'text/css';
    el.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(el);
    return el;
  }

  /* ------------------------------------------------------------------ *
   * 2) Classify one .v30-blk by its heading text -> v32-<type>         *
   * ------------------------------------------------------------------ */
  function classify(blk, index) {
    // CORE is the hero; the title/flow block is always first.
    if (blk.classList && blk.classList.contains('v30-hero')) return 'core';
    if (index === 0) return 'title';
    var h = blk.querySelector ? (blk.querySelector('.v30-h') || blk.querySelector('.v30-head')) : null;
    var T = ((h ? h.textContent : (blk.textContent || '')) || '').toUpperCase();
    if (T.indexOf('GRAMMAR') > -1) return 'grammar';
    if (T.indexOf('DIALOG') > -1) return 'dialogues';
    if (T.indexOf('REAL ENGLISH') > -1) return 'real';   // checked before MISSIONS ("REAL LIFE…")
    if (T.indexOf('WHY') > -1) return 'why';
    if (T.indexOf('SCENE') > -1) return 'scene';
    return 'minor'; // ACTION / MEMORY / MISSIONS / REVIEW / WORD ORDER / FREQUENCY
  }

  /* ------------------------------------------------------------------ *
   * 3) Apply: tag the open blueprint so the stylesheet re-flows it      *
   * ------------------------------------------------------------------ */
  function apply() {
    if (typeof document === 'undefined') return false;
    var card = document.querySelector('.v30-card');
    if (!card) return false;
    injectStyle();
    card.classList.add('v32');
    var firstBlk = card.querySelector('.v30-blk');
    if (!firstBlk) return false;
    var grid = firstBlk.parentNode;
    if (!grid) return false;
    grid.classList.add('v32-grid');
    var blks = [];
    for (var i = 0; i < grid.children.length; i++) {
      if (grid.children[i].classList && grid.children[i].classList.contains('v30-blk')) blks.push(grid.children[i]);
    }
    blks.forEach(function (blk, idx) {
      var type = classify(blk, idx);
      // idempotent: don't pile on duplicate type classes across re-runs
      if (blk.getAttribute('data-v32') === type) return;
      ['title','why','scene','core','grammar','dialogues','real','minor'].forEach(function (t) {
        blk.classList.remove('v32-' + t);
      });
      blk.classList.add('v32-' + type);
      blk.setAttribute('data-v32', type);
    });
    return true;
  }

  /* ------------------------------------------------------------------ *
   * 4) Hook v30 open() + MutationObserver fallback                     *
   * ------------------------------------------------------------------ */
  function hook() {
    if (typeof window === 'undefined') return;
    if (window.SHADOW_V30 && typeof window.SHADOW_V30.open === 'function' && !window.SHADOW_V30.__v32patched) {
      var orig = window.SHADOW_V30.open;
      window.SHADOW_V30.open = function () {
        var r = orig.apply(this, arguments);
        try {
          if (window.requestAnimationFrame) window.requestAnimationFrame(apply);
          else setTimeout(apply, 30);
        } catch (e) { setTimeout(apply, 30); }
        return r;
      };
      window.SHADOW_V30.__v32patched = true;
    }
    if (typeof MutationObserver !== 'undefined' && document.body && !window.__v32mo) {
      var mo = new MutationObserver(function () {
        if (document.querySelector('.v30-card:not(.v32)')) apply();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      window.__v32mo = mo;
    }
  }

  /* ------------------------------------------------------------------ *
   * 5) selfTest()                                                      *
   * ------------------------------------------------------------------ */
  function selfTest() {
    var results = [];
    function chk(name, ok) { results.push({ name: name, ok: !!ok }); }
    try {
      var styleEl = injectStyle();
      chk('style-injected', styleEl && document.getElementById(STYLE_ID));

      // synthetic blueprint card
      var card = document.createElement('div'); card.className = 'v30-card';
      var grid = document.createElement('div'); card.appendChild(grid);
      function mk(label, hero) {
        var b = document.createElement('div'); b.className = 'v30-blk' + (hero ? ' v30-hero' : '');
        var h = document.createElement('div'); h.className = hero ? 'v30-head' : 'v30-h';
        h.textContent = label; b.appendChild(h); grid.appendChild(b); return b;
      }
      var t  = mk('Ordering Food — FLOW WHY SCENE CORE GRAMMAR', false); // title/flow contains keywords on purpose
      var co = mk('CORE PHRASES', true);
      var gr = mk('GRAMMAR PATTERNS', false);
      var dl = mk('DIALOGUES', false);
      var re = mk('REAL ENGLISH', false);
      var ms = mk('REAL LIFE MISSIONS', false);
      var mem = mk('MEMORY LOOP', false);
      var wh = mk('WHY THIS TOPIC?', false);
      var sc = mk('THE SCENE', false);
      (document.body || document.documentElement).appendChild(card);

      var applied = apply();
      chk('apply-returns-true', applied);
      chk('card-marked-v32', card.classList.contains('v32'));
      chk('grid-marked', grid.classList.contains('v32-grid'));
      chk('title=title (not core via flow text)', t.classList.contains('v32-title'));
      chk('core', co.classList.contains('v32-core'));
      chk('grammar', gr.classList.contains('v32-grammar'));
      chk('dialogues', dl.classList.contains('v32-dialogues'));
      chk('real-english', re.classList.contains('v32-real'));
      chk('missions->minor (not real)', ms.classList.contains('v32-minor') && !ms.classList.contains('v32-real'));
      chk('memory->minor', mem.classList.contains('v32-minor'));
      chk('why', wh.classList.contains('v32-why'));
      chk('scene', sc.classList.contains('v32-scene'));

      // idempotency: re-apply doesn't duplicate / change type
      apply();
      chk('idempotent-core', co.classList.contains('v32-core') && co.getAttribute('data-v32') === 'core');

      (document.body || document.documentElement).removeChild(card);
    } catch (e) {
      chk('exception: ' + (e && e.message), false);
    }
    var ok = results.every(function (r) { return r.ok; });
    return { ok: ok, results: results };
  }

  /* ------------------------------------------------------------------ *
   * 6) boot                                                            *
   * ------------------------------------------------------------------ */
  var API = { VERSION: 'v32.0.0', apply: apply, classify: classify, injectStyle: injectStyle, selfTest: selfTest };
  if (typeof window !== 'undefined') {
    window.SHADOW_V32 = API;
    try { hook(); } catch (e) {}
    try { apply(); } catch (e) {} // in case a blueprint is already open
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { try { hook(); apply(); } catch (e) {} });
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
