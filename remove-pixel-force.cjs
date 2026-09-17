const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');
const lines = code.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ตั้งค่า Pixel สำหรับยิงแอด')) {
        // go back to the start of the wrapping div which is 24 lines up or something
        // Just slice the array
        let startDeleteIdx = i;
        while (startDeleteIdx > 0 && !lines[startDeleteIdx].includes('{ownerUid && (')) {
             startDeleteIdx--;
        }
        
        // Find the matching end
        let endDeleteIdx = i;
        let nestedCount = 1; // assume start is a block
        while (endDeleteIdx < lines.length) {
            if (lines[endDeleteIdx].includes('{/* Generated Satellite URL Preview Box */}')) {
               break;
            }
            endDeleteIdx++;
        }
        // we want to delete from startDeleteIdx to endDeleteIdx - 1
        newLines.length = startDeleteIdx; // truncate
        i = endDeleteIdx - 1; // jump forward
        skip = false;
        continue;
    }
    
    if (!skip) {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('src/components/AffiliateModal.tsx', newLines.join('\n'));
