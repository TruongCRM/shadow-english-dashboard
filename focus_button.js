// ============================================================================
// SHADOW ENGLISH — FOCUS BUTTON (always-on, v1.0)
// ----------------------------------------------------------------------------
// Muc tieu: dam bao LUON co 1 nut Focus CO DINH khi dang trong session player,
// du session do render boi renderer nao (V8 co nut inline, nhung renderer cu
// renderSessionView8Steps thi khong) -> nut nay phu kin moi truong hop.
//
// NGUYEN TAC (giong import_topic.js):
//   - File rieng, KHONG sua file loi. Chi them 1 the <script>.
//   - TAI DUNG ham co san window.toggleFocusMode() (dinh nghia o app_v8).
//   - An nut inline ".focus-toggle" trung de chi con DUY NHAT 1 nut nhat quan.
//
// Hanh vi: nut chi hien khi #view-session dang active (hoac thay .session-hero).
//   Bam -> toggleFocusMode() (an sidebar/topbar/xp-bar, tap trung vao bai).
//   Trong focus-mode nut van hien de thoat (hoac bam Esc).
// ============================================================================
(function setupFocusButton() {
  'use strict';
  var NS = window.SHADOW_FOCUSBTN = window.SHADOW_FOCUSBTN || {};
  NS.version = '1.0.0';
  var BTN_ID = 'focus-fixed-btn';

  function inSession() {
    var v = document.getElementById('view-session');
    if (v && v.classList.contains('active') && v.offsetParent !== null) return true;
    var hero = document.querySelector('.session-hero, .session-hero-v8');
    return !!(hero && hero.offsetParent !== null);
  }

  function doToggle() {
    if (typeof window.toggleFocusMode === 'function') {
      try { window.toggleFocusMode(); } catch (e) { document.body.classList.toggle('focus-mode'); }
    } else {
      document.body.classList.toggle('focus-mode');
    }
    sync();
  }

  function ensureBtn() {
    var btn = document.getElementById(BTN_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.type = 'button';
      btn.title = 'Focus mode (phim F · Esc de thoat)';
      btn.addEventListener('click', doToggle);
      document.body.appendChild(btn);
    }
    return btn;
  }

  // GHI CO GUARD: chi cap nhat DOM khi gia tri THAT SU doi -> khong tao mutation thua.
  function sync() {
    var btn = document.getElementById(BTN_ID);
    if (!btn) return;
    var on = document.body.classList.contains('focus-mode');
    var want = on ? '🧘 Thoát Focus' : '🧘 Focus';
    if (btn.textContent !== want) btn.textContent = want;
    if (btn.classList.contains('on') !== on) btn.classList.toggle('on', on);
  }

  function tick() {
    var show = inSession();
    if (show) {
      var btn = ensureBtn();
      if (btn.style.display !== 'inline-flex') btn.style.display = 'inline-flex';
      sync();
    } else {
      var ex = document.getElementById(BTN_ID);
      // khong an khi dang o focus-mode (de con duong thoat)
      if (ex && !document.body.classList.contains('focus-mode') && ex.style.display !== 'none') ex.style.display = 'none';
    }
  }

  function injectCSS() {
    if (document.getElementById('focus-fixed-css')) return;
    var s = document.createElement('style');
    s.id = 'focus-fixed-css';
    var css = '';
    css += '#focus-fixed-btn{position:fixed;bottom:24px;right:24px;z-index:100000;display:none;align-items:center;gap:6px;';
    css += 'background:rgba(124,92,255,.16);border:1.5px solid #7c5cff;color:#fff;border-radius:999px;padding:11px 18px;';
    css += 'font:700 13.5px Inter,system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(4px);box-shadow:0 8px 24px rgba(0,0,0,.35)}';
    css += '#focus-fixed-btn:hover{background:rgba(124,92,255,.30)}';
    css += '#focus-fixed-btn.on{background:#7c5cff;border-color:#7c5cff}';
    css += 'body.focus-mode #focus-fixed-btn{display:inline-flex!important}';
    // an nut Focus inline trung (cua renderer V8) -> chi con 1 nut co dinh nhat quan
    css += '.session-hero .focus-toggle,.session-hero-v8 .focus-toggle{display:none!important}';
    // mobile: nang len de khong de len nut Import/Export FAB (bottom:22)
    css += '@media (max-width:700px){#focus-fixed-btn{bottom:84px;right:16px}}';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function boot() {
    injectCSS();
    tick();
    // CHI dung interval (KHONG MutationObserver) -> tranh observer phan ung voi
    // chinh thay doi cua nut roi lap vo han. 600ms du de bat moi lan app re-render.
    NS._iv = setInterval(tick, 600);
    // cap nhat ngay khi chuyen view / bam phim F (focus-mode doi qua ban phim)
    window.addEventListener('hashchange', function () { setTimeout(tick, 80); });
    document.addEventListener('keyup', function (e) { if (e.key === 'f' || e.key === 'F' || e.key === 'Escape') setTimeout(tick, 30); });
  }

  NS.toggle = doToggle;
  NS.tick = tick;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  console.log('[SHADOW_FOCUSBTN] ready v' + NS.version + ' — nut Focus co dinh, tai dung toggleFocusMode');
})();
