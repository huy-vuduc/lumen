// Small sound and haptic cues for Lumen. Sounds are synthesised with WebAudio
// so the app ships no audio files. Everything is optional and fails silently.
const LumenFeedback = (() => {
  let ctx = null;

  function audio() {
    if (!LumenStorage.getSettings().sound) return null;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  // One soft sine note. Frequency in Hz, duration in seconds.
  function note(freq, start, duration, gain = 0.08) {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const vol = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(0, ac.currentTime + start);
    vol.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0005, ac.currentTime + start + duration);
    osc.connect(vol).connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + duration + 0.05);
  }

  // The native app installs window.LumenHaptics (see app/native-haptics.js)
  // because WKWebView has no navigator.vibrate; the web falls back to it.
  function vibrate(kind, pattern) {
    if (!LumenStorage.getSettings().haptics) return;
    try {
      const native = window.LumenHaptics;
      if (native) native[kind]();
      else navigator.vibrate?.(pattern);
    } catch { /* unsupported */ }
  }

  return {
    tap() { note(520, 0, 0.09, 0.05); vibrate('tap', 8); },
    solved() { note(523, 0, 0.35); note(659, 0.12, 0.35); note(784, 0.24, 0.6); vibrate('solved', [10, 40, 20]); },
    out() { note(220, 0, 0.4, 0.06); vibrate('out', 30); },
  };
})();
