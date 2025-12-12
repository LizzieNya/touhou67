import Background from '../game/Background.js';

export default class SongSelectScene {
    constructor(game) {
        this.game = game;
        this.themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'sans'];
        this.selectedIndex = 0;
        this.background = new Background(game);
    }

    update(dt) {
        this.background.update(dt);

        const input = this.game.input;

        if (input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.themes.length;
        }
        if (input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.themes.length) % this.themes.length;
        }

        if (input.isPressed('SHOOT') || input.isPressed('Confirm')) {
            this.selectSong();
        }

        if (input.isPressed('BOMB')) {
            this.goBack();
        }
    }

    selectSong() {
        const selectedTheme = this.themes[this.selectedIndex];
        import('./RhythmGameScene_v2.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game, selectedTheme));
        });
    }

    goBack() {
        import('./RhythmSelectScene.js?v=2').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.background.render(renderer);

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Select Song', w / 2, 50);

        const startY = 100;
        const spacing = 40;

        this.themes.forEach((theme, index) => {
            let color = '#888';
            if (index === this.selectedIndex) {
                color = '#fff';
                ctx.font = 'bold 32px Arial';
            } else {
                ctx.font = '24px Arial';
            }

            // Capitalize
            const name = theme.charAt(0).toUpperCase() + theme.slice(1);
            ctx.fillStyle = color;
            ctx.fillText(name, w / 2, startY + index * spacing);
        });
    }
}
