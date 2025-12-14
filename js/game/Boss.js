import Enemy from './Enemy.js';

export default class Boss extends Enemy {
    constructor(game, x, y, name) {
        super(game, x, y);
        this.name = name;
        this.maxHp = 1000;
        this.hp = this.maxHp;
        this.radius = 30;
        this.color = '#800080'; // Purple for generic boss

        this.phases = [];
        this.currentPhaseIndex = 0;
        this.currentPhaseIndex = 0;
        this.phaseTimer = 0;
        this.stateTimer = 0; // For animations
        this.isSpellCard = false;
        this.spellCardName = "";
        this.isBoss = true;
        this.invulnerableTimer = 0;
        this.breakTimer = 0; // Delay between phases
    }

    addPhase(hp, duration, patternFunc, spellName = null) {
        console.log(`Adding phase: HP=${hp}, Duration=${duration}, Spell=${spellName}`);
        this.phases.push({
            hp: hp,
            duration: duration,
            pattern: patternFunc,
            spellName: spellName
        });
    }

    start() {
        console.log(`Boss starting with ${this.phases.length} phases.`);
        if (this.phases.length > 0) {
            this.setPhase(0);
        }
    }

    die() {
        super.die();
        if (this.game.soundManager && this.game.soundManager.stopBossTheme) {
            // Prevent silence gap by NOT stopping theme immediately. 
            // The next stage/event will handle music transition.
            // this.game.soundManager.stopBossTheme();
        }
        // Boss death explosion
        const scene = this.game.sceneManager.currentScene;
        scene.cameraShake = 20;
        // Clear bullets
        scene.bulletManager.clear();

        // Particles
        if (scene.particleSystem) {
            // Multiple explosions for boss
            scene.particleSystem.createExplosion(this.x, this.y, this.color);
            scene.particleSystem.createExplosion(this.x + 40, this.y + 20, '#fff');
            scene.particleSystem.createExplosion(this.x - 40, this.y - 20, '#f00');
            scene.particleSystem.createExplosion(this.x + 20, this.y - 40, this.color);
            scene.particleSystem.createExplosion(this.x - 20, this.y + 40, '#ff0');
        }

        scene.screenFlash = 1.0;

        // Drop LOTS of items
        if (scene.itemManager) {
            const im = scene.itemManager;
            // Big Power
            im.spawn(this.x, this.y, 'big_power');

            // Shower of points and power
            for (let i = 0; i < 10; i++) {
                const ox = (Math.random() - 0.5) * 100;
                const oy = (Math.random() - 0.5) * 100;
                if (i % 2 === 0) {
                    im.spawn(this.x + ox, this.y + oy, 'power');
                } else {
                    im.spawn(this.x + ox, this.y + oy, 'point');
                }
            }
        }
        console.log("Boss destroyed!");
    }

    setPhase(index) {
        if (index >= this.phases.length) {
            this.die();
            return;
        }
        this.currentPhaseIndex = index;
        const phase = this.phases[index];
        // difficulty: Double HP
        this.maxHp = phase.hp * 2.0;
        this.hp = phase.hp * 2.0;
        this.phaseTimer = phase.duration;
        this.stateTimer = 0; // Reset animation timer
        this.pattern = phase.pattern;
        this.isSpellCard = !!phase.spellName;
        this.spellCardName = phase.spellName || "";

        // Grant short invulnerability at start of each phase
        this.invulnerableTimer = 0.5;

        console.log(`Boss Phase ${index}: ${this.spellCardName}`);
        
        // Cache Name Width for UI
        // We need a dummy context or estimate. 
        // We can just set a flag to measure it once in render.
        this.nameWidth = 0; 
        this.needsMeasure = true;
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0 || this.breakTimer > 0) {
            return;
        }

        this.hp -= amount;
        this.game.soundManager.playEnemyHit();

        // Don't die here if HP <= 0. Update loop handles phase transition.
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }

    update(dt) {
        if (!this.active) return;

        this.phaseTimer -= dt;
        this.stateTimer += dt;

        // Timer run out or HP depleted
        if ((this.phaseTimer <= 0 || this.hp <= 0) && this.breakTimer <= 0) {
            // Start Break Sequence
            this.breakTimer = 2.0; // 2 seconds delay
            this.invulnerableTimer = 2.0;

            // Clear bullets
            const scene = this.game.sceneManager.currentScene;
            if (scene.bulletManager) {
                scene.bulletManager.pool.forEach(b => {
                    if (b.active) {
                        b.active = false;
                        scene.itemManager.spawn(b.x, b.y, 'point');
                    }
                });
            }

            // Sound
            this.game.soundManager.playEnemyDie(); // Explosion sound
        }

        if (this.breakTimer > 0) {
            this.breakTimer -= dt;
            if (this.breakTimer <= 0) {
                this.setPhase(this.currentPhaseIndex + 1);
            }
            return; // Don't update pattern during break
        }

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
        }

        super.update(dt);
    }

    render(renderer, alpha = 1.0) {
        if (!this.active) return;
        
        const drawX = this.prevX ? (this.prevX + (this.x - this.prevX) * alpha) : this.x;
        const drawY = this.prevY ? (this.prevY + (this.y - this.prevY) * alpha) : this.y;

        const ctx = renderer.ctx;
        ctx.save();
        ctx.translate(drawX, drawY);

        // Draw Magic Circle (if spell card)
        if (this.isSpellCard) {
            // Aura Effect
            const time = Date.now() / 200;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            
            // Pulsing aura
            const scale = 1 + Math.sin(time) * 0.1;
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, 80 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Rotating squares (Magical effect)
            ctx.rotate(time);
            for(let i=0; i<4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.2;
                ctx.fillRect(-60, -60, 120, 120);
            }
            
            ctx.restore();

            // Original Magic Circle
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 60, 0, Math.PI * 2);
            ctx.stroke();

            // Rotating inner circle
            ctx.save();
            ctx.rotate(Date.now() / 500);
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Draw Boss Sprite
        let spriteName = this.name.toLowerCase().split(' ')[0];
        if (spriteName === 'hong') spriteName = 'meiling';
        if (spriteName === 'prismriver') spriteName = 'merlin';
        if (spriteName === 'utsuho') spriteName = 'okuu';
        if (spriteName === 'fujiwara') spriteName = 'mokou';
        // Use taller aspect ratio for bosses
        renderer.drawSprite(spriteName, 0, 0, 64, 96);

        // Hit Flash
        if (this.hitFlashTimer > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.6;
            renderer.drawSprite(spriteName, 0, 0, 64, 96);
            ctx.restore();
        }

        ctx.restore();

        // Draw Circular Health Bar (Phase Health)
        const hpPercent = this.hp / this.maxHp;
        renderer.ctx.strokeStyle = '#fff';
        renderer.ctx.lineWidth = 4;
        renderer.ctx.beginPath();
        renderer.ctx.arc(drawX, drawY, 40, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * hpPercent));
        renderer.ctx.stroke();

        // Draw Timer
        renderer.drawText(Math.ceil(this.phaseTimer).toString(), drawX + 20, drawY - 50, 20, '#fff');

        // Draw Break Effect
        if (this.breakTimer > 0) {
            renderer.drawText("SPELL BREAK!", drawX - 60, drawY, 24, '#ff0');
        }

        // --- UI OVERLAYS ---

        // 1. Top Left Health Bar (Total/Phase Health)
        // Original Touhou style: Long bar at top left
        const barX = 30;
        const barY = 30;
        const barW = 300;
        const barH = 10;

        // Background
        renderer.drawRect(barX, barY, barW, barH, '#500');
        // Fill
        renderer.drawRect(barX, barY, barW * hpPercent, barH, '#f00');
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Boss Name (High Quality)
        ctx.save();
        ctx.font = 'bold 20px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = 'left'; // Fix for cut-off names
        ctx.fillText(this.name, barX, barY - 8);
        ctx.restore();

        // Remaining Phases (Stars) next to name
        // Calculate width of name to place stars after it
        // Cache measurement
        if (!this.nameWidth || this.needsMeasure) {
             this.nameWidth = ctx.measureText(this.name).width;
             this.needsMeasure = false;
        }
        ctx.restore();

        const remainingPhases = this.phases.length - 1 - this.currentPhaseIndex;
        for (let i = 0; i < remainingPhases; i++) {
            renderer.drawText("★", barX + this.nameWidth + 20 + i * 20, barY - 8, 16, '#ff0');
        }


    }
}
