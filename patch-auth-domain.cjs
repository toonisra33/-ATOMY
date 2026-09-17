const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  'authDomain: firebaseConfigData.authDomain,',
  'authDomain: "sponsor-atomy.web.app",'
);

fs.writeFileSync('src/lib/firebase.ts', code);
