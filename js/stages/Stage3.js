import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const Stage3Events = (character) => [
    // --- Start Music ---
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage3');
            }
        }
    },
    // --- WAVE 1: Streaming Fairies ---
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const x = i % 2 === 0 ? 50 : (scene.game.playAreaWidth || scene.game.width) - 50;
                    const e = new Enemy(scene.game, x, -20, 20, 'kedama');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 150 * dt;
                        enemy.x += (x < (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) ? 1 : -1) * 50 * dt;
                        if (Math.floor(t * 20) % 15 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 1.5: Rainbow Fairies (Spiral) ---
    {
        time: 10.0,
        action: (scene) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224), -20, 15, 'maid');
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 60 * dt;
                        enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t * 2 + i) * 100;
                        if (Math.floor(t * 60) % 20 === 0) {
                            PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 150, '#0f0', 3, 2, 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- WAVE 1.8: Martial Arts Fairies (Move Close, Shoot, Retreat) ---
    {
        time: 20.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'maid');
                    e.color = '#0a0'; // Dark Green
                    e.setPattern((enemy, dt, t) => {
                        if (t < 1.0) {
                            // Rush down
                            enemy.y += 300 * dt;
                        } else if (t < 2.0) {
                            // Stop and shoot
                            if (Math.floor(t * 60) % 10 === 0) {
                                PatternLibrary.aimed(scene, enemy, 400, '#0a0', 4);
                            }
                        } else {
                            // Retreat up
                            enemy.y -= 200 * dt;
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 2: V-Formation ---
    {
        time: 30.0,
        action: (scene) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224), -20);
                    e.color = '#0f0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x += Math.sin(t * 3 + i) * 100 * dt;
                        if (Math.floor(t * 30) % 20 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 200, Math.sin(angle) * 200, '#0f0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 2.5: Aimed Streams ---
    {
        time: 40.0,
        action: (scene) => {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 20 : (scene.game.playAreaWidth || scene.game.width) - 20), -20, 20, 'kedama');
                    e.color = '#ff0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x += (i % 2 === 0 ? 1 : -1) * 20 * dt;
                        if (t > 0.5 && Math.floor(t * 40) % 30 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 3, 0.3, 250, '#ff0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 3: Side Rush ---
    {
        time: 50.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 100 + i * 20, 20, 'maid');
                    e.color = '#ff0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        if (Math.floor(t * 20) % 10 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 150, '#ff0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- MIDBOSS: Hong Meiling ---
    {
        time: 60.0,
        action: (scene) => {
            if (scene.game.soundManager) {
                // Authentic: Midboss plays Stage Theme
                scene.game.soundManager.playBossTheme('stage3');
            }
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const meiling = new Boss(scene.game, centerX, -50, "Hong Meiling");
                meiling.stopMusicOnDeath = false; // Midboss shouldn't stop stage music
                meiling.color = '#0a0'; // Green

                // Phase 1: Rainbow spread
                meiling.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.y = 100 + Math.sin(t) * 20;
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(t * 0.5) * 100;

                    if (Math.floor(t * 60) % 10 === 0) {
                        const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                        const color = colors[Math.floor(t) % colors.length];
                        for (let i = 0; i < 3; i++) {
                            const a = (i / 3) * Math.PI * 2 + t * 2;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, color, 4); // Rainbow
                        }
                    }
                });
                meiling.start();
                scene.enemies.push(meiling);
            });
        }
    },
    // --- WAVE 4: Circular Formation ---
    {
        time: 90.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage3');
            }
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const angle = (i / 8) * Math.PI * 2;
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(angle) * 200, -50, 20, 'maid');
                    e.color = '#0ff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x += Math.sin(t * 2) * 50 * dt;
                        if (Math.floor(t * 40) % 30 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 150, '#0ff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 4.2: Colorful Spiral ---
    {
        time: 100.0,
        action: (scene) => {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + (i - 1.5) * 100, -20, 30, 'spirit');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (t > 1 && Math.floor(t * 60) % 10 === 0) {
                            const color = (Math.floor(t) % 2 === 0) ? '#f00' : '#00f';
                            PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 150, color, 3, 2, 4);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 800);
            }
        }
    },
    // --- WAVE 4.5: Flower Rush ---
    {
        time: 110.0,
        action: (scene) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * ((scene.game.playAreaWidth || scene.game.width) - 100) + 50, -20, 20, 'maid');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (t > 1 && Math.floor(t * 60) % 40 === 0) {
                            PatternLibrary.flower(scene, enemy.x, enemy.y, 12, 5, 150, 50, '#f0f', 3, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 600);
            }
        }
    },
    // --- WAVE 5: Fast Stream ---
    {
        time: 120.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'kedama');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 250 * dt;
                        if (Math.floor(t * 10) % 5 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#f0f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // --- BOSS: Hong Meiling ---
    {
        time: 130.0,
        action: (scene) => {
            // Resume Stage Theme (briefly before boss dialogue cuts it)
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('meiling');
            }

            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "Out of my way.", side: "left" },
                    { name: "Meiling", text: "You shall not pass the gate!", side: "right" }
                ];
            } else {
                lines = [
                    { name: "Marisa", text: "Nice place you got here.", side: "left" },
                    { name: "Meiling", text: "No intruders allowed!", side: "right" }
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
                const meiling = new Boss(scene.game, centerX, -50, "Hong Meiling");
                meiling.color = '#0a0';

                // Phase 1: Non-spell
                meiling.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 50;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 5 === 0) {
                        const a = t * 5;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#0f0', 3); // Green
                    }
                });

                // Phase 2: Flower Sign "Gorgeous Sweet Flower"
                meiling.addPhase(1000, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 120;

                    if (Math.floor(t * 60) % 20 === 0) {
                        for (let i = 0; i < 8; i++) {
                            const a = (i / 8) * Math.PI * 2 + t;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 150, Math.sin(a) * 150, '#f0f', 4); // Pink/Magenta
                        }
                    }
                }, "Flower Sign 'Gorgeous Sweet Flower'");

                // Phase 3: Non-spell
                meiling.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 10 === 0) {
                        const a = Math.random() * Math.PI * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 250, Math.sin(a) * 250, '#ff0', 3); // Yellow
                    }
                });

                // Phase 4: Rainbow Sign "Colorful Rain"
                meiling.addPhase(1200, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 50;
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 5 === 0) {
                        const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        const angle = Math.random() * Math.PI * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 250, Math.sin(angle) * 250, color, 3); // Rainbow
                    }
                }, "Rainbow Sign 'Colorful Rain'");

                meiling.start();
                scene.enemies.push(meiling);
            });
        }
    }
];
