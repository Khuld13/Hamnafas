/**
 * Web Audio API Ambient Sound & Meditation Chime Generator
 * Provides pure client-side synthesized calming audio without heavy external mp3s.
 */

class SoundscapesService {
  private ctx: AudioContext | null = null;
  private activeNodes: { [key: string]: { stop: () => void } } = {};
  private currentPlaying: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a soft calming Tibetan singing bowl / meditation bell chime
  playMeditationChime(freq = 432) {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 3.5);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 4);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }

  // Synthesize soft ambient rain
  playRain(): () => void {
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink / Brown noise for realistic soothing rain
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5; // boost
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to simulate soft raindrops hitting window glass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    return () => {
      try {
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1);
        setTimeout(() => {
          noise.stop();
          noise.disconnect();
        }, 1100);
      } catch {
        // ignore
      }
    };
  }

  // Synthesize gentle wind / forest breeze
  playBreeze(): () => void {
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    // LFO for slow undulating wind gusts
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    return () => {
      try {
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1);
        setTimeout(() => {
          noise.stop();
          lfo.stop();
          noise.disconnect();
        }, 1100);
      } catch {
        // ignore
      }
    };
  }

  // Gentle flowing stream — brighter, more "watery" filter movement than rain
  playRiver(): () => void {
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.06 * white) / 1.06;
      lastOut = data[i];
      data[i] *= 3.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    // Slow filter sweep to mimic water bubbling over stones
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.25, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    return () => {
      try {
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1);
        setTimeout(() => {
          noise.stop();
          lfo.stop();
          noise.disconnect();
        }, 1100);
      } catch {
        // ignore
      }
    };
  }

  // Quiet night ambience — soft low hum with occasional gentle cricket-like
  // chirps, for people who find nature-at-night sounds more calming than rain.
  playNight(): () => void {
    const ctx = this.initCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);

    // Low ambient hum bed
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(110, ctx.currentTime);
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.02, ctx.currentTime);
    hum.connect(humGain);
    humGain.connect(masterGain);
    hum.start();

    // Periodic soft chirp
    let chirpTimer: any = null;
    const scheduleChirp = () => {
      const delay = 900 + Math.random() * 1800;
      chirpTimer = setTimeout(() => {
        try {
          const chirp = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          chirp.type = 'sine';
          const base = 2200 + Math.random() * 500;
          chirp.frequency.setValueAtTime(base, ctx.currentTime);
          chirp.frequency.exponentialRampToValueAtTime(base * 0.9, ctx.currentTime + 0.09);
          chirpGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          chirpGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.015);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
          chirp.connect(chirpGain);
          chirpGain.connect(masterGain);
          chirp.start();
          chirp.stop(ctx.currentTime + 0.16);
        } catch {
          // ignore
        }
        scheduleChirp();
      }, delay);
    };
    scheduleChirp();

    return () => {
      try {
        clearTimeout(chirpTimer);
        masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1);
        setTimeout(() => {
          hum.stop();
          hum.disconnect();
        }, 1100);
      } catch {
        // ignore
      }
    };
  }

  // Steady, featureless white/fan noise — good for people who find rhythmic
  // "nature" sounds distracting and prefer flat, constant background noise.
  playFan(): () => void {
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    return () => {
      try {
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1);
        setTimeout(() => {
          noise.stop();
          noise.disconnect();
        }, 1100);
      } catch {
        // ignore
      }
    };
  }

  // Slow tanpura-like drone — a familiar, culturally warm instrumental tone
  // for people who find plain "nature sound" apps a little foreign.
  playTanpura(): () => void {
    const ctx = this.initCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);

    // Sa - Pa - Sa (root, fifth, octave) drone, gently detuned for warmth
    const notes = [110, 165, 220, 110.6];
    const oscillators = notes.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(i === 0 ? 0.05 : 0.028, ctx.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      return osc;
    });

    return () => {
      try {
        masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
        setTimeout(() => {
          oscillators.forEach((o) => o.stop());
          oscillators.forEach((o) => o.disconnect());
        }, 1500);
      } catch {
        // ignore
      }
    };
  }


  // Gentle musical patterns for mood support. These are not intended to
  // "boost dopamine" directly; they use bright major/pentatonic harmony,
  // moderate tempo, repetition and soft dynamics to create a more uplifting
  // listening experience than a pure ambient soundscape.
  private playMusicalPattern(mode: 'uplift' | 'sunrise' | 'flow'): () => void {
    const ctx = this.initCtx();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2);
    master.connect(ctx.destination);

    const configs = {
      uplift: { bpm: 82, notes: [261.63, 329.63, 392.00, 493.88, 392.00, 329.63, 293.66, 329.63], label: 'uplift' },
      sunrise: { bpm: 72, notes: [293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 261.63], label: 'sunrise' },
      flow: { bpm: 68, notes: [220.00, 261.63, 293.66, 329.63, 293.66, 261.63, 196.00, 220.00], label: 'flow' },
    } as const;
    const cfg = configs[mode];
    const stepMs = (60 / cfg.bpm) * 1000;
    let step = 0;
    let stopped = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // A very soft sustained root/fifth bed makes the melody feel musical
    // without turning the exercise into a loud song.
    const padOscillators = [
      { freq: mode === 'flow' ? 110 : 130.81, gain: 0.025 },
      { freq: mode === 'flow' ? 165 : 196.00, gain: 0.018 },
    ].map(({ freq, gain: level }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.value = level;
      osc.connect(g);
      g.connect(master);
      osc.start();
      return osc;
    });

    const schedule = () => {
      if (stopped) return;
      const now = ctx.currentTime;
      const freq = cfg.notes[step % cfg.notes.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = mode === 'flow' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'lowpass';
      filter.frequency.value = mode === 'uplift' ? 1800 : 1400;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(mode === 'uplift' ? 0.065 : 0.05, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (stepMs / 1000) * 0.82);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + (stepMs / 1000) * 0.9);
      step += 1;
      timers.push(setTimeout(schedule, stepMs));
    };
    schedule();

    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      setTimeout(() => {
        padOscillators.forEach((o) => { try { o.stop(); o.disconnect(); } catch {} });
        try { master.disconnect(); } catch {}
      }, 1300);
    };
  }

  toggleSoundscape(type: 'rain' | 'breeze' | 'river' | 'night' | 'fan' | 'tanpura' | 'uplift' | 'sunrise' | 'flow' | null): string | null {
    if (this.currentPlaying) {
      if (this.activeNodes[this.currentPlaying]) {
        this.activeNodes[this.currentPlaying].stop();
        delete this.activeNodes[this.currentPlaying];
      }
      if (this.currentPlaying === type || !type) {
        this.currentPlaying = null;
        return null;
      }
    }

    const players: Record<string, () => (() => void)> = {
      rain: () => this.playRain(),
      breeze: () => this.playBreeze(),
      river: () => this.playRiver(),
      night: () => this.playNight(),
      fan: () => this.playFan(),
      tanpura: () => this.playTanpura(),
      uplift: () => this.playMusicalPattern('uplift'),
      sunrise: () => this.playMusicalPattern('sunrise'),
      flow: () => this.playMusicalPattern('flow'),
    };

    if (type && players[type]) {
      const stopFn = players[type]();
      this.activeNodes[type] = { stop: stopFn };
      this.currentPlaying = type;
      return type;
    }

    return null;
  }

  getCurrentPlaying(): string | null {
    return this.currentPlaying;
  }
}

export const soundscapes = new SoundscapesService();
