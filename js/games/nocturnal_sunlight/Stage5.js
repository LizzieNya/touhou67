import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage5Events = (character) => {
    const dialogues = {
        'Reimu': [
            { name: "Reimu", text: "Time feels distorted here.", side: "left" },
            { name: "Reimu", text: "Is this another Imperishable Night incident? Who's stopping time?", side: "left" }
        ],
        'Marisa': [
            { name: "Marisa", text: "My watch is going backwards.", side: "left" },
            { name: "Marisa", text: "Is Sakuya playing pranks? Or Kaguya?", side: "left" }
        ],
        'Sakuya': [
            { name: "Sakuya", text: "The flow of time is... wrong.", side: "left" },
            { name: "Sakuya", text: "It's not stopped like the endless night. It's... broken.", side: "left" }
        ],
        'Youmu': [
            { name: "Youmu", text: "Everything is moving in slow motion.", side: "left" },
            { name: "Youmu", text: "Is this a time spell?", side: "left" }
        ],
        'Sanae': [
            { name: "Sanae", text: "Is this time travel? Can I see the dinosaurs?", side: "left" },
            { name: "Sanae", text: "Wait, focus! Incident first, dinosaurs later.", side: "left" }
        ]
    };

    const bossDialogues = {
        'Reimu': [
            { name: "Chronos", text: "Time is but a river.", side: "right" },
            { name: "Reimu", text: "And you're damming it up. Are you trying to make the night eternal?", side: "left" },
            { name: "Chronos", text: "Eternity is a human concept. I seek the End.", side: "right" }
        ],
        'Marisa': [
            { name: "Chronos", text: "You rush towards your end.", side: "right" },
            { name: "Marisa", text: "Stopping time is Sakuya's trick. Get your own!", side: "left" },
            { name: "Chronos", text: "I do not stop time. I *am* time.", side: "right" }
        ],
        'Sakuya': [
            { name: "Chronos", text: "A fellow weaver of time.", side: "right" },
            { name: "Sakuya", text: "Are you trying to create an endless night again?", side: "left" },
            { name: "Chronos", text: "Endless night? No. I seek the End of Time.", side: "right" }
        ],
        'Youmu': [
            { name: "Chronos", text: "Your blade cannot cut the seconds.", side: "right" },
            { name: "Youmu", text: "I will cut through the present to reach the future!", side: "left" }
        ],
        'Sanae': [
            { name: "Chronos", text: "A miracle cannot reverse time.", side: "right" },
            { name: "Sanae", text: "Maybe not, but it can defeat you!", side: "left" }
        ]
    };

    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('ns_stage5');
                }
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Stage 5: The Time Vortex", side: "left" },
                    ...dialogues[character] || dialogues['Reimu']
                ]);
            }
        },
        // Wave 1: Clockwork Fairies (frozen in mansion time)
        {
            time: 2.0,
            action: (scene) => {
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 15, 15, 'kedama');
                        e.color = '#aa0'; // Gold/Bronze
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                            // Stop and go movement
                            if (Math.floor(t) % 2 === 0) {
                                enemy.y += 0;
                            } else {
                                enemy.y += 200 * dt;
                            }
                            if (Math.floor(t * 60) % 60 === 0) {
                                PatternLibrary.aimed(scene, enemy, 250, '#ff0', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 400);
                }
            }
        },
        // Midboss: Chronos
        {
            time: 12.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const chronos = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Chronos");
                    chronos.color = '#008';

                    chronos.addPhase(800, 35, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 20 === 0) {
                            // Slow bullets
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 12, 100, '#00f', 3, t);
                        }
                    }, "Time Sign 'Slow Motion'");

                    chronos.start();
                    scene.enemies.push(chronos);
                });
            }
        },
        // Wave 3: Shadow Bats (New)
        {
            time: 25.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { ShadowBat } = module;
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => {
                            const e = new ShadowBat(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            e.color = '#aa0'; // Gold tint
                            scene.enemies.push(e);
                        }, i * 300);
                    }
                });
            }
        },
        // Wave 4: Moon Spirits (New)
        {
            time: 35.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { MoonSpirit } = module;
                    for (let i = 0; i < 15; i++) {
                        setTimeout(() => {
                            const e = new MoonSpirit(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            e.color = '#fff';
                            scene.enemies.push(e);
                        }, i * 250);
                    }
                });
            }
        },
        // Wave 5: Time Spirits (Old Wave 2)
        {
            time: 50.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#aaa'; // Silver
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 80 * dt;
                            enemy.x += Math.cos(t * 3) * 50 * dt;
                            if (Math.floor(t * 60) % 40 === 0) {
                                PatternLibrary.aimedNWay(scene, enemy, 3, 0.2, 200, '#fff', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Wave 6: Clockwork Fairies Swarm (New)
        {
            time: 58.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'kedama');
                        e.color = '#aa0';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                            enemy.y += 150 * dt;
                            if (Math.floor(t * 60) % 30 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 8, 200, '#ff0', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 250);
                }
            }
        },
        // Boss: Chronos
        {
            time: 70.0,
            action: (scene) => {
                scene.dialogueManager.startDialogue(bossDialogues[character] || bossDialogues['Reimu']);
            }
        },
        {
            time: 72.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const chronos = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Chronos");
                    chronos.color = '#008';

                    // Phase 1: Time Sign "Clock Stopper"
                    chronos.addPhase(1000, 45, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        // Stop-start bullets
                        if (Math.floor(t * 60) % 5 === 0) {
                            const a = t * 5;
                            const speed = (Math.floor(t) % 2 === 0) ? 50 : 400; // Alternating speed
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * speed, Math.sin(a) * speed, '#00f', 3);
                        }
                    }, "Time Sign 'Clock Stopper'");

                    // Phase 2: Delay Sign "Afterimage"
                    chronos.addPhase(1200, 50, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 150;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 10 === 0) {
                            // Trail of bullets
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 100, '#aaa', 3);
                            scene.bulletManager.spawn(enemy.x - 20, enemy.y, 0, 100, '#aaa', 3);
                            scene.bulletManager.spawn(enemy.x + 20, enemy.y, 0, 100, '#aaa', 3);
                        }
                    }, "Delay Sign 'Afterimage'");

                    // Phase 3: Chronos "End of Time"
                    chronos.addPhase(1500, 60, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 120;
                        // Clock hands sweep
                        const hands = 4;
                        const speed = 200;
                        if (Math.floor(t * 60) % 2 === 0) {
                            for (let i = 0; i < hands; i++) {
                                const a = t + (i * Math.PI * 2 / hands);
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * speed, Math.sin(a) * speed, '#fff', 4);
                            }
                        }
                        // Reverse sweep
                        if (Math.floor(t * 60) % 2 === 0) {
                            for (let i = 0; i < hands; i++) {
                                const a = -t + (i * Math.PI * 2 / hands);
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * speed, Math.sin(a) * speed, '#00f', 4);
                            }
                        }
                    }, "Chronos 'End of Time'");

                    chronos.start();
                    scene.enemies.push(chronos);
                });
            }
        }
    ];
};
