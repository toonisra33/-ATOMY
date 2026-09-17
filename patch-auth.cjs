const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');

if (!code.includes('createUserWithEmailAndPassword')) {
  code = code.replace(
    "import {\n  onAuthStateChanged,\n  sendPasswordResetEmail,\n  signInWithEmailAndPassword,\n  signOut,\n  User,\n} from 'firebase/auth';",
    "import {\n  onAuthStateChanged,\n  sendPasswordResetEmail,\n  signInWithEmailAndPassword,\n  createUserWithEmailAndPassword,\n  signOut,\n  User,\n} from 'firebase/auth';"
  );
  
  const registerFunc = `
export async function registerWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return toSession(result.user);
}
`;
  code += registerFunc;
  fs.writeFileSync('src/lib/auth.ts', code);
}
