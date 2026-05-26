# 🏛 SHADOW ENGLISH — ARCHITECTURE

> Real SaaS-like architecture inside a static GitHub Pages site.
> 6 runtime layers + 1 observability layer (v11.1). Edit any one without breaking others.

---

## 📐 Layer Diagram (high level)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   👤 USER (Dương Trường — non-technical)                       │
│                                                                │
└──────────┬──────────────────────────────────────────┬──────────┘
           │                                          │
           │ Edits content                            │ Daily usage
           ▼                                          ▼
┌──────────────────────┐                  ┌──────────────────────┐
│  NOTION (CMS)        │                  │  GITHUB PAGES        │
│  Topics DB           │   GitHub Action  │  (dashboard URL)     │
│  • Topic ID          │  ───────────────▶│                      │
│  • Why, Scene        │   (cron hourly)  │  index.html          │
│  • Phrases (B/D/A)   │                  │  + all .js modules   │
│  • Dialogues         │  scripts/        │  + content.json      │
│  • Shadow Script     │  sync-from-      │  + layout.json       │
│  • Missions          │  notion.js       │                      │
│  • Custom Blocks     │                  │                      │
└──────────────────────┘                  └──────────┬───────────┘
                                                     │
                                                     │ Browser loads
                                                     ▼
                                          ┌────────────────────────┐
                                          │  6 RUNTIME LAYERS      │
                                          │                        │
                                          │  1. CONTENT (data)     │
                                          │  2. BLOCKS (rich)      │
                                          │  3. ADAPTIVE (SR)      │
                                          │  4. METRICS (compute)  │
                                          │  5. COACH (insights)   │
                                          │  6. UI (config + theme)│
                                          │                        │
                                          │  + OBSERVABILITY (v11.1)│
                                          │    debug_panel.js      │
                                          │    (orthogonal, opt-in)│
                                          │                        │
                                          │  STATE (localStorage)  │
                                          └────────────────────────┘
```

---

## 🧱 6 RUNTIME LAYERS — what each does

### Layer 1: CONTENT (data)
**Files:** `content.json` (data), `content.js` (loader)
**Role:** Source of truth for what to teach.
**Editable by:** Non-technical user via Notion → auto-sync to JSON.
**Schema:** See `STATE_SCHEMA.md → CONTENT_SCHEMA`.

### Layer 2: BLOCKS (rich content)
**Files:** `blocks.js`
**Role:** 18 reusable content block types (YouTube, Image, Audio, Quote, Callout, Tips, AI Prompt, Checklist, Exercise, etc).
**Editable by:** Notion `Custom Blocks` field accepts JSON.
**Renderers:** Pure functions, no state mutation (except checklist persists to localStorage).

### Layer 3: ADAPTIVE (memory engine)
**Files:** `adaptive.js`
**Role:** Spaced Repetition logic that learns from confidence history.
**Key functions:**
- `calculateForgetRisk(topic)` → 0..1
- `calculateNextReview(topic, confidence)` → adaptive interval
- `prioritizeReviewQueue(topics)` → sorted by salvageability

### Layer 4: METRICS (real computations)
**Files:** `metrics.js`
**Role:** All progress metrics computed from `state.sessionsLog` + `state.topics`.
**No fake data ever.** Every number traces back to real user actions.

### Layer 5: COACH (rule-based insights)
**Files:** `coach.js`
**Role:** Behavioral analysis — generates daily insights, post-session feedback.
**10+ rules:** high-streak · broken-streak · weak-trending · recall-vs-speaking imbalance · inactive · growth-up · need-new · queue-clear · momentum · first-automatic · quiet.

### Layer 6: UI (config + theme)
**Files:** `layout.json` (defaults), `app_v7_layout.js` (engine + Settings panel)
**Role:** Visual customization without code touch.
**User-editable via Settings ⚙️ modal:**
- Theme picker (5 presets)
- Section toggle/reorder/resize
- Branding (app name, icon, user name)
- Feature toggles (XP bar, footer, compact mode)

---

## 🔬 OBSERVABILITY LAYER (v11.1) — orthogonal, opt-in

**File:** `debug_panel.js`
**Toggle:** URL `?debug=1` / `?debug=0`, console `SHADOW_DEBUG.enable/disable/toggle`, or close button on panel.
**localStorage key:** `shadow-en-debug-mode` (`'1'` | `'0'`)
**DOM:** Single host element `#debug-panel-host`, fixed bottom-right.

### Purpose
Observability ≠ debugging. This layer stays in production behind a flag — purpose is to make the **adaptive engine transparent** to the user. After v10, the adaptive logic became sophisticated but invisible: user couldn't see WHY a topic ranks first in the queue. v11.1 surfaces that.

### What it shows
1. Summary bar — total topics · queued today · reviewed · never
2. Memory distribution — 5-cell grid (Fragile/Weak/Building/Stable/Automatic)
3. Rescue ranking top 8 — salvageability = forget_risk × max(0.1, mastery), each row expandable with 4-bar breakdown
4. Survival patterns — phrases shared across ≥2 topics in today's queue
5. By status accordion — all topics grouped by memory status, sorted by review age

### Risk formula (transparent, hard-coded in panel for tuning)
```
total_risk = age (0..0.40) + memory (0.01..0.30) + confidence (0..0.20) + adaptive_penalty (0..0.15)
salvageability = total_risk × max(0.1, mastery)
```

**This is intentionally divergent from `adaptive.js`.** Panel ships its own formula so the user can A/B compare in real usage without breaking prod. At end of v11.1 observation week, decision made on whether to back-port the panel formula into `adaptive.js` (v11.2-A) or keep separate (v11.2-B).

### Why "orthogonal to 6 runtime layers"
- Doesn't fit in the load order — runs alongside, after everything else
- **Pure additive:** zero edits to existing modules, state schema, or load sequence
- Read-only access to state (returns normalized copy, never mutates)
- Wraps `window.render` and `shadowEN.saveState` (idempotent via `__dbgWrapped` flag) to auto-refresh on real state changes
- 5s setInterval as fallback if hook attaches late
- When OFF: no DOM, no interval, no overhead

### Console API
```js
SHADOW_DEBUG.enable() / .disable() / .toggle() / .isEnabled() / .render()
SHADOW_DEBUG.memoryDistribution()      // {Fragile, Weak, Building, Stable, Automatic}
SHADOW_DEBUG.rescueRanking(n=8)        // [{topic, risk, salvageability, breakdown}, ...]
SHADOW_DEBUG.forgetRiskBreakdown(id)   // {total, components: {age, memory, confidence, adaptive}}
SHADOW_DEBUG.survivalPatterns()        // phrases appearing in ≥2 topics of today's queue
```

See `docs/V11_1_DEBUG_PANEL.md` for full architecture + verify checklist + gotchas.

---

## 🌊 Data Flow

### When user opens dashboard:
```
1. index.html loads
2. Service Worker checks cache (network-first)
3. CSS applied (from <style> blocks)
4. Scripts execute in order:
   a. content.js → fetches content.json → fills SHADOW_CONTENT.TOPIC_CONTENT
   b. app.js → loads state from localStorage OR seeds 32 topics
   c. app_v7_layout.js → fetches layout.json → applies theme/sections
   d. audio.js → initializes Web Speech voices
   e. blocks.js → registers 18 block renderers
   f. adaptive.js → ready
   g. metrics.js → ready
   h. coach.js → ready
   i. app_v9_blocks.js → wraps navigate() to inject blocks card
   j. app_v10_integration.js → wraps completeReview/Session/getTodayQueue
   k. phrases.js / today.js / app_v11_today.js → (UNDOCUMENTED — see CHANGELOG TD-2)
   l. debug_panel.js → (v11.1, opt-in) checks ?debug param + localStorage, attaches panel if enabled
5. render() runs — UI populated from state
6. Coach card shows real insights
7. Setup interval (1.5s) for audio button auto-attach
8. (If debug ON) Panel renders + hooks lifecycle for auto-refresh
```

### When user reviews a topic:
```
1. Click "Quick Review" button OR phrase row
2. showReviewModal(topicId) opens
3. User clicks confidence 1-5
4. completeReview(topicId, confidence) →
   a. SHADOW_ADAPTIVE.applyReview(topic, confidence) →
      - Append to topic.confidenceHistory[]
      - Calculate mastery delta = (conf - 2.5) × 6
      - decideStageTransition() → new stage + memory status
      - calculateNextReview() → adaptive date based on:
        * Base interval × confidence multiplier × streak bonus × decay penalty
      - Set topic.lastReview, sessions++
   b. awardXP(50 + conf × 15)
   c. state.sessionsLog.push({type: 'review', topicId, confidence, at})
   d. updateStreak() — check yesterday/today
   e. saveState() → localStorage (TRIGGERS debug panel refresh if ON)
   f. render() — UI updates all bound elements (TRIGGERS debug panel refresh if ON)
   g. coach.postSession(topicId, conf) → toast feedback
5. Re-render Today Queue with adaptive prioritization
```

### When Notion sync runs (hourly):
```
1. GitHub Action triggers (cron 0 * * * *)
2. scripts/sync-from-notion.js executes Notion API query
3. Build topic object per page, parse Custom Blocks JSON
4. Write content.json with metadata (schema, generatedAt, source: 'notion')
5. git diff content.json → if changed: commit + push
6. GitHub Pages auto-rebuilds (~30-60s)
7. Next page load fetches updated content.json
```

### ⚠️ Deploy flow caveat (added 2026-05-26 post-incident)
The auto-build at step 6 above CAN fail at **GitHub infrastructure level**, not user-error level. Symptom: live URL serves last successful build, NOT the file you see on `github.com/.../blob/main/...`. Always verify via `github.com/<repo>/actions` that latest `pages-build-deployment` is ✅ before debugging client-side.

---

## 🔌 Integration Points

### Service Worker cache strategy
- **network-first, cache-fallback**
- Cache name = `shadow-en-v3` (bump to invalidate)
- Cached: `./`, `index.html`, `app.js`, `manifest.json`, `data.json`
- New scripts NOT pre-cached → fetched on first load

### LocalStorage keys
- `shadow-en-state-v3` — main app state
- `shadow-en-layout-overrides` — user UI customizations
- `shadow-en-checks-{topicId}-{index}` — checklist state per block
- `shadow-en-celebrated-first-auto` — flag to show celebration once
- `shadow-en-debug-mode` — **v11.1** observability layer toggle (`'1'` | `'0'`)

### Web Speech API
- TTS: `speechSynthesis.speak(utterance)`
- Voices auto-detected on `voiceschanged` event
- Recording: `MediaRecorder` API (requires microphone permission)

### GitHub Action Secrets
- `NOTION_TOKEN` (secret_...) — Notion Integration token
- `NOTION_TOPICS_DB` (UUID) — Topics DB ID

---

## 🎨 Design Decisions

### Why no React/Vue/Svelte?
- Static GitHub Pages friendliness · Zero build step · User can read code directly · Loads instantly

### Why localStorage instead of backend DB?
- No server cost · Works offline · Privacy · Multi-device sync = v15+ requires backend (defer)

### Why vanilla JS modules attached to `window`?
- No bundler · Each file independently testable · Scripts load via `<script defer>` in HTML order

### Why Notion as CMS?
- User familiar · Rich content editing · Notion API stable + free

### Why GitHub Action for sync (not direct browser→Notion)?
- Token security · Hourly cron acceptable · Free tier supports cron

### Why rule-based AI Coach (not GPT API)?
- Free · Deterministic · Fast · Privacy · 90% useful via pattern-matching

### Why ship observability as separate file (debug_panel.js) instead of merging into adaptive.js?
- Pure additive — zero risk to prod
- Allows formula divergence for A/B observation
- Can be toggled OFF entirely → zero overhead when not needed
- May graduate into adaptive.js at v11.2 once formula validated

---

## 🗂 Module Dependency Graph

```
                ┌─ index.html (entry)
                │
                ├─ content.js ─┬─→ content.json (fetched)
                │              │
                ├─ app.js ─────┴─→ window.state (localStorage)
                │              │
                ├─ app_v7_layout.js ─→ layout.json (fetched)
                │                  └─→ window.LAYOUT_CONFIG
                │
                ├─ audio.js ─→ window.SHADOW_AUDIO
                │
                ├─ app_v8_experience.js ─→ uses audio.js, app.js render()
                │
                ├─ blocks.js ─→ window.SHADOW_BLOCKS (18 renderers)
                │
                ├─ app_v9_blocks.js ─→ uses blocks.js + content.js
                │                      hooks window.navigate
                │
                ├─ adaptive.js ─→ window.SHADOW_ADAPTIVE
                ├─ metrics.js ─→ window.SHADOW_METRICS
                ├─ coach.js ───→ window.SHADOW_COACH
                │
                ├─ app_v10_integration.js
                │  ├─ overrides completeReview/Session
                │  └─ overrides getTodayQueue
                │
                ├─ phrases.js / today.js / app_v11_today.js (v11 — UNDOCUMENTED, TD-2)
                │
                └─ debug_panel.js (v11.1, observability)
                   ├─ reads window.shadowEN.state (read-only)
                   ├─ wraps window.render (idempotent)
                   ├─ wraps shadowEN.saveState (idempotent)
                   └─ exposes window.SHADOW_DEBUG API
```

**Load order matters** — scripts use `defer` so they execute in HTML order.

---

## ✅ Idempotency Guarantees

- `render()` can be called any time, multiple times — output deterministic from state
- `enhancePhrases(view)` skips rows that already have audio buttons
- `SHADOW_BLOCKS.renderAll()` doesn't mutate state
- `applyLayout()` resets all properties before applying new config
- `SHADOW_ADAPTIVE.applyReview()` initializes missing fields lazily
- **v11.1:** Render wrap uses `__dbgWrapped` flag — wrapping twice is a no-op
- **v11.1:** `getState()` returns normalized COPY — never mutates underlying state

This means: **state can be safely restored, navigated, re-rendered without corruption.**

---

## 🧩 Extension Patterns

### Adding a new block type (e.g. "twitter")
1. Add type to `SHADOW_BLOCKS.types` in `blocks.js`
2. Add CSS for `.block-twitter`
3. Document in `BLOCKS_GUIDE.md`
4. No other code changes needed.

### Adding a new coach rule
1. Push to `SHADOW_COACH.rules` array in `coach.js`
2. Rule automatically picked up by `coach.generate()`.

### Adding a new theme
1. Add to `layout.json` `themes` object
2. Theme automatically appears in Settings → Theme picker.

### Adding a new view (e.g. "vocabulary")
1. Add `<div class="view" id="view-vocabulary"></div>` in HTML
2. Add nav-item `<div class="nav-item" data-view="vocabulary">📖 Vocabulary</div>`
3. Register renderer: `NAV_RENDERS['vocabulary'] = () => { ... }`

### Adding a new observability panel section
1. Edit `debug_panel.js` → add HTML build function
2. Optionally add to `SHADOW_DEBUG` API for console access
3. No other module touched.

---

## 🚨 Architectural Constraints (do NOT break)

1. **Content NEVER hardcoded in code** — must go through Notion or content.json
2. **State NEVER computed live during render** — pre-compute in functions, render reads
3. **No module mutates another module's globals** (except integration patches in app_v*_integration.js, and debug_panel.js wraps that ARE idempotent + reversible)
4. **All localStorage keys prefixed `shadow-en-`** for namespacing
5. **CSS variables for theme colors** (`--purple`, `--card`, etc.) — never hardcode hex
6. **Idempotent renders** — calling render() N times should produce same DOM
7. **Schema versioning in localStorage keys** — `shadow-en-state-v3` not `shadow-en-state`
8. **v11.1+:** Observability layer must remain pure additive — no state schema migration, no edits to layers 1–6

---

## 🆘 Deploy & verification flow (v11.1 post-incident addition)

Before declaring any change "shipped":

```
1. File committed to main branch                  ✅
   ↓ verify: github.com/<repo>/blob/main/<path>
2. pages-build-deployment workflow succeeded      ✅
   ↓ verify: github.com/<repo>/actions (latest run = ✅ green)
3. Live URL serves new file                       ✅
   ↓ verify: <live-url>/<filename>?bust=N
4. Page actually renders new behavior             ✅
   ↓ verify: visual + JS console probes
```

**Step 2 was the missing step in v11.1's first attempt.** Files were at step 1 but not step 2 (build failed). Step 1 is visible in github.com file browser — easy to mistake for "deployed". Always check Actions tab.

---

*Last update: 2026-05-26 (v11.1 STABILIZE shipped).*
