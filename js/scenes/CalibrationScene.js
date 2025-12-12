
import Background from '../game/Background.js';

export default class CalibrationScene {
    constructor(game) {
        this.game = game;
        this.offset = this.game.settings?.audioOffset || 0;
        this.taps = [];
        this.lastBeatTime = 0;
        this.beatInterval = 0.5; // 120 BPM
        this.isPlaying = false;
        this.background = new Background(game);
        
        // Ensure settings exist
        if (!this.game.settings) this.game.settings = {};
    }

    start() {
        this.isPlaying = true;
        this.startTime = performance.now() / 1000;
        this.audioCtx = this.game.soundManager.context;
    }

    update(dt) {
        this.background.update(dt);
        const t = performance.now() / 1000 - this.startTime;

        // Metronome (Visual + Audio)
        if (Math.floor(t / this.beatInterval) > Math.floor(this.lastBeatTime / this.beatInterval)) {
            this.game.soundManager.playSfx('kick'); // Assuming kick exists, or create synthesized click
            this.lastBeatTime = t;
            this.pulse = 1.0;
        }

        if (this.pulse > 0) this.pulse -= dt * 5;

        // Input
        if (this.game.input.isPressed('Confirm') || this.game.input.isPressed('SHOOT') || this.game.input.isPressed('KeyZ')) {
            // Record tap
            // Expected time is the closest beat
            const beatTime = Math.round(t / this.beatInterval) * this.beatInterval;
            const diff = t - beatTime;
            this.taps.push(diff);
            
            // Keep last 10 taps
            if (this.taps.length > 20) this.taps.shift();
            
            // Calculate average offset
            const sum = this.taps.reduce((a, b) => a + b, 0);
            this.offset = sum / this.taps.length;
            this.game.settings.audioOffset = this.offset;
        }

        if (this.game.input.isPressed('BOMB') || this.game.input.isPressed('ESC')) {
            this.returnToMenu();
        }
    }

    returnToMenu() {
        import('./RhythmSelectScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.background.render(renderer);

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText("Audio Calibration", w/2, 100);

        ctx.font = '20px Arial';
        ctx.fillText("Press Z or Enter to the beat!", w/2, 150);
        
        // Visual Metronome
        const r = 50 + this.pulse * 20;
        ctx.beginPath();
        ctx.arc(w/2, h/2 - 50, r, 0, Math.PI*2);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 5;
        ctx.stroke();

        if (Math.abs(this.pulse - 1.0) < 0.1) {
            ctx.fillStyle = '#0ff';
            ctx.fill();
        }

        // Stats
        ctx.fillStyle = '#ff0';
        ctx.font = '24px Monospace';
        const ms = Math.round(this.offset * 1000);
        ctx.fillText(`Offset: ${ms > 0 ? '+' : ''}${ms} ms`, w/2, h/2 + 100);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        ctx.fillText(`(Positive means you hit late / Input is delayed)`, w/2, h/2 + 130);
        ctx.fillText(`Samples: ${this.taps.length}`, w/2, h/2 + 160);

        ctx.fillStyle = '#fff';
        ctx.fillText("[ESC] / [X] to Save & Exit", w/2, h - 50);
    }
}
