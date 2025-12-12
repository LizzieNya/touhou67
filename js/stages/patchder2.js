
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'IndividualBossStages.js');
const sourceFile = path.join(__dirname, 'temp_new_bosses_2.js');

let targetContent = fs.readFileSync(targetFile, 'utf8');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Helper to extract new content
const extract = (name) => {
    const regex = new RegExp(`export const ${name} =[\\s\\S]*?\\]\\);`);
    const match = sourceContent.match(regex);
    return match ? match[0] : null;
};

const newParsee = extract('BossParseeEvents');
const newOkuu = extract('BossOkuuEvents');
const newKoishi = extract('BossKoishiEvents');
const newPrismriver = extract('BossPrismriverEvents');

if (!newParsee || !newOkuu || !newKoishi || !newPrismriver) {
    console.error("Failed to extract one or more new boss events from temp file.");
    if(!newParsee) console.error("Parsee missing");
    if(!newOkuu) console.error("Okuu missing");
    if(!newKoishi) console.error("Koishi missing");
    if(!newPrismriver) console.error("Prismriver missing");
    process.exit(1);
}

// Replace Parsee
const parseeRegex = /export const BossParseeEvents =[\s\S]*?\]\);/;
if (targetContent.match(parseeRegex)) {
    targetContent = targetContent.replace(parseeRegex, newParsee);
    console.log("Replaced Parsee.");
} else {
    console.error("Could not find Parsee block.");
}

// Replace Okuu
// Okuu might have trailing comments like // ...
const okuuRegex = /export const BossOkuuEvents =[\s\S]*?\]\);/;
if (targetContent.match(okuuRegex)) {
    targetContent = targetContent.replace(okuuRegex, newOkuu);
    console.log("Replaced Okuu.");
} else {
    console.error("Could not find Okuu block.");
}

// Replace Koishi
const koishiRegex = /export const BossKoishiEvents =[\s\S]*?\]\);/;
if (targetContent.match(koishiRegex)) {
    // Koishi ends, then next boss starts.
    targetContent = targetContent.replace(koishiRegex, newKoishi);
    console.log("Replaced Koishi.");
} else {
    console.error("Could not find Koishi block.");
}

// Append Prismriver
// Check if already exists
if (targetContent.includes("BossPrismriverEvents")) {
    console.log("Prismriver already exists, replacing...");
    const prismRegex = /export const BossPrismriverEvents =[\s\S]*?\]\);/;
    targetContent = targetContent.replace(prismRegex, newPrismriver);
} else {
    console.log("Appending Prismriver...");
    targetContent += "\n\n" + newPrismriver;
}

fs.writeFileSync(targetFile, targetContent);
console.log("Successfully patched Koishi, Parsee, Okuu, and Prismriver.");
