# 🏛 SHADOW ENGLISH — ARCHITECTURE

> Real SaaS-like architecture inside a static GitHub Pages site.
> 6 independent layers. Edit any one without breaking others.

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
5. render() runs — UI populated from state
6. Coach card shows real insights
7. Setup interval (1.5s) for audio button auto-attach
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
   e. saveState() → localStorage
   f. render() — UI updates all bound elements
   g. coach.postSession(topicId, conf) → toast feedback
5. Re-render Today Queue with adaptive prioritization
```

### When Notion sync runs (hourly):
```
1. GitHub Action triggers (cron 0 * * * *)
2. scripts/sync-from-notion.js executes:
   a. Authenticate with NOTION_TOKEN (from GH Secrets)
   b. POST /v1/databases/{NOTION_TOPICS_DB}/query
   c. For each page in results:
      - Extract Topic ID, Topic Name
      - Parse rich_text fields: Why, Scene, Phrases B/D/A, Dialogues
      - Parse JSON from Custom Blocks (or plain-text fallback)
      - Build topic object
   d. Write content.json with metadata (schema, generatedAt, source: 'notion')
3. git diff content.json → if changed: commit + push
4. GitHub Pages auto-rebuilds (~30-60s)
5. Next page load fetches updated content.json
```

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
- Static GitHub Pages friendliness
- Zero build step
- User can read code directly
- Loads instantly (no bundle download)

### Why localStorage instead of backend DB?
- No server cost
- Works offline
- Privacy-preserving (data never leaves user device)
- Multi-device sync = v11+ requires backend (defer)

### Why vanilla JS modules attached to `window`?
- No bundler
- Each file independently testable in console
- Scripts load via `<script defer>` in HTML order

### Why Notion as CMS?
- User is already familiar with Notion (own workspace)
- Rich content editing (no need to build CMS UI yet)
- Notion API is stable + free for personal use

### Why GitHub Action for sync (not direct browser→Notion)?
- Notion API requires auth token = security risk if client-side
- Hourly cron is acceptable cadence for content updates
- GitHub Secrets keep token server-side
- Free tier supports cron jobs

### Why rule-based AI Coach (not GPT API)?
- Free
- Deterministic (testable)
- Fast (no API latency)
- Privacy (no data sent to external service)
- 90% of useful insights are pattern-matching anyway
- GPT integration is future option (v12+)

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
                ├─ app_v8_experience.js ─→ uses audio.js
                │                          uses app.js render()
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
                └─ app_v10_integration.js
                   ├─ overrides completeReview/Session
                   ├─ overrides getTodayQueue
                   └─ uses adaptive + metrics + coach
```

**Load order matters** — scripts use `defer` so they execute in HTML order.

---

## ✅ Idempotency Guarantees

- `render()` can be called any time, multiple times — output deterministic from state
- `enhancePhrases(view)` skips rows that already have audio buttons
- `SHADOW_BLOCKS.renderAll()` doesn't mutate state
- `applyLayout()` resets all properties before applying new config
- `SHADOW_ADAPTIVE.applyReview()` initializes missing fields lazily

This means: **state can be safely restored, navigated, re-rendered without corruption.**

---

## 🧩 Extension Patterns

### Adding a new block type (e.g. "twitter")
1. Add type to `SHADOW_BLOCKS.types` in `blocks.js`:
   ```js
   twitter: function(b) { return `<div class="block block-twitter">...</div>`; }
   ```
2. Add CSS for `.block-twitter` in `index.html` `<style>` block
3. Document in `BLOCKS_GUIDE.md`
4. No other code changes needed.

### Adding a new coach rule
1. Push to `SHADOW_COACH.rules` array in `coach.js`:
   ```js
   { name: 'my-rule', match: (s, m) => ..., message: (s, m) => "...", priority: 7 }
   ```
2. Rule automatically picked up by `coach.generate()`.

### Adding a new theme
1. Add to `layout.json` `themes` object:
   ```json
   "ocean-storm": { "name": "Ocean Storm", "bg": "#001f3f", "card": "#003366", "primary": "#00d9ff", "accent": "#ffd700" }
   ```
2. Theme automatically appears in Settings → Theme picker.

### Adding a new view (e.g. "vocabulary")
1. Add `<div class="view" id="view-vocabulary"></div>` in HTML content grid
2. Add nav-item: `<div class="nav-item" data-view="vocabulary">📖 Vocabulary</div>`
3. Register renderer: `NAV_RENDERS['vocabulary'] = () => { ... }`
4. Done.

---

## 🚨 Architectural Constraints (do NOT break)

1. **Content NEVER hardcoded in code** — must go through Notion or content.json
2. **State NEVER computed live during render** — pre-compute in functions, render reads
3. **No module mutates another module's globals** (except integration patches in app_v*_integration.js)
4. **All localStorage keys prefixed `shadow-en-`** for namespacing
5. **CSS variables for theme colors** (`--purple`, `--card`, etc.) — never hardcode hex
6. **Idempotent renders** — calling render() N times should produce same DOM
7. **Schema versioning in localStorage keys** — `shadow-en-state-v3` not `shadow-en-state`

---

*Last update: 2026-05-26 (v10)*
