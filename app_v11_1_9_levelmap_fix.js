// === SHADOW ENGLISH — STABILIZE PATCH v11.1.9 ===
//
// Hotfix: Level Map topic icons click → fallback to level page (BUG from v11.1.7-8)
//
// Root cause: EVENT BUBBLING. Click on .topic-icon → openTopic('L1-01') runs ✓
// but event bubbles to parent .level-card → navigate('level1') runs second, wins.
// Result: user lands on view-level1 instead of view-topic-detail.
//
// v11.1.8 attempted "click-time emoji lookup" fix — but that addressed the wrong
// hypothesis (state-race). Actual cause is propagation order, not data timing.
//
// FIX: capture-phase listener with stopPropagation on each topic-icon.
// Pure additive — no edits to nav_polish.js (which owns the bubbling parent handler).
//
// Idempotent via dataset.lvlMapFix119 marker (versioned per G9 stale-style trap rule).
// Safety net: setInterval(2000ms) re-bind for dynamically rendered icons.
//
// Verified live (2026-05-27 Day 1) by Claude (Cowork mode) via runtime injection
// before shipping as file.

(function() {
  'use strict';

  var VERSION = '11.1.9';
  var BIND_MARKER = 'lvlMapFix119';
  var REBIND_INTERVAL_MS = 2000;

  function findTopicByEmoji(emoji, level) {
    var state = (window.shadowEN && window.shadowEN.state) || window.state;
    if (!state || !Array.isArray(state.topics)) return null;
    return state.topics.find(function(t) {
      return t.level === level && t.emoji === emoji;
    }) || null;
  }

  function bindIcons() {
    var levelCards = document.querySelectorAll('.level-card');
    if (!levelCards.length) return 0;

    var bound = 0;
    levelCards.forEach(function(card, idx) {
      var level = idx + 1;
      var icons = card.querySelectorAll('.topic-icon');
      icons.forEach(function(el) {
        if (el.dataset[BIND_MARKER]) return;

        var bubble = el.querySelector('.bubble');
        if (!bubble) return;

        var emoji = (bubble.textContent || '').trim();

        // Skip the "More" icon (⋯ or ...) — let parent .level-card handler open level page
        if (!emoji || emoji === '⋯' || emoji === '...' || emoji === '…') {
          el.dataset[BIND_MARKER] = 'skip-more';
          return;
        }

        el.dataset[BIND_MARKER] = '1';

        // CAPTURE PHASE listener runs BEFORE bubble phase — fires first.
        // stopPropagation prevents parent .level-card handler from firing.
        el.addEventListener('click', function(e) {
          var match = findTopicByEmoji(emoji, level);
          if (!match) {
            // No state match (e.g. DOM has 🚖 not in state) — let parent fallback
            // This is a TD-2 zone bug (data source desync), out of scope for v11.1.9
            return;
          }
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (typeof window.openTopic === 'function') {
            window.openTopic(match.id);
          } else if (typeof window.navigate === 'function') {
            window.navigate('topic-detail');
          }
        }, true); // <-- TRUE = capture phase

        bound++;
      });
    });
    return bound;
  }

  function wrapRender() {
    if (typeof window.render !== 'function') return false;
    if (window.render.__lvlMapFix119Wrapped) return true;
    var orig = window.render;
    window.render = function() {
      var r = orig.apply(this, arguments);
      // Small delay so DOM has settled before re-binding
      setTimeout(bindIcons, 50);
      return r;
    };
    window.render.__lvlMapFix119Wrapped = true;
    return true;
  }

  function init() {
    bindIcons();
    // Wrap render — may need retry if render defined later
    var retries = 20;
    var retry = setInterval(function() {
      if (wrapRender() || --retries <= 0) clearInterval(retry);
    }, 500);
    // Safety net for any dynamic renders we miss
    setInterval(bindIcons, REBIND_INTERVAL_MS);
  }

  // Public API for inspection + manual rebind
  window.SHADOW_LEVELMAP_FIX = {
    version: VERSION,
    bind: bindIcons,
    _info: function() {
      var icons = document.querySelectorAll('.level-card .topic-icon');
      var fixed = 0, skipped = 0, unbound = 0;
      icons.forEach(function(el) {
        if (el.dataset[BIND_MARKER] === '1') fixed++;
        else if (el.dataset[BIND_MARKER] === 'skip-more') skipped++;
        else unbound++;
      });
      return {
        version: VERSION,
        total_icons: icons.length,
        fixed: fixed,
        skipped_more: skipped,
        unbound: unbound,
        render_wrapped: !!(window.render && window.render.__lvlMapFix119Wrapped)
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
