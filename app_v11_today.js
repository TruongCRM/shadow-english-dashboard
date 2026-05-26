// === SHADOW ENGLISH — v11.1 Integration ===
// Wires SHADOW_TODAY into the home view lifecycle.
// Patterns mirror app_v10_integration.js — non-invasive, idempotent.
//
// Strategy:
//   1. First inject after initial render (DOM ready + 800ms)
//   2. Patch window.render → re-inject when state changes and home is active
//   3. Patch window.navigate → re-inject when returning to home
//   4. Brute-force setInterval (3s) as fallback — same pattern as v8
//
// Last update: 2026-05-26 (v11.1)

(function() {
  'use strict';

  function tryInject() {
    try {
      if (window.SHADOW_TODAY && window.SHADOW_TODAY.inject) {
        return window.SHADOW_TODAY.inject();
      }
    } catch (e) {
      console.warn('[v11.1] Today inject failed:', e);
    }
    return false;
  }

  function isHomeActive() {
    var home = document.querySelector('#view-home');
    if (!home) return false;
    // App uses class "active" on the currently visible view
    return home.classList.contains('active');
  }

  // ---------- Phase 1: First-render injection ----------
  function initialInject() {
    // App needs a moment to seed state + content
    setTimeout(function() {
      tryInject();
    }, 600);
    setTimeout(function() {
      tryInject();
    }, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialInject);
  } else {
    initialInject();
  }

  // ---------- Phase 2: Patch render() ----------
  // Wait for app.js's render to be defined, then wrap it.
  var renderPatchAttempts = 0;
  function patchRender() {
    if (typeof window.render === 'function' && !window.render.__v11Patched) {
      var original = window.render;
      window.render = function() {
        var r;
        try { r = original.apply(this, arguments); } catch (e) { console.warn('[v11.1] original render threw:', e); }
        if (isHomeActive()) {
          // Defer to next tick so any DOM the original render produced is in place
          setTimeout(tryInject, 30);
        }
        return r;
      };
      window.render.__v11Patched = true;
      return true;
    }
    renderPatchAttempts++;
    if (renderPatchAttempts < 20) {
      setTimeout(patchRender, 200);
    }
    return false;
  }
  patchRender();

  // ---------- Phase 3: Patch navigate() ----------
  var navPatchAttempts = 0;
  function patchNavigate() {
    if (typeof window.navigate === 'function' && !window.navigate.__v11Patched) {
      var originalNav = window.navigate;
      window.navigate = function(viewId) {
        var r;
        try { r = originalNav.apply(this, arguments); } catch (e) { console.warn('[v11.1] original navigate threw:', e); }
        if (viewId === 'home') {
          setTimeout(tryInject, 60);
        }
        return r;
      };
      window.navigate.__v11Patched = true;
      return true;
    }
    navPatchAttempts++;
    if (navPatchAttempts < 20) {
      setTimeout(patchNavigate, 200);
    }
    return false;
  }
  patchNavigate();

  // ---------- Phase 4: Brute-force interval (last-resort reliability) ----------
  setInterval(function() {
    if (isHomeActive() && !document.querySelector('#today-card-v11')) {
      tryInject();
    }
  }, 3000);

  // Public debug handle
  window.v11 = window.v11 || {};
  window.v11.refresh = tryInject;
  window.v11.patterns = function() {
    if (!window.SHADOW_PHRASES || !window.SHADOW_CONTENT) return null;
    return window.SHADOW_PHRASES.getSurvivalPatterns(window.SHADOW_CONTENT, { minTopics: 2, limit: 10 });
  };
  window.v11.rescue = function() {
    return window.SHADOW_TODAY && window.SHADOW_TODAY._internals
      ? window.SHADOW_TODAY._internals.getRescueRanked()
      : null;
  };

  if (typeof console !== 'undefined' && console.log) {
    console.log('[v11.1] Today integration ready. Debug: v11.refresh(), v11.patterns(), v11.rescue()');
  }
})();
