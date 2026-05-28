// ============================================================
// SHADOW ENGLISH v12.0 — Visual Content Editor (Phase 1)
// Date: 2026-05-29 (Day 3 observation week — strict no-code rule OVERRIDDEN by user)
// Scope: edit mode toggle + block toolbar + drag-drop + inline edit + Video Immersion section
// Architecture: localStorage overlay (shadow-en-overlay-{topicId}), Notion = base content
// Persistence: device-local. Write-back to Notion = v12.1+ (~20h)
// ============================================================

(function setupV12Editor() {
  const NS = window.SHADOW_V12 = window.SHADOW_V12 || {};
  NS.version = '12.0.2';

  // ============= STATE =============
  NS.editMode = false;
  NS.currentTopicId = null;
  NS._dragSrcIdx = null;

  // ============= OVERLAY STORAGE =============
  NS.getOverlay = function(topicId) {
    if (!topicId) return { videoImmersionUrl: null, customBlocks: [], notionOverrides: {} };
    try {
      const raw = localStorage.getItem('shadow-en-overlay-' + topicId);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        videoImmersionUrl: parsed.videoImmersionUrl || null,
        customBlocks: parsed.customBlocks || [],
        notionOverrides: parsed.notionOverrides || {}
      };
    } catch(e) {
      console.warn('[v12] Overlay parse error for ' + topicId, e);
      return { videoImmersionUrl: null, customBlocks: [], notionOverrides: {} };
    }
  };

  NS.saveOverlay = function(topicId, overlay) {
    if (!topicId) return;
    try {
      localStorage.setItem('shadow-en-overlay-' + topicId, JSON.stringify(overlay));
    } catch(e) {
      console.error('[v12] Overlay save error', e);
      toast('⚠️ Save failed: ' + e.message);
    }
  };

  NS.resetOverlay = function(topicId) {
    if (!topicId) return;
    if (!confirm('Xóa toàn bộ chỉnh sửa local cho topic này? Notion content sẽ hiện lại nguyên gốc.')) return;
    localStorage.removeItem('shadow-en-overlay-' + topicId);
    NS._rerender();
    toast('🗑 Đã xóa local edits — render lại Notion content');
  };

  // ============= BLOCK ID GEN =============
  NS._nextBlockId = function() {
    return 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  };

  // ============= BLOCK CRUD =============
  NS.addBlock = function(topicId, type, fields, insertIdx) {
    const overlay = NS.getOverlay(topicId);
    const defaults = NS.DEFAULT_BLOCK_CONTENT[type] || {};
    const block = Object.assign({ id: NS._nextBlockId(), type: type }, defaults, fields || {});
    if (typeof insertIdx === 'number' && insertIdx >= 0 && insertIdx <= overlay.customBlocks.length) {
      overlay.customBlocks.splice(insertIdx, 0, block);
    } else {
      overlay.customBlocks.push(block);
    }
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  NS.editBlock = function(topicId, blockId, updates) {
    const overlay = NS.getOverlay(topicId);
    const idx = overlay.customBlocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    Object.assign(overlay.customBlocks[idx], updates);
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  NS.deleteBlock = function(topicId, blockId) {
    const overlay = NS.getOverlay(topicId);
    overlay.customBlocks = overlay.customBlocks.filter(b => b.id !== blockId);
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  NS.duplicateBlock = function(topicId, blockId) {
    const overlay = NS.getOverlay(topicId);
    const idx = overlay.customBlocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const orig = overlay.customBlocks[idx];
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = NS._nextBlockId();
    overlay.customBlocks.splice(idx + 1, 0, copy);
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  NS.moveBlock = function(topicId, blockId, direction) {
    const overlay = NS.getOverlay(topicId);
    const idx = overlay.customBlocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= overlay.customBlocks.length) return;
    const [moved] = overlay.customBlocks.splice(idx, 1);
    overlay.customBlocks.splice(newIdx, 0, moved);
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  NS.reorderBlocks = function(topicId, fromIdx, toIdx) {
    const overlay = NS.getOverlay(topicId);
    if (fromIdx < 0 || fromIdx >= overlay.customBlocks.length) return;
    if (toIdx < 0 || toIdx > overlay.customBlocks.length) return;
    const [moved] = overlay.customBlocks.splice(fromIdx, 1);
    if (toIdx > fromIdx) toIdx--;
    overlay.customBlocks.splice(toIdx, 0, moved);
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  NS.setVideoImmersionUrl = function(topicId, url) {
    const overlay = NS.getOverlay(topicId);
    overlay.videoImmersionUrl = url || null;
    NS.saveOverlay(topicId, overlay);
    NS._rerender();
  };

  // ============= BLOCK TYPES CATALOG =============
  NS.BLOCK_TYPES_CATALOG = [
    { type: 'paragraph',    icon: '¶',  label: 'Text' },
    { type: 'heading',      icon: 'H',  label: 'Heading' },
    { type: 'bulleted_list',icon: '•',  label: 'Bullet List' },
    { type: 'numbered_list',icon: '1.', label: 'Numbered' },
    { type: 'quote',        icon: '"',  label: 'Quote' },
    { type: 'divider',      icon: '—',  label: 'Divider' },
    { type: 'image',        icon: '🖼', label: 'Image' },
    { type: 'youtube',      icon: '▶',  label: 'YouTube' },
    { type: 'callout',      icon: '💡', label: 'Callout' },
    { type: 'note',         icon: '📝', label: 'Note' }
  ];

  NS.DEFAULT_BLOCK_CONTENT = {
    paragraph: { text: 'Click to edit text' },
    heading:   { text: 'New heading', level: 2 },
    bulleted_list: { items: ['Item 1', 'Item 2'] },
    numbered_list: { items: ['Step 1', 'Step 2'] },
    quote:     { text: 'Quote text' },
    divider:   {},
    image:     { src: '', caption: '' },
    youtube:   { url: '', title: '' },
    callout:   { icon: '💡', text: 'Callout', color: 'purple' },
    note:      { title: 'Note', text: 'Note content' }
  };

  // ============= EDIT MODE TOGGLE =============
  NS.toggleEditMode = function() {
    NS.editMode = !NS.editMode;
    NS._rerender();
    if (NS.editMode) {
      toast('✏ Edit mode ON — Click bất kỳ block nào để chỉnh');
    } else {
      toast('👁 Preview mode — đã lưu mọi thay đổi local');
    }
  };

  // ============= CSS INJECTION (G9 versioned ID) =============
  function injectCSS() {
    const id = 'v12-editor-styles-v1';
    if (document.getElementById(id)) return;
    document.querySelectorAll('style[id^="v12-editor-styles"]').forEach(s => s.remove());
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      /* Edit Mode Toggle Button — v12.0.2: moved inline to CUSTOM CONTENT header (was hidden behind Internal Insight panel) */
      .v12-edit-toggle {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: 8px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.7);
        font-size: 12.5px; cursor: pointer;
        transition: all 200ms ease-out;
        margin-left: auto;
      }
      .v12-edit-toggle:hover {
        background: rgba(124,92,255,0.1);
        border-color: rgba(124,92,255,0.3);
        color: rgba(255,255,255,0.95);
      }
      .v12-edit-toggle.active {
        background: linear-gradient(135deg, rgba(124,92,255,0.85), rgba(180,140,255,0.95));
        color: white;
        border-color: rgba(180,140,255,0.5);
      }
      .v12-edit-toggle.active::before {
        content: '● '; color: #ec4899; font-size: 8px; animation: v12pulse 2s ease-in-out infinite;
      }
      @keyframes v12pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }

      /* Video Immersion Section */
      .v12-video-immersion {
        margin: 16px 0;
        padding: 24px;
        background: linear-gradient(135deg, rgba(124,92,255,0.04), rgba(180,140,255,0.02));
        border: 1px solid rgba(124,92,255,0.12);
        border-radius: 12px;
      }
      .v12-video-immersion .vi-title {
        font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.08em; color: rgba(255,255,255,0.55);
        margin-bottom: 12px;
      }
      .v12-video-immersion .vi-embed {
        position: relative; padding-top: 56.25%;
        background: #000; border-radius: 8px; overflow: hidden;
      }
      .v12-video-immersion .vi-embed iframe {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; border: none;
      }
      .v12-video-immersion .vi-empty {
        text-align: center; padding: 48px 24px;
        background: rgba(255,255,255,0.02);
        border: 2px dashed rgba(255,255,255,0.1);
        border-radius: 8px;
        color: rgba(255,255,255,0.5);
        font-size: 13px; cursor: pointer;
        transition: all 200ms ease-out;
      }
      .v12-video-immersion .vi-empty:hover {
        border-color: rgba(124,92,255,0.4);
        background: rgba(124,92,255,0.04);
        color: rgba(255,255,255,0.75);
      }
      .v12-video-immersion .vi-actions {
        display: flex; gap: 8px; margin-top: 10px;
        justify-content: flex-end;
      }
      .v12-video-immersion .vi-btn {
        padding: 5px 10px; border-radius: 6px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.6);
        font-size: 11px; cursor: pointer;
        transition: all 200ms ease-out;
      }
      .v12-video-immersion .vi-btn:hover {
        background: rgba(124,92,255,0.1);
        color: rgba(255,255,255,0.95);
      }

      /* Editor Section Container */
      .v12-editor-section {
        margin: 20px 0;
        padding: 20px;
        background: var(--card, rgba(255,255,255,0.02));
        border-radius: 12px;
      }
      .v12-editor-section .es-title {
        font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.08em; color: rgba(255,255,255,0.55);
        margin-bottom: 12px;
        display: flex; align-items: center; gap: 8px;
      }
      .v12-editor-section .es-badge {
        padding: 2px 8px; border-radius: 10px;
        background: rgba(124,92,255,0.15);
        color: rgba(180,140,255,0.95);
        font-size: 10px; font-weight: 500;
      }

      /* Block Wrapper (in edit mode) */
      .v12-block-wrapper {
        position: relative;
        padding: 8px;
        margin: 4px 0;
        border-radius: 8px;
        transition: background 150ms ease-out;
      }
      .editor-on .v12-block-wrapper {
        cursor: grab;
        padding-left: 32px;
      }
      .editor-on .v12-block-wrapper:hover {
        background: rgba(124,92,255,0.04);
        outline: 1px dashed rgba(124,92,255,0.25);
      }
      .editor-on .v12-block-wrapper.dragging {
        opacity: 0.4;
      }
      .editor-on .v12-block-wrapper.drag-over {
        background: rgba(124,92,255,0.12);
        outline: 2px solid rgba(124,92,255,0.5);
      }

      .v12-block-handle {
        display: none;
        position: absolute; left: 8px; top: 50%;
        transform: translateY(-50%);
        color: rgba(255,255,255,0.3);
        font-size: 14px; line-height: 1;
        cursor: grab;
        user-select: none;
        padding: 4px 2px;
      }
      .editor-on .v12-block-handle { display: block; }
      .v12-block-handle:hover { color: rgba(180,140,255,0.8); }

      .v12-block-actions {
        display: none;
        position: absolute; right: 8px; top: 8px;
        gap: 4px;
        background: rgba(13,11,31,0.95);
        padding: 4px 6px;
        border-radius: 8px;
        border: 1px solid rgba(124,92,255,0.2);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .editor-on .v12-block-wrapper:hover .v12-block-actions { display: inline-flex; }

      .v12-block-actions button {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.6);
        font-size: 13px;
        padding: 4px 6px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 150ms ease-out;
      }
      .v12-block-actions button:hover {
        background: rgba(124,92,255,0.2);
        color: white;
      }
      .v12-block-actions button[data-action="delete"]:hover {
        background: rgba(239,68,68,0.2);
        color: #ef4444;
      }

      .v12-block-content[contenteditable="true"] {
        outline: 2px solid rgba(180,140,255,0.6);
        background: rgba(124,92,255,0.06);
        border-radius: 4px;
        padding: 4px 6px;
      }
      .v12-block-content[contenteditable="true"]:focus { outline-color: rgba(180,140,255,0.9); }

      /* Add Block Button + Popover — v12.0.2: always visible (auto-enables edit mode on click) */
      .v12-add-block-bar {
        margin: 16px 0;
        text-align: center;
      }

      /* Empty state hint in CUSTOM CONTENT section */
      .v12-empty-hint {
        text-align: center;
        padding: 24px 16px;
        background: rgba(255,255,255,0.02);
        border: 2px dashed rgba(124,92,255,0.2);
        border-radius: 10px;
        color: rgba(255,255,255,0.5);
        font-size: 12.5px;
        font-style: italic;
        margin: 10px 0;
      }
      .v12-empty-hint .v12-arrow { color: rgba(180,140,255,0.8); font-style: normal; }

      .v12-add-block-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px;
        border-radius: 20px;
        background: rgba(124,92,255,0.1);
        border: 1px dashed rgba(124,92,255,0.3);
        color: rgba(180,140,255,0.9);
        font-size: 12.5px; font-weight: 500;
        cursor: pointer;
        transition: all 200ms ease-out;
      }
      .v12-add-block-btn:hover {
        background: rgba(124,92,255,0.18);
        border-color: rgba(124,92,255,0.5);
        color: white;
        transform: translateY(-1px);
      }

      .v12-popover {
        position: fixed;
        z-index: 9999;
        background: rgba(20,18,40,0.98);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(124,92,255,0.3);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        min-width: 280px;
      }
      .v12-popover-title {
        font-size: 10.5px; text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255,255,255,0.5);
        margin-bottom: 10px;
        padding: 0 4px;
      }
      .v12-popover-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
      }
      .v12-popover-btn {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        color: rgba(255,255,255,0.85);
        font-size: 12.5px;
        cursor: pointer;
        transition: all 150ms ease-out;
        text-align: left;
      }
      .v12-popover-btn:hover {
        background: rgba(124,92,255,0.15);
        border-color: rgba(124,92,255,0.35);
        transform: translateY(-1px);
      }
      .v12-popover-btn .v12-pb-icon {
        font-size: 14px; min-width: 18px; text-align: center;
        color: rgba(180,140,255,0.9);
      }

      /* Status indicators */
      .v12-status-bar {
        display: none;
        margin: 10px 0;
        padding: 10px 14px;
        background: rgba(124,92,255,0.04);
        border: 1px solid rgba(124,92,255,0.12);
        border-radius: 8px;
        font-size: 11.5px;
        color: rgba(255,255,255,0.6);
      }
      .editor-on .v12-status-bar { display: flex; align-items: center; gap: 10px; justify-content: space-between; }

      .v12-status-bar .v12-reset-btn {
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.2);
        color: rgba(239,68,68,0.85);
        font-size: 11px; cursor: pointer;
      }
      .v12-status-bar .v12-reset-btn:hover {
        background: rgba(239,68,68,0.15);
      }

      /* Mobile */
      @media (max-width: 600px) {
        .v12-edit-toggle { top: 8px; right: 8px; padding: 6px 10px; font-size: 11px; }
        .v12-popover-grid { grid-template-columns: 1fr; }
        .v12-block-actions { font-size: 11px; }
      }
    `;
    document.head.appendChild(s);
  }

  // ============= MAIN RENDER =============
  NS._rerender = function() {
    if (!NS.currentTopicId) return;
    const view = document.getElementById('view-topic-detail');
    if (!view) return;
    NS.renderTopicDetail(view, NS.currentTopicId);
  };

  NS.renderTopicDetail = function(view, topicId) {
    if (!view) return;
    NS.currentTopicId = topicId;

    // Apply editor-on class for CSS targeting
    if (NS.editMode) view.classList.add('editor-on');
    else view.classList.remove('editor-on');

    // Remove existing v12 elements (idempotent)
    view.querySelectorAll('.v12-edit-toggle-floating, .v12-video-immersion, .v12-editor-section, .v12-status-bar').forEach(el => el.remove());

    // v12.0.2: Edit mode toggle is now INSIDE CUSTOM CONTENT section header (not floating)
    // No floating toggle anymore — was hidden behind Internal Insight panel

    // 1. Insert Video Immersion section before Core Phrases
    const videoSection = NS._renderVideoImmersionSection(topicId);
    const phrasesAnchor = NS._findPhrasesCard(view);
    if (phrasesAnchor && phrasesAnchor.parentNode) {
      phrasesAnchor.parentNode.insertBefore(videoSection, phrasesAnchor);
    } else {
      // Fallback: append after first card (likely WHY)
      const firstCard = view.querySelector('.card');
      if (firstCard && firstCard.nextSibling) firstCard.parentNode.insertBefore(videoSection, firstCard.nextSibling);
      else view.appendChild(videoSection);
    }

    // 2. Editor Section (toggle in header + custom blocks + Add Block button always visible)
    const editorSection = NS._renderEditorSection(topicId);
    view.appendChild(editorSection);
  };

  NS._findPhrasesCard = function(view) {
    // Try multiple strategies to find the Phrases / Core Phrases card
    const direct = view.querySelector('[data-section-id="phrases"]')
      || view.querySelector('[data-section-id="core-phrases"]')
      || view.querySelector('.phrases-card');
    if (direct) return direct;
    // Fallback: find by title text
    const titles = view.querySelectorAll('.card-title, h2, h3');
    for (const t of titles) {
      const txt = (t.textContent || '').toUpperCase();
      if (/CORE PHRASES|PHRASES|TỪ.*CÂU|CÂU.*TỪ|BEFORE.*DURING.*AFTER/.test(txt)) {
        return t.closest('.card') || t.parentElement;
      }
    }
    return null;
  };

  NS._renderVideoImmersionSection = function(topicId) {
    const overlay = NS.getOverlay(topicId);
    const section = document.createElement('div');
    section.className = 'v12-video-immersion card';
    section.style.gridColumn = 'span 5';

    const url = overlay.videoImmersionUrl;
    let embedHtml = '';
    if (url) {
      // Extract YouTube ID
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
      const id = m ? m[1] : url.match(/[\w-]{11}/)?.[0];
      if (id) {
        embedHtml = `<div class="vi-embed"><iframe src="https://www.youtube.com/embed/${id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      } else {
        embedHtml = `<div class="vi-empty">⚠️ Invalid YouTube URL. <a href="#" onclick="event.preventDefault();SHADOW_V12._promptVideoUrl()">Try again →</a></div>`;
      }
    } else {
      embedHtml = `<div class="vi-empty" onclick="SHADOW_V12._promptVideoUrl()">▶ Click to add a native conversation video<br><span style="font-size:11px;opacity:0.6">Paste YouTube URL — auto embed</span></div>`;
    }

    section.innerHTML = `
      <div class="vi-title">▶ VIDEO IMMERSION</div>
      ${embedHtml}
      ${url ? `<div class="vi-actions">
        <button class="vi-btn" onclick="SHADOW_V12._promptVideoUrl()">✏ Change URL</button>
        <button class="vi-btn" onclick="SHADOW_V12.setVideoImmersionUrl(SHADOW_V12.currentTopicId, null)">🗑 Remove</button>
      </div>` : ''}
    `;
    return section;
  };

  NS._promptVideoUrl = function() {
    const url = prompt('Paste YouTube URL:', '');
    if (url === null) return;
    NS.setVideoImmersionUrl(NS.currentTopicId, url.trim());
  };

  NS._renderEditorSection = function(topicId) {
    const overlay = NS.getOverlay(topicId);
    const section = document.createElement('div');
    section.className = 'v12-editor-section card';
    section.style.gridColumn = 'span 5';
    const hasBlocks = overlay.customBlocks.length > 0;

    // v12.0.2: Edit toggle INSIDE header (always visible) + Add block always visible (auto-enables edit)
    section.innerHTML = `
      <div class="es-title">
        <span>🧱 CUSTOM CONTENT</span>
        <span class="es-badge">${overlay.customBlocks.length} blocks · local</span>
        <button class="v12-edit-toggle ${NS.editMode ? 'active' : ''}" onclick="SHADOW_V12.toggleEditMode()">
          ${NS.editMode ? '✏ Edit mode' : '✏ Edit'}
        </button>
      </div>
      <div class="v12-status-bar">
        <span>✏ Edit mode active — drag, click to edit, hover for actions</span>
        <button class="v12-reset-btn" onclick="SHADOW_V12.resetOverlay(SHADOW_V12.currentTopicId)">↺ Discard local edits</button>
      </div>
      ${!hasBlocks ? `<div class="v12-empty-hint">Chưa có block nào.<br>Nhấn <span class="v12-arrow">+ Add block</span> bên dưới để bắt đầu thêm content.</div>` : ''}
      <div class="v12-blocks-container"></div>
      <div class="v12-add-block-bar">
        <button class="v12-add-block-btn" onclick="SHADOW_V12._showAddPopover(event, true)">+ Add block</button>
      </div>
    `;

    const container = section.querySelector('.v12-blocks-container');
    overlay.customBlocks.forEach((block, idx) => {
      container.appendChild(NS._renderBlockWrapper(block, idx, topicId));
    });

    return section;
  };

  NS._renderBlockWrapper = function(block, idx, topicId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'v12-block-wrapper';
    wrapper.dataset.blockId = block.id;
    wrapper.dataset.blockIdx = idx;
    wrapper.draggable = true;

    // Render block content via SHADOW_BLOCKS
    const contentHtml = window.SHADOW_BLOCKS
      ? window.SHADOW_BLOCKS.types[block.type]?.call(window.SHADOW_BLOCKS, block, topicId + '-' + block.id)
        || `<div class="block-error">Unknown block: ${block.type}</div>`
      : '<div class="block-error">Block renderer not loaded</div>';

    wrapper.innerHTML = `
      <div class="v12-block-handle" title="Drag to reorder">⋮⋮</div>
      <div class="v12-block-content" data-block-id="${block.id}">${contentHtml}</div>
      <div class="v12-block-actions">
        <button data-action="edit" title="Edit">✏</button>
        <button data-action="duplicate" title="Duplicate">⎘</button>
        <button data-action="up" title="Move up">↑</button>
        <button data-action="down" title="Move down">↓</button>
        <button data-action="delete" title="Delete">🗑</button>
      </div>
    `;

    // Action handlers
    wrapper.querySelectorAll('.v12-block-actions button').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'delete') {
          if (confirm('Xóa block này?')) NS.deleteBlock(topicId, block.id);
        } else if (action === 'duplicate') {
          NS.duplicateBlock(topicId, block.id);
        } else if (action === 'up') {
          NS.moveBlock(topicId, block.id, 'up');
        } else if (action === 'down') {
          NS.moveBlock(topicId, block.id, 'down');
        } else if (action === 'edit') {
          NS._enterInlineEdit(wrapper, block, topicId);
        }
      };
    });

    // Drag-drop handlers
    wrapper.addEventListener('dragstart', function(e) {
      if (!NS.editMode) { e.preventDefault(); return; }
      NS._dragSrcIdx = idx;
      wrapper.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(idx)); } catch(err) {}
    });
    wrapper.addEventListener('dragover', function(e) {
      if (!NS.editMode) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      wrapper.classList.add('drag-over');
    });
    wrapper.addEventListener('dragleave', function(e) {
      wrapper.classList.remove('drag-over');
    });
    wrapper.addEventListener('drop', function(e) {
      e.preventDefault();
      wrapper.classList.remove('drag-over');
      if (NS._dragSrcIdx === null) return;
      const targetIdx = parseInt(wrapper.dataset.blockIdx, 10);
      if (NS._dragSrcIdx === targetIdx) return;
      NS.reorderBlocks(topicId, NS._dragSrcIdx, targetIdx);
      NS._dragSrcIdx = null;
    });
    wrapper.addEventListener('dragend', function() {
      wrapper.classList.remove('dragging');
      NS._dragSrcIdx = null;
    });

    return wrapper;
  };

  NS._enterInlineEdit = function(wrapper, block, topicId) {
    const contentEl = wrapper.querySelector('.v12-block-content');
    if (!contentEl) return;

    // For text-based blocks: contenteditable on .v12-block-content
    if (['paragraph', 'heading', 'quote', 'note'].includes(block.type)) {
      const target = contentEl.querySelector('p, h1, h2, h3, h4, .quote-text, .block-note > div:last-child') || contentEl;
      target.contentEditable = 'true';
      target.focus();
      // Select all text
      try {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch(e) {}

      const finish = function() {
        target.contentEditable = 'false';
        const newText = target.textContent.trim();
        NS.editBlock(topicId, block.id, { text: newText });
      };
      target.addEventListener('blur', finish, { once: true });
      target.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'paragraph') {
          e.preventDefault();
          target.blur();
        } else if (e.key === 'Escape') {
          target.textContent = block.text || '';
          target.blur();
        }
      });
    }
    // For list blocks: prompt for new items
    else if (['bulleted_list', 'numbered_list'].includes(block.type)) {
      const current = (block.items || []).join('\n');
      const updated = prompt('Edit list items (1 per line):', current);
      if (updated === null) return;
      const items = updated.split('\n').map(s => s.trim()).filter(Boolean);
      NS.editBlock(topicId, block.id, { items });
    }
    // For media blocks: prompt for URL
    else if (block.type === 'youtube') {
      const url = prompt('YouTube URL:', block.url || '');
      if (url === null) return;
      NS.editBlock(topicId, block.id, { url: url.trim() });
    }
    else if (block.type === 'image') {
      const src = prompt('Image URL:', block.src || '');
      if (src === null) return;
      NS.editBlock(topicId, block.id, { src: src.trim() });
    }
    // For callout: prompt for text
    else if (block.type === 'callout') {
      const text = prompt('Callout text:', block.text || '');
      if (text === null) return;
      NS.editBlock(topicId, block.id, { text: text.trim() });
    }
    // Divider: no edit
    else if (block.type === 'divider') {
      toast('Divider has nothing to edit');
    }
    else {
      toast('Edit cho block type "' + block.type + '" — coming in v12.1');
    }
  };

  NS._showAddPopover = function(event, autoEnableEdit) {
    // v12.0.2: auto-enable edit mode when triggered from Add block button
    if (autoEnableEdit && !NS.editMode) {
      NS.editMode = true;
      // Re-render so handles + actions appear
      NS._rerender();
      // Re-find button after rerender (DOM replaced)
      setTimeout(() => {
        const btn = document.querySelector('.v12-add-block-btn');
        if (btn) NS._showAddPopover({ target: btn }, false);
      }, 60);
      return;
    }

    // Remove existing popover
    document.querySelectorAll('.v12-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'v12-popover';
    popover.innerHTML = `
      <div class="v12-popover-title">Add a block</div>
      <div class="v12-popover-grid">
        ${NS.BLOCK_TYPES_CATALOG.map(t => `
          <button class="v12-popover-btn" data-type="${t.type}">
            <span class="v12-pb-icon">${t.icon}</span>
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Position near button
    const btn = event.target.closest('.v12-add-block-btn') || event.target;
    const rect = btn.getBoundingClientRect();
    popover.style.left = Math.max(10, rect.left) + 'px';
    popover.style.top = (rect.bottom + 6) + 'px';

    // Handlers
    popover.querySelectorAll('.v12-popover-btn').forEach(b => {
      b.onclick = function() {
        NS.addBlock(NS.currentTopicId, b.dataset.type);
        popover.remove();
      };
    });

    document.body.appendChild(popover);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function close(e) {
        if (!popover.contains(e.target)) {
          popover.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 0);
  };

  // ============= NAVIGATE HOOK =============
  function getCurrentTopicId() {
    // Try multiple state globals (v12.0.1 fix — global is shadowEN.state, not window.state)
    if (window.shadowEN?.state?.currentTopicId) return window.shadowEN.state.currentTopicId;
    try { if (typeof state !== 'undefined' && state?.currentTopicId) return state.currentTopicId; } catch(e) {}
    if (window.state?.currentTopicId) return window.state.currentTopicId;
    return null;
  }

  function hookNavigate() {
    if (typeof window.navigate !== 'function') { setTimeout(hookNavigate, 200); return; }
    if (window.navigate.__v12Hooked) return;

    const _origNav = window.navigate;
    window.navigate = function(viewId) {
      _origNav(viewId);
      if (viewId === 'topic-detail') {
        setTimeout(() => {
          const view = document.getElementById('view-topic-detail');
          const tid = getCurrentTopicId();
          if (view && tid) NS.renderTopicDetail(view, tid);
        }, 220);
        // Retry once for safety
        setTimeout(() => {
          const view = document.getElementById('view-topic-detail');
          const tid = getCurrentTopicId();
          if (view && tid && !view.querySelector('.v12-edit-toggle')) NS.renderTopicDetail(view, tid);
        }, 600);
      }
    };
    window.navigate.__v12Hooked = true;
  }

  // ============= INIT =============
  injectCSS();
  hookNavigate();

  // Expose info
  NS._info = function() {
    return {
      version: NS.version,
      editMode: NS.editMode,
      currentTopicId: NS.currentTopicId,
      blockTypesAvailable: NS.BLOCK_TYPES_CATALOG.length,
      overlayKeys: Object.keys(localStorage).filter(k => k.startsWith('shadow-en-overlay-')).length
    };
  };

  console.log('[v12] Visual Content Editor loaded · ' + NS.BLOCK_TYPES_CATALOG.length + ' block types · localStorage-backed overlay ✏');
})();
