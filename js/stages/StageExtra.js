import Enemy from '../game/Enemy.js';
import { PatternLibrary } from '../game/PatternLibrary.js';

export const StageExtraEvents = (character) => [
    // --- Start Music ---
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage_extra');
            }
        }
    },
    // --- WAVE 1: Extra Fairies ---
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'maid');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 200 * dt;
                        if (Math.floor(t * 10) % 3 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#f0f', 3); // Purple
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // --- WAVE 1.5: Chaos Fairies (Random Spray) ---
    {
        time: 10.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                    e.color = '#000'; // Black/Dark
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        if (Math.floor(t * 60) % 20 === 0) {
                            PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 5, Math.PI / 2, Math.PI, 150, 300, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 400);
            }
        }
    },
    // --- MIDBOSS: Patchouli Knowledge ---
    {
        time: 20.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const patchouli = new Boss(scene.game, centerX, -50, "Patchouli Knowledge");
                patchouli.stopMusicOnDeath = false; // Midboss shouldn't stop stage music
                patchouli.color = '#a0f';

                // Phase 1: Moon Sign "Silent Selene"
                patchouli.addPhase(1500, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 10 === 0) {
                        // Dense blue/purple rain
                        const x = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                        scene.bulletManager.spawn(x, 0, 0, 300, '#00f', 3); // Blue
                        scene.bulletManager.spawn(x + 20, 0, 0, 300, '#a0f', 3); // Purple
                    }
                }, "Moon Sign 'Silent Selene'");

                patchouli.start();
                scene.enemies.push(patchouli);
            });
        }
    },
    // --- WAVE 2: Taboo Fairies ---
    {
        time: 50.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('stage_extra');
            }
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50, 20, 'maid');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                        if (Math.floor(t * 10) % 3 === 0) {
                            PatternLibrary.aimed(scene, enemy, 400, '#f00', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // --- WAVE 2.5: Clone Rush ---
    {
        time: 60.0,
        action: (scene) => {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + (i - 1.5) * 100, -20, 50, 'spirit');
                    e.color = '#f00';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 50 * dt;
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 250, '#f00', 4, t);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 1000);
            }
        }
    },
    // --- BOSS: Flandre Scarlet ---
    {
        time: 80.0,
        action: (scene) => {
            // Resume Stage Theme
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('flandre');
            }
            let lines = [];
            if (character === 'Reimu') {
                lines = [
                    { name: "Reimu", text: "Who's making all this noise?", side: "left" },
                    { name: "Flandre", text: "I want to play!", side: "right" },
                    { name: "Reimu", text: "Play time is over.", side: "left" }
                ];
            } else {
                lines = [
                    { name: "Marisa", text: "Another vampire?", side: "left" },
                    { name: "Flandre", text: "Will you play with me?", side: "right" },
                    { name: "Marisa", text: "Sure, until you drop.", side: "left" }
                ];
            }
            scene.dialogueManager.startDialogue(lines);
        }
    },
    {
        time: 81.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const flandre = new Boss(scene.game, centerX, -50, "Flandre Scarlet");
                flandre.color = '#f00';

                // Phase 1: Non-spell (Bat Swarm)
                flandre.addPhase(2000, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224) + Math.sin(t * 2) * 50;
                    enemy.y = 100 + Math.cos(t * 1.5) * 20;

                    if (Math.floor(t * 60) % 4 === 0) {
                        // High density aimed spray
                        PatternLibrary.aimedNWay(scene, enemy, 3, 0.5, 400, '#f00', 3);

                        // Random bats
                        if (Math.random() < 0.3) {
                            PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 2, Math.PI / 2, Math.PI, 200, 400, '#000', 3);
                        }
                    }
                });

                // Phase 2: Taboo "Cranberry Trap"
                flandre.addPhase(3000, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    // Authentic: Blue waves then aim red
                    const cycle = t % 4; // 4 second cycle?

                    if (Math.floor(t * 60) % 5 === 0) {
                        // Blue Spiral
                        const angle = t * 3;
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 300, Math.sin(angle) * 300, '#00f', 4);
                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + Math.PI) * 300, Math.sin(angle + Math.PI) * 300, '#00f', 4);
                    }

                    if (Math.floor(t * 60) % 15 === 0) {
                        // Red Aimed
                        PatternLibrary.aimed(scene, enemy, 450, '#f00', 5);
                    }
                }, "Taboo 'Cranberry Trap'");

                // Phase 3: Taboo "Laevateinn"
                flandre.addPhase(3000, 70, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 100;

                    // Giant Sword Swipe
                    // We simulate this by spawning a line of bullets that rotates
                    const swipeSpeed = 0.5; // Radians per second
                    const angle = Math.PI / 2 + Math.sin(t * swipeSpeed) * 2.0; // Oscillate

                    if (Math.floor(t * 60) % 2 === 0) {
                        PatternLibrary.laevateinnBeam(scene, enemy.x, enemy.y, angle, 300, 100, '#f00', 10);
                    }

                    // Additional chaos
                    if (Math.floor(t * 60) % 20 === 0) {
                        PatternLibrary.ring(scene, enemy.x, enemy.y, 20, 200, '#ff0', 3);
                    }
                }, "Taboo 'Laevateinn'");

                // Phase 4: Taboo "Four of a Kind"
                flandre.addPhase(4000, 80, (enemy, dt, t) => {
                    const cx = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    const cy = 100;
                    enemy.x = cx;
                    enemy.y = cy;

                    // 4 Virtual Sources
                    const sources = [
                        { x: cx, y: cy },
                        { x: cx - 60, y: cy + 20 },
                        { x: cx + 60, y: cy + 20 },
                        { x: cx, y: cy - 40 }
                    ];

                    if (Math.floor(t * 60) % 10 === 0) {
                        sources.forEach((s, i) => {
                            PatternLibrary.aimed(scene, s, 300 + i * 20, '#f00', 4);
                            if (Math.random() < 0.5) {
                                scene.bulletManager.spawn(s.x, s.y, (Math.random() - 0.5) * 200, 200, '#f00', 3);
                            }
                        });
                    }
                }, "Taboo 'Four of a Kind'");

                // Phase 5: Taboo "Starbow Break"
                flandre.addPhase(3000, 80, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 120;

                    if (Math.floor(t * 60) % 60 === 0) { // Every second
                        PatternLibrary.starbow(scene, enemy.x, enemy.y, 200, 4);
                    }

                    // Dangerous rain
                    if (Math.floor(t * 60) % 5 === 0) {
                        scene.bulletManager.spawn(Math.random() * (scene.game.playAreaWidth || scene.game.width), 0, 0, 300, '#fff', 2);
                    }
                }, "Taboo 'Starbow Break'");

                // Phase 6: Taboo "Kagome, Kagome"
                flandre.addPhase(3000, 90, (enemy, dt, t) => {
                    // Cage pattern
                    if (Math.floor(t * 60) % 30 === 0) {
                        // Surround player
                        PatternLibrary.ring(scene, scene.player.x, scene.player.y, 16, 0, '#0f0', 3);
                        // Note: They need to accelerate inwards? 
                        // For now, let's just create a dense web from boss
                        PatternLibrary.scarletWeb(scene, enemy.x, enemy.y, 6, 5, 200, '#0f0', 3);
                    }
                }, "Taboo 'Kagome, Kagome'");

                // Phase 7: Q.E.D. "Ripples of 495 Years"
                flandre.addPhase(5000, 100, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224);
                    enemy.y = 120;

                    if (Math.floor(t * 60) % 3 === 0) {
                        // Continuous intense ripple
                        // Use a wave effect
                        const angle = (t * 2) % (Math.PI * 2);
                        const colors = ['#f00', '#00f', '#0f0', '#ff0'];
                        const color = colors[Math.floor(t) % 4];

                        // Spawn a ring that expands
                        PatternLibrary.ring(scene, enemy.x, enemy.y, 4, 300, color, 4, angle + t);
                        PatternLibrary.ring(scene, enemy.x, enemy.y, 4, 250, color, 4, -angle - t);
                    }
                }, "Q.E.D. 'Ripples of 495 Years'");

                flandre.start();
                scene.enemies.push(flandre);
            });
        }
    }
];
