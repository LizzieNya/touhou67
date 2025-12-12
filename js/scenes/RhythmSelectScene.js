import Background from '../game/Background.js';

export default class RhythmSelectScene {
    constructor(game) {
        this.game = game;
        this.options = ['Standard Mode', 'Song Select', 'Catch the Beat', 'Calibration', 'Back'];
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
        if (option === 'Standard Mode') {
            import('./RhythmGameScene_v2.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Song Select') {
            import('./SongSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Catch the Beat') {
            import('./CatchGameScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
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
        ctx.fillText('Rhythm Game Mode', w / 2, 100);

        // Options
        const startY = 250;
        const spacing = 50;

        this.options.forEach((opt, index) => {
            let color = '#aaa';
            let shadow = 0;

            if (index === this.selectedIndex) {
                const alpha = Math.abs(Math.sin(this.blinkTimer * 5));
                color = `rgba(255, 200, 200, ${0.8 + alpha * 0.2})`;
                shadow = 10;
            }

            ctx.shadowBlur = shadow;
            ctx.shadowColor = '#f00';
            ctx.fillStyle = color;
            ctx.font = 'bold 30px "Times New Roman", serif';
            ctx.fillText(opt, w / 2, startY + index * spacing);
        });

        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    }
}
