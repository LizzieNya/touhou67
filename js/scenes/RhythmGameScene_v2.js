
export default class RhythmGameScene {
    constructor(game, initialTheme = null) {
        this.game = game;
        this.score = 0;
        this.combo = 0;
        this.notes = []; // Visual notes objects
        this.noteTimeline = []; // Pre-calculated chart
        this.isPlaying = false;
        this.startTime = 0;
        
        // Settings (Arcade feel)
        this.scrollSpeed = 1.2; // Seconds to fall (Lower is faster/higher SV)
        this.hitWindow = {
            perfect: 0.040, // 40ms
            great: 0.080,   // 80ms
            good: 0.120     // 120ms
        };
        this.audioOffset = this.game.settings?.audioOffset || 0;
        
        this.lanes = 4;
        this.keyMapping = {
            'KeyD': 0,
            'KeyF': 1,
            'KeyJ': 2,
            'KeyK': 3
        };
        
        // Visual state
        this.lanePressed = [false, false, false, false];
        this.laneBeamTimer = [0, 0, 0, 0];
        
        this.effects = []; // Particles, judgements
        this.comboPulse = 0;

        this.currentTheme = initialTheme;
        
        // Hide sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        this.start();
    }

    start() {
        if (!this.game.soundManager) return;
        
        let themeToPlay = this.currentTheme;
        if (!themeToPlay) {
            const themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'nue', 'okuu', 'parsee'];
            themeToPlay = themes[Math.floor(Math.random() * themes.length)];
        }
        
        console.log(`Starting Arcade Rhythm Mode: ${themeToPlay}`);
        
        const themeData = this.game.soundManager.leitmotifManager.getTheme(themeToPlay);
        if (!themeData) {
            console.error("Theme not found:", themeToPlay);
            return;
        }

        // Generate Chart
        this.generateChart(themeData);
        
        // Start Audio
        this.game.soundManager.playBossTheme(themeToPlay);
        this.startTime = performance.now() / 1000 + this.audioOffset;
        this.isPlaying = true;
        this.currentTheme = null;
    }

    generateChart(themeData) {
        this.noteTimeline = [];
        let currentTime = 2.0; // Start with lead-in
        const secondsPerBeat = 60 / themeData.tempo;
        
        // Pitch to Lane mapping helper
        // "C3" -> number
        const getNoteVal = (note) => {
            if (!note) return 0;
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = parseInt(note.slice(-1)) || 4;
            const key = note.slice(0, -1);
            return octave * 12 + notes.indexOf(key);
        };

        // Heuristic mapping logic
        const mapToLane = (noteVal) => {
            // Adjust these ranges based on typical Touhou melodies
            // C3 (36) to C6 (72)
            if (noteVal < 48) return 0; // Low (Lane 1)
            if (noteVal < 55) return 1; // Mid-Low (Lane 2)
            if (noteVal < 62) return 2; // Mid-High (Lane 3)
            return 3;                   // High (Lane 4)
        };

        themeData.sequence.forEach(step => {
            const notes = Array.isArray(step.notes) ? step.notes : (step.notes ? [step.notes] : []);
            
            if (notes.length > 0) {
                notes.forEach(noteName => {
                    const val = getNoteVal(noteName);
                    const lane = mapToLane(val);
                    
                    // Avoid overlapping notes in same lane too close (simple filtering)
                    // ... (Implementation skipped for simplicity, allowing chords)
                    
                    this.noteTimeline.push({
                        time: currentTime,
                        lane: lane,
                        hit: false,
                        missed: false
                    });
                });
            }
            currentTime += step.duration * secondsPerBeat;
        });
        
        this.songDuration = currentTime + 3.0;
        this.spawnIndex = 0;
        
        // Sort timeline just in case
        this.noteTimeline.sort((a, b) => a.time - b.time);
    }

    update(dt) {
        if (!this.isPlaying) return;
        
        const currentTime = (performance.now() / 1000) - this.startTime;

        // Song End
        if (currentTime > this.songDuration) {
            // Restart with new song
            this.notes = [];
            this.effects = [];
            this.start();
            return;
        }

        // 1. Spawn Notes
        // Look ahead by scrollSpeed + buffer
        while (this.spawnIndex < this.noteTimeline.length) {
            const noteData = this.noteTimeline[this.spawnIndex];
            if (noteData.time <= currentTime + this.scrollSpeed) {
                // Spawn visual note
                this.notes.push({
                    data: noteData, // Reference to timeline item
                    time: noteData.time,
                    lane: noteData.lane,
                    y: 0, // Visual Y (0 to 1)
                    held: false
                });
                this.spawnIndex++;
            } else {
                break;
            }
        }

        // 2. Update Notes & Hit Detection
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            
            // Auto-Miss if passed
            if (currentTime > note.time + this.hitWindow.good && !note.data.hit) {
                if (!note.data.missed) {
                    this.triggerJudgement("MISS", '#f00');
                    this.combo = 0;
                    note.data.missed = true;
                }
                // Remove visual
                if (currentTime > note.time + 0.5) {
                    this.notes.splice(i, 1);
                }
                continue;
            }
            
            // Clean up hit notes
            if (note.data.hit) {
                 this.notes.splice(i, 1);
            }
        }

        // 3. Input Handling
        this.handleInput(currentTime);

        // 4. Update Effects
        this.effects.forEach((fx, i) => {
            fx.life -= dt;
            fx.y -= dt * 50; // Text floats up
            if (fx.life <= 0) this.effects.splice(i, 1);
        });

        // 5. Update Lane Beams
        for (let l = 0; l < 4; l++) {
            if (this.laneBeamTimer[l] > 0) this.laneBeamTimer[l] -= dt * 5;
        }
        
        if (this.comboPulse > 0) this.comboPulse -= dt * 5;
        
        // Exit
        if (this.game.input.keys['KeyC']) {
            this.game.soundManager.stopBossTheme();
             import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    handleInput(currentTime) {
        const input = this.game.input;
        
        // Check map
        Object.keys(this.keyMapping).forEach(key => {
            const lane = this.keyMapping[key];
            const isPressed = input.keys[key] && !input.prevKeys[key];
            const isHeld = input.keys[key];
            
            this.lanePressed[lane] = isHeld;
            
            if (isPressed) {
                this.laneBeamTimer[lane] = 1.0; // Flash beam
                
                // Check for hits in this lane
                // Find closest unhit note in lane
                let closestNote = null;
                let minDiff = Infinity;
                
                // Search visual notes (optimization: could search timeline, but visual notes are active subset)
                for (const note of this.notes) {
                    if (note.lane === lane && !note.data.hit && !note.data.missed) {
                        const diff = Math.abs(currentTime - note.time);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestNote = note;
                        }
                    }
                }
                
                if (closestNote && minDiff <= this.hitWindow.good) {
                    // Hit!
                    closestNote.data.hit = true;
                    this.combo++;
                    this.comboPulse = 1.0;
                    
                    let judge = "GOOD";
                    let color = "#0ff";
                    let scoreAdd = 50;
                    
                    if (minDiff <= this.hitWindow.perfect) {
                        judge = "PERFECT";
                        color = "#ff0"; // Gold
                        scoreAdd = 300;
                    } else if (minDiff <= this.hitWindow.great) {
                        judge = "GREAT";
                        color = "#0f0";
                        scoreAdd = 100;
                    }
                    
                    this.score += scoreAdd + (this.combo * 10);
                    this.triggerJudgement(judge, color);
                    this.createHitParticle(lane);
                    this.game.soundManager.playSfx('hit'); // Optional
                }
            }
        });
    }

    triggerJudgement(text, color) {
        this.effects.push({
            type: 'text',
            text: text,
            color: color,
            x: this.game.width / 2,
            y: this.game.height * 0.4,
            life: 0.5,
            scale: 1.5
        });
    }

    createHitParticle(lane) {
         // Add visual flare at receptor
         this.effects.push({
             type: 'HitFlare',
             lane: lane,
             life: 0.2
         });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;
        
        // Background
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, w, h);
        
        // 3D Perspective Setup
        // Lane Widths: Top (narrow), Bottom (wide)
        const trackTopW = 200;
        const trackBotW = 500;
        const trackTopY = 0; // Horizon
        const trackBotY = h - 50; // Judgement Line Y
        const centerX = w / 2;
        
        // Gradient Highway
        const grad = ctx.createLinearGradient(0, trackTopY, 0, trackBotY);
        grad.addColorStop(0, 'rgba(0,0,50,0)');
        grad.addColorStop(1, 'rgba(0,0,100,0.5)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(centerX - trackTopW / 2, trackTopY);
        ctx.lineTo(centerX + trackTopW / 2, trackTopY);
        ctx.lineTo(centerX + trackBotW / 2, trackBotY);
        ctx.lineTo(centerX - trackBotW / 2, trackBotY);
        ctx.fill();
        
        // Draw Lanes / Dividers
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 4; i++) {
            const p = i / 4; // 0 to 1
            const topX = (centerX - trackTopW/2) + trackTopW * p;
            const botX = (centerX - trackBotW/2) + trackBotW * p;
            
            ctx.beginPath();
            ctx.moveTo(topX, trackTopY);
            ctx.lineTo(botX, trackBotY);
            ctx.stroke();
        }
        
        // Judgement Line
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - trackBotW/2, trackBotY);
        ctx.lineTo(centerX + trackBotW/2, trackBotY);
        ctx.stroke();

        const currentTime = (performance.now()/1000) - this.startTime;

        // Draw Beams
        for (let l = 0; l < 4; l++) {
            if (this.laneBeamTimer[l] > 0) {
                const alpha = this.laneBeamTimer[l];
                const p1 = l / 4;
                const p2 = (l+1) / 4;
                
                const topX1 = (centerX - trackTopW/2) + trackTopW * p1;
                const topX2 = (centerX - trackTopW/2) + trackTopW * p2;
                const botX1 = (centerX - trackBotW/2) + trackBotW * p1;
                const botX2 = (centerX - trackBotW/2) + trackBotW * p2;
                
                const beamGrad = ctx.createLinearGradient(0, trackTopY, 0, trackBotY);
                beamGrad.addColorStop(0, `rgba(255,255,255,0)`);
                beamGrad.addColorStop(1, `rgba(255,255,255,${alpha * 0.3})`);
                
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(topX1, trackTopY);
                ctx.lineTo(topX2, trackTopY);
                ctx.lineTo(botX2, trackBotY);
                ctx.lineTo(botX1, trackBotY);
                ctx.fill();
                
                // Key press flash at bottom
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillRect(botX1, trackBotY, botX2-botX1, 10);
            }
        }

        // Draw Notes
        this.notes.forEach(note => {
            const timeDiff = note.time - currentTime; // Time until hit (seconds)
            const progress = 1 - (timeDiff / this.scrollSpeed); // 0 (top) to 1 (hit)
            
            if (progress < 0 || progress > 1.2) return; // Out of view
            
            // Perspective Projection
            // Y is linear or exponential? Linear is easiest for reading.
            // Let's use linear Y for "Constant Speed".
            // Y = trackTopY + (trackBotY - trackTopY) * progress
            
            const y = trackTopY + (trackBotY - trackTopY) * progress;
            
            // Width at Y
            // Interpolate width between top and bottom
            const currentTrackWidth = trackTopW + (trackBotW - trackTopW) * progress;
            const laneWidth = currentTrackWidth / 4;
            
            // X position
            // Start of Track X at this Y
            const currentLeftX = centerX - currentTrackWidth / 2;
            const x = currentLeftX + laneWidth * note.lane;
            
            // Note Height scales with perspective (optional) or constant
            const h = 20 * (0.5 + 0.5 * progress);
            
            // Color
            const colors = ['#0ff', '#fff', '#fff', '#0ff']; // SDVX Styles (Blue/White)
            ctx.fillStyle = colors[note.lane];
            
            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors[note.lane];
            
            ctx.fillRect(x + 2, y - h/2, laneWidth - 4, h);
            
            ctx.shadowBlur = 0;
            
            // Inner Core
            ctx.fillStyle = '#fff';
            ctx.fillRect(x + 5, y - h/4, laneWidth - 10, h/2);
        });
        
        // Draw Effects (Text)
        ctx.textAlign = 'center';
        this.effects.forEach(fx => {
            if (fx.type === 'text') {
                ctx.save();
                const scale = 1 + Math.sin(fx.life * Math.PI) * 0.2;
                ctx.translate(fx.x, fx.y);
                ctx.scale(scale, scale);
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = fx.color;
                ctx.fillStyle = fx.color;
                ctx.font = 'bold 48px Arial';
                ctx.fillText(fx.text, 0, 0);
                
                ctx.restore();
            }
        });
        
        // UI overlay
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${Math.floor(this.score)}`, 20, 50);
        
        ctx.textAlign = 'right';
        ctx.font = 'bold 32px Arial';
        if (this.combo > 0) {
            const pulse = 1 + this.comboPulse * 0.2;
            ctx.save();
            ctx.translate(w - 50, 60);
            ctx.scale(pulse, pulse);
            ctx.fillText(`${this.combo} COMBO`, 0, 0);
            ctx.restore();
        }
        
        // Controls hint
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText("D  F  J  K", centerX, trackBotY + 40);
        
        ctx.fillText("Press C to Exit", w/2, h - 20);
    }
}
