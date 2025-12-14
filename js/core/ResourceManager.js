export default class ResourceManager {
    constructor() {
        this.images = {};
        this.activeLoads = 0;
        this.totalLoads = 0;
    }

    loadImage(key, src) {
        console.log(`Loading image: ${key} from ${src}`);
        this.activeLoads++;
        this.totalLoads++;
        
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = src;
        img.onload = () => {
            console.log(`Loaded image: ${key}`);
            if (key !== 'mainmenu_bg' && !key.includes('_bg') && !key.startsWith('portrait_') && key !== 'reimu' && key !== 'marisa') {
                this.images[key] = this.makeTransparent(img);
            } else {
                this.images[key] = img;
            }
            this.activeLoads--;
        };
        img.onerror = (e) => {
            console.error(`Failed to load image: ${key}`, e);
            this.activeLoads--;
        };
        // Pre-assign to avoid null checks
        this.images[key] = img;
    }

    isLoading() {
        return this.activeLoads > 0;
    }

    getProgress() {
        if (this.totalLoads === 0) return 1.0;
        return 1.0 - (this.activeLoads / this.totalLoads);
    }
    
    resetProgress() {
        this.totalLoads = 0;
        this.activeLoads = 0;
    }

    makeTransparent(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Hint for read-back speed
        ctx.drawImage(img, 0, 0);

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            if (data.length > 0) {
                // Assume top-left pixel is background color
                const r = data[0];
                const g = data[1];
                const b = data[2];
                const tolerance = 30;

                for (let i = 0; i < data.length; i += 4) {
                    // Quick check for exact match first (optimization)
                    if (data[i] === r && data[i+1] === g && data[i+2] === b) {
                         data[i+3] = 0;
                         continue;
                    }
                    
                    if (Math.abs(data[i] - r) < tolerance && 
                        Math.abs(data[i + 1] - g) < tolerance && 
                        Math.abs(data[i + 2] - b) < tolerance) {
                        data[i + 3] = 0; // Set alpha to 0
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }
            return canvas;
        } catch (e) {
            console.warn("Cannot process image transparency (CORS?):", e);
            return img;
        }
    }

    setSpriteGenerator(generator) {
        this.spriteGenerator = generator;
    }

    getImage(key) {
        if (!this.images[key] && this.spriteGenerator && this.spriteGenerator.isSupported(key)) {
            // Lazy load sprite
            this.images[key] = this.spriteGenerator.generateSprite(key);
        }
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
