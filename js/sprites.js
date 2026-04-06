/**
 * Pixel Art Sprite Generator
 * Creates all game sprites programmatically using Phaser graphics
 */
class SpriteGenerator {

  static generateAll(scene, theme, characterId) {
    SpriteGenerator.generatePlayer(scene, theme, characterId);
    SpriteGenerator.generateEnemies(scene, theme);
    SpriteGenerator.generateProjectile(scene, theme);
    SpriteGenerator.generateParticle(scene, theme);
    SpriteGenerator.generateHeart(scene);
    SpriteGenerator.generateGround(scene, theme);
    SpriteGenerator.generateBackground(scene, theme);
  }

  static generatePlayer(scene, theme, characterId) {
    if (theme === 'mtg') {
      SpriteGenerator.generateMTGCharacter(scene, characterId || 'wizard');
    } else {
      SpriteGenerator.generateFashionCharacter(scene, characterId || 'heels');
    }
  }

  static generateMTGCharacter(scene, id) {
    const g = scene.make.graphics({ add: false });
    const s = 4;
    const oy = 5 * s;

    switch (id) {
      case 'wizard':
        // Wizard hat
        g.fillStyle(0x3a1078);
        g.fillRect(5*s, oy - 4*s, 2*s, 2*s);
        g.fillRect(4*s, oy - 2*s, 4*s, 2*s);
        g.fillRect(3*s, oy + 0*s, 6*s, 2*s);
        g.fillStyle(0xffd700);
        g.fillRect(5.5*s, oy - 3*s, 1*s, 1*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
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
        break;

      case 'vampire':
        // Hair
        g.fillStyle(0x222222);
        g.fillRect(4*s, oy - 1*s, 4*s, 2*s);
        g.fillRect(3*s, oy + 0*s, 1*s, 2*s);
        g.fillRect(8*s, oy + 0*s, 1*s, 2*s);
        // Face - pale
        g.fillStyle(0xeeddcc);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        // Red eyes
        g.fillStyle(0xff0000);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Fangs
        g.fillStyle(0xffffff);
        g.fillRect(5*s, oy + 3.5*s, 0.5*s, 0.5*s);
        g.fillRect(7*s, oy + 3.5*s, 0.5*s, 0.5*s);
        // Cape
        g.fillStyle(0xcc2222);
        g.fillRect(2*s, oy + 4*s, 8*s, 9*s);
        g.fillStyle(0x880000);
        g.fillRect(3*s, oy + 4*s, 6*s, 9*s);
        // Inner suit
        g.fillStyle(0x222222);
        g.fillRect(4*s, oy + 5*s, 4*s, 6*s);
        // Boots
        g.fillStyle(0x111111);
        g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(6*s, oy + 13*s, 3*s, 1*s);
        break;

      case 'human':
        // Helmet
        g.fillStyle(0xdddddd);
        g.fillRect(4*s, oy - 1*s, 4*s, 2*s);
        g.fillRect(3*s, oy + 0*s, 6*s, 1*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        // Eyes
        g.fillStyle(0x4488ff);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Armor
        g.fillStyle(0xcccccc);
        g.fillRect(3*s, oy + 4*s, 6*s, 4*s);
        g.fillStyle(0xeeeecc);
        g.fillRect(5*s, oy + 4*s, 2*s, 2*s); // chest emblem
        // Arms
        g.fillStyle(0xaaaaaa);
        g.fillRect(2*s, oy + 4*s, 1*s, 5*s);
        g.fillRect(9*s, oy + 4*s, 1*s, 5*s);
        // Legs
        g.fillStyle(0x888888);
        g.fillRect(3*s, oy + 8*s, 3*s, 5*s);
        g.fillRect(6*s, oy + 8*s, 3*s, 5*s);
        // Sword
        g.fillStyle(0xffd700);
        g.fillRect(10*s, oy + 4*s, 1*s, 2*s); // hilt
        g.fillStyle(0xcccccc);
        g.fillRect(10*s, oy + 0*s, 1*s, 4*s); // blade
        // Boots
        g.fillStyle(0x664422);
        g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(6*s, oy + 13*s, 3*s, 1*s);
        break;

      case 'turtle':
        // Head
        g.fillStyle(0x44bb44);
        g.fillRect(4*s, oy + 0*s, 4*s, 3*s);
        // Eyes
        g.fillStyle(0x000000);
        g.fillRect(5*s, oy + 1*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 1*s, 1*s, 1*s);
        // Shell
        g.fillStyle(0x22aa44);
        g.fillRect(2*s, oy + 3*s, 8*s, 8*s);
        g.fillStyle(0x118833);
        g.fillRect(3*s, oy + 4*s, 2*s, 2*s);
        g.fillRect(6*s, oy + 4*s, 2*s, 2*s);
        g.fillRect(4*s, oy + 7*s, 3*s, 2*s);
        // Shell edge
        g.fillStyle(0xccaa44);
        g.fillRect(2*s, oy + 3*s, 8*s, 1*s);
        g.fillRect(2*s, oy + 10*s, 8*s, 1*s);
        // Arms
        g.fillStyle(0x44bb44);
        g.fillRect(1*s, oy + 5*s, 1*s, 3*s);
        g.fillRect(10*s, oy + 5*s, 1*s, 3*s);
        // Legs
        g.fillStyle(0x44bb44);
        g.fillRect(3*s, oy + 11*s, 2*s, 3*s);
        g.fillRect(7*s, oy + 11*s, 2*s, 3*s);
        break;

      case 'merfolk':
        // Head + fin
        g.fillStyle(0x2266cc);
        g.fillRect(5*s, oy - 2*s, 2*s, 2*s); // top fin
        g.fillStyle(0x66aaff);
        g.fillRect(4*s, oy + 0*s, 4*s, 3*s);
        // Eyes
        g.fillStyle(0x00ffff);
        g.fillRect(5*s, oy + 1*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 1*s, 1*s, 1*s);
        // Body
        g.fillStyle(0x4488cc);
        g.fillRect(3*s, oy + 3*s, 6*s, 5*s);
        // Trident
        g.fillStyle(0xffd700);
        g.fillRect(10*s, oy + 0*s, 1*s, 10*s);
        g.fillRect(9*s, oy + 0*s, 1*s, 2*s);
        g.fillRect(11*s, oy + 0*s, 1*s, 2*s);
        // Tail / lower body
        g.fillStyle(0x2266cc);
        g.fillRect(3*s, oy + 8*s, 6*s, 3*s);
        g.fillStyle(0x66aaff);
        g.fillRect(2*s, oy + 11*s, 3*s, 2*s);
        g.fillRect(7*s, oy + 11*s, 3*s, 2*s);
        // Scales
        g.fillStyle(0x88ccff);
        g.fillRect(4*s, oy + 4*s, 1*s, 1*s);
        g.fillRect(6*s, oy + 5*s, 1*s, 1*s);
        g.fillRect(5*s, oy + 7*s, 1*s, 1*s);
        break;
    }

    g.generateTexture('player', 12*s, oy + 15*s);
    g.destroy();
  }

  static generateFashionCharacter(scene, id) {
    const g = scene.make.graphics({ add: false });
    const s = 4;
    const oy = 5 * s;

    switch (id) {
      case 'heels':
        // Hair - big and styled
        g.fillStyle(0xff69b4);
        g.fillRect(3*s, oy - 1*s, 6*s, 3*s);
        g.fillRect(2*s, oy + 0*s, 1*s, 3*s);
        g.fillRect(9*s, oy + 0*s, 1*s, 3*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        g.fillStyle(0x9933ff);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Dress
        g.fillStyle(0xff1493);
        g.fillRect(3*s, oy + 4*s, 6*s, 4*s);
        g.fillStyle(0xff69b4);
        g.fillRect(2*s, oy + 8*s, 8*s, 3*s);
        // Belt
        g.fillStyle(0xffd700);
        g.fillRect(3*s, oy + 7*s, 6*s, 1*s);
        // Legs
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 11*s, 2*s, 2*s);
        g.fillRect(6*s, oy + 11*s, 2*s, 2*s);
        // High heels!
        g.fillStyle(0xff1493);
        g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(7*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(3*s, oy + 12*s, 1*s, 1*s);
        g.fillRect(9*s, oy + 12*s, 1*s, 1*s);
        break;

      case 'lipstick':
        // Hair - red bob
        g.fillStyle(0xcc0044);
        g.fillRect(3*s, oy - 1*s, 6*s, 2*s);
        g.fillRect(3*s, oy + 0*s, 7*s, 3*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        g.fillStyle(0x333333);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Red lips
        g.fillStyle(0xff0000);
        g.fillRect(5.5*s, oy + 3*s, 1.5*s, 0.5*s);
        // Top
        g.fillStyle(0xcc0044);
        g.fillRect(3*s, oy + 4*s, 6*s, 4*s);
        // Skirt
        g.fillStyle(0x880033);
        g.fillRect(2*s, oy + 8*s, 8*s, 4*s);
        // Giant lipstick accessory
        g.fillStyle(0xff0000);
        g.fillRect(10*s, oy + 3*s, 1.5*s, 4*s);
        g.fillStyle(0xffd700);
        g.fillRect(10*s, oy + 7*s, 1.5*s, 2*s);
        // Boots
        g.fillStyle(0xcc0044);
        g.fillRect(3*s, oy + 12*s, 3*s, 2*s);
        g.fillRect(6*s, oy + 12*s, 3*s, 2*s);
        break;

      case 'hairspray':
        // BIG hair - teased up
        g.fillStyle(0xffaa00);
        g.fillRect(3*s, oy - 3*s, 6*s, 2*s);
        g.fillRect(2*s, oy - 1*s, 8*s, 3*s);
        g.fillRect(2*s, oy + 1*s, 1*s, 2*s);
        g.fillRect(9*s, oy + 1*s, 1*s, 2*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        g.fillStyle(0x00aa00);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Jacket
        g.fillStyle(0xff8800);
        g.fillRect(3*s, oy + 4*s, 6*s, 5*s);
        g.fillStyle(0xffaa00);
        g.fillRect(2*s, oy + 4*s, 1*s, 5*s);
        g.fillRect(9*s, oy + 4*s, 1*s, 5*s);
        // Pants
        g.fillStyle(0x444444);
        g.fillRect(3*s, oy + 9*s, 3*s, 4*s);
        g.fillRect(6*s, oy + 9*s, 3*s, 4*s);
        // Hair spray can
        g.fillStyle(0xaaaaaa);
        g.fillRect(10*s, oy + 3*s, 2*s, 5*s);
        g.fillStyle(0xffaa00);
        g.fillRect(10.5*s, oy + 2*s, 1*s, 1*s);
        // Boots
        g.fillStyle(0xff8800);
        g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(6*s, oy + 13*s, 3*s, 1*s);
        break;

      case 'nailpolish':
        // Hair - purple curls
        g.fillStyle(0xaa44ff);
        g.fillRect(3*s, oy - 1*s, 6*s, 3*s);
        g.fillRect(2*s, oy + 1*s, 1*s, 2*s);
        g.fillRect(9*s, oy + 1*s, 1*s, 2*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        g.fillStyle(0x8800ff);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Top
        g.fillStyle(0xff66aa);
        g.fillRect(3*s, oy + 4*s, 6*s, 4*s);
        // Skirt
        g.fillStyle(0xaa44ff);
        g.fillRect(2*s, oy + 8*s, 8*s, 3*s);
        g.fillRect(3*s, oy + 11*s, 6*s, 2*s);
        // Nail polish bottle
        g.fillStyle(0xff66aa);
        g.fillRect(10*s, oy + 4*s, 2*s, 4*s);
        g.fillStyle(0xffffff);
        g.fillRect(10.5*s, oy + 2*s, 1*s, 2*s);
        // Boots
        g.fillStyle(0xff66aa);
        g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(6*s, oy + 13*s, 3*s, 1*s);
        break;

      case 'eyeliner':
        // Hair - sleek black
        g.fillStyle(0x222222);
        g.fillRect(3*s, oy - 1*s, 6*s, 2*s);
        g.fillRect(3*s, oy + 0*s, 7*s, 2*s);
        // Face
        g.fillStyle(0xffcc99);
        g.fillRect(4*s, oy + 1*s, 4*s, 3*s);
        // Heavy eyeliner
        g.fillStyle(0x000000);
        g.fillRect(4.5*s, oy + 1.5*s, 2*s, 0.5*s);
        g.fillRect(6.5*s, oy + 1.5*s, 2*s, 0.5*s);
        g.fillStyle(0x00ffff);
        g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
        g.fillRect(7*s, oy + 2*s, 1*s, 1*s);
        // Outfit - all black chic
        g.fillStyle(0x222222);
        g.fillRect(3*s, oy + 4*s, 6*s, 5*s);
        g.fillRect(2*s, oy + 4*s, 1*s, 4*s);
        g.fillRect(9*s, oy + 4*s, 1*s, 4*s);
        // Pants
        g.fillStyle(0x111111);
        g.fillRect(3*s, oy + 9*s, 3*s, 4*s);
        g.fillRect(6*s, oy + 9*s, 3*s, 4*s);
        // Eyeliner pencil
        g.fillStyle(0x333333);
        g.fillRect(10*s, oy + 2*s, 0.8*s, 7*s);
        g.fillStyle(0x000000);
        g.fillRect(10*s, oy + 2*s, 0.8*s, 1*s);
        // Boots
        g.fillStyle(0x000000);
        g.fillRect(3*s, oy + 13*s, 3*s, 1*s);
        g.fillRect(6*s, oy + 13*s, 3*s, 1*s);
        break;
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
      const oy = 2 * s;

      if (theme === 'mtg') {
        if (idx === 0) {
          g.fillStyle(0x44aa44);
          g.fillRect(1*s, oy + 0*s, 1*s, 1*s);
          g.fillRect(6*s, oy + 0*s, 1*s, 1*s);
          g.fillStyle(0x55cc55);
          g.fillRect(2*s, oy + 0*s, 4*s, 2*s);
          g.fillStyle(0xff0000);
          g.fillRect(3*s, oy + 1*s, 1*s, 0.5*s);
          g.fillRect(5*s, oy + 1*s, 1*s, 0.5*s);
          g.fillStyle(0x44aa44);
          g.fillRect(2*s, oy + 2*s, 4*s, 5*s);
          g.fillRect(2*s, oy + 7*s, 1.5*s, 2*s);
          g.fillRect(4.5*s, oy + 7*s, 1.5*s, 2*s);
          g.fillStyle(0x888888);
          g.fillRect(6*s, oy + 2*s, 1*s, 4*s);
        } else if (idx === 1) {
          g.fillStyle(0xddddaa);
          g.fillRect(2*s, oy + 0*s, 1*s, 1.5*s);
          g.fillRect(5*s, oy + 0*s, 1*s, 1.5*s);
          g.fillStyle(0xa0522d);
          g.fillRect(2*s, oy + 1*s, 4*s, 3*s);
          g.fillStyle(0xff4444);
          g.fillRect(3*s, oy + 2*s, 1*s, 1*s);
          g.fillRect(5*s, oy + 2*s, 1*s, 1*s);
          g.fillStyle(0x8b4513);
          g.fillRect(1*s, oy + 3*s, 6*s, 5*s);
          g.fillRect(1*s, oy + 8*s, 1.5*s, 2*s);
          g.fillRect(3*s, oy + 8*s, 1.5*s, 2*s);
          g.fillRect(5*s, oy + 8*s, 1.5*s, 2*s);
        } else {
          g.fillStyle(0xff6644);
          g.fillRect(0*s, oy + 2*s, 2*s, 4*s);
          g.fillRect(7*s, oy + 2*s, 2*s, 4*s);
          g.fillStyle(0xdd4444);
          g.fillRect(3*s, oy + 1*s, 4*s, 3*s);
          g.fillStyle(0xffff00);
          g.fillRect(4*s, oy + 2*s, 1*s, 1*s);
          g.fillRect(6*s, oy + 2*s, 1*s, 1*s);
          g.fillStyle(0xcc2222);
          g.fillRect(2*s, oy + 4*s, 5*s, 4*s);
          g.fillRect(7*s, oy + 6*s, 2*s, 1*s);
          g.fillRect(2*s, oy + 8*s, 2*s, 2*s);
          g.fillRect(5*s, oy + 8*s, 2*s, 2*s);
          g.fillStyle(0xff6600);
          g.fillRect(0*s, oy + 3*s, 1*s, 1*s);
        }
      } else {
        if (idx === 0) {
          g.fillStyle(0xffcc99);
          g.fillRect(3*s, oy + 0*s, 2*s, 2*s);
          g.fillStyle(0x000000);
          g.fillRect(3.5*s, oy + 0.5*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 0.5*s, 0.5*s, 0.5*s);
          g.fillStyle(0xff0000);
          g.fillRect(2*s, oy + 2*s, 4*s, 3*s);
          g.fillStyle(0x00ff00);
          g.fillRect(2*s, oy + 5*s, 4*s, 3*s);
          g.fillStyle(0xff00ff);
          g.fillRect(1*s, oy + 3*s, 1*s, 2*s);
          g.fillRect(6*s, oy + 3*s, 1*s, 2*s);
          g.fillStyle(0xffff00);
          g.fillRect(2*s, oy + 8*s, 1.5*s, 2*s);
          g.fillRect(4.5*s, oy + 8*s, 1.5*s, 2*s);
        } else if (idx === 1) {
          g.fillStyle(0xffcc99);
          g.fillRect(2.5*s, oy + 0*s, 3*s, 2.5*s);
          g.fillStyle(0x000000);
          g.fillRect(3*s, oy + 0.5*s, 1*s, 0.5*s);
          g.fillRect(4.5*s, oy + 0.5*s, 1*s, 0.5*s);
          g.fillRect(4*s, oy + 0.5*s, 0.5*s, 0.3*s);
          g.fillStyle(0x333366);
          g.fillRect(1*s, oy + 2*s, 6*s, 5*s);
          g.fillStyle(0xffd700);
          g.fillRect(3*s, oy + 3*s, 1.5*s, 1.5*s);
          g.fillStyle(0x333366);
          g.fillRect(2*s, oy + 7*s, 2*s, 2*s);
          g.fillRect(4.5*s, oy + 7*s, 2*s, 2*s);
        } else {
          g.fillStyle(0xffcc99);
          g.fillRect(2*s, oy + 0*s, 4*s, 2.5*s);
          g.fillStyle(0x8B4513);
          g.fillRect(2*s, oy + 0*s, 4*s, 0.8*s);
          g.fillRect(5*s, oy + 0*s, 2*s, 4*s);
          g.fillStyle(0x000000);
          g.fillRect(3*s, oy + 1*s, 0.5*s, 0.5*s);
          g.fillRect(4.5*s, oy + 1*s, 0.5*s, 0.5*s);
          g.fillStyle(0xff6600);
          g.fillRect(1*s, oy + 2.5*s, 6*s, 3*s);
          g.fillStyle(0xff00ff);
          g.fillRect(2*s, oy + 5*s, 4*s, 1*s);
          g.fillStyle(0x9900ff);
          g.fillRect(1*s, oy + 5.5*s, 6*s, 3*s);
          g.fillStyle(0x00ff00);
          g.fillRect(1*s, oy + 8.5*s, 2.5*s, 1.5*s);
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
