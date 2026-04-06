/**
 * GameScene - Main gameplay
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.theme = data.theme || 'mtg';
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.killCount = 0;
    this.killsToLevel = 5;
    this.currentProblem = null;
    this.answerText = '';
    this.gameActive = true;
    this.enemySpeed = 60;
    this.spawnDelay = 3000;
    this.groundY = 480;
    this.playerInvulnerable = false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);
    window.gameAudio.resume();

    // Generate sprites for this theme
    SpriteGenerator.generateAll(this, this.theme);

    // Background
    this.add.image(width / 2, height / 2, 'background');

    // Scrolling ground
    this.groundTiles = this.add.tileSprite(width / 2, this.groundY + 16, width, 32, 'ground');

    // Player
    this.player = this.physics.add.sprite(120, this.groundY - 30, 'player');
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);
    this.player.body.setSize(32, 50);
    this.player.body.setOffset(8, 8);

    // Ground collision body
    this.ground = this.add.rectangle(width / 2, this.groundY, width, 4, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.player, this.ground);

    // Enemies group (runChildUpdate keeps them ticking)
    this.enemies = this.add.group();

    // Projectiles group
    this.projectiles = this.add.group();

    // UI elements
    this.createUI();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Pause state
    this.paused = false;
    this.pauseOverlay = null;

    // Number keys for typing answers
    this.numberKeys = {};
    for (let i = 0; i <= 9; i++) {
      this.numberKeys[i] = this.input.keyboard.addKey(48 + i); // 0-9
      this.numberKeys['num' + i] = this.input.keyboard.addKey(96 + i); // numpad
    }
    this.backspaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);

    // Touch jump zones
    this.input.on('pointerdown', (pointer) => {
      // Lower half of screen = jump (when no buttons hit)
      if (pointer.y > height * 0.7 && !this.currentProblem) {
        this.playerJump();
      }
    });

    // Enemy spawner
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // Spawn first enemy quickly
    this.time.delayedCall(800, () => this.spawnEnemy());

    console.log('GameScene created. Theme:', this.theme, 'GroundY:', this.groundY);
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

    // Meter label
    const meterLabel = this.theme === 'mtg' ? '⚡ Mana' : '✨ Style';
    this.meterLabel = this.add.text(width / 2, 10, meterLabel, {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Mana/Style meter bar
    this.meterBg = this.add.rectangle(width / 2, 35, 150, 12, 0x333333).setScrollFactor(0);
    this.meterBg.setStrokeStyle(2, 0xffffff);
    const meterColor = this.theme === 'mtg' ? 0x4444ff : 0xff69b4;
    this.meterFill = this.add.rectangle(width / 2 - 73, 35, 0, 10, meterColor).setScrollFactor(0);
    this.meterFill.setOrigin(0, 0.5);
    this.meterValue = 0;

    // Math problem display area (hidden until needed)
    this.problemContainer = this.add.container(width / 2, 100).setScrollFactor(0);
    this.problemContainer.setVisible(false);

    const problemBg = this.add.graphics();
    problemBg.fillStyle(0x000000, 0.85);
    problemBg.fillRoundedRect(-200, -35, 400, 70, 10);
    problemBg.lineStyle(2, this.theme === 'mtg' ? 0x6b2fa0 : 0xff1493);
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

    // Multiple choice buttons (for mobile)
    this.choiceButtons = [];
    this.choiceContainer = this.add.container(width / 2, 185).setScrollFactor(0);
    this.choiceContainer.setVisible(false);

    for (let i = 0; i < 4; i++) {
      const bx = (i - 1.5) * 90;
      const btnBg = this.add.graphics();
      btnBg.fillStyle(this.theme === 'mtg' ? 0x3a1078 : 0xcc0066, 0.9);
      btnBg.fillRoundedRect(bx - 38, -18, 76, 36, 8);
      btnBg.lineStyle(2, 0xffd700);
      btnBg.strokeRoundedRect(bx - 38, -18, 76, 36, 8);

      const btnText = this.add.text(bx, 0, '', {
        fontSize: '18px',
        fontFamily: 'Courier New, monospace',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);

      const btnZone = this.add.zone(bx + width / 2, 185, 76, 36)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

      btnZone.on('pointerdown', () => {
        if (this.currentProblem) {
          this.checkAnswer(parseInt(btnText.text));
        }
      });

      this.choiceButtons.push({ bg: btnBg, text: btnText, zone: btnZone });
      this.choiceContainer.add([btnBg, btnText]);
    }
  }

  spawnEnemy() {
    if (!this.gameActive) return;
    if (this.paused) return;

    const { width } = this.cameras.main;
    const enemyType = Phaser.Math.Between(0, Math.min(2, Math.floor(this.level / 2)));
    const texKey = `enemy_${enemyType}`;

    // Create enemy sprite (with fallback colored rectangle)
    let enemy;
    const ey = this.groundY - 40;

    if (this.textures.exists(texKey)) {
      enemy = this.add.sprite(width + 40, ey, texKey);
    } else {
      console.warn('Missing texture:', texKey, '- using fallback');
      const colors = this.theme === 'mtg' ? [0x44aa44, 0x8b4513, 0xcc2222] : [0xff0000, 0x333366, 0xff6600];
      enemy = this.add.rectangle(width + 40, ey, 36, 40, colors[enemyType]);
    }

    this.physics.add.existing(enemy);
    enemy.body.setAllowGravity(false);
    enemy.body.setVelocityX(-this.enemySpeed);
    enemy.enemyType = enemyType;
    enemy.triggered = false;
    this.enemies.add(enemy);

    console.log('Enemy spawned:', texKey, 'at x:', width + 40, 'y:', this.groundY - 40, 'vx:', -this.enemySpeed);

    window.gameAudio.enemySpawnSound();

    // Bobbing animation
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

  showProblem(enemy) {
    if (this.currentProblem) return;

    enemy.triggered = true;
    enemy.body.setVelocityX(0);

    const problem = MathGenerator.generate(this.level);
    this.currentProblem = { ...problem, enemy };
    this.answerText = '';

    this.problemText.setText(problem.question + ' = ?');
    this.inputDisplay.setText('> _');
    this.problemContainer.setVisible(true);

    // Show choice buttons
    this.choiceContainer.setVisible(true);
    problem.choices.forEach((choice, i) => {
      this.choiceButtons[i].text.setText(choice.toString());
    });

    // Cursor blink
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

    // Hide problem
    this.problemContainer.setVisible(false);
    this.choiceContainer.setVisible(false);
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
    // Play theme sound
    if (this.theme === 'mtg') {
      window.gameAudio.spellSound();
    } else {
      window.gameAudio.styleSound();
    }
    window.gameAudio.correctSound();

    // Fire projectile visually toward enemy, then destroy enemy on arrival
    const proj = this.add.sprite(this.player.x + 30, this.player.y, 'projectile');
    this.projectiles.add(proj);

    // Animate projectile flying to enemy, then explode
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

    // Score
    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);

    // Meter
    this.meterValue = Math.min(100, this.meterValue + 15);
    this.updateMeter();

    // Flash correct color
    this.cameras.main.flash(200, 0, 255, 0, false, null, this);

    // Kill tracking
    this.killCount++;
    if (this.killCount >= this.killsToLevel) {
      this.levelUp();
    }

    // Floating score text
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
    // Particle explosion
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

    // Screen shake
    this.cameras.main.shake(150, 0.01);

    enemy.destroy();
  }

  onWrongAnswer(enemy) {
    window.gameAudio.wrongSound();

    // Enemy attacks - rush forward
    enemy.body.setVelocityX(-300);

    // Damage player
    this.takeDamage();

    // Flash red
    this.cameras.main.flash(300, 255, 0, 0, false, null, this);

    // Show correct answer
    const correctText = this.add.text(this.cameras.main.width / 2, 140, `✗ Answer: ${this.currentProblem ? this.currentProblem.answer : ''}`, {
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

    // Meter drain
    this.meterValue = Math.max(0, this.meterValue - 20);
    this.updateMeter();

    // Destroy enemy after a moment
    this.time.delayedCall(500, () => {
      if (enemy.active) enemy.destroy();
    });
  }

  takeDamage() {
    if (this.playerInvulnerable) return;

    this.lives--;
    window.gameAudio.hurtSound();

    // Update hearts
    if (this.lives >= 0 && this.heartIcons[this.lives]) {
      this.tweens.add({
        targets: this.heartIcons[this.lives],
        alpha: 0.2,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300
      });
    }

    // Player flash (invulnerability)
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

    // Shake
    this.cameras.main.shake(300, 0.02);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  levelUp() {
    this.level++;
    this.killCount = 0;
    this.killsToLevel = 5 + this.level;
    this.enemySpeed = Math.min(150, 60 + this.level * 10);
    this.spawnDelay = Math.max(1200, 3000 - this.level * 200);

    // Update spawner
    this.spawnTimer.remove();
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    this.levelText.setText(`Level: ${this.level}`);
    window.gameAudio.levelUpSound();

    // Level up banner
    const banner = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `⬆ LEVEL ${this.level}!`, {
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

    // Celebrate particles
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

    // Bonus life every 3 levels
    if (this.level % 3 === 0 && this.lives < 3) {
      this.lives++;
      this.heartIcons[this.lives - 1].setAlpha(1).setScale(1.2);
    }
  }

  updateMeter() {
    const fillWidth = (this.meterValue / 100) * 146;
    this.meterFill.width = fillWidth;
  }

  gameOver() {
    this.gameActive = false;
    window.gameAudio.gameOverSound();

    // Stop spawning
    if (this.spawnTimer) this.spawnTimer.remove();

    // Kill remaining enemies
    this.enemies.clear(true, true);

    // Save high score
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

      const pauseTitle = this.add.text(width / 2, height / 2 - 80, '⏸ PAUSED', {
        fontSize: '40px',
        fontFamily: 'Courier New, monospace',
        color: '#ffd700',
        stroke: '#000',
        strokeThickness: 5
      }).setOrigin(0.5);

      const resumeText = this.add.text(width / 2, height / 2, '▶ RESUME (ESC)', {
        fontSize: '22px',
        fontFamily: 'Courier New, monospace',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);
      const resumeZone = this.add.zone(width / 2, height / 2, 300, 40).setInteractive({ useHandCursor: true });
      resumeZone.on('pointerdown', () => this.togglePause());

      const menuText = this.add.text(width / 2, height / 2 + 50, '🏠 MAIN MENU', {
        fontSize: '22px',
        fontFamily: 'Courier New, monospace',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 3
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
    // ESC to pause
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
      return;
    }

    if (!this.gameActive || this.paused) return;

    // Scroll ground
    this.groundTiles.tilePositionX += 2;

    // Jump input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.playerJump();
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

    // Check enemy proximity to trigger problem
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active || enemy.triggered) return;

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < 300) {
        this.showProblem(enemy);
      }

      // Enemy passed player — damage
      if (enemy.x < this.player.x - 50 && !enemy.triggered) {
        enemy.triggered = true;
        this.takeDamage();
        enemy.destroy();
      }
    });

    // Cleanup off-screen projectiles
    this.projectiles.getChildren().forEach(proj => {
      if (proj.x > this.cameras.main.width + 50) proj.destroy();
    });
  }
}

window.GameScene = GameScene;
