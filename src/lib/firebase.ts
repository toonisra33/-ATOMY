import { initializeApp, getApps, getApp, FirebaseError } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import firebaseConfigData from '../../firebase-applet-config.json';
import { LeadAttribution, SponsorProfile } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

const recaptchaSiteKey =
  import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY ||
  firebaseConfigData.recaptchaSiteKey;

if (typeof window !== 'undefined' && recaptchaSiteKey) {
  if (import.meta.env.DEV) {
    (globalThis as typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.warn('Firebase App Check could not be initialized:', error);
  }
} else if (import.meta.env.PROD) {
  console.warn('Firebase App Check is not active: missing reCAPTCHA Enterprise site key.');
}

export interface LeadSubmission {
  id?: string;
  fullName: string;
  phoneNumber: string;
  lineId?: string;
  sponsorId: string;
  sponsorName: string;
  status?: 'new' | 'contacted' | 'completed';
  createdAt?: string;
  consentAt: string;
  attribution: LeadAttribution;
  notes?: string;
}

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, '');
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function submitLead(lead: LeadSubmission) {
  const phoneNumber = normalizePhone(lead.phoneNumber);
  const leadId = await sha256(`${lead.sponsorId}:${phoneNumber}`);
  const leadRef = doc(db, 'leads', leadId);

  try {
    await setDoc(leadRef, {
      ...lead,
      fullName: lead.fullName.trim(),
      phoneNumber,
      lineId: lead.lineId?.trim() || '',
      status: 'new',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return { success: true, id: leadId, duplicate: false };
  } catch (error) {
    // A deterministic ID turns a repeat into an update. Public updates are denied.
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return { success: false, id: leadId, duplicate: true };
    }
    console.error('Error submitting lead to Firebase:', error);
    throw error;
  }
}

export async function fetchLeads(options: {
  isAdmin: boolean;
  sponsorId?: string;
}): Promise<LeadSubmission[]> {
  const leadsCol = collection(db, 'leads');
  const leadsQuery = options.isAdmin
    ? query(leadsCol, orderBy('createdAt', 'desc'), limit(100))
    : query(leadsCol, where('sponsorId', '==', options.sponsorId || '__none__'), limit(100));

  const snap = await getDocs(leadsQuery);
  const leads = snap.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<LeadSubmission, 'id'>),
  }));
  return leads.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'contacted' | 'completed',
) {
  const leadRef = doc(db, 'leads', leadId);
  await updateDoc(leadRef, { status, updatedAt: serverTimestamp() });
}

export async function saveSponsorProfile(sponsor: SponsorProfile, ownerUid: string) {
  const sponsorId = sponsor.sponsorId.trim();
  if (!auth.currentUser || auth.currentUser.uid !== ownerUid) {
    throw new Error('AUTH_REQUIRED');
  }

  const sponsorRef = doc(db, 'sponsors', sponsorId);
  await setDoc(
    sponsorRef,
    {
      ...sponsor,
      sponsorId,
      ownerUid,
      isActive: sponsor.isActive !== false,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return { success: true };
}

export async function loadSponsorProfile(sponsorId: string): Promise<SponsorProfile | null> {
  if (!sponsorId) return null;
  try {
    const snap = await getDoc(doc(db, 'sponsors', sponsorId));
    if (snap.exists() && snap.data().isActive !== false) {
      return snap.data() as SponsorProfile;
    }
    return null;
  } catch (error) {
    console.warn('Could not load sponsor from Firebase:', error);
    return null;
  }
}

export async function loadOwnedSponsorProfile(uid: string): Promise<SponsorProfile | null> {
  const ownedQuery = query(collection(db, 'sponsors'), where('ownerUid', '==', uid), limit(1));
  const snap = await getDocs(ownedQuery);
  return snap.empty ? null : (snap.docs[0].data() as SponsorProfile);
}

export default app;
