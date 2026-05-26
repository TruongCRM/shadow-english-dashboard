# 🗺 SHADOW ENGLISH — ROADMAP

> Pending work for v11 and beyond. Priorities reflect user's explicit ranking from v10 brief.

---

## ✅ DONE (v1–v10)

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

---

## 🎯 V11 — PRIORITY ORDER

### #1 Creator/Admin Mode (CMS UI inside app)
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

### #2 Offline-First PWA (cache audio + lessons)
**User ask:** Cache lessons, audio, work offline, sync when online.
**Scope:** Medium (~2-3 hours)
**Approach:**
- Update sw.js ASSETS list to include all .js modules + .json files
- Add `BACKGROUND_SYNC` for state push to backend (if backend added)
- Cache TTS-generated audio? Tricky — Web Speech API doesn't expose raw audio buffer
- Cache external resources (YouTube thumbnails, images) via SW
- Add online/offline indicator in UI

**Sub-tasks:**
- [ ] Update sw.js cache list
- [ ] Add storage check (`navigator.storage.estimate()`)
- [ ] UI badge when offline
- [ ] Test offline mode end-to-end

---

### #3 Gamification 2.0 (Achievements + Quests + Badges)
**User ask:** Achievements, weekly quests, combo streak, focus rank, monthly challenge, level unlock, rare badges. **CONSTRAINT:** Must serve consistency, not dopamine empty.
**Scope:** Medium (~3 hours)
**Approach:**
- `achievements.js` — list of achievement definitions:
  ```js
  { id: 'first-session', name: 'Day Zero', desc: '...', check: s => s.sessionsLog.length >= 1, xp: 50 }
  ```
- Achievement check runs after each `saveState()` — unlocks once, persists
- Weekly quests: 3-5 challenges per week (e.g. "5 sessions this week", "All Day 1 reviews done")
- UI: Achievements page (in Missions sidebar), badge wall, streak counter
- **Avoid dopamine empty:**
  - Achievements unlock SLOWLY (no first-day flood)
  - Tied to real behavior (consistency, not just usage)
  - Rare badges = genuinely rare (e.g. 60-day streak)

**Sub-tasks:**
- [ ] Define 20 starter achievements
- [ ] Build achievement checker (runs after state mutation)
- [ ] UI: achievement unlock toast + page

---

### #4 Memory Graph / Topic Connections
**User ask:** Restaurant ↔ Travel ↔ Hotel ↔ Small Talk. Phrase appearing in multiple topics = "survival phrase".
**Scope:** Medium-large (~4 hours)
**Approach:**
- Compute phrase overlap between topics → graph edges
- Tag phrases with `frequency` (how many topics use it)
- Visualize: D3.js force graph OR static SVG hex layout
- Show "Related topics" section in Topic Detail
- "Survival Phrases" page — top 50 most-used phrases

**Sub-tasks:**
- [ ] Phrase frequency analyzer in content.js
- [ ] Related topics computation
- [ ] Graph visualization (simple SVG first, force-directed later)

---

### #5 Audio Intelligence (Pronunciation Feedback)
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

---

## 🚫 EXPLICITLY OUT OF SCOPE

- Backend API server (use Notion + GitHub Pages until truly needed)
- React/Vue framework migration (zero-build constraint)
- Multi-tenant SaaS (current focus = single creator)
- Payment integration (free tool for now)
- Native iOS/Android apps (PWA is sufficient)

---

## 🎯 GUIDING PRINCIPLES (when prioritizing)

1. **User behavior > flashy features** — features must serve daily-return habit
2. **Content > Code** — never hardcode; everything via Notion or config
3. **Real data > fake data** — every metric traces to user action
4. **Adaptive > Fixed** — system learns from behavior
5. **Calm > Cluttered** — premium feel, deep work atmosphere
6. **Scale > Custom** — architecture supports 30 → 300 → 3000 topics

---

*Last update: 2026-05-26 (post-v10)*
