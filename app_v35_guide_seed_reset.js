// ============================================================
// SHADOW ENGLISH v35 — Guide Tooltips + Sample Lessons + Reset
// ------------------------------------------------------------
// 3 việc trong 1 module (KHÔNG tạo thêm file nào nữa sau file này):
//   A. GUIDE   — nút ❗ cạnh mỗi tiêu đề mục trên trang chi tiết topic.
//                Click → hiện giải thích tiếng Việt: mục này là gì,
//                giúp gì cho việc học, dùng như thế nào, mất bao lâu.
//   B. SAMPLE  — 2 bài mẫu Level 1 (L1-01 Ordering Food & Drinks,
//                L1-02 Asking for Directions) được seed đầy đủ nội dung.
//                Khoá xoá: muốn xoá phải nhập mật khẩu.
//   C. RESET   — Reset ngày bắt đầu: từng topic (về Day 0) và
//                reset toàn hệ thống (cho người học mới).
//
// Không sửa file cũ. Không phụ thuộc thứ tự load (tự retry qua observer).
// ============================================================

(function () {
  'use strict';
  if (window.SHADOW_V35) return;

  var NS = window.SHADOW_V35 = {};
  NS.version = '35.6.0';

  // ---------------------------------------------------------- hằng số
  var STATE_KEY = 'shadow-en-state-v3';
  var OV_PREFIX = 'shadow-en-overlay-';
  var GP_KEY    = 'shadow-en-grammar-patterns';
  var SEED_FLAG = 'shadow-en-v35-seeded';
  var PASSWORD  = '11223344';
  var PROTECTED = ['L1-01', 'L1-02'];   // 2 bài mẫu — không cho xoá tự do

  function log() { try { console.log.apply(console, ['[v35]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  function toast(msg) {
    try { if (typeof window.toast === 'function') return window.toast(msg); } catch (e) {}
    try { console.log('[v35] ' + msg); } catch (e) {}
  }

  function getState() {
    try { if (window.shadowEN && window.shadowEN.state) return window.shadowEN.state; } catch (e) {}
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveState(s) {
    try { if (typeof window.saveState === 'function' && window.shadowEN && window.shadowEN.state === s) return window.saveState(); } catch (e) {}
    try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function rawOverlay(id) { try { return JSON.parse(localStorage.getItem(OV_PREFIX + id) || 'null'); } catch (e) { return null; } }
  function writeOverlay(id, ov) { try { localStorage.setItem(OV_PREFIX + id, JSON.stringify(ov)); } catch (e) {} }
  function refreshAll() {
    try { if (window.shadowEN && typeof window.shadowEN.render === 'function') window.shadowEN.render(); } catch (e) {}
    try { if (typeof window.render === 'function') window.render(); } catch (e) {}
  }

  // ============================================================
  // A. GUIDE — nội dung hướng dẫn từng mục
  // ============================================================
  var GUIDE = [
    { rx: /WHY THIS TOPIC|VÌ SAO/i, icon: '🤔', title: 'Vì sao học chủ đề này',
      what: 'Lý do chủ đề này tồn tại trong lộ trình của bạn — nó phục vụ tình huống thật nào trong đời sống.',
      how : 'Đọc 1 lần trước khi bắt đầu buổi học. Nếu đọc xong bạn không thấy mình sẽ dùng nó trong 7 ngày tới, hãy đổi sang chủ đề khác — học cái không dùng là cách quên nhanh nhất.',
      time: '30 giây' },

    { rx: /THE SCENE|BỐI CẢNH/i, icon: '🎬', title: 'Bối cảnh',
      what: 'Khung cảnh cụ thể bạn sẽ tưởng tượng khi luyện: ở đâu, với ai, đang cần gì.',
      how : 'Nhắm mắt dựng lại cảnh này trong đầu trước khi shadow. Não ghi nhớ câu gắn với cảnh mạnh hơn nhiều so với câu trôi nổi một mình.',
      time: '30 giây' },

    { rx: /VIDEO IMMERSION|VIDEO/i, icon: '▶️', title: 'Video ngâm mình',
      what: 'Một video người bản xứ nói thật trong đúng bối cảnh trên. Dán link YouTube hoặc Vimeo vào là tự nhúng.',
      how : 'Xem 1 lần KHÔNG phụ đề để quen nhạc điệu → xem lần 2 CÓ phụ đề để hiểu → lần 3 nói nhại theo. Đây là bước "nạp âm thanh" trước khi luyện miệng.',
      time: '3–5 phút' },

    { rx: /CORE PHRASES|CỤM CỐT LÕI/i, icon: '💬', title: 'Cụm từ cốt lõi (Before / During / After)',
      what: 'Bộ câu xương sống của chủ đề, chia theo trình tự tình huống thật: TRƯỚC khi bước vào, TRONG lúc nói chuyện, SAU khi kết thúc.',
      how : 'Không học thuộc lòng. Đọc to từng câu 3 lần, bắt chước đúng ngữ điệu. Ưu tiên thuộc 5 câu dùng được ngay hơn là biết 20 câu nói không trôi.',
      time: '5–8 phút' },

    { rx: /GRAMMAR PATTERNS|NGỮ PHÁP|CẤU TRÚC/i, icon: '📐', title: 'Cấu trúc ngữ pháp',
      what: 'Khuôn câu rút ra từ chính các cụm ở trên: Pattern → Nghĩa → Ví dụ. Đây là ngữ pháp để NÓI, không phải ngữ pháp để thi.',
      how : 'Lấy 1 khuôn, thay 3 danh từ khác nhau vào và nói to. Nắm được khuôn thì 1 câu thành 20 câu. Có thể bấm tạo bằng AI nếu đã bật Gemini.',
      time: '3–5 phút' },

    { rx: /DIALOGUE|HỘI THOẠI/i, icon: '🎭', title: 'Hội thoại mẫu',
      what: 'Một đoạn đối thoại hoàn chỉnh ghép các cụm từ lại thành cuộc trò chuyện thật.',
      how : 'Đọc vai A, rồi đọc vai B, rồi đọc cả hai. Bước này dạy bạn cách NỐI câu — thứ mà học cụm rời rạc không bao giờ dạy được.',
      time: '3–5 phút' },

    { rx: /SHADOW SCRIPT|SHADOWING/i, icon: '🗣️', title: 'Kịch bản Shadowing',
      what: 'Đoạn văn bản để nói ĐUỔI THEO người bản xứ — nghe tới đâu nói tới đó, chậm hơn họ khoảng nửa giây.',
      how : 'Đây là phần quan trọng nhất của cả bài. Không dừng lại sửa lỗi giữa chừng, cứ chạy hết đoạn rồi lặp lại. Mục tiêu là miệng chạy kịp tai, không phải nói đúng 100%.',
      time: '8–10 phút' },

    { rx: /REAL ENGLISH|TIẾNG ANH THẬT/i, icon: '🎤', title: 'Tiếng Anh thật (native)',
      what: 'Cách người bản xứ thực sự nói — khác với sách giáo khoa: nói tắt, nuốt âm, dùng tiếng lóng.',
      how : 'Đối chiếu với Core Phrases để thấy khoảng cách giữa "đúng ngữ pháp" và "nghe tự nhiên". Nghe hiểu là đủ, chưa cần dùng ngay.',
      time: '2–3 phút' },

    { rx: /CONNECTED SPEECH|NỐI ÂM|LINKING/i, icon: '🔗', title: 'Nối âm',
      what: 'Chỗ các từ dính vào nhau khi nói nhanh (want to → wanna, what are you → whaddaya).',
      how : 'Đây là lý do số 1 khiến bạn nghe không kịp người bản xứ. Luyện đúng chỗ nối âm thì kỹ năng NGHE tự tăng theo, không cần luyện nghe riêng.',
      time: '3–5 phút' },

    { rx: /WORD ORDER|TRẬT TỰ TỪ|SẮP XẾP/i, icon: '🧩', title: 'Sắp xếp trật tự từ',
      what: 'Trò chơi ghép lại câu từ các mảnh từ bị xáo trộn.',
      how : 'Làm khi bạn nghĩ mình đã thuộc. Nếu ghép sai nghĩa là bạn mới nhớ mặt chữ chứ chưa nắm cấu trúc — quay lại Core Phrases.',
      time: '2–3 phút' },

    { rx: /ACTIVE RECALL|RECALL|NHỚ CHỦ ĐỘNG/i, icon: '🧠', title: 'Nhớ chủ động',
      what: 'Câu hỏi buộc bạn tự bật ra câu trả lời mà KHÔNG nhìn bài.',
      how : 'Bước dễ bị bỏ qua nhất và cũng quan trọng nhất. Đọc lại bài 10 lần nhớ kém hơn tự nhớ lại 1 lần. Bí thì đợi 10 giây rồi mới xem đáp án — chính 10 giây bí đó tạo ra trí nhớ.',
      time: '3–5 phút' },

    { rx: /MISSION|NHIỆM VỤ/i, icon: '🎯', title: 'Nhiệm vụ đời thật',
      what: 'Việc cụ thể phải làm NGOÀI app: nói câu này với người thật, nhắn tin thật, gọi điện thật.',
      how : 'Đây là chỗ tiếng Anh chuyển từ "biết" sang "dùng được". Một chủ đề chỉ được tính là xong khi bạn đã hoàn thành ít nhất 1 nhiệm vụ ngoài đời.',
      time: 'Trong ngày' },

    { rx: /MIND ?MAP|SƠ ĐỒ|TỔNG KẾT/i, icon: '🗺️', title: 'Sơ đồ tổng kết bài',
      what: 'Toàn bộ bài học nén lại thành một sơ đồ nhìn một phát là nhớ ra.',
      how : 'Dùng khi ôn lại ở Day 3 / Day 7 / Day 21 — nhìn sơ đồ và tự nói lại cả bài, không mở phần chi tiết. Đây là công cụ ôn, không phải công cụ học lần đầu.',
      time: '1–2 phút' },

    { rx: /MEMORY LOOP|VÒNG LẶP|ÔN TẬP/i, icon: '🔁', title: 'Vòng lặp ghi nhớ',
      what: 'Lịch ôn theo Day 0 → 1 → 3 → 7 → 21 → 60. Mỗi lần ôn đúng hạn, khoảng cách lần sau giãn ra.',
      how : 'Đừng học chủ đề mới khi còn bài đến hạn ôn. Ôn 5 phút đúng hạn giữ được bài cũ; học bài mới trong khi bỏ ôn thì cả hai cùng rơi.',
      time: '5 phút/lần' },

    { rx: /NOTES?|GHI CHÚ/i, icon: '📝', title: 'Ghi chú',
      what: 'Chỗ ghi lại điều bạn tự phát hiện: câu nói sai, từ quên hoài, phản ứng của người nghe.',
      how : 'Chỉ ghi cái xảy ra với BẠN, đừng chép lại nội dung đã có sẵn trong bài. Ghi chú có giá trị là ghi chú không tìm được ở chỗ khác.',
      time: '1 phút' }
  ];

  function guideFor(text) {
    var t = String(text || '');
    for (var i = 0; i < GUIDE.length; i++) if (GUIDE[i].rx.test(t)) return GUIDE[i];
    return null;
  }

  // ============================================================
  // E. FONT — vá lỗi chữ trên nút bấm bị lệch font
  // ------------------------------------------------------------
  // index.html chỉ đặt font-family cho body. Nhưng <button>, <input>,
  // <select>, <textarea> KHÔNG kế thừa font-family — trình duyệt áp font mặc
  // định của hệ điều hành. Font đó thiếu ký tự có dấu tiếng Việt, nên
  // "Bắt đầu ôn" bị vẽ chắp vá: chữ cái một font, dấu một font khác.
  // Cách sửa: nạp Inter (đủ bộ chữ Việt) + ép mọi form control kế thừa font.
  // ============================================================
  function injectFont() {
    var FID = 'v35-font-inter';
    if (!document.getElementById(FID)) {
      var pre = document.createElement('link');
      pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = '';
      document.head.appendChild(pre);

      var l = document.createElement('link');
      l.id = FID; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(l);
    }

    var SID = 'v35-font-fix-' + NS.version;
    if (document.getElementById(SID)) return;
    var oldF = document.querySelectorAll('style[id^="v35-font-fix-"]');
    for (var k = 0; k < oldF.length; k++) oldF[k].remove();

    var sf = document.createElement('style'); sf.id = SID;
    sf.textContent = [
      ':root{--v35-font:"Inter","Segoe UI Variable Text","Segoe UI",-apple-system,',
      'BlinkMacSystemFont,"Helvetica Neue",Arial,"Noto Sans",sans-serif}',

      /* 1. Nút và ô nhập KHÔNG tự kế thừa font — phải ép */
      'button,input,select,textarea,optgroup{font-family:var(--v35-font);',
      'font-feature-settings:inherit;font-variant-ligatures:inherit}',

      /* 2. Thân trang dùng cùng một font để nút và chữ thường khớp nhau */
      'body,.app,.sidebar,.main,.content{font-family:var(--v35-font)}',

      /* 3. Các nút có tên lớp riêng trong app — quét hết cho chắc */
      '.mission-btn,.step-btn,.audio-btn,.v12-edit-toggle,.v12-section-edit-btn,',
      '.v17-btn,.imp-btn,.imp-tab,.ssa-btn,.gp-btn,.v21-btn,.v22-btn,.v13-btn,',
      '.nav-item,.card-title,.chip,.tag,.badge,.pill,.day-tag,.topic-stage-tag',
      '{font-family:var(--v35-font)}',

      /* 4. Giữ nguyên chỗ CỐ Ý dùng font khác (script đọc, code, IPA) */
      '.shadow-text{font-family:Georgia,"Times New Roman",serif}',
      '.quote-text{font-family:Georgia,serif}',
      '.ai-prompt-text,.audio-hint{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    ].join('');
    document.head.appendChild(sf);
  }
  NS.injectFont = injectFont;

  // ---------------------------------------------------------- CSS
  function injectCSS() {
    try { injectFont(); } catch (e) {}
    var id = 'v35-styles-' + NS.version;
    if (document.getElementById(id)) return;
    // dọn bản cũ nếu có (tránh lỗi TD-5: CSS không cập nhật giữa các phiên)
    var old = document.querySelectorAll('style[id^="v35-styles-"]');
    for (var i = 0; i < old.length; i++) old[i].remove();

    var s = document.createElement('style'); s.id = id;
    s.textContent = [
      '.v35-help{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;',
      'margin-left:8px;border-radius:50%;border:1px solid rgba(167,139,250,.55);background:rgba(124,92,255,.16);',
      'color:#c4b5fd;font-size:12px;font-weight:800;line-height:1;cursor:pointer;padding:0;vertical-align:middle;',
      'font-family:inherit;transition:all .15s;flex:0 0 auto}',
      '.v35-help:hover{background:rgba(124,92,255,.4);color:#fff;transform:scale(1.12)}',
      '.v35-help:focus-visible{outline:2px solid #a78bfa;outline-offset:2px}',

      '.v35-pop{position:fixed;z-index:99999;width:min(360px,calc(100vw - 32px));',
      'background:#171331;border:1px solid rgba(167,139,250,.4);border-radius:14px;',
      'box-shadow:0 18px 50px rgba(0,0,0,.55);padding:16px 18px;color:#e9e6f7;',
      'font-size:13px;line-height:1.6;animation:v35in .14s ease-out}',
      '@keyframes v35in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}',
      '.v35-pop-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:#fff;margin-bottom:10px;padding-right:22px}',
      '.v35-pop-x{position:absolute;top:10px;right:12px;background:none;border:none;color:#8b85a8;',
      'font-size:19px;line-height:1;cursor:pointer;padding:2px 5px;border-radius:6px}',
      '.v35-pop-x:hover{color:#fff;background:rgba(255,255,255,.08)}',
      '.v35-row{margin-bottom:9px}',
      '.v35-row:last-child{margin-bottom:0}',
      '.v35-lb{display:block;font-size:10px;font-weight:800;letter-spacing:.09em;color:#a78bfa;margin-bottom:2px}',
      '.v35-tx{color:#cfcae4}',
      '.v35-time{display:inline-block;margin-top:10px;padding:3px 9px;border-radius:999px;',
      'background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.35);color:#86efac;font-size:11px;font-weight:700}',

      '.v35-lock{display:inline-flex;align-items:center;gap:4px;margin-left:6px;padding:2px 7px;border-radius:999px;',
      'background:rgba(250,204,21,.14);border:1px solid rgba(250,204,21,.4);color:#fde047;font-size:10px;font-weight:800;vertical-align:middle}',

      '.v35-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;border-radius:10px;',
      'border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#e9e6f7;',
      'font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}',
      '.v35-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.28)}',
      '.v35-btn.warn{border-color:rgba(239,68,68,.45);color:#fca5a5;background:rgba(239,68,68,.1)}',
      '.v35-btn.warn:hover{background:rgba(239,68,68,.22);color:#fff}',
      '.v35-hero-reset{width:100%;margin-top:6px}',

      /* ---------- MODAL ---------- */
      '.v35-modal{position:fixed;inset:0;z-index:100000;background:rgba(6,4,18,.78);',
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);',
      'display:flex;align-items:center;justify-content:center;padding:20px;',
      'animation:v35fade .16s ease-out}',
      '@keyframes v35fade{from{opacity:0}to{opacity:1}}',
      '@keyframes v35rise{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}',

      '.v35-box{width:min(520px,100%);max-height:calc(100vh - 40px);overflow:auto;',
      'background:linear-gradient(160deg,#1b1638 0%,#141029 100%);',
      'border:1px solid rgba(167,139,250,.28);border-radius:20px;',
      'box-shadow:0 30px 90px rgba(0,0,0,.68),0 0 0 1px rgba(255,255,255,.03) inset;',
      'color:#e9e6f7;animation:v35rise .2s cubic-bezier(.2,.8,.3,1);position:relative}',
      '.v35-box::-webkit-scrollbar{width:8px}',
      '.v35-box::-webkit-scrollbar-thumb{background:rgba(167,139,250,.3);border-radius:8px}',

      '.v35-mhead{display:flex;gap:14px;align-items:flex-start;padding:24px 26px 18px;',
      'border-bottom:1px solid rgba(255,255,255,.07)}',
      '.v35-micon{flex:0 0 auto;width:44px;height:44px;border-radius:13px;display:flex;',
      'align-items:center;justify-content:center;font-size:21px}',
      '.v35-micon.danger{background:linear-gradient(140deg,rgba(239,68,68,.26),rgba(239,68,68,.1));',
      'border:1px solid rgba(239,68,68,.34)}',
      '.v35-micon.lock{background:linear-gradient(140deg,rgba(250,204,21,.24),rgba(250,204,21,.08));',
      'border:1px solid rgba(250,204,21,.36)}',
      '.v35-mtitle{font-size:17px;font-weight:800;color:#fff;line-height:1.35;margin-bottom:4px;letter-spacing:-.01em}',
      '.v35-msub{font-size:13px;line-height:1.6;color:#a49dc4}',
      '.v35-mx{position:absolute;top:16px;right:18px;width:30px;height:30px;border:none;border-radius:9px;',
      'background:rgba(255,255,255,.05);color:#8b85a8;font-size:18px;line-height:1;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;transition:all .15s}',
      '.v35-mx:hover{background:rgba(255,255,255,.12);color:#fff}',

      '.v35-mbody{padding:20px 26px 4px}',
      '.v35-panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
      '@media(max-width:520px){.v35-panels{grid-template-columns:1fr}}',
      '.v35-panel{border-radius:13px;padding:13px 15px;border:1px solid transparent}',
      '.v35-panel.lose{background:rgba(239,68,68,.07);border-color:rgba(239,68,68,.22)}',
      '.v35-panel.keep{background:rgba(34,197,94,.07);border-color:rgba(34,197,94,.22)}',
      '.v35-plabel{font-size:10px;font-weight:800;letter-spacing:.1em;margin-bottom:8px;display:block}',
      '.v35-panel.lose .v35-plabel{color:#f87171}',
      '.v35-panel.keep .v35-plabel{color:#4ade80}',
      '.v35-panel ul{margin:0;padding:0;list-style:none}',
      '.v35-panel li{position:relative;padding-left:15px;font-size:12.5px;line-height:1.55;',
      'color:#cfcae4;margin-bottom:5px}',
      '.v35-panel li:last-child{margin-bottom:0}',
      '.v35-panel li::before{content:"";position:absolute;left:0;top:8px;width:5px;height:5px;border-radius:50%}',
      '.v35-panel.lose li::before{background:#f87171}',
      '.v35-panel.keep li::before{background:#4ade80}',

      '.v35-note{margin-top:14px;font-size:12.5px;line-height:1.6;color:#a49dc4;',
      'padding:10px 14px 10px 12px;border-radius:0 10px 10px 0;',
      'background:linear-gradient(90deg,rgba(250,204,21,.1),rgba(250,204,21,.02));',
      'border-left:3px solid rgba(250,204,21,.65);display:flex;gap:9px;align-items:flex-start}',
      '.v35-note::before{content:"\\1F4A1";flex:0 0 auto;font-size:13px;line-height:1.5}',
      '.v35-note b{color:#e3dff5;font-weight:700}',

      '.v35-field{margin-top:16px}',
      '.v35-flabel{display:block;font-size:12.5px;color:#b8b2d0;margin-bottom:8px}',
      '.v35-flabel b{color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;',
      'background:rgba(167,139,250,.18);padding:1px 7px;border-radius:5px;letter-spacing:.06em}',
      '.v35-box input{width:100%;padding:12px 15px;border-radius:11px;',
      'border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.32);color:#fff;',
      'font-size:14.5px;font-family:inherit;box-sizing:border-box;transition:all .15s;',
      'letter-spacing:.02em}',
      '.v35-box input::placeholder{color:#6b6588}',
      '.v35-box input:focus{outline:none;border-color:rgba(167,139,250,.75);',
      'background:rgba(0,0,0,.42);box-shadow:0 0 0 3px rgba(124,92,255,.14)}',
      '.v35-box input.bad{border-color:rgba(239,68,68,.7);box-shadow:0 0 0 3px rgba(239,68,68,.12);',
      'animation:v35shake .3s}',
      '@keyframes v35shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}',
      '.v35-err{color:#fca5a5;font-size:12.5px;margin-top:8px;min-height:17px;display:flex;align-items:center;gap:5px}',

      '.v35-acts{display:flex;gap:10px;justify-content:flex-end;padding:18px 26px 22px;margin-top:6px}',
      '.v35-mbtn{padding:11px 20px;border-radius:11px;font-size:13.5px;font-weight:700;',
      'cursor:pointer;font-family:inherit;border:1px solid transparent;transition:all .15s}',
      '.v35-mbtn.ghost{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.13);color:#c9c4e0}',
      '.v35-mbtn.ghost:hover{background:rgba(255,255,255,.12);color:#fff}',
      '.v35-mbtn.go{background:linear-gradient(135deg,#e0483c,#b93226);color:#fff;',
      'box-shadow:0 6px 18px rgba(206,62,43,.32)}',
      '.v35-mbtn.go:hover:not(:disabled){filter:brightness(1.12);transform:translateY(-1px);',
      'box-shadow:0 9px 24px rgba(206,62,43,.42)}',
      '.v35-mbtn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;transform:none}',
      '.v35-mbtn.save{background:linear-gradient(135deg,#7c5cff,#a78bfa);color:#fff;',
      'box-shadow:0 6px 18px rgba(124,92,255,.34)}',
      '.v35-mbtn.save:hover{filter:brightness(1.1);transform:translateY(-1px)}',

      /* ---------- VOICE PICKER ---------- */
      '.v35-voice-btn{margin-left:10px;padding:7px 13px;font-size:12px}',
      '.v35-vlist{max-height:230px;overflow:auto;border:1px solid rgba(255,255,255,.09);',
      'border-radius:13px;padding:5px;background:rgba(0,0,0,.2)}',
      '.v35-vlist::-webkit-scrollbar{width:7px}',
      '.v35-vlist::-webkit-scrollbar-thumb{background:rgba(167,139,250,.3);border-radius:7px}',
      '.v35-vrow{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;',
      'cursor:pointer;transition:background .13s}',
      '.v35-vrow:hover{background:rgba(255,255,255,.05)}',
      '.v35-vrow.on{background:rgba(124,92,255,.17);box-shadow:inset 0 0 0 1px rgba(167,139,250,.42)}',
      '.v35-vrow input[type=radio]{accent-color:#a78bfa;width:15px;height:15px;flex:0 0 auto;margin:0}',
      '.v35-vname{flex:1;font-size:12.5px;color:#e3dff5;display:flex;align-items:center;gap:7px;',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.v35-vtag{font-size:9.5px;font-weight:800;padding:1px 6px;border-radius:999px;flex:0 0 auto}',
      '.v35-vtag.m{background:rgba(56,189,248,.18);color:#7dd3fc;border:1px solid rgba(56,189,248,.35)}',
      '.v35-vtag.f{background:rgba(244,114,182,.15);color:#f9a8d4;border:1px solid rgba(244,114,182,.3)}',
      '.v35-vlang{font-size:10.5px;color:#7b7599;flex:0 0 auto;font-family:ui-monospace,Menlo,monospace}',
      '.v35-vplay{flex:0 0 auto;width:27px;height:27px;border-radius:50%;border:1px solid rgba(167,139,250,.4);',
      'background:rgba(124,92,255,.2);color:#c4b5fd;font-size:10px;cursor:pointer;padding:0;',
      'display:flex;align-items:center;justify-content:center;transition:all .14s}',
      '.v35-vplay:hover{background:#7c5cff;color:#fff;transform:scale(1.1)}',
      '.v35-box input[type=range]{width:100%;accent-color:#a78bfa;padding:0;background:none;border:none;',
      'height:22px;cursor:pointer}',
      '.v35-box input[type=range]:focus{box-shadow:none}',
      '.v35-range-ends{display:flex;justify-content:space-between;font-size:11px;color:#7b7599;margin-top:2px}'
    ].join('');
    document.head.appendChild(s);
  }

  // ---------------------------------------------------------- popover
  var popEl = null;
  function closePop() { if (popEl) { popEl.remove(); popEl = null; } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePop(); closeModal(); } });
  document.addEventListener('click', function (e) {
    if (!popEl) return;
    if (popEl.contains(e.target)) return;
    if (e.target.classList && e.target.classList.contains('v35-help')) return;
    closePop();
  }, true);
  window.addEventListener('resize', closePop);
  window.addEventListener('scroll', closePop, true);

  function openPop(btn, g) {
    closePop(); injectCSS();
    popEl = document.createElement('div');
    popEl.className = 'v35-pop';
    popEl.setAttribute('role', 'dialog');
    popEl.innerHTML =
      '<button class="v35-pop-x" aria-label="Đóng">×</button>' +
      '<div class="v35-pop-h"><span>' + esc(g.icon) + '</span><span>' + esc(g.title) + '</span></div>' +
      '<div class="v35-row"><span class="v35-lb">MỤC NÀY LÀ GÌ</span><span class="v35-tx">' + esc(g.what) + '</span></div>' +
      '<div class="v35-row"><span class="v35-lb">DÙNG THẾ NÀO</span><span class="v35-tx">' + esc(g.how) + '</span></div>' +
      '<span class="v35-time">⏱ ' + esc(g.time) + '</span>';
    document.body.appendChild(popEl);
    popEl.querySelector('.v35-pop-x').onclick = closePop;

    var r = btn.getBoundingClientRect(), pr = popEl.getBoundingClientRect();
    var top = r.bottom + 8, left = r.left - 6;
    if (left + pr.width > window.innerWidth - 12) left = window.innerWidth - pr.width - 12;
    if (left < 12) left = 12;
    if (top + pr.height > window.innerHeight - 12) top = Math.max(12, r.top - pr.height - 8);
    popEl.style.top = top + 'px';
    popEl.style.left = left + 'px';
  }

  // ---------------------------------------------------------- gắn nút ❗
  function detailView() {
    var v = document.getElementById('view-topic-detail');
    return (v && v.classList.contains('active')) ? v : null;
  }
  function currentTopicId(view) {
    var b = view && view.querySelector('[data-action="start-session"][data-topic]');
    return b ? b.getAttribute('data-topic') : null;
  }

  // ---------------------------------------------------------- vá lỗi WHY/SCENE
  // Lỗi có sẵn trong app_v12_editor.js: WHY THIS TOPIC và THE SCENE nằm CHUNG một
  // thẻ .card, nhưng _findEditableContent() luôn lấy đoạn văn ngay sau tiêu đề ĐẦU
  // TIÊN của card. Vì thế cả 2 override cùng ghi vào một chỗ — 'scene' chạy sau nên
  // đè mất 'why', còn mục THE SCENE thì trống. Hàm này đặt lại đúng chỗ sau khi v12 chạy.
  function fixWhyScene() {
    var view = detailView(); if (!view) return;
    var id = currentTopicId(view); if (!id) return;
    var no = (rawOverlay(id) || {}).notionOverrides || {};
    if (no.why == null && no.scene == null) return;

    var titles = view.querySelectorAll('.card-title');
    for (var i = 0; i < titles.length; i++) {
      var t = titles[i], txt = t.textContent || '';
      var key = /WHY THIS TOPIC/i.test(txt) ? 'why' : (/THE SCENE/i.test(txt) ? 'scene' : null);
      if (!key || no[key] == null || !String(no[key]).trim()) continue;

      var el = t.nextElementSibling;
      while (el && (el.tagName === 'BUTTON' ||
             /v12-section-edit-btn|v12-overridden-badge|v15-|v35-/.test(String(el.className || '')))) {
        el = el.nextElementSibling;
      }
      if (!el || el.classList.contains('card-title')) {
        var p = document.createElement('p');
        p.style.cssText = 'color:var(--text-2);font-size:13px;margin-top:6px';
        t.parentNode.insertBefore(p, t.nextSibling);
        el = p;
      }
      if (el.textContent !== no[key]) el.textContent = no[key];
    }
  }
  NS.fixWhyScene = fixWhyScene;

  function attachHelp() {
    var view = detailView();
    if (!view) return;
    injectCSS();
    var titles = view.querySelectorAll('.card-title, .block-title, .vi-title, .v22-sec-title, .v21-sec-title, .v30-title, .today-section-title');
    for (var i = 0; i < titles.length; i++) {
      var el = titles[i];
      if (el.querySelector('.v35-help')) continue;
      var g = guideFor(el.textContent || '');
      if (!g) continue;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'v35-help';
      b.textContent = '!';
      b.title = 'Mục này là gì? Dùng thế nào?';
      b.setAttribute('aria-label', 'Hướng dẫn: ' + g.title);
      (function (btn, guide) {
        btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openPop(btn, guide); };
      })(b, g);
      el.appendChild(b);
    }
  }
  NS.attachHelp = attachHelp;

  // ============================================================
  // B. BÀI MẪU — nội dung đầy đủ 2 topic Level 1
  // ============================================================
  var SAMPLES = {
    'L1-01': {
      name: 'Ordering Food & Drinks',
      video: 'https://www.youtube.com/watch?v=Vm6I5fvZkeU',
      why: 'Gọi món là tình huống tiếng Anh đầu tiên gần như ai cũng gặp khi ra nước ngoài, và cũng là tình huống dễ tập nhất vì kịch bản gần như cố định: hỏi bàn → gọi món → hỏi giá → thanh toán. Học xong bài này bạn có một tình huống hoàn chỉnh dùng được ngay, thay vì một mớ từ vựng rời rạc.',
      scene: 'Bạn bước vào một quán ăn nhỏ ở nước ngoài lúc 12h trưa. Quán khá đông. Nhân viên phục vụ tiến lại hỏi bạn đi mấy người. Bạn cần: xin bàn, xem menu, gọi một món chính và một đồ uống, hỏi giá, rồi trả tiền và rời đi.',
      before: [
        "Table for two, please. | Cho tôi bàn hai người.",
        "Do you have a table available? | Còn bàn trống không ạ?",
        "Could I see the menu, please? | Cho tôi xem thực đơn được không?",
        "Do you have an English menu? | Quán có menu tiếng Anh không?",
        "We're ready to order. | Chúng tôi gọi món luôn nhé.",
        "Give us a few more minutes, please. | Cho chúng tôi thêm vài phút nữa."
      ],
      during: [
        "I'd like the grilled chicken, please. | Cho tôi món gà nướng.",
        "I'll have the same. | Tôi gọi giống vậy.",
        "What do you recommend? | Quán có món gì ngon giới thiệu không?",
        "Is this dish spicy? | Món này có cay không?",
        "Can I have it without onions? | Bỏ hành giúp tôi được không?",
        "A glass of water, please. | Cho tôi một ly nước.",
        "How much does it cost? | Món này bao nhiêu tiền?",
        "Could I get some more napkins? | Cho tôi xin thêm giấy ăn."
      ],
      after: [
        "Could we have the bill, please? | Cho chúng tôi thanh toán.",
        "Can I pay by card? | Tôi trả bằng thẻ được không?",
        "Do you take cash? | Quán có nhận tiền mặt không?",
        "Keep the change. | Khỏi thối lại.",
        "The food was delicious, thank you. | Đồ ăn ngon lắm, cảm ơn.",
        "Have a nice day! | Chúc một ngày tốt lành!"
      ],
      dialogues: [
        'Waiter: Good afternoon! Table for how many?',
        'You: Table for two, please.',
        'Waiter: Right this way. Here is the menu.',
        'You: Thank you. What do you recommend?',
        'Waiter: The grilled chicken is very popular today.',
        "You: Sounds good. I'd like the grilled chicken, please. And a glass of water.",
        'Waiter: Anything else?',
        "You: That's all for now, thanks.",
        '— (sau bữa ăn) —',
        'You: Could we have the bill, please?',
        "Waiter: Of course. That's eighteen dollars.",
        'You: Can I pay by card?',
        'Waiter: Yes, absolutely.',
        'You: The food was delicious. Thank you!'
      ].join('\n'),
      shadow: [
        "Table for two, please. Could I see the menu?",
        "What do you recommend? ... Sounds good.",
        "I'd like the grilled chicken, please. And a glass of water.",
        "Is this dish spicy? Can I have it without onions?",
        "Could we have the bill, please? Can I pay by card?",
        "The food was delicious. Thank you, have a nice day!"
      ].join('\n'),
      realEnglish: [
        "I'd like → nghe thật là \"I'd like\" dính liền, gần như \"AID-like\". Đừng tách \"I would like\".",
        "Could I get… — người bản xứ dùng cái này nhiều hơn \"Could I have…\" trong quán ăn thường.",
        "What do you recommend? → nói nhanh thành \"Whaddaya recommend?\"",
        "That's all for now — cách lịch sự để dừng gọi món, tự nhiên hơn \"No more\".",
        "Nhân viên hay hỏi \"Are you all set?\" = \"Anh chị gọi đủ chưa ạ?\" — trả lời \"Yes, we're all set.\""
      ].join('\n'),
      missions: [
        "Gọi một món bằng tiếng Anh ở quán thật hoặc app giao đồ ăn | Dùng đúng mẫu I'd like… | Nhân viên hiểu ngay, không phải nhắc lại",
        "Ghi âm 60 giây tự đóng cả hai vai khách và phục vụ | Nghe lại và đánh dấu chỗ vấp | Nói trôi hết đoạn không dừng quá 2 lần",
        "Nhắn tin hỏi một nhà hàng bằng tiếng Anh về món chay hoặc giờ mở cửa | Dùng Do you have…? | Nhận được câu trả lời"
      ],
      recall: [
        "Bạn muốn xin bàn cho 2 người — nói thế nào? | Table for two, please. | Bắt đầu bằng \"Table for…\"",
        "Bạn muốn gọi món gà nướng — nói thế nào? | I'd like the grilled chicken, please. | Mẫu I'd like the…",
        "Bạn muốn hỏi giá — nói thế nào? | How much does it cost? | Bắt đầu bằng \"How much…\"",
        "Bạn muốn thanh toán — nói thế nào? | Could we have the bill, please? | Từ khoá: bill",
        "Bạn muốn hỏi món có cay không — nói thế nào? | Is this dish spicy? | Câu hỏi Yes/No với Is",
        "Bạn muốn bỏ hành — nói thế nào? | Can I have it without onions? | Từ khoá: without"
      ],
      patterns: [
        { pattern: "I'd like + [món], please.", meaning: 'Cách gọi món lịch sự chuẩn nhất. Dùng được ở mọi quán, mọi nước.',
          examples: ["I'd like the grilled chicken, please.", "I'd like a coffee, please.", "I'd like two spring rolls, please."] },
        { pattern: 'Could I + [động từ] …?', meaning: 'Xin phép / yêu cầu lịch sự. Lịch sự hơn Can I và an toàn với người lạ.',
          examples: ['Could I see the menu, please?', 'Could I get some water?', 'Could I pay by card?'] },
        { pattern: 'Do you have + [danh từ]?', meaning: 'Hỏi quán có sẵn thứ gì không — món, bàn, menu, hình thức thanh toán.',
          examples: ['Do you have an English menu?', 'Do you have vegetarian dishes?', 'Do you have a table for four?'] },
        { pattern: 'Can I have it without + [thứ cần bỏ]?', meaning: 'Yêu cầu bỏ bớt nguyên liệu — cực hữu ích khi bạn dị ứng hoặc kén ăn.',
          examples: ['Can I have it without onions?', 'Can I have it without ice?', 'Can I have it without sugar?'] },
        { pattern: 'How much + does/do + [chủ ngữ] + cost?', meaning: 'Hỏi giá. Nhớ khuôn này thì hỏi giá được ở mọi tình huống, không riêng nhà hàng.',
          examples: ['How much does it cost?', 'How much does this dish cost?', 'How much do these cost?'] }
      ]
    },

    'L1-02': {
      name: 'Asking for Directions',
      video: 'https://www.youtube.com/watch?v=eIi86aGyQuE',
      why: 'Lạc đường là tình huống bạn KHÔNG thể tránh bằng cách chỉ ngoài. Bạn phải hỏi được, và quan trọng hơn: phải NGHE HIỂU được câu trả lời. Đây là bài đầu tiên rèn kỹ năng nghe thật, vì người trả lời sẽ nói theo cách của họ chứ không theo sách.',
      scene: 'Bạn đang đứng trên một con phố lạ, điện thoại gần hết pin, cần tìm đường tới ga tàu. Bạn dừng một người đi bộ trông thân thiện lại hỏi. Họ trả lời khá nhanh và chỉ tay. Bạn cần hỏi lại cho rõ, xác nhận, rồi cảm ơn.',
      before: [
        "Excuse me, could you help me? | Xin lỗi, anh/chị giúp tôi được không?",
        "Sorry to bother you. | Xin lỗi đã làm phiền.",
        "Do you speak English? | Anh/chị có nói tiếng Anh không?",
        "I think I'm lost. | Hình như tôi bị lạc.",
        "I'm looking for the train station. | Tôi đang tìm ga tàu.",
        "Are you from around here? | Anh/chị ở gần đây không?"
      ],
      during: [
        "How do I get to the train station? | Đi tới ga tàu bằng cách nào?",
        "Where is the nearest ATM? | Cây ATM gần nhất ở đâu?",
        "Is it far from here? | Có xa đây không?",
        "How long does it take to walk? | Đi bộ mất bao lâu?",
        "Could you say that again, please? | Anh/chị nói lại giúp tôi được không?",
        "Could you speak more slowly, please? | Anh/chị nói chậm hơn được không?",
        "So I go straight and turn left? | Vậy tôi đi thẳng rồi rẽ trái đúng không?",
        "Could you show me on the map? | Chỉ giúp tôi trên bản đồ được không?"
      ],
      after: [
        "Thank you so much! | Cảm ơn anh/chị nhiều!",
        "That's very helpful. | Vậy là rõ rồi ạ.",
        "I really appreciate it. | Tôi rất cảm kích.",
        "Thanks anyway. | Dù sao cũng cảm ơn.",
        "Have a good day! | Chúc anh/chị một ngày tốt lành!"
      ],
      dialogues: [
        'You: Excuse me, sorry to bother you. Do you speak English?',
        'Stranger: Yes, a little. How can I help?',
        "You: I think I'm lost. How do I get to the train station?",
        'Stranger: Go straight down this street, then turn left at the traffic lights. It\'s next to the post office.',
        'You: Could you say that again, please? A bit more slowly.',
        'Stranger: Sure. Go straight, turn left at the lights, and it\'s next to the post office.',
        'You: So I go straight and turn left at the lights?',
        'Stranger: Exactly. About five minutes on foot.',
        'You: Is it far from here?',
        "Stranger: No, it's quite close.",
        'You: Thank you so much. That\'s very helpful!',
        'Stranger: No problem. Have a good day!'
      ].join('\n'),
      shadow: [
        "Excuse me, sorry to bother you. Do you speak English?",
        "I think I'm lost. How do I get to the train station?",
        "Could you say that again, please? A bit more slowly.",
        "So I go straight and turn left at the lights?",
        "Is it far from here? How long does it take to walk?",
        "Thank you so much. That's very helpful. Have a good day!"
      ].join('\n'),
      realEnglish: [
        "Người bản xứ hay mở đầu bằng \"You wanna go…\" thay vì \"You should go…\" — nghĩa giống nhau.",
        "\"It's just around the corner\" = rất gần, chỉ vài chục mét, không phải \"đi vòng qua góc\".",
        "\"You can't miss it\" = kiểu gì cũng thấy, dễ tìm lắm — câu này gặp rất nhiều.",
        "Turn left → nói nhanh dính thành \"turn-left\"; at the → \"a-the\" gần như mất chữ t.",
        "Nếu không hiểu, đừng gật đầu cho xong. Nói \"Sorry, I didn't catch that.\" — người bản xứ dùng chính câu này với nhau."
      ].join('\n'),
      missions: [
        "Mở Google Maps chế độ tiếng Anh, nghe hướng dẫn giọng nói 5 phút | Ghi lại 3 cụm chỉ đường bạn nghe được | Viết ra đúng 3 cụm",
        "Tự chỉ đường bằng tiếng Anh từ nhà bạn tới quán cà phê gần nhất, nói to | Dùng ít nhất 3 mẫu trong bài | Nói liền mạch 30 giây",
        "Hỏi đường một người nước ngoài hoặc trong nhóm chat tiếng Anh | Dùng mẫu How do I get to…? | Nhận được chỉ dẫn và hiểu được"
      ],
      recall: [
        "Bạn muốn hỏi đường tới ga tàu — nói thế nào? | How do I get to the train station? | Mẫu How do I get to…?",
        "Bạn không nghe kịp, muốn họ nói lại — nói thế nào? | Could you say that again, please? | Từ khoá: again",
        "Bạn muốn họ nói chậm hơn — nói thế nào? | Could you speak more slowly, please? | Từ khoá: slowly",
        "Bạn muốn xác nhận lại hướng đi — nói thế nào? | So I go straight and turn left? | Bắt đầu bằng \"So…\"",
        "Bạn muốn hỏi có xa không — nói thế nào? | Is it far from here? | Từ khoá: far",
        "Bạn muốn mở lời lịch sự với người lạ — nói thế nào? | Excuse me, sorry to bother you. | Hai câu ngắn ghép lại"
      ],
      patterns: [
        { pattern: 'How do I get to + [địa điểm]?', meaning: 'Câu hỏi đường chuẩn và an toàn nhất. Một khuôn dùng được cho mọi địa điểm.',
          examples: ['How do I get to the train station?', 'How do I get to the airport?', 'How do I get to your office?'] },
        { pattern: 'Where is the nearest + [địa điểm]?', meaning: 'Hỏi chỗ gần nhất khi bạn không biết tên địa điểm cụ thể.',
          examples: ['Where is the nearest ATM?', 'Where is the nearest pharmacy?', 'Where is the nearest bus stop?'] },
        { pattern: 'Could you + [động từ] … , please?', meaning: 'Nhờ ai đó làm gì một cách lịch sự — nói lại, nói chậm, chỉ trên bản đồ.',
          examples: ['Could you say that again, please?', 'Could you speak more slowly, please?', 'Could you show me on the map, please?'] },
        { pattern: 'So + [nhắc lại điều vừa nghe]?', meaning: 'Xác nhận lại để chắc mình hiểu đúng. Đây là kỹ thuật cứu bạn khi nghe chưa tốt.',
          examples: ['So I go straight and turn left?', 'So it takes about ten minutes?', "So it's next to the post office?"] },
        { pattern: 'Is it far from here? / How long does it take to + [động từ]?', meaning: 'Hỏi khoảng cách và thời gian — quyết định đi bộ hay bắt xe.',
          examples: ['Is it far from here?', 'How long does it take to walk?', 'How long does it take by bus?'] }
      ]
    }
  };

  // ---------------------------------------------------------- seed
  function toPhraseArr(lines) {
    return (lines || []).map(function (l) {
      var p = String(l).split(/\s*\|\s*/);
      return { en: (p[0] || '').trim(), vi: (p[1] || '').trim(), notes: '', example: '' };
    }).filter(function (x) { return x.en; });
  }
  function toMissionArr(lines) {
    return (lines || []).map(function (l) {
      var p = String(l).split(/\s*\|\s*/);
      return { id: uid('m'), title: (p[0] || l).trim(), description: (p[1] || '').trim(), difficulty: 'Easy', success: (p[2] || '').trim() };
    });
  }
  function toRecallArr(lines) {
    return (lines || []).map(function (l) {
      var p = String(l).split(/\s*\|\s*/);
      return { id: uid('rc'), question: (p[0] || l).trim(), answer: (p[1] || '').trim(), hint: (p[2] || '').trim() };
    });
  }
  // "Đã có nội dung thật" = có ít nhất 1 câu tiếng Anh KHÔNG rỗng.
  // Các dòng placeholder {en:"",vi:""} do bấm "+ Add" rồi bỏ dở KHÔNG tính là nội dung.
  function hasContent(ov) {
    if (!ov) return false;
    var ph = (ov.notionOverrides || {}).phrases || {};
    var real = 0;
    ['before', 'during', 'after'].forEach(function (k) {
      (ph[k] || []).forEach(function (p) {
        if (p && String(p.en || '').trim()) real++;
      });
    });
    return real > 0;
  }

  // force = true → ghi đè kể cả khi topic đã có nội dung
  NS.seedSamples = function (force) {
    var s = getState();
    if (!s || !s.topics) { return false; }
    var done = 0;

    Object.keys(SAMPLES).forEach(function (id) {
      var d = SAMPLES[id];
      var t = s.topics.filter(function (x) { return x.id === id; })[0];
      if (!t) return;                                  // topic đã bị xoá trước đó → bỏ qua

      var ov = rawOverlay(id) || {};
      if (!force && hasContent(ov)) return;             // ĐÃ có nội dung của bạn → không đụng vào

      ov.notionOverrides = ov.notionOverrides || {};
      ov.customBlocks = ov.customBlocks || [];
      ov.v15 = ov.v15 || { missions: [], recall: [], shadowBlocks: [], sections: { order: [], hidden: [] }, header: {} };

      if (d.video && (force || !ov.videoImmersionUrl)) ov.videoImmersionUrl = d.video;
      ov.notionOverrides.why = d.why;
      ov.notionOverrides.scene = d.scene;
      ov.notionOverrides.phrases = {
        before: toPhraseArr(d.before),
        during: toPhraseArr(d.during),
        after:  toPhraseArr(d.after)
      };
      ov.v15.missions = toMissionArr(d.missions);
      ov.v15.recall = toRecallArr(d.recall);
      ov.v15.shadowBlocks = [{ id: uid('sb'), text: d.shadow }];
      // Bài mẫu phải hiện đủ mọi mục — bỏ mọi thiết lập "ẩn section" trên 2 topic này
      ov.v15.sections = ov.v15.sections || { order: [], hidden: [] };
      ov.v15.sections.hidden = [];
      ov.v15.header = ov.v15.header || {};

      // Dialogues + Real English dưới dạng block ghi chú (đúng cách import_topic.js làm)
      ov.customBlocks = ov.customBlocks.filter(function (b) {
        return !(b && /dialogue|real\s*english/i.test(b.title || ''));
      });
      ov.customBlocks.push({ id: uid('b'), type: 'note', title: '🎭 Dialogues', text: d.dialogues });
      ov.customBlocks.push({ id: uid('b'), type: 'note', title: '🎤 Real English (native)', text: d.realEnglish });

      ov.v35Sample = true;
      writeOverlay(id, ov);

      // Grammar patterns nằm ở kho riêng
      try {
        var all = JSON.parse(localStorage.getItem(GP_KEY) || '{}') || {};
        if (force || !(all[id] && all[id].length)) {
          all[id] = d.patterns.map(function (p) {
            return { id: uid('p'), pattern: p.pattern, meaning: p.meaning, examples: p.examples.slice(0, 3), source: 'sample' };
          });
          localStorage.setItem(GP_KEY, JSON.stringify(all));
        }
      } catch (e) {}

      done++;
    });

    if (done) { try { localStorage.setItem(SEED_FLAG, NS.version); } catch (e) {} }
    log('seeded ' + done + ' bài mẫu');
    return done;
  };

  // ---------------------------------------------------------- khoá xoá
  function isProtected(id) { return PROTECTED.indexOf(id) !== -1; }
  NS.isProtected = isProtected;

  // ============================================================
  // MODAL DÙNG CHUNG — thay hẳn confirm()/prompt() mặc định của trình duyệt
  // ============================================================
  var modalEl = null;
  function closeModal() {
    if (modalEl) { modalEl.remove(); modalEl = null; }
    document.documentElement.style.overflow = '';
  }

  /**
   * opts = {
   *   icon, iconStyle:'danger'|'lock', title, subtitle,
   *   lose:[...], keep:[...],          // 2 bảng đối chiếu (tuỳ chọn)
   *   note,                            // dòng nhắc dưới cùng (tuỳ chọn)
   *   fieldLabel, placeholder, password:bool,
   *   mustEqual, wrongMsg,             // buộc gõ đúng chuỗi này mới cho tiếp
   *   confirmText, cancelText
   * }
   * → gọi onConfirm() khi người dùng xác nhận thành công.
   */
  function openConfirm(opts, onConfirm) {
    closeModal(); injectCSS();
    var needInput = !!opts.mustEqual;

    var panels = '';
    if ((opts.lose && opts.lose.length) || (opts.keep && opts.keep.length)) {
      panels = '<div class="v35-panels">' +
        (opts.lose && opts.lose.length
          ? '<div class="v35-panel lose"><span class="v35-plabel">SẼ XOÁ</span><ul>' +
            opts.lose.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
        (opts.keep && opts.keep.length
          ? '<div class="v35-panel keep"><span class="v35-plabel">GIỮ NGUYÊN</span><ul>' +
            opts.keep.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
        '</div>';
    }

    var field = '';
    if (needInput) {
      field = '<div class="v35-field">' +
        '<label class="v35-flabel">' + (opts.fieldLabel || '') + '</label>' +
        '<input type="' + (opts.password ? 'password' : 'text') + '" autocomplete="off" spellcheck="false"' +
        ' placeholder="' + esc(opts.placeholder || '') + '">' +
        '<div class="v35-err"></div></div>';
    }

    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.innerHTML =
      '<div class="v35-box">' +
        '<button class="v35-mx" aria-label="Đóng">×</button>' +
        '<div class="v35-mhead">' +
          '<div class="v35-micon ' + (opts.iconStyle || 'danger') + '">' + esc(opts.icon || '⚠️') + '</div>' +
          '<div><div class="v35-mtitle">' + esc(opts.title || '') + '</div>' +
          (opts.subtitle ? '<div class="v35-msub">' + esc(opts.subtitle) + '</div>' : '') + '</div>' +
        '</div>' +
        '<div class="v35-mbody">' + panels +
          (opts.note ? '<div class="v35-note">' + esc(opts.note) + '</div>' : '') +
          field +
        '</div>' +
        '<div class="v35-acts">' +
          '<button class="v35-mbtn ghost" data-a="cancel">' + esc(opts.cancelText || 'Huỷ') + '</button>' +
          '<button class="v35-mbtn go" data-a="ok"' + (needInput ? ' disabled' : '') + '>' +
          esc(opts.confirmText || 'Xác nhận') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';

    var okBtn = modalEl.querySelector('[data-a="ok"]');
    var input = modalEl.querySelector('input');
    var err = modalEl.querySelector('.v35-err');

    function value() { return input ? input.value : ''; }
    function matches() {
      if (!needInput) return true;
      return opts.password ? value() === opts.mustEqual
                           : value().trim().toUpperCase() === String(opts.mustEqual).toUpperCase();
    }
    function submit() {
      if (!matches()) {
        if (!input) return;
        input.classList.add('bad');
        err.textContent = '✕ ' + (opts.wrongMsg || 'Chưa đúng — kiểm tra lại.');
        setTimeout(function () { input.classList.remove('bad'); }, 320);
        input.select(); input.focus();
        return;
      }
      closeModal();
      onConfirm();
    }

    if (input) {
      input.oninput = function () {
        err.textContent = '';
        input.classList.remove('bad');
        // mật khẩu: luôn cho bấm (để hiện thông báo sai); gõ-xác-nhận: chỉ mở khi đúng
        okBtn.disabled = opts.password ? !value() : !matches();
      };
      input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } };
      setTimeout(function () { input.focus(); }, 60);
    }
    okBtn.onclick = submit;
    modalEl.querySelector('[data-a="cancel"]').onclick = closeModal;
    modalEl.querySelector('.v35-mx').onclick = closeModal;
    modalEl.onclick = function (e) { if (e.target === modalEl) closeModal(); };
  }
  NS.openConfirm = openConfirm;

  function askPassword(topicName, onOk) {
    openConfirm({
      icon: '🔒', iconStyle: 'lock',
      title: 'Bài mẫu được bảo vệ',
      subtitle: '“' + topicName + '” là bài mẫu của hệ thống — để người mới thấy một bài học đầy đủ trông như thế nào.',
      lose: ['Toàn bộ nội dung bài mẫu', 'Không thể hoàn tác'],
      keep: ['Các topic khác', 'Tiến trình học của bạn'],
      fieldLabel: 'Nhập mật khẩu quản trị để xoá:',
      placeholder: 'Mật khẩu',
      password: true,
      mustEqual: PASSWORD,
      wrongMsg: 'Mật khẩu không đúng.',
      confirmText: 'Xoá bài mẫu'
    }, onOk);
  }

  function wrapDelete() {
    var V17 = window.SHADOW_V17;
    if (!V17 || typeof V17.deleteTopic !== 'function') return false;
    if (V17._v35Wrapped) return true;

    var orig = V17.deleteTopic;

    // v17.deleteTopic gọi confirm() mặc định của trình duyệt bên trong.
    // Ta hỏi bằng modal riêng trước, rồi tạm thời cho confirm() trả về true
    // đúng một lần để chạy phần xoá — không phải sửa file v17.
    function runDelete(id, fromArchive) {
      var nativeConfirm = window.confirm;
      window.confirm = function () { return true; };
      try { orig.call(V17, id, fromArchive); }
      finally { window.confirm = nativeConfirm; }
    }

    V17.deleteTopic = function (id, fromArchive) {
      var s = getState();
      var t = s && s.topics ? s.topics.filter(function (x) { return x.id === id; })[0] : null;
      var name = t ? t.name : id;

      if (isProtected(id)) {
        askPassword(name, function () { runDelete(id, fromArchive); });
        return;
      }
      openConfirm({
        icon: '🗑', iconStyle: 'danger',
        title: 'Xoá topic này?',
        subtitle: '“' + name + '” sẽ bị xoá vĩnh viễn khỏi thiết bị này.',
        lose: ['Toàn bộ nội dung bài học', 'Cụm từ, missions, ghi chú', 'Tiến trình học của topic'],
        keep: ['Các topic khác', 'XP và streak của bạn'],
        note: 'Chỉ muốn ẩn tạm thì bấm 📦 Archive — vẫn khôi phục lại được.',
        confirmText: 'Xoá vĩnh viễn'
      }, function () { runDelete(id, fromArchive); });
    };
    V17._v35Wrapped = true;
    log('đã khoá xoá cho: ' + PROTECTED.join(', '));
    return true;
  }

  // huy hiệu 🔒 trên thẻ topic ở trang Topics Database
  function markProtectedCards() {
    var view = document.getElementById('view-topics');
    if (!view || !view.classList.contains('active')) return;
    injectCSS();
    PROTECTED.forEach(function (id) {
      var card = view.querySelector('.topic-card-real[data-topic="' + id + '"]');
      if (!card || card.querySelector('.v35-lock')) return;
      var h = card.querySelector('.topic-card-name, h3, .card-title, .topic-name');
      if (!h) return;
      var b = document.createElement('span');
      b.className = 'v35-lock';
      b.textContent = '🔒 Bài mẫu';
      b.title = 'Bài mẫu — cần mật khẩu mới xoá được';
      h.appendChild(b);
    });
  }

  // ============================================================
  // C. RESET
  // ============================================================
  function blankTopic(t) {
    t.reviewStage = 'Day 0';
    t.memoryStatus = 'Fragile';
    t.lastReview = null;
    t.nextReview = null;
    t.masteryPct = 0;
    t.confidence = 0;
    t.sessions = 0;
    if (t.confidenceHistory) t.confidenceHistory = [];
    if (t.history) t.history = [];
    return t;
  }

  NS.resetTopic = function (id) {
    var s = getState(); if (!s || !s.topics) return false;
    var t = s.topics.filter(function (x) { return x.id === id; })[0];
    if (!t) { toast('Không tìm thấy topic.'); return false; }

    openConfirm({
      icon: '🔄', iconStyle: 'danger',
      title: 'Reset ngày bắt đầu',
      subtitle: 'Đưa “' + t.name + '” về Day 0 để học lại từ đầu.',
      lose: ['Tiến trình về Day 0', 'Mastery về 0%', 'Số buổi học về 0', 'Lịch sử ôn của topic này'],
      keep: ['Toàn bộ nội dung bài học', 'Cụm từ, missions, ghi chú', 'XP và streak của bạn', 'Các topic khác'],
      note: 'Chỉ ảnh hưởng riêng topic này. Không hoàn tác được.',
      confirmText: 'Reset về Day 0'
    }, function () { doResetTopic(s, t, id); });
    return true;
  };

  function doResetTopic(s, t, id) {
    blankTopic(t);
    saveState(s);
    try { s.sessionsLog = (s.sessionsLog || []).filter(function (r) { return r && r.topicId !== id; }); saveState(s); } catch (e) {}
    toast('🔄 Đã reset "' + t.name + '" về Day 0');
    refreshAll();
    try { renderRealQueue(); renderRealInsight(); } catch (e) {}
    return true;
  }

  NS.resetAll = function () {
    var s = getState(); if (!s) return false;
    var n = (s.topics || []).length;

    openConfirm({
      icon: '⚠️', iconStyle: 'danger',
      title: 'Reset toàn hệ thống',
      subtitle: 'Đưa cả ' + n + ' topic về Day 0 — dùng khi bắt đầu lại từ đầu, hoặc giao máy cho một người học mới.',
      lose: ['Tiến trình của cả ' + n + ' topic → Day 0', 'XP về 0 · Level về 1', 'Streak về 0', 'Toàn bộ lịch sử buổi học'],
      keep: ['Toàn bộ nội dung bài học', '2 bài mẫu Level 1', 'Các topic bạn tự tạo', 'Ghi chú và cấu trúc ngữ pháp'],
      note: 'Không hoàn tác được. Nên bấm ⬇ Export Backup trước khi làm việc này.',
      fieldLabel: 'Gõ <b>RESET</b> để xác nhận bạn hiểu điều gì sẽ xảy ra:',
      placeholder: 'RESET',
      mustEqual: 'RESET',
      wrongMsg: 'Phải gõ đúng chữ RESET.',
      confirmText: 'Reset toàn hệ thống'
    }, function () { doResetAll(s); });
    return true;
  };

  function doResetAll(s) {
    (s.topics || []).forEach(blankTopic);
    s.user = s.user || {};
    s.user.xp = 0;
    s.user.level = 1;
    s.user.xpToNext = 100;
    s.user.streak = 0;
    s.user.lastStudyDate = null;
    s.user.createdAt = new Date().toISOString();
    s.sessionsLog = [];
    s.currentSession = null;
    saveState(s);

    ['shadow-en-best-streak', 'shadow-en-dist-history', 'shadow-en-celebrated-first-auto']
      .forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });

    toast('🔄 Đã reset toàn hệ thống — bắt đầu lại từ Day 0');
    refreshAll();
    try { _queueFilter = 'All'; renderRealQueue(); renderRealInsight(); } catch (e) {}
    return true;
  }

  // ---------------------------------------------------------- gắn nút reset
  function attachResetButtons() {
    // (1) trang chi tiết topic — nút reset riêng cho topic đang mở
    var view = detailView();
    if (view) {
      var acts = view.querySelector('.topic-hero-actions');
      if (acts && !acts.querySelector('[data-v35="reset-topic"]')) {
        var startBtn = view.querySelector('[data-action="start-session"][data-topic]');
        var id = startBtn ? startBtn.getAttribute('data-topic') : null;
        if (id) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'v35-btn v35-hero-reset';
          b.setAttribute('data-v35', 'reset-topic');
          b.innerHTML = '🔄 Reset ngày bắt đầu';
          b.title = 'Đưa topic này về Day 0 — nội dung bài học giữ nguyên';
          b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.resetTopic(id); };
          acts.appendChild(b);
        }
      }
    }

    // (2) trang Topics Database — nút reset toàn hệ thống
    var tv = document.getElementById('view-topics');
    if (tv && tv.classList.contains('active')) {
      var bar = tv.querySelector('.v17-toolbar');
      if (bar && !bar.querySelector('[data-v35="reset-all"]')) {
        var rb = document.createElement('button');
        rb.type = 'button';
        rb.className = 'v35-btn warn';
        rb.setAttribute('data-v35', 'reset-all');
        rb.innerHTML = '🔄 Reset tiến trình';
        rb.title = 'Đưa toàn bộ tiến trình học về Day 0 — dành cho người mới bắt đầu';
        rb.onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.resetAll(); };
        bar.appendChild(rb);
      }
    }
  }

  // ============================================================
  // D. GIỌNG ĐỌC — ưu tiên giọng NAM, trầm ấm, chuẩn Mỹ
  // ------------------------------------------------------------
  // audio.js đang ưu tiên 'Samantha' và 'Google US English' — cả hai đều là
  // giọng NỮ. Ở đây ta chọn lại theo thứ tự ưu tiên giọng nam en-US, hạ pitch
  // xuống một chút cho trầm, và cho phép tự đổi qua bảng chọn giọng.
  // ============================================================
  var VOICE_KEY = 'shadow-en-voice-name';
  var PITCH_KEY = 'shadow-en-voice-pitch';
  var DEFAULT_PITCH = 0.88;   // < 1 = trầm hơn

  // Xếp theo độ tự nhiên giảm dần. Nhóm "Natural/Online" là giọng neural — hay nhất.
  var MALE_PREFS = [
    /\bGuy\b.*(Natural|Online)/i, /\bAndrew\b.*(Natural|Online)/i,
    /\bBrian\b.*(Natural|Online)/i, /\bChristopher\b.*(Natural|Online)/i,
    /\bEric\b.*(Natural|Online)/i, /\bRoger\b.*(Natural|Online)/i,
    /\bSteffan\b.*(Natural|Online)/i, /\bDavis\b.*(Natural|Online)/i,
    /\bTony\b.*(Natural|Online)/i, /\bJason\b.*(Natural|Online)/i,
    /Microsoft David/i, /Microsoft Mark/i,
    /Google US English Male/i,
    /\bAlex\b/i, /\bAaron\b/i, /\bFred\b/i, /\bTom\b/i, /\bNathan\b/i,
    /\bmale\b/i
  ];
  var FEMALE_HINT = /(Samantha|Zira|Aria|Jenny|Michelle|Ana|Susan|Karen|Moira|Tessa|Victoria|Allison|Ava|Serena|Female)/i;

  function allEnVoices() {
    try { return (speechSynthesis.getVoices() || []).filter(function (v) { return /^en/i.test(v.lang); }); }
    catch (e) { return []; }
  }
  function getPitch() {
    var p = parseFloat(localStorage.getItem(PITCH_KEY));
    return (isFinite(p) && p >= 0.5 && p <= 1.5) ? p : DEFAULT_PITCH;
  }
  function pickVoice() {
    var all = allEnVoices();
    if (!all.length) return null;

    var saved = null;
    try { saved = localStorage.getItem(VOICE_KEY); } catch (e) {}
    if (saved) {
      var chosen = all.filter(function (v) { return v.name === saved; })[0];
      if (chosen) return chosen;
    }
    var us = all.filter(function (v) { return /^en[-_]US/i.test(v.lang); });
    var pool = us.length ? us : all;

    for (var i = 0; i < MALE_PREFS.length; i++) {
      var m = pool.filter(function (v) { return MALE_PREFS[i].test(v.name); })[0];
      if (m) return m;
    }
    // không tìm được giọng nam → ít nhất tránh giọng nữ đã biết
    return pool.filter(function (v) { return !FEMALE_HINT.test(v.name); })[0] || pool[0];
  }
  NS.pickVoice = pickVoice;

  function applyVoice() {
    var A = window.SHADOW_AUDIO;
    if (!A || typeof A.speak !== 'function') return false;
    if (A._v35Voice) { var cur = pickVoice(); if (cur) A.voice = cur; return true; }

    var origSpeak = A.speak;
    A.speak = function (text, opts) {
      opts = opts || {};
      var v = pickVoice();
      if (v) { this.voice = v; if (opts.lang == null) opts.lang = v.lang; }
      if (opts.pitch == null) opts.pitch = getPitch();
      return origSpeak.call(this, text, opts);
    };
    A._v35Voice = true;

    var v0 = pickVoice();
    if (v0) { A.voice = v0; log('giọng đọc: ' + v0.name + ' (' + v0.lang + ') · pitch ' + getPitch()); }
    else { try { speechSynthesis.onvoiceschanged = function () { var x = pickVoice(); if (x) A.voice = x; }; } catch (e) {} }
    return true;
  }

  // ---------------------------------------------------------- bảng chọn giọng
  function openVoicePicker() {
    closeModal(); injectCSS();
    var all = allEnVoices();
    var current = pickVoice();
    var savedName = current ? current.name : '';
    var pitch = getPitch();

    if (!all.length) {
      openConfirm({
        icon: '🎙', iconStyle: 'lock',
        title: 'Chưa tải được giọng đọc',
        subtitle: 'Trình duyệt chưa nạp xong danh sách giọng. Thử tải lại trang rồi bấm lại nút này.',
        confirmText: 'Đã hiểu', cancelText: 'Đóng'
      }, function () {});
      return;
    }

    // giọng nam en-US lên đầu
    function score(v) {
      var s = 0;
      if (/^en[-_]US/i.test(v.lang)) s -= 100;
      for (var i = 0; i < MALE_PREFS.length; i++) if (MALE_PREFS[i].test(v.name)) { s -= (50 - i); break; }
      if (FEMALE_HINT.test(v.name)) s += 40;
      return s;
    }
    var sorted = all.slice().sort(function (a, b) { return score(a) - score(b); });

    function tag(v) {
      if (FEMALE_HINT.test(v.name)) return '<span class="v35-vtag f">Nữ</span>';
      for (var i = 0; i < MALE_PREFS.length; i++) if (MALE_PREFS[i].test(v.name)) return '<span class="v35-vtag m">Nam</span>';
      return '';
    }

    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.innerHTML =
      '<div class="v35-box">' +
        '<button class="v35-mx" aria-label="Đóng">×</button>' +
        '<div class="v35-mhead">' +
          '<div class="v35-micon lock">🎙</div>' +
          '<div><div class="v35-mtitle">Giọng đọc</div>' +
          '<div class="v35-msub">Chọn giọng và độ trầm cho nút ▶ trong bài học. Bấm ▶ để nghe thử trước khi lưu.</div></div>' +
        '</div>' +
        '<div class="v35-mbody">' +
          '<div class="v35-vlist">' +
            sorted.map(function (v) {
              return '<label class="v35-vrow' + (v.name === savedName ? ' on' : '') + '">' +
                '<input type="radio" name="v35voice" value="' + esc(v.name) + '"' + (v.name === savedName ? ' checked' : '') + '>' +
                '<span class="v35-vname">' + esc(v.name) + tag(v) + '</span>' +
                '<span class="v35-vlang">' + esc(v.lang) + '</span>' +
                '<button type="button" class="v35-vplay" data-test="' + esc(v.name) + '" title="Nghe thử">▶</button>' +
              '</label>';
            }).join('') +
          '</div>' +
          '<div class="v35-field">' +
            '<label class="v35-flabel">Độ trầm — <b id="v35-pv">' + pitch.toFixed(2) + '</b></label>' +
            '<input type="range" id="v35-pitch" min="0.6" max="1.2" step="0.02" value="' + pitch + '">' +
            '<div class="v35-range-ends"><span>Trầm hơn</span><span>Cao hơn</span></div>' +
          '</div>' +
          '<div class="v35-note">Máy nào có giọng nào là do hệ điều hành. Giọng có chữ <b>Natural</b> hoặc <b>Online</b> nghe thật nhất — nếu máy bạn có thì nên chọn.</div>' +
        '</div>' +
        '<div class="v35-acts">' +
          '<button class="v35-mbtn ghost" data-a="cancel">Huỷ</button>' +
          '<button class="v35-mbtn save" data-a="ok">Lưu giọng đọc</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';

    var pitchEl = modalEl.querySelector('#v35-pitch');
    var pvEl = modalEl.querySelector('#v35-pv');
    pitchEl.oninput = function () { pvEl.textContent = parseFloat(pitchEl.value).toFixed(2); };

    function selectedName() {
      var r = modalEl.querySelector('input[name="v35voice"]:checked');
      return r ? r.value : savedName;
    }
    function preview(name) {
      try {
        speechSynthesis.cancel();
        var v = all.filter(function (x) { return x.name === name; })[0];
        var u = new SpeechSynthesisUtterance('Excuse me, could you help me? I am looking for the train station.');
        if (v) { u.voice = v; u.lang = v.lang; }
        u.pitch = parseFloat(pitchEl.value) || DEFAULT_PITCH;
        u.rate = 0.95;
        speechSynthesis.speak(u);
      } catch (e) {}
    }

    modalEl.addEventListener('click', function (e) {
      var t = e.target.getAttribute && e.target.getAttribute('data-test');
      if (t) {
        e.preventDefault(); e.stopPropagation();
        var radio = modalEl.querySelector('input[value="' + t.replace(/"/g, '\\"') + '"]');
        if (radio) radio.checked = true;
        modalEl.querySelectorAll('.v35-vrow').forEach(function (r) { r.classList.remove('on'); });
        if (radio) radio.closest('.v35-vrow').classList.add('on');
        preview(t);
      }
    });
    modalEl.addEventListener('change', function () {
      modalEl.querySelectorAll('.v35-vrow').forEach(function (r) {
        r.classList.toggle('on', !!r.querySelector('input:checked'));
      });
    });

    modalEl.querySelector('[data-a="ok"]').onclick = function () {
      try {
        localStorage.setItem(VOICE_KEY, selectedName());
        localStorage.setItem(PITCH_KEY, String(parseFloat(pitchEl.value)));
      } catch (e) {}
      try { speechSynthesis.cancel(); } catch (e) {}
      applyVoice();
      closeModal();
      toast('🎙 Đã đổi giọng đọc: ' + selectedName());
    };
    modalEl.querySelector('[data-a="cancel"]').onclick = function () { try { speechSynthesis.cancel(); } catch (e) {} closeModal(); };
    modalEl.querySelector('.v35-mx').onclick = function () { try { speechSynthesis.cancel(); } catch (e) {} closeModal(); };
    modalEl.onclick = function (e) { if (e.target === modalEl) { try { speechSynthesis.cancel(); } catch (e2) {} closeModal(); } };
  }
  NS.openVoicePicker = openVoicePicker;

  function attachVoiceButton() {
    var bar = document.getElementById('ssa-toolbar');
    if (bar && !bar.querySelector('[data-v35="voice"]')) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'v35-btn v35-voice-btn';
      b.setAttribute('data-v35', 'voice');
      b.innerHTML = '🎙 Giọng đọc';
      b.title = 'Đổi giọng đọc cho nút ▶ (mặc định: giọng nam Mỹ, trầm)';
      b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openVoicePicker(); };
      bar.appendChild(b);
    }
    var tv = document.getElementById('view-topics');
    if (tv && tv.classList.contains('active')) {
      var tb = tv.querySelector('.v17-toolbar');
      if (tb && !tb.querySelector('[data-v35="voice2"]')) {
        var b2 = document.createElement('button');
        b2.type = 'button';
        b2.className = 'v35-btn';
        b2.setAttribute('data-v35', 'voice2');
        b2.innerHTML = '🎙 Giọng đọc';
        b2.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openVoicePicker(); };
        tb.appendChild(b2);
      }
    }
  }

  // ============================================================
  // F. DỮ LIỆU THẬT cho REVIEW ENGINE — TODAY QUEUE + dòng Insight
  // ------------------------------------------------------------
  // Hai khối này trong index.html là HTML GÕ TAY, không có code render:
  //   • Bảng queue: "Hotel Check-in / Small Talk / Taxi / Directions…"
  //     — tên không khớp topic thật, số % và "3 days ago" đều là bịa.
  //   • Dòng "Insight: … Automatic (Day 60) là 35% — vượt mục tiêu tháng".
  // Vì không đọc state nên bấm Reset xong chúng vẫn đứng yên.
  // Ở đây render lại cả hai từ state.topics thật.
  // ============================================================
  var STAGE_CLASS = { 'Day 0': 'day-0', 'Day 1': 'day-1', 'Day 3': 'day-3', 'Day 7': 'day-7', 'Day 21': 'day-21', 'Day 60': 'day-60' };
  var _queueFilter = 'All';

  function startOfToday() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

  function dueTopics(s) {
    var now = Date.now();
    var due = (s.topics || []).filter(function (t) {
      return t.nextReview && new Date(t.nextReview).getTime() <= now && t.reviewStage !== 'Day 60';
    });
    try {
      if (window.SHADOW_ADAPTIVE && typeof SHADOW_ADAPTIVE.prioritizeReviewQueue === 'function') {
        var ordered = SHADOW_ADAPTIVE.prioritizeReviewQueue(s.topics);
        if (ordered && ordered.length === due.length) return ordered;
      }
    } catch (e) {}
    return due.sort(function (a, b) { return new Date(a.nextReview) - new Date(b.nextReview); });
  }

  function relDay(iso) {
    if (!iso) return 'Chưa học';
    var d = Math.floor((startOfToday() - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
    if (d <= 0) return 'Hôm nay';
    if (d === 1) return 'Hôm qua';
    if (d < 30) return d + ' ngày trước';
    if (d < 365) return Math.round(d / 30) + ' tháng trước';
    return Math.round(d / 365) + ' năm trước';
  }

  function riskMark(t) {
    var r = 0.5;
    try { if (window.SHADOW_ADAPTIVE) r = SHADOW_ADAPTIVE.calculateForgetRisk(t); } catch (e) {}
    var overdue = t.nextReview && new Date(t.nextReview).getTime() < startOfToday();
    if (overdue || r >= 0.7) return '<span class="priority high">🔥</span>';
    if (r >= 0.45) return '<span class="priority high">↑</span>';
    return '<span class="priority med">•</span>';
  }

  function renderRealQueue() {
    var card = document.querySelector('[data-section-id="review-queue"]');
    if (!card) return;
    var tbody = card.querySelector('.queue-table tbody');
    var tabsEl = card.querySelector('.queue-tabs');
    if (!tbody) return;

    var s = getState(); if (!s || !s.topics) return;
    var due = dueTopics(s);

    var counts = { 'All': due.length, 'Overdue': 0 };
    ['Day 1', 'Day 3', 'Day 7', 'Day 21'].forEach(function (k) { counts[k] = 0; });
    due.forEach(function (t) {
      if (counts[t.reviewStage] != null) counts[t.reviewStage]++;
      if (t.nextReview && new Date(t.nextReview).getTime() < startOfToday()) counts.Overdue++;
    });

    if (tabsEl) {
      var order = ['All', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Overdue'];
      var tabsHtml = order.map(function (k) {
        return '<span class="queue-tab' + (k === _queueFilter ? ' active' : '') + '" data-v35q="' + k + '">' +
          esc(k) + ' (' + counts[k] + ')</span>';
      }).join('');
      if (tabsEl.getAttribute('data-v35sig') !== tabsHtml) {
        tabsEl.innerHTML = tabsHtml;
        tabsEl.setAttribute('data-v35sig', tabsHtml);
        tabsEl.querySelectorAll('[data-v35q]').forEach(function (b) {
          b.onclick = function () { _queueFilter = b.getAttribute('data-v35q'); renderRealQueue(); };
        });
      }
    }

    var rows = due;
    if (_queueFilter === 'Overdue') {
      rows = due.filter(function (t) { return t.nextReview && new Date(t.nextReview).getTime() < startOfToday(); });
    } else if (_queueFilter !== 'All') {
      rows = due.filter(function (t) { return t.reviewStage === _queueFilter; });
    }

    var html;
    if (!rows.length) {
      html = '<tr><td colspan="5" style="padding:22px 4px;text-align:center;color:var(--text-3);font-size:12px">' +
        (due.length
          ? 'Không có topic nào ở mục “' + esc(_queueFilter) + '”.'
          : '✅ Hôm nay không có topic nào tới hạn ôn — học một chủ đề mới đi.') +
        '</td></tr>';
    } else {
      html = rows.slice(0, 12).map(function (t) {
        var m = Math.round(t.masteryPct || 0);
        return '<tr data-v35topic="' + esc(t.id) + '" style="cursor:pointer">' +
          '<td>' + riskMark(t) + '</td>' +
          '<td>' + esc((t.emoji ? t.emoji + ' ' : '') + (t.name || t.id)) + '</td>' +
          '<td><span class="day-tag ' + (STAGE_CLASS[t.reviewStage] || 'day-0') + '">' + esc(t.reviewStage || 'Day 0') + '</span></td>' +
          '<td><span class="mem-bar"><span class="mem-bar-fill" style="width:' + m + '%"></span></span> ' + m + '%</td>' +
          '<td style="color:var(--text-2)">' + esc(relDay(t.lastReview)) + '</td>' +
          '</tr>';
      }).join('');
      if (rows.length > 12) {
        html += '<tr><td colspan="5" style="padding:8px 4px;text-align:center;color:var(--text-3);font-size:11px">' +
          '… và ' + (rows.length - 12) + ' topic nữa</td></tr>';
      }
    }

    if (tbody.getAttribute('data-v35sig') !== html) {
      tbody.innerHTML = html;
      tbody.setAttribute('data-v35sig', html);
      tbody.querySelectorAll('[data-v35topic]').forEach(function (tr) {
        tr.onclick = function () {
          var id = tr.getAttribute('data-v35topic');
          try { if (typeof window.openTopic === 'function') return window.openTopic(id); } catch (e) {}
          var c2 = document.querySelector('.topic-card-real[data-topic="' + id + '"]');
          if (c2) c2.click();
        };
      });
    }
  }
  NS.renderRealQueue = renderRealQueue;

  function renderRealInsight() {
    var el = null, spans = document.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) {
      if (/Automatic \(Day 60\)|^\s*Insight:/.test(spans[i].textContent || '') && spans[i].children.length) { el = spans[i]; break; }
    }
    if (!el) return;

    var s = getState(); if (!s || !s.topics) return;
    var topics = s.topics, total = topics.length || 1;
    var auto = topics.filter(function (t) { return t.reviewStage === 'Day 60'; }).length;
    var stable = topics.filter(function (t) { return t.reviewStage === 'Day 7' || t.reviewStage === 'Day 21'; }).length;
    var fresh = topics.filter(function (t) { return t.reviewStage === 'Day 0'; }).length;
    var due = dueTopics(s).length;
    var pct = Math.round(auto / total * 100);

    var msg;
    if (due > 0) {
      msg = 'Hôm nay có <b style="color:#fde047">' + due + '</b> chủ đề tới hạn ôn. ' +
            'Ôn xong rồi hãy học chủ đề mới — bỏ ôn thì cả cũ lẫn mới cùng rơi.';
    } else if (fresh === total) {
      msg = 'Bạn đang bắt đầu lại từ đầu với <b style="color:#a78bfa">' + total + '</b> chủ đề. ' +
            'Chọn <b style="color:#a78bfa">một</b> chủ đề bạn sẽ dùng trong 7 ngày tới rồi bắt đầu từ đó.';
    } else if (auto === 0) {
      msg = '<b style="color:#a78bfa">' + stable + '/' + total + '</b> chủ đề đã vào vùng ổn định, ' +
            'chưa có chủ đề nào lên Automatic. Cứ ôn đúng hạn là tới.';
    } else {
      msg = 'Tỉ lệ chủ đề đạt Automatic (Day 60) là <b style="color:#a78bfa">' + pct + '%</b> ' +
            '(' + auto + '/' + total + '). Hôm nay không có chủ đề nào tới hạn.';
    }

    var html = '<span style="color:var(--text);font-weight:600">Insight:</span> ' + msg;
    if (el.getAttribute('data-v35sig') !== html) {
      el.innerHTML = html;
      el.setAttribute('data-v35sig', html);
    }
  }
  NS.renderRealInsight = renderRealInsight;

  // ---------------------------------------------------------- PROGRESS TRACKER
  // 4 ô "New This Week 5 / Reviews Done 28 / Study Time 6h 24m / Accuracy 78%"
  // là số gõ tay trong index.html — không id, không code render.
  function renderRealProgress() {
    var card = document.querySelector('[data-section-id="progress-tracker"]');
    if (!card) return;
    var vals = card.querySelectorAll('.mini-stat .val');
    var lbls = card.querySelectorAll('.mini-stat .lbl');
    if (vals.length < 4) return;

    var s = getState(); if (!s) return;
    var log = s.sessionsLog || [];
    var weekAgo = Date.now() - 7 * 86400000;
    var week = log.filter(function (r) { return r && r.at && new Date(r.at).getTime() > weekAgo; });

    var firstSeen = {};
    log.forEach(function (r) {
      if (!r || !r.at || !r.topicId) return;
      var t = new Date(r.at).getTime();
      if (firstSeen[r.topicId] == null || t < firstSeen[r.topicId]) firstSeen[r.topicId] = t;
    });
    var newThisWeek = Object.keys(firstSeen).filter(function (id) { return firstSeen[id] > weekAgo; }).length;

    var reviews = week.filter(function (r) { return r.type === 'review'; }).length;
    var sessions = week.filter(function (r) { return r.type === 'session'; }).length;

    // App không bấm giờ thật → ước lượng: 1 buổi đầy đủ ~20', 1 lần ôn ~5'.
    var mins = sessions * 20 + reviews * 5;
    var timeTxt = mins >= 60 ? (Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm') : (mins + 'm');

    var confs = week.filter(function (r) { return typeof r.confidence === 'number' && r.confidence > 0; });
    var acc = confs.length
      ? Math.round(confs.reduce(function (a, r) { return a + r.confidence; }, 0) / confs.length / 5 * 100) + '%'
      : '—';

    var out = [String(newThisWeek), String(reviews), (mins ? '~' + timeTxt : '—'), acc];
    for (var i = 0; i < 4; i++) if (vals[i].textContent !== out[i]) vals[i].textContent = out[i];

    if (lbls.length >= 3 && !lbls[2].getAttribute('data-v35lbl')) {
      lbls[2].setAttribute('data-v35lbl', '1');
      lbls[2].setAttribute('title', 'Ước lượng: 1 buổi học đầy đủ ≈ 20 phút, 1 lần ôn nhanh ≈ 5 phút. App chưa bấm giờ thật.');
      lbls[2].textContent = 'Study Time (ước lượng)';
    }
    if (lbls.length >= 4 && !lbls[3].getAttribute('data-v35lbl')) {
      lbls[3].setAttribute('data-v35lbl', '1');
      lbls[3].setAttribute('title', 'Trung bình điểm confidence (1–5) bạn tự chấm sau mỗi lần ôn, tính trong 7 ngày qua.');
    }
  }
  NS.renderRealProgress = renderRealProgress;

  // ---------------------------------------------------------- NEXT UP
  // Cả thẻ này là tên topic gõ tay ("Ordering Food", "Shopping") trong index.html.
  function renderRealNextUp() {
    var card = document.querySelector('[data-section-id="next-up"]');
    if (!card) return;
    var s = getState(); if (!s || !s.topics) return;

    var tmStart = startOfToday() + 86400000, tmEnd = tmStart + 86400000;
    var nextNew = (s.topics || []).filter(function (t) { return t.reviewStage === 'Day 0'; })[0];
    var tmReviews = (s.topics || []).filter(function (t) {
      if (!t.nextReview || t.reviewStage === 'Day 60') return false;
      var ms = new Date(t.nextReview).getTime();
      return ms >= tmStart && ms < tmEnd;
    }).slice(0, 4);

    var html =
      '<div class="next-section"><div class="next-label">🆕 CHỦ ĐỀ MỚI</div>' +
      (nextNew
        ? '<div class="next-title" data-v35next="' + esc(nextNew.id) + '" style="cursor:pointer">' +
          esc((nextNew.emoji || '') + ' ' + nextNew.name) +
          '<span class="day-tag day-0" style="margin-left:auto">Day 0</span></div>'
        : '<div style="font-size:11.5px;color:var(--text-3);margin-top:4px">Đã bắt đầu hết các chủ đề — giờ tập trung ôn.</div>') +
      '</div>' +
      '<div class="next-section"><div class="next-label">🔁 ÔN NGÀY MAI</div>' +
      (tmReviews.length
        ? tmReviews.map(function (t) {
            return '<div style="font-size:11.5px;margin-top:4px;cursor:pointer" data-v35next="' + esc(t.id) + '">• ' +
              esc(t.name) + ' <span class="day-tag ' + (STAGE_CLASS[t.reviewStage] || 'day-0') + '">' +
              esc(t.reviewStage) + '</span></div>';
          }).join('')
        : '<div style="font-size:11.5px;color:var(--text-3);margin-top:4px">Ngày mai chưa có chủ đề nào tới hạn.</div>') +
      '</div>' +
      '<div style="font-size:11px;color:var(--purple);margin-top:10px;cursor:pointer" data-nav="review">Xem lịch đầy đủ →</div>';

    var body = card.querySelector('[data-v35body]');
    if (!body) {
      var title = card.querySelector('.card-title');
      Array.prototype.slice.call(card.children).forEach(function (c) { if (c !== title) c.remove(); });
      body = document.createElement('div');
      body.setAttribute('data-v35body', '1');
      card.appendChild(body);
    }
    if (body.getAttribute('data-v35sig') !== html) {
      body.innerHTML = html;
      body.setAttribute('data-v35sig', html);
      body.querySelectorAll('[data-v35next]').forEach(function (el) {
        el.onclick = function () {
          var id = el.getAttribute('data-v35next');
          try { if (typeof window.openTopic === 'function') return window.openTopic(id); } catch (e) {}
          var c2 = document.querySelector('.topic-card-real[data-topic="' + id + '"]');
          if (c2) c2.click();
        };
      });
    }
  }
  NS.renderRealNextUp = renderRealNextUp;

  // ---------------------------------------------------------- NEXT SMALL WIN
  // Dòng phụ "3 topics đang gần chuyển…" là số gõ tay, trong khi danh sách bên
  // dưới lại tính thật → hai chỗ trên cùng một thẻ nói khác nhau.
  function renderRealCloseSub() {
    var card = document.querySelector('[data-section-id="close-to-levelup"]');
    if (!card) return;
    var sub = null, kids = card.children;
    for (var i = 0; i < kids.length; i++) {
      if (/đang gần|level-up/i.test(kids[i].textContent || '') && !kids[i].id) { sub = kids[i]; break; }
    }
    if (!sub) return;

    var s = getState(); if (!s || !s.topics) return;
    var n = (s.topics || []).filter(function (t) {
      return (t.masteryPct || 0) >= 60 && t.reviewStage !== 'Day 0' && t.reviewStage !== 'Day 60';
    }).length;

    var txt = n
      ? n + ' chủ đề đang gần chuyển sang trạng thái cao hơn — chỉ cần 1 buổi ôn đúng cách.'
      : 'Chưa có chủ đề nào gần level-up. Cứ ôn đúng hạn, mastery sẽ lên.';
    if (sub.textContent !== txt) sub.textContent = txt;
  }
  NS.renderRealCloseSub = renderRealCloseSub;

  // ---------------------------------------------------------- CALENDAR + MEMORY ACTIVITY
  // Hai thẻ này có logic ĐÚNG nhưng KHÔNG ai gọi lại khi state đổi:
  //   • renderRealCalendar() (app.js) chỉ chạy 1 lần lúc DOMContentLoaded và
  //     khi mở trang Calendar View — không chạy khi đang ở Dashboard.
  //   • SHADOW_V13.renderMemoryActivity() chỉ chạy khi điều hướng.
  // Kết quả: bấm Reset xong, lịch và heatmap vẫn giữ số cũ.
  // Gọi lại chúng, nhưng CHỈ khi dữ liệu thật sự đổi — tránh vòng lặp
  // render → MutationObserver → render.
  var _lastSig = null;
  function stateSignature(s) {
    if (!s) return '';
    var t = (s.topics || []).map(function (x) {
      return x.id + ':' + x.reviewStage + ':' + Math.round(x.masteryPct || 0) + ':' + (x.nextReview || '') + ':' + (x.sessions || 0);
    }).join('|');
    var u = s.user || {};
    return t + '#' + (s.sessionsLog || []).length + '#' + u.xp + '#' + u.level + '#' + u.streak;
  }
  function refreshStaleCards(force) {
    var s = getState(); if (!s) return;
    var sig = stateSignature(s);
    if (!force && sig === _lastSig) return;
    _lastSig = sig;
    try { if (typeof window.renderRealCalendar === 'function') window.renderRealCalendar(); } catch (e) {}
    try { if (typeof window.renderRealHeatmap === 'function') window.renderRealHeatmap(); } catch (e) {}
    // renderAll() vẽ lại HERO STATS + TODAY GOAL + MEMORY STATUS + MEMORY ACTIVITY
    try {
      if (window.SHADOW_V13 && typeof SHADOW_V13.renderAll === 'function') SHADOW_V13.renderAll();
      else if (window.SHADOW_V13 && typeof SHADOW_V13.renderMemoryActivity === 'function') SHADOW_V13.renderMemoryActivity();
    } catch (e) {}
  }
  NS.refreshStaleCards = refreshStaleCards;

  // ============================================================
  // BOOT — chạy lại mỗi khi DOM đổi (không phụ thuộc thứ tự load)
  // ============================================================
  function tick() {
    try { injectCSS(); } catch (e) {}
    try { attachHelp(); } catch (e) {}
    try { fixWhyScene(); } catch (e) {}
    try { attachResetButtons(); } catch (e) {}
    try { markProtectedCards(); } catch (e) {}
    try { wrapDelete(); } catch (e) {}
    try { applyVoice(); } catch (e) {}
    try { attachVoiceButton(); } catch (e) {}
    try { renderRealQueue(); } catch (e) {}
    try { renderRealInsight(); } catch (e) {}
    try { renderRealProgress(); } catch (e) {}
    try { renderRealNextUp(); } catch (e) {}
    try { renderRealCloseSub(); } catch (e) {}
    try { refreshStaleCards(false); } catch (e) {}
  }

  var _t = null;
  function schedule() { clearTimeout(_t); _t = setTimeout(tick, 60); }

  function boot() {
    injectCSS();
    // seed bài mẫu 1 lần (không ghi đè nếu topic đã có nội dung của bạn)
    try { if (localStorage.getItem(SEED_FLAG) !== NS.version) NS.seedSamples(false); } catch (e) { NS.seedSamples(false); }

    tick();
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: true });
      NS._mo = mo;
    } catch (e) {}
    [300, 900, 2000].forEach(function (ms) { setTimeout(tick, ms); });
    log('sẵn sàng v' + NS.version + ' — guide + 2 bài mẫu + reset');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // ---------------------------------------------------------- self-test
  NS.selfTest = function () {
    var pass = 0, fail = 0;
    function check(name, cond) { if (cond) { pass++; console.log('  ✅ ' + name); } else { fail++; console.warn('  ❌ ' + name); } }
    console.log('[v35] SELF TEST');
    check('có dữ liệu hướng dẫn cho 15 mục', GUIDE.length === 15);
    check('nhận diện CORE PHRASES', !!guideFor('💬 CORE PHRASES'));
    check('nhận diện WHY THIS TOPIC', !!guideFor('🤔 WHY THIS TOPIC?'));
    check('nhận diện GRAMMAR PATTERNS', !!guideFor('📐 GRAMMAR PATTERNS — CẤU TRÚC NGỮ PHÁP'));
    check('không nhận diện nhầm tiêu đề lạ', !guideFor('TOPICS DATABASE · 35 TOTAL'));
    check('L1-01 và L1-02 được bảo vệ', isProtected('L1-01') && isProtected('L1-02'));
    check('topic khác KHÔNG bị khoá', !isProtected('L1-03'));
    check('có đủ 2 bài mẫu', Object.keys(SAMPLES).length === 2);
    var s1 = SAMPLES['L1-01'];
    check('bài mẫu 1 có đủ 20 cụm từ', (s1.before.length + s1.during.length + s1.after.length) === 20);
    check('bài mẫu 1 có 5 pattern ngữ pháp', s1.patterns.length === 5);
    check('phrase tách đúng en | vi', toPhraseArr(['Hello | Xin chào'])[0].vi === 'Xin chào');
    check('recall tách đúng 3 phần', toRecallArr(['Q | A | H'])[0].hint === 'H');
    check('phrase rỗng KHÔNG tính là có nội dung',
      hasContent({ notionOverrides: { phrases: { before: [{ en: '', vi: '' }], during: [{ en: '', vi: '' }] } } }) === false);
    check('phrase thật thì tính là có nội dung',
      hasContent({ notionOverrides: { phrases: { before: [{ en: 'Hello', vi: 'Xin chào' }] } } }) === true);
    check('đã bọc deleteTopic', !!(window.SHADOW_V17 && window.SHADOW_V17._v35Wrapped));
    check('có modal thay confirm()', typeof NS.openConfirm === 'function');
    check('có bảng chọn giọng', typeof NS.openVoicePicker === 'function');
    check('pitch mặc định là giọng trầm', getPitch() < 1);
    check('ưu tiên giọng nam nhận diện đúng', MALE_PREFS.some(function (r) { return r.test('Microsoft David - English (United States)'); }));
    check('nhận diện giọng nữ để tránh', FEMALE_HINT.test('Samantha') && FEMALE_HINT.test('Microsoft Zira'));
    check('đã nạp font Inter', !!document.getElementById('v35-font-inter'));
    check('có renderer queue thật', typeof NS.renderRealQueue === 'function');
    check('bảng queue KHÔNG còn dữ liệu giả', (function () {
      var tb = document.querySelector('[data-section-id="review-queue"] .queue-table tbody');
      return !tb || !/Hotel Check-in|Taxi/.test(tb.textContent || '');
    })());
    check('dòng Insight KHÔNG còn số bịa 35%', !/Automatic \(Day 60\) là 35%/.test(document.body.textContent || ''));
    check('relDay dịch đúng', relDay(new Date().toISOString()) === 'Hôm nay');
    check('nút bấm kế thừa đúng font', (function () {
      var b = document.createElement('button'); b.textContent = 'Bắt đầu ôn';
      b.style.cssText = 'position:absolute;left:-9999px'; document.body.appendChild(b);
      var f = getComputedStyle(b).fontFamily; b.remove();
      return /Inter|Segoe UI/i.test(f);
    })());
    console.log('[v35] ' + pass + ' pass · ' + fail + ' fail');
    return fail === 0;
  };
})();
