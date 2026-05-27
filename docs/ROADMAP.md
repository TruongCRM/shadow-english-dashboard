# 🗺 SHADOW ENGLISH — ROADMAP

> Pending work + tech debt tracking. Priorities reflect v11.2 redesign decision + observation week discipline.

**Last update:** 2026-05-27 (Day 1 close — 6 polish patches shipped, v11.2 blueprint locked)

---

## ✅ DONE

| Version | Feature | Date |
|---|---|---|
| v1 | HTML dashboard mockup | 2026-05-26 |
| v2 | PWA + multi-view SPA | 2026-05-26 |
| v3 | State engine + localStorage | 2026-05-26 |
| v4 | Real content 32 topics + 13 views | 2026-05-26 |
| v5 | Content-agnostic (Notion CMS sync) | 2026-05-26 |
| v6 | 5-questions dashboard + real charts + 8-step session | 2026-05-26 |
| v7 | UI customization (layout.json + Settings) | 2026-05-26 |
| v8 | Audio System + Focus mode + Mobile | 2026-05-26 |
| v9 | Custom Content Blocks (18 types) | 2026-05-26 |
| v10 | Adaptive Memory + Real Metrics + AI Coach | 2026-05-26 |
| v11 | Daily Loop pre-prep (phrases.js + today.js + app_v11_today.js) | unknown — TD-2 |
| v11.1 | Internal Insight Panel + STABILIZE phase | 2026-05-26 |
| v11.1.1-1.8 | Stabilize patches (nav_polish.js 8 sub-versions) | 2026-05-26 |
| v11.1.9 | Level Map click hotfix (event bubbling) | 2026-05-27 |
| v11.1.10 | Heatmap data fill (rolling 28-day) | 2026-05-27 |
| v11.1.11 | Progress Tracker empty-canvas layout | 2026-05-27 |
| v11.1.12 | Polish bundle 1 (filter tabs + font + asym + mission) | 2026-05-27 |
| v11.1.13 | Polish bundle 2 (heatmap retarget + hero + purple + today goal) | 2026-05-27 |
| v11.1.14 | Day 21 stage tab | 2026-05-27 |

---

## 🚧 OPEN TECH DEBT (Day 1 close)

> **Sorted by priority for v11.2 unblocking.**

### TD-2 — CRITICAL — Blocks v11.2
**3 v11 scripts undocumented:** `phrases.js`, `today.js`, `app_v11_today.js`

- **Why critical:** v11.2 redesigns HERO STATS / TODAY GOAL / MEMORY STATUS. These cards likely rendered by these modules. Cannot safely rewrite without knowing data sources + DOM injection points.
- **Action Day 8 pre-flight:** Archaeology session — read all 3 files, document each function, map state inputs + DOM outputs.
- **Confirmed:** Today Queue mock data (Hotel Check-in, Small Talk, Taxi) sources from one of these modules (not state.topics).

### TD-5 — Pre-v11.2 — nav_polish.js injectCSS not versioned ID
- v11.1.x patches add new CSS but nav_polish.js v11.1.6 still uses bare `nav-polish-styles` ID
- Across tab sessions, CSS doesn't update properly (G9)
- **Fix:** refactor injectCSS() to versioned ID pattern OR replace nav_polish.js entirely in v11.2

### TD-7 — Pre-v11.2 — `cleanTodayGoal` regex too broad
- v11.1.13 regex `/TODAY GOAL/` matches TODAY FOCUS card (contains substring)
- Result: cleaned wrong card, TODAY GOAL standalone untouched
- **Fix:** Use exact title match OR data-section-id (G14)
- **Note:** v11.2 will replace this card entirely — TD-7 may auto-close

### TD-1 — Pre-v11.2 — Node 20 deprecation on Pages build
- GitHub will enforce deprecation at unknown date → all `pages-build-deployment` will fail
- **Mitigation:** Pin actions to Node 22+ in custom workflow (if we create one); else wait for GitHub auto-upgrade

### TD-8 — Day 2 — Heatmap rolling patch propagation
- v11.1.13 rolling-28-day patch deployed but Service Worker may cache old file
- Verify on Day 2 fresh load (with SW clear snippet)
- If still empty → v11.2 implementation moot anyway (will rewrite heatmap)

### TD-3 — Day 7 decide — Adaptive vs Debug formula ~19× divergence
- `SHADOW_ADAPTIVE.calculateForgetRisk(t)` = 0.014
- `SHADOW_DEBUG.forgetRiskBreakdown(t.id).total` = 0.270
- **Decision pending:** Day 7 observation. If observation reveals adaptive engine "too gentle" → back-port debug formula. If acceptable → keep current.

### TD-4 — Minor — `getTodayQueue` not exposed
- Internal to integration modules
- Worth exposing after v11.2 stabilizes
- Low priority

### TD-6 — PROPOSED — Level Map data source desync
- DOM Level 1 shows 8 emojis including 🚖 (taxi)
- state.topics L1 has 12 emojis NOT including 🚖
- nav_polish.js click-time lookup can't resolve 🚖 → fallback to level page
- **Action Day 7:** anh sign-off whether to formalize as TD or close (if v11.2 redesign removes Level Map structure entirely)

---

## 🎯 v11.2 — ARCHITECTURAL REDESIGN (Priority 1 post-Day-7)

**Blueprint:** `docs/V11_2_REDESIGN_BLUEPRINT.md`
**Phase:** PRE-DEPLOY (specs locked, awaiting sign-off)

### Pre-flight checklist (before ship)
- [ ] **TD-2 archaeology** (Day 8 morning, ~1h)
- [ ] **TD-5 close** nav_polish.js versioned CSS
- [ ] **User sign-off** §6 sheet in V11.2 blueprint:
  - [ ] HERO STATS HTML mockup §1.4
  - [ ] Identity tier mapping §1.6 (6 tiers)
  - [ ] Quote rotation pool §1.6 (5 strings)
  - [ ] Journey labels §1.7 (Beginner/Surviving/Responding/Flowing)
  - [ ] TODAY GOAL HTML mockup §2.4
  - [ ] Mission library §2.6 (5-8 from 10)
  - [ ] MEMORY STATUS HTML mockup §3.4
  - [ ] State decision logic §3.6
  - [ ] Insight library §3.7
  - [ ] All acceptance criteria §1.10, §2.7, §3.9

### Ship plan (Day 8-10, ~12h total)
- **Wave 1 (Day 8, 2h):** Foundation — TD-2 archaeology + revert v11.1.13 hero + v11.1.12 mission inject
- **Wave 2 (Day 8, 3h):** HERO STATS rewrite — replace DOM + CSS + identity logic
- **Wave 3 (Day 9, 2h):** TODAY GOAL rewrite — emotional compass + mission rotation
- **Wave 4 (Day 9-10, 3h):** MEMORY STATUS rewrite — health panel + interpretation layer
- **Wave 5 (Day 10, 2h):** Integration + polish + mobile testing
- **Wave 6 (Day 10):** CHANGELOG entry as v11.2.0, archive v11.1.x as "polish era"

### What v11.1.x ships get TOUCHED in v11.2
| Version | Action |
|---|---|
| v11.1.9 Level Map click | ✅ KEEP |
| v11.1.10 Heatmap fill | 🔄 REPLACE (new heatmap with tooltips per blueprint §3) |
| v11.1.11 Progress empty-canvas | ✅ KEEP (not in 3 cards scope) |
| v11.1.12 polish bundle | 🟡 PARTIAL — filter tabs + font KEEP, mission checklist REVERT |
| v11.1.13 polish bundle 2 | 🔴 MOSTLY REVERT — hero roadmap → replaced by v11.2 living identity |
| v11.1.14 Day 21 | ✅ KEEP |

---

## 🔮 BEYOND v11.2 — DEFERRED IDEAS (from original v11+ ROADMAP)

These were planned post-v10 but pushed back. Reconsider after v11.2 stable:

### Creator/Admin Mode (was v11 #1)
**User ask:** Create topic from inside dashboard, drag-drop sections, upload media.
**Scope:** ~3-5h
**Status:** DEFERRED — Notion editing fine for solo creator

### Offline-First PWA (was v11 #2)
**Scope:** ~2-3h
**Sub-tasks:** SW ASSETS expansion, storage check, offline indicator, TTS audio cache (tricky)

### Gamification 2.0 (was v11 #3)
**Constraint:** Must serve consistency, not dopamine empty.
**Approach:** `achievements.js` with 20 starter achievements, weekly quests, rare badges
**Status:** RISK — anh explicit "hates dopamine empty"; revisit post-v11.2

### Memory Graph (was v11 #4)
**User ask:** Restaurant ↔ Travel ↔ Hotel ↔ Small Talk. Survival phrases visualization.
**Scope:** ~4h
**Approach:** D3.js force graph OR static SVG hex layout
**Status:** Phase 2 — visualize after content stable

### Audio Intelligence (was v11 #5)
**Scope:** 6+h, needs external service
**Approach:** Browser Speech Recognition (free, limited) OR Whisper API (paid, accurate)
**Status:** v13+ minimum

---

## 📚 BACKLOG (no priority, ideas)

- [ ] Anki export (vocabulary + phrases as flashcards)
- [ ] Daily email digest (review reminder)
- [ ] Multi-language UI (currently mixed VN/EN)
- [ ] Voice command navigation
- [ ] Topic templates library
- [ ] Dark/light mode auto-switch
- [ ] Multi-user mode (each device has own state)
- [ ] Webhook integration (Slack/Telegram daily reminders)
- [ ] Pronunciation visualization (waveform comparison)
- [ ] Live AI tutor mode (chat with GPT during session)
- [ ] Export progress report PDF
- [ ] SR simulator (test what-if scenarios)
- [ ] Notion → app push (instant via webhook)
- [ ] Mobile app (React Native shell)

---

## 🚫 EXPLICITLY OUT OF SCOPE

- Backend API server (use Notion + GitHub Pages until truly needed)
- React/Vue framework migration (zero-build constraint)
- Multi-tenant SaaS (current focus = single creator)
- Payment integration (free tool)
- Native iOS/Android apps (PWA sufficient)

---

## 🎯 GUIDING PRINCIPLES

1. **User behavior > flashy features** — features must serve daily-return habit
2. **Content > Code** — never hardcode
3. **Real data > fake data** — every metric traces to action
4. **Adaptive > Fixed** — system learns from behavior
5. **Calm > Cluttered** — premium feel
6. **Scale > Custom** — architecture supports 30 → 300 → 3000 topics
7. **REWRITE > PATCH for emotional briefs** (NEW Day 1 lesson G11)
8. **Sign-off > Speed** for visual polish (NEW G8)

---

## 🗓 Day 7 (2026-06-02) Decision Gate

Auto-scheduled task pops 9 AM Vietnam time. Will:
1. Run 5 observation questions (V11_1_DEBUG_PANEL §"Observation week")
2. Verify v11.1.x state intact
3. **Decision gate:**
   - **Outcome A — v11.2 ship Day 8** (most likely if observation OK)
   - **Outcome B — defer v11.2, ship v11.2-A formula back-port first** (if TD-3 critical)
   - **Outcome C — partial v11.2** (HERO only Day 8, rest Day 12+)
4. TD-2 archaeology kickoff

---

*Last update: 2026-05-27 (Day 1 close).*
