const fs = require('fs');
let json = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));

// Delete the functions block to ensure clean static hosting deployment
delete json.functions;

fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));
