// ============================================================
// SHADOW ENGLISH v15.0 — Content Creation System (No-Code)
// Date: 2026-05-29
// Scope (additive module — remove the <script> tag to fully revert):
//   T1 Topic Header editor        T2 Video (YouTube + Vimeo)
//   T3 Core Phrases (+notes/example, duplicate, drag)
//   T4 Shadow Script block editor T5 Missions CRUD   T6 Active Recall CRUD
//   T7 Section management (move/hide) T9 New Topic wizard
// Storage: reuses v12 overlay (localStorage shadow-en-overlay-{id} + optional GitHub sync)
//          header metadata -> state.topics[] (saveState). NO code deploy needed for content.
// Does NOT touch: Dashboard, Review Engine, Memory System, Phase-1 Learning Loop.
// ============================================================

(function setupV15Content() {
  if (window.SHADOW_V15) return;
  const NS = window.SHADOW_V15 = {};
  NS.version = '15.0.0';

  const V12 = window.SHADOW_V12;
  if (!V12) { console.warn('[v15] SHADOW_V12 not found — content editor inactive'); return; }

  // ---------- tiny helpers ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const uid = (p) => (p || 'x') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const toastMsg = (m) => { try { (window.toast || function(){})(m); } catch(e){} };

  function getState() { return (window.shadowEN && window.shadowEN.state) || null; }
  function getTopic(id) { const s = getState(); return s && Array.isArray(s.topics) ? s.topics.find(t => t.id === id) : null; }
  function saveState() {
    try { if (typeof window.saveState === 'function') return window.saveState(); } catch(e){}
    try { const s = getState(); if (s) localStorage.setItem('shadow-en-state-v3', JSON.stringify(s)); } catch(e){}
  }
  function refreshDashboard() { try { if (window.shadowEN && typeof window.shadowEN.render === 'function') window.shadowEN.render(); } catch(e){} }

  // overlay wrappers (reuse v12 persistence + sync)
  // NOTE: V12.getOverlay() reconstructs an object with only {videoImmersionUrl,customBlocks,notionOverrides}
  // and DROPS our custom `v15` bucket. Re-attach it from raw localStorage so v15 data round-trips.
  function getOv(id) {
    const ov = V12.getOverlay(id);
    try { const raw = JSON.parse(localStorage.getItem('shadow-en-overlay-' + id) || '{}'); if (raw && raw.v15) ov.v15 = raw.v15; } catch(e){}
    return ov;
  }
  function saveOv(id, ov) { V12.saveOverlay(id, ov); try { if (V12.queueOverlaySync) V12.queueOverlaySync(id); } catch(e){} }
  function v15Bucket(ov) { ov.v15 = ov.v15 || {}; const b = ov.v15; b.missions = b.missions || []; b.recall = b.recall || []; b.shadowBlocks = b.shadowBlocks || []; b.sections = b.sections || { order: [], hidden: [] }; b.header = b.header || {}; return b; }
  function readV15(id) { return v15Bucket(getOv(id)); }
  function writeV15(id, mutate) { const ov = getOv(id); const b = v15Bucket(ov); mutate(b); saveOv(id, ov); }

  const curId = () => V12.currentTopicId;
  const rerender = () => { try { V12._rerender(); } catch(e){} };

  // ============================================================
  // CSS
  // ============================================================
  function injectCSS() {
    const id = 'v15-content-styles-v1';
    if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id;
    s.textContent = `
      .v15-edit-only { display:none; }
      .editor-on .v15-edit-only { display:block; }
      .editor-on .v15-edit-only.inline { display:inline-flex; }

      .v15-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:7px; font-size:12px; cursor:pointer;
        background:rgba(124,92,255,0.12); border:1px solid rgba(124,92,255,0.3); color:rgba(190,160,255,0.95); transition:all .15s; }
      .v15-btn:hover { background:rgba(124,92,255,0.25); color:#fff; }
      .v15-btn.danger { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); color:#f87171; }
      .v15-btn.danger:hover { background:rgba(239,68,68,0.22); color:#fff; }
      .v15-btn.primary { background:linear-gradient(135deg,#7c5cff,#b48cff); color:#fff; border-color:transparent; }
      .v15-btn.ghost { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.75); }

      .v15-edit-topic-btn { margin-top:8px; }
      .v15-hero-extra { margin-top:6px; }
      .v15-hero-desc { color:var(--text-2,rgba(255,255,255,0.6)); font-size:12.5px; margin-top:6px; line-height:1.5; }
      .v15-badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
      .v15-badge { font-size:10.5px; padding:3px 9px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); }
      .v15-badge.status-published { background:rgba(34,197,94,0.14); color:#4ade80; border-color:rgba(34,197,94,0.3); }
      .v15-badge.status-draft { background:rgba(250,204,21,0.12); color:#facc15; border-color:rgba(250,204,21,0.3); }

      /* generic item rows (missions / recall) */
      .v15-list { display:flex; flex-direction:column; gap:8px; margin-top:10px; }
      .v15-item { position:relative; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:12px 14px; }
      .editor-on .v15-item { cursor:grab; }
      .v15-item.dragging { opacity:.4; }
      .v15-item-title { font-weight:600; font-size:13.5px; color:rgba(255,255,255,0.95); }
      .v15-item-sub { font-size:12px; color:rgba(255,255,255,0.6); margin-top:3px; line-height:1.5; }
      .v15-item-meta { font-size:10.5px; color:rgba(190,160,255,0.8); margin-top:5px; }
      .v15-item-actions { display:none; gap:4px; margin-top:9px; }
      .editor-on .v15-item-actions { display:flex; flex-wrap:wrap; }
      .v15-item-actions .v15-mini { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); font-size:11.5px; padding:3px 8px; border-radius:6px; cursor:pointer; }
      .v15-item-actions .v15-mini:hover { background:rgba(124,92,255,0.25); color:#fff; }
      .v15-item-actions .v15-mini.del:hover { background:rgba(239,68,68,0.25); color:#fff; }
      .v15-empty { font-size:12.5px; color:rgba(255,255,255,0.45); font-style:italic; padding:10px 2px; }
      .v15-add-row { margin-top:10px; }

      /* phrase extras */
      .v15-phrase-extra { font-size:11px; color:rgba(255,255,255,0.5); margin-top:4px; line-height:1.45; }
      .v15-phrase-extra b { color:rgba(190,160,255,0.85); font-weight:600; }

      /* section management toolbar */
      .v15-sec-tools { display:none; gap:5px; position:absolute; top:10px; right:12px; z-index:6; }
      .editor-on .v15-sec-tools { display:inline-flex; }
      .v15-sec-tools button { background:rgba(13,11,31,0.9); border:1px solid rgba(124,92,255,0.25); color:rgba(255,255,255,0.7); font-size:12px; width:26px; height:24px; border-radius:6px; cursor:pointer; padding:0; }
      .v15-sec-tools button:hover { background:rgba(124,92,255,0.3); color:#fff; }
      .v15-hidden-section { display:none !important; }
      .v15-restore-bar { margin:8px 0; padding:8px 12px; border:1px dashed rgba(255,255,255,0.15); border-radius:8px; font-size:11.5px; color:rgba(255,255,255,0.6); }

      /* modal */
      .v15-modal-bg { position:fixed; inset:0; background:rgba(4,3,12,0.72); backdrop-filter:blur(4px); z-index:10000; display:flex; align-items:center; justify-content:center; padding:18px; }
      .v15-modal { width:100%; max-width:540px; max-height:88vh; overflow:auto; background:#16142b; border:1px solid rgba(124,92,255,0.3); border-radius:16px; box-shadow:0 24px 70px rgba(0,0,0,0.6); padding:22px; }
      .v15-modal h3 { margin:0 0 4px; font-size:17px; color:#fff; }
      .v15-modal .v15-modal-sub { font-size:12px; color:rgba(255,255,255,0.5); margin-bottom:16px; }
      .v15-field { margin-bottom:14px; }
      .v15-field label { display:block; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,255,255,0.55); margin-bottom:6px; }
      .v15-field input, .v15-field textarea, .v15-field select { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:#fff; font-size:13.5px; padding:9px 11px; font-family:inherit; }
      .v15-field textarea { min-height:84px; resize:vertical; line-height:1.5; }
      .v15-field input:focus, .v15-field textarea:focus, .v15-field select:focus { outline:none; border-color:rgba(124,92,255,0.6); background:rgba(124,92,255,0.06); }
      .v15-field-row { display:flex; gap:12px; } .v15-field-row > * { flex:1; }
      .v15-modal-actions { display:flex; justify-content:space-between; gap:10px; margin-top:20px; align-items:center; }
      .v15-modal-actions .right { display:flex; gap:10px; }
      .v15-emoji-pick { display:flex; gap:6px; flex-wrap:wrap; }
      .v15-emoji-pick button { font-size:18px; width:38px; height:38px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); cursor:pointer; }
      .v15-emoji-pick button:hover, .v15-emoji-pick button.sel { background:rgba(124,92,255,0.3); border-color:rgba(124,92,255,0.6); }
      .v15-video-preview { margin:8px 0; border-radius:10px; overflow:hidden; aspect-ratio:16/9; background:#000; }
      .v15-video-preview iframe { width:100%; height:100%; border:0; }

      /* wizard */
      .v15-wiz-steps { display:flex; gap:5px; margin-bottom:16px; }
      .v15-wiz-dot { flex:1; height:4px; border-radius:3px; background:rgba(255,255,255,0.1); }
      .v15-wiz-dot.done { background:#7c5cff; }
      .v15-fab { position:fixed; left:22px; bottom:22px; z-index:9000; display:inline-flex; align-items:center; gap:7px; padding:11px 17px; border-radius:30px;
        background:linear-gradient(135deg,#7c5cff,#ec4899); color:#fff; font-size:13px; font-weight:600; border:none; cursor:pointer; box-shadow:0 10px 30px rgba(124,92,255,0.4); }
      .v15-fab:hover { transform:translateY(-2px); }
    `;
    document.head.appendChild(s);
  }

  // ============================================================
  // MODAL SYSTEM
  // ============================================================
  NS.closeModal = function() { document.querySelectorAll('.v15-modal-bg').forEach(e => e.remove()); };
  // fields: [{key,label,type:'text|textarea|select|number',options?,placeholder?}]
  NS.openForm = function(title, sub, fields, values, onSave) {
    NS.closeModal();
    const bg = document.createElement('div'); bg.className = 'v15-modal-bg';
    const body = fields.map(f => {
      const v = esc(values && values[f.key] != null ? values[f.key] : '');
      if (f.type === 'textarea') return `<div class="v15-field"><label>${esc(f.label)}</label><textarea data-k="${f.key}" placeholder="${esc(f.placeholder||'')}">${v}</textarea></div>`;
      if (f.type === 'select') return `<div class="v15-field"><label>${esc(f.label)}</label><select data-k="${f.key}">${(f.options||[]).map(o => `<option value="${esc(o)}" ${String(values&&values[f.key])===String(o)?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`;
      const t = f.type === 'number' ? 'number' : 'text';
      return `<div class="v15-field"><label>${esc(f.label)}</label><input type="${t}" data-k="${f.key}" value="${v}" placeholder="${esc(f.placeholder||'')}"></div>`;
    }).join('');
    bg.innerHTML = `<div class="v15-modal"><h3>${esc(title)}</h3>${sub?`<div class="v15-modal-sub">${esc(sub)}</div>`:''}${body}
      <div class="v15-modal-actions"><span></span><div class="right">
        <button class="v15-btn ghost" data-act="cancel">Hủy</button>
        <button class="v15-btn primary" data-act="save">Lưu</button>
      </div></div>`;
    bg.addEventListener('click', e => { if (e.target === bg) NS.closeModal(); });
    bg.querySelector('[data-act="cancel"]').onclick = NS.closeModal;
    bg.querySelector('[data-act="save"]').onclick = () => {
      const out = {};
      bg.querySelectorAll('[data-k]').forEach(el => { out[el.dataset.k] = el.value.trim(); });
      if (onSave(out) !== false) NS.closeModal();
    };
    document.body.appendChild(bg);
    const first = bg.querySelector('[data-k]'); if (first) first.focus();
    return bg;
  };

  // ============================================================
  // T1 — TOPIC HEADER EDITOR
  // ============================================================
  const EMOJIS = ['📘','🍔','🗺️','🛍️','👋','🔢','✈️','🚌','🏨','📞','🏥','🤝','🚨','☕','💼','📝','💡','🎉','😊','📺','👔','📊','📚','🤔','❤️','😄','🧠','🎯','🌍','🎬'];

  NS.editHeader = function(topicId) {
    const t = getTopic(topicId); if (!t) { toastMsg('Không tìm thấy topic'); return; }
    const fields = [
      { key:'name', label:'Tên topic' , type:'text' },
      { key:'emoji', label:'Icon (emoji)', type:'text', placeholder:'📘' },
      { key:'subtitle', label:'Subtitle (1 dòng mô tả ngắn)', type:'text' },
      { key:'description', label:'Mô tả', type:'textarea' },
      { key:'level', label:'Level (1-3)', type:'select', options:[1,2,3] },
      { key:'category', label:'Category', type:'text', placeholder:'Daily life, Business…' },
      { key:'status', label:'Status', type:'select', options:['draft','published'] },
      { key:'heroImage', label:'Hero image URL (tùy chọn)', type:'text', placeholder:'https://…' }
    ];
    const vals = {
      name:t.name, emoji:t.emoji, subtitle:t.subtitle||'', description:t.description||'',
      level:t.level||1, category:t.category||'', status:t.status||'draft', heroImage:t.heroImage||''
    };
    const bg = NS.openForm('Edit Topic', 'Sửa thông tin tiêu đề bài học — lưu ngay, không cần code', fields, vals, (out) => {
      if (!out.name) { toastMsg('Tên topic không được trống'); return false; }
      const tt = getTopic(topicId); if (!tt) return;
      tt.name = out.name; tt.emoji = out.emoji || tt.emoji; tt.subtitle = out.subtitle;
      tt.description = out.description; tt.level = parseInt(out.level,10) || tt.level;
      tt.category = out.category; tt.status = out.status; tt.heroImage = out.heroImage;
      saveState();
      toastMsg('💾 Đã lưu Topic Header');
      rerender(); refreshDashboard();
    });
    // emoji quick-pick under the emoji input
    const emojiField = bg.querySelector('[data-k="emoji"]');
    if (emojiField) {
      const pick = document.createElement('div'); pick.className = 'v15-emoji-pick'; pick.style.marginTop = '8px';
      pick.innerHTML = EMOJIS.map(e => `<button type="button">${e}</button>`).join('');
      pick.querySelectorAll('button').forEach(b => b.onclick = () => { emojiField.value = b.textContent; });
      emojiField.parentNode.appendChild(pick);
    }
  };

  function augmentHeader(view, topicId) {
    const t = getTopic(topicId); if (!t) return;
    const hero = view.querySelector('.topic-hero'); if (!hero) return;
    // sync live values from state (in case base render is stale)
    const nameEl = hero.querySelector('h1'); if (nameEl) nameEl.textContent = t.name;
    const emojiEl = hero.querySelector('.topic-emoji-big'); if (emojiEl) emojiEl.textContent = t.emoji;
    const subEl = hero.querySelector('.topic-sub'); if (subEl) subEl.textContent = `Level ${t.level} · ${t.memoryStatus} · ${t.sessions} sessions completed`;

    // remove previous v15 injections
    hero.querySelectorAll('.v15-hero-extra, .v15-edit-topic-btn').forEach(e => e.remove());

    const left = hero.querySelector('.topic-hero-left > div:last-child') || nameEl?.parentNode || hero;
    const extra = document.createElement('div'); extra.className = 'v15-hero-extra';
    let html = '';
    if (t.subtitle) html += `<div class="v15-hero-desc" style="font-weight:600;color:rgba(255,255,255,0.85)">${esc(t.subtitle)}</div>`;
    if (t.description) html += `<div class="v15-hero-desc">${esc(t.description)}</div>`;
    const badges = [];
    if (t.category) badges.push(`<span class="v15-badge">🏷 ${esc(t.category)}</span>`);
    badges.push(`<span class="v15-badge status-${t.status==='published'?'published':'draft'}">${t.status==='published'?'● Published':'○ Draft'}</span>`);
    html += `<div class="v15-badges">${badges.join('')}</div>`;
    extra.innerHTML = html;
    left.appendChild(extra);

    // Edit Topic button into hero actions
    const actions = hero.querySelector('.topic-hero-actions');
    if (actions) {
      const btn = document.createElement('button');
      btn.className = 'v15-btn v15-edit-topic-btn v15-edit-only inline'; btn.innerHTML = '✏ Edit Topic';
      btn.onclick = () => NS.editHeader(topicId);
      actions.appendChild(btn);
    }
  }

  // ============================================================
  // T2 — VIDEO IMMERSION (YouTube + Vimeo) — override v12 renderer
  // ============================================================
  NS.parseVideo = function(url) {
    if (!url) return null;
    let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (m) return { provider:'youtube', embed:`https://www.youtube.com/embed/${m[1]}` };
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { provider:'vimeo', embed:`https://player.vimeo.com/video/${m[1]}` };
    m = url.match(/^[\w-]{11}$/); // bare YT id
    if (m) return { provider:'youtube', embed:`https://www.youtube.com/embed/${m[0]}` };
    return null;
  };

  V12._renderVideoImmersionSection = function(topicId) {
    const overlay = getOv(topicId);
    const section = document.createElement('div');
    section.className = 'v12-video-immersion card'; section.style.gridColumn = 'span 5';
    const url = overlay.videoImmersionUrl;
    const info = NS.parseVideo(url);
    let body;
    if (info) {
      body = `<div class="v15-video-preview"><iframe src="${info.embed}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
        <div class="vi-actions v15-edit-only inline" style="gap:8px;margin-top:8px">
          <button class="v15-btn" onclick="SHADOW_V15.promptVideo()">✏ Replace</button>
          <button class="v15-btn danger" onclick="SHADOW_V15.removeVideo()">🗑 Remove</button>
          <span class="v15-badge">${info.provider}</span>
        </div>`;
    } else if (url) {
      body = `<div class="vi-empty">⚠️ URL không hợp lệ (chỉ hỗ trợ YouTube / Vimeo). <a href="#" onclick="event.preventDefault();SHADOW_V15.promptVideo()">Thử lại →</a></div>`;
    } else {
      body = `<div class="vi-empty" style="cursor:pointer" onclick="SHADOW_V15.promptVideo()">▶ Thêm video hội thoại native<br><span style="font-size:11px;opacity:.6">Dán link YouTube hoặc Vimeo — tự embed</span></div>`;
    }
    section.innerHTML = `<div class="vi-title">▶ VIDEO IMMERSION</div>${body}`;
    return section;
  };
  V12._promptVideoUrl = function() { NS.promptVideo(); };
  NS.removeVideo = function() { V12.setVideoImmersionUrl(curId(), null); };
  NS.promptVideo = function() {
    const ov = getOv(curId());
    NS.openForm('Video Immersion', 'Dán link YouTube hoặc Vimeo — preview tức thì', [
      { key:'url', label:'Video URL', type:'text', placeholder:'https://youtube.com/watch?v=… hoặc https://vimeo.com/…' }
    ], { url: ov.videoImmersionUrl || '' }, (out) => {
      if (out.url && !NS.parseVideo(out.url)) { toastMsg('Link không hợp lệ — chỉ nhận YouTube/Vimeo'); return false; }
      V12.setVideoImmersionUrl(curId(), out.url || null);
      toastMsg(out.url ? '🎬 Đã cập nhật video' : '🗑 Đã xoá video');
    });
    // live preview on type
    setTimeout(() => {
      const bg = document.querySelector('.v15-modal-bg'); if (!bg) return;
      const inp = bg.querySelector('[data-k="url"]'); if (!inp) return;
      const prev = document.createElement('div'); inp.parentNode.appendChild(prev);
      const upd = () => { const i = NS.parseVideo(inp.value.trim()); prev.innerHTML = i ? `<div class="v15-video-preview"><iframe src="${i.embed}"></iframe></div>` : ''; };
      inp.addEventListener('input', upd); upd();
    }, 30);
  };

  // ============================================================
  // T3 — CORE PHRASES (+ notes/example, duplicate, drag) — override v12
  // ============================================================
  V12._normalizePhrase = function(p) {
    p = p || {};
    return { en: p.en || p.english || '', vi: p.vi || p.vietnamese || '', notes: p.notes || '', example: p.example || '' };
  };
  V12._renderPhraseRow = function(phrase, idx, group, topicId) {
    const ph = V12._normalizePhrase(phrase);
    const row = document.createElement('div');
    row.className = 'v12-phrase-row'; row.dataset.idx = idx; row.dataset.group = group;
    row.style.flexDirection = 'column'; row.style.alignItems = 'stretch';
    row.setAttribute('draggable', 'false');
    row.innerHTML =
      `<div style="display:flex;gap:14px;align-items:flex-start;width:100%">
         <div style="flex:1">
           <div class="v12-phrase-en" style="text-align:left">${esc(ph.en) || '<span style="opacity:.4">(empty)</span>'}</div>
           ${(ph.notes||ph.example) ? `<div class="v15-phrase-extra">${ph.notes?`<b>Note:</b> ${esc(ph.notes)} `:''}${ph.example?`<b>Eg:</b> ${esc(ph.example)}`:''}</div>` : ''}
         </div>
         <div class="v12-phrase-vi" style="flex:1;text-align:right">${esc(ph.vi)}</div>
         <span class="v12-phrase-actions">
           <button data-act="edit" title="Edit">✏</button>
           <button data-act="dup" title="Duplicate">⧉</button>
           <button data-act="up" title="Up">↑</button>
           <button data-act="down" title="Down">↓</button>
           <button data-act="del" title="Delete">🗑</button>
         </span>
       </div>`;
    row.querySelectorAll('button').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const a = btn.dataset.act;
        if (a === 'edit') NS.editPhrase(group, idx, topicId);
        else if (a === 'dup') NS.dupPhrase(group, idx, topicId);
        else if (a === 'up') V12._movePhrase(idx, group, -1, topicId);
        else if (a === 'down') V12._movePhrase(idx, group, +1, topicId);
        else if (a === 'del') { if (confirm('Xoá phrase này?')) V12._deletePhrase(idx, group, topicId); }
      };
    });
    row.querySelector('.v12-phrase-en').onclick = () => { if (V12.editMode) NS.editPhrase(group, idx, topicId); };
    // drag reorder within group (edit mode)
    row.addEventListener('dragstart', (e) => { if (!V12.editMode) return; row.classList.add('dragging'); e.dataTransfer.setData('text/plain', String(idx)); });
    row.addEventListener('dragend', () => row.classList.remove('dragging'));
    row.addEventListener('dragover', (e) => { if (V12.editMode) e.preventDefault(); });
    row.addEventListener('drop', (e) => {
      e.preventDefault(); const from = parseInt(e.dataTransfer.getData('text/plain'),10); const to = idx;
      if (!isNaN(from) && from !== to) NS.reorderPhrase(group, from, to, topicId);
    });
    if (V12.editMode) row.setAttribute('draggable', 'true');
    return row;
  };
  V12._editPhrase = function(row, idx, group, topicId) { NS.editPhrase(group, idx, topicId); };
  V12._addPhrase = function(group, topicId) {
    const phrases = V12._getEffectivePhrases(topicId);
    phrases[group] = phrases[group].slice();
    phrases[group].push({ en:'', vi:'', notes:'', example:'' });
    V12._savePhrases(topicId, phrases);
    NS.editPhrase(group, phrases[group].length - 1, topicId);
  };
  NS.editPhrase = function(group, idx, topicId) {
    const phrases = V12._getEffectivePhrases(topicId);
    const cur = phrases[group][idx] || { en:'', vi:'', notes:'', example:'' };
    NS.openForm('Edit Phrase', group.toUpperCase(), [
      { key:'en', label:'English', type:'text' },
      { key:'vi', label:'Translation (Tiếng Việt)', type:'text' },
      { key:'notes', label:'Notes (tùy chọn)', type:'text' },
      { key:'example', label:'Example (tùy chọn)', type:'textarea' }
    ], cur, (out) => {
      const ps = V12._getEffectivePhrases(topicId); ps[group] = ps[group].slice();
      ps[group][idx] = { en:out.en, vi:out.vi, notes:out.notes, example:out.example };
      V12._savePhrases(topicId, ps); toastMsg('💾 Đã lưu phrase');
    });
  };
  NS.dupPhrase = function(group, idx, topicId) {
    const ps = V12._getEffectivePhrases(topicId); ps[group] = ps[group].slice();
    const c = JSON.parse(JSON.stringify(ps[group][idx] || {})); ps[group].splice(idx+1, 0, c);
    V12._savePhrases(topicId, ps); toastMsg('⧉ Đã nhân đôi phrase');
  };
  NS.reorderPhrase = function(group, from, to, topicId) {
    const ps = V12._getEffectivePhrases(topicId); const arr = ps[group].slice();
    const [m] = arr.splice(from, 1); arr.splice(to, 0, m); ps[group] = arr;
    V12._savePhrases(topicId, ps);
  };

  // ============================================================
  // T5/T6 — generic structured list editor (Missions, Active Recall)
  // ============================================================
  // config: { key:'missions'|'recall', title, icon, fields:[...], titleField, subField, metaFn }
  function renderListEditor(view, topicId, cfg) {
    const card = V12._findCardByTitle(view, cfg.titleRegex);
    if (!card) return;
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    const titleEl = card.querySelector('.card-title');
    // wipe old body (keep title + v15 tools + v12 badges)
    Array.from(card.children).forEach(ch => {
      if (ch === titleEl) return;
      if (ch.classList && (ch.classList.contains('v15-sec-tools') || ch.classList.contains('v12-overridden-badge'))) return;
      if (ch.classList && ch.classList.contains('v12-section-edit-btn')) { ch.remove(); return; }
      ch.remove();
    });
    const items = readV15(topicId)[cfg.key];
    const list = document.createElement('div'); list.className = 'v15-list';
    if (!items.length) {
      const empty = document.createElement('div'); empty.className = 'v15-empty';
      empty.textContent = cfg.emptyText; list.appendChild(empty);
    }
    items.forEach((it, idx) => list.appendChild(renderListItem(topicId, cfg, it, idx)));
    card.appendChild(list);
    const addWrap = document.createElement('div'); addWrap.className = 'v15-add-row v15-edit-only';
    addWrap.innerHTML = `<button class="v15-btn">+ ${esc(cfg.addLabel)}</button>`;
    addWrap.querySelector('button').onclick = () => NS.addListItem(topicId, cfg.key);
    card.appendChild(addWrap);
  }

  function renderListItem(topicId, cfg, it, idx) {
    const el = document.createElement('div'); el.className = 'v15-item'; el.dataset.idx = idx;
    const title = it[cfg.titleField] || '(chưa có tiêu đề)';
    let html = `<div class="v15-item-title">${esc(title)}</div>`;
    if (cfg.subField && it[cfg.subField]) html += `<div class="v15-item-sub">${esc(it[cfg.subField])}</div>`;
    const meta = cfg.metaFn ? cfg.metaFn(it) : '';
    if (meta) html += `<div class="v15-item-meta">${esc(meta)}</div>`;
    html += `<div class="v15-item-actions">
      <button class="v15-mini" data-a="edit">✏ Edit</button>
      <button class="v15-mini" data-a="dup">⧉ Duplicate</button>
      <button class="v15-mini" data-a="up">↑ Up</button>
      <button class="v15-mini" data-a="down">↓ Down</button>
      <button class="v15-mini del" data-a="del">🗑 Delete</button>
    </div>`;
    el.innerHTML = html;
    el.querySelectorAll('button').forEach(b => b.onclick = (e) => {
      e.stopPropagation(); const a = b.dataset.a;
      if (a === 'edit') NS.editListItem(topicId, cfg.key, idx);
      else if (a === 'dup') NS.dupListItem(topicId, cfg.key, idx);
      else if (a === 'up') NS.moveListItem(topicId, cfg.key, idx, -1);
      else if (a === 'down') NS.moveListItem(topicId, cfg.key, idx, +1);
      else if (a === 'del') { if (confirm('Xoá mục này?')) NS.delListItem(topicId, cfg.key, idx); }
    });
    if (V12.editMode) {
      el.setAttribute('draggable','true');
      el.addEventListener('dragstart', e => { el.classList.add('dragging'); e.dataTransfer.setData('text/plain', String(idx)); });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', e => { e.preventDefault(); const from = parseInt(e.dataTransfer.getData('text/plain'),10); if (!isNaN(from) && from!==idx) NS.reorderListItem(topicId, cfg.key, from, idx); });
    }
    return el;
  }

  const LIST_CFG = {
    missions: {
      key:'missions', titleRegex:/REAL LIFE MISSIONS|MISSIONS/i, addLabel:'Add Mission',
      emptyText:'Chưa có mission nào. Bấm "+ Add Mission" để tạo nhiệm vụ nói thực tế.',
      titleField:'title', subField:'description', metaFn:(it)=> [it.difficulty?('⚡ '+it.difficulty):'', it.success?('✓ '+it.success):''].filter(Boolean).join('  ·  '),
      fields:[
        { key:'title', label:'Mission Title', type:'text' },
        { key:'description', label:'Description', type:'textarea' },
        { key:'difficulty', label:'Difficulty', type:'select', options:['Easy','Medium','Hard'] },
        { key:'success', label:'Success Criteria', type:'text' }
      ]
    },
    recall: {
      key:'recall', titleRegex:/ACTIVE RECALL|RECALL/i, addLabel:'Add Question',
      emptyText:'Chưa có câu hỏi recall. Bấm "+ Add Question" để tạo bài ôn.',
      titleField:'question', subField:'answer', metaFn:(it)=> it.hint?('💡 Hint: '+it.hint):'',
      fields:[
        { key:'question', label:'Question', type:'text' },
        { key:'answer', label:'Answer', type:'textarea' },
        { key:'hint', label:'Hint (tùy chọn)', type:'text' }
      ]
    }
  };

  NS.addListItem = function(topicId, key) {
    const cfg = LIST_CFG[key];
    NS.openForm('New ' + (key==='missions'?'Mission':'Question'), '', cfg.fields, {}, (out) => {
      out.id = uid(key);
      writeV15(topicId, b => b[key].push(out));
      toastMsg('✅ Đã thêm'); rerender();
    });
  };
  NS.editListItem = function(topicId, key, idx) {
    const cfg = LIST_CFG[key]; const cur = readV15(topicId)[key][idx] || {};
    NS.openForm('Edit', '', cfg.fields, cur, (out) => {
      out.id = cur.id || uid(key);
      writeV15(topicId, b => { b[key][idx] = out; });
      toastMsg('💾 Đã lưu'); rerender();
    });
  };
  NS.dupListItem = function(topicId, key, idx) {
    writeV15(topicId, b => { const c = JSON.parse(JSON.stringify(b[key][idx])); c.id = uid(key); b[key].splice(idx+1,0,c); });
    toastMsg('⧉ Đã nhân đôi'); rerender();
  };
  NS.delListItem = function(topicId, key, idx) { writeV15(topicId, b => b[key].splice(idx,1)); toastMsg('🗑 Đã xoá'); rerender(); };
  NS.moveListItem = function(topicId, key, idx, dir) {
    writeV15(topicId, b => { const ni = idx+dir; if (ni<0||ni>=b[key].length) return; const [m]=b[key].splice(idx,1); b[key].splice(ni,0,m); });
    rerender();
  };
  NS.reorderListItem = function(topicId, key, from, to) {
    writeV15(topicId, b => { const [m]=b[key].splice(from,1); b[key].splice(to,0,m); });
    rerender();
  };

  // ============================================================
  // T4 — SHADOW SCRIPT block editor (reuse SHADOW_BLOCKS renderer)
  // ============================================================
  const SHADOW_BLOCK_TYPES = [
    { type:'paragraph', label:'Paragraph' }, { type:'heading', label:'Heading' },
    { type:'quote', label:'Quote' }, { type:'callout', label:'Callout' }, { type:'divider', label:'Divider' }
  ];
  function blockText(b) { return b.text || (b.items ? b.items.join('\n') : ''); }

  function renderShadowEditor(view, topicId) {
    const card = V12._findCardByTitle(view, /SHADOWING SCRIPT|SHADOW SCRIPT/i);
    if (!card) return;
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    const titleEl = card.querySelector('.card-title');
    Array.from(card.children).forEach(ch => {
      if (ch === titleEl) return;
      if (ch.classList && (ch.classList.contains('v15-sec-tools') || ch.classList.contains('v12-overridden-badge'))) return;
      if (ch.classList && ch.classList.contains('v12-section-edit-btn')) { ch.remove(); return; }
      ch.remove();
    });
    const blocks = readV15(topicId).shadowBlocks;
    const wrap = document.createElement('div'); wrap.style.marginTop = '10px';
    if (!blocks.length) {
      wrap.innerHTML = `<div class="v15-empty">Chưa có nội dung. Thêm khối (paragraph / heading / quote / callout) để viết script.</div>`;
    } else {
      blocks.forEach((b, idx) => {
        const item = document.createElement('div'); item.className = 'v15-item'; item.style.padding = '10px 12px';
        const rendered = (window.SHADOW_BLOCKS && window.SHADOW_BLOCKS.types[b.type]) ? window.SHADOW_BLOCKS.types[b.type].call(window.SHADOW_BLOCKS, b, topicId+'-'+b.id) : esc(blockText(b));
        item.innerHTML = `<div>${rendered}</div>
          <div class="v15-item-actions">
            <button class="v15-mini" data-a="edit">✏ Edit</button>
            <button class="v15-mini" data-a="dup">⧉</button>
            <button class="v15-mini" data-a="up">↑</button>
            <button class="v15-mini" data-a="down">↓</button>
            <button class="v15-mini del" data-a="del">🗑</button>
          </div>`;
        item.querySelectorAll('button').forEach(btn => btn.onclick = (e) => {
          e.stopPropagation(); const a = btn.dataset.a;
          if (a==='edit') NS.editShadowBlock(topicId, idx);
          else if (a==='dup') { writeV15(topicId, bb => { const c=JSON.parse(JSON.stringify(bb.shadowBlocks[idx])); c.id=uid('sb'); bb.shadowBlocks.splice(idx+1,0,c); }); rerender(); }
          else if (a==='up') { writeV15(topicId, bb => { if(idx<=0)return; const [m]=bb.shadowBlocks.splice(idx,1); bb.shadowBlocks.splice(idx-1,0,m); }); rerender(); }
          else if (a==='down') { writeV15(topicId, bb => { if(idx>=bb.shadowBlocks.length-1)return; const [m]=bb.shadowBlocks.splice(idx,1); bb.shadowBlocks.splice(idx+1,0,m); }); rerender(); }
          else if (a==='del') { if(confirm('Xoá khối này?')){ writeV15(topicId, bb=>bb.shadowBlocks.splice(idx,1)); rerender(); } }
        });
        wrap.appendChild(item);
      });
    }
    card.appendChild(wrap);
    const add = document.createElement('div'); add.className = 'v15-add-row v15-edit-only inline'; add.style.gap='6px'; add.style.flexWrap='wrap';
    add.innerHTML = SHADOW_BLOCK_TYPES.map(t => `<button class="v15-btn" data-t="${t.type}">+ ${esc(t.label)}</button>`).join('');
    add.querySelectorAll('button').forEach(b => b.onclick = () => NS.addShadowBlock(topicId, b.dataset.t));
    card.appendChild(add);
    const tip = document.createElement('div'); tip.style.cssText='font-size:11px;color:var(--text-3,rgba(255,255,255,0.4));margin-top:8px';
    tip.textContent = 'Đọc to script này ×3 lần, ghi âm + so sánh với native speaker.'; card.appendChild(tip);
  }

  NS.addShadowBlock = function(topicId, type) {
    if (type === 'divider') { writeV15(topicId, b => b.shadowBlocks.push({ id:uid('sb'), type:'divider' })); rerender(); return; }
    NS.editShadowBlockForm(topicId, { id:uid('sb'), type, text:'', level:2, color:'purple' }, null);
  };
  NS.editShadowBlock = function(topicId, idx) {
    const b = readV15(topicId).shadowBlocks[idx]; if (!b) return;
    if (b.type === 'divider') { toastMsg('Divider không có nội dung'); return; }
    NS.editShadowBlockForm(topicId, b, idx);
  };
  NS.editShadowBlockForm = function(topicId, block, idx) {
    const fields = [{ key:'text', label:(block.type==='heading'?'Heading text':block.type==='quote'?'Quote':block.type==='callout'?'Callout text':'Text'), type:'textarea' }];
    if (block.type === 'heading') fields.push({ key:'level', label:'Level', type:'select', options:[1,2,3] });
    if (block.type === 'callout') { fields.push({ key:'icon', label:'Icon', type:'text', placeholder:'💡' }); fields.push({ key:'color', label:'Color', type:'select', options:['purple','blue','green','orange'] }); }
    NS.openForm('Shadow block — ' + block.type, '', fields, block, (out) => {
      const nb = Object.assign({}, block, out); if (out.level) nb.level = parseInt(out.level,10);
      writeV15(topicId, b => { if (idx==null) b.shadowBlocks.push(nb); else b.shadowBlocks[idx] = nb; });
      toastMsg('💾 Đã lưu khối'); rerender();
    });
  };

  // ============================================================
  // T7 — SECTION MANAGEMENT (move / hide-restore) for native cards
  // ============================================================
  const MANAGED = [
    { rx:/WHY THIS TOPIC|WHY/i, name:'Why' },
    { rx:/VIDEO IMMERSION/i, name:'Video' },
    { rx:/CORE PHRASES/i, name:'Core Phrases' },
    { rx:/SHADOWING SCRIPT/i, name:'Shadow Script' },
    { rx:/REAL LIFE MISSIONS/i, name:'Missions' },
    { rx:/ACTIVE RECALL/i, name:'Active Recall' },
    { rx:/CUSTOM CONTENT/i, name:'Custom Content' }
  ];
  function sectionSig(card) {
    const t = card.querySelector('.card-title, .vi-title, .es-title');
    return (t ? t.textContent : '').replace(/\s+/g,' ').trim().slice(0,40);
  }
  function applySectionMgmt(view, topicId) {
    const grid = view; const cards = Array.from(view.querySelectorAll('.card'));
    const meta = readV15(topicId).sections;
    // hide
    cards.forEach(card => {
      const sig = sectionSig(card);
      if (meta.hidden.includes(sig)) card.classList.add('v15-hidden-section'); else card.classList.remove('v15-hidden-section');
      if (!MANAGED.some(m => m.rx.test(sig))) return;
      card.querySelectorAll('.v15-sec-tools').forEach(e => e.remove());
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      const tools = document.createElement('div'); tools.className = 'v15-sec-tools';
      tools.innerHTML = `<button data-a="up" title="Move up">↑</button><button data-a="down" title="Move down">↓</button><button data-a="hide" title="Hide section">🙈</button>`;
      tools.querySelectorAll('button').forEach(b => b.onclick = (e) => {
        e.stopPropagation(); const a = b.dataset.a;
        if (a === 'hide') { writeV15(topicId, bk => { if (!bk.sections.hidden.includes(sig)) bk.sections.hidden.push(sig); }); rerender(); }
        else NS.moveSection(topicId, card, a);
      });
      card.appendChild(tools);
    });
    // restore bar (edit mode) if any hidden
    view.querySelectorAll('.v15-restore-bar').forEach(e => e.remove());
    if (meta.hidden.length) {
      const bar = document.createElement('div'); bar.className = 'v15-restore-bar v15-edit-only card'; bar.style.gridColumn='span 5';
      bar.innerHTML = `<b>Ẩn:</b> ` + meta.hidden.map(h => `<button class="v15-btn ghost" data-h="${esc(h)}" style="margin:3px">👁 ${esc(h)}</button>`).join('');
      bar.querySelectorAll('button').forEach(b => b.onclick = () => { writeV15(topicId, bk => { bk.sections.hidden = bk.sections.hidden.filter(x => x !== b.dataset.h); }); rerender(); });
      view.insertBefore(bar, view.firstChild);
    }
  }
  NS.moveSection = function(topicId, card, dir) {
    const parent = card.parentNode; if (!parent) return;
    const cards = Array.from(parent.querySelectorAll(':scope > .card'));
    const i = cards.indexOf(card); const j = dir === 'up' ? i-1 : i+1;
    if (j < 0 || j >= cards.length) return;
    if (dir === 'up') parent.insertBefore(card, cards[j]); else parent.insertBefore(cards[j], card);
    // persist order by signatures
    const order = Array.from(parent.querySelectorAll(':scope > .card')).map(sectionSig);
    writeV15(topicId, b => { b.sections.order = order; });
  };
  function applySectionOrder(view, topicId) {
    const order = readV15(topicId).sections.order; if (!order || !order.length) return;
    const parent = view;
    const cards = Array.from(parent.querySelectorAll(':scope > .card'));
    const bySig = {}; cards.forEach(c => { const s = sectionSig(c); if (!(s in bySig)) bySig[s] = c; });
    order.forEach(sig => { if (bySig[sig]) parent.appendChild(bySig[sig]); });
  }

  // ============================================================
  // T9 — NEW TOPIC WIZARD
  // ============================================================
  NS.openWizard = function() {
    const data = { name:'', emoji:'📘', level:1, video:'', phrases:[], mission:'' };
    let step = 0;
    const steps = [
      { title:'Tên topic', render:() => `<div class="v15-field"><label>Topic name</label><input data-k="name" value="${esc(data.name)}" placeholder="VD: Ordering Coffee"></div>` },
      { title:'Icon', render:() => `<div class="v15-field"><label>Chọn icon</label><div class="v15-emoji-pick">${EMOJIS.map(e=>`<button type="button" class="${data.emoji===e?'sel':''}">${e}</button>`).join('')}</div></div>` },
      { title:'Level', render:() => `<div class="v15-field"><label>Level</label><select data-k="level">${[1,2,3].map(l=>`<option ${data.level==l?'selected':''}>${l}</option>`).join('')}</select></div>` },
      { title:'Video (tùy chọn)', render:() => `<div class="v15-field"><label>YouTube / Vimeo URL</label><input data-k="video" value="${esc(data.video)}" placeholder="Dán link hoặc bỏ trống"></div>` },
      { title:'Core Phrases (tùy chọn)', render:() => `<div class="v15-field"><label>Mỗi dòng 1 phrase — định dạng: English | Tiếng Việt</label><textarea data-k="phrases" placeholder="Hello | Xin chào\nThank you | Cảm ơn">${esc(data.phrases.map(p=>p.en+' | '+p.vi).join('\n'))}</textarea></div>` },
      { title:'Mission đầu tiên (tùy chọn)', render:() => `<div class="v15-field"><label>Một nhiệm vụ nói thực tế</label><input data-k="mission" value="${esc(data.mission)}" placeholder="VD: Gọi 1 ly cà phê bằng tiếng Anh"></div>` },
      { title:'Publish', render:() => `<div class="v15-modal-sub">Xem lại & tạo bài học:</div>
          <div class="v15-item"><div class="v15-item-title">${esc(data.emoji)} ${esc(data.name||'(chưa đặt tên)')}</div>
          <div class="v15-item-sub">Level ${data.level} · ${data.phrases.length} phrases · ${data.video?'có video':'không video'} · ${data.mission?'1 mission':'0 mission'}</div></div>` }
    ];
    function captureStep(bg) {
      bg.querySelectorAll('[data-k]').forEach(el => {
        const k = el.dataset.k;
        if (k === 'phrases') data.phrases = el.value.split('\n').map(l=>l.trim()).filter(Boolean).map(l => { const [en,vi] = l.split('|'); return { en:(en||'').trim(), vi:(vi||'').trim(), notes:'', example:'' }; });
        else if (k === 'level') data.level = parseInt(el.value,10)||1;
        else data[k] = el.value.trim();
      });
    }
    function draw() {
      NS.closeModal();
      const bg = document.createElement('div'); bg.className = 'v15-modal-bg';
      const s = steps[step];
      bg.innerHTML = `<div class="v15-modal">
        <div class="v15-wiz-steps">${steps.map((_,i)=>`<div class="v15-wiz-dot ${i<=step?'done':''}"></div>`).join('')}</div>
        <h3>New Topic · Bước ${step+1}/${steps.length}</h3>
        <div class="v15-modal-sub">${esc(s.title)}</div>
        <div class="v15-wiz-body">${s.render()}</div>
        <div class="v15-modal-actions">
          <button class="v15-btn ghost" data-a="back">${step===0?'Hủy':'← Quay lại'}</button>
          <div class="right"><button class="v15-btn primary" data-a="next">${step===steps.length-1?'✓ Tạo bài học':'Tiếp →'}</button></div>
        </div></div>`;
      bg.addEventListener('click', e => { if (e.target === bg) NS.closeModal(); });
      // emoji pick (step 1)
      bg.querySelectorAll('.v15-emoji-pick button').forEach(b => b.onclick = () => { data.emoji = b.textContent; bg.querySelectorAll('.v15-emoji-pick button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); });
      bg.querySelector('[data-a="back"]').onclick = () => { captureStep(bg); if (step===0) NS.closeModal(); else { step--; draw(); } };
      bg.querySelector('[data-a="next"]').onclick = () => {
        captureStep(bg);
        if (step === 0 && !data.name) { toastMsg('Nhập tên topic'); return; }
        if (step === steps.length-1) { NS.createTopic(data); return; }
        step++; draw();
      };
      document.body.appendChild(bg);
      const f = bg.querySelector('input,textarea,select'); if (f) f.focus();
    }
    draw();
  };
  NS.createTopic = function(data) {
    const s = getState(); if (!s) { toastMsg('State chưa sẵn sàng'); return; }
    const id = 'U-' + Date.now().toString(36);
    s.topics.push({ id, emoji:data.emoji||'📘', name:data.name, level:data.level||1,
      reviewStage:'Day 0', memoryStatus:'Fragile', lastReview:null, nextReview:null,
      masteryPct:0, confidence:0, sessions:0, status:'draft', subtitle:'', description:'', category:'' });
    saveState();
    const ov = getOv(id); const b = v15Bucket(ov);
    if (data.video && NS.parseVideo(data.video)) ov.videoImmersionUrl = data.video;
    if (data.phrases.length) { ov.notionOverrides = ov.notionOverrides || {}; ov.notionOverrides.phrases = { before:data.phrases, during:[], after:[] }; }
    if (data.mission) b.missions.push({ id:uid('mission'), title:data.mission, description:'', difficulty:'Medium', success:'' });
    saveOv(id, ov);
    NS.closeModal(); toastMsg('🎉 Đã tạo "' + data.name + '"');
    refreshDashboard();
    if (typeof window.openTopic === 'function') window.openTopic(id);
  };

  function ensureFab() {
    if (document.querySelector('.v15-fab')) return;
    const fab = document.createElement('button'); fab.className = 'v15-fab';
    fab.innerHTML = '＋ New Topic'; fab.title = 'Tạo bài học mới (không cần code)';
    fab.onclick = () => NS.openWizard();
    document.body.appendChild(fab);
  }

  // ============================================================
  // ORCHESTRATION — augment after v12 render
  // ============================================================
  NS.augment = function(view, topicId) {
    if (!view || !topicId) return;
    try { augmentHeader(view, topicId); } catch(e){ console.warn('[v15] header', e); }
    try { renderListEditor(view, topicId, LIST_CFG.missions); } catch(e){ console.warn('[v15] missions', e); }
    try { renderListEditor(view, topicId, LIST_CFG.recall); } catch(e){ console.warn('[v15] recall', e); }
    try { renderShadowEditor(view, topicId); } catch(e){ console.warn('[v15] shadow', e); }
    try { applySectionMgmt(view, topicId); } catch(e){ console.warn('[v15] secmgmt', e); }
    try { applySectionOrder(view, topicId); } catch(e){ console.warn('[v15] secorder', e); }
  };

  // remove missions/recall/shadow from v12 text-editable sections (v15 owns them now)
  if (Array.isArray(V12.EDITABLE_SECTIONS)) {
    V12.EDITABLE_SECTIONS = V12.EDITABLE_SECTIONS.filter(s => !['missions','active_recall','shadow_script'].includes(s.key));
  }

  // wrap v12 renderTopicDetail so v15 runs right after it
  const _v12render = V12.renderTopicDetail;
  V12.renderTopicDetail = function(view, topicId) {
    _v12render.call(V12, view, topicId);
    NS.augment(view, topicId);
  };

  injectCSS();
  ensureFab();

  // self-test
  NS.selfTest = function() {
    const r = [];
    const ok = (n, c) => { r.push((c?'PASS':'FAIL') + ' — ' + n); return c; };
    let all = true;
    all &= ok('SHADOW_V12 present', !!window.SHADOW_V12);
    all &= ok('state.topics readable', !!(getState() && Array.isArray(getState().topics)));
    all &= ok('overlay api', typeof V12.getOverlay === 'function' && typeof V12.saveOverlay === 'function');
    all &= ok('renderTopicDetail wrapped', V12.renderTopicDetail !== _v12render);
    all &= ok('block engine', !!(window.SHADOW_BLOCKS && window.SHADOW_BLOCKS.types.callout));
    all &= ok('editHeader fn', typeof NS.editHeader === 'function');
    all &= ok('video parser (yt+vimeo)', !!NS.parseVideo('https://youtu.be/abcdefghijk') && !!NS.parseVideo('https://vimeo.com/123456'));
    all &= ok('wizard fn', typeof NS.openWizard === 'function');
    all &= ok('FAB mounted', !!document.querySelector('.v15-fab'));
    console.log('[v15] SELF-TEST ' + (all ? 'PASSED' : 'FAILED'));
    r.forEach(function(x){ console.log('  ' + x); });
    return { ok: !!all, results: r };
  };

  console.log('[v15] Content Creation System v' + NS.version + ' loaded');
})();
