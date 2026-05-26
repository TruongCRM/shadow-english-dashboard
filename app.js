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

