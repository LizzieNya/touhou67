import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export class SunFairy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y, 20, 'fairy');
        this.color = '#f80';
        this.hp = 30;
    }

    update(dt, player, bulletManager) {
        super.update(dt, player, bulletManager);

        // Simple movement: Down then slow
        if (this.time < 1.0) {
            this.y += 150 * dt;
        } else {
            this.y += 20 * dt;
        }

        // Pattern: Radial burst
        if (Math.floor(this.time * 60) % 60 === 0) {
            PatternLibrary.ring(this.game.sceneManager.currentScene, this.x, this.y, 8, 150, '#ff0', 3);
        }
    }
}

export class MoonSpirit extends Enemy {
    constructor(game, x, y) {
        super(game, x, y, 15, 'spirit');
        this.color = '#aaf';
        this.hp = 20;
    }

    update(dt, player, bulletManager) {
        super.update(dt, player, bulletManager);

        // Movement: Sine wave down
        this.y += 80 * dt;
        this.x += Math.sin(this.time * 3) * 100 * dt;

        // Pattern: Aimed curve
        if (Math.floor(this.time * 60) % 45 === 0) {
            PatternLibrary.aimed(this.game.sceneManager.currentScene, this, 200, '#aaf', 3);
        }
    }
}

export class StarKedama extends Enemy {
    constructor(game, x, y) {
        super(game, x, y, 15, 'kedama');
        this.color = '#ff0';
        this.hp = 15;
    }

    update(dt, player, bulletManager) {
        super.update(dt, player, bulletManager);

        // Movement: Fast diagonal
        this.y += 120 * dt;
        this.x += Math.cos(this.time * 2) * 50 * dt;

        // Pattern: 3-way spread
        if (Math.floor(this.time * 60) % 40 === 0) {
            PatternLibrary.aimedNWay(this.game.sceneManager.currentScene, this, 3, 0.5, 180, '#ff0', 3);
        }
    }
}

export class ShadowBat extends Enemy {
    constructor(game, x, y) {
        super(game, x, y, 18, 'bat'); // Assuming 'bat' sprite exists or defaults to circle
        this.color = '#404';
        this.hp = 25;
    }

    update(dt, player, bulletManager) {
        super.update(dt, player, bulletManager);

        // Movement: Swoop
        this.y += 150 * dt;
        this.x += Math.sin(this.time * 5) * 150 * dt;

        // Pattern: Single fast aimed shot
        if (Math.floor(this.time * 60) % 30 === 0) {
            PatternLibrary.aimed(this.game.sceneManager.currentScene, this, 300, '#f0f', 4);
        }
    }
}
