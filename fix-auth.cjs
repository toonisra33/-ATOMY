const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');

code = code.replace(
  "import {",
  "import {\n  createUserWithEmailAndPassword,"
);

fs.writeFileSync('src/lib/auth.ts', code);
