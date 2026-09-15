import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const email = process.env.ROLE_EMAIL?.trim();
const role = process.env.ROLE?.trim();
const sponsorId = process.env.SPONSOR_ID?.trim();
const databaseId = 'ai-studio-atomysatellitefu-2e7af57f-c75f-4374-9cd1-f638571d9f9d';

if (!email || !['admin', 'partner'].includes(role || '')) {
  throw new Error('ROLE_EMAIL and ROLE=admin|partner are required.');
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId: 'localhub-69fbe',
});
const user = await getAuth(app).getUserByEmail(email);
await getAuth(app).setCustomUserClaims(user.uid, {
  ...(user.customClaims || {}),
  role,
  admin: role === 'admin',
});

if (sponsorId) {
  const sponsorRef = getFirestore(app, databaseId).doc('sponsors/' + sponsorId);
  const sponsor = await sponsorRef.get();
  if (!sponsor.exists) {
    throw new Error('Sponsor ' + sponsorId + ' does not exist. Create the profile before assigning it.');
  }
  await sponsorRef.set({
    ownerUid: user.uid,
    isActive: true,
  }, { merge: true });
}

console.log('Assigned ' + role + ' to ' + email + (sponsorId ? ' for sponsor ' + sponsorId : '') + '.');
