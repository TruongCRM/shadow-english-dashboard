# 🤖 AI HANDOFF — Shadow English

> Read this file FIRST if you're an AI taking over this project. It contains everything needed to continue without losing context.

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

3 macro layers + 6 runtime micro layers. See `ARCHITECTURE.md` for diagrams.

```
CONTENT  → Notion CMS (user edits here) → content.json (via GitHub Action hourly sync)
LOGIC    → app.js + 5 v-modules (state engine, adaptive SR, metrics, coach, blocks)
UI       → layout.json + Settings panel (theme, sections, branding)
```

**Critical rule:** NEVER hardcode content in code. All English text goes through Notion or content.json.

---

## 📂 KEY FILES (read these in order)

1. `docs/CHANGELOG.md` — Full v1-v10 history with problems + lessons learned
2. `docs/ARCHITECTURE.md` — System diagrams + data flow + design decisions
3. `docs/STATE_SCHEMA.md` — All data structures (state, content, layout, Notion DB)
4. `docs/TECHNICAL_NOTES.md` — Known issues + workarounds + debugging tips
5. `docs/ROADMAP.md` — What's next (v11+)
6. `BLOCKS_GUIDE.md` — User docs for Custom Content Blocks
7. `SETUP_NOTION_SYNC.md` — User docs for Notion sync

Then read the code:
- `index.html` — UI shell
- `app.js` — state engine
- `content.js` + `content.json` — content layer
- `adaptive.js` + `metrics.js` + `coach.js` — v10 intelligence
- `blocks.js` — v9 content blocks
- `audio.js` — v8 audio system
- `app_v7_layout.js` — v7 UI config
- `app_v8/9/10_*.js` — version integration patches

---

## 🚫 HARD CONSTRAINTS

1. **No build step** — Zero-config, vanilla JS, static GitHub Pages
2. **No framework** — React/Vue/Svelte not allowed
3. **No backend** — until truly needed (defer to user request)
4. **No hardcoded content** — Notion CMS is the source of truth
5. **No new dependencies** — only Chart.js, Grid.js (already in use)
6. **localStorage only for state** — no server DB until v15+
7. **Mobile-first responsive** — touch targets ≥44px, breakpoint 900px

---

## 🎨 USER EXPECTATIONS

### What the user wants
- **Calm, premium, focused** UX — NOT flashy, NOT cluttered
- **Real data everywhere** — no fake numbers, no placeholders
- **Behavioral psychology** baked in (streaks, real progress, decay warning)
- **Adaptive** — system learns from his behavior, not rigid
- **Scalable** — 30 → 300 → 3000 topics without breaking
- **Mobile-first** — he's busy, often on phone

### What the user does NOT want
- "Website học tiếng Anh nhiều màu" (colorful English learning website)
- Admin dashboard feel
- Course platform feel
- Quiz/grading academic vibe
- Dopamine empty (achievements that don't matter)
- Hardcoded English content in JS
- Manual deploy steps for content edits

---

## 🛠 HOW TO MAKE CHANGES

### To add a new feature (e.g. v11 work):
1. Read user's request carefully — they often give 12-point briefs but expect prioritization
2. Identify HIGHEST impact items (usually first 2-3 in their list)
3. Defer the rest with clear rationale in your response
4. Build module per layer (don't mix concerns)
5. Add CSS at bottom of index.html (last `<style>` block)
6. Add script tag with `defer` after existing scripts
7. Test in browser console with debug commands
8. Deploy via Chrome MCP file upload
9. Verify on `?v=N-bust` URL
10. Update `docs/CHANGELOG.md` with date/goal/built/problems/fixes/lessons

### To deploy:
- Use `mcp__Claude_in_Chrome__file_upload` with `ref` from `find('choose your files')`
- Then scroll, fill commit message via `form_input`, click "Commit changes" button
- Wait 30-60s for GitHub Pages rebuild
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

---

## 🎁 USEFUL CONSOLE COMMANDS (paste into browser DevTools)

```js
// Full state inspection
shadowEN.state

// Get metrics
v10.metrics()

// AI Coach insights
v10.insights()

// Forget risk ranking
v10.riskAll().slice(0, 10)

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
```

---

## 🚨 GOTCHAS DON'T REPEAT

These cost hours during v1-v10. Don't redo:

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

---

## 🔮 USER'S NORTH STAR

What user said in v10 brief:
> "Tôi không muốn build 'English learning dashboard'. Tôi muốn build 'Operating System for English Fluency'."

What this means for your decisions:
- Optimize for **long-term retention** over short-term wins
- Optimize for **real-life speaking transformation** over flashy UI
- Optimize for **calm deep work** over engagement metrics
- Optimize for **system-level intelligence** over hardcoded features

---

## ✅ CHECKLIST WHEN STARTING

When you (next AI) start working on this project:

- [ ] Read this file (AI_HANDOFF.md)
- [ ] Read CHANGELOG.md (especially last 2-3 versions)
- [ ] Read ARCHITECTURE.md
- [ ] Read STATE_SCHEMA.md if changing data structures
- [ ] Read TECHNICAL_NOTES.md for gotchas
- [ ] Check ROADMAP.md for current priorities
- [ ] Read user's latest message carefully — they often expect prioritization
- [ ] Plan tasks via TaskCreate before coding
- [ ] Build per-layer (not mixed concerns)
- [ ] Test in browser console with debug commands
- [ ] Deploy + verify with `?v=N-bust`
- [ ] Update CHANGELOG.md with your version entry
- [ ] Report back to user with concrete deliverables (not just task list)

---

## 🌟 CURRENT STATE SUMMARY (as of v10)

- **Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
- **Latest version:** v10
- **6 active layers:** Content, Blocks, Adaptive, Metrics, Coach, UI
- **32 topics** seeded (5 rich content, 27 skeletal)
- **18 block types** available for rich content
- **5 themes** (dark-purple default, ocean-blue, forest-green, sunset-orange, midnight)
- **PWA installable** with offline cache (basic)
- **Notion sync** wired up but requires user to add NOTION_TOKEN secret to GitHub
- **Audio system** functional with 6+ browser TTS voices
- **AI Coach** generating 10+ rule-based insights

**Major pending:**
1. User to setup Notion sync (5-min steps in SETUP_NOTION_SYNC.md)
2. User to add Custom Blocks in Notion topic pages
3. v11 priorities: Creator Mode · Offline-first · Gamification 2.0

---

## 🎤 FINAL NOTES

The user has been VERY patient through 10 iterations. They're now exhausted from re-explaining vision. Your job:
- **Listen carefully** to what they say
- **Don't over-engineer** — they want results, not perfection
- **Honest about scope** — if something is 5+ hours, say so upfront
- **Ship working code** — even if not all polished

**The product is alive.** Don't break it. Build on it.

Good luck. 🚀

---

*Last update: 2026-05-26 (after v10 deploy). Maintain this file with each major handoff.*
