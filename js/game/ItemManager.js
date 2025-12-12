import Entity from './Entity.js';

class Item extends Entity {
    constructor(game) {
        super(game, 0, 0);
        this.active = false;
        this.type = 'power';
        this.radius = 8;
        this.vy = 100;
        this.isAutoCollect = false;
    }

    spawn(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.vy = -200;
        this.isAutoCollect = false;
    }

    update(dt) {
        if (!this.active) return;

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
        if (this.game.sceneManager.currentScene.particleSystem) {
             const ps = this.game.sceneManager.currentScene.particleSystem;
             const color = (this.type === 'point') ? '#00f' : '#f00';
             ps.createItemCollect(this.x, this.y, color);
        }

        if (this.type === 'power') {
            player.addPower(1);
            this.game.soundManager.playPowerUp();
        } else if (this.type === 'big_power') {
            player.addPower(8);
            this.game.soundManager.playPowerUp();
        } else if (this.type === 'full_power') {
            player.power = player.maxPower;
            this.game.soundManager.playPowerUp();
        } else if (this.type === 'point') {
            this.game.sceneManager.currentScene.hud.score += 10000;
        }
    }

    render(renderer) {
        if (!this.active) return;

        let size = 12;
        let text = '';
        let color = '#f00';

        if (this.type === 'power') {
            color = '#f00'; // Red
            text = 'P';
            size = 12; // Small power
        } else if (this.type === 'big_power') {
            color = '#f00'; // Red
            text = 'P';
            size = 18; // Big power
        } else if (this.type === 'full_power') {
            color = '#ff0'; // Yellow
            text = 'F';
            size = 20; // Full power
        } else if (this.type === 'point') {
            color = '#00f'; // Blue
            text = '';
            size = 10; // Point items
        }

        const ctx = renderer.ctx;

        // Vacuum Line
        if (this.showVacuumLine) {
            const player = this.game.sceneManager.currentScene.player;
            if (player) {
                ctx.save();
                ctx.strokeStyle = color;
                ctx.globalAlpha = 0.3;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();
                ctx.restore();
            }
        }

        // Draw simple square box (EoSD authentic)
        ctx.fillStyle = color;
        ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);

        // White border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - size / 2, this.y - size / 2, size, size);

        // Text
        if (text) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, this.x, this.y);
        }
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
