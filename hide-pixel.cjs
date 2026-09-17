const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// The pixel block is currently wrapped in:
// {showPixelSettings && (
// Let's modify the condition so that it ONLY shows if the user is the owner, or if they just generated their own link (which logs them in).
// Wait, the easiest way to hide it from new visitors is to check if `ownerUid` exists. If not, they are creating a new link.
// However, the component already checks `!ownerUid` to show the email/password fields.
// So we can wrap the ENTIRE pixel container in `{ownerUid && (`

code = code.replace(
  `{/* ตั้งค่า Pixel สำหรับยิงแอด */}`,
  `{ownerUid && (
          {/* ตั้งค่า Pixel สำหรับยิงแอด */}`
);

// find the closing div of the pixel settings block. 
// It ends right before {/* Generated Satellite URL Preview Box */}
code = code.replace(
  `          {/* Generated Satellite URL Preview Box */}`,
  `          )}
          {/* Generated Satellite URL Preview Box */}`
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
