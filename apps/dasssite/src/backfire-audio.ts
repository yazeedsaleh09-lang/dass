type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

const STORAGE_KEY = 'backfire_sound_enabled';

class BackfireAudio {
  private context: AudioContext | null = null;
  private ambient: { gain: GainNode; sources: OscillatorNode[] } | null = null;
  private enabled = false;

  constructor() {
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      this.enabled = false;
    }

    document.addEventListener('visibilitychange', () => {
      if (!this.context || !this.enabled) return;
      if (document.hidden) void this.context.suspend();
      else {
        void this.context.resume();
        this.ensureAmbient();
      }
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* Local preferences are optional. */
    }

    if (value) {
      this.getContext();
      this.ensureAmbient();
      this.tone(196, 294, 0.11, 'triangle', 0.038);
    } else {
      this.stopAmbient();
      if (this.context?.state === 'running') void this.context.suspend();
    }
  }

  tick(): void {
    this.tone(410, 455, 0.032, 'triangle', 0.021);
  }

  reveal(): void {
    this.tone(147, 392, 0.23, 'triangle', 0.048);
    this.tone(220, 523, 0.16, 'sine', 0.027, 0.09);
  }

  transfer(): void {
    this.tone(523, 165, 0.19, 'triangle', 0.035);
  }

  impact(): void {
    this.tone(147, 49, 0.22, 'sawtooth', 0.055);
  }

  cta(): void {
    this.tone(196, 392, 0.15, 'triangle', 0.042);
  }

  error(): void {
    this.tone(210, 130, 0.13, 'sawtooth', 0.055);
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.context = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.context.state === 'suspended' && !document.hidden) void this.context.resume();
    return this.context;
  }

  private tone(from: number, to: number, duration: number, type: OscillatorType, peak: number, delay = 0): void {
    const context = this.getContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private ensureAmbient(): void {
    const context = this.getContext();
    if (!context || this.ambient || document.hidden) return;
    const gain = context.createGain();
    gain.gain.value = 0.012;
    const low = context.createOscillator();
    const air = context.createOscillator();
    const filter = context.createBiquadFilter();
    low.type = 'sine';
    low.frequency.value = 44;
    air.type = 'sine';
    air.frequency.value = 66;
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    low.connect(filter);
    air.connect(filter);
    filter.connect(gain).connect(context.destination);
    low.start();
    air.start();
    this.ambient = { gain, sources: [low, air] };
  }

  private stopAmbient(): void {
    if (!this.ambient) return;
    const now = this.context?.currentTime ?? 0;
    this.ambient.gain.gain.cancelScheduledValues(now);
    this.ambient.gain.gain.setTargetAtTime(0.0001, now, 0.025);
    for (const source of this.ambient.sources) source.stop(now + 0.15);
    this.ambient = null;
  }
}

export const backfireAudio = new BackfireAudio();
