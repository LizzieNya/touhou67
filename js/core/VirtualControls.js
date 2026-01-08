export default class VirtualControls {
    constructor(game) {
        this.game = game;
        this.active = false; // Only active on touch devices
        this.touches = [];

        // D-Pad (Left side) - Floating Joystick
        this.dpad = {
            x: 100, // Defaut position
            y: game.height - 100,
            radius: 50,
            baseRadius: 60,
            stickX: 100,
            stickY: game.height - 100,
            active: false,
            floating: true, // New feature
            id: -1
        };

        // Buttons (Right side)
        // Buttons (Right side)
        this.buttons = [
            { name: 'SHOOT', key: 'KeyZ', x: game.width - 90, y: game.height - 70, radius: 45, color: '#ff4444', active: false, id: -1 },
            { name: 'BOMB', key: 'KeyX', x: game.width - 180, y: game.height - 50, radius: 35, color: '#44ff44', active: false, id: -1 },
            { name: 'FOCUS', key: 'ShiftLeft', x: game.width - 40, y: game.height - 150, radius: 30, color: '#4444ff', active: false, id: -1 },
            { name: 'PAUSE', key: 'Escape', x: game.width - 30, y: 30, radius: 25, color: '#888', active: false, id: -1 }
        ];

        this.setupListeners();
    }

    setupListeners() {
        const canvas = this.game.canvas;

        // Check for touch support
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.active = true;
        }

        canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchcancel', (e) => this.handleTouch(e), { passive: false });
    }

    handleTouch(e) {
        e.preventDefault();
        this.touches = e.touches;

        if (this.touches.length > 0 && this.game.soundManager) {
            this.game.soundManager.resume();
        }

        // Reset states temporarily
        // We need to map active touches to controls
        let dpadTouch = null;
        let buttonTouches = [];

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.width / rect.width;
        const scaleY = this.game.height / rect.height;

        // Reset inputs if no touches
        if (this.touches.length === 0) {
            this.dpad.active = false;
            this.dpad.stickX = this.dpad.x;
            this.dpad.stickY = this.dpad.y;
            this.buttons.forEach(b => b.active = false);
            return;
        }

        // Processing
        let newDpadActive = false;

        // Reset buttons to non-active first, will re-enable if touched
        this.buttons.forEach(b => b.active = false);

        for (let i = 0; i < this.touches.length; i++) {
            const t = this.touches[i];
            const tx = (t.clientX - rect.left) * scaleX;
            const ty = (t.clientY - rect.top) * scaleY;

            // Logic:
            // If touch is on Right Side -> Check Buttons
            // If touch is on Left Side -> Check Floating Joystick

            if (tx > this.game.width / 2) {
                // Right Side: Buttons
                let btnHit = false;
                for (const btn of this.buttons) {
                    const distBtn = Math.hypot(tx - btn.x, ty - btn.y);
                    if (distBtn < btn.radius * 1.5) {
                        btn.active = true;
                        btnHit = true;
                    }
                }
            } else {
                // Left Side: Joystick
                // If D-Pad already active with this ID, update stick
                // If D-Pad inactive, Start it here

                // Track ID to prevent joystick jumping between fingers? 
                // Simple version: First touch on left claims joystick.
                if (!newDpadActive) {
                    if (!this.dpad.active) {
                        // START new joystick
                        this.dpad.x = tx;
                        this.dpad.y = ty;
                        this.dpad.stickX = tx;
                        this.dpad.stickY = ty;
                        this.dpad.active = true;
                        this.dpad.id = t.identifier;
                    } else {
                        // Continue joystick (if close enough or same ID?)
                        // For floating, we usually want it to sticky-track the finer that started it
                        // Unless we track identifier strictly.
                        if (this.dpad.id === t.identifier || this.dpad.id === -1) {
                            const angle = Math.atan2(ty - this.dpad.y, tx - this.dpad.x);
                            const dist = Math.min(Math.hypot(tx - this.dpad.x, ty - this.dpad.y), this.dpad.radius);
                            this.dpad.stickX = this.dpad.x + Math.cos(angle) * dist;
                            this.dpad.stickY = this.dpad.y + Math.sin(angle) * dist;
                            this.dpad.active = true;
                            // Update ID if it was lost
                            this.dpad.id = t.identifier;
                        }
                    }
                    newDpadActive = true;
                }
            }
        }

        // If we processed all touches and didn't find the dpad finger, deactivate it
        if (!newDpadActive) {
            this.dpad.active = false;
            this.dpad.stickX = this.dpad.x;
            this.dpad.stickY = this.dpad.y;
            this.dpad.id = -1;
        }
    }

    getStickInput() {
        if (!this.dpad.active) return { x: 0, y: 0 };
        const dx = (this.dpad.stickX - this.dpad.x) / this.dpad.radius;
        const dy = (this.dpad.stickY - this.dpad.y) / this.dpad.radius;
        return { x: dx, y: dy };
    }

    update() {
        // Store previous state for edge detection (isPressed)
        this.buttons.forEach(btn => {
            btn.prevActive = btn.active;
        });

        this.dpad.prevStickX = this.dpad.stickX;
        this.dpad.prevStickY = this.dpad.stickY;
    }

    getPrevStickInput() {
        if (!this.dpad.active && this.dpad.prevStickX === undefined) return { x: 0, y: 0 };

        // Return normalized prev input
        // Note: If dpad was inactive last frame, stick was at center.
        const prevX = this.dpad.prevStickX !== undefined ? this.dpad.prevStickX : this.dpad.x;
        const prevY = this.dpad.prevStickY !== undefined ? this.dpad.prevStickY : this.dpad.y;

        const dx = (prevX - this.dpad.x) / this.dpad.radius;
        const dy = (prevY - this.dpad.y) / this.dpad.radius;
        return { x: dx, y: dy };
    }

    render(renderer) {
        if (!this.active) return;

        const ctx = renderer.ctx;
        ctx.save();

        if (this.dpad.active) {
            ctx.globalAlpha = 0.6;

            // Draw D-Pad Base (Outer Ring)
            ctx.beginPath();
            ctx.arc(this.dpad.x, this.dpad.y, this.dpad.baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#222';
            ctx.fill();
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw Stick (Inner)
            ctx.beginPath();
            ctx.arc(this.dpad.stickX, this.dpad.stickY, 30, 0, Math.PI * 2);

            // Gradient for stick
            const grad = ctx.createRadialGradient(this.dpad.stickX, this.dpad.stickY, 0, this.dpad.stickX, this.dpad.stickY, 30);
            grad.addColorStop(0, '#888');
            grad.addColorStop(1, '#444');
            ctx.fillStyle = grad;
            ctx.fill();

            // Highlight
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw Buttons
        for (const btn of this.buttons) {
            ctx.globalAlpha = btn.active ? 0.8 : 0.5;

            ctx.beginPath();
            ctx.arc(btn.x, btn.y, btn.radius, 0, Math.PI * 2);

            const grad = ctx.createRadialGradient(btn.x, btn.y, 0, btn.x, btn.y, btn.radius);
            grad.addColorStop(0, btn.active ? '#fff' : btn.color);
            grad.addColorStop(1, btn.active ? btn.color : '#222');

            ctx.fillStyle = grad;
            ctx.fill();

            // Ring
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Text
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 14px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(btn.name, btn.x, btn.y);
            ctx.fillText(btn.name, btn.x, btn.y);
        }

        ctx.restore();
    }
}
