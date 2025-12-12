export default class LoadingScene {
    constructor(game, targetScene, character = null) {
        this.game = game;
        this.targetScene = targetScene;
        this.character = character || 'Loading'; // Use 'Loading' if no character specified
        this.progress = 0;
        this.loadingSpeed = 5.0; // Progress per second (much faster!)
        this.minDisplayTime = 0.15; // Minimum time to show loading (very brief)
        this.elapsedTime = 0;

        // Atmospheric messages (Touhou style)
        this.messages = this.getMessages(this.character);
        this.currentMessageIndex = 0;
        this.messageTimer = 0;
        this.messageInterval = 1.0; // Change message every 1 second
    }

    getMessages(character) {
        const genericMessages = [
            "Now loading...",
            "Please wait warmly...",
            "Preparing danmaku...",
            "Loading bullet patterns...",
            "Adjusting difficulty..."
        ];

        const characterMessages = {
            'Reimu': [
                "Reimu is preparing her shrine maiden duties...",
                "Checking ofuda stock...",
                "The shrine maiden stretches before battle..."
            ],
            'Marisa': [
                "Marisa is borrowing equipment...",
                "Checking mini-hakkero fuel...",
                "The ordinary magician prepares her spells..."
            ],
            'Sakuya': [
                "Sakuya is adjusting her pocket watch...",
                "Preparing knife arsenal...",
                "The elegant maid sets the stage..."
            ],
            'Youmu': [
                "Youmu is training with her swords...",
                "Sharpening Roukanken and Hakurouken...",
                "The half-phantom focuses her mind..."
            ],
            'Sanae': [
                "Sanae is praying to the mountain gods...",
                "Requesting divine blessings...",
                "The shrine maiden gathers miracles..."
            ],
            'Remilia': [
                "Remilia is adjusting her parasol...",
                "The scarlet devil prepares Gungnir...",
                "The mistress of the night awakens..."
            ],
            'Flandre': [
                "Flandre is being let out of the basement...",
                "Charging up destructive power...",
                "The little sister gets ready to play..."
            ]
        };

        // Combine character-specific messages with generic ones
        const charMsgs = characterMessages[character] || [];
        return [...charMsgs, ...genericMessages];
    }

    update(dt) {
        this.elapsedTime += dt;
        this.messageTimer += dt;

        // Cycle through messages
        if (this.messageTimer >= this.messageInterval) {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
            this.messageTimer = 0;
        }

        // Update progress
        this.progress += this.loadingSpeed * dt;

        // Once loaded and minimum time passed, switch to target scene
        if (this.progress >= 1.0 && this.elapsedTime >= this.minDisplayTime) {
            this.game.sceneManager.changeScene(this.targetScene);
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background - Dark with subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Title text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f00';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px "Times New Roman", serif';
        ctx.fillText('Loading...', w / 2, h / 2 - 80);
        ctx.shadowBlur = 0;
        ctx.restore();

        // Current message (atmospheric text)
        ctx.fillStyle = '#aaa';
        ctx.font = 'italic 20px "Times New Roman", serif';
        ctx.textAlign = 'center';
        const currentMessage = this.messages[this.currentMessageIndex];
        ctx.fillText(currentMessage, w / 2, h / 2 - 30);

        // Loading bar background
        const barWidth = 300;
        const barHeight = 30;
        const barX = (w - barWidth) / 2;
        const barY = h / 2;

        // Bar background (dark)
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Bar border
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Progress fill (gradient from red to white)
        const fillWidth = Math.min(this.progress, 1.0) * barWidth;
        if (fillWidth > 0) {
            const fillGradient = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
            fillGradient.addColorStop(0, '#f00');
            fillGradient.addColorStop(0.5, '#f88');
            fillGradient.addColorStop(1, '#fff');
            ctx.fillStyle = fillGradient;
            ctx.fillRect(barX, barY, fillWidth, barHeight);

            // Glow effect
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f00';
            ctx.fillRect(barX, barY, fillWidth, barHeight);
            ctx.restore();
        }

        // Progress percentage
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        const percentage = Math.floor(Math.min(this.progress, 1.0) * 100);
        ctx.fillText(`${percentage}%`, w / 2, barY + barHeight + 30);

        // Decorative elements (spinning bullets)
        const spinSpeed = Date.now() / 500;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + spinSpeed;
            const radius = 150;
            const x = w / 2 + Math.cos(angle) * radius;
            const y = h / 2 + Math.sin(angle) * radius;

            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = i % 2 === 0 ? '#f00' : '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Footer hint
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Please wait warmly until it is ready...', w / 2, h - 30);
    }
}
