import {
  
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  
  signOut,
  User,
} from 'firebase/auth';
import { AuthSession } from '../types';
import { auth } from './firebase';

async function toSession(user: User): Promise<AuthSession> {
  const token = await user.getIdTokenResult(true);
  const isAdmin = token.claims.admin === true || token.claims.role === 'admin';
  return {
    uid: user.uid,
    email: user.email || '',
    isAdmin,
    role: isAdmin ? 'admin' : 'partner',
  };
}

export function watchAuthSession(
  onChange: (session: AuthSession | null) => void,
  onReady?: () => void,
) {
  return onAuthStateChanged(auth, async (user) => {
    try {
      onChange(user ? await toSession(user) : null);
    } finally {
      onReady?.();
    }
  });
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return toSession(result.user);
}


export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email.trim());
}
