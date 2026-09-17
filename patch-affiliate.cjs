const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// 1. Import registerWithEmail
code = code.replace(
  "import { setupAllPixels } from '../lib/pixel';",
  "import { setupAllPixels } from '../lib/pixel';\nimport { registerWithEmail } from '../lib/auth';"
);

// 2. Add email, password, and error states inside AffiliateModal
code = code.replace(
  "const [isSaving, setIsSaving] = useState<boolean>(false);",
  "const [isSaving, setIsSaving] = useState<boolean>(false);\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [authError, setAuthError] = useState('');"
);

// 3. Update handleApplyAndPreview to handle registration
const newHandleApply = `
  const handleApplyAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAuthError('');
    try {
      let finalOwnerUid = ownerUid;
      
      // If user is not logged in, but provided email/password, register them first
      if (!ownerUid && email && password) {
        try {
          const session = await registerWithEmail(email, password);
          finalOwnerUid = session.uid;
        } catch (authErr: any) {
          setIsSaving(false);
          setAuthError(authErr.message?.includes('email-already') ? 'อีเมลนี้มีในระบบแล้ว กรุณาเข้าสู่ระบบแทน' : 'ไม่สามารถสร้างบัญชีได้ (รหัสผ่านต้อง 6 ตัวขึ้นไป)');
          return;
        }
      } else if (!ownerUid) {
          setIsSaving(false);
          setAuthError('กรุณาสร้างบัญชี (อีเมลและรหัสผ่าน) เพื่อใช้จัดการหน้าเว็บและรายชื่อของคุณ');
          return;
      }

      // 1. Update React state in parent App
      onApplySponsor(formData);

      // 2. Persist to localStorage permanently so page refreshes retain user's photo
      try {
        localStorage.setItem('atomy_custom_sponsor', JSON.stringify(formData));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      // 3. Push state to browser URL without reload (Clean URL)
      window.history.pushState({}, '', generatedAffiliateUrl);

      // 4. Initialize & fire pixels immediately
      setupAllPixels({
        fbPixelId: formData.fbPixelId,
        tiktokPixelId: formData.tiktokPixelId,
        googleTagId: formData.googleTagId,
      });

      // 5. Save to Firebase Firestore
      await saveSponsorProfile(formData, finalOwnerUid);
      
    } catch (err) {
      console.warn('Sync error:', err);
      setAuthError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
      if (!authError) {
         onClose();
      }
    }
  };
`;

code = code.replace(/const handleApplyAndPreview = async[\s\S]*?onClose\(\);\n    }\n  };/, newHandleApply);

// 4. Add the Account Creation UI section inside the form if !ownerUid
const accountCreationUI = `
            {/* Account Creation Block */}
            {!ownerUid && (
              <div className="col-span-1 sm:col-span-2 mt-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">สร้างบัญชีสำหรับจัดการเว็บไซต์และรายชื่อ Leads</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      อีเมล (Email) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="อีเมลของคุณ"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                </div>
                {authError && <p className="mt-2 text-xs font-semibold text-red-500">{authError}</p>}
              </div>
            )}
`;

// Insert the Account Creation UI right after the "Team Name" input or before the photo section
code = code.replace(
  "{/* รูปภาพของทีม หรือสปอนเซอร์ */}",
  accountCreationUI + "\n            {/* รูปภาพของทีม หรือสปอนเซอร์ */}"
);

// We need to handle the finally block correctly in handleApplyAndPreview. I replaced it but wait, I used `if (!authError)` but authError state is updated asynchronously. It's safer to close immediately if successful. I'll patch handleApplyAndPreview again to ensure correctness.

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
