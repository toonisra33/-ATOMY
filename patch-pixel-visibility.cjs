const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the floating pixel badge and wrap it in a condition
const floatingBadgeStart = "{/* Floating Pixel & Tracking Quick Badge */}";
const floatingBadgeEnd = "</button>";

const badgeRegex = new RegExp(
  floatingBadgeStart.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '[\\s\\S]*?' + floatingBadgeEnd.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
);

const match = appCode.match(badgeRegex);

if (match) {
  const originalBadge = match[0];
  const conditionalBadge = `{(session?.isAdmin || (session?.uid && session.uid === sponsor.ownerUid)) && (\n      ${originalBadge.replace(/\n/g, '\n      ')}\n      )}`;
  
  appCode = appCode.replace(originalBadge, conditionalBadge);
  fs.writeFileSync('src/App.tsx', appCode);
} else {
  console.log('Could not find floating badge in App.tsx');
}

// Patch Navbar.tsx
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
// Currently it checks: {isAuthenticated && onOpenPixelModal && ( ... )}
// Let's change it to check if they are owner or admin
navCode = navCode.replace(
  "{isAuthenticated && onOpenPixelModal && (",
  "{(isAdmin || (isAuthenticated && accountEmail && sponsor.ownerUid && sponsor.ownerUid !== '')) && onOpenPixelModal && (" // wait, I don't have uid in Navbar, I only have accountEmail.
);
// Let's pass session.uid to Navbar if needed, or just change Navbar.tsx
