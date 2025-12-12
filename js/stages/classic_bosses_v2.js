
// Helper for context
const createBossStage = (n, c, p) => (char) => p;
import { PatternLibrary } from '../game/PatternLibrary.js';

// --- RUMIA (Touhou 6 Stage 1) ---
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

// --- CIRNO (Touhou 6 Stage 2) ---
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

// --- HONG MEILING (Touhou 6 Stage 3) ---
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

// --- PATCHOULI KNOWLEDGE (Touhou 6 Stage 4) ---
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

// --- SAKUYA IZAYOI (Touhou 6 Stage 5) ---
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

// --- REMILIA SCARLET (Touhou 6 Stage 6) ---
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

// --- YUKARI YAKUMO (Touhou 7 Phantasm) ---
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
