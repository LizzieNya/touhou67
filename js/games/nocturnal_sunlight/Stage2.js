import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage2Events = (character) => {
    const dialogues = {
        'Reimu': [
            { name: "Reimu", text: "The stars are frozen in place.", side: "left" },
            { name: "Reimu", text: "Is this another time-stop incident? Like the Imperishable Night?", side: "left" }
        ],
        'Marisa': [
            { name: "Marisa", text: "Ooh, shooting stars! Can I catch one?", side: "left" },
            { name: "Marisa", text: "Wait, are you hiding the real moon again?", side: "left" }
        ],
        'Sakuya': [
            { name: "Sakuya", text: "The night is distorted. Time feels... viscous.", side: "left" },
            { name: "Sakuya", text: "It reminds me of the spell we cast to stop the dawn.", side: "left" }
        ],
        'Youmu': [
            { name: "Youmu", text: "The moon looks strange tonight. Is it real?", side: "left" },
            { name: "Youmu", text: "I sense a strong spirit ahead.", side: "left" }
        ],
        'Sanae': [
            { name: "Sanae", text: "So many stars! It's like a planetarium.", side: "left" },
            { name: "Sanae", text: "But why aren't they moving?", side: "left" }
        ]
    };

    const bossDialogues = {
        'Reimu': [
            { name: "Midnight", text: "I am the silence. Why do you make noise?", side: "right" },
            { name: "Reimu", text: "Stop freezing the night. We need the dawn eventually.", side: "left" },
            { name: "Midnight", text: "I do not stop time. I only stop the stars.", side: "right" }
        ],
        'Marisa': [
            { name: "Midnight", text: "A noisy comet approaches.", side: "right" },
            { name: "Marisa", text: "Where's the fake moon? I know you have it!", side: "left" },
            { name: "Midnight", text: "The moon is irrelevant. The stars are eternal.", side: "right" }
        ],
        'Sakuya': [
            { name: "Midnight", text: "You manipulate time, but I am the night itself.", side: "right" },
            { name: "Sakuya", text: "Night is nothing without time. Are you mimicking our spell?", side: "left" },
            { name: "Midnight", text: "I mimic nothing. I am the stillness.", side: "right" }
        ],
        'Youmu': [
            { name: "Midnight", text: "Your blade cannot cut the darkness.", side: "right" },
            { name: "Youmu", text: "Watch me.", side: "left" }
        ],
        'Sanae': [
            { name: "Midnight", text: "A priestess of wind? You disturb the calm.", side: "right" },
            { name: "Sanae", text: "I'll blow away your darkness!", side: "left" }
        ]
    };

    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('ns_stage2');
                }
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Stage 2: The Midnight Hour", side: "left" },
                    ...dialogues[character] || dialogues['Reimu']
                ]);
            }
        },
        // Wave 1: Shadow Bats
        {
            time: 2.0,
            action: (scene) => {
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 15, 15, 'kedama');
                        e.color = '#404'; // Dark Purple
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 200 : -200) * dt;
                            enemy.y += Math.sin(t * 5) * 100 * dt; // Fast swooping
                            if (Math.floor(t * 60) % 30 === 0) {
                                PatternLibrary.aimed(scene, enemy, 300, '#f0f', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 250);
                }
            }
        },
        // Wave 2: Star Spirits
        {
            time: 6.0,
            action: (scene) => {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#ff0';
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 100 * dt;
                            if (Math.floor(t * 60) % 40 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 5, 200, '#ff0', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Midboss: Midnight
        {
            time: 12.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const midnight = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Midnight");
                    midnight.color = '#008'; // Dark Blue

                    midnight.addPhase(600, 30, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 10 === 0) {
                            // Falling stars
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 5, 200, '#ff0', 3, t);
                        }
                    }, "Star Sign 'Falling Star'");

                    midnight.start();
                    scene.enemies.push(midnight);
                });
            }
        },
        // Wave 3: Sun Fairies (New)
        {
            time: 25.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { SunFairy } = module;
                    for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                            const e = new SunFairy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 400);
                    }
                });
            }
        },
        // Wave 4: Star Kedamas (New)
        {
            time: 32.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { StarKedama } = module;
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => {
                            const e = new StarKedama(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20);
                            scene.enemies.push(e);
                        }, i * 300);
                    }
                });
            }
        },
        // Wave 5: Moon Spirits (Old Wave 3)
        {
            time: 45.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#aaf'; // Pale Blue
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 80 * dt;
                            enemy.x += Math.cos(t * 2) * 50 * dt;
                            if (Math.floor(t * 60) % 60 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 8, 150, '#aaf', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Wave 6: Shadow Bats Swarm (New)
        {
            time: 52.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { ShadowBat } = module;
                    for (let i = 0; i < 15; i++) {
                        setTimeout(() => {
                            const e = new ShadowBat(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 250);
                    }
                });
            }
        },
        // Boss: Midnight
        {
            time: 65.0,
            action: (scene) => {
                scene.dialogueManager.startDialogue(bossDialogues[character] || bossDialogues['Reimu']);
            }
        },
        {
            time: 67.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    if (scene.game.soundManager) {
                        scene.game.soundManager.playBossTheme('ns_boss2');
                    }
                    const Boss = module.default;
                    const midnight = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Midnight");
                    midnight.color = '#008';

                    // Phase 1: Night Sign "Eternal Night"
                    midnight.addPhase(800, 40, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 5 === 0) {
                            // Dense darkness
                            const a = t * 3 + Math.sin(t * 5);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 250, Math.sin(a) * 250, '#00f', 3);
                        }
                    }, "Night Sign 'Eternal Night'");

                    // Phase 2: Star Sign "Meteor Shower"
                    midnight.addPhase(1000, 50, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 150;
                        enemy.y = 80;
                        if (Math.floor(t * 60) % 3 === 0) {
                            // Rain from top
                            const rx = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                            scene.bulletManager.spawn(rx, 0, 0, 400, '#ff0', 3);
                        }
                    }, "Star Sign 'Meteor Shower'");

                    // Phase 3: Darkness Sign "Shadow Spiral"
                    midnight.addPhase(1000, 45, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t * 2) * 80;
                        enemy.y = 120;
                        if (Math.floor(t * 60) % 8 === 0) {
                            // Dark spiral (NOT crimson - darkness themed!)
                            const angle1 = t * 3;
                            const angle2 = -t * 3;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle1) * 220, Math.sin(angle1) * 220, '#008', 3);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle2) * 220, Math.sin(angle2) * 220, '#000', 3);
                        }
                        // Add some aimed shots
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 5, 0.4, 280, '#00f', 3);
                        }
                    }, "Darkness Sign 'Shadow Spiral'");

                    // Phase 4: Celestial "Starfall Waltz"
                    midnight.addPhase(1200, 55, (enemy, dt, t) => {
                        // Dance around the screen
                        const angle = t * 2;
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(angle) * 100;
                        enemy.y = 100 + Math.sin(angle * 2) * 30;

                        if (Math.floor(t * 60) % 15 === 0) {
                            // Ring of stars
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 12, 250, '#ff0', 3, t * 2);
                        }
                        if (Math.floor(t * 60) % 40 === 0) {
                            // Aimed star burst
                            PatternLibrary.aimedNWay(scene, enemy, 7, 0.8, 300, '#fff', 4);
                        }
                    }, "Celestial 'Starfall Waltz'");

                    // Phase 5: Midnight "Zero Hour" (FINAL)
                    midnight.addPhase(1500, 60, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 150;
                        // Clock hands pattern
                        const hands = 12;
                        if (Math.floor(t * 60) % 20 === 0) {
                            for (let i = 0; i < hands; i++) {
                                const a = (i / hands) * Math.PI * 2 + t;
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 200, Math.sin(a) * 200, '#fff', 4);
                            }
                        }
                        // Ticking seconds
                        if (Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 24, 300, '#f00', 3, 0);
                        }
                        // Midnight bell chimes (extra dense at zero hour)
                        if (Math.floor(t * 60) % 10 === 0) {
                            PatternLibrary.aimed(scene, enemy, 350, '#000', 4);
                        }
                    }, "Midnight 'Zero Hour'");

                    midnight.start();
                    scene.enemies.push(midnight);
                });
            }
        }
    ];
};
