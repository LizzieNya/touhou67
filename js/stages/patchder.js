
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'IndividualBossStages.js');
const sourceFile = path.join(__dirname, 'temp_new_bosses.js');

let targetContent = fs.readFileSync(targetFile, 'utf8');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Extract new Nue content
const nueMatch = sourceContent.match(/export const BossNueEvents =[\s\S]*?\]\);/);
if (!nueMatch) { console.error("Could not find new Nue events"); process.exit(1); }
const newNue = nueMatch[0];

// Extract new Flandre content
const flanMatch = sourceContent.match(/export const BossFlandreEvents =[\s\S]*?\]\);/);
if (!flanMatch) { console.error("Could not find new Flandre events"); process.exit(1); }
const newFlan = flanMatch[0];

// Replace Nue in Target
// We look for start up to the Utsuho comment or end of array
// Standard pattern in file is `export const BossNueEvents = ...` -> `]);` -> `// Utsuho`
// We need to be careful with regex dot matching newline
// The file has `// Utsuho` or `// BossOkuuEvents` ? 
// Step 9 showed: `// Utsuho Reiuji (Okuu)`
const nueRegex = /export const BossNueEvents =[\s\S]*?\]\);\s*\n\s*\/\/ Utsuho/m;
const nueTargetMatch = targetContent.match(nueRegex);

if (nueTargetMatch) {
    console.log("Found old Nue block. Replacing...");
    // We want to keep the `// Utsuho` part, so we replace with newNue + "\n\n// Utsuho"
    // Actually our regex matched the comment, so we must put it back.
    targetContent = targetContent.replace(nueRegex, newNue + "\n\n// Utsuho");
} else {
    console.error("Could not find old Nue block via Regex. Trying strictly by line scanning (safer).");
    process.exit(1);
    // Fallback logic omitted for now, trusting regex or will fail fast
}

// Replace Flandre in Target
// Flandre is followed by `// Sans`
const flanRegex = /export const BossFlandreEvents =[\s\S]*?\]\);\s*\/\/ Sans/m;
const flanTargetMatch = targetContent.match(flanRegex);

if (flanTargetMatch) {
    console.log("Found old Flandre block. Replacing...");
    targetContent = targetContent.replace(flanRegex, newFlan + "\n// Sans");
} else {
    console.log("Could not find old Flandre block followed explicitly by // Sans. Trying looser match.");
    // Maybe there's extra newlines
    const flanRegex2 = /export const BossFlandreEvents =[\s\S]*?\]\);[\s\n]*\/\/ Sans/m;
    if(targetContent.match(flanRegex2)) {
         targetContent = targetContent.replace(flanRegex2, newFlan + "\n\n// Sans");
    } else {
        console.error("Failed to match Flandre block.");
        process.exit(1);
    }
}

fs.writeFileSync(targetFile, targetContent);
console.log("Successfully patched IndividualBossStages.js");
