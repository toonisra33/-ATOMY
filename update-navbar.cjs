const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(
  'isAdmin={session?.isAdmin ?? false}',
  'isAdmin={session?.isAdmin ?? false}\n        isOwner={session?.uid === sponsor.ownerUid}'
);
fs.writeFileSync('src/App.tsx', appCode);

let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
// Update interface
navCode = navCode.replace(
  'isAdmin: boolean;',
  'isAdmin: boolean;\n  isOwner?: boolean;'
);
// Update destructured props
navCode = navCode.replace(
  'isAdmin,',
  'isAdmin,\n  isOwner,'
);

// Update condition
navCode = navCode.replace(
  "{(isAdmin || (isAuthenticated && accountEmail && sponsor.ownerUid && sponsor.ownerUid !== '')) && onOpenPixelModal && (",
  "{(isAdmin || isOwner) && onOpenPixelModal && ("
);

// If the previous replace failed because of exact string, let's just do a regex replace
navCode = navCode.replace(
  /\{\s*\(\s*isAdmin\s*\|\|.*?&&\s*onOpenPixelModal\s*&&\s*\(/s,
  "{(isAdmin || isOwner) && onOpenPixelModal && ("
);

fs.writeFileSync('src/components/Navbar.tsx', navCode);
