const fs = require('fs');
let content = fs.readFileSync('src/components/LineCtaSection.tsx', 'utf-8');

// Remove the grid start
content = content.replace('          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-8 text-left">\n            <div className="flex flex-col space-y-6 lg:space-y-8">\n', '');

// Remove the mid div
content = content.replace('            </div>\n            <div className="flex flex-col h-full w-full">\n', '');

// Remove the end div
content = content.replace('            </div>\n          </div>\n', '');

fs.writeFileSync('src/components/LineCtaSection.tsx', content);
