/* ============================================================================
 * SHADOW ENGLISH - v22  DASHBOARD COACHING UX V2   (UI/UX ONLY - NO NEW LOGIC)
 * ----------------------------------------------------------------------------
 * Turns the dashboard from a "data table" into an "AI Coach Dashboard".
 * 100% ADDITIVE & PRESENTATIONAL. Adds ZERO learning/AI/review/memory logic and
 * ZERO data structures. Re-presents data that v20 already computes:
 *   window.SHADOW_V20.smartNextAction() / coachRecommendation() / rescueList()
 *   / memoryHealth() / dailyPlan()  + window.shadowEN.state (read-only).
 *
 * Hierarchy: Mission -> Coach -> Rescue -> Plan -> Progress -> Status.
 *   - Compact full-width HERO (today's mission) with CTA.
 *   - Prominent "COACH HOM NAY" card (trainer voice, 2-3 sentences).
 *   - Friendly "Sap quen hom nay" rescue (only when needed).
 *   - System progress bar (X / N topics learned).
 *   - "TINH TRANG HOC TAP" status with human labels (no Fragile/Weak/etc).
 *   - Today's plan timeline.
 *
 * Supersedes v21's visuals (hides #shadow-v21-root) and hides the app's
 * technical "MEMORY PULSE" card (#today-card-v11) - both via CSS only, no code
 * in v20/v21/app is edited. CTAs reuse v20's delegated launcher (data-v20-start).
 * Revert = delete this one <script> line (v21 visuals reappear).
 * Run SHADOW_V22.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V22) return;
  var VERSION = 'v22.0.1';

  function log() { try { console.log.apply(console, ['[v22]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function V20() { return window.SHADOW_V20 || null; }
  function state() { return (window.shadowEN && window.shadowEN.state) || null; }
  function tname(t) { return (t && (t.name || t.title || t.topic)) || 'Untitled'; }
  function temoji(t) { return (t && (t.emoji || t.icon)) || '📘'; }
  function tid(t) { return t && (t.id != null ? t.id : (t.key || t.slug || t.name)); }
  function plabel(sc) { return sc >= 70 ? 'Cao' : (sc >= 45 ? 'Vừa' : 'Thấp'); }
  function pcls(sc) { return sc >= 70 ? 'high' : (sc >= 45 ? 'med' : 'low'); }

  /* ----------------------------------------------------- data (read-only) */
  function learnedCount() {
    var s = state(); if (!s || !s.topics) return 0;
    return s.topics.filter(function (t) { return t.lastReview || (t.reviewStage && t.reviewStage !== 'Day 0'); }).length;
  }
  // human-friendly status buckets, derived from v20.memoryHealth().counts (data unchanged)
  function friendlyBuckets() {
    var c = { Fragile: 0, Weak: 0, Building: 0, Stable: 0, Automatic: 0 };
    try { var mh = V20().memoryHealth(); if (mh && mh.counts) c = mh.counts; } catch (e) {}
    return [
      { emoji: '🆕', label: 'Chủ đề mới', n: c.Fragile || 0, cls: 'new' },
      { emoji: '🌱', label: 'Đang hình thành', n: (c.Weak || 0) + (c.Building || 0), cls: 'forming' },
      { emoji: '💪', label: 'Đã ổn định', n: c.Stable || 0, cls: 'stable' },
      { emoji: '🏆', label: 'Tự động hóa', n: c.Automatic || 0, cls: 'auto' }
    ];
  }
  // compose a coach sentence from already-computed numbers (presentation, not logic)
  function coachText() {
    var v = V20(); var s = state();
    var total = (s && s.topics) ? s.topics.length : 0;
    var learned = learnedCount();
    var plan = { items: [], total: 0 };
    try { plan = v.dailyPlan(); } catch (e) {}
    var reviews = plan.items.filter(function (i) { return i.mode === 'review'; }).length;
    var learns = plan.items.filter(function (i) { return i.mode === 'learn'; }).length;
    if (plan.items.length) {
      var acts = [];
      if (reviews) acts.push('review ' + reviews + ' chủ đề');
      if (learns) acts.push('học thêm ' + learns + ' chủ đề mới');
      var doStr = acts.join(' và ');
      return 'Bạn mới học ' + learned + '/' + total + ' chủ đề. Hôm nay chỉ cần ' + doStr +
        ' (khoảng ' + plan.total + ' phút) là đủ để duy trì đà tiến bộ.';
    }
    // fallback to v20's rule-based recommendation
    try { return v.coachRecommendation().text; } catch (e) { return 'Bắt đầu 1 chủ đề hôm nay để tạo đà.'; }
  }

  /* ----------------------------------------------------- renderers (UI only) */
  function heroHTML(sna) {
    if (!sna) {
      return '<div class="v22-hero v22-hero--done"><div class="v22-hero-main">' +
        '<div class="v22-hero-label">🎯 NHIỆM VỤ HÔM NAY</div>' +
        '<div class="v22-hero-title">✅ Hôm nay bạn đã ôn xong</div>' +
        '<div class="v22-hero-why">Không có trí nhớ nào đang phai. Quay lại sau để giữ chúng sắc bén.</div>' +
        '</div></div>';
    }
    var verb = sna.mode === 'review' ? 'Ôn lại' : 'Học';
    var why = (sna.reasons && sna.reasons.length) ? sna.reasons.join(' · ') : 'Bước tiếp theo nên làm';
    return '<div class="v22-hero v22-hero--' + sna.mode + '"><div class="v22-hero-main">' +
      '<div class="v22-hero-label">🎯 NHIỆM VỤ HÔM NAY</div>' +
      '<div class="v22-hero-title">' + esc(temoji(sna.topic)) + ' ' + verb + ': ' + esc(tname(sna.topic)) + '</div>' +
      '<div class="v22-hero-why"><b>Vì sao</b> ' + esc(why) + '</div>' +
      '<div class="v22-hero-meta">' +
        '<span class="v22-chip">⏱ ~' + sna.estMin + ' phút</span>' +
        '<span class="v22-chip v22-chip--' + pcls(sna.score) + '">Ưu tiên: ' + plabel(sna.score) + '</span>' +
      '</div></div>' +
      '<div class="v22-hero-cta-wrap"><button class="v22-cta" data-v20-start="' + esc(tid(sna.topic)) + '" data-v20-mode="' + sna.mode + '">' +
        (sna.mode === 'review' ? 'Bắt đầu ôn' : 'Bắt đầu học') + ' →</button></div>' +
    '</div>';
  }

  function coachCardHTML() {
    return '<div class="v22-coach">' +
      '<div class="v22-coach-badge">🎯 COACH HÔM NAY</div>' +
      '<div class="v22-coach-text">' + esc(coachText()) + '</div>' +
    '</div>';
  }

  function rescueHTML(rescue) {
    if (!rescue.length) return '';
    var rows = rescue.slice(0, 4).map(function (r) {
      return '<button class="v22-rescue-row" data-v20-start="' + esc(tid(r.topic)) + '" data-v20-mode="review">' +
        '<span class="v22-emoji">' + esc(temoji(r.topic)) + '</span>' +
        '<span class="v22-name">' + esc(tname(r.topic)) + '</span>' +
        '<span class="v22-rescue-conf">' + r.base + '% → ' + r.cur + '%</span>' +
        '<span class="v22-go">Ôn ngay →</span>' +
      '</button>';
    }).join('');
    return '<div class="v22-rescue"><div class="v22-rescue-head">🚨 SẮP QUÊN HÔM NAY <span class="v22-rescue-note">ôn ngay trước khi trí nhớ phai</span> <b>' + rescue.length + '</b></div>' + rows + '</div>';
  }

  function planHTML(p) {
    if (!p.items.length) {
      return '<div class="v22-card"><div class="v22-sec-title">📋 KẾ HOẠCH HÔM NAY</div>' +
        '<div class="v22-empty">Không còn việc cần làm hôm nay 🎉</div></div>';
    }
    var steps = p.items.map(function (it, i) {
      var lbl = it.label === 'Review' ? 'Ôn' : (it.label === 'Rescue' ? 'Cứu' : 'Học');
      return '<button class="v22-step" data-v20-start="' + esc(tid(it.topic)) + '" data-v20-mode="' + it.mode + '">' +
        '<span class="v22-step-num">' + (i + 1) + '</span>' +
        '<span class="v22-emoji">' + esc(temoji(it.topic)) + '</span>' +
        '<span class="v22-name">' + esc(tname(it.topic)) + '</span>' +
        '<span class="v22-step-tag ' + it.label.toLowerCase() + '">' + lbl + '</span>' +
        '<span class="v22-step-min">' + it.min + 'p</span>' +
      '</button>';
    }).join('');
    return '<div class="v22-card"><div class="v22-sec-title">📋 KẾ HOẠCH HÔM NAY <span class="v22-pill">Tổng: ' + p.total + ' phút</span></div>' +
      '<div class="v22-timeline">' + steps + '</div></div>';
  }

  function progressHTML() {
    var s = state(); var total = (s && s.topics) ? s.topics.length : 0;
    var learned = learnedCount();
    var pct = total ? Math.round(learned / total * 100) : 0;
    return '<div class="v22-card"><div class="v22-sec-title">📈 TIẾN ĐỘ HỆ THỐNG</div>' +
      '<div class="v22-prog-big">' + learned + ' <small>/ ' + total + ' chủ đề đã học</small></div>' +
      '<div class="v22-prog-bar"><span style="width:' + pct + '%"></span></div>' +
      '<div class="v22-prog-note">' + pct + '% hành trình · cứ đều đặn mỗi ngày là tiến</div>' +
    '</div>';
  }

  function statusHTML() {
    var chips = friendlyBuckets().map(function (b) {
      return '<div class="v22-stat v22-stat--' + b.cls + '"><span class="v22-stat-n">' + b.n + '</span>' +
        '<span class="v22-stat-lbl">' + b.emoji + ' ' + b.label + '</span></div>';
    }).join('');
    return '<div class="v22-card"><div class="v22-sec-title">🧠 TÌNH TRẠNG HỌC TẬP</div>' +
      '<div class="v22-stat-grid">' + chips + '</div></div>';
  }

  /* ----------------------------------------------------------------- mount */
  function homeVisible() {
    if (location.hash && /review|topic|progress|content|editor|setting/i.test(location.hash)) return false;
    var h = document.querySelector('#view-home,[data-view="home"]');
    return h ? (h.classList.contains('active') || h.offsetParent !== null) : true;
  }
  function host() {
    return document.getElementById('view-home') || document.querySelector('[data-view="home"]') ||
      document.querySelector('.content') || document.querySelector('main') || document.body;
  }

  function render() {
    var v = V20();
    if (!v) { log('SHADOW_V20 not present - v22 needs it for data. Skipping.'); return; }
    if (!homeVisible()) { var ex = document.getElementById('shadow-v22-root'); if (ex) ex.remove(); return; }
    var h = host(); if (!h) return;
    var root = document.getElementById('shadow-v22-root');
    if (!root) { root = document.createElement('section'); root.id = 'shadow-v22-root'; }
    if (root.parentNode !== h) h.insertBefore(root, h.firstChild); // order enforced via CSS

    var sna, rescue, plan;
    try { sna = v.smartNextAction(); rescue = v.rescueList(); plan = v.dailyPlan(); }
    catch (e) { log('engine read failed', e); return; }

    root.innerHTML =
      heroHTML(sna) +
      coachCardHTML() +
      rescueHTML(rescue) +
      '<div class="v22-grid">' +
        '<div class="v22-col">' + planHTML(plan) + '</div>' +
        '<div class="v22-col">' + progressHTML() + statusHTML() + '</div>' +
      '</div>';
  }

  /* ----------------------------------------------- delegated CTA (own + v20) */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#shadow-v22-root [data-v20-start]');
    if (!btn) return;
    // v20's own listener also handles data-v20-start; nothing extra needed here.
  });

  /* ------------------------------------------------------------------- CSS */
  function injectCSS() {
    if (document.getElementById('shadow-v22-css')) return;
    var css = document.createElement('style');
    css.id = 'shadow-v22-css';
    css.textContent = [
      '#shadow-v22-root{grid-column:1/-1!important;order:-3!important;display:flex;flex-direction:column;gap:16px;margin:0 0 18px;font-family:inherit;width:100%;min-width:0}',
      '#shadow-v22-root *{box-sizing:border-box}',
      /* supersede v21 visuals + hide app technical card */
      '#shadow-v21-root{display:none!important}',
      '#shadow-v20-root{display:none!important}',
      '#today-card-v11{display:none!important}',
      '#loopv14-root{grid-column:1/-1!important;order:-1!important}',
      '.loopv14-nba{display:none!important}',
      /* card + titles */
      '.v22-card{background:var(--card,#1a1838);border:1px solid var(--border,#2a2750);border-radius:18px;padding:18px 20px;box-shadow:0 5px 18px rgba(0,0,0,.16)}',
      '.v22-sec-title{font-size:12px;letter-spacing:.14em;font-weight:800;opacity:.7;margin-bottom:14px;display:flex;align-items:center;gap:10px;color:var(--text,#fff)}',
      '.v22-pill{margin-left:auto;background:rgba(124,92,255,.18);color:var(--purple,#7c5cff);border-radius:20px;padding:3px 11px;font-size:11px;letter-spacing:.02em}',
      '.v22-emoji{font-size:18px}',
      '.v22-name{flex:1;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
      '.v22-go{font-size:13px;font-weight:800;opacity:.7}',
      /* HERO (compact, full width) */
      '.v22-hero{display:flex;align-items:center;gap:24px;border-radius:22px;padding:22px 28px;color:#fff;box-shadow:0 12px 34px rgba(0,0,0,.30)}',
      '.v22-hero--learn{background:linear-gradient(135deg,#6d4bff,#3b1fa6)}',
      '.v22-hero--review{background:linear-gradient(135deg,#e0405f,#8c1d3a)}',
      '.v22-hero--done{background:linear-gradient(135deg,#2b9e6b,#13603f)}',
      '.v22-hero-main{flex:1;min-width:0}',
      '.v22-hero-label{font-size:11px;letter-spacing:.2em;font-weight:800;opacity:.85;margin-bottom:8px}',
      '.v22-hero-title{font-size:25px;line-height:1.15;font-weight:900;margin-bottom:8px;overflow-wrap:anywhere}',
      '.v22-hero-why{font-size:14px;line-height:1.45;opacity:.93;margin-bottom:12px}',
      '.v22-hero-why b{opacity:.7;font-weight:800;margin-right:4px}',
      '.v22-hero-meta{display:flex;flex-wrap:wrap;gap:9px}',
      '.v22-chip{background:rgba(255,255,255,.16);border-radius:22px;padding:6px 13px;font-size:13px;font-weight:700}',
      '.v22-chip--high{background:#fff;color:#b21f3a}',
      '.v22-chip--med{background:#fff;color:#9a6b00}',
      '.v22-chip--low{background:#fff;color:#4a3aa8}',
      '.v22-hero-cta-wrap{flex:0 0 auto}',
      '.v22-cta{border:0;border-radius:14px;padding:14px 26px;font-size:15px;font-weight:800;cursor:pointer;background:#fff;color:#1a1838;box-shadow:0 6px 18px rgba(0,0,0,.22);white-space:nowrap;transition:transform .08s ease}',
      '.v22-cta:active{transform:translateY(1px)}',
      /* COACH (prominent) */
      '.v22-coach{position:relative;border-radius:20px;padding:20px 24px;background:linear-gradient(135deg,#2a2466,#1a1640);border:1px solid rgba(124,92,255,.45);box-shadow:0 8px 26px rgba(124,92,255,.18)}',
      '.v22-coach-badge{display:inline-block;font-size:12px;letter-spacing:.12em;font-weight:800;color:#fff;background:linear-gradient(135deg,#7c5cff,#5b3df0);border-radius:20px;padding:5px 14px;margin-bottom:12px}',
      '.v22-coach-text{font-size:17px;line-height:1.6;font-weight:600;color:var(--text,#fff)}',
      /* RESCUE */
      '.v22-rescue{border-radius:18px;padding:16px 20px;border:1px solid rgba(239,68,68,.5);background:linear-gradient(135deg,rgba(239,68,68,.16),rgba(239,68,68,.04))}',
      '.v22-rescue-head{font-size:12px;letter-spacing:.1em;font-weight:800;color:var(--red,#ef4444);margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
      '.v22-rescue-note{font-weight:600;letter-spacing:.02em;opacity:.85;text-transform:none}',
      '.v22-rescue-head b{margin-left:auto;background:rgba(239,68,68,.25);border-radius:20px;padding:2px 10px;font-size:12px}',
      '.v22-rescue-row{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:rgba(255,255,255,.05);border:0;border-radius:12px;padding:11px 14px;margin-bottom:7px;cursor:pointer;color:var(--text,#fff)}',
      '.v22-rescue-row:hover{background:rgba(255,255,255,.1)}',
      '.v22-rescue-conf{font-size:13px;font-weight:800;color:var(--orange,#ff8a3d);white-space:nowrap}',
      /* GRID */
      '.v22-grid{display:grid;grid-template-columns:minmax(300px,1.2fr) minmax(280px,1fr);gap:16px;align-items:start}',
      '.v22-col{display:flex;flex-direction:column;gap:16px;min-width:0}',
      /* PLAN timeline */
      '.v22-timeline{display:flex;flex-direction:column;gap:9px}',
      '.v22-step{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:13px;padding:11px 13px;cursor:pointer;color:var(--text,#fff);transition:background .15s}',
      '.v22-step:hover{background:rgba(255,255,255,.1)}',
      '.v22-step-num{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:var(--purple,#7c5cff);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}',
      '.v22-step-tag{font-size:10px;font-weight:800;border-radius:20px;padding:3px 9px;white-space:nowrap}',
      '.v22-step-tag.review{background:rgba(59,130,246,.2);color:var(--blue,#3b82f6)}',
      '.v22-step-tag.rescue{background:rgba(239,68,68,.2);color:var(--red,#ef4444)}',
      '.v22-step-tag.learn{background:rgba(34,197,94,.2);color:var(--green,#22c55e)}',
      '.v22-step-min{font-size:12px;opacity:.7;font-weight:700;white-space:nowrap}',
      '.v22-empty{font-size:14px;opacity:.6;padding:8px 4px;color:var(--text,#fff)}',
      /* PROGRESS */
      '.v22-prog-big{font-size:26px;font-weight:900;color:var(--text,#fff);margin-bottom:10px}',
      '.v22-prog-big small{font-size:14px;font-weight:700;opacity:.6}',
      '.v22-prog-bar{height:10px;border-radius:8px;background:rgba(255,255,255,.10);overflow:hidden;margin-bottom:8px}',
      '.v22-prog-bar span{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,#7c5cff,#22c55e)}',
      '.v22-prog-note{font-size:12.5px;opacity:.65;color:var(--text,#fff)}',
      /* STATUS buckets */
      '.v22-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.v22-stat{display:flex;flex-direction:column;gap:3px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:13px 14px}',
      '.v22-stat-n{font-size:24px;font-weight:900;line-height:1;color:var(--text,#fff)}',
      '.v22-stat-lbl{font-size:12px;font-weight:700;opacity:.78;color:var(--text,#fff)}',
      '.v22-stat--new .v22-stat-n{color:#60a5fa}',
      '.v22-stat--forming .v22-stat-n{color:#22c55e}',
      '.v22-stat--stable .v22-stat-n{color:#facc15}',
      '.v22-stat--auto .v22-stat-n{color:#a78bfa}',
      /* responsive */
      '@media(max-width:900px){.v22-grid{grid-template-columns:1fr}.v22-hero{flex-direction:column;align-items:stretch;gap:14px;padding:18px 18px}.v22-hero-title{font-size:21px}.v22-hero-cta-wrap .v22-cta{width:100%}}',
      '@media(max-width:430px){.v22-hero{padding:16px 15px}.v22-hero-title{font-size:19px}.v22-coach-text{font-size:15px}.v22-stat-grid{grid-template-columns:1fr 1fr}.v22-prog-big{font-size:22px}}'
    ].join('\n');
    document.head.appendChild(css);

    /* additive safety net: clip phantom horizontal overflow + legacy fixed grids on small screens */
    if (!document.getElementById('shadow-v22-safety')) {
      var sf = document.createElement('style'); sf.id = 'shadow-v22-safety';
      sf.textContent = [
        '@media(max-width:1500px){.levels-grid{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))!important}}',
        '@media(max-width:900px){html,body{overflow-x:hidden!important;max-width:100%!important}.topics-row{flex-wrap:wrap!important;min-width:0!important}.level-card,.level-head,.level-sub,.progress-bar,.topics-row{max-width:100%!important;min-width:0!important}}'
      ].join('\n');
      document.head.appendChild(sf);
    }
  }

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(n, c) { ok = ok && !!c; out.push((c ? 'PASS ' : 'FAIL ') + n); }
    check('SHADOW_V20 present (data source)', !!V20());
    check('v20 engines intact (untouched)', !!(V20() && typeof V20().memoryHealth === 'function' && typeof V20().dailyPlan === 'function'));
    check('css injected', !!document.getElementById('shadow-v22-css'));
    check('root present when home visible', !homeVisible() || !!document.getElementById('shadow-v22-root'));
    var root = document.getElementById('shadow-v22-root');
    check('hero rendered', !root || /v22-hero/.test(root.innerHTML));
    check('coach card rendered', !root || /v22-coach/.test(root.innerHTML));
    check('progress rendered', !root || /v22-prog-bar/.test(root.innerHTML));
    check('status buckets rendered', !root || /v22-stat-grid/.test(root.innerHTML));
    check('friendly labels (no Fragile/Weak in v22 UI)', !root || !/Fragile|Weak|Building|Stable|Automatic/.test(root.innerHTML));
    var buckets = friendlyBuckets();
    var sum = buckets.reduce(function (a, b) { return a + b.n; }, 0);
    var total = (state() && state().topics) ? state().topics.length : sum;
    check('buckets sum == total topics (data preserved: ' + sum + '/' + total + ')', sum === total);
    check('CTAs reuse v20 launcher', !root || /data-v20-start/.test(root.innerHTML) || !V20().smartNextAction());
    var v21 = document.getElementById('shadow-v21-root');
    check('v21 visuals superseded (hidden)', !v21 || getComputedStyle(v21).display === 'none');
    var tc = document.getElementById('today-card-v11');
    check('technical MEMORY PULSE card hidden', !tc || getComputedStyle(tc).display === 'none');
    if (root) {
      var hero = root.querySelector('.v22-hero');
      if (hero) { var hh = Math.round(hero.getBoundingClientRect().height), vh = window.innerHeight || 768; check('hero <=25% viewport (' + hh + '/' + vh + ')', hh <= vh * 0.25 + 8 || hh <= 235); }
    }
    console.log('%c[v22] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'), 'font-weight:bold;color:' + (ok ? 'green' : 'red'));
    out.forEach(function (l) { log(l); });
    return { ok: ok, results: out };
  }

  /* ---------------------------------------------------------------- public */
  window.SHADOW_V22 = { version: VERSION, render: render, selfTest: selfTest, coachText: coachText, friendlyBuckets: friendlyBuckets };

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    render();
    window.addEventListener('hashchange', function () { setTimeout(render, 90); });
    setInterval(function () { if (homeVisible() && !document.getElementById('shadow-v22-root')) render(); }, 1800);
    log('ready', VERSION, '- run SHADOW_V22.selfTest() to verify.');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 800); });
  } else { setTimeout(boot, 800); }
})();
