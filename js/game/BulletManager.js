import Entity from './Entity.js';

class Bullet extends Entity {
    constructor(game) {
        super(game, 0, 0);
        this.active = false;
        this.radius = 5;
        this.color = '#fff';

        // Physics properties
        this.speed = 0;
        this.angle = 0;
        this.accel = 0;
        this.angularVelocity = 0;
    }

    spawn(x, y, vx, vy, color = '#fff', radius = 5, accel = 0, angularVelocity = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.radius = radius;
        this.active = true;

        // Calculate initial speed and angle from vx, vy
        this.speed = Math.sqrt(vx * vx + vy * vy);
        this.angle = Math.atan2(vy, vx);

        this.accel = accel;
        this.angularVelocity = angularVelocity;

        this.prevX = x;
        this.prevY = y;
    }

    update(dt) {
        if (!this.active) return;

        this.prevX = this.x;
        this.prevY = this.y;

        // Apply angular velocity (curve)
        if (this.angularVelocity !== 0) {
            this.angle += this.angularVelocity * dt;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }

        // Apply acceleration
        if (this.accel !== 0) {
            this.speed += this.accel * dt;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }

        // Manual update to avoid super call overhead if beneficial, but keeping super is safer for other logic
        // But for bullets, manual is faster.
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Deactivate if out of bounds (with a bit more margin for curving bullets)
        if (this.x < -100 || this.x > this.game.playAreaWidth + 100 ||
            this.y < -100 || this.y > this.game.height + 100) {
            this.active = false;
        }
    }

    // render method removed for optimization (moved to BulletManager)
}

export default class BulletManager {
    constructor(game) {
        this.game = game;
        this.pool = [];
        this.poolSize = 2000;
        this.activeCount = 0; // Number of currently active bullets
        this.spriteCache = {};

        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new Bullet(game));
        }
    }

    getBulletSprite(color, radius) {
        const key = `${color}-${Math.round(radius)}`;
        if (!this.spriteCache[key]) {
            // Enhanced visual style: Larger, softer glow with a crisp white core
            const glowSize = Math.max(6, radius * 2.5);
            const size = Math.ceil((radius + glowSize) * 2);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d', { alpha: true });
            const cx = size / 2;
            const cy = size / 2;

            // 1. Soft Outer Aura (Glow)
            const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius + glowSize);
            glow.addColorStop(0, color);
            glow.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.globalAlpha = 0.4; // Soft glow opacity
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, radius + glowSize, 0, Math.PI * 2);
            ctx.fill();

            // 2. Main Bullet Body (Color)
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // 3. White Hot Core (Intense center)
            const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.8);
            core.addColorStop(0, '#fff');
            core.addColorStop(0.5, 'rgba(255,255,255,0.8)');
            core.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();

            this.spriteCache[key] = canvas;
        }
        return this.spriteCache[key];
    }

    getBullet() {
        if (this.activeCount >= this.poolSize) {
            // Expand pool
            const newBullet = new Bullet(this.game);
            this.pool.push(newBullet);
            this.poolSize++;
        }
        const bullet = this.pool[this.activeCount];
        this.activeCount++;
        return bullet;
    }

    spawn(x, y, vx, vy, color, radius, accel = 0, angularVelocity = 0) {
        const b = this.getBullet();
        b.spawn(x, y, vx, vy, color, radius, accel, angularVelocity);

        // Muzzle Flash
        const scene = this.game.sceneManager.currentScene;
        if (scene && scene.particleSystem) {
            scene.particleSystem.emit(x, y, {
                vx: 0, vy: 0,
                life: 0.1,
                color: color,
                size: radius + 5,
                type: 'circle',
                blendMode: 'lighter',
                scaleSpeed: -50
            });
        }
    }

    update(dt) {
        for (let i = 0; i < this.activeCount; i++) {
            const b = this.pool[i];
            b.update(dt);

            if (!b.active) {
                // Remove (Swap with last active)
                this.activeCount--;
                // Swap current (dead) with last active
                const lastActive = this.pool[this.activeCount];
                this.pool[i] = lastActive;
                this.pool[this.activeCount] = b; // Move dead one to end (not strictly necessary but keeps array cleanish)

                // Decrement i to re-process the bullet we just swapped in
                i--;
            }
        }
    }

    render(renderer, alpha) {
        const ctx = renderer.ctx;

        ctx.save();
        // Use source-over for better visibility on all backgrounds (fixes invisible bullets)
        ctx.globalCompositeOperation = 'source-over';

        for (let i = 0; i < this.activeCount; i++) {
            const b = this.pool[i];
            if (!b.active) continue;

            // Interpolate
            const drawX = (b.prevX !== undefined) ? (b.prevX + (b.x - b.prevX) * alpha) : b.x;
            const drawY = (b.prevY !== undefined) ? (b.prevY + (b.y - b.prevY) * alpha) : b.y;

            // Use Cached Sprite directly
            const sprite = this.getBulletSprite(b.color, b.radius);
            if (sprite) {
                const offset = sprite.width / 2;
                // Round to integer pixels
                ctx.drawImage(sprite, (drawX - offset) | 0, (drawY - offset) | 0);
            } else {
                // Fallback
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(drawX | 0, drawY | 0, b.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    clear() {
        const scene = this.game.sceneManager.currentScene;
        const ps = (scene && scene.particleSystem) ? scene.particleSystem : null;

        // Visual effects for clear
        if (ps) {
            // Cap particles to avoid massive lag spike
            let particlesSpawned = 0;
            const maxParticles = 50;

            for (let i = 0; i < this.activeCount; i++) {
                if (particlesSpawned < maxParticles && Math.random() < 0.1) {
                    ps.createBulletClear(this.pool[i].x, this.pool[i].y, this.pool[i].color);
                    particlesSpawned++;
                }
                this.pool[i].active = false;
            }
        } else {
            for (let i = 0; i < this.activeCount; i++) {
                this.pool[i].active = false;
            }
        }

        this.activeCount = 0;
    }
}
