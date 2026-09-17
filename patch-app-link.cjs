const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update lucide-react imports
code = code.replace(
  'import { Target } from "lucide-react";',
  'import { Target, Link as LinkIcon, QrCode, Copy, Check } from "lucide-react";'
);

// We need to add state for copiedLink and showQr
code = code.replace(
  'const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);',
  `const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);`
);

// We need to add handleCopyLink
const generatedUrlStr = `const generatedAffiliateUrl = typeof window !== 'undefined' 
    ? \`\${window.location.origin}\${window.location.pathname}?ref=\${sponsor.sponsorId}\`
    : '';
  const qrCodeUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=\${encodeURIComponent(generatedAffiliateUrl)}\`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };
`;

code = code.replace(
  '// Handle ?ref= query param logic for dynamic routing',
  generatedUrlStr + '\n  // Handle ?ref= query param logic for dynamic routing'
);

// We need to insert the affiliate link box right above the footer
const linkBoxUI = `
      {/* Affiliate Link Box for Owner */}
      {(session?.isAdmin || (session?.uid && session.uid === sponsor.ownerUid)) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-4 sm:p-6 bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">ลิงก์เว็บพ่วงส่วนตัวของคุณ</h3>
                  <p className="text-xs text-sky-400 font-medium">นำลิงก์นี้ไปใช้โปรโมทได้เลย</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQr ? 'ซ่อน QR Code' : 'แสดง QR Code'}</span>
              </button>
            </div>

            <div className="relative z-10 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 font-mono text-[11px] sm:text-sm text-sky-200 break-all select-all flex items-center justify-between gap-4">
              <span className="flex-1 truncate">{generatedAffiliateUrl}</span>
            </div>

            <div className="relative z-10 mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-copy-affiliate-url-main"
                onClick={handleCopyLink}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์เว็บพ่วงนี้'}</span>
              </button>
            </div>

            {showQr && (
              <div className="relative z-10 mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <img
                    src={qrCodeUrl}
                    alt="Generated Satellite QR"
                    className="w-40 h-40 object-contain"
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-4 font-sans font-medium text-pretty max-w-sm">
                  สแกนหรือบันทึกภาพ QR Code นี้ไปใส่ในป้ายประชาสัมพันธ์ หรือโพสต์ลง Social Media ได้ทันที
                </p>
              </div>
            )}
          </div>
        </div>
      )}`;

code = code.replace(
  '{/* Footer */}',
  linkBoxUI + '\n\n      {/* Footer */}'
);

fs.writeFileSync('src/App.tsx', code);
