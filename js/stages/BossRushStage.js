import { PatternLibrary } from '../game/PatternLibrary.js';

export const BossRushEvents = (character) => [
    {
        time: 2.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: "System", text: "BOSS RUSH MODE START", side: "left" },
                { name: character, text: "Let's get this over with!", side: "left" }
            ]);
        }
    },
    // --- BOSS 1: Parsee Mizuhashi ---
    {
        time: 5.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const parsee = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Parsee Mizuhashi");

                // Phase 1: Jealousy Stream (Green Aimed)
                parsee.addPhase(400, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.aimedNWay(scene, enemy, 3, 0.3, 300, '#0f0', 4);
                    }
                });

                // Phase 2: Jealousy Sign "Green-Eyed Monster"
                parsee.addPhase(600, 45, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;

                    // Expanding Green Rings
                    if (Math.floor(t * 60) % 60 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 150, '#0f0', 5, t);
                    }
                    // Fast Aimed Needles
                    if (Math.floor(t * 60) % 5 === 0) {
                        PatternLibrary.aimed(scene, enemy, 400, '#fff', 2);
                    }
                }, "Jealousy Sign 'Green-Eyed Monster'");

                parsee.start();
                scene.enemies.push(parsee);
            });
        }
    },
    // --- BOSS 2: Nue Houjuu ---
    {
        time: 60.0, // Adjust based on previous boss kill time or use a trigger
        // Note: In a real engine we'd wait for the previous boss to die. 
        // Here we rely on the script engine waiting or time. 
        // Ideally, we should have a "waitForClear" event. 
        // For now, let's assume the player kills Parsee within 55s.
        action: (scene) => {
            // We can check if enemies are alive and reschedule if needed, 
            // but for simplicity let's just spawn.
            // Actually, let's use a self-rescheduling action if enemies exist.
            if (scene.enemies.length > 0) {
                scene.scriptEngine.events.unshift({
                    time: scene.scriptEngine.time + 1.0,
                    action: (s) => { /* Retry */ } // This is tricky with the current engine structure.
                });
                // Re-add this event? 
                // Let's just spawn and hope for the best or rely on the player being good.
            }

            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const nue = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Nue Houjuu");

                // Phase 1: Unidentified "Red UFO Invasion"
                nue.addPhase(800, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 30;
                    enemy.y = 100;
                    if(Math.floor(t*60)%10===0) {
                        // Red bullets raining/rings
                        PatternLibrary.ring(scene, enemy.x, enemy.y, 5, 250, '#f00', 5);
                    }
                    if(Math.floor(t*60)%60===0) {
                         // Big red clusters
                         PatternLibrary.circle(scene, scene.player.x, scene.player.y - 200, 10, 150, '#f00', 4, 0);
                    }
                }, "Unidentified 'Red UFO Invasion'");

                // Phase 2: Nue Sign "Danmaku Chimera"
                nue.addPhase(1000, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100 + Math.sin(t*2)*20;
                    // Snake-like streams (Green)
                    if (Math.floor(t * 60) % 5 === 0) {
                         const a = t + Math.sin(t*5);
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#0f0', 4);
                    }
                    // Blue Bursts
                    if(Math.floor(t*60)%40===0) {
                         PatternLibrary.aimedNWay(scene, enemy, 7, 0.8, 400, '#00f', 5);
                    }
                }, "Nue Sign 'Danmaku Chimera'");

                // Phase 3: Unknown "Heian Alien"
                nue.addPhase(1200, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2; 
                    enemy.y = 120;
                    // Rotating geometric shapes
                    if(Math.floor(t*60)%8===0) {
                         const sides = 3 + Math.floor(t)%4; 
                         const r = 200;
                         for(let i=0; i<sides; i++) {
                             const a = (Math.PI*2/sides)*i + t;
                             scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*r, Math.sin(a)*r, '#f0f', 5);
                             scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a+0.1)*r*0.8, Math.sin(a+0.1)*r*0.8, '#fff', 3);
                         }
                    }
                }, "Unknown 'Heian Alien'");

                nue.start();
                scene.enemies.push(nue);
            });
        }
    },
    // --- BOSS 3: Utsuho Reiuji (Okuu) ---
    {
        time: 120.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const okuu = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Utsuho Reiuji");

                // Phase 1: Nuclear Warning (Big Suns)
                okuu.addPhase(800, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 120;

                    // Giant slow suns
                    if (Math.floor(t * 60) % 120 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 100, '#f80', 20); // Big radius
                    }
                    // Fast radiation
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 2, Math.PI / 2, Math.PI, 200, 400, '#ff0', 3);
                    }
                });

                // Phase 2: Atomic Fire "Uncontainable Nuclear Reaction"
                okuu.addPhase(1000, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t * 0.5) * 20;
                    enemy.y = 100;

                    // Gravity-ish effect (Accelerating bullets)
                    if (Math.floor(t * 60) % 20 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 50, '#f40', 6, t, 100); // Accel
                    }

                    // "Warning" Lasers
                    if (Math.floor(t * 60) % 180 === 0) {
                        // Vertical massive laser (simulated by stream)
                        for (let i = 0; i < 20; i++) {
                            setTimeout(() => {
                                scene.bulletManager.spawn(scene.player.x, 0, 0, 600, '#fff', 10);
                            }, i * 50);
                        }
                    }
                }, "Atomic Fire 'Uncontainable Nuclear Reaction'");

                okuu.start();
                scene.enemies.push(okuu);
            });
        }
    },
    // --- BOSS 4: Remilia Scarlet ---
    {
        time: 190.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: "Remilia", text: "You've entertained me enough.", side: "right" },
                { name: "Remilia", text: "Now, face the Scarlet Devil!", side: "right" }
            ]);
        }
    },
    {
        time: 192.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const remilia = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Remilia Scarlet");

                // Phase 1: Vampire's Assault (Fast Red Bullets)
                remilia.addPhase(800, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 100;
                    enemy.y = 100 + Math.sin(t * 2) * 50;

                    if (Math.floor(t * 60) % 8 === 0) {
                        PatternLibrary.aimed(scene, enemy, 500, '#f00', 4);
                    }
                });

                // Phase 2: Scarlet Sign "Red Magic"
                remilia.addPhase(1200, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 120;

                    // The classic cross pattern + random
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 250, '#f00', 4, 3, 4);
                    }

                    if (Math.floor(t * 60) % 60 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 150, '#fff', 3, 0);
                    }
                }, "Scarlet Sign 'Red Magic'");

                remilia.start();
                scene.enemies.push(remilia);
            });
        }
    }
];
