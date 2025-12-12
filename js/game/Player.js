import Entity from './Entity.js';

export default class Player extends Entity {
    constructor(game, x, y, bulletManager, character = 'Reimu', shotType = 'A') {
        super(game, x, y);
        this.bulletManager = bulletManager;
        this.character = character;
        this.shotType = shotType;
        this.type = 'player';

        // Stats based on character
        if (this.character === 'Marisa') {
            this.speed = 300;
            this.focusSpeed = 120;
            this.color = '#ff0'; // Marisa yellow
        } else if (this.character === 'Sakuya') {
            this.speed = 280;
            this.focusSpeed = 110;
            this.color = '#aaa'; // Sakuya silver
        } else if (this.character === 'Youmu') {
            this.speed = 290;
            this.focusSpeed = 110;
            this.color = '#e0e0e0'; // Youmu white/silver
        } else if (this.character === 'Sanae') {
            this.speed = 270;
            this.focusSpeed = 100;
            this.color = '#8bc34a'; // Sanae green
        } else if (this.character === 'Remilia') {
            this.speed = 320; // Very fast
            this.focusSpeed = 130;
            this.color = '#f00'; // Scarlet
        } else if (this.character === 'Flandre') {
            this.speed = 320; // Very fast
            this.focusSpeed = 130;
            this.color = '#ff0000'; // Deep Red
        } else if (this.character === 'Okuu') {
            this.speed = 220; // Slow
            this.focusSpeed = 80;
            this.color = '#f00'; // Nuclear Red
        } else if (this.character === 'Nue') {
            this.speed = 300; // Fast
            this.focusSpeed = 120;
            this.color = '#800080'; // Purple
        } else if (this.character === 'Parsee') {
            this.speed = 260; // Average
            this.focusSpeed = 100;
            this.color = '#0f0'; // Green
        } else if (this.character === 'Yuyuko') {
            this.speed = 240; // Slow
            this.focusSpeed = 90;
            this.color = '#f0f'; // Pink
        } else {
            // Reimu / Default
            this.speed = 260;
            this.focusSpeed = 100;
            this.color = '#f00'; // Reimu red
        }
        
        this.prevX = x;
        this.prevY = y;

        this.radius = 3; // Tiny hitbox
        this.grazeRadius = 20;
        this.shootTimer = 0;
        this.shootDelay = 0.05; // Fast fire rate (High Rate Feel)

        this.lives = 3;
        this.bombs = 3;
        this.power = 0;
        this.maxPower = 128; // EoSD authentic max power
        this.invulnerableTimer = 0;
        this.bombTimer = 0; // Visual timer for bomb
        this.invulnerableTimer = 0;
        this.bombTimer = 0; // Visual timer for bomb
        this.state = 'alive'; // alive, dying, dead
        this.trail = []; // Afterimage trail
    }

    update(dt) {
        if (this.state === 'dead') return;
        
        this.prevX = this.x;
        this.prevY = this.y;

        // Update Trail
        if (this.game.accumulator % 0.05 < 0.02) { // Add trail point every few frames basically
             this.trail.push({ x: this.x, y: this.y, alpha: 0.5 });
             if (this.trail.length > 5) this.trail.shift();
        }
        // Fade trails
        this.trail.forEach(t => t.alpha -= dt * 2);
        this.trail = this.trail.filter(t => t.alpha > 0);

        // Movement
        let dx = 0;
        let dy = 0;
        const speed = this.game.input.isDown('FOCUS') ? this.focusSpeed : this.speed;

        if (this.game.input.isDown('UP')) { dy -= 1; }
        if (this.game.input.isDown('DOWN')) { dy += 1; }
        if (this.game.input.isDown('LEFT')) { dx -= 1; }
        if (this.game.input.isDown('RIGHT')) { dx += 1; }

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        this.x += dx * speed * dt;
        this.y += dy * speed * dt;

        // Bounds
        this.x = Math.max(this.radius, Math.min(this.game.playAreaWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(this.game.height - this.radius, this.y));

        // Shooting
        this.shootTimer -= dt;
        if (this.game.input.isDown('SHOOT') && this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = this.shootDelay;
        }

        // Reimu Bomb Damage Logic
        if (this.character === 'Reimu' && this.bombTimer > 0) {
            const t = 2.0 - this.bombTimer;
            const currentRadius = t * 250; // Faster expansion
            const orbCount = 8;
            const rotationSpeed = 8; // Faster rotation
            const angleOffset = t * rotationSpeed;
            const orbRadius = 30; // Larger orbs

            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                // Field Damage (Graze)
                scene.enemies.forEach(e => {
                    if (e.active) {
                        const dist = Math.hypot(e.x - this.x, e.y - this.y);
                        if (dist < currentRadius + e.radius) {
                            e.takeDamage(5); // Increased from 2
                        }
                    }
                });

                // Orb Damage
                for (let i = 0; i < orbCount; i++) {
                    const angle = (i / orbCount) * Math.PI * 2 + angleOffset;
                    const ox = this.x + Math.cos(angle) * currentRadius;
                    const oy = this.y + Math.sin(angle) * currentRadius;

                    scene.enemies.forEach(e => {
                        if (e.active) {
                            const dist = Math.hypot(e.x - ox, e.y - oy);
                            if (dist < orbRadius + e.radius) {
                                e.takeDamage(25); // Increased from 10
                            }
                        }
                    });
                }
            }
        }

        // Marisa Bomb Damage Logic (Master Spark)
        if (this.character === 'Marisa' && this.bombTimer > 0) {
            const width = 100;
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        // Check if enemy is within the vertical beam
                        if (Math.abs(e.x - this.x) < width / 2 + e.radius && e.y < this.y) {
                            e.takeDamage(15); // High continuous damage
                        }
                    }
                });
            }
        }

        // Youmu Bomb (200 Yojana in One Slash)
        if (this.character === 'Youmu' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        // Full screen slash damage
                        e.takeDamage(10);
                    }
                });
            }
        }

        // Sanae Bomb (Miracle)
        if (this.character === 'Sanae' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(5); // Continuous miracle damage
                    }
                });
            }
        }

        // Remilia Bomb (Red Magic)
        if (this.character === 'Remilia' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(12); // High continuous damage (Vampiric)
                    }
                });
            }
        }

        // Flandre Bomb (Levatine)
        if (this.character === 'Flandre' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(20); // Extreme damage (Destruction)
                    }
                });
            }
        }

        // Okuu Bomb (Subterranean Sun)
        if (this.character === 'Okuu' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.cameraShake = 5; // Screen shake
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(25); // Massive damage
                    }
                });
            }
        }

        // Nue Bomb (Danmaku Chimera)
        if (this.character === 'Nue' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(10);
                    }
                });
            }
        }

        // Parsee Bomb (Green-Eyed Monster)
        if (this.character === 'Parsee' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(8); // Continuous burn
                    }
                });
            }
        }

        // Yuyuko Bomb (Ghastly Dream)
        if (this.character === 'Yuyuko' && this.bombTimer > 0) {
            const scene = this.game.sceneManager.currentScene;
            if (scene && scene.enemies) {
                scene.enemies.forEach(e => {
                    if (e.active) {
                        e.takeDamage(15); // Spirit damage
                    }
                });
            }
        }

        // Bomb
        if (this.game.input.isDown('BOMB') && this.bombs > 0 && this.state === 'alive') {
            if (!this.bombCooldown || this.bombCooldown <= 0) {
                this.useBomb();
                this.bombCooldown = 2.0; // 2 seconds between bombs
            }
        }
        if (this.bombCooldown > 0) {
            this.bombCooldown -= dt;
        }

        // Invulnerability
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
        }
        if (this.bombTimer > 0) {
            this.bombTimer -= dt;
        }
    }

    addPower(amount) {
        this.power += amount;
        if (this.power > this.maxPower) this.power = this.maxPower;
    }

    useBomb() {
        if (this.bombs <= 0 && !this.game.config.infiniteBombs) return;

        if (!this.game.config.infiniteBombs) {
            this.bombs--;
        }

        this.invulnerableTimer = 3.0; // Invincible during bomb
        this.bombTimer = 2.0; // Visual effect duration
        this.game.soundManager.playBomb();
        console.log("BOMB USED!");

        // Visuals
        const scene = this.game.sceneManager.currentScene;
        scene.cameraShake = 20;
        // Bullet Clear
        if (scene.bulletManager) {
            scene.bulletManager.clear();
        }

        // Particle Bomb Effect
        if (scene.particleSystem) {
             const color = this.getBombColor();
             scene.particleSystem.emit(this.x, this.y, {
                 vx: 0, vy: 0,
                 life: 1.0,
                 color: color,
                 size: 10,
                 type: 'ring',
                 scaleSpeed: 1000, // Massive expansion
                 blendMode: 'lighter'
             });

             // Use new Shockwave effect
             scene.particleSystem.createBombShockwave(this.x, this.y);
             
             // Screen flash (handled elsewhere or simulate with giant particle?)
             // Let's spawn a huge white flash particle
             scene.particleSystem.emit(this.game.width/2, this.game.height/2, {
                vx: 0, vy: 0,
                life: 0.2,
                color: '#fff',
                size: 1000, // Cover screen
                type: 'square',
                blendMode: 'lighter'
             });
        }
    }
    
    getBombColor() {
        if (this.character === 'Reimu') return '#f88';
        if (this.character === 'Marisa') return '#ff8';
        if (this.character === 'Sakuya') return '#aaf';
        if (this.character === 'Youmu') return '#fff';
        if (this.character === 'Sanae') return '#8f8';
        if (this.character === 'Remilia') return '#f00';
        if (this.character === 'Flandre') return '#f00';
        return '#fff';
    }



    shoot() {
        if (this.bulletManager) {
            this.game.soundManager.playShoot();



            // Determine Shot Level (EoSD authentic)
            let level = 1;
            if (this.power >= 8) level = 2; // EoSD: 8 power
            if (this.power >= 16) level = 3; // EoSD: 16 power  
            if (this.power >= 32) level = 4; // EoSD: 32 power
            if (this.power >= 64) level = 5; // EoSD: 64 power (max level)

            // Cheat: Max Power
            if (this.game.config.maxPower) level = 5;

            const isFocused = this.game.input.isDown('FOCUS');
            
            // Muzzle Flash
            this.spawnMuzzleFlash(isFocused);
            
            if (this.character === 'Reimu') {
                this.shootReimu(level, isFocused);
            } else if (this.character === 'Marisa') {
                this.shootMarisa(level, isFocused);
            } else if (this.character === 'Sakuya') {
                this.shootSakuya(level, isFocused);
            } else if (this.character === 'Youmu') {
                this.shootYoumu(level, isFocused);
            } else if (this.character === 'Sanae') {
                this.shootSanae(level, isFocused);
            } else if (this.character === 'Remilia') {
                this.shootRemilia(level, isFocused);
            } else if (this.character === 'Flandre') {
                this.shootFlandre(level, isFocused);
            } else if (this.character === 'Okuu') {
                this.shootOkuu(level, isFocused);
            } else if (this.character === 'Nue') {
                this.shootNue(level, isFocused);
            } else if (this.character === 'Parsee') {
                this.shootParsee(level, isFocused);
            } else if (this.character === 'Yuyuko') {
                this.shootYuyuko(level, isFocused);
            } else if (this.character === 'Cirno') {
                this.shootCirno(level, isFocused);
            } else if (this.character === 'Patchouli') {
                this.shootPatchouli(level, isFocused);
            } else if (this.character === 'Rumia') {
                this.shootRumia(level, isFocused);
            } else if (this.character === 'Sans') {
                this.shootSans(level, isFocused);
            }
        }
    }

    spawnMuzzleFlash(isFocused) {
        const scene = this.game.sceneManager.currentScene;
        if (scene && scene.particleSystem) {
            let color = '#fff';
            if (this.character === 'Reimu') color = '#f88';
            else if (this.character === 'Marisa') color = '#ff8';
            else if (this.character === 'Sakuya') color = '#aaf';
            else if (this.character === 'Youmu') color = '#fff';
            else if (this.character === 'Sanae') color = '#8f8';
            else if (this.character === 'Cirno') color = '#0ff';
            else if (this.character === 'Patchouli') color = '#f0f';
            else if (this.character === 'Rumia') color = '#444';
            else if (this.character === 'Sans') color = '#00f';
            else if (this.character === 'Flandre') color = '#f00';
            else if (this.character === 'Remilia') color = '#f00';

            // Flash Core
            scene.particleSystem.emit(this.x, this.y - 15, {
                vx: 0, vy: -50,
                life: 0.1,
                color: '#fff',
                size: 20,
                type: 'circle',
                scaleSpeed: -100,
                blendMode: 'lighter'
            });
            
            // Colored Glow
            scene.particleSystem.emit(this.x, this.y - 15, {
                vx: 0, vy: -50,
                life: 0.2,
                color: color,
                size: 30,
                type: 'circle',
                scaleSpeed: -100,
                blendMode: 'lighter'
            });

            // Sparks
            const spread = isFocused ? 0.5 : 1.5;
            for (let i = 0; i < 4; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
                const speed = 100 + Math.random() * 200;
                scene.particleSystem.emit(this.x, this.y - 10, {
                    vx: Math.cos(angle) * speed, 
                    vy: Math.sin(angle) * speed,
                    life: 0.15,
                    color: color,
                    size: 3,
                    type: 'spark',
                    rotation: angle,
                    blendMode: 'lighter'
                });
            }
        }
    }

    shootReimu(level, isFocused) {
        // Reimu Type A: Homing Amulet
        // Main Shot
        this.bulletManager.spawn(this.x - 8, this.y - 10, 0, -1200, 2, 'straight');
        this.bulletManager.spawn(this.x + 8, this.y - 10, 0, -1200, 2, 'straight');

        // Sub Shots (Homing)
        // Focus Mode: Spawn closer to center and aim more forward
        const xSpread = isFocused ? 0.3 : 1.0;
        const xVelSpread = isFocused ? 0.2 : 1.0;

        if (level >= 2) {
            this.bulletManager.spawn(this.x - 16 * xSpread, this.y, -100 * xVelSpread, -1000, 1, 'homing');
            this.bulletManager.spawn(this.x + 16 * xSpread, this.y, 100 * xVelSpread, -1000, 1, 'homing');
        }
        if (level >= 3) {
            this.bulletManager.spawn(this.x - 24 * xSpread, this.y, -200 * xVelSpread, -900, 1, 'homing');
            this.bulletManager.spawn(this.x + 24 * xSpread, this.y, 200 * xVelSpread, -900, 1, 'homing');
        }
        if (level >= 4) {
            this.bulletManager.spawn(this.x - 32 * xSpread, this.y, -300 * xVelSpread, -800, 1, 'homing');
            this.bulletManager.spawn(this.x + 32 * xSpread, this.y, 300 * xVelSpread, -800, 1, 'homing');
        }
    }

    shootMarisa(level, isFocused) {
        // Marisa Type A: Magic Missile
        // Main Shot
        this.bulletManager.spawn(this.x - 10, this.y - 10, 0, -1400, 3, 'missile');
        this.bulletManager.spawn(this.x + 10, this.y - 10, 0, -1400, 3, 'missile');

        // Sub Shots (Missiles)
        // Focus Mode: Tighten spread
        const spread = isFocused ? 0.2 : 1.0;

        if (level >= 2) {
            this.bulletManager.spawn(this.x - 20 * spread, this.y, 0, -1200, 2, 'missile');
            this.bulletManager.spawn(this.x + 20 * spread, this.y, 0, -1200, 2, 'missile');
        }
        if (level >= 3) {
            this.bulletManager.spawn(this.x - 30 * spread, this.y, 0, -1200, 2, 'missile');
            this.bulletManager.spawn(this.x + 30 * spread, this.y, 0, -1200, 2, 'missile');
        }
        if (level >= 4) {
            this.bulletManager.spawn(this.x - 40 * spread, this.y, 0, -1200, 2, 'missile');
            this.bulletManager.spawn(this.x + 40 * spread, this.y, 0, -1200, 2, 'missile');
        }
    }

    shootSakuya(level, isFocused) {
        // Main Shot (Always Knives)
        this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1300, 2, 'straight');
        this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1300, 2, 'straight');

        const speed = 1100;

        if (this.shotType === 'A') {
            // Type A: Jack the Ludo (Spread Knives)
            // Focus Mode: Tighten spread significantly
            const angleBase = isFocused ? 0.02 : 0.12; // Much tighter when focused

            if (level >= 2) {
                this.bulletManager.spawn(this.x - 10, this.y, Math.sin(-angleBase) * speed, -Math.cos(angleBase) * speed, 1.5, 'needle');
                this.bulletManager.spawn(this.x + 10, this.y, Math.sin(angleBase) * speed, -Math.cos(angleBase) * speed, 1.5, 'needle');
            }
            if (level >= 3) {
                this.bulletManager.spawn(this.x - 20, this.y, Math.sin(-angleBase * 2) * speed, -Math.cos(angleBase * 2) * speed, 1.5, 'needle');
                this.bulletManager.spawn(this.x + 20, this.y, Math.sin(angleBase * 2) * speed, -Math.cos(angleBase * 2) * speed, 1.5, 'needle');
            }
            if (level >= 4) {
                this.bulletManager.spawn(this.x - 30, this.y, Math.sin(-angleBase * 3) * speed, -Math.cos(angleBase * 3) * speed, 1.5, 'needle');
                this.bulletManager.spawn(this.x + 30, this.y, Math.sin(angleBase * 3) * speed, -Math.cos(angleBase * 3) * speed, 1.5, 'needle');
            }
        } else {
            // Type B: Misdirection (Bouncing/Ricocheting Knives)
            // Focus: Knives go more straight, unfocused: wider spread
            const spreadX = isFocused ? 50 : 200;
            const speedY = isFocused ? -1200 : -1000;

            if (level >= 2) {
                // Knives that spread out then curve inward
                this.bulletManager.spawn(this.x - 15, this.y, -spreadX, speedY, 1.8, 'needle_bounce');
                this.bulletManager.spawn(this.x + 15, this.y, spreadX, speedY, 1.8, 'needle_bounce');
            }
            if (level >= 3) {
                this.bulletManager.spawn(this.x - 25, this.y, -spreadX * 1.5, speedY * 0.9, 1.8, 'needle_bounce');
                this.bulletManager.spawn(this.x + 25, this.y, spreadX * 1.5, speedY * 0.9, 1.8, 'needle_bounce');
            }
            if (level >= 4) {
                this.bulletManager.spawn(this.x - 35, this.y, -spreadX * 2, speedY * 0.8, 1.8, 'needle_bounce');
                this.bulletManager.spawn(this.x + 35, this.y, spreadX * 2, speedY * 0.8, 1.8, 'needle_bounce');
            }
        }
    }

    shootYoumu(level, isFocused) {
        // Youmu Type A: Sword (Straight)
        // Main Shot
        this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1300, 2, 'straight');
        this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1300, 2, 'straight');

        // Phantom Shot (Sword Beams)
        const spread = isFocused ? 0.1 : 0.3;

        if (level >= 2) {
            this.bulletManager.spawn(this.x - 20, this.y, -100 * spread, -1200, 2, 'sword');
            this.bulletManager.spawn(this.x + 20, this.y, 100 * spread, -1200, 2, 'sword');
        }
        if (level >= 3) {
            this.bulletManager.spawn(this.x - 30, this.y, -200 * spread, -1100, 2, 'sword');
            this.bulletManager.spawn(this.x + 30, this.y, 200 * spread, -1100, 2, 'sword');
        }
        if (level >= 4) {
            this.bulletManager.spawn(this.x, this.y - 20, 0, -1400, 3, 'sword'); // Center heavy
        }
    }

    shootSanae(level, isFocused) {
        // Sanae Type A: Wind (Straight) + Type B: Snakes (Homing)
        // Main Shot
        this.bulletManager.spawn(this.x - 8, this.y - 10, 0, -1200, 2, 'straight');
        this.bulletManager.spawn(this.x + 8, this.y - 10, 0, -1200, 2, 'straight');

        const spread = isFocused ? 0.2 : 0.8;

        if (this.shotType === 'A') {
            // Wind/Frogs
            if (level >= 2) {
                this.bulletManager.spawn(this.x - 20, this.y, -100 * spread, -1000, 2, 'frog');
                this.bulletManager.spawn(this.x + 20, this.y, 100 * spread, -1000, 2, 'frog');
            }
            if (level >= 3) {
                this.bulletManager.spawn(this.x - 35, this.y, -200 * spread, -900, 2, 'frog');
                this.bulletManager.spawn(this.x + 35, this.y, 200 * spread, -900, 2, 'frog');
            }
        } else {
            // Snakes (Homing/Wavy)
            if (level >= 2) {
                this.bulletManager.spawn(this.x - 20, this.y, -150, -1000, 2, 'snake');
                this.bulletManager.spawn(this.x + 20, this.y, 150, -1000, 2, 'snake');
            }
            if (level >= 3) {
                this.bulletManager.spawn(this.x - 40, this.y, -300, -900, 2, 'snake');
                this.bulletManager.spawn(this.x + 40, this.y, 300, -900, 2, 'snake');
            }
        }
    }

    render(renderer, alpha = 1.0) {
        if (this.state === 'dead') return;
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) return; // Flicker

        // Draw character sprite
        // Ensure character name matches asset keys (lowercase)
        let spriteKey = this.character.toLowerCase();

        // Handle special cases or alternate names if necessary
        if (spriteKey === 'hong meiling') spriteKey = 'meiling';

         // Render Trail
        if (!this.active) return; // Safety
        const ctx = renderer.ctx;
        ctx.save();
        this.trail.forEach(t => {
            ctx.globalAlpha = t.alpha * 0.5;
            renderer.drawSprite(spriteKey, t.x, t.y, 32, 48);
        });
        ctx.restore();

        // Draw the sprite
        const drawX = this.prevX ? (this.prevX + (this.x - this.prevX) * alpha) : this.x;
        const drawY = this.prevY ? (this.prevY + (this.y - this.prevY) * alpha) : this.y;
        
        renderer.drawSprite(spriteKey, drawX, drawY, 32, 48);

        // Draw Options (Satellites) - Visual only for now
        const time = Date.now() / 200;
        if (this.power >= 10 || this.game.config.maxPower) {
            const yOffset = Math.sin(time) * 5;
            renderer.drawCircle(drawX - 20, drawY + yOffset, 5, this.character === 'Reimu' ? '#f00' : '#ff0');
            renderer.drawCircle(drawX + 20, drawY - yOffset, 5, this.character === 'Reimu' ? '#f00' : '#ff0');
        }
        if (this.power >= 30 || this.game.config.maxPower) {
            const yOffset = Math.cos(time) * 5;
            renderer.drawCircle(drawX - 35, drawY + 10 + yOffset, 5, this.character === 'Reimu' ? '#f00' : '#ff0');
            renderer.drawCircle(drawX + 35, drawY + 10 - yOffset, 5, this.character === 'Reimu' ? '#f00' : '#ff0');
        }

        // Draw hitbox if focused OR showHitbox cheat is on
        if (this.game.input.isDown('FOCUS') || this.game.config.showHitbox) {
            // Outer glow
            renderer.ctx.save();
            renderer.ctx.globalAlpha = 0.5;
            renderer.drawCircle(drawX, drawY, this.radius * 3, this.character === 'Reimu' ? '#f00' : '#00f');
            renderer.ctx.restore();
            // Inner core
            renderer.drawCircle(drawX, drawY, this.radius, '#fff');
        }

        // Draw Bomb Effect
        if (this.bombTimer > 0) {
            renderer.ctx.save();
            renderer.ctx.globalAlpha = Math.min(1, this.bombTimer);

            if (this.character === 'Reimu') {
                // Fantasy Seal: Large colored circles expanding + Rotating Orbs
                const t = 2.0 - this.bombTimer;
                const maxRadius = 300;
                const currentRadius = t * 150;

                // Main expanding field
                renderer.ctx.fillStyle = `rgba(255, 0, 0, 0.2)`;
                renderer.ctx.beginPath();
                renderer.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
                renderer.ctx.fill();

                // Rotating Orbs
                const orbCount = 8;
                const orbRadius = 20;
                const rotationSpeed = 5;
                const angleOffset = t * rotationSpeed;

                for (let i = 0; i < orbCount; i++) {
                    const angle = (i / orbCount) * Math.PI * 2 + angleOffset;
                    const ox = this.x + Math.cos(angle) * currentRadius;
                    const oy = this.y + Math.sin(angle) * currentRadius;

                    renderer.ctx.fillStyle = '#fff';
                    renderer.ctx.shadowBlur = 10;
                    renderer.ctx.shadowColor = '#f00';
                    renderer.ctx.beginPath();
                    renderer.ctx.arc(ox, oy, orbRadius, 0, Math.PI * 2);
                    renderer.ctx.fill();
                }

                renderer.ctx.shadowBlur = 0;

            } else if (this.character === 'Marisa') {
                // Master Spark: Giant Laser with core and pulse
                const pulse = Math.sin(this.bombTimer * 20) * 0.2 + 1.0;
                const width = (120 + Math.sin(this.bombTimer * 10) * 20) * pulse;

                // Outer Glow
                renderer.ctx.fillStyle = `rgba(255, 255, 0, 0.4)`;
                renderer.ctx.shadowBlur = 20;
                renderer.ctx.shadowColor = '#ff0';
                renderer.ctx.fillRect(this.x - width / 2, 0, width, this.y);

                // Inner Core
                renderer.ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
                renderer.ctx.shadowBlur = 10;
                renderer.ctx.fillRect(this.x - width / 4, 0, width / 2, this.y);

                // Base Spark
                renderer.ctx.beginPath();
                renderer.ctx.arc(this.x, this.y, width * 0.8, 0, Math.PI * 2);
                renderer.ctx.fillStyle = '#fff';
                renderer.ctx.fill();

            } else if (this.character === 'Sakuya') {
                // Killing Doll: Time Stop / Blue Tint / Distortion
                renderer.ctx.fillStyle = `rgba(0, 0, 50, 0.5)`;
                renderer.ctx.fillRect(0, 0, this.game.width, this.game.height);

                // Random knives appearing frozen in time
                // Use a deterministic seed based on timer to make them "flicker" in and out
                const seed = Math.floor(this.bombTimer * 20);
                const count = 20;

                renderer.ctx.shadowBlur = 5;
                renderer.ctx.shadowColor = '#0ff';

                for (let i = 0; i < count; i++) {
                    // Pseudo-random based on seed + i
                    const r1 = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
                    const r2 = Math.cos(seed * 12.9898 + i * 78.233) * 43758.5453;
                    const kx = Math.abs(r1 % this.game.width);
                    const ky = Math.abs(r2 % this.game.height);

                    renderer.drawSprite('knife', kx, ky, 16, 32);
                }
                renderer.ctx.shadowBlur = 0;
            } else if (this.character === 'Youmu') {
                // Slash effects
                renderer.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
                renderer.ctx.fillRect(0, 0, this.game.width, this.game.height);

                // Draw big slash lines
                renderer.ctx.strokeStyle = '#fff';
                renderer.ctx.lineWidth = 5;
                renderer.ctx.beginPath();
                renderer.ctx.moveTo(0, this.game.height);
                renderer.ctx.lineTo(this.game.width, 0);
                renderer.ctx.stroke();

                renderer.ctx.beginPath();
                renderer.ctx.moveTo(0, 0);
                renderer.ctx.lineTo(this.game.width, this.game.height);
                renderer.ctx.stroke();

            } else if (this.character === 'Sanae') {
                // Green Miracle Wind
                renderer.ctx.fillStyle = `rgba(100, 255, 100, 0.2)`;
                renderer.ctx.fillRect(0, 0, this.game.width, this.game.height);
            } else if (this.character === 'Remilia') {
                // Red Magic: Blood Mist
                renderer.ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
                renderer.ctx.fillRect(0, 0, this.game.width, this.game.height);
                // Draw Cross
                renderer.ctx.fillStyle = '#f00';
                renderer.ctx.fillRect(this.x - 100, this.y - 20, 200, 40);
                renderer.ctx.fillRect(this.x - 20, this.y - 100, 40, 200);
            } else if (this.character === 'Flandre') {
                // Levatine: Chaos
                renderer.ctx.fillStyle = `rgba(255, 0, 0, 0.5)`;
                renderer.ctx.fillRect(0, 0, this.game.width, this.game.height);
                // Random explosions
                for (let i = 0; i < 5; i++) {
                    renderer.ctx.fillStyle = '#ff0';
                    const rx = Math.random() * this.game.width;
                    const ry = Math.random() * this.game.height;
                    renderer.ctx.beginPath();
                    renderer.ctx.arc(rx, ry, 50, 0, Math.PI * 2);
                    renderer.ctx.fill();
                }
            }
            renderer.ctx.restore();
        }
    }

    die() {
        if (this.invulnerableTimer > 0) return;

        // God Mode Cheat
        if (this.game.config.godMode) {
            console.log("God Mode Active - Death Prevented");
            this.invulnerableTimer = 1.0;
            return;
        }

        // Auto Bomb Cheat
        if (this.game.config.autoBomb && this.bombs > 0) {
            console.log("Auto Bomb Triggered!");
            this.useBomb();
            return;
        }

        this.lives--;
        console.log(`Player Died! Lives remaining: ${this.lives}`);
        this.game.soundManager.playPlayerDie();

        const scene = this.game.sceneManager.currentScene;
        if (scene) {
            scene.cameraShake = 10;
            if (scene.particleSystem) {
                // "Pichuun" effect
                scene.particleSystem.createExplosion(this.x, this.y, this.color);
                scene.particleSystem.emit(this.x, this.y, {
                    vx: 0, vy: 0,
                    life: 0.5,
                    color: this.color,
                    size: 5,
                    type: 'ring',
                    scaleSpeed: 500,
                    blendMode: 'lighter'
                });
            }
        }

        if (this.lives < 0) {
            this.state = 'dead';
            console.log("GAME OVER - Show Continue Screen");
            if (this.game.sceneManager.currentScene && this.game.sceneManager.currentScene.showContinueScreen) {
                this.game.sceneManager.currentScene.showContinueScreen();
            } else {
                import('../scenes/TitleScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            }
        } else {
            // Respawn
            this.x = (this.game.playAreaWidth || this.game.width) / 2;
            this.y = this.game.height - 50;
            this.invulnerableTimer = 3.0;
            this.bombs = this.game.config.startingBombs; // Reset bombs to config default
            // Less harsh power loss: Lose 0.5 power (assuming 1.0 = 1 level)
            // If power is 0-4.0, we lose 0.5.
            this.power = Math.max(0, this.power - 0.5);
        }
    }

    shootRemilia(level, isFocused) {
        // Type A: Gungnir (Cool Red Spear Laser)
        if (this.shotType === 'A') {
            // Main Gungnir Spear (Giant Laser)
            const damage = 3 + level;
            this.bulletManager.spawnPlayerBullet(this.x, this.y - 20, 0, -1500, 2.5, 'laser', '#f00', damage);

            // Sub-lasers (if high level)
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 15, this.y, 0, -1200, 1.0, 'laser', '#800', 1);
                this.bulletManager.spawnPlayerBullet(this.x + 15, this.y, 0, -1200, 1.0, 'laser', '#800', 1);
            }
        }
        // Type B: Vampire Kiss (Homing Bats/Snakes)
        else {
            const count = level + 2;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.3;
                // Use 'snake' type which homes/waves
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 600, Math.sin(angle) * 600, 1, 'snake', '#f00', 1);
            }
        }
    }

    shootFlandre(level, isFocused) {
        // Type A: Laevateinn (Wide Swing / Spread)
        if (this.shotType === 'A') {
            const count = level * 2 + 1;
            const spread = isFocused ? 0.2 : 1.0;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * spread;
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 800, Math.sin(angle) * 800, 1.5, 'straight', '#ff0', 2);
            }
        }
        // Type B: Starbow Break (Rainbow Star Missiles)
        else {
            const count = 3 + level; // More stars
            const colors = ['#f00', '#ff7f00', '#ff0', '#0f0', '#00f', '#4b0082', '#8f00ff']; // Rainbow
            const spread = isFocused ? 0.5 : 1.5;

            for (let i = 0; i < count; i++) {
                // Fan shape
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * (spread / count);
                const color = colors[i % colors.length];
                // Use 'missile' type (Star shape)
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 700, Math.sin(angle) * 700, 1.2, 'missile', color, 2);
            }
        }
    }

    shootOkuu(level, isFocused) {
        // Type A: Fusion (Big Fireballs)
        if (this.shotType === 'A') {
            const damage = 2 + level;
            this.bulletManager.spawnPlayerBullet(this.x, this.y - 20, 0, -600, 2.0, 'straight', '#f00', damage);
            if (level >= 3) {
                this.bulletManager.spawnPlayerBullet(this.x - 30, this.y, 0, -500, 1.5, 'straight', '#f80', damage / 2);
                this.bulletManager.spawnPlayerBullet(this.x + 30, this.y, 0, -500, 1.5, 'straight', '#f80', damage / 2);
            }
        }
        // Type B: Subterranean Sun (Lasers)
        else {
            const count = level + 1;
            for (let i = 0; i < count; i++) {
                const offset = (i - (count - 1) / 2) * 20;
                this.bulletManager.spawnPlayerBullet(this.x + offset, this.y - 20, 0, -1000, 1.0, 'laser', '#ff0', 1);
            }
        }
    }

    shootNue(level, isFocused) {
        // Type A: UFO (Trident)
        if (this.shotType === 'A') {
            const count = 3;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - 1) * 0.1;
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 800, Math.sin(angle) * 800, 1.0, 'straight', '#800080', 1);
            }
            if (level >= 3) {
                // Homing UFOs
                this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, 0, -600, 1.0, 'snake', '#f0f', 1);
                this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 0, -600, 1.0, 'snake', '#f0f', 1);
            }
        }
        // Type B: Chimera (Random)
        else {
            const types = ['straight', 'snake', 'missile'];
            const colors = ['#f00', '#0f0', '#00f'];
            const count = level + 2;
            for (let i = 0; i < count; i++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 700, Math.sin(angle) * 700, 1.0, type, color, 1);
            }
        }
    }

    shootParsee(level, isFocused) {
        // Type A: Jealousy (Homing Green)
        if (this.shotType === 'A') {
            const count = level + 2;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.5;
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 500, Math.sin(angle) * 500, 1.0, 'snake', '#0f0', 1);
            }
        }
        // Type B: Envy (Bridge Lasers)
        else {
            const count = level + 1;
            for (let i = 0; i < count; i++) {
                const x = this.x + (i - (count - 1) / 2) * 40;
                this.bulletManager.spawnPlayerBullet(x, this.y - 20, 0, -900, 1.0, 'laser', '#0f0', 1);
            }
        }
    }

    shootYuyuko(level, isFocused) {
        // Type A: Death (Spirits)
        if (this.shotType === 'A') {
            const count = level + 2;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 400, Math.sin(angle) * 400, 1.0, 'snake', '#f0f', 1);
            }
        }
        // Type B: Butterfly (Fan Spread)
        else {
            const count = level * 2 + 1;
            const spread = isFocused ? 0.3 : 1.2;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * (spread / count);
                this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * 600, Math.sin(angle) * 600, 1.0, 'missile', '#f0f', 1);
            }
        }
    }
    shootCirno(level, isFocused) {
        // Type A: Ice Sign (Spread)
        const speed = 1000;
        const count = level + 2;
        const spread = isFocused ? 0.2 : 0.6;

        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (i - (count - 1) / 2) * (spread / count);
            this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, Math.cos(angle) * speed, Math.sin(angle) * speed, 1.0, 'ice', '#aaf', 1);
        }
    }

    shootPatchouli(level, isFocused) {
        // Type A: Fire/Water (Mixed)
        const speed = 900;
        this.bulletManager.spawnPlayerBullet(this.x - 10, this.y - 10, 0, -speed, 1.5, 'fire', '#f44', 1.2);
        this.bulletManager.spawnPlayerBullet(this.x + 10, this.y - 10, 0, -speed, 1.5, 'fire', '#f44', 1.2);

        if (level >= 2) {
            // Water lasers
            this.bulletManager.spawnPlayerBullet(this.x - 25, this.y, 0, -speed * 1.2, 1.0, 'laser', '#00f', 0.8);
            this.bulletManager.spawnPlayerBullet(this.x + 25, this.y, 0, -speed * 1.2, 1.0, 'laser', '#00f', 0.8);
        }
    }

    shootRumia(level, isFocused) {
        // Type A: Darkness (Homing)
        const speed = 800;
        this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, 0, -speed, 2.0, 'dark', '#444', 1.5);

        if (level >= 2) {
            const count = level;
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0;
                this.bulletManager.spawnPlayerBullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 1.0, 'snake', '#222', 1);
            }
        }
    }

    shootSans(level, isFocused) {
        // Type A: Bones (Fast Straight)
        const speed = 1500;
        this.bulletManager.spawnPlayerBullet(this.x - 15, this.y - 10, 0, -speed, 2.0, 'bone', '#fff', 1);
        this.bulletManager.spawnPlayerBullet(this.x + 15, this.y - 10, 0, -speed, 2.0, 'bone', '#fff', 1);

        if (level >= 3) {
            // Gaster Blaster (Laser)
            this.bulletManager.spawnPlayerBullet(this.x, this.y - 30, 0, -speed, 3.0, 'laser', '#fff', 1.5);
        }
    }

    // shootSans was here, keeping it if it was before.
    // Actually replacement should start AFTER shootSans.

}
