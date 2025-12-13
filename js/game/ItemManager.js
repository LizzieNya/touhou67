import Entity from './Entity.js';

class Item extends Entity {
    constructor(game) {
        super(game, 0, 0);
        this.active = false;
        this.type = 'power';
        this.radius = 8;
        this.vy = 100;
        this.isAutoCollect = false;
        this.spawnTimer = 0; // For pop-in effect
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    spawn(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.vy = -200; // Initial pop up
        this.isAutoCollect = false;
        this.spawnTimer = 0;
    }

    update(dt) {
        if (!this.active) return;
        
        this.spawnTimer += dt;

        if (this.vy < 150 && !this.isAutoCollect) {
            this.vy += 200 * dt;
        }

        const player = this.game.sceneManager.currentScene.player;
        if (player.y < 150) {
            this.isAutoCollect = true;
        }

        if (this.isAutoCollect) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = 600;
            this.x += Math.cos(angle) * speed * dt;
            this.y += Math.sin(angle) * speed * dt;
            
            // Render trailing line (vacuum effect) - hacky but effectively drawing here
            // Ideally should be in render(), but we need previous pos or just direction
            // We can add a property for the renderer to read
            this.showVacuumLine = true;
        } else {
            this.y += this.vy * dt;
            this.showVacuumLine = false;
        }

        // Clamp to play area
        if (this.x < 10) this.x = 10;
        if (this.x > this.game.playAreaWidth - 10) this.x = this.game.playAreaWidth - 10;

        const dist = Math.hypot(this.x - player.x, this.y - player.y);
        if (dist < player.radius + this.radius + 10) {
            this.collect(player);
        }

        if (this.y > this.game.height + 20) {
            this.active = false;
        }
    }

    collect(player) {
        this.active = false;
        const scene = this.game.sceneManager.currentScene;
        
        if (scene.particleSystem) {
             const ps = scene.particleSystem;
             const color = (this.type === 'point') ? '#44f' : (this.type === 'power' ? '#f44' : '#fff');
             ps.createItemCollect(this.x, this.y, color);
        }

        if (this.type === 'power') {
            player.addPower(1);
            this.game.soundManager.playPowerUp();
        } else if (this.type === 'big_power') {
            player.addPower(8);
            this.game.soundManager.playPowerUp();
            if (scene.particleSystem) scene.particleSystem.createFloatingText(this.x, this.y, "MAX", "#f44");
        } else if (this.type === 'full_power') {
            player.power = player.maxPower;
            this.game.soundManager.playPowerUp();
            if (scene.particleSystem) scene.particleSystem.createFloatingText(this.x, this.y, "FULL", "#ff0");
        } else if (this.type === 'point') {
             // Score logic
             // Higher on screen = more points (Touhou mechanic)
             // But for now fixed or based on y
             let points = 10000;
             if (this.y < 150) points = 50000; // Max points high up
             
             // Auto-collect makes it max points usually
             if (this.isAutoCollect) points = 50000;

             scene.hud.score += points;
             
             if (scene.particleSystem) {
                 scene.particleSystem.createFloatingText(this.x, this.y, `${points}`, "#ccf");
             }
        } else if (this.type === 'bomb') {
             player.bombs++;
             this.game.soundManager.playPowerUp(); // Specific sound TODO
             if (scene.particleSystem) scene.particleSystem.createFloatingText(this.x, this.y, "BOMB", "#0f0");
        } else if (this.type === 'life') {
             player.lives++;
             this.game.soundManager.playExtend();
             if (scene.particleSystem) scene.particleSystem.createFloatingText(this.x, this.y, "EXTEND", "#f0f");
        }
    }

    render(renderer) {
        if (!this.active) return;

        // Visual Parameters
        // Visual Parameters
        let color = '#f00';
        let innerColor = '#faa';
        let text = '';
        let size = 16;
        let shape = 'box'; // box, star
        
        if (this.type === 'power') {
            // LED Red: Bright red outer, White inner (hot core)
            color = '#f00'; innerColor = '#fff'; text = 'P'; size = 14;
        } else if (this.type === 'big_power') {
            // LED Red: Bright red outer, White inner
            color = '#f00'; innerColor = '#fff'; text = 'P'; size = 20;
        } else if (this.type === 'full_power') {
            color = '#da0'; innerColor = '#ff4'; text = 'F'; size = 20;
        } else if (this.type === 'point') {
            color = '#00d'; innerColor = '#44f'; text = '点'; size = 16;
        } else if (this.type === 'bomb') {
            color = '#0d0'; innerColor = '#4f4'; text = 'B'; size = 18; shape = 'star';
        } else if (this.type === 'life') {
            color = '#d0d'; innerColor = '#f4f'; text = '1UP'; size = 18; shape = 'star';
        }

        const ctx = renderer.ctx;
        
        // Bobbing animation
        const bob = Math.sin(this.game.accumulator * 5 + this.bobOffset) * 3;
        const renderY = this.y + bob;
        
        // Pop-in scale
        let scale = 1.0;
        // Scale less quickly (0.4s instead of 0.2s)
        if (this.spawnTimer < 0.4) {
            scale = this.spawnTimer / 0.4;
        }

        // Vacuum Line (fancier)
        if (this.showVacuumLine) {
            const player = this.game.sceneManager.currentScene.player;
            if (player) {
                ctx.save();
                // Gradient trail
                const grad = ctx.createLinearGradient(this.x, renderY, player.x, player.y);
                grad.addColorStop(0, innerColor);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                
                ctx.strokeStyle = grad;
                ctx.globalAlpha = 0.6;
                ctx.lineWidth = 4 * scale;
                ctx.beginPath();
                ctx.moveTo(this.x, renderY);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();
                
                // Add sparkles along line? (Too expensive probably)
                ctx.restore();
            }
        }

        ctx.save();
        ctx.translate(this.x, renderY);
        ctx.scale(scale, scale);

        // Rotation for some items
        if (shape === 'star') {
             ctx.rotate(this.game.accumulator * 2);
        }

        // Drop Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;

        // Draw Shape
        if (shape === 'box') {
            // Rounded Box
            const r = 4;
            const w = size;
            const h = size;
            const x = -w/2;
            const y = -h/2;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            
            // LED Glow for power items
            if (this.type === 'power' || this.type === 'big_power') {
                ctx.shadowColor = '#f00';
                ctx.shadowBlur = 15;
            } else {
                // Standard shadow for others
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 5;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0; // Reset for border/inner
            
            // Inner gradient/glow
            const grd = ctx.createRadialGradient(0, -5, 1, 0, 0, size);
            grd.addColorStop(0, innerColor);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fill();
            
            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

        } else if (shape === 'star') {
            // Draw Star
            ctx.fillStyle = color;
            ctx.beginPath();
            for(let i=0; i<5; i++) {
                ctx.lineTo(Math.cos((18 + i*72)/180*Math.PI) * size, 
                           Math.sin((18 + i*72)/180*Math.PI) * size);
                ctx.lineTo(Math.cos((54 + i*72)/180*Math.PI) * size/2, 
                           Math.sin((54 + i*72)/180*Math.PI) * size/2);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Text
        if (text) {
             // Reset shadow for text to be crisp or minimal
             ctx.shadowBlur = 0;
             ctx.shadowOffsetY = 1;
             ctx.fillStyle = '#fff';
             ctx.font = `bold ${size * 0.7}px "Segoe UI", sans-serif`; // Cleaner font
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText(text, 0, 1); // Slight offset
        }

        ctx.restore();
    }
}

export default class ItemManager {
    constructor(game) {
        this.game = game;
        this.pool = [];
        this.poolSize = 100;

        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new Item(game));
        }
    }

    spawn(x, y, type) {
        const item = this.pool.find(i => !i.active);
        if (item) {
            item.spawn(x, y, type);
        }
    }

    update(dt) {
        for (const item of this.pool) {
            if (item.active) item.update(dt);
        }
    }

    render(renderer) {
        for (const item of this.pool) {
            if (item.active) item.render(renderer);
        }
    }
}
