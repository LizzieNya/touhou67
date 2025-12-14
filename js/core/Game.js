import Input from './Input.js';
import Renderer from './Renderer.js';
import SceneManager from './SceneManager.js';
import ResourceManager from './ResourceManager.js';
import VirtualControls from './VirtualControls.js';
import SoundManager from '../game/SoundManager.js';
import SpriteGenerator from '../game/SpriteGenerator.js';
import FloatingTextManager from '../game/FloatingTextManager.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.playAreaWidth = 448; // Standard Touhou width, leaving space for sidebar

        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1 / 120; // Fixed timestep for 120FPS physics

        // Global Configuration
        this.config = {
            startingLives: 3,
            startingBombs: 3,
            difficulty: 'Normal',
            musicVolume: 0.5,
            sfxVolume: 0.5,
            godMode: false,
            infiniteBombs: false,
            maxPower: false,
            startWithFullPower: false,
            gameSpeed: 1.0,
            showHitbox: false,
            autoBomb: false,
            mouseMovement: false
        };

        this.virtualControls = new VirtualControls(this);
        this.resourceManager = new ResourceManager();
        this.soundManager = new SoundManager();
        this.spriteGenerator = new SpriteGenerator();
        this.resourceManager.setSpriteGenerator(this.spriteGenerator);
        console.log("Game: SpriteGenerator initialized:", this.spriteGenerator);
        this.floatingTextManager = new FloatingTextManager(this);
        this.input = new Input(this.virtualControls, this.soundManager);
        this.renderer = new Renderer(this.ctx, this.width, this.height, this.resourceManager);
        this.sceneManager = new SceneManager(this);

        // Load Common Assets
        import('./AssetManifest.js').then(module => {
            this.assetManifests = module;
            this.loadAssets(module.CommonAssets);
        }).catch(err => {
            console.error("Failed to load AssetManifest:", err);
        });

        window.gameInstance = this;

        // Fullscreen handling
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();

        this.loadOptions();
    }

    loadAssets(manifest) {
        if (!manifest) return;
        if (manifest.images) {
            manifest.images.forEach(img => {
                this.resourceManager.loadImage(img.key, img.path);
            });
        }
        // Add sound loading here if/when moved to manifest
    }

    async loadGameAssets(gameId) {
        console.log(`Loading assets for ${gameId}...`);
        
        if (!this.assetManifests) {
            console.error("AssetManifests not loaded yet! Waiting or failing.");
            return;
        }

        let manifest;
        if (gameId === 'touhou6') manifest = this.assetManifests.Touhou6Assets;
        else if (gameId === 'touhou7') manifest = this.assetManifests.Touhou7Assets;
        else if (gameId === 'touhou11') manifest = this.assetManifests.Touhou11Assets;
        else if (gameId === 'touhou12') manifest = this.assetManifests.Touhou12Assets;
        else if (gameId === 'nocturnal_sunlight') manifest = this.assetManifests.NocturnalSunlightAssets;

        if (manifest) {
            this.loadAssets(manifest);
        }

        // Lazy generation handles the rest via ResourceManager
    }



    saveOptions() {
        try {
            localStorage.setItem('touhou_config', JSON.stringify(this.config));
            console.log("Options saved.");
        } catch (e) {
            console.error("Failed to save options:", e);
        }
    }

    loadOptions() {
        try {
            const saved = localStorage.getItem('touhou_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure new keys exist
                this.config = { ...this.config, ...parsed };
                console.log("Options loaded:", this.config);
            }
        } catch (e) {
            console.error("Failed to load options:", e);
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    handleResize() {
        const container = document.getElementById('main-container');
        if (!container) return;

        // Reset canvas styles that might have been set by previous version
        this.canvas.style.width = '';
        this.canvas.style.height = '';
        this.canvas.style.position = '';
        this.canvas.style.left = '';
        this.canvas.style.top = '';

        // Determine current base dimensions
        const currentBaseWidth = 640; // Always 640 now that canvas includes sidebar
        const currentBaseHeight = 480;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const scaleX = windowWidth / currentBaseWidth;
        const scaleY = windowHeight / currentBaseHeight;
        // Fit within window with a small margin
        const scale = Math.min(scaleX, scaleY) * 0.95;

        container.style.transform = `scale(${scale})`;
    }

    start() {
        console.log("Game.start() called.");
        
        // Sprites are lazy-loaded by ResourceManager now
        
        this.lastTime = performance.now();
        console.log("Scheduling loop...");
        this.loop(performance.now());
    }

    loop(timestamp) {
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));

        try {
            const frameTime = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;

            // Calculate Real FPS
            if (frameTime > 0) {
                this.fps = 1 / frameTime;
            } else {
                this.fps = 60;
            }

            // Cap frameTime to prevent spiral of death if lag occurs
            const safeFrameTime = Math.min(frameTime, 0.1);

            this.accumulator += safeFrameTime;

            while (this.accumulator >= this.deltaTime) {
                this.update(this.deltaTime);
                this.input.update(); // Update input state AFTER game logic so isPressed works correctly
                this.accumulator -= this.deltaTime;
            }

            // Interpolation factor
            const alpha = this.accumulator / this.deltaTime;

            // Update SoundManager every frame (realtime) to prevent music lag
            if (this.soundManager) {
                this.soundManager.update(safeFrameTime);
            }

            // Render happens after updates
            this.render(alpha);
        } catch (e) {
            console.error("Error in game loop:", e);
            cancelAnimationFrame(this.animationFrameId);
            this.ctx.fillStyle = 'red';
            this.ctx.font = '20px Arial';
            this.ctx.fillText("Error: " + e.message, 10, 50);
            this.ctx.fillText("Check console for details", 10, 80);
        }
    }

    update(dt) {
        // Debug input
        // if (this.input.isPressed('SHOOT')) console.log("Game: SHOOT pressed");
        // if (this.input.isPressed('UP')) console.log("Game: UP pressed");

        this.sceneManager.update(dt);
        if (this.floatingTextManager) this.floatingTextManager.update(dt);
    }

    render(alpha = 1.0) {
        this.renderer.clear();
        this.sceneManager.render(this.renderer, alpha);

        if (this.virtualControls) {
            this.virtualControls.render(this.renderer);
        }

        if (this.floatingTextManager) {
            this.floatingTextManager.render(this.renderer, alpha);
        }

        if (this.soundManager) {
            this.soundManager.renderNotification(this.ctx, this.width, this.height);
        }
    }
}
