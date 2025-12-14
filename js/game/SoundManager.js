import LeitmotifManager from './LeitmotifManager.js';

export default class SoundManager {
    constructor() {
        console.log("SoundManager v2 loaded - Menu sounds enabled");
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
        this.enabled = true;
        this.leitmotifManager = new LeitmotifManager(this.ctx);
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        this.compressor.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSelect() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playMenuMove() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playMenuSelect() {
        this.playSelect();
    }

    playMenuBack() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playShoot() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playEnemyHit() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playEnemyDie() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playPlayerDie() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.3 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playPowerUp() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playExtend() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(1500, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playBomb() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // White noise approximation using many oscillators or just a low rumble
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 1.0);

        gain.gain.setValueAtTime(0.5 * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.0);
    }

    playGraze() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // High pitched "Ting"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05 * this.masterVolume, this.ctx.currentTime); // Quiet
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playBossTheme(bossName) {
        if (!this.enabled) return;
        let key = bossName.toLowerCase();

        // Map boss names to theme keys if they differ
        const bossKeyMap = {
            'letty': 'th7_letty',
            'letty whiterock': 'th7_letty',
            'chen': 'th7_chen',
            'alice': 'th7_alice',
            'alice margatroid': 'th7_alice',
            'prismriver': 'th7_prismriver',
            'prismriver sisters': 'th7_prismriver',
            'merlin prismriver': 'th7_prismriver',
            'youmu': 'th7_youmu',
            'youmu konpaku': 'th7_youmu',
            'yuyuko': 'th7_yuyuko',
            'yuyuko saigyouji': 'th7_yuyuko',
            'ran': 'th7_ran',
            'ran yakumo': 'th7_ran',
            'yukari': 'th7_yukari',
            'yukari yakumo': 'th7_yukari',
            // Touhou 6 Full Names
            'hong meiling': 'meiling',
            'patchouli knowledge': 'patchouli',
            'sakuya izayoi': 'sakuya',
            'remilia scarlet': 'remilia',
            'flandre scarlet': 'flandre',
            // Touhou 8 - Imperishable Night
            'tewi': 'tewi',
            'tewi inaba': 'tewi',
            'reisen': 'reisen',
            'reisen udongein inaba': 'reisen',
            'eirin': 'eirin',
            'eirin yagokoro': 'eirin',
            'kaguya': 'kaguya',
            'kaguya houraisan': 'kaguya',
            'mokou': 'mokou',
            'fujiwara no mokou': 'mokou',
            // Touhou 11/12 - Subterranean Animism / UFO
            'nue': 'nue',
            'nue houjuu': 'nue',
            'okuu': 'okuu',
            'utsuho': 'okuu',
            'utsuho reiuji': 'okuu',
            'parsee': 'parsee',
            'parsee mizuhashi': 'parsee'
        };

        if (bossKeyMap[key]) {
            key = bossKeyMap[key];
        }

        this.leitmotifManager.playTheme(key);

        // Map IDs to Names for notification
        const names = {
            'menu': 'A Soul as Red as a Ground Cherry',
            'stage1': 'Apparitions Stalk the Night',
            'rumia': 'Apparitions Stalk the Night',
            'stage2': 'Lunate Elf',
            'cirno': 'Beloved Tomboyish Girl',
            'stage3': 'Shanghai Teahouse ~ Chinese Tea',
            'meiling': 'Shanghai Alice of Meiji 17',
            'stage4': 'Voile, the Magic Library',
            'patchouli': 'Locked Girl ~ The Girl\'s Secret Room',
            'stage5': 'The Maid and the Pocket Watch of Blood',
            'sakuya': 'Lunar Clock ~ Luna Dial',
            'stage6': 'The Young Descendant of Tepes',
            'remilia': 'Septette for the Dead Princess',
            'stage_extra': 'The Centennial Festival for Magical Girls',
            'flandre': 'U.N. Owen Was Her?',
            'sans': 'Megalovania',
            'koishi': 'Hartmann\'s Youkai Girl',
            'pepe': 'Pepe Theme',
            'nue': 'Heian Alien',
            'aya': 'Wind God Girl',
            'junko': 'Pure Furies ~ Whereabouts of the Heart',
            'merlin': 'Ghostly Band ~ Phantom Ensemble',
            'youmu': 'Hiroari Shoots a Strange Bird ~ Till When?',
            'yuyuko': 'Bloom Nobly, Ink-Black Cherry Blossom ~ Border of Life',
            'ran': 'A Maiden\'s Illusionary Funeral ~ Necro-Fantasy',
            'th7_menu': 'Ghostly Dream ~ Snow or Cherry Petal',
            'th7_stage1': 'Paradise ~ Deep Mountain',
            'th7_letty': 'Crystallized Silver',
            'th7_stage2': 'The Fantastic Tales from Tono',
            'th7_chen': 'Diao Ye Zong (Withered Leaf)',
            'th7_stage3': 'The Doll Maker of Bucuresti',
            'th7_alice': 'Doll Judgment ~ The Girl who Played with People\'s Shapes',
            'th7_stage4': 'The Capital City of Flowers in the Sky',
            'th7_prismriver': 'Ghostly Band ~ Phantom Ensemble',
            'th7_stage5': 'Eastern Mystical Dream ~ Ancient Temple',
            'th7_youmu': 'Hiroari Shoots a Strange Bird ~ Till When?',
            'th7_stage6': 'Ultimate Truth',
            'th7_yuyuko': 'Bloom Nobly, Ink-Black Cherry Blossom ~ Border of Life',
            'th7_stage_extra': 'Charming Domination',
            'th7_ran': 'A Maiden\'s Illusionary Funeral ~ Necro-Fantasy',
            'th7_stage_phantasm': 'Spiritual Domination',
            'th7_yukari': 'Necrofantasia',
            // Touhou 8 - Imperishable Night
            'tewi': 'White Flag of Usa Shrine',
            'reisen': 'Lunatic Eyes ~ Invisible Full Moon',
            'eirin': 'Gensokyo Millennium ~ History of the Moon',
            'kaguya': 'Flight of the Bamboo Cutter ~ Lunatic Princess',
            'mokou': 'Reach for the Moon, Immortal Smoke',
            // Touhou 11 - Subterranean Animism
            'okuu': 'Solar Sect of Mystic Wisdom ~ Nuclear Fusion',
            'parsee': 'Green-Eyed Jealousy',
            // Touhou 12 - Undefined Fantastic Object
            'nue': 'Heian Alien'
        };
        this.currentTrackName = names[key] || bossName;
        this.notificationTimer = 3.0; // Show for 3 seconds
    }

    stopBossTheme() {
        this.leitmotifManager.stop();
    }

    stop() {
        this.stopBossTheme();
    }

    resetMusic() {
        this.leitmotifManager.reset();
    }

    update(dt) {
        if (this.notificationTimer > 0) {
            this.notificationTimer -= dt;
        }
        // LeitmotifManager v2 uses setTimeout/scheduling, no update loop needed
    }

    playGameStartJingle() {
        if (!this.enabled) return;
        
        const now = this.ctx.currentTime;
        const playNote = (freq, time, duration = 0.2, type = 'sine', vol = 0.2) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol * this.masterVolume, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
            
            osc.connect(gain);
            gain.connect(this.compressor);
            
            osc.start(time);
            osc.stop(time + duration + 0.1);
        };

        // Quick Flourish: E5-B4-E5 (Short & Snappy)
        playNote(659.25, now, 0.3, 'triangle', 0.4); // E5
        playNote(493.88, now + 0.08, 0.3, 'sine', 0.3); // B4
        playNote(1318.51, now + 0.16, 0.6, 'sine', 0.3); // E6 (Sparkle)
        
        // Slight bass pluck
        playNote(164.81, now, 0.4, 'triangle', 0.4); // E3
    }

    renderNotification(ctx, width, height) {
        if (this.notificationTimer > 0 && this.currentTrackName) {
            ctx.save();
            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'italic 20px "Times New Roman", serif';
            const text = `♪ Now Playing: ${this.currentTrackName}`;
            const metrics = ctx.measureText(text);
            const w = metrics.width + 40;
            const h = 40;

            // Center at top
            const x = (width - w) / 2;
            const y = 20; // Top margin

            // Fade out
            let alpha = 1.0;
            if (this.notificationTimer < 1.0) alpha = this.notificationTimer;
            ctx.globalAlpha = alpha;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 10);
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, width / 2, y + h / 2);

            ctx.restore();
        }
    }
}
