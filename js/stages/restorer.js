
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'IndividualBossStages.js');
const sourceFile = path.join(__dirname, 'flandre_restore.js');

let targetContent = fs.readFileSync(targetFile, 'utf8');
const newFlan = fs.readFileSync(sourceFile, 'utf8');

// Insert Flandre before Sans
// Look for `export const BossSansEvents =`
const sansIndex = targetContent.indexOf('export const BossSansEvents =');

if (sansIndex !== -1) {
    // Find previous comment block for Sans?
    // "// Sans (Undertale)"
    const commentIndex = targetContent.lastIndexOf('// Sans (Undertale)', sansIndex);
    
    let insertPos = sansIndex;
    if (commentIndex !== -1) {
        insertPos = commentIndex;
    }
    
    // Insert
    const newContent = targetContent.slice(0, insertPos) + "\n" + newFlan + "\n\n" + targetContent.slice(insertPos);
    fs.writeFileSync(targetFile, newContent);
    console.log("Successfully restored Flandre before Sans.");
} else {
    console.error("Could not find Sans block to insert before.");
    // Fallback: Append to end?
    // No, file ends with } ]); so we should be careful. 
    process.exit(1);
}
