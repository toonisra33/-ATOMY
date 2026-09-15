# Production setup

The codebase is secure-by-default after the Firestore rules are deployed. Complete these
account-level settings before accepting leads:

1. In Firebase Authentication, enable Email/Password and create the first admin account.
2. Run the **Manage Firebase user role** workflow with that email, role **admin**, and sponsor
   ID **39823016**. Sign out and back in after claims change.
3. Create a Web reCAPTCHA Enterprise key for localhub-atomy.web.app, add its public site key
   to the GitHub Actions secret RECAPTCHA_ENTERPRISE_SITE_KEY, then enable App Check
   enforcement for the named Firestore database after verifying valid requests.
4. Merge only after npm run lint, npm run build, and npm run test:rules pass.

## Access model

- Visitors can fetch one active sponsor by exact ?ref=XXXX and create one validated lead.
- Partners can list and update only leads belonging to their owned sponsor profile.
- Admins can list all leads and administer sponsor profiles.
- Only admins can delete leads or sponsor profiles.
- Duplicate phone numbers for the same sponsor resolve to the same SHA-256 document ID and
  cannot create a second record.
