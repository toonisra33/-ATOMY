const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// 1. Add confirmPassword state
code = code.replace(
  "const [password, setPassword] = useState('');",
  "const [password, setPassword] = useState('');\n  const [confirmPassword, setConfirmPassword] = useState('');"
);

// 2. Add validation for confirmPassword in handleApplyAndPreview
code = code.replace(
  "if (!ownerUid && email && password) {",
  "if (!ownerUid && email && password) {\n        if (password !== confirmPassword) {\n          setAuthError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');\n          setIsSaving(false);\n          return;\n        }"
);

// 3. Initialize formData properly. If !ownerUid, clear specific fields.
const initialStateReplacement = `const [formData, setFormData] = useState<SponsorProfile>({ 
    ...currentSponsor,
    sponsorId: ownerUid ? currentSponsor.sponsorId : '',
    sponsorName: ownerUid ? currentSponsor.sponsorName : '',
    lineId: ownerUid ? currentSponsor.lineId : '',
    lineUrl: ownerUid ? currentSponsor.lineUrl : '',
    phoneNumber: ownerUid ? currentSponsor.phoneNumber : '',
    avatarUrl: ownerUid ? currentSponsor.avatarUrl : ''
  });`;
code = code.replace(
  "const [formData, setFormData] = useState<SponsorProfile>({ ...currentSponsor });",
  initialStateReplacement
);

// 4. Update Account Creation UI to include confirmPassword
const accountCreationUIOld = `                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      ตั้งรหัสผ่าน (Password) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>`;

const accountCreationUINew = `                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      ตั้งรหัสผ่าน (Password) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      ยืนยันรหัสผ่าน (Confirm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>`;

code = code.replace(accountCreationUIOld, accountCreationUINew);
// Note: It might need to adjust grid to grid-cols-1 sm:grid-cols-2 if it's currently something else.
// Currently it is `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">`
// Wait, we had Email and Password in 2 cols. If we add Confirm Password, it will be 3 items. Let's make Email span 2 cols or keep 2 cols and it wraps to next line.
// Wrapping is fine.

// 5. Remove Pixel Block
// Let's find the pixel block
const pixelBlockRegex = /\{ownerUid && \(\s*<div className="sm:col-span-2 bg-gradient-to-r[\s\S]*?<\/div>\s*\)\}/;
if (pixelBlockRegex.test(code)) {
    code = code.replace(pixelBlockRegex, '');
    console.log("Removed Pixel Block");
} else {
    console.log("Could not find Pixel Block via regex");
}

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
