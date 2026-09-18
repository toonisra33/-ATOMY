const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

const formBlock = `            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล หรือชื่อเรียกในสายงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sponsorName}
                onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                placeholder="เช่น อิศราวัฒน์ ปวินทกานต์ (คุณทูน)"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LINE Official ID หรือ LINE ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lineId}
                onChange={(e) => setFormData({ ...formData, lineId: e.target.value, lineUrl: \`https://lin.ee/\${e.target.value.replace('@', '')}\` })}
                placeholder="เช่น @atomyth"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ลิงก์ LINE (Auto Link)
              </label>
              <input
                type="url"
                value={formData.lineUrl}
                onChange={(e) => setFormData({ ...formData, lineUrl: e.target.value })}
                placeholder="https://lin.ee/..."
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อทีม / สายงาน (Team Name)
              </label>
              <input
                type="text"
                value={formData.teamName || ''}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                placeholder="เช่น Atomy Thailand Team"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="เช่น 093-XXX-XXXX"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง
              </label>
              <input
                type="text"
                value={formData.sponsorPosition || ''}
                onChange={(e) => setFormData({ ...formData, sponsorPosition: e.target.value })}
                placeholder="เช่น ที่ปรึกษาธุรกิจ"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>`;

code = code.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">[\s\S]*?{([^]*?)Account Creation Block/, '<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">\n' + formBlock + '\n            {/* Account Creation Block');
fs.writeFileSync('src/components/AffiliateModal.tsx', code);
