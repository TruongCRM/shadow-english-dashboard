// ============================================================
// SHADOW ENGLISH v10 — Real Progress Intelligence
// All metrics computed from real sessionsLog + topics state
// ============================================================

window.SHADOW_METRICS = {

  // ============= TIME METRICS =============
  speakingMinutesThisWeek: function() {
    const weekAgo = Date.now() - 7 * 86400000;
    const sessions = state.sessionsLog.filter(s =>
      new Date(s.at).getTime() > weekAgo && (s.type === 'session' || s.type === 'review')
    );
    // Assume each session = avg 45 min, review = 10 min
    const minutes = sessions.reduce((sum, s) => sum + (s.type === 'session' ? 45 : 10), 0);
    return minutes;
  },

  // ============= STREAK METRICS =============
  shadowStreak: function() {
    // Consecutive days with at least 1 session
    const days = new Set();
    state.sessionsLog.forEach(s => {
      days.add(new Date(s.at).toDateString());
    });
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const key = cursor.toDateString();
      if (days.has(key)) {
        streak++;
        cursor = new Date(cursor.getTime() - 86400000);
      } else {
        // Allow today to be empty (streak still active)
        if (streak === 0 && cursor.toDateString() === new Date().toDateString()) {
          cursor = new Date(cursor.getTime() - 86400000);
          continue;
        }
        break;
      }
    }
    return streak;
  },

  // ============= RECALL ACCURACY =============
  // Average confidence across all reviews in a period
  recallAccuracy: function(daysBack) {
    daysBack = daysBack || 30;
    const cutoff = Date.now() - daysBack * 86400000;
    const reviews = state.sessionsLog.filter(s => s.type === 'review' && new Date(s.at).getTime() > cutoff);
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + (r.confidence || 3), 0) / reviews.length;
    return Math.round((avg / 5) * 100); // 0-100%
  },

  // ============= PHRASES MASTERED =============
  phrasesMastered: function() {
    if (!SHADOW_CONTENT?.TOPIC_CONTENT) return 0;
    let count = 0;
    state.topics.forEach(t => {
      if (t.memoryStatus === 'Stable' || t.memoryStatus === 'Automatic') {
        const c = SHADOW_CONTENT.getContent(t.id);
        count += (c.phrases?.before?.length || 0) + (c.phrases?.during?.length || 0) + (c.phrases?.after?.length || 0);
      }
    });
    return count;
  },

  // ============= WEAK TOPIC TRENDS =============
  weakTopicTrends: function() {
    // Topics with declining confidence
    return state.topics.filter(t => {
      const hist = t.confidenceHistory || [];
      if (hist.length < 2) return false;
      const last = hist[hist.length - 1];
      const prev = hist[hist.length - 2];
      return last.confidence < prev.confidence && last.confidence <= 2;
    }).sort((a,b) => {
      const aRisk = SHADOW_ADAPTIVE?.calculateForgetRisk?.(a) || 0;
      const bRisk = SHADOW_ADAPTIVE?.calculateForgetRisk?.(b) || 0;
      return bRisk - aRisk;
    });
  },

  // ============= CONSISTENCY SCORE =============
  // Days active / total days in last 30
  consistencyScore: function() {
    const days = new Set();
    const cutoff = Date.now() - 30 * 86400000;
    state.sessionsLog.filter(s => new Date(s.at).getTime() > cutoff).forEach(s => {
      days.add(new Date(s.at).toDateString());
    });
    return Math.round((days.size / 30) * 100);
  },

  // ============= MONTHLY GROWTH =============
  monthlyGrowth: function() {
    // Mastery delta over 30 days
    // Approximate by counting topics that advanced stage
    const cutoff = Date.now() - 30 * 86400000;
    const advances = state.sessionsLog.filter(s =>
      new Date(s.at).getTime() > cutoff && s.type === 'session'
    ).length;
    return advances;
  },

  // ============= REVIEW LOAD FORECAST =============
  // Predict how many reviews per day for next N days
  reviewLoadForecast: function(daysAhead) {
    daysAhead = daysAhead || 14;
    const forecast = {};
    for (let i = 0; i <= daysAhead; i++) {
      const d = new Date(Date.now() + i * 86400000).toDateString();
      forecast[d] = 0;
    }
    state.topics.forEach(t => {
      if (!t.nextReview) return;
      const reviewDay = new Date(t.nextReview).toDateString();
      if (forecast[reviewDay] !== undefined) forecast[reviewDay]++;
    });
    return forecast;
  },

  // ============= SESSIONS PER DAY (last 14d) =============
  sessionsPerDay: function(daysBack) {
    daysBack = daysBack || 14;
    const map = {};
    state.sessionsLog.forEach(s => {
      const d = new Date(s.at).toDateString();
      map[d] = (map[d] || 0) + 1;
    });
    const result = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000);
      const key = day.toDateString();
      result.push({ date: day, count: map[key] || 0 });
    }
    return result;
  },

  // ============= STAGE DISTRIBUTION =============
  stageDistribution: function() {
    const dist = {};
    ['Day 0','Day 1','Day 3','Day 7','Day 21','Day 60'].forEach(s => dist[s] = 0);
    state.topics.forEach(t => { dist[t.reviewStage]++; });
    return dist;
  },

  // ============= MEMORY DISTRIBUTION =============
  memoryDistribution: function() {
    const dist = { Fragile: 0, Weak: 0, Building: 0, Stable: 0, Automatic: 0 };
    state.topics.forEach(t => { dist[t.memoryStatus]++; });
    return dist;
  },

  // ============= TOTAL XP EARNED =============
  totalXP: function() {
    return state.user.xp + (state.user.level - 1) * 100; // approx
  },

  // ============= SUMMARY =============
  summary: function() {
    return {
      speakingMinutesWeek: this.speakingMinutesThisWeek(),
      shadowStreak: this.shadowStreak(),
      recallAccuracy: this.recallAccuracy(30),
      phrasesMastered: this.phrasesMastered(),
      consistencyScore: this.consistencyScore(),
      monthlyGrowth: this.monthlyGrowth(),
      weakTopicCount: this.weakTopicTrends().length
    };
  }
};

console.log('Shadow English Real Metrics v10 loaded 📊');
