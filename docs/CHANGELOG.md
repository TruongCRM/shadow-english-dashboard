# 📜 SHADOW ENGLISH — CHANGELOG

> Engineering memory system. Mỗi version có context đầy đủ để AI tiếp theo hiểu evolution mà không mất ngữ cảnh.

**Repo:** https://github.com/TruongCRM/shadow-english-dashboard
**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
**Owner:** TruongCRM (Dương Trường — solopreneur, non-technical)
**Started:** 2026-05-25
**Last update:** 2026-05-27 (Day 1 of observation week — v11.1.14 shipped + v11.2 blueprint locked)

---

## 🔭 BIG PICTURE EVOLUTION

```
v1     →  HTML mockup (static)
v2     →  PWA + SPA
v3     →  Real state engine + persistence
v4     →  Real content 32 topics + 13 views
v5     →  Content-agnostic (Notion CMS)
v6     →  Real charts + 8-step session
v7     →  UI customization (layout.json)
v8.x   →  Audio + Focus + Mobile-first
v9     →  18 Block types (rich content)
v10    →  Adaptive + Metrics + Coach (OS for English)
v11    →  Daily Loop pre-prep (phrases.js / today.js / app_v11_today.js — TD-2 zone)
v11.1.0–v11.1.8  → STABILIZE — Internal Insight Panel + nav fixes
v11.1.9–v11.1.14 → POLISH WAVES 1-5 (Day 1 = 2026-05-27 marathon)
v11.2  → ARCHITECTURAL REDESIGN (planned, blueprint locked, ship Day 8+)
```

---

## v1.0 — HTML Dashboard Mockup (2026-05-26)

[unchanged — see v1 section below — kept verbatim for handoff continuity]

### Goal
Recreate the dashboard from a reference image (Shadow English Home Dashboard) as a clean HTML mockup. Dark theme, sidebar nav, 5 top stats, today focus, memory donut, level map.

### Built
- Single `shadow_english_dashboard.html` (~1100 lines)
- Sidebar with nav items (Learning Engine · Knowledge World · Tracking · Resources)
- Topbar with breadcrumb + search + avatar
- 5 hero stat cards with sparklines (Chart.js)
- Today Focus + Memory Donut + Heatmap + Level Map
- Review Queue table + Calendar + Progress Tracker

### Problems / Fixes / Lessons
- Chart.js CORS in sandbox → SVG fallback functions
- HTML file truncation >50KB → bash heredoc
- `const NAV_RENDERS = {...}` module-scoped → use `window.X = X`

---

## v2.0 — PWA + Multi-view SPA + Adaptive UI (2026-05-26)

### Goal
Transform single-page mockup into installable PWA. Multi-view navigation. Time-aware greeting.

### Built
- `manifest.json` (PWA install)
- `sw.js` (Service Worker — network-first cache)
- Multi-view system via `display: contents`
- Adaptive greeting + day-of-week coach insight
- XP bar with level chip

### Architecture change
- Single page → multi-view SPA (no router, CSS toggle)
- Cache Storage offline support

---

## v3.0 — Real State Engine + Persistence (2026-05-26)

### Goal
Replace all fake numbers with REAL state engine. State persists across reloads.

### Built
- `app.js` state engine: `state = { user, topics[], sessionsLog[], missions, currentSession }`
- `loadState()`/`saveState()` to localStorage key `shadow-en-state-v3`
- 32 topics seeded
- Game logic: `awardXP`, `updateStreak`, `completeReview`, `completeSession`, `getTodayQueue`

### Architecture change
- **State** is single source of truth
- **localStorage key version-baked** = `shadow-en-state-v3` (enables migrations)
- `window.shadowEN = { state, render, reset }` for console debug

### Lessons
- Render function should be **idempotent**
- Store schema version in localStorage key

---

## v4.0 — Real Content for 32 Topics + 13 Views (2026-05-26)

### Goal
Add REAL English learning content. Replace placeholder views with real implementations.

### Built
- `content.js` with TOPIC_CONTENT (5 rich, 27 skeletal)
- Real views: Topic Detail, Level 1/2/3, All Topics, Progress, Calendar, Memory Log, Stats, Missions, Phrases Bank
- Review Modal with 5-confidence buttons

### Architecture change
- Content separated into `content.js`
- Topic detail rendered dynamically

### Lessons
- HTML file truncation → bash heredoc + cat for >1000 line files
- CSS injection point matters

---

## v5.0 — Content-Agnostic Architecture (Notion CMS) (2026-05-26)

### Goal
**Fundamental architecture pivot.** Code must not contain hardcoded content. All topics editable in Notion.

### Built
- `content.json` — extracted data
- `content.js` → tiny loader fetching content.json
- `.github/workflows/sync-from-notion.yml` — hourly cron
- `scripts/sync-from-notion.js` — Notion API → JSON
- 11 new Notion DB fields

### Architecture change
```
Notion (CMS)
  ↓ GitHub Action (hourly)
content.json (in repo)
  ↓ fetch on page load
Dashboard renders
```

### Lessons
- Never hardcode content
- GitHub Action + Secrets = secure sync

---

## v6.0 — Dashboard 5-Questions + Real Charts + 8-Step Session (2026-05-26)

### Goal
Dashboard answers 5 user questions immediately. Real data charts. 8-step session matching philosophy.

### Built
- 5-Questions Panel at top of home
- Real heatmap from sessionsLog
- Real calendar from `nextReview` dates
- 8-step session: WARM-UP → LISTEN → SHADOW → REPEAT → RECALL → SPEAK → MISSION → REFLECTION

### Architecture change
- Charts read from `state.sessionsLog` + `state.topics[].nextReview`

---

## v7.0 — UI Customization Layer (layout.json + Settings) (2026-05-26)

### Goal
**Third architecture layer.** User toggles sections, themes, branding without code.

### Built
- `layout.json` schema (branding, theme, sections, features)
- `app_v7_layout.js` (loadLayoutConfig, applyLayout, openSettings)
- 5 theme presets
- 15 sections tagged with `data-section-id`
- Gear ⚙️ icon → settings modal

### Architecture change
- `layout.json` = defaults, `localStorage shadow-en-layout-overrides` = customizations
- Deep merge with overrides winning

---

## v8.0–v8.3 — Real Learning Experience (Audio, Focus, Mobile) (2026-05-26)

### Goal
Audio for shadowing, focus mode, mobile-first responsive, calm typography.

### Built
- `audio.js` (Web Speech API, TTS, MediaRecorder)
- Audio buttons auto-attach via `setInterval(1500)` enhancement
- Speed controls 0.75×/1×/1.25×, loop mode
- Focus mode (hide nav, ESC to exit)
- Keyboard shortcuts (Space/R/S/L/N/Enter/F/Esc)
- Mobile responsive (sidebar 64px, touch targets ≥44px)
- Calm typography (serif for shadow script)

### Lessons
- NAV_RENDERS scope issue → wrap `window.navigate`
- v8.3 brute-force `setInterval` more reliable than MutationObserver alone

---

## v9.0 — Custom Content Blocks System (2026-05-26)

### Goal
Per-topic editable rich content blocks (18 types).

### Built
- `blocks.js` with 18 type renderers (youtube, vimeo, image, audio, pdf, quote, callout, tips, ai-prompt, note, checklist, exercise, embed, link, heading, divider, spacer, html)
- Block schema in `content.json.topics.{id}.sections[]`
- Notion `Custom Blocks` field with JSON parser fallback
- `BLOCKS_GUIDE.md` user docs

### Architecture change
- Content scope expanded — rich media per topic
- Each block renderer = pure function

---

## v10.0 — OS for English Fluency (Adaptive + Metrics + Coach) (2026-05-26)

### Goal
Per user vision: transition from "dashboard" to **"Operating System for English Fluency"**.

### Built
- `adaptive.js` (Adaptive Memory Engine — forget risk, mastery velocity, salvageability, next review adaptive interval)
- `metrics.js` (speaking minutes, shadow streak, recall accuracy, consistency score, forecast)
- `coach.js` (rule-based insights, post-session feedback, daily greeting)
- `app_v10_integration.js` (override `completeReview`, `getTodayQueue`)

### Architecture change — 6 layers established
```
1. CONTENT   → Notion CMS → content.json
2. BLOCKS    → v9 rich content
3. ADAPTIVE  → v10 forget risk, mastery velocity
4. METRICS   → v10 real computations
5. COACH     → v10 rule-based insights
6. UI        → v7 layout.json
```

### Lessons
- Rule-based AI coach good enough for 90%
- Adaptive SR > fixed SR
- Real metrics > fake numbers

---

## v11.0 — Daily Loop Pre-prep (date unknown — TD-2 zone)

> ⚠️ **TD-2 archaeology required.** These 3 files exist in repo but no CHANGELOG entry was written when shipped. Surfaced during v11.1.x verify session.

### Files shipped (no detailed entry)
- `phrases.js?v=11` — likely "opener phrases" analyzer (cross-topic survival phrases)
- `today.js?v=11` — Today Focus card render logic
- `app_v11_today.js?v=11` — Today Queue hook (with mock data per Day 1 finding)

### Status
- **Mock data confirmed** in Today Queue: 6 fake topics (Hotel Check-in, Small Talk, Taxi...) NOT in state.topics
- **Unknown architecture impact** — these modules wrap `window.render` and inject DOM
- **Action required Day 8+:** archaeology session to document each module + understand data sources

---

## v11.1 — Internal Insight Panel + STABILIZE phase (2026-05-26 evening)

### Goal
Transparency layer for adaptive memory engine — let user (and future AI) see WHY topics are prioritized. Plus: STABILIZE-then-build discipline.

### Built
- `debug_panel.js` — Internal Insight Panel:
  - Toggle via `?debug=1` query OR `SHADOW_DEBUG.toggle()`
  - Memory distribution (Fragile/Weak/Building/Stable/Automatic counts)
  - Rescue Ranking by salvageability (top N)
  - Forget Risk breakdown per topic (age + memory + confidence + adaptive components)
  - Survival patterns (cross-topic phrases)
- `docs/V11_1_DEBUG_PANEL.md` — full documentation
- `docs/VERIFY_REPORT_v11_1.md` — 9/10 verify checklist passed

### Deploy incident (G6 surfaced)
- `pages-build-deployment` failed 5× consecutively (GitHub infra issue downloading jekyll-build-pages action)
- Diagnostic initially looked at client-side cache → WRONG
- Resolved by clicking "Re-run failed jobs" → infra cleared

### Architecture change
- **New layer (Observability):** debug_panel.js sits opt-in beside main engine
- Now **6+1 layers** (CONTENT, BLOCKS, ADAPTIVE, METRICS, COACH, UI + OBSERVABILITY)

### New gotcha
- **G6 — Green commit ≠ deployed live** (added to TECHNICAL_NOTES)

### Tech debt opened
- TD-1: Node 20 deprecation on Pages build
- TD-2: 3 v11 scripts undocumented (phrases.js, today.js, app_v11_today.js)
- TD-3: Adaptive vs Debug formula divergence ~19×
- TD-4: `getTodayQueue` not exposed

---

## v11.1.1–v11.1.8 — STABILIZE patches (2026-05-26 evening, one session)

### Summary
8 sub-version patches on top of v11.1 fixing 3 categories of bugs:
1. **Navigation affordance** (Level Map cards + Today Queue rows had cursor:pointer but no click handler)
2. **Heatmap layout** (broken CSS grid `repeat(28, 1fr)` from v6 era)
3. **Level Map %** hardcoded 0% + topic icon click fallback

### Built
- `nav_polish.js` (~14KB, ~350 LOC at v11.1.8) — pure additive observability/stabilize patch
- 7 cache-bust query bumps in index.html (`?v=11.1.1` → `11.1.8`)

### Patch-by-patch (compressed — full ledger in `docs/V11_1_PATCHES.md`)

| Sub-version | Focus |
|---|---|
| v11.1.1 | Click handlers for Level cards + Review rows |
| v11.1.2 | Heatmap structural CSS fix |
| v11.1.3-1.6 | Heatmap visual iteration (4 rounds — G8 surfaced) |
| v11.1.7 | Level Map real % + topic icon click |
| v11.1.8 | Click-time emoji lookup (state-race-safe) |

### New gotchas (G7-G9)
- **G7 — JS file update needs `?v=N` bump** (every JS update = 2-commit ship)
- **G8 — Visual polish needs upfront spec** (heatmap iterated 4 rounds = 80 min vs 5 min spec)
- **G9 — Idempotent CSS injection has stale-style trap** (use versioned style ID)

### Architecture change
- nav_polish.js = second observability-layer file (pattern from debug_panel.js)
- Wraps `window.render` + `window.navigate` (idempotent via `__navPolishPatched`)
- 3s setInterval safety net

### Tech debt added
- TD-5: nav_polish.js injectCSS chưa versioned ID

---

## v11.1.9 — Level Map Click Hotfix (Day 1 — 2026-05-27)

### Goal
Fix Level Map topic icons click → mở đúng topic detail (KHÔNG fallback về level page).

### Built
- `app_v11_1_9_levelmap_fix.js` (~140 LOC, pure additive)
- index.html line 2094 script tag `?v=11.1.9`

### Problem
- v11.1.8 promised "click-time emoji lookup" → click still fallback to view-level1
- Manual `findTopicByEmoji('🍔', 1)` returns L1-01 correctly
- Manual `openTopic('L1-01')` opens view-topic-detail correctly
- BUT click event → view-level1

### Root cause
**Event bubbling.** Click on `.topic-icon` → `openTopic('L1-01')` runs ✓ but event bubbles to parent `.level-card` → `navigate('level1')` runs second → wins (last writer).

### Fix
Capture-phase listener with `e.stopPropagation()` + `e.stopImmediatePropagation()`. Pure additive — no edits to nav_polish.js.

### Verified
- `SHADOW_LEVELMAP_FIX._info()` = `{fixed:21, skipped_more:3, render_wrapped:true}`
- Click 🍔 → view-topic-detail "Ordering Food & Drinks" ✓

### Lessons
- Test simplest hypothesis FIRST (event bubbling before state race)
- Capture-phase + stopPropagation = clean fix (no parent file edit)
- Runtime injection BEFORE shipping file = high confidence

### Deploy commits
- `4db6165` upload file
- `7bed0ce` index.html cache-bust pair

---

## v11.1.10 — Heatmap Data Fill (Day 1 — 2026-05-27)

### Goal
REVIEW HEATMAP render 33 cells but NOT mapping sessionsLog → all cells default color.

### Built
- `app_v11_1_10_heatmap_fillmap.js` (~110 LOC)

### Problem
- 33 cells exist but empty `data-count`, `data-level`
- `state.sessionsLog` has 3 sessions but visual zero activity

### Fix
- `getSessionsByDay()` group sessionsLog by YYYY-MM-DD
- `intensityForCount()` map count → 0-4 scale
- Initial: calendar-month grid start (first Monday on or before day 1)
- **PATCH in-session:** rolling 28-day window ending today
  - Reason: 28-cell grid = 4 weeks, May 2026 spans 5 weeks → 26/5 session OUT of grid
  - Rolling = today always in grid

### Verified
- `SHADOW_HEATMAP_FILL._info()` = `{cells_with_sessions:1, total_sessions_displayed:3}`

### Discovery during Wave 4
- ⚠️ Initial fix targeted ALL `.hm-cell` (including 5-cell legend "Less ●●●●● More" dots)
- v11.1.13 retarget to `.heatmap > .hm-cell` only (main grid)

### Lessons
- Selector specificity matters (`.hm-cell` too broad)
- Calendar-month grid != monthly view of sessions (need rolling window for "always show recent")

### Deploy commits (bundle with v11.1.11)
- `a6eaba3` upload 2 files
- `aad0cac` index.html cache-bust pair (2 script tags line 2095)

---

## v11.1.11 — Progress Tracker Layout Fix (Day 1 — 2026-05-27)

### Goal
Sửa Progress Tracker card 183px gap giữa title và stats vì canvas `#progress-chart` render empty.

### Built
- `app_v11_1_11_progress_layout.js` (~120 LOC)

### Problem
- Canvas reserves 140px height nhưng Chart.js không init → empty
- Card height 470px, content 255px → 183px gap → stats sink to bottom

### Fix
- `isCanvasEmpty()` via `getImageData` pixel sampling
- If empty → add class `.progress-empty-chart` → CSS flex column + 2×2 stats grid
- Per G9 versioned style ID

### Verified
- `SHADOW_PROGRESS_LAYOUT._info()` = `{mode:"empty", empty_chart_class:true}`

### Lessons
- Empty canvas detection via pixel sampling = lightweight + reliable
- CSS class toggle > inline style (easier to revert)

---

## v11.1.12 — Polish Bundle 1 (4-in-1) (Day 1 — 2026-05-27)

### Goal
Fix 4 issues Wave 3:
- **Việc 2** — Filter tabs (All/Day 1/Day 3/Day 7/Overdue) click no-op
- **Việc 5** — Lỗi font Việt "tô ́t" "Bắ ́t" (font không support diacritics, NOT Unicode bug)
- **Việc 1** — Progress Tracker 2×2 grid (replace v11.1.11)
- **Việc 4** — Today Goal mission checklist từ state.missions.items

### Built
- `app_v11_1_12_polish_bundle.js` (~240 LOC) — single file 4 modules
- `index.html` line 2096 script tag `?v=11.1.12`

### Problem during deploy
- **First commit silently dropped file** — UI completed but commit didn't include file
- Diagnosed via `fetch('/file.js').then(...)` returning 404 HTML
- Re-upload fixed (G10 lesson)

### Verified
- All 4 modules ✓ (filter_tabs_bound:5/5, progress_card_asym:true, today_goal_rendered:true, font_css_injected:true)

### Lessons
1. **G10 — Always verify file in repo before next commit.** Silent upload failures = real risk
2. Single file gộp 4 hotfixes = lower commit pollution
3. Font rendering ≠ Unicode bug. Check FONT first before NFC/NFD normalization
4. try/catch wrap mỗi module = critical khi 1 file ship 4 things

### Deploy commits
- `?` failed silent upload
- `e5329b3` re-upload
- `?` index.html cache-bust pair

---

## v11.1.13 — Polish Bundle 2 (4-in-1) (Day 1 — 2026-05-27)

### Goal
Fix 4 issues Wave 4:
- **Việc 3** Heatmap MEMORY STATUS empty (user refresh không thấy)
- **Việc 1** HERO STATS sparse — add roadmap visualization
- **Việc 2** Progress Tracker v11.1.12 gold gradient → purple theme
- **Việc 4** Today Goal layout cleanup

### Built
- `app_v11_1_13_polish_bundle2.js` (~280 LOC)
- `index.html` line 2097 script tag `?v=11.1.13`

### Discoveries
- v11.1.10 colored cells were in LEGEND (`.heatmap-foot-right .hm-cell`), NOT main grid
- Retarget to `.heatmap > .hm-cell` only
- Mid-session patch: rolling 28-day window (calendar month spans 5 weeks)
- `cleanTodayGoal` regex matched TODAY FOCUS card (contains "TODAY GOAL" substring) instead of standalone TODAY GOAL

### Verified
- `SHADOW_POLISH_1113._info()` = `{heatmap_main_cells:28, hero_roadmap_rendered:true, today_goal_cleaned:true, css_injected:true}`
- Visual: HERO STATS shows STREAK dots + LV5/XP bar
- ⚠️ Heatmap colored=0 (rolling patch deployed but Service Worker may cache)
- ⚠️ TODAY GOAL standalone card still mock (cleaned wrong card)

### Lessons
- **G13 — Selector specificity matters in shared classNames.** `.hm-cell` too broad
- Calendar-month grid != session view (use rolling window)
- Regex substring matching = false positives across card title hierarchies
- CSS override v11.1.12 in v11.1.13 OK with G9 versioned ID

### Tech debt added
- TD-7: `cleanTodayGoal` regex needs refinement (Day 2)
- TD-8: Heatmap rolling patch propagation verify (may need SW clear)

---

## v11.1.14 — Day 21 Stage Tab (Day 1 — 2026-05-27)

### Goal
Inject "Day 21 (N)" tab into Review Engine Today Queue between Day 7 and Overdue.

### Sequence after ship
**Day 1 → Day 3 → Day 7 → Day 21 → Overdue** (5 stages + All)

### Built
- `app_v11_1_14_day21_stage.js` (~120 LOC)
- `index.html` line 2098 script tag `?v=11.1.14`

### Verified
- `SHADOW_DAY21._info()` = `{tabs_total:6, day21_present:true, day21_count:0, all_tabs_order:[All, Day 1, Day 3, Day 7, Day 21, Overdue]}`

### Lessons
- Small data extensions = small files (~120 LOC vs 240-280 LOC bundles)
- `dataset.polish1112 = '1'` cross-mark prevents v11.1.12 from re-binding

### Pending Day 8+
- Update `adaptive.js` to actually transition topics into Day 21 stage
- Document Day 21 = ~3-week SR milestone in ARCHITECTURE.md

---

## v11.2 — ARCHITECTURAL REDESIGN (PLANNED, NOT SHIPPED)

> Blueprint locked 2026-05-27 evening in `docs/V11_2_REDESIGN_BLUEPRINT.md`.
> Ship Day 8+ after observation week + user sign-off on copy/dimensions.

### Why v11.2 (not v11.1.15)
Day 1 evening user feedback after Wave 5:
> "UI thực tế hiện tại vẫn chưa match đúng direction đã mô tả. Vấn đề không phải thiếu component, mà là system vẫn đang render như analytics dashboard thay vì living English recovery system."

### Root cause analysis
v11.1.x = **polish layer trên architecture cũ**. Architecture cũ render "stats panel" paradigm. Polish patches add VENEER (streak dots, purple gradient) — vẫn cảm thấy "analytics with ribbon".

### v11.2 scope (3 cards rewritten from scratch)
- **HERO STATS** → Living Identity Block (3-column: Identity + Memory Journey + Living Now)
- **TODAY GOAL** → Daily Emotional Compass (NOT duplicate TODAY FOCUS — emotional mission)
- **MEMORY STATUS** → Health Panel (state badge + breakdown + meaningful heatmap + interpretation layer)

### What v11.1.x ships will be touched
| Version | v11.2 decision |
|---|---|
| v11.1.9 Level Map click | ✅ KEEP |
| v11.1.10 Heatmap fill | 🔄 REPLACE (v11.2 has new heatmap with tooltips) |
| v11.1.11 Progress empty-canvas | ✅ KEEP (not in 3 cards scope) |
| v11.1.12 polish bundle | 🟡 PARTIAL (filter + font KEEP, mission checklist REVERT) |
| v11.1.13 polish bundle 2 | 🔴 MOSTLY REVERT (hero roadmap → v11.2 living identity) |
| v11.1.14 Day 21 | ✅ KEEP |

### Implementation gate
Day 8+ ship ONLY when:
- [ ] User signs off HTML mockups §1.4, §2.4, §3.4
- [ ] User chooses copy library (identity tiers, mission statements, insight library)
- [ ] User confirms acceptance criteria

### Estimated effort
~12 hours dev work Day 8-10 across 6 Waves.

---

## 🆕 ALL NEW GOTCHAS FROM v11 SESSION (G6–G14)

| ID | Gotcha | When surfaced |
|---|---|---|
| G6 | Green commit ≠ deployed live (check Actions tab) | v11.1.0 deploy incident |
| G7 | JS file update needs `?v=N` bump in index.html | v11.1.2 |
| G8 | Visual polish needs upfront spec (4 iterations heatmap) | v11.1.3-1.6 |
| G9 | Idempotent CSS injection has stale-style trap (use versioned ID) | v11.1.x |
| G10 | Silent file upload commit drop (verify file in repo before next commit) | v11.1.12 |
| G11 | Polish-on-architecture pattern fails emotional brief (need REWRITE not PATCH) | v11.1.13 |
| G12 | Scope creep in observation week (anh override 5+ times Day 1) | Day 1 reflection |
| G13 | Selector specificity in shared class names (`.hm-cell` too broad) | v11.1.13 |
| G14 | Regex substring match across card titles = false positives | v11.1.13 cleanTodayGoal |

See `TECHNICAL_NOTES.md` for full descriptions + workarounds.

---

## 📈 TECH DEBT (TD-1 to TD-8 open as of Day 1 close)

| TD | Description | Priority |
|---|---|---|
| TD-1 | Node 20 deprecation on Pages build | Pre-v11.2 |
| TD-2 | 3 v11 scripts undocumented (phrases.js, today.js, app_v11_today.js) | **CRITICAL** — blocks v11.2 |
| TD-3 | Adaptive vs Debug formula divergence ~19× | Day 7 decide |
| TD-4 | `getTodayQueue` not exposed | Minor |
| TD-5 | nav_polish.js injectCSS not versioned ID | Pre-v11.2 |
| TD-6 | (PROPOSED) Level Map data source desync — DOM 🚖 not in state | Pending sign-off |
| TD-7 | `cleanTodayGoal` regex too broad | Pre-v11.2 |
| TD-8 | Heatmap rolling patch propagation verify (SW cache) | Day 2 |

---

## 📁 Repo file inventory (as of v11.1.14)

```
shadow-english-dashboard/
├── .github/workflows/sync-from-notion.yml
├── scripts/sync-from-notion.js
├── docs/                                # Engineering memory
│   ├── CHANGELOG.md                     # THIS FILE
│   ├── ARCHITECTURE.md                  # System overview
│   ├── STATE_SCHEMA.md                  # Data structures
│   ├── TECHNICAL_NOTES.md               # Gotchas G1-G14
│   ├── ROADMAP.md                       # v11.2+ priorities
│   ├── AI_HANDOFF.md                    # Next AI context
│   ├── V11_1_DEBUG_PANEL.md             # Debug panel docs
│   ├── V11_1_PATCHES.md                 # v11.1.1-1.8 ledger
│   ├── VERIFY_REPORT_v11_1.md           # v11.1 verify
│   ├── V11_1B_EXPERIENCE_POLISH.md      # v11.1-B blueprint v2 (sections 5.9-5.12)
│   ├── V11_2_REDESIGN_BLUEPRINT.md      # v11.2 redesign (3 cards rewrite)
│   └── ENGINEERING_MEMORY_HANDOFF.md    # Comprehensive AI handoff (this Day 1 snapshot)
├── index.html                           # UI shell (2098 lines)
├── app.js                               # State engine v3-v6
├── app_v7_layout.js                     # Layout config v7
├── app_v8_experience.js                 # Audio + focus v8
├── app_v9_blocks.js                     # Blocks hook v9
├── app_v10_integration.js               # Adaptive/Metrics/Coach hooks v10
├── app_v11_today.js                     # Today Focus card render v11 (TD-2)
├── app_v11_1_9_levelmap_fix.js          # Level Map click v11.1.9
├── app_v11_1_10_heatmap_fillmap.js      # Heatmap data fill v11.1.10
├── app_v11_1_11_progress_layout.js      # Progress layout v11.1.11
├── app_v11_1_12_polish_bundle.js        # 4-fix bundle v11.1.12
├── app_v11_1_13_polish_bundle2.js       # 4-fix bundle v11.1.13
├── app_v11_1_14_day21_stage.js          # Day 21 stage v11.1.14
├── audio.js                             # Web Speech v8
├── blocks.js                            # 18 block renderers v9
├── adaptive.js                          # Adaptive memory engine v10
├── metrics.js                           # Real metrics v10
├── coach.js                             # Rule-based insights v10
├── debug_panel.js                       # Internal Insight Panel v11.1
├── nav_polish.js                        # Stabilize patches v11.1.1-1.8
├── phrases.js                           # Opener phrases v11 (TD-2)
├── today.js                             # Today Focus v11 (TD-2)
├── content.js                           # Loader for content.json v5+
├── content.json                         # Topic data (Notion-synced)
├── layout.json                          # UI config defaults v7
├── manifest.json                        # PWA v2
├── sw.js                                # Service Worker v2
├── BLOCKS_GUIDE.md                      # v9 docs
├── SETUP_NOTION_SYNC.md                 # v5 docs
└── README.md                            # Project overview
```

---

## 🎯 Day 7 (2026-06-02) Decision Gate Reminder

Auto-scheduled task pops at 9:00 AM Vietnam time. Will trigger:
1. Run 5 observation questions
2. Decide between v11.2-A (back-port formula) vs v11.2-B (Daily Loop polish) vs v11.2 (full redesign — currently most likely)
3. Sign-off v11.2 blueprint per `docs/V11_2_REDESIGN_BLUEPRINT.md` §6

---

*Last update: 2026-05-27 (Day 1 close — 6 polish versions shipped, v11.2 blueprint locked, ready for Day 8+ sign-off).*
*Maintained by Claude (current AI). Continue this changelog with each version.*
