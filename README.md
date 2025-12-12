# Touhou Game Engine

A flexible, extensible JavaScript-based engine for creating Touhou-style bullet hell games.

## 🎮 Features

- **Full Bullet Hell Mechanics**: Precise hitboxes, grazing, bullet patterns
- **Boss System**: Multi-phase bosses with spell cards
- **Pattern Library**: Reusable bullet patterns (spiral, circle, aimed, etc.)
- **Multiple Characters**: Reimu, Marisa with unique shot types
- **Difficulty Scaling**: Easy, Normal, Hard, Lunatic
- **Boss Select Mode**: Practice against 10+ bosses
- **Stage System**: Scriptable stage events and enemy waves
- **Dialogue System**: Character interactions and story
- **Item System**: Power-ups, point items, auto-collection
- **Visual Effects**: Particles, spell card circles, break effects

## 🚀 Quick Start

### Play Now
1. Clone this repository
2. Open `index.html` in a modern web browser
3. No build step required!

### Controls
- **Arrow Keys**: Move
- **Z**: Shoot
- **X**: Bomb
- **Shift**: Focus (slow movement)
- **Escape**: Pause

## 📁 Project Structure

```
touhou67/
├── index.html              # Entry point
├── js/
│   ├── main.js            # Game initialization
│   ├── core/              # Core engine (Game, Renderer, Input, etc.)
│   ├── game/              # Game logic (Player, Boss, Bullets, etc.)
│   ├── scenes/            # Game scenes (Title, CharSelect, Game, etc.)
│   ├── stages/            # Stage definitions
│   └── ui/                # UI components (HUD, Dialogue, Pause)
└── css/
    └── style.css          # Styling
```

## 🎯 Current Status (v0.5)

### Implemented
- ✅ Core game loop and rendering
- ✅ Player movement and shooting
- ✅ Boss system with phases
- ✅ 10 playable bosses (Touhou 6-12 characters)
- ✅ Pattern library with 10+ patterns
- ✅ Difficulty scaling
- ✅ Item system
- ✅ Collision detection
- ✅ HUD and UI
- ✅ Dialogue system
- ✅ Boss Select mode

### In Progress
- 🔄 Full stage progression (6 stages)
- 🔄 Replay system
- 🔄 Practice mode
- 🔄 Scoring system

### Planned
- 📋 Pattern editor
- 📋 Mod support
- 📋 Online leaderboards
- 📋 More characters and bosses
- 📋 Sound effects and music

## 🎨 Available Bosses

### Touhou 6 (Embodiment of Scarlet Devil)
- Rumia
- Cirno
- Hong Meiling
- Patchouli Knowledge
- Sakuya Izayoi
- Remilia Scarlet
- Flandre Scarlet

### Other Touhou Games
- Parsee Mizuhashi (Touhou 11)
- Nue Houjuu (Touhou 12)
- Utsuho Reiuji (Touhou 11)

## 🛠️ Development

### Adding a New Boss

```javascript
// In js/stages/IndividualBossStages.js
export const BossMyCharacterEvents = createBossStage("My Character", null, [
    {
        hp: 800,
        duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            // Your pattern here
        }
    }
]);
```

### Adding a New Pattern

```javascript
// In js/game/PatternLibrary.js
myPattern: (scene, x, y, params) => {
    // Pattern implementation
    scene.bulletManager.spawn(x, y, vx, vy, color, radius);
}
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guides.

## 📚 Documentation

- [Architecture Overview](ARCHITECTURE.md) - System design and data flow
- [Roadmap](ENGINE_ROADMAP.md) - Development plan and milestones
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🎓 Learning Resources

### For Developers
- Study `js/game/PatternLibrary.js` for bullet pattern examples
- Check `js/stages/IndividualBossStages.js` for boss design patterns
- Review `js/game/Boss.js` for phase system implementation

### For Designers
- Experiment with patterns in Boss Select mode
- Modify existing boss patterns to learn
- Use browser DevTools to inspect game state

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest features
- 🎨 Create new bosses and patterns
- 📝 Improve documentation
- 🎵 Add sound effects and music
- 🖼️ Create sprites and artwork

## 📜 License

This project is open source. Please respect the original Touhou Project by ZUN.

## 🙏 Acknowledgments

- **ZUN** - Creator of Touhou Project
- **Touhou Community** - Inspiration and reference
- All contributors to this project

## 🔗 Links

- [Touhou Wiki](https://en.touhouwiki.net/)
- [Touhou Project Official](https://www16.big.or.jp/~zun/)

## 📊 Stats

- **Lines of Code**: ~8,000+
- **Bosses**: 10
- **Patterns**: 12+
- **Stages**: 6 (in progress)
- **Characters**: 2

## 🎯 Roadmap Highlights

### v1.0 (Core Engine)
- Complete 6-stage progression
- 4 playable characters
- 20+ bosses
- Replay system

### v2.0 (Advanced Features)
- Practice mode
- Scoring system
- Achievement system
- Pattern editor

### v3.0 (Community Platform)
- Mod support
- Online leaderboards
- Replay sharing
- Community hub

See [ENGINE_ROADMAP.md](ENGINE_ROADMAP.md) for full details.

## 💬 Community

- GitHub Issues for bug reports
- GitHub Discussions for questions
- Pull Requests for contributions

---

**Made with ❤️ for the Touhou community**

*This is a fan project and is not affiliated with or endorsed by ZUN or Team Shanghai Alice.*
