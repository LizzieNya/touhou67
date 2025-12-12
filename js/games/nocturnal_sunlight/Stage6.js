import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage6Events = (character) => {
    const dialogues = {
        'Remilia': [
            { name: "Remilia", text: "At last. The source of this cursed light.", side: "left" },
            { name: "Remilia", text: "You've tormented me long enough!", side: "left" },
            { name: "Remilia", text: "The night belongs to ME! Face the Scarlet Devil!", side: "left" }
        ],
        'Flandre': [
            { name: "Flandre", text: "Found the sun maker~!", side: "left" },
            { name: "Flandre", text: "Sis is really mad, you know?", side: "left" },
            { name: "Flandre", text: "So I'm gonna destroy EVERYTHING! Four of a Kind!", side: "left" }
        ],
        'Sakuya': [
            { name: "Sakuya", text: "The duality of day and night ends here.", side: "left" },
            { name: "Sakuya", text: "The mistress demands the return of her night.", side: "left" },
            { name: "Sakuya", text: "I will restore the proper flow of time.", side: "left" }
        ],
        'Youmu': [
            { name: "Youmu", text: "I will sever the cycle.", side: "left" },
            { name: "Youmu", text: "Neither sun nor moon can stop my blade.", side: "left" }
        ],
        'Sanae': [
            { name: "Sanae", text: "For the Moriya Shrine!", side: "left" },
            { name: "Sanae", text: "I'll show you the power of a living god!", side: "left" }
        ],
        'Reimu': [
            { name: "Reimu", text: "This is it. The source of the anomaly.", side: "left" },
            { name: "Reimu", text: "Another day, another incident to resolve.", side: "left" }
        ],
        'Marisa': [
            { name: "Marisa", text: "Time to smash the sun!", side: "left" },
            { name: "Marisa", text: "And the moon. And whatever else is in my way! Ze~!", side: "left" }
        ]
    };

    const bossDialogues = {
        'Remilia': [
            { name: "Solstice", text: "The scarlet moon rises... and the crimson sun sets.", side: "right" },
            { name: "Remilia", text: "I am the QUEEN of the night! You have stolen what is MINE!", side: "left" },
            { name: "Solstice", text: "The night and day are one. You cannot have one without the other.", side: "right" },
            { name: "Remilia", text: "Then I shall take BOTH and remake them in MY image!", side: "left" },
            { name: "Solstice", text: "Ambitious vampire... Let us see if your power matches your pride!", side: "right" }
        ],
        'Flandre': [
            { name: "Solstice", text: "The destroyer of all things approaches...", side: "right" },
            { name: "Flandre", text: "Yep! That's me! The little sister nobody lets out!", side: "left" },
            { name: "Flandre", text: "But YOU let the sun out at night! That's MY time!", side: "left" },
            { name: "Solstice", text: "Can you destroy a concept, child?", side: "right" },
            { name: "Flandre", text: "I can destroy ANYTHING! Watch! KYUU~!", side: "left" }
        ],
        'Sakuya': [
            { name: "Solstice", text: "The perfect servant arrives. Time itself bows to you.", side: "right" },
            { name: "Sakuya", text: "Eternity is just a long time. And I control time.", side: "left" },
            { name: "Sakuya", text: "My mistress desires the night. I shall deliver it.", side: "left" },
            { name: "Solstice", text: "We shall see if your silver can cut through balance itself.", side: "right" }
        ],
        'Youmu': [
            { name: "Solstice", text: "Life and Death are two sides of the same coin.", side: "right" },
            { name: "Youmu", text: "And I stand on the edge, half in each world.", side: "left" },
            { name: "Solstice", text: "Then fall into the abyss.", side: "right" }
        ],
        'Sanae': [
            { name: "Solstice", text: "Do you worship the sun? Or the moon?", side: "right" },
            { name: "Sanae", text: "I worship Kanako and Suwako!", side: "left" },
            { name: "Solstice", text: "Then your gods cannot save you here.", side: "right" }
        ],
        'Reimu': [
            { name: "Solstice", text: "Welcome to the convergence, shrine maiden.", side: "right" },
            { name: "Reimu", text: "You're the one mixing day and night. That's my job to fix.", side: "left" },
            { name: "Solstice", text: "I am merely restoring balance.", side: "right" },
            { name: "Reimu", text: "Your 'balance' is giving me a headache. Let's get this over with.", side: "left" }
        ],
        'Marisa': [
            { name: "Solstice", text: "Light and Dark. Heat and Cold. Order and Chaos.", side: "right" },
            { name: "Marisa", text: "Blah blah blah. Philosophical villain speech. Let's just fight!", side: "left" },
            { name: "Solstice", text: "Impatience leads to ruin, magician.", side: "right" },
            { name: "Marisa", text: "And Master Sparks lead to VICTORY! Ze~!", side: "left" }
        ]
    };

    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('ns_eclipse'); // Final stage theme
                }
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Final Stage: The Source of Anomaly", side: "left" },
                    ...dialogues[character] || dialogues['Reimu']
                ]);
            }
        },
        // Wave 1: Chaos Spirits
        {
            time: 2.0,
            action: (scene) => {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 20, 'spirit');
                        e.color = (i % 2 === 0) ? '#f00' : '#00f'; // Red/Blue mix
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 150 * dt;
                            enemy.x += Math.sin(t * 5) * 50 * dt;
                            if (Math.floor(t * 60) % 15 === 0) {
                                PatternLibrary.aimed(scene, enemy, 300, enemy.color, 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 200);
                }
            }
        },
        // Wave 2: Dual Fairies
        {
            time: 8.0,
            action: (scene) => {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'kedama');
                        e.color = (i % 2 === 0) ? '#fff' : '#000';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                            if (Math.floor(t * 60) % 20 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 10, 250, enemy.color, 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Wave 3: Sun Fairies & Moon Spirits (New)
        {
            time: 15.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { SunFairy, MoonSpirit } = module;
                    for (let i = 0; i < 16; i++) {
                        setTimeout(() => {
                            const Type = i % 2 === 0 ? SunFairy : MoonSpirit;
                            const e = new Type(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 300);
                    }
                });
            }
        },
        // Wave 4: Shadow Bats Swarm (New)
        {
            time: 22.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { ShadowBat } = module;
                    for (let i = 0; i < 20; i++) {
                        setTimeout(() => {
                            const e = new ShadowBat(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 200);
                    }
                });
            }
        },
        // Boss: Solstice
        {
            time: 30.0,
            action: (scene) => {
                scene.dialogueManager.startDialogue(bossDialogues[character] || bossDialogues['Reimu']);
            }
        },
        {
            time: 32.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const solstice = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Solstice");
                    solstice.color = '#800080'; // Purple

                    // Phase 1: Sun Sign "Solar Flare"
                    solstice.addPhase(1000, 40, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 5 === 0) {
                            // Explosive red bullets
                            const a = t * 3;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#f00', 4);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a + Math.PI) * 300, Math.sin(a + Math.PI) * 300, '#f80', 4);
                        }
                    }, "Sun Sign 'Solar Flare'");

                    // Phase 2: Moon Sign "Lunar Tide"
                    solstice.addPhase(1200, 45, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 100;
                        enemy.y = 120;
                        if (Math.floor(t * 60) % 10 === 0) {
                            // Wavy blue streams
                            PatternLibrary.aimedNWay(scene, enemy, 5, 0.3, 250, '#00f', 3);
                        }
                    }, "Moon Sign 'Lunar Tide'");

                    // Phase 3: Twilight "Crimson Horizon"
                    solstice.addPhase(1400, 48, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t * 1.5) * 120;
                        enemy.y = 110;

                        // Solar corona waves (sun-themed, NOT blood moon!)
                        if (Math.floor(t * 60) % 40 === 0) {
                            // Cascading rings of light
                            for (let wave = 0; wave < 3; wave++) {
                                setTimeout(() => {
                                    PatternLibrary.ring(scene, enemy.x, enemy.y, 12, 280, '#f80', 3, wave * 0.5);
                                }, wave * 300);
                            }
                        }
                        // Solar beams
                        if (Math.floor(t * 60) % 30 === 0) {
                            // Focused beams aimed at player
                            for (let i = 0; i < 6; i++) {
                                const delay = i * 30;
                                setTimeout(() => {
                                    const aimAngle = PatternLibrary.getAngleToPlayer(enemy, scene.player);
                                    const spread = (Math.random() - 0.5) * 0.2;
                                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(aimAngle + spread) * 400, Math.sin(aimAngle + spread) * 400, '#f80', 4);
                                }, delay);
                            }
                        }
                    }, "Twilight 'Crimson Horizon'");

                    // Phase 4: Equinox "Perfect Balance"
                    solstice.addPhase(1500, 50, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        // Red and Blue spiral
                        if (Math.floor(t * 60) % 4 === 0) {
                            const a = t * 4;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 350, Math.sin(a) * 350, '#f00', 3);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a) * 350, Math.sin(-a) * 350, '#00f', 3);
                        }
                    }, "Equinox 'Perfect Balance'");

                    // Phase 5: Celestial "Eternal Cycle"
                    solstice.addPhase(1700, 55, (enemy, dt, t) => {
                        // Circular motion
                        const orbitAngle = t * 1.5;
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(orbitAngle) * 80;
                        enemy.y = 120 + Math.sin(orbitAngle * 2) * 20;

                        // Rotating rings (day and night)
                        if (Math.floor(t * 60) % 12 === 0) {
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 16, 270, '#ff0', 3, t * 2); // Day
                        }
                        if (Math.floor(t * 60) % 12 === 6) {
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 16, 270, '#008', 3, -t * 2); // Night
                        }
                        // Eclipse wings (light/dark duality - NOT bat wings!)
                        if (Math.floor(t * 60) % 35 === 0) {
                            const aimAngle = PatternLibrary.getAngleToPlayer(enemy, scene.player);
                            // V-shaped light/dark pattern
                            const halfN = 5;
                            for (let i = 0; i < halfN; i++) {
                                const leftAngle = aimAngle - Math.PI / 6 + (i / halfN) * (Math.PI / 6);
                                const rightAngle = aimAngle + (i / halfN) * (Math.PI / 6);
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(leftAngle) * 300, Math.sin(leftAngle) * 300, '#ff0', 4); // Light
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(rightAngle) * 300, Math.sin(rightAngle) * 300, '#008', 4); // Dark
                            }
                        }
                    }, "Celestial 'Eternal Cycle'");

                    // Phase 6: Solstice "Day and Night" (ULTIMATE FINAL)
                    solstice.addPhase(2000, 60, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 150;
                        // Massive screen covering pattern
                        if (Math.floor(t * 60) % 20 === 0) {
                            PatternLibrary.ring(scene, enemy.x, enemy.y, 20, 200, '#fff', 3); // Stars
                        }
                        if (Math.floor(t * 60) % 30 === 0) {
                            PatternLibrary.aimed(scene, enemy, 400, '#f00', 4); // Sun beams
                        }
                        // Starfall (falling lights - NOT knives!)
                        if (Math.floor(t * 60) % 25 === 0) {
                            // Stars rain down
                            for (let i = 0; i < 12; i++) {
                                const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2);
                                const s = 320 * (0.8 + Math.random() * 0.4);
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * s, Math.sin(angle) * s, '#fff', 3);
                            }
                        }
                        // FINAL DESPERATION: Celestial mandala (sun/moon web)
                        if (Math.floor(t * 60) % 50 === 0) {
                            // Radial sun/moon pattern
                            for (let arm = 0; arm < 12; arm++) {
                                const baseAngle = (arm / 12) * Math.PI * 2;
                                for (let b = 0; b < 4; b++) {
                                    const bulletSpeed = 280 * (0.5 + b * 0.1);
                                    const bulletColor = arm % 2 === 0 ? '#ff0' : '#00f'; // Alternating sun/moon
                                    setTimeout(() => {
                                        scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(baseAngle) * bulletSpeed, Math.sin(baseAngle) * bulletSpeed, bulletColor, 4);
                                    }, b * 100);
                                }
                            }
                        }
                    }, "Solstice 'Day and Night'");

                    solstice.start();
                    scene.enemies.push(solstice);
                });
            }
        }
    ];
};
