const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

const linkBoxRegex = /<div className="mt-4 p-3\.5 sm:p-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl border border-slate-800">[\s\S]*?<\/div>\s*<\/div>\s*<div className="p-3 bg-blue-50/m;

// Since regex across many lines might be tricky, let's use split.
const lines = code.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<div className="mt-4 p-3.5 sm:p-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl border border-slate-800">')) {
        skip = true;
    }
    
    if (skip && lines[i].includes('<div className="p-3 bg-blue-50 rounded-xl border border-blue-100')) {
        skip = false;
    }
    
    if (!skip) {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('src/components/AffiliateModal.tsx', newLines.join('\n'));
