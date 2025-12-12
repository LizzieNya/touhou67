import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage2Events = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage2');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 2: The Village of Cats", side: "left" }
            ]);
        }
    },
    // Wave 1: Stray Cats (Fast Spirits)
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                    e.color = '#fa0'; // Orange
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 200 * dt; // Fast
                        if (Math.floor(t * 60) % 20 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#fa0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // Midboss: Chen
    {
        time: 15.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const chen = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Chen");
                chen.color = '#fa0'; // Orange

                chen.addPhase(600, 30, (enemy, dt, t) => {
                    // Bouncing movement
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t * 3) * 150;
                    enemy.y = 100 + Math.abs(Math.cos(t * 3)) * 50;

                    if (Math.floor(t * 60) % 15 === 0) {
                        PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 3, Math.PI / 2, Math.PI, 200, 400, '#f00', 3);
                    }
                }, "Hermit Sign 'Phoenix Spread Wings'");

                chen.start();
                scene.enemies.push(chen);
            });
        }
    },
    // Wave 2: Magic Cats (Kedama)
    {
        time: 50.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 100, 20, 'kedama');
                    e.color = '#f00'; // Red
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 200, '#f00', 3, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // Boss: Chen
    {
        time: 65.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "Get out of the way, cat.", side: "left" },
                { name: "Chen", text: "Ran-sama told me to stop you!", side: "right" }
            ]);
        }
    },
    {
        time: 67.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const chen = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Chen");
                chen.color = '#fa0';

                // Phase 1: Shikigami Sign "Pentagram Flight"
                chen.addPhase(900, 40, (enemy, dt, t) => {
                    // Star movement
                    const r = 100;
                    const speed = 2;
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t * speed) * r;
                    enemy.y = 150 + Math.sin(t * speed * 1.5) * r; // Lissajous-ish

                    if (Math.floor(t * 60) % 10 === 0) {
                        scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#f00', 3);
                    }
                }, "Shikigami Sign 'Pentagram Flight'");

                // Phase 2: Yin Yang "Douman-Seiman"
                chen.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 60 === 0) {
                        PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 200, '#00f', 4, 4, 10);
                    }
                }, "Yin Yang 'Douman-Seiman'");

                chen.start();
                scene.enemies.push(chen);
            });
        }
    }
];
