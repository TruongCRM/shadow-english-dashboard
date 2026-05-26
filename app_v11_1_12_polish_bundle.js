// === SHADOW ENGLISH — STABILIZE PATCH v11.1.12 ===
//
// Day 1 Wave 3 polish bundle — single file gộp 4 hotfixes:
//   1. Filter tabs handler (Việc 2) — .queue-tab click → active swap + filter rows
//   2. Today-greeting font fix (Việc 5) — Vietnamese diacritic support
//   3. Progress Tracker asymmetric layout (Việc 1) — hero|mini|mini|hero pattern
//   4. Today Goal mission checklist (Việc 4) — render state.missions.items
//
// Pure additive. Idempotent. Versioned CSS per G9.

(function() {
  'use strict';

  var VERSION = '11.1.12';
  var STYLE_ID = 'polish-1112-styles-v1';

  // ============================================================
  // SHARED: CSS injection (G9 versioned)
  // ============================================================
  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    document.querySelectorAll('style[id^="polish-1112-styles"]').forEach(function(s) { s.remove(); });
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      // FONT FIX (Module 2)
      '.today-greeting, .today-greeting *, [class*="coach-quote"], [class*="greeting"] {',
      '  font-family: "Inter", "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif !important;',
      '  font-feature-settings: "kern", "liga", "calt" !important;',
      '  -webkit-font-smoothing: antialiased;',
      '}',
      // PROGRESS TRACKER ASYMMETRIC (Module 3) — override v11.1.11
      '.card.progress-empty-chart.polish-1112-asym {',
      '  display: flex; flex-direction: column; gap: 14px;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats {',
      '  display: grid;',
      '  grid-template-columns: 1fr 1fr;',
      '  grid-template-areas:',
      '    "hero1 hero1"',
      '    "mini1 mini2"',
      '    "hero2 hero2";',
      '  gap: 12px;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat {',
      '  padding: 18px 14px; border-radius: 12px;',
      '  background: rgba(255,255,255,0.04);',
      '  border: 1px solid rgba(255,255,255,0.06);',
      '  text-align: center;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-stat {',
      '  background: linear-gradient(135deg, rgba(255,193,67,0.18), rgba(255,193,67,0.10));',
      '  border-color: rgba(255,193,67,0.30);',
      '  padding: 22px 16px;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat .lbl {',
      '  font-size: 11px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.06em;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-stat .lbl {',
      '  font-size: 13px; opacity: 0.9;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat .val {',
      '  font-size: 22px; font-weight: 600; margin-top: 4px;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-stat .val {',
      '  font-size: 30px; font-weight: 700;',
      '}',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-1 { grid-area: hero1; }',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.hero-2 { grid-area: hero2; }',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.mini-1 { grid-area: mini1; }',
      '.card.progress-empty-chart.polish-1112-asym .progress-stats .mini-stat.mini-2 { grid-area: mini2; }',
      // TODAY GOAL CHECKLIST (Module 4)
      '.polish-1112-mission-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }',
      '.polish-1112-mission-item {',
      '  display: flex; align-items: center; gap: 10px;',
      '  padding: 10px 12px; border-radius: 10px;',
      '  background: rgba(255,255,255,0.03);',
      '  border: 1px solid rgba(255,255,255,0.05);',
      '  cursor: pointer; transition: all 180ms cubic-bezier(0.4,0,0.2,1);',
      '}',
      '.polish-1112-mission-item:hover { background: rgba(255,255,255,0.06); transform: translateY(-1px); }',
      '.polish-1112-mission-item.done {',
      '  background: rgba(46,160,67,0.10);',
      '  border-color: rgba(46,160,67,0.30);',
      '}',
      '.polish-1112-mission-item.done .polish-1112-mission-text { text-decoration: line-through; opacity: 0.65; }',
      '.polish-1112-mission-check {',
      '  width: 20px; height: 20px; border-radius: 6px;',
      '  border: 2px solid rgba(255,255,255,0.25);',
      '  display: flex; align-items: center; justify-content: center;',
      '  flex-shrink: 0; font-size: 13px;',
      '}',
      '.polish-1112-mission-item.done .polish-1112-mission-check {',
      '  background: rgb(46,160,67); border-color: rgb(46,160,67); color: white;',
      '}',
      '.polish-1112-mission-text { font-size: 14px; flex: 1; }',
      // FILTER TABS active state polish
      '.queue-tab.polish-1112-bound { transition: all 180ms cubic-bezier(0.4,0,0.2,1); }',
      '.queue-tab.polish-1112-bound:hover { background: rgba(124,92,255,0.10); }'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ============================================================
  // MODULE 1: Filter Tabs Handler (Việc 2)
  // ============================================================
  function bindFilterTabs() {
    var tabs = document.querySelectorAll('.queue-tab');
    if (!tabs.length) return 0;
    var bound = 0;
    tabs.forEach(function(tab) {
      if (tab.dataset.polish1112) return;
      tab.dataset.polish1112 = '1';
      tab.classList.add('polish-1112-bound');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      tab.addEventListener('click', function(e) {
        e.stopPropagation();
        // Update active class
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        // Extract filter from text content
        var text = (tab.textContent || '').trim();
        var filter = 'all';
        if (/Day 1/i.test(text)) filter = 'day1';
        else if (/Day 3/i.test(text)) filter = 'day3';
        else if (/Day 7/i.test(text)) filter = 'day7';
        else if (/Overdue/i.test(text)) filter = 'overdue';
        applyQueueFilter(filter);
      }, true);
      // Keyboard support
      tab.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); }
      });
      bound++;
    });
    return bound;
  }

  function applyQueueFilter(filter) {
    // Find queue rows — multiple potential containers
    var rows = document.querySelectorAll(
      '.queue-row, .review-row, .review-item, .queue-table tbody tr, ' +
      '#today-review-list > div'
    );
    rows.forEach(function(r) {
      var txt = (r.textContent || '').trim();
      var show = true;
      if (filter === 'day1') show = /Day 1/i.test(txt);
      else if (filter === 'day3') show = /Day 3/i.test(txt);
      else if (filter === 'day7') show = /Day 7/i.test(txt);
      else if (filter === 'overdue') show = /Overdue|overdue/i.test(txt);
      r.style.display = show ? '' : 'none';
    });
  }

  // ============================================================
  // MODULE 3: Progress Tracker Asymmetric Layout (Việc 1)
  // ============================================================
  function applyProgressLayout() {
    var card = document.querySelector('.card.progress-empty-chart');
    if (!card) return false;
    card.classList.add('polish-1112-asym');
    var stats = card.querySelector('.progress-stats');
    if (!stats) return false;
    var minis = stats.querySelectorAll('.mini-stat');
    if (minis.length < 4) return false;

    // Identify Study Time + Accuracy by lbl text, assign hero classes
    // Order in DOM (v11.1.11): NEW THIS WEEK, REVIEWS DONE, STUDY TIME, ACCURACY
    minis.forEach(function(m) {
      var lbl = (m.querySelector('.lbl')?.textContent || '').toUpperCase();
      // Reset classes
      m.classList.remove('hero-stat', 'hero-1', 'hero-2', 'mini-1', 'mini-2');
      if (lbl.indexOf('STUDY') !== -1 || lbl.indexOf('TIME') !== -1) {
        m.classList.add('hero-stat', 'hero-1');
      } else if (lbl.indexOf('ACCUR') !== -1) {
        m.classList.add('hero-stat', 'hero-2');
      } else if (lbl.indexOf('NEW') !== -1 || lbl.indexOf('WEEK') !== -1) {
        m.classList.add('mini-1');
      } else if (lbl.indexOf('REVIEW') !== -1 || lbl.indexOf('DONE') !== -1) {
        m.classList.add('mini-2');
      } else {
        m.classList.add('mini-1'); // fallback
      }
    });
    return true;
  }

  // ============================================================
  // MODULE 4: Today Goal Mission Checklist (Việc 4)
  // ============================================================
  function findTodayGoalCard() {
    var nodes = document.querySelectorAll('.card, [class*="card"]');
    for (var i = 0; i < nodes.length; i++) {
      var t = nodes[i].textContent || '';
      if (/TODAY GOAL|Today Goal/.test(t) && /Missions|missions/.test(t)) {
        return nodes[i];
      }
    }
    return null;
  }

  function renderMissionChecklist() {
    var card = findTodayGoalCard();
    if (!card) return false;
    if (card.dataset.polish1112 === 'rendered') return true;

    var state = window.shadowEN && window.shadowEN.state;
    var missions = state && state.missions;
    if (!missions || !Array.isArray(missions.items)) return false;

    // Build checklist HTML
    var listHTML = '<ul class="polish-1112-mission-list">';
    missions.items.forEach(function(item, i) {
      var doneClass = item.done ? ' done' : '';
      var check = item.done ? '✓' : '';
      listHTML += '<li class="polish-1112-mission-item' + doneClass + '" data-mission-idx="' + i + '">';
      listHTML += '<div class="polish-1112-mission-check">' + check + '</div>';
      listHTML += '<div class="polish-1112-mission-text">' + escapeHTML(item.task) + '</div>';
      listHTML += '</li>';
    });
    listHTML += '</ul>';

    // Insert AFTER existing content (don't replace — preserve "Streak active" + progress bar)
    var existing = card.querySelector('.polish-1112-mission-list');
    if (existing) existing.remove();
    card.insertAdjacentHTML('beforeend', listHTML);

    // Bind click toggle
    card.querySelectorAll('.polish-1112-mission-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = parseInt(el.dataset.missionIdx, 10);
        if (state.missions.items[idx]) {
          state.missions.items[idx].done = !state.missions.items[idx].done;
          if (typeof window.saveState === 'function') window.saveState();
          else if (window.shadowEN && typeof window.shadowEN.saveState === 'function') window.shadowEN.saveState();
          // Re-render this card
          card.dataset.polish1112 = '';
          renderMissionChecklist();
          // Trigger main render
          if (typeof window.render === 'function') setTimeout(window.render, 50);
        }
      });
    });

    card.dataset.polish1112 = 'rendered';
    return true;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ============================================================
  // INIT + safety nets
  // ============================================================
  function runAll() {
    try { injectCSS(); } catch(e) { console.warn('[polish-1112] injectCSS:', e); }
    try { bindFilterTabs(); } catch(e) { console.warn('[polish-1112] filterTabs:', e); }
    try { applyProgressLayout(); } catch(e) { console.warn('[polish-1112] progress:', e); }
    try { renderMissionChecklist(); } catch(e) { console.warn('[polish-1112] mission:', e); }
  }

  function init() {
    runAll();
    if (typeof window.render === 'function' && !window.render.__polish1112) {
      var orig = window.render;
      window.render = function() {
        var r = orig.apply(this, arguments);
        setTimeout(runAll, 80);
        return r;
      };
      window.render.__polish1112 = true;
    }
    setInterval(runAll, 2500);
  }

  window.SHADOW_POLISH_1112 = {
    version: VERSION,
    runAll: runAll,
    bindFilterTabs: bindFilterTabs,
    applyProgressLayout: applyProgressLayout,
    renderMissionChecklist: renderMissionChecklist,
    _info: function() {
      var tabs = document.querySelectorAll('.queue-tab');
      var card = document.querySelector('.card.progress-empty-chart');
      var tg = findTodayGoalCard();
      return {
        version: VERSION,
        filter_tabs_bound: Array.from(tabs).filter(function(t) { return t.dataset.polish1112; }).length,
        filter_tabs_total: tabs.length,
        progress_card_asym: !!(card && card.classList.contains('polish-1112-asym')),
        today_goal_rendered: !!(tg && tg.dataset.polish1112 === 'rendered'),
        font_css_injected: !!document.getElementById(STYLE_ID)
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
