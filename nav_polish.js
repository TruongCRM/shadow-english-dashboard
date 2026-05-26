// === SHADOW ENGLISH — STABILIZE PATCH (v11.1.1) ===
//
// File still named nav_polish.js for backwards compat — actually covers
// multiple stabilize bug-fixes. Pure additive, no edits to existing code.
//
// Scope (matches user-approved STABILIZE-A path):
// 1. Home `.level-card` summary cards (LEVEL 1/2/3) — currently no onclick.
//    Expected: click → navigate('level1' | 'level2' | 'level3')
// 2. `#today-review-list .review-item[data-topic]` — cursor:pointer but no handler.
//    Expected: click → openTopic(id)
// 3. Cursor + minimal hover lift so affordance matches reality.
// 4. Review Heatmap CSS bug — original CSS used `grid-template-columns:
//    30px repeat(28, 1fr)` (28 = total cells, not weeks!) so browser laid
//    out 29 cols × 2 rows. Fix: compute weeks dynamically (cells/7) and
//    set grid-template-columns to `30px repeat(weeks, 1fr)`. Handles both
//    4-week and 5-week months.
//
// NOT in scope (deferred to v11.2-B per user decision):
// - Mini context transition (fade preview card)
// - Centralized routing helper refactor
// - Auto-focus current review stage
// - Highlight memory stage on open
//
// Pattern: identical to today.js + app_v11_today.js — idempotent wraps,
// setInterval safety net, no edits to existing files, single file +
// one script tag in index.html.
//
// Last update: 2026-05-26 (v11.1.1 patch)

(function() {
'use strict';

// ---------- CSS (minimal — only affordance/cursor, no new visuals) ----------
var CSS = [
'#view-home .level-card { cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }',
'#view-home .level-card.nav-bound:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(124,92,255,0.10); border-color: rgba(124,92,255,0.25); }',
'#view-home .level-card.nav-bound:active { transform: translateY(0); }',
/* The review row already has cursor:pointer via existing CSS but lacks handler. */
'#today-review-list .review-item.nav-bound { transition: background 0.15s ease, transform 0.15s ease; }',
'#today-review-list .review-item.nav-bound:hover { background: rgba(124,92,255,0.05); transform: translateX(2px); }',
/* Heatmap polish v6: rotated + stretch — fills full card width */
'.heatmap.nav-polished { justify-content: stretch !important; align-items: stretch !important; gap: 6px !important; padding: 6px 4px 4px; width: 100% !important; grid-auto-flow: column !important; }',
'.heatmap.nav-polished .hm-label { font-size: 11px; color: var(--text-3); display: flex; align-items: center; justify-content: center; text-transform: none; }',
'.heatmap.nav-polished .hm-cell { border-radius: 5px; width: 100%; height: 100%; }',
/* Mobile — keep tap targets comfortable */
'@media (max-width: 900px) {',
'  #view-home .level-card.nav-bound:hover { transform: none; }',
'  #today-review-list .review-item.nav-bound:hover { transform: none; }',
'  .heatmap.nav-polished { gap: 3px !important; grid-auto-rows: 28px !important; }',
'  .heatmap.nav-polished .hm-cell { min-height: 28px; }',
'}'
].join('\n');

function injectCSS() {
  if (document.getElementById('nav-polish-styles')) return;
  var s = document.createElement('style');
  s.id = 'nav-polish-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ---------- Helpers ----------

// Reuse existing navigation primitives — do NOT create new routing logic.
function goToLevel(viewId) {
  try {
    if (typeof window.navigate === 'function') {
      window.navigate(viewId);
    }
  } catch (e) {
    console.warn('[v11.1.1] navigate failed:', e);
  }
}

function goToTopic(topicId) {
  try {
    if (typeof window.openTopic === 'function') {
      window.openTopic(topicId);
    } else if (typeof window.navigate === 'function') {
      window.navigate('topic-detail');
    }
  } catch (e) {
    console.warn('[v11.1.1] openTopic failed:', e);
  }
}

// Map a level-card's textContent to its target view.
// Level 1 / 2 / 3 are detected by ordinal in #view-home — most reliable.
function levelCardTargets() {
  var cards = document.querySelectorAll('#view-home .level-card');
  return Array.prototype.slice.call(cards).map(function(card, i) {
    return { el: card, viewId: 'level' + (i + 1) };
  });
}

// ---------- Binders (idempotent) ----------

function bindLevelCards() {
  var pairs = levelCardTargets();
  var bound = 0;
  pairs.forEach(function(p) {
    if (p.el.dataset.navBound === '1') return; // idempotent
    p.el.dataset.navBound = '1';
    p.el.classList.add('nav-bound');
    p.el.setAttribute('role', 'button');
    p.el.setAttribute('tabindex', '0');
    p.el.setAttribute('aria-label', 'Open ' + p.viewId);
    p.el.addEventListener('click', function(ev) {
      // Don't hijack clicks on internal interactive descendants (none currently,
      // but future-proof — buttons, links inside the card take precedence).
      var t = ev.target;
      while (t && t !== p.el) {
        var tag = t.tagName;
        if (tag === 'A' || tag === 'BUTTON') return;
        t = t.parentNode;
      }
      goToLevel(p.viewId);
    });
    p.el.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        goToLevel(p.viewId);
      }
    });
    bound++;
  });
  return bound;
}

function bindReviewItems() {
  var items = document.querySelectorAll('#today-review-list .review-item[data-topic]');
  var bound = 0;
  Array.prototype.slice.call(items).forEach(function(el) {
    if (el.dataset.navBound === '1') return; // idempotent
    el.dataset.navBound = '1';
    el.classList.add('nav-bound');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    var topicId = el.getAttribute('data-topic');
    el.setAttribute('aria-label', 'Open topic ' + topicId);
    el.addEventListener('click', function(ev) {
      var t = ev.target;
      while (t && t !== el) {
        if (t.tagName === 'A' || t.tagName === 'BUTTON') return;
        t = t.parentNode;
      }
      goToTopic(topicId);
    });
    el.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        goToTopic(topicId);
      }
    });
    bound++;
  });
  return bound;
}

// Heatmap CSS fix: compute correct grid-template-columns from actual children.
// Idempotent — only updates if the inline style would change.
function fixHeatmap() {
  var maps = document.querySelectorAll('.heatmap');
  var fixed = 0;
  Array.prototype.slice.call(maps).forEach(function(hm) {
    var labels = hm.querySelectorAll('.hm-label').length;
    var cells = hm.querySelectorAll('.hm-cell').length;
    if (labels !== 7 || cells === 0) return; // unexpected shape — skip
    var weeks = Math.ceil(cells / 7);
    if (weeks < 1 || weeks > 6) return; // sanity bounds
    // v3: fixed-size cells (32px squares) instead of 1fr — prevents the heatmap
    // from stretching to fill the parent card width. Combined with the CSS
    // override `.heatmap-card { grid-column: 1 / -1 }`, this gives a calm,
    // GitHub-style compact heatmap as its own row.
    var key = weeks + 'w-v6';
    if (hm.dataset.hmFixedWeeks === key) return;
    // v6: ROTATE + STRETCH — cells use 1fr to fill the card width evenly.
    // Row height fixed at 56px (close enough to square for typical card widths).
    var desiredCols = 'repeat(7, 1fr)';
    var desiredRows = '22px repeat(' + weeks + ', 56px)';
    hm.style.setProperty('grid-template-columns', desiredCols, 'important');
    hm.style.setProperty('grid-template-rows', desiredRows, 'important');
    hm.style.setProperty('grid-auto-flow', 'column', 'important');
    hm.classList.add('nav-polished');
    hm.dataset.hmFixedWeeks = key;
    fixed++;
  });
  return fixed;
}

function bindAll() {
  injectCSS();
  var lvl = bindLevelCards();
  var rev = bindReviewItems();
  var hm = fixHeatmap();
  return { level: lvl, review: rev, heatmap: hm };
}

// ---------- Lifecycle ----------

// Phase 1: First-render attempt (DOM may not be ready)
function initialBind() {
  setTimeout(bindAll, 600);
  setTimeout(bindAll, 1800);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialBind);
} else {
  initialBind();
}

// Phase 2: Wrap window.render so we re-bind after every state-driven re-render.
// Idempotent flag matches the existing v11/v11.1 pattern (__v11Patched is used by
// app_v11_today.js — we use __navPolishPatched to avoid collision).
var renderAttempts = 0;
function patchRender() {
  if (typeof window.render === 'function' && !window.render.__navPolishPatched) {
    var original = window.render;
    window.render = function() {
      var ret;
      try { ret = original.apply(this, arguments); }
      catch (e) { console.warn('[v11.1.1] original render threw:', e); }
      // Defer so any newly-rendered DOM is in place before we bind
      setTimeout(bindAll, 40);
      return ret;
    };
    window.render.__navPolishPatched = true;
    return true;
  }
  renderAttempts++;
  if (renderAttempts < 20) setTimeout(patchRender, 200);
  return false;
}
patchRender();

// Phase 3: Wrap window.navigate so re-binding fires on view switches too.
var navAttempts = 0;
function patchNavigate() {
  if (typeof window.navigate === 'function' && !window.navigate.__navPolishPatched) {
    var originalNav = window.navigate;
    window.navigate = function() {
      var ret;
      try { ret = originalNav.apply(this, arguments); }
      catch (e) { console.warn('[v11.1.1] original navigate threw:', e); }
      setTimeout(bindAll, 60);
      return ret;
    };
    window.navigate.__navPolishPatched = true;
    return true;
  }
  navAttempts++;
  if (navAttempts < 20) setTimeout(patchNavigate, 200);
  return false;
}
patchNavigate();

// Phase 4: Brute-force safety net (last-resort reliability, identical pattern
// to app_v11_today.js). New items appearing via mutation get bound within 3s.
setInterval(bindAll, 3000);

// Public debug handle
window.SHADOW_NAV_POLISH = {
  bind: bindAll,
  bindLevelCards: bindLevelCards,
  bindReviewItems: bindReviewItems,
  fixHeatmap: fixHeatmap,
  _info: function() {
    var lvl = document.querySelectorAll('#view-home .level-card');
    var rev = document.querySelectorAll('#today-review-list .review-item[data-topic]');
    var hm = document.querySelector('.heatmap');
    return {
      level_cards_total: lvl.length,
      level_cards_bound: document.querySelectorAll('#view-home .level-card.nav-bound').length,
      review_items_total: rev.length,
      review_items_bound: document.querySelectorAll('#today-review-list .review-item.nav-bound').length,
      heatmap_present: !!hm,
      heatmap_weeks_fixed: hm ? hm.dataset.hmFixedWeeks : null
    };
  }
};

if (typeof console !== 'undefined' && console.log) {
  console.log('[v11.1.1] Nav polish ready. Debug: SHADOW_NAV_POLISH._info()');
}
})();
