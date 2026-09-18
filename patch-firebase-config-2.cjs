const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
config.recaptchaSiteKey = "";
config.firestoreDatabaseId = "";
fs.writeFileSync('firebase-applet-config.json', JSON.stringify(config, null, 2));
