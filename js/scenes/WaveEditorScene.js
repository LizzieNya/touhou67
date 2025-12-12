import ProjectManager from '../engine/ProjectManager.js';

export default class WaveEditorScene {
    constructor(game, project, waveIndex) {
        this.game = game;
        this.project = project;
        this.waveIndex = waveIndex;
        this.wave = this.project.stages[waveIndex];
        this.projectManager = new ProjectManager();

        // Initialize defaults if missing
        if (this.wave.speed === undefined) this.wave.speed = 3;
        if (this.wave.color === undefined) this.wave.color = '#f00';

        this.properties = [];
        if (this.wave.type === 'wave') {
            this.properties = [
                { key: 'enemyCount', label: 'Count', type: 'number', min: 1, max: 50, step: 1, desc: "Number of enemies." },
                { key: 'pattern', label: 'Pattern', type: 'select', options: ['aimed', 'circle', 'spiral', 'random', 'flower', 'stream'], desc: "Attack behavior." },
                { key: 'time', label: 'Delay', type: 'number', min: 0.5, max: 10.0, step: 0.5, desc: "Wait time (sec)." },
                { key: 'speed', label: 'Speed', type: 'number', min: 1, max: 10, step: 0.5, desc: "Enemy speed." },
                { key: 'color', label: 'Color', type: 'select', options: ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fff'], desc: "Enemy color." }
            ];
        } else if (this.wave.type === 'boss') {
            this.properties = [
                { key: 'name', label: 'Name', type: 'text', desc: "Boss name." },
                { key: 'hp', label: 'HP', type: 'number', min: 100, max: 10000, step: 100, desc: "Health points." },
                { key: 'time', label: 'Delay', type: 'number', min: 0.5, max: 10.0, step: 0.5, desc: "Wait time (sec)." },
                { key: 'spell', label: 'Spell', type: 'text', desc: "Spell card name." }
            ];
        }

        this.selectedIndex = 0;
        this.previewTimer = 0;
    }

    update(dt) {
        this.previewTimer += dt;

        if (this.game.input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.properties.length) % this.properties.length;
        }
        if (this.game.input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.properties.length;
        }

        const prop = this.properties[this.selectedIndex];

        if (this.game.input.isPressed('LEFT')) {
            if (prop.type === 'number') {
                this.wave[prop.key] = Math.max(prop.min, (this.wave[prop.key] || prop.min) - prop.step);
                this.wave[prop.key] = Math.round(this.wave[prop.key] * 10) / 10;
            } else if (prop.type === 'select') {
                const currentIdx = prop.options.indexOf(this.wave[prop.key]);
                const newIdx = (currentIdx - 1 + prop.options.length) % prop.options.length;
                this.wave[prop.key] = prop.options[newIdx];
            }
        }

        if (this.game.input.isPressed('RIGHT')) {
            if (prop.type === 'number') {
                this.wave[prop.key] = Math.min(prop.max, (this.wave[prop.key] || prop.min) + prop.step);
                this.wave[prop.key] = Math.round(this.wave[prop.key] * 10) / 10;
            } else if (prop.type === 'select') {
                const currentIdx = prop.options.indexOf(this.wave[prop.key]);
                const newIdx = (currentIdx + 1) % prop.options.length;
                this.wave[prop.key] = prop.options[newIdx];
            }
        }

        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
            if (prop.type === 'text') {
                const newVal = prompt(`Enter ${prop.label}:`, this.wave[prop.key]);
                if (newVal) this.wave[prop.key] = newVal;
            }
        }

        if (this.game.input.isPressed('BOMB')) {
            this.projectManager.updateProject(this.project);
            import('./EditorScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game, this.project));
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        ctx.fillStyle = '#112';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '24px Arial';
        ctx.fillText(`Edit ${this.wave.type === 'wave' ? 'Wave' : 'Boss'}`, w / 2, 40);

        const startY = 80;
        const spacing = 40;

        // Properties List
        this.properties.forEach((prop, i) => {
            const y = startY + i * spacing;
            const selected = i === this.selectedIndex;

            ctx.textAlign = 'right';
            ctx.font = selected ? 'bold 20px Arial' : '20px Arial';
            ctx.fillStyle = selected ? '#ff0' : '#aaa';
            ctx.fillText(prop.label + ": ", w / 2 - 20, y);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            let val = this.wave[prop.key];
            if (val === undefined) val = (prop.type === 'number' ? prop.min : '');

            if (prop.type === 'select' || prop.type === 'number') {
                val = `< ${val} >`;
            } else if (prop.type === 'text') {
                val = `[ ${val} ]`;
            }

            ctx.fillText(val, w / 2 + 20, y);
        });

        // Description Box
        const prop = this.properties[this.selectedIndex];
        ctx.fillStyle = '#223';
        ctx.fillRect(50, h - 100, w - 100, 40);
        ctx.strokeStyle = '#445';
        ctx.strokeRect(50, h - 100, w - 100, 40);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        ctx.fillText(prop.desc, w / 2, h - 75);

        // Preview Box
        this.renderPreview(ctx, w - 180, 80, 150, 150);

        ctx.fillStyle = '#888';
        ctx.fillText("Arrows: Adjust/Select  Z: Edit Text  X: Save & Back", w / 2, h - 20);
    }

    renderPreview(ctx, x, y, w, h) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText("Preview", x + w / 2, y - 5);

        // Simulate Pattern
        const t = this.previewTimer * 2;
        const cx = x + w / 2;
        const cy = y + h / 2;

        ctx.fillStyle = this.wave.color || '#f00';

        if (this.wave.pattern === 'circle') {
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + t;
                const r = (t * 20) % (w / 2);
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.wave.pattern === 'spiral') {
            for (let i = 0; i < 10; i++) {
                const angle = (i * 0.5) + t;
                const r = (t * 30 + i * 5) % (w / 2);
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.wave.pattern === 'aimed') {
            const r = (t * 50) % h;
            ctx.beginPath();
            ctx.arc(cx, y + r, 4, 0, Math.PI * 2); // Just falling down
            ctx.fill();
        } else {
            // Random dots
            ctx.fillText("?", cx, cy);
        }
    }
}
