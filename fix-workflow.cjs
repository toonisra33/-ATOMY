const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');
yml = yml.replace('            - run: npm run build', '      - run: npm run build');
fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);
