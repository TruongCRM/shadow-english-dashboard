# 📝 CONTENT EDITOR — PATH 1 BLUEPRINT (Smooth Notion Workflow)

> **Phase:** v11.2-parallel · Content layer rewrite (Notion sync script + native block parser).
> **Scope:** sync-from-notion.js extension + manual sync trigger + "Edit in Notion" deep-link.
> **NOT scope:** in-app CMS UI, inline WYSIWYG, drag-drop block builder. Notion CHÍNH LÀ editor.

**Author:** Claude (Cowork mode) cho Dương Trường
**Date:** 2026-05-29 (Day 3 observation week — prep complete, ship target Day 11-12)
**Updated:** 2026-05-29 — TD-9 (sync silent failure) discovered + resolved · Pre-flight Step 0 added
**Status:** DRAFT v2 — pending §9 sign-off sheet review
**Companion doc:** `docs/V11_2_REDESIGN_BLUEPRINT.md` (UI layer, parallel stream)

---

## 0. WHY THIS DOCUMENT EXISTS

### What anh asked (paraphrased)

> "Hiện hệ thống đã hỗ trợ chèn text/list/video. Nhưng user không biết chèn ở đâu, không biết edit thế nào. Hệ thống vẫn feel 'developer-controlled' thay vì 'creator-friendly'. Tôi muốn redesign giống Notion / Framer / Canva blocks — drag-drop, inline edit, video embed dễ dàng — nhưng vẫn calm/premium, không thành admin CMS."

### Root cause em reframe

Notion **ĐÃ CÓ SẴN** tất cả những gì anh mô tả:
- `/` slash menu → block insert toolbar
- Native drag-drop block reorder
- Inline edit click-to-type
- Paste YouTube → auto embed
- Calm premium feel (Notion's DNA)

Vấn đề KHÔNG phải app thiếu CMS UI. Vấn đề là **interface giữa Notion và app yêu cầu content theo format dev-friendly**:

| Friction điểm hiện tại | Anh cảm thấy |
|---|---|
| Phải nhớ Notion schema field names (`Topic ID`, `Why`, `Phrases Before`, `Custom Blocks`) | "Tôi phải learn schema như developer" |
| BLOCKS_GUIDE.md yêu cầu **paste JSON** vào field "Custom Blocks" | "Tôi đang code, không phải edit" |
| Sync delay 1h sau khi edit Notion | "Edit xong vẫn phải chờ" |
| Không biết edit topic nào ở Notion → phải search Notion DB manual | "Friction quay đi quay lại" |

### Path 1 fix DUY NHẤT interface đó. Không build CMS UI mới.

```
TRƯỚC (developer-controlled):
  Anh paste JSON vào Notion field "Custom Blocks" → sync → app render

SAU Path 1 (creator-friendly):
  Anh edit Notion page như edit Notion page bình thường
  (paragraph, heading, list, video paste, image drag)
  → sync script parse Notion native blocks → app render
```

### What this blueprint guarantees

1. Anh sẽ KHÔNG còn phải paste JSON cho 90% use case (Standard 12 block types cover).
2. Anh sẽ có nút **"Sync now"** trong app — 2 clicks total để force sync sau khi edit Notion.
3. Anh sẽ có nút **"Edit in Notion"** trên topic detail — click → mở thẳng Notion page tương ứng.
4. Sync delay rút từ "đợi 1h cron" xuống "click + 10-15s GitHub Action chạy".
5. Architecture hard constraint #4 (Notion = source of truth) → **giữ nguyên**, không break.

---

## 1. VISION + LOCK-IN DECISIONS

### 1.1 Vision

> Anh edit Notion page **như edit Notion page** (drag, slash menu, inline type, video paste). Click một nút "Sync now" trong app. ~15 giây sau, content xuất hiện trên Shadow English. Không paste JSON. Không nhớ schema. Không đợi 1h.

### 1.2 Sign-off decisions (đã lock từ AskUserQuestion)

| Decision | Anh đã chọn | Implication |
|---|---|---|
| Block coverage | **Standard 12 types** | Parser hỗ trợ: paragraph, heading 1/2/3, bulleted list, numbered list, image, video, quote, callout, divider, code block, toggle, embed |
| Việc 2 (restructure topic flow Why→Video→Phrases→Rest) | **Defer to v11.3** | Path 1 KHÔNG động UI layer. Topic detail flow rewrite riêng sau v11.2 + Path 1 ship clean |
| JSON Custom Blocks (L1-01 hiện có) | **Additive** | Page blocks render TRƯỚC, JSON Custom Blocks render SAU. L1-01 vẫn work, không break |
| Manual sync trigger | **In-app "Sync now" button → GitHub workflow page** | Zero token client-side. 2 clicks total. Sync chạy trong ~15s |

### 1.3 Secondary decisions (em applied defaults)

| | Choice |
|---|---|
| Filename | `docs/CONTENT_EDITOR_PATH1_BLUEPRINT.md` |
| Blueprint style | Follow V11_2 (numbered sections + tables + HTML mockups + §9 sign-off sheet) |
| HTML mockup cho UI | YES — concrete HTML/CSS cho 2 button new |
| Notion DB property additions | Đề xuất thêm 2 fields: `Notion Page URL` (URL) + `Video Immersion URL` (URL, optional) |
| Sync frequency | Keep hourly cron + ADD manual trigger |
| Estimate scope | Strict 5-8h dev (~Day 11-12) |
| Save location | `outputs/` của em → anh upload manually qua GitHub web UI vào `docs/` |
| Notion workspace privacy | PRIVATE — deep-link mở Notion native app (web/desktop/mobile) |
| Backwards compat | YES với L1-01 (matches Additive choice) |
| Acceptance style | Hybrid: technical (sync passed, blocks render) + emotional ("feels like Notion, not paste JSON") |

---

## 2. SCOPE BREAKDOWN

### 2.1 IN scope (Path 1)

✅ Rewrite `scripts/sync-from-notion.js` to fetch Notion page blocks (not just page properties).
✅ Add `parseBlock()` function handling 12 Notion native block types → app block type.
✅ Add 2 Notion DB property fields: `Notion Page URL`, `Video Immersion URL`.
✅ Add `tools/` GitHub workflow trigger button in app settings panel.
✅ Add "Edit in Notion" deep-link button on topic detail page.
✅ Keep JSON Custom Blocks field PARSING (additive — render after page blocks).
✅ Update `docs/SETUP_NOTION_SYNC.md` with new "Native Block Editing" section.
✅ Update `BLOCKS_GUIDE.md` to note JSON paste = optional now (advanced cases only).

### 2.2 OUT of scope (defer)

❌ **Việc 2 — restructure topic page flow** (Why → Video → Phrases → Rest) → **v11.3 after v11.2 + Path 1 ship**.
❌ In-app inline editing (click-to-edit text/list) — anh edit ở Notion.
❌ In-app drag-drop block reorder — anh drag ở Notion.
❌ In-app block insert toolbar — anh dùng `/` slash menu trong Notion.
❌ In-app video URL paste — anh paste vào Notion page hoặc `Video Immersion URL` field.
❌ Migration L1-01 JSON Custom Blocks → page blocks (additive choice = keep JSON working).
❌ Webhook Notion → GitHub auto-sync (cần backend proxy, vi phạm constraint #3).

### 2.3 Path 1 vs Path 2/3 (architectural choice em đã pushback)

Path 1 chọn vì:

- **Zero architecture impact**: giữ Notion = source of truth (hard constraint #4).
- **Zero new technology**: chỉ extend Node.js script đã có + 2 small UI buttons.
- **Reuse Notion's UX**: drag-drop, inline edit, video paste — Notion làm cực tốt rồi.
- **Anh đã có Notion workspace + Notion mobile/web app**: học gì mới = 0.
- **Multi-device free**: Notion sync cloud, không bị stuck localStorage.

---

## 3. NOTION NATIVE BLOCK → APP BLOCK MAPPING

### 3.1 Standard 12 block types (anh đã chọn)

| # | Notion API block type | App block type | Notes |
|---|---|---|---|
| 1 | `paragraph` | `paragraph` (new) | Plain text với rich-text annotations (bold, italic, code, link) |
| 2 | `heading_1` | `heading` (level: 2) | Map H1 Notion → H2 app (vì app đã có topic title H1) |
| 3 | `heading_2` | `heading` (level: 2) | H2 Notion → H2 app |
| 4 | `heading_3` | `heading` (level: 3) | H3 Notion → H3 app |
| 5 | `bulleted_list_item` | `bulleted_list` (group) | Sync script gom các consecutive items thành 1 group block |
| 6 | `numbered_list_item` | `numbered_list` (group) | Sync script gom tương tự |
| 7 | `image` | `image` (existing) | Notion lưu image file URL hoặc external URL — extract `file.url` hoặc `external.url` |
| 8 | `video` | `youtube` (existing) hoặc `embed` | Detect YouTube URL → map sang `youtube`. URL khác → `embed` |
| 9 | `quote` | `quote` (existing) | Plain text quote |
| 10 | `callout` | `callout` (existing) | Có `icon.emoji` + rich-text. Color → map sang app color palette (purple/blue/green/yellow/orange/red/pink) |
| 11 | `divider` | `divider` (existing) | No content |
| 12 | `code` | `html` (existing, fenced) | Code block với language → render trong `<pre><code>` |

### 3.2 Bonus 2 types (em thêm cho Path 1, gần như free)

| 13 | `toggle` | `note` với title=toggle title | Toggle children flatten thành note content |
| 14 | `embed` | `embed` (existing) | Generic external URL embed (Vimeo, Loom, etc.) |

### 3.3 Rich text annotation handling

Notion rich text có annotations: `bold`, `italic`, `strikethrough`, `underline`, `code`, `color`, `link`. App hiện chỉ render plain text. Path 1 sẽ:

- Render `bold`, `italic`, `code`, `link` (essential).
- Skip `strikethrough`, `underline`, `color` (low value, render plain).
- Output HTML inline tags: `<strong>`, `<em>`, `<code>`, `<a href="...">`.

### 3.4 Recursive children handling

Notion blocks có thể có children (nested toggle, nested list). Path 1 strategy:

- Toggle: fetch children, flatten content vào note.
- Bulleted/numbered list nested: render 1 level nested only (avoid deep recursion complexity).
- Other blocks with children: ignore children, render parent only.

### 3.5 Block types NOT supported (anh paste = silently ignored)

`table`, `column_list`, `to_do`, `synced_block`, `child_page`, `child_database`, `breadcrumb`, `table_of_contents`, `equation`, `bookmark`, `pdf`, `file`, `audio` (Notion native — app dùng riêng `audio` block với src URL).

→ Nếu anh muốn thêm cái nào → ship Maximum 18 types incremental sau (em note trong §10).

---

## 4. SYNC SCRIPT REWRITE SPEC

### 4.1 Current state (v5)

`scripts/sync-from-notion.js` hiện đang:

1. Read NOTION_TOKEN + NOTION_TOPICS_DB từ env.
2. Query Notion DB topics → get all pages (page properties only).
3. Parse properties: Topic ID, Name, Level, Why, Scene, Phrases Before/During/After, Dialogues, Shadow Script, Missions, Active Recall, Custom Blocks (JSON paste).
4. Write `content.json`.
5. Auto-commit + push.

**NOT FETCHED:** page body content (Notion native blocks inside the page).

### 4.2 Path 1 extension

```
For each page in Notion DB:
  1. Get page properties (như cũ)
  2. NEW: Fetch page blocks via Notion API GET /v1/blocks/{page_id}/children
  3. NEW: Parse blocks recursively (children of toggle, etc.)
  4. NEW: Map Notion blocks → app block schema
  5. NEW: Group consecutive list items into list groups
  6. NEW: Resolve image URLs (file vs external)
  7. NEW: Detect YouTube in video block → youtube vs embed
  8. NEW: Merge into content.json.topics[id].sections[]:
     - Page blocks FIRST (Notion native)
     - JSON Custom Blocks SECOND (additive backwards compat)
```

### 4.3 Pseudo-code structure

```javascript
// scripts/sync-from-notion.js (v6 — Path 1)

async function syncTopic(page) {
  const properties = parseProperties(page);            // existing logic
  const pageBlocks = await fetchPageBlocks(page.id);   // NEW
  const appBlocks = pageBlocks.map(parseBlock).filter(Boolean); // NEW
  const groupedBlocks = groupListItems(appBlocks);     // NEW
  const jsonCustomBlocks = parseCustomBlocksJSON(properties.customBlocks); // existing

  return {
    ...properties,
    notionPageUrl: properties.notionPageUrl || derivePageUrl(page),  // NEW
    videoImmersionUrl: properties.videoImmersionUrl || null,         // NEW
    sections: [
      ...groupedBlocks,        // NEW — Notion native blocks first
      ...jsonCustomBlocks      // existing — JSON Custom Blocks after (additive)
    ]
  };
}

async function fetchPageBlocks(pageId, cursor = null) {
  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;
  const params = cursor ? `?start_cursor=${cursor}` : '';
  const res = await fetch(url + params, {
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28'
    }
  });
  const data = await res.json();
  let blocks = data.results;

  // Fetch children of toggle blocks
  for (const block of blocks) {
    if (block.has_children && (block.type === 'toggle' || block.type === 'bulleted_list_item' || block.type === 'numbered_list_item')) {
      block.children = await fetchPageBlocks(block.id);
    }
  }

  // Paginate if more
  if (data.has_more) {
    const more = await fetchPageBlocks(pageId, data.next_cursor);
    blocks = blocks.concat(more);
  }

  return blocks;
}

function parseBlock(block) {
  switch (block.type) {
    case 'paragraph':         return { type: 'paragraph', text: richText(block.paragraph.rich_text) };
    case 'heading_1':         return { type: 'heading', level: 2, text: richText(block.heading_1.rich_text) };
    case 'heading_2':         return { type: 'heading', level: 2, text: richText(block.heading_2.rich_text) };
    case 'heading_3':         return { type: 'heading', level: 3, text: richText(block.heading_3.rich_text) };
    case 'bulleted_list_item':return { type: '__bullet_item__', text: richText(block.bulleted_list_item.rich_text) };
    case 'numbered_list_item':return { type: '__numbered_item__', text: richText(block.numbered_list_item.rich_text) };
    case 'image':             return parseImage(block);
    case 'video':             return parseVideo(block);
    case 'quote':             return { type: 'quote', text: richText(block.quote.rich_text) };
    case 'callout':           return parseCallout(block);
    case 'divider':           return { type: 'divider' };
    case 'code':              return { type: 'html', html: `<pre><code class="lang-${block.code.language}">${escapeHtml(plainText(block.code.rich_text))}</code></pre>` };
    case 'toggle':            return parseToggle(block);
    case 'embed':             return { type: 'embed', url: block.embed.url };
    default:                  return null; // unsupported — silently skip
  }
}

function groupListItems(blocks) {
  const result = [];
  let buffer = [];
  let bufferType = null;

  for (const block of blocks) {
    if (block.type === '__bullet_item__' || block.type === '__numbered_item__') {
      const newType = block.type === '__bullet_item__' ? 'bulleted_list' : 'numbered_list';
      if (bufferType && bufferType !== newType) {
        result.push({ type: bufferType, items: buffer });
        buffer = [];
      }
      bufferType = newType;
      buffer.push(block.text);
    } else {
      if (buffer.length > 0) {
        result.push({ type: bufferType, items: buffer });
        buffer = [];
        bufferType = null;
      }
      result.push(block);
    }
  }
  if (buffer.length > 0) {
    result.push({ type: bufferType, items: buffer });
  }
  return result;
}

function richText(rtArray) {
  // Convert Notion rich_text array → HTML inline string
  return rtArray.map(rt => {
    let text = escapeHtml(rt.plain_text);
    if (rt.annotations.code) text = `<code>${text}</code>`;
    if (rt.annotations.bold) text = `<strong>${text}</strong>`;
    if (rt.annotations.italic) text = `<em>${text}</em>`;
    if (rt.href) text = `<a href="${rt.href}" target="_blank" rel="noopener">${text}</a>`;
    return text;
  }).join('');
}

function parseImage(block) {
  const url = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
  const caption = block.image.caption ? plainText(block.image.caption) : '';
  return { type: 'image', src: url, caption };
}

function parseVideo(block) {
  const url = block.video.type === 'external' ? block.video.external.url : block.video.file.url;
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  return isYouTube ? { type: 'youtube', url } : { type: 'embed', url };
}

function parseCallout(block) {
  const COLOR_MAP = {
    'purple_background': 'purple', 'blue_background': 'blue',
    'green_background': 'green', 'yellow_background': 'yellow',
    'orange_background': 'orange', 'red_background': 'red',
    'pink_background': 'pink', 'gray_background': 'gray'
  };
  return {
    type: 'callout',
    icon: block.callout.icon?.emoji || '💡',
    text: richText(block.callout.rich_text),
    color: COLOR_MAP[block.callout.color] || 'purple'
  };
}

function parseToggle(block) {
  const title = plainText(block.toggle.rich_text);
  const childrenText = (block.children || [])
    .map(c => plainText(c[c.type]?.rich_text || []))
    .filter(Boolean)
    .join('\n');
  return { type: 'note', title, text: childrenText };
}
```

### 4.4 API rate limit + sync time

- Notion API: 3 requests/second per integration.
- Per topic: 1 DB query result + 1 page blocks fetch (+ N toggle children fetches).
- 32 topics × ~1.5 requests average = ~48 requests = ~16 seconds serial.
- Add 5s GitHub Action boot → **total ~20-25s per sync**.

Recommend: keep hourly cron, add 1-second delay between page fetches để safe under quota.

### 4.5 Error handling

- Notion API 429 (rate limit) → retry với exponential backoff (1s, 2s, 4s).
- Notion API 5xx → log + skip that page (sync other topics).
- Notion API 401 → fail fast (token expired) + log clearly trong Action output.
- Unsupported block type → log "skipped: {type}" + continue.
- Malformed JSON Custom Blocks → log + fall back to empty array (don't break sync).

### 4.6 Backwards compat with v11.2

Critical: **content.json schema phải remain readable by v11.2 client code**.

- v11.2 client expects `topics[id].sections[]` array of blocks.
- Path 1 produces `topics[id].sections[]` = page blocks + JSON Custom Blocks combined.
- v11.2 doesn't care which source — it iterates `sections[]` calling `SHADOW_BLOCKS.renderAll()`.
- NEW field `notionPageUrl` ignored by v11.2 (only used by deep-link button in §6).
- NEW field `videoImmersionUrl` ignored by v11.2 (used by v11.3 video immersion block).

→ Zero merge conflict with v11.2 ship.

---

## 5. MANUAL SYNC TRIGGER UX

### 5.1 Flow (anh đã chọn: option A — in-app button → GitHub workflow page)

```
1. Anh edit topic page trong Notion (text/list/video/...)
2. Anh quay lại app
3. Anh click ⚙️ Settings → "Sync content" section → click "Sync now" button
   HOẶC: click "Sync now" trên topbar (next to install PWA button)
4. App mở new tab: github.com/TruongCRM/shadow-english-dashboard/actions/workflows/sync-from-notion.yml
5. Anh click "Run workflow" button trên GitHub
6. ~15-25s sau, content.json updated → GitHub Pages rebuild
7. Anh quay app, hard refresh (?v=N-bust) → thấy content mới
```

### 5.2 HTML mockup — Sync button trong Settings panel

```html
<!-- Trong layoutEngine.openSettings() modal, add new section -->
<div class="settings-section">
  <div class="settings-section-title">Content sync</div>
  <div class="sync-row">
    <div class="sync-info">
      <div class="sync-label">Notion → Dashboard</div>
      <div class="sync-hint">Last auto-sync: ~12 mins ago · Hourly</div>
    </div>
    <button class="sync-btn" id="sync-now-btn" onclick="triggerNotionSync()">
      <span class="sync-icon">↻</span>
      <span class="sync-text">Sync now</span>
    </button>
  </div>
  <div class="sync-help">
    Edit content in Notion, then click "Sync now" to pull updates immediately
    (instead of waiting for hourly auto-sync).
  </div>
</div>
```

### 5.3 CSS spec

```css
.sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(124,92,255,0.04);
  border: 1px solid rgba(124,92,255,0.1);
  border-radius: 10px;
}

.sync-label {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  font-weight: 600;
}

.sync-hint {
  font-size: 11.5px;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
}

.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95));
  color: white;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(180,140,255,0.5);
  cursor: pointer;
  transition: all 200ms ease-out;
}

.sync-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124,92,255,0.3);
}

.sync-icon {
  display: inline-block;
  font-size: 14px;
}

.sync-btn.syncing .sync-icon {
  animation: sync-spin 1s linear infinite;
}

@keyframes sync-spin {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}

.sync-help {
  font-size: 11.5px;
  color: rgba(255,255,255,0.45);
  margin-top: 10px;
  line-height: 1.5;
  font-style: italic;
}
```

### 5.4 Behavior

```javascript
function triggerNotionSync() {
  const url = 'https://github.com/TruongCRM/shadow-english-dashboard/actions/workflows/sync-from-notion.yml';
  // Open GitHub workflow page in new tab
  window.open(url, '_blank', 'noopener,noreferrer');

  // Show toast: "Click 'Run workflow' on GitHub. Sync takes ~15-25s."
  toast('GitHub mở rồi. Click "Run workflow" để bắt đầu sync (~15-25s).');

  // Hint: refresh app sau sync
  setTimeout(() => {
    toast('Sync xong, hard-refresh app (Ctrl+Shift+R) để thấy content mới.');
  }, 25000);
}
```

### 5.5 Future enhancement (v12+)

Nếu anh muốn 1-click thay vì 2-clicks, em sẽ ship Personal Access Token option (security trade-off):

- Anh tạo GitHub Personal Access Token với `workflow` permission scope.
- App lưu PAT trong localStorage (only on anh's device).
- Click "Sync now" → app POST `/repos/.../actions/workflows/sync.yml/dispatches` → sync chạy.

Defer to v12 (after Day 11-12 ship clean).

---

## 6. "EDIT IN NOTION" DEEP-LINK UX

### 6.1 Flow

```
1. Anh đang trên topic detail page (vd: "Ordering Food & Drinks")
2. Topbar có button "✏ Edit in Notion"
3. Click → mở new tab → URL: https://www.notion.so/{workspace}/{page-id}
4. Notion native app open (web/desktop/mobile dispatch dựa device)
5. Anh edit Notion page như bình thường
6. Quay app → click "Sync now" (§5)
```

### 6.2 HTML mockup

```html
<!-- Trong topic detail header, sau topic name + Mastery badges -->
<div class="topic-detail-actions">
  <a class="edit-notion-btn" id="edit-notion-link"
     href="https://www.notion.so/..." target="_blank" rel="noopener">
    <span class="edit-notion-icon">✏</span>
    <span class="edit-notion-text">Edit in Notion</span>
  </a>
</div>
```

### 6.3 CSS spec

```css
.topic-detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.edit-notion-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  font-size: 12.5px;
  text-decoration: none;
  transition: all 200ms ease-out;
}

.edit-notion-btn:hover {
  background: rgba(124,92,255,0.1);
  border-color: rgba(124,92,255,0.3);
  color: rgba(255,255,255,0.95);
}

.edit-notion-icon {
  opacity: 0.7;
  font-size: 12px;
}
```

### 6.4 URL derivation

```javascript
function getEditNotionUrl(topicId) {
  const topic = window.SHADOW_CONTENT.getContent(topicId);
  if (!topic || !topic.notionPageUrl) return null;
  return topic.notionPageUrl;
}

function renderEditNotionButton(topicId) {
  const url = getEditNotionUrl(topicId);
  if (!url) return ''; // hide button if no URL (topic not synced from Notion or field empty)
  return `<a class="edit-notion-btn" href="${url}" target="_blank" rel="noopener">
    <span class="edit-notion-icon">✏</span>
    <span class="edit-notion-text">Edit in Notion</span>
  </a>`;
}
```

### 6.5 Fallback when `notionPageUrl` missing

- Old topics synced before Path 1 = no `notionPageUrl` → button hidden.
- After Path 1 ship + first sync → sync script derives URL from page ID → all topics have button.
- Recommend: anh manual fill `Notion Page URL` field for L1-L3 critical topics first, rest fill incrementally.

---

## 7. CONTENT.JSON SCHEMA MIGRATION

### 7.1 Before (v5)

```javascript
{
  topics: {
    "L1-01": {
      id: "L1-01",
      name: "Ordering Food & Drinks",
      emoji: "🍔",
      level: 1,
      why: "...",
      scene: "...",
      phrases: { before: [...], during: [...], after: [...] },
      dialogues: [...],
      shadow_script: "...",
      missions: [...],
      active_recall: [...],
      sections: [           // <- JSON Custom Blocks only
        { type: "youtube", url: "..." },
        { type: "quote", text: "..." }
      ]
    }
  }
}
```

### 7.2 After Path 1 (v6 schema — APPEND-ONLY)

```javascript
{
  topics: {
    "L1-01": {
      // ... all existing fields unchanged ...
      sections: [
        // NEW: page blocks first (parsed from Notion native blocks)
        { type: "heading", level: 2, text: "Why this matters" },
        { type: "paragraph", text: "Ordering food is the most common..." },
        { type: "youtube", url: "https://youtube.com/watch?v=..." },
        { type: "bulleted_list", items: ["Item 1", "Item 2"] },
        { type: "callout", icon: "💡", text: "...", color: "purple" },
        // ... more page blocks ...

        // EXISTING: JSON Custom Blocks second (additive backwards compat)
        { type: "ai-prompt", prompt: "...", tools: [...] },
        { type: "exercise", question: "...", answer: "..." }
      ],

      // NEW fields (v11.2 doesn't read, v11.3 + Path 1 features use)
      notionPageUrl: "https://www.notion.so/...",  // <- §6 deep-link
      videoImmersionUrl: "https://youtube.com/..." // <- v11.3 video immersion (optional)
    }
  }
}
```

### 7.3 Schema rules (locked)

- **Append-only**: Add new fields, NEVER rename or remove existing fields.
- **Default values**: New fields default to `null` or `[]` to avoid breaking older clients.
- **Sections order**: Page blocks (Notion native) ALWAYS render before JSON Custom Blocks.
- **No breaking change in block schema**: 12 native types map to existing `SHADOW_BLOCKS.types` (paragraph + heading + bulleted_list + numbered_list need to be ADDED to blocks.js if not present, em check Day 11).

### 7.4 New Notion DB property fields (anh thêm trước sync)

Trong Notion DB Topics, anh add 2 fields mới:

1. **Notion Page URL** (type: URL) — anh có thể tự fill bằng cách copy page link, hoặc dùng Notion formula `prop("URL")` để auto-fill.
2. **Video Immersion URL** (type: URL, optional) — paste YouTube link cho video immersion ở topic flow (sẽ render trong v11.3).

Step-by-step em sẽ document trong updated `SETUP_NOTION_SYNC.md` (Day 11 task).

---

## 8. ACCEPTANCE CRITERIA

### 8.1 Technical (Day 11 verify)

- [ ] Sync script (`scripts/sync-from-notion.js`) chạy without error trên GitHub Action.
- [ ] `content.json` chứa parsed page blocks cho ít nhất 1 test topic.
- [ ] 12 Standard block types parse correctly (paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item, image, video, quote, callout, divider, code, toggle, embed).
- [ ] Rich text annotations render đúng: bold, italic, code, link.
- [ ] Consecutive list items grouped into single `bulleted_list` / `numbered_list` block.
- [ ] YouTube video URL detected → `youtube` block. Other URL → `embed` block.
- [ ] JSON Custom Blocks (L1-01 existing) vẫn parse + render SAU page blocks.
- [ ] Sync time < 30s for 32 topics.
- [ ] No 401/429/5xx errors at API level.
- [ ] "Sync now" button in Settings opens GitHub workflow page.
- [ ] "Edit in Notion" button on topic detail opens correct Notion page URL.

### 8.2 Emotional (Day 12 verify by anh)

- [ ] **Anh edit Notion page** với native blocks (paragraph, list, paste YouTube) → click "Sync now" → 25s sau content xuất hiện trên app. **Anh KHÔNG paste JSON một lần nào.**
- [ ] **Anh feel "like editing Notion"**, không feel "like configuring CMS".
- [ ] **Anh hỏi: "Đợi gì trên Notion ko render được trong app?"** → trả lời được trong 2 giây bằng cách nhìn supported list.
- [ ] **"Edit in Notion" button** xuất hiện ở topic detail → click → mở thẳng Notion page. KHÔNG cần search.
- [ ] **Sync feedback rõ ràng**: anh biết sync đang chạy, biết khi nào xong, biết phải refresh app.

### 8.3 Negative criteria (KHÔNG được xảy ra)

- ❌ L1-01 hiện tại bị mất content sau Path 1 ship (JSON Custom Blocks vẫn render).
- ❌ Sync break content.json schema → v11.2 client crash.
- ❌ Notion API token leaked trong client-side code.
- ❌ "Sync now" button trigger sync mà không clear feedback → anh không biết status.
- ❌ Mobile app render khác desktop (block types responsive).
- ❌ UI add nút mới (sync button, edit button) làm feel "admin CMS" — phải minimal/calm.

---

## 9. SIGN-OFF SHEET (Day 5 — anh review)

### 9.1 Block coverage approval

- [ ] **Standard 12 types** locked: paragraph, heading_1/2/3, bulleted_list, numbered_list, image, video, quote, callout, divider, code, toggle, embed.
- [ ] Drop any from list? (Đánh dấu nếu có)
- [ ] Add any specific Notion type? (vd: `to_do` cho checklist — em sẽ map sang `checklist` block)

### 9.2 Rich text annotations approval

- [ ] Bold, italic, code, link → render
- [ ] Strikethrough, underline, color → skip (low value)
- [ ] Anh muốn thêm gì khác?

### 9.3 JSON Custom Blocks decision (already Additive)

- [x] Locked: page blocks first, JSON Custom Blocks after.
- [ ] Anh đồng ý KHÔNG migrate L1-01 sang page blocks ngay (deprecate later v12+)?

### 9.4 Notion DB property additions

- [ ] Add `Notion Page URL` field (URL type)
- [ ] Add `Video Immersion URL` field (URL type, optional, for v11.3 prep)
- [ ] Anh sẽ tự manual fill `Notion Page URL` cho 32 topics, hay em viết auto-fill script?

### 9.5 "Sync now" button location

- [ ] Trong Settings panel (Section "Content sync") — Recommended
- [ ] Trên topbar (next to PWA install button)
- [ ] Cả 2 (Settings + topbar)

### 9.6 "Edit in Notion" button location

- [ ] Trên topic detail page header (sau topic name + Mastery badges) — Recommended
- [ ] Trong sidebar khi đang xem topic
- [ ] Floating action button góc phải dưới

### 9.7 Sync frequency

- [x] Locked: hourly cron + manual trigger
- [ ] Anh muốn thay đổi cron (vd: 30 min)?

### 9.8 Vietnamese copy approval

- [ ] "Sync now" button label — anh prefer "Sync now" / "Đồng bộ ngay" / "Cập nhật"?
- [ ] Toast 1: "GitHub mở rồi. Click 'Run workflow' để bắt đầu sync (~15-25s)." — chỉnh sửa?
- [ ] Toast 2: "Sync xong, hard-refresh app (Ctrl+Shift+R) để thấy content mới." — chỉnh sửa?
- [ ] "Edit in Notion" button label — anh prefer "Edit in Notion" / "Sửa trên Notion"?

### 9.9 Final sign-off

- [ ] Anh confirm: "Đây là HẾT scope cho Path 1" (no Wave-N surprise specs).
- [ ] Anh confirm: Day 11-12 ship sau khi v11.2 ship Day 8-10 clean.
- [ ] Anh confirm: Việc 2 (Topic Flow restructure) defer to v11.3.
- [ ] Anh confirm: Acceptance criteria §8 measurable + agreed.

### 9.10 TD-9 mitigation sign-off (added Day 3 — 2026-05-29)

- [ ] Anh confirm: Day 11 morning, BEFORE Wave A start, anh sẽ check Actions tab xem latest "Sync content from Notion" run = ✅ GREEN. Nếu RED → anh re-trigger workflow_dispatch + verify pass trước khi em ship code.
- [ ] Anh đồng ý em add workflow status badge vào README.md trong Wave C (Day 12, Docs) → để future silent failures visible without manual Actions tab check.
- [ ] Optional: anh muốn enable GitHub email notification cho Sync workflow failure (Settings → Notifications → Actions)? Em viết step-by-step nếu YES.

---

## 10. IMPLEMENTATION PLAN (Day 11-12)

### 10.1 Pre-flight (sau khi v11.2 ship clean Day 10)

- [ ] **STEP 0 (CRITICAL — TD-9 mitigation)**: Verify Sync workflow LATEST run = ✅ GREEN trong Actions tab. Nếu fail → fix secrets BEFORE bất cứ Wave A work nào. (TD-9 silent failure pattern: cron fail âm thầm, không alert. Day 3 discovery: workflow đã fail 6+ runs liên tiếp May 28-29 vì NOTION_TOKEN/NOTION_TOPICS_DB env vars missing → anh restore secrets manual + workflow_dispatch trigger → fixed 2026-05-29.)
- [ ] v11.2 ship + verify all acceptance §1.10/§2.7/§3.9 PASS
- [ ] Sign-off sheet §9 — anh check Day 5 → em update blueprint nếu có change
- [ ] Anh add 2 Notion DB fields (`Notion Page URL`, `Video Immersion URL`)
- [ ] Anh manual fill `Notion Page URL` cho ít nhất 3 test topics (L1-01, L1-02, L1-03)
- [ ] Take backup snapshot of content.json + state.json (Day 10 baseline)

### 10.2 Wave A — Sync script rewrite (Day 11, ~3-4h)

1. Read current `scripts/sync-from-notion.js`
2. Add `fetchPageBlocks()` function with recursion + pagination
3. Add `parseBlock()` switch over 14 types (12 standard + 2 bonus)
4. Add `richText()` annotation handler
5. Add `groupListItems()` for list grouping
6. Add `parseCallout()`, `parseImage()`, `parseVideo()`, `parseToggle()` helpers
7. Add error handling + retry với exponential backoff
8. Add 1s delay between page fetches để safe under rate limit
9. Update content.json schema output to include `notionPageUrl`, `videoImmersionUrl`
10. **G6/G7**: commit + verify Action passes → verify content.json has page blocks for test topics

### 10.3 Wave B — In-app UI (Day 11, ~2h)

1. Add `triggerNotionSync()` JS function to `app_v11_2_pathone.js` (NEW file)
2. Add Sync button + Sync section HTML in Settings panel (`layoutEngine.openSettings()`)
3. Add "Edit in Notion" button to topic detail render path
4. Inject CSS per §5.3 + §6.3 (versioned ID per G9: `pathone-styles-v1`)
5. Test toast feedback flow
6. **G7**: bump `?v=N` cache-bust for index.html
7. **G6**: verify Action passes after both commits

### 10.4 Wave C — Documentation (Day 12, ~1h)

1. Update `docs/SETUP_NOTION_SYNC.md` — add section "Native Block Editing"
2. Update `BLOCKS_GUIDE.md` — add note "JSON paste = optional now, prefer native Notion blocks"
3. Update `docs/CHANGELOG.md` with v12.0 entry (Path 1 ship)
4. Update `docs/ROADMAP.md` — mark Creator Mode #1 = DONE via Path 1 (smooth Notion)
5. Update `docs/AI_HANDOFF.md` — note v12.0 + Path 1 architecture
6. Update `docs/TECHNICAL_NOTES.md` — add G15 if any new gotcha surfaces

### 10.5 Wave D — Verify (Day 12, ~1h)

1. Run §8.1 technical checks all PASS
2. Anh run §8.2 emotional checks → confirm "feels like editing Notion"
3. Test mobile (380px viewport) — buttons readable + tap targets ≥44px
4. Test offline → sync button gracefully handles network down
5. Test edge: topic without `notionPageUrl` → "Edit in Notion" button hidden
6. Test edge: empty Notion page (no blocks) → topic still renders with phrases/dialogues
7. **G6/G10**: final ship verify — Action green, content.json correct, both files in repo

### 10.6 Total estimate

| Wave | Duration |
|---|---|
| Pre-flight (anh + em) | ~30 min |
| Wave A — Sync script | 3-4h |
| Wave B — In-app UI | 2h |
| Wave C — Docs | 1h |
| Wave D — Verify | 1h |
| **Total** | **~7-8.5h** |

Spread across Day 11 (6h) + Day 12 (2.5h).

---

## 11. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Notion API rate limit hit (429) | Medium | Sync fails | 1s delay between page fetches + exponential backoff retry |
| Notion API contract change | Low | Parser breaks | Pin `Notion-Version: 2022-06-28` header + document upgrade plan |
| Schema migration breaks v11.2 | Low | Production crash | Append-only rule + Day 11 verify content.json with v11.2 client |
| L1-01 JSON Custom Blocks disappear | Medium | User content lost | Additive rendering (verified §7.2) + Day 11 explicit test |
| "Sync now" button → admin CMS feel | Medium | Anh hate "admin feel" | Minimal design (1 button in settings, calm gradient, no enterprise icons) |
| `notionPageUrl` field missing → button broken | High initially | Confusion | Hide button gracefully when URL null + anh fill 3 test topics first |
| Toggle block recursion infinite loop | Low | Sync hang | Max depth 2 + circular reference detection |
| Rich text HTML injection (XSS) | Low | Security | `escapeHtml()` on plain_text before annotation wrapping |
| Mobile UX broken | Medium | UX | Test 380px viewport + ≥44px tap targets |
| Anh add unsupported block type | High over time | Silent skip | Document supported list clearly + log skipped types in Action output |
| Việc 2 deferred to v11.3 disappoints anh | Low (anh chose) | Expectation | Confirmed v11.3 in §9 sign-off |
| **TD-9 — Sync workflow silent failure (NOTION_TOKEN/NOTION_TOPICS_DB expired/missing)** | **High over time** | **Total sync break — content.json stale, app shows old data** | **Day 11 Pre-flight Step 0 (§10.1) verify latest Sync run = green. Future: add workflow status badge to README.md so failures visible. Even further: add email notification cho cron fail (GitHub Actions native).** |
| Re-discovering TD-9 sau Day 11 ship | Low | Path 1 features render stale content | Sign-off sheet §9.10 (mới) — anh confirm Pre-flight Step 0 đã chạy trong same session với Wave A start |

---

## 12. WHAT THIS BLUEPRINT GUARANTEES

After Path 1 ships clean Day 12, anh's content workflow becomes:

```
┌─────────────────────────────────────────────────────────────┐
│ Anh edit Notion page (drag, slash menu, paste YouTube)     │
│   ↓                                                          │
│ Click "Sync now" in app Settings                             │
│   ↓                                                          │
│ ~15-25s GitHub Action runs                                   │
│   ↓                                                          │
│ Hard refresh app → content updated                           │
│   ↓                                                          │
│ Click "Edit in Notion" on any topic → mở thẳng Notion page  │
└─────────────────────────────────────────────────────────────┘
```

**ZERO JSON paste** for 90% use case.
**ZERO new app to learn** — Notion is already in anh's hand.
**ZERO architecture break** — Notion still source of truth (constraint #4 held).
**ZERO "admin CMS feel"** — 2 small buttons, calm design.

The product becomes truly **creator-friendly** — không bằng cách build Notion lại trong app, mà bằng cách **smooth interface giữa Notion và app đến mức gần như invisible**.

---

## 13. WHY THIS WORKS (where in-app CMS would fail)

**In-app CMS path (Path 2/3) would have failed because:**

1. **Reinventing what Notion does well** — drag-drop, inline edit, paste-to-embed. Notion has 100+ engineers on this. App has 1 (em).
2. **Multi-device split** — content edited in app stuck on 1 device unless we add backend (vi phạm constraint #3).
3. **Admin CMS feel risk** — adding UI controls (+/⋮/✏/🗑/drag handles) inherently looks like CMS. Anh explicitly hate this.
4. **Sunk-cost** — 20-30h dev for parity with Notion = bad ROI when Notion is free.

**Path 1 succeeds because:**

1. **Leverages existing platform** — Notion does the heavy lifting (UX, multi-device sync, mobile app).
2. **Minimal code** — sync script extension (~200 lines) + 2 small UI buttons (~80 lines CSS+JS).
3. **Zero new mental model** for anh — same Notion, just smarter sync.
4. **Reversible** — if Path 1 doesn't satisfy, we can still build Path 2/3 layer on top later. Path 2/3 first = irreversible architecture commitment.

---

*Last update: 2026-05-29 (Day 3 observation week — TD-9 added, sync alive verified).*
*Status: DRAFT v2. Anh sign-off §9 sheet (now 10 sub-sections). Ship Day 11-12 after v11.2 ship clean + Pre-flight Step 0 PASS.*
*Companion: `docs/V11_2_REDESIGN_BLUEPRINT.md` (UI stream — parallel, zero codebase overlap).*

---

## CHANGELOG (this file)

**v2 — 2026-05-29 (Day 3)**:
- Discovered TD-9: Sync workflow silent failure since at least May 28. Root cause: `NOTION_TOKEN` / `NOTION_TOPICS_DB` GitHub Secrets missing/expired.
- Resolved: anh re-set both secrets manually + workflow_dispatch trigger → sync alive again (run #19 ✅ 18s).
- Added Pre-flight Step 0 §10.1 (CRITICAL — verify sync alive before Wave A start).
- Added TD-9 row to risk register §11.
- Added §9.10 sign-off sub-section (3 items: pre-flight confirm, workflow badge in Wave C, email notification opt-in).
- Fixed date metadata: was Day 1 (May 27), correctly Day 3 (May 29).
- Validation bonus: anh's manual workflow_dispatch trigger (via Actions tab "Run workflow") = exact UX flow designed in §5. Anh confirmed feels acceptable.

**v1 — 2026-05-27 (Day 1)**:
- Initial blueprint authored.
