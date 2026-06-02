// ============================================================================
// SHADOW ENGLISH — IMPORT TOPIC (v1)
// ----------------------------------------------------------------------------
// Muc tieu: paste/upload 1 JSON PHANG (do NotebookLM xuat) -> topic xuat hien
// ngay trong App, KHONG can Notion, KHONG nhap tay tung field.
//
// NGUYEN TAC: TAI DUNG dung luong "New Topic / Generate AI" co san.
//   - Tao topic + overlay + saveState + refresh  ==>  goi window.SHADOW_V18.saveLesson(lesson, vals)
//     (da xac minh: saveLesson sinh id "U-...", push state.topics, ghi overlay
//      {notionOverrides{why,scene,phrases}, v15{...}}, saveState, refresh).
//   - vals.phrases la STRING parse theo nhan BEFORE/DURING/AFTER + dong "EN | VI".
//   - Cac field saveLesson KHONG xu ly (dialogues, realEnglish, missions, recall)
//     -> patch truc tiep vao overlay vua tao (shape da xac minh).
//
// KHONG sua file .js loi. Chi them 1 the <script> vao index.html.
// ============================================================================
(function setupImportTopic() {
  'use strict';
  var NS = window.SHADOW_IMPORT = window.SHADOW_IMPORT || {};
  NS.version = '1.0.0';

  var STATE_KEY = 'shadow-en-state-v3';
  var OVERLAY_PREFIX = 'shadow-en-overlay-';

  // ---------- helpers ----------
  function uid(p) { return (p || 'x') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function levelNum(v) { var m = String(v == null ? '' : v).match(/[123]/); return m ? parseInt(m[0], 10) : 1; } // "Level 2" / "2" / 2 -> 2
  function getState() { try { return JSON.parse(localStorage.getItem(STATE_KEY) || 'null'); } catch (e) { return null; } }
  function topicIds() { var s = getState(); return (s && s.topics ? s.topics : []).map(function (t) { return t.id; }); }
  function toast(msg) {
    try { if (window.SHADOW_V18 && SHADOW_V18.toast) return SHADOW_V18.toast(msg); } catch (e) {}
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1f1740;color:#fff;border:1px solid #4F46E5;padding:10px 16px;border-radius:10px;z-index:100000;font:600 13px Inter,sans-serif';
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600);
  }
  function refresh() {
    try { if (window.SHADOW_V17 && SHADOW_V17.augmentTopicsView) SHADOW_V17.augmentTopicsView(); } catch (e) {}
    try { if (typeof window.render === 'function') window.render(); } catch (e) {}
  }

  // chuyen 1 truong phrases (string nhieu dong / array) -> mang dong "EN | VI"
  function normLines(val) {
    if (Array.isArray(val)) {
      return val.map(function (x) {
        if (typeof x === 'string') return ensurePipe(x);
        return ((x.en || x.english || '') + ' | ' + (x.vi || x.viet || x.vietnamese || '')).trim();
      }).filter(function (l) { return l && l !== '|'; });
    }
    return String(val || '').split(/\r?\n/).map(function (l) { return ensurePipe(l.trim()); }).filter(Boolean);
  }
  function ensurePipe(l) {
    if (!l) return '';
    if (l.indexOf('|') >= 0) return l;
    // cho phep dang "EN — VI" / "EN - VI" -> chuyen sang pipe
    var m = l.split(/\s+[—–-]\s+/);
    if (m.length >= 2) return m[0].trim() + ' | ' + m.slice(1).join(' - ').trim();
    return l; // chi co EN
  }
  // tu dung mang phrase {en,vi,notes,example} (KHONG phu thuoc parsePhrases cua app)
  function parsePhraseArr(val) {
    return normLines(val)
      .filter(function (l) { return !/^(before|during|after)$/i.test(l.replace(/[\s:#\[\]]/g, '')); }) // bo dong nhan neu lo lot
      .map(function (l) { var p = l.split(/\s*\|\s*/); return { en: (p[0] || '').trim(), vi: (p[1] || '').trim(), notes: '', example: '' }; })
      .filter(function (x) { return x.en; });
  }
  function linesOf(val) {
    if (Array.isArray(val)) return val.map(function (x) { return typeof x === 'string' ? x : (x.title || x.question || JSON.stringify(x)); }).filter(Boolean);
    return String(val || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  }

  // ---------- 1) CONVERT: flat JSON -> { lesson, vals, extras } ----------
  function convert(flat) {
    flat = flat || {};
    var lesson = {
      topic: (flat.topicName || flat.name || '').trim(),
      level: levelNum(flat.level),            // chuan hoa "Level 2"/"2"/2 -> so (saveLesson can so)
      context: (flat.category || flat.scene || '').trim()
    };
    var vals = {
      why: (flat.why || '').trim(),
      scene: (flat.scene || '').trim(),
      video: (flat.videoImmersionUrl || flat.video || '').trim(),
      shadow: (flat.shadowScript || '').trim(),
      phrases: '',     // de saveLesson tao phrases rong; ta GHI DE bang mang dung shape o buoc patch
      exercises: '',   // missions/recall xu ly o extras (chinh xac hon)
      repeat: ''
    };
    // extras: phrases (tu dung) + cac field saveLesson khong nhan -> patch overlay sau
    var extras = {
      phrases: {
        before: parsePhraseArr(flat.phrasesBefore),
        during: parsePhraseArr(flat.phrasesDuring),
        after: parsePhraseArr(flat.phrasesAfter)
      },
      missions: linesOf(flat.realLifeMissions).map(function (l) {
        var p = l.split(/\s*\|\s*/);            // "Title | description | success"
        return { id: uid('m'), title: p[0] || l, description: p[1] || '', difficulty: 'Easy', success: p[2] || '' };
      }),
      recall: linesOf(flat.activeRecall).map(function (l) {
        var p = l.split(/\s*\|\s*/);            // "Question | Answer | Hint"
        return { id: uid('rc'), question: p[0] || l, answer: p[1] || '', hint: p[2] || '' };
      }),
      dialogues: (flat.dialogues || '').trim(),
      realEnglish: (flat.realEnglish || '').trim(),
      emoji: (flat.emoji || '').trim()
    };
    return { lesson: lesson, vals: vals, extras: extras };
  }

  // ---------- 2) VALIDATE ----------
  function validate(flat) {
    var errs = [];
    if (!flat || typeof flat !== 'object') { return ['JSON khong hop le (phai la 1 object).']; }
    if (!(flat.topicName || flat.name)) errs.push('Thieu "topicName".');
    if (!flat.level) errs.push('Thieu "level" (1 / 2 / 3).');
    var hasPhrase = (flat.phrasesBefore || flat.phrasesDuring || flat.phrasesAfter);
    if (!hasPhrase) errs.push('Thieu phrases (can it nhat 1 trong phrasesBefore/During/After).');
    return errs;
  }

  // ---------- 3) IMPORT: tai dung saveLesson + patch overlay ----------
  function doImport(flat) {
    if (!window.SHADOW_V18 || typeof SHADOW_V18.saveLesson !== 'function') {
      toast('Khong tim thay engine SHADOW_V18.saveLesson — kiem tra app da load day du chua.');
      return false;
    }
    var errs = validate(flat);
    if (errs.length) { toast('Loi: ' + errs[0]); return false; }

    var conv = convert(flat);
    var before = {}; topicIds().forEach(function (id) { before[id] = 1; });

    // === TAI DUNG dung luong New Topic / Generate AI ===
    SHADOW_V18.saveLesson(conv.lesson, conv.vals);

    // tim id topic vua tao
    var newId = topicIds().filter(function (id) { return !before[id]; })[0];
    if (!newId) { toast('Da goi saveLesson nhung khong xac dinh duoc topic moi.'); refresh(); return true; }

    // emoji tuy chon + patch cac field saveLesson khong nhan (dialogues / realEnglish / missions / recall)
    try {
      var s = getState();
      var t = s && s.topics ? s.topics.filter(function (x) { return x.id === newId; })[0] : null;
      if (t && conv.extras.emoji) { t.emoji = conv.extras.emoji; localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

      var ovKey = OVERLAY_PREFIX + newId;
      var ov = {};
      try { ov = JSON.parse(localStorage.getItem(ovKey) || '{}'); } catch (e) { ov = {}; }
      ov.notionOverrides = ov.notionOverrides || {};
      ov.customBlocks = ov.customBlocks || [];
      ov.v15 = ov.v15 || { missions: [], recall: [], shadowBlocks: [], sections: { order: [], hidden: [] } };
      ov.v15.missions = ov.v15.missions || []; ov.v15.recall = ov.v15.recall || [];

      // GHI DE phrases bang mang dung shape (chinh xac, khong qua parsePhrases)
      ov.notionOverrides.phrases = conv.extras.phrases;

      conv.extras.missions.forEach(function (m) { ov.v15.missions.push(m); });
      conv.extras.recall.forEach(function (r) { ov.v15.recall.push(r); });
      if (conv.extras.dialogues) ov.customBlocks.push({ id: uid('b'), type: 'note', title: '🎭 Dialogues', text: conv.extras.dialogues });
      if (conv.extras.realEnglish) ov.customBlocks.push({ id: uid('b'), type: 'note', title: '🎤 Real English (native)', text: conv.extras.realEnglish });

      localStorage.setItem(ovKey, JSON.stringify(ov));
    } catch (e) { /* patch that bai khong chan topic da tao */ }

    refresh();
    toast('✅ Da import topic: ' + (conv.lesson.topic || newId));
    closeModal();
    return true;
  }
  NS.import = doImport;
  NS.convert = convert;
  NS.validate = validate;

  // ---------- 4) UI: MODAL (Tab Paste / Tab Upload + Validate + Preview + Import) ----------
  function parseInput(text) {
    var data = JSON.parse(text);   // co the throw
    if (Array.isArray(data)) return data;     // ho tro mang nhieu topic (import lan luot)
    return [data];
  }
  function previewHtml(flat) {
    var c = convert(flat);
    function count(v) { return normLines(v).length; }
    var b = count(flat.phrasesBefore), d = count(flat.phrasesDuring), a = count(flat.phrasesAfter);
    var first = normLines(flat.phrasesBefore).concat(normLines(flat.phrasesDuring)).slice(0, 3);
    return '<div class="imp-prev">'
      + '<div class="imp-prev-head"><span class="imp-emoji">' + esc(flat.emoji || '✨') + '</span>'
      + '<div><div class="imp-name">' + esc(flat.topicName || flat.name || '(chua co ten)') + '</div>'
      + '<div class="imp-meta">Level ' + esc(String(flat.level || '?')) + (flat.category ? ' · ' + esc(flat.category) : '') + ' · '
      + (b + d + a) + ' phrases (B' + b + '/D' + d + '/A' + a + ')'
      + (c.extras.missions.length ? ' · ' + c.extras.missions.length + ' missions' : '')
      + (c.extras.recall.length ? ' · ' + c.extras.recall.length + ' recall' : '') + '</div></div></div>'
      + (flat.why ? '<div class="imp-why">' + esc(String(flat.why).slice(0, 160)) + '</div>' : '')
      + (first.length ? '<ul class="imp-ph">' + first.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '')
      + '</div>';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var modalEl = null;
  function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } }
  function openModal() {
    closeModal();
    injectCSS();
    modalEl = document.createElement('div');
    modalEl.className = 'imp-overlay';
    modalEl.innerHTML =
      '<div class="imp-modal">'
      + '<div class="imp-top"><b>📥 Import Topic</b><button class="imp-x" data-act="close">×</button></div>'
      + '<div class="imp-tabs"><button class="imp-tab on" data-tab="paste">Paste JSON</button><button class="imp-tab" data-tab="file">Upload .json</button></div>'
      + '<div class="imp-body">'
      + '  <div data-pane="paste"><textarea class="imp-ta" placeholder=\'Dan JSON (1 object hoac mang nhieu topic)...\'></textarea></div>'
      + '  <div data-pane="file" class="imp-hidden"><label class="imp-file">Chon file .json<input type="file" accept="application/json,.json" class="imp-input"></label><div class="imp-fname imp-muted"></div></div>'
      + '  <div class="imp-actions"><button class="imp-btn" data-act="check">Kiem tra & Preview</button><span class="imp-status imp-muted"></span></div>'
      + '  <div class="imp-preview"></div>'
      + '</div>'
      + '<div class="imp-foot"><button class="imp-btn ghost" data-act="close">Huy</button><button class="imp-btn solid" data-act="import" disabled>Import</button></div>'
      + '</div>';
    document.body.appendChild(modalEl);

    var parsed = null;   // mang flat topics da validate ok
    var q = function (s) { return modalEl.querySelector(s); };
    function setStatus(msg, ok) { var el = q('.imp-status'); el.textContent = msg || ''; el.style.color = ok ? '#15803d' : '#b91c1c'; }
    function setPreview(html) { q('.imp-preview').innerHTML = html || ''; }
    function enableImport(on) { q('[data-act=import]').disabled = !on; }

    function runCheck() {
      parsed = null; enableImport(false); setPreview('');
      var activeFile = !q('[data-pane="file"]').classList.contains('imp-hidden');
      var text = activeFile ? (modalEl._fileText || '') : q('.imp-ta').value;
      if (!text || !text.trim()) { setStatus('Chua co du lieu.', false); return; }
      var arr;
      try { arr = parseInput(text); } catch (e) { setStatus('JSON sai cu phap: ' + e.message, false); return; }
      var allErr = [], previews = [];
      arr.forEach(function (flat, i) {
        var errs = validate(flat);
        if (errs.length) allErr.push('Topic #' + (i + 1) + ': ' + errs.join(' '));
        else previews.push(previewHtml(flat));
      });
      if (allErr.length) { setStatus(allErr[0] + (allErr.length > 1 ? ' (+' + (allErr.length - 1) + ' loi)' : ''), false); setPreview(previews.join('')); return; }
      parsed = arr;
      setStatus('OK — ' + arr.length + ' topic hop le.', true);
      setPreview(previews.join(''));
      enableImport(true);
    }

    modalEl.addEventListener('click', function (e) {
      var act = e.target.getAttribute('data-act'), tab = e.target.getAttribute('data-tab');
      if (act === 'close') return closeModal();
      if (act === 'check') return runCheck();
      if (act === 'import') {
        if (!parsed) return;
        var ok = 0; parsed.forEach(function (flat) { if (doImport(flat)) ok++; });
        // doImport tu dong closeModal khi 1 cai; neu nhieu, dong sau cung
        return;
      }
      if (tab) {
        modalEl.querySelectorAll('.imp-tab').forEach(function (b) { b.classList.toggle('on', b === e.target); });
        q('[data-pane="paste"]').classList.toggle('imp-hidden', tab !== 'paste');
        q('[data-pane="file"]').classList.toggle('imp-hidden', tab !== 'file');
        setStatus(''); setPreview(''); enableImport(false);
      }
    });
    q('.imp-input').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      q('.imp-fname').textContent = f.name;
      var r = new FileReader();
      r.onload = function () { modalEl._fileText = String(r.result || ''); runCheck(); };
      r.readAsText(f);
    });
  }
  NS.open = openModal;

  // ---------- 5) NUT "Import Topic" canh Export/Import Backup ----------
  function findToolbar() {
    // tim nut Import Backup de chen ben canh
    var btns = Array.prototype.slice.call(document.querySelectorAll('button, a, .btn'));
    var ib = btns.filter(function (b) { return /import\s*backup/i.test(b.textContent || ''); })[0];
    return ib ? ib.parentNode : null;
  }
  function injectButton() {
    if (document.getElementById('imp-topic-btn')) return true;
    var bar = findToolbar();
    if (!bar) return false;
    var anchor = Array.prototype.slice.call(bar.querySelectorAll('button, a')).filter(function (b) { return /import\s*backup/i.test(b.textContent || ''); })[0];
    var btn = document.createElement('button');
    btn.id = 'imp-topic-btn';
    btn.type = 'button';
    btn.textContent = '📥 Import Topic';
    if (anchor) { btn.className = anchor.className; }   // ke thua style nut cung hang
    btn.style.background = 'linear-gradient(90deg,#16a34a,#22c55e)';
    btn.style.color = '#fff';
    btn.addEventListener('click', openModal);
    if (anchor && anchor.nextSibling) bar.insertBefore(btn, anchor.nextSibling); else bar.appendChild(btn);
    return true;
  }
  // Topics view render lai khi dieu huong -> thu chen lai bang observer
  function watch() {
    injectButton();
    try {
      var mo = new MutationObserver(function () { injectButton(); });
      mo.observe(document.body, { childList: true, subtree: true });
      NS._mo = mo;
    } catch (e) {}
  }

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById('imp-css')) return;
    var s = document.createElement('style'); s.id = 'imp-css';
    s.textContent =
      '.imp-overlay{position:fixed;inset:0;background:rgba(8,6,20,.66);z-index:99999;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow:auto;font-family:Inter,system-ui,sans-serif}'
      + '.imp-modal{width:680px;max-width:100%;background:#14122a;color:#e9e7f5;border:1px solid #2a2748;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5)}'
      + '.imp-top{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #2a2748;font-size:15px}'
      + '.imp-x{background:none;border:none;color:#9a96bf;font-size:22px;cursor:pointer;line-height:1}'
      + '.imp-tabs{display:flex;gap:6px;padding:12px 18px 0}'
      + '.imp-tab{background:#1c1940;border:1px solid #2a2748;color:#c9c5e8;border-radius:9px 9px 0 0;padding:8px 14px;cursor:pointer;font-weight:600;font-size:13px}'
      + '.imp-tab.on{background:#241f4d;color:#fff;border-bottom-color:#241f4d}'
      + '.imp-body{padding:14px 18px}'
      + '.imp-ta{width:100%;min-height:160px;background:#0f0d22;border:1px solid #2a2748;border-radius:10px;color:#e9e7f5;padding:11px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;resize:vertical}'
      + '.imp-file{display:inline-block;background:#1c1940;border:1px dashed #4F46E5;border-radius:10px;padding:18px 22px;cursor:pointer;color:#c9c5e8}'
      + '.imp-input{display:none}'
      + '.imp-actions{display:flex;align-items:center;gap:12px;margin-top:12px}'
      + '.imp-btn{font-family:inherit;font-weight:700;font-size:13px;border:1.5px solid #4F46E5;color:#c7c3ee;background:#1a1640;border-radius:10px;padding:9px 16px;cursor:pointer}'
      + '.imp-btn.solid{background:linear-gradient(90deg,#16a34a,#22c55e);color:#fff;border-color:transparent}'
      + '.imp-btn.ghost{background:transparent}'
      + '.imp-btn:disabled{opacity:.45;cursor:not-allowed}'
      + '.imp-status{font-size:12.5px}.imp-muted{color:#8e8ab3}'
      + '.imp-preview{margin-top:12px}'
      + '.imp-prev{background:#0f0d22;border:1px solid #2a2748;border-radius:12px;padding:12px;margin-bottom:10px}'
      + '.imp-prev-head{display:flex;gap:10px;align-items:center}.imp-emoji{font-size:26px}.imp-name{font-weight:800}.imp-meta{font-size:12px;color:#9a96bf}'
      + '.imp-why{font-size:12.5px;color:#bdb9e0;margin-top:8px}.imp-ph{margin:8px 0 0;padding-left:18px;font-size:12.5px;color:#cfcbef}.imp-ph li{margin:2px 0}'
      + '.imp-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;border-top:1px solid #2a2748}'
      + '.imp-hidden{display:none}';
    document.head.appendChild(s);
  }

  // ---------- boot ----------
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
  NS.selfTest = function () {
    var demo = { topicName: 'TEST Import', level: 1, category: 'Demo',
      why: 'kiem tra', scene: 'demo scene',
      phrasesBefore: 'Hello | Xin chao', phrasesDuring: 'I would like... | Toi muon...', phrasesAfter: 'Thank you | Cam on',
      activeRecall: 'Ban noi gi khi gap? | Hello', realLifeMissions: 'Chao 1 nguoi bang tieng Anh' };
    var c = convert(demo); console.log('[IMPORT selfTest] convert =', c); return c;
  };
  console.log('[SHADOW_IMPORT] ready v' + NS.version + ' — reuse SHADOW_V18.saveLesson');
})();
