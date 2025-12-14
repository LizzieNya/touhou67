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
                vx: (Math.random() - 0.5) * 10,  // Slower, more ambient
                vy: (Math.random() - 0.5) * 10 - 5, // Slight upward drift
                size: Math.random() * 3 + 1, // Varied size
                alpha: Math.random() * 0.5 + 0.1,
                pulseSpeed: Math.random() * 2 + 1
            });
        }
        
        // Start Music Immediately
        if (this.game.soundManager) {
            let theme = 'menu'; // Default to Touhou 6 (A Soul as Red as a Ground Cherry)
            if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'touhou7') {
                theme = 'th7_menu';
            }
            // Force stop to ensure freshness
            this.game.soundManager.stopBossTheme(); 
            this.game.soundManager.playBossTheme(theme);
        }
    }

    update(dt) {
        this.background.update(dt);
        this.blinkTimer += dt;

        // Update particles
        // Update particles with more organic movement
        this.particles.forEach(p => {
             p.x += p.vx * dt;
             p.y += p.vy * dt;
             p.alpha += Math.sin(this.blinkTimer * p.pulseSpeed) * 0.01; // Twinkle

             if (p.x < -10) p.x = this.game.width + 10;
             if (p.x > this.game.width + 10) p.x = -10;
             if (p.y < -10) p.y = this.game.height + 10;
             if (p.y > this.game.height + 10) p.y = -10;
        });

        // Instant start (or very fast auto-start) logic handled in game loop,
        // but let's ensure input is ready immediately.
        // We'll keep the input check for "Press Start" to avoid accidental selection,
        // but ensure no hidden timers block it.
        
        if (!this.started) {
            // Auto-start title interaction if desired, or just wait for input
            // Removing any potentially blocking 'blinkTimer' or 'fade' logic if present
            
            // Accept ANY key or click/tap to start the menu
            if (this.game.input.anyKeyPressed()) {
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

        const startX = this.game.width - 40; // Right edge alignment
        const startY = 140; // Matching render startY
        const spacing = 26; // Matching render spacing

        this.options.forEach((opt, index) => {
            // Hitbox for right-aligned text
            // Text is drawn at startX, y = startY + index * spacing
            // Approx width 250px
            const y = startY + index * spacing;
            
            // Check bounds: x from (right - width) to right, y from (baseline - height) to (baseline)
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
            import('./RhythmSelectScene.js').then(module => {
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
        if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'nocturnal_sunlight') {
             // Draw custom title BG for Nocturnal Sunlight
             const bgImg = this.game.resourceManager.getImage('nocturnal_sunlight_title');
             if (bgImg) {
                 ctx.drawImage(bgImg, 0, 0, w, h);
             } else {
                 this.background.render(renderer);
             }
        } else {
            this.background.render(renderer);
        }
        
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
            if (this.game.virtualControls && this.game.virtualControls.active) {
                ctx.fillText("Tap Screen to Start", w / 2, h / 2);
            } else {
                ctx.fillText("Press Z to Start", w / 2, h / 2);
            }
            ctx.textAlign = 'left';
            return;
        }

        // Title Text (Top Left)
        // Shadow removed for performance
        // ctx.shadowBlur = 5;
        // ctx.shadowColor = '#000';
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
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#220000';
        ctx.strokeText(jpTitle, 40, 80);
        ctx.fillText(jpTitle, 40, 80);

        // English Title
        ctx.font = 'bold 24px "Times New Roman", serif';
        ctx.fillStyle = '#ccc';
        ctx.fillText(enTitle, 40, 115);

        this.drawMenu(ctx, w, h);
    }

    drawMenu(ctx, w, h) {
        // Menu Options (Right Aligned, below title)
        const startX = w - 60; // Right aligned with more padding
        const startY = 160;
        const spacing = 32; // More spacing

        ctx.textAlign = 'right';

        this.options.forEach((opt, index) => {
            let color = '#aaa';
            let offset = 0;
            let fontSize = 22;

            if (index === this.selectedIndex) {
                // Active selection
                const alpha = Math.abs(Math.sin(this.blinkTimer * 5));
                color = `rgba(255, 220, 220, ${0.8 + alpha * 0.2})`;
                
                // Active Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#f44';
                
                offset = -15; // Move left significantly
                fontSize = 24; // Slightly larger
                
                // Draw selection indicator
                ctx.fillStyle = '#f44';
                ctx.font = '18px Arial';
                ctx.fillText("▶", startX + offset - 200, startY + index * spacing); // Far left arrow
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
            ctx.fillStyle = color;
            ctx.fillText(opt, startX + offset, startY + index * spacing);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        });

        ctx.textAlign = 'left';

        // Version info
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#444";
        ctx.font = '12px sans-serif';
        ctx.fillText("v1.0.0", w - 60, h - 10);
    }
}
