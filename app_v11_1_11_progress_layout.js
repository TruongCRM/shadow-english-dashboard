// === SHADOW ENGLISH — STABILIZE PATCH v11.1.11 ===
//
// Hotfix: PROGRESS TRACKER card — canvas#progress-chart renders empty (chart.js
// may not be initialized OR data is empty). This leaves ~183px vertical gap
// between title and stats; stats sink to bottom of card.
//
// Approach: Detect if canvas is empty (no chart rendered or zero-data).
// If empty → hide canvas, distribute card-title + .progress-stats evenly using flexbox.
// If chart present → leave layout alone.
//
// Pure additive CSS injection + class toggle. No JS replacement of chart logic.

(function() {
  'use strict';

  var VERSION = '11.1.11';
  var STYLE_ID = 'progress-layout-styles-v1111';
  var MARKER = 'progLayout1111';

  function injectCSS() {
    // G9 versioned ID
    if (document.getElementById(STYLE_ID)) return;
    document.querySelectorAll('style[id^="progress-layout-styles"]').forEach(function(s){ s.remove(); });
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.card.progress-empty-chart {',
      '  display: flex; flex-direction: column; gap: 16px;',
      '  justify-content: flex-start;',
      '}',
      '.card.progress-empty-chart .card-title { margin-bottom: 0; }',
      '.card.progress-empty-chart > canvas { display: none !important; }',
      '.card.progress-empty-chart .progress-stats {',
      '  display: grid;',
      '  grid-template-columns: repeat(2, 1fr);',
      '  gap: 12px;',
      '  margin-top: 4px;',
      '}',
      '.card.progress-empty-chart .progress-stats .mini-stat {',
      '  padding: 16px; border-radius: 12px;',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  text-align: center;',
      '}',
      '.card.progress-empty-chart .progress-stats .mini-stat .lbl {',
      '  font-size: 11px; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.04em;',
      '}',
      '.card.progress-empty-chart .progress-stats .mini-stat .val {',
      '  font-size: 24px; font-weight: 600; margin-top: 4px;',
      '}',
      '@media (max-width: 600px) {',
      '  .card.progress-empty-chart .progress-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }',
      '  .card.progress-empty-chart .progress-stats .mini-stat .val { font-size: 20px; }',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function isCanvasEmpty(canvas) {
    if (!canvas || canvas.tagName !== 'CANVAS') return true;
    if (canvas.width === 0 || canvas.height === 0) return true;
    try {
      var ctx = canvas.getContext('2d');
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      // Look for any non-transparent, non-default pixel
      for (var i = 3; i < data.length; i += 40) { // sample every 10th pixel alpha
        if (data[i] > 10) return false;
      }
      return true;
    } catch (e) {
      return true; // assume empty if we can't inspect
    }
  }

  function findProgressCard() {
    var canvas = document.querySelector('#progress-chart');
    if (canvas) return canvas.closest('.card');
    // Fallback: scan cards for .progress-stats child
    var stats = document.querySelector('.progress-stats');
    return stats ? stats.closest('.card') : null;
  }

  function applyLayout() {
    var card = findProgressCard();
    if (!card) return false;

    var canvas = card.querySelector('canvas');
    if (canvas && isCanvasEmpty(canvas)) {
      card.classList.add('progress-empty-chart');
      card.dataset[MARKER] = 'empty';
    } else {
      card.classList.remove('progress-empty-chart');
      card.dataset[MARKER] = 'chart';
    }
    return true;
  }

  function init() {
    injectCSS();
    applyLayout();
    if (typeof window.render === 'function' && !window.render.__progLayout1111) {
      var orig = window.render;
      window.render = function() {
        var r = orig.apply(this, arguments);
        setTimeout(applyLayout, 100);
        return r;
      };
      window.render.__progLayout1111 = true;
    }
    setInterval(applyLayout, 3000);
  }

  window.SHADOW_PROGRESS_LAYOUT = {
    version: VERSION,
    apply: applyLayout,
    _info: function() {
      var card = findProgressCard();
      return {
        version: VERSION,
        card_found: !!card,
        mode: card?.dataset[MARKER] || 'none',
        empty_chart_class: card?.classList.contains('progress-empty-chart') || false
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
