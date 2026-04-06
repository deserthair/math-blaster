/**
 * CutsceneScene - Story text with level-specific pixel art backgrounds
 */
class CutsceneScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CutsceneScene' });
  }

  init(data) {
    this.theme = data.theme;
    this.character = data.character;
    this.mathType = data.mathType;
    this.speed = data.speed;
    this.levelIndex = data.levelIndex;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(400);

    const campaign = Campaign[this.theme];
    const level = campaign.levels[this.levelIndex];

    // Draw level-specific background art
    this.drawLevelArt(level, width, height);

    // Dim overlay for text readability
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    // Level header
    const header = this.add.text(width / 2, 60, `- Level ${this.levelIndex + 1} -`, {
      fontSize: '18px',
      fontFamily: 'Courier New, monospace',
      color: '#888888',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);

    // Level name
    const title = this.add.text(width / 2, 100, level.name, {
      fontSize: '38px',
      fontFamily: 'Courier New, monospace',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    // Cutscene text lines
    const lines = level.cutscene.split('\n');
    const lineTexts = [];
    lines.forEach((line, i) => {
      const lt = this.add.text(width / 2, 180 + i * 35, line, {
        fontSize: '18px',
        fontFamily: 'Courier New, monospace',
        color: '#dddddd',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5).setAlpha(0);
      lineTexts.push(lt);
    });

    // Enemy preview
    const enemyY = 320;
    const enemyPreviews = [];
    level.enemies.forEach((e, i) => {
      const ex = width / 2 - 130 + i * 130;
      const circle = this.add.circle(ex, enemyY, 20, e.color, 0.8).setAlpha(0);
      circle.setStrokeStyle(2, 0xffffff, 0.3);
      const ename = this.add.text(ex, enemyY + 30, e.name, {
        fontSize: '10px',
        fontFamily: 'Courier New, monospace',
        color: '#aaaaaa',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0);
      enemyPreviews.push(circle, ename);
    });

    // Boss warning box
    const bossBoxY = 410;
    const bossBox = this.add.graphics().setAlpha(0);
    bossBox.fillStyle(0x000000, 0.7);
    bossBox.fillRoundedRect(width / 2 - 200, bossBoxY - 35, 400, 70, 8);
    bossBox.lineStyle(2, 0xff4444, 0.8);
    bossBox.strokeRoundedRect(width / 2 - 200, bossBoxY - 35, 400, 70, 8);

    const bossLabel = this.add.text(width / 2, bossBoxY - 12, 'BOSS', {
      fontSize: '12px',
      fontFamily: 'Courier New, monospace',
      color: '#ff6666',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    const bossName = this.add.text(width / 2, bossBoxY + 12, level.boss.name, {
      fontSize: '22px',
      fontFamily: 'Courier New, monospace',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    // Quest info
    const questInfo = this.add.text(width / 2, 500,
      `Defeat ${level.questionsToProgress} enemies, then face the boss!`, {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#aaaaaa',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    // Continue prompt
    const continueText = this.add.text(width / 2, height - 40, 'Press SPACE or click to begin', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      color: '#666666',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    // === Animate everything in ===
    this.tweens.add({ targets: header, alpha: 1, duration: 500, delay: 200 });
    this.tweens.add({ targets: title, alpha: 1, duration: 800, delay: 500, ease: 'Power2' });

    lineTexts.forEach((lt, i) => {
      this.tweens.add({ targets: lt, alpha: 1, duration: 500, delay: 1100 + i * 500 });
    });

    const enemyDelay = 1100 + lines.length * 500 + 200;
    enemyPreviews.forEach((ep, i) => {
      this.tweens.add({ targets: ep, alpha: 1, duration: 400, delay: enemyDelay + Math.floor(i / 2) * 200 });
    });

    const bossDelay = enemyDelay + level.enemies.length * 200 + 300;
    this.tweens.add({ targets: bossBox, alpha: 1, duration: 400, delay: bossDelay });
    this.tweens.add({ targets: bossLabel, alpha: 1, duration: 400, delay: bossDelay + 100 });
    this.tweens.add({ targets: bossName, alpha: 1, duration: 600, delay: bossDelay + 200 });

    const questDelay = bossDelay + 600;
    this.tweens.add({ targets: questInfo, alpha: 1, duration: 400, delay: questDelay });

    const continueDelay = questDelay + 400;
    this.tweens.add({
      targets: continueText, alpha: 1, duration: 500, delay: continueDelay,
      onComplete: () => {
        this.tweens.add({ targets: continueText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
      }
    });

    // Input
    this.canProceed = false;
    this.time.delayedCall(continueDelay, () => { this.canProceed = true; });

    const proceed = () => {
      if (!this.canProceed) return;
      this.canProceed = false;
      window.gameAudio.selectSound();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene', {
          theme: this.theme,
          character: this.character,
          mathType: this.mathType,
          speed: this.speed,
          campaignMode: true,
          levelIndex: this.levelIndex
        });
      });
    };

    this.input.on('pointerdown', proceed);
    this.input.keyboard.on('keydown-SPACE', proceed);
  }

  drawLevelArt(level, w, h) {
    const g = this.add.graphics();
    const c = level.bgColors;

    // Sky gradient
    g.fillGradientStyle(c.sky1, c.sky1, c.sky2, c.sky2);
    g.fillRect(0, 0, w, h);

    if (this.theme === 'mtg') {
      this.drawMTGLevel(g, level, w, h, c);
    } else {
      this.drawFashionLevel(g, level, w, h, c);
    }

    // Ground
    g.fillStyle(c.ground1);
    g.fillRect(0, h - 80, w, 80);
    g.fillStyle(c.ground2);
    for (let i = 0; i < 20; i++) {
      g.fillRect(Phaser.Math.Between(0, w - 20), h - 80 + Phaser.Math.Between(0, 10), Phaser.Math.Between(10, 40), 4);
    }
  }

  drawMTGLevel(g, level, w, h, c) {
    switch (level.id) {
      case 1: // Whispering Forest
        // Moon
        g.fillStyle(0xddddff, 0.8);
        g.fillCircle(650, 70, 28);
        g.fillStyle(c.sky1);
        g.fillCircle(640, 65, 24);
        // Stars
        g.fillStyle(0xffffff, 0.6);
        for (let i = 0; i < 30; i++) {
          g.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.4), 2, 2);
        }
        // Trees (tall dark trunks with canopy)
        for (let i = 0; i < 8; i++) {
          const tx = 50 + i * 100 + Phaser.Math.Between(-20, 20);
          const th = Phaser.Math.Between(180, 280);
          // Trunk
          g.fillStyle(0x3a2a1a);
          g.fillRect(tx - 5, h - 80 - th, 10, th);
          // Canopy
          g.fillStyle(0x1a4a1e, 0.9);
          g.fillTriangle(tx, h - 80 - th - 40, tx - 40, h - 80 - th + 30, tx + 40, h - 80 - th + 30);
          g.fillTriangle(tx, h - 80 - th - 10, tx - 30, h - 80 - th + 50, tx + 30, h - 80 - th + 50);
        }
        // Glowing mushrooms
        for (let i = 0; i < 12; i++) {
          const mx = Phaser.Math.Between(20, w - 20);
          const my = h - 80 - Phaser.Math.Between(5, 20);
          g.fillStyle(0x44ff44, 0.5);
          g.fillCircle(mx, my, 4);
          g.fillStyle(0xaaffaa, 0.3);
          g.fillCircle(mx, my, 8);
        }
        // Mossy rocks
        g.fillStyle(0x4a5a3a);
        g.fillRect(100, h - 95, 40, 15);
        g.fillRect(450, h - 90, 30, 10);
        g.fillRect(680, h - 92, 35, 12);
        break;

      case 2: // Pirate Crossing
        // Stormy sky with lightning
        g.fillStyle(0x4a5a6a, 0.3);
        g.fillRect(0, 20, w, 60);
        g.fillRect(100, 10, w - 200, 40);
        // Lightning bolt
        g.lineStyle(3, 0xffffaa, 0.7);
        g.beginPath();
        g.moveTo(500, 0); g.lineTo(480, 80); g.lineTo(510, 80); g.lineTo(470, 170);
        g.strokePath();
        // Ocean waves
        for (let i = 0; i < 5; i++) {
          const wy = h - 80 - 20 - i * 15;
          g.fillStyle(0x2a5a7a, 0.3 + i * 0.05);
          for (let j = 0; j < 10; j++) {
            g.fillRect(j * 85 + (i % 2) * 40, wy, 60, 8);
          }
        }
        // Ship mast
        g.fillStyle(0x5a3a1a);
        g.fillRect(w / 2 - 4, h - 280, 8, 200);
        // Sail
        g.fillStyle(0xddccaa, 0.7);
        g.fillTriangle(w / 2, h - 270, w / 2 + 80, h - 200, w / 2, h - 130);
        // Skull flag
        g.fillStyle(0x111111);
        g.fillRect(w / 2 - 2, h - 290, 30, 20);
        g.fillStyle(0xffffff);
        g.fillCircle(w / 2 + 12, h - 283, 4);
        // Ship hull
        g.fillStyle(0x5a3a1a);
        g.fillRect(w / 2 - 100, h - 100, 200, 30);
        g.fillStyle(0x4a2a10);
        g.fillRect(w / 2 - 110, h - 80, 220, 10);
        break;

      case 3: // Sunken Caverns
        // Stalactites
        for (let i = 0; i < 10; i++) {
          const sx = Phaser.Math.Between(10, w - 10);
          const sl = Phaser.Math.Between(30, 80);
          g.fillStyle(0x3a2a1a);
          g.fillTriangle(sx - 8, 0, sx + 8, 0, sx, sl);
        }
        // Lava pools (glowing)
        g.fillStyle(0xff4400, 0.6);
        g.fillRect(100, h - 85, 120, 8);
        g.fillRect(400, h - 83, 80, 6);
        g.fillRect(600, h - 86, 100, 8);
        // Lava glow
        g.fillStyle(0xff6600, 0.2);
        g.fillRect(90, h - 100, 140, 20);
        g.fillRect(390, h - 95, 100, 15);
        g.fillRect(590, h - 100, 120, 20);
        // Crystal pillars
        for (let i = 0; i < 5; i++) {
          const cx = 80 + i * 160;
          g.fillStyle(0x6644aa, 0.6);
          g.fillRect(cx, h - 200, 12, 120);
          g.fillStyle(0xaa88ff, 0.4);
          g.fillRect(cx + 2, h - 200, 8, 10);
        }
        // Fireflies
        for (let i = 0; i < 15; i++) {
          g.fillStyle(0xffaa00, 0.6);
          g.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(50, h - 100), 2);
        }
        break;

      case 4: // Cursed Citadel
        // Dark clouds
        g.fillStyle(0x222233, 0.5);
        for (let i = 0; i < 6; i++) {
          g.fillRect(Phaser.Math.Between(0, w - 100), Phaser.Math.Between(10, 60), Phaser.Math.Between(80, 200), 30);
        }
        // Castle towers
        g.fillStyle(0x333344);
        g.fillRect(200, h - 320, 50, 240);
        g.fillRect(550, h - 300, 50, 220);
        g.fillRect(350, h - 350, 60, 270);
        // Battlements
        for (let bx = 195; bx < 255; bx += 12) { g.fillRect(bx, h - 330, 8, 10); }
        for (let bx = 345; bx < 415; bx += 12) { g.fillRect(bx, h - 360, 8, 10); }
        for (let bx = 545; bx < 605; bx += 12) { g.fillRect(bx, h - 310, 8, 10); }
        // Castle wall
        g.fillStyle(0x444455);
        g.fillRect(200, h - 150, 400, 70);
        // Gate
        g.fillStyle(0x222233);
        g.fillRect(370, h - 150, 40, 60);
        g.fillStyle(0x1a1a2a);
        g.fillRect(375, h - 145, 30, 55);
        // Dark magic wisps
        g.fillStyle(0x8844cc, 0.3);
        for (let i = 0; i < 10; i++) {
          g.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(100, h - 100), Phaser.Math.Between(3, 8));
        }
        // Torches
        g.fillStyle(0xff6600, 0.7);
        g.fillCircle(225, h - 160, 5);
        g.fillCircle(575, h - 160, 5);
        g.fillStyle(0xffaa00, 0.3);
        g.fillCircle(225, h - 160, 12);
        g.fillCircle(575, h - 160, 12);
        break;

      case 5: // Eldrazi Threshold
        // Cracked sky
        g.lineStyle(2, 0xcc44ff, 0.5);
        g.beginPath();
        g.moveTo(w / 2, 0); g.lineTo(w / 2 - 30, 80); g.lineTo(w / 2 + 20, 150);
        g.lineTo(w / 2 - 10, 250); g.lineTo(w / 2 + 40, 350);
        g.strokePath();
        g.lineStyle(1, 0xcc44ff, 0.3);
        g.beginPath();
        g.moveTo(w / 2 - 30, 80); g.lineTo(w / 2 - 80, 130);
        g.moveTo(w / 2 + 20, 150); g.lineTo(w / 2 + 90, 180);
        g.strokePath();
        // Void portals
        for (let i = 0; i < 4; i++) {
          const px = Phaser.Math.Between(60, w - 60);
          const py = Phaser.Math.Between(60, h - 150);
          g.fillStyle(0x6633aa, 0.3);
          g.fillCircle(px, py, 25);
          g.fillStyle(0x220044, 0.5);
          g.fillCircle(px, py, 12);
          g.lineStyle(1, 0xcc44ff, 0.4);
          g.strokeCircle(px, py, 25);
        }
        // Floating debris
        for (let i = 0; i < 8; i++) {
          g.fillStyle(0x4a3a5a, 0.6);
          const dx = Phaser.Math.Between(0, w);
          const dy = Phaser.Math.Between(80, h - 120);
          g.fillRect(dx, dy, Phaser.Math.Between(8, 25), Phaser.Math.Between(5, 15));
        }
        // Alien geometry
        g.lineStyle(1, 0xaa66dd, 0.3);
        g.strokeTriangle(150, 100, 250, 200, 100, 220);
        g.strokeTriangle(550, 80, 700, 180, 500, 200);
        // Eldrazi tendrils
        g.lineStyle(3, 0x8844cc, 0.4);
        for (let i = 0; i < 5; i++) {
          const tx = Phaser.Math.Between(0, w);
          g.beginPath();
          g.moveTo(tx, h - 80);
          g.lineTo(tx + Phaser.Math.Between(-30, 30), h - 140);
          g.lineTo(tx + Phaser.Math.Between(-50, 50), h - 200);
          g.strokePath();
        }
        break;
    }
  }

  drawFashionLevel(g, level, w, h, c) {
    switch (level.id) {
      case 1: // Morning Rush - NYC streets
        // Buildings
        for (let i = 0; i < 6; i++) {
          const bx = i * 140 + 10;
          const bh = Phaser.Math.Between(200, 350);
          const bw = Phaser.Math.Between(80, 120);
          g.fillStyle(Phaser.Math.RND.pick([0x667788, 0x778899, 0x556677, 0x889999]));
          g.fillRect(bx, h - 80 - bh, bw, bh);
          // Windows
          g.fillStyle(0xffffcc, 0.6);
          for (let wy = h - 80 - bh + 15; wy < h - 90; wy += 25) {
            for (let wx = bx + 10; wx < bx + bw - 15; wx += 20) {
              g.fillRect(wx, wy, 10, 12);
            }
          }
        }
        // Street lights
        g.fillStyle(0x444444);
        g.fillRect(150, h - 180, 4, 100);
        g.fillRect(500, h - 180, 4, 100);
        g.fillStyle(0xffff00, 0.5);
        g.fillCircle(152, h - 185, 6);
        g.fillCircle(502, h - 185, 6);
        // Taxi
        g.fillStyle(0xffcc00);
        g.fillRect(300, h - 105, 60, 25);
        g.fillStyle(0x222222);
        g.fillRect(310, h - 120, 40, 18);
        g.fillCircle(315, h - 78, 6);
        g.fillCircle(350, h - 78, 6);
        // Hot dog cart
        g.fillStyle(0xcc4444);
        g.fillRect(600, h - 110, 40, 30);
        g.fillStyle(0xdddddd);
        g.fillRect(605, h - 120, 30, 12);
        // Crosswalk stripes
        g.fillStyle(0xffffff, 0.4);
        for (let cx = 0; cx < w; cx += 120) {
          for (let s = 0; s < 4; s++) {
            g.fillRect(cx + 20, h - 75 + s * 15, 50, 6);
          }
        }
        break;

      case 2: // Boutique Battle
        // Store front
        g.fillStyle(0xeeddcc);
        g.fillRect(50, h - 400, w - 100, 320);
        // Big window
        g.fillStyle(0xaaddff, 0.5);
        g.fillRect(100, h - 350, 250, 200);
        g.fillRect(450, h - 350, 250, 200);
        // Window displays (mannequins)
        g.fillStyle(0xeeddcc, 0.8);
        g.fillRect(180, h - 300, 15, 50); // mannequin
        g.fillCircle(187, h - 310, 8);
        g.fillRect(520, h - 300, 15, 50);
        g.fillCircle(527, h - 310, 8);
        // Store name
        g.fillStyle(0xff1493, 0.8);
        g.fillRect(250, h - 390, 300, 30);
        // Clothing racks
        g.fillStyle(0xaaaaaa);
        g.fillRect(120, h - 180, 3, 80);
        g.fillRect(200, h - 180, 3, 80);
        g.fillRect(120, h - 180, 83, 3);
        // Hangers
        for (let hx = 125; hx < 200; hx += 15) {
          g.fillStyle(Phaser.Math.RND.pick([0xff1493, 0x4488ff, 0xffaa00, 0x44cc44]));
          g.fillRect(hx, h - 175, 10, 25);
        }
        // Floor tiles
        g.fillStyle(0xddbb99, 0.3);
        for (let tx = 0; tx < w; tx += 40) {
          g.fillRect(tx, h - 80, 38, 78);
        }
        break;

      case 3: // Subway Sprint
        // Tunnel arch
        g.fillStyle(0x1a1a1a);
        g.fillRect(0, 0, w, h);
        g.fillStyle(c.sky1);
        g.fillRect(30, 30, w - 60, h - 110);
        // Tiles
        g.fillStyle(0x555555, 0.3);
        for (let ty = 30; ty < h - 80; ty += 20) {
          g.fillRect(30, ty, w - 60, 1);
        }
        // Platform edge
        g.fillStyle(0xffcc00);
        g.fillRect(0, h - 85, w, 4);
        // Tracks
        g.fillStyle(0x888888);
        g.fillRect(50, h - 60, w - 100, 3);
        g.fillRect(50, h - 40, w - 100, 3);
        // Train
        g.fillStyle(0x4466aa);
        g.fillRect(200, h - 200, 350, 100);
        g.fillStyle(0x88aadd, 0.5);
        g.fillRect(220, h - 185, 40, 50);
        g.fillRect(280, h - 185, 40, 50);
        g.fillRect(340, h - 185, 40, 50);
        g.fillRect(400, h - 185, 40, 50);
        g.fillRect(460, h - 185, 40, 50);
        // Subway sign
        g.fillStyle(0x000000, 0.8);
        g.fillCircle(100, 80, 25);
        g.fillStyle(0xffcc00);
        g.fillCircle(100, 80, 20);
        // Rats
        g.fillStyle(0x665544);
        g.fillRect(500, h - 75, 10, 5);
        g.fillRect(650, h - 73, 8, 4);
        break;

      case 4: // Backstage Chaos
        // Backstage walls
        g.fillStyle(0x4a3a3a);
        g.fillRect(0, 0, w, h - 80);
        // Mirrors with lights
        for (let i = 0; i < 3; i++) {
          const mx = 100 + i * 250;
          g.fillStyle(0x8899aa, 0.5);
          g.fillRect(mx, 100, 120, 160);
          g.lineStyle(2, 0xffd700, 0.6);
          g.strokeRect(mx, 100, 120, 160);
          // Vanity bulbs
          for (let bx = mx; bx <= mx + 120; bx += 20) {
            g.fillStyle(0xffffcc, 0.7);
            g.fillCircle(bx, 95, 5);
          }
        }
        // Clothing racks with mess
        g.fillStyle(0xaaaaaa);
        g.fillRect(50, 300, 3, 100); g.fillRect(130, 300, 3, 100); g.fillRect(50, 300, 83, 3);
        for (let hx = 55; hx < 130; hx += 12) {
          g.fillStyle(Phaser.Math.RND.pick([0xff4488, 0x44aaff, 0xffaa00, 0x222222, 0xff1493]));
          g.fillRect(hx, 305, 8, 35);
        }
        // Cables on floor
        g.lineStyle(2, 0x222222, 0.6);
        g.beginPath();
        g.moveTo(0, h - 90); g.lineTo(150, h - 100); g.lineTo(300, h - 85); g.lineTo(500, h - 95);
        g.strokePath();
        // Makeup scattered
        g.fillStyle(0xff66aa);
        g.fillRect(400, 350, 8, 20);
        g.fillRect(420, 355, 8, 20);
        g.fillStyle(0xffaa00);
        g.fillCircle(500, 360, 8);
        break;

      case 5: // Grand Runway
        // Spotlights from ceiling
        for (let i = 0; i < 5; i++) {
          const sx = 80 + i * 160;
          g.fillStyle(0xffffff, 0.05);
          g.fillTriangle(sx, 0, sx - 60, h - 80, sx + 60, h - 80);
        }
        // Runway strip
        g.fillStyle(0xddaa77, 0.4);
        g.fillRect(w / 2 - 80, 100, 160, h - 180);
        g.lineStyle(2, 0xffd700, 0.5);
        g.strokeRect(w / 2 - 80, 100, 160, h - 180);
        // Audience (rows of heads)
        for (let row = 0; row < 3; row++) {
          for (let i = 0; i < 12; i++) {
            const ax = 20 + i * 30 + (i > 5 ? 200 : 0);
            const ay = 200 + row * 40;
            if (ax > w / 2 - 90 && ax < w / 2 + 90) continue; // gap for runway
            g.fillStyle(Phaser.Math.RND.pick([0xffcc99, 0xddaa77, 0xbb8855, 0xeeddcc]));
            g.fillCircle(ax, ay, 6);
          }
        }
        // Camera flashes
        g.fillStyle(0xffffff, 0.4);
        for (let i = 0; i < 8; i++) {
          const fx = Phaser.Math.Between(0, w);
          const fy = Phaser.Math.Between(50, 300);
          g.fillRect(fx - 1, fy - 6, 2, 12);
          g.fillRect(fx - 6, fy - 1, 12, 2);
        }
        // Judges table
        g.fillStyle(0x443322);
        g.fillRect(w / 2 - 120, h - 140, 240, 20);
        g.fillStyle(0xffd700, 0.4);
        for (let i = 0; i < 3; i++) {
          g.fillRect(w / 2 - 80 + i * 60, h - 160, 30, 20);
        }
        break;
    }
  }
}

window.CutsceneScene = CutsceneScene;
