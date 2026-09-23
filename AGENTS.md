# Project Context & AI Studio Agent Instructions

## Current Project Status:
- **Project Name:** Sponsor Atomy (`sponsor-atomy` - Atomy Business & Sponsor Platform)
- **Deployment Strategy:** The primary deployment method for this project is **via GitHub Actions** (`.github/workflows/firebase-hosting-merge.yml`).
- **Core Technologies:** React, Vite, Tailwind CSS, Firebase (Firestore for database, Authentication), and GitHub Actions for CI/CD.

## Critical Rules for the Agent:

1. **Project Identity (sponsor-atomy):**
   - This project is strictly separate from localhub. The project is `sponsor-atomy`.
   - Never mix or combine it with localhub again. Front-end is dedicated to promotion and lead capture.
   - All management, 2-minute call scripts, lead inboxes, marketing pixels, and website galleries are located in the Back-Office (`/admin`).
   - Logging in with credentials immediately redirects to the Back-Office (`/admin`).
   - Super Admin (Admin หลัก) has full permissions to edit website galleries, marketing pixels, banners, etc. Satellite users (เว็บลูก) can only edit their personal profile information.

1. **GitHub CI/CD First:** 
   - ALWAYS remember that the user deploys this application through GitHub Actions. 
   - ANY changes made to the codebase, especially configuration files (`firebase.json`, `server.ts`, `package.json`), **MUST** be verified to ensure they do not break the GitHub Actions pipeline.
   - Do NOT run manual deployment commands (like `firebase deploy`) to bypass the user's flow unless explicitly requested for debugging. Always rely on guiding the user to "Save / Share / Sync" to push to GitHub.

2. **Think Holistically Before Acting:**
   - Before executing commands, modifying files, or proposing solutions, analyze the entire project context.
   - If a feature requires backend logic (like Dynamic SEO OG Tags), evaluate if the current GitHub Service Account has the necessary permissions. If it requires complex IAM setup that might frustrate the user, propose simpler alternatives first (like Cloud Run).

3. **Memory & Continuity:**
   - Acknowledge past interactions. We previously attempted to set up Cloud Functions for SSR (Dynamic SEO OG Tags) but reverted to a static build due to Google Cloud IAM permission issues with the GitHub Service Account.
   - The current workflow is reverted to a clean, static hosting deployment (`npm run build` -> `firebase deploy --only hosting`) to ensure the CI/CD pipeline remains green.

4. **Pending Features (To-Do List):**
   - LINE Notify integration for new lead alerts (pending).
   - Leads Inbox management system for sponsors (pending).
