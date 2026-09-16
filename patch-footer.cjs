const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

// Title size
content = content.replace('text-base sm:text-lg', 'text-[10px] sm:text-lg leading-tight break-words');

// Brand Logo size
content = content.replace('w-7 h-7 sm:w-8 sm:h-8', 'w-5 h-5 sm:w-8 sm:h-8');
content = content.replace('text-xs sm:text-sm shrink-0', 'text-[8px] sm:text-sm shrink-0');

// Paragraph description
content = content.replace('text-slate-400 leading-relaxed max-w-md text-xs sm:text-sm text-pretty', 'text-slate-400 leading-relaxed max-w-md text-[8px] sm:text-sm text-pretty line-clamp-6 sm:line-clamp-none mt-1 sm:mt-0');

// Button
content = content.replace('inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer active:scale-95', 'inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg sm:rounded-xl border border-slate-700 text-[8px] sm:text-xs transition-colors cursor-pointer active:scale-95 flex-col sm:flex-row text-center w-full justify-center');
content = content.replace('w-3.5 h-3.5 text-blue-400 shrink-0', 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 shrink-0');

// Headings
content = content.replace(/text-white font-semibold mb-3 text-sm/g, 'text-white font-semibold mb-2 sm:mb-3 text-[9px] sm:text-sm leading-tight');

// Credentials List
content = content.replace('space-y-1.5 text-slate-300 text-xs', 'space-y-1 sm:space-y-1.5 text-slate-300 text-[8px] sm:text-xs break-words');
// ensure labels break words properly
content = content.replace(/<strong className="text-white">/g, '<strong className="text-white block sm:inline">');

// Official Links List
content = content.replace('space-y-2 text-xs', 'space-y-1.5 sm:space-y-2 text-[8px] sm:text-xs break-words');
content = content.replace(/w-3\.5 h-3\.5 text-slate-500 shrink-0/g, 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0 hidden sm:block');

fs.writeFileSync('src/components/Footer.tsx', content);
