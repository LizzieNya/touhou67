import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage6Events = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage6');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 6: The Saigyou Ayakashi", side: "left" }
            ]);
        }
    },
    // Wave 1: Cherry Blossom Spirits
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 5, 15, 'spirit');
                    e.color = '#fcc'; // Pink
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        enemy.y += Math.sin(t * 5) * 50 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 150, '#fcc', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // Midboss: Youmu (Again)
    {
        time: 15.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const youmu = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Youmu Konpaku");
                youmu.color = '#ccc';

                youmu.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 60 === 0) {
                        PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 200, '#fff', 3, 6, 10);
                    }
                }, "Deva-Realm Sword 'Five Signs of the Dying Deva'");

                youmu.start();
                scene.enemies.push(youmu);
            });
        }
    },
    // Boss: Yuyuko Saigyouji
    {
        time: 60.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "Return the spring!", side: "left" },
                { name: "Yuyuko", text: "Oh my, a guest? Under this cherry blossom?", side: "right" },
                { name: "Yuyuko", text: "It's almost full bloom. Just a little more spring...", side: "right" }
            ]);
        }
    },
    {
        time: 65.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const yuyuko = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Yuyuko Saigyouji");
                yuyuko.color = '#fcc'; // Pink

                // Phase 1: Losing Hometown "Village of Self-Loss" (Wanderer)
                yuyuko.addPhase(1500, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t / 2) * 100;
                    enemy.y = 100 + Math.cos(t / 3) * 50;
                    if (Math.floor(t * 60) % 10 === 0) {
                        // Butterfly shape (simulated by color/speed)
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 150, '#f0f', 3, t);
                    }
                }, "Losing Hometown 'Village of Self-Loss'");

                // Phase 2: Deadly Dance "Law of Mortality" (Butterflies)
                yuyuko.addPhase(1800, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 5 === 0) {
                        const a = t * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#00f', 3);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a + Math.PI) * 200, Math.sin(a + Math.PI) * 200, '#f0f', 3);
                    }
                }, "Deadly Dance 'Law of Mortality'");

                // Phase 3: Flowery Soul "Butterfly Delusion"
                yuyuko.addPhase(2000, 70, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 50;
                    enemy.y = 120;
                    if (Math.floor(t * 60) % 60 === 0) {
                        PatternLibrary.flower(scene, enemy.x, enemy.y, 8, 200, '#fcc', 3, t);
                    }
                }, "Flowery Soul 'Butterfly Delusion'");

                // Phase 4: "Resurrection Butterfly -80% Reflowering-"
                yuyuko.addPhase(2500, 90, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    // Intense spiral + aimed
                    if (Math.floor(t * 60) % 5 === 0) {
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(t) * 300, Math.sin(t) * 300, '#f00', 3);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-t) * 300, Math.sin(-t) * 300, '#00f', 3);
                    }
                }, "'Resurrection Butterfly -80% Reflowering-'");

                yuyuko.start();
                scene.enemies.push(yuyuko);
            });
        }
    }
];
