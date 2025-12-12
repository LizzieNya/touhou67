import Background from '../game/Background.js';

export default class MakerTitleScene {
    constructor(game) {
        this.game = game;
        this.options = ['Projects', 'Character Bank', 'Tutorial', 'Back'];
        this.selectedIndex = 0;
        this.blinkTimer = 0;
        
        // Use a generic background or specific Maker one
        this.background = new Background(game); 
    }

    update(dt) {
        this.background.update(dt);
        this.blinkTimer += dt;

        if (this.game.input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            this.game.soundManager.playMenuMove();
        }
        if (this.game.input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            this.game.soundManager.playMenuMove();
        }

        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
            this.game.soundManager.playMenuSelect();
            this.selectOption();
        }

        if (this.game.input.isPressed('BOMB')) {
            this.goBack();
        }
    }

    selectOption() {
        const opt = this.options[this.selectedIndex];
        if (opt === 'Projects') {
            import('./MakerSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (opt === 'Character Bank') {
            import('./MakerCharacterScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (opt === 'Tutorial') {
             // Re-enable intro flag and go to select scene which handles intro
             localStorage.removeItem('touhou_maker_intro_seen');
             import('./MakerSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (opt === 'Back') {
            this.goBack();
        }
    }

    goBack() {
        import('./LauncherScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.background.render(renderer);

        // Dark Overlay
        ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.fillText("Touhou Maker Engine", w/2, 100);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.font = '16px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText("Create. Share. Play.", w/2, 130);

        // Options
        const startY = 250;
        const spacing = 50;

        this.options.forEach((opt, index) => {
            let color = '#888';
            if (index === this.selectedIndex) {
                const alpha = Math.abs(Math.sin(this.blinkTimer * 5));
                color = `rgba(100, 255, 100, ${0.8 + alpha * 0.2})`;
                ctx.font = 'bold 30px Arial';
            } else {
                ctx.font = '24px Arial';
            }

            ctx.fillStyle = color;
            ctx.fillText(opt, w/2, startY + index * spacing);
        });

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText("Z: Confirm  X: Back", w/2, h - 30);
    }
}
