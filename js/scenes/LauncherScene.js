// Beautiful Touhou Game Launcher with floating girl silhouettes
export default class LauncherScene {
    constructor(game) {
        this.game = game;
        this.options = [
            { name: 'Touhou 6: Embodiment of Scarlet Devil', id: 'touhou6' },
            { name: 'Touhou 7: Perfect Cherry Blossom', id: 'touhou7' },
            { name: 'Touhou 11: Subterranean Animism', id: 'touhou11' },
            { name: 'Touhou 12: Undefined Fantastic Object', id: 'touhou12' },
            { name: 'Touhou: Nocturnal Sunlight', id: 'nocturnal_sunlight' },
            { name: 'Touhou Maker', id: 'create' }
        ];
        this.selectedIndex = 0;

        // Load Manifests
        this.manifests = {};
        this.loading = false;
        this.loadManifestsInBackground();

        // Animation state for silhouettes
        this.silhouettes = [];
        this.initSilhouettes();
        this.time = 0;
        
        // Start playing calm menu music
        this.musicStarted = false;
        
        // Fade in effect
        this.fadeAlpha = 1.0;
        this.introComplete = false;
        
        // Interaction state
        this.started = false;
    }

    initSilhouettes() {
        // Character silhouette data - names match sprite keys
        const characters = [
            'reimu', 'marisa', 'sakuya', 'remilia', 'flandre', 'cirno',
            'patchouli', 'meiling', 'rumia', 'koishi', 'parsee', 'nue',
            'yuyuko', 'aya', 'junko', 'reisen', 'kaguya', 'mokou'
        ];
        
        // Create floating silhouettes
        for (let i = 0; i < 8; i++) {
            this.silhouettes.push({
                character: characters[i % characters.length],
                x: -100 - Math.random() * 200,
                y: 100 + Math.random() * (this.game.height - 200),
                speed: 20 + Math.random() * 30,
                scale: 0.6 + Math.random() * 0.4,
                alpha: 0.1 + Math.random() * 0.15,
                direction: 1, // 1 = left to right, -1 = right to left
                bobPhase: Math.random() * Math.PI * 2,
                bobSpeed: 0.5 + Math.random() * 1.0,
                prevX: -100, // Placeholder
                prevY: 100
            });
            // Update prevs to match initial pos
            const s = this.silhouettes[this.silhouettes.length - 1];
            s.prevX = s.x;
            s.prevY = s.y;
        }
        // Some going the other way
        for (let i = 0; i < 4; i++) {
            this.silhouettes.push({
                character: characters[(8 + i) % characters.length],
                x: this.game.width + 100 + Math.random() * 200,
                y: 100 + Math.random() * (this.game.height - 200),
                speed: 15 + Math.random() * 25,
                scale: 0.5 + Math.random() * 0.3,
                alpha: 0.08 + Math.random() * 0.12,
                direction: -1,
                bobPhase: Math.random() * Math.PI * 2,
                bobSpeed: 0.3 + Math.random() * 0.8,
                prevX: -100,
                prevY: 100
            });
            const s = this.silhouettes[this.silhouettes.length - 1];
            s.prevX = s.x;
            s.prevY = s.y;
        }
    }

    async loadManifestsInBackground() {
        try {
            const [t6, t7, ns] = await Promise.all([
                import('../games/touhou6/Touhou6Manifest.js'),
                import('../games/touhou7/Touhou7Manifest.js'),
                import('../games/nocturnal_sunlight/NocturnalSunlightManifest.js')
            ]);

            this.manifests['touhou6'] = new t6.default();
            this.manifests['touhou7'] = new t7.default();
            this.manifests['nocturnal_sunlight'] = new ns.default();
            
            // Preload main character sprites for launcher visuals
            if (this.game.resourceManager) {
                const spritesToLoad = [
                    { key: 'reimu', path: 'assets/sprites/player/reimu.png' },
                    { key: 'marisa', path: 'assets/sprites/player/marisa.png' },
                    { key: 'remilia', path: 'assets/sprites/bosses/remilia.png' },
                    { key: 'flandre', path: 'assets/sprites/bosses/flandre.png' },
                    { key: 'sakuya', path: 'assets/sprites/bosses/sakuya.png' }
                ];
                spritesToLoad.forEach(s => {
                   this.game.resourceManager.loadImage(s.key, s.path);
                });
            }
            
            console.log("Manifests loaded in background");
        } catch (e) {
            console.error("Failed to load manifests:", e);
        }
    }

    update(dt) {
        // Mouse Input Handling
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        const mDown = this.game.input.mouse.down;
        const mClicked = mDown && !this.lastMouseDown;
        this.lastMouseDown = mDown;

        // Start music after user interaction (Keyboard OR Click)
        if (!this.started) {
            if (this.game.input.anyKeyPressed() || mClicked) {
                this.started = true;
                this.game.soundManager.playMenuSelect();
                if (this.game.soundManager && this.game.soundManager.leitmotifManager) {
                    this.game.soundManager.leitmotifManager.playTheme('menu');
                }
                return;
            }
        }
        
        if (!this.started) { 
             this.time += dt; // Still update time for background animations
             return; 
        }
        
        // Fade in
        if (this.fadeAlpha > 0) {
            this.fadeAlpha -= dt * 0.8;
            if (this.fadeAlpha < 0) {
                this.fadeAlpha = 0;
                this.introComplete = true;
            }
        }

        // Update silhouettes
        this.silhouettes.forEach(s => {
            s.prevX = s.x;
            s.prevY = s.y;
            
            s.x += s.speed * s.direction * dt * 0.5; // Slower speed
            s.bobPhase += s.bobSpeed * dt;
            
            // Wrap around
            if (s.direction === 1 && s.x > this.game.width + 150) {
                s.x = -100 - Math.random() * 100;
                s.y = 100 + Math.random() * (this.game.height - 200);
            } else if (s.direction === -1 && s.x < -150) {
                s.x = this.game.width + 100 + Math.random() * 100;
                s.y = 100 + Math.random() * (this.game.height - 200);
            }
        });

        if (this.loading) return;

        // Mouse Hover & Click Validation
        const startY = this.game.height * 0.35;
        const spacing = 55;
        this.options.forEach((opt, index) => {
            const y = startY + index * spacing;
            // Check Hitbox (Centered approx 400px wide, 40px tall)
            if (mx > this.game.width/2 - 250 && mx < this.game.width/2 + 250 &&
                my > y - 25 && my < y + 25) {
                
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.game.soundManager.playMenuMove();
                }
                
                if (mClicked) {
                    this.game.soundManager.playMenuSelect();
                    this.selectGame();
                }
            }
        });

        if (this.game.input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            this.game.soundManager.playMenuMove();
        }
        if (this.game.input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            this.game.soundManager.playMenuMove();
        }
        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
            this.game.soundManager.playMenuSelect();
            this.selectGame();
        }
    }

    async selectGame() {
        const selected = this.options[this.selectedIndex];
        if (selected.id === 'create') {
            import('./MakerSelectScene.js?v=2').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
            return;
        }

        if (!this.manifests[selected.id]) {
            this.loading = true;
            try {
                let module;
                if (selected.id === 'touhou6') module = await import('../games/touhou6/Touhou6Manifest.js');
                else if (selected.id === 'touhou7') module = await import('../games/touhou7/Touhou7Manifest.js');
                else if (selected.id === 'touhou11') module = await import('../games/touhou11/Touhou11Manifest.js');
                else if (selected.id === 'touhou12') module = await import('../games/touhou12/Touhou12Manifest.js');
                else if (selected.id === 'nocturnal_sunlight') module = await import('../games/nocturnal_sunlight/NocturnalSunlightManifest.js');

                if (module) {
                    this.manifests[selected.id] = new module.default();
                }
            } catch (e) {
                console.error("Failed to load manifest on select:", e);
                this.loading = false;
                return;
            }
            this.loading = false;
        }

        const manifest = this.manifests[selected.id];
        if (manifest) {
            this.game.currentGameManifest = manifest;
            this.game.loadGameAssets(selected.id);

            Promise.all([
                import('./LoadingScene.js'),
                import('./TitleScene.js')
            ]).then(([loadingModule, titleModule]) => {
                const titleScene = new titleModule.default(this.game);
                const loadingScene = new loadingModule.default(this.game, titleScene);
                this.game.sceneManager.changeScene(loadingScene);
            });
        }
    }

    render(renderer, alpha = 1.0) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Beautiful gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#1a1a3a');
        gradient.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Subtle stars in background
        ctx.save();
        for (let i = 0; i < 50; i++) {
            const sx = (Math.sin(i * 17.3 + this.time * 0.1) * 0.5 + 0.5) * w;
            const sy = (Math.cos(i * 23.7) * 0.5 + 0.5) * h;
            const twinkle = Math.sin(this.time * 2 + i) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * twinkle})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + twinkle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Draw silhouettes (behind the UI) - Enhanced
        this.silhouettes.forEach(s => {
            const bobY = Math.sin(s.bobPhase) * 15;
            
            // Try to draw sprite ONLY for loaded main characters
            const sprite = this.game.resourceManager?.getImage(s.character);
            if (sprite && sprite.complete) {
                ctx.save();
                ctx.globalAlpha = 0.3 + Math.sin(this.time + s.speed) * 0.1; // Slow fade
                // Draw as faint transparent close up
                const scale = s.scale * 3.0; // Much larger (Close up)
                const spriteW = 80 * scale;
                const spriteH = 120 * scale;
                
                const drawX = s.prevX + (s.x - s.prevX) * alpha;

                ctx.drawImage(sprite, drawX - spriteW/2, s.y + bobY - spriteH/2, spriteW, spriteH);
                ctx.restore();
            } else {
                 // The rest disappear (do nothing)
            }
        });

        // Decorative floating particles
        for (let i = 0; i < 30; i++) {
            const px = (Math.sin(i * 7.1 + this.time * 0.3) * 0.5 + 0.5) * w;
            const py = (Math.sin(i * 11.3 + this.time * 0.2 + i * 0.5) * 0.5 + 0.5) * h;
            const pAlpha = Math.sin(this.time + i) * 0.1 + 0.15;
            const pSize = 2 + Math.sin(this.time * 0.5 + i) * 1;
            
            const colors = ['#f0f', '#0ff', '#ff0', '#f80', '#8f0'];
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = pAlpha;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Title with glow effect
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow
        ctx.shadowColor = '#f0f';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText("東方 Project", w / 2, 80);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.font = '24px Arial';
        ctx.fillText("Game Launcher", w / 2, 120);
        ctx.restore();

        // Options with elegant styling
        ctx.textAlign = 'center';
        const startY = h * 0.35;
        const spacing = 55;
        
        
        if (!this.started) {
            // Draw Press Start
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(this.time * 5) * 0.5})`;
            ctx.font = 'bold 32px Arial';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 10;
            ctx.fillText("PRESS ANY KEY TO START", w / 2, h * 0.6);
            ctx.restore();
            return; // Don't draw options yet
        }

        this.options.forEach((opt, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedIndex;
            
            if (isSelected) {
                // Selection glow background - WIDER for long titles
                const glowGradient = ctx.createRadialGradient(w/2, y, 0, w/2, y, 180); // Radius reduced from 220 to 180
                glowGradient.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
                glowGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
                ctx.fillStyle = glowGradient;
                ctx.fillRect(0, y - 20, w, 40);
                
                // Animated arrows - WIDER spacing
                const arrowOffset = Math.sin(this.time * 4) * 5;
                ctx.fillStyle = '#f0f';
                ctx.font = '28px Arial';
                ctx.fillText('◀', w/2 - 200 + arrowOffset, y); // moved to 200
                ctx.fillText('▶', w/2 + 200 - arrowOffset, y); // moved to 200
                
                // Selected text with glow
                ctx.save();
                ctx.shadowColor = '#f0f';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 26px Arial';
                ctx.fillText(opt.name, w / 2, y);
                ctx.restore();
            } else {
                ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
                ctx.font = '22px Arial';
                ctx.fillText(opt.name, w / 2, y);
            }
        });

        // Footer instruction
        ctx.fillStyle = 'rgba(150, 150, 200, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('Use ↑↓ to select, Z or Enter to confirm', w / 2, h - 40);

        // Version info - UPDATED CREDITS
        ctx.fillStyle = 'rgba(100, 100, 150, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('v1.0 | Fan Project', w - 20, h - 15);
        ctx.textAlign = 'left';
        ctx.fillText('Made by lizzie.dev. A fangame of ZUN\'s Touhou Project.', 20, h - 15);

        // Loading overlay
        if (this.loading) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, w, h);
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.fillText("Loading...", w / 2, h / 2);
            
            // Loading spinner
            const spinAngle = this.time * 4;
            ctx.strokeStyle = '#f0f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(w/2, h/2 + 50, 20, spinAngle, spinAngle + Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
        }

        // Fade in overlay
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
            ctx.fillRect(0, 0, w, h);
        }
    }
}
