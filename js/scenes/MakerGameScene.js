import GameScene from './GameScene.js';
import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export default class MakerGameScene extends GameScene {
    constructor(game, project, fromMenu = false) {
        super(game, 'reimu', 'A'); // Default character for testing
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
                // Add delay if specified, or default spacing
                const delay = stage.time || 3.0;
                currentTime += delay;

                if (stage.type === 'wave') {
                    events.push({
                        time: currentTime,
                        action: (scene) => {
                            const count = stage.enemyCount || 5;
                            for (let i = 0; i < count; i++) {
                                setTimeout(() => {
                                    const x = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                                    const e = new Enemy(scene.game, x, -20, 15, 'fairy');
                                    e.color = '#f00';

                                    // Simple pattern mapping
                                    e.setPattern((enemy, dt, t) => {
                                        enemy.y += 100 * dt;
                                        if (stage.pattern === 'aimed') {
                                            if (Math.floor(t * 60) % 60 === 0) PatternLibrary.aimed(scene, enemy, 300, '#f00', 3);
                                        }
                                    });
                                    scene.enemies.push(e);
                                }, i * 300);
                            }
                        }
                    });
                } else if (stage.type === 'boss') {
                    events.push({
                        time: currentTime,
                        action: (scene) => {
                            import('../game/Boss.js').then(module => {
                                const Boss = module.default;
                                const boss = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, stage.name || "Boss");
                                boss.color = '#f0f';
                                boss.addPhase(stage.hp || 1000, 60, (enemy, dt, t) => {
                                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                                    enemy.y = 100;
                                    if (Math.floor(t * 60) % 20 === 0) {
                                        PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 200, '#f0f', 3, t);
                                    }
                                }, "Test Spell");
                                boss.start();
                                scene.enemies.push(boss);
                            });
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
