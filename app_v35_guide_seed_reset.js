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
  NS.version = '35.0.0';

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

  // ---------------------------------------------------------- CSS
  function injectCSS() {
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

      '.v35-modal{position:fixed;inset:0;z-index:100000;background:rgba(6,4,18,.72);',
      'display:flex;align-items:center;justify-content:center;padding:20px}',
      '.v35-box{width:min(420px,100%);background:#171331;border:1px solid rgba(255,255,255,.14);',
      'border-radius:16px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.6);color:#e9e6f7}',
      '.v35-box h3{margin:0 0 8px;font-size:16px;color:#fff}',
      '.v35-box p{margin:0 0 14px;font-size:13px;line-height:1.6;color:#b8b2d0}',
      '.v35-box input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.18);',
      'background:rgba(0,0,0,.28);color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box}',
      '.v35-box input:focus{outline:none;border-color:#a78bfa}',
      '.v35-err{color:#fca5a5;font-size:12px;margin-top:8px;min-height:16px}',
      '.v35-acts{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}'
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
  function hasContent(ov) {
    if (!ov) return false;
    var ph = (ov.notionOverrides || {}).phrases || {};
    var n = (ph.before || []).length + (ph.during || []).length + (ph.after || []).length;
    return n > 0;
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
      ov.v15.sections = ov.v15.sections || { order: [], hidden: [] };
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

  var modalEl = null;
  function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } }

  function askPassword(topicName, onOk) {
    closeModal(); injectCSS();
    modalEl = document.createElement('div');
    modalEl.className = 'v35-modal';
    modalEl.innerHTML =
      '<div class="v35-box">' +
      '<h3>🔒 Bài mẫu được bảo vệ</h3>' +
      '<p>"' + esc(topicName) + '" là bài mẫu của hệ thống — dùng để người mới xem cách một bài học đầy đủ trông như thế nào.<br><br>Nhập mật khẩu để xoá:</p>' +
      '<input type="password" autocomplete="off" placeholder="Mật khẩu">' +
      '<div class="v35-err"></div>' +
      '<div class="v35-acts">' +
      '<button class="v35-btn" data-a="cancel">Huỷ</button>' +
      '<button class="v35-btn warn" data-a="ok">Xác nhận xoá</button>' +
      '</div></div>';
    document.body.appendChild(modalEl);

    var input = modalEl.querySelector('input');
    var err = modalEl.querySelector('.v35-err');
    input.focus();

    function submit() {
      if (input.value === PASSWORD) { closeModal(); onOk(); }
      else { err.textContent = '❌ Mật khẩu không đúng.'; input.value = ''; input.focus(); }
    }
    modalEl.querySelector('[data-a="ok"]').onclick = submit;
    modalEl.querySelector('[data-a="cancel"]').onclick = closeModal;
    input.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
    modalEl.onclick = function (e) { if (e.target === modalEl) closeModal(); };
  }

  function wrapDelete() {
    var V17 = window.SHADOW_V17;
    if (!V17 || typeof V17.deleteTopic !== 'function') return false;
    if (V17._v35Wrapped) return true;

    var orig = V17.deleteTopic;
    V17.deleteTopic = function (id, fromArchive) {
      if (!isProtected(id)) return orig.call(V17, id, fromArchive);
      var s = getState();
      var t = s && s.topics ? s.topics.filter(function (x) { return x.id === id; })[0] : null;
      askPassword(t ? t.name : id, function () { orig.call(V17, id, fromArchive); });
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
    if (!confirm(
      'Reset ngày bắt đầu cho "' + t.name + '"?\n\n' +
      '• Tiến trình về Day 0, mastery 0%, số session 0\n' +
      '• NỘI DUNG BÀI HỌC giữ nguyên (cụm từ, missions, ghi chú…)\n' +
      '• XP và streak toàn hệ thống không đổi\n\n' +
      'Hành động này không hoàn tác được.'
    )) return false;

    blankTopic(t);
    saveState(s);
    try { s.sessionsLog = (s.sessionsLog || []).filter(function (r) { return r && r.topicId !== id; }); saveState(s); } catch (e) {}
    toast('🔄 Đã reset "' + t.name + '" về Day 0');
    refreshAll();
    return true;
  };

  NS.resetAll = function () {
    var s = getState(); if (!s) return false;
    if (!confirm(
      '⚠️ RESET TOÀN HỆ THỐNG — bắt đầu lại từ đầu\n\n' +
      'SẼ XOÁ:\n' +
      '• Tiến trình của TẤT CẢ topic → về Day 0\n' +
      '• XP về 0, Level về 1, Streak về 0\n' +
      '• Toàn bộ lịch sử buổi học\n\n' +
      'SẼ GIỮ NGUYÊN:\n' +
      '• Toàn bộ nội dung bài học và 2 bài mẫu\n' +
      '• Các topic bạn tự tạo\n\n' +
      'Tiếp tục?'
    )) return false;

    var confirmWord = prompt('Gõ chính xác:  RESET  rồi bấm OK để xác nhận.');
    if (String(confirmWord || '').trim().toUpperCase() !== 'RESET') { toast('Đã huỷ — không thay đổi gì.'); return false; }

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
    return true;
  };

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
  // BOOT — chạy lại mỗi khi DOM đổi (không phụ thuộc thứ tự load)
  // ============================================================
  function tick() {
    try { injectCSS(); } catch (e) {}
    try { attachHelp(); } catch (e) {}
    try { attachResetButtons(); } catch (e) {}
    try { markProtectedCards(); } catch (e) {}
    try { wrapDelete(); } catch (e) {}
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
    check('đã bọc deleteTopic', !!(window.SHADOW_V17 && window.SHADOW_V17._v35Wrapped));
    console.log('[v35] ' + pass + ' pass · ' + fail + ' fail');
    return fail === 0;
  };
})();
