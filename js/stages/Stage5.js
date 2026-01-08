import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const Stage5Events = (character) => [
    // --- Start Music ---
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage5');
            }
        }
    },
    // --- WAVE 1: Blue Maids ---
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, 50 + i * 50, -20, 20, 'maid');
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (Math.floor(t * 30) % 20 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 350, Math.sin(angle) * 350, '#00f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 1.5: Stopping Fairies ---
    {
        time: 10.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'kedama');
                    e.color = '#aaa';
                    e.setPattern((enemy, dt, t) => {
                        if (t < 1) enemy.y += 200 * dt; // Rush in
                        else if (t < 2) { /* Stop */ }
                        else enemy.y += 100 * dt; // Leave

                        if (t > 1 && t < 2 && Math.floor(t * 60) % 10 === 0) {
                            PatternLibrary.aimed(scene, enemy, 400, '#aaa', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 1.8: Time Dilation Fairies (Variable Speed) ---
    {
        time: 20.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 100 + i * 20, 20, 'spirit');
                    e.color = '#0ff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            // Fast bullet that slows down? Not easily done without bullet update logic.
                            // Instead, spawn bullets of different speeds
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 400, '#0ff', 3);
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#0ff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 2: Red Maids ---
    {
        time: 30.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth || scene.game.width) - (50 + i * 50), -20, 20, 'maid');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (Math.floor(t * 30) % 20 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 350, Math.sin(angle) * 350, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 3: Green Maids (Spread) ---
    {
        time: 40.0,
        action: (scene) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + (i - 2) * 100, -20, 20, 'maid');
                    e.color = '#0f0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            for (let k = 0; k < 5; k++) {
                                const a = (k / 5) * Math.PI + Math.PI; // Downward arc
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#0f0', 3);
                            }
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- WAVE 3.5: Knife Throwing Rush ---
    {
        time: 50.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 20 : (scene.game.playAreaWidth || scene.game.width) - 20), -20, 20, 'maid');
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 150 * dt;
                        enemy.x += (i % 2 === 0 ? 1 : -1) * 50 * dt;
                        if (Math.floor(t * 20) % 10 === 0) {
                            PatternLibrary.aimed(scene, enemy, 400, '#00f', 2); // Blue knives
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- MIDBOSS: Sakuya ---
    {
        time: 60.0,
        action: (scene) => {
            if (scene.game.soundManager) {
                // Authentic: Stage 5 Midboss uses Stage Theme
                scene.game.soundManager.playBossTheme('stage5');
            }
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const sakuya = new Boss(scene.game, centerX, -50, "Sakuya Izayoi");
                sakuya.stopMusicOnDeath = false; // Midboss shouldn't stop stage music
                sakuya.color = '#aaa'; // Silver

                // Phase 1: Knife Throw
                sakuya.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.y = 100 + Math.sin(t * 2) * 10;
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(t) * 100;

                    if (Math.floor(t * 60) % 10 === 0) {
                        const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 400, Math.sin(angle) * 400, '#00f', 2); // Blue
                    }
                });
                sakuya.start();
                scene.enemies.push(sakuya);
            });
        }
    },
    // --- WAVE 4: Fast Cross Maids ---
    {
        time: 90.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage5');
            }
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 100 + i * 20, 20, 'maid');
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                        enemy.y += Math.sin(t * 5) * 50 * dt;
                        if (Math.floor(t * 20) % 10 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#fff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 4.2: Ricochet Maids (Simulated) ---
    {
        time: 100.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                    e.color = '#0f0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            // Shoot 4 ways
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 4, 250, '#0f0', 3, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 4.5: Teleporting Fairies (Fast Movement) ---
    {
        time: 110.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        // Jerky movement
                        if (Math.floor(t * 2) % 2 === 0) {
                            enemy.y += 200 * dt;
                        } else {
                            // Stop and shoot
                            if (Math.floor(t * 60) % 10 === 0) {
                                PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 200, '#f0f', 3, t);
                            }
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 5: Elite Maids ---
    {
        time: 120.0,
        action: (scene) => {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + (i - 1.5) * 150, -20, 20, 'maid');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (Math.floor(t * 60) % 40 === 0) {
                            // Aimed
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#f0f', 3);
                            // Ring
                            for (let k = 0; k < 8; k++) {
                                const a = (k / 8) * Math.PI * 2;
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 150, Math.sin(a) * 150, '#f0f', 3);
                            }
                        }
                    });
                    scene.enemies.push(e);
                }, i * 800);
            }
        }
    },
    // --- BOSS: Sakuya Izayoi ---
    {
        time: 130.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('sakuya');
            }
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "The maid again?", side: "left" },
                    { name: "Sakuya", text: "I will not let you disturb the mistress.", side: "right" },
                    { name: "Reimu", text: "Move, or I'll make you move.", side: "left" }
                ];
            } else if (character === 'Marisa') {
                lines = [
                    { name: "Marisa", text: "Out of the way, maid!", side: "left" },
                    { name: "Sakuya", text: "I will clean you up.", side: "right" },
                    { name: "Marisa", text: "I'll clean YOU up with my laser!", side: "left" }
                ];
            } else if (character === 'Remilia') {
                lines = [
                    { name: "Remilia", text: "Sakuya, move aside.", side: "left" },
                    { name: "Sakuya", text: "Mistress... I cannot let you proceed.", side: "right" },
                    { name: "Remilia", text: "Are you defying me?", side: "left" },
                    { name: "Sakuya", text: "It is for your own safety.", side: "right" }
                ];
            } else if (character === 'Flandre') {
                lines = [
                    { name: "Flandre", text: "Maid! Play with me!", side: "left" },
                    { name: "Sakuya", text: "Sister... please go back to the basement.", side: "right" },
                    { name: "Flandre", text: "No! I want to break things!", side: "left" }
                ];
            } else if (character === 'Sakuya') {
                lines = [
                    { name: "Sakuya", text: "Another me?", side: "left" },
                    { name: "Sakuya", text: "I am the real one.", side: "right" },
                    { name: "Sakuya", text: "We shall see about that.", side: "left" }
                ];
            } else {
                lines = [
                    { name: character, text: "You're in my way.", side: "left" },
                    { name: "Sakuya", text: "I shall remove the trash.", side: "right" }
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
                const sakuya = new Boss(scene.game, centerX, -50, "Sakuya Izayoi");
                sakuya.color = '#aaa';

                // Phase 1: Non-spell
                sakuya.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 100;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 5 === 0) {
                        const a = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 400, Math.sin(a) * 400, '#f00', 2); // Red
                    }
                });

                // Phase 2: Illusion Existence "Clock Corpse"
                sakuya.addPhase(1500, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 10 === 0) {
                        const a = t * 3;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#0f0', 3);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a + Math.PI) * 300, Math.sin(a + Math.PI) * 300, '#0f0', 3);
                    }
                }, "Illusion Existence 'Clock Corpse'");

                // Phase 3: Non-spell
                sakuya.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 10 === 0) {
                        const x = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                        scene.bulletManager.spawn(x, 0, 0, 400, '#00f', 2); // Blue
                    }
                });

                // Phase 4: Illusion World "The World" (Time Stop)
                sakuya.addPhase(2000, 60, (enemy, dt, t) => {
                    const cycle = t % 8; // 8 second cycle

                    if (cycle < 3) {
                        // Normal: Move and shoot aimed
                        scene.enemyTimeStop = false;
                        enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 100;
                        enemy.y = 100 + Math.cos(t) * 50;

                        if (Math.floor(t * 60) % 10 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#00f', 2);
                        }
                    } else if (cycle < 5) {
                        // TIME STOP (2 seconds)
                        scene.enemyTimeStop = true;

                        // Sakuya teleports/moves fast around player
                        const subT = cycle - 3;
                        enemy.x = scene.player.x + Math.cos(subT * 5) * 150;
                        enemy.y = scene.player.y + Math.sin(subT * 5) * 150;

                        // Place knives aimed at player (frozen in place due to time stop)
                        if (Math.floor(t * 60) % 4 === 0) {
                            const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                            // Spawn with speed, but they won't move until time resumes
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 400, Math.sin(angle) * 400, '#f00', 2);
                        }
                    } else {
                        // RESUME (3 seconds)
                        scene.enemyTimeStop = false;
                        // Knives spawned during time stop will now start moving

                        // Sakuya retreats
                        enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                        enemy.y = 100;
                    }
                }, "Illusion World 'The World'");

                sakuya.start();
                scene.enemies.push(sakuya);
            });
        }
    }
];
