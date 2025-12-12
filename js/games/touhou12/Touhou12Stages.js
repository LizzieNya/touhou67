import { PatternLibrary } from '../../game/PatternLibrary.js';

// Helper to create a single boss stage (Copied/Adapted)
const createBossStage = (bossName, spellNames, patterns) => (character) => {
    const events = [
        {
            time: 0.1,
            action: (scene) => {
                // Play generic boss theme or specific if mapped
                if (scene.game.soundManager) {
                    scene.game.soundManager.playBossTheme('generic'); 
                }
                scene.ui.showBossTitle(bossName);
            }
        },
        {
            time: 2.0,
            action: (scene) => {
                const BossClass = scene.game.resourceManager.classes['Boss'] || ((window.GameClasses && window.GameClasses.Boss));
                // Fallback if class not found (should be in window or resourceManager)
                // Assuming standard Boss spawning logic
                
                // We'll spawn the boss manually if we have to, or use the event system's helper
                // But for now, let's assume we can spawn a generic boss
                
                // Actually, best way is to look at existing spawn logic.
                // Standard stages use: type: 'enemy', enemyClass: 'Boss', ...
                
                // We will return a spawn event
            }
        }
    ];

    // Since we returned a function that returns events, we need to construct the events array properly
    // But wait, manifests usually return the ARRAY of events directly, not a function.
    // The previous `createBossStage` returned `(character) => [...]`.
    // Let's stick to the structure `IndividualBossStages.js` used:
    
    // RE-CHECKED IndividualBossStages.js:
    /*
    const createBossStage = (bossName, bossClass, phases) => (character) => [
        { ... time: 0.1 ... },
        ...
        {
             time: 2.0,
             type: 'enemy',
             enemyClass: 'Boss',
             props: {
                 name: bossName,
                 hp: phases[0].hp,
                 patterns: phases
             }
        }
    ]
    */
   
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
            time: 2.0, // Wait for dialogue
            waitForDialogue: true
        },
        {
            time: 0.5,
            type: 'enemy',
            enemyClass: 'Boss', 
            props: {
                 name: bossName,
                 x: 300, y: 100,
                 spriteKey: 'boss', // Generic or specific if added later
                 hp: patterns[0].hp,
                 patterns: patterns
            }
        },
        {
             time: 5.0,
             waitForClear: true // Wait for boss death
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

// --- STAGE 1: NAZRIN ---
export const Stage1Events = createBossStage("Nazrin", null, [
    {
        hp: 500, duration: 40, spellName: "Rod Sign 'Busy Rod'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             enemy.x = scene.game.width/2 + Math.sin(t)*50;
             enemy.y = 100;
             if(Math.floor(t*60)%10===0) {
                 PatternLibrary.circle(scene, enemy.x, enemy.y, 10, 200, '#ff0', 4, t);
             }
        }
    },
    {
         hp: 600, duration: 45, spellName: "Search Sign 'Gold Detector'",
         pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             if(Math.floor(t*60)%40===0) {
                 PatternLibrary.aimedNWay(scene, enemy, 5, 0.2, 300, '#ff0', 5);
             }
         }
    }
])(null); // Execute factory immediately to export array

// --- STAGE 2: KOGASA TATARA ---
export const Stage2Events = createBossStage("Kogasa Tatara", null, [
    {
        hp: 700, duration: 45, spellName: "Large Ring 'Umbrella Halo'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            enemy.x = scene.game.width/2;
            if(Math.floor(t*60)%5===0) {
                scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(t*4)*200, Math.sin(t*4)*200, '#0ff', 4);
            }
        }
    },
    {
        hp: 800, duration: 50, spellName: "Rain Sign 'A Rainy Night's Ghost Story'",
        pattern: (enemy, dt, t) => {
            const scene = enemy.game.sceneManager.currentScene;
            if(Math.floor(t*60)%4===0) {
                const x = Math.random() * scene.game.width;
                scene.bulletManager.spawn(x, -20, 0, 300, '#00f', 3);
            }
        }
    }
])(null);

// --- STAGE 3: ICHIRIN KUMOI ---
export const Stage3Events = createBossStage("Ichirin Kumoi", null, [
    {
        hp: 1000, duration: 50, spellName: "Iron Fist 'An Unarguable Youkai Punch'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // Punching motions (Fast aimed shots)
             if(Math.floor(t*60)%60===0) {
                 PatternLibrary.aimedNWay(scene, enemy, 15, 0.5, 400, '#f0f', 8);
             }
        }
    },
    {
        hp: 1200, duration: 60, spellName: "Lightning 'Electrified Nyudo'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             if(Math.floor(t*60)%20===0) {
                 for(let i=0; i<8; i++) {
                     scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random()-0.5)*400, 300, '#ff0', 5);
                 }
             }
        }
    }
])(null);

// --- STAGE 4: MINAMITSU MURASA ---
export const Stage4Events = createBossStage("Minamitsu Murasa", null, [
    {
        hp: 1400, duration: 60, spellName: "Capsize 'Sinking Anchor'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // Heavy anchors (Slow big bullets)
             if(Math.floor(t*60)%30===0) {
                 PatternLibrary.aimedNWay(scene, enemy, 3, 0.4, 150, '#008', 10);
             }
        }
    },
    {
        hp: 1600, duration: 60, spellName: "Drowning 'Deep Whirlpool'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             const angle = t * 2;
             scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*200, Math.sin(angle)*200, '#00f', 4);
             scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle+Math.PI)*200, Math.sin(angle+Math.PI)*200, '#0af', 4);
        }
    }
])(null);

// --- STAGE 5: SHOU TORAMARU ---
export const Stage5Events = createBossStage("Shou Toramaru", null, [
    {
        hp: 1800, duration: 60, spellName: "Jeweled Pagoda 'Radiant Treasure'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // Curving lasers (bullets)
             if(Math.floor(t*60)%5===0) {
                 const a = t * 3;
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*300, Math.sin(a)*300, '#ff0', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a)*300, Math.sin(-a)*300, '#fa0', 4);
             }
        }
    },
    {
        hp: 2000, duration: 80, spellName: "Light Sign 'Absolute Justice'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // Laser beams (fast lines)
             if(Math.floor(t*60)%40===0) {
                 const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                 for(let i=0; i<10; i++) {
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)* (300+i*50), Math.sin(angle)* (300+i*50), '#ff0', 8);
                 }
             }
        }
    }
])(null);

// --- STAGE 6: BYAKUREN HIJIRI ---
export const Stage6Events = createBossStage("Byakuren Hijiri", null, [
    {
        hp: 2500, duration: 60, spellName: "Magic 'Omen of Purple Clouds'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             if(Math.floor(t*60)%10===0) {
                 PatternLibrary.flower(scene, enemy.x, enemy.y, 6, 20, 200, '#f0f', 4, t);
             }
        }
    },
    {
        hp: 3000, duration: 80, spellName: "Great Magic 'Devil's Recitation'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             if(Math.floor(t*60)%60===0) {
                 // Burst
                 for(let i=0; i<30; i++) {
                     const a = Math.random() * Math.PI * 2;
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*300, Math.sin(a)*300, '#fff', 5);
                 }
             }
             // Constant pressure
             if(Math.floor(t*60)%5===0) {
                 const a = t * 5;
                  scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#f0f', 4);
             }
        }
    },
    {
        hp: 4000, duration: 99, spellName: "Flying Fantastica 'Flying Hijiri'",
        pattern: (enemy, dt, t) => {
             const scene = enemy.game.sceneManager.currentScene;
             // High speed movement and trails
             enemy.x = scene.game.width/2 + Math.sin(t*2)*150;
             enemy.y = 100 + Math.cos(t)*50;
             
             if(Math.floor(t*60)%3===0) {
                 scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, '#f0f', 4);
                 scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random()-0.5)*200, 250, '#fff', 4);
             }
        }
    }
])(null);
