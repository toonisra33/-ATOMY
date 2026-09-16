import { readFileSync } from 'fs';
const html = readFileSync('dist/index.html', 'utf8');
console.log('HTML loaded');
