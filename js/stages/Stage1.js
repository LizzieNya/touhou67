import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const Stage1Events = (character) => [
    // --- WAVE 1: Intro Fairies (Aimed N-Way) ---
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage1');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 1", side: "left" },
                { name: "System", text: "A Soul as Red as a Ground Cherry", side: "left" },
                { name: "System", text: "Wandering about in the daylight", side: "left" }
            ]);
        }
    },
    {
        time: 2.0,
        action: (scene) => {
            // 10 Red Fairies from top left
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, 50 + i * 30, -20, 5); // HP: 5 (Easy)
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x += Math.sin(t * 2) * 30 * dt;
                        if (t > 0.5 && Math.floor(t * 20) % 20 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 3, 0.5, 200, '#f00', 4);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    {
        time: 5.0,
        action: (scene) => {
            // 10 Blue Fairies from top right
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth || 448) - 50 - i * 30, -20, 5); // HP: 5 (Easy)
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x -= Math.sin(t * 2) * 30 * dt;
                        if (t > 0.5 && Math.floor(t * 20) % 20 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 3, 0.5, 200, '#00f', 4);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // --- WAVE 2: Streaming Fairies (Whip/Curve) ---
    {
        time: 10.0,
        action: (scene) => {
            // Line of fairies across screen
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, 30 + i * 40, -20, 10, 'kedama'); // HP: 10 (Medium)
                    e.color = '#0f0';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 60 * dt;
                        if (t > 0.5 && t < 4.0 && Math.floor(t * 15) % 10 === 0) {
                            // Curving bullets
                            PatternLibrary.whip(scene, enemy.x, enemy.y, Math.PI / 2, 150, 0.5, '#0f0', 3);
                            PatternLibrary.whip(scene, enemy.x, enemy.y, Math.PI / 2, 150, -0.5, '#0f0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 2.5: Random Spray Rain ---
    {
        time: 20.0,
        action: (scene) => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * ((scene.game.playAreaWidth || 448) - 40) + 20, -20, 8, 'spirit');
                    e.color = '#ff0'; // Yellow
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        if (t > 0.2 && Math.floor(t * 30) % 30 === 0) {
                            PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 3, Math.PI / 2, 1.0, 100, 200, '#ff0', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 2.8: Dense Ring Fairies ---
    {
        time: 30.0,
        action: (scene) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + (i - 2.5) * 80, -20, 15);
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (t > 1 && Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 150, '#f0f', 4, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 500);
            }
        }
    },
    // --- WAVE 3: Spiral Burst Fairies ---
    {
        time: 40.0,
        action: (scene) => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const xPos = (i % 2 === 0) ? 50 : (scene.game.playAreaWidth || 448) - 50;
                    const e = new Enemy(scene.game, xPos, -20, 20); // HP: 20 (Hard)
                    e.color = '#f0f'; // Magenta
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x += (i % 2 === 0 ? 1 : -1) * 20 * dt;

                        if (t > 1.0 && Math.floor(t * 60) % 40 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 150, '#f0f', 4, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- WAVE 3.5: Fast Aimed Streams (Big Fairies) ---
    {
        time: 50.0,
        action: (scene) => {
            // Left Big Fairy
            const e1 = new Enemy(scene.game, 100, -50, 50);
            e1.radius = 25;
            e1.color = '#0ff';
            e1.setPattern((enemy, dt, t) => {
                if (t < 2) enemy.y += 100 * dt; // Enter
                else enemy.y += 10 * dt; // Slow drift

                if (t > 1 && Math.floor(t * 60) % 5 === 0) {
                    PatternLibrary.aimed(scene, enemy, 300, '#0ff', 3);
                }
            });
            scene.enemies.push(e1);

            // Right Big Fairy
            const e2 = new Enemy(scene.game, (scene.game.playAreaWidth || 448) - 100, -50, 50);
            e2.radius = 25;
            e2.color = '#0ff';
            e2.setPattern((enemy, dt, t) => {
                if (t < 2) enemy.y += 100 * dt;
                else enemy.y += 10 * dt;

                if (t > 1 && Math.floor(t * 60) % 5 === 0) {
                    PatternLibrary.aimed(scene, enemy, 300, '#0ff', 3);
                }
            });
            scene.enemies.push(e2);
        }
    },
    // --- MIDBOSS: Rumia ---
    {
        time: 60.0,
        action: (scene) => {
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "It's getting dark...", side: "left" },
                    { name: "Rumia", text: "The youkai of dusk is here!", side: "right" },
                    { name: "Reimu", text: "You again? Out of my way.", side: "left" }
                ];
            } else if (character === 'Marisa') {
                lines = [
                    { name: "Marisa", text: "So dark... I can't see a thing.", side: "left" },
                    { name: "Rumia", text: "The youkai of dusk is here!", side: "right" },
                    { name: "Marisa", text: "Move it, or I'll blast you.", side: "left" }
                ];
            } else if (character === 'Remilia') {
                lines = [
                    { name: "Remilia", text: "Darkness? I was born in it.", side: "left" },
                    { name: "Rumia", text: "The youkai of dusk is here!", side: "right" },
                    { name: "Remilia", text: "Dusk is merely a prelude to my night.", side: "left" }
                ];
            } else if (character === 'Flandre') {
                lines = [
                    { name: "Flandre", text: "It's dark! Hide and seek?", side: "left" },
                    { name: "Rumia", text: "The youkai of dusk is here!", side: "right" },
                    { name: "Flandre", text: "Found you!", side: "left" }
                ];
            } else {
                // Sakuya
                lines = [
                    { name: "Sakuya", text: "It's quite dark here.", side: "left" },
                    { name: "Rumia", text: "The youkai of dusk is here!", side: "right" },
                    { name: "Sakuya", text: "I don't have time for games.", side: "left" }
                ];
            }
            if (scene.game.soundManager) {
                // Authentic: Stage 1 Midboss plays Stage Theme, not Boss Theme
                scene.game.soundManager.playBossTheme('stage1');
            }
            scene.dialogueManager.startDialogue(lines);
        }
    },
    {
        time: 61.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                // Fix: Ensure we spawn in the center of the PLAY AREA (224), not the screen (320)
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const rumia = new Boss(scene.game, centerX, -50, "Rumia");
                rumia.stopMusicOnDeath = false; // Midboss shouldn't stop stage music

                // Phase 1: Non-spell (flower-like pattern)
                rumia.addPhase(400, 50, (enemy, dt, t) => {
                    enemy.y = 100 + Math.sin(t) * 20;
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(t * 0.5) * 50;

                    if (Math.floor(t * 60) % 20 === 0) {
                        PatternLibrary.flower(scene, enemy.x, enemy.y, 16, 3, 200, 50, '#fff', 4, t);
                    }
                });

                rumia.start();
                scene.enemies.push(rumia);
            });
        }
    },
    {
        time: 75.0, // Reduced from 90.0
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 10);
                    e.color = '#0ff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (Math.floor(t * 60) % 60 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 400, '#0ff', 5, 0, 0, 'laser');
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 4: Post-Midboss Rush ---
    {
        time: 80.0, // Reduced from 100.0
        action: (scene) => {
            // Resume Stage Theme - Commented out to prevent reset
            /*if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage1');
            }*/

            // Massive swarm
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * ((scene.game.playAreaWidth || 448) - 100) + 50, -20, 8, 'spirit'); // HP: 8 (Swarm)
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 120 * dt;
                        if (Math.floor(t * 30) % 40 === 0) {
                            PatternLibrary.aimed(scene, enemy, 250, '#f0f', 4);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 4.5: Great Fairy Rush ---
    {
        time: 90.0, // Reduced from 110.0
        action: (scene) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0) ? 100 : (scene.game.playAreaWidth || 448) - 100, -20, 30);
                    e.radius = 20;
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (t > 1 && Math.floor(t * 60) % 10 === 0) {
                            PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 150, '#f00', 4, 2, 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 1000);
            }
        }
    },
    // --- WAVE 4.8: Popcorn Rush (No Bullets) ---
    {
        time: 95.0, // Reduced from 120.0
        action: (scene) => {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 1);
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 300 * dt; // Very fast
                    });
                    scene.enemies.push(e);
                }, i * 100);
            }
        }
    },
    // --- BOSS: Rumia (Full) ---
    {
        time: 105.0, // Reduced from 130.0
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('rumia');
            }
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "So you're the one stalking the night.", side: "left" },
                    { name: "Rumia", text: "Is that so?", side: "right" },
                    { name: "Rumia", text: "The night is just fine.", side: "right" }
                ];
            } else if (character === 'Marisa') {
                lines = [
                    { name: "Marisa", text: "Found a youkai!", side: "left" },
                    { name: "Rumia", text: "Is that so?", side: "right" },
                    { name: "Rumia", text: "Can I eat you?", side: "right" }
                ];
            } else if (character === 'Remilia') {
                lines = [
                    { name: "Rumia", text: "You look tasty.", side: "right" },
                    { name: "Remilia", text: "I am not food.", side: "left" }
                ];
            } else if (character === 'Flandre') {
                lines = [
                    { name: "Flandre", text: "You're funny! Can I break you?", side: "left" },
                    { name: "Rumia", text: "Stretching my arms.", side: "right" }
                ];
            } else {
                lines = [
                    { name: "Rumia", text: "Is that so?", side: "right" },
                    { name: "Sakuya", text: "You're in my way.", side: "left" },
                    { name: "Rumia", text: "I'm stretching my arms.", side: "right" }
                ];
            }
            scene.dialogueManager.startDialogue(lines);
        }
    },
    {
        time: 106.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const rumia = new Boss(scene.game, centerX, -50, "Rumia");

                // Phase 1: Non-spell (Spiral + Aimed)
                rumia.addPhase(300, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 50;
                    enemy.y = 100;

                    // Spiral
                    if (Math.floor(t * 60) % 5 === 0) {
                        PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 200, '#fff', 3, 2, 3);
                    }

                    // Aimed bursts
                    if (Math.floor(t * 60) % 120 === 0) {
                        PatternLibrary.aimedNWay(scene, enemy, 5, 0.8, 300, '#f00', 5);
                    }
                });

                // Phase 2: Spell Card "Moonlight Ray" (Authentic Spell 1)
                rumia.addPhase(400, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t * 0.5) * 50;
                    enemy.y = 100;

                    // Moonlight Ray: Lasers crossing near player
                    if (Math.floor(t * 60) % 120 === 0) {
                        // Horizontal Lasers
                        scene.bulletManager.spawn(0, scene.player.y, 300, 0, '#fff', 3, 0, 0, 'laser');
                        scene.bulletManager.spawn((scene.game.playAreaWidth || 448), scene.player.y, -300, 0, '#fff', 3, 0, 0, 'laser');
                    }

                    // Random Blue Spray
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 1, Math.PI / 2, Math.PI, 100, 200, '#00f', 4);
                    }
                }, "Moon Sign 'Moonlight Ray'");

                // Phase 3: Non-spell (Accelerating Bullets)
                rumia.addPhase(300, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 15 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 50, '#ff0', 4, t, 100); // Start slow, accelerate
                    }
                });

                // Phase 4: Darkness Sign "Demarcation" (The Ultimate Pattern)
                rumia.addPhase(600, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    // Dense Red Ring
                    if (Math.floor(t * 60) % 60 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 30, 150, '#f00', 5, t);
                    }

                    // Fast White Aimed Stream
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.aimed(scene, enemy, 350, '#fff', 3);
                    }

                    // Slow Blue Random Clouds
                    if (Math.floor(t * 60) % 5 === 0) {
                        PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 1, Math.PI / 2, Math.PI * 2, 50, 100, '#00f', 8);
                    }
                }, "Darkness Sign 'Demarcation'");

                rumia.start();
                scene.enemies.push(rumia);
            });
        }
    }
];
