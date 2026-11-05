// =============================================================================
// JAYARAM MITTAI ADMIN DASHBOARD — NEW ORDER ALERT TONE
// Synthesized with the Web Audio API (no audio file needed): a two-note
// "ding-dong" repeated every few seconds while `startAlert()` is running.
// =============================================================================

let ctx: AudioContext | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

function beep(freq: number, startAt: number, duration: number) {
  const audio = getContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.35, startAt + 0.02);
  gain.gain.linearRampToValueAtTime(0, startAt + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

function playChime() {
  try {
    const audio = getContext();
    if (audio.state === 'suspended') audio.resume();
    const now = audio.currentTime;
    beep(880, now, 0.18);
    beep(660, now + 0.2, 0.22);
  } catch {
    // Web Audio unavailable (very old browser) — the bell UI still shows the alert, just silently.
  }
}

/** Starts (or keeps running) a repeating chime. Safe to call repeatedly — it won't stack intervals. */
export function startAlert(intervalMs = 4000) {
  if (intervalId) return;
  playChime();
  intervalId = setInterval(playChime, intervalMs);
}

export function stopAlert() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
