export default class Renderer {
    constructor(ctx, width, height, resourceManager) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.resourceManager = resourceManager;
    }

    drawSprite(key, x, y, w, h, rotation = 0) {
        const img = this.resourceManager ? this.resourceManager.getImage(key) : null;
        // Check if it's an Image with data, or a Canvas (which is always ready)
        const isReady = img && (
            (img instanceof HTMLCanvasElement && img.width > 0) || 
            (img.complete && img.naturalWidth !== 0)
        );

        if (isReady) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.drawImage(img, -w / 2, -h / 2, w, h);
            this.ctx.restore();
        } else {
            // Fallback - Draw placeholder if image is not ready
             this.drawRect(x - w / 2, y - h / 2, w, h, '#f00');
        }
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawText(text, x, y, size = 20, color = '#fff') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px Arial`;
        this.ctx.fillText(text, x, y);
    }
}
