// ============================================================================
// SHADOW ENGLISH — IMPORT TOPIC (v1.1)
// ----------------------------------------------------------------------------
// Muc tieu: paste/upload 1 JSON do NotebookLM xuat -> topic xuat hien ngay
// trong App, KHONG can Notion, KHONG nhap tay tung field.
//
// v1.1 — IMPORT TOPIC CLEANER:
//   NotebookLM khong phai luc nao cung xuat JSON sach. Import nay TU DONG:
//     - Boc JSON ra khoi ```code fence``` / loi van xung quanh.
//     - Bo trich dan: [1] [2] [1-3] [1,2] / (1) (2) / so nguon cuoi cau / so mu (¹²³).
//     - Chuan hoa xuong dong (\r\n -> \n, gop dong trong thua).
//     - Chuan hoa pipe "|" (ke ca pipe full-width ｜, khoang trang quanh |).
//     - Bo ky tu zero-width / khoang trang thua.
//     - Validate schema + Preview truoc khi luu.
//   => "Paste tu NotebookLM -> Import duoc ngay", khong phai sua JSON thu cong.
//
// NGUYEN TAC: TAI DUNG dung luong "New Topic / Generate AI" co san
//   (window.SHADOW_V18.saveLesson) -> it code, it bug, it rui ro.
// ============================================================================
(function setupImportTopic() {
  'use strict';
  var NS = window.SHADOW_IMPORT = window.SHADOW_IMPORT || {};
  NS.version = '1.1.0';

  var STATE_KEY = 'shadow-en-state-v3';
  var OVERLAY_PREFIX = 'shadow-en-overlay-';
  var STRING_FIELDS = ['topicName','name','topicId','category','level','emoji','why','scene','phrasesBefore','phrasesDuring','phrasesAfter','realEnglish','shadowScript','dialogues','activeRecall','realLifeMissions','video','videoImmersionUrl'];

  // ---------- helpers ----------
  function uid(p) { return (p || 'x') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function levelNum(v) { var m = String(v == null ? '' : v).match(/[123]/); return m ? parseInt(m[0], 10) : 1; }
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

  // ============================================================================
  // CLEANER — lam sach du lieu tho tu NotebookLM
  // ============================================================================
  function stripZW(s) { return String(s == null ? '' : s).replace(/[​-‍﻿­]/g, ''); }
  function normNewlines(s) { return String(s).replace(/\r\n?/g, '\n'); }

  // bo cac dang trich dan thuong gap
  function removeCitations(s) {
    return String(s)
      .replace(/[¹²³⁰-⁹]+/g, '')                         // so mu ¹²³⁴...
      .replace(/\[\s*\d+(?:\s*[–\-,]\s*\d+)*\s*\]/g, '')                      // [1] [12] [1-3] [1,2]
      .replace(/\[\s*(?:source|nguon|ref)[^\]]*\]/gi, '')                          // [source ...]
      .replace(/\(\s*\d{1,3}\s*\)/g, '')                                           // (1) (2) (3)
      .replace(/([.!?’”"'\)»])\s*\d{1,3}(?=\s|$|\|)/g, '$1')         // so nguon ngay sau dau cau cuoi
      .replace(/\s*⁰?\d{1,3}(?=\s*(?:\||$))/g, function (m) {                  // so le cuoi 1 doan (chi bo neu dung mot minh)
        return /^\s*\d{1,3}$/.test(m) ? '' : m;
      });
  }

  // chuan hoa pipe + khoang trang theo tung dong
  function tidyLines(s) {
    return String(s).split('\n').map(function (line) {
      return line
        .replace(/[｜│ǀ∣]/g, '|')   // pipe full-width / cac bien the -> |
        .replace(/[ \t]+/g, ' ')                       // gop khoang trang
        .replace(/\s*\|\s*/g, ' | ')                   // chuan hoa khoang trang quanh pipe
        .replace(/\s+([,.;:!?])/g, '$1')               // bo space truoc dau cau
        .replace(/^[\s•\-\*•‣◦]+/, '')  // bo bullet dau dong
        .trim();
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function sanitizeText(s) {
    s = stripZW(s);
    s = normNewlines(s);
    s = removeCitations(s);
    s = tidyLines(s);
    return s;
  }

  // boc JSON ra khoi code fence / loi van xung quanh + va loi pho bien
  function extractJsonText(text) {
    var t = stripZW(String(text || '')).replace(/^﻿/, '');
    t = t.replace(/```[a-zA-Z]*\s*/g, '').replace(/```/g, '');   // bo ```json ... ```
    var s1 = t.indexOf('{'), s2 = t.indexOf('[');
    var start = (s1 < 0) ? s2 : (s2 < 0 ? s1 : Math.min(s1, s2));
    var e1 = t.lastIndexOf('}'), e2 = t.lastIndexOf(']');
    var end = Math.max(e1, e2);
    if (start >= 0 && end > start) t = t.slice(start, end + 1);
    t = t.replace(/,\s*([}\]])/g, '$1');                          // bo dau phay thua truoc } ]
    return t.trim();
  }

  // lam sach tat ca field chuoi cua 1 topic
  function cleanFlat(flat) {
    if (!flat || typeof flat !== 'object') return flat;
    var out = {};
    Object.keys(flat).forEach(function (k) {
      var v = flat[k];
      out[k] = (typeof v === 'string') ? sanitizeText(v) : v;
    });
    return out;
  }
  NS.clean = cleanFlat;
  NS.sanitizeText = sanitizeText;
  NS.extractJsonText = extractJsonText;

  // chuyen 1 truong phrases (string nhieu dong / array) -> mang dong "EN | VI"
  function normLines(val) {
    if (Array.isArray(val)) {
      return val.map(function (x) {
        if (typeof x === 'string') return ensurePipe(sanitizeText(x));
        return ensurePipe(sanitizeText(((x.en || x.english || '') + ' | ' + (x.vi || x.viet || x.vietnamese || '')).trim()));
      }).filter(function (l) { return l && l !== '|'; });
    }
    return String(val || '').split(/\r?\n/).map(function (l) { return ensurePipe(l.trim()); }).filter(Boolean);
  }
  function ensurePipe(l) {
    if (!l) return '';
    if (l.indexOf('|') >= 0) return l;
    var m = l.split(/\s+[—–-]\s+/);   // cho phep "EN — VI" / "EN - VI" -> pipe
    if (m.length >= 2) return m[0].trim() + ' | ' + m.slice(1).join(' - ').trim();
    return l;
  }
  function parsePhraseArr(val) {
    return normLines(val)
      .filter(function (l) { return !/^(before|during|after)$/i.test(l.replace(/[\s:#\[\]]/g, '')); })
      .map(function (l) { var p = l.split(/\s*\|\s*/); return { en: (p[0] || '').trim(), vi: (p[1] || '').trim(), notes: '', example: '' }; })
      .filter(function (x) { return x.en; });
  }
  function linesOf(val) {
    if (Array.isArray(val)) return val.map(function (x) { return typeof x === 'string' ? x : (x.title || x.question || JSON.stringify(x)); }).filter(Boolean);
    return String(val || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  }

  // ---------- 1) CONVERT: flat JSON -> { lesson, vals, extras } ----------
  function convert(flat) {
    flat = cleanFlat(flat || {});
    var lesson = { topic: (flat.topicName || flat.name || '').trim(), level: levelNum(flat.level), context: (flat.category || flat.scene || '').trim() };
    var vals = { why: (flat.why || '').trim(), scene: (flat.scene || '').trim(), video: (flat.videoImmersionUrl || flat.video || '').trim(), shadow: (flat.shadowScript || '').trim(), phrases: '', exercises: '', repeat: '' };
    var extras = {
      phrases: { before: parsePhraseArr(flat.phrasesBefore), during: parsePhraseArr(flat.phrasesDuring), after: parsePhraseArr(flat.phrasesAfter) },
      missions: linesOf(flat.realLifeMissions).map(function (l) { var p = l.split(/\s*\|\s*/); return { id: uid('m'), title: p[0] || l, description: p[1] || '', difficulty: 'Easy', success: p[2] || '' }; }),
      recall: linesOf(flat.activeRecall).map(function (l) { var p = l.split(/\s*\|\s*/); return { id: uid('rc'), question: p[0] || l, answer: p[1] || '', hint: p[2] || '' }; }),
      dialogues: (flat.dialogues || '').trim(), realEnglish: (flat.realEnglish || '').trim(), emoji: (flat.emoji || '').trim()
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
    if (!window.SHADOW_V18 || typeof SHADOW_V18.saveLesson !== 'function') { toast('Khong tim thay engine SHADOW_V18.saveLesson.'); return false; }
    flat = cleanFlat(flat);
    var errs = validate(flat); if (errs.length) { toast('Loi: ' + errs[0]); return false; }
    var conv = convert(flat);
    var before = {}; topicIds().forEach(function (id) { before[id] = 1; });
    SHADOW_V18.saveLesson(conv.lesson, conv.vals);
    var newId = topicIds().filter(function (id) { return !before[id]; })[0];
    if (!newId) { toast('Da goi saveLesson nhung khong xac dinh duoc topic moi.'); refresh(); return true; }
    try {
      var s = getState();
      var t = s && s.topics ? s.topics.filter(function (x) { return x.id === newId; })[0] : null;
      if (t && conv.extras.emoji) { t.emoji = conv.extras.emoji; localStorage.setItem(STATE_KEY, JSON.stringify(s)); }
      var ovKey = OVERLAY_PREFIX + newId; var ov = {};
      try { ov = JSON.parse(localStorage.getItem(ovKey) || '{}'); } catch (e) { ov = {}; }
      ov.notionOverrides = ov.notionOverrides || {}; ov.customBlocks = ov.customBlocks || [];
      ov.v15 = ov.v15 || { missions: [], recall: [], shadowBlocks: [], sections: { order: [], hidden: [] } };
      ov.v15.missions = ov.v15.missions || []; ov.v15.recall = ov.v15.recall || [];
      ov.notionOverrides.phrases = conv.extras.phrases;
      conv.extras.missions.forEach(function (m) { ov.v15.missions.push(m); });
      conv.extras.recall.forEach(function (r) { ov.v15.recall.push(r); });
      if (conv.extras.dialogues) ov.customBlocks.push({ id: uid('b'), type: 'note', title: '🎭 Dialogues', text: conv.extras.dialogues });
      if (conv.extras.realEnglish) ov.customBlocks.push({ id: uid('b'), type: 'note', title: '🎤 Real English (native)', text: conv.extras.realEnglish });
      localStorage.setItem(ovKey, JSON.stringify(ov));
    } catch (e) {}
    refresh(); toast('✅ Da import topic: ' + (conv.lesson.topic || newId)); closeModal(); return true;
  }
  NS.import = doImport; NS.convert = convert; NS.validate = validate;

  // ---------- 4) UI: MODAL ----------
  function parseInput(text) {
    var jsonText = extractJsonText(text);   // boc JSON khoi fence/loi van
    var data = JSON.parse(jsonText);        // co the throw
    var arr = Array.isArray(data) ? data : [data];
    return arr.map(cleanFlat);              // lam sach truoc khi dung
  }
  function previewHtml(flat) {
    var c = convert(flat);
    function count(v) { return normLines(v).length; }
    var b = count(flat.phrasesBefore), d = count(flat.phrasesDuring), a = count(flat.phrasesAfter);
    var first = normLines(flat.phrasesBefore).concat(normLines(flat.phrasesDuring)).slice(0, 3);
    return '<div class="imp-prev"><div class="imp-prev-head"><span class="imp-emoji">' + esc(flat.emoji || '✨') + '</span><div><div class="imp-name">' + esc(flat.topicName || flat.name || '(chua co ten)') + '</div><div class="imp-meta">Level ' + esc(String(flat.level || '?')) + (flat.category ? ' · ' + esc(flat.category) : '') + ' · ' + (b + d + a) + ' phrases (B' + b + '/D' + d + '/A' + a + ')' + (c.extras.missions.length ? ' · ' + c.extras.missions.length + ' missions' : '') + (c.extras.recall.length ? ' · ' + c.extras.recall.length + ' recall' : '') + '</div></div></div>' + (flat.why ? '<div class="imp-why">' + esc(String(flat.why).slice(0, 160)) + '</div>' : '') + (first.length ? '<ul class="imp-ph">' + first.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var modalEl = null;
  function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } }
  function openModal() {
    closeModal(); injectCSS();
    modalEl = document.createElement('div'); modalEl.className = 'imp-overlay';
    modalEl.innerHTML = '<div class="imp-modal"><div class="imp-top"><b>📥 Import Topic</b><button class="imp-x" data-act="close">×</button></div><div class="imp-hint">Dán thẳng JSON từ NotebookLM — tự động làm sạch trích dẫn [1], (2), code fence…</div><div class="imp-tabs"><button class="imp-tab on" data-tab="paste">Paste JSON</button><button class="imp-tab" data-tab="file">Upload .json</button></div><div class="imp-body"><div data-pane="paste"><textarea class="imp-ta" placeholder=\'Dán JSON (hoặc cả đoạn NotebookLM xuất ra)...\'></textarea></div><div data-pane="file" class="imp-hidden"><label class="imp-file">Chọn file .json<input type="file" accept="application/json,.json,.txt" class="imp-input"></label><div class="imp-fname imp-muted"></div></div><div class="imp-actions"><button class="imp-btn" data-act="check">Kiểm tra & Preview</button><span class="imp-status imp-muted"></span></div><div class="imp-preview"></div></div><div class="imp-foot"><button class="imp-btn ghost" data-act="close">Hủy</button><button class="imp-btn solid" data-act="import" disabled>Import</button></div></div>';
    document.body.appendChild(modalEl);
    var parsed = null;
    var q = function (s) { return modalEl.querySelector(s); };
    function setStatus(msg, ok) { var el = q('.imp-status'); el.textContent = msg || ''; el.style.color = ok ? '#15803d' : '#b91c1c'; }
    function setPreview(html) { q('.imp-preview').innerHTML = html || ''; }
    function enableImport(on) { q('[data-act=import]').disabled = !on; }
    function runCheck() {
      parsed = null; enableImport(false); setPreview('');
      var activeFile = !q('[data-pane="file"]').classList.contains('imp-hidden');
      var text = activeFile ? (modalEl._fileText || '') : q('.imp-ta').value;
      if (!text || !text.trim()) { setStatus('Chưa có dữ liệu.', false); return; }
      var arr; try { arr = parseInput(text); } catch (e) { setStatus('JSON sai cú pháp: ' + e.message, false); return; }
      var allErr = [], previews = [];
      arr.forEach(function (flat, i) { var errs = validate(flat); if (errs.length) allErr.push('Topic #' + (i + 1) + ': ' + errs.join(' ')); else previews.push(previewHtml(flat)); });
      if (allErr.length) { setStatus(allErr[0] + (allErr.length > 1 ? ' (+' + (allErr.length - 1) + ' lỗi)' : ''), false); setPreview(previews.join('')); return; }
      parsed = arr; setStatus('OK — ' + arr.length + ' topic hợp lệ (đã tự làm sạch).', true); setPreview(previews.join('')); enableImport(true);
    }
    modalEl.addEventListener('click', function (e) {
      var act = e.target.getAttribute('data-act'), tab = e.target.getAttribute('data-tab');
      if (act === 'close') return closeModal();
      if (act === 'check') return runCheck();
      if (act === 'import') { if (!parsed) return; parsed.forEach(function (flat) { doImport(flat); }); return; }
      if (tab) { modalEl.querySelectorAll('.imp-tab').forEach(function (b) { b.classList.toggle('on', b === e.target); }); q('[data-pane="paste"]').classList.toggle('imp-hidden', tab !== 'paste'); q('[data-pane="file"]').classList.toggle('imp-hidden', tab !== 'file'); setStatus(''); setPreview(''); enableImport(false); }
    });
    q('.imp-input').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; q('.imp-fname').textContent = f.name; var r = new FileReader(); r.onload = function () { modalEl._fileText = String(r.result || ''); runCheck(); }; r.readAsText(f); });
  }
  NS.open = openModal;

  // ---------- 5) NUT "Import Topic" canh Import Backup ----------
  function findToolbar() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('button, a, .btn'));
    var ib = btns.filter(function (b) { return /import\s*backup/i.test(b.textContent || ''); })[0];
    return ib ? ib.parentNode : null;
  }
  function injectButton() {
    if (document.getElementById('imp-topic-btn')) return true;
    var bar = findToolbar(); if (!bar) return false;
    var anchor = Array.prototype.slice.call(bar.querySelectorAll('button, a')).filter(function (b) { return /import\s*backup/i.test(b.textContent || ''); })[0];
    var btn = document.createElement('button'); btn.id = 'imp-topic-btn'; btn.type = 'button'; btn.textContent = '📥 Import Topic';
    if (anchor) { btn.className = anchor.className; }
    btn.style.background = 'linear-gradient(90deg,#16a34a,#22c55e)'; btn.style.color = '#fff';
    btn.addEventListener('click', openModal);
    if (anchor && anchor.nextSibling) bar.insertBefore(btn, anchor.nextSibling); else bar.appendChild(btn);
    return true;
  }
  function watch() { injectButton(); try { var mo = new MutationObserver(function () { injectButton(); }); mo.observe(document.body, { childList: true, subtree: true }); NS._mo = mo; } catch (e) {} }

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById('imp-css')) return;
    var s = document.createElement('style'); s.id = 'imp-css';
    s.textContent = '.imp-overlay{position:fixed;inset:0;background:rgba(8,6,20,.66);z-index:99999;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow:auto;font-family:Inter,system-ui,sans-serif}.imp-modal{width:680px;max-width:100%;background:#14122a;color:#e9e7f5;border:1px solid #2a2748;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5)}.imp-top{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #2a2748;font-size:15px}.imp-hint{padding:10px 18px 0;font-size:12px;color:#9a96bf}.imp-x{background:none;border:none;color:#9a96bf;font-size:22px;cursor:pointer;line-height:1}.imp-tabs{display:flex;gap:6px;padding:12px 18px 0}.imp-tab{background:#1c1940;border:1px solid #2a2748;color:#c9c5e8;border-radius:9px 9px 0 0;padding:8px 14px;cursor:pointer;font-weight:600;font-size:13px}.imp-tab.on{background:#241f4d;color:#fff;border-bottom-color:#241f4d}.imp-body{padding:14px 18px}.imp-ta{width:100%;min-height:160px;background:#0f0d22;border:1px solid #2a2748;border-radius:10px;color:#e9e7f5;padding:11px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;resize:vertical}.imp-file{display:inline-block;background:#1c1940;border:1px dashed #4F46E5;border-radius:10px;padding:18px 22px;cursor:pointer;color:#c9c5e8}.imp-input{display:none}.imp-actions{display:flex;align-items:center;gap:12px;margin-top:12px}.imp-btn{font-family:inherit;font-weight:700;font-size:13px;border:1.5px solid #4F46E5;color:#c7c3ee;background:#1a1640;border-radius:10px;padding:9px 16px;cursor:pointer}.imp-btn.solid{background:linear-gradient(90deg,#16a34a,#22c55e);color:#fff;border-color:transparent}.imp-btn.ghost{background:transparent}.imp-btn:disabled{opacity:.45;cursor:not-allowed}.imp-status{font-size:12.5px}.imp-muted{color:#8e8ab3}.imp-preview{margin-top:12px}.imp-prev{background:#0f0d22;border:1px solid #2a2748;border-radius:12px;padding:12px;margin-bottom:10px}.imp-prev-head{display:flex;gap:10px;align-items:center}.imp-emoji{font-size:26px}.imp-name{font-weight:800}.imp-meta{font-size:12px;color:#9a96bf}.imp-why{font-size:12.5px;color:#bdb9e0;margin-top:8px}.imp-ph{margin:8px 0 0;padding-left:18px;font-size:12.5px;color:#cfcbef}.imp-ph li{margin:2px 0}.imp-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;border-top:1px solid #2a2748}.imp-hidden{display:none}';
    document.head.appendChild(s);
  }

  // ---------- boot ----------
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  NS.selfTest = function () {
    var demo = '```json\n{ "topicName": "TEST Cleaner [1]", "level": "Level 2",\n  "phrasesBefore": "Hello [1] | Xin chao (2)\\nWhat do you recommend?¹ | Ban goi y mon nao?",\n  "phrasesDuring": "I will have the steak. | Toi goi bit tet",\n  "activeRecall": "Ban noi gi? | Hello | Bat dau bang Can I",\n  "realLifeMissions": "Tu goi mon bang tieng Anh | Ghi am lai" }\n```';
    var arr = parseInput(demo); console.log('[IMPORT selfTest] cleaned =', arr); return arr;
  };
  console.log('[SHADOW_IMPORT] ready v' + NS.version + ' — cleaner + reuse SHADOW_V18.saveLesson');
})();
