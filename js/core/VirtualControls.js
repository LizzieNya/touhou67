export default class VirtualControls {
    constructor(game) {
        this.game = game;
        this.active = false; // Only active on touch devices
        this.touches = [];

        // D-Pad (Left side)
        this.dpad = {
            x: 100,
            y: game.height - 100,
            radius: 60,
            stickX: 100,
            stickY: game.height - 100,
            active: false,
            id: -1
        };

        // Buttons (Right side)
        this.buttons = [
            { name: 'SHOOT', key: 'KeyZ', x: game.width - 80, y: game.height - 60, radius: 30, color: '#f00', active: false, id: -1 },
            { name: 'BOMB', key: 'KeyX', x: game.width - 160, y: game.height - 60, radius: 30, color: '#0f0', active: false, id: -1 },
            { name: 'FOCUS', key: 'ShiftLeft', x: game.width - 80, y: game.height - 140, radius: 25, color: '#00f', active: false, id: -1 },
            { name: 'PAUSE', key: 'Escape', x: game.width - 30, y: 30, radius: 20, color: '#888', active: false, id: -1 }
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

        // Reset states
        this.dpad.active = false;
        this.dpad.stickX = this.dpad.x;
        this.dpad.stickY = this.dpad.y;
        this.buttons.forEach(b => b.active = false);

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.width / rect.width;
        const scaleY = this.game.height / rect.height;

        for (let i = 0; i < this.touches.length; i++) {
            const t = this.touches[i];
            const tx = (t.clientX - rect.left) * scaleX;
            const ty = (t.clientY - rect.top) * scaleY;

            // Check D-Pad
            const distDpad = Math.hypot(tx - this.dpad.x, ty - this.dpad.y);
            if (distDpad < this.dpad.radius * 2) { // Generous hit area
                this.dpad.active = true;
                const angle = Math.atan2(ty - this.dpad.y, tx - this.dpad.x);
                const dist = Math.min(distDpad, this.dpad.radius);
                this.dpad.stickX = this.dpad.x + Math.cos(angle) * dist;
                this.dpad.stickY = this.dpad.y + Math.sin(angle) * dist;
            }

            // Check Buttons
            for (const btn of this.buttons) {
                const distBtn = Math.hypot(tx - btn.x, ty - btn.y);
                if (distBtn < btn.radius * 1.5) {
                    btn.active = true;
                }
            }
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
        if (!this.dpad.active && this.dpad.prevStickX === undefined) return {x:0, y:0};
        
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
        ctx.globalAlpha = 0.5;

        // Draw D-Pad Base
        ctx.beginPath();
        ctx.arc(this.dpad.x, this.dpad.y, this.dpad.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#444';
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Stick
        ctx.beginPath();
        ctx.arc(this.dpad.stickX, this.dpad.stickY, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#888';
        ctx.fill();

        // Draw Buttons
        for (const btn of this.buttons) {
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, btn.radius, 0, Math.PI * 2);
            ctx.fillStyle = btn.active ? '#fff' : btn.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.name, btn.x, btn.y);
        }

        ctx.restore();
    }
}
