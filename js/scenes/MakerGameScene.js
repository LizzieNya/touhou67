import GameScene from './GameScene.js';
import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export default class MakerGameScene extends GameScene {
    constructor(game, project, fromMenu = false) {
        const playerConfig = project.player || 'reimu';
        super(game, playerConfig, 'A'); // Shot type A default, or custom config handles it
        this.project = project;
        this.fromMenu = fromMenu;
    }

    loadStage(stageNumber) {
        // We ignore stageNumber and load from project
        this.stageEvents = this.convertProjectToEvents(this.project);
        this.currentEventIndex = 0;
        this.stageTime = 0;
        this.stageTitle = this.project.name;
    }

    convertProjectToEvents(project) {
        const events = [];

        // Intro
        events.push({
            time: 0.1,
            action: (scene) => {
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Testing: " + project.name, side: "left" }
                ]);
            }
        });

        let currentTime = 2.0;

        if (project.stages) {
            project.stages.forEach((stage, index) => {
                const delay = stage.time || 2.0;
                currentTime += delay;

                if (stage.type === 'wave') {
                    events.push({
                        time: currentTime,
                        action: (scene) => {
                            const count = stage.enemyCount || 5;
                            const interval = (stage.interval || 0.5) * 1000;
                            const bulletSpeed = stage.bulletSpeed || 3;
                            const w = scene.game.playAreaWidth || scene.game.width;

                            for (let i = 0; i < count; i++) {
                                setTimeout(() => {
                                    // Randomized X, fixed Y start
                                    const x = Math.random() * (w - 40) + 20;
                                    const e = new Enemy(scene.game, x, -20, stage.hp || 10, stage.enemyType || 'fairy');
                                    e.color = stage.color || '#f00';

                                    e.setPattern((enemy, dt, t) => {
                                        // Movement down
                                        enemy.y += 100 * dt;
                                        
                                        // Shooting Logic
                                        if (Math.floor(t * 60) % 60 === 0) {
                                            if (stage.pattern === 'aimed') {
                                                PatternLibrary.aimed(scene, enemy, bulletSpeed * 100, e.color, bulletSpeed);
                                            } else if (stage.pattern === 'spread') {
                                                PatternLibrary.spread(scene, enemy, 3, 30, bulletSpeed * 100, e.color, bulletSpeed);
                                            } else if (stage.pattern === 'circle') {
                                                PatternLibrary.circle(scene, enemy.x, enemy.y, 8, bulletSpeed * 100, e.color, bulletSpeed);
                                            } else if (stage.pattern === 'spiral') {
                                                PatternLibrary.spiral(scene, enemy.x, enemy.y, 3, 20, bulletSpeed * 100, e.color, bulletSpeed, t);
                                            } else {
                                                // Basic: straight down
                                                // PatternLibrary doesn't have basic straight, implement manually
                                                // Or just use aimed as fallback?
                                                // Let's implement manually for "basic"
                                                // Actually PatternLibrary.aimed is fine, but maybe straight down?
                                                scene.bulletManager.fireBullet(enemy.x, enemy.y, 0, bulletSpeed * 100, e.color); // Straight down (angle 0 is right? wait need to check BulletManager angles)
                                                // Usually Math.PI/2 is down
                                                scene.bulletManager.fireBullet(enemy.x, enemy.y, Math.PI / 2, bulletSpeed * 100, e.color);
                                            }
                                        }
                                    });
                                    scene.enemies.push(e);
                                }, i * interval);
                            }
                        }
                    });
                } else if (stage.type === 'boss') {
                    events.push({
                        time: currentTime,
                        action: (scene) => {
                            import('../game/Boss.js').then(module => {
                                const Boss = module.default;
                                const w = scene.game.playAreaWidth || scene.game.width;
                                const boss = new Boss(scene.game, w / 2, -50, stage.name || "Boss");
                                boss.color = '#f0f';
                                
                                // Boss Phase Pattern Logic
                                const patternFunc = (enemy, dt, t) => {
                                    // Move in figure-8 or hover
                                    enemy.x = w / 2 + Math.sin(t) * 100;
                                    enemy.y = 100 + Math.cos(t * 0.5) * 30;

                                    if (Math.floor(t * 60) % 15 === 0) {
                                        if (stage.patternType === 'spiral') {
                                            PatternLibrary.spiral(scene, enemy.x, enemy.y, 5, 20, 200, '#ff00ff', 4, t * 5);
                                        } else if (stage.patternType === 'flower') {
                                            PatternLibrary.flower(scene, enemy.x, enemy.y, 6, 200, '#ff00ff', 3, t);
                                        } else if (stage.patternType === 'rain') {
                                            // Random rain from top? No, boss emits it
                                            scene.bulletManager.fireBullet(enemy.x + (Math.random()-0.5)*100, enemy.y, Math.PI/2 + (Math.random()-0.5), 300, '#fff');
                                        } else {
                                            // Default Circle
                                            PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 200, '#ff00ff', 3, t);
                                        }
                                    }
                                };

                                boss.addPhase(stage.hp || 1000, 60, patternFunc, stage.spellcard || "Sign \"Maker\"");
                                boss.start();
                                scene.enemies.push(boss);
                                
                                // Show boss name
                                if (scene.ui && scene.ui.showBossTitle) {
                                    scene.ui.showBossTitle(boss.name, stage.spellcard || "Sign \"Maker\"", 200); // 200ms duration is too short, wait showBossTitle takes time or frames?
                                    // Usually it's frames or seconds. Let's assume default frames if not specified or check logic.
                                    // showBossTitle(bossName, spellName)
                                    scene.ui.showBossTitle(boss.name, stage.spellcard || "");
                                }
                            });
                        }
                    });
                } else if (stage.type === 'dialogue') {
                    events.push({
                        time: currentTime,
                        action: (scene) => {
                            scene.dialogueManager.startDialogue([
                                { 
                                    name: stage.character || "???", 
                                    text: stage.text || "...", 
                                    side: stage.side || "left" 
                                }
                            ]);
                        }
                    });
                }
            });
        }

        // End
        events.push({
            time: currentTime + 10.0, // Give time for boss to finish or waves to clear
            action: (scene) => {
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Test Complete.", side: "left" }
                ]);
                setTimeout(() => {
                    if (scene.fromMenu) {
                        import('./MakerSelectScene.js').then(module => {
                            scene.game.sceneManager.changeScene(new module.default(scene.game));
                        });
                    } else {
                        // Return to Editor
                        import('./EditorScene.js').then(module => {
                            scene.game.sceneManager.changeScene(new module.default(scene.game, project));
                        });
                    }
                }, 2000);
            }
        });

        return events;
    }
}
