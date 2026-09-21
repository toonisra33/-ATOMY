import React from 'react';
import { SponsorProfile } from '../types';
import { ShieldCheck, Share2 } from 'lucide-react';

interface FooterProps {
  sponsor: SponsorProfile;
  onOpenAffiliateModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ sponsor, onOpenAffiliateModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 sm:py-14 pb-28 sm:pb-24 md:pb-14 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-7">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg leading-tight break-words mb-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                A
              </span>
              <span className="tracking-tight">ATOMY SATELLITE NETWORK</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm text-pretty mt-2 max-w-xl">
              ระบบเว็บพ่วงและกรวยสปอนเซอร์ผู้มุ่งหวัง (Affiliate & Satellite Funnel) สำหรับส่งต่อทราฟฟิกและผู้สนใจเข้าสู่ธุรกิจ อะโทมี่ (Atomy) ผ่านสื่อวิดีโอบรรยาย 20 นาที และช่องทางติดต่อ LINE Official
            </p>
            {onOpenAffiliateModal && (
              <div className="mt-4">
                <button
                  onClick={onOpenAffiliateModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>คัดลอก / สร้างเว็บพ่วงสำหรับสายงานคุณ</span>
                </button>
              </div>
            )}
          </div>

          {/* Sponsor Credentials */}
          <div className="md:col-span-5 bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
            <h4 className="text-white font-semibold mb-3 text-sm sm:text-base leading-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ข้อมูลสปอนเซอร์ผู้ดูแลหน้านี้</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300 text-xs sm:text-sm break-words">
              <p><strong className="text-white">ชื่อ:</strong> {sponsor.sponsorName}</p>
              <p><strong className="text-white">ตำแหน่ง:</strong> {sponsor.sponsorPosition}</p>
              <p><strong className="text-white">ทีม:</strong> {sponsor.teamName}</p>
              <p><strong className="text-white">LINE ID:</strong> {sponsor.lineId}</p>
            </div>
          </div>

        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="leading-relaxed text-pretty">
            © {new Date().getFullYear()} Atomy Satellite Network • จัดทำโดยนักธุรกิจอิสระอะโทมี่เพื่อประโยชน์ในการขยายสายงานและแนะนำผู้มุ่งหวัง
          </p>
          <p className="flex items-center justify-center gap-3 shrink-0">
            <a href="/privacy" className="text-blue-400 hover:underline">นโยบายความเป็นส่วนตัว</a>
            <span>ส่งเสริมการทำธุรกิจอย่างมีคุณธรรมและโปร่งใส</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </p>
        </div>
      </div>
    </footer>
  );
};
