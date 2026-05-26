// ============================================================
// SHADOW ENGLISH v8 — Real Learning Experience
// Focus Mode + Audio Integration + Lesson View + Keyboard
// ============================================================

// ============= FOCUS MODE =============
window.focusMode = false;
function toggleFocusMode(force) {
  window.focusMode = typeof force === 'boolean' ? force : !window.focusMode;
  document.body.classList.toggle('focus-mode', window.focusMode);
  if (window.focusMode) toast('🧘 Focus mode · ESC để thoát');
}

// ============= KEYBOARD SHORTCUTS =============
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
  // Only when in a session
  const inSession = document.getElementById('view-session')?.classList.contains('active');
  if (e.key === 'Escape') {
    if (window.focusMode) { toggleFocusMode(false); return; }
    // Close any open modal
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
  }
  if (!inSession) return;
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    // Play current step's audio if exists
    const audio = document.querySelector('.session-step.active .audio-btn');
    if (audio) audio.click();
  }
  if (e.key === 'r' || e.key === 'R') {
    const audio = document.querySelector('.session-step.active .audio-btn');
    if (audio) audio.click();
  }
  if (e.key === 's' || e.key === 'S') {
    SHADOW_AUDIO.rate = SHADOW_AUDIO.rate === 1 ? 0.75 : 1;
    toast('🔉 Speed: ' + SHADOW_AUDIO.rate + 'x');
  }
  if (e.key === 'l' || e.key === 'L') {
    const looped = SHADOW_AUDIO.toggleLoop();
    toast('🔁 Loop: ' + (looped ? 'ON' : 'OFF'));
  }
  if (e.key === 'n' || e.key === 'N' || e.key === 'Enter') {
    const btn = document.querySelector('[data-action="next-step"]');
    if (btn) btn.click();
  }
  if (e.key === 'f' || e.key === 'F') {
    toggleFocusMode();
  }
});

// ============= ENHANCE PHRASE ROW WITH AUDIO =============
function enhancePhrases(rootEl) {
  rootEl.querySelectorAll('.phrase-row').forEach(row => {
    if (row.querySelector('.audio-btn')) return;
    const en = row.querySelector('.phrase-en')?.textContent;
    if (!en) return;
    const btn = document.createElement('button');
    btn.className = 'audio-btn';
    btn.dataset.audio = en;
    btn.textContent = '▶';
    btn.title = 'Play (' + en.substring(0, 30) + ')';
    row.insertBefore(btn, row.firstChild);
  });
}

// ============= ENHANCED SESSION VIEW =============
function renderSessionViewV8() {
  const view = document.getElementById('view-session');
  if (!view) return;
  const cs = state.currentSession;
  const topic = cs ? state.topics.find(t => t.id === cs.topicId) : (getNewTopic() || state.topics[0]);
  if (!topic) return;
  const c = SHADOW_CONTENT.getContent(topic.id);
  const step = cs ? cs.step : 1;
  const steps = [
    { num: 1, icon: '☕', name: 'WARM-UP',     time: '2m',  desc: 'Đọc WHY & SCENE · Ready your mind' },
    { num: 2, icon: '👂', name: 'LISTEN',      time: '8m',  desc: 'Nghe shadow script · Đọc theo mắt · KHÔNG nói' },
    { num: 3, icon: '🎧', name: 'SHADOW',      time: '15m', desc: 'Nghe + nói cùng lúc ×3 · Imitate 100%' },
    { num: 4, icon: '🔁', name: 'REPEAT',      time: '8m',  desc: 'Đọc to phrases · Ghi âm + so sánh' },
    { num: 5, icon: '🧠', name: 'RECALL',      time: '10m', desc: 'ĐÓNG SCRIPT · Trả lời bằng miệng' },
    { num: 6, icon: '🗣️', name: 'SPEAK',       time: '8m',  desc: 'Dùng phrases trong dialogue · Tự tạo context' },
    { num: 7, icon: '🌍', name: 'MISSION',     time: '6m',  desc: 'Dùng phrases ngoài đời thật · NGOÀI app' },
    { num: 8, icon: '✅', name: 'REFLECTION',  time: '3m',  desc: 'Confidence 1-5 · Update memory' }
  ];
  const pct = ((step-1)/8)*100;
  const phraseAll = [...(c.phrases?.before||[]),...(c.phrases?.during||[]),...(c.phrases?.after||[])];

  view.innerHTML = `
    <div class="session-hero session-hero-v8">
      <button class="focus-toggle" onclick="toggleFocusMode()" title="Focus mode (F)">🧘 Focus</button>
      <div class="session-emoji">${topic.emoji}</div>
      <div class="session-meta">
        <div class="session-stage">${topic.reviewStage}  ·  ${topic.memoryStatus.toUpperCase()}  ·  MASTERY ${topic.masteryPct}%</div>
        <div class="session-title">${topic.name}</div>
        <div class="session-sub">Level ${topic.level} · ${phraseAll.length} phrases · Step ${step}/8</div>
      </div>
      <div class="session-progress-ring" style="background: conic-gradient(#7c5cff ${pct}%, #2a2750 ${pct}%)">
        <span>${step-1}/8</span><small>steps</small>
      </div>
    </div>

    <div class="audio-controls">
      <div class="audio-control-group">
        <span class="audio-label">SPEED:</span>
        <button class="ac-btn ${SHADOW_AUDIO.rate === 0.75 ? 'active' : ''}" onclick="SHADOW_AUDIO.setRate(0.75);renderSessionViewV8()">0.75×</button>
        <button class="ac-btn ${SHADOW_AUDIO.rate === 1 ? 'active' : ''}" onclick="SHADOW_AUDIO.setRate(1);renderSessionViewV8()">1×</button>
        <button class="ac-btn ${SHADOW_AUDIO.rate === 1.25 ? 'active' : ''}" onclick="SHADOW_AUDIO.setRate(1.25);renderSessionViewV8()">1.25×</button>
      </div>
      <div class="audio-control-group">
        <button class="ac-btn ${SHADOW_AUDIO.loop ? 'active' : ''}" onclick="SHADOW_AUDIO.toggleLoop();renderSessionViewV8()">🔁 Loop ${SHADOW_AUDIO.loop?'ON':'OFF'}</button>
        <button class="ac-btn" onclick="SHADOW_AUDIO.stop()">⏹ Stop</button>
      </div>
      <div class="audio-hint">⌨ Space=play · R=replay · S=slow · L=loop · N=next · F=focus · Esc=exit</div>
    </div>

    <div class="session-steps">
      ${steps.map(s => `
        <div class="session-step ${s.num<step?'done':s.num===step?'active':''}">
          <div class="step-num">${s.num<step?'✓':s.num}</div>
          <div class="step-body">
            <div class="step-title">${s.icon} ${s.name}  ·  <span style="color:var(--text-3);font-weight:500">${s.time}</span></div>
            <div class="step-desc">${s.desc}</div>
            ${s.num === step ? renderStepV8(s.num, topic, c) : ''}
          </div>
          ${s.num < step ? '<button class="step-btn" disabled>✓ Done</button>' :
            s.num === step ? `<button class="step-btn primary" data-action="next-step">${s.num===8?'Complete ✨':'Next →'}</button>` :
            '<button class="step-btn" disabled>Locked</button>'}
        </div>
      `).join('')}
    </div>
  `;
  const nextBtn = view.querySelector('[data-action="next-step"]');
  if (nextBtn) nextBtn.onclick = advanceStep;
}

function renderStepV8(n, topic, c) {
  const phraseAll = [...(c.phrases?.before||[]),...(c.phrases?.during||[]),...(c.phrases?.after||[])];
  if (n === 1) return `<div class="step-content">
    <div class="lesson-block"><b>WHY:</b> ${c.why||'(coming)'}</div>
    <div class="lesson-block"><b>SCENE:</b> ${c.scene||'(coming)'}</div>
    <div class="step-tip">💡 Just absorb. No need to memorize.</div>
  </div>`;
  if (n === 2) return `<div class="step-content">
    <div class="lesson-block"><b>👂 LISTEN — eyes only, no speak yet</b></div>
    <div class="shadow-box">
      <button class="audio-btn audio-btn-big" data-audio="${(c.shadow_script||'').replace(/"/g,'&quot;')}">▶ Play script</button>
      <div class="shadow-text">"${c.shadow_script||'(no script)'}"</div>
    </div>
  </div>`;
  if (n === 3) return `<div class="step-content">
    <div class="lesson-block"><b>🎧 SHADOW — Listen + Speak together (×3)</b></div>
    <div class="shadow-box">
      <button class="audio-btn audio-btn-big" data-audio="${(c.shadow_script||'').replace(/"/g,'&quot;')}">▶ Play once</button>
      <button class="audio-btn audio-btn-big" onclick="SHADOW_AUDIO.speakLoop('${(c.shadow_script||'').replace(/'/g,"\\'").replace(/"/g,'&quot;')}', 3, {forceCount:true})">🔁 Play ×3</button>
      <div class="shadow-text">"${c.shadow_script||''}"</div>
    </div>
    <div class="step-tip">💡 Imitate intonation 100%. Don't focus on meaning.</div>
  </div>`;
  if (n === 4) return `<div class="step-content">
    <div class="lesson-block"><b>🔁 REPEAT — Each phrase out loud</b></div>
    <div class="phrase-list">
      ${phraseAll.slice(0,8).map(p => `
        <div class="phrase-row">
          <button class="audio-btn" data-audio="${p[0].replace(/"/g,'&quot;')}">▶</button>
          <span class="phrase-en">${p[0]}</span>
          <span class="phrase-vi">${p[1]||''}</span>
        </div>
      `).join('')}
    </div>
    ${phraseAll.length > 8 ? '<div class="step-tip">💡 +'+(phraseAll.length-8)+' phrases — xem full ở Topic Detail</div>' : ''}
  </div>`;
  if (n === 5) return `<div class="step-content">
    <div class="lesson-block"><b>🧠 RECALL — Close eyes. Speak aloud:</b></div>
    <ul class="recall-questions">${(c.active_recall||[]).map(q=>`<li>${q}</li>`).join('')||'<li>Tự nói lại toàn bộ phrases trong 2 phút</li>'}</ul>
    <div class="recorder-box">
      <button class="rec-btn" id="rec-btn" onclick="toggleRec()">🎙️ Record me</button>
      <button class="step-btn" onclick="SHADOW_AUDIO.playRecording()">▶ Play my voice</button>
    </div>
  </div>`;
  if (n === 6) return `<div class="step-content">
    <div class="lesson-block"><b>🗣️ SPEAK — Use in dialogue</b></div>
    ${(c.dialogues||[]).slice(0,1).map(d => `
      <div class="dialogue-mode">
        <div class="dialogue-title">${d.title}</div>
        ${d.lines.map(l => `<div class="dialogue-line">
          <button class="audio-btn" data-audio="${l[1].replace(/"/g,'&quot;')}">▶</button>
          <b>${l[0]}:</b> ${l[1]}
        </div>`).join('')}
      </div>
    `).join('') || '(Self-create dialogue using phrases)'}
  </div>`;
  if (n === 7) return `<div class="step-content">
    <div class="lesson-block"><b>🌍 REAL LIFE MISSION — pick 1:</b></div>
    <ul class="mission-checklist">${(c.missions||[]).map((m,i)=>`<li><label><input type="checkbox" data-mission-step="${i}"/> ${m}</label></li>`).join('')||'<li>Dùng phrase với người thật trong 24h</li>'}</ul>
    <div class="step-tip">💡 Đây là step quan trọng nhất. Phrase chưa dùng = chưa thuộc.</div>
  </div>`;
  if (n === 8) return `<div class="step-content">
    <div class="lesson-block"><b>✅ How natural did it feel?</b></div>
    <div class="conf-buttons-big">
      ${[1,2,3,4,5].map(i => `<button class="conf-btn-big conf-${i}" onclick="window._sessionConf=${i};document.querySelector('[data-action=next-step]').click()">${i}<small>${['Forgot','Weak','OK','Good','Reflex'][i-1]}</small></button>`).join('')}
    </div>
  </div>`;
  return '';
}

// Voice recorder toggle
window.toggleRec = async function() {
  const btn = document.getElementById('rec-btn');
  if (!btn) return;
  if (SHADOW_AUDIO.recording) {
    SHADOW_AUDIO.stopRecording();
    btn.textContent = '🎙️ Record me';
    btn.classList.remove('recording');
    toast('🎙️ Recording stopped · Click Play my voice');
  } else {
    const ok = await SHADOW_AUDIO.startRecording();
    if (ok) {
      btn.textContent = '⏹ Stop recording';
      btn.classList.add('recording');
      toast('🔴 Recording...');
    }
  }
};

// ============= ENHANCED TOPIC DETAIL =============
const _origRenderTopicDetail = window.renderTopicDetail;
window.renderTopicDetail = function() {
  if (_origRenderTopicDetail) _origRenderTopicDetail();
  setTimeout(() => {
    const view = document.getElementById('view-topic-detail');
    if (view) enhancePhrases(view);
  }, 50);
};

// Override session view render
window.renderSessionView = renderSessionViewV8;

// Hook auto-enhance on render
const _origRender2 = window.render;
window.render = function() {
  if (_origRender2) _origRender2();
  // Add audio to existing phrase-rows on home
  document.querySelectorAll('.view.active').forEach(v => enhancePhrases(v));
};

console.log('Shadow English v8 — Real Learning Experience loaded 🎧');


// ============= V8.1 FIX — Auto-enhance phrases on navigate =============
// Override NAV_RENDERS entries to add enhancePhrases after render
(function() {
  function wrap(fn, viewId) {
    return function() {
      if (fn) fn();
      setTimeout(() => {
        const v = document.getElementById('view-' + viewId);
        if (v) enhancePhrases(v);
      }, 50);
    };
  }
  if (typeof NAV_RENDERS !== 'undefined') {
    NAV_RENDERS['topic-detail'] = wrap(NAV_RENDERS['topic-detail'], 'topic-detail');
    NAV_RENDERS['phrases'] = wrap(NAV_RENDERS['phrases'], 'phrases');
    NAV_RENDERS['memory'] = wrap(NAV_RENDERS['memory'], 'memory');
    NAV_RENDERS['topics'] = wrap(NAV_RENDERS['topics'], 'topics');
    NAV_RENDERS['level1'] = wrap(NAV_RENDERS['level1'], 'level1');
    NAV_RENDERS['level2'] = wrap(NAV_RENDERS['level2'], 'level2');
    NAV_RENDERS['level3'] = wrap(NAV_RENDERS['level3'], 'level3');
  }
  // MutationObserver fallback for any future renders
  const observer = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1) {
          if (n.classList?.contains('phrase-row')) {
            enhancePhrases(n.parentElement);
          } else if (n.querySelector?.('.phrase-row')) {
            enhancePhrases(n);
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

