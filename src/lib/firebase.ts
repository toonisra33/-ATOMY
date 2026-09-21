import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  email?: string;
  lineId?: string;
  age?: string;
  occupation?: string;
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
    
    // Only check for duplicate phone number if the client is authenticated,
    // avoiding permission denial on public unauthenticated landing page visitors
    if (auth.currentUser) {
      try {
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
      } catch (readError: any) {
        if (readError?.message === 'DUPLICATE_LEAD') {
          throw readError;
        }
        // If query fails, continue with insert
      }
    }

    const createdAtStr = new Date().toISOString();
    let docId = `lead-${Date.now()}`;
    try {
      const docRef = await addDoc(leadsCol, {
        ...lead,
        status: 'new',
        createdAt: createdAtStr,
        timestamp: serverTimestamp(),
      });
      docId = docRef.id;
    } catch (fsErr) {
      console.warn('Firestore direct write notice (will save to local storage):', fsErr);
    }

    // Always update local cache so lead is immediately visible to sponsor
    const newLeadItem: LeadSubmission = {
      id: docId,
      ...lead,
      status: 'new',
      createdAt: createdAtStr,
    };
    const cachedLeads = getLocalLeads();
    saveLocalLeads([newLeadItem, ...cachedLeads.filter(l => l.phoneNumber !== lead.phoneNumber)]);

    return { success: true, id: docId };
  } catch (error) {
    console.error('Error submitting lead to Firebase:', error);
    throw error;
  }
}

const LOCAL_LEADS_STORAGE_KEY = 'atomy_cached_leads';

export function getLocalLeads(): LeadSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLeads(leads: LeadSubmission[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.warn('Could not save local leads:', e);
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

export async function fetchLeads(isAdmin: boolean = false): Promise<LeadSubmission[]> {
  const localLeads = getLocalLeads();
  let cloudLeads: LeadSubmission[] = [];

  try {
    const leadsCol = collection(db, 'leads');
    // Query leads ordered by creation time
    const q = query(
      leadsCol,
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    
    const snap = await getDocs(q);
    snap.forEach((d) => {
      cloudLeads.push({ id: d.id, ...(d.data() as Omit<LeadSubmission, 'id'>) });
    });
  } catch (error: any) {
    console.warn('Notice while fetching cloud leads (using local cache):', error?.message || error);
  }

  // Merge cloud leads with local leads
  const combined: LeadSubmission[] = [...cloudLeads];
  for (const local of localLeads) {
    if (!combined.some(c => c.id === local.id || (c.phoneNumber && c.phoneNumber === local.phoneNumber))) {
      combined.push(local);
    }
  }

  // If no leads exist anywhere, automatically seed the 6 test leads so user can test right away
  if (combined.length === 0) {
    const seeded = await seedSampleLeads('39823016', 'อิศราวัฒน์ ปวินทกานต์');
    return seeded;
  }

  combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  saveLocalLeads(combined);
  return combined;
}

export async function updateLeadStatus(leadId: string, status: 'new' | 'contacted' | 'completed', notes?: string) {
  // 1. Immediately update in local cache
  const localLeads = getLocalLeads();
  const idx = localLeads.findIndex(l => l.id === leadId);
  if (idx !== -1) {
    localLeads[idx] = { ...localLeads[idx], status, ...(notes !== undefined ? { notes } : {}) };
    saveLocalLeads(localLeads);
  }

  // 2. Sync to Firestore if remote document ID
  try {
    if (!leadId.startsWith('sample-') && !leadId.startsWith('lead-')) {
      const leadRef = doc(db, 'leads', leadId);
      const updatePayload: any = { status };
      if (notes !== undefined) updatePayload.notes = notes;
      await updateDoc(leadRef, updatePayload);
    }
    return true;
  } catch (error) {
    console.warn('Notice while updating cloud lead status:', error);
    return true; // Still true because local cache succeeded
  }
}

export const SAMPLE_LEADS_DATA: Array<Omit<LeadSubmission, 'id' | 'sponsorId' | 'sponsorName'>> = [
  {
    fullName: 'คุณสมชาย มีสุข (คุณก้อง)',
    phoneNumber: '0812345678',
    email: 'kong.somchai@gmail.com',
    lineId: 'kong_somchai',
    age: '35',
    occupation: 'พนักงานบริษัทเอกชน (ไอที)',
    status: 'new',
    notes: 'สนใจสร้างรายได้เสริมควบคู่กับงานประจำ มีเวลาช่วงค่ำและวันหยุด ไม่ชอบตื๊อขายของ อยากศึกษาโมเดลเว็บไซต์ช่วยทำงานอัตโนมัติ',
    hasConsent: true,
  },
  {
    fullName: 'คุณวรัญญา สุวรรณรัตน์ (คุณน้ำ)',
    phoneNumber: '0898765432',
    email: 'nam.waranya@hotmail.com',
    lineId: 'nam_waranya',
    age: '42',
    occupation: 'ธุรกิจส่วนตัว / ค้าขายออนไลน์',
    status: 'new',
    notes: 'เคยขายของออนไลน์แต่เหนื่อยกับการสต็อกของและแพ็คส่งเอง ชอบคอนเซ็ปต์สินค้าเกาหลีระดับพรีเมียม ซื้อกินซื้อใช้สร้างเครือข่าย',
    hasConsent: true,
  },
  {
    fullName: 'คุณธนพล ศรีวิชัย (คุณบอม)',
    phoneNumber: '0923456789',
    email: 'thanapol.bom@gmail.com',
    lineId: 'bomb_eng99',
    age: '29',
    occupation: 'วิศวกรไฟฟ้า',
    status: 'contacted',
    notes: 'ดูคลิปบรรยาย 20 นาทีจบแล้ว สนใจเรื่องโมเดลไบนารี่ 2 สายงาน และระบบ Global สะสมคะแนน PV ไม่จำกัดชั้นลึก',
    hasConsent: true,
  },
  {
    fullName: 'คุณพัชรินทร์ เจริญสุข (คุณปุ๊ก)',
    phoneNumber: '0619876543',
    email: 'pook.family@yahoo.com',
    lineId: 'pook_patcha',
    age: '38',
    occupation: 'แม่บ้าน / ดูแลครอบครัว',
    status: 'new',
    notes: 'อยากหารายได้เสริมระหว่างดูแลลูกที่บ้าน ใช้สกินแคร์และของใช้ในบ้านอยู่แล้ว พร้อมเริ่มเรียนรู้งานผ่านระบบมือถือ',
    hasConsent: true,
  },
  {
    fullName: 'คุณกิตติศักดิ์ พงษ์ไพศาล (คุณเอ็ม)',
    phoneNumber: '0865554321',
    email: 'kittisak.m@outlook.com',
    lineId: 'kru_m_atomy',
    age: '46',
    occupation: 'ข้าราชการครู',
    status: 'completed',
    notes: 'มองหาโอกาสเกษียณล่วงหน้า อยากสร้าง Passive Income ระยะยาว ชอบที่ไม่บังคับรักษายอดรายเดือน และสมัครสมาชิกฟรี',
    hasConsent: true,
  },
  {
    fullName: 'คุณชลธิชา มณีรัตน์ (คุณฟ้า)',
    phoneNumber: '0958881234',
    email: 'fah.marketing@gmail.com',
    lineId: 'fah_chonthicha',
    age: '27',
    occupation: 'ฟรีแลนซ์การตลาดออนไลน์',
    status: 'contacted',
    notes: 'ชอบระบบการตลาดดิจิทัล อยากใช้ลิงก์และระบบเว็บพ่วงสปอนเซอร์ของทีม Atomy Freedomlife ขยายสายงานต่อ',
    hasConsent: true,
  },
];

export async function seedSampleLeads(sponsorId: string, sponsorName: string): Promise<LeadSubmission[]> {
  const createdLeads: LeadSubmission[] = [];
  const now = Date.now();

  for (let i = 0; i < SAMPLE_LEADS_DATA.length; i++) {
    const sample = SAMPLE_LEADS_DATA[i];
    const createdAt = new Date(now - (i * 3600 * 1000 * 3 + i * 18 * 60 * 1000)).toISOString();
    const leadObj: LeadSubmission = {
      id: `sample-${now}-${i}`,
      ...sample,
      sponsorId: sponsorId || '39823016',
      sponsorName: sponsorName || 'อิศราวัฒน์ ปวินทกานต์',
      createdAt,
    };
    createdLeads.push(leadObj);

    // Sync to Firestore in background safely
    try {
      const leadsCol = collection(db, 'leads');
      addDoc(leadsCol, {
        ...sample,
        sponsorId: sponsorId || '39823016',
        sponsorName: sponsorName || 'อิศราวัฒน์ ปวินทกานต์',
        createdAt,
        timestamp: serverTimestamp(),
      }).then((docRef) => {
        leadObj.id = docRef.id;
      }).catch((e) => {
        console.warn('Background Firestore lead sync notice:', e?.message || e);
      });
    } catch {
      // Offline / permission fail-safe
    }
  }

  // Merge into local storage so they are immediately accessible anywhere
  const existing = getLocalLeads();
  const merged = [
    ...createdLeads,
    ...existing.filter((e) => !createdLeads.some((c) => c.phoneNumber === e.phoneNumber)),
  ];
  saveLocalLeads(merged);

  return createdLeads;
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
    // Remove any undefined properties to prevent Firestore invalid data errors
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });
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
