const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');

code = code.replace(
  "url: typeof window !== 'undefined' ? window.location.origin : 'https://localhub-69fbe.firebaseapp.com',",
  "url: typeof window !== 'undefined' ? window.location.origin : 'https://sponsor-atomy.web.app',"
);

fs.writeFileSync('src/lib/auth.ts', code);
