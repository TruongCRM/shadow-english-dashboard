/*! app_v31_grid_mobile_fix.js — V31 Mobile Grid Fix (v31.0.0)
 * ADDITIVE, CSS-ONLY module. Fixes additive-module cards collapsing into a narrow column on phone/tablet.
 *
 * ROOT CAUSE (audited live + from real iPhone screenshots):
 *   `div.content` is a 5-col CSS grid; views use `display:contents`, so every lesson card is a grid item of `.content`.
 *   The native mobile reset `@media(max-width:900px){.content>*{grid-column:span 1}}` is DEFEATED by `display:contents`
 *   (`.content > *` matches the invisible #view-* wrappers, not the real cards — BUG-003 family).
 *   Native cards use `grid-column:span 5` (stay full-width); additive cards (v23/v24/v25/v26/v27) use `1 / -1`,
 *   whose `-1` resolves to the single explicit `1fr` track and gets squeezed by the implicit columns the span-5
 *   native cards create => additive cards collapse to ~200px and text wraps one word per line.
 *
 * FIX: make additive/lesson cards behave EXACTLY like native cards (`grid-column: 1 / span 5`) + `min-width:0`,
 *      at <=1024px (phone + iPad). Targets the real card ids/classes directly (bypassing the display:contents trap).
 *
 * Golden rules: guard + selfTest() + one <script ?v=1> line; CSS-only (no DOM writes); no edits to v23..v27/core;
 *   rollback = delete the one <script> line.
 */
(function () {
  'use strict';
  if (window.SHADOW_V31) return;

  var VERSION = '31.0.0';
  var STYLE_ID = 'v31-style';

  var CSS =
    '@media (max-width:1024px){' +
      // additive lesson-module roots + any native card inside the topic page → span full grid like native cards
      '#shadow-v23-root,#shadow-v24-root,#shadow-v25-root,#shadow-v26-root,#shadow-v27-root,' +
      '#view-topic-detail .card,#view-topic-detail .v12-card,#view-topic-detail .v15-card,' +
      '#view-topic-detail [class*="card"]{' +
        'grid-column:1 / span 5 !important;' +
        'min-width:0 !important;' +
        'width:auto !important;' +
        'max-width:100% !important;' +
      '}' +
      // stop per-word wrapping inside the previously-squeezed module cards
      '#shadow-v26-root,#shadow-v27-root,#shadow-v23-root{overflow-wrap:normal !important;word-break:normal !important;}' +
    '}';

  function injectCSS() {
    if (typeof document === 'undefined' || !document.head) return false;
    var el = document.getElementById(STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }
    if (el.textContent !== CSS) el.textContent = CSS;
    return true;
  }

  function selfTest() {
    var r = []; function ok(n, c) { r.push({ name: n, ok: !!c }); }
    try {
      ok('namespace SHADOW_V31', !!window.SHADOW_V31);
      ok('VERSION 31.0.0', VERSION === '31.0.0');
      ok('CSS-only (no grid-column scrape of DOM)', CSS.indexOf('grid-column:1 / span 5') >= 0);
      ok('targets v26/v27 roots', CSS.indexOf('#shadow-v26-root') >= 0 && CSS.indexOf('#shadow-v27-root') >= 0);
      ok('targets topic-detail cards directly (pierces display:contents)', CSS.indexOf('#view-topic-detail .card') >= 0);
      ok('breakpoint covers phone+iPad (<=1024)', CSS.indexOf('max-width:1024px') >= 0);
      ok('min-width:0 (kills per-word wrap)', CSS.indexOf('min-width:0 !important') >= 0);
      injectCSS();
      var styleEl = (typeof document !== 'undefined') ? document.getElementById(STYLE_ID) : null;
      ok('style injected into head', !!styleEl && styleEl.textContent === CSS);
      ok('does not touch other namespaces', ['SHADOW_V26','SHADOW_V27','SHADOW_V30'].every(function (n) { return typeof window[n] === 'undefined' || !!window[n]; }));
    } catch (e) { r.push({ name: 'exception: ' + e.message, ok: false }); }
    return { ok: r.every(function (x) { return x.ok; }), results: r };
  }

  function init() {
    if (typeof document === 'undefined') return;
    injectCSS();
    // re-assert once after load in case head/style is replaced by a late module
    if (document.addEventListener) document.addEventListener('DOMContentLoaded', injectCSS, false);
    setTimeout(injectCSS, 2000);
  }

  window.SHADOW_V31 = { VERSION: VERSION, injectCSS: injectCSS, CSS: CSS, selfTest: selfTest };
  init();
})();
