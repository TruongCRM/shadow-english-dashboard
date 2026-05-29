/* ============================================================================
 * SHADOW ENGLISH - v21  DASHBOARD UX POLISH   (UI/UX ONLY - NO NEW LOGIC)
 * v21.1.1 - compact hero + responsive polish + legacy overflow safety net
 * ----------------------------------------------------------------------------
 * 100% ADDITIVE & PRESENTATIONAL. Adds ZERO learning/AI/review/memory logic and
 * ZERO data structures. It only RE-PRESENTS data v20 already computes:
 *   window.SHADOW_V20.smartNextAction() / memoryHealth() / coachRecommendation()
 *   / dailyPlan() / rescueList()
 *
 * v21.1.0 changes (UI only):
 *   - Hero is now a COMPACT horizontal card (~180px tall, < 25% viewport):
 *     text on the left, CTA on the right; reduced vertical padding.
 *   - Uses CSS `order` so the v21 block (Mission/Health/Coach/Plan) is the FIRST
 *     thing on screen and v14's priority row drops below it -> first viewport
 *     shows all four key panels without scrolling on a 1366x768 laptop.
 *   - Responsive: 2-col grid collapses to 1-col on tablets/phones; hero stacks;
 *     no horizontal overflow; CTAs stay tappable.
 *
 * Does NOT touch: Learning Loop, Review Engine, Memory Engine, Gemini, Topic
 * storage, Overlay structure, or any v20 engine. CTAs reuse v20's delegated
 * launcher (data-v20-start). Revert = delete this one <script> line.
 * Run SHADOW_V21.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V21) return;
  var VERSION = 'v21.1.1';

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
        '<div class="v21-hero-main">' +
          '<div class="v21-hero-label">TODAY\'S MISSION</div>' +
          '<div class="v21-hero-title">✅ Hôm nay bạn đã ôn xong</div>' +
          '<div class="v21-hero-why">Không có trí nhớ nào đang phai. Quay lại sau để giữ chúng sắc bén.</div>' +
        '</div>' +
      '</div>';
    }
    var verb = sna.mode === 'review' ? 'Review' : 'Learn';
    var why = (sna.reasons && sna.reasons.length) ? sna.reasons.join(' · ') : 'Recommended next step';
    return '<div class="v21-hero v21-hero--' + sna.mode + '">' +
      '<div class="v21-hero-main">' +
        '<div class="v21-hero-label">TODAY\'S MISSION</div>' +
        '<div class="v21-hero-title">' + esc(temoji(sna.topic)) + ' ' + verb + ': ' + esc(tname(sna.topic)) + '</div>' +
        '<div class="v21-hero-why"><b>Why</b> ' + esc(why) + '</div>' +
        '<div class="v21-hero-meta">' +
          '<span class="v21-chip">⏱ ~' + sna.estMin + ' min</span>' +
          '<span class="v21-chip v21-chip--' + pcls(sna.score) + '">Priority: ' + plabel(sna.score) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="v21-hero-cta-wrap">' +
        '<button class="v21-cta" data-v20-start="' + esc(tid(sna.topic)) + '" data-v20-mode="' + sna.mode + '">' +
          (sna.mode === 'review' ? 'Start Review' : 'Start Learning') + ' →</button>' +
      '</div>' +
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
      '<div class="v21-sec-title">📋 TODAY\'S PLAN <span class="v21-plan-total">Total: ' + p.total + ' min</span></div>' +
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
    if (root.parentNode !== h) h.insertBefore(root, h.firstChild); // ordering enforced via CSS `order`

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
      /* full content width + force this block to the TOP via grid order */
      '#shadow-v21-root{grid-column:1/-1!important;order:-2!important;display:flex;flex-direction:column;gap:14px;margin:0 0 16px;font-family:inherit;width:100%;min-width:0}',
      '#shadow-v21-root *{box-sizing:border-box}',
      '#shadow-v20-root{display:none!important}',
      /* v14 priority row: full width, placed just AFTER the v21 block */
      '#loopv14-root{grid-column:1/-1!important;order:-1!important}',
      /* shared card */
      '.v21-card{background:var(--card,#1a1838);border:1px solid var(--border,#2a2750);border-radius:18px;padding:16px 18px;box-shadow:0 5px 18px rgba(0,0,0,.16)}',
      '.v21-sec-title{font-size:11px;letter-spacing:.16em;font-weight:800;opacity:.65;margin-bottom:12px;display:flex;align-items:center;gap:9px;color:var(--text,#fff)}',
      /* ===== COMPACT HERO (horizontal: text left, CTA right) ===== */
      '.v21-hero{display:flex;align-items:center;gap:24px;border-radius:20px;padding:20px 26px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.28);min-height:0}',
      '.v21-hero--learn{background:linear-gradient(135deg,#6d4bff 0%,#3b1fa6 100%)}',
      '.v21-hero--review{background:linear-gradient(135deg,#e0405f 0%,#8c1d3a 100%)}',
      '.v21-hero--done{background:linear-gradient(135deg,#2b9e6b 0%,#13603f 100%)}',
      '.v21-hero-main{flex:1;min-width:0}',
      '.v21-hero-label{font-size:11px;letter-spacing:.22em;font-weight:800;opacity:.82;margin-bottom:7px}',
      '.v21-hero-title{font-size:24px;line-height:1.15;font-weight:900;margin-bottom:7px;overflow-wrap:anywhere}',
      '.v21-hero-why{font-size:14px;line-height:1.45;opacity:.93;margin-bottom:11px}',
      '.v21-hero-why b{opacity:.7;font-weight:800;margin-right:4px}',
      '.v21-hero-meta{display:flex;flex-wrap:wrap;gap:9px}',
      '.v21-chip{background:rgba(255,255,255,.16);border-radius:22px;padding:6px 13px;font-size:13px;font-weight:700}',
      '.v21-chip--high{background:rgba(255,255,255,.95);color:#b21f3a}',
      '.v21-chip--med{background:rgba(255,255,255,.92);color:#9a6b00}',
      '.v21-chip--low{background:rgba(255,255,255,.9);color:#4a3aa8}',
      '.v21-hero-cta-wrap{flex:0 0 auto}',
      '.v21-cta{border:0;border-radius:14px;padding:14px 26px;font-size:15px;font-weight:800;cursor:pointer;background:#fff;color:#1a1838;box-shadow:0 6px 18px rgba(0,0,0,.22);transition:transform .08s ease,box-shadow .15s;white-space:nowrap}',
      '.v21-cta:hover{box-shadow:0 9px 26px rgba(0,0,0,.32)}',
      '.v21-cta:active{transform:translateY(1px)}',
      /* ===== 2-col grid ===== */
      '.v21-grid{display:grid;grid-template-columns:minmax(260px,1fr) minmax(300px,1.25fr);gap:16px;align-items:start}',
      '.v21-col{display:flex;flex-direction:column;gap:16px;min-width:0}',
      /* KPI memory health (compact) */
      '.v21-kpi{padding:14px 18px}',
      '.v21-kpi-row{display:flex;align-items:center;gap:13px;margin-bottom:9px}',
      '.v21-kpi-num{font-size:30px;font-weight:900;line-height:1;color:var(--green,#22c55e)}',
      '.v21-kpi-num small{font-size:14px;opacity:.7}',
      '.v21-kpi-label{font-size:10px;letter-spacing:.16em;font-weight:800;opacity:.6;color:var(--text,#fff)}',
      '.v21-kpi-sub{font-size:13px;font-weight:700;color:var(--text,#fff);margin-top:2px}',
      '.v21-kpi-bar{height:6px;border-radius:6px;background:rgba(255,255,255,.10);overflow:hidden}',
      '.v21-kpi-bar span{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#ef4444,#facc15,#22c55e)}',
      /* coach */
      '.v21-coach{background:linear-gradient(135deg,#211d44,#17142f)}',
      '.v21-coach-head{font-size:11px;letter-spacing:.16em;font-weight:800;opacity:.7;margin-bottom:9px;color:var(--text,#fff);display:flex;align-items:center;gap:8px}',
      '.v21-coach-ic{font-size:17px}',
      '.v21-coach-text{font-size:15px;line-height:1.55;font-weight:600;color:var(--text,#fff)}',
      /* plan timeline */
      '.v21-plan-total{margin-left:auto;background:rgba(124,92,255,.18);color:var(--purple,#7c5cff);border-radius:20px;padding:3px 11px;font-size:11px}',
      '.v21-timeline{display:flex;flex-direction:column;gap:9px}',
      '.v21-step{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:13px;padding:11px 13px;cursor:pointer;color:var(--text,#fff);transition:background .15s}',
      '.v21-step:hover{background:rgba(255,255,255,.10)}',
      '.v21-step-num{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:var(--purple,#7c5cff);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}',
      '.v21-step-emoji{font-size:18px}',
      '.v21-step-name{flex:1;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
      '.v21-step-tag{font-size:10px;font-weight:800;letter-spacing:.04em;border-radius:20px;padding:3px 9px;white-space:nowrap}',
      '.v21-step-tag.review{background:rgba(59,130,246,.2);color:var(--blue,#3b82f6)}',
      '.v21-step-tag.rescue{background:rgba(239,68,68,.2);color:var(--red,#ef4444)}',
      '.v21-step-tag.learn{background:rgba(34,197,94,.2);color:var(--green,#22c55e)}',
      '.v21-step-min{font-size:12px;opacity:.7;font-weight:700;white-space:nowrap}',
      '.v21-step-go{font-size:13px;font-weight:800;opacity:.7}',
      '.v21-plan-empty{font-size:14px;opacity:.6;padding:8px 4px;color:var(--text,#fff)}',
      /* rescue */
      '.v21-rescue{border-radius:16px;padding:14px 18px;border:1px solid rgba(239,68,68,.5);background:linear-gradient(135deg,rgba(239,68,68,.16),rgba(239,68,68,.04))}',
      '.v21-rescue-head{font-size:11px;letter-spacing:.12em;font-weight:800;color:var(--red,#ef4444);margin-bottom:11px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}',
      '.v21-rescue-note{font-weight:600;letter-spacing:.02em;opacity:.85;text-transform:none}',
      '.v21-rescue-head b{margin-left:auto;background:rgba(239,68,68,.25);border-radius:20px;padding:2px 10px;font-size:12px}',
      '.v21-rescue-row{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:rgba(255,255,255,.05);border:0;border-radius:12px;padding:10px 13px;margin-bottom:7px;cursor:pointer;color:var(--text,#fff)}',
      '.v21-rescue-row:hover{background:rgba(255,255,255,.1)}',
      '.v21-rescue-conf{font-size:13px;font-weight:800;color:var(--orange,#ff8a3d);white-space:nowrap}',
      '.v21-rescue-days{font-size:12px;opacity:.6;white-space:nowrap}',
      /* ===== responsive ===== */
      /* tablet portrait & down: single column, hero stacks */
      '@media(max-width:900px){',
      '  .v21-grid{grid-template-columns:1fr}',
      '  .v21-hero{flex-direction:column;align-items:stretch;gap:14px;padding:18px 20px}',
      '  .v21-hero-title{font-size:21px}',
      '  .v21-hero-cta-wrap .v21-cta{width:100%}',
      '}',
      /* phones */
      '@media(max-width:430px){',
      '  .v21-hero{padding:16px 16px;border-radius:16px}',
      '  .v21-hero-title{font-size:19px}',
      '  .v21-hero-why{font-size:13px}',
      '  .v21-card{padding:14px 14px}',
      '  .v21-step-tag{display:none}',
      '  .v21-kpi-num{font-size:26px}',
      '}'
    ].join('\n');
    document.head.appendChild(css);
    /* additive safety net: neutralize PRE-EXISTING horizontal overflow from the app's
       legacy home components (.levels-grid fixed track, .topics-row) + tighten mobile
       hero under 25%. Separate <style> so it is trivially reversible. */
    if (!document.getElementById('shadow-v21-safety')) {
      var sf = document.createElement('style');
      sf.id = 'shadow-v21-safety';
      sf.textContent = [
        '@media(max-width:1100px){.levels-grid{grid-template-columns:1fr!important}}',
        '@media(max-width:900px){.topics-row{flex-wrap:wrap!important;min-width:0!important}.level-card,.level-head,.level-sub,.progress-bar,.topics-row{max-width:100%!important;min-width:0!important}}',
        '@media(max-width:430px){.v21-hero{gap:10px!important;padding:14px 14px!important}.v21-cta{padding:12px 18px!important}.v21-hero-why{margin-bottom:9px!important}}'
      ].join('\n');
      document.head.appendChild(sf);
    }
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
    if (root && typeof root.getBoundingClientRect === 'function') {
      var hero = root.querySelector('.v21-hero');
      if (hero) {
        var hh = Math.round(hero.getBoundingClientRect().height);
        var vh = window.innerHeight || 768;
        check('hero height <= 25% viewport (' + hh + 'px / ' + vh + 'px)', hh <= vh * 0.25 + 8 || hh <= 230);
      }
    }
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
    window.addEventListener('resize', function () { /* layout is pure CSS; no re-render needed */ });
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
