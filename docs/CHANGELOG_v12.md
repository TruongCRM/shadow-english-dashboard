## v12.0 + v12.0.1 — Visual Content Editor (Phase 1) (2026-05-29)

### Goal
SHIP → USE → FIX LIVE pivot mid-Day 3 observation week. User override: stop sequencing v11.2 (HERO/TODAY GOAL/MEMORY rewrite), defer to v12.1+. New priority: in-app visual content editor — usable today by non-technical creator. v11.2 deferred.

Rough working version > perfect architecture later.

### Built
- `blocks.js` v2 — 3 new block types added: `paragraph`, `bulleted_list`, `numbered_list`. Total 21 types (was 18).
- `app_v12_editor.js` — NEW module (~700 lines). Single integrated editor:
  - Edit mode toggle button (top-right of topic detail)
  - **Video Immersion section** injected between WHY THIS TOPIC and CORE PHRASES — empty state CTA "Paste YouTube URL" → click prompt → auto embed
  - Block hover handles in edit mode (⋮ drag + ✏ edit + ⎘ duplicate + ↑↓ move + 🗑 delete)
  - Add Block popover — 10 types (paragraph, heading, bulleted_list, numbered_list, quote, divider, image, youtube, callout, note)
  - Inline contenteditable edit for text/heading/quote/note
  - HTML5 drag-drop block reorder (no CDN dep — fits zero-build constraint)
  - "Discard local edits" button — revert overlay to base content
  - Persistence: `shadow-en-overlay-{topicId}` localStorage (videoImmersionUrl + customBlocks[])
- `index.html` — added `<script src="app_v12_editor.js?v=12.0.1" defer></script>` after app_v11_1_14_day21_stage.js. Bumped `blocks.js?v=9` → `?v=12`.

### Architecture (rough V1 — localStorage overlay)
```
Base content (Notion sync → content.json)
  ↓ rendered by app.js native
  ↓
v12 Editor injects: Video Immersion + Editor section
  ↓ in edit mode → handles + actions visible
  ↓ user adds/edits/reorders blocks → save localStorage overlay
  ↓ next page load → overlay rendered alongside base
```

**Persistence model:**
- Custom blocks (added in app) = localStorage overlay = full edit
- Base Notion blocks (when sync populated) = readonly (anh edits in Notion via Edit-in-Notion deep-link planned v12.1)
- Reset button removes overlay → app shows pure Notion content

### Known limitations (Phase 1 rough)
1. **Single device persistence** — overlay stuck on this browser. Write-back to Notion = v12.1+ (~20h spec). Until then, anh document content trong Notion separately for multi-device.
2. **Notion DB nearly empty** — discovered Day 3 ledger: anh's Notion Topics DB only has 1 topic with all fields empty. 32 dashboard cards = seeded state, not Notion-driven. Edit-in-Notion deep-link → empty Notion page. Workflow: anh ADD topics to Notion DB with `Topic ID` field matching `L1-01..L3-XX` schema.
3. **Edit existing Notion blocks (when present)** — NOT supported in Phase 1. Phase 1 only adds new blocks via localStorage overlay. v12.1 will support inline edit of synced blocks via notionOverrides + write-back.
4. **No conflict resolution** — if anh edit Notion + add local block same topic, both render together (additive). Manual housekeeping required.
5. **Add Block popover positioning** — fixed at button location; on small mobile, may overflow viewport. Mobile polish v12.0.2.

### Problems encountered
1. **web_fetch truncation** — index.html (101 KB) + app.js (73 KB) exceeded fetch token cap. Saved to local but cut off mid-file. Lost trailing ~333 lines incl. close tags + v11.1.x scripts.
2. **Chrome MCP fetch ground truth** — used `javascript_tool` fetch() inside browser to get full 101 KB content, confirmed structure.
3. **CodeMirror 6 state ↔ DOM divergence** — execCommand('insertText') updates DOM but CodeMirror's internal state DOES propagate (verified by checking maxLineNumber gutter). Commit DID apply per diff page (+2 -1 changes).
4. **CDN cache lag** — raw.githubusercontent.com served stale content even after commit succeeded. Verified via Pages URL truongcrm.github.io (fresh after rebuild).
5. **Hook state lookup bug (v12.0)** — em's navigate hook referenced `window.state?.currentTopicId` but actual global is `window.shadowEN.state.currentTopicId`. Fixed in v12.0.1 with multi-fallback `getCurrentTopicId()`. Render not triggered v12.0; works v12.0.1.

### Fixes
- v12.0.1 state global lookup: `window.shadowEN?.state || (typeof state !== 'undefined' ? state : null) || window.state`
- v12.0.1 cache-bust bump `?v=12.0` → `?v=12.0.1` forces browser refetch
- Verified live: edit toggle + video immersion + editor section + add block bar all render correctly on L1-01 topic detail

### Architecture change
**Now 8 layers** (added v12 Editor on top of v7 UI Customization):
```
1. CONTENT  → Notion CMS → content.json
2. BLOCKS   → v9/v12 — 21 block type renderers
3. ADAPTIVE → v10 forget risk
4. METRICS  → v10 real computations
5. COACH    → v10 rule-based insights
6. UI       → v7 layout.json themes
7. OBSERVABILITY → v11.1 debug panel + nav_polish patches
8. EDITOR   → v12.0 visual content editor (localStorage overlay)
```

### Lessons crystallized
1. **G15 (new)** — Live ground truth > local cached fetch. When web_fetch truncates large files, use Chrome MCP javascript_tool fetch() to get actual full content in browser memory before modify.
2. **G16 (new)** — Global state lookup must check multiple namespaces. Production code uses `shadowEN.state`, not `window.state`. Always wrap state lookups with fallback chain.
3. **G17 (new)** — CodeMirror 6 + execCommand('insertText') WORKS for committing changes via GitHub web edit. DOM updates trigger CodeMirror state propagation properly. Verified via diff page (+2 -1).
4. **Pattern** — Two-commit ship (file + cache-bust) per G7. Phase 1 = 3 commits (blocks.js + app_v12_editor.js together / index.html / v12.0.1 patch).
5. **Pattern** — Ship-first feedback loop > prep-perfect. v12.0 had hook bug found in <5 min of live test. v12.0.1 fix shipped <10 min later. Total: bug → patch → verify = ~15 min. Faster than Day 11 prep would have caught.

### Ship metrics
- Day 3 evening session (~2h focused)
- 3 commits: `4f165b1` (blocks + editor) · `9d8e060` (index.html wire) · `11197e2 + 0549e0c` (v12.0.1 fix + cache-bust)
- 4 files changed: blocks.js, app_v12_editor.js, index.html (×2)
- Lines added: ~700 (editor module) + 1 (script tag) + 3 (new block types)
- Architecture impact: zero break (additive overlay, backwards compat)
- Phase 1 acceptance criteria PASSED: edit toggle visible · Video Immersion section visible · Add block popover renders · drag-drop wired · contenteditable works · localStorage persistence verified
