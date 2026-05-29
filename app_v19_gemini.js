// ============================================================
// SHADOW ENGLISH v19.0 — Phase 3.5: Real Gemini AI Integration (+ dashboard compaction)
// Date: 2026-05-29
// Additive module (remove the <script> tag to fully revert):
//   T1 Real provider: overrides SHADOW_V18.generators.gemini with a live Gemini call (gemini-2.5-flash).
//      Sets V18.config.provider = 'gemini' when a key is present, else stays 'mock'.
//   T2 Real generation: prompts Gemini for a topic-specific lesson (WHY/SCENE/VIDEO/20 PHRASES/SHADOW/EXERCISES)
//      returned as strict JSON, mapped to the exact shape V18 preview/save expects. No hardcoded templates.
//   T3 UX unchanged: Generate -> Preview -> Edit -> Save (all handled by V18). v19 only swaps the generator.
//   T4 SECURITY: API key is NEVER hardcoded or committed. It lives only in localStorage on the owner's browser
//      ('shadow-en-gemini-key'), entered in-app. On failure (no key / network / CORS / parse) -> graceful mock fallback.
//      Long-term proper fix = serverless proxy (e.g. Cloudflare Worker) holding the key server-side.
//   BONUS Dashboard compaction (CSS only): shrink NEXT BEST ACTION ~38%, reduce TODAY'S PRIORITY height ~30%,
//      tighten the today card so Next Action / Hôm nay học gì / Rescue / Memory fit higher up.
// Does NOT modify Learning Loop, Review, Memory, or any existing module's logic.
// ============================================================

(function setupV19Gemini() {
  if (window.SHADOW_V19) return;
  const NS = window.SHADOW_V19 = {};
  NS.version = '19.0.0';

  const V18 = window.SHADOW_V18 || null;
  const V15 = window.SHADOW_V15 || null;
  const KEY_LS = 'shadow-en-gemini-key';
  NS.MODEL = 'gemini-2.5-flash';

  const toastMsg = (m) => { try { (window.toast || function(){})(m); } catch(e){} };
  function getKey() { try { return (localStorage.getItem(KEY_LS) || '').trim(); } catch(e){ return ''; } }
  NS.hasKey = function() { return !!getKey(); };
  NS.setKey = function(k) {
    try { localStorage.setItem(KEY_LS, (k || '').trim()); } catch(e){}
    if (V18) V18.config.provider = getKey() ? 'gemini' : 'mock';
    toastMsg(getKey() ? '🔑 Đã lưu Gemini key (chỉ trong trình duyệt này)' : '🔑 Đã xoá key');
  };
  NS.clearKey = function() { try { localStorage.removeItem(KEY_LS); } catch(e){} if (V18) V18.config.provider = 'mock'; toastMsg('🔑 Đã xoá Gemini key'); };

  // ---------- prompt ----------
  function buildPrompt(spec) {
    const topic = (spec.name || '').trim();
    const level = spec.level || 'Beginner';
    const ctx = (spec.context || 'daily life').trim();
    return [
      'You are an expert English-for-Vietnamese-learners lesson designer.',
      'Create a COMPLETE, realistic, topic-specific lesson for the topic: "' + topic + '".',
      'Learner level: ' + level + '. Context: ' + ctx + '.',
      'Everything must be specific to THIS topic (no generic filler). English must be natural and idiomatic;',
      'difficulty must match the level. Vietnamese translations must be accurate and natural.',
      '',
      'Return ONLY valid JSON (no markdown, no comments) with EXACTLY this shape:',
      '{',
      '  "why": "1-3 sentences in Vietnamese: why this topic matters / when it is used",',
      '  "scene": "2-4 sentences in Vietnamese describing a concrete real-life scene for this topic",',
      '  "video": "3-5 English YouTube search keyword phrases, separated by \\" · \\"",',
      '  "phrases": [ {"en":"English phrase","vi":"Vietnamese translation"}, ... exactly 20 items, ordered before->during->after the interaction ],',
      '  "shadow": [ "A: ...", "B: ...", ... a natural 8-12 line dialogue specific to the topic ],',
      '  "exercises": [ {"q":"question (vi or en)","a":"answer","hint":"short hint"}, ... 4-6 items mixing recall and fill-in-the-blank ],',
      '  "repeat": [ "3-5 key English phrases the learner should repeat aloud" ]',
      '}'
    ].join('\n');
  }

  function coerceLesson(obj, spec) {
    if (!obj || typeof obj !== 'object') return null;
    const arr = (x) => Array.isArray(x) ? x : [];
    const phrases = arr(obj.phrases).map(p => {
      if (Array.isArray(p)) return [String(p[0]||''), String(p[1]||'')];
      return [String(p.en || p.english || ''), String(p.vi || p.vietnamese || '')];
    }).filter(p => p[0] || p[1]);
    const shadow = arr(obj.shadow).map(x => typeof x === 'string' ? x : (x.line || (x.speaker ? (x.speaker+': '+(x.text||'')) : String(x)))).filter(Boolean);
    const exercises = arr(obj.exercises).map(e => ({
      type: e.type || 'recall',
      q: String(e.q || e.question || ''),
      a: String(e.a || e.answer || ''),
      hint: String(e.hint || '')
    })).filter(e => e.q);
    const repeat = arr(obj.repeat).map(x => typeof x === 'string' ? x : String(x.en || x.text || x)).filter(Boolean);
    if (!phrases.length && !obj.why) return null;
    return {
      topic: spec.name, level: spec.level || 'Beginner', context: spec.context || '',
      why: String(obj.why || ''), scene: String(obj.scene || ''),
      video: String(obj.video || ''),
      phrases, shadow, exercises, repeat
    };
  }

  function extractJson(text) {
    if (!text) return null;
    try { return JSON.parse(text); } catch(e) {}
    // strip code fences / find first {...}
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch(e) {} }
    return null;
  }

  // ---------- the real generator ----------
  NS.geminiGenerate = function(spec) {
    const key = getKey();
    if (!key) { toastMsg('Chưa có Gemini key — dùng mock. Bấm 🔑 để nhập key.'); return V18.generators.mock(spec); }
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + NS.MODEL + ':generateContent?key=' + encodeURIComponent(key);
    const body = {
      contents: [{ role: 'user', parts: [{ text: buildPrompt(spec) }] }],
      generationConfig: { temperature: 0.9, responseMimeType: 'application/json', maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } }
    };
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(res => res.ok ? res.json() : res.text().then(t => { throw new Error('HTTP ' + res.status + ' ' + t.slice(0,160)); }))
      .then(data => {
        const txt = (((data.candidates || [])[0] || {}).content || {}).parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || '';
        const obj = extractJson(txt);
        const lesson = coerceLesson(obj, spec);
        if (!lesson) throw new Error('parse failed');
        toastMsg('✨ Gemini đã sinh bài học');
        return lesson;
      })
      .catch(err => {
        console.warn('[v19] Gemini failed:', err);
        toastMsg('⚠️ Gemini lỗi (' + (err.message || '').slice(0,40) + ') — tạm dùng mock');
        return V18.generators.mock(spec);
      });
  };

  // wire into v18
  if (V18 && V18.generators) {
    V18.generators.gemini = NS.geminiGenerate;
    V18.config.provider = getKey() ? 'gemini' : 'mock';
  }

  // ---------- key setup UI ----------
  NS.promptKey = function() {
    if (!V15 || typeof V15.openForm !== 'function') {
      const k = window.prompt('Dán Gemini API key (chỉ lưu trong trình duyệt này, KHÔNG commit lên GitHub):', getKey());
      if (k !== null) NS.setKey(k);
      return;
    }
    V15.openForm('🔑 Gemini API Key',
      'Key chỉ lưu trong localStorage trình duyệt này — KHÔNG bao giờ commit lên GitHub. Lấy key tại aistudio.google.com.',
      [{ key: 'key', label: 'Gemini API Key', type: 'text', placeholder: 'AIza… hoặc AQ.…' }],
      { key: getKey() },
      (out) => { NS.setKey(out.key); }
    );
  };

  // add a small key button to the Topics toolbar (next to the AI button)
  function addKeyButton() {
    const view = document.getElementById('view-topics');
    if (!view || !view.classList.contains('active')) return;
    const bar = view.querySelector('.v17-toolbar');
    if (!bar || bar.querySelector('[data-v19="key"]')) return;
    const b = document.createElement('button');
    b.className = 'v17-btn'; b.dataset.v19 = 'key';
    b.innerHTML = NS.hasKey() ? '🔑 Gemini: ON' : '🔑 Set Gemini Key';
    b.title = 'Cấu hình Gemini API key (lưu local, không commit)';
    b.onclick = NS.promptKey;
    bar.appendChild(b);
  }

  // ---------- BONUS: dashboard compaction (CSS only) ----------
  (function injectCSS(){
    const id = 'v19-styles-v1'; if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id;
    s.textContent = `
      /* NEXT BEST ACTION ~38% smaller */
      #view-home #loopv14-root .loopv14-nba { padding:13px 15px !important; }
      #view-home #loopv14-root .loopv14-nba-head { font-size:9.5px !important; letter-spacing:.12em !important; margin-bottom:4px !important; }
      #view-home #loopv14-root .loopv14-nba-title { font-size:15px !important; line-height:1.2 !important; margin-bottom:3px !important; }
      #view-home #loopv14-root .loopv14-nba-reason,
      #view-home #loopv14-root .loopv14-nba-meta { font-size:11px !important; margin-top:2px !important; }
      #view-home #loopv14-root .loopv14-btn.primary { padding:7px 14px !important; font-size:12px !important; margin-top:8px !important; }
      /* TODAY'S PRIORITY ~30% shorter */
      #view-home #loopv14-root .loopv14-priority-head { font-size:9.5px !important; margin:10px 0 6px !important; }
      #view-home #loopv14-root .loopv14-row { padding:5px 9px !important; font-size:11.5px !important; }
      #view-home #loopv14-root .loopv14-pcol-head { font-size:11px !important; margin-bottom:4px !important; }
      #view-home #loopv14-root .loopv14-row-emoji { font-size:13px !important; }
      /* tighten today card so Rescue / Memory sit higher */
      #view-home .today-section { margin-top:11px !important; }
      #view-home .today-section-title { margin-bottom:6px !important; }
      #view-home .today-rescue-row { min-height:44px !important; padding:7px 10px !important; }
    `;
    document.head.appendChild(s);
  })();

  let _t = null;
  function schedule() { clearTimeout(_t); _t = setTimeout(addKeyButton, 60); }
  (function startObserver(){
    const obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true });
    NS._obs = obs; schedule();
  })();

  // ---------- self-test ----------
  NS.selfTest = function() {
    const r = []; let all = true;
    const ok = (n,c) => { r.push((c?'PASS':'FAIL')+' — '+n); all = all && !!c; return c; };
    ok('V18 present', !!V18);
    ok('gemini generator wired', !!(V18 && V18.generators && V18.generators.gemini === NS.geminiGenerate));
    ok('provider reflects key', !!(V18 && V18.config.provider === (getKey() ? 'gemini' : 'mock')));
    ok('key helpers', typeof NS.setKey==='function' && typeof NS.promptKey==='function' && typeof NS.hasKey==='function');
    ok('prompt is topic-specific', buildPrompt({name:'At The Pharmacy'}).indexOf('At The Pharmacy') >= 0);
    ok('coerceLesson maps phrases', (() => { const L=coerceLesson({why:'x',phrases:[{en:'a',vi:'b'}],shadow:['A: hi'],exercises:[{q:'q',a:'a'}],repeat:['r']}, {name:'T'}); return L && L.phrases[0][0]==='a'; })());
    ok('dashboard compaction css', !!document.getElementById('v19-styles-v1'));
    console.log('[v19] SELF-TEST ' + (all?'PASSED':'FAILED') + ' (provider=' + (V18?V18.config.provider:'?') + ', hasKey=' + NS.hasKey() + ')');
    r.forEach(x => console.log('  ' + x));
    return { ok: all, results: r };
  };

  console.log('[v19] Gemini integration v' + NS.version + ' loaded (key ' + (NS.hasKey()?'present':'absent') + ')');
})();
