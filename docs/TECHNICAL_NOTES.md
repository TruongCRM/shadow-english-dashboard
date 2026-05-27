# 🛠 SHADOW ENGLISH — TECHNICAL NOTES & GOTCHAS

> Hard-won lessons across 14 versions (v1 → v11.1.14). Read this BEFORE making changes.

**Last update:** 2026-05-27 (Day 1 evening — G10-G14 added from polish marathon)

> Numbered issues (1–10) are original v1–v10 gotchas. **G6–G14** are new from v11.1.x STABILIZE + Day 1 polish sessions and are referenced by G-prefix throughout CHANGELOG, AI_HANDOFF, README. Both numbering systems live side by side — don't renumber, only append.

---

## 🚨 KNOWN ISSUES & WORKAROUNDS

### 1. Service Worker cache stale
**Problem:** After deploy, browser loads old version because SW caches scripts.
**Workaround:**
- Bump SW `CACHE` version in `sw.js`
- Add `?v=N` query param to script URLs (see G7)
- User hard-refresh (Ctrl+Shift+R) first time
- **Day 1 lesson:** SW may cache `index.html` itself → fresh `index.html` from server may have new script tags but page loaded from SW cache won't. **Manual SW unregister snippet:**
  ```js
  (async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
    const names = await caches.keys();
    await Promise.all(names.map(n => caches.delete(n)));
    location.reload();
  })()
  ```

### 2. GitHub Pages deploy delay
**Problem:** After commit, scripts at `https://truongcrm.github.io/...` serve old version for 30–90s.
**Workaround:** Wait 60-90s. Use `?v=N-bust`.
**Related:** G6 (build might have FAILED entirely)

### 3. HTML file truncation when writing large files
**Problem:** `Write` tool with 1500+ lines silently truncates.
**Workaround:** bash heredoc + `cat A B > C`. Always validate `wc -l file` + `tail -3 file`.

### 4. NAV_RENDERS scope issue
**Problem:** `const NAV_RENDERS = {...}` in app.js NOT on `window`.
**Workaround v8:** wrap `window.navigate()` instead. setInterval brute-force.
**Fix forever:** Always `const X = {}; window.X = X;`

### 5. Chart.js fails with `integrity` attribute in sandboxed contexts
**Problem:** Playwright sandbox blocks CDN.
**Workaround:** try/catch wrap, SVG fallback functions, check `typeof Chart !== 'undefined'`

### 6. GitHub form_input + click button race
**Problem:** `form_input(commit_msg)` + `left_click(commit_btn)` sometimes doesn't submit.
**Workaround:** Wait 6-10s, screenshot verify, retry with `find` fresh ref.

### 7. Notion sync requires Topic ID
**Workaround:** SETUP_NOTION_SYNC.md docs require `Topic ID` field.

### 8. Web Speech API voice availability varies
**Workaround:**
```js
const setVoices = () => { /* read voices */ };
setVoices();
speechSynthesis.onvoiceschanged = setVoices;
```

### 9. Service Worker doesn't auto-cache new files
**Workaround:** Fine — network-first handles it. Future offline-first PWA (v11+) needs to expand ASSETS list.

### 10. localStorage 5–10MB limit
**Workaround future:** Trim sessionsLog to last 1000 entries when length > 2000.

---

## 🆕 GOTCHAS FROM v11.1.x SESSION (G6–G9)

### G6 — Green commit ≠ deployed live
**Problem:** Commit visible at `github.com/<repo>/blob/main/<path>` does NOT mean file is served live. If `pages-build-deployment` fails (which it did 5× in v11.1.0 due to GitHub infra), Pages keeps serving LAST successful build. Symptom = "fix doesn't work" identical to broken code.

**Diagnostic protocol — STEP 0 before any browser debug:**
1. Open `github.com/<repo>/actions`
2. Confirm latest `pages-build-deployment` is ✅
3. If failed: click "Re-run failed jobs"

**Recovery:** Re-run worked — transient infra resolves itself.

### G7 — JS file update needs `?v=N` bump in index.html
**Problem:** Browser caches based on FULL URL including query. Updating file on server without changing script-tag query = invisible cache hit. Visible symptom IDENTICAL to broken code OR G6.

**Real example (v11.1.3):** nav_polish.js updated + deployed (build #26 ✅) but `<script src="nav_polish.js?v=11.1.1">` unchanged → browser cached → 20+ min wasted debug.

**Diagnostic:**
```js
fetch('/nav_polish.js?bust=' + Date.now(), {cache:'no-store'})
  .then(r => r.text())
  .then(t => console.log('Server has v11.1.3:', t.includes('w-v3')));
console.log('Browser has v11.1.3 fn:', typeof window.SHADOW_NAV_POLISH?.fixHeatmap === 'function');
```

**Fix workflow — every JS update = TWO-commit ship:**
1. Upload file
2. Edit `index.html` bump `?v=N` query
3. Both commits back-to-back

### G8 — Visual polish needs upfront spec
**Problem:** Iterating on live = expensive. Each iteration = 1 file commit + 1 cache-bust commit + 30-60s deploy + verify. 4 rounds = ~80 min vs ~5 min upfront spec.

**Real example (v11.1.3 → v11.1.6 heatmap):**
- v3: 32px cells, justify-start → "1 bên trống"
- v4: 48px cells, center → still off
- v5: rotated GitHub-style → "ko giãn đều"
- v6: stretch 1fr → finally accepted

**Fix:**
1. Ask user concrete questions BEFORE coding (dimensions, orientation, fill-mode)
2. Sketch ASCII + sign-off
3. THEN code

**Vietnamese visual glossary:**
| Phrase | English | CSS meaning |
|---|---|---|
| "thô" | rough/blocky | Cells too large from 1fr |
| "trống" | empty | Whitespace from justify:start |
| "ngang/dọc" | horizontal/vertical | grid-auto-flow |
| "giãn đều" | stretch evenly | Use 1fr |
| "không hợp lý" | not logical | Wrong rotation |
| "hoạt động thật" | really works | Real handler not just cursor:pointer |

### G9 — Idempotent CSS injection has stale-style trap
**Problem:** `if (document.getElementById('xxx-styles')) return;` works when CSS unchanged. Across script versions same tab session, new CSS doesn't apply because old `<style>` tag in DOM + guard skips re-injection.

**Real example (v11.1):** nav_polish.js v3→v4 CSS change. Tab loaded v3, refreshed to v4, injectCSS skipped because `nav-polish-styles` already exists → user still sees v3 CSS.

**Fix — version the ID:**
```js
function injectCSS() {
  var id = 'nav-polish-styles-v6';  // bump per CSS change
  if (document.getElementById(id)) return;
  document.querySelectorAll('style[id^="nav-polish-styles"]').forEach(s => s.remove());
  var s = document.createElement('style');
  s.id = id;
  s.textContent = CSS;
  document.head.appendChild(s);
}
```

---

## 🆕 GOTCHAS FROM DAY 1 POLISH MARATHON (G10–G14)

### G10 — Silent file upload commit drop
**Problem:** GitHub upload UI says "file uploaded" + commit message filled + click "Commit changes" + wait 8s + navigate away → file may NOT be in repo. No error shown. Commit empty.

**Real example (v11.1.12):** Upload `app_v11_1_12_polish_bundle.js` (13KB). Click Commit. Wait. Navigate to edit/index.html add script tag. Live test → `SHADOW_POLISH_1112 = NA`. Diagnostic `fetch('/file.js')` returns **404 HTML page** (not the JS file).

**Diagnostic:**
```js
// After upload commit, BEFORE next commit, verify file in repo:
fetch('/shadow-english-dashboard/{file}.js?bust=' + Date.now(), {cache:'no-store'})
  .then(r => ({status: r.status, length: r.headers.get('content-length')}))
  .then(r => console.log(r));
// status: 200 + length matches file size = OK
// status: 200 + length tiny + content starts with <!DOCTYPE = 404 HTML disguised = FAIL
```

**Workaround:** ALWAYS visit `github.com/<repo>` after upload commit. Verify file appears in file list. If not → re-upload. Don't trust commit confirmation alone.

**Why it happens:** Unknown — possibly race between drag-drop + commit click, or GitHub backend deduping somehow. Reproduces ~10-20% of uploads.

### G11 — Polish-on-architecture fails emotional brief
**Problem:** When user gives EMOTIONAL brief ("feel calm", "feel alive", "feel identity"), CSS patches on existing DOM cannot achieve it. Architecture forces paradigm: if DOM was designed for "stats panel", any styling lipstick will still feel "stats panel with ribbon".

**Real example (v11.1.13):** User brief: "HERO STATS phải feel Identity + Journey + Momentum". My response: add streak dots + XP bar via polish patch. User reaction: "vẫn feel analytics dashboard, vẫn không có sense of journey".

**Root cause analysis:**
- HERO STATS DOM = single-row stat slot
- Polish added streak dots IN THAT SLOT
- Brain reads "single row of widgets" = "stats"
- No 3-column layout, no identity column, no journey column
- = Polish failure not because CSS wrong, but because DOM paradigm wrong

**Fix pattern:**
- For "feature" briefs (add button, fix click, change number): PATCH OK
- For "feel" briefs (identity, journey, calm, alive): REWRITE not PATCH
- Use upfront blueprint with concrete HTML mockup (see V11_2_REDESIGN_BLUEPRINT.md methodology)

**Test to know which:** Can user point to a specific button/element and say "fix this"? → PATCH. Or do they say "feels wrong" / "doesn't have soul"? → REWRITE.

### G12 — Observation week scope creep
**Problem:** Once observation week begins (data collection), every "small fix" override = 1 deploy = N LOC change to engine periphery. Cumulative effect contaminates observation data — can't isolate "engine behavior" from "polish noise".

**Real example (Day 1 = 2026-05-27):**
- Day 1 of 7-day observation
- User requested 5 "small fixes" across 4 waves
- I shipped 6 versions (v11.1.9 → v11.1.14)
- ~700 LOC added across 6 files
- Day 7 analysis will see metrics affected by BOTH adaptive engine AND polish CSS — can't separate

**Track override count:**
```
Day 1: 5 overrides (v11.1.9, .10/.11 bundle, .12, .13, .14)
Day 2: 0 (target — STRICT observation)
Day 3-7: 0 (target — unless emergency bug)
```

**Fix pattern:**
- AT FIRST override request, flag conflict clearly
- AT SECOND override request, propose blueprint + Day 8 ship
- AT THIRD+ override request, REQUIRE explicit "I accept observation contamination" sign-off

**Anti-pattern (what I did Day 1):** Asked "Path A/B/C" each wave, user picked SHIP each time, I shipped without escalating. Should have escalated after Wave 2.

### G13 — Selector specificity in shared class names
**Problem:** Same className used across multiple DOM contexts. Naive selector matches all → unintended targets get styling/data.

**Real example (v11.1.10 heatmap):** Selector `.hm-cell` was used for:
- Main grid 28 cells (the actual heatmap data)
- Legend dots 5 cells (the "Less ●●●●● More" intensity reference)

v11.1.10 fillHeatmap() applied to ALL `.hm-cell` → colored legend dots instead of main grid → user saw "no colored cells".

**Fix patterns:**
1. **Parent-scope selectors:** `.heatmap > .hm-cell` (direct child of main heatmap, excludes legend nested elsewhere)
2. **Position-based filter:** `Array.from(cells).filter(c => c.parentElement.classList.contains('heatmap'))`
3. **Add new classname for new usage:** Always check if existing class is reused before applying global styling

**Lesson:** Search codebase for `.{className}` BEFORE writing CSS targeting it. If matches >1 context, scope.

### G14 — Regex substring match across card titles
**Problem:** Card-finding regex like `/TODAY GOAL/.test(c.textContent)` matches ANY card containing "TODAY GOAL" as substring — including parent cards that contain "TODAY GOAL" as a SUBSECTION text.

**Real example (v11.1.13 cleanTodayGoal):** TODAY FOCUS card content includes subsection "🚀 TODAY GOAL · Finish new topic · Complete reviews". Regex matched TODAY FOCUS first (alphabetical traversal), cleaned wrong card. Standalone TODAY GOAL card untouched.

**Fix patterns:**
1. **Card-title-exact match:**
   ```js
   var card = Array.from(document.querySelectorAll('.card')).find(card => {
     var title = (card.querySelector('.card-title')?.textContent || '').trim();
     return /^TODAY GOAL$/.test(title); // exact match on title only
   });
   ```
2. **Unique data-section-id:** Always use `data-section-id="today-goal"` not title text search
3. **Multiple criteria:** Combine title match AND specific child text (e.g. "Missions completed")

**Lesson:** Substring matching on `textContent` is FRAGILE. Use semantic markers (data attributes, exact title match).

---

## 🎯 NON-OBVIOUS DESIGN DECISIONS

### Why `display: contents` for view containers
- Children become direct grid items (`.content` is `display:grid`)
- Toggle visibility = swap `.active` class
- No layout flicker

### Why `setInterval(1500ms)` for audio button auto-attach
- MutationObserver missed some cases
- Reliable across all view renders
- Idempotent: skip rows with existing button

### Why localStorage key suffix `-v3` not `-v10`
- v3 = state engine launch
- Key represents SCHEMA version, not app version
- Bumping forces re-seed (data loss) — only do when schema breaks

### Why `applyReview()` keeps last 20 confidenceHistory entries
- Trend analysis needs ~5 recent
- 20 = ~3 months at 1 review/week
- Older = less relevant
- localStorage size bounded

### Why nav_polish.js does click-time lookups (v11.1.8)
- `state.topics` may not be loaded when nav_polish.js initial inject runs
- Resolving at BIND time = stale fallbacks attached
- Resolving at CLICK time = always current state

### Why 28-cell heatmap + rolling 28-day window (v11.1.13)
- HTML hardcoded `repeat(28, ...)` from v6 era
- Calendar-month grid (Mon before day 1) = 4 weeks, fails 5-week months
- Rolling window = today always cell 27, sessions visible from day 1
- Future fix Day 8+: change HTML to 35 cells (5 weeks) + use calendar month

### Why v11.1.x polish patches are PURE ADDITIVE (no edits to nav_polish.js)
- Easier to revert (`?v=N-removed`)
- No regression risk to v11.1.1-1.8 stabilize work
- Trade-off: harder to refactor — but discipline aligns with observation period

### Why v11.2 will REWRITE (not patch) 3 cards
- Polish patches FAILED emotional brief 2x (Wave 4 + Wave 5)
- Architecture cũ paradigm = "stats panel" — can't escape via lipstick
- v11.2 rewrites HERO/TODAY GOAL/MEMORY from scratch per blueprint

---

## 🧪 DEBUGGING COMMANDS (browser console)

```js
// === STATE ===
shadowEN.state
shadowEN.state.topics.slice(0,3)
shadowEN.state.sessionsLog.length
shadowEN.reset()

// === v10 INTELLIGENCE ===
v10.metrics()
v10.insights()
v10.riskAll().slice(0, 10)

// === FORCE STATE ===
shadowEN.completeReview('L1-01', 5)
shadowEN.awardXP(500, "test")

// === v11.1 DEBUG PANEL ===
SHADOW_DEBUG.enable()
SHADOW_DEBUG.rescueRanking(8)
SHADOW_DEBUG.forgetRiskBreakdown('L1-01')
SHADOW_DEBUG.memoryDistribution()
SHADOW_DEBUG.survivalPatterns()

// === v11.1.x NAV POLISH ===
SHADOW_NAV_POLISH._info()
SHADOW_NAV_POLISH.computeLevelPct(1)
SHADOW_NAV_POLISH.bind()

// === DAY 1 POLISH MODULES ===
SHADOW_LEVELMAP_FIX._info()       // v11.1.9
SHADOW_HEATMAP_FILL._info()       // v11.1.10
SHADOW_PROGRESS_LAYOUT._info()    // v11.1.11
SHADOW_POLISH_1112._info()        // v11.1.12
SHADOW_POLISH_1113._info()        // v11.1.13
SHADOW_DAY21._info()              // v11.1.14

// === LAYOUT ===
LAYOUT_CONFIG
layoutEngine.openSettings()

// === AUDIO ===
SHADOW_AUDIO.voices
SHADOW_AUDIO.speak("Hello", { rate: 0.75 })
SHADOW_AUDIO.startRecording()

// === CONTENT ===
SHADOW_CONTENT.TOPIC_CONTENT['L1-01']
SHADOW_CONTENT.getAllPhrases()

// === BLOCKS ===
SHADOW_BLOCKS.types
SHADOW_BLOCKS.renderAll([{type:'quote',text:'Hi'}], 'test')

// === CACHE NUKE (force fresh fetch + remove SW) ===
(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  const names = await caches.keys();
  await Promise.all(names.map(n => caches.delete(n)));
  console.log('Cleared', regs.length, 'SWs and', names.length, 'caches');
  location.reload();
})()

// === RENDER ===
render()
```

---

## 🚀 DEPLOY WORKFLOW

### Manual deploy (via Chrome MCP) — for any JS file update

```
1. Open https://github.com/TruongCRM/shadow-english-dashboard/upload/main
2. file_upload via choose-files ref
3. Fill commit message (use form_input on textbox ref)
4. Click "Commit changes" (use left_click on submit ref)
5. **G10 NEW (Day 1):** Navigate to repo root → verify file appears in file list before next step
6. **G7:** Open /edit/main/index.html, scroll to line ~2098, click END of last script line, Enter, type new <script src="..." defer></script>
7. Click "Commit changes..." (top right), fill modal, submit
8. **G6 CRITICAL:** Check github.com/<repo>/actions for latest pages-build-deployment = ✅
9. Wait 60-90s for GitHub Pages rebuild
10. Test via ?v=N-bust URL — verify `SHADOW_*._info()` returns expected
11. If still old: unregister SW + clear caches (snippet above)
12. Update docs/CHANGELOG.md with new version entry
```

**Critical step counts:**
- Skipping G10 verify = 10-15min debug if upload dropped
- Skipping G6 verify = 30+ min phantom debug
- Skipping G7 cache-bust = 20+ min "fix doesn't work" debug

---

## 📐 CODING CONVENTIONS

### File naming
- Core: `app.js`, `content.js`, `audio.js`, `blocks.js`, `adaptive.js`, `metrics.js`, `coach.js`
- Per-version patches: `app_v{N}_{name}.js` (e.g. `app_v8_experience.js`)
- v11.1.x polish patches: `app_v11_1_{N}_{name}.js`
- Observability: `debug_panel.js`, `nav_polish.js` — pure additive opt-in
- Config: `*.json`
- Docs: `UPPERCASE.md`

### Global exposure pattern
```js
// Bad:  const FOO = {...};       // module-scoped
// Good: window.SHADOW_FOO = {...};
//       const SHADOW_FOO = window.SHADOW_FOO;  // optional alias
```

### Error handling pattern
```js
try {
  // risky code
} catch (e) {
  console.warn('[Component] failed:', e);
  // graceful fallback
}
```

### State mutation pattern
```js
// Always: mutate → save → render
state.user.xp += 50;
saveState();
render();
```

### CSS class pattern
- BEM-lite: `.block`, `.block-youtube`, `.block-title`
- Prefix per feature: `.queue-tab`, `.session-step`
- Observability markers: `.nav-bound`, `.polish-1112-bound`, `.polish-1113-tg-clean`

### Idempotency markers
- `el.dataset.{name}Bound = '1'` — has element been processed?
- `window.fn.__{module}Patched = true` — has function been wrapped?

### CSS injection — Option A (versioned ID) per G9
```js
function injectCSS() {
  var id = '{module}-styles-v{N}';  // bump per CSS change
  if (document.getElementById(id)) return;
  document.querySelectorAll('style[id^="{module}-styles"]').forEach(s => s.remove());
  var s = document.createElement('style');
  s.id = id;
  s.textContent = CSS;
  document.head.appendChild(s);
}
```

### Selector specificity per G13
```js
// Bad:  document.querySelectorAll('.hm-cell')               // too broad
// Good: document.querySelectorAll('.heatmap > .hm-cell')   // scoped
// Best: document.querySelectorAll('[data-component="heatmap-main"] .cell')  // semantic
```

### Card finding per G14
```js
// Bad:  Array.from(cards).find(c => /TODAY GOAL/.test(c.textContent))  // substring matches subsection
// Good: Array.from(cards).find(c => /^TODAY GOAL$/.test(c.querySelector('.card-title')?.textContent.trim()))
// Best: document.querySelector('[data-section-id="today-goal"]')  // semantic
```

---

## 🔮 BROWSER COMPATIBILITY

| Feature | Supported | Notes |
|---|---|---|
| Web Speech API (TTS) | Chrome/Edge/Safari/Firefox | Voice availability varies |
| MediaRecorder | All modern | Needs getUserMedia permission |
| Service Worker | All modern | Requires HTTPS |
| localStorage | All | 5-10MB limit |
| CSS `display: contents` | All modern | Required for view system |
| CSS Grid `grid-auto-flow: column` | All modern | nav_polish v11.1.5+ heatmap |
| CSS `aspect-ratio` | Modern | YouTube embed 16:9 |
| `gap` in flexbox | All modern | Throughout |
| `:has()` selector | Chrome/Edge/Safari | NOT used (compat) |

**Target:** Chrome 100+, Safari 16+, Firefox 100+. No IE.

---

## ⚠️ DO NOT

- DON'T hardcode content — Notion or content.json
- DON'T mutate `state` directly without `saveState()` + `render()`
- DON'T break localStorage schema without bumping key version
- DON'T add new dependencies (zero-build)
- DON'T use `eval()` or `new Function()`
- DON'T commit secrets — only `NOTION_TOKEN`/`NOTION_TOPICS_DB` in GitHub Secrets
- DON'T fetch cross-origin except CDN libraries
- DON'T break `window` namespace — prefix `SHADOW_*` or `shadowEN`
- DON'T trust green commit means live — verify Actions tab (G6)
- DON'T ship JS file change without bumping `?v=N` — mandatory (G7)
- DON'T iterate visual polish without upfront spec — sign off first (G8)
- DON'T use idempotent CSS injection without versioned ID (G9)
- **DON'T trust upload commit silently** — verify file in repo (G10)
- **DON'T polish over architecture for emotional briefs** — REWRITE (G11)
- **DON'T ship multiple times/day in observation week** — escalate (G12)
- **DON'T use unscoped selectors on shared classNames** (G13)
- **DON'T use regex substring matching for card finding** (G14)
- DON'T skip CHANGELOG entry — every ship gets documented

---

*Last update: 2026-05-27 (Day 1 polish marathon — G10-G14 added).*
