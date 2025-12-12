
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'IndividualBossStages.js');
const sourceFile = path.join(__dirname, 'classic_bosses_v2.js');

let targetContent = fs.readFileSync(targetFile, 'utf8');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Helper to extract new content
const extract = (name) => {
    const regex = new RegExp(`export const ${name} =[\\s\\S]*?\\]\\);`);
    const match = sourceContent.match(regex);
    return match ? match[0] : null;
};

const bosses = [
    'BossRumiaEvents',
    'BossCirnoEvents',
    'BossMeilingEvents',
    'BossPatchouliEvents',
    'BossSakuyaEvents',
    'BossRemiliaEvents',
    'BossYukariEvents'
];

bosses.forEach(boss => {
    const newCode = extract(boss);
    if (!newCode) {
        if (boss === 'BossSakuyaEvents' || boss === 'BossPatchouliEvents' || boss === 'BossYukariEvents') {
             // These might not exist in target yet, or exist but we failed to extract? 
             // We checked source file creation, it should have them.
        }
        console.log(`Warning: Could not extract new code for ${boss}`);
        return;
    }

    const regex = new RegExp(`export const ${boss} =[\\s\\S]*?\\]\\);`);
    if (targetContent.match(regex)) {
        targetContent = targetContent.replace(regex, newCode);
        console.log(`Replaced ${boss}`);
    } else {
        console.log(`Appending ${boss}`);
        targetContent += "\n\n" + newCode;
    }
});

fs.writeFileSync(targetFile, targetContent);
console.log("Classic bosses patched.");
