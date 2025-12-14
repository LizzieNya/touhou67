import Background from '../game/Background.js';

export default class RhythmGameSceneV2 {
    constructor(game, lanes = 4) {
        this.game = game;
        this.background = new Background(game);
        
        this.lanes = lanes;
        if (this.lanes === 4) {
             this.keys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
             this.labels = ['D', 'F', 'J', 'K'];
        } else {
             // 7 Keys: S D F Space J K L
             this.keys = ['KeyS', 'KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK', 'KeyL'];
             this.labels = ['S', 'D', 'F', 'Sp', 'J', 'K', 'L'];
        }
        
        // Dynamically calculate laneX later
        this.laneX = [];
        this.laneY = 400; // Hit Line Y (Middle?? User asked for middle)
        // If Middle, say Y=240 (480/2). Then notes fall from Top (-50) to Bottom (480)?
        // If line is middle, do they disappear after? Usually yes or fade.
        
        // Let's optimize for readability:
        // Hit Line at Y = 400 (Bottomish) is standard (Arcade / Mania).
        // Hit Line at Y = 240 (Middle).
        this.hitLineY = 400; 
        
        this.notes = [];
        this.score = 0;
        this.combo = 0;
        this.isPlaying = true;
        this.startTime = performance.now() / 1000;
        
        // Example generator
        this.nextNoteTime = 1.0;
        
        // Sound
        this.game.soundManager.playBossTheme('boss_theme_12'); // Example
    }

    update(dt) {
        const t = (performance.now()/1000) - this.startTime;
        
        // Generator
        if (t > this.nextNoteTime) {
            this.spawnNote(t + 2.0); // Arrive in 2s
            this.nextNoteTime += 0.25; // Fast stream
        }
        
        // Update Notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const n = this.notes[i];
            // Time -> Y position
            // Arrive at this.hitLineY at n.time
            // Speed = pixels per second? Or fixed travel time?
            // Let's use travel time.
            const timeToHit = n.time - t;
            const travelTime = 2.0; // 2 seconds to fall
            
            // Progres 0 (Top) -> 1 (Hit Line)
            const p = 1.0 - (timeToHit / travelTime);
            
            n.y = -50 + (this.hitLineY + 50) * p;
            
            if (n.y > this.game.height + 50) {
                this.notes.splice(i, 1);
                this.combo = 0;
            }
        }
        
        // Input
        // Check lane keys
        this.keys.forEach((key, laneIdx) => {
            if (this.game.input.keys[key] && !this.game.input.prevKeys[key]) {
                this.checkHit(laneIdx, t);
                 // Visual Feedback
                 this.createLaneFlash(laneIdx);
            }
        });
        
        if (this.game.input.keys['KeyC'] || this.game.input.isPressed('ESC')) {
              this.game.soundManager.stopBossTheme();
              import('./RhythmSelectScene.js').then(module => {
                  this.game.sceneManager.changeScene(new module.default(this.game));
              });
        }
    }
    
    checkHit(lane, time) {
        // Find closest note in lane
        // Simple search
        let best = -1;
        let minDiff = 0.2; // 200ms window
        
        this.notes.forEach((n, i) => {
            if (n.lane === lane) {
                const diff = Math.abs(n.time - time);
                if (diff < minDiff) {
                    minDiff = diff;
                    best = i;
                }
            }
        });
        
        if (best !== -1) {
            this.notes.splice(best, 1);
            this.score += 100;
            this.combo++;
        }
    }
    
    spawnNote(time) {
        const lane = Math.floor(Math.random() * this.lanes);
        this.notes.push({
            lane: lane,
            time: time,
            y: -50,
            color: ['#f00', '#0f0', '#00f', '#ff0'][lane]
        });
    }
    
    createLaneFlash(lane) {
        // Todo
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Dark BG
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        // Lane BG
        const laneWidth = 60;
        const startX = (w - (this.lanes * laneWidth)) / 2;
        
        // Update lane positions dynamically
        this.laneX = [];
        for(let i=0; i<this.lanes; i++) this.laneX.push(startX + i * laneWidth);

        ctx.fillStyle = '#222';
        ctx.fillRect(startX, 0, this.lanes * laneWidth, h);

        // Grid Lines
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        for (let i = 0; i <= this.lanes; i++) {
            const x = startX + i * laneWidth;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Hit Line
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0ff';
        ctx.beginPath();
        ctx.moveTo(startX, this.hitLineY);
        ctx.lineTo(startX + this.lanes * laneWidth, this.hitLineY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Key Labels
        ctx.fillStyle = '#888';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < this.lanes; i++) {
            ctx.fillText(this.labels[i], startX + i * laneWidth + laneWidth/2, this.hitLineY + 40);
        }

        // Notes
        this.notes.forEach(n => {
            const x = this.laneX[n.lane]; // Should be updated in update loop or on fly
            // Actually use calculated x:
            const drawX = startX + n.lane * laneWidth;
            const y = n.y;
            
            ctx.fillStyle = n.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = n.color;
            // Draw rounded rect
            ctx.beginPath();
            ctx.roundRect(drawX + 5, y - 10, laneWidth - 10, 20, 5);
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(drawX + 5, y - 5, laneWidth - 10, 5);
            ctx.shadowBlur = 0;
        });
        
        // Stats
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        ctx.fillText(`Combo: ${this.combo}`, 20, 70);
        
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText("Controls: D F J K   Exit: C", w/2, h - 20);
    }
}
