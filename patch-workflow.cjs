const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');

// We insert function deployment steps before the hosting deploy step
const buildStep = '- run: npm run build';
const functionsStep = `      - run: npm run build
      - name: Prepare Functions
        run: |
          cd functions
          npm install
          cp ../dist/index.html ./index.html
      - name: Deploy Functions
        run: npx firebase-tools deploy --only functions --project localhub-69fbe --force`;

yml = yml.replace(buildStep, functionsStep);
fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);
