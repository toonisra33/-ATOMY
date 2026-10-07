import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  const email = process.env.ROLE_EMAIL?.trim();
  const role = process.env.ROLE?.trim();
  const sponsorId = process.env.SPONSOR_ID?.trim();
  const databaseId = 'ai-studio-atomysatellitefu-2e7af57f-c75f-4374-9cd1-f638571d9f9d';

  if (!email || !['admin', 'partner'].includes(role || '')) {
    console.warn('ROLE_EMAIL and ROLE=admin|partner not specified, skipping user role assignment.');
    return;
  }

  try {
    const app = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'atomy-sponserweb',
    });
    const user = await getAuth(app).getUserByEmail(email);
    await getAuth(app).setCustomUserClaims(user.uid, {
      ...(user.customClaims || {}),
      role,
      admin: role === 'admin',
    });

    if (sponsorId) {
      try {
        const sponsorRef = getFirestore(app, databaseId).doc('sponsors/' + sponsorId);
        const sponsor = await sponsorRef.get();
        if (sponsor.exists) {
          await sponsorRef.set({
            ownerUid: user.uid,
            isActive: true,
          }, { merge: true });
        }
      } catch (dbErr) {
        console.warn('Notice: Sponsor profile update skipped:', dbErr.message);
      }
    }

    console.log('Assigned ' + role + ' to ' + email + (sponsorId ? ' for sponsor ' + sponsorId : '') + '.');
  } catch (err) {
    console.warn('Notice: Could not assign role to user (non-blocking for hosting deployment):', err?.message || err);
  }
}

main().catch((err) => {
  console.warn('Set user role notice:', err?.message || err);
  process.exit(0);
});

