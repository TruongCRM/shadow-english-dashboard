// ============================================================
// SHADOW ENGLISH v18.0 — Phase 3: AI Lesson Builder (Mock, future-ready)
// Date: 2026-05-29
// Additive module (remove the <script> tag to fully revert):
//   T1 "✨ Generate With AI" entry (Topics Database toolbar + injected into Create Topic modal)
//   T2 AI generates a full lesson: WHY / SCENE / VIDEO SUGGESTION / 20 CORE PHRASES / SHADOW SCRIPT / EXERCISES
//   T3 Preview before save — every section is editable / deletable / rewritable
//   T4 Save -> creates a real Topic (appears in Dashboard / Topic DB / Sidebar / Review, no reload)
//   T5 Provider abstraction: NS.config.provider = 'mock' (default). 'openai'/'claude' are stubs ready to wire.
// Does NOT modify Learning Loop (Phase 1), Review Engine, Memory Engine, or any existing module.
// Storage: same as v17 — state.topics (saveState) + per-topic overlay (shadow-en-overlay-{id}).
// ============================================================

(function setupV18AI() {
  if (window.SHADOW_V18) return;
  const NS = window.SHADOW_V18 = {};
  NS.version = '18.0.0';

  const V15 = window.SHADOW_V15 || null;
  const V12 = window.SHADOW_V12 || null;
  const OVL = 'shadow-en-overlay-';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const toastMsg = (m) => { try { (window.toast || function(){})(m); } catch(e){} };
  const uid = (p) => (p||'x') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  function getState() { return (window.shadowEN && window.shadowEN.state) || null; }
  function saveState() {
    try { if (typeof window.saveState === 'function') return window.saveState(); } catch(e){}
    try { const s = getState(); if (s) localStorage.setItem('shadow-en-state-v3', JSON.stringify(s)); } catch(e){}
  }
  function writeOverlay(id, ov) { try { localStorage.setItem(OVL + id, JSON.stringify(ov)); } catch(e){} }
  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  // ============================================================
  // PROVIDER ABSTRACTION (future-ready)
  // ============================================================
  NS.config = { provider: 'mock', apiKey: null, model: null };
  NS.generators = {
    mock: function(spec) { return Promise.resolve(mockGenerate(spec)); },
    // --- CUT-IN POINTS for real APIs (return the SAME lesson shape as mockGenerate) ---
    openai: function(spec) {
      // Future: fetch('https://api.openai.com/v1/chat/completions', { headers:{Authorization:'Bearer '+NS.config.apiKey}, ... })
      toastMsg('OpenAI provider chưa cấu hình — dùng mock'); return NS.generators.mock(spec);
    },
    claude: function(spec) {
      // Future: fetch('https://api.anthropic.com/v1/messages', { headers:{'x-api-key':NS.config.apiKey,'anthropic-version':'2023-06-01'}, ... })
      toastMsg('Claude provider chưa cấu hình — dùng mock'); return NS.generators.mock(spec);
    }
  };
  NS.generate = function(spec) {
    const g = NS.generators[NS.config.provider] || NS.generators.mock;
    try { return Promise.resolve(g(spec)); } catch(e) { return NS.generators.mock(spec); }
  };

  // ============================================================
  // MOCK GENERATOR
  // ============================================================
  function levelNote(level) {
    return level === 'Advanced' ? 'câu phức, từ vựng nâng cao'
      : level === 'Intermediate' ? 'câu tự nhiên, độ khó vừa'
      : 'câu ngắn, dễ nói';
  }
  function mockGenerate(spec) {
    const topic = spec.name.trim();
    const ctx = (spec.context || 'daily life').trim();
    const lvl = spec.level || 'Beginner';
    const T = topic; // keep original case for display

    const why = pick([
      'Chủ đề "'+T+'" xuất hiện thường xuyên trong '+ctx+'. Nắm vững nó giúp bạn phản xạ nhanh, không phải dịch trong đầu khi gặp tình huống thật.',
      'Khi học "'+T+'", bạn xây được bộ câu dùng ngay trong thực tế '+ctx+' — nói tự tin thay vì ấp úng tìm từ.'
    ]) + ' (Mức độ: ' + lvl + ' — ' + levelNote(lvl) + ')';

    const scene = pick([
      'Bạn bước vào một tình huống "'+T+'" điển hình. Có người đối thoại với bạn; bạn cần chào hỏi, nêu nhu cầu, hỏi đáp và kết thúc lịch sự.',
      'Hình dung bạn đang trực tiếp xử lý "'+T+'" ở nước ngoài: bắt đầu cuộc trò chuyện, trao đổi thông tin, rồi cảm ơn và rời đi.'
    ]);

    const video = T + ' conversation English · ' + T + ' role play English · learn English ' + T + ' (' + ctx + ')';

    // 20 core phrases (generic communicative, lightly topic-flavored)
    const phrases = [
      ['Hi, I need some help with '+T+'.', 'Chào, tôi cần giúp về '+T+'.'],
      ['Excuse me, do you have a moment?', 'Xin lỗi, bạn có rảnh một chút không?'],
      ['Good morning! How are you today?', 'Chào buổi sáng! Hôm nay bạn thế nào?'],
      ['Could you help me, please?', 'Bạn giúp tôi được không?'],
      ['I have a quick question.', 'Tôi có một câu hỏi nhanh.'],
      ['Is this the right place for '+T+'?', 'Đây có đúng chỗ cho '+T+' không?'],
      ['Sorry to bother you.', 'Xin lỗi đã làm phiền.'],
      ['Could you say that again, please?', 'Bạn nói lại được không?'],
      ['How much does it cost?', 'Cái này giá bao nhiêu?'],
      ['Can I pay by card?', 'Tôi trả bằng thẻ được không?'],
      ['Do you have anything cheaper?', 'Có loại nào rẻ hơn không?'],
      ['What do you recommend?', 'Bạn gợi ý loại nào?'],
      ["I'd like this one, please.", 'Cho tôi cái này.'],
      ['Can you write it down for me?', 'Bạn ghi ra giúp tôi được không?'],
      ['What time do you open and close?', 'Mấy giờ mở và đóng cửa?'],
      ['Thank you so much for your help.', 'Cảm ơn bạn rất nhiều.'],
      ["That's all I need, thanks.", 'Vậy là đủ rồi, cảm ơn.'],
      ['Have a great day!', 'Chúc một ngày tốt lành!'],
      ['I really appreciate it.', 'Tôi rất cảm kích.'],
      ['See you next time!', 'Hẹn gặp lại!']
    ];

    const shadow = [
      'A: Hi, I need some help with ' + T + '.',
      'B: Of course! What can I do for you?',
      'A: Could you explain how it works?',
      "B: Sure, it's simple — let me show you.",
      'A: Great. How much does it cost?',
      'B: It’s ten dollars. Would you like to pay by card?',
      'A: Yes, please. Thank you so much!',
      "B: You're welcome. Have a great day!"
    ];

    const exercises = [
      { type:'recall', q:'Bạn hỏi giá bằng tiếng Anh thế nào?', a:'How much does it cost?', hint:'cost' },
      { type:'fill',   q:'Can I pay ___ card?', a:'by', hint:'preposition' },
      { type:'recall', q:'Nói một câu kết thúc lịch sự.', a:'Thank you so much for your help.', hint:'thank' },
      { type:'fill',   q:'Could you ___ that again, please?', a:'say', hint:'repeat' }
    ];
    const repeat = [
      'How much does it cost?',
      'Could you help me, please?',
      'Thank you so much for your help.'
    ];

    return { topic:T, level:lvl, context:ctx, why, scene, video, phrases, shadow, exercises, repeat };
  }

  // ============================================================
  // CSS
  // ============================================================
  (function injectCSS(){
    const id='v18-styles-v1'; if(document.getElementById(id)) return;
    const s=document.createElement('style'); s.id=id;
    s.textContent = `
      .v18-ai-btn { background:linear-gradient(135deg,#ec4899,#7c5cff) !important; color:#fff !important; border-color:transparent !important; }
      .v18-sec { border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px; margin-bottom:12px; background:rgba(255,255,255,0.02); }
      .v18-sec.removed { opacity:.4; }
      .v18-sec-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:7px; }
      .v18-sec-title { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:rgba(190,160,255,0.95); font-weight:700; }
      .v18-sec-tools { display:flex; gap:5px; }
      .v18-sec-tools button { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); font-size:11px; padding:3px 8px; border-radius:6px; cursor:pointer; }
      .v18-sec-tools button:hover { background:rgba(124,92,255,0.25); color:#fff; }
      .v18-sec-tools button.del:hover { background:rgba(239,68,68,0.28); color:#fff; }
      .v18-sec textarea, .v18-sec input { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:7px; color:#fff; font-size:12.5px; padding:8px 10px; font-family:inherit; line-height:1.5; resize:vertical; }
      .v18-hint { font-size:10.5px; color:rgba(255,255,255,0.4); margin-top:4px; }
    `;
    document.head.appendChild(s);
  })();

  // ============================================================
  // T1 — AI SPEC POPUP
  // ============================================================
  NS.openAIGenerator = function() {
    if (!V15 || typeof V15.openForm !== 'function') { toastMsg('Editor chưa sẵn sàng'); return; }
    V15.closeModal && V15.closeModal();
    V15.openForm('✨ Generate Lesson With AI', 'Nhập tên chủ đề — AI tự sinh bài học hoàn chỉnh để bạn xem & sửa trước khi lưu', [
      { key:'name', label:'Topic Name', type:'text', placeholder:'VD: At The Pharmacy / Ordering Pizza' },
      { key:'level', label:'Level', type:'select', options:['Beginner','Intermediate','Advanced'] },
      { key:'context', label:'Context (tùy chọn)', type:'text', placeholder:'Travel · Business · Daily Life' }
    ], { level:'Beginner' }, (out) => {
      if (!out.name) { toastMsg('Nhập tên chủ đề'); return false; }
      toastMsg('✨ Đang sinh bài học…');
      NS.generate({ name: out.name, level: out.level, context: out.context }).then(lesson => {
        NS.openPreview(lesson);
      });
    });
  };

  // ============================================================
  // T2/T3 — PREVIEW (edit / delete / rewrite each section)
  // ============================================================
  function phrasesToText(phrases) { return phrases.map(p => p[0] + ' | ' + p[1]).join('\n'); }
  function exercisesToText(ex) { return ex.map(e => e.q + ' :: ' + e.a + (e.hint ? ' :: ' + e.hint : '')).join('\n'); }

  NS.openPreview = function(lesson) {
    V15.closeModal && V15.closeModal();
    const bg = document.createElement('div'); bg.className = 'v15-modal-bg';
    const sections = [
      { key:'why',   title:'1 · WHY',                  type:'textarea', value: lesson.why },
      { key:'scene', title:'2 · SCENE',                type:'textarea', value: lesson.scene },
      { key:'video', title:'3 · VIDEO SUGGESTION (YouTube keywords)', type:'input', value: lesson.video },
      { key:'phrases', title:'4 · CORE PHRASES (English | Tiếng Việt)', type:'textarea', value: phrasesToText(lesson.phrases), rows:10 },
      { key:'shadow', title:'5 · SHADOW SCRIPT',       type:'textarea', value: lesson.shadow.join('\n'), rows:8 },
      { key:'repeat', title:'6a · EXERCISES — Repeat (mỗi dòng 1 câu)', type:'textarea', value: lesson.repeat.join('\n') },
      { key:'exercises', title:'6b · EXERCISES — Fill Blank / Recall (Câu hỏi :: Đáp án :: Gợi ý)', type:'textarea', value: exercisesToText(lesson.exercises), rows:5 }
    ];
    const secHtml = sections.map(s => {
      const field = s.type === 'input'
        ? '<input data-k="'+s.key+'" value="'+esc(s.value)+'">'
        : '<textarea data-k="'+s.key+'" rows="'+(s.rows||4)+'">'+esc(s.value)+'</textarea>';
      return '<div class="v18-sec" data-sec="'+s.key+'">'+
        '<div class="v18-sec-head"><span class="v18-sec-title">'+esc(s.title)+'</span>'+
        '<span class="v18-sec-tools"><button data-act="rewrite" data-k="'+s.key+'">↻ Rewrite</button>'+
        '<button data-act="del" class="del" data-k="'+s.key+'">🗑 Delete</button></span></div>'+
        field + '</div>';
    }).join('');

    bg.innerHTML = '<div class="v15-modal" style="max-width:680px">'+
      '<h3>✨ Preview Lesson — '+esc(lesson.topic)+'</h3>'+
      '<div class="v15-modal-sub">AI mock đã sinh nháp. Sửa / Xoá / Rewrite từng phần, rồi mới Save. (Chưa lưu gì cả.)</div>'+
      secHtml +
      '<div class="v15-modal-actions"><button class="v15-btn ghost" data-act="cancel">Hủy</button>'+
      '<div class="right"><button class="v15-btn primary" data-act="save">💾 Save Topic</button></div></div>'+
    '</div>';

    bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
    bg.querySelector('[data-act="cancel"]').onclick = () => bg.remove();
    bg.querySelectorAll('[data-act="del"]').forEach(b => b.onclick = () => {
      const sec = bg.querySelector('.v18-sec[data-sec="'+b.dataset.k+'"]');
      const f = sec.querySelector('[data-k]');
      f.value = ''; sec.classList.add('removed');
    });
    bg.querySelectorAll('[data-act="rewrite"]').forEach(b => b.onclick = () => {
      const fresh = mockGenerate({ name: lesson.topic, level: lesson.level, context: lesson.context });
      const k = b.dataset.k;
      const sec = bg.querySelector('.v18-sec[data-sec="'+k+'"]'); sec.classList.remove('removed');
      const f = sec.querySelector('[data-k]');
      if (k === 'phrases') f.value = phrasesToText(fresh.phrases);
      else if (k === 'shadow') f.value = fresh.shadow.join('\n');
      else if (k === 'repeat') f.value = fresh.repeat.join('\n');
      else if (k === 'exercises') f.value = exercisesToText(fresh.exercises);
      else f.value = fresh[k];
      toastMsg('↻ Đã viết lại phần ' + k);
    });
    bg.querySelector('[data-act="save"]').onclick = () => {
      const vals = {}; bg.querySelectorAll('[data-k]').forEach(el => vals[el.dataset.k] = el.value.trim());
      NS.saveLesson(lesson, vals);
      bg.remove();
    };
    document.body.appendChild(bg);
  };

  // ============================================================
  // T4 — SAVE INTO SYSTEM
  // ============================================================
  function levelNum(lvl) { return lvl === 'Advanced' ? 3 : lvl === 'Intermediate' ? 2 : 1; }
  function parsePhrases(text) {
    const before=[], during=[], after=[];
    const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
    lines.forEach((l, i) => {
      const [en, vi] = l.split('|').map(x => (x||'').trim());
      const item = { en: en||'', vi: vi||'', notes:'', example:'' };
      const g = i < Math.ceil(lines.length/3) ? before : (i < Math.ceil(lines.length*2/3) ? during : after);
      g.push(item);
    });
    return { before, during, after };
  }
  function parseExercises(text) {
    return text.split('\n').map(l=>l.trim()).filter(Boolean).map(l => {
      const parts = l.split('::').map(x => (x||'').trim());
      return { id: uid('rc'), question: parts[0]||'', answer: parts[1]||'', hint: parts[2]||'' };
    });
  }

  NS.saveLesson = function(lesson, vals) {
    const s = getState(); if (!s) { toastMsg('State chưa sẵn sàng'); return; }
    const id = 'U-' + Date.now().toString(36) + Math.random().toString(36).slice(2,4);
    const topic = {
      id, emoji:'✨', name: lesson.topic, level: levelNum(lesson.level),
      reviewStage:'Day 0', memoryStatus:'Fragile', lastReview:null, nextReview:null,
      masteryPct:0, confidence:0, sessions:0, status:'draft',
      subtitle:'', description:(vals.why||'').slice(0,140), category: lesson.context || '', estMin: 15
    };
    const ov = { videoImmersionUrl:null, customBlocks:[],
      notionOverrides:{ why: vals.why||'', scene: vals.scene||'', phrases: parsePhrases(vals.phrases||'') },
      v15:{ missions:[], recall:[], shadowBlocks:[], sections:{ order:[], hidden:[] } } };
    if (vals.video) ov.customBlocks.push({ id: uid('b'), type:'note', title:'🎬 Video Immersion — gợi ý tìm trên YouTube', text: vals.video });
    if (vals.shadow) ov.v15.shadowBlocks = vals.shadow.split('\n').map(l=>l.trim()).filter(Boolean).map(l => ({ id: uid('sb'), type:'paragraph', text: l }));
    const rc = [];
    if (vals.exercises) parseExercises(vals.exercises).forEach(e => rc.push(e));
    ov.v15.recall = rc;
    if (vals.repeat) ov.v15.missions = vals.repeat.split('\n').map(l=>l.trim()).filter(Boolean).map(l => ({ id: uid('m'), title:'Lặp lại to ×5: "'+l+'"', description:'Đọc to và ghi âm so sánh.', difficulty:'Easy', success:'Nói trôi chảy không nhìn' }));

    s.topics.push(topic);
    writeOverlay(id, ov);
    saveState();
    // live refresh — no reload
    try { if (typeof window.render === 'function') window.render(); } catch(e){}
    try { if (typeof window.renderTopicsAll === 'function') window.renderTopicsAll(); } catch(e){}
    toastMsg('🎉 Đã lưu bài học AI "' + topic.name + '"');
    try { if (typeof window.openTopic === 'function') window.openTopic(id); } catch(e){}
  };

  // ============================================================
  // ENTRY POINTS — toolbar button + inject into Create Topic modal
  // ============================================================
  function addToolbarButton() {
    const view = document.getElementById('view-topics');
    if (!view || !view.classList.contains('active')) return;
    const bar = view.querySelector('.v17-toolbar');
    if (!bar || bar.querySelector('[data-v18="ai"]')) return;
    const b = document.createElement('button');
    b.className = 'v17-btn v18-ai-btn'; b.dataset.v18 = 'ai'; b.innerHTML = '✨ Generate With AI';
    b.onclick = NS.openAIGenerator;
    bar.appendChild(b);
  }
  function injectIntoCreateModal(node) {
    try {
      if (!node.querySelector) return;
      const modal = node.matches && node.matches('.v15-modal-bg') ? node : node.querySelector('.v15-modal-bg');
      if (!modal) return;
      const h3 = modal.querySelector('h3');
      if (!h3 || !/Create Topic/i.test(h3.textContent)) return;
      const actions = modal.querySelector('.v15-modal-actions');
      if (!actions || actions.querySelector('[data-v18="ai"]')) return;
      const b = document.createElement('button');
      b.className = 'v15-btn v18-ai-btn'; b.dataset.v18 = 'ai'; b.innerHTML = '✨ Generate With AI';
      b.onclick = NS.openAIGenerator;
      actions.insertBefore(b, actions.firstChild);
    } catch(e){}
  }

  let _t = null;
  function schedule() { clearTimeout(_t); _t = setTimeout(addToolbarButton, 50); }
  (function startObserver(){
    const obs = new MutationObserver((muts) => {
      schedule();
      muts.forEach(m => m.addedNodes && m.addedNodes.forEach(n => { if (n.nodeType === 1) injectIntoCreateModal(n); }));
    });
    obs.observe(document.body, { childList:true, subtree:true });
    NS._obs = obs;
    schedule();
  })();

  // ============================================================
  // SELF-TEST
  // ============================================================
  NS.selfTest = function() {
    const r = []; let all = true;
    const ok = (n,c) => { r.push((c?'PASS':'FAIL')+' — '+n); all = all && !!c; return c; };
    ok('state readable', !!(getState() && Array.isArray(getState().topics)));
    ok('provider abstraction', NS.config.provider === 'mock' && typeof NS.generate === 'function');
    const L = mockGenerate({ name:'At The Pharmacy', level:'Beginner', context:'Daily Life' });
    ok('mock generates why/scene', !!L.why && !!L.scene);
    ok('mock 20 phrases', Array.isArray(L.phrases) && L.phrases.length === 20);
    ok('mock shadow + exercises', L.shadow.length>0 && L.exercises.length>0);
    ok('openAIGenerator / openPreview / saveLesson', typeof NS.openAIGenerator==='function' && typeof NS.openPreview==='function' && typeof NS.saveLesson==='function');
    ok('openForm available (v15)', !!(V15 && typeof V15.openForm==='function'));
    ok('observer active', !!NS._obs);
    console.log('[v18] SELF-TEST ' + (all?'PASSED':'FAILED'));
    r.forEach(x => console.log('  ' + x));
    return { ok: all, results: r };
  };

  console.log('[v18] AI Lesson Builder v' + NS.version + ' loaded (provider: ' + NS.config.provider + ')');
})();
