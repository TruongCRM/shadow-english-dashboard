// ============================================================
// SHADOW ENGLISH v9 — Wire Custom Content Blocks into Topic Detail
// ============================================================

// Wrap renderTopicDetail to append blocks rendering
(function setupV9() {
  function wrap() {
    const origNav = window.navigate;
    if (typeof origNav !== 'function' || !window.SHADOW_BLOCKS) {
      setTimeout(wrap, 200);
      return;
    }
    // Hook to inject blocks after Topic Detail render
    const _v9Nav = window.navigate;
    window.navigate = function(viewId) {
      _v9Nav(viewId);
      if (viewId === 'topic-detail') {
        setTimeout(injectBlocks, 150);
        setTimeout(injectBlocks, 500);
      }
    };
    function injectBlocks() {
      const view = document.getElementById('view-topic-detail');
      if (!view || !state?.currentTopicId) return;
      // Avoid duplicate injection
      if (view.querySelector('.custom-blocks')) return;
      const c = SHADOW_CONTENT.getContent(state.currentTopicId);
      if (!c.sections || !c.sections.length) return;
      const html = SHADOW_BLOCKS.renderAll(c.sections, state.currentTopicId);
      // Append a new card before the START SESSION call-to-action area
      const wrapper = document.createElement('div');
      wrapper.className = 'card blocks-card';
      wrapper.style.gridColumn = 'span 5';
      wrapper.innerHTML = `<div class="card-title"><span class="icon">🧱</span> ADDITIONAL RESOURCES <span class="live-badge">${c.sections.length} blocks</span></div>${html}`;
      view.appendChild(wrapper);
    }
    console.log('[v9] Blocks hook installed');
  }
  wrap();
})();
