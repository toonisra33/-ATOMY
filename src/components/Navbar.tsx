import React from 'react';
import { SponsorProfile } from '../types';
import { Share2, MessageCircle, ExternalLink, ShieldCheck, Sparkles, CloudUpload } from 'lucide-react';

interface NavbarProps {
  sponsor: SponsorProfile;
  onOpenAffiliateModal: () => void;
  onOpenDeployGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sponsor, onOpenAffiliateModal, onOpenDeployGuide }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Affiliate Notification Ribbon */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-yellow-300" /> เว็บลูกข่ายพันธมิตร
        </span>
        <span className="hidden sm:inline">คุณกำลังเข้าชมเว็บพ่วงเครือข่ายของ:</span>
        <span className="font-bold underline decoration-sky-300">{sponsor.sponsorName}</span>
        <span className="bg-blue-900/60 px-2 py-0.5 rounded text-[11px] font-mono">
          รหัสสปอนเซอร์: {sponsor.sponsorId}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Satellite Tag */}
          <div className="flex items-center gap-3">
            <a href="#hero" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  ATOMY <span className="text-sky-600 font-medium text-sm">GLOBAL</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  SATELLITE FUNNEL • ระบบสปอนเซอร์
                </span>
              </div>
            </a>
          </div>

          {/* Center Navigation Links (Anchor Links) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#video-15min" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              วิดีโอ 15 นาที
            </a>
            <a href="#highlights" className="hover:text-blue-600 transition-colors">
              จุดเด่นธุรกิจ
            </a>
            <a href="#atomy-portal" className="hover:text-blue-600 transition-colors">
              เว็บหลัก Atomy
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              คำถามที่พบบ่อย
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Deploy Firebase Guide Button */}
            {onOpenDeployGuide && (
              <button
                id="btn-deploy-guide"
                onClick={onOpenDeployGuide}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer shadow-2xs"
                title="อัพเดตโค้ดขึ้น Firebase Hosting (localhub-atomy.web.app)"
              >
                <CloudUpload className="w-3.5 h-3.5 text-amber-600" />
                <span>อัพเดต Firebase</span>
              </button>
            )}

            {/* Distributor Affiliate Generator Button */}
            <button
              id="btn-replicate-affiliate"
              onClick={onOpenAffiliateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300/80 cursor-pointer shadow-2xs"
              title="สำหรับสมาชิกทีมงาน: สร้างลิงก์เว็บพ่วงในชื่อของคุณ"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">สร้างเว็บพ่วงของคุณ</span>
              <span className="sm:hidden">สร้างลิงก์</span>
            </button>

            {/* Direct Line Official CTA */}
            <a
              id="nav-btn-line-cta"
              href={sponsor.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-lg transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>แอด LINE สปอนเซอร์</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
