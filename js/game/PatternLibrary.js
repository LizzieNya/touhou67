export const PatternLibrary = {
    // Helper: Get angle to player
    getAngleToPlayer: (source, player) => {
        return Math.atan2(player.y - source.y, player.x - source.x);
    },

    getDifficultyMultiplier: (scene) => {
        const diff = scene.difficulty || 'Normal';
        if (diff === 'Easy') return 0.2;
        if (diff === 'Normal') return 0.4;
        if (diff === 'Hard') return 1.0;
        if (diff === 'Lunatic') return 1.4;
        return 0.4;
    },

    getQuantityMultiplier: (scene) => {
        const diff = scene.difficulty || 'Normal';
        if (diff === 'Easy') return 0.5;
        if (diff === 'Normal') return 0.8;
        if (diff === 'Hard') return 1.0;
        if (diff === 'Lunatic') return 1.2;
        return 0.8;
    },

    // 1. N-Way Spread
    // Fires n bullets in a spread centered on 'angle'
    nWay: (scene, x, y, n, angle, spread, speed, color, radius, accel = 0, angularVelocity = 0) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        n = Math.max(1, Math.floor(n * PatternLibrary.getQuantityMultiplier(scene)));

        if (n <= 1) {
            scene.bulletManager.spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, radius, accel, angularVelocity);
            return;
        }
        const startAngle = angle - spread / 2;
        const step = spread / (n - 1);
        for (let i = 0; i < n; i++) {
            const a = startAngle + step * i;
            scene.bulletManager.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, radius, accel, angularVelocity);
        }
    },

    // 2. Circle (Ring)
    // Fires a full ring of n bullets
    circle: (scene, x, y, n, speed, color, radius, offsetAngle = 0, accel = 0, angularVelocity = 0) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        n = Math.max(1, Math.floor(n * PatternLibrary.getQuantityMultiplier(scene)));

        const step = (Math.PI * 2) / n;
        for (let i = 0; i < n; i++) {
            const a = offsetAngle + step * i;
            scene.bulletManager.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, radius, accel, angularVelocity);
        }
    },

    // Alias for circle
    ring: (scene, x, y, n, speed, color, radius, offsetAngle = 0, accel = 0, angularVelocity = 0) => {
        PatternLibrary.circle(scene, x, y, n, speed, color, radius, offsetAngle, accel, angularVelocity);
    },

    // 3. Spiral
    // Fires a single bullet that contributes to a spiral shape (call this every frame or interval)
    // 't' is a time or counter variable to rotate the emitter
    spiral: (scene, x, y, t, speed, color, radius, spinSpeed = 1, arms = 1, accel = 0, angularVelocity = 0) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        // Arms count scaling? Maybe not for spiral as it might break the shape.
        // Let's keep arms as is for now, or scale it carefully.
        // arms = Math.max(1, Math.floor(arms * PatternLibrary.getQuantityMultiplier(scene))); 

        for (let i = 0; i < arms; i++) {
            const a = t * spinSpeed + (Math.PI * 2 / arms) * i;
            scene.bulletManager.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, radius, accel, angularVelocity);
        }
    },

    // 4. Aimed Shot
    // Fires directly at the player
    aimed: (scene, source, speed, color, radius, accel = 0, angularVelocity = 0) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        const angle = PatternLibrary.getAngleToPlayer(source, scene.player);
        scene.bulletManager.spawn(source.x, source.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, radius, accel, angularVelocity);
    },

    // 5. Aimed N-Way
    // Fires an N-Way spread aimed at the player
    aimedNWay: (scene, source, n, spread, speed, color, radius, accel = 0, angularVelocity = 0) => {
        const angle = PatternLibrary.getAngleToPlayer(source, scene.player);
        // n scaling is handled inside nWay
        PatternLibrary.nWay(scene, source.x, source.y, n, angle, spread, speed, color, radius, accel, angularVelocity);
    },

    // 6. Random Spray
    // Fires n bullets randomly within a cone
    randomSpray: (scene, x, y, n, angle, spread, minSpeed, maxSpeed, color, radius) => {
        const mult = PatternLibrary.getDifficultyMultiplier(scene);
        minSpeed *= mult;
        maxSpeed *= mult;
        n = Math.max(1, Math.floor(n * PatternLibrary.getQuantityMultiplier(scene)));

        for (let i = 0; i < n; i++) {
            const a = angle - spread / 2 + Math.random() * spread;
            const s = minSpeed + Math.random() * (maxSpeed - minSpeed);
            scene.bulletManager.spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, color, radius);
        }
    },

    // 7. Flower
    // Creates a flower-like pattern by modulating speed with angle
    flower: (scene, x, y, n, petals, baseSpeed, petalSpeed, color, radius, offsetAngle = 0) => {
        const mult = PatternLibrary.getDifficultyMultiplier(scene);
        baseSpeed *= mult;
        petalSpeed *= mult;
        n = Math.max(1, Math.floor(n * PatternLibrary.getQuantityMultiplier(scene)));

        const step = (Math.PI * 2) / n;
        for (let i = 0; i < n; i++) {
            const a = offsetAngle + step * i;
            // Modulate speed to create petals
            // speed = base + petal_amplitude * sin(petals * angle)
            const s = baseSpeed + petalSpeed * Math.sin(petals * (a - offsetAngle));
            scene.bulletManager.spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, color, radius);
        }
    },

    // 8. Whip / Curving Stream
    // Bullets that start in a direction but curve over time
    whip: (scene, x, y, angle, speed, curveAmount, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        scene.bulletManager.spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, radius, 0, curveAmount);
    },

    // === SCARLET DEVIL THEMED PATTERNS ===

    // 9. Knife Scatter (Sakuya-style)
    // Throws knives that fall downward like Sakuya's iconic attack
    knifeScatter: (scene, x, y, n, spread, speed, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        n = Math.max(1, Math.floor(n * PatternLibrary.getQuantityMultiplier(scene)));

        for (let i = 0; i < n; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread; // Downward with spread
            const s = speed * (0.8 + Math.random() * 0.4); // Vary speed
            const accel = 50; // Gravity-like acceleration
            scene.bulletManager.spawn(x, y, Math.cos(angle) * s, Math.sin(angle) * s, color, radius, accel, 0);
        }
    },

    // 10. Crimson Spiral (Remilia-style)
    // Red/crimson double spiral like blood magic
    crimsonSpiral: (scene, x, y, t, speed, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);

        // Counter-rotating double spiral
        const angle1 = t * 3;
        const angle2 = -t * 3;

        scene.bulletManager.spawn(x, y, Math.cos(angle1) * speed, Math.sin(angle1) * speed, color, radius);
        scene.bulletManager.spawn(x, y, Math.cos(angle2) * speed, Math.sin(angle2) * speed, color, radius);
    },

    // 11. Bat Wing Formation
    // V-shaped bat wing pattern
    batWing: (scene, x, y, n, angle, width, speed, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        n = Math.max(3, Math.floor(n * PatternLibrary.getQuantityMultiplier(scene)));

        const halfN = Math.floor(n / 2);

        // Left wing
        for (let i = 0; i < halfN; i++) {
            const a = angle - width / 2 + (i / halfN) * (width / 2);
            scene.bulletManager.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, radius);
        }

        // Right wing
        for (let i = 0; i < halfN; i++) {
            const a = angle + (i / halfN) * (width / 2);
            scene.bulletManager.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, radius);
        }
    },

    // 12. Blood Moon Cascade
    // Cascading waves from above like moonlight through blood
    bloodMoonCascade: (scene, x, y, waves, bulletsPerWave, waveDelay, speed, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        bulletsPerWave = Math.max(3, Math.floor(bulletsPerWave * PatternLibrary.getQuantityMultiplier(scene)));

        for (let wave = 0; wave < waves; wave++) {
            setTimeout(() => {
                const waveX = x + (Math.random() - 0.5) * 100;
                PatternLibrary.circle(scene, waveX, y, bulletsPerWave, speed, color, radius, wave * 0.3);
            }, wave * waveDelay);
        }
    },

    // 13. Chaotic Night
    // Random bullets from multiple points (like bats attacking)
    chaoticNight: (scene, centerX, centerY, points, bulletsPerPoint, radius, speed, color, bulletRadius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        bulletsPerPoint = Math.max(1, Math.floor(bulletsPerPoint * PatternLibrary.getQuantityMultiplier(scene)));

        for (let p = 0; p < points; p++) {
            const angle = (p / points) * Math.PI * 2;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;

            for (let b = 0; b < bulletsPerPoint; b++) {
                const shootAngle = Math.random() * Math.PI * 2;
                scene.bulletManager.spawn(px, py, Math.cos(shootAngle) * speed, Math.sin(shootAngle) * speed, color, bulletRadius);
            }
        }
    },

    // 14. Gungnir Spear (Remilia's iconic attack)
    // Focused laser-like bullet stream
    gungnir: (scene, x, y, targetX, targetY, count, spread, speed, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        count = Math.max(3, Math.floor(count * PatternLibrary.getQuantityMultiplier(scene)));

        const angle = Math.atan2(targetY - y, targetX - x);

        for (let i = 0; i < count; i++) {
            const a = angle + (Math.random() - 0.5) * spread;
            const delay = i * 30; // Slight delay between bullets for stream effect
            setTimeout(() => {
                scene.bulletManager.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, radius);
            }, delay);
        }
    },

    // 15. Vampire Fangs
    // Twin converging streams like vampire fangs
    vampireFangs: (scene, x, y, angle, spread, speed, count, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        count = Math.max(2, Math.floor(count * PatternLibrary.getQuantityMultiplier(scene)));

        const leftAngle = angle - spread / 2;
        const rightAngle = angle + spread / 2;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                scene.bulletManager.spawn(x - 20, y, Math.cos(leftAngle) * speed, Math.sin(leftAngle) * speed, color, radius);
                scene.bulletManager.spawn(x + 20, y, Math.cos(rightAngle) * speed, Math.sin(rightAngle) * speed, color, radius);
            }, i * 50);
        }
    },

    // 16. Scarlet Web
    // Star-burst pattern with connecting streams (like a spider web of blood)
    scarletWeb: (scene, x, y, arms, bulletsPerArm, speed, color, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        bulletsPerArm = Math.max(2, Math.floor(bulletsPerArm * PatternLibrary.getQuantityMultiplier(scene)));
        arms = Math.max(4, Math.floor(arms * PatternLibrary.getQuantityMultiplier(scene)));

        for (let arm = 0; arm < arms; arm++) {
            const baseAngle = (arm / arms) * Math.PI * 2;

            for (let b = 0; b < bulletsPerArm; b++) {
                const bulletSpeed = speed * (0.5 + b * 0.1);
                setTimeout(() => {
                    scene.bulletManager.spawn(x, y, Math.cos(baseAngle) * bulletSpeed, Math.sin(baseAngle) * bulletSpeed, color, radius);
                }, b * 100);
            }
        }
    },

    // === FLANDRE SCARLET THEMED PATTERNS ===

    // === FLANDRE SCARLET THEMED PATTERNS ===

    // 17. Starbow Break
    // Explodes into rainbow bullets
    starbow: (scene, x, y, speed, radius) => {
        speed *= PatternLibrary.getDifficultyMultiplier(scene);
        const colors = ['#f00', '#ff7f00', '#ff0', '#0f0', '#00f', '#4b0082', '#9400d3']; // ROYGBIV
        const points = 7;
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const color = colors[i % colors.length];
            
            // Dense line of bullets for each star point
            for (let j = 0; j < 10; j++) {
                const s = speed * (0.5 + j * 0.1);
                scene.bulletManager.spawn(x, y, Math.cos(angle) * s, Math.sin(angle) * s, color, radius);
            }
        }
    },

    // 18. Laevateinn Beam
    // Simulates a giant sword swipe using a chaotic line of bullets
    laevateinnBeam: (scene, x, y, angle, length, speed, color, radius) => {
        // speed here controls the expansion of the beam sideways or its movement
        // Actually, let's make it spawn a line that drifts
        
        const count = 20; 
        for (let i = 0; i < count; i++) {
            const dist = (i / count) * length;
            const bx = x + Math.cos(angle) * dist;
            const by = y + Math.sin(angle) * dist;
            
            // Bullets that persist but move slowly perpendicular to the beam
            const driftAngle = angle + Math.PI / 2;
            scene.bulletManager.spawn(bx, by, Math.cos(driftAngle) * speed, Math.sin(driftAngle) * speed, color, radius);
        }
    }
};
