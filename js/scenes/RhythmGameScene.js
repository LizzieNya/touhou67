export default class RhythmGameScene {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.combo = 0;
        this.notes = []; // Visual notes
        this.noteTimeline = []; // Pre-calculated spawn times
        this.isPlaying = false;
        this.startTime = 0;
        this.travelTime = 1.4; // Faster travel for "tricky tech" feel, adjusted for offset
        this.spawnIndex = 0;

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        this.start();
    }

    start() {
        if (!this.game.soundManager) return;

        // Pick a random theme
        const themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'sans'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        console.log(`Starting Rhythm Game with theme: ${randomTheme}`);

        // Get theme data
        const themeData = this.game.soundManager.leitmotifManager.getTheme(randomTheme);
        if (!themeData) {
            console.error("Theme not found!");
            return;
        }

        // Pre-calculate timeline
        this.noteTimeline = [];
        let currentTime = 0;
        const secondsPerBeat = 60 / themeData.tempo;
        let lastNoteTime = -1;

        themeData.sequence.forEach(step => {
            // If step has notes (is not a rest), add a hit object
            const hasNotes = Array.isArray(step.notes) ? step.notes.length > 0 : !!step.notes;

            if (hasNotes) {
                // "Less notespammy": Enforce minimum gap
                // If notes are too close (e.g. < 0.12s), skip to reduce spam
                if (currentTime - lastNoteTime >= 0.12) {
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
        this.game.soundManager.playBossTheme(randomTheme);
        this.startTime = performance.now() / 1000;
        this.isPlaying = true;
    }

    update(dt) {
        if (!this.isPlaying) return;

        const currentTime = (performance.now() / 1000) - this.startTime;

        // Spawn notes
        while (this.spawnIndex < this.noteTimeline.length) {
            const noteEvent = this.noteTimeline[this.spawnIndex];
            const spawnTime = noteEvent.time - this.travelTime;

            if (currentTime >= spawnTime) {
                this.spawnNote(noteEvent.time, noteEvent.note);
                this.spawnIndex++;
            } else {
                break; // Next note is too far in future
            }
        }

        // Update visual notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const timeUntilHit = note.arrivalTime - currentTime;
            note.progress = 1.0 - (timeUntilHit / this.travelTime);

            if (note.progress >= 1.2) {
                // Miss
                this.notes.splice(i, 1);
                this.combo = 0;
            }
        }

        // Input Handling
        // Z, X, D, F, J, K
        const keys = ['KeyZ', 'KeyX', 'KeyD', 'KeyF', 'KeyJ', 'KeyK'];
        let hitPressed = false;

        for (const code of keys) {
            if (this.game.input.keys[code] && !this.game.input.prevKeys[code]) {
                hitPressed = true;
                break;
            }
        }

        if (hitPressed) {
            this.checkHit(currentTime);
        }

        // Exit with C
        if (this.game.input.keys['KeyC'] && !this.game.input.prevKeys['KeyC']) {
            this.game.soundManager.stopBossTheme();
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    spawnNote(arrivalTime, noteName) {
        // "More random directions"
        // 8 directions
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

    checkHit(currentTime) {
        // Find closest note
        let bestNoteIndex = -1;
        let minDiff = Infinity;

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            const diff = Math.abs(currentTime - note.arrivalTime);
            if (diff < minDiff) {
                minDiff = diff;
                bestNoteIndex = i;
            }
        }

        // 100ms hit window (tighter for "tricky tech")
        if (bestNoteIndex !== -1 && minDiff < 0.10) {
            // Hit!
            const note = this.notes[bestNoteIndex];
            this.notes.splice(bestNoteIndex, 1);
            this.score += 100 + this.combo * 10;
            this.combo++;

            // Visual feedback (particle?)
            if (this.game.sceneManager.currentScene.particleSystem) {
                // Assuming we can access it, or just generic flash
            }
        } else {
            // Miss/Spam click (optional: punish spam?)
            // For now, don't reset combo on spam, only on miss (handled in update)
            // But if they press and there's nothing close, maybe nothing happens?
            // Or maybe reset combo if they are WAY off?
            // Let's keep it lenient for spamming, but strict for timing.
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 200;

        // Background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        // Draw Ring
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Judgement Line (Pulse on beat?)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Notes
        this.notes.forEach(note => {
            // Outside -> Ring (Converging)
            // Spawn at radius + 300 (approx 500px from center)
            // Hit at radius (200px)
            const startDist = radius + 400;
            const endDist = radius;

            // Linear interpolation based on progress
            // progress 0 = startDist
            // progress 1 = endDist
            const r = startDist - (startDist - endDist) * note.progress;

            const x = cx + Math.cos(note.angle) * r;
            const y = cy + Math.sin(note.angle) * r;

            ctx.fillStyle = note.color || '#f0f';
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        });

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        ctx.fillText(`Combo: ${this.combo}`, 20, 70);
        ctx.textAlign = 'center';
        ctx.fillText(`Keys: Z, X, D, F, J, K`, w / 2, h - 60);
        ctx.fillText(`Press C to Exit`, w / 2, h - 30);

        // Center visual
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}
