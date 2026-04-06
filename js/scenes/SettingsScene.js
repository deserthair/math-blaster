/**
 * SettingsScene - Character select, math type, speed
 */
class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data) {
    this.selectedTheme = data.theme || 'mtg';
    this.selectedCharIndex = 0;
    this.selectedMathType = 'addition';
    this.selectedSpeed = 'normal';
    this.storyMode = data.storyMode || false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(400);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 25, 'GAME SETTINGS', {
      fontSize: '30px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // ---- Character Selection ----
    this.add.text(width / 2, 58, 'Choose Your Character', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.charButtons = [];
    const chars = Characters[this.selectedTheme];
    const charBtnW = 130;
    const charGap = 10;
    const totalCharW = chars.length * charBtnW + (chars.length - 1) * charGap;
    const charStartX = width / 2 - totalCharW / 2 + charBtnW / 2;
    chars.forEach((c, i) => {
      this.createCharButton(charStartX + i * (charBtnW + charGap), 100, i, c);
    });
    this.updateCharSelection();

    // ---- Ability Preview ----
    this.abilityContainer = this.add.container(width / 2, 175);
    this.updateAbilityPreview();

    // ---- Math Type Selection ----
    this.add.text(width / 2, 300, 'Math Type', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.mathButtons = [];
    const mathTypes = [
      { key: 'addition', label: '+' },
      { key: 'subtraction', label: '-' },
      { key: 'multiplication', label: 'x' },
      { key: 'division', label: '/' },
      { key: 'mixed', label: 'Mix' }
    ];
    const mathBtnW = 70;
    const mathGap = 14;
    const totalMathW = mathTypes.length * mathBtnW + (mathTypes.length - 1) * mathGap;
    const mathStartX = width / 2 - totalMathW / 2 + mathBtnW / 2;
    mathTypes.forEach((mt, i) => {
      this.createOptionButton(mathStartX + i * (mathBtnW + mathGap), 338, mt.key, mt.label, mathBtnW, 38, 'math');
    });
    this.updateOptionSelection('math');

    // ---- Speed Selection ----
    this.add.text(width / 2, 378, 'Monster Speed', {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.speedButtons = [];
    const speeds = [
      { key: 'slow', label: 'Slow' },
      { key: 'normal', label: 'Normal' },
      { key: 'fast', label: 'Fast' }
    ];
    const speedBtnW = 120;
    const speedGap = 16;
    const totalSpeedW = speeds.length * speedBtnW + (speeds.length - 1) * speedGap;
    const speedStartX = width / 2 - totalSpeedW / 2 + speedBtnW / 2;
    speeds.forEach((sp, i) => {
      this.createOptionButton(speedStartX + i * (speedBtnW + speedGap), 416, sp.key, sp.label, speedBtnW, 38, 'speed');
    });
    this.updateOptionSelection('speed');

    // ---- Character Preview ----
    this.previewContainer = this.add.container(width / 2, 490);
    this.updatePreview();

    // ---- Start Button ----
    this.createStartButton(width / 2, 560);

    // ---- Back Button ----
    const backText = this.add.text(30, height - 20, '< Back', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
    backText.on('pointerdown', () => {
      window.gameAudio.selectSound();
      this.scene.start('MenuScene');
    });
    backText.on('pointerover', () => backText.setColor('#ffffff'));
    backText.on('pointerout', () => backText.setColor('#aaaaaa'));
  }

  createCharButton(x, y, index, charData) {
    const w = 130, h = 42;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    container.add(bg);

    const text = this.add.text(0, -4, charData.name, {
      fontSize: '12px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    container.add(text);

    const manaText = this.add.text(0, 12, charData.manaColor, {
      fontSize: '9px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 1
    }).setOrigin(0.5);
    container.add(manaText);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      window.gameAudio.selectSound();
      this.selectedCharIndex = index;
      this.updateCharSelection();
      this.updateAbilityPreview();
      this.updatePreview();
    });

    this.charButtons.push({ container, bg, text, manaText, index, charData, w, h });
  }

  updateCharSelection() {
    this.charButtons.forEach(btn => {
      const selected = btn.index === this.selectedCharIndex;
      btn.bg.clear();
      const borderColor = selected ? 0xffd700 : 0x555555;
      btn.bg.fillStyle(btn.charData.manaHex, selected ? 0.8 : 0.25);
      btn.bg.fillRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 6);
      btn.bg.lineStyle(selected ? 3 : 1, borderColor);
      btn.bg.strokeRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 6);
      btn.text.setColor(selected ? '#ffd700' : '#aaaaaa');
      btn.manaText.setColor(selected ? '#ffffff' : '#666666');
    });
  }

  updateAbilityPreview() {
    this.abilityContainer.removeAll(true);

    const chars = Characters[this.selectedTheme];
    const charData = chars[this.selectedCharIndex];

    // Abilities header
    const header = this.add.text(0, -10, `${charData.name} Abilities`, {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.abilityContainer.add(header);

    // Ability list - 5 abilities in a row
    const abilW = 140;
    const abilGap = 6;
    const totalAbilW = 5 * abilW + 4 * abilGap;
    const startX = -totalAbilW / 2 + abilW / 2;

    charData.abilities.forEach((ability, i) => {
      const ax = startX + i * (abilW + abilGap);
      const ay = 20;

      // Ability box
      const abBg = this.add.graphics();
      abBg.fillStyle(charData.manaHex, 0.3);
      abBg.fillRoundedRect(ax - abilW / 2, ay - 18, abilW, 50, 4);
      abBg.lineStyle(1, charData.manaHex, 0.6);
      abBg.strokeRoundedRect(ax - abilW / 2, ay - 18, abilW, 50, 4);
      this.abilityContainer.add(abBg);

      // Cost
      const costText = this.add.text(ax, ay - 6, `[${ability.key}] ${ability.cost} mana`, {
        fontSize: '9px',
        fontFamily: 'Courier New, monospace',
        color: '#aaaaaa',
        stroke: '#000',
        strokeThickness: 1
      }).setOrigin(0.5);
      this.abilityContainer.add(costText);

      // Name
      const nameText = this.add.text(ax, ay + 12, ability.name, {
        fontSize: '10px',
        fontFamily: 'Courier New, monospace',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 1
      }).setOrigin(0.5);
      this.abilityContainer.add(nameText);
    });

    // Extra life note
    const extraLife = this.add.text(0, 75, '[E] 6 Mana = Extra Life!', {
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.abilityContainer.add(extraLife);
  }

  createOptionButton(x, y, key, label, w, h, group) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    container.add(bg);

    const text = this.add.text(0, 0, label, {
      fontSize: '16px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    container.add(text);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      window.gameAudio.selectSound();
      if (group === 'math') this.selectedMathType = key;
      else this.selectedSpeed = key;
      this.updateOptionSelection(group);
    });

    const arr = group === 'math' ? this.mathButtons : this.speedButtons;
    arr.push({ container, bg, text, key, w, h, group });
  }

  updateOptionSelection(group) {
    const arr = group === 'math' ? this.mathButtons : this.speedButtons;
    const selectedKey = group === 'math' ? this.selectedMathType : this.selectedSpeed;
    const fillColor = group === 'math' ? 0x224488 : 0x443322;

    arr.forEach(btn => {
      const selected = btn.key === selectedKey;
      btn.bg.clear();
      const borderColor = selected ? 0xffd700 : 0x555555;
      btn.bg.fillStyle(fillColor, selected ? 1 : 0.3);
      btn.bg.fillRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 6);
      btn.bg.lineStyle(selected ? 3 : 1, borderColor);
      btn.bg.strokeRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 6);
      btn.text.setColor(selected ? '#ffd700' : '#888888');
    });
  }

  updatePreview() {
    this.previewContainer.removeAll(true);

    const chars = Characters[this.selectedTheme];
    const charData = chars[this.selectedCharIndex];

    SpriteGenerator.generatePlayer(this, this.selectedTheme, charData.id);

    const preview = this.add.image(0, 0, 'player').setScale(1.8);
    this.previewContainer.add(preview);
  }

  createStartButton(x, y) {
    const w = 260, h = 48;

    const bg = this.add.graphics();
    bg.fillStyle(0x228822, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    bg.lineStyle(3, 0xffd700);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

    const text = this.add.text(x, y, 'START GAME', {
      fontSize: '24px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => text.setScale(1.08));
    zone.on('pointerout', () => text.setScale(1.0));
    zone.on('pointerdown', () => {
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        const chars = Characters[this.selectedTheme];
        const charData = chars[this.selectedCharIndex];
        if (this.storyMode) {
          this.scene.start('StorySelectScene', {
            theme: this.selectedTheme,
            character: charData,
            mathType: this.selectedMathType,
            speed: this.selectedSpeed
          });
        } else {
          this.scene.start('GameScene', {
            theme: this.selectedTheme,
            character: charData,
            mathType: this.selectedMathType,
            speed: this.selectedSpeed
          });
        }
      });
    });
  }
}

window.SettingsScene = SettingsScene;
