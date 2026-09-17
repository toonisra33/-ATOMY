const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

const accountCreationUI = `
            {/* Account Creation Block */}
            {!ownerUid && (
              <div className="sm:col-span-2 mt-2 bg-blue-50/50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">สร้างบัญชีสำหรับจัดการเว็บไซต์และรายชื่อ Leads</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
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
                </div>
                {authError && <p className="mt-2 text-[11px] font-semibold text-red-500">{authError}</p>}
              </div>
            )}
`;

code = code.replace(
  "{/* Avatar / Real Photo Upload */}",
  accountCreationUI + "\n            {/* Avatar / Real Photo Upload */}"
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
