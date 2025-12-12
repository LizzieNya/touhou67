import { PatternLibrary } from '../game/PatternLibrary.js';
console.log("IndividualBossStages module loading...");

// Helper to create a single boss stage
const createBossStage = (bossName, bossClass, phases) => (character) => [
    {
        time: 0.1,
        action: (scene) => {
            if (scene.game.soundManager) {
                // Derive theme from first name (e.g. "Hong Meiling" -> "hong", mapped to "meiling")
                const themeName = bossName.split(' ')[0].toLowerCase();
                scene.game.soundManager.playBossTheme(themeName);
            }
        }
    },
    {
        time: 1.0,
        action: (scene) => {
            scene.dialogueManager.startDialogue([
                { name: "System", text: `VS ${bossName}`, side: "left" }
            ]);
        }
    },
    {
        time: 3.0,
        action: (scene) => {
            import('../game/Boss.js').then(module => {
                const Boss = module.default;
                const centerX = scene.game.playAreaWidth ? scene.game.playAreaWidth / 2 : 224;
                const boss = new Boss(scene.game, centerX, -50, bossName);

                phases.forEach(p => {
                    boss.addPhase(p.hp, p.duration, p.pattern, p.spellName);
                });

                boss.start();
                scene.enemies.push(boss);
            });
        }
    },
    {
        // Keep script running - boss death will trigger stage end
        time: 9999.0,
        action: (scene) => {
            // Do nothing - just keep script alive
        }
    }
];


// --- Boss Definitions ---

// Rumia (Stage 1 Boss - Touhou 6)
export const BossRumiaEvents = createBossStage("Rumia", null, [
    {
        hp: 600, duration: 40,
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.sin(t)*50; enemy.y = 100;
             // Basic random spray
             if(Math.floor(t*60)%10===0) {
                 scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random()-0.5)*200, 200, '#fff', 3);
             }
        }
    },
    {
        hp: 800, duration: 50, spellName: "Moon Sign 'Moonlight Ray'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             const w = (scene.game.playAreaWidth||scene.game.width);
             enemy.x = w/2; enemy.y = 100;
             
             // Lasers (Lines of bullets) crossing
             if(Math.floor(t*60)%40===0) {
                 // Horizontal line
                 const y = scene.player.y;
                 for(let i=0; i<20; i++) {
                     scene.bulletManager.spawn(0, y, 400, 0, '#fff', 2);
                     scene.bulletManager.spawn(w, y+20, -400, 0, '#fff', 2);
                 }
             }
             if(Math.floor(t*60)%60===0) {
                 // Vertical rain
                 const x = scene.player.x;
                 for(let i=0; i<10; i++) {
                     scene.bulletManager.spawn(x + (Math.random()-0.5)*100, 0, 0, 300, '#ff0', 3);
                 }
             }
        }
    },
    {
        hp: 1000, duration: 60, spellName: "Night Sign 'Night Bird'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.cos(t)*100;enemy.y = 100;
             if(Math.floor(t*60)%8===0) {
                 // Aimed cluster
                 PatternLibrary.aimedNWay(scene, enemy, 5, 0.4, 250, '#0ff', 4);
             }
             if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 150, '#00f', 5, t);
             }
        }
    }
]);

// Parsee Mizuhashi - Bridge Princess, Jealousy Youkai (Touhou 11 Stage 2 Boss)
export const BossParseeEvents = createBossStage("Parsee Mizuhashi", null, [
    {
        hp: 1000, duration: 35, // Non-spell 1
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.sin(t*2)*80;
            enemy.y = 100;
            if(Math.floor(t*60)%5===0) {
                // Jealous green needles
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*350, Math.sin(angle)*350, '#0f0', 3);
            }
        }
    },
    {
        hp: 1500, duration: 50, spellName: "Jealousy Sign 'Green-Eyed Monster'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
            // Waves of jealousy
            if(Math.floor(t*60)%4===0) {
                const a = t*4;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#0f0', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a)*250, Math.sin(-a)*250, '#8f0', 4);
            }
            // Aimed spite
            if(Math.floor(t*60)%60===0) {
                 PatternLibrary.aimedNWay(scene, enemy, 5, 0.2, 300, '#fff', 4);
            }
        }
    },
    {
        hp: 1200, duration: 45, // Non-spell 2
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.cos(t)*100;
            enemy.y = 120;
            if(Math.floor(t*60)%8===0) {
                 scene.bulletManager.spawn(enemy.x, enemy.y, 0, 200, '#0f0', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, 0, 250, '#0f0', 4);
            }
        }
    },
    {
        hp: 1800, duration: 60, spellName: "Envy 'Green-Eyed Invisible Monster'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            // Bullets that fade or are hard to see? 
            // We simulate by spawning from "nowhere" near player
            if(Math.floor(t*60)%5===0) {
                const px = scene.player.x + (Math.random()-0.5)*200;
                const py = scene.player.y - 300; 
                if(py > 0) {
                    const ang = Math.atan2(scene.player.y - py, scene.player.x - px);
                    scene.bulletManager.spawn(px, py, Math.cos(ang)*200, Math.sin(ang)*200, '#0f0', 3);
                }
            }
             if(Math.floor(t*60)%20===0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 150, '#fff', 3, t);
            }
        }
    },
    {
        hp: 2000, duration: 60, spellName: "Grandpa Hanasaka",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
             // Ash/Pink bullets
             if(Math.floor(t*60)%3===0) {
                 const x = Math.random()*(scene.game.playAreaWidth||scene.game.width);
                 scene.bulletManager.spawn(x, -20, (Math.random()-0.5)*50, 200, '#fcc', 4);
             }
             if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 180, '#ccc', 4, t);
             }
        }
    }
]);

// Nue Houjuu - The Unidentified Fantastic Flying Girl (Touhou 12 Extra Boss)
// THE ULTIMATE NUE FIGHT - Completely authentic and spectacular!
export const BossNueEvents = createBossStage("Nue Houjuu", null, [
    {
        // Non-spell 1
        hp: 800, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2 + Math.sin(t*2)*80;
            enemy.y = 100 + Math.cos(t)*30;
            
            // Trident-like spread
            if(Math.floor(t*60)%10===0) {
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                for(let i=-1; i<=1; i++) {
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle+i*0.3)*250, Math.sin(angle+i*0.3)*250, '#f00', 3);
                }
            }
        }
    },
    {
        // Spell 1: Ominous Clouds "Heian Dark Clouds"
        hp: 1200, duration: 50, spellName: "Ominous Clouds 'Heian Dark Clouds'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2; 
            enemy.y = 100;

            // Snake trails
            if(Math.floor(t*60)%20===0) {
                 const startX = Math.random() * w;
                 const color = Math.random()>0.5 ? '#f00' : '#00f';
                 for(let i=0; i<15; i++) {
                     const delay = i*50;
                     const curve = (Math.random()-0.5)*2;
                     setTimeout(() => {
                         scene.bulletManager.spawn(startX + Math.sin(i*0.5)*20, -20, Math.sin(i*0.2 + curve)*50, 150, color, 4);
                     }, delay);
                 }
            }
            if(Math.floor(t*60)%5===0) {
                PatternLibrary.aimed(scene, enemy, 300, '#fff', 2);
            }
        }
    },
    {
        // Spell 2: Unidentified "Red UFO Invasion of Rage"
        hp: 1500, duration: 60, spellName: "Unidentified 'Red UFO Invasion of Rage'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2 + Math.cos(t)*50; 
            
            // Dense vertical rain (Red UFOs)
            if(Math.floor(t*60)%4===0) {
                const x = Math.random() * w;
                scene.bulletManager.spawn(x, -20, 0, 300 + Math.random()*100, '#f00', 6);
            }
            // Side bursts
            if(Math.floor(t*60)%60===0) {
                for(let i=0; i<10; i++) {
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(t)*200 + (Math.random()-0.5)*100, Math.sin(t)*200 + (Math.random()-0.5)*100, '#f80', 4);
                }
            }
        }
    },
    {
        // Spell 3: Unidentified "Blue UFO Invasion of Grief"
        hp: 1500, duration: 60, spellName: "Unidentified 'Blue UFO Invasion of Grief'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            
            // Blue UFOs come from sides and curve
            if(Math.floor(t*60)%8===0) {
                const left = Math.random() > 0.5;
                const startX = left ? -20 : w+20;
                const startY = Math.random() * (scene.game.height/2);
                const vx = left ? 150 : -150;
                const vy = 50 + Math.random()*50;
                
                // Spawn a customized bullet that curves
                const b = scene.bulletManager.spawn(startX, startY, vx, vy, '#00f', 5);
                // Simple physics simulation hack: give it acceleration? 
                // The basic bullet manager might not support custom update yet, but we can fake it with distinct spawns
            }
             if(Math.floor(t*60)%4===0) {
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(t*3)*200, Math.sin(t*3)*200, '#0ff', 3);
             }
        }
    },
    {
        // Spell 4: Unidentified "Green UFO Invasion of Justice"
        hp: 1500, duration: 60, spellName: "Unidentified 'Green UFO Invasion of Justice'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = w/2;
            
            // Converging lasers/lines
            // Converging lasers/lines
            if(Math.floor(t*60)%60===0) { // Slower spawn rate (every 1 sec)
                const y = Math.random() * (h/2);
                for(let i=0; i<15; i++) {
                     // Slower (100) and Wider Gap (60)
                     scene.bulletManager.spawn(0, y + i*60, 100, 0, '#0f0', 4);
                     scene.bulletManager.spawn(w, y + i*60 + 30, -100, 0, '#0f0', 4);
                }
            }
            // Aimed shots
            if(Math.floor(t*60)%10===0) {
                // Slower aimed shots (150 vs 300)
                PatternLibrary.aimedNWay(scene, enemy, 3, 0.2, 150, '#8f0', 3);
            }
        }
    },
    {
        // Spell 5: Unidentified "Rainbow UFO Invasion of Terror"
        hp: 2000, duration: 70, spellName: "Unidentified 'Rainbow UFO Invasion of Terror'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            
            // Chaotic mix
            if(Math.floor(t*60)%3===0) {
                const colors = ['#f00', '#00f', '#0f0', '#ff0', '#f0f', '#0ff'];
                const c = colors[Math.floor(Math.random()*colors.length)];
                const x = Math.random()*w;
                scene.bulletManager.spawn(x, -20, (Math.random()-0.5)*100, 200+Math.random()*100, c, 5);
            }
            if(Math.floor(t*60)%20===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 200, '#fff', 3, t);
            }
        }
    },
    {
        // Spell 6: Nue "Undefined Darkness"
        hp: 2500, duration: 90, spellName: "Nue 'Undefined Darkness'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth || scene.game.width)/2;
            
            // Darken screen (conceptual) - dense dark bullets
            if(Math.floor(t*60)%2===0) {
                const angle = t * 13;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*300, Math.sin(angle)*300, '#333', 8); // Dark grey large bullets
            }
            if(Math.floor(t*60)%10===0) {
                // Flashes of color in the dark
                const a = Math.random()*Math.PI*2;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#f00', 4);
            }
        }
    },
    {
        // Spell 7: Nightmare of Heiankyou
        hp: 3000, duration: 99, spellName: "Nightmare of Heiankyou",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth || scene.game.width;
            enemy.x = w/2 + Math.sin(t*0.5)*50;
            
            // Curving trails
            if(Math.floor(t*60)%5===0) {
                const a = t*2;
                for(let i=0; i<4; i++) {
                    const angle = a + (i/4)*Math.PI*2;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*150, Math.sin(angle)*150, '#f0f', 4);
                }
            }
            // Random rain
            if(Math.floor(t*60)%4===0) {
                scene.bulletManager.spawn(Math.random()*w, -20, 0, 250, '#fff', 3);
            }
        }
    }
]);

// Utsuho Reiuji (Okuu) - The Scorching, Troublesome Divine Flame (Touhou 11 Final Boss)
// THE ULTIMATE NUCLEAR HELL RAVEN - Authentic nuclear apocalypse patterns!
export const BossOkuuEvents = createBossStage("Utsuho Reiuji", null, [
    {
        hp: 2000, duration: 40, 
        pattern: (enemy, dt, t) => {
            // Warning sirens visually
            const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 120;
             if(Math.floor(t*60)%10===0) {
                 // Heavy radiation
                 PatternLibrary.aimedNWay(scene, enemy, 3, 0.4, 300, '#f80', 6);
             }
        }
    },
    {
        hp: 2500, duration: 60, spellName: "Atomic Fire 'Nuclear Fusion'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
             // Atoms merging
             if(Math.floor(t*60)%50===0) {
                 // Orbs coming together then exploding? 
                 // Simpler: Large suns
                 for(let i=0; i<6; i++) {
                     const a = (i/6)*Math.PI*2 + t;
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*100, Math.sin(a)*100, '#ff0', 10);
                 }
             }
             if(Math.floor(t*60)%5===0) {
                 const a = t*3;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#f00', 4);
             }
        }
    },
    {
        hp: 3000, duration: 70, spellName: "Explosion Sign 'Mega Flare'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
             // Huge slower bullets
             if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 150, '#f40', 8, t);
             }
             // Rain of debris
             if(Math.floor(t*60)%4===0) {
                 scene.bulletManager.spawn(Math.random()*(scene.game.playAreaWidth||scene.game.width), -20, 0, 300, '#fff', 3);
             }
        }
    },
    {
        hp: 3500, duration: 80, spellName: "Blazing Star 'Fixed Star'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            // Rings of suns
            if(Math.floor(t*60)%20===0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 200, '#f88', 6, t);
                PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 220, '#ff0', 6, -t);
            }
        }
    },
    {
        hp: 5000, duration: 120, spellName: "Hell's Artificial Sun 'Subterranean Sun'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = (scene.game.playAreaWidth||scene.game.width);
            enemy.x = w/2; enemy.y = 150;
            
            // The Sun Logic: Pull player?
            // We can add a "gravity" force to player
            const dx = enemy.x - scene.player.x;
            const dy = enemy.y - scene.player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > 50) {
                scene.player.x += (dx/dist)*1.5;
                scene.player.y += (dy/dist)*1.5;
            }
            
            // Eruptions
             if(Math.floor(t*60)%5===0) {
                 const a = Math.random()*Math.PI*2;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*300, Math.sin(a)*300, '#f00', 5);
             }
             if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 30, 200, '#ff0', 5, t);
             }
        }
    }
]);

// Remilia (Vampire)
export const BossRemiliaEvents = createBossStage("Remilia Scarlet", null, [
    {
        hp: 2000, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.cos(t)*100; enemy.y = 100;
            if(Math.floor(t*60)%5===0) {
                PatternLibrary.aimedNWay(scene, enemy, 3, 0.1, 400, '#f00', 4);
            }
        }
    },
    {
        hp: 2500, duration: 60, spellName: "Divine Spear 'Spear the Gungnir'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
            // Massive fast spear
            if(Math.floor(t*60)%40===0) {
                 const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                 // Spear visual: line of bullets
                 for(let i=0; i<10; i++) {
                     setTimeout(() => {
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*800, Math.sin(angle)*800, '#f00', 8);
                     }, i*10);
                 }
            }
        }
    },
    {
        hp: 4000, duration: 90, spellName: "Scarlet Sign 'Red Magic'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 120;
            // Authentic Red Magic is a dense chaotic cloud
            if(Math.floor(t*60)%5===0) {
                const a = t * 13; // Primes make chaos
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#f00', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a+1)*200, Math.sin(a+1)*200, '#f88', 4);
            }
            if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 150, '#fff', 5, t);
            }
        }
    }
]);

// Cirno (Stage 2 Boss - Touhou 6)
export const BossCirnoEvents = createBossStage("Cirno", null, [
    {
        hp: 1000, duration: 40, 
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.sin(t*2)*80; enemy.y = 100;
             if(Math.floor(t*60)%5===0) {
                 PatternLibrary.aimed(scene, enemy, 300, '#0ff', 3);
             }
        }
    },
    {
        hp: 1200, duration: 60, spellName: "Ice Sign 'Icicle Fall' (Easy)",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
             
             // The famous safe spot pattern
             // wide spread aimed roughly at player but with a gap in the pure center? 
             // Actually in Easy it's a fixed spread that happens to have a gap in front of boss.
             if(Math.floor(t*60)%15===0) {
                 for(let i=0; i<36; i++) {
                     const a = (i/36)*Math.PI*2;
                     // Skip angles near 90 degrees (down)
                     const deg = (a * 180 / Math.PI) % 360;
                     if(Math.abs(deg - 90) < 15) continue; // Safe spot
                     
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#ff0', 4);
                 }
             }
        }
    },
    {
        hp: 1500, duration: 60, spellName: "Freeze Sign 'Perfect Freeze'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 120;
             
             // Omni-directional freeze
             if(Math.floor(t*60)%60===0) {
                 // Burst random
                 for(let i=0; i<40; i++) {
                     const a = Math.random()*Math.PI*2;
                     const s = 50 + Math.random()*200;
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*s, Math.sin(a)*s, '#fff', 3);
                 }
             }
        }
    }
]);

// Hong Meiling (Stage 3 Boss - Touhou 6)
export const BossMeilingEvents = createBossStage("Hong Meiling", null, [
    {
        hp: 1200, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.cos(t)*50; enemy.y = 100;
            if(Math.floor(t*60)%10===0) {
                PatternLibrary.aimedNWay(scene, enemy, 3, 0.2, 300, '#f00', 4);
            }
        }
    },
    {
        hp: 1500, duration: 60, spellName: "Flower Sign 'Gorgeous Sweet Flower'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
            if(Math.floor(t*60)%8===0) {
                // Flower petal shapes
                for(let i=0; i<5; i++) {
                    const a = (i/5)*Math.PI*2 + t;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#f0f', 5);
                }
            }
        }
    },
    {
        hp: 1800, duration: 60, spellName: "Colorful Rain",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            if(Math.floor(t*60)%4===0) {
                const colors = ['#f00','#ff0','#0f0','#0ff','#00f','#f0f'];
                const c = colors[Math.floor(Math.random()*colors.length)];
                const x = Math.random()*(scene.game.playAreaWidth||scene.game.width);
                scene.bulletManager.spawn(x, -20, 0, 250, c, 3);
            }
        }
    }
]);

// Patchouli Knowledge (Stage 4 Boss - Touhou 6)
export const BossPatchouliEvents = createBossStage("Patchouli Knowledge", null, [
    {
        hp: 1500, duration: 40,
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
             // Element switching
             const phase = Math.floor(t/5)%5;
             if(Math.floor(t*60)%5===0) {
                 const colors = ['#f00','#00f','#0f0','#ff0','#f0f']; // Fire, Water, Wood, Earth, Metal
                 const color = colors[phase];
                 const type = phase;
                 
                 if(type===0) { // Fire
                     PatternLibrary.randomSpray(scene, enemy.x, enemy.y, 1, Math.PI/2, Math.PI*2, 100, 300, color, 4);
                 } else if(type===1) { // Water
                     PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 200, color, 4, t);
                 } else {
                     PatternLibrary.aimedNWay(scene, enemy, 5, 0.3, 300, color, 3);
                 }
             }
        }
    },
    {
        hp: 1600, duration: 60, spellName: "Fire Water Sign 'Phlogistic Rain'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
            if(Math.floor(t*60)%10===0) {
                // Fire from center
                PatternLibrary.spiral(scene, enemy.x, enemy.y, t, 200, '#f00', 4, 3, 5);
            }
            if(Math.floor(t*60)%20===0) {
                // Rain from top
                const x = Math.random()*(scene.game.playAreaWidth||scene.game.width);
                scene.bulletManager.spawn(x, -20, 0, 250, '#00f', 4);
            }
        }
    },
    {
        hp: 2000, duration: 60, spellName: "Sun Sign 'Royal Flare'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 120;
            // Massive sun burn
            if(Math.floor(t*60)%2===0) {
                const a = Math.random()*Math.PI*2;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*400, Math.sin(a)*400, '#ff0', 5);
            }
            if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 30, 150, '#f00', 8, t);
            }
        }
    }
]);

// Sakuya Izayoi (Stage 5 Boss - Touhou 6)
export const BossSakuyaEvents = createBossStage("Sakuya Izayoi", null, [
    {
        hp: 1600, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.sin(t*3)*100;
            enemy.y = 100;
            if(Math.floor(t*60)%8===0) {
                // Fast aimed knives
                scene.bulletManager.spawn(enemy.x, enemy.y, 0, 0, '#aaa', 4); // Dummy visual? No, real
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*500, Math.sin(angle)*500, '#eee', 3);
            }
        }
    },
    {
        hp: 2000, duration: 60, spellName: "Conjuring 'Misdirection'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             const w = (scene.game.playAreaWidth||scene.game.width);
             enemy.x = w/2; enemy.y = 100;
             
             // Knives from sides
             if(Math.floor(t*60)%10===0) {
                 const side = Math.random()>0.5 ? 0 : w;
                 const y = Math.random() * scene.game.height/2;
                 const vx = side===0 ? 400 : -400;
                 scene.bulletManager.spawn(side, y, vx, (Math.random()-0.5)*100, '#0f0', 4);
             }
        }
    },
    {
        hp: 2500, duration: 70, spellName: "Illusion World 'The World'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 120;
             
             // Stop-Start mechanic simulation
             const cycle = t % 4; // 4 second cycle
             if(cycle < 2) {
                 // Spawning phase (Time Stop)
                 // Visually spawn bullets that have 0 velocity but will move?
                 // Since we cant easily do that, we spawn many *very slow* bullets that speed up? 
                 // Or we just spawn a WALL instantly at t=2
             } else if(cycle >= 2 && cycle < 2.1) {
                 // LAUNCH
                 // Spawn distinctive ring of knives aimed at player
                 for(let i=0; i<30; i++) {
                     const a = (i/30)*Math.PI*2;
                     scene.bulletManager.spawn(enemy.x + Math.cos(a)*100, enemy.y + Math.sin(a)*100, Math.cos(a)*400, Math.sin(a)*400, '#f00', 4);
                 }
             }
             
             // Standard harassment
              if(Math.floor(t*60)%10===0) {
                  PatternLibrary.aimed(scene, enemy, 400, '#fff', 3);
              }
        }
    }
]);

// Flandre Scarlet (Extra Boss - Touhou 6)
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
            if (Math.floor(t * 60) % 4 === 0) { // Slower frequency (was 2)
                const sweepSpeed = 0.5;
                const angle = Math.sin(t * sweepSpeed) * Math.PI; 
                
                // Beam-like line - Reduced density, larger bullets
                for(let i=0; i<6; i++) { // Fewer bullets (was 10)
                     const speed = 200 + i*60;
                     // Larger radius (12) to maintain beam look
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*speed, Math.sin(angle)*speed, '#f00', 12);
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
            
            // Green mesh pattern - Optimized
            if (Math.floor(t * 60) % 15 === 0) { // Slower spawning (was 10)
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
            // Optimized: Spawn colors sequentially based on time rather than all at once with setTimeouts
            if (Math.floor(t * 60) % 90 < 21) { // Spawn over 21 frames (3 frames per color)
                if (Math.floor(t * 60) % 3 === 0) {
                    const idx = Math.floor((t * 60 % 90) / 3);
                    const colors = ['#f00', '#f80', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                    if (idx < colors.length) {
                        const c = colors[idx];
                        const speed = 150 + idx*30;
                        const count = 20; // Reduced from 30
                        for(let i=0; i<count; i++) {
                            const a = (i/count)*Math.PI*2 + (idx * 0.1); // Slight rotation per layer
                            scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*speed, Math.sin(a)*speed, c, 5); 
                        }
                    }
                }
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
            if (Math.floor(t * 60) % 15 === 0) { // Slower rings (was 10)
                // Expanding rings - Reduced density (12 bullets per ring instead of 16)
                PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 200 + Math.sin(t)*50, '#f00', 4, t);
                PatternLibrary.circle(scene, enemy.x, enemy.y, 12, 180 + Math.cos(t)*50, '#ff0', 4, -t);
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
// Sans (Undertale) - Complete Undertale-style fight


// Sans (Undertale) - "Touhou inside Undertale"
export const BossSansEvents = createBossStage("Sans", null, [
    {
        // Phase 1: Bone Wave Introduction
        hp: 1200, duration: 60, spellName: "Undertale 'Bone Cage'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth||scene.game.width;
            const h = scene.game.height;
            const cx = w/2; const cy = h/2+50;
            const size = 250; // Larger box
            const l=cx-size/2, r=cx+size/2, top=cy-size/2, bot=cy+size/2;
            
            // Draw Box (visual only, collisions via clamp)
            // Use tighter spacing for a solid line look
            if(Math.floor(t*60)%2===0) {
                 for(let x=l;x<=r;x+=40) { 
                     scene.bulletManager.spawn(x,top,0,0,'#fff',2); 
                     scene.bulletManager.spawn(x,bot,0,0,'#fff',2); 
                 }
                 for(let y=top;y<=bot;y+=40) { 
                     scene.bulletManager.spawn(l,y,0,0,'#fff',2); 
                     scene.bulletManager.spawn(r,y,0,0,'#fff',2); 
                 }
            }

            // Clamp Player to Box
            if(scene.player.x < l+15) scene.player.x = l+15;
            if(scene.player.x > r-15) scene.player.x = r-15;
            if(scene.player.y < top+15) scene.player.y = top+15;
            if(scene.player.y > bot-15) scene.player.y = bot-15;

            enemy.x = cx; enemy.y = top - 80;

            // Attack: Bones sliding across box
            // Vertical Bones (Gap in middle)
            if (Math.floor(t * 60) % 100 === 0) {
                 // Bottom half bones
                 const gap = 60;
                 // Left side moving right
                 for(let i=0; i<3; i++) {
                     const delay = i*500;
                     setTimeout(() => {
                         // Bone Column
                         for(let y=top+20; y<bot-20; y+=20) {
                             if(Math.abs(y - (cy + Math.sin(i)*50)) < gap) continue; // Dynamic gap
                             scene.bulletManager.spawn(l+10, y, 150, 0, '#fff', 4);
                         }
                     }, delay);
                 }
            }
            
            // Random small bones
            if(Math.floor(t*60)%20===0) {
                const x = l + Math.random()*size;
                scene.bulletManager.spawn(x, top, 0, 150, '#aaf', 3);
            }
        }
    },
    {
        // Phase 2: Blue Mode (Gravity Platformer)
        hp: 1400, duration: 60, spellName: "Blue Soul 'Gravity Jump'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth||scene.game.width;
            const h = scene.game.height;
            const cx = w/2; const cy = h/2+50;
            const size = 250;
            const l=cx-size/2, r=cx+size/2, top=cy-size/2, bot=cy+size/2;
            
            // Draw Blue Box
            if(Math.floor(t*60)%2===0) {
                 for(let x=l;x<=r;x+=40) { scene.bulletManager.spawn(x,top,0,0,'#00f',2); scene.bulletManager.spawn(x,bot,0,0,'#00f',2); }
                 for(let y=top;y<=bot;y+=40) { scene.bulletManager.spawn(l,y,0,0,'#00f',2); scene.bulletManager.spawn(r,y,0,0,'#00f',2); }
            }
            
            // Clamp
            if(scene.player.x < l+15) scene.player.x = l+15;
            if(scene.player.x > r-15) scene.player.x = r-15;
            if(scene.player.y < top+15) scene.player.y = top+15;
            if(scene.player.y > bot-15) scene.player.y = bot-15;
            
            // GRAVITY LOGIC
            // Force player downwards unless 'UP' is pressed (Jump)
            const gravityStrength = 250;
            const jumpStrength = 300;
            
            if (scene.game.input.isDown('UP')) {
                // Allow moving up (Jump)
                // Standard movement handles this, but we fight gravity
            } else {
                // Apply Gravity
                scene.player.y += gravityStrength * dt;
            }

            enemy.x = cx; enemy.y = top - 80;

            // Attack: Floor Obstacles (Jump cues)
            if (Math.floor(t * 60) % 90 === 0) {
                // Tall bone to jump over
                const speed = -200;
                scene.bulletManager.spawn(r-10, bot-20, speed, 0, '#fff', 5);
                scene.bulletManager.spawn(r-10, bot-40, speed, 0, '#fff', 5);
                scene.bulletManager.spawn(r-10, bot-60, speed, 0, '#fff', 5);
            }
            
            // Low bones (Short hop)
            if (Math.floor(t * 60) % 140 === 60) {
                 scene.bulletManager.spawn(r-10, bot-20, -250, 0, '#fff', 5);
            }
        }
    },
    {
        // Phase 3: Gaster Blasters
        hp: 2000, duration: 80, spellName: "Gaster Blaster 'Bad Time'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const w = scene.game.playAreaWidth||scene.game.width;
            const h = scene.game.height;
            const cx = w/2; const cy = h/2+50;
            const size = 300; // Even bigger arena
            const l=cx-size/2, r=cx+size/2, top=cy-size/2, bot=cy+size/2;
            
            // Draw Box
            if(Math.floor(t*60)%2===0) {
                 for(let x=l;x<=r;x+=40) { scene.bulletManager.spawn(x,top,0,0,'#f00',2); scene.bulletManager.spawn(x,bot,0,0,'#f00',2); }
                 for(let y=top;y<=bot;y+=40) { scene.bulletManager.spawn(l,y,0,0,'#f00',2); scene.bulletManager.spawn(r,y,0,0,'#f00',2); }
            }
            // Clamp
            if(scene.player.x < l+15) scene.player.x = l+15;
            if(scene.player.x > r-15) scene.player.x = r-15;
            if(scene.player.y < top+15) scene.player.y = top+15;
            if(scene.player.y > bot-15) scene.player.y = bot-15;

            enemy.x = cx + Math.sin(t)*50; enemy.y = top - 100;

            // GASTER BLASTER LOGIC
            if (Math.floor(t * 60) % 120 === 0) {
                // 1. Target Phase
                const tx = scene.player.x;
                const ty = scene.player.y;
                const angle = Math.atan2(ty - enemy.y, tx - enemy.x);
                
                // Warning Line (Red visual)
                for(let i=0; i<15; i++) {
                     const dist = i * 40;
                     scene.bulletManager.spawn(enemy.x + Math.cos(angle)*dist, enemy.y + Math.sin(angle)*dist, 0, 0, '#f00', 2);
                }

                // 2. Fire Phase (Delayed)
                setTimeout(() => {
                    scene.cameraShake = 10;
                    // Thick Beam
                    for(let i=0; i<30; i++) { // Length
                        const dist = i * 25;
                        const bx = enemy.x + Math.cos(angle)*dist;
                        const by = enemy.y + Math.sin(angle)*dist;
                        // Width
                        for(let w = -20; w <= 20; w+=10) {
                             const wx = bx + Math.cos(angle+Math.PI/2)*w;
                             const wy = by + Math.sin(angle+Math.PI/2)*w;
                             // Fast moving beam particle
                             scene.bulletManager.spawn(wx, wy, Math.cos(angle)*1000, Math.sin(angle)*1000, '#fff', 8);
                        }
                    }
                }, 800);
            }
            
            // Random Bone Throw
            if(Math.floor(t*60) % 15 === 0) {
                 PatternLibrary.aimed(scene, enemy, 400, '#fff', 4);
            }
        }
    },
    {
        // Phase 4: Final Attack
        hp: 3000, duration: 99, spellName: "Undertale 'The End'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             const w = scene.game.playAreaWidth||scene.game.width;
             const h = scene.game.height;
             const cx = w/2; const cy = h/2;
             
             // Visual Spiral "Gaster Blaster Wheel"
             if(Math.floor(t*60)%5===0) {
                 const a = t*5;
                 for(let i=0; i<4; i++) {
                     const angle = a + (i/4)*Math.PI*2;
                     scene.bulletManager.spawn(cx, cy, Math.cos(angle)*300, Math.sin(angle)*300, '#fff', 6);
                 }
             }
             
             // Surviving the circle
             if(Math.floor(t*60)%60===0) {
                 PatternLibrary.circle(scene, cx, cy, 20, 150, '#f00', 5, -t);
             }
             
             // Slamming player around (Camera Shake + Random Velocity?)
             // Hard to simulate slam without physics override, but we can do visual slam
             if(Math.floor(t*60)%200===0) {
                 scene.cameraShake = 20;
                 // "Throw" bullets at player fast
                 PatternLibrary.aimedNWay(scene, enemy, 10, 0.5, 600, '#00f', 5);
             }
        }
    }
]);

// Pepe (The Frog)
export const BossPepeEvents = createBossStage("Pepe", null, [
    {
        hp: 2000, duration: 40, // Non-spell - Increased HP
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = scene.game.width / 2 + Math.sin(t) * 50;
            enemy.y = 100;
            // Tears (Blue bullets falling) - Faster and denser
            if (Math.floor(t * 60) % 3 === 0) {
                const x = Math.random() * scene.game.width;
                scene.bulletManager.spawn(x, -20, 0, 400, '#00f', 5);
            }
        }
    },
    {
        hp: 2500, duration: 60, spellName: "Meme Sign 'Feels Bad Man'", // Increased HP
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = scene.game.width / 2;
            enemy.y = 120;
            // Sadness waves - Denser
            if (Math.floor(t * 60) % 40 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 30, 200, '#00f', 6, t);
            }
            // Random green bullets (Pepe skin) - Faster
            if (Math.floor(t * 60) % 3 === 0) {
                const a = Math.random() * Math.PI * 2;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 300, Math.sin(a) * 300, '#0f0', 4);
            }
        }
    },
    {
        hp: 3000, duration: 60, spellName: "Rare Pepe 'Market Crash'", // Increased HP
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = scene.game.width / 2;
            enemy.y = 100;
            // Red lines going down (Stocks crashing) - Faster
            if (Math.floor(t * 60) % 5 === 0) {
                const x = Math.random() * scene.game.width;
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        scene.bulletManager.spawn(x + i * 10, 0, 150, 600, '#f00', 5);
                    }, i * 30);
                }
            }
        }
    },
    {
        hp: 4000, duration: 80, spellName: "Rage Sign 'REEEEEEEEE'", // New Phase
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = scene.game.width / 2 + Math.random() * 20 - 10; // Shaking
            enemy.y = 100 + Math.random() * 20 - 10;

            // Sonic scream
            if (Math.floor(t * 60) % 4 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 300 + Math.sin(t) * 100, '#f00', 8, t);
            }
            // Random fast projectiles
            if (Math.floor(t * 60) % 2 === 0) {
                const a = Math.random() * Math.PI * 2;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 600, Math.sin(a) * 600, '#fff', 4);
            }
        }
    }
]);

// Koishi Komeiji (Touhou 11 Extra Boss)
export const BossKoishiEvents = createBossStage("Koishi Komeiji", null, [
    {
        hp: 1200, duration: 35, 
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + Math.sin(t*3)*100;
            enemy.y = 100 + Math.cos(t*4)*50;
            if(Math.floor(t*60)%8===0) {
                const a = Math.random()*Math.PI*2;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#cfc', 3);
            }
        }
    },
    {
        hp: 1600, duration: 55, spellName: "Instinct 'Release of the Id'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
            // Hearts formation (Cardioid)
            if(Math.floor(t*60)%2===0) {
                const a = t*4;
                 // r = a(1-sin(theta)) roughly
                 // Simple parametric heart loop
                 const k = t*5;
                 const hx = 16 * Math.pow(Math.sin(k), 3);
                 const hy = - (13 * Math.cos(k) - 5*Math.cos(2*k) - 2*Math.cos(3*k) - Math.cos(4*k));
                 scene.bulletManager.spawn(enemy.x, enemy.y, hx*10, hy*10, '#f0f', 4);
            }
        }
    },
    {
        hp: 1800, duration: 60, spellName: "Suppression 'Super-Ego'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             const w = (scene.game.playAreaWidth||scene.game.width);
             enemy.x = w/2; 
             // Walls from sides
             if(Math.floor(t*60)%40===0) {
                 for(let i=0; i<15; i++) {
                     scene.bulletManager.spawn(0, i*40, 200, 0, '#00f', 4);
                     scene.bulletManager.spawn(w, i*40 + 20, -200, 0, '#00f', 4);
                 }
             }
        }
    },
    {
        hp: 2000, duration: 60, spellName: "Response 'Youma Interrogation'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            if(Math.floor(t*60)%4===0) {
                PatternLibrary.aimed(scene, enemy, 300, '#fff', 3);
            }
             if(Math.floor(t*60)%60===0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 200, '#f00', 4, t);
            }
        }
    },
    {
        hp: 3000, duration: 90, spellName: "Subconscious 'Genetics of the Subconscious'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
             // DNA Helix
             if(Math.floor(t*60)%2===0) {
                 const a = t*6;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#0ff', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a+Math.PI)*200, Math.sin(a+Math.PI)*200, '#f0f', 4);
             }
             // Cross struts
             if(Math.floor(t*60)%10===0) {
                 const a = t*6;
                 scene.bulletManager.spawn(enemy.x + Math.cos(a)*50, enemy.y + Math.sin(a)*50, Math.cos(a)*100, Math.sin(a)*100, '#ccc', 2);
             }
        }
    }
]);


// Aya Shameimaru - Tengu Reporter (Touhou 10 Stage 4 Boss)
export const BossAyaEvents = createBossStage("Aya Shameimaru", null, [
    {
        // Non-spell 1: Fast wind attacks
        hp: 800, duration: 35,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            // Aya moves very fast
            enemy.x = playAreaWidth / 2 + Math.sin(t * 4) * 150;
            enemy.y = 80 + Math.cos(t * 3) * 40;
            
            // Fast aimed shots
            if (Math.floor(t * 60) % 6 === 0) {
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                scene.bulletManager.spawn(enemy.x, enemy.y, 
                    Math.cos(angle) * 450, Math.sin(angle) * 450, '#fff', 3);
            }
            // Wind gusts (horizontal bullets)
            if (Math.floor(t * 60) % 20 === 0) {
                for (let i = 0; i < 6; i++) {
                    scene.bulletManager.spawn(-20, 100 + i * 60, 400, 0, '#8ff', 4);
                }
            }
        }
    },
    {
        // Spell 1: Wind Sign "Wind God Hidden Among Tree Leaves"
        hp: 1200, duration: 50, spellName: "Wind Sign 'Wind God Hidden Among Tree Leaves'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 3) * 100;
            enemy.y = 100;
            
            // Leaf-like spiraling bullets
            if (Math.floor(t * 60) % 3 === 0) {
                const angle = t * 6;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 200, Math.sin(angle) * 200, '#0f0', 3);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle + Math.PI) * 200, Math.sin(angle + Math.PI) * 200, '#8f0', 3);
            }
            // Occasional wind bursts
            if (Math.floor(t * 60) % 40 === 0) {
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 300, Math.sin(a) * 300, '#8ff', 5);
                }
            }
        }
    },
    {
        // Non-spell 2
        hp: 900, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t * 5) * 120;
            enemy.y = 90;
            
            // Camera flash attacks (sudden burst patterns)
            if (Math.floor(t * 60) % 30 === 0) {
                for (let i = 0; i < 20; i++) {
                    const a = (i / 20) * Math.PI * 2 + Math.random() * 0.2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 250, Math.sin(a) * 250, '#fff', 4);
                }
            }
            // Continuous aimed
            if (Math.floor(t * 60) % 8 === 0) {
                PatternLibrary.aimed(scene, enemy, 380, '#f00', 3);
            }
        }
    },
    {
        // Spell 2: Shutter "Telephoto Shot"
        hp: 1500, duration: 55, spellName: "Shutter 'Telephoto Shot'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 80;
            
            // Focused laser-like shots (camera lens)
            if (Math.floor(t * 60) % 45 === 0) {
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        scene.bulletManager.spawn(enemy.x, enemy.y,
                            Math.cos(angle) * 600, Math.sin(angle) * 600, '#ff0', 8);
                    }, i * 20);
                }
            }
            // Debris from shutter click
            if (Math.floor(t * 60) % 10 === 0) {
                const a = Math.random() * Math.PI * 2;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(a) * 200, Math.sin(a) * 200, '#fff', 3);
            }
        }
    },
    {
        // Non-spell 3
        hp: 1000, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 6) * 100;
            enemy.y = 70 + Math.cos(t * 4) * 30;
            
            // Cross-screen wind
            if (Math.floor(t * 60) % 15 === 0) {
                const dir = Math.floor(t) % 2;
                for (let i = 0; i < 8; i++) {
                    if (dir === 0) {
                        scene.bulletManager.spawn(-20, 80 + i * 50, 350, 0, '#8ff', 4);
                    } else {
                        scene.bulletManager.spawn(playAreaWidth + 20, 80 + i * 50, -350, 0, '#8ff', 4);
                    }
                }
            }
        }
    },
    {
        // Spell 3: Wind God "Tengu's Fall Wind"
        hp: 2000, duration: 70, spellName: "Wind God 'Tengu's Fall Wind'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Tornado-like spiral
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 8;
                const r = 50 + (t % 3) * 30;
                scene.bulletManager.spawn(
                    enemy.x + Math.cos(angle) * r,
                    enemy.y + Math.sin(angle) * r,
                    Math.cos(angle + Math.PI/2) * 150,
                    Math.sin(angle + Math.PI/2) * 150 + 100,
                    '#8ff', 4
                );
            }
            // Falling leaves/feathers
            if (Math.floor(t * 60) % 8 === 0) {
                const x = Math.random() * playAreaWidth;
                scene.bulletManager.spawn(x, -20, (Math.random() - 0.5) * 100, 200, '#0f0', 3);
            }
            // Speed burst attacks
            if (Math.floor(t * 60) % 60 === 0) {
                for (let i = 0; i < 16; i++) {
                    const a = (i / 16) * Math.PI * 2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 400, Math.sin(a) * 400, '#fff', 5);
                }
            }
        }
    }
]);

// Junko - Divine Spirit (Touhou 15 Stage 6 Boss - Pure Fury)
export const BossJunkoEvents = createBossStage("Junko", null, [
    {
        // Non-spell 1: Pure attacks
        hp: 1500, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Pure red/orange aimed shots
            if (Math.floor(t * 60) % 5 === 0) {
                PatternLibrary.aimedNWay(scene, enemy, 5, 0.15, 320, '#f80', 4);
            }
            // Purity circles
            if (Math.floor(t * 60) % 40 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 200, '#ff0', 5, t);
            }
        }
    },
    {
        // Spell 1: Pure Sign "Pristinely Perfect Purification"
        hp: 2000, duration: 60, spellName: "Pure Sign 'Pristinely Perfect Purification'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t) * 50;
            enemy.y = 100;
            
            // Dense purity circles expanding
            if (Math.floor(t * 60) % 25 === 0) {
                for (let ring = 0; ring < 4; ring++) {
                    setTimeout(() => {
                        for (let i = 0; i < 24; i++) {
                            const a = (i / 24) * Math.PI * 2 + ring * 0.1;
                            scene.bulletManager.spawn(enemy.x, enemy.y,
                                Math.cos(a) * (150 + ring * 30),
                                Math.sin(a) * (150 + ring * 30),
                                '#f80', 5);
                        }
                    }, ring * 100);
                }
            }
        }
    },
    {
        // Non-spell 2
        hp: 1800, duration: 45,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t * 2) * 80;
            enemy.y = 110;
            
            // Wrath spirals
            if (Math.floor(t * 60) % 3 === 0) {
                const angle = t * 7;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 250, Math.sin(angle) * 250, '#f00', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(-angle) * 250, Math.sin(-angle) * 250, '#f80', 4);
            }
        }
    },
    {
        // Spell 2: Purity "Pure Light of the Palm"
        hp: 2500, duration: 65, spellName: "Purity 'Pure Light of the Palm'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Radiating pure light beams
            if (Math.floor(t * 60) % 20 === 0) {
                for (let i = 0; i < 8; i++) {
                    const baseAngle = (i / 8) * Math.PI * 2 + t;
                    for (let j = 0; j < 10; j++) {
                        setTimeout(() => {
                            scene.bulletManager.spawn(enemy.x, enemy.y,
                                Math.cos(baseAngle) * 400,
                                Math.sin(baseAngle) * 400,
                                '#ff0', 6);
                        }, j * 30);
                    }
                }
            }
            // Background purity
            if (Math.floor(t * 60) % 8 === 0) {
                const a = Math.random() * Math.PI * 2;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(a) * 180, Math.sin(a) * 180, '#f80', 3);
            }
        }
    },
    {
        // Non-spell 3
        hp: 2000, duration: 50,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 3) * 100;
            enemy.y = 100 + Math.cos(t * 2) * 30;
            
            // Hatred waves
            if (Math.floor(t * 60) % 6 === 0) {
                const wave = Math.floor(t * 2) % 5;
                PatternLibrary.aimedNWay(scene, enemy, 3 + wave, 0.3, 300, '#f00', 4);
            }
        }
    },
    {
        // Spell 3: Hatred "Pure Furies of Hatred"
        hp: 3000, duration: 80, spellName: "Hatred 'Pure Furies of Hatred'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Fury eruptions from all sides
            if (Math.floor(t * 60) % 30 === 0) {
                const side = Math.floor(t * 2) % 4;
                switch(side) {
                    case 0:
                        for (let i = 0; i < 10; i++) {
                            scene.bulletManager.spawn(-20, 50 + i * 40, 350, 0, '#f00', 5);
                        }
                        break;
                    case 1:
                        for (let i = 0; i < 10; i++) {
                            scene.bulletManager.spawn(playAreaWidth + 20, 50 + i * 40, -350, 0, '#f80', 5);
                        }
                        break;
                    case 2:
                        for (let i = 0; i < 12; i++) {
                            scene.bulletManager.spawn(30 + i * 35, -20, 0, 350, '#ff0', 5);
                        }
                        break;
                    case 3:
                        for (let i = 0; i < 12; i++) {
                            scene.bulletManager.spawn(30 + i * 35, h + 20, 0, -350, '#f00', 5);
                        }
                        break;
                }
            }
            // Constant purity sphere
            if (Math.floor(t * 60) % 4 === 0) {
                const angle = t * 5;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 200, Math.sin(angle) * 200, '#f80', 4);
            }
        }
    },
    {
        // Final Spell: Lunatic Impact "Pure Impact"
        hp: 4000, duration: 120, spellName: "Lunatic Impact 'Pure Impact'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 2) * 80;
            enemy.y = 100 + Math.cos(t * 1.5) * 40;
            
            // Dense spiral fury
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 10;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 220, Math.sin(angle) * 220, '#f00', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle + Math.PI/3) * 220, Math.sin(angle + Math.PI/3) * 220, '#f80', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle + Math.PI*2/3) * 220, Math.sin(angle + Math.PI*2/3) * 220, '#ff0', 4);
            }
            // Purity explosions
            if (Math.floor(t * 60) % 60 === 0) {
                for (let ring = 0; ring < 3; ring++) {
                    setTimeout(() => {
                        for (let i = 0; i < 32; i++) {
                            const a = (i / 32) * Math.PI * 2;
                            scene.bulletManager.spawn(enemy.x, enemy.y,
                                Math.cos(a) * (200 + ring * 50),
                                Math.sin(a) * (200 + ring * 50),
                                '#fff', 5);
                        }
                    }, ring * 150);
                }
            }
        }
    }
]);

// Yuyuko Saigyouji - Ghost Princess (Touhou 7 Final Boss)
export const BossYuyukoEvents = createBossStage("Yuyuko Saigyouji", null, [
    {
        // Non-spell 1: Butterfly spirits
        hp: 1200, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 0.8) * 100;
            enemy.y = 100;
            
            // Butterfly-like fluttering bullets
            if (Math.floor(t * 60) % 6 === 0) {
                const angle = t * 3;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 180 + 50, Math.sin(angle) * 180, '#f0f', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 180 - 50, Math.sin(angle) * 180, '#f0f', 4);
            }
        }
    },
    {
        // Spell 1: Deadly Butterfly "Everlasting Wandering"
        hp: 1800, duration: 55, spellName: "Deadly Butterfly 'Everlasting Wandering'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Butterflies wandering (curved paths)
            if (Math.floor(t * 60) % 8 === 0) {
                for (let i = 0; i < 6; i++) {
                    const baseAngle = (i / 6) * Math.PI * 2 + t;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(baseAngle) * 150,
                        Math.sin(baseAngle) * 150 + 50,
                        '#f0f', 5);
                }
            }
            // Ghost trails
            if (Math.floor(t * 60) % 20 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 120, '#80f', 4, t);
            }
        }
    },
    {
        // Non-spell 2
        hp: 1500, duration: 45,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t * 1.2) * 80;
            enemy.y = 110;
            
            // Spirit orbs
            if (Math.floor(t * 60) % 10 === 0) {
                const count = 5 + Math.floor(t / 5) % 3;
                for (let i = 0; i < count; i++) {
                    const a = (i / count) * Math.PI * 2 + t;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 200, Math.sin(a) * 200, '#f0f', 4);
                }
            }
        }
    },
    {
        // Spell 2: Ghostly Butterfly "Ghostly Butterfly's Nightmare"
        hp: 2200, duration: 60, spellName: "Ghostly Butterfly 'Ghostly Butterfly's Nightmare'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Nightmare butterflies - dense and erratic
            if (Math.floor(t * 60) % 4 === 0) {
                const angle = t * 5 + Math.random() * 0.5;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 220, Math.sin(angle) * 220, '#f0f', 4);
            }
            // Death spirits
            if (Math.floor(t * 60) % 25 === 0) {
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI + t;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 180, Math.sin(a) * 180, '#80f', 6);
                }
            }
        }
    },
    {
        // Non-spell 3
        hp: 1800, duration: 50,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 1.5) * 100;
            enemy.y = 100 + Math.cos(t) * 30;
            
            // Dense spirit waves
            if (Math.floor(t * 60) % 5 === 0) {
                PatternLibrary.aimedNWay(scene, enemy, 5, 0.2, 280, '#f0f', 4);
            }
        }
    },
    {
        // Spell 3: Resurrection Butterfly "-80% Reflowering-"
        hp: 2800, duration: 70, spellName: "Resurrection Butterfly '-80% Reflowering-'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Massive butterfly wings pattern
            if (Math.floor(t * 60) % 15 === 0) {
                // Left wing
                for (let i = 0; i < 10; i++) {
                    const a = -Math.PI/2 - Math.PI/4 + (i / 10) * Math.PI/2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 200, Math.sin(a) * 200, '#f0f', 5);
                }
                // Right wing
                for (let i = 0; i < 10; i++) {
                    const a = -Math.PI/2 + Math.PI/4 - (i / 10) * Math.PI/2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 200, Math.sin(a) * 200, '#80f', 5);
                }
            }
            // Center spirit
            if (Math.floor(t * 60) % 5 === 0) {
                const angle = t * 4;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 120, Math.sin(angle) * 120, '#fff', 3);
            }
        }
    },
    {
        // Final Spell: Saigyouji Flawless Nirvana
        hp: 4000, duration: 120, spellName: "Saigyouji Flawless Nirvana",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = playAreaWidth / 2;
            enemy.y = 120;
            
            // Cherry blossom petals falling
            if (Math.floor(t * 60) % 3 === 0) {
                const x = Math.random() * playAreaWidth;
                scene.bulletManager.spawn(x, -20,
                    (Math.random() - 0.5) * 80, 200, '#f8f', 3);
            }
            // Death butterflies circling
            if (Math.floor(t * 60) % 4 === 0) {
                const angle = t * 6;
                const r = 100 + Math.sin(t * 2) * 30;
                scene.bulletManager.spawn(
                    enemy.x + Math.cos(angle) * r,
                    enemy.y + Math.sin(angle) * r,
                    Math.cos(angle + Math.PI/2) * 100,
                    Math.sin(angle + Math.PI/2) * 100,
                    '#f0f', 5
                );
            }
            // Massive spirit explosions
            if (Math.floor(t * 60) % 80 === 0) {
                for (let i = 0; i < 36; i++) {
                    const a = (i / 36) * Math.PI * 2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 250, Math.sin(a) * 250, '#80f', 6);
                }
            }
            // The Saigyou Ayakashi (dormant tree) - stationary bullets
            if (Math.floor(t * 60) % 60 === 0) {
                for (let y = 200; y < h; y += 50) {
                    scene.bulletManager.spawn(playAreaWidth / 2, y, 0, 0, '#f0f', 8);
                }
            }
        }
    }
]);


// ============================================
// TOUHOU 8: IMPERISHABLE NIGHT BOSSES
// ============================================

// Tewi Inaba - Earth Rabbit (Touhou 8 Stage 5 Mid-boss)
export const BossTewīEvents = createBossStage("Tewi Inaba", null, [
    {
        hp: 600, duration: 30,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 3) * 100;
            enemy.y = 80;
            
            // Lucky rabbit bullets
            if (Math.floor(t * 60) % 8 === 0) {
                const angle = t * 4;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 200, Math.sin(angle) * 200, '#f8f', 4);
            }
        }
    },
    {
        hp: 1000, duration: 45, spellName: "Rabbit Sign 'Great Fortune Crest'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Lucky circles
            if (Math.floor(t * 60) % 30 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 16, 180, '#f8f', 5, t);
            }
            // Hopping bullets
            if (Math.floor(t * 60) % 10 === 0) {
                PatternLibrary.aimedNWay(scene, enemy, 5, 0.2, 250, '#fff', 4);
            }
        }
    },
    {
        hp: 1200, duration: 50, spellName: "Luck Sign 'Lucky Rabbit's Foot'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t * 2) * 80;
            enemy.y = 90;
            
            // Foot-shaped spread
            if (Math.floor(t * 60) % 15 === 0) {
                for (let i = 0; i < 8; i++) {
                    const a = Math.PI/2 + (i - 3.5) * 0.15;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 280, Math.sin(a) * 280, '#f8f', 4);
                }
            }
        }
    }
]);

// Reisen Udongein Inaba - Lunatic Red Eyes (Touhou 8 Stage 5 Boss)
export const BossReisenEvents = createBossStage("Reisen Udongein Inaba", null, [
    {
        hp: 1000, duration: 35,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 2) * 100;
            enemy.y = 100;
            
            // Red lunatic eyes bullets
            if (Math.floor(t * 60) % 6 === 0) {
                PatternLibrary.aimedNWay(scene, enemy, 5, 0.2, 300, '#f00', 4);
            }
        }
    },
    {
        hp: 1500, duration: 55, spellName: "Visionary 'Lunatic Red Eyes'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Waves of red bullets (mind-bending)
            if (Math.floor(t * 60) % 25 === 0) {
                for (let wave = 0; wave < 3; wave++) {
                    setTimeout(() => {
                        for (let i = 0; i < 20; i++) {
                            const a = (i / 20) * Math.PI * 2 + wave * 0.2;
                            scene.bulletManager.spawn(enemy.x, enemy.y,
                                Math.cos(a) * (150 + wave * 40),
                                Math.sin(a) * (150 + wave * 40),
                                '#f00', 5);
                        }
                    }, wave * 100);
                }
            }
        }
    },
    {
        hp: 1200, duration: 45,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t * 2.5) * 90;
            enemy.y = 100;
            
            // Illusion spirals
            if (Math.floor(t * 60) % 3 === 0) {
                const angle = t * 6;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 220, Math.sin(angle) * 220, '#f00', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(-angle) * 220, Math.sin(-angle) * 220, '#f08', 4);
            }
        }
    },
    {
        hp: 1800, duration: 60, spellName: "Illusion Sign 'Paranoia'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Mind-bending patterns
            if (Math.floor(t * 60) % 40 === 0) {
                // Create "clone" attacks
                const positions = [
                    [playAreaWidth * 0.2, 80],
                    [playAreaWidth * 0.5, 80],
                    [playAreaWidth * 0.8, 80]
                ];
                positions.forEach(pos => {
                    for (let i = 0; i < 10; i++) {
                        const a = (i / 10) * Math.PI * 2;
                        scene.bulletManager.spawn(pos[0], pos[1],
                            Math.cos(a) * 180, Math.sin(a) * 180, '#f00', 5);
                    }
                });
            }
            // Continuous red stream
            if (Math.floor(t * 60) % 5 === 0) {
                const a = t * 4;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(a) * 200, Math.sin(a) * 200, '#f08', 3);
            }
        }
    },
    {
        hp: 2200, duration: 70, spellName: "Lunatic 'Mind Starmine'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t) * 60;
            enemy.y = 100;
            
            // Starmine explosions
            if (Math.floor(t * 60) % 50 === 0) {
                for (let burst = 0; burst < 4; burst++) {
                    const bx = 80 + burst * (playAreaWidth - 160) / 3;
                    setTimeout(() => {
                        for (let i = 0; i < 16; i++) {
                            const a = (i / 16) * Math.PI * 2;
                            scene.bulletManager.spawn(bx, 200,
                                Math.cos(a) * 200, Math.sin(a) * 200, '#f00', 5);
                        }
                    }, burst * 150);
                }
            }
            // Red spiral
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 8;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 240, Math.sin(angle) * 240, '#f08', 4);
            }
        }
    }
]);

// Eirin Yagokoro - Brain of the Moon (Touhou 8 Stage 6 Boss)
export const BossEirinEvents = createBossStage("Eirin Yagokoro", null, [
    {
        hp: 1500, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Arrow/medicine themed
            if (Math.floor(t * 60) % 8 === 0) {
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 350, Math.sin(angle) * 350, '#08f', 3);
            }
        }
    },
    {
        hp: 2000, duration: 60, spellName: "Medicine Sign 'Galaxy in a Pot'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Swirling galaxy
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 6;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 200, Math.sin(angle) * 200, '#00f', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle + Math.PI) * 200, Math.sin(angle + Math.PI) * 200, '#08f', 4);
            }
            // Stars
            if (Math.floor(t * 60) % 30 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 150, '#fff', 3, t);
            }
        }
    },
    {
        hp: 1800, duration: 50,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 1.5) * 80;
            enemy.y = 100;
            
            // Arrows from bow
            if (Math.floor(t * 60) % 15 === 0) {
                for (let i = 0; i < 5; i++) {
                    const angle = Math.PI/2 + (i - 2) * 0.2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(angle) * 300, Math.sin(angle) * 300, '#08f', 5);
                }
            }
        }
    },
    {
        hp: 2500, duration: 70, spellName: "Bow Sign 'Apollo 13'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Arrow volleys
            if (Math.floor(t * 60) % 40 === 0) {
                for (let v = 0; v < 13; v++) {
                    setTimeout(() => {
                        const angle = Math.PI/2 + (Math.random() - 0.5) * 0.5;
                        scene.bulletManager.spawn(enemy.x, enemy.y,
                            Math.cos(angle) * 400, Math.sin(angle) * 400, '#08f', 6);
                    }, v * 40);
                }
            }
            // Orbiting moons
            if (Math.floor(t * 60) % 5 === 0) {
                const a = t * 3;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(a) * 180, Math.sin(a) * 180, '#ff0', 4);
            }
        }
    },
    {
        hp: 3000, duration: 90, spellName: "Heaven Spider's Butterfly-Capturing Web",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Web pattern
            if (Math.floor(t * 60) % 20 === 0) {
                for (let strand = 0; strand < 8; strand++) {
                    const baseAngle = (strand / 8) * Math.PI * 2;
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            scene.bulletManager.spawn(enemy.x, enemy.y,
                                Math.cos(baseAngle) * 300,
                                Math.sin(baseAngle) * 300,
                                '#08f', 4);
                        }, i * 30);
                    }
                }
            }
        }
    }
]);

// Kaguya Houraisan - The Eternal Princess (Touhou 8 Stage 6B Boss)
export const BossKaguyaEvents = createBossStage("Kaguya Houraisan", null, [
    {
        hp: 1500, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Elegant princess patterns
            if (Math.floor(t * 60) % 10 === 0) {
                PatternLibrary.aimedNWay(scene, enemy, 5, 0.15, 280, '#f0f', 4);
            }
        }
    },
    {
        hp: 2000, duration: 60, spellName: "Divine Treasure 'Buddhist Diamond'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Diamond patterns
            if (Math.floor(t * 60) % 25 === 0) {
                for (let i = 0; i < 4; i++) {
                    const a = (i / 4) * Math.PI * 2 + Math.PI/4;
                    for (let j = 0; j < 8; j++) {
                        setTimeout(() => {
                            scene.bulletManager.spawn(enemy.x, enemy.y,
                                Math.cos(a) * (100 + j * 40),
                                Math.sin(a) * (100 + j * 40),
                                '#0ff', 5);
                        }, j * 50);
                    }
                }
            }
        }
    },
    {
        hp: 2200, duration: 65, spellName: "Divine Treasure 'Jewel from Hourain'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t) * 60;
            enemy.y = 100;
            
            // Jewel spiral
            if (Math.floor(t * 60) % 3 === 0) {
                const angle = t * 5;
                const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f'];
                const c = colors[Math.floor(t * 2) % colors.length];
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 220, Math.sin(angle) * 220, c, 4);
            }
        }
    },
    {
        hp: 2500, duration: 70, spellName: "Divine Treasure 'Fire Rat's Robe'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Fire patterns
            if (Math.floor(t * 60) % 8 === 0) {
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2 + t * 2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 200, Math.sin(a) * 200, '#f40', 4);
                }
            }
            // Flame bursts
            if (Math.floor(t * 60) % 40 === 0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 24, 180, '#f80', 5, t);
            }
        }
    },
    {
        hp: 3000, duration: 80, spellName: "Divine Treasure 'Swallow's Cowrie Shell'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t) * 80;
            enemy.y = 100;
            
            // Shell spiral
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 7;
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 230, Math.sin(angle) * 230, '#f8f', 4);
            }
            // Aimed shots
            if (Math.floor(t * 60) % 20 === 0) {
                PatternLibrary.aimedNWay(scene, enemy, 7, 0.15, 300, '#fff', 4);
            }
        }
    },
    {
        hp: 4000, duration: 120, spellName: "'Imperishable Shooting'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Eternal barrage
            if (Math.floor(t * 60) % 3 === 0) {
                const angle = t * 6;
                const colors = ['#f00', '#ff0', '#0ff', '#f0f', '#0f0'];
                const c = colors[Math.floor(t * 3) % colors.length];
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(angle) * 240, Math.sin(angle) * 240, c, 4);
                scene.bulletManager.spawn(enemy.x, enemy.y,
                    Math.cos(-angle) * 240, Math.sin(-angle) * 240, c, 4);
            }
            // Periodic explosions
            if (Math.floor(t * 60) % 60 === 0) {
                for (let i = 0; i < 24; i++) {
                    const a = (i / 24) * Math.PI * 2;
                    scene.bulletManager.spawn(enemy.x, enemy.y,
                        Math.cos(a) * 200, Math.sin(a) * 200, '#fff', 5);
                }
            }
        }
    }
]);

// Fujiwara no Mokou - The Immortal Phoenix (Touhou 8 Extra Stage Boss)
export const BossMokouEvents = createBossStage("Fujiwara no Mokou", null, [
    {
        hp: 1500, duration: 40,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 2) * 100;
            enemy.y = 100;
            if (Math.floor(t * 60) % 6 === 0) {
                const angle = t * 4;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 250, Math.sin(angle) * 250, '#f40', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + Math.PI) * 250, Math.sin(angle + Math.PI) * 250, '#f80', 4);
            }
        }
    },
    {
        hp: 2000, duration: 55, spellName: "Blaze Sign 'Phoenix Wing Rise'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            
            // Rising phoenix wings
            if (Math.floor(t * 60) % 15 === 0) {
                for (let i = 0; i < 8; i++) {
                    const a = -Math.PI/2 - Math.PI/4 + (i / 8) * Math.PI/2;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 220, Math.sin(a) * 220, '#f40', 5);
                }
                for (let i = 0; i < 8; i++) {
                    const a = -Math.PI/2 + Math.PI/4 - (i / 8) * Math.PI/2;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 220, Math.sin(a) * 220, '#f80', 5);
                }
            }
        }
    },
    {
        hp: 1800, duration: 50,
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.cos(t * 3) * 80;
            enemy.y = 100;
            if (Math.floor(t * 60) % 3 === 0) {
                const angle = t * 7;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 230, Math.sin(angle) * 230, '#f40', 4);
            }
        }
    },
    {
        hp: 2500, duration: 65, spellName: "Immortal 'Fire Bird - Flying Phoenix'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            if (Math.floor(t * 60) % 30 === 0) {
                const targetX = scene.player.x;
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        scene.bulletManager.spawn(targetX - 50 + i * 10, -20, 0, 350, '#f40', 5);
                    }, i * 30);
                }
            }
            if (Math.floor(t * 60) % 4 === 0) {
                const a = Math.random() * Math.PI * 2;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 180, Math.sin(a) * 180, '#f80', 3);
            }
        }
    },
    {
        hp: 3000, duration: 80, spellName: "Forgiveness 'Honest Man's Death'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            enemy.x = playAreaWidth / 2 + Math.sin(t * 2) * 60;
            enemy.y = 100;
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 10;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 250, Math.sin(angle) * 250, '#f40', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + Math.PI/3) * 250, Math.sin(angle + Math.PI/3) * 250, '#f80', 4);
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle + Math.PI*2/3) * 250, Math.sin(angle + Math.PI*2/3) * 250, '#ff0', 4);
            }
        }
    },
    {
        hp: 4500, duration: 120, spellName: "'Possessed by Phoenix'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            const playAreaWidth = scene.game.playAreaWidth || scene.game.width;
            const h = scene.game.height;
            enemy.x = playAreaWidth / 2;
            enemy.y = 100;
            if (Math.floor(t * 60) % 25 === 0) {
                const side = Math.floor(t * 3) % 4;
                switch(side) {
                    case 0: for (let i = 0; i < 10; i++) scene.bulletManager.spawn(-20, 50 + i * 40, 350, 0, '#f40', 5); break;
                    case 1: for (let i = 0; i < 10; i++) scene.bulletManager.spawn(playAreaWidth + 20, 50 + i * 40, -350, 0, '#f80', 5); break;
                    case 2: for (let i = 0; i < 10; i++) scene.bulletManager.spawn(30 + i * 40, -20, 0, 350, '#ff0', 5); break;
                    case 3: for (let i = 0; i < 10; i++) scene.bulletManager.spawn(30 + i * 40, h + 20, 0, -350, '#f40', 5); break;
                }
            }
            if (Math.floor(t * 60) % 2 === 0) {
                const angle = t * 12;
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle) * 260, Math.sin(angle) * 260, '#f40', 4);
            }
            if (Math.floor(t * 60) % 70 === 0) {
               for (let i = 0; i < 32; i++) {
                   const a = (i / 32) * Math.PI * 2;
                   scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a) * 280, Math.sin(a) * 280, '#fff', 6);
               }
            }
        }
    }
]);




export const BossPrismriverEvents = createBossStage("Prismriver Sisters", null, [
    {
        hp: 1500, duration: 50, spellName: "Lunasa 'Solo - Violin'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 - 100; 
            enemy.y = 100;
            // Melancholy lasers (lines of bullets)
             if(Math.floor(t*60)%4===0) {
                 scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#fff', 4);
                 scene.bulletManager.spawn(enemy.x + Math.sin(t)*50, enemy.y, 0, 300, '#ccc', 4);
             }
        }
    },
    {
        hp: 1500, duration: 50, spellName: "Merlin  'Solo - Trumpet'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2 + 100; 
            enemy.y = 100;
            // Chaotic curves
             if(Math.floor(t*60)%3===0) {
                 const a = t*10;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#f88', 4);
             }
        }
    },
    {
        hp: 1500, duration: 50, spellName: "Lyrica 'Solo - Keyboard'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; 
            enemy.y = 80;
            // Aimed illusion
             if(Math.floor(t*60)%40===0) {
                 PatternLibrary.aimedNWay(scene, enemy, 7, 0.1, 250, '#f00', 4);
             }
        }
    },
    {
        hp: 3000, duration: 90, spellName: "Funeral Concert 'Prismriver Concerto'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; 
            enemy.y = 100;
            
            // Simulating all 3
            // Violin Lines
            if(Math.floor(t*60)%10===0) {
                 scene.bulletManager.spawn(enemy.x-100, enemy.y, 0, 300, '#fff', 4);
            }
            // Trumpet Waves
            if(Math.floor(t*60)%5===0) {
                 const a = t*8;
                 scene.bulletManager.spawn(enemy.x+100, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#f88', 4);
            }
            // Keyboard Aimed
            if(Math.floor(t*60)%60===0) {
                 PatternLibrary.aimedNWay(scene, enemy, 5, 0.2, 250, '#f00', 4);
            }
        }
    }
]);

export const BossYukariEvents = createBossStage("Yukari Yakumo", null, [
    {
        hp: 3000, duration: 60, spellName: "Boundary 'Boundary of Life and Death'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = (scene.game.playAreaWidth||scene.game.width)/2; enemy.y = 100;
            // Complex interfering waves
            if(Math.floor(t*60)%60===0) {
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 200, '#f0f', 5, t);
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 200, '#f0f', 5, -t);
            }
             if(Math.floor(t*60)%5===0) {
                 const x = Math.random() * (scene.game.playAreaWidth||scene.game.width);
                 const y = Math.random() * scene.game.height;
                 // Portals opening randomly?
                 if(Math.random()<0.1) {
                     scene.bulletManager.spawn(x, y, (scene.player.x-x), (scene.player.y-y), '#fff', 3);
                 }
             }
        }
    }
]);