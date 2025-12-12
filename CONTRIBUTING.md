# Contributing to Touhou Game Engine

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Basic knowledge of JavaScript (ES6+)
- Understanding of HTML5 Canvas
- Familiarity with bullet hell game mechanics
- Git for version control

### Development Setup
1. Clone the repository
2. Open `index.html` in a modern web browser
3. Use browser DevTools for debugging
4. No build step required (vanilla JavaScript)

## How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include browser version and OS
- Provide steps to reproduce
- Include screenshots/videos if applicable
- Check if issue already exists

### Suggesting Features
- Open a GitHub Issue with `[Feature Request]` tag
- Describe the feature and use case
- Explain how it fits the Touhou game style
- Consider implementation complexity

### Code Contributions

#### Before You Start
1. Check existing issues and PRs
2. Discuss major changes in an issue first
3. Fork the repository
4. Create a feature branch

#### Coding Standards
- Use ES6+ features
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

#### Code Style
```javascript
// Good
class BulletPattern {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * Spawns a circular pattern of bullets
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of bullets
     */
    circle(x, y, count) {
        // Implementation
    }
}

// Bad
class bulletpattern {
    constructor(s) {
        this.s = s;
    }
    
    circle(x,y,c) {
        // No documentation
        // Poor naming
    }
}
```

#### Testing Your Changes
1. Test in multiple browsers (Chrome, Firefox, Safari)
2. Test all difficulty levels
3. Test with different characters
4. Verify no performance regression
5. Check for console errors

#### Submitting Pull Requests
1. Update documentation if needed
2. Add your changes to CHANGELOG.md
3. Write a clear PR description
4. Reference related issues
5. Request review from maintainers

## Contribution Areas

### High Priority
- **Bug Fixes**: Always welcome
- **Performance Improvements**: Optimization is key
- **Documentation**: Help others understand the code
- **Pattern Library**: Add new bullet patterns
- **Boss Designs**: Create new boss fights

### Medium Priority
- **UI Improvements**: Better menus and HUD
- **Visual Effects**: Particles, shaders, animations
- **Sound Effects**: Audio feedback
- **Character Additions**: New playable characters
- **Stage Designs**: New stages and scenarios

### Future Focus
- **Replay System**: Recording and playback
- **Pattern Editor**: Visual pattern creation tool
- **Mod Support**: Plugin architecture
- **Online Features**: Leaderboards, replay sharing
- **Mobile Support**: Touch controls

## Specific Contribution Guides

### Adding a New Boss

1. **Create Boss Definition** in `js/stages/IndividualBossStages.js`:
```javascript
export const BossMyCharacterEvents = createBossStage("My Character", null, [
    {
        hp: 800,
        duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            // Your pattern logic here
        }
    },
    {
        hp: 1200,
        duration: 60,
        spellName: "My Spell 'Spell Card Name'",
        pattern: (enemy, dt, t) => {
            // Spell card pattern
        }
    }
]);
```

2. **Add Boss Rendering** in `js/game/Boss.js`:
```javascript
} else if (this.name.includes("MyCharacter")) {
    // Draw your boss character
    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
}
```

3. **Register Boss** in `js/scenes/GameScene.js`:
```javascript
import { BossMyCharacterEvents } from '../stages/IndividualBossStages.js';

// In loadStageScript():
case 'BossMyCharacter': getEvents = BossMyCharacterEvents; break;
```

4. **Add to Boss Select** in `js/scenes/BossSelectScene.js`:
```javascript
{ name: 'My Character', stage: 'BossMyCharacter' }
```

### Adding a New Pattern

1. **Add to PatternLibrary** in `js/game/PatternLibrary.js`:
```javascript
myPattern: (scene, x, y, speed, color, radius) => {
    const mult = PatternLibrary.getDifficultyMultiplier(scene);
    const count = Math.floor(8 * PatternLibrary.getQuantityMultiplier(scene));
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        scene.bulletManager.spawn(
            x, y,
            Math.cos(angle) * speed * mult,
            Math.sin(angle) * speed * mult,
            color, radius
        );
    }
}
```

2. **Document the Pattern**:
```javascript
/**
 * Creates a custom pattern
 * @param {GameScene} scene - Current game scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} speed - Bullet speed
 * @param {string} color - Bullet color
 * @param {number} radius - Bullet radius
 */
```

3. **Use in Boss Pattern**:
```javascript
if (Math.floor(t * 60) % 30 === 0) {
    PatternLibrary.myPattern(scene, enemy.x, enemy.y, 200, '#f00', 4);
}
```

### Adding a New Character

1. **Add to Character List** in `js/scenes/CharacterSelectScene.js`:
```javascript
this.characters = ['Reimu', 'Marisa', 'MyCharacter'];
```

2. **Implement Shot Pattern** in `js/game/Player.js`:
```javascript
shootMyCharacter(level, isFocused) {
    const damage = 1.0 + (this.power / 150);
    
    if (!isFocused) {
        // Unfocused pattern
        this.bulletManager.spawn(this.x, this.y - 10, 0, -1000, damage, 'straight');
    } else {
        // Focused pattern
        this.bulletManager.spawn(this.x, this.y - 10, 0, -1200, damage, 'straight');
    }
}
```

3. **Update shoot() method**:
```javascript
if (this.character === 'MyCharacter') {
    this.shootMyCharacter(level, this.isFocused);
}
```

## Code Review Process

1. Maintainer reviews code
2. Feedback provided via PR comments
3. Author addresses feedback
4. Maintainer approves and merges
5. Changes deployed to main branch

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in the game credits

## Questions?

- Open a GitHub Discussion
- Join our Discord (if available)
- Email maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the Touhou Game Engine! 🎮✨
