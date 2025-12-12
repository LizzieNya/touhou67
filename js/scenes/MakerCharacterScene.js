export default class MakerCharacterScene {
    constructor(game) {
        this.game = game;
        
        // Initialize character storage if needed
        this.characters = this.loadCharacters();
        this.selectedIndex = 0;
        this.mode = 'list'; // 'list', 'edit', 'template_select'
        
        // Templates
        this.templates = ['Reimu', 'Marisa', 'Cirno', 'Sakuya', 'Remilia', 'Flandre'];
    }

    loadCharacters() {
        const data = localStorage.getItem('touhou_maker_characters');
        if (data) return JSON.parse(data);
        return [];
    }

    saveCharacters() {
        localStorage.setItem('touhou_maker_characters', JSON.stringify(this.characters));
    }

    update(dt) {
        if (this.mode === 'list') {
            const listSize = this.characters.length + 2; // + New, + Back
            
            if (this.game.input.isPressed('DOWN')) {
                this.selectedIndex = (this.selectedIndex + 1) % listSize;
                this.game.soundManager.playMenuMove();
            }
            if (this.game.input.isPressed('UP')) {
                this.selectedIndex = (this.selectedIndex - 1 + listSize) % listSize;
                this.game.soundManager.playMenuMove();
            }

            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                this.game.soundManager.playMenuSelect();
                if (this.selectedIndex === 0) {
                    // New Character -> Select Template
                    this.mode = 'template_select';
                    this.templateIndex = 0;
                } else if (this.selectedIndex === listSize - 1) {
                    // Back
                    this.goBack();
                } else {
                    // Select Character -> Actions (Edit/Clone/Delete)
                    // For now, let's just Clone it as an example of "Bank" usage
                    // or "Edit" (Rename)
                    const char = this.characters[this.selectedIndex - 1];
                    // Simple interaction: Clone to top
                    const newChar = JSON.parse(JSON.stringify(char));
                    newChar.name += " (Copy)";
                    this.characters.push(newChar);
                    this.saveCharacters();
                }
            }
            if (this.game.input.isPressed('BOMB')) {
                this.goBack();
            }
        }
        else if (this.mode === 'template_select') {
             if (this.game.input.isPressed('DOWN')) {
                this.templateIndex = (this.templateIndex + 1) % this.templates.length;
            }
            if (this.game.input.isPressed('UP')) {
                this.templateIndex = (this.templateIndex - 1 + this.templates.length) % this.templates.length;
            }

            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                // Create
                const template = this.templates[this.templateIndex];
                const newChar = {
                    name: template + " " + Math.floor(Math.random()*100),
                    base: template,
                    created: Date.now()
                };
                this.characters.push(newChar);
                this.saveCharacters();
                this.mode = 'list';
            }
            if (this.game.input.isPressed('BOMB')) {
                this.mode = 'list';
            }
        }
    }

    goBack() {
        import('./MakerTitleScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '30px Arial';
        ctx.fillText("Character Bank", w/2, 50);

        if (this.mode === 'list') {
            const startY = 100;
            const spacing = 30;
            
            this.renderOption(ctx, "[+] Create New Character", w/2, startY, this.selectedIndex === 0);
            
            this.characters.forEach((c, i) => {
                const text = `${c.name} (Base: ${c.base})`;
                this.renderOption(ctx, text, w/2, startY + (i+1)*spacing, this.selectedIndex === i+1);
            });
            
            this.renderOption(ctx, "Back", w/2, startY + (this.characters.length + 1) * spacing, this.selectedIndex === this.characters.length + 1);
            
            // Helper text
             ctx.fillStyle = '#888';
             ctx.font = '16px Arial';
             ctx.fillText("Select a character to Clone it (Placeholder for Editor)", w/2, h - 30);
        }
        else if (this.mode === 'template_select') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(50, 50, w-100, h-100);
            ctx.fillStyle = '#fff';
            ctx.fillText("Choose Base Template", w/2, 100);
            
            this.templates.forEach((t, i) => {
                this.renderOption(ctx, t, w/2, 150 + i*40, this.templateIndex === i);
            });
        }
    }

    renderOption(ctx, text, x, y, selected) {
        ctx.font = selected ? 'bold 20px Arial' : '20px Arial';
        ctx.fillStyle = selected ? '#ff0' : '#aaa';
        ctx.fillText(text, x, y);
    }
}
