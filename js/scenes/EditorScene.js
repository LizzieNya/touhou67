import ProjectManager from '../engine/ProjectManager.js';

export default class EditorScene {
    constructor(game, project) {
        this.game = game;
        this.project = project;
        this.projectManager = new ProjectManager();
        this.options = ['Rename Project', 'Add Basic Wave', 'Add Boss (Placeholder)', 'Manage Waves', 'Test Stage', 'Export JSON', 'Save & Exit'];
        this.selectedIndex = 0;

        // Ensure stages array exists
        if (!this.project.stages) this.project.stages = [];

        this.mode = 'menu'; // 'menu', 'manage'
        this.manageIndex = 0;
    }

    update(dt) {
        if (this.mode === 'menu') {
            if (this.game.input.isPressed('DOWN')) {
                this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            }
            if (this.game.input.isPressed('UP')) {
                this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            }

            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                this.executeOption();
            }

            if (this.game.input.isPressed('BOMB')) {
                this.saveAndExit();
            }
        } else if (this.mode === 'manage') {
            if (this.project.stages.length === 0) {
                this.mode = 'menu';
                return;
            }

            if (this.game.input.isPressed('DOWN')) {
                this.manageIndex = (this.manageIndex + 1) % this.project.stages.length;
            }
            if (this.game.input.isPressed('UP')) {
                this.manageIndex = (this.manageIndex - 1 + this.project.stages.length) % this.project.stages.length;
            }

            // Edit with Z
            if (this.game.input.isPressed('SHOOT') || this.game.input.isPressed('Confirm')) {
                import('./WaveEditorScene.js?v=2').then(module => {
                    this.game.sceneManager.changeScene(new module.default(this.game, this.project, this.manageIndex));
                });
                return;
            }

            // Delete with Spell
            if (this.game.input.isPressed('SPELL')) {
                this.project.stages.splice(this.manageIndex, 1);
                this.projectManager.updateProject(this.project);
                if (this.manageIndex >= this.project.stages.length) this.manageIndex = Math.max(0, this.project.stages.length - 1);
                if (this.project.stages.length === 0) this.mode = 'menu';
            }

            // Duplicate with FOCUS (Shift)
            if (this.game.input.isPressed('FOCUS')) {
                const clone = JSON.parse(JSON.stringify(this.project.stages[this.manageIndex]));
                this.project.stages.splice(this.manageIndex + 1, 0, clone);
                this.projectManager.updateProject(this.project);
            }

            if (this.game.input.isPressed('BOMB')) {
                this.mode = 'menu';
            }
        }
    }

    executeOption() {
        const option = this.options[this.selectedIndex];
        if (option === 'Rename Project') {
            this.renameProject();
        } else if (option === 'Add Basic Wave') {
            this.addWave();
        } else if (option === 'Add Boss (Placeholder)') {
            this.addBoss();
        } else if (option === 'Manage Waves') {
            if (this.project.stages.length > 0) {
                this.mode = 'manage';
                this.manageIndex = 0;
            }
        } else if (option === 'Test Stage') {
            this.testStage();
        } else if (option === 'Export JSON') {
            this.exportJSON();
        } else if (option === 'Save & Exit') {
            this.saveAndExit();
        }
    }

    renameProject() {
        const newName = prompt("Enter new project name:", this.project.name);
        if (newName) {
            this.project.name = newName;
            this.projectManager.updateProject(this.project);
        }
    }

    addWave() {
        this.project.stages.push({
            type: 'wave',
            enemyCount: 5,
            pattern: 'aimed',
            time: 2.0
        });
        this.projectManager.updateProject(this.project);
    }

    addBoss() {
        this.project.stages.push({
            type: 'boss',
            name: 'Custom Boss',
            hp: 1000,
            time: 2.0
        });
        this.projectManager.updateProject(this.project);
    }

    testStage() {
        this.projectManager.updateProject(this.project);
        import('./MakerGameScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game, this.project));
        });
    }

    exportJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.project, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", this.project.name.replace(/\s+/g, '_') + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    saveAndExit() {
        this.projectManager.updateProject(this.project);
        import('./MakerSelectScene.js?v=2').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        ctx.fillStyle = '#112';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '24px Arial';
        ctx.fillText("Editor: " + this.project.name, w / 2, 40);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Waves: ${this.project.stages.length}`, w / 2, 70);

        const startY = 120;
        const spacing = 40;

        if (this.mode === 'menu') {
            this.options.forEach((opt, i) => {
                ctx.font = (i === this.selectedIndex) ? 'bold 20px Arial' : '20px Arial';
                ctx.fillStyle = (i === this.selectedIndex) ? '#ff0' : '#888';
                ctx.fillText(opt, w / 2, startY + i * spacing);
            });
        } else {
            this.options.forEach((opt, i) => {
                ctx.font = '20px Arial';
                ctx.fillStyle = '#444';
                ctx.fillText(opt, w / 2, startY + i * spacing);
            });
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = this.mode === 'manage' ? '#668' : '#446';
        ctx.fillRect(50, 400, w - 100, 150);

        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        let previewY = 420;

        if (this.project.stages.length === 0) {
            ctx.fillText("No waves added yet.", 60, previewY);
        } else {
            let startIdx = 0;
            if (this.mode === 'manage') {
                startIdx = Math.max(0, this.manageIndex - 3);
            } else {
                startIdx = Math.max(0, this.project.stages.length - 6);
            }

            const endIdx = Math.min(this.project.stages.length, startIdx + 6);

            for (let i = startIdx; i < endIdx; i++) {
                const stage = this.project.stages[i];
                let text = `${i + 1}. ${stage.type} - ${stage.pattern || stage.name}`;

                if (this.mode === 'manage' && i === this.manageIndex) {
                    ctx.fillStyle = '#ff0';
                    text = "> " + text + " <";
                } else {
                    ctx.fillStyle = '#fff';
                }
                ctx.fillText(text, 60, previewY);
                previewY += 20;
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        if (this.mode === 'menu') {
            ctx.fillText("Press Z to Select, X to Save & Exit", w / 2, h - 20);
        } else {
            ctx.fillText("UP/DOWN: Select  LEFT/RIGHT: Move  Z: Edit  X: Delete  Shift: Duplicate", w / 2, h - 20);
        }
    }

    executeOption() {
        const option = this.options[this.selectedIndex];
        if (option === 'Rename Project') {
            this.renameProject();
        } else if (option === 'Add Basic Wave') {
            this.addWave();
        } else if (option === 'Add Boss (Placeholder)') {
            this.addBoss();
        } else if (option === 'Manage Waves') {
            if (this.project.stages.length > 0) {
                this.mode = 'manage';
                this.manageIndex = 0;
            }
        } else if (option === 'Test Stage') {
            this.testStage();
        } else if (option === 'Export JSON') {
            this.exportJSON();
        } else if (option === 'Save & Exit') {
            this.saveAndExit();
        }
    }

    renameProject() {
        const newName = prompt("Enter new project name:", this.project.name);
        if (newName) {
            this.project.name = newName;
            this.projectManager.updateProject(this.project);
        }
    }

    addWave() {
        this.project.stages.push({
            type: 'wave',
            enemyCount: 5,
            pattern: 'aimed',
            time: 2.0
        });
        this.projectManager.updateProject(this.project);
    }

    addBoss() {
        this.project.stages.push({
            type: 'boss',
            name: 'Custom Boss',
            hp: 1000,
            time: 2.0
        });
        this.projectManager.updateProject(this.project);
    }

    testStage() {
        this.projectManager.updateProject(this.project);
        import('./MakerGameScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game, this.project));
        });
    }

    exportJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.project, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", this.project.name.replace(/\s+/g, '_') + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    saveAndExit() {
        this.projectManager.updateProject(this.project);
        import('./MakerSelectScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game));
        });
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        ctx.fillStyle = '#112';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '24px Arial';
        ctx.fillText("Editor: " + this.project.name, w / 2, 40);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Waves: ${this.project.stages.length}`, w / 2, 70);

        const startY = 120;
        const spacing = 40;

        if (this.mode === 'menu') {
            this.options.forEach((opt, i) => {
                ctx.font = (i === this.selectedIndex) ? 'bold 20px Arial' : '20px Arial';
                ctx.fillStyle = (i === this.selectedIndex) ? '#ff0' : '#888';
                ctx.fillText(opt, w / 2, startY + i * spacing);
            });
        } else {
            this.options.forEach((opt, i) => {
                ctx.font = '20px Arial';
                ctx.fillStyle = '#444';
                ctx.fillText(opt, w / 2, startY + i * spacing);
            });
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = this.mode === 'manage' ? '#668' : '#446';
        ctx.fillRect(50, 400, w - 100, 150);

        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        let previewY = 420;

        if (this.project.stages.length === 0) {
            ctx.fillText("No waves added yet.", 60, previewY);
        } else {
            let startIdx = 0;
            if (this.mode === 'manage') {
                startIdx = Math.max(0, this.manageIndex - 3);
            } else {
                startIdx = Math.max(0, this.project.stages.length - 6);
            }

            const endIdx = Math.min(this.project.stages.length, startIdx + 6);

            for (let i = startIdx; i < endIdx; i++) {
                const stage = this.project.stages[i];
                let text = `${i + 1}. ${stage.type} - ${stage.pattern || stage.name}`;

                if (this.mode === 'manage' && i === this.manageIndex) {
                    ctx.fillStyle = '#ff0';
                    text = "> " + text + " <";
                } else {
                    ctx.fillStyle = '#fff';
                }
                ctx.fillText(text, 60, previewY);
                previewY += 20;
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        if (this.mode === 'menu') {
            ctx.fillText("Press Z to Select, X to Save & Exit", w / 2, h - 20);
        } else {
            ctx.fillText("UP/DOWN: Select  LEFT/RIGHT: Move  Z: Edit  X: Delete  Shift: Duplicate", w / 2, h - 20);
        }
    }
}
