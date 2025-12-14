import Background from '../game/Background.js';

export default class CalibrationScene {
    constructor(game) {
        this.game = game;
        this.background = new Background(game);
        
        // Settings
        this.audioOffset = this.game.config.audioOffset || 0;
        this.game.config.audioOffset = this.audioOffset; // Ensure set

        // Metronome
        this.interval = 60 / 120; // 120 BPM
        this.lastBeatTime = 0;
        
        // State
        this.mode = 'AUDIO'; // 'AUDIO' or 'VISUAL'
        this.taps = [];
        this.instructions = "Listen to the beat and tap any key!";
        
        // Visuals
        this.beatProgress = 0;
    }

    update(dt) {
        this.background.update(dt);
        
        const now = performance.now() / 1000;
        
        // Metronome Logic
        if (now - this.lastBeatTime >= this.interval) {
            this.lastBeatTime = now;
            this.game.soundManager.playShoot(); // Click sound
        }
        
        this.beatProgress = (now - this.lastBeatTime) / this.interval;
        
        // Input Handling
        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm') || 
            this.isAnyKeyTap()) {
             if (this.mode === 'AUDIO') {
                 this.registerTap(now);
             }
        }
        
        // Mode Switching
        if (this.game.input.isPressed('FOCUS')) { // Shift to toggle
            this.toggleMode();
        }

        // Manual Adjust
        if (this.game.input.isPressed('LEFT')) {
            this.audioOffset -= 0.005;
            this.game.soundManager.playMenuMove();
        }
        if (this.game.input.isPressed('RIGHT')) {
            this.audioOffset += 0.005;
            this.game.soundManager.playMenuMove();
        }
        
        // Save & Exit
        if (this.game.input.isPressed('BOMB') || this.game.input.isPressed('ESC') || this.game.input.keys['KeyC']) {
             this.saveAndExit();
        }
    }
    
    isAnyKeyTap() {
         const keys = ['KeyZ', 'KeyX', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'Space'];
         for(const k of keys) {
             if (this.game.input.keys[k] && !this.game.input.prevKeys[k]) return true;
         }
         return false;
    }

    toggleMode() {
        if (this.mode === 'AUDIO') {
            this.mode = 'VISUAL';
            this.instructions = "Align the shapes visually using Left/Right arrow keys.";
            this.taps = [];
        } else {
            this.mode = 'AUDIO';
            this.instructions = "Listen to the beat and tap any key!";
        }
        this.game.soundManager.playMenuSelect();
    }
    
    registerTap(time) {
        let diff = time - this.lastBeatTime;
        if (diff > this.interval / 2) {
            diff -= this.interval; 
        }
        
        this.taps.push(diff);
        if (this.taps.length > 20) this.taps.shift();
    }
    
    saveAndExit() {
        this.game.config.audioOffset = this.audioOffset;
        this.game.saveOptions(); // Helper in Game.js
        this.game.soundManager.playMenuCancel();
        
        import('./RhythmSelectScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;
        const cx = w/2;
        const cy = h/2;
        
        this.background.render(renderer);
        
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, w, h);
        
        // Header
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText("CALIBRATION", cx, 60);

        // Mode Tabs
        ctx.font = '20px Arial';
        ctx.fillStyle = this.mode === 'AUDIO' ? '#ff0' : '#888';
        ctx.fillText("AUDIO (Tap)", cx - 100, 100);
        ctx.fillStyle = this.mode === 'VISUAL' ? '#ff0' : '#888';
        ctx.fillText("VISUAL (Adjust)", cx + 100, 100);
        
        // Instructions
        ctx.fillStyle = '#aaa';
        ctx.font = 'italic 18px Arial';
        ctx.fillText("Press SHIFT to switch modes", cx, 130);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(this.instructions, cx, cy - 100);

        // Visualizer
        const barWidth = 400;
        
        // Center Line (The "Beat")
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 40);
        ctx.lineTo(cx, cy + 40);
        ctx.stroke();

        // Audio Mode: Flash on beat
        if (this.mode === 'AUDIO') {
            if (this.beatProgress < 0.1) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(cx - 200, cy - 50, 400, 100);
            }
            
            // Show recent taps
            this.taps.forEach(tap => {
                const x = cx + (tap * 500); // Scale ms to pixels
                ctx.fillStyle = Math.abs(tap) < 0.05 ? '#0f0' : '#f00';
                ctx.fillRect(x - 2, cy - 30, 4, 60);
            });
            
            // Stats
            if (this.taps.length > 0) {
                 const avg = this.taps.reduce((a,b)=>a+b,0)/this.taps.length;
                 const ms = (avg * 1000).toFixed(1);
                 ctx.fillStyle = '#fff';
                 ctx.fillText(`Average Latency: ${ms} ms`, cx, cy + 80);
                 
                 // Suggestion
                 if (this.taps.length > 5) {
                     ctx.fillStyle = '#ff0';
                     ctx.fillText(`Suggested Adjust: ${(-avg*1000).toFixed(0)} ms`, cx, cy + 110);
                     ctx.font = '16px Arial';
                     ctx.fillText("(Manually set offset to this value if consistent)", cx, cy + 130);
                 }
            }
        } 
        else if (this.mode === 'VISUAL') {
            // Visual Mode: Moving Ball
            // Visual = Audio - Offset
            // We want the ball to HIT the line when the sound plays IF calibrated.
            // visualTime = realTime - offset?
            // If offset is positive (audio is late), visual needs to be delayed?
            // Usually: Audio is late. Visual is early.
            // We want visual to Match Audio.
            
            // Let's visualize the "Offset" correction.
            // We simulate a beat happening.
            // Correctly calibrated: Ball hits line exactly when sound plays.
            
            // The position is based on (time - beatTime).
            // Apply offset to time.
            
            // Phase goes 0..1.
            // We want phase=0 (Sound) to align with x=cx.
            // Current visual phase = (time - offset) ...
            
            // Let's iterate approach.
            // Ball moves from Left to Right.
            // x = cx + (progress - 0.5) * width.
            // progress is based on (now - lastBeat - offset).
            
            let prog = (this.beatProgress - this.audioOffset);
            // Wrap
            prog = prog - Math.floor(prog);
            
            // Make typical rhythm game approach (0 to 1, hit at 1?)
            // Or oscillation -0.5 to 0.5.
            
            let displayX = 0;
            if (prog > 0.5) prog -= 1.0; // -0.5 to 0.5
            
            // Visual Ball
            displayX = cx + (prog * 600); // Speed
            
            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.arc(displayX, cy, 15, 0, Math.PI*2);
            ctx.fill();
            
            // Ghost (Original Audio Beat) for reference? No, that's confusing.
            // Just rely on audio. "Make the ball hit the line when you hear the beep".
        }

        // Offset Display (Editable)
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText(`Offset: ${(this.audioOffset * 1000).toFixed(0)} ms`, cx, h - 100);
        
        // Navigation Footer
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText("Left/Right: Adjust   |   C / ESC: Save & Exit", cx, h - 40);
    }
}
