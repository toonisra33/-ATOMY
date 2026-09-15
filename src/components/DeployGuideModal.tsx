import React, { useState } from 'react';
import { X, Cloud, Terminal, Copy, Check, ExternalLink, Download, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              วิธีอัพเดตโค้ดขึ้น Firebase Hosting (localhub-atomy)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              นำไฟล์ที่สร้างเสร็จแล้วขึ้นเว็บไซต์จริง ให้อัพเดตทันที
            </p>
          </div>
        </div>

        {/* Notification Box */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs sm:text-sm leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">สาเหตุที่หน้า localhub-atomy.web.app ยังเป็นหน้าเดิม:</span>
            <p className="mt-1 text-amber-800">
              เนื่องจากเซิร์ฟเวอร์ Cloud Run ปัจจุบันไม่มีสิทธิ์เข้าถึงบัญชี Firebase Hosting ของท่านโดยตรง (ต้องล็อกอินผ่านเครื่องคอมพิวเตอร์ของคุณที่มีสิทธิ์) 
              ท่านสามารถอัพเดตได้ง่ายๆ ใน 1 นาทีตาม 2 วิธีด้านล่างนี้ครับ:
            </p>
          </div>
        </div>

        {/* Methods */}
        <div className="mt-6 space-y-4">
          
          {/* Option A: Fast ZIP Download */}
          <div className="p-5 rounded-2xl border-2 border-blue-500/40 bg-blue-50/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100 px-2.5 py-0.5 rounded-full">
                วิธีที่ 1 (ง่ายที่สุด)
              </span>
              <span className="text-xs text-slate-500 font-medium">ใช้ไฟล์ที่ Build สำเร็จแล้ว</span>
            </div>

            <h4 className="text-base font-bold text-slate-900">
              ดาวน์โหลดโฟลเดอร์ dist (พร้อมใช้งาน) แล้ว Deploy
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              เราได้ทำการรันคำสั่ง <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">npm run build</code> ให้เรียบร้อยแล้วในแพ็กเกจนี้
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="/dist.zip"
                download="dist.zip"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด dist.zip (ไฟล์เว็บเวอร์ชันล่าสุด)</span>
              </a>
            </div>

            <div className="mt-4 bg-slate-900 rounded-xl p-3.5 text-xs font-mono text-slate-200 space-y-2">
              <p className="text-slate-400 text-[11px]">คำสั่งสำหรับอัพโหลดขึ้น Firebase (รันในโฟลเดอร์ที่แตก zip):</p>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg">
                <code>firebase deploy --only hosting</code>
                <button
                  onClick={() => copyCommand('firebase deploy --only hosting', 1)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedStep === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Option B: Terminal Command */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-200 px-2.5 py-0.5 rounded-full">
              วิธีที่ 2 (ผ่านเครื่องคอมพิวเตอร์ของคุณ)
            </span>

            <h4 className="text-sm font-bold text-slate-900 mt-2">
              พิมพ์คำสั่งใน VS Code หรือ Terminal ของเครื่องคุณ
            </h4>

            <div className="mt-3 space-y-2">
              <div className="bg-slate-900 rounded-xl p-2.5 text-xs font-mono text-slate-200 flex items-center justify-between">
                <span>1. npm run build</span>
                <button
                  onClick={() => copyCommand('npm run build', 2)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedStep === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-2.5 text-xs font-mono text-slate-200 flex items-center justify-between">
                <span>2. firebase deploy --only hosting</span>
                <button
                  onClick={() => copyCommand('firebase deploy --only hosting', 3)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedStep === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>หน้าเว็บ AI Studio ล่าสุดพร้อมเปิดดูได้ตลอดเวลา</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
