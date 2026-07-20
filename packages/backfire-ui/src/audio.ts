// BACKFIRE sound language (§26). Procedural WebAudio — no files, no music bed.
// Every cue states a FUNCTION: support rises, disruption cuts, redirection sweeps across the
// stereo field, a shield lands dense and contained, and the Backfire is the only sound in the
// game that travels out, reverses, and returns heavier.

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

const STORAGE_KEY = 'backfire_muted';

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';
} catch {
  muted = false;
}

let bed: { gain: GainNode; filter: BiquadFilterNode; sources: OscillatorNode[] } | null = null;

function ac(): AudioContext | null {
  if (typeof window === 'undefined' || muted) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
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

function tone(
  from: number,
  to: number,
  dur: number,
  type: OscillatorType,
  peak = 0.14,
  when = 0,
  pan = 0,
): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (pan !== 0 && typeof c.createStereoPanner === 'function') {
    const panner = c.createStereoPanner();
    panner.pan.setValueAtTime(pan, t);
    osc.connect(gain).connect(panner).connect(c.destination);
  } else {
    osc.connect(gain).connect(c.destination);
  }
  osc.start(t);
  osc.stop(t + dur + 0.04);
}

/** A directional sweep: the sound physically moves from one side to the other. */
function sweep(from: number, to: number, dur: number, panFrom: number, panTo: number, peak = 0.12): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (typeof c.createStereoPanner === 'function') {
    const panner = c.createStereoPanner();
    panner.pan.setValueAtTime(panFrom, t);
    panner.pan.linearRampToValueAtTime(panTo, t + dur);
    osc.connect(gain).connect(panner).connect(c.destination);
  } else {
    osc.connect(gain).connect(c.destination);
  }
  osc.start(t);
  osc.stop(t + dur + 0.04);
}

function noise(dur: number, peak: number, highpass: number, when = 0): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = highpass;
  const gain = c.createGain();
  gain.gain.setValueAtTime(peak, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
  src.stop(t + dur + 0.04);
}

export const sfx = {
  unlock(): void {
    ac();
  },
  isMuted(): boolean {
    return muted;
  },
  setMuted(value: boolean): void {
    muted = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* preference storage is optional */
    }
    if (value) this.stopBed();
    else ac();
  },
  toggle(): boolean {
    this.setMuted(!muted);
    return muted;
  },

  /**
   * The world's ambience. Threat does not just change a number — it changes what the room
   * sounds like: the bed opens up and drops in pitch as the system destabilizes.
   */
  setThreatBed(threat: number): void {
    const c = ac();
    if (!c) {
      this.stopBed();
      return;
    }
    if (!bed) {
      const gain = c.createGain();
      gain.gain.value = 0.0001;
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;
      const low = c.createOscillator();
      const air = c.createOscillator();
      low.type = 'sine';
      air.type = 'sine';
      low.frequency.value = 42;
      air.frequency.value = 63;
      low.connect(filter);
      air.connect(filter);
      filter.connect(gain).connect(c.destination);
      low.start();
      air.start();
      bed = { gain, filter, sources: [low, air] };
    }
    const now = c.currentTime;
    const level = [0.012, 0.014, 0.02, 0.026, 0.034, 0.05][Math.max(0, Math.min(5, threat))] ?? 0.014;
    const cutoff = [150, 150, 175, 205, 240, 300][Math.max(0, Math.min(5, threat))] ?? 150;
    bed.gain.gain.setTargetAtTime(level, now, 0.6);
    bed.filter.frequency.setTargetAtTime(cutoff, now, 0.6);
    for (const src of bed.sources) src.frequency.setTargetAtTime(src.frequency.value - threat * 0.6, now, 1.2);
  },
  stopBed(): void {
    if (!bed || !ctx) return;
    const now = ctx.currentTime;
    bed.gain.gain.cancelScheduledValues(now);
    bed.gain.gain.setTargetAtTime(0.0001, now, 0.05);
    for (const src of bed.sources) src.stop(now + 0.4);
    bed = null;
  },

  // ---- interface ----
  press(): void {
    tone(320, 300, 0.035, 'square', 0.05);
  },
  join(): void {
    tone(300, 420, 0.1, 'triangle', 0.07);
  },
  ready(): void {
    tone(330, 495, 0.12, 'triangle', 0.08);
  },
  error(): void {
    tone(210, 130, 0.13, 'sawtooth', 0.09);
  },

  /** Private intel arrived: short, precise, unmistakably "for you". */
  intel(): void {
    tone(660, 880, 0.07, 'sine', 0.09);
    tone(990, 990, 0.04, 'sine', 0.04, 0.07);
  },
  /** Discussion opens: a controlled tonal rise, never an announcer sting. */
  discussionOpen(): void {
    tone(147, 294, 0.5, 'triangle', 0.07);
  },
  /** Final ten seconds: a slow pulse with low-frequency tension underneath. */
  pulse(urgent = false): void {
    tone(urgent ? 196 : 165, urgent ? 196 : 165, 0.06, 'triangle', urgent ? 0.075 : 0.045);
    if (urgent) tone(55, 48, 0.16, 'sine', 0.06);
  },
  /** A decision locking is mechanical and final. */
  lock(): void {
    tone(420, 180, 0.05, 'square', 0.08);
    noise(0.03, 0.06, 2400, 0.02);
  },

  // ---- resolution language ----
  event(): void {
    noise(0.09, 0.12, 900);
    tone(180, 60, 0.4, 'sine', 0.11);
  },
  support(): void {
    tone(262, 392, 0.18, 'triangle', 0.09);
  },
  /** Disruption: a sharp cut. The route audibly stops rather than fades. */
  disrupt(): void {
    noise(0.07, 0.2, 1800);
    tone(440, 90, 0.13, 'sawtooth', 0.13);
  },
  /** Redirection: a directional sweep across the field. */
  redirect(): void {
    sweep(392, 262, 0.42, -0.85, 0.85, 0.11);
  },
  /** Shield: dense and contained, with no tail. */
  shield(): void {
    tone(110, 98, 0.2, 'sine', 0.14);
    tone(220, 208, 0.12, 'triangle', 0.06);
  },
  /** Echo charge: a low resonant pulse. */
  echoCharge(): void {
    tone(87, 65, 0.55, 'sine', 0.13);
    tone(174, 130, 0.3, 'triangle', 0.05);
  },
  carrier(): void {
    tone(196, 294, 0.26, 'triangle', 0.1);
    tone(392, 523, 0.16, 'sine', 0.05, 0.1);
  },
  threatUp(): void {
    tone(140, 190, 0.3, 'sawtooth', 0.08);
  },
  threatDown(): void {
    tone(240, 160, 0.3, 'sine', 0.07);
  },

  /**
   * THE BACKFIRE — the one signature sound. Three movements, in this order:
   * it travels out, it stalls and reverses, and it returns heavier than it left.
   */
  backfire(): void {
    sweep(330, 494, 0.3, -0.9, 0.9, 0.12); // out
    const c = ac();
    if (!c) return;
    window.setTimeout(() => sweep(494, 165, 0.34, 0.9, -0.9, 0.15), 320); // reversal
    window.setTimeout(() => {
      tone(110, 41, 0.6, 'sawtooth', 0.2);
      tone(55, 34, 0.75, 'sine', 0.17);
      noise(0.14, 0.14, 500);
    }, 640); // return impact
  },

  /** Collapse: motion stops, the bed cuts, one dead low strike lands. */
  collapse(): void {
    this.stopBed();
    noise(0.2, 0.2, 200);
    tone(70, 28, 1.1, 'sine', 0.2);
  },

  resultsIn(): void {
    tone(196, 262, 0.3, 'triangle', 0.08);
    tone(262, 330, 0.35, 'sine', 0.06, 0.16);
  },
};
