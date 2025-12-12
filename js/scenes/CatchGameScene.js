import SpriteGenerator from '../game/SpriteGenerator.js';

export default class CatchGameScene {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.combo = 0;
        this.fruits = []; // Falling objects
        this.noteTimeline = [];
        this.isPlaying = false;
        this.startTime = 0;
        this.spawnIndex = 0;
        this.fallSpeed = 300; // Pixels per second

        // Catcher properties
        this.catcher = {
            x: game.width / 2,
            y: game.height - 50,
            width: 64,
            height: 64,
            speed: 400
        };

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        // Generate Assets
        this.generateAssets();

        this.start();
    }

    generateAssets() {
        // Use SpriteGenerator to create simple assets if not loaded
        // Ideally we use loaded images, but fallback to drawing
    }

    start() {
        if (!this.game.soundManager) return;

        // Pick a random theme
        const themes = ['rumia', 'cirno', 'meiling', 'patchouli', 'sakuya', 'remilia', 'flandre', 'sans'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        console.log(`Starting Catch Game with theme: ${randomTheme}`);

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

        themeData.sequence.forEach(step => {
            const hasNotes = Array.isArray(step.notes) ? step.notes.length > 0 : !!step.notes;

            if (hasNotes) {
                let noteName = Array.isArray(step.notes) ? step.notes[0] : step.notes;
                // Handle object-based notes (e.g. { note: 'C4', type: 'sawtooth' })
                if (typeof noteName === 'object' && noteName !== null && noteName.note) {
                    noteName = noteName.note;
                }

                this.noteTimeline.push({
                    time: currentTime,
                    note: noteName,
                    spawned: false
                });
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

        // Update Catcher Position (Mouse or Keyboard)
        if (this.game.input.mouse) {
            // Mouse control
            this.catcher.x = this.game.input.mouse.x;
        } else {
            // Keyboard control fallback
            if (this.game.input.isDown('LEFT')) this.catcher.x -= this.catcher.speed * dt;
            if (this.game.input.isDown('RIGHT')) this.catcher.x += this.catcher.speed * dt;
        }

        // Clamp to screen
        this.catcher.x = Math.max(this.catcher.width / 2, Math.min(this.game.width - this.catcher.width / 2, this.catcher.x));

        // Spawn Fruits
        // We want fruit to hit bottom at 'note.time'.
        // Fall time = height / speed
        const fallTime = this.game.height / this.fallSpeed;

        while (this.spawnIndex < this.noteTimeline.length) {
            const noteEvent = this.noteTimeline[this.spawnIndex];
            const spawnTime = noteEvent.time - fallTime;

            if (currentTime >= spawnTime) {
                this.spawnFruit(noteEvent.note);
                this.spawnIndex++;
            } else {
                break;
            }
        }

        // Update Fruits
        for (let i = this.fruits.length - 1; i >= 0; i--) {
            const fruit = this.fruits[i];
            fruit.y += this.fallSpeed * dt;

            // Collision Check
            if (fruit.y >= this.catcher.y - this.catcher.height / 2 &&
                fruit.y <= this.catcher.y + this.catcher.height / 2 &&
                Math.abs(fruit.x - this.catcher.x) < this.catcher.width / 2 + 10) {

                // Caught!
                this.fruits.splice(i, 1);
                this.score += 300 + this.combo * 10;
                this.combo++;
                if (this.game.soundManager) this.game.soundManager.playEnemyHit();
                continue;
            }

            // Miss
            if (fruit.y > this.game.height) {
                this.fruits.splice(i, 1);
                this.combo = 0;
            }
        }

        // Exit
        if (this.game.input.isPressed('BOMB')) {
            this.game.soundManager.stopBossTheme();
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    spawnFruit(noteName) {
        // Map pitch to X position
        // C = Left, B = Right
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const key = (typeof noteName === 'string') ? noteName.replace(/[0-9#]/g, '') : 'C';
        let index = notes.indexOf(key);
        if (index === -1) index = 3; // Center default

        // Add some randomness or octave influence
        // Map 0-6 to screen width
        const margin = 50;
        const availableWidth = this.game.width - margin * 2;
        const step = availableWidth / 6;

        const x = margin + index * step;

        this.fruits.push({
            x: x,
            y: -20,
            color: this.getNoteColor(index)
        });
    }

    getNoteColor(index) {
        const colors = ['#f00', '#f80', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
        return colors[index % colors.length];
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        ctx.fillStyle = '#223';
        ctx.fillRect(0, 0, w, h);

        // Draw Catcher
        ctx.fillStyle = '#fff';
        // Simple Reimu-like shape
        ctx.beginPath();
        ctx.arc(this.catcher.x, this.catcher.y, 20, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.catcher.x - 15, this.catcher.y + 10, 30, 20); // Body
        // Plate
        ctx.fillStyle = '#aa8';
        ctx.fillRect(this.catcher.x - 30, this.catcher.y - 25, 60, 10);

        // Draw Fruits
        this.fruits.forEach(fruit => {
            ctx.fillStyle = fruit.color;
            ctx.beginPath();
            ctx.arc(fruit.x, fruit.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        ctx.fillText(`Combo: ${this.combo}`, 20, 70);
        ctx.fillText(`Use Mouse to Catch! X to Exit`, 20, h - 30);
    }
}
