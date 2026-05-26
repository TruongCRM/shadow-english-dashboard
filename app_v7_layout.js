// ============================================================
// SHADOW ENGLISH v7 — Layout Config Engine + Settings Panel
// ============================================================

const LAYOUT_OVERRIDE_KEY = 'shadow-en-layout-overrides';
window.LAYOUT_CONFIG = null;

async function loadLayoutConfig() {
  try {
    const res = await fetch('layout.json?v=' + Date.now());
    const base = await res.json();
    // Merge user overrides from localStorage
    let overrides = null;
    try { overrides = JSON.parse(localStorage.getItem(LAYOUT_OVERRIDE_KEY) || 'null'); } catch(e) {}
    if (overrides) {
      base.theme = { ...base.theme, ...overrides.theme };
      if (overrides.sections) {
        const overrideMap = {};
        overrides.sections.forEach(s => { overrideMap[s.id] = s; });
        base.sections = base.sections.map(s => ({ ...s, ...(overrideMap[s.id] || {}) }));
      }
      base.features = { ...base.features, ...(overrides.features || {}) };
      base.branding = { ...base.branding, ...(overrides.branding || {}) };
    }
    window.LAYOUT_CONFIG = base;
    return base;
  } catch (e) {
    console.error('[Layout] Failed to load:', e);
    return null;
  }
}

function applyLayout() {
  const config = window.LAYOUT_CONFIG;
  if (!config) return;

  // ---- THEME ----
  const themeName = config.theme?.preset || 'dark-purple';
  const theme = config.themes?.[themeName];
  if (theme) {
    const root = document.documentElement.style;
    root.setProperty('--bg', theme.bg);
    root.setProperty('--bg-2', theme.card);
    root.setProperty('--card', theme.card);
    root.setProperty('--card-2', adjustColor(theme.card, 10));
    root.setProperty('--border', adjustColor(theme.card, 20));
    root.setProperty('--purple', theme.primary);
    root.setProperty('--purple-2', adjustColor(theme.primary, -15));
    root.setProperty('--pink', theme.accent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
  }

  // ---- SECTIONS ----
  const sectionMap = {};
  config.sections.forEach(s => { sectionMap[s.id] = s; });

  document.querySelectorAll('#view-home > [data-section-id]').forEach(el => {
    const id = el.getAttribute('data-section-id');
    const sec = sectionMap[id];
    if (!sec) return;
    if (!sec.enabled) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
      el.style.order = sec.order;
      el.style.gridColumn = 'span ' + (sec.span || 5);
      // Update card title text if it has .card-title (preserve icon)
      const titleEl = el.querySelector('.card-title');
      if (titleEl && sec.title) {
        const iconHtml = titleEl.querySelector('.icon')?.outerHTML || '';
        const badgeHtml = titleEl.querySelector('.live-badge')?.outerHTML || '';
        titleEl.innerHTML = (iconHtml || (sec.icon ? `<span class="icon">${sec.icon}</span> ` : '')) + ' ' + sec.title + ' ' + badgeHtml;
      }
    }
  });

  // ---- BRANDING ----
  if (config.branding) {
    const b = config.branding;
    const brandEl = document.querySelector('.brand');
    if (brandEl) brandEl.innerHTML = `<span class="brand-icon">${b.appIcon || '⚡'}</span> ${b.appName || 'Shadow English'}`;
    if (state?.user?.name && b.userName) state.user.name = b.userName;
    const footer = document.querySelector('.footer-quote');
    if (footer && config.features?.showFooterQuote !== false) {
      footer.innerHTML = `"${b.footerQuote || ''}" <span class="author">— ${b.footerAuthor || ''}</span>`;
      footer.style.display = '';
    } else if (footer) {
      footer.style.display = 'none';
    }
  }

  // ---- FEATURES ----
  if (config.features) {
    const xpBar = document.querySelector('.xp-bar');
    if (xpBar) xpBar.style.display = config.features.showXPbar === false ? 'none' : '';
    const installBtn = document.getElementById('install-btn');
    if (installBtn && !config.features.showInstallPWA) installBtn.style.display = 'none';
    if (config.features.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }

  console.log('[Layout] Applied theme:', themeName, '· Sections:', config.sections.filter(s => s.enabled).length, '/', config.sections.length);
}

function adjustColor(hex, amount) {
  // Lighten/darken by amount (positive = lighter)
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  let r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
}

// ============= SETTINGS MODAL =============
function openSettings() {
  const c = window.LAYOUT_CONFIG;
  if (!c) { toast('Layout config not loaded'); return; }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.innerHTML = `
    <div class="modal settings-modal" style="max-width:760px">
      <button class="modal-close" data-act="close">×</button>
      <h2 style="margin-bottom:6px">⚙️ Dashboard Settings</h2>
      <div style="font-size:12px;color:var(--text-2);margin-bottom:18px">Customize your dashboard. Changes save automatically.</div>

      <div class="modal-section">
        <div class="modal-section-title">🎨 THEME</div>
        <div class="theme-grid">
          ${Object.entries(c.themes).map(([k,t]) => `
            <div class="theme-card ${c.theme.preset === k ? 'active' : ''}" data-theme="${k}">
              <div class="theme-swatch" style="background:${t.bg};border:2px solid ${t.primary}">
                <div style="width:24px;height:8px;background:${t.primary};border-radius:4px;margin-bottom:4px"></div>
                <div style="width:16px;height:6px;background:${t.accent};border-radius:3px"></div>
              </div>
              <div class="theme-name">${t.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">📐 SECTIONS  ·  ${c.sections.filter(s => s.enabled).length} / ${c.sections.length} enabled</div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:8px">Toggle on/off · Use ↑↓ to reorder · ⬛ size column (1-5)</div>
        <div class="section-list" id="section-list">
          ${[...c.sections].sort((a,b)=>a.order-b.order).map((s,i) => `
            <div class="section-row ${s.enabled ? '' : 'disabled'}" data-id="${s.id}">
              <div class="sec-handle">⋮⋮</div>
              <span class="sec-icon">${s.icon || '•'}</span>
              <span class="sec-name">${s.title}</span>
              <div class="sec-controls">
                <button class="sec-btn" data-act="up" title="Move up">↑</button>
                <button class="sec-btn" data-act="down" title="Move down">↓</button>
                <select class="sec-size" data-act="span">
                  ${[1,2,3,4,5].map(n => `<option value="${n}" ${s.span===n?'selected':''}>${n} col</option>`).join('')}
                </select>
                <label class="toggle">
                  <input type="checkbox" data-act="toggle" ${s.enabled ? 'checked' : ''} />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">🏷️ BRANDING</div>
        <div class="branding-grid">
          <label><span>App Name</span><input data-brand="appName" value="${c.branding.appName || ''}" /></label>
          <label><span>App Icon</span><input data-brand="appIcon" value="${c.branding.appIcon || ''}" maxlength="4" /></label>
          <label><span>Your Name</span><input data-brand="userName" value="${c.branding.userName || ''}" /></label>
          <label><span>Your Title</span><input data-brand="userTitle" value="${c.branding.userTitle || ''}" /></label>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">⚡ FEATURES</div>
        <div class="feature-grid">
          ${[['showXPbar','XP Bar trên cùng'],['showFooterQuote','Footer Quote'],['showInstallPWA','Install PWA button'],['showCoach','Coach Says card'],['compactMode','Compact mode (chật hơn)']].map(([k,name]) => `
            <label class="feature-row">
              <span>${name}</span>
              <label class="toggle">
                <input type="checkbox" data-feature="${k}" ${c.features[k] ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="modal-foot" style="gap:10px;justify-content:space-between">
        <button class="step-btn" data-act="reset">↺ Reset to defaults</button>
        <div style="display:flex;gap:8px">
          <button class="step-btn" data-act="export">📋 Export JSON</button>
          <button class="step-btn primary" data-act="close">✓ Done</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  // Wire up controls
  overlay.querySelectorAll('[data-theme]').forEach(el => el.onclick = () => {
    overlay.querySelectorAll('.theme-card').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    c.theme.preset = el.dataset.theme;
    persistAndApply();
  });

  overlay.querySelectorAll('[data-act="toggle"]').forEach(el => el.onchange = () => {
    const row = el.closest('.section-row');
    const id = row.dataset.id;
    const sec = c.sections.find(s => s.id === id);
    sec.enabled = el.checked;
    row.classList.toggle('disabled', !sec.enabled);
    persistAndApply();
  });

  overlay.querySelectorAll('[data-act="span"]').forEach(el => el.onchange = () => {
    const row = el.closest('.section-row');
    const sec = c.sections.find(s => s.id === row.dataset.id);
    sec.span = parseInt(el.value);
    persistAndApply();
  });

  overlay.querySelectorAll('[data-act="up"]').forEach(el => el.onclick = () => {
    const row = el.closest('.section-row');
    const id = row.dataset.id;
    const idx = c.sections.findIndex(s => s.id === id);
    const sorted = [...c.sections].sort((a,b)=>a.order-b.order);
    const sIdx = sorted.findIndex(s => s.id === id);
    if (sIdx > 0) {
      const tmp = sorted[sIdx].order;
      sorted[sIdx].order = sorted[sIdx-1].order;
      sorted[sIdx-1].order = tmp;
      persistAndApply();
      openSettingsRefresh(overlay);
    }
  });

  overlay.querySelectorAll('[data-act="down"]').forEach(el => el.onclick = () => {
    const row = el.closest('.section-row');
    const id = row.dataset.id;
    const sorted = [...c.sections].sort((a,b)=>a.order-b.order);
    const sIdx = sorted.findIndex(s => s.id === id);
    if (sIdx < sorted.length - 1) {
      const tmp = sorted[sIdx].order;
      sorted[sIdx].order = sorted[sIdx+1].order;
      sorted[sIdx+1].order = tmp;
      persistAndApply();
      openSettingsRefresh(overlay);
    }
  });

  overlay.querySelectorAll('[data-brand]').forEach(el => el.oninput = () => {
    c.branding[el.dataset.brand] = el.value;
    persistAndApply();
  });

  overlay.querySelectorAll('[data-feature]').forEach(el => el.onchange = () => {
    c.features[el.dataset.feature] = el.checked;
    persistAndApply();
  });

  overlay.querySelector('[data-act="reset"]').onclick = async () => {
    if (confirm('Reset all customizations to defaults?')) {
      localStorage.removeItem(LAYOUT_OVERRIDE_KEY);
      await loadLayoutConfig();
      applyLayout();
      close();
      openSettings();
      toast('Reset to defaults ✓');
    }
  };

  overlay.querySelector('[data-act="export"]').onclick = () => {
    const txt = JSON.stringify(c, null, 2);
    navigator.clipboard.writeText(txt).then(() => toast('Config copied to clipboard ✓'));
  };

  overlay.querySelectorAll('[data-act="close"]').forEach(el => el.onclick = close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function openSettingsRefresh(currentOverlay) {
  currentOverlay.remove();
  openSettings();
}

function persistAndApply() {
  const c = window.LAYOUT_CONFIG;
  if (!c) return;
  // Save deltas (theme, sections changes, features, branding)
  const overrides = {
    theme: { preset: c.theme.preset },
    sections: c.sections.map(s => ({ id: s.id, enabled: s.enabled, order: s.order, span: s.span, title: s.title, icon: s.icon })),
    features: c.features,
    branding: c.branding
  };
  localStorage.setItem(LAYOUT_OVERRIDE_KEY, JSON.stringify(overrides));
  applyLayout();
  if (typeof render === 'function') render();
}

// ============= INIT =============
async function initLayoutEngine() {
  await loadLayoutConfig();
  applyLayout();
  // Make settings accessible
  window.openSettings = openSettings;
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initLayoutEngine, 200);
});

// Expose for debug
window.layoutEngine = { loadLayoutConfig, applyLayout, openSettings, persistAndApply };
console.log('Shadow English v7 — Layout config engine loaded ✨');
