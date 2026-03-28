export default class DialogueManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.lines = [];
        this.currentLineIndex = 0;
        this.leftPortrait = null;
        this.leftPortrait = null;
        this.rightPortrait = null;
        this.inputCooldown = 0;
        this.flashSafeBounds = null;
    }

    startDialogue(lines) {
        this.lines = lines;
        this.currentLineIndex = 0;
        this.active = true;
        this.flashSafeBounds = null;

        // Prime portrait lookups so first rendered line is less likely to pop-in.
        if (this.game.resourceManager) {
            for (const line of lines) {
                if (!line?.name || line.name === 'System') continue;
                const lower = line.name.toLowerCase();
                const first = lower.split(' ')[0];
                this.game.resourceManager.getImage(`portrait_${lower}`);
                this.game.resourceManager.getImage(`portrait_${first}`);
                this.game.resourceManager.getImage(lower);
                this.game.resourceManager.getImage(first);
            }
        }

        this.game.sceneManager.currentScene.paused = true; // Pause game logic
    }

    next() {
        this.currentLineIndex++;
        if (this.currentLineIndex >= this.lines.length) {
            this.endDialogue();
        }
    }

    endDialogue() {
        this.active = false;
        this.flashSafeBounds = null;
        this.game.sceneManager.currentScene.paused = false; // Resume game logic
    }

    update(dt) {
        if (!this.active) return;

        if (this.inputCooldown > 0) {
            this.inputCooldown -= dt;
        }

        // Only advance on key press (not hold) - fix for shooting issue
        const shootPressed = this.game.input.isDown('SHOOT');

        if (shootPressed && !this.lastShootState && this.inputCooldown <= 0) {
            this.next();
            this.inputCooldown = 0.3; // Longer delay to prevent accidental skips
        }

        this.lastShootState = shootPressed;
    }

    render(renderer) {
        if (!this.active) return;

        const line = this.lines[this.currentLineIndex];
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // EoSD-style dialogue box at bottom
        const boxX = 10;
        const boxY = h - 120;
        const boxW = w - 20;
        const boxH = 110;
        const hasName = !!line.name && line.name !== 'System';
        const nameBoxW = 150;
        const nameBoxH = 30;
        const nameBoxX = line.side === 'left' ? boxX + 10 : boxX + boxW - nameBoxW - 10;
        const nameBoxY = boxY - 47; // Raise 12px from previous position.

        // Draw semi-transparent black background ONLY if not system message or if explicitly needed
        // Actually, system messages might need a box too, but maybe different style?
        // The issue "weird purple box" likely refers to the name box being drawn when it shouldn't.

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Draw white border (EoSD style)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Inner border (double border effect)
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX + 5, boxY + 5, boxW - 10, boxH - 10);

        // Draw dialogue text (word wrap)
        ctx.fillStyle = '#fff';
        ctx.font = '18px "Times New Roman", serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 2;

        // Simple word wrap
        const maxWidth = boxW - 40;
        const lineHeight = 24;
        const words = line.text.split(' ');
        let currentLine = '';
        let y = boxY + 20;

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(currentLine, boxX + 20, y);
                currentLine = words[i] + ' ';
                y += lineHeight;
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine, boxX + 20, y);
        ctx.shadowBlur = 0;

        // Draw continue indicator (EoSD style)
        if (this.currentLineIndex < this.lines.length - 1) {
            const indicatorX = boxX + boxW - 30;
            const indicatorY = boxY + boxH - 25;
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;

            ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▼', indicatorX, indicatorY);
        }

        // Draw character portraits
        const portraitSize = 128; // Larger portraits
        const portraitY = boxY - portraitSize - 12; // Raise 12px from current position.

        // Exclude dialogue UI from screen flash overlay in GameScene.
        const safeTop = hasName ? Math.min(portraitY - 8, nameBoxY - 8) : (portraitY - 8);
        this.flashSafeBounds = {
            x: 10,
            y: Math.max(0, safeTop),
            width: Math.max(0, w - 20),
            height: Math.max(0, (boxY + boxH + 8) - safeTop)
        };

        // Left Portrait (Player/Ally)
        if (line.side === 'left') {
            const charName = line.name.toLowerCase(); // e.g., 'reimu', 'marisa'
            const portraitKey = `portrait_${charName}`;

            // Check if portrait exists
            const hasPortrait = this.game.resourceManager.getImage(portraitKey);
            const fallbackPortraitKey = `portrait_${charName.split(' ')[0]}`;
            let keyToUse = null;
            if (hasPortrait) {
                keyToUse = portraitKey;
            } else if (this.game.resourceManager.getImage(fallbackPortraitKey)) {
                keyToUse = fallbackPortraitKey;
            } else if (this.game.resourceManager.getImage(charName)) {
                keyToUse = charName;
            } else {
                const shortName = charName.split(' ')[0];
                if (this.game.resourceManager.getImage(shortName)) {
                    keyToUse = shortName;
                }
            }

            if (keyToUse) {
                ctx.save();
                const x = 80;
                const y = portraitY + portraitSize / 2;

                // Glow effect for active speaker
                ctx.shadowColor = '#f00';
                ctx.shadowBlur = 20;

                renderer.drawSprite(keyToUse, x, y, portraitSize, portraitSize);
                ctx.restore();
            }
        }
        // Right Portrait (Enemy/Boss)
        else {
            const charName = line.name.toLowerCase().split(' ')[0]; // e.g. 'rumia' from 'Rumia'
            const portraitKey = `portrait_${charName}`;

            // Check if portrait exists
            const hasPortrait = this.game.resourceManager.getImage(portraitKey);
            let keyToUse = null;
            if (hasPortrait) {
                keyToUse = portraitKey;
            } else if (this.game.resourceManager.getImage(charName)) {
                keyToUse = charName;
            }

            if (keyToUse) {
                ctx.save();
                const x = w - 80;
                const y = portraitY + portraitSize / 2;

                // Glow effect for active speaker
                ctx.shadowColor = '#f0f';
                ctx.shadowBlur = 20;

                renderer.drawSprite(keyToUse, x, y, portraitSize, portraitSize);
                ctx.restore();
            }
        }

        // Draw character name box over portrait so it never appears behind it.
        if (hasName) {
            // Name box background
            ctx.fillStyle = line.side === 'left' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(128, 0, 128, 0.9)';
            ctx.fillRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);

            // Name box border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);

            // Draw name text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(line.name, nameBoxX + nameBoxW / 2, nameBoxY + nameBoxH / 2);
        }
    }
}
