export default class OptionsScene {
    constructor(game) {
        this.game = game;
        this.options = [
            { key: 'startingLives', name: 'Starting Lives', type: 'number', min: 1, max: 9, step: 1 },
            { key: 'startingBombs', name: 'Starting Bombs', type: 'number', min: 0, max: 9, step: 1 },
            { key: 'gameSpeed', name: 'Game Speed', type: 'number', min: 0.5, max: 2.0, step: 0.1 },
            { key: 'fullscreen', name: 'Fullscreen', type: 'action' },
            { key: 'godMode', name: 'God Mode', type: 'boolean' },
            { key: 'infiniteBombs', name: 'Infinite Bombs', type: 'boolean' },
            { key: 'startWithFullPower', name: 'Start Max Power', type: 'boolean' },
            { key: 'showHitbox', name: 'Always Show Hitbox', type: 'boolean' },
            { key: 'showFps', name: 'Show FPS', type: 'boolean' },
            { key: 'autoBomb', name: 'Auto Bomb', type: 'boolean' },
            { key: 'mouseMovement', name: 'Mouse Move', type: 'boolean' },
            { key: 'audioOffset', name: 'Audio Offset (s)', type: 'number', min: -0.5, max: 0.5, step: 0.01 },
            { key: 'back', name: 'Back to Title', type: 'action' }
        ];
        this.selectedIndex = 0;
        this.scrollOffset = 0;
    }

    update(dt) {
        const input = this.game.input;

        if (input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            this.game.soundManager.playSelect();
            this.fixScroll();
        }
        if (input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            this.game.soundManager.playSelect();
            this.fixScroll();
        }

        const selected = this.options[this.selectedIndex];

        if (input.isPressed('LEFT')) {
            this.changeValue(selected, -1);
        }
        if (input.isPressed('RIGHT')) {
            this.changeValue(selected, 1);
        }

        if (input.isPressed('Confirm') || input.isPressed('SHOOT')) {
            if (selected.type === 'action') {
                if (selected.key === 'back') {
                    this.goBack();
                } else if (selected.key === 'fullscreen') {
                    this.game.toggleFullscreen();
                }
            } else if (selected.type === 'boolean') {
                this.changeValue(selected, 1); // Toggle
            }
        }

        if (input.isPressed('BOMB')) {
            this.goBack();
        }
    }

    fixScroll() {
        const maxVisible = 8;
        if (this.selectedIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedIndex;
        } else if (this.selectedIndex >= this.scrollOffset + maxVisible) {
            this.scrollOffset = this.selectedIndex - maxVisible + 1;
        }
    }

    changeValue(option, direction) {
        if (option.type === 'number') {
            let val = this.game.config[option.key];
            val += direction * option.step;
            // Clamp
            val = Math.max(option.min, Math.min(option.max, val));
            // Round to avoid float errors
            val = Math.round(val * 10) / 10;
            this.game.config[option.key] = val;
            this.game.soundManager.playSelect();
        } else if (option.type === 'boolean') {
            this.game.config[option.key] = !this.game.config[option.key];
            this.game.soundManager.playSelect();
        }
        this.game.saveOptions();
    }

    goBack() {
        import('./TitleScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        const bg = this.game.resourceManager.getImage('mainmenu_bg');
        if (bg) {
            ctx.drawImage(bg, 0, 0, w, h);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, w, h);
        } else {
            ctx.fillStyle = '#112';
            ctx.fillRect(0, 0, w, h);
        }

        // Header
        ctx.textAlign = 'center';
        ctx.font = 'bold 40px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f00';
        ctx.fillText("OPTIONS", w / 2, 60);
        ctx.shadowBlur = 0;

        // Options List (Scrollable)
        const startY = 120;
        const spacing = 45;
        const maxVisible = 8;
        const visibleOptions = this.options.slice(this.scrollOffset, this.scrollOffset + maxVisible);

        // Draw a box behind options
        const boxWidth = 500;
        const boxHeight = maxVisible * spacing + 40;
        const boxX = (w - boxWidth) / 2;
        const boxY = startY - 30;

        ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = '#88f';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        visibleOptions.forEach((opt, relativeIndex) => {
            const index = this.scrollOffset + relativeIndex;
            const isSelected = index === this.selectedIndex;
            const y = startY + relativeIndex * spacing; // Draw specific to box position
            const color = isSelected ? '#fff' : '#aaa';

            // Selection Highlight
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(boxX + 10, y - 30, boxWidth - 20, 40);
            }

            ctx.font = isSelected ? 'bold 22px "Times New Roman", serif' : '20px "Times New Roman", serif';
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.fillText(opt.name, boxX + 40, y);

            // Value
            ctx.textAlign = 'right';
            if (opt.type === 'action') {
                // No value
            } else {
                let val = this.game.config[opt.key];
                if (opt.type === 'boolean') {
                    val = val ? "ON" : "OFF";
                    ctx.fillStyle = val === "ON" ? '#4f4' : '#f44';
                } else {
                    ctx.fillStyle = isSelected ? '#ff8' : '#ccc';
                }
                ctx.fillText(val, boxX + boxWidth - 40, y);
            }

            if (isSelected) {
                ctx.fillStyle = '#ff0';
                ctx.textAlign = 'left';
                ctx.fillText("▶", boxX + 15, y);
            }
        });

        // Scroll Indicators
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        if (this.scrollOffset > 0) {
            ctx.fillText("▲", w / 2, boxY + 15);
        }
        if (this.scrollOffset + maxVisible < this.options.length) {
            ctx.fillText("▼", w / 2, boxY + boxHeight - 10);
        }

        ctx.textAlign = 'left';
    }
}
