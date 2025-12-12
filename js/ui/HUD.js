export default class HUD {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.graze = 0;

        // Cache DOM elements
        this.scoreEl = document.getElementById('score-display');
        this.livesEl = document.getElementById('lives-display');
        this.bombsEl = document.getElementById('bombs-display');
        this.powerEl = document.getElementById('power-display');
        this.grazeEl = document.getElementById('graze-display');
    }

    update(dt) {
        // Score is updated directly by other systems
    }

    render(renderer) {
        const scene = this.game.sceneManager.currentScene;
        const player = scene ? scene.player : null;
        const ctx = renderer.ctx;

        // Hide DOM sidebar if it exists
        const domSidebar = document.getElementById('sidebar');
        if (domSidebar && domSidebar.style.display !== 'none') {
            domSidebar.style.display = 'none';
        }

        // Draw canvas-based sidebar (Touhou style)
        ctx.save();

        // Sidebar background (Solid to separate from play area)
        const sidebarX = this.game.playAreaWidth;
        const sidebarY = 0;
        const sidebarW = this.game.width - sidebarX;
        const sidebarH = this.game.height;

        // Solid Background (Dark Grey/Black)
        ctx.fillStyle = '#222';
        ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);

        // Border Line (Left edge of sidebar)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sidebarX, 0);
        ctx.lineTo(sidebarX, sidebarH);
        ctx.stroke();

        // Game Title (Vertical Stylized)
        ctx.save();
        ctx.translate(this.game.width - 5, 20);
        ctx.rotate(Math.PI / 2);
        ctx.font = 'bold 20px "Times New Roman", serif'; // Slightly smaller
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'left';
        ctx.fillText("NOCTURNAL SUNLIGHT", 0, 0);
        ctx.restore();

        // Text styling
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4; // Stronger shadow for readability

        let y = 40;
        const x = this.game.width - 30; // More padding from edge

        // ... (Score/Lives/Bombs rendering - mostly same but ensuring compact) ...

        // Score
        ctx.font = '10px Arial';
        ctx.fillStyle = '#ccc';
        ctx.fillText('SCORE', x, y - 12);
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.score.toString().padStart(9, '0'), x, y);
        y += 45;

        if (player) {
            // Lives
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('PLAYER', x, y - 12);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#f44';
            ctx.fillText("★".repeat(Math.max(0, player.lives)), x, y);
            y += 45;

            // Bombs
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('SPELL', x, y - 12);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#4af';
            ctx.fillText("★".repeat(Math.max(0, player.bombs)), x, y);
            y += 45;

            // Power
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('POWER', x, y - 12);
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText(`${player.power.toFixed(2)} / ${player.maxPower.toFixed(2)}`, x, y);
            y += 45;

            // Graze
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('GRAZE', x, y - 12);
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = '#0f0';
            ctx.fillText(this.graze.toString(), x, y);
            y += 45;
        }

        ctx.restore();

        // Boss Spell Card Name (Modern Cut-in Style)
        if (scene && scene.enemies) {
            const boss = scene.enemies.find(e => e.constructor.name === 'Boss' && e.active && e.isSpellCard);
            if (boss) {
                const t = boss.stateTimer !== undefined ? boss.stateTimer : 100;
                
                // Animation Params
                // 1. Initial Slide In: fast ease-out
                // 2. Sustain: steady
                // 3. End: handled by boss phase switch
                
                const slideDuration = 0.5;
                const slideProgress = Math.min(1, t / slideDuration);
                const ease = 1 - Math.pow(1 - slideProgress, 3); // Cubic ease out
                
                const playWidth = this.game.playAreaWidth || this.game.width;
                const playHeight = this.game.height;
                
                // --- 1. Spell Background Strip (Top Right) ---
                ctx.save();
                const stripHeight = 30;
                const stripY = 40;
                const stripWidth = 400;
                const stripX = playWidth - (stripWidth * ease); // Slide from right
                
                // Clip to play area
                ctx.beginPath();
                ctx.rect(0, 0, playWidth, playHeight);
                ctx.clip();
                
                // Gradient Strip
                const grad = ctx.createLinearGradient(stripX, 0, playWidth, 0);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.2, 'rgba(0,0,0,0.6)');
                grad.addColorStop(1, 'rgba(50,0,50,0.8)');
                ctx.fillStyle = grad;
                ctx.fillRect(stripX, stripY, stripWidth, stripHeight);
                
                // --- 2. Spell Name Text ---
                ctx.textAlign = 'right';
                ctx.font = 'italic bold 22px "Times New Roman", serif';
                const textX = playWidth - 20;
                const textY = stripY + 22;
                
                if (slideProgress > 0) {
                     // Shadow
                    ctx.shadowColor = '#f0f';
                    ctx.shadowBlur = 10 * ease;
                    ctx.fillStyle = '#fff';
                    ctx.fillText(boss.spellCardName, textX - (1 - ease) * 100, textY);
                    ctx.shadowBlur = 0;
                }
                ctx.restore();
                
                // --- 3. SPELL BONUS Counter (Top Right, below name) ---
                // Only show if we have a real bonus system, but let's fake/prep it
                ctx.save();
                ctx.textAlign = 'right';
                ctx.font = '14px monospace';
                ctx.fillStyle = '#ff8';
                // Decrementing bonus based on timer (fake visual)
                const maxBonus = 10000000;
                const currentBonus = Math.floor(maxBonus - (boss.phaseTimer * 1000)); 
                const displayBonus = Math.max(0, currentBonus); // Placeholder logic
                
                // Hide for now if annoying, but user requested 'cool effects'. 
                // Let's settle for a "Spell Card" label
                ctx.font = '10px Arial';
                ctx.fillStyle = '#aaa';
                ctx.fillText("SPELL CARD", textX, stripY - 5);
                ctx.restore();
                
                // --- 4. Portrait Cut-In (Optional / Future) ---
                // If t < 1.0 (just started), show a flash or cut-in
                if (t < 1.0) {
                     // Quick flash line
                     const flashAlpha = 1.0 - t;
                     ctx.save();
                     ctx.globalCompositeOperation = 'lighter';
                     ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.5})`;
                     ctx.fillRect(0, stripY, playWidth, stripHeight);
                     ctx.restore();
                }
            }
        }
    }
}
