const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// I will remove the broken ")}", let's find it.
const faultyLines = `
          </div>
          )}

          {/* Generated Satellite URL Preview Box */}`;
          
if (code.includes(faultyLines)) {
  code = code.replace(faultyLines, `
          </div>

          {/* Generated Satellite URL Preview Box */}`);
} else if (code.includes('          )}\n          {/* Generated Satellite URL Preview Box */}')) {
  code = code.replace('          )}\n          {/* Generated Satellite URL Preview Box */}', '          {/* Generated Satellite URL Preview Box */}');
}

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
