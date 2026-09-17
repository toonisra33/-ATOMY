const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

code = code.replace(
  `          </div>

          )}
          {/* Generated Satellite URL Preview Box */}`,
  `          </div>
          )}

          {/* Generated Satellite URL Preview Box */}`
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
