/**
 * Campaign data for both story arcs
 */
const Campaign = {
  mtg: {
    title: 'Spell Slinger',
    prologue: 'Your family has been taken by the Eldrazi.\nYou begin honing your magic...\nYou must try.',
    victory: 'Your family is rescued!\nAll spells mastered.\nYou are now a Sparky Planeswalker!',
    levels: [
      {
        id: 1,
        name: 'The Whispering Forest',
        cutscene: 'Dense forest stretches before you.\nGlowing mushrooms light the way.\nThe path forward is crawling with creatures...',
        bgStyle: 'forest',
        bgColors: { sky1: 0x0a2a0a, sky2: 0x1a4a1e, ground1: 0x2d5a27, ground2: 0x3a7a32, accent: 0x44ff44 },
        enemies: [
          { name: 'Mirkwood Bat', color: 0x443355 },
          { name: 'Rat', color: 0x665544 },
          { name: 'Orc', color: 0x44aa44 }
        ],
        questionsToProgress: 10,
        boss: {
          name: 'Gorgonath the Great Orc',
          questions: 8,
          color: 0x228822,
          size: 1.8,
          attack: 'charges'
        }
      },
      {
        id: 2,
        name: 'The Pirate Crossing',
        cutscene: 'You reach the docks and board a ship.\nThe stormy sea rocks beneath you.\nPirates block your path!',
        bgStyle: 'ocean',
        bgColors: { sky1: 0x1a3a5a, sky2: 0x2a5a7a, ground1: 0x5a3a1a, ground2: 0x7a5a3a, accent: 0x4488cc },
        enemies: [
          { name: 'Rat', color: 0x665544 },
          { name: 'Pirate', color: 0xaa4422 },
          { name: 'Monkey', color: 0xaa8844 }
        ],
        questionsToProgress: 10,
        boss: {
          name: 'Bobo the Pirate Captain',
          questions: 8,
          color: 0xaa2222,
          size: 1.8,
          attack: 'throws'
        }
      },
      {
        id: 3,
        name: 'The Sunken Caverns',
        cutscene: 'The ship wrecks on rocks!\nYou wash into dark caves.\nLava pools glow in the depths...',
        bgStyle: 'cave',
        bgColors: { sky1: 0x1a0a0a, sky2: 0x2a1a0a, ground1: 0x3a2a1a, ground2: 0x4a3a2a, accent: 0xff4400 },
        enemies: [
          { name: 'Cave Troll', color: 0x556655 },
          { name: 'Fire Beetle', color: 0xff4400 },
          { name: 'Shadow Wisp', color: 0x8866cc }
        ],
        questionsToProgress: 12,
        boss: {
          name: 'Moldrath the Cavern Wyrm',
          questions: 10,
          color: 0xcc4400,
          size: 2.0,
          attack: 'fire breath'
        }
      },
      {
        id: 4,
        name: 'The Cursed Citadel',
        cutscene: 'You emerge onto a dark plain.\nA ruined fortress looms ahead.\nDark magic crackles in the air...',
        bgStyle: 'castle',
        bgColors: { sky1: 0x0a0a1a, sky2: 0x1a1a2a, ground1: 0x333344, ground2: 0x444455, accent: 0x8844cc },
        enemies: [
          { name: 'Skeleton Knight', color: 0xccccaa },
          { name: 'Wraith', color: 0x6644aa },
          { name: 'Cursed Archer', color: 0x884422 }
        ],
        questionsToProgress: 12,
        boss: {
          name: 'The Pale Knight',
          questions: 10,
          color: 0xaaaacc,
          size: 2.0,
          attack: 'sword dash'
        }
      },
      {
        id: 5,
        name: 'The Eldrazi Threshold',
        cutscene: 'The sky cracks open!\nAlien geometry twists reality.\nThe Eldrazi await...',
        bgStyle: 'void',
        bgColors: { sky1: 0x1a0a2a, sky2: 0x2a0a3a, ground1: 0x2a1a3a, ground2: 0x3a2a4a, accent: 0xcc44ff },
        enemies: [
          { name: 'Eldrazi Spawn', color: 0xaa88cc },
          { name: 'Void Tendril', color: 0x6633aa },
          { name: 'Mind Flayer', color: 0x884488 }
        ],
        questionsToProgress: 15,
        boss: {
          name: 'Ulamog, the Ceaseless Hunger',
          questions: 12,
          color: 0x8844cc,
          size: 2.2,
          attack: 'multi-phase'
        }
      }
    ]
  },

  fashion: {
    title: 'Runway Blitz',
    prologue: 'Your big NYC runway debut is TODAY!\nYou overslept! You have nothing to wear!\nGo go go!',
    victory: 'You won the runway show!\nCustom outfit designer unlocked.\nYou are now a Supermodel!',
    levels: [
      {
        id: 1,
        name: 'Morning Rush',
        cutscene: 'NYC sidewalks stretch before you.\nTaxis honk, hot dog carts sizzle.\nDodge the commuters!',
        bgStyle: 'streets',
        bgColors: { sky1: 0x6699cc, sky2: 0x88bbdd, ground1: 0x666666, ground2: 0x888888, accent: 0xffcc00 },
        enemies: [
          { name: 'Business Person', color: 0x333366 },
          { name: 'Delivery Bike', color: 0x44aa44 },
          { name: 'Puddle', color: 0x4488cc }
        ],
        questionsToProgress: 10,
        boss: {
          name: 'Karen the Crosswalk Blocker',
          questions: 8,
          color: 0xcc6699,
          size: 1.8,
          attack: 'blocks'
        }
      },
      {
        id: 2,
        name: 'Boutique Battle',
        cutscene: 'You burst into the fashion district!\nTrendy boutiques line the street.\nGrab those outfit pieces!',
        bgStyle: 'boutique',
        bgColors: { sky1: 0xffccdd, sky2: 0xffddee, ground1: 0xddaa88, ground2: 0xeecc99, accent: 0xff69b4 },
        enemies: [
          { name: 'Rival Fashionista', color: 0xff4488 },
          { name: 'Rolling Rack', color: 0xaaaaaa },
          { name: 'Mannequin', color: 0xeeddcc }
        ],
        questionsToProgress: 10,
        boss: {
          name: 'Veronica Vogue',
          questions: 8,
          color: 0xff1493,
          size: 1.8,
          attack: 'steals'
        }
      },
      {
        id: 3,
        name: 'Subway Sprint',
        cutscene: 'Outfit secured!\nNow get to the venue... fast!\nThe subway awaits...',
        bgStyle: 'subway',
        bgColors: { sky1: 0x2a2a2a, sky2: 0x3a3a3a, ground1: 0x444444, ground2: 0x555555, accent: 0xffaa00 },
        enemies: [
          { name: 'Turnstile', color: 0x888888 },
          { name: 'Street Performer', color: 0xff6600 },
          { name: 'Rat', color: 0x665544 }
        ],
        questionsToProgress: 12,
        boss: {
          name: 'DJ Delay the Subway Busker',
          questions: 10,
          color: 0xff8800,
          size: 2.0,
          attack: 'sound waves'
        }
      },
      {
        id: 4,
        name: 'Backstage Chaos',
        cutscene: 'You made it to the venue!\nBut backstage is mayhem!\nMakeup and cables everywhere!',
        bgStyle: 'backstage',
        bgColors: { sky1: 0x3a2a2a, sky2: 0x4a3a3a, ground1: 0x554444, ground2: 0x665555, accent: 0xff4488 },
        enemies: [
          { name: 'Makeup Artist', color: 0xff88aa },
          { name: 'Photographer', color: 0x444444 },
          { name: 'Tangled Cable', color: 0x222222 }
        ],
        questionsToProgress: 12,
        boss: {
          name: 'Mimi the Makeup Menace',
          questions: 10,
          color: 0xff66aa,
          size: 2.0,
          attack: 'powder puffs'
        }
      },
      {
        id: 5,
        name: 'The Grand Runway',
        cutscene: 'The curtain rises!\nLights flash, the crowd roars!\nThis is YOUR moment!',
        bgStyle: 'runway',
        bgColors: { sky1: 0x1a1a2a, sky2: 0x2a2a4a, ground1: 0xcc9966, ground2: 0xddaa77, accent: 0xffd700 },
        enemies: [
          { name: 'Paparazzi Flash', color: 0xffffaa },
          { name: 'Stage Hazard', color: 0xaa4444 },
          { name: 'Heckler', color: 0x664444 }
        ],
        questionsToProgress: 15,
        boss: {
          name: 'The Head Judge',
          questions: 12,
          color: 0xffd700,
          size: 2.2,
          attack: 'style challenge'
        }
      }
    ]
  }
};

window.Campaign = Campaign;
