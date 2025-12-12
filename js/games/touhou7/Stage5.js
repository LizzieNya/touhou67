import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage5Events = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage5');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 5: The Netherworld", side: "left" }
            ]);
        }
    },
    // Wave 1: Ghost Spirits
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 25; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                    e.color = '#fff'; // Ghostly white
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        if (Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 3, 0.2, 200, '#0f0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 250);
            }
        }
    },
    // Midboss: Youmu Konpaku
    {
        time: 20.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const youmu = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Youmu Konpaku");
                youmu.color = '#ccc'; // Silver/Greenish

                youmu.addPhase(1000, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 150;
                    enemy.y = 150;

                    if (Math.floor(t * 60) % 40 === 0) {
                        // Slash (Line of bullets)
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        for (let k = 0; k < 10; k++) {
                            scene.bulletManager.spawn(enemy.x + Math.cos(angle) * k * 20, enemy.y + Math.sin(angle) * k * 20, Math.cos(angle) * 400, Math.sin(angle) * 400, '#fff', 4);
                        }
                    }
                }, "Hell Realm Sword '200 Yojana in 1 Slash'");

                youmu.start();
                scene.enemies.push(youmu);
            });
        }
    },
    // Boss: Youmu Konpaku
    {
        time: 70.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "Let me pass, gardener.", side: "left" },
                { name: "Youmu", text: "The things that cannot be cut by my Roukanken...", side: "right" },
                { name: "Youmu", text: "...are next to none!", side: "right" }
            ]);
        }
    },
    {
        time: 72.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const youmu = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Youmu Konpaku");
                youmu.color = '#ccc';

                // Phase 1: Human God Sword "Eternal Meek" (Fast flurry)
                youmu.addPhase(1200, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t * 2) * 100;
                    enemy.y = 100 + Math.sin(t * 3) * 50;
                    if (Math.floor(t * 60) % 5 === 0) {
                        PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 1, 0, Math.PI * 2, 300, 500, '#fff', 3);
                    }
                }, "Human God Sword 'Eternal Meek'");

                // Phase 2: Six Realms Sword "A Single Thought and Infinite Kalpas" (Slow time / dense)
                youmu.addPhase(1500, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 20 === 0) {
                        // Dense slow circle
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 100, '#0f0', 3, t);
                    }
                    if (Math.floor(t * 60) % 120 === 0) {
                        // Fast slash
                        PatternLibrary.aimed(scene, enemy, 600, '#fff', 5);
                    }
                }, "Six Realms Sword 'A Single Thought and Infinite Kalpas'");

                youmu.start();
                scene.enemies.push(youmu);
            });
        }
    }
];
