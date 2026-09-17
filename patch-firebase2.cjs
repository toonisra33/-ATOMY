const fs = require('fs');
let json = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));

json.functions = {
  "source": "functions",
  "runtime": "nodejs20"
};

fs.writeFileSync('firebase.json', JSON.stringify(json, null, 2));
