import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage1Events = (character) => {
    const dialogues = {
        'Remilia': [
            { name: "Remilia", text: "The sun at midnight... This is INTOLERABLE!", side: "left" },
            { name: "Remilia", text: "I am the queen of the night. And someone has stolen MY night!", side: "left" },
            { name: "Remilia", text: "Whoever is responsible will face the wrath of the Scarlet Devil!", side: "left" }
        ],
        'Flandre': [
            { name: "Flandre", text: "Sis! Sis! The sun is out but it's nighttime!", side: "left" },
            { name: "Flandre", text: "You said I could go out at night because there's no sun...", side: "left" },
            { name: "Flandre", text: "But there IS a sun! So I'm gonna smash it to pieces! Kyuu~♪", side: "left" }
        ],
        'Sakuya': [
            { name: "Sakuya", text: "The mistress is displeased with this light.", side: "left" },
            { name: "Sakuya", text: "Vampires prefer the darkness. This is unnatural.", side: "left" },
            { name: "Sakuya", text: "I will resolve this swiftly and elegantly.", side: "left" }
        ],
        'Youmu': [
            { name: "Youmu", text: "The spirits are restless under this unnatural sun.", side: "left" },
            { name: "Youmu", text: "It is not a stopped night, but a forced day.", side: "left" },
            { name: "Youmu", text: "I must cut through this illusion!", side: "left" }
        ],
        'Sanae': [
            { name: "Sanae", text: "Is this a miracle? Or just a nuisance?", side: "left" },
            { name: "Sanae", text: "It's like the sun forgot to set!", side: "left" },
            { name: "Sanae", text: "Time to show the power of the Moriya Shrine!", side: "left" }
        ],
        'Reimu': [
            { name: "Reimu", text: "It's midnight, yet the sun is high.", side: "left" },
            { name: "Reimu", text: "Even I can't ignore this one. Too many complaints.", side: "left" },
            { name: "Reimu", text: "But this feels... hotter than usual incidents.", side: "left" }
        ],
        'Marisa': [
            { name: "Marisa", text: "Whoa, bright as day at midnight!", side: "left" },
            { name: "Marisa", text: "This'll be fun! Wonder what's causing it?", side: "left" },
            { name: "Marisa", text: "Guess I don't need a flashlight for night flying!", side: "left" }
        ]
    };

    const bossDialogues = {
        'Remilia': [
            { name: "Lumina", text: "The Scarlet Devil herself! Here in the light!", side: "right" },
            { name: "Lumina", text: "Isn't it beautiful? The night is no longer dark!", side: "right" },
            { name: "Remilia", text: "Beautiful?! This light BURNS!", side: "left" },
            { name: "Remilia", text: "You dare curse the night that belongs to ME?!", side: "left" },
            { name: "Lumina", text: "But the sun is eternal! Don't you love it?", side: "right" },
            { name: "Remilia", text: "I will END you for this insolence!", side: "left" }
        ],
        'Flandre': [
            { name: "Lumina", text: "A child of darkness, dancing in my light?", side: "right" },
            { name: "Lumina", text: "The little sister of the devil! How cute!", side: "right" },
            { name: "Flandre", text: "I'm NOT cute! I'm scary!", side: "left" },
            { name: "Flandre", text: "And your sun is RUINING my playtime!", side: "left" },
            { name: "Lumina", text: "But the sun lets us play forever!", side: "right" },
            { name: "Flandre", text: "No! Sis says vampires need the night! So I'll break your sun! KYUU~!", side: "left" }
        ],
        'Sakuya': [
            { name: "Lumina", text: "The perfect maid! Serving even in the light!", side: "right" },
            { name: "Sakuya", text: "I serve the mistress. And you are disrupting the natural order.", side: "left" },
            { name: "Sakuya", text: "Prepare to be cleaned up.", side: "left" },
            { name: "Lumina", text: "You bring a chill with you...", side: "right" }
        ],
        'Youmu': [
            { name: "Lumina", text: "A phantom? You should fear the light!", side: "right" },
            { name: "Youmu", text: "My blade reflects the moon, not this false sun.", side: "left" },
            { name: "Lumina", text: "The moon is boring! The sun is eternal!", side: "right" }
        ],
        'Sanae': [
            { name: "Lumina", text: "Are you a priestess of the sun?", side: "right" },
            { name: "Sanae", text: "I'm a wind priestess, and I'm blowing this light away!", side: "left" },
            { name: "Lumina", text: "You cannot extinguish my sun!", side: "right" }
        ],
        'Reimu': [
            { name: "Lumina", text: "The shrine maiden! You came!", side: "right" },
            { name: "Reimu", text: "Someone's got to fix this. Making it bright at night is just annoying.", side: "left" },
            { name: "Lumina", text: "Time flows! But the light remains!", side: "right" },
            { name: "Reimu", text: "Not for long.", side: "left" }
        ],
        'Marisa': [
            { name: "Lumina", text: "A visitor! Have you come to bask in the sun?", side: "right" },
            { name: "Marisa", text: "Nah, I came to turn it off! This is getting in the way of my experiments.", side: "left" },
            { name: "Lumina", text: "The moon is boring! The sun is eternal!", side: "right" },
            { name: "Marisa", text: "Yeah yeah, I've heard that before. Let's fight!", side: "left" }
        ]
    };

    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('ns_midnight'); // Nocturnal sunlight theme
                }
                scene.dialogueManager.startDialogue([
                    { name: "System", text: "Stage 1: The Sun at Midnight", side: "left" },
                    ...dialogues[character] || dialogues['Reimu']
                ]);
            }
        },
        // Wave 1: Small Spirits (Warmup)
        {
            time: 2.0,
            action: (scene) => {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (i % 2 === 0 ? 0 : (scene.game.playAreaWidth || scene.game.width)), 50 + i * 20, 15, 'spirit');
                        e.color = '#fb0';
                        e.setPattern((enemy, dt, t) => {
                            enemy.x += (i % 2 === 0 ? 100 : -100) * dt;
                            enemy.y += 50 * dt;
                            if (Math.floor(t * 60) % 60 === 0) {
                                scene.bulletManager.spawn(enemy.x, enemy.y, 0, 150, '#fb0', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 300);
                }
            }
        },
        // Wave 2: Kedama Swarm
        {
            time: 8.0,
            action: (scene) => {
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'kedama');
                        e.color = '#f00';
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 150 * dt;
                            if (Math.floor(t * 60) % 40 === 0) {
                                PatternLibrary.aimed(scene, enemy, 200, '#f00', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 200);
                }
            }
        },
        // Wave 3: Sun Fairies (New)
        {
            time: 14.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { SunFairy } = module;
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            const e = new SunFairy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 500);
                    }
                });
            }
        },
        // Wave 4: Streaming Spirits (Old Wave 3)
        {
            time: 20.0,
            action: (scene) => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const e = new Enemy(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -20, 20, 'spirit');
                        e.color = '#fff';
                        e.setPattern((enemy, dt, t) => {
                            enemy.y += 80 * dt;
                            enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t * 2) * 150;
                            if (Math.floor(t * 60) % 10 === 0) {
                                PatternLibrary.ring(scene, enemy.x, enemy.y, 5, 150, '#fff', 3);
                            }
                        });
                        scene.enemies.push(e);
                    }, i * 1000);
                }
            }
        },
        // Wave 5: Moon Spirits (New)
        {
            time: 28.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { MoonSpirit } = module;
                    for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                            const e = new MoonSpirit(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 400);
                    }
                });
            }
        },
        // Wave 6: Mixed Swarm (New)
        {
            time: 35.0,
            action: (scene) => {
                import('./NocturnalSunlightEnemies.js').then(module => {
                    const { StarKedama, ShadowBat } = module;
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => {
                            const Type = i % 2 === 0 ? StarKedama : ShadowBat;
                            const e = new Type(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20);
                            scene.enemies.push(e);
                        }, i * 300);
                    }
                });
            }
        },
        // Boss: Lumina
        {
            time: 45.0,
            action: (scene) => {
                scene.dialogueManager.startDialogue(bossDialogues[character] || bossDialogues['Reimu']);
            }
        },
        {
            time: 47.0,
            action: (scene) => {
                import('../../game/Boss.js').then(module => {
                    const Boss = module.default;
                    const boss = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Lumina");
                    boss.color = '#fb0'; // Gold

                    // Phase 1: Sun Sign "Morning Glory" (Rotating lasers/lines)
                    boss.addPhase(1000, 40, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;

                        if (Math.floor(t * 60) % 20 === 0) {
                            // Rotating lines of yellow bullets
                            const arms = 6;
                            for (let i = 0; i < arms; i++) {
                                const angle = t * 0.5 + (i * (Math.PI * 2 / arms));
                                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 250, Math.sin(angle) * 250, '#ff0', 3);
                            }
                        }
                        if (Math.floor(t * 60) % 60 === 0) {
                            PatternLibrary.aimed(scene, enemy, 300, '#fff', 3);
                        }
                    }, "Sun Sign 'Morning Glory'");

                    // Phase 2: Light Sign "Prism Ray" (Rainbow spread)
                    boss.addPhase(1200, 50, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 80;
                        enemy.y = 120;

                        if (Math.floor(t * 60) % 10 === 0) {
                            const colors = ['#f00', '#fa0', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                            const color = colors[Math.floor(t * 2) % colors.length];
                            PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 200, color, 3, t * 2);
                        }
                    }, "Light Sign 'Prism Ray'");

                    // Phase 3: Solar Sign "Prominence" (Intense heat)
                    boss.addPhase(1500, 60, (enemy, dt, t) => {
                        enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                        enemy.y = 100;

                        if (Math.floor(t * 60) % 5 === 0) {
                            // Eruptions
                            const a = Math.random() * Math.PI * 2;
                            const speed = 100 + Math.random() * 200;
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * speed, Math.sin(a) * speed, '#f00', 5); // Big red
                        }
                        if (Math.floor(t * 60) % 40 === 0) {
                            PatternLibrary.aimedNWay(scene, enemy, 5, 0.3, 300, '#fa0', 4);
                        }
                    }, "Solar Sign 'Prominence'");

                    boss.start();
                    scene.enemies.push(boss);
                });
            }
        }
    ];
};
