export default class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.volume = 0.5;
    }

    loadSound(key, src) {
        const audio = new Audio(src);
        this.sounds[key] = audio;
    }

    playSound(key) {
        if (this.sounds[key]) {
            const clone = this.sounds[key].cloneNode(); // Allow overlapping sounds
            clone.volume = this.volume;
            clone.play().catch(e => console.warn("Audio play failed", e));
        }
    }

    playMusic(key) {
        // TODO
    }
}
