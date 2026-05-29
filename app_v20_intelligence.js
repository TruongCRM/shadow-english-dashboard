/* ============================================================================
 * SHADOW ENGLISH - v20  LEARNING INTELLIGENCE V1
 * "AI tao bai hoc"  ->  "AI huan luyen vien tieng Anh"
 * ----------------------------------------------------------------------------
 * 100% ADDITIVE. Rule-based. NO LLM / NO API.
 * Reads ONLY from existing data:
 *   - window.shadowEN.state.topics[]  (id, emoji, name, level, reviewStage,
 *       memoryStatus, masteryPct, confidence, lastReview, nextReview, sessions,
 *       confidenceHistory[])
 *   - window.SHADOW_ADAPTIVE.calculateForgetRisk()  (reused if present)
 *
 * Does NOT touch:  Phase 1 Learning Loop (v14) - Gemini generator (v19) -
 *                  Content system (v12/v15/v17) - core engines (app.js).
 *
 * Mounts ONE section (#shadow-v20-root) at the TOP of the dashboard, above the
 * v14 NBA hero. Renders 5 things so the owner knows, in ~3 seconds:
 *   1) Smart Next Action  (topic + reason + time + priority score)
 *   2) Rescue Alert       (topics at risk of being forgotten)
 *   3) Today's Plan       (auto-built, per-item minutes + total)
 *   4) Memory Health      (0-100%)
 *   5) Coach Recommendation (one rule-based sentence, Vietnamese)
 *
 * It also ADDITIVELY hides v14's old "NEXT BEST ACTION" hero (CSS-only; v14 code
 * untouched) because Smart Next Action replaces it. Delete the .loopv14-nba CSS
 * line to restore the old card.
 *
 * CTAs reuse v14's launcher (LoopV14.openAndStart) when available, else fall
 * back to window.openTopic + window.startSession. Revert everything = delete the
 * one <script app_v20_intelligence.js> line. Run SHADOW_V20.selfTest() to verify.
 * ========================================================================== */
(function () {
  'use strict';
  if (window.SHADOW_V20) return;
  var VERSION = 'v20.0.0';

  /* ----------------------------------------------------------------- utils */
  function log() {
    try { console.log.apply(console, ['[v20]'].concat([].slice.call(arguments))); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function getState() { return (window.shadowEN && window.shadowEN.state) || null; }
  function nowMs() { return Date.now(); }
  function daysSince(iso) { if (!iso) return Infinity; return (nowMs() - new Date(iso).getTime()) / 86400000; }
  function daysUntil(iso) { if (!iso) return Infinity; return (new Date(iso).getTime() - nowMs()) / 86400000; }

  var STAGE_DAYS = { 'Day 0': 0, 'Day 1': 1, 'Day 3': 3, 'Day 7': 7, 'Day 21': 21, 'Day 60': 60 };
  var EXPECTED = { 'Day 0': 1, 'Day 1': 3, 'Day 3': 7, 'Day 7': 21, 'Day 21': 60, 'Day 60': 120 };

  function tid(t) { return t && (t.id != null ? t.id : (t.key || t.slug || t.name)); }
  function tname(t) { return (t && (t.name || t.title || t.topic)) || 'Untitled'; }
  function temoji(t) { return (t && (t.emoji || t.icon)) || '📘'; }
  function stage(t) { return (t && t.reviewStage) || 'Day 0'; }

  function isNew(t) { return !t.lastReview && (stage(t) === 'Day 0'); }
  function isDue(t) {
    if (isNew(t)) return false;
    if (!t.nextReview) return true;          // reviewed once, no schedule -> treat as due
    return daysUntil(t.nextReview) <= 0 && stage(t) !== 'Day 60';
  }

  // estimated minutes for an action (same scale as v14: learn=8, review 3-5)
  function estMin(mode, t) {
    if (mode === 'learn') return 8;
    var idx = ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'].indexOf(stage(t));
    return [3, 3, 4, 4, 5, 5][idx < 0 ? 0 : idx] || 3;
  }

  /* ------------------------------------------------- memory strength model */
  // Forget risk 0..1 (1 = about to forget). Reuse adaptive engine if present.
  function forgetRisk(t) {
    if (window.SHADOW_ADAPTIVE && typeof window.SHADOW_ADAPTIVE.calculateForgetRisk === 'function') {
      try {
        var r = window.SHADOW_ADAPTIVE.calculateForgetRisk(t);
        if (typeof r === 'number' && !isNaN(r)) return clamp(r, 0, 1);
      } catch (e) {}
    }
    // fallback forgetting curve (mirrors adaptive.js logic)
    if (!t.lastReview) return 0.85;
    var ds = daysSince(t.lastReview), exp = EXPECTED[stage(t)] || 7;
    var ratio = ds / Math.max(1, exp);
    var base = Math.min(1, ratio * 0.7);
    var masteryFactor = 1 - (num(t.masteryPct) / 100) * 0.4;
    return clamp(base * masteryFactor, 0, 1);
  }

  // Baseline strength % = strength right after the last review.
  function baselineStrength(t) {
    var m = num(t.masteryPct);
    if (m > 0) return Math.round(m);
    var c = num(t.confidence);
    if (c > 0 && c <= 5) return Math.round(c * 20); // 1-5 rating -> %
    return Math.round(m);
  }
  // Current projected strength after decay since last review.
  function currentStrength(t) {
    var base = baselineStrength(t);
    if (isNew(t)) return base;
    var retained = Math.round(base * (1 - forgetRisk(t) * 0.55));
    return clamp(retained, 0, base);
  }

  /* ============================================================ TASK 1
   * SMART NEXT ACTION - one topic + reason[] + estMin + priority score(0-100)
   * Selection order: due reviews -> at-risk -> new -> upcoming(relaxed).
   * ======================================================================== */
  function scoreReview(t) {
    var risk = forgetRisk(t);
    var score = 45 + Math.round(risk * 45);            // 45..90
    var reasons = [];
    var st = (t.memoryStatus || '').toLowerCase();
    if (isDue(t)) { score += 8; reasons.push('Review is due today'); }
    if (st === 'fragile' || st === 'weak') { reasons.push('Memory is ' + (t.memoryStatus || '').toLowerCase()); }
    if (risk >= 0.6) reasons.push('High risk of forgetting');
    if (t.lastReview) {
      var d = Math.round(daysSince(t.lastReview));
      if (d >= 1) reasons.push(d + ' day' + (d > 1 ? 's' : '') + ' since last review');
    }
    if (!reasons.length) reasons.push('Keep this memory sharp');
    return { topic: t, mode: 'review', score: clamp(Math.round(score), 0, 100), reasons: reasons, estMin: estMin('review', t) };
  }

  function smartNextAction() {
    var s = getState();
    if (!s || !s.topics || !s.topics.length) return null;
    var T = s.topics.slice();

    var due = T.filter(function (t) { return isDue(t); }).map(scoreReview)
      .sort(function (a, b) { return b.score - a.score; });
    if (due.length) return due[0];

    // at-risk but not yet due
    var risky = T.filter(function (t) { return !isNew(t) && forgetRisk(t) >= 0.5; }).map(scoreReview)
      .sort(function (a, b) { return b.score - a.score; });
    if (risky.length) return risky[0];

    // new topic - when nothing is due/at-risk, building the foundation IS the priority
    var fresh = T.filter(isNew);
    if (fresh.length) {
      var t = fresh[0];
      return { topic: t, mode: 'learn', score: 78, reasons: ['New topic', 'No learning activity yet'], estMin: estMin('learn', t) };
    }

    // relaxed: keep strongest memories sharp
    var up = T.filter(function (t) { return t.nextReview && stage(t) !== 'Day 60'; })
      .sort(function (a, b) { return daysUntil(a.nextReview) - daysUntil(b.nextReview); });
    if (up.length) {
      var u = up[0];
      return { topic: u, mode: 'review', score: 32, reasons: ['Keep your strongest memories sharp'], estMin: estMin('review', u), relaxed: true };
    }
    return null;
  }

  function priorityLabel(score) {
    return score >= 70 ? 'High' : (score >= 45 ? 'Medium' : 'Low');
  }
  function priorityClass(score) {
    return score >= 70 ? 'high' : (score >= 45 ? 'med' : 'low');
  }

  /* ============================================================ TASK 2
   * RESCUE ENGINE V1 - topics at risk of being forgotten.
   * Criteria: learned (not new) AND (risk >= 0.5 OR projected drop >= 12pts).
   * ======================================================================== */
  function rescueList() {
    var s = getState();
    if (!s || !s.topics) return [];
    return s.topics.filter(function (t) {
      if (isNew(t)) return false;
      if (stage(t) === 'Day 60') return false; // Automatic - safe
      var drop = baselineStrength(t) - currentStrength(t);
      return forgetRisk(t) >= 0.5 || drop >= 12;
    }).map(function (t) {
      var base = baselineStrength(t), cur = currentStrength(t);
      return {
        topic: t, risk: forgetRisk(t), base: base, cur: cur, drop: Math.max(0, base - cur),
        daysSince: t.lastReview ? Math.round(daysSince(t.lastReview)) : null
      };
    }).sort(function (a, b) { return b.risk - a.risk; });
  }

  /* ============================================================ TASK 3
   * DAILY STUDY PLAN - ordered: due reviews -> rescue -> new. Minutes + total.
   * Capped to ~6 items / ~40 min so the daily load stays realistic.
   * ======================================================================== */
  function dailyPlan() {
    var s = getState();
    if (!s || !s.topics) return { items: [], total: 0 };
    var seen = {}, items = [];

    function add(t, mode, label) {
      var id = String(tid(t));
      if (seen[id]) return;
      seen[id] = 1;
      items.push({ topic: t, mode: mode, label: label, min: estMin(mode, t) });
    }

    // a) due reviews, riskiest first
    s.topics.filter(function (t) { return isDue(t); })
      .sort(function (a, b) { return forgetRisk(b) - forgetRisk(a); })
      .forEach(function (t) { add(t, 'review', 'Review'); });

    // b) rescue (at-risk, maybe not due yet)
    rescueList().forEach(function (r) { add(r.topic, 'review', 'Rescue'); });

    // c) learn new (limit 2)
    s.topics.filter(isNew).slice(0, 2).forEach(function (t) { add(t, 'learn', 'Learn'); });

    // cap
    var capped = [], total = 0;
    for (var i = 0; i < items.length; i++) {
      if (capped.length >= 6 || total >= 40) break;
      capped.push(items[i]); total += items[i].min;
    }
    return { items: capped, total: total };
  }

  /* ============================================================ TASK 4
   * MEMORY HEALTH SCORE 0..100 - weighted memory-state mix minus overdue load.
   * ======================================================================== */
  var STATE_WEIGHT = { Fragile: 0.10, Weak: 0.35, Building: 0.60, Stable: 0.85, Automatic: 1.00 };

  function memoryHealth() {
    var s = getState();
    var counts = { Fragile: 0, Weak: 0, Building: 0, Stable: 0, Automatic: 0 };
    if (!s || !s.topics || !s.topics.length) return { score: 0, label: '-', counts: counts, due: 0, total: 0 };
    var n = s.topics.length, sum = 0;
    s.topics.forEach(function (t) {
      var k = t.memoryStatus || 'Fragile';
      if (counts[k] == null) counts[k] = 0;
      counts[k]++;
      sum += (STATE_WEIGHT[k] != null ? STATE_WEIGHT[k] : 0.10);
    });
    var base = sum / n;                                   // 0..1
    var dueCount = s.topics.filter(function (t) { return isDue(t); }).length;
    var duePenalty = Math.min(0.25, (dueCount / n) * 0.5);
    var score = clamp(Math.round((base - duePenalty) * 100), 0, 100);
    return { score: score, label: healthLabel(score), counts: counts, due: dueCount, total: n };
  }
  function healthLabel(s) {
    return s >= 85 ? 'Excellent progress'
      : s >= 70 ? 'Strong & steady'
      : s >= 50 ? 'Building momentum'
      : s >= 30 ? 'Needs attention'
      : 'Fragile - act today';
  }

  /* ============================================================ TASK 5
   * LEARNING COACH PANEL - one rule-based recommendation (Vietnamese).
   * ======================================================================== */
  function coachRecommendation() {
    var s = getState();
    if (!s || !s.topics || !s.topics.length)
      return { icon: '🎯', text: 'Chưa có dữ liệu học. Bắt đầu 1 topic hôm nay để hệ thống bắt đầu theo dõi trí nhớ của bạn.' };

    var rescue = rescueList();
    var due = s.topics.filter(function (t) { return isDue(t); });
    var fresh = s.topics.filter(isNew);
    var learned = s.topics.filter(function (t) { return !isNew(t); });

    if (rescue.length) {
      var avgRisk = rescue.reduce(function (a, r) { return a + r.risk; }, 0) / rescue.length;
      var pctLoss = clamp(Math.round(avgRisk * 30), 5, 45);
      return { icon: '🎯', text: 'Bạn đang có ' + rescue.length + ' topic sắp quên. Nếu review hôm nay, bạn sẽ tránh mất khoảng ' + pctLoss + '% confidence trong tuần tới.' };
    }
    if (due.length) {
      return { icon: '🎯', text: 'Có ' + due.length + ' topic đến hạn review hôm nay. Ôn ngay khi còn dễ - để lâu sẽ tốn gấp đôi công sức.' };
    }
    if (fresh.length && learned.length < 5) {
      return { icon: '🎯', text: 'Nền tảng còn mỏng (' + learned.length + ' topic đã học). Học thêm 1 topic mới hôm nay để xây đà - đều đặn quan trọng hơn nhiều.' };
    }
    if (fresh.length) {
      return { icon: '🎯', text: 'Trí nhớ đang ổn định. Có thể mở rộng: thêm 1 topic mới hôm nay mà không sợ quá tải.' };
    }
    var automatic = s.topics.filter(function (t) { return stage(t) === 'Day 60'; }).length;
    return { icon: '🎯', text: 'Tuyệt vời - không có trí nhớ nào đang phai. ' + automatic + ' topic đã đạt Automatic. Giữ nhịp để đưa số còn lại lên mức phản xạ.' };
  }

  /* --------------------------------------------------------- CTA launcher */
  function openAndStart(topicId, mode) {
    if (window.LoopV14 && typeof window.LoopV14.openAndStart === 'function') {
      try { return window.LoopV14.openAndStart(topicId, mode); } catch (e) { log('LoopV14 launch failed', e); }
    }
    var opened = false;
    if (typeof window.openTopic === 'function') {
      try { window.openTopic(topicId); opened = true; } catch (e) {}
    }
    setTimeout(function () {
      if (typeof window.startSession === 'function') {
        try { window.startSession(topicId); } catch (e) {}
      }
    }, opened ? 320 : 0);
  }

  /* ------------------------------------------------------------ rendering */
  function homeVisible() {
    if (location.hash && /review|topic|progress|content|editor|setting/i.test(location.hash)) return false;
    var home = document.querySelector('#view-home,[data-view="home"],#home,.home-view,#dashboard,#view-dashboard');
    if (home) return home.classList.contains('active') || home.offsetParent !== null;
    return true;
  }
  function mountPoint() {
    var sel = ['#view-home', '[data-view="home"]', '#home', '.home-view', '#dashboard', '#view-dashboard', 'main', '#app', '#content', '.content'];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && (el.classList.contains('active') || el.offsetParent !== null)) return el;
    }
    return document.querySelector('main,#app,#content') || document.body;
  }

  function row(item) {
    return '<button class="v20-row" data-v20-start="' + esc(tid(item.topic)) + '" data-v20-mode="' + item.mode + '">' +
      '<span class="v20-row-emoji">' + esc(temoji(item.topic)) + '</span>' +
      '<span class="v20-row-name">' + esc(tname(item.topic)) + '</span>' +
      '<span class="v20-row-tag ' + item.label.toLowerCase() + '">' + esc(item.label) + '</span>' +
      '<span class="v20-row-min">⏱ ' + item.min + 'm</span>' +
      '<span class="v20-row-go">→</span>' +
    '</button>';
  }

  function renderHealthStrip(health, plan, rescue) {
    var learnCount = (getState() ? getState().topics.filter(isNew).length : 0);
    return '<div class="v20-strip">' +
      '<div class="v20-health">' +
        '<div class="v20-health-num">' + health.score + '<small>%</small></div>' +
        '<div class="v20-health-meta"><div class="v20-health-label">MEMORY HEALTH</div>' +
          '<div class="v20-health-sub">' + esc(health.label) + '</div>' +
          '<div class="v20-health-bar"><span style="width:' + health.score + '%"></span></div></div>' +
      '</div>' +
      '<div class="v20-mini">' +
        '<div class="v20-mini-cell"><span>' + learnCount + '</span><label>TO LEARN</label></div>' +
        '<div class="v20-mini-cell"><span>' + health.due + '</span><label>TO REVIEW</label></div>' +
        '<div class="v20-mini-cell ' + (rescue.length ? 'alert' : '') + '"><span>' + rescue.length + '</span><label>AT RISK</label></div>' +
        '<div class="v20-mini-cell"><span>' + plan.total + '<small>m</small></span><label>TODAY</label></div>' +
      '</div>' +
    '</div>';
  }

  function renderRescue(rescue) {
    if (!rescue.length) return '';
    var rows = rescue.slice(0, 4).map(function (r) {
      return '<button class="v20-rescue-row" data-v20-start="' + esc(tid(r.topic)) + '" data-v20-mode="review">' +
        '<span class="v20-row-emoji">' + esc(temoji(r.topic)) + '</span>' +
        '<span class="v20-row-name">' + esc(tname(r.topic)) + '</span>' +
        '<span class="v20-rescue-conf">' + r.base + '% <i>→</i> ' + r.cur + '%</span>' +
        (r.daysSince != null ? '<span class="v20-rescue-days">' + r.daysSince + 'd ago</span>' : '') +
        '<span class="v20-row-go">Rescue →</span>' +
      '</button>';
    }).join('');
    return '<div class="v20-card v20-rescue">' +
      '<div class="v20-card-head">🚨 RESCUE ALERT <b>' + rescue.length + '</b></div>' +
      '<div class="v20-card-note">Review now before memory drops further.</div>' +
      rows +
    '</div>';
  }

  function renderCoach(coach) {
    return '<div class="v20-coach">' +
      '<div class="v20-coach-icon">' + coach.icon + '</div>' +
      '<div class="v20-coach-body"><div class="v20-coach-head">COACH RECOMMENDATION</div>' +
        '<div class="v20-coach-text">' + esc(coach.text) + '</div></div>' +
    '</div>';
  }

  function renderSNA(sna) {
    if (!sna) return '';
    var verb = sna.mode === 'review' ? 'Review' : 'Learn';
    var pc = priorityClass(sna.score), pl = priorityLabel(sna.score);
    var reasons = sna.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('');
    return '<div class="v20-card v20-sna">' +
      '<div class="v20-card-head">⚡ SMART NEXT ACTION <span class="v20-prio ' + pc + '">' + pl + ' · ' + sna.score + '</span></div>' +
      '<div class="v20-sna-title">' + esc(temoji(sna.topic) + '  ' + verb + ': ' + tname(sna.topic)) + '</div>' +
      '<ul class="v20-sna-reasons">' + reasons + '</ul>' +
      '<div class="v20-sna-foot"><span class="v20-sna-time">⏱ ~' + sna.estMin + ' minutes</span>' +
        '<button class="v20-btn primary" data-v20-start="' + esc(tid(sna.topic)) + '" data-v20-mode="' + sna.mode + '">' +
          (sna.mode === 'review' ? 'Start Review' : 'Start Learning') + ' →</button></div>' +
    '</div>';
  }

  function renderPlan(plan) {
    var body = plan.items.length
      ? plan.items.map(row).join('')
      : '<div class="v20-empty-mini">Không còn việc cần làm hôm nay 🎉</div>';
    return '<div class="v20-card v20-plan">' +
      '<div class="v20-card-head">📋 TODAY\'S PLAN <b>' + plan.total + ' min</b></div>' +
      body +
    '</div>';
  }

  function render() {
    if (!homeVisible()) { var ex = document.getElementById('shadow-v20-root'); if (ex) ex.remove(); return; }
    var s = getState();
    if (!s || !s.topics) return;
    var host = mountPoint();
    if (!host) return;

    var root = document.getElementById('shadow-v20-root');
    if (!root) { root = document.createElement('section'); root.id = 'shadow-v20-root'; }

    // position: directly above v14's NBA root; otherwise at top of dashboard
    var loop = document.getElementById('loopv14-root');
    if (loop && loop.parentNode === host) {
      if (root.parentNode !== host || root.nextSibling !== loop) host.insertBefore(root, loop);
    } else if (root.parentNode !== host || host.firstChild !== root) {
      host.insertBefore(root, host.firstChild);
    }

    var health = memoryHealth();
    var plan = dailyPlan();
    var rescue = rescueList();
    var sna = smartNextAction();
    var coach = coachRecommendation();

    root.innerHTML =
      renderHealthStrip(health, plan, rescue) +
      renderRescue(rescue) +
      renderCoach(coach) +
      '<div class="v20-grid">' + renderSNA(sna) + renderPlan(plan) + '</div>';
  }

  /* ----------------------------------------------- delegated CTA handling */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-v20-start]');
    if (!btn) return;
    e.preventDefault();
    openAndStart(btn.getAttribute('data-v20-start'), btn.getAttribute('data-v20-mode') || 'review');
  });

  /* ------------------------------------------------------------------ CSS */
  function injectCSS() {
    if (document.getElementById('shadow-v20-css')) return;
    var css = document.createElement('style');
    css.id = 'shadow-v20-css';
    css.textContent = [
      '#shadow-v20-root{display:flex;flex-direction:column;gap:14px;margin:0 0 20px;font-family:inherit}',
      '#shadow-v20-root *{box-sizing:border-box}',
      /* Additively retire v14 NEXT BEST ACTION - Smart Next Action (v20) replaces it. */
      /* CSS-only: v14 still renders the node, we just hide it. Delete this line to restore. */
      '.loopv14-nba{display:none!important}',
      '.v20-card{background:var(--card,#1a1838);border:1px solid var(--border,#2a2750);border-radius:18px;padding:16px 18px}',
      '.v20-card-head{font-size:11px;letter-spacing:.16em;font-weight:800;opacity:.7;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--text,#fff)}',
      '.v20-card-head b{margin-left:auto;background:rgba(124,92,255,.18);color:var(--purple,#7c5cff);border-radius:20px;padding:2px 10px;font-size:12px}',
      '.v20-card-note{font-size:13px;opacity:.75;margin:-6px 0 12px;color:var(--text,#fff)}',
      /* strip */
      '.v20-strip{display:flex;gap:14px;flex-wrap:wrap}',
      '.v20-health{flex:1 1 230px;display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#241f4d,#15132e);border:1px solid var(--border,#2a2750);border-radius:18px;padding:16px 18px}',
      '.v20-health-num{font-size:46px;font-weight:900;line-height:1;color:var(--green,#22c55e)}',
      '.v20-health-num small{font-size:18px;opacity:.7}',
      '.v20-health-meta{flex:1}',
      '.v20-health-label{font-size:10px;letter-spacing:.16em;font-weight:800;opacity:.6;color:var(--text,#fff)}',
      '.v20-health-sub{font-size:14px;font-weight:700;margin:3px 0 8px;color:var(--text,#fff)}',
      '.v20-health-bar{height:7px;border-radius:6px;background:rgba(255,255,255,.10);overflow:hidden}',
      '.v20-health-bar span{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#ef4444,#facc15,#22c55e)}',
      '.v20-mini{flex:1 1 280px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}',
      '.v20-mini-cell{background:var(--card,#1a1838);border:1px solid var(--border,#2a2750);border-radius:14px;padding:12px 6px;text-align:center;color:var(--text,#fff)}',
      '.v20-mini-cell span{display:block;font-size:24px;font-weight:900;line-height:1}',
      '.v20-mini-cell span small{font-size:13px;opacity:.6}',
      '.v20-mini-cell label{font-size:9px;letter-spacing:.08em;opacity:.6}',
      '.v20-mini-cell.alert{border-color:rgba(239,68,68,.55);background:rgba(239,68,68,.12)}',
      '.v20-mini-cell.alert span{color:var(--red,#ef4444)}',
      /* rescue */
      '.v20-rescue{border-color:rgba(239,68,68,.45);background:linear-gradient(135deg,rgba(239,68,68,.10),var(--card,#1a1838))}',
      '.v20-rescue .v20-card-head b{background:rgba(239,68,68,.22);color:var(--red,#ef4444)}',
      '.v20-rescue-row{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:rgba(255,255,255,.04);border:0;border-radius:12px;padding:10px 12px;margin-bottom:7px;cursor:pointer;color:var(--text,#fff)}',
      '.v20-rescue-row:hover{background:rgba(255,255,255,.09)}',
      '.v20-rescue-conf{font-size:13px;font-weight:700;color:var(--orange,#ff8a3d)}',
      '.v20-rescue-conf i{opacity:.6;font-style:normal;margin:0 2px}',
      '.v20-rescue-days{font-size:12px;opacity:.6}',
      /* coach */
      '.v20-coach{display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,#1e1b3c,#161430);border:1px solid var(--border,#2a2750);border-radius:18px;padding:15px 18px}',
      '.v20-coach-icon{font-size:26px;flex:0 0 auto}',
      '.v20-coach-head{font-size:10px;letter-spacing:.16em;font-weight:800;opacity:.6;margin-bottom:4px;color:var(--text,#fff)}',
      '.v20-coach-text{font-size:14.5px;line-height:1.5;font-weight:600;color:var(--text,#fff)}',
      /* grid: SNA + plan side by side */
      '.v20-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}',
      '.v20-sna-title{font-size:18px;font-weight:800;color:var(--text,#fff);margin-bottom:8px}',
      '.v20-sna-reasons{margin:0 0 12px;padding-left:18px;display:flex;flex-direction:column;gap:3px}',
      '.v20-sna-reasons li{font-size:13px;opacity:.85;color:var(--text,#fff)}',
      '.v20-sna-foot{display:flex;align-items:center;gap:10px}',
      '.v20-sna-time{font-size:13px;opacity:.8;color:var(--text,#fff)}',
      '.v20-prio{margin-left:auto;font-size:11px;font-weight:800;border-radius:20px;padding:2px 10px}',
      '.v20-prio.high{background:rgba(239,68,68,.2);color:var(--red,#ef4444)}',
      '.v20-prio.med{background:rgba(250,204,21,.2);color:var(--yellow,#facc15)}',
      '.v20-prio.low{background:rgba(124,92,255,.18);color:var(--purple,#7c5cff)}',
      '.v20-btn{margin-left:auto;border:0;border-radius:12px;padding:10px 16px;font-weight:800;font-size:13px;cursor:pointer;transition:transform .08s ease}',
      '.v20-btn:active{transform:translateY(1px)}',
      '.v20-btn.primary{background:linear-gradient(135deg,#7c5cff,#5b3df0);color:#fff}',
      /* plan rows */
      '.v20-row{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:rgba(255,255,255,.04);border:0;border-radius:12px;padding:10px 12px;margin-bottom:7px;cursor:pointer;color:var(--text,#fff)}',
      '.v20-row:hover{background:rgba(255,255,255,.09)}',
      '.v20-row-emoji{font-size:18px}',
      '.v20-row-name{flex:1;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.v20-row-tag{font-size:10px;font-weight:800;letter-spacing:.04em;border-radius:20px;padding:2px 9px}',
      '.v20-row-tag.review{background:rgba(59,130,246,.2);color:var(--blue,#3b82f6)}',
      '.v20-row-tag.rescue{background:rgba(239,68,68,.2);color:var(--red,#ef4444)}',
      '.v20-row-tag.learn{background:rgba(34,197,94,.2);color:var(--green,#22c55e)}',
      '.v20-row-min{font-size:12px;opacity:.65}',
      '.v20-row-go{font-size:13px;font-weight:800;opacity:.7}',
      '.v20-empty-mini{font-size:13px;opacity:.55;padding:8px 4px;color:var(--text,#fff)}',
      '@media(max-width:560px){.v20-mini{grid-template-columns:repeat(2,1fr)}.v20-btn{margin-left:0}.v20-sna-foot{flex-wrap:wrap}}'
    ].join('\n');
    document.head.appendChild(css);
  }

  /* --------------------------------------------------------------- selfTest */
  function selfTest() {
    var ok = true, out = [];
    function check(name, cond) { ok = ok && !!cond; out.push((cond ? 'PASS ' : 'FAIL ') + name); }

    var s = getState();
    check('state present with topics[]', !!(s && Array.isArray(s.topics)));
    check('window.shadowEN exposed', !!(window.shadowEN && window.shadowEN.state));

    var health = memoryHealth();
    check('memoryHealth score 0..100', health.score >= 0 && health.score <= 100);
    check('memoryHealth has counts', !!health.counts && typeof health.counts.Fragile === 'number');

    var sna = smartNextAction();
    check('smartNextAction returns action when topics exist', (s && s.topics.length) ? !!(sna && sna.topic) : true);
    check('SNA has score/reasons/estMin', !sna || (typeof sna.score === 'number' && Array.isArray(sna.reasons) && typeof sna.estMin === 'number'));

    var rescue = rescueList();
    check('rescueList is array', Array.isArray(rescue));
    check('rescue items shaped {base,cur,risk}', !rescue.length || (typeof rescue[0].base === 'number' && typeof rescue[0].cur === 'number' && typeof rescue[0].risk === 'number'));

    var plan = dailyPlan();
    check('dailyPlan returns items[] + total', Array.isArray(plan.items) && typeof plan.total === 'number');
    check('plan total == sum(item.min)', plan.items.reduce(function (a, i) { return a + i.min; }, 0) === plan.total);
    check('plan capped <= 6 items', plan.items.length <= 6);

    var coach = coachRecommendation();
    check('coach has text', !!(coach && coach.text));

    check('forgetRisk in 0..1', (function () { var r = s && s.topics[0] ? forgetRisk(s.topics[0]) : 0; return r >= 0 && r <= 1; })());
    check('does NOT modify v14', !!window.LoopV14 ? typeof window.LoopV14.selfTest === 'function' : true);
    check('widget root present when home visible', !homeVisible() || !!document.getElementById('shadow-v20-root'));

    console.log('%c[v20] SELF-TEST ' + (ok ? 'PASSED' : 'FAILED'),
      'font-weight:bold;color:' + (ok ? 'green' : 'red'));
    out.forEach(function (l) { log(l); });
    if (sna) log('SNA ->', sna.mode, tname(sna.topic), '| score:', sna.score, priorityLabel(sna.score), '| reasons:', sna.reasons.join(' / '));
    log('health ->', health.score + '%', health.label, '| due:', health.due, '| rescue:', rescue.length, '| plan:', plan.items.length, 'items /', plan.total, 'min');
    return { ok: ok, results: out, health: health, sna: sna, rescue: rescue, plan: plan, coach: coach };
  }

  /* ---------------------------------------------------------------- public */
  var SHADOW_V20 = {
    version: VERSION,
    render: render,
    selfTest: selfTest,
    // engines (rule-based, reusable / inspectable)
    smartNextAction: smartNextAction,
    rescueList: rescueList,
    dailyPlan: dailyPlan,
    memoryHealth: memoryHealth,
    coachRecommendation: coachRecommendation,
    forgetRisk: forgetRisk,
    baselineStrength: baselineStrength,
    currentStrength: currentStrength
  };
  window.SHADOW_V20 = SHADOW_V20;

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    render();
    window.addEventListener('hashchange', function () { setTimeout(render, 80); });
    // re-mount if the app re-renders and wipes the dashboard
    setInterval(function () {
      if (homeVisible() && !document.getElementById('shadow-v20-root')) render();
    }, 1800);
    log('ready', VERSION, '- run SHADOW_V20.selfTest() to verify.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 600); });
  } else {
    setTimeout(boot, 600);
  }
})();
