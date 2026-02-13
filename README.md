# 500 A.D. - Byzantine Empire Strategy Game

A mobile-optimized turn-based strategy game set in the Byzantine Empire (Eastern Roman Empire) from 500-1453 AD.

## Overview

Command legendary Byzantine emperors and generals through pivotal moments in Eastern Roman history. Build armies, manage resources, and lead your forces to victory in historically accurate campaigns.

## Features

### Historical Accuracy
- **12 Playable Leaders**: From Justinian I to Constantine XI Palaiologos
- **15+ Military Units**: Historically accurate Byzantine forces including Cataphracts, Varangian Guard, and Greek Fire
- **Three Historical Eras**: Early (500-717), Middle (717-1025), and Late (1025-1453) Byzantine periods
- **Authentic Leaders**: Each with unique abilities based on historical achievements

### Gameplay
- **Turn-Based Strategy**: Tactical combat with resource management
- **Unit Progression**: Experience and leveling system
- **Combat System**: Type advantages, terrain modifiers, and morale
- **Resource Management**: Gold, manpower, and prestige
- **Save/Load System**: Multiple save slots with auto-save

### Mobile Optimized
- **Touch Controls**: Tap to select, drag to move
- **Responsive Design**: Works on phones and tablets
- **Performance Optimized**: Smooth gameplay on mobile devices
- **Portrait & Landscape**: Supports both orientations

## How to Play

### Starting the Game
1. Open `index.html` in a web browser
2. Select "New Campaign" from the main menu
3. Choose your era (Early, Middle, or Late Byzantine)
4. Select a leader
5. Begin your campaign!

### Controls
- **Tap/Click**: Select units or tiles
- **Tap Unit**: View unit details
- **Tap Empty Tile**: Move selected unit
- **End Turn Button**: Complete your turn and generate resources

### Resources
- **Gold** 💰: Used to recruit units and construct buildings
- **Manpower** 👥: Required to recruit military units
- **Prestige** ⭐: Earned through victories and achievements

### Combat
- Units have different strengths against infantry, cavalry, or buildings
- Terrain provides defensive bonuses
- Morale affects combat effectiveness
- Units gain experience and level up

## Byzantine Leaders

### Early Byzantine (500-717 AD)
- **Justinian I "The Great"**: Reconquest specialist, +20% siege damage
- **Belisarius**: Legendary general, +30% cavalry power
- **Narses**: Infantry master, +25% infantry defense
- **Heraclius**: Reformer, +20% manpower regeneration

### Middle Byzantine (717-1025 AD)
- **Leo III "The Isaurian"**: Fortification expert, +40% defense
- **Basil II "Bulgar-Slayer"**: Relentless conqueror, +25% attack
- **Nikephoros II Phokas**: Heavy cavalry master, +35% cataphract power
- **John I Tzimiskes**: Rapid deployment, +40% movement speed

### Late Byzantine (1025-1453 AD)
- **Alexios I Komnenos**: Diplomatic genius, -30% mercenary costs
- **Manuel I Komnenos**: Naval supremacy, +40% naval power
- **Constantine XI Palaiologos**: Heroic defender, +50% defense when outnumbered
- **Michael VIII Palaiologos**: Reconqueror, +25% when recapturing territories

## Military Units

### Infantry
- **Skutatoi**: Heavy infantry with large shields
- **Psilos**: Light skirmishers
- **Byzantine Archers**: Composite bow specialists
- **Varangian Guard**: Elite Norse axe warriors

### Cavalry
- **Cataphracts**: Super-heavy armored cavalry (signature unit)
- **Klibanophoroi**: Ultra-heavy cavalry
- **Kavallarioi**: Medium cavalry backbone
- **Horse Archers**: Light cavalry with bows
- **Tagmata**: Elite professional cavalry

### Special Units
- **Greek Fire Siphon**: Devastating incendiary weapon
- **Siege Engineers**: Fortification specialists
- **Orthodox Priests**: Morale and healing support

## Technical Details

### Technologies Used
- HTML5 Canvas for map rendering
- Vanilla JavaScript (no frameworks)
- CSS3 with Byzantine-themed design
- LocalStorage for save/load
- Web Audio API for sound

### File Structure
```
500ad/
├── index.html          # Main entry point
├── css/                # Stylesheets
│   ├── main.css       # Core design system
│   ├── ui.css         # UI components
│   └── mobile.css     # Mobile optimizations
├── js/                 # Game logic
│   ├── game.js        # Main controller
│   ├── state.js       # State management
│   ├── leaders.js     # Leader data
│   ├── units.js       # Unit data
│   ├── combat.js      # Combat system
│   ├── map.js         # Map rendering
│   ├── ui.js          # UI controller
│   ├── audio.js       # Audio manager
│   └── storage.js     # Save/load system
└── assets/            # Graphics and audio
    ├── images/
    └── audio/
```

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (Chrome, Firefox, Safari)

## Running Locally

### Simple Method
1. Open `index.html` directly in your browser

### With Local Server (Recommended)
```bash
cd 500ad
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser

### On Mobile Device
1. Start local server on your computer
2. Find your computer's local IP address
3. On mobile, navigate to `http://[YOUR_IP]:8000`

## Development

### Adding New Leaders
Edit `js/leaders.js` and add leader data following the existing format.

### Adding New Units
Edit `js/units.js` and add unit types with stats and bonuses.

### Customizing Appearance
Modify CSS variables in `css/main.css` to change colors and styling.

## Historical Notes

The Byzantine Empire, also known as the Eastern Roman Empire, lasted from 330 AD (founding of Constantinople) to 1453 AD (Fall of Constantinople). This game focuses on the period from 500-1453 AD, covering:

- **Justinian's Reconquest** (527-565): Attempt to restore the Roman Empire
- **Arab Invasions** (7th-8th centuries): Defense against Islamic expansion
- **Macedonian Renaissance** (9th-11th centuries): Byzantine golden age
- **Crusades** (11th-13th centuries): Complex relations with Western Europe
- **Ottoman Conquest** (14th-15th centuries): Final struggle for survival

All leaders, units, and historical events are based on actual Byzantine history.

## Credits

- **Game Design & Development**: AI-assisted development
- **Historical Research**: Based on Byzantine military history
- **Art Style**: Byzantine mosaic and icon art inspiration
- **Leader Portraits**: AI-generated historical artwork

## Version

**Version 1.0.0** - Initial Release

## License

This is a historical educational game. All historical figures and events are in the public domain.

---

**For the Glory of Constantinople! ⚔️👑**
