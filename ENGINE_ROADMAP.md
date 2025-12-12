# Touhou Game Engine - Development Roadmap

## Current State (v0.5 - Prototype)
The engine currently supports:
- ✅ Basic bullet hell mechanics
- ✅ Player movement and shooting (Reimu, Marisa)
- ✅ Boss system with phases and spell cards
- ✅ Pattern library for bullet patterns
- ✅ Collision detection
- ✅ Item system (power, points)
- ✅ Dialogue system
- ✅ Boss Select mode
- ✅ 10 playable bosses (Touhou 6-12 characters)
- ✅ Difficulty scaling
- ✅ HUD and UI

## Phase 1: Core Engine Refinement (v1.0)

### 1.1 Architecture Improvements
- [ ] **Plugin System**: Create a modular plugin architecture for custom patterns, bosses, and stages
- [ ] **Event Bus**: Implement a centralized event system for better component communication
- [ ] **Resource Manager**: Unified asset loading and caching system
- [ ] **Configuration System**: JSON-based configuration for game settings, difficulty, and balance

### 1.2 Enhanced Bullet System
- [ ] **Bullet Types**: Add more bullet types (lasers, rice, kunai, scales, etc.)
- [ ] **Bullet Behaviors**: Implement acceleration, deceleration, homing, bouncing
- [ ] **Bullet Transformations**: Support for bullets that change mid-flight
- [ ] **Grazebox System**: Separate hitbox and grazebox for accurate grazing
- [ ] **Bullet Cancellation Effects**: Visual effects when bullets are cleared

### 1.3 Advanced Pattern Library
- [ ] **Pattern Editor**: Visual tool for creating and testing bullet patterns
- [ ] **Pattern Templates**: Pre-built templates for common Touhou patterns
- [ ] **Pattern Scripting**: DSL or JSON format for defining patterns
- [ ] **Pattern Difficulty Scaling**: Automatic pattern adjustment based on difficulty
- [ ] **Pattern Validation**: Check patterns for fairness and playability

### 1.4 Boss System Enhancements
- [ ] **Boss AI Framework**: Pluggable AI system for boss movement
- [ ] **Spell Card Bonuses**: Implement spell card capture bonuses
- [ ] **Timeout System**: Proper spell card timeout mechanics
- [ ] **Boss Dialogue Integration**: Pre-battle and mid-battle dialogue
- [ ] **Boss Animation System**: Support for boss sprites and animations

## Phase 2: Content Creation Tools (v1.5)

### 2.1 Stage Editor
- [ ] **Visual Stage Builder**: Drag-and-drop interface for stage creation
- [ ] **Timeline Editor**: Visual timeline for enemy spawns and events
- [ ] **Background Editor**: Tool for creating scrolling backgrounds
- [ ] **Stage Scripting**: Lua or JavaScript-based stage scripting
- [ ] **Stage Testing**: In-editor playtest functionality

### 2.2 Character System
- [ ] **Character Definition Format**: JSON/YAML format for character data
- [ ] **Shot Type System**: Flexible shot type definition
- [ ] **Bomb System**: Customizable bomb mechanics per character
- [ ] **Character Sprites**: Support for character sprite sheets
- [ ] **Character Dialogue**: Character-specific dialogue trees

### 2.3 Asset Pipeline
- [ ] **Sprite Sheet Manager**: Tool for managing sprite sheets
- [ ] **Sound Manager**: Audio asset organization and playback
- [ ] **Music System**: BGM management with looping support
- [ ] **Asset Bundling**: Bundle assets for distribution
- [ ] **Asset Hot Reload**: Live reload during development

## Phase 3: Advanced Features (v2.0)

### 3.1 Replay System
- [ ] **Replay Recording**: Record player inputs and RNG seed
- [ ] **Replay Playback**: Play back recorded replays
- [ ] **Replay Validation**: Verify replay integrity
- [ ] **Replay Sharing**: Export/import replay files
- [ ] **Replay Analysis**: Statistics and visualization

### 3.2 Scoring System
- [ ] **Graze Counter**: Track and reward bullet grazing
- [ ] **Point of Collection**: POC line mechanics
- [ ] **Score Multipliers**: Chain and combo systems
- [ ] **High Score Table**: Local and online leaderboards
- [ ] **Score Breakdown**: Detailed score analysis

### 3.3 Practice Mode
- [ ] **Stage Practice**: Practice individual stages
- [ ] **Spell Practice**: Practice individual spell cards
- [ ] **Starting Resources**: Configure starting lives/bombs/power
- [ ] **Spell Card Library**: View all spell cards
- [ ] **Practice Statistics**: Track practice performance

### 3.4 Extra Features
- [ ] **Achievement System**: Unlockable achievements
- [ ] **Music Room**: Listen to game music
- [ ] **Gallery**: View unlocked artwork
- [ ] **Options Menu**: Comprehensive settings
- [ ] **Controller Support**: Gamepad input support

## Phase 4: Modding & Community (v2.5)

### 4.1 Modding Framework
- [ ] **Mod Loader**: Load custom mods and content
- [ ] **Mod API**: Comprehensive API for modders
- [ ] **Mod Documentation**: Detailed modding guide
- [ ] **Mod Manager**: In-game mod management
- [ ] **Mod Compatibility**: Version checking and compatibility

### 4.2 Scripting System
- [ ] **Lua Integration**: Embed Lua for scripting
- [ ] **Script API**: Expose engine functions to scripts
- [ ] **Script Editor**: In-engine script editor
- [ ] **Script Debugging**: Debug tools for scripts
- [ ] **Script Examples**: Sample scripts and tutorials

### 4.3 Community Features
- [ ] **Online Leaderboards**: Global score tracking
- [ ] **Replay Sharing**: Upload/download replays
- [ ] **Mod Repository**: Browse and download mods
- [ ] **Community Hub**: In-game community features
- [ ] **Update System**: Automatic updates

## Phase 5: Performance & Polish (v3.0)

### 5.1 Optimization
- [ ] **Object Pooling**: Optimize bullet and particle pooling
- [ ] **Spatial Partitioning**: Improve collision detection performance
- [ ] **WebGL Renderer**: Hardware-accelerated rendering
- [ ] **Web Workers**: Offload computation to workers
- [ ] **Asset Compression**: Reduce asset sizes

### 5.2 Visual Enhancements
- [ ] **Particle Effects**: Rich particle system
- [ ] **Shader Effects**: Custom shaders for effects
- [ ] **Screen Shake**: Dynamic camera effects
- [ ] **Bullet Trails**: Visual bullet trails
- [ ] **UI Animations**: Polished UI transitions

### 5.3 Audio System
- [ ] **3D Audio**: Positional audio
- [ ] **Audio Mixing**: Dynamic audio mixing
- [ ] **Sound Effects**: Comprehensive SFX library
- [ ] **Music Transitions**: Smooth music transitions
- [ ] **Audio Settings**: Volume controls and mixing

## Technical Debt & Refactoring

### High Priority
- [ ] Remove duplicate `update()` and `render()` methods in Boss.js
- [ ] Standardize event timing in stage scripts
- [ ] Implement proper state management
- [ ] Add comprehensive error handling
- [ ] Create unit tests for core systems

### Medium Priority
- [ ] Refactor PatternLibrary to use classes
- [ ] Standardize coordinate system
- [ ] Improve code documentation
- [ ] Add TypeScript definitions
- [ ] Implement proper logging system

### Low Priority
- [ ] Code style consistency
- [ ] Performance profiling
- [ ] Memory leak detection
- [ ] Browser compatibility testing
- [ ] Mobile optimization

## Documentation Needs

### Developer Documentation
- [ ] Architecture overview
- [ ] API reference
- [ ] Pattern creation guide
- [ ] Boss creation guide
- [ ] Stage creation guide
- [ ] Modding guide

### User Documentation
- [ ] Installation guide
- [ ] Controls reference
- [ ] Gameplay guide
- [ ] FAQ
- [ ] Troubleshooting

## Success Metrics

### v1.0 Goals
- Support for 20+ bosses
- 6 complete stages
- 4 playable characters
- Stable 60 FPS
- < 100ms input latency

### v2.0 Goals
- Full replay system
- Practice mode
- 50+ spell cards
- Mod support
- Community features

### v3.0 Goals
- 100+ bosses (community created)
- 20+ stages
- 10+ characters
- Active modding community
- 1000+ registered users

## Next Immediate Steps

1. **Fix Technical Debt**: Remove duplicate methods, standardize code
2. **Create Plugin System**: Enable easy content addition
3. **Build Pattern Editor**: Visual tool for pattern creation
4. **Implement Replay System**: Foundation for competitive play
5. **Write Documentation**: Enable community contributions

---

**Last Updated**: 2025-11-27
**Current Version**: v0.5 (Prototype)
**Target Version**: v3.0 (Full Engine)
**Estimated Timeline**: 12-18 months
