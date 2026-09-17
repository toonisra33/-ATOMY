const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');

const prepareFunctionsStep = `      - name: Prepare Functions
        run: |
          cd functions
          npm install
          cp ../dist/index.html ./index.html`;

yml = yml.replace(prepareFunctionsStep, '');
yml = yml.replace(/\n\s*\n/g, '\n');

fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);
