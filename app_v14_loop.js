/* =============================================================================
 * SHADOW ENGLISH — PHASE 1: LEARNING LOOP CLOSURE
 * app_v14_loop.js   (NS.version "v14.0-loop")
 * -----------------------------------------------------------------------------
 * Closes the loop:
 *   Dashboard -> Next Best Action -> open topic + start session
 *   -> (app's own completeSession updates memory) -> Completion screen + feedback
 *   -> Dashboard refreshed -> next recommendation -> repeat.  No dead ends.
 *
 * KEY DESIGN DECISION (verified against the real code):
 *   app.js already owns a COMPLETE memory-update pipeline inside
 *   completeSession(topicId): it advances reviewStage [0,1,3,7,21,60], sets
 *   lastReview/nextReview, confidence +8, masteryPct +10, memoryStatus,
 *   awardXP(15), updateStreak(), saveState(), render(), toast().
 *
 *   Therefore this module does NOT re-implement that pipeline (doing so would
 *   double-count XP/confidence). Instead it WRAPS the app's own functions:
 *     - window.openTopic(id)       -> remembers which topic is active
 *     - window.startSession(id)    -> remembers the mode (review/learn)
 *     - window.completeSession(id) -> snapshot before/after, then show the
 *                                     completion screen + feedback + refresh.
 *   Because app.js is a plain (non-module) script, `completeSession` is a global
 *   binding; the session's internal call to completeSession(...) therefore goes
 *   through our wrap. The module only READS state for its widgets — it never
 *   writes state, so there is no risk of corrupting user data.
 *
 * Covers Phase-1 priorities:
 *   P1 Real Review/Learning CTA  -> openAndStart(): openTopic + startSession
 *   P2 Session completion flow   -> showCompletionFlow()
 *   P3 Real dashboard queue      -> renderPriority() (reads state.topics)
 *   P4 Next Best Action engine   -> nextBestAction() + renderNBA()
 *   P5 Memory update pipeline    -> app's completeSession (we surface it live)
 *   P6 Success feedback system   -> buildFeedback() + modal + toast
 *   P7 Loop validation           -> LoopV14.selfTest()
 *
 * SAFE TO REMOVE: delete the <script> tag for this file; app reverts.
 * ========================================================================== */
(function () {
  'use strict';

  var VERSION = 'v14.0-loop';
  var STATE_KEY = 'shadow-en-state-v3';
  var BEST_STREAK_KEY = 'shadow-en-best-streak';
  var STAGE_DAYS = [0, 1, 3, 7, 21, 60]; // locked Day 0/1/3/7/21/60 ladder

  function log() {
    try { console.log.apply(console, ['[LoopV14]'].concat([].slice.call(arguments))); } catch (e) {}
  }

  /* ------------------------------------------------------------------ utils */
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function daysBetween(a, b) {
    var ms = new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0);
    return Math.round(ms / 86400000);
  }
  function relDay(iso) {
    if (!iso) return '—';
    var d = daysBetween(new Date().toISOString(), iso);
    if (d < 0) return Math.abs(d) + 'd overdue';
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    return 'in ' + d + ' days';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* --------------------------------------------------- state access (read-only) */
  // Primary: window.shadowEN.state (app.js exposes it). Fallbacks for safety.
  function getState() {
    if (window.shadowEN && window.shadowEN.state && Array.isArray(window.shadowEN.state.topics)) {
      return window.shadowEN.state;
    }
    var c = ['state', 'STATE', 'AppState', 'appState'];
    for (var i = 0; i < c.length; i++) {
      var s = window[c[i]];
      if (s && typeof s === 'object' && Array.isArray(s.topics)) return s;
    }
    try {
      var raw = localStorage.getItem(STATE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  // Ask the app to re-render its own UI (so dashboard reflects changes live).
  function appRender() {
    if (window.shadowEN && typeof window.shadowEN.render === 'function') {
      try { window.shadowEN.render(); return; } catch (e) {}
    }
    var fns = ['render', 'renderHome', 'renderDashboard', 'renderAll'];
    for (var i = 0; i < fns.length; i++) {
      if (typeof window[fns[i]] === 'function') { try { window[fns[i]](); } catch (e) {} }
    }
  }

  /* ----------------------------------------------------------- topic helpers */
  function tid(t) { return t && (t.id != null ? t.id : (t.key || t.slug || t.name)); }
  function tname(t) { return (t && (t.name || t.title || t.topic)) || 'Untitled'; }
  function temoji(t) { return (t && (t.emoji || t.icon)) || '📘'; }
  // app.js advances masteryPct on every session but leaves confidence at its
  // seed value (0). Use the STRONGER of the two so strength reflects real progress.
  function tconf(t) {
    if (!t) return 0;
    return Math.max(Number(t.masteryPct) || 0, Number(t.confidence) || 0);
  }
  function tstageIndex(t) {
    // app.js stores reviewStage as a STRING like "Day 0" / "Day 3" / "Day 60".
    // Also tolerate a raw number or numeric index, just in case.
    var rs = t && t.reviewStage;
    if (rs == null) return 0;
    var num = (typeof rs === 'string')
      ? parseInt((rs.match(/\d+/) || [0])[0], 10)
      : Number(rs);
    var d = STAGE_DAYS.indexOf(num);
    if (d !== -1) return d;                                  // matched a Day value
    return clamp(num || 0, 0, STAGE_DAYS.length - 1);        // fallback: treat as index
  }
  function tstageDay(t) { return STAGE_DAYS[tstageIndex(t)]; }

  function isNew(t) { return !t.lastReview && tstageIndex(t) === 0; }
  function isDue(t) {
    if (!t.nextReview) return !isNew(t);
    return daysBetween(new Date().toISOString(), t.nextReview) <= 0;
  }
  function isFragile(t) {
    var st = (t.memoryStatus || '').toLowerCase();
    return st === 'fragile' || st === 'weak' || tconf(t) < 50;
  }
  function estMinutes(mode, t) {
    if (mode === 'learn') return 8;
    return [3, 3, 4, 4, 5, 5][tstageIndex(t)] || 3;
  }

  /* ---------------------------------------------------------- P4: NBA engine */
  // Returns exactly ONE action (never competing actions).
  function nextBestAction() {
    var s = getState();
    if (!s || !s.topics || !s.topics.length) return null;
    var topics = s.topics.slice();

    var dueReview = topics.filter(function (t) { return !isNew(t) && isDue(t); });
    if (dueReview.length) {
      dueReview.sort(function (a, b) {
        var fa = isFragile(a) ? 0 : 1, fb = isFragile(b) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        var oa = a.nextReview ? daysBetween(new Date().toISOString(), a.nextReview) : 0;
        var ob = b.nextReview ? daysBetween(new Date().toISOString(), b.nextReview) : 0;
        return oa - ob;
      });
      var t = dueReview[0];
      return { type: 'review', topic: t, topicId: tid(t),
        reason: isFragile(t) ? 'Memory is fading' : 'Review is due today',
        estMin: estMinutes('review', t) };
    }

    var inProgress = topics.filter(function (t) { return tstageIndex(t) === 0 && t.lastReview; });
    if (inProgress.length) {
      var t2 = inProgress[0];
      return { type: 'learn', topic: t2, topicId: tid(t2),
        reason: 'Continue what you started', estMin: estMinutes('learn', t2) };
    }

    var fresh = topics.filter(isNew);
    if (fresh.length) {
      var t3 = fresh[0];
      return { type: 'learn', topic: t3, topicId: tid(t3),
        reason: 'No active learning topic', estMin: estMinutes('learn', t3) };
    }

    var upcoming = topics.filter(function (t) { return t.nextReview; })
      .sort(function (a, b) { return daysBetween(new Date().toISOString(), a.nextReview) - daysBetween(new Date().toISOString(), b.nextReview); });
    if (upcoming.length) {
      var t4 = upcoming[0];
      return { type: 'review', topic: t4, topicId: tid(t4),
        reason: 'Keep your strongest memories sharp', estMin: estMinutes('review', t4), relaxed: true };
    }
    return null;
  }

  /* ------------------------------------------------------ P3: priority buckets */
  function priorityBuckets() {
    var s = getState(), out = { reviewDue: [], fragile: [], fresh: [] };
    if (!s || !s.topics) return out;
    s.topics.forEach(function (t) {
      if (isNew(t)) out.fresh.push(t);
      else if (isDue(t)) out.reviewDue.push(t);
      if (!isNew(t) && isFragile(t)) out.fragile.push(t);
    });
    return out;
  }

  /* ----------------------------------------------- P1: route a CTA -> session */
  function openAndStart(topicId, mode) {
    LoopV14._mode = mode || 'review';
    LoopV14._activeTopic = topicId;
    var opened = false;
    if (typeof window.openTopic === 'function') {
      try { window.openTopic(topicId); opened = true; } catch (e) { log('openTopic failed', e); }
    }
    setTimeout(function () {
      if (typeof window.startSession === 'function') {
        try { window.startSession(topicId); return; } catch (e) { log('startSession failed', e); }
      }
      if (!opened) toast('Mở topic rồi bấm Start để bắt đầu.', '⚠️');
    }, opened ? 320 : 0);
  }

  /* ----------------------------------------- snapshot for the completion screen */
  function snapshot(topicId) {
    var s = getState();
    var t = s && s.topics ? s.topics.filter(function (x) { return String(tid(x)) === String(topicId); })[0] : null;
    var fragileCount = priorityBuckets().fragile.length;
    return {
      exists: !!t,
      conf: t ? tconf(t) : 0,
      stageDay: t ? tstageDay(t) : 0,
      status: t ? t.memoryStatus : '',
      nextReview: t ? t.nextReview : null,
      xp: Number(s && s.user && s.user.xp) || 0,
      streak: Number(s && s.user && s.user.streak) || 0,
      fragileCount: fragileCount,
      name: t ? tname(t) : '', emoji: t ? temoji(t) : '📘'
    };
  }

  /* -------------------------------------------- P6: feedback message builder */
  function buildFeedback(before, after) {
    var fb = [];
    fb.push({ icon: '🎉', text: after.stageDay === 0 ? 'Topic đã bắt đầu' : 'Day ' + after.stageDay + ' đã được củng cố' });
    fb.push({ icon: '⭐', text: '+' + Math.max(0, after.xp - before.xp || 15) + ' XP' });
    var dconf = Math.round(after.conf - before.conf);
    if (dconf > 0) fb.push({ icon: '📈', text: 'Confidence +' + dconf + '%' });
    if (after.streak > before.streak) fb.push({ icon: '🔥', text: 'Streak được bảo vệ — ' + after.streak + ' ngày' });
    if (after.fragileCount < before.fragileCount) fb.push({ icon: '💪', text: 'Topic mong manh đã giảm' });
    if (before.status && after.status && before.status !== after.status)
      fb.push({ icon: '🧠', text: before.status + ' → ' + after.status });
    return fb;
  }

  /* ------------------------------------------- P2: session completion screen */
  function showCompletionFlow(before, after) {
    var fb = buildFeedback(before, after);
    var ov = document.createElement('div');
    ov.className = 'loopv14-overlay';
    ov.innerHTML =
      '<div class="loopv14-modal" role="dialog" aria-label="Session complete">' +
        '<div class="loopv14-check">✓</div>' +
        '<h2>Session Complete</h2>' +
        '<p class="loopv14-sub">' + esc(after.emoji + ' ' + after.name) + '</p>' +
        '<div class="loopv14-stats">' +
          '<div><span>+' + Math.max(0, after.xp - before.xp || 15) + '</span><label>XP</label></div>' +
          '<div><span>' + (after.stageDay === 0 ? 'Started' : 'Day ' + after.stageDay) + '</span><label>secured</label></div>' +
          '<div><span>' + Math.round(after.conf) + '%</span><label>confidence</label></div>' +
          '<div><span>' + esc(relDay(after.nextReview)) + '</span><label>next review</label></div>' +
        '</div>' +
        '<div class="loopv14-fb">' + fb.map(function (f) {
          return '<div class="loopv14-fbrow">' + f.icon + ' ' + esc(f.text) + '</div>';
        }).join('') + '</div>' +
        '<div class="loopv14-actions">' +
          '<button class="loopv14-btn ghost" data-act="home">Về Dashboard</button>' +
          '<button class="loopv14-btn primary" data-act="next">Học topic tiếp theo →</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);

    function close() { try { ov.remove(); } catch (e) {} }
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { close(); goHome(); return; }
      var act = e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'home') { close(); goHome(); }
      else if (act === 'next') {
        close();
        var nba = nextBestAction();
        if (nba) openAndStart(nba.topicId, nba.type);
        else { goHome(); toast('Đã ôn hết — không còn gì tới hạn. ', '✅'); }
      }
    });
  }

  function goHome() {
    var navs = ['goHome', 'showHome', 'navigateHome', 'openHome'];
    for (var i = 0; i < navs.length; i++) {
      if (typeof window[navs[i]] === 'function') { try { window[navs[i]](); break; } catch (e) {} }
    }
    if (typeof window.navigate === 'function') { try { window.navigate('home'); } catch (e) {} }
    if (typeof window.showView === 'function') { try { window.showView('home'); } catch (e) {} }
    if (location.hash && !/home|dashboard/i.test(location.hash)) location.hash = '#home';
    appRender();
    setTimeout(render, 140);
  }

  /* ---------------------------------------------------------- toast (P6 aux) */
  function toast(msg, icon) {
    var el = document.createElement('div');
    el.className = 'loopv14-toast';
    el.innerHTML = (icon ? icon + ' ' : '') + esc(msg);
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () { el.classList.remove('show'); setTimeout(function () { try { el.remove(); } catch (e) {} }, 300); }, 3200);
  }

  /* ------------------------------------------------- P4+P3: widget rendering */
  function homeVisible() {
    if (location.hash && /review|topic|progress|content|editor|setting/i.test(location.hash)) return false;
    var home = document.querySelector('#view-home,[data-view="home"],#home,.home-view,#dashboard,#view-dashboard');
    if (home) return home.offsetParent !== null;
    return true;
  }
  function mountPoint() {
    var sel = ['#view-home', '[data-view="home"]', '#home', '.home-view', '#dashboard',
      '#view-dashboard', 'main', '#app', '#content', '.content'];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && el.offsetParent !== null) return el;
    }
    return document.querySelector('main,#app,#content') || document.body;
  }

  function renderNBA() {
    var nba = nextBestAction();
    if (!nba) {
      return '<div class="loopv14-nba empty"><div class="loopv14-nba-head">NEXT BEST ACTION</div>' +
        '<div class="loopv14-nba-body"><div class="loopv14-nba-title">✅ Bạn đã ôn xong</div>' +
        '<div class="loopv14-nba-reason">Không có trí nhớ nào đang phai. Quay lại sau để giữ chúng sắc bén.</div></div></div>';
    }
    var verb = nba.type === 'review' ? 'Review' : 'Learn';
    var label = nba.type === 'review' ? 'Start Review' : 'Start Learning';
    return '<div class="loopv14-nba ' + nba.type + '">' +
      '<div class="loopv14-nba-head">NEXT BEST ACTION</div>' +
      '<div class="loopv14-nba-body">' +
        '<div class="loopv14-nba-title">' + esc(temoji(nba.topic) + ' ' + verb + ': ' + tname(nba.topic)) + '</div>' +
        '<div class="loopv14-nba-reason">Lý do: ' + esc(nba.reason) + '</div>' +
        '<div class="loopv14-nba-meta">⏱ Khoảng ' + nba.estMin + ' phút</div>' +
        '<button class="loopv14-btn primary" data-loop-start="' + esc(nba.topicId) + '" data-loop-mode="' + nba.type + '">' + label + ' →</button>' +
      '</div></div>';
  }

  function bucketCard(title, icon, list) {
    var rows = list.slice(0, 5).map(function (t) {
      var mode = isNew(t) ? 'learn' : 'review';
      return '<button class="loopv14-row" data-loop-start="' + esc(tid(t)) + '" data-loop-mode="' + mode + '">' +
        '<span class="loopv14-row-emoji">' + esc(temoji(t)) + '</span>' +
        '<span class="loopv14-row-name">' + esc(tname(t)) + '</span>' +
        '<span class="loopv14-row-tag">' + esc(t.memoryStatus || (isNew(t) ? 'New' : '')) + '</span>' +
        '<span class="loopv14-row-go">' + (mode === 'review' ? 'Review' : 'Learn') + ' →</span>' +
      '</button>';
    }).join('');
    return '<div class="loopv14-pcol">' +
      '<div class="loopv14-pcol-head">' + icon + ' ' + esc(title) + ' <b>' + list.length + '</b></div>' +
      (list.length ? rows : '<div class="loopv14-empty-mini">Trống 🎉</div>') +
      '</div>';
  }

  function renderPriority() {
    var b = priorityBuckets();
    return '<div class="loopv14-priority">' +
      '<div class="loopv14-priority-head">TODAY\'S PRIORITY</div>' +
      '<div class="loopv14-priority-grid">' +
        bucketCard('Review Due', '🔥', b.reviewDue) +
        bucketCard('Fragile Topics', '⚠️', b.fragile) +
        bucketCard('New Topics', '📚', b.fresh) +
      '</div></div>';
  }

  function render() {
    if (!homeVisible()) { var ex = document.getElementById('loopv14-root'); if (ex) ex.remove(); return; }
    if (!getState()) return;
    var host = mountPoint(); if (!host) return;
    var root = document.getElementById('loopv14-root');
    if (!root) {
      root = document.createElement('section');
      root.id = 'loopv14-root';
      host.insertBefore(root, host.firstChild);
    }
    root.innerHTML = renderNBA() + renderPriority();
  }

  /* ---------------------------------------------- delegated click handling */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-loop-start]');
    if (!btn) return;
    e.preventDefault();
    openAndStart(btn.getAttribute('data-loop-start'), btn.getAttribute('data-loop-mode') || 'review');
  });

  /* ----------------------- wrap the app's own functions (no reimplementation) */
  function installWraps() {
    if (typeof window.openTopic === 'function' && !window.openTopic.__loopWrapped) {
      var _open = window.openTopic;
      window.openTopic = function (id) { LoopV14._activeTopic = id; return _open.apply(this, arguments); };
      window.openTopic.__loopWrapped = true;
    }
    if (typeof window.startSession === 'function' && !window.startSession.__loopWrapped) {
      var _start = window.startSession;
      window.startSession = function (id) { if (id != null) LoopV14._activeTopic = id; return _start.apply(this, arguments); };
      window.startSession.__loopWrapped = true;
    }
    // The crucial hook: app's completeSession runs the full memory pipeline.
    // We snapshot before, let it run, snapshot after, then surface the result.
    if (typeof window.completeSession === 'function' && !window.completeSession.__loopWrapped) {
      var _complete = window.completeSession;
      window.completeSession = function (topicId) {
        var id = topicId != null ? topicId : LoopV14._activeTopic;
        var before = snapshot(id);
        var ret = _complete.apply(this, arguments); // app updates everything (P5)
        var after = snapshot(id);
        setTimeout(function () {
          if (after.exists) showCompletionFlow(before, after);
          render(); // refresh our widgets immediately (no reload)
        }, 200);
        return ret;
      };
      window.completeSession.__loopWrapped = true;
    }
  }

  /* --------------------------------------------------------- P7: self-test */
  function selfTest() {
    var out = [], ok = true;
    function check(n, c) { out.push((c ? 'PASS' : 'FAIL') + ' — ' + n); if (!c) ok = false; }
    var s = getState();
    check('state present with topics[]', !!(s && Array.isArray(s.topics)));
    check('window.shadowEN exposed', !!(window.shadowEN && window.shadowEN.state));
    check('openTopic exists', typeof window.openTopic === 'function');
    check('startSession exists', typeof window.startSession === 'function');
    check('completeSession exists', typeof window.completeSession === 'function');
    check('completeSession wrapped', !!(window.completeSession && window.completeSession.__loopWrapped));
    var nba = nextBestAction();
    check('nextBestAction works', s && s.topics.length ? !!nba : true);
    var b = priorityBuckets();
    check('priority buckets read state', !!b && Array.isArray(b.reviewDue));
    check('widget root rendered when home visible', !homeVisible() || !!document.getElementById('loopv14-root'));
    console.log('%c[LoopV14] SELF-TEST ' + (ok ? 'PASSED ✅' : 'FAILED ❌'),
      'font-weight:bold;color:' + (ok ? 'green' : 'red'));
    out.forEach(function (l) { log(l); });
    if (nba) log('NBA →', nba.type, tname(nba.topic), '| reason:', nba.reason);
    log('buckets → due:', b.reviewDue.length, 'fragile:', b.fragile.length, 'new:', b.fresh.length);
    return { ok: ok, results: out, nba: nba, buckets: b };
  }

  /* ------------------------------------------------------------------- CSS */
  function injectCSS() {
    if (document.getElementById('loopv14-css')) return;
    var css = document.createElement('style');
    css.id = 'loopv14-css';
    css.textContent = [
      '#loopv14-root{display:flex;flex-direction:column;gap:16px;margin:0 0 20px;font-family:inherit}',
      '.loopv14-nba{border-radius:18px;padding:20px 22px;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.12)}',
      '.loopv14-nba.review{background:linear-gradient(135deg,#b91c1c,#7f1d1d)}',
      '.loopv14-nba.learn{background:linear-gradient(135deg,#1d4ed8,#1e3a8a)}',
      '.loopv14-nba.empty{background:linear-gradient(135deg,#334155,#0f172a)}',
      '.loopv14-nba-head{font-size:11px;letter-spacing:.18em;opacity:.85;font-weight:700;margin-bottom:8px}',
      '.loopv14-nba-title{font-size:20px;font-weight:800;line-height:1.25;margin-bottom:6px}',
      '.loopv14-nba-reason{font-size:14px;opacity:.92;margin-bottom:2px}',
      '.loopv14-nba-meta{font-size:13px;opacity:.8;margin-bottom:14px}',
      '.loopv14-btn{border:0;border-radius:12px;padding:11px 18px;font-weight:700;font-size:14px;cursor:pointer;transition:transform .08s ease,opacity .15s}',
      '.loopv14-btn:active{transform:translateY(1px)}',
      '.loopv14-btn.primary{background:#fff;color:#111}',
      '.loopv14-btn.ghost{background:transparent;border:1.5px solid rgba(0,0,0,.18);color:inherit}',
      '.loopv14-priority{background:var(--card,#fff);border:1px solid rgba(0,0,0,.07);border-radius:18px;padding:18px 20px;box-shadow:0 4px 18px rgba(0,0,0,.05)}',
      '.loopv14-priority-head{font-size:11px;letter-spacing:.18em;font-weight:700;opacity:.6;margin-bottom:14px}',
      '.loopv14-priority-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}',
      '.loopv14-pcol-head{font-size:14px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px}',
      '.loopv14-pcol-head b{margin-left:auto;background:rgba(0,0,0,.06);border-radius:20px;padding:1px 9px;font-size:12px}',
      '.loopv14-row{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:rgba(0,0,0,.03);border:0;border-radius:10px;padding:9px 10px;margin-bottom:6px;cursor:pointer;font-size:13px;color:inherit}',
      '.loopv14-row:hover{background:rgba(0,0,0,.07)}',
      '.loopv14-row-name{flex:1;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.loopv14-row-tag{font-size:11px;opacity:.6}',
      '.loopv14-row-go{font-size:12px;font-weight:700;opacity:.7}',
      '.loopv14-empty-mini{font-size:13px;opacity:.5;padding:8px 4px}',
      '.loopv14-overlay{position:fixed;inset:0;background:rgba(8,12,20,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:99999;animation:loopFade .2s ease}',
      '@keyframes loopFade{from{opacity:0}to{opacity:1}}',
      '.loopv14-modal{background:var(--card,#fff);color:var(--text,#111);width:min(440px,92vw);border-radius:22px;padding:30px 28px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.4);animation:loopPop .25s cubic-bezier(.2,.9,.3,1.3)}',
      '@keyframes loopPop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}',
      '.loopv14-check{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}',
      '.loopv14-modal h2{margin:0 0 4px;font-size:24px;font-weight:800}',
      '.loopv14-sub{margin:0 0 18px;opacity:.7;font-size:15px}',
      '.loopv14-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}',
      '.loopv14-stats>div{background:rgba(0,0,0,.05);border-radius:12px;padding:10px 4px}',
      '.loopv14-stats span{display:block;font-size:16px;font-weight:800}',
      '.loopv14-stats label{font-size:10px;opacity:.6;letter-spacing:.04em}',
      '.loopv14-fb{display:flex;flex-direction:column;gap:6px;margin-bottom:20px}',
      '.loopv14-fbrow{background:rgba(34,197,94,.12);color:#15803d;border-radius:10px;padding:8px 12px;font-size:14px;font-weight:600;text-align:left}',
      '.loopv14-actions{display:flex;gap:10px}',
      '.loopv14-actions .loopv14-btn{flex:1}',
      '.loopv14-actions .loopv14-btn.primary{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#fff}',
      '.loopv14-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#0f172a;color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.3);opacity:0;transition:all .3s ease;z-index:99999}',
      '.loopv14-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
      '@media(max-width:560px){.loopv14-stats{grid-template-columns:repeat(2,1fr)}.loopv14-actions{flex-direction:column}}'
    ].join('\n');
    document.head.appendChild(css);
  }

  /* --------------------------------------------------------------- public */
  var LoopV14 = {
    version: VERSION,
    nextBestAction: nextBestAction,
    priorityBuckets: priorityBuckets,
    openAndStart: openAndStart,
    showCompletionFlow: showCompletionFlow,
    render: render,
    selfTest: selfTest,
    _activeTopic: null, _mode: 'review'
  };
  window.LoopV14 = LoopV14;
  if (window.NS) { try { window.NS.version = VERSION; } catch (e) {} }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    injectCSS();
    installWraps();
    render();
    window.addEventListener('hashchange', function () { installWraps(); setTimeout(render, 60); });
    // Re-install wraps + re-mount widgets if the app re-renders and wipes them.
    setInterval(function () {
      installWraps();
      if (homeVisible() && !document.getElementById('loopv14-root')) render();
    }, 1800);
    log('ready', VERSION, '— chạy LoopV14.selfTest() để kiểm tra vòng lặp.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 500); });
  } else {
    setTimeout(boot, 500);
  }
})();
