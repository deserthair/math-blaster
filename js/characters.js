/**
 * Character definitions for both themes
 * Each character has a mana color, resource name, and 5 abilities (1-5 cost)
 * Key 'e' at 6 mana = extra life
 */
const Characters = {
  mtg: [
    {
      id: 'wizard',
      name: 'Wizard',
      manaColor: 'Black',
      manaHex: 0x6b2fa0,
      abilities: [
        { name: 'Shadow Bolt', cost: 1, key: 'A' },
        { name: 'Dark Pact', cost: 2, key: 'S' },
        { name: 'Soul Drain', cost: 3, key: 'D' },
        { name: 'Necrotic Wave', cost: 4, key: 'F' },
        { name: "Death's Embrace", cost: 5, key: 'W' }
      ]
    },
    {
      id: 'vampire',
      name: 'Vampire',
      manaColor: 'Red',
      manaHex: 0xcc2222,
      abilities: [
        { name: 'Blood Fang', cost: 1, key: 'A' },
        { name: 'Crimson Slash', cost: 2, key: 'S' },
        { name: 'Bloodlust', cost: 3, key: 'D' },
        { name: 'Inferno Bite', cost: 4, key: 'F' },
        { name: 'Blood Moon', cost: 5, key: 'W' }
      ]
    },
    {
      id: 'human',
      name: 'Human',
      manaColor: 'White',
      manaHex: 0xeeeecc,
      abilities: [
        { name: 'Holy Light', cost: 1, key: 'A' },
        { name: 'Shield Bash', cost: 2, key: 'S' },
        { name: 'Radiant Heal', cost: 3, key: 'D' },
        { name: 'Smite', cost: 4, key: 'F' },
        { name: 'Divine Wrath', cost: 5, key: 'W' }
      ]
    },
    {
      id: 'turtle',
      name: 'Turtle',
      manaColor: 'Green',
      manaHex: 0x22aa44,
      abilities: [
        { name: 'Vine Whip', cost: 1, key: 'A' },
        { name: 'Shell Guard', cost: 2, key: 'S' },
        { name: "Nature's Fury", cost: 3, key: 'D' },
        { name: 'Earthquake', cost: 4, key: 'F' },
        { name: "Gaia's Wrath", cost: 5, key: 'W' }
      ]
    },
    {
      id: 'merfolk',
      name: 'Merfolk',
      manaColor: 'Blue',
      manaHex: 0x2266cc,
      abilities: [
        { name: 'Tidal Splash', cost: 1, key: 'A' },
        { name: 'Frost Bolt', cost: 2, key: 'S' },
        { name: 'Mind Warp', cost: 3, key: 'D' },
        { name: 'Tsunami', cost: 4, key: 'F' },
        { name: 'Time Rift', cost: 5, key: 'W' }
      ]
    }
  ],
  fashion: [
    {
      id: 'heels',
      name: 'High Heels',
      manaColor: 'Heels',
      manaHex: 0xff1493,
      abilities: [
        { name: 'Stiletto Kick', cost: 1, key: 'A' },
        { name: 'Heel Stomp', cost: 2, key: 'S' },
        { name: 'Runway Strut', cost: 3, key: 'D' },
        { name: 'Power Walk', cost: 4, key: 'F' },
        { name: 'Heel Drop', cost: 5, key: 'W' }
      ]
    },
    {
      id: 'lipstick',
      name: 'Lipstick',
      manaColor: 'Glam',
      manaHex: 0xcc0044,
      abilities: [
        { name: 'Lip Smack', cost: 1, key: 'A' },
        { name: 'Kiss Mark', cost: 2, key: 'S' },
        { name: 'Gloss Shield', cost: 3, key: 'D' },
        { name: 'Color Pop', cost: 4, key: 'F' },
        { name: 'Glamour Blast', cost: 5, key: 'W' }
      ]
    },
    {
      id: 'hairspray',
      name: 'Hair Spray',
      manaColor: 'Volume',
      manaHex: 0xffaa00,
      abilities: [
        { name: 'Spritz', cost: 1, key: 'A' },
        { name: 'Volume Boost', cost: 2, key: 'S' },
        { name: 'Style Lock', cost: 3, key: 'D' },
        { name: 'Spray Cloud', cost: 4, key: 'F' },
        { name: 'Hurricane Style', cost: 5, key: 'W' }
      ]
    },
    {
      id: 'nailpolish',
      name: 'Nail Polish',
      manaColor: 'Polish',
      manaHex: 0xff66aa,
      abilities: [
        { name: 'Quick Coat', cost: 1, key: 'A' },
        { name: 'Color Splash', cost: 2, key: 'S' },
        { name: 'Lacquer Shield', cost: 3, key: 'D' },
        { name: 'Nail Art', cost: 4, key: 'F' },
        { name: 'Manicure Storm', cost: 5, key: 'W' }
      ]
    },
    {
      id: 'eyeliner',
      name: 'Eye Liner',
      manaColor: 'Fierce',
      manaHex: 0x333333,
      abilities: [
        { name: 'Quick Line', cost: 1, key: 'A' },
        { name: 'Cat Eye', cost: 2, key: 'S' },
        { name: 'Smokey Eye', cost: 3, key: 'D' },
        { name: 'Eye Shadow', cost: 4, key: 'F' },
        { name: 'Fierce Gaze', cost: 5, key: 'W' }
      ]
    }
  ]
};

window.Characters = Characters;
