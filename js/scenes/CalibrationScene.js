import Background from '../game/Background.js';

export default class CalibrationScene {
    constructor(game) {
        this.game = game;
        this.background = new Background(game);
        
        // State
        this.offset = this.game.config.audioOffset || 0;
        this.visualOffset = 0; // Visual specific (if needed) but user asked for "audio and visual". Often combined into one "Input Offset".
        
        // Metronome
        this.interval = 60 / 120; // 120 BPM
        this.lastBeatTime = 0;
        this.beatCount = 0;
        
        // Input tracking
        this.taps = [];
        this.isListening = false;
        
        // Visuals
        this.beatProgress = 0;
    }

    update(dt) {
        this.background.update(dt);
        
        const now = performance.now() / 1000;
        
        // Metronome Logic
        if (now - this.lastBeatTime >= this.interval) {
            this.lastBeatTime = now;
            this.beatCount++;
            this.game.soundManager.playShoot(); // Click sound
        }
        
        // Calculate progress (0 to 1) for visual metronome
        this.beatProgress = (now - this.lastBeatTime) / this.interval;
        
        // Input Handling
        if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm') || 
            this.game.input.keys['KeyZ'] || this.game.input.keys['KeyX'] || 
            this.game.input.keys['KeyD'] || this.game.input.keys['KeyF'] || 
            this.game.input.keys['KeyJ'] || this.game.input.keys['KeyK']) {
             this.registerTap(now);
        }
        
        // Adjust Manually
        if (this.game.input.isPressed('LEFT')) {
            this.offset -= 0.005;
        }
        if (this.game.input.isPressed('RIGHT')) {
            this.offset += 0.005;
        }
        
        // Save & Exit
        if (this.game.input.isPressed('BOMB') || this.game.input.isPressed('ESC')) {
             this.saveAndExit();
        }
    }
    
    registerTap(time) {
        // How far off from the beat was the tap?
        // We want tapTime approx equals lastBeatTime + offset? 
        // Or rather, we expect tap to land ON the beat.
        // Difference = time - lastBeatTime.
        // If close to 0, early. If close to interval, late (for previous beat).
        
        let diff = time - this.lastBeatTime;
        if (diff > this.interval / 2) {
            diff -= this.interval; // Closer to next beat
        }
        
        this.taps.push(diff);
        if (this.taps.length > 20) this.taps.shift();
        
        // Calculate average offset from taps
        if (this.taps.length >= 4) {
             const avg = this.taps.reduce((a,b) => a+b, 0) / this.taps.length;
             this.calculatedOffset = avg;
             // Auto-apply? Or just show suggestion?
             // User usually wants to manually adjust or "Apply Mean"
        }
    }
    
    saveAndExit() {
        this.game.config.audioOffset = this.offset;
        // Ideally save to localstorage
        localStorage.setItem('touhou_config', JSON.stringify(this.game.config));
        
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
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText("Audio Calibration", cx, 50);
        
        // Visual Metronome
        // Moving line passing center at beat
        const barWidth = 400;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - barWidth/2, cy);
        ctx.lineTo(cx + barWidth/2, cy);
        ctx.stroke();
        
        // Center Marker
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 20);
        ctx.lineTo(cx, cy + 20);
        ctx.stroke();
        
        // Moving Ball
        // We want it to cross center when beat happens (progress = 0)
        // Let's say it moves left to right.
        // At progress 0, x = cx.
        // But progress goes 0 -> 1. 
        // Let's make it bounce? or loop?
        // Loop: It travels from left to right in one interval.
        // Center is at 0.5? No, generally Audio Calibration has a ball hit a line on the beat.
        // If progress is 0 at beat time, then at progress=0 ball should be at cx.
        
        // Let's assume beat happens at t=0.
        // Show ball approaching.
        // Position = offset from center based on time diff.
        // Visual display needs to account for CURRENT Offset to show "Simulated Sync".
        // But for Raw test, we just show raw beat.
        
        // Simple View: Ball moves left to right. Hits center at beat.
        // x = cx + (this.beatProgress - 0.5) * width ??
        // If progress=0 (beat), x = cx - width/2 (Left??) No.
        
        // Better: Ball oscillates.
        const xOffset = Math.sin(this.beatProgress * Math.PI * 2) * 200; // Period match?
        // Sin(0) = 0 (Center). Sin(PI) = 0.
        // Beat is every interval.
        // If we map progress 0..1 to 0..2PI.
        // At 0 (beat), x=0. At 0.5 (halfway), x=0. 
        // This hits center twice per beat. Not ideal.
        
        // Linear approach
        // x moves from left to right. Hits center at beat.
        // We need it to wrap.
        const approach = (this.beatProgress < 0.5) ? this.beatProgress : this.beatProgress - 1.0;
        // ranges -0.5 to 0.5. 0 is beat.
        
        const ballX = cx + approach * 600; 
        
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(ballX, cy, 10, 0, Math.PI*2);
        ctx.fill();
        
        // Text Info
        ctx.fillStyle = '#fff';
        ctx.fillText(`Current Offset: ${(this.offset * 1000).toFixed(1)} ms`, cx, cy + 80);
        ctx.font = '16px Arial';
        ctx.fillText("Use Left/Right to adjust manually", cx, cy + 110);
        ctx.fillText("Tap Z / Space to measure latency", cx, cy + 140);
        
        if (this.calculatedOffset !== undefined) {
             ctx.fillStyle = '#aaa';
             ctx.fillText(`Measured Average: ${(this.calculatedOffset * 1000).toFixed(1)} ms`, cx, cy + 180);
        }
        
        ctx.fillStyle = '#f88';
         ctx.fillText("Hit the beat when you HEAR it, not when you see it.", cx, cy + 220);
         
         ctx.fillStyle = '#888';
         ctx.fillText("Z / X / D / F / J / K - All work", cx, h - 30);
    }
}
