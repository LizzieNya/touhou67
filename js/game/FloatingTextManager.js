
export class FloatingText {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.text = "";
        this.color = "#f00";
        this.life = 0;
        this.maxLife = 0;
        this.vy = -50; // Float up
    }

    spawn(x, y, text, color, duration) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.text = text;
        this.color = color;
        this.life = duration;
        this.maxLife = duration;
        this.active = true;
    }

    update(dt) {
        if (!this.active) return;
        
        this.prevX = this.x;
        this.prevY = this.y;

        this.life -= dt;
        this.y += this.vy * dt;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    render(renderer, alpha = 1.0) {
        if (!this.active) return;

        const drawX = this.prevX + (this.x - this.prevX) * alpha;
        const drawY = this.prevY + (this.y - this.prevY) * alpha;

        const ctx = renderer.ctx;
        ctx.save();
        ctx.globalAlpha = Math.min(1.0, this.life / 0.5); // Fade out
        ctx.fillStyle = this.color;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.text, drawX, drawY);
        ctx.restore();
    }
}

export default class FloatingTextManager {
    constructor(game) {
        this.game = game;
        this.pool = [];
        this.poolSize = 50;
        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new FloatingText());
        }
    }

    spawn(x, y, text, color = '#f00', duration = 0.5) {
        const t = this.pool.find(p => !p.active);
        if (t) {
            t.spawn(x, y, text, color, duration);
        }
    }

    update(dt) {
        for (const t of this.pool) {
            if (t.active) t.update(dt);
        }
    }

    render(renderer, alpha = 1.0) {
        for (const t of this.pool) {
            if (t.active) t.render(renderer, alpha);
        }
    }
}
