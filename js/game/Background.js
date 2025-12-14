export default class Background {
    constructor(game) {
        this.game = game;
        this.y = 0;
        this.speed = 15; // Slowed down from 50
        this.image = null;
        this.currentStage = null;
        
        // Atmosphere
        this.clouds = [];
        for(let i=0; i<20; i++) {
            this.clouds.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: 50 + Math.random() * 100,
                speed: 20 + Math.random() * 30,
                alpha: 0.1 + Math.random() * 0.2
            });
        }
    }

    update(dt) {
        // Check if stage changed
        const scene = this.game.sceneManager.currentScene;
        if (scene && scene.stage !== this.currentStage) {
            this.currentStage = scene.stage;
            this.loadBackgroundImage(this.currentStage);
        }

        if (this.currentStage !== 'Menu' && this.currentStage !== 'Menu7') {
            this.y += this.speed * dt;
        }

        // Reset y is handled in render for images, but for grid fallback:
        if (!this.image && this.y >= this.game.height) {
            this.y = 0;
        }

        // Update Clouds
        this.clouds.forEach(cloud => {
            cloud.y += cloud.speed * dt;
            if (cloud.y > this.game.height + cloud.size) {
                cloud.y = -cloud.size;
                cloud.x = Math.random() * (this.game.playAreaWidth || this.game.width);
            }
        });
        
        // Update Stars/Dust
        if (!this.stars) {
            this.stars = [];
            for(let i=0; i<50; i++) {
                this.stars.push({
                    x: Math.random() * (this.game.playAreaWidth || this.game.width),
                    y: Math.random() * this.game.height,
                    speed: 5 + Math.random() * 10,
                    size: Math.random() * 2,
                    alpha: 0.3 + Math.random() * 0.7
                });
            }
        }
        
        this.stars.forEach(star => {
            star.y += star.speed * dt;
            if (star.y > this.game.height) {
                star.y = 0;
                star.x = Math.random() * (this.game.playAreaWidth || this.game.width);
            }
        });

        // Update Petals (Foreground)
        if (!this.petals) {
            this.petals = [];
            for(let i=0; i<15; i++) {
                this.petals.push({
                    x: Math.random() * (this.game.playAreaWidth || this.game.width),
                    y: Math.random() * this.game.height,
                    vx: 10 + Math.random() * 10, // Drift right
                    vy: 30 + Math.random() * 20, // Fall down
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 2,
                    size: 4 + Math.random() * 3,
                    color: '#fce' // Pink
                });
            }
        }

        this.petals.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rotation += p.rotSpeed * dt;
            // Oscillate sway
            p.x += Math.sin(this.game.accumulator + p.y * 0.01) * 0.5;

            if (p.y > this.game.height + 10) {
                p.y = -10;
                p.x = Math.random() * (this.game.playAreaWidth || this.game.width) - 50; // Allow drift in from left
            }
            if (p.x > (this.game.playAreaWidth || this.game.width) + 10) {
                p.x = -10;
            }
        });
    }

    loadBackgroundImage(stage) {
        let imageName = 'stage1_bg'; // Default

        if (typeof stage === 'number') {
            imageName = `stage${stage}_bg`;
        } else if (stage === 'Extra') {
            imageName = 'stage_extra_bg';
        } else if (typeof stage === 'string' && stage.startsWith('Boss')) {
            if (stage.includes('Rumia')) imageName = 'stage1_bg';
            else if (stage.includes('Cirno')) imageName = 'stage2_bg';
            else if (stage.includes('Meiling')) imageName = 'stage3_bg';
            else if (stage.includes('Patchouli')) imageName = 'stage4_bg';
            else if (stage.includes('Sakuya')) imageName = 'stage5_bg';
            else if (stage.includes('Remilia')) imageName = 'stage6_bg';
            else imageName = 'stage_extra_bg';
        } else if (stage === 'Menu') {
            imageName = 'mainmenu_bg';
        } else if (stage === 'Menu7') {
            imageName = 'mainmenu7_bg';
        }

        this.image = this.game.resourceManager.getImage(imageName);

        if (!this.image) {
            console.warn(`Background image '${imageName}' not found. Using default grid.`);
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        let w = this.game.playAreaWidth || this.game.width;
        const h = this.game.height; // Moved definition of h here

        if (this.currentStage === 'Menu' || this.currentStage === 'Menu7') {
            w = this.game.width;
        }

        // Check if image is valid and loaded
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            const imgW = this.image.naturalWidth;
            const imgH = this.image.naturalHeight;

            // Scale to cover (Math.max of width ratio and height ratio)
            const scale = Math.max(w / imgW, h / imgH);
            const scaledW = imgW * scale;
            const scaledH = imgH * scale;

            // Center horizontally if wider
            const offsetX = (w - scaledW) / 2;

            // Reset y if it goes past the image height
            if (this.y >= scaledH) {
                this.y = this.y % scaledH;
            }
            const scrollY = this.y;

            // Draw first copy
            ctx.drawImage(this.image, offsetX, scrollY, scaledW, scaledH);

            // Draw second copy above it
            if (this.currentStage !== 'Menu' && this.currentStage !== 'Menu7') {
                ctx.drawImage(this.image, offsetX, scrollY - scaledH, scaledW, scaledH);
            }

        } else {
            // Fallback: Simple scrolling grid/starfield
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, w, this.game.height);

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;

            const offset = this.y % 100;

            // Vertical lines
            for (let i = 0; i < w; i += 100) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, this.game.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let i = -100; i < this.game.height; i += 100) {
                ctx.beginPath();
                ctx.moveTo(0, i + offset);
                ctx.lineTo(w, i + offset);
                ctx.stroke();
            }
        }

        // Render Clouds/Fog
        if (this.currentStage !== 'Menu' && this.currentStage !== 'Menu7') {
            ctx.save();
            this.clouds.forEach(cloud => {
                ctx.globalAlpha = cloud.alpha;
                const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.size);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
            
            // Render Stars/Dust
            ctx.save();
            ctx.fillStyle = '#fff';
            if (this.stars) {
                this.stars.forEach(star => {
                   ctx.globalAlpha = star.alpha;
                   ctx.fillRect(star.x, star.y, star.size, star.size);
                });
            }
            ctx.restore();
        }

        // Global Darkening (to make bullets pop)
        if (this.currentStage !== 'Menu' && this.currentStage !== 'Menu7') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Increased from 0.3
            ctx.fillRect(0, 0, w, this.game.height);

            // Bottom Half Gradient Overlay
            const bottomGradient = ctx.createLinearGradient(0, this.game.height / 2, 0, this.game.height);
            bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
            bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)'); // Darkened from 0.7
            ctx.fillStyle = bottomGradient;
            ctx.fillRect(0, this.game.height / 2, w, this.game.height / 2);
        }

        // Spell Card Background Effect (Dynamic Tint)
        const scene = this.game.sceneManager.currentScene;
        let spellActive = false;
        let bossColor = '#fff';
        
        if (scene && scene.enemies) {
            for (const enemy of scene.enemies) {
                if (enemy.isBoss && enemy.active && enemy.isSpellCard) {
                    spellActive = true;
                    bossColor = enemy.color;
                    break;
                }
            }
        }

        if (spellActive) {
            ctx.save();
            // Negative/Magical Tint
            ctx.globalCompositeOperation = 'overlay'; 
            ctx.fillStyle = bossColor;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(0, 0, w, this.game.height);
            
            // Rotating Magic Square Background + Scrolling Lines
            ctx.globalCompositeOperation = 'lighter';
            const time = Date.now() / 2000; // Slow rotation
            
            // Scrolling Lines Effect
            ctx.save();
            ctx.rotate(Math.PI / 4); // 45 degrees
            const offset = (Date.now() / 50) % 100;
            ctx.strokeStyle = bossColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.2;
            
            // Draw lines across a large area to cover rotation
            const diag = Math.sqrt(w*w + h*h);
            for(let i = -diag; i < diag; i+=50) {
                 ctx.beginPath();
                 ctx.moveTo(i + offset, -diag);
                 ctx.lineTo(i + offset, diag);
                 ctx.stroke();
            }
            ctx.restore();

            // Rotating Squares
            ctx.translate(w/2, this.game.height/2);
            ctx.rotate(time);
            
            ctx.strokeStyle = bossColor;
            ctx.globalAlpha = 0.2; // Softer
            ctx.lineWidth = 20; // Thick lines
            
            const maxDim = Math.max(w, this.game.height) * 1.5;
            ctx.strokeRect(-maxDim/2, -maxDim/2, maxDim, maxDim);
            
            ctx.rotate(time); // Rotate faster inner
            ctx.strokeRect(-maxDim/3, -maxDim/3, maxDim*0.66, maxDim*0.66);
            
            ctx.restore();
        }
    }

    renderForeground(renderer) {
        if (!this.petals) return;
        
        const ctx = renderer.ctx;
        ctx.save();
        ctx.fillStyle = '#ffccee'; // Soft pink
        
        this.petals.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            // Draw petal shape (simple oval-ish)
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        ctx.restore();
    }
}
