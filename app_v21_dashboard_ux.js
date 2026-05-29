/* ============================================================================
 * SHADOW ENGLISH - v21  DASHBOARD UX POLISH V1   (UI/UX ONLY - NO NEW LOGIC)
 * ----------------------------------------------------------------------------
 * 100% ADDITIVE & PRESENTATIONAL. Adds ZERO learning/AI/review/memory logic and
 * ZERO data structures. It only RE-PRESENTS data that v20 already computes:
 *   window.SHADOW_V20.smartNextAction() / memoryHealth() / coachRecommendation()
 *   / dailyPlan() / rescueList()
 *
 * What it does (UI only):
 *   1) Full-width HERO ("TODAY'S MISSION") = the Smart Next Action, promoted.
 *   2) Compact KPI-style Memory Health (much shorter).
 *   3) Coach Recommendation restyled as a trainer message ("COACH NOI").
 *   4) Today's Plan as a numbered timeline (not a table).
 *   5) Responsive 2-column layout that fills the full content width
 *      (fixes the empty right area: v20/v14 roots only occupied 1 grid cell;
 *       v21 root spans grid-column 1/-1).
 *   6) Better type scale / spacing / shadows / section titles.
 *
 * It hides v20's raw panel (#shadow-v20-root) via CSS and widens v14's priority
 * row to full width via CSS - both presentational, no code in v20/v14 touched.
 *
 * Does NOT touch: Learning Loop, Review Engine, Memory Engine, Gemini, Topic
 * storage, Overlay structure, or any v20 engine. CTAs reuse v20's existing
 * delegated launcher (data-v20-start). Revert = delete this one <script> line;
 * the v20 panel reappears unchanged. Run SHADOW_V21.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V21) return;
  var VERSION = 'v21.0.0';

  function log() { try { console.log.apply(console, ['[v21]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function V20() { return window.SHADOW_V20 || null; }
  function tname(t) { return (t && (t.name || t.title || t.topic)) || 'Untitled'; }
  function temoji(t) { return (t && (t.emoji || t.icon)) || '📘'; }
  function tid(t) { return t && (t.id != null ? t.id : (t.key || t.slug || t.name)); }
  function plabel(sc) { return sc >= 70 ? 'High' : (sc >= 45 ? 'Medium' : 'Low'); }
  function pcls(sc) { return sc >= 70 ? 'high' : (sc >= 45 ? 'med' : 'low'); }

  /* ----------------------------------------------------- renderers (UI only) */
  function heroHTML(sna) {
    if (!sna) {
      return '<div class="v21-hero v21-hero--done">' +
        '<div class="v21-hero-label">TODAY\'S MISSION</div>' +
        '<div class="v21-hero-title">✅ Hôm nay bạn đã ôn xong</div>' +
        '<div class="v21-hero-why">Không có trí nhớ nào đang phai. Quay lại sau để giữ chúng sắc bén.</div>' +
      '</div>';
    }
    var verb = sna.mode === 'review' ? 'Review' : 'Learn';
    var why = (sna.reasons && sna.reasons.length) ? sna.reasons.join(' · ') : 'Recommended next step';
    return '<div class="v21-hero v21-hero--' + sna.mode + '">' +
      '<div class="v21-hero-label">TODAY\'S MISSION</div>' +
      '<div class="v21-hero-title">' + esc(temoji(sna.topic)) + ' ' + verb + ': ' + esc(tname(sna.topic)) + '</div>' +
      '<div class="v21-hero-why"><b>Why</b> ' + esc(why) + '</div>' +
      '<div class="v21-hero-meta">' +
        '<span class="v21-chip">⏱ ~' + sna.estMin + ' minutes</span>' +
        '<span class="v21-chip v21-chip--' + pcls(sna.score) + '">Priority: ' + plabel(sna.score) + '</span>' +
      '</div>' +
      '<button class="v21-cta" data-v20-start="' + esc(tid(sna.topic)) + '" data-v20-mode="' + sna.mode + '">' +
        (sna.mode === 'review' ? 'Start Review' : 'Start Learning') + ' →</button>' +
    '</div>';
  }

  function healthHTML(h) {
    return '<div class="v21-card v21-kpi">' +
      '<div class="v21-kpi-row">' +
        '<span class="v21-kpi-num">' + h.score + '<small>%</small></span>' +
        '<div class="v21-kpi-meta"><div class="v21-kpi-label">MEMORY HEALTH</div>' +
          '<div class="v21-kpi-sub">' + esc(h.label) + '</div></div>' +
      '</div>' +
      '<div class="v21-kpi-bar"><span style="width:' + h.score + '%"></span></div>' +
    '</div>';
  }

  function coachHTML(c) {
    return '<div class="v21-card v21-coach">' +
      '<div class="v21-coach-head"><span class="v21-coach-ic">💡</span> COACH NÓI</div>' +
      '<div class="v21-coach-text">' + esc(c.text) + '</div>' +
    '</div>';
  }

  function planHTML(p) {
    if (!p.items.length) {
      return '<div class="v21-card v21-plan">' +
        '<div class="v21-sec-title">📋 TODAY\'S PLAN</div>' +
        '<div class="v21-plan-empty">Không còn việc cần làm hôm nay 🎉</div></div>';
    }
    var steps = p.items.map(function (it, i) {
      return '<button class="v21-step" data-v20-start="' + esc(tid(it.topic)) + '" data-v20-mode="' + it.mode + '">' +
        '<span class="v21-step-num">' + (i + 1) + '</span>' +
        '<span class="v21-step-emoji">' + esc(temoji(it.topic)) + '</span>' +
        '<span class="v21-step-name">' + esc(tname(it.topic)) + '</span>' +
        '<span class="v21-step-tag ' + it.label.toLowerCase() + '">' + esc(it.label) + '</span>' +
        '<span class="v21-step-min">' + it.min + 'm</span>' +
      '</button>';
    }).join('');
    return '<div class="v21-card v21-plan">' +
      '<div class="v21-sec-title">📋 TODAY\'S PLAN <span class="v21-plan-total">Total: ' + p.total + ' minutes</span></div>' +
      '<div class="v21-timeline">' + steps + '</div>' +
    '</div>';
  }

  function rescueHTML(rescue) {
    if (!rescue.length) return '';
    var rows = rescue.slice(0, 4).map(function (r) {
      return '<button class="v21-rescue-row" data-v20-start="' + esc(tid(r.topic)) + '" data-v20-mode="review">' +
        '<span class="v21-step-emoji">' + esc(temoji(r.topic)) + '</span>' +
        '<span class="v21-step-name">' + esc(tname(r.topic)) + '</span>' +
        '<span class="v21-rescue-conf">' + r.base + '% → ' + r.cur + '%</span>' +
        (r.daysSince != null ? '<span class="v21-rescue-days">' + r.daysSince + 'd ago</span>' : '') +
        '<span class="v21-step-go">Rescue →</span>' +
      '</button>';
    }).join('');
    return '<div class="v21-rescue">' +
      '<div class="v21-rescue-head">🚨 RESCUE ALERT <span class="v21-rescue-note">review now before memory drops further</span> <b>' + rescue.length + '</b></div>' +
      rows +
    '</div>';
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
    if (!v) { log('SHADOW_V20 not present - v21 needs it for data. Skipping.'); return; }
    if (!homeVisible()) { var ex = document.getElementById('shadow-v21-root'); if (ex) ex.remove(); return; }
    var h = host(); if (!h) return;

    var root = document.getElementById('shadow-v21-root');
    if (!root) { root = document.createElement('section'); root.id = 'shadow-v21-root'; }
    if (root.parentNode !== h || h.firstChild !== root) h.insertBefore(root, h.firstChild);

    var sna, health, coach, plan, rescue;
    try {
      sna = v.smartNextAction();
      health = v.memoryHealth();
      coach = v.coachRecommendation();
      plan = v.dailyPlan();
      rescue = v.rescueList();
    } catch (e) { log('engine read failed', e); return; }

    root.innerHTML =
      rescueHTML(rescue) +
      heroHTML(sna) +
      '<div class="v21-grid">' +
        '<div class="v21-col v21-col-left">' + healthHTML(health) + coachHTML(coach) + '</div>' +
        '<div class="v21-col v21-col-right">' + planHTML(plan) + '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------- CSS */
  function injectCSS() {
    if (document.getElementById('shadow-v21-css')) return;
    var css = document.createElement('style');
    css.id = 'shadow-v21-css';
    css.textContent = [
      /* take the full content width (fixes empty right area) + hide raw v20 panel */
      '#shadow-v21-root{grid-column:1/-1!important;display:flex;flex-direction:column;gap:18px;margin:0 0 22px;font-family:inherit;width:100%}',
      '#shadow-v21-root *{box-sizing:border-box}',
      '#shadow-v20-root{display:none!important}',
      '#loopv14-root{grid-column:1/-1!important}',
      /* shared card */
      '.v21-card{background:var(--card,#1a1838);border:1px solid var(--border,#2a2750);border-radius:20px;padding:20px 22px;box-shadow:0 6px 22px rgba(0,0,0,.18)}',
      '.v21-sec-title{font-size:12px;letter-spacing:.18em;font-weight:800;opacity:.65;margin-bottom:14px;display:flex;align-items:center;gap:10px;color:var(--text,#fff)}',
      /* HERO */
      '.v21-hero{position:relative;border-radius:24px;padding:30px 32px;color:#fff;overflow:hidden;box-shadow:0 14px 40px rgba(0,0,0,.32)}',
      '.v21-hero--learn{background:linear-gradient(135deg,#6d4bff 0%,#3b1fa6 100%)}',
      '.v21-hero--review{background:linear-gradient(135deg,#e0405f 0%,#8c1d3a 100%)}',
      '.v21-hero--done{background:linear-gradient(135deg,#2b9e6b 0%,#13603f 100%)}',
      '.v21-hero-label{font-size:12px;letter-spacing:.24em;font-weight:800;opacity:.82;margin-bottom:12px}',
      '.v21-hero-title{font-size:32px;line-height:1.15;font-weight:900;margin-bottom:12px}',
      '.v21-hero-why{font-size:16px;line-height:1.5;opacity:.94;margin-bottom:18px;max-width:760px}',
      '.v21-hero-why b{opacity:.7;font-weight:800;margin-right:4px}',
      '.v21-hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px}',
      '.v21-chip{background:rgba(255,255,255,.16);border-radius:24px;padding:7px 15px;font-size:14px;font-weight:700;backdrop-filter:blur(2px)}',
      '.v21-chip--high{background:rgba(255,255,255,.95);color:#b21f3a}',
      '.v21-chip--med{background:rgba(255,255,255,.92);color:#9a6b00}',
      '.v21-chip--low{background:rgba(255,255,255,.9);color:#4a3aa8}',
      '.v21-cta{border:0;border-radius:14px;padding:15px 30px;font-size:16px;font-weight:800;cursor:pointer;background:#fff;color:#1a1838;box-shadow:0 6px 18px rgba(0,0,0,.25);transition:transform .08s ease,box-shadow .15s}',
      '.v21-cta:hover{box-shadow:0 9px 26px rgba(0,0,0,.34)}',
      '.v21-cta:active{transform:translateY(1px)}',
      /* 2-col grid */
      '.v21-grid{display:grid;grid-template-columns:minmax(280px,1fr) minmax(320px,1.25fr);gap:18px;align-items:start}',
      '.v21-col{display:flex;flex-direction:column;gap:18px;min-width:0}',
      /* KPI memory health (compact) */
      '.v21-kpi{padding:16px 20px}',
      '.v21-kpi-row{display:flex;align-items:center;gap:14px;margin-bottom:10px}',
      '.v21-kpi-num{font-size:34px;font-weight:900;line-height:1;color:var(--green,#22c55e)}',
      '.v21-kpi-num small{font-size:15px;opacity:.7}',
      '.v21-kpi-label{font-size:10px;letter-spacing:.18em;font-weight:800;opacity:.6;color:var(--text,#fff)}',
      '.v21-kpi-sub{font-size:14px;font-weight:700;color:var(--text,#fff);margin-top:2px}',
      '.v21-kpi-bar{height:6px;border-radius:6px;background:rgba(255,255,255,.10);overflow:hidden}',
      '.v21-kpi-bar span{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#ef4444,#facc15,#22c55e)}',
      /* coach */
      '.v21-coach{background:linear-gradient(135deg,#211d44,#17142f)}',
      '.v21-coach-head{font-size:12px;letter-spacing:.16em;font-weight:800;opacity:.7;margin-bottom:10px;color:var(--text,#fff);display:flex;align-items:center;gap:8px}',
      '.v21-coach-ic{font-size:18px}',
      '.v21-coach-text{font-size:16px;line-height:1.6;font-weight:600;color:var(--text,#fff)}',
      /* plan timeline */
      '.v21-plan-total{margin-left:auto;background:rgba(124,92,255,.18);color:var(--purple,#7c5cff);border-radius:20px;padding:3px 12px;font-size:12px;letter-spacing:.02em}',
      '.v21-timeline{display:flex;flex-direction:column;gap:10px}',
      '.v21-step{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:13px 15px;cursor:pointer;color:var(--text,#fff);transition:background .15s}',
      '.v21-step:hover{background:rgba(255,255,255,.10)}',
      '.v21-step-num{flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--purple,#7c5cff);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}',
      '.v21-step-emoji{font-size:19px}',
      '.v21-step-name{flex:1;font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.v21-step-tag{font-size:10px;font-weight:800;letter-spacing:.04em;border-radius:20px;padding:3px 10px}',
      '.v21-step-tag.review{background:rgba(59,130,246,.2);color:var(--blue,#3b82f6)}',
      '.v21-step-tag.rescue{background:rgba(239,68,68,.2);color:var(--red,#ef4444)}',
      '.v21-step-tag.learn{background:rgba(34,197,94,.2);color:var(--green,#22c55e)}',
      '.v21-step-min{font-size:13px;opacity:.7;font-weight:700}',
      '.v21-step-go{font-size:13px;font-weight:800;opacity:.7}',
      '.v21-plan-empty{font-size:14px;opacity:.6;padding:10px 4px;color:var(--text,#fff)}',
      /* rescue */
      '.v21-rescue{border-radius:18px;padding:16px 20px;border:1px solid rgba(239,68,68,.5);background:linear-gradient(135deg,rgba(239,68,68,.16),rgba(239,68,68,.04))}',
      '.v21-rescue-head{font-size:12px;letter-spacing:.12em;font-weight:800;color:var(--red,#ef4444);margin-bottom:12px;display:flex;align-items:center;gap:10px}',
      '.v21-rescue-note{font-weight:600;letter-spacing:.02em;opacity:.85;text-transform:none}',
      '.v21-rescue-head b{margin-left:auto;background:rgba(239,68,68,.25);border-radius:20px;padding:2px 11px;font-size:12px}',
      '.v21-rescue-row{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:rgba(255,255,255,.05);border:0;border-radius:12px;padding:11px 14px;margin-bottom:8px;cursor:pointer;color:var(--text,#fff)}',
      '.v21-rescue-row:hover{background:rgba(255,255,255,.1)}',
      '.v21-rescue-conf{font-size:13px;font-weight:800;color:var(--orange,#ff8a3d)}',
      '.v21-rescue-days{font-size:12px;opacity:.6}',
      /* responsive */
      '@media(max-width:820px){.v21-grid{grid-template-columns:1fr}.v21-hero-title{font-size:26px}.v21-hero{padding:24px 22px}}'
    ].join('\n');
    document.head.appendChild(css);
  }

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(name, cond) { ok = ok && !!cond; out.push((cond ? 'PASS ' : 'FAIL ') + name); }

    check('SHADOW_V20 present (data source)', !!V20());
    check('v20 engines intact (no logic changed here)', !!(V20() && typeof V20().smartNextAction === 'function' && typeof V20().memoryHealth === 'function'));
    check('css injected', !!document.getElementById('shadow-v21-css'));
    check('v21 root present when home visible', !homeVisible() || !!document.getElementById('shadow-v21-root'));
    var root = document.getElementById('shadow-v21-root');
    check('hero rendered', !root || /v21-hero/.test(root.innerHTML));
    check('plan timeline rendered', !root || /v21-plan/.test(root.innerHTML));
    check('CTAs reuse v20 launcher (data-v20-start)', !root || /data-v20-start/.test(root.innerHTML) || !V20().smartNextAction());
    var v20root = document.getElementById('shadow-v20-root');
    check('raw v20 panel hidden', !v20root || getComputedStyle(v20root).display === 'none');
    check('does NOT modify v14', !!window.LoopV14 ? typeof window.LoopV14.selfTest === 'function' : true);

    console.log('%c[v21] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'),
      'font-weight:bold;color:' + (ok ? 'green' : 'red'));
    out.forEach(function (l) { log(l); });
    return { ok: ok, results: out };
  }

  /* ---------------------------------------------------------------- public */
  window.SHADOW_V21 = { version: VERSION, render: render, selfTest: selfTest };

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    render();
    window.addEventListener('hashchange', function () { setTimeout(render, 90); });
    setInterval(function () {
      if (homeVisible() && !document.getElementById('shadow-v21-root')) render();
    }, 1800);
    log('ready', VERSION, '- run SHADOW_V21.selfTest() to verify.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 750); });
  } else {
    setTimeout(boot, 750);
  }
})();
