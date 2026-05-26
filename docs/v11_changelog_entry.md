## v11.1 — Daily Loop: Today Card (Survival Patterns + Rescue Queue + Memory Pulse) (2026-05-26)

### Goal
Reframe v11 brief from "6 features" → "1 daily loop". Single screen at top of Home that answers "Hôm nay học gì?" — Survival Patterns + Rescue Queue + Memory Pulse stacked in one calm/premium card. Target: daily return behavior + "memory đang sống" feeling.

### Built
- `phrases.js` (SHADOW_PHRASES) — Phrase pattern analyzer:
  - `normalize(s)` — punctuation-strip + lowercase + apostrophe normalization
  - `detectOpener(text)` — match against 30 survival opener regexes ("Can I…", "I'd like…", "How much…", "Excuse me…", etc.)
  - `getSurvivalPatterns(content, opts)` — group phrases by opener → return openers spanning ≥2 topics, sorted by topicCount desc
  - `getRelatedTopics(topicId)` — topics sharing opener patterns with given topic (foundation for v11.x Related Topics surface)
  - `analyze(content)` — exact-match analyzer (kept for completeness)
- `today.js` (SHADOW_TODAY) — Today card renderer:
  - Greeting line: time-of-day driven, italic serif tone (no flashy)
  - Section 1 Survival: top 5 opener patterns + 2 example phrases each + play button (SHADOW_AUDIO speak)
  - Section 2 Rescue: top 3 forget-risk topics with `lastReview` set; falls back to "Bắt đầu · 3 topic nền" if no reviews yet
  - Section 3 Memory Pulse: dot grid (32 topics × 14px), Fragile/Weak pulse-breath animation (5.5s ease-in-out, calm)
  - Self-contained `<style id="today-v11-styles">` — no index.html CSS dependency
  - Mobile-first: grid-column 1/-1 on <900px, touch targets ≥44px
- `app_v11_today.js` — Integration patch:
  - Initial inject 600ms + 1800ms after DOMContentLoaded (handles slow content.json fetch)
  - Wrap `window.render` and `window.navigate` — re-inject on home view
  - Brute-force `setInterval(3000)` fallback (per AI_HANDOFF gotcha #7)
  - Debug API: `v11.refresh()`, `v11.patterns()`, `v11.rescue()`
- `sw.js` — Cache bump `shadow-en-v3` → `shadow-en-v11` + add 3 new JS files to ASSETS list
- `index.html` — 3 new `<script defer>` tags after `app_v10_integration.js` (lines 1669-1671)

### Decisions & Tradeoffs
1. **Reframed 6 features → 2 milestones (v11.1 Daily Loop, v11.2 Identity).** Per AI_HANDOFF: "Identify HIGHEST impact items (usually first 2-3)". Building 6 surfaces = 6 weak features. Building 1 loop = real behavior change.
2. **Gộp Memory Graph + Rescue Queue + Memory Pulse vào MỘT card "Today"** thay vì 3 surfaces tách biệt. Lý do hệ thống: cả 3 đều phục vụ câu hỏi "Hôm nay tôi nên học gì?" — split = thêm dashboard, merge = daily loop.
3. **Survival Pattern (opener-based) thay cho exact-match.** Test trên data thật: 130 phrases có chỉ 3 trùng exact giữa các topic. Reframe sang detect opener patterns ("Can I…", "I'd like…") → tìm được 11 survival patterns, top: "Can I…" (5 topics, 7 lần) + "I'd like…" (5 topics, 6 lần). Đúng cách user nghĩ về survival.
4. **Rescue scoring** kết hợp 4 yếu tố: age (30%) + memoryStatus weight (30%) + (5 - confidence)/5 (20%) + SHADOW_ADAPTIVE.calculateForgetRisk (20%). Tránh phụ thuộc 100% vào `v10.riskAll()` (chỉ trả `{name, risk}`).
5. **Starter mode khi chưa có review:** Show "Bắt đầu · 3 topic nền" (L1-01..03) thay vì empty state. Không tạo dopamine empty — chỉ guide.
6. **Defer Identity system (v11.2)** đến khi v11.1 sinh data thật ≥7 ngày. Lý do: identity celebrate behavior chưa tồn tại = empty dopamine — đúng cái user muốn tránh.

### Risks
- **Phrase normalization edge cases** — apostrophes (curly vs straight), ellipsis, em-dash handled. Edge: phrases với HTML entities (chưa thấy trong content.json hiện tại).
- **GH Pages rate limit** — 17 deploys trong ngày, rate-limited deploy. Workaround: chờ slot mở.
- **SW cache v3→v11 jump** — user cần hard-refresh lần đầu. Documented in TECHNICAL_NOTES.

### Architecture change
Now **7 layers** (added: PHRASES analyzer + TODAY UI). Independent of v10 modules — purely additive. State schema UNCHANGED.

### Lessons learned
- **Test logic against real data BEFORE writing module.** Verifying opener detection on live SHADOW_CONTENT (130 phrases) trước khi viết phrases.js đã save 1 vòng debug.
- **Output filter in Chrome MCP js_tool** chặn template literals giống query string. Workaround: inspect via DOM/computed values, not raw source code.
- **CodeMirror 6 in GitHub edit page** — Ctrl+G opens Find dialog (not goto-line). Use Find string → Escape → End → Enter to insert text reliably.

### Pending → v11.2+ (next milestone)
1. Identity system — celebrate ONLY real behaviors (7-day review streak, first rescued topic, first Automatic). NO dopamine usage badges.
2. Related Topics in Topic Detail (uses `SHADOW_PHRASES.getRelatedTopics`).
3. Survival Phrases dedicated page (top 50 patterns with examples).
4. Pulse dot click → topic open (already implemented, needs full e2e test on phone).

