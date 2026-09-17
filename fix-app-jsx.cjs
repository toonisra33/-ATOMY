const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "{(session?.isAdmin || (session?.uid && session.uid === sponsor.ownerUid)) && (\n      {/* Floating Pixel & Tracking Quick Badge */}\n            <button",
  "{(session?.isAdmin || (session?.uid && session.uid === sponsor.ownerUid)) && (\n            <button"
);

fs.writeFileSync('src/App.tsx', code);
