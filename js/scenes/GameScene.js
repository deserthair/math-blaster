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
    const style = this.campaignLevel.bgStyle;

    // Sky gradient
    g.fillGradientStyle(colors.sky1, colors.sky1, colors.sky2, colors.sky2);
    g.fillRect(0, 0, w, h);

    if (style === 'forest') {
      // Dense trees in background
      for (let i = 0; i < 12; i++) {
        const tx = Phaser.Math.Between(0, w);
        const th = Phaser.Math.Between(120, 250);
        const tw = Phaser.Math.Between(30, 50);
        // Trunk
        g.fillStyle(0x3a2510);
        g.fillRect(tx, h - th - 80, 12, th);
        // Canopy layers
        g.fillStyle(0x1a5a1a, 0.8);
        g.fillCircle(tx + 6, h - th - 80, tw);
        g.fillStyle(0x2a7a2a, 0.6);
        g.fillCircle(tx + 6, h - th - 60, tw - 8);
      }
      // Glowing mushrooms
      g.fillStyle(0x44ff44, 0.4);
      for (let i = 0; i < 15; i++) {
        const mx = Phaser.Math.Between(0, w);
        const my = Phaser.Math.Between(h * 0.6, h * 0.8);
        g.fillCircle(mx, my, Phaser.Math.Between(3, 8));
      }
      // Fireflies
      g.fillStyle(0xaaff44, 0.6);
      for (let i = 0; i < 20; i++) {
        g.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.7), 2, 2);
      }

    } else if (style === 'ocean') {
      // Waves in background
      for (let row = 0; row < 6; row++) {
        const wy = 200 + row * 60;
        g.fillStyle(colors.sky2, 0.3 + row * 0.08);
        for (let wx = 0; wx < w; wx += 40) {
          g.fillRect(wx, wy + Math.sin(wx * 0.05) * 10, 30, 8);
        }
      }
      // Distant ship
      g.fillStyle(0x5a3a1a);
      g.fillRect(600, 150, 40, 20);
      g.fillRect(615, 120, 4, 30);
      g.fillStyle(0xeeeeee);
      g.fillRect(619, 125, 15, 10);
      // Storm clouds
      g.fillStyle(0x2a3a4a, 0.5);
      g.fillCircle(150, 60, 80);
      g.fillCircle(250, 50, 60);
      g.fillCircle(500, 70, 70);
      // Lightning flash
      g.fillStyle(0xffff88, 0.15);
      g.fillRect(180, 100, 2, 80);
      g.fillRect(182, 140, 2, 60);

    } else if (style === 'cave') {
      // Stalactites from ceiling
      for (let i = 0; i < 20; i++) {
        const sx = Phaser.Math.Between(0, w);
        const sl = Phaser.Math.Between(30, 100);
        g.fillStyle(0x3a2a1a);
        g.fillRect(sx, 0, 8, sl);
        g.fillRect(sx + 2, sl, 4, 10);
      }
      // Lava pools glowing
      g.fillStyle(0xff4400, 0.3);
      for (let i = 0; i < 8; i++) {
        const lx = Phaser.Math.Between(0, w);
        const ly = Phaser.Math.Between(h * 0.7, h * 0.85);
        g.fillCircle(lx, ly, Phaser.Math.Between(15, 40));
      }
      g.fillStyle(0xff6600, 0.15);
      for (let i = 0; i < 12; i++) {
        g.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(h * 0.6, h * 0.9), Phaser.Math.Between(5, 20));
      }
      // Glowing crystals
      g.fillStyle(0x8866cc, 0.5);
      for (let i = 0; i < 10; i++) {
        const cx = Phaser.Math.Between(0, w);
        const cy = Phaser.Math.Between(100, h * 0.7);
        g.fillRect(cx, cy, 4, Phaser.Math.Between(10, 25));
        g.fillRect(cx - 3, cy + 5, 3, Phaser.Math.Between(8, 18));
      }

    } else if (style === 'castle') {
      // Castle walls in background
      g.fillStyle(0x444455);
      g.fillRect(0, 200, w, 400);
      // Stone pattern
      g.fillStyle(0x555566);
      for (let row = 0; row < 10; row++) {
        const offset = row % 2 === 0 ? 0 : 30;
        for (let col = 0; col < 15; col++) {
          g.fillRect(offset + col * 60, 200 + row * 40, 58, 38);
        }
      }
      // Towers
      g.fillStyle(0x333344);
      g.fillRect(50, 80, 60, 300);
      g.fillRect(690, 100, 60, 280);
      // Battlements
      for (let i = 0; i < 4; i++) {
        g.fillRect(50 + i * 20, 65, 12, 20);
        g.fillRect(690 + i * 20, 85, 12, 20);
      }
      // Purple magic aura
      g.fillStyle(0x8844cc, 0.1);
      g.fillCircle(400, 200, 200);
      // Torches
      g.fillStyle(0xff8800, 0.6);
      g.fillCircle(200, 300, 10);
      g.fillCircle(400, 280, 10);
      g.fillCircle(600, 310, 10);

    } else if (style === 'void') {
      // Alien geometry / Eldrazi dimension
      // Swirling void patterns
      g.fillStyle(0x6633aa, 0.2);
      for (let i = 0; i < 8; i++) {
        const cx = Phaser.Math.Between(100, w - 100);
        const cy = Phaser.Math.Between(100, h - 100);
        for (let r = 80; r > 10; r -= 15) {
          g.fillCircle(cx + Math.sin(r) * 20, cy + Math.cos(r) * 20, r);
        }
      }
      // Floating geometric shards
      g.fillStyle(0xcc44ff, 0.3);
      for (let i = 0; i < 15; i++) {
        const sx = Phaser.Math.Between(0, w);
        const sy = Phaser.Math.Between(0, h);
        g.fillRect(sx, sy, Phaser.Math.Between(5, 30), Phaser.Math.Between(2, 8));
        g.fillRect(sx + 5, sy - 10, Phaser.Math.Between(2, 8), Phaser.Math.Between(10, 30));
      }
      // Stars being consumed
      g.fillStyle(0xffffff, 0.5);
      for (let i = 0; i < 20; i++) {
        g.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.5), 2, 2);
      }
      // Cracks in reality
      g.fillStyle(0xff44ff, 0.25);
      for (let i = 0; i < 5; i++) {
        let cx = Phaser.Math.Between(0, w);
        let cy = Phaser.Math.Between(0, h);
        for (let j = 0; j < 8; j++) {
          g.fillRect(cx, cy, 3, 3);
          cx += Phaser.Math.Between(-15, 15);
          cy += Phaser.Math.Between(-15, 15);
        }
      }

    } else if (style === 'streets') {
      // NYC buildings in background
      const buildingColors = [0x556677, 0x445566, 0x667788, 0x778899];
      for (let i = 0; i < 10; i++) {
        const bx = i * 85;
        const bh = Phaser.Math.Between(200, 400);
        g.fillStyle(Phaser.Math.RND.pick(buildingColors));
        g.fillRect(bx, h - bh - 80, 75, bh);
        // Windows
        g.fillStyle(0xffff88, 0.6);
        for (let wy = h - bh - 60; wy < h - 100; wy += 25) {
          for (let wx = bx + 8; wx < bx + 70; wx += 18) {
            if (Math.random() > 0.3) {
              g.fillRect(wx, wy, 10, 14);
            }
          }
        }
      }
      // Sky with clouds
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(200, 80, 40);
      g.fillCircle(240, 75, 35);
      g.fillCircle(550, 90, 45);
      g.fillCircle(590, 85, 30);
      // Sun
      g.fillStyle(0xffdd44, 0.5);
      g.fillCircle(700, 60, 35);

    } else if (style === 'boutique') {
      // Shop fronts
      for (let i = 0; i < 4; i++) {
        const sx = i * 210;
        g.fillStyle(0xeeddcc);
        g.fillRect(sx, 150, 200, 350);
        // Shop window
        g.fillStyle(0xccddee);
        g.fillRect(sx + 15, 200, 170, 150);
        // Awning
        g.fillStyle(Phaser.Math.RND.pick([0xff69b4, 0xff99cc, 0xcc66aa, 0xffaacc]));
        g.fillRect(sx, 170, 200, 25);
        // Mannequin silhouettes in window
        g.fillStyle(0x000000, 0.15);
        g.fillRect(sx + 50, 230, 15, 40);
        g.fillCircle(sx + 57, 225, 8);
        g.fillRect(sx + 120, 230, 15, 40);
        g.fillCircle(sx + 127, 225, 8);
      }
      // Sparkles
      g.fillStyle(0xffd700, 0.4);
      for (let i = 0; i < 20; i++) {
        g.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.4), 3, 3);
      }

    } else if (style === 'subway') {
      // Tunnel walls
      g.fillStyle(0x3a3a3a);
      g.fillRect(0, 0, w, 150);
      g.fillRect(0, h - 150, w, 150);
      // Tiles
      g.fillStyle(0x4a4a4a);
      for (let i = 0; i < w; i += 30) {
        g.fillRect(i, 0, 28, 148);
        g.fillRect(i, h - 148, 28, 148);
      }
      // Subway signs
      g.fillStyle(0x00aa00);
      g.fillCircle(200, 100, 20);
      g.fillStyle(0xffffff);
      g.fillCircle(200, 100, 15);
      g.fillStyle(0x00aa00);
      g.fillRect(188, 96, 24, 8);
      // Tracks / rails
      g.fillStyle(0x888888);
      g.fillRect(0, h - 90, w, 3);
      g.fillRect(0, h - 70, w, 3);
      // Dim lighting
      g.fillStyle(0xffaa00, 0.08);
      for (let i = 0; i < w; i += 200) {
        g.fillCircle(i + 100, 120, 80);
      }

    } else if (style === 'backstage') {
      // Curtains on sides
      g.fillStyle(0x880033);
      g.fillRect(0, 0, 80, h);
      g.fillRect(w - 80, 0, 80, h);
      // Curtain folds
      g.fillStyle(0x660022);
      for (let y = 0; y < h; y += 40) {
        g.fillRect(0, y, 15, 38);
        g.fillRect(30, y, 15, 38);
        g.fillRect(w - 80, y, 15, 38);
        g.fillRect(w - 50, y, 15, 38);
      }
      // Mirrors with lights
      for (let i = 0; i < 3; i++) {
        const mx = 200 + i * 200;
        g.fillStyle(0xaaaaaa);
        g.fillRect(mx, 100, 80, 120);
        g.fillStyle(0xccddee);
        g.fillRect(mx + 5, 105, 70, 110);
        // Bulbs around mirror
        g.fillStyle(0xffffcc);
        for (let b = 0; b < 6; b++) {
          g.fillCircle(mx + b * 16, 98, 5);
          g.fillCircle(mx + b * 16, 225, 5);
        }
      }
      // Cables on floor
      g.fillStyle(0x222222);
      for (let i = 0; i < 8; i++) {
        const cy = Phaser.Math.Between(h * 0.6, h * 0.85);
        g.fillRect(Phaser.Math.Between(80, w - 80), cy, Phaser.Math.Between(60, 200), 3);
      }

    } else if (style === 'runway') {
      // Grand venue
      g.fillStyle(0x1a1a2e);
      g.fillRect(0, 0, w, h);
      // Spotlights
      g.fillStyle(0xffffff, 0.08);
      g.fillCircle(200, -50, 250);
      g.fillCircle(400, -50, 300);
      g.fillCircle(600, -50, 250);
      // Audience silhouettes
      g.fillStyle(0x222233);
      for (let i = 0; i < 30; i++) {
        const ax = Phaser.Math.Between(50, w - 50);
        const ay = Phaser.Math.Between(300, 420);
        g.fillCircle(ax, ay, 10);
        g.fillRect(ax - 8, ay + 8, 16, 15);
      }
      // Camera flashes
      g.fillStyle(0xffffff, 0.5);
      for (let i = 0; i < 8; i++) {
        const fx = Phaser.Math.Between(0, w);
        const fy = Phaser.Math.Between(250, 400);
        g.fillRect(fx, fy, 4, 4);
        g.fillStyle(0xffffff, 0.2);
        g.fillRect(fx - 6, fy - 1, 16, 2);
        g.fillRect(fx + 1, fy - 6, 2, 16);
        g.fillStyle(0xffffff, 0.5);
      }
      // Golden trim
      g.fillStyle(0xffd700, 0.3);
      g.fillRect(0, h - 120, w, 3);
    }

    g.generateTexture('background', w, h);
    g.destroy();
  }

  generateCampaignGround(colors) {
    const g = this.make.graphics({ add: false });
    const style = this.campaignLevel.bgStyle;

    if (style === 'forest') {
      g.fillStyle(0x2d5a27);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x3a7a32);
      for (let i = 0; i < 6; i++) g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(0, 8), 8, 4);
      g.fillStyle(0x5a3a1a);
      g.fillRect(0, 12, 64, 20);
      // Roots
      g.fillStyle(0x4a2a10);
      for (let i = 0; i < 4; i++) g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(12, 28), 10, 3);
      // Small mushrooms
      g.fillStyle(0x44ff44, 0.5);
      g.fillRect(20, 8, 4, 4);
      g.fillRect(50, 10, 3, 3);

    } else if (style === 'ocean') {
      // Ship deck
      g.fillStyle(0x7a5a3a);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x8a6a4a);
      for (let i = 0; i < 64; i += 10) g.fillRect(i, 0, 8, 32);
      // Deck planks
      g.fillStyle(0x6a4a2a);
      g.fillRect(0, 15, 64, 2);
      // Nails
      g.fillStyle(0x888888);
      for (let i = 5; i < 64; i += 12) g.fillRect(i, 7, 2, 2);

    } else if (style === 'cave') {
      g.fillStyle(0x3a2a1a);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x4a3a2a);
      for (let i = 0; i < 6; i++) g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(0, 28), 8, 4);
      // Lava cracks
      g.fillStyle(0xff4400, 0.5);
      g.fillRect(15, 5, 12, 2);
      g.fillRect(40, 18, 8, 2);
      g.fillStyle(0xff6600, 0.3);
      g.fillRect(14, 7, 2, 4);
      g.fillRect(42, 20, 2, 3);

    } else if (style === 'castle') {
      // Stone floor
      g.fillStyle(0x444455);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x555566);
      for (let i = 0; i < 64; i += 16) {
        g.fillRect(i, 0, 14, 14);
        g.fillRect(i + 8, 16, 14, 14);
      }
      // Moss
      g.fillStyle(0x336633, 0.4);
      g.fillRect(5, 2, 4, 3);
      g.fillRect(40, 20, 5, 3);

    } else if (style === 'void') {
      g.fillStyle(0x2a1a3a);
      g.fillRect(0, 0, 64, 32);
      // Fractured reality
      g.fillStyle(0x4a2a5a);
      for (let i = 0; i < 64; i += 8) {
        g.fillRect(i, Phaser.Math.Between(0, 10), 6, Phaser.Math.Between(8, 20));
      }
      // Glowing cracks
      g.fillStyle(0xcc44ff, 0.5);
      g.fillRect(10, 12, 20, 2);
      g.fillRect(35, 5, 15, 2);
      g.fillRect(20, 14, 2, 8);

    } else if (style === 'streets') {
      // Concrete sidewalk
      g.fillStyle(0x888888);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x999999);
      for (let i = 0; i < 64; i += 16) g.fillRect(i, 0, 14, 30);
      // Sidewalk cracks
      g.fillStyle(0x666666);
      g.fillRect(15, 0, 2, 32);
      g.fillRect(47, 0, 2, 32);
      // Gum spots
      g.fillStyle(0x555555);
      g.fillRect(8, 12, 3, 3);
      g.fillRect(35, 22, 3, 2);

    } else if (style === 'boutique') {
      // Fancy tile floor
      g.fillStyle(0xddaa88);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0xeecc99);
      for (let i = 0; i < 64; i += 16) {
        for (let j = 0; j < 32; j += 16) {
          if ((i + j) % 32 === 0) g.fillRect(i, j, 14, 14);
        }
      }
      // Pink carpet strip
      g.fillStyle(0xff99bb, 0.5);
      g.fillRect(0, 12, 64, 8);

    } else if (style === 'subway') {
      // Platform
      g.fillStyle(0x555555);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x666666);
      for (let i = 0; i < 64; i += 8) g.fillRect(i, 0, 6, 30);
      // Yellow safety line
      g.fillStyle(0xffcc00);
      g.fillRect(0, 0, 64, 4);
      // Grime
      g.fillStyle(0x444444);
      for (let i = 0; i < 5; i++) g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(8, 28), 4, 3);

    } else if (style === 'backstage') {
      // Stage floor
      g.fillStyle(0x554444);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x665555);
      for (let i = 0; i < 64; i += 12) g.fillRect(i, 0, 10, 30);
      // Cables
      g.fillStyle(0x222222);
      g.fillRect(5, 15, 25, 2);
      g.fillRect(40, 8, 20, 2);
      // Tape marks
      g.fillStyle(0xffff00, 0.4);
      g.fillRect(30, 10, 8, 4);

    } else if (style === 'runway') {
      // Golden runway
      g.fillStyle(0xcc9966);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0xddaa77);
      for (let i = 0; i < 64; i += 16) g.fillRect(i, 0, 14, 30);
      // Center strip
      g.fillStyle(0xffd700, 0.4);
      g.fillRect(24, 0, 16, 32);
      // Sparkle accents
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(10, 8, 2, 2);
      g.fillRect(45, 20, 2, 2);
      g.fillRect(30, 5, 2, 2);

    } else {
      // Fallback
      g.fillStyle(colors.ground1);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(colors.ground2);
      for (let i = 0; i < 8; i++) g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(0, 28), 8, 4);
    }

    g.generateTexture('ground', 64, 32);
    g.destroy();
  }

  generateCampaignEnemies(enemyDefs) {
    const style = this.campaignLevel.bgStyle;

    enemyDefs.forEach((def, idx) => {
      const g = this.make.graphics({ add: false });
      const s = 4;
      const oy = 2 * s;

      // ===== MTG ENEMIES =====
      if (style === 'forest') {
        if (idx === 0) {
          // Mirkwood Bat - dark wings spread
          g.fillStyle(0x443355);
          g.fillRect(3*s, oy + 1*s, 2*s, 2*s); // body
          g.fillStyle(0x332244);
          g.fillRect(0*s, oy + 0*s, 3*s, 3*s); // left wing
          g.fillRect(5*s, oy + 0*s, 3*s, 3*s); // right wing
          g.fillStyle(0xff0000);
          g.fillRect(3.5*s, oy + 1*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 1*s, 0.5*s, 0.5*s);
          // Fangs
          g.fillStyle(0xffffff);
          g.fillRect(3.5*s, oy + 2.5*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 2.5*s, 0.5*s, 0.5*s);
          // Feet
          g.fillStyle(0x443355);
          g.fillRect(3*s, oy + 3*s, 1*s, 1*s);
          g.fillRect(4.5*s, oy + 3*s, 1*s, 1*s);
        } else if (idx === 1) {
          // Rat - scurrying
          g.fillStyle(0x665544);
          g.fillRect(1*s, oy + 3*s, 5*s, 3*s); // body
          g.fillRect(0*s, oy + 2*s, 2*s, 2*s); // head
          g.fillStyle(0xff4444);
          g.fillRect(0.5*s, oy + 2.5*s, 0.5*s, 0.5*s); // eye
          // Tail
          g.fillStyle(0x997766);
          g.fillRect(6*s, oy + 4*s, 2*s, 1*s);
          // Legs
          g.fillStyle(0x554433);
          g.fillRect(1*s, oy + 6*s, 1*s, 2*s);
          g.fillRect(3*s, oy + 6*s, 1*s, 2*s);
          g.fillRect(5*s, oy + 6*s, 1*s, 1.5*s);
          // Whiskers
          g.fillStyle(0xcccccc);
          g.fillRect(0*s, oy + 3*s, 0.5*s, 0.3*s);
        } else {
          // Orc - green brute with weapon
          g.fillStyle(0x44aa44);
          g.fillRect(2*s, oy + 0*s, 4*s, 3*s); // head
          g.fillStyle(0xff0000);
          g.fillRect(3*s, oy + 1*s, 1*s, 0.5*s);
          g.fillRect(5*s, oy + 1*s, 1*s, 0.5*s);
          // Tusks
          g.fillStyle(0xeeddcc);
          g.fillRect(2.5*s, oy + 2.5*s, 0.5*s, 1*s);
          g.fillRect(5.5*s, oy + 2.5*s, 0.5*s, 1*s);
          // Armor body
          g.fillStyle(0x556633);
          g.fillRect(2*s, oy + 3*s, 5*s, 5*s);
          g.fillStyle(0x888888);
          g.fillRect(3*s, oy + 3.5*s, 3*s, 2*s); // chest plate
          // Axe
          g.fillStyle(0x8B4513);
          g.fillRect(7*s, oy + 1*s, 1*s, 6*s);
          g.fillStyle(0xaaaaaa);
          g.fillRect(6.5*s, oy + 1*s, 2*s, 2*s);
          // Legs
          g.fillStyle(0x44aa44);
          g.fillRect(2*s, oy + 8*s, 2*s, 2*s);
          g.fillRect(5*s, oy + 8*s, 2*s, 2*s);
        }

      } else if (style === 'ocean') {
        if (idx === 0) {
          // Ship Rat
          g.fillStyle(0x665544);
          g.fillRect(1*s, oy + 3*s, 5*s, 3*s);
          g.fillRect(0*s, oy + 2*s, 2*s, 2*s);
          g.fillStyle(0xff4444);
          g.fillRect(0.5*s, oy + 2.5*s, 0.5*s, 0.5*s);
          g.fillStyle(0x997766);
          g.fillRect(6*s, oy + 4*s, 2*s, 1*s);
          g.fillStyle(0x554433);
          g.fillRect(1*s, oy + 6*s, 1*s, 2*s);
          g.fillRect(4*s, oy + 6*s, 1*s, 2*s);
        } else if (idx === 1) {
          // Pirate - hat, eyepatch, sword
          g.fillStyle(0x222222);
          g.fillRect(2*s, oy + 0*s, 5*s, 1.5*s); // hat
          g.fillRect(1*s, oy + 1*s, 7*s, 1*s); // brim
          // Skull on hat
          g.fillStyle(0xffffff);
          g.fillRect(4*s, oy + 0.3*s, 1*s, 0.8*s);
          // Face
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 2*s, 3*s, 2.5*s);
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 2.5*s, 2*s, 0.5*s); // eyepatch
          g.fillStyle(0x000000);
          g.fillRect(5*s, oy + 3*s, 0.5*s, 0.5*s); // good eye
          // Beard
          g.fillStyle(0x5a3a1a);
          g.fillRect(3*s, oy + 4*s, 3*s, 1*s);
          // Coat
          g.fillStyle(0xaa4422);
          g.fillRect(2*s, oy + 4.5*s, 5*s, 4*s);
          g.fillStyle(0xffd700);
          g.fillRect(4*s, oy + 5*s, 1*s, 1*s); // buckle
          // Sword
          g.fillStyle(0xcccccc);
          g.fillRect(7*s, oy + 3*s, 1*s, 5*s);
          g.fillStyle(0xffd700);
          g.fillRect(6.5*s, oy + 5*s, 2*s, 1*s);
          // Legs + peg leg
          g.fillStyle(0x333333);
          g.fillRect(2.5*s, oy + 8.5*s, 2*s, 1.5*s);
          g.fillStyle(0xddcc88);
          g.fillRect(5*s, oy + 8.5*s, 1*s, 1.5*s); // peg
        } else {
          // Monkey - climbing
          g.fillStyle(0xaa8844);
          g.fillRect(2*s, oy + 0*s, 4*s, 3*s); // head
          g.fillStyle(0xddbb88);
          g.fillRect(3*s, oy + 1*s, 2*s, 2*s); // face
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1.5*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 1.5*s, 0.5*s, 0.5*s);
          // Ears
          g.fillStyle(0xddbb88);
          g.fillRect(1.5*s, oy + 1*s, 1*s, 1*s);
          g.fillRect(6*s, oy + 1*s, 1*s, 1*s);
          // Body
          g.fillStyle(0xaa8844);
          g.fillRect(2*s, oy + 3*s, 4*s, 4*s);
          // Long arms
          g.fillRect(0*s, oy + 3*s, 2*s, 1*s);
          g.fillRect(6*s, oy + 3*s, 2*s, 1*s);
          // Tail (curly)
          g.fillStyle(0x997733);
          g.fillRect(6*s, oy + 5*s, 1*s, 3*s);
          g.fillRect(7*s, oy + 7*s, 1*s, 1*s);
          // Legs
          g.fillStyle(0xaa8844);
          g.fillRect(2*s, oy + 7*s, 1.5*s, 2*s);
          g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2*s);
        }

      } else if (style === 'cave') {
        if (idx === 0) {
          // Cave Troll - big and stony
          g.fillStyle(0x556655);
          g.fillRect(1*s, oy + 0*s, 6*s, 4*s); // big head
          g.fillStyle(0xff4444);
          g.fillRect(2*s, oy + 1.5*s, 1.5*s, 1*s);
          g.fillRect(5*s, oy + 1.5*s, 1.5*s, 1*s);
          // Underbite
          g.fillStyle(0xeeddcc);
          g.fillRect(3*s, oy + 3.5*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 3.5*s, 0.5*s, 0.5*s);
          // Massive body
          g.fillStyle(0x667766);
          g.fillRect(0*s, oy + 4*s, 8*s, 4*s);
          // Club
          g.fillStyle(0x5a3a1a);
          g.fillRect(7*s, oy + 1*s, 1.5*s, 6*s);
          g.fillStyle(0x444444);
          g.fillRect(6.5*s, oy + 0*s, 2.5*s, 2*s);
          // Legs
          g.fillStyle(0x556655);
          g.fillRect(1*s, oy + 8*s, 2.5*s, 2*s);
          g.fillRect(4.5*s, oy + 8*s, 2.5*s, 2*s);
        } else if (idx === 1) {
          // Fire Beetle - glowing
          g.fillStyle(0xff4400);
          g.fillRect(2*s, oy + 2*s, 4*s, 3*s); // body
          g.fillStyle(0xff6600);
          g.fillRect(1*s, oy + 2*s, 1*s, 3*s); // wing left
          g.fillRect(6*s, oy + 2*s, 1*s, 3*s); // wing right
          g.fillStyle(0xffaa00);
          g.fillRect(3*s, oy + 3*s, 2*s, 1*s); // glowing core
          // Head
          g.fillStyle(0xcc3300);
          g.fillRect(3*s, oy + 1*s, 2*s, 1.5*s);
          // Antennae
          g.fillStyle(0xff8800);
          g.fillRect(3*s, oy + 0*s, 0.5*s, 1.5*s);
          g.fillRect(4.5*s, oy + 0*s, 0.5*s, 1.5*s);
          // Legs (6)
          g.fillStyle(0xaa3300);
          g.fillRect(1.5*s, oy + 5*s, 1*s, 2*s);
          g.fillRect(3*s, oy + 5*s, 1*s, 2.5*s);
          g.fillRect(5*s, oy + 5*s, 1*s, 2*s);
        } else {
          // Shadow Wisp - ethereal
          g.fillStyle(0x8866cc, 0.7);
          g.fillCircle(4*s, oy + 3*s, 2.5*s);
          g.fillStyle(0xaa88dd, 0.5);
          g.fillCircle(4*s, oy + 3*s, 1.5*s);
          // Glowing eyes
          g.fillStyle(0xffffff);
          g.fillRect(3*s, oy + 2*s, 0.8*s, 0.8*s);
          g.fillRect(4.5*s, oy + 2*s, 0.8*s, 0.8*s);
          // Wispy tendrils
          g.fillStyle(0x6644aa, 0.5);
          g.fillRect(2*s, oy + 5*s, 1*s, 3*s);
          g.fillRect(4*s, oy + 5.5*s, 1*s, 3*s);
          g.fillRect(6*s, oy + 5*s, 1*s, 2.5*s);
        }

      } else if (style === 'castle') {
        if (idx === 0) {
          // Skeleton Knight - bony with armor
          g.fillStyle(0xccccaa);
          g.fillRect(3*s, oy + 0*s, 3*s, 2.5*s); // skull
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1*s, 0.8*s, 0.8*s); // eye sockets
          g.fillRect(5*s, oy + 1*s, 0.8*s, 0.8*s);
          g.fillRect(4*s, oy + 2*s, 1*s, 0.5*s); // nose
          // Armor
          g.fillStyle(0x888888);
          g.fillRect(2*s, oy + 2.5*s, 5*s, 4*s);
          g.fillStyle(0xaaaaaa);
          g.fillRect(3*s, oy + 3*s, 3*s, 1.5*s); // plate
          // Sword
          g.fillStyle(0xcccccc);
          g.fillRect(7*s, oy + 1*s, 0.8*s, 6*s);
          g.fillStyle(0xffd700);
          g.fillRect(6.5*s, oy + 4*s, 2*s, 0.8*s);
          // Bone legs
          g.fillStyle(0xccccaa);
          g.fillRect(2.5*s, oy + 6.5*s, 1.5*s, 3*s);
          g.fillRect(5*s, oy + 6.5*s, 1.5*s, 3*s);
        } else if (idx === 1) {
          // Wraith - floating ghostly
          g.fillStyle(0x6644aa, 0.6);
          g.fillRect(2*s, oy + 0*s, 4*s, 3*s); // hood
          g.fillStyle(0x5533aa, 0.5);
          g.fillRect(1*s, oy + 3*s, 6*s, 5*s); // robes
          g.fillRect(0*s, oy + 4*s, 1*s, 3*s); // sleeve
          g.fillRect(7*s, oy + 4*s, 1*s, 3*s);
          // Glowing eyes
          g.fillStyle(0xff44ff);
          g.fillRect(3*s, oy + 1*s, 0.8*s, 0.8*s);
          g.fillRect(5*s, oy + 1*s, 0.8*s, 0.8*s);
          // Fading bottom
          g.fillStyle(0x4422aa, 0.3);
          g.fillRect(1*s, oy + 8*s, 6*s, 2*s);
        } else {
          // Cursed Archer
          g.fillStyle(0x884422);
          g.fillRect(3*s, oy + 0*s, 3*s, 2.5*s); // head/hood
          g.fillStyle(0xff4444);
          g.fillRect(4*s, oy + 1*s, 0.5*s, 0.5*s); // eye
          g.fillRect(5*s, oy + 1*s, 0.5*s, 0.5*s);
          // Body
          g.fillStyle(0x664422);
          g.fillRect(2*s, oy + 2.5*s, 5*s, 4.5*s);
          // Bow
          g.fillStyle(0x8B4513);
          g.fillRect(7*s, oy + 1*s, 0.5*s, 6*s);
          g.fillStyle(0xcccccc);
          g.fillRect(7*s, oy + 1*s, 0.3*s, 0.3*s);
          g.fillRect(7*s, oy + 6.5*s, 0.3*s, 0.3*s);
          // Arrow
          g.fillStyle(0xdddddd);
          g.fillRect(0*s, oy + 3.5*s, 7*s, 0.3*s);
          g.fillStyle(0xff4444);
          g.fillRect(0*s, oy + 3*s, 1*s, 1*s); // arrowhead
          // Legs
          g.fillStyle(0x553311);
          g.fillRect(2.5*s, oy + 7*s, 1.5*s, 2.5*s);
          g.fillRect(5*s, oy + 7*s, 1.5*s, 2.5*s);
        }

      } else if (style === 'void') {
        if (idx === 0) {
          // Eldrazi Spawn - alien tentacles
          g.fillStyle(0xaa88cc);
          g.fillRect(2*s, oy + 1*s, 4*s, 4*s); // body mass
          g.fillStyle(0xcc99ee);
          g.fillRect(3*s, oy + 0*s, 2*s, 1.5*s); // head protrusion
          // Multiple eyes
          g.fillStyle(0xffffff);
          g.fillRect(2.5*s, oy + 2*s, 0.5*s, 0.5*s);
          g.fillRect(4*s, oy + 1.5*s, 0.5*s, 0.5*s);
          g.fillRect(5.5*s, oy + 2.5*s, 0.5*s, 0.5*s);
          g.fillStyle(0x000000);
          g.fillRect(2.5*s, oy + 2*s, 0.3*s, 0.3*s);
          g.fillRect(4*s, oy + 1.5*s, 0.3*s, 0.3*s);
          g.fillRect(5.5*s, oy + 2.5*s, 0.3*s, 0.3*s);
          // Tentacles
          g.fillStyle(0x8866aa);
          g.fillRect(1*s, oy + 5*s, 1*s, 4*s);
          g.fillRect(3*s, oy + 5*s, 1*s, 3.5*s);
          g.fillRect(5*s, oy + 5*s, 1*s, 4*s);
          g.fillRect(7*s, oy + 4*s, 1*s, 3*s);
        } else if (idx === 1) {
          // Void Tendril - writhing column
          g.fillStyle(0x6633aa);
          g.fillRect(3*s, oy + 0*s, 2*s, 9*s); // main tendril
          g.fillStyle(0x7744bb);
          g.fillRect(1*s, oy + 2*s, 2*s, 1*s); // branch
          g.fillRect(5*s, oy + 4*s, 2*s, 1*s);
          g.fillRect(1*s, oy + 6*s, 2*s, 1*s);
          // Suckers
          g.fillStyle(0xcc88ff);
          g.fillRect(3.5*s, oy + 1*s, 1*s, 0.5*s);
          g.fillRect(3.5*s, oy + 3*s, 1*s, 0.5*s);
          g.fillRect(3.5*s, oy + 5*s, 1*s, 0.5*s);
          g.fillRect(3.5*s, oy + 7*s, 1*s, 0.5*s);
          // Tip
          g.fillStyle(0xaa66dd);
          g.fillRect(2.5*s, oy + 0*s, 3*s, 1*s);
        } else {
          // Mind Flayer - big brain alien
          g.fillStyle(0x884488);
          g.fillRect(2*s, oy + 0*s, 5*s, 3*s); // big head
          g.fillStyle(0xaa66aa);
          g.fillRect(3*s, oy - 1*s, 3*s, 2*s); // brain bulge
          // Eyes (glowing)
          g.fillStyle(0x00ffff);
          g.fillRect(3*s, oy + 1.5*s, 1*s, 0.8*s);
          g.fillRect(5*s, oy + 1.5*s, 1*s, 0.8*s);
          // Face tentacles
          g.fillStyle(0x996699);
          g.fillRect(2.5*s, oy + 3*s, 0.8*s, 2*s);
          g.fillRect(4*s, oy + 3*s, 0.8*s, 2.5*s);
          g.fillRect(5.5*s, oy + 3*s, 0.8*s, 2*s);
          // Robes
          g.fillStyle(0x553355);
          g.fillRect(2*s, oy + 4.5*s, 5*s, 4*s);
          // Legs
          g.fillStyle(0x442244);
          g.fillRect(2.5*s, oy + 8.5*s, 2*s, 1.5*s);
          g.fillRect(5*s, oy + 8.5*s, 2*s, 1.5*s);
        }

      // ===== FASHION ENEMIES =====
      } else if (style === 'streets') {
        if (idx === 0) {
          // Business Person - suit, briefcase
          g.fillStyle(0x333366);
          g.fillRect(2*s, oy + 2*s, 4*s, 5*s); // suit
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 0*s, 2*s, 2.5*s); // face
          g.fillStyle(0x222244);
          g.fillRect(3*s, oy - 0.5*s, 2*s, 1*s); // hair
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 1*s, 0.5*s, 0.5*s);
          // Tie
          g.fillStyle(0xff0000);
          g.fillRect(3.8*s, oy + 2.5*s, 0.5*s, 2*s);
          // Briefcase
          g.fillStyle(0x664422);
          g.fillRect(6*s, oy + 4*s, 2*s, 1.5*s);
          g.fillStyle(0xffd700);
          g.fillRect(6.8*s, oy + 4.5*s, 0.5*s, 0.3*s);
          // Legs
          g.fillStyle(0x333366);
          g.fillRect(2.5*s, oy + 7*s, 1.5*s, 2.5*s);
          g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2.5*s);
        } else if (idx === 1) {
          // Delivery Bike - person on bike
          g.fillStyle(0x44aa44);
          g.fillRect(2*s, oy + 1*s, 3*s, 3*s); // jacket
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 0*s, 2*s, 1.5*s); // face
          g.fillStyle(0x44aa44);
          g.fillRect(3*s, oy - 0.5*s, 2*s, 1*s); // helmet
          // Bike
          g.fillStyle(0x888888);
          g.fillRect(0*s, oy + 5*s, 8*s, 1*s); // frame
          g.fillStyle(0x444444);
          g.fillCircle(1.5*s, oy + 7*s, 1.5*s); // back wheel
          g.fillCircle(6.5*s, oy + 7*s, 1.5*s); // front wheel
          // Backpack
          g.fillStyle(0x44cc44);
          g.fillRect(5*s, oy + 1*s, 2*s, 2.5*s);
        } else {
          // Puddle - splashy obstacle
          g.fillStyle(0x4488cc, 0.7);
          g.fillRect(0*s, oy + 5*s, 8*s, 2*s);
          g.fillStyle(0x66aaee, 0.5);
          g.fillRect(1*s, oy + 4*s, 6*s, 1*s);
          // Splash drops
          g.fillStyle(0x88ccff);
          g.fillRect(2*s, oy + 2*s, 1*s, 2*s);
          g.fillRect(5*s, oy + 1*s, 1*s, 3*s);
          g.fillRect(3.5*s, oy + 3*s, 1*s, 1.5*s);
          // Ripples
          g.fillStyle(0xaaddff, 0.4);
          g.fillRect(1*s, oy + 5.5*s, 2*s, 0.5*s);
          g.fillRect(5*s, oy + 5.5*s, 2*s, 0.5*s);
        }

      } else if (style === 'boutique') {
        if (idx === 0) {
          // Rival Fashionista - sassy pose
          g.fillStyle(0xff4488);
          g.fillRect(3*s, oy - 0.5*s, 3*s, 2*s); // big hair
          g.fillRect(2*s, oy + 0*s, 1*s, 2*s);
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 1*s, 3*s, 2*s); // face
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1.5*s, 0.5*s, 0.5*s);
          g.fillRect(5*s, oy + 1.5*s, 0.5*s, 0.5*s);
          // Attitude (smirk)
          g.fillStyle(0xff0066);
          g.fillRect(4*s, oy + 2.5*s, 1.5*s, 0.3*s);
          // Designer outfit
          g.fillStyle(0xff1493);
          g.fillRect(2*s, oy + 3*s, 5*s, 4*s);
          g.fillStyle(0xffd700);
          g.fillRect(4*s, oy + 3.5*s, 1*s, 1*s); // brooch
          // Handbag
          g.fillStyle(0xcc0066);
          g.fillRect(7*s, oy + 4*s, 1.5*s, 2*s);
          // Legs + heels
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 7*s, 1.5*s, 2*s);
          g.fillRect(5*s, oy + 7*s, 1.5*s, 2*s);
          g.fillStyle(0xff1493);
          g.fillRect(3*s, oy + 9*s, 1.5*s, 0.5*s);
          g.fillRect(5*s, oy + 9*s, 1.5*s, 0.5*s);
        } else if (idx === 1) {
          // Rolling Rack - clothes rack on wheels
          g.fillStyle(0xaaaaaa);
          g.fillRect(1*s, oy + 0*s, 0.5*s, 6*s); // pole left
          g.fillRect(6.5*s, oy + 0*s, 0.5*s, 6*s); // pole right
          g.fillRect(1*s, oy + 0*s, 6*s, 0.5*s); // bar
          // Hangers with clothes
          const clothColors = [0xff69b4, 0x4488ff, 0xffaa00, 0x44cc44];
          for (let ci = 0; ci < 4; ci++) {
            g.fillStyle(clothColors[ci]);
            g.fillRect((1.5 + ci * 1.3)*s, oy + 1*s, 1*s, 4*s);
          }
          // Wheels
          g.fillStyle(0x444444);
          g.fillCircle(2*s, oy + 7*s, 0.8*s);
          g.fillCircle(6*s, oy + 7*s, 0.8*s);
        } else {
          // Mannequin - creepy and stiff
          g.fillStyle(0xeeddcc);
          g.fillRect(3*s, oy + 0*s, 2.5*s, 2.5*s); // head
          g.fillRect(2.5*s, oy + 2.5*s, 3.5*s, 4.5*s); // body
          // No face (creepy)
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1*s, 0.3*s, 0.3*s);
          g.fillRect(5*s, oy + 1*s, 0.3*s, 0.3*s);
          // Arms stuck out
          g.fillStyle(0xeeddcc);
          g.fillRect(0*s, oy + 3*s, 2.5*s, 1*s);
          g.fillRect(6*s, oy + 3*s, 2.5*s, 1*s);
          // Legs
          g.fillRect(3*s, oy + 7*s, 1.5*s, 2.5*s);
          g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2.5*s);
          // Stand
          g.fillStyle(0x888888);
          g.fillRect(2.5*s, oy + 9.5*s, 3.5*s, 0.5*s);
        }

      } else if (style === 'subway') {
        if (idx === 0) {
          // Turnstile - metallic barrier
          g.fillStyle(0x888888);
          g.fillRect(3*s, oy + 0*s, 2*s, 7*s); // post
          g.fillStyle(0xaaaaaa);
          g.fillRect(0*s, oy + 2*s, 8*s, 0.8*s); // arm 1
          g.fillRect(0*s, oy + 5*s, 8*s, 0.8*s); // arm 2
          // Reader
          g.fillStyle(0x00ff00);
          g.fillRect(3.5*s, oy + 7*s, 1*s, 0.5*s);
        } else if (idx === 1) {
          // Street Performer - musical
          g.fillStyle(0xff6600);
          g.fillRect(3*s, oy + 0*s, 2.5*s, 2*s); // beret
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 1.5*s, 2.5*s, 2*s); // face
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 2*s, 0.5*s, 0.5*s);
          g.fillRect(5*s, oy + 2*s, 0.5*s, 0.5*s);
          // Striped shirt
          g.fillStyle(0x222222);
          g.fillRect(2*s, oy + 3.5*s, 5*s, 4*s);
          g.fillStyle(0xffffff);
          g.fillRect(2*s, oy + 4.5*s, 5*s, 1*s);
          g.fillRect(2*s, oy + 6.5*s, 5*s, 1*s);
          // Guitar
          g.fillStyle(0x8B4513);
          g.fillRect(7*s, oy + 2*s, 1*s, 5*s);
          g.fillStyle(0xddaa44);
          g.fillCircle(7.5*s, oy + 6*s, 1.5*s);
          // Legs
          g.fillStyle(0x333333);
          g.fillRect(2.5*s, oy + 7.5*s, 1.5*s, 2*s);
          g.fillRect(5*s, oy + 7.5*s, 1.5*s, 2*s);
        } else {
          // Subway Rat
          g.fillStyle(0x665544);
          g.fillRect(1*s, oy + 4*s, 5*s, 2.5*s);
          g.fillRect(0*s, oy + 3*s, 2*s, 2*s);
          g.fillStyle(0xff4444);
          g.fillRect(0.5*s, oy + 3.5*s, 0.5*s, 0.5*s);
          g.fillStyle(0x997766);
          g.fillRect(6*s, oy + 5*s, 2.5*s, 0.5*s); // long tail
          g.fillStyle(0x554433);
          g.fillRect(1*s, oy + 6.5*s, 1*s, 1.5*s);
          g.fillRect(3*s, oy + 6.5*s, 1*s, 1.5*s);
          g.fillRect(5*s, oy + 6.5*s, 1*s, 1*s);
        }

      } else if (style === 'backstage') {
        if (idx === 0) {
          // Makeup Artist - powder puffs flying
          g.fillStyle(0xff88aa);
          g.fillRect(3*s, oy - 0.5*s, 2.5*s, 1.5*s); // hair
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 0.5*s, 2.5*s, 2.5*s); // face
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1.5*s, 0.5*s, 0.5*s);
          g.fillRect(5*s, oy + 1.5*s, 0.5*s, 0.5*s);
          // Smock
          g.fillStyle(0xffffff);
          g.fillRect(2*s, oy + 3*s, 5*s, 4.5*s);
          g.fillStyle(0xff88aa);
          g.fillRect(3*s, oy + 3.5*s, 3*s, 0.5*s); // stains
          // Brush
          g.fillStyle(0x8B4513);
          g.fillRect(7*s, oy + 2*s, 0.5*s, 4*s);
          g.fillStyle(0xff99bb);
          g.fillRect(6.5*s, oy + 1*s, 1.5*s, 1.5*s);
          // Legs
          g.fillStyle(0x333333);
          g.fillRect(3*s, oy + 7.5*s, 1.5*s, 2*s);
          g.fillRect(5*s, oy + 7.5*s, 1.5*s, 2*s);
        } else if (idx === 1) {
          // Photographer - camera flash
          g.fillStyle(0x444444);
          g.fillRect(3*s, oy + 0*s, 2.5*s, 2*s); // head/cap
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 1.5*s, 2.5*s, 2*s);
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 2*s, 0.5*s, 0.5*s);
          g.fillRect(5*s, oy + 2*s, 0.5*s, 0.5*s);
          // Vest
          g.fillStyle(0x444444);
          g.fillRect(2*s, oy + 3.5*s, 5*s, 4*s);
          // Camera
          g.fillStyle(0x222222);
          g.fillRect(0*s, oy + 3*s, 2.5*s, 2*s);
          g.fillStyle(0x444466);
          g.fillCircle(1.2*s, oy + 4*s, 0.8*s); // lens
          // Flash
          g.fillStyle(0xffff00, 0.6);
          g.fillRect(0*s, oy + 2*s, 3*s, 1*s);
          // Legs
          g.fillStyle(0x333333);
          g.fillRect(2.5*s, oy + 7.5*s, 1.5*s, 2*s);
          g.fillRect(5*s, oy + 7.5*s, 1.5*s, 2*s);
        } else {
          // Tangled Cable - writhing mass
          g.fillStyle(0x222222);
          // Tangled loops
          g.fillRect(1*s, oy + 2*s, 6*s, 1*s);
          g.fillRect(0*s, oy + 4*s, 7*s, 1*s);
          g.fillRect(2*s, oy + 6*s, 5*s, 1*s);
          g.fillRect(1*s, oy + 2*s, 1*s, 3*s);
          g.fillRect(6*s, oy + 3*s, 1*s, 4*s);
          g.fillRect(3*s, oy + 5*s, 1*s, 3*s);
          // Plug ends
          g.fillStyle(0xffffff);
          g.fillRect(0*s, oy + 4*s, 1*s, 1*s);
          g.fillStyle(0xffff00);
          g.fillRect(7*s, oy + 5*s, 1*s, 1*s);
          // Sparks
          g.fillStyle(0xffff00, 0.6);
          g.fillRect(7.5*s, oy + 4*s, 0.5*s, 0.5*s);
          g.fillRect(0.5*s, oy + 3*s, 0.5*s, 0.5*s);
        }

      } else if (style === 'runway') {
        if (idx === 0) {
          // Paparazzi Flash - blinding light person
          g.fillStyle(0xffffaa);
          g.fillRect(3*s, oy + 0*s, 2.5*s, 2.5*s); // head (overexposed)
          g.fillStyle(0xffcc99);
          g.fillRect(3.5*s, oy + 0.5*s, 1.5*s, 1.5*s);
          g.fillStyle(0x000000);
          g.fillRect(3.8*s, oy + 1*s, 0.5*s, 0.5*s);
          g.fillRect(4.8*s, oy + 1*s, 0.5*s, 0.5*s);
          // Body
          g.fillStyle(0x333333);
          g.fillRect(2*s, oy + 2.5*s, 5*s, 4.5*s);
          // Camera + HUGE flash
          g.fillStyle(0x222222);
          g.fillRect(7*s, oy + 3*s, 1.5*s, 1.5*s);
          g.fillStyle(0xffff88);
          g.fillRect(7*s, oy + 1*s, 2*s, 2*s); // flash burst
          g.fillStyle(0xffffff, 0.5);
          g.fillRect(6*s, oy + 0*s, 3*s, 4*s);
          // Legs
          g.fillStyle(0x333333);
          g.fillRect(2.5*s, oy + 7*s, 1.5*s, 2.5*s);
          g.fillRect(5*s, oy + 7*s, 1.5*s, 2.5*s);
        } else if (idx === 1) {
          // Stage Hazard - loose floorboard/light
          g.fillStyle(0xaa4444);
          g.fillRect(1*s, oy + 3*s, 6*s, 2*s); // fallen light bar
          g.fillStyle(0x888888);
          g.fillRect(0*s, oy + 0*s, 1*s, 5*s); // pole
          // Broken bulbs
          g.fillStyle(0xffff00, 0.5);
          g.fillRect(2*s, oy + 3.5*s, 1*s, 1*s);
          g.fillRect(5*s, oy + 3.5*s, 1*s, 1*s);
          // Sparks
          g.fillStyle(0xffff00);
          g.fillRect(3*s, oy + 1*s, 0.5*s, 2*s);
          g.fillRect(6*s, oy + 2*s, 0.5*s, 1.5*s);
          // Danger tape
          g.fillStyle(0xffcc00);
          g.fillRect(1*s, oy + 5*s, 6*s, 0.5*s);
          g.fillStyle(0x000000);
          for (let di = 1; di < 7; di++) g.fillRect(di*s, oy + 5*s, 0.3*s, 0.5*s);
        } else {
          // Heckler - grumpy audience member
          g.fillStyle(0x664444);
          g.fillRect(3*s, oy + 0*s, 2.5*s, 2*s); // messy hair
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 1.5*s, 2.5*s, 2*s);
          // Angry eyebrows
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 1.5*s, 1*s, 0.3*s);
          g.fillRect(5*s, oy + 1.5*s, 1*s, 0.3*s);
          g.fillRect(3.5*s, oy + 2*s, 0.5*s, 0.5*s);
          g.fillRect(5*s, oy + 2*s, 0.5*s, 0.5*s);
          // Open yelling mouth
          g.fillStyle(0x000000);
          g.fillRect(4*s, oy + 3*s, 1*s, 0.5*s);
          // Frumpy outfit
          g.fillStyle(0x884444);
          g.fillRect(2*s, oy + 3.5*s, 5*s, 4.5*s);
          // Raised fist
          g.fillStyle(0xffcc99);
          g.fillRect(7*s, oy + 2*s, 1.5*s, 1.5*s);
          // Legs
          g.fillStyle(0x553333);
          g.fillRect(2.5*s, oy + 8*s, 2*s, 2*s);
          g.fillRect(5*s, oy + 8*s, 2*s, 2*s);
        }

      } else {
        // Fallback generic enemies
        const c = def.color;
        const lighter = Phaser.Display.Color.IntegerToColor(c);
        const darkC = Phaser.Display.Color.GetColor(
          Math.max(0, lighter.red - 40),
          Math.max(0, lighter.green - 40),
          Math.max(0, lighter.blue - 40)
        );
        g.fillStyle(c);
        g.fillRect(2*s, oy + 1*s, 4*s, 6*s);
        g.fillStyle(darkC);
        g.fillRect(2.5*s, oy + 0*s, 3*s, 2*s);
        g.fillStyle(0xff0000);
        g.fillRect(3*s, oy + 0.5*s, 0.8*s, 0.8*s);
        g.fillRect(5*s, oy + 0.5*s, 0.8*s, 0.8*s);
        g.fillStyle(darkC);
        g.fillRect(2*s, oy + 7*s, 1.5*s, 2*s);
        g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2*s);
      }

      g.generateTexture(`enemy_${idx}`, 9*s, oy + 11*s);
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
