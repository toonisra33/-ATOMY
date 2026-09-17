const fs = require('fs');
let json = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));

// Revert rewrites back to index.html since functions can't be deployed
json.hosting.rewrites = [
  {
    "source": "**",
    "destination": "/index.html"
  }
];

fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));
