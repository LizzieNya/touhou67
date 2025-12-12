class Particle {
    constructor() {
        this.active = false;
        
        // Transform
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.vx = 0;
        this.vy = 0;
        
        // Appearance
        this.color = '#fff';
        this.size = 2;
        this.type = 'square'; // square, circle, spark, ring, smoke
        this.blendMode = 'source-over';
        
        // Lifecycle
        this.life = 0;
        this.maxLife = 0;
        
        // Physics / Logic
        this.gravity = 0;
        this.friction = 1; // 1 = no friction, 0.9 = slow down
        this.scaleSpeed = 0; // Growth per second
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    spawn(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        
        this.life = options.life || 1.0;
        this.maxLife = this.life;
        
        this.color = options.color || '#fff';
        this.size = options.size || 2;
        this.type = options.type || 'square';
        this.blendMode = options.blendMode || 'source-over';
        
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 1;
        this.scaleSpeed = options.scaleSpeed || 0;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = options.rotationSpeed || 0;
        
        this.active = true;
    }

    update(dt) {
        if (!this.active) return;
        
        this.prevX = this.x;
        this.prevY = this.y;

        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
            return;
        }
        
        // Physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity * dt;
        
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        this.size += this.scaleSpeed * dt;
        if (this.size < 0) this.size = 0;
        
        this.rotation += this.rotationSpeed * dt;
    }

    render(renderer, alpha = 1.0) {
        if (!this.active) return;
        
        const drawX = this.prevX + (this.x - this.prevX) * alpha;
        const drawY = this.prevY + (this.y - this.prevY) * alpha;
        
        const lifeRatio = this.life / this.maxLife;
        
        const ctx = renderer.ctx;
        ctx.save();
        ctx.globalCompositeOperation = this.blendMode;
        ctx.globalAlpha = lifeRatio; // Simple fade out
        ctx.translate(drawX, drawY);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        
        if (this.type === 'square') {
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        } else if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'spark') {
            // Elongated along velocity... but we rotated. 
            // Actually sparks usually don't rotate with angular velocity, they face travel direction.
            // But we can just draw a long rect.
            ctx.fillRect(-this.size * 2, -this.size/4, this.size * 4, this.size/2);
        } else if (this.type === 'ring') {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'smoke') {
            ctx.globalAlpha = lifeRatio * 0.5; // Smoke is transparent
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

export default class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.pool = [];
        this.poolSize = 1000; // Increased pool
        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new Particle());
        }
    }

    // Generic spawn
    emit(x, y, options) {
        const p = this.pool.find(p => !p.active);
        if (p) {
            p.spawn(x, y, options);
        }
    }

    // Helper for legacy/simple calls
    spawn(x, y, count, color = '#fff', speed = 100) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const s = Math.random() * speed;
            this.emit(x, y, {
                vx: Math.cos(angle) * s,
                vy: Math.sin(angle) * s,
                life: 0.5 + Math.random() * 0.5,
                color: color,
                size: 2 + Math.random() * 2,
                type: 'square', // Legacy look
                friction: 0.95
            });
        }
    }
    
    // New Effects
    createExplosion(x, y, color) {
        // Shockwave Ring
        this.emit(x, y, {
            vx: 0, vy: 0,
            life: 0.4,
            color: color,
            size: 10,
            type: 'ring',
            scaleSpeed: 200, // Expand fast
            blendMode: 'lighter'
        });
        
        // Sparks
        for(let i=0; i<8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            this.emit(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6,
                color: color,
                size: 4,
                type: 'spark',
                rotation: angle, 
                friction: 0.9,
                blendMode: 'lighter'
            });
        }
        
        // Smoke
        for(let i=0; i<3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 30;
            this.emit(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50, // Rise up
                life: 1.0,
                color: '#888',
                size: 10,
                type: 'smoke',
                scaleSpeed: 30,
                friction: 0.95
            });
        }
    }
    
    createGraze(x, y) {
        this.emit(x, y, {
            vx: (Math.random() - 0.5) * 50,
            vy: -50 - Math.random() * 50, // Fly up
            life: 0.3,
            color: '#fff',
            size: 3,
            type: 'spark',
            blendMode: 'lighter'
        });
         this.emit(x, y, {
            vx: 0, vy: 0,
            life: 0.2,
            color: '#fff',
            size: 5,
            type: 'ring',
            scaleSpeed: 100,
            blendMode: 'lighter'
        });
    }

    createSpawnEffect(x, y, color = '#fff') {
        // Reverse implosion or just a ring expanding
        this.emit(x, y, {
            vx: 0, vy: 0,
            life: 0.4,
            color: color,
            size: 5,
            type: 'ring',
            scaleSpeed: 100,
            blendMode: 'lighter'
        });
        
        // Swirl
        for(let i=0; i<5; i++) {
             const angle = Math.random() * Math.PI * 2;
             this.emit(x, y, {
                vx: Math.cos(angle) * 50,
                vy: Math.sin(angle) * 50,
                life: 0.6,
                color: color,
                size: 2,
                type: 'square',
                rotationSpeed: 5
            });
        }
    }
    
    createItemCollect(x, y, color = '#ff0') {
         // Sparkle
         this.emit(x, y, {
            vx: 0, vy: -50,
            life: 0.3,
            color: color,
            size: 20,
            type: 'spark',
            // Vertical spark
            rotation: -Math.PI / 2,
            blendMode: 'lighter',
            scaleSpeed: -50
        });
        
        // Ring
        this.emit(x, y, {
            vx: 0, vy: 0,
            life: 0.2,
            color: color,
            size: 2,
            type: 'ring',
            scaleSpeed: 150,
            blendMode: 'lighter'
        });
    }

    createBulletClear(x, y, color = '#fff') {
        // Disperse into tiny sparks
        for (let i = 0; i < 4; i++) {
             const angle = Math.random() * Math.PI * 2;
             const speed = 20 + Math.random() * 50;
             this.emit(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3,
                color: color,
                size: 2,
                type: 'square',
                blendMode: 'lighter',
                scaleSpeed: -5
            });
        }
    }

    createBombShockwave(x, y) {
        // Huge expanding ring (Shockwave)
        this.emit(x, y, {
            vx: 0, vy: 0,
            life: 1.0,
            color: '#fff',
            size: 10,
            type: 'ring',
            scaleSpeed: 1000, // Very fast expansion
            blendMode: 'lighter',
            friction: 1
        });
        
        // Secondary inverted pulse (simulated with black ring? No, additive lighter on white makes it bright)
        // Let's do a color pulse, maybe Cyan
         this.emit(x, y, {
            vx: 0, vy: 0,
            life: 0.8,
            color: '#0ff',
            size: 5,
            type: 'ring',
            scaleSpeed: 800,
            blendMode: 'lighter'
        });
    }

    spawnParticle(x, y, vx, vy, color = '#fff', life = 1.0, size = 2) {
        this.emit(x, y, {
            vx, vy, color, life, size, type: 'square'
        });
    }

    update(dt) {
        for (const p of this.pool) {
            if (p.active) p.update(dt);
        }
    }

    render(renderer, alpha = 1.0) {
        for (const p of this.pool) {
            if (p.active) p.render(renderer, alpha);
        }
    }
}
