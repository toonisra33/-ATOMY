import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

const projectId = 'localhub-69fbe';
const rules = fs.readFileSync('firestore.rules', 'utf8');
const env = await initializeTestEnvironment({
  projectId,
  firestore: { rules },
});

const sponsorId = '39823016';
const sponsor = {
  sponsorId,
  sponsorName: 'Test Sponsor',
  sponsorPosition: 'Partner',
  lineId: 'testline',
  lineUrl: 'https://line.me/ti/p/~testline',
  phoneNumber: '0812345678',
  teamName: 'Test Team',
  ownerUid: 'partner-a',
  isActive: true,
};
const leadId = 'a'.repeat(64);
const lead = {
  fullName: 'Lead Test',
  phoneNumber: '0891234567',
  lineId: '',
  sponsorId,
  sponsorName: sponsor.sponsorName,
  status: 'new',
  createdAt: new Date().toISOString(),
  timestamp: serverTimestamp(),
  consentAt: new Date().toISOString(),
  attribution: {
    landingPage: 'https://example.test/',
    eventId: 'event-test-12345',
  },
};

try {
  const admin = env.authenticatedContext('admin-user', { admin: true }).firestore();
  const partner = env.authenticatedContext('partner-a').firestore();
  const stranger = env.authenticatedContext('partner-b').firestore();
  const visitor = env.unauthenticatedContext().firestore();

  await assertSucceeds(setDoc(doc(admin, 'sponsors', sponsorId), sponsor));
  await assertSucceeds(getDoc(doc(visitor, 'sponsors', sponsorId)));
  await assertFails(setDoc(doc(visitor, 'sponsors', 'untrusted'), { ...sponsor, sponsorId: 'untrusted' }));

  await assertSucceeds(setDoc(doc(visitor, 'leads', leadId), lead));
  await assertFails(setDoc(doc(visitor, 'leads', leadId), lead));
  await assertFails(getDoc(doc(visitor, 'leads', leadId)));
  await assertSucceeds(getDoc(doc(partner, 'leads', leadId)));
  await assertSucceeds(getDocs(query(collection(partner, 'leads'), where('sponsorId', '==', sponsorId))));
  await assertFails(getDoc(doc(stranger, 'leads', leadId)));
  await assertSucceeds(getDoc(doc(admin, 'leads', leadId)));
  await assertFails(getDocs(collection(partner, 'leads')));

  await assertSucceeds(updateDoc(doc(partner, 'leads', leadId), {
    status: 'contacted',
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(partner, 'leads', leadId), {
    phoneNumber: '0800000000',
  }));
  await assertSucceeds(updateDoc(doc(partner, 'sponsors', sponsorId), {
    sponsorName: 'Updated Sponsor',
  }));
  await assertFails(updateDoc(doc(stranger, 'sponsors', sponsorId), {
    sponsorName: 'Hijacked Sponsor',
  }));

  console.log('Firestore security rules tests passed.');
} finally {
  await env.cleanup();
}
