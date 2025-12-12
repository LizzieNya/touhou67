import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage1Events = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage1');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 1: Spring where? (Touhou 7)", side: "left" }
            ]);
        }
    },
    // Wave 1: Snowballs (Kedama)
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 10, 'kedama');
                    e.color = '#fff'; // White
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x += Math.sin(t * 2) * 50 * dt; // Wavy falling snow
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // Midboss: Letty Whiterock
    {
        time: 10.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const letty = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Letty Whiterock");
                letty.color = '#ddf'; // Pale blue/white

                letty.addPhase(500, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 50;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 20 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 150, '#fff', 3, t);
                    }
                }, "Cold Sign 'Lingering Cold'");

                letty.start();
                scene.enemies.push(letty);
            });
        }
    },
    // Wave 2: Ice Spirits
    {
        time: 45.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 10, 15, 'spirit');
                    e.color = '#0ff'; // Cyan
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        if (Math.floor(t * 60) % 40 === 0) {
                            PatternLibrary.aimed(scene, enemy, 250, '#0ff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // Boss: Letty Whiterock
    {
        time: 60.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "It's freezing out here!", side: "left" },
                { name: "Letty", text: "Spring is taking a nap.", side: "right" }
            ]);
        }
    },
    {
        time: 62.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const letty = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Letty Whiterock");
                letty.color = '#ddf';

                // Phase 1: Winter Sign "Flower Wither Away"
                letty.addPhase(800, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 5 === 0) {
                        // White spread
                        const a = Math.sin(t) * Math.PI;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#fff', 3);
                    }
                }, "Winter Sign 'Flower Wither Away'");

                // Phase 2: White Sign "Undulation Ray"
                letty.addPhase(1000, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 100;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.aimedNWay(scene, enemy, 5, 0.5, 300, '#0ff', 3);
                    }
                }, "White Sign 'Undulation Ray'");

                letty.start();
                scene.enemies.push(letty);
            });
        }
    }
];
