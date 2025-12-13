import Background from '../game/Background.js';

export default class MusicRoomScene {
    constructor(game) {
        this.game = game;
        this.tracks = [
            { name: 'A Soul as Red as a Ground Cherry', id: 'menu', composer: 'ZUN' },
            { name: 'Apparitions Stalk the Night', id: 'stage1', composer: 'ZUN' },
            { name: 'Lunate Elf', id: 'stage2', composer: 'ZUN' },
            { name: 'Shanghai Teahouse ~ Chinese Tea', id: 'stage3', composer: 'ZUN' },
            { name: 'Voile, the Magic Library', id: 'stage4', composer: 'ZUN' },
            { name: 'The Maid and the Pocket Watch of Blood', id: 'stage5', composer: 'ZUN' },
            { name: 'Lunar Clock ~ Luna Dial', id: 'sakuya', composer: 'ZUN' },
            { name: 'The Young Descendant of Tepes', id: 'stage6', composer: 'ZUN' },
            { name: 'Septette for the Dead Princess', id: 'remilia', composer: 'ZUN' },
            { name: 'The Centennial Festival for Magical Girls', id: 'stage_extra', composer: 'ZUN' },
            { name: 'U.N. Owen Was Her?', id: 'flandre', composer: 'ZUN' },
            { name: 'Beloved Tomboyish Girl', id: 'cirno', composer: 'ZUN' },
            { name: 'Shanghai Alice of Meiji 17', id: 'meiling', composer: 'ZUN' },
            { name: 'Locked Girl ~ The Girl\'s Secret Room', id: 'patchouli', composer: 'ZUN' },
            { name: 'Solar Sect of Mystic Wisdom ~ Nuclear Fusion', id: 'okuu', composer: 'ZUN' },
            { name: 'Heian Alien', id: 'nue', composer: 'ZUN' },
            { name: 'The Sealed-Away Youkai ~ Lost Place', id: 'yamame', composer: 'ZUN' },
            { name: 'Green-Eyed Jealousy', id: 'parsee', composer: 'ZUN' },
            { name: 'A Flower-Studded Sake Dish on Mt. Ooe', id: 'yuugi', composer: 'ZUN' },
            { name: 'Satori Maiden ~ 3rd Eye', id: 'satori', composer: 'ZUN' },
            { name: 'Corpse Voyage ~ Be of good cheer!', id: 'rin', composer: 'ZUN' },
            { name: 'Solar Sect of Mystic Wisdom ~ Nuclear Fusion', id: 'okuu', composer: 'ZUN' },
            { name: 'Hartmann\'s Youkai Girl', id: 'koishi', composer: 'ZUN' },
            { name: 'Reach for the Moon, Immortal Smoke', id: 'mokou', composer: 'ZUN' },
            { name: 'Flight of the Bamboo Cutter ~ Lunatic Princess', id: 'kaguya', composer: 'ZUN' },
            { name: 'Genealogy of the Sky-Born', id: 'eirin', composer: 'ZUN' },
            { name: 'Lunatic Eyes ~ Invisible Full Moon', id: 'reisen', composer: 'ZUN' },
            { name: 'Cinderella Cage ~ Kagome-Kagome', id: 'tewi', composer: 'ZUN' },
            { name: 'A Tiny, Tiny, Clever Commander', id: 'nazrin', composer: 'ZUN' },
            { name: 'Beware the Umbrella Left There Forever', id: 'kogasa', composer: 'ZUN' },
            { name: 'The Traditional Old Man and the Stylish Girl', id: 'ichirin', composer: 'ZUN' },
            { name: 'Captain Murasa', id: 'murasa', composer: 'ZUN' },
            { name: 'The Tiger-Patterned Bishamonten', id: 'shou', composer: 'ZUN' },
            { name: 'Emotional Skyscraper ~ Cosmic Mind', id: 'byakuren', composer: 'ZUN' },
            { name: 'Megalovania', id: 'sans', composer: 'Toby Fox' }
        ];
        this.selectedIndex = 0;
        this.blinkTimer = 0;
        this.currentlyPlaying = null;
        this.scrollOffset = 0;

        // Reuse Background
        this.background = new Background(game);
    }

    update(dt) {
        this.background.update(dt);
        this.blinkTimer += dt;
        const input = this.game.input;

        if (input.isPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.tracks.length) % this.tracks.length;
            this.updateScroll();
        }
        if (input.isPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.tracks.length;
            this.updateScroll();
        }
        if (input.isPressed('SHOOT') || input.isPressed('Confirm')) { // Play/Stop
            this.toggleTrack();
        }
        if (input.isPressed('BOMB')) { // Back
            this.stopCurrentTrack();
            import('./TitleScene.js').then(module => {
                this.game.sceneManager.changeScene(new module.default(this.game));
            });
        }
    }

    updateScroll() {
        // Keep selected index in view
        const maxVisible = 10;
        if (this.selectedIndex < this.scrollOffset) {
            this.scrollOffset = this.selectedIndex;
        } else if (this.selectedIndex >= this.scrollOffset + maxVisible) {
            this.scrollOffset = this.selectedIndex - maxVisible + 1;
        }
    }

    toggleTrack() {
        const track = this.tracks[this.selectedIndex];

        if (this.currentlyPlaying === this.selectedIndex) {
            // Stop current track
            this.stopCurrentTrack();
        } else {
            // Play new track
            this.stopCurrentTrack();
            this.currentlyPlaying = this.selectedIndex;
            console.log(`Playing: ${track.name}`);
            if (this.game.soundManager) {
                this.game.soundManager.playBossTheme(track.id);
            }
        }
    }

    stopCurrentTrack() {
        if (this.currentlyPlaying !== null) {
            console.log('Stopping music');
            this.currentlyPlaying = null;
            if (this.game.soundManager) {
                this.game.soundManager.stopBossTheme();
            }
        }
    }

    render(renderer) {
        const ctx = renderer.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.background.render(renderer);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Times New Roman", serif';
        ctx.fillStyle = '#fff';
        ctx.fillText("Music Room", w / 2, 50);

        // Instructions
        ctx.font = '14px "Times New Roman", serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText("Z: Play/Stop  |  X: Return", w / 2, 80);

        // Track list
        const startY = 120;
        const spacing = 35;
        const maxVisible = 10;
        
        const endIndex = Math.min(this.scrollOffset + maxVisible, this.tracks.length);

        for (let i = this.scrollOffset; i < endIndex; i++) {
            const track = this.tracks[i];
            const relativeIndex = i - this.scrollOffset;
            const y = startY + relativeIndex * spacing;
            
            let color = '#888';
            let prefix = '  ';

            if (i === this.selectedIndex) {
                const alpha = 0.5 + Math.abs(Math.sin(this.blinkTimer * 5)) * 0.5;
                color = `rgba(255, 255, 255, ${alpha})`;
                prefix = '> ';
            }

            if (this.currentlyPlaying === i) {
                color = '#0f0';
                prefix = '♪ ';
            }

            ctx.font = 'bold 18px "Times New Roman", serif';
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.fillText(`${prefix}${track.name}`, 80, y);

            ctx.font = '14px "Times New Roman", serif';
            ctx.fillStyle = '#666';
            ctx.fillText(track.composer, 500, y);
        }
        
        // Scrollbar (Simple)
        if (this.tracks.length > maxVisible) {
            const sbX = w - 40;
            const sbY = startY;
            const sbH = maxVisible * spacing;
            
            // Track
            ctx.fillStyle = '#222';
            ctx.fillRect(sbX, sbY, 6, sbH);
            
            // Thumb
            const thumbH = (maxVisible / this.tracks.length) * sbH;
            const thumbY = sbY + (this.scrollOffset / (this.tracks.length - maxVisible)) * (sbH - thumbH);
            
            ctx.fillStyle = '#666';
            ctx.fillRect(sbX, thumbY, 6, thumbH);
        }

        // Now Playing
        if (this.currentlyPlaying !== null) {
            const track = this.tracks[this.currentlyPlaying];
            ctx.textAlign = 'center';
            ctx.font = 'bold 16px "Times New Roman", serif';
            ctx.fillStyle = '#0f0';
            ctx.fillText(`♪ Now Playing: ${track.id === 'sans' ? 'Megalovania' : track.name}`, w / 2, h - 30);
        }

        ctx.textAlign = 'left';
    }
}
