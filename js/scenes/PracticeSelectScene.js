export default class PracticeSelectScene {
    constructor(game) {
        this.game = game;
        this.stages = [
            { name: 'Stage 1', id: 1 },
            { name: 'Stage 2', id: 2 },
            { name: 'Stage 3', id: 3 },
            { name: 'Stage 4', id: 4 },
            { name: 'Stage 5', id: 5 },
            { name: 'Stage 6', id: 6 },
            { name: 'Extra Stage', id: 'Extra' }
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
            this.selectedIndex = (this.selectedIndex - 1 + this.stages.length) % this.stages.length;
        }
        if (input.isDown('DOWN')) {
            input.keys['ArrowDown'] = false;
            this.selectedIndex = (this.selectedIndex + 1) % this.stages.length;
        }
        if (input.isDown('SHOOT')) { // Confirm
            input.keys['KeyZ'] = false;
            this.selectStage();
        }
        if (input.isDown('BOMB')) { // Cancel
            input.keys['KeyX'] = false;
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    selectStage() {
        const stage = this.stages[this.selectedIndex];
        console.log(`Selected Practice Stage: ${stage.name}`);
        // Go to Character Select with the selected stage
        import('./CharacterSelectScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game, stage.id));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#202');
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText("Practice Mode - Select Stage", w / 2, 50);

        // Instructions
        ctx.font = '16px "Times New Roman", serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText("Select a stage to practice", w / 2, 90);
        ctx.fillText("Press X to return", w / 2, 110);

        // List
        const startY = 150;
        const spacing = 50;
        this.stages.forEach((stage, index) => {
            let color = '#888';
            let text = stage.name;
            if (index === this.selectedIndex) {
                const alpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 5)) * 0.5;
                color = `rgba(255, 255, 255, ${alpha})`;
                text = `> ${stage.name} <`;
            }

            ctx.font = 'bold 24px "Times New Roman", serif';
            ctx.fillStyle = color;
            ctx.fillText(text, w / 2, startY + index * spacing);
        });

        ctx.textAlign = 'left';
    }
}
