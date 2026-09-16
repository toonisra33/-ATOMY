const fs = require('fs');
let content = fs.readFileSync('src/components/LineCtaSection.tsx', 'utf-8');
const lines = content.split('\n');

// Find end of text block (line 136 is </div>)
const idx1 = lines.findIndex(l => l.includes('</p>')) + 2;

// Insert start of grid
lines.splice(idx1, 0, '          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-8 text-left">', '            <div className="flex flex-col space-y-6">');

// Find Quick Consultation Form
const idx2 = lines.findIndex(l => l.includes('{/* Quick Consultation Request Form (Firebase Firestore Integration) */}'));
lines.splice(idx2, 0, '            </div>', '            <div className="flex flex-col h-full">');

// Find Guarantees
const idx3 = lines.findIndex(l => l.includes('{/* Guarantees */}'));
lines.splice(idx3, 0, '            </div>', '          </div>');

fs.writeFileSync('src/components/LineCtaSection.tsx', lines.join('\n'));
