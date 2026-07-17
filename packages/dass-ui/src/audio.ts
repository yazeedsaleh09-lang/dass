// دسّ — procedural WebAudio SFX. No files, no continuous music. Each sound = one job, short,
// distinguishable by ear (support rises, attack falls harsher, betrayal is a stab). Muteable + persisted.

type AnyWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = typeof localStorage !== 'undefined' && localStorage.getItem('dass_muted') === '1';
} catch {
  muted = false;
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined' || muted) return null;
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

function tone(from: number, to: number, dur: number, type: OscillatorType, peak = 0.16, when = 0): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
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
  isMuted(): boolean {
    return muted;
  },
  setMuted(v: boolean): void {
    muted = v;
    try {
      localStorage.setItem('dass_muted', v ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!v) ac();
  },
  toggle(): boolean {
    this.setMuted(!muted);
    return muted;
  },

  open(): void {
    tone(180, 320, 0.5, 'sine', 0.1);
    tone(90, 70, 0.7, 'sine', 0.14);
  },
  press(): void {
    tone(340, 300, 0.04, 'square', 0.07);
  },
  inputOk(): void {
    tone(520, 720, 0.09, 'sine', 0.12);
  },
  inputErr(): void {
    tone(220, 140, 0.14, 'sawtooth', 0.14);
  },
  join(): void {
    tone(440, 620, 0.1, 'sine', 0.12);
  },
  ready(): void {
    tone(500, 760, 0.12, 'triangle', 0.13);
  },
  countdown(accel = false): void {
    tone(accel ? 940 : 700, accel ? 940 : 700, 0.03, 'square', accel ? 0.12 : 0.06);
  },
  roundStart(): void {
    tone(160, 300, 0.28, 'triangle', 0.14);
  },
  submit(): void {
    tone(520, 540, 0.05, 'square', 0.1);
  },
  support(): void {
    tone(420, 760, 0.13, 'sine', 0.18);
  },
  attack(): void {
    tone(540, 150, 0.12, 'sawtooth', 0.2);
  },
  vault(): void {
    tone(200, 128, 0.24, 'sine', 0.22);
    tone(380, 320, 0.18, 'triangle', 0.08);
  },
  timeWarn(): void {
    tone(300, 300, 0.06, 'sawtooth', 0.1);
  },
  roundClose(): void {
    tone(260, 120, 0.22, 'sine', 0.14);
  },
  revealEvent(): void {
    tone(300, 420, 0.14, 'triangle', 0.12);
  },
  betray(): void {
    noise(0.11, 0.32, 1500);
    tone(780, 70, 0.2, 'sawtooth', 0.22);
  },
  score(): void {
    tone(600, 900, 0.08, 'sine', 0.1);
  },
  win(): void {
    const c = ac();
    if (!c) return;
    [262, 330, 392, 523, 659].forEach((f, i) => window.setTimeout(() => tone(f, f * 1.5, 0.5, 'triangle', 0.14), i * 150));
  },
  replay(): void {
    tone(360, 540, 0.12, 'triangle', 0.12);
  },
};
