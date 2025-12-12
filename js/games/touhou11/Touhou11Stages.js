import { PatternLibrary } from '../../game/PatternLibrary.js';

// Helper to create a single boss stage (Copied/Adapted)
const createBossStage = (bossName, spellNames, patterns) => (character) => {
    return [
        {
            time: 0.1,
            action: (scene) => {
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('generic');
                }
            }
        },
        {
            time: 1.0,
            action: (scene) => {
                 scene.dialogueManager.startDialogue([
                    { name: "System", text: `STAGE START: ${bossName}`, side: "left" }
                 ]);
            }
        },
        {
            time: 2.0, 
            waitForDialogue: true
        },
        {
            time: 0.5,
            type: 'enemy',
            enemyClass: 'Boss', 
            props: {
                 name: bossName,
                 x: 300, y: 100,
                 spriteKey: 'boss', 
                 hp: patterns[0].hp,
                 patterns: patterns
            }
        },
        {
             time: 5.0,
             waitForClear: true 
        },
        {
             time: 2.0,
             action: (scene) => {
                 scene.dialogueManager.startDialogue([
                     { name: "System", text: "Stage Clear!", side: "left" }
                 ]);
             }
        },
        {
             time: 1.0,
             waitForDialogue: true
        },
        {
             time: 0.1,
             action: (scene) => {
                 scene.levelComplete();
             }
        }
    ];
};

// --- STAGE 1: YAMAME KURODANI ---
export const Stage1Events = createBossStage("Yamame Kurodani", null, [
    {
        hp: 500, duration: 40, spellName: "Trap Sign 'Capture Web'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = scene.game.width/2 + Math.cos(t)*80;
             if(Math.floor(t*60)%20===0) {
                 // Web pattern (lines crossing)
                 const angle = t;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*200, Math.sin(angle)*200, '#fff', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle+Math.PI)*200, Math.sin(angle+Math.PI)*200, '#fff', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle+Math.PI/2)*200, Math.sin(angle+Math.PI/2)*200, '#fff', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle-Math.PI/2)*200, Math.sin(angle-Math.PI/2)*200, '#fff', 4);
             }
        }
    },
    {
         hp: 600, duration: 45, spellName: "Miasma 'Infectious Disease'",
         pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             if(Math.floor(t*60)%5===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 5, 150, '#808', 3, t);
             }
         }
    }
])(null);

// --- STAGE 3: YUUGI HOSHIGUMA ---
export const Stage3Events = createBossStage("Yuugi Hoshiguma", null, [
    {
        hp: 1200, duration: 50, spellName: "Strength 'Mountain Breaker'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            // Heavy single shots
            if(Math.floor(t*60)%40===0) {
                const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                for(let i=0; i<5; i++) {
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*(300+i*20), Math.sin(angle)*(300+i*20), '#f00', 8);
                }
            }
        }
    },
    {
        hp: 1500, duration: 60, spellName: "Big Four Arcanum 'Knockout In Three Steps'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            if(Math.floor(t*60)%60===0) {
                // Step 1
                PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 200, '#f00', 6, 0);
                // Step 2 (delayed)
                setTimeout(() => {
                    PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 300, '#f00', 6, 0);
                }, 500);
                // Step 3 (delayed)
                setTimeout(() => {
                    PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 400, '#f00', 6, 0);
                }, 1000);
            }
        }
    }
])(null);

// --- STAGE 4: SATORI KOMEIJI ---
export const Stage4Events = createBossStage("Satori Komeiji", null, [
    {
        hp: 1600, duration: 60, spellName: "Recollection 'Terrifying Hypnotism'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // Spiral hypnotism
             if(Math.floor(t*60)%3===0) {
                 const a = t * 2;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*200, Math.sin(a)*200, '#f0f', 3);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a)*200, Math.sin(-a)*200, '#808', 3);
             }
        }
    },
    {
        hp: 1800, duration: 70, spellName: "Recollection 'Double Black Death Butterfly'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             if(Math.floor(t*60)%10===0) {
                 // Butterfly wings shape
                 const a = Math.sin(t*3);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(t)*200 + a*100, Math.sin(t)*200, '#f0f', 4);
             }
        }
    }
])(null);

// --- STAGE 5: RIN KAENBYOU (ORIN) ---
export const Stage5Events = createBossStage("Rin Kaenbyou", null, [
    {
        hp: 2000, duration: 60, spellName: "Cat Walk 'Needle Mountain'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = scene.game.width/2 + Math.sin(t*3)*150;
             // Downward needles
             if(Math.floor(t*60)%5===0) {
                 scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#f00', 3);
                 scene.bulletManager.spawn(enemy.x+20, enemy.y, 0, 300, '#f00', 3);
                 scene.bulletManager.spawn(enemy.x-20, enemy.y, 0, 300, '#f00', 3);
             }
        }
    },
    {
        hp: 2200, duration: 80, spellName: "Hell Sign 'Hell's Wheel'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // Spinning wheel
             if(Math.floor(t*60)%2===0) {
                 const orbitR = 100;
                 const orbitA = t * 5;
                 const bx = enemy.x + Math.cos(orbitA) * orbitR;
                 const by = enemy.y + Math.sin(orbitA) * orbitR;
                 scene.bulletManager.spawn(bx, by, Math.cos(orbitA)*100, Math.sin(orbitA)*100, '#fa0', 4);
             }
        }
    }
])(null);
