# 🛠 SHADOW ENGLISH — TECHNICAL NOTES & GOTCHAS

> Hard-won lessons across 11 versions. Read this BEFORE making changes to avoid re-discovering the same problems.
>
> Numbered issues (1–10) are the original v1–v10 gotchas. **G6–G9** are new from the v11.1.x STABILIZE session and are referenced by that G-prefix throughout CHANGELOG, AI_HANDOFF, README. Both numbering systems live side by side — don't renumber, only append.

---

## 🚨 KNOWN ISSUES & WORKAROUNDS

### 1. Service Worker cache stale
**Problem:** After deploy, browser still loads old version because SW caches scripts.
**Workaround:**
- Bump SW `CACHE` version in `sw.js` (e.g. `shadow-en-v3` → `shadow-en-v4`)
- Add `?v=N` query param to script URLs in HTML (see also G7 below — this rule became formalized in v11.1.2)
- User must hard-refresh (Ctrl+Shift+R) first time
**Fix forever:** Use cache-busting with file hash (requires build step — defer to v11+)

### 2. GitHub Pages deploy delay
**Problem:** After commit, scripts at `https://truongcrm.github.io/...` still serve old version for 30–90 seconds.
**Workaround:**
- Wait 60 seconds after commit before testing
- Use `?v=N-bust` query string to force fresh fetch
**No proper fix** — it's just GitHub's CDN propagation.
**Related:** G6 (green commit ≠ deployed live — the build might have FAILED entirely, not just be propagating)

### 3. HTML file truncation when writing large files
**Problem:** `Write` tool with 1500+ line content sometimes saves only first ~960 lines, silently truncates rest. Discovered when `<script>` tag had no closing `</script>`.
**Workaround:**
- For files >50KB or >1000 lines, use `bash heredoc` (`cat << 'EOF' > file`) or `cat A B > C` concatenation
- Always validate with `wc -l file` and `tail -3 file` after write
- For modifications to large files, use `python3` script with `read → modify → write` in single bash call
**Fix forever:** Use Edit tool for targeted changes, not Write for full rewrites of huge files

### 4. NAV_RENDERS scope issue
**Problem:** `const NAV_RENDERS = {...}` declared in app.js — NOT on `window`. From other script files, `typeof NAV_RENDERS === 'undefined'`.
**Workaround in v8:**
- Wrap `window.navigate()` instead (it IS window-scoped via `window.navigate = ...`)
- Use `setInterval` brute-force enhancement as fallback (works 100%)
**Fix forever:** Always do `const X = {}; window.X = X;` when declaring shared state

### 5. Chart.js fails with `integrity` attribute in sandboxed contexts
**Problem:** Playwright sandbox blocks CDN-loaded Chart.js due to SRI mismatch on empty response. Inline scripts using `Chart` then throw, breaking all subsequent inline script execution.
**Workaround:**
- Always wrap `new Chart(...)` in `try/catch`
- Provide SVG fallback functions (`svgSpark`, `svgDonut`, `svgLineChart`)
- Check `typeof Chart !== 'undefined'` before calling
**Lesson:** External CDN scripts should be optional, not required

### 6. GitHub form_input + click button race
**Problem:** Sometimes `form_input(commit_msg)` + `left_click(commit_btn)` doesn't actually submit — page silently stays on upload page.
**Workaround:**
- After click, wait 6–10s
- Take screenshot to verify navigation
- If still on upload page, retry with `left_click(ref_173)` using the find result
- Use `find` to get fresh ref instead of stale pixel coords

### 7. Notion sync requires Topic ID
**Problem:** If user creates Notion page without `Topic ID` field, sync uses page UUID prefix → won't match localStorage state.
**Workaround:** SETUP_NOTION_SYNC.md docs require `Topic ID` field — make sure user reads it

### 8. Web Speech API voice availability varies
**Problem:** Some browsers/OS combinations have 0 English voices initially. `getVoices()` returns empty array until `voiceschanged` event fires.
**Workaround:**
```js
const setVoices = () => { /* read voices */ };
setVoices();
speechSynthesis.onvoiceschanged = setVoices;
```

### 9. Service Worker doesn't auto-cache new files
**Problem:** Pre-cache only includes files in `ASSETS` array in sw.js. New scripts (audio.js, blocks.js, adaptive.js, etc.) load on demand.
**Workaround:** Fine — network-first strategy handles it. But offline-first PWA (v11) needs to expand ASSETS list.

### 10. localStorage 5–10MB limit
**Problem:** If sessionsLog grows unboundedly (100s of sessions/day theoretical), could hit quota.
**Workaround (future):** Trim sessionsLog to last 1000 entries when length > 2000.

---

## 🆕 NEW GOTCHAS FROM v11.1.x SESSION (G6–G9)

### G6 — Green commit ≠ deployed live
**Problem:** A commit visible at `github.com/<repo>/blob/main/<path>` does NOT mean the file is being served by the live URL. If `pages-build-deployment` workflow fails (which it did 5× in a row at the start of v11.1 ship), GitHub Pages keeps serving the LAST successful build. Symptom = "fix doesn't work" — identical to broken code.

**Real example (v11.1):** debug_panel.js committed + index.html script tag added. Both visible in repo. Live site showed dashboard but no panel. Reason: GitHub's `actions/jekyll-build-pages` archive download failed for 5 builds (their own CDN issue). Live kept serving build #17 (pre-v11.1).

**Diagnostic protocol — add this as STEP 0 before any browser-level debugging:**
1. Open `github.com/<repo>/actions`
2. Confirm latest `pages-build-deployment` is ✅ green, not ❌ red or ⚠️ skipped
3. If failed: click into the run → look for `Failed to download archive` or similar infra errors → click "Re-run failed jobs"

**Recovery:** "Re-run failed jobs" worked — transient infra issues resolve themselves.

**Long-term mitigation:** Monitor + consider a custom workflow that doesn't depend on `actions/jekyll-build-pages` (escape that single point of failure).

### G7 — JS file update needs `?v=N` bump in index.html
**Problem:** Browser caches based on FULL URL including query string. Updating the file on the server without changing the script-tag's query = invisible cache hit, old code keeps running. Visible symptom = "fix doesn't work" — IDENTICAL to broken code or G6.

**Real example (v11.1.3):** `nav_polish.js` updated and deployed successfully (build #26 ✅). But `<script src="nav_polish.js?v=11.1.1">` still in index.html. Browser saw same URL → returned cached version. New `fixHeatmap()` function never executed.

**Diagnostic:**
```js
// Compare what SERVER returns vs what BROWSER loaded:
fetch('/nav_polish.js?bust=' + Date.now(), {cache:'no-store'})
  .then(r => r.text())
  .then(t => console.log('Server has v11.1.3 marker:', t.includes('w-v3')));
console.log('Browser exposed v11.1.3 fn:', typeof window.SHADOW_NAV_POLISH?.fixHeatmap === 'function');
// Mismatch → cache bust missing
```

**Fix workflow — every JS file update MUST be a TWO-commit ship:**
1. Upload the new file
2. Edit `index.html` to bump `?v=N` query on its `<script>` tag
3. Both commits happen back-to-back

If you forget step 2, you'll spend 20+ minutes wondering why nothing changes.

**Long-term:** Build a tiny pre-commit hook OR move to a build pipeline with hash-based file naming. Until then: discipline.

### G8 — Visual polish needs upfront spec
**Problem:** Iterating on a live website to find the right visual = expensive. Each iteration = 1+ commit (file) + 1+ commit (cache-bust) + 30–60s deploy wait + verify cycle. 4 rounds = ~80 min wasted vs ~5 min upfront spec.

**Real example (v11.1.3 → v11.1.6 heatmap iteration):**
- v3: compact 32px cells, justify-start → "1 bên trống"
- v4: 48px cells, center → still off
- v5: rotated GitHub-style → "ko giãn đều"
- v6: stretch 1fr → finally accepted

Could have been ONE iteration if the spec ("rotated 7×N grid, cells fill width via 1fr, centered") was agreed before code.

**Fix workflow — for any UI/visual change:**
1. Ask user concrete questions BEFORE coding:
   - "Dimensions: fixed px or 1fr stretch?"
   - "Orientation: rows or columns leading?"
   - "Position: full-width section or constrained to current column?"
   - "Cells: square (aspect-ratio:1) or rectangle?"
2. Sketch in text or ASCII: `Mon Tue Wed Thu Fri Sat Sun / [ ] [ ] [ ] [ ] / [ ] [ ] [ ] [ ]` — get sign-off
3. THEN code

**Glossary — Vietnamese visual feedback → CSS:**
| Phrase | English meaning | Maps to CSS |
|--------|-----------------|-------------|
| "thô" | rough/blocky | Cells too large (1fr in narrow container) |
| "trống" | empty | Whitespace from `justify:start` + small cells |
| "ngang/dọc" | horizontal/vertical | Orientation (`grid-auto-flow`) |
| "giãn đều" | stretch evenly | Use `1fr` fr-units, not fixed px |
| "không hợp lý" | not logical | Often = wrong rotation/orientation |
| "hoạt động thật" | really works | Real click handler, not just `cursor:pointer` |

### G9 — Idempotent CSS injection has stale-style trap
**Problem:** Pattern `if (document.getElementById('nav-polish-styles')) return;` is fine when CSS never changes. Across script versions in the same tab session, new CSS rules don't apply because the old `<style>` tag is already in DOM and the guard skips re-injection.

**Real example (v11.1 nav_polish.js):** Updated CSS for heatmap from v3 to v4 (`justify:start` → `justify:center`). In a tab that had loaded v3 then refreshed to v4, the v4 nav_polish.js ran, called `injectCSS()`, found `nav-polish-styles` already present, skipped → user still saw v3 CSS even though v4 JS ran. Confusing for ~10 min.

**Fix patterns:**

Option A — Version the ID:
```js
function injectCSS() {
  var id = 'nav-polish-styles-v6';  // bump per CSS change
  if (document.getElementById(id)) return;
  // Remove all old versions
  document.querySelectorAll('style[id^="nav-polish-styles"]').forEach(s => s.remove());
  var s = document.createElement('style');
  s.id = id;
  s.textContent = CSS;
  document.head.appendChild(s);
}
```

Option B — Always remove + reinject:
```js
function injectCSS() {
  var old = document.getElementById('nav-polish-styles');
  if (old) old.remove();
  var s = document.createElement('style');
  s.id = 'nav-polish-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}
```

Option A is preferred (less DOM thrash on idempotent calls).

**Tech debt:** Refactor `nav_polish.js` injectCSS() before v11.2 to use this pattern. Tracked as TD-5 in ROADMAP.

---

## 🎯 NON-OBVIOUS DESIGN DECISIONS

### Why `display: contents` for view containers
- Allows children to be direct grid items (`.content` is `display:grid`)
- Toggle visibility = swap which view has `.active` class
- No layout flicker

### Why `setInterval(1500ms)` for audio button auto-attach
- MutationObserver missed some cases
- Reliable across all view renders + dynamic content injection
- Idempotent: skip rows with existing button

### Why `display: contents` on view-home but the v10 #questions-5 still works
- 5Q panel injected as direct child of view-home, NOT inside view-home content
- Specifically: injected BEFORE `.mission-hero` to be first grid item

### Why theme colors use `--purple` and not `--primary`
- Historical: started with hardcoded purple theme
- Renamed too late = breaking change
- v7 layout engine sets `--purple` from selected theme's `primary` color

### Why localStorage key suffix `-v3` not `-v10`
- v3 was when state engine launched
- Key represents state SCHEMA version, not app version
- Bumping forces re-seed (data loss) — only do when schema breaks

### Why Notion `Custom Blocks` is single rich-text field (not multiple)
- Notion API limits fields per query
- JSON in single field = flexible, future-proof
- Plain-text fallback parser exists for non-JSON entries

### Why `applyReview()` keeps last 20 confidenceHistory entries
- Trend analysis needs ~5 recent
- 20 = ~3 months at 1 review/week
- Older = less relevant
- Keeps localStorage size bounded

### Why nav_polish.js does click-time lookups (v11.1.8)
- `state.topics` may not be fully loaded when nav_polish.js initial inject runs
- Resolving topic IDs at BIND time = stale fallbacks attached
- Resolving at CLICK time = always uses current state
- Trade-off: ~1ms find() per click, negligible

---

## 🧪 DEBUGGING COMMANDS (browser console)

```js
// State inspection
shadowEN.state // Full state
shadowEN.state.topics.slice(0,3) // First 3 topics
shadowEN.state.sessionsLog.length // Total sessions
v10.metrics() // Real metrics snapshot
v10.insights() // AI Coach matched insights
v10.riskAll() // Topics sorted by forget risk

// v11.1 Observability (debug_panel.js)
SHADOW_DEBUG.enable() / .disable() / .toggle()
SHADOW_DEBUG.rescueRanking(8)
SHADOW_DEBUG.forgetRiskBreakdown('L1-01')
SHADOW_DEBUG.memoryDistribution()
SHADOW_DEBUG.survivalPatterns()

// v11.1.x Nav polish (nav_polish.js)
SHADOW_NAV_POLISH._info()          // see all binding states
SHADOW_NAV_POLISH.computeLevelPct(1)  // real % for Level 1
SHADOW_NAV_POLISH.bind()           // manual rebind all

// Force state mutations (testing)
shadowEN.awardXP(500, "test")
shadowEN.completeReview('L1-01', 4)
shadowEN.completeSession('L1-01')
shadowEN.reset() // Wipe + reload

// Layout
LAYOUT_CONFIG // Current layout
layoutEngine.openSettings() // Open Settings modal

// Audio
SHADOW_AUDIO.voices // Available TTS voices
SHADOW_AUDIO.speak("Hello world", { rate: 0.75 })
SHADOW_AUDIO.startRecording()

// Content
SHADOW_CONTENT.TOPIC_CONTENT['L1-01']
SHADOW_CONTENT.getAllPhrases()

// Blocks
SHADOW_BLOCKS.types // 18 type registry
SHADOW_BLOCKS.renderAll([{type:'quote',text:'Hi'}], 'test')

// Cache + SW (for verifying live updates)
(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  const names = await caches.keys();
  await Promise.all(names.map(n => caches.delete(n)));
  console.log('Cleared', regs.length, 'SWs and', names.length, 'caches');
})()

// Force re-render
render()
```

---

## 🚀 DEPLOY WORKFLOW

### Manual deploy (via Chrome MCP) — for any JS file update

```
1. Open https://github.com/TruongCRM/shadow-english-dashboard/upload/main
2. Drag/drop files (or use Choose your files)
3. Scroll to Commit changes form
4. Fill commit message (use form_input on textbox ref)
5. Click "Commit changes" (use left_click on ref_173 button)
6. **CRITICAL (G7):** Open /edit/main/index.html, Ctrl+F find `?v={OLD}`, replace with `?v={NEW}`, commit
7. **CRITICAL (G6):** Check github.com/<repo>/actions for latest pages-build-deployment = ✅
8. Wait 30–60s for GitHub Pages rebuild
9. **For testing:** Unregister SW + clear caches (see Debugging Commands above) + hard reload
10. Test via ?v=N-bust query string
```

**Skipping step 6 = ship doesn't take effect. Skipping step 7 = you debug a phantom for an hour.**

### Auto deploy (GitHub Action — Notion sync only)
```
1. User edits Topic in Notion
2. GitHub Action triggers (cron 0 * * * *)
3. scripts/sync-from-notion.js fetches Notion API
4. Writes content.json if changed
5. Auto-commits + pushes
6. GitHub Pages auto-rebuilds
```

---

## 📐 CODING CONVENTIONS

### File naming
- Core: `app.js`, `content.js`, `audio.js`, `blocks.js`, `adaptive.js`, `metrics.js`, `coach.js`
- Per-version patches: `app_v{N}_{name}.js` (e.g. `app_v8_experience.js`)
- Observability layer (v11+): `debug_panel.js`, `nav_polish.js` — pure additive, opt-in
- Config files: `*.json`
- Docs: `UPPERCASE.md`

### Global exposure pattern
```js
// Bad: const FOO = {...}; // module-scoped, invisible to other scripts
// Good:
window.SHADOW_FOO = {...};
const SHADOW_FOO = window.SHADOW_FOO; // optional alias for use within this file
```

### Error handling pattern
```js
try {
  // risky code
} catch (e) {
  console.warn('[Component] Operation failed:', e);
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
- Prefix per feature: `.queue-tab`, `.queue-table`, `.session-step`
- Observability binding markers: `.{name}.nav-bound`, `.{name}.nav-polished` — for click-handler attach state

### Idempotency markers
- `el.dataset.{name}Bound = '1'` — has this element been processed?
- `window.fn.__{module}Patched = true` — has this function been wrapped?

### CSS injection — use Option A (versioned ID) per G9
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

---

## 🔮 BROWSER COMPATIBILITY NOTES

| Feature | Supported | Notes |
|---|---|---|
| Web Speech API (TTS) | Chrome, Edge, Safari, Firefox | Voice availability varies |
| MediaRecorder | All modern browsers | Needs `getUserMedia` permission |
| Service Worker | All modern browsers | Requires HTTPS (GitHub Pages has it) |
| localStorage | All browsers | 5–10MB limit |
| CSS `display: contents` | All modern browsers | Required for view system |
| CSS Grid `grid-auto-flow: column` | All modern | Used in nav_polish.js v11.1.5+ heatmap |
| CSS `aspect-ratio` | Modern browsers | Used for YouTube embed 16:9 |
| `gap` in flexbox | All modern | Used throughout |
| `:has()` selector | Chrome/Edge/Safari | NOT used (compat) |

Target: **Chrome 100+, Safari 16+, Firefox 100+**. No IE support.

---

## ⚠️ DO NOT

- **DON'T hardcode content** — must go through Notion or content.json
- **DON'T mutate `state` directly without calling `saveState()` + `render()`**
- **DON'T break the localStorage schema without bumping the key version**
- **DON'T add new dependencies** unless absolutely necessary (we're zero-build)
- **DON'T use `eval()` or `new Function()`** — security + perf
- **DON'T commit secrets** — only NOTION_TOKEN/NOTION_TOPICS_DB go in GitHub Secrets
- **DON'T fetch from cross-origin domains other than CDN-cached libraries**
- **DON'T break `window` namespace** — always prefix `SHADOW_*` or `shadowEN`
- **DON'T trust a green commit means it's live** — verify Actions tab (G6)
- **DON'T ship a JS file change without bumping `?v=N`** — cache-bust is mandatory (G7)
- **DON'T iterate visual polish on live without upfront spec** — sign off dimensions first (G8)
- **DON'T use idempotent CSS injection without versioned ID** — stale-style trap (G9)
- **DON'T skip CHANGELOG entry** — every ship gets documented per TEMPLATE_VERSION_ENTRY.md

---

*Last update: 2026-05-26 (v11.1.x stabilize session — G6–G9 added).*
