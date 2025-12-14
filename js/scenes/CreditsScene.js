import Background from '../game/Background.js';

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
            { title: "", name: "" },
            { title: "", name: "" },
            { title: "THE END", name: "" }
        ];
        this.speed = 50; // Pixels per second
        this.finished = false;
        
        // Background
        this.background = new Background(game);
        this.background.currentStage = 'Stage6'; // Use a nice stage background
        
        // Silhouettes
        this.silhouettes = [];
        this.initSilhouettes();
    }
    
    initSilhouettes() {
        const characters = ['reimu', 'marisa', 'sakuya', 'remilia', 'flandre', 'cirno', 'aya', 'sanae'];
        for(let i=0; i<characters.length; i++) {
            this.silhouettes.push({
                key: characters[i],
                x: (i % 2 === 0) ? -100 : this.game.width + 100, // Alt sides
                targetX: (i % 2 === 0) ? 100 : this.game.width - 100,
                y: this.game.height + i * 200, // Staggered vertically relative to scroll
                shown: false
            });
        }
    }

    update(dt) {
        this.background.update(dt);
        
        if (this.game.input.isDown('SHOOT')) {
            this.speed = 150; // Fast forward
        } else {
            this.speed = 50;
        }

        this.scrollY -= this.speed * dt;

        // Check if end reached
        const totalHeight = this.credits.length * 50;
        if (this.scrollY < -totalHeight - 400) { // Extra wait
            this.finished = true;
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        this.background.render(renderer);
        
        // Dark Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';

        // Draw Credits
        this.credits.forEach((credit, index) => {
            const y = this.scrollY + index * 50;

            if (y > -50 && y < h + 50) {
                if (credit.title) {
                    ctx.fillStyle = '#aaa';
                    ctx.font = '16px "Times New Roman"';
                    ctx.fillText(credit.title, w / 2, y);
                }
                if (credit.name) {
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#fff';
                    ctx.shadowBlur = 5;
                    ctx.font = 'bold 24px "Times New Roman"';
                    ctx.fillText(credit.name, w / 2, y + 30);
                    ctx.shadowBlur = 0;
                }
            }
        });
        
        // Render Silhouettes scrolling by
        // They appear based on scrollY logic simply
        /* 
           Simpler visual approach:
           Just draw sprites on the sides that drift up with the credits or independent?
           Let's make them drift up slowly.
        */
        const time = performance.now() / 1000;
        const charList = ['reimu', 'marisa', 'remilia', 'flandre', 'sakuya'];
        
        charList.forEach((key, i) => {
            const sprite = this.game.resourceManager.getImage(key);
            if(sprite) {
                const spacing = 300;
                // Calculate y based on scrollY but offset
                const charY = this.scrollY + 600 + i * spacing;
                
                if (charY > -200 && charY < h + 200) {
                    const x = (i % 2 === 0) ? 100 : w - 100;
                    ctx.save();
                    ctx.globalAlpha = 0.6;
                    
                    // Bobbing
                    const bobX = Math.sin(time + i) * 10;
                    
                    // Draw
                    const scale = 1.0;
                    const sw = sprite.width * scale;
                    const sh = sprite.height * scale;
                    
                    ctx.drawImage(sprite, x + bobX - sw/2, charY - sh/2, sw, sh);
                    
                    ctx.restore();
                }
            }
        });
    }
}
