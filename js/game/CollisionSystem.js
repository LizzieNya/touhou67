export default class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    checkCollisions(scene) {
        const player = scene.player;
        const bullets = scene.bulletManager.pool;
        const enemies = scene.enemies;

        // Pre-calculate squared radii for player
        const grazeDistSq = (player.grazeRadius + 5) * (player.grazeRadius + 5); // Approx bullet radius 5
        const hitDistSq = (player.radius + 3) * (player.radius + 3); // Approx bullet radius 3 (smaller hitbox)
        
        // 1. Player vs Enemy Bullets
        if (playerVulnerable) {
            const grazeDistSq = (player.grazeRadius + 5) * (player.grazeRadius + 5);
            const hitDistSq = (player.radius + 3) * (player.radius + 3);
            
            for (let i = 0; i < scene.bulletManager.activeCount; i++) {
                const b = bullets[i];
                if (!b.active) continue;

            const dx = player.x - b.x;
            const dy = player.y - b.y;
            const distSq = dx * dx + dy * dy;
            
            // Graze
            if (!b.grazed) {
                const gDist = player.grazeRadius + b.radius;
                if (distSq < gDist * gDist) {
                    b.grazed = true;
                    scene.hud.graze++;
                    scene.hud.score += 500;
                    // Graze Spark (visual only, keep lightweight)
                    if (scene.particleSystem) {
                        scene.particleSystem.createGraze(player.x + dx / 2, player.y + dy / 2);
                    }
                    if (this.game.soundManager && this.game.soundManager.playGraze) {
                         this.game.soundManager.playGraze();
                    }
                }
            }

                // Hit
                const hDist = player.radius + b.radius * 0.7;
                if (distSq < hDist * hDist) {
                    scene.particleSystem.createExplosion(player.x, player.y, '#f00');
                    player.die();
                    b.active = false;
                }
            }
        } else if (!player.invulnerable) {
            // Still process grazes even if god mode is on
            for (let i = 0; i < scene.bulletManager.activeCount; i++) {
                const b = bullets[i];
                if (!b.active || b.grazed) continue;

                const dx = player.x - b.x;
                const dy = player.y - b.y;
                const gDist = player.grazeRadius + b.radius;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < gDist * gDist) {
                    b.grazed = true;
                    scene.hud.graze++;
                    scene.hud.score += 500;
                    // Skip effects in god mode for performance
                }
            }
        }

        // 2. Player Bullets vs Enemies - unchanged but optimized loop
        const playerBullets = scene.playerBulletManager.pool;
        
        // Loop enemies first if fewer? No, usually fewer enemies, but many P-bullets.
        // O(Pb * E) is fine.
        
        for (let i = 0; i < playerBullets.length; i++) {
            const pb = playerBullets[i];
            if (!pb.active) continue;

            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                if (!enemy.active) continue;

                const dx = pb.x - enemy.x;
                const dy = pb.y - enemy.y;
                const distSq = dx * dx + dy * dy;
                const hitDist = enemy.radius + pb.width/2; // Approx

                if (distSq < hitDist * hitDist) {
                    enemy.takeDamage(pb.damage);

                    // Impact Effect (Throttle?)
                    if (scene.particleSystem && Math.random() < 0.3) {
                        scene.particleSystem.spawnParticle(pb.x, pb.y, (Math.random()-0.5)*200, (Math.random()-0.5)*200, pb.color || '#fff', 0.2, 3);
                    }

                    if (!pb.piercing) {
                        pb.active = false;
                        scene.hud.score += 10;
                        break;
                    } else {
                        scene.hud.score += 1;
                    }
                }
            }
        }
    }
}
