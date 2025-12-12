import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage3Events = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage3');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 3: Doll Maker of Bucuresti", side: "left" }
            ]);
        }
    },
    // Wave 1: Doll Guards (Maids)
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, 50 + i * 50, -20, 20, 'maid');
                    e.color = '#f0f'; // Purple
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 80 * dt;
                        if (Math.floor(t * 60) % 40 === 0) {
                            PatternLibrary.aimed(scene, enemy, 300, '#f0f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 300);
            }
        }
    },
    // Midboss: Alice Margatroid
    {
        time: 15.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const alice = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Alice Margatroid");
                alice.color = '#fd0'; // Blonde

                alice.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;

                    // Doll placement (simulated)
                    if (Math.floor(t * 60) % 60 === 0) {
                        // Spawn 2 helper dolls (enemies)
                        const d1 = new Enemy(scene.game, enemy.x - 50, enemy.y, 10, 'maid');
                        d1.setPattern((e, dt, t) => { e.y += 0; if (t > 5) e.active = false; }); // Stay for 5s
                        scene.enemies.push(d1);

                        const d2 = new Enemy(scene.game, enemy.x + 50, enemy.y, 10, 'maid');
                        d2.setPattern((e, dt, t) => { e.y += 0; if (t > 5) e.active = false; });
                        scene.enemies.push(d2);
                    }

                    if (Math.floor(t * 60) % 10 === 0) {
                        scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random() - 0.5) * 200, 300, '#00f', 3);
                    }
                }, "Puppeteer Sign 'Maiden's Bunraku'");

                alice.start();
                scene.enemies.push(alice);
            });
        }
    },
    // Wave 2: Lance Dolls (Fast Maids)
    {
        time: 50.0,
        action: (scene) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'maid');
                    e.color = '#00f'; // Blue
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 150 * dt;
                        if (Math.floor(t * 60) % 20 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 400, '#00f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // Boss: Alice Margatroid
    {
        time: 70.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "Are you the one behind this snow?", side: "left" },
                { name: "Alice", text: "No, but I won't let you pass.", side: "right" }
            ]);
        }
    },
    {
        time: 72.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const alice = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Alice Margatroid");
                alice.color = '#fd0';

                // Phase 1: Blue Sign "Benevolent French Dolls"
                alice.addPhase(1000, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 50;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 5 === 0) {
                        PatternLibrary.aimed(scene, enemy, 300, '#00f', 3);
                    }
                }, "Blue Sign 'Benevolent French Dolls'");

                // Phase 2: Scarlet Sign "Red-Haired Dutch Dolls"
                alice.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 20 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 200, '#f00', 3, t);
                    }
                }, "Scarlet Sign 'Red-Haired Dutch Dolls'");

                // Phase 3: Curse "Eerily Luminous Shanghai Dolls"
                alice.addPhase(1500, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 100;
                    enemy.y = 120;
                    if (Math.floor(t * 60) % 10 === 0) {
                        // Lasers (simulated)
                        for (let k = 0; k < 5; k++) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, (k - 2) * 50, 400, '#f0f', 4);
                        }
                    }
                }, "Curse 'Eerily Luminous Shanghai Dolls'");

                alice.start();
                scene.enemies.push(alice);
            });
        }
    }
];
