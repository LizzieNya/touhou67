import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage4Events = (character) => {
    const dialogues = {
        'Reimu': [
            { name: "Reimu", text: "The sky is cracking like glass.", side: "left" },
            { name: "Reimu", text: "Is the barrier breaking? No, it's just... light.", side: "left" }
        ],
        'Marisa': [
            { name: "Marisa", text: "It's like a giant mirror up there.", side: "left" },
            { name: "Marisa", text: "Hope I don't break it. Seven years bad luck.", side: "left" }
        ],
        'Sakuya': [
            { name: "Sakuya", text: "Reflections... illusions.", side: "left" },
            { name: "Sakuya", text: "Nothing is as it seems here.", side: "left" }
        ],
        'Youmu': [
            { name: "Youmu", text: "I cannot cut reflections.", side: "left" },
            { name: "Youmu", text: "But I can cut the source.", side: "left" }
        ],
        'Sanae': [
            { name: "Sanae", text: "It's so shiny! Like a disco ball!", side: "left" },
            { name: "Sanae", text: "But these lasers are dangerous!", side: "left" }
        ]
    };

    const bossDialogues = {
        'Reimu': [
            { name: "Prism", text: "I am merely reflecting the truth.", side: "right" },
            { name: "Reimu", text: "The truth is, you're in my way.", side: "left" },
            { name: "Prism", text: "Then shatter against the light!", side: "right" }
        ],
        'Marisa': [
            { name: "Prism", text: "Your magic is flashy, but lacks purity.", side: "right" },
            { name: "Marisa", text: "Purity is boring! Flashy is best!", side: "left" }
        ],
        'Sakuya': [
            { name: "Prism", text: "You throw knives at reflections.", side: "right" },
            { name: "Sakuya", text: "My knives always find their mark.", side: "left" }
        ],
        'Youmu': [
            { name: "Prism", text: "Can you cut a beam of light?", side: "right" },
            { name: "Youmu", text: "I can cut anything!", side: "left" }
        ],
        'Sanae': [
            { name: "Prism", text: "Faith is but a reflection of desire.", side: "right" },
            { name: "Sanae", text: "My faith is real! And powerful!", side: "left" }
        ]
    };

    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('ns_stage4');
                }
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Stage 4: The Shattered Sky", side: "left" },
                    ...dialogues[character] || dialogues['Reimu']
                ]);
            }
        },
        // Wave 1: Crystal Wisps (corrupted by the incident)
        {
            time: 2.0,
            action: (scene) => {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#0ff'; // Cyan
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 100 * dt;
                            enemy.x += Math.sin(t * 10) * 10 * dt; // Jittery
                            if (Math.floor(t * 60) % 30 === 0) {
                                PatternLibrary.aimed(scene, enemy, 300, '#0ff', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 200);
                }
            }
        },
        // Wave 2: Mirror Fairies (reflecting the mansion's power)
        {
            time: 8.0,
            action: (scene) => {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'kedama');
                        e.color = '#fff';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                            if (Math.floor(t * 60) % 20 === 0) {
                                PatternLibrary.aimedNWay(scene, enemy, 3, 0.3, 250, '#fff', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Midboss: Prism
        {
            time: 15.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const prism = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Prism");
                    prism.color = '#0ff';

                    prism.addPhase(800, 30, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 5 === 0) {
                            // Refracting lasers (simulated with fast bullets)
                            const a = t * 2;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 400, Math.sin(a) * 400, '#fff', 3);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a) * 400, Math.sin(-a) * 400, '#0ff', 3);
                        }
                    }, "Crystal Sign 'Refraction'");

                    prism.start();
                    scene.enemies.push(prism);
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
                            e.color = '#0ff'; // Cyan tint
                            scene.enemies.push(e);
                        }, i * 400);
                    }
                });
            }
        },
        // Wave 4: Star Kedamas (New)
        {
            time: 35.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { StarKedama } = module;
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => {
                            const e = new StarKedama(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20);
                            e.color = '#fff';
                            scene.enemies.push(e);
                        }, i * 300);
                    }
                });
            }
        },
        // Wave 5: Shard Fairies (Old Wave 3)
        {
            time: 50.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'kedama');
                        e.color = '#fff';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 150 : -150) * dt;
                            if (Math.floor(t * 60) % 20 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 6, 200, '#0ff', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Wave 6: Crystal Wisps Swarm (New)
        {
            time: 58.0,
            action: (scene) => {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                        e.color = '#0ff';
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 120 * dt;
                            enemy.x += Math.sin(t * 8) * 20 * dt;
                            if (Math.floor(t * 60) % 25 === 0) {
                                PatternLibrary.aimed(scene, enemy, 350, '#fff', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 200);
                }
            }
        },
        // Boss: Prism
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
                    const prism = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Prism");
                    prism.color = '#0ff';

                    // Phase 1: Light Sign "Prismatic Laser"
                    prism.addPhase(1000, 40, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 10 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 7, 0.5, 300, '#fff', 3);
                        }
                    }, "Light Sign 'Prismatic Laser'");

                    // Phase 2: Crystal Sign "Diamond Dust"
                    prism.addPhase(1200, 50, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;
                        if (Math.floor(t * 60) % 2 === 0) {
                            // Random spread
                            const a = Math.random() * Math.PI * 2;
                            const s = 100 + Math.random() * 200;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * s, Math.sin(a) * s, '#0ff', 3);
                        }
                    }, "Crystal Sign 'Diamond Dust'");

                    // Phase 3: Spectrum "Rainbow Road"
                    prism.addPhase(1500, 60, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 120;
                        const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                        if (Math.floor(t * 60) % 5 === 0) {
                            const c = colors[Math.floor(t) % colors.length];
                            const a = t * 3;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, c, 4);
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a + Math.PI) * 300, Math.sin(a + Math.PI) * 300, c, 4);
                        }
                    }, "Spectrum 'Rainbow Road'");

                    prism.start();
                    scene.enemies.push(prism);
                });
            }
        }
    ];
};
