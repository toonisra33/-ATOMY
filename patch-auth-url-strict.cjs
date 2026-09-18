const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');

code = code.replace(
  "url: typeof window !== 'undefined' ? window.location.origin : 'https://sponsor-atomy.web.app',",
  "url: 'https://sponsor-atomy.web.app/?app=sponsor', // Hardcoded to ensure Firebase accepts it"
);

fs.writeFileSync('src/lib/auth.ts', code);
