const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');
code = code.replace(/export async function loginWithGoogle\(\) \{[\s\S]*?\}\n/g, '');
code = code.replace('GoogleAuthProvider,', '');
code = code.replace('signInWithPopup,', '');
fs.writeFileSync('src/lib/auth.ts', code);
