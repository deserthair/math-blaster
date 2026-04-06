/**
 * Pixel Art Sprite Generator
 * Creates all game sprites programmatically using Phaser graphics
 */
class SpriteGenerator {

  /**
   * Generate all sprites as textures for a given theme
   * @param {Phaser.Scene} scene
   * @param {string} theme - 'mtg' or 'fashion'
   */
  static generateAll(scene, theme) {
    SpriteGenerator.generatePlayer(scene, theme);
    SpriteGenerator.generateEnemies(scene, theme);
    SpriteGenerator.generateProjectile(scene, theme);
    SpriteGenerator.generateParticle(scene, theme);
    SpriteGenerator.generateHeart(scene);
    SpriteGenerator.generateGround(scene, theme);
    SpriteGenerator.generateBackground(scene, theme);
  }

  static generatePlayer(scene, theme) {
    const size = 64;
    const g = scene.make.graphics({ add: false });
    const s = 4; // pixel scale
    // Offset everything down so nothing draws at negative coords
    const oy = 5 * s;

    if (theme === 'mtg') {
      // Wizard hat
      g.fillStyle(0x3a1078);
      g.fillRect(5*s, oy - 4*s, 2*s, 2*s); // tip
      g.fillRect(4*s, oy - 2*s, 4*s, 2*s); // mid
      g.fillRect(3*s, oy + 0*s, 6*s, 2*s); // brim
      // Hat star
      g.fillStyle(0xffd700);
      g.fillRect(5.5*s, oy - 3*s, 1*s, 1*s);
      // Face
      g.fillStyle(0xffcc99);
      g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
      // Eyes
      g.fillStyle(0x4444ff);
      g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
      g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
      // Robe
      g.fillStyle(0x6b2fa0);
      g.fillRect(3*s, oy + 4*s, 6*s, 8*s);
      g.fillRect(2*s, oy + 5*s, 1*s, 6*s);
      g.fillRect(9*s, oy + 5*s, 1*s, 6*s);
      g.fillRect(2*s, oy + 11*s, 8*s, 2*s);
      // Staff
      g.fillStyle(0xffd700);
      g.fillRect(10*s, oy + 2*s, 1*s, 10*s);
      g.fillStyle(0x00ccff);
      g.fillRect(9.5*s, oy + 0*s, 2*s, 2*s);
      // Boots
      g.fillStyle(0x4a2545);
      g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
      g.fillRect(6*s, oy + 13*s, 3*s, 1*s);
    } else {
      // Hair
      g.fillStyle(0xff69b4);
      g.fillRect(3*s, oy - 1*s, 6*s, 3*s);
      g.fillRect(2*s, oy + 0*s, 1*s, 3*s);
      g.fillRect(9*s, oy + 0*s, 1*s, 3*s);
      // Face
      g.fillStyle(0xffcc99);
      g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
      // Eyes
      g.fillStyle(0x9933ff);
      g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
      g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
      // Dress
      g.fillStyle(0xff1493);
      g.fillRect(3*s, oy + 4*s, 6*s, 4*s);
      g.fillStyle(0xff69b4);
      g.fillRect(2*s, oy + 8*s, 8*s, 3*s);
      g.fillStyle(0xffb6c1);
      g.fillRect(1*s, oy + 10*s, 10*s, 2*s);
      // Belt
      g.fillStyle(0xffd700);
      g.fillRect(3*s, oy + 7*s, 6*s, 1*s);
      // Arms
      g.fillStyle(0xffcc99);
      g.fillRect(1*s, oy + 5*s, 2*s, 1*s);
      g.fillRect(9*s, oy + 5*s, 2*s, 1*s);
      // Wand
      g.fillStyle(0xffd700);
      g.fillRect(10*s, oy + 3*s, 1*s, 5*s);
      g.fillStyle(0xffff00);
      g.fillRect(9.5*s, oy + 1.5*s, 2*s, 2*s);
      // Boots
      g.fillStyle(0xff1493);
      g.fillRect(3*s, oy + 12*s, 2*s, 2*s);
      g.fillRect(7*s, oy + 12*s, 2*s, 2*s);
    }

    g.generateTexture('player', 12*s, oy + 15*s);
    g.destroy();
  }

  static generateEnemies(scene, theme) {
    const types = theme === 'mtg'
      ? ['goblin', 'beast', 'dragon']
      : ['clashing', 'fashionPolice', 'disaster'];

    types.forEach((type, idx) => {
      const g = scene.make.graphics({ add: false });
      const s = 4;
      const oy = 2 * s; // offset so nothing is negative

      if (theme === 'mtg') {
        if (idx === 0) {
          // Goblin
          g.fillStyle(0x44aa44);
          g.fillRect(1*s, oy + 0*s, 1*s, 1*s); // left ear
          g.fillRect(6*s, oy + 0*s, 1*s, 1*s); // right ear
          g.fillStyle(0x55cc55);
          g.fillRect(2*s, oy + 0*s, 4*s, 2*s); // head
          g.fillStyle(0xff0000);
          g.fillRect(3*s, oy + 1*s, 1*s, 0.5*s); // eye
          g.fillRect(5*s, oy + 1*s, 1*s, 0.5*s); // eye
          g.fillStyle(0x44aa44);
          g.fillRect(2*s, oy + 2*s, 4*s, 5*s); // body
          g.fillRect(2*s, oy + 7*s, 1.5*s, 2*s); // leg
          g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2*s); // leg
          // Weapon
          g.fillStyle(0x888888);
          g.fillRect(6*s, oy + 2*s, 1*s, 4*s);
        } else if (idx === 1) {
          // Beast
          g.fillStyle(0xddddaa);
          g.fillRect(2*s, oy + 0*s, 1*s, 1.5*s); // horn
          g.fillRect(5*s, oy + 0*s, 1*s, 1.5*s); // horn
          g.fillStyle(0xa0522d);
          g.fillRect(2*s, oy + 1*s, 4*s, 3*s); // head
          g.fillStyle(0xff4444);
          g.fillRect(3*s, oy + 2*s, 1*s, 1*s); // eye
          g.fillRect(5*s, oy + 2*s, 1*s, 1*s); // eye
          g.fillStyle(0x8b4513);
          g.fillRect(1*s, oy + 3*s, 6*s, 5*s); // body
          g.fillRect(1*s, oy + 8*s, 1.5*s, 2*s); // legs
          g.fillRect(3*s, oy + 8*s, 1.5*s, 2*s);
          g.fillRect(5*s, oy + 8*s, 1.5*s, 2*s);
        } else {
          // Dragon
          g.fillStyle(0xff6644);
          g.fillRect(0*s, oy + 2*s, 2*s, 4*s); // left wing
          g.fillRect(7*s, oy + 2*s, 2*s, 4*s); // right wing
          g.fillStyle(0xdd4444);
          g.fillRect(3*s, oy + 1*s, 4*s, 3*s); // head
          g.fillStyle(0xffff00);
          g.fillRect(4*s, oy + 2*s, 1*s, 1*s); // eye
          g.fillRect(6*s, oy + 2*s, 1*s, 1*s); // eye
          g.fillStyle(0xcc2222);
          g.fillRect(2*s, oy + 4*s, 5*s, 4*s); // body
          g.fillRect(7*s, oy + 6*s, 2*s, 1*s); // tail
          g.fillRect(2*s, oy + 8*s, 2*s, 2*s); // leg
          g.fillRect(5*s, oy + 8*s, 2*s, 2*s); // leg
          // Fire breath
          g.fillStyle(0xff6600);
          g.fillRect(0*s, oy + 3*s, 1*s, 1*s);
        }
      } else {
        if (idx === 0) {
          // Clashing outfit
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 0*s, 2*s, 2*s); // face
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 0.5*s, 0.5*s, 0.5*s); // eyes
          g.fillRect(4.5*s, oy + 0.5*s, 0.5*s, 0.5*s);
          g.fillStyle(0xff0000);
          g.fillRect(2*s, oy + 2*s, 4*s, 3*s); // red top
          g.fillStyle(0x00ff00);
          g.fillRect(2*s, oy + 5*s, 4*s, 3*s); // green bottom
          g.fillStyle(0xff00ff);
          g.fillRect(1*s, oy + 3*s, 1*s, 2*s); // sleeve
          g.fillRect(6*s, oy + 3*s, 1*s, 2*s);
          g.fillStyle(0xffff00);
          g.fillRect(2*s, oy + 8*s, 1.5*s, 2*s); // ugly socks
          g.fillRect(4.5*s, oy + 8*s, 1.5*s, 2*s);
        } else if (idx === 1) {
          // Fashion police
          g.fillStyle(0xffcc99);
          g.fillRect(2.5*s, oy + 0*s, 3*s, 2.5*s); // face
          g.fillStyle(0x000000);
          g.fillRect(3*s, oy + 0.5*s, 1*s, 0.5*s); // sunglasses
          g.fillRect(4.5*s, oy + 0.5*s, 1*s, 0.5*s);
          g.fillRect(4*s, oy + 0.5*s, 0.5*s, 0.3*s); // bridge
          g.fillStyle(0x333366);
          g.fillRect(1*s, oy + 2*s, 6*s, 5*s); // uniform
          g.fillStyle(0xffd700);
          g.fillRect(3*s, oy + 3*s, 1.5*s, 1.5*s); // badge
          g.fillStyle(0x333366);
          g.fillRect(2*s, oy + 7*s, 2*s, 2*s); // legs
          g.fillRect(4.5*s, oy + 7*s, 2*s, 2*s);
        } else {
          // Fashion disaster
          g.fillStyle(0xffcc99);
          g.fillRect(2*s, oy + 0*s, 4*s, 2.5*s); // face
          g.fillStyle(0x8B4513);
          g.fillRect(2*s, oy + 0*s, 4*s, 0.8*s); // mullet top
          g.fillRect(5*s, oy + 0*s, 2*s, 4*s); // mullet back
          g.fillStyle(0x000000);
          g.fillRect(3*s, oy + 1*s, 0.5*s, 0.5*s); // eyes
          g.fillRect(4.5*s, oy + 1*s, 0.5*s, 0.5*s);
          g.fillStyle(0xff6600);
          g.fillRect(1*s, oy + 2.5*s, 6*s, 3*s); // orange top
          g.fillStyle(0xff00ff);
          g.fillRect(2*s, oy + 5*s, 4*s, 1*s); // fanny pack
          g.fillStyle(0x9900ff);
          g.fillRect(1*s, oy + 5.5*s, 6*s, 3*s); // purple pants
          g.fillStyle(0x00ff00);
          g.fillRect(1*s, oy + 8.5*s, 2.5*s, 1.5*s); // crocs
          g.fillRect(4.5*s, oy + 8.5*s, 2.5*s, 1.5*s);
        }
      }

      g.generateTexture(`enemy_${idx}`, 9*s, oy + 11*s);
      g.destroy();
    });
  }

  static generateProjectile(scene, theme) {
    const g = scene.make.graphics({ add: false });
    const s = 4;

    if (theme === 'mtg') {
      g.fillStyle(0xff6600);
      g.fillRect(1*s, 1*s, 2*s, 2*s);
      g.fillStyle(0xffff00);
      g.fillRect(1.5*s, 1.5*s, 1*s, 1*s);
      g.fillStyle(0xff3300);
      g.fillRect(0*s, 1.5*s, 1*s, 1*s);
      g.fillRect(3*s, 1.5*s, 1*s, 1*s);
      g.fillRect(1.5*s, 0*s, 1*s, 1*s);
      g.fillRect(1.5*s, 3*s, 1*s, 1*s);
    } else {
      g.fillStyle(0xff69b4);
      g.fillRect(1*s, 1*s, 2*s, 2*s);
      g.fillStyle(0xffffff);
      g.fillRect(1.5*s, 1.5*s, 1*s, 1*s);
      g.fillStyle(0xffff00);
      g.fillRect(0*s, 1.5*s, 1*s, 1*s);
      g.fillRect(3*s, 1.5*s, 1*s, 1*s);
      g.fillRect(1.5*s, 0*s, 1*s, 1*s);
      g.fillRect(1.5*s, 3*s, 1*s, 1*s);
    }

    g.generateTexture('projectile', 4*s, 4*s);
    g.destroy();
  }

  static generateParticle(scene, theme) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(theme === 'mtg' ? 0xffaa00 : 0xff69b4);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);

    const g2 = scene.make.graphics({ add: false });
    g2.fillStyle(0xffffff);
    g2.fillRect(0, 0, 4, 4);
    g2.generateTexture('particle_white', 4, 4);

    g.destroy();
    g2.destroy();
  }

  static generateHeart(scene) {
    const g = scene.make.graphics({ add: false });
    const s = 3;
    g.fillStyle(0xff0000);
    g.fillRect(1*s, 0, 2*s, s);
    g.fillRect(4*s, 0, 2*s, s);
    g.fillRect(0, s, 7*s, s);
    g.fillRect(0, 2*s, 7*s, s);
    g.fillRect(1*s, 3*s, 5*s, s);
    g.fillRect(2*s, 4*s, 3*s, s);
    g.fillRect(3*s, 5*s, 1*s, s);
    g.generateTexture('heart', 7*s, 6*s);
    g.destroy();
  }

  static generateGround(scene, theme) {
    const g = scene.make.graphics({ add: false });
    if (theme === 'mtg') {
      g.fillStyle(0x2d5a27);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x3a7a32);
      for (let i = 0; i < 8; i++) {
        g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(0, 8), 8, 4);
      }
      g.fillStyle(0x5a3a1a);
      g.fillRect(0, 16, 64, 16);
      g.fillStyle(0x4a2a10);
      for (let i = 0; i < 6; i++) {
        g.fillRect(Phaser.Math.Between(0, 56), Phaser.Math.Between(16, 28), 8, 4);
      }
    } else {
      g.fillStyle(0xffccdd);
      g.fillRect(0, 0, 64, 32);
      g.fillStyle(0xff99bb);
      g.fillRect(0, 0, 64, 4);
      g.fillStyle(0xeebb99);
      for (let i = 0; i < 64; i += 16) {
        g.fillRect(i, 14, 8, 4);
      }
    }
    g.generateTexture('ground', 64, 32);
    g.destroy();
  }

  static generateBackground(scene, theme) {
    const g = scene.make.graphics({ add: false });
    const w = 800, h = 600;

    if (theme === 'mtg') {
      g.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a1a4e, 0x1a1a4e);
      g.fillRect(0, 0, w, h);
      g.fillStyle(0xffffff);
      for (let i = 0; i < 50; i++) {
        const sx = Phaser.Math.Between(0, w);
        const sy = Phaser.Math.Between(0, h * 0.6);
        g.fillRect(sx, sy, 2, 2);
      }
      g.fillStyle(0xddddff);
      g.fillCircle(650, 80, 30);
      g.fillStyle(0x0a0a2e);
      g.fillCircle(640, 75, 25);
    } else {
      g.fillGradientStyle(0xffb6c1, 0xffc0cb, 0xffe4e1, 0xfff0f5);
      g.fillRect(0, 0, w, h);
      g.fillStyle(0xffffff, 0.1);
      g.fillCircle(200, 0, 200);
      g.fillCircle(600, 0, 200);
      g.fillStyle(0xffd700, 0.3);
      for (let i = 0; i < 30; i++) {
        const sx = Phaser.Math.Between(0, w);
        const sy = Phaser.Math.Between(0, h * 0.5);
        g.fillRect(sx, sy, 3, 3);
      }
    }

    g.generateTexture('background', w, h);
    g.destroy();
  }
}

window.SpriteGenerator = SpriteGenerator;
