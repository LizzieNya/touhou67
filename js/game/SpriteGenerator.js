export default class SpriteGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 32;
        this.canvas.height = 32;
        this.ctx = this.canvas.getContext('2d');
    }

    isSupported(name) {
        const characters = [
            'reimu', 'marisa',
            'rumia', 'cirno', 'meiling', 'patchouli', 'sakuya',
            'remilia', 'flandre', 'parsee', 'nue', 'okuu', 'sans',
            'pepe', 'letty', 'chen', 'alice',
            'merlin', 'youmu', 'yuyuko', 'ran',
            'sanae', 'reisen', 'eclipse', 'midnight',
            'prism', 'chronos', 'solstice', 'lizzie'
        ];
        return characters.includes(name);
    }

    generateAll() {
        const sprites = {};
        const characters = [
            'reimu', 'marisa',
            'rumia', 'cirno', 'meiling', 'patchouli', 'sakuya',
            'remilia', 'flandre', 'parsee', 'nue', 'okuu', 'sans',
            'pepe', 'letty', 'chen', 'alice',
            'merlin', 'youmu', 'yuyuko', 'ran',
            'sanae', 'reisen', 'eclipse', 'midnight',
            'prism', 'chronos', 'solstice', 'lizzie'
        ];

        characters.forEach(char => {
            sprites[char] = this.generateSprite(char);
        });

        return sprites;
    }

    generateSprite(name) {
        this.ctx.clearRect(0, 0, 32, 32);

        // Base body (Default, overridden by specific draws if needed)
        if (!['pepe', 'sans', 'okuu'].includes(name)) {
            // Skin
            this.drawPixelRect(12, 10, 8, 8, '#ffe0bd'); // Head
            this.drawPixelRect(11, 18, 10, 10, '#fff'); // Torso base

            // Eyes (Generic)
            this.drawPixelRect(13, 13, 2, 2, '#000');
            this.drawPixelRect(17, 13, 2, 2, '#000');
        }

        switch (name) {
            case 'reimu': this.drawReimu(); break;
            case 'marisa': this.drawMarisa(); break;
            case 'rumia': this.drawRumia(); break;
            case 'cirno': this.drawCirno(); break;
            case 'meiling': this.drawMeiling(); break;
            case 'patchouli': this.drawPatchouli(); break;
            case 'sakuya': this.drawSakuya(); break;
            case 'remilia': this.drawRemilia(); break;
            case 'flandre': this.drawFlandre(); break;
            case 'parsee': this.drawParsee(); break;
            case 'nue': this.drawNue(); break;
            case 'okuu': this.drawOkuu(); break;
            case 'sans': this.drawSans(); break;
            case 'pepe': this.drawPepe(); break;
            case 'letty': this.drawLetty(); break;
            case 'chen': this.drawChen(); break;
            case 'alice': this.drawAlice(); break;
            case 'merlin': this.drawMerlin(); break;
            case 'youmu': this.drawYoumu(); break;
            case 'yuyuko': this.drawYuyuko(); break;
            case 'ran': this.drawRan(); break;
            case 'sanae': this.drawSanae(); break;
            case 'reisen': this.drawReisen(); break;
            case 'eclipse': this.drawEclipse(); break;
            case 'midnight': this.drawMidnight(); break;
            case 'prism': this.drawPrism(); break;
            case 'chronos': this.drawChronos(); break;
            case 'solstice': this.drawSolstice(); break;
            case 'lizzie': this.drawLizzie(); break;
        }

        const img = new Image();
        img.src = this.canvas.toDataURL();
        return img;
    }

    drawPixelRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    drawRumia() {
        // Black dress
        this.drawPixelRect(10, 18, 12, 12, '#111');
        this.drawPixelRect(8, 22, 16, 8, '#111'); // Skirt flare
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // White shirt center
        this.drawPixelRect(14, 19, 4, 2, '#f00'); // Tie

        // Blonde hair
        this.drawPixelRect(10, 8, 12, 6, '#ffeb3b');
        this.drawPixelRect(8, 10, 4, 8, '#ffeb3b');
        this.drawPixelRect(20, 10, 4, 8, '#ffeb3b');

        // Red ribbon
        this.drawPixelRect(14, 6, 4, 4, '#f00');
        this.drawPixelRect(10, 8, 2, 2, '#f00');
        this.drawPixelRect(20, 8, 2, 2, '#f00');

        // Arms (T-Pose / Crucifixion)
        this.drawPixelRect(4, 18, 8, 3, '#ffe0bd');
        this.drawPixelRect(20, 18, 8, 3, '#ffe0bd');
    }

    drawCirno() {
        // Blue dress
        this.drawPixelRect(10, 18, 12, 10, '#2196f3');
        this.drawPixelRect(8, 24, 16, 6, '#64b5f6');
        this.drawPixelRect(12, 18, 8, 6, '#fff'); // White top section

        // Blue hair
        this.drawPixelRect(10, 8, 12, 6, '#00bcd4');
        this.drawPixelRect(8, 10, 4, 6, '#00bcd4');
        this.drawPixelRect(20, 10, 4, 6, '#00bcd4');

        // Red ribbon
        this.drawPixelRect(14, 6, 4, 4, '#f00');

        // Ice wings
        this.ctx.fillStyle = '#b2ebf2';
        this.ctx.globalAlpha = 0.7;
        this.drawPixelRect(2, 12, 8, 12, '#b2ebf2');
        this.drawPixelRect(22, 12, 8, 12, '#b2ebf2');
        this.ctx.globalAlpha = 1.0;
    }

    drawMeiling() {
        // Green dress (Cheongsam)
        this.drawPixelRect(10, 18, 12, 12, '#2e7d32');
        this.drawPixelRect(8, 22, 16, 10, '#388e3c');
        this.drawPixelRect(14, 18, 4, 12, '#fff'); // White apron/center

        // Red hair
        this.drawPixelRect(10, 8, 12, 6, '#c62828');
        this.drawPixelRect(8, 10, 4, 12, '#c62828'); // Long braids
        this.drawPixelRect(20, 10, 4, 12, '#c62828');

        // Green beret
        this.drawPixelRect(10, 6, 12, 4, '#2e7d32');
        this.drawPixelRect(15, 6, 2, 2, '#ffeb3b'); // Star
    }

    drawPatchouli() {
        // Purple robe (Striped)
        this.drawPixelRect(8, 18, 16, 14, '#fce4ec'); // Pinkish base
        this.drawPixelRect(8, 18, 2, 14, '#9c27b0'); // Purple stripes
        this.drawPixelRect(22, 18, 2, 14, '#9c27b0');
        this.drawPixelRect(14, 18, 4, 14, '#9c27b0'); // Center stripe

        // Purple hair
        this.drawPixelRect(10, 10, 12, 8, '#7b1fa2');
        this.drawPixelRect(8, 12, 4, 8, '#7b1fa2');
        this.drawPixelRect(20, 12, 4, 8, '#7b1fa2');

        // Mob cap
        this.drawPixelRect(8, 6, 16, 6, '#fce4ec');
        this.drawPixelRect(14, 6, 4, 2, '#ffeb3b'); // Moon crescent

        // Book
        this.drawPixelRect(22, 20, 6, 8, '#795548'); // Brown cover
        this.drawPixelRect(23, 21, 4, 6, '#fff'); // Pages
    }

    drawSakuya() {
        // Maid outfit
        this.drawPixelRect(10, 18, 12, 12, '#1a237e'); // Dark Blue
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // Apron
        this.drawPixelRect(11, 18, 1, 12, '#fff'); // Frills
        this.drawPixelRect(20, 18, 1, 12, '#fff');

        // Silver hair
        this.drawPixelRect(10, 8, 12, 6, '#bdbdbd');
        this.drawPixelRect(8, 10, 4, 8, '#bdbdbd'); // Braids
        this.drawPixelRect(20, 10, 4, 8, '#bdbdbd');
        this.drawPixelRect(14, 7, 4, 2, '#00c853'); // Green ribbon

        // Maid Headband
        this.drawPixelRect(9, 7, 14, 3, '#fff');

        // Knives
        this.drawPixelRect(4, 20, 4, 1, '#b0bec5');
        this.drawPixelRect(4, 22, 4, 1, '#b0bec5');
        this.drawPixelRect(4, 24, 4, 1, '#b0bec5');
    }

    drawRemilia() {
        // Red dress
        this.drawPixelRect(10, 18, 12, 12, '#ffcdd2'); // Pinkish top
        this.drawPixelRect(8, 22, 16, 10, '#e53935'); // Red skirt
        this.drawPixelRect(14, 19, 4, 2, '#b71c1c'); // Red ribbon

        // Light blue hair
        this.drawPixelRect(10, 8, 12, 6, '#90caf9');
        this.drawPixelRect(8, 10, 4, 6, '#90caf9');
        this.drawPixelRect(20, 10, 4, 6, '#90caf9');

        // Pink mob cap
        this.drawPixelRect(8, 6, 16, 5, '#ffcdd2');
        this.drawPixelRect(6, 9, 20, 2, '#ef9a9a'); // Frills

        // Bat wings
        this.ctx.fillStyle = '#212121';
        this.ctx.beginPath();
        this.ctx.moveTo(10, 16); this.ctx.lineTo(2, 6); this.ctx.lineTo(2, 20); this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(22, 16); this.ctx.lineTo(30, 6); this.ctx.lineTo(30, 20); this.ctx.fill();
    }

    drawFlandre() {
        // Red dress
        this.drawPixelRect(10, 18, 12, 12, '#d32f2f');
        this.drawPixelRect(8, 22, 16, 10, '#c62828');
        this.drawPixelRect(12, 18, 8, 12, '#ffcdd2'); // Pink vest

        // Blonde hair
        this.drawPixelRect(10, 8, 12, 6, '#ffeb3b');
        this.drawPixelRect(8, 10, 4, 6, '#ffeb3b'); // Side ponytail left

        // Hat
        this.drawPixelRect(10, 6, 10, 4, '#d32f2f');
        this.drawPixelRect(8, 9, 14, 1, '#d32f2f'); // Brim

        // Crystal wings
        const colors = ['#f44336', '#ffeb3b', '#4caf50', '#03a9f4', '#3f51b5', '#9c27b0'];
        for (let i = 0; i < 3; i++) {
            // Left wing
            this.drawPixelRect(4 - i * 2, 12 + i * 4, 3, 3, colors[i]);
            // Right wing
            this.drawPixelRect(25 + i * 2, 12 + i * 4, 3, 3, colors[i + 3]);

            // Connecting black lines
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(7 - i * 2, 13 + i * 4, 4, 1);
            this.ctx.fillRect(21 + i * 2, 13 + i * 4, 4, 1);
        }
    }

    drawParsee() {
        // Green dress
        this.drawPixelRect(10, 18, 12, 12, '#388e3c');
        this.drawPixelRect(8, 22, 16, 10, '#2e7d32');
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // Apron

        // Blonde/Green hair
        this.drawPixelRect(10, 8, 12, 6, '#fff176');
        this.drawPixelRect(8, 10, 4, 8, '#fff176');
        this.drawPixelRect(20, 10, 4, 8, '#fff176');

        // Ears (Pointy)
        this.drawPixelRect(8, 6, 2, 4, '#fff176');
        this.drawPixelRect(22, 6, 2, 4, '#fff176');

        // Pink Scarf
        this.drawPixelRect(10, 16, 12, 4, '#f48fb1');
        this.drawPixelRect(14, 18, 4, 6, '#f48fb1'); // Hanging part
    }

    drawNue() {
        // Black dress
        this.drawPixelRect(10, 18, 12, 12, '#212121');
        this.drawPixelRect(8, 22, 16, 10, '#000');

        // Black hair
        this.drawPixelRect(10, 8, 12, 6, '#212121');
        this.drawPixelRect(8, 10, 4, 8, '#212121');
        this.drawPixelRect(20, 10, 4, 8, '#212121');

        // Wings (Red/Blue)
        this.drawPixelRect(0, 12, 8, 8, '#d32f2f');
        this.drawPixelRect(24, 12, 8, 8, '#1976d2');

        // Trident
        this.drawPixelRect(26, 8, 2, 20, '#b0bec5'); // Pole
        this.drawPixelRect(24, 8, 6, 2, '#f44336'); // Fork
    }

    drawOkuu() {
        // Skin
        this.drawPixelRect(12, 10, 8, 8, '#ffe0bd');

        // Green skirt
        this.drawPixelRect(10, 22, 12, 10, '#2e7d32');
        // White shirt
        this.drawPixelRect(10, 18, 12, 4, '#fff');
        // Red Eye on chest
        this.drawPixelRect(14, 19, 4, 2, '#d32f2f');

        // Dark hair
        this.drawPixelRect(10, 8, 12, 8, '#3e2723');
        this.drawPixelRect(8, 10, 4, 10, '#3e2723');
        this.drawPixelRect(20, 10, 4, 10, '#3e2723');

        // Green bow
        this.drawPixelRect(12, 6, 8, 4, '#2e7d32');

        // Raven wings
        this.drawPixelRect(2, 12, 8, 12, '#212121');
        this.drawPixelRect(22, 12, 8, 12, '#212121');

        // Sun arm (Right)
        this.drawPixelRect(24, 16, 8, 8, '#ff9800'); // Sun
        this.drawPixelRect(26, 18, 4, 4, '#fff'); // Core

        // Control Rod (Left)
        this.drawPixelRect(0, 16, 8, 2, '#9e9e9e');
        this.drawPixelRect(0, 14, 2, 6, '#9e9e9e'); // Hexagon-ish
    }

    drawSans() {
        // Blue jacket with shading
        this.drawPixelRect(10, 18, 12, 10, '#2196f3');
        this.drawPixelRect(10, 18, 2, 10, '#1976d2'); // Shading left
        this.drawPixelRect(20, 18, 2, 10, '#1976d2'); // Shading right

        // Arms (Hands in pockets)
        this.drawPixelRect(8, 20, 4, 6, '#2196f3');
        this.drawPixelRect(20, 20, 4, 6, '#2196f3');

        // White shirt/ribs
        this.drawPixelRect(14, 18, 4, 10, '#fff');
        this.drawPixelRect(14, 20, 4, 1, '#9e9e9e'); // Rib detail
        this.drawPixelRect(14, 23, 4, 1, '#9e9e9e');

        // Black shorts with white stripe
        this.drawPixelRect(10, 28, 12, 4, '#000');
        this.drawPixelRect(8, 28, 2, 4, '#fff'); // Stripe L
        this.drawPixelRect(22, 28, 2, 4, '#fff'); // Stripe R

        // Pink slippers
        this.drawPixelRect(8, 32, 6, 2, '#f48fb1');
        this.drawPixelRect(18, 32, 6, 2, '#f48fb1');

        // Skull head (White)
        this.drawPixelRect(10, 6, 12, 10, '#fff');
        this.drawPixelRect(9, 8, 14, 6, '#fff'); // Wider cheekbones

        // Eyes (Black sockets)
        this.drawPixelRect(11, 10, 4, 4, '#000');
        this.drawPixelRect(17, 10, 4, 4, '#000');

        // Glowing eye (Left - Cyan)
        this.drawPixelRect(12, 11, 2, 2, '#00bcd4');

        // Nose
        this.drawPixelRect(15, 14, 2, 2, '#000');

        // Grin
        this.drawPixelRect(12, 17, 8, 1, '#000');
        this.drawPixelRect(11, 16, 1, 1, '#000');
        this.drawPixelRect(20, 16, 1, 1, '#000');
        this.drawPixelRect(13, 17, 1, 2, '#000'); // Teeth lines
        this.drawPixelRect(15, 17, 1, 2, '#000');
        this.drawPixelRect(17, 17, 1, 2, '#000');
        this.drawPixelRect(19, 17, 1, 2, '#000');
    }

    drawPepe() {
        // Green head (Darker green for contour)
        this.drawPixelRect(7, 6, 18, 14, '#33691e');
        this.drawPixelRect(8, 7, 16, 12, '#558b2f'); // Main face color

        // Bulging Eyes
        this.drawPixelRect(6, 6, 8, 6, '#fff');
        this.drawPixelRect(18, 6, 8, 6, '#fff');

        // Pupils (Black)
        this.drawPixelRect(9, 8, 2, 2, '#000');
        this.drawPixelRect(21, 8, 2, 2, '#000');

        // Eyelids (Heavy)
        this.drawPixelRect(6, 6, 8, 2, '#558b2f');
        this.drawPixelRect(18, 6, 8, 2, '#558b2f');

        // Mouth (Red lips, slight smirk)
        this.drawPixelRect(10, 16, 12, 2, '#c62828');
        this.drawPixelRect(9, 15, 1, 2, '#c62828');
        this.drawPixelRect(22, 15, 1, 2, '#c62828');

        // Blue shirt with collar
        this.drawPixelRect(8, 22, 16, 10, '#1565c0');
        this.drawPixelRect(10, 22, 12, 2, '#fff'); // Collar
    }

    drawLetty() {
        // White dress/coat
        this.drawPixelRect(10, 18, 12, 12, '#e3f2fd');
        this.drawPixelRect(8, 22, 16, 10, '#bbdefb');
        // Purple tabard
        this.drawPixelRect(12, 18, 8, 12, '#7e57c2');

        // Lavender hair
        this.drawPixelRect(10, 8, 12, 6, '#d1c4e9');
        this.drawPixelRect(8, 10, 4, 8, '#d1c4e9');
        this.drawPixelRect(20, 10, 4, 8, '#d1c4e9');

        // Silver brooch
        this.drawPixelRect(14, 19, 4, 2, '#b0bec5');
    }

    drawChen() {
        // Red dress
        this.drawPixelRect(10, 18, 12, 12, '#d32f2f');
        this.drawPixelRect(8, 22, 16, 10, '#c62828');
        this.drawPixelRect(12, 18, 8, 12, '#ffe0b2'); // Apron/Trim

        // Brown hair
        this.drawPixelRect(10, 8, 12, 6, '#5d4037');
        this.drawPixelRect(8, 10, 4, 6, '#5d4037');
        this.drawPixelRect(20, 10, 4, 6, '#5d4037');

        // Green Hat
        this.drawPixelRect(10, 6, 12, 4, '#2e7d32');

        // Cat Ears
        this.drawPixelRect(8, 6, 2, 4, '#000');
        this.drawPixelRect(22, 6, 2, 4, '#000');

        // Tails (Two)
        this.drawPixelRect(6, 24, 2, 6, '#5d4037');
        this.drawPixelRect(24, 24, 2, 6, '#5d4037');
    }

    drawAlice() {
        // Blue dress
        this.drawPixelRect(10, 18, 12, 12, '#1976d2');
        this.drawPixelRect(8, 22, 16, 10, '#1565c0');
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // White top

        // Blonde hair
        this.drawPixelRect(10, 8, 12, 6, '#ffeb3b');
    }

    drawMerlin() {
        // Pinkish/White outfit
        this.drawPixelRect(10, 18, 12, 12, '#fce4ec');
        this.drawPixelRect(8, 22, 16, 10, '#f8bbd0');

        // Light Blue hair (Merlin has wavy light blue hair)
        this.drawPixelRect(10, 8, 12, 8, '#81d4fa');
        this.drawPixelRect(6, 10, 4, 10, '#81d4fa'); // Wavy side
        this.drawPixelRect(22, 10, 4, 10, '#81d4fa');

        // Trumpet (Gold)
        this.drawPixelRect(18, 18, 8, 4, '#ffd700');
        this.drawPixelRect(24, 16, 4, 8, '#ffd700'); // Bell
    }

    drawYoumu() {
        // Green/White dress
        this.drawPixelRect(10, 18, 12, 12, '#1b5e20'); // Dark Green top
        this.drawPixelRect(8, 22, 16, 10, '#fff'); // White skirt

        // Silver hair
        this.drawPixelRect(10, 8, 12, 6, '#e0e0e0');
        this.drawPixelRect(8, 10, 4, 6, '#e0e0e0');
        this.drawPixelRect(20, 10, 4, 6, '#e0e0e0');

        // Black Ribbon
        this.drawPixelRect(10, 6, 12, 2, '#000');

        // Myon (Phantom half) - White blob
        this.drawPixelRect(24, 6, 6, 6, '#fff');
        this.drawPixelRect(25, 5, 4, 8, '#fff');

        // Sword (Katana)
        this.drawPixelRect(4, 20, 2, 12, '#9e9e9e');
    }

    drawYuyuko() {
        // Light Blue/Pink Kimono
        this.drawPixelRect(10, 18, 12, 12, '#b3e5fc');
        this.drawPixelRect(8, 22, 16, 12, '#81d4fa');
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // White inner

        // Pink Hair (Short bob)
        this.drawPixelRect(10, 8, 12, 8, '#f48fb1');
        this.drawPixelRect(8, 10, 4, 6, '#f48fb1');
        this.drawPixelRect(20, 10, 4, 6, '#f48fb1');

        // Hat (Mob cap with triangle?)
        this.drawPixelRect(8, 4, 16, 4, '#b3e5fc');
        this.drawPixelRect(14, 2, 4, 2, '#fff'); // Triangle

        // Fans
        this.drawPixelRect(4, 18, 6, 6, '#1a237e'); // Blue fan
    }

    drawReimu() {
        // Red dress
        this.drawPixelRect(10, 18, 12, 12, '#d32f2f');
        this.drawPixelRect(8, 22, 16, 10, '#d32f2f');
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // White top/sleeves
        this.drawPixelRect(14, 19, 4, 2, '#ffeb3b'); // Yellow tie

        // Brown hair
        this.drawPixelRect(10, 8, 12, 6, '#5d4037');
        this.drawPixelRect(8, 10, 4, 8, '#5d4037');
        this.drawPixelRect(20, 10, 4, 8, '#5d4037');

        // Big Red Bow
        this.drawPixelRect(10, 4, 12, 4, '#d32f2f');
        this.drawPixelRect(6, 6, 4, 4, '#d32f2f');
        this.drawPixelRect(22, 6, 4, 4, '#d32f2f');
    }

    drawMarisa() {
        // Black/White outfit
        this.drawPixelRect(10, 18, 12, 12, '#212121');
        this.drawPixelRect(8, 22, 16, 10, '#fff'); // White apron
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // White shirt

        // Blonde hair
        this.drawPixelRect(10, 8, 12, 6, '#ffeb3b');
        this.drawPixelRect(8, 10, 4, 8, '#ffeb3b');
        this.drawPixelRect(20, 10, 4, 8, '#ffeb3b');
        this.drawPixelRect(6, 12, 4, 6, '#ffeb3b'); // Braid

        // Witch Hat
        this.drawPixelRect(8, 4, 16, 4, '#212121'); // Brim
        this.drawPixelRect(12, 0, 8, 4, '#212121'); // Cone
    }

    drawRan() {
        // White/Blue Tabard
        this.drawPixelRect(10, 18, 12, 12, '#fff');
        this.drawPixelRect(8, 22, 16, 10, '#3f51b5'); // Blue skirt/pants

        // Blonde Hair
        this.drawPixelRect(10, 8, 12, 6, '#ffeb3b');
        this.drawPixelRect(8, 10, 4, 8, '#ffeb3b');
        this.drawPixelRect(20, 10, 4, 8, '#ffeb3b');

        // Fox Ears (Hidden under hat mostly, but let's show them)
        this.drawPixelRect(8, 4, 4, 4, '#ffeb3b');
        this.drawPixelRect(20, 4, 4, 4, '#ffeb3b');

        // Hat
        this.drawPixelRect(10, 4, 12, 4, '#fff');

        // Tails (Nine!) - Simplified to a big fluff
        this.drawPixelRect(2, 20, 6, 12, '#ffeb3b');
        this.drawPixelRect(24, 20, 6, 12, '#ffeb3b');
    }

    drawSanae() {
        // Blue/White Shrine Maiden outfit
        this.drawPixelRect(10, 18, 12, 12, '#2196f3'); // Blue top
        this.drawPixelRect(8, 22, 16, 10, '#2196f3');
        this.drawPixelRect(12, 18, 8, 12, '#fff'); // White center

        // Green hair
        this.drawPixelRect(10, 8, 12, 6, '#4caf50');
        this.drawPixelRect(8, 10, 4, 8, '#4caf50');
        this.drawPixelRect(20, 10, 4, 8, '#4caf50');

        // Frog hair clip (Green dot)
        this.drawPixelRect(8, 8, 4, 4, '#8bc34a');

        // Snake accessory (White/Green)
        this.drawPixelRect(22, 8, 2, 6, '#fff');
    }

    drawReisen() {
        // Black suit jacket
        this.drawPixelRect(10, 18, 12, 12, '#212121');
        this.drawPixelRect(8, 22, 16, 10, '#e0e0e0'); // White skirt

        // Purple hair
        this.drawPixelRect(10, 8, 12, 6, '#ab47bc');
        this.drawPixelRect(8, 10, 4, 8, '#ab47bc');
        this.drawPixelRect(20, 10, 4, 8, '#ab47bc');

        // Rabbit Ears
        this.drawPixelRect(10, 0, 4, 8, '#ab47bc');
        this.drawPixelRect(18, 0, 4, 8, '#ab47bc');
    }

    drawEclipse() {
        // Dark Red/Black outfit
        this.drawPixelRect(10, 18, 12, 12, '#b71c1c');
        this.drawPixelRect(8, 22, 16, 10, '#000');

        // Black hair
        this.drawPixelRect(10, 8, 12, 6, '#000');
        this.drawPixelRect(8, 10, 4, 8, '#000');
        this.drawPixelRect(20, 10, 4, 8, '#000');

        // Glowing Red Eyes
        this.drawPixelRect(13, 13, 2, 2, '#f00');
        this.drawPixelRect(17, 13, 2, 2, '#f00');

        // Dark Aura
        this.ctx.globalAlpha = 0.5;
        this.drawPixelRect(6, 6, 20, 20, '#000');
        this.ctx.globalAlpha = 1.0;
    }

    drawMidnight() {
        // Dark Blue/Purple outfit
        this.drawPixelRect(10, 18, 12, 12, '#311b92');
        this.drawPixelRect(8, 22, 16, 10, '#4a148c');

        // Silver hair
        this.drawPixelRect(10, 8, 12, 6, '#e0e0e0');
        this.drawPixelRect(8, 10, 4, 8, '#e0e0e0');
        this.drawPixelRect(20, 10, 4, 8, '#e0e0e0');

        // Moon Crescent behind
        this.drawPixelRect(24, 6, 4, 10, '#ffeb3b');
    }

    drawPrism() {
        // Crystal/Light theme
        this.drawPixelRect(10, 18, 12, 12, '#0ff'); // Cyan dress
        this.drawPixelRect(8, 22, 16, 10, '#e0ffff'); // Light Cyan skirt

        // Hair
        this.drawPixelRect(10, 8, 12, 6, '#fff'); // White hair
        this.drawPixelRect(8, 10, 4, 8, '#fff');
        this.drawPixelRect(20, 10, 4, 8, '#fff');

        // Wings/Crystals
        this.drawPixelRect(4, 14, 4, 8, '#0ff');
        this.drawPixelRect(24, 14, 4, 8, '#0ff');
    }

    drawChronos() {
        // Time theme
        this.drawPixelRect(10, 18, 12, 12, '#008'); // Dark Blue suit
        this.drawPixelRect(8, 22, 16, 10, '#aaa'); // Grey skirt

        // Hair
        this.drawPixelRect(10, 8, 12, 6, '#c0c0c0'); // Silver hair
        this.drawPixelRect(8, 10, 4, 8, '#c0c0c0');
        this.drawPixelRect(20, 10, 4, 8, '#c0c0c0');

        // Clock details
        this.drawPixelRect(14, 20, 4, 4, '#ff0'); // Gold clock face
    }

    drawSolstice() {
        // Sun/Moon theme
        this.drawPixelRect(10, 18, 12, 12, '#800080'); // Purple dress
        this.drawPixelRect(8, 22, 16, 10, '#000'); // Black skirt

        // Hair (Split color?)
        this.drawPixelRect(10, 8, 6, 6, '#ff0'); // Gold left
        this.drawPixelRect(16, 8, 6, 6, '#fff'); // Silver right
        this.drawPixelRect(8, 10, 4, 8, '#ff0');
        this.drawPixelRect(20, 10, 4, 8, '#fff');

        // Sun/Moon symbols
        this.drawPixelRect(4, 10, 4, 4, '#f00'); // Sun orb
        this.drawPixelRect(24, 10, 4, 4, '#00f'); // Moon orb
    }

    drawLizzie() {
        // Purple Hoodie
        this.drawPixelRect(10, 18, 12, 12, '#9c27b0');
        this.drawPixelRect(8, 20, 16, 10, '#7b1fa2'); // Darker purple bottom/pockets
        this.drawPixelRect(14, 18, 4, 12, '#eee'); // White shirt visible? Or zipper line
        this.drawPixelRect(15, 18, 2, 12, '#ddd'); // Zipper

        // Brown hair (Messy?)
        this.drawPixelRect(10, 8, 12, 8, '#795548');
        this.drawPixelRect(8, 10, 4, 8, '#795548');
        this.drawPixelRect(20, 10, 4, 8, '#795548');

        // Hood resting on shoulders
        this.drawPixelRect(8, 16, 16, 2, '#9c27b0');
    }
}
