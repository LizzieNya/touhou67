import Entity from './Entity.js';

class PlayerBullet extends Entity {
    constructor(game) {
        super(game, 0, 0);
        this.active = false;
        this.width = 16;
        this.height = 16;
        this.damage = 1;
        this.type = 'straight'; // straight, homing, needle, missile, laser
        this.target = null;
        this.timer = 0;
        this.piercing = false;
        this.hitList = []; // For piercing logic if needed, or just simple frame damage
        this.trail = []; // Trail positions for visual effects
        this.bounceCount = 0; // For bouncing knives
        this.maxBounces = 2; // Maximum bounces for Sakuya Type B
        this.rotation = 0; // For rotating bullets
        this.prevX = 0;
        this.prevY = 0;
    }

    spawn(x, y, vx, vy, damage = 1, type = 'straight') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.type = type;
        this.active = true;
        this.target = null;
        this.timer = 0;
        this.piercing = false;
        this.hitList = [];
        this.trail = [];
        this.bounceCount = 0;
        this.bounceCount = 0;
        this.rotation = Math.random() * Math.PI * 2; // Random initial rotation
        this.prevX = x;
        this.prevY = y;

        // Visuals
        if (type === 'homing') {
            this.width = 16;
            this.height = 16;
            this.color = '#f00'; // Reimu A: Red Amulets
        } else if (type === 'needle' || type === 'needle_bounce') {
            this.width = 4;
            this.height = 40;
            this.color = '#fff'; // Sakuya: Silver Needles/Knives
        } else if (type === 'missile') {
            this.width = 12;
            this.height = 24;
            this.color = '#ff0'; // Marisa A: Yellow Missiles (Stars)
        } else if (type === 'laser') {
            this.width = 10;
            this.height = 80;
            this.color = '#0ff'; // Marisa B: Cyan Lasers
            this.piercing = true;
        } else if (type === 'snake') {
            this.width = 12;
            this.height = 12;
            this.color = '#fff'; // White snakes
        } else if (type === 'frog') {
            this.width = 16;
            this.height = 16;
            this.color = '#8bc34a'; // Green frogs
        } else if (type === 'sword') {
            this.width = 8;
            this.height = 32;
            this.color = '#e0e0e0'; // Silver swords
        } else if (type === 'ice') {
            this.width = 12;
            this.height = 20;
            this.color = '#aaf'; // Ice Blue
        } else if (type === 'bone') {
            this.width = 10;
            this.height = 30;
            this.color = '#fff'; // Bone White
        } else if (type === 'ufo') {
            this.width = 20;
            this.height = 12;
            this.color = '#f0f'; // UFO Purple
        } else if (type === 'sun') {
            this.width = 32;
            this.height = 32;
            this.color = '#f80'; // Sun Orange
        } else if (type === 'fire') {
            this.width = 16;
            this.height = 24;
            this.color = '#f44'; // Fire Red
        } else if (type === 'dark') {
            this.width = 16;
            this.height = 16;
            this.color = '#444'; // Dark Grey
        } else if (type === 'orbit') {
            this.width = 12;
            this.height = 12;
            this.color = '#ff0'; // Yellow Orbs
        } else if (type === 'boomerang') {
            this.width = 16;
            this.height = 16;
            this.color = '#0f0'; // Green
        } else if (type === 'butterfly') {
             this.width = 20;
             this.height = 20;
             this.color = '#f0f'; // Pink/Ghostly
        } else if (type === 'bat') {
             this.width = 16;
             this.height = 12;
             this.color = '#f00'; // Red
        } else if (type === 'spear') {
             this.width = 12;
             this.height = 60;
             this.color = '#f00'; // Red
             this.piercing = true;
        } else if (type === 'bubble') {
             this.width = 16;
             this.height = 16;
             this.color = '#00f'; // Blue
        } else if (type === 'talisman') {
             this.width = 12;
             this.height = 24;
             this.color = '#f00'; // Red
        } else if (type === 'icicle') {
             this.width = 8;
             this.height = 24;
             this.color = '#aaf'; // Ice
        } else if (type === 'freeze') {
             this.width = 12;
             this.height = 12;
             this.color = '#0ff';
        } else if (type === 'spirit') {
             this.width = 14;
             this.height = 20;
             this.color = '#fff';
        } else if (type === 'crystal') {
             this.width = 12;
             this.height = 12;
             this.color = '#f0f';
        } else if (type === 'note') {
             this.width = 16;
             this.height = 16;
             this.color = '#ff0';
        } else if (type === 'chimera') {
             this.width = 16;
             this.height = 16;
             this.color = '#f00';
        } else {
            // Main shot
            this.width = 10;
            this.height = 40;
            this.color = '#fff'; // Standard white
        }
    }

    spawnCustom(x, y, vx, vy, damage, type, color, scale) {
        this.spawn(x, y, vx, vy, damage, type);
        if (color) this.color = color;
        if (scale && scale !== 1) {
            this.width *= scale;
            this.height *= scale;
        }
    }

    update(dt) {
        if (!this.active) return;
        
        this.prevX = this.x;
        this.prevY = this.y;

        this.timer += dt;
        this.rotation += dt * 5; // Rotate over time for visual effect

        // Store trail positions for visual effects
        if (this.type === 'homing' || this.type === 'missile' || this.type === 'snake') {
            this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
            if (this.trail.length > 8) this.trail.shift();

            // Fade trail
            this.trail.forEach(t => t.alpha -= dt * 2);
        }

        if (this.type === 'homing' || this.type === 'snake') {
            // Homing Logic
            if (!this.target || !this.target.active) {
                this.findTarget();
            }

            if (this.target && this.target.active) {
                const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                const speed = 800;
                const currentAngle = Math.atan2(this.vy, this.vx);
                let diff = angle - currentAngle;

                // Normalize angle
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                const turnSpeed = 10 * dt;
                const newAngle = currentAngle + Math.max(-turnSpeed, Math.min(turnSpeed, diff));

                this.vx = Math.cos(newAngle) * speed;
                this.vy = Math.sin(newAngle) * speed;
            }
        }

        // Bouncing logic for Sakuya Type B knives
        if (this.type === 'needle_bounce' && this.bounceCount < this.maxBounces) {
            const margin = 20;
            let bounced = false;

            if (this.x < margin && this.vx < 0) {
                this.vx = -this.vx;
                this.x = margin;
                bounced = true;
            } else if (this.x > this.game.playAreaWidth - margin && this.vx > 0) {
                this.vx = -this.vx;
                this.x = this.game.playAreaWidth - margin;
                bounced = true;
            }

            if (bounced) {
                this.bounceCount++;
                this.vx *= 1.1;
                this.vy *= 1.1;
            }
        }

        // Boomerang Logic
        if (this.type === 'boomerang') {
            // Decelerate Y, then accelerate back down (or up if we want it to speed up)
            // Let's make it go forward, stop, then shoot forward faster
            if (this.timer < 0.5) {
                this.vy *= 0.95; // Slow down
            } else if (this.timer < 0.6) {
                // Pause
            } else {
                this.vy -= 50; // Accelerate upward rapidly
            }
        }

        // --- Custom Movement Logic ---

        // Butterfly Logic (Wavy)
        if (this.type === 'butterfly') {
            this.vx += Math.cos(this.timer * 10) * 15;
            this.rotation = Math.sin(this.timer * 5) * 0.5;
        }

        // Bat Logic (Soft Homing)
        if (this.type === 'bat') {
             if (!this.target || !this.target.active) this.findTarget();
             if (this.target && this.target.active) {
                 const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                 const speed = 700;
                 // Lerp velocity for curve
                 this.vx += (Math.cos(angle) * speed - this.vx) * 0.1;
                 this.vy += (Math.sin(angle) * speed - this.vy) * 0.1;
                 this.rotation = Math.atan2(this.vy, this.vx) + Math.PI/2;
             }
        }

        // Freeze Logic (Cirno B) - Stop then Aim
        if (this.type === 'freeze') {
             if (this.timer > 0.4 && this.timer < 0.6) {
                 this.vx *= 0.5;
                 this.vy *= 0.5; // Decelerate
             } else if (this.timer >= 0.6 && this.timer < 0.7) {
                 // Aim once
                 if (Math.abs(this.vx) < 50 && Math.abs(this.vy) < 50) { // If stopped
                     this.findTarget();
                     if (this.target && this.target.active) {
                         const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                         const speed = 1200;
                         this.vx = Math.cos(angle) * speed;
                         this.vy = Math.sin(angle) * speed;
                     } else {
                         this.vy = -1200; // Shoot up/forward
                         this.vx = (Math.random() - 0.5) * 200;
                     }
                 }
             }
             this.rotation += dt * 10;
        }

        // Chimera Logic (Nue) - Short straight, then unknown direction
        if (this.type === 'chimera') {
            if (this.timer > 0.3 && this.timer < 0.4) {
                 // Randomize direction
                 const angle = Math.random() * Math.PI * 2;
                 const speed = 1000;
                 this.vx = Math.cos(angle) * speed;
                 this.vy = Math.sin(angle) * speed;
                 // Or aim at player? No, aim at enemies
                 this.findTarget();
                 if (this.target && this.target.active) {
                     const tAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                     this.vx = Math.cos(tAngle) * speed;
                     this.vy = Math.sin(tAngle) * speed;
                 }
            }
            this.rotation += dt * 20;
        }

        // Spirit Logic (Drift + Homing)
        if (this.type === 'spirit') {
             this.vx += Math.sin(this.timer * 8) * 10;
             if (!this.target || !this.target.active) this.findTarget();
             if (this.target && this.target.active) {
                 const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                 const speed = 500;
                 this.vx += (Math.cos(angle) * speed - this.vx) * 0.05;
                 this.vy += (Math.sin(angle) * speed - this.vy) * 0.05;
             }
             this.rotation = Math.atan2(this.vy, this.vx) + Math.PI/2;
        }

        // Bubble Logic (Floaty)
        if (this.type === 'bubble') {
             this.vx += Math.sin(this.timer * 3) * 5;
             this.vy -= dt * 100; // Accelerate up
        }

        // UFO Logic (Wobble)
        if (this.type === 'ufo') {
             this.vx += Math.sin(this.timer * 15) * 50;
        }

        super.update(dt);

        // Deactivate if out of bounds
        if (this.y < -50 || this.x < -50 || this.x > this.game.playAreaWidth + 50 || this.y > this.game.height + 50) {
            this.active = false;
        }
    }

    findTarget() {
        const scene = this.game.sceneManager.currentScene;
        if (!scene || !scene.enemies) return;

        let closest = null;
        let minDist = Infinity;

        for (const enemy of scene.enemies) {
            if (!enemy.active) continue;
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }
        this.target = closest;
    }

    render(renderer, alpha = 1.0) {
        if (!this.active) return;

        const drawX = this.prevX + (this.x - this.prevX) * alpha;
        const drawY = this.prevY + (this.y - this.prevY) * alpha;

        renderer.ctx.save();
        // Translate to interpolated position is tricky with many types, but most use translate(t.x, t.y)
        // For simple types, we can just replace this.x/y references or set a flag?
        // Ah, most render logic here uses `renderer.ctx.translate(this.x, this.y)` or `this.x`.
        // I will just shadow `this.x` locally OR simply use drawX/drawY in standard rect calls.
        
        // Wait, different types use different logic.
        // Homing: `renderer.ctx.translate(this.x, this.y)`
        // Needle: `renderer.ctx.translate(this.x, this.y)`
        // Missile: `renderer.ctx.translate(this.x, this.y)`
        // Laser: `renderer.ctx.translate(this.x, this.y)` or `fillRect(this.x...)`
        // Straight: `fillRect(this.x...)`
        
        // Strategy: I will NOT overwrite `this.x` but use `drawX`/`drawY` where appropriate.
        // But since there are many types, I will find/replace the specific lines in `render` or use a helper.
        // Actually, easiest is to just treat `drawX` as the source of truth for rendering.
        
        // Let's replace the Start of render to define drawX/Y
        // And then update the logic blocks.
        
        // But the regex/search replace is tedious.
        // Alternative: Temporarily mock `this.x`? No, side effects.
        
        // I will do multi-replace for the specific blocks.
        
        // ACTUALLY, I can just replace `this.x` and `this.y` with `drawX` and `drawY` in the ENTIRE render function if I define them at start.
        // But I can only do chunks.
        
        // Okay, I will define `drawX` and `drawY` at top of `render`.
        // Then I will replace `translate(this.x, this.y)` with `translate(drawX, drawY)`.
        // And `fillRect(this.x` with `fillRect(drawX`.
        
        // Block 1: Start
        renderer.ctx.save();

        // Subtle trail for homing and missile bullets
        if ((this.type === 'homing' || this.type === 'missile') && this.trail.length > 1) {
            this.trail.forEach((t, i) => {
                if (t.alpha > 0) {
                    const trailAlpha = t.alpha * 0.15;
                    renderer.ctx.globalAlpha = trailAlpha;
                    renderer.ctx.fillStyle = this.color;
                    const size = (i / this.trail.length) * (this.type === 'homing' ? 8 : 6);
                    renderer.ctx.beginPath();
                    renderer.ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
                    renderer.ctx.fill();
                }
            });
        }

        if (this.type === 'homing') {
            // Elegant homing amulets with soft glow
            renderer.ctx.shadowBlur = 8;
            renderer.ctx.shadowColor = this.color;

            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);

            // Soft outer glow
            renderer.ctx.globalAlpha = 0.25;
            renderer.ctx.fillStyle = this.color;
            renderer.ctx.fillRect(-this.width / 2 - 2, -this.height / 2 - 2, this.width + 4, this.height + 4);

            // Main body - solid and clear
            renderer.ctx.globalAlpha = 0.85;
            renderer.ctx.fillStyle = this.color;
            renderer.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // Crisp white core
            renderer.ctx.shadowBlur = 0;
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.globalAlpha = 1.0;
            renderer.ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);

        } else if (this.type === 'needle' || this.type === 'needle_bounce') {
            // Sleek knives with minimal blur
            const angle = Math.atan2(this.vy, this.vx);

            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(angle + Math.PI / 2);

            // Subtle glow
            renderer.ctx.shadowBlur = 6;
            renderer.ctx.shadowColor = '#8cf';

            // Very subtle motion blur (only 2 frames)
            renderer.ctx.globalAlpha = 0.15;
            for (let i = 1; i <= 2; i++) {
                renderer.ctx.fillStyle = this.color;
                renderer.ctx.fillRect(-this.width / 2, -this.height / 2 + i * 10, this.width, this.height - i * 10);
            }

            // Main knife body - crisp and visible
            renderer.ctx.shadowBlur = 4;
            renderer.ctx.globalAlpha = 0.9;
            renderer.ctx.fillStyle = '#ddd';
            renderer.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // Sharp tip highlight
            renderer.ctx.shadowBlur = 0;
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.globalAlpha = 1.0;
            renderer.ctx.fillRect(-this.width / 4, -this.height / 2, this.width / 2, this.height / 3);

        } else if (this.type === 'missile') {
            // Clean rotating star with occasional sparkle
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);

            // Soft outer glow
            renderer.ctx.shadowBlur = 12;
            renderer.ctx.shadowColor = this.color;
            renderer.ctx.globalAlpha = 0.3;
            renderer.ctx.fillStyle = this.color;
            renderer.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                renderer.ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 12, Math.sin((18 + i * 72) * Math.PI / 180) * 12);
                renderer.ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 6, Math.sin((54 + i * 72) * Math.PI / 180) * 6);
            }
            renderer.ctx.closePath();
            renderer.ctx.fill();

            // Main star - clear and bright
            renderer.ctx.shadowBlur = 6;
            renderer.ctx.globalAlpha = 0.95;
            renderer.ctx.fillStyle = this.color;
            renderer.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                renderer.ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 9, Math.sin((18 + i * 72) * Math.PI / 180) * 9);
                renderer.ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 4.5, Math.sin((54 + i * 72) * Math.PI / 180) * 4.5);
            }
            renderer.ctx.closePath();
            renderer.ctx.fill();

            // Bright center
            renderer.ctx.shadowBlur = 0;
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.globalAlpha = 1.0;
            renderer.ctx.beginPath();
            renderer.ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
            renderer.ctx.fill();

            // Rare sparkle effect (less frequent)
            if (Math.random() < 0.15) {
                const sparkleAngle = Math.random() * Math.PI * 2;
                const sparkleRadius = 10 + Math.random() * 3;
                renderer.ctx.fillStyle = '#fff';
                renderer.ctx.globalAlpha = 0.7;
                renderer.ctx.beginPath();
                renderer.ctx.arc(
                    Math.cos(sparkleAngle) * sparkleRadius,
                    Math.sin(sparkleAngle) * sparkleRadius,
                    1.5, 0, Math.PI * 2
                );
                renderer.ctx.fill();
            }

        } else if (this.type === 'laser') {
            // Smooth pulsing laser beam
            const pulse = 0.7 + Math.sin(this.timer * 8) * 0.15;

            renderer.ctx.save();
            // Use additive blending to prevent "blocky" overlaps
            renderer.ctx.globalCompositeOperation = 'lighter';

            if (this.color === '#f00' || this.color === '#800') {
                // Gungnir Spear (Remilia) - Refined, thinner, and fresher
                renderer.ctx.translate(drawX, drawY);

                // Spear Head
                renderer.ctx.shadowBlur = 10;
                renderer.ctx.shadowColor = '#f00';
                renderer.ctx.fillStyle = '#f00';
                renderer.ctx.globalAlpha = 0.8; // Slightly transparent

                const w = this.width * 0.4; // Thinner
                const h = this.height;

                renderer.ctx.beginPath();
                renderer.ctx.moveTo(0, -h / 2); // Tip
                renderer.ctx.lineTo(w, 0); // Side
                renderer.ctx.lineTo(0, h / 2); // Bottom
                renderer.ctx.lineTo(-w, 0); // Side
                renderer.ctx.closePath();
                renderer.ctx.fill();

                // Inner Core (White)
                renderer.ctx.fillStyle = '#fff';
                renderer.ctx.globalAlpha = 0.9;
                renderer.ctx.beginPath();
                renderer.ctx.moveTo(0, -h / 2);
                renderer.ctx.lineTo(w * 0.3, 0);
                renderer.ctx.lineTo(0, h / 2);
                renderer.ctx.lineTo(-w * 0.3, 0);
                renderer.ctx.closePath();
                renderer.ctx.fill();
                renderer.ctx.fill();

                // Inner Core (White)
                renderer.ctx.shadowBlur = 5;
                renderer.ctx.fillStyle = '#fff';
                renderer.ctx.beginPath();
                renderer.ctx.moveTo(0, -this.height / 2 + 5);
                renderer.ctx.lineTo(this.width / 2, 0);
                renderer.ctx.lineTo(0, this.height / 2 - 5);
                renderer.ctx.lineTo(-this.width / 2, 0);
                renderer.ctx.closePath();
                renderer.ctx.fill();

            } else {
                // Standard Laser (Marisa/Okuu) - Beam
                // Soft outer glow
                renderer.ctx.shadowBlur = 12;
                renderer.ctx.shadowColor = this.color;
                renderer.ctx.globalAlpha = pulse * 0.4;
                renderer.ctx.fillStyle = this.color;
                renderer.ctx.fillRect(drawX - this.width / 2 - 2, drawY - this.height / 2, this.width + 4, this.height);

                // Main beam
                renderer.ctx.shadowBlur = 6;
                renderer.ctx.globalAlpha = pulse;
                renderer.ctx.fillRect(drawX - this.width / 2, drawY - this.height / 2, this.width, this.height);

                // Bright core
                renderer.ctx.shadowBlur = 0;
                renderer.ctx.fillStyle = '#fff';
                renderer.ctx.globalAlpha = 1.0;
                renderer.ctx.fillRect(drawX - this.width / 4, drawY - this.height / 2, this.width / 2, this.height);
            }
            renderer.ctx.restore();

        } else if (this.type === 'snake') {
            // Snake: White/Silver orb with trail (trail handled above)
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);

            renderer.ctx.shadowBlur = 8;
            renderer.ctx.shadowColor = '#fff';
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.beginPath();
            renderer.ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            renderer.ctx.fill();

            // Eyes
            renderer.ctx.fillStyle = '#f00';
            renderer.ctx.beginPath();
            renderer.ctx.arc(2, -2, 1, 0, Math.PI * 2);
            renderer.ctx.arc(2, 2, 1, 0, Math.PI * 2);
            renderer.ctx.fill();

        } else if (this.type === 'frog') {
            // Frog: Green circle with eyes
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);

            renderer.ctx.shadowBlur = 6;
            renderer.ctx.shadowColor = '#8bc34a';
            renderer.ctx.fillStyle = '#8bc34a';
            renderer.ctx.beginPath();
            renderer.ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            renderer.ctx.fill();

            // Eyes
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.beginPath();
            renderer.ctx.arc(-3, -3, 2, 0, Math.PI * 2);
            renderer.ctx.arc(3, -3, 2, 0, Math.PI * 2);
            renderer.ctx.fill();

            // Core
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.fillRect(-1, -this.height / 2 + 2, 2, this.height - 4);

        } else if (this.type === 'butterfly') {
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);
            renderer.ctx.shadowBlur = 10;
            renderer.ctx.shadowColor = this.color;
            renderer.ctx.fillStyle = this.color;
            
            // Wings
            renderer.ctx.beginPath();
            renderer.ctx.ellipse(-6, 0, 6, 10, Math.PI/6, 0, Math.PI * 2);
            renderer.ctx.ellipse(6, 0, 6, 10, -Math.PI/6, 0, Math.PI * 2);
            renderer.ctx.fill();
            
            // Body
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.beginPath();
            renderer.ctx.ellipse(0, 0, 2, 8, 0, 0, Math.PI * 2);
            renderer.ctx.fill();

        } else if (this.type === 'bat') {
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);
            renderer.ctx.fillStyle = this.color;
            
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(0, 5); // Head
            renderer.ctx.lineTo(-8, -5); // Left Wing
            renderer.ctx.quadraticCurveTo(-4, 0, -2, -2);
            renderer.ctx.lineTo(0, 2); // Body
            renderer.ctx.lineTo(2, -2);
            renderer.ctx.quadraticCurveTo(4, 0, 8, -5); // Right Wing
            renderer.ctx.closePath();
            renderer.ctx.fill();

        } else if (this.type === 'spear') {
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI/2);
            
            renderer.ctx.shadowBlur = 15;
            renderer.ctx.shadowColor = this.color;
            renderer.ctx.fillStyle = this.color;
            
            // Long spear shape
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(0, -this.height/2);
            renderer.ctx.lineTo(this.width/2, this.height/2);
            renderer.ctx.lineTo(-this.width/2, this.height/2);
            renderer.ctx.closePath();
            renderer.ctx.fill();
            
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(0, -this.height/2 + 5);
            renderer.ctx.lineTo(this.width/4, this.height/2 - 5);
            renderer.ctx.lineTo(-this.width/4, this.height/2 - 5);
            renderer.ctx.closePath();
            renderer.ctx.fill();

        } else if (this.type === 'bubble') {
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.shadowBlur = 5;
            renderer.ctx.shadowColor = this.color;
            renderer.ctx.strokeStyle = this.color;
            renderer.ctx.lineWidth = 1.5;
            renderer.ctx.beginPath();
            renderer.ctx.arc(0, 0, this.width/2, 0, Math.PI*2);
            renderer.ctx.stroke();
            renderer.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            renderer.ctx.fill();
            
            // Highlight
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.beginPath();
            renderer.ctx.arc(-this.width/4, -this.width/4, 2, 0, Math.PI*2);
            renderer.ctx.fill();

        } else if (this.type === 'talisman') {
            renderer.ctx.translate(drawX, drawY);
            renderer.ctx.rotate(this.rotation);
            renderer.ctx.fillStyle = '#fff'; // Paper
            renderer.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            renderer.ctx.fillStyle = 'red'; // Sigil
            renderer.ctx.fillRect(-this.width/4, -this.height/4, this.width/2, this.height/2);

        } else if (this.type === 'ice' || this.type === 'freeze' || this.type === 'icicle') {
             renderer.ctx.translate(drawX, drawY);
             renderer.ctx.rotate(this.type === 'freeze' ? this.rotation : Math.atan2(this.vy, this.vx) + Math.PI/2);
             renderer.ctx.shadowBlur = 8;
             renderer.ctx.shadowColor = this.color;
             renderer.ctx.fillStyle = 'rgba(200, 240, 255, 0.8)';
             
             // Diamond/Crystal shape
             renderer.ctx.beginPath();
             renderer.ctx.moveTo(0, -this.height/2);
             renderer.ctx.lineTo(this.width/2, 0);
             renderer.ctx.lineTo(0, this.height/2);
             renderer.ctx.lineTo(-this.width/2, 0);
             renderer.ctx.closePath();
             renderer.ctx.fill();
             
             renderer.ctx.fillStyle = '#fff';
             renderer.ctx.beginPath();
             renderer.ctx.moveTo(0, -this.height/4);
             renderer.ctx.lineTo(this.width/4, 0);
             renderer.ctx.lineTo(0, this.height/4);
             renderer.ctx.lineTo(-this.width/4, 0);
             renderer.ctx.closePath();
             renderer.ctx.fill();

        } else if (this.type === 'ufo' || this.type === 'chimera') {
             renderer.ctx.translate(drawX, drawY);
             renderer.ctx.rotate(this.rotation);
             renderer.ctx.shadowBlur = 10;
             renderer.ctx.shadowColor = this.color;
             
             // Dome
             renderer.ctx.fillStyle = this.color;
             renderer.ctx.beginPath();
             renderer.ctx.arc(0, -2, this.width/2, Math.PI, 0);
             renderer.ctx.fill();
             
             // Disk
             renderer.ctx.fillStyle = '#ddd';
             renderer.ctx.beginPath();
             renderer.ctx.ellipse(0, 2, this.width/1.5, this.height/3, 0, 0, Math.PI * 2);
             renderer.ctx.fill();

        } else if (this.type === 'spirit') {
             renderer.ctx.translate(drawX, drawY);
             renderer.ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI/2);
             renderer.ctx.shadowBlur = 10;
             renderer.ctx.shadowColor = this.color;
             
             // Wisp shape
             renderer.ctx.fillStyle = this.color;
             renderer.ctx.beginPath();
             renderer.ctx.arc(0, 0, this.width/2, 0, Math.PI); // Bottom round
             renderer.ctx.lineTo(0, -this.height); // Top point
             renderer.ctx.closePath();
             renderer.ctx.fill();

        } else if (this.type === 'note') {
             renderer.ctx.translate(drawX, drawY);
             renderer.ctx.shadowBlur = 5;
             renderer.ctx.shadowColor = this.color;
             renderer.ctx.fillStyle = this.color;
             renderer.ctx.font = '20px serif';
             renderer.ctx.textAlign = 'center';
             renderer.ctx.textBaseline = 'middle';
             renderer.ctx.fillText('♪', 0, 0);

        } else if (this.type === 'bone') {
             renderer.ctx.translate(drawX, drawY);
             renderer.ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI/2);
             renderer.ctx.fillStyle = '#fff';
             
             const w = this.width;
             const h = this.height;
             
             // Bone shaft
             renderer.ctx.fillRect(-w/4, -h/2 + w/2, w/2, h - w);
             
             // Ends
             renderer.ctx.beginPath();
             renderer.ctx.arc(-w/3, -h/2 + w/3, w/3, 0, Math.PI*2);
             renderer.ctx.arc(w/3, -h/2 + w/3, w/3, 0, Math.PI*2);
             renderer.ctx.arc(-w/3, h/2 - w/3, w/3, 0, Math.PI*2);
             renderer.ctx.arc(w/3, h/2 - w/3, w/3, 0, Math.PI*2);
             renderer.ctx.fill();

        } else if (this.type === 'crystal') {
             renderer.ctx.translate(drawX, drawY);
             renderer.ctx.rotate(this.rotation + this.timer * 5);
             renderer.ctx.shadowBlur = 5;
             renderer.ctx.shadowColor = this.color;
             renderer.ctx.fillStyle = this.color;
             
             renderer.ctx.beginPath();
             renderer.ctx.moveTo(0, -this.height/2);
             renderer.ctx.lineTo(this.width/2, 0);
             renderer.ctx.lineTo(0, this.height/2);
             renderer.ctx.lineTo(-this.width/2, 0);
             renderer.ctx.closePath();
             renderer.ctx.fill();
             
             renderer.ctx.fillStyle = 'rgba(255,255,255,0.8)';
             renderer.ctx.beginPath();
             renderer.ctx.moveTo(0, -this.height/4);
             renderer.ctx.lineTo(this.width/4, 0);
             renderer.ctx.lineTo(0, this.height/4);
             renderer.ctx.lineTo(-this.width/4, 0);
             renderer.ctx.closePath();
             renderer.ctx.fill();

        } else {
            // Default / Straight: Simple glowing rectangle
            renderer.ctx.shadowBlur = 8;
            renderer.ctx.shadowColor = this.color;
            renderer.ctx.fillStyle = this.color;
            renderer.ctx.fillRect(drawX - this.width / 2, drawY - this.height / 2, this.width, this.height);

            // Core
            renderer.ctx.shadowBlur = 0;
            renderer.ctx.fillStyle = '#fff';
            renderer.ctx.globalAlpha = 0.8;
            renderer.ctx.fillRect(drawX - this.width / 4, drawY - this.height / 2 + 2, this.width / 2, this.height - 4);
        }

        renderer.ctx.restore();
    }
}

export default class PlayerBulletManager {
    constructor(game) {
        this.game = game;
        this.pool = [];
        this.poolSize = 300;

        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new PlayerBullet(game));
        }
    }

    getBullet() {
        for (let i = 0; i < this.poolSize; i++) {
            if (!this.pool[i].active) {
                return this.pool[i];
            }
        }
        return null;
    }

    spawn(x, y, vx, vy, damage, type) {
        const b = this.getBullet();
        if (b) {
            b.spawn(x, y, vx, vy, damage, type);
        }
    }

    spawnPlayerBullet(x, y, vx, vy, scale, type, color, damage) {
        const b = this.getBullet();
        if (b) {
            const s = scale === 0 ? 1 : scale;
            b.spawnCustom(x, y, vx, vy, damage, type, color, s);
        }
    }

    update(dt) {
        for (let i = 0; i < this.poolSize; i++) {
            if (this.pool[i].active) {
                this.pool[i].update(dt);
            }
        }
    }

    render(renderer, alpha = 1.0) {
        for (let i = 0; i < this.poolSize; i++) {
            if (this.pool[i].active) {
                this.pool[i].render(renderer, alpha);
            }
        }
    }
}
