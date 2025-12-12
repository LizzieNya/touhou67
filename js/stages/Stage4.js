import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const Stage4Events = (character) => [
    // --- Start Music ---
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage4');
            }
        }
    },
    // --- WAVE 1: Fire Book Fairies ---
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, 50 + i * 60, -20, 20, 'book');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x += Math.sin(t * 2) * 20 * dt;
                        if (Math.floor(t * 40) % 30 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 1.5: Earth Book Fairies (Heavy) ---
    {
        time: 10.0,
        action: (scene) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'book');
                    e.color = '#a50'; // Brown/Orange
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (t > 1 && Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 100, '#a50', 5, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 600);
            }
        }
    },
    // --- WAVE 1.8: Wood Book Fairies (Leaf Pattern) ---
    {
        time: 20.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 50 : (scene.game.playAreaWidth || scene.game.width) - 50), -20, 15, 'book');
                    e.color = '#0a0'; // Dark Green
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x += Math.cos(t * 3) * 50 * dt;
                        if (Math.floor(t * 60) % 20 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 3, 0.5, 200, '#0a0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 2: Water Book Fairies ---
    {
        time: 30.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth || scene.game.width) - (50 + i * 60), -20, 20, 'book');
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x -= Math.sin(t * 2) * 20 * dt;
                        if (Math.floor(t * 40) % 30 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#00f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 2.5: Metal Book Fairies (Fast Needles) ---
    {
        time: 40.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 20 : (scene.game.playAreaWidth || scene.game.width) - 20), -20, 10, 'book');
                    e.color = '#aaa'; // Silver
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x += (i % 2 === 0 ? 1 : -1) * 30 * dt;
                        if (Math.floor(t * 30) % 15 === 0) {
                            PatternLibrary.aimed(scene, enemy, 350, '#aaa', 2);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 250);
            }
        }
    },
    // --- WAVE 3: Mixed Barrage ---
    {
        time: 50.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 120 * dt;
                        if (Math.floor(t * 30) % 20 === 0) {
                            const angle = Math.random() * Math.PI * 2;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 150, Math.sin(angle) * 150, '#f0f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- MIDBOSS: Koakuma ---
    {
        time: 60.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const koakuma = new Boss(scene.game, centerX, -50, "Koakuma");
                koakuma.color = '#a00'; // Reddish

                // Phase 1: Random aimed
                koakuma.addPhase(600, 30, (enemy, dt, t) => {
                    enemy.y = 100 + Math.sin(t) * 30;
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(t) * 100;

                    if (Math.floor(t * 60) % 15 === 0) {
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#fff', 3); // White
                    }
                });
                koakuma.start();
                scene.enemies.push(koakuma);
            });
        }
    },
    // --- WAVE 4: Green Book Fairies ---
    {
        time: 90.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage4');
            }
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 30, 20, 'book');
                    e.color = '#0f0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        if (Math.floor(t * 30) % 20 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 250, Math.sin(angle) * 250, '#0f0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 4.2: Void Book Fairies (Dark Bullets) ---
    {
        time: 100.0,
        action: (scene) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                    e.color = '#408'; // Dark Purple
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 60 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 150, '#408', 5, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- WAVE 4.5: Sun/Moon Fairies (Light/Dark) ---
    {
        time: 110.0,
        action: (scene) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const isSun = i % 2 === 0;
                    const e = new Enemy(scene.game, isSun ? 50 : (scene.game.playAreaWidth || scene.game.width) - 50, -20, 20, 'spirit');
                    e.color = isSun ? '#fb0' : '#408'; // Gold or Dark Purple
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 60 * dt;
                        enemy.x += (isSun ? 1 : -1) * 20 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            if (isSun) {
                                PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 200, '#fb0', 4, t);
                            } else {
                                PatternLibrary.aimedNWay(scene, enemy, 5, 0.5, 200, '#408', 4);
                            }
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- WAVE 5: Yellow Book Fairies ---
    {
        time: 120.0,
        action: (scene) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(i) * 100, -20, 20, 'book');
                    e.color = '#ff0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        enemy.x += Math.sin(t) * 50 * dt;
                        if (Math.floor(t * 20) % 5 === 0) {
                            const a = t * 5;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#ff0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- BOSS: Patchouli Knowledge ---
    {
        time: 130.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('patchouli');
            }
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "It smells like old books.", side: "left" },
                    { name: "Patchouli", text: "You're noisy.", side: "right" }
                ];
            } else {
                lines = [
                    { name: "Marisa", text: "Patchy! I'm here to borrow books!", side: "left" },
                    { name: "Patchouli", text: "You mean steal?", side: "right" }
                ];
            }
            scene.dialogueManager.startDialogue(lines);
        }
    },
    {
        time: 131.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const patchouli = new Boss(scene.game, centerX, -50, "Patchouli Knowledge");
                patchouli.color = '#a0f'; // Purple

                // Phase 1: Non-spell
                patchouli.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 10 === 0) {
                        const a = t * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#f00', 3); // Red
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a) * 200, Math.sin(-a) * 200, '#00f', 3); // Blue
                    }
                });

                // Phase 2: Fire Sign "Agni Shine"
                patchouli.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 10 === 0) {
                        const angle = Math.random() * Math.PI * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#f00', 4); // Red
                    }
                }, "Fire Sign 'Agni Shine'");

                // Phase 3: Non-spell
                patchouli.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 50;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 5 === 0) {
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#0f0', 3); // Green
                    }
                });

                // Phase 4: Water Sign "Princess Undine"
                patchouli.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 50;
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 5 === 0) {
                        // Spiral
                        const angle = t * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 200, Math.sin(angle) * 200, '#00f', 3); // Blue
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + Math.PI) * 200, Math.sin(angle + Math.PI) * 200, '#00f', 3); // Blue
                    }
                }, "Water Sign 'Princess Undine'");

                // Phase 5: Wood Sign "Sylphy Horn" (Green aimed)
                patchouli.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 20 === 0) {
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 350, Math.sin(angle) * 350, '#0f0', 4); // Green
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + 0.2) * 350, Math.sin(angle + 0.2) * 350, '#0f0', 4); // Green
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle - 0.2) * 350, Math.sin(angle - 0.2) * 350, '#0f0', 4); // Green
                    }
                }, "Wood Sign 'Sylphy Horn'");

                patchouli.start();
                scene.enemies.push(patchouli);
            });
        }
    }
];
