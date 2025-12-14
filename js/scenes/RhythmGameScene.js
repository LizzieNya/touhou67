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
        this.travelTime = 1.5; // Slightly slower for better readability? Or faster? Let's keep 1.5
        this.spawnIndex = 0;
        this.selectedTheme = selectedTheme;
        
        // Effects
        this.feedbackText = '';
        this.feedbackTimer = 0;
        this.cameraShake = 0;
        this.particles = [];
        this.comboScale = 1.0;

        // Settings
        this.audioOffset = this.game.config?.audioOffset || 0;

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
        
        this.bpm = themeData.tempo || 120; // Save BPM for pulsing

        // Pre-calculate timeline
        this.noteTimeline = [];
        let currentTime = 0;
        const secondsPerBeat = 60 / themeData.tempo;
        let lastNoteTime = -1;

        themeData.sequence.forEach(step => {
            const hasNotes = Array.isArray(step.notes) ? step.notes.length > 0 : !!step.notes;

            if (hasNotes) {
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

        // Spawn notes logic...
        const visualProgamTime = currentTime - this.audioOffset;

        while (this.spawnIndex < this.noteTimeline.length) {
            const noteEvent = this.noteTimeline[this.spawnIndex];
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
        // Hit Keys: Z, X, D, F, J, K, Space, Enter, Click
        // Exit Key: C
        
         // Simplified Input Check
        const hitKeys = ['KeyZ', 'KeyX', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'Space', 'Enter'];
        let hitPressed = false;
        
        for(const k of hitKeys) {
            if (this.game.input.keys[k] && !this.game.input.prevKeys[k]) {
                hitPressed = true;
                break;
            }
        }
        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) hitPressed = true;
        
        // Exclude 'KeyC' from hit keys explicitly
        if (this.game.input.keys['KeyC']) hitPressed = false;

        if (hitPressed) {
            this.checkHit(visualProgamTime);
        }

        // Exit
        if (this.game.input.keys['KeyC'] && !this.game.input.prevKeys['KeyC'] || this.game.input.isPressed('ESC')) {
            this.game.soundManager.stopBossTheme();
            import('./RhythmSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    spawnNote(arrivalTime, noteName) {
        // Quantize angles to 8 directions for cleaner "lanes"
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

        // Find closest note
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
            // Lenient Hit Windows
            if (diff < 0.08) {
                this.registerHit(bestNoteIndex, 300, "PERFECT!", '#0ff');
            } else if (diff < 0.15) {
                this.registerHit(bestNoteIndex, 100, "GOOD", '#0f0');
            } else if (diff < 0.25) {
                this.registerHit(bestNoteIndex, 50, "BAD", '#ff0');
                this.combo = 0; 
            }
        }
    }

    registerHit(index, points, text, color) {
        const note = this.notes[index];
        const radius = 200; // Hit Ring Radius
        const hx = this.game.width/2 + Math.cos(note.angle) * radius;
        const hy = this.game.height/2 + Math.sin(note.angle) * radius;

        this.createExplosion(hx, hy, color); 
        this.notes.splice(index, 1);
        this.score += points + this.combo * 10;
        this.combo++;
        this.comboScale = 1.3;
        this.cameraShake = 5; 
        this.showFeedback(text, color);
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
                life: 0.4, maxLife: 0.4,
                color: color,
                size: 3 + Math.random()*6
            });
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;
        const cx = w / 2;
        const cy = h / 2;
        
        // Shake
        const sx = (Math.random()-0.5) * this.cameraShake;
        const sy = (Math.random()-0.5) * this.cameraShake;
        
        ctx.save();
        ctx.translate(sx | 0, sy | 0); // Snap shake too

        // 1. Background (Darkened/Tinted)
        this.background.render(renderer);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'; // Heavy darken for contrast
        ctx.fillRect(0, 0, w, h);
        
        // 2. Beat Pulse
        const beatDuration = 60 / this.bpm;
        const beatTime = (performance.now() / 1000) % beatDuration;
        const pulse = 1.0 + (beatTime < 0.1 ? 0.05 : 0); // Subtle pop on beat
        const hitRadius = 200 * pulse; 

        // 3. Draw Lane Guides
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
             const ang = i * (Math.PI / 4);
             ctx.beginPath();
             ctx.moveTo(cx + Math.cos(ang) * hitRadius, cy + Math.sin(ang) * hitRadius);
             ctx.lineTo(cx + Math.cos(ang) * 1000, cy + Math.sin(ang) * 1000); // Offscreen
             ctx.stroke();
        }
        ctx.restore();

        // 4. Hit Ring (The Critical Zone)
        ctx.beginPath();
        ctx.arc(cx, cy, hitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0ff';
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset expensive property

        // 5. Draw Notes
        this.notes.forEach(note => {
            const startDist = hitRadius + 500; 
            const endDist = hitRadius; 
            const r = startDist - (startDist - endDist) * note.progress; // Linear approach

            const x = cx + Math.cos(note.angle) * r;
            const y = cy + Math.sin(note.angle) * r;

            // Glow logic optimization: use Radial Gradient instead of shadowBlur if possible
            const grad = ctx.createRadialGradient(x, y, 10, x, y, 30);
            grad.addColorStop(0, note.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2); 
            ctx.fill();

            // Core
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Ring
            ctx.strokeStyle = note.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // 6. Particles
        ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(p => {
             ctx.globalAlpha = p.alpha;
             ctx.fillStyle = p.color;
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
             ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';

        // 7. UI / Feedback
        // Score
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // Combo
        if (this.combo > 0) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(this.comboScale, this.comboScale);
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            // Rainbow text
            ctx.fillStyle = `hsl(${Date.now()/5 % 360}, 100%, 70%)`; 
            ctx.fillText(`${this.combo}`, 0, 0);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText("COMBO", 0, 40);
            ctx.restore();
        }

        // Feedback Text (Good/Perfect/Miss)
        if (this.feedbackTimer > 0) {
            ctx.save();
            ctx.translate(cx, cy - 80);
            const scale = 1.0 + Math.sin(this.feedbackTimer * 10) * 0.1;
            ctx.scale(scale, scale);
            ctx.fillStyle = this.feedbackColor;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.font = 'bold 40px Arial';
            ctx.strokeText(this.feedbackText, 0, 0);
            ctx.fillText(this.feedbackText, 0, 0);
            ctx.restore();
        }
        
        // Footer Instructions
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '16px Arial';
        ctx.fillText(`Controls: Z / X / Space  |  Exit: C`, w / 2, h - 30);

        ctx.restore(); // Undo Shake
    }
}
