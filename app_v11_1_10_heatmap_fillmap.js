// === SHADOW ENGLISH — STABILIZE PATCH v11.1.10 ===
//
// Hotfix: REVIEW HEATMAP renders 33 cells but does NOT map sessionsLog data.
// All cells stay rgb(45,42,85) regardless of how many sessions completed.
//
// Diagnosed live (2026-05-27 Day 1) — state.sessionsLog has 3 sessions
// (L1-01 + L1-02 + L1-01) but heatmap shows zero activity.
//
// FIX: iterate sessionsLog, group by day, compute intensity (1-4 scale),
// apply CSS class or background color to matching .hm-cell by date offset.
// Pure additive — no edits to existing heatmap render code.

(function() {
  'use strict';

  var VERSION = '11.1.10';
  var FILL_MARKER = 'hmFilled1110';
  var REFILL_INTERVAL_MS = 3000;

  // Color scale matching the legend (Less → More)
  var INTENSITY_COLORS = [
    'rgb(45, 42, 85)',     // 0  - default
    'rgba(46, 160, 67, 0.35)', // 1 - low
    'rgba(46, 160, 67, 0.55)', // 2 - medium
    'rgba(46, 160, 67, 0.75)', // 3 - high
    'rgba(46, 160, 67, 1.00)'  // 4 - max
  ];

  function getSessionsByDay() {
    var state = (window.shadowEN && window.shadowEN.state) || window.state;
    if (!state || !Array.isArray(state.sessionsLog)) return {};
    var byDay = {};
    state.sessionsLog.forEach(function(s) {
      if (!s.at) return;
      var d = new Date(s.at);
      var key = d.toISOString().substring(0, 10); // YYYY-MM-DD
      byDay[key] = (byDay[key] || 0) + 1;
    });
    return byDay;
  }

  function intensityForCount(n) {
    if (!n) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    if (n <= 4) return 3;
    return 4;
  }

  function fillHeatmap() {
    var cells = document.querySelectorAll('.hm-cell');
    if (!cells.length) return 0;

    var byDay = getSessionsByDay();

    // Compute the start date of the heatmap grid.
    // Convention: heatmap shows current month, starting first Monday on or before day 1.
    // Cells flow row-by-row (7 per row = 1 week).
    // We need to figure out what date each cell represents.

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var firstOfMonth = new Date(year, month, 1);
    // Find Monday of week containing day 1
    var dow = firstOfMonth.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    var daysBack = dow === 0 ? 6 : dow - 1; // shift to Monday
    var gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - daysBack);

    cells.forEach(function(cell, i) {
      var cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + i);
      var key = cellDate.toISOString().substring(0, 10);
      var count = byDay[key] || 0;
      var intensity = intensityForCount(count);

      cell.dataset[FILL_MARKER] = String(intensity);
      cell.dataset.hmDate = key;
      cell.dataset.hmCount = String(count);

      if (count > 0) {
        cell.style.setProperty('background-color', INTENSITY_COLORS[intensity], 'important');
        cell.title = key + ' — ' + count + ' session' + (count > 1 ? 's' : '');
      } else {
        cell.style.removeProperty('background-color');
        cell.removeAttribute('title');
      }
    });

    return cells.length;
  }

  function init() {
    fillHeatmap();
    // Re-render on state mutations
    if (typeof window.render === 'function' && !window.render.__hmFill1110) {
      var orig = window.render;
      window.render = function() {
        var r = orig.apply(this, arguments);
        setTimeout(fillHeatmap, 80);
        return r;
      };
      window.render.__hmFill1110 = true;
    }
    // Safety net
    setInterval(fillHeatmap, REFILL_INTERVAL_MS);
  }

  window.SHADOW_HEATMAP_FILL = {
    version: VERSION,
    fill: fillHeatmap,
    _info: function() {
      var cells = document.querySelectorAll('.hm-cell');
      var filled = 0, totalSessions = 0;
      cells.forEach(function(c) {
        var n = parseInt(c.dataset.hmCount || '0', 10);
        if (n > 0) { filled++; totalSessions += n; }
      });
      return {
        version: VERSION,
        total_cells: cells.length,
        cells_with_sessions: filled,
        total_sessions_displayed: totalSessions
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
