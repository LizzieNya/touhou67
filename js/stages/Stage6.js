import Enemy from '../game/Enemy.js';
import Boss from '../game/Boss.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const Stage6Events = (character) => [
    // --- Start Music ---
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage6');
            }
        }
    },
    // --- WAVE 1: Fast Red Fairies ---
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'maid');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 200 * dt;
                        if (Math.floor(t * 10) % 5 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // --- WAVE 1.5: Bat Swarm (Chaotic) ---
    {
        time: 10.0,
        action: (scene) => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 5, 'spirit');
                    e.color = '#800'; // Dark Red
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 150 * dt;
                        enemy.x += Math.sin(t * 10) * 100 * dt; // Jittery
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.aimed(scene, enemy, 300, '#800', 2);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 100);
            }
        }
    },
    // --- WAVE 1.8: Vampire Bats (Homing) ---
    {
        time: 20.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 100 + i * 20, 20, 'maid');
                    e.color = '#800';
                    e.setPattern((enemy, dt, t) => {
                        // Homing movement
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        enemy.x += Math.cos(angle) * 150 * dt;
                        enemy.y += Math.sin(angle) * 150 * dt;
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 2: Fast Blue Fairies ---
    {
        time: 30.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'maid');
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 200 * dt;
                        if (Math.floor(t * 10) % 5 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#00f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // --- WAVE 2.5: Red Magic Rush ---
    {
        time: 40.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 20 : (scene.game.playAreaWidth || scene.game.width) - 20), -20, 20, 'maid');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x += (i % 2 === 0 ? 1 : -1) * 20 * dt;
                        if (Math.floor(t * 60) % 20 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 200, '#f00', 4, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 3: Kamikaze Fairies ---
    {
        time: 50.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        // Move towards player fast
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        enemy.x += Math.cos(angle) * 300 * dt;
                        enemy.y += Math.sin(angle) * 300 * dt;
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- MIDBOSS: Sakuya (Final) ---
    {
        time: 60.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const sakuya = new Boss(scene.game, centerX, -50, "Sakuya Izayoi");
                sakuya.stopMusicOnDeath = false; // Midboss shouldn't stop stage music
                sakuya.color = '#aaa';

                // Phase 1: Killing Doll
                sakuya.addPhase(1000, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 5 === 0) {
                        // Wall of knives
                        const x = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                        scene.bulletManager.spawn(x, 0, 0, 500, '#f00', 2); // Red
                    }
                });
                sakuya.start();
                scene.enemies.push(sakuya);
            });
        }
    },
    // --- WAVE 4: Final Rush ---
    {
        time: 90.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage6');
            }
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'maid');
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 150 * dt;
                        if (Math.floor(t * 10) % 5 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 250, '#fff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 4.2: Blood Mist (Dense Red Fog) ---
    {
        time: 100.0,
        action: (scene) => {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 5, 'spirit');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (Math.floor(t * 60) % 60 === 0) {
                            // Slow red bullet
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 100, '#f00', 4);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 100);
            }
        }
    },
    // --- WAVE 4.5: Final Guard (Heavy Aimed) ---
    {
        time: 110.0,
        action: (scene) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + (i - 2.5) * 80, -20, 50, 'spirit');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 40 * dt;
                        if (t > 1 && Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 7, 0.8, 300, '#f00', 5);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- WAVE 5: Survival Rain ---
    {
        time: 120.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50, 20, 'maid');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        if (Math.floor(t * 10) % 2 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 400, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- BOSS: Remilia Scarlet ---
    {
        time: 130.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('remilia');
            }
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "You're the one behind this red mist?", side: "left" },
                    { name: "Remilia", text: "The moon is so red tonight...", side: "right" },
                    { name: "Reimu", text: "I'm stopping it right now.", side: "left" }
                ];
            } else {
                lines = [
                    { name: "Marisa", text: "Hey, vampire! I'm here to play.", side: "left" },
                    { name: "Remilia", text: "A human? How rare.", side: "right" }
                ];
            }
            scene.dialogueManager.startDialogue(lines);
        }
    },
    {
        time: 131.0,
        action: (scene) => {
            const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
            const remilia = new Boss(scene.game, centerX, -50, "Remilia Scarlet");
            remilia.color = '#f00'; // Red

            // Phase 1: Non-spell
            remilia.addPhase(1500, 40, (enemy, dt, t) => {
                enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                enemy.y = 100;
                if (Math.floor(t * 60) % 10 === 0) {
                    const a = Math.random() * Math.PI * 2;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#f00', 4); // Red
                }
            });

            // Phase 2: Heaven's Punishment "Star of David"
            remilia.addPhase(2000, 60, (enemy, dt, t) => {
                enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                enemy.y = 120;

                if (Math.floor(t * 60) % 60 === 0) {
                    // Star shape (approximate)
                    for (let k = 0; k < 5; k++) {
                        const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#f00', 5); // Red
                    }
                }
                // Random red rain
                if (Math.floor(t * 60) % 2 === 0) {
                    const x = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                    scene.bulletManager.spawn(x, 0, 0, 400, '#f00', 3); // Red
                }
            }, "Heaven's Punishment 'Star of David'");

            // Phase 3: Non-spell
            remilia.addPhase(1500, 40, (enemy, dt, t) => {
                enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 100;
                enemy.y = 100;
                if (Math.floor(t * 60) % 5 === 0) {
                    const a = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 400, Math.sin(a) * 400, '#f00', 4); // Red
                }
            });

            // Phase 4: Divine Art "Vampire Illusion"
            remilia.addPhase(2500, 60, (enemy, dt, t) => {
                enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t * 2) * 150;
                enemy.y = 100 + Math.cos(t) * 50;

                if (Math.floor(t * 60) % 3 === 0) {
                    const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 400, Math.sin(angle) * 400, '#f00', 4); // Red
                }
            }, "Divine Art 'Vampire Illusion'");

            // Phase 5: Non-spell
            remilia.addPhase(1500, 40, (enemy, dt, t) => {
                enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                enemy.y = 100;
                if (Math.floor(t * 60) % 5 === 0) {
                    const a = t * 10;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#f00', 3); // Red
                }
            });

            // Phase 6: "Red Magic"
            remilia.addPhase(3000, 90, (enemy, dt, t) => {
                enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                enemy.y = 100;

                // Dense curtain
                if (Math.floor(t * 60) % 10 === 0) {
                    for (let i = 0; i < 10; i++) {
                        const a = (i / 10) * Math.PI * 2 + t;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#f00', 3); // Red
                    }
                }
            }, "Scarlet Sign 'Red Magic'");

            remilia.start();
            scene.enemies.push(remilia);
        }
    }
];
