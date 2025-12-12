export default class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    checkCollisions(scene) {
        const player = scene.player;
        const bullets = scene.bulletManager.pool;
        const enemies = scene.enemies;

        // 1. Player vs Enemy Bullets
        for (let i = 0; i < bullets.length; i++) {
            const b = bullets[i];
            if (!b.active) continue;

            // Simple circle collision
            const dist = Math.hypot(player.x - b.x, player.y - b.y);

            // Graze
            if (!b.grazed && dist < player.grazeRadius + b.radius) {
                b.grazed = true;
                scene.hud.graze++;
                scene.hud.score += 500;
                // Graze Spark
                if (scene.particleSystem) {
                    scene.particleSystem.createGraze(player.x + (b.x - player.x) / 2, player.y + (b.y - player.y) / 2);
                }
                // Play Sound
                if (this.game.soundManager && this.game.soundManager.playGraze) {
                     this.game.soundManager.playGraze();
                }
            }

            // Hit
            if (dist < player.radius + b.radius) {
                // Player Hit!
                scene.particleSystem.createExplosion(player.x, player.y, '#f00'); // Big explosion for player death
                player.die();
                b.active = false; // Remove bullet
            }
        }

        // 2. Player Bullets vs Enemies
        const playerBullets = scene.playerBulletManager.pool;

        for (let i = 0; i < playerBullets.length; i++) {
            const pb = playerBullets[i];
            if (!pb.active) continue;

            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                if (!enemy.active) continue;

                // Simple AABB/Circle check
                const dist = Math.hypot(pb.x - enemy.x, pb.y - enemy.y);
                if (dist < enemy.radius + 8) { // 8 is approx bullet radius
                    enemy.takeDamage(pb.damage);

                    // Impact Effect
                    if (scene.particleSystem) {
                         // Spark impact
                        scene.particleSystem.spawnParticle(pb.x, pb.y, (Math.random()-0.5)*200, (Math.random()-0.5)*200, pb.color || '#fff', 0.2, 3);
                    }

                    if (!pb.piercing) {
                        pb.active = false;
                        scene.hud.score += 10;
                        break; // Bullet hits one enemy and dies
                    } else {
                        // Piercing bullet (Laser)
                        // Add score but don't destroy bullet
                        // To prevent massive score farming on one enemy per frame, maybe reduce score or only add on first hit?
                        // For now, just add score.
                        scene.hud.score += 1; // Lower score for continuous hits
                        // Don't break, check other enemies (piercing)
                    }
                }
            }
        }
    }
}
