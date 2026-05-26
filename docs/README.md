# 📚 Shadow English — Engineering Memory System

> **For any AI taking over this project (and the human owner).**
> This folder is the *single source of truth* for what was built, why, how it broke, how it was fixed, and where it's going.
> Read this README FIRST. Then read the docs in the order it tells you to.

**Owner:** Dương Trường (TruongCRM on GitHub, non-technical solopreneur)
**Repo:** https://github.com/TruongCRM/shadow-english-dashboard
**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/
**Stack:** Vanilla JS, no framework, no build step, static GitHub Pages, Notion as CMS
**State engine:** localStorage (`shadow-en-state-v3`)
**Current version line:** v11.1.x (STABILIZE phase)

---

## 0. WHAT THIS DOC SYSTEM IS

Shadow English is built and maintained mostly by AIs. Every code session is partial — the AI loses memory at the end. This folder solves that problem by being the **engineering brain** that all AIs read and write to.

It is structured so that a new AI can:
1. Open this `README.md` first → understand the map
2. Read 5 core docs in order → get full context in ~30 minutes
3. Make changes → record them using the template
4. Ship → leave behind a complete trail

Every doc in here is a load-bearing piece of memory. **Do not delete. Update by appending or marking superseded.**

---

## 1. WHAT TO READ AND IN WHAT ORDER

If you have 30 minutes: read these in order.

| # | File | Why |
|---|------|-----|
| 1 | `AI_HANDOFF.md` | Who the user is + what they want + non-negotiables |
| 2 | `CHANGELOG.md` | Full v1 → v11 history with goal/built/problems/fixes/lessons per version |
| 3 | `ARCHITECTURE.md` | 6+1 layers, data flow, design decisions |
| 4 | `STATE_SCHEMA.md` | All data structures (state, content, layout, Notion DB) |
| 5 | `TECHNICAL_NOTES.md` | All known gotchas G1–G9, debug commands, deploy workflow, "do not" list |
| 6 | `ROADMAP.md` | What's next, what's deferred, what's out of scope |

If you have 5 minutes: skim §11 ("Current State Summary") in `AI_HANDOFF.md`, then the most recent entry in `CHANGELOG.md`.

If you're about to ship a change: read §3 ("How to add a version entry") below.

---

## 2. THE FILES IN THIS FOLDER

```
docs/
├── README.md                       ← YOU ARE HERE — entry point
├── TEMPLATE_VERSION_ENTRY.md       ← strict template for every new CHANGELOG entry
├── CHANGELOG.md                    ← versioned history v1 → v11.x
├── ARCHITECTURE.md                 ← layer diagrams + data flow + design rationale
├── STATE_SCHEMA.md                 ← data structures (state/content/layout/notion)
├── TECHNICAL_NOTES.md              ← gotchas G1–G9 + debug commands + deploy workflow
├── ROADMAP.md                      ← v11.2+ priorities + tech debt + backlog
├── AI_HANDOFF.md                   ← who the user is + how to communicate + state summary
│
├── V11_1_DEBUG_PANEL.md            ← deep dive on v11.1 Internal Insight Panel feature
├── V11_1_PATCHES.md                ← session log for v11.1.0 → v11.1.8 (stabilize patches)
├── VERIFY_REPORT_v11_1.md          ← post-deploy verification record for v11.1
└── (future) V11_2_*.md             ← per-feature deep dives for v11.2+ work
```

**Rule of thumb:**
- High-level history → `CHANGELOG.md`
- Per-feature deep dive → `V{N}_{NAME}.md` (e.g. `V11_1_DEBUG_PANEL.md`)
- Per-session patch log when many tiny fixes happen → `V{N}_PATCHES.md`
- Verification record after a big ship → `VERIFY_REPORT_v{N}.md`

---

## 3. HOW TO ADD A VERSION ENTRY (the workflow)

When you ship anything that touches code, follow this procedure. **No exceptions.**

### Step 1 — Decide the version label

| Scope | Label | Example |
|-------|-------|---------|
| New layer / major feature | `vN.0` | v10 added Adaptive + Metrics + Coach |
| Same layer, additive | `vN.M` | v11.1 added Observability layer |
| Bug fix, polish, single component | `vN.M.K` | v11.1.6 fixed heatmap stretch |
| Pure docs/refactor, no behavior change | `vN.M.K-doc` | v11.1.x-doc would be a doc-only update |

### Step 2 — Open `TEMPLATE_VERSION_ENTRY.md`

Copy the entire template. Paste it at the TOP of `CHANGELOG.md` (above the previous `## v...` heading). Fill in every section. Empty sections must say "—" not be deleted.

### Step 3 — Mandatory fields

Every entry MUST have:

- **Version** (`v11.1.6`)
- **Date** (`2026-05-26` ISO format)
- **Phase tag** (`STABILIZE` / `BUILD` / `OBSERVE` / `REFACTOR`)
- **Goal** (1–3 sentences — what was this update trying to do?)
- **Built** (bullet list — what files/features changed?)
- **Problems** (what broke, what surprised you, what bit you?)
- **Fixes** (how each problem was resolved)
- **Architecture change** (what layer was added/altered? what got more or less coupled?)
- **Completed features** (checklist of what's done in this version)
- **Pending → next version** (what was deferred and why)
- **Lessons learned** (numbered or bulleted insights for future AIs)
- **Touched files** (table of file + change type)
- **Deploy commits** (commit hashes for traceability)

Optional but recommended:

- **Test results** (what was verified, where evidence lives)
- **Screenshot references** (file path / commit + description)
- **State/data structure changes** (link to STATE_SCHEMA section that changed)
- **Tech debt opened/closed** (TD-N items)

### Step 4 — Update sibling docs

After CHANGELOG entry, check whether these docs need updating:

- **ARCHITECTURE.md** — only if you added/removed/renamed a layer, or changed data flow
- **STATE_SCHEMA.md** — only if state shape changed
- **ROADMAP.md** — almost always (move items from pending to done; add new pending)
- **TECHNICAL_NOTES.md** — if a new gotcha (G-N) surfaced, append it
- **AI_HANDOFF.md** — update §11 "Current State Summary" + add new gotchas if any
- **V{N}_{NAME}.md** — if the change introduced a complex feature warranting its own deep dive

### Step 5 — Commit doc + code together when possible

Ideally one commit covers both code change + CHANGELOG update. When not possible (e.g. ship first, document after), the doc commit must reference the code commit hash.

---

## 4. THE TEMPLATE — quick view

See `TEMPLATE_VERSION_ENTRY.md` for the full version. Skeleton:

```markdown
## v{N.M.K} — {SHORT TITLE} ({YYYY-MM-DD})

> Phase: {STABILIZE | BUILD | OBSERVE | REFACTOR}

### Goal
{1–3 sentences}

### Built
- {file/feature} — {what it does}

### Problems
- {symptom} → {root cause}

### Fixes
- {fix} → {validation}

### Architecture change
{What layer added/altered, or "None"}

### Completed features
- [x] {item}
- [x] {item}

### Pending → v{NEXT}
| # | Item | Why deferred |
|---|------|--------------|
| 1 | {item} | {reason} |

### Lessons learned
1. {insight}
2. {insight}

### Touched files
| File | Change |
|------|--------|
| `path/file.js` | {created / edited / deleted} |

### Deploy commits
- `abc1234` — {short description}

### Test results
{what was verified, by what method, with what outcome}

### Tech debt
- TD-N opened: {description}
- TD-M closed: {how}

### Screenshots / flow diagrams
{path or description}
```

---

## 5. THE NON-NEGOTIABLES (do not break)

Read these in `TECHNICAL_NOTES.md` "⚠️ DO NOT" section. Short list here for emphasis:

1. **No build step** — vanilla JS, static GitHub Pages
2. **No framework** — React/Vue/Svelte are forbidden
3. **No backend** — localStorage only until v15+
4. **No hardcoded English content** — must go through Notion or content.json
5. **No new dependencies** — only Chart.js, Grid.js (already in use)
6. **Mobile-first** — touch targets ≥44px, breakpoint 900px
7. **State schema immutability** — bump key version (`shadow-en-state-vN`) before changing shape
8. **Verify deploy** — green commit ≠ deployed live; always check Actions tab (G6)
9. **Bump `?v=N`** when updating any JS file — cache-bust query is mandatory (G7)
10. **One commit per logical change** — code + CHANGELOG together when feasible

---

## 6. KEY GOTCHAS YOU WILL HIT (preview — full in TECHNICAL_NOTES.md)

A new AI will hit at least 3 of these in the first hour. Save yourself the pain.

| # | Gotcha | Quick fix |
|---|--------|-----------|
| G1 | Service Worker caches old JS | Unregister SW + clear caches + hard reload |
| G2 | GitHub Pages 30–90s deploy delay | Wait + use `?v=N-bust` query |
| G3 | `Write` tool truncates files >50KB | Use bash heredoc or split into smaller writes |
| G4 | `const X = {}` is NOT on window | Always do `window.X = X` |
| G5 | Form input + click button race on GitHub upload | Wait 6–10s + verify with screenshot |
| **G6** | **Green commit ≠ deployed live** | Always check `github.com/<repo>/actions` for ✅ |
| **G7** | **JS file update needs `?v=N` bump** | Update file AND bump query string |
| **G8** | **Visual polish needs upfront spec** | Get user sign-off on dimensions BEFORE coding |
| **G9** | **Idempotent CSS injection has stale-style trap** | Include version in style ID OR remove+reinject |

---

## 7. THE USER (Dương Trường) — short profile

- Vietnamese solopreneur / coach
- Non-technical — does not write code, prefers to delegate
- Visionary, system-thinker, expects AI to translate spec into shipped product
- Communicates mostly in Vietnamese (Tiếng Việt)
- Hates: generic advice, theoretical talk, unnecessary complexity, "dopamine empty" features
- Loves: real systems, measurable outcomes, scalable products, calm/premium UX

**The North Star (his words, v10):**
> "Tôi không muốn build 'English learning dashboard'. Tôi muốn build 'Operating System for English Fluency'."

**The Discipline (his words, v11.1):**
> "Trước khi build feature mới, hãy hoàn thành và stabilize đúng engineering flow."

Translation: **stabilize before build, document before ship, verify before declare.**

---

## 8. ENGINEERING MEMORY OUTSIDE THIS FOLDER

A few resources live outside `docs/` but matter for context:

| Resource | Where | What's there |
|----------|-------|--------------|
| Live build logs | `github.com/TruongCRM/shadow-english-dashboard/actions` | `pages-build-deployment` runs — green = deployed live |
| Notion CMS | https://www.notion.so/H-C-NGO-I-NG-36b2ba8076cf80359caaed8a0adc7439 | All English content (topics, phrases, dialogues, blocks) |
| Commit history | `github.com/TruongCRM/shadow-english-dashboard/commits/main` | One commit = one logical change (mostly) |
| Service Worker source | `/sw.js` | Cache strategy, version bumps |
| Internal Insight panel | Live URL + `?debug=1` | Live observability — see `V11_1_DEBUG_PANEL.md` |

---

## 9. WHEN STUCK — order of escalation

1. **Read** the relevant doc in this folder. Most answers are here.
2. **Check** `github.com/<repo>/actions` — is the last build green? G6.
3. **Inspect** browser console — what's `SHADOW_DEBUG.*` saying? Run debug commands from TECHNICAL_NOTES §"Debugging commands".
4. **Diff** `git log` to see recent commits. Recent commits = recent culprits.
5. **Ask** the user — but ONE concrete question, not vague. Show what you tried, give 2–3 options.

---

## 10. WHAT THIS SYSTEM IS NOT

- **Not a tutorial** — read CHANGELOG to learn what was built; this is reference, not teaching
- **Not a spec** — specs go in `V{N}_{NAME}.md` per-feature; CHANGELOG records what was actually built
- **Not optional** — every shipped change MUST get an entry; otherwise the memory degrades

---

*Last updated: 2026-05-26 (post-v11.1.x patches). Maintained by AI per the workflow in §3.*
