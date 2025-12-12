import Enemy from '../../game/Enemy.js';
import { PatternLibrary } from '../../game/PatternLibrary.js';

export const Stage4Events = (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                scene.game.soundManager.playBossTheme('th7_stage4');
            }
            scene.dialogueManager.startDialogue([
                { name: "System", text: "Stage 4: Phantasmagoria of Flower View... wait wrong game.", side: "left" },
                { name: "System", text: "Stage 4: Above the Clouds", side: "left" }
            ]);
        }
    },
    // Wave 1: Spirits
    {
        time: 2.0,
        action: (scene) => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const e = new Enemy(scene.game, Math.random() * (scene.game.playAreaWidth || scene.game.width), -20, 15, 'spirit');
                    e.color = '#f0f';
                    e.setPattern((enemy, dt, t) => {
                        enemy.y += 100 * dt;
                        enemy.x += Math.sin(t * 3) * 100 * dt;
                        if (Math.floor(t * 60) % 40 === 0) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#f0f', 3);
                        }
                    });
                    scene.enemies.push(e);
                }, i * 200);
            }
        }
    },
    // Midboss: Merlin Prismriver
    {
        time: 15.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                const merlin = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Merlin Prismriver");
                merlin.color = '#faa'; // Pinkish

                merlin.addPhase(800, 30, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.sin(t) * 100;
                    enemy.y = 100;

                    if (Math.floor(t * 60) % 10 === 0) {
                        // Wavy trumpet blasts
                        for (let k = -2; k <= 2; k++) {
                            scene.bulletManager.spawn(enemy.x, enemy.y, k * 50 + Math.sin(t * 5) * 50, 300, '#faa', 4);
                        }
                    }
                }, "Trumpet Sign 'Hino Phantasm'");

                merlin.start();
                scene.enemies.push(merlin);
            });
        }
    },
    // Boss: Prismriver Sisters
    {
        time: 60.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: character, text: "That noise is annoying.", side: "left" },
                { name: "Lunasa", text: "Noise? This is a performance!", side: "right" }
            ]);
        }
    },
    {
        time: 62.0,
        action: (scene) => {
            import('../../game/Boss.js').then(module => {
                const Boss = module.default;
                // We'll simulate fighting all three by having one main boss object that spawns sub-patterns
                // or maybe we just swap sprites/names? Let's stick to Lunasa as the main health bar for now.
                const sisters = new Boss(scene.game, (scene.game.playAreaWidth || scene.game.width) / 2, -50, "Prismriver Sisters");
                sisters.color = '#fff';

                // Phase 1: Lunasa (Violin) - Solo
                sisters.addPhase(1000, 40, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 + Math.cos(t) * 50;
                    enemy.y = 100;
                    if (Math.floor(t * 60) % 20 === 0) {
                        PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 200, '#000', 3, 4, 20); // Black notes
                    }
                }, "Violin Sign 'Gradual Crescendo'");

                // Phase 2: Merlin (Trumpet) - High energy
                sisters.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2 - Math.sin(t) * 100;
                    enemy.y = 120;
                    if (Math.floor(t * 60) % 5 === 0) {
                        scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random() - 0.5) * 400, 300 + Math.random() * 100, '#faa', 3);
                    }
                }, "Trumpet Sign 'Ghostly March'");

                // Phase 3: Lyrica (Keyboard) - Aimed & Walls
                sisters.addPhase(1200, 50, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 80;
                    if (Math.floor(t * 60) % 60 === 0) {
                        // Wall
                        for (let k = 0; k < 10; k++) {
                            scene.bulletManager.spawn(k * ((scene.game.playAreaWidth || scene.game.width) / 10), 0, 0, 200, '#f00', 4);
                        }
                    }
                    if (Math.floor(t * 60) % 30 === 0) {
                        PatternLibrary.aimed(scene, enemy, 300, '#f00', 3);
                    }
                }, "Keyboard Sign 'Fazioli Netherworld'");

                // Phase 4: Ensemble
                sisters.addPhase(1500, 60, (enemy, dt, t) => {
                    enemy.x = (scene.game.playAreaWidth || scene.game.width) / 2;
                    enemy.y = 100;
                    // Chaos
                    if (Math.floor(t * 60) % 10 === 0) {
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 5, 200, '#fff', 3, t);
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 5, 250, '#faa', 3, -t);
                        PatternLibrary.circle(scene, enemy.x, enemy.y, 5, 300, '#f00', 3, t + Math.PI / 2);
                    }
                }, "Funeral Concert 'Prismriver Concerto'");

                sisters.start();
                scene.enemies.push(sisters);
            });
        }
    }
];
