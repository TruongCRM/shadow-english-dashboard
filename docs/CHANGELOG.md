# 📜 SHADOW ENGLISH — CHANGELOG

> Engineering memory system. Mỗi version có context đầy đủ để AI tiếp theo hiểu evolution mà không mất ngữ cảnh.

**Repo:** https://github.com/TruongCRM/shadow-english-dashboard
**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
**Owner:** TruongCRM (Dương Trường — solopreneur, non-technical)
**Started:** 2026-05-25
**Last update:** 2026-05-26 (post-v11.1.2 stabilize patches)

---

## v11.1.2 — STABILIZE patch B: Heatmap CSS fix + cache-bust (2026-05-26)

### Goal
Mid-session bug surface — user noticed REVIEW HEATMAP layout was visually broken on home page (day labels Mon-Sat crammed inline with cells, Sun on dropped row). NOT caused by v11.1.1 nav fix — pre-existing CSS bug since v6/v8 era. STABILIZE-eligible (broken visual ≠ feature).

### Built
- Extended `nav_polish.js` with `fixHeatmap()` — dynamically computes weeks from `.hm-cell` count and sets `grid-template-columns` correctly via inline style with `!important`
- Handles both 4-week and 5-week months automatically (`Math.ceil(cells / 7)`)
- Idempotent via `data-hm-fixed-weeks` flag — re-runs only when week count changes
- Wired into existing `bindAll()` so runs on initial bind + every render-wrap + every navigate-wrap + 3s safety interval

### Problems
- **Root cause:** `index.html` inline style had `.heatmap { grid-template-columns: 30px repeat(28, 1fr); }` — the `28` was total cells (7 days × 4 weeks) not the number of week columns. Browser auto-flowed 35 children into 29 cols × 2 rows → catastrophic visual scramble.
- **Cache-bust gotcha (post-deploy):** Updated `nav_polish.js` deployed successfully (build #26 ✅) but browser kept serving OLD version because `<script src="nav_polish.js?v=11.1.1">` query string didn't change. User-visible: page loaded but heatmap still broken even after Ctrl+Shift+R.

### Fixes
- Computed CSS column override applied on live ✓
- Visual confirm: 7 rows × 4 cols layout displays correctly (Mon→Sun vertical, Week1→4 horizontal)
- Cache-bust resolved by separate commit bumping `?v=11.1.1` → `?v=11.1.2` in index.html

### Architecture
- No new layer, no new module — extension of existing v11.1.1 stabilize patch
- Same idempotent + setInterval safety net pattern

### Lessons learned — NEW
- **🔥 G7 (TECHNICAL_NOTES candidate):** **`?v=N` cache-bust query MUST change every time you update a script file.** Browser caches based on the full URL (including query string). Updating the file on the server without changing the script-tag's query = invisible cache hit, old code keeps running. The user-visible symptom is identical to "fix doesn't work" — but the actual code in source IS correct. Diagnostic: `fetch('/file.js?bust='+Date.now()).then(r=>r.text())` to see what the SERVER returns vs `typeof window.MY_FN` to see what the BROWSER loaded. If server has the new code but browser doesn't expose it → cache bust missing.
- Bumping the `?v=` query is now part of "ship a JS update" checklist — write into deploy flow.
- This is similar to G6 (green commit ≠ deployed live) but one tier downstream: green deploy ≠ executed live by browser.

### Touched files
| File | Change |
|---|---|
| `nav_polish.js` | +40 LOC: fixHeatmap function + bindAll integration + _info update |
| `index.html` | 1-char diff: `?v=11.1.1` → `?v=11.1.2` |

### Deploy
- Commit 1: `6a8e5a8` — nav_polish.js updated with heatmap fix
- Commit 2: `e63cce7` — index.html cache-bust bump
- Build #26: ✅ Success (1m 0s)

### Pending → v11.2+ (unchanged)
Observation week still active. Sticking to STABILIZE-before-BUILD discipline. Do NOT start v11.2 work until Day 7.

---

## v11.1.1 — STABILIZE patch: Nav clickability fix (2026-05-26)

### Goal
Sub-version patch — **not** v11.2. Observation week is still active per the v11.1 STABILIZE-before-BUILD rule we locked in 30 minutes ago. This patch fixes **broken navigation affordance** (UI elements that looked clickable but had no handler) — that's a *bug*, not a feature. Sticking strictly to the rule.

### Built
- `nav_polish.js` — single IIFE, ~150 lines, zero dependencies, pure additive (same pattern as `debug_panel.js`)
- One DOM-safe wrap of `window.render` + `window.navigate` (idempotent via `__navPolishPatched` flag — no collision with `__v11Patched` used by `app_v11_today.js`)
- 3s setInterval safety net (matches `app_v11_today.js` v8 lesson — render-wrap alone is unreliable for dynamic content)
- Two click bindings:
  1. **`#view-home .level-card` × 3** (LEVEL 1/2/3 summary cards) — click → `navigate('level1'|'level2'|'level3')`
  2. **`#today-review-list .review-item[data-topic]`** — click → `openTopic(id)`
- A11y: each bound element gets `role="button"`, `tabindex="0"`, `aria-label`, plus Enter/Space keyboard activation
- Minimal hover lift CSS (`translateY(-2px)` desktop, disabled on mobile to preserve calm)
- Cursor pointer where missing
- Public debug handle: `SHADOW_NAV_POLISH.bind()` / `._info()`

### Problems
- **Pre-patch verification:**
  - Home `.level-card` summary cards had no `onclick`, `cursor:auto`, no internal links — **completely dead**
  - `#today-review-list .review-item[data-topic]` had `cursor:pointer` via CSS (lying about affordance) but **no actual handler** — clicking did nothing
  - Both elements created via app.js render — not via the v11.1 Today card module (which has its own working handlers in `today.js`)
- **Brief vs philosophy tension (surfaced before patching):**
  - User's brief included multiple feature-grade items (mini context-transition card, centralized routing helper, auto-focus review stage, hover glow effects)
  - Conflict with the rule we committed 30 min earlier: "STABILIZE phase as sacred — no new features during observation week"
  - Resolved by asking user → user picked path A (STABILIZE-only fixes, defer the rest to v11.2-B)

### Fixes
- All 4 click tests pass on live (verified via Chrome MCP JS execution):
  - LEVEL 1 card → `view-level1` ✅
  - LEVEL 2 card → `view-level2` ✅
  - LEVEL 3 card → `view-level3` ✅
  - Review row (forced L1-01 into today's queue) → `view-topic-detail` ✅
- Binding idempotent across re-renders (verified — no double-binding when render() fires multiple times)
- A11y: `role="button"`, keyboard nav work

### Deferred to v11.2-B (Daily Loop polish)
Explicitly NOT in this patch:
- Mini context-transition card (200–400ms fade with topic icon/name/stage preview before entering detail)
- Centralized navigation helper / refactor (kill scattered onclicks)
- Auto-focus current review stage when opening a topic
- Highlight current memory stage on entry
- Decorative hover glow beyond minimal lift

These items collectively are v11.2-B feature work — wait for observation week to end (Day 7) before scoping.

### Architecture change
- None to existing layers
- Adds nav_polish.js as a new sub-module under the existing **Observability Layer slot** philosophy: pure additive, opt-out by removing one script tag, no edits to app.js / today.js / blocks.js / etc.

### Lessons learned
- **Affordance lying = stabilize bug, not feature work.** When `cursor:pointer` exists but no handler does, that's broken UX — fixing it is allowed during observation week. Adding NEW hover-glow animations is NOT.
- **Render-wrap alone insufficient for dynamically-rendered children.** The 3s `setInterval(bindAll)` safety net is what actually catches review-item rows when the queue populates — same lesson as v8.3 audio button auto-attach.
- **A philosophy is only valuable when honored under pressure.** The user's brief 30min after locking "no features during observation week" was a stress test for the rule. The right move was to surface the tension explicitly, not silently execute. → Captured in TECHNICAL_NOTES (to be added).

### Touched files
| File | Change | Notes |
|---|---|---|
| `nav_polish.js` (NEW) | created | ~150 LOC, zero deps |
| `index.html` | added 1 script tag (line 2091, same line as debug_panel.js) | Sub-100B diff |

### Test results
- `SHADOW_NAV_POLISH._info()`: `{level_cards_total:3, level_cards_bound:3, review_items_total:0, review_items_bound:0}` (review_items empty when no topic queued — expected)
- After forcing L1-01 into today's queue + 3.5s safety net wait: `{review_items_total:1, review_items_bound:1}` ✓
- Click navigation: 4/4 pass

### Deploy
- Commit 1: `c080a4a` — index.html script tag added
- Commit 2: `ade9ba2` — nav_polish.js uploaded
- Build #25: ✅ Success (1m 31s)
- Live URL: https://truongcrm.github.io/shadow-english-dashboard/?debug=1&v=11.1.1

### Tech debt status (no change from v11.1)
- TD-1 Node 20 deprecation: still open (this patch did not address)
- TD-2 v11 scripts undocumented: still open
- TD-3 formula divergence: still pending observation week
- TD-4 `getTodayQueue` not exposed: still open

### Pending → v11.2+
Unchanged from v11.1 close-loop CHANGELOG. Observation week remains active. Do NOT start v11.2 work until Day 7.

---

## v11.1 — STABILIZE: Internal Insight Panel + Deploy Recovery (2026-05-26)

### Goal
**Phase pivot — không build feature lớn mới trong 7 ngày.**
Per user vision: tăng **clarity** của learning engine, không tăng complexity. Sau v10 (adaptive + metrics + coach), nhiều logic tinh vi nhưng *invisible*. v11.1 ship một **observability layer** để verify behavior thật trước khi quyết v11+.

### Built
- `debug_panel.js` — single IIFE module, ~750 dòng, zero dependencies
- One DOM root `#debug-panel-host` appended to `<body>` — fixed bottom-right
- Toggle: URL `?debug=1` / `?debug=0`, console `SHADOW_DEBUG.enable/disable/toggle`, close button
- localStorage key: `shadow-en-debug-mode` (single new key, namespaced)
- Panel sections:
  - **Summary bar:** total topics · in queue today · reviewed · never
  - **Memory distribution:** 5-column grid (Fragile / Weak / Building / Stable / Automatic)
  - **Rescue ranking (top 8):** salvageability = forget_risk × max(0.1, mastery); each row shows rank, topic, reason, risk/salv/age/mem/stage stats, expandable risk breakdown with 4 bars
  - **Survival patterns:** phrases appearing in ≥2 topics of today's queue (top 5)
  - **By status:** collapsible groups Fragile/Weak/Building/Stable/Automatic, sorted by review age desc
- Risk breakdown (transparent formula):
  - `age` 0..0.40 (days/30 capped)
  - `memory` 0.01..0.30 (Fragile=.30 / Weak=.22 / Building=.12 / Stable=.05 / Automatic=.01)
  - `confidence` 0..0.20 (avg last 3 reviews, inverse)
  - `adaptive` 0..0.15 (declining trend bonus)
- Console API: `SHADOW_DEBUG.rescueRanking() / .forgetRiskBreakdown(id) / .survivalPatterns() / .memoryDistribution()`
- Lifecycle hooks: wraps `window.render` + `shadowEN.saveState` (idempotent via `__dbgWrapped` flag) — panel refreshes on every real state mutation
- Hook retry: 20× over 10s (handles defer load order)
- Fallback: setInterval 5s when ON (zero overhead when OFF)
- Mobile responsive: full-width minus 8px padding, max-height 70vh
- Style: monospace, dark purple/pink accent matching `--purple`/`--accent`, backdrop blur, no animation
- Docs: `docs/V11_1_DEBUG_PANEL.md` (architecture, verify checklist, gotchas, console commands, observation week guide, graduation criteria for v11.2)
- Docs: `docs/VERIFY_REPORT_v11_1.md` (post-deploy verification record — 9/10 user checklist passed, state schema intact, deploy incident analyzed)

### Problems
- (Pre-emptive) Hook race: `defer` order doesn't guarantee `window.render` exists when `debug_panel.js` boots → solved by retry-hook loop
- (Pre-emptive) `SHADOW_CONTENT.TOPIC_CONTENT` may not be loaded on first render → survival patterns gracefully empty; 5s interval catches it
- (Pre-emptive) Formula divergence between panel and `adaptive.js` → intentional: panel ships its own formula to allow tuning without breaking prod
- **DEPLOY INCIDENT (post-ship):** `pages-build-deployment` failed 5 consecutive times (runs #18 → #22). Each crashed in 3 seconds with:
  > `Failed to download archive 'https://codeload.github.com/actions/jekyll-build-pages/tar.gz/...'`
  > `An action could not be found at the URI '...'`
  > `Internal server error. Correlation ID: 38b17b78...`
  Root cause: **infrastructure-level** — GitHub's CDN could not serve the `jekyll-build-pages` action archive. Build never started; live site continued serving the last successful build (#17) which did **not** contain the new `<script src="debug_panel.js">` tag.
  Symptom on user side: dashboard loads fine but no debug panel — even after hard refresh + SW unregister. HANDOFF §4 protocol (cache/script-path/runtime/CSS) pointed at wrong tier of the system.

### Fixes
- Hook retry: `setInterval(500)` × 20 tries — ensures wrap eventually attaches
- Idempotent wrap flag `__dbgWrapped` — wrapping twice is a no-op
- `getState()` returns normalized COPY (never mutates underlying state)
- **Deploy recovery:** Click "Re-run failed jobs" on build #22 → re-attempt downloaded jekyll-build-pages successfully (transient infra issue) → 18s build + 30s deploy = 1m 1s → live updated → panel appeared immediately on next page load.

### Architecture change
- **NEW layer concept (orthogonal to 6 runtime layers):** *Observability Layer*
- Not in load order — runs alongside, read-only
- May graduate to back-port into adaptive.js at v11.2 (decision pending observation week)
- Pure additive — zero impact on:
  - state schema (`shadow-en-state-v3` unchanged — verified: 11 keys, identical to pre-v11.1)
  - existing localStorage keys (only 1 new key added: `shadow-en-debug-mode`)
  - existing modules (no edits to app.js, adaptive.js, metrics.js, coach.js)
  - render loop (only wraps it, doesn't replace)

### Lessons learned
- **Build clarity before complexity.** Adaptive engine got "smart" in v10 but invisible. User shouldn't have to read source code to understand why a topic ranks first.
- **Observability ≠ debugging.** This panel stays in production behind a flag — useful long-term, not just dev-time.
- **Duplicate formulas intentionally during stabilize.** Panel ships own risk formula so we can A/B compare against `adaptive.js` without touching prod. Live measurement: panel risk 0.27 vs adaptive risk 0.014 for L1-01 → 19× divergence → observation week will decide back-port.
- **Hook retry > hook once.** When wrapping foreign functions in deferred-load environments, always retry.
- **One file is enough.** Single ~750-line file > distributed across multiple files for a "drop-in observability" module.
- **🔥 NEW (from deploy incident):** **Before debugging client-side, confirm last successful build matches latest commit.** A green commit on `main` ≠ deployed live. The diagnostic protocol must include "Bước 0: open Actions tab, check most recent `pages-build-deployment` is ✅" before any browser-level debugging. Code can be correct, file can be on `main`, and live can still be running pre-commit binary. This is now Gotcha G6 in TECHNICAL_NOTES.md.
- **GitHub auto-deploy has zero fallback.** A 4xx/5xx on GitHub's own `codeload.github.com` for `actions/jekyll-build-pages` archive = no deploy, no email alert, no obvious symptom (just "old version still up"). Worth monitoring.

### Technical debt opened (post-v11.1)
| ID | Item | Class | Priority |
|---|---|---|---|
| TD-1 | Node.js 20 deprecation warning on every Pages build (`actions/checkout@v4`, `actions/upload-artifact@v4`) — will hard-fail when GitHub enforces | `technical-debt-v11.2-pre` | Before v11.2 |
| TD-2 | 3 v11 scripts in production not in changelog: `phrases.js?v=11`, `today.js?v=11`, `app_v11_today.js?v=11` — documentation drift | `documentation-drift` | Before v11.2 |
| TD-3 | Adaptive vs Debug formula divergence ~19× — observation week will decide back-port | `decision-pending` | Day 7 |
| TD-4 | `getTodayQueue` not exposed on `window.shadowEN` API — minor | `api-polish` | v11.2 |

### Pending → v11.2+
| # | Item | When |
|---|---|---|
| 1 | Fill `docs/V11_1_OBSERVATIONS.md` after 7 days using panel | Day 7 |
| 2 | Decide: back-port panel risk formula into `adaptive.js`? | After observations |
| 3 | Reconcile undocumented v11 scripts (TD-2) | Before v11.2 |
| 4 | Address Node 20 deprecation (TD-1) | Before v11.2 |
| 5 | Add daily Loop polish (calmer Today card, tighter scan-pattern) | After v11.2 graduation |
| 6 | Resume v11 roadmap (Creator Mode / Offline / Gamification 2.0) | After clarity locked in |

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

## v5.0 — Content-Agnostic Architecture (Notion CMS) (2026-05-26)

### Goal
**Fundamental architecture pivot.** User insight: "System = framework, Content = replaceable". Code must not contain hardcoded English content. All topics editable in Notion → dashboard auto-renders.

### Built
- `content.json` — JSON data file (extracted from content.js hardcoded data)
- `content.js` → tiny loader fetching `content.json`
- `.github/workflows/sync-from-notion.yml` — GitHub Action runs hourly via cron
- `scripts/sync-from-notion.js` — Node.js script reading Notion API → writing JSON

### Architecture change
**MAJOR architecture pivot — separation of layers:**
```
Notion (CMS) → GitHub Action (hourly) → content.json → fetch on page load → Dashboard renders
```

### Lessons learned
- **Never hardcode content in code** — even if "just for now"
- **GitHub Action + Secrets** = secure sync without exposing tokens client-side

---

## v4.0 — Real Content for 32 Topics + 13 Views (2026-05-26)

(Real English content + topic detail + all views — see git history for detail.)

---

## v3.0 — Real State Engine + Persistence (2026-05-26)

### Architecture change
- **State** is now the single source of truth
- **render()** is idempotent — can be called anytime
- **localStorage key = `shadow-en-state-v3`** (schema version baked in name for migrations)

---

## v2.0 — PWA + Multi-view SPA + Adaptive UI (2026-05-26)

### Built
- `manifest.json` + `sw.js` (Service Worker — network-first cache)
- Multi-view system with `display: contents`
- Time-aware greeting and adaptive UI
- XP bar with level chip + progress

---

## v1.0 — HTML Dashboard Mockup (2026-05-26)

### Goal
Recreate the dashboard from a reference image as a clean HTML mockup. Dark theme, sidebar nav, 5 top stats, today focus, memory donut, level map.

---

## Pending → v11.2+

| # | Feature | Why deferred |
|---|---|---|
| 1 | Back-port panel risk formula → adaptive.js (or keep separate) | Decision pending observation week |
| 2 | Resolve documentation drift (3 undocumented v11 scripts) | Before v11.2 ship |
| 3 | Address Node 20 deprecation (TD-1) | Before v11.2 ship |
| 4 | Daily Loop polish (calmer Today card, tighter scan-pattern) | v11.2-B candidate |
| 5 | Creator/Admin Mode (CMS UI inside app) | Large UI work — defer to v12 |
| 6 | Offline-first PWA (cache audio + lessons) | SW partial — needs Blob audio cache |
| 7 | Gamification 2.0 (achievements, quests, badges) | User wants consistency focus first |
| 8 | Memory Graph (topic connections, survival phrases) | Viz complex; needs graph library |
| 9 | Audio Intelligence (pronunciation feedback) | Needs Web Speech Recognition or external API |

See `ROADMAP.md` for detailed v11+ planning.

---

## Repo file inventory (as of v11.1)

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
│   ├── AI_HANDOFF.md                # Context dump for next AI
│   ├── V11_1_DEBUG_PANEL.md         # v11.1 architecture + verify (NEW)
│   └── VERIFY_REPORT_v11_1.md       # v11.1 post-deploy verification record (NEW)
├── index.html                       # Main HTML (UI layer)
├── app.js                           # State engine + game logic (v3-v6)
├── app_v7_layout.js                 # Layout config engine (v7)
├── app_v8_experience.js             # Audio integration + focus (v8)
├── app_v9_blocks.js                 # Blocks hook into topic detail (v9)
├── app_v10_integration.js           # Adaptive/Metrics/Coach hooks (v10)
├── phrases.js                       # v11 (UNDOCUMENTED — TD-2)
├── today.js                         # v11 (UNDOCUMENTED — TD-2)
├── app_v11_today.js                 # v11 (UNDOCUMENTED — TD-2)
├── debug_panel.js                   # v11.1 — Internal Insight observability layer (NEW)
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

*Last update: 2026-05-26 post-v11.1. Maintained by Claude (current AI) — please continue this changelog with each version.*
