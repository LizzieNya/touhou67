# Boss Sprite Guide

## Image Generation Quota Exhausted

The image generation quota has been exhausted (resets in ~4h45m). 

## Sprite Requirements

All boss sprites should be:
- **Size**: 64x64 pixels (or 32x32 for smaller bosses)
- **Style**: Pixel art, chibi proportions
- **Angle**: Top-down view (as seen from player perspective)
- **Facing**: Downward toward the player
- **Background**: Transparent

## Bosses Needing Sprites

### Touhou 6 (EoSD) Bosses:
1. **Rumia** - Blonde hair, red ribbon, black dress
2. **Cirno** - Blue hair, blue dress, ice wings
3. **Meiling** - Red hair in buns, green Chinese dress
4. **Patchouli** - Purple hair, purple dress, book
5. **Sakuya** - Silver braided hair, blue maid outfit
6. **Remilia** - Lavender hair, pink cap, red dress, bat wings
7. **Flandre** - Blonde hair, red dress, crystal wings

### Other Bosses:
8. **Parsee** - Green hair, green dress
9. **Nue** - Black hair, black/red dress, snake tail
10. **Okuu** - Dark hair, green dress, cannon arm, raven wings

## How to Create/Find Sprites

### Option 1: Use Existing Touhou Sprites
- Search for "Touhou sprite sheet" online
- Many fan-made sprite packs exist
- Ensure they're free to use

### Option 2: Create Your Own
- Use pixel art tools (Aseprite, Piskel, etc.)
- Follow the size/style requirements above
- Base on official Touhou character designs

### Option 3: Commission/Generate Later
- Wait for quota reset (~4h45m)
- Use AI generation tools
- Commission pixel artists

## File Structure

Save sprites to:
```
assets/
├── sprites/
│   ├── bosses/
│   │   ├── rumia.png
│   │   ├── cirno.png
│   │   ├── meiling.png
│   │   ├── patchouli.png
│   │   ├── sakuya.png
│   │   ├── remilia.png
│   │   ├── flandre.png
│   │   ├── parsee.png
│   │   ├── nue.png
│   │   └── okuu.png
```

## Integration

Update boss rendering code to load sprites:
```javascript
// In Boss.js or similar
this.sprite = new Image();
this.sprite.src = `./assets/sprites/bosses/${name.toLowerCase()}.png`;
```

---

**For now, the game uses colored rectangles as placeholders.**
**Sprites can be added later when quota resets or from external sources!**
