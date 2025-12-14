export default class Input {
    constructor(virtualControls, soundManager) {
        this.keys = {};
        this.prevKeys = {};
        this.virtualControls = virtualControls;
        this.soundManager = soundManager;

        this.actions = {
            'UP': ['ArrowUp', 'KeyW'],
            'DOWN': ['ArrowDown', 'KeyS'],
            'LEFT': ['ArrowLeft', 'KeyA'],
            'RIGHT': ['ArrowRight', 'KeyD'],
            'SHOOT': ['KeyZ', 'Space'],
            'BOMB': ['KeyX'],
            'FOCUS': ['ShiftLeft', 'ShiftRight'],
            'PAUSE': ['Escape', 'KeyP'],
            'Confirm': ['KeyZ', 'Enter', 'Space']
        };

        // Ensure canvas can receive focus
        const canvas = document.getElementById('gameCanvas');
        this.mouse = { x: 0, y: 0, down: false, rightDown: false };
        this.prevMouse = { x: 0, y: 0, down: false, rightDown: false };

        if (canvas) {
            canvas.setAttribute('tabindex', '0');
            canvas.addEventListener('click', () => {
                canvas.focus();
                if (this.soundManager) this.soundManager.resume();
            });

            // Mouse Tracking
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                this.mouse.x = (e.clientX - rect.left) * scaleX;
                this.mouse.y = (e.clientY - rect.top) * scaleY;
            });

            canvas.addEventListener('mousedown', (e) => {
                if (e.button === 0) this.mouse.down = true;
                if (e.button === 2) this.mouse.rightDown = true;
                if (this.soundManager) this.soundManager.resume();
            });

            canvas.addEventListener('mouseup', (e) => {
                if (e.button === 0) this.mouse.down = false;
                if (e.button === 2) this.mouse.rightDown = false;
            });

            // Prevent context menu
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        }

        // Attach to document to catch all keys
        document.addEventListener('keydown', (e) => {
            // console.log(`Key Down: ${e.code}`);
            this.keys[e.code] = true;
            if (this.soundManager) this.soundManager.resume();

            // Toggle Fullscreen with F11
            if (e.code === 'F11') {
                e.preventDefault();
                if (window.gameInstance) window.gameInstance.toggleFullscreen();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(action) {
        // Check Keyboard
        const keyCodes = this.actions[action];
        let keyDown = false;
        if (keyCodes) {
            for (const code of keyCodes) {
                if (this.keys[code]) {
                    keyDown = true;
                    break;
                }
            }
        }

        // Check Virtual Controls
        if (this.virtualControls && this.virtualControls.active) {
            // Buttons
            const btn = this.virtualControls.buttons.find(b => b.name === action);
            if (btn && btn.active) return true;

            // D-Pad (Digital fallback)
            const stick = this.virtualControls.getStickInput();
            const threshold = 0.3;
            if (action === 'UP' && stick.y < -threshold) return true;
            if (action === 'DOWN' && stick.y > threshold) return true;
            if (action === 'LEFT' && stick.x < -threshold) return true;
            if (action === 'RIGHT' && stick.x > threshold) return true;
        }

        // Check Mouse
        if (action === 'SHOOT' && this.mouse.down) return true;
        if (action === 'BOMB' && this.mouse.rightDown) return true;
        if (action === 'Confirm' && this.mouse.down) return true;

        return keyDown;
    }

    getAxis() {
        let dx = 0;
        let dy = 0;

        // Keyboard
        if (this.isDown('UP')) dy -= 1;
        if (this.isDown('DOWN')) dy += 1;
        if (this.isDown('LEFT')) dx -= 1;
        if (this.isDown('RIGHT')) dx += 1;

        // Virtual Stick (Override if active and moving)
        if (this.virtualControls && this.virtualControls.active) {
            const stick = this.virtualControls.getStickInput();
            if (Math.abs(stick.x) > 0.1 || Math.abs(stick.y) > 0.1) {
                dx = stick.x;
                dy = stick.y;
            }
        }

        // Normalize if using keyboard (stick is already normalized-ish)
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 1) {
                dx /= len;
                dy /= len;
            }
        }

        return { x: dx, y: dy };
    }

    isPressed(action) {
        // Returns true only on the frame the key was pressed
        const keyCodes = this.actions[action];

        if (keyCodes) {
            for (const code of keyCodes) {
                if (this.keys[code] && !this.prevKeys[code]) {
                    return true;
                }
            }
        }
        // Check Mouse Press
        if (action === 'SHOOT' && this.mouse.down && !this.prevMouse.down) return true;
        if (action === 'Confirm' && this.mouse.down && !this.prevMouse.down) return true;
        if (action === 'BOMB' && this.mouse.rightDown && !this.prevMouse.rightDown) return true;

        return false;
    }

    anyKeyPressed() {
        for (const k in this.keys) {
            if (this.keys[k]) return true;
        }
        if (this.mouse.down) return true;
        return false;
    }

    update() {
        // Store current key state as previous state for next frame
        this.prevKeys = { ...this.keys };
        this.prevMouse = { ...this.mouse };
    }

    // Getters for cleaner access appropriately
    get mouseX() { return this.mouse.x; }
    get mouseY() { return this.mouse.y; }
    get mouseDown() { return this.mouse.down; }
    get rightMouseDown() { return this.mouse.rightDown; }
}
