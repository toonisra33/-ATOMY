const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');

code = code.replace(
  'await sendPasswordResetEmail(auth, email.trim());',
  `const actionCodeSettings = {
    // URL you want to redirect back to. The domain must be whitelisted in the Firebase Console.
    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhub-69fbe.firebaseapp.com',
    handleCodeInApp: false
  };
  await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);`
);

fs.writeFileSync('src/lib/auth.ts', code);
