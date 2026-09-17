const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');

// We remove the Deploy Functions step
const functionsStep = `      - name: Prepare Functions
        run: |
          cd functions
          npm install
          cp ../dist/index.html ./index.html
      - name: Deploy Functions
        run: npx firebase-tools deploy --only functions --project localhub-69fbe --force`;

const newFunctionsStep = `      - name: Prepare Functions
        run: |
          cd functions
          npm install
          cp ../dist/index.html ./index.html`;

yml = yml.replace(functionsStep, newFunctionsStep);

fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);
