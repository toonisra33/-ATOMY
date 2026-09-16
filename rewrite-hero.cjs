const fs = require('fs');
let content = fs.readFileSync('src/components/Hero.tsx', 'utf-8');

// Restore grid
content = content.replace('flex flex-col gap-8 sm:gap-10 items-center', 'grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center');

// Restore left column
content = content.replace('w-full text-center', 'lg:col-span-7 text-center lg:text-left');
content = content.replace('max-w-2xl mx-auto', 'max-w-2xl mx-auto lg:mx-0');
content = content.replace('justify-center', 'lg:justify-start'); // This might need careful replacing

fs.writeFileSync('src/components/Hero.tsx', content);
