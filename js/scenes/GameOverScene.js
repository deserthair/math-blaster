/**
 * GameOverScene - Score display and restart
 */
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalLevel = data.level || 1;
    this.theme = data.theme || 'mtg';
    this.isHighScore = data.isHighScore || false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);

    // Background
    const bg = this.add.graphics();
    const bgColor = this.theme === 'mtg' ? 0x0a0a2e : 0x2e0a1a;
    bg.fillStyle(bgColor);
    bg.fillRect(0, 0, width, height);

    // Game Over text
    const goText = this.add.text(width / 2, 100, 'GAME OVER', {
      fontSize: '52px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: goText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Score
    this.add.text(width / 2, 200, `Score: ${this.finalScore}`, {
      fontSize: '32px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Level reached
    this.add.text(width / 2, 250, `Level Reached: ${this.finalLevel}`, {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // High score celebration
    if (this.isHighScore) {
      const hsText = this.add.text(width / 2, 300, '🏆 NEW HIGH SCORE! 🏆', {
        fontSize: '28px',
        fontFamily: 'Courier New, monospace',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#ff6600', blur: 10, fill: true }
      }).setOrigin(0.5);

      this.tweens.add({
        targets: hsText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      // Confetti
      for (let i = 0; i < 30; i++) {
        const confetti = this.add.rectangle(
          Phaser.Math.Between(0, width),
          -20,
          Phaser.Math.Between(4, 10),
          Phaser.Math.Between(4, 10),
          Phaser.Math.RND.pick([0xffd700, 0xff6600, 0xff0000, 0x00ff00, 0x0066ff, 0xff00ff])
        );
        this.tweens.add({
          targets: confetti,
          y: height + 20,
          x: confetti.x + Phaser.Math.Between(-100, 100),
          angle: Phaser.Math.Between(0, 720),
          duration: Phaser.Math.Between(2000, 4000),
          delay: Phaser.Math.Between(0, 2000),
          repeat: -1
        });
      }
    }

    // Play Again button
    const btnY = this.isHighScore ? 380 : 340;
    this.createButton(width / 2, btnY, '▶ PLAY AGAIN', () => {
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene', { theme: this.theme });
      });
    });

    // Switch Theme button
    this.createButton(width / 2, btnY + 60, '🔄 SWITCH THEME', () => {
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene', {
          theme: this.theme === 'mtg' ? 'fashion' : 'mtg'
        });
      });
    });

    // Main Menu button
    this.createButton(width / 2, btnY + 120, '🏠 MAIN MENU', () => {
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('MenuScene');
      });
    });

    // Fun stats
    const quip = this.getQuip();
    this.add.text(width / 2, height - 40, quip, {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 1
    }).setOrigin(0.5);
  }

  createButton(x, y, label, callback) {
    const btnColor = this.theme === 'mtg' ? 0x3a1078 : 0xcc0066;
    const w = 260, h = 44;

    const bg = this.add.graphics();
    bg.fillStyle(btnColor, 0.9);
    bg.fillRoundedRect(x - w/2, y - h/2, w, h, 8);
    bg.lineStyle(2, 0xffd700);
    bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 8);

    const text = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      text.setScale(1.1);
    });
    zone.on('pointerout', () => {
      text.setScale(1.0);
    });
    zone.on('pointerdown', callback);
  }

  getQuip() {
    const quips = this.theme === 'mtg'
      ? [
        'The battlefield respects no one.',
        'Even planeswalkers need practice.',
        'Your mana shall return stronger!',
        'The creatures grow restless...',
        'Study the ancient texts (math books)!'
      ]
      : [
        'Fashion waits for no one!',
        'Even supermodels trip sometimes.',
        'Your style will come back stronger!',
        'The runway is unforgiving...',
        'Practice your math-couture!'
      ];
    return Phaser.Math.RND.pick(quips);
  }
}

window.GameOverScene = GameOverScene;
