// ============================================================
// SHADOW ENGLISH v17.0 — Phase 2.5 Topic Lifecycle + Backup
// Date: 2026-05-29
// Additive module (remove the <script> tag to fully revert):
//   T1 Create Topic  (button in Topics Database + modal; auto-generates empty WHY/SCENE/VIDEO/PHRASES/EXERCISES)
//   T2 Duplicate Topic (clones info + all overlay content -> "… (Copy)")
//   T3 Archive / Delete Topic (Archive hides from learning flow but keeps data; Delete removes, with confirm)
//   T4 Lesson section CRUD — provided by v12/v15 (Why/Scene/Video/Phrases/Exercises). v17 surfaces lifecycle only.
//   T5 Export / Import Backup (JSON) for manual backup. LocalStorage only — no Supabase/Firebase.
// Does NOT modify Learning Loop (Phase 1), Review Engine, or Memory Engine logic.
// Storage: state.topics (via saveState) + per-topic overlay (shadow-en-overlay-{id}) + archive (shadow-en-archived).
// ============================================================

(function setupV17Topics() {
  if (window.SHADOW_V17) return;
  const NS = window.SHADOW_V17 = {};
  NS.version = '17.0.0';

  const V12 = window.SHADOW_V12 || null;
  const V15 = window.SHADOW_V15 || null;
  const V16 = window.SHADOW_V16 || null;

  const OVL = 'shadow-en-overlay-';
  const ARCH_KEY = 'shadow-en-archived';
  const STATE_KEY = 'shadow-en-state-v3';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const toastMsg = (m) => { try { (window.toast || function(){})(m); } catch(e){} };
  function getState() { return (window.shadowEN && window.shadowEN.state) || null; }
  function topics() { const s = getState(); return s && Array.isArray(s.topics) ? s.topics : []; }
  function getTopic(id) { return topics().find(t => t.id === id); }
  function saveState() {
    try { if (typeof window.saveState === 'function') return window.saveState(); } catch(e){}
    try { const s = getState(); if (s) localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch(e){}
  }
  function rawOverlay(id) { try { return JSON.parse(localStorage.getItem(OVL + id) || 'null'); } catch(e){ return null; } }
  function writeOverlay(id, ov) { try { localStorage.setItem(OVL + id, JSON.stringify(ov)); } catch(e){} }
  function delOverlay(id) { try { localStorage.removeItem(OVL + id); } catch(e){} }
  function loadArchive() { try { return JSON.parse(localStorage.getItem(ARCH_KEY) || '[]'); } catch(e){ return []; } }
  function saveArchive(a) { try { localStorage.setItem(ARCH_KEY, JSON.stringify(a)); } catch(e){} }
  function newId() { return 'U-' + Date.now().toString(36) + Math.random().toString(36).slice(2,4); }

  function emptyOverlay() {
    return { videoImmersionUrl: null, customBlocks: [],
      notionOverrides: { why:'', scene:'', phrases:{ before:[], during:[], after:[] } },
      v15: { missions:[], recall:[], shadowBlocks:[], sections:{ order:[], hidden:[] } } };
  }
  function freshTopic(fields) {
    return Object.assign({
      id: newId(), emoji:'📘', name:'New Topic', level:1,
      reviewStage:'Day 0', memoryStatus:'Fragile', lastReview:null, nextReview:null,
      masteryPct:0, confidence:0, sessions:0, status:'draft', subtitle:'', description:'', category:'', estMin:null
    }, fields || {});
  }

  function refreshAll() {
    saveState();
    try { if (typeof window.render === 'function') window.render(); } catch(e){}
    try { if (typeof window.renderTopicsAll === 'function') window.renderTopicsAll(); } catch(e){}
    try { if (V12 && V12._rerender) V12._rerender(); } catch(e){}
    scheduleAugment();
  }

  // ============================================================
  // CSS
  // ============================================================
  (function injectCSS(){
    const id = 'v17-styles-v1'; if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id;
    s.textContent = `
      .v17-toolbar { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .v17-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:12.5px; cursor:pointer;
        background:rgba(124,92,255,0.12); border:1px solid rgba(124,92,255,0.3); color:rgba(190,160,255,0.95); transition:all .15s; }
      .v17-btn:hover { background:rgba(124,92,255,0.25); color:#fff; }
      .v17-btn.primary { background:linear-gradient(135deg,#7c5cff,#b48cff); color:#fff; border-color:transparent; }
      .v17-btn.danger { background:rgba(239,68,68,0.10); border-color:rgba(239,68,68,0.3); color:#f87171; }
      .v17-btn.danger:hover { background:rgba(239,68,68,0.24); color:#fff; }
      .v17-card-actions { display:flex; gap:5px; margin-top:10px; flex-wrap:wrap; }
      .v17-card-actions button { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.72);
        font-size:11px; padding:4px 9px; border-radius:6px; cursor:pointer; transition:all .12s; }
      .v17-card-actions button:hover { background:rgba(124,92,255,0.25); color:#fff; }
      .v17-card-actions button.del:hover { background:rgba(239,68,68,0.28); color:#fff; }
      .v17-archived { grid-column:span 5; margin-top:6px; }
      .v17-arch-row { display:flex; align-items:center; gap:12px; padding:9px 13px; border-radius:9px; background:rgba(255,255,255,0.02);
        border:1px solid rgba(255,255,255,0.06); margin:6px 0; }
      .v17-arch-row .nm { flex:1; font-size:13px; color:rgba(255,255,255,0.8); }
      .v17-arch-row .meta { font-size:11px; color:rgba(255,255,255,0.4); }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // T1 — CREATE TOPIC
  // ============================================================
  const EMOJIS = ['📘','🍔','🗺️','🛍️','👋','🔢','✈️','🚌','🏨','📞','🏥','🤝','🚨','☕','💼','📝','💡','🎉','😊','📺','👔','📊','📚','🤔','❤️','😄','🧠','🎯','🌍','🎬'];

  NS.createTopic = function() {
    if (!V15 || typeof V15.openForm !== 'function') { toastMsg('Editor chưa sẵn sàng'); return; }
    const fields = [
      { key:'name', label:'Topic Name', type:'text' },
      { key:'emoji', label:'Icon (emoji)', type:'text', placeholder:'📘' },
      { key:'category', label:'Category', type:'text', placeholder:'Daily life, Business…' },
      { key:'level', label:'Level (1-3)', type:'select', options:[1,2,3] },
      { key:'description', label:'Description', type:'textarea' },
      { key:'estMin', label:'Estimated Duration (phút)', type:'number', placeholder:'18' }
    ];
    const bg = V15.openForm('Create Topic', 'Tạo bài học mới — tự sinh khung WHY / SCENE / VIDEO / PHRASES / EXERCISES để điền sau', fields, { emoji:'📘', level:1 }, (out) => {
      if (!out.name) { toastMsg('Topic name không được trống'); return false; }
      const s = getState(); if (!s) return;
      const t = freshTopic({
        name: out.name, emoji: out.emoji || '📘', category: out.category || '',
        level: parseInt(out.level,10) || 1, description: out.description || '',
        estMin: out.estMin === '' ? null : (parseInt(out.estMin,10) || null)
      });
      s.topics.push(t);
      writeOverlay(t.id, emptyOverlay()); // auto-generate empty structure
      toastMsg('🎉 Đã tạo topic "' + t.name + '"');
      refreshAll();
    });
    const ef = bg && bg.querySelector('[data-k="emoji"]');
    if (ef) {
      const pick = document.createElement('div'); pick.className = 'v15-emoji-pick'; pick.style.marginTop = '8px';
      pick.innerHTML = EMOJIS.map(e => `<button type="button">${e}</button>`).join('');
      pick.querySelectorAll('button').forEach(b => b.onclick = () => { ef.value = b.textContent; });
      ef.parentNode.appendChild(pick);
    }
  };

  // ============================================================
  // T2 — DUPLICATE TOPIC
  // ============================================================
  NS.duplicateTopic = function(id) {
    const orig = getTopic(id); if (!orig) return;
    const s = getState(); if (!s) return;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = newId();
    copy.name = orig.name + ' (Copy)';
    // fresh learning state for the clone (do not inherit review schedule)
    copy.reviewStage = 'Day 0'; copy.memoryStatus = 'Fragile';
    copy.lastReview = null; copy.nextReview = null;
    copy.masteryPct = 0; copy.confidence = 0; copy.sessions = 0;
    s.topics.push(copy);
    // clone overlay content (why/scene/video/phrases/exercises/blocks)
    const ov = rawOverlay(id); if (ov) writeOverlay(copy.id, JSON.parse(JSON.stringify(ov)));
    toastMsg('⧉ Đã nhân bản → "' + copy.name + '"');
    refreshAll();
  };

  // ============================================================
  // T3 — ARCHIVE / RESTORE / DELETE
  // ============================================================
  NS.archiveTopic = function(id) {
    const s = getState(); if (!s) return;
    const idx = s.topics.findIndex(t => t.id === id); if (idx < 0) return;
    const topic = s.topics[idx];
    const ov = rawOverlay(id);
    const arch = loadArchive();
    arch.push({ topic: topic, overlay: ov, at: Date.now() });
    saveArchive(arch);
    s.topics.splice(idx, 1);
    delOverlay(id);
    toastMsg('📦 Đã lưu trữ "' + topic.name + '" (ẩn khỏi luồng học, vẫn giữ dữ liệu)');
    refreshAll();
  };
  NS.restoreTopic = function(id) {
    const s = getState(); if (!s) return;
    const arch = loadArchive();
    const i = arch.findIndex(a => a.topic && a.topic.id === id); if (i < 0) return;
    const entry = arch[i];
    s.topics.push(entry.topic);
    if (entry.overlay) writeOverlay(entry.topic.id, entry.overlay);
    arch.splice(i, 1); saveArchive(arch);
    toastMsg('♻ Đã khôi phục "' + entry.topic.name + '"');
    refreshAll();
  };
  NS.deleteTopic = function(id, fromArchive) {
    const t = fromArchive ? (loadArchive().find(a => a.topic.id === id) || {}).topic : getTopic(id);
    const name = t ? t.name : id;
    if (!confirm('Xoá vĩnh viễn topic "' + name + '"?\nHành động này KHÔNG thể hoàn tác.\n(Mẹo: dùng Archive nếu chỉ muốn ẩn tạm.)')) return;
    if (fromArchive) {
      const arch = loadArchive().filter(a => a.topic.id !== id); saveArchive(arch);
    } else {
      const s = getState(); if (s) s.topics = s.topics.filter(x => x.id !== id);
    }
    delOverlay(id);
    toastMsg('🗑 Đã xoá "' + name + '"');
    refreshAll();
  };

  // ============================================================
  // T5 — EXPORT / IMPORT BACKUP (JSON)
  // ============================================================
  NS.exportBackup = function() {
    const s = getState();
    const overlays = {};
    (s ? s.topics : []).forEach(t => { const o = rawOverlay(t.id); if (o) overlays[t.id] = o; });
    const archived = loadArchive();
    archived.forEach(a => { if (a.overlay) overlays[a.topic.id] = a.overlay; });
    const backup = {
      schema: 'shadow-en-backup-v1',
      exportedAt: new Date().toISOString(),
      state: s,
      overlays: overlays,
      archived: archived
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shadow-english-backup-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toastMsg('⬇ Đã xuất backup JSON');
  };
  NS.importBackup = function() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = function() {
      const f = inp.files && inp.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = function() {
        let data;
        try { data = JSON.parse(reader.result); } catch(e) { toastMsg('⚠️ File không hợp lệ'); return; }
        if (!data || data.schema !== 'shadow-en-backup-v1' || !data.state) { toastMsg('⚠️ Không phải file backup Shadow English'); return; }
        if (!confirm('Khôi phục backup này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại và tải lại trang. Tiếp tục?')) return;
        try {
          localStorage.setItem(STATE_KEY, JSON.stringify(data.state));
          Object.keys(data.overlays || {}).forEach(tid => writeOverlay(tid, data.overlays[tid]));
          saveArchive(data.archived || []);
          toastMsg('⬆ Đã nhập backup — đang tải lại…');
          setTimeout(() => location.reload(), 600);
        } catch(e) { toastMsg('⚠️ Khôi phục thất bại: ' + e.message); }
      };
      reader.readAsText(f);
    };
    inp.click();
  };

  // ============================================================
  // UI AUGMENT — Topics Database view
  // ============================================================
  function augmentTopicsView() {
    const view = document.getElementById('view-topics');
    if (!view || !view.classList.contains("active")) return;

    // (a) toolbar in the header card
    const headerCard = view.querySelector('.card');
    if (headerCard && !headerCard.querySelector('.v17-toolbar')) {
      const bar = document.createElement('div'); bar.className = 'v17-toolbar';
      bar.innerHTML =
        '<button class="v17-btn primary" data-v17="new">+ New Topic</button>' +
        '<button class="v17-btn" data-v17="export">⬇ Export Backup</button>' +
        '<button class="v17-btn" data-v17="import">⬆ Import Backup</button>';
      bar.querySelector('[data-v17="new"]').onclick = NS.createTopic;
      bar.querySelector('[data-v17="export"]').onclick = NS.exportBackup;
      bar.querySelector('[data-v17="import"]').onclick = NS.importBackup;
      headerCard.appendChild(bar);
    }

    // (b) per-card actions
    view.querySelectorAll('.topic-card-real[data-topic]').forEach(card => {
      if (card.querySelector('.v17-card-actions')) return;
      const id = card.dataset.topic;
      const act = document.createElement('div'); act.className = 'v17-card-actions';
      act.innerHTML =
        '<button data-a="edit">✏ Edit</button>' +
        '<button data-a="dup">⧉ Duplicate</button>' +
        '<button data-a="arch">📦 Archive</button>' +
        '<button data-a="del" class="del">🗑 Delete</button>';
      act.querySelectorAll('button').forEach(b => b.onclick = (e) => {
        e.stopPropagation();
        const a = b.dataset.a;
        if (a === 'edit') { (V16 && V16.editHeader ? V16.editHeader : (V15 && V15.editHeader))(id); }
        else if (a === 'dup') NS.duplicateTopic(id);
        else if (a === 'arch') NS.archiveTopic(id);
        else if (a === 'del') NS.deleteTopic(id, false);
      });
      card.appendChild(act);
    });

    // (c) archived panel
    const grid = view.querySelector('#topics-grid');
    const arch = loadArchive();
    let panel = view.querySelector('.v17-archived');
    if (arch.length) {
      if (!panel) { panel = document.createElement('div'); panel.className = 'v17-archived card'; if (grid) grid.after(panel); else view.appendChild(panel); }
      panel.innerHTML = '<div class="card-title">📦 ARCHIVED · ' + arch.length + '</div>' +
        arch.map(a => '<div class="v17-arch-row"><span class="nm">' + esc(a.topic.emoji) + ' ' + esc(a.topic.name) + '</span>' +
          '<span class="meta">Level ' + esc(a.topic.level) + '</span>' +
          '<button class="v17-btn" data-r="' + esc(a.topic.id) + '">♻ Restore</button>' +
          '<button class="v17-btn danger" data-d="' + esc(a.topic.id) + '">🗑 Delete</button></div>').join('');
      panel.querySelectorAll('[data-r]').forEach(b => b.onclick = () => NS.restoreTopic(b.dataset.r));
      panel.querySelectorAll('[data-d]').forEach(b => b.onclick = () => NS.deleteTopic(b.dataset.d, true));
    } else if (panel) { panel.remove(); }
  }
  NS.augmentTopicsView = augmentTopicsView;

  let _t = null;
  function scheduleAugment() { clearTimeout(_t); _t = setTimeout(augmentTopicsView, 50); }
  (function startObserver(){
    const target = document.getElementById('view-topics') || document.body;
    const obs = new MutationObserver(scheduleAugment);
    obs.observe(target, { childList:true, subtree:true });
    NS._obs = obs;
    scheduleAugment();
  })();

  // ============================================================
  // SELF-TEST
  // ============================================================
  NS.selfTest = function() {
    const r = []; let all = true;
    const ok = (n,c) => { r.push((c?'PASS':'FAIL')+' — '+n); all = all && !!c; return c; };
    ok('state readable', !!(getState() && Array.isArray(getState().topics)));
    ok('createTopic fn', typeof NS.createTopic === 'function');
    ok('duplicateTopic fn', typeof NS.duplicateTopic === 'function');
    ok('archive/restore/delete fns', typeof NS.archiveTopic==='function' && typeof NS.restoreTopic==='function' && typeof NS.deleteTopic==='function');
    ok('export/import fns', typeof NS.exportBackup==='function' && typeof NS.importBackup==='function');
    ok('topics view augmenter + observer', typeof NS.augmentTopicsView==='function' && !!NS._obs);
    ok('openForm available (v15)', !!(V15 && typeof V15.openForm==='function'));
    console.log('[v17] SELF-TEST ' + (all?'PASSED':'FAILED'));
    r.forEach(x => console.log('  ' + x));
    return { ok: all, results: r };
  };

  console.log('[v17] Topic Lifecycle + Backup v' + NS.version + ' loaded');
})();
