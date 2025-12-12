export default class ResourceManager {
    constructor() {
        this.images = {};
    }

    loadImage(key, src) {
        console.log(`Loading image: ${key} from ${src}`);
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Allow manipulation if served correctly
        img.src = src;
        img.onload = () => {
            console.log(`Loaded image: ${key}`);
            // Process for transparency if it's a sprite (not background)
            // Process for transparency if it's a sprite (not background)
            // Skip for backgrounds and known transparent assets (portraits, new sprites)
            if (key !== 'mainmenu_bg' && !key.includes('_bg') && !key.startsWith('portrait_') && key !== 'reimu' && key !== 'marisa') {
                this.images[key] = this.makeTransparent(img);
            } else {
                this.images[key] = img;
            }
        };
        img.onerror = (e) => {
            console.error(`Failed to load image: ${key}`, e);
        };
        // Pre-assign to avoid null checks
        this.images[key] = img;
    }

    makeTransparent(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Assume top-left pixel is background color
            const r = data[0];
            const g = data[1];
            const b = data[2];
            const tolerance = 30; // Tolerance for compression artifacts

            for (let i = 0; i < data.length; i += 4) {
                const dr = Math.abs(data[i] - r);
                const dg = Math.abs(data[i + 1] - g);
                const db = Math.abs(data[i + 2] - b);

                if (dr < tolerance && dg < tolerance && db < tolerance) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const newImg = new Image();
            newImg.src = canvas.toDataURL();
            return newImg;
        } catch (e) {
            console.warn("Cannot process image transparency (CORS?):", e);
            return img;
        }
    }

    getImage(key) {
        return this.images[key];
    }

    generateSprites() {
        // Dynamic import to avoid circular dependencies if any, or just standard import usage
        // But since we are in ES modules, we should import at top. 
        // For now, let's assume SpriteGenerator is passed or imported.
    }

    addImage(key, img) {
        this.images[key] = img;
    }
}
