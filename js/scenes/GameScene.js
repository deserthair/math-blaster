/**
 * GameScene - Main gameplay
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.theme = data.theme || 'mtg';
    this.character = data.character || Characters[this.theme][0];
    this.mathType = data.mathType || 'mixed';
    this.speedSetting = data.speed || 'normal';
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.killCount = 0;
    this.killsToLevel = 5;
    this.currentProblem = null;
    this.answerText = '';
    this.gameActive = true;
    this.groundY = 480;
    this.playerInvulnerable = false;
    this.collisionPaused = false;
    this.mana = 0;
    this.maxMana = 6;

    // Campaign mode
    this.campaignMode = data.campaignMode || false;
    this.levelIndex = data.levelIndex || 0;
    this.campaignLevel = null;
    this.campaignKills = 0;
    this.bossActive = false;
    this.bossEnemy = null;
    this.bossHP = 0;
    this.bossMaxHP = 0;
    if (this.campaignMode) {
      this.campaignLevel = Campaign[this.theme].levels[this.levelIndex];
      this.campaignKills = 0;
    }

    const speedConfigs = {
      slow:   { enemySpeed: 40,  spawnDelay: 4000 },
      normal: { enemySpeed: 60,  spawnDelay: 3000 },
      fast:   { enemySpeed: 90,  spawnDelay: 2000 }
    };
    const cfg = speedConfigs[this.speedSetting] || speedConfigs.normal;
    this.enemySpeed = cfg.enemySpeed;
    this.spawnDelay = cfg.spawnDelay;
    this.baseEnemySpeed = cfg.enemySpeed;
    this.baseSpawnDelay = cfg.spawnDelay;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);
    window.gameAudio.resume();

    // Generate level-specific background in campaign mode
    if (this.campaignMode && this.campaignLevel) {
      this.generateCampaignBackground(this.campaignLevel.bgColors);
      this.generateCampaignGround(this.campaignLevel.bgColors);
      this.generateCampaignEnemies(this.campaignLevel.enemies);
    }
    SpriteGenerator.generateAll(this, this.theme, this.character.id);

    this.add.image(width / 2, height / 2, 'background');
    this.groundTiles = this.add.tileSprite(width / 2, this.groundY + 16, width, 32, 'ground');

    // Player
    this.player = this.physics.add.sprite(120, this.groundY - 30, 'player');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);
    this.player.body.setSize(32, 50);
    this.player.body.setOffset(8, 8);

    // Ground
    this.ground = this.add.rectangle(width / 2, this.groundY, width, 4, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.player, this.ground);

    this.enemies = this.add.group();
    this.projectiles = this.add.group();
    this.bangContainer = this.add.container(0, 0).setDepth(500).setVisible(false);

    this.createUI();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.paused = false;
    this.pauseOverlay = null;

    // Number keys
    this.numberKeys = {};
    for (let i = 0; i <= 9; i++) {
      this.numberKeys[i] = this.input.keyboard.addKey(48 + i);
      this.numberKeys['num' + i] = this.input.keyboard.addKey(96 + i);
    }
    this.backspaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);

    // Ability keys: A=1, S=2, D=3, F=4, W=5, E=6(extra life)
    this.abilityKeys = {
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      f: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };

    // Touch jump
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y > height * 0.7 && !this.currentProblem) {
        this.playerJump();
      }
    });

    // Campaign progress UI
    if (this.campaignMode && this.campaignLevel) {
      const cl = this.campaignLevel;
      this.campaignText = this.add.text(width / 2, 55, `${cl.name} - 0/${cl.questionsToProgress}`, {
        fontSize: '12px',
        fontFamily: 'Courier New, monospace',
        color: '#aaaaaa',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5, 0).setScrollFactor(0);
    }

    // Spawner
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
    this.time.delayedCall(800, () => this.spawnEnemy());
  }

  createUI() {
    const { width } = this.cameras.main;

    // Hearts
    this.heartIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(30 + i * 28, 25, 'heart').setScale(1.2);
      heart.setScrollFactor(0);
      this.heartIcons.push(heart);
    }

    // Score
    this.scoreText = this.add.text(width - 20, 10, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0);

    // Level
    this.levelText = this.add.text(width - 20, 35, 'Level: 1', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(1, 0).setScrollFactor(0);

    // Mana orbs
    this.manaOrbs = [];
    const manaStartX = width / 2 - (this.maxMana * 20) / 2 + 10;
    const orbColor = this.character.manaHex;

    this.add.text(width / 2, 6, this.character.name + ' Mana', {
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0);

    for (let i = 0; i < this.maxMana; i++) {
      const ox = manaStartX + i * 20;
      const orbBg = this.add.circle(ox, 32, 8, 0x333333).setScrollFactor(0);
      orbBg.setStrokeStyle(1, 0x666666);
      const orbFill = this.add.circle(ox, 32, 7, orbColor).setScrollFactor(0);
      orbFill.setAlpha(0.15);
      this.manaOrbs.push({ bg: orbBg, fill: orbFill });
    }

    // Ability key hints at bottom of screen
    this.abilityHints = this.add.container(width / 2, this.cameras.main.height - 18).setScrollFactor(0).setDepth(100);
    const abilities = this.character.abilities;
    const hintTexts = [];
    for (let i = 0; i < abilities.length; i++) {
      const hx = (i - 2) * 130;
      const ht = this.add.text(hx, 0, `[${abilities[i].key}] ${abilities[i].name}`, {
        fontSize: '9px',
        fontFamily: 'Courier New, monospace',
        color: '#555555',
        stroke: '#000',
        strokeThickness: 1
      }).setOrigin(0.5);
      hintTexts.push(ht);
    }
    const extraHint = this.add.text(3 * 130, 0, '[E] Extra Life', {
      fontSize: '9px',
      fontFamily: 'Courier New, monospace',
      color: '#553333',
      stroke: '#000',
      strokeThickness: 1
    }).setOrigin(0.5);
    hintTexts.push(extraHint);
    this.abilityHints.add(hintTexts);

    // Problem display
    this.problemContainer = this.add.container(width / 2, 100).setScrollFactor(0).setDepth(600);
    this.problemContainer.setVisible(false);

    const problemBg = this.add.graphics();
    problemBg.fillStyle(0x000000, 0.85);
    problemBg.fillRoundedRect(-200, -35, 400, 70, 10);
    problemBg.lineStyle(2, this.character.manaHex);
    problemBg.strokeRoundedRect(-200, -35, 400, 70, 10);

    this.problemText = this.add.text(0, -15, '', {
      fontSize: '28px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.inputDisplay = this.add.text(0, 15, '> _', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.problemContainer.add([problemBg, this.problemText, this.inputDisplay]);
  }

  updateManaDisplay() {
    for (let i = 0; i < this.maxMana; i++) {
      this.manaOrbs[i].fill.setAlpha(i < this.mana ? 1 : 0.15);
    }
  }

  gainMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
    this.updateManaDisplay();
  }

  useAbility(cost) {
    if (this.mana < cost) return;

    this.mana -= cost;
    this.updateManaDisplay();

    // Placeholder: fire a projectile at the nearest enemy
    const enemies = this.enemies.getChildren().filter(e => e.active);
    if (enemies.length === 0) return;

    const nearest = enemies.reduce((a, b) =>
      Math.abs(a.x - this.player.x) < Math.abs(b.x - this.player.x) ? a : b
    );

    const ability = this.character.abilities[cost - 1];
    window.gameAudio.spellSound();

    // Visual: fire colored projectile
    const proj = this.add.circle(this.player.x + 30, this.player.y - 20, 6 + cost * 2, this.character.manaHex);
    this.tweens.add({
      targets: proj,
      x: nearest.x,
      y: nearest.y,
      duration: 250,
      ease: 'Power2',
      onComplete: () => {
        proj.destroy();
        if (nearest.active) {
          // If enemy had a problem showing, clear it
          if (this.currentProblem && this.currentProblem.enemy === nearest) {
            this.problemContainer.setVisible(false);
            if (this.cursorBlink) this.cursorBlink.remove();
            this.currentProblem = null;
            this.answerText = '';
          }
          this.destroyEnemy(nearest);
          this.score += 5 * cost;
          this.scoreText.setText(`Score: ${this.score}`);
          this.killCount++;
          if (this.killCount >= this.killsToLevel) {
            this.levelUp();
          }
        }
      }
    });

    // Show ability name
    const abilityText = this.add.text(this.player.x, this.player.y - 60, ability.name, {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#' + this.character.manaHex.toString(16).padStart(6, '0'),
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: abilityText,
      y: abilityText.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => abilityText.destroy()
    });
  }

  useExtraLife() {
    if (this.mana < this.maxMana) return;

    this.mana = 0;
    this.updateManaDisplay();

    if (this.lives < 3) {
      this.lives++;
      this.heartIcons[this.lives - 1].setAlpha(1).setScale(1.2);
    }

    window.gameAudio.levelUpSound();
    this.cameras.main.flash(300, 255, 255, 0, false, null, this);

    const text = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'EXTRA LIFE!', {
      fontSize: '32px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0);
    this.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }

  spawnEnemy() {
    if (!this.gameActive || this.paused) return;

    const { width } = this.cameras.main;
    const enemyType = Phaser.Math.Between(0, Math.min(2, Math.floor(this.level / 2)));
    const texKey = `enemy_${enemyType}`;

    let enemy;
    const ey = this.groundY - 40;

    if (this.textures.exists(texKey)) {
      enemy = this.add.sprite(width + 40, ey, texKey);
    } else {
      const colors = this.theme === 'mtg' ? [0x44aa44, 0x8b4513, 0xcc2222] : [0xff0000, 0x333366, 0xff6600];
      enemy = this.add.rectangle(width + 40, ey, 36, 40, colors[enemyType]);
    }

    this.physics.add.existing(enemy);
    enemy.body.setAllowGravity(false);
    enemy.body.setVelocityX(-this.enemySpeed);
    enemy.enemyType = enemyType;
    enemy.triggered = false;
    this.enemies.add(enemy);

    window.gameAudio.enemySpawnSound();

    this.tweens.add({
      targets: enemy,
      y: enemy.y - 5,
      duration: 600 + enemyType * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  playerJump() {
    if (this.player.body.touching.down || this.player.body.blocked.down) {
      this.player.setVelocityY(-400);
      window.gameAudio.jumpSound();
    }
  }

  triggerProblem(enemy) {
    if (this.currentProblem || this.collisionPaused) return;
    enemy.triggered = true;
    this.showProblem(enemy);
  }

  showBang(x, y, onComplete) {
    this.bangContainer.removeAll(true);
    this.bangContainer.setPosition(x, y);
    this.bangContainer.setVisible(true);
    this.bangContainer.setAlpha(1);
    this.bangContainer.setScale(0.3);

    const burst = this.add.graphics();
    const burstColor = this.character.manaHex;
    burst.fillStyle(burstColor, 1);
    const points = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = i % 2 === 0 ? 70 : 40;
      points.push(Math.cos(angle) * r);
      points.push(Math.sin(angle) * r);
    }
    burst.beginPath();
    burst.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      burst.lineTo(points[i], points[i + 1]);
    }
    burst.closePath();
    burst.fillPath();

    const inner = this.add.graphics();
    inner.fillStyle(0xffffff, 0.8);
    const innerPoints = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = i % 2 === 0 ? 45 : 25;
      innerPoints.push(Math.cos(angle) * r);
      innerPoints.push(Math.sin(angle) * r);
    }
    inner.beginPath();
    inner.moveTo(innerPoints[0], innerPoints[1]);
    for (let i = 2; i < innerPoints.length; i += 2) {
      inner.lineTo(innerPoints[i], innerPoints[i + 1]);
    }
    inner.closePath();
    inner.fillPath();

    const bangText = this.add.text(0, 0, 'BANG!', {
      fontSize: '36px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.bangContainer.add([burst, inner, bangText]);
    this.cameras.main.shake(200, 0.015);

    window.gameAudio.playTone(150, 0.2, 'sawtooth', 0.3);
    setTimeout(() => window.gameAudio.playTone(100, 0.15, 'square', 0.25), 80);

    this.tweens.add({
      targets: this.bangContainer,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(500, () => {
          this.tweens.add({
            targets: this.bangContainer,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            onComplete: () => {
              this.bangContainer.setVisible(false);
              if (onComplete) onComplete();
            }
          });
        });
      }
    });
  }

  showProblem(enemy) {
    if (this.currentProblem) return;

    const problem = MathGenerator.generate(this.level, this.mathType);
    this.currentProblem = { ...problem, enemy };
    this.answerText = '';

    this.problemText.setText(problem.question + ' = ?');
    this.inputDisplay.setText('> _');
    this.problemContainer.setVisible(true);

    if (this.cursorBlink) this.cursorBlink.remove();
    this.cursorBlink = this.time.addEvent({
      delay: 500,
      callback: () => {
        const current = this.inputDisplay.text;
        if (current.endsWith('_')) {
          this.inputDisplay.setText(current.slice(0, -1) + ' ');
        } else {
          this.inputDisplay.setText(current.slice(0, -1) + '_');
        }
      },
      loop: true
    });
  }

  checkAnswer(answer) {
    if (!this.currentProblem) return;

    const correct = answer === this.currentProblem.answer;
    const enemy = this.currentProblem.enemy;

    this.problemContainer.setVisible(false);
    if (this.cursorBlink) this.cursorBlink.remove();
    this.currentProblem = null;
    this.answerText = '';

    if (correct) {
      this.onCorrectAnswer(enemy);
    } else {
      this.onWrongAnswer(enemy);
    }
  }

  onCorrectAnswer(enemy) {
    if (this.theme === 'mtg') {
      window.gameAudio.spellSound();
    } else {
      window.gameAudio.styleSound();
    }
    window.gameAudio.correctSound();

    const proj = this.add.sprite(this.player.x + 30, this.player.y, 'projectile');
    this.projectiles.add(proj);

    this.tweens.add({
      targets: proj,
      x: enemy.x,
      y: enemy.y,
      angle: 720,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        proj.destroy();
        this.destroyEnemy(enemy);
      }
    });

    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);

    // Gain 1 mana per kill
    this.gainMana(1);

    this.cameras.main.flash(200, 0, 255, 0, false, null, this);

    // Campaign: track kills toward boss, or damage boss
    if (this.campaignMode) {
      if (this.bossActive && enemy.isBoss) {
        this.bossHP--;
        this.updateBossHP();
        if (this.bossHP <= 0) {
          // Let the projectile explosion finish, then transition
          this.time.delayedCall(500, () => this.campaignVictory());
          return;
        }
        // Boss keeps coming — respawn it
        this.time.delayedCall(800, () => this.spawnBoss());
        return;
      }
      this.campaignKills++;
      if (this.campaignText) {
        const cl = this.campaignLevel;
        if (this.campaignKills >= cl.questionsToProgress) {
          this.campaignText.setText(`BOSS INCOMING!`).setColor('#ff4444');
        } else {
          this.campaignText.setText(`${cl.name} - ${this.campaignKills}/${cl.questionsToProgress}`);
        }
      }
      if (!this.bossActive && this.campaignKills >= this.campaignLevel.questionsToProgress) {
        this.startBossFight();
        return;
      }
    }

    this.killCount++;
    if (this.killCount >= this.killsToLevel) {
      this.levelUp();
    }

    const floatText = this.add.text(enemy.x, enemy.y - 30, `+${10 * this.level}`, {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: floatText,
      y: floatText.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => floatText.destroy()
    });
  }

  destroyEnemy(enemy) {
    if (!enemy || !enemy.active) return;

    const colors = this.theme === 'mtg'
      ? [0xff6600, 0xffaa00, 0xff0000, 0xffd700]
      : [0xff69b4, 0xff1493, 0xffffff, 0xffd700];

    for (let i = 0; i < 15; i++) {
      const px = this.add.rectangle(
        enemy.x + Phaser.Math.Between(-10, 10),
        enemy.y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(3, 8),
        Phaser.Math.RND.pick(colors)
      );
      this.tweens.add({
        targets: px,
        x: px.x + Phaser.Math.Between(-80, 80),
        y: px.y + Phaser.Math.Between(-80, 40),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(300, 700),
        ease: 'Power2',
        onComplete: () => px.destroy()
      });
    }

    this.cameras.main.shake(150, 0.01);
    enemy.destroy();
  }

  onWrongAnswer(enemy) {
    window.gameAudio.wrongSound();
    this.cameras.main.flash(300, 255, 0, 0, false, null, this);

    const correctText = this.add.text(this.cameras.main.width / 2, 140,
      `Answer: ${this.currentProblem ? this.currentProblem.answer : ''}`, {
      fontSize: '22px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    this.tweens.add({
      targets: correctText,
      alpha: 0,
      y: correctText.y - 40,
      duration: 1500,
      onComplete: () => correctText.destroy()
    });

    const isBoss = enemy.isBoss;
    const bangX = enemy.active ? (this.player.x + enemy.x) / 2 : this.player.x;
    const bangY = enemy.active ? enemy.y - 20 : this.player.y - 40;

    if (enemy.active) enemy.destroy();
    this.collisionPaused = true;

    this.showBang(bangX, bangY, () => {
      this.takeDamage();
      this.collisionPaused = false;
      // Boss respawns after wrong answer
      if (isBoss && this.bossActive && this.gameActive) {
        this.time.delayedCall(600, () => this.spawnBoss());
      }
    });
  }

  takeDamage() {
    if (this.playerInvulnerable) return;

    this.lives--;
    window.gameAudio.hurtSound();

    if (this.lives >= 0 && this.heartIcons[this.lives]) {
      this.tweens.add({
        targets: this.heartIcons[this.lives],
        alpha: 0.2,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300
      });
    }

    this.playerInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.player.setAlpha(1);
        this.playerInvulnerable = false;
      }
    });

    this.cameras.main.shake(300, 0.02);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  levelUp() {
    this.level++;
    this.killCount = 0;
    this.killsToLevel = 5 + this.level;
    this.enemySpeed = Math.min(this.baseEnemySpeed * 2.5, this.baseEnemySpeed + this.level * 10);
    this.spawnDelay = Math.max(this.baseSpawnDelay * 0.4, this.baseSpawnDelay - this.level * 200);

    this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    this.levelText.setText(`Level: ${this.level}`);
    window.gameAudio.levelUpSound();

    const banner = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `LEVEL ${this.level}!`, {
      fontSize: '40px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 5,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
    }).setOrigin(0.5).setScrollFactor(0);

    const sublabel = this.theme === 'mtg' ? 'Power grows!' : 'Fabulous!';
    const sub = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 40, sublabel, {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    this.tweens.add({
      targets: [banner, sub],
      alpha: 0,
      y: '-=50',
      duration: 2000,
      delay: 500,
      onComplete: () => { banner.destroy(); sub.destroy(); }
    });

    for (let i = 0; i < 20; i++) {
      const px = this.add.rectangle(
        this.cameras.main.width / 2 + Phaser.Math.Between(-200, 200),
        this.cameras.main.height / 2,
        6, 6,
        Phaser.Math.RND.pick([0xffd700, 0xff6600, 0x00ff00, 0xff00ff, 0x00ccff])
      ).setScrollFactor(0);
      this.tweens.add({
        targets: px,
        y: px.y + Phaser.Math.Between(-150, 150),
        x: px.x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: Phaser.Math.Between(800, 1500),
        onComplete: () => px.destroy()
      });
    }
  }

  gameOver() {
    this.gameActive = false;
    window.gameAudio.gameOverSound();

    if (this.spawnTimer) this.spawnTimer.remove();
    this.enemies.clear(true, true);

    const highScore = parseInt(localStorage.getItem('mathblaster_highscore') || '0');
    if (this.score > highScore) {
      localStorage.setItem('mathblaster_highscore', this.score.toString());
    }

    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        level: this.level,
        theme: this.theme,
        isHighScore: this.score > highScore
      });
    });
  }

  togglePause() {
    if (!this.gameActive) return;

    this.paused = !this.paused;

    if (this.paused) {
      this.physics.pause();
      this.tweens.pauseAll();
      if (this.spawnTimer) this.spawnTimer.paused = true;

      const { width, height } = this.cameras.main;
      this.pauseOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);

      const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      const pauseTitle = this.add.text(width / 2, height / 2 - 80, 'PAUSED', {
        fontSize: '40px', fontFamily: 'Courier New, monospace', color: '#ffd700', stroke: '#000', strokeThickness: 5
      }).setOrigin(0.5);
      const resumeText = this.add.text(width / 2, height / 2, 'RESUME (ESC)', {
        fontSize: '22px', fontFamily: 'Courier New, monospace', color: '#ffffff', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      const resumeZone = this.add.zone(width / 2, height / 2, 300, 40).setInteractive({ useHandCursor: true });
      resumeZone.on('pointerdown', () => this.togglePause());
      const menuText = this.add.text(width / 2, height / 2 + 50, 'MAIN MENU', {
        fontSize: '22px', fontFamily: 'Courier New, monospace', color: '#ffffff', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      const menuZone = this.add.zone(width / 2, height / 2 + 50, 300, 40).setInteractive({ useHandCursor: true });
      menuZone.on('pointerdown', () => {
        window.gameAudio.selectSound();
        this.scene.start('MenuScene');
      });

      this.pauseOverlay.add([dimBg, pauseTitle, resumeText, resumeZone, menuText, menuZone]);
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      if (this.spawnTimer) this.spawnTimer.paused = false;
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = null;
      }
    }
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
      return;
    }

    if (!this.gameActive || this.paused) return;

    this.groundTiles.tilePositionX += 2;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.playerJump();
    }

    // Ability keys (only when NOT typing an answer)
    if (!this.currentProblem) {
      if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.a)) this.useAbility(1);
      if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.s)) this.useAbility(2);
      if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.d)) this.useAbility(3);
      if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.f)) this.useAbility(4);
      if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.w)) this.useAbility(5);
      if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.e)) this.useExtraLife();
    }

    // Number key input for typed answers
    if (this.currentProblem) {
      for (let i = 0; i <= 9; i++) {
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys[i]) ||
            Phaser.Input.Keyboard.JustDown(this.numberKeys['num' + i])) {
          this.answerText += i.toString();
          this.inputDisplay.setText(`> ${this.answerText}_`);
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.minusKey) && this.answerText === '') {
        this.answerText = '-';
        this.inputDisplay.setText(`> ${this.answerText}_`);
      }
      if (Phaser.Input.Keyboard.JustDown(this.backspaceKey) && this.answerText.length > 0) {
        this.answerText = this.answerText.slice(0, -1);
        this.inputDisplay.setText(`> ${this.answerText || ''}_`);
      }
      if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.answerText.length > 0) {
        this.checkAnswer(parseInt(this.answerText));
      }
    }

    // Enemy proximity checks
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;

      if (!enemy.triggered) {
        const dist = Math.abs(enemy.x - this.player.x);
        if (dist < 200 && !this.currentProblem && !this.collisionPaused) {
          this.triggerProblem(enemy);
        }
        return;
      }

      if (enemy.triggered && enemy.body && !this.collisionPaused) {
        if (enemy.x <= this.player.x + 20) {
          const isBoss = enemy.isBoss;
          this.problemContainer.setVisible(false);
          if (this.cursorBlink) this.cursorBlink.remove();
          this.currentProblem = null;
          this.answerText = '';
          this.collisionPaused = true;

          window.gameAudio.wrongSound();
          this.cameras.main.flash(300, 255, 0, 0, false, null, this);

          const bangX = (this.player.x + enemy.x) / 2;
          const bangY = enemy.y - 20;
          enemy.destroy();

          this.showBang(bangX, bangY, () => {
            this.takeDamage();
            this.collisionPaused = false;
            if (isBoss && this.bossActive && this.gameActive) {
              this.time.delayedCall(600, () => this.spawnBoss());
            }
          });
        }
      }
    });

    this.projectiles.getChildren().forEach(proj => {
      if (proj.x > this.cameras.main.width + 50) proj.destroy();
    });
  }

  // === Campaign Methods ===

  generateCampaignBackground(colors) {
    const g = this.make.graphics({ add: false });
    const w = 800, h = 600;
    g.fillGradientStyle(colors.sky1, colors.sky1, colors.sky2, colors.sky2);
    g.fillRect(0, 0, w, h);
    // Atmospheric details
    g.fillStyle(colors.accent, 0.15);
    for (let i = 0; i < 30; i++) {
      const sx = Phaser.Math.Between(0, w);
      const sy = Phaser.Math.Between(0, h * 0.7);
      g.fillRect(sx, sy, Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 3));
    }
    g.generateTexture('background', w, h);
    g.destroy();
  }

  generateCampaignGround(colors) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(colors.ground1);
    g.fillRect(0, 0, 64, 32);
    g.fillStyle(colors.ground2);
    for (let i = 0; i < 8; i++) {
      g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(0, 28), 8, 4);
    }
    g.fillStyle(colors.accent, 0.3);
    g.fillRect(0, 0, 64, 2);
    g.generateTexture('ground', 64, 32);
    g.destroy();
  }

  generateCampaignEnemies(enemyDefs) {
    enemyDefs.forEach((def, idx) => {
      const g = this.make.graphics({ add: false });
      const s = 4;
      const oy = 2 * s;
      const c = def.color;
      const lighter = Phaser.Display.Color.IntegerToColor(c);
      const darkC = Phaser.Display.Color.GetColor(
        Math.max(0, lighter.red - 40),
        Math.max(0, lighter.green - 40),
        Math.max(0, lighter.blue - 40)
      );

      // Body
      g.fillStyle(c);
      g.fillRect(2*s, oy + 1*s, 4*s, 6*s);
      // Head
      g.fillStyle(darkC);
      g.fillRect(2.5*s, oy + 0*s, 3*s, 2*s);
      // Eyes
      g.fillStyle(0xff0000);
      g.fillRect(3*s, oy + 0.5*s, 0.8*s, 0.8*s);
      g.fillRect(5*s, oy + 0.5*s, 0.8*s, 0.8*s);
      // Legs
      g.fillStyle(darkC);
      g.fillRect(2*s, oy + 7*s, 1.5*s, 2*s);
      g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2*s);
      // Detail based on index
      if (idx === 1) {
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(3*s, oy + 3*s, 2*s, 1*s);
      } else if (idx === 2) {
        g.fillStyle(c);
        g.fillRect(1*s, oy + 2*s, 1*s, 3*s);
        g.fillRect(6*s, oy + 2*s, 1*s, 3*s);
      }

      g.generateTexture(`enemy_${idx}`, 8*s, oy + 10*s);
      g.destroy();
    });
  }

  startBossFight() {
    this.bossActive = true;
    const boss = this.campaignLevel.boss;
    this.bossHP = boss.questions;
    this.bossMaxHP = boss.questions;

    // Stop regular spawning
    if (this.spawnTimer) this.spawnTimer.remove();

    // Clear remaining enemies
    this.enemies.getChildren().forEach(e => { if (e.active) e.destroy(); });

    // Boss announcement
    const { width, height } = this.cameras.main;
    const announce = this.add.text(width / 2, height / 2, `BOSS: ${boss.name}`, {
      fontSize: '28px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(700);

    this.cameras.main.shake(400, 0.02);
    window.gameAudio.playTone(80, 0.4, 'sawtooth', 0.3);

    this.tweens.add({
      targets: announce,
      alpha: 0, y: announce.y - 50,
      duration: 2000, delay: 1000,
      onComplete: () => {
        announce.destroy();
        this.spawnBoss();
      }
    });

    // Boss HP bar
    this.bossHPBg = this.add.rectangle(width / 2, 70, 300, 16, 0x333333).setScrollFactor(0).setDepth(600);
    this.bossHPBg.setStrokeStyle(2, 0xff4444);
    this.bossHPFill = this.add.rectangle(width / 2 - 148, 70, 296, 12, 0xff4444).setScrollFactor(0).setDepth(600);
    this.bossHPFill.setOrigin(0, 0.5);
    this.bossHPText = this.add.text(width / 2, 70, `${boss.name}`, {
      fontSize: '10px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
  }

  spawnBoss() {
    if (!this.gameActive || !this.bossActive) return;

    const boss = this.campaignLevel.boss;
    const { width } = this.cameras.main;
    const ey = this.groundY - 50;

    // Create boss sprite (larger, colored)
    const g = this.make.graphics({ add: false });
    const s = 4;
    const oy = 2 * s;
    g.fillStyle(boss.color);
    g.fillRect(1*s, oy + 0*s, 6*s, 3*s); // head
    g.fillStyle(0xff0000);
    g.fillRect(2*s, oy + 1*s, 1.5*s, 1*s); // eye
    g.fillRect(5*s, oy + 1*s, 1.5*s, 1*s); // eye
    g.fillStyle(boss.color);
    g.fillRect(0*s, oy + 3*s, 8*s, 7*s); // body
    g.fillStyle(Phaser.Display.Color.GetColor(
      Math.max(0, ((boss.color >> 16) & 0xff) - 30),
      Math.max(0, ((boss.color >> 8) & 0xff) - 30),
      Math.max(0, (boss.color & 0xff) - 30)
    ));
    g.fillRect(0*s, oy + 10*s, 3*s, 3*s); // legs
    g.fillRect(5*s, oy + 10*s, 3*s, 3*s);
    // Crown/horns
    g.fillStyle(0xffd700);
    g.fillRect(2*s, oy - 1*s, 1*s, 1.5*s);
    g.fillRect(5*s, oy - 1*s, 1*s, 1.5*s);
    g.generateTexture('boss_sprite', 8*s, oy + 13*s);
    g.destroy();

    const bossSprite = this.add.sprite(width + 60, ey, 'boss_sprite');
    bossSprite.setScale(boss.size);
    this.physics.add.existing(bossSprite);
    bossSprite.body.setAllowGravity(false);
    bossSprite.body.setVelocityX(-this.enemySpeed * 0.7);
    bossSprite.triggered = false;
    bossSprite.isBoss = true;
    this.bossEnemy = bossSprite;
    this.enemies.add(bossSprite);

    // Menacing bob
    this.tweens.add({
      targets: bossSprite,
      y: bossSprite.y - 8,
      duration: 800, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  updateBossHP() {
    if (!this.bossHPFill) return;
    const ratio = Math.max(0, this.bossHP / this.bossMaxHP);
    this.bossHPFill.width = 296 * ratio;
  }

  campaignVictory() {
    this.gameActive = false;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.enemies.clear(true, true);

    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start('VictoryScene', {
        theme: this.theme,
        character: this.character,
        mathType: this.mathType,
        speed: this.speed || this.speedSetting,
        levelIndex: this.levelIndex,
        score: this.score,
        bossName: this.campaignLevel.boss.name
      });
    });
  }
}

window.GameScene = GameScene;
