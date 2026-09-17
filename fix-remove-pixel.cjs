const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

const pixelStart = `{ownerUid && (
            <div className="sm:col-span-2 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl sm:rounded-2xl border border-purple-200/50 p-1">`;

const pixelEndStr = `                </div>
              </div>
            )}
          </div>
          )}`;

const startIdx = code.indexOf(pixelStart);
if (startIdx !== -1) {
    const endIdx = code.indexOf(pixelEndStr) + pixelEndStr.length;
    code = code.substring(0, startIdx) + code.substring(endIdx);
    fs.writeFileSync('src/components/AffiliateModal.tsx', code);
    console.log("Removed pixel manually");
} else {
    console.log("Could not find start sequence");
}

