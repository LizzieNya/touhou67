export default class ResultScene {
    constructor(game, gameData = null) {
        this.game = game;
        this.gameData = gameData || {
            stage: 'Unknown',
            character: 'Unknown',
            difficulty: 'Normal',
            score: 0,
            graze: 0,
            continues: 0,
            spellsCaptured: 0,
            spellsTotal: 0,
            cleared: false
        };
        this.blinkTimer = 0;

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }

    update(dt) {
        this.blinkTimer += dt;
        const input = this.game.input;

        if (input.isDown('SHOOT') || input.isDown('BOMB')) {
            input.keys['KeyZ'] = false;
            input.keys['KeyX'] = false;
            
            if (this.gameData.returnTo === 'BossSelect') {
                import('./BossSelectScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            } else {
                import('./TitleScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            }
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#024');
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px "Times New Roman", serif';
        ctx.fillStyle = this.gameData.cleared ? '#0f0' : '#f00';
        ctx.fillText(this.gameData.cleared ? 'STAGE CLEAR!' : 'GAME OVER', w / 2, 60);

        // Stats
        const startY = 120;
        const spacing = 35;
        ctx.font = 'bold 20px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';

        const stats = [
            { label: 'Stage:', value: this.gameData.stage },
            { label: 'Character:', value: this.gameData.character },
            { label: 'Difficulty:', value: this.gameData.difficulty },
            { label: 'Score:', value: this.gameData.score.toLocaleString() },
            { label: 'Graze:', value: this.gameData.graze },
            { label: 'Continues:', value: this.gameData.continues },
            { label: 'Spell Cards:', value: `${this.gameData.spellsCaptured}/${this.gameData.spellsTotal}` }
        ];

        stats.forEach((stat, index) => {
            ctx.fillStyle = '#aaa';
            ctx.fillText(stat.label, 150, startY + index * spacing);
            ctx.fillStyle = '#fff';
            ctx.fillText(stat.value, 350, startY + index * spacing);
        });

        // Return prompt
        ctx.textAlign = 'center';
        ctx.font = '16px "Times New Roman", serif';
        const alpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 3)) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText('Press Z or X to return to title', w / 2, h - 40);

        ctx.textAlign = 'left';
    }
}
