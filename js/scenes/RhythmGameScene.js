import Background from '../game/Background.js';

export default class RhythmGameScene {
    constructor(game, selectedTheme = null) {
        this.game = game;
        this.background = new Background(game);
        this.score = 0;
        this.combo = 0;
        this.notes = []; // Visual notes
        this.noteTimeline = []; // Pre-calculated spawn times
        this.isPlaying = false;
        this.startTime = 0;
        this.travelTime = 1.2; // Time from spawn to hit
        this.spawnIndex = 0;
        this.selectedTheme = selectedTheme;
        
        // Effects
        this.feedbackText = '';
        this.feedbackTimer = 0;
        this.cameraShake = 0;
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
            // Pick a random theme if none selected
            const themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'sans', 'pepe', 'nue', 'menu'];
            themeName = themes[Math.floor(Math.random() * themes.length)];
        }

        console.log(`Starting Rhythm Game with theme: ${themeName} (Offset: ${this.audioOffset}s)`);

        // Get theme data
        const themeData = this.game.soundManager.leitmotifManager.getTheme(themeName);
        if (!themeData) {
            console.error("Theme not found!");
            // Fallback
            return;
        }

        // Pre-calculate timeline
        this.noteTimeline = [];
        let currentTime = 0;
        const secondsPerBeat = 60 / themeData.tempo;
        let lastNoteTime = -1;

        themeData.sequence.forEach(step => {
            const hasNotes = Array.isArray(step.notes) ? step.notes.length > 0 : !!step.notes;

            if (hasNotes) {
                // Enforce minimum gap to reduce spam (optional, can adjust)
                if (currentTime - lastNoteTime >= 0.10) {
                    const noteName = Array.isArray(step.notes) ? step.notes[0] : step.notes;
                    this.noteTimeline.push({
                        time: currentTime,
                        note: noteName,
                        spawned: false
                    });
                    lastNoteTime = currentTime;
                }
            }
            currentTime += step.duration * secondsPerBeat;
        });

        // Start Music
        this.game.soundManager.playBossTheme(themeName);
        this.startTime = performance.now() / 1000;
        this.isPlaying = true;
    }

    update(dt) {
        if (!this.isPlaying) return;
        
        this.background.update(dt);

        // Screen Shake Decay
        if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 20);
        // Combo Scale Decay
        if (this.comboScale > 1.0) this.comboScale = Math.max(1.0, this.comboScale - dt * 2);
        // Feedback Decay
        if (this.feedbackTimer > 0) this.feedbackTimer -= dt;

        const currentTime = (performance.now() / 1000) - this.startTime;

        // Spawn notes
        // Apply Audio Offset to spawn time:
        // If user hits late (positive offset), visual needs to be earlier relative to audio? 
        // Typically: Visual Time = Audio Time - Offset
        // So we check against (currentTime - offset)
        const visualProgamTime = currentTime - this.audioOffset;

        while (this.spawnIndex < this.noteTimeline.length) {
            const noteEvent = this.noteTimeline[this.spawnIndex];
            // We want the note to Arrive when visualProgramTime == noteEvent.time
            // So we spawn when visualProgramTime >= noteEvent.time - travelTime
            const spawnThreshold = noteEvent.time - this.travelTime;

            if (visualProgamTime >= spawnThreshold) {
                this.spawnNote(noteEvent.time, noteEvent.note);
                this.spawnIndex++;
            } else {
                break; 
            }
        }

        // Update visual notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const timeUntilHit = note.arrivalTime - visualProgamTime;
            
            // Progress: 0 at spawn, 1 at target
            // timeUntilHit goes from travelTime -> 0
            note.progress = 1.0 - (timeUntilHit / this.travelTime);

            if (note.progress >= 1.2) {
                // Miss
                this.notes.splice(i, 1);
                this.combo = 0;
                this.showFeedback("MISS", '#888');
            }
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

        // Input
        // Any key in range (Z,X,C,V etc) triggers hit check
        // Simplified: Any key down event checks for hit
        const keys = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'Space', 'Enter'];
        let hitPressed = false;
        
        // Check standard inputs
        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) hitPressed = true;
        
        // Also check raw keys if input manager exposes them or if we mapped them
        if (this.game.input.keys['KeyZ'] && !this.game.input.prevKeys['KeyZ']) hitPressed = true;
        if (this.game.input.keys['KeyX'] && !this.game.input.prevKeys['KeyX']) hitPressed = true;
        
        if (hitPressed) {
            this.checkHit(visualProgamTime);
        }

        // Exit
        if (this.game.input.isPressed('BOMB') || this.game.input.isPressed('ESC')) {
            this.game.soundManager.stopBossTheme();
            import('./RhythmSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    spawnNote(arrivalTime, noteName) {
        const angle = Math.floor(Math.random() * 8) * (Math.PI / 4);
        this.notes.push({
            angle: angle,
            arrivalTime: arrivalTime,
            progress: 0,
            color: this.getRandomColor()
        });
    }

    getRandomColor() {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    checkHit(visualTime) {
        let bestNoteIndex = -1;
        let minDiff = Infinity;

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            const diff = Math.abs(visualTime - note.arrivalTime);
            if (diff < minDiff) {
                minDiff = diff;
                bestNoteIndex = i;
            }
        }

        if (bestNoteIndex !== -1) {
            const diff = minDiff;
            // Hit Windows
            if (diff < 0.05) {
                this.registerHit(bestNoteIndex, 300, "PERFECT!", '#0ff');
            } else if (diff < 0.10) {
                this.registerHit(bestNoteIndex, 100, "GOOD", '#0f0');
            } else if (diff < 0.20) {
                this.registerHit(bestNoteIndex, 50, "BAD", '#ff0');
                this.combo = 0; // Break combo on bad? Usually keeps but low score. Let's break for strictness or keep? Touhou is strict.
            } else {
                // Too early/late - ignore or miss?
                // If extremely early, maybe ignore (spam protection)
            }
        }
    }

    registerHit(index, points, text, color) {
        const note = this.notes[index];
        
        // Visuals
        // Calculate hit position
        const radius = 200;
        const hx = this.game.width/2 + Math.cos(note.angle) * radius;
        const hy = this.game.height/2 + Math.sin(note.angle) * radius;

        this.createExplosion(hx, hy, color); 
        
        this.notes.splice(index, 1);
        this.score += points + this.combo * 10;
        this.combo++;
        this.comboScale = 1.5; // Pulse combo
        this.cameraShake = 5; 
        
        this.showFeedback(text, color);
    }

    showFeedback(text, color) {
        this.feedbackText = text;
        this.feedbackColor = color;
        this.feedbackTimer = 0.5;
    }

    createExplosion(x, y, color) {
        for(let i=0; i<15; i++) {
            const ang = Math.random()*Math.PI*2;
            const speed = 50 + Math.random()*200;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed,
                life: 0.5, maxLife: 0.5,
                color: color,
                size: 3 + Math.random()*8
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;
        
        // Shake
        const sx = (Math.random()-0.5) * this.cameraShake;
        const sy = (Math.random()-0.5) * this.cameraShake;
        
        ctx.save();
        ctx.translate(sx, sy);

        // Background
        this.background.render(renderer);
        
        // Darken background slightly for contrast
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);
        
        // Beat Pulse (Visual)
        const beatTime = (performance.now()/1000) % 0.5; // Approx pulse
        const pulse = 1.0 + (beatTime < 0.1 ? 0.05 : 0);

        const cx = w / 2;
        const cy = h / 2;
        const radius = 200 * pulse;

        // Draw Ring
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Notes
        this.notes.forEach(note => {
            const startDist = radius + 400;
            const endDist = radius; // Target radius
            const r = startDist - (startDist - endDist) * note.progress;

            const x = cx + Math.cos(note.angle) * r;
            const y = cy + Math.sin(note.angle) * r;

            ctx.fillStyle = note.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = note.color;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
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
        
        // Centered Combo
        if (this.combo > 0) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(this.comboScale, this.comboScale);
            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = `hsl(${Date.now()/5 % 360}, 100%, 50%)`;
            ctx.textAlign = 'center';
            ctx.fillText(`${this.combo}`, 0, 0);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText("COMBO", 0, 40);
            ctx.restore();
        }

        // Feedback
        if (this.feedbackTimer > 0) {
            ctx.save();
            ctx.translate(cx, cy - 100);
            const scale = 1.0 + Math.sin(this.feedbackTimer * 10) * 0.1;
            ctx.scale(scale, scale);
            ctx.fillStyle = this.feedbackColor;
            ctx.textAlign = 'center';
            ctx.font = 'bold 40px Arial';
            ctx.fillText(this.feedbackText, 0, 0);
            ctx.restore();
        }
        
        // Controls
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '16px Arial';
        ctx.fillText(`Z / X / SPACE to Hit!  |  Offset: ${Math.round(this.audioOffset*1000)}ms`, w / 2, h - 30);

        ctx.restore(); // Undo Shake
    }
}
