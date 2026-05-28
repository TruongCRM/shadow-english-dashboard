// ============================================================
// SHADOW ENGLISH — Custom Content Blocks Renderer
// v2 (2026-05-29) — Added paragraph, bulleted_list, numbered_list for Notion native + Content Editor
// 21 block types total
// ============================================================

window.SHADOW_BLOCKS = {

  // Persist checkbox state per block (in localStorage)
  _saveCheck: function(blockId, idx, val) {
    const key = 'shadow-en-checks-' + blockId;
    let data = {};
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}
    data[idx] = val;
    localStorage.setItem(key, JSON.stringify(data));
  },
  _loadChecks: function(blockId) {
    try { return JSON.parse(localStorage.getItem('shadow-en-checks-' + blockId) || '{}'); }
    catch(e) { return {}; }
  },

  // Render array of blocks
  renderAll: function(sections, topicId) {
    if (!sections || !Array.isArray(sections) || sections.length === 0) return '';
    return '<div class="custom-blocks">' +
      sections.filter(b => b.visible !== false).map((b, i) => {
        const fn = this.types[b.type];
        if (!fn) return `<div class="block-error">⚠️ Unknown block type: "${b.type}"</div>`;
        try { return fn.call(this, b, topicId + '-' + i); }
        catch (e) { return `<div class="block-error">⚠️ Block render error: ${e.message}</div>`; }
      }).join('') +
    '</div>';
  },

  // ============= BLOCK TYPES =============
  types: {

    // ---- PARAGRAPH (NEW v12) ----
    paragraph: function(b) {
      return `<p class="block block-paragraph">${b.text || ''}</p>`;
    },

    // ---- BULLETED LIST (NEW v12) ----
    bulleted_list: function(b) {
      const items = b.items || [];
      return `<ul class="block block-bulleted-list">${items.map(it => `<li>${it}</li>`).join('')}</ul>`;
    },

    // ---- NUMBERED LIST (NEW v12) ----
    numbered_list: function(b) {
      const items = b.items || [];
      return `<ol class="block block-numbered-list">${items.map(it => `<li>${it}</li>`).join('')}</ol>`;
    },

    // ---- HEADING ----
    heading: function(b) {
      const level = b.level || 2;
      return `<h${level} class="block-heading">${b.text || ''}</h${level}>`;
    },

    // ---- DIVIDER ----
    divider: function() {
      return '<hr class="block-divider" />';
    },

    // ---- YOUTUBE ----
    youtube: function(b) {
      const url = b.url || '';
      let id = '';
      const m1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
      if (m1) id = m1[1];
      else id = url.match(/[\w-]{11}/)?.[0] || '';
      if (!id) return '<div class="block-error">⚠️ Invalid YouTube URL</div>';
      return `<div class="block block-video">
        ${b.title ? `<div class="block-title">▶ ${b.title}</div>` : ''}
        <div class="video-wrap">
          <iframe src="https://www.youtube.com/embed/${id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
        ${b.caption ? `<div class="block-caption">${b.caption}</div>` : ''}
      </div>`;
    },

    // ---- VIMEO ----
    vimeo: function(b) {
      const id = (b.url || '').match(/vimeo\.com\/(\d+)/)?.[1] || (b.url || '').match(/\d+/)?.[0] || '';
      if (!id) return '<div class="block-error">⚠️ Invalid Vimeo URL</div>';
      return `<div class="block block-video">
        ${b.title ? `<div class="block-title">▶ ${b.title}</div>` : ''}
        <div class="video-wrap"><iframe src="https://player.vimeo.com/video/${id}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe></div>
      </div>`;
    },

    // ---- IMAGE ----
    image: function(b) {
      return `<div class="block block-image">
        ${b.title ? `<div class="block-title">🖼️ ${b.title}</div>` : ''}
        <img src="${b.src}" alt="${b.alt || b.caption || ''}" loading="lazy" />
        ${b.caption ? `<div class="block-caption">${b.caption}</div>` : ''}
      </div>`;
    },

    // ---- AUDIO ----
    audio: function(b) {
      return `<div class="block block-audio">
        ${b.title ? `<div class="block-title">🎵 ${b.title}</div>` : ''}
        <audio controls src="${b.src}" preload="metadata"></audio>
        ${b.caption ? `<div class="block-caption">${b.caption}</div>` : ''}
      </div>`;
    },

    // ---- PDF ----
    pdf: function(b) {
      return `<div class="block block-pdf">
        ${b.title ? `<div class="block-title">📄 ${b.title}</div>` : ''}
        <div class="pdf-wrap"><iframe src="${b.src}" loading="lazy"></iframe></div>
        <a href="${b.src}" target="_blank" rel="noopener" class="block-link">↗ Mở PDF trong tab mới</a>
      </div>`;
    },

    // ---- QUOTE ----
    quote: function(b) {
      return `<div class="block block-quote">
        <div class="quote-text">${b.text || ''}</div>
        ${b.author ? `<div class="quote-author">— ${b.author}</div>` : ''}
      </div>`;
    },

    // ---- CALLOUT ----
    callout: function(b) {
      const colorClass = 'callout-' + (b.color || 'purple');
      return `<div class="block block-callout ${colorClass}">
        <div class="callout-icon">${b.icon || '💡'}</div>
        <div class="callout-body">
          ${b.title ? `<div class="block-title" style="margin-bottom:4px">${b.title}</div>` : ''}
          <div>${b.text || ''}</div>
        </div>
      </div>`;
    },

    // ---- TIPS ----
    tips: function(b) {
      const items = b.items || [];
      return `<div class="block block-tips">
        <div class="block-title">💡 ${b.title || 'Pro Tips'}</div>
        <ul class="tips-list">${items.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`;
    },

    // ---- AI PROMPT ----
    'ai-prompt': function(b) {
      const safe = (b.prompt || '').replace(/`/g, '\\`').replace(/'/g, "\\'");
      return `<div class="block block-ai-prompt">
        <div class="block-title">🤖 ${b.title || 'Chat with AI'}</div>
        <div class="ai-prompt-text">${b.prompt || ''}</div>
        <button class="step-btn primary" onclick="navigator.clipboard.writeText(\`${safe}\`).then(()=>toast('✓ Prompt copied — paste vào ChatGPT/Claude'))">📋 Copy prompt</button>
        ${b.tools ? `<div class="ai-tools">${b.tools.map(t => `<a href="${t.url}" target="_blank" class="ai-tool-link">${t.name} ↗</a>`).join('')}</div>` : ''}
      </div>`;
    },

    // ---- NOTE ----
    note: function(b) {
      return `<div class="block block-note">
        ${b.title ? `<div class="block-title">📝 ${b.title}</div>` : ''}
        <div>${b.text || ''}</div>
      </div>`;
    },

    // ---- CHECKLIST ----
    checklist: function(b, blockId) {
      const items = b.items || [];
      const saved = this._loadChecks(blockId);
      return `<div class="block block-checklist">
        <div class="block-title">✅ ${b.title || 'Checklist'}</div>
        <ul class="cl-list">${items.map((it, i) => `
          <li>
            <label>
              <input type="checkbox" ${saved[i] ? 'checked' : ''} onchange="SHADOW_BLOCKS._saveCheck('${blockId}', ${i}, this.checked)" />
              <span>${it}</span>
            </label>
          </li>`).join('')}</ul>
      </div>`;
    },

    // ---- EXERCISE ----
    exercise: function(b, blockId) {
      const safeAns = (b.answer || '').replace(/'/g, "\\'");
      return `<div class="block block-exercise">
        <div class="block-title">🧠 ${b.title || 'Mini Exercise'}</div>
        <div class="exercise-q"><b>Q:</b> ${b.question || ''}</div>
        ${b.options ? `<ul class="exercise-options">${b.options.map(o => `<li>${o}</li>`).join('')}</ul>` : ''}
        <button class="step-btn" onclick="this.nextElementSibling.style.display='block';this.style.display='none'">👁 Show answer</button>
        <div class="exercise-a" style="display:none"><b>A:</b> ${b.answer || ''}</div>
      </div>`;
    },

    // ---- EMBED (generic iframe) ----
    embed: function(b) {
      return `<div class="block block-embed">
        ${b.title ? `<div class="block-title">↗ ${b.title}</div>` : ''}
        <div class="embed-wrap" style="height:${b.height || 400}px"><iframe src="${b.url}" loading="lazy" allowfullscreen></iframe></div>
      </div>`;
    },

    // ---- LINK CARD ----
    link: function(b) {
      return `<div class="block block-link-card">
        <a href="${b.url}" target="_blank" rel="noopener">
          ${b.image ? `<img src="${b.image}" alt="${b.title||''}" />` : ''}
          <div class="lc-body">
            <div class="lc-title">${b.title || b.url}</div>
            ${b.description ? `<div class="lc-desc">${b.description}</div>` : ''}
            <div class="lc-url">${b.url} ↗</div>
          </div>
        </a>
      </div>`;
    },

    // ---- HTML (escape hatch for advanced users) ----
    html: function(b) {
      return `<div class="block block-html">${b.html || ''}</div>`;
    },

    // ---- SPACER ----
    spacer: function(b) {
      const h = b.height || 24;
      return `<div style="height:${h}px"></div>`;
    }
  }
};

console.log('Shadow English Blocks System v2 loaded · ' + Object.keys(window.SHADOW_BLOCKS.types).length + ' block types ready 🧱');
