const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(/where,\n  where\('sponsorId'/g, "where('sponsorId'");
code = code.replace(/where,\n  where\('phoneNumber'/g, "where('phoneNumber'");
code = code.replace(/where,\n  where\('ownerUid'/g, "where('ownerUid'");

fs.writeFileSync('src/lib/firebase.ts', code);
