const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('functions/package.json', 'utf-8'));
pkg.engines = { node: "20" };
pkg.main = "index.js";
fs.writeFileSync('functions/package.json', JSON.stringify(pkg, null, 2));
