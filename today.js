// === SHADOW ENGLISH — TODAY (Daily Loop) (v11.1) ===
// Renders the "Hôm nay" card at top of view-home.
// 3 sections: Survival Patterns · Rescue Queue · Memory Pulse
//
// Calm/premium aesthetic. No flashy gamification.
// Self-contained CSS — does NOT modify index.html styles.
//
// API:
//   SHADOW_TODAY.build()    → HTML string
//   SHADOW_TODAY.inject()   → idempotent DOM insert at top of view-home
//   SHADOW_TODAY.bind()     → attach click handlers
//
// Last update: 2026-05-26 (v11.1)

(function() {
  'use strict';

  // ---------- CSS (calm/premium, single injection) ----------
  var CSS = [
    '.today-card {',
    '  grid-column: span 5;',
    '  background: linear-gradient(180deg, rgba(124,92,255,0.06) 0%, var(--card) 60%);',
    '  border: 1px solid var(--border);',
    '  border-radius: 16px;',
    '  padding: 28px 28px 24px;',
    '  margin-bottom: 4px;',
    '  position: relative;',
    '  overflow: hidden;',
    '}',
    '.today-card:before {',
    '  content: "";',
    '  position: absolute; inset: 0;',
    '  border-radius: 16px;',
    '  background: radial-gradient(circle at top right, rgba(124,92,255,0.10) 0%, transparent 45%);',
    '  pointer-events: none;',
    '}',
    '.today-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:18px; position:relative; gap:16px; }',
    '.today-eyebrow { font-size:11px; letter-spacing:0.22em; color:var(--text-3); text-transform:uppercase; margin-bottom:4px; }',
    '.today-greeting { font-family: Georgia, "Iowan Old Style", serif; font-style: italic; color:var(--text-2); font-size:15px; line-height:1.4; max-width:420px; }',
    '.today-date { font-size:11px; color:var(--text-3); letter-spacing:0.10em; text-transform:uppercase; white-space:nowrap; }',

    '.today-section { margin-top:18px; position:relative; }',
    '.today-section-title { font-size:10px; letter-spacing:0.22em; color:var(--text-3); text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:10px; }',
    '.today-section-title:after { content:""; flex:1; height:1px; background:var(--border); opacity:0.5; }',

    /* Survival */
    '.today-survival-list { display:flex; flex-direction:column; gap:2px; }',
    '.today-survival-row { display:grid; grid-template-columns:40px 1fr auto; align-items:center; gap:14px; padding:10px 10px; border-radius:10px; transition:background 0.15s; min-height:54px; }',
    '.today-survival-row:hover { background:rgba(124,92,255,0.05); }',
    '.today-survival-play { width:36px; height:36px; border-radius:50%; border:1px solid var(--border); background:transparent; color:var(--text-2); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px; transition:all 0.15s; padding:0; }',
    '.today-survival-play:hover { background:var(--purple); color:#fff; border-color:var(--purple); transform:scale(1.05); }',
    '.today-survival-text { display:flex; flex-direction:column; gap:3px; min-width:0; }',
    '.today-survival-title { color:var(--text); font-size:14px; font-weight:600; letter-spacing:0.01em; line-height:1.25; }',
    '.today-survival-examples { color:var(--text-3); font-size:12px; line-height:1.35; }',
    '.today-survival-examples em { font-style:normal; color:var(--text-2); }',
    '.today-survival-meta { font-size:10px; color:var(--text-3); letter-spacing:0.08em; white-space:nowrap; text-transform:uppercase; padding:4px 10px; border:1px solid var(--border); border-radius:999px; }',

    /* Rescue */
    '.today-rescue-list { display:flex; flex-direction:column; gap:4px; }',
    '.today-rescue-row { display:grid; grid-template-columns:40px 1fr auto auto; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background 0.15s; min-height:54px; }',
    '.today-rescue-row:hover { background:rgba(124,92,255,0.06); }',
    '.today-rescue-emoji { font-size:22px; text-align:center; }',
    '.today-rescue-info { display:flex; flex-direction:column; gap:3px; min-width:0; }',
    '.today-rescue-name { color:var(--text); font-size:14px; font-weight:500; line-height:1.3; }',
    '.today-rescue-context { color:var(--text-3); font-size:11px; line-height:1.2; letter-spacing:0.02em; }',
    '.today-rescue-badge { font-size:10px; letter-spacing:0.10em; padding:5px 10px; border-radius:999px; text-transform:uppercase; font-weight:500; }',
    '.today-rescue-badge.critical { background:rgba(239,68,68,0.10); color:#fca5a5; border:1px solid rgba(239,68,68,0.20); }',
    '.today-rescue-badge.warning { background:rgba(255,138,61,0.10); color:#fed7aa; border:1px solid rgba(255,138,61,0.20); }',
    '.today-rescue-badge.fading { background:rgba(168,166,200,0.10); color:var(--text-2); border:1px solid var(--border); }',
    '.today-rescue-badge.starter { background:rgba(124,92,255,0.08); color:#c4b5fd; border:1px solid rgba(124,92,255,0.20); }',
    '.today-rescue-arrow { color:var(--text-3); font-size:18px; opacity:0.5; transition:transform 0.15s; }',
    '.today-rescue-row:hover .today-rescue-arrow { transform:translateX(2px); opacity:1; }',

    /* Pulse */
    '.today-pulse { display:flex; flex-direction:column; gap:12px; padding-top:4px; }',
    '.today-pulse-grid { display:flex; flex-wrap:wrap; gap:7px; }',
    '.today-pulse-dot { width:14px; height:14px; border-radius:50%; cursor:pointer; transition:transform 0.15s; position:relative; }',
    '.today-pulse-dot:hover { transform:scale(1.45); z-index:2; }',
    '.today-pulse-dot.fragile { background:rgba(239,68,68,0.35); }',
    '.today-pulse-dot.weak { background:rgba(255,138,61,0.42); }',
    '.today-pulse-dot.building { background:rgba(212,175,55,0.55); }',
    '.today-pulse-dot.stable { background:rgba(34,197,94,0.60); }',
    '.today-pulse-dot.automatic { background:var(--purple); box-shadow:0 0 10px rgba(124,92,255,0.7); }',
    '.today-pulse-legend { display:flex; gap:16px; font-size:10px; color:var(--text-3); letter-spacing:0.10em; text-transform:uppercase; flex-wrap:wrap; }',
    '.today-pulse-legend > span { display:flex; align-items:center; gap:6px; }',
    '.today-pulse-legend i { display:inline-block; width:8px; height:8px; border-radius:50%; }',

    /* Breath animation — only on at-risk states; calm, slow */
    '@keyframes today-breath { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.6;transform:scale(0.9);} }',
    '.today-pulse-dot.fragile { animation: today-breath 5.5s ease-in-out infinite; }',
    '.today-pulse-dot.weak { animation: today-breath 6.5s ease-in-out infinite; animation-delay: 1.5s; }',

    /* Empty states */
    '.today-empty { color:var(--text-3); font-size:13px; padding:14px 12px; font-style:italic; line-height:1.5; }',

    /* Mobile-first refinement */
    '@media (max-width:900px) {',
    '  .today-card { grid-column: 1 / -1; padding:20px 16px 18px; border-radius:14px; }',
    '  .today-head { flex-direction:column; align-items:flex-start; gap:8px; }',
    '  .today-greeting { font-size:14px; }',
    '  .today-survival-row, .today-rescue-row { padding:11px 8px; gap:10px; min-height:56px; }',
    '  .today-survival-title, .today-rescue-name { font-size:14px; }',
    '  .today-survival-meta { padding:3px 8px; font-size:9px; }',
    '  .today-pulse-dot { width:13px; height:13px; }',
    '  .today-pulse-legend { gap:10px; font-size:9px; }',
    '}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('today-v11-styles')) return;
    var s = document.createElement('style');
    s.id = 'today-v11-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---------- Helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ago(iso) {
    if (!iso) return 'chưa review';
    var ms = Date.now() - new Date(iso).getTime();
    if (isNaN(ms)) return '—';
    var d = Math.floor(ms / 86400000);
    if (d < 1) {
      var h = Math.floor(ms / 3600000);
      if (h < 1) return 'vừa xong';
      return h + ' giờ trước';
    }
    if (d === 1) return 'hôm qua';
    if (d < 7) return d + ' ngày trước';
    if (d < 30) return Math.floor(d / 7) + ' tuần trước';
    return Math.floor(d / 30) + ' tháng trước';
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return 'Đêm muộn — nhẹ thôi, vài cụm rồi nghỉ.';
    if (h < 11) return 'Buổi sáng tốt cho phản xạ. Bắt đầu từ những gì sắp quên.';
    if (h < 14) return 'Giữa trưa. Một vài cụm nhanh — không cần dài.';
    if (h < 18) return 'Buổi chiều mát. Luyện shadowing sâu.';
    if (h < 22) return 'Tối yên tĩnh. Review chậm, để chữ thấm.';
    return 'Khuya rồi. Chỉ tập những gì đang nhạt.';
  }

  function formatDate() {
    var d = new Date();
    var months = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];
    var weekdays = ['CN','T2','T3','T4','T5','T6','T7'];
    return weekdays[d.getDay()] + ' · ' + d.getDate() + ' ' + months[d.getMonth()];
  }

  function topicCount() {
    return (window.shadowEN && window.shadowEN.state) ? window.shadowEN.state.topics.length : '—';
  }

  // ---------- Rescue scoring ----------
  function rescueScore(t) {
    if (!t || !t.lastReview) return -1;
    var ageMs = Date.now() - new Date(t.lastReview).getTime();
    if (isNaN(ageMs) || ageMs < 0) return -1;
    var ageDays = ageMs / 86400000;
    var memWeight = { 'Fragile': 1.0, 'Weak': 0.85, 'Building': 0.6, 'Stable': 0.3, 'Automatic': 0.1 };
    var memScore = memWeight[t.memoryStatus] != null ? memWeight[t.memoryStatus] : 0.5;
    var confidencePenalty = t.confidence > 0 ? (5 - t.confidence) / 5 : 0.5;
    var ageScore = Math.min(ageDays / 14, 1);
    // Also factor adaptive engine's risk if available
    var engineRisk = 0;
    try {
      if (window.SHADOW_ADAPTIVE && SHADOW_ADAPTIVE.calculateForgetRisk) {
        engineRisk = SHADOW_ADAPTIVE.calculateForgetRisk(t) || 0;
      }
    } catch (_) {}
    return ageScore * 0.30 + memScore * 0.30 + confidencePenalty * 0.20 + engineRisk * 0.20;
  }

  function getRescueRanked() {
    var state = window.shadowEN && window.shadowEN.state;
    if (!state) return { mode: 'starter', topics: [] };
    var reviewed = state.topics.filter(function(t) { return t.lastReview; });
    if (reviewed.length === 0) {
      // Starter mode: suggest 3 foundational topics (L1-01, L1-02, L1-03)
      var starters = state.topics
        .filter(function(t) { return !t.lastReview && t.level === 1; })
        .slice(0, 3);
      if (starters.length < 3) {
        starters = starters.concat(state.topics.filter(function(t) { return !t.lastReview; }).slice(0, 3 - starters.length));
      }
      return { mode: 'starter', topics: starters.slice(0, 3) };
    }
    var ranked = reviewed
      .map(function(t) { return { topic: t, score: rescueScore(t) }; })
      .filter(function(o) { return o.score > 0; })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function(o) { return Object.assign({}, o.topic, { _score: o.score }); });
    return { mode: 'rescue', topics: ranked };
  }

  function rescueBadge(t, mode) {
    if (mode === 'starter') return { cls: 'starter', text: 'bắt đầu' };
    var score = t._score || 0;
    if (score > 0.65) return { cls: 'critical', text: 'nguy hiểm' };
    if (score > 0.45) return { cls: 'warning', text: 'sắp quên' };
    return { cls: 'fading', text: 'sắp nhạt' };
  }

  // ---------- Section renderers ----------
  function renderSurvival() {
    if (typeof window.SHADOW_PHRASES === 'undefined') {
      return '<div class="today-empty">Đang phân tích phrases…</div>';
    }
    var src = window.SHADOW_CONTENT;
    if (!src || !src.TOPIC_CONTENT) {
      return '<div class="today-empty">Chưa có content để phân tích.</div>';
    }
    var patterns = [];
    try {
      patterns = SHADOW_PHRASES.getSurvivalPatterns(src, { minTopics: 2, limit: 5 });
    } catch (e) {
      return '<div class="today-empty">Không phân tích được: ' + esc(e.message) + '</div>';
    }
    if (!patterns || patterns.length === 0) {
      return '<div class="today-empty">Chưa đủ data để detect survival patterns. Thêm phrases ở Notion để mở khoá.</div>';
    }
    var rows = patterns.map(function(p) {
      var meta = p.topicCount >= 2 ? (p.topicCount + ' hoàn cảnh') : 'cơ bản';
      var ex = (p.examples || []).slice(0, 2).map(function(e) { return '<em>' + esc(e.english) + '</em>'; }).join(' · ');
      // First example used as speak target
      var speakText = p.examples && p.examples[0] ? p.examples[0].english : p.title;
      return [
        '<div class="today-survival-row">',
        '<button class="today-survival-play" data-speak="', esc(speakText), '" title="Phát âm ví dụ" aria-label="Phát âm">▶</button>',
        '<div class="today-survival-text">',
        '<div class="today-survival-title">', esc(p.title), '</div>',
        '<div class="today-survival-examples">', ex || '—', '</div>',
        '</div>',
        '<span class="today-survival-meta">', esc(meta), '</span>',
        '</div>'
      ].join('');
    }).join('');
    return rows;
  }

  function renderRescue() {
    var ranked = getRescueRanked();
    if (!ranked.topics || ranked.topics.length === 0) {
      return '<div class="today-empty">Hệ thống đang chuẩn bị queue cứu — quay lại sau khi có dữ liệu review.</div>';
    }
    return ranked.topics.map(function(t) {
      var badge = rescueBadge(t, ranked.mode);
      var ctx;
      if (ranked.mode === 'starter') {
        ctx = (t.memoryStatus || 'Fragile') + ' · chưa bắt đầu';
      } else {
        ctx = (t.memoryStatus || '—') + ' · ' + ago(t.lastReview);
      }
      return [
        '<div class="today-rescue-row" data-topic="', esc(t.id), '">',
        '<div class="today-rescue-emoji">', esc(t.emoji || '📘'), '</div>',
        '<div class="today-rescue-info">',
        '<div class="today-rescue-name">', esc(t.name || t.id), '</div>',
        '<div class="today-rescue-context">', esc(ctx), '</div>',
        '</div>',
        '<span class="today-rescue-badge ', badge.cls, '">', esc(badge.text), '</span>',
        '<span class="today-rescue-arrow">›</span>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderPulse() {
    var state = window.shadowEN && window.shadowEN.state;
    if (!state || !state.topics) return '';
    var STATUS_CLASS = {
      'Fragile': 'fragile',
      'Weak': 'weak',
      'Building': 'building',
      'Stable': 'stable',
      'Automatic': 'automatic'
    };
    var dots = state.topics.map(function(t) {
      var cls = STATUS_CLASS[t.memoryStatus] || 'fragile';
      var tip = (t.name || t.id) + ' — ' + (t.memoryStatus || 'Fragile');
      return '<span class="today-pulse-dot ' + cls + '" data-topic="' + esc(t.id) + '" title="' + esc(tip) + '"></span>';
    }).join('');
    return [
      '<div class="today-pulse-grid">', dots, '</div>',
      '<div class="today-pulse-legend">',
      '<span><i style="background:rgba(239,68,68,0.35)"></i>Fragile</span>',
      '<span><i style="background:rgba(255,138,61,0.42)"></i>Weak</span>',
      '<span><i style="background:rgba(212,175,55,0.55)"></i>Building</span>',
      '<span><i style="background:rgba(34,197,94,0.60)"></i>Stable</span>',
      '<span><i style="background:var(--purple)"></i>Automatic</span>',
      '</div>'
    ].join('');
  }

  function rescueSectionTitle() {
    var ranked = getRescueRanked();
    if (ranked.mode === 'starter') return 'Bắt đầu · 3 topic nền';
    return 'Rescue · ưu tiên cứu hôm nay';
  }

  // ---------- Build & inject ----------
  function build() {
    injectCSS();
    return [
      '<div class="card today-card" id="today-card-v11">',
      '<div class="today-head">',
      '<div>',
      '<div class="today-eyebrow">Hôm nay</div>',
      '<div class="today-greeting">', esc(greeting()), '</div>',
      '</div>',
      '<div class="today-date">', esc(formatDate()), '</div>',
      '</div>',

      '<div class="today-section">',
      '<div class="today-section-title">Survival patterns · dùng được nhiều nơi</div>',
      '<div class="today-survival-list">', renderSurvival(), '</div>',
      '</div>',

      '<div class="today-section">',
      '<div class="today-section-title">', esc(rescueSectionTitle()), '</div>',
      '<div class="today-rescue-list">', renderRescue(), '</div>',
      '</div>',

      '<div class="today-section">',
      '<div class="today-section-title">Memory pulse · ', topicCount(), ' topics đang sống</div>',
      '<div class="today-pulse">', renderPulse(), '</div>',
      '</div>',

      '</div>'
    ].join('');
  }

  function inject() {
    var home = document.querySelector('#view-home');
    if (!home) return false;
    var html = build();
    var existing = document.querySelector('#today-card-v11');
    if (existing) {
      // Replace in place
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      existing.replaceWith(wrapper.firstElementChild);
    } else {
      // Insert before #questions-5 if present, otherwise prepend
      var q5 = home.querySelector('#questions-5');
      if (q5) {
        q5.insertAdjacentHTML('beforebegin', html);
      } else {
        home.insertAdjacentHTML('afterbegin', html);
      }
    }
    bind();
    return true;
  }

  function bind() {
    var card = document.querySelector('#today-card-v11');
    if (!card) return;

    // Survival phrase play buttons
    var plays = card.querySelectorAll('[data-speak]');
    for (var i = 0; i < plays.length; i++) {
      (function(btn) {
        btn.onclick = function(ev) {
          ev.stopPropagation();
          var text = btn.getAttribute('data-speak');
          try {
            if (window.SHADOW_AUDIO && window.SHADOW_AUDIO.speak) {
              window.SHADOW_AUDIO.speak(text);
            } else if (window.speechSynthesis) {
              var u = new SpeechSynthesisUtterance(text);
              window.speechSynthesis.speak(u);
            }
          } catch (_) {}
        };
      })(plays[i]);
    }

    // Rescue topic rows → open topic
    var rows = card.querySelectorAll('.today-rescue-row[data-topic]');
    for (var j = 0; j < rows.length; j++) {
      (function(row) {
        row.onclick = function() {
          var id = row.getAttribute('data-topic');
          try {
            if (typeof window.openTopic === 'function') return window.openTopic(id);
            if (typeof window.navigate === 'function') window.navigate('topic-detail');
          } catch (_) {}
        };
      })(rows[j]);
    }

    // Pulse dots → open topic
    var dots = card.querySelectorAll('.today-pulse-dot[data-topic]');
    for (var k = 0; k < dots.length; k++) {
      (function(dot) {
        dot.onclick = function() {
          var id = dot.getAttribute('data-topic');
          try {
            if (typeof window.openTopic === 'function') return window.openTopic(id);
          } catch (_) {}
        };
      })(dots[k]);
    }
  }

  window.SHADOW_TODAY = {
    build: build,
    inject: inject,
    bind: bind,
    _internals: {
      greeting: greeting,
      getRescueRanked: getRescueRanked,
      rescueScore: rescueScore
    }
  };

  if (typeof console !== 'undefined' && console.log) {
    console.log('[v11.1] SHADOW_TODAY loaded');
  }
})();
