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
        if (this.currentStage === 'Menu' || this.currentStage === 'Menu7') {
            w = this.game.width;
        }

        // Check if image is valid and loaded
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            const h = this.game.height;
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
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.fill();
            });
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
            ctx.globalCompositeOperation = 'exclusion'; 
            ctx.fillStyle = bossColor;
            ctx.globalAlpha = 0.5;
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
}
