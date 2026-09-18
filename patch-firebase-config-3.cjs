const fs = require('fs');
let code = fs.readFileSync('firebase-applet-config.json', 'utf-8');
const config = JSON.parse(code);
config.firestoreDatabaseId = "";
fs.writeFileSync('firebase-applet-config.json', JSON.stringify(config, null, 2));
