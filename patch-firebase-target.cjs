const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/firebase-hosting-merge.yml', 'utf-8');

// The new site target is "sponsor-atomy"
yml = yml.replace(/target: atomy/g, 'target: sponsor-atomy');

fs.writeFileSync('.github/workflows/firebase-hosting-merge.yml', yml);

let json = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));
if (json.hosting && Array.isArray(json.hosting)) {
  // If it's already an array, update the target
  json.hosting.forEach(h => {
    if (h.target === 'atomy') {
      h.target = 'sponsor-atomy';
    }
  });
} else if (json.hosting) {
  // If it's an object, update the target
  json.hosting.target = 'sponsor-atomy';
}
fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));

