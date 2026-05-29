// ============================================================
// SHADOW ENGLISH v13.2 — Review Engine Page Populate
// Hook view-review with full queue table + filter tabs + actions
// Reads real state.topics
// Date: 2026-05-29 Day 3
// ============================================================

(function setupV13_2() {
  const NS = window.SHADOW_V13_2 = window.SHADOW_V13_2 || {};
  NS.version = '13.2';
  NS.STAGES = ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'];
  NS.activeFilter = 'all';

  NS.getState = function() { return window.shadowEN?.state || window.state || {}; };

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  // ============= MAIN RENDER =============
  NS.renderReviewPage = function() {
    const view = document.getElementById('view-review');
    if (!view) return;
    view.querySelectorAll('.v13-2-review-content').forEach(el => el.remove());

    const state = NS.getState();
    const topics = state.topics || [];
    const now = Date.now();

    // Compute counts per stage
    const counts = { all: topics.length, overdue: 0 };
    NS.STAGES.forEach(s => { counts[s] = topics.filter(t => t.reviewStage === s).length; });
    counts.overdue = topics.filter(t => t.nextReview && new Date(t.nextReview).getTime() <= now && t.reviewStage !== 'Day 0').length;

    const filterTabs = [
      { key: 'all', label: 'All', count: counts.all },
      ...NS.STAGES.map(s => ({ key: s, label: s, count: counts[s] })),
      { key: 'overdue', label: 'Overdue', count: counts.overdue }
    ];

    const filtered = NS.filterTopics(topics, NS.activeFilter);

    const container = document.createElement('div');
    container.className = 'v13-2-review-content';
    container.innerHTML = `
      <div class="v13-2-review-header">
        <div class="v13-2-review-title">
          <span class="v13-2-review-icon">⚙</span>
          <span>REVIEW ENGINE — SPACED REPETITION QUEUE</span>
          <span class="v13-2-live-badge">● LIVE</span>
        </div>
        <div class="v13-2-review-subtitle">${counts.all} topics · auto-scheduled by Adaptive Memory Engine v10</div>
      </div>

      <div class="v13-2-filter-tabs">
        ${filterTabs.map(t => `
          <button class="v13-2-tab ${NS.activeFilter === t.key ? 'active' : ''}" data-filter="${escapeHTML(t.key)}">
            <span>${escapeHTML(t.label)}</span>
            <span class="v13-2-tab-count">(${t.count})</span>
          </button>
        `).join('')}
      </div>

      <div class="v13-2-table-wrap">
        ${filtered.length === 0 ? `
          <div class="v13-2-empty">
            <div class="v13-2-empty-icon">📭</div>
            <div class="v13-2-empty-title">Không có topic nào ở filter này</div>
            <div class="v13-2-empty-hint">${NS.activeFilter === 'overdue' ? 'Tốt! Anh đang on-track với schedule.' : 'Học topic mới hoặc đợi tới lịch review tiếp.'}</div>
          </div>
        ` : `
          <table class="v13-2-review-table">
            <thead>
              <tr>
                <th class="col-pri">Priority</th>
                <th class="col-topic">Topic</th>
                <th class="col-stage">Stage</th>
                <th class="col-mem">Memory</th>
                <th class="col-last">Last Review</th>
                <th class="col-next">Next</th>
                <th class="col-act"></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(NS._renderRow).join('')}
            </tbody>
          </table>
        `}
      </div>

      <div class="v13-2-footer">
        <div class="v13-2-legend">
          <span class="v13-2-legend-item"><span class="v13-2-pri-icon">🔥</span> Fragile — recover ASAP</span>
          <span class="v13-2-legend-item"><span class="v13-2-pri-icon">↑</span> Weak — needs attention</span>
          <span class="v13-2-legend-item"><span class="v13-2-pri-icon">·</span> Building/Stable — on track</span>
        </div>
      </div>
    `;

    view.appendChild(container);

    // Tab click handlers
    container.querySelectorAll('.v13-2-tab').forEach(t => {
      t.onclick = function() {
        NS.activeFilter = t.dataset.filter;
        NS.renderReviewPage();
      };
    });

    // Row action handlers
    container.querySelectorAll('[data-action="start"]').forEach(b => {
      b.onclick = function() {
        const topicId = b.dataset.topicId;
        if (typeof window.openTopic === 'function') {
          window.openTopic(topicId);
        }
      };
    });
  };

  NS.filterTopics = function(topics, filter) {
    const now = Date.now();
    let arr;
    if (filter === 'all') arr = topics.slice();
    else if (filter === 'overdue') arr = topics.filter(t => t.nextReview && new Date(t.nextReview).getTime() <= now && t.reviewStage !== 'Day 0');
    else arr = topics.filter(t => t.reviewStage === filter);
    return arr.sort((a, b) => NS._priorityScore(b) - NS._priorityScore(a));
  };

  NS._priorityScore = function(t) {
    const memMap = { 'Fragile': 4, 'Weak': 3, 'Building': 2, 'Stable': 1, 'Automatic': 0 };
    const memScore = memMap[t.memoryStatus] != null ? memMap[t.memoryStatus] : 2;
    const overdueBonus = (t.nextReview && new Date(t.nextReview).getTime() <= Date.now()) ? 2 : 0;
    return memScore * 10 + overdueBonus * 5 - (t.confidence || 0);
  };

  NS._renderRow = function(topic) {
    const priority = NS._priorityIcon(topic);
    const masteryPct = topic.masteryPct || 0;
    const memBar = `<div class="v13-2-mem-bar"><div class="v13-2-mem-fill" style="width: ${masteryPct}%"></div></div><span class="v13-2-mem-pct">${masteryPct}%</span>`;
    const lastRev = NS._formatLastReview(topic.lastReview);
    const nextRev = NS._formatNextReview(topic.nextReview);
    const stageKey = (topic.reviewStage || 'Day 0').toLowerCase().replace(/\s/g, '');

    return `
      <tr data-topic-id="${escapeHTML(topic.id)}">
        <td class="col-pri">${priority}</td>
        <td class="col-topic">
          <span class="v13-2-emoji">${topic.emoji || '📚'}</span>
          <span class="v13-2-topic-name">${escapeHTML(topic.name || topic.id)}</span>
        </td>
        <td class="col-stage">
          <span class="v13-2-stage-badge stage-${stageKey}">${escapeHTML(topic.reviewStage || 'Day 0')}</span>
        </td>
        <td class="col-mem">${memBar}</td>
        <td class="col-last">${lastRev}</td>
        <td class="col-next">${nextRev}</td>
        <td class="col-act">
          <button class="v13-2-action-btn" data-action="start" data-topic-id="${escapeHTML(topic.id)}" title="Start review session">▶</button>
        </td>
      </tr>
    `;
  };

  NS._priorityIcon = function(t) {
    const now = Date.now();
    const overdue = t.nextReview && new Date(t.nextReview).getTime() <= now;
    if (t.memoryStatus === 'Fragile') return '<span class="v13-2-pri-icon pri-fragile" title="Fragile — recover ASAP">🔥</span>';
    if (t.memoryStatus === 'Weak') return '<span class="v13-2-pri-icon pri-weak" title="Weak">↑</span>';
    if (overdue) return '<span class="v13-2-pri-icon pri-overdue" title="Overdue">⏰</span>';
    return '<span class="v13-2-pri-icon pri-normal">·</span>';
  };

  NS._formatLastReview = function(d) {
    if (!d) return '<span class="v13-2-muted">Never</span>';
    const days = Math.floor((Date.now() - new Date(d).getTime()) / (24 * 3600 * 1000));
    if (days < 0) return 'Today';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days / 7) + 'w ago';
    return Math.floor(days / 30) + 'mo ago';
  };

  NS._formatNextReview = function(d) {
    if (!d) return '<span class="v13-2-muted">—</span>';
    const days = Math.floor((new Date(d).getTime() - Date.now()) / (24 * 3600 * 1000));
    if (days < 0) return '<span class="v13-2-overdue">Overdue</span>';
    if (days === 0) return '<span class="v13-2-today">Today</span>';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return 'in ' + days + 'd';
    if (days < 30) return 'in ' + Math.floor(days / 7) + 'w';
    return 'in ' + Math.floor(days / 30) + 'mo';
  };

  // ============= CSS =============
  function injectCSS() {
    const id = 'v13-2-styles-v1';
    if (document.getElementById(id)) return;
    document.querySelectorAll('style[id^="v13-2-styles"]').forEach(s => s.remove());
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      .v13-2-review-content {
        padding: 24px 28px;
        background: var(--card, #1a1838);
        border-radius: 14px;
        margin: 20px;
        border: 1px solid rgba(255,255,255,0.04);
      }
      .v13-2-review-header { margin-bottom: 20px; }
      .v13-2-review-title {
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; font-weight: 700;
        letter-spacing: 0.06em;
        color: rgba(255,255,255,0.9);
        text-transform: uppercase;
      }
      .v13-2-review-icon {
        color: rgba(180,140,255,0.85);
        font-size: 18px;
      }
      .v13-2-live-badge {
        margin-left: auto;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(34,197,94,0.15);
        color: rgba(74,222,128,0.95);
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.05em;
        animation: v132-pulse 2s ease-in-out infinite;
      }
      @keyframes v132-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .v13-2-review-subtitle {
        margin-top: 6px;
        font-size: 12.5px;
        color: rgba(255,255,255,0.55);
        font-style: italic;
      }
      .v13-2-filter-tabs {
        display: flex; gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 18px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .v13-2-tab {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 8px 14px;
        border-radius: 18px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.7);
        font-size: 12.5px;
        cursor: pointer;
        transition: all 180ms ease-out;
        white-space: nowrap;
      }
      .v13-2-tab:hover {
        background: rgba(124,92,255,0.1);
        color: white;
        border-color: rgba(124,92,255,0.3);
      }
      .v13-2-tab.active {
        background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(180,140,255,0.95));
        border-color: rgba(180,140,255,0.5);
        color: white;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(124,92,255,0.3);
      }
      .v13-2-tab-count {
        opacity: 0.7;
        font-size: 11.5px;
      }
      .v13-2-tab.active .v13-2-tab-count { opacity: 1; }

      .v13-2-table-wrap { overflow-x: auto; }
      .v13-2-review-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .v13-2-review-table th {
        text-align: left;
        padding: 10px 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255,255,255,0.45);
        font-weight: 600;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .v13-2-review-table .col-pri { width: 50px; }
      .v13-2-review-table .col-stage { width: 100px; }
      .v13-2-review-table .col-mem { width: 140px; }
      .v13-2-review-table .col-last,
      .v13-2-review-table .col-next { width: 100px; }
      .v13-2-review-table .col-act { width: 60px; text-align: center; }

      .v13-2-review-table tbody tr {
        transition: all 150ms ease-out;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .v13-2-review-table tbody tr:hover {
        background: rgba(124,92,255,0.04);
      }
      .v13-2-review-table td {
        padding: 14px 12px;
        color: rgba(255,255,255,0.85);
        vertical-align: middle;
      }
      .v13-2-emoji { font-size: 18px; margin-right: 8px; }
      .v13-2-topic-name {
        font-weight: 600;
        color: rgba(255,255,255,0.95);
      }

      .v13-2-pri-icon { font-size: 14px; }
      .v13-2-pri-icon.pri-fragile { filter: drop-shadow(0 0 6px rgba(239,68,68,0.4)); }
      .v13-2-pri-icon.pri-weak { color: rgba(245,158,11,0.95); font-weight: 700; }
      .v13-2-pri-icon.pri-overdue { color: rgba(239,68,68,0.95); }
      .v13-2-pri-icon.pri-normal { color: rgba(255,255,255,0.3); }

      .v13-2-stage-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .v13-2-stage-badge.stage-day0 { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65); }
      .v13-2-stage-badge.stage-day1 { background: rgba(239,68,68,0.18); color: #f87171; }
      .v13-2-stage-badge.stage-day3 { background: rgba(245,158,11,0.18); color: #fbbf24; }
      .v13-2-stage-badge.stage-day7 { background: rgba(250,204,21,0.18); color: #facc15; }
      .v13-2-stage-badge.stage-day21 { background: rgba(34,197,94,0.18); color: #4ade80; }
      .v13-2-stage-badge.stage-day60 { background: rgba(167,139,250,0.18); color: #a78bfa; }

      .v13-2-mem-bar {
        display: inline-block;
        width: 80px;
        height: 6px;
        background: rgba(255,255,255,0.06);
        border-radius: 3px;
        overflow: hidden;
        vertical-align: middle;
        margin-right: 8px;
      }
      .v13-2-mem-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95));
        transition: width 400ms ease-out;
      }
      .v13-2-mem-pct {
        font-size: 12px;
        color: rgba(255,255,255,0.75);
      }

      .v13-2-muted { color: rgba(255,255,255,0.4); }
      .v13-2-today { color: rgba(180,140,255,0.95); font-weight: 600; }
      .v13-2-overdue { color: #ef4444; font-weight: 700; }

      .v13-2-action-btn {
        padding: 7px 14px;
        border-radius: 6px;
        background: linear-gradient(135deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95));
        border: 1px solid rgba(180,140,255,0.4);
        color: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 180ms ease-out;
      }
      .v13-2-action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(124,92,255,0.4);
      }

      .v13-2-empty {
        text-align: center;
        padding: 48px 24px;
        background: rgba(255,255,255,0.02);
        border: 2px dashed rgba(124,92,255,0.15);
        border-radius: 12px;
      }
      .v13-2-empty-icon { font-size: 36px; margin-bottom: 12px; }
      .v13-2-empty-title {
        font-size: 14px;
        color: rgba(255,255,255,0.85);
        font-weight: 600;
        margin-bottom: 4px;
      }
      .v13-2-empty-hint {
        font-size: 12.5px;
        color: rgba(255,255,255,0.55);
        font-style: italic;
      }

      .v13-2-footer {
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .v13-2-legend {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 11px;
        color: rgba(255,255,255,0.5);
      }
      .v13-2-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      /* Mobile */
      @media (max-width: 700px) {
        .v13-2-review-content {
          padding: 14px 16px;
          margin: 10px;
        }
        .v13-2-review-title { font-size: 12px; }
        .v13-2-live-badge { font-size: 9.5px; padding: 3px 8px; }
        .v13-2-tab { padding: 6px 10px; font-size: 11.5px; }
        .v13-2-review-table th,
        .v13-2-review-table td { padding: 8px 6px; font-size: 11.5px; }
        .v13-2-emoji { font-size: 16px; margin-right: 4px; }
        .v13-2-mem-bar { width: 50px; }
        .v13-2-mem-pct { font-size: 11px; }
        .v13-2-stage-badge { padding: 2px 6px; font-size: 9.5px; }
        .v13-2-action-btn { padding: 5px 10px; font-size: 11px; }
        .v13-2-legend { font-size: 10px; gap: 10px; }
        /* Hide some columns on narrow */
        .v13-2-review-table .col-last,
        .v13-2-review-table .col-next { display: none; }
      }
      @media (max-width: 400px) {
        .v13-2-review-table .col-mem { display: none; }
        .v13-2-tab-count { display: none; }
      }
    `;
    document.head.appendChild(s);
  }

  // ============= NAV HOOK =============
  function hookNavigate() {
    if (typeof window.navigate !== 'function') { setTimeout(hookNavigate, 200); return; }
    if (window.navigate.__v13_2_hooked) return;
    const orig = window.navigate;
    window.navigate = function(viewId) {
      orig(viewId);
      if (viewId === 'review') {
        setTimeout(NS.renderReviewPage, 200);
        setTimeout(NS.renderReviewPage, 800);
      }
    };
    window.navigate.__v13_2_hooked = true;

    // Initial render if already on review view
    if (document.querySelector('#view-review.active') || document.querySelector('#view-review[style*="display: contents"]')) {
      setTimeout(NS.renderReviewPage, 500);
    }
  }

  injectCSS();
  hookNavigate();

  NS._info = function() {
    const state = NS.getState();
    return {
      version: NS.version,
      topicCount: (state.topics || []).length,
      activeFilter: NS.activeFilter
    };
  };

  console.log('[v13.2] Review Engine page populated · v' + NS.version);
})();
