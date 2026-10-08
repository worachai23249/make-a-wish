// Web Audio API Synthesizer (Cute, Dreamy, Kawaii & Over-the-top Magical FX)
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

  // ✨ KAWAII MAGIC LAUNCH: Fairy Wand Glissando (เสียงไม้กายสิทธิ์ร่ายมนตร์ ฟริ้งงง~)
  playHyperLaunch() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Ascending fairy harp twinkle notes (Pentatonic major sparkle)
      const scale = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];
      scale.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + i * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.36);
      });

      // Soft magical warm shimmer sweep in the background
      const shimmer = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(440, t);
      shimmer.frequency.exponentialRampToValueAtTime(1200, t + 0.45);

      shimmerGain.gain.setValueAtTime(0.08, t);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.ctx.destination);
      shimmer.start(t);
      shimmer.stop(t + 0.46);
    } catch (_) {}
  }

  // 🫧 CUTE MARIMBA / WATER BUBBLE TICK: เสียงป๊อกแป๊กฟองสบู่น่ารักสดใส
  playTick(speedFactor = 1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft bubbly pop sound
      const baseFreq = 520 + Math.min(speedFactor * 160, 480);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.025);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch (_) {}
  }

  // 💓 KAWAII TENSION: Soft Dreamy Heartbeat Twinkle (ตึก... ตึก... ลุ้นๆ น่ารัก)
  playHeartbeat() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Soft rounded pulse 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(95, t);
      osc1.frequency.exponentialRampToValueAtTime(48, t + 0.12);
      gain1.gain.setValueAtTime(0.24, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.15);

      // Soft rounded pulse 2 + tiny magical sparkle
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(88, t + 0.13);
      osc2.frequency.exponentialRampToValueAtTime(44, t + 0.25);
      gain2.gain.setValueAtTime(0.2, t + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.27);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.13);
      osc2.stop(t + 0.28);

      // Sweet little fairy ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1480, t + 0.15);
      pingGain.gain.setValueAtTime(0.05, t + 0.15);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      ping.start(t + 0.15);
      ping.stop(t + 0.33);
    } catch (_) {}
  }

  // 🌸✨ OVER-THE-TOP MAGICAL JACKPOT: Dreamy Disney/Ghibli Fairy Dust Chimes & Grand Chords
  playJackpotExplosion() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Soft Warm Velvet Bass Bloom (นุ่มนวลแต่หนักแน่น)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(110, t);
      bassOsc.frequency.exponentialRampToValueAtTime(42, t + 0.7);
      bassGain.gain.setValueAtTime(0.35, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(t);
      bassOsc.stop(t + 0.9);

      // 2. Heavenly Fairy Chords (Maj7 + Add9 dreamy harmony)
      const chord = [
        { f: 523.25, time: 0.04, dur: 0.8 }, // C5
        { f: 659.25, time: 0.12, dur: 0.8 }, // E5
        { f: 783.99, time: 0.20, dur: 0.9 }, // G5
        { f: 987.77, time: 0.28, dur: 0.9 }, // B5
        { f: 1046.50, time: 0.36, dur: 1.2 }, // C6
        { f: 1318.51, time: 0.44, dur: 1.3 }, // E6
      ];

      chord.forEach(({ f, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + time);

        gain.gain.setValueAtTime(0.001, t + time);
        gain.gain.linearRampToValueAtTime(0.18, t + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + time);
        osc.stop(t + time + dur + 0.05);
      });

      // 3. Cascade of Sparkling Star Bells (ละอองดาวคริสตัลระยิบระยับ)
      for (let i = 0; i < 12; i++) {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        const bellTime = t + 0.4 + i * 0.065;
        const bellFreq = 1400 + Math.random() * 1200;

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bellFreq, bellTime);

        bellGain.gain.setValueAtTime(0.07, bellTime);
        bellGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.32);

        bellOsc.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bellOsc.start(bellTime);
        bellOsc.stop(bellTime + 0.35);
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
