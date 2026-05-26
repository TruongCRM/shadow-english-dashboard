# 🗺 SHADOW ENGLISH — ROADMAP

> Pending work for v11.2 and beyond. Priorities reflect user's STABILIZE-first discipline (no new features until v11.1 observation week ends).

---

## ✅ DONE (v1–v11.1)

| Version | Feature | Date |
|---|---|---|
| v1 | HTML dashboard mockup | 2026-05-26 |
| v2 | PWA + multi-view SPA + adaptive UI | 2026-05-26 |
| v3 | State engine + localStorage persistence | 2026-05-26 |
| v4 | Real content 32 topics + 13 views | 2026-05-26 |
| v5 | Content-agnostic (Notion CMS sync) | 2026-05-26 |
| v6 | 5-questions dashboard + real charts + 8-step session | 2026-05-26 |
| v7 | UI customization layer (layout.json + Settings) | 2026-05-26 |
| v8 | Audio System (TTS, record) + Focus mode + Mobile | 2026-05-26 |
| v9 | Custom Content Blocks (18 types) | 2026-05-26 |
| v10 | Adaptive Memory + Real Metrics + AI Coach | 2026-05-26 |
| v11 | phrases.js + today.js + app_v11_today.js (UNDOCUMENTED — TD-2) | 2026-05-26 |
| **v11.1** | **STABILIZE: Internal Insight Panel + deploy recovery** | **2026-05-26** |

---

## 🧭 CURRENT PHASE — OBSERVATION WEEK (Day 0–6)

**Active mode:** Measure-then-build. No new features.
**Toolkit:** `?debug=1` panel ON during every dashboard use.
**Deliverable end of Day 7:** `docs/V11_1_OBSERVATIONS.md`

### 5 questions to answer during the week
1. Are Fragile topics actually getting rescued first? (Rescue ranking #1–3 = Fragile?)
2. Is `age` weighted too high vs. `memory`? (Adaptive risk 0.014 vs Debug risk 0.27 for the same topic — 19× divergence. Which is "right"?)
3. Are survival phrases real (cross-topic) or noise (common but not useful)?
4. Does QUEUED rank align with non-QUEUED rank? (Queue should respect salvageability)
5. After 5 reviews completed — does memory distribution shift visibly?

### After Day 7 — decision tree
- Panel formula clearly better → **v11.2-A: back-port to `adaptive.js`**
- Panel formula same/worse → **v11.2-B: Daily Loop polish (calmer Today card, tighter scan-pattern)**

---

## 🔧 v11.2 — TECHNICAL DEBT CLEARANCE (Day 7–10)

Before any new feature work, address debt from v11.1 STABILIZE phase:

### TD-1 · `technical-debt-v11.2-pre` · Node.js 20 deprecation
**Source:** Build #22 annotation: `actions/checkout@v4`, `actions/upload-artifact@v4` running on deprecated Node 20.
**Risk:** When GitHub enforces deprecation (no announced date), `pages-build-deployment` will hard-fail. Same failure mode as the 5 consecutive fails we just recovered from — but permanent.
**Fix:** Pin actions to Node 22+ versions. For GitHub-managed `pages-build-deployment`, monitor and document workaround.
**Effort:** 30 min

### TD-2 · Documentation drift — 3 undocumented v11 scripts
**Files:** `phrases.js?v=11`, `today.js?v=11`, `app_v11_today.js?v=11`
**Issue:** Live in prod, not in CHANGELOG/ARCHITECTURE.
**Fix:** Retro-add a `v11.0` CHANGELOG entry documenting these modules' purpose + integration points. Add to ARCHITECTURE.md module dependency graph.
**Effort:** 1 hour (read the code, write the entry)

### TD-3 · Formula divergence resolved
Decided at end of observation week. Either:
- Back-port panel formula to `adaptive.js` (v11.2-A) → eliminates divergence
- Document as intentional behavioral choice → close TD as "by design"

### TD-4 · API polish: expose `getTodayQueue` on `window.shadowEN`
**Currently:** Internal to `app_v10_integration.js` or `app_v11_today.js`. Not callable from console.
**Fix:** Add `getTodayQueue: () => prioritizeReviewQueue(state.topics).filter(t => isQueuedToday(t))` to `window.shadowEN` namespace.
**Effort:** 15 min

---

## 🎯 V11.3+ — PRIORITY ORDER (post-stabilize)

### #1 Daily Loop polish (v11.2-B candidate)
**User ask:** Today card calmer, faster scan, less competing attention.
**Scope:** Small (~1-2 hours)
**Approach:**
- Reduce Today card visual weight (color, font size)
- Move Memory Pulse below Survival Patterns
- Make Rescue Queue more glanceable (icon + name + time-since)
- Increase whitespace
- Use observability data to determine what should lead the eye

---

### #2 Creator/Admin Mode (CMS UI inside app)
**User ask:** Create topic from inside dashboard, duplicate template, drag-drop sections, upload media.
**Scope:** Large (~3-5 hours dev)
**Approach:**
- New view `creator` accessible from sidebar
- Form to add new Topic ID + Topic Name → POSTs to Notion via Notion API
- Requires Notion integration token in client-side environment OR backend proxy
- Drag-drop reordering using `sortablejs` (zero-dep) or native HTML5 drag-and-drop
- File upload to Notion: not supported via API — must use Imgur/Cloudinary as media host

**Decision needed:**
- Direct Notion API from browser (token exposed) ← Insecure for shared dashboard
- Cloudflare Worker proxy ← Adds infrastructure
- Stay edit-in-Notion ← Simpler, but breaks "edit in app" UX goal

**Recommendation:** Defer until user really needs in-app editing. Notion editing is fine for solo creator.

---

### #3 Offline-First PWA (cache audio + lessons)
**User ask:** Cache lessons, audio, work offline, sync when online.
**Scope:** Medium (~2-3 hours)
**Approach:**
- Update sw.js ASSETS list to include all .js modules + .json files
- Add `BACKGROUND_SYNC` for state push to backend (if backend added)
- Cache TTS-generated audio? Tricky — Web Speech API doesn't expose raw audio buffer
- Cache external resources via SW
- Add online/offline indicator in UI

**Sub-tasks:**
- [ ] Update sw.js cache list (include v11.1 files: `debug_panel.js`, `phrases.js`, `today.js`, `app_v11_today.js`)
- [ ] Add storage check (`navigator.storage.estimate()`)
- [ ] UI badge when offline
- [ ] Test offline mode end-to-end

---

### #4 Gamification 2.0 (Achievements + Quests + Badges)
**User ask:** Achievements, weekly quests, combo streak, focus rank, monthly challenge, level unlock, rare badges. **CONSTRAINT:** Must serve consistency, not dopamine empty.
**Scope:** Medium (~3 hours)
**Approach:**
- `achievements.js` — list of achievement definitions
- Achievement check runs after each `saveState()` — unlocks once, persists
- Weekly quests: 3-5 challenges per week
- UI: Achievements page (in Missions sidebar), badge wall, streak counter
- **Avoid dopamine empty:**
  - Unlock SLOWLY (no first-day flood)
  - Tied to real behavior (consistency, not just usage)
  - Rare badges = genuinely rare (e.g. 60-day streak)

---

### #5 Memory Graph / Topic Connections
**User ask:** Restaurant ↔ Travel ↔ Hotel ↔ Small Talk. Phrase appearing in multiple topics = "survival phrase".
**Scope:** Medium-large (~4 hours)
**Approach:**
- Compute phrase overlap between topics → graph edges
- Tag phrases with `frequency` (how many topics use it)
- Visualize: D3.js force graph OR static SVG hex layout
- Show "Related topics" section in Topic Detail
- "Survival Phrases" page — top 50 most-used phrases

**Note:** Survival Patterns section in v11.1 debug panel is the first step here. If observation week shows the data is useful, promote it from observability layer to user-facing feature.

---

### #6 Audio Intelligence (Pronunciation Feedback)
**User ask:** Pronunciation compare, speaking confidence, pause detection, AI feedback.
**Scope:** LARGE (~6+ hours) — needs external service
**Approach:**
- Web Speech Recognition API (browser-native, free) — limited accuracy
- OpenAI Whisper API (external, paid) — high accuracy
- Compare user recording to native TTS spectrogram (advanced)
- AI feedback via GPT prompt with transcription

**Recommendation:** Phase 2. Start with browser Speech Recognition for confidence scoring. Whisper API integration in v13+.

---

## 📚 BACKLOG (no priority, ideas)

- [ ] Anki export (vocabulary + phrases as flashcards)
- [ ] Daily email digest (review reminder)
- [ ] Multi-language UI (currently mixed VN/EN)
- [ ] Voice command navigation
- [ ] Topic templates library (share configs between users)
- [ ] Dark/light mode auto-switch
- [ ] Multi-user mode (each device has own state)
- [ ] Webhook integration (Slack/Telegram for daily reminders)
- [ ] Pronunciation visualization (waveform comparison)
- [ ] Live AI tutor mode (chat with GPT during session)
- [ ] Export progress report PDF
- [ ] Spaced repetition simulator (test what-if scenarios)
- [ ] Notion → app push (instant sync via webhook)
- [ ] Mobile app (React Native shell around web app)
- [ ] Custom workflow for Pages build (escape `jekyll-build-pages` infra dependency)

---

## 🚫 EXPLICITLY OUT OF SCOPE

- Backend API server (use Notion + GitHub Pages until truly needed)
- React/Vue framework migration (zero-build constraint)
- Multi-tenant SaaS (current focus = single creator)
- Payment integration (free tool for now)
- Native iOS/Android apps (PWA is sufficient)

---

## 🎯 GUIDING PRINCIPLES (when prioritizing)

1. **STABILIZE before BUILD** (v11.1 lesson) — observability + verify before next feature
2. **User behavior > flashy features** — features must serve daily-return habit
3. **Content > Code** — never hardcode; everything via Notion or config
4. **Real data > fake data** — every metric traces to user action
5. **Adaptive > Fixed** — system learns from behavior
6. **Calm > Cluttered** — premium feel, deep work atmosphere
7. **Scale > Custom** — architecture supports 30 → 300 → 3000 topics
8. **Verify > Assume** (v11.1 deploy-incident lesson) — green commit ≠ deployed live; always check Actions tab

---

*Last update: 2026-05-26 (post-v11.1 STABILIZE ship).*
