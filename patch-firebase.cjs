const fs = require('fs');
let json = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));

json.hosting.rewrites = [
  {
    "source": "**",
    "function": "ssr"
  }
];

fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));
