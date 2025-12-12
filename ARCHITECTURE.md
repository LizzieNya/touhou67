# Touhou Game Engine - Architecture Documentation

## Overview

This document outlines the architecture of the Touhou Game Engine, designed to be a flexible, extensible platform for creating Touhou-style bullet hell games.

## Core Architecture

### Directory Structure

```
touhou67/
├── index.html              # Entry point
├── css/
│   └── style.css          # Global styles
├── js/
│   ├── main.js            # Application bootstrap
│   ├── core/              # Core engine systems
│   │   ├── Game.js        # Main game loop
│   │   ├── Renderer.js    # Rendering system
│   │   ├── Input.js       # Input handling
│   │   ├── SceneManager.js # Scene management
│   │   └── SoundManager.js # Audio system
│   ├── game/              # Game logic
│   │   ├── Player.js      # Player entity
│   │   ├── Enemy.js       # Enemy base class
│   │   ├── Boss.js        # Boss entity
│   │   ├── BulletManager.js      # Enemy bullets
│   │   ├── PlayerBulletManager.js # Player bullets
│   │   ├── ItemManager.js        # Item system
│   │   ├── CollisionSystem.js    # Collision detection
│   │   ├── PatternLibrary.js     # Bullet patterns
│   │   ├── ScriptEngine.js       # Stage scripting
│   │   ├── Background.js         # Background rendering
│   │   └── ParticleSystem.js     # Particle effects
│   ├── scenes/            # Game scenes
│   │   ├── TitleScene.js
│   │   ├── CharacterSelectScene.js
│   │   ├── BossSelectScene.js
│   │   └── GameScene.js
│   ├── stages/            # Stage definitions
│   │   ├── Stage1.js
│   │   ├── Stage2.js
│   │   ├── ...
│   │   ├── IndividualBossStages.js
│   │   └── BossRushStage.js
│   └── ui/                # UI components
│       ├── HUD.js
│       ├── DialogueManager.js
│       └── PauseMenu.js
└── assets/                # Game assets (future)
    ├── sprites/
    ├── sounds/
    └── music/
```

## System Components

### 1. Core Systems

#### Game (main.js)
- **Responsibility**: Main game loop, initialization, global state
- **Key Methods**:
  - `init()`: Initialize all systems
  - `gameLoop()`: Main update/render loop
  - `run()`: Start the game

#### Renderer
- **Responsibility**: Canvas rendering, drawing primitives
- **Key Methods**:
  - `clear()`: Clear canvas
  - `drawRect()`, `drawCircle()`: Primitives
  - `drawText()`: Text rendering
  - `drawSprite()`: Sprite rendering (placeholder)

#### Input
- **Responsibility**: Keyboard/gamepad input handling
- **Key Methods**:
  - `isDown(action)`: Check if action is pressed
  - `update()`: Update input state
  - **Actions**: UP, DOWN, LEFT, RIGHT, SHOOT, BOMB, FOCUS, PAUSE

#### SceneManager
- **Responsibility**: Scene lifecycle management
- **Key Methods**:
  - `changeScene(scene)`: Switch to new scene
  - `update(dt)`, `render(renderer)`: Delegate to current scene

#### SoundManager
- **Responsibility**: Audio playback (placeholder)
- **Key Methods**:
  - `playShoot()`, `playEnemyHit()`, `playEnemyDie()`: SFX
  - `playBGM(track)`: Background music

### 2. Game Logic

#### Player
- **Responsibility**: Player character logic
- **Properties**:
  - Position (x, y)
  - Lives, bombs, power
  - Speed (focused/unfocused)
  - Hitbox radius
- **Key Methods**:
  - `update(dt)`: Movement, shooting
  - `shoot()`: Spawn player bullets
  - `takeDamage()`: Handle death
  - `useBomb()`: Bomb activation

#### Enemy
- **Responsibility**: Base enemy class
- **Properties**:
  - Position, HP, radius
  - Pattern function
  - Color
- **Key Methods**:
  - `setPattern(func)`: Set behavior pattern
  - `update(dt)`: Execute pattern
  - `takeDamage(amount)`: Handle damage
  - `die()`: Death logic

#### Boss (extends Enemy)
- **Responsibility**: Boss entity with phases
- **Properties**:
  - Phases array
  - Current phase index
  - Invulnerability timer
  - Break timer
  - Spell card state
- **Key Methods**:
  - `addPhase(hp, duration, pattern, spellName)`: Define phase
  - `setPhase(index)`: Switch to phase
  - `start()`: Begin boss fight
  - `takeDamage(amount)`: Phase-aware damage

#### BulletManager
- **Responsibility**: Enemy bullet pooling and management
- **Properties**:
  - Bullet pool (array)
  - Pool size
- **Key Methods**:
  - `spawn(x, y, vx, vy, color, radius, ax, angularVel)`: Create bullet
  - `update(dt)`: Update all bullets
  - `render(renderer)`: Draw bullets
  - **Bullet Properties**: position, velocity, acceleration, angular velocity

#### PlayerBulletManager
- **Responsibility**: Player bullet pooling
- **Similar to BulletManager but for player bullets**

#### ItemManager
- **Responsibility**: Power-up and point item management
- **Item Types**: power, big_power, point
- **Key Methods**:
  - `spawn(x, y, type)`: Create item
  - `update(dt)`: Gravity, auto-collection
  - **Auto-collection**: Items move to player when near top of screen

#### CollisionSystem
- **Responsibility**: Collision detection
- **Key Methods**:
  - `checkCollisions(scene)`: Check all collision pairs
  - `circleCollision(a, b)`: Circle-circle collision
- **Collision Pairs**:
  - Player ↔ Enemy bullets
  - Player bullets ↔ Enemies
  - Player ↔ Items

#### PatternLibrary
- **Responsibility**: Reusable bullet patterns
- **Patterns**:
  - `aimed(scene, enemy, speed, color, radius)`: Single aimed bullet
  - `nWay(scene, x, y, n, angle, spread, speed, color, radius)`: N-way spread
  - `circle(scene, x, y, n, speed, color, radius, offset, accel)`: Circle pattern
  - `spiral(scene, x, y, t, speed, color, radius, arms, density)`: Spiral
  - `randomSpray(...)`: Random spray
  - `flower(...)`: Flower pattern
  - `whip(...)`: Whip/laser pattern
  - `aimedNWay(...)`: Aimed N-way
- **Difficulty Scaling**:
  - `getDifficultyMultiplier(scene)`: Speed multiplier
  - `getQuantityMultiplier(scene)`: Bullet count multiplier

#### ScriptEngine
- **Responsibility**: Execute stage scripts
- **Properties**:
  - Events array (time-based actions)
  - Current time
- **Key Methods**:
  - `loadScript(events)`: Load stage events
  - `update(dt)`: Execute events at specified times
  - **Event Format**: `{ time: number, action: (scene) => void }`

### 3. Scenes

#### TitleScene
- **Responsibility**: Main menu
- **Options**: Start Game, Extra Start, Boss Select, Practice, etc.

#### CharacterSelectScene
- **Responsibility**: Character and difficulty selection
- **States**: SELECT_CHAR → SELECT_SHOT → SELECT_DIFF
- **Characters**: Reimu, Marisa
- **Shot Types**: A, B
- **Difficulties**: Easy, Normal, Hard, Lunatic

#### BossSelectScene
- **Responsibility**: Boss practice mode
- **Bosses**: All implemented bosses from various Touhou games

#### GameScene
- **Responsibility**: Main gameplay
- **Components**:
  - Player, enemies, bullets, items
  - Background, particles, HUD
  - Dialogue, pause menu
  - Script engine
- **Key Methods**:
  - `loadStageScript(stage)`: Load stage events
  - `nextStage()`: Progress to next stage
  - `triggerBomb()`: Clear bullets, damage enemies

### 4. UI Components

#### HUD
- **Responsibility**: Display game stats
- **Elements**: Lives, bombs, power, score, graze, FPS

#### DialogueManager
- **Responsibility**: Character dialogue
- **Features**: Character portraits, text display, auto-advance

#### PauseMenu
- **Responsibility**: Pause functionality
- **Options**: Resume, Restart, Quit

## Data Flow

### Game Loop
```
Game.gameLoop()
  ↓
SceneManager.update(dt)
  ↓
CurrentScene.update(dt)
  ↓
[Player, Enemies, Bullets, Items, etc.].update(dt)
  ↓
CollisionSystem.checkCollisions()
  ↓
SceneManager.render(renderer)
  ↓
CurrentScene.render(renderer)
  ↓
[All entities].render(renderer)
```

### Stage Script Execution
```
GameScene.loadStageScript(stageNumber)
  ↓
ScriptEngine.loadScript(events)
  ↓
ScriptEngine.update(dt) [each frame]
  ↓
Execute events where event.time <= currentTime
  ↓
event.action(scene) - Spawn enemies, bosses, dialogue
```

### Boss Fight Flow
```
Stage Script spawns Boss
  ↓
Boss.start() → Boss.setPhase(0)
  ↓
Boss.update(dt) executes current phase pattern
  ↓
Player damages boss → Boss.takeDamage()
  ↓
HP reaches 0 or timer expires
  ↓
Boss.breakTimer starts (2s)
  ↓
Bullets cleared, items spawned
  ↓
Boss.setPhase(nextPhase)
  ↓
Repeat until all phases complete
  ↓
Boss.die() - Final death, drop items
```

## Extension Points

### Adding New Bosses
1. Create boss event in `IndividualBossStages.js` using `createBossStage()`
2. Define phases with HP, duration, pattern function, spell name
3. Export boss events
4. Import in `GameScene.js` and add to switch statement
5. Add to `BossSelectScene.js` bosses array

### Adding New Patterns
1. Add function to `PatternLibrary.js`
2. Use `scene.bulletManager.spawn()` to create bullets
3. Apply difficulty multipliers for speed/quantity
4. Document pattern parameters

### Adding New Characters
1. Add character to `CharacterSelectScene.js` characters array
2. Implement shot pattern in `Player.js` (e.g., `shootCharacter()`)
3. Add character-specific dialogue in stage scripts
4. Add character rendering in `Player.render()`

### Adding New Stages
1. Create `StageX.js` in `stages/` directory
2. Export `StageXEvents` function that returns event array
3. Import in `GameScene.js`
4. Add case to `loadStageScript()` switch

## Performance Considerations

### Object Pooling
- Bullets use object pooling (reuse inactive bullets)
- Pool size: 5000 bullets
- Prevents garbage collection during gameplay

### Collision Optimization
- Simple circle-circle collision
- Early exit for inactive entities
- **Future**: Spatial partitioning (quadtree)

### Rendering
- Canvas 2D API (current)
- **Future**: WebGL for hardware acceleration

## Configuration

### Difficulty Multipliers
- **Easy**: 0.8x speed, 0.5x quantity
- **Normal**: 1.0x speed, 0.8x quantity
- **Hard**: 1.2x speed, 1.0x quantity
- **Lunatic**: 1.5x speed, 1.2x quantity

### Player Stats
- **Max Power**: 200
- **Shot Levels**: 20, 60, 100, 200
- **Speed**: 300 (unfocused), 150 (focused)
- **Hitbox**: 2px radius
- **Starting Lives**: 3
- **Starting Bombs**: 3

### Boss Stats
- **Invulnerability**: 0.5s at phase start
- **Break Time**: 2.0s between phases
- **HP**: Varies by phase (300-3000)

## Future Architecture Plans

### Plugin System
```javascript
// Example plugin structure
class PatternPlugin {
  name = "CustomPatterns";
  version = "1.0.0";
  
  onLoad(engine) {
    engine.patternLibrary.register("myPattern", this.myPattern);
  }
  
  myPattern(scene, x, y, params) {
    // Pattern implementation
  }
}
```

### Event Bus
```javascript
// Centralized event system
eventBus.on("boss.phaseChange", (boss, phase) => {
  // React to phase changes
});

eventBus.emit("player.death", player);
```

### Resource Manager
```javascript
// Unified asset loading
await resourceManager.load({
  sprites: ["player.png", "boss1.png"],
  sounds: ["shoot.wav", "explosion.wav"],
  music: ["stage1.mp3"]
});
```

---

**Last Updated**: 2025-11-27
**Version**: 0.5
