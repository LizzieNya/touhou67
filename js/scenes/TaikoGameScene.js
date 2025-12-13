import Background from '../game/Background.js';

export default class TaikoGameScene {
    constructor(game, selectedTheme = null) {
        this.game = game;
        this.background = new Background(game);
        this.score = 0;
        this.combo = 0;
        this.notes = []; 
        this.noteTimeline = []; 
        this.isPlaying = false;
        this.startTime = 0;
        this.travelTime = 2.0; 
        this.spawnIndex = 0;
        this.selectedTheme = selectedTheme;
        
        // Config
        // Keys: F/J = Center(Red), D/K = Rim(Blue)
        this.keysRed = ['KeyF', 'KeyJ'];
        this.keysBlue = ['KeyD', 'KeyK'];
        
        // Effects
        this.feedbackText = '';
        this.feedbackTimer = 0;
        this.particles = [];
        this.comboScale = 1.0;
        this.drumScale = { center: 1.0, rim: 1.0 }; // Visual feedback for hits

        // Settings
        this.audioOffset = this.game.settings?.audioOffset || 0;

        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        this.start();
    }

    start() {
        if (!this.game.soundManager) return;

        let themeName = this.selectedTheme;
        if (!themeName) {
            const themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'menu'];
            themeName = themes[Math.floor(Math.random() * themes.length)];
        }

        const themeData = this.game.soundManager.leitmotifManager.getTheme(themeName);
        if (!themeData) { console.error("Theme not found!"); return; }

        this.noteTimeline = [];
        let currentTime = 0;
        const secondsPerBeat = 60 / themeData.tempo;
        let lastNoteTime = -1;

        themeData.sequence.forEach(step => {
            const hasNotes = Array.isArray(step.notes) ? step.notes.length > 0 : !!step.notes;
            if (hasNotes) {
                if (currentTime - lastNoteTime >= 0.12) {
                    // Random Don (Red) or Ka (Blue)
                    const type = Math.random() < 0.6 ? 'red' : 'blue'; 
                    // Small chance for BIG note? maybe later
                    this.noteTimeline.push({
                        time: currentTime,
                        type: type,
                        spawned: false
                    });
                    lastNoteTime = currentTime;
                }
            }
            currentTime += step.duration * secondsPerBeat;
        });

        this.game.soundManager.playBossTheme(themeName);
        this.startTime = performance.now() / 1000;
        this.isPlaying = true;
    }

    update(dt) {
        if (!this.isPlaying) return;
        this.background.update(dt);

        if (this.comboScale > 1.0) this.comboScale = Math.max(1.0, this.comboScale - dt * 2);
        if (this.drumScale.center > 1.0) this.drumScale.center = Math.max(1.0, this.drumScale.center - dt * 5);
        if (this.drumScale.rim > 1.0) this.drumScale.rim = Math.max(1.0, this.drumScale.rim - dt * 5);
        if (this.feedbackTimer > 0) this.feedbackTimer -= dt;

        const currentTime = (performance.now() / 1000) - this.startTime;
        const visualTime = currentTime - this.audioOffset;

        // Spawn
        while (this.spawnIndex < this.noteTimeline.length) {
            const noteEvent = this.noteTimeline[this.spawnIndex];
            const spawnThreshold = noteEvent.time - this.travelTime;

            if (visualTime >= spawnThreshold) {
                this.notes.push({
                    type: noteEvent.type, // 'red' or 'blue'
                    arrivalTime: noteEvent.time,
                    x: this.game.width + 50,
                    active: true
                });
                this.spawnIndex++;
            } else { break; }
        }

        // Update positions
        const hitX = 150;
        const spawnX = this.game.width + 50;
        
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const timeUntilHit = note.arrivalTime - visualTime;
            
            // Linear move left
            // Time: travelTime -> 0
            // X: spawnX -> hitX
            // X = hitX + (spawnX - hitX) * (timeUntilHit / travelTime)
            // But we want it to keep going past hitX
            
            // Dist = Velocity * TimeWait
            // Vel = (spawnX - hitX) / travelTime
            const vel = (spawnX - hitX) / this.travelTime;
            note.x = hitX + vel * timeUntilHit;

            if (note.x < -50) {
                this.notes.splice(i, 1);
                this.combo = 0;
                this.showFeedback("MISS", '#888');
            }
        }

        // Input
        // Check Red
        const pressedRed = this.keysRed.some(k => this.game.input.keys[k] && !this.game.input.prevKeys[k]);
        if (pressedRed) {
            this.drumScale.center = 1.2;
            this.checkHit('red', visualTime);
        }

        // Check Blue
        const pressedBlue = this.keysBlue.some(k => this.game.input.keys[k] && !this.game.input.prevKeys[k]);
        if (pressedBlue) {
            this.drumScale.rim = 1.2;
            this.checkHit('blue', visualTime);
        }

        // Particles
        for(let i=this.particles.length-1; i>=0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = p.life / p.maxLife;
            if(p.life <= 0) this.particles.splice(i,1);
        }

        if (this.game.input.isPressed('BOMB') || this.game.input.isPressed('ESC')) {
            this.game.soundManager.stopBossTheme();
            import('./RhythmSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    checkHit(inputType, visualTime) {
        let bestNoteIndex = -1;
        let minDiff = Infinity;

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            // Only care about notes near the hit area
            const diff = Math.abs(visualTime - note.arrivalTime);
            
            // Allow checking slightly futher notes but prefer closest
            if (diff < 0.2 && diff < minDiff) { 
                minDiff = diff;
                bestNoteIndex = i;
            }
        }

        if (bestNoteIndex !== -1) {
            const note = this.notes[bestNoteIndex];
            if (note.type === inputType) {
                 // Hit correct color
                 let points = 0;
                 let text = "";
                 let color = inputType==='red'?'#f80':'#08f';
                 
                 if (minDiff < 0.05) {
                     points = 300; text = "PERFECT!"; 
                 } else if (minDiff < 0.12) {
                     points = 100; text = "GOOD";
                 } else {
                     points = 50; text = "BAD"; // Still a hit though
                     this.combo = 0;
                 }
                 
                 this.combo++;
                 this.score += points + this.combo * 10;
                 this.comboScale = 1.3;
                 this.showFeedback(text, color);
                 this.createExplosion(150, 200, color);
                 this.notes.splice(bestNoteIndex, 1);
            } else {
                // Wrong Color - Counts as Miss? Or just Ignore?
                // Usually penalties apply. Let's break combo.
                this.combo = 0;
                this.showFeedback("WRONG!", '#f00');
            }
        }
    }

    showFeedback(text, color) {
        this.feedbackText = text;
        this.feedbackColor = color;
        this.feedbackTimer = 0.5;
    }

    createExplosion(x, y, color) {
        for(let i=0; i<12; i++) {
            const ang = Math.random()*Math.PI*2;
            const speed = 50 + Math.random()*150;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed,
                life: 0.3, maxLife: 0.3,
                color: color,
                size: 3 + Math.random()*6
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.background.render(renderer);
        
        // Track Background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 150, w, 100);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 150); ctx.lineTo(w, 150);
        ctx.moveTo(0, 250); ctx.lineTo(w, 250);
        ctx.stroke();

        // Hit Circle (The Drum) at (150, 200)
        // Rim
        ctx.beginPath();
        ctx.arc(150, 200, 45 * this.drumScale.rim, 0, Math.PI*2);
        ctx.fillStyle = '#44f'; // Default blueish
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        
        // Center
        ctx.beginPath();
        ctx.arc(150, 200, 30 * this.drumScale.center, 0, Math.PI*2);
        ctx.fillStyle = '#f44'; // Default reddish
        ctx.fill();
        ctx.stroke();
        
        // Target Circle (where notes align)
        ctx.beginPath();
        ctx.arc(150, 200, 30, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Notes
        this.notes.forEach(note => {
            const x = note.x;
            const y = 200;
            
            ctx.beginPath();
            if (note.type === 'red') {
                ctx.fillStyle = '#f22';
                ctx.arc(x, y, 28, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();
                // Face? 
                ctx.fillStyle = '#fff';
                ctx.fillRect(x-5, y-5, 10, 10);
            } else {
                ctx.fillStyle = '#22f';
                ctx.arc(x, y, 28, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#000'; // Hollow for blue? Or just blue
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        });

        // Particles
        this.particles.forEach(p => {
             ctx.globalAlpha = p.alpha;
             ctx.fillStyle = p.color;
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
             ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 20, 40);

        if (this.combo > 0) {
            ctx.textAlign = 'center';
            ctx.font = `bold ${40 * this.comboScale}px Arial`;
            ctx.fillText(`${this.combo} COMBO`, 150, 100);
        }

        if (this.feedbackTimer > 0) {
             ctx.textAlign = 'center';
             ctx.font = 'bold 30px Arial';
             ctx.fillStyle = this.feedbackColor;
             ctx.fillText(this.feedbackText, 150, 140);
        }

        // Controls
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("Controls: F/J (Red/Center) | D/K (Blue/Rim)", 20, h - 30);
    }
}
