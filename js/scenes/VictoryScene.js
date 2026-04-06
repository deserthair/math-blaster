/**
 * VictoryScene - Shown after beating a campaign level/boss
 */
class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.theme = data.theme;
    this.character = data.character;
    this.mathType = data.mathType;
    this.speed = data.speed;
    this.levelIndex = data.levelIndex;
    this.score = data.score || 0;
    this.bossName = data.bossName || 'Boss';
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);

    const campaign = Campaign[this.theme];
    const level = campaign.levels[this.levelIndex];
    const isLastLevel = this.levelIndex >= 4;

    // Save progress
    const key = `mathblaster_campaign_${this.theme}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    if (this.levelIndex + 1 > current) {
      localStorage.setItem(key, (this.levelIndex + 1).toString());
    }

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, width, height);

    // Confetti
    for (let i = 0; i < 40; i++) {
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, width), -20,
        Phaser.Math.Between(4, 10), Phaser.Math.Between(4, 10),
        Phaser.Math.RND.pick([0xffd700, 0xff6600, 0xff0000, 0x00ff00, 0x0066ff, 0xff00ff])
      );
      this.tweens.add({
        targets: confetti,
        y: height + 20,
        x: confetti.x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(0, 720),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 1500),
        repeat: -1
      });
    }

    // Victory text
    const victoryLabel = isLastLevel ? 'CAMPAIGN COMPLETE!' : 'LEVEL COMPLETE!';
    const vText = this.add.text(width / 2, 80, victoryLabel, {
      fontSize: '36px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.tweens.add({
      targets: vText, scaleX: 1.05, scaleY: 1.05, duration: 1000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Level info
    this.add.text(width / 2, 140, level.name, {
      fontSize: '22px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Boss defeated
    this.add.text(width / 2, 180, `${this.bossName} defeated!`, {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, 220, `Score: ${this.score}`, {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Campaign victory message
    if (isLastLevel) {
      const lines = campaign.victory.split('\n');
      lines.forEach((line, i) => {
        this.add.text(width / 2, 270 + i * 25, line, {
          fontSize: '14px',
          fontFamily: 'Courier New, monospace',
          color: '#aaffaa',
          stroke: '#000',
          strokeThickness: 2
        }).setOrigin(0.5);
      });
    }

    // Buttons
    const btnY = isLastLevel ? 380 : 300;

    if (!isLastLevel) {
      this.createButton(width / 2, btnY, 'Next Level', () => {
        window.gameAudio.selectSound();
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => {
          this.scene.start('CutsceneScene', {
            theme: this.theme,
            character: this.character,
            mathType: this.mathType,
            speed: this.speed,
            levelIndex: this.levelIndex + 1
          });
        });
      });
    }

    this.createButton(width / 2, btnY + 55, 'Level Select', () => {
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('StorySelectScene', {
          theme: this.theme,
          character: this.character,
          mathType: this.mathType,
          speed: this.speed,
          showPrologue: false
        });
      });
    });

    this.createButton(width / 2, btnY + 110, 'Main Menu', () => {
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start('MenuScene'));
    });

    window.gameAudio.levelUpSound();
  }

  createButton(x, y, label, callback) {
    const w = 240, h = 42;
    const btnColor = this.character ? this.character.manaHex : 0x3a1078;

    const bg = this.add.graphics();
    bg.fillStyle(btnColor, 0.8);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    bg.lineStyle(2, 0xffd700);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    const text = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => text.setScale(1.1));
    zone.on('pointerout', () => text.setScale(1.0));
    zone.on('pointerdown', callback);
  }
}

window.VictoryScene = VictoryScene;
