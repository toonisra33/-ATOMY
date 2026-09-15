import React, { useState } from 'react';
import { SponsorProfile } from '../types';
import { X, Copy, Check, ExternalLink, QrCode, Share2, Sparkles, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSponsor: SponsorProfile;
  onApplySponsor: (newSponsor: SponsorProfile) => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({
  isOpen,
  onClose,
  currentSponsor,
  onApplySponsor,
}) => {
  const [formData, setFormData] = useState<SponsorProfile>({ ...currentSponsor });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  if (!isOpen) return null;

  // Build the generated affiliate URL based on window.location
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://example.com';
  const queryParams = new URLSearchParams({
    ref: formData.sponsorId.trim() || 'ATOMY888',
    name: formData.sponsorName.trim() || 'ที่ปรึกษาอะโทมี่',
    pos: formData.sponsorPosition.trim() || 'สมาชิกนักธุรกิจ',
    line: formData.lineId.trim() || '@atomy',
    lineUrl: formData.lineUrl.trim() || `https://line.me/ti/p/~${formData.lineId.trim()}`,
    phone: formData.phoneNumber.trim() || '',
    team: formData.teamName.trim() || 'Atomy Thailand Team',
  });

  const generatedAffiliateUrl = `${baseUrl}?${queryParams.toString()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatedAffiliateUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleApplyAndPreview = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySponsor(formData);
    // Push state to browser URL without reload
    window.history.pushState({}, '', generatedAffiliateUrl);
    onClose();
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

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              สร้างเว็บพ่วงของคุณ (Satellite & Affiliate Link)
            </h3>
            <p className="text-xs text-slate-500">
              ระบบขยายเครือข่ายสำหรับนักธุรกิจ Atomy: ใส่ข้อมูลเพื่อรับลิงก์เว็บพ่วงในชื่อของคุณ
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleApplyAndPreview} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสสปอนเซอร์ของคุณ (Sponsor ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sponsorId}
                onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                placeholder="เช่น TH3892011"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล หรือชื่อเรียกในสายงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sponsorName}
                onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                placeholder="เช่น คุณสมชาย อะโทมี่ลีดเดอร์"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    lineId: val,
                    lineUrl: val.startsWith('http') ? val : `https://line.me/ti/p/~${val}`,
                  });
                }}
                placeholder="เช่น @atomyteam หรือ somchai_atomy"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
                placeholder="https://line.me/ti/p/~..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="เช่น 089-123-4567"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง / สายงาน
              </label>
              <input
                type="text"
                value={formData.sponsorPosition}
                onChange={(e) => setFormData({ ...formData, sponsorPosition: e.target.value })}
                placeholder="เช่น Sales Master / ที่ปรึกษาธุรกิจ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

          </div>

          {/* Generated Satellite URL Preview Box */}
          <div className="mt-5 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>ลิงก์เว็บพ่วงส่วนตัวของคุณ (พร้อมใช้งาน):</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md cursor-pointer border border-slate-700"
              >
                <QrCode className="w-3 h-3" />
                <span>{showQr ? 'ซ่อน QR' : 'ดู QR Code'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-sky-200 break-all select-all">
              {generatedAffiliateUrl}
            </div>

            {/* QR Code Expansion */}
            {showQr && (
              <div className="mt-4 p-4 bg-white rounded-xl text-center inline-block w-full">
                <img
                  src={qrCodeUrl}
                  alt="Generated Satellite QR"
                  className="w-40 h-40 mx-auto rounded-lg"
                />
                <p className="text-[11px] text-slate-600 mt-2 font-sans font-medium">
                  สแกนหรือบันทึกภาพ QR Code นี้ไปใส่ในป้ายประชาสัมพันธ์ / นามบัตร ได้ทันที
                </p>
              </div>
            )}

            {/* Action Bar inside Box */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-copy-affiliate-url"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์เว็บพ่วงนี้'}</span>
              </button>
            </div>
          </div>

          {/* Strategy Tip */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>แนวทางใช้งานเว็บพ่วง (Satellite Strategy):</strong> นำลิงก์นี้ไปใส่ใน Bio TikTok, โพสต์ลง Facebook, ส่งในแชตให้ผู้สนใจ หรือนำไปยิงโฆษณา เมื่อผู้มุ่งหวังดูวิดีโอ 15 นาทีจบ จะมีปุ่มทักเข้า LINE Official ของคุณโดยตรงพร้อมระบุรหัสสปอนเซอร์ของคุณ!
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>บันทึก & ทดลองดูหน้าเว็บพ่วงนี้</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
