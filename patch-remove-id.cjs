const fs = require('fs');

// Patch Hero.tsx to remove the pill containing the ID
let hero = fs.readFileSync('src/components/Hero.tsx', 'utf-8');
hero = hero.replace(/<span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md border border-slate-200">[\s\S]*?<\/span>/, '');
fs.writeFileSync('src/components/Hero.tsx', hero);

// Patch LineCtaSection.tsx to remove the ID box
let lineCta = fs.readFileSync('src/components/LineCtaSection.tsx', 'utf-8');
lineCta = lineCta.replace(/<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-3 sm:p-4">[\s\S]*?<\/div>/, '');
fs.writeFileSync('src/components/LineCtaSection.tsx', lineCta);

