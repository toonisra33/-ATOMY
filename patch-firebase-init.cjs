const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  'authDomain: "sponsor-atomy.web.app",',
  'authDomain: firebaseConfigData.authDomain,'
);

fs.writeFileSync('src/lib/firebase.ts', code);
