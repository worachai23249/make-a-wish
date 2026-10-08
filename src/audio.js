// Web Audio API Synthesizer (Zero asset downloads, 100% offline edge performance)
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

  // 🚀 OVER-THE-TOP: Hyper Launch / Laser Engine Rev
  playHyperLaunch() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Sub Bass Riser
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.5);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);

      // 2. High Laser Zap
      const laserOsc = this.ctx.createOscillator();
      const laserGain = this.ctx.createGain();
      laserOsc.type = 'sine';
      laserOsc.frequency.setValueAtTime(1600, t);
      laserOsc.frequency.exponentialRampToValueAtTime(200, t + 0.35);

      laserGain.gain.setValueAtTime(0.18, t);
      laserGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      laserOsc.connect(laserGain);
      laserGain.connect(this.ctx.destination);
      laserOsc.start(t);
      laserOsc.stop(t + 0.36);
    } catch (_) {}
  }

  // ⚡ DYNAMIC INTENSE TICK: Modulates pitch and snappy punch with rotation speed
  playTick(speedFactor = 1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Faster = higher tech chirp, slower = heavier mechanical click
      const baseFreq = 300 + Math.min(speedFactor * 350, 900);
      osc.type = speedFactor > 1.5 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (_) {}
  }

  // 💓 DRAMATIC SUSPENSE: Sub-bass Heartbeat Thump (Tension Climax)
  playHeartbeat() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Thump 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(85, t);
      osc1.frequency.exponentialRampToValueAtTime(38, t + 0.12);
      gain1.gain.setValueAtTime(0.35, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.15);

      // Thump 2
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(75, t + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(32, t + 0.28);
      gain2.gain.setValueAtTime(0.28, t + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.14);
      osc2.stop(t + 0.31);
    } catch (_) {}
  }

  // 💥 EPIC JACKPOT EXPLOSION: 808 Sub Drop + Grand Multi-Brass Fanfare + Crystal Bells
  playJackpotExplosion() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. MASSIVE 808 BASS DROP BOOM
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(140, t);
      bassOsc.frequency.exponentialRampToValueAtTime(35, t + 0.8);
      bassGain.gain.setValueAtTime(0.5, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(t);
      bassOsc.stop(t + 1.25);

      // 2. GRAND VICTORY BRASS FANFARE (C Major 9th Arpeggiated Chords)
      const fanfareNotes = [
        { f: 523.25, time: 0.05, dur: 0.7 }, // C5
        { f: 659.25, time: 0.15, dur: 0.7 }, // E5
        { f: 783.99, time: 0.25, dur: 0.7 }, // G5
        { f: 987.77, time: 0.35, dur: 0.8 }, // B5
        { f: 1046.50, time: 0.45, dur: 1.2 }, // C6 (Sustained Climax)
        { f: 1318.51, time: 0.48, dur: 1.2 }, // E6 Harmony
      ];

      fanfareNotes.forEach(({ f, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + time);

        gain.gain.setValueAtTime(0.001, t + time);
        gain.gain.linearRampToValueAtTime(0.22, t + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + time);
        osc.stop(t + time + dur + 0.05);
      });

      // 3. SHOWER OF FAIRY CRYSTAL BELLS
      for (let i = 0; i < 9; i++) {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        const bellTime = t + 0.5 + i * 0.08;
        const bellFreq = 1600 + Math.random() * 1400;

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bellFreq, bellTime);

        bellGain.gain.setValueAtTime(0.08, bellTime);
        bellGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.35);

        bellOsc.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bellOsc.start(bellTime);
        bellOsc.stop(bellTime + 0.4);
      }
    } catch (_) {}
  }

  // Classic Fanfare compatibility
  playFanfare() {
    this.playJackpotExplosion();
  }

  // Delightful pop sound for marking wish fulfilled
  playSuccess() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch (_) {}
  }
}

export const sound = new SoundFX();
