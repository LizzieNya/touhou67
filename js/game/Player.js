import Entity from './Entity.js';

export default class Player extends Entity {
    constructor(game, x, y, bulletManager, character = 'Reimu', shotType = 'A') {
        super(game, x, y);
        this.bulletManager = bulletManager;
        this.character = character;
        this.shotType = shotType;
        this.type = 'player';

        // Stats based on character
        if (typeof this.character === 'object') {
            // Custom Character Config
            this.speed = this.character.speed || 260;
            this.focusSpeed = this.character.focusSpeed || 100;
            this.color = this.character.color || '#f00';
            this.shotType = this.character.shotType || this.shotType;
            // Map sprite string if needed, or use 'reimu' default
            this.spriteName = this.character.sprite || 'reimu';
        } else if (this.character === 'Marisa') {
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

        // Mouse Movement Override
        // Allow mouse movement if not moving via keyboard
        // "Mouse Move" is now default enabled unless config says false
        if (dx === 0 && dy === 0 && this.game.config.mouseMovement === true) {
            const mx = this.game.input.mouseX; // Use getter
            const my = this.game.input.mouseY;
            
            // Vector to mouse
            const vx = mx - this.x;
            const vy = my - this.y;
            const dist = Math.sqrt(vx*vx + vy*vy);

            if (dist > 5) { // Deadzone
                dx = vx / dist;
                dy = vy / dist;
            }
        }

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

        // Spell Card / Bomb Logic
        if (this.bombTimer > 0) {
            this.updateSpellCard(dt);
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
        const spellName = this.getSpellCardName();
        console.log(`BOMB USED! ${spellName}`);
        if (this.game.sceneManager.currentScene.uiManager && this.game.sceneManager.currentScene.uiManager.showSpellCard) {
            this.game.sceneManager.currentScene.uiManager.showSpellCard(spellName, this.character);
        }

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

    getSpellCardName() {
        if (this.character === 'Reimu') return this.shotType === 'A' ? 'Spirit Sign "Fantasy Seal"' : 'Dream Sign "Evil Sealing Circle"';
        if (this.character === 'Marisa') return this.shotType === 'A' ? 'Love Sign "Master Spark"' : 'Magic Sign "Stardust Reverie"';
        if (this.character === 'Sakuya') return this.shotType === 'A' ? 'Illusion "Killing Doll"' : 'Time Sign "Sakuya\'s World"';
        if (this.character === 'Youmu') return this.shotType === 'A' ? 'Human God Sword "Slash of Future"' : 'Obsession Sword "Blood of Asura"';
        if (this.character === 'Sanae') return this.shotType === 'A' ? 'Miracle "Daytime Stars"' : 'Esoterica "Gray Thaumaturgy"';
        if (this.character === 'Remilia') return this.shotType === 'A' ? 'Red Magic "Scarlet Devil"' : 'Divine Spear "Spear the Gungnir"';
        if (this.character === 'Flandre') return this.shotType === 'A' ? 'Taboo "Four of a Kind"' : 'Taboo "Laevateinn"';
        if (this.character === 'Okuu') return this.shotType === 'A' ? 'Nuclear Sign "Mega Flare"' : 'Hell Sign "Subterranean Sun"';
        if (this.character === 'Nue') return this.shotType === 'A' ? 'Unidentified "Red UFO"' : 'Nue Sign "Chimera"';
        if (this.character === 'Parsee') return this.shotType === 'A' ? 'Jealousy "Green-Eyed Monster"' : 'Envy "Bridge of Jealousy"';
        if (this.character === 'Yuyuko') return this.shotType === 'A' ? 'Death Sign "Ghastly Dream"' : 'Butterfly "Butterfly\'s Flit"';
        if (this.character === 'Cirno') return this.shotType === 'A' ? 'Ice Sign "Icicle Fall"' : 'Freeze Sign "Perfect Freeze"';
        if (this.character === 'Patchouli') return this.shotType === 'A' ? 'Fire Metal "St. Elmo\'s Pillar"' : 'Water Wood "Water Elf"';
        if (this.character === 'Rumia') return this.shotType === 'A' ? 'Moon Sign "Moonlight Ray"' : 'Night Sign "Night Bird"';
        if (this.character === 'Sans') return this.shotType === 'A' ? 'Bone Sign "Blue Attack"' : 'Hell Sign "Bad Time"';
        return 'Unknown Spell';
    }

    shoot() {
        if (this.bulletManager) {
            this.game.soundManager.playShoot();

            // Determine Shot Level (EoSD authentic)
            let level = 1;
            if (this.power >= 8) level = 2;
            if (this.power >= 16) level = 3;
            if (this.power >= 32) level = 4;
            if (this.power >= 64) level = 5;

            // Cheat: Max Power
            if (this.game.config.maxPower) level = 5;

            const isFocused = this.game.input.isDown('FOCUS');
            
            // Muzzle Flash
            this.spawnMuzzleFlash(isFocused);
            
            const method = `shoot${this.character}`;
            if (typeof this[method] === 'function') {
                this[method](level, isFocused);
            } else {
                this.shootReimu(level, isFocused); // Default
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
        if (this.shotType === 'A') {
            // Type A: Homing Amulet
            this.bulletManager.spawn(this.x - 8, this.y - 10, 0, -1200, 2, 'straight');
            this.bulletManager.spawn(this.x + 8, this.y - 10, 0, -1200, 2, 'straight');

            const xSpread = isFocused ? 0.3 : 1.0;
            const xVelSpread = isFocused ? 0.2 : 1.0;

            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 16 * xSpread, this.y, -100 * xVelSpread, -1000, 1, 'homing', '#f00', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 16 * xSpread, this.y, 100 * xVelSpread, -1000, 1, 'homing', '#f00', 2);
            }
            if (level >= 3) {
                this.bulletManager.spawnPlayerBullet(this.x - 24 * xSpread, this.y, -200 * xVelSpread, -900, 1, 'homing', '#f00', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 24 * xSpread, this.y, 200 * xVelSpread, -900, 1, 'homing', '#f00', 2);
            }
            if (level >= 4) {
                this.bulletManager.spawnPlayerBullet(this.x - 32 * xSpread, this.y, -300 * xVelSpread, -800, 1, 'homing', '#f00', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 32 * xSpread, this.y, 300 * xVelSpread, -800, 1, 'homing', '#f00', 2);
            }
        } else {
            // Type B: Persuasion Needle
            this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1400, 3, 'straight');
            this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1400, 3, 'straight');
            
            // Needles fire straight and fast
            const speed = 1500;
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 10, this.y, 0, -speed, 1, 'needle', '#fdd', 3);
                this.bulletManager.spawnPlayerBullet(this.x + 10, this.y, 0, -speed, 1, 'needle', '#fdd', 3);
            }
            if (level >= 3) {
                this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, 0, -speed, 1, 'needle', '#fdd', 3);
                this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 0, -speed, 1, 'needle', '#fdd', 3);
            }
            if (level >= 4) {
                 this.bulletManager.spawnPlayerBullet(this.x, this.y - 10, 0, -speed * 1.1, 1, 'talisman', '#fff', 3);
            }
        }
    }

    shootMarisa(level, isFocused) {
        if (this.shotType === 'A') {
            // Type A: Magic Missile
            this.bulletManager.spawn(this.x - 10, this.y - 10, 0, -1400, 3, 'missile');
            this.bulletManager.spawn(this.x + 10, this.y - 10, 0, -1400, 3, 'missile');

            const spread = isFocused ? 0.2 : 1.0;
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 20 * spread, this.y, -50 * spread, -1200, 1, 'missile', '#ff0', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 20 * spread, this.y, 50 * spread, -1200, 1, 'missile', '#ff0', 2);
            }
            if (level >= 3) {
                this.bulletManager.spawnPlayerBullet(this.x - 40 * spread, this.y, -100 * spread, -1200, 1, 'missile', '#ff0', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 40 * spread, this.y, 100 * spread, -1200, 1, 'missile', '#ff0', 2);
            }
        } else {
            // Type B: Illusion Laser
            this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1400, 3, 'straight');
            this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1400, 3, 'straight');

            const xOff = isFocused ? 10 : 25;
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - xOff, this.y, 0, -1500, 1, 'laser', '#0ff', 4);
                this.bulletManager.spawnPlayerBullet(this.x + xOff, this.y, 0, -1500, 1, 'laser', '#0ff', 4);
            }
            if (level >= 4) {
                 this.bulletManager.spawnPlayerBullet(this.x - xOff * 2, this.y, 0, -1500, 1, 'laser', '#0ff', 4);
                 this.bulletManager.spawnPlayerBullet(this.x + xOff * 2, this.y, 0, -1500, 1, 'laser', '#0ff', 4);
            }
        }
    }

    shootSakuya(level, isFocused) {
        this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1300, 2, 'straight');
        this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1300, 2, 'straight');
        const speed = 1100;

        if (this.shotType === 'A') {
            // Type A: Jack the Ludo
            const angleBase = isFocused ? 0.02 : 0.12;
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 10, this.y, Math.sin(-angleBase) * speed, -Math.cos(angleBase) * speed, 1, 'needle', '#ddd', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 10, this.y, Math.sin(angleBase) * speed, -Math.cos(angleBase) * speed, 1, 'needle', '#ddd', 2);
            }
            if (level >= 3) {
                this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, Math.sin(-angleBase * 2) * speed, -Math.cos(angleBase * 2) * speed, 1, 'needle', '#ddd', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, Math.sin(angleBase * 2) * speed, -Math.cos(angleBase * 2) * speed, 1, 'needle', '#ddd', 2);
            }
             if (level >= 4) {
                this.bulletManager.spawnPlayerBullet(this.x - 30, this.y, Math.sin(-angleBase * 3) * speed, -Math.cos(angleBase * 3) * speed, 1, 'needle', '#ddd', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 30, this.y, Math.sin(angleBase * 3) * speed, -Math.cos(angleBase * 3) * speed, 1, 'needle', '#ddd', 2);
            }
        } else {
            // Type B: Misdirection
            const spreadX = isFocused ? 50 : 200;
            const speedY = isFocused ? -1200 : -1000;
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 15, this.y, -spreadX, speedY, 1, 'needle_bounce', '#aaf', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 15, this.y, spreadX, speedY, 1, 'needle_bounce', '#aaf', 2);
            }
            if (level >= 3) {
                 this.bulletManager.spawnPlayerBullet(this.x - 25, this.y, -spreadX * 1.5, speedY * 0.9, 1, 'needle_bounce', '#aaf', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 25, this.y, spreadX * 1.5, speedY * 0.9, 1, 'needle_bounce', '#aaf', 2);
            }
        }
    }

    shootYoumu(level, isFocused) {
        this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1300, 2, 'straight');
        this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1300, 2, 'straight');

        if (this.shotType === 'A') {
             // Type A: Sword Beams
             const spread = isFocused ? 0.05 : 0.2;
             if (level >= 2) {
                 this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -200 * spread, -1200, 1, 'sword', '#fff', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 200 * spread, -1200, 1, 'sword', '#fff', 2);
             }
             if (level >= 3) {
                  this.bulletManager.spawnPlayerBullet(this.x, this.y - 20, 0, -1300, 1, 'sword', '#fff', 3);
             }
        } else {
             // Type B: Phantom Half
             const phantomOffset = 40;
             if (level >= 2) {
                 this.bulletManager.spawnPlayerBullet(this.x - phantomOffset, this.y, -50, -1000, 1, 'spirit', '#fff', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + phantomOffset, this.y, 50, -1000, 1, 'spirit', '#fff', 2);
             }
             if (level >= 3) {
                 this.bulletManager.spawnPlayerBullet(this.x, this.y, -300, -800, 1, 'boomerang', '#eee', 3);
                 this.bulletManager.spawnPlayerBullet(this.x, this.y, 300, -800, 1, 'boomerang', '#eee', 3);
             }
        }
    }

    shootSanae(level, isFocused) {
        this.bulletManager.spawn(this.x - 8, this.y - 10, 0, -1200, 2, 'straight');
        this.bulletManager.spawn(this.x + 8, this.y - 10, 0, -1200, 2, 'straight');

        if (this.shotType === 'A') {
            // Type A: Wind
            const spread = isFocused ? 0.2 : 0.8;
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -100 * spread, -1000, 1, 'frog', '#8f8', 2);
                this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 100 * spread, -1000, 1, 'frog', '#8f8', 2);
            }
            if (level >= 4) {
                 this.bulletManager.spawnPlayerBullet(this.x - 40, this.y, -200 * spread, -900, 1, 'frog', '#8f8', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 40, this.y, 200 * spread, -900, 1, 'frog', '#8f8', 2);
            }
        } else {
            // Type B: Mystery (Snakes)
            if (level >= 2) {
                this.bulletManager.spawnPlayerBullet(this.x - 30, this.y, -200, -800, 1, 'snake', '#fff', 3);
                this.bulletManager.spawnPlayerBullet(this.x + 30, this.y, 200, -800, 1, 'snake', '#fff', 3);
            }
        }
    }

    shootRemilia(level, isFocused) {
        this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1300, 2, 'straight');
        this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1300, 2, 'straight');

        if (this.shotType === 'A') {
             // Type A: Servant Flier
             if (level >= 2) {
                 this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -150, -900, 1, 'bat', '#f00', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 150, -900, 1, 'bat', '#f00', 2);
             }
             if (level >= 4) {
                 this.bulletManager.spawnPlayerBullet(this.x - 40, this.y, -300, -800, 1, 'bat', '#800', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 40, this.y, 300, -800, 1, 'bat', '#800', 2);
             }
        } else {
             // Type B: Demon Lord Arrow
             const spread = isFocused ? 0 : 20;
             if (level >= 2) {
                 this.bulletManager.spawnPlayerBullet(this.x - 15, this.y, -spread, -1400, 1, 'spear', '#f00', 3);
                 this.bulletManager.spawnPlayerBullet(this.x + 15, this.y, spread, -1400, 1, 'spear', '#f00', 3);
             }
        }
    }

    shootFlandre(level, isFocused) {
         this.bulletManager.spawn(this.x - 5, this.y - 10, 0, -1300, 3, 'straight');
         this.bulletManager.spawn(this.x + 5, this.y - 10, 0, -1300, 3, 'straight');

         if (this.shotType === 'A') {
              // Type A: Starbow
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x, this.y, -400, -1000, 1, 'crystal', '#f00', 2);
                   this.bulletManager.spawnPlayerBullet(this.x, this.y, 400, -1000, 1, 'crystal', '#00f', 2);
              }
              if (level >= 3) {
                   this.bulletManager.spawnPlayerBullet(this.x, this.y, -200, -1100, 1, 'crystal', '#0f0', 2);
                   this.bulletManager.spawnPlayerBullet(this.x, this.y, 200, -1100, 1, 'crystal', '#ff0', 2);
              }
         } else {
              // Type B: Laevateinn
              this.bulletManager.spawnPlayerBullet(this.x, this.y - 20, 0, -1000, 1, 'ufo', '#f44', 3); // Giant fire substitute
         }
    }

    shootOkuu(level, isFocused) {
         if (this.shotType === 'A') {
              // Mega Flare
              if (this.game.accumulator % 0.1 < 0.02) {
                  this.bulletManager.spawnPlayerBullet(this.x, this.y - 30, 0, -600, 1, 'ufo', '#F80', 5);
              }
         } else {
              // Hell's Artificial Sun
              this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, 0, -1200, 1, 'laser', '#fff', 3);
              this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 0, -1200, 1, 'laser', '#fff', 3);
              if (level >= 3) {
                   this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1200, 1, 'bubble', '#f00', 2);
              }
         }
    }

    shootNue(level, isFocused) {
        if (this.shotType === 'A') {
             // UFO Wobble
             this.bulletManager.spawnPlayerBullet(this.x - 10, this.y, 0, -1000, 1, 'ufo', '#f0f', 2);
             this.bulletManager.spawnPlayerBullet(this.x + 10, this.y, 0, -1000, 1, 'ufo', '#f0f', 2);
             if (level >= 3) {
                 this.bulletManager.spawnPlayerBullet(this.x - 30, this.y, -100, -900, 1, 'ufo', '#0f0', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 30, this.y, 100, -900, 1, 'ufo', '#00f', 2);
             }
        } else {
             // Chimera
             this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1200, 1, 'chimera', '#f00', 3);
             if (level >= 3) {
                 this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -200, -1000, 1, 'chimera', '#800', 2);
                 this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 200, -1000, 1, 'chimera', '#800', 2);
             }
        }
    }

    shootParsee(level, isFocused) {
         if (this.shotType === 'A') {
              // Green-Eyed Monster
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1100, 1, 'bubble', '#0f0', 2); 
              if (level >= 2) {
                  this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -200, -1000, 1, 'bubble', '#0f0', 2);
                  this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 200, -1000, 1, 'bubble', '#0f0', 2);
              }
         } else {
              // Jealousy
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1300, 1, 'needle', '#0f0', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 30, this.y, 100, -1200, 1, 'needle', '#0f0', 2);
                   this.bulletManager.spawnPlayerBullet(this.x + 30, this.y, -100, -1200, 1, 'needle', '#0f0', 2);
              }
         }
    }

    shootYuyuko(level, isFocused) {
         if (this.shotType === 'A') {
              // Resurrection Butterfly
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1000, 1, 'butterfly', '#f0f', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -150, -900, 1, 'butterfly', '#aaf', 2);
                   this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 150, -900, 1, 'butterfly', '#aaf', 2);
              }
         } else {
              // Deadly Dance
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1000, 1, 'spirit', '#fff', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 40, this.y, -50, -900, 1, 'spirit', '#fff', 2);
                   this.bulletManager.spawnPlayerBullet(this.x + 40, this.y, 50, -900, 1, 'spirit', '#fff', 2);
              }
         }
    }

    shootCirno(level, isFocused) {
         if (this.shotType === 'A') {
              // Ice Shard
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1200, 1, 'ice', '#0ff', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 15, this.y, -100, -1100, 1, 'ice', '#0ff', 1);
                   this.bulletManager.spawnPlayerBullet(this.x + 15, this.y, 100, -1100, 1, 'ice', '#0ff', 1);
              }
         } else {
              // Perfect Freeze
              const offset = Math.random() * 20;
              this.bulletManager.spawnPlayerBullet(this.x - 10 + offset, this.y, (Math.random()-0.5)*100, -1000, 1, 'freeze', '#0ff', 2);
         }
    }

    shootPatchouli(level, isFocused) {
         if (this.shotType === 'A') {
              // Fire & Metal
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1200, 1, 'missile', '#f44', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, 0, -1400, 1, 'needle', '#aaa', 2);
                   this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 0, -1400, 1, 'needle', '#aaa', 2);
              }
         } else {
              // Water & Wood
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1000, 1, 'bubble', '#00f', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -50, -1100, 1, 'laser', '#0f0', 2);
                   this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 50, -1100, 1, 'laser', '#0f0', 2);
              }
         }
    }

    shootRumia(level, isFocused) {
         if (this.shotType === 'A') {
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1200, 1, 'bubble', '#222', 3);
         } else {
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1100, 1, 'bat', '#000', 2);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 20, this.y, -100, -1100, 1, 'bat', '#000', 2);
                   this.bulletManager.spawnPlayerBullet(this.x + 20, this.y, 100, -1100, 1, 'bat', '#000', 2);
              }
         }
    }

    shootSans(level, isFocused) {
         if (this.shotType === 'A') {
              this.bulletManager.spawnPlayerBullet(this.x, this.y, 0, -1200, 1, 'bone', '#fff', 3);
              if (level >= 2) {
                   this.bulletManager.spawnPlayerBullet(this.x - 30, this.y, 0, -1200, 1, 'bone', '#fff', 3);
                   this.bulletManager.spawnPlayerBullet(this.x + 30, this.y, 0, -1200, 1, 'bone', '#fff', 3);
              }
         } else {
              this.bulletManager.spawnPlayerBullet(this.x, this.y - 20, 0, -1500, 1, 'laser', '#fff', 5);
         }
    }

    updateSpellCard(dt) {
        const scene = this.game.sceneManager.currentScene;
        if (!scene || !scene.enemies) return;

        // Damage Helper
        const dealDamage = (damage) => {
            scene.enemies.forEach(e => {
                if (e.active) e.takeDamage(damage);
            });
        };

        // Screen Clear Helper
        // (Bullet clear is handled in useBomb once, but we can do continuous clear if needed)
        
        if (this.character === 'Reimu') {
            if (this.shotType === 'A') {
                // Fantasy Seal (Orbs)
                const t = 2.0 - this.bombTimer;
                const radius = t * 300;
                scene.enemies.forEach(e => {
                     if (e.active && Math.hypot(e.x - this.x, e.y - this.y) < radius) e.takeDamage(15);
                });
            } else {
                // Evil Sealing Circle (Borders)
                dealDamage(10); // Screen wide pressure
            }
        } else if (this.character === 'Marisa') {
             if (this.shotType === 'A') {
                 // Master Spark
                 const width = 120;
                 scene.enemies.forEach(e => {
                    if (e.active && Math.abs(e.x - this.x) < width/2 && e.y < this.y) e.takeDamage(20);
                 });
                 scene.cameraShake = 5;
             } else {
                 // Final Spark / Comet (Spread)
                 scene.enemies.forEach(e => {
                     if (e.active && e.y < this.y) e.takeDamage(15);
                 });
             }
        } else if (this.character === 'Sakuya') {
             // Killing Doll (Time Stop - high damage inst)
             // Already handled visual, just deal damage
             dealDamage(8);
        } else if (this.character === 'Remilia') {
             if (this.shotType === 'A') {
                 // Red Magic
                 scene.enemies.forEach(e => {
                     if (e.active) e.takeDamage(12);
                 });
             } else {
                 // Scarlet Gensokyo (Spear Rain)
                 dealDamage(15);
             }
        } else if (this.character === 'Flandre') {
             // Taboo "Four of a Kind"
             dealDamage(25);
             scene.cameraShake = 10;
        } else if (this.character === 'Okuu') {
             // Subterranean Sun
             scene.cameraShake = 8;
             scene.enemies.forEach(e => {
                 if(e.active) {
                     const dist = Math.hypot(e.x - this.x, e.y - this.y);
                     if (dist < 400) e.takeDamage(30); // Center is deadly
                     else e.takeDamage(10);
                 }
             });
        } else if (this.character === 'Nue') {
             // Unidentified Darkness
             dealDamage(10);
        } else if (this.character === 'Parsee') {
             // Green-Eyed Monster
             dealDamage(8);
        } else if (this.character === 'Yuyuko') {
             // Saigyouji Parinirvana
             dealDamage(15);
        } else if (this.character === 'Cirno') {
             // Perfect Freeze (Screen Freeze + shatter)
             if (this.bombTimer < 0.5) dealDamage(50); // Shatter damage at end
             else dealDamage(1); // Freeze damage
        } else if (this.character === 'Patchouli') {
             // Philosopher's Stone
             dealDamage(12);
        } else if (this.character === 'Rumia') {
             // Night Bird
             dealDamage(10);
        } else if (this.character === 'Sans') {
             // Gaster Blaster Swarm
             dealDamage(20);
        } else {
             // Default
             dealDamage(10);
        }
    }

    render(renderer, alpha = 1.0) {
        if (this.state === 'dead') return;
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) return; // Flicker

        // Draw character sprite
        // Ensure character name matches asset keys (lowercase)
        let spriteKey;
        if (typeof this.character === 'object') {
            spriteKey = (this.spriteName || 'reimu').toLowerCase();
        } else {
            spriteKey = this.character.toLowerCase();
        }

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
            this.renderSpellCard(renderer);
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

    renderSpellCard(renderer) {
        const ctx = renderer.ctx;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.bombTimer);

        if (this.character === 'Reimu') {
            const t = 2.0 - this.bombTimer;
            if (this.shotType === 'A') {
                // Fantasy Seal
                const currentRadius = t * 150;
                ctx.fillStyle = `rgba(255, 0, 0, 0.2)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
                ctx.fill();
                // Orbs
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + t * 5;
                    const ox = this.x + Math.cos(angle) * currentRadius;
                    const oy = this.y + Math.sin(angle) * currentRadius;
                    ctx.fillStyle = '#fff';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#f00';
                    ctx.beginPath();
                    ctx.arc(ox, oy, 15, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Evil Sealing Circle
                const s = t * 150;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 5;
                ctx.shadowColor = '#f00';
                ctx.shadowBlur = 10;
                ctx.strokeRect(this.x - s, this.y - s, s * 2, s * 2);
            }
        } else if (this.character === 'Marisa') {
             if (this.shotType === 'A') {
                 // Master Spark
                 const width = 100 + Math.sin(this.bombTimer * 10) * 20;
                 ctx.fillStyle = `rgba(255, 255, 0, 0.5)`;
                 ctx.fillRect(this.x - width / 2, 0, width, this.y);
                 ctx.fillStyle = '#fff';
                 ctx.fillRect(this.x - width / 4, 0, width / 2, this.y);
             } else {
                 // Final Spark / Comet
                 const count = 10;
                 ctx.shadowBlur = 10;
                 ctx.shadowColor = '#ff0';
                 for(let i=0; i<count; i++) {
                     const size = Math.random() * 50;
                     ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
                     ctx.fillRect(this.x + (Math.random()-0.5)*200, this.y - Math.random()*500, size, size*3);
                 }
             }
        } else if (this.character === 'Sakuya') {
             // Time Stop
             ctx.fillStyle = `rgba(0, 0, 50, 0.5)`;
             ctx.fillRect(0, 0, this.game.width, this.game.height);
             if (this.shotType === 'B') {
                 // Giant Knife
                 ctx.shadowBlur = 20;
                 ctx.shadowColor = '#0ff';
                 ctx.fillStyle = '#fff';
                 ctx.beginPath();
                 ctx.moveTo(this.game.width/2, this.game.height);
                 ctx.lineTo(this.game.width/2 + 50, 0);
                 ctx.lineTo(this.game.width/2 - 50, 0);
                 ctx.fill();
             }
        } else if (this.character === 'Remilia') {
             if (this.shotType === 'A') {
                 ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
                 ctx.fillRect(0, 0, this.game.width, this.game.height);
                 ctx.fillStyle = '#f00';
                 ctx.fillRect(this.x - 100, this.y - 20, 200, 40);
                 ctx.fillRect(this.x - 20, this.y - 100, 40, 200);
             } else {
                 // Spears
                 ctx.fillStyle = '#f00';
                 for(let i=0; i<20; i++) {
                     ctx.fillRect(Math.random() * this.game.width, 0, 5, this.game.height);
                 }
             }
        } else if (this.character === 'Okuu') {
             // Sun
             const s = 100 + Math.random() * 20;
             ctx.fillStyle = '#f80';
             ctx.shadowBlur = 50;
             ctx.shadowColor = '#f00';
             ctx.beginPath();
             ctx.arc(this.x, this.y - 100, s, 0, Math.PI * 2);
             ctx.fill();
        } else if (this.character === 'Cirno') {
             // Freeze
             ctx.fillStyle = `rgba(0, 255, 255, 0.3)`;
             ctx.fillRect(0, 0, this.game.width, this.game.height);
             // Snowflakes
             ctx.fillStyle = '#fff';
             for(let i=0; i<20; i++) {
                 ctx.beginPath();
                 ctx.arc(Math.random() * this.game.width, Math.random() * this.game.height, 5, 0, Math.PI*2);
                 ctx.fill();
             }
        } else if (this.character === 'Flandre') {
             ctx.fillStyle = `rgba(255, 0, 0, 0.5)`;
             ctx.fillRect(0, 0, this.game.width, this.game.height);
             if (this.shotType === 'B') {
                 // Fire
                 ctx.fillStyle = '#fa0';
                 ctx.shadowBlur = 20;
                 ctx.beginPath();
                 ctx.arc(this.x, this.y, 200, 0, Math.PI*2);
                 ctx.fill();
             }
        } else if (this.character === 'Nue') {
            ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
            ctx.fillRect(0, 0, this.game.width, this.game.height);
             // Glitch rectangles
             ctx.fillStyle = '#f0f';
             for(let i=0; i<10; i++) {
                 ctx.fillRect(Math.random() * this.game.width, Math.random() * this.game.height, 50, 5);
             }
        } else if (this.character === 'Yuyuko') {
             // Butterflies
             ctx.fillStyle = `rgba(255, 200, 255, 0.3)`;
             ctx.fillRect(0,0,this.game.width,this.game.height);
        } else if (this.character === 'Parsee') {
             ctx.fillStyle = `rgba(0, 255, 0, 0.2)`;
             ctx.fillRect(0,0,this.game.width,this.game.height);
        } else if (this.character === 'Rumia') {
             // Darkness
             ctx.fillStyle = `rgba(0, 0, 0, 0.9)`;
             ctx.beginPath();
             ctx.arc(this.x, this.y, 100 + Math.sin(this.bombTimer)*50, 0, Math.PI*2);
             ctx.rect(this.game.width, 0, -this.game.width, this.game.height);
             ctx.fill();
        } else if (this.character === 'Sans') {
             // Gaster Blasters
             ctx.fillStyle = '#fff';
             ctx.fillRect(this.x - 50, 0, 100, this.y);
             ctx.shadowBlur = 20;
             ctx.shadowColor = '#fff';
        }

        ctx.restore();
    }
}

