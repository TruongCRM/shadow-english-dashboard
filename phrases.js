// === SHADOW ENGLISH — PHRASES ANALYZER (v11.1) ===
// Detects Survival Patterns (openers like "Can I…", "I'd like…", "How much…")
// across all topics. Pure compute layer — no DOM, no state mutation.
//
// API:
//   SHADOW_PHRASES.normalize(s)             → normalized string
//   SHADOW_PHRASES.analyze(content)         → all phrases grouped by exact match
//   SHADOW_PHRASES.getSurvivalPatterns()    → openers used across ≥2 topics
//   SHADOW_PHRASES.getRelatedTopics(id)     → topics sharing patterns with given topic
//
// Last update: 2026-05-26 (v11.1)

(function() {
  'use strict';

  // 30 most common English request/social openers — patterns that recur
  // across daily survival situations (restaurant, hotel, transport, shopping…).
  // Order matters: longer patterns first to win matching.
  var SURVIVAL_OPENERS = [
    /^i would like\b/, /^i'd like\b/, /^id like\b/,
    /^we would like\b/, /^we'd like\b/, /^wed like\b/,
    /^could you please\b/, /^could you\b/,
    /^can you please\b/, /^can you\b/,
    /^could i please\b/, /^could i\b/, /^may i\b/,
    /^can i please\b/, /^can i\b/,
    /^do you have\b/, /^do you know\b/, /^do you\b/,
    /^would you\b/,
    /^how much\b/, /^how many\b/, /^how long\b/, /^how do\b/, /^how about\b/, /^how is\b/, /^how are\b/,
    /^what time\b/, /^what is\b/, /^what's\b/, /^whats\b/, /^what kind\b/, /^what about\b/,
    /^where is\b/, /^where are\b/, /^where can\b/, /^where do\b/,
    /^when is\b/, /^when does\b/, /^when do\b/,
    /^why is\b/, /^why do\b/,
    /^is there\b/, /^are there\b/, /^is it\b/, /^is this\b/, /^is that\b/,
    /^excuse me\b/,
    /^i'm sorry\b/, /^im sorry\b/, /^sorry\b/,
    /^thank you\b/, /^thanks\b/,
    /^please\b/,
    /^i need\b/, /^i want\b/, /^i have\b/, /^i don't\b/, /^i dont\b/,
    /^i'm looking\b/, /^im looking\b/, /^i'm\b/, /^im\b/,
    /^let me\b/, /^let's\b/, /^lets\b/,
    /^we'll take\b/, /^well take\b/,
    /^there is\b/, /^there are\b/
  ];

  function normalize(s) {
    if (!s || typeof s !== 'string') return '';
    return s
      .toLowerCase()
      // Strip punctuation but keep word boundaries
      .replace(/[.,!?;:"…\-—()]/g, ' ')
      // Apostrophes: normalize curly + straight to a single form
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectOpener(rawText) {
    var n = normalize(rawText);
    if (!n) return null;
    for (var i = 0; i < SURVIVAL_OPENERS.length; i++) {
      var m = n.match(SURVIVAL_OPENERS[i]);
      if (m) return m[0];
    }
    return null;
  }

  // Cosmetic title for an opener (Title Case + ellipsis)
  function prettyOpener(opener) {
    if (!opener) return '';
    // Quick title-case
    var parts = opener.split(' ');
    var titled = parts.map(function(p) {
      if (p === 'i' || p === "i'm" || p === "i'd" || p === "i'll" || p === "i've") return p.charAt(0).toUpperCase() + p.slice(1);
      if (p.indexOf("'") !== -1) {
        var ix = p.indexOf("'");
        return p.charAt(0).toUpperCase() + p.slice(1, ix) + p.slice(ix);
      }
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');
    return titled + '…';
  }

  function _collectAll(content) {
    var out = [];
    if (!content || !content.TOPIC_CONTENT) return out;
    var tc = content.TOPIC_CONTENT;
    Object.keys(tc).forEach(function(topicId) {
      var t = tc[topicId];
      if (!t || !t.phrases) return;
      ['before', 'during', 'after'].forEach(function(section) {
        var arr = t.phrases[section] || [];
        arr.forEach(function(pair) {
          if (!Array.isArray(pair) || pair.length < 1) return;
          var en = pair[0] || '';
          var vi = pair[1] || '';
          if (!en) return;
          out.push({ english: en, vietnamese: vi, topicId: topicId, section: section });
        });
      });
    });
    return out;
  }

  // Exact-match analysis (used by getRelatedTopics)
  function analyze(content) {
    var all = _collectAll(content);
    var map = {};
    all.forEach(function(p) {
      var key = normalize(p.english);
      if (!key) return;
      if (!map[key]) {
        map[key] = { key: key, english: p.english, vietnamese: p.vietnamese, topics: {}, count: 0 };
      }
      map[key].topics[p.topicId] = true;
      map[key].count++;
    });
    return Object.keys(map).map(function(k) {
      var o = map[k];
      var topics = Object.keys(o.topics);
      return {
        key: o.key,
        english: o.english,
        vietnamese: o.vietnamese,
        freq: topics.length,
        topics: topics
      };
    }).sort(function(a, b) { return b.freq - a.freq; });
  }

  // Survival Patterns — group phrases by opener, score by topic spread
  function getSurvivalPatterns(content, opts) {
    opts = opts || {};
    var minTopics = opts.minTopics || 2;
    var limit = opts.limit || 5;
    var src = content || window.SHADOW_CONTENT;
    var all = _collectAll(src);
    var byOpener = {};
    all.forEach(function(p) {
      var op = detectOpener(p.english);
      if (!op) return;
      if (!byOpener[op]) {
        byOpener[op] = { opener: op, title: prettyOpener(op), examples: [], topics: {} };
      }
      // Keep up to 5 example phrases per opener, prefer ones with VN translation
      var slot = byOpener[op];
      if (slot.examples.length < 5) {
        slot.examples.push({ english: p.english, vietnamese: p.vietnamese, topicId: p.topicId, section: p.section });
      }
      slot.topics[p.topicId] = true;
    });
    var arr = Object.keys(byOpener).map(function(k) {
      var o = byOpener[k];
      var topics = Object.keys(o.topics);
      return {
        opener: o.opener,
        title: o.title,
        examples: o.examples,
        topicCount: topics.length,
        topics: topics,
        totalUses: o.examples.length
      };
    });
    // Filter: must span ≥minTopics
    var filtered = arr.filter(function(o) { return o.topicCount >= minTopics; });
    // Sort: topicCount desc, then totalUses desc
    filtered.sort(function(a, b) {
      if (b.topicCount !== a.topicCount) return b.topicCount - a.topicCount;
      return b.totalUses - a.totalUses;
    });
    if (filtered.length >= limit) return filtered.slice(0, limit);
    // Soft fallback: include single-topic openers to fill the slate if data is thin
    var fallback = arr
      .filter(function(o) { return o.topicCount < minTopics; })
      .sort(function(a, b) { return b.totalUses - a.totalUses; });
    return filtered.concat(fallback).slice(0, limit);
  }

  // Related topics: which topics share opener patterns with a given topic?
  function getRelatedTopics(topicId, content) {
    var src = content || window.SHADOW_CONTENT;
    var patterns = getSurvivalPatterns(src, { minTopics: 1, limit: 999 });
    var related = {};
    patterns.forEach(function(p) {
      if (p.topics.indexOf(topicId) === -1) return;
      p.topics.forEach(function(other) {
        if (other === topicId) return;
        if (!related[other]) related[other] = { id: other, shared: 0, openers: [] };
        related[other].shared++;
        if (related[other].openers.length < 5) related[other].openers.push(p.opener);
      });
    });
    return Object.keys(related).map(function(k) { return related[k]; })
      .sort(function(a, b) { return b.shared - a.shared; });
  }

  window.SHADOW_PHRASES = {
    normalize: normalize,
    detectOpener: detectOpener,
    prettyOpener: prettyOpener,
    analyze: analyze,
    getSurvivalPatterns: getSurvivalPatterns,
    getRelatedTopics: getRelatedTopics,
    _OPENERS: SURVIVAL_OPENERS
  };

  if (typeof console !== 'undefined' && console.log) {
    console.log('[v11.1] SHADOW_PHRASES loaded');
  }
})();
