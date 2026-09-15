import { initializeApp, getApps, getApp } from 'firebase/app';
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
  where
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

export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
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
      where('sponsorId', '==', lead.sponsorId),
      where('phoneNumber', '==', lead.phoneNumber),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('DUPLICATE_LEAD');
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

export async function fetchLeads(sponsorId?: string): Promise<LeadSubmission[]> {
  try {
    const leadsCol = collection(db, 'leads');
    let q = query(leadsCol, orderBy('createdAt', 'desc'), limit(50));
    
    // If sponsorId filter is provided
    if (sponsorId) {
      q = query(leadsCol, where('sponsorId', '==', sponsorId), limit(50));
    }

    const snap = await getDocs(q);
    const leads: LeadSubmission[] = [];
    snap.forEach((d) => {
      leads.push({ id: d.id, ...(d.data() as Omit<LeadSubmission, 'id'>) });
    });
    return leads;
  } catch (error) {
    console.warn('Error fetching leads, falling back to simple query:', error);
    try {
      const leadsCol = collection(db, 'leads');
      const snap = await getDocs(leadsCol);
      const leads: LeadSubmission[] = [];
      snap.forEach((d) => {
        leads.push({ id: d.id, ...(d.data() as Omit<LeadSubmission, 'id'>) });
      });
      return leads.reverse();
    } catch (fallbackError) {
      console.error('Error in fallback fetchLeads:', fallbackError);
      return [];
    }
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

export async function saveSponsorProfile(sponsor: SponsorProfile) {
  try {
    const sponsorRef = doc(db, 'sponsors', sponsor.sponsorId || 'default');
    await setDoc(sponsorRef, {
      ...sponsor,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving sponsor to Firebase:', error);
    return { success: false, error };
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
