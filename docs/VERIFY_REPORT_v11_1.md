# ✅ VERIFY REPORT — v11.1 STABILIZE

> Closing report for v11.1 "Internal Insight Panel" + post-deploy stabilization.
> Run date: 2026-05-26 evening. Run by: Claude (next-AI handoff).

---

## 0. TL;DR

- **Panel: WORKING** on live (`?debug=1&v=11.1`).
- **Deploy: FIXED** after 5 GitHub Pages build failures (root cause = infra-level, NOT code).
- **State schema: INTACT** — no new fields on `state.topics[*]`.
- **localStorage: CLEAN** — only 1 new key (`shadow-en-debug-mode`).
- **No console errors** from app code.
- **Script injection: idempotent** (1 instance of `debug_panel.js`).
- **Mobile CSS rules: present** (10 rules under `@max-width:600px`).
- **Documentation gap surfaced:** 3 v11 scripts (phrases.js, today.js, app_v11_today.js) shipped but not in CHANGELOG.
- **Tech debt opened:** Node.js 20 deprecation warning on every Pages build → classified `technical-debt-v11.2-pre`.

Verdict: **v11.1 PASSED** — eligible to enter the 7-day observation week.

---

## 1. ENVIRONMENT

| Item | Value |
|---|---|
| Live URL | https://truongcrm.github.io/shadow-english-dashboard/?debug=1&v=11.1 |
| Build attempt | #22 attempt 2 (after re-run) |
| Build duration | 18s |
| Total deploy duration | 1m 1s |
| Commit deployed | `6dd7b46` on `main` |
| Service Worker | Active, controlling page (sw.js) |
| Browser | Chrome (via Claude in Chrome MCP) |

---

## 2. USER CHECKLIST RESULTS (10 items)

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Today card render đúng | ✅ PASS | Visible top of `#view-home`, prompt "Tối yên tĩnh. Review chậm, để chữ thấm." rendered |
| 2 | Rescue Queue đúng state | ✅ PASS | 0 queued today (no topic with `nextReview ≤ today`); panel header "0 in queue today" matches |
| 3 | Survival Phrases không duplicate | ✅ PASS | `SHADOW_DEBUG.survivalPatterns()` returns `[]` (queue empty → no patterns possible) |
| 4 | Memory Pulse smooth | ✅ PASS | "MEMORY PULSE · 32 TOPICS ĐANG SỐNG" row visible with dot density correct |
| 5 | Debug panel toggle OK | ✅ PASS | `?debug=0` → `panel_exists:false, isEnabled:false`. `?debug=1` → panel restored. localStorage persists. |
| 6 | No console errors | ✅ PASS | Only 1 console message — from a Chinese browser extension `sidebar.js`, not from Shadow English |
| 7 | SW cache không giữ bản cũ | ✅ PASS | `navigator.serviceWorker.controller.scriptURL` = sw.js; live serving v11.1 build immediately after deploy |
| 8 | Script injection không duplicate | ✅ PASS | `document.querySelectorAll('script[src*="debug_panel"]').length` = 1 |
| 9 | Mobile layout không vỡ | ✅ PASS (code-verified) | 10 CSS rules confirmed at `@media (max-width: 600px)` for `.dbg-*` and `#debug-panel-host`. **Limitation:** chrome window can't render <1024px viewport for visual test. |
| 10 | Related topic data đúng | ⚪ NOT TESTED | Topic detail view not navigated to. Defer to observation week (any anomaly user spots gets logged). |

**Score:** 9 passed · 0 failed · 1 deferred.

---

## 3. HANDOFF §6 STRICT CHECKS (additional)

### Toggle behavior
- ✅ `?debug=1` → panel appears
- ✅ `?debug=0` → panel removed + localStorage `shadow-en-debug-mode` = `'0'`
- ✅ Reload without query → panel persists from localStorage
- ✅ `SHADOW_DEBUG.isEnabled()` returns correct boolean
- ⚪ Click `×` / `−` / header — not visually clicked through Chrome MCP; CSS+JS handlers present

### Data correctness
- ✅ `SHADOW_DEBUG.memoryDistribution()` = `{Fragile:30, Weak:1, Building:1, Stable:0, Automatic:0}` — sum = 32 = `topics.length` ✓
- ✅ `SHADOW_DEBUG.rescueRanking(3)` returns array with proper shape: `{topic, risk, salvageability, breakdown}` per row
- ✅ `SHADOW_DEBUG.forgetRiskBreakdown('L1-01')` = `{total:0.27, components:{age:{value:0,label:"0d since review"}, memory:{value:0.12,label:"Building"}, confidence:{value:0.15,label:"no history"}, adaptive:{value:0,label:"stable trend"}}}` — sum of components = total ✓
- ✅ Never-reviewed topic (L1-03): age value `0.3` capped, label `"never reviewed"` ✓
- ✅ Top 3 ranking by salvageability (descending): L1-01 (0.081) > L1-03 (0.08) > L1-04 (0.08) ✓

### State integrity (CRITICAL)
- ✅ `Object.keys(shadowEN.state.topics[0])` = `["id","emoji","name","level","reviewStage","memoryStatus","lastReview","nextReview","masteryPct","confidence","sessions"]` — **11 keys, identical to pre-v11.1 schema. ZERO new fields.**
- ✅ `localStorage` keys: `shadow-en-state-v3`, `shadow-en-layout-overrides`, `shadow-en-debug-mode` — only the 3rd is new for v11.1.

### Style / calm
- ✅ Monospace data, sans-serif titles confirmed via screenshot
- ✅ Dark `rgba(15,13,35,0.96)` background + purple #7c5cff accent matches `--purple` theme variable
- ✅ Pink #ec4899 reserved for QUEUED pill (not visible right now because queue empty — correct behavior)
- ✅ No animation, no extra emoji (only the purple dot indicator in header)

---

## 4. EDGE CASES & OBSERVATIONS

### E1. Formula divergence (intentional per HANDOFF G3)
Comparing same topic L1-01 (first topic):

| Source | Forget risk value |
|---|---|
| `SHADOW_ADAPTIVE.calculateForgetRisk(t)` | **0.014** |
| `SHADOW_DEBUG.forgetRiskBreakdown(t.id).total` | **0.270** |

→ ~19× difference. Designed-divergence per panel's transparent formula. This is **the exact observation v11.1 was built to surface**. Decision point at end of observation week: back-port panel formula into `adaptive.js`, or keep adaptive's gentler curve. See V11_1_OBSERVATIONS.md (to be created Day 7).

### E2. Documentation gap — v11 ships unaccounted for
Live site loads these modules NOT in CHANGELOG (which ends at v10):

```
phrases.js?v=11
today.js?v=11
app_v11_today.js?v=11
```

CHANGELOG history must be reconciled. Either these are a v11.0 work-in-progress that shipped without changelog entry, OR they were renamed from earlier modules. Either way: **archaeology task** before v11.2 ships. Tracked as gap item below.

### E3. `getTodayQueue` not exposed on `window.shadowEN`
`shadowEN_keys` = `["state","render","awardXP","completeSession","startSession","completeReview","toast","reset"]`. The queue calculator (presumably in `app_v10_integration.js` or `app_v11_today.js`) is internal. Panel computes its own queue check via `topic.nextReview <= today`. **Not a bug** — just a closed API. Worth exposing for future tooling.

### E4. Mobile visual test bypassed
`resize_window(380, 800)` ran but Chrome did not honor sub-1024px viewport (likely OS-level minimum window size). Mobile behavior validated via CSS rule inspection (`@media (max-width: 600px)` × 10 rules confirmed). Visual mobile verification = pending physical phone test by user.

---

## 5. DEPLOYMENT INCIDENT — root cause + recovery

### Symptom
Live site `?debug=1&v=11.1` returned dashboard but no debug panel — even after hard refresh.

### Initial (wrong) hypothesis
HANDOFF §4 protocol pointed at: (1) SW cache, (2) script path, (3) JS runtime error, (4) CSS z-index. All client-side.

### Actual root cause
**GitHub Pages build pipeline failed 5 times in a row** (`pages-build-deployment` #18, #19, #20, #21, #22). Each failed in 3 seconds with:

```
Failed to download archive 'https://codeload.github.com/actions/jekyll-build-pages/tar.gz/44a6e6beabd...'
An action could not be found at the URI '...jekyll-build-pages/tar.gz/...'
Internal server error. Correlation ID: 38b17b78-9641-4bac-8925-99f761ef8e1c
```

→ GitHub's own infrastructure could not download the `jekyll-build-pages` action archive. Live site continued serving the last successful build (#17), which **did not yet contain** the `debug_panel.js` script tag.

### Why HANDOFF chose wrong tier
HANDOFF §4 assumed Bước 1 (file upload) and Bước 2 (script tag) had **already deployed to live**. Reality: files were committed to the `main` branch but never made it through the Pages build pipeline. The diagnostic protocol skipped the **most upstream tier** of the system.

### Recovery
- 1 click: "Re-run failed jobs" on build #22 → re-attempt downloaded jekyll-build-pages successfully (transient infra issue resolved).
- Build #22 attempt 2: 18s build + 30s deploy = 1m 1s total → live site updated → panel appears immediately.

### Lesson — added to gotchas (G6 candidate)
**Before debugging client-side, confirm last successful build matches latest commit.**

Rule of thumb addition to next HANDOFF:

> **Bước 0 (pre-diagnostic):** Open `github.com/<repo>/actions`. If most recent `pages-build-deployment` shows ❌, the live site is stale regardless of what `github.com/<repo>/blob/...` shows in file view. Fix the build before debugging the browser.

---

## 6. PERFORMANCE NOTES

| Metric | Value |
|---|---|
| First panel render (after `?debug=1`) | < 100ms perceptual — instant |
| Build job duration | 18s |
| Deploy job duration | 30s |
| Service Worker cache strategy | network-first; new files fetched on first visit |
| Panel re-render interval (when ON) | 5s fallback + on every wrapped `render()` / `saveState()` |
| Memory footprint of panel | not measured — visually small, single DOM tree under `#debug-panel-host` |

---

## 7. TECHNICAL DEBT (open items)

### TD-1 · `technical-debt-v11.2-pre` · Node.js 20 deprecation on Pages build
- **Source:** Build #22 attempt 2 annotation (1 warning):
  > "Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/checkout@v4, actions/upload-artifact@v4."
- **Risk:** When GitHub enforces deprecation (timeline not announced), all `pages-build-deployment` runs will fail. **Same failure mode as the 5 we just recovered from, but permanent.**
- **Mitigation path:** Pin actions to newer Node 22+ versions in any custom workflow. For default `pages-build-deployment` (which is GitHub-managed), GitHub will likely auto-upgrade — but watch for breaking changes.
- **Priority:** Pre-v11.2. Track in ROADMAP.md.

### TD-2 · Documentation drift — 3 undocumented v11 scripts
- **Files:** `phrases.js`, `today.js`, `app_v11_today.js` (all loaded with `?v=11` query)
- **Status:** Live in production. Not in CHANGELOG. Not in ARCHITECTURE.md module dependency graph.
- **Mitigation:** Reconciliation pass — either retro-add a `v11.0` CHANGELOG entry (preferred), or roll them into the v11.1 entry as "pre-v11.1 work".
- **Priority:** Before v11.2 ships.

### TD-3 · Adaptive vs Debug formula divergence (≈19×)
- **Already documented** in V11_1_DEBUG_PANEL.md G3 as intentional.
- **Decision pending** at end of observation week.
- **Risk if ignored:** UI shows "this topic is at high risk" via panel but adaptive engine doesn't escalate it in the queue → user-visible inconsistency.

### TD-4 · `getTodayQueue` not exposed on `shadowEN` API
- Minor. Internal to integration modules. Worth exposing once v11.2 stabilizes adaptive formula.

---

## 8. FUTURE RISKS

1. **Pages auto-deploy depends on GitHub's `jekyll-build-pages` action stability.** A single 4xx/5xx on their CDN = no deploy. We have no fallback (no custom workflow).
2. **Cache invalidation** when `index.html` changes but not `sw.js` cache name → SW serves stale shell. Mitigated for v11.1 because we hit re-deploy and SW network-first picks up the new shell, but worth bumping `CACHE_NAME` in `sw.js` for any future `index.html` change.
3. **Confidence trend penalty (adaptive component)** caps at 0.15 — for a long-declining topic, the panel may underrate true risk. Observation week will reveal if this matters.

---

## 9. RECOMMENDATION

Enter **observation week** (Day 1–6) per HANDOFF §12. End-of-week create `docs/V11_1_OBSERVATIONS.md` and answer:

1. Are Fragile topics actually getting rescued first?
2. Is `age` weighted too high vs. `memory`? (19× divergence vs adaptive.js suggests YES — formal answer pending real reviews)
3. Are survival phrases real (cross-topic) or noise?
4. Does QUEUED rank align with non-QUEUED rank?
5. After completing 5 reviews — does memory distribution shift visibly?

THEN decide v11.2-A (back-port formula) vs v11.2-B (Daily Loop polish).

**Do NOT start new features until observation week ends.**

---

## 10. SIGNATURE

**Verified by:** Claude (Cowork mode, opus-4.7), 2026-05-26 evening
**Method:** Live page navigation + JS evaluation via Chrome MCP + visual screenshots + repo file fetch
**Status at sign-off:** v11.1 STABLE · panel live · deploy unblocked · 4 tech debt items tracked · observation week ready to start.

---

*This report should be re-validated by the user on a physical mobile device before declaring v11.1 fully shipped.*
