import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, collection, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  fullName: string;
  phoneNumber: string;
  lineId?: string;
  sponsorId: string;
  sponsorName: string;
  notes?: string;
}

export async function submitLead(lead: LeadSubmission) {
  try {
    const leadsCol = collection(db, 'leads');
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

export default app;
