# Music for Touhou Game Engine

## Current Status

The game currently has **placeholder sound effects** but no background music (BGM).

## About AI-Generated Music

Unfortunately, I cannot directly generate audio files for you. However, I can guide you on how to add music to your game!

## Options for Adding Music

### Option 1: Use Existing Touhou Music (Fan-Made)

Many Touhou fans create remixes and arrangements. You can use royalty-free versions:

1. **Touhou Lossless Music Collection** (TLMC)
   - Community-maintained archive
   - Thousands of arrangements
   - Check licensing for each track

2. **YouTube Audio Library**
   - Search for "Touhou style music"
   - Filter by "Creative Commons"

### Option 2: AI Music Generation Tools

You can use these free AI tools to generate Touhou-style music:

1. **Suno AI** (https://suno.ai)
   - Prompt: "Touhou style bullet hell boss music, fast tempo, piano and synthesizer"
   - Generates 2-minute tracks
   - Free tier available

2. **Udio** (https://udio.com)
   - Similar to Suno
   - Good for game music

3. **MusicGen by Meta**
   - Open source
   - Can run locally
   - Prompt-based generation

### Option 3: Royalty-Free Game Music

1. **OpenGameArt.org**
   - Search for "boss battle" or "bullet hell"
   - All music is free to use

2. **FreePD** (https://freepd.com)
   - Public domain music
   - Good for retro game music

3. **Incompetech** (https://incompetech.com)
   - Kevin MacLeod's music library
   - Attribution required

## Recommended Track List for Touhou 6 Clone

Here's what you need:

### Menu Music
- **Title Screen**: Calm, mysterious piano melody
- **Character Select**: Upbeat, energetic

### Stage Music
- **Stage 1** (Rumia): Dark, mysterious, moderate tempo
- **Stage 2** (Cirno): Playful, icy, fast-paced
- **Stage 3** (Meiling): Chinese-inspired, martial arts feel
- **Stage 4** (Patchouli): Magical, library atmosphere
- **Stage 5** (Sakuya): Time-themed, elegant
- **Stage 6** (Remilia): Epic, vampiric, final boss energy
- **Extra Stage** (Flandre): Chaotic, intense, destructive

### Boss Themes
Each boss can have their own theme or use stage music

## How to Add Music to Your Game

### Step 1: Prepare Audio Files

1. Convert to **MP3** or **OGG** format
2. Keep file sizes reasonable (2-4 MB per track)
3. Ensure looping points are smooth

### Step 2: Add to Project

Create an `assets/music/` directory:
```
touhou67/
├── assets/
│   └── music/
│       ├── title.mp3
│       ├── stage1.mp3
│       ├── stage2.mp3
│       ├── stage3.mp3
│       ├── stage4.mp3
│       ├── stage5.mp3
│       ├── stage6.mp3
│       ├── extra.mp3
│       └── boss.mp3
```

### Step 3: Update SoundManager

Modify `js/core/SoundManager.js`:

```javascript
export default class SoundManager {
    constructor() {
        this.bgm = null;
        this.currentTrack = null;
        this.volume = 0.5;
    }

    playBGM(trackName) {
        // Stop current track
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }

        // Load and play new track
        this.bgm = new Audio(`./assets/music/${trackName}.mp3`);
        this.bgm.volume = this.volume;
        this.bgm.loop = true;
        this.bgm.play().catch(e => console.log('Audio play failed:', e));
        this.currentTrack = trackName;
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.bgm) {
            this.bgm.volume = volume;
        }
    }
}
```

### Step 4: Play Music in Scenes

In `TitleScene.js`:
```javascript
constructor(game) {
    // ... existing code ...
    this.game.soundManager.playBGM('title');
}
```

In `GameScene.js`:
```javascript
loadStageScript(stage) {
    // ... existing code ...
    
    // Play appropriate music
    if (stage === 1) this.game.soundManager.playBGM('stage1');
    else if (stage === 2) this.game.soundManager.playBGM('stage2');
    // ... etc
}
```

## Sample Prompts for AI Music Generation

Use these prompts with Suno AI or Udio:

### Stage 1 (Rumia)
```
Dark mysterious touhou style music, moderate tempo, 
piano melody with electronic beats, night theme, 
loopable game music
```

### Stage 2 (Cirno)
```
Playful energetic touhou bullet hell music, fast tempo,
icy winter theme, piano and chiptune, upbeat and cheerful,
loopable game music
```

### Stage 3 (Meiling)
```
Chinese-inspired touhou boss music, martial arts theme,
erhu and guzheng sounds, energetic fighting spirit,
loopable game music
```

### Stage 4 (Patchouli)
```
Magical library touhou music, mysterious and elegant,
classical piano with orchestral elements, moderate tempo,
loopable game music
```

### Stage 5 (Sakuya)
```
Time-themed touhou boss music, elegant and precise,
clock ticking sounds, fast-paced piano, dramatic,
loopable game music
```

### Stage 6 (Remilia)
```
Epic vampire final boss touhou music, dramatic and intense,
orchestral with organ, gothic atmosphere, fast tempo,
loopable game music
```

### Extra Stage (Flandre)
```
Chaotic destructive touhou extra boss music, extremely fast,
intense piano and drums, unstable and wild energy,
loopable game music
```

## Music Room Integration

Once you have music, the Music Room scene will work:

```javascript
// In MusicRoomScene.js
toggleTrack() {
    const track = this.tracks[this.selectedIndex];
    
    if (this.currentlyPlaying === this.selectedIndex) {
        this.game.soundManager.stopBGM();
        this.currentlyPlaying = null;
    } else {
        this.game.soundManager.playBGM(track.file);
        this.currentlyPlaying = this.selectedIndex;
    }
}
```

## Volume Control

Connect the Options menu volume sliders:

```javascript
// In OptionsScene.js
adjustOption(option, direction) {
    if (option.type === 'slider') {
        const step = 10;
        option.value = Math.max(option.min, Math.min(option.max, option.value + direction * step));
        
        // Apply volume changes
        if (option.name === 'BGM Volume') {
            this.game.soundManager.setVolume(option.value / 100);
        }
    }
}
```

## Quick Start: Free Music Pack

I recommend starting with these free resources:

1. **OpenGameArt.org** - Search "boss battle music"
2. Download 7-8 tracks
3. Rename them to match your stages
4. Add to `assets/music/` folder
5. Implement the SoundManager code above

## Legal Considerations

- ✅ Use royalty-free music
- ✅ Check Creative Commons licenses
- ✅ Provide attribution if required
- ❌ Don't use original ZUN music without permission
- ❌ Don't use copyrighted arrangements

## Next Steps

1. Choose your music source (AI generation, free libraries, etc.)
2. Generate/download 7-8 tracks
3. Add to project
4. Implement SoundManager
5. Test in-game
6. Adjust volumes and looping

---

**Note**: While I can't generate audio files directly, the tools and prompts above will help you create authentic Touhou-style music for your game! 🎵

**Estimated Time**: 2-3 hours to generate and implement all music tracks
