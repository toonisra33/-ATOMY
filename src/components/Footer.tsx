import React from 'react';
import { SponsorProfile } from '../types';
import { ShieldCheck, Share2, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  sponsor: SponsorProfile;
  onOpenAffiliateModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ sponsor, onOpenAffiliateModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 sm:py-12 pb-28 sm:pb-24 md:pb-12 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg mb-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm shrink-0">
                A
              </span>
              <span className="tracking-tight">ATOMY SATELLITE NETWORK</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md text-xs sm:text-sm text-pretty">
              ระบบเว็บพ่วงและกรวยสปอนเซอร์ผู้มุ่งหวัง (Affiliate & Satellite Funnel) สำหรับส่งต่อทราฟฟิกและผู้สนใจเข้าสู่ธุรกิจ อะโทมี่ (Atomy) ผ่านสื่อวิดีโอบรรยาย 15 นาที และช่องทางติดต่อ LINE Official
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={onOpenAffiliateModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>คัดลอก / สร้างเว็บพ่วงสำหรับสายงานคุณ</span>
              </button>
            </div>
          </div>

          {/* Sponsor Credentials */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-3 text-sm">
              ข้อมูลสปอนเซอร์ผู้ดูแลหน้านี้
            </h4>
            <div className="space-y-1.5 text-slate-300 text-xs">
              <p><strong className="text-white">ชื่อ:</strong> {sponsor.sponsorName}</p>
              <p><strong className="text-white">รหัสสปอนเซอร์:</strong> {sponsor.sponsorId}</p>
              <p><strong className="text-white">ตำแหน่ง:</strong> {sponsor.sponsorPosition}</p>
              <p><strong className="text-white">ทีม:</strong> {sponsor.teamName}</p>
              <p><strong className="text-white">LINE ID:</strong> {sponsor.lineId}</p>
            </div>
          </div>

          {/* Official Resources */}
          <div className="md:col-span-4">
            <h4 className="text-white font-semibold mb-3 text-sm">
              ลิงก์ภายนอกสู่ระบบหลัก Atomy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.atomy.com/th/Home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>เว็บไซต์หลัก Atomy Thailand</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ch.atomy.com/th"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Channel Atomy (คลังความรู้ & วิดีโอ)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.atomy.com/th/Home/Product/MallMain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5 transition-colors py-0.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Atomy Shopping Mall</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="leading-relaxed text-pretty">
            © {new Date().getFullYear()} Atomy Satellite Network • จัดทำโดยนักธุรกิจอิสระอะโทมี่เพื่อประโยชน์ในการขยายสายงานและแนะนำผู้มุ่งหวัง
          </p>
          <p className="flex items-center justify-center gap-1 shrink-0">
            <span>ส่งเสริมการทำธุรกิจอย่างมีคุณธรรมและโปร่งใส</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </p>
        </div>
      </div>
    </footer>
  );
};
