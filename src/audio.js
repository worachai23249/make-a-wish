// Web Audio API Synthesizer (Cinematic Masterpiece FX — Deep Sub-Bass, Grand Brass & Crystal Chimes)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(val) {
    this.muted = val;
  }

  isMuted() {
    return this.muted;
  }

  // 🎬 CINEMATIC ENERGY LAUNCH: Powerful Energy Riser & Whoosh Sweep
  playHyperLaunch() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Resonant Sub Drone Riser
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.6);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.68);

      // 2. High Harmonic Stardust Sweep
      const sweep = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(800, t);
      sweep.frequency.exponentialRampToValueAtTime(2400, t + 0.5);

      sweepGain.gain.setValueAtTime(0.12, t);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

      sweep.connect(sweepGain);
      sweepGain.connect(this.ctx.destination);
      sweep.start(t);
      sweep.stop(t + 0.53);
    } catch (_) {}
  }

  // ⏱️ LUXURY CLOCKWORK CHIME TICK: Crisp Metallic Ping with Dynamic Velocity
  playTick(speedFactor = 1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 420 + Math.min(speedFactor * 180, 750);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.035);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.038);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (_) {}
  }

  // 💓 CINEMATIC SUB TENSION DRONE: Deep Movie-Trailer Heartbeat Pulse
  playHeartbeat() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy 50Hz sub thump
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(70, t);
      osc1.frequency.exponentialRampToValueAtTime(32, t + 0.16);
      gain1.gain.setValueAtTime(0.38, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.19);

      // Resonant ping
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(62, t + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(28, t + 0.32);
      gain2.gain.setValueAtTime(0.28, t + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.14);
      osc2.stop(t + 0.35);
    } catch (_) {}
  }

  // 👑💥 GRAND CINEMATIC JACKPOT IMPACT: 808 Sub Drop + Movie Fanfare + Crystal Bells
  playJackpotExplosion() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. MASSIVE 808 SUB IMPACT DROP (Boom!)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(130, t);
      bassOsc.frequency.exponentialRampToValueAtTime(30, t + 0.9);
      bassGain.gain.setValueAtTime(0.55, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(t);
      bassOsc.stop(t + 1.25);

      // 2. GRAND MULTI-OCTAVE BRASS FANFARE (C Maj9 Imperial Victory)
      const brassNotes = [
        { f: 523.25, time: 0.05, dur: 0.75 }, // C5
        { f: 659.25, time: 0.15, dur: 0.75 }, // E5
        { f: 783.99, time: 0.25, dur: 0.8 },  // G5
        { f: 987.77, time: 0.35, dur: 0.85 }, // B5
        { f: 1046.50, time: 0.45, dur: 1.4 }, // C6 (Grand Peak)
        { f: 1318.51, time: 0.48, dur: 1.4 }, // E6 Harmonic
      ];

      brassNotes.forEach(({ f, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + time);

        gain.gain.setValueAtTime(0.001, t + time);
        gain.gain.linearRampToValueAtTime(0.24, t + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + time);
        osc.stop(t + time + dur + 0.05);
      });

      // 3. SHOWER OF CELESTIAL CRYSTAL BELLS
      for (let i = 0; i < 14; i++) {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        const bellTime = t + 0.45 + i * 0.065;
        const bellFreq = 1600 + Math.random() * 1600;

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bellFreq, bellTime);

        bellGain.gain.setValueAtTime(0.08, bellTime);
        bellGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.35);

        bellOsc.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bellOsc.start(bellTime);
        bellOsc.stop(bellTime + 0.38);
      }
    } catch (_) {}
  }

  playFanfare() {
    this.playJackpotExplosion();
  }

  playSuccess() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, this.ctx.currentTime + 0.14); // B5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch (_) {}
  }
}

export const sound = new SoundFX();
