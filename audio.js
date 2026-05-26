// ============================================================
// SHADOW ENGLISH — Audio System (Web Speech API + Recorder)
// ============================================================

window.SHADOW_AUDIO = {
  rate: 1.0,
  loop: false,
  voice: null,
  voices: [],
  currentUtterance: null,
  recording: null,
  recordedBlob: null,

  init: function() {
    if (!('speechSynthesis' in window)) {
      console.warn('[Audio] SpeechSynthesis not supported');
      return false;
    }
    const setVoices = () => {
      this.voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      // Prefer en-US natural voices
      const preferred = this.voices.find(v => v.name.includes('Samantha')) ||
                        this.voices.find(v => v.name.includes('Google US English')) ||
                        this.voices.find(v => v.lang === 'en-US') ||
                        this.voices[0];
      if (preferred) this.voice = preferred;
      console.log('[Audio] Loaded ' + this.voices.length + ' English voices · default:', preferred?.name);
    };
    setVoices();
    speechSynthesis.onvoiceschanged = setVoices;
    return true;
  },

  speak: function(text, opts) {
    if (!('speechSynthesis' in window)) return;
    opts = opts || {};
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang || 'en-US';
    u.rate = opts.rate || this.rate;
    u.pitch = opts.pitch || 1;
    if (this.voice) u.voice = this.voice;
    if (opts.onstart) u.onstart = opts.onstart;
    if (opts.onend) u.onend = opts.onend;
    this.currentUtterance = u;
    speechSynthesis.speak(u);
    return u;
  },

  speakLoop: function(text, count, opts) {
    count = count || 3;
    opts = opts || {};
    let i = 0;
    const next = () => {
      if (i >= count || !this.loop && i > 0 && !opts.forceCount) return;
      i++;
      this.speak(text, {
        ...opts,
        onend: () => {
          setTimeout(() => {
            if (i < count) next();
            else if (this.loop) { i = 0; next(); }
            else if (opts.onAllDone) opts.onAllDone();
          }, 600);
        }
      });
    };
    next();
  },

  stop: function() { speechSynthesis.cancel(); this.currentUtterance = null; },

  setRate: function(r) { this.rate = r; },
  toggleLoop: function() { this.loop = !this.loop; return this.loop; },

  // ---- VOICE RECORDING ----
  startRecording: async function() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        this.recordedBlob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      this.recording = recorder;
      return true;
    } catch (e) {
      console.error('[Audio] Recording failed:', e);
      toast('🎙️ Cần cấp quyền microphone để ghi âm');
      return false;
    }
  },

  stopRecording: function() {
    if (this.recording && this.recording.state !== 'inactive') {
      this.recording.stop();
      this.recording = null;
      return true;
    }
    return false;
  },

  playRecording: function() {
    if (!this.recordedBlob) return false;
    const url = URL.createObjectURL(this.recordedBlob);
    const audio = new Audio(url);
    audio.play();
    return true;
  }
};

// Audio button HTML helper
window.audioButtonHTML = function(text, opts) {
  opts = opts || {};
  const safe = text.replace(/"/g, '&quot;');
  return `<button class="audio-btn" data-audio="${safe}" data-rate="${opts.rate||1}" title="Play">▶</button>`;
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  SHADOW_AUDIO.init();
  // Wire up audio buttons (delegated)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.audio-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.dataset.audio;
      const rate = parseFloat(btn.dataset.rate) || SHADOW_AUDIO.rate;
      btn.classList.add('playing');
      SHADOW_AUDIO.speak(text, {
        rate: rate,
        onend: () => btn.classList.remove('playing')
      });
    }
  });
});

console.log('Shadow English Audio System v1 loaded 🔊');
