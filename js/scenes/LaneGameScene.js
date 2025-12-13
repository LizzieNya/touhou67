import Background from '../game/Background.js';

export default class LaneGameScene {
    constructor(game, selectedTheme = null) {
        this.game = game;
        this.background = new Background(game);
        this.score = 0;
        this.combo = 0;
        this.notes = []; 
        this.noteTimeline = []; 
        this.isPlaying = false;
        this.startTime = 0;
        this.travelTime = 1.0; 
        this.spawnIndex = 0;
        this.selectedTheme = selectedTheme;
        
        // Lane Config
        this.laneCount = 4;
        this.laneKeys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
        this.laneX = [game.width/2 - 150, game.width/2 - 50, game.width/2 + 50, game.width/2 + 150];
        this.laneColors = ['#f0f', '#0ff', '#0ff', '#f0f'];
        
        // Effects
        this.feedbackText = '';
        this.feedbackTimer = 0;
        this.particles = [];
        this.comboScale = 1.0;

        // Settings
        this.audioOffset = this.game.settings?.audioOffset || 0;

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        this.start();
    }

    start() {
        if (!this.game.soundManager) return;

        let themeName = this.selectedTheme;
        if (!themeName) {
            const themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'nue'];
            themeName = themes[Math.floor(Math.random() * themes.length)];
        }

        const themeData = this.game.soundManager.leitmotifManager.getTheme(themeName);
        if (!themeData) {
            console.error("Theme not found!");
            return;
        }

        // Generate Notes
        this.noteTimeline = [];
        let currentTime = 0;
        const secondsPerBeat = 60 / themeData.tempo;
        let lastNoteTime = -1;

        themeData.sequence.forEach((step, stepIndex) => {
            const hasNotes = Array.isArray(step.notes) ? step.notes.length > 0 : !!step.notes;

            if (hasNotes) {
                if (currentTime - lastNoteTime >= 0.10) {
                    // Random lane logic or patterned
                    // Simple pattern: alternating or random
                    const lane = Math.floor(Math.random() * 4);
                    this.noteTimeline.push({
                        time: currentTime,
                        lane: lane,
                        spawned: false
                    });
                    
                    // Sometimes add a double
                    if (Math.random() < 0.2) {
                         const lane2 = (lane + 1 + Math.floor(Math.random()*2)) % 4;
                         this.noteTimeline.push({
                            time: currentTime,
                            lane: lane2,
                            spawned: false
                        });
                    }

                    lastNoteTime = currentTime;
                }
            }
            currentTime += step.duration * secondsPerBeat;
        });
        
        // Sort by time
        this.noteTimeline.sort((a,b) => a.time - b.time);

        this.game.soundManager.playBossTheme(themeName);
        this.startTime = performance.now() / 1000;
        this.isPlaying = true;
    }

    update(dt) {
        if (!this.isPlaying) return;
        this.background.update(dt);

        if (this.comboScale > 1.0) this.comboScale = Math.max(1.0, this.comboScale - dt * 2);
        if (this.feedbackTimer > 0) this.feedbackTimer -= dt;

        const currentTime = (performance.now() / 1000) - this.startTime;
        const visualTime = currentTime - this.audioOffset;

        // Spawn
        while (this.spawnIndex < this.noteTimeline.length) {
            const noteEvent = this.noteTimeline[this.spawnIndex];
            const spawnThreshold = noteEvent.time - this.travelTime;

            if (visualTime >= spawnThreshold) {
                this.notes.push({
                    lane: noteEvent.lane,
                    arrivalTime: noteEvent.time,
                    y: -50,
                    active: true
                });
                this.spawnIndex++;
            } else {
                break; 
            }
        }

        // Update Notes
        const hitY = this.game.height - 100;
        const spawnY = -50;
        
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const timeUntilHit = note.arrivalTime - visualTime;
            
            // Linear interpolation
            // Time: travelTime -> 0
            // Y: spawnY -> hitY
            const progress = 1.0 - (timeUntilHit / this.travelTime);
            note.y = spawnY + (hitY - spawnY) * progress;

            if (note.y > this.game.height + 50) {
                this.notes.splice(i, 1);
                this.combo = 0;
                this.showFeedback("MISS", '#888');
            }
        }

        // Input Handling
        this.laneKeys.forEach((keyName, laneIndex) => {
            if (this.game.input.keys[keyName] && !this.game.input.prevKeys[keyName]) {
                this.checkHit(laneIndex, visualTime);
            }
        });

        // Particles
        for(let i=this.particles.length-1; i>=0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = p.life / p.maxLife;
            if(p.life <= 0) this.particles.splice(i,1);
        }

        // Exit
        if (this.game.input.isPressed('BOMB') || this.game.input.isPressed('ESC')) {
            this.game.soundManager.stopBossTheme();
            import('./RhythmSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    checkHit(laneIndex, visualTime) {
        let bestNoteIndex = -1;
        let minDiff = Infinity;

        // Find closest note in this lane
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            if (note.lane !== laneIndex) continue;
            
            const diff = Math.abs(visualTime - note.arrivalTime);
            if (diff < minDiff) {
                minDiff = diff;
                bestNoteIndex = i;
            }
        }

        if (bestNoteIndex !== -1 && minDiff < 0.15) {
            const diff = minDiff;
            let points = 0;
            let text = "";
            let color = "";

            if (diff < 0.05) {
                points = 300; text = "PERFECT!"; color = '#0ff';
            } else if (diff < 0.10) {
                points = 100; text = "GOOD"; color = '#0f0';
            } else {
                points = 50; text = "BAD"; color = '#ff0';
                this.combo = 0;
            }

            if (points > 0) {
                this.combo++;
                this.score += points + this.combo * 10;
                this.comboScale = 1.3;
                this.showFeedback(text, color);
                
                // particle
                this.createExplosion(this.laneX[laneIndex], this.game.height - 100, color);
                
                this.notes.splice(bestNoteIndex, 1);
            }
        }
    }

    showFeedback(text, color) {
        this.feedbackText = text;
        this.feedbackColor = color;
        this.feedbackTimer = 0.5;
    }

    createExplosion(x, y, color) {
        for(let i=0; i<10; i++) {
            const ang = Math.random()*Math.PI*2;
            const speed = 50 + Math.random()*150;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed,
                life: 0.3, maxLife: 0.3,
                color: color,
                size: 2 + Math.random()*5
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.background.render(renderer);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0,0,w,h);

        const hitY = h - 100;

        // Draw Lanes
        for(let i=0; i<4; i++) {
            const lx = this.laneX[i];
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.lineTo(lx, h);
            ctx.stroke();

            // Key Hint
            ctx.fillStyle = '#aaa';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.laneKeys[i].replace('Key',''), lx, hitY + 60);

            // Receptor
            ctx.strokeStyle = this.laneColors[i];
            ctx.lineWidth = 3;
            ctx.strokeRect(lx - 25, hitY - 25, 50, 50);
            
            // Key press feedback
            if (this.game.input.keys[this.laneKeys[i]]) {
                ctx.fillStyle = this.laneColors[i];
                ctx.globalAlpha = 0.5;
                ctx.fillRect(lx - 25, hitY - 25, 50, 50);
                ctx.globalAlpha = 1.0;
            }
        }

        // Draw Notes
        this.notes.forEach(note => {
            const lx = this.laneX[note.lane];
            ctx.fillStyle = this.laneColors[note.lane];
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(lx - 25, note.y - 25, 50, 50);
            ctx.shadowBlur = 0;
            
            // Inner detail
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(lx - 20, note.y - 40/2 + 5, 40, 10); 
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
            ctx.fillText(`${this.combo} COMBO`, w/2, 100);
        }

        if (this.feedbackTimer > 0) {
             ctx.textAlign = 'center';
             ctx.font = 'bold 30px Arial';
             ctx.fillStyle = this.feedbackColor;
             ctx.fillText(this.feedbackText, w/2, h/2);
        }
    }
}
