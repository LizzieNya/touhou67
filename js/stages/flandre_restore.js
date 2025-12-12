
// --- REPLACEMENT FLANDRE EVENTS ---
export const BossFlandreEvents = createBossStage("Flandre Scarlet", null, [
    {
        // Non-spell 1
        hp: 1500, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2 + Math.sin(t)*50; enemy.y = 100;
            if (Math.floor(t * 60) % 5 === 0) {
                const a = t * 3;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#f00', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a+Math.PI) * 300, Math.sin(a+Math.PI) * 300, '#f00', 4);
            }
        }
    },
    {
        // Taboo "Cranberry Trap"
        hp: 2000, duration: 60, spellName: "Taboo 'Cranberry Trap'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2; enemy.y = 120;
            
            // Circles appear and collapse? 
            // Simplified: Alternating waves of aimed vs static pattern
            if (Math.floor(t * 60) % 60 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 250, '#f00', 5, t);
            }
            if (Math.floor(t * 60) % 60 === 30) {
                // Aimed blue wave
                PatternLibrary.aimedNWay(scene, enemy, 10, 0.1, 300, '#00f', 4);
            }
        }
    },
    {
        // Taboo "Laevateinn"
        hp: 2500, duration: 60, spellName: "Taboo 'Laevateinn'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2; enemy.y = 150;
            
            // The sword sweep
            if (Math.floor(t * 60) % 2 === 0) {
                const sweepSpeed = 0.5;
                const angle = Math.sin(t * sweepSpeed) * Math.PI; // Sweep back and forth
                
                // Beam-like line
                for(let i=0; i<10; i++) {
                     const speed = 200 + i*50;
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*speed, Math.sin(angle)*speed, '#f00', 8);
                }
            }
            // Falling embers
            if (Math.floor(t * 60) % 5 === 0) {
                scene.bulletManager.spawn(Math.random()*w, -20, 0, 150, '#f80', 3);
            }
        }
    },
    {
        // Taboo "Four of a Kind"
        hp: 3000, duration: 70, spellName: "Taboo 'Four of a Kind'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            
            // 4 Emitters simulating clones
            const offsets = [
                {x: w/2, y: 100},
                {x: w/2 - 80, y: 100},
                {x: w/2 + 80, y: 100},
                {x: w/2, y: 160}
            ];
            
            if (Math.floor(t * 60) % 5 === 0) {
                offsets.forEach(off => {
                     const a = t * 4;
                     scene.bulletManager.spawn(off.x, off.y, Math.cos(a)*200, Math.sin(a)*200, '#f00', 3);
                });
            }
            
            // Aimed shots from clones
            if (Math.floor(t * 60) % 60 === 0) {
                offsets.forEach(off => {
                    const angle = Math.atan2(scene.player.y - off.y, scene.player.x - off.x);
                    scene.bulletManager.spawn(off.x, off.y, Math.cos(angle)*300, Math.sin(angle)*300, '#f00', 4);
                });
            }
        }
    },
    {
        // Taboo "Kagome, Kagome"
        hp: 2500, duration: 60, spellName: "Taboo 'Kagome, Kagome'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth || scene.game.width)/2; 
            enemy.y = 150;
            
            // Green mesh pattern
            if (Math.floor(t * 60) % 10 === 0) {
                for(let i=0; i<6; i++) {
                    const a = (i/6)*Math.PI*2 + t*0.5;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#0f0', 4);
                }
            }
            // "笼" (Cage) falling from top
             if (Math.floor(t * 60) % 30 === 0) {
                 const x = Math.random() * (scene.game.playAreaWidth || scene.game.width);
                 scene.bulletManager.spawn(x, -20, 0, 150, '#cfc', 5);
             }
        }
    },
    {
        // Taboo "Maze of Love"
        hp: 2800, duration: 60, spellName: "Taboo 'Maze of Love'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth || scene.game.width)/2; 
            enemy.y = 100;
            
            // Spinning ring with gaps
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 2; // Spin
                // We create a circle but only spawn if angle is NOT in a gap
                // Simplified: Just 4 streams rotating
                for(let i=0; i<4; i++) {
                    const a = angle + (i/4)*Math.PI*2;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#f0f', 4);
                }
            }
        }
    },
    {
        // Forbidden Barrage "Starbow Break"
        hp: 3000, duration: 80, spellName: "Forbidden Barrage 'Starbow Break'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth || scene.game.width)/2; 
            enemy.y = 120;
            
            // Rainbow explosion
            if (Math.floor(t * 60) % 90 === 0) {
                const colors = ['#f00', '#f80', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                colors.forEach((c, idx) => {
                    // Each color is a ring or line
                    for(let i=0; i<30; i++) {
                        const a = (i/30)*Math.PI*2;
                        const speed = 150 + idx*30;
                        setTimeout(() => {
                           scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*speed, Math.sin(a)*speed, c, 5); 
                        }, idx*100);
                    }
                });
            }
        }
    },
    {
        // Forbidden Barrage "Catadioptric"
        hp: 3000, duration: 80, spellName: "Forbidden Barrage 'Catadioptric'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = w/2; enemy.y = 100;
            
            // Spawn big bullet aimed at wall
            if (Math.floor(t * 60) % 60 === 0) {
                const angle = (Math.random()*Math.PI) + Math.PI; // Downward-ish
                // Visual fake-out: We can't do true bounce easily without engine support
                // So we just spawn the result of the bounce:
                // Rain of bullets from sides
                for(let i=0; i<10; i++) {
                    const side = Math.random()>0.5 ? 0 : w;
                    const y = Math.random() * h;
                    const vx = side===0 ? 200 : -200;
                    scene.bulletManager.spawn(side, y, vx, (Math.random()-0.5)*100, '#f00', 5);
                }
                // Main shot
                PatternLibrary.aimed(scene, enemy, 400, '#fff', 10);
            }
        }
    },
    {
        // Forbidden Barrage "Counter Clock"
        hp: 3000, duration: 80, spellName: "Forbidden Barrage 'Counter Clock'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth || scene.game.width)/2; 
            enemy.y = 100;
            
            // Counter-rotating spirals
            if (Math.floor(t * 60) % 4 === 0) {
                const a1 = t * 3;
                const a2 = -t * 3;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a1)*250, Math.sin(a1)*250, '#f00', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a2)*150, Math.sin(a2)*150, '#00f', 4);
            }
        }
    },
    {
        // Secret Barrage "And Then Will There Be None?"
        hp: 4000, duration: 99, spellName: "Secret Barrage 'And Then Will There Be None?'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            
            // Invisible rotating emitters
            const timeVal = t * 0.5;
            const radius = 150;
            for(let i=0; i<4; i++) {
                const angle = timeVal + (i/4)*Math.PI*2;
                const ex = w/2 + Math.cos(angle)*radius;
                const ey = 150 + Math.sin(angle)*radius;
                
                if (Math.floor(t * 60) % 10 === 0) {
                    scene.bulletManager.spawn(ex, ey, Math.cos(angle)*100, Math.sin(angle)*100, '#f00', 3);
                    PatternLibrary.circle(scene, ex, ey, 6, 150, '#f0f', 3, t);
                }
            }
        }
    },
    {
        // Q.E.D. "Ripples of 495 Years"
        hp: 6000, duration: 120, spellName: "Q.E.D. 'Ripples of 495 Years'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2; enemy.y = 120;
            
            // Intense ripples
            if (Math.floor(t * 60) % 10 === 0) {
                // Expanding rings
                PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 200 + Math.sin(t)*50, '#f00', 4, t);
                PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 180 + Math.cos(t)*50, '#ff0', 4, -t);
            }
            // Wings shooting
             if (Math.floor(t * 60) % 5 === 0) {
                 const x1 = enemy.x - 50;
                 const x2 = enemy.x + 50;
                 scene.bulletManager.spawn(x1, enemy.y, (Math.random()-0.5)*100, 300, '#f0f', 4);
                 scene.bulletManager.spawn(x2, enemy.y, (Math.random()-0.5)*100, 300, '#f0f', 4);
             }
        }
    }
]);
