import ProjectManager from '../engine/ProjectManager.js';

export default class EditorScene {
    constructor(game, project) {
        this.game = game;
        this.project = project;
        this.projectManager = new ProjectManager();
        
        // Ensure arrays and objects exist
        if (!this.project.stages) this.project.stages = [];
        if (!this.project.player) {
            this.project.player = {
                speed: 260,
                focusSpeed: 100,
                color: '#f00',
                sprite: 'reimu',
                shotType: 'A'
            };
        }
        
        this.selectedEventIndex = -1;
        this.activeTab = 'stage';
        
        // Create UI Overlay
        this.setupUI();
        this.render();
    }

    setupUI() {
        // Cleanup old if exists
        this.cleanup();

        const container = document.getElementById('game-container');
        
        this.editorDiv = document.createElement('div');
        this.editorDiv.id = 'maker-editor';
        
        // Header
        this.editorDiv.innerHTML = `
            <div class="maker-header">
                <h2>Project: ${this.project.name}</h2>
                <div class="maker-toolbar">
                    <button id="tab-stage" class="primary">Stage Editor</button>
                    <button id="tab-player">Player Editor</button>
                    <span style="border-left: 1px solid #666; margin: 0 5px; height: 20px; display: inline-block; vertical-align: middle;"></span>
                    <button id="btn-save" style="background: #0066cc;">Save</button>
                    <button id="btn-play" style="background: #008800;">Play</button>
                    <button id="btn-exit" style="background: #cc0000;">Exit</button>
                </div>
            </div>
            <div class="maker-body" id="maker-body">
                <!-- Content injected here -->
            </div>
        `;
        
        container.appendChild(this.editorDiv);
        
        // Bind Header Events
        document.getElementById('tab-stage').onclick = () => this.switchTab('stage');
        document.getElementById('tab-player').onclick = () => this.switchTab('player');
        
        document.getElementById('btn-save').onclick = () => this.saveProject();
        document.getElementById('btn-play').onclick = () => this.playProject();
        document.getElementById('btn-exit').onclick = () => this.exitEditor();
    }
    
    switchTab(tab) {
        this.activeTab = tab;
        
        // Update Buttons
        document.getElementById('tab-stage').className = tab === 'stage' ? 'primary' : '';
        document.getElementById('tab-player').className = tab === 'player' ? 'primary' : '';
        
        this.render();
    }
    
    render() {
        const body = document.getElementById('maker-body');
        body.innerHTML = '';
        
        if (this.activeTab === 'stage') {
            this.renderStageEditor(body);
        } else {
            this.renderPlayerEditor(body);
        }
    }
    
    renderStageEditor(parent) {
        parent.innerHTML = `
            <div class="maker-timeline">
                <div class="maker-header" style="background: #252525; height: 30px; justify-content: center;">
                    <button id="btn-add-wave">+ Wave</button>
                    <button id="btn-add-boss">+ Boss</button>
                    <button id="btn-add-dialogue">+ Text</button>
                </div>
                <div class="maker-event-list" id="event-list">
                    <!-- Events -->
                </div>
            </div>
            <div class="maker-inspector" id="inspector">
                <div class="maker-empty-state">Select an event to edit details</div>
            </div>
        `;
        
        // Bind Add Buttons
        document.getElementById('btn-add-wave').onclick = () => this.addEvent('wave');
        document.getElementById('btn-add-boss').onclick = () => this.addEvent('boss');
        document.getElementById('btn-add-dialogue').onclick = () => this.addEvent('dialogue');
        
        this.renderEventList();
        this.renderInspector();
    }
    
    renderPlayerEditor(parent) {
        parent.innerHTML = `
            <div class="maker-inspector" style="padding: 20px;">
                <h3>Player Configuration</h3>
                <div id="player-form"></div>
            </div>
        `;
        
        const form = document.getElementById('player-form');
        const p = this.project.player;
        
        this.addInput(form, 'Normal Speed', 'number', p.speed, v => p.speed = parseInt(v));
        this.addInput(form, 'Focus Speed', 'number', p.focusSpeed, v => p.focusSpeed = parseInt(v));
        this.addSelect(form, 'Sprite / Style', ['reimu', 'marisa', 'sanae', 'sakuya', 'youmu', 'cirno', 'aya', 'reisein'], p.sprite, v => p.sprite = v);
        this.addInput(form, 'Color (Hex)', 'text', p.color, v => p.color = v);
        // this.addSelect(form, 'Shot Pattern', ['A', 'B'], p.shotType, v => p.shotType = v); // Shot type logic relies on character name currently, maybe extend later
        
        const preview = document.createElement('div');
        preview.style.marginTop = '20px';
        preview.style.padding = '10px';
        preview.style.border = '1px solid #444';
        preview.innerHTML = '<p>Preview (Visual Only)</p>';
        // Could draw canvas preview here if ambitious
        form.appendChild(preview);
    }
    
    addEvent(type) {
        let newEvent = { type: type, time: 2.0 };
        
        if (type === 'wave') {
            newEvent.enemyCount = 5;
            newEvent.enemyType = 'fairy';
            newEvent.pattern = 'aimed';
            newEvent.interval = 0.5;
            newEvent.bulletSpeed = 3;
            newEvent.color = '#ff0000';
            newEvent.hp = 10;
        } else if (type === 'boss') {
            newEvent.name = 'New Boss';
            newEvent.hp = 1000;
            newEvent.spellcard = 'Sign "Test"';
            newEvent.patternType = 'circle';
        } else if (type === 'dialogue') {
            newEvent.text = '...';
            newEvent.character = 'Reimu';
            newEvent.side = 'left';
        }
        
        this.project.stages.push(newEvent);
        this.selectedEventIndex = this.project.stages.length - 1;
        this.renderEventList();
        this.renderInspector();
    }
    
    renderEventList() {
        const list = document.getElementById('event-list');
        if (!list) return;
        list.innerHTML = '';
        
        this.project.stages.forEach((stage, index) => {
            const el = document.createElement('div');
            el.className = `maker-event-item ${this.selectedEventIndex === index ? 'selected' : ''}`;
            
            let icon = '❓';
            if (stage.type === 'wave') icon = '👾';
            if (stage.type === 'boss') icon = '👹';
            if (stage.type === 'dialogue') icon = '💬';
            
            let summary = stage.type;
            if (stage.type === 'wave') summary = `${stage.enemyCount}x ${stage.enemyType}`;
            if (stage.type === 'boss') summary = stage.name;
            if (stage.type === 'dialogue') summary = stage.character;

            el.innerHTML = `
                <div>
                    <span class="maker-event-time">+${stage.time}s</span>
                    <span>${icon} ${summary}</span>
                </div>
                <button class="btn-delete" style="background:none; border:none; color:#f44; cursor:pointer;">×</button>
            `;
            
            el.onclick = (e) => {
                if (e.target.classList.contains('btn-delete')) {
                    this.deleteEvent(index);
                } else {
                    this.selectedEventIndex = index;
                    this.renderEventList();
                    this.renderInspector();
                }
            };
            
            list.appendChild(el);
        });
    }
    
    deleteEvent(index) {
        if (confirm('Delete this event?')) {
            this.project.stages.splice(index, 1);
            if (this.selectedEventIndex >= index) this.selectedEventIndex = -1;
            this.renderEventList();
            this.renderInspector();
        }
    }
    
    renderInspector() {
        const pan = document.getElementById('inspector');
        if (!pan) return;
        pan.innerHTML = '';
        
        if (this.selectedEventIndex === -1 || !this.project.stages[this.selectedEventIndex]) {
            pan.innerHTML = '<div class="maker-empty-state">Select an event to edit details</div>';
            return;
        }
        
        const data = this.project.stages[this.selectedEventIndex];
        
        this.addInput(pan, 'Delay (seconds)', 'number', data.time, v => data.time = parseFloat(v));
        
        if (data.type === 'wave') {
            this.addSelect(pan, 'Enemy Type', ['fairy', 'big_fairy', 'spirit', 'kedama'], data.enemyType, v => data.enemyType = v);
            this.addInput(pan, 'Count', 'number', data.enemyCount, v => data.enemyCount = parseInt(v));
            this.addInput(pan, 'Spawn Interval (s)', 'number', data.interval, v => data.interval = parseFloat(v));
            this.addSelect(pan, 'Pattern', ['basic', 'aimed', 'spread', 'circle', 'spiral'], data.pattern, v => data.pattern = v);
            this.addInput(pan, 'Bullet Speed', 'number', data.bulletSpeed || 3, v => data.bulletSpeed = parseFloat(v));
            this.addInput(pan, 'Event HP', 'number', data.hp, v => data.hp = parseInt(v));
            this.addInput(pan, 'Color (Hex)', 'text', data.color, v => data.color = v);
        }
        
        if (data.type === 'boss') {
            this.addInput(pan, 'Boss Name', 'text', data.name, v => data.name = v);
            this.addInput(pan, 'HP', 'number', data.hp, v => data.hp = parseInt(v));
            this.addInput(pan, 'Spell Card Name', 'text', data.spellcard, v => data.spellcard = v);
            this.addSelect(pan, 'Boss Pattern', ['circle', 'spiral', 'flower', 'rain'], data.patternType || 'circle', v => data.patternType = v);
        }
        
        if (data.type === 'dialogue') {
             this.addInput(pan, 'Character Name', 'text', data.character, v => data.character = v);
             this.addSelect(pan, 'Side', ['left', 'right'], data.side, v => data.side = v);
             this.addTextArea(pan, 'Text', data.text, v => data.text = v);
        }
    }
    
    addInput(parent, label, type, value, onChange) {
        const div = document.createElement('div');
        div.className = 'maker-form-group';
        div.innerHTML = `<label>${label}</label>`;
        const input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.onchange = (e) => {
            onChange(e.target.value);
            this.saveProject();
            if (this.activeTab === 'stage') this.renderEventList();
        };
        div.appendChild(input);
        parent.appendChild(div);
    }
    
    addSelect(parent, label, options, value, onChange) {
        const div = document.createElement('div');
        div.className = 'maker-form-group';
        div.innerHTML = `<label>${label}</label>`;
        const select = document.createElement('select');
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.innerText = opt;
            if (opt === value) o.selected = true;
            select.appendChild(o);
        });
        select.onchange = (e) => {
            onChange(e.target.value);
            this.saveProject();
            if (this.activeTab === 'stage') this.renderEventList();
        };
        div.appendChild(select);
        parent.appendChild(div);
    }
    
    addTextArea(parent, label, value, onChange) {
        const div = document.createElement('div');
        div.className = 'maker-form-group';
        div.innerHTML = `<label>${label}</label>`;
        const input = document.createElement('textarea');
        input.value = value;
        input.onchange = (e) => {
            onChange(e.target.value);
            this.saveProject();
            if (this.activeTab === 'stage') this.renderEventList();
        };
        div.appendChild(input);
        parent.appendChild(div);
    }

    saveProject() {
        this.project.updated = Date.now();
        this.projectManager.updateProject(this.project);
        console.log("Project saved");
    }

    playProject() {
        this.cleanup();
        import('./MakerGameScene.js').then(module => {
            this.game.sceneManager.changeScene(new module.default(this.game, this.project, false));
        });
    }

    exitEditor() {
        if (confirm("Exit to menu?")) {
            this.cleanup();
            import('./MakerSelectScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    cleanup() {
        if (this.editorDiv) {
            this.editorDiv.remove();
            this.editorDiv = null;
        }
    }

    update(dt) {
        // bg
    }

    render(renderer) {
        if (!renderer) return; // UI update call compatibility
        const ctx = renderer.ctx;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
    }
}
