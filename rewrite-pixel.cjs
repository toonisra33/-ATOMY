const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// Completely remove the faulty wrapper
code = code.replace(
  "{ownerUid && (\n          {/* ตั้งค่า Pixel สำหรับยิงแอด */}",
  "{/* ตั้งค่า Pixel สำหรับยิงแอด */}"
);

code = code.replace(
  `          </div>
          )}

          {/* Generated Satellite URL Preview Box */}`,
  `          </div>

          {/* Generated Satellite URL Preview Box */}`
);

// Now wrap it correctly
const pixelBlockStart = `<div className="sm:col-span-2 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl sm:rounded-2xl border border-purple-200/50 p-1">`;

code = code.replace(
  pixelBlockStart,
  `{ownerUid && (\n            ${pixelBlockStart}`
);

const pixelBlockEnd = `                </div>
              </div>
            )}
          </div>`;

code = code.replace(
  pixelBlockEnd,
  `${pixelBlockEnd}\n          )}`
);


fs.writeFileSync('src/components/AffiliateModal.tsx', code);
