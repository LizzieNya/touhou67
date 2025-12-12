# Character Portrait Integration Guide

## ✅ Fixes Applied

### 1. Dialogue Auto-Progress Fixed
**Problem**: Dialogue advanced while holding Z to shoot
**Solution**: Now requires key release before advancing
- Only advances on key **press** (not hold)
- Longer cooldown (0.3s) to prevent accidental skips

### 2. Name Box Position Fixed
**Problem**: Name box collided with dialogue text
**Solution**: Moved name box higher
- Was: `boxY - 15`
- Now: `boxY - 35`
- 20px more clearance!

## 🎨 Generated Character Portraits

I've generated 7 character bust-up portraits:

1. **Reimu Hakurei** - Shrine maiden (red/white)
2. **Marisa Kirisame** - Witch (black/blonde)
3. **Rumia** - Darkness youkai (blonde/black dress)
4. **Cirno** - Ice fairy (blue hair/dress)
5. **Sakuya Izayoi** - Maid (silver hair/blue outfit)
6. **Remilia Scarlet** - Vampire (lavender hair/pink)
7. **Flandre Scarlet** - Vampire (blonde/red dress)

## 📁 How to Add Portraits to Game

### Step 1: Create Assets Folder
```
touhou67/
├── assets/
│   └── portraits/
│       ├── reimu.png
│       ├── marisa.png
│       ├── rumia.png
│       ├── cirno.png
│       ├── sakuya.png
│       ├── remilia.png
│       └── flandre.png
```

### Step 2: Save the Generated Images
1. Right-click each portrait image I generated
2. Save to `assets/portraits/` folder
3. Rename to match character names

### Step 3: Update DialogueManager.js

Add this to the constructor:
```javascript
constructor(game) {
    this.game = game;
    this.active = false;
    this.lines = [];
    this.currentLineIndex = 0;
    this.inputCooldown = 0;
    this.lastShootState = false;
    
    // Load portraits
    this.portraits = {};
    this.loadPortraits();
}

loadPortraits() {
    const characters = ['reimu', 'marisa', 'rumia', 'cirno', 'sakuya', 'remilia', 'flandre'];
    characters.forEach(char => {
        const img = new Image();
        img.src = `./assets/portraits/${char}.png`;
        this.portraits[char] = img;
    });
}
```

### Step 4: Update render() to show portraits

Replace the portrait placeholder code with:
```javascript
// Draw character portraits
const portraitSize = 80;
const portraitY = boxY - portraitSize - 10;

if (line.side === 'left') {
    // Player portrait (Reimu or Marisa)
    const playerChar = this.game.sceneManager.currentScene.player.character.toLowerCase();
    if (this.portraits[playerChar] && this.portraits[playerChar].complete) {
        ctx.drawImage(this.portraits[playerChar], 20, portraitY, portraitSize, portraitSize);
    }
    // Highlight border
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, portraitY, portraitSize, portraitSize);
} else {
    // Boss portrait
    const bossName = line.name.toLowerCase().split(' ')[0]; // Get first name
    if (this.portraits[bossName] && this.portraits[bossName].complete) {
        ctx.drawImage(this.portraits[bossName], w - portraitSize - 20, portraitY, portraitSize, portraitSize);
    }
    // Highlight border
    ctx.strokeStyle = '#808';
    ctx.lineWidth = 3;
    ctx.strokeRect(w - portraitSize - 20, portraitY, portraitSize, portraitSize);
}
```

## 🎮 Result

Dialogue will now show:
- ✅ Character portraits (80x80px)
- ✅ Name box higher up (no collision)
- ✅ No auto-advance while shooting
- ✅ Proper key press detection

## 📝 Quick Implementation

If you want to add the portraits right now:

1. Create `assets/portraits/` folder
2. Save the 7 generated images there
3. Add the code snippets above to `DialogueManager.js`
4. Restart the game

The portraits will appear next to the dialogue boxes!

---

**Status**: 
- ✅ Dialogue fixed
- ✅ Name box positioned correctly
- ✅ Portraits generated
- 📋 Ready to integrate!

Now continuing with spell cards...
