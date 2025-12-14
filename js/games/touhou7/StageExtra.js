import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const StageExtraEvents = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage_extra');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Extra Stage: The Boundary of Life and Death", side: "left" }
            ]);
        }
    },
    // Wave 1: Fast Fairies
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 40; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'fairy');
                    e.color = '#ff0'; // Yellow
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 200 * dt; // Fast
                        if (Math.floor(t * 60) % 10 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#ff0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 100);
            }
        }
    },
    // Midboss: Chen (Powered Up)
    {
        time: 10.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const chen = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Chen");
                chen.color = '#fa0';

                chen.addPhase(5000, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t * 4) * 200; // Very fast movement
                    enemy.y = 150 + Math.cos(t * 2) * 50;

                    if (Math.floor(t * 60) % 5 === 0) {
                        PatternLibrary.aimed(scene, enemy, 400, '#f00', 3);
                    }
                }, "Oni Sign 'Blue Oni Red Oni'");

                chen.start();
                scene.enemies.push(chen);
            });
        }
    },
    // Boss: Ran Yakumo
    {
        time: 60.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "Who are you?", side: "left" },
                { name: "Ran", text: "I am the shikigami of the gap youkai.", side: "right" },
                { name: "Ran", text: "You've made quite a mess of my master's sleep.", side: "right" }
            ]);
        }
    },
    {
        time: 65.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const ran = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Ran Yakumo");
                ran.color = '#fd0'; // Fox colors

                // Phase 1: Shikigami "Protection of Zenki and Goki"
                ran.addPhase(6000, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 30 === 0) {
                        // Triangles
                        for (let i = 0; i < 3; i++) {
                            const a = t + i * (Math.PI * 2 / 3);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#00f', 4);
                        }
                    }
                    if (Math.floor(t * 60) % 5 === 0) {
                        scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random() - 0.5) * 400, 400, '#f00', 3);
                    }
                }, "Shikigami 'Protection of Zenki and Goki'");

                // Phase 2: Shikigami "Dakini's Heavenly Possession"
                ran.addPhase(8000, 70, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.spiral(scene, enemy.x, enemy.y, t * 2, 300, '#ff0', 3, 4, 20);
                    }
                }, "Shikigami 'Dakini's Heavenly Possession'");

                // Phase 3: "Illusion God 'Descent of Izuna-Gongen'"
                ran.addPhase(12000, 90, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 120;
                    // Complex math pattern (Lissajous bullets)
                    if (Math.floor(t * 60) % 2 === 0) {
                        const a = t * 3;
                        const r = 300;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * r, Math.sin(a * 1.5) * r, '#f0f', 3);
                    }
                }, "'Illusion God 'Descent of Izuna-Gongen''");

                ran.start();
                scene.enemies.push(ran);
            });
        }
    }
];
