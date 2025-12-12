export default class PauseMenu {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.options = [
            { name: 'Resume Game', action: 'resume' },
            { name: 'Return to Title', action: 'title' },
            { name: 'Return to Select', action: 'select' }, // Go back to character select
            { name: 'Retry Stage', action: 'retry' }, // Restart current stage
            { name: 'Give Up', action: 'quit' } // Go to launcher
        ];
        this.selectedIndex = 0;
    }

    toggle() {
        this.active = !this.active;
        this.game.sceneManager.currentScene.paused = this.active;
        this.selectedIndex = 0;
        this.game.soundManager.playSelect();
    }

    update(dt) {
        if (!this.active) return;

        if (this.game.input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            this.game.soundManager.playSelect();
        }
        if (this.game.input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            this.game.soundManager.playSelect();
        }

        if (this.game.input.isPressed('Confirm') || this.game.input.isPressed('SHOOT')) {
            this.selectOption();
        }

        if (this.game.input.isPressed('BOMB')) {
            this.toggle(); // Cancel/Resume
        }
    }

    selectOption() {
        const action = this.options[this.selectedIndex].action;

        if (action === 'resume') {
            this.toggle();
        } else if (action === 'title') {
            import('../scenes/TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (action === 'select') {
            import('../scenes/CharacterSelectScene.js').then(module => {
                // Try to preserve stage selection if possible, or default to 1
                const currentStage = this.game.sceneManager.currentScene.stage;
                this.game.sceneManager.changeScene(new module.default(this.game, typeof currentStage === 'number' ? currentStage : 1));
            });
        } else if (action === 'retry') {
            // Restart current scene with same params
            const scene = this.game.sceneManager.currentScene;
            import('../scenes/GameScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(
                    this.game,
                    scene.stage,
                    scene.character,
                    scene.shotType,
                    scene.difficulty
                ));
            });
        } else if (action === 'quit') {
            import('../scenes/LauncherScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    render(renderer) {
        if (!this.active) return;

        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        // Menu Box
        const boxWidth = 300;
        const boxHeight = this.options.length * 40 + 60;
        const boxX = (w - boxWidth) / 2;
        const boxY = (h - boxHeight) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Header
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText("PAUSE", w / 2, boxY + 40);

        // Options
        this.options.forEach((opt, index) => {
            const isSelected = index === this.selectedIndex;
            const color = isSelected ? '#f00' : '#888';
            const y = boxY + 80 + index * 40;

            ctx.font = isSelected ? 'bold 24px "Times New Roman", serif' : '20px "Times New Roman", serif';
            ctx.fillStyle = color;
            ctx.fillText(opt.name, w / 2, y);

            if (isSelected) {
                // Draw cursor arrows
                ctx.fillText("▶", boxX + 40, y);
                ctx.fillText("◀", boxX + boxWidth - 40, y);
            }
        });

        ctx.textAlign = 'left'; // Reset
    }
}
