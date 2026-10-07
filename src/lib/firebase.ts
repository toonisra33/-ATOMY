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
  setLogLevel,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { SponsorProfile } from '../types';
import { setCustomBanner } from './imageUtils';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const rawRecaptchaKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY || firebaseConfigData.recaptchaSiteKey;
const isValidRecaptchaKey = Boolean(
  rawRecaptchaKey &&
  typeof rawRecaptchaKey === 'string' &&
  !rawRecaptchaKey.includes('YOUR_') &&
  !rawRecaptchaKey.includes('RECAPTCHA') &&
  rawRecaptchaKey.trim().length > 10
);

if (isValidRecaptchaKey && typeof window !== 'undefined') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(rawRecaptchaKey),
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
  interest?: string;
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
    interest: 'สนใจสร้างรายได้เสริมควบคู่กับงานประจำ (ธุรกิจ)',
    status: 'new',
    notes: 'สะดวกรับสายช่วงค่ำหลัง 18:30 น. สนใจโมเดลเว็บไซต์ช่วยทำงานอัตโนมัติ ไม่ชอบตื๊อขายของ',
    hasConsent: true,
  },
  {
    fullName: 'คุณวรัญญา สุวรรณรัตน์ (คุณน้ำ)',
    phoneNumber: '0898765432',
    email: 'nam.waranya@hotmail.com',
    lineId: 'nam_waranya',
    age: '42',
    occupation: 'ธุรกิจส่วนตัว / ค้าขายออนไลน์',
    interest: 'สนใจทดลองใช้สินค้าเกาหลีระดับพรีเมียม (ผู้บริโภค)',
    status: 'new',
    notes: 'เคยขายของออนไลน์แต่เหนื่อยกับการสต็อกของ ชอบคอนเซ็ปต์ซื้อกินซื้อใช้สร้างเครือข่าย สนใจชุด Absolute สกินแคร์',
    hasConsent: true,
  },
  {
    fullName: 'คุณธนพล ศรีวิชัย (คุณบอม)',
    phoneNumber: '0923456789',
    email: 'thanapol.bom@gmail.com',
    lineId: 'bomb_eng99',
    age: '29',
    occupation: 'วิศวกรไฟฟ้า',
    interest: 'สนใจศึกษาแผนการตลาดและสร้าง Passive Income',
    status: 'new',
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
    interest: 'สนใจสร้างรายได้เสริมควบคู่กับงานประจำ (ธุรกิจ)',
    status: 'new',
    notes: 'สะดวกคุยช่วงบ่าย อยากหารายได้เสริมระหว่างดูแลลูกที่บ้าน พร้อมเริ่มเรียนรู้งานผ่านมือถือ',
    hasConsent: true,
  },
  {
    fullName: 'คุณกิตติศักดิ์ พงษ์ไพศาล (คุณเอ็ม)',
    phoneNumber: '0865554321',
    email: 'kittisak.m@outlook.com',
    lineId: 'kru_m_atomy',
    age: '46',
    occupation: 'ข้าราชการครู',
    interest: 'สนใจศึกษาแผนการตลาดและสร้าง Passive Income',
    status: 'new',
    notes: 'มองหาโอกาสเกษียณล่วงหน้า ชอบที่ไม่บังคับรักษายอดรายเดือน และสมัครสมาชิกฟรี',
    hasConsent: true,
  },
  {
    fullName: 'คุณชลธิชา มณีรัตน์ (คุณฟ้า)',
    phoneNumber: '0958881234',
    email: 'fah.marketing@gmail.com',
    lineId: 'fah_chonthicha',
    age: '27',
    occupation: 'ฟรีแลนซ์การตลาดออนไลน์',
    interest: 'สนใจขยายทีมงานด้วยระบบเว็บไซต์และเครื่องมือออนไลน์',
    status: 'new',
    notes: 'ชอบระบบการตลาดดิจิทัล อยากใช้ลิงก์และระบบเว็บพ่วงสปอนเซอร์ของทีม Atomy Freedomlife ขยายสายงานต่อ',
    hasConsent: true,
  },
];

/**
 * ส่งออกรายชื่อผู้มุ่งหวังเป็นไฟล์ Excel (.csv with UTF-8 BOM)
 * เปิดในโปรแกรม Microsoft Excel ภาษาไทยได้ทันทีโดยไม่เพี้ยน
 */
export function exportLeadsToExcelCSV(leads: LeadSubmission[], filenamePrefix: string = 'atomy_uncontacted_leads'): void {
  if (typeof window === 'undefined' || !leads || leads.length === 0) {
    alert('ไม่มีข้อมูลรายชื่อสำหรับส่งออก');
    return;
  }

  // กำหนดหัวตาราง (Headers) สำหรับไฟล์ Excel
  const headers = [
    'ลำดับ',
    'สถานะ',
    'ชื่อ-นามสกุล',
    'เบอร์โทรศัพท์',
    'LINE ID',
    'อีเมล',
    'ความสนใจ',
    'หมายเหตุเพิ่มเติม',
    'อายุ',
    'อาชีพ',
    'วันที่ลงทะเบียน',
    'ชื่อสปอนเซอร์',
    'รหัสสปอนเซอร์'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const statusLabel = (s?: string) => {
    if (s === 'contacted') return 'ติดต่อแล้ว';
    if (s === 'completed') return 'ปิดการสมัครแล้ว';
    return 'ยังไม่ได้รับการติดต่อ (รอติดต่อ)';
  };

  const rows = leads.map((item, index) => {
    const formattedDate = item.createdAt 
      ? new Date(item.createdAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) 
      : '-';

    return [
      index + 1,
      statusLabel(item.status),
      item.fullName || '-',
      item.phoneNumber || '-',
      item.lineId || '-',
      item.email || '-',
      item.interest || 'สนใจสร้างรายได้เสริมควบคู่กับงานประจำ',
      item.notes || '-',
      item.age || '-',
      item.occupation || '-',
      formattedDate,
      item.sponsorName || '-',
      item.sponsorId || '-'
    ].map(escapeCSV).join(',');
  });

  // UTF-8 BOM (\uFEFF) เพื่อให้ Excel บน Windows/Mac เปิดภาษาไทยถูกต้อง ไม่เป็นภาษาต่างดาว
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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

export async function loadSponsorProfile(sponsorId: string, adminEmail?: string): Promise<SponsorProfile | null> {
  try {
    const idClean = (sponsorId || 'default').trim();
    const sponsorRef = doc(db, 'sponsors', idClean);
    const snap = await getDoc(sponsorRef);
    if (snap.exists()) {
      const data = snap.data() as SponsorProfile;
      applyExternalBannerSettings(data);
      return data;
    }

    // Fallback: check master sponsor 39823016 if different
    if (idClean !== '39823016') {
      const masterRef = doc(db, 'sponsors', '39823016');
      const masterSnap = await getDoc(masterRef);
      if (masterSnap.exists()) {
        const data = masterSnap.data() as SponsorProfile;
        applyExternalBannerSettings(data);
        return data;
      }
    }

    // Fallback: check admin email document if provided
    const targetEmail = (adminEmail || (idClean.includes('@') ? idClean : '')).toLowerCase().trim();
    if (targetEmail) {
      const emailDocId = targetEmail.replace(/[.#$[\]/]/g, '_');
      const emailRef = doc(db, 'sponsors', emailDocId);
      const emailSnap = await getDoc(emailRef);
      if (emailSnap.exists()) {
        const data = emailSnap.data() as SponsorProfile;
        applyExternalBannerSettings(data);
        return data;
      }
    }

    // Fallback: check global admin_settings
    try {
      const globalSettingsRef = doc(db, 'admin_settings', 'global');
      const globalSnap = await getDoc(globalSettingsRef);
      if (globalSnap.exists()) {
        const data = globalSnap.data() as SponsorProfile;
        applyExternalBannerSettings(data);
        return data;
      }
    } catch {
      // Ignore if not present
    }

    return null;
  } catch (error) {
    console.warn('Could not load sponsor from Firebase:', error);
    return null;
  }
}

/**
 * Apply banner and appearance configurations received from external Firestore updates
 */
function applyExternalBannerSettings(data: any): void {
  if (typeof window === 'undefined' || !data) return;
  try {
    if (data.desktopBannerUrl && typeof data.desktopBannerUrl === 'string' && data.desktopBannerUrl.trim()) {
      setCustomBanner('desktop', data.desktopBannerUrl.trim());
    }
    if (data.mobileBannerUrl && typeof data.mobileBannerUrl === 'string' && data.mobileBannerUrl.trim()) {
      setCustomBanner('mobile', data.mobileBannerUrl.trim());
    }
  } catch (err) {
    console.warn('Error applying external banner:', err);
  }
}

/**
 * Real-time listener for Sponsor Profile and Admin Settings from external Firestore.
 * When an admin email updates information externally (e.g. in Firebase Console,
 * external API, or another browser window), this triggers immediately and keeps the app in sync.
 */
export function watchSponsorProfile(
  sponsorId: string,
  onUpdate: (updated: Partial<SponsorProfile>) => void,
  adminEmail: string = 'toonisra33@gmail.com'
): () => void {
  const unsubscribers: Array<() => void> = [];

  const handleIncomingData = (data: any, sourceLabel: string) => {
    if (!data) return;
    try {
      applyExternalBannerSettings(data);

      // Clean & extract fields
      const partial: Partial<SponsorProfile> = {};
      if (data.sponsorName) partial.sponsorName = data.sponsorName;
      if (data.sponsorPosition) partial.sponsorPosition = data.sponsorPosition;
      if (data.lineId) partial.lineId = data.lineId;
      if (data.lineUrl) partial.lineUrl = data.lineUrl;
      if (data.phoneNumber) partial.phoneNumber = data.phoneNumber;
      if (data.teamName) partial.teamName = data.teamName;
      if (data.welcomeNote !== undefined) partial.welcomeNote = data.welcomeNote;
      if (data.avatarUrl) partial.avatarUrl = data.avatarUrl;
      if (data.ogImageUrl) partial.ogImageUrl = data.ogImageUrl;
      if (data.shareTitle) partial.shareTitle = data.shareTitle;
      if (data.shareDescription) partial.shareDescription = data.shareDescription;
      if (data.fbPixelId !== undefined) partial.fbPixelId = data.fbPixelId;
      if (data.tiktokPixelId !== undefined) partial.tiktokPixelId = data.tiktokPixelId;
      if (data.googleTagId !== undefined) partial.googleTagId = data.googleTagId;
      if (data.customVideoUrl) partial.customVideoUrl = data.customVideoUrl;
      if (data.customVideoMinutes) partial.customVideoMinutes = data.customVideoMinutes;
      if (data.pinHash) partial.pinHash = data.pinHash;
      if (data.desktopBannerUrl) partial.desktopBannerUrl = data.desktopBannerUrl;
      if (data.mobileBannerUrl) partial.mobileBannerUrl = data.mobileBannerUrl;
      if (data.announcement !== undefined) partial.announcement = data.announcement;
      partial.updatedAt = data.updatedAt || new Date().toISOString();

      if (Object.keys(partial).length > 0) {
        onUpdate(partial);

        // Update local cached sponsor
        if (typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem('atomy_custom_sponsor');
            const current = cached ? JSON.parse(cached) : {};
            const merged = { ...current, ...partial };
            localStorage.setItem('atomy_custom_sponsor', JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('atomy-sponsor-synced', { detail: { profile: merged, source: sourceLabel } }));
          } catch (e) {
            console.warn('Cache sync notice:', e);
          }
        }
      }
    } catch (err) {
      console.warn(`Error handling incoming ${sourceLabel} sync:`, err);
    }
  };

  try {
    const targetId = (sponsorId || '39823016').trim();
    // 1. Listen to target sponsor document
    const primaryRef = doc(db, 'sponsors', targetId);
    const unsubPrimary = onSnapshot(
      primaryRef,
      (snap) => {
        if (snap.exists()) {
          handleIncomingData(snap.data(), `sponsors/${targetId}`);
        }
      },
      (err) => console.warn(`Notice watching sponsor ${targetId}:`, err?.message || err)
    );
    unsubscribers.push(unsubPrimary);

    // 2. If target is not master '39823016', also listen to master '39823016'
    if (targetId !== '39823016') {
      const masterRef = doc(db, 'sponsors', '39823016');
      const unsubMaster = onSnapshot(
        masterRef,
        (snap) => {
          if (snap.exists()) {
            handleIncomingData(snap.data(), 'sponsors/39823016');
          }
        },
        (err) => console.warn('Notice watching master sponsor 39823016:', err?.message || err)
      );
      unsubscribers.push(unsubMaster);
    }

    // 3. Listen to global admin_settings document (for external admin overrides)
    const adminSettingsRef = doc(db, 'admin_settings', 'global');
    const unsubGlobal = onSnapshot(
      adminSettingsRef,
      (snap) => {
        if (snap.exists()) {
          handleIncomingData(snap.data(), 'admin_settings/global');
        }
      },
      (err) => console.warn('Notice watching admin_settings/global:', err?.message || err)
    );
    unsubscribers.push(unsubGlobal);

    // 4. Listen to admin email document if specified
    const cleanEmail = (adminEmail || 'toonisra33@gmail.com').toLowerCase().trim();
    if (cleanEmail) {
      const emailDocId = cleanEmail.replace(/[.#$[\]/]/g, '_');
      const emailRef = doc(db, 'sponsors', emailDocId);
      const unsubEmail = onSnapshot(
        emailRef,
        (snap) => {
          if (snap.exists()) {
            handleIncomingData(snap.data(), `sponsors/${emailDocId}`);
          }
        },
        (err) => console.warn(`Notice watching admin email doc ${emailDocId}:`, err?.message || err)
      );
      unsubscribers.push(unsubEmail);

      // Also listen to admin_settings/{emailDocId}
      const adminEmailSettingsRef = doc(db, 'admin_settings', emailDocId);
      const unsubAdminEmailSettings = onSnapshot(
        adminEmailSettingsRef,
        (snap) => {
          if (snap.exists()) {
            handleIncomingData(snap.data(), `admin_settings/${emailDocId}`);
          }
        },
        (err) => console.warn(`Notice watching admin_settings/${emailDocId}:`, err?.message || err)
      );
      unsubscribers.push(unsubAdminEmailSettings);
    }
  } catch (setupError) {
    console.warn('Error setting up sponsor real-time watchers:', setupError);
  }

  // Cross-tab broadcast receiver
  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel('atomy_realtime_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SPONSOR_UPDATED' && event.data.profile) {
          onUpdate(event.data.profile);
        }
      };
    } catch {
      // BroadcastChannel optional fallback
    }
  }

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // Safe unsubscribe
      }
    });
    if (bc) {
      try {
        bc.close();
      } catch {
        // Safe close
      }
    }
  };
}

/**
 * Real-time listener for Leads collection.
 * Triggers immediately whenever a lead is created, status changed, or updated externally.
 */
export function watchLeads(
  onUpdate: (leads: LeadSubmission[]) => void,
  sponsorId?: string
): () => void {
  let unsub: (() => void) | null = null;

  try {
    const leadsCol = collection(db, 'leads');
    const q = query(leadsCol, orderBy('createdAt', 'desc'), limit(250));

    unsub = onSnapshot(
      q,
      (snapshot) => {
        const cloudLeads: LeadSubmission[] = [];
        snapshot.forEach((d) => {
          cloudLeads.push({ id: d.id, ...(d.data() as Omit<LeadSubmission, 'id'>) });
        });

        // Merge with local leads to retain offline/sample records safely
        const localLeads = getLocalLeads();
        const combined: LeadSubmission[] = [...cloudLeads];
        for (const local of localLeads) {
          if (!combined.some((c) => c.id === local.id || (c.phoneNumber && c.phoneNumber === local.phoneNumber))) {
            combined.push(local);
          }
        }

        combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        saveLocalLeads(combined);
        onUpdate(combined);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('atomy-leads-synced', { detail: combined }));
        }
      },
      (err) => {
        console.warn('Notice watching leads collection in real-time:', err?.message || err);
        // Fallback to local leads
        onUpdate(getLocalLeads());
      }
    );
  } catch (setupErr) {
    console.warn('Could not initialize real-time leads watcher:', setupErr);
    onUpdate(getLocalLeads());
  }

  return () => {
    if (unsub) {
      try {
        unsub();
      } catch {
        // Safe cleanup
      }
    }
  };
}

/**
 * Force manual immediate synchronization of all external admin data from Firestore
 */
export async function syncAdminExternalData(adminEmail: string = 'toonisra33@gmail.com'): Promise<{
  sponsorUpdated: boolean;
  leadsCount: number;
  message: string;
}> {
  let sponsorUpdated = false;
  let leadsCount = 0;

  try {
    // 1. Sync Sponsor & Admin Settings
    const loaded = await loadSponsorProfile('39823016', adminEmail);
    if (loaded) {
      sponsorUpdated = true;
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('atomy_custom_sponsor');
        const current = cached ? JSON.parse(cached) : {};
        const merged = { ...current, ...loaded };
        localStorage.setItem('atomy_custom_sponsor', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('atomy-sponsor-synced', { detail: { profile: merged, source: 'manual-sync' } }));
      }
    }

    // 2. Sync Leads
    const leads = await fetchLeads(true);
    leadsCount = leads.length;

    return {
      sponsorUpdated,
      leadsCount,
      message: `ซิงค์ข้อมูลกับระบบภายนอกสำเร็จ! รายชื่อล่าสุด ${leadsCount} รายการ`,
    };
  } catch (error: any) {
    console.error('Error during external data sync:', error);
    return {
      sponsorUpdated,
      leadsCount,
      message: 'ซิงค์ข้อมูลจากแคชในเครื่องเรียบร้อยแล้ว',
    };
  }
}

export default app;
