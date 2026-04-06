/**
 * StorySelectScene - Campaign level select with story arc
 */
class StorySelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StorySelectScene' });
  }

  init(data) {
    this.selectedTheme = data.theme || 'mtg';
    this.character = data.character || Characters[this.selectedTheme][0];
    this.mathType = data.mathType || 'mixed';
    this.speed = data.speed || 'normal';
    this.showPrologue = data.showPrologue !== false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(400);

    const campaign = Campaign[this.selectedTheme];
    const progress = this.getProgress();

    // Background
    const bg = this.add.graphics();
    if (this.selectedTheme === 'mtg') {
      bg.fillGradientStyle(0x0a0a2e, 0x16213e, 0x0f3460, 0x1a1a2e);
    } else {
      bg.fillGradientStyle(0x2e1a2e, 0x3e2136, 0x4a2040, 0x2e1a2e);
    }
    bg.fillRect(0, 0, width, height);

    // Stars/sparkles
    for (let i = 0; i < 30; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.4),
        Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 3),
        this.selectedTheme === 'mtg' ? 0xffffff : 0xffd700,
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.tweens.add({
        targets: star, alpha: 0.1, duration: Phaser.Math.Between(1000, 3000),
        yoyo: true, repeat: -1
      });
    }

    // Title
    this.add.text(width / 2, 30, campaign.title, {
      fontSize: '32px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Prologue
    if (this.showPrologue) {
      this.add.text(width / 2, 68, campaign.prologue, {
        fontSize: '12px',
        fontFamily: 'Courier New, monospace',
        color: '#aaaaaa',
        stroke: '#000',
        strokeThickness: 1,
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);
    }

    // Level path - draw connecting line
    const pathG = this.add.graphics();
    pathG.lineStyle(3, 0x555555, 0.5);
    const levelY = 180;
    const levelSpacing = 130;
    const startX = width / 2 - 2 * levelSpacing;

    for (let i = 0; i < 4; i++) {
      const x1 = startX + i * levelSpacing + 50;
      const x2 = startX + (i + 1) * levelSpacing - 50;
      pathG.lineBetween(x1, levelY + 40, x2, levelY + 40);
    }

    // Level nodes
    campaign.levels.forEach((level, i) => {
      const lx = startX + i * levelSpacing;
      const ly = levelY;
      const unlocked = i <= progress;
      const completed = i < progress;

      this.createLevelNode(lx, ly, level, i + 1, unlocked, completed);
    });

    // Character info
    this.add.text(width / 2, height - 110, `Playing as: ${this.character.name}`, {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Back button
    const backText = this.add.text(30, height - 30, '< Settings', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
    backText.on('pointerdown', () => {
      window.gameAudio.selectSound();
      this.scene.start('SettingsScene', { theme: this.selectedTheme });
    });
    backText.on('pointerover', () => backText.setColor('#ffffff'));
    backText.on('pointerout', () => backText.setColor('#aaaaaa'));

    // Show victory if all completed
    if (progress >= 5) {
      this.add.text(width / 2, height - 70, campaign.victory.split('\n')[0], {
        fontSize: '16px',
        fontFamily: 'Courier New, monospace',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }
  }

  createLevelNode(x, y, level, num, unlocked, completed) {
    const nodeSize = 80;
    const container = this.add.container(x, y);

    // Node background
    const bg = this.add.graphics();
    if (completed) {
      bg.fillStyle(0x228822, 0.9);
      bg.lineStyle(3, 0xffd700);
    } else if (unlocked) {
      bg.fillStyle(this.character.manaHex, 0.7);
      bg.lineStyle(3, 0xffd700);
    } else {
      bg.fillStyle(0x333333, 0.5);
      bg.lineStyle(2, 0x555555);
    }
    bg.fillRoundedRect(-nodeSize / 2, 0, nodeSize, nodeSize, 8);
    bg.strokeRoundedRect(-nodeSize / 2, 0, nodeSize, nodeSize, 8);
    container.add(bg);

    // Level number
    const numText = this.add.text(0, 15, num.toString(), {
      fontSize: '28px',
      fontFamily: 'Courier New, monospace',
      color: completed ? '#ffd700' : (unlocked ? '#ffffff' : '#666666'),
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    container.add(numText);

    // Level name
    const nameText = this.add.text(0, 45, level.name, {
      fontSize: '9px',
      fontFamily: 'Courier New, monospace',
      color: unlocked ? '#ffffff' : '#555555',
      stroke: '#000',
      strokeThickness: 1,
      align: 'center',
      wordWrap: { width: nodeSize - 8 }
    }).setOrigin(0.5);
    container.add(nameText);

    // Completed checkmark
    if (completed) {
      const check = this.add.text(nodeSize / 2 - 8, 4, 'OK', {
        fontSize: '10px',
        fontFamily: 'Courier New, monospace',
        color: '#00ff00',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);
      container.add(check);
    }

    // Lock icon
    if (!unlocked) {
      const lock = this.add.text(0, 30, 'LOCKED', {
        fontSize: '10px',
        fontFamily: 'Courier New, monospace',
        color: '#666666',
        stroke: '#000',
        strokeThickness: 1
      }).setOrigin(0.5);
      container.add(lock);
    }

    // Boss name below
    this.add.text(x, y + nodeSize + 12, `Boss: ${level.boss.name}`, {
      fontSize: '8px',
      fontFamily: 'Courier New, monospace',
      color: unlocked ? '#aa8866' : '#444444',
      stroke: '#000',
      strokeThickness: 1,
      align: 'center',
      wordWrap: { width: 120 }
    }).setOrigin(0.5);

    // Click handler
    if (unlocked) {
      const zone = this.add.zone(x, y + nodeSize / 2, nodeSize, nodeSize).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => container.setScale(1.08));
      zone.on('pointerout', () => container.setScale(1.0));
      zone.on('pointerdown', () => {
        window.gameAudio.selectSound();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('CutsceneScene', {
            theme: this.selectedTheme,
            character: this.character,
            mathType: this.mathType,
            speed: this.speed,
            levelIndex: level.id - 1
          });
        });
      });
    }
  }

  getProgress() {
    const key = `mathblaster_campaign_${this.selectedTheme}`;
    return parseInt(localStorage.getItem(key) || '0');
  }
}

window.StorySelectScene = StorySelectScene;
