// ============================================================
// SHADOW ENGLISH — Learning Operating System
// State engine · Real game logic · Persistence
// ============================================================

const STORAGE_KEY = 'shadow-en-state-v3';
const SCHEMA_VERSION = 3;

// ============= STAGE / MEMORY LOGIC =============
const STAGES = ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'];
const STAGE_DAYS = { 'Day 0': 0, 'Day 1': 1, 'Day 3': 3, 'Day 7': 7, 'Day 21': 21, 'Day 60': 60 };
const NEXT_STAGE = { 'Day 0': 'Day 1', 'Day 1': 'Day 3', 'Day 3': 'Day 7', 'Day 7': 'Day 21', 'Day 21': 'Day 60', 'Day 60': 'Day 60' };
const MEMORY_FROM_STAGE = { 'Day 0': 'Fragile', 'Day 1': 'Weak', 'Day 3': 'Building', 'Day 7': 'Stable', 'Day 21': 'Stable', 'Day 60': 'Automatic' };
const MEMORY_COLOR = { 'Fragile': '#ef4444', 'Weak': '#ff8a3d', 'Building': '#facc15', 'Stable': '#22c55e', 'Automatic': '#a78bfa' };

// ============= TOPIC SEED (32 từ Notion docs) =============
const TOPIC_SEED = [
  { id: 'L1-01', emoji: '🍔', name: 'Ordering Food & Drinks', level: 1 },
  { id: 'L1-02', emoji: '🗺️', name: 'Asking for Directions',   level: 1 },
  { id: 'L1-03', emoji: '🛍️', name: 'Shopping & Paying',       level: 1 },
  { id: 'L1-04', emoji: '👋', name: 'Introducing Yourself',    level: 1 },
  { id: 'L1-05', emoji: '🔢', name: 'Numbers, Time & Dates',   level: 1 },
  { id: 'L1-06', emoji: '✈️', name: 'At the Airport',          level: 1 },
  { id: 'L1-07', emoji: '🚌', name: 'Using Public Transport',  level: 1 },
  { id: 'L1-08', emoji: '🏨', name: 'At the Hotel',            level: 1 },
  { id: 'L1-09', emoji: '📞', name: 'Making a Phone Call',     level: 1 },
  { id: 'L1-10', emoji: '🏥', name: 'At the Doctor',           level: 1 },
  { id: 'L1-11', emoji: '🤝', name: 'Asking for Help',         level: 1 },
  { id: 'L1-12', emoji: '🚨', name: 'Emergency Situations',    level: 1 },
  { id: 'L2-01', emoji: '☕', name: 'Small Talk & Icebreakers', level: 2 },
  { id: 'L2-02', emoji: '👤', name: 'Talking About Yourself',  level: 2 },
  { id: 'L2-03', emoji: '💼', name: 'Work & Career Talk',      level: 2 },
  { id: 'L2-04', emoji: '📝', name: 'Making Plans',            level: 2 },
  { id: 'L2-05', emoji: '💡', name: 'Expressing Opinions',     level: 2 },
  { id: 'L2-06', emoji: '🎉', name: 'At a Party',              level: 2 },
  { id: 'L2-07', emoji: '✈️', name: 'Talking About Travel',    level: 2 },
  { id: 'L2-08', emoji: '🍜', name: 'Food & Culture',          level: 2 },
  { id: 'L2-09', emoji: '😊', name: 'Giving Compliments',      level: 2 },
  { id: 'L2-10', emoji: '🤝', name: 'Handling Disagreements',  level: 2 },
  { id: 'L3-01', emoji: '📺', name: 'Presenting Ideas',        level: 3 },
  { id: 'L3-02', emoji: '🤝', name: 'Negotiation',             level: 3 },
  { id: 'L3-03', emoji: '👔', name: 'Job Interviews',          level: 3 },
  { id: 'L3-04', emoji: '📊', name: 'Business Meetings',       level: 3 },
  { id: 'L3-05', emoji: '📚', name: 'Storytelling',            level: 3 },
  { id: 'L3-06', emoji: '🤔', name: 'Debating',                level: 3 },
  { id: 'L3-07', emoji: '❤️', name: 'Emotional Intelligence',  level: 3 },
  { id: 'L3-08', emoji: '✏️', name: 'Formal Writing',          level: 3 },
  { id: 'L3-09', emoji: '😄', name: 'Humor & Wordplay',        level: 3 },
  { id: 'L3-10', emoji: '🧠', name: 'Thinking in English',     level: 3 }
];

const DEFAULT_MISSIONS = [
  'Dùng 1 cụm từ trong bữa ăn thật',
  'Chat với AI về chủ đề này 3 phút',
  'Xem video hội thoại nhà hàng',
  'Ghi âm đoạn hội thoại 1 phút',
  'Rủ bạn đóng vai đi nhà hàng'
];

// ============= STATE PERSISTENCE =============
function seedState() {
  return {
    schema: SCHEMA_VERSION,
    user: {
      name: 'Dương',
      level: 1,
      xp: 0,
      xpToNext: 100,
      streak: 0,
      lastStudyDate: null,
      createdAt: new Date().toISOString()
    },
    topics: TOPIC_SEED.map(t => ({
      ...t,
      reviewStage: 'Day 0',
      memoryStatus: 'Fragile',
      lastReview: null,
      nextReview: null,
      masteryPct: 0,
      confidence: 0,
      sessions: 0
    })),
    sessionsLog: [],
    missions: { date: new Date().toDateString(), items: DEFAULT_MISSIONS.map(t => ({task: t, done: false})) },
    currentSession: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.schema === SCHEMA_VERSION) return s;
    }
  } catch (e) {}
  return seedState();
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

let state = loadState();

// ============= GAME LOGIC =============
function awardXP(amount, reason) {
  state.user.xp += amount;
  while (state.user.xp >= state.user.xpToNext) {
    state.user.xp -= state.user.xpToNext;
    state.user.level += 1;
    state.user.xpToNext = Math.round(state.user.xpToNext * 1.5);
    toast(`🎉 LEVEL UP! Now LV ${state.user.level}`);
  }
  if (reason) toast(`+${amount} XP · ${reason}`);
}

function updateStreak() {
  const today = new Date().toDateString();
  const last = state.user.lastStudyDate ? new Date(state.user.lastStudyDate).toDateString() : null;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) {
    state.user.streak += 1;
  } else if (last !== today) {
    state.user.streak = 1;
  }
  state.user.lastStudyDate = new Date().toISOString();
}

function isStreakActive() {
  if (!state.user.lastStudyDate) return false;
  const last = new Date(state.user.lastStudyDate).toDateString();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return last === today || last === yesterday;
}

function completeReview(topicId, confidence) {
  const t = state.topics.find(x => x.id === topicId);
  if (!t) return;
  t.lastReview = new Date().toISOString();
  if (confidence >= 4) {
    t.reviewStage = NEXT_STAGE[t.reviewStage];
    t.memoryStatus = MEMORY_FROM_STAGE[t.reviewStage];
    t.masteryPct = Math.min(100, t.masteryPct + 15);
  } else if (confidence <= 2) {
    t.reviewStage = 'Day 1';
    t.memoryStatus = 'Weak';
    t.masteryPct = Math.max(0, t.masteryPct - 5);
  } else {
    t.masteryPct = Math.min(100, t.masteryPct + 8);
  }
  const days = STAGE_DAYS[t.reviewStage];
  t.nextReview = new Date(Date.now() + days * 86400000).toISOString();
  t.sessions += 1;
  t.confidence = confidence;
  awardXP(50 + confidence * 10, `Reviewed ${t.name}`);
  state.sessionsLog.push({ type: 'review', topicId, confidence, at: new Date().toISOString() });
  updateStreak();
  saveState();
  render();
}

function completeSession(topicId) {
  const t = state.topics.find(x => x.id === topicId);
  if (!t) return;
  t.lastReview = new Date().toISOString();
  if (t.reviewStage === 'Day 0') {
    t.reviewStage = 'Day 1';
    t.memoryStatus = 'Weak';
    t.masteryPct = 12;
  } else {
    t.reviewStage = NEXT_STAGE[t.reviewStage];
    t.memoryStatus = MEMORY_FROM_STAGE[t.reviewStage];
    t.masteryPct = Math.min(100, t.masteryPct + 18);
  }
  const days = STAGE_DAYS[t.reviewStage];
  t.nextReview = new Date(Date.now() + days * 86400000).toISOString();
  t.sessions += 1;
  awardXP(150, `Session complete: ${t.name}`);
  state.sessionsLog.push({ type: 'session', topicId, at: new Date().toISOString() });
  updateStreak();
  state.currentSession = null;
  saveState();
  render();
  toast(`✅ Session complete — ${t.name} → ${t.reviewStage}`);
}

function startSession(topicId) {
  state.currentSession = { topicId, startedAt: new Date().toISOString(), step: 1 };
  saveState();
  render();
  navigate('session');
}

function advanceStep() {
  if (!state.currentSession) return;
  state.currentSession.step += 1;
  awardXP(30, `Step ${state.currentSession.step - 1} done`);
  if (state.currentSession.step > 5) {
    completeSession(state.currentSession.topicId);
  } else {
    saveState();
    render();
  }
}

function toggleMission(idx) {
  // Reset missions if new day
  const today = new Date().toDateString();
  if (state.missions.date !== today) {
    state.missions = { date: today, items: DEFAULT_MISSIONS.map(t => ({task: t, done: false})) };
  }
  const m = state.missions.items[idx];
  if (!m) return;
  m.done = !m.done;
  if (m.done) awardXP(20, `Mission: ${m.task}`);
  saveState();
  render();
}

function getTodayQueue() {
  const today = new Date();
  return state.topics.filter(t => {
    if (!t.nextReview) return false;
    return new Date(t.nextReview) <= today && t.reviewStage !== 'Day 60';
  }).sort((a,b) => new Date(a.nextReview) - new Date(b.nextReview));
}

function getNewTopic() {
  return state.topics.find(t => t.reviewStage === 'Day 0');
}

function getCloseToLevelUp() {
  return state.topics
    .filter(t => t.masteryPct >= 60 && t.reviewStage !== 'Day 0' && t.reviewStage !== 'Day 60')
    .sort((a,b) => b.masteryPct - a.masteryPct)
    .slice(0, 3);
}

function getMemoryCounts() {
  const c = { Fragile: 0, Weak: 0, Building: 0, Stable: 0, Automatic: 0 };
  state.topics.forEach(t => c[t.memoryStatus]++);
  return c;
}

function getStageCount(stage) {
  return state.topics.filter(t => t.reviewStage === stage).length;
}

function getStats() {
  const mastered = state.topics.filter(t => t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic').length;
  const dueToday = getTodayQueue().length;
  const newTopics = state.topics.filter(t => t.reviewStage === 'Day 0').length;
  // Sessions this week
  const weekAgo = Date.now() - 7 * 86400000;
  const weekSessions = state.sessionsLog.filter(s => new Date(s.at).getTime() > weekAgo).length;
  return { mastered, total: state.topics.length, dueToday, newTopics, weekSessions };
}

function getLevelProgress(level) {
  const topics = state.topics.filter(t => t.level === level);
  const completed = topics.filter(t => t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic').length;
  return { count: topics.length, completed, pct: Math.round((completed / topics.length) * 100) };
}

function getDayName() {
  const d = new Date().getDay();
  return ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][d];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil, ' + state.user.name;
  if (h < 11) return 'Good morning, ' + state.user.name;
  if (h < 13) return 'Lunch break learning, ' + state.user.name;
  if (h < 17) return 'Good afternoon, ' + state.user.name;
  if (h < 21) return 'Evening study time, ' + state.user.name;
  return 'Late night legend, ' + state.user.name;
}

// ============= TOAST =============
function toast(msg) {
  let t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

// ============= RENDER =============
function render() {
  // XP bar
  const xpPct = Math.round((state.user.xp / state.user.xpToNext) * 100);
  const xpBar = document.querySelector('.xp-bar');
  if (xpBar) {
    xpBar.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        <span class="level-chip">LV ${state.user.level}</span>
        <span style="font-weight:600;color:var(--text)">${getGreeting()}</span>
        <span style="color:var(--text-3)">·</span>
        <span style="color:var(--text-2)">Shadow Apprentice</span>
      </span>
      <span style="display:flex;align-items:center;gap:10px;flex:1;justify-content:flex-end;">
        <span style="color:var(--text-3);font-size:11px">XP</span>
        <span style="color:var(--text);font-weight:600">${state.user.xp.toLocaleString()}</span>
        <span class="xp-progress"><span class="xp-fill" style="width:${xpPct}%"></span></span>
        <span style="color:var(--text-3);font-size:11px">${state.user.xpToNext.toLocaleString()}</span>
      </span>
    `;
  }

  // Mission Hero
  const stats = getStats();
  const newTopic = getNewTopic();
  const heroEmoji = document.querySelector('.mission-emoji');
  const heroTitle = document.querySelector('.mission-title');
  const heroSub = document.querySelector('.mission-sub');
  if (newTopic && heroEmoji) {
    heroEmoji.textContent = newTopic.emoji;
    heroTitle.textContent = `Shadow "${newTopic.name}" — start your next win`;
    heroSub.innerHTML = `Anh chỉ cần 1 buổi shadow đầy đủ là <b style="color:#fde047">${newTopic.name}</b> chuyển từ <span class="day-tag day-0">Day 0</span> → <span class="day-tag day-1">Day 1 — Weak</span>.`;
  } else if (heroTitle) {
    heroEmoji.textContent = '🎯';
    heroTitle.textContent = 'Tất cả 32 topics đã learned — focus vào reviews';
    heroSub.innerHTML = `Hôm nay có <b style="color:#fde047">${stats.dueToday}</b> topic cần review.`;
  }

  // 5 stat cards
  setText('#stat-streak', state.user.streak);
  setText('#stat-streak-sub', state.user.streak === 0 ? 'Start today!' : state.user.streak >= 7 ? 'On fire! 🔥' : 'Keep going');
  setText('#stat-mastered', stats.mastered);
  setText('#stat-mastered-pct', Math.round(stats.mastered/stats.total*100) + '%');
  document.querySelectorAll('#stat-mastered-bar').forEach(el => el.style.width = Math.round(stats.mastered/stats.total*100) + '%');
  setText('#stat-review-due', stats.dueToday);
  setText('#stat-week-sessions', stats.weekSessions);

  // Brain load based on review queue size
  const brainEl = document.querySelector('#stat-brain-load');
  if (brainEl) {
    if (stats.dueToday >= 7) { brainEl.textContent = 'Heavy'; brainEl.style.color = '#ef4444'; }
    else if (stats.dueToday >= 4) { brainEl.textContent = 'Medium'; brainEl.style.color = '#facc15'; }
    else if (stats.dueToday >= 1) { brainEl.textContent = 'Light'; brainEl.style.color = '#86efac'; }
    else { brainEl.textContent = 'Clear'; brainEl.style.color = '#a78bfa'; }
  }
  setText('#stat-brain-sub', `${stats.dueToday} review${stats.dueToday !== 1 ? 's' : ''} today`);

  // Streak guard
  setText('#streak-guard-num', state.user.streak);
  setText('#streak-guard-next', `Day ${state.user.streak + 1}`);
  renderStreakDots();

  // Today Focus — review list
  renderTodayReviewList();
  renderReviewQueueTable();

  // Memory legend
  const mc = getMemoryCounts();
  const total = state.topics.length;
  setText('#mem-fragile', `${mc.Fragile} (${Math.round(mc.Fragile/total*100)}%)`);
  setText('#mem-weak', `${mc.Weak} (${Math.round(mc.Weak/total*100)}%)`);
  setText('#mem-building', `${mc.Building} (${Math.round(mc.Building/total*100)}%)`);
  setText('#mem-stable', `${mc.Stable} (${Math.round(mc.Stable/total*100)}%)`);
  setText('#mem-automatic', `${mc.Automatic} (${Math.round(mc.Automatic/total*100)}%)`);

  // SR Engine counts
  STAGES.forEach((stage, i) => {
    const el = document.querySelector(`.sr-stage.s-${stage.replace('Day ','')} .count`);
    if (el) el.textContent = getStageCount(stage);
  });

  // Level progress
  for (let lv = 1; lv <= 3; lv++) {
    const lp = getLevelProgress(lv);
    setText(`#level${lv}-pct`, lp.pct + '%');
    const bar = document.querySelector(`#level${lv}-bar`);
    if (bar) bar.style.width = lp.pct + '%';
  }

  // Missions
  renderMissions();

  // Close to level up
  renderCloseToLevelUp();

  // Coach insight
  const coachSub = document.querySelector('#coach-sub');
  if (coachSub) {
    coachSub.innerHTML = `Hôm nay là <b style="color:#86efac">${getDayName()}</b>. Anh đã có <b style="color:var(--text)">${state.user.streak}</b> ngày streak. ${stats.dueToday > 0 ? `Còn <b style="color:#fde047">${stats.dueToday}</b> topic cần review.` : 'Hôm nay không có review — bắt đầu topic mới đi.'}`;
  }

  // Coach quote
  const coachQuote = document.querySelector('#coach-quote');
  if (coachQuote) {
    let msg;
    if (state.user.streak === 0) msg = 'Hành trình ngàn ngày bắt đầu từ bước hôm nay. Click START để bắt đầu Day 1.';
    else if (state.user.streak < 3) msg = `${state.user.streak} ngày — momentum đang được tạo ra. Đừng dừng lại.`;
    else if (state.user.streak < 7) msg = `${state.user.streak} ngày liên tiếp. Đây là hệ thống đang chạy đúng. Cứ tiếp tục.`;
    else if (state.user.streak < 21) msg = `${state.user.streak} ngày — anh đã vượt mốc thói quen. Giờ thì nó tự chạy.`;
    else msg = `${state.user.streak} ngày — đây là sự khác biệt giữa người học và người master. Anh đang ở team master.`;
    coachQuote.textContent = msg;
  }

  // Session view if active
  renderSessionView();
}

function renderStreakDots() {
  const container = document.querySelector('#streak-dots');
  if (!container) return;
  const days = 7;
  let html = '';
  for (let i = 0; i < days; i++) {
    if (i < state.user.streak) html += '<div style="width:8px;height:8px;border-radius:50%;background:#ff8a3d;box-shadow:0 0 8px #ff8a3d"></div>';
    else if (i === state.user.streak && !isStreakActive()) html += '<div style="width:8px;height:8px;border-radius:50%;background:rgba(255,138,61,0.2);animation:pulse 1.5s ease-in-out infinite"></div>';
    else html += '<div style="width:8px;height:8px;border-radius:50%;background:rgba(255,138,61,0.2)"></div>';
  }
  container.innerHTML = html;
}

function renderTodayReviewList() {
  const list = document.querySelector('#today-review-list');
  if (!list) return;
  const queue = getTodayQueue();
  if (queue.length === 0) {
    list.innerHTML = '<div style="font-size:11px;color:var(--text-3);padding:8px 0">Không có review hôm nay — bắt đầu topic mới ↑</div>';
    return;
  }
  list.innerHTML = queue.slice(0, 6).map(t => `
    <div class="review-item" data-action="review" data-topic="${t.id}" style="cursor:pointer">
      <span class="name">${t.emoji} ${t.name}</span>
      <span class="day-tag day-${t.reviewStage.replace('Day ','')}">${t.reviewStage}</span>
    </div>
  `).join('');
  list.querySelectorAll('[data-action="review"]').forEach(el => {
    el.addEventListener('click', () => quickReview(el.dataset.topic));
  });
}

function renderReviewQueueTable() {
  const tbody = document.querySelector('#queue-tbody');
  if (!tbody) return;
  const queue = getTodayQueue();
  if (queue.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:14px">Hôm nay chưa có topic nào đến hạn review</td></tr>';
    return;
  }
  tbody.innerHTML = queue.map(t => `
    <tr style="cursor:pointer" data-action="review" data-topic="${t.id}">
      <td><span class="priority ${t.memoryStatus === 'Fragile' || t.memoryStatus === 'Weak' ? 'high' : 'med'}">${t.memoryStatus === 'Fragile' ? '🔥' : '↑'}</span></td>
      <td>${t.emoji} ${t.name}</td>
      <td><span class="day-tag day-${t.reviewStage.replace('Day ','')}">${t.reviewStage}</span></td>
      <td><span class="mem-bar"><span class="mem-bar-fill" style="width:${t.masteryPct}%"></span></span> ${t.masteryPct}%</td>
      <td style="color:var(--text-2)">${t.lastReview ? timeAgo(t.lastReview) : 'Never'}</td>
    </tr>
  `).join('');
  tbody.querySelectorAll('[data-action="review"]').forEach(el => {
    el.addEventListener('click', () => quickReview(el.dataset.topic));
  });
}

function renderMissions() {
  const today = new Date().toDateString();
  if (state.missions.date !== today) {
    state.missions = { date: today, items: DEFAULT_MISSIONS.map(t => ({task: t, done: false})) };
    saveState();
  }
  const container = document.querySelector('#missions-list');
  if (!container) return;
  container.innerHTML = state.missions.items.map((m, i) => `
    <div class="mission-row ${m.done ? 'done' : ''}" data-mission-idx="${i}" style="cursor:pointer">
      <span class="mission-check"></span>
      <span class="name">${m.task}</span>
    </div>
  `).join('');
  container.querySelectorAll('[data-mission-idx]').forEach(el => {
    el.addEventListener('click', () => toggleMission(parseInt(el.dataset.missionIdx)));
  });
  const done = state.missions.items.filter(m => m.done).length;
  setText('#mission-streak-count', `${done} / ${state.missions.items.length} missions`);
  const dotsEl = document.querySelector('#mission-streak-dots');
  if (dotsEl) {
    let s = '';
    for (let i = 0; i < state.missions.items.length; i++) s += i < done ? '🔥' : '⚪';
    dotsEl.textContent = s;
  }
}

function renderCloseToLevelUp() {
  const list = document.querySelector('#close-list');
  if (!list) return;
  const items = getCloseToLevelUp();
  if (items.length === 0) {
    list.innerHTML = '<div style="font-size:11px;color:var(--text-3);padding:10px 0">Chưa có topic nào gần level-up. Hoàn thành review để mastery tăng.</div>';
    return;
  }
  list.innerHTML = items.map(t => {
    const nextStage = NEXT_STAGE[t.reviewStage];
    const nextMem = MEMORY_FROM_STAGE[nextStage];
    return `
      <div class="close-item" data-action="review" data-topic="${t.id}" style="cursor:pointer">
        <div class="emoji-tile">${t.emoji}</div>
        <div class="name"><b>${t.name}</b> <span style="color:var(--text-3);font-size:10px">· Level ${t.level}</span></div>
        <div class="close-progress-mini"><div class="close-progress-mini-fill" style="width:${t.masteryPct}%"></div></div>
        <div class="meta">${t.masteryPct}%</div>
        <span class="next-stage">${t.memoryStatus} → ${nextMem}</span>
      </div>
    `;
  }).join('');
  list.querySelectorAll('[data-action="review"]').forEach(el => {
    el.addEventListener('click', () => quickReview(el.dataset.topic));
  });
}

function renderSessionView() {
  const view = document.getElementById('view-session');
  if (!view) return;
  const cs = state.currentSession;
  const topic = cs ? state.topics.find(t => t.id === cs.topicId) : getNewTopic() || state.topics[0];
  if (!topic) return;
  const step = cs ? cs.step : 1;
  const emojiEl = view.querySelector('.session-emoji');
  if (emojiEl) emojiEl.textContent = topic.emoji;
  const titleEl = view.querySelector('.session-title');
  if (titleEl) titleEl.textContent = topic.name;
  const subEl = view.querySelector('.session-sub');
  if (subEl) subEl.textContent = `Level ${topic.level} · ${topic.reviewStage} · 60 phút · 12 phrases`;
  const stageEl = view.querySelector('.session-stage');
  if (stageEl) stageEl.textContent = `${topic.reviewStage}  ·  ${topic.memoryStatus.toUpperCase()}`;
  const progEl = view.querySelector('.session-progress-ring');
  if (progEl) {
    const pct = ((step - 1) / 5) * 100;
    progEl.style.background = `conic-gradient(#7c5cff ${pct}%, #2a2750 ${pct}%)`;
    const span = progEl.querySelector('span');
    if (span) span.textContent = (step - 1) + '/5';
  }
  view.querySelectorAll('.session-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    const btn = el.querySelector('.step-btn');
    if (i + 1 < step) { el.classList.add('done'); if (btn) { btn.textContent = '✓ Done'; btn.className = 'step-btn'; btn.disabled = true; } }
    else if (i + 1 === step) { el.classList.add('active'); if (btn) { btn.textContent = 'Complete Step (+30 XP)'; btn.className = 'step-btn primary'; btn.disabled = false; btn.onclick = advanceStep; } }
    else { if (btn) { btn.textContent = 'Locked'; btn.className = 'step-btn'; btn.disabled = true; } }
  });
}

function quickReview(topicId) {
  const t = state.topics.find(x => x.id === topicId);
  if (!t) return;
  const conf = parseInt(prompt(`Review "${t.name}"\n\nMức độ nhớ (1-5)?\n1=Quên · 2=Yếu · 3=OK · 4=Tốt · 5=Phản xạ`, '4'));
  if (!conf || conf < 1 || conf > 5) return;
  completeReview(topicId, conf);
}

function setText(sel, val) {
  document.querySelectorAll(sel).forEach(el => el.textContent = val);
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600000) return 'Just now';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

// ============= NAVIGATION =============
function navigate(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  let target = document.getElementById('view-' + viewId);
  if (!target) {
    target = document.getElementById('view-placeholder');
    const titleMap = { phrases:'💬 Phrases Bank', missions:'🎯 Missions', level1:'🔵 Level 1', level2:'🟢 Level 2', level3:'🟣 Level 3', calendar:'📅 Calendar', progress:'📈 Progress', memory:'🧠 Memory Log', stats:'📊 Statistics', resources:'🗣️ Resources' };
    const t = document.getElementById('ph-title');
    if (t) t.textContent = titleMap[viewId] || 'Coming Soon';
  }
  target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');
  const bc = document.querySelector('.current');
  if (bc) bc.textContent = navItem ? navItem.textContent.trim() : 'Coming Soon';
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// ============= EVENT BINDING =============
function bindEvents() {
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.view));
  });
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); navigate(el.dataset.nav); });
  });
  // START NOW (mission hero)
  const startBtn = document.querySelector('.mission-btn');
  if (startBtn) startBtn.onclick = () => {
    const topic = getNewTopic();
    if (topic) startSession(topic.id);
    else toast('Tất cả topics đã learned — xem Review Queue');
  };
  // START SESSION (today focus)
  const sessBtn = document.querySelector('.start-btn');
  if (sessBtn) sessBtn.onclick = () => {
    const topic = getNewTopic();
    if (topic) startSession(topic.id);
    else toast('Đã hết topic mới — focus reviews');
  };
}

// ============= INIT =============
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  render();
  // Auto-save every 30s
  setInterval(saveState, 30000);
  console.log('Shadow English OS v3 loaded · State engine active ✨');
  console.log('State:', state);
});

// Expose for debug
window.shadowEN = { state, render, awardXP, completeSession, startSession, completeReview, toast, reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); } };

// ============================================================
// SHADOW ENGLISH v4 — Real Views + Real Content
// (Appended to app.js — see app.js for state engine)
// ============================================================

// ============= REVIEW MODAL =============
function showReviewModal(topicId) {
  const t = state.topics.find(x => x.id === topicId);
  if (!t) return;
  const content = SHADOW_CONTENT.getContent(topicId);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal review-modal">
      <button class="modal-close">×</button>
      <div class="modal-head">
        <div class="modal-emoji">${t.emoji}</div>
        <div>
          <div class="modal-stage">${t.reviewStage} · ${t.memoryStatus.toUpperCase()}</div>
          <h2>${t.name}</h2>
          <div class="modal-sub">Level ${t.level} · Mastery ${t.masteryPct}%</div>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">🎧 SHADOW SCRIPT</div>
        <div class="shadow-script">${content.shadow_script || '(Coming soon)'}</div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">🧠 ACTIVE RECALL — Tự nói lại không nhìn</div>
        <ul class="recall-list">${(content.active_recall || []).map(q => `<li>${q}</li>`).join('') || '<li>Tự nói lại bằng cảm nhận</li>'}</ul>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">📊 Confidence sau review (1-5)</div>
        <div class="conf-buttons">
          ${[1,2,3,4,5].map(n => `<button class="conf-btn conf-${n}" data-conf="${n}">${n}<small>${['Forgot','Weak','OK','Good','Reflex'][n-1]}</small></button>`).join('')}
        </div>
      </div>
      <div class="modal-foot">
        <button class="step-btn" data-action="cancel">Cancel</button>
        <button class="step-btn primary" data-action="full">Open full topic →</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  const close = () => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 300); };
  overlay.querySelector('.modal-close').onclick = close;
  overlay.querySelector('[data-action="cancel"]').onclick = close;
  overlay.querySelector('[data-action="full"]').onclick = () => { close(); openTopic(topicId); };
  overlay.querySelectorAll('.conf-btn').forEach(btn => {
    btn.onclick = () => { completeReview(topicId, parseInt(btn.dataset.conf)); close(); };
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}
// Override quickReview to use modal
window.quickReview = showReviewModal;

// ============= TOPIC DETAIL VIEW =============
function openTopic(topicId) {
  state.currentTopicId = topicId;
  navigate('topic-detail');
}

function renderTopicDetail() {
  const id = state.currentTopicId;
  if (!id) return;
  const t = state.topics.find(x => x.id === id);
  if (!t) return;
  const c = SHADOW_CONTENT.getContent(id);
  const view = document.getElementById('view-topic-detail');
  if (!view) return;
  view.innerHTML = `
    <div class="topic-hero" style="grid-column:span 5">
      <div class="topic-hero-left">
        <div class="topic-emoji-big">${t.emoji}</div>
        <div>
          <div class="topic-stage-tag day-tag day-${t.reviewStage.replace('Day ','')}">${t.reviewStage}</div>
          <h1>${t.name}</h1>
          <div class="topic-sub">Level ${t.level} · ${t.memoryStatus} · ${t.sessions} sessions completed</div>
          <div class="mastery-bar"><div class="mastery-fill" style="width:${t.masteryPct}%"></div></div>
          <div class="topic-meta">Mastery <b>${t.masteryPct}%</b> · Next review ${t.nextReview ? new Date(t.nextReview).toLocaleDateString('vi-VN') : 'After first session'}</div>
        </div>
      </div>
      <div class="topic-hero-actions">
        <button class="mission-btn" data-action="start-session" data-topic="${id}">▶ START SESSION</button>
        <button class="step-btn" data-action="review" data-topic="${id}">🔁 Quick Review</button>
        <button class="step-btn" data-action="back">← All Topics</button>
      </div>
    </div>

    <div class="card" style="grid-column:span 5">
      <div class="card-title">🤔 WHY THIS TOPIC?</div>
      <p style="color:var(--text-2);font-size:13px;margin-top:6px">${c.why}</p>
      <div class="card-title" style="margin-top:14px">🎬 THE SCENE</div>
      <p style="color:var(--text-2);font-size:13px;margin-top:6px">${c.scene}</p>
    </div>

    <div class="card" style="grid-column:span 5">
      <div class="card-title">💬 CORE PHRASES</div>
      ${renderPhraseGroup('Before', c.phrases?.before)}
      ${renderPhraseGroup('During', c.phrases?.during)}
      ${renderPhraseGroup('After', c.phrases?.after)}
    </div>

    ${(c.dialogues || []).length > 0 ? `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">🎭 DIALOGUES</div>
      ${c.dialogues.map(d => `
        <div class="dialogue-box">
          <div class="dialogue-title">${d.title}</div>
          ${d.lines.map(line => `<div class="dialogue-line"><b>${line[0]}:</b> ${line[1]}</div>`).join('')}
        </div>
      `).join('')}
    </div>` : ''}

    <div class="card" style="grid-column:span 5">
      <div class="card-title">🎧 SHADOWING SCRIPT</div>
      <div class="shadow-script-box">${c.shadow_script || '(Will be added)'}</div>
      <div style="font-size:11px;color:var(--text-3);margin-top:8px">Đọc to script này ×3 lần, ghi âm + so sánh giọng mình với native speaker.</div>
    </div>

    <div class="card" style="grid-column:span 3">
      <div class="card-title">🚀 REAL LIFE MISSIONS</div>
      <ul class="mission-list-clean">${(c.missions || []).map(m => `<li>${m}</li>`).join('') || '<li>Coming soon</li>'}</ul>
    </div>
    <div class="card" style="grid-column:span 2">
      <div class="card-title">🧠 ACTIVE RECALL</div>
      <ul class="mission-list-clean">${(c.active_recall || []).map(q => `<li>${q}</li>`).join('') || '<li>Coming soon</li>'}</ul>
    </div>
  `;

  view.querySelector('[data-action="start-session"]').onclick = () => startSession(id);
  view.querySelector('[data-action="review"]').onclick = () => showReviewModal(id);
  view.querySelector('[data-action="back"]').onclick = () => navigate('topics');
}
function renderPhraseGroup(label, arr) {
  if (!arr || arr.length === 0) return '';
  return `
    <div class="phrase-group">
      <div class="phrase-group-title">${label === 'Before' ? '🟢' : label === 'During' ? '🔵' : '🟣'} ${label.toUpperCase()}</div>
      <div class="phrase-rows">
        ${arr.map(([en, vi]) => `<div class="phrase-row"><span class="phrase-en">${en}</span><span class="phrase-vi">${vi}</span></div>`).join('')}
      </div>
    </div>
  `;
}

// ============= LEVEL PAGES =============
function renderLevelPage(level) {
  const view = document.getElementById('view-level' + level);
  if (!view) return;
  const topics = state.topics.filter(t => t.level === level);
  const completed = topics.filter(t => t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic').length;
  const titles = { 1: 'Survival Communication', 2: 'Social Communication', 3: 'Advanced Communication' };
  const colors = { 1: '#3b82f6', 2: '#22c55e', 3: '#a78bfa' };
  const descs = {
    1: 'Giao tiếp cơ bản hàng ngày — Restaurant · Taxi · Hotel · Airport · Shopping · Emergency',
    2: 'Giao tiếp xã hội tự nhiên — Small Talk · Work · Travel · Culture · Opinions · Plans',
    3: 'Giao tiếp chuyên sâu — Presentations · Negotiation · Interviews · Business · Debate'
  };
  view.innerHTML = `
    <div class="level-hero" style="grid-column:span 5;border-left:6px solid ${colors[level]}">
      <div>
        <div class="level-badge" style="background:${colors[level]}">LEVEL ${level}</div>
        <h1>${titles[level]}</h1>
        <div class="topic-sub">${topics.length} topics · ${completed} mastered (${Math.round(completed/topics.length*100)}%)</div>
        <p style="color:var(--text-2);font-size:13px;margin-top:6px">${descs[level]}</p>
      </div>
      <div class="level-progress-ring">
        <div class="ring-num">${Math.round(completed/topics.length*100)}%</div>
      </div>
    </div>
    <div class="topics-grid" style="grid-column:span 5">
      ${topics.map(t => renderTopicCard(t)).join('')}
    </div>
  `;
  view.querySelectorAll('[data-topic]').forEach(el => {
    el.onclick = () => openTopic(el.dataset.topic);
  });
}

function renderTopicCard(t) {
  const c = SHADOW_CONTENT.getContent(t.id);
  const phraseCount = (c.phrases?.before?.length || 0) + (c.phrases?.during?.length || 0) + (c.phrases?.after?.length || 0);
  const memColor = { 'Fragile':'#ef4444','Weak':'#ff8a3d','Building':'#facc15','Stable':'#22c55e','Automatic':'#a78bfa' }[t.memoryStatus];
  return `
    <div class="topic-card-real" data-topic="${t.id}">
      <div class="topic-card-head">
        <div class="topic-card-emoji">${t.emoji}</div>
        <div class="topic-card-mem" style="background:${memColor}20;color:${memColor}">${t.memoryStatus}</div>
      </div>
      <div class="topic-card-name">${t.name}</div>
      <div class="topic-card-sub">${phraseCount} phrases · ${t.sessions} sessions</div>
      <div class="mastery-bar"><div class="mastery-fill" style="width:${t.masteryPct}%;background:${memColor}"></div></div>
      <div class="topic-card-foot">
        <span class="day-tag day-${t.reviewStage.replace('Day ','')}">${t.reviewStage}</span>
        <span style="font-size:11px;color:var(--text-3)">${t.masteryPct}% mastered</span>
      </div>
    </div>
  `;
}

// ============= TOPICS DATABASE =============
function renderTopicsAll() {
  const view = document.getElementById('view-topics');
  if (!view) return;
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">📚 TOPICS DATABASE  ·  ${state.topics.length} total</div>
      <div class="topic-filters">
        <select id="filter-level"><option value="">All Levels</option><option value="1">🔵 Level 1</option><option value="2">🟢 Level 2</option><option value="3">🟣 Level 3</option></select>
        <select id="filter-mem"><option value="">All Memory</option><option>Fragile</option><option>Weak</option><option>Building</option><option>Stable</option><option>Automatic</option></select>
        <input id="filter-search" placeholder="🔍 Search topic..." />
      </div>
    </div>
    <div class="topics-grid" id="topics-grid" style="grid-column:span 5"></div>
  `;
  const grid = view.querySelector('#topics-grid');
  function applyFilter() {
    const lvl = view.querySelector('#filter-level').value;
    const mem = view.querySelector('#filter-mem').value;
    const q = view.querySelector('#filter-search').value.toLowerCase();
    let topics = state.topics;
    if (lvl) topics = topics.filter(t => t.level == lvl);
    if (mem) topics = topics.filter(t => t.memoryStatus === mem);
    if (q) topics = topics.filter(t => t.name.toLowerCase().includes(q));
    grid.innerHTML = topics.map(t => renderTopicCard(t)).join('');
    grid.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => openTopic(el.dataset.topic));
  }
  view.querySelector('#filter-level').onchange = applyFilter;
  view.querySelector('#filter-mem').onchange = applyFilter;
  view.querySelector('#filter-search').oninput = applyFilter;
  applyFilter();
}

// ============= PROGRESS / CALENDAR / MEMORY / STATS =============
function renderProgressPage() {
  const view = document.getElementById('view-progress');
  if (!view) return;
  const sessionsByDay = {};
  state.sessionsLog.forEach(s => {
    const d = new Date(s.at).toDateString();
    sessionsByDay[d] = (sessionsByDay[d] || 0) + 1;
  });
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ date: d, count: sessionsByDay[d.toDateString()] || 0 });
  }
  const max = Math.max(1, ...days.map(d => d.count));
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">📈 PROGRESS TRACKER  ·  Last 14 days</div>
      <div class="bar-chart">
        ${days.map(d => `
          <div class="bar-col">
            <div class="bar" style="height:${(d.count/max)*100}%" title="${d.count} sessions"></div>
            <div class="bar-label">${d.date.getDate()}/${d.date.getMonth()+1}</div>
            <div class="bar-count">${d.count}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="grid-column:span 2">
      <div class="card-title">📊 STATS</div>
      <div class="stat-list">
        <div><b>${state.user.level}</b><span>Level</span></div>
        <div><b>${state.user.xp.toLocaleString()}</b><span>Current XP</span></div>
        <div><b>${state.user.streak}</b><span>Day streak</span></div>
        <div><b>${state.sessionsLog.length}</b><span>Total sessions</span></div>
      </div>
    </div>
    <div class="card" style="grid-column:span 3">
      <div class="card-title">🏆 ACHIEVEMENTS</div>
      <div class="achv-grid">
        ${renderAchv('🔥 First Streak', state.user.streak >= 1)}
        ${renderAchv('🎯 First Session', state.sessionsLog.length >= 1)}
        ${renderAchv('💯 100 XP', state.user.xp + (state.user.level-1)*100 >= 100)}
        ${renderAchv('📚 5 Topics', state.topics.filter(t => t.sessions > 0).length >= 5)}
        ${renderAchv('🌟 First Stable', state.topics.some(t => t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic'))}
        ${renderAchv('🧠 First Automatic', state.topics.some(t => t.memoryStatus === 'Automatic'))}
        ${renderAchv('🔥 7-day Streak', state.user.streak >= 7)}
        ${renderAchv('⚡ Level 5', state.user.level >= 5)}
      </div>
    </div>
  `;
}
function renderAchv(name, unlocked) {
  return `<div class="achv ${unlocked ? 'unlocked' : ''}"><div class="achv-name">${name}</div><div class="achv-state">${unlocked ? '✓ Unlocked' : 'Locked'}</div></div>`;
}

function renderCalendarPage() {
  const view = document.getElementById('view-calendar');
  if (!view) return;
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const startDow = (first.getDay() + 6) % 7;
  // Map nextReview by date
  const reviewByDate = {};
  state.topics.forEach(t => {
    if (t.nextReview) {
      const d = new Date(t.nextReview);
      if (d.getMonth() === m && d.getFullYear() === y) {
        const key = d.getDate();
        if (!reviewByDate[key]) reviewByDate[key] = [];
        reviewByDate[key].push(t);
      }
    }
  });
  const monthName = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m];
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">📅 REVIEW CALENDAR  ·  ${monthName} ${y}</div>
      <div class="cal-big-head">
        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="cal-big-dow">${d}</div>`).join('')}
      </div>
      <div class="cal-big-grid">
        ${Array(startDow).fill('<div class="cal-big-empty"></div>').join('')}
        ${Array.from({length:daysInMonth}, (_, i) => {
          const d = i + 1;
          const reviews = reviewByDate[d] || [];
          const isToday = d === now.getDate();
          return `<div class="cal-big-day ${isToday?'today':''} ${reviews.length?'has':''}">
            <div class="cal-big-num">${d}</div>
            ${reviews.length ? `<div class="cal-big-count">${reviews.length}</div>` : ''}
            ${reviews.slice(0,2).map(t => `<div class="cal-big-topic">${t.emoji} ${t.name.substring(0,12)}</div>`).join('')}
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderMemoryPage() {
  const view = document.getElementById('view-memory');
  if (!view) return;
  const groups = { Fragile:[], Weak:[], Building:[], Stable:[], Automatic:[] };
  state.topics.forEach(t => groups[t.memoryStatus].push(t));
  const colors = { 'Fragile':'#ef4444','Weak':'#ff8a3d','Building':'#facc15','Stable':'#22c55e','Automatic':'#a78bfa' };
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">🧠 MEMORY LOG  ·  All 32 topics by status</div>
      <p style="color:var(--text-2);font-size:13px;margin-top:6px">Click 1 topic để mở chi tiết hoặc review.</p>
    </div>
    ${Object.entries(groups).map(([status, topics]) => `
      <div class="card memory-group" style="grid-column:span 5;border-left:6px solid ${colors[status]}">
        <div class="card-title" style="color:${colors[status]}">${status.toUpperCase()}  ·  ${topics.length} topic${topics.length !== 1 ? 's' : ''}</div>
        ${topics.length === 0 ? '<div style="color:var(--text-3);font-size:11px;padding:6px 0">Empty</div>' :
          `<div class="memory-list">${topics.map(t => `
            <div class="memory-item" data-topic="${t.id}">
              <span>${t.emoji} ${t.name}</span>
              <span class="day-tag day-${t.reviewStage.replace('Day ','')}">${t.reviewStage}</span>
              <span style="color:var(--text-3);font-size:11px">${t.masteryPct}%</span>
            </div>
          `).join('')}</div>`}
      </div>
    `).join('')}
  `;
  view.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => openTopic(el.dataset.topic));
}

function renderStatsPage() {
  const view = document.getElementById('view-stats');
  if (!view) return;
  const total = state.topics.length;
  const completed = state.topics.filter(t => t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic').length;
  const totalSessions = state.sessionsLog.length;
  const reviews = state.sessionsLog.filter(s => s.type === 'review').length;
  const sessions = state.sessionsLog.filter(s => s.type === 'session').length;
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">📊 STATISTICS  ·  Full snapshot</div>
    </div>
    <div class="card" style="grid-column:span 2"><div class="big-stat"><div class="big-num">${state.user.level}</div><div class="big-lbl">Current Level</div></div></div>
    <div class="card" style="grid-column:span 2"><div class="big-stat"><div class="big-num">${state.user.streak}</div><div class="big-lbl">Day Streak</div></div></div>
    <div class="card" style="grid-column:span 1"><div class="big-stat"><div class="big-num">${state.user.xp}</div><div class="big-lbl">XP this level</div></div></div>
    <div class="card" style="grid-column:span 2"><div class="big-stat"><div class="big-num">${completed}/${total}</div><div class="big-lbl">Topics Mastered</div></div></div>
    <div class="card" style="grid-column:span 1"><div class="big-stat"><div class="big-num">${totalSessions}</div><div class="big-lbl">Total Actions</div></div></div>
    <div class="card" style="grid-column:span 1"><div class="big-stat"><div class="big-num">${reviews}</div><div class="big-lbl">Reviews Done</div></div></div>
    <div class="card" style="grid-column:span 1"><div class="big-stat"><div class="big-num">${sessions}</div><div class="big-lbl">Sessions Done</div></div></div>
    <div class="card" style="grid-column:span 5">
      <div class="card-title">📋 RECENT ACTIVITY</div>
      ${state.sessionsLog.length === 0 ? '<div style="color:var(--text-3);padding:10px 0;font-size:12px">No activity yet — bắt đầu 1 session đi</div>' : `
        <div class="activity-list">${state.sessionsLog.slice(-15).reverse().map(s => {
          const t = state.topics.find(x => x.id === s.topicId);
          return `<div class="activity-row">
            <span>${s.type === 'session' ? '▶️ Session' : '🔁 Review'}</span>
            <span>${t ? t.emoji + ' ' + t.name : s.topicId}</span>
            <span style="color:var(--text-3);font-size:11px;margin-left:auto">${new Date(s.at).toLocaleString('vi-VN')}</span>
          </div>`;
        }).join('')}</div>`}
    </div>
  `;
}

function renderMissionsPage() {
  const view = document.getElementById('view-missions');
  if (!view) return;
  const today = new Date().toDateString();
  if (state.missions.date !== today) {
    state.missions = { date: today, items: DEFAULT_MISSIONS.map(t => ({task: t, done: false})) };
    saveState();
  }
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">🎯 MISSIONS  ·  Today</div>
      <p style="color:var(--text-2);font-size:13px;margin-top:6px">Mỗi mission hoàn thành = +20 XP. Mission được reset mỗi ngày.</p>
      <div class="missions-detail" id="missions-detail">
        ${state.missions.items.map((m, i) => `
          <div class="mission-card ${m.done ? 'done' : ''}" data-mission="${i}">
            <span class="mission-check"></span>
            <span class="name">${m.task}</span>
            <span class="reward">+20 XP</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="grid-column:span 5">
      <div class="card-title">🌟 TOPIC-SPECIFIC MISSIONS</div>
      <p style="color:var(--text-2);font-size:13px;margin-top:6px">Real-life missions từng topic — click topic để xem chi tiết.</p>
      <div class="topics-grid" style="margin-top:10px">
        ${state.topics.slice(0, 6).map(t => renderTopicCard(t)).join('')}
      </div>
    </div>
  `;
  view.querySelectorAll('[data-mission]').forEach(el => el.onclick = () => { toggleMission(parseInt(el.dataset.mission)); renderMissionsPage(); });
  view.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => openTopic(el.dataset.topic));
}

function renderPhrasesPage() {
  const view = document.getElementById('view-phrases');
  if (!view) return;
  const all = SHADOW_CONTENT.getAllPhrases();
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">💬 PHRASES BANK  ·  ${all.length} phrases across ${Object.keys(SHADOW_CONTENT.TOPIC_CONTENT).length} topics</div>
      <input id="phrase-search" placeholder="🔍 Search phrase (EN or VI)..." style="width:100%;margin-top:6px;padding:8px 12px;background:var(--card-2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px" />
    </div>
    <div class="card" style="grid-column:span 5">
      <div class="phrase-bank-list" id="phrase-bank-list"></div>
    </div>
  `;
  const listEl = view.querySelector('#phrase-bank-list');
  function render(q='') {
    const filtered = q ? all.filter(p => p.en.toLowerCase().includes(q.toLowerCase()) || p.vi.toLowerCase().includes(q.toLowerCase())) : all;
    listEl.innerHTML = filtered.slice(0, 100).map(p => {
      const t = state.topics.find(x => x.id === p.topicId);
      return `<div class="phrase-bank-row" data-topic="${p.topicId}">
        <span class="phrase-en">${p.en}</span>
        <span class="phrase-vi">${p.vi}</span>
        <span class="phrase-topic">${t ? t.emoji + ' ' + t.name : p.topicId}</span>
      </div>`;
    }).join('');
    if (filtered.length > 100) listEl.innerHTML += `<div style="text-align:center;color:var(--text-3);padding:10px;font-size:11px">+${filtered.length - 100} more...</div>`;
    listEl.querySelectorAll('[data-topic]').forEach(el => el.onclick = () => openTopic(el.dataset.topic));
  }
  view.querySelector('#phrase-search').oninput = (e) => render(e.target.value);
  render();
}

function renderResourcesPage() {
  const view = document.getElementById('view-resources');
  if (!view) return;
  view.innerHTML = `
    <div class="card" style="grid-column:span 5">
      <div class="card-title">📚 RESOURCES  ·  Tools to deepen learning</div>
    </div>
    <div class="card" style="grid-column:span 2">
      <div class="card-title">🗣️ REAL ENGLISH</div>
      <p style="color:var(--text-2);font-size:13px;margin-top:8px">Native-speaker phrases tự nhiên hơn version sách giáo khoa.</p>
      <ul class="mission-list-clean">
        <li>"I would like" → "I'd like"</li>
        <li>"Let me see" → "Lemme see"</li>
        <li>"I want to" → "I wanna"</li>
        <li>"Going to" → "Gonna"</li>
        <li>"Got to" → "Gotta"</li>
      </ul>
    </div>
    <div class="card" style="grid-column:span 3">
      <div class="card-title">🎙️ PRONUNCIATION TIPS</div>
      <ul class="mission-list-clean">
        <li><b>Th sound:</b> Lưỡi chạm răng cửa — thank, think, that</li>
        <li><b>R sound:</b> Lưỡi không chạm trên — red, run, ride</li>
        <li><b>Linking:</b> "Want to" → "wanna", "Got to" → "gotta"</li>
        <li><b>Stress:</b> Nhấn vào content words, không function words</li>
        <li><b>Rhythm:</b> Tiếng Anh là stress-timed, không syllable-timed</li>
      </ul>
    </div>
    <div class="card" style="grid-column:span 5">
      <div class="card-title">🎧 RECOMMENDED LISTENING</div>
      <ul class="mission-list-clean">
        <li><b>BBC 6-minute English</b> — Slow pace, real topics</li>
        <li><b>TED Talks (with subtitle)</b> — Inspirational + clear English</li>
        <li><b>Friends / How I Met Your Mother</b> — Daily social English</li>
        <li><b>Podcast: All Ears English</b> — Conversational learning</li>
        <li><b>YouTube: English Addict with Mr Steve</b> — Live engagement</li>
      </ul>
    </div>
  `;
}

// ============= NAVIGATE OVERRIDE =============
const NAV_RENDERS = {
  'topic-detail': renderTopicDetail,
  'level1': () => renderLevelPage(1),
  'level2': () => renderLevelPage(2),
  'level3': () => renderLevelPage(3),
  'topics': renderTopicsAll,
  'progress': renderProgressPage,
  'calendar': renderCalendarPage,
  'memory': renderMemoryPage,
  'stats': renderStatsPage,
  'missions': renderMissionsPage,
  'phrases': renderPhrasesPage,
  'resources': renderResourcesPage
};

const _origNavigate = window.navigate;
window.navigate = function(viewId) {
  let target = document.getElementById('view-' + viewId);
  if (!target) {
    // Create view container if not exists
    const grid = document.querySelector('.content');
    if (grid) {
      target = document.createElement('div');
      target.className = 'view';
      target.id = 'view-' + viewId;
      grid.appendChild(target);
    }
  }
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');
  const bc = document.querySelector('.current');
  if (bc) bc.textContent = navItem ? navItem.textContent.trim() : viewId;
  window.scrollTo({top: 0, behavior: 'smooth'});
  // Run page-specific render
  if (NAV_RENDERS[viewId]) NAV_RENDERS[viewId]();
};

// ============= SESSION VIEW UPGRADE =============
const _origRenderSessionView = renderSessionView;
window.renderSessionView = function() {
  const view = document.getElementById('view-session');
  if (!view) return;
  const cs = state.currentSession;
  const topic = cs ? state.topics.find(t => t.id === cs.topicId) : (getNewTopic() || state.topics[0]);
  if (!topic) return;
  const c = SHADOW_CONTENT.getContent(topic.id);
  const step = cs ? cs.step : 1;
  const steps = [
    { num: 1, icon: '👂', name: 'NGHE', time: '10 min', desc: 'Input: nghe shadow script + đọc phrases · KHÔNG nói vội' },
    { num: 2, icon: '🎧', name: 'SHADOW', time: '15 min', desc: 'Nghe + nói cùng lúc · Bắt chước intonation 100% · ×3 lần' },
    { num: 3, icon: '🔁', name: 'REPEAT', time: '10 min', desc: 'Tự nói lại từng phrase to ra · Ghi âm + so sánh giọng' },
    { num: 4, icon: '🧠', name: 'RECALL', time: '15 min', desc: 'Đóng app · Tự nói lại theo Active Recall questions · KHÔNG NHÌN' },
    { num: 5, icon: '🌍', name: 'APPLY', time: '12 min', desc: 'Real-life mission: dùng phrase ngoài đời THẬT · không chỉ học trên app' }
  ];
  view.innerHTML = `
    <div class="session-hero">
      <div class="session-emoji">${topic.emoji}</div>
      <div class="session-meta">
        <div class="session-stage">${topic.reviewStage}  ·  ${topic.memoryStatus.toUpperCase()}</div>
        <div class="session-title">${topic.name}</div>
        <div class="session-sub">Level ${topic.level} · ~62 phút · ${(c.phrases?.before?.length||0)+(c.phrases?.during?.length||0)+(c.phrases?.after?.length||0)} phrases · ${c.missions?.length||0} missions</div>
      </div>
      <div class="session-progress-ring" style="background: conic-gradient(#7c5cff ${((step-1)/5)*100}%, #2a2750 ${((step-1)/5)*100}%)">
        <span>${step-1}/5</span><small>steps</small>
      </div>
    </div>
    <div class="session-steps">
      ${steps.map(s => `
        <div class="session-step ${s.num<step?'done':s.num===step?'active':''}">
          <div class="step-num">${s.num<step?'✓':s.num}</div>
          <div class="step-body">
            <div class="step-title">${s.icon} ${s.name}  ·  ${s.time}</div>
            <div class="step-desc">${s.desc}</div>
            ${s.num === step ? renderStepContent(s.num, topic, c) : ''}
          </div>
          ${s.num < step ? '<button class="step-btn" disabled>✓ Done</button>' :
            s.num === step ? `<button class="step-btn primary" data-action="next-step">${s.num===5?'Complete Session →':'Mark Done · +30 XP'}</button>` :
            '<button class="step-btn" disabled>Locked</button>'}
        </div>
      `).join('')}
    </div>
    <div class="card" style="grid-column:span 5;margin-top:8px">
      <div class="card-title">💬 PHRASES TRONG TOPIC NÀY</div>
      ${renderPhraseGroup('Before', c.phrases?.before)}
      ${renderPhraseGroup('During', c.phrases?.during)}
      ${renderPhraseGroup('After', c.phrases?.after)}
    </div>
  `;
  const nextBtn = view.querySelector('[data-action="next-step"]');
  if (nextBtn) nextBtn.onclick = advanceStep;
};

function renderStepContent(stepNum, topic, c) {
  if (stepNum === 1) {
    return `<div class="step-content">
      <div class="step-block"><b>👂 INPUT PHASE — Chỉ nghe + đọc, KHÔNG nói vội</b></div>
      <div class="step-block"><b>WHY:</b> ${c.why}</div>
      <div class="step-block"><b>SCENE:</b> ${c.scene}</div>
      <div class="step-block"><b>Total phrases:</b> ${(c.phrases?.before?.length||0)+(c.phrases?.during?.length||0)+(c.phrases?.after?.length||0)}</div>
      <div class="step-tip">💡 Hôm nay anh chỉ tiếp xúc với input. Quen với rhythm + intonation. Đừng cố nhớ.</div>
    </div>`;
  }
  if (stepNum === 2) {
    return `<div class="step-content">
      <div class="step-block"><b>🎧 SHADOW PHASE — Nghe + nói CÙNG LÚC</b></div>
      <div class="shadow-box">"${c.shadow_script || ''}"</div>
      <div class="step-block"><b>Quy tắc:</b>
        <ul><li>Lặp ×3 lần, không quá 1 giây sau native speaker</li>
        <li>Bắt chước 100% intonation, không quan tâm nghĩa</li>
        <li>Ghi âm lần 3 → so sánh</li></ul>
      </div>
    </div>`;
  }
  if (stepNum === 3) {
    return `<div class="step-content">
      <div class="step-block"><b>🔁 REPEAT PHASE — Tự nói từng phrase, không có audio</b></div>
      <div class="step-block">Đọc to ra từng phrase, ghi âm, nghe lại. Compare với shadow script.</div>
      <div class="step-tip">💡 Đây là lúc anh chuyển từ "imitator" sang "producer". Quan trọng hơn step 2.</div>
    </div>`;
  }
  if (stepNum === 4) {
    return `<div class="step-content">
      <div class="step-block"><b>🧠 RECALL PHASE — ĐÓNG APP. Trả lời bằng miệng.</b></div>
      <div class="step-block"><b>Active Recall Questions:</b>
        <ul>${(c.active_recall||[]).map(q=>`<li>${q}</li>`).join('')}</ul>
      </div>
      <div class="step-tip">💡 KHÔNG nhìn lại phrases. Nói được = phrases bắt đầu vào memory. Quên = OK, bộ não đang work.</div>
    </div>`;
  }
  if (stepNum === 5) {
    return `<div class="step-content">
      <div class="step-block"><b>🌍 APPLY PHASE — Dùng OUTSIDE app, ngoài đời THẬT</b></div>
      <div class="step-block"><b>Pick 1 mission để làm hôm nay:</b>
        <ul>${(c.missions||[]).map(m=>`<li>${m}</li>`).join('')}</ul>
      </div>
      <div class="step-tip">💡 Đây là step quan trọng nhất. Phrase chưa dùng thật = chưa thuộc. Click Complete khi đã làm xong 1 mission.</div>
    </div>`;
  }
  return '';
}

console.log('Shadow English v4 loaded — Real content + Real views ✨');
