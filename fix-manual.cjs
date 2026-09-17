const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');
const lines = code.split('\\n');
let newLines = [];
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('          )}')) {
    if (lines[i+1] && lines[i+1].includes('{/* Generated Satellite URL Preview Box */}')) {
      // remove this )}
      continue;
    }
  }
  newLines.push(lines[i]);
}
fs.writeFileSync('src/components/AffiliateModal.tsx', newLines.join('\\n'));
