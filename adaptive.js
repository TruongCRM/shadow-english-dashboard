// ============================================================
// SHADOW ENGLISH v10 — Adaptive Memory Engine
// Replaces fixed SR formula with behavior-learning system
// ============================================================

window.SHADOW_ADAPTIVE = {

  // ============= FORGET RISK =============
  // Returns 0..1 (1 = highest risk of forgetting)
  // Considers: days since last review, mastery, recent confidence trend
  calculateForgetRisk: function(topic) {
    if (!topic.lastReview) return 0.85; // Day 0 — high risk until first review
    const now = Date.now();
    const last = new Date(topic.lastReview).getTime();
    const daysSince = (now - last) / 86400000;
    const expected = this._expectedInterval(topic);
    // Ratio: 1.0 = on schedule, >1 = overdue
    const ratio = daysSince / Math.max(1, expected);
    const baseRisk = Math.min(1, ratio * 0.7);
    // Adjust by mastery (low mastery = higher risk)
    const masteryFactor = 1 - (topic.masteryPct / 100) * 0.4;
    // Adjust by recent confidence trend
    const trend = this._confidenceTrend(topic);
    const trendFactor = trend < 0 ? 1.3 : (trend > 0 ? 0.85 : 1);
    return Math.min(1, baseRisk * masteryFactor * trendFactor);
  },

  // ============= MASTERY VELOCITY =============
  // Returns mastery change per review (positive = improving, negative = decaying)
  calculateMasteryVelocity: function(topic) {
    const hist = topic.confidenceHistory || [];
    if (hist.length < 2) return 0;
    const recent = hist.slice(-5);
    const avg = recent.reduce((a,b) => a+b.confidence, 0) / recent.length;
    // Velocity = (avg confidence - 3) × multiplier
    return (avg - 3) * 4;
  },

  // ============= SALVAGEABILITY =============
  // Can this topic still be saved? High when forgetting but still has mastery
  calculateSalvageability: function(topic) {
    const risk = this.calculateForgetRisk(topic);
    const mastery = topic.masteryPct / 100;
    // High salvageability = high risk + still has mastery
    return risk * mastery;
  },

  // ============= ADAPTIVE NEXT REVIEW =============
  // Calculates next review interval based on:
  // - Current stage
  // - Confidence given
  // - Historical performance (confidenceHistory)
  // - Mastery velocity
  calculateNextReview: function(topic, confidence) {
    const baseIntervals = { 'Day 0': 1, 'Day 1': 3, 'Day 3': 7, 'Day 7': 21, 'Day 21': 60, 'Day 60': 120 };
    let baseInterval = baseIntervals[topic.reviewStage] || 3;

    // Adjust based on confidence
    let mult = 1.0;
    if (confidence >= 5) mult = 1.5;       // Excellent — speed up
    else if (confidence === 4) mult = 1.2;
    else if (confidence === 3) mult = 1.0; // On track
    else if (confidence === 2) mult = 0.6; // Slow down
    else mult = 0.3;                       // Reset essentially

    // Boost based on streak of good reviews
    const hist = topic.confidenceHistory || [];
    const recent3 = hist.slice(-3);
    if (recent3.length === 3 && recent3.every(h => h.confidence >= 4)) {
      mult *= 1.3; // Streak of good — speed up faster
    }

    // Penalty if recent decay
    if (hist.length >= 2) {
      const last2 = hist.slice(-2);
      if (last2[0].confidence > last2[1].confidence) {
        mult *= 0.85; // Trend is down — review sooner
      }
    }

    const finalDays = Math.max(0.5, baseInterval * mult);
    return new Date(Date.now() + finalDays * 86400000).toISOString();
  },

  // ============= STAGE TRANSITION =============
  // Decide if topic should advance/demote/stay
  decideStageTransition: function(topic, confidence) {
    const stages = ['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Day 60'];
    const i = stages.indexOf(topic.reviewStage);
    const memory = ['Fragile','Weak','Building','Stable','Stable','Automatic'];

    if (confidence >= 4) {
      const nextIdx = Math.min(stages.length - 1, i + 1);
      return { stage: stages[nextIdx], memory: memory[nextIdx] };
    }
    if (confidence === 3) {
      return { stage: topic.reviewStage, memory: topic.memoryStatus };
    }
    if (confidence === 2) {
      // Soft reset — drop one stage
      const prevIdx = Math.max(0, i - 1);
      return { stage: stages[prevIdx], memory: memory[prevIdx] };
    }
    // confidence 1 — full reset to Day 1 (Weak)
    return { stage: 'Day 1', memory: 'Weak' };
  },

  // ============= PRIORITIZE QUEUE =============
  // Returns sorted list of topics, highest priority first
  prioritizeReviewQueue: function(topics) {
    const now = Date.now();
    const due = topics.filter(t => t.nextReview && new Date(t.nextReview).getTime() <= now && t.reviewStage !== 'Day 60');
    return due
      .map(t => ({ topic: t, score: this.calculateSalvageability(t) + this.calculateForgetRisk(t) * 0.5 }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.topic);
  },

  // ============= EXPECTED INTERVAL =============
  _expectedInterval: function(topic) {
    const map = { 'Day 0': 1, 'Day 1': 3, 'Day 3': 7, 'Day 7': 21, 'Day 21': 60, 'Day 60': 120 };
    return map[topic.reviewStage] || 7;
  },

  _confidenceTrend: function(topic) {
    const hist = topic.confidenceHistory || [];
    if (hist.length < 2) return 0;
    const recent = hist.slice(-3);
    if (recent.length < 2) return 0;
    // Linear trend
    let sum = 0;
    for (let i = 1; i < recent.length; i++) sum += recent[i].confidence - recent[i-1].confidence;
    return sum / (recent.length - 1);
  },

  // ============= APPLY REVIEW (replaces old completeReview) =============
  applyReview: function(topic, confidence) {
    // Initialize history if missing
    if (!topic.confidenceHistory) topic.confidenceHistory = [];

    // Record this review
    topic.confidenceHistory.push({
      confidence: confidence,
      at: new Date().toISOString(),
      stage: topic.reviewStage,
      masteryBefore: topic.masteryPct
    });
    // Keep last 20 entries
    if (topic.confidenceHistory.length > 20) topic.confidenceHistory = topic.confidenceHistory.slice(-20);

    // Mastery change based on confidence + velocity
    const masteryDelta = (confidence - 2.5) * 6; // -9 to +15
    topic.masteryPct = Math.max(0, Math.min(100, topic.masteryPct + masteryDelta));

    // Stage transition
    const transition = this.decideStageTransition(topic, confidence);
    topic.reviewStage = transition.stage;
    topic.memoryStatus = transition.memory;

    // Next review (adaptive)
    topic.nextReview = this.calculateNextReview(topic, confidence);
    topic.lastReview = new Date().toISOString();
    topic.sessions = (topic.sessions || 0) + 1;
    topic.confidence = confidence;

    // Track weak point (if confidence drops twice in a row)
    if (topic.confidenceHistory.length >= 2) {
      const last2 = topic.confidenceHistory.slice(-2);
      if (last2[0].confidence > last2[1].confidence && last2[1].confidence <= 2) {
        topic.lastWeakPoint = new Date().toISOString();
      }
    }

    return topic;
  }
};

console.log('Shadow English Adaptive Memory Engine v10 loaded 🧠');
