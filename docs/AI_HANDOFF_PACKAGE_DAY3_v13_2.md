# 🤝 SHADOW ENGLISH — AI HANDOFF PACKAGE

> **Generated:** 2026-05-29 (Day 3 close, evening)
> **Author:** Claude (Cowork mode) on behalf of Dương Trường
> **Purpose:** Comprehensive engineering memory transfer for next AI / future self
> **Read this whole file once → you understand 80% of project. Read §12 first for emergency context.**

---

## TABLE OF CONTENTS

1. PROJECT OVERVIEW
2. SYSTEM ARCHITECTURE
3. CURRENT FEATURES
4. CHANGELOG OF MAJOR WORK
5. BUG HISTORY
6. IMPORTANT DECISIONS
7. CONTENT EDITOR SYSTEM STATUS
8. OPEN TASKS
9. NEXT RECOMMENDED ACTIONS
10. REQUIRED FILES FOR FUTURE AI
11. REPOSITORY KNOWLEDGE MAP
12. AI QUICK START PACKAGE
13. METADATA

---

## 1. PROJECT OVERVIEW

### 1.1 Identity

| Field | Value |
|---|---|
| **Name** | Shadow English |
| **Tagline** | "Operating System for English Fluency" |
| **NOT** | Course platform · Dashboard demo · Analytics tool · Quiz app |
| **IS** | Spaced Repetition + Shadowing methodology made adaptive |
| **Owner** | Dương Hữu Trường (TruongCRM on GitHub) — Vietnamese solopreneur, **non-technical** |
| **Repo** | https://github.com/TruongCRM/shadow-english-dashboard |
| **Live URL** | https://truongcrm.github.io/shadow-english-dashboard/ |
| **Started** | 2026-05-25 |
| **Day 3 close** | 2026-05-29 |
| **Latest version** | v13.2.0 (Review Engine page populate) |

### 1.2 Final goal

Turn English from **"knowledge" → "reflex"** via memory recovery.

The user (Dương) is targeted: Vietnamese solopreneur/coach who has English knowledge but cannot speak fluently — needs to RECOVER lost reflex through daily small repetitions, not learn from scratch.

### 1.3 Current architecture

**8-layer architecture (as of v13.2 close):**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CONTENT LAYER (Notion CMS)                              │
│    User edits → GitHub Action hourly sync → content.json   │
│    Sources: Notion DB "Topics" + "Custom Blocks" field     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BLOCKS LAYER (v9, extended v12)                          │
│    21 block types — text/heading/lists/video/image/quote/  │
│    callout/exercise/checklist/embed/link/html/etc.         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ADAPTIVE LAYER (v10) — adaptive.js                       │
│    calculateForgetRisk · calculateMasteryVelocity ·         │
│    calculateSalvageability · calculateNextReview            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. METRICS LAYER (v10) — metrics.js                         │
│    speakingMinutesThisWeek · shadowStreak · recallAccuracy │
│    weakTopicTrends · consistencyScore · reviewLoadForecast │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. COACH LAYER (v10) — coach.js                             │
│    10+ rule-based patterns — daily insights + feedback     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UI LAYER (v7) — layout.json + app_v7_layout.js          │
│    Themes (5 presets) · Sections toggle/reorder/span        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. OBSERVABILITY LAYER (v11.1) — debug_panel.js +           │
│    nav_polish.js + app_v11_1_9 to _14.js patches            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. EDITOR LAYER (v12, Day 3 added)                          │
│    Visual content editor (blocks toolbar, drag-drop,        │
│    inline edit, GitHub overlays.json sync, mobile polish)   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. IDENTITY LAYER (v13, Day 3 added)                        │
│    HERO STATS (Living Identity Block) · TODAY GOAL          │
│    (Daily Compass) · MEMORY STATUS (Health Panel)           │
│    Review Engine page populate                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Main components

1. **Home Dashboard** — primary view, shows quote + Hero Identity + Today Goal + Memory Status + Survival Patterns + Memory Pulse + Today Queue + Level Map
2. **Topic Detail** — per-topic page with Why / Scene / Core Phrases (Before/During/After × Eng/Vie) / Shadowing Script / Missions / Active Recall / Video Immersion / Custom Content blocks
3. **Review Engine** — standalone page (v13.2) with full queue table + filter tabs (All/Day 0/1/3/7/21/60/Overdue) + action buttons
4. **Topics Database** — all 32 topics grid with filter by level/memory/search
5. **Phrases Bank** — cross-topic phrase search
6. **Missions** — daily + topic-specific missions
7. **Calendar / Memory Log / Statistics / Progress Tracker** — observability views

### 1.5 Design philosophy

- **System thinking** — root cause not surface fix
- **Living memory recovery** — NOT analytics dashboard, NOT course platform
- **Calm premium UX** — not gamified, not dopamine-empty achievements
- **Mobile-first responsive** — viewport 380px to 1920px
- **Vietnamese default** — English in code/docs accepted
- **Zero-build constraint** — vanilla JS, no framework, no bundler
- **Content-agnostic** — code never hardcodes English content
- **localStorage for user state** — schema-versioned keys
- **Real metrics > fake numbers** — every stat traces to user action

### 1.6 Owner profile (CRITICAL for AI behavior)

- **Profession:** Coach for Level 2 Solopreneurs ("có khách nhưng không ổn định")
- **Language:** Tiếng Việt default
- **Tone preference:** Tư duy hệ thống (system thinking) — root cause
- **HATES:**
  - Generic advice ("here are some tips...")
  - Dopamine-empty features
  - Admin dashboard feel
  - Hardcoded content
  - Polish-on-architecture for emotional briefs (G11)
- **LOVES:**
  - Real systems
  - Measurable outcomes
  - Calm premium UX
  - Honest pushback when scope conflicts
- **Workflow style (post Day 1):** Ship → Use → Fix live (NOT Wait → Observe → Ship)

### 1.7 Key decisions locked

See §6 for full decision log. Highlights:

- **Architecture:** No backend until truly needed (use Notion + GitHub Pages)
- **Notion as source of truth** for content (hard constraint #4)
- **Vanilla JS, no framework** (hard constraint #2)
- **localStorage for user state** with schema versioning in key name
- **Adaptive SR > Fixed SR** (v10)
- **Day 3 pivot:** SHIP → USE → FIX LIVE overrode observation week
- **Day 3 Path C chosen** for multi-device sync: GitHub overlays.json (not Notion API write)
- **v13 paradigm shift:** Living Identity Block REPLACES old stat cards (not polish on top)

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Component map

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER (Dương)                            │
│  Edits content in Notion · Uses app in browser (desktop/mobile)  │
└────────────┬──────────────────────────────┬───────────────────────┘
             │                              │
             │ Edit content                 │ Browse & learn
             ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│   NOTION WORKSPACE      │    │     BROWSER (User device)        │
│   "Ngoại Ngữ            │    │  https://truongcrm.github.io/    │
│   Shadowing | 2026"     │    │  shadow-english-dashboard/        │
│                         │    │                                   │
│   Topics DB             │    │  Loads:                           │
│   - Topic ID            │    │  - index.html (UI shell)          │
│   - Name, Level         │    │  - 25+ JS modules                 │
│   - Why, Scene          │    │  - content.json (data)            │
│   - Phrases (Before/    │    │  - layout.json (UI config)        │
│     During/After)       │    │                                   │
│   - Dialogues, Script   │    │  Runs:                            │
│   - Missions, Recall    │    │  - v3 State engine                │
│   - Custom Blocks       │    │  - v10 Adaptive memory            │
│     (JSON paste field)  │    │  - v12 Visual editor              │
└────────────┬────────────┘    │  - v13 Living cards               │
             │                  │  - v13.2 Review queue             │
             │ Hourly cron      │                                   │
             ▼                  │  Reads/Writes localStorage:       │
┌─────────────────────────┐    │  - shadow-en-state-v3             │
│  GITHUB ACTIONS         │    │  - shadow-en-layout-overrides     │
│  sync-from-notion.yml   │    │  - shadow-en-debug-mode           │
│                         │    │  - shadow-en-overlay-{topicId}    │
│  Runs hourly + manual   │    │  - shadow-en-github-pat (PAT)     │
│  workflow_dispatch      │    │  - shadow-en-mission-{day}        │
│                         │    └────────────┬────────────────────────┘
│  Requires secrets:      │                 │
│  - NOTION_TOKEN         │                 │ User edits overlay
│  - NOTION_TOPICS_DB     │                 │ (with PAT)
│                         │                 ▼
│  Calls:                 │    ┌─────────────────────────────────┐
│  scripts/               │    │   GITHUB REST API                │
│  sync-from-notion.js    │    │   (v12.2 Path C)                 │
│                         │    │                                   │
│  Writes:                │    │   PUT /repos/.../contents/       │
│  content.json           │    │   data/overlays/{topicId}.json   │
│  Auto-commits           │    │                                   │
└────────────┬────────────┘    │   Returns: new sha + commit       │
             │                  └────────────┬────────────────────────┘
             │ Commit to                     │
             │ main branch                   │ Multi-device fetch
             ▼                                ▼
┌────────────────────────────────────────────────────────────────┐
│              GITHUB REPOSITORY (main branch)                    │
│              TruongCRM/shadow-english-dashboard                 │
│                                                                  │
│   ├─ index.html                                                 │
│   ├─ content.json (synced from Notion)                          │
│   ├─ data/overlays/*.json (user edits, v12.2)                   │
│   ├─ 25+ JS modules                                             │
│   ├─ layout.json, manifest.json, sw.js                          │
│   └─ docs/, scripts/, .github/workflows/                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ GitHub Pages serves
             ▼
┌────────────────────────────────────────────────────────────────┐
│           GITHUB PAGES CDN                                       │
│           Domain: truongcrm.github.io                            │
│           Auto-deploy on every push to main                      │
│           Build duration ~30s                                    │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Data flow diagram (simplified)

```
   ┌──────────┐
   │  Notion  │
   └────┬─────┘
        │ Manual edit
        ▼
   ┌──────────────────────────┐
   │  Sync Workflow (hourly)   │  ← TD-9: silently fails if NOTION_TOKEN/DB missing
   └────┬─────────────────────┘
        │
        ▼
   ┌──────────────┐         ┌──────────────────────┐
   │ content.json │ ←──────│ data/overlays/*.json │  ← v12.2 in-app edits
   │  (base)      │         │  (overlay, GitHub    │
   └────┬─────────┘         │   API via PAT)       │
        │                    └────────┬──────────────┘
        │ Browser fetches both        │
        ▼                              ▼
   ┌──────────────────────────────────────────────────┐
   │  Browser App (index.html + 25 JS modules)         │
   │  Render = merge(content.json, overlays)           │
   │  localStorage for user state + drafts             │
   └────┬──────────────────────────────────────────────┘
        │
        ▼
   ┌────────────────┐
   │  User Display  │
   │  - Dashboard   │
   │  - Topic pages │
   │  - Review      │
   │  - Missions    │
   └────────────────┘
```

### 2.3 Module load order in index.html

```
<head> loads:
  Chart.js (CDN, has SVG fallback if blocked)
  Inline styles (large block)
  
<body> end loads (defer):
  1. content.js?v=6         (content.json loader)
  2. app.js?v=6             (v3-v6 state engine + game logic)
  3. audio.js?v=8           (v8 Web Speech API wrapper)
  4. app_v7_layout.js?v=7   (v7 layout config engine)
  5. app_v8_experience.js?v=8  (v8 audio + focus)
  6. blocks.js?v=12         (v9/v12 block renderers — 21 types)
  7. app_v9_blocks.js?v=9   (v9 blocks hook into topic detail)
  8. adaptive.js?v=10       (v10 adaptive memory engine)
  9. metrics.js?v=10        (v10 metrics)
  10. coach.js?v=10         (v10 rule-based insights)
  11. app_v10_integration.js?v=10  (v10 hooks)
  12. phrases.js?v=11       (v11 opener phrases — TD-2 zone)
  13. today.js?v=11         (v11 Today Focus render — TD-2 zone)
  14. app_v11_today.js?v=11 (v11 Today Queue hook — TD-2, MOCK DATA)
  
  Inside additional <style> block, then more scripts:
  15. debug_panel.js?v=11.1     (Internal Insight Panel)
  16. nav_polish.js?v=11.1.8    (Stabilize patches v11.1.1-1.8)
  17. app_v11_1_9_levelmap_fix.js?v=11.1.9
  18. app_v11_1_10_heatmap_fillmap.js?v=11.1.10
  19. app_v11_1_11_progress_layout.js?v=11.1.11
  20. app_v11_1_12_polish_bundle.js?v=11.1.12  (← polish_1112 binding for queue tabs)
  21. app_v11_1_13_polish_bundle2.js?v=11.1.13
  22. app_v11_1_14_day21_stage.js?v=11.1.14
  23. app_v12_editor.js?v=12.3.0   (Day 3: Visual Content Editor)
  24. app_v13_redesign.js?v=13.1.7 (Day 3: HERO/TODAY GOAL/MEMORY rewrite)
  25. app_v13_2_review.js?v=13.2.0 (Day 3: Review Engine page populate)
```

### 2.4 State schema (`localStorage`)

```javascript
// Key: shadow-en-state-v3
{
  user: {
    streak: 1,
    xp: 467,
    xpToNext: 507,
    level: 5,
    name: "Dương Hữu Trường",
    lastActiveDate: "Wed May 27 2026"
  },
  topics: [  // 32 seeded
    {
      id: "L1-01",
      emoji: "🍔",
      name: "Ordering Food & Drinks",
      level: 1,
      reviewStage: "Day 3",  // "Day 0" | "Day 1" | "Day 3" | "Day 7" | "Day 21" | "Day 60" (v13.1.4+)
      memoryStatus: "Building",  // Fragile | Weak | Building | Stable | Automatic
      lastReview: "2026-05-26T09:47:45.075Z",
      nextReview: "2026-05-29T09:47:45.076Z",
      masteryPct: 30,
      confidence: 0,
      sessions: 2,
      confidenceHistory: [4, 3, 4]
    }
    // ... 31 more
  ],
  sessionsLog: [
    { type: "session", topicId: "L1-01", at: "2026-05-26T09:24:53.665Z" },
    { type: "review", topicId: "L1-01", confidence: 4, at: "..." }
  ],
  missions: {
    date: "Wed May 27 2026",
    items: [
      { task: "Dùng 1 cụm từ trong bữa ăn thật", done: false },
      // 4 more
    ]
  },
  currentSession: null
}

// Other keys:
// shadow-en-layout-overrides — UI customizations (theme, sections)
// shadow-en-debug-mode — debug panel toggle
// shadow-en-checks-{topicId}-{i} — checklist block state
// shadow-en-mission-{day} — daily mission cache
// shadow-en-overlay-{topicId} — v12 in-app edits per topic
// shadow-en-github-pat — v12.2 GitHub PAT for sync (sensitive)
```

### 2.5 Overlay schema (`shadow-en-overlay-{topicId}`)

```javascript
{
  videoImmersionUrl: "https://youtube.com/watch?v=...",
  customBlocks: [
    { id: "b_xxx", type: "paragraph", text: "...", order: 0 },
    { id: "b_yyy", type: "heading", text: "...", level: 2, order: 1 }
  ],
  notionOverrides: {  // v12.0.3 — overrides text in 5 native sections
    why: "...",
    scene: "...",
    shadow_script: "...",
    missions: "...",
    active_recall: "...",
    phrases: {  // v12.1 — Core Phrases full CRUD
      before: [{ en: "...", vi: "..." }],
      during: [...],
      after: [...]
    }
  },
  _modifiedAt: 1748528423000  // v12.2 — timestamp for sync conflict resolution
}
```

---

## 3. CURRENT FEATURES

Status legend: ✅ Done · 🟡 Partial · ❌ Not done · ⚠ Broken

### 3.1 Dashboard (Home)

| Feature | Status | Notes |
|---|---|---|
| 5-questions panel | ✅ | "Học gì hôm nay / Ôn gì / Sắp quên / Mạnh lên / Còn xa Automatic" |
| Hero greeting (time-aware) | ✅ | Good morning/afternoon/evening |
| Survival Patterns | ✅ | Cross-topic phrase patterns (currently shows "Chưa đủ data") |
| Memory Pulse 32 dots | ✅ | Visual memory health per topic |
| **HERO STATS (Living Identity Block)** | ✅ **v13.0** | 3-column 28/44/28: Identity tier + Journey + Living Now momentum |
| **TODAY GOAL (Daily Compass)** | ✅ **v13.0** | Big count + progress bar + mission statement italic |
| **MEMORY STATUS (Health Panel)** | ✅ **v13.0 + 13.1.6** | State badge + 5-col breakdown + heatmap + insights |
| Stat cards (Brain Load, Topics Mastered, Review Due, Weekly Progress) | ✅ | Existing v10 metrics |
| Today Focus (5 missions checklist) | ✅ | Class `card sr-engine` or `card missions-card` (TD-2 zone) |
| Review Engine — Today Queue | ✅ | Tabs All/Day 0/1/3/7/21/60/Overdue on home, render via polish_1112 + v13.1.4 |
| Streak Guard card | ✅ | Streak status with reset warning |
| Coach Says | ✅ | v10 rule-based insights |
| Next Up (Tomorrow Preview) | ✅ | Topic preview for next day |
| Level Map (Level 1/2/3) | ✅ | Grid of topics per level |
| Mobile responsive (380px+) | ✅ **v13.1.7** | Hide sidebar, stack 1-col, compact cards |

### 3.2 Topic Pages

| Feature | Status | Notes |
|---|---|---|
| Topic hero (emoji, name, mastery, day stage) | ✅ | |
| WHY THIS TOPIC (editable inline) | ✅ **v12.0.3** | Click ✏ Edit → contenteditable |
| THE SCENE (editable inline) | ✅ **v12.0.3** | |
| **VIDEO IMMERSION block** | ✅ **v12.0** | Paste YouTube → auto embed. Position: between Why and Core Phrases |
| CORE PHRASES (Before/During/After) | ✅ **v12.1** | Full CRUD: add/edit phrase (Eng+Vie) / delete / reorder |
| SHADOWING SCRIPT (editable inline) | ✅ **v12.0.3** | |
| REAL LIFE MISSIONS (editable inline) | ✅ **v12.0.3** | |
| ACTIVE RECALL (editable inline) | ✅ **v12.0.3** | |
| CUSTOM CONTENT section (10 block types) | ✅ **v12.0** | Add: paragraph/heading/list/quote/divider/image/youtube/callout/note + drag-drop reorder |
| Master Edit/Preview toggle | ✅ **v12.0.3** | Floating bottom-center |
| Mobile drag-drop (touch handlers) | ✅ **v12.3** | Event delegation on .v12-block-handle |
| Per-section ✏ Edit button | ✅ **v12.0.3** | Top-right of each native section |
| Audio TTS (8-step session) | ✅ v8 | Web Speech API + record |
| Focus mode (ESC to exit) | ✅ v8 | Hide sidebar/topbar |
| 8-step session flow | ✅ v6 | WARM-UP→LISTEN→SHADOW→REPEAT→RECALL→SPEAK→MISSION→REFLECTION |
| Topic detail flow restructure (Why→Video→Phrases) | ✅ **v12.0** | Video Immersion section inserted at correct position |

### 3.3 Review Engine

| Feature | Status | Notes |
|---|---|---|
| Today Queue on home (mock data Hotel Check-in etc.) | 🟡 ⚠ | TD-2 zone — uses mock data, not state.topics. From app_v11_today.js |
| Filter tabs on home (All/Day 0/1/3/7/21/Overdue) | ✅ v11 | Existing polish_1112 binding |
| **Day 60 tab added** | ✅ **v13.1.4** | Hook via `addDay60Tab` + setInterval |
| **Review Engine standalone page** | ✅ **v13.2** | Full queue table (32 topics) + 8 filter tabs + ▶ action |
| Filter by stage | ✅ **v13.2** | Day 0/1/3/7/21/60 + Overdue |
| Topic priority icons (🔥/↑/⏰/·) | ✅ **v13.2** | Based on memoryStatus + overdue |
| Memory bar (visual %) | ✅ **v13.2** | masteryPct from state |
| Stage badges color-coded | ✅ **v13.2** | day1 red / day3 orange / day7 yellow / day21 green / day60 purple |
| Last Review / Next formatted (Today/Yesterday/...) | ✅ **v13.2** | Vietnamese-friendly relative time |
| ▶ Action button → openTopic | ✅ **v13.2** | Wired to existing openTopic() |
| Empty state | ✅ **v13.2** | "Tốt! On-track" for Overdue empty |
| Legend at footer | ✅ **v13.2** | 🔥/↑/· explanation |
| Mobile responsive | ✅ **v13.2** | Hide Last/Next cols on 700px, hide Memory on 400px |

### 3.4 Missions

| Feature | Status | Notes |
|---|---|---|
| Daily missions (5 items) | ✅ | From state.missions.items |
| Mission checklist with persist | ✅ | Persist done state in state |
| Topic-specific missions | ✅ | From content.json topics.{id}.missions |
| Real Life Missions section (per topic) | ✅ + editable v12.0.3 | |
| Mission rotation 24h cache | ✅ **v13.0** | Hash-based selection per day |
| Edit mission inline | ✅ **v12.0.3** | Click ✏ → contenteditable |

### 3.5 Hero System (Identity)

| Feature | Status | Notes |
|---|---|---|
| **Identity tier mapping** | ✅ **v13.0** | 6 tiers: Shadow Apprentice → Practitioner → Survivor → Memory Builder → Reflex Awakener → Fluency Path Walker |
| Tier auto-update by streak | ✅ **v13.0** | Streak 0-2 / 3-6 / 7-13 / 14-20 / 21-29 / 30+ |
| Quote rotation (24h cache) | ✅ **v13.0** | 5 quotes English/Vietnamese mixed |
| **Journey milestones (Beginner→Surviving→Responding→Flowing)** | ✅ **v13.0** | Auto-computed from memory distribution |
| Current milestone glow pulse | ✅ **v13.0** | CSS animation 2.2s |
| **Living Now momentum rows** | ✅ **v13.0** | Reviews due / Fragile / Brain load / Speaking |
| Card breathe animation | ✅ **v13.0** | 14s radial gradient drift |
| Reduced motion respect | ✅ **v13.0** | `prefers-reduced-motion` |
| XP system + level up | ✅ v3 | xpToNext × 1.5 multiplier |
| Streak tracking | ✅ v3 | Auto-detect yesterday/today via toDateString |

### 3.6 Memory System

| Feature | Status | Notes |
|---|---|---|
| 5-status classification | ✅ | Fragile / Weak / Building / Stable / Automatic |
| Adaptive forget risk | ✅ v10 | calculateForgetRisk(topic) |
| Mastery velocity tracking | ✅ v10 | confidenceHistory[] |
| Salvageability score | ✅ v10 | risk × max(0.1, mastery) |
| Stage demotion logic | ✅ v10 | soft demote vs hard reset |
| Memory distribution computation | ✅ | computeMemoryDistribution() |
| **Memory Health state badge** | ✅ **v13.0** | AWAKENING / FRAGILE / RECOVERING / BUILDING / STABLE / AUTOMATIC |
| State decision logic (thresholds) | ✅ **v13.0** | fragilePct ≥ 0.85 → FRAGILE, etc. |
| Breakdown 5-col grid | ✅ **v13.0 + 13.1.6** | Compact horizontal cells |
| 28-day rolling heatmap | ✅ v11.1.10 + v13.0 | Cells max-width 28px (v13.1.6) |
| Heatmap tooltip messages | ✅ **v13.0** | "26/5 — 3 reviews · Memory reinforced" |
| Interpretation insights (3 per day) | ✅ **v13.0** | Hash-based rotation per state |
| Memory Log standalone view | ✅ v4 | Grouped by status |

### 3.7 Progress System

| Feature | Status | Notes |
|---|---|---|
| Streak counter | ✅ v3 | |
| XP bar | ✅ v3 | |
| Level chip | ✅ v3 | |
| Mastery % per topic | ✅ v3 | |
| Real-time metrics (8 functions) | ✅ v10 | speakingMinutes, recallAccuracy, etc. |
| Progress Tracker view | ✅ v4 + v11.1.11 | Bar chart + sessions log |
| Calendar view | ✅ v4 + v6 | Month grid with review counts |
| Statistics view | ✅ v4 | Achievements + counters |
| Weekly Progress card | ✅ | % vs last week |
| Review Load forecast | ✅ v10 | Predict reviews per day ahead |

### 3.8 Content Sync

| Feature | Status | Notes |
|---|---|---|
| Notion → content.json hourly sync | ✅ v5 | cron `0 * * * *` |
| GitHub Action `sync-from-notion.yml` | ✅ | |
| Sync script `scripts/sync-from-notion.js` | ✅ | Reads NOTION_TOKEN + NOTION_TOPICS_DB env |
| Parses 11 Notion fields | ✅ | Topic ID, Why, Scene, Phrases, etc. |
| JSON Custom Blocks field parsing | ✅ v9 | Anh paste JSON in Notion → parses |
| Notion page native blocks parsing (12 types) | ❌ **Path 1 deferred** | Blueprint spec ready (CONTENT_EDITOR_PATH1_BLUEPRINT.md) but Notion DB empty → low ROI, deferred |
| Manual sync trigger | 🟡 | Via GitHub Actions "Run workflow" button. In-app "Sync now" button design ready but not shipped |
| **Sync re-armed Day 3** | ✅ **TD-9** | After secrets missing for 6+ runs May 28-29 |

### 3.9 Content Editor (v12.x — Day 3 ship)

| Feature | Status | Notes |
|---|---|---|
| **Edit mode toggle** | ✅ **v12.0** + v12.0.2 fix | Inside CUSTOM CONTENT header (not floating — was hidden behind Internal Insight Panel) |
| Master Preview/Edit toggle | ✅ **v12.0.3** | Floating bottom-center |
| **Block toolbar (10 types)** | ✅ **v12.0** | Text/Heading/Bullet/Numbered/Quote/Divider/Image/YouTube/Callout/Note |
| Block popover ("+ Add block") | ✅ **v12.0.2** | Always visible (auto-enables edit on click) |
| **Drag-drop block reorder** | ✅ **v12.0** | HTML5 native draggable + touch handlers v12.3 |
| Inline contenteditable edit | ✅ **v12.0** | paragraph/heading/quote/note text |
| List edit via prompt | ✅ **v12.0** | bulleted/numbered list (textarea-style) |
| Image URL prompt | ✅ **v12.0** | |
| YouTube URL prompt | ✅ **v12.0** | |
| Block actions: Edit/Duplicate/Move/Delete | ✅ **v12.0** | Hover-reveal on desktop, always-show mobile |
| Move up/down arrows | ✅ **v12.0** | Per block |
| **localStorage overlay persistence** | ✅ **v12.0** | `shadow-en-overlay-{topicId}` |
| Discard local edits button | ✅ **v12.0** | Revert overlay to base |
| **Video Immersion section** | ✅ **v12.0** | Empty state CTA → click → prompt YouTube URL |
| **5 native sections editable** | ✅ **v12.0.3** | WHY/SCENE/SHADOWING/MISSIONS/RECALL inline edit |
| **CORE PHRASES editable** | ✅ **v12.1** | Add/edit/delete/move phrase × Eng+Vie |
| **GitHub multi-device sync (Path C)** | ✅ **v12.2** | PAT-based REST API write to `data/overlays/{topicId}.json` |
| Sync now button (in-app) | ❌ | Defer — anh uses GitHub UI workflow trigger |
| **Edit-in-Notion deep-link** | ❌ | Defer — Notion DB empty, low ROI |
| **Mobile drag-drop touch handlers** | ✅ **v12.3** | Event delegation |
| Sync badge status indicator | ✅ **v12.2** | "✓ synced / ⟳ syncing / ⏱ pending / ⚠ error / ⛈ local only" |
| PAT setup modal | ✅ **v12.2** | Open via click sync badge |
| Conflict resolution (last-write-wins) | ✅ **v12.2** | 409 SHA retry with auto-pull |
| Write-back to Notion | ❌ | Path A/B deferred (~30-40h, vi phạm constraint #3) |

---

## 4. CHANGELOG OF MAJOR WORK

Format: chronological, most recent first.

### Day 3 (2026-05-29) — TODAY

#### Morning session

**2026-05-29 ~04:00 — Path 1 Blueprint published**
- Task: Author CONTENT_EDITOR_PATH1_BLUEPRINT.md
- Result: 936-line document v2 with TD-9 documentation
- Files: `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md`
- Commits: 2933835 (v1), 5a36457 (v2 with TD-9)
- Status: ✅ Locked but ship deferred (Notion empty discovery)

**2026-05-29 ~04:20 — TD-9 discovered + resolved**
- Task: Investigate Sync workflow failure (6+ runs failing May 28-29)
- Result: Root cause = NOTION_TOKEN/NOTION_TOPICS_DB env vars missing. Anh re-set secrets via GitHub Settings → workflow_dispatch trigger → run #19 ✅ Success 18s
- Files: GitHub Secrets settings, `.github/workflows/sync-from-notion.yml`
- Commits: e65b4bb (sync bot auto-commit content.json)
- Status: ✅ Resolved. TD-9 added to risk register

#### Mid-day session — Phase 1: Visual Editor

**2026-05-29 ~05:00 — v12.0 base ship**
- Task: Ship visual content editor Phase 1 (10 block types + drag-drop + inline edit + video immersion + localStorage overlay)
- Result: app_v12_editor.js (~700 lines) + blocks.js v2 (3 new types) + index.html wired
- Files: `blocks.js`, `app_v12_editor.js`, `index.html`, `docs/CHANGELOG_v12.md`
- Commits: 4f165b1 (blocks + editor), 9d8e060 (wire index.html), 410cd35 (CHANGELOG)
- Status: ✅ Shipped

**2026-05-29 ~05:20 — v12.0.1 hotfix state global**
- Task: Fix bug — navigate hook referenced `window.state` but actual global is `window.shadowEN.state`
- Result: Multi-fallback `getCurrentTopicId()` function
- Files: `app_v12_editor.js`, `index.html`
- Commits: 11197e2 (fix), 0549e0c (cache-bust)
- Status: ✅ Resolved
- Lesson: G16 — Global state lookup must check multiple namespaces

**2026-05-29 ~05:35 — v12.0.2 hotfix Edit toggle visibility**
- Task: Fix bug — ✏ Edit floating button at x=1544 hidden behind Internal Insight Panel (debug_panel.js)
- Result: Moved toggle INSIDE CUSTOM CONTENT section header. Add Block button always visible (auto-enables edit on click). Empty hint added.
- Files: `app_v12_editor.js`, `index.html`
- Commits: f8aba4e (hotfix module), 49a5e1e (cache-bust bump)
- Status: ✅ Resolved
- Lesson: G18 — Floating absolute UI can collide with pre-existing fixed/sticky panels

**2026-05-29 ~05:55 — v12.0.3 inline edit 5 sections**
- Task: Make WHY/SCENE/SHADOWING/MISSIONS/RECALL editable inline + Master Edit/Preview toggle
- Result: Add `_applyNotionOverrides()` + `_editSection()` + `_renderMasterToggle()` + 5 EDITABLE_SECTIONS
- Files: `app_v12_editor.js`, `index.html`
- Commits: 2 (module + cache-bust)
- Status: ✅ Shipped

#### Late morning — Phase 2: Phrases CRUD + Multi-device

**2026-05-29 ~06:30 — v12.1 CORE PHRASES editor**
- Task: Make Core Phrases (Before/During/After × Eng+Vie) full CRUD
- Result: `_renderCorePhrasesEditor()` + `_renderPhraseRow()` + `_editPhrase()` (with Tab to switch En↔Vi) + `_addPhrase()` + `_deletePhrase()` + `_movePhrase()`
- Files: `app_v12_editor.js`, `index.html`
- Commits: 2 (module + cache-bust)
- Status: ✅ Shipped

**2026-05-29 ~07:00 — v12.2 GitHub overlays.json sync (Path C)**
- Task: Multi-device sync via GitHub REST API write to `data/overlays/{topicId}.json`
- Result: `NS.gh` client (PAT-based) + `pullOverlay()` + `pushOverlay()` + `queueOverlaySync()` (4s debounce) + PAT setup modal + sync status badge
- Files: `app_v12_editor.js`, `index.html`
- Commits: 2 (module + cache-bust)
- Status: ✅ Shipped. Anh hasn't set PAT yet — local only mode active
- Lesson: Chose Path C over Path A/B (Notion API write) — pragmatic, ~7h vs ~20h, no backend, no CORS issues

#### Mid-afternoon — Phase 3: Mobile + Identity Cards

**2026-05-29 ~07:25 — v12.3 mobile polish**
- Task: 380px + 600px breakpoints + touch drag-drop
- Result: Mobile CSS overrides (block actions stack, phrase rows column, tap targets ≥36px) + `_setupTouchDrag()` event delegation
- Files: `app_v12_editor.js`, `index.html`
- Commits: 2 (module + cache-bust)
- Status: ✅ Shipped

**2026-05-29 ~07:45 — v13.0 Living Memory Recovery cards (3 cards rewrite per V11_2 blueprint)**
- Task: REWRITE HERO STATS / TODAY GOAL / MEMORY STATUS from scratch per V11_2_REDESIGN_BLUEPRINT.md
- Result: NEW app_v13_redesign.js (~700 lines):
  - HERO STATS → Living Identity Block (3-col 28/44/28: Identity tier + Journey milestones with glow + Living Now momentum)
  - TODAY GOAL → Daily Compass (big count + progress bar + mission statement italic 24h rotation)
  - MEMORY STATUS → Health Panel (state badge color-coded + breakdown + meaningful heatmap with tooltips + insights interpretation)
- Files: `app_v13_redesign.js` (new), `index.html`
- Commits: 2 (upload + wire)
- Status: ✅ Shipped
- Critical: This is the v11.2 blueprint REWRITE (not polish) — paradigm shift from stats panel → living recovery system

#### Late afternoon — Mobile polish hotfixes

**2026-05-29 ~07:55 — v13.1 compact + Day 60 tab**
- Task: Memory breakdown compact (5-col grid instead of vertical column) + add Day 60 review tab
- Result: CSS grid-template-columns: repeat(5, 1fr) for breakdown + `addDay60Tab()` function
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 2
- Status: ✅ Shipped (Day 60 logic functional, but selector hunt issue)

**2026-05-29 ~07:58 — v13.1.1 Day 60 selector fix**
- Task: Day 60 tab not appearing because addDay60Tab queried `view-review` but queue tabs are on HOME view in `.queue-tabs` div
- Result: Change selector from `view-review` → `.queue-tabs`. Hook extends to home/dashboard navigate
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 2
- Status: ✅ Resolved

**2026-05-29 ~08:00 — v13.1.2 CRITICAL mobile grid override**
- Task: Fix vertical-char text bug on mobile (parent grid forces narrow widths, text wraps per char)
- Result: Aggressive `@media (max-width: 700px)` CSS — all `.card` force `grid-column: 1 / -1 !important` + word-wrap + min-width: 0
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 2
- Status: ✅ Shipped (partial — banner needed targeted fix)

**2026-05-29 ~08:10 — v13.1.3 mission-hero banner fix**
- Task: YOUR NEXT MOVE banner ("Shadow Ordering Food & Drinks") had vertical char text
- Result: Discovered class via JS inspect (.mission-hero / .mission-body / .mission-label). Added targeted CSS reset + initial setTimeout for addDay60Tab
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 2
- Status: ✅ Resolved

**2026-05-29 ~08:25 — v13.1.4 TODAY FOCUS + force interval**
- Task: TODAY FOCUS mission list vertical chars + Day 60 not triggering
- Result: Added `.card.sr-engine *` CSS reset + force `window.addEventListener('load', ...)` + `setInterval(addDay60Tab, 3000)` retry
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 2
- Status: ✅ Shipped (sr-engine selector helped some, but actually TODAY FOCUS missions card is `.card.missions-card` — fixed in v13.1.7)

**2026-05-29 ~08:35 — v13.1.5 + v13.1.6 MEMORY STATUS ultra-tight**
- Task: User requested MEMORY STATUS gọn hơn — reduce card height ~50%
- Result: Heatmap cells max-width 28px + aspect-ratio + smaller paddings + insights compact
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 4 (2 patches)
- Status: ✅ Shipped

**2026-05-29 ~08:45 — v13.1.7 multi-fix (sidebar/stat-card/missions-card)**
- Task: 4 issues from user feedback:
  - Việc 1: Hide left-edge sidebar peek on mobile
  - Việc 2: BRAIN LOAD stat cards too large on mobile
  - Việc 3: TODAY FOCUS missions STILL vertical (correct class is `card missions-card`, not `sr-engine`)
  - Việc 4: Cards alignment uneven
- Result: Added `aside.sidebar { display: none }`, `.card.stat-card { padding: 12px 14px }`, `.missions-card .mission-row .name` proper flex with min-width: 0
- Files: `app_v13_redesign.js`, `index.html`
- Commits: 2
- Status: ✅ Shipped

#### Evening — Phase 4: Review Engine Page

**2026-05-29 ~09:00 — v13.2 Review Engine page populate**
- Task: Sidebar "Review Engine" page was EMPTY (only quote). User chose Option A (populate page) over Option B (scroll redirect)
- Result: NEW `app_v13_2_review.js` (484 lines):
  - Hook `navigate('review')`
  - 8 filter tabs (All / Day 0 / Day 1 / Day 3 / Day 7 / Day 21 / Day 60 / Overdue)
  - Full queue table with 32 topics
  - Priority icons (🔥 Fragile / ↑ Weak / ⏰ Overdue / · normal)
  - Color-coded stage badges
  - Memory mastery bar
  - Last Review / Next Review relative time
  - ▶ Action button → openTopic()
  - Mobile responsive (hide Last/Next on 700px, hide Memory on 400px)
- Files: `app_v13_2_review.js` (new), `index.html`
- Commits: 2
- Status: ✅ Shipped
- Verify: tabCount=8, rowCount=32, topicCount=32

### Day 1 (2026-05-27) — context

Polish marathon — see ENGINEERING_MEMORY_HANDOFF.md original. v11.1.9 → v11.1.14 (6 ships). V11_2_REDESIGN_BLUEPRINT.md authored (Path C chosen — rewrite not polish for emotional brief).

### Day 0 (2026-05-25 → 2026-05-26) — v1-v10

See `docs/CHANGELOG.md` for v1-v10 history. Skip here for brevity.

---

## 5. BUG HISTORY

### BUG-G01 — Service Worker cache traps old code

- **Description:** After deploy, browser serves old cached version
- **Root Cause:** SW cache name not versioned per release
- **Fix:** Bump cache name + URL query param `?v=N`
- **Status:** ✅ Pattern documented (G1)
- **First seen:** v2

### BUG-G02 — `const X = {}` not on window

- **Description:** Cross-script access fails because `const` is module-scoped
- **Root Cause:** ES6 const doesn't become window property
- **Fix:** Always use `window.X = X` explicitly for globals
- **Status:** ✅ Pattern documented (G2)
- **First seen:** v8

### BUG-G03 — HTML file truncation >1000 lines

- **Description:** Write/Edit tool truncates large files mid-content
- **Root Cause:** Tool token limit
- **Fix:** Use bash heredoc + cat for large files
- **Status:** ✅ Pattern documented (G3)
- **First seen:** v1, v4

### BUG-G04 — NAV_RENDERS scope issue

- **Description:** Auto-attach audio buttons after navigate failed
- **Root Cause:** NAV_RENDERS is const in app.js, not on window
- **Fix:** Wrap window.navigate instead
- **Status:** ✅ Resolved v8.3 with brute-force setInterval
- **First seen:** v8

### BUG-G05 — Chart.js CDN fails in sandbox

- **Description:** External CDN with `integrity` attribute fails silently
- **Root Cause:** Sandbox blocks integrity-checked scripts
- **Fix:** try/catch + SVG fallback (svgSpark, svgDonut, svgLineChart)
- **Status:** ✅ Pattern documented (G5)
- **First seen:** v1

### BUG-G06 — Green commit ≠ deployed live

- **Description:** Commit shows green but Pages not updated
- **Root Cause:** Actions tab may have queued/failed deploy
- **Fix:** Always check Actions tab for pages-build-deployment status
- **Status:** ✅ Pattern documented (G6)
- **First seen:** v11.1.0

### BUG-G07 — JS update needs ?v=N bump

- **Description:** Updated JS but browser uses cached old version
- **Root Cause:** Same URL means browser cache wins
- **Fix:** Two-commit ship (file + cache-bust query in script tag)
- **Status:** ✅ Pattern documented (G7)
- **First seen:** v11.1.2

### BUG-G08 — Visual polish needs upfront spec

- **Description:** Iterating polish live = many ships, none satisfying
- **Root Cause:** Heatmap took 4 iterations because no upfront concrete spec
- **Fix:** Sign-off concrete dimensions BEFORE code
- **Status:** ✅ Pattern documented (G8)
- **First seen:** v11.1.3-1.6

### BUG-G09 — Idempotent CSS injection stale-style

- **Description:** Re-injected CSS doesn't override old version
- **Root Cause:** Same style id keeps old content
- **Fix:** Versioned style id (e.g., `v12-editor-styles-v1`) — remove old before add new
- **Status:** ✅ Pattern documented (G9)
- **First seen:** v11.1

### BUG-G10 — Silent file upload commit drop

- **Description:** Uploaded file to GitHub but no commit appears
- **Root Cause:** GitHub web UI silent failure
- **Fix:** Always verify file in repo after upload (G10 protocol)
- **Status:** ✅ Pattern documented
- **First seen:** v11.1.12 (Day 1)

### BUG-G11 — Polish-on-architecture fails emotional brief

- **Description:** User feedback "feels analytics dashboard" despite polish patches
- **Root Cause:** Architecture cũ render "stats panel" paradigm. Polish patches add veneer (streak dots, gradient) but skeleton still stats. Brief emotional ("living memory") demanded paradigm shift, not CSS shift.
- **Fix:** REWRITE from scratch per blueprint with HTML/CSS mockups (v11.2 → v13.0)
- **Status:** ✅ Resolved Day 3 with v13.0 ship
- **First seen:** v11.1.13 (Day 1)
- **Lesson:** When user repeats same brief 2+ times → previous implementation FAILED → admit + pivot to REWRITE

### BUG-G12 — Observation week scope creep

- **Description:** Day 1 shipped 6 versions in observation week (should be 0)
- **Root Cause:** Each "small bug fix" felt urgent
- **Fix:** Track override count + push back when adds up
- **Status:** ✅ Pattern documented (G12)

### BUG-G13 — Selector specificity shared classNames

- **Description:** `.hm-cell` selector matched LEGEND not main heatmap grid
- **Root Cause:** Both LEGEND and grid use same class
- **Fix:** Scope selector to specific container (e.g., `.health-heatmap .hm-cell`)
- **Status:** ✅ Pattern documented (G13)
- **First seen:** v11.1.10/13

### BUG-G14 — Regex substring matches false positives

- **Description:** `/TODAY GOAL/` regex matched TODAY FOCUS card (because "TODAY" is substring)
- **Root Cause:** Substring matching
- **Fix:** Use exact title match `/^TODAY GOAL$/` or query data-section-id
- **Status:** ✅ Pattern documented (G14)
- **First seen:** v11.1.13

### BUG-G15 — web_fetch truncation for files >70KB

- **Description:** web_fetch returns error for files exceeding ~70KB
- **Root Cause:** Tool token limit
- **Fix:** Use Chrome MCP `javascript_tool` with `fetch()` inside browser to get ground truth (browser has no such limit)
- **Status:** ✅ Pattern documented (G15)
- **First seen:** Day 3 (v12.0 ship — index.html was 101KB)

### BUG-G16 — Global state lookup fallback chain needed

- **Description:** Hook tried `window.state?.currentTopicId` but actual global is `window.shadowEN.state.currentTopicId`
- **Root Cause:** Project's state engine uses `shadowEN.state` namespace, not bare `window.state`
- **Fix:** Multi-fallback `getCurrentTopicId()` checks all 3 paths
- **Status:** ✅ Resolved v12.0.1
- **First seen:** Day 3 v12.0

### BUG-G17 — CodeMirror 6 + execCommand insertText works for GitHub commits

- **Description:** GitHub uses CodeMirror 6 for /edit/main/... pages. Need programmatic commit pattern.
- **Root Cause:** N/A — discovery
- **Fix:** Use `document.execCommand('selectAll')` + `execCommand('insertText', false, content)` to update CodeMirror via Chrome MCP javascript_tool. Then click Commit changes button via JS query
- **Status:** ✅ Pattern documented (G17)
- **First seen:** Day 3 (v12.0 ship)

### BUG-G18 — Floating absolute UI hidden by fixed panels

- **Description:** v12.0 Edit toggle at `position:absolute; top:12px; right:20px` got hidden behind Internal Insight Panel (debug_panel.js) on the right
- **Root Cause:** Two layers using right-edge real estate without coordination
- **Fix:** Move floating UI INTO content flow (CUSTOM CONTENT header) instead of absolute positioning
- **Status:** ✅ Resolved v12.0.2
- **First seen:** Day 3 v12.0
- **Lesson:** Always prefer positioning INSIDE content flow when other patches/extensions may exist

### BUG-D3-MOBILE-VTEXT — Vertical char text on mobile

- **Description:** Multiple cards on mobile rendered text as "S\nh\na\nd\no\nw\n..." (1 char per line)
- **Root Cause:** Parent grid container with limited width forced text to wrap per character. Specific selector chain involved
- **Fix:** Aggressive `@media (max-width: 700px)` CSS — all `.card { grid-column: 1 / -1; width: 100%; min-width: 0 }` + targeted fixes for `.mission-hero` (banner) and `.missions-card .mission-row .name` (TODAY FOCUS missions)
- **Status:** ✅ Resolved v13.1.2 → v13.1.3 → v13.1.7 (iterative class discovery)
- **First seen:** Day 3 mobile testing v13.0

### BUG-D3-DAY60-TIMING — Day 60 tab inject timing

- **Description:** Day 60 tab not appearing on home dashboard after navigate
- **Root Cause:** v11.1.12 polish_1112 patch renders Today Queue tabs ASYNCHRONOUSLY after page load. Our addDay60Tab fires too early
- **Fix:** Multiple setTimeout (200/800/1500/4000ms) + setInterval(3000ms) + window.load/DOMContentLoaded listeners
- **Status:** ✅ Resolved v13.1.4 → v13.1.5
- **First seen:** Day 3 v13.1.1

### BUG-TD9-SYNC-SILENT — Sync workflow silent failure

- **Description:** Sync content from Notion workflow failed 6 runs in a row May 28-29 without any alert
- **Root Cause:** `NOTION_TOKEN` / `NOTION_TOPICS_DB` GitHub Secrets were missing (deleted or expired)
- **Fix:** Anh re-created Notion integration token + added back to GitHub Secrets. Workflow run #19 ✅ Success 18s
- **Status:** ✅ Resolved Day 3. TD-9 added to risk register. Recommend adding workflow status badge to README + email notification
- **First seen:** Cron May 28 #13 (first failure)

### BUG-V13-FINDCARD-WRONG — _findCard regex too broad

- **Description:** v13.0 first render hit wrong cards because regex matched substring
- **Root Cause:** `/MEMORY STATUS|MEMORY/i` matched "MEMORY PULSE" (different card) before "MEMORY STATUS"
- **Fix:** Use `data-section-id` lookup first, fallback to exact regex
- **Status:** ✅ Resolved v13.0 (built-in via _findCardBySection)

### BUG-V13-REVIEW-EMPTY — Review Engine page empty

- **Description:** Sidebar Review Engine page showed only quote, no content
- **Root Cause:** view-review div exists but no content layer module ever populated it. TODAY QUEUE (with mock data) only renders on home view via app_v11_today.js
- **Fix:** v13.2 ship app_v13_2_review.js — new module populates view-review with full queue + filter tabs + actions
- **Status:** ✅ Resolved v13.2

---

## 6. IMPORTANT DECISIONS

### D-001: Notion as source of truth (NOT in-app CMS)

- **Decision:** Content stored in Notion. App is reader. Edits go through Notion.
- **Considered:** Build full in-app CMS (would have ~30h dev)
- **Why chosen:** Anh already had Notion workspace. Notion provides drag-drop + multi-device + mobile app for free. Don't reinvent.
- **Trade-off:** Anh must learn Notion DB schema. Sync delay 1h. Limited to Notion's editor UX.
- **Reverse decision Day 3:** Hybrid — main content via Notion, USER OVERLAY EDITS via in-app editor (v12.0) with localStorage + optional GitHub sync (v12.2)
- **Locked:** v5 (initial), revised v12.0

### D-002: Vanilla JS, no framework

- **Decision:** No React, Vue, Svelte, etc.
- **Considered:** React with full SPA
- **Why chosen:** Zero-build constraint (anh non-technical, no npm/bundler workflow). Anh edits files directly via GitHub web UI.
- **Trade-off:** More verbose JS. No JSX. No reactive state.
- **Status:** Hard constraint #2

### D-003: GitHub Pages + Actions (no backend)

- **Decision:** Static site hosting. Backend = Notion API + GitHub Actions cron.
- **Considered:** Cloudflare Worker, Vercel functions, full Node backend
- **Why chosen:** Free, simple, no DevOps. Notion provides DB.
- **Trade-off:** Cannot do real-time. Limited to client-side logic.
- **Day 3 reaffirmed:** Multi-device sync Path C uses GitHub REST API instead of backend proxy (Path B rejected)
- **Status:** Hard constraint #3

### D-004: Adaptive SR > Fixed SR (v10)

- **Decision:** Spaced repetition intervals adapt to confidence + streak + decay
- **Considered:** Fixed Day 1/3/7/21 intervals (simpler)
- **Why chosen:** User sees real adaptation = "this is real" feeling
- **Status:** Locked v10

### D-005: Rule-based AI Coach (v10)

- **Decision:** 10+ if/else rule patterns generate insights
- **Considered:** LLM API call for personalized coaching
- **Why chosen:** Good enough for 90% cases. No API cost. Local.
- **Future:** LLM enhancement in v15+
- **Status:** Locked v10

### D-006: SHIP → USE → FIX LIVE (Day 3 pivot)

- **Decision:** Stop long observation phase. Ship rough code immediately. Iterate live.
- **Considered:** Continue 7-day observation week (Day 1-7)
- **Why chosen:** User explicitly overrode observation rule. Stated preference: "usable imperfect today over perfect architecture later"
- **Trade-off:** Some bugs ship to production. Multiple hotfixes per day.
- **Result:** ~25 commits Day 3. Mostly successful. Some rework needed (mobile polish required 5 hotfixes)
- **Status:** Active mode

### D-007: Path C for multi-device sync (v12.2)

- **Decision:** Use GitHub REST API + PAT in browser localStorage for multi-device persistence
- **Considered:**
  - Path A: Notion API direct from browser (~15h, CORS unknown, PAT exposed)
  - Path B: Cloudflare Worker proxy + Notion API (~18h, violates "no backend")
  - Path D: Manual export/import JSON (~2h, manual)
- **Why chosen Path C:** ~7h dev, zero backend, GitHub session already exists, Notion sync untouched (writes to separate `data/overlays/{topicId}.json`)
- **Trade-off:** GitHub PAT exposed in localStorage. Edit commit history visible in GitHub. Conflict resolution = last-write-wins.
- **Status:** Locked v12.2

### D-008: v11.2 REWRITE (not polish)

- **Decision:** HERO STATS / TODAY GOAL / MEMORY STATUS rewritten from scratch
- **Considered:** Continue polishing v11.1.x cards
- **Why chosen:** G11 lesson — polish-on-architecture fails emotional briefs. Brief demanded paradigm shift.
- **Result:** v13.0 ship. User reported emotional brief satisfied.
- **Status:** Shipped v13.0

### D-009: Additive Model for overlays

- **Decision:** Custom blocks added in app render AFTER native Notion content (additive). JSON Custom Blocks from Notion still parsed.
- **Considered:** Replace mode (new blocks REPLACE Notion content)
- **Why chosen:** Anh has L1-01 with JSON Custom Blocks pasted in Notion. Replace mode would delete those edits.
- **Status:** Locked v12.0

### D-010: Path 1 (Smooth Notion) blueprint locked but deferred

- **Decision:** Document Path 1 (parse Notion native blocks → 90% no JSON paste) but DEFER ship after Notion DB found near-empty
- **Considered:** Ship Path 1 anyway
- **Why deferred:** Only 1 topic in Notion DB. Parsing infrastructure for 0 data = waste. Focus localStorage-first editor instead.
- **Future:** When anh populates Notion → re-evaluate
- **Status:** Blueprint at `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md`. Ship status: ❌

### D-011: Review Engine page populate (Option A) — Day 3 evening

- **Decision:** Populate Review Engine standalone page with full queue table
- **Considered:** Option B (sidebar redirect to home Today Queue section)
- **Why chosen:** Dedicated page experience. Not scroll-hunt within home.
- **Status:** Shipped v13.2

---

## 7. CONTENT EDITOR SYSTEM STATUS

### 7.1 Goal

Make Shadow English **content management accessible to non-technical creator** (Dương). User can:
- Add content (text, video, blocks, missions, phrases)
- Edit existing content (5 native sections + Core Phrases + Custom blocks)
- Reorder via drag-drop
- Preview as learner would see
- Sync between devices (optional)

### 7.2 Phases

**Phase 1 (v12.0 → v12.0.2):** ✅ DONE
- Edit mode toggle
- Block toolbar (10 types: Text/Heading/Bullet/Numbered/Quote/Divider/Image/YouTube/Callout/Note)
- Drag-drop reorder (HTML5 + v12.3 touch handlers)
- Inline editing (contenteditable for paragraph/heading/quote/note)
- Video Immersion section
- localStorage overlay persistence
- Master Preview/Edit toggle

**Phase 2 (v12.0.3 + v12.1):** ✅ DONE
- 5 native sections editable inline (WHY/SCENE/SHADOWING/MISSIONS/RECALL)
- Core Phrases full CRUD (Before/During/After × Eng+Vie)

**Phase 3 (v12.2):** ✅ DONE
- GitHub multi-device sync (Path C — overlays.json + PAT)
- 4s debounce auto-sync on edit
- PAT setup modal
- Conflict resolution (last-write-wins via SHA)
- Sync status badge

**Phase 4 (v12.3):** ✅ DONE
- Mobile breakpoint 600px + 380px CSS
- Touch drag-drop event delegation

**Phase 5 (v12.1+ future):** ❌ DEFERRED
- Write-back to Notion (Notion API write for content sync)
- ~20h estimated
- Why deferred: Path C provides 80% of multi-device benefit at 35% cost

### 7.3 Feature status table

| Feature | Status | File | Notes |
|---|---|---|---|
| Edit mode toggle | ✅ | app_v12_editor.js | Inside CUSTOM CONTENT header |
| Master Preview/Edit toggle | ✅ | app_v12_editor.js | Floating bottom-center |
| Block: paragraph | ✅ | blocks.js v2 | NEW v12 |
| Block: heading (level 1/2/3) | ✅ | blocks.js | |
| Block: bulleted_list | ✅ | blocks.js v2 | NEW v12 |
| Block: numbered_list | ✅ | blocks.js v2 | NEW v12 |
| Block: quote | ✅ | blocks.js | |
| Block: divider | ✅ | blocks.js | |
| Block: image | ✅ | blocks.js | URL prompt |
| Block: youtube | ✅ | blocks.js | URL prompt |
| Block: callout (7 colors) | ✅ | blocks.js | |
| Block: note | ✅ | blocks.js | |
| Block: tips, ai-prompt, checklist, exercise, embed, link, html, spacer | ✅ | blocks.js | v9 — not in v12 popover but renderable |
| Add Block popover (10 types) | ✅ | app_v12_editor.js | Auto-enables edit mode |
| Drag-drop reorder (desktop) | ✅ | app_v12_editor.js | HTML5 native draggable |
| Drag-drop reorder (mobile) | ✅ | app_v12_editor.js v12.3 | Event delegation touchstart/move/end |
| Block actions (Edit/Duplicate/Move/Delete) | ✅ | app_v12_editor.js | Hover-reveal |
| Inline contenteditable text edit | ✅ | app_v12_editor.js | paragraph/heading/quote/note |
| List edit prompt | ✅ | app_v12_editor.js | bulleted/numbered |
| Image URL prompt | ✅ | app_v12_editor.js | |
| YouTube URL prompt | ✅ | app_v12_editor.js | |
| Video Immersion section | ✅ | app_v12_editor.js | Auto-positioned between Why and Core Phrases |
| 5 native sections ✏ Edit button | ✅ | app_v12_editor.js v12.0.3 | WHY/SCENE/SHADOWING/MISSIONS/RECALL |
| _applyNotionOverrides() | ✅ | app_v12_editor.js v12.0.3 | Replaces native text with overlay |
| Core Phrases full CRUD | ✅ | app_v12_editor.js v12.1 | Tab to switch En↔Vi |
| Discard local edits button | ✅ | app_v12_editor.js | Confirm dialog |
| localStorage overlay persistence | ✅ | app_v12_editor.js | `shadow-en-overlay-{topicId}` |
| _modifiedAt timestamp | ✅ | app_v12_editor.js v12.2 | For sync conflict resolution |
| **GitHub Sync layer (NS.gh)** | ✅ | app_v12_editor.js v12.2 | PAT-based, getFile/putFile |
| pullOverlay() | ✅ | app_v12_editor.js v12.2 | Fetch from GitHub on render |
| pushOverlay() | ✅ | app_v12_editor.js v12.2 | Commit overlay on save |
| queueOverlaySync() | ✅ | app_v12_editor.js v12.2 | 4s debounce |
| PAT setup modal | ✅ | app_v12_editor.js v12.2 | Pre-filled GitHub Settings link |
| Sync status badge (✓/⟳/⏱/⚠/⛈) | ✅ | app_v12_editor.js v12.2 | Click to open PAT modal |
| Conflict resolution (409 SHA retry) | ✅ | app_v12_editor.js v12.2 | Auto-pull + retry once |
| Mobile drag-drop touch handlers | ✅ | app_v12_editor.js v12.3 | Event delegation global |
| Mobile breakpoints 600/380px | ✅ | app_v12_editor.js v12.3 | Compact actions, phrase column |
| Write-back to Notion | ❌ | — | Path A/B deferred (~30-40h) |
| In-app Sync now button | ❌ | — | User uses GitHub UI workflow trigger |
| Edit-in-Notion deep-link | ❌ | — | Notion DB empty → low ROI |
| Notion native block parser | ❌ | — | Path 1 blueprint ready, deferred |
| Auto-save indicator | 🟡 | — | Sync badge approximates this |

### 7.4 Related blueprints

- `docs/V11_2_REDESIGN_BLUEPRINT.md` — Living cards rewrite spec (used for v13.0)
- `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md` — Notion native block parser spec (Path 1, deferred)
- `docs/V11_1B_EXPERIENCE_POLISH.md` — Polish specs sections 5.1-5.12 (mostly superseded by v13.0 rewrite)
- `docs/CHANGELOG_v12.md` — Phase 1 ship doc

### 7.5 Files involved

**Production code:**
- `blocks.js` — 21 block renderers (window.SHADOW_BLOCKS)
- `app_v12_editor.js` — main editor module (~1100 lines)
- `app_v13_redesign.js` — Living cards (HERO/TODAY GOAL/MEMORY)
- `app_v13_2_review.js` — Review Engine page
- `index.html` — script tag loads + cache-bust

**Data:**
- `content.json` — base content from Notion (currently mostly empty)
- `data/overlays/{topicId}.json` — user overlays (v12.2, created on demand)
- `localStorage shadow-en-overlay-{topicId}` — same as above but local copy

**Existing TD-2 zone (not modified by Phase 1):**
- `phrases.js` — opener phrases (mock)
- `today.js` — Today Focus render (mock)
- `app_v11_today.js` — Today Queue hook (mock data — Hotel Check-in, Small Talk, etc.)

---

## 8. OPEN TASKS

### HIGH PRIORITY

1. **Test v13.1.7 + v13.2 stable on real mobile** — User to verify all hotfixes work as expected
2. **Cleanup docs:** Merge CHANGELOG.md with v12.x → v13.x entries (currently in separate files)
3. **Anh populate Notion DB** — Currently only 1 topic ("02 — Asking for Directions"). Without content, Path 1 blueprint cannot be tested + sync workflow brings no value
4. **Update AI_HANDOFF.md + ENGINEERING_MEMORY_HANDOFF.md with v12-v13 entries** (this document = first draft of new handoff)
5. **README workflow status badge** — Visibility for future TD-9-style silent failures

### MEDIUM PRIORITY

6. **Anh setup GitHub PAT for v12.2 sync** — Currently in "local only" mode
7. **Manual sync now button in-app** — Defer if anh fine with GitHub UI trigger
8. **Edit-in-Notion deep-link button** — Wait until Notion DB has content
9. **Path 1 ship (Notion native block parser)** — Wait until Notion DB has content
10. **TD-8 verify** (heatmap rolling patch propagation in v11.1.10)
11. **TD-1 close** (Node 20 deprecation on Pages) — Pre-major-deploy concern
12. **TD-3 decide** (Adaptive vs Debug formula ~19× divergence — observation week never happened due to ship pivot)
13. **TD-7 close** (cleanTodayGoal regex too broad — superseded by v13.0 rewrite, verify still relevant)

### LOW PRIORITY

14. **v14 Creator Mode advanced features:**
    - In-app PAT setup wizard with auto-detect
    - Content templates library
    - AI-assisted block suggestions
    - Bulk edit operations
15. **v15 Audio Intelligence:**
    - Pronunciation feedback via browser Speech Recognition
    - Waveform comparison
    - AI feedback via LLM
16. **Gamification 2.0** (achievements serving consistency, not dopamine)
17. **Memory Graph** — Topic connections visualization
18. **Anki export** — Vocabulary as flashcards
19. **Multi-language UI** (currently mixed VN/EN)
20. **Daily email digest** — Review reminder
21. **PWA offline-first** — Cache audio + lessons
22. **Mobile app shell** (React Native around web app)

---

## 9. NEXT RECOMMENDED ACTIONS

For a new AI taking over this project, **do these in order:**

1. **Read this entire document** (~30 minutes). Understand 80% of project.
2. **Read §12 (AI Quick Start)** if time-constrained — 5 min for emergency context.
3. **Fetch latest live state:**
   - `https://truongcrm.github.io/shadow-english-dashboard/` (live app)
   - `https://github.com/TruongCRM/shadow-english-dashboard/commits/main` (recent commits)
   - `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md` (still relevant for future)
4. **Check TD-9 status FIRST** — Sync workflow can silently fail. Verify recent runs green in Actions tab.
5. **Ask user about current priority** — They might have new feature in mind. Don't assume.
6. **If asked to ship code: follow established patterns:**
   - Chrome MCP for GitHub commits (use the execCommand insertText pattern G17)
   - Two-commit ship: file + cache-bust query bump
   - G6 verify Actions green
   - G10 verify file in repo via fetch
   - Test live with ?v=N-bust query
7. **If asked to fix mobile bug:** Always test at 380px AND 600px breakpoints. Use Chrome DevTools mobile emulation. Check parent containers for `min-width: 0`.
8. **If asked to add new feature:** Default to extending existing v12-v13 modules rather than new file (file inflation = harder to maintain).
9. **If user reports "vertical char text bug":** Find parent container class via DOM inspect. Apply `@media (max-width: 700px) { .[parent] { display: block; min-width: 0; word-wrap: break-word } }` pattern.
10. **If user requests Notion sync feature:** Verify content.json has actual data first. If empty (only 1 topic) → fix Notion DB populate before any sync feature.

---

## 10. REQUIRED FILES FOR FUTURE AI

### MUST HAVE

| File | Why |
|---|---|
| `docs/AI_HANDOFF_PACKAGE_DAY3_v13_2.md` (this file) | Complete handoff. Read first. |
| `docs/ENGINEERING_MEMORY_HANDOFF.md` (Day 1 close, original) | v1-v11 history. Day 1 context. |
| `docs/CHANGELOG.md` | v1-v10 detailed changelog |
| `docs/CHANGELOG_v12.md` | v12.0 + v12.0.1 detailed |
| `docs/V11_2_REDESIGN_BLUEPRINT.md` | v13.0 spec base |
| `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md` v2 | Notion native block parser spec |
| `docs/TECHNICAL_NOTES.md` | G1-G18 + debug commands |
| `docs/ROADMAP.md` | TD-1 to TD-9 |
| `index.html` | UI shell + script loads |
| `app.js` | Core state engine |
| `blocks.js` v2 | 21 block renderers |
| `app_v12_editor.js` | Visual editor (1100+ lines) |
| `app_v13_redesign.js` | Living cards |
| `app_v13_2_review.js` | Review Engine page |
| `content.json` | Current Notion sync output (mostly empty) |
| `scripts/sync-from-notion.js` | Sync script |
| `.github/workflows/sync-from-notion.yml` | Sync workflow |

### NICE TO HAVE

| File | Why |
|---|---|
| `docs/AI_HANDOFF.md` (original Day 1) | Earlier handoff context |
| `docs/STATE_SCHEMA.md` | Data structures (may be stale post-v12) |
| `docs/ARCHITECTURE.md` | System diagrams (stale post-v11.1.x) |
| `docs/V11_1B_EXPERIENCE_POLISH.md` | Polish specs (mostly superseded) |
| `docs/V11_1_PATCHES.md` | v11.1.1-1.8 ledger |
| `docs/V11_1_DEBUG_PANEL.md` | Debug panel user docs |
| `docs/VERIFY_REPORT_v11_1.md` | v11.1 verify report |
| `docs/SETUP_NOTION_SYNC.md` | Notion sync setup guide (5-min) |
| `docs/BLOCKS_GUIDE.md` | v9 block types guide |
| `README.md` | Project overview |
| All `app_v11_1_*.js` | Polish patches (mostly absorbed by v13.0) |
| `phrases.js`, `today.js`, `app_v11_today.js` | TD-2 zone (mock data) |
| `adaptive.js`, `metrics.js`, `coach.js` | v10 intelligence layer |
| `audio.js` | TTS wrapper |
| `manifest.json`, `sw.js` | PWA |

---

## 11. REPOSITORY KNOWLEDGE MAP

```
shadow-english-dashboard/
├── .github/
│   └── workflows/
│       └── sync-from-notion.yml          # Hourly Notion → content.json sync
├── scripts/
│   └── sync-from-notion.js               # Notion API → JSON parser (TD-9 was here)
├── data/                                  # v12.2 created on demand
│   └── overlays/
│       └── {topicId}.json                # User edits via GitHub API
├── docs/                                  # ENGINEERING MEMORY
│   ├── AI_HANDOFF.md                     # Day 1 quick context
│   ├── AI_HANDOFF_PACKAGE_DAY3_v13_2.md  # ← THIS FILE — Day 3 close handoff
│   ├── ARCHITECTURE.md                   # ⚠ Stale post-v11.1.x
│   ├── BLOCKS_GUIDE.md                   # v9 user docs
│   ├── CHANGELOG.md                      # v1-v10 main log
│   ├── CHANGELOG_v12.md                  # v12.0/12.0.1 detail
│   ├── CONTENT_EDITOR_PATH1_BLUEPRINT.md # Notion native block spec (deferred)
│   ├── ENGINEERING_MEMORY_HANDOFF.md     # Day 1 close handoff
│   ├── README.md                         # docs/ folder README
│   ├── ROADMAP.md                        # TD-1 to TD-9 + v11+ priority
│   ├── SETUP_NOTION_SYNC.md              # User guide
│   ├── STATE_SCHEMA.md                   # Schemas (⚠ stale)
│   ├── TECHNICAL_NOTES.md                # G1-G18 + debug commands
│   ├── TEMPLATE_VERSION_ENTRY.md         # CHANGELOG entry template
│   ├── V11_1B_EXPERIENCE_POLISH.md       # Polish specs (mostly superseded)
│   ├── V11_1_DEBUG_PANEL.md              # Debug panel docs
│   ├── V11_1_PATCHES.md                  # v11.1 patches ledger
│   ├── V11_2_REDESIGN_BLUEPRINT.md       # ★ v13.0 spec base
│   └── VERIFY_REPORT_v11_1.md            # v11.1 verify report
│
├── index.html                            # UI shell (2099 lines, 100KB)
│
├── content.js                            # v5+ loader for content.json
├── app.js                                # v3-v6 state engine + game logic
├── audio.js                              # v8 Web Speech API wrapper
├── app_v7_layout.js                      # v7 layout config engine
├── app_v8_experience.js                  # v8 audio + focus
│
├── blocks.js                             # v9 → v2 (21 block renderers)
├── app_v9_blocks.js                      # v9 blocks hook into topic detail
│
├── adaptive.js                           # v10 adaptive memory engine
├── metrics.js                            # v10 metrics
├── coach.js                              # v10 rule-based insights
├── app_v10_integration.js                # v10 hooks
│
├── phrases.js                            # v11 — TD-2 zone (mock)
├── today.js                              # v11 — TD-2 zone (mock)
├── app_v11_today.js                      # v11 — TD-2 zone (Today Queue mock data)
│
├── debug_panel.js                        # v11.1 Internal Insight Panel
├── nav_polish.js                         # v11.1.1-1.8 stabilize patches
├── app_v11_1_9_levelmap_fix.js           # v11.1.9 Level Map click
├── app_v11_1_10_heatmap_fillmap.js       # v11.1.10 heatmap fill
├── app_v11_1_11_progress_layout.js       # v11.1.11 Progress empty-canvas
├── app_v11_1_12_polish_bundle.js         # v11.1.12 polish (queue-tab binding)
├── app_v11_1_13_polish_bundle2.js        # v11.1.13 polish bundle 2
├── app_v11_1_14_day21_stage.js           # v11.1.14 Day 21 tab
│
├── app_v12_editor.js                     # ★ Day 3: Visual Content Editor
├── app_v13_redesign.js                   # ★ Day 3: Living cards rewrite
├── app_v13_2_review.js                   # ★ Day 3: Review Engine page populate
│
├── content.json                          # Topic data (Notion-synced)
├── layout.json                           # UI defaults (v7)
├── data.json                             # Legacy seed (deprecated)
├── manifest.json                         # PWA manifest
└── sw.js                                 # Service Worker
```

**Module purpose mini-table:**

| Module | Purpose |
|---|---|
| `index.html` | UI shell, script tag loads |
| `content.js` | Fetches content.json on load |
| `app.js` | State engine (shadowEN.state) + game logic + render() |
| `audio.js` | TTS via Web Speech API |
| `app_v7_layout.js` | Theme + sections customization via layout.json |
| `app_v8_experience.js` | Audio integration + focus mode |
| `blocks.js` | 21 block type renderers (paragraph, heading, video, etc.) |
| `app_v9_blocks.js` | Hooks blocks into topic detail render |
| `adaptive.js` | calculateForgetRisk, salvageability, nextReview |
| `metrics.js` | Real metrics computations |
| `coach.js` | Rule-based insights (10+ patterns) |
| `app_v10_integration.js` | Wires adaptive/metrics/coach into UI |
| `phrases.js` | Survival phrases — uses mock data |
| `today.js` | Today Focus card render |
| `app_v11_today.js` | Today Queue tabs + table — uses mock data (TD-2) |
| `debug_panel.js` | Internal Insight Panel (right side floating, opt-in via SHADOW_DEBUG.enable()) |
| `nav_polish.js` | v11.1.1-1.8 stabilize patches (multiple small fixes) |
| `app_v11_1_9_*.js` to `app_v11_1_14_*.js` | Day 1 polish ship — small CSS/behavior fixes per version |
| `app_v12_editor.js` | Day 3 — Visual content editor (1100+ lines, 50KB) |
| `app_v13_redesign.js` | Day 3 — Living cards (HERO/TODAY GOAL/MEMORY) (700+ lines) |
| `app_v13_2_review.js` | Day 3 — Review Engine standalone page populate (484 lines) |

---

## 12. AI QUICK START PACKAGE

> If you only have 5 minutes, read this section. It distills 80% of project context.

### What is Shadow English?

A web app at https://truongcrm.github.io/shadow-english-dashboard/ that helps a Vietnamese coach (Dương Trường) practice English via Spaced Repetition + Shadowing methodology. NOT a course platform. NOT analytics dashboard. It is a **"Living Memory Recovery System"** — turning English from knowledge into reflex.

### Tech stack

Vanilla JS · GitHub Pages static · Notion CMS (sync hourly) · localStorage for user state · No backend · No framework · No build · No npm.

### Owner profile

Dương Trường (TruongCRM on GitHub). Vietnamese solopreneur. **Non-technical** but ships fast. Prefers Vietnamese language. Prefers system-thinking tone (root cause not surface fix). HATES generic advice and dopamine-empty features. PREFERS rough-but-working today over perfect-architecture later. Default mode (post Day 1): "SHIP → USE → FIX LIVE."

### Architecture (9 layers)

Content (Notion CMS) → Blocks (21 types) → Adaptive (forget risk) → Metrics → Coach → UI (layout.json) → Observability (debug panel) → Editor (Day 3) → Identity (Day 3).

### Day 3 ship (today, 2026-05-29)

~25 commits shipping Phases 1-4 of Visual Content Editor (v12.0-v12.3) + Living Memory Recovery cards (v13.0) + Mobile hotfixes (v13.1.1-7) + Review Engine page populate (v13.2). All Verified, all Pages green.

### Critical files

- `app_v12_editor.js` — Visual editor (block CRUD + drag-drop + inline edit + GitHub sync)
- `app_v13_redesign.js` — Living cards (Hero Identity, Daily Compass, Memory Health)
- `app_v13_2_review.js` — Review Engine page (filter tabs + queue table)
- `blocks.js` — 21 block renderers
- `index.html` — UI shell, script tag loads with `?v=N` cache-bust
- `docs/V11_2_REDESIGN_BLUEPRINT.md` — Spec base for v13.0
- `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md` — Notion native parser spec (deferred)

### Critical decisions

- D-001: Notion source of truth + user OVERLAY edits in app
- D-003: GitHub Pages, no backend (hard constraint)
- D-006: SHIP → USE → FIX LIVE mode (Day 3 pivot)
- D-007: Multi-device via GitHub overlays.json (Path C, not Notion API)
- D-008: v11.2 paradigm REWRITE (not polish) for emotional brief
- D-009: Additive overlay model (don't replace native content)

### Critical bugs / gotchas

- **G3:** Files >70KB truncate in web_fetch tool — use Chrome MCP fetch
- **G7:** Cache-bust mandatory on JS update — two-commit ship pattern
- **G10:** Verify file in repo after upload (silent commit drop possible)
- **G11:** REWRITE not patch for emotional briefs (Day 1 lesson)
- **G16:** Global state is `shadowEN.state`, not `window.state`
- **G17:** CodeMirror 6 + execCommand insertText works for programmatic GitHub commits
- **G18:** Floating absolute UI conflicts with pre-existing fixed panels
- **TD-9:** Sync workflow silently fails if NOTION_TOKEN/DB env vars missing (resolved Day 3)
- **Mobile vertical text:** Parent grid with min-width forces char-wrap. Fix via aggressive `@media (max-width: 700px) { .card { grid-column: 1 / -1; min-width: 0 } }` + targeted class fixes

### Workflow for next AI

1. User describes task in Vietnamese (or English mixed)
2. You apply system thinking (root cause not surface fix)
3. You ship via Chrome MCP javascript_tool (fetch raw + modify + paste via execCommand to CodeMirror)
4. Two-commit ship: file change + cache-bust query bump in index.html
5. Verify Pages green via Actions tab
6. Verify live via `?v=N-test` URL query
7. Report results to user
8. If bug surfaces from user testing → fix live ("fix live" workflow)

### Open priorities (sorted)

1. User test v13.1.7 + v13.2 stability on real mobile device
2. Cleanup docs (merge CHANGELOG_v12.md + this file into docs/)
3. Anh populate Notion DB (currently only 1 topic — many features blocked by empty data)
4. v14 Creator Mode advanced (after Phase 1-4 stable)
5. README workflow status badge (TD-9 future visibility)

### What NOT to do

- ❌ Don't introduce React/Vue/Svelte (zero-build constraint)
- ❌ Don't add backend (Cloudflare Worker, Vercel function)
- ❌ Don't hardcode English content in JS
- ❌ Don't ship without cache-bust query bump
- ❌ Don't polish v11.x cards (paradigm shift complete in v13.0)
- ❌ Don't write Notion API write-back code without explicit user decision (Path A/B deferred)
- ❌ Don't show users absolute file paths from your sandbox (they don't exist on user's computer)

### Reference commands (browser console)

```js
// === STATE ===
shadowEN.state                       // Full state
shadowEN.state.topics.slice(0, 3)    // First 3 topics
shadowEN.reset()                     // Reset state (debug)

// === V10 INTELLIGENCE ===
v10.metrics()                        // Real metrics
v10.insights()                       // Coach insights
v10.riskAll().slice(0, 10)           // Top 10 risk topics

// === DEBUG PANEL ===
SHADOW_DEBUG.enable()                // Show panel
SHADOW_DEBUG.memoryDistribution()    // Counts per status
SHADOW_DEBUG.rescueRanking(8)        // Top 8 to rescue

// === v12 EDITOR ===
SHADOW_V12._info()                   // Version + state
SHADOW_V12.toggleEditMode()          // Toggle edit
SHADOW_V12.addBlock(topicId, 'paragraph', { text: 'Hello' })
SHADOW_V12.gh.hasPAT()               // Check if GitHub sync enabled

// === v13 LIVING CARDS ===
SHADOW_V13._info()                   // Identity tier, journey, memoryHealth
SHADOW_V13.renderAll()               // Force re-render 3 cards

// === v13.2 REVIEW PAGE ===
SHADOW_V13_2._info()                 // Topic count, active filter
SHADOW_V13_2.renderReviewPage()      // Force re-render review queue

// === CACHE NUKE ===
(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  const names = await caches.keys();
  await Promise.all(names.map(n => caches.delete(n)));
  location.reload();
})()
```

### Final advice

When in doubt, follow these heuristics:
- **System thinking first** — surface root cause before fixing surface
- **Push back honestly** when scope conflicts or wrong path detected (G11 lesson)
- **Ask 1 clarifying question** before shipping large change (use AskUserQuestion tool)
- **Document immediately** — Update changelog within same ship
- **Honor user's "ship today" mode** but flag risks before commit

---

## 13. METADATA

| Field | Value |
|---|---|
| **Generated At** | 2026-05-29 (Day 3 evening close) |
| **Current Date** | 2026-05-29 (Friday) |
| **Current Phase** | Day 3 close — Visual Editor + Living Cards + Review Engine page ALL shipped |
| **Current Priority** | User testing v13.1.7 + v13.2 stable on real mobile |
| **Current Risks** | (1) Sync workflow silent failure pattern (TD-9 mitigation needed — README badge). (2) PAT exposed in localStorage if device shared (v12.2). (3) Anh's Notion DB nearly empty — many features blocked. (4) ~25 commits Day 3 = some untested edge cases on mobile. |
| **Current Next Step** | Anh test mobile + report bugs OR move to v14 Creator Mode advanced |
| **Latest Live URL** | https://truongcrm.github.io/shadow-english-dashboard/?v=13.2-test |
| **Latest Commit** | (See https://github.com/TruongCRM/shadow-english-dashboard/commits/main) |
| **Active modules** | app_v12_editor.js (v12.3), app_v13_redesign.js (v13.1.7), app_v13_2_review.js (v13.2.0) |
| **Engine layers** | 9 (Content + Blocks + Adaptive + Metrics + Coach + UI + Observability + Editor + Identity) |
| **Gotchas documented** | G1-G18 |
| **Tech debts open** | TD-1, TD-2, TD-3, TD-4, TD-5, TD-6 (proposed), TD-7, TD-8 (verify), TD-9 (mitigation pending) |
| **Total commits Day 3** | ~25 |
| **Files shipped Day 3** | app_v12_editor.js, app_v13_redesign.js, app_v13_2_review.js, blocks.js v2, index.html (multiple cache-bust), CHANGELOG_v12.md, CONTENT_EDITOR_PATH1_BLUEPRINT.md v2 |

---

## SIGN-OFF

This handoff document is the **engineering memory snapshot of Shadow English at end of Day 3 (2026-05-29 evening)**.

Anh has built v1 → v13.2.0 over 4 days of intense iteration. v13.0+ shipped the Living Memory Recovery paradigm shift (replacing v11.1.x polish-on-stats paradigm). v12.x shipped full Visual Content Editor. v13.2 shipped Review Engine page populate.

**Next AI: you have everything.** Read §12 first for emergency context. Read entire document if you have 30 minutes. The product is alive. The methodology is documented. Don't break it.

The user is non-technical but ships fast. Honor that mode while pushing back honestly when scope conflicts.

---

*End of AI HANDOFF PACKAGE*
*Authored by Claude (Cowork mode, opus-4.7) for Dương Trường, 2026-05-29 Day 3 close.*
*Total: 13 sections, ~80KB, single comprehensive document — replaces no other file but supplements all engineering memory.*
