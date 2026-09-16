import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  where,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { SponsorProfile } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY || firebaseConfigData.recaptchaSiteKey;
if (recaptchaKey && typeof window !== 'undefined') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.warn('Failed to initialize App Check', e);
  }
}

export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Suppress internal Firebase offline warnings in console
setLogLevel('silent');

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline') || ((error as any).code === 'unavailable')) {
      console.warn('Firebase connection: client offline or verifying credentials.');
    }
  }
}

testConnection();

export interface LeadSubmission {
  id?: string;
  fullName: string;
  phoneNumber: string;
  lineId?: string;
  sponsorId: string;
  sponsorName: string;
  ownerUid?: string;
  status?: 'new' | 'contacted' | 'completed';
  createdAt?: string;
  notes?: string;
  attribution?: Record<string, any>;
  hasConsent?: boolean;
}

export async function submitLead(lead: LeadSubmission) {
  try {
    const leadsCol = collection(db, 'leads');
    
    // Check for duplicate phone number for the same sponsor to prevent spam
    const q = query(
      leadsCol,
      where,
  where('sponsorId', '==', lead.sponsorId),
      where,
  where('phoneNumber', '==', lead.phoneNumber),
      limit(1)
    );
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error('DUPLICATE_LEAD');
      }
    } catch (readError) {
      // If we can't read due to permissions or offline, proceed with addDoc (blind insert)
      console.warn('Could not read existing leads to check for duplicates:', readError);
    }

    const docRef = await addDoc(leadsCol, {
      ...lead,
      status: 'new',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting lead to Firebase:', error);
    throw error;
  }
}

export async function verifySponsorPin(sponsorId: string, pin: string): Promise<boolean> {
  // Master Admin bypass (For the main sponsor to access without forcing profile creation initially)
  // Hardcoded for '39823016' (the default sponsor/แม่ข่าย). In real production, use Firebase Auth or environment secrets.
  if (sponsorId === '39823016' && pin === '999999') {
    return true;
  }

  try {
    const profile = await loadSponsorProfile(sponsorId);
    if (!profile) return false;
    
    // Simple verification (in a real production app, PIN should be hashed server-side)
    // For this satellite funnel, we check against the stored PIN
    return profile.pinHash === pin || (sponsorId === '39823016' && pin === '999999');
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}

export async function fetchLeads(): Promise<LeadSubmission[]> {
  try {
    const leadsCol = collection(db, 'leads');
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const q = query(
      leadsCol, 
      where,
  where('ownerUid', '==', user.uid),
      orderBy('createdAt', 'desc'), 
      limit(50)
    );
    
    const snap = await getDocs(q);
    const leads: LeadSubmission[] = [];
    snap.forEach((d) => {
      leads.push({ id: d.id, ...(d.data() as Omit<LeadSubmission, 'id'>) });
    });
    return leads;
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

export async function updateLeadStatus(leadId: string, status: 'new' | 'contacted' | 'completed') {
  try {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating lead status:', error);
    return false;
  }
}

export async function saveSponsorProfile(sponsor: SponsorProfile, ownerUid?: string) {
  try {
    const sponsorRef = doc(db, 'sponsors', sponsor.sponsorId || 'default');
    const data: any = {
      ...sponsor,
      updatedAt: new Date().toISOString(),
    };
    if (ownerUid) {
      data.ownerUid = ownerUid;
    }
    await setDoc(sponsorRef, data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving sponsor to Firebase:', error);
    throw error; // Changed from returning { success: false } to match PixelStatusModal's try-catch expectations
  }
}

export async function loadSponsorProfile(sponsorId: string): Promise<SponsorProfile | null> {
  try {
    const sponsorRef = doc(db, 'sponsors', sponsorId || 'default');
    const snap = await getDoc(sponsorRef);
    if (snap.exists()) {
      return snap.data() as SponsorProfile;
    }
    return null;
  } catch (error) {
    console.warn('Could not load sponsor from Firebase:', error);
    return null;
  }
}

export default app;
