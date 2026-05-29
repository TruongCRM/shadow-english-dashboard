// ============================================================
// SHADOW ENGLISH v13.3 — Review Engine = MISSION CONTROL CENTER
// Full-width, card-based, priority-grouped review queue.
// Replaces the v13.2 raw database table. Reads real state.topics.
// Root cause fixed: .view{display:contents} made the old content a
// single 5-col grid item whose table min-width ballooned one track
// to ~600px (rest empty). Now the wrapper uses grid-column:1/-1.
// Date: 2026-05-29 (UX Optimization Sprint)
// ============================================================

(function setupV13_2() {
  const NS = window.SHADOW_V13_2 = window.SHADOW_V13_2 || {};
  NS.version = '13.3';
  NS.STAGES = ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'];
  NS.activeFilter = 'all';

  NS.getState = function () { return window.shadowEN?.state || window.state || {}; };

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // ---------- topic helpers ----------
  NS._isReviewed = function (t) { return !!t.lastReview; };
  NS._isOverdue = function (t) {
    return t.nextReview && new Date(t.nextReview).getTime() <= Date.now() && t.reviewStage !== 'Day 0';
  };
  NS._isNew = function (t) { return t.reviewStage === 'Day 0' || !t.lastReview; };

  // Priority bucket: urgent > attention > new > building > stable
  NS._bucketOf = function (t) {
    const ms = t.memoryStatus;
    if (NS._isOverdue(t) || (ms === 'Fragile' && NS._isReviewed(t))) return 'urgent';
    if (ms === 'Weak') return 'attention';
    if (NS._isNew(t)) return 'new';
    if (ms === 'Building') return 'building';
    if (ms === 'Stable' || ms === 'Automatic') return 'stable';
    if (ms === 'Fragile') return 'new';
    return 'building';
  };

  NS.BUCKETS = [
    { key: 'urgent',    icon: '🔥', title: 'Urgent Review',  hint: 'Recover these before they fade' },
    { key: 'attention', icon: '⚠️', title: 'Needs Attention', hint: 'Still shaky — reinforce today' },
    { key: 'new',       icon: '🆕', title: 'New Topics',      hint: 'Start your first session' },
    { key: 'building',  icon: '📈', title: 'Building',         hint: 'On track — keep the rhythm' },
    { key: 'stable',    icon: '✅', title: 'Stable',           hint: 'Locked in — light touch only' }
  ];

  NS._minutesFor = function (t) {
    const base = { 'Day 0': 6, 'Day 1': 5, 'Day 3': 5, 'Day 7': 4, 'Day 21': 3, 'Day 60': 3 };
    let m = base[t.reviewStage] != null ? base[t.reviewStage] : 4;
    if (NS._isOverdue(t)) m += 2;
    return m;
  };

  NS.filterTopics = function (topics, filter) {
    if (filter === 'all') return topics.slice();
    if (filter === 'overdue') return topics.filter(NS._isOverdue);
    return topics.filter(t => t.reviewStage === filter);
  };

  // ---------- MAIN RENDER ----------
  NS.renderReviewPage = function () {
    const view = document.getElementById('view-review');
    if (!view) return;
    view.querySelectorAll('.v13r-wrap').forEach(el => el.remove());

    const state = NS.getState();
    const topics = state.topics || [];

    const counts = { all: topics.length, overdue: topics.filter(NS._isOverdue).length };
    NS.STAGES.forEach(s => { counts[s] = topics.filter(t => t.reviewStage === s).length; });

    const filtered = NS.filterTopics(topics, NS.activeFilter);

    const urgentN = topics.filter(t => NS._bucketOf(t) === 'urgent').length;
    const newN = topics.filter(t => NS._bucketOf(t) === 'new').length;
    const stableN = topics.filter(t => NS._bucketOf(t) === 'stable').length;
    const estMin = filtered.reduce((sum, t) => sum + NS._minutesFor(t), 0);

    const chips = [
      { key: 'all', label: 'All', count: counts.all },
      ...NS.STAGES.map(s => ({ key: s, label: s, count: counts[s] })),
      { key: 'overdue', label: 'Overdue', count: counts.overdue }
    ];

    const wrap = document.createElement('div');
    wrap.className = 'v13r-wrap';
    wrap.innerHTML = `
      <div class="v13r-summary">
        <div class="v13r-summary-left">
          <div class="v13r-summary-eyebrow">⚡ Review Engine · Mission Control</div>
          <div class="v13r-summary-title">Today's Review Queue</div>
          <div class="v13r-summary-count">${counts.all}<span> topics</span></div>
        </div>
        <div class="v13r-summary-right">
          <div class="v13r-summary-pills">
            <span class="v13r-pill p-urgent">🔥 ${urgentN} urgent</span>
            <span class="v13r-pill p-new">🆕 ${newN} new</span>
            <span class="v13r-pill p-stable">✅ ${stableN} stable</span>
          </div>
          <div class="v13r-summary-time">⏱ Est. ~${estMin} min ${NS.activeFilter === 'all' ? 'total' : 'for this view'}</div>
        </div>
      </div>

      <div class="v13r-chips">
        ${chips.map(c => `
          <button class="v13r-chip ${NS.activeFilter === c.key ? 'active' : ''}${c.count === 0 ? ' empty' : ''}" data-filter="${escapeHTML(c.key)}">
            ${escapeHTML(c.label)} <span class="v13r-chip-n">${c.count}</span>
          </button>
        `).join('')}
      </div>

      <div class="v13r-body">${NS._renderBody(filtered)}</div>
    `;

    view.appendChild(wrap);

    wrap.querySelectorAll('.v13r-chip').forEach(b => {
      b.onclick = () => { NS.activeFilter = b.dataset.filter; NS.renderReviewPage(); };
    });
    wrap.querySelectorAll('[data-action="start"]').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.topicId;
        if (typeof window.openTopic === 'function') window.openTopic(id);
      };
    });
  };

  NS._renderBody = function (filtered) {
    if (filtered.length === 0) return NS._renderEmpty();

    const groups = {};
    filtered.forEach(t => { const b = NS._bucketOf(t); (groups[b] = groups[b] || []).push(t); });

    let html = '';
    NS.BUCKETS.forEach(bk => {
      const arr = groups[bk.key];
      if (!arr || !arr.length) return;
      arr.sort((a, b) => NS._score(b) - NS._score(a));
      html += `
        <section class="v13r-section sec-${bk.key}">
          <div class="v13r-section-head">
            <span class="v13r-section-icon">${bk.icon}</span>
            <span class="v13r-section-title">${bk.title}</span>
            <span class="v13r-section-count">${arr.length}</span>
            <span class="v13r-section-hint">${bk.hint}</span>
          </div>
          <div class="v13r-cards">${arr.map(NS._renderCard).join('')}</div>
        </section>`;
    });
    return html;
  };

  NS._score = function (t) {
    const memMap = { 'Fragile': 4, 'Weak': 3, 'Building': 2, 'Stable': 1, 'Automatic': 0 };
    const memScore = memMap[t.memoryStatus] != null ? memMap[t.memoryStatus] : 2;
    const overdue = NS._isOverdue(t) ? 2 : 0;
    return memScore * 10 + overdue * 5 - (t.confidence || 0);
  };

  NS._renderCard = function (t) {
    const bucket = NS._bucketOf(t);
    const isNew = bucket === 'new';
    const pct = t.masteryPct || 0;
    const stage = t.reviewStage || 'Day 0';
    const stageKey = stage.toLowerCase().replace(/\s/g, '');
    const ms = t.memoryStatus || (isNew ? 'New' : 'Building');
    const msKey = ms.toLowerCase();
    const cta = isNew ? 'Start Learning' : 'Start Review';
    const flag = { urgent: '🔥', attention: '⚠️', new: '🆕', building: '📈', stable: '✅' }[bucket] || '·';

    const meta = isNew
      ? `<div class="v13r-card-meta"><span class="v13r-new-label">✨ New topic — not started yet</span></div>`
      : `<div class="v13r-card-meta">
           <span>Last: ${NS._fmtLast(t.lastReview)}</span>
           <span>Next: ${NS._fmtNext(t.nextReview)}</span>
         </div>`;

    const memBlock = isNew
      ? ''
      : `<div class="v13r-card-mem">
           <div class="v13r-mem-top">
             <span class="v13r-mem-tag state-${msKey}">${escapeHTML(ms)}</span>
             <span class="v13r-mem-pct">${pct}%</span>
           </div>
           <div class="v13r-mem-bar"><div class="v13r-mem-fill state-${msKey}" style="width:${pct}%"></div></div>
         </div>`;

    return `
      <div class="v13r-card pri-${bucket}" data-topic-id="${escapeHTML(t.id)}">
        <div class="v13r-card-top">
          <span class="v13r-emoji">${t.emoji || '📚'}</span>
          <div class="v13r-card-h">
            <div class="v13r-card-name">${escapeHTML(t.name || t.id)}</div>
            <div class="v13r-card-stage">
              <span class="v13r-stage-badge stage-${stageKey}">${escapeHTML(stage)}</span>
              <span class="v13r-stage-sub">${isNew ? 'New topic' : stage + ' review'}</span>
            </div>
          </div>
          <span class="v13r-flag">${flag}</span>
        </div>
        ${memBlock}
        ${meta}
        <button class="v13r-cta ${isNew ? 'cta-new' : ''}" data-action="start" data-topic-id="${escapeHTML(t.id)}">
          ${cta} <span class="v13r-cta-arrow">→</span>
        </button>
      </div>`;
  };

  NS._renderEmpty = function () {
    const overdue = NS.activeFilter === 'overdue';
    return `
      <div class="v13r-empty">
        <div class="v13r-empty-icon">🎉</div>
        <div class="v13r-empty-title">${overdue ? 'Inbox Zero' : 'Nothing here'}</div>
        <div class="v13r-empty-sub">${overdue
          ? 'No reviews are overdue. Your memory is on schedule — great job.'
          : 'No topics in this filter. Pick another stage or keep learning.'}</div>
        <div class="v13r-empty-next">Next review: tomorrow</div>
        <button class="v13r-cta cta-new" onclick="if(window.navigate)window.navigate('home')">Continue Learning <span class="v13r-cta-arrow">→</span></button>
      </div>`;
  };

  NS._fmtLast = function (d) {
    if (!d) return 'Never';
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 864e5);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days / 7) + 'w ago';
    return Math.floor(days / 30) + 'mo ago';
  };

  NS._fmtNext = function (d) {
    if (!d) return '—';
    const days = Math.floor((new Date(d).getTime() - Date.now()) / 864e5);
    if (days < 0) return '<b class="v13r-od">Overdue</b>';
    if (days === 0) return '<b class="v13r-tdy">Today</b>';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return 'in ' + days + 'd';
    if (days < 30) return 'in ' + Math.floor(days / 7) + 'w';
    return 'in ' + Math.floor(days / 30) + 'mo';
  };

  // ---------- CSS ----------
  function injectCSS() {
    const id = 'v13r-styles-v3';
    if (document.getElementById(id)) return;
    document.querySelectorAll('style[id^="v13-2-styles"], style[id^="v13r-styles"]').forEach(s => s.remove());
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      #view-review.active { display: contents; }
      .v13r-wrap {
        grid-column: 1 / -1;
        width: 100%;
        max-width: 1320px;
        margin: 4px auto 24px;
        padding: 0 4px;
        box-sizing: border-box;
      }

      .v13r-summary {
        display: flex; flex-wrap: wrap; gap: 18px 28px;
        align-items: flex-end; justify-content: space-between;
        padding: 22px 26px; margin-bottom: 18px;
        border-radius: 16px;
        background:
          radial-gradient(circle at 12% 20%, rgba(124,92,255,0.10), transparent 55%),
          linear-gradient(135deg, var(--card,#1a1838), #1f1b3e);
        border: 1px solid rgba(124,92,255,0.18);
      }
      .v13r-summary-eyebrow { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(180,140,255,0.85); font-weight: 600; }
      .v13r-summary-title { font-size: 15px; color: rgba(255,255,255,0.75); margin-top: 8px; }
      .v13r-summary-count { font-size: 46px; font-weight: 800; line-height: 1; color: #fff; margin-top: 2px; }
      .v13r-summary-count span { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.5); margin-left: 6px; }
      .v13r-summary-right { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
      .v13r-summary-pills { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
      .v13r-pill { padding: 6px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 600; white-space: nowrap; }
      .v13r-pill.p-urgent { background: rgba(239,68,68,0.14); color: #f87171; }
      .v13r-pill.p-new { background: rgba(124,92,255,0.16); color: #c4b5fd; }
      .v13r-pill.p-stable { background: rgba(34,197,94,0.14); color: #4ade80; }
      .v13r-summary-time { font-size: 12.5px; color: rgba(255,255,255,0.55); }

      .v13r-chips {
        display: flex; gap: 8px; align-items: center;
        overflow-x: auto; -webkit-overflow-scrolling: touch;
        padding: 2px 2px 12px; margin-bottom: 18px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        scrollbar-width: thin;
      }
      .v13r-chips::-webkit-scrollbar { height: 6px; }
      .v13r-chips::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
      .v13r-chip {
        flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: 18px;
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.7); font-size: 12.5px; cursor: pointer;
        white-space: nowrap; transition: all 160ms ease-out;
      }
      .v13r-chip:hover { background: rgba(124,92,255,0.10); color: #fff; border-color: rgba(124,92,255,0.3); }
      .v13r-chip.empty { opacity: 0.45; }
      .v13r-chip.active {
        background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(180,140,255,0.95));
        border-color: rgba(180,140,255,0.5); color: #fff; font-weight: 600; opacity: 1;
        box-shadow: 0 4px 14px rgba(124,92,255,0.3);
      }
      .v13r-chip-n { font-size: 11px; padding: 1px 7px; border-radius: 10px; background: rgba(0,0,0,0.25); color: inherit; opacity: 0.85; }
      .v13r-chip.active .v13r-chip-n { background: rgba(255,255,255,0.25); }

      .v13r-section { margin-bottom: 26px; }
      .v13r-section-head { display: flex; align-items: center; gap: 10px; padding: 8px 4px 12px; }
      .v13r-section-icon { font-size: 16px; }
      .v13r-section-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.92); letter-spacing: 0.01em; }
      .v13r-section-count { font-size: 11.5px; font-weight: 700; min-width: 22px; text-align: center; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }
      .v13r-section-hint { font-size: 12px; color: rgba(255,255,255,0.4); font-style: italic; margin-left: 4px; }
      .sec-urgent .v13r-section-title { color: #f87171; }
      .sec-urgent .v13r-section-count { background: rgba(239,68,68,0.15); color: #f87171; }
      .sec-attention .v13r-section-title { color: #fbbf24; }
      .sec-attention .v13r-section-count { background: rgba(245,158,11,0.15); color: #fbbf24; }
      .sec-new .v13r-section-title { color: #c4b5fd; }
      .sec-new .v13r-section-count { background: rgba(124,92,255,0.16); color: #c4b5fd; }

      .v13r-cards { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
      .v13r-card {
        display: flex; flex-direction: column; gap: 12px;
        padding: 16px 18px; border-radius: 14px;
        background: var(--card-2, #1f1c3d);
        border: 1px solid rgba(255,255,255,0.06);
        border-left: 3px solid rgba(255,255,255,0.12);
        transition: transform 160ms ease-out, box-shadow 160ms ease-out, border-color 160ms ease-out;
      }
      .v13r-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.35); }
      .v13r-card.pri-urgent { border-left-color: #ef4444; }
      .v13r-card.pri-attention { border-left-color: #f59e0b; }
      .v13r-card.pri-new { border-left-color: #7c5cff; }
      .v13r-card.pri-building { border-left-color: #facc15; }
      .v13r-card.pri-stable { border-left-color: #22c55e; }

      .v13r-card-top { display: flex; align-items: flex-start; gap: 12px; }
      .v13r-emoji { font-size: 26px; line-height: 1; flex: 0 0 auto; }
      .v13r-card-h { flex: 1 1 auto; min-width: 0; }
      .v13r-card-name { font-size: 15px; font-weight: 700; color: #fff; white-space: normal; overflow-wrap: break-word; word-break: normal; line-height: 1.3; }
      .v13r-card-stage { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
      .v13r-stage-sub { font-size: 11.5px; color: rgba(255,255,255,0.45); }
      .v13r-flag { font-size: 15px; flex: 0 0 auto; }

      .v13r-stage-badge { display: inline-block; padding: 2px 9px; border-radius: 6px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap; }
      .v13r-stage-badge.stage-day0 { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }
      .v13r-stage-badge.stage-day1 { background: rgba(239,68,68,0.18); color: #f87171; }
      .v13r-stage-badge.stage-day3 { background: rgba(245,158,11,0.18); color: #fbbf24; }
      .v13r-stage-badge.stage-day7 { background: rgba(250,204,21,0.18); color: #facc15; }
      .v13r-stage-badge.stage-day21 { background: rgba(34,197,94,0.18); color: #4ade80; }
      .v13r-stage-badge.stage-day60 { background: rgba(167,139,250,0.18); color: #a78bfa; }

      .v13r-card-mem { display: flex; flex-direction: column; gap: 6px; }
      .v13r-mem-top { display: flex; align-items: center; justify-content: space-between; }
      .v13r-mem-tag { font-size: 11.5px; font-weight: 600; padding: 2px 9px; border-radius: 6px; }
      .v13r-mem-tag.state-fragile { background: rgba(239,68,68,0.15); color: #f87171; }
      .v13r-mem-tag.state-weak { background: rgba(245,158,11,0.15); color: #fbbf24; }
      .v13r-mem-tag.state-building { background: rgba(250,204,21,0.15); color: #facc15; }
      .v13r-mem-tag.state-stable { background: rgba(34,197,94,0.15); color: #4ade80; }
      .v13r-mem-tag.state-automatic { background: rgba(167,139,250,0.15); color: #a78bfa; }
      .v13r-mem-pct { font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,0.8); }
      .v13r-mem-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.07); overflow: hidden; }
      .v13r-mem-fill { height: 100%; border-radius: 3px; transition: width 500ms ease-out; background: linear-gradient(90deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95)); }
      .v13r-mem-fill.state-fragile { background: linear-gradient(90deg, #b91c1c, #ef4444); }
      .v13r-mem-fill.state-weak { background: linear-gradient(90deg, #b45309, #f59e0b); }
      .v13r-mem-fill.state-stable { background: linear-gradient(90deg, #15803d, #22c55e); }
      .v13r-mem-fill.state-automatic { background: linear-gradient(90deg, #7c3aed, #a78bfa); }

      .v13r-card-meta { display: flex; justify-content: space-between; gap: 10px; font-size: 11.5px; color: rgba(255,255,255,0.55); flex-wrap: wrap; }
      .v13r-card-meta .v13r-od { color: #ef4444; }
      .v13r-card-meta .v13r-tdy { color: #c4b5fd; }
      .v13r-new-label { color: rgba(196,181,253,0.9); font-style: italic; }

      .v13r-cta {
        margin-top: auto; width: 100%;
        padding: 10px 14px; border-radius: 10px; border: none; cursor: pointer;
        font-size: 13px; font-weight: 700; color: #fff;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: linear-gradient(135deg, #7c5cff, #b48cff);
        box-shadow: 0 4px 14px rgba(124,92,255,0.28);
        transition: transform 150ms ease-out, box-shadow 150ms ease-out;
      }
      .v13r-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(124,92,255,0.4); }
      .v13r-cta.cta-new { background: linear-gradient(135deg, #2563eb, #60a5fa); box-shadow: 0 4px 14px rgba(37,99,235,0.28); }
      .v13r-cta-arrow { transition: transform 150ms ease-out; }
      .v13r-cta:hover .v13r-cta-arrow { transform: translateX(3px); }

      .v13r-empty {
        text-align: center; padding: 56px 24px; max-width: 460px; margin: 12px auto;
        background: rgba(34,197,94,0.04); border: 1.5px dashed rgba(34,197,94,0.25); border-radius: 18px;
      }
      .v13r-empty-icon { font-size: 48px; margin-bottom: 14px; }
      .v13r-empty-title { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px; }
      .v13r-empty-sub { font-size: 13.5px; color: rgba(255,255,255,0.6); line-height: 1.55; margin-bottom: 12px; }
      .v13r-empty-next { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 18px; }
      .v13r-empty .v13r-cta { width: auto; display: inline-flex; padding: 11px 22px; }

      @media (max-width: 900px) {
        .v13r-cards { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        .v13r-summary-count { font-size: 38px; }
      }
      @media (max-width: 680px) {
        .v13r-wrap { padding: 0 2px; }
        .v13r-summary { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px; }
        .v13r-summary-right { align-items: flex-start; }
        .v13r-summary-pills { justify-content: flex-start; }
        .v13r-cards { grid-template-columns: 1fr; }
        .v13r-section-hint { display: none; }
        .v13r-summary-count { font-size: 34px; }
      }
    `;
    document.head.appendChild(s);
  }

  function hookNavigate() {
    if (typeof window.navigate !== 'function') { setTimeout(hookNavigate, 200); return; }
    if (window.navigate.__v13_2_hooked) return;
    const orig = window.navigate;
    window.navigate = function (viewId) {
      orig(viewId);
      if (viewId === 'review') {
        setTimeout(NS.renderReviewPage, 120);
        setTimeout(NS.renderReviewPage, 600);
      }
    };
    window.navigate.__v13_2_hooked = true;
    if (document.querySelector('#view-review.active')) setTimeout(NS.renderReviewPage, 400);
  }

  injectCSS();
  hookNavigate();

  NS._info = function () {
    const state = NS.getState();
    return { version: NS.version, topicCount: (state.topics || []).length, activeFilter: NS.activeFilter };
  };

  console.log('[v13.3] Review Engine = Mission Control Center · v' + NS.version);
})();
