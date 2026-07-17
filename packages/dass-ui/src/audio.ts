// دسّ — procedural WebAudio SFX. No asset files, no continuous music. Each sound has ONE job
// and is distinguishable by ear alone (§د.3): support rises, attack falls harsher, dassة is a stab.
// AudioContext is created lazily and resumed on the first user gesture (call sfx.unlock() then).

type AnyWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as AnyWindow).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(fromHz: number, toHz: number, dur: number, type: OscillatorType, peak = 0.18): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(fromHz, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, toHz), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

function noise(dur: number, peak: number, highpass: number): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = highpass;
  const g = c.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + dur + 0.03);
}

export const sfx = {
  unlock(): void {
    ac();
  },
  declare(): void {
    tone(520, 520, 0.05, 'square', 0.1); // dry "committed" tick
  },
  support(): void {
    tone(420, 720, 0.11, 'sine', 0.18); // rising, soft
  },
  attack(): void {
    tone(520, 170, 0.11, 'sawtooth', 0.2); // falling, harsher — clearly not support
  },
  vaultLock(): void {
    tone(190, 120, 0.24, 'sine', 0.22); // warm "thunk" — stability
    tone(360, 300, 0.18, 'triangle', 0.08);
  },
  dassa(): void {
    noise(0.11, 0.32, 1400); // the STAB: sharp transient
    tone(760, 80, 0.2, 'sawtooth', 0.22); // + a fast downward tear
  },
  countdownTick(accel = false): void {
    tone(accel ? 900 : 680, accel ? 900 : 680, 0.03, 'square', accel ? 0.1 : 0.06);
  },
  join(): void {
    tone(500, 640, 0.09, 'sine', 0.12); // light welcome
  },
  finalReveal(): void {
    const c = ac();
    if (!c) return;
    [220, 277, 330, 440, 554].forEach((f, i) =>
      window.setTimeout(() => tone(f, f * 1.5, 0.55, 'triangle', 0.14), i * 240),
    );
  },
};
