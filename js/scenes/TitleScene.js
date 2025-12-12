import Background from '../game/Background.js';

export default class TitleScene {
    constructor(game) {
        this.game = game;
        this.options = ['Start Game', 'Extra Start', 'Boss Select', 'Practice Start', 'Rhythm Game', 'Touhou Maker', 'Replay', 'Result', 'Music Room', 'Option', 'Quit'];
        this.selectedIndex = 0;
        this.blinkTimer = 0;
        this.started = false; // Wait for input
        this.lastMouseDown = false;

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
            this.game.handleResize();
        }

        // Background
        // Background
        this.stage = 'Menu';
        if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'touhou7') {
            this.stage = 'Menu7';
        }
        this.background = new Background(game);
        this.background.currentStage = this.stage; // Force initial stage
        this.background.loadBackgroundImage(this.stage);
        
        // Effects
        this.particles = []; 
        for(let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * game.width,
                y: Math.random() * game.height,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 3,
                alpha: Math.random() * 0.5
            });
        }
        
        // Start Music Immediately
        if (this.game.soundManager) {
            let theme = 'menu'; // Default to Touhou 6 (A Soul as Red as a Ground Cherry)
            if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'touhou7') {
                theme = 'th7_menu';
            }
            // Force stop to ensure freshness
            this.game.soundManager.stop(); 
            this.game.soundManager.playBossTheme(theme);
        }
    }

    update(dt) {
        this.background.update(dt);
        this.blinkTimer += dt;

        // Update particles
        this.particles.forEach(p => {
             p.x += p.vx * dt;
             p.y += p.vy * dt;
             
             if (p.x < 0) p.x = this.game.width;
             if (p.x > this.game.width) p.x = 0;
             if (p.y < 0) p.y = this.game.height;
             if (p.y > this.game.height) p.y = 0;
        });

        if (!this.started) {
            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                this.started = true;
                this.game.soundManager.playMenuMove();
            }
            return;
        }

        // Input handling
        // Simple debounce logic for menu navigation
        if (this.game.input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
        }
        if (this.game.input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
        }

        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
            this.selectOption();
        }

        if (this.game.input.isPressed('BOMB')) {
            // Return to Launcher
            import('./LauncherScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }

        // Mouse Handling
        const mx = this.game.input.mouseX;
        const my = this.game.input.mouseY;
        const mClicked = this.game.input.mouseDown && !this.lastMouseDown;
        this.lastMouseDown = this.game.input.mouseDown;

        const startX = this.game.width - 40;
        const startY = 160;
        const spacing = 32;

        this.options.forEach((opt, index) => {
            // Approximate hit box for right-aligned text
            // Text is drawn at baseline y. 
            // Box: x: [w-250, w], y: [y-20, y+10]
            const y = startY + index * spacing;
            if (mx > startX - 300 && mx < startX + 20 &&
                my > y - 25 && my < y + 10) {
                
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.game.soundManager.playMenuMove();
                }
                
                if (mClicked) {
                    this.selectOption();
                }
            }
        });
    }

    selectOption() {
        const option = this.options[this.selectedIndex];
        console.log(`Selected option: ${option}`);
        if (option === 'Start Game') {
            import('./CharacterSelectScene.js').then(module => {
                console.log("Loaded CharacterSelectScene");
                this.game.sceneManager.changeScene(new module.default(this.game, 1));
            }).catch(err => console.error("Failed to load CharacterSelectScene:", err));
        } else if (option === 'Extra Start') {
            import('./CharacterSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game, 'Extra'));
            });
        } else if (option === 'Boss Select') {
            import('./BossSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Practice Start') {
            import('./PracticeSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Rhythm Game') {
            import('./RhythmSelectScene.js?v=2').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Touhou Maker') {
            import('./MakerSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Replay') {
            import('./ReplayScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Result') {
            import('./ResultScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Music Room') {
            import('./MusicRoomScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Option') {
            import('./OptionsScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (option === 'Quit') {
            // Return to Launcher
            import('./LauncherScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Render Background
        this.background.render(renderer);
        
        // Render Particles
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Dark overlay for title screen readability (lighter)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        if (!this.started) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px "Times New Roman", serif';
            ctx.textAlign = 'center';
            ctx.fillText("Press Z to Start", w / 2, h / 2);
            ctx.textAlign = 'left';
            return;
        }

        // Title Text (Top Left)
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000';
        ctx.textAlign = 'left';

        // Japanese Title
        ctx.font = 'bold 50px "Times New Roman", serif';
        ctx.fillStyle = '#f88';

        let jpTitle = "東方紅魔郷";
        let enTitle = "the Embodiment of Scarlet Devil";

        if (this.game.currentGameManifest) {
            if (this.game.currentGameManifest.id === 'touhou7') {
                jpTitle = "東方妖々夢";
                enTitle = "Perfect Cherry Blossom";
                ctx.fillStyle = '#f8c'; // Pinker for PCB
            } else if (this.game.currentGameManifest.id === 'touhou11') {
                jpTitle = "東方地霊殿";
                enTitle = "Subterranean Animism";
                ctx.fillStyle = '#4f4'; // Greenish
            } else if (this.game.currentGameManifest.id === 'touhou12') {
                jpTitle = "東方星蓮船";
                enTitle = "Undefined Fantastic Object";
                ctx.fillStyle = '#88f'; // Purple/Blue
            } else if (this.game.currentGameManifest.id === 'nocturnal_sunlight') {
                jpTitle = "東方夜光";
                enTitle = "Nocturnal Sunlight";
                ctx.fillStyle = '#88f'; // Blue/Purple
            }
        }

        ctx.fillText(jpTitle, 40, 80);

        // English Title
        ctx.font = 'bold 24px "Times New Roman", serif';
        ctx.fillStyle = '#ccc';
        ctx.fillText(enTitle, 40, 115);

        ctx.shadowBlur = 0;

        // Menu Options (Right Aligned, below title)
        const startX = w - 40; // Right aligned
        const startY = 140;
        const spacing = 26;

        ctx.font = 'bold 22px "Times New Roman", serif';
        ctx.textAlign = 'right';

        this.options.forEach((opt, index) => {
            let color = '#aaa';
            let shadow = 0;
            let offset = 0;

            if (index === this.selectedIndex) {
                // Active selection
                const alpha = Math.abs(Math.sin(this.blinkTimer * 5));
                color = `rgba(255, 200, 200, ${0.8 + alpha * 0.2})`;
                shadow = 10;
                offset = -10; // Move left slightly
            }

            ctx.shadowBlur = shadow;
            ctx.shadowColor = '#f00';
            ctx.fillStyle = color;
            ctx.fillText(opt, startX + offset, startY + index * spacing);
        });

        ctx.textAlign = 'left';

        // Version info
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#444";
        ctx.font = '12px sans-serif';
        ctx.fillText("v1.0.0", w - 60, h - 10);
    }
}
