
import { PatternLibrary } from '../game/PatternLibrary.js';

// Helper (mock for syntax validity if needed, but not used in patch)
const createBossStage = (n, c, p) => (char) => p;

// --- PARSEE MIZUHASHI ---
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

// --- UTSUHO REIUJI (OKUU) ---
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

// --- KOISHI KOMEIJI ---
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

// --- PRISMRIVER SISTERS ---
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
