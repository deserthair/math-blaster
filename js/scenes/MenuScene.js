/**
 * MenuScene - Theme selection: Arcade or Story mode
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
    for (let i = 0; i < 40; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: 0.1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // Title
    const title = this.add.text(width / 2, 60, 'MATH BLASTER', {
      fontSize: '48px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.05, scaleY: 1.05,
      duration: 1500, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, 110, 'Choose Your Adventure!', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // === Theme buttons (Arcade Mode) ===
    this.add.text(width / 2, 150, 'ARCADE MODE', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.createThemeButton(
      width / 2 - 150, 230,
      'SPELL SLINGER',
      'Endless math combat',
      0x6b2fa0, 0x3a1078, 'mtg', 'arcade'
    );

    this.createThemeButton(
      width / 2 + 150, 230,
      'RUNWAY BLITZ',
      'Endless fashion fight',
      0xff1493, 0xcc0066, 'fashion', 'arcade'
    );

    // === Story Mode buttons ===
    this.add.text(width / 2, 330, 'STORY MODE', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.createThemeButton(
      width / 2 - 150, 420,
      'SPELL SLINGER',
      'Rescue your family\nfrom the Eldrazi!',
      0x6b2fa0, 0x3a1078, 'mtg', 'story'
    );

    this.createThemeButton(
      width / 2 + 150, 420,
      'RUNWAY BLITZ',
      'Make it to your\nNYC runway debut!',
      0xff1493, 0xcc0066, 'fashion', 'story'
    );

    // Campaign progress indicators
    ['mtg', 'fashion'].forEach((theme, i) => {
      const progress = parseInt(localStorage.getItem(`mathblaster_campaign_${theme}`) || '0');
      if (progress > 0) {
        const px = i === 0 ? width / 2 - 150 : width / 2 + 150;
        this.add.text(px, 485, `${progress}/5 complete`, {
          fontSize: '10px',
          fontFamily: 'Courier New, monospace',
          color: progress >= 5 ? '#ffd700' : '#888888',
          stroke: '#000',
          strokeThickness: 1
        }).setOrigin(0.5);
      }
    });

    // High score
    const highScore = localStorage.getItem('mathblaster_highscore') || 0;
    if (highScore > 0) {
      this.add.text(width / 2, height - 55, `High Score: ${highScore}`, {
        fontSize: '14px',
        fontFamily: 'Courier New, monospace',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);
    }

    // Controls
    this.add.text(width / 2, height - 25, 'JUMP: Space  |  ANSWER: Type + Enter  |  ABILITIES: A S D F W E', {
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      color: '#666666',
      stroke: '#000',
      strokeThickness: 1
    }).setOrigin(0.5);

    if (!window.gameAudio) {
      window.gameAudio = new GameAudio();
    }
  }

  createThemeButton(x, y, title, desc, color1, color2, theme, mode) {
    const container = this.add.container(x, y);
    const w = 220, h = 120;

    const bg = this.add.graphics();
    bg.fillStyle(color2, 0.8);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(2, color1, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const titleText = this.add.text(0, -h / 2 + 22, title, {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const descText = this.add.text(0, 5, desc, {
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      color: '#dddddd',
      stroke: '#000',
      strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5);

    const playLabel = mode === 'story' ? 'CAMPAIGN' : 'PLAY';
    const playText = this.add.text(0, h / 2 - 18, playLabel, {
      fontSize: '13px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    container.add([bg, titleText, descText, playText]);

    const hitArea = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => container.setScale(1.05));
    hitArea.on('pointerout', () => container.setScale(1.0));
    hitArea.on('pointerdown', () => {
      window.gameAudio.init();
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        if (mode === 'story') {
          this.scene.start('SettingsScene', { theme, storyMode: true });
        } else {
          this.scene.start('SettingsScene', { theme });
        }
      });
    });
  }
}

window.MenuScene = MenuScene;
