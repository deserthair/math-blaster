/**
 * Procedural Audio - Web Audio API bleeps and bloops
 */
class GameAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a tone
   * @param {number} freq - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} type - Oscillator type
   * @param {number} volume - 0 to 1
   */
  playTone(freq, duration = 0.1, type = 'square', volume = 0.3) {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  // Correct answer - triumphant ascending arpeggio
  correctSound() {
    this.playTone(523, 0.1, 'square', 0.2);
    setTimeout(() => this.playTone(659, 0.1, 'square', 0.2), 80);
    setTimeout(() => this.playTone(784, 0.15, 'square', 0.25), 160);
    setTimeout(() => this.playTone(1047, 0.2, 'square', 0.3), 240);
  }

  // Wrong answer - descending buzz
  wrongSound() {
    this.playTone(300, 0.15, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(200, 0.2, 'sawtooth', 0.25), 120);
    setTimeout(() => this.playTone(100, 0.3, 'sawtooth', 0.2), 240);
  }

  // Enemy appears
  enemySpawnSound() {
    this.playTone(150, 0.15, 'square', 0.15);
    setTimeout(() => this.playTone(200, 0.1, 'square', 0.1), 100);
  }

  // Player hurt
  hurtSound() {
    this.playTone(200, 0.1, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(150, 0.15, 'sawtooth', 0.25), 80);
    setTimeout(() => this.playTone(80, 0.3, 'sawtooth', 0.2), 160);
  }

  // Spell cast (MTG theme)
  spellSound() {
    this.playTone(880, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(1100, 0.08, 'sine', 0.25), 60);
    setTimeout(() => this.playTone(1320, 0.1, 'sine', 0.3), 120);
    setTimeout(() => this.playTone(1760, 0.15, 'triangle', 0.2), 180);
  }

  // Style blast (Fashion theme)
  styleSound() {
    this.playTone(1000, 0.06, 'sine', 0.2);
    setTimeout(() => this.playTone(1200, 0.06, 'sine', 0.2), 50);
    setTimeout(() => this.playTone(1500, 0.08, 'sine', 0.25), 100);
    setTimeout(() => this.playTone(2000, 0.1, 'sine', 0.15), 150);
    setTimeout(() => this.playTone(1500, 0.15, 'triangle', 0.2), 200);
  }

  // Level up
  levelUpSound() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.2), i * 100);
    });
  }

  // Game over
  gameOverSound() {
    const notes = [400, 350, 300, 250, 200, 150];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sawtooth', 0.2), i * 200);
    });
  }

  // Menu select
  selectSound() {
    this.playTone(660, 0.08, 'square', 0.15);
    setTimeout(() => this.playTone(880, 0.1, 'square', 0.2), 60);
  }

  // Jump
  jumpSound() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

window.GameAudio = GameAudio;
