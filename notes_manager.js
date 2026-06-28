// ============================================================================
// SHADOW ENGLISH — NOTES MANAGER ("Second Brain") v1.0
// ----------------------------------------------------------------------------
// Module ghi chú tự chứa hoàn toan. KHONG dung file loi.
//   - Them muc "📝 Notes" cuoi sidebar (duoi RESOURCES).
//   - View rieng #view-notes, tai dung window.navigate('notes') (generic).
//   - DB RIENG: localStorage key 'shadow-en-notes-v1' — KHONG dung den
//     state hoc tap / Learning Engine / Review / Topics.
//   - CRUD + Pin + Drag&Drop sap xep + Tags (nhieu) + Loc theo tag + Search
//     + 4 view (All / Pinned / By Tag / Recently Updated) + card dark theme.
//   - Rich text nhe: contenteditable + B/I/U/list (execCommand).
//
// NGUYEN TAC: file rieng + 1 the <script> (DNA #4). Khi sua -> bump ?v= trong
//   index.html VA bump CACHE trong sw.js (CANH BAO #0).
// KY THUAT: KHONG dung MutationObserver ghi DOM lap (CANH BAO #8) -> dung
//   interval nhe + thao tac idempotent.
// ============================================================================
(function setupNotesManager() {
  'use strict';
  var NS = window.SHADOW_NOTES = window.SHADOW_NOTES || {};
  NS.version = '1.0.1';
  var KEY = 'shadow-en-notes-v1';

  // ---------- data ----------
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function save(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {} }
  var notes = load();
  function persist() { save(notes); }

  // ---------- helpers ----------
  function uid() { return 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function nowISO() { return new Date().toISOString(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function stripHtml(h) { var d = document.createElement('div'); d.innerHTML = h || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  function relTime(iso) {
    if (!iso) return '';
    var d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return 'vừa xong';
    if (d < 3600) return Math.floor(d / 60) + ' phút trước';
    if (d < 86400) return Math.floor(d / 3600) + ' giờ trước';
    if (d < 604800) return Math.floor(d / 86400) + ' ngày trước';
    try { return new Date(iso).toLocaleDateString('vi-VN'); } catch (e) { return iso.slice(0, 10); }
  }
  var TAG_COLORS = {
    'grammar': '#7c5cff', 'vocabulary': '#22c55e', 'pronunciation': '#ff8a3d',
    'business': '#3b82f6', 'level 1': '#3b82f6', 'level 2': '#22c55e',
    'level 3': '#a855f7', 'ideas': '#ec4899', 'idea': '#ec4899'
  };
  var PALETTE = ['#7c5cff', '#22c55e', '#ff8a3d', '#3b82f6', '#ec4899', '#a855f7', '#14b8a6', '#eab308'];
  function tagColor(t) {
    var k = String(t || '').toLowerCase().trim();
    if (TAG_COLORS[k]) return TAG_COLORS[k];
    var h = 0; for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }
  var SUGGESTED_TAGS = ['Grammar', 'Vocabulary', 'Pronunciation', 'Business', 'Level 1', 'Level 2', 'Level 3', 'Ideas'];

  // ---------- view state ----------
  var view = 'all';            // all | pinned | recent | bytag
  var query = '';
  var tagFilter = '';          // active tag for filtering / By Tag view
  var dragId = null;

  function allTags() {
    var s = {}; notes.forEach(function (n) { (n.tags || []).forEach(function (t) { s[t] = 1; }); });
    return Object.keys(s).sort();
  }

  function visibleNotes() {
    var list = notes.slice();
    var q = query.trim().toLowerCase();
    if (q) list = list.filter(function (n) {
      return (n.title || '').toLowerCase().indexOf(q) >= 0
        || stripHtml(n.content).toLowerCase().indexOf(q) >= 0
        || (n.tags || []).join(' ').toLowerCase().indexOf(q) >= 0;
    });
    if (tagFilter) list = list.filter(function (n) { return (n.tags || []).indexOf(tagFilter) >= 0; });
    if (view === 'pinned') list = list.filter(function (n) { return n.pinned; });
    if (view === 'recent') {
      list.sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
    } else {
      // all / pinned / bytag: pinned len dau, roi theo order
      list.sort(function (a, b) {
        if (!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        return (a.order || 0) - (b.order || 0);
      });
    }
    return list;
  }

  // ---------- render ----------
  function q1(sel) { var v = document.getElementById('view-notes'); return v ? v.querySelector(sel) : null; }

  function renderTabs() {
    var el = q1('.nm-tabs'); if (!el) return;
    var tabs = [['all', '📄 Tất cả'], ['pinned', '📌 Ghim'], ['recent', '🕒 Mới cập nhật'], ['bytag', '🏷 Theo tag']];
    el.innerHTML = tabs.map(function (t) {
      return '<button class="nm-tab' + (view === t[0] ? ' on' : '') + '" data-nmview="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
  }

  function renderTagBar() {
    var el = q1('.nm-tagbar'); if (!el) return;
    var tags = allTags();
    if (!tags.length) { el.innerHTML = '<span class="nm-muted">Chưa có tag nào.</span>'; return; }
    var html = '<button class="nm-chip' + (!tagFilter ? ' on' : '') + '" data-nmtag="">Tất cả</button>';
    html += tags.map(function (t) {
      var c = tagColor(t);
      return '<button class="nm-chip' + (tagFilter === t ? ' on' : '') + '" data-nmtag="' + esc(t) + '" style="--c:' + c + '">' + esc(t) + '</button>';
    }).join('');
    el.innerHTML = html;
  }

  function card(n) {
    var preview = stripHtml(n.content).slice(0, 160);
    var tags = (n.tags || []).map(function (t) {
      return '<span class="nm-badge" style="--c:' + tagColor(t) + '">' + esc(t) + '</span>';
    }).join('');
    var draggable = (view === 'all') ? ' draggable="true"' : '';
    return '<div class="nm-card' + (n.pinned ? ' pinned' : '') + '" data-id="' + n.id + '"' + draggable + '>'
      + '<button class="nm-pin' + (n.pinned ? ' on' : '') + '" data-act="pin" data-id="' + n.id + '" title="Ghim">' + (n.pinned ? '📌' : '📍') + '</button>'
      + '<div class="nm-card-title">' + (esc(n.title) || '<span class="nm-muted">(Không tiêu đề)</span>') + '</div>'
      + (preview ? '<div class="nm-card-prev">' + esc(preview) + '</div>' : '<div class="nm-card-prev nm-muted">(trống)</div>')
      + (tags ? '<div class="nm-card-tags">' + tags + '</div>' : '')
      + '<div class="nm-card-foot"><span class="nm-time">🕒 ' + esc(relTime(n.updatedAt)) + '</span>'
      + '<span class="nm-card-actions"><button class="nm-mini" data-act="edit" data-id="' + n.id + '">✏️ Sửa</button>'
      + '<button class="nm-mini danger" data-act="del" data-id="' + n.id + '">🗑</button></span></div>'
      + '</div>';
  }

  function renderList() {
    renderTabs(); renderTagBar();
    var grid = q1('.nm-grid'); if (!grid) return;
    var list = visibleNotes();
    if (!list.length) {
      grid.innerHTML = '<div class="nm-empty">📝 Chưa có ghi chú nào' + (query || tagFilter ? ' khớp bộ lọc' : '') + '.<br><span class="nm-muted">Bấm “+ Ghi chú mới” để bắt đầu Second Brain của bạn.</span></div>';
      return;
    }
    grid.innerHTML = list.map(card).join('');
  }

  // ---------- editor (modal) ----------
  var editingId = null;
  function openEditor(id) {
    editingId = id || null;
    var n = id ? notes.filter(function (x) { return x.id === id; })[0] : { title: '', content: '', tags: [] };
    if (!n) return;
    var ov = document.createElement('div'); ov.className = 'nm-overlay'; ov.id = 'nm-editor';
    ov.innerHTML = '<div class="nm-modal"><div class="nm-modal-top"><b>' + (id ? '✏️ Sửa ghi chú' : '📝 Ghi chú mới') + '</b><button class="nm-x" data-nm="close">×</button></div>'
      + '<div class="nm-modal-body">'
      + '<input class="nm-input nm-title-in" placeholder="Tiêu đề..." value="' + esc(n.title) + '">'
      + '<div class="nm-rt-toolbar"><button data-cmd="bold" title="Đậm"><b>B</b></button><button data-cmd="italic" title="Nghiêng"><i>I</i></button><button data-cmd="underline" title="Gạch chân"><u>U</u></button><button data-cmd="insertUnorderedList" title="Danh sách">• Danh sách</button></div>'
      + '<div class="nm-rt" contenteditable="true">' + (n.content || '') + '</div>'
      + '<div class="nm-tags-edit"><div class="nm-tags-chosen"></div>'
      + '<input class="nm-input nm-tag-in" placeholder="Thêm tag rồi Enter...">'
      + '<div class="nm-tag-suggest"></div></div>'
      + '</div>'
      + '<div class="nm-modal-foot"><button class="nm-btn ghost" data-nm="close">Hủy</button><button class="nm-btn solid" data-nm="save">💾 Lưu</button></div></div>';
    document.body.appendChild(ov);
    var chosen = n.tags ? n.tags.slice() : [];
    function renderChosen() {
      ov.querySelector('.nm-tags-chosen').innerHTML = chosen.map(function (t) {
        return '<span class="nm-badge" style="--c:' + tagColor(t) + '">' + esc(t) + '<button class="nm-tagdel" data-deltag="' + esc(t) + '">×</button></span>';
      }).join('') || '<span class="nm-muted">Chưa có tag</span>';
      ov.querySelector('.nm-tag-suggest').innerHTML = SUGGESTED_TAGS.filter(function (t) { return chosen.indexOf(t) < 0; }).map(function (t) {
        return '<button class="nm-chip mini" data-addtag="' + esc(t) + '" style="--c:' + tagColor(t) + '">+ ' + esc(t) + '</button>';
      }).join('');
    }
    function addTag(t) { t = String(t || '').trim(); if (t && chosen.indexOf(t) < 0) { chosen.push(t); renderChosen(); } }
    renderChosen();
    ov.addEventListener('click', function (e) {
      var cmd = e.target.getAttribute('data-cmd');
      var nm = e.target.getAttribute('data-nm');
      var addt = e.target.getAttribute('data-addtag');
      var delt = e.target.getAttribute('data-deltag');
      if (cmd) { e.preventDefault(); try { document.execCommand(cmd, false, null); } catch (er) {} ov.querySelector('.nm-rt').focus(); return; }
      if (addt) { addTag(addt); return; }
      if (delt) { chosen = chosen.filter(function (x) { return x !== delt; }); renderChosen(); return; }
      if (nm === 'close') { ov.remove(); return; }
      if (nm === 'save') {
        var title = ov.querySelector('.nm-title-in').value.trim();
        var content = ov.querySelector('.nm-rt').innerHTML;
        if (!title && !stripHtml(content)) { ov.remove(); return; }
        if (editingId) {
          var ex = notes.filter(function (x) { return x.id === editingId; })[0];
          if (ex) { ex.title = title; ex.content = content; ex.tags = chosen; ex.updatedAt = nowISO(); }
        } else {
          var maxOrder = notes.reduce(function (m, x) { return Math.max(m, x.order || 0); }, -1);
          notes.push({ id: uid(), title: title, content: content, tags: chosen, pinned: false, order: maxOrder + 1, createdAt: nowISO(), updatedAt: nowISO() });
        }
        persist(); ov.remove(); renderList();
        return;
      }
    });
    ov.querySelector('.nm-tag-in').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTag(e.target.value); e.target.value = ''; }
    });
    setTimeout(function () { ov.querySelector('.nm-title-in').focus(); }, 30);
  }

  // ---------- actions ----------
  function togglePin(id) { var n = notes.filter(function (x) { return x.id === id; })[0]; if (n) { n.pinned = !n.pinned; n.updatedAt = nowISO(); persist(); renderList(); } }
  function delNote(id) {
    var n = notes.filter(function (x) { return x.id === id; })[0]; if (!n) return;
    if (!window.confirm('Xóa ghi chú "' + (n.title || '(không tiêu đề)') + '"?')) return;
    notes = notes.filter(function (x) { return x.id !== id; }); persist(); renderList();
  }

  // ---------- build view shell ----------
  function buildView() {
    var content = document.querySelector('.content'); if (!content) return;
    var v = document.getElementById('view-notes');
    if (!v) { v = document.createElement('div'); v.className = 'view'; v.id = 'view-notes'; content.appendChild(v); }
    if (v.getAttribute('data-nm-built')) return v;
    v.setAttribute('data-nm-built', '1');
    v.innerHTML = ''
      + '<div class="nm-head"><div><div class="nm-h1">📝 Notes <span class="nm-sub">— Second Brain</span></div>'
      + '<div class="nm-h2">Lưu mọi ý tưởng, mẹo học, kiến thức — tạo & tìm cực nhanh.</div></div>'
      + '<button class="nm-btn solid nm-new">+ Ghi chú mới</button></div>'
      + '<div class="nm-toolbar"><input class="nm-input nm-search" placeholder="🔍 Tìm nhanh theo tiêu đề, nội dung, tag..."><div class="nm-tabs"></div></div>'
      + '<div class="nm-tagbar"></div>'
      + '<div class="nm-grid"></div>';
    // events (delegation)
    v.addEventListener('click', function (e) {
      var act = e.target.getAttribute('data-act');
      var nmv = e.target.getAttribute('data-nmview');
      var tg = e.target.getAttribute('data-nmtag');
      if (e.target.classList.contains('nm-new')) { openEditor(null); return; }
      if (nmv) { view = nmv; if (nmv !== 'bytag') { /* keep tagFilter */ } renderList(); return; }
      if (tg !== null) { tagFilter = tg; renderList(); return; }
      if (act === 'pin') { togglePin(e.target.getAttribute('data-id')); return; }
      if (act === 'edit') { openEditor(e.target.getAttribute('data-id')); return; }
      if (act === 'del') { delNote(e.target.getAttribute('data-id')); return; }
      // click card body -> edit
      var c = e.target.closest && e.target.closest('.nm-card');
      if (c && !e.target.closest('button')) openEditor(c.getAttribute('data-id'));
    });
    var si = v.querySelector('.nm-search');
    si.addEventListener('input', function (e) { query = e.target.value; renderList(); });
    // drag & drop (chi o view 'all')
    var grid = v.querySelector('.nm-grid');
    grid.addEventListener('dragstart', function (e) { var c = e.target.closest('.nm-card'); if (!c) return; dragId = c.getAttribute('data-id'); c.classList.add('nm-dragging'); });
    grid.addEventListener('dragend', function (e) {
      var c = grid.querySelector('.nm-dragging'); if (c) c.classList.remove('nm-dragging');
      var ids = Array.prototype.slice.call(grid.querySelectorAll('.nm-card')).map(function (x) { return x.getAttribute('data-id'); });
      ids.forEach(function (id, i) { var n = notes.filter(function (x) { return x.id === id; })[0]; if (n) n.order = i; });
      persist();
    });
    grid.addEventListener('dragover', function (e) {
      if (view !== 'all') return;
      e.preventDefault();
      var dragging = grid.querySelector('.nm-dragging'); if (!dragging) return;
      var after = getDragAfter(grid, e.clientY, e.clientX);
      if (after == null) grid.appendChild(dragging); else grid.insertBefore(dragging, after);
    });
    return v;
  }
  function getDragAfter(grid, y, x) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.nm-card:not(.nm-dragging)'));
    var closest = null, closestOff = -Infinity;
    cards.forEach(function (c) {
      var box = c.getBoundingClientRect();
      var off = y - box.top - box.height / 2;
      if (off < 0 && off > closestOff) { closestOff = off; closest = c; }
    });
    return closest;
  }

  // ---------- nav item ----------
  function injectNav() {
    var bar = document.querySelector('.sidebar'); if (!bar) return;
    if (bar.querySelector('[data-view="notes"]')) return;
    var item = document.createElement('div');
    item.className = 'nav-item'; item.setAttribute('data-view', 'notes');
    item.textContent = '📝 Notes';
    item.addEventListener('click', function () {
      buildView();
      try { if (typeof window.navigate === 'function') window.navigate('notes'); } catch (e) {}
      // fallback: tu show neu navigate khong xu ly
      var v = document.getElementById('view-notes');
      if (v && !v.classList.contains('active')) {
        Array.prototype.slice.call(document.querySelectorAll('.view')).forEach(function (x) { x.classList.remove('active'); });
        v.classList.add('active');
        Array.prototype.slice.call(document.querySelectorAll('.nav-item')).forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-view') === 'notes'); });
      }
      renderList();
    });
    // CHEN sau nav-item cuoi (Listening Library) — KHONG appendChild vao cuoi
    // .sidebar (sidebar bi keo dai bang chieu cao trang ~4600px -> appendChild
    // se day Notes xuong tan day, khuat man hinh). Xem CANH BAO #10.
    var navs = bar.querySelectorAll('.nav-item');
    var anchor = navs.length ? navs[navs.length - 1] : null;
    if (anchor) anchor.insertAdjacentElement('afterend', item); else bar.appendChild(item);
  }

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById('nm-css')) return;
    var s = document.createElement('style'); s.id = 'nm-css'; var c = '';
    // App dùng .view{display:contents} -> con bị rơi vào grid .content. Ép view này thành block + span full.
    c += '#view-notes.active{display:block!important;grid-column:1/-1!important;width:100%}';
    c += '#view-notes{padding:4px 2px}';
    c += '.nm-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;flex-wrap:wrap}';
    c += '.nm-h1{font-size:24px;font-weight:800;color:var(--text)}';
    c += '.nm-h1 .nm-sub{font-size:15px;font-weight:600;color:var(--purple)}';
    c += '.nm-h2{font-size:13px;color:var(--text-2);margin-top:4px}';
    c += '.nm-toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px}';
    c += '.nm-input{background:var(--card-2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:10px 14px;font:inherit;font-size:13.5px;outline:none}';
    c += '.nm-input:focus{border-color:var(--purple)}';
    c += '.nm-search{flex:1;min-width:220px}';
    c += '.nm-tabs{display:flex;gap:6px;flex-wrap:wrap}';
    c += '.nm-tab{background:var(--card-2);border:1px solid var(--border);color:var(--text-2);border-radius:999px;padding:8px 14px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;transition:all .15s}';
    c += '.nm-tab:hover{color:var(--text)}';
    c += '.nm-tab.on{background:var(--purple);border-color:var(--purple);color:#fff}';
    c += '.nm-tagbar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}';
    c += '.nm-chip{--c:var(--purple);background:transparent;border:1px solid var(--border);color:var(--text-2);border-radius:999px;padding:5px 12px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;transition:all .15s}';
    c += '.nm-chip:hover{border-color:var(--c);color:var(--text)}';
    c += '.nm-chip.on{background:var(--c);border-color:var(--c);color:#fff}';
    c += '.nm-chip.mini{padding:3px 9px;font-size:11px}';
    c += '.nm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}';
    c += '.nm-card{position:relative;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px 16px 12px;box-shadow:0 4px 18px rgba(0,0,0,.18);transition:transform .12s ease,box-shadow .15s ease,border-color .15s;cursor:pointer;display:flex;flex-direction:column;gap:8px}';
    c += '.nm-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(124,92,255,.20);border-color:var(--purple)}';
    c += '.nm-card.pinned{border-color:rgba(124,92,255,.55);background:linear-gradient(160deg,rgba(124,92,255,.10),var(--card))}';
    c += '.nm-card.nm-dragging{opacity:.45;border-style:dashed}';
    c += '.nm-pin{position:absolute;top:10px;right:10px;background:none;border:none;font-size:15px;cursor:pointer;opacity:.5;transition:opacity .15s;line-height:1}';
    c += '.nm-pin:hover,.nm-pin.on{opacity:1}';
    c += '.nm-card-title{font-weight:700;font-size:15px;color:var(--text);padding-right:24px;line-height:1.3}';
    c += '.nm-card-prev{font-size:12.5px;color:var(--text-2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}';
    c += '.nm-card-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:2px}';
    c += '.nm-badge{--c:var(--purple);display:inline-flex;align-items:center;gap:4px;background:color-mix(in srgb,var(--c) 22%,transparent);color:var(--c);border:1px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700}';
    c += '.nm-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:6px;border-top:1px solid var(--border)}';
    c += '.nm-time{font-size:11px;color:var(--text-3)}';
    c += '.nm-card-actions{display:flex;gap:4px;opacity:0;transition:opacity .15s}';
    c += '.nm-card:hover .nm-card-actions{opacity:1}';
    c += '.nm-mini{background:var(--card-2);border:1px solid var(--border);color:var(--text-2);border-radius:8px;padding:4px 9px;font-size:11px;font-weight:600;cursor:pointer}';
    c += '.nm-mini:hover{color:var(--text);border-color:var(--purple)}';
    c += '.nm-mini.danger:hover{color:#fff;background:#b91c1c;border-color:#b91c1c}';
    c += '.nm-empty{grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-2);font-size:15px;line-height:1.7}';
    c += '.nm-muted{color:var(--text-3)}';
    c += '.nm-btn{font:inherit;font-weight:700;font-size:13.5px;border:1.5px solid var(--purple);color:var(--text);background:transparent;border-radius:10px;padding:10px 18px;cursor:pointer;transition:all .12s}';
    c += '.nm-btn.solid{background:linear-gradient(135deg,var(--purple),var(--purple-2));border-color:transparent;color:#fff}';
    c += '.nm-btn.solid:hover{filter:brightness(1.08)}';
    c += '.nm-btn.ghost{border-color:var(--border);color:var(--text-2)}';
    // editor modal
    c += '.nm-overlay{position:fixed;inset:0;background:rgba(8,6,20,.66);backdrop-filter:blur(3px);z-index:100000;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow:auto;animation:nmFade .15s ease}';
    c += '@keyframes nmFade{from{opacity:0}to{opacity:1}}';
    c += '.nm-modal{width:640px;max-width:100%;background:var(--bg-2,#14122b);border:1px solid var(--border);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.55)}';
    c += '.nm-modal-top{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);font-size:16px;color:var(--text)}';
    c += '.nm-x{background:none;border:none;color:var(--text-2);font-size:24px;cursor:pointer;line-height:1}';
    c += '.nm-modal-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px}';
    c += '.nm-title-in{font-size:16px;font-weight:700}';
    c += '.nm-rt-toolbar{display:flex;gap:6px}';
    c += '.nm-rt-toolbar button{background:var(--card-2);border:1px solid var(--border);color:var(--text-2);border-radius:8px;padding:6px 11px;cursor:pointer;font-size:13px}';
    c += '.nm-rt-toolbar button:hover{color:var(--text);border-color:var(--purple)}';
    c += '.nm-rt{min-height:160px;max-height:340px;overflow:auto;background:var(--card-2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;color:var(--text);font-size:14px;line-height:1.6;outline:none}';
    c += '.nm-rt:focus{border-color:var(--purple)}';
    c += '.nm-tags-edit{display:flex;flex-direction:column;gap:8px}';
    c += '.nm-tags-chosen{display:flex;gap:6px;flex-wrap:wrap;align-items:center;min-height:24px}';
    c += '.nm-tagdel{background:none;border:none;color:inherit;cursor:pointer;font-size:13px;padding:0 0 0 2px;line-height:1}';
    c += '.nm-tag-suggest{display:flex;gap:6px;flex-wrap:wrap}';
    c += '.nm-modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid var(--border)}';
    c += '@media(max-width:700px){.nm-grid{grid-template-columns:1fr}.nm-head{flex-direction:column}}';
    s.textContent = c;
    document.head.appendChild(s);
  }

  // ---------- API + boot ----------
  NS.open = function () { var nav = document.querySelector('.sidebar [data-view="notes"]'); if (nav) nav.click(); };
  NS.render = renderList;
  NS.reload = function () { notes = load(); renderList(); };
  NS._notes = function () { return notes; };

  function boot() {
    injectCSS(); injectNav(); buildView();
    // re-inject neu app re-render xoa mat (idempotent, khong gay loop)
    NS._iv = setInterval(function () { injectNav(); buildView(); }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  console.log('[SHADOW_NOTES] ready v' + NS.version + ' — Second Brain · DB rieng localStorage(' + KEY + ')');
})();
