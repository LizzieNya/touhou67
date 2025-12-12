import ProjectManager from '../engine/ProjectManager.js';
import SpriteGenerator from '../game/SpriteGenerator.js';

export default class MakerSelectScene {
    constructor(game) {
        this.game = game;

        // Ensure SpriteGenerator exists
        if (!this.game.spriteGenerator) {
            console.warn("SpriteGenerator missing on game instance, initializing new one.");
            this.game.spriteGenerator = new SpriteGenerator();
        }

        this.projectManager = new ProjectManager();
        this.projects = this.projectManager.getActiveProjects();
        this.selectedIndex = 0;
        this.mode = 'list'; // 'list', 'create', 'trash', 'intro', 'context'

        // Context Menu
        this.selectedProject = null;
        this.contextIndex = 0;
        this.contextOptions = ['Play', 'Edit', 'Clone', 'Delete', 'Back'];

        // Intro State
        this.introStep = 0;
        this.introLines = [
            "Hi! I'm Lizzie (lizzie.dev).",
            "Welcome to the Touhou Maker Engine!",
            "Here you can create your own Touhou games.",
            "Start by creating a **New Project**.",
            "Use the **Editor** to add waves and bosses.",
            "You can **Test** your stage instantly.",
            "Projects are sandboxed and auto-saved.",
            "Use the **Context Menu** (Z on a project) to Clone or Delete.",
            "Deleted projects go to the **Trash Bin** first.",
            "Have fun creating!"
        ];

        // Generate Lizzie Portrait
        this.lizzieSprite = this.game.spriteGenerator.generateSprite('lizzie');

        if (!localStorage.getItem('touhou_maker_intro_seen')) {
            this.mode = 'intro';
        }
    }

    update(dt) {
        if (this.mode === 'intro') {
            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                this.introStep++;
                if (this.introStep >= this.introLines.length) {
                    this.mode = 'list';
                    localStorage.setItem('touhou_maker_intro_seen', 'true');
                }
            }
            return;
        }

        if (this.mode === 'create') {
            const name = "Project " + new Date().toLocaleTimeString();
            this.projectManager.createProject(name);
            this.projects = this.projectManager.getActiveProjects();
            this.mode = 'list';
            return;
        }

        if (this.mode === 'list') {
            const totalItems = this.projects.length + 3; // New, Projects, Trash, Help

            if (this.game.input.isPressed('DOWN')) {
                this.selectedIndex = (this.selectedIndex + 1) % totalItems;
            }
            if (this.game.input.isPressed('UP')) {
                this.selectedIndex = (this.selectedIndex - 1 + totalItems) % totalItems;
            }

            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                if (this.selectedIndex === 0) {
                    this.mode = 'create';
                } else if (this.selectedIndex === this.projects.length + 1) {
                    this.mode = 'trash';
                    this.trashProjects = this.projectManager.getDeletedProjects();
                    this.selectedIndex = 0;
                } else if (this.selectedIndex === this.projects.length + 2) {
                    this.mode = 'intro';
                    this.introStep = 0;
                } else {
                    this.selectedProject = this.projects[this.selectedIndex - 1];
                    this.mode = 'context';
                    this.contextIndex = 0;
                }
            }

            if (this.game.input.isPressed('BOMB')) {
                import('./TitleScene.js').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game));
                });
            }
        }
        else if (this.mode === 'context') {
            if (this.game.input.isPressed('DOWN')) {
                this.contextIndex = (this.contextIndex + 1) % this.contextOptions.length;
            }
            if (this.game.input.isPressed('UP')) {
                this.contextIndex = (this.contextIndex - 1 + this.contextOptions.length) % this.contextOptions.length;
            }

            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                const opt = this.contextOptions[this.contextIndex];
                if (opt === 'Play') {
                    import('./MakerGameScene.js').then(module => {
                        this.game.sceneManager.changeScene(new module.default(this.game, this.selectedProject, true));
                    });
                } else if (opt === 'Edit') {
                    import('./EditorScene.js').then(module => {
                        this.game.sceneManager.changeScene(new module.default(this.game, this.selectedProject));
                    });
                } else if (opt === 'Clone') {
                    this.projectManager.cloneProject(this.selectedProject.id);
                    this.projects = this.projectManager.getActiveProjects();
                    this.mode = 'list';
                } else if (opt === 'Delete') {
                    this.projectManager.deleteProject(this.selectedProject.id);
                    this.projects = this.projectManager.getActiveProjects();
                    this.mode = 'list';
                } else {
                    this.mode = 'list';
                }
            }

            if (this.game.input.isPressed('BOMB')) {
                this.mode = 'list';
            }
        }
        else if (this.mode === 'trash') {
            if (this.game.input.isPressed('DOWN')) {
                this.selectedIndex = (this.selectedIndex + 1) % (this.trashProjects.length + 1);
            }
            if (this.game.input.isPressed('UP')) {
                this.selectedIndex = (this.selectedIndex - 1 + (this.trashProjects.length + 1)) % (this.trashProjects.length + 1);
            }

            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                if (this.selectedIndex === this.trashProjects.length) {
                    this.mode = 'list';
                    this.projects = this.projectManager.getActiveProjects();
                    this.selectedIndex = 0;
                } else {
                    const project = this.trashProjects[this.selectedIndex];
                    this.projectManager.restoreProject(project.id);
                    this.trashProjects = this.projectManager.getDeletedProjects();
                }
            }
            if (this.game.input.isPressed('BOMB')) {
                this.mode = 'list';
                this.projects = this.projectManager.getActiveProjects();
                this.selectedIndex = 0;
            }
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // Background
        ctx.fillStyle = '#223';
        ctx.fillRect(0, 0, w, h);

        const startY = 100;
        const spacing = 40;

        // Always render the list in the background for context during tutorial
        this.renderOption(ctx, "New Project...", w / 2, startY, this.selectedIndex === 0 && this.mode === 'list');

        this.projects.forEach((p, i) => {
            let text = p.name;
            const date = new Date(p.updated).toLocaleDateString();
            text += ` (${date})`;
            this.renderOption(ctx, text, w / 2, startY + (i + 1) * spacing, this.selectedIndex === i + 1 && this.mode === 'list');
        });

        this.renderOption(ctx, "Trash Bin...", w / 2, startY + (this.projects.length + 1) * spacing, this.selectedIndex === this.projects.length + 1 && this.mode === 'list');
        this.renderOption(ctx, "Help / Tutorial", w / 2, startY + (this.projects.length + 2) * spacing, this.selectedIndex === this.projects.length + 2 && this.mode === 'list');

        if (this.mode === 'intro') {
            // Darken background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, w, h);

            // Draw Lizzie (Scaled up)
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.lizzieSprite, 50, h - 300, 256, 256);

            // Draw Dialogue Box
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(20, h - 150, w - 40, 130);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, h - 150, w - 40, 130);

            ctx.fillStyle = '#ff69b4'; // Hot pink for name
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'left';
            ctx.fillText("Lizzie", 40, h - 110);

            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            // Simple text rendering
            ctx.fillText(this.introLines[this.introStep].replace(/\*\*/g, ''), 40, h - 70);

            ctx.textAlign = 'right';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText("Press Z to continue", w - 40, h - 30);

            // Highlight Logic
            ctx.textAlign = 'center';
            if (this.introStep === 3) { // "Start by creating a New Project"
                this.renderOption(ctx, "New Project...", w / 2, startY, true);
            }
            if (this.introStep === 8) { // "Trash Bin"
                this.renderOption(ctx, "Trash Bin...", w / 2, startY + (this.projects.length + 1) * spacing, true);
            }

            return;
        }

        if (this.mode === 'list') {
            // Rendered above
        }
        else if (this.mode === 'context') {
            // Context Menu Overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, w, h);

            const boxW = 300;
            const boxH = 250;
            const boxX = (w - boxW) / 2;
            const boxY = (h - boxH) / 2;

            ctx.fillStyle = '#334';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText(this.selectedProject.name, w / 2, boxY + 40);

            this.contextOptions.forEach((opt, i) => {
                this.renderOption(ctx, opt, w / 2, boxY + 100 + i * 40, this.contextIndex === i);
            });
        }
        else if (this.mode === 'trash') {
            // Clear screen for trash view
            ctx.fillStyle = '#223';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#fff';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("Trash Bin", w / 2, 50);

            this.trashProjects.forEach((p, i) => {
                this.renderOption(ctx, p.name + " (Restorable)", w / 2, startY + i * spacing, this.selectedIndex === i);
            });
            this.renderOption(ctx, "Back", w / 2, startY + this.trashProjects.length * spacing, this.selectedIndex === this.trashProjects.length);
        }

        if (this.mode === 'list') {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#888';
            ctx.fillText("Z: Select  X (Bomb): Back", w / 2, h - 30);
        }
    }

    renderOption(ctx, text, x, y, selected) {
        ctx.font = selected ? 'bold 24px Arial' : '24px Arial';
        ctx.fillStyle = selected ? '#ff0' : '#aaa';
        ctx.fillText(text, x, y);
    }
}
