export default class CharacterSelectScene {
    constructor(game, startStage = 1) {
        this.game = game;
        this.startStage = startStage;
        console.log(`CharacterSelectScene initialized with startStage: ${this.startStage} (${typeof this.startStage})`);

        // Character order depends on game
        if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'nocturnal_sunlight') {
            // Nocturnal Sunlight: Base Roster (Extras hidden)
            this.characters = ['Remilia', 'Flandre', 'Sakuya', 'Reimu', 'Marisa', 'Youmu', 'Sanae'];
            this.extraCharacters = ['Cirno', 'Patchouli', 'Rumia', 'Okuu', 'Nue', 'Parsee', 'Sans'];
            this.extrasUnlocked = false;

            // Cheat Code State
            this.cheatCode = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT'];
            this.cheatIndex = 0;
        } else {
            // Touhou 6/7: Traditional order
            this.characters = ['Reimu', 'Marisa', 'Sakuya', 'Youmu', 'Sanae', 'Remilia', 'Flandre'];
        }


        // Shot types depend on game
        if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'nocturnal_sunlight') {
            // Nocturnal Sunlight: Expanded shot types
            this.shotTypes = ['A', 'B', 'C', 'D', 'E', 'F'];
        } else {
            // Touhou 6/7: Traditional 2 shot types
            this.shotTypes = ['A', 'B'];
        }

        this.selectedCharIndex = 0;
        this.selectedIndex = 0;
        this.selectedShotIndex = 0;
        this.shotScrollOffset = 0; // For scrolling shot types
        this.selectedDiffIndex = 1; // Default Normal
        this.difficulties = ['Easy', 'Normal', 'Hard', 'Lunatic'];
        this.state = 'SELECT_CHAR'; // SELECT_CHAR, SELECT_SHOT, SELECT_DIFF

        this.blinkTimer = 0;

        // Hide HUD
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';
    }

    // ... (update method)

    update(dt) {
        this.blinkTimer += dt;
        const input = this.game.input;

        // Cheat Code Check (Nocturnal Sunlight)
        if (this.game.currentGameManifest && this.game.currentGameManifest.id === 'nocturnal_sunlight' && !this.extrasUnlocked) {
            const nextKey = this.cheatCode[this.cheatIndex];

            if (input.isPressed(nextKey)) {
                this.cheatIndex++;
                if (this.cheatIndex >= this.cheatCode.length) {
                    // Unlock!
                    this.extrasUnlocked = true;
                    this.characters = [...this.characters, ...this.extraCharacters];
                    this.game.soundManager.playExtend(); // Success sound
                    console.log("Extras Unlocked!");
                }
            } else {
                // Check for failure (any other direction pressed)
                const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
                for (const dir of dirs) {
                    if (dir !== nextKey && input.isPressed(dir)) {
                        this.cheatIndex = 0; // Reset
                        break;
                    }
                }
            }
        }

        if (this.state === 'SELECT_CHAR') {
            // ... (char selection logic unchanged)
            if (input.isPressed('LEFT')) {
                this.selectedCharIndex = (this.selectedCharIndex - 1 + this.characters.length) % this.characters.length;
                this.game.soundManager.playMenuMove();
            }
            if (input.isPressed('RIGHT')) {
                this.selectedCharIndex = (this.selectedCharIndex + 1) % this.characters.length;
                this.game.soundManager.playMenuMove();
            }
            // Allow UP/DOWN for scrolling through characters as well
            if (input.isPressed('UP')) {
                this.selectedCharIndex = (this.selectedCharIndex - 1 + this.characters.length) % this.characters.length;
                this.game.soundManager.playMenuMove();
            }
            if (input.isPressed('DOWN')) {
                this.selectedCharIndex = (this.selectedCharIndex + 1) % this.characters.length;
                this.game.soundManager.playMenuMove();
            }
            if (input.isPressed('SHOOT') || input.isPressed('Confirm')) {
                this.state = 'SELECT_SHOT';
                this.selectedShotIndex = 0;
                this.shotScrollOffset = 0;
                this.game.soundManager.playMenuSelect();
            }
            if (input.isPressed('BOMB')) { // Cancel
                this.game.soundManager.playMenuBack();
                import('./TitleScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            }
        } else if (this.state === 'SELECT_SHOT') {
            if (input.isPressed('UP')) {
                this.selectedShotIndex = (this.selectedShotIndex - 1 + this.shotTypes.length) % this.shotTypes.length;
                this.game.soundManager.playMenuMove();
                // Adjust scroll
                if (this.selectedShotIndex < this.shotScrollOffset) {
                    this.shotScrollOffset = this.selectedShotIndex;
                } else if (this.selectedShotIndex >= this.shotTypes.length - 1) { // Wrap around to bottom
                    this.shotScrollOffset = Math.max(0, this.shotTypes.length - 3);
                }
            }
            if (input.isPressed('DOWN')) {
                this.selectedShotIndex = (this.selectedShotIndex + 1) % this.shotTypes.length;
                this.game.soundManager.playMenuMove();
                // Adjust scroll
                if (this.selectedShotIndex >= this.shotScrollOffset + 3) {
                    this.shotScrollOffset = this.selectedShotIndex - 2;
                } else if (this.selectedShotIndex === 0) { // Wrap around to top
                    this.shotScrollOffset = 0;
                }
            }
            if (input.isPressed('SHOOT') || input.isPressed('Confirm')) {
                this.state = 'SELECT_DIFF';
                this.game.soundManager.playMenuSelect();
            }
            if (input.isPressed('BOMB')) { // Cancel
                this.state = 'SELECT_CHAR';
                this.game.soundManager.playMenuBack();
            }
        } else if (this.state === 'SELECT_DIFF') {
            if (input.isPressed('UP')) {
                this.selectedDiffIndex = (this.selectedDiffIndex - 1 + this.difficulties.length) % this.difficulties.length;
                this.game.soundManager.playMenuMove();
            }
            if (input.isPressed('DOWN')) {
                this.selectedDiffIndex = (this.selectedDiffIndex + 1) % this.difficulties.length;
                this.game.soundManager.playMenuMove();
            }
            if (input.isPressed('SHOOT') || input.isPressed('Confirm')) {
                console.log("Difficulty selected, starting game...");
                this.game.soundManager.playMenuSelect();
                this.startGame();
            }
            if (input.isPressed('BOMB')) { // Cancel
                this.state = 'SELECT_SHOT';
                this.game.soundManager.playMenuBack();
            }
        }
    }

    startGame() {
        if (this.starting) return;
        this.starting = true;

        const char = this.characters[this.selectedCharIndex];
        const type = this.shotTypes[this.selectedShotIndex];
        const difficulty = this.difficulties[this.selectedDiffIndex];
        console.log(`Starting game with ${char} Type ${type} Difficulty ${difficulty} at Stage ${this.startStage}`);

        console.log("Loading game with loading screen...");

        // Load both LoadingScene and GameScene
        Promise.all([
            import('./LoadingScene.js'),
            import('./GameScene.js')
        ]).then(([loadingModule, gameModule]) => {
            console.log("Modules loaded. Creating GameScene...");
            try {
                // Create the target scene
                const gameScene = new gameModule.default(this.game, this.startStage, char, type, difficulty);

                // Create loading scene with target scene
                const loadingScene = new loadingModule.default(this.game, gameScene, char);

                console.log("Switching to loading screen...");
                this.game.sceneManager.changeScene(loadingScene);
            } catch (e) {
                console.error("Error creating scenes:", e);
                this.starting = false;
            }
        }).catch(err => {
            console.error("Failed to load modules:", err);
            this.starting = false;
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        const bg = this.game.resourceManager.getImage('mainmenu_bg');
        if (bg) {
            ctx.drawImage(bg, 0, 0, w, h);
            // Dark overlay to make text pop
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, w, h);
        } else {
            // Fallback gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#200');
            gradient.addColorStop(1, '#000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }

        // Header
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f00';
        ctx.fillText("Character Select", w / 2, 50);
        ctx.shadowBlur = 0;

        // Scrollable character display
        // Show 3 characters at a time, with selected in center
        const visibleCount = 3;
        const charWidth = 120;
        const charHeight = 180;
        const spacing = 200;
        const centerX = w / 2;
        const charY = 100;

        // Calculate which characters to show
        const startIndex = Math.max(0, this.selectedCharIndex - 1);
        const endIndex = Math.min(this.characters.length, startIndex + visibleCount);

        // Adjust start if we're near the end
        const actualStart = Math.max(0, Math.min(startIndex, this.characters.length - visibleCount));

        // Render visible characters
        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];

            // Calculate position relative to selected character
            const offsetFromSelected = i - this.selectedCharIndex;
            const x = centerX + offsetFromSelected * spacing;

            // Only render if on screen (with margin)
            if (x < -charWidth || x > w + charWidth) continue;

            const isSelected = (this.state === 'SELECT_CHAR' && i === this.selectedCharIndex) ||
                (this.state === 'SELECT_SHOT' && i === this.selectedCharIndex) ||
                (this.state === 'SELECT_DIFF' && i === this.selectedCharIndex);

            // Calculate alpha based on distance from center
            const distanceFromCenter = Math.abs(offsetFromSelected);
            const alpha = Math.max(0.3, 1.0 - distanceFromCenter * 0.3);

            ctx.save();
            ctx.globalAlpha = alpha;

            // Selection Glow
            if (isSelected) {
                ctx.save();
                const glowAlpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 5)) * 0.5;
                ctx.shadowBlur = 20;
                ctx.shadowColor = char === 'Reimu' ? '#f00' : (char === 'Marisa' ? '#ff0' : '#aaf');
                ctx.strokeStyle = `rgba(255, 255, 255, ${glowAlpha})`;
                ctx.lineWidth = 4;
                ctx.strokeRect(x - charWidth / 2 - 10, charY - 10, charWidth + 20, charHeight + 20);
                ctx.restore();
            }

            // Portrait
            const portraitKey = `portrait_${char.toLowerCase()}`;
            renderer.drawSprite(portraitKey, x, charY + charHeight / 2, charWidth, charHeight);

            // Name
            ctx.textAlign = 'center';
            ctx.font = isSelected ? 'bold 28px "Times New Roman", serif' : '24px "Times New Roman", serif';
            ctx.fillStyle = isSelected ? '#fff' : '#888';
            ctx.fillText(char, x, charY + charHeight + 40);

            ctx.restore();

            // Stats (Only if selected and centered)
            if (isSelected && offsetFromSelected === 0) {
                const statsY = charY + charHeight + 60;
                this.drawStats(ctx, char, x, statsY);
            }
        }

        // Scroll indicators
        if (this.state === 'SELECT_CHAR') {
            ctx.globalAlpha = 0.7;
            ctx.font = 'bold 48px "Times New Roman", serif';
            ctx.fillStyle = '#fff';

            // Left arrow
            if (this.selectedCharIndex > 0) {
                const leftAlpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 3)) * 0.5;
                ctx.globalAlpha = leftAlpha;
                ctx.fillText('◄', 50, charY + charHeight / 2);
            }

            // Right arrow
            if (this.selectedCharIndex < this.characters.length - 1) {
                const rightAlpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 3)) * 0.5;
                ctx.globalAlpha = rightAlpha;
                ctx.fillText('►', w - 50, charY + charHeight / 2);
            }

            ctx.globalAlpha = 1.0;

            // Character counter
            ctx.font = '20px "Times New Roman", serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText(`${this.selectedCharIndex + 1} / ${this.characters.length}`, w / 2, h - 30);
        }

        // Shot Type Selection Overlay
        if (this.state === 'SELECT_SHOT') {
            this.drawOverlay(ctx, w, h);
            this.drawShotSelection(ctx, w, h);
        }

        // Difficulty Selection Overlay
        if (this.state === 'SELECT_DIFF') {
            this.drawOverlay(ctx, w, h);
            this.drawDifficultySelection(ctx, w, h);
        }

    }

    drawStats(ctx, char, centerX, startY) {
        let stats = { speed: 3, power: 3, range: 3 };
        if (char === 'Reimu') {
            stats = { speed: 3, power: 3, range: 5 };
        } else if (char === 'Marisa') {
            stats = { speed: 5, power: 5, range: 2 };
        } else if (char === 'Sakuya') {
            stats = { speed: 4, power: 4, range: 4 };
        } else if (char === 'Youmu') {
            stats = { speed: 5, power: 4, range: 1 };
        } else if (char === 'Sanae') {
            stats = { speed: 3, power: 4, range: 4 };
        } else if (char === 'Remilia') {
            stats = { speed: 5, power: 5, range: 3 };
        } else if (char === 'Flandre') {
            stats = { speed: 5, power: 5, range: 5 };
        } else if (char === 'Cirno') {
            stats = { speed: 4, power: 2, range: 3 };
        } else if (char === 'Patchouli') {
            stats = { speed: 1, power: 5, range: 4 };
        } else if (char === 'Rumia') {
            stats = { speed: 3, power: 3, range: 2 };
        } else if (char === 'Okuu') {
            stats = { speed: 2, power: 5, range: 5 };
        } else if (char === 'Nue') {
            stats = { speed: 4, power: 3, range: 4 };
        } else if (char === 'Parsee') {
            stats = { speed: 3, power: 3, range: 3 };
        } else if (char === 'Sans') {
            stats = { speed: 4, power: 5, range: 5 };
        }

        const labels = ['Speed', 'Power', 'Range'];
        const values = [stats.speed, stats.power, stats.range];

        ctx.textAlign = 'left';
        ctx.font = '16px "Times New Roman", serif';

        labels.forEach((label, i) => {
            const y = startY + i * 25;
            ctx.fillStyle = '#ccc';
            ctx.fillText(label, centerX - 60, y);

            // Draw Bar
            const barX = centerX;
            const barW = 80;
            const barH = 10;

            // Background
            ctx.fillStyle = '#444';
            ctx.fillRect(barX, y - 10, barW, barH);

            // Fill
            const fillW = (values[i] / 5) * barW;
            ctx.fillStyle = char === 'Reimu' ? '#f55' : '#ff5';
            ctx.fillRect(barX, y - 10, fillW, barH);
        });
    }

    drawOverlay(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);
    }

    drawShotSelection(ctx, w, h) {
        const boxWidth = 400;
        const boxHeight = 350;
        const boxX = (w - boxWidth) / 2;
        const boxY = (h - boxHeight) / 2;

        // Box Background
        ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = '#aaf';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Title
        const char = this.characters[this.selectedCharIndex];
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${char} - Select Shot Type`, w / 2, boxY + 40);

        // Render visible shot types (max 3)
        const visibleCount = 3;
        const itemHeight = 100;

        // Clip to box area
        ctx.save();
        ctx.beginPath();
        ctx.rect(boxX, boxY + 80, boxWidth, boxHeight - 90);
        ctx.clip();

        this.shotTypes.forEach((type, index) => {
            // Skip if not visible
            if (index < this.shotScrollOffset || index >= this.shotScrollOffset + visibleCount) return;

            const displayIndex = index - this.shotScrollOffset;
            const isSelected = index === this.selectedShotIndex;
            const y = boxY + 100 + displayIndex * itemHeight;

            // Selection Highlight
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(boxX + 20, y - 30, boxWidth - 40, 80);
                ctx.strokeStyle = '#ff8';
                ctx.lineWidth = 2;
                ctx.strokeRect(boxX + 20, y - 30, boxWidth - 40, 80);
            }

            // Type Label
            ctx.font = 'bold 24px "Times New Roman", serif';
            ctx.fillStyle = isSelected ? '#ff8' : '#888';
            ctx.fillText(`Type ${type}`, w / 2, y);

            // Description
            let desc = "";
            if (char === 'Reimu') {
                const descs = ["Spirit Sign (Homing)", "Dream Sign (Needle)", "Barrier Sign (Border)", "Treasure Sign (Orbs)", "Divine Sign (Seal)", "Fantasy Sign (Nature)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Marisa') {
                const descs = ["Magic Sign (Missile)", "Love Sign (Spark)", "Star Sign (Meteor)", "Light Sign (Laser)", "Witch Sign (Potion)", "Comet Sign (Blazing)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Sakuya') {
                const descs = ["Illusion Sign (Jack)", "Time Sign (Bounce)", "Silver Sign (Knife)", "Scarlet Sign (Serve)", "Clock Sign (Stop)", "Void Sign (Vanish)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Youmu') {
                const descs = ["Human Sign (Slash)", "Ghost Sign (Phantom)", "Life Sign (Flower)", "Death Sign (Meditation)", "Spirit Sign (Wheel)", "Sword Sign (Flurry)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Sanae') {
                const descs = ["Wind Sign (Frogs)", "Snake Sign (Homing)", "Miracle Sign (Star)", "Sea Sign (Wave)", "Mountain Sign (Rock)", "Sky Sign (Wind)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Remilia') {
                const descs = ["Fate Sign (Gungnir)", "Scarlet Sign (Kiss)", "Night Sign (Bat)", "Blood Sign (Chain)", "Devil Sign (Wing)", "Divine Sign (Spear)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Flandre') {
                const descs = ["Taboo (Laevateinn)", "Forbidden (Starbow)", "Secret (Maze)", "Chaos (Eye)", "Destruction (Claw)", "Play (Toy)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Cirno') {
                const descs = ["Ice Sign (Icicle Fall)", "Freeze Sign (Perfect Freeze)", "Hail Sign (Diamond)", "Blizzard Sign (Storm)", "Perfect Sign (Math Class)", "Cold Sign (Insta-Freeze)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Patchouli') {
                const descs = ["Fire Sign (Agni Shine)", "Water Sign (Princess)", "Wood Sign (Sylphy)", "Metal Sign (Silver)", "Earth Sign (Trilithon)", "Sun Sign (Royal Flare)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Rumia') {
                const descs = ["Moon Sign (Moonlight)", "Night Sign (Bird)", "Dark Sign (Demarcation)", "Dusk Sign (Zone)", "Shadow Sign (Cloak)", "Void Sign (Nothingness)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Okuu') {
                const descs = ["Nuclear Sign (Fusion)", "Sun Sign (Subterranean)", "Atomic Sign (Reaction)", "Star Sign (Fixed Star)", "Hell Sign (Geyser)", "Explosion Sign (Mega)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Nue') {
                const descs = ["Undefined (UFO)", "Unknown (Chimera)", "Alien Sign (Invader)", "Mystery Sign (Box)", "Nightmare (Heian)", "Formless (Cloud)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Parsee') {
                const descs = ["Jealousy (Green-Eyed)", "Envy (Bridge Princess)", "Grudge (Midnight)", "Resentment (Hole)", "Malice (Puppet)", "Heart Sign (Broken)"];
                desc = descs[index] || "Unknown Sign";
            } else if (char === 'Sans') {
                const descs = ["Bone Sign (Papyrus)", "Gaster Sign (Blaster)", "Blue Sign (Gravity)", "Dunk Sign (Bad Time)", "Time Sign (Shortcut)", "Lazy Sign (Nap)"];
                desc = descs[index] || "Unknown Sign";
            }

            ctx.font = 'italic 18px "Times New Roman", serif';
            ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            ctx.fillText(desc, w / 2, y + 30);
        });

        ctx.restore();

        // Scroll Indicators
        if (this.shotScrollOffset > 0) {
            ctx.fillStyle = '#fff';
            ctx.fillText("▲", w / 2, boxY + 90);
        }
        if (this.shotScrollOffset < this.shotTypes.length - visibleCount) {
            ctx.fillStyle = '#fff';
            ctx.fillText("▼", w / 2, boxY + boxHeight - 10);
        }
    }

    drawDifficultySelection(ctx, w, h) {
        const boxWidth = 300;
        const boxHeight = 350;
        const boxX = (w - boxWidth) / 2;
        const boxY = (h - boxHeight) / 2;

        // Box Background
        ctx.fillStyle = 'rgba(40, 0, 0, 0.95)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = '#f88';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.textAlign = 'center';
        ctx.font = 'bold 28px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Select Difficulty`, w / 2, boxY + 40);

        this.difficulties.forEach((diff, index) => {
            const isSelected = index === this.selectedDiffIndex;
            const y = boxY + 90 + index * 55;

            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(boxX + 40, y - 25, boxWidth - 80, 40);
            }

            ctx.font = isSelected ? 'bold 24px "Times New Roman", serif' : '20px "Times New Roman", serif';
            ctx.fillStyle = isSelected ? '#ff8' : '#888';
            ctx.fillText(diff, w / 2, y);
        });
    }
}
