import Entity from './Entity.js';

export default class Enemy extends Entity {
    constructor(game, x, y, hp = 20, type = 'fairy') {
        super(game, x, y);
        this.type = 'enemy';
        this.enemyType = type;
        this.hp = hp;
        this.radius = 15;
        this.radius = 15;
        this.color = '#f0f'; // Magenta for generic enemy
        this.timer = 0;
        this.hitFlashTimer = 0; // Visual flash on hit
        this.pattern = null; // Function to execute for movement/shooting
        
        this.prevX = x;
        this.prevY = y;
        
        // Spawn Effect
        const scene = game.sceneManager.currentScene;
        if (scene && scene.particleSystem) {
             scene.particleSystem.createSpawnEffect(x, y, this.color);
        }
    }

    setPattern(patternFunc) {
        this.pattern = patternFunc;
    }

    update(dt) {
        if (!this.active) return;
        
        this.prevX = this.x;
        this.prevY = this.y;

        this.timer += dt;
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

        if (this.pattern) {
            this.pattern(this, dt, this.timer);
        } else {
            // Default behavior: move down slowly
            this.y += 50 * dt;
        }

        // Despawn if off screen
        if (this.y > this.game.height + 50 || this.x < -50 || this.x > this.game.playAreaWidth + 50) {
            this.active = false;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlashTimer = 0.1;
        this.game.soundManager.playEnemyHit();
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.active = false;
        this.game.soundManager.playEnemyDie();
        const scene = this.game.sceneManager.currentScene;

        // Particles
        if (scene.particleSystem) {
            scene.particleSystem.createExplosion(this.x, this.y, this.color);
        }

        // Floating Text
        if (this.game.floatingTextManager) {
            this.game.floatingTextManager.spawn(this.x, this.y, "Defeated!", "#f00", 0.5);
        }

        // Drop items
        if (scene.itemManager) {
            const im = scene.itemManager;
            // Randomly drop power or point
            const rand = Math.random();
            if (rand > 0.9) {
                im.spawn(this.x, this.y, 'big_power');
            } else if (rand > 0.5) {
                im.spawn(this.x, this.y, 'power');
            } else {
                im.spawn(this.x, this.y, 'point');
            }
        }
        console.log("Enemy destroyed!");
    }

    render(renderer, alpha = 1.0) {
        if (!this.active) return;

        let spriteKey = 'enemy'; // Default fairy
        let w = 32;
        let h = 32;

        if (this.enemyType === 'spirit') {
            spriteKey = 'spirit';
            w = 48; // Bigger
            h = 48;
        } else if (this.enemyType === 'book') {
            spriteKey = 'book';
            w = 32;
            h = 32;
        } else if (this.enemyType === 'maid') {
            spriteKey = 'maid';
            w = 32;
            h = 48; // Taller
        } else if (this.enemyType === 'kedama') {
            spriteKey = 'kedama';
            w = 32;
            h = 32;
        }

        const drawX = this.prevX ? (this.prevX + (this.x - this.prevX) * alpha) : this.x;
        const drawY = this.prevY ? (this.prevY + (this.y - this.prevY) * alpha) : this.y;

        renderer.drawSprite(spriteKey, drawX, drawY, w, h);

        // Hit Flash
        if (this.hitFlashTimer > 0) {
            const ctx = renderer.ctx;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.7;
            // Draw again to brighten
            renderer.drawSprite(spriteKey, drawX, drawY, w, h);
            ctx.restore();
        }
    }
}
