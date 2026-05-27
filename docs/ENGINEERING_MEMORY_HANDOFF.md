# 🧠 SHADOW ENGLISH — ENGINEERING MEMORY HANDOFF

> **SINGLE COMPREHENSIVE DOCUMENT** for next AI / future self / external review.
> Snapshot taken Day 1 close (2026-05-27 evening) — after polish marathon + v11.2 blueprint locked.

**Purpose:** Gửi file này cho AI khác → AI hiểu toàn bộ evolution từ v1 → v11.1.14, current state, v11.2 plan, all gotchas, all tech debt — KHÔNG BỊ MẤT CONTEXT.

---

## 🌟 PROJECT ONE-PAGER

| Field | Value |
|---|---|
| **Name** | Shadow English |
| **Owner** | Dương Trường (TruongCRM on GitHub) — Vietnamese solopreneur, non-technical |
| **What** | "Operating System for English Fluency" — behavioral learning system |
| **NOT** | Course platform · Dashboard demo · Analytics tool · Quiz app |
| **IS** | Spaced Repetition + Shadowing methodology made adaptive |
| **Goal** | Turn English from "knowledge" → "reflex" (memory recovery) |
| **Repo** | https://github.com/TruongCRM/shadow-english-dashboard |
| **Live** | https://truongcrm.github.io/shadow-english-dashboard/ |
| **Stack** | Vanilla JS · No framework · No build · GitHub Pages static · Notion CMS · localStorage |
| **Started** | 2026-05-25 |
| **Current** | v11.1.14 LIVE · v11.2 blueprint locked · Day 1 of 7-day observation week |

### User context (CRITICAL for AI behavior)
- **Language:** Tiếng Việt default, English in code/docs accepted
- **Tone:** Tư duy hệ thống (system thinking) — root cause not surface
- **Profile:** Coach cho Level 2 Solopreneurs ("có khách nhưng không ổn định")
- **Hates:** generic advice · dopamine empty features · admin dashboard feel · hardcoded content
- **Loves:** real systems · measurable outcomes · calm premium UX · mobile-first

### North Stars
- **v10:** "Tôi không muốn build 'English learning dashboard'. Tôi muốn build 'Operating System for English Fluency'."
- **Day 1 evening:** "Living memory recovery system. NOT analytics dashboard. Identity + Journey + Momentum."

---

## 📊 EVOLUTION TIMELINE (v1 → v11.2 planned)

```
2026-05-25 ─ Project start
2026-05-26 ─ v1   HTML mockup
            ─ v2   PWA + SPA
            ─ v3   State engine + persistence
            ─ v4   32 topics + 13 views
            ─ v5   Notion CMS pivot (content-agnostic)
            ─ v6   5-questions + real charts + 8-step session
            ─ v7   layout.json customization
            ─ v8   Audio + Focus + Mobile (v8.0-v8.3)
            ─ v9   18 Block types
            ─ v10  Adaptive + Metrics + Coach (OS for English)
            ─ v11  Daily Loop pre-prep (phrases/today/app_v11_today — TD-2 zone)
            ─ v11.1.0  Internal Insight Panel (debug_panel.js) + deploy incident
            ─ v11.1.1-1.8  Stabilize patches (nav_polish.js + 8 sub-versions)
                          New gotchas G6-G9 surfaced

2026-05-27 ─ DAY 1 OBSERVATION WEEK + POLISH MARATHON
            ─ v11.1.9   Level Map click (event bubbling fix)
            ─ v11.1.10  Heatmap data fill (rolling 28-day)
            ─ v11.1.11  Progress Tracker empty-canvas layout
            ─ v11.1.12  Polish bundle 1 (filter + font + asym + mission)
            ─ v11.1.13  Polish bundle 2 (heatmap retarget + hero + purple + today)
            ─ v11.1.14  Day 21 stage tab
            ─ v11.1-B blueprint v2 uploaded (sections 5.9-5.12)
            ─ v11.2 blueprint locked (3 cards rewrite — HERO/TODAY GOAL/MEMORY)
            ─ User feedback: "Polish vẫn fail emotional brief. Need REWRITE not PATCH"
            ─ Path C chosen: stop ship, write V11_2_REDESIGN_BLUEPRINT.md

2026-05-28 to 2026-06-02 (Day 2-7) ─ STRICT OBSERVATION WEEK
            ─ NO code ship unless emergency bug
            ─ Engine + polish coexist for data collection

2026-06-02 9 AM ─ Day 7 auto-reminder pops
            ─ Run 5 observation questions
            ─ Decision gate: v11.2 ship vs alternative

2026-06-03+ ─ v11.2 ARCHITECTURAL REDESIGN ship (Day 8-10)
            ─ 6 waves, ~12h dev
            ─ 3 cards rewritten from scratch per blueprint
            ─ Replaces v11.1.13 hero + v11.1.12 mission inject + v11.1.10 heatmap
```

---

## 🏛 ARCHITECTURE — 6+1 LAYERS

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CONTENT LAYER (Notion CMS)                              │
│    User edits → GitHub Action hourly sync → content.json   │
│    Sources: Notion DB "Topics" + "Custom Blocks" field     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BLOCKS LAYER (v9)                                       │
│    18 block types — youtube, image, audio, quote, callout, │
│    tips, ai-prompt, note, checklist, exercise, embed, link │
│    Per topic: content.json.topics.{id}.sections[]          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ADAPTIVE LAYER (v10) — adaptive.js                       │
│    calculateForgetRisk · calculateMasteryVelocity ·         │
│    calculateSalvageability · calculateNextReview            │
│    Adapts SR intervals based on confidence + streak + decay │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. METRICS LAYER (v10) — metrics.js                         │
│    speakingMinutesThisWeek · shadowStreak ·                 │
│    recallAccuracy · phrasesMastered · weakTopicTrends ·     │
│    consistencyScore · monthlyGrowth · reviewLoadForecast    │
│    Reads state.sessionsLog + state.topics                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. COACH LAYER (v10) — coach.js                             │
│    10+ rule-based patterns — high-streak · broken-streak ·  │
│    weak-trending · momentum · need-new · etc.               │
│    Generates daily insights + post-session feedback         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UI LAYER (v7) — layout.json + app_v7_layout.js          │
│    Themes (5 presets) · Sections toggle/reorder/span        │
│    Branding · Features · localStorage overrides             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. OBSERVABILITY LAYER (v11.1+) — opt-in, pure additive    │
│    debug_panel.js (Internal Insight Panel)                  │
│    nav_polish.js (stabilize patches v11.1.1-1.8)            │
│    app_v11_1_9_levelmap_fix.js · ... · app_v11_1_14.js     │
│    All wrap window.render/navigate idempotently             │
└─────────────────────────────────────────────────────────────┘
```

**Critical rule:** NEVER hardcode content in code layer. All English content via Notion or content.json.

---

## 📂 FULL FILE INVENTORY (as of v11.1.14)

### Docs (engineering memory)
| File | Purpose | Last update |
|---|---|---|
| `docs/CHANGELOG.md` | Full version history v1→v11.1.14 | 2026-05-27 |
| `docs/AI_HANDOFF.md` | Next AI context | 2026-05-27 |
| `docs/TECHNICAL_NOTES.md` | Gotchas G1-G14 + debug commands | 2026-05-27 |
| `docs/ROADMAP.md` | TD-1 to TD-8 + v11.2 plan | 2026-05-27 |
| `docs/ARCHITECTURE.md` | System diagrams (PRE-v11.1.x) | 2026-05-26 ⚠ stale |
| `docs/STATE_SCHEMA.md` | Data structures | 2026-05-26 ⚠ stale |
| `docs/V11_1_DEBUG_PANEL.md` | Debug panel user docs | 2026-05-26 |
| `docs/V11_1_PATCHES.md` | v11.1.1-1.8 ledger | 2026-05-26 |
| `docs/VERIFY_REPORT_v11_1.md` | v11.1 verify report | 2026-05-26 |
| `docs/V11_1B_EXPERIENCE_POLISH.md` | v11.1-B blueprint v2 (12 polish specs) | 2026-05-27 |
| `docs/V11_2_REDESIGN_BLUEPRINT.md` | **v11.2 ARCHITECTURAL REDESIGN (NEXT WORK)** | 2026-05-27 |
| `docs/ENGINEERING_MEMORY_HANDOFF.md` | THIS FILE — comprehensive snapshot | 2026-05-27 |

### Code files (in load order in index.html)
```
content.js                       # v5+ loader for content.json
app.js                           # v3-v6 state engine + game logic
audio.js                         # v8 Web Speech API wrapper
app_v7_layout.js                 # v7 layout config engine
app_v8_experience.js             # v8 audio integration + focus
blocks.js                        # v9 18 block type renderers
app_v9_blocks.js                 # v9 blocks hook into topic detail
adaptive.js                      # v10 adaptive memory engine
metrics.js                       # v10 real metrics
coach.js                         # v10 rule-based insights
app_v10_integration.js           # v10 hooks (completeReview, getTodayQueue)
phrases.js                       # v11 opener phrases (TD-2 zone — undocumented)
today.js                         # v11 Today Focus render (TD-2 zone)
app_v11_today.js                 # v11 Today Queue hook (TD-2 zone, MOCK DATA)
debug_panel.js                   # v11.1 Internal Insight Panel
nav_polish.js                    # v11.1.1-1.8 stabilize patches
app_v11_1_9_levelmap_fix.js      # v11.1.9 Level Map click (event bubbling)
app_v11_1_10_heatmap_fillmap.js  # v11.1.10 heatmap rolling 28-day
app_v11_1_11_progress_layout.js  # v11.1.11 Progress empty-canvas layout
app_v11_1_12_polish_bundle.js    # v11.1.12 4-fix bundle
app_v11_1_13_polish_bundle2.js   # v11.1.13 4-fix bundle 2
app_v11_1_14_day21_stage.js      # v11.1.14 Day 21 tab
```

### Config/Data
```
manifest.json     # PWA manifest (v2)
sw.js             # Service Worker network-first (v2)
content.json      # Topic data (Notion-synced)
layout.json       # UI defaults (v7)
data.json         # Legacy seed (deprecated)
```

### User docs
```
BLOCKS_GUIDE.md          # v9 block types guide
SETUP_NOTION_SYNC.md     # v5 Notion sync setup
README.md                # Project overview
```

---

## 💾 STATE SCHEMA (localStorage)

### Keys
| Key | Purpose | Version |
|---|---|---|
| `shadow-en-state-v3` | Main state | v3+ |
| `shadow-en-layout-overrides` | UI customizations | v7+ |
| `shadow-en-debug-mode` | Debug panel toggle | v11.1+ |
| `shadow-en-checks-{topicId}-{i}` | Checklist block state | v9+ |
| `shadow-en-skip-ritual` | (v11.2 planned) ritual skip preference | v11.2+ |
| `shadow-en-mission-{day}` | (v11.2 planned) daily mission cache | v11.2+ |

### Main state shape (`shadow-en-state-v3`)

```javascript
{
  user: {
    streak: 1,           // consecutive days active
    xp: 467,             // current XP
    xpToNext: 507,       // XP needed for next level
    level: 5,            // current level
    name: "Dương Hữu Trường",  // from layout.json branding
    lastActiveDate: "Wed May 27 2026"  // toDateString format
  },

  topics: [              // 32 topics seeded
    {
      id: "L1-01",                          // stable Topic ID from Notion
      emoji: "🍔",                          // visual key
      name: "Ordering Food & Drinks",       // display
      level: 1,                             // 1 | 2 | 3
      reviewStage: "Day 3",                 // "Day 0" | "Day 1" | "Day 3" | "Day 7" | "Day 21"(v11.1.14+) | "Overdue"
      memoryStatus: "Building",             // "Fragile" | "Weak" | "Building" | "Stable" | "Automatic"
      lastReview: "2026-05-26T09:47:45.075Z",
      nextReview: "2026-05-29T09:47:45.076Z",
      masteryPct: 30,                       // 0-100
      confidence: 0,                        // last confidence 1-5 (0=never reviewed)
      sessions: 2,                          // count of completed sessions
      confidenceHistory: [4, 3, 4]          // v10+ last 20 entries
    },
    // ... 31 more
  ],

  sessionsLog: [         // append-only, ordered chronologically
    { type: "session", topicId: "L1-01", at: "2026-05-26T09:24:53.665Z" },
    { type: "session", topicId: "L1-02", at: "2026-05-26T09:28:04.542Z" },
    { type: "review", topicId: "L1-01", confidence: 4, at: "2026-05-26T09:47:45.076Z" }
  ],

  missions: {
    date: "Wed May 27 2026",  // refreshed daily
    items: [
      { task: "Dùng 1 cụm từ trong bữa ăn thật", done: false },
      { task: "Chat với AI về chủ đề này 3 phút", done: false },
      { task: "Xem video hội thoại nhà hàng", done: false },
      { task: "Ghi âm đoạn hội thoại 1 phút", done: false },
      { task: "Rủ bạn đóng vai đi nhà hàng", done: false }
    ]
  },

  currentSession: null    // active session or { topicId, step, startedAt }
}
```

### content.json shape (synced from Notion)

```javascript
{
  topics: {
    "L1-01": {
      id: "L1-01",
      name: "Ordering Food & Drinks",
      emoji: "🍔",
      level: 1,
      why: "...",                          // explain why important
      scene: "...",                        // setting/context
      phrases: {
        before: [
          { en: "Can we see the menu?", vn: "Cho tôi xem menu", level: "essential" }
        ],
        during: [...],
        after: [...]
      },
      dialogues: [
        { title: "Restaurant scene 1", lines: [
          { speaker: "Waiter", text: "Welcome..." },
          { speaker: "You", text: "..." }
        ]}
      ],
      shadow_script: "...",                // long-form for shadowing
      missions: ["mission 1", "mission 2"],
      active_recall: ["question 1", "question 2"],
      sections: [                          // v9 blocks
        { type: "youtube", url: "...", title: "..." },
        { type: "quote", text: "...", author: "..." }
      ]
    }
    // ... 31 more
  }
}
```

### Layout config (`layout.json` + localStorage overrides)

```javascript
{
  branding: {
    appName: "Shadow English",
    appIcon: "🌙",
    userName: "Dương Hữu Trường",
    footerQuote: "Every day is a step closer to fluency."
  },
  theme: {
    preset: "dark-purple",  // "dark-purple" | "ocean-blue" | "forest-green" | "sunset-orange" | "midnight"
    themes: {
      "dark-purple": { bg: "#0d0b1f", card: "#1a1838", primary: "#7c5cff", accent: "#ec4899" }
      // ... 4 more
    }
  },
  sections: [
    { id: "hero-stats", title: "HERO STATS", icon: "🔥", enabled: true, order: 0, span: 5 },
    // ... 14 more
  ],
  features: {
    showXpBar: true,
    showFooter: true,
    enableInstallPWA: true,
    showCoach: true,
    compactMode: false
  }
}
```

---

## 🌊 DAY 1 FULL LEDGER (2026-05-27)

### Numbers
- **Duration:** ~14 hours (morning to late evening)
- **Commits to main:** 11
- **Versions shipped:** 6 (v11.1.9 → v11.1.14)
- **Files created:** 6 JS + 3 docs (V11_1B blueprint v2 + V11_2 blueprint v3 + this handoff)
- **CHANGELOG entries drafted:** 6
- **User wave overrides on observation:** 5

### Wave-by-wave

#### Wave 1 (morning) — Plan blueprint
- Read 5 context files (README, AI_HANDOFF, CHANGELOG, ROADMAP, TECHNICAL_NOTES, V11_1_PATCHES, VERIFY_REPORT_v11_1)
- Confirm 3 things (phase, preferences, TDs)
- Resolve scope conflict (observation week vs v11.1-B brief)
- Create blueprint v1 (V11_1B_EXPERIENCE_POLISH.md)
- Verify v11.1.8 resume → discover Level Map click bug (event bubbling root cause)

#### Wave 2 — v11.1.9 ship
- Live diagnose root cause (event bubbling, not state race as v11.1.8 thought)
- Test runtime patch (capture-phase listener + stopPropagation) — PASS
- Write file, deploy (3 commits including blueprint upload)
- Verify live PASS

#### Wave 3 — v11.1.10/11/12 bundle + new bugs
- User reports 5 issues (heatmap, progress, review engine, today goal, font)
- Diagnose all 5 → 3 real bugs + 2 misclassified
- v11.1.10 heatmap fill — initial calendar-month, mid-session patch to rolling 28-day
- v11.1.11 progress layout (canvas empty detection)
- v11.1.12 bundle 4 fixes (filter tabs, font, asym, mission checklist)
- DEPLOY INCIDENT: G10 silent commit drop on v11.1.12 → re-upload fixed

#### Wave 4 — v11.1.13 + Wave 5 emerges
- User Wave 4 brief: HERO redesign, Progress purple, Heatmap target wrong, Today Goal layout
- v11.1.13 ships 4 fixes — most pass tests but visual STILL feels analytics
- G13 surfaced: `.hm-cell` selector matched LEGEND not main grid
- G14 surfaced: `/TODAY GOAL/` regex matched TODAY FOCUS card

#### Wave 5 — Day 21 + blueprint
- Anh adds 4 redesign specs (HERO/TODAY GOAL/MEMORY/Day 21)
- Compromise: ship Day 21 only, defer 3 redesigns to blueprint
- v11.1.14 Day 21 tab ships
- Update V11_1B blueprint with sections 5.9-5.12

#### Post-Wave 5 — Failure admit + Path C
- User reports: "UI vẫn feel analytics dashboard. Polish patches FAIL emotional brief."
- I admit FAIL + root cause analysis (G11 polish-on-architecture failure)
- Path C chosen: stop ship, write v11.2 blueprint with HTML/CSS mockups
- V11_2_REDESIGN_BLUEPRINT.md uploaded (44KB, 850 lines)

#### Doc consolidation
- User requests engineering memory system update
- Update CHANGELOG.md, AI_HANDOFF.md, TECHNICAL_NOTES.md, ROADMAP.md
- Create this comprehensive ENGINEERING_MEMORY_HANDOFF.md

### Lessons crystallized Day 1
1. **G10** — verify file in repo before next commit
2. **G11** — REWRITE not PATCH for emotional briefs
3. **G12** — observation week scope creep (track override count)
4. **G13** — selector specificity in shared classNames
5. **G14** — regex substring matching false positives
6. **Pattern:** When user repeats same brief 2+ times → previous implementation FAILED → admit + pivot
7. **Pattern:** Test runtime patch BEFORE writing file (high-confidence ship)
8. **Pattern:** Single file gộp 4 fixes = lower commit pollution
9. **Pattern:** Sign-off gates BEFORE code save iterations cost

---

## 🚨 ALL GOTCHAS G1-G14 (COMPRESSED REFERENCE)

| ID | One-liner | Surfaced |
|---|---|---|
| 1 | SW cache traps old code → bump cache + ?v=N | v2 |
| 2 | const X = {} NOT on window → window.X = X | v8 |
| 3 | HTML file truncation >1000 lines → bash heredoc | v1, v4 |
| 4 | NAV_RENDERS scope → wrap window.navigate | v8 |
| 5 | Chart.js CDN fails sandbox → try/catch + SVG fallback | v1 |
| 6 | Green commit ≠ deployed live → check Actions tab | v11.1.0 |
| 7 | JS update needs ?v=N bump → two-commit ship | v11.1.2 |
| 8 | Visual polish needs upfront spec → 4 iterations heatmap | v11.1.3-1.6 |
| 9 | Idempotent CSS injection stale-style → versioned ID | v11.1 |
| **10** | **Silent file upload commit drop → verify in repo** | **v11.1.12 (Day 1)** |
| **11** | **Polish-on-architecture fails emotional brief → REWRITE** | **v11.1.13 (Day 1)** |
| **12** | **Observation week scope creep → track overrides** | **Day 1 reflection** |
| **13** | **Selector specificity shared classNames → scope** | **v11.1.10/13 (Day 1)** |
| **14** | **Regex substring matches false positives → exact title** | **v11.1.13 (Day 1)** |

See `TECHNICAL_NOTES.md` for full descriptions + workarounds.

---

## 🚧 TECH DEBT (TD-1 to TD-8 as of Day 1 close)

| TD | Description | Priority | Blocks |
|---|---|---|---|
| TD-1 | Node 20 deprecation on Pages | Pre-v11.2 | Future deploys |
| **TD-2** | **3 v11 scripts undocumented** | **CRITICAL** | **v11.2** |
| TD-3 | Adaptive vs Debug formula ~19× divergence | Day 7 decide | Engine accuracy |
| TD-4 | `getTodayQueue` not exposed | Minor | Tooling |
| TD-5 | nav_polish.js injectCSS not versioned | Pre-v11.2 | G9 trap |
| TD-6 | (PROPOSED) Level Map data source desync | Day 7 sign-off | TD-2 zone |
| TD-7 | `cleanTodayGoal` regex too broad | Pre-v11.2 | v11.2 layout |
| TD-8 | Heatmap rolling patch propagation verify | Day 2 | Visual confirm |

---

## 🎯 v11.2 PLAN (NEXT WORK — Day 8+)

### Blueprint: `docs/V11_2_REDESIGN_BLUEPRINT.md` (44KB)

### Scope: 3 cards rewritten from scratch
1. **HERO STATS** → Living Identity Block (3-column: Identity 28% / Memory Journey 44% / Living Now 28%)
2. **TODAY GOAL** → Daily Emotional Compass (NOT duplicate TODAY FOCUS)
3. **MEMORY STATUS** → Health Panel (state badge + breakdown + meaningful heatmap + interpretation layer)

### What gets replaced from v11.1.x
| Version | v11.2 decision |
|---|---|
| v11.1.9 Level Map click | ✅ KEEP |
| v11.1.10 Heatmap fill | 🔄 REPLACE (new heatmap with tooltips per blueprint §3) |
| v11.1.11 Progress empty-canvas | ✅ KEEP |
| v11.1.12 polish bundle | 🟡 PARTIAL (filter + font KEEP, mission checklist REVERT) |
| v11.1.13 polish bundle 2 | 🔴 MOSTLY REVERT |
| v11.1.14 Day 21 | ✅ KEEP |

### Pre-flight checklist
- [ ] TD-2 archaeology (Day 8 morning, ~1h)
- [ ] TD-5 close nav_polish.js versioned CSS
- [ ] User sign-off §6 sheet in V11.2 blueprint (HTML mockups + copy library + acceptance criteria)

### Ship plan (Day 8-10, ~12h total)
- Wave 1 (Day 8, 2h): TD-2 archaeology + revert v11.1.13 hero + v11.1.12 mission inject
- Wave 2 (Day 8, 3h): HERO STATS rewrite
- Wave 3 (Day 9, 2h): TODAY GOAL rewrite
- Wave 4 (Day 9-10, 3h): MEMORY STATUS rewrite
- Wave 5 (Day 10, 2h): Integration + mobile testing
- Wave 6 (Day 10): CHANGELOG entry as v11.2.0

---

## 🔍 CURRENT LIVE STATE SCREENSHOT REFERENCES

(Visual evidence captured during Day 1 verification — describe what each represents)

### Screenshot 1 — Home dashboard top section
- Greeting: "Good morning, Dương Hữu Trường" + Shadow Apprentice level
- HÔM NAY card: italic quote "Buổi sáng tốt cho phản xạ. Bắt đầu từ những gì sắp quên." (font Việt clean after v11.1.12)
- Survival Patterns: 5 phrase rows (I'm... / I'd Like... / Can I... / What's... / How Much...) with "N HOÀN CẢNH" badges
- Rescue section: Asking for Directions (Weak) + Ordering Food & Drinks (Building)
- Memory Pulse: 32 colored dots Fragile→Weak→Building→Stable→Automatic

### Screenshot 2 — Internal Insight Panel (debug_panel.js)
- INTERNAL INSIGHT V11.1 header (right side, floating)
- "32 topics · 1 in queue today · 2 reviewed · 30 never"
- Memory Distribution: 30 Fragile · 1 Weak · 1 Building · 0 Stable · 0 Automatic
- Rescue Ranking by salvageability: L1-01 (0.27) > L1-03 (0.75) > L1-04 (0.75) > ...
- formulas visible: `salv = forget_risk × max(0.1, mastery)`

### Screenshot 3 — Topic detail (after Level Map click fix v11.1.9)
- Title: "Ordering Food & Drinks"
- Mastery 30% · Building · 2 sessions completed · Day 3 badge
- WHY THIS TOPIC + THE SCENE + CORE PHRASES sections
- START SESSION button (gold gradient)

### Screenshot 4 — Review Engine TODAY QUEUE (post v11.1.14)
- 6 tabs: All (6) · Day 1 (4) · Day 3 (1) · Day 7 (1) · **Day 21 (0)** (purple active) · Overdue (0)
- 6 mock rows (Hotel Check-in, Small Talk, At the Airport, Directions, Shopping, Taxi) — **TD-2 zone confirmed mock data**

### Screenshot 5 — MEMORY STATUS OVERVIEW (v11.1.13 heatmap retarget visible)
- "🧠 MEMORY STATUS OVERVIEW" title
- Memory list: Fragile 30 (94%) · Weak 1 (3%) · Building 1 (3%) · Stable 0 · Automatic 0
- Average: 68
- Review Heatmap This Month: 28 cells visible (4 weeks Mon-Sun)
- Legend "Less ●●●●● More" at bottom
- 4 cells colored in DOM but may need SW clear to see visually

### Screenshot 6 — HERO STATS v11.1.13 (Wave 5 said FAILS emotional brief)
- "🔥 STREAK" row: 1 orange dot + 14 empty dots + "🎯 3d" milestone chip + "1 / 3 days · next milestone"
- "LV 5 · XP PROGRESS · → LV 6" row with progress bar 407/507 XP

→ **This is what v11.2 will REPLACE with Living Identity Block**

---

## 📅 OBSERVATION WEEK PLAN (Day 1-7)

### Day-by-day
- **Day 1 (2026-05-27) ✅ DONE** — Polish marathon + v11.2 blueprint locked
- **Day 2 (2026-05-28)** — STRICT no-code. Anh review V11_2_REDESIGN_BLUEPRINT.md morning.
- **Day 3-6 (2026-05-29 → 06-01)** — Anh dùng app naturally. Engine collects data.
- **Day 7 (2026-06-02 9 AM)** — Auto-reminder pops:
  - Run 5 observation questions
  - Decision gate v11.2 ship vs alternative

### 5 Observation Questions (from V11_1_DEBUG_PANEL §"Observation week")
1. Are Fragile topics actually rescued first?
2. Is `age` weighted too high vs `memory`? (19× divergence suggests YES)
3. Are survival phrases real cross-topic or noise?
4. Does QUEUED rank align with non-QUEUED rank?
5. After ≥5 reviews — does memory distribution shift visibly?

---

## 🎤 GUIDANCE FOR NEXT AI

### When you arrive (next AI session)

1. **Read THIS file first.** Then:
   - `docs/CHANGELOG.md` top 3 entries
   - `docs/V11_2_REDESIGN_BLUEPRINT.md` (your immediate task)
   - `docs/TECHNICAL_NOTES.md` (G1-G14)
   - `docs/AI_HANDOFF.md`

2. **Check date vs observation week (Day 1 = 2026-05-27, Day 7 = 2026-06-02):**
   - In observation week → STRICT NO CODE unless emergency
   - After Day 7 → Day 8 ship v11.2 per blueprint

3. **For ANY user request, ask:**
   - Is this a STABILIZE bug (broken UI lies)? → may ship
   - Is this a FEATURE request? → defer to roadmap unless explicit override
   - Is this an EMOTIONAL brief ("feels wrong")? → REWRITE not PATCH (G11)

4. **For ANY visual change:**
   - Sign-off concrete dimensions/copy BEFORE code (G8)
   - HTML mockup CONCRETE (not "concept")
   - Acceptance criteria measurable

5. **For ANY deploy:**
   - Verify file in repo after upload (G10)
   - Bump `?v=N` cache-bust (G7)
   - Verify Actions tab green (G6)
   - Test via `?v=N-bust` URL

6. **For ANY commit:**
   - Update `docs/CHANGELOG.md` with TEMPLATE format
   - One commit per logical change

### What user is exhausted from
- Repeated explanation of emotional vision (treat carefully)
- 6 ships in one day (don't repeat)
- Polish patches that "felt almost right but not quite" (rewrite for emotional)

### What user trusts you to do
- Honest scope estimates
- Push back when scope conflicts (observation rule)
- Document everything (anh sends docs to other AI)
- System thinking framing (root cause not surface)

---

## 🔮 BEYOND v11.2

If v11.2 ships clean (Day 10-15):
- v12 — Creator Mode (CMS UI inside app)
- v13 — Offline-first PWA + audio cache
- v14 — Gamification 2.0 (achievements serving consistency, NOT dopamine)
- v15 — Memory Graph + survival phrases visualization
- v16+ — Audio Intelligence (pronunciation feedback via Whisper or browser SR)

See `ROADMAP.md` for full backlog + out-of-scope items.

---

## ⚠️ NOT TO DO LIST (compressed from all sources)

- ❌ Don't hardcode English content
- ❌ Don't break localStorage schema without bumping key version
- ❌ Don't add framework (React/Vue) — zero-build constraint
- ❌ Don't add backend until truly needed
- ❌ Don't ship multiple times/day in observation week
- ❌ Don't trust green commit means live (verify Actions)
- ❌ Don't trust file upload commit (verify file in repo)
- ❌ Don't skip cache-bust query bump on JS updates
- ❌ Don't iterate visual polish on live (use upfront spec)
- ❌ Don't use unscoped selectors on shared classNames
- ❌ Don't use regex substring matching for card finding
- ❌ Don't polish over architecture for emotional briefs (REWRITE)
- ❌ Don't make dopamine empty achievements (user explicit hate)
- ❌ Don't create admin dashboard feel (user explicit hate)

---

## 📞 USEFUL CONSOLE COMMANDS

```js
// === STATE ===
shadowEN.state
shadowEN.state.topics.slice(0,3)
shadowEN.reset()

// === v10 INTELLIGENCE ===
v10.metrics() ; v10.insights() ; v10.riskAll().slice(0, 10)

// === DEBUG PANEL ===
SHADOW_DEBUG.enable() / .toggle()
SHADOW_DEBUG.memoryDistribution()
SHADOW_DEBUG.rescueRanking(8)

// === DAY 1 POLISH MODULES (all expose _info()) ===
SHADOW_LEVELMAP_FIX._info()      // v11.1.9
SHADOW_HEATMAP_FILL._info()      // v11.1.10
SHADOW_PROGRESS_LAYOUT._info()   // v11.1.11
SHADOW_POLISH_1112._info()       // v11.1.12
SHADOW_POLISH_1113._info()       // v11.1.13
SHADOW_DAY21._info()             // v11.1.14
SHADOW_NAV_POLISH._info()        // v11.1.1-1.8

// === CACHE NUKE ===
(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  const names = await caches.keys();
  await Promise.all(names.map(n => caches.delete(n)));
  location.reload();
})()
```

---

## 🌙 SIGN-OFF

This document is the **engineering memory snapshot of Shadow English at end of Day 1 (2026-05-27)**.

Anh has built v1→v11.1.14 over 2-3 days of intense iteration. v11.2 is the planned architectural redesign that will replace polish-on-stats-paradigm with living-memory-recovery-paradigm.

Next AI: you have everything. Honor the observation week. Listen for emotional briefs. REWRITE when needed. Document always.

The product is alive. The methodology is documented. Just don't break it.

---

*Last update: 2026-05-27 evening (Day 1 close).*
*Authored by Claude (Cowork mode, opus-4.7) for Dương Trường.*
*Single comprehensive handoff document — replaces no other file, supplements all.*
