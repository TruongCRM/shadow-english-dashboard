// ============================================================
// SHADOW ENGLISH v10 — AI Coach (Rule-Based)
// Generates personalized insights from state
// ============================================================

window.SHADOW_COACH = {

  // ============= INSIGHT RULES =============
  rules: [
    // High consistency
    {
      name: 'high-streak',
      match: (s, m) => s.user.streak >= 7,
      message: (s) => `🔥 ${s.user.streak} ngày liên tiếp — anh đã vượt mốc thói quen. System đang chạy đúng.`,
      priority: 9
    },
    {
      name: 'broken-streak',
      match: (s, m) => !s.user.lastStudyDate || (Date.now() - new Date(s.user.lastStudyDate).getTime() > 36 * 3600000),
      message: () => `⏰ Anh chưa học hôm nay. 1 buổi 15 phút giữ lại streak — đừng để mất.`,
      priority: 10
    },
    // Adaptive: weak topics
    {
      name: 'weak-trending',
      match: (s, m) => m.weakTopicCount >= 3,
      message: (s, m) => {
        const weak = SHADOW_METRICS.weakTopicTrends().slice(0, 2);
        const names = weak.map(t => t.emoji + ' ' + t.name).join(' & ');
        return `⚠️ ${m.weakTopicCount} topic đang decay (${names}). Ưu tiên review trước khi quên hẳn.`;
      },
      priority: 9
    },
    // Recall vs Speaking imbalance
    {
      name: 'recall-strong-speaking-weak',
      match: (s, m) => m.recallAccuracy >= 75 && m.speakingMinutesWeek < 100,
      message: (s, m) => `💡 Recall accuracy ${m.recallAccuracy}% — anh nhớ tốt nhưng speaking time chỉ ${m.speakingMinutesWeek} phút/tuần. Cần thêm SPEAK out loud.`,
      priority: 7
    },
    // Inactive
    {
      name: 'inactive',
      match: (s, m) => m.consistencyScore < 30 && s.sessionsLog.length > 5,
      message: (s, m) => `🌱 Consistency ${m.consistencyScore}% — quá ít. 1 buổi 15p mỗi ngày tốt hơn 2 tiếng cuối tuần.`,
      priority: 8
    },
    // Growth trending up
    {
      name: 'growth-up',
      match: (s, m) => m.monthlyGrowth >= 10,
      message: (s, m) => `📈 ${m.monthlyGrowth} sessions tháng này — anh học đều hơn nhiều người. Keep this pace.`,
      priority: 5
    },
    // Need new topic
    {
      name: 'need-new',
      match: (s, m) => {
        const queue = state.topics.filter(t => t.reviewStage !== 'Day 0' && t.reviewStage !== 'Day 60').length;
        const newTopics = state.topics.filter(t => t.reviewStage === 'Day 0').length;
        return queue >= 5 && newTopics > 0;
      },
      message: () => {
        const next = state.topics.find(t => t.reviewStage === 'Day 0');
        return next ? `🆕 Anh đã có nhiều review — cân nhắc thêm 1 topic mới: ${next.emoji} ${next.name}` : '';
      },
      priority: 4
    },
    // All review queue cleared
    {
      name: 'queue-clear',
      match: (s, m) => SHADOW_ADAPTIVE?.prioritizeReviewQueue(s.topics).length === 0,
      message: () => `✨ Không có review đến hạn — thời điểm tốt để học topic mới hoặc nghỉ giải lao chủ động.`,
      priority: 3
    },
    // High mastery momentum
    {
      name: 'momentum',
      match: (s, m) => {
        const advances = s.sessionsLog.filter(l => new Date(l.at).getTime() > Date.now() - 7 * 86400000 && l.type === 'review' && l.confidence >= 4).length;
        return advances >= 5;
      },
      message: () => `🚀 ${state.sessionsLog.filter(l => new Date(l.at).getTime() > Date.now() - 7 * 86400000 && l.type === 'review' && l.confidence >= 4).length} reviews "Good+" tuần này — momentum tốt. Đừng break.`,
      priority: 6
    },
    // First Automatic
    {
      name: 'first-automatic',
      match: (s, m) => s.topics.some(t => t.memoryStatus === 'Automatic') && !localStorage.getItem('shadow-en-celebrated-first-auto'),
      message: () => {
        localStorage.setItem('shadow-en-celebrated-first-auto', '1');
        const t = state.topics.find(x => x.memoryStatus === 'Automatic');
        return `🎉 LỊCH SỬ: ${t.emoji} ${t.name} đã reach Automatic. Đây là chứng chỉ thật của ANH — phản xạ.`;
      },
      priority: 10
    },
    // Quiet — encourage
    {
      name: 'quiet',
      match: (s, m) => s.sessionsLog.length === 0,
      message: () => `🌱 Hành trình ngàn dặm bắt đầu từ topic đầu tiên. Click START NOW ở trên cùng.`,
      priority: 5
    }
  ],

  // ============= GENERATE INSIGHTS =============
  // Returns top N insights for current state
  generate: function(n) {
    n = n || 3;
    const m = SHADOW_METRICS.summary();
    const matched = this.rules
      .map(r => {
        try {
          if (r.match(state, m)) return { rule: r, message: r.message(state, m) };
        } catch(e) { console.warn('Coach rule failed:', r.name, e); }
        return null;
      })
      .filter(Boolean)
      .filter(x => x.message)
      .sort((a, b) => (b.rule.priority || 0) - (a.rule.priority || 0))
      .slice(0, n);
    return matched.map(x => ({ name: x.rule.name, text: x.message }));
  },

  // ============= POST-SESSION INSIGHT =============
  // Called after completing a session/review
  postSession: function(topicId, confidence) {
    const topic = state.topics.find(t => t.id === topicId);
    if (!topic) return null;
    const hist = topic.confidenceHistory || [];
    const vel = SHADOW_ADAPTIVE?.calculateMasteryVelocity(topic) || 0;
    if (confidence >= 5) {
      return `🎯 ${topic.name} — phản xạ nét. Stage advance!`;
    }
    if (confidence === 4) {
      return `✅ Good — mastery +${Math.round((confidence-2.5)*6)}%. ${topic.name} đang on track.`;
    }
    if (confidence === 3) {
      return `📚 OK — cần ôn thêm 1-2 lần để reach reflex.`;
    }
    if (confidence === 2) {
      return `🟧 Weak — không sao. ${topic.name} sẽ review sớm hơn. Đây là how memory works.`;
    }
    if (confidence === 1) {
      return `🔴 Forgot — reset về Day 1. ${topic.name} cần shadow thêm trước khi recall.`;
    }
    return null;
  },

  // ============= DAILY GREETING with insight =============
  dailyGreeting: function() {
    const h = new Date().getHours();
    const insights = this.generate(1);
    const main = insights[0]?.text || `Hôm nay anh chọn topic gì để bắt đầu?`;
    let timeGreeting;
    if (h < 11) timeGreeting = `Good morning, ${state.user.name}.`;
    else if (h < 17) timeGreeting = `Good afternoon, ${state.user.name}.`;
    else if (h < 21) timeGreeting = `Evening, ${state.user.name}.`;
    else timeGreeting = `Late night, ${state.user.name}.`;
    return { greeting: timeGreeting, insight: main };
  }
};

console.log('Shadow English AI Coach v10 loaded 🧠');
