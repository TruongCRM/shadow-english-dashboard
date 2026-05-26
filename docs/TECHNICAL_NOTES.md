# 🛠 SHADOW ENGLISH — TECHNICAL NOTES & GOTCHAS

> Hard-won lessons from 10 iterations. Read this BEFORE making changes to avoid re-discovering the same problems.

---

## 🚨 KNOWN ISSUES & WORKAROUNDS

### 1. Service Worker cache stale
**Problem:** After deploy, browser still loads old version because SW caches scripts.
**Workaround:**
- Bump SW `CACHE` version in `sw.js` (e.g. `shadow-en-v3` → `shadow-en-v4`)
- Add `?v=N` query param to script URLs in HTML
- User must hard-refresh (Ctrl+Shift+R) first time
**Fix forever:** Use cache-busting with file hash (requires build step — defer to v11+)

### 2. GitHub Pages deploy delay
**Problem:** After commit, scripts at `https://truongcrm.github.io/...` still serve old version for 30-90 seconds.
**Workaround:**
- Wait 60 seconds after commit before testing
- Use `?v=N-bust` query string to force fresh fetch
**No proper fix** — it's just GitHub's CDN propagation.

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
- After click, wait 6-10s
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

### 10. localStorage 5-10MB limit
**Problem:** If sessionsLog grows unboundedly (100s of sessions/day theoretical), could hit quota.
**Workaround (future):** Trim sessionsLog to last 1000 entries when length > 2000.

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

---

## 🧪 DEBUGGING COMMANDS (browser console)

```js
// State inspection
shadowEN.state                       // Full state
shadowEN.state.topics.slice(0,3)     // First 3 topics
shadowEN.state.sessionsLog.length    // Total sessions
v10.metrics()                        // Real metrics snapshot
v10.insights()                       // AI Coach matched insights
v10.riskAll()                        // Topics sorted by forget risk

// Force state mutations
shadowEN.awardXP(500, "test")
shadowEN.completeReview('L1-01', 4)
shadowEN.completeSession('L1-01')
shadowEN.reset()                     // Wipe + reload

// Layout
LAYOUT_CONFIG                        // Current layout
layoutEngine.openSettings()          // Open Settings modal

// Audio
SHADOW_AUDIO.voices                  // Available TTS voices
SHADOW_AUDIO.speak("Hello world", { rate: 0.75 })
SHADOW_AUDIO.startRecording()

// Content
SHADOW_CONTENT.TOPIC_CONTENT['L1-01']
SHADOW_CONTENT.getAllPhrases()

// Blocks
SHADOW_BLOCKS.types                  // 18 type registry
SHADOW_BLOCKS.renderAll([{type:'quote',text:'Hi'}], 'test')

// Force re-render
render()
```

---

## 🚀 DEPLOY WORKFLOW

### Manual deploy (via Chrome MCP)
```
1. Open https://github.com/TruongCRM/shadow-english-dashboard/upload/main
2. Drag/drop files (or use Choose your files)
3. Scroll to Commit changes form
4. Fill commit message (use form_input on textbox ref)
5. Click "Commit changes" (use left_click on ref_173 button)
6. Wait 30-60s for GitHub Pages rebuild
7. Test via ?v=N-bust query string
```

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
- Config files: `*.json`
- Docs: `UPPERCASE.md`

### Global exposure pattern
```js
// Bad: const FOO = {...};  // module-scoped, invisible to other scripts
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

---

## 🔮 BROWSER COMPATIBILITY NOTES

| Feature | Supported | Notes |
|---|---|---|
| Web Speech API (TTS) | Chrome, Edge, Safari, Firefox | Voice availability varies |
| MediaRecorder | All modern browsers | Needs `getUserMedia` permission |
| Service Worker | All modern browsers | Requires HTTPS (GitHub Pages has it) |
| localStorage | All browsers | 5-10MB limit |
| CSS `display: contents` | All modern browsers | Required for view system |
| `aspect-ratio` CSS | Modern browsers | Used for YouTube embed 16:9 |
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

---

*Last update: 2026-05-26 (v10)*
