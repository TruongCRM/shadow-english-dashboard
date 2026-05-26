# 📜 SHADOW ENGLISH — CHANGELOG

> Engineering memory system. Mỗi version có context đầy đủ để AI tiếp theo hiểu evolution mà không mất ngữ cảnh.

**Repo:** https://github.com/TruongCRM/shadow-english-dashboard
**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
**Owner:** TruongCRM (Dương Trường — solopreneur, non-technical)
**Started:** 2026-05-25
**Last update:** 2026-05-26

---

## v1.0 — HTML Dashboard Mockup (2026-05-26)

### Goal
Recreate the dashboard from a reference image (Shadow English Home Dashboard) as a clean HTML mockup. Dark theme, sidebar nav, 5 top stats, today focus, memory donut, level map.

### Built
- Single `shadow_english_dashboard.html` (~1100 lines)
- Sidebar with nav items (Learning Engine · Knowledge World · Tracking · Resources)
- Topbar with breadcrumb + search + avatar
- 5 hero stat cards with sparklines (Chart.js)
- Today Focus + Memory Donut + Heatmap + Level Map
- Review Queue table + Calendar + Progress Tracker
- Real Life Missions + Next Up footer

### Problems
- **Chart.js CORS** trong Playwright sandbox blocked external CDN
- **HTML file truncation** when Write tool wrote large files (>50KB lost trailing content)

### Fixes
- Added SVG fallback functions (`svgSpark`, `svgDonut`, `svgLineChart`) — render via SVG when Chart.js fails
- Wrapped all Chart() calls in try/catch
- Used bash heredoc for large file writes instead of Write tool

### Architecture change
- Initial: single HTML file, no state, no persistence
- 5-column CSS grid layout

### Lessons learned
- **External CDN scripts with `integrity` attribute fail silently in sandbox** → blocks subsequent inline script execution
- **`const NAV_RENDERS = {...}` in script tag is module-scoped, not global** → must use `window.X = X` for cross-script access
- Always validate file sizes after Write tool calls

---

## v2.0 — PWA + Multi-view SPA + Adaptive UI (2026-05-26)

### Goal
Transform single-page mockup into installable PWA with multi-view navigation. Add time-aware greeting and adaptive UI.

### Built
- `manifest.json` (PWA install)
- `sw.js` (Service Worker — network-first cache)
- Multi-view system: `<div class="view" id="view-...">` with `display: contents`
- Sidebar nav items get `data-view` attribute, clicked → switch view
- 3 view containers: home, session, review, topics + placeholder
- Adaptive greeting: time-of-day driven (`Good morning` / `Lunch break learning` / etc.)
- Day-of-week coach insight
- XP bar with level chip + progress
- Install hint button (using `beforeinstallprompt`)
- `data.json` data layer foundation (later evolved to content.json)

### Problems
- Service Worker caching old `index.html` between deploys
- View switching needed CSS that doesn't break grid layout

### Fixes
- Used `display: contents` for views (children become direct grid items)
- Cache version bumping in SW + URL query param `?v=N`
- User must hard-refresh first time after deploy

### Architecture change
- Single page → multi-view SPA (no router, just CSS toggle)
- Added Cache Storage offline support

### Pending → Done in later
- Real data sync (deferred to v3)

---

## v3.0 — Real State Engine + Persistence (2026-05-26)

### Goal
Replace all fake numbers (XP 1247, Streak 17, Topics 32 hardcoded) with REAL state engine. State persists across page reloads.

### Built
- `app.js` state engine:
  - `state = { user, topics[], sessionsLog[], missions, currentSession }`
  - `loadState()` / `saveState()` to localStorage key `shadow-en-state-v3`
  - 32 topics seeded with `id`, `emoji`, `name`, `level`, `reviewStage='Day 0'`, `memoryStatus='Fragile'`, `masteryPct=0`
- Game logic:
  - `awardXP(amount, reason)` — handles level-up automatically (xpToNext × 1.5)
  - `updateStreak()` — checks yesterday/today via toDateString()
  - `completeReview(topicId, confidence)` — applies SR + memory + XP
  - `completeSession(topicId)` — full topic complete
  - `getTodayQueue()` — filter topics by `nextReview ≤ today`
- UI bindings via element IDs (`#stat-streak`, `#stat-mastered`, `#today-review-list`, etc.)
- Render function reads state, updates DOM
- Auto-save every 30s + on every state mutation

### Problems
- Some hardcoded numbers in HTML remained because IDs weren't added
- Service Worker still cached old app.js after upload

### Fixes
- Added IDs systematically to stat cards
- Bumped SW cache name + URL query param

### Architecture change
- **State** is now the single source of truth
- **render()** is idempotent — can be called anytime
- **localStorage key = `shadow-en-state-v3`** (schema version baked in name for migrations)

### Lessons learned
- **Render function should be idempotent** — easier to debug
- **Store schema version in localStorage key** — enables future migrations without breaking
- **`window.shadowEN = { state, render, reset }`** for dev console debug

---

## v4.0 — Real Content for 32 Topics + 13 Views (2026-05-26)

### Goal
Add REAL English learning content (32 topics with phrases, dialogues, shadow scripts). Replace placeholder views with real implementations (Topics DB, Level pages, Progress, Calendar, Memory Log, Stats, Missions, Phrases Bank).

### Built
- `content.js` with `TOPIC_CONTENT` object — 5 topics rich (Ordering Food, Directions, Shopping, Hotel, Airport), 27 skeletal
- Each topic has: `why`, `scene`, `phrases.{before, during, after}`, `dialogues[]`, `shadow_script`, `missions[]`, `active_recall[]`
- Real views:
  - Topic Detail (`openTopic(id)` → navigate)
  - Level 1/2/3 grids with topic cards
  - All Topics with filter (level/memory/search)
  - Progress Tracker (placeholder bar chart — real charts in v6)
  - Calendar with month view (placeholder until v6)
  - Memory Log grouped by status (5 sections)
  - Statistics with achievements
  - Missions daily + topic-specific
  - Phrases Bank with cross-topic search
  - Resources page
- Review Modal replaces ugly `prompt()` — beautiful 5-confidence buttons

### Problems
- File truncation again when concatenating large content
- CSS for new views (`topics-grid`, `level-hero`, `phrase-row`) wasn't injecting properly via Python script — required heredoc append
- Session steps named LEARN/SHADOW/RECALL/ROLEPLAY/MISSION → user wanted philosophy alignment (NGHE/SHADOW/REPEAT/RECALL/APPLY)

### Fixes
- Used `cat A B > C` for concatenation in bash, never Edit tool for huge insertions
- Appended CSS via `h.replace('</body>', css + '</body>')` at end of HTML
- Renamed steps to match Shadow English methodology

### Architecture change
- Content now in standalone `content.js` (data still hardcoded but separated)
- Topic detail rendered dynamically from content + state

### Lessons learned
- **HTML file truncation happens when Write/Edit tool deals with very large files** → use bash heredoc + cat for >1000 line files
- **CSS injection point matters** — `<style>` blocks must be in `<head>` OR before `</body>` to apply

---

## v5.0 — Content-Agnostic Architecture (Notion CMS) (2026-05-26)

### Goal
**Fundamental architecture pivot.** User insight: "System = framework, Content = replaceable". Code must not contain hardcoded English content. All topics editable in Notion → dashboard auto-renders.

### Built
- `content.json` — JSON data file (extracted from content.js hardcoded data)
- `content.js` → tiny loader fetching `content.json`
- `.github/workflows/sync-from-notion.yml` — GitHub Action runs hourly via cron
- `scripts/sync-from-notion.js` — Node.js script:
  - Reads from Notion API using `NOTION_TOKEN` + `NOTION_TOPICS_DB` secrets
  - Maps Notion properties to JSON schema
  - Parses phrases (`English — Vietnamese` format)
  - Parses dialogues (title + Speaker: line format)
  - Writes `content.json` + auto-commits
- Notion Topics DB schema extended: 11 new fields (`Topic ID`, `Why`, `Scene`, `Phrases Before/During/After`, `Dialogues`, `Shadow Script`, `Real Life Missions`, `Active Recall`, `Real English`)
- `SETUP_NOTION_SYNC.md` — non-technical guide (5 steps, ~5 min)

### Problems
- User uploaded to subfolder paths via GitHub UI (had to create files manually in `/new/main` route with `.github/workflows/sync-from-notion.yml` filename)
- Large JS file content needed URL-encoded `document.execCommand('insertText')` to paste into GitHub editor

### Fixes
- For subfolder files: GitHub `Create new file` UI accepts slashes in filename → creates dirs automatically
- For pasting large code into Monaco editor: use JS to set value programmatically (`document.execCommand('insertText', false, decodeURIComponent(...))`)

### Architecture change
**MAJOR architecture pivot — separation of layers:**
```
Notion (CMS)
  ↓ GitHub Action (hourly)
content.json (in repo)
  ↓ fetch on page load
Dashboard renders
```
- **System layer** (code) is content-agnostic — can render any topic shape
- **Content layer** (Notion) editable without code touch
- Future-proofs scaling 30 → 300 → 3000 topics

### Lessons learned
- **Never hardcode content in code** — even if "just for now"
- **GitHub Action + Secrets** = secure sync without exposing tokens client-side
- **Schema decisions early** save huge migrations later (we added Topic ID stable key)

---

## v6.0 — Dashboard 5-Questions + Real Charts + 8-Step Session (2026-05-26)

### Goal
Dashboard should answer 5 user questions immediately. Replace random data with real state-driven charts. Expand session to 8 steps matching Shadow English philosophy.

### Built
- **5-Questions Panel** at top of home:
  1. Học gì hôm nay? → newTopic name
  2. Ôn gì hôm nay? → today queue count
  3. Cái gì sắp quên? → fragile + weak count
  4. Đang mạnh lên không? → week sessions trend
  5. Còn xa Automatic? → automatic count
- Real heatmap from `sessionsLog` grouped by day (7×4 grid, 4 intensity levels)
- Real calendar from topic `nextReview` dates with daily review count badges
- 8-step session: WARM-UP → LISTEN → SHADOW → REPEAT → RECALL → SPEAK → MISSION → REFLECTION
- Each step has tailored content + tip
- Step 8 records confidence and applies bonus mastery

### Problems
- View-home grid didn't reset after 5Q injection — duplicate cards possible
- Random heatmap kept appearing after deploy (SW cache)

### Fixes
- Idempotent injection: check `home.querySelector('#questions-5')` before adding
- Force cache bust via `?v=N-bust` URL parameter

### Architecture change
- Charts read from `state.sessionsLog` + `state.topics[].nextReview`
- Coach card text generated dynamically from streak + day-of-week

---

## v7.0 — UI Customization Layer (layout.json + Settings) (2026-05-26)

### Goal
**Third architecture layer.** User can toggle sections, reorder, theme, edit branding WITHOUT touching code. Reach: System (code) + Content (Notion) + UI (config).

### Built
- `layout.json` — schema for UI config:
  - `branding` (appName, appIcon, userName, footerQuote)
  - `theme.preset` + `themes.{name, bg, card, primary, accent}` × 5 presets
  - `sections[]` with `id`, `title`, `icon`, `enabled`, `order`, `span`
  - `features` toggles (XP bar, footer, install PWA, coach, compact mode)
- `app_v7_layout.js`:
  - `loadLayoutConfig()` — fetch layout.json + merge user overrides from localStorage
  - `applyLayout()` — apply theme CSS vars, reorder sections via `order`, span via `gridColumn`, toggle visibility
  - `openSettings()` — modal with theme picker, section list (↑↓ reorder + toggle + span), branding inputs, feature toggles, reset + export
- Tag 15 sections in HTML with `data-section-id` attributes
- Gear ⚙️ icon in topbar opens settings

### Problems
- Some sections lacked `data-section-id` (Today Goal, Streak Guard, Progress Tracker — generic divs)
- Theme CSS variables propagation needed `--purple-2` derived via `adjustColor()` helper

### Fixes
- Used Python script to add IDs via specific HTML pattern matching
- Built `adjustColor(hex, amount)` to lighten/darken hex programmatically

### Architecture change
- **layout.json** = default UI config (committed)
- **localStorage `shadow-en-layout-overrides`** = user customizations
- Merge strategy: deep merge with overrides winning

---

## v8.0–v8.3 — Real Learning Experience (Audio, Focus, Mobile) (2026-05-26)

### Goal
Transform from "dashboard demo" to "real learning experience." Add audio for shadowing, focus mode for deep work, mobile-first responsive, calm typography.

### Built
- `audio.js` — Web Speech API wrapper:
  - `SHADOW_AUDIO.speak(text, opts)` — TTS with rate/voice
  - `speakLoop(text, count)` — ×3 repeat for shadowing
  - `startRecording()` / `stopRecording()` / `playRecording()` — MediaRecorder API
  - Auto-detect 6+ English voices in browser
- Audio buttons (▶) auto-attached to every `.phrase-row` via `enhancePhrases()`
- Speed controls 0.75× / 1× / 1.25× toggle
- Loop mode toggle
- Session view rebuilt with audio integration in each step
- Focus mode: hide sidebar/topbar/footer, calm padding, ESC to exit
- Keyboard shortcuts: Space/R (replay), S (slow), L (loop), N/Enter (next), F (focus), Esc (exit)
- Mobile responsive: sidebar collapse 64px, single-column grid, touch targets ≥44px
- Big confidence buttons (Step 8 reflection)
- Voice recorder in Step 5 (RECALL)
- Calm typography: serif font for shadow script, larger line-height

### Problems
- **NAV_RENDERS scope issue** — auto-attach audio buttons after navigate didn't work because NAV_RENDERS is `const` in app.js, not on window
- Multiple attempts failed (v8.1 wrap NAV_RENDERS, v8.2 wrap window.navigate)
- Form input on GitHub upload sometimes didn't commit if scroll was active

### Fixes
- **v8.3 brute-force interval** — `setInterval(() => enhancePhrases(activeViews), 1500)` — works 100% reliably
- Switched to find→click commit pattern: `find('Commit changes button')` → `left_click(ref)` instead of pixel coords

### Architecture change
- Audio system is separate module (audio.js) — no dependency on app.js state
- `enhancePhrases()` is idempotent (checks for existing button before adding)

### Lessons learned
- **MutationObserver + setInterval together** > either alone for reliability
- **Browser TTS quality varies hugely by OS** — macOS has best voices (Samantha, Alex)
- **`const` declarations don't go on `window`** — must use `window.X = X` explicitly

---

## v9.0 — Custom Content Blocks System (2026-05-26)

### Goal
Per-topic editable content blocks (YouTube, Image, Audio, PDF, Quote, Callout, Tips, AI Prompt, Note, Checklist, Exercise, Embed, Link, Heading, Divider, Spacer, HTML, Vimeo). User pastes JSON in Notion → dashboard auto-renders.

### Built
- `blocks.js` — `SHADOW_BLOCKS.types` registry with 18 type renderers
- `blocks.renderAll(sections, topicId)` — iterates + renders by type, handles errors
- Each block has CSS class `.block-{type}` + shared `.block` styles
- Block schema in content.json: `topics.{id}.sections[]` array
- Notion DB extended with `Custom Blocks` text field
- Sync script `parseBlocks(text)` — tries JSON first, falls back to plain-text format
- `app_v9_blocks.js` hooks into `window.navigate` to render `.blocks-card` after topic detail
- Example: L1-01 (Ordering Food) seeded with 7 blocks demo
- `BLOCKS_GUIDE.md` — full docs with JSON examples for each block type

### Block types & their fields
| Type | Required fields | Optional |
|---|---|---|
| `youtube` / `vimeo` | url | title, caption |
| `image` | src | caption, alt, title |
| `audio` | src | title, caption |
| `pdf` | src | title |
| `quote` | text | author |
| `callout` | text | icon, title, color (purple/blue/green/yellow/orange/red/pink) |
| `tips` | items[] | title |
| `ai-prompt` | prompt | title, tools[{name, url}] |
| `note` | text | title |
| `checklist` | items[] | title (persists state in localStorage) |
| `exercise` | question, answer | title, options[] |
| `embed` | url | title, height |
| `link` | url, title | description, image |
| `heading` | text | level (2/3) |
| `divider`, `spacer` | — | height (spacer) |
| `html` | html | (escape hatch) |

### Problems
- Commit button click sometimes didn't submit (page state issue)
- Notion `Custom Blocks` field accepting JSON requires user to paste with Ctrl+Shift+V (no formatting)

### Fixes
- Retry click with explicit form_input pattern
- Documented Ctrl+Shift+V in BLOCKS_GUIDE.md

### Architecture change
- **Content scope expanded** — not just phrases/dialogues but rich media per topic
- Each block renderer is pure function (no state mutation)
- Checklist blocks save state to `shadow-en-checks-{topicId}-{i}` localStorage

---

## v10.0 — OS for English Fluency (Adaptive + Metrics + Coach) (2026-05-26)

### Goal
Per user vision: transition from "dashboard" to **"Operating System for English Fluency"**. Replace fixed spaced repetition with adaptive memory engine. Replace placeholder metrics with real computations. Add AI coach insights from behavior.

### Built
- `adaptive.js` — Adaptive Memory Engine:
  - `calculateForgetRisk(topic)` → 0..1 risk score
  - `calculateMasteryVelocity(topic)` → improvement rate from confidenceHistory[]
  - `calculateSalvageability(topic)` → risk × mastery (high = save now!)
  - `calculateNextReview(topic, confidence)` → ADAPTIVE interval based on:
    - Base interval per stage
    - Confidence multiplier (5: ×1.5, 4: ×1.2, 3: ×1, 2: ×0.6, 1: ×0.3)
    - Streak bonus (3 "Good+" in a row → ×1.3)
    - Decay penalty (last 2 trending down → ×0.85)
  - `decideStageTransition(topic, conf)` — soft demote vs hard reset
  - `prioritizeReviewQueue(topics)` — sort by salvageability
  - `applyReview(topic, conf)` — appends to confidenceHistory[] (keeps last 20)
- `metrics.js` — Real Progress Intelligence:
  - `speakingMinutesThisWeek()` — from sessionsLog
  - `shadowStreak()` — consecutive days
  - `recallAccuracy(daysBack)` — avg confidence on reviews
  - `phrasesMastered()` — count phrases in Stable+Automatic topics
  - `weakTopicTrends()` — topics with declining confidence
  - `consistencyScore()` — % days active in last 30
  - `monthlyGrowth()` — sessions count
  - `reviewLoadForecast(daysAhead)` — predicted reviews per day
  - `sessionsPerDay(daysBack)` — for bar chart
- `coach.js` — AI Coach (rule-based):
  - 10+ rule patterns (high-streak, broken-streak, weak-trending, recall-strong-speaking-weak, inactive, growth-up, need-new, queue-clear, momentum, first-automatic, quiet)
  - `generate(n)` — returns top N matched insights
  - `postSession(topicId, conf)` — feedback after each review/session
  - `dailyGreeting()` — time-of-day + insight combo
- `app_v10_integration.js`:
  - Override `completeReview()` to use `SHADOW_ADAPTIVE.applyReview`
  - Override `getTodayQueue()` to use `prioritizeReviewQueue`
  - Update Coach Says card with `coach.generate(2)`
  - Upgrade Progress page with real metrics + forecast chart

### Problems
- Topics seeded in v3 didn't have `confidenceHistory[]` field → adaptive engine handled gracefully with `topic.confidenceHistory = []` init in `applyReview()`

### Fixes
- Adaptive engine initializes missing fields lazily

### Architecture change
**Now 6 layers (all independent):**
```
1. CONTENT  → Notion CMS → content.json
2. BLOCKS   → v9 — YouTube/Image/AI prompt rich content
3. ADAPTIVE → v10 — forget risk, mastery velocity
4. METRICS  → v10 — real computations from sessionsLog
5. COACH    → v10 — rule-based behavioral insights
6. UI       → v7 — layout.json themes, sections toggle
```

### Lessons learned
- **Rule-based AI coach** = good enough for 90% of cases. Save real LLM calls for v12+.
- **Adaptive SR > fixed SR** — even simple multipliers (confidence × streak) make huge UX difference
- **Real metrics > fake numbers** — user immediately senses "this is real" vs "this is mock"

---

## Pending → v11+

| # | Feature | Why deferred |
|---|---|---|
| 5 | Creator/Admin Mode (CMS UI inside app) | Large UI work; user can edit Notion directly for now |
| 6 | Offline-first PWA (cache audio + lessons) | SW already cache scripts; audio caching needs Blob storage |
| 7 | Gamification 2.0 (achievements, quests, badges) | Risk of "dopamine empty" — user wants consistency focus first |
| 8 | Memory Graph (topic connections, survival phrases) | Visualization complex; needs graph library |
| 9 | Audio Intelligence (pronunciation feedback) | Needs Web Speech Recognition or external API |

See `ROADMAP.md` for detailed v11+ planning.

---

## Repo file inventory (as of v10)

```
shadow-english-dashboard/
├── .github/workflows/
│   └── sync-from-notion.yml         # Hourly Notion → content.json sync
├── scripts/
│   └── sync-from-notion.js          # Notion API → JSON parser
├── docs/                            # Engineering memory (v10+)
│   ├── CHANGELOG.md                 # This file
│   ├── ARCHITECTURE.md              # System overview + diagrams
│   ├── STATE_SCHEMA.md              # All data structures
│   ├── TECHNICAL_NOTES.md           # Gotchas + tips
│   ├── ROADMAP.md                   # v11+ priorities
│   └── AI_HANDOFF.md                # Context dump for next AI
├── index.html                       # Main HTML (UI layer)
├── app.js                           # State engine + game logic (v3-v6)
├── app_v7_layout.js                 # Layout config engine (v7)
├── app_v8_experience.js             # Audio integration + focus (v8)
├── app_v9_blocks.js                 # Blocks hook into topic detail (v9)
├── app_v10_integration.js           # Adaptive/Metrics/Coach hooks (v10)
├── audio.js                         # Web Speech API wrapper (v8)
├── blocks.js                        # 18 block type renderers (v9)
├── adaptive.js                      # Adaptive memory engine (v10)
├── metrics.js                       # Real metrics computations (v10)
├── coach.js                         # Rule-based insights (v10)
├── content.js                       # Loader for content.json (v5+)
├── content.json                     # Topic data (Notion-synced)
├── layout.json                      # UI config defaults (v7)
├── manifest.json                    # PWA manifest (v2)
├── sw.js                            # Service Worker (v2)
├── data.json                        # Legacy seed (v2, deprecated)
├── BLOCKS_GUIDE.md                  # User docs for v9 blocks
├── SETUP_NOTION_SYNC.md             # User guide for v5 sync
└── README.md                        # Project overview
```

---

*Last update: 2026-05-26. Maintained by Claude (current AI) — please continue this changelog with each version.*
