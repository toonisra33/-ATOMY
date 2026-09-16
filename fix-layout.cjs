const fs = require('fs');
let content = fs.readFileSync('src/components/LineCtaSection.tsx', 'utf-8');
const lines = content.split('\n');

// Find end of text block
const textBlockEnd = lines.findIndex(l => l.includes('เพื่อรับสิทธิ์ทีมงานและพี่เลี้ยงดูแลตลอดเส้นทางธุรกิจ'));
const insertGridStart = textBlockEnd + 2;

lines.splice(insertGridStart, 0, '          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-8 text-left">', '            <div className="flex flex-col space-y-6 lg:space-y-8">');

// Find Quick Consultation Form
const formStart = lines.findIndex(l => l.includes('{/* Quick Consultation Request Form (Firebase Firestore Integration) */}'));
lines.splice(formStart, 0, '            </div>', '            <div className="flex flex-col h-full w-full">');

// Find Guarantees
const guaranteesStart = lines.findIndex(l => l.includes('{/* Guarantees */}'));
lines.splice(guaranteesStart, 0, '            </div>', '          </div>');

fs.writeFileSync('src/components/LineCtaSection.tsx', lines.join('\n'));
