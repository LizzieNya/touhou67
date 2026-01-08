import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const Stage2Events = (character) => [
    // --- Stage Intro ---
    {
        time: 0.1,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 2", side: "left" },
                { name: "System", text: "A Flower-Studded Sake Dish on Mt. Ooe", side: "left" },
                { name: "System", text: "The lake is frozen solid", side: "left" }
            ]);
        }
    },
    // --- Start Music ---
    {
        time: 2.0,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage2');
            }
        }
    },
    // --- WAVE 1: Ice Fairies ---
    {
        time: 10.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 20, 'spirit');
                    e.color = '#0ff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 120 * dt;
                        if (Math.floor(t * 20) % 10 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#0ff', 3); // Cyan
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 1.5: Streaming Ice ---
    {
        time: 20.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 20 : (scene.game.playAreaWidth || 448) - 20), -20);
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        enemy.x += (i % 2 === 0 ? 1 : -1) * 30 * dt;
                        if (t > 0.5 && Math.floor(t * 30) % 20 === 0) {
                            PatternLibrary.aimed(scene, enemy, 250, '#fff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 1.8: Spiral Snow ---
    {
        time: 30.0,
        action: (scene) => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224), -20, 20, 'kedama');
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 100;
                        if (Math.floor(t * 60) % 10 === 0) {
                            PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 150, '#00f', 3, 2, 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 800);
            }
        }
    },
    // --- WAVE 1.9: Icicle Rain ---
    {
        time: 40.0,
        action: (scene) => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 5, 'spirit');
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 200 * dt;
                        if (Math.floor(t * 20) % 10 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#fff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // --- MIDBOSS: Daiyousei ---
    {
        time: 50.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const daiyousei = new Boss(scene.game, centerX, -50, "Daiyousei");
                daiyousei.stopMusicOnDeath = false; // Midboss shouldn't stop stage music
                daiyousei.color = '#0f0';

                // Phase 1: Simple Spread
                daiyousei.addPhase(500, 30, (enemy, dt, t) => {
                    enemy.y = 100 + Math.sin(t) * 20;
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(t * 0.8) * 80;

                    if (Math.floor(t * 60) % 20 === 0) {
                        for (let i = 0; i < 5; i++) {
                            const a = (i / 5) * Math.PI + t;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#0f0', 4); // Green
                        }
                    }
                });
                daiyousei.start();
                scene.enemies.push(daiyousei);
            });
        }
    },
    // --- WAVE 2: More Fairies ---
    {
        time: 65.0, // Reduced from 80.0
        action: (scene) => {
            // Resume Stage Theme - Commented out
            /*if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage2');
            }*/
            for (let i = 0; i < 16; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || 448)), 50 + i * 20);
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                        enemy.y += Math.sin(t * 5) * 50 * dt;
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 2.5: Diamond Dust (Small Fast Bullets) ---
    {
        time: 75.0, // Reduced from 90.0
        action: (scene) => {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 10, 'spirit');
                    e.color = '#0ff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (Math.floor(t * 30) % 20 === 0) {
                            PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 3, Math.PI / 2, 1.0, 200, 400, '#0ff', 2);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 3: Snowball Swarm ---
    {
        time: 85.0, // Reduced from 100.0
        action: (scene) => {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 20, 'kedama');
                    e.color = '#00f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 150 * dt;
                        if (Math.floor(t * 10) % 5 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 250, '#fff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 150);
            }
        }
    },
    // --- WAVE 3.5: Aimed Ice Rush ---
    {
        time: 95.0, // Reduced from 110.0
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 15);
                    e.color = '#0ff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (t > 0.5 && Math.floor(t * 30) % 20 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 3, 0.4, 250, '#0ff', 4);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 3.8: Heavy Snowfall ---
    {
        time: 105.0, // Reduced from 120.0
        action: (scene) => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || 448), -20, 5, 'spirit');
                    e.color = '#fff';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 2, Math.PI / 2, 1.0, 100, 200, '#fff', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- BOSS: Cirno ---
    {
        time: 115.0, // Reduced from 130.0
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('cirno');
            }
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "It's getting colder.", side: "left" },
                    { name: "Cirno", text: "Freeze!", side: "right" },
                    { name: "Reimu", text: "A fairy? I don't have time for this.", side: "left" },
                    { name: "Cirno", text: "I'm the strongest!", side: "right" }
                ];
            } else if (character === 'Marisa') {
                lines = [
                    { name: "Marisa", text: "Brrr... it's freezing here.", side: "left" },
                    { name: "Cirno", text: "I'm the strongest!", side: "right" },
                    { name: "Marisa", text: "Strongest at being an ice cube?", side: "left" }
                ];
            } else if (character === 'Remilia') {
                lines = [
                    { name: "Remilia", text: "The mist over the lake is quite thick today.", side: "left" },
                    { name: "Cirno", text: "I'm the strongest!", side: "right" },
                    { name: "Remilia", text: "Strongest? How amusing. Show me your strength, little fairy.", side: "left" }
                ];
            } else if (character === 'Flandre') {
                lines = [
                    { name: "Flandre", text: "Ooh, ice! Can I break it?", side: "left" },
                    { name: "Cirno", text: "I'm the strongest!", side: "right" },
                    { name: "Flandre", text: "Strongest? Does that mean you won't break easily? Let's play!", side: "left" }
                ];
            } else {
                // Sakuya and others
                lines = [
                    { name: "Sakuya", text: "The temperature has dropped significantly.", side: "left" },
                    { name: "Cirno", text: "I'm the strongest!", side: "right" },
                    { name: "Sakuya", text: "I see. How... quaint.", side: "left" }
                ];
            }
            scene.dialogueManager.startDialogue(lines);
        }
    },
    {
        time: 116.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const cirno = new Boss(scene.game, centerX, -50, "Cirno");
                cirno.color = '#00f';

                // Phase 1: Non-spell
                cirno.addPhase(600, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 50;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 15 === 0) {
                        const angle = Math.random() * Math.PI * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 200, Math.sin(angle) * 200, '#0ff', 3); // Cyan
                    }
                });

                // Phase 2: Icicle Fall (Spread) - Nerfed
                cirno.addPhase(600, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t) * 100;
                    enemy.y = 100;

                    if (Math.floor(t * 10) % 8 === 0) { // Slower spawn rate (was 6)
                        const angle = Math.PI / 2 + Math.sin(t * 5) * 0.5;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 200, Math.sin(angle) * 200, '#ff0', 4); // Yellow
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + 0.2) * 200, Math.sin(angle + 0.2) * 200, '#fff', 4); // White
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle - 0.2) * 200, Math.sin(angle - 0.2) * 200, '#0ff', 4); // Cyan
                    }
                }, "Ice Sign 'Icicle Fall'");

                // Phase 3: Non-spell
                cirno.addPhase(600, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 8 === 0) { // Was 5
                        const angle = t * 3;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 200, Math.sin(angle) * 200, '#fff', 3); // White
                    }
                });

                // Phase 4: Spell Card "Perfect Freeze"
                cirno.addPhase(1000, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 90 === 0) {
                        for (let k = 0; k < 24; k++) { // Was 36
                            const angle = (k / 24) * Math.PI * 2 + t;
                            const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                            const color = colors[k % colors.length];
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 150, Math.sin(angle) * 150, color, 5); // Rainbow
                        }
                    }
                    if (Math.floor(t * 60) % 10 === 0) { // Was 5
                        const angle = Math.random() * Math.PI * 2;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 80, Math.sin(angle) * 80, '#0ff', 3); // Cyan
                    }
                }, "Ice Sign 'Perfect Freeze'");

                // Phase 5: "Diamond Blizzard"
                cirno.addPhase(1200, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.cos(t) * 50;
                    enemy.y = 120 + Math.sin(t) * 20;

                    if (Math.floor(t * 60) % 6 === 0) { // Was 4
                        const angle = t * 3;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#fff', 4); // White
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + Math.PI) * 300, Math.sin(angle + Math.PI) * 300, '#00f', 4); // Blue
                    }
                }, "Snow Sign 'Diamond Blizzard'");

                cirno.start();
                scene.enemies.push(cirno);
            });
        }
    }
];
