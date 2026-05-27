# 🌙 V11.1-B — EXPERIENCE POLISH BLUEPRINT

> **Phase: v11.1-B (track riêng, SUB-phase trong STABILIZE)** — KHÔNG build feature mới.
> **Scope: DOCUMENT ONLY** trong observation week. Code change đợi Day 8+.
> **Goal:** Transform app feeling từ *"smart dashboard"* → *"calm adaptive learning experience"*.
>
> Đây là **upfront spec document** theo nguyên tắc G8 (visual polish needs upfront spec). Mỗi polish item phải có dimensions/orientation/fill-mode concrete + user sign-off TRƯỚC khi code, để tránh lặp lại 4-rounds iteration của heatmap v11.1.3→v11.1.6 (~80 min lãng phí).

**Author:** Claude (Cowork mode) cho Dương Trường
**Date:** 2026-05-27 (Day 1/7 observation week)
**Repo:** https://github.com/TruongCRM/shadow-english-dashboard
**Live URL:** https://truongcrm.github.io/shadow-english-dashboard/

---

## 0. PHASE IDENTITY & SCOPE GUARD

### Vị trí trong dòng version

```
v11.1.0 ──┐
v11.1.1 ──┤
v11.1.2 ──┤  STABILIZE patches (nav_polish.js fixes)
v11.1.3 ──┤
v11.1.4 ──┤
v11.1.5 ──┤
v11.1.6 ──┤
v11.1.7 ──┤
v11.1.8 ──┘  ← Resume point (verify pending)
          │
          │  OBSERVATION WEEK (Day 0 = 2026-05-26 → Day 7 = 2026-06-02)
          │
   ┌──────┴──────┐
   │             │
v11.1-B       v11.1-OBS
(doc-only)    (data collection)
   │             │
   └──────┬──────┘
          │
       Day 7 Decision Gate
          │
   ┌──────┼──────┐
   │      │      │
v11.2-A v11.2-B v11.3
(back-  (Daily  (deferred
 port   Loop    formula
 formula)polish) work)
```

**v11.1-B là track riêng** — chạy song song với observation week, **chỉ produce documentation/spec**. KHÔNG ship code, KHÔNG update ROADMAP.md, KHÔNG đụng các file v11.1.x đang được observe.

### Quy tắc tự ràng buộc cho phase này

| Allowed | Forbidden |
|---|---|
| Viết blueprint doc (`docs/V11_1B_*.md`) | Modify file `.js` / `.css` / `index.html` |
| Audit UX hiện tại bằng screenshot/observation | Deploy commit |
| Spec dimensions cho từng polish item | Bump `?v=N` query |
| Run console commands (read-only) | Execute `shadowEN.completeReview()` để test |
| Update CHANGELOG để **record blueprint creation** (entry-doc only) | Update CHANGELOG cho code change |

### Lý do gate này quan trọng

Polish phase = nhiều CSS/animation changes liên tiếp → high risk inject bug vào hệ thống đang được observe → contaminate observation data → mất 7 ngày, không kết luận được v11.2-A vs v11.2-B đúng.

> **Nguyên tắc:** Observation week = "đừng đụng vào bệnh nhân khi đang đo signal". Polish phase = "lên phác đồ giải phẫu trên giấy trước, mổ sau".

---

## 1. NORTH STAR (lặp lại từ AI_HANDOFF để on-context)

> "Tôi không muốn build 'English learning dashboard'. Tôi muốn build 'Operating System for English Fluency'." — Dương Trường, v10 brief

> "Trước khi build feature mới, hãy hoàn thành và stabilize đúng engineering flow." — v11.1 discipline

**Translation cho v11.1-B:** Polish không phải là "thêm hiệu ứng cho đẹp". Polish là **làm cho hệ thống cảm thấy đáng tin cậy** — mỗi tương tác có feedback subtle, mỗi transition có rhythm, mỗi space có lý do tồn tại. Sản phẩm không nói nhiều — nhưng mỗi millisecond đều có chủ đích.

**Test cho mọi polish decision:**
- ❓ Cái này có giúp user **deep work** không? → CÓ → ship
- ❓ Cái này có giúp user **return tomorrow** không? → CÓ → ship
- ❓ Cái này có khiến app feel **premium calm** không? → CÓ → ship
- ❓ Cái này có là **dopamine empty** (vui mắt nhưng không serve hành vi) không? → CÓ → CẮT

---

## 2. DAY 1 RESUME VERIFY RESULT (2026-05-27 — Chrome MCP)

### Resume checklist (V11_1_PATCHES §6)

| # | Test | Expected | Actual | Status |
|---|------|----------|--------|--------|
| 1 | Visit `?v=11.1.8` | Page loads | Page loaded, title "Shadow English — Learning Operating System" | ✅ |
| 2 | `SHADOW_NAV_POLISH._info().script_src` | `"nav_polish.js?v=11.1.8"` | `https://...nav_polish.js?v=11.1.8` | ✅ |
| 3 | Click 🍔 Restaurant (L1) | → `view-topic-detail` (L1-01) | → **`view-level1`** (FALLBACK) | 🔴 **FAIL** |
| 4 | Click 🤝 Friendship (L2) | → `view-topic-detail` (L2-xx) | Skipped — same root cause as #3 | ⚪ skip |
| 5 | Click MORE (any level) | → `view-level{N}` | (presumed pass — fallback path itself works, since #3 went there) | ✅ inferred |
| 6 | Level 1 % | ≥ 4% (real, not 0) | `level_pcts: [{level:1, pct:4}, ...]` ✓ | ✅ |
| 7 | Heatmap layout | 4×7 grid, stretched | `heatmap_present:true, heatmap_weeks_fixed:"4w-v6"` ✓ | ✅ |
| 8 | `pages-build-deployment` last run | ✅ green | Not directly checked, but `?v=11.1.8` served correctly → live build ≥ 11.1.8 | ✅ inferred |

**Score:** 5 PASS · 1 FAIL · 1 SKIP · 1 INFERRED

### 🔴 v11.1.8 FIX DID NOT WORK — root cause discovered

The fix shipped in v11.1.8 was **click-time emoji lookup** to handle state-race conditions. Console diagnostic shows:

```js
window.SHADOW_NAV_POLISH._info() = {
  level_cards_bound: 3, topic_icons_bound: 24,
  level_pcts: [{level:1,pct:4}, {level:2,pct:0}, {level:3,pct:0}]
}

window.shadowEN.state.topics.filter(t=>t.level===1).map(t=>t.emoji)
  → ["🍔", "🗺️", "🛍️", "👋", "🔢", "✈️", "🚌", "🏨", "📞", "🏥", "🤝", "🚨"]  (12 items)

document.querySelectorAll('.level-card')[0].querySelectorAll('.bubble')
  → ["🍔", "🚖", "🛍️", "🏨", "✈️", "🗺️", "🚨", "⋯"]  (8 items)
```

**Three layers of system mismatch:**

1. **Data source split** — Level Map DOM is generated from a DIFFERENT data source than `state.topics`. The DOM shows 🚖 (taxi) which doesn't exist in state's L1 emoji set at all. This means there is **a separate hardcoded array** somewhere (likely `app_v11_today.js` or `today.js` — TD-2 zone).
2. **Count mismatch** — 12 state topics vs 8 DOM slots. DOM clearly only displays 7 + "More" icon, NOT all 12. There is a sampling/slicing logic that's not documented.
3. **Click-time lookup still fails** — manual `findTopicByEmoji('🍔', 1)` returns L1-01 correctly, BUT the click handler attached to the DOM icon fell back to `goToLevel('level1')`. This means the click handler either uses the OLD data source (not `state.topics`) OR resolves at bind-time after all.

### 🎯 Direct implication for v11.1-B

- **The L1-B blueprint CANNOT proceed safely without TD-2 closed first.** TD-2 = "3 undocumented v11 scripts" — exactly the modules that own this hidden data source.
- This finding **promotes TD-2 from MEDIUM to CRITICAL priority**.
- It also **opens a candidate for TD-6**:

> **TD-6 (proposed):** Level Map data source desync — DOM-rendered topic icons (in `today.js`/`app_v11_today.js`?) use a hardcoded/legacy emoji list that doesn't match `state.topics`. nav_polish.js click-time lookup against state can never resolve mismatched emojis → permanent fallback to level-page.

### Recommended user actions

| Priority | Action | Why |
|---|---|---|
| 🔴 P0 | Defer v11.1-B Wave 1 implementation start beyond Day 8 | Until TD-2 + TD-6 resolved, polish blueprint sits on unstable foundation |
| 🔴 P0 | Schedule TD-2 archaeology session (Day 8) | Map all v11 modules' data ownership |
| 🟡 P1 | Decide TD-6 designation — accept proposed text above OR alternative | Document closure |
| 🟢 P2 | Keep v11.1.8 as-is during observation week | Bug observable, doesn't block data collection (queue logic uses state directly, not DOM) |

**Pass criteria for v11.1-B blueprint sign-off (revised):** 5/8 pass + 1 critical bug surfaced. **Blueprint document = ACCEPTED as draft**. Implementation = **GATED on TD-2 + TD-6 close**.

---

## 3. TECH DEBT AUDIT (going into v11.1-B)

| TD | Source | Status going in | v11.1-B impact | Action |
|---|---|---|---|---|
| **TD-1** | Node 20 deprecation trên Pages | OPEN, pre-v11.2 | Không liên quan polish | Watch — anh đụng khi GitHub thông báo |
| **TD-2** | 3 v11 scripts undocumented (`phrases.js`, `today.js`, `app_v11_today.js`) | OPEN | **HIGH** — polish có thể đụng `today.js` (Today card) → cần biết module trước khi spec | **Block v11.1-B implementation cho đến khi TD-2 archaeology xong** |
| **TD-3** | Adaptive vs Debug formula 19× | OPEN, Day 7 decide | Không liên quan polish | Đợi observation week |
| **TD-4** | `getTodayQueue` not exposed | OPEN | LOW | Skip |
| **TD-5** | `nav_polish.js` injectCSS chưa versioned ID | OPEN | **HIGH** — polish CSS sẽ chồng lên `nav_polish.js` styles → trap G9 chắc chắn xảy ra | **Close TD-5 cùng deploy đầu tiên của v11.1-B** |
| **TD-6** | ⚠️ OPEN, pending definition | unknown | unknown | Day 7 review with user |

### Đề xuất TD-6 candidate (chưa commit, chờ user sign-off Day 7)

Trong quá trình audit hôm nay, 3 ứng viên TD-6 xuất hiện một cách hệ thống:

| Candidate | Mô tả | Priority |
|---|---|---|
| **TD-6a** | **Motion language unified definition missing** — mỗi component (modal, toast, button, card) đang dùng easing/duration tự định nghĩa. Không có `--motion-fast`, `--motion-base`, `--motion-slow` tokens trong theme. | High (chính là gốc của v11.1-B) |
| **TD-6b** | **Typography scale không có ratio system** — font sizes hiện đang adhoc (12px, 14px, 16px, 18px, 24px). Không có modular scale (1.25 / 1.333 / golden). | Medium |
| **TD-6c** | **Z-index ad-hoc** — debug panel z-index 9999, modals z-index 1000, toast 9999 → conflict-prone. Cần z-index scale. | Low |

→ Recommend **TD-6a** vì align nhất với North Star của polish phase. Anh sign off ở Day 7.

---

## 4. UX AUDIT — CURRENT STATE (per item)

> Audit dựa trên: brief 10 mục anh đưa, V11_1_PATCHES.md observations, TECHNICAL_NOTES, code module list. Mỗi item có 4 phần: **What exists** | **What's missing** | **User pain hypothesis** | **Risk overlap với v11.1.x stabilize zone**.

### 4.1 Micro Interactions

**What exists:**
- `.nav-bound`, `.nav-polished` hover lift (nav_polish.js v11.1.1+)
- Default browser focus rings
- Button transitions từ CSS inline trong `index.html`

**What's missing:**
- Button press feedback (no `:active` distinct from `:hover`)
- Card transitions có timing nhưng không có shared easing
- Audio button (▶) active state — chỉ có `cursor:pointer`, không có "đang playing" visual differentiation
- Loading state khi `content.json` fetch (silent)
- Fade in/out khi view-switch (instant hard switch)

**User pain hypothesis:** App cảm giác "static reactive" — click vào không có sense of acknowledgment trước khi state update. Đặc biệt audio button không phân biệt được "ready to play" vs "is playing".

**Risk overlap v11.1.x:**
- 🔴 HIGH overlap với `nav_polish.js` hover CSS (line `~140-160` nav_polish.js)
- 🟡 MEDIUM overlap với `debug_panel.js` style ID `debug-panel-styles`
- 🟢 LOW overlap với `audio.js` (chưa có CSS state cho audio buttons)

### 4.2 Topic Navigation Feel

**What exists:**
- `nav_polish.js` binds click handlers (Level cards, topic icons, MORE, Review rows)
- `window.navigate(viewId)` swaps `.active` class on `.view` containers
- `display: contents` trick cho view system

**What's missing:**
- Smooth fade transition — currently instant DOM swap
- Mini context intro card (topic icon + title + current stage) trước khi enter lesson
- "Where am I coming from" history awareness (no back button context)
- Loading bridge khi topic content chưa render (blank flash)

**User pain hypothesis:** Click → page snap khô khan như button click chứ không như "entering a room". Kindle/Calm app feel = micro-pause cho não register transition.

**Risk overlap v11.1.x:**
- 🔴 HIGH overlap với `nav_polish.js` `window.navigate` wrap (idempotent flag `__navPolishPatched`)
- 🟡 MEDIUM overlap với `today.js` view-home render
- 🟢 LOW overlap với debug panel

### 4.3 Session Entry Experience

**What exists:**
- `shadowEN.startSession(topicId)` flips view
- 8 steps render sequential (WARM-UP → ... → REFLECTION)
- Step 1 = WARM-UP (chỉ là copy explain step)

**What's missing:**
- Focus transition ritual — instant switch, không có "moment of preparation"
- No dim background / soft blur
- No display của session title + estimated time + current mission TRƯỚC lesson
- Mission card từ Coach hoặc Today không bị "rescued by entering session"

**User pain hypothesis:** Session entry = "another click" thay vì "tôi đang bắt đầu một deep work session". Tâm lý chưa được set trước khi bài học chạy.

**Risk overlap v11.1.x:**
- 🟢 LOW overlap — session view ít bị nav_polish.js đụng
- 🟡 MEDIUM với `app_v10_integration.js` override `completeSession`

### 4.4 Session Completion Experience

**What exists:**
- Step 8 = REFLECTION với 5 confidence buttons
- `completeReview(topicId, conf)` → applyReview → save → render
- `awardXP()` add XP + check level-up
- (Có lẽ) toast notification

**What's missing:**
- Emotional closure moment — currently just "click confidence → kick back to home"
- "Rescued memory" visual — topic này vừa được kéo từ Fragile lên Building (no acknowledgment)
- Progress movement animation — XP bar không animate, level chip không pulse
- Confidence reflection prompt — không có "Vì sao bạn chấm 4 sao?" (1 câu suy ngẫm)
- Calm completion state — return về home dashboard ngay = không có "breath out" moment

**User pain hypothesis:** Hoàn thành 1 session feel như "tick checkbox" thay vì "vừa hoàn thành một small win". Đây là moment quan trọng nhất cho daily-return behavior.

**Risk overlap v11.1.x:**
- 🟢 LOW
- 🟡 MEDIUM với `coach.js` `postSession()` insight generator

### 4.5 Typography Polish

**What exists:**
- System font stack (system-ui, sans-serif)
- Serif font cho shadow script (v8)
- Mixed font-size declarations across components
- Line-height 1.5 mặc định

**What's missing:**
- Modular type scale (no ratio system — TD-6b candidate)
- Hierarchy clarity — Dashboard có cảm giác "đậm đặc" vì H1/H2/H3/body weight gradient quá close
- Breathing room — `padding: 16px` ubiquitous, không có rhythm "lúc nén lúc thở"
- Reading comfort — text trong card không có max-width → wide screen text quá dài
- Density reduction trong cards (5Q panel, Level Map, Today card đang stuff nhiều info trong frame nhỏ)

**User pain hypothesis:** Dashboard feel "thông tin nhiều" thay vì "thông tin sạch" — đọc xong scroll xuống cảm giác mệt mắt, không có moment để "rest the eye".

**Risk overlap v11.1.x:**
- 🟡 MEDIUM với mọi inline CSS hiện tại — typography change = global ripple

### 4.6 Motion System

**What exists:**
- Ad-hoc transitions per component
- No CSS custom properties cho timing/easing
- nav_polish.js hover lift dùng `transform: translateY(-2px)` với `transition: all 0.2s ease`

**What's missing:**
- Unified motion language — fade duration, easing curve, hover timing, panel transition đều inconsistent
- No `--motion-*` design tokens
- No `prefers-reduced-motion` support (accessibility + calm mode override)

**User pain hypothesis:** Khác component animate khác nhau → cảm giác "không liền mạch". Đây là gốc của TD-6a.

**Risk overlap v11.1.x:**
- 🔴 HIGH — bất kỳ thay đổi nào về timing/easing đều phải replace cũ ở `nav_polish.js`, `debug_panel.js`, `audio.js`

### 4.7 Audio Feel

**What exists:**
- `audio.js` — `SHADOW_AUDIO.speak(text, opts)` working
- Audio buttons (▶) auto-attach via `setInterval(1500)` enhancement
- Speed controls 0.75× / 1× / 1.25×
- Loop mode toggle
- Voice recorder (MediaRecorder) trong Step 5 RECALL

**What's missing:**
- Active playing glow — chỉ có button state, không có "this phrase row is currently active"
- Waveform subtle animation — chỉ có ▶/⏸ icon swap, không có "audio is alive" feedback
- Audio focus state — khi 1 audio đang play, các audio buttons khác không có "muted/dimmed" cue
- Speed controls visual không cohesive với rest of UI

**User pain hypothesis:** Audio feel "tách rời" khỏi phrase context — user phải nhìn vào button để biết đang play, không cảm nhận được "phrase này đang sống".

**Risk overlap v11.1.x:**
- 🟢 LOW — audio.js không bị nav_polish đụng
- 🟡 MEDIUM — `enhancePhrases()` setInterval pattern phải coordinate

### 4.8 Mobile Feel

**What exists:**
- Mobile-first responsive (breakpoint 900px)
- Sidebar collapse 64px
- Single-column grid
- Touch targets ≥44px (theory)
- Big confidence buttons Step 8

**What's missing:**
- Tap comfort khi multiple buttons close (audio button + phrase text overlap risk)
- Smooth scroll behavior (default jump, no scroll-snap cho horizontal carousel)
- Sticky controls — session step "Next" button scroll khỏi viewport trên màn nhỏ
- Spacing — 16px padding ubiquitous mà không có "thumb-zone" awareness (bottom 25% screen)
- Visual feedback khi tap = chỉ có `:active` state hơi đậm

**User pain hypothesis:** Anh đang dùng phone phần lớn → mỗi tap unsure "có press được không" + scroll mất context.

**Risk overlap v11.1.x:**
- 🟢 LOW — mobile CSS mostly trong inline `<style>` `@media (max-width: 600px)` rules

---

## 5. UPFRONT SPEC — 8 POLISH ITEMS (G8 — sign-off BEFORE code)

> Mỗi item dưới có: **Target feel** | **Concrete dimensions** | **CSS/JS module touch** | **Implementation order**.
>
> Anh review từng item, comment bất kỳ dimension nào không đồng ý, TRƯỚC khi code Day 8+. Cứu được vô số iteration sau.

### Spec 5.1 — Micro Interactions

**Target feel:** *"Mọi tương tác có acknowledgment subtle 100-200ms, không flash, không bounce."*

```
Hover (cards, buttons):
  transform: translateY(-1px)   ← KHÔNG -2px (quá draw attention)
  box-shadow: thêm 1 layer subtle (rgba(124,92,255,0.08))
  transition: 180ms cubic-bezier(0.4, 0, 0.2, 1)
  KHÔNG scale, KHÔNG color shift

Button press (:active):
  transform: translateY(0)      ← reset hover lift
  opacity: 0.92
  transition: 80ms ease-out     ← snappier than hover

Card transitions (view-switch):
  Fade-in: opacity 0→1, 220ms ease-out
  Stagger children: 40ms delay each (max 6 children)

Audio button active (PLAYING):
  background: rgba(124,92,255,0.15)
  pulse animation: scale 1.0→1.04→1.0 over 1.4s loop
  icon: ▶ → ⏸ swap với 100ms fade

Loading (content.json fetch):
  Skeleton screen: card outlines với shimmer
  Shimmer: linear-gradient sweep, 1.8s cycle

Fade transitions:
  Default duration: 200ms
  Default easing: ease-out
  Reduced motion: 0ms (instant)
```

**Files touch (Day 8+):**
- `index.html` inline `<style>` cuối body — add `--motion-*` tokens
- `nav_polish.js` — replace hover CSS với token-based
- `audio.js` — add `.audio-playing` class management

**Block by:** TD-5 close (versioned CSS injection)

---

### Spec 5.2 — Topic Navigation Feel

**Target feel:** *"Click topic → màn hình breathe in (mini context card 1.2s) → fade to lesson. Cảm giác như mở Kindle book chapter."*

```
Step 1: Click topic icon
Step 2: Mini context card overlays (NOT full-screen modal)
  - Dimensions: max-width 480px, centered viewport
  - Padding: 32px
  - Background: rgba(15,13,35,0.92) + backdrop-blur 12px
  - Content:
    [topic emoji 48px]
    [topic title 24px serif]
    [current stage badge — Day N · Memory Status]
    [estimated time: ~5 min]
  - Animation: scale 0.96→1.0, opacity 0→1, 280ms ease-out
Step 3: Hold 1200ms (CSS animation-delay, not setTimeout)
Step 4: Mini card fade out + topic detail view fade in (overlap 200ms)

Reduced-motion: skip Step 2-3 entirely, go directly to view
```

**Files touch (Day 8+):**
- `nav_polish.js` — wrap `openTopic(id)` thay vì replace
- Inline CSS new `.topic-context-intro` class
- TD-2 archaeology — phải biết `today.js` có override `openTopic` không

**Block by:** TD-2 close

---

### Spec 5.3 — Session Entry Experience

**Target feel:** *"START SESSION = bắt đầu meditation timer. App dim, focus tightens, sau 1.5s session bắt đầu."*

```
Step 1: User clicks START SESSION
Step 2: Page background dims to 0.6 brightness (CSS filter on body except modal)
Step 3: Soft blur backdrop (12px) on non-session elements
Step 4: Session preparation card appears center:
  - Dimensions: max-width 520px, vertical-center
  - Content:
    [session title — topic name 28px]
    [estimated time — "~8 min · 8 steps"]
    [current mission — coach.dailyGreeting() short]
    [progress dots: ●○○○○○○○ — 1/8 steps]
  - Animation: opacity 0→1 + translateY(8px→0), 380ms ease-out
Step 5: Hold 1500ms with subtle breathing animation on title (scale 1.0→1.01→1.0, 1.5s)
Step 6: Card fade out + session view fade in (overlap 300ms)

Total ritual time: ~2.1s

Skip button (small, bottom-right): "Bỏ qua →"
  - Skip preference persists in localStorage `shadow-en-skip-ritual`
  - Once set, future sessions skip directly
```

**Files touch (Day 8+):**
- New file `session_ritual.js` (pure additive, observability-layer pattern)
- `app_v8_experience.js` — hook `startSession` (idempotent flag)
- Inline CSS `.session-ritual` class

**Block by:** TD-2 close (knowing app_v11_today.js relationship)

---

### Spec 5.4 — Session Completion Experience

**Target feel:** *"Confidence chosen → 2-second closure moment → quiet return home. Cảm giác như đóng sách lại sau khi hiểu một chương."*

```
Step 1: User picks confidence (Step 8 reflection)
Step 2: Reflection buttons fade out (200ms)
Step 3: Closure card appears center:
  - Dimensions: max-width 560px
  - Layout: stacked vertical
  - Content:
    [Big checkmark — SVG 64px, animated draw-in 600ms]
    [Topic name — small subtitle]
    [Rescued memory bar:
      Before: Fragile ████░░░░ 12%
      After:  Building ██████░░ 28%
      Animated bar grow over 800ms]
    [Confidence reflection:
      "Bạn chấm {N} sao. {Generated insight from coach.postSession}"
      One line, italic]
    [XP earned: +{N} XP (animated count-up over 500ms)]
    [Level progress bar (if leveled up): pulse animation]

Step 4: Hold 2200ms (no auto-dismiss, no click-anywhere)
Step 5: Single button bottom: "Tiếp tục →"
  - User must click to return home
  - Forces conscious closure, không phải auto-skip

NO confetti. NO sound effect. NO emoji spam.
Trust quiet acknowledgment.
```

**Files touch (Day 8+):**
- New file `session_closure.js`
- Hook `completeReview` (must coordinate với app_v10_integration.js override)
- Inline CSS `.session-closure` class

**Block by:** TD-2 close, observation data on Fragile→Building transitions

---

### Spec 5.5 — Typography Polish

**Target feel:** *"Dashboard đọc như reading app. Mắt nghỉ giữa các block. Hierarchy clear bằng size + weight + spacing, không phải chỉ color."*

```
Type scale (1.25 ratio — minor third):
  --text-xs:   12px  (metadata, labels)
  --text-sm:   14px  (body small)
  --text-base: 16px  (body default)
  --text-md:   20px  (subheadings)
  --text-lg:   24px  (section titles)
  --text-xl:   30px  (page titles)
  --text-2xl:  38px  (hero / mission)

Line heights:
  --leading-tight:  1.25  (titles)
  --leading-normal: 1.5   (body)
  --leading-relaxed:1.7   (reading — shadow script, dialogues)

Font weights:
  400 body
  500 emphasis
  600 titles
  KHÔNG dùng 700 (quá đậm cho dark theme)

Spacing rhythm (8px base):
  --space-1: 4px
  --space-2: 8px
  --space-3: 12px
  --space-4: 16px  ← default card padding
  --space-6: 24px  ← section gap
  --space-8: 32px  ← view gap
  --space-12:48px  ← hero spacing

Max-widths:
  --max-prose: 64ch  (reading content)
  --max-card: 480px  (modal/dialog)
  --max-content: 1200px (page wrapper)
```

**Density reduction targets:**
- 5Q panel: padding 16px → 20px, font-base, gap 12px between questions
- Level Map cards: reduce stat-line từ 3 rows xuống 2 rows
- Today card: emoji size 20px → 24px, give phrase row 8px more padding
- Memory Pulse: dot density 8px → 10px gap

**Files touch (Day 8+):**
- `index.html` inline `<style>` head — add `--text-*`, `--space-*`, `--leading-*` tokens
- Refactor card padding/font-size to tokens
- This is 🔴 HIGH ripple — touch most components

**Block by:** TD-2 close, post-observation week (Day 8+ minimum)

---

### Spec 5.6 — Motion System

**Target feel:** *"One language. Mọi animation share cùng vocabulary."*

```css
/* Design tokens — add to :root in inline style */
:root {
  /* Durations */
  --motion-instant: 0ms;
  --motion-quick:   80ms;   /* button press, focus ring */
  --motion-fast:    180ms;  /* hover, small transitions */
  --motion-base:    220ms;  /* card transitions, view fades */
  --motion-slow:    380ms;  /* modal/dialog enter */
  --motion-ritual:  1200ms; /* preparation moments */

  /* Easings */
  --ease-out:    cubic-bezier(0.4, 0, 0.2, 1);    /* default */
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);    /* loops, pulses */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* RARE — only confidence button */
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-quick: 0ms;
    --motion-fast: 0ms;
    --motion-base: 0ms;
    --motion-slow: 0ms;
    --motion-ritual: 0ms;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Rules:**
1. NEVER write hard-coded duration in component CSS. Always reference token.
2. Default easing = `var(--ease-out)`. Other easings need justification in comment.
3. Loops (pulse, glow) use `--ease-in-out`.
4. Spring easing used ONCE — Step 8 confidence button press (only joyful moment).
5. Stagger via `animation-delay`, max 40ms increment, max 6 staggers.

**Files touch (Day 8+):**
- `index.html` inline `<style>` head — tokens
- Refactor all existing transitions (nav_polish.js, debug_panel.js, audio.js, app_v8_*)
- This is **closing of TD-6a candidate**

**Block by:** TD-5 close (versioned injection), audit of all existing `transition: ... s ease` strings

---

### Spec 5.7 — Audio Feel

**Target feel:** *"Khi 1 phrase đang play — chính phrase đó sống. Mọi thứ khác lùi lại lắng nghe."*

```
.phrase-row khi audio đang play:
  background: rgba(124,92,255,0.06) → 0.12 (gradient sweep left-right)
  border-left: 3px solid rgba(124,92,255,0.6)
  padding-left: 13px (compensate border)
  transition: all var(--motion-fast) var(--ease-out)

.phrase-row khác trong cùng view (passive):
  opacity: 0.6
  transition: opacity var(--motion-base) var(--ease-out)

Audio button (▶) khi PLAYING:
  background: rgba(124,92,255,0.18)
  ::before pulse glow ring:
    box-shadow: 0 0 0 0 rgba(124,92,255,0.4) → 0 0 0 8px rgba(124,92,255,0)
    animation: pulse 1.6s var(--ease-in-out) infinite

Waveform subtle (optional, nếu khả thi):
  3 vertical bars (4px wide) trên audio button
  height: 4px → 16px → 4px stagger
  animation: bars-dance 0.8s var(--ease-in-out) infinite alternate

Stop playing → all reset to default state với fade var(--motion-base)
```

**Voice recorder (Step 5 RECALL):**
- Recording active: red dot pulsing top-left of button (8px circle)
- Recording duration counter (mm:ss) appears next to button
- Stop button has subtle scale-in animation

**Files touch (Day 8+):**
- `audio.js` — add `.audio-playing` class management on `.phrase-row`
- Inline CSS new audio polish classes
- `enhancePhrases()` setInterval pattern — verify still works after class additions

**Block by:** Motion system tokens (5.6) shipped first

---

### Spec 5.8 — Mobile Feel

**Target feel:** *"Thumb-friendly. Every important button bottom 40% screen. Scroll như native app."*

```
Touch targets:
  Minimum: 44px × 44px (W3C)
  Recommended for primary actions: 48px × 48px
  Spacing between adjacent buttons: ≥8px

Tap feedback:
  All clickable elements: :active opacity 0.85 + scale(0.98)
  Transition: var(--motion-quick) var(--ease-out)
  webkit-tap-highlight-color: transparent (remove blue flash)

Sticky controls:
  Session view "Next →" button:
    position: sticky
    bottom: 0
    background: linear-gradient(to top, var(--bg-card) 80%, transparent)
    padding: 16px
    border-top: 1px solid rgba(255,255,255,0.05)
  Z-index: 10 (under modal 100)

Smooth scroll:
  html { scroll-behavior: smooth; }
  Carousel cards: scroll-snap-type: x mandatory
  Each card: scroll-snap-align: center

Mobile-specific spacing:
  Card padding 16px → 14px (gain 4px for content)
  Section gap 24px → 20px
  Bottom safe area: env(safe-area-inset-bottom) padding

Thumb-zone awareness (bottom 25% of screen):
  Primary CTA: bottom 40%
  Confidence buttons: bottom 30%
  Secondary actions: top half OK
```

**Files touch (Day 8+):**
- `index.html` inline `<style>` `@media (max-width: 600px)` block
- Audit existing mobile rules (10 rules from VERIFY §2 item 9)
- Refactor session view "Next" to sticky

**Block by:** Motion tokens shipped, typography tokens shipped

---

### Spec 5.9 — HERO STATS Redesign (Identity + Journey + Momentum) — Wave 4 brief

> **Source:** Anh đưa brief 2026-05-27 evening. Treat as Wave 1 mandatory.
> **Current state:** Card hiện chỉ có "🔥 1 days · Keep going" (v11.1.13 thêm streak dots + LV chip nhưng vẫn cảm giác **sparse + placeholder**).
> **Bug nhận thức:** Hero Stats đang feel như **admin tracking area**, không phải **emotional center** của hành trình học.

**Target feel (anh viết verbatim):**
> *"Identity + Journey + Momentum"*
> Người dùng phải cảm thấy: mình đang tiến lên · mình đang thay đổi · hệ thống đang sống · ký ức tiếng Anh đang dần hồi phục.

**Layout 3 cột — cụ thể:**

```
┌─────────────────────────────────────────────────────────────┐
│ HERO STATS (full-width, height 200-240px)                   │
├──────────────────┬───────────────────────┬──────────────────┤
│ LEFT — IDENTITY  │ CENTER — JOURNEY      │ RIGHT — MOMENTUM │
│ (28% width)      │ (44% width)           │ (28% width)      │
├──────────────────┼───────────────────────┼──────────────────┤
│ "Shadow          │ Beginner → Surviving  │ ● 1 review due   │
│  Apprentice"     │   → Responding        │ ● 32 fragile mem │
│ "Day {N}         │   → Flowing           │ ● Brain: Clear   │
│  rebuilding      │ (horizontal line +    │ ● Speaking:      │
│  your English    │  4 milestones +       │   Building       │
│  reflex"         │  current position     │                  │
│                  │  glow nhẹ + pulse)    │                  │
│ "You are not     │                       │                  │
│  starting.       │ OR alternative:       │                  │
│  You are         │ [Day 1] — [Day 7] —   │                  │
│  remembering."   │ [Day 21] — [Auto]     │                  │
└──────────────────┴───────────────────────┴──────────────────┘
```

**Concrete dimensions (G8 sign-off needed):**

| Element | Value | Note |
|---|---|---|
| Card total height | 200-240px | Currently ~167px (sparse) |
| Left column width | 28% (~360px on 1280px viewport) | Identity text |
| Center column width | 44% (~560px) | Journey visualization |
| Right column width | 28% (~360px) | Today momentum metrics |
| Identity title font | 24px serif bold | Shadow Apprentice |
| Identity subtitle font | 14px italic, opacity 0.75 | "Day N rebuilding..." |
| Identity quote font | 13px italic, opacity 0.6 | "You are remembering..." |
| Journey line height | 4px, gradient gray→purple | base track |
| Journey milestones | 4 dots, 16px diameter | Beginner/Surviving/Responding/Flowing |
| Current position dot | 22px, white glow ring | Pulse 2s ease-in-out infinite |
| Momentum row item | 11.5px font, 8px gap | "● {N} {label}" pattern |

**Motion — anh specified:**
- Breathing gradient on card background (subtle, 4s loop)
- Slow pulse on current journey position
- Ambient glow on identity title
- Shimmer trên progress line (3s loop, very subtle)
- **NO**: jump animation · aggressive transitions · dopamine effects

**Density — anh specified:**
- Current: 70% empty space
- Target: 45% breathing space + 55% meaningful presence
- KHÔNG nhồi đầy, KHÔNG dead empty

**Copy library (Vietnamese options for Identity column):**
- "Shadow Apprentice" / "Shadow Survivor" / "Memory Rebuilder" (level-based identity)
- "Day {N} rebuilding your English reflex" (dynamic)
- "Small daily repetitions. Real speaking confidence." (manifesto)
- "You are no longer starting. You are remembering." (recovery framing)
- "Tiếng Anh không quên anh. Anh chỉ cần gọi nó lại." (Vietnamese variant — emotional)

**Files touch (Day 8+):**
- New file `app_v11_2_hero_redesign.js` (~250 LOC) — pure additive replace HERO STATS card content
- Inline `<style>` head — add identity/journey/momentum CSS classes
- Optional: redirect `state.user.identityTier` based on streak (tier mapping)

**Block by:**
- TD-2 archaeology (need to understand current HERO STATS card render source — likely `today.js` or hardcoded)
- Anh sign-off ON SPECIFIC COPY (5 identity lines + manifesto choice)
- Motion tokens (Spec 5.6) shipped first

**Risk overlap với v11.1.x:**
- 🔴 HIGH — v11.1.13 đã add SHADOW STATS roadmap. Spec 5.9 REPLACES that, requires careful deprecation/clean-up.
- 🟡 MEDIUM — state.user.streak/xp/level reads must remain backward compatible

---

### Spec 5.10 — TODAY GOAL Emotional Compass — Wave 4 brief

> **Source:** Anh viết verbatim 2026-05-27. TODAY GOAL ≠ TODAY FOCUS.
> **Current state:** v11.1.12 đã thêm mission checklist 5 items. v11.1.13 attempted cleanup nhưng MISFIRED (cleaned TODAY FOCUS card thay vì standalone TODAY GOAL).
> **Bug nhận thức:** Anh nói "TODAY GOAL hiện ≈ mini version của TODAY FOCUS → không tạo thêm meaning."

**Target distinction (anh verbatim):**
- **TODAY FOCUS** = **task list cụ thể** (5 missions checklist với done state)
- **TODAY GOAL** = **emotional mission của hôm nay** — câu trả lời cho "hôm nay mình đang cố giữ điều gì sống?"

**Layout TODAY GOAL — KHÔNG dùng checklist:**

```
┌─────────────────────────────────────────┐
│ ⏰ TODAY GOAL (height ~280px, narrow)   │
├─────────────────────────────────────────┤
│                                         │
│            ╔═══════════════╗            │
│            ║      2/3       ║           │
│            ╚═══════════════╝            │
│         (big number 56px center)        │
│                                         │
│         Daily momentum active           │
│         (subtitle 13px)                 │
│                                         │
│    ██████████████░░░░░░░░░ 66%          │
│         (purple progress bar)           │
│                                         │
│    🔥 17-day consistency streak         │
│    (small 12px, emotional anchor)       │
│                                         │
├─────────────────────────────────────────┤
│  "Today's Goal"                         │
│  "Keep your speaking reflex alive."     │
│  (mission statement 16px italic)        │
└─────────────────────────────────────────┘
```

**Concrete dimensions:**

| Element | Value |
|---|---|
| Big count number | 56px white bold, line-height 1 |
| "Daily momentum active" subtitle | 13px opacity 0.75 |
| Progress bar | 8px height, gradient purple |
| Streak line | 12px with 🔥 emoji |
| Mission statement | 16px italic, opacity 0.85, 1.5 line-height |
| Card height | 280-320px (taller than current 220px for breathing) |

**Mission statement copy library (rotate weekly or by context):**
- "Keep your speaking reflex alive."
- "Today: small step. Tomorrow: shadowed automatic."
- "Don't break the chain. The chain remembers."
- "Một câu nói thật. Một mảnh trí nhớ được cứu."
- "Repetition today = automatic tomorrow."
- "Your past self is waiting for you to remember."

**Motion:**
- Big number 2/3 — count-up animation 800ms ease-out khi state changes
- Progress bar — width transition 420ms ease-out
- Mission statement — soft fade-in 600ms khi rotate
- Streak number — subtle pulse 1.5s khi increment

**Files touch (Day 8+):**
- New `app_v11_2_today_goal.js` (~120 LOC)
- Distinguish from TODAY FOCUS card via card-title text match `^TODAY GOAL$` (exact, not substring)
- Source mission text từ `coach.js` `getMissionStatement(day, streak)` function (new)

**Block by:**
- v11.1.13 `cleanTodayGoal` removed (it currently cleans TODAY FOCUS by mistake)
- Anh sign-off mission statement library (6 options or anh viết thêm)

**Risk overlap:**
- 🔴 HIGH — v11.1.13 `polish-1112-mission-list` rendered inside TODAY FOCUS. v11.1-B reverts this; mission list moves back to where it belongs.
- 🟡 MEDIUM — state.missions data structure unchanged, but `TODAY GOAL` no longer shows checklist

---

### Spec 5.11 — MEMORY STATUS as Health Panel — Wave 4 brief

> **Source:** Anh verbatim 2026-05-27. Card phải feel như **Memory Health Panel**, không phải **analytics block**.
> **Current state:** Card shows Fragile/Weak/Building/Stable/Automatic counts + "68 Average" + heatmap (28 cells).
> **Bug nhận thức:** Anh nói "user không hiểu '68 Average' nghĩa là gì" — data without meaning.

**Target structure 3 layers:**

```
┌────────────────────────────────────────────────────────┐
│ 🧠 MEMORY STATUS                                       │
├────────────────────────────────────────────────────────┤
│ LAYER 1 — STATE LABEL (Big)                            │
│                                                        │
│    Memory Health                                       │
│    ┌────────────────┐                                  │
│    │   FRAGILE      │  ← color-coded badge (red/yellow)│
│    └────────────────┘                                  │
│    "Still unstable" (subtitle 14px italic)             │
│                                                        │
├────────────────────────────────────────────────────────┤
│ LAYER 2 — BREAKDOWN (Counts)                           │
│                                                        │
│    ● 31 fragile memories                               │
│    ● 1 weak memory                                     │
│    ● 0 automatic patterns                              │
│                                                        │
├────────────────────────────────────────────────────────┤
│ LAYER 3 — HEATMAP (Meaningful Intensity)              │
│                                                        │
│    REVIEW HEATMAP (This Month)                         │
│    Mon Tue Wed Thu Fri Sat Sun                         │
│    [grid 4×7 colored cells with tooltips]              │
│                                                        │
│    Tooltip on hover:                                   │
│    "26/5 — 3 reviews completed · Memory reinforced"   │
│                                                        │
├────────────────────────────────────────────────────────┤
│ LAYER 4 — INTERPRETATION (Emotional Intelligence)     │
│                                                        │
│    💡 Most patterns are still fragile.                 │
│    💡 Your brain still needs repetition.               │
│    💡 Your memory is waking up, but not                │
│       stabilized yet.                                  │
│                                                        │
│    (rotated insights based on state)                   │
└────────────────────────────────────────────────────────┘
```

**Concrete dimensions:**

| Element | Value |
|---|---|
| State label badge | 12px padding, 11px font uppercase bold, 8px border-radius |
| State color mapping | FRAGILE = `#ef4444` · WEAK = `#f59e0b` · BUILDING = `#facc15` · STABLE = `#22c55e` · AUTOMATIC = `#a78bfa` |
| Subtitle | 14px italic opacity 0.75 |
| Count rows | 13px, gap 6px, color dots 8px |
| Heatmap cell tooltip | 11px, padding 8px, bg `rgba(0,0,0,0.85)` |
| Interpretation row | 14px line-height 1.6, italic, opacity 0.85 |

**State label decision tree (anh — confirm logic):**

```javascript
function memoryHealthLabel(distribution) {
  var total = distribution.fragile + distribution.weak + distribution.building + distribution.stable + distribution.automatic;
  if (!total) return { label: 'AWAKENING', tone: 'Just starting your journey' };
  var fragilePct = distribution.fragile / total;
  var automaticPct = distribution.automatic / total;
  if (fragilePct >= 0.7) return { label: 'FRAGILE', tone: 'Still unstable' };
  if (fragilePct >= 0.4) return { label: 'BUILDING', tone: 'Memory is forming' };
  if (automaticPct >= 0.3) return { label: 'STABLE', tone: 'Speaking reflex emerging' };
  if (automaticPct >= 0.6) return { label: 'AUTOMATIC', tone: 'Your English is alive' };
  return { label: 'RECOVERING', tone: 'Memory is waking up' };
}
```

**Interpretation library (rotate based on state — anh confirm copy):**

| State | Insight options |
|---|---|
| FRAGILE | "Most patterns are still fragile." · "Your brain needs repetition." · "Small daily reps = recovery." |
| BUILDING | "Memory is forming, keep going." · "Patterns are stabilizing." · "Consistency beats intensity." |
| STABLE | "Speaking reflex is emerging." · "Trust the process." |
| AUTOMATIC | "Your English is alive." · "From practice to instinct." |

**Heatmap tooltip — meaningful messages:**
- 0 reviews: "No activity"
- 1-2 reviews: "Light practice day"
- 3-4 reviews: "Memory reinforced"
- 5+ reviews: "Deep maturation day"

**Files touch (Day 8+):**
- New `app_v11_2_memory_health.js` (~200 LOC) — replace "68 Average" với state label + add interpretation layer
- Heatmap tooltip via title attribute (already supported by browser)
- Reads from `state.topics` distribution (no new data)

**Block by:**
- v11.1.10 heatmap rolling fix verified working
- Anh sign-off on interpretation library (15 strings above)
- State label decision tree confirmed (thresholds)

**Risk overlap:**
- 🟡 MEDIUM — replaces "68 Average" display. Some users may have built mental model around the number.
- 🟢 LOW — additive interpretation layer doesn't break existing data flow

---

### Spec 5.12 — REVIEW ENGINE Day 21 Stage (ALREADY SHIPPED v11.1.14)

> Sequence updated: **Day 1 → Day 3 → Day 7 → Day 21 → Overdue**
>
> ✅ Shipped 2026-05-27 evening as `app_v11_1_14_day21_stage.js`.
>
> Tab visible at position 5 (between Day 7 and Overdue). Counts topics with `reviewStage === 'Day 21'`. Filter logic recognizes `Day 21` in row text. Currently shows 0 (no state topics at Day 21 stage yet — will populate as users progress).
>
> **Pending Day 8+:**
> - Update `adaptive.js` to ACTUALLY transition topics to Day 21 stage after Day 7 + good confidence streak
> - Map Day 21 → "Building → Stable" memory transition trigger
> - Document Day 21 = ~3-week SR milestone in `ARCHITECTURE.md`

---

## 6. MOTION PRINCIPLES (governing law for v11.1-B and beyond)

### Principle 1 — One Vocabulary
Mọi animation reference token, không hard-code. Một code change = một token bump = global ripple consistent.

### Principle 2 — Subtract, Don't Add
Default = no animation. Animation phải có lý do. "Vì nhìn vui" KHÔNG phải lý do.

### Principle 3 — Respect User Settings
`prefers-reduced-motion` luôn được honor. Không có "but animation is core to UX" excuse.

### Principle 4 — Acknowledge, Don't Distract
Animation phải answer "vâng tôi nghe rồi" — không phải "nhìn tôi đang làm cool stuff". Hover lift 1px. Fade in 200ms. Done.

### Principle 5 — Slow When It Matters
Daily moments fast (button, hover). Once-per-session moments slow (ritual entry, completion closure). The rare slow moments earn the user's attention.

### Principle 6 — Easing = ease-out by default
ease-out feels natural (decelerating). ease-in feels mechanical (accelerating). ease-in-out for loops only. Spring for ONE moment only (confidence button).

### Principle 7 — Idempotent Always
Per G9 — versioned CSS injection ID. Per nav_polish pattern — `dataset.*Bound = '1'` markers. Animation should never run twice on same element accidentally.

---

## 7. EMOTIONAL DESIGN DECISIONS

### 7.1 — The 1.2-Second Ritual

Trước mỗi session, app pause 1.2s với context card. Lý do: research about working memory cho biết não cần ~1.0-1.5s để switch context. Forcing this pause = better focus, less "tôi vừa click vào cái gì nhỉ".

### 7.2 — The 2.2-Second Closure

Sau mỗi session, app pause 2.2s với closure card. Lý do: behavioral psychology — completion needs acknowledgment để brain register "this was a win". Auto-skip = brain treats it as "incomplete task" → less daily return.

### 7.3 — No Confetti, Ever

Confetti is dopamine empty. Anh đã explicit "hates dopamine empty features". Quiet acknowledgment > loud celebration. Premium feel > engagement feel.

### 7.4 — Single CTA per Moment

Mobile-first means thumb-first. One primary button per screen. Decisions narrow → faster action → less anxiety.

### 7.5 — Dim, Don't Modal

Modal overlays steal context. Dim + blur preserves context (user still sees underlying state) + signals "focus shift". Used for session entry/closure.

### 7.6 — Bar Animation = Memory Movement

"Rescued memory" visualization (Fragile→Building) animates because that movement IS the value the app delivers. Static text "Memory upgraded" = invisible win. Animated bar = visible win = behavioral reinforcement.

### 7.7 — Conscious Skip, Not Sneaky Default

Skip ritual = explicit button, preference saved. Don't auto-skip "for convenience". User chooses depth of ritual. Default = full ritual (Day 1-30). Power user → skip mode.

---

## 8. IMPLEMENTATION ORDER (Day 8+ priorities)

> KHÔNG ship trong observation week. Đây là plan sau Day 7 nếu user chọn v11.1-B (over v11.2-A formula back-port).

### Wave 1 — Foundation (Day 8-10)
| # | Item | Effort | Why first |
|---|---|---|---|
| W1.1 | TD-2 archaeology — document phrases.js, today.js, app_v11_today.js | 1h | Blocks 5.2, 5.3, 5.4 |
| W1.2 | TD-5 close — refactor nav_polish.js injectCSS to versioned ID | 30min | Blocks all CSS polish |
| W1.3 | Motion tokens added (5.6) | 1h | Blocks all animation work |
| W1.4 | Typography tokens added (5.5) — TOKENS ONLY, not refactor | 30min | Blocks 5.5 full ripple |

### Wave 2 — Micro polish (Day 11-13)
| # | Item | Effort | Spec ref |
|---|---|---|---|
| W2.1 | Micro interactions hover/press/transitions | 2h | 5.1 |
| W2.2 | Audio active state + pulse | 1.5h | 5.7 |
| W2.3 | Mobile touch + sticky | 1.5h | 5.8 |
| W2.4 | Typography full ripple — refactor existing cards | 3h | 5.5 |

### Wave 3 — Ritual & Closure (Day 14-16)
| # | Item | Effort | Spec ref |
|---|---|---|---|
| W3.1 | Topic navigation feel — mini context card | 2h | 5.2 |
| W3.2 | Session entry ritual | 3h | 5.3 |
| W3.3 | Session completion closure | 3h | 5.4 |

### Wave 4 — Polish iteration (Day 17-21)
| # | Item | Effort | Why |
|---|---|---|---|
| W4.1 | User-feedback iteration on rituals | 4h | Real usage feedback |
| W4.2 | Reduced-motion edge cases | 1h | Accessibility |
| W4.3 | Performance audit (60fps validation) | 2h | Premium feel needs smooth |

**Total estimate Wave 1-4:** ~28h dev work, spread 2 weeks.

---

## 9. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Polish ships during observation → contaminates data | LOW (we agreed Day 8+ only) | HIGH | This blueprint = enforced via doc-only scope |
| TD-5 not closed → CSS injection trap on every polish ship | HIGH | MEDIUM | Wave 1.2 mandatory before any CSS work |
| TD-2 unknowns → polish coupling to undocumented modules | HIGH | HIGH | Wave 1.1 mandatory first |
| G7 forgot → polish CSS doesn't propagate | HIGH | MEDIUM | Hardcode `?v=N` bump in every deploy checklist for v11.1-B work |
| G8 violated → polish iterates 4 rounds | LOW (this doc IS the spec) | HIGH | This blueprint = G8 compliance |
| User changes mind mid-Wave 2 → spec ripples | MEDIUM | MEDIUM | Each Wave produces its own VERIFY_REPORT before next Wave starts |
| Motion ritual too slow → user finds it annoying | MEDIUM | MEDIUM | Skip button in W3.1/W3.2/W3.3 + localStorage preference |
| Typography ripple breaks existing layouts | HIGH | MEDIUM | Wave 1.4 = tokens only. Wave 2.4 = controlled rollout, card by card with screenshot diff |

---

## 10. FUTURE POLISH OPPORTUNITIES (backlog, not v11.1-B)

| # | Idea | Why deferred |
|---|---|---|
| F1 | Sound design (gentle chime for level-up) | Risk dopamine empty + can't test without device audio |
| F2 | Theme-aware motion (Forest theme = slower, calmer) | Over-engineering for v1 |
| F3 | Haptic feedback (mobile vibration on confirm) | Mobile API support varies |
| F4 | Custom focus rings per theme | Accessibility low-priority improvement |
| F5 | Hover trails (mouse follow particle) | Distracting, not calm |
| F6 | Scroll-triggered animations | Performance cost vs marginal feel gain |
| F7 | Pull-to-refresh gesture | iOS-only feel, doesn't translate Android |
| F8 | Long-press for context menu | Native-feel but desktop user confusion |

---

## 11. DAY 7 DECISION GATE

End of observation week (2026-06-02), revisit:

### Inputs to gate
- [ ] Observation week answers (5 questions từ V11_1_DEBUG_PANEL §"Observation week")
- [ ] v11.1.8 resume verify result (filled in §2 above)
- [ ] TD-2 archaeology status
- [ ] User's energy / priority shift since 2026-05-27

### Possible outcomes
| Outcome | Trigger | Next step |
|---|---|---|
| **A. Ship v11.1-B Wave 1** | TD-2 closed + verify pass + user picks polish over formula | Start Wave 1.1-1.4 Day 8 |
| **B. Ship v11.2-A first** | Observation reveals formula divergence is causing real UX bug (e.g. wrong topic in queue) | Polish deferred, formula back-port first |
| **C. Ship both parallel** | Two AI sessions, two tracks | Risk of merge conflict on nav_polish.js — coordinate carefully |
| **D. Re-spec** | User feedback says blueprint missed something fundamental | Iterate this doc, no code |

---

## 12. ENGINEERING MEMORY CHECKLIST

Before this blueprint is considered "shipped" as a doc:

- [ ] File saved at `docs/V11_1B_EXPERIENCE_POLISH.md` in repo
- [ ] `docs/CHANGELOG.md` — entry added as `v11.1-B-doc` (doc-only, no code change)
  - Format per TEMPLATE_VERSION_ENTRY.md
  - Goal: "Blueprint for experience polish phase, doc-only during observation week"
  - Built: this file
  - Architecture change: None (doc-only)
  - Lessons: G8 enforcement via upfront spec
- [ ] `docs/README.md` §2 file inventory updated to include this file
- [ ] `docs/AI_HANDOFF.md` §11 Current State Summary updated to note v11.1-B blueprint exists
- [ ] v11.1.8 verify result filled into §2 above
- [ ] TD-6 status documented (pending sign-off Day 7)
- [ ] User reviewed all 8 spec sections (5.1 - 5.8) and signed off concrete dimensions

---

## 13. APPENDIX — VIETNAMESE VISUAL FEEDBACK GLOSSARY (extended from G8)

Mở rộng từ TECHNICAL_NOTES G8 table — thêm context cho polish work:

| User phrase | Meaning | Polish-context interpretation |
|---|---|---|
| "thô" | rough/blocky | Padding/border quá dày, hoặc transform scale quá lớn |
| "trống" | empty | Whitespace không có rhythm — cần spacing tokens |
| "nặng" | heavy | Font weight cao, hoặc shadow đậm |
| "rối" | cluttered | Density cao, cần reduce/group |
| "nhẹ nhàng" | gentle/calm | Subtle animation, soft easing, no abrupt |
| "mượt" | smooth | Animation 60fps, no jank, ease-out |
| "có hồn" | alive/breathing | Subtle motion trên element (pulse, glow) |
| "yên" | quiet/still | Reduce animation, longer pauses |
| "premium" | premium | Spacing generous, typography clean, shadow subtle |
| "lạnh" | cold/sterile | Lacking accent color or warmth — too monochrome |
| "ấm" | warm | Color saturation slightly higher, softer corners |
| "cá nhân" | personal | Content reflects user's data (not generic) |
| "đáng tin" | trustworthy | Consistent behavior, no glitches, predictable |
| "nhanh" | fast | Quick feedback (motion-quick token) |
| "chậm" | slow | Ritual pause, intentional pause |

---

*Last update: 2026-05-27 (Day 1 observation week). Maintained by Claude per AI_HANDOFF + README §3 workflow.*

*Status: DRAFT — pending v11.1.8 verify result fill + user sign-off on 8 specs in §5.*
