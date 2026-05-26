# 🤖 AI HANDOFF — Shadow English

> **⚠️ STOP. Read `docs/README.md` first.** It's the entry point into the engineering memory system. This file is one of 8 docs that comprise it.
>
> Once you've read README, come back here for who-the-user-is + non-negotiables + current-state summary.

---

## 0. ENGINEERING MEMORY SYSTEM (added 2026-05-26 post-v11.1.x)

This project's memory lives in `docs/`. The structure:

| File | Role |
|------|------|
| `README.md` | **START HERE** — entry point, navigation, workflow |
| `TEMPLATE_VERSION_ENTRY.md` | Strict template for every new CHANGELOG entry |
| `CHANGELOG.md` | Versioned history v1 → v11.x with full goal/built/problems/fixes/lessons |
| `ARCHITECTURE.md` | 6+1 layers, data flow, design rationale |
| `STATE_SCHEMA.md` | All data structures |
| `TECHNICAL_NOTES.md` | Gotchas (1–10 + G6–G9), debug commands, deploy workflow, "do not" list |
| `ROADMAP.md` | v11.2+ priorities, tech debt, backlog |
| `AI_HANDOFF.md` | This file — user profile + state summary |
| `V11_1_DEBUG_PANEL.md` | Deep dive on Internal Insight Panel |
| `V11_1_PATCHES.md` | Session log for v11.1.0 → v11.1.8 |
| `VERIFY_REPORT_v11_1.md` | Post-deploy verification record |

**Rule for adding to this memory:** Every shipped code change MUST get a CHANGELOG entry using TEMPLATE_VERSION_ENTRY.md. No exceptions. See README §3 for the workflow.

---

## 👤 WHO IS THE USER

**Name:** Dương Trường (TruongCRM on GitHub)
**Profile:**
- Vietnamese solopreneur / coach
- NOT technical — never write code, can't deploy, doesn't know GitHub deeply
- Visionary architect — gives clear product direction, expects you to implement
- Has Notion workspace "Ngoại Ngữ Shadowing | 2026"
- Communicates mostly in Vietnamese, accepts English in code/docs
- Email: duonghuutruong@gmail.com

**User preferences (per system prompt):**
- Default language: **Tiếng Việt**
- Tone: **Tư duy hệ thống** (system thinking) — focus on root causes, not surface fixes
- Audience: He's a coach for **Level 2 Solopreneurs** ("có khách nhưng không ổn định")
- Hates: generic advice, theoretical talk, complex architecture
- Loves: real systems, measurable outcomes, scalable products

---

## 🎯 WHAT THIS PROJECT IS

**Shadow English** — A real "Operating System for English Fluency" for the user himself.

- **NOT** a course platform
- **NOT** a dashboard demo
- **IS** a behavioral learning system using Spaced Repetition + Shadowing methodology
- Target: turn English from "knowledge" into "reflex"

**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
**Repo:** https://github.com/TruongCRM/shadow-english-dashboard
**Notion:** https://www.notion.so/H-C-NGO-I-NG-36b2ba8076cf80359caaed8a0adc7439

---

## 🏛 ARCHITECTURE TLDR

3 macro layers + 6 runtime micro layers + **1 observability layer (v11.1)**. See `ARCHITECTURE.md` for diagrams.

```
CONTENT → Notion CMS (user edits here) → content.json (via GitHub Action hourly sync)
LOGIC → app.js + v7/v8/v9/v10/v11 modules (state engine, adaptive SR, metrics, coach, blocks, phrases, today)
UI → layout.json + Settings panel (theme, sections, branding)
OBSERVABILITY → debug_panel.js (v11.1, ?debug=1 toggle, read-only, opt-in)
```

**Critical rule:** NEVER hardcode content in code. All English text goes through Notion or content.json.

---

## 📂 KEY FILES (read these in order)

1. `docs/CHANGELOG.md` — Full v1–v11.1 history with problems + lessons learned
2. `docs/ARCHITECTURE.md` — System diagrams + data flow + design decisions
3. `docs/STATE_SCHEMA.md` — All data structures (state, content, layout, Notion DB)
4. `docs/TECHNICAL_NOTES.md` — Known issues + workarounds + debugging tips
5. `docs/ROADMAP.md` — What's next (v11.2+)
6. `docs/V11_1_DEBUG_PANEL.md` — Internal Insight panel architecture + verify checklist
7. `docs/VERIFY_REPORT_v11_1.md` — v11.1 post-deploy verification record (Day 0)
8. `docs/V11_1_OBSERVATIONS.md` — (to be filled Day 7 by user + AI)
9. `BLOCKS_GUIDE.md` — User docs for Custom Content Blocks
10. `SETUP_NOTION_SYNC.md` — User docs for Notion sync

Then read the code:
- `index.html` — UI shell
- `app.js` — state engine
- `content.js` + `content.json` — content layer
- `adaptive.js` + `metrics.js` + `coach.js` — v10 intelligence
- `blocks.js` — v9 content blocks
- `audio.js` — v8 audio system
- `app_v7_layout.js` — v7 UI config
- `app_v8/9/10_*.js` — version integration patches
- `phrases.js` + `today.js` + `app_v11_today.js` — v11 (undocumented — see TD-2)
- `debug_panel.js` — v11.1 observability layer

---

## 🚫 HARD CONSTRAINTS

1. **No build step** — Zero-config, vanilla JS, static GitHub Pages
2. **No framework** — React/Vue/Svelte not allowed
3. **No backend** — until truly needed (defer to user request)
4. **No hardcoded content** — Notion CMS is the source of truth
5. **No new dependencies** — only Chart.js, Grid.js (already in use)
6. **localStorage only for state** — no server DB until v15+
7. **Mobile-first responsive** — touch targets ≥44px, breakpoint 900px
8. **v11.1+:** Pure-additive new layers — no state schema migration, observability stays opt-in

---

## 🎨 USER EXPECTATIONS

### What the user wants
- **Calm, premium, focused** UX — NOT flashy, NOT cluttered
- **Real data everywhere** — no fake numbers, no placeholders
- **Behavioral psychology** baked in (streaks, real progress, decay warning)
- **Adaptive** — system learns from his behavior, not rigid
- **Scalable** — 30 → 300 → 3000 topics without breaking
- **Mobile-first** — he's busy, often on phone
- **STABILIZE before BUILD** (v11.1 lesson) — measure, then expand

### What the user does NOT want
- "Website học tiếng Anh nhiều màu" (colorful English learning website)
- Admin dashboard feel
- Course platform feel
- Quiz/grading academic vibe
- Dopamine empty (achievements that don't matter)
- Hardcoded English content in JS
- Manual deploy steps for content edits
- New features when v11.1 observation week is still active

---

## 🛠 HOW TO MAKE CHANGES

### To add a new feature (e.g. v11.3 work):
1. Read user's request carefully — they often give 12-point briefs but expect prioritization
2. Identify HIGHEST impact items (usually first 2-3 in their list)
3. Defer the rest with clear rationale in your response
4. Build module per layer (don't mix concerns)
5. Add CSS at bottom of index.html (last `<style>` block)
6. Add script tag with `defer` after existing scripts
7. Test in browser console with debug commands
8. Deploy via Chrome MCP file upload
9. **VERIFY DEPLOY:** Check `github.com/<repo>/actions` for latest `pages-build-deployment` = ✅ before claiming "shipped"
10. Verify on `?v=N-bust` URL
11. Update `docs/CHANGELOG.md` with date/goal/built/problems/fixes/lessons

### To deploy:
- Use `mcp__Claude_in_Chrome__file_upload` with `ref` from `find('choose your files')`
- Then scroll, fill commit message via `form_input`, click "Commit changes" button
- **Wait + verify Actions tab** before declaring success (v11.1 lesson — see G6 below)
- Test with `?v=N-bust` query param

---

## 🎓 USER COMMUNICATION TIPS

- **Speak Vietnamese** unless user switches to English
- **Be direct, no fluff** — user values systems thinking
- **Acknowledge constraints honestly** — if something isn't feasible, say why
- **Show progress** — use TaskCreate/TaskUpdate, run them in batches
- **Don't hide complexity** — explain trade-offs but stay user-friendly
- **Use system thinking framing** — "Đây không phải lỗi UI, đây là lỗi hệ thống"
- **Reference Notion workspace ID:** Workspace "Ngoại Ngữ Shadowing | 2026"
- **v11.1 onwards:** Treat STABILIZE phase as sacred — don't propose new features until observation week ends

---

## 🎁 USEFUL CONSOLE COMMANDS (paste into browser DevTools)

```js
// Full state inspection
shadowEN.state

// Force-complete a review
shadowEN.completeReview('L1-01', 5)

// Award XP
shadowEN.awardXP(500, 'manual test')

// Reset state (wipes everything)
shadowEN.reset()

// Layout/Theme
layoutEngine.openSettings()
LAYOUT_CONFIG.theme.preset = 'midnight'; applyLayout()

// Audio test
SHADOW_AUDIO.speak("Hello, this is Shadow English speaking.")

// List content
Object.keys(SHADOW_CONTENT.TOPIC_CONTENT)

// Show all phrases for one topic
SHADOW_CONTENT.getContent('L1-01').phrases

// Trigger AI coach toast
toast(SHADOW_COACH.generate(1)[0].text)

// v11.1 observability
SHADOW_DEBUG.enable()
SHADOW_DEBUG.rescueRanking(8)
SHADOW_DEBUG.forgetRiskBreakdown('L1-01')   // returns {total, components: {age, memory, confidence, adaptive}}
SHADOW_DEBUG.memoryDistribution()           // {Fragile, Weak, Building, Stable, Automatic}
SHADOW_DEBUG.survivalPatterns()             // phrases shared ≥2 topics in today's queue
SHADOW_DEBUG.disable()

// Compare formulas (v11.1 → v11.2 decision data)
SHADOW_ADAPTIVE.calculateForgetRisk(shadowEN.state.topics[0])
SHADOW_DEBUG.forgetRiskBreakdown(shadowEN.state.topics[0].id).total
// (As of 2026-05-26: ~19× divergence for L1-01. Observation week will decide reconciliation.)
```

---

## 🚨 GOTCHAS DON'T REPEAT

These cost hours during v1–v11.1. Don't redo:

1. **File truncation when writing >1000 lines** — use bash heredoc, not Edit tool
2. **`const X = {}` is NOT on window** — explicitly do `window.X = X`
3. **Chart.js CDN fails in sandbox** — wrap in try/catch + SVG fallback
4. **Service Worker cache traps old code** — bump cache name + query params
5. **GitHub Pages 30-60s deploy delay** — wait, don't retry repeatedly
6. **NAV_RENDERS reference closure** — wrap `window.navigate` not NAV_RENDERS
7. **MutationObserver alone unreliable** — use setInterval(1.5s) as fallback for auto-enhancement
8. **Notion API doesn't sync back to JSON** — content.json is overwritten by GitHub Action
9. **Form input + click sometimes silently fails** — verify with screenshot before claiming success
10. **`display: contents` is required for view containers** — don't change to `display: block`

### 🔥 NEW from v11.1 incident:

11. **GREEN COMMIT ≠ DEPLOYED LIVE (G6).** A commit visible in `github.com/<repo>/blob/main/<path>` does NOT mean the file is being served by live URL. If `pages-build-deployment` workflow fails, GitHub Pages keeps serving the LAST successful build. Symptom: "I uploaded the file, but live still doesn't show it." Cure: open `github.com/<repo>/actions`, confirm latest run is ✅ green BEFORE debugging client-side. Add this as **Bước 0** in any future "panel/feature not showing" diagnostic.

12. **GitHub's own infrastructure can fail your deploy.** The `pages-build-deployment` workflow downloads `actions/jekyll-build-pages` from `codeload.github.com`. If that CDN returns 5xx, the build fails in 3 seconds with no obvious cause. There's NO ALERT, NO EMAIL. Recovery = "Re-run failed jobs" (often transient). Long-term: monitor + consider custom workflow.

13. **Diagnostic protocols MUST start at the upstream tier.** v11.1 HANDOFF §4 jumped straight to browser-tier debugging (cache, script-path, runtime, CSS). Real cause was 2 tiers upstream (GitHub Actions infra). When designing diagnostic flow for future bugs: **always include "pipeline status" as Step 0** before any browser-tier step.

---

## 🔮 USER'S NORTH STAR

What user said in v10 brief:
> "Tôi không muốn build 'English learning dashboard'. Tôi muốn build 'Operating System for English Fluency'."

What user added in v11.1 STABILIZE brief:
> "Trước khi build feature mới, hãy hoàn thành và stabilize v11.1 đúng engineering flow."

What this means for your decisions:
- Optimize for **long-term retention** over short-term wins
- Optimize for **real-life speaking transformation** over flashy UI
- Optimize for **calm deep work** over engagement metrics
- Optimize for **system-level intelligence** over hardcoded features
- **Optimize for stability + verification before any new feature ships**

---

## ✅ CHECKLIST WHEN STARTING

When you (next AI) start working on this project:

- [ ] Read this file (AI_HANDOFF.md)
- [ ] Read CHANGELOG.md (especially last 2-3 versions — v10 + v11.1)
- [ ] Read ARCHITECTURE.md
- [ ] Read STATE_SCHEMA.md if changing data structures
- [ ] Read TECHNICAL_NOTES.md for gotchas
- [ ] Read VERIFY_REPORT_v11_1.md if observation week not done yet
- [ ] Check ROADMAP.md for current priorities
- [ ] Read user's latest message carefully — they often expect prioritization
- [ ] Plan tasks via TaskCreate before coding
- [ ] Build per-layer (not mixed concerns)
- [ ] Test in browser console with debug commands
- [ ] Deploy + verify with `?v=N-bust` AND CONFIRM ACTIONS TAB ✅
- [ ] Update CHANGELOG.md with your version entry
- [ ] Report back to user with concrete deliverables (not just task list)

---

## 🌟 CURRENT STATE SUMMARY (as of v11.1 — 2026-05-26 evening)

- **Live URL:** https://truongcrm.github.io/shadow-english-dashboard/?debug=1
- **Latest version:** **v11.1** (STABILIZE phase active)
- **Active phase:** Observation week (Day 0 → Day 7)
- **6 runtime layers + 1 observability layer:** Content, Blocks, Adaptive, Metrics, Coach, UI, **Internal Insight (debug_panel)**
- **32 topics** seeded (5 rich content, 27 skeletal)
- **18 block types** available for rich content
- **5 themes** (dark-purple default, ocean-blue, forest-green, sunset-orange, midnight)
- **PWA installable** with offline cache (basic)
- **Notion sync** wired up but requires user to add NOTION_TOKEN secret to GitHub
- **Audio system** functional with 6+ browser TTS voices
- **AI Coach** generating 10+ rule-based insights

**v11.1 verified:**
- State schema intact (11 keys, no new fields)
- localStorage adds only 1 new key (`shadow-en-debug-mode`)
- No console errors
- Single debug_panel.js injection (no duplicate)
- Toggle `?debug=0/1` works + persists
- Mobile CSS rules in place (10 rules @ max-width:600px)
- Build #22 re-run succeeded after 5 consecutive infra fails

**Active technical debt (pre-v11.2):**
| ID | Item | Class |
|---|---|---|
| TD-1 | Node.js 20 deprecation warning on Pages build | `technical-debt-v11.2-pre` |
| TD-2 | 3 v11 scripts undocumented (phrases.js, today.js, app_v11_today.js) | `documentation-drift` |
| TD-3 | Adaptive vs Debug formula divergence (~19×) — decision pending observation week | `decision-pending` |
| TD-4 | `getTodayQueue` not exposed on shadowEN | `api-polish` |

**Major pending (post-observation):**
1. Day 7: Fill `docs/V11_1_OBSERVATIONS.md` + decide v11.2-A (back-port) vs v11.2-B (Daily Loop polish)
2. Clear TD-1, TD-2 before v11.2 ships
3. v11.3+: Daily Loop polish → Creator Mode → Offline → Gamification → Memory Graph

---

## 🎤 FINAL NOTES

The user has been VERY patient through 11.1 iterations. They're now exhausted from re-explaining vision. Your job:
- **Listen carefully** to what they say
- **Don't over-engineer** — they want results, not perfection
- **Honest about scope** — if something is 5+ hours, say so upfront
- **Ship working code** — even if not all polished
- **Stabilize before build** — v11.1 changed the engineering philosophy. Verify → Observe → Then build.

**The product is alive.** Don't break it. Build on it.

Good luck. 🚀

---

*Last update: 2026-05-26 evening (post-v11.1 STABILIZE ship + deploy recovery). Maintain this file with each major handoff.*
