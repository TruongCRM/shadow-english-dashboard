// ============================================================
// SHADOW ENGLISH v10 — Integration patch
// Wire Adaptive + Metrics + Coach into app.js
// ============================================================

(function() {
  function waitForDeps() {
    if (!window.SHADOW_ADAPTIVE || !window.SHADOW_METRICS || !window.SHADOW_COACH || typeof completeReview !== 'function') {
      setTimeout(waitForDeps, 200);
      return;
    }

    // ============= OVERRIDE completeReview to use ADAPTIVE =============
    window.completeReview = function(topicId, confidence) {
      const t = state.topics.find(x => x.id === topicId);
      if (!t) return;
      // Apply adaptive logic
      SHADOW_ADAPTIVE.applyReview(t, confidence);
      // XP based on confidence
      awardXP(50 + confidence * 15, `Reviewed ${t.name}`);
      // Log
      state.sessionsLog.push({ type: 'review', topicId, confidence, at: new Date().toISOString() });
      updateStreak();
      saveState();
      render();
      // Show coach post-session message
      const msg = SHADOW_COACH.postSession(topicId, confidence);
      if (msg) toast(msg);
    };

    // ============= OVERRIDE completeSession to use ADAPTIVE =============
    const _origCompleteSession = window.completeSession;
    window.completeSession = function(topicId) {
      const t = state.topics.find(x => x.id === topicId);
      if (!t) return;
      const conf = window._sessionConf || 4; // Default to "Good" after 8 steps
      delete window._sessionConf;
      SHADOW_ADAPTIVE.applyReview(t, conf);
      awardXP(150 + conf * 20, `Session: ${t.name}`);
      state.sessionsLog.push({ type: 'session', topicId, confidence: conf, at: new Date().toISOString() });
      updateStreak();
      state.currentSession = null;
      saveState();
      render();
      const msg = SHADOW_COACH.postSession(topicId, conf);
      if (msg) toast(msg);
      toast(`✅ Session complete — ${t.name} → ${t.reviewStage}`);
    };

    // ============= ADAPTIVE Today Queue (smart prioritization) =============
    window.getTodayQueue = function() {
      return SHADOW_ADAPTIVE.prioritizeReviewQueue(state.topics);
    };

    // ============= UPDATE COACH CARD with real insight =============
    function updateCoachCard() {
      const coachQuote = document.querySelector('#coach-quote');
      const coachSub = document.querySelector('#coach-sub');
      const insights = SHADOW_COACH.generate(2);
      if (coachQuote && insights[0]) {
        coachQuote.textContent = insights[0].text;
      }
      if (coachSub && insights[1]) {
        coachSub.innerHTML = insights[1].text;
      } else if (coachSub) {
        const m = SHADOW_METRICS.summary();
        coachSub.innerHTML = `📊 Tuần này: <b>${m.speakingMinutesWeek}</b> phút · Recall <b>${m.recallAccuracy || 0}%</b> · Consistency <b>${m.consistencyScore}%</b>`;
      }
    }

    // Hook into render
    const _origRender = window.render;
    window.render = function() {
      _origRender();
      setTimeout(updateCoachCard, 100);
    };

    // ============= UPGRADE PROGRESS PAGE with real metrics =============
    if (typeof NAV_RENDERS !== 'undefined') {
      const _origProgress = NAV_RENDERS['progress'];
      NAV_RENDERS['progress'] = function() {
        if (_origProgress) _origProgress();
        setTimeout(() => {
          const view = document.getElementById('view-progress');
          if (!view) return;
          const m = SHADOW_METRICS.summary();
          const stats = view.querySelector('.stat-list');
          if (stats) {
            stats.innerHTML = `
              <div><b>${m.speakingMinutesWeek}</b><span>Speaking min/week</span></div>
              <div><b>${m.recallAccuracy || 0}%</b><span>Recall accuracy</span></div>
              <div><b>${m.phrasesMastered}</b><span>Phrases mastered</span></div>
              <div><b>${m.consistencyScore}%</b><span>Consistency 30d</span></div>
              <div><b>${m.shadowStreak}</b><span>Day streak</span></div>
              <div><b>${m.weakTopicCount}</b><span>Weak topics (decay)</span></div>
            `;
          }
          // Replace bar chart with real sessionsPerDay
          const barChart = view.querySelector('.bar-chart');
          if (barChart) {
            const days = SHADOW_METRICS.sessionsPerDay(14);
            const max = Math.max(1, ...days.map(d => d.count));
            barChart.innerHTML = days.map(d => `
              <div class="bar-col">
                <div class="bar" style="height:${(d.count/max)*100}%" title="${d.count} sessions ${d.date.toLocaleDateString()}"></div>
                <div class="bar-label">${d.date.getDate()}/${d.date.getMonth()+1}</div>
                <div class="bar-count">${d.count}</div>
              </div>
            `).join('');
          }
          // Add forecast card
          if (!view.querySelector('.forecast-card')) {
            const forecast = SHADOW_METRICS.reviewLoadForecast(14);
            const totalUpcoming = Object.values(forecast).reduce((a,b) => a+b, 0);
            const html = `<div class="card forecast-card" style="grid-column:span 5;margin-top:16px">
              <div class="card-title">📋 REVIEW LOAD FORECAST · Next 14 days · Total: ${totalUpcoming}</div>
              <div class="bar-chart">${Object.entries(forecast).map(([day, count]) => {
                const m2 = Math.max(1, ...Object.values(forecast));
                return `<div class="bar-col">
                  <div class="bar" style="height:${(count/m2)*100}%;background:linear-gradient(180deg,#facc15,#ff8a3d)"></div>
                  <div class="bar-label">${day.substring(4,6)}/${day.substring(8,10)}</div>
                  <div class="bar-count">${count}</div>
                </div>`;
              }).join('')}</div>
            </div>`;
            view.insertAdjacentHTML('beforeend', html);
          }
        }, 200);
      };
    }

    console.log('[v10] Adaptive Engine + Real Metrics + AI Coach integrated ✨');
  }
  waitForDeps();
})();

// Expose for debug
window.v10 = {
  metrics: () => SHADOW_METRICS.summary(),
  insights: () => SHADOW_COACH.generate(5),
  riskAll: () => state.topics.map(t => ({ name: t.name, risk: SHADOW_ADAPTIVE.calculateForgetRisk(t) })).sort((a,b)=>b.risk-a.risk)
};
