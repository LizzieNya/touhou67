export default class CreditsScene {
    constructor(game) {
        this.game = game;
        this.scrollY = game.height;
        this.credits = [
            { title: "TOUHOU: NOCTURNAL SUNLIGHT", name: "" },
            { title: "", name: "" },
            { title: "Original Game by", name: "Team Shanghai Alice (ZUN)" },
            { title: "", name: "" },
            { title: "Fan Game Created by", name: "The Player" },
            { title: "", name: "" },
            { title: "Programming", name: "Antigravity AI" },
            { title: "", name: "" },
            { title: "Music", name: "ZUN" },
            { title: "Arrangement", name: "Antigravity AI" },
            { title: "", name: "" },
            { title: "Character Design", name: "ZUN" },
            { title: "Sprite Generation", name: "Antigravity AI" },
            { title: "", name: "" },
            { title: "Special Thanks", name: "You, for playing!" },
            { title: "", name: "" },
            { title: "THE END", name: "" }
        ];
        this.speed = 50; // Pixels per second
        this.finished = false;
    }

    update(dt) {
        if (this.game.input.isDown('SHOOT')) {
            this.speed = 200; // Fast forward
        } else {
            this.speed = 50;
        }

        this.scrollY -= this.speed * dt;

        // Check if end reached
        const totalHeight = this.credits.length * 50;
        if (this.scrollY < -totalHeight - 100) {
            this.finished = true;
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    render(ctx) {
        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        ctx.textAlign = 'center';

        this.credits.forEach((credit, index) => {
            const y = this.scrollY + index * 50;

            if (y > -50 && y < this.game.height + 50) {
                if (credit.title) {
                    ctx.fillStyle = '#aaa';
                    ctx.font = '16px "Press Start 2P"';
                    ctx.fillText(credit.title, this.game.width / 2, y);
                }
                if (credit.name) {
                    ctx.fillStyle = '#fff';
                    ctx.font = '20px "Press Start 2P"';
                    ctx.fillText(credit.name, this.game.width / 2, y + 25);
                }
            }
        });
    }
}
