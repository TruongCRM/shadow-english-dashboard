/* ==========================================================================
 * Shadow English — v11.1 INTERNAL INSIGHT PANEL (Today Debug)
 * --------------------------------------------------------------------------
 * Goal: Increase clarity of the learning engine (NOT add new features).
 *
 * Pure additive module:
 *   - Reads from window.shadowEN.state (or window.state) — never mutates
 *   - Reads from window.SHADOW_CONTENT (optional) for survival patterns
 *   - Does NOT touch state schema, NOT touch localStorage keys other than
 *     its own `shadow-en-debug-mode`
 *
 * Toggle:
 *   ?debug=1  → enable & persist
 *   ?debug=0  → disable & persist
 *   SHADOW_DEBUG.enable() / .disable() / .toggle()  (DevTools)
 *   Click × on panel header  → disable
 *
 * Architecture:
 *   - Single IIFE, namespaced via window.SHADOW_DEBUG
 *   - All CSS classes prefixed `dbg-` to avoid collision
 *   - Single DOM root #debug-panel-host appended to <body>
 *   - Refreshes: on render(), on saveState(), 5s interval fallback
 * ========================================================================== */
(function () {
  'use strict';

  const DEBUG_KEY = 'shadow-en-debug-mode';
  const HOST_ID = 'debug-panel-host';
  const CSS_ID = 'debug-panel-css';

  /* ------------------------------------------------------------------ *
   * 1. Debug-mode toggle (URL param + localStorage)
   * ------------------------------------------------------------------ */
  function readURLToggle() {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('debug');
      if (v === '1') localStorage.setItem(DEBUG_KEY, '1');
      else if (v === '0') localStorage.setItem(DEBUG_KEY, '0');
    } catch (e) { /* sandbox without URL */ }
  }

  function isDebugEnabled() {
    try { return localStorage.getItem(DEBUG_KEY) === '1'; }
    catch (e) { return false; }
  }

  function setDebug(on) {
    try { localStorage.setItem(DEBUG_KEY, on ? '1' : '0'); } catch (e) {}
    renderPanel();
  }

  /* ------------------------------------------------------------------ *
   * 2. State accessor (graceful — never throw)
   * ------------------------------------------------------------------ */
  // Read-only normalized view — NEVER mutates the underlying state object
  function getState() {
    const s = (window.shadowEN && window.shadowEN.state) || window.state;
    if (!s || typeof s !== 'object') return { topics: [], sessionsLog: [] };
    return {
      topics:      Array.isArray(s.topics)      ? s.topics      : [],
      sessionsLog: Array.isArray(s.sessionsLog) ? s.sessionsLog : [],
      user:        s.user || null
    };
  }

  function getContent() {
    return (window.SHADOW_CONTENT && window.SHADOW_CONTENT.TOPIC_CONTENT) || {};
  }

  /* ------------------------------------------------------------------ *
   * 3. Pure computations (no side effects)
   * ------------------------------------------------------------------ */
  function daysSince(iso) {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (!isFinite(t)) return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }

  function avgConfidence(topic, last = 3) {
    const h = Array.isArray(topic.confidenceHistory) ? topic.confidenceHistory : [];
    if (!h.length) return 0;
    const arr = h.slice(-last);
    return arr.reduce((a, b) => a + (b.confidence || 0), 0) / arr.length;
  }

  function confidenceTrend(topic) {
    const h = Array.isArray(topic.confidenceHistory) ? topic.confidenceHistory : [];
    if (h.length < 2) return 0;
    const last = h[h.length - 1].confidence || 0;
    const prev = h[h.length - 2].confidence || 0;
    return last - prev;
  }

  // Forget-risk breakdown (transparent, mirrors adaptive.js intent)
  function forgetRiskBreakdown(topic) {
    const age = daysSince(topic.lastReview);
    const memory = topic.memoryStatus || 'Fragile';
    const conf = avgConfidence(topic, 3);
    const trend = confidenceTrend(topic);

    // age factor — max 0.40, scales 0..30 days
    let ageFactor;
    if (age === null) ageFactor = 0.30;          // never reviewed = high risk
    else ageFactor = Math.min(0.40, (age / 30) * 0.40);

    // memory factor — baseline risk by stage
    const memMap = {
      Fragile: 0.30, Weak: 0.22, Building: 0.12,
      Stable: 0.05, Automatic: 0.01
    };
    const memoryFactor = (memory in memMap) ? memMap[memory] : 0.25;

    // confidence factor — low conf = high risk (max 0.20)
    const confFactor = conf > 0
      ? Math.max(0, (3 - conf) / 3 * 0.20)
      : 0.15;

    // adaptive penalty — declining trend bonus (max 0.15)
    const adaptivePenalty = trend < 0
      ? Math.min(0.15, Math.abs(trend) / 4 * 0.15)
      : 0;

    const total = Math.min(1, ageFactor + memoryFactor + confFactor + adaptivePenalty);

    return {
      total,
      components: {
        age:        { value: ageFactor,       label: age === null ? 'never reviewed' : age + 'd since review' },
        memory:     { value: memoryFactor,    label: memory },
        confidence: { value: confFactor,      label: conf > 0 ? 'avg ' + conf.toFixed(1) : 'no history' },
        adaptive:   { value: adaptivePenalty, label: trend < 0 ? 'trend ' + trend.toFixed(1) : 'stable trend' }
      }
    };
  }

  function rescueReason(breakdown) {
    const reasons = [];
    const c = breakdown.components;
    if (c.age.value >= 0.25)        reasons.push('old (' + c.age.label + ')');
    if (c.memory.value >= 0.22)     reasons.push('fragile memory');
    if (c.confidence.value >= 0.12) reasons.push('low confidence');
    if (c.adaptive.value >= 0.08)   reasons.push('trending down');
    if (!reasons.length)            reasons.push('marginal — buffer');
    return reasons.join(' · ');
  }

  // Survival patterns: phrases that appear in 2+ topics from today's queue
  function survivalPatternsToday(state) {
    const today = new Date().setHours(0, 0, 0, 0);
    const queue = state.topics.filter(t => {
      if (!t.nextReview) return false;
      return new Date(t.nextReview).setHours(0, 0, 0, 0) <= today;
    });
    const content = getContent();
    const freq = new Map();
    queue.forEach(t => {
      const c = content[t.id];
      if (!c || !c.phrases) return;
      ['before', 'during', 'after'].forEach(section => {
        const arr = c.phrases[section] || [];
        arr.forEach(p => {
          const phrase = Array.isArray(p) ? p[0] : p;
          if (!phrase) return;
          const key = String(phrase).toLowerCase().trim();
          if (!key) return;
          if (!freq.has(key)) freq.set(key, { phrase: phrase, count: 0, topics: [] });
          const e = freq.get(key);
          e.count++;
          if (!e.topics.includes(t.id)) e.topics.push(t.id);
        });
      });
    });
    return Array.from(freq.values())
      .filter(e => e.topics.length >= 2)
      .sort((a, b) => b.topics.length - a.topics.length || b.count - a.count)
      .slice(0, 5);
  }

  function memoryDistribution(state) {
    const map = { Fragile: 0, Weak: 0, Building: 0, Stable: 0, Automatic: 0 };
    state.topics.forEach(t => {
      const s = t.memoryStatus || 'Fragile';
      if (s in map) map[s]++;
    });
    return map;
  }

  function rescueRanking(state, limit = 8) {
    const today = new Date().setHours(0, 0, 0, 0);
    return state.topics.map(t => {
      const breakdown = forgetRiskBreakdown(t);
      const age = daysSince(t.lastReview);
      const mastery = (t.masteryPct || 0) / 100;
      // Salvageability: high risk × non-trivial mastery = save NOW
      const salvageability = breakdown.total * Math.max(0.1, mastery);
      const isQueued = !!(t.nextReview && new Date(t.nextReview).setHours(0,0,0,0) <= today);
      return {
        topic: t,
        risk: breakdown.total,
        breakdown,
        salvageability,
        age,
        isQueued,
        reason: rescueReason(breakdown)
      };
    })
    .sort((a, b) => b.salvageability - a.salvageability)
    .slice(0, limit);
  }

  /* ------------------------------------------------------------------ *
   * 4. Render
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const pct = v => Math.round(v * 100);
  const fmt = v => (Math.round(v * 100) / 100).toFixed(2);

  function renderPanel() {
    let host = document.getElementById(HOST_ID);

    if (!isDebugEnabled()) {
      if (host) host.remove();
      return;
    }

    if (!host) {
      host = document.createElement('div');
      host.id = HOST_ID;
      // Preserve collapsed state across re-renders
      if (sessionStorage.getItem('shadow-en-debug-collapsed') === '1') {
        host.classList.add('dbg-collapsed');
      }
      document.body.appendChild(host);
    }

    const state = getState();
    const ranking = rescueRanking(state);
    const dist = memoryDistribution(state);
    const survival = survivalPatternsToday(state);

    const queueCount = state.topics.filter(t =>
      t.nextReview && new Date(t.nextReview).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
    ).length;
    const totalTopics = state.topics.length;
    const reviewedTopics = state.topics.filter(t => t.lastReview).length;
    const neverReviewed = totalTopics - reviewedTopics;

    const html = [
      '<div class="dbg-panel">',
      '  <div class="dbg-header" data-act="toggle-collapse">',
      '    <div class="dbg-title"><span class="dbg-dot"></span>Internal Insight · v11.1</div>',
      '    <div class="dbg-actions">',
      '      <button class="dbg-btn" data-act="refresh" title="Refresh">↻</button>',
      '      <button class="dbg-btn" data-act="collapse" title="Collapse">−</button>',
      '      <button class="dbg-btn" data-act="close" title="Hide (?debug=0)">×</button>',
      '    </div>',
      '  </div>',
      '  <div class="dbg-body">',

      // Top summary line
      '    <div class="dbg-summary">',
      '      <span><b>' + totalTopics + '</b> topics</span>',
      '      <span><b>' + queueCount + '</b> in queue today</span>',
      '      <span><b>' + reviewedTopics + '</b> reviewed</span>',
      '      <span class="dbg-muted">' + neverReviewed + ' never</span>',
      '    </div>',

      // Memory distribution
      '    <section class="dbg-section">',
      '      <h4 class="dbg-h">Memory distribution</h4>',
      '      <div class="dbg-grid-5">',
      Object.entries(dist).map(([k, v]) =>
        '<div class="dbg-stat dbg-stat-' + k.toLowerCase() + '">' +
          '<div class="dbg-stat-num">' + v + '</div>' +
          '<div class="dbg-stat-label">' + k + '</div>' +
        '</div>'
      ).join(''),
      '      </div>',
      '    </section>',

      // Rescue ranking
      '    <section class="dbg-section">',
      '      <h4 class="dbg-h">Rescue ranking — salvageability</h4>',
      '      <div class="dbg-formula">salv = forget_risk × max(0.1, mastery)</div>',
      '      <div class="dbg-list">',
      (ranking.length === 0
        ? '<div class="dbg-empty">No topics yet.</div>'
        : ranking.map((r, i) => {
          const t = r.topic;
          return (
            '<div class="dbg-row' + (r.isQueued ? ' is-queued' : '') + '">' +
              '<div class="dbg-row-head">' +
                '<span class="dbg-rank">#' + (i + 1) + '</span>' +
                '<span class="dbg-topic">' + esc(t.emoji || '') + ' ' + esc(t.id) + ' · ' + esc(t.name || '') + '</span>' +
                (r.isQueued ? '<span class="dbg-pill">QUEUED</span>' : '') +
              '</div>' +
              '<div class="dbg-row-reason">' + esc(r.reason) + '</div>' +
              '<div class="dbg-row-stats">' +
                '<span>risk <b>' + fmt(r.risk) + '</b></span>' +
                '<span>salv <b>' + fmt(r.salvageability) + '</b></span>' +
                '<span>age <b>' + (r.age === null ? '∞' : r.age + 'd') + '</b></span>' +
                '<span>mem <b>' + esc(t.memoryStatus || 'Fragile') + '</b></span>' +
                '<span>stage <b>' + esc(t.reviewStage || 'Day 0') + '</b></span>' +
              '</div>' +
              '<details class="dbg-details">' +
                '<summary>risk breakdown</summary>' +
                '<div class="dbg-breakdown">' +
                  Object.entries(r.breakdown.components).map(([k, c]) =>
                    '<div class="dbg-bd-row">' +
                      '<div class="dbg-bd-label">' + k + '</div>' +
                      '<div class="dbg-bd-bar"><div class="dbg-bd-fill" style="width:' + pct(Math.min(1, c.value / 0.4)) + '%"></div></div>' +
                      '<div class="dbg-bd-val">' + fmt(c.value) + '</div>' +
                      '<div class="dbg-bd-note">' + esc(c.label) + '</div>' +
                    '</div>'
                  ).join('') +
                '</div>' +
              '</details>' +
            '</div>'
          );
        }).join('')
      ),
      '      </div>',
      '    </section>',

      // Survival patterns
      '    <section class="dbg-section">',
      '      <h4 class="dbg-h">Survival patterns — phrases across today\'s queue</h4>',
      (survival.length === 0
        ? '<div class="dbg-empty">No cross-topic phrases in today\'s queue.</div>'
        : '<div class="dbg-list">' +
          survival.map(s =>
            '<div class="dbg-row">' +
              '<div class="dbg-row-head">' +
                '<span class="dbg-phrase">"' + esc(s.phrase) + '"</span>' +
                '<span class="dbg-pill dim">' + s.topics.length + ' topics</span>' +
              '</div>' +
              '<div class="dbg-row-stats dbg-row-topics">' + s.topics.map(esc).join(' · ') + '</div>' +
            '</div>'
          ).join('') +
        '</div>'
      ),
      '    </section>',

      // By status
      '    <section class="dbg-section">',
      '      <h4 class="dbg-h">Topics by status — last review age</h4>',
      ['Fragile', 'Weak', 'Building', 'Stable', 'Automatic'].map(status => {
        const items = state.topics.filter(t => (t.memoryStatus || 'Fragile') === status);
        if (!items.length) return '';
        // sort by age desc (oldest first)
        items.sort((a, b) => {
          const aa = daysSince(a.lastReview);
          const bb = daysSince(b.lastReview);
          return (bb === null ? 9999 : bb) - (aa === null ? 9999 : aa);
        });
        return (
          '<details class="dbg-details dbg-status-block">' +
            '<summary><span class="dbg-status-name">' + status + '</span> <span class="dbg-count">(' + items.length + ')</span></summary>' +
            '<div class="dbg-status-list">' +
              items.slice(0, 12).map(t => {
                const age = daysSince(t.lastReview);
                return '<div class="dbg-status-row">' +
                  '<span>' + esc(t.id) + '</span>' +
                  '<span class="dbg-status-name-cell">' + esc(t.name || '') + '</span>' +
                  '<span class="dbg-age">' + (age === null ? 'never' : age + 'd') + '</span>' +
                '</div>';
              }).join('') +
              (items.length > 12 ? '<div class="dbg-more">+' + (items.length - 12) + ' more</div>' : '') +
            '</div>' +
          '</details>'
        );
      }).join(''),
      '    </section>',

      '    <div class="dbg-footer">',
      '      <span>v11.1 · read-only · paste <code>?debug=0</code> in URL or click × to hide</span>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    host.innerHTML = html;

    // Wire actions
    host.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('click', e => {
        const act = el.dataset.act;
        // Header itself toggles collapse only if click target isn't a button
        if (act === 'toggle-collapse') {
          if (e.target.closest('button')) return;
          host.classList.toggle('dbg-collapsed');
          try { sessionStorage.setItem('shadow-en-debug-collapsed', host.classList.contains('dbg-collapsed') ? '1' : '0'); } catch(_) {}
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (act === 'close')    setDebug(false);
        if (act === 'collapse') {
          host.classList.toggle('dbg-collapsed');
          try { sessionStorage.setItem('shadow-en-debug-collapsed', host.classList.contains('dbg-collapsed') ? '1' : '0'); } catch(_) {}
        }
        if (act === 'refresh')  renderPanel();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. CSS injection (scoped, calm/premium, mobile-safe)
   * ------------------------------------------------------------------ */
  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    const style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = `
#${HOST_ID} {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  z-index: 9999;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  color-scheme: dark;
}
.dbg-panel {
  background: rgba(15, 13, 35, 0.96);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(124, 92, 255, 0.25);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.02);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 32px);
}
.dbg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  background: linear-gradient(180deg, rgba(124, 92, 255, 0.10), rgba(124, 92, 255, 0.04));
  border-bottom: 1px solid rgba(124, 92, 255, 0.18);
  cursor: pointer;
  user-select: none;
}
.dbg-title {
  display: flex; align-items: center; gap: 8px;
  color: #c9c4ff; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  font-size: 10.5px;
}
.dbg-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #7c5cff; box-shadow: 0 0 8px rgba(124, 92, 255, 0.7);
}
.dbg-actions { display: flex; gap: 4px; }
.dbg-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: #aaa;
  width: 22px; height: 22px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px; line-height: 1; padding: 0;
  transition: background 0.15s, color 0.15s;
}
.dbg-btn:hover { background: rgba(255, 255, 255, 0.07); color: #fff; }
.dbg-body {
  overflow-y: auto;
  padding: 12px;
  color: #d4d0ee;
  scrollbar-width: thin;
  scrollbar-color: rgba(124,92,255,0.35) transparent;
}
.dbg-body::-webkit-scrollbar { width: 6px; }
.dbg-body::-webkit-scrollbar-thumb { background: rgba(124,92,255,0.35); border-radius: 3px; }
.dbg-collapsed .dbg-body { display: none; }

.dbg-summary {
  display: flex; flex-wrap: wrap; gap: 10px 14px;
  padding: 6px 8px; margin-bottom: 12px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  font-size: 11px;
  color: #aaa3d8;
}
.dbg-summary b { color: #fff; font-weight: 600; }
.dbg-muted { color: #6a6595; }

.dbg-section { margin-bottom: 14px; }
.dbg-section:last-child { margin-bottom: 0; }
.dbg-h {
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.10em;
  color: #8a85b8; margin: 0 0 8px;
}
.dbg-formula {
  font-size: 10.5px; color: #7c5cff;
  background: rgba(124, 92, 255, 0.06);
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-family: inherit;
}

.dbg-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.dbg-stat {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 4px;
  text-align: center;
}
.dbg-stat-fragile   { border-color: rgba(239, 68, 68,  0.20); }
.dbg-stat-weak      { border-color: rgba(245, 158, 11, 0.20); }
.dbg-stat-building  { border-color: rgba(234, 179, 8,  0.20); }
.dbg-stat-stable    { border-color: rgba(34,  197, 94, 0.20); }
.dbg-stat-automatic { border-color: rgba(59,  130, 246,0.20); }
.dbg-stat-num { font-size: 16px; font-weight: 600; color: #fff; }
.dbg-stat-label {
  font-size: 9px; color: #7a759e;
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-top: 2px;
}

.dbg-list { display: flex; flex-direction: column; gap: 6px; }
.dbg-row {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 8px 10px;
}
.dbg-row.is-queued {
  border-color: rgba(236, 72, 153, 0.30);
  background: rgba(236, 72, 153, 0.04);
}
.dbg-row-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px; flex-wrap: wrap;
}
.dbg-rank { font-weight: 700; color: #7c5cff; font-size: 11px; min-width: 22px; }
.dbg-topic {
  color: #e8e4ff; font-weight: 500;
  flex: 1 1 200px; min-width: 0;
  word-break: break-word;
}
.dbg-phrase { color: #fff; font-style: italic; flex: 1; word-break: break-word; }
.dbg-pill {
  background: rgba(236, 72, 153, 0.20);
  color: #ec4899;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.dbg-pill.dim {
  background: rgba(255, 255, 255, 0.06);
  color: #aaa3d8;
}
.dbg-row-reason {
  font-size: 10.5px;
  color: #9b96c4;
  margin-bottom: 4px;
}
.dbg-row-stats {
  display: flex;
  gap: 8px 12px;
  font-size: 10px;
  color: #7a759e;
  flex-wrap: wrap;
}
.dbg-row-stats b { color: #d4d0ee; font-weight: 600; }
.dbg-row-topics { color: #8a85b8; }

.dbg-details { margin-top: 6px; }
.dbg-details summary {
  cursor: pointer;
  font-size: 10px;
  color: #7a759e;
  list-style: none;
  padding: 3px 0;
  user-select: none;
}
.dbg-details summary::-webkit-details-marker { display: none; }
.dbg-details summary::before { content: '▸ '; color: #5e5990; }
.dbg-details[open] summary::before { content: '▾ '; }
.dbg-count { color: #5e5990; font-weight: 400; }
.dbg-status-name { color: #c9c4ff; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

.dbg-breakdown { margin-top: 6px; display: flex; flex-direction: column; gap: 6px; }
.dbg-bd-row {
  display: grid;
  grid-template-columns: 70px 1fr 40px;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}
.dbg-bd-label { color: #8a85b8; text-transform: capitalize; }
.dbg-bd-bar { background: rgba(255, 255, 255, 0.06); height: 4px; border-radius: 2px; overflow: hidden; }
.dbg-bd-fill { height: 100%; background: linear-gradient(90deg, #7c5cff, #ec4899); }
.dbg-bd-val { color: #d4d0ee; text-align: right; font-weight: 600; }
.dbg-bd-note { grid-column: 2 / -1; font-size: 9.5px; color: #6a6595; margin-top: -3px; }

.dbg-status-block { padding: 4px 0; }
.dbg-status-list { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; padding-left: 6px; }
.dbg-status-row {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 8px;
  font-size: 10px;
  padding: 3px 0;
  color: #9b96c4;
  align-items: center;
}
.dbg-status-row > span:first-child { color: #7c5cff; font-weight: 600; }
.dbg-status-name-cell { color: #d4d0ee; word-break: break-word; }
.dbg-age { color: #6a6595; font-variant-numeric: tabular-nums; }
.dbg-empty { color: #6a6595; font-size: 10.5px; padding: 6px 0; }
.dbg-more { font-size: 10px; color: #6a6595; text-align: center; padding: 4px; }

.dbg-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 9.5px;
  color: #5e5990;
  text-align: center;
}
.dbg-footer code {
  background: rgba(124, 92, 255, 0.10);
  color: #c9c4ff;
  padding: 1px 5px;
  border-radius: 4px;
  font-family: inherit;
}

/* Mobile-safe (≤ 600px) */
@media (max-width: 600px) {
  #${HOST_ID} {
    width: calc(100vw - 16px);
    bottom: 8px; right: 8px;
    max-height: 70vh;
  }
  .dbg-panel { max-height: 70vh; }
  .dbg-body { padding: 10px; }
  .dbg-grid-5 { gap: 4px; }
  .dbg-stat { padding: 6px 2px; }
  .dbg-stat-num { font-size: 14px; }
  .dbg-stat-label { font-size: 8.5px; }
  .dbg-bd-row { grid-template-columns: 60px 1fr 36px; }
  .dbg-row-head { gap: 6px; }
  .dbg-topic { flex-basis: 100%; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dbg-btn { transition: none; }
}
`;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ *
   * 6. Boot — hook into existing render/save lifecycle (read-only)
   * ------------------------------------------------------------------ */
  let hookedRender = false;
  let hookedSave = false;

  function hookLifecycle() {
    // Hook window.render (idempotent)
    if (!hookedRender && typeof window.render === 'function' && !window.render.__dbgWrapped) {
      const orig = window.render;
      const wrapped = function () {
        const r = orig.apply(this, arguments);
        // defer to next tick — don't block render
        setTimeout(renderPanel, 0);
        return r;
      };
      wrapped.__dbgWrapped = true;
      window.render = wrapped;
      hookedRender = true;
    }

    // Hook saveState if available
    if (!hookedSave && window.shadowEN && typeof window.shadowEN.saveState === 'function' && !window.shadowEN.saveState.__dbgWrapped) {
      const orig = window.shadowEN.saveState;
      const wrapped = function () {
        const r = orig.apply(this, arguments);
        setTimeout(renderPanel, 0);
        return r;
      };
      wrapped.__dbgWrapped = true;
      window.shadowEN.saveState = wrapped;
      hookedSave = true;
    }
  }

  function boot() {
    readURLToggle();
    injectCSS();
    renderPanel();
    hookLifecycle();

    // Retry hooking — other scripts may load later (defer order)
    let tries = 0;
    const hookTimer = setInterval(() => {
      hookLifecycle();
      tries++;
      if ((hookedRender && hookedSave) || tries > 20) clearInterval(hookTimer);
    }, 500);

    // Periodic refresh as last-resort safety net
    setInterval(() => {
      if (isDebugEnabled() && document.getElementById(HOST_ID)) renderPanel();
    }, 5000);

    // Expose console API
    window.SHADOW_DEBUG = {
      enable:    function () { setDebug(true);  return 'Debug panel ON'; },
      disable:   function () { setDebug(false); return 'Debug panel OFF'; },
      toggle:    function () { setDebug(!isDebugEnabled()); return isDebugEnabled() ? 'ON' : 'OFF'; },
      render:    renderPanel,
      isEnabled: isDebugEnabled,
      // Inspectors (return data — useful in console)
      rescueRanking:       function (n) { return rescueRanking(getState(), n || 8); },
      forgetRiskBreakdown: function (topicId) {
        const t = getState().topics.find(x => x.id === topicId);
        return t ? forgetRiskBreakdown(t) : null;
      },
      survivalPatterns:    function () { return survivalPatternsToday(getState()); },
      memoryDistribution:  function () { return memoryDistribution(getState()); }
    };

    console.log('%c[SHADOW DEBUG v11.1]', 'color:#7c5cff;font-weight:600',
      'Internal Insight ready. Toggle: ?debug=1 in URL · SHADOW_DEBUG.enable()');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
