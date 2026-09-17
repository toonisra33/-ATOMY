const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');

const oldStep = `      - name: Prepare Functions
        run: |
          cd functions
          npm install
          cp ../dist/index.html ./index.html`;

const restoreStep = `      - name: Prepare Functions
        run: |
          cd functions
          npm install
          cp ../dist/index.html ./index.html
      - name: Deploy Functions
        run: npx firebase-tools deploy --only functions --project localhub-69fbe --force`;

yml = yml.replace(oldStep, restoreStep);
fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);
