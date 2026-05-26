// ============================================================
// SHADOW ENGLISH — Content Loader (Engine, NOT data)
// Fetches content.json from same origin
// ============================================================

window.SHADOW_CONTENT = {
  TOPIC_CONTENT: {},
  loaded: false,
  loadPromise: null,

  load: function() {
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = fetch('content.json?v=' + Date.now())
      .then(r => r.json())
      .then(data => {
        this.TOPIC_CONTENT = data.topics || {};
        this.loaded = true;
        this.meta = { schema: data.schema, generatedAt: data.generatedAt, source: data.source };
        console.log('[Content] Loaded ' + Object.keys(this.TOPIC_CONTENT).length + ' topics from ' + (data.source || 'json') + ' · generated ' + (data.generatedAt || 'unknown'));
        // Trigger re-render if dashboard already initialized
        if (typeof render === 'function') render();
        if (typeof renderSessionView === 'function') renderSessionView();
        return data;
      })
      .catch(err => {
        console.error('[Content] Failed to load content.json:', err);
        this.TOPIC_CONTENT = {};
      });
    return this.loadPromise;
  },

  getContent: function(topicId) {
    return this.TOPIC_CONTENT[topicId] || {
      why: this.loaded ? 'Content for this topic is not yet defined in Notion. Add it to your Topics database.' : 'Loading...',
      scene: '',
      phrases: { before: [], during: [], after: [] },
      dialogues: [],
      shadow_script: '',
      missions: [],
      active_recall: []
    };
  },

  getAllPhrases: function() {
    const all = [];
    Object.entries(this.TOPIC_CONTENT).forEach(([tid, c]) => {
      ['before', 'during', 'after'].forEach(when => {
        (c.phrases?.[when] || []).forEach(item => {
          const [en, vi] = Array.isArray(item) ? item : [item.en || '', item.vi || ''];
          all.push({ topicId: tid, when, en, vi });
        });
      });
    });
    return all;
  }
};

// Auto-load on script execution
SHADOW_CONTENT.load();
