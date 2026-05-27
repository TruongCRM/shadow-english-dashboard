# 🌙 V11.2 REDESIGN BLUEPRINT — Living Memory Recovery System

> **Phase: v11.2 ARCHITECTURAL REDESIGN** (not v11.1.x polish patches).
> **Scope: 3 cards rewritten from scratch** — HERO STATS, TODAY GOAL, MEMORY STATUS.
> **North Star:** *NOT analytics dashboard. IS calm living English recovery system.*

**Author:** Claude (Cowork mode) cho Dương Trường
**Date:** 2026-05-27 (Day 1 evening — after Wave 5 failure)
**Status:** DRAFT — pending Day 2 morning review + sign-off

---

## 0. WHY THIS DOCUMENT EXISTS

### What failed in Day 1

Hôm nay tôi ship **6 versions** (v11.1.9 → v11.1.14) trong observation week. Sau Wave 4 anh đưa brief redesign chi tiết cho HERO STATS / TODAY GOAL / MEMORY STATUS. Tôi response bằng cách:

1. **v11.1.13** — add hero roadmap (streak dots + XP bar)
2. **v11.1.12** — render mission checklist trong TODAY card
3. **v11.1.13** — try cleanup TODAY GOAL layout

**Anh nhìn vào UI sau Wave 5 → vẫn fail.** Quote:
> "UI thực tế hiện tại vẫn chưa match đúng direction đã mô tả. Vấn đề không phải thiếu component, mà là system vẫn đang render như analytics dashboard thay vì living English recovery system."

### Root cause (system view)

Tôi áp dụng SAI METHODOLOGY:

```
SAI:  brief emotional → spec dimensions → patch CSS lên DOM cũ
ĐÚNG: brief emotional → understand DOM architecture → rewrite DOM + CSS + behavior
```

v11.1.x = **polish layer trên architecture cũ**. Architecture cũ render "stats panel" theo paradigm:
- HERO STATS = row 5 stat cards (NEW TOPIC / STREAK / XP / TIME / MASTERY)
- TODAY GOAL = task widget với 2/3 + checkboxes
- MEMORY STATUS = donut chart + numbers + decorative heatmap

Polish patches add VENEER lên trên (streak dots, purple gradient, mission list). Không thay đổi paradigm. Result = vẫn cảm thấy "analytics with ribbon".

### What this blueprint does differently

1. **HTML mockup CONCRETE** — copy-paste-ready, không phải ASCII art
2. **CSS spec FULL** — mọi class, mọi pixel, mọi keyframe
3. **Vietnamese copy library SIGNED-OFF** — anh chọn 3-5 strings trước khi code
4. **Motion concrete keyframes** — không phải "subtle pulse"
5. **Mobile breakpoint specific** — 900px + 600px
6. **Acceptance criteria emotional** — cách verify "feel right"
7. **Single deploy plan** — 1 file `app_v11_2_redesign.js`, NO patch on top

### Implementation gate

**KHÔNG ship code trước khi:**
- [ ] Anh review từng HTML mockup + sign-off
- [ ] Anh chọn copy strings (3 sections × ~5 strings each)
- [ ] Anh confirm acceptance criteria
- [ ] Observation week ends OR anh explicitly override Day 7

---

## 1. HERO STATS — LIVING IDENTITY BLOCK

### 1.1 Vision (anh viết)

> *"Identity + Journey + Momentum"*
>
> Người dùng phải cảm thấy:
> - mình đang tiến lên
> - mình đang thay đổi mỗi ngày
> - tiếng Anh đang dần quay lại
> - hệ thống đang sống

### 1.2 Failure analysis — v11.1.13 hero roadmap

| Symptom | Why it failed |
|---|---|
| Streak dots tiny (14px) + 14 empty dots looking "dead" | Visual debt — empty future-state dominates the visual; brain sees "incomplete" not "progress" |
| XP bar full-width 1280px → 200px LV chip drowning | No visual hierarchy; XP bar = afterthought |
| Card height ~167px with 80% empty space | Architecture issue — card was designed as single-row stat slot, not 3-column identity space |
| "1 days · Keep going" generic copy | Doesn't address identity; could be any habit tracker |
| No visual journey representation | Streak dots = checkbox list, not journey |

### 1.3 NEW STRUCTURE — 3 columns

```
┌──────────────────────────────────────────────────────────────────────┐
│ HERO STATS                                            height 220px   │
├──────────────────────┬──────────────────────────┬────────────────────┤
│ LEFT — IDENTITY      │ CENTER — MEMORY JOURNEY  │ RIGHT — LIVING NOW │
│ 28% (~336px)         │ 44% (~528px)             │ 28% (~336px)       │
│                      │                          │                    │
│ 🌙 Shadow            │ ●──────●──────●──────●   │ ✦ 1 review due    │
│   Apprentice         │ │      │      │      │   │ ✦ 32 fragile      │
│                      │ Begin  Survive Respond   │   memories         │
│ Day 3                │            ↑ Flow        │ ✦ Brain: Clear     │
│ rebuilding your      │      (current glow)      │ ✦ Speaking:        │
│ English reflex       │                          │   Building         │
│                      │ "Memory is forming.      │                    │
│ ━━━━━━━━━━           │  Keep going."            │                    │
│                      │                          │                    │
│ "You are not         │                          │                    │
│  starting.           │                          │                    │
│  You are             │                          │                    │
│  remembering."       │                          │                    │
└──────────────────────┴──────────────────────────┴────────────────────┘
```

### 1.4 HTML MOCKUP (concrete)

```html
<div class="card hero-living" data-section-id="hero-stats">
  <div class="hero-grid">

    <!-- LEFT: IDENTITY -->
    <div class="hero-identity">
      <div class="hero-identity-tier">
        <span class="tier-icon">🌙</span>
        <span class="tier-name">Shadow Apprentice</span>
      </div>
      <div class="hero-identity-day">
        Day <strong>3</strong> rebuilding<br>your English reflex
      </div>
      <div class="hero-identity-divider"></div>
      <div class="hero-identity-quote">
        "You are not starting.<br>You are remembering."
      </div>
    </div>

    <!-- CENTER: MEMORY JOURNEY -->
    <div class="hero-journey">
      <svg class="journey-line" viewBox="0 0 500 60" preserveAspectRatio="none">
        <!-- Base track -->
        <line x1="20" y1="30" x2="480" y2="30"
              stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
        <!-- Progress fill (up to current milestone) -->
        <line x1="20" y1="30" x2="180" y2="30"
              stroke="url(#journeyGrad)" stroke-width="3"/>
        <defs>
          <linearGradient id="journeyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="rgba(124,92,255,0.6)"/>
            <stop offset="100%" stop-color="rgba(180,140,255,0.95)"/>
          </linearGradient>
        </defs>
      </svg>

      <div class="journey-milestones">
        <div class="milestone done">
          <div class="milestone-dot"></div>
          <div class="milestone-label">Beginner</div>
        </div>
        <div class="milestone current">
          <div class="milestone-dot">
            <div class="milestone-glow"></div>
          </div>
          <div class="milestone-label">Surviving</div>
        </div>
        <div class="milestone">
          <div class="milestone-dot"></div>
          <div class="milestone-label">Responding</div>
        </div>
        <div class="milestone">
          <div class="milestone-dot"></div>
          <div class="milestone-label">Flowing</div>
        </div>
      </div>

      <div class="journey-status">
        Memory is forming. Keep the daily ritual alive.
      </div>
    </div>

    <!-- RIGHT: LIVING NOW -->
    <div class="hero-momentum">
      <div class="momentum-row">
        <span class="momentum-icon">✦</span>
        <span class="momentum-text">
          <strong>1</strong> review due today
        </span>
      </div>
      <div class="momentum-row">
        <span class="momentum-icon">✦</span>
        <span class="momentum-text">
          <strong>32</strong> fragile memories
        </span>
      </div>
      <div class="momentum-row">
        <span class="momentum-icon">✦</span>
        <span class="momentum-text">
          Brain: <strong class="momentum-state state-clear">Clear</strong>
        </span>
      </div>
      <div class="momentum-row">
        <span class="momentum-icon">✦</span>
        <span class="momentum-text">
          Speaking: <strong class="momentum-state state-building">Building</strong>
        </span>
      </div>
    </div>

  </div>
</div>
```

### 1.5 CSS SPEC (full, ready to ship)

```css
/* ========== HERO LIVING ========== */
.card.hero-living {
  position: relative;
  padding: 32px 36px;
  min-height: 220px;
  background:
    radial-gradient(circle at 20% 30%, rgba(124,92,255,0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(180,140,255,0.04) 0%, transparent 50%),
    var(--card);
  background-size: 200% 200%;
  animation: hero-breathe 14s ease-in-out infinite;
  overflow: hidden;
}

@keyframes hero-breathe {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
}

.hero-grid {
  display: grid;
  grid-template-columns: 28fr 44fr 28fr;
  gap: 40px;
  align-items: center;
  height: 100%;
}

/* === IDENTITY (left) === */
.hero-identity {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-identity-tier {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-identity-tier .tier-icon {
  font-size: 22px;
  filter: drop-shadow(0 0 8px rgba(180,140,255,0.4));
}

.hero-identity-tier .tier-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(180,140,255,0.8));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-identity-day {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255,255,255,0.7);
}

.hero-identity-day strong {
  font-size: 16px;
  color: rgba(255,255,255,0.95);
  font-weight: 700;
  margin: 0 2px;
}

.hero-identity-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(124,92,255,0.25),
    transparent);
  margin: 4px 0;
}

.hero-identity-quote {
  font-size: 13px;
  font-style: italic;
  line-height: 1.55;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.01em;
}

/* === MEMORY JOURNEY (center) === */
.hero-journey {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 8px;
}

.journey-line {
  position: absolute;
  top: 16px;
  left: 0;
  width: 100%;
  height: 60px;
  pointer-events: none;
}

.journey-milestones {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  position: relative;
  z-index: 1;
}

.milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.milestone-dot {
  position: relative;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.10);
  border: 2px solid rgba(255,255,255,0.15);
  transition: all 360ms cubic-bezier(0.4, 0, 0.2, 1);
}

.milestone.done .milestone-dot {
  background: rgba(124,92,255,0.7);
  border-color: rgba(180,140,255,0.85);
  box-shadow: 0 0 8px rgba(124,92,255,0.3);
}

.milestone.current .milestone-dot {
  background: rgba(180,140,255,1);
  border-color: rgba(255,255,255,0.9);
  width: 18px;
  height: 18px;
  margin-top: -2px;
  box-shadow: 0 0 16px rgba(180,140,255,0.6);
}

.milestone-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(180,140,255,0.3);
  transform: translate(-50%, -50%);
  animation: milestone-pulse 2.2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes milestone-pulse {
  0%, 100% {
    width: 24px; height: 24px;
    opacity: 0.5;
  }
  50% {
    width: 40px; height: 40px;
    opacity: 0;
  }
}

.milestone-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
}

.milestone.done .milestone-label,
.milestone.current .milestone-label {
  color: rgba(255,255,255,0.85);
}

.journey-status {
  text-align: center;
  font-size: 12.5px;
  font-style: italic;
  color: rgba(180,140,255,0.7);
  letter-spacing: 0.01em;
  margin-top: 4px;
}

/* === MOMENTUM (right) === */
.hero-momentum {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.momentum-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 200ms ease-out;
}

.momentum-row:hover {
  background: rgba(124,92,255,0.06);
  border-color: rgba(124,92,255,0.15);
}

.momentum-icon {
  color: rgba(180,140,255,0.6);
  font-size: 10px;
  filter: drop-shadow(0 0 4px rgba(180,140,255,0.4));
}

.momentum-text {
  font-size: 12.5px;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.01em;
  flex: 1;
}

.momentum-text strong {
  color: rgba(255,255,255,0.95);
  font-weight: 600;
}

.momentum-state.state-clear { color: rgba(46,160,67,0.9); }
.momentum-state.state-building { color: rgba(250,204,21,0.9); }
.momentum-state.state-fragile { color: rgba(239,68,68,0.85); }
.momentum-state.state-stable { color: rgba(34,197,94,0.9); }

/* === MOBILE === */
@media (max-width: 900px) {
  .card.hero-living {
    padding: 24px 20px;
  }
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hero-identity-quote {
    display: none; /* save vertical space on mobile */
  }
  .journey-milestones {
    margin-top: -8px;
  }
}

@media (max-width: 600px) {
  .hero-identity-tier .tier-name { font-size: 16px; }
  .hero-identity-day { font-size: 12px; }
  .milestone-label { font-size: 9.5px; }
  .momentum-text { font-size: 12px; }
}
```

### 1.6 IDENTITY tier mapping (anh sign-off cụ thể)

State.user.streak → identity tier:

| Streak range | Identity tier name | Icon | Sub-line |
|---|---|---|---|
| 0-2 days | **Shadow Apprentice** | 🌙 | "Day {N} rebuilding your English reflex" |
| 3-6 days | **Shadow Practitioner** | ✦ | "Day {N} · Patterns are forming" |
| 7-13 days | **Shadow Survivor** | ⚡ | "Day {N} · One week of recovery" |
| 14-20 days | **Memory Builder** | 🌟 | "Day {N} · Crossing into stability" |
| 21-29 days | **Reflex Awakener** | 🔥 | "Day {N} · Three weeks alive" |
| 30+ days | **Fluency Path Walker** | ✺ | "Day {N} · Memory has roots" |

**Quote rotation** (1 random from set per session, persists 24h):
- "You are not starting. You are remembering."
- "Tiếng Anh không quên anh. Anh chỉ cần gọi nó lại."
- "Small daily repetitions. Real speaking confidence."
- "Today you choose to remember."
- "Each session is a small return."

### 1.7 JOURNEY milestone mapping

Memory state → current journey position:

```javascript
function journeyPosition(state) {
  var dist = computeMemoryDistribution(state.topics); // { fragile, weak, building, stable, automatic, total }
  var fragilePct = dist.fragile / dist.total;
  var automaticPct = dist.automatic / dist.total;

  if (fragilePct >= 0.85) return 'beginner';   // Most fragile = early days
  if (fragilePct >= 0.5)  return 'surviving';  // Mix fragile + some building
  if (automaticPct >= 0.2 || (dist.stable + dist.automatic) / dist.total >= 0.3) return 'responding';
  if (automaticPct >= 0.5) return 'flowing';   // Mostly automatic
  return 'surviving'; // default
}
```

Journey status text (rotate per position):
- **beginner**: "Just beginning. Every word counts now."
- **surviving**: "Memory is forming. Keep the daily ritual alive."
- **responding**: "Patterns awakening. Speaking gets easier."
- **flowing**: "Your English speaks itself. Trust it."

### 1.8 MOMENTUM data sources

```javascript
function momentumData(state) {
  return {
    reviewsDueToday: state.topics.filter(t =>
      t.nextReview && new Date(t.nextReview) <= new Date()
    ).length,

    fragileMemories: state.topics.filter(t =>
      t.memoryStatus === 'Fragile'
    ).length,

    brainLoad: computeBrainLoad(state), // 'Clear' | 'Light' | 'Active' | 'Heavy'
    speakingMomentum: computeSpeakingMomentum(state) // 'Awakening' | 'Building' | 'Active' | 'Strong'
  };
}

function computeBrainLoad(state) {
  var dueCount = state.topics.filter(t => t.nextReview && new Date(t.nextReview) <= new Date()).length;
  if (dueCount === 0) return 'Clear';
  if (dueCount <= 3) return 'Light';
  if (dueCount <= 8) return 'Active';
  return 'Heavy';
}

function computeSpeakingMomentum(state) {
  var last7DaysSessions = state.sessionsLog
    .filter(s => new Date(s.at) >= new Date(Date.now() - 7*24*3600*1000))
    .length;
  if (last7DaysSessions === 0) return 'Awakening';
  if (last7DaysSessions <= 3) return 'Building';
  if (last7DaysSessions <= 10) return 'Active';
  return 'Strong';
}
```

### 1.9 Motion philosophy

| Element | Motion | Duration | Purpose |
|---|---|---|---|
| Card background | radial gradient drift | 14s ease-in-out infinite | "alive breathing" |
| Identity tier icon | drop-shadow glow (static, no animation) | — | identity presence |
| Identity divider | static (no animation) | — | calm break |
| Milestone (current) | pulse glow ring | 2.2s ease-in-out infinite | "you are here, alive" |
| Milestone hover | transform scale 1.15 | 360ms cubic-bezier | acknowledgment |
| Momentum row hover | bg color shift | 200ms ease-out | subtle response |
| Reduced motion | all animations disabled | — | a11y |

```css
@media (prefers-reduced-motion: reduce) {
  .card.hero-living { animation: none; }
  .milestone-glow { animation: none; opacity: 0.3; }
}
```

### 1.10 Acceptance criteria (Day 8 verify)

After ship, anh look at HERO STATS card. **MUST cảm thấy:**

- [ ] **In 2 seconds:** "I am Shadow Apprentice on Day 3" (identity clear)
- [ ] **In 4 seconds:** "I am at Surviving stage, next is Responding" (journey clear)
- [ ] **In 6 seconds:** "1 review due today, brain is clear" (momentum readable)
- [ ] Card **breathes** (background gradient drift visible if watched ≥10s)
- [ ] Current milestone **pulses softly** (not bouncy, not dopamine)
- [ ] Empty space **45-55%** (not 80% dead, not 20% crammed)
- [ ] On mobile (test 380px viewport): 3 columns stack vertically, quote hidden, milestones still readable
- [ ] **Feels like:** opening a quiet study journal at dawn
- [ ] **Does NOT feel like:** opening Google Analytics

---

## 2. TODAY GOAL — DAILY EMOTIONAL COMPASS

### 2.1 Vision (anh viết)

> *TODAY FOCUS = task list cụ thể.*
> *TODAY GOAL = emotional mission của hôm nay.*
> TODAY GOAL phải trả lời: **"Hôm nay mình đang cố giữ điều gì sống?"**

### 2.2 Failure analysis — v11.1.12 + v11.1.13

| Symptom | Why |
|---|---|
| Mission checklist duplicate giữa TODAY FOCUS + TODAY GOAL | v11.1.12 rendered checklist inside cả 2 cards (regex `TODAY GOAL` matched TODAY FOCUS substring) |
| TODAY GOAL still shows mock "2/3 Missions completed" | v11.1.13 `cleanTodayGoal` cleaned WRONG card (TODAY FOCUS instead) |
| Layout lệch + chữ chạy | Architecture cũ designed TODAY GOAL as mini-checklist widget; polish couldn't reposition |
| No emotional mission statement | Original card never had this — entirely new content type needed |

### 2.3 NEW STRUCTURE — emotional compass only

```
┌─────────────────────────────────┐
│ ⏰ TODAY GOAL          height 280px │
├─────────────────────────────────┤
│                                 │
│              ╔═══╗              │
│              ║2/3║              │  ← big count (56px)
│              ╚═══╝              │
│                                 │
│    Daily momentum active        │  ← subtitle (13px)
│                                 │
│  ███████████░░░░░░░ 66%         │  ← progress bar (8px)
│                                 │
│      🔥 17-day streak           │  ← anchor (12px)
│                                 │
├─────────────────────────────────┤
│                                 │
│  "Keep your speaking            │  ← mission (16px italic)
│   reflex alive."                │
│                                 │
└─────────────────────────────────┘
```

### 2.4 HTML MOCKUP

```html
<div class="card today-compass" data-section-id="today-goal">
  <div class="card-title">
    <span class="icon">⏰</span> TODAY GOAL
  </div>

  <div class="compass-progress">
    <div class="compass-count">
      <span class="count-done">2</span><span class="count-divider">/</span><span class="count-total">3</span>
    </div>
    <div class="compass-subtitle">Daily momentum active</div>
    <div class="compass-bar">
      <div class="compass-bar-fill" style="--pct: 66%"></div>
    </div>
    <div class="compass-streak">
      <span class="streak-emoji">🔥</span>
      <span class="streak-text">17-day streak</span>
    </div>
  </div>

  <div class="compass-divider"></div>

  <div class="compass-mission">
    <div class="mission-label">Today's mission</div>
    <div class="mission-statement">
      Keep your speaking reflex alive.
    </div>
  </div>
</div>
```

### 2.5 CSS SPEC

```css
/* ========== TODAY COMPASS ========== */
.card.today-compass {
  padding: 24px 28px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background:
    radial-gradient(circle at 50% 0%, rgba(124,92,255,0.04) 0%, transparent 60%),
    var(--card);
}

.today-compass .card-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.55);
  margin-bottom: 0;
}

.compass-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0 4px;
}

.compass-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-weight: 700;
  line-height: 1;
}

.compass-count .count-done {
  font-size: 56px;
  color: rgba(180,140,255,1);
  filter: drop-shadow(0 0 16px rgba(124,92,255,0.4));
}

.compass-count .count-divider {
  font-size: 32px;
  color: rgba(255,255,255,0.3);
  font-weight: 400;
  margin: 0 2px;
}

.compass-count .count-total {
  font-size: 28px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
}

.compass-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.02em;
}

.compass-bar {
  width: 80%;
  height: 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
  position: relative;
}

.compass-bar-fill {
  height: 100%;
  width: var(--pct, 0%);
  background: linear-gradient(90deg,
    rgba(124,92,255,0.85),
    rgba(180,140,255,0.95));
  border-radius: 6px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.compass-streak {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255,138,61,0.85);
}

.compass-streak .streak-emoji {
  font-size: 13px;
}

.compass-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(255,255,255,0.06),
    transparent);
  margin: 0 -8px;
}

.compass-mission {
  text-align: center;
  padding: 8px 12px;
}

.mission-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 8px;
}

.mission-statement {
  font-size: 16px;
  font-style: italic;
  line-height: 1.5;
  color: rgba(255,255,255,0.88);
  letter-spacing: 0.01em;
  animation: mission-fade 800ms ease-out;
}

@keyframes mission-fade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === MOBILE === */
@media (max-width: 600px) {
  .card.today-compass { padding: 20px; min-height: 240px; }
  .compass-count .count-done { font-size: 48px; }
  .mission-statement { font-size: 15px; }
}
```

### 2.6 Mission statement library (anh chọn 5-8 từ list này, hoặc viết thêm)

**Pool — daily rotation:**
1. "Keep your speaking reflex alive."
2. "Today: small step. Tomorrow: shadowed automatic."
3. "Don't break the chain. The chain remembers."
4. "Một câu nói thật. Một mảnh trí nhớ được cứu."
5. "Repetition today = instinct tomorrow."
6. "Your past self is waiting for you to remember."
7. "Tiếng Anh ngủ trong anh. Hôm nay đánh thức một đoạn."
8. "Small mouth, big consistency."
9. "The voice you want is built one shadow at a time."
10. "Hôm nay: một câu. Tuần này: một phản xạ."

**Rotation strategy:**
```javascript
function todayMission(state, day) {
  // Persist per-day so refreshing doesn't change mission
  var key = 'shadow-en-mission-' + day;
  var stored = localStorage.getItem(key);
  if (stored) return stored;
  var pool = MISSION_POOL; // array of strings
  var index = hashCode(day) % pool.length;
  var chosen = pool[index];
  localStorage.setItem(key, chosen);
  return chosen;
}
```

### 2.7 Acceptance criteria

- [ ] **Single big number 2/3** is the visual anchor (not buried in checklist)
- [ ] **Mission statement** is the emotional bottom note (always present)
- [ ] **No duplicate** with TODAY FOCUS (no checklist here)
- [ ] **Mobile**: card stays narrow (≤320px wide) and clean
- [ ] **Feels like:** flipping to today's page in a journal
- [ ] **Does NOT feel like:** another todo widget

---

## 3. MEMORY STATUS — HEALTH PANEL

### 3.1 Vision (anh viết)

> Card phải feel như **"Memory Health Panel"** — KHÔNG phải **"analytics block"**.
> Trả lời: **"Trí nhớ tiếng Anh của tôi đang ở trạng thái nào?"**

### 3.2 Failure analysis — current state

| Symptom | Why |
|---|---|
| "68 Average" as top metric | Number without meaning; user can't interpret |
| Heatmap purely decorative | Cells render but no tooltip, no review-count context |
| 5 status counts flat list (Fragile 30, Weak 1...) | No hierarchy; user can't tell what matters |
| No interpretation layer | Numbers without "what this means about you" |
| Card feels like dashboard widget | Designed as stats grid, not as health diagnostic |

### 3.3 NEW STRUCTURE — 4 layers stacked

```
┌────────────────────────────────────────────────────┐
│ 🧠 MEMORY STATUS                                   │
├────────────────────────────────────────────────────┤
│ LAYER 1 — STATE BADGE (the anchor)                 │
│                                                    │
│       Memory Health                                │
│       ┌──────────────┐                             │
│       │   FRAGILE    │  ← color-coded             │
│       └──────────────┘                             │
│       Still unstable                               │
│                                                    │
├────────────────────────────────────────────────────┤
│ LAYER 2 — BREAKDOWN                                │
│                                                    │
│  ● 31 fragile memories                             │
│  ● 1 weak memory                                   │
│  ● 1 building                                      │
│  ○ 0 stable patterns                               │
│  ○ 0 automatic patterns                            │
│                                                    │
├────────────────────────────────────────────────────┤
│ LAYER 3 — HEATMAP (meaningful)                    │
│                                                    │
│  Mon Tue Wed Thu Fri Sat Sun                       │
│  ▢ ▢ ▢ ▢ ▢ ▢ ▢                                    │
│  ▢ ▢ ▢ ▢ ▢ ▢ ▢                                    │
│  ▢ ▢ ▢ ▢ ▢ ▢ ▢                                    │
│  ▢ ▢ ▣ ▤ ▢ ▢ ▢   ← today colored                 │
│                                                    │
│  Hover: "26/5 · 3 reviews · Memory reinforced"     │
│                                                    │
├────────────────────────────────────────────────────┤
│ LAYER 4 — INTERPRETATION                           │
│                                                    │
│  💡 Most patterns are still fragile.               │
│  💡 Your brain still needs repetition.             │
│  💡 Memory is waking up, but not stable yet.       │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 3.4 HTML MOCKUP

```html
<div class="card memory-health" data-section-id="memory-status">
  <div class="card-title">
    <span class="icon">🧠</span> MEMORY STATUS
  </div>

  <!-- LAYER 1: State badge -->
  <div class="health-state">
    <div class="health-state-label">Memory Health</div>
    <div class="health-state-badge state-fragile">FRAGILE</div>
    <div class="health-state-subtitle">Still unstable</div>
  </div>

  <!-- LAYER 2: Breakdown -->
  <div class="health-breakdown">
    <div class="breakdown-row">
      <span class="breakdown-dot dot-fragile"></span>
      <span class="breakdown-count">31</span>
      <span class="breakdown-label">fragile memories</span>
    </div>
    <div class="breakdown-row">
      <span class="breakdown-dot dot-weak"></span>
      <span class="breakdown-count">1</span>
      <span class="breakdown-label">weak memory</span>
    </div>
    <div class="breakdown-row">
      <span class="breakdown-dot dot-building"></span>
      <span class="breakdown-count">1</span>
      <span class="breakdown-label">building</span>
    </div>
    <div class="breakdown-row dim">
      <span class="breakdown-dot dot-stable"></span>
      <span class="breakdown-count">0</span>
      <span class="breakdown-label">stable patterns</span>
    </div>
    <div class="breakdown-row dim">
      <span class="breakdown-dot dot-automatic"></span>
      <span class="breakdown-count">0</span>
      <span class="breakdown-label">automatic patterns</span>
    </div>
  </div>

  <!-- LAYER 3: Heatmap with meaning -->
  <div class="health-heatmap">
    <div class="heatmap-header">
      <span class="heatmap-label">REVIEW HEATMAP</span>
      <span class="heatmap-period">Last 28 days</span>
    </div>
    <div class="heatmap-days">
      <span>Mon</span><span>Tue</span><span>Wed</span>
      <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
    </div>
    <div class="heatmap-grid">
      <!-- 28 cells, each with data-date + data-count + title for tooltip -->
      <div class="hm-cell hm-0" data-date="2026-04-30" title="30/4 — No activity"></div>
      <!-- ... 27 more cells, generated dynamically ... -->
      <div class="hm-cell hm-3" data-date="2026-05-26" title="26/5 — 3 reviews · Memory reinforced"></div>
      <div class="hm-cell hm-1 today" data-date="2026-05-27" title="27/5 (today) — 1 review · Light practice"></div>
    </div>
  </div>

  <!-- LAYER 4: Interpretation -->
  <div class="health-insights">
    <div class="insight-row">
      <span class="insight-icon">💡</span>
      <span class="insight-text">Most patterns are still fragile.</span>
    </div>
    <div class="insight-row">
      <span class="insight-icon">💡</span>
      <span class="insight-text">Your brain still needs repetition.</span>
    </div>
    <div class="insight-row">
      <span class="insight-icon">💡</span>
      <span class="insight-text">Memory is waking up, but not stable yet.</span>
    </div>
  </div>
</div>
```

### 3.5 CSS SPEC (key parts)

```css
/* ========== MEMORY HEALTH ========== */
.card.memory-health {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* === LAYER 1: STATE BADGE === */
.health-state {
  text-align: center;
  padding: 12px 0;
}

.health-state-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 10px;
}

.health-state-badge {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1.5px solid currentColor;
}

.health-state-badge.state-awakening {
  color: #a78bfa;
  background: rgba(167,139,250,0.08);
  box-shadow: 0 0 16px rgba(167,139,250,0.15);
}
.health-state-badge.state-fragile {
  color: #ef4444;
  background: rgba(239,68,68,0.08);
  box-shadow: 0 0 16px rgba(239,68,68,0.15);
}
.health-state-badge.state-recovering {
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
  box-shadow: 0 0 16px rgba(245,158,11,0.15);
}
.health-state-badge.state-building {
  color: #facc15;
  background: rgba(250,204,21,0.08);
  box-shadow: 0 0 16px rgba(250,204,21,0.15);
}
.health-state-badge.state-stable {
  color: #22c55e;
  background: rgba(34,197,94,0.08);
  box-shadow: 0 0 16px rgba(34,197,94,0.15);
}
.health-state-badge.state-automatic {
  color: #a78bfa;
  background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,92,255,0.10));
  box-shadow: 0 0 20px rgba(167,139,250,0.25);
}

.health-state-subtitle {
  font-size: 13px;
  font-style: italic;
  color: rgba(255,255,255,0.6);
  margin-top: 10px;
  letter-spacing: 0.01em;
}

/* === LAYER 2: BREAKDOWN === */
.health-breakdown {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0 8px;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  padding: 4px 0;
}

.breakdown-row.dim { opacity: 0.45; }

.breakdown-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-fragile { background: #ef4444; }
.dot-weak { background: #f59e0b; }
.dot-building { background: #facc15; }
.dot-stable { background: #22c55e; }
.dot-automatic { background: #a78bfa; }

.breakdown-count {
  font-weight: 600;
  min-width: 24px;
  text-align: right;
}

.breakdown-label {
  color: rgba(255,255,255,0.65);
}

/* === LAYER 3: HEATMAP === */
.health-heatmap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.heatmap-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
}

.heatmap-period {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-style: italic;
}

.heatmap-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.heatmap-grid .hm-cell {
  aspect-ratio: 1;
  border-radius: 3px;
  background: rgba(255,255,255,0.04);
  transition: all 220ms ease-out;
  cursor: help;
}

.heatmap-grid .hm-cell:hover {
  outline: 1.5px solid rgba(124,92,255,0.6);
  transform: scale(1.1);
}

.hm-cell.hm-1 { background: rgba(34,197,94,0.30); }
.hm-cell.hm-2 { background: rgba(34,197,94,0.55); }
.hm-cell.hm-3 { background: rgba(34,197,94,0.78); }
.hm-cell.hm-4 { background: rgba(34,197,94,1.00); }

.hm-cell.today {
  outline: 1.5px solid rgba(124,92,255,0.7);
  outline-offset: 1px;
}

/* === LAYER 4: INSIGHTS === */
.health-insights {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(124,92,255,0.04);
  border: 1px solid rgba(124,92,255,0.10);
}

.insight-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12.5px;
  line-height: 1.5;
  color: rgba(255,255,255,0.78);
  font-style: italic;
}

.insight-icon { flex-shrink: 0; opacity: 0.7; }

/* === MOBILE === */
@media (max-width: 600px) {
  .card.memory-health { padding: 20px 18px; gap: 18px; }
  .health-state-badge { padding: 8px 20px; font-size: 12.5px; }
  .breakdown-row { font-size: 12px; }
  .insight-row { font-size: 11.5px; }
}
```

### 3.6 State decision logic (anh sign-off)

```javascript
function memoryHealthState(distribution) {
  var total = distribution.total;
  if (!total) return { label: 'AWAKENING', tone: 'Just starting your journey' };

  var fragilePct = distribution.fragile / total;
  var stablePct = (distribution.stable + distribution.automatic) / total;
  var automaticPct = distribution.automatic / total;

  if (fragilePct >= 0.85) return { label: 'FRAGILE', tone: 'Still unstable' };
  if (fragilePct >= 0.60) return { label: 'RECOVERING', tone: 'Memory is forming' };
  if (stablePct >= 0.40 && automaticPct >= 0.15) return { label: 'STABLE', tone: 'Speaking reflex emerging' };
  if (automaticPct >= 0.40) return { label: 'AUTOMATIC', tone: 'Your English is alive' };
  return { label: 'BUILDING', tone: 'Patterns are stabilizing' };
}
```

### 3.7 Interpretation library (rotate 3 from state-specific pool)

| State | Insight pool (rotate 3) |
|---|---|
| **AWAKENING** | "Every journey starts with one word." · "Today is Day 1 of remembering." · "Your brain has everything it needs. Just begin." |
| **FRAGILE** | "Most patterns are still fragile." · "Your brain still needs repetition." · "Memory is waking up, but not stable yet." · "Don't measure progress in days. Measure in reps." |
| **RECOVERING** | "Memory is forming. Keep going." · "The first walls are coming up." · "Soon you'll surprise yourself." |
| **BUILDING** | "Patterns are taking root." · "Consistency beats intensity." · "Repetition becomes recognition." |
| **STABLE** | "Speaking reflex is emerging." · "Trust the process. It's working." · "Less effort, more flow." |
| **AUTOMATIC** | "Your English is alive." · "From practice to instinct." · "What was hard is now natural." |

### 3.8 Heatmap tooltip messages (per count)

```javascript
function heatmapTooltip(date, count) {
  var dateStr = formatDate(date); // "26/5" Vietnamese style
  if (count === 0) return dateStr + ' — No activity';
  if (count === 1) return dateStr + ' — 1 review · Light practice';
  if (count <= 3) return dateStr + ' — ' + count + ' reviews · Memory reinforced';
  if (count <= 6) return dateStr + ' — ' + count + ' reviews · Deep maturation';
  return dateStr + ' — ' + count + ' reviews · Total focus day';
}
```

### 3.9 Acceptance criteria

- [ ] **In 2 seconds:** User can name memory health state ("FRAGILE / BUILDING / STABLE")
- [ ] **In 4 seconds:** User understands "why" (subtitle gives emotional context)
- [ ] **Heatmap hover** shows meaningful tooltip (not just date)
- [ ] **Insights** rotate 3 from state pool (different each day if state changes)
- [ ] **Color-coded badge** dominates visual hierarchy (not numbers)
- [ ] **Mobile**: badge stays prominent, breakdown rows compact
- [ ] **Feels like:** doctor explaining your blood test with empathy
- [ ] **Does NOT feel like:** Google Analytics dashboard

---

## 4. IMPLEMENTATION ORDER (Day 8+)

### Pre-flight checklist (BEFORE writing any code)

- [ ] Anh sign off:
  - [ ] HERO STATS HTML mockup §1.4
  - [ ] Identity tier mapping §1.6 (6 tiers + 5 quotes)
  - [ ] Journey position logic §1.7
  - [ ] TODAY GOAL HTML mockup §2.4
  - [ ] Mission library §2.6 (chọn 5-8 strings)
  - [ ] MEMORY STATUS HTML mockup §3.4
  - [ ] State decision logic §3.6
  - [ ] Insight library §3.7
  - [ ] All acceptance criteria §1.10, §2.7, §3.9
- [ ] TD-2 archaeology done (know current render source for each card)
- [ ] v11.1.13 hero + v11.1.12 mission checklist REVERTED first
- [ ] Backup snapshot of current state (Day 7 baseline before redesign)

### Wave 1 — Foundation (Day 8, ~2 hours)
1. Read `today.js` / `app_v11_today.js` / source of HERO/TODAY GOAL/MEMORY cards
2. Map current DOM structure for each card
3. Revert v11.1.13 hero + v11.1.12 mission inject (clean slate)
4. Create `app_v11_2_redesign.js` skeleton with 3 modules

### Wave 2 — HERO STATS rewrite (Day 8, ~3 hours)
- Module 1: replace HERO STATS DOM with §1.4 mockup
- Inject CSS from §1.5
- Implement identity tier mapping + journey position logic
- Test on desktop + mobile breakpoints
- Verify acceptance criteria §1.10

### Wave 3 — TODAY GOAL rewrite (Day 9, ~2 hours)
- Module 2: replace TODAY GOAL DOM with §2.4 mockup
- Mission rotation logic (24h cache)
- Verify §2.7

### Wave 4 — MEMORY STATUS rewrite (Day 9-10, ~3 hours)
- Module 3: replace MEMORY STATUS DOM with §3.4 mockup
- State decision logic + insight rotation
- Heatmap rolling-28-day with tooltips (port v11.1.10 logic, fix selector)
- Verify §3.9

### Wave 5 — Integration + polish (Day 10, ~2 hours)
- Coordinate 3 modules (no conflict with v11.1.9/.11/.14)
- Mobile testing 380px / 768px / 1024px
- Reduced-motion testing
- Final emotional verification (anh look + confirm "feels right")

### Wave 6 — Document + tag (Day 10)
- CHANGELOG entry as v11.2.0
- Update README §current version
- Archive v11.1.x as "polish era" closed
- Tag git release `v11.2.0`

**Estimated total**: ~12 hours dev work, spread over Day 8-10.

---

## 5. RISK REGISTER

| Risk | Mitigation |
|---|---|
| TD-2 unknown modules render current cards | Wave 1.1 archaeology BEFORE coding |
| v11.1.13/12 patches conflict with new modules | Revert them FIRST, then ship v11.2 |
| Anh changes mind mid-implementation | Sign-off gates at every Wave (HTML mockup must be approved before CSS) |
| Mobile layout breaks 3-column hero | Tested at 900px + 600px breakpoints in §1.5 |
| Mission rotation feels random/lazy | 24h cache + hash-based selection (deterministic per day) |
| Heatmap tooltip slow on mobile (hover unavailable) | Use `title` attribute (browser-native, taps OK) |
| Identity tier name feels gamey | Anh sign-off §1.6 with veto |

---

## 6. SIGN-OFF SHEET (Day 2 morning print this)

**For Dương Trường — review checklist:**

### HERO STATS
- [ ] Identity tier names approved (or which to change?)
- [ ] Quote rotation pool approved (5 strings — keep all? drop any?)
- [ ] Journey labels approved (Beginner/Surviving/Responding/Flowing — alternatives?)
- [ ] HTML structure approved (3 columns 28/44/28)
- [ ] Card height 220px acceptable (or higher/lower?)

### TODAY GOAL
- [ ] Mission library — anh keep 5-8 from §2.6, mark others
- [ ] Big count 2/3 visual hierarchy approved
- [ ] Card height 280px acceptable

### MEMORY STATUS
- [ ] State labels approved (AWAKENING/FRAGILE/RECOVERING/BUILDING/STABLE/AUTOMATIC)
- [ ] State thresholds approved (§3.6 decision logic)
- [ ] Insight library — anh keep which from §3.7
- [ ] Heatmap tooltip messages approved (§3.8)

### OVERALL
- [ ] Anh confirm: "Đây là HẾT redesign cho v11.2" (no more surprise specs Wave 7)
- [ ] Anh confirm: Day 8 ship Wave 1+2 (foundation + HERO)
- [ ] Anh confirm: Acceptance criteria measurable

---

## 7. WHY THIS WORKS (where v11.1.x failed)

**v11.1.x failure pattern:**
- Architecture cũ render "stats" → patch CSS lên trên → vẫn cảm thấy "stats with veneer"

**v11.2 success pattern:**
- Architecture mới designed FROM emotional brief → HTML structure reflects emotion → CSS amplifies → result feels right
- HTML/CSS provided here EXPLICITLY (not "concept") → less interpretation error
- Anh sign-off BEFORE code → mismatch caught at spec stage (cheap), not at deploy stage (expensive)
- Single deploy plan (1 file replaces 3 cards) → no polish-on-polish layering

---

*Last update: 2026-05-27 (Day 1 evening — Path C choice).*
*Status: DRAFT v3. Anh review Day 2 morning. Day 8 ship after sign-off.*
*Replaces: previous specs in V11_1B §5.9-5.12 (anh decide whether to delete those or keep as history).*
