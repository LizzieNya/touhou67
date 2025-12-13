import { PatternLibrary } from '../../game/PatternLibrary.js';

// Enhanced Boss Stage Factory
const createBossStage = (config) => (character) => {
    const { 
        stageName, 
        stageTheme, 
        bossName, 
        bossTheme, 
        bossId, 
        patterns, 
        dialogue 
    } = config;

    return [
        {
            time: 0.1,
            action: (scene) => {
                // Play Stage Theme
                if (scene.game.soundManager && stageTheme) {
                    scene.game.soundManager.playBossTheme(stageTheme); 
                    // Note: playBossTheme is often used for any BGM in this simplified engine
                }
                scene.ui.showBossTitle(stageName || `Stage - ${bossName}`);
            }
        },
        // Simulate Stage Portion (Short travel)
        {
            time: 2.0,
            action: (scene) => {
               // Maybe spawn some pop-corn enemies here if we had them
            }
        },
        {
            time: 4.0,
            action: (scene) => {
                 if (dialogue) {
                     scene.dialogueManager.startDialogue(dialogue);
                 } else {
                     scene.dialogueManager.startDialogue([
                        { name: "System", text: `WARNING: ${bossName} approaching!`, side: "left" }
                     ]);
                 }
            }
        },
        {
            time: 5.0, // Wait for dialogue
            waitForDialogue: true
        },
        {
            time: 0.1,
            action: (scene) => {
                // Play Boss Theme
                if (scene.game.soundManager && bossTheme) {
                    scene.game.soundManager.playBossTheme(bossTheme);
                }
                scene.ui.showBossTitle(bossName); // Show again or emphasize
            }
        },
        {
            time: 0.5,
            type: 'enemy',
            enemyClass: 'Boss', 
            props: {
                 name: bossName,
                 x: 300, y: 100,
                 spriteKey: bossId, // Assumes sprite exists or falls back
                 hp: patterns.reduce((acc, p) => acc + p.hp, 0), // Total HP for bar? Or per phase.
                 // Actually the Boss class usually handles phases. We pass the phases array.
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

// --- NAZRIN (STAGE 1) ---
export const Stage1Events = createBossStage({
    stageName: "Stage 1: A Ship Returning to the Sky",
    stageTheme: "th12_stage1",
    bossName: "Nazrin",
    bossTheme: "nazrin",
    bossId: "nazrin",
    dialogue: [
         { name: "Nazrin", text: "So, you're the one poking around the ship?", side: "right" },
         { name: "Player", text: "Just looking for treasure.", side: "left" },
         { name: "Nazrin", text: "The only treasure here is my dowsing rod's findings!", side: "right" }
    ],
    patterns: [
        {
            hp: 400, duration: 40, spellName: "Rod Sign 'Busy Rod'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 enemy.x = scene.game.width/2 + Math.sin(t*2)*100;
                 if(Math.floor(t*60)%8===0) {
                     PatternLibrary.circle(scene, enemy.x, enemy.y, 8, 250, '#ff0', 4, t*0.5);
                 }
            }
        },
        {
             hp: 600, duration: 50, spellName: "Search Sign 'Rare Metal Detector'",
             pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 if(Math.floor(t*60)%20===0) {
                     // Lasers seeking player
                     const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)*400, Math.sin(angle)*400, '#fff', 8);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle+0.2)*350, Math.sin(angle+0.2)*350, '#ff0', 4);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle-0.2)*350, Math.sin(angle-0.2)*350, '#ff0', 4);
                 }
             }
        },
        {
             hp: 700, duration: 60, spellName: "Vision Sign 'Nazrin Pendulum'",
             pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Pendulum motion bullets
                 const swing = Math.sin(t * 1.5) * 1.5; // angle offset
                 if(Math.floor(t*60)%5===0) {
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(Math.PI/2 + swing)*300, Math.sin(Math.PI/2 + swing)*300, '#faf', 5);
                 }
                 if(Math.floor(t*60)%30===0) {
                     PatternLibrary.ring(scene, enemy.x, enemy.y, 10, 200, '#ff0', 4);
                 }
             }
        }
    ]
})(null);

// --- KOGASA TATARA (STAGE 2) ---
export const Stage2Events = createBossStage({
    stageName: "Stage 2: The Floating Clouds",
    stageTheme: "th12_stage2",
    bossName: "Kogasa Tatara",
    bossTheme: "kogasa",
    bossId: "kogasa",
    dialogue: [
         { name: "Kogasa", text: "Boo! Did I surprise you?", side: "right" },
         { name: "Player", text: "Not really.", side: "left" },
         { name: "Kogasa", text: "How depressing... I'll just have to eat you then!", side: "right" }
    ],
    patterns: [
        {
            hp: 700, duration: 45, spellName: "Large Ring 'Umbrella Halo'",
            pattern: (enemy, dt, t) => {
                const scene = enemy.game.sceneManager.currentScene;
                enemy.x = scene.game.width/2;
                if(Math.floor(t*60)%5===0) {
                    const r = 30 + Math.sin(t)*20;
                    scene.bulletManager.spawn(enemy.x + Math.cos(t*4)*r, enemy.y + Math.sin(t*4)*r, Math.cos(t*4)*200, Math.sin(t*4)*200, '#0ff', 4);
                }
            }
        },
        {
            hp: 800, duration: 50, spellName: "Rain Sign 'A Rainy Night's Ghost Story'",
            pattern: (enemy, dt, t) => {
                const scene = enemy.game.sceneManager.currentScene;
                // Rain falling
                if(Math.floor(t*60)%3===0) {
                    const x = Math.random() * scene.game.width;
                    scene.bulletManager.spawn(x, -20, 0, 350, '#00f', 3); // Fast rain
                }
                // Umbrella blocking/shooting
                if(Math.floor(t*60)%60===0) {
                    PatternLibrary.aimedNWay(scene, enemy, 7, 0.5, 200, '#f0f', 6);
                }
            }
        },
        {
            hp: 900, duration: 60, spellName: "Surprising 'Karakasa Flash'",
            pattern: (enemy, dt, t) => {
                const scene = enemy.game.sceneManager.currentScene;
                if(Math.floor(t*60)%90===0) {
                    // Big flash (dense ring)
                    PatternLibrary.circle(scene, enemy.x, enemy.y, 36, 300, '#fff', 5, 0);
                    // Fast lines
                    for(let i=0; i<8; i++) {
                        PatternLibrary.line(scene, enemy.x, enemy.y, i*(Math.PI/4), 10, 400, '#f00', 4);
                    }
                }
            }
        }
    ]
})(null);

// --- ICHIRIN KUMOI (STAGE 3) ---
export const Stage3Events = createBossStage({
    stageName: "Stage 3: The Fast-Moving Ship",
    stageTheme: "th12_stage3",
    bossName: "Ichirin Kumoi",
    bossTheme: "ichirin",
    bossId: "ichirin",
    dialogue: [
         { name: "Ichirin", text: "Halt! This ship is restricted.", side: "right" },
         { name: "Unzan", text: "...", side: "right" },
         { name: "Player", text: "A cloud giant? Interesting.", side: "left" }
    ],
    patterns: [
        {
            hp: 1000, duration: 50, spellName: "Iron Fist 'An Unarguable Youkai Punch'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Punching motions (Fast aimed shots clusters)
                 if(Math.floor(t*60)%40===0) {
                     // "Punch"
                     const a = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                     for(let i=0; i<5; i++) {
                        scene.bulletManager.spawn(enemy.x + i*10, enemy.y, Math.cos(a)*500, Math.sin(a)*500, '#f0f', 10); // Big punch
                     }
                 }
            }
        },
        {
            hp: 1200, duration: 60, spellName: "Lightning 'Electrified Nyudo'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 if(Math.floor(t*60)%10===0) {
                     // Lightning bolts (crooked lines? simplified as fast stream)
                     scene.bulletManager.spawn(enemy.x + (Math.random()-0.5)*100, enemy.y, (Math.random()-0.5)*50, 400, '#ff0', 3);
                 }
                 if(Math.floor(t*60)%60===0) {
                     PatternLibrary.circle(scene, enemy.x, enemy.y, 20, 200, '#fff', 5, t);
                 }
            }
        },
        {
             hp: 1400, duration: 60, spellName: "Fist Sign 'Cloud Kraken'",
             pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Barrage of fists (bullets)
                 if(Math.floor(t*60)%5===0) {
                     const a = t * 7;
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*300, Math.sin(a)*300, '#f0f', 6);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(-a)*300, Math.sin(-a)*300, '#f8f', 6);
                 }
             }
        }
    ]
})(null);

// --- MINAMITSU MURASA (STAGE 4) ---
export const Stage4Events = createBossStage({
    stageName: "Stage 4: Beyond the Interdimensional Rift",
    stageTheme: "th12_stage4",
    bossName: "Minamitsu Murasa",
    bossTheme: "murasa",
    bossId: "murasa",
    dialogue: [
         { name: "Murasa", text: "Welcome aboard the Palanquin Ship.", side: "right" },
         { name: "Murasa", text: "Unfortunately, you trip ends here. Drown!", side: "right" }
    ],
    patterns: [
        {
            hp: 1400, duration: 60, spellName: "Capsize 'Sinking Anchor'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Heavy anchors dropping
                 if(Math.floor(t*60)%20===0) {
                     const startX = Math.random() * scene.game.width;
                     // Anchor
                     scene.bulletManager.spawn(startX, 0, 0, 150, '#008', 12);
                 }
                 // Incidental water
                 if(Math.floor(t*60)%10===0) {
                     PatternLibrary.aimedNWay(scene, enemy, 3, 0.4, 300, '#0af', 3);
                 }
            }
        },
        {
            hp: 1600, duration: 60, spellName: "Drowning 'Deep Whirlpool'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 const angle = t * 2;
                 const r = 20;
                 // Spirals
                 scene.bulletManager.spawn(enemy.x + Math.cos(angle)*r, enemy.y + Math.sin(angle)*r, Math.cos(angle)*200, Math.sin(angle)*200, '#00f', 4);
                 scene.bulletManager.spawn(enemy.x + Math.cos(angle+Math.PI)*r, enemy.y + Math.sin(angle+Math.PI)*r, Math.cos(angle+Math.PI)*200, Math.sin(angle+Math.PI)*200, '#0af', 4);
            }
        },
        {
            hp: 1800, duration: 70, spellName: "Harbor Sign 'Phantom Ship Harbor'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Walls of ghosts/bullets
                 if(Math.floor(t*60)%120===0) {
                     // Horizontal row
                     for(let x=0; x<scene.game.width; x+=40) {
                         scene.bulletManager.spawn(x, 0, 0, 200, '#0f0', 5);
                     }
                 }
                 // Aimed shots
                 if(Math.floor(t*60)%30===0) {
                     PatternLibrary.aimedNWay(scene, enemy, 5, 0.5, 300, '#fff', 4);
                 }
            }
        }
    ]
})(null);

// --- SHOU TORAMARU (STAGE 5) ---
export const Stage5Events = createBossStage({
    stageName: "Stage 5: The Seal of the Law",
    stageTheme: "th12_stage5",
    bossName: "Shou Toramaru",
    bossTheme: "shou",
    bossId: "shou",
    dialogue: [
         { name: "Shou", text: "You have gathered the pagoda's treasures?", side: "right" },
         { name: "Player", text: "I just found some UFOs.", side: "left" },
         { name: "Shou", text: "Then show me the light of justice!", side: "right" }
    ],
    patterns: [
        {
            hp: 1800, duration: 60, spellName: "Jeweled Pagoda 'Radiant Treasure'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Curving lasers (bullets)
                 if(Math.floor(t*60)%4===0) {
                     const a = t * 3 + Math.sin(t);
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
                 if(Math.floor(t*60)%60===0) {
                     const angle = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                     for(let i=0; i<20; i++) {
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle)* (300+i*30), Math.sin(angle)* (300+i*30), '#ff0', 8);
                     }
                     // Flanking lasers
                     const angle2 = angle + 0.5;
                     for(let i=0; i<20; i++) {
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle2)* (300+i*30), Math.sin(angle2)* (300+i*30), '#ff0', 8);
                     }
                     const angle3 = angle - 0.5;
                     for(let i=0; i<20; i++) {
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(angle3)* (300+i*30), Math.sin(angle3)* (300+i*30), '#ff0', 8);
                     }
                 }
            }
        },
        {
             hp: 2200, duration: 80, spellName: "Buddha 'Most Valuable Vajra'",
             pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Vajra pattern (Crosses or heavy density)
                 if(Math.floor(t*60)%10===0) {
                     PatternLibrary.flower(scene, enemy.x, enemy.y, 4, 10, 250, '#fa0', 5, t*2);
                 }
             }
        }
    ]
})(null);

// --- BYAKUREN HIJIRI (STAGE 6) ---
export const Stage6Events = createBossStage({
    stageName: "Stage 6: The Great Dharma",
    stageTheme: "th12_stage6",
    bossName: "Byakuren Hijiri",
    bossTheme: "byakuren",
    bossId: "byakuren",
    dialogue: [
         { name: "Byakuren", text: "Namu San!", side: "right" },
         { name: "Byakuren", text: "To think a human breaks the seal... I am grateful.", side: "right" },
         { name: "Byakuren", text: "But I must test if you can handle equality between Youkai and Humans!", side: "right" }
    ],
    patterns: [
        {
            hp: 2500, duration: 60, spellName: "Magic 'Omen of Purple Clouds'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 if(Math.floor(t*60)%10===0) {
                     PatternLibrary.flower(scene, enemy.x, enemy.y, 8, 20, 200, '#f0f', 4, t);
                 }
            }
        },
        {
            hp: 3000, duration: 80, spellName: "Great Magic 'Devil's Recitation'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 if(Math.floor(t*60)%60===0) {
                     // Burst
                     for(let i=0; i<40; i++) {
                         const a = Math.random() * Math.PI * 2;
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*350, Math.sin(a)*350, '#fff', 5);
                     }
                 }
                 // Constant pressure
                 if(Math.floor(t*60)%6===0) {
                     const a = t * 3;
                      scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#f0f', 4);
                 }
            }
        },
        {
            hp: 3500, duration: 90, spellName: "Superhuman 'Byakuren Hijiri'",
            pattern: (enemy, dt, t) => {
                const scene = enemy.game.sceneManager.currentScene;
                // High speed movement
                if (Math.floor(t*60)%120 === 0) {
                    // Warp/Move fast
                    enemy.x = Math.random() * (scene.game.width - 100) + 50;
                    enemy.y = Math.random() * 200 + 50;
                }
                
                // Amnidirectional scattering
                if(Math.floor(t*60)%4===0) {
                    const a = Math.random() * 6.28;
                    scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*400, Math.sin(a)*400, '#ff0', 4);
                }
            }
        },
        {
            hp: 4000, duration: 99, spellName: "Flying Fantastica 'Flying Hijiri'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Trails
                 enemy.x = scene.game.width/2 + Math.sin(t*2.5)*200;
                 enemy.y = 150 + Math.cos(t)*50;
                 
                 if(Math.floor(t*60)%3===0) {
                     // Rainbow trails
                     const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
                     const c = colors[Math.floor(t*10)%colors.length];
                     scene.bulletManager.spawn(enemy.x, enemy.y, 0, 300, c, 4);
                     scene.bulletManager.spawn(enemy.x, enemy.y, (Math.random()-0.5)*200, 250, '#fff', 3);
                 }
            }
        }
    ]
})(null);

// --- NUE HOUJUU (STAGE EXTRA) ---
export const BossNueEvents = createBossStage({
    stageName: "Extra Stage: The Night Sky of UFOs",
    stageTheme: "th12_stage_ex",
    bossName: "Nue Houjuu",
    bossTheme: "nue",
    bossId: "nue",
    dialogue: [
         { name: "Nue", text: "Hehehe. You found me.", side: "right" },
         { name: "Nue", text: "I am the undefined fantastic object!", side: "right" },
         { name: "Player", text: "A nue? That explains the weird look.", side: "left" },
         { name: "Nue", text: "Fear the unknown!", side: "right" }
    ],
    patterns: [
        {
            hp: 4000, duration: 60, spellName: "Unidentified 'Red UFO Invasion'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 if(Math.floor(t*60)%10===0) {
                    // Red bullets raining
                    PatternLibrary.ring(scene, enemy.x, enemy.y, 5, 300, '#f00', 5);
                 }
                 if(Math.floor(t*60)%60===0) {
                     // UFO shape? Just big clusters
                     PatternLibrary.circle(scene, scene.player.x, scene.player.y - 200, 10, 150, '#f00', 4, 0);
                 }
            }
        },
        {
            hp: 4500, duration: 70, spellName: "Nue Sign 'Danmaku Chimera'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Mixed chaotic patterns
                 // Snakes
                 if(Math.floor(t*60)%5===0) {
                     const a = t + Math.sin(t*5);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*250, Math.sin(a)*250, '#0f0', 4);
                 }
                 // Bursts
                 if(Math.floor(t*60)%40===0) {
                     PatternLibrary.aimedNWay(scene, enemy, 7, 0.8, 400, '#00f', 5);
                 }
            }
        },
        {
            hp: 5000, duration: 80, spellName: "Unknown 'Heian Alien'",
            pattern: (enemy, dt, t) => {
                const scene = enemy.game.sceneManager.currentScene;
                // Rotating geometric shapes
                 if(Math.floor(t*60)%8===0) {
                     const sides = 3 + Math.floor(t)%4; // Triangle, Square, Pentagon...
                     const r = 200;
                     for(let i=0; i<sides; i++) {
                         const a = (Math.PI*2/sides)*i + t;
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*r, Math.sin(a)*r, '#f0f', 5);
                         // Sub bullets
                         scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a+0.1)*r*0.8, Math.sin(a+0.1)*r*0.8, '#fff', 3);
                     }
                 }
            }
        },
        {
            hp: 6000, duration: 99, spellName: "Grudge Bow 'The Bow of Yorimasa Genzanmi'",
            pattern: (enemy, dt, t) => {
                 const scene = enemy.game.sceneManager.currentScene;
                 // Arrows (Lines)
                 if(Math.floor(t*60)%30===0) {
                     const a = Math.atan2(scene.player.y - enemy.y, scene.player.x - enemy.x);
                     // Dense arrow shape
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*500, Math.sin(a)*500, '#fff', 10);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a+0.1)*450, Math.sin(a+0.1)*450, '#fff', 8);
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a-0.1)*450, Math.sin(a-0.1)*450, '#fff', 8);
                 }
                 // Background noise
                 if(Math.floor(t*60)%5===0) {
                     const a = Math.random() * 6.28;
                     scene.bulletManager.spawn(enemy.x, enemy.y, Math.cos(a)*100, Math.sin(a)*100, '#f00', 3);
                 }
            }
        }
    ]
})(null);
