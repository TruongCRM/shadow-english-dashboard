// ============================================================
// SHADOW ENGLISH v16.0 — UI Cleanup + Topic Management
// Date: 2026-05-29
// Additive module (remove the <script> tag to fully revert):
//   T1 Clean breadcrumb (fixed labels per view; never reads nav-item text)
//   T2 Edit Topic modal extended (+ Stage, + Estimated Duration); button always visible; live refresh
//   T3 Dashboard cleanup:
//       - Survival Patterns : hide when empty (show only when useful data exists)
//       - Memory Pulse      : collapse 32 dots -> compact stat card (Active/Fragile/Weak/Building/Stable/Automatic)
//       - Rescue            : hide when there are no overdue / review-critical topics
//       - NEXT BEST ACTION / TODAY'S PRIORITY widget : moved OUT of the sidebar nav-item into
//                             the top of the main dashboard content. Sidebar = navigation only.
// Does NOT modify Learning Loop (Phase 1), Review Engine, or Memory Engine logic.
// All effects are presentational / data-edits through public APIs only.
// ============================================================

(function setupV16UI() {
  if (window.SHADOW_V16) return;
  const NS = window.SHADOW_V16 = {};
  NS.version = '16.0.0';

  const V12 = window.SHADOW_V12 || null;
  const V15 = window.SHADOW_V15 || null;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const toastMsg = (m) => { try { (window.toast || function(){})(m); } catch(e){} };
  function getState() { return (window.shadowEN && window.shadowEN.state) || null; }
  function getTopic(id) { const s = getState(); return s && Array.isArray(s.topics) ? s.topics.find(t => t.id === id) : null; }
  function saveState() {
    try { if (typeof window.saveState === 'function') return window.saveState(); } catch(e){}
    try { const s = getState(); if (s) localStorage.setItem('shadow-en-state-v3', JSON.stringify(s)); } catch(e){}
  }
  function refreshDashboard() { try { if (window.shadowEN && typeof window.shadowEN.render === 'function') window.shadowEN.render(); } catch(e){} }

  // ============================================================
  // CSS
  // ============================================================
  (function injectCSS() {
    const id = 'v16-ui-styles-v1';
    if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id;
    s.textContent = `
      /* T2: Edit Topic button always visible (was edit-mode only) */
      .v15-edit-topic-btn { display:inline-flex !important; }
      .v16-est-badge { font-size:10.5px; padding:3px 9px; border-radius:20px; background:rgba(124,92,255,0.12); border:1px solid rgba(124,92,255,0.28); color:rgba(190,160,255,0.95); }
      /* breadcrumb: single clean line */
      .breadcrumb .current { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60vw; }
      /* T3: hidden low-value sections */
      .v16-hidden-section { display:none !important; }
      /* T3: compact memory pulse */
      .v16-pulse-compact { display:flex; flex-wrap:wrap; gap:9px; }
      .v16-pc-stat { display:flex; align-items:center; gap:7px; padding:8px 13px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); font-size:12px; color:rgba(255,255,255,0.78); }
      .v16-pc-stat b { font-size:15px; color:#fff; }
      .v16-pc-dot { width:9px; height:9px; border-radius:50%; display:inline-block; }
      /* T3: widget relocated into content sits full-width at top */
      #view-home > #loopv14-root { display:block; margin-bottom:6px; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // T1 — CLEAN BREADCRUMB (fixed labels; never reads nav-item text)
  // ============================================================
  const VIEW_LABELS = {
    home: 'Dashboard', session: 'Today Session', review: 'Review Engine',
    topics: 'Topics', phrases: 'Phrases Bank', missions: 'Missions',
    level1: 'Level 1', level2: 'Level 2', level3: 'Level 3',
    calendar: 'Calendar', progress: 'Progress', memory: 'Memory Log',
    stats: 'Statistics', resources: 'Resources', content: 'Content',
    editor: 'Editor', settings: 'Settings'
  };

  function currentViewId() {
    const active = document.querySelector('.view.active');
    if (active && active.id) return active.id.replace(/^view-/, '');
    return 'home';
  }

  NS.setBreadcrumb = function(viewId) {
    const bc = document.querySelector('.breadcrumb .current');
    if (!bc) return;
    let label;
    if (viewId === 'topic-detail') {
      const s = getState();
      const t = s ? getTopic(s.currentTopicId) : null;
      label = 'Topic › ' + (t ? t.name : '');
    } else {
      label = VIEW_LABELS[viewId] || VIEW_LABELS[currentViewId()] || 'Dashboard';
    }
    if (bc.textContent !== label) bc.textContent = label;
  };

  (function hookNavigate() {
    if (typeof window.navigate !== 'function') { setTimeout(hookNavigate, 150); return; }
    if (window.navigate.__v16wrapped) return;
    const orig = window.navigate;
    window.navigate = function(viewId) {
      const r = orig.apply(this, arguments);
      try { NS.setBreadcrumb(viewId); } catch(e) {}
      return r;
    };
    window.navigate.__v16wrapped = true;
  })();
  setTimeout(() => NS.setBreadcrumb(currentViewId()), 300);

  // ============================================================
  // T3 — DASHBOARD CLEANUP
  // ============================================================
  const MEM_COLORS = { Fragile:'#ef4444', Weak:'#ff8a3d', Building:'#facc15', Stable:'#22c55e', Automatic:'#a78bfa' };

  function buildPulseCompact() {
    const s = getState(); const ts = (s && s.topics) ? s.topics : [];
    const c = { Fragile:0, Weak:0, Building:0, Stable:0, Automatic:0 };
    ts.forEach(t => { if (c[t.memoryStatus] != null) c[t.memoryStatus]++; });
    const stat = (label, n, color) =>
      '<div class="v16-pc-stat">' + (color ? '<span class="v16-pc-dot" style="background:' + color + '"></span>' : '') +
      '<b>' + n + '</b> ' + esc(label) + '</div>';
    return '<div class="v16-pulse-compact">' +
      stat('Active Topics', ts.length, null) +
      stat('Fragile', c.Fragile, MEM_COLORS.Fragile) +
      stat('Weak', c.Weak, MEM_COLORS.Weak) +
      stat('Building', c.Building, MEM_COLORS.Building) +
      stat('Stable', c.Stable, MEM_COLORS.Stable) +
      stat('Automatic', c.Automatic, MEM_COLORS.Automatic) +
    '</div>';
  }

  function processDashboard() {
    const home = document.querySelector('#view-home');
    if (!home) return;

    // (a) relocate NEXT BEST ACTION / TODAY'S PRIORITY widget into content area
    const root = document.getElementById('loopv14-root');
    if (root && (root.closest('.nav-item') || !home.contains(root))) {
      home.insertBefore(root, home.firstChild);
    }

    // (b) per-section cleanup
    home.querySelectorAll('.today-section').forEach(sec => {
      const titleEl = sec.querySelector('.today-section-title');
      const txt = titleEl ? titleEl.textContent.trim().toLowerCase() : '';

      // Survival Patterns — hide when empty
      if (/survival patterns/.test(txt)) {
        const empty = !!sec.querySelector('.today-empty') || !sec.querySelector('.today-survival-row');
        sec.classList.toggle('v16-hidden-section', empty);
        return;
      }
      // Rescue — hide when no overdue / review-critical rows
      if (/rescue|ưu tiên|cứu/.test(txt)) {
        const empty = !sec.querySelector('.today-rescue-row');
        sec.classList.toggle('v16-hidden-section', empty);
        return;
      }
      // Memory Pulse — collapse dots into compact stat card
      if (/memory pulse/.test(txt)) {
        const pulse = sec.querySelector('.today-pulse');
        if (pulse && !pulse.querySelector('.v16-pulse-compact')) {
          pulse.innerHTML = buildPulseCompact();
        }
        return;
      }
    });
  }
  NS.processDashboard = processDashboard;

  let _t = null;
  function schedule() { clearTimeout(_t); _t = setTimeout(processDashboard, 60); }
  (function startObserver() {
    const target = document.querySelector('#view-home') || document.body;
    if (!target) { setTimeout(startObserver, 200); return; }
    const obs = new MutationObserver(schedule);
    obs.observe(target === document.body ? document.body : target, { childList: true, subtree: true });
    NS._obs = obs;
    schedule();
  })();

  // ============================================================
  // T2 — EDIT TOPIC (extended): + Stage, + Estimated Duration
  // ============================================================
  const EMOJIS = ['📘','🍔','🗺️','🛍️','👋','🔢','✈️','🚌','🏨','📞','🏥','🤝','🚨','☕','💼','📝','💡','🎉','😊','📺','👔','📊','📚','🤔','❤️','😄','🧠','🎯','🌍','🎬'];
  const STAGES = ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'];
  const MEMORY_FROM_STAGE = { 'Day 0':'Fragile', 'Day 1':'Weak', 'Day 3':'Building', 'Day 7':'Stable', 'Day 21':'Stable', 'Day 60':'Automatic' };

  function liveRefresh(topicId) {
    saveState();
    try { if (V12 && V12._rerender) V12._rerender(); } catch(e){}
    refreshDashboard();
    try {
      const vid = currentViewId();
      if (typeof window.NAV_RENDERS === 'object' && window.NAV_RENDERS[vid]) window.NAV_RENDERS[vid]();
    } catch(e){}
    try { NS.setBreadcrumb(currentViewId()); } catch(e){}
    schedule();
  }

  NS.editHeader = function(topicId) {
    if (!V15 || typeof V15.openForm !== 'function') { toastMsg('Editor chưa sẵn sàng'); return; }
    const t = getTopic(topicId);
    if (!t) { toastMsg('Không tìm thấy topic'); return; }
    const fields = [
      { key:'name', label:'Topic Name', type:'text' },
      { key:'emoji', label:'Icon (emoji)', type:'text', placeholder:'📘' },
      { key:'category', label:'Category', type:'text', placeholder:'Daily life, Business…' },
      { key:'level', label:'Level (1-3)', type:'select', options:[1,2,3] },
      { key:'description', label:'Description', type:'textarea' },
      { key:'stage', label:'Stage', type:'select', options:STAGES },
      { key:'estMin', label:'Estimated Duration (phút)', type:'number', placeholder:'18' },
      { key:'subtitle', label:'Subtitle (tùy chọn)', type:'text' },
      { key:'status', label:'Status', type:'select', options:['draft','published'] }
    ];
    const vals = {
      name:t.name, emoji:t.emoji, category:t.category||'', level:t.level||1,
      description:t.description||'', stage:t.reviewStage||'Day 0',
      estMin:(t.estMin!=null?t.estMin:''), subtitle:t.subtitle||'', status:t.status||'draft'
    };
    const bg = V15.openForm('Edit Topic', 'Sửa thông tin bài học — cập nhật ngay, không cần code, không cần Notion', fields, vals, (out) => {
      if (!out.name) { toastMsg('Topic name không được trống'); return false; }
      const tt = getTopic(topicId); if (!tt) return;
      tt.name = out.name;
      tt.emoji = out.emoji || tt.emoji;
      tt.category = out.category;
      tt.level = parseInt(out.level, 10) || tt.level;
      tt.description = out.description;
      tt.subtitle = out.subtitle;
      tt.status = out.status;
      tt.estMin = out.estMin === '' ? null : (parseInt(out.estMin, 10) || null);
      // Stage: set reviewStage + keep memoryStatus consistent with the engine's own mapping
      // (we only edit this topic's stored fields — we do NOT change Memory Engine logic)
      if (out.stage && STAGES.indexOf(out.stage) >= 0) {
        tt.reviewStage = out.stage;
        if (MEMORY_FROM_STAGE[out.stage]) tt.memoryStatus = MEMORY_FROM_STAGE[out.stage];
      }
      toastMsg('💾 Đã lưu Topic');
      liveRefresh(topicId);
    });
    const emojiField = bg && bg.querySelector('[data-k="emoji"]');
    if (emojiField) {
      const pick = document.createElement('div'); pick.className = 'v15-emoji-pick'; pick.style.marginTop = '8px';
      pick.innerHTML = EMOJIS.map(e => `<button type="button">${e}</button>`).join('');
      pick.querySelectorAll('button').forEach(b => b.onclick = () => { emojiField.value = b.textContent; });
      emojiField.parentNode.appendChild(pick);
    }
  };
  if (V15) V15.editHeader = NS.editHeader;

  function addEstBadge(view, topicId) {
    try {
      const t = getTopic(topicId); if (!t || t.estMin == null) return;
      const badges = view.querySelector('.topic-hero .v15-badges'); if (!badges) return;
      if (badges.querySelector('.v16-est-badge')) return;
      const b = document.createElement('span'); b.className = 'v15-badge v16-est-badge';
      b.textContent = '⏱ ~' + t.estMin + ' phút'; badges.appendChild(b);
    } catch(e){}
  }
  if (V12 && typeof V12.renderTopicDetail === 'function') {
    const _inner = V12.renderTopicDetail;
    if (!_inner.__v16wrapped) {
      const wrapped = function(view, topicId) { _inner.call(V12, view, topicId); addEstBadge(view, topicId); };
      wrapped.__v16wrapped = true;
      V12.renderTopicDetail = wrapped;
    }
  }

  // ============================================================
  // SELF-TEST
  // ============================================================
  NS.selfTest = function() {
    const r = []; let all = true;
    const ok = (n, c) => { r.push((c?'PASS':'FAIL') + ' — ' + n); all = all && !!c; return c; };
    ok('navigate wrapped for breadcrumb', !!(window.navigate && window.navigate.__v16wrapped));
    ok('breadcrumb fn', typeof NS.setBreadcrumb === 'function');
    ok('dashboard processor + observer', typeof NS.processDashboard === 'function' && !!NS._obs);
    ok('editHeader extended (stage+est)', typeof NS.editHeader === 'function' && (!V15 || V15.editHeader === NS.editHeader));
    ok('state readable', !!(getState() && Array.isArray(getState().topics)));
    ok('pulse compact builder', /v16-pulse-compact/.test(buildPulseCompact()));
    console.log('[v16] SELF-TEST ' + (all ? 'PASSED' : 'FAILED'));
    r.forEach(x => console.log('  ' + x));
    return { ok: all, results: r };
  };

  console.log('[v16] UI Cleanup + Topic Management v' + NS.version + ' loaded');
})();
