const fs = require('fs');

const config = {
  apiKey: "AIzaSyCozdnZGBDxXclsdhucEPqORfmRbPlXfXA",
  authDomain: "atomy-sponserweb.firebaseapp.com",
  projectId: "atomy-sponserweb",
  storageBucket: "atomy-sponserweb.firebasestorage.app",
  messagingSenderId: "244246185418",
  appId: "1:244246185418:web:2d7cd43c975a749999bb33"
};

fs.writeFileSync('firebase-applet-config.json', JSON.stringify(config, null, 2));

// Also need to update the hardcoded authDomain in auth.ts to match the new one
let authCode = fs.readFileSync('src/lib/auth.ts', 'utf-8');
authCode = authCode.replace(
  "url: 'https://sponsor-atomy.web.app/?app=sponsor', // Hardcoded to ensure Firebase accepts it",
  "url: 'https://sponsor-atomy.web.app/?app=sponsor', // Updated to sponsor-atomy"
);
fs.writeFileSync('src/lib/auth.ts', authCode);

// Remove the manual override in firebase.ts since we are using a clean project
let firebaseTs = fs.readFileSync('src/lib/firebase.ts', 'utf-8');
firebaseTs = firebaseTs.replace(
  'authDomain: "sponsor-atomy.web.app",',
  'authDomain: firebaseConfigData.authDomain,'
);
fs.writeFileSync('src/lib/firebase.ts', firebaseTs);
