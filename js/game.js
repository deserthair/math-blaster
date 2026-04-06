/**
 * Math Blaster - Main Game Configuration
 * A pixel-art math run-and-gun game
 */

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 400, height: 300 },
    max: { width: 1200, height: 900 }
  },
  scene: [MenuScene, SettingsScene, StorySelectScene, CutsceneScene, GameScene, GameOverScene, VictoryScene]
};

// Initialize the game when DOM is ready
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});
