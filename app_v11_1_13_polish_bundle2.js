// === SHADOW ENGLISH — STABILIZE PATCH v11.1.13 ===
//
// Day 1 Wave 4 polish bundle — 4 hotfixes:
//   1. Heatmap RETARGET (Việc 3) — v11.1.10 colored LEGEND dots, not main grid.
//      Fix: target `.heatmap > .hm-cell` only, exclude `.heatmap-foot-right`.
//   2. HERO STATS Roadmap (Việc 1) — current shows "1 days · Keep going" (sparse).
//      Add streak journey + level progress visualization.
//   3. Progress Tracker theme color (Việc 2) — v11.1.12 used gold gradient.
//      Recolor with purple/system theme.
//   4. Today Goal layout (Việc 4) — mock "2/3" + bar visible + checklist below = messy.
//      Hide mock progress, keep cleanlist với compute từ state.missions.items.
//
// Pure additive. Idempotent. Versioned CSS per G9.

(function() {
  'use strict';

  var VERSION = '11.1.13';
  var STYLE_ID = 'polish-1113-styles-v1';

  // ============================================================
  // CSS injection
  // ============================================================
  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    document.querySelectorAll('style[id^="polish-1113-styles"]').forEach(function(s) { s.remove(); });
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      // PROGRESS TRACKER — recolor purple (Module 3) — override v11.1.12 gold
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-stat {',
      '  background: linear-gradient(135deg, rgba(124,92,255,0.20), rgba(124,92,255,0.08)) !important;',
      '  border-color: rgba(124,92,255,0.35) !important;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-stat .val {',
      '  color: rgba(255,255,255,0.95) !important;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-stat .lbl {',
      '  color: rgba(180,165,255,0.9) !important;',
      '}',
      // HERO STATS roadmap (Module 2)
      '.polish-1113-hero-roadmap { display: flex; flex-direction: column; gap: 18px; padding: 16px 4px 8px; }',
      '.polish-1113-hero-row { display: flex; flex-direction: column; gap: 8px; }',
      '.polish-1113-hero-label { font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; display: flex; justify-content: space-between; align-items: baseline; }',
      '.polish-1113-hero-label .hint { font-size: 10px; opacity: 0.55; text-transform: none; letter-spacing: 0; }',
      '.polish-1113-streak-dots { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }',
      '.polish-1113-streak-dot { width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10); transition: all 180ms cubic-bezier(0.4,0,0.2,1); }',
      '.polish-1113-streak-dot.done { background: linear-gradient(135deg,#ff8a3d,#ff5a3d); border-color: rgba(255,138,61,0.6); box-shadow: 0 0 8px rgba(255,138,61,0.35); }',
      '.polish-1113-streak-dot.today { background: linear-gradient(135deg,#ff8a3d,#ff5a3d); border-color: white; box-shadow: 0 0 12px rgba(255,138,61,0.65); transform: scale(1.15); }',
      '.polish-1113-streak-milestone { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(255,138,61,0.08); border: 1px solid rgba(255,138,61,0.20); color: #ffb380; margin-left: 4px; }',
      '.polish-1113-xp-bar { height: 10px; border-radius: 6px; background: rgba(255,255,255,0.06); overflow: hidden; position: relative; }',
      '.polish-1113-xp-fill { height: 100%; background: linear-gradient(90deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95)); border-radius: 6px; transition: width 420ms cubic-bezier(0.4,0,0.2,1); }',
      '.polish-1113-xp-text { font-size: 12px; opacity: 0.8; display: flex; justify-content: space-between; }',
      '.polish-1113-level-chip { display: inline-block; padding: 2px 10px; border-radius: 10px; font-weight: 600; font-size: 12px; background: rgba(124,92,255,0.18); color: rgba(180,165,255,1); border: 1px solid rgba(124,92,255,0.3); }',
      // TODAY GOAL cleanup (Module 4) — hide mock progress, polish checklist
      '.card.polish-1113-tg-clean .polish-1113-mock-mission { display: none !important; }',
      '.polish-1113-tg-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 4px 12px; gap: 12px; }',
      '.polish-1113-tg-count { font-size: 28px; font-weight: 700; color: rgba(255,255,255,0.95); line-height: 1; }',
      '.polish-1113-tg-count .total { font-size: 18px; opacity: 0.55; font-weight: 500; }',
      '.polish-1113-tg-streak { font-size: 12px; opacity: 0.7; }',
      '.polish-1113-tg-bar { height: 6px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; margin: 0 4px 12px; }',
      '.polish-1113-tg-fill { height: 100%; background: linear-gradient(90deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95)); border-radius: 4px; transition: width 420ms cubic-bezier(0.4,0,0.2,1); }'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ============================================================
  // MODULE 1: Heatmap RETARGET (Việc 3)
  // ============================================================
  function fixHeatmapTargeting() {
    var allCells = document.querySelectorAll('.hm-cell');
    var byDay = {};
    var state = (window.shadowEN && window.shadowEN.state) || window.state;
    if (state && Array.isArray(state.sessionsLog)) {
      state.sessionsLog.forEach(function(s) {
        if (!s.at) return;
        var key = new Date(s.at).toISOString().substring(0, 10);
        byDay[key] = (byDay[key] || 0) + 1;
      });
    }
    var INTENSITY = [
      null,
      'rgba(46, 160, 67, 0.40)',
      'rgba(46, 160, 67, 0.60)',
      'rgba(46, 160, 67, 0.80)',
      'rgba(46, 160, 67, 1.00)'
    ];
    function intensityFor(n) { return !n ? 0 : (n === 1 ? 1 : (n === 2 ? 2 : (n <= 4 ? 3 : 4))); }

    // ROLLING 28-DAY WINDOW ending today (so today's sessions always visible)
    // Cell 0 = today - 27 days, Cell 27 = today
    var now = new Date();
    var gridStart = new Date(now);
    gridStart.setDate(now.getDate() - 27);
    gridStart.setHours(0, 0, 0, 0);

    // Step A: CLEAR all polish-1112/1110 styling on LEGEND cells
    var legendCells = document.querySelectorAll('.heatmap-foot-right .hm-cell');
    legendCells.forEach(function(c) {
      c.style.removeProperty('background-color');
      c.removeAttribute('title');
      c.removeAttribute('data-hm-date');
      c.removeAttribute('data-hm-count');
      c.removeAttribute('data-hm-filled1110');
    });

    // Step B: Apply to MAIN GRID cells only (direct children of .heatmap)
    var mainCells = [];
    document.querySelectorAll('.heatmap').forEach(function(hm) {
      Array.from(hm.children).forEach(function(child) {
        if (child.classList.contains('hm-cell')) mainCells.push(child);
      });
    });

    mainCells.forEach(function(cell, i) {
      var cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + i);
      var key = cellDate.toISOString().substring(0, 10);
      var count = byDay[key] || 0;
      var intensity = intensityFor(count);
      cell.dataset.hmDate113 = key;
      cell.dataset.hmCount113 = String(count);
      if (count > 0) {
        cell.style.setProperty('background-color', INTENSITY[intensity], 'important');
        cell.title = key + ' — ' + count + ' session' + (count > 1 ? 's' : '');
      } else {
        cell.style.removeProperty('background-color');
        cell.removeAttribute('title');
      }
    });
    return { main: mainCells.length, legend: legendCells.length };
  }

  // ============================================================
  // MODULE 2: HERO STATS Roadmap (Việc 1)
  // ============================================================
  function findHeroStatsCard() {
    return Array.from(document.querySelectorAll('.card')).find(function(c) {
      var t = c.textContent || '';
      return /HERO STATS/.test(t) && t.length < 800;
    });
  }

  function renderHeroRoadmap() {
    var card = findHeroStatsCard();
    if (!card) return false;
    if (card.dataset.polish1113 === 'rendered') return true;

    var state = (window.shadowEN && window.shadowEN.state) || {};
    var user = state.user || {};
    var streak = user.streak || 0;
    var xp = user.xp || 0;
    var xpToNext = user.xpToNext || 100;
    var level = user.level || 1;

    // Streak milestones
    var milestones = [3, 7, 14, 30, 100];
    var nextMilestone = milestones.find(function(m) { return m > streak; }) || (streak + 30);

    // Dots for visualization: show last 14 days of streak journey (capped)
    var dotsToShow = Math.min(Math.max(14, nextMilestone), 30);
    var streakDots = '';
    for (var i = 0; i < dotsToShow; i++) {
      var dayNum = i + 1;
      var cls = 'polish-1113-streak-dot';
      if (dayNum < streak) cls += ' done';
      else if (dayNum === streak) cls += ' done today';
      streakDots += '<div class="' + cls + '" title="Day ' + dayNum + '"></div>';
    }

    var xpPct = Math.round((xp / xpToNext) * 100);

    var html = [
      '<div class="polish-1113-hero-roadmap">',
      // Streak row
      '<div class="polish-1113-hero-row">',
      '<div class="polish-1113-hero-label">',
      '<span>🔥 STREAK</span>',
      '<span class="hint">' + streak + ' / ' + nextMilestone + ' days · next milestone</span>',
      '</div>',
      '<div class="polish-1113-streak-dots">' + streakDots,
      '<span class="polish-1113-streak-milestone">🎯 ' + nextMilestone + 'd</span>',
      '</div>',
      '</div>',
      // Level XP row
      '<div class="polish-1113-hero-row">',
      '<div class="polish-1113-hero-label">',
      '<span><span class="polish-1113-level-chip">LV ' + level + '</span> &nbsp; XP PROGRESS</span>',
      '<span class="hint">→ LV ' + (level + 1) + '</span>',
      '</div>',
      '<div class="polish-1113-xp-bar"><div class="polish-1113-xp-fill" style="width:' + xpPct + '%"></div></div>',
      '<div class="polish-1113-xp-text"><span>' + xp + ' XP</span><span>' + xpToNext + ' XP</span></div>',
      '</div>',
      '</div>'
    ].join('');

    // Remove old roadmap if exists
    var oldRm = card.querySelector('.polish-1113-hero-roadmap');
    if (oldRm) oldRm.remove();
    // Hide old "1 days, Keep going" sparse text
    Array.from(card.children).forEach(function(child) {
      var txt = (child.textContent || '').trim();
      if (/^\d+\s*days?\s*Keep going/i.test(txt) || /^Keep going$/i.test(txt) || /^\d+\s*days?$/i.test(txt)) {
        child.style.display = 'none';
      }
    });
    card.insertAdjacentHTML('beforeend', html);

    card.dataset.polish1113 = 'rendered';
    return true;
  }

  // ============================================================
  // MODULE 3: Progress Tracker theme color (Việc 2)
  // ============================================================
  function applyProgressTheme() {
    // CSS-only fix — already in injectCSS above (override rules with !important)
    return true;
  }

  // ============================================================
  // MODULE 4: Today Goal layout cleanup (Việc 4)
  // ============================================================
  function cleanTodayGoal() {
    var card = Array.from(document.querySelectorAll('.card')).find(function(c) {
      return /TODAY GOAL/.test(c.textContent || '');
    });
    if (!card) return false;
    card.classList.add('polish-1113-tg-clean');

    // Hide mock "2/3 Missions completed" + progress bar from original markup
    // Look for big numbers like "2/3" or "Missions completed" text not inside our list
    Array.from(card.children).forEach(function(child) {
      var txt = (child.textContent || '').trim();
      // Skip if child IS our checklist
      if (child.classList.contains('polish-1112-mission-list')) return;
      if (child.classList.contains('polish-1113-tg-header')) return;
      if (child.classList.contains('polish-1113-tg-bar')) return;
      // Skip card-title
      if (child.classList.contains('card-title')) return;
      // Hide if contains "Missions completed" or "/" digit pattern
      if (/Missions completed|Streak active|\b\d+\s*\/\s*\d+/i.test(txt)) {
        child.classList.add('polish-1113-mock-mission');
      }
    });

    // Compute REAL done count from state
    var state = window.shadowEN && window.shadowEN.state;
    var items = (state && state.missions && state.missions.items) || [];
    var done = items.filter(function(i) { return i.done; }).length;
    var total = items.length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var streak = (state && state.user && state.user.streak) || 0;

    // Build/update real header + bar
    var header = card.querySelector('.polish-1113-tg-header');
    if (!header) {
      var headerHTML = [
        '<div class="polish-1113-tg-header">',
        '<div>',
        '<div class="polish-1113-tg-count">' + done + ' <span class="total">/ ' + total + '</span></div>',
        '<div class="polish-1113-tg-streak">Missions today · 🔥 ' + streak + ' day streak</div>',
        '</div>',
        '</div>',
        '<div class="polish-1113-tg-bar"><div class="polish-1113-tg-fill" style="width:' + pct + '%"></div></div>'
      ].join('');
      // Insert after card-title (or at top)
      var ct = card.querySelector('.card-title');
      if (ct) ct.insertAdjacentHTML('afterend', headerHTML);
      else card.insertAdjacentHTML('afterbegin', headerHTML);
    } else {
      header.querySelector('.polish-1113-tg-count').innerHTML = done + ' <span class="total">/ ' + total + '</span>';
      header.querySelector('.polish-1113-tg-streak').textContent = 'Missions today · 🔥 ' + streak + ' day streak';
      var fill = card.querySelector('.polish-1113-tg-fill');
      if (fill) fill.style.width = pct + '%';
    }
    return true;
  }

  // ============================================================
  // INIT
  // ============================================================
  function runAll() {
    try { injectCSS(); } catch (e) { console.warn('[1113] css:', e); }
    try { fixHeatmapTargeting(); } catch (e) { console.warn('[1113] heatmap:', e); }
    try { renderHeroRoadmap(); } catch (e) { console.warn('[1113] hero:', e); }
    try { applyProgressTheme(); } catch (e) { console.warn('[1113] progress:', e); }
    try { cleanTodayGoal(); } catch (e) { console.warn('[1113] today:', e); }
  }

  function init() {
    runAll();
    if (typeof window.render === 'function' && !window.render.__polish1113) {
      var orig = window.render;
      window.render = function() {
        var r = orig.apply(this, arguments);
        setTimeout(runAll, 100);
        return r;
      };
      window.render.__polish1113 = true;
    }
    setInterval(runAll, 2500);
  }

  window.SHADOW_POLISH_1113 = {
    version: VERSION,
    runAll: runAll,
    _info: function() {
      var mainCells = 0, mainColored = 0;
      document.querySelectorAll('.heatmap').forEach(function(hm) {
        Array.from(hm.children).forEach(function(c) {
          if (!c.classList.contains('hm-cell')) return;
          mainCells++;
          if (parseInt(c.dataset.hmCount113 || '0', 10) > 0) mainColored++;
        });
      });
      var hero = findHeroStatsCard();
      var tg = Array.from(document.querySelectorAll('.card')).find(function(c) {
        return /TODAY GOAL/.test(c.textContent || '');
      });
      return {
        version: VERSION,
        heatmap_main_cells: mainCells,
        heatmap_main_colored: mainColored,
        hero_roadmap_rendered: !!(hero && hero.dataset.polish1113 === 'rendered'),
        today_goal_cleaned: !!(tg && tg.classList.contains('polish-1113-tg-clean')),
        css_injected: !!document.getElementById(STYLE_ID)
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
