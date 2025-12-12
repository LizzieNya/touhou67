export default class ReplayScene {
    constructor(game) {
        this.game = game;
        this.replays = [
            { name: 'Stage 1 - Reimu A - Normal', date: '2025-11-27', score: 12450000 },
            { name: 'Stage 2 - Marisa B - Hard', date: '2025-11-26', score: 15320000 },
            { name: 'Extra - Reimu B - Lunatic', date: '2025-11-25', score: 23100000 }
        ];
        this.selectedIndex = 0;
        this.blinkTimer = 0;

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }

    update(dt) {
        this.blinkTimer += dt;
        const input = this.game.input;

        if (input.isDown('UP')) {
            input.keys['ArrowUp'] = false;
            this.selectedIndex = (this.selectedIndex - 1 + this.replays.length) % this.replays.length;
        }
        if (input.isDown('DOWN')) {
            input.keys['ArrowDown'] = false;
            this.selectedIndex = (this.selectedIndex + 1) % this.replays.length;
        }
        if (input.isDown('SHOOT')) { // Play replay
            input.keys['KeyZ'] = false;
            this.playReplay();
        }
        if (input.isDown('BOMB')) { // Back
            input.keys['KeyX'] = false;
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    playReplay() {
        const replay = this.replays[this.selectedIndex];
        console.log(`Playing replay: ${replay.name}`);
        alert(`Replay system not yet implemented.\n\nWould play: ${replay.name}`);
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#204');
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Replay Viewer', w / 2, 50);

        // Instructions
        ctx.font = '14px "Times New Roman", serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Z: Play Replay  |  X: Back', w / 2, 80);

        if (this.replays.length === 0) {
            ctx.font = '20px "Times New Roman", serif';
            ctx.fillStyle = '#888';
            ctx.fillText('No replays saved', w / 2, h / 2);
            return;
        }

        // Replay list
        const startY = 130;
        const spacing = 60;
        ctx.textAlign = 'left';

        this.replays.forEach((replay, index) => {
            const y = startY + index * spacing;
            let color = '#888';
            let prefix = '  ';

            if (index === this.selectedIndex) {
                const alpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 5)) * 0.5;
                color = `rgba(255, 255, 255, ${alpha})`;
                prefix = '> ';
            }

            // Replay name
            ctx.font = 'bold 20px "Times New Roman", serif';
            ctx.fillStyle = color;
            ctx.fillText(`${prefix}${replay.name}`, 80, y);

            // Details
            ctx.font = '14px "Times New Roman", serif';
            ctx.fillStyle = '#666';
            ctx.fillText(`Date: ${replay.date}`, 100, y + 20);
            ctx.fillText(`Score: ${replay.score.toLocaleString()}`, 250, y + 20);
        });

        ctx.textAlign = 'left';
    }
}
