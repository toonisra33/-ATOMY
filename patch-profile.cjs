const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileCard.tsx', 'utf-8');
code = code.replace(/<span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200 inline-block">[\s\S]*?<\/span>/, '');
fs.writeFileSync('src/components/ProfileCard.tsx', code);
