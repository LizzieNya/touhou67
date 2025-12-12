# Character Leitmotif Sound Effects Guide

## Concept

Since we can't use copyrighted music, we'll create simple sound effect "leitmotifs" - short melodic patterns that represent each character using basic Web Audio API tones.

## Implementation

### File Structure
```
assets/
├── audio/
│   ├── leitmotifs/
│   │   ├── rumia.js
│   │   ├── cirno.js
│   │   ├── meiling.js
│   │   ├── patchouli.js
│   │   ├── sakuya.js
│   │   ├── nue.js
│   │   ├── parsee.js
│   │   └── okuu.js
│   └── normal/
│       └── remilia.js  (for normal gameplay)
```

### Character Themes (Simplified)

Each character gets a unique melodic pattern:

1. **Rumia** - Dark, simple melody (C-Eb-G pattern)
2. **Cirno** - Bright, playful (C-E-G-C pattern)
3. **Meiling** - Energetic, martial (C-D-E-G pattern)
4. **Patchouli** - Mystical, slow (C-Eb-F-Ab pattern)
5. **Sakuya** - Elegant, precise (C-E-G-B pattern)
6. **Remilia** - Regal, powerful (C-E-G-C octave)
7. **Parsee** - Melancholic (C-D-Eb-F pattern)
8. **Nue** - Mysterious (C-Db-Eb-E pattern)
9. **Okuu** - Heavy, intense (C-F-G-C pattern)

## Web Audio API Implementation

```javascript
// Example: Rumia's Leitmotif
class RumiaLeitmotif {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.isPlaying = false;
    }
    
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        const notes = [
            { freq: 261.63, time: 0 },    // C4
            { freq: 311.13, time: 0.3 },  // Eb4
            { freq: 392.00, time: 0.6 },  // G4
            { freq: 261.63, time: 0.9 }   // C4
        ];
        
        const now = this.ctx.currentTime;
        
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.frequency.value = note.freq;
            osc.type = 'square'; // Dark sound
            
            gain.gain.setValueAtTime(0.2, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.25);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + 0.3);
        });
        
        setTimeout(() => {
            this.isPlaying = false;
        }, 1200);
    }
    
    loop() {
        this.play();
        if (this.shouldLoop) {
            setTimeout(() => this.loop(), 1500);
        }
    }
}
```

## Integration with Game

### In SoundManager.js:
```javascript
class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.leitmotifs = {};
        this.currentLeitmotif = null;
    }
    
    loadLeitmotifs() {
        this.leitmotifs = {
            'rumia': new RumiaLeitmotif(this.audioContext),
            'cirno': new CirnoLeitmotif(this.audioContext),
            'meiling': new MeilingLeitmotif(this.audioContext),
            'patchouli': new PatchouliLeitmotif(this.audioContext),
            'sakuya': new SakuyaLeitmotif(this.audioContext),
            'remilia': new RemiliaLeitmotif(this.audioContext),
            'parsee': new ParseeLeitmotif(this.audioContext),
            'nue': new NueLeitmotif(this.audioContext),
            'okuu': new OkuuLeitmotif(this.audioContext)
        };
    }
    
    playBossTheme(bossName) {
        const name = bossName.toLowerCase().split(' ')[0];
        if (this.currentLeitmotif) {
            this.currentLeitmotif.shouldLoop = false;
        }
        
        this.currentLeitmotif = this.leitmotifs[name];
        if (this.currentLeitmotif) {
            this.currentLeitmotif.shouldLoop = true;
            this.currentLeitmotif.loop();
        }
    }
    
    stopBossTheme() {
        if (this.currentLeitmotif) {
            this.currentLeitmotif.shouldLoop = false;
            this.currentLeitmotif = null;
        }
    }
}
```

## Why Sound Effects Instead of Music?

1. **Legal**: No copyright issues
2. **Lightweight**: No audio files to load
3. **Retro**: Fits the pixel art aesthetic
4. **Unique**: Each character has a recognizable pattern
5. **Performance**: Web Audio API is efficient

## Future Enhancements

- Add harmony notes
- Vary tempo per character
- Add percussion/rhythm
- Create longer melodic phrases
- Add effects (reverb, delay)

---

**This creates a pseudo-background theme using just sound effects!**
**Each character gets their own melodic signature!**
