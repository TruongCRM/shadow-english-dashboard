# 🔬 V11.1 — INTERNAL INSIGHT PANEL (Today Debug)

> **Phase: STABILIZE v11.1** — không build feature lớn mới.
> Mục tiêu: tăng **clarity** của learning engine, không tăng complexity.

---

## 🎯 Why this exists

Sau v10 (Adaptive + Metrics + Coach), learning engine đã có nhiều logic tinh vi (forget risk, salvageability, mastery velocity, rescue ranking). Vấn đề: **logic này invisible**. User không biết:

- Vì sao topic X bị đưa vào Today Queue?
- Tại sao topic Y được rescue-rank cao hơn topic Z?
- Phrases nào lặp lại nhiều topics (survival patterns)?
- Bao lâu rồi mỗi topic chưa được review?

→ v11.1 builds **một panel internal duy nhất** để verify behavior thật trước khi build v11+ features lớn.

**Đây là observability layer — không phải feature.** Tương tự `console.log` nhưng visual + structured.

---

## 🏛 Architecture decisions

### 1. Pure additive — không phá state schema cũ
- File mới duy nhất: `debug_panel.js`
- Một script tag mới trong `index.html`
- **KHÔNG** sửa `app.js`, `adaptive.js`, `metrics.js`, `coach.js`
- **KHÔNG** thêm field nào vào `state.topics[*]` hoặc `state.user`
- Đọc state read-only qua `window.shadowEN.state` (fallback `window.state`)

### 2. Toggle ON/OFF (zero overhead khi OFF)
- localStorage key: `shadow-en-debug-mode` (`'1'` | `'0'`)
- URL param: `?debug=1` (enable) · `?debug=0` (disable) — persists vào localStorage
- Console: `SHADOW_DEBUG.enable()` / `.disable()` / `.toggle()`
- Khi OFF: panel không render, không có DOM, không có interval impact
- Khi ON: setInterval 5s fallback refresh (rất nhẹ)

### 3. Hook lifecycle thay vì poll
- Wrap `window.render` (idempotent với cờ `__dbgWrapped`)
- Wrap `window.shadowEN.saveState`
- Retry hooking 20 lần × 500ms (vì scripts có thể load sau)
- Panel re-render sau mỗi state mutation thật

### 4. Style theo Today card — calm/premium
- Background `rgba(15,13,35,0.96)` + backdrop-filter blur
- Primary accent `#7c5cff` (giống `--purple` của theme dark-purple)
- Pink `#ec4899` cho QUEUED badge (giống `--accent`)
- Font: monospace (ui-monospace, SF Mono) cho cảm giác "instrument panel"
- Không emoji, không animation màu mè
- Border thin, shadow sâu nhưng nhẹ

### 5. Mobile-safe
- Position fixed bottom-right
- Width: `min(420px, calc(100vw - 32px))` desktop · `calc(100vw - 16px)` mobile
- Max-height: `calc(100vh - 32px)` desktop · `70vh` mobile
- Scrollable body với scrollbar custom (purple thin)
- Tap targets ≥22px (header buttons), wrap row-head trên screen hẹp

### 6. Risk breakdown — transparent + tunable
Formula được hard-coded trong panel để TRANSPARENT (user nhìn thấy ngay). Mirror logic của `adaptive.js` nhưng không phụ thuộc:

```
total_risk = age_factor + memory_factor + confidence_factor + adaptive_penalty
salvageability = total_risk × max(0.1, mastery)
```

| Component | Range | Driver |
|---|---|---|
| `age` | 0 .. 0.40 | days since lastReview / 30, capped |
| `memory` | 0.01 .. 0.30 | Fragile=0.30 · Weak=0.22 · Building=0.12 · Stable=0.05 · Automatic=0.01 |
| `confidence` | 0 .. 0.20 | avg confidence last 3 reviews → low conf = high risk |
| `adaptive` | 0 .. 0.15 | declining trend (last − prev < 0) bonus |

**Why duplicate from adaptive.js?** Panel may diverge to test alternative formulas without breaking production logic. Sau khi tune xong, ta back-port vào `adaptive.js` ở v11.2.

### 7. Survival patterns = phrase frequency
- Iterate today's queue → collect all phrases from `before/during/after`
- Group by lowercased trimmed phrase
- Keep only phrases appearing in **≥2 topics**
- Top 5 by topic count

→ Trả lời câu hỏi: "Phrase nào nếu master sẽ trả về nhiều topics nhất?" (= survival phrase)

---

## 📥 Integration (1 step)

Thêm **1 dòng** vào `index.html`, ngay trước `</body>`, sau các script khác:

```html
<script src="debug_panel.js" defer></script>
```

Không cần thay đổi gì khác. Service Worker sẽ tự nhặt file mới sau cache bump.

---

## ✅ Verify checklist (manual smoke test)

Mở dashboard và làm tuần tự:

### Toggle behavior
- [ ] Mở `https://truongcrm.github.io/shadow-english-dashboard/?debug=1` → panel xuất hiện bottom-right
- [ ] Reload trang (không có query) → panel vẫn xuất hiện (persisted)
- [ ] Mở `?debug=0` → panel biến mất + reload không hiện lại
- [ ] Console: gõ `SHADOW_DEBUG.enable()` → panel hiện
- [ ] Click × → panel ẩn + reload không hiện
- [ ] Click − trên header → collapse body, header còn lại
- [ ] Click vùng header (không phải button) → toggle collapse
- [ ] Collapsed state persist qua refresh trong cùng tab (sessionStorage)

### Data correctness
- [ ] Mở DevTools: `SHADOW_DEBUG.memoryDistribution()` → object có 5 key, sum = total topics
- [ ] `SHADOW_DEBUG.rescueRanking()` → array 8 items, mỗi item có `topic`, `risk`, `salvageability`, `breakdown`
- [ ] `SHADOW_DEBUG.forgetRiskBreakdown('L1-01')` → object với `total` và 4 components
- [ ] `SHADOW_DEBUG.survivalPatterns()` → array (có thể empty nếu queue ít)
- [ ] Panel header "X topics · Y in queue today · Z reviewed · W never" — kiểm tra số khớp với `shadowEN.state.topics.length`
- [ ] Click "risk breakdown" trên một row → 4 bars hiện ra (age/memory/confidence/adaptive)
- [ ] Topic chưa review (`lastReview === null`) → age hiển thị `∞`, label `never reviewed`
- [ ] QUEUED pill chỉ hiện trên topic có `nextReview ≤ today`

### State integrity
- [ ] `shadowEN.state` không có field mới sau khi panel chạy (verify: `Object.keys(shadowEN.state.topics[0])` = giống trước)
- [ ] `localStorage` keys giống cũ + thêm 1 key duy nhất `shadow-en-debug-mode`
- [ ] Refresh panel sau khi `shadowEN.completeReview('L1-01', 4)` → top ranking thay đổi tương ứng
- [ ] Disable panel (`SHADOW_DEBUG.disable()`) → DOM `#debug-panel-host` removed; không có setInterval còn pending render

### Mobile
- [ ] DevTools → toggle device toolbar → iPhone SE 375px width
- [ ] Panel chiếm full width trừ 8px padding hai bên
- [ ] Body scroll mượt, không overflow ngang
- [ ] Tap header → collapse work bằng touch
- [ ] Memory distribution 5 cột nhỏ vẫn fit (font shrink xuống 14px num + 8.5px label)

### Style / calm
- [ ] Không có animation màu sắc nhấp nháy
- [ ] Không có emoji thừa
- [ ] Font monospace cho data, sans-serif chỉ trên titles
- [ ] Border + shadow tone tối, không glare
- [ ] Khớp với theme dark-purple (primary #7c5cff)

---

## 🛠 Console commands (useful for v11.1 observation week)

```js
// Toggle
SHADOW_DEBUG.enable()
SHADOW_DEBUG.disable()
SHADOW_DEBUG.toggle()

// Inspect data (returns plain objects — copy from DevTools)
SHADOW_DEBUG.rescueRanking()                    // top 8
SHADOW_DEBUG.rescueRanking(20)                  // top 20
SHADOW_DEBUG.forgetRiskBreakdown('L1-01')       // single topic
SHADOW_DEBUG.survivalPatterns()                 // queue phrases
SHADOW_DEBUG.memoryDistribution()               // counts by status

// Force refresh
SHADOW_DEBUG.render()

// Diff actual vs. adaptive.js logic
SHADOW_ADAPTIVE.calculateForgetRisk(shadowEN.state.topics[0])
SHADOW_DEBUG.forgetRiskBreakdown(shadowEN.state.topics[0].id).total
// (these should be CLOSE but may diverge — v11.1 panel is the experimental formula)
```

---

## ⚠️ New gotchas (record any that surface)

> Update this section whenever a surprise appears during the 7-day stabilize window.

### G1. Hook race condition (mitigated)
- **Symptom:** Panel built before `window.render` defined → no auto-refresh
- **Cause:** `defer` order — `debug_panel.js` loads after `app.js` but if `app.js` defines `render` inside DOMContentLoaded, our wrap fires too early
- **Mitigation:** Retry hook 20× over 10s (`setInterval(500)`). + setInterval 5s as ultimate fallback
- **Lesson:** When wrapping a foreign function, always retry; don't assume defer order is enough

### G2. Survival patterns require SHADOW_CONTENT loaded
- **Symptom:** "No cross-topic phrases" even when queue is populated
- **Cause:** `content.js` fetches `content.json` async → `SHADOW_CONTENT.TOPIC_CONTENT` may not exist on first render
- **Mitigation:** 5s setInterval refresh catches it. Manual `SHADOW_DEBUG.render()` works after content loads.

### G3. Formula divergence vs. adaptive.js (intentional)
- **Symptom:** Panel's `risk` differs from `SHADOW_ADAPTIVE.calculateForgetRisk()`
- **Cause:** Panel ships its own formula so we can tune without breaking prod
- **Rule:** After 7 days of observation, decide whether to back-port panel formula into `adaptive.js` (v11.2)

### G4. (RESERVED — record next)

---

## 🔭 Observation week (7 days)

Use this panel to answer:

1. Are Fragile topics actually getting rescued first? (rescue ranking #1-3 = Fragile?)
2. Is age weighted too high vs. memory? (do old Stable topics top rank wrongly?)
3. Are survival phrases real (cross-topic) or noise (common but not useful)?
4. Does QUEUED rank align with non-QUEUED rank? (queue should respect salvageability)
5. After completing 5 reviews — does memory distribution shift visibly?

**Note answers in a fresh `docs/V11_1_OBSERVATIONS.md`** before deciding v11 priorities.

---

## 🚫 Out of scope for v11.1

- New gamification UI
- New views / dashboards
- Notion sync changes
- State schema migration
- Mobile-app specifics
- LLM-based coach (still v12+)

If you (the user) feel pulled to add anything from this list during stabilize week — **resist**. v11.1 is a measure-then-build phase.

---

## 🧪 v11.1 → v11.2 graduation criteria

Move on from v11.1 only when:

- [ ] Verify checklist 100% green (all boxes ticked)
- [ ] At least 5 review sessions completed with panel ON
- [ ] `V11_1_OBSERVATIONS.md` filled with findings
- [ ] Decision made on formula back-port (panel → adaptive.js or kept separate)
- [ ] CHANGELOG.md updated with `v11.1` entry

Only then build v11.2 (likely: refined adaptive formula based on observations).

---

*Last update: 2026-05-26 (v11.1 ship).*
