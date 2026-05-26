// === SHADOW ENGLISH — STABILIZE PATCH v11.1.14 ===
//
// Inject "Day 21" stage tab into Review Engine Today Queue filter row.
// Sequence: Day 1 → Day 3 → Day 7 → Day 21 → Overdue
//
// Why Day 21:
// - Spaced repetition long-term stabilization milestone (research: Ebbinghaus, Anki)
// - Maps to "Building → Stable" memory transition
// - User-requested for memory maturation feel
//
// Pure additive. Idempotent. Tab handler stops propagation per Việc 9 lesson.

(function() {
  'use strict';

  var VERSION = '11.1.14';
  var BIND_MARKER = 'polish1114';
  var REBIND_INTERVAL_MS = 2500;

  function countDay21Topics() {
    var state = (window.shadowEN && window.shadowEN.state) || window.state;
    if (!state || !Array.isArray(state.topics)) return 0;
    return state.topics.filter(function(t) {
      var stage = String(t.reviewStage || '');
      return /Day 21|day21|D21/i.test(stage);
    }).length;
  }

  function applyFilter(filter) {
    // Reuse v11.1.12 filter logic + add day21 case
    var rows = document.querySelectorAll(
      '.queue-row, .review-row, .review-item, .queue-table tbody tr, ' +
      '#today-review-list > div'
    );
    rows.forEach(function(r) {
      var txt = (r.textContent || '').trim();
      var show = true;
      if (filter === 'day1') show = /Day 1\b/i.test(txt);
      else if (filter === 'day3') show = /Day 3\b/i.test(txt);
      else if (filter === 'day7') show = /Day 7\b/i.test(txt);
      else if (filter === 'day21') show = /Day 21\b/i.test(txt);
      else if (filter === 'overdue') show = /Overdue/i.test(txt);
      r.style.display = show ? '' : 'none';
    });
  }

  function injectDay21Tab() {
    var tabs = document.querySelectorAll('.queue-tab');
    if (!tabs.length) return false;

    // Already present?
    if (Array.from(tabs).some(function(t) { return /Day 21/i.test(t.textContent || ''); })) {
      return true;
    }

    var overdueTab = Array.from(tabs).find(function(t) {
      return /Overdue/i.test(t.textContent || '');
    });
    if (!overdueTab || !overdueTab.parentElement) return false;

    var count = countDay21Topics();

    var newTab = document.createElement('span');
    newTab.className = 'queue-tab polish-1112-bound';
    newTab.setAttribute('role', 'tab');
    newTab.setAttribute('tabindex', '0');
    newTab.dataset[BIND_MARKER] = '1';
    newTab.dataset.polish1112 = '1'; // prevent v11.1.12 from re-binding
    newTab.textContent = 'Day 21 (' + count + ')';

    overdueTab.parentElement.insertBefore(newTab, overdueTab);

    // Capture-phase listener with stopPropagation (lesson from v11.1.9)
    newTab.addEventListener('click', function(e) {
      e.stopPropagation();
      // Update active state across ALL tabs (including this new one)
      document.querySelectorAll('.queue-tab').forEach(function(t) { t.classList.remove('active'); });
      newTab.classList.add('active');
      applyFilter('day21');
    }, true);

    // Keyboard accessibility
    newTab.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        newTab.click();
      }
    });

    return true;
  }

  function updateDay21Count() {
    var tab = Array.from(document.querySelectorAll('.queue-tab')).find(function(t) {
      return /Day 21/i.test(t.textContent || '');
    });
    if (!tab) return;
    var count = countDay21Topics();
    // Only update if changed (avoid disrupting active state during reflow)
    var current = (tab.textContent.match(/\((\d+)\)/) || [])[1];
    if (current !== String(count)) {
      tab.textContent = 'Day 21 (' + count + ')';
    }
  }

  function runAll() {
    try { injectDay21Tab(); } catch (e) { console.warn('[1114] inject:', e); }
    try { updateDay21Count(); } catch (e) { console.warn('[1114] count:', e); }
  }

  function init() {
    runAll();
    if (typeof window.render === 'function' && !window.render.__polish1114) {
      var orig = window.render;
      window.render = function() {
        var r = orig.apply(this, arguments);
        setTimeout(runAll, 100);
        return r;
      };
      window.render.__polish1114 = true;
    }
    setInterval(runAll, REBIND_INTERVAL_MS);
  }

  window.SHADOW_DAY21 = {
    version: VERSION,
    inject: injectDay21Tab,
    updateCount: updateDay21Count,
    _info: function() {
      var tabs = document.querySelectorAll('.queue-tab');
      var day21Tab = Array.from(tabs).find(function(t) { return /Day 21/i.test(t.textContent || ''); });
      return {
        version: VERSION,
        tabs_total: tabs.length,
        day21_present: !!day21Tab,
        day21_count: countDay21Topics(),
        day21_active: day21Tab ? day21Tab.classList.contains('active') : false,
        all_tabs_order: Array.from(tabs).map(function(t) { return (t.textContent || '').trim(); })
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
