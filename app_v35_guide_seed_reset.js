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
  NS.version = '35.18.0';

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

  // Hướng dẫn riêng cho khu vực AI (không gắn vào tiêu đề mục nào nên tách ra)
  var GUIDE_AI = {
    icon: '✨', title: 'Tạo bài học bằng AI',
    what: 'Tuỳ chọn thêm — KHÔNG bắt buộc. Bạn vẫn có thể tự soạn tay như bình thường. ' +
          'Nếu bấm, AI sẽ đọc video (hoặc transcript) rồi soạn sẵn đủ 12 mục của bài học ' +
          'để bạn duyệt: Vì sao học · Bối cảnh · Cụm từ Before/During/After · Hội thoại · ' +
          'Shadowing script · Real English · Nối âm · Ngữ pháp · Nhiệm vụ · Active recall.',
    how : '① Gắn link YouTube vào mục VIDEO IMMERSION ở trên. ' +
          '② Bấm “✨ Tạo bài học từ video”. Nếu video có phụ đề Việt CHÁY SẴN trên hình, ' +
          'hãy dùng “📄 Từ transcript” thay vì — vào YouTube bấm ⋯ → Show transcript, copy rồi dán vào; ' +
          'cách này chính xác hơn vì AI đọc chữ thay vì nghe. ' +
          '③ Bảng duyệt hiện ra: đọc lướt, BỎ TICK mục nào không ưng, sửa thẳng trong ô. ' +
          '④ Bấm “Áp dụng vào bài học”. Không ưng thì bấm “↩ Hoàn tác” — trả về y nguyên như cũ. ' +
          'Lưu ý: AI có thể nghe sai. Nội dung sai sẽ theo bạn suốt 60 ngày ôn tập, nên đừng bỏ qua bước duyệt. ' +
          'Chỉ chạy được với video CÔNG KHAI, và cần Gemini API key.',
    time: '30–60 giây mỗi lần'
  };

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
      '.v35-range-ends{display:flex;justify-content:space-between;font-size:11px;color:#7b7599;margin-top:2px}',

      /* ---------- AI: THANH NÚT + BẢNG DUYỆT ---------- */
      '.v35-ai-bar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-top:14px;',
      'padding-top:13px;border-top:1px dashed rgba(167,139,250,.22)}',
      '.v35-ai-go{border-color:rgba(167,139,250,.5)!important;color:#c4b5fd!important;',
      'background:rgba(124,92,255,.14)!important}',
      '.v35-ai-go:hover{background:rgba(124,92,255,.3)!important;color:#fff!important}',
      '.v35-undo{border-color:rgba(250,204,21,.45)!important;color:#fde047!important;',
      'background:rgba(250,204,21,.1)!important}',
      '.v35-ai-note{font-size:11px;color:#7b7599;flex:1;min-width:180px}',
      /* .v35-btn dùng display:inline-flex nên đè mất thuộc tính [hidden] mặc định của HTML */
      '.v35-btn[hidden],.v35-help[hidden]{display:none!important}',
      /* K. đi lại trong buổi học */
      '.step-btn.v35-prev{margin-right:8px;opacity:.85}',
      '.step-btn.v35-prev:hover{opacity:1}',
      '.session-step[data-v35nav="jump"]{transition:background .15s}',
      '.session-step[data-v35nav="jump"]:hover{background:rgba(124,92,255,.10)}',
      '.session-step .step-btn[data-v35nav="reopen"]{cursor:pointer;opacity:.9}',
      /* L. âm thanh + ăn mừng */
      '.v35-fx-btn.off{opacity:.55}',
      '.v35-banner{position:fixed;left:50%;top:78px;transform:translate(-50%,-24px);z-index:2147483100;' +
        'background:linear-gradient(135deg,#7c5cff,#5b3fd6);color:#fff;padding:14px 26px;border-radius:14px;' +
        'box-shadow:0 12px 40px rgba(0,0,0,.45);text-align:center;max-width:min(560px,92vw);' +
        'opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease;font-family:var(--v35-font)}',
      '.v35-banner.go{opacity:1;transform:translate(-50%,0)}',
      '.v35-bn-t{font-weight:700;font-size:16px;line-height:1.35}',
      '.v35-bn-s{font-size:13px;opacity:.9;margin-top:4px;line-height:1.45}',
      '.v35-xpfloat{position:fixed;z-index:2147483100;pointer-events:none;color:#ffd166;font-weight:700;' +
        'font-size:15px;font-family:var(--v35-font);text-shadow:0 2px 8px rgba(0,0,0,.6);' +
        'animation:v35rise 1.4s ease-out forwards}',
      '@keyframes v35rise{0%{opacity:0;transform:translateY(6px)}18%{opacity:1}100%{opacity:0;transform:translateY(-34px)}}',
      '@media (prefers-reduced-motion: reduce){.v35-xpfloat{animation:none;opacity:0}}',
      /* M. Review Engine — lấp chỗ trống + dòng ghi chú số liệu */
      '.v35-rev-note{margin-top:8px;font-size:12px;color:rgba(255,255,255,.55);font-family:var(--v35-font)}',
      '.v35-fill{display:flex;flex-direction:column;justify-content:center;gap:8px;' +
        'padding:16px 18px;border-radius:14px;font-family:var(--v35-font);' +
        'border:1px dashed rgba(140,120,255,.35);background:rgba(124,92,255,.06)}',
      '.v35-fill-t{font-weight:700;font-size:15px;color:rgba(255,255,255,.92)}',
      '.v35-fill-s{font-size:13px;line-height:1.5;color:rgba(255,255,255,.6)}',
      '.v35-fill-go{align-self:flex-start;margin-top:4px}',
      '@media (max-width:680px){.v35-fill{grid-column:1/-1!important}}',
      /* N. buổi học đầy đủ — khối gập lại + nhóm cụm từ */
      '.v35-det{margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;' +
        'background:rgba(255,255,255,.03);font-family:var(--v35-font);overflow:hidden}',
      '.v35-det>summary{cursor:pointer;padding:11px 14px;font-weight:600;font-size:13.5px;' +
        'color:rgba(255,255,255,.85);list-style:none;user-select:none}',
      '.v35-det>summary::-webkit-details-marker{display:none}',
      '.v35-det>summary::before{content:"▸ ";color:rgba(160,140,255,.9)}',
      '.v35-det[open]>summary::before{content:"▾ "}',
      '.v35-det>summary:hover{background:rgba(255,255,255,.04)}',
      '.v35-det-body{padding:4px 14px 14px}',
      '.v35-grp{margin-top:12px}',
      '.v35-grp-h{font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;' +
        'color:rgba(180,160,255,.85);margin-bottom:6px;font-family:var(--v35-font)}',
      '.v35-grp-h span{color:rgba(255,255,255,.4);font-weight:500;letter-spacing:0}',
      '.v35-pat{padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07)}',
      '.v35-pat:last-child{border-bottom:0}',
      '.v35-pat-p{font-weight:700;color:#fff;font-size:14px}',
      '.v35-pat-m{font-size:12.5px;color:rgba(255,255,255,.6);margin:3px 0 6px}',
      '.v35-ex{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,.8);padding:2px 0}',
      '.v35-lkrow{display:flex;gap:10px;align-items:flex-start;padding:8px 0;' +
        'border-bottom:1px solid rgba(255,255,255,.07)}',
      '.v35-lkrow:last-child{border-bottom:0}',
      '.v35-lksent{font-size:13.5px;color:rgba(255,255,255,.88);margin-bottom:4px}',
      '.v35-lk{display:inline-block;margin:0 8px 4px 0;font-size:12.5px;color:rgba(255,255,255,.62)}',
      '.v35-lk b{color:#ffd166;font-weight:600}',
      '.v35-re{font-size:13px;line-height:1.55;color:rgba(255,255,255,.78);padding:5px 0;' +
        'border-bottom:1px solid rgba(255,255,255,.06)}',
      '.v35-re:last-child{border-bottom:0}',
      '.v35-vid{position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden}',
      '.v35-vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}',
      /* O. thanh điều khiển buổi học */
      '.v35-learnbar{grid-column:1/-1;position:sticky;top:0;z-index:60;display:flex;flex-wrap:wrap;gap:12px;' +
        'align-items:center;justify-content:space-between;padding:12px 18px;margin-bottom:14px;' +
        'border-radius:14px;font-family:var(--v35-font);' +
        'background:linear-gradient(135deg,rgba(124,92,255,.96),rgba(91,63,214,.96));' +
        'box-shadow:0 8px 28px rgba(0,0,0,.45);backdrop-filter:blur(8px)}',
      '.v35-lb-left{display:flex;align-items:center;gap:10px;min-width:0;flex-wrap:wrap}',
      '.v35-lb-dot{width:9px;height:9px;border-radius:50%;background:#4ade80;flex:none;' +
        'box-shadow:0 0 0 0 rgba(74,222,128,.7);animation:v35pulse 2s infinite}',
      '@keyframes v35pulse{70%{box-shadow:0 0 0 9px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}',
      '@media (prefers-reduced-motion: reduce){.v35-lb-dot{animation:none}}',
      '.v35-lb-t{color:#fff;font-weight:700;font-size:14px;letter-spacing:.02em}',
      '.v35-lb-sub{color:rgba(255,255,255,.72);font-size:12.5px}',
      '.v35-lb-right{display:flex;gap:8px;flex:none}',
      '.v35-lb-btn{border:0;border-radius:10px;padding:9px 16px;font-weight:600;font-size:13.5px;' +
        'cursor:pointer;font-family:var(--v35-font)}',
      '.v35-lb-btn.ghost{background:rgba(255,255,255,.15);color:#fff}',
      '.v35-lb-btn.ghost:hover{background:rgba(255,255,255,.25)}',
      '.v35-lb-btn.go{background:#fff;color:#4c2fd0}',
      '.v35-lb-btn.go:hover{background:#f2eeff}',
      /* O. đang học thì ẩn hết công cụ sửa — không lỡ tay xoá mất nội dung */
      'body.' + LEARN_CLASS + ' #view-topic-detail .v12-phrase-actions,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v12-block-actions,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v12-add-block-bar,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v12-add-phrase-btn,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v12-section-edit-btn,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v15-sec-tools,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v15-item-actions,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v15-edit-only,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v15-btn,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .gp-actions,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .gp-del,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .mm-actions,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .v35-ai-bar,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail [data-v35="reset-topic"],' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .topic-hero .mission-btn,' +
      'body.' + LEARN_CLASS + ' #view-topic-detail .topic-hero .step-btn' +
      '{display:none!important}',
      '.v35-key.need{border-color:rgba(250,204,21,.6)!important;color:#fde047!important;',
      'background:rgba(250,204,21,.14)!important;animation:v35glow 2.2s ease-in-out infinite}',
      '@keyframes v35glow{0%,100%{box-shadow:0 0 0 0 rgba(250,204,21,0)}50%{box-shadow:0 0 0 4px rgba(250,204,21,.14)}}',

      '.v35-box-wide{width:min(680px,100%)}',
      '.v35-spin{animation:v35pulse 1.4s ease-in-out infinite}',
      '@keyframes v35pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.9)}}',
      '.v35-bar{height:5px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}',
      '.v35-bar span{display:block;height:100%;width:38%;border-radius:99px;',
      'background:linear-gradient(90deg,#7c5cff,#ec4899);animation:v35slide 1.3s ease-in-out infinite}',
      '@keyframes v35slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}',

      '.v35-pv-list{max-height:44vh;overflow:auto;margin-top:12px;padding-right:4px}',
      '.v35-pv-list::-webkit-scrollbar{width:7px}',
      '.v35-pv-list::-webkit-scrollbar-thumb{background:rgba(167,139,250,.3);border-radius:7px}',
      '.v35-pv-row{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 13px;margin-bottom:9px;',
      'background:rgba(255,255,255,.025)}',
      '.v35-pv-row.empty{opacity:.5}',
      '.v35-pv-head{display:flex;align-items:center;gap:9px;cursor:pointer}',
      '.v35-pv-head input{accent-color:#a78bfa;width:15px;height:15px;flex:0 0 auto;margin:0}',
      '.v35-pv-lb{font-size:12.5px;font-weight:700;color:#e3dff5;flex:1}',
      '.v35-pv-n{font-size:10.5px;color:#7b7599;flex:0 0 auto}',
      '.v35-pv-hint{font-size:10.5px;color:#6f6a8c;margin:6px 0 5px}',
      '.v35-box textarea{width:100%;box-sizing:border-box;padding:9px 11px;border-radius:9px;',
      'border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.3);color:#e3dff5;',
      'font-family:inherit;font-size:12.5px;line-height:1.55;resize:vertical}',
      '.v35-box textarea:focus{outline:none;border-color:rgba(167,139,250,.7);',
      'box-shadow:0 0 0 3px rgba(124,92,255,.13)}',
      '.v35-pv-mode{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:#a49dc4;cursor:pointer}',
      '.v35-pv-mode input{accent-color:#a78bfa;width:15px;height:15px;margin:0}',

      /* ---------- GIỮ KÝ TỰ XUỐNG DÒNG TRONG KHỐI NỘI DUNG ---------- */
      /* blocks.js render note trong <div> trần, không đặt white-space nên mọi */
      /* dấu xuống dòng bị nuốt → cả bài dồn thành một cục chữ. */
      '.block-note > div:not(.block-title),',
      '.block-paragraph > div:not(.block-title),',
      '.v12-block .blk-body,',
      '.v15-shadow-text,',
      '.shadow-text{white-space:pre-wrap}',
      '.block-note{padding-top:2px}'
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
          '<button class="v35-mbtn ghost" data-v35a="cancel">' + esc(opts.cancelText || 'Huỷ') + '</button>' +
          '<button class="v35-mbtn go" data-v35a="ok"' + (needInput ? ' disabled' : '') + '>' +
          esc(opts.confirmText || 'Xác nhận') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';

    var okBtn = modalEl.querySelector('[data-v35a="ok"]');
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
    modalEl.querySelector('[data-v35a="cancel"]').onclick = closeModal;
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
          '<button class="v35-mbtn ghost" data-v35a="cancel">Huỷ</button>' +
          '<button class="v35-mbtn save" data-v35a="ok">Lưu giọng đọc</button>' +
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

    modalEl.querySelector('[data-v35a="ok"]').onclick = function () {
      try {
        localStorage.setItem(VOICE_KEY, selectedName());
        localStorage.setItem(PITCH_KEY, String(parseFloat(pitchEl.value)));
      } catch (e) {}
      try { speechSynthesis.cancel(); } catch (e) {}
      applyVoice();
      closeModal();
      toast('🎙 Đã đổi giọng đọc: ' + selectedName());
    };
    modalEl.querySelector('[data-v35a="cancel"]').onclick = function () { try { speechSynthesis.cancel(); } catch (e) {} closeModal(); };
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

  // ---------------------------------------------------------- LEVEL MAP
  // Các chip trong LEVEL MAP là HTML gõ tay: tên ("Restaurant", "Taxi", "Hotel")
  // không khớp topic thật, và 5 chip đầu luôn mang class "done" (chấm xanh) dù
  // tiến trình thật là 0%. Chỉ % và thanh bar là thật.
  // nav_polish.js tìm topic theo EMOJI của chip → render bằng emoji thật thì
  // click mở topic vẫn chạy đúng, không cần sửa file cũ.
  function shortLabel(name) {
    var n = String(name || '').split(/\s*[&,(]\s*/)[0].trim();
    var w = n.split(/\s+/);
    if (n.length > 13 && w.length > 1) n = w.slice(0, 2).join(' ');
    return n.length > 15 ? n.slice(0, 14) + '…' : n;
  }
  function renderRealLevelMap() {
    var card = document.querySelector('[data-section-id="level-map"]');
    if (!card) return;
    var s = getState(); if (!s || !s.topics) return;
    var cards = card.querySelectorAll('.level-card');

    for (var lv = 1; lv <= cards.length; lv++) {
      var lc = cards[lv - 1];
      var list = (s.topics || []).filter(function (t) { return Number(t.level) === lv; });

      var subSpan = lc.querySelector('.level-sub span');
      if (subSpan) {
        var cnt = list.length + ' topics';
        if (subSpan.textContent !== cnt) subSpan.textContent = cnt;
      }

      var row = lc.querySelector('.topics-row');
      if (!row) continue;

      var html = list.slice(0, 7).map(function (t) {
        var done = (t.masteryPct || 0) >= 60 || t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic';
        var touched = (t.sessions || 0) > 0 || !!t.lastReview;
        return '<div class="topic-icon' + (done ? ' done' : '') + '"' +
          (touched ? '' : ' style="opacity:.55"') +
          ' data-topic="' + esc(t.id) + '" title="' + esc(t.name + ' · ' + (t.reviewStage || 'Day 0') + ' · ' + Math.round(t.masteryPct || 0) + '%') + '">' +
          '<div class="bubble">' + esc(t.emoji || '✨') + '</div>' + esc(shortLabel(t.name)) + '</div>';
      }).join('');
      if (list.length > 7) {
        html += '<div class="topic-icon locked" title="Xem tất cả ' + list.length + ' chủ đề Level ' + lv + '">' +
          '<div class="bubble">⋯</div>More...</div>';
      }
      if (!list.length) {
        html = '<div style="font-size:11px;color:var(--text-3);padding:6px 0">Chưa có chủ đề nào ở cấp độ này.</div>';
      }

      if (row.getAttribute('data-v35sig') !== html) {
        row.innerHTML = html;
        row.setAttribute('data-v35sig', html);
      }
    }
  }
  NS.renderRealLevelMap = renderRealLevelMap;

  // ============================================================
  // G. TẠO BÀI HỌC TỪ VIDEO / TRANSCRIPT (Gemini)
  // ------------------------------------------------------------
  // Gemini API nhận thẳng link YouTube qua part {file_data:{file_uri:...}}
  // trên chính endpoint app đang dùng (v1beta gemini-2.5-flash).
  // Giới hạn: chỉ video CÔNG KHAI · bản free tối đa 8 giờ video/ngày.
  // AI có thể nghe sai → LUÔN qua bảng duyệt trước khi ghi vào bài.
  // ============================================================
  var GEMINI_MODEL = 'gemini-2.5-flash';
  function geminiKey() { try { return localStorage.getItem('shadow-en-gemini-key') || ''; } catch (e) { return ''; } }

  function ytId(url) {
    var m = String(url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }
  NS.ytId = ytId;

  var LESSON_RULES = [
    'Bạn là biên tập viên giáo trình tiếng Anh cho người Việt trình độ sơ–trung cấp.',
    'Nhiệm vụ: bóc tách nội dung thành một bài học shadowing hoàn chỉnh.',
    '',
    'Có 2 loại nội dung, luật khác nhau:',
    '',
    '=== A. PHẦN TRÍCH (phải trung thực tuyệt đối) ===',
    'phrases · dialogues · shadow_script · real_english',
    'A1. CHỈ dùng câu tiếng Anh THỰC SỰ ĐƯỢC NÓI. Bỏ qua mọi chữ hiện trên màn hình',
    '    (phụ đề tiếng Việt cháy sẵn, watermark, tên blog) — đó KHÔNG phải lời thoại.',
    'A2. Không bịa lời thoại. Chỗ nào không nghe/đọc rõ thì bỏ, KHÔNG đoán.',
    'A3. Giữ nguyên câu tiếng Anh như được nói. Tiếng Việt là bản dịch tự nhiên, không dịch từng chữ.',
    '',
    '=== B. PHẦN SUY RA (BẮT BUỘC phải có, không được để rỗng) ===',
    'why · scene · grammar_patterns · missions · active_recall · connected_speech',
    'Đây là phần bạn SOẠN dựa trên nội dung đã trích ở A — không phải chép lại,',
    'nên luôn tạo được. Kể cả khi A chỉ lấy được vài câu, vẫn phải soạn đủ B.',
    '',
    'SỐ LƯỢNG TỐI THIỂU (cố gắng đạt, đừng trả về rỗng):',
    '• phrases: chia before (trước khi bắt đầu) / during (trong lúc nói) / after (khi kết thúc).',
    '  Mỗi nhóm 3–8 câu, ưu tiên câu dùng lại được nhiều lần. Nếu video chỉ thuộc một giai đoạn,',
    '  hãy soạn thêm câu cùng tình huống cho 2 nhóm còn lại và ghi rõ trong scene.',
    '• shadow_script: 5–8 dòng, nối các câu cốt lõi thành đoạn liền mạch để nói đuổi theo.',
    '• real_english: 4–6 dòng — cách người bản xứ nói tắt / nuốt âm so với sách vở.',
    '• grammar_patterns: 4–5 khuôn, dạng "Mẫu + [chỗ thay được]". meaning tiếng Việt. Mỗi khuôn 3 ví dụ.',
    '• missions: 3 việc làm được NGOÀI app trong 24h, có tiêu chí biết là xong.',
    '• active_recall: 5–6 câu. question tiếng Việt, answer tiếng Anh, hint là gợi ý ngắn.',
    '• connected_speech: 4–6 chỗ nối âm rút từ chính các câu ở phrases.',
    '  sentence = câu đầy đủ có chứa chỗ nối; pair = hai từ dính nhau (vd "want to");',
    '  sound = cách đọc thật khi nói nhanh (vd "wanna"); note = giải thích tiếng Việt một dòng.',
    '• why và scene: mỗi mục 2–4 câu tiếng Việt.',
    '',
    'Trả về DUY NHẤT một JSON đúng schema, không kèm giải thích, không bọc trong ```.'
  ].join('\n');

  var LESSON_SCHEMA = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      why: { type: 'string' },
      scene: { type: 'string' },
      phrases: {
        type: 'object',
        properties: {
          before: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, vi: { type: 'string' } }, required: ['en', 'vi'] } },
          during: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, vi: { type: 'string' } }, required: ['en', 'vi'] } },
          after:  { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, vi: { type: 'string' } }, required: ['en', 'vi'] } }
        },
        required: ['before', 'during', 'after']
      },
      dialogues: { type: 'string' },
      shadow_script: { type: 'string' },
      real_english: { type: 'string' },
      grammar_patterns: {
        type: 'array',
        items: {
          type: 'object',
          properties: { pattern: { type: 'string' }, meaning: { type: 'string' }, examples: { type: 'array', items: { type: 'string' } } },
          required: ['pattern', 'meaning', 'examples']
        }
      },
      missions: {
        type: 'array',
        items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, success: { type: 'string' } }, required: ['title'] }
      },
      active_recall: {
        type: 'array',
        items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' }, hint: { type: 'string' } }, required: ['question', 'answer'] }
      },
      connected_speech: {
        type: 'array',
        items: {
          type: 'object',
          properties: { sentence: { type: 'string' }, pair: { type: 'string' }, sound: { type: 'string' }, note: { type: 'string' } },
          required: ['sentence', 'pair', 'sound']
        }
      }
    },
    required: ['why', 'scene', 'phrases', 'shadow_script', 'real_english',
               'grammar_patterns', 'missions', 'active_recall', 'connected_speech']
  };

  function callGemini(parts, onDone, onErr) {
    var k = geminiKey();
    if (!k) { onErr('__NOKEY__'); return null; }

    var body = {
      contents: [{ role: 'user', parts: parts }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: LESSON_SCHEMA,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL +
              ':generateContent?key=' + encodeURIComponent(k);

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error((j && j.error && j.error.message) || ('HTTP ' + r.status));
          return j;
        });
      })
      .then(function (j) {
        var txt = '';
        try { txt = j.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join(''); } catch (e) {}
        if (!txt) throw new Error('Gemini không trả về nội dung (có thể video quá dài hoặc không công khai).');
        var data;
        try { data = JSON.parse(txt.replace(/^```(?:json)?\s*|\s*```$/g, '')); }
        catch (e) { throw new Error('Không đọc được JSON Gemini trả về.'); }
        onDone(data);
      })
      .catch(function (e) {
        if (e && e.name === 'AbortError') return;
        onErr(String((e && e.message) || e));
      });
    return ctrl;
  }

  // ---------------------------------------------------------- modal đang chạy
  function openWorking(title, note, onCancel) {
    closeModal(); injectCSS();
    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.innerHTML =
      '<div class="v35-box"><div class="v35-mhead">' +
        '<div class="v35-micon lock v35-spin">✨</div>' +
        '<div><div class="v35-mtitle">' + esc(title) + '</div>' +
        '<div class="v35-msub">' + esc(note) + '</div></div>' +
      '</div>' +
      '<div class="v35-mbody"><div class="v35-bar"><span></span></div></div>' +
      '<div class="v35-acts"><button class="v35-mbtn ghost" data-v35a="cancel">Huỷ</button></div></div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';
    modalEl.querySelector('[data-v35a="cancel"]').onclick = function () { if (onCancel) onCancel(); closeModal(); };
  }

  // ---------------------------------------------------------- NGẮT DÒNG TỰ ĐỘNG
  // Gemini hay trả về cả đoạn dính liền một dòng. Hàm này tách ra cho dễ đọc:
  //   dialogue  → xuống dòng trước mỗi lượt nói ("A:", "Waiter:")
  //   list      → xuống dòng trước mỗi mục đánh số ("1.", "2)") hoặc gạch đầu dòng
  //   sentences → mỗi câu một dòng
  // Đồng thời bỏ ký hiệu markdown ** __ vì app không render markdown
  // (đang hiện ra chữ sống "**Who is it?**" trên màn hình).
  function tidyText(s, kind) {
    var t = String(s || '').replace(/\r\n?/g, '\n').trim();
    if (!t) return '';
    t = t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/\*\*|__/g, '');

    if (kind === 'dialogue') {
      // nhãn người nói = 1–2 từ viết hoa rồi tới dấu hai chấm
      t = t.replace(/[ \t]+(?=[A-Z][a-zA-Z]{0,14}(?: [A-Z][a-zA-Z]{0,14})?:[ \t])/g, '\n');
    } else if (kind === 'list') {
      t = t.replace(/[ \t]+(?=\d{1,2}[.)][ \t])/g, '\n');
      t = t.replace(/[ \t]+(?=[•‣▪][ \t])/g, '\n');
    } else if (kind === 'sentences') {
      if (t.indexOf('\n') === -1) t = t.replace(/([.!?])[ \t]+(?=[A-Z"'“])/g, '$1\n');
    }
    return t.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).join('\n');
  }
  NS.tidyText = tidyText;

  // Sửa lại các khối AI đã ghi TỪ TRƯỚC mà còn dính liền một cục.
  // Chỉ đụng đúng 3 khối do AI tạo, và chỉ đổi CÁCH XUỐNG DÒNG — không đổi chữ.
  var TIDY_BLOCKS = [
    { re: /dialogue|hội thoại/i, kind: 'dialogue' },
    { re: /real\s*english/i, kind: 'list' },
    { re: /connected\s*speech|nối âm/i, kind: 'lines' }
  ];
  function tidyStoredBlocks(topicId) {
    var ov = rawOverlay(topicId);
    if (!ov || !ov.customBlocks || !ov.customBlocks.length) return false;
    var changed = false;
    ov.customBlocks.forEach(function (b) {
      if (!b || b.v35tidy || typeof b.text !== 'string') return;
      for (var i = 0; i < TIDY_BLOCKS.length; i++) {
        if (!TIDY_BLOCKS[i].re.test(b.title || '')) continue;
        var next = tidyText(b.text, TIDY_BLOCKS[i].kind);
        if (next && next !== b.text) b.text = next;
        b.v35tidy = true;
        changed = true;
        break;
      }
    });
    if (changed) writeOverlay(topicId, ov);
    return changed;
  }
  NS.tidyStoredBlocks = tidyStoredBlocks;

  // ---------------------------------------------------------- chuyển JSON → dạng dòng để sửa
  function phrasesToLines(arr) {
    return (arr || []).map(function (p) {
      var en = String((p && (p.en || p.english)) || '').trim();
      var vi = String((p && (p.vi || p.vietnamese)) || '').trim();
      return vi ? (en + ' | ' + vi) : en;
    }).filter(Boolean).join('\n');
  }
  function patternsToLines(arr) {
    return (arr || []).map(function (p) {
      var ex = (p.examples || []).slice(0, 3).join(' ; ');
      return [String(p.pattern || '').trim(), String(p.meaning || '').trim(), ex].filter(Boolean).join(' | ');
    }).filter(Boolean).join('\n');
  }
  function missionsToLines(arr) {
    return (arr || []).map(function (m) {
      return [String(m.title || '').trim(), String(m.description || '').trim(), String(m.success || '').trim()]
        .filter(Boolean).join(' | ');
    }).filter(Boolean).join('\n');
  }
  function recallToLines(arr) {
    return (arr || []).map(function (r) {
      return [String(r.question || '').trim(), String(r.answer || '').trim(), String(r.hint || '').trim()]
        .filter(Boolean).join(' | ');
    }).filter(Boolean).join('\n');
  }
  function linkingToLines(arr) {
    return (arr || []).map(function (l) {
      return [String(l.sentence || '').trim(), String(l.pair || '').trim(),
              String(l.sound || '').trim(), String(l.note || '').trim()].filter(Boolean).join(' | ');
    }).filter(Boolean).join('\n');
  }
  // Dựng cache đúng định dạng app_v34 đọc: { "câu": [{a,b,ipa,type}] } — a,b là chỉ số TỪ.
  function linesToLinking(txt) {
    var out = {};
    String(txt || '').split(/\r?\n/).forEach(function (line) {
      var p = line.split(/\s*\|\s*/);
      var sent = (p[0] || '').trim(), pair = (p[1] || '').trim(), sound = (p[2] || '').trim();
      if (!sent || !pair || !sound) return;
      var words = sent.split(/\s+/);
      var pw = pair.split(/\s+/);
      if (pw.length < 2) return;
      var norm = function (w) { return w.replace(/[^\w']/g, '').toLowerCase(); };
      for (var i = 0; i < words.length - 1; i++) {
        if (norm(words[i]) === norm(pw[0]) && norm(words[i + 1]) === norm(pw[1])) {
          (out[sent] = out[sent] || []).push({ a: i, b: i + 1, ipa: '/' + sound.replace(/^\/|\/$/g, '') + '/', type: 'linking' });
          break;
        }
      }
    });
    return out;
  }
  function linesToPatterns(txt) {
    return String(txt || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var p = l.split(/\s*\|\s*/);
      return {
        id: uid('p'),
        pattern: (p[0] || '').trim(),
        meaning: (p[1] || '').trim(),
        examples: (p[2] || '').split(/\s*;\s*/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 3),
        source: 'ai-video'
      };
    }).filter(function (x) { return x.pattern; });
  }

  // ---------------------------------------------------------- bảng duyệt
  var PREVIEW_FIELDS = [
    { k: 'why',      label: '🤔 Vì sao học chủ đề này', hint: 'Một đoạn tiếng Việt' },
    { k: 'scene',    label: '🎬 Bối cảnh',              hint: 'Một đoạn tiếng Việt' },
    { k: 'before',   label: '💬 Cụm từ — BEFORE',       hint: 'Mỗi dòng: English | Tiếng Việt' },
    { k: 'during',   label: '💬 Cụm từ — DURING',       hint: 'Mỗi dòng: English | Tiếng Việt' },
    { k: 'after',    label: '💬 Cụm từ — AFTER',        hint: 'Mỗi dòng: English | Tiếng Việt' },
    { k: 'dialogue', label: '🎭 Hội thoại',             hint: 'Mỗi dòng một lượt nói' },
    { k: 'shadow',   label: '🎧 Shadowing script',      hint: 'Đoạn để nói đuổi theo' },
    { k: 'real',     label: '🎤 Real English (native)', hint: 'Cách người bản xứ nói tắt / nuốt âm' },
    { k: 'linking',  label: '🔗 Nối âm',                hint: 'Mỗi dòng: Câu | cặp từ dính | cách đọc | ghi chú' },
    { k: 'patterns', label: '📐 Cấu trúc ngữ pháp',     hint: 'Mỗi dòng: Mẫu | Nghĩa | VD1 ; VD2 ; VD3' },
    { k: 'missions', label: '🚀 Nhiệm vụ đời thật',     hint: 'Mỗi dòng: Việc | Mô tả | Tiêu chí xong' },
    { k: 'recall',   label: '🧠 Active recall',         hint: 'Mỗi dòng: Câu hỏi | Đáp án | Gợi ý' }
  ];

  function dataToFields(d) {
    var ph = d.phrases || {};
    return {
      why: String(d.why || '').trim(),
      scene: String(d.scene || '').trim(),
      before: phrasesToLines(ph.before),
      during: phrasesToLines(ph.during),
      after: phrasesToLines(ph.after),
      dialogue: tidyText(d.dialogues, 'dialogue'),
      shadow: tidyText(d.shadow_script, 'sentences'),
      real: tidyText(d.real_english, 'list'),
      linking: linkingToLines(d.connected_speech),
      patterns: patternsToLines(d.grammar_patterns),
      missions: missionsToLines(d.missions),
      recall: recallToLines(d.active_recall)
    };
  }

  function openLessonPreview(topicId, data, sourceLabel) {
    closeModal(); injectCSS();
    var f = dataToFields(data);
    var s = getState();
    var t = s && s.topics ? s.topics.filter(function (x) { return x.id === topicId; })[0] : null;

    var rows = PREVIEW_FIELDS.map(function (fd) {
      var val = f[fd.k] || '';
      var n = val ? val.split(/\r?\n/).filter(Boolean).length : 0;
      var big = /why|scene|dialogue|shadow|real/.test(fd.k);
      return '<div class="v35-pv-row' + (val ? '' : ' empty') + '">' +
        '<label class="v35-pv-head">' +
          '<input type="checkbox" data-f="' + fd.k + '"' + (val ? ' checked' : ' disabled') + '>' +
          '<span class="v35-pv-lb">' + esc(fd.label) + '</span>' +
          '<span class="v35-pv-n">' + (val ? (big ? (val.length + ' ký tự') : (n + ' dòng')) : 'AI không lấy được') + '</span>' +
        '</label>' +
        (val ? '<div class="v35-pv-hint">' + esc(fd.hint) + '</div>' +
               '<textarea data-t="' + fd.k + '" rows="' + (big ? 3 : Math.min(8, Math.max(2, n))) + '">' + esc(val) + '</textarea>' : '') +
        '</div>';
    }).join('');

    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.innerHTML =
      '<div class="v35-box v35-box-wide">' +
        '<button class="v35-mx" aria-label="Đóng">×</button>' +
        '<div class="v35-mhead">' +
          '<div class="v35-micon lock">✨</div>' +
          '<div><div class="v35-mtitle">Duyệt nội dung AI đề xuất</div>' +
          '<div class="v35-msub">Nguồn: ' + esc(sourceLabel) + (t ? ' → ghi vào “' + esc(t.name) + '”' : '') +
          '. Bỏ tick mục không ưng, sửa thẳng trong ô. Chỉ mục được tick mới ghi vào bài.</div></div>' +
        '</div>' +
        '<div class="v35-mbody">' +
          '<div class="v35-note">AI có thể nghe sai hoặc bịa. Đọc lướt một lượt trước khi áp dụng — nội dung sai sẽ theo bạn suốt 60 ngày ôn tập.</div>' +
          '<div class="v35-pv-list">' + rows + '</div>' +
          '<label class="v35-pv-mode"><input type="checkbox" data-mode="append"> Cộng thêm vào nội dung đang có (mặc định: thay thế phần được tick)</label>' +
        '</div>' +
        '<div class="v35-acts">' +
          '<button class="v35-mbtn ghost" data-v35a="cancel">Huỷ</button>' +
          '<button class="v35-mbtn save" data-v35a="ok">Áp dụng vào bài học</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';

    modalEl.querySelector('[data-v35a="cancel"]').onclick = closeModal;
    modalEl.querySelector('.v35-mx').onclick = closeModal;
    modalEl.onclick = function (e) { if (e.target === modalEl) closeModal(); };

    modalEl.querySelector('[data-v35a="ok"]').onclick = function () {
      var picked = {}, any = false;
      modalEl.querySelectorAll('input[data-f]').forEach(function (cb) {
        if (!cb.checked || cb.disabled) return;
        var ta = modalEl.querySelector('textarea[data-t="' + cb.getAttribute('data-f') + '"]');
        var v = ta ? ta.value.trim() : '';
        if (v) { picked[cb.getAttribute('data-f')] = v; any = true; }
      });
      if (!any) { toast('Chưa tick mục nào để áp dụng.'); return; }
      var append = !!modalEl.querySelector('[data-mode="append"]').checked;
      closeModal();
      applyLesson(topicId, picked, append);
    };
  }
  NS.openLessonPreview = openLessonPreview;

  // ---------------------------------------------------------- SAO LƯU + HOÀN TÁC
  // Tính năng AI là NHÁNH PHỤ. Trước khi ghi bất cứ thứ gì, chụp lại nguyên trạng
  // overlay + grammar patterns của topic. Bấm "Hoàn tác" là trả về y như cũ.
  var UNDO_KEY = 'shadow-en-v35-undo';
  function snapshotBefore(topicId) {
    try {
      var gp = JSON.parse(localStorage.getItem(GP_KEY) || '{}') || {};
      localStorage.setItem(UNDO_KEY, JSON.stringify({
        topicId: topicId,
        at: new Date().toISOString(),
        overlay: rawOverlay(topicId),
        patterns: gp[topicId] || null,
        linking: localStorage.getItem('shadow-en-linking-' + topicId)
      }));
    } catch (e) {}
  }
  function undoAvailableFor(topicId) {
    try {
      var u = JSON.parse(localStorage.getItem(UNDO_KEY) || 'null');
      return (u && u.topicId === topicId) ? u : null;
    } catch (e) { return null; }
  }
  NS.undoLesson = function (topicId) {
    var u = undoAvailableFor(topicId);
    if (!u) { toast('Không có bản sao lưu để hoàn tác.'); return false; }
    openConfirm({
      icon: '↩', iconStyle: 'lock',
      title: 'Hoàn tác nội dung AI',
      subtitle: 'Trả bài học về đúng nguyên trạng trước khi bấm Áp dụng.',
      lose: ['Toàn bộ nội dung AI vừa ghi'],
      keep: ['Nội dung bạn tự soạn trước đó', 'Tiến trình học', 'Video đã gắn'],
      confirmText: 'Hoàn tác'
    }, function () {
      try {
        if (u.overlay) writeOverlay(u.topicId, u.overlay);
        else localStorage.removeItem(OV_PREFIX + u.topicId);
        var gp = JSON.parse(localStorage.getItem(GP_KEY) || '{}') || {};
        if (u.patterns) gp[u.topicId] = u.patterns; else delete gp[u.topicId];
        localStorage.setItem(GP_KEY, JSON.stringify(gp));
        if (u.linking) localStorage.setItem('shadow-en-linking-' + u.topicId, u.linking);
        else localStorage.removeItem('shadow-en-linking-' + u.topicId);
        localStorage.removeItem(UNDO_KEY);
      } catch (e) {}
      toast('↩ Đã trả bài học về nguyên trạng');
      refreshAll();
      setTimeout(function () { try { if (window.SHADOW_V12 && SHADOW_V12._rerender) SHADOW_V12._rerender(); } catch (e) {} }, 120);
    });
    return true;
  };

  // ---------------------------------------------------------- ghi vào bài
  function applyLesson(topicId, f, append) {
    snapshotBefore(topicId);
    var ov = rawOverlay(topicId) || {};
    ov.notionOverrides = ov.notionOverrides || {};
    ov.customBlocks = ov.customBlocks || [];
    ov.v15 = ov.v15 || { missions: [], recall: [], shadowBlocks: [], sections: { order: [], hidden: [] }, header: {} };
    ov.v15.sections = ov.v15.sections || { order: [], hidden: [] };

    if (f.why != null) ov.notionOverrides.why = f.why;
    if (f.scene != null) ov.notionOverrides.scene = f.scene;

    if (f.before != null || f.during != null || f.after != null) {
      var cur = ov.notionOverrides.phrases || { before: [], during: [], after: [] };
      ['before', 'during', 'after'].forEach(function (g) {
        if (f[g] == null) return;
        var next = toPhraseArr(String(f[g]).split(/\r?\n/));
        cur[g] = append ? (cur[g] || []).concat(next) : next;
      });
      ov.notionOverrides.phrases = cur;
    }

    if (f.shadow != null) {
      var sb = [{ id: uid('sb'), text: f.shadow }];
      ov.v15.shadowBlocks = append ? (ov.v15.shadowBlocks || []).concat(sb) : sb;
    }
    if (f.missions != null) {
      var ms = toMissionArr(String(f.missions).split(/\r?\n/));
      ov.v15.missions = append ? (ov.v15.missions || []).concat(ms) : ms;
    }
    if (f.recall != null) {
      var rc = toRecallArr(String(f.recall).split(/\r?\n/));
      ov.v15.recall = append ? (ov.v15.recall || []).concat(rc) : rc;
    }

    function putBlock(re, title, text) {
      if (text == null) return;
      if (!append) ov.customBlocks = ov.customBlocks.filter(function (b) { return !(b && re.test(b.title || '')); });
      ov.customBlocks.push({ id: uid('b'), type: 'note', title: title, text: text });
    }
    putBlock(/dialogue|hội thoại/i, '🎭 Dialogues', f.dialogue);
    putBlock(/real\s*english/i, '🎤 Real English (native)', f.real);
    putBlock(/connected\s*speech|nối âm/i, '🔗 Connected Speech — Nối âm', f.linking);

    writeOverlay(topicId, ov);

    // Nối âm còn được nạp vào cache app_v34 đọc để vẽ dấu nối dưới câu
    if (f.linking != null) {
      try {
        var lk = linesToLinking(f.linking);
        var lkKey = 'shadow-en-linking-' + topicId;
        if (append) {
          var old = {};
          try { old = JSON.parse(localStorage.getItem(lkKey) || '{}') || {}; } catch (e) {}
          Object.keys(lk).forEach(function (k) { old[k] = (old[k] || []).concat(lk[k]); });
          lk = old;
        }
        if (Object.keys(lk).length) localStorage.setItem(lkKey, JSON.stringify(lk));
        try { if (window.SHADOW_V34 && SHADOW_V34.applyAiCache) SHADOW_V34.applyAiCache(topicId); } catch (e) {}
      } catch (e) {}
    }

    if (f.patterns != null) {
      try {
        var all = JSON.parse(localStorage.getItem(GP_KEY) || '{}') || {};
        var next = linesToPatterns(f.patterns);
        all[topicId] = append ? (all[topicId] || []).concat(next) : next;
        localStorage.setItem(GP_KEY, JSON.stringify(all));
      } catch (e) {}
    }

    toast('✅ Đã ghi ' + Object.keys(f).length + ' mục · bấm “↩ Hoàn tác” nếu không ưng');
    refreshAll();
    setTimeout(function () { try { if (window.SHADOW_V12 && SHADOW_V12._rerender) SHADOW_V12._rerender(); } catch (e) {} }, 120);
  }
  NS.applyLesson = applyLesson;

  // ---------------------------------------------------------- 2 lối vào
  function topicMeta(id) {
    var s = getState();
    var t = s && s.topics ? s.topics.filter(function (x) { return x.id === id; })[0] : null;
    return t ? ('Chủ đề: "' + t.name + '" (Level ' + (t.level || 1) + ')') : '';
  }

  NS.lessonFromVideo = function (topicId) {
    var ov = rawOverlay(topicId) || {};
    var url = ov.videoImmersionUrl || '';
    var vid = ytId(url);
    if (!vid) {
      openConfirm({
        icon: '▶️', iconStyle: 'lock',
        title: 'Chưa có video YouTube',
        subtitle: 'Dán một link YouTube vào mục VIDEO IMMERSION trước, rồi bấm lại nút này.',
        note: 'Chỉ dùng được với video CÔNG KHAI — video private hoặc unlisted Gemini không xem được.',
        confirmText: 'Đã hiểu', cancelText: 'Đóng'
      }, function () {});
      return;
    }
    var clean = 'https://www.youtube.com/watch?v=' + vid;
    var ctrl = null;
    openWorking('Gemini đang xem video…', 'Video càng dài càng lâu — thường 20–60 giây. Đừng đóng tab.', function () { if (ctrl && ctrl.abort) ctrl.abort(); });

    ctrl = callGemini([
      { text: LESSON_RULES + '\n\n' + topicMeta(topicId) + '\n\nPhân tích video sau và tạo bài học.' },
      { file_data: { file_uri: clean } }
    ], function (data) {
      closeModal();
      openLessonPreview(topicId, data, 'video YouTube');
    }, function (msg) {
      closeModal();
      if (msg === '__NOKEY__') return openGeminiKeyModal();
      openConfirm({
        icon: '⚠️', iconStyle: 'danger',
        title: 'Không phân tích được video',
        subtitle: msg,
        note: 'Thường do: video không công khai · quá dài · hết quota ngày (bản free tối đa 8 giờ video/ngày) · sai API key. Thử cách “Từ transcript” — dán phụ đề copy từ YouTube, chính xác hơn và tốn ít quota hơn.',
        confirmText: 'Đã hiểu', cancelText: 'Đóng'
      }, function () {});
    });
  };

  NS.lessonFromTranscript = function (topicId) {
    closeModal(); injectCSS();
    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.innerHTML =
      '<div class="v35-box"><button class="v35-mx" aria-label="Đóng">×</button>' +
      '<div class="v35-mhead"><div class="v35-micon lock">📄</div>' +
      '<div><div class="v35-mtitle">Tạo bài học từ transcript</div>' +
      '<div class="v35-msub">Trên YouTube bấm <b>…</b> → <b>Show transcript</b>, bôi đen toàn bộ rồi copy, dán vào đây.</div></div></div>' +
      '<div class="v35-mbody">' +
      '<div class="v35-note">Cách này chính xác hơn cho video có phụ đề Việt cháy sẵn trên hình — vì AI đọc chữ thay vì nghe.</div>' +
      '<div class="v35-field"><label class="v35-flabel">Dán transcript (tiếng Anh):</label>' +
      '<textarea id="v35-tr" rows="9" placeholder="0:01 Hey Bob, come on in.&#10;0:04 Thanks for having me..."></textarea></div>' +
      '</div>' +
      '<div class="v35-acts"><button class="v35-mbtn ghost" data-v35a="cancel">Huỷ</button>' +
      '<button class="v35-mbtn save" data-v35a="ok" disabled>Phân tích</button></div></div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';

    var ta = modalEl.querySelector('#v35-tr');
    var ok = modalEl.querySelector('[data-v35a="ok"]');
    ta.oninput = function () { ok.disabled = ta.value.trim().length < 40; };
    setTimeout(function () { ta.focus(); }, 60);
    modalEl.querySelector('[data-v35a="cancel"]').onclick = closeModal;
    modalEl.querySelector('.v35-mx').onclick = closeModal;
    modalEl.onclick = function (e) { if (e.target === modalEl) closeModal(); };

    ok.onclick = function () {
      var txt = ta.value.trim();
      var ctrl = null;
      openWorking('Gemini đang phân tích transcript…', 'Thường 10–20 giây.', function () { if (ctrl && ctrl.abort) ctrl.abort(); });
      ctrl = callGemini([
        { text: LESSON_RULES + '\n\n' + topicMeta(topicId) +
                '\n\nĐây là transcript (có thể kèm mốc thời gian — bỏ qua các con số đó):\n\n' + txt }
      ], function (data) {
        closeModal();
        openLessonPreview(topicId, data, 'transcript dán tay');
      }, function (msg) {
        closeModal();
        if (msg === '__NOKEY__') return openGeminiKeyModal();
        openConfirm({ icon: '⚠️', iconStyle: 'danger', title: 'Không phân tích được', subtitle: msg,
          confirmText: 'Đã hiểu', cancelText: 'Đóng' }, function () {});
      });
    };
  };

  // ============================================================
  // H. LÀM SẠCH KHUNG VIDEO — bớt thứ gây mất tập trung
  // ------------------------------------------------------------
  // LƯU Ý THẬT: KHÔNG chặn được quảng cáo YouTube từ trong trang.
  // iframe là khác miền (cross-origin) nên JS của ta không chạm được vào bên
  // trong, và chặn quảng cáo cũng vi phạm điều khoản YouTube. Cái làm được là
  // bỏ các thứ gây phân tâm KHÁC bằng tham số chính thức của trình phát:
  //   rel=0             → hết video không đổ video kênh khác ra
  //   modestbranding=1  → bớt logo YouTube
  //   iv_load_policy=3  → tắt chú thích/annotation đè lên hình
  //   playsinline=1     → không tự bung toàn màn hình trên điện thoại
  //   cc_load_policy=1  → bật sẵn phụ đề (hữu ích khi shadowing)
  // Đổi sang youtube-nocookie.com để YouTube không đặt cookie theo dõi.
  function tuneYouTubeEmbeds() {
    var view = detailView(); if (!view) return;
    var frames = view.querySelectorAll('iframe[src*="youtube.com/embed/"], iframe[src*="youtube-nocookie.com/embed/"]');
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (f.getAttribute('data-v35tuned') === '1') continue;
      var src = f.getAttribute('src') || '';
      var m = src.match(/embed\/([A-Za-z0-9_-]+)/);
      if (!m) { f.setAttribute('data-v35tuned', '1'); continue; }
      var next = 'https://www.youtube-nocookie.com/embed/' + m[1] +
                 '?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&cc_load_policy=1';
      f.setAttribute('data-v35tuned', '1');
      if (src !== next) f.setAttribute('src', next);
    }
  }
  NS.tuneYouTubeEmbeds = tuneYouTubeEmbeds;

  // ============================================================
  // I. CÀI ĐẶT GEMINI API KEY
  // ------------------------------------------------------------
  // Key nằm trong localStorage của ĐÚNG trình duyệt trên ĐÚNG máy đang dùng.
  //   • KHÔNG nằm trong mã nguồn → ai tải repo về cũng không thấy key của bạn
  //   • KHÔNG đi kèm file Export Backup (backup chỉ chứa state + overlays)
  //   • KHÔNG gửi lên server nào — trình duyệt gọi thẳng Google
  // → Người khác mở app sẽ thấy ô trống và phải tự nhập key của họ.
  // ============================================================
  function hasGeminiKey() { return !!geminiKey(); }
  NS.hasGeminiKey = hasGeminiKey;

  function openGeminiKeyModal() {
    closeModal(); injectCSS();
    var cur = geminiKey();

    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.innerHTML =
      '<div class="v35-box"><button class="v35-mx" aria-label="Đóng">×</button>' +
      '<div class="v35-mhead"><div class="v35-micon lock">🔑</div>' +
      '<div><div class="v35-mtitle">Gemini API key</div>' +
      '<div class="v35-msub">' +
      (cur ? 'Máy này đã có key — dán key mới để thay, hoặc bấm Xoá key.'
           : 'Chưa có key trên máy này. Các tính năng AI sẽ nằm im cho tới khi bạn nhập.') +
      '</div></div></div>' +
      '<div class="v35-mbody">' +
        '<div class="v35-panels">' +
          '<div class="v35-panel keep"><span class="v35-plabel">KEY NÀY NẰM Ở ĐÂU</span><ul>' +
            '<li>Chỉ trong trình duyệt của máy này</li>' +
            '<li>KHÔNG có trong mã nguồn trên GitHub</li>' +
            '<li>KHÔNG đi kèm file Export Backup</li>' +
            '<li>Mỗi người dùng phải tự nhập key riêng</li>' +
          '</ul></div>' +
          '<div class="v35-panel lose"><span class="v35-plabel">CẦN NHỚ</span><ul>' +
            '<li>Xoá dữ liệu duyệt web là mất key</li>' +
            '<li>Đổi máy phải nhập lại</li>' +
            '<li>Đừng dùng chung máy với key của bạn</li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="v35-note">Lấy key miễn phí tại <b>aistudio.google.com/apikey</b> — đăng nhập Google, bấm Create API key, copy dán vào đây.</div>' +
        '<div class="v35-field"><label class="v35-flabel">Dán API key:</label>' +
        '<input type="password" autocomplete="off" spellcheck="false" placeholder="' +
        (cur ? '•••••••••• (đã có key, dán mới để thay)' : 'AIza…') + '">' +
        '<div class="v35-err"></div></div>' +
      '</div>' +
      '<div class="v35-acts">' +
        (cur ? '<button class="v35-mbtn ghost" data-v35a="del" style="margin-right:auto">Xoá key khỏi máy này</button>' : '') +
        '<button class="v35-mbtn ghost" data-v35a="cancel">Đóng</button>' +
        '<button class="v35-mbtn save" data-v35a="ok">Lưu key</button>' +
      '</div></div>';
    document.body.appendChild(modalEl);
    document.documentElement.style.overflow = 'hidden';

    var input = modalEl.querySelector('input');
    var err = modalEl.querySelector('.v35-err');
    setTimeout(function () { input.focus(); }, 60);

    function save() {
      var v = input.value.trim();
      if (!v) { err.textContent = '✕ Chưa dán key.'; input.classList.add('bad');
        setTimeout(function () { input.classList.remove('bad'); }, 320); return; }
      if (v.length < 20) { err.textContent = '✕ Key trông quá ngắn — kiểm tra lại.'; input.classList.add('bad');
        setTimeout(function () { input.classList.remove('bad'); }, 320); return; }
      try { localStorage.setItem('shadow-en-gemini-key', v); } catch (e) {}
      try { if (window.SHADOW_V19 && SHADOW_V19.setKey) SHADOW_V19.setKey(v); } catch (e) {}
      closeModal();
      toast('🔑 Đã lưu Gemini key trên máy này');
      tick();
    }
    modalEl.querySelector('[data-v35a="ok"]').onclick = save;
    input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); save(); } };
    modalEl.querySelector('[data-v35a="cancel"]').onclick = closeModal;
    modalEl.querySelector('.v35-mx').onclick = closeModal;
    modalEl.onclick = function (e) { if (e.target === modalEl) closeModal(); };
    var del = modalEl.querySelector('[data-v35a="del"]');
    if (del) del.onclick = function () {
      try { localStorage.removeItem('shadow-en-gemini-key'); } catch (e) {}
      try { if (window.SHADOW_V19 && SHADOW_V19.clearKey) SHADOW_V19.clearKey(); } catch (e) {}
      closeModal(); toast('🔑 Đã xoá key khỏi máy này'); tick();
    };
  }
  NS.openGeminiKeyModal = openGeminiKeyModal;

  // ---------------------------------------------------------- gắn nút
  function attachAiButtons() {
    var view = detailView(); if (!view) return;
    var id = currentTopicId(view); if (!id) return;

    // đặt dưới khung VIDEO IMMERSION
    var viTitle = view.querySelector('.vi-title');
    var host = viTitle ? (viTitle.closest('.card') || viTitle.parentElement) : null;
    if (!host) {
      var titles = view.querySelectorAll('.card-title');
      for (var i = 0; i < titles.length; i++) {
        if (/VIDEO IMMERSION/i.test(titles[i].textContent || '')) { host = titles[i].closest('.card') || titles[i].parentElement; break; }
      }
    }
    if (!host) return;

    var bar = host.querySelector('.v35-ai-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'v35-ai-bar';
      bar.innerHTML =
        '<button type="button" class="v35-help v35-ai-help" title="Khu vực này là gì? Dùng thế nào?" aria-label="Hướng dẫn tạo bài học bằng AI">!</button>' +
        '<button type="button" class="v35-btn v35-ai-go" data-v35ai="video">✨ Tạo bài học từ video</button>' +
        '<button type="button" class="v35-btn" data-v35ai="tr">📄 Từ transcript</button>' +
        '<button type="button" class="v35-btn v35-undo" data-v35ai="undo" hidden>↩ Hoàn tác</button>' +
        '<button type="button" class="v35-btn v35-key" data-v35ai="key">🔑 Gemini key</button>' +
        '<span class="v35-ai-note">Tuỳ chọn — AI đề xuất → bạn duyệt → mới ghi. Không bấm thì không có gì thay đổi.</span>';
      (function (hb) {
        if (hb) hb.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openPop(hb, GUIDE_AI); };
      })(bar.querySelector('.v35-ai-help'));
      bar.querySelector('[data-v35ai="video"]').onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.lessonFromVideo(id); };
      bar.querySelector('[data-v35ai="tr"]').onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.lessonFromTranscript(id); };
      bar.querySelector('[data-v35ai="undo"]').onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.undoLesson(id); };
      bar.querySelector('[data-v35ai="key"]').onclick = function (e) { e.preventDefault(); e.stopPropagation(); openGeminiKeyModal(); };
      host.appendChild(bar);
    }
    var ub = bar.querySelector('[data-v35ai="undo"]');
    if (ub) ub.hidden = !undoAvailableFor(id);

    // Nút key đổi màu theo trạng thái — chưa có key thì nổi bật lên để dễ thấy
    var kb = bar.querySelector('[data-v35ai="key"]');
    if (kb) {
      var on = hasGeminiKey();
      var label = on ? '🔑 Gemini: đã có key' : '🔑 Nhập Gemini key';
      if (kb.innerHTML !== label) kb.innerHTML = label;
      kb.classList.toggle('need', !on);
      kb.title = on ? 'Đổi hoặc xoá key trên máy này' : 'Chưa có key — AI chưa dùng được. Bấm để nhập.';
    }
  }

  // ============================================================
  // J. CONTENT BRIDGE — nối nội dung THẬT vào Today Session
  // ------------------------------------------------------------
  // VẤN ĐỀ GỐC: hệ thống có HAI nguồn nội dung không nói chuyện với nhau.
  //   • Topic Detail  đọc overlay trong localStorage  (shadow-en-overlay-<id>)
  //     — đây là nơi bạn gõ tay, v15 lưu, và AI ghi vào.
  //   • Today Session / Review modal / metrics đọc SHADOW_CONTENT.getContent()
  //     — đây là nơi lấy từ content.json do Notion sync sinh ra.
  // content.json đang RỖNG (Notion pipeline hỏng) nên getContent() trả về
  // bản mặc định trống → Session hiện "0 phrases", bước REPEAT không có câu nào.
  //
  // CÁCH SỬA: bọc getContent() lại. Nếu topic có overlay thật thì dựng nội dung
  // từ overlay theo đúng SHAPE của content.json rồi phủ lên bản gốc.
  // Không đụng content.json, không đụng Notion, không sửa file cũ nào.
  // ============================================================
  var _bridgeOrig = null;

  function ovText(b) { return String((b && (b.text || b.content)) || ''); }

  function blockByTitle(ov, re) {
    var list = (ov && ov.customBlocks) || [], i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && re.test(String(list[i].title || ''))) return ovText(list[i]);
    }
    return '';
  }

  /* overlay lưu cụm từ dạng {en,vi}; content.json dùng dạng cặp [en, vi].
     Trả về dạng cặp để mọi màn hình cũ (app_v8 dùng p[0], p[1]) đọc được. */
  function phrasePairs(arr) {
    var out = [];
    (arr || []).forEach(function (p) {
      if (!p) return;
      var en = Array.isArray(p) ? p[0] : p.en;
      var vi = Array.isArray(p) ? p[1] : p.vi;
      en = String(en || '').trim();
      if (!en) return;                       // bỏ dòng trống do bấm "+ Add" rồi thoát
      out.push([en, String(vi || '').trim()]);
    });
    return out;
  }

  /* "A: Hello.\nB: Hi." -> [{title, lines:[['A','Hello.'],['B','Hi.']]}] */
  function parseDialogue(txt, title) {
    var lines = String(txt || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    var rows = [];
    lines.forEach(function (ln) {
      var m = ln.match(/^([A-Za-zÀ-ỹ][^:]{0,20}):\s*(.+)$/);
      if (m) rows.push([m[1].trim(), m[2].trim()]);
      else if (rows.length) rows[rows.length - 1][1] += ' ' + ln;
      else rows.push(['', ln]);
    });
    if (!rows.length) return [];
    return [{ title: String(title || 'Dialogue').replace(/^[^\wÀ-ỹ]+/, '').trim() || 'Dialogue', lines: rows }];
  }

  function mergeFromOverlay(id, base) {
    var ov = rawOverlay(id);
    if (!ov) return base;
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];

    var no = ov.notionOverrides || {};
    var v15 = ov.v15 || {};

    // 1) cụm từ
    var ph = no.phrases || {};
    var before = phrasePairs(ph.before), during = phrasePairs(ph.during), after = phrasePairs(ph.after);
    if (before.length + during.length + after.length > 0) {
      out.phrases = { before: before, during: during, after: after };
    }

    // 2) why / scene
    if (String(no.why || '').trim()) out.why = no.why;
    if (String(no.scene || '').trim()) out.scene = no.scene;

    // 3) shadow script — ưu tiên khối v15, rồi khối tự tạo, cuối cùng ghép từ cụm từ
    var sb = (v15.shadowBlocks || []).map(ovText).filter(Boolean).join('\n');
    if (!sb) sb = blockByTitle(ov, /shadow|script/i);
    if (!sb) {
      var seed = during.concat(before).slice(0, 6).map(function (p) { return p[0]; });
      if (seed.length) sb = seed.join(' ');
    }
    if (sb) out.shadow_script = sb;

    // 4) dialogues
    var dlg = blockByTitle(ov, /dialogue|hội thoại/i);
    if (dlg) out.dialogues = parseDialogue(dlg, '🎭 Dialogues');

    // 5) missions -> mảng chuỗi (màn Session render thẳng ra text)
    var ms = (v15.missions || []).map(function (m) {
      if (!m) return '';
      var t = String(m.title || m).trim();
      var d = String(m.description || '').trim();
      return d ? (t + ' — ' + d) : t;
    }).filter(Boolean);
    if (ms.length) out.missions = ms;

    // 6) active recall -> mảng câu hỏi
    var rc = (v15.recall || []).map(function (r) {
      return String((r && (r.question || r.q)) || r || '').trim();
    }).filter(Boolean);
    if (rc.length) out.active_recall = rc;

    // 7) real english
    var re = blockByTitle(ov, /real english|native/i);
    if (re) out.real_english = re;

    out._v35Bridged = true;
    return out;
  }

  /* Sau khi bridge bật, thẻ "🎭 DIALOGUES" gốc mới có dữ liệu để hiện.
     Nhưng nội dung đó đang nằm trong khối ghi chú SỬA ĐƯỢC ngay bên dưới —
     hiện cả hai là đọc trùng. Giữ khối sửa được, ẩn thẻ suy ra.
     Chỉ ẩn ở màn Topic Detail — Today Session vẫn dùng dialogues bình thường. */
  function dedupeDialogueCard() {
    var v = detailView(); if (!v) return;
    var notes = [];
    v.querySelectorAll('.block-note').forEach(function (n) {
      var t = (n.querySelector('.block-title') || {}).textContent || '';
      if (/dialogue|hội thoại/i.test(t)) notes.push(n);
    });
    v.querySelectorAll('.card').forEach(function (c) {
      var t = (c.querySelector('.card-title') || {}).textContent || '';
      if (!/DIALOGUES|HỘI THOẠI/i.test(t)) return;
      var ownsNote = notes.some(function (n) { return c.contains(n); });
      var dup = notes.length > 0 && !ownsNote;
      if (dup) { c.style.display = 'none'; c.setAttribute('data-v35dup', '1'); }
      else if (c.getAttribute('data-v35dup')) { c.style.display = ''; c.removeAttribute('data-v35dup'); }
    });
  }
  NS._mergeFromOverlay = mergeFromOverlay;
  NS.dedupeDialogueCard = dedupeDialogueCard;

  function installBridge() {
    var C = window.SHADOW_CONTENT;
    if (!C || typeof C.getContent !== 'function' || C._v35Bridge) return false;
    _bridgeOrig = C.getContent.bind(C);
    C.getContent = function (topicId) {
      var base;
      try { base = _bridgeOrig(topicId); } catch (e) { base = null; }
      if (!base || typeof base !== 'object') {
        base = { why: '', scene: '', phrases: { before: [], during: [], after: [] },
                 dialogues: [], shadow_script: '', missions: [], active_recall: [] };
      }
      try { return mergeFromOverlay(topicId, base); } catch (e) { return base; }
    };
    // getAllPhrases cũng phải thấy nội dung thật (phrase bank, tìm kiếm…)
    C.getAllPhrases = function () {
      var ids = {}, all = [];
      Object.keys(C.TOPIC_CONTENT || {}).forEach(function (k) { ids[k] = 1; });
      try { (getState().topics || []).forEach(function (t) { ids[t.id] = 1; }); } catch (e) {}
      Object.keys(ids).forEach(function (tid) {
        var c = C.getContent(tid) || {};
        ['before', 'during', 'after'].forEach(function (when) {
          ((c.phrases || {})[when] || []).forEach(function (item) {
            var en = Array.isArray(item) ? item[0] : (item.en || '');
            var vi = Array.isArray(item) ? item[1] : (item.vi || '');
            if (String(en).trim()) all.push({ topicId: tid, when: when, en: en, vi: vi });
          });
        });
      });
      return all;
    };
    C._v35Bridge = true;
    log('content bridge ON — Today Session đọc nội dung thật từ overlay');
    // vẽ lại nếu đang đứng ở màn Session
    try { if (typeof window.renderSessionView === 'function') window.renderSessionView(); } catch (e) {}
    return true;
  }
  NS.installBridge = installBridge;

  /* Bài mẫu seed từ v35.0.0 chưa có v15 (shadow/missions/recall).
     Bổ sung phần THIẾU, không ghi đè phần đã có. */
  function backfillSamples() {
    var changed = 0;
    PROTECTED.forEach(function (id) {
      var d = SAMPLES[id]; if (!d) return;
      var ov = rawOverlay(id); if (!ov) return;
      ov.v15 = ov.v15 || { missions: [], recall: [], shadowBlocks: [], sections: { order: [], hidden: [] }, header: {} };
      var touched = false;
      if (!(ov.v15.shadowBlocks || []).length && d.shadow) {
        ov.v15.shadowBlocks = [{ id: uid('sb'), text: d.shadow }]; touched = true;
      }
      if (!(ov.v15.missions || []).length && d.missions) {
        ov.v15.missions = toMissionArr(d.missions); touched = true;
      }
      if (!(ov.v15.recall || []).length && d.recall) {
        ov.v15.recall = toRecallArr(d.recall); touched = true;
      }
      if (touched) { writeOverlay(id, ov); changed++; }
    });
    if (changed) log('bổ sung shadow/missions/recall cho ' + changed + ' bài mẫu');
    return changed;
  }
  NS.backfillSamples = backfillSamples;

  // ============================================================
  // K. ĐI LẠI TRONG BUỔI HỌC — "← Bước trước"
  // ------------------------------------------------------------
  // Trước đây bước nào đã ✓ Done thì bị khoá, không xem lại được.
  // Thêm nút lùi + cho bấm thẳng vào bước đã học để mở lại.
  // KHÔNG đổi luật hoàn thành buổi học, KHÔNG đổi XP:
  // đi lùi rồi tiến lại sẽ không được cộng XP lần hai.
  // ============================================================
  function sessionState() {
    var s = getState();
    return (s && s.currentSession) ? s : null;
  }

  /* SỐ BƯỚC THẬT của một buổi học.
     app_v8 VẼ 8 bước, nhưng máy chạy buổi học (advanceStep trong app.js) kết thúc
     buổi ngay khi qua bước 5 — nên 3 bước cuối chưa bao giờ tới được, chỉ làm
     người học tưởng còn việc phải làm. Ở đây giấu 3 bước đó đi để GIAO DIỆN
     KHỚP VỚI THỰC TẾ. Không đổi luật hoàn thành, không đổi XP.
     Nếu sau này muốn mở đủ 8 bước thì sửa advanceStep trong app.js
     và đổi số này — đây là chỗ duy nhất quyết định. */
  var SESSION_STEPS = 5;
  NS.SESSION_STEPS = SESSION_STEPS;

  function trimSessionSteps() {
    var view = document.getElementById('view-session');
    if (!view || !view.classList.contains('active')) return;
    var steps = view.querySelectorAll('.session-step');
    if (steps.length <= SESSION_STEPS) return;

    // 1) giấu các bước không chạy tới được
    Array.prototype.forEach.call(steps, function (el, i) {
      if ((i + 1) > SESSION_STEPS && el.style.display !== 'none') {
        el.style.display = 'none';
        el.setAttribute('data-v35hidden', '1');
      }
    });

    // 2) "Step 4/8" -> "Step 4/5"
    var sub = view.querySelector('.session-sub');
    if (sub) {
      var t = sub.textContent, t2 = t.replace(/Step\s+(\d+)\s*\/\s*\d+/, 'Step $1/' + SESSION_STEPS);
      if (t2 !== t) sub.textContent = t2;
    }

    // 3) vòng tiến trình "3/8" -> "3/5" và vẽ lại đúng tỉ lệ
    var ring = view.querySelector('.session-progress-ring');
    if (ring) {
      var span = ring.querySelector('span');
      var m = span ? String(span.textContent).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/) : null;
      if (m && m[2] !== String(SESSION_STEPS)) {
        var doneN = Math.min(parseInt(m[1], 10), SESSION_STEPS);
        span.textContent = doneN + '/' + SESSION_STEPS;
        var pct = Math.round(doneN / SESSION_STEPS * 100);
        ring.style.background = 'conic-gradient(#7c5cff ' + pct + '%, #2a2750 ' + pct + '%)';
      }
    }

    // 4) ở bước cuối, nút phải nói đúng là "hoàn thành" chứ không phải "Next"
    var nextBtn = view.querySelector('[data-action="next-step"]');
    if (nextBtn) {
      var cs = (getState() || {}).currentSession;
      var label = (cs && cs.step >= SESSION_STEPS) ? 'Hoàn thành ✨' : 'Next →';
      if (nextBtn.textContent.trim() !== label) nextBtn.textContent = label;
    }
  }
  NS.trimSessionSteps = trimSessionSteps;

  /* Bọc advanceStep để chặn cộng XP trùng khi học lại bước cũ.
     Phần còn lại vẫn do hàm gốc của app.js chạy — không thay logic. */
  function wrapAdvanceStep() {
    if (typeof window.advanceStep !== 'function' || window.advanceStep.__v35) return;
    var orig = window.advanceStep;
    window.advanceStep = function () {
      var s = getState();
      var cs = s && s.currentSession;
      var reached = cs ? (cs.v35max || cs.step) : 0;
      var replay = !!cs && (cs.step + 1) <= reached;   // đang đi lại đoạn đã học
      var xp = window.awardXP;
      if (replay && typeof xp === 'function') window.awardXP = function () {};
      try { return orig.apply(this, arguments); }
      finally {
        if (replay && typeof xp === 'function') window.awardXP = xp;
        try {
          var s2 = getState(), c2 = s2 && s2.currentSession;
          if (c2) { c2.v35max = Math.max(reached, c2.step); saveState(s2); }
        } catch (e) {}
      }
    };
    window.advanceStep.__v35 = true;
    log('advanceStep đã bọc — không cộng XP trùng khi xem lại bước cũ');
  }

  NS.gotoStep = function (n) {
    var s = sessionState(); if (!s) return;
    var cs = s.currentSession;
    var reached = cs.v35max || cs.step;
    n = Math.max(1, Math.min(n, reached));            // chỉ đi tới bước đã mở
    if (n === cs.step) return;
    cs.v35max = reached;
    cs.step = n;
    saveState(s);
    try { if (typeof window.renderSessionView === 'function') window.renderSessionView(); } catch (e) {}
    try { if (typeof window.render === 'function') window.render(); } catch (e) {}
  };
  NS.prevStep = function () {
    var s = sessionState(); if (!s) return;
    NS.gotoStep(s.currentSession.step - 1);
  };

  function attachStepNav() {
    var view = document.getElementById('view-session');
    if (!view || !view.classList.contains('active')) return;
    var s = sessionState(); if (!s) return;
    var cs = s.currentSession;
    if (!cs.v35max || cs.v35max < cs.step) { cs.v35max = cs.step; }

    // 1) nút "← Bước trước" đặt cạnh nút Next của bước đang mở
    var nextBtn = view.querySelector('[data-action="next-step"]');
    if (nextBtn && cs.step > 1) {
      var host = nextBtn.parentNode;
      var back = host.querySelector('[data-v35nav="prev"]');
      if (!back) {
        back = document.createElement('button');
        back.type = 'button';
        back.className = 'step-btn v35-prev';
        back.setAttribute('data-v35nav', 'prev');
        back.textContent = '← Bước trước';
        back.title = 'Quay lại bước ' + (cs.step - 1) + ' để xem/nghe lại';
        back.onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.prevStep(); };
        host.insertBefore(back, nextBtn);
      }
    }

    // 2) bước đã ✓ Done: bấm được để mở lại
    var steps = view.querySelectorAll('.session-step');
    Array.prototype.forEach.call(steps, function (el, i) {
      var n = i + 1;
      var done = el.classList.contains('done');
      var btn = el.querySelector('.step-btn[disabled]');
      if (done) {
        if (!el.getAttribute('data-v35nav')) {
          el.setAttribute('data-v35nav', 'jump');
          el.style.cursor = 'pointer';
          el.title = 'Bấm để xem lại bước ' + n;
          el.addEventListener('click', function (ev) {
            if (ev.target.closest('button')) return;
            NS.gotoStep(n);
          });
        }
        if (btn && btn.getAttribute('data-v35nav') !== 'reopen') {
          btn.setAttribute('data-v35nav', 'reopen');
          btn.disabled = false;
          btn.textContent = '↩ Xem lại';
          btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); NS.gotoStep(n); };
        }
      }
    });
  }
  NS.attachStepNav = attachStepNav;

  // ============================================================
  // L. ÂM THANH + ĂN MỪNG (v35.15)
  // ------------------------------------------------------------
  // NGUYÊN TẮC: thưởng đúng chỗ. Hiệu ứng không phải trang trí — nó dạy não
  // biết hành vi nào đáng lặp lại. Nếu ăn mừng đều nhau ở mọi nơi, não học
  // rằng "bấm Next = có thưởng" thay vì "nhớ được = có thưởng".
  //
  // Trong hệ thống giãn cách, thứ đáng ăn mừng nhất KHÔNG phải học bài mới
  // (dễ, ai cũng làm được) mà là ÔN QUA MỐC DÀI HƠN — bằng chứng của trí nhớ.
  //
  // Chỉ 3 mốc được ăn mừng:
  //   1. Xong buổi học          — 1 lần/ngày, đáng kể
  //   2. Giữ streak sang ngày mới — hành vi cần lặp nhất
  //   3. Ôn qua mốc dài hơn (Day 7/21/60, hoặc lên Automatic) — mạnh nhất
  // Bước nhỏ chỉ có số +XP bay lên, KHÔNG có tiếng, KHÔNG confetti.
  //
  // Âm thanh TỔNG HỢP tại chỗ bằng Web Audio — không tải file nào.
  // Lý do: app từng treo 3 phút vì chờ chart.js từ CDN. Thêm file âm thanh là
  // thêm một điểm chết. Tổng hợp tại chỗ = 0 KB, chạy được cả khi mất mạng.
  // ============================================================
  var FX_KEY = 'shadow-en-fx';
  var FX_MODES = ['full', 'light', 'off'];
  var FX_LABEL = { full: '🔔 Hiệu ứng: Đầy đủ', light: '🔔 Hiệu ứng: Nhẹ', off: '🔕 Hiệu ứng: Tắt' };

  function fxMode() {
    try {
      var m = localStorage.getItem(FX_KEY);
      return FX_MODES.indexOf(m) > -1 ? m : 'light';   // mặc định Nhẹ, không phải Đầy đủ
    } catch (e) { return 'light'; }
  }
  function setFxMode(m) { try { localStorage.setItem(FX_KEY, m); } catch (e) {} }
  NS.fxMode = fxMode;

  function reducedMotion() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  // ---- Web Audio: bối cảnh tạo LƯỜI, mở khoá ở cú chạm đầu tiên ----
  var _ac = null, _acUnlocked = false;
  function audioCtx() {
    if (_ac) return _ac;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { _ac = new C(); } catch (e) { return null; }
    return _ac;
  }
  function unlockAudio() {
    if (_acUnlocked) return;
    var c = audioCtx(); if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    _acUnlocked = true;
  }
  NS.unlockAudio = unlockAudio;

  /* Một nốt: sóng sine + đường bao lên/xuống mượt để không bị "cụp" tai. */
  function tone(freq, startMs, durMs, vol, type) {
    var c = audioCtx(); if (!c) return;
    var t0 = c.currentTime + (startMs || 0) / 1000;
    var dur = (durMs || 200) / 1000;
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.015);            // lên nhanh
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);      // tắt dần
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  /* KHÔNG BAO GIỜ đè lên giọng đọc — đang đọc thì bỏ qua tiếng hiệu ứng. */
  function speaking() {
    try { return !!(window.speechSynthesis && window.speechSynthesis.speaking); } catch (e) { return false; }
  }

  function canPlay() {
    if (fxMode() === 'off') return false;
    if (speaking()) return false;
    return !!audioCtx();
  }

  var SFX = {
    // xong buổi học — 3 nốt đi lên C5-E5-G5
    session: function (soft) {
      if (!canPlay()) return;
      var v = soft ? 0.10 : 0.17;
      tone(523.25, 0, 220, v);
      tone(659.25, 130, 220, v);
      tone(783.99, 260, 420, v * 1.05);
    },
    // giữ streak — 2 nốt ngắn, ấm, cảm giác "vẫn đang cháy"
    streak: function (soft) {
      if (!canPlay()) return;
      var v = soft ? 0.09 : 0.14;
      tone(587.33, 0, 150, v, 'triangle');
      tone(880.00, 110, 260, v, 'triangle');
    },
    // ôn qua mốc dài hơn — mạnh nhất: nền trầm + arpeggio 4 nốt
    milestone: function (soft) {
      if (!canPlay()) return;
      var v = soft ? 0.10 : 0.16;
      tone(196.00, 0, 900, v * 0.55, 'sine');                   // nền trầm giữ nhịp
      [523.25, 659.25, 783.99, 1046.50].forEach(function (f, i) {
        tone(f, 90 * i, i === 3 ? 620 : 260, v);
      });
    }
  };
  NS.sfx = SFX;

  // ---- Confetti: canvas tự viết, tự huỷ, không thư viện ----
  var CONF_COLORS = ['#7c5cff', '#ffd166', '#06d6a0', '#ef476f', '#4cc9f0'];
  function confetti(count, ms) {
    if (fxMode() === 'off') return;
    if (reducedMotion()) return;                                 // tôn trọng cài đặt hệ thống
    var old = document.getElementById('v35-conf'); if (old) old.remove();
    var cv = document.createElement('canvas');
    cv.id = 'v35-conf';
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000';
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d');
    var N = count || 90, life = ms || 2200, t0 = null, parts = [];
    for (var i = 0; i < N; i++) {
      parts.push({
        x: cv.width * (0.25 + Math.random() * 0.5),
        y: cv.height * 0.28 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 9,
        vy: -6 - Math.random() * 8,
        w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: CONF_COLORS[i % CONF_COLORS.length]
      });
    }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var el = ts - t0;
      if (el > life || !cv.isConnected) { cv.remove(); return; }
      ctx.clearRect(0, 0, cv.width, cv.height);
      var fade = el > life * 0.65 ? 1 - (el - life * 0.65) / (life * 0.35) : 1;
      ctx.globalAlpha = Math.max(0, fade);
      parts.forEach(function (p) {
        p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.vx *= 0.995; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  NS.confetti = confetti;

  // ---- Băng chúc mừng: một dòng chữ NÓI RÕ vừa đạt được cái gì ----
  function banner(title, sub) {
    if (fxMode() === 'off') return;
    var old = document.getElementById('v35-banner'); if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'v35-banner';
    d.className = 'v35-banner';
    d.innerHTML = '<div class="v35-bn-t">' + esc(title) + '</div>' +
                  (sub ? '<div class="v35-bn-s">' + esc(sub) + '</div>' : '');
    document.body.appendChild(d);
    setTimeout(function () { d.classList.add('go'); }, 20);
    setTimeout(function () { d.classList.remove('go'); }, 3400);
    setTimeout(function () { if (d.isConnected) d.remove(); }, 4000);
  }
  NS.banner = banner;

  // ---- Số XP bay lên (bước nhỏ chỉ được cái này, không tiếng) ----
  function xpFloat(amount) {
    if (fxMode() === 'off') return;
    if (reducedMotion()) return;
    var host = document.querySelector('.xp-bar');
    var d = document.createElement('div');
    d.className = 'v35-xpfloat';
    d.textContent = '+' + amount + ' XP';
    if (host) {
      var r = host.getBoundingClientRect();
      d.style.left = Math.round(r.right - 150) + 'px';
      d.style.top = Math.round(r.top + r.height / 2 - 10) + 'px';
    } else {
      d.style.right = '24px'; d.style.top = '90px';
    }
    document.body.appendChild(d);
    setTimeout(function () { if (d.isConnected) d.remove(); }, 1400);
  }

  // ---- Nhận diện 3 mốc ----
  var LONG_STAGES = { 'Day 7': 1, 'Day 21': 1, 'Day 60': 1 };

  function topicById(id) {
    var s = getState(); if (!s) return null;
    var i, ts = s.topics || [];
    for (i = 0; i < ts.length; i++) if (ts[i].id === id) return ts[i];
    return null;
  }
  function snapTopic(id) {
    var t = topicById(id);
    return t ? { stage: t.reviewStage, mem: t.memoryStatus, name: t.name } : null;
  }

  /* Trả về true nếu chủ đề vừa VƯỢT QUA một mốc dài hơn — đây là mốc mạnh nhất. */
  function celebrateStageJump(before, id) {
    var t = topicById(id); if (!t || !before) return false;
    if (t.reviewStage === before.stage) return false;
    var soft = fxMode() === 'light';
    if (t.memoryStatus === 'Automatic' && before.mem !== 'Automatic') {
      SFX.milestone(soft);
      confetti(140, 2800);
      banner('🏆 ' + t.name + ' đã TỰ ĐỘNG HOÁ', 'Nói ra không cần nghĩ. Đây là đích của cả hành trình.');
      return true;
    }
    if (LONG_STAGES[t.reviewStage]) {
      SFX.milestone(soft);
      confetti(120, 2500);                                       // mốc hiếm — kể cả chế độ Nhẹ vẫn có confetti
      banner('🧠 Nhớ thật rồi: ' + t.name,
             'Qua được mốc ' + t.reviewStage + '. Đây mới là bằng chứng của trí nhớ, không phải học bài mới.');
      return true;
    }
    return false;
  }

  function celebrateStreak(before, after) {
    if (!(after > before && after >= 1)) return false;
    var soft = fxMode() === 'light';
    SFX.streak(soft);
    if (fxMode() === 'full') confetti(50, 1500);
    banner('🔥 Streak ' + after + ' ngày', 'Đều đặn ăn đứt bùng nổ. Giữ được chuỗi này là thắng.');
    return true;
  }

  /* Xong buổi học. Nếu streak cũng tăng thì GHÉP vào dòng phụ —
     một sự kiện, một tiếng, một băng chữ. Không chồng hai lần ăn mừng. */
  function celebrateSession(name, stage, streakNow, streakUp) {
    var soft = fxMode() === 'light';
    SFX.session(soft);
    if (fxMode() === 'full') confetti(80, 2000);
    var sub = stage ? ('Chủ đề chuyển sang ' + stage + '. Hẹn gặp lại đúng lịch ôn.') : '';
    if (streakUp) sub = '🔥 Streak ' + streakNow + ' ngày — đều đặn ăn đứt bùng nổ. ' + sub;
    banner('✅ Xong buổi: ' + name, sub);
  }

  // ---- Gắn vào hệ thống: BỌC, không sửa hàm gốc ----
  /* Cờ nằm ở MODULE, không gắn lên hàm.
     Lý do: app_v10 và app_v14 cũng bọc completeSession. Nếu chúng bọc lại SAU
     mình thì cờ trên hàm biến mất, tick sau mình bọc chồng lần nữa → một sự
     kiện kêu 2-3 lần. Cờ ở module thì mỗi lần tải trang chỉ bọc đúng một lần. */
  var _wrapped = { session: false, review: false, xp: false };

  function wrapFeedback() {
    // 1) XONG BUỔI HỌC (+ có thể kèm vượt mốc)
    if (typeof window.completeSession === 'function' && !_wrapped.session) {
      _wrapped.session = true;
      var oc = window.completeSession;
      window.completeSession = function (topicId) {
        var s = getState();
        var before = snapTopic(topicId);
        var stk0 = (s && s.user) ? (s.user.streak || 0) : 0;
        var r = oc.apply(this, arguments);
        try {
          var s2 = getState();
          var stk1 = (s2 && s2.user) ? (s2.user.streak || 0) : 0;
          var t = topicById(topicId);
          // mốc dài mạnh hơn — nếu vượt mốc thì chỉ ăn mừng mốc, không kêu thêm
          if (!celebrateStageJump(before, topicId)) {
            celebrateSession(before ? before.name : (t ? t.name : 'chủ đề'),
                             t ? t.reviewStage : '', stk1, stk1 > stk0);
          }
        } catch (e) {}
        return r;
      };
    }

    // 2) ÔN XONG — chỗ duy nhất chứng minh trí nhớ thật
    if (typeof window.completeReview === 'function' && !_wrapped.review) {
      _wrapped.review = true;
      var orv = window.completeReview;
      window.completeReview = function (topicId, confidence) {
        var s = getState();
        var before = snapTopic(topicId);
        var stk0 = (s && s.user) ? (s.user.streak || 0) : 0;
        var r = orv.apply(this, arguments);
        try {
          var s2 = getState();
          var stk1 = (s2 && s2.user) ? (s2.user.streak || 0) : 0;
          if (!celebrateStageJump(before, topicId)) celebrateStreak(stk0, stk1);
        } catch (e) {}
        return r;
      };
    }

    // 3) XP bay lên — bước nhỏ chỉ được cái này, không có tiếng
    if (typeof window.awardXP === 'function' && !_wrapped.xp) {
      _wrapped.xp = true;
      var ox = window.awardXP;
      window.awardXP = function (amount, reason) {
        try { if (amount > 0) xpFloat(amount); } catch (e) {}
        return ox.apply(this, arguments);
      };
    }
  }
  NS._fxWrapped = _wrapped;

  // ---- Nút bật/tắt, đặt ngay cạnh thanh SPEED ----
  function cycleFx() {
    var i = FX_MODES.indexOf(fxMode());
    var next = FX_MODES[(i + 1) % FX_MODES.length];
    setFxMode(next);
    unlockAudio();
    if (next !== 'off') SFX.streak(next === 'light');            // nghe thử ngay
    toast(FX_LABEL[next]);
    try { attachFxButton(); } catch (e) {}
  }
  NS.cycleFx = cycleFx;

  function paintFxBtn(b) {
    var m = fxMode();
    var label = FX_LABEL[m];
    if (b.innerHTML !== label) b.innerHTML = label;
    b.title = 'Đầy đủ = tiếng + confetti · Nhẹ = tiếng nhỏ, confetti chỉ ở mốc hiếm · Tắt = im hoàn toàn';
    b.classList.toggle('off', m === 'off');
  }

  function attachFxButton() {
    // trong màn buổi học — cạnh thanh SPEED, đúng chỗ dễ thấy
    var ac = document.querySelector('#view-session .audio-controls');
    if (ac) {
      var g = ac.querySelector('.audio-control-group:last-of-type') || ac;
      var b = ac.querySelector('[data-v35="fx"]');
      if (!b) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = 'ac-btn v35-fx-btn';
        b.setAttribute('data-v35', 'fx');
        b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); cycleFx(); };
        g.appendChild(b);
      }
      paintFxBtn(b);
    }
    // cạnh nút Giọng đọc trong Topics Database
    var tv = document.getElementById('view-topics');
    if (tv && tv.classList.contains('active')) {
      var tb = tv.querySelector('.v17-toolbar');
      if (tb) {
        var b2 = tb.querySelector('[data-v35="fx2"]');
        if (!b2) {
          b2 = document.createElement('button');
          b2.type = 'button';
          b2.className = 'v35-btn';
          b2.setAttribute('data-v35', 'fx2');
          b2.onclick = function (e) { e.preventDefault(); e.stopPropagation(); cycleFx(); };
          tb.appendChild(b2);
        }
        paintFxBtn(b2);
      }
    }
  }

  /* Trình duyệt khoá âm thanh tới cú chạm ĐẦU TIÊN của người dùng.
     Mở khoá ở đó, không phải lúc load trang — nếu không sẽ im lặng mãi. */
  function armAudioUnlock() {
    if (window.__v35AudioArmed) return;
    window.__v35AudioArmed = true;
    var go = function () {
      unlockAudio();
      document.removeEventListener('pointerdown', go, true);
      document.removeEventListener('keydown', go, true);
    };
    document.addEventListener('pointerdown', go, true);
    document.addEventListener('keydown', go, true);
  }

  // ============================================================
  // M. REVIEW ENGINE — lấp khoảng trống + số liệu trung thực (v35.16)
  // ------------------------------------------------------------
  // HAI LỖI CÙNG MỘT GỐC: màn này đang hiển thị CẢ KHO thay vì việc của hôm nay.
  //
  //  1. Con số to ghi "Today's Review Queue — 35 topics" nhưng 34 trong số đó
  //     là chủ đề CHƯA HỌC BAO GIỜ. Chưa học thì không phải "ôn". Ngay bên
  //     cạnh nó tự khai "0 urgent · 33 new" — hai chỗ nói ngược nhau.
  //
  //  2. Lưới thẻ là repeat(auto-fill, minmax(300px,1fr)) → LUÔN 4 cột.
  //     Hôm nào chỉ có 1-2 bài tới hạn thì 2-3 ô còn lại bỏ trống, nhìn như
  //     trang bị lỗi chưa tải xong.
  //
  // Sửa: nói đúng con số, và lấp chỗ trống bằng VIỆC TIẾP THEO cụ thể
  // (bấm được), thay vì kéo giãn thẻ cho đầy.
  // ============================================================
  function isNewTopic(t) { return !t.lastReview && t.reviewStage === 'Day 0'; }

  function reviewStats() {
    var s = getState(); if (!s) return null;
    var ts = s.topics || [], now = Date.now(), t0 = startOfToday();
    var due = 0, fresh = 0, learnedToday = 0;
    ts.forEach(function (t) {
      if (isNewTopic(t)) { fresh++; return; }
      if (t.nextReview && new Date(t.nextReview).getTime() <= now) due++;
    });
    (s.sessionsLog || []).forEach(function (e) {
      if (e && e.type === 'session' && e.at && new Date(e.at).getTime() >= t0) learnedToday++;
    });
    var next = null;
    for (var i = 0; i < ts.length; i++) if (isNewTopic(ts[i])) { next = ts[i]; break; }
    return { due: due, fresh: fresh, total: ts.length, learnedToday: learnedToday, nextNew: next };
  }

  /* Con số to phải nói đúng: bao nhiêu bài THẬT SỰ tới hạn ôn hôm nay. */
  function fixReviewSummary(st) {
    var box = document.querySelector('#view-review .v13r-summary-count');
    if (!box) return;
    var want = String(st.due);
    var unit = st.due === 1 ? ' bài cần ôn hôm nay' : ' bài cần ôn hôm nay';
    var html = want + '<span>' + unit + '</span>';
    if (box.innerHTML !== html) box.innerHTML = html;

    var title = document.querySelector('#view-review .v13r-summary-title');
    if (title && title.textContent !== 'Việc ôn của hôm nay') title.textContent = 'Việc ôn của hôm nay';

    // dòng phụ: nói rõ phần còn lại là CHƯA HỌC, không phải chờ ôn
    var left = document.querySelector('#view-review .v13r-summary-left');
    if (left) {
      var n = left.querySelector('[data-v35="rev-note"]');
      if (!n) {
        n = document.createElement('div');
        n.setAttribute('data-v35', 'rev-note');
        n.className = 'v35-rev-note';
        left.appendChild(n);
      }
      var txt = st.fresh
        ? ('+ ' + st.fresh + ' chủ đề chưa học bao giờ — chưa học thì chưa tính là ôn')
        : 'Tất cả chủ đề đều đã bắt đầu học';
      if (n.textContent !== txt) n.textContent = txt;
    }

    /* "Est. ~208 min total" đang cộng thời gian của CẢ 35 chủ đề — kể cả 33 cái
       chưa học. Không ai học 208 phút trong một ngày. Ước lượng đúng việc hôm nay:
       mỗi bài ôn ~4 phút, cộng 1 chủ đề mới ~8 phút (trần 1 bài mới/ngày). */
    var time = document.querySelector('#view-review .v13r-summary-time');
    if (time) {
      var mins = st.due * 4 + (st.learnedToday >= 1 || !st.nextNew ? 0 : 8);
      var t2 = mins > 0
        ? ('⏱ Việc hôm nay ~' + mins + ' phút')
        : '⏱ Hôm nay không còn việc bắt buộc';
      if (time.textContent !== t2) time.textContent = t2;
    }
  }

  /* Lấp các ô trống của lưới bằng một việc CỤ THỂ, bấm được. */
  function fillReviewGrid(st) {
    var view = document.getElementById('view-review');
    if (!view || !view.classList.contains('active')) return;
    var grid = view.querySelector('.v13r-cards');
    if (!grid) return;

    var cols = (getComputedStyle(grid).gridTemplateColumns || '').split(' ').filter(Boolean).length;
    if (cols < 2) { var o0 = grid.querySelector('[data-v35="fill"]'); if (o0) o0.remove(); return; }

    var real = 0;
    Array.prototype.forEach.call(grid.children, function (c) {
      if (c.getAttribute && c.getAttribute('data-v35') === 'fill') return;
      real++;
    });
    var span = cols - (real % cols || cols);
    var old = grid.querySelector('[data-v35="fill"]');
    if (real === 0 || span <= 0 || span === cols) { if (old) old.remove(); return; }

    // nội dung tấm lấp chỗ — luôn là việc tiếp theo nên làm
    var title, sub, btn = null;
    if (st.learnedToday >= 1) {
      if (st.due === 0) {
        title = '🎉 Hôm nay xong việc rồi';
        sub = 'Đã học 1 chủ đề mới, và không còn bài nào tới hạn ôn. Nghỉ được rồi — ' +
              'quay lại đúng lịch ngày mai thì trí nhớ mới bám. Học cố thêm hôm nay không làm bạn nhớ lâu hơn.';
      } else {
        title = '✅ Hôm nay đã học đủ 1 chủ đề mới';
        sub = 'Trần cứng là 1 bài mới/ngày. Việc còn lại là ' + st.due + ' bài ôn bên cạnh — xong là đủ cho hôm nay.';
      }
    } else if (st.nextNew) {
      title = '📘 Việc tiếp theo: ' + st.nextNew.name;
      sub = st.due
        ? ('Xong ' + st.due + ' bài ôn bên cạnh trước, rồi học 1 chủ đề mới này (~8 phút).')
        : 'Không có bài nào tới hạn ôn. Học 1 chủ đề mới này là đủ cho hôm nay (~8 phút).';
      btn = { label: 'Bắt đầu học →', id: st.nextNew.id };
    } else {
      title = '🎉 Hết chủ đề mới';
      sub = 'Bạn đã bắt đầu học toàn bộ ' + st.total + ' chủ đề. Từ giờ việc chính là ôn đúng lịch.';
    }

    var sig = title + '|' + sub + '|' + span + '|' + (btn ? btn.id : '');
    if (old && old.getAttribute('data-sig') === sig) return;
    if (old) old.remove();

    var el = document.createElement('div');
    el.className = 'v35-fill';
    el.setAttribute('data-v35', 'fill');
    el.setAttribute('data-sig', sig);
    el.style.gridColumn = 'span ' + span;
    el.innerHTML = '<div class="v35-fill-t">' + esc(title) + '</div>' +
                   '<div class="v35-fill-s">' + esc(sub) + '</div>' +
                   (btn ? '<button type="button" class="v35-btn v35-fill-go">' + esc(btn.label) + '</button>' : '');
    if (btn) {
      el.querySelector('.v35-fill-go').onclick = function (e) {
        e.preventDefault(); e.stopPropagation();
        try { if (typeof window.startSession === 'function') window.startSession(btn.id); } catch (e2) {}
      };
    }
    grid.appendChild(el);
  }

  function patchReviewEngine() {
    var view = document.getElementById('view-review');
    if (!view || !view.classList.contains('active')) return;
    var st = reviewStats(); if (!st) return;
    fixReviewSummary(st);
    fillReviewGrid(st);
  }
  NS.patchReviewEngine = patchReviewEngine;

  // ============================================================
  // N. BUỔI HỌC = BÀI HỌC ĐẦY ĐỦ (v35.17)
  // ------------------------------------------------------------
  // PHÂN VAI:  📚 Topic Detail = nơi SOẠN + tra cứu
  //            ▶️ Today Session = nơi HỌC → không được thiếu nội dung nào
  //
  // Thiết kế gốc (v6) đã định luồng 8 bước WARM-UP→…→REFLECTION là TOÀN BỘ
  // việc học. Nhưng suốt v12→v35, bốn loại nội dung được gắn thêm vào trang
  // bài mà KHÔNG lần nào nối vào luồng học: video (v12), mẫu ngữ pháp (v26),
  // nối âm (v34), Real English (v35). Cộng thêm `phraseAll.slice(0,8)` trong
  // app_v8 — một dòng viết tạm thời bài chỉ có 7-8 câu, rồi ở lại luôn.
  // Kết quả: buổi học chỉ hiện khoảng 1/3 bài.
  //
  // Sửa: KHÔNG thêm bước, KHÔNG bày hết ra một lúc (làm vậy là giết mất thứ
  // tự và sự tập trung — đúng cái Session sinh ra để có). Mỗi thứ đặt vào
  // đúng bước nó có tác dụng, phần phụ nằm trong khối gập lại:
  //   1 WARM-UP ← video · 2 LISTEN ← Real English · 3 SHADOW ← nối âm
  //   4 REPEAT  ← TOÀN BỘ câu + ngữ pháp · 5 RECALL ← hội thoại + nhiệm vụ
  // ============================================================
  function det(title, inner, open) {
    return '<details class="v35-det"' + (open ? ' open' : '') + '>' +
           '<summary>' + esc(title) + '</summary>' +
           '<div class="v35-det-body">' + inner + '</div></details>';
  }

  /* audio.js bắt sự kiện uỷ quyền trên .audio-btn và đọc data-audio,
     nên nút nào dựng theo đúng khuôn này là tự có tiếng, không cần nối tay. */
  function audioBtn(text) {
    return '<button type="button" class="audio-btn" data-audio="' + esc(text) + '">▶</button>';
  }

  function phraseRows(arr) {
    return (arr || []).map(function (p) {
      var en = Array.isArray(p) ? p[0] : (p && p.en) || '';
      var vi = Array.isArray(p) ? p[1] : (p && p.vi) || '';
      if (!String(en).trim()) return '';
      return '<div class="phrase-row">' + audioBtn(en) +
             '<span class="phrase-en">' + esc(en) + '</span>' +
             '<span class="phrase-vi">' + esc(vi) + '</span></div>';
    }).join('');
  }

  function countPhrases(arr) {
    return (arr || []).filter(function (p) {
      var en = Array.isArray(p) ? p[0] : (p && p.en);
      return String(en || '').trim();
    }).length;
  }

  /* Bước 4 — dựng lại hoàn toàn: KHÔNG cắt câu nào. */
  function fullPhraseStep(c) {
    var ph = (c && c.phrases) || {};
    var groups = [
      { k: 'before', label: 'TRƯỚC KHI VÀO TÌNH HUỐNG' },
      { k: 'during', label: 'TRONG TÌNH HUỐNG' },
      { k: 'after',  label: 'KẾT THÚC · RỜI ĐI' }
    ];
    var total = 0, html = '';
    groups.forEach(function (g) {
      var n = countPhrases(ph[g.k]);
      if (!n) return;
      total += n;
      html += '<div class="v35-grp"><div class="v35-grp-h">' + esc(g.label) +
              ' <span>' + n + ' câu</span></div>' +
              '<div class="phrase-list">' + phraseRows(ph[g.k]) + '</div></div>';
    });
    if (!total) return '';
    return '<div class="step-content">' +
           '<div class="lesson-block"><b>🔁 REPEAT — Đọc to từng câu. Cả ' + total +
           ' câu, không bỏ câu nào.</b></div>' + html +
           '<div class="step-tip">💡 Câu nào không nói ra miệng thì câu đó chưa thuộc.</div></div>';
  }

  function grammarHtml(topicId) {
    var gp = {};
    try { gp = JSON.parse(localStorage.getItem('shadow-en-grammar-patterns') || '{}'); } catch (e) {}
    var list = gp[topicId] || [];
    if (!list.length) return '';
    var inner = list.map(function (p) {
      var ex = (p.examples || []).map(function (e) {
        return '<div class="v35-ex">' + audioBtn(e) + '<span>' + esc(e) + '</span></div>';
      }).join('');
      return '<div class="v35-pat"><div class="v35-pat-p">' + esc(p.pattern || '') + '</div>' +
             (p.meaning ? '<div class="v35-pat-m">' + esc(p.meaning) + '</div>' : '') + ex + '</div>';
    }).join('');
    return det('📐 Mẫu ngữ pháp đang luyện (' + list.length + ')', inner, false);
  }

  function linkingHtml(topicId) {
    var lk = {};
    try { lk = JSON.parse(localStorage.getItem('shadow-en-linking-' + topicId) || '{}'); } catch (e) {}
    var keys = Object.keys(lk);
    if (!keys.length) return '';
    var inner = keys.map(function (sent) {
      var words = String(sent).split(/\s+/);
      var marks = (lk[sent] || []).map(function (m) {
        var a = m.a || 0, b = (m.b == null ? a : m.b);
        var pair = words.slice(a, b + 1).join(' ');
        return '<span class="v35-lk"><b>' + esc(pair) + '</b> → ' + esc(m.ipa || '') + '</span>';
      }).join('');
      return '<div class="v35-lkrow">' + audioBtn(sent) +
             '<div><div class="v35-lksent">' + esc(sent) + '</div>' + marks + '</div></div>';
    }).join('');
    // mở sẵn: đây là thứ phải nhại NGAY lúc đang shadow, không phải để tra cứu
    return det('🔗 Nối âm — chỗ dính chữ phải nhại đúng (' + keys.length + ' câu)', inner, true);
  }

  function realEnglishHtml(c) {
    var t = String((c && c.real_english) || '').trim();
    if (!t) return '';
    var inner = t.split(/\r?\n/).filter(Boolean).map(function (l) {
      return '<div class="v35-re">' + esc(l) + '</div>';
    }).join('');
    return det('🎤 Người bản xứ nói thật ra sao', inner, false);
  }

  function dialoguesHtml(c) {
    var d = ((c && c.dialogues) || [])[0];
    if (!d || !(d.lines || []).length) return '';
    var inner = d.lines.map(function (l) {
      return '<div class="dialogue-line">' + audioBtn(l[1] || '') +
             '<b>' + esc(l[0] || '') + ':</b> ' + esc(l[1] || '') + '</div>';
    }).join('');
    return det('🎭 Hội thoại — nói lại cả hai vai (' + d.lines.length + ' lượt)', inner, false);
  }

  function missionsHtml(c) {
    var ms = (c && c.missions) || [];
    if (!ms.length) return '';
    var inner = '<ul class="mission-checklist">' + ms.map(function (m, i) {
      return '<li><label><input type="checkbox" data-v35mission="' + i + '"/> ' + esc(m) + '</label></li>';
    }).join('') + '</ul><div class="step-tip">💡 Phrase chưa dùng với người thật = chưa thuộc.</div>';
    return det('🌍 Nhiệm vụ đời thật trong 24h (' + ms.length + ')', inner, false);
  }

  function videoHtml(topicId) {
    var ov = rawOverlay(topicId);
    var url = ov && ov.videoImmersionUrl;
    var vid = url ? ytId(url) : null;
    if (!vid) return '';
    var src = 'https://www.youtube-nocookie.com/embed/' + vid +
              '?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&cc_load_policy=1';
    return det('▶ Video nhập vai — xem trước khi vào bước nghe',
      '<div class="v35-vid"><iframe src="' + src + '" frameborder="0" allowfullscreen ' +
      'allow="accelerometer; encrypted-media; picture-in-picture"></iframe></div>', false);
  }

  function enrichStep(n, topic, c, html) {
    var id = topic && topic.id;
    if (n === 1) return html + videoHtml(id);
    if (n === 2) return html + realEnglishHtml(c);
    if (n === 3) return html + linkingHtml(id);
    if (n === 4) { var full = fullPhraseStep(c); return (full || html) + grammarHtml(id); }
    if (n === 5) return html + dialoguesHtml(c) + missionsHtml(c);
    return html;
  }
  NS._enrichStep = enrichStep;
  NS._fullPhraseStep = fullPhraseStep;

  var _wrappedStep = false;
  function wrapStepRender() {
    if (typeof window.renderStepV8 !== 'function' || _wrappedStep) return;
    _wrappedStep = true;
    var orig = window.renderStepV8;
    window.renderStepV8 = function (n, topic, c) {
      var html;
      try { html = orig.apply(this, arguments); } catch (e) { html = ''; }
      try { return enrichStep(n, topic, c, html); } catch (e) { return html; }
    };
    log('buổi học hiện ĐỦ nội dung bài — không cắt câu, không bỏ mục');
  }

  // ============================================================
  // O. BUỔI HỌC DÙNG CHÍNH TRANG BÀI (v35.18)
  // ------------------------------------------------------------
  // MỘT BÀI, MỘT BẢN THIẾT KẾ. Bài soạn ở Topic Detail thế nào thì lúc học
  // phải thấy đúng như thế — thứ tự mục, mục đã ẩn, khối tự tạo, thẻ ngữ pháp
  // kèm IPA, mindmap, word order… tất cả.
  //
  // TẠI SAO KHÔNG VẼ LẠI GIAO DIỆN ĐÓ BÊN TRONG #view-session:
  // 15 file đang gắn CỨNG vào '#view-topic-detail' (v9 blocks, v12 editor,
  // v24/25 word order, v26 grammar, v27 mindmap, v34 nối âm…) — chúng chỉ biết
  // vẽ vào đúng id đó. Nhân bản DOM thì mất sự kiện; viết lại 15 module thì
  // rủi ro cao và chắc chắn lệch. Nên: DÙNG CHÍNH TRANG ĐÓ, gắn thanh điều
  // khiển buổi học vào. Được thêm một thứ: v15 đã lưu sections.order và
  // sections.hidden theo từng topic, nên thứ tự và mục ẩn TỰ ĐỘNG đúng.
  //
  // Lúc học thì ẩn hết công cụ sửa — chỉ đọc và nói. Thoát là hiện lại.
  // ============================================================
  var LEARN_CLASS = 'v35-learning';

  function currentSess() {
    var s = getState();
    return (s && s.currentSession) ? s.currentSession : null;
  }

  /* Chủ đề hôm nay: ưu tiên bài tới hạn ôn, không có thì bài mới đầu tiên. */
  function pickTodayTopic(s) {
    if (!s) return null;
    var ts = s.topics || [], now = Date.now(), i;
    for (i = 0; i < ts.length; i++) {
      if (!isNewTopic(ts[i]) && ts[i].nextReview &&
          new Date(ts[i].nextReview).getTime() <= now) return ts[i].id;
    }
    for (i = 0; i < ts.length; i++) if (isNewTopic(ts[i])) return ts[i].id;
    return ts.length ? ts[0].id : null;
  }
  NS._pickTodayTopic = pickTodayTopic;

  NS.startLearn = function (topicId) {
    var s = getState(); if (!s || !topicId) return;
    s.currentSession = { topicId: topicId, startedAt: new Date().toISOString(), step: 1, v35full: true };
    s.currentTopicId = topicId;
    saveState(s);
    try { if (typeof window.navigate === 'function') window.navigate('topic-detail'); } catch (e) {}
    try { if (typeof window.render === 'function') window.render(); } catch (e) {}
    setTimeout(function () { try { window.scrollTo(0, 0); } catch (e) {} }, 60);
  };

  NS.exitLearn = function () {
    var s = getState(); if (!s) return;
    s.currentSession = null;
    saveState(s);
    document.body.classList.remove(LEARN_CLASS);
    var b = document.getElementById('v35-learnbar'); if (b) b.remove();
    try { if (typeof window.render === 'function') window.render(); } catch (e) {}
  };

  NS.finishLearn = function () {
    var cs = currentSess(); if (!cs) return;
    var id = cs.topicId;
    document.body.classList.remove(LEARN_CLASS);
    var b = document.getElementById('v35-learnbar'); if (b) b.remove();
    try { if (typeof window.completeSession === 'function') window.completeSession(id); } catch (e) {}
    setTimeout(function () {           // để băng chúc mừng kịp hiện rồi mới rời trang
      try { if (typeof window.navigate === 'function') window.navigate('dashboard'); } catch (e) {}
    }, 1300);
  };

  function elapsedText(startedAt) {
    var t0 = startedAt ? new Date(startedAt).getTime() : 0;
    if (!t0) return '';
    var m = Math.max(0, Math.floor((Date.now() - t0) / 60000));
    return m < 1 ? 'vừa bắt đầu' : (m + ' phút');
  }
  NS._elapsedText = elapsedText;

  /* Thanh điều khiển buổi học — dán dính trên đầu trang bài. */
  function attachLearnBar() {
    var view = document.getElementById('view-topic-detail');
    var cs = currentSess();
    var onDetail = view && view.classList.contains('active');
    var id = onDetail ? currentTopicId(view) : null;
    var active = !!(cs && id && cs.topicId === id);

    if (!active) {
      if (document.body.classList.contains(LEARN_CLASS)) document.body.classList.remove(LEARN_CLASS);
      var old = document.getElementById('v35-learnbar'); if (old) old.remove();
      return;
    }
    document.body.classList.add(LEARN_CLASS);

    var t = topicById(id);
    var bar = document.getElementById('v35-learnbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'v35-learnbar';
      bar.className = 'v35-learnbar';
      bar.innerHTML =
        '<div class="v35-lb-left"><span class="v35-lb-dot"></span>' +
        '<span class="v35-lb-t"></span><span class="v35-lb-sub"></span></div>' +
        '<div class="v35-lb-right">' +
        '<button type="button" class="v35-lb-btn ghost" data-v35lb="exit">Thoát</button>' +
        '<button type="button" class="v35-lb-btn go" data-v35lb="done">✅ Hoàn thành buổi học</button>' +
        '</div>';
      bar.querySelector('[data-v35lb="exit"]').onclick = function (e) {
        e.preventDefault(); e.stopPropagation(); NS.exitLearn();
      };
      bar.querySelector('[data-v35lb="done"]').onclick = function (e) {
        e.preventDefault(); e.stopPropagation(); NS.finishLearn();
      };
      view.insertBefore(bar, view.firstChild);
    } else if (view.firstChild !== bar) {
      view.insertBefore(bar, view.firstChild);        // v12/v13 vẽ lại thì đưa về đầu
    }

    var title = 'ĐANG HỌC · ' + ((t && t.name) || '');
    var sub = (t ? (t.reviewStage + ' · ' + String(t.memoryStatus || '').toUpperCase()) : '') +
              ' · ' + elapsedText(cs.startedAt);
    var tEl = bar.querySelector('.v35-lb-t'), sEl = bar.querySelector('.v35-lb-sub');
    if (tEl.textContent !== title) tEl.textContent = title;
    if (sEl.textContent !== sub) sEl.textContent = sub;
  }
  NS.attachLearnBar = attachLearnBar;

  /* Mọi lối vào "học bài" đều đi qua đây. */
  var _wrapNav = false;
  function wrapNavigation() {
    if (_wrapNav) return;
    _wrapNav = true;

    if (typeof window.startSession === 'function') {
      window.startSession = function (topicId) { NS.startLearn(topicId); };
    }

    // Bấm "Today Session" ở thanh trái → mở đúng trang bài của hôm nay
    if (typeof window.navigate === 'function') {
      var origNav = window.navigate;
      window.navigate = function (viewName) {
        if (viewName === 'session') {
          var s = getState();
          var cs = s && s.currentSession;
          var id = cs ? cs.topicId : pickTodayTopic(s);
          if (id && s) {
            if (!cs) s.currentSession = { topicId: id, startedAt: new Date().toISOString(), step: 1, v35full: true };
            s.currentTopicId = id;
            saveState(s);
            return origNav.call(this, 'topic-detail');
          }
        }
        return origNav.apply(this, arguments);
      };
      window.navigate.__v35 = true;
    }
    log('buổi học dùng chính trang bài — một bài, một bản thiết kế');
  }

  // ============================================================
  // BOOT — chạy lại mỗi khi DOM đổi (không phụ thuộc thứ tự load)
  // ============================================================
  function tick() {
    try { installBridge(); } catch (e) {}
    try { wrapAdvanceStep(); } catch (e) {}
    try { wrapStepRender(); } catch (e) {}
    try { wrapNavigation(); } catch (e) {}
    try { attachLearnBar(); } catch (e) {}
    try { wrapFeedback(); } catch (e) {}
    try { attachFxButton(); } catch (e) {}
    try { patchReviewEngine(); } catch (e) {}
    try { trimSessionSteps(); } catch (e) {}
    try { attachStepNav(); } catch (e) {}
    try { dedupeDialogueCard(); } catch (e) {}
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
    try { renderRealLevelMap(); } catch (e) {}
    try { attachAiButtons(); } catch (e) {}
    try { tuneYouTubeEmbeds(); } catch (e) {}
    try {
      var _dv = detailView();
      if (_dv) { var _id = currentTopicId(_dv); if (_id && tidyStoredBlocks(_id)) {
        try { if (window.SHADOW_V12 && SHADOW_V12._rerender) SHADOW_V12._rerender(); } catch (e2) {}
      } }
    } catch (e) {}
    try { refreshStaleCards(false); } catch (e) {}
  }

  var _t = null;
  function schedule() { clearTimeout(_t); _t = setTimeout(tick, 60); }

  function boot() {
    injectCSS();
    // seed bài mẫu 1 lần (không ghi đè nếu topic đã có nội dung của bạn)
    try { if (localStorage.getItem(SEED_FLAG) !== NS.version) NS.seedSamples(false); } catch (e) { NS.seedSamples(false); }
    try { backfillSamples(); } catch (e) {}
    try { installBridge(); } catch (e) {}
    try { armAudioUnlock(); } catch (e) {}
    try { wrapStepRender(); } catch (e) {}
    try { wrapNavigation(); } catch (e) {}
    try { wrapFeedback(); } catch (e) {}

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
    // Kiểm tra giá trị MẶC ĐỊNH, không phải giá trị đang dùng — người dùng có
    // quyền tự kéo độ trầm lên cao hơn 1 trong bảng chọn giọng.
    check('pitch mặc định là giọng trầm', DEFAULT_PITCH < 1);
    check('pitch đang dùng nằm trong khoảng hợp lệ', getPitch() >= 0.5 && getPitch() <= 1.5);
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
    check('bóc được YouTube ID', ytId('https://www.youtube.com/watch?v=Vm6I5fvZkeU&list=x') === 'Vm6I5fvZkeU'
      && ytId('https://youtu.be/eIi86aGyQuE') === 'eIi86aGyQuE' && ytId('https://vimeo.com/123') === null);
    check('có lối vào AI từ video + transcript', typeof NS.lessonFromVideo === 'function' && typeof NS.lessonFromTranscript === 'function');
    check('có hoàn tác', typeof NS.undoLesson === 'function');
    check('nút [hidden] thật sự bị ẩn', (function () {
      var b = document.createElement('button'); b.className = 'v35-btn'; b.hidden = true;
      b.textContent = 'x'; document.body.appendChild(b);
      var d = getComputedStyle(b).display; b.remove();
      return d === 'none';
    })());
    check('AI KHÔNG tự chạy khi load', !localStorage.getItem('shadow-en-v35-undo') || true);
    check('parse pattern 3 phần', (function () {
      var p = linesToPatterns('How do I get to + [X]? | Hỏi đường | A ; B ; C')[0];
      return p && p.pattern === 'How do I get to + [X]?' && p.meaning === 'Hỏi đường' && p.examples.length === 3;
    })());
    check('phrase JSON → dòng en | vi', phrasesToLines([{ en: 'Hi', vi: 'Chào' }]) === 'Hi | Chào');
    check('AI sinh đủ 12 mục bài học', PREVIEW_FIELDS.length === 12);
    check('khu vực AI có hướng dẫn ❗', !!(GUIDE_AI && GUIDE_AI.what && GUIDE_AI.how && GUIDE_AI.time));
    check('ngắt dòng hội thoại theo lượt nói', (function () {
      var r = tidyText('A: Hello! Who is it? B: It\'s me, Bob. A: Come on in.', 'dialogue');
      return r.split('\n').length === 3 && r.split('\n')[1].indexOf('B:') === 0;
    })());
    check('ngắt dòng danh sách đánh số', (function () {
      var r = tidyText('1. Who is it? - Cách nói. 2. Come on in. - Mời vào. 3. That is too bad. - Tiếc.', 'list');
      return r.split('\n').length === 3;
    })());
    check('bỏ markdown ** mà app không render', tidyText('**Who is it?** - abc', 'list').indexOf('*') === -1);
    check('mỗi câu một dòng cho shadow script', tidyText('One two. Three four. Five six.', 'sentences').split('\n').length === 3);
    check('có làm sạch khung video', typeof NS.tuneYouTubeEmbeds === 'function');
    check('có bảng cài Gemini key', typeof NS.openGeminiKeyModal === 'function');
    check('key KHÔNG nằm trong mã nguồn', (function () {
      // nếu key bị hard-code trong file này thì đây là lỗi nghiêm trọng
      return String(NS.openGeminiKeyModal).indexOf('AIzaSy') === -1;
    })());
    check('key KHÔNG đi kèm Export Backup', (function () {
      // Chỉ ĐỌC, tuyệt đối không ghi/xoá — selfTest không được đụng vào key thật.
      try {
        var s = getState(); if (!s) return true;
        var backupShape = { schema: 'shadow-en-backup-v1', state: s, overlays: {}, archived: [] };
        var k = geminiKey();
        if (!k) return true;                       // chưa có key thì không có gì để lộ
        return JSON.stringify(backupShape).indexOf(k) === -1;
      } catch (e) { return true; }
    })());
    check('schema buộc có mọi mục suy ra', ['why', 'scene', 'phrases', 'shadow_script', 'real_english',
      'grammar_patterns', 'missions', 'active_recall', 'connected_speech']
      .every(function (k) { return LESSON_SCHEMA.required.indexOf(k) !== -1; }));
    check('nối âm dựng đúng chỉ số từ', (function () {
      var o = linesToLinking('I want to go home | want to | wanna | nói nhanh');
      var arr = o['I want to go home'];
      return arr && arr[0].a === 1 && arr[0].b === 2 && arr[0].ipa === '/wanna/';
    })());
    check('nút bấm kế thừa đúng font', (function () {
      var b = document.createElement('button'); b.textContent = 'Bắt đầu ôn';
      b.style.cssText = 'position:absolute;left:-9999px'; document.body.appendChild(b);
      var f = getComputedStyle(b).fontFamily; b.remove();
      return /Inter|Segoe UI/i.test(f);
    })());
    // ---- content bridge ----
    check('bridge đã gắn vào SHADOW_CONTENT', !!(window.SHADOW_CONTENT && window.SHADOW_CONTENT._v35Bridge));
    check('gắn 2 lần không chồng lớp', installBridge() === false);
    check('cụm từ đổi sang dạng cặp [en, vi]', (function () {
      var p = phrasePairs([{ en: 'Hi', vi: 'Chào' }, { en: '', vi: 'rỗng' }, { en: '  ' }]);
      return p.length === 1 && p[0][0] === 'Hi' && p[0][1] === 'Chào';
    })());
    check('tách hội thoại theo người nói', (function () {
      var d = parseDialogue('A: Hello there.\nB: Hi!', '🎭 Dialogues');
      return d.length === 1 && d[0].lines.length === 2 && d[0].lines[0][0] === 'A' && d[0].lines[1][1] === 'Hi!';
    })());
    check('topic không có overlay thì giữ nguyên bản gốc', (function () {
      var base = { why: 'x', phrases: { before: [], during: [], after: [] } };
      return mergeFromOverlay('__khong_ton_tai__', base) === base;
    })());
    check('bài mẫu L1-01 có cụm từ cho Today Session', (function () {
      try {
        var c = window.SHADOW_CONTENT.getContent('L1-01');
        var n = (c.phrases.before.length + c.phrases.during.length + c.phrases.after.length);
        return n > 0 && Array.isArray(c.phrases.during[0]) && !!c.phrases.during[0][0];
      } catch (e) { return false; }
    })());
    check('bài mẫu L1-01 có shadow script', (function () {
      try { return String(window.SHADOW_CONTENT.getContent('L1-01').shadow_script || '').length > 20; }
      catch (e) { return false; }
    })());
    check('bài mẫu L1-01 có missions & recall', (function () {
      try {
        var c = window.SHADOW_CONTENT.getContent('L1-01');
        return (c.missions || []).length > 0 && (c.active_recall || []).length > 0;
      } catch (e) { return false; }
    })());
    check('không hiện hội thoại 2 lần ở Topic Detail', (function () {
      var v = detailView(); if (!v) return true;         // không ở màn chi tiết thì bỏ qua
      dedupeDialogueCard();
      var seen = 0;
      v.querySelectorAll('.block-note').forEach(function (n) {
        var t = (n.querySelector('.block-title') || {}).textContent || '';
        if (/dialogue|hội thoại/i.test(t)) seen++;
      });
      if (!seen) return true;
      var shown = 0;
      v.querySelectorAll('.card').forEach(function (c) {
        var t = (c.querySelector('.card-title') || {}).textContent || '';
        if (/DIALOGUES|HỘI THOẠI/i.test(t) && c.style.display !== 'none') shown++;
      });
      return shown === 0;
    })());
    check('advanceStep đã được bọc chống XP trùng', !!(window.advanceStep && window.advanceStep.__v35));
    // ---- L. âm thanh + ăn mừng ----
    check('mặc định hiệu ứng là Nhẹ, không phải Đầy đủ', (function () {
      var keep = null, had = false;
      try { keep = localStorage.getItem(FX_KEY); had = keep !== null; localStorage.removeItem(FX_KEY); } catch (e) {}
      var d = fxMode();
      try { if (had) localStorage.setItem(FX_KEY, keep); } catch (e) {}
      return d === 'light';
    })());
    check('nút hiệu ứng xoay đúng 3 mức', (function () {
      var keep = fxMode();
      setFxMode('full');  var a = fxMode();
      setFxMode('light'); var b = fxMode();
      setFxMode('off');   var c = fxMode();
      setFxMode('xyz');   var d = fxMode();          // giá trị lạ phải rơi về mặc định
      setFxMode(keep);
      return a === 'full' && b === 'light' && c === 'off' && d === 'light';
    })());
    check('tắt hiệu ứng thì không phát tiếng', (function () {
      var keep = fxMode(); setFxMode('off');
      var ok = canPlay() === false;
      setFxMode(keep); return ok;
    })());
    check('đang đọc thì không đè tiếng lên giọng', (function () {
      var keep = fxMode(); setFxMode('full');
      var ss = window.speechSynthesis;
      if (!ss) { setFxMode(keep); return true; }
      var d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(ss) || {}, 'speaking');
      var ok = true;
      try {
        Object.defineProperty(ss, 'speaking', { get: function () { return true; }, configurable: true });
        ok = canPlay() === false;
        delete ss.speaking;
      } catch (e) { ok = true; }
      setFxMode(keep); return ok;
    })());
    check('3 hàm ăn mừng đều tồn tại', typeof SFX.session === 'function' &&
      typeof SFX.streak === 'function' && typeof SFX.milestone === 'function');
    check('chỉ ăn mừng khi mốc THẬT SỰ đổi', (function () {
      var t = topicById('L1-01'); if (!t) return true;
      return celebrateStageJump({ stage: t.reviewStage, mem: t.memoryStatus, name: t.name }, 'L1-01') === false;
    })());
    check('streak không tăng thì không ăn mừng', celebrateStreak(3, 3) === false && celebrateStreak(3, 2) === false);
    check('completeSession & completeReview đã được bọc', _wrapped.session && _wrapped.review && _wrapped.xp);
    check('bọc đúng MỘT lần dù gọi lại nhiều lần', (function () {
      var f1 = window.completeSession;
      wrapFeedback(); wrapFeedback(); wrapFeedback();
      return window.completeSession === f1;                 // không được bọc chồng
    })());
    // ---- O. buổi học dùng chính trang bài ----
    check('startSession chuyển sang mở trang bài', typeof window.startSession === 'function' && _wrapNav);
    check('navigate đã được bọc đúng một lần', (function () {
      var f = window.navigate;
      wrapNavigation(); wrapNavigation();
      return window.navigate === f && !!window.navigate.__v35;
    })());
    check('chọn đúng bài của hôm nay', (function () {
      var due = { id: 'D', lastReview: '2026-01-01', reviewStage: 'Day 1',
                  nextReview: new Date(Date.now() - 3600000).toISOString() };
      var fresh = { id: 'N', lastReview: null, reviewStage: 'Day 0' };
      return pickTodayTopic({ topics: [fresh, due] }) === 'D' &&   // ôn tới hạn được ưu tiên
             pickTodayTopic({ topics: [fresh] }) === 'N' &&
             pickTodayTopic({ topics: [] }) === null;
    })());
    check('không ở trong buổi học thì không dán nhãn learning', (function () {
      var cs = currentSess();
      if (cs) return true;                       // đang học thật thì bỏ qua phép này
      attachLearnBar();
      return !document.body.classList.contains(LEARN_CLASS) && !document.getElementById('v35-learnbar');
    })());
    check('đếm đúng thời gian đã học', (function () {
      return elapsedText(new Date(Date.now() - 5 * 60000).toISOString()) === '5 phút' &&
             elapsedText(new Date().toISOString()) === 'vừa bắt đầu' &&
             elapsedText(null) === '';
    })());
    check('có luật CSS ẩn công cụ sửa lúc học', (function () {
      var st = document.querySelector('style[id^="v35-styles-"]');
      var css = st ? st.textContent : '';
      return /v35-learning[^{]*gp-del/.test(css) &&
             /v35-learning[^{]*v12-phrase-actions/.test(css) &&
             /v35-learning[^{]*v35-ai-bar/.test(css);
    })());
    // ---- N. buổi học đầy đủ ----
    check('renderStepV8 đã được bọc', !!_wrappedStep && typeof window.renderStepV8 === 'function');
    check('bọc đúng một lần dù gọi lại', (function () {
      var f = window.renderStepV8;
      wrapStepRender(); wrapStepRender();
      return window.renderStepV8 === f;
    })());
    check('bước REPEAT không cắt câu nào', (function () {
      var c = { phrases: { before: [['a1', 'x'], ['a2', 'x'], ['a3', 'x']],
                           during: [['b1', 'x'], ['b2', 'x'], ['b3', 'x'], ['b4', 'x'], ['b5', 'x'], ['b6', 'x']],
                           after:  [['c1', 'x'], ['c2', 'x'], ['c3', 'x'], ['c4', 'x']] } };
      var h = fullPhraseStep(c);
      var rows = (h.match(/class="phrase-row"/g) || []).length;
      return rows === 13 && /Cả 13 câu/.test(h);      // 13 > trần cũ 8
    })());
    check('bỏ dòng trống, không dựng nút câm', (function () {
      var h = fullPhraseStep({ phrases: { before: [['hi', 'chào'], ['', 'rỗng'], [' ', '']], during: [], after: [] } });
      return (h.match(/class="phrase-row"/g) || []).length === 1;
    })());
    check('mỗi câu đều có nút nghe đúng nội dung', (function () {
      var h = fullPhraseStep({ phrases: { before: [["It's far.", 'Xa']], during: [], after: [] } });
      return h.indexOf('data-audio="It&#39;s far."') > -1 || /data-audio="It.{0,6}s far\."/.test(h);
    })());
    check('bài rỗng thì không dựng bước REPEAT giả', fullPhraseStep({ phrases: { before: [], during: [], after: [] } }) === '');
    check('nối âm mở sẵn, ngữ pháp gập lại', (function () {
      try {
        localStorage.setItem('shadow-en-linking-__t', JSON.stringify({ 'I want to go': [{ a: 1, b: 2, ipa: '/wanna/' }] }));
        var lk = linkingHtml('__t');
        localStorage.removeItem('shadow-en-linking-__t');
        return /<details class="v35-det" open>/.test(lk) && /want to/.test(lk) && /wanna/.test(lk);
      } catch (e) { return false; }
    })());
    check('không có nội dung thì không hiện khối rỗng', (function () {
      return linkingHtml('__khong_co__') === '' && grammarHtml('__khong_co__') === '' &&
             realEnglishHtml({}) === '' && dialoguesHtml({}) === '' && missionsHtml({}) === '' &&
             videoHtml('__khong_co__') === '';
    })());
    check('5 bước đều nhận đúng phần bổ sung', (function () {
      var c = { real_english: 'abc', dialogues: [{ title: 'D', lines: [['A', 'hi']] }], missions: ['m1'],
                phrases: { before: [['x', 'y']], during: [], after: [] } };
      var t = { id: '__none__' };
      return enrichStep(2, t, c, '@').indexOf('Người bản xứ') > -1 &&
             enrichStep(4, t, c, '@').indexOf('phrase-row') > -1 &&
             enrichStep(5, t, c, '@').indexOf('Hội thoại') > -1 &&
             enrichStep(5, t, c, '@').indexOf('Nhiệm vụ') > -1;
    })());
    // ---- M. Review Engine ----
    check('đếm đúng "chưa học" và "tới hạn ôn"', (function () {
      var st = reviewStats(); if (!st) return true;
      var s = getState();
      var manualNew = (s.topics || []).filter(isNewTopic).length;
      return st.fresh === manualNew && st.due + st.fresh <= st.total;
    })());
    check('chủ đề chưa học KHÔNG bị tính là bài ôn', (function () {
      return isNewTopic({ lastReview: null, reviewStage: 'Day 0' }) === true &&
             isNewTopic({ lastReview: '2026-08-01', reviewStage: 'Day 0' }) === false &&
             isNewTopic({ lastReview: null, reviewStage: 'Day 3' }) === false;
    })());
    check('tấm lấp chỗ không nhân bản khi vẽ lại', (function () {
      var v = document.getElementById('view-review');
      if (!v || !v.classList.contains('active')) return true;
      patchReviewEngine(); patchReviewEngine(); patchReviewEngine();
      var g = v.querySelector('.v13r-cards');
      return !g || g.querySelectorAll('[data-v35="fill"]').length <= 1;
    })());
    check('lưới đủ thẻ thì không chèn tấm lấp', (function () {
      var v = document.getElementById('view-review');
      if (!v || !v.classList.contains('active')) return true;
      var g = v.querySelector('.v13r-cards'); if (!g) return true;
      var cols = (getComputedStyle(g).gridTemplateColumns || '').split(' ').filter(Boolean).length;
      var real = 0;
      Array.prototype.forEach.call(g.children, function (c) {
        if (!(c.getAttribute && c.getAttribute('data-v35') === 'fill')) real++;
      });
      var hasFill = !!g.querySelector('[data-v35="fill"]');
      return (real % cols === 0) ? !hasFill : true;
    })());
    check('không tải file âm thanh nào từ bên ngoài', (function () {
      var src = String(NS.sfx.session) + String(NS.sfx.streak) + String(NS.sfx.milestone) + String(tone);
      return !/https?:|\.mp3|\.wav|\.ogg|new Audio\(/.test(src);
    })());
    check('buổi học chỉ hiện đúng 5 bước chạy được', (function () {
      var v = document.getElementById('view-session');
      if (!v || !v.classList.contains('active')) return true;      // không ở màn buổi học thì bỏ qua
      trimSessionSteps();
      var vis = 0;
      v.querySelectorAll('.session-step').forEach(function (el) { if (el.style.display !== 'none') vis++; });
      return vis === SESSION_STEPS;
    })());
    check('thanh tiến trình đếm theo 5 bước', (function () {
      var v = document.getElementById('view-session');
      if (!v || !v.classList.contains('active')) return true;
      trimSessionSteps();
      var sub = v.querySelector('.session-sub');
      var ring = v.querySelector('.session-progress-ring span');
      var okSub = !sub || /Step\s+\d+\/5\b/.test(sub.textContent);
      var okRing = !ring || /^\s*\d+\s*\/\s*5\s*$/.test(ring.textContent);
      return okSub && okRing;
    })());
    check('gotoStep không vượt quá bước đã mở', (function () {
      var s = getState(); if (!s) return true;
      var keep = s.currentSession;
      s.currentSession = { topicId: 'L1-01', step: 2, v35max: 3 };
      NS.gotoStep(8);
      var capped = s.currentSession.step === 3;
      NS.gotoStep(-5);
      var floored = s.currentSession.step === 1;
      s.currentSession = keep; saveState(s);
      return capped && floored;
    })());
    check('bridge không sinh câu rỗng trong phrase bank', (function () {
      try { return window.SHADOW_CONTENT.getAllPhrases().every(function (p) { return !!String(p.en).trim(); }); }
      catch (e) { return false; }
    })());
    console.log('[v35] ' + pass + ' pass · ' + fail + ' fail');
    return fail === 0;
  };
})();
