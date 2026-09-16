const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

// Change grid to single column and center
content = content.replace('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8');
content = content.replace('grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center', 'flex flex-col gap-8 sm:gap-10 items-center');

// Change Left Column
content = content.replace('lg:col-span-7 text-center lg:text-left', 'w-full text-center');
content = content.replace('max-w-2xl mx-auto lg:mx-0', 'max-w-2xl mx-auto');
content = content.replace('lg:justify-start', 'justify-center');
content = content.replace('lg:justify-start', 'justify-center');
content = content.replace('lg:mx-0', 'mx-auto');
content = content.replace('lg:mx-0', 'mx-auto');

// Change Right Column
content = content.replace('lg:col-span-5', 'w-full max-w-lg mx-auto');

fs.writeFileSync('src/components/Hero.tsx', content);
