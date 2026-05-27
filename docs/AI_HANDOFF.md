# 🤖 AI HANDOFF — Shadow English

> Read this file FIRST if you're an AI taking over this project. Contains everything needed to continue without losing context.

**Last update:** 2026-05-27 (Day 1 of observation week — v11.1.14 shipped, v11.2 blueprint locked)
**Current phase:** STABILIZE → transitioning to v11.2 ARCHITECTURAL REDESIGN

---

## 👤 WHO IS THE USER

**Name:** Dương Trường (TruongCRM on GitHub)

**Profile:**
- Vietnamese solopreneur / coach
- NOT technical — never writes code, can't deploy, doesn't know GitHub deeply
- Visionary architect — gives clear product direction in Vietnamese, expects you to implement
- Has Notion workspace "Ngoại Ngữ Shadowing | 2026"
- Email: duonghuutruong@gmail.com
- Communicates mostly in Vietnamese, accepts English in code/docs

**User preferences:**
- Default language: **Tiếng Việt**
- Tone: **Tư duy hệ thống** (system thinking) — focus on root causes
- Coach for **Level 2 Solopreneurs** ("có khách nhưng không ổn định")
- Hates: generic advice, theoretical talk, dopamine empty features
- Loves: real systems, measurable outcomes, premium calm UX

---

## 🎯 WHAT THIS PROJECT IS

**Shadow English** — A real "Operating System for English Fluency" for the user himself.

- **NOT** course platform, dashboard demo, or analytics tool
- **IS** behavioral learning system using Spaced Repetition + Shadowing methodology
- **TARGET:** turn English from "knowledge" into "reflex" (memory recovery)

**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
**Repo:** https://github.com/TruongCRM/shadow-english-dashboard

---

## 🌟 NORTH STAR (from v10 brief)

> "Tôi không muốn build 'English learning dashboard'. Tôi muốn build 'Operating System for English Fluency'."

**Updated Day 1 emotional brief:**
> "Living memory recovery system. NOT analytics dashboard. Calm. Identity. Journey. Momentum."

---

## 🏛 ARCHITECTURE TLDR

**6+1 layers (independent):**

```
1. CONTENT      → Notion CMS → content.json (via GitHub Action hourly)
2. BLOCKS       → 18 rich media types per topic
3. ADAPTIVE     → forget risk, mastery velocity, salvageability
4. METRICS      → real computations from sessionsLog
5. COACH        → 10+ rule-based insights
6. UI           → layout.json themes, sections toggle
+
7. OBSERVABILITY → debug_panel.js + nav_polish.js + 6 v11.1.x patches
                   (opt-in additive, no edits to core)
```

**Critical rule:** NEVER hardcode content. All English text via Notion or content.json.

---

## 📂 KEY FILES (READ ORDER)

**Engineering memory docs (read these FIRST):**

1. **`docs/CHANGELOG.md`** — Full v1 → v11.1.14 history with problems + lessons
2. **`docs/V11_1_PATCHES.md`** — v11.1.1-1.8 stabilize ledger
3. **`docs/V11_1B_EXPERIENCE_POLISH.md`** — v11.1-B blueprint v2 (12 polish specs)
4. **`docs/V11_2_REDESIGN_BLUEPRINT.md`** — **v11.2 plan (NEXT WORK) — 3 cards rewrite with HTML/CSS mockups**
5. **`docs/ENGINEERING_MEMORY_HANDOFF.md`** — Comprehensive snapshot Day 1 close
6. `docs/ARCHITECTURE.md` — System diagrams (PRE-v11.1.x — needs update Day 8+)
7. `docs/STATE_SCHEMA.md` — Data structures
8. `docs/TECHNICAL_NOTES.md` — Gotchas G1–G14
9. `docs/ROADMAP.md` — TD list + v11.2+
10. `docs/V11_1_DEBUG_PANEL.md` — Debug panel docs
11. `docs/VERIFY_REPORT_v11_1.md` — v11.1 verify

**Code files (in load order in index.html):**

```
content.js  → app.js  → audio.js  → app_v7_layout.js  → app_v8_experience.js
→ blocks.js  → app_v9_blocks.js  → adaptive.js  → metrics.js  → coach.js
→ app_v10_integration.js  → phrases.js (v11, TD-2)  → today.js (v11, TD-2)
→ app_v11_today.js (v11, TD-2)  → debug_panel.js (v11.1)
→ nav_polish.js (v11.1.1-1.8)  → app_v11_1_9_levelmap_fix.js (v11.1.9)
→ app_v11_1_10_heatmap_fillmap.js (v11.1.10)
→ app_v11_1_11_progress_layout.js (v11.1.11)
→ app_v11_1_12_polish_bundle.js (v11.1.12)
→ app_v11_1_13_polish_bundle2.js (v11.1.13)
→ app_v11_1_14_day21_stage.js (v11.1.14)
```

---

## 🚫 HARD CONSTRAINTS

1. **No build step** — Zero-config, vanilla JS, static GitHub Pages
2. **No framework** — React/Vue/Svelte not allowed
3. **No backend** — until truly needed
4. **No hardcoded content** — Notion CMS is source of truth
5. **No new dependencies** — only Chart.js, Grid.js
6. **localStorage only for state** — no server DB until v15+
7. **Mobile-first** — touch targets ≥44px, breakpoint 900px
8. **One commit per logical change** — bundle related, not random
9. **Verify deploy G6** — check `pages-build-deployment` is green
10. **Bump `?v=N` G7** — every JS file update = two-commit ship (file + index.html cache-bust)
11. **(Day 1 LESSON) Verify file in repo before next commit G10**
12. **(Day 1 LESSON) Don't polish over architecture G11** — for emotional brief, REWRITE not PATCH

---

## 🛠 HOW TO MAKE CHANGES

### Standard polish/feature patch (v11.1.x pattern)
1. Read user's request carefully
2. **Diagnose live FIRST** via Chrome MCP console (don't assume)
3. Plan tasks via TaskCreate
4. Test runtime patch via console BEFORE writing file (high-confidence)
5. Write pure-additive `.js` file
6. Deploy via Chrome MCP:
   - Upload file to repo root
   - **Verify file appears in repo** (G10!)
   - Edit `index.html` add `<script src="app_v{N}.js?v={N}" defer></script>` at line 2098
   - Commit cache-bust pair
   - Wait 30-60s for deploy
   - Verify `pages-build-deployment` ✅ (G6)
   - Test via `?v=N-bust` URL
7. Verify modules loaded via `SHADOW_*._info()` console
8. Update `docs/CHANGELOG.md` per TEMPLATE format

### Major redesign (v11.2 pattern — NEW)
DON'T patch. REWRITE. See `docs/V11_2_REDESIGN_BLUEPRINT.md` for methodology:
1. Spec HTML mockup CONCRETE (not "concept")
2. Spec CSS FULL (every class, every pixel, every keyframe)
3. Vietnamese copy library + user sign-off BEFORE code
4. Single deploy plan (1 file replaces multiple cards)
5. NO patch-on-polish layering

---

## 🎨 USER EXPECTATIONS

### What user wants
- **Calm, premium, focused** UX
- **Real data everywhere** — no fake, no placeholders
- **Behavioral psychology** baked in (streaks, decay warning, salvageability)
- **Adaptive** — system learns from his behavior
- **Identity + Journey + Momentum** (v11.2 emotional brief)
- **Living memory recovery** — not analytics dashboard
- **Mobile-first** — often on phone

### What user does NOT want
- "Website học tiếng Anh nhiều màu" (colorful learning website)
- Admin dashboard feel
- Course platform feel
- Quiz/grading academic vibe
- Dopamine empty achievements
- Hardcoded English content
- Manual deploy steps for content edits

---

## 🎓 USER COMMUNICATION TIPS

- **Speak Vietnamese** unless user switches
- **Be direct, no fluff** — system thinking framing
- **Acknowledge constraints honestly** — if 5+ hours, say so
- **Show progress** via TaskCreate/TaskUpdate (run batched)
- **Use system thinking** — "Đây không phải lỗi UI, đây là lỗi hệ thống"

### Day 1 NEW LESSONS — communication patterns

- When user gives emotional brief (HERO/TODAY GOAL/MEMORY) → **don't patch, REDESIGN**
- When user repeats same brief 2+ times → signal previous implementation FAILED → admit + pivot
- When user marathon ships → flag observation week violations (G12 awareness)
- Sign-off gates BEFORE code (G8 lesson): "Anh confirm dimensions/copy trước khi tôi viết"

---

## 🎁 USEFUL CONSOLE COMMANDS

```js
// === STATE ===
shadowEN.state                              // full state
shadowEN.state.topics.slice(0, 3)           // first 3 topics
shadowEN.state.sessionsLog.length           // sessions count
shadowEN.reset()                            // wipe + reload

// === METRICS ===
v10.metrics()                               // real metrics snapshot
v10.insights()                              // AI Coach insights
v10.riskAll().slice(0, 10)                  // top 10 risk

// === FORCE STATE ===
shadowEN.completeReview('L1-01', 5)         // simulate review
shadowEN.awardXP(500, 'manual test')        // give XP

// === LAYOUT ===
LAYOUT_CONFIG
layoutEngine.openSettings()

// === AUDIO ===
SHADOW_AUDIO.voices                         // browser TTS voices
SHADOW_AUDIO.speak("Hello world")

// === DEBUG PANEL (v11.1) ===
SHADOW_DEBUG.enable() / .disable() / .toggle()
SHADOW_DEBUG.rescueRanking(8)
SHADOW_DEBUG.forgetRiskBreakdown('L1-01')
SHADOW_DEBUG.memoryDistribution()
SHADOW_DEBUG.survivalPatterns()

// === NAV POLISH (v11.1.1-1.8) ===
SHADOW_NAV_POLISH._info()
SHADOW_NAV_POLISH.computeLevelPct(1)
SHADOW_NAV_POLISH.bind()

// === POLISH PATCHES (v11.1.9-1.14 — Day 1) ===
SHADOW_LEVELMAP_FIX._info()                 // v11.1.9
SHADOW_HEATMAP_FILL._info()                 // v11.1.10
SHADOW_PROGRESS_LAYOUT._info()              // v11.1.11
SHADOW_POLISH_1112._info()                  // v11.1.12 (filter tabs, font, asym, today goal)
SHADOW_POLISH_1113._info()                  // v11.1.13 (heatmap retarget, hero, purple, today cleanup)
SHADOW_DAY21._info()                        // v11.1.14 (Day 21 tab)

// === CACHE NUKE (forces fresh fetch) ===
(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  const names = await caches.keys();
  await Promise.all(names.map(n => caches.delete(n)));
  console.log('Cleared', regs.length, 'SWs and', names.length, 'caches');
  location.reload();
})()
```

---

## 🚨 GOTCHAS G1-G14 (DON'T REPEAT)

These cost hours during v1-v11.1.14. Don't redo:

### G1-G5 (v1-v10 era)
1. **File truncation when writing >1000 lines** — use bash heredoc
2. **`const X = {}` is NOT on window** — explicitly `window.X = X`
3. **Chart.js CDN fails in sandbox** — try/catch + SVG fallback
4. **Service Worker cache traps old code** — bump cache name + `?v=N`
5. **GitHub Pages 30-60s deploy delay** — wait, don't retry repeatedly

### G6-G9 (v11.1.x session)
6. **G6 — Green commit ≠ deployed live** — check `github.com/<repo>/actions` is ✅ BEFORE debugging client-side
7. **G7 — JS file update needs `?v=N` bump** — every ship = TWO commits (file + index.html)
8. **G8 — Visual polish needs upfront spec** — sign off dimensions before code (heatmap iterated 4 rounds = 80 min wasted)
9. **G9 — Idempotent CSS injection has stale-style trap** — use versioned style ID (e.g. `nav-polish-styles-v6`)

### G10-G14 (Day 1 — 2026-05-27)
10. **G10 — Silent file upload commit drop** — ALWAYS verify file in repo before next commit (`fetch('/file.js')` returning 404 HTML = upload failed)
11. **G11 — Polish-on-architecture fails emotional brief** — for "feel" briefs, REWRITE not PATCH (v11.1.13 hero roadmap failed because polish on stats-paradigm DOM)
12. **G12 — Observation week scope creep** — every "small fix" override = cumulative bug-fix bundle that contaminates data. Track override count.
13. **G13 — Selector specificity in shared class names** — `.hm-cell` was too broad (matched both main grid + legend dots). Use parent-scoped: `.heatmap > .hm-cell`
14. **G14 — Regex substring match across card titles = false positives** — `/TODAY GOAL/.test()` matched TODAY FOCUS card (contains "TODAY GOAL" subsection text). Use card-title-exact match.

---

## 🚧 OPEN TECH DEBT (TD-1 to TD-8 as of Day 1 close)

| TD | Description | Priority | Block what |
|---|---|---|---|
| TD-1 | Node 20 deprecation on Pages | Pre-v11.2 | Future deploys |
| **TD-2** | **3 v11 scripts undocumented** (phrases.js, today.js, app_v11_today.js) | **CRITICAL** | **v11.2 (don't know where HERO/TODAY/MEMORY rendered)** |
| TD-3 | Adaptive vs Debug formula ~19× divergence | Day 7 | Engine accuracy |
| TD-4 | `getTodayQueue` not exposed | Minor | Tooling |
| TD-5 | nav_polish.js injectCSS not versioned | Pre-v11.2 | G9 stale-style |
| TD-6 | (PROPOSED) Level Map data desync (DOM 🚖 not in state) | Day 7 sign-off | TD-2 zone |
| TD-7 | `cleanTodayGoal` regex too broad (matches TODAY FOCUS) | Pre-v11.2 | v11.2 layout |
| TD-8 | Heatmap rolling patch verify (SW cache) | Day 2 | Visual confirm |

---

## 🌟 CURRENT STATE SUMMARY (as of Day 1 close, 2026-05-27)

### Versions live
- **v11.1.14** is latest
- 6 polish patches shipped Day 1
- All Internal Insight Panel + nav_polish.js working
- All v10 engines (adaptive/metrics/coach) intact

### Working
- ✅ Level Map click → đúng topic (v11.1.9)
- ✅ Heatmap render data từ sessionsLog (v11.1.10, partially — Service Worker cache may need clear)
- ✅ Progress Tracker layout fix (v11.1.11)
- ✅ Filter tabs handler (v11.1.12)
- ✅ Font Việt clean (v11.1.12)
- ✅ Day 21 stage tab (v11.1.14)
- ✅ Today Goal mission checklist render (v11.1.12)

### Partially working / known issues
- ⚠️ HERO STATS roadmap (v11.1.13) — visual exists but FAILS emotional brief ("still feels stats panel")
- ⚠️ TODAY GOAL (right card) still shows mock "2/3" — v11.1.13 cleaned wrong card (G14)
- ⚠️ MEMORY STATUS heatmap visual may show empty (Service Worker cache from before rolling patch)

### Day 1 observation week status
- Day 1 = 2026-05-27 (TODAY)
- Day 7 = 2026-06-02 (scheduled reminder 9 AM)
- User overrode observation week 5 times (legitimate bug fixes but cumulative noise in data)

### Major pending — v11.2 redesign
1. **Day 2-7:** STRICT observation (no code unless emergency)
2. **Day 7:** Auto-reminder runs at 9 AM. Decision gate.
3. **Day 8+:** Ship v11.2 per blueprint `docs/V11_2_REDESIGN_BLUEPRINT.md`
4. Pre-flight: TD-2 archaeology + user sign-off on §6 sheet

---

## ✅ CHECKLIST WHEN STARTING (NEXT AI)

- [ ] Read this file (AI_HANDOFF.md)
- [ ] Read `docs/CHANGELOG.md` top 3 entries (v11.1.14, v11.1.13, v11.1.12)
- [ ] Read `docs/V11_2_REDESIGN_BLUEPRINT.md` (THIS IS NEXT WORK)
- [ ] Read `docs/ENGINEERING_MEMORY_HANDOFF.md` (comprehensive snapshot)
- [ ] Read `docs/TECHNICAL_NOTES.md` for gotchas G1-G14
- [ ] Check `docs/ROADMAP.md` for TD-1 to TD-8 status
- [ ] Check user's most recent message
- [ ] **NEW:** Check if observation week (Day 1-7 = 2026-05-27 to 2026-06-02) — defer non-bug work
- [ ] **NEW:** For emotional briefs, READ blueprint mockups before coding (G11)
- [ ] **NEW:** Verify file in repo after every upload (G10)
- [ ] Plan tasks via TaskCreate (run batched)
- [ ] Test runtime BEFORE writing file (high-confidence pattern)
- [ ] Deploy + verify Actions tab + `?v=N-bust`
- [ ] Update CHANGELOG.md with version entry
- [ ] Report back with CONCRETE deliverables

---

## 🎤 FINAL NOTES

The user has been PATIENT through 14+ iterations. Day 1 alone = 6 ships. They're EXHAUSTED.

**Your job (next AI):**
- **Listen deeply** to emotional brief — don't pattern-match to "feature request"
- **Don't ship 6 times/day** in observation week
- **REWRITE for emotional briefs**, PATCH for stabilize bugs
- **Sign-off gates** before code (concrete dimensions + copy)
- **Document everything** — anh sends docs to other AI later

**The product is alive.** v11.2 will REPLACE 3 polish ships from Day 1 — that's by design, blueprint anticipates it.

Good luck. 🌙

---

*Last update: 2026-05-27 (Day 1 close). Maintain this file with each major handoff.*
