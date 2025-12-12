import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage3Events = (character) => {
    const dialogues = {
        'Reimu': [
            { name: "Reimu", text: "The moon is gone completely.", side: "left" },
            { name: "Reimu", text: "Is this Eirin's doing again? Hiding the moon?", side: "left" }
        ],
        'Marisa': [
            { name: "Marisa", text: "Who turned out the lights?", side: "left" },
            { name: "Marisa", text: "Is the moon fake again? Or just gone?", side: "left" }
        ],
        'Sakuya': [
            { name: "Sakuya", text: "A lunar eclipse... but unnatural.", side: "left" },
            { name: "Sakuya", text: "This feels different from the Imperishable Night.", side: "left" }
        ],
        'Youmu': [
            { name: "Youmu", text: "The boundary between life and death is thin here.", side: "left" },
            { name: "Youmu", text: "The moon is missing, but time flows.", side: "left" }
        ],
        'Sanae': [
            { name: "Sanae", text: "It's spooky! But I'm not scared!", side: "left" },
            { name: "Sanae", text: "I have the power of miracles on my side!", side: "left" }
        ]
    };

    const bossDialogues = {
        'Reimu': [
            { name: "Eclipse", text: "The sun is gone. The moon is gone. Only the void remains.", side: "right" },
            { name: "Reimu", text: "So you're not hiding the moon? You just erased it?", side: "left" },
            { name: "Eclipse", text: "I did not hide it. I consumed it.", side: "right" }
        ],
        'Marisa': [
            { name: "Eclipse", text: "Do you fear the dark?", side: "right" },
            { name: "Marisa", text: "I've seen fake moons and endless nights. This is nothing!", side: "left" },
            { name: "Eclipse", text: "This is not a trick. This is the end.", side: "right" }
        ],
        'Sakuya': [
            { name: "Eclipse", text: "Time stops in the void.", side: "right" },
            { name: "Sakuya", text: "We stopped the night once. We can handle a little darkness.", side: "left" },
            { name: "Eclipse", text: "You stopped time. I devour space.", side: "right" }
        ],
        'Youmu': [
            { name: "Eclipse", text: "Your sword cannot cut what is not there.", side: "right" },
            { name: "Youmu", text: "I will cut through your emptiness!", side: "left" }
        ],
        'Sanae': [
            { name: "Eclipse", text: "Faith is meaningless in the dark.", side: "right" },
            { name: "Sanae", text: "My faith shines brighter than any sun!", side: "left" }
        ]
    };

    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('ns_stage3');
                }
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Stage 3: The Black Moon", side: "left" },
                    ...dialogues[character] || dialogues['Reimu']
                ]);
            }
        },
        // Wave 1: Void Wisps
        {
            time: 2.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#200'; // Dark Red
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 120 * dt;
                            enemy.x += Math.cos(t * 5) * 20 * dt;
                            if (Math.floor(t * 60) % 20 === 0) {
                                PatternLibrary.aimed(scene, enemy, 350, '#f00', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 200);
                }
            }
        },
        // Wave 2: Shadow Fairies
        {
            time: 8.0,
            action: (scene) => {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'kedama');
                        e.color = '#000';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                            if (Math.floor(t * 60) % 30 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 8, 200, '#800', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Midboss: Eclipse
        {
            time: 15.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const eclipse = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Eclipse");
                    eclipse.color = '#000';

                    eclipse.addPhase(800, 35, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 10 === 0) {
                            // Expanding darkness ring
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 16, 200, '#f00', 3, t);
                        }
                    }, "Void Sign 'Black Hole'");

                    eclipse.start();
                    scene.enemies.push(eclipse);
                });
            }
        },
        // Wave 3: Moon Spirits (New)
        {
            time: 25.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { MoonSpirit } = module;
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => {
                            const e = new MoonSpirit(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 400);
                    }
                });
            }
        },
        // Wave 4: Shadow Bats (New)
        {
            time: 32.0,
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
        // Wave 5: Chaos Spirits (Old Wave 3)
        {
            time: 45.0,
            action: (scene) => {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#f0f';
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 100 * dt;
                            enemy.x += Math.sin(t * 3) * 100 * dt;
                            if (Math.floor(t * 60) % 15 === 0) {
                                PatternLibrary.aimed(scene, enemy, 300, '#f0f', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 200);
                }
            }
        },
        // Wave 6: Void Wisps Swarm (New)
        {
            time: 52.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'spirit');
                        e.color = '#200';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                            enemy.y += 50 * dt;
                            if (Math.floor(t * 60) % 20 === 0) {
                                PatternLibrary.aimed(scene, enemy, 350, '#f00', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Boss: Eclipse
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
                    const Boss = module.default;
                    const eclipse = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Eclipse");
                    eclipse.color = '#000';

                    // Phase 1: Void Sign "Event Horizon"
                    eclipse.addPhase(1000, 40, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 5 === 0) {
                            // Spiral in/out
                            const a = t * 4;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#f00', 3);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a) * 300, Math.sin(-a) * 300, '#000', 3);
                        }
                    }, "Void Sign 'Event Horizon'");

                    // Phase 2: Gravity Sign "Singularity"
                    eclipse.addPhase(1100, 45, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 60;
                        enemy.y = 120;

                        // Swirling vortex (gravity well - NOT scarlet!)
                        if (Math.floor(t * 60) % 25 === 0) {
                            // Spiral vortex
                            for (let arm = 0; arm < 8; arm++) {
                                const baseAngle = (arm / 8) * Math.PI * 2;
                                for (let b = 0; b < 3; b++) {
                                    const bulletSpeed = 250 * (0.5 + b * 0.1);
                                    setTimeout(() => {
                                        const spiralAngle = baseAngle + b * 0.3;
                                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(spiralAngle) * bulletSpeed, Math.sin(spiralAngle) * bulletSpeed, '#800', 3);
                                    }, b * 100);
                                }
                            }
                        }
                        // Gravity pulls (aimed at player)
                        if (Math.floor(t * 60) % 15 === 0) {
                            PatternLibrary.aimed(scene, enemy, 380, '#000', 4);
                        }
                    }, "Gravity Sign 'Singularity'");

                    // Phase 3: Eclipse "Total Darkness"
                    eclipse.addPhase(1200, 50, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                        enemy.y = 120;
                        if (Math.floor(t * 60) % 20 === 0) {
                            // Screen fill
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 30, 250, '#800', 3);
                        }
                        if (Math.floor(t * 60) % 5 === 0) {
                            PatternLibrary.aimed(scene, enemy, 400, '#f00', 4);
                        }
                    }, "Eclipse 'Total Darkness'");

                    // Phase 4: Abyss "Falling Stars"
                    eclipse.addPhase(1300, 55, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;

                        // Stars being sucked into black hole
                        if (Math.floor(t * 60) % 8 === 0) {
                            // Ring that contracts (simulate with decreasing speed)
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 16, 300 - (t % 3) * 80, '#ff0', 3, t);
                        }
                        // Chaotic night pattern
                        if (Math.floor(t * 60) % 35 === 0) {
                            PatternLibrary.chaoticNight(scene, enemy.x, enemy.y, 6, 3, 100, 280, '#f0f', 3);
                        }
                    }, "Abyss 'Falling Stars'");

                    // Phase 5: Chaos "Red Moon" (FINAL)
                    eclipse.addPhase(1500, 60, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        // Blood rain
                        if (Math.floor(t * 60) % 2 === 0) {
                            const rx = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                            scene.bulletManager.spawn(rx, 0, 0, 300 + Math.random() * 200, '#f00', 3);
                        }
                        // Moon beams
                        if (Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 5, 0.5, 300, '#fff', 4);
                        }
                        // Void claws (twin converging beams - NOT vampire!)
                        if (Math.floor(t * 60) % 45 === 0) {
                            const aimAngle = PatternLibrary.getAngleToPlayer(enemy, scene.player);
                            // Twin beams
                            for (let i = 0; i < 5; i++) {
                                setTimeout(() => {
                                    scene.bulletManager.spawn(enemy.x - 20, enemy.y, Math.cos(aimAngle - 0.3) * 320, Math.sin(aimAngle - 0.3) * 320, '#800', 4);
                                    scene.bulletManager.spawn(enemy.x + 20, enemy.y, Math.cos(aimAngle + 0.3) * 320, Math.sin(aimAngle + 0.3) * 320, '#800', 4);
                                }, i * 50);
                            }
                        }
                    }, "Chaos 'Red Moon'");

                    eclipse.start();
                    scene.enemies.push(eclipse);
                });
            }
        }
    ];
};
