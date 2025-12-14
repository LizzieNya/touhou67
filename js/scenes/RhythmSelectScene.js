import Background from '../game/Background.js';

export default class RhythmSelectScene {
    constructor(game) {
        this.game = game;
        this.options = [
            'Circle Mode', 
            '4 Key Mode', 
            'IIDX Mode', 
            'Groove Mode', 
            'Calibration', 
            'Back' // Song Select is likely integrated or not fully avail
        ];
        this.selectedIndex = 0;
        this.blinkTimer = 0;

        // Reuse Menu Background
        this.background = new Background(game);
    }

    update(dt) {
        this.background.update(dt);
        this.blinkTimer += dt;

        const input = this.game.input;

        if (input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
        }
        if (input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
        }

        if (input.isPressed('SHOOT') || input.isPressed('Confirm')) {
            this.selectOption();
        }

        if (input.isPressed('BOMB')) {
            this.goBack();
        }
    }

    selectOption() {
        const option = this.options[this.selectedIndex];
        
        if (option === 'Circle Mode') {
            import('./RhythmGameScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === '4 Key Mode') {
            import('./RhythmGameScene_v2.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game, 4));
            });
        } else if (option === 'IIDX Mode') {
            import('./RhythmGameScene_v2.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game, 7));
            });
        } else if (option === 'Groove Mode') {
            // Placeholder or simple implementation using Circle Mode logic but on a path?
            // Reusing Circle Mode for now as it's closest to "visual"
            import('./RhythmGameScene.js').then(module => {
                const scene = new module.default(this.game);
                scene.cameraShake = 50; // CHAOS
                this.game.sceneManager.changeScene(scene);
            });
        } else if (option === 'Calibration') {
            import('./CalibrationScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Back') {
            this.goBack();
        }
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

        this.background.render(renderer);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 40px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Rhythm Game Mode', w / 2, 80);

        // Options
        const startY = 180;
        const spacing = 45;

        this.options.forEach((opt, index) => {
            let color = '#aaa';
            let shadow = 0;
            let prefix = "  ";

            if (index === this.selectedIndex) {
                const alpha = Math.abs(Math.sin(this.blinkTimer * 5));
                color = `rgba(255, 200, 200, ${0.8 + alpha * 0.2})`;
                shadow = 10;
                prefix = "> ";
            }

            ctx.shadowBlur = shadow;
            ctx.shadowColor = '#f00';
            ctx.fillStyle = color;
            ctx.font = 'bold 28px "Times New Roman", serif';
            ctx.fillText(prefix + opt, w / 2, startY + index * spacing);
        });

        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    }
}
