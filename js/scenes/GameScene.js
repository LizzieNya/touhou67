console.log("GameScene module evaluating...");
import Player from '../game/Player.js';
import BulletManager from '../game/BulletManager.js';
import CollisionSystem from '../game/CollisionSystem.js';
import ScriptEngine from '../game/ScriptEngine.js';
import { Stage1Events } from '../stages/Stage1.js';
import { Stage2Events } from '../stages/Stage2.js';
import { Stage3Events } from '../stages/Stage3.js';
import { Stage4Events } from '../stages/Stage4.js';
import { Stage5Events } from '../stages/Stage5.js';
import { Stage6Events } from '../stages/Stage6.js';
import { StageExtraEvents } from '../stages/StageExtra.js';
import { BossRushEvents } from '../stages/BossRushStage.js';
import {
    BossRumiaEvents, BossParseeEvents, BossNueEvents, BossOkuuEvents, BossRemiliaEvents,
    BossCirnoEvents, BossMeilingEvents, BossPatchouliEvents, BossSakuyaEvents, BossFlandreEvents,
    BossSansEvents, BossPepeEvents, BossKoishiEvents, BossAyaEvents, BossJunkoEvents, BossYuyukoEvents,
    BossTewīEvents, BossReisenEvents, BossEirinEvents, BossKaguyaEvents, BossMokouEvents
} from '../stages/IndividualBossStages.js';

import PlayerBulletManager from '../game/PlayerBulletManager.js';
import ItemManager from '../game/ItemManager.js';
import HUD from '../ui/HUD.js';
import DialogueManager from '../ui/DialogueManager.js';
import PauseMenu from '../ui/PauseMenu.js';
import Background from '../game/Background.js';
import ParticleSystem from '../game/ParticleSystem.js';

export default class GameScene {
    constructor(game, stage = 1, character = 'Reimu', shotType = 'A', difficulty = 'Normal') {
        console.log("GameScene Constructor Start");
        console.log(`Stage: ${stage} (${typeof stage})`);
        console.log(`Character: ${character}, Type: ${shotType}, Difficulty: ${difficulty}`);
        if (game.currentGameManifest) {
            console.log(`Current Manifest: ${game.currentGameManifest.id} (${game.currentGameManifest.title})`);
        } else {
            console.warn("No Current Manifest found!");
        }

        this.game = game;
        this.game.soundManager.resetMusic(); // Reset music state on new game/stage
        this.stage = stage;
        this.character = character;
        this.shotType = shotType;
        this.difficulty = difficulty;
        this.paused = false; // Game logic pause state
        this.background = new Background(game);
        this.particleSystem = new ParticleSystem(game);
        this.playerBulletManager = new PlayerBulletManager(game);
        this.player = new Player(game, (game.playAreaWidth || game.width) / 2, game.height - 100, this.playerBulletManager, character, shotType);
        this.bulletManager = new BulletManager(game);
        this.itemManager = new ItemManager(game);
        this.enemies = [];
        this.collisionSystem = new CollisionSystem(game);
        this.hud = new HUD(game);
        this.dialogueManager = new DialogueManager(game);
        this.pauseMenu = new PauseMenu(game);

        this.scriptEngine = new ScriptEngine(this);
        this.loadStageScript(stage);

        // Apply Config Options
        this.player.lives = this.game.config.startingLives;
        this.player.bombs = this.game.config.startingBombs;

        if (this.game.config.startWithFullPower) {
            this.player.power = 128;
        }

        if (this.game.config.godMode) {
            this.player.isInvincible = true; // Need to handle this in Player.js
        }

        // Boss Select Mode overrides (unless config is higher?)
        if (typeof stage === 'string' && stage.startsWith('Boss')) {
            this.player.power = 128; // Max power for boss practice
            this.player.lives = Math.max(this.player.lives, 5); // Ensure at least 5
            this.player.bombs = Math.max(this.player.bombs, 5); // Ensure at least 5
            console.log('Boss Select Mode: Starting with max power!');
        }

        // Continue System
        this.isContinueScreen = false;
        this.continueTimer = 0;
        this.continueCount = 0;

        // Stage Transition Control
        this.stageStartTime = null;
        this.transitioningStage = false;

        // Visual Effects
        this.screenFlash = 0; // Alpha value of white overlay

        // Show HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'block';
    }

    loadStageScript(stage) {
        // Force legacy loading for Boss Rush / Individual Bosses
        if (typeof stage === 'string' && (stage.startsWith('Boss') || stage === 'Extra')) {
             this.loadStageScriptLegacy(stage);
             return;
        }

        if (this.game.currentGameManifest) {
            // Use Manifest System
            const eventsOrPromise = this.game.currentGameManifest.getStageEvents(stage);

            if (eventsOrPromise instanceof Promise) {
                eventsOrPromise.then(events => {
                    let finalEvents = events;
                    if (typeof events === 'function') {
                        finalEvents = events(this.character);
                    }
                    this.scriptEngine.loadScript(finalEvents);
                }).catch(err => {
                    console.error(`Failed to load stage ${stage}:`, err);
                });
            } else {
                // Synchronous
                let finalEvents = eventsOrPromise;
                if (typeof eventsOrPromise === 'function') {
                    finalEvents = eventsOrPromise(this.character);
                }
                this.scriptEngine.loadScript(finalEvents);
            }
        } else {
            // Fallback for legacy / direct loading (if needed)
            console.warn("No Game Manifest found. Falling back to legacy loading.");
            this.loadStageScriptLegacy(stage);
        }
    }

    loadStageScriptLegacy(stage) {
        let getEvents = null;
        switch (stage) {
            case 1: getEvents = Stage1Events; break;
            case 2: getEvents = Stage2Events; break;
            case 3: getEvents = Stage3Events; break;
            case 4: getEvents = Stage4Events; break;
            case 5: getEvents = Stage5Events; break;
            case 6: getEvents = Stage6Events; break;
            case 'Extra': getEvents = StageExtraEvents; break;
            case 'BossRush': getEvents = BossRushEvents; break;
            case 'BossRumia': getEvents = BossRumiaEvents; break;
            case 'BossCirno': getEvents = BossCirnoEvents; break;
            case 'BossMeiling': getEvents = BossMeilingEvents; break;
            case 'BossPatchouli': getEvents = BossPatchouliEvents; break;
            case 'BossSakuya': getEvents = BossSakuyaEvents; break;
            case 'BossRemilia': getEvents = BossRemiliaEvents; break;
            case 'BossFlandre': getEvents = BossFlandreEvents; break;
            case 'BossParsee': getEvents = BossParseeEvents; break;
            case 'BossNue': getEvents = BossNueEvents; break;
            case 'BossOkuu': getEvents = BossOkuuEvents; break;
            case 'BossSans': getEvents = BossSansEvents; break;
            case 'BossPepe': getEvents = BossPepeEvents; break;
            case 'BossKoishi': getEvents = BossKoishiEvents; break;
            case 'BossAya': getEvents = BossAyaEvents; break;
            case 'BossJunko': getEvents = BossJunkoEvents; break;
            case 'BossYuyuko': getEvents = BossYuyukoEvents; break;
            case 'BossTewi': getEvents = BossTewīEvents; break;
            case 'BossReisen': getEvents = BossReisenEvents; break;
            case 'BossEirin': getEvents = BossEirinEvents; break;
            case 'BossKaguya': getEvents = BossKaguyaEvents; break;
            case 'BossMokou': getEvents = BossMokouEvents; break;
            default: getEvents = Stage1Events;
        }

        // Check if it's a function (new style) or array (old style)
        let events = [];
        if (typeof getEvents === 'function') {
            events = getEvents(this.character);
        } else {
            events = getEvents;
        }

        this.scriptEngine.loadScript(events);
    }

    update(dt) {
        // Toggle Pause
        if (this.game.input.isDown('PAUSE')) {
            this.game.input.keys['Escape'] = false; // Debounce
            this.pauseMenu.toggle();
        }

        if (this.pauseMenu.active) {
            this.pauseMenu.update(dt);
            return;
        }

        if (this.isContinueScreen) {
            this.updateContinueScreen(dt);
            return;
        }

        // Always update dialogue
        this.dialogueManager.update(dt);

        if (this.paused) return;

        // Check for Sakuya's Time Stop Bomb
        let timeStopped = false;
        if (this.player.character === 'Sakuya' && this.player.bombTimer > 0) {
            timeStopped = true;
        }

        this.particleSystem.update(dt);

        if (!this.enemyTimeStop) {
            this.player.update(dt);
            this.playerBulletManager.update(dt);
        }

        // Fast Forward Logic
        if (this.enemies.length === 0 && !this.dialogueManager.active && !this.scriptEngine.isFinished && !timeStopped && !this.enemyTimeStop) {
            const nextEventTime = this.scriptEngine.getNextEventTime();
            if (nextEventTime > this.scriptEngine.time + 2.0) {
                this.scriptEngine.time += dt * 5;
            }
        }

        if (!timeStopped) {
            if (!this.enemyTimeStop) {
                this.background.update(dt);
                this.bulletManager.update(dt);
                this.itemManager.update(dt);
            }
            this.scriptEngine.update(dt);

            // Update Enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                enemy.update(dt);
                if (!enemy.active) {
                    this.enemies.splice(i, 1);
                }
            }
        } else {
            // Time is stopped
            // Background, Items, Enemies, Enemy Bullets do NOT update
            // Player and Particles DO update (lines 191, 192)
        }

        this.hud.update(dt);

        // Check Collisions
        this.collisionSystem.checkCollisions(this);

        // Check Stage Clear
        if (this.scriptEngine.isFinished && this.enemies.length === 0 && !this.dialogueManager.active) {
            // Prevent rapid stage transitions - require at least 2 seconds in stage
            if (!this.stageStartTime) {
                this.stageStartTime = Date.now();
            }
            const timeInStage = (Date.now() - this.stageStartTime) / 1000;

            if (timeInStage >= 2.0 && !this.transitioningStage) {
                this.nextStage();
            }
        }

        if (this.screenFlash > 0) {
            this.screenFlash -= dt * 2.0;
            if (this.screenFlash < 0) this.screenFlash = 0;
        }
    }

    nextStage() {
        // Prevent multiple rapid calls
        if (this.transitioningStage) return;
        this.transitioningStage = true;

        // Simple delay or transition could be added here
        if (typeof this.stage === 'number') {
            if (this.stage < 6) {
                console.log(`Stage ${this.stage} Clear! Moving to Stage ${this.stage + 1}`);
                this.game.soundManager.resetMusic(); // Clear saved music states
                this.stage++;
                this.loadStageScript(this.stage);
                // Reset bullets?
                this.bulletManager.pool.forEach(b => b.active = false);
                this.playerBulletManager.pool.forEach(b => b.active = false);
                this.itemManager.pool.forEach(i => i.active = false);
                // Reset stage timer for next stage
                this.stageStartTime = null;
                this.transitioningStage = false;
                // Heal player? (Optional)
            } else {
                console.log("All Stages Clear! Ending.");
                import('./EndingScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game, this.character));
                });
            }
        } else if (this.stage === 'Extra') {
            // Extra Stage Clear
            console.log("Extra Stage Clear!");
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else if (typeof this.stage === 'string' && this.stage.startsWith('Boss')) {
            // Boss Select stages - return to boss select instead of title
            console.log("Boss Battle Clear!");
            import('./BossSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        } else {
            // Unknown stage type - return to title
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    loadStage(stageEvents) {
        this.scriptEngine.loadScript(stageEvents);
    }

    triggerBomb() {
        // Clear all enemy bullets
        for (const b of this.bulletManager.pool) {
            if (b.active) {
                b.active = false;
                // Convert to points?
            }
        }

        // Damage all enemies
        for (const enemy of this.enemies) {
            enemy.takeDamage(100); // Massive damage
        }
    }



    render(renderer, alpha = 1.0) {
        this.background.render(renderer); // Background usually doesn't need smooth interpolation or handles it internally
        this.particleSystem.render(renderer); // Particles are visual only, often ok to drift or use simple physics
        this.playerBulletManager.render(renderer); // Render bullets BEHIND player
        this.player.render(renderer, alpha);
        this.itemManager.render(renderer);

        for (const enemy of this.enemies) {
            enemy.render(renderer, alpha);
        }

        this.bulletManager.render(renderer, alpha);

        // Low Health Vignette (Visual Warning)
        if (this.player && this.player.lives === 0) {
            const ctx = renderer.ctx;
            ctx.save();
            // Pulse
            const pulse = (Math.sin(Date.now() / 200) + 1) * 0.15; // 0 to 0.3
            const grad = ctx.createRadialGradient(
                this.game.playAreaWidth / 2, this.game.height / 2, this.game.height * 0.3,
                this.game.playAreaWidth / 2, this.game.height / 2, this.game.height * 0.8
            );
            grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
            grad.addColorStop(1, `rgba(255, 0, 0, ${0.2 + pulse})`);
            
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'multiply'; // Darken edges red
            ctx.fillRect(0, 0, this.game.playAreaWidth, this.game.height);
            ctx.restore();
        }

        this.hud.render(renderer);
        this.dialogueManager.render(renderer);
        this.pauseMenu.render(renderer);

        if (this.screenFlash > 0) {
            const ctx = renderer.ctx;
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${this.screenFlash})`;
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            ctx.restore();
        }

        if (this.isContinueScreen) {
            this.renderContinueScreen(renderer);
        }

        // Debug FPS
        if (this.game.config.showFps) {
            renderer.drawText(`FPS: ${Math.round(this.game.fps || 0)}`, 600, 20, 12, '#0f0');
        }
    }

    showContinueScreen() {
        this.isContinueScreen = true;
        this.continueTimer = 10.0;
        this.player.state = 'dead';
        // Clear bullets to prevent instant death on respawn
        this.bulletManager.clear();
    }

    updateContinueScreen(dt) {
        this.continueTimer -= dt;
        if (this.continueTimer <= 0) {
            this.quitGame();
            return;
        }

        // Debounce input - wait 0.5 seconds before accepting input to prevent instant continue
        if (this.continueTimer < 9.5) {
            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                this.continueGame();
            } else if (this.game.input.isPressed('BOMB')) {
                this.quitGame();
            }
        }
    }

    continueGame() {
        this.isContinueScreen = false;
        this.continueCount++;
        this.player.lives = 3;
        this.player.bombs = 3;
        this.player.power = 0; // Reset power (will be filled by items)
        this.player.state = 'alive';
        this.player.invulnerableTimer = 3.0;
        this.player.x = this.game.width / 2;
        this.player.y = this.game.height - 50;

        // Spawn Full Power Items
        if (this.itemManager) {
            // Spawn 3 Full Power items falling from top
            this.itemManager.spawn(this.game.width / 2, 0, 'full_power');
            this.itemManager.spawn(this.game.width / 2 - 50, -50, 'full_power');
            this.itemManager.spawn(this.game.width / 2 + 50, -50, 'full_power');
        }

        // Score penalty: Halve score
        this.hud.score = Math.floor(this.hud.score / 2);

        console.log("Continued! Count: " + this.continueCount);
    }

    quitGame() {
        import('./TitleScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    renderContinueScreen(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.playAreaWidth || this.game.width;
        const h = this.game.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.font = '40px "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.fillText("CONTINUE?", cx, cy - 50);

        ctx.font = '60px "Times New Roman", serif';
        ctx.fillText(Math.ceil(this.continueTimer), cx, cy + 20);

        ctx.font = '20px "Times New Roman", serif';
        ctx.fillText("Z/Space: Yes   X: No", cx, cy + 80);

        ctx.font = '16px "Times New Roman", serif';
        ctx.fillStyle = '#f88';
        ctx.fillText("Penalty: Score Halved", cx, cy + 110);

        if (this.continueCount > 0) {
            ctx.fillStyle = '#aaa';
            ctx.fillText(`Continues used: ${this.continueCount}`, cx, cy + 140);
        }

        ctx.restore();
    }
}
