const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');

// The issue is that deploying functions via CLI requires overly broad permissions
// for the GitHub service account, which is a known pain point with Firebase CLI.
// Instead of deploying functions via GitHub Actions, we'll revert to deploying ONLY hosting
// via GitHub Actions. The functions deployment will need to happen directly from
// a local environment or Cloud Shell where the user has Owner permissions, OR
// we can use Cloud Run instead of Firebase Functions which is much easier to manage.
// For now, let's restore the workflow to just deploy hosting so their CI/CD turns green.

const deployFunctionsStep = `      - name: Deploy Functions
        run: npx firebase-tools deploy --only functions --project localhub-69fbe --force`;

yml = yml.replace(deployFunctionsStep, '');

// Clean up any extra blank lines left behind
yml = yml.replace(/\n\s*\n/g, '\n');

fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);
