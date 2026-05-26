# 🩹 v11.1.x PATCH LOG — STABILIZE phase session (2026-05-26)

> A single-session ledger of 8 sub-version patches on top of v11.1.
> Read this if you're picking up after the STABILIZE-then-build pivot.

**Session:** 2026-05-26 (one evening)
**Phase active throughout:** STABILIZE (observation week Day 0)
**Branch:** main
**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/?v=11.1.8
**Final committed file:** `nav_polish.js` (~14KB) + 8 cache-bust bumps in `index.html`
**Total commits this session:** ~50 across documentation + code

---

## 0. TL;DR

This session was supposed to be "verify v11.1 panel + close the documentation loop." Instead it surfaced three real bugs the user noticed in a row, all of which qualified as STABILIZE-eligible (broken UI that lies about being functional ≠ new feature):

1. **Deploy was actually broken** — `pages-build-deployment` had failed 5× in a row at the start; the v11.1 panel that everyone thought was live was never deployed. Fixed by clicking "Re-run failed jobs" — root cause was GitHub infra (`actions/jekyll-build-pages` archive temporarily not available).
2. **Navigation affordance lying** — Level Map summary cards on home + Today Queue rows in Review Engine had `cursor:pointer` via CSS but no click handler. Fixed via `nav_polish.js` (pure-additive script).
3. **Review Heatmap layout broken** — `grid-template-columns: 30px repeat(28, 1fr)` from v6 era forced 29 cols × 2 rows (catastrophic). Fixed dynamically by computing weeks from cell count. Then iterated 4 visual versions until user accepted v6 (rotated GitHub-style, 1fr stretch).
4. **Level Map % was hardcoded 0%** + topic icons not clickable. Fixed by `fixLevelMap()` extension to `nav_polish.js` with click-time emoji-to-topic lookup.

**Engineering memory system** was built at end of session (the README + this file + template) to prevent context loss going forward.

---

## 1. ENTRY POINT FOR NEXT AI

If you're a future AI reading this, the project is currently in:

- **Observation week** (started Day 0 = 2026-05-26)
- All v11.1.x sub-patches are STABILIZE work, not new features
- **Do not start v11.2 work until Day 7** unless user explicitly overrides
- The 4 tech debt items (TD-1 through TD-6, see CHANGELOG) are open and tracked

**First thing to do:** read `docs/README.md`, then the v11.1.6 + v11.1.7 entries in `docs/CHANGELOG.md`.

---

## 2. PATCH-BY-PATCH LEDGER

Each sub-version below was its own deploy. Timestamps are approximate (single-session continuous work).

### v11.1.0 (pre-session baseline)

**State at start of session:**
- `debug_panel.js` shipped, indexed in `index.html` via `<script src="debug_panel.js?v=11.1" defer></script>`
- `docs/V11_1_DEBUG_PANEL.md` uploaded
- Panel NOT visible on live (user complaint)
- HANDOFF doc §4 said "diagnose cache/script-path/runtime/CSS"

**Diagnosis:**
- ❌ NOT a browser-side problem
- ✅ `pages-build-deployment` had failed 5 consecutive times at GitHub infra level (jekyll-build-pages action archive download failed)
- Live site was serving last successful build (build #17 = pre-v11.1)

**Fix:** Click "Re-run failed jobs" on build #22 → infra transient cleared → deploy succeeded (1m 1s)

**New gotcha:** **G6 — "Green commit ≠ deployed live"** — added to TECHNICAL_NOTES

**Sibling doc updates:**
- `CHANGELOG.md` — v11.1 entry added (deploy incident embedded)
- `ARCHITECTURE.md` — Observability Layer documented + Deploy flow caveat added
- `ROADMAP.md` — v11.2 plan + TD list
- `AI_HANDOFF.md` — current state + G6 gotcha
- `VERIFY_REPORT_v11_1.md` — created with 9/10 checklist passed

---

### v11.1.1 — Nav clickability fix (Level Map + Today Queue)

**Phase:** STABILIZE
**Trigger:** User brief: "Refine navigation experience để toàn bộ topic ecosystem hoạt động thật, không chỉ visual." User asked 7 items; we offered A (bug fixes only) / B (full v11.2-B) / C (investigate first). User picked A.

**What was actually broken:**
| Element | cursor | onclick | Click result |
|---------|--------|---------|--------------|
| Home `.level-card` × 3 | auto | none | nothing (dead card) |
| `#today-review-list .review-item` | pointer (CSS lies) | none | nothing |

**Working (no fix):**
- `.topic-card-real` on Level pages
- `today.js` v11.1 Today card rescue rows + pulse dots
- `window.openTopic` and `window.navigate` exist

**Fix shipped:** `nav_polish.js` (new file, ~150 LOC):
- Wraps `window.render` + `window.navigate` (idempotent via `__navPolishPatched`)
- 3s setInterval safety net (handles dynamically-rendered review items)
- `.level-card` × 3 → `navigate('level{N}')`
- `.review-item[data-topic]` → `openTopic(id)`
- `role="button"`, `tabindex=0`, `aria-label`, Enter/Space keyboard support
- Cursor + minimal hover lift CSS

**Deploy:**
- `c080a4a` — index.html script tag added (`<script src="nav_polish.js?v=11.1.1">`)
- `ade9ba2` — nav_polish.js uploaded
- Build #25 ✅ 1m 31s

**Verify:** 4/4 click tests passed (Level 1/2/3 cards + Review row with forced L1-01)

**Deferred (with user agreement):**
- Mini context-transition card (200–400ms fade preview) — feature, not bug
- Centralized routing helper refactor — architecture work
- Auto-focus current review stage — feature
- Highlight memory stage on open — feature
- Glow hover effect — polish, not bug

---

### v11.1.2 — Heatmap structural fix + cache-bust learning

**Phase:** STABILIZE
**Trigger:** User screenshot showing REVIEW HEATMAP layout broken — Mon-Sat crammed inline with cells, Sun on dropped row.

**Root cause:** `index.html` inline CSS had `.heatmap { grid-template-columns: 30px repeat(28, 1fr); }`. The `28` was total cells (7 days × 4 weeks), not number of week columns. Browser auto-flowed 35 children into 29 cols × 2 rows = catastrophic scramble.

**Fix shipped:** Extended `nav_polish.js` with `fixHeatmap()`:
- Reads `.hm-cell` count, computes `weeks = Math.ceil(cells / 7)` (handles 4 and 5-week months)
- Sets inline `grid-template-columns: 30px repeat({weeks}, 1fr)` via `setProperty(..., 'important')`
- Idempotent via `dataset.hmFixedWeeks = "{weeks}w-v3"`

**Deploy:**
- `6a8e5a8` — nav_polish.js with fixHeatmap
- `e63cce7` — index.html `?v=11.1.1 → 11.1.2` cache-bust
- Build #26 ✅ 1m 0s

**The cache-bust gotcha (G7):** Updated nav_polish.js deployed successfully but browser kept serving OLD version because the `<script src="nav_polish.js?v=11.1.1">` query string didn't change. Visible symptom = "fix doesn't work" identical to broken code. Diagnostic: `fetch('/file.js?bust='+Date.now()).then(r=>r.text())` returned new code, but `typeof window.MY_FN` showed old behavior → cache bust missing.

**New gotcha:** **G7 — "JS file update needs `?v=N` bump in index.html"** — added to TECHNICAL_NOTES

---

### v11.1.3 — Heatmap visual polish v1 (compact cells)

**Phase:** STABILIZE
**Trigger:** Heatmap now correctly 4×7 grid but cells huge (1fr stretch = ~100px each, looked "thô" = rough/blocky).

**Fix v3:** Cells → 32px fixed squares + `justify-content: start`. CSS override: `.heatmap-card { grid-column: 1 / -1 !important; }` to make card full-width.

**Outcome:** Cells compact but card had massive empty space on right (selector didn't actually match — heatmap is inside `.memory-card`, not standalone `.heatmap-card`).

**Deploy:** part of same nav_polish.js iteration (see CHANGELOG v11.1.2 entry)

---

### v11.1.4 — Heatmap polish v2 (cells 48px center)

**Phase:** STABILIZE
**Trigger:** User feedback "có 1 bên trống vậy?" — "why is one side empty?"

**Fix v4:** Cells 32→48px + `justify-content: center`. Centered the grid in the card.

**Outcome:** Looked OK but card stayed in its original 3-col-span position (the full-width override hadn't applied because `.heatmap-card` selector mismatched).

**Deploy:**
- `1d11c40` — nav_polish.js v4
- `3e3e39a` — index.html `?v=11.1.3 → 11.1.4`

---

### v11.1.5 — Heatmap rotated (GitHub-style)

**Phase:** STABILIZE
**Trigger:** User feedback "thử là hàng ngang, ô là hàng dọc thì nó hợp lý hơn" — days horizontal, weeks vertical.

**Fix v5:** Rotated to GitHub contribution graph layout:
- `grid-template-columns: repeat(7, 38px)` — 7 day columns
- `grid-template-rows: 22px repeat({weeks}, 38px)` — label header + N week rows
- `grid-auto-flow: column` — children flow column-first so labels land in row 1

**Outcome:** Layout was right but cells stuck on left of card, leaving empty space on right.

**Deploy:**
- `3774fc4` — nav_polish.js v5
- `bdddb24` — index.html `?v=11.1.4 → 11.1.5`

---

### v11.1.6 — Heatmap stretch (final accepted layout)

**Phase:** STABILIZE (final accepted heatmap state)
**Trigger:** User feedback "sao ko giãn đều cho full luôn" — why not stretch to fill.

**Fix v6:** `repeat(7, 1fr)` for columns (not fixed 38px). Cells stretch evenly to fill card width. Row height stayed 56px (close to square at typical card widths).

**Outcome:** ✅ User accepted. Final state: full-width, GitHub-style horizontal-first.

**Deploy:**
- (v11.1.6 nav_polish + cache-bust pair — see CHANGELOG)

**Lesson — G8:** **Visual polish needs upfront spec.** 4 iterations (v3 → v4 → v5 → v6) each driven by user feedback after seeing the result. Could have been ONE iteration if dimensions/orientation/fill-mode were spec'd before code. Going forward: write spec in plain text, get user sign-off, THEN code.

---

### v11.1.7 — Level Map: real % + clickable icons + working "More..."

**Phase:** STABILIZE
**Trigger:** User brief — 3 items:
1. "% hoàn thành topics là thật theo thực tế" (not hardcoded 0%)
2. "Click vào biểu tượng → đúng bài học" (each topic icon → topic detail)
3. "Nút More ở đó hoạt động xem chủ đề luôn" (More... → level page)

**What was broken:**
- `.level-pct` showed "0%" (hardcoded or broken compute)
- `.topic-icon` × 24 (3 levels × 8 icons each) had `cursor:pointer` but no onclick — dead
- "More..." icon dead

**Fix shipped:** Extended `nav_polish.js` with `fixLevelMap()`:
- For each `.level-card` (3 cards):
  - Compute real % = average `masteryPct` across topics where `level === idx+1`. Update `.level-pct` text + `.progress-fill` width.
  - For each `.topic-icon` inside `.topics-row`:
    - Detect if "More..." → click handler navigates to `level{N}` page
    - Otherwise extract emoji from `.bubble` text, lookup state.topics by emoji+level, click → `openTopic(id)`
- `role="button"`, `tabindex=0`, keyboard support, aria-labels

**Deploy:**
- `695d817` — nav_polish.js with fixLevelMap
- (cache-bust pair — see CHANGELOG)
- Build #34 ✅

**Test results:**
| Test | Expected | Actual | Pass |
|------|----------|--------|------|
| Click MORE (L2) | view-level2 | view-level2 | ✅ |
| LEVEL 1 % shown as 4% (real avg) | 4% | 4% | ✅ |
| Click Restaurant (🍔, L1) | view-topic-detail (L1-01) | view-level1 (fallback) | ❌ |
| Click Friendship (🤝, L2) | view-topic-detail | view-level2 (fallback) | ❌ |

**Bug uncovered (v11.1.8 fix below):** Topic-specific clicks fell back to level page navigation. Root cause: `fixLevelMap()` runs at script-load time, but `state.topics` may not be fully loaded yet → `findTopicByEmoji()` returned null → fallback handler attached → idempotency check prevented re-bind even after state loaded.

---

### v11.1.8 — Click-time emoji lookup (state-race-safe)

**Phase:** STABILIZE
**Trigger:** v11.1.7 test results — topic icons fell back to level page instead of opening specific topic.

**Fix shipped:** In `fixLevelMap()`, instead of resolving topic at BIND time, look up at CLICK time:

```js
var handler = function() {
  if (isMore) return goToLevel('level' + level);
  var match = findTopicByEmoji(emoji, level);  // lookup AT click, not at bind
  if (match) return goToTopic(match.id);
  return goToLevel('level' + level);
};
```

Now when user clicks Restaurant, function looks up `🍔` against current `state.topics` (which is fully loaded by user-action time) → finds L1-01 → opens.

**Deploy:**
- nav_polish.js v8 uploaded
- index.html `?v=11.1.7 → 11.1.8` cache-bust
- Pause point: at end of session, deploy was completing. Verify in next session that:
  - `script_src === "nav_polish.js?v=11.1.8"`
  - `SHADOW_NAV_POLISH._info().level_pcts[0].pct === 4` (or higher)
  - Click Restaurant → view-topic-detail (not view-level1)

---

## 3. ARCHITECTURE IMPACT (cumulative across v11.1.x)

### New file
- `nav_polish.js` (~14KB, ~350 LOC at v11.1.8)
  - **Pattern:** identical to `debug_panel.js` — pure additive observability/stabilize patch
  - **Hooks:** wraps `window.render` + `window.navigate` (idempotent via `__navPolishPatched` flag, won't collide with `__v11Patched` used by `app_v11_today.js`)
  - **Fallback:** 3s setInterval re-bind for dynamic content
  - **Exports:** `window.SHADOW_NAV_POLISH` with `bind()`, `bindLevelCards()`, `bindReviewItems()`, `fixHeatmap()`, `fixLevelMap()`, `computeLevelPct()`, `_info()`

### File modifications
- `index.html` — 1 `<script>` tag added + 7 cache-bust query bumps (`?v=11.1.1` → `11.1.2` → `11.1.3` → `11.1.4` → `11.1.5` → `11.1.6` → `11.1.7` → `11.1.8`)

### Layer model
- **No new layer** in the formal 6+1 model (CONTENT / BLOCKS / ADAPTIVE / METRICS / COACH / UI / OBSERVABILITY)
- `nav_polish.js` lives in the same "Observability Layer" slot as `debug_panel.js` — opt-in, pure-additive, can be removed without breaking anything else

### State schema
- **No changes** — pure read-only access to `window.shadowEN.state`
- localStorage keys unchanged

---

## 4. WHAT THIS SESSION TOLD US ABOUT THE SYSTEM

### G6 — Deploy pipeline must be verified
A green commit visible at `github.com/<repo>/blob/main/<path>` does NOT mean the file is being served by the live URL. If `pages-build-deployment` workflow fails (which it did 5× in a row at the start of this session), GitHub Pages keeps serving the LAST successful build. Symptom is identical to "fix doesn't work."

**Fix:** Add to every diagnostic protocol: "Step 0 — check `github.com/<repo>/actions` is latest run = ✅ before debugging client-side."

### G7 — JS file updates require `?v=N` bump
Browser caches based on FULL URL including query string. Updating the file on the server without changing the script-tag's query = invisible cache hit, old code keeps running.

**Fix:** Make `?v=N` bump part of "ship a JS update" checklist.

### G8 — Visual polish needs upfront spec
4 rounds of heatmap iteration (v3 → v6) each shipped before the next user feedback could be incorporated. Each round = ~10 min × 2 commits (file + cache-bust) = ~20 min wasted vs upfront spec.

**Fix:** For UI-bound work, ask user: "What dimensions / orientation / fill-mode do you want?" BEFORE coding. Iterate on a written spec, not a live website.

### G9 — Idempotent CSS injection has stale-style trap
`if (document.getElementById('nav-polish-styles')) return;` is fine when CSS never changes. Across script versions in the same tab session, new CSS rules don't apply.

**Fix:** Include version in style ID (e.g. `nav-polish-styles-v6`) OR always remove + re-inject. Worth refactoring before v11.2.

### Lessons about USER FEEDBACK INTERPRETATION

Vietnamese visual feedback maps to specific CSS properties:

| User phrase | English | What it means in CSS |
|-------------|---------|----------------------|
| "thô" | rough/blocky | Cells too large from `1fr` stretch |
| "trống" | empty | Whitespace from `justify:start` with smaller cells than container |
| "không hợp lý" | not logical | Wrong orientation (days as rows when weeks should be) |
| "giãn đều cho full" | stretch evenly to full | Use `1fr` fr-units, not fixed px |
| "ngang/dọc" | horizontal/vertical | Orientation — affects `grid-auto-flow` |
| "hoạt động thật" | really works | Actual click handler, not just `cursor:pointer` |

This glossary should live in `docs/USER_LANGUAGE_GLOSSARY.md` someday.

---

## 5. STATE OF NAV_POLISH.JS AT END OF SESSION

### Public API (v11.1.8 final state)

```js
window.SHADOW_NAV_POLISH = {
  // Manual triggers
  bind: bindAll,                    // run all binders
  bindLevelCards: bindLevelCards,   // just level summary cards on home
  bindReviewItems: bindReviewItems, // just Today Queue rows
  fixHeatmap: fixHeatmap,           // compute + set heatmap grid CSS
  fixLevelMap: fixLevelMap,         // % update + topic icon binding
  computeLevelPct: computeLevelPct, // pure compute (avg mastery per level)

  // Inspection
  _info: function() { return {
    level_cards_total, level_cards_bound,
    review_items_total, review_items_bound,
    heatmap_present, heatmap_weeks_fixed,    // "4w-v6" etc.
    topic_icons_total, topic_icons_bound,
    level_pcts                                // [{level:1, pct:4}, ...]
  }}
};
```

### Idempotency flags
- `window.render.__navPolishPatched` — render wrap (no collision with `app_v11_today.js` __v11Patched)
- `window.navigate.__navPolishPatched` — navigate wrap
- `el.dataset.navBound = '1'` — per-element on Level cards + Review items
- `el.dataset.lvlMapBound = '1'` — per-element on topic icons
- `el.dataset.hmFixedWeeks = '4w-v6'` — per-element on heatmap, encodes version

### CSS injected (single `<style id="nav-polish-styles">`)
- `.level-card.nav-bound` hover effects
- `.review-item.nav-bound` hover effects
- `.heatmap.nav-polished` grid layout (rotated)
- Mobile media queries

⚠️ **G9 stale-style trap risk:** This `<style>` tag is idempotent on ID — across script versions in the same tab session, new CSS rules don't apply. Force fresh reload to pick up new CSS.

---

## 6. CHECKLIST FOR NEXT AI

When you arrive after this session:

- [ ] Verify v11.1.8 deploy completed by visiting `?v=11.1.8` and running `SHADOW_NAV_POLISH._info()`
- [ ] Check `script_src` === `"nav_polish.js?v=11.1.8"` (not 11.1.7)
- [ ] Click Restaurant icon (Level 1) → should open view-topic-detail with topic L1-01
- [ ] Click MORE (any level) → should navigate to view-level{N}
- [ ] Level 1 % should show real value (≥ 4%, not 0%)
- [ ] If any of above fail: SW cache may still serve old. Unregister + clear caches + hard reload.
- [ ] Read `docs/CHANGELOG.md` top entry to see latest state
- [ ] Read `docs/ROADMAP.md` for what's deferred
- [ ] Do NOT start v11.2 work until observation week ends (Day 7 from 2026-05-26)

---

## 7. OPEN QUESTIONS FOR DAY 7 DECISION

Per `docs/V11_1_DEBUG_PANEL.md` §"Observation week":

1. Are Fragile topics actually being rescued first?
2. Is `age` weighted too high vs `memory`? (19× formula divergence between Adaptive and Debug formulas)
3. Are survival phrases real (cross-topic) or noise?
4. Does QUEUED rank align with non-QUEUED rank?
5. After 5 reviews completed — does memory distribution shift visibly?

Answer these in `docs/V11_1_OBSERVATIONS.md` (to be created Day 7) before scoping v11.2.

---

## 8. WHY THIS DOC EXISTS

The user requested an "engineering memory system" at the end of this session, motivated by realizing how much context was almost lost across the v11.1.1 → v11.1.8 iteration. Without this log:

- Future AI wouldn't know G6/G7/G8/G9 surfaced this session
- Future AI wouldn't know `nav_polish.js` is the second observability-layer file
- Future AI wouldn't know v11.2 is GATED on observation week ending
- Future AI wouldn't know the deferred items (mini context transition, centralized helper, etc.) were the user's choice not random skips

The CHANGELOG entry for v11.1.x is concise. This file is the FULL session story. Use whichever is appropriate for your task.

---

*Session ended at the v11.1.8 deploy verification step. User paused before testing whether the click-time emoji lookup actually works on live. Resume there.*
