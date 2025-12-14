import Background from '../game/Background.js';

export default class GameOverScene {
    constructor(game) {
        this.game = game;
        this.timer = 0;
        this.background = new Background(game);
        this.options = ['Retry', 'Return to Title'];
        this.selectedIndex = 0;
        this.inputDelay = 1.0; // Wait before accepting input
        this.particles = [];
        
        // Initialize particles (spirits rising)
        for(let i=0; i<30; i++) {
            this.particles.push(this.createParticle());
        }
        
        // Play Game Over sound
        if(this.game.soundManager) {
            this.game.soundManager.stopBossTheme();
            // Assuming we might have a game over jingle or just silence/wind
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * this.game.width,
            y: this.game.height + Math.random() * 100,
            vx: (Math.random() - 0.5) * 10,
            vy: -20 - Math.random() * 30, // Upward
            size: 2 + Math.random() * 4,
            alpha: 0.5 + Math.random() * 0.5,
            color: Math.random() > 0.5 ? '#f00' : '#800' // Blood/Spirit color
        };
    }

    update(dt) {
        this.timer += dt;
        this.background.update(dt); // Keeps BG moving slowly if needed

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha -= dt * 0.1;
            if(p.y < -10 || p.alpha <= 0) {
                Object.assign(p, this.createParticle());
            }
        });

        if (this.timer > this.inputDelay) {
            if (this.game.input.isPressed('UP')) {
                this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
                this.game.soundManager.playMenuMove();
            }
            if (this.game.input.isPressed('DOWN')) {
                this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
                this.game.soundManager.playMenuMove();
            }
            
            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                this.selectOption();
            }
        }
    }
    
    selectOption() {
        const opt = this.options[this.selectedIndex];
        if (opt === 'Retry') {
            // Restart current scene/game
            // We need to know which game/stage. 
            // Ideally Game holds this state.
            // For now, let's just go to CharacterSelect as a "Soft Retry" or just reload GameScene
            // Simpler: Go to Character Select for now to allow picking char again
            import('./CharacterSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game, 1)); // Default to Stage 1
            });
        } else {
            // Return to Title
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Dark background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        
        // Render faint background if desired
        ctx.save();
        ctx.globalAlpha = 0.2;
        this.background.render(renderer);
        ctx.restore();

        // Particles
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.restore();

        // "GAME OVER" Text
        const alpha = Math.min(this.timer, 1.0);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f00';
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 60px "Times New Roman"';
        ctx.fillText("GAME OVER", w/2, h/3);
        
        ctx.font = '20px "Times New Roman"';
        ctx.fillStyle = '#f88';
        ctx.fillText("The fantasy has ended...", w/2, h/3 + 40);
        ctx.restore();

        // Menu
        if (this.timer > this.inputDelay) {
            const startY = h * 0.6;
            const spacing = 40;
            
            ctx.textAlign = 'center';
            ctx.font = 'bold 24px "Times New Roman"';
            
            this.options.forEach((opt, index) => {
                if (index === this.selectedIndex) {
                    ctx.fillStyle = '#f00';
                    ctx.fillText("> " + opt + " <", w/2, startY + index * spacing);
                } else {
                    ctx.fillStyle = '#888';
                    ctx.fillText(opt, w/2, startY + index * spacing);
                }
            });
        }
    }
}
