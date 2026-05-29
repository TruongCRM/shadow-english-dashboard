// ============================================================
// SHADOW ENGLISH v13.0 — Living Memory Recovery Cards
// HERO STATS / TODAY GOAL / MEMORY STATUS redesign per V11_2 blueprint
// Date: 2026-05-29 (Day 3, post v12.3 ship)
// ============================================================

(function setupV13() {
  const NS = window.SHADOW_V13 = window.SHADOW_V13 || {};
  NS.version = '13.4.0';

  // ============= UTIL =============
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
  NS.getState = function() { return window.shadowEN?.state || window.state || {}; };

  // ============= IDENTITY TIERS (Blueprint §1.6) =============
  NS.IDENTITY_TIERS = [
    { min: 0,  max: 2,   name: 'Shadow Apprentice',   icon: '🌙', subline: d => `Day <strong>${d}</strong> rebuilding<br>your English reflex` },
    { min: 3,  max: 6,   name: 'Shadow Practitioner', icon: '✦',  subline: d => `Day <strong>${d}</strong> · Patterns are forming` },
    { min: 7,  max: 13,  name: 'Shadow Survivor',     icon: '⚡', subline: d => `Day <strong>${d}</strong> · One week of recovery` },
    { min: 14, max: 20,  name: 'Memory Builder',      icon: '🌟', subline: d => `Day <strong>${d}</strong> · Crossing into stability` },
    { min: 21, max: 29,  name: 'Reflex Awakener',     icon: '🔥', subline: d => `Day <strong>${d}</strong> · Three weeks alive` },
    { min: 30, max: 999, name: 'Fluency Path Walker', icon: '✺',  subline: d => `Day <strong>${d}</strong> · Memory has roots` }
  ];

  NS.QUOTE_POOL = [
    'You are not starting. You are remembering.',
    'Tiếng Anh không quên anh. Anh chỉ cần gọi nó lại.',
    'Small daily repetitions. Real speaking confidence.',
    'Today you choose to remember.',
    'Each session is a small return.'
  ];

  NS.identityFor = function(streak) {
    const d = streak || 0;
    const tier = NS.IDENTITY_TIERS.find(t => d >= t.min && d <= t.max) || NS.IDENTITY_TIERS[0];
    const todayKey = new Date().toDateString();
    const quote = NS.QUOTE_POOL[hash(todayKey + 'q') % NS.QUOTE_POOL.length];
    return { tier, days: d, subline: tier.subline(d), quote };
  };

  // ============= JOURNEY POSITION (Blueprint §1.7) =============
  NS.JOURNEY_LABELS = ['beginner', 'surviving', 'responding', 'flowing'];
  NS.JOURNEY_DISPLAY = { beginner: 'Beginner', surviving: 'Surviving', responding: 'Responding', flowing: 'Flowing' };
  NS.JOURNEY_STATUS = {
    beginner: 'Just beginning. Every word counts now.',
    surviving: 'Memory is forming. Keep the daily ritual alive.',
    responding: 'Patterns awakening. Speaking gets easier.',
    flowing: 'Your English speaks itself. Trust it.'
  };

  NS.computeDistribution = function(topics) {
    const c = { fragile: 0, weak: 0, building: 0, stable: 0, automatic: 0, total: 0 };
    (topics || []).forEach(t => {
      const s = (t.memoryStatus || 'Fragile').toLowerCase();
      if (c[s] !== undefined) c[s]++;
      c.total++;
    });
    return c;
  };

  NS.journeyPosition = function(state) {
    const d = NS.computeDistribution(state.topics);
    if (!d.total) return 'beginner';
    const fragilePct = d.fragile / d.total;
    const automaticPct = d.automatic / d.total;
    const stablePlus = (d.stable + d.automatic) / d.total;
    if (fragilePct >= 0.85) return 'beginner';
    if (automaticPct >= 0.5) return 'flowing';
    if (automaticPct >= 0.2 || stablePlus >= 0.3) return 'responding';
    if (fragilePct >= 0.5) return 'surviving';
    return 'surviving';
  };

  // ============= LIVING NOW MOMENTUM (Blueprint §1.8) =============
  NS.computeMomentum = function(state) {
    const now = Date.now();
    const topics = state.topics || [];
    const due = topics.filter(t => t.nextReview && new Date(t.nextReview).getTime() <= now).length;
    const fragile = topics.filter(t => t.memoryStatus === 'Fragile').length;
    let brain = 'Clear';
    if (due > 8) brain = 'Heavy';
    else if (due > 3) brain = 'Active';
    else if (due > 0) brain = 'Light';
    const sevenAgo = now - 7 * 24 * 3600 * 1000;
    const recentSessions = (state.sessionsLog || []).filter(s => s.at && new Date(s.at).getTime() >= sevenAgo).length;
    let speaking = 'Awakening';
    if (recentSessions > 10) speaking = 'Strong';
    else if (recentSessions > 3) speaking = 'Active';
    else if (recentSessions > 0) speaking = 'Building';
    return { due, fragile, brain, speaking };
  };

  // ============= TODAY MISSION (Blueprint §2.6) =============
  NS.MISSION_POOL = [
    'Keep your speaking reflex alive.',
    'Today: small step. Tomorrow: shadowed automatic.',
    "Don't break the chain. The chain remembers.",
    'Một câu nói thật. Một mảnh trí nhớ được cứu.',
    'Repetition today = instinct tomorrow.',
    'Your past self is waiting for you to remember.',
    'Tiếng Anh ngủ trong anh. Hôm nay đánh thức một đoạn.',
    'Small mouth, big consistency.',
    'The voice you want is built one shadow at a time.',
    'Hôm nay: một câu. Tuần này: một phản xạ.'
  ];

  NS.todayMission = function() {
    const day = new Date().toDateString();
    const key = 'shadow-en-mission-' + day;
    const cached = localStorage.getItem(key);
    if (cached) return cached;
    const chosen = NS.MISSION_POOL[hash(day) % NS.MISSION_POOL.length];
    try { localStorage.setItem(key, chosen); } catch(e) {}
    return chosen;
  };

  // ============= MEMORY HEALTH STATE (Blueprint §3.6) =============
  NS.memoryHealthState = function(d) {
    const total = d.total;
    if (!total) return { label: 'AWAKENING', tone: 'Just starting your journey', cls: 'awakening' };
    const fragilePct = d.fragile / total;
    const stablePct = (d.stable + d.automatic) / total;
    const automaticPct = d.automatic / total;
    if (fragilePct >= 0.85) return { label: 'FRAGILE', tone: 'Still unstable', cls: 'fragile' };
    if (fragilePct >= 0.60) return { label: 'RECOVERING', tone: 'Memory is forming', cls: 'recovering' };
    if (automaticPct >= 0.40) return { label: 'AUTOMATIC', tone: 'Your English is alive', cls: 'automatic' };
    if (stablePct >= 0.40 && automaticPct >= 0.15) return { label: 'STABLE', tone: 'Speaking reflex emerging', cls: 'stable' };
    return { label: 'BUILDING', tone: 'Patterns are stabilizing', cls: 'building' };
  };

  NS.INSIGHTS = {
    AWAKENING: ['Every journey starts with one word.', 'Today is Day 1 of remembering.', 'Your brain has everything it needs. Just begin.'],
    FRAGILE: ['Most patterns are still fragile.', 'Your brain still needs repetition.', 'Memory is waking up, but not stable yet.', "Don't measure progress in days. Measure in reps."],
    RECOVERING: ['Memory is forming. Keep going.', 'The first walls are coming up.', "Soon you'll surprise yourself."],
    BUILDING: ['Patterns are taking root.', 'Consistency beats intensity.', 'Repetition becomes recognition.'],
    STABLE: ['Speaking reflex is emerging.', "Trust the process. It's working.", 'Less effort, more flow.'],
    AUTOMATIC: ['Your English is alive.', 'From practice to instinct.', 'What was hard is now natural.']
  };

  NS._pickInsights = function(pool, dayKey, n) {
    const h = hash(dayKey);
    const sorted = pool.slice().sort((a, b) => (hash(a + h) - hash(b + h)));
    return sorted.slice(0, Math.min(n, pool.length));
  };

  // ============= HEATMAP (Blueprint §3.8) =============
  NS.heatmap28Day = function(sessionsLog) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dKey = d.toDateString();
      const count = (sessionsLog || []).filter(s => s.at && new Date(s.at).toDateString() === dKey).length;
      days.push({ date: d, count });
    }
    return days;
  };

  NS.heatmapIntensity = function(c) {
    if (c === 0) return 'hm-0';
    if (c === 1) return 'hm-1';
    if (c <= 3) return 'hm-2';
    if (c <= 6) return 'hm-3';
    return 'hm-4';
  };

  NS.heatmapTooltip = function(date, c) {
    const ds = date.getDate() + '/' + (date.getMonth() + 1);
    if (c === 0) return ds + ' — No activity';
    if (c === 1) return ds + ' — 1 review · Light practice';
    if (c <= 3) return ds + ' — ' + c + ' reviews · Memory reinforced';
    if (c <= 6) return ds + ' — ' + c + ' reviews · Deep maturation';
    return ds + ' — ' + c + ' reviews · Total focus day';
  };

  // ============= CARD FINDER =============
  NS._findCard = function(titleRegex) {
    const home = document.getElementById('view-home') || document.getElementById('view-dashboard');
    const root = home || document;
    const titles = root.querySelectorAll('.card-title');
    for (const t of titles) {
      if (titleRegex.test((t.textContent || '').trim())) return t.closest('.card') || t.parentElement;
    }
    // Fallback: data-section-id
    return root.querySelector('[data-section-id="hero-stats"]') ||
           root.querySelector('[data-section-id="today-goal"]') ||
           root.querySelector('[data-section-id="memory-status"]') ||
           null;
  };

  NS._findCardBySection = function(id) {
    const home = document.getElementById('view-home') || document.getElementById('view-dashboard');
    const root = home || document;
    return root.querySelector('[data-section-id="' + id + '"]');
  };

  // ============= RENDER HERO STATS =============
  NS.renderHeroStats = function() {
    const card = NS._findCardBySection('hero-stats') || NS._findCard(/HERO STATS/i);
    if (!card) return;
    if (card.dataset.v13Locked) return;

    const state = NS.getState();
    const identity = NS.identityFor(state.user?.streak || 0);
    const pos = NS.journeyPosition(state);
    const momentum = NS.computeMomentum(state);
    const posIdx = NS.JOURNEY_LABELS.indexOf(pos);
    const progressX = 20 + (posIdx / 3) * 460;

    card.classList.add('v13-hero-living');
    card.innerHTML = `
      <div class="v13-hero-grid">
        <div class="v13-hero-identity">
          <div class="v13-hero-identity-tier">
            <span class="v13-tier-icon">${identity.tier.icon}</span>
            <span class="v13-tier-name">${escapeHTML(identity.tier.name)}</span>
          </div>
          <div class="v13-hero-identity-day">${identity.subline}</div>
          <div class="v13-hero-identity-divider"></div>
          <div class="v13-hero-identity-quote">"${escapeHTML(identity.quote)}"</div>
        </div>

        <div class="v13-hero-journey">
          <svg class="v13-journey-line" viewBox="0 0 500 60" preserveAspectRatio="none">
            <line x1="20" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
            <line x1="20" y1="30" x2="${progressX}" y2="30" stroke="rgba(180,140,255,0.9)" stroke-width="3"/>
          </svg>
          <div class="v13-journey-milestones">
            ${NS.JOURNEY_LABELS.map((label, i) => {
              const cls = i < posIdx ? 'done' : (i === posIdx ? 'current' : '');
              return `
                <div class="v13-milestone ${cls}">
                  <div class="v13-milestone-dot">${i === posIdx ? '<div class="v13-milestone-glow"></div>' : ''}</div>
                  <div class="v13-milestone-label">${NS.JOURNEY_DISPLAY[label]}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="v13-journey-status">${escapeHTML(NS.JOURNEY_STATUS[pos])}</div>
        </div>

        <div class="v13-hero-momentum">
          <div class="v13-momentum-row">
            <span class="v13-momentum-icon">✦</span>
            <span class="v13-momentum-text"><strong>${momentum.due}</strong> review${momentum.due === 1 ? '' : 's'} due today</span>
          </div>
          <div class="v13-momentum-row">
            <span class="v13-momentum-icon">✦</span>
            <span class="v13-momentum-text"><strong>${momentum.fragile}</strong> fragile memories</span>
          </div>
          <div class="v13-momentum-row">
            <span class="v13-momentum-icon">✦</span>
            <span class="v13-momentum-text">Brain: <strong class="v13-state v13-state-${momentum.brain.toLowerCase()}">${momentum.brain}</strong></span>
          </div>
          <div class="v13-momentum-row">
            <span class="v13-momentum-icon">✦</span>
            <span class="v13-momentum-text">Speaking: <strong class="v13-state v13-state-${momentum.speaking.toLowerCase()}">${momentum.speaking}</strong></span>
          </div>
        </div>
      </div>
    `;
  };

  // ============= RENDER TODAY GOAL =============
  NS.renderTodayGoal = function() {
    const card = NS._findCardBySection('today-goal') || NS._findCard(/TODAY GOAL/i);
    if (!card) return;
    if (card.dataset.v13Locked) return;

    const state = NS.getState();
    const missions = state.missions?.items || [];
    const doneCount = missions.filter(m => m.done).length;
    const totalCount = missions.length || 3;
    const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
    const streak = state.user?.streak || 0;

    let subtitle = 'Start your day';
    if (doneCount === totalCount && totalCount > 0) subtitle = 'All done — momentum locked';
    else if (doneCount > 0) subtitle = 'Daily momentum active';

    card.classList.add('v13-today-compass');
    card.innerHTML = `
      <div class="card-title"><span class="icon">⏰</span> TODAY GOAL</div>
      <div class="v13-compass-progress">
        <div class="v13-compass-count">
          <span class="v13-count-done">${doneCount}</span><span class="v13-count-divider">/</span><span class="v13-count-total">${totalCount}</span>
        </div>
        <div class="v13-compass-subtitle">${escapeHTML(subtitle)}</div>
        <div class="v13-compass-bar"><div class="v13-compass-bar-fill" style="width: ${pct}%"></div></div>
        ${streak > 0 ? `<div class="v13-compass-streak"><span class="v13-streak-emoji">🔥</span><span class="v13-streak-text">${streak}-day streak</span></div>` : ''}
      </div>
      <div class="v13-compass-divider"></div>
      <div class="v13-compass-mission">
        <div class="v13-mission-label">Today's mission</div>
        <div class="v13-mission-statement">${escapeHTML(NS.todayMission())}</div>
      </div>
    `;
  };

  // ============= RENDER MEMORY STATUS =============
  NS.renderMemoryStatus = function() {
    const card = NS._findCardBySection('memory-status') || NS._findCard(/MEMORY STATUS|MEMORY/i);
    if (!card) return;
    if (card.dataset.v13Locked) return;

    const state = NS.getState();
    const dist = NS.computeDistribution(state.topics);
    const health = NS.memoryHealthState(dist);
    const insightsPool = NS.INSIGHTS[health.label] || NS.INSIGHTS.FRAGILE;
    const todayKey = new Date().toDateString();
    const oneInsight = NS._pickInsights(insightsPool, todayKey, 1)[0] || '';
    const needReview = Math.max(0, (dist.total || 0) - dist.stable - dist.automatic);

    // SUMMARY CARD (not analytics dashboard) — heatmap moved to Memory Activity section.
    card.classList.add('v13-memory-health');
    card.innerHTML = `
      <div class="card-title"><span class="icon">🧠</span> MEMORY STATUS</div>

      <div class="v13-health-state">
        <div class="v13-health-state-label">Memory Health</div>
        <div class="v13-health-state-badge state-${health.cls}">${health.label}</div>
        <div class="v13-health-state-subtitle">${escapeHTML(health.tone)}</div>
      </div>

      <div class="v13-mh-stats">
        <div class="v13-mh-stat${dist.fragile === 0 ? ' dim' : ''}">
          <span class="v13-mh-num">${dist.fragile}</span>
          <span class="v13-mh-lab"><i class="v13-mh-dot dot-fragile"></i>Fragile</span>
        </div>
        <div class="v13-mh-stat${dist.weak === 0 ? ' dim' : ''}">
          <span class="v13-mh-num">${dist.weak}</span>
          <span class="v13-mh-lab"><i class="v13-mh-dot dot-weak"></i>Weak</span>
        </div>
        <div class="v13-mh-stat${dist.stable === 0 ? ' dim' : ''}">
          <span class="v13-mh-num">${dist.stable}</span>
          <span class="v13-mh-lab"><i class="v13-mh-dot dot-stable"></i>Stable</span>
        </div>
        <div class="v13-mh-stat${dist.automatic === 0 ? ' dim' : ''}">
          <span class="v13-mh-num">${dist.automatic}</span>
          <span class="v13-mh-lab"><i class="v13-mh-dot dot-automatic"></i>Automatic</span>
        </div>
      </div>

      <div class="v13-mh-insight ${needReview > 0 ? 'warn' : 'ok'}">
        ${needReview > 0
          ? '<span class="v13-mh-insight-icon">⚠️</span> ' + needReview + ' topic' + (needReview === 1 ? '' : 's') + ' need review'
          : '<span class="v13-mh-insight-icon">✅</span> ' + escapeHTML(oneInsight || 'All on track today')}
      </div>
    `;
  };

  // ============= RENDER MEMORY ACTIVITY (two-column story card) =============
  NS._distTrend = function (dist) {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem('shadow-en-dist-history') || '[]'); } catch (e) { hist = []; }
    const today = new Date().toDateString();
    const snap = { d: today, f: dist.fragile, w: dist.weak, s: dist.stable, a: dist.automatic };
    hist = hist.filter(h => h.d !== today);
    const past = hist.slice();
    hist.push(snap);
    if (hist.length > 30) hist = hist.slice(-30);
    try { localStorage.setItem('shadow-en-dist-history', JSON.stringify(hist)); } catch (e) {}
    const prior = past.length ? past[0] : null;
    function dir(curr, prev, goodDown) {
      if (prev == null) return { arrow: '·', cls: 'flat', delta: 0 };
      const delta = curr - prev;
      if (delta === 0) return { arrow: '→', cls: 'flat', delta: 0 };
      const down = delta < 0;
      const good = goodDown ? down : !down;
      return { arrow: down ? '↓' : '↑', cls: good ? 'good' : 'bad', delta };
    }
    return {
      fragile: dir(dist.fragile, prior ? prior.f : null, true),
      weak: dir(dist.weak, prior ? prior.w : null, true),
      stable: dir(dist.stable, prior ? prior.s : null, false),
      automatic: dir(dist.automatic, prior ? prior.a : null, false),
      hasHistory: !!prior
    };
  };

  NS._nextAction = function (state, dist) {
    const topics = state.topics || [];
    const now = Date.now();
    const overdue = topics.find(t => t.nextReview && new Date(t.nextReview).getTime() <= now && t.reviewStage !== 'Day 0' && t.lastReview);
    if (overdue) return { text: 'Review "' + (overdue.name || overdue.id) + '" — it is overdue', view: 'review' };
    const fragile = topics.find(t => t.memoryStatus === 'Fragile' && t.lastReview);
    if (fragile) return { text: 'Shadow "' + (fragile.name || fragile.id) + '" to rescue it', view: 'review' };
    const fresh = topics.find(t => t.reviewStage === 'Day 0' || !t.lastReview);
    if (fresh) return { text: 'Start a new topic: "' + (fresh.name || fresh.id) + '"', view: 'review' };
    return { text: 'Keep your streak alive with one quick review', view: 'review' };
  };

  NS.renderMemoryActivity = function () {
    const home = document.getElementById('view-home') || document.getElementById('view-dashboard');
    if (!home) return;
    const state = NS.getState();
    const heatmap = NS.heatmap28Day(state.sessionsLog);
    const totalReviews = heatmap.reduce((s, d) => s + d.count, 0);
    const activeDays = heatmap.filter(d => d.count > 0).length;

    const log = state.sessionsLog || [];
    const now = Date.now(); const DAY = 864e5;
    const cntRange = (a, b) => log.filter(e => { const t = e.at ? new Date(e.at).getTime() : 0; return t >= a && t < b; }).length;
    const thisWeek = cntRange(now - 7 * DAY, now + DAY);
    const lastWeek = cntRange(now - 14 * DAY, now - 7 * DAY);
    const weekDelta = thisWeek - lastWeek;
    const weekArrow = weekDelta > 0 ? { a: '↑', c: 'good' } : weekDelta < 0 ? { a: '↓', c: 'bad' } : { a: '→', c: 'flat' };

    const dist = NS.computeDistribution(state.topics);
    const needAttention = dist.fragile + dist.weak;

    const streak = (state.user && state.user.streak) || 0;
    let best = streak;
    try { best = Math.max(parseInt(localStorage.getItem('shadow-en-best-streak') || '0', 10) || 0, streak); localStorage.setItem('shadow-en-best-streak', String(best)); } catch (e) {}
    const MILESTONES = [3, 7, 14, 21, 30, 60, 100];
    const nextMs = MILESTONES.find(m => m > streak) || (streak + 30);
    const toNext = nextMs - streak;

    const trend = NS._distTrend(dist);
    const action = NS._nextAction(state, dist);

    const trendRow = (label, t, count) => `
      <div class="v13-trend-row">
        <span class="v13-trend-label">${label}</span>
        <span class="v13-trend-count">${count}</span>
        <span class="v13-trend-arrow t-${t.cls}">${t.arrow}</span>
      </div>`;

    let card = home.querySelector('[data-section-id="memory-activity"]');
    if (!card) {
      card = document.createElement('div');
      card.className = 'card v13-memory-activity';
      card.setAttribute('data-section-id', 'memory-activity');
      const anchor = home.querySelector('[data-section-id="today-goal"]')
        || home.querySelector('[data-section-id="memory-status"]')
        || home.querySelector('.v13-memory-health');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor.nextSibling);
      else home.appendChild(card);
    }

    card.innerHTML = `
      <div class="v13-ma-head">
        <div class="card-title"><span class="icon">📅</span> MEMORY ACTIVITY</div>
        <div class="v13-ma-meta">${activeDays} active day${activeDays === 1 ? '' : 's'} · ${totalReviews} review${totalReviews === 1 ? '' : 's'} · last 28 days</div>
      </div>

      <div class="v13-ma-cols">
        <div class="v13-ma-left">
          <div class="v13-ma-sub">Review heatmap</div>
          <div class="v13-heatmap-days v13-ma-days">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => '<span>' + d + '</span>').join('')}</div>
          <div class="v13-heatmap-grid v13-ma-grid">${heatmap.map((d, i) => {
            const isToday = i === heatmap.length - 1;
            const cls = NS.heatmapIntensity(d.count) + (isToday ? ' today' : '');
            return `<div class="v13-hm-cell ${cls}" title="${escapeHTML(NS.heatmapTooltip(d.date, d.count))}"></div>`;
          }).join('')}</div>
          <div class="v13-ma-legend"><span>Less</span><span class="v13-hm-cell hm-0"></span><span class="v13-hm-cell hm-1"></span><span class="v13-hm-cell hm-2"></span><span class="v13-hm-cell hm-3"></span><span class="v13-hm-cell hm-4"></span><span>More</span></div>
        </div>

        <div class="v13-ma-right">
          <div class="v13-ma-block">
            <div class="v13-ma-sub">Memory insights</div>
            <div class="v13-insight-line"><span class="v13-il-ico">🔥</span><span class="v13-il-txt">${thisWeek} review${thisWeek === 1 ? '' : 's'} completed this week</span></div>
            <div class="v13-insight-line"><span class="v13-il-ico">⚠️</span><span class="v13-il-txt">${needAttention} topic${needAttention === 1 ? '' : 's'} need attention</span></div>
            <div class="v13-insight-line"><span class="v13-il-ico">📈</span><span class="v13-il-txt">Trend vs last week <b class="t-${weekArrow.c}">${weekArrow.a} ${weekDelta > 0 ? '+' : ''}${weekDelta}</b></span></div>
            <div class="v13-insight-line action" data-go="${action.view}"><span class="v13-il-ico">🎯</span><span class="v13-il-txt">${escapeHTML(action.text)}</span><span class="v13-il-arrow">→</span></div>
          </div>

          <div class="v13-ma-twocol">
            <div class="v13-ma-block">
              <div class="v13-ma-sub">Memory momentum</div>
              <div class="v13-momentum">
                <div class="v13-mom"><span class="v13-mom-num">${streak}</span><span class="v13-mom-lab">🔥 Current</span></div>
                <div class="v13-mom"><span class="v13-mom-num">${best}</span><span class="v13-mom-lab">🏆 Best</span></div>
                <div class="v13-mom"><span class="v13-mom-num">${toNext}d</span><span class="v13-mom-lab">🎯 To ${nextMs}d</span></div>
              </div>
            </div>
            <div class="v13-ma-block">
              <div class="v13-ma-sub">Memory trend ${trend.hasHistory ? '' : '<span class="v13-trend-note">· tracking…</span>'}</div>
              <div class="v13-trend">
                ${trendRow('Fragile', trend.fragile, dist.fragile)}
                ${trendRow('Weak', trend.weak, dist.weak)}
                ${trendRow('Stable', trend.stable, dist.stable)}
                ${trendRow('Automatic', trend.automatic, dist.automatic)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const act = card.querySelector('.v13-insight-line.action');
    if (act) act.onclick = function () { if (window.navigate) window.navigate(act.dataset.go || 'review'); };
  };


  // ============= MAIN =============
  NS.renderAll = function() {
    try { NS.renderHeroStats(); } catch(e) { console.warn('[v13] hero render', e); }
    try { NS.renderTodayGoal(); } catch(e) { console.warn('[v13] today render', e); }
    try { NS.renderMemoryStatus(); } catch(e) { console.warn('[v13] memory render', e); }
    try { NS.renderMemoryActivity(); } catch(e) { console.warn('[v13] memory activity render', e); }
  };

  // ============= CSS INJECTION (G9 versioned ID) =============
  function injectCSS() {
    const id = 'v13-styles-v1';
    if (document.getElementById(id)) return;
    document.querySelectorAll('style[id^="v13-styles"]').forEach(s => s.remove());
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      /* ========= V13 HERO LIVING ========= */
      .card.v13-hero-living {
        position: relative;
        padding: 32px 36px !important;
        min-height: 220px;
        background:
          radial-gradient(circle at 20% 30%, rgba(124,92,255,0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(180,140,255,0.04) 0%, transparent 50%),
          var(--card, #1a1838) !important;
        background-size: 200% 200%;
        animation: v13-hero-breathe 14s ease-in-out infinite;
        overflow: hidden;
      }
      @keyframes v13-hero-breathe {
        0%, 100% { background-position: 0% 0%; }
        50% { background-position: 100% 100%; }
      }
      .v13-hero-grid {
        display: grid;
        grid-template-columns: 28fr 44fr 28fr;
        gap: 40px;
        align-items: center;
        height: 100%;
      }
      .v13-hero-identity { display: flex; flex-direction: column; gap: 14px; }
      .v13-hero-identity-tier { display: flex; align-items: center; gap: 10px; }
      .v13-tier-icon { font-size: 22px; filter: drop-shadow(0 0 8px rgba(180,140,255,0.4)); }
      .v13-tier-name {
        font-size: 18px; font-weight: 600; letter-spacing: 0.02em;
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(180,140,255,0.8));
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      }
      .v13-hero-identity-day { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.7); }
      .v13-hero-identity-day strong { font-size: 16px; color: rgba(255,255,255,0.95); font-weight: 700; margin: 0 2px; }
      .v13-hero-identity-divider {
        height: 1px; margin: 4px 0;
        background: linear-gradient(90deg, transparent, rgba(124,92,255,0.25), transparent);
      }
      .v13-hero-identity-quote {
        font-size: 13px; font-style: italic; line-height: 1.55;
        color: rgba(255,255,255,0.55); letter-spacing: 0.01em;
      }

      .v13-hero-journey { position: relative; display: flex; flex-direction: column; gap: 16px; padding: 0 8px; }
      .v13-journey-line { position: absolute; top: 16px; left: 0; width: 100%; height: 60px; pointer-events: none; }
      .v13-journey-milestones { display: grid; grid-template-columns: repeat(4, 1fr); position: relative; z-index: 1; }
      .v13-milestone { display: flex; flex-direction: column; align-items: center; gap: 8px; }
      .v13-milestone-dot {
        position: relative; width: 14px; height: 14px; border-radius: 50%;
        background: rgba(255,255,255,0.10); border: 2px solid rgba(255,255,255,0.15);
        transition: all 360ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .v13-milestone.done .v13-milestone-dot {
        background: rgba(124,92,255,0.7); border-color: rgba(180,140,255,0.85);
        box-shadow: 0 0 8px rgba(124,92,255,0.3);
      }
      .v13-milestone.current .v13-milestone-dot {
        background: rgba(180,140,255,1); border-color: rgba(255,255,255,0.9);
        width: 18px; height: 18px; margin-top: -2px;
        box-shadow: 0 0 16px rgba(180,140,255,0.6);
      }
      .v13-milestone-glow {
        position: absolute; top: 50%; left: 50%;
        width: 24px; height: 24px; border-radius: 50%;
        background: rgba(180,140,255,0.3);
        transform: translate(-50%, -50%);
        animation: v13-milestone-pulse 2.2s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes v13-milestone-pulse {
        0%, 100% { width: 24px; height: 24px; opacity: 0.5; }
        50% { width: 40px; height: 40px; opacity: 0; }
      }
      .v13-milestone-label {
        font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em;
        color: rgba(255,255,255,0.5); font-weight: 500;
      }
      .v13-milestone.done .v13-milestone-label, .v13-milestone.current .v13-milestone-label {
        color: rgba(255,255,255,0.85);
      }
      .v13-journey-status {
        text-align: center; font-size: 12.5px; font-style: italic;
        color: rgba(180,140,255,0.7); letter-spacing: 0.01em; margin-top: 4px;
      }

      .v13-hero-momentum { display: flex; flex-direction: column; gap: 10px; }
      .v13-momentum-row {
        display: flex; align-items: center; gap: 8px;
        padding: 6px 10px; border-radius: 8px;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.04);
        transition: all 200ms ease-out;
      }
      .v13-momentum-row:hover { background: rgba(124,92,255,0.06); border-color: rgba(124,92,255,0.15); }
      .v13-momentum-icon { color: rgba(180,140,255,0.6); font-size: 10px; filter: drop-shadow(0 0 4px rgba(180,140,255,0.4)); }
      .v13-momentum-text { font-size: 12.5px; color: rgba(255,255,255,0.75); letter-spacing: 0.01em; flex: 1; }
      .v13-momentum-text strong { color: rgba(255,255,255,0.95); font-weight: 600; }
      .v13-state-clear { color: rgba(46,160,67,0.9); }
      .v13-state-light { color: rgba(74,222,128,0.85); }
      .v13-state-active { color: rgba(250,204,21,0.9); }
      .v13-state-heavy { color: rgba(239,68,68,0.85); }
      .v13-state-awakening { color: rgba(180,140,255,0.85); }
      .v13-state-building { color: rgba(250,204,21,0.9); }
      .v13-state-strong { color: rgba(34,197,94,0.9); }

      /* ========= V13 TODAY COMPASS ========= */
      .card.v13-today-compass {
        padding: 24px 28px !important; min-height: 280px;
        display: flex; flex-direction: column; gap: 20px;
        background:
          radial-gradient(circle at 50% 0%, rgba(124,92,255,0.04) 0%, transparent 60%),
          var(--card, #1a1838) !important;
      }
      .v13-today-compass .card-title {
        font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.08em; color: rgba(255,255,255,0.55); margin-bottom: 0;
      }
      .v13-compass-progress {
        display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 8px 0 4px;
      }
      .v13-compass-count { display: flex; align-items: baseline; gap: 2px; font-weight: 700; line-height: 1; }
      .v13-count-done {
        font-size: 56px; color: rgba(180,140,255,1);
        filter: drop-shadow(0 0 16px rgba(124,92,255,0.4));
      }
      .v13-count-divider { font-size: 32px; color: rgba(255,255,255,0.3); font-weight: 400; margin: 0 2px; }
      .v13-count-total { font-size: 28px; color: rgba(255,255,255,0.5); font-weight: 500; }
      .v13-compass-subtitle { font-size: 13px; color: rgba(255,255,255,0.7); letter-spacing: 0.02em; }
      .v13-compass-bar {
        width: 80%; height: 8px; border-radius: 6px;
        background: rgba(255,255,255,0.06); overflow: hidden; position: relative;
      }
      .v13-compass-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95));
        border-radius: 6px;
        transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .v13-compass-streak {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: rgba(255,138,61,0.85);
      }
      .v13-streak-emoji { font-size: 13px; }
      .v13-compass-divider {
        height: 1px; margin: 0 -8px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
      }
      .v13-compass-mission { text-align: center; padding: 8px 12px; }
      .v13-mission-label {
        font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.1em;
        color: rgba(255,255,255,0.45); margin-bottom: 8px;
      }
      .v13-mission-statement {
        font-size: 16px; font-style: italic; line-height: 1.5;
        color: rgba(255,255,255,0.88); letter-spacing: 0.01em;
        animation: v13-mission-fade 800ms ease-out;
      }
      @keyframes v13-mission-fade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ========= V13 MEMORY HEALTH ========= */
      .card.v13-memory-health {
        padding: 24px 28px !important;
        display: flex; flex-direction: column; gap: 22px;
      }
      .v13-memory-health .card-title {
        font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.08em; color: rgba(255,255,255,0.55); margin-bottom: 0;
      }

      .v13-health-state { text-align: center; padding: 12px 0; }
      .v13-health-state-label {
        font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
        color: rgba(255,255,255,0.5); margin-bottom: 10px;
      }
      .v13-health-state-badge {
        display: inline-block; padding: 10px 24px; border-radius: 10px;
        font-size: 14px; font-weight: 700; letter-spacing: 0.12em;
        text-transform: uppercase; border: 1.5px solid currentColor;
      }
      .v13-health-state-badge.state-awakening { color: #a78bfa; background: rgba(167,139,250,0.08); box-shadow: 0 0 16px rgba(167,139,250,0.15); }
      .v13-health-state-badge.state-fragile { color: #ef4444; background: rgba(239,68,68,0.08); box-shadow: 0 0 16px rgba(239,68,68,0.15); }
      .v13-health-state-badge.state-recovering { color: #f59e0b; background: rgba(245,158,11,0.08); box-shadow: 0 0 16px rgba(245,158,11,0.15); }
      .v13-health-state-badge.state-building { color: #facc15; background: rgba(250,204,21,0.08); box-shadow: 0 0 16px rgba(250,204,21,0.15); }
      .v13-health-state-badge.state-stable { color: #22c55e; background: rgba(34,197,94,0.08); box-shadow: 0 0 16px rgba(34,197,94,0.15); }
      .v13-health-state-badge.state-automatic {
        color: #a78bfa;
        background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,92,255,0.10));
        box-shadow: 0 0 20px rgba(167,139,250,0.25);
      }
      .v13-health-state-subtitle {
        font-size: 13px; font-style: italic; color: rgba(255,255,255,0.6);
        margin-top: 10px; letter-spacing: 0.01em;
      }

      .v13-health-breakdown { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 0; }
      .v13-breakdown-row { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 6px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; text-align: center; transition: all 200ms ease-out; }
      .v13-breakdown-row:hover { background: rgba(124,92,255,0.06); border-color: rgba(124,92,255,0.18); }
      .v13-breakdown-row.dim { opacity: 0.4; background: rgba(255,255,255,0.015); }
      .v13-breakdown-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .v13-breakdown-dot.dot-fragile { background: #ef4444; }
      .v13-breakdown-dot.dot-weak { background: #f59e0b; }
      .v13-breakdown-dot.dot-building { background: #facc15; }
      .v13-breakdown-dot.dot-stable { background: #22c55e; }
      .v13-breakdown-dot.dot-automatic { background: #a78bfa; }
      .v13-breakdown-count { font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0; text-align: center; min-width: auto; }
      .v13-breakdown-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255,255,255,0.6); font-weight: 500; line-height: 1.2; }

      .v13-health-heatmap { display: flex; flex-direction: column; gap: 8px; }
      .v13-heatmap-header { display: flex; justify-content: space-between; align-items: baseline; }
      .v13-heatmap-label {
        font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em;
        color: rgba(255,255,255,0.5);
      }
      .v13-heatmap-period { font-size: 11px; color: rgba(255,255,255,0.4); font-style: italic; }
      .v13-heatmap-days {
        display: grid; grid-template-columns: repeat(7, 1fr);
        text-align: center; font-size: 10px;
        color: rgba(255,255,255,0.4); letter-spacing: 0.05em; text-transform: uppercase;
      }
      .v13-heatmap-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
      .v13-hm-cell {
        aspect-ratio: 1; border-radius: 3px;
        background: rgba(255,255,255,0.04);
        transition: all 220ms ease-out; cursor: help;
      }
      .v13-hm-cell:hover { outline: 1.5px solid rgba(124,92,255,0.6); transform: scale(1.1); }
      .v13-hm-cell.hm-1 { background: rgba(34,197,94,0.30); }
      .v13-hm-cell.hm-2 { background: rgba(34,197,94,0.55); }
      .v13-hm-cell.hm-3 { background: rgba(34,197,94,0.78); }
      .v13-hm-cell.hm-4 { background: rgba(34,197,94,1.00); }
      .v13-hm-cell.today { outline: 1.5px solid rgba(124,92,255,0.7); outline-offset: 1px; }

      .v13-health-insights {
        display: flex; flex-direction: column; gap: 8px;
        padding: 14px 16px; border-radius: 10px;
        background: rgba(124,92,255,0.04);
        border: 1px solid rgba(124,92,255,0.10);
      }
      .v13-insight-row {
        display: flex; gap: 8px; align-items: flex-start;
        font-size: 12.5px; line-height: 1.5;
        color: rgba(255,255,255,0.78); font-style: italic;
      }
      .v13-insight-icon { flex-shrink: 0; opacity: 0.7; }

      /* ========= Reduced motion ========= */
      @media (prefers-reduced-motion: reduce) {
        .card.v13-hero-living { animation: none; }
        .v13-milestone-glow { animation: none; opacity: 0.3; }
        .v13-mission-statement { animation: none; }
      }

      /* ========= Mobile ========= */
      @media (max-width: 900px) {
        .card.v13-hero-living { padding: 24px 20px !important; }
        .v13-hero-grid { grid-template-columns: 1fr; gap: 24px; }
        .v13-hero-identity-quote { display: none; }
      }
      @media (max-width: 600px) {
        .v13-tier-name { font-size: 16px; }
        .v13-hero-identity-day { font-size: 12px; }
        .v13-milestone-label { font-size: 9.5px; }
        .v13-momentum-text { font-size: 12px; }
        .card.v13-today-compass { padding: 20px !important; min-height: 240px; }
        .v13-count-done { font-size: 48px; }
        .v13-mission-statement { font-size: 15px; }
        .card.v13-memory-health { padding: 18px 14px !important; gap: 16px; }
        .v13-health-state-badge { padding: 8px 20px; font-size: 12.5px; }
        .v13-health-breakdown { grid-template-columns: repeat(5, 1fr); gap: 4px; }
        .v13-breakdown-row { padding: 8px 2px; gap: 4px; }
        .v13-breakdown-count { font-size: 18px; }
        .v13-breakdown-label { font-size: 8.5px; letter-spacing: 0.02em; }
        .v13-breakdown-dot { width: 6px; height: 6px; }
        .v13-insight-row { font-size: 11.5px; }
        .v13-heatmap-grid { gap: 3px; }
        .v13-hm-cell { border-radius: 2px; }
        .v13-heatmap-days { font-size: 9px; }
        .v13-heatmap-label { font-size: 9.5px; }
        .v13-heatmap-period { font-size: 10px; }
        .v13-health-insights { padding: 12px 14px; }
        .v13-journey-milestones { gap: 4px; }
      }
      @media (max-width: 380px) {
        .v13-health-breakdown { grid-template-columns: repeat(3, 1fr); }
        .v13-breakdown-row { padding: 8px 4px; }
        .v13-breakdown-count { font-size: 20px; }
        .v13-breakdown-label { font-size: 9px; }
        .card.v13-hero-living { padding: 18px 16px !important; min-height: 0; }
        .v13-tier-icon { font-size: 18px; }
        .v13-tier-name { font-size: 15px; }
        .v13-hero-identity-day { font-size: 11.5px; }
        .v13-hero-identity-quote { display: none; }
        .v13-milestone-dot { width: 12px; height: 12px; }
        .v13-milestone.current .v13-milestone-dot { width: 16px; height: 16px; }
        .v13-milestone-label { font-size: 8.5px; }
        .v13-journey-status { font-size: 11px; }
        .v13-momentum-row { padding: 4px 8px; }
        .v13-momentum-text { font-size: 11px; }
        .card.v13-today-compass { padding: 16px !important; min-height: 200px; gap: 12px; }
        .v13-count-done { font-size: 40px; }
        .v13-count-total, .v13-count-divider { font-size: 22px; }
        .v13-mission-statement { font-size: 13.5px; }
        .v13-mission-label { font-size: 9.5px; }
        .v13-compass-subtitle { font-size: 12px; }
        .v13-compass-bar { width: 90%; }
        .v13-compass-streak { font-size: 11px; }
        .card.v13-memory-health { padding: 14px 12px !important; gap: 14px; }
        .v13-health-state-badge { padding: 6px 16px; font-size: 11.5px; letter-spacing: 0.08em; }
        .v13-health-state-label { font-size: 10px; margin-bottom: 6px; }
        .v13-health-state-subtitle { font-size: 11.5px; margin-top: 6px; }
        .v13-insight-row { font-size: 10.5px; gap: 6px; }
        .v13-health-insights { padding: 10px 12px; gap: 6px; }
      }

      /* ========================================================
         V13.4 — COMPACT MEMORY STATUS (summary card, not analytics)
         ======================================================== */
      .card.v13-memory-health {
        padding: 20px 22px !important;
        display: flex; flex-direction: column; gap: 16px;
      }
      .v13-mh-stats {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
      }
      .v13-mh-stat {
        display: flex; flex-direction: column; align-items: center; gap: 5px;
        padding: 12px 6px; border-radius: 10px;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.05);
        transition: all 180ms ease-out;
      }
      .v13-mh-stat:hover { background: rgba(124,92,255,0.06); border-color: rgba(124,92,255,0.18); }
      .v13-mh-stat.dim { opacity: 0.4; }
      .v13-mh-num { font-size: 24px; font-weight: 800; color: rgba(255,255,255,0.96); line-height: 1; }
      .v13-mh-lab {
        font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em;
        color: rgba(255,255,255,0.6); font-weight: 600;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .v13-mh-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
      .v13-mh-dot.dot-fragile { background: #ef4444; }
      .v13-mh-dot.dot-weak { background: #f59e0b; }
      .v13-mh-dot.dot-stable { background: #22c55e; }
      .v13-mh-dot.dot-automatic { background: #a78bfa; }
      .v13-mh-insight {
        font-size: 13px; line-height: 1.45; padding: 11px 14px; border-radius: 10px;
        display: flex; align-items: center; gap: 8px;
      }
      .v13-mh-insight-icon { flex-shrink: 0; }
      .v13-mh-insight.warn { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18); color: #fca5a5; }
      .v13-mh-insight.ok { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.18); color: #86efac; font-style: italic; }

      /* ===== V13.4 MEMORY ACTIVITY — two-column story card ===== */
      .card.v13-memory-activity { grid-column: 1 / -1; padding: 20px 24px !important; }
      .v13-ma-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
      .v13-ma-head .card-title { margin-bottom: 0; }
      .v13-ma-meta { font-size: 11.5px; color: rgba(255,255,255,0.45); }
      .v13-ma-cols { display: grid; grid-template-columns: minmax(280px, 360px) 1fr; gap: 28px; align-items: start; }
      .v13-ma-sub { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.5); font-weight: 600; margin-bottom: 10px; }
      .v13-ma-left { min-width: 0; }
      .v13-ma-days { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 9.5px; color: rgba(255,255,255,0.4); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 5px; }
      .v13-ma-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
      .v13-ma-grid .v13-hm-cell { aspect-ratio: 1; max-width: none; border-radius: 4px; }
      .v13-ma-legend { display: flex; align-items: center; gap: 5px; font-size: 10.5px; color: rgba(255,255,255,0.4); margin-top: 10px; }
      .v13-ma-legend .v13-hm-cell { width: 13px; height: 13px; border-radius: 3px; }

      .v13-ma-right { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
      .v13-ma-block { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 14px 16px; }
      .v13-insight-line { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 13px; color: rgba(255,255,255,0.82); }
      .v13-il-ico { flex: 0 0 auto; font-size: 14px; }
      .v13-il-txt { flex: 1 1 auto; min-width: 0; }
      .v13-insight-line b { font-weight: 700; margin-left: 2px; }
      .v13-insight-line.action { margin-top: 4px; padding: 10px 12px; border-radius: 10px; background: rgba(124,92,255,0.10); border: 1px solid rgba(124,92,255,0.22); cursor: pointer; color: #fff; font-weight: 600; transition: all 160ms ease-out; }
      .v13-insight-line.action:hover { background: rgba(124,92,255,0.18); transform: translateY(-1px); }
      .v13-il-arrow { flex: 0 0 auto; opacity: 0.7; transition: transform 160ms ease-out; }
      .v13-insight-line.action:hover .v13-il-arrow { transform: translateX(3px); }

      .v13-ma-twocol { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .v13-momentum { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .v13-mom { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; background: rgba(255,255,255,0.025); border-radius: 9px; }
      .v13-mom-num { font-size: 22px; font-weight: 800; color: #fff; line-height: 1; }
      .v13-mom-lab { font-size: 9.5px; color: rgba(255,255,255,0.55); text-align: center; }
      .v13-trend { display: flex; flex-direction: column; gap: 6px; }
      .v13-trend-row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 10px; font-size: 12.5px; color: rgba(255,255,255,0.75); }
      .v13-trend-label { color: rgba(255,255,255,0.7); }
      .v13-trend-count { font-weight: 700; color: rgba(255,255,255,0.92); min-width: 18px; text-align: right; }
      .v13-trend-arrow { font-weight: 800; font-size: 14px; min-width: 16px; text-align: center; }
      .v13-trend-note { font-weight: 400; color: rgba(255,255,255,0.35); text-transform: none; letter-spacing: 0; font-style: italic; }
      .t-good { color: #4ade80; }
      .t-bad { color: #f87171; }
      .t-flat { color: rgba(255,255,255,0.45); }

      /* ========================================================
         V13.4 — TODAY FOCUS missions checklist (ROOT-CAUSE FIX)
         Old bug: a broad [class*=mission-]{width:100%} matched the
         empty .polish-1112-mission-check, forcing the checkbox to
         100% width; with flex-shrink:0 it ate the row and crushed
         the text to 0px -> one character per line. Scoped, robust
         rules below replace that. Applied at all widths.
         ======================================================== */
      .polish-1112-mission-list { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
      .polish-1112-mission-item { display: flex; flex-direction: row; align-items: center; gap: 10px; width: 100%; min-width: 0; }
      .polish-1112-mission-check {
        flex: 0 0 20px !important; width: 20px !important; height: 20px !important;
        max-width: 20px !important; min-width: 20px !important;
      }
      .polish-1112-mission-text {
        flex: 1 1 auto !important; min-width: 0 !important; width: auto !important; max-width: 100% !important;
        white-space: normal !important; word-break: normal !important; overflow-wrap: break-word !important;
        text-align: left !important;
      }

      /* ========================================================
         V13.4 — RESPONSIVE (single, clean cascade — no nested @media)
         ======================================================== */
      @media (max-width: 900px) {
        .card.v13-hero-living { padding: 24px 20px !important; }
        .v13-hero-grid { grid-template-columns: 1fr; gap: 22px; }
        .v13-hero-identity-quote { display: none; }
      }

      @media (max-width: 700px) {
        /* Home + Review become a single column. #view-* uses display:contents,
           so target its direct children to span the full track. */
        #view-home > *, #view-dashboard > *, #view-review > * { grid-column: 1 / -1 !important; min-width: 0 !important; }
        .card, [data-section-id] { width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
        aside.sidebar, .sidebar, [class*="sidebar"]:not([class*="main"]) { display: none !important; }
        .main, .content { margin-left: 0 !important; padding-left: 14px !important; padding-right: 14px !important; max-width: 100vw !important; }

        .v13-hero-grid { grid-template-columns: 1fr !important; gap: 16px !important; text-align: center; }
        .v13-hero-identity-tier { justify-content: center; }

        .card.v13-memory-health { padding: 16px 16px !important; gap: 12px; }
        .v13-mh-num { font-size: 22px; }
        .v13-mh-insight { font-size: 12px; }

        .card.v13-today-compass { padding: 16px 16px !important; min-height: 0 !important; }
        .card.v13-memory-activity { padding: 16px !important; }
        .v13-ma-cols { grid-template-columns: 1fr; gap: 18px; }
        .v13-ma-twocol { grid-template-columns: 1fr; }
        .v13-ma-days, .v13-ma-grid { grid-template-columns: repeat(7, 1fr); }

        /* YOUR NEXT MOVE banner: stack — scoped to .mission-hero ONLY */
        .mission-hero { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
        .mission-hero > * { width: 100% !important; min-width: 0 !important; }
        .mission-hero h1, .mission-hero h2, .mission-hero h3 { font-size: clamp(15px, 4.5vw, 22px) !important; }

        .card.stat-card { padding: 14px 16px !important; min-height: 0 !important; }
      }

      @media (max-width: 400px) {
        .card { padding: 14px 13px !important; }
        .v13-mh-stats { gap: 6px; }
        .v13-mh-num { font-size: 20px; }
        .v13-mh-lab { font-size: 9px; }
        .v13-momentum-text { font-size: 11.5px; }
      }

    `;
    document.head.appendChild(s);
  }

  // ============= NAV HOOK + LIVE UPDATE =============
  function hookNavigate() {
    if (typeof window.navigate !== 'function') { setTimeout(hookNavigate, 200); return; }
    if (window.navigate.__v13Hooked) return;
    const orig = window.navigate;
    window.navigate = function(viewId) {
      orig(viewId);
      if (viewId === 'home' || viewId === 'dashboard' || !viewId) {
        setTimeout(NS.renderAll, 250);
        setTimeout(NS.renderAll, 700);
      }
    };
    window.navigate.__v13Hooked = true;
    // Initial render
    setTimeout(NS.renderAll, 500);
    setTimeout(NS.renderAll, 1500);
  }

  injectCSS();
  hookNavigate();
  setTimeout(NS.addDay60Tab, 800);
  setTimeout(NS.addDay60Tab, 2000);
  setTimeout(NS.addDay60Tab, 4000);
  setInterval(NS.addDay60Tab, 5000);
  window.__v13Day60Interval = true;
  window.addEventListener('load', function() { setTimeout(function(){ if (window.SHADOW_V13) window.SHADOW_V13.addDay60Tab(); }, 200); setTimeout(function(){ if (window.SHADOW_V13) window.SHADOW_V13.addDay60Tab(); }, 1500); });

  

  NS._info = function() {
    const state = NS.getState();
    return {
      version: NS.version,
      streak: state.user?.streak || 0,
      identity: NS.identityFor(state.user?.streak || 0).tier.name,
      journey: NS.journeyPosition(state),
      memoryHealth: NS.memoryHealthState(NS.computeDistribution(state.topics)).label
    };
  };

  // ============= v13.1: DAY 60 REVIEW TAB =============
  NS.addDay60Tab = function() {
    const tabsContainer = document.querySelector('.queue-tabs');
    if (!tabsContainer) return;
    if (tabsContainer.querySelector('[data-v13-day60]')) return;
    const tabs = Array.from(tabsContainer.querySelectorAll('.queue-tab, [class*="queue-tab"], span, button'));
    let day21Tab = null;
    for (const t of tabs) {
      const txt = (t.textContent || '').trim();
      if (/^Day 21/i.test(txt) && t.children.length === 0) { day21Tab = t; break; }
    }
    if (!day21Tab) return;
    const state = NS.getState();
    const count = (state.topics || []).filter(t => t.reviewStage === 'Day 60').length;
    const day60 = day21Tab.cloneNode(true);
    day60.dataset.v13Day60 = '1';
    day60.textContent = 'Day 60 (' + count + ')';
    day21Tab.parentNode.insertBefore(day60, day21Tab.nextSibling);
    day60.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      tabs.forEach(t => t.classList.remove('active'));
      day60.classList.add('active');
      const table = document.querySelector('.queue-table');
      if (table) {
        const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
        rows.forEach(row => {
          const stageText = row.textContent || '';
          row.style.display = /Day 60/i.test(stageText) ? '' : 'none';
        });
      }
    };
  };
  (function hookReviewView() {
    if (typeof window.navigate !== 'function') { setTimeout(hookReviewView, 200); return; }
    if (window.navigate.__v13_1_review_hooked) return;
    const orig = window.navigate;
    window.navigate = function(viewId) {
      orig(viewId);
      if (viewId === 'review' || viewId === 'home' || viewId === 'dashboard' || !viewId) {
        setTimeout(NS.addDay60Tab, 350);
        setTimeout(NS.addDay60Tab, 800);
        setTimeout(NS.addDay60Tab, 1800);
      }
    };
    window.navigate.__v13_1_review_hooked = true;
  })();

  console.log('[v13] Living Identity / Daily Compass / Memory Health loaded · v' + NS.version);
})();
