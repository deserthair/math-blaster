/**
 * MenuScene - Theme selection and game start
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483);
    bg.fillRect(0, 0, width, height);

    // Animated stars
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.stars.push(star);
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: 0.1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // Title
    const title = this.add.text(width / 2, 80, 'MATH BLASTER', {
      fontSize: '48px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
    }).setOrigin(0.5);

    // Title pulse
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const subtitle = this.add.text(width / 2, 130, 'Choose Your Adventure!', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Theme buttons
    this.createThemeButton(
      width / 2 - 150, height / 2 - 20,
      '🧙 SPELL SLINGER',
      'Cast spells with math!\nMTG-inspired adventure',
      0x6b2fa0, 0x3a1078,
      'mtg'
    );

    this.createThemeButton(
      width / 2 + 150, height / 2 - 20,
      '👗 RUNWAY BLITZ',
      'Style beats math fails!\nFashion-forward combat',
      0xff1493, 0xcc0066,
      'fashion'
    );

    // High score display
    const highScore = localStorage.getItem('mathblaster_highscore') || 0;
    if (highScore > 0) {
      this.add.text(width / 2, height - 80, `🏆 High Score: ${highScore}`, {
        fontSize: '18px',
        fontFamily: 'Courier New, monospace',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);
    }

    // Controls info
    this.add.text(width / 2, height - 40, 'JUMP: Space/Tap  |  ANSWER: Click/Type', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 1
    }).setOrigin(0.5);

    // Init audio on first click
    if (!window.gameAudio) {
      window.gameAudio = new GameAudio();
    }
  }

  createThemeButton(x, y, title, desc, color1, color2, theme) {
    const container = this.add.container(x, y);
    const w = 240, h = 160;

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(color2, 0.8);
    bg.fillRoundedRect(-w/2, -h/2, w, h, 12);
    bg.lineStyle(3, color1, 1);
    bg.strokeRoundedRect(-w/2, -h/2, w, h, 12);

    // Title text
    const titleText = this.add.text(0, -h/2 + 30, title, {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Description
    const descText = this.add.text(0, 10, desc, {
      fontSize: '13px',
      fontFamily: 'Courier New, monospace',
      color: '#dddddd',
      stroke: '#000',
      strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5);

    // Play text
    const playText = this.add.text(0, h/2 - 25, '▶ PLAY', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    container.add([bg, titleText, descText, playText]);

    // Interactive zone
    const hitArea = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      container.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      container.setScale(1.0);
    });

    hitArea.on('pointerdown', () => {
      window.gameAudio.init();
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene', { theme });
      });
    });
  }
}

window.MenuScene = MenuScene;
