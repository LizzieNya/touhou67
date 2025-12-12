export default class EndingScene {
    constructor(game, character) {
        this.game = game;
        this.character = character || 'Reimu';
        this.timer = 0;
        this.step = 0; // 0: Fade In, 1: Dialogue, 2: Wait, 3: Fade Out
        this.alpha = 1;
    }

    update(dt) {
        this.timer += dt;

        if (this.step === 0) {
            this.alpha -= dt;
            if (this.alpha <= 0) {
                this.alpha = 0;
                this.step = 1;
                this.startDialogue();
            }
        } else if (this.step === 1) {
            this.game.dialogueManager.update(dt);
            if (!this.game.dialogueManager.active) {
                this.step = 2;
                this.timer = 0;
            }
        } else if (this.step === 2) {
            if (this.timer > 2.0 || this.game.input.isDown('SHOOT')) {
                this.step = 3;
                this.alpha = 0;
            }
        } else if (this.step === 3) {
            this.alpha += dt;
            if (this.alpha >= 1) {
                import('./CreditsScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            }
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // Draw Character Portrait (Center)
        const portrait = this.game.assets.images[`portrait_${this.character.toLowerCase()}`] || this.game.assets.images['portrait_reimu'];
        if (portrait) {
            const scale = 1.0;
            const w = portrait.width * scale;
            const h = portrait.height * scale;
            ctx.drawImage(portrait, (this.game.width - w) / 2, (this.game.height - h) / 2 + 50, w, h);
        }

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText("CONGRATULATIONS!", this.game.width / 2, 100);

        ctx.font = '20px "Press Start 2P"';
        ctx.fillText("Incident Resolved", this.game.width / 2, 150);

        this.game.dialogueManager.render(renderer);

        // Fade
        if (this.alpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
    }

    startDialogue() {
        let text = "Mission Complete.";
        switch (this.character) {
            case 'Reimu': text = "Another incident resolved. Time for tea."; break;
            case 'Marisa': text = "That was a blast! Who's next?"; break;
            case 'Sanae': text = "I did it! The Moriya Shrine is safe!"; break;
            case 'Youmu': text = "The balance is restored. My blade is dull."; break;
            case 'Sakuya': text = "All in a day's work for the head maid."; break;
            case 'Remilia': text = "The night returns. All is as it should be."; break;
            case 'Flandre': text = "That was fun! Can I go outside now?"; break;
        }

        this.game.dialogueManager.startDialogue([
            { name: this.character, text: text, side: 'left' }
        ]);
    }
}
