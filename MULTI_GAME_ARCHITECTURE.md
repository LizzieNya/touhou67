# Touhou Game Engine - Multi-Game Architecture

## Overview
This document explains how to use the Touhou Game Engine to create multiple games from the same codebase.

## Directory Structure for Multi-Game Support

```
touhou-engine/
├── engine/                    # Core engine (shared across all games)
│   ├── core/                 # Core systems
│   │   ├── Game.js
│   │   ├── Renderer.js
│   │   ├── Input.js
│   │   ├── SceneManager.js
│   │   └── SoundManager.js
│   ├── entities/             # Base entity classes
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── Boss.js
│   │   └── Bullet.js
│   ├── managers/             # System managers
│   │   ├── BulletManager.js
│   │   ├── ItemManager.js
│   │   ├── CollisionSystem.js
│   │   └── ScriptEngine.js
│   ├── patterns/             # Pattern library
│   │   └── PatternLibrary.js
│   ├── scenes/               # Base scene classes
│   │   ├── BaseScene.js
│   │   ├── BaseTitleScene.js
│   │   ├── BaseGameScene.js
│   │   └── BaseCharacterSelect.js
│   └── ui/                   # UI components
│       ├── HUD.js
│       ├── DialogueManager.js
│       └── PauseMenu.js
│
├── games/                     # Individual games
│   ├── touhou6/              # Embodiment of Scarlet Devil
│   │   ├── index.html
│   │   ├── game.json         # Game configuration
│   │   ├── characters/       # Character definitions
│   │   │   ├── reimu.json
│   │   │   └── marisa.json
│   │   ├── stages/           # Stage scripts
│   │   │   ├── stage1.js
│   │   │   ├── stage2.js
│   │   │   └── ...
│   │   ├── bosses/           # Boss definitions
│   │   │   ├── rumia.js
│   │   │   ├── cirno.js
│   │   │   └── ...
│   │   ├── assets/           # Game-specific assets
│   │   │   ├── sprites/
│   │   │   ├── sounds/
│   │   │   └── music/
│   │   └── scenes/           # Custom scenes
│   │       └── TitleScene.js
│   │
│   ├── touhou7/              # Perfect Cherry Blossom
│   │   ├── index.html
│   │   ├── game.json
│   │   ├── characters/
│   │   ├── stages/
│   │   ├── bosses/
│   │   └── assets/
│   │
│   └── custom-game/          # Your custom game
│       ├── index.html
│       ├── game.json
│       ├── characters/
│       ├── stages/
│       ├── bosses/
│       └── assets/
│
└── tools/                     # Development tools
    ├── pattern-editor/
    ├── stage-editor/
    └── sprite-editor/
```

## Creating a New Game

### Step 1: Create Game Configuration

Create `games/my-game/game.json`:

```json
{
  "name": "My Touhou Game",
  "version": "1.0.0",
  "engine": "touhou-engine@1.0.0",
  "settings": {
    "width": 640,
    "height": 480,
    "fps": 60,
    "difficulties": ["Easy", "Normal", "Hard", "Lunatic"]
  },
  "characters": [
    {
      "id": "reimu",
      "name": "Reimu Hakurei",
      "file": "./characters/reimu.json"
    },
    {
      "id": "marisa",
      "name": "Marisa Kirisame",
      "file": "./characters/marisa.json"
    }
  ],
  "stages": [
    {
      "id": 1,
      "name": "Stage 1",
      "file": "./stages/stage1.js"
    }
  ],
  "bosses": [
    {
      "id": "boss1",
      "name": "First Boss",
      "file": "./bosses/boss1.js"
    }
  ]
}
```

### Step 2: Define Characters

Create `games/my-game/characters/reimu.json`:

```json
{
  "id": "reimu",
  "name": "Reimu Hakurei",
  "title": "Shrine Maiden of Paradise",
  "shotTypes": [
    {
      "id": "A",
      "name": "Homing Amulet",
      "description": "Spirit Sign (Homing Amulets)",
      "pattern": "reimuShotA"
    },
    {
      "id": "B",
      "name": "Persuasion Needle",
      "description": "Dream Sign (Persuasion Needle)",
      "pattern": "reimuShotB"
    }
  ],
  "bomb": {
    "name": "Fantasy Seal",
    "damage": 100,
    "duration": 3.0
  },
  "stats": {
    "speed": {
      "normal": 300,
      "focused": 150
    },
    "hitbox": 2
  },
  "sprite": "./assets/sprites/reimu.png"
}
```

### Step 3: Create Boss Definitions

Create `games/my-game/bosses/boss1.js`:

```javascript
import { BossDefinition } from '../../../engine/entities/BossDefinition.js';
import { PatternLibrary } from '../../../engine/patterns/PatternLibrary.js';

export default class Boss1 extends BossDefinition {
    constructor() {
        super({
            name: "Boss Name",
            phases: [
                {
                    hp: 800,
                    duration: 40,
                    pattern: this.phase1.bind(this)
                },
                {
                    hp: 1200,
                    duration: 60,
                    spellName: "Spell Card Name",
                    pattern: this.phase2.bind(this)
                }
            ]
        });
    }

    phase1(enemy, dt, t, scene) {
        enemy.x = scene.game.width / 2;
        enemy.y = 100;
        
        if (Math.floor(t * 60) % 30 === 0) {
            PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 200, '#f00', 4);
        }
    }

    phase2(enemy, dt, t, scene) {
        enemy.x = scene.game.width / 2 + Math.sin(t) * 50;
        enemy.y = 100;
        
        if (Math.floor(t * 60) % 10 === 0) {
            PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 250, '#f00', 4, 3, 4);
        }
    }
}
```

### Step 4: Create Stage Scripts

Create `games/my-game/stages/stage1.js`:

```javascript
import { StageDefinition } from '../../../engine/stages/StageDefinition.js';
import Boss1 from '../bosses/boss1.js';

export default class Stage1 extends StageDefinition {
    constructor(character) {
        super({
            name: "Stage 1",
            bgm: "./assets/music/stage1.mp3"
        });
        
        this.character = character;
    }

    getEvents() {
        return [
            {
                time: 2.0,
                action: (scene) => {
                    // Spawn enemies
                    this.spawnEnemyWave(scene, 5);
                }
            },
            {
                time: 30.0,
                action: (scene) => {
                    // Spawn boss
                    const boss = new Boss1();
                    boss.spawn(scene);
                }
            }
        ];
    }
}
```

### Step 5: Create Entry Point

Create `games/my-game/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Touhou Game</title>
    <link rel="stylesheet" href="../../engine/css/style.css">
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <div id="sidebar">
        <div id="hud"></div>
    </div>
    
    <script type="module">
        import { GameEngine } from '../../engine/core/GameEngine.js';
        
        // Load game configuration
        const config = await fetch('./game.json').then(r => r.json());
        
        // Initialize engine with game config
        const game = new GameEngine(config);
        await game.init();
        game.run();
    </script>
</body>
</html>
```

## Engine API

### Core Classes

#### GameEngine
```javascript
class GameEngine {
    constructor(config) { }
    async init() { }
    run() { }
    loadGame(gameConfig) { }
}
```

#### BossDefinition
```javascript
class BossDefinition {
    constructor(config) {
        this.name = config.name;
        this.phases = config.phases;
    }
    
    spawn(scene) {
        // Create boss entity
    }
}
```

#### StageDefinition
```javascript
class StageDefinition {
    constructor(config) {
        this.name = config.name;
        this.bgm = config.bgm;
    }
    
    getEvents() {
        // Return stage events
    }
}
```

## Pattern Library API

All patterns are available through `PatternLibrary`:

```javascript
// Aimed bullet
PatternLibrary.aimed(scene, enemy, speed, color, radius);

// N-way spread
PatternLibrary.nWay(scene, x, y, count, angle, spread, speed, color, radius);

// Circle pattern
PatternLibrary.circle(scene, x, y, count, speed, color, radius, offset, accel);

// Spiral
PatternLibrary.spiral(scene, x, y, time, speed, color, radius, arms, density);

// Random spray
PatternLibrary.randomSpray(scene, x, y, count, minAngle, maxAngle, minSpeed, maxSpeed, color, radius);

// Custom pattern
PatternLibrary.register('myPattern', (scene, params) => {
    // Your pattern logic
});
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Engine code is separate from game content
- Easy to update engine without breaking games
- Multiple games can share the same engine

### 2. **Reusability**
- Create multiple games without duplicating code
- Share patterns, systems, and utilities
- Build a library of reusable bosses and stages

### 3. **Maintainability**
- Update engine features in one place
- Bug fixes apply to all games
- Clear organization of code

### 4. **Modularity**
- Games are self-contained
- Easy to add/remove games
- Can version games independently

### 5. **Extensibility**
- Easy to add new features to engine
- Games can override engine behavior
- Plugin system for custom functionality

## Migration Path

To migrate your current game to this structure:

1. **Phase 1**: Extract core engine code
   - Move core systems to `engine/core/`
   - Move base classes to `engine/entities/`
   - Move managers to `engine/managers/`

2. **Phase 2**: Create game structure
   - Create `games/touhou6/` directory
   - Move game-specific code to game directory
   - Create `game.json` configuration

3. **Phase 3**: Implement game loader
   - Create `GameEngine` class
   - Implement configuration loading
   - Add dynamic asset loading

4. **Phase 4**: Add tooling
   - Create pattern editor
   - Create stage editor
   - Add build system

## Next Steps

1. Review the current codebase
2. Identify engine vs game code
3. Create directory structure
4. Extract engine components
5. Create first game package
6. Test and iterate

---

**This architecture will allow you to:**
- Create unlimited games using the same engine
- Share code between games
- Maintain a single engine codebase
- Build a library of reusable content
- Distribute games independently
