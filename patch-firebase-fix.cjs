const fs = require('fs');
let json = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));

// Revert the rewrite rule back to index.html so the site doesn't break
// when it tries to call a function that didn't deploy successfully.
json.hosting.rewrites = [
  {
    "source": "**",
    "destination": "/index.html"
  }
];

fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));
