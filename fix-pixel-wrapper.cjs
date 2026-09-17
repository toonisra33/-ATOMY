const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// find the start of the pixel block
const pixelBlockStart = `<div className="sm:col-span-2 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl sm:rounded-2xl border border-purple-200/50 p-1">`;
if (code.includes(pixelBlockStart)) {
  console.log("Found pixel block start");
}

code = code.replace(pixelBlockStart, `{ownerUid && (\n            ${pixelBlockStart}`);
code = code.replace(
  `}
          </div>

          {/* Generated Satellite URL Preview Box */}`,
  `}
          </div>
          )}

          {/* Generated Satellite URL Preview Box */}`
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
