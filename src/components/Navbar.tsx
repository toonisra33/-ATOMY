import React from 'react';
import { SponsorProfile } from '../types';
import {
  Share2,
  MessageCircle,
  Sparkles,
  CloudUpload,
  Target,
  Users,
  LogIn,
  LogOut,
  ExternalLink,
  GraduationCap,
  Mail,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  sponsor: SponsorProfile;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner?: boolean;
  accountEmail?: string;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateAdmin?: () => void;
  onOpenLineModal?: () => void;
  onOpenAffiliateModal?: () => void;
  onOpenDeployGuide?: () => void;
  onOpenPixelModal?: () => void;
  onOpenLeadsModal?: () => void;
  onOpenEmailHub?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sponsor,
  isAuthenticated,
  isAdmin,
  isOwner,
  accountEmail,
  onOpenLogin,
  onLogout,
  onNavigateAdmin,
  onOpenLineModal,
  onOpenAffiliateModal,
  onOpenDeployGuide,
  onOpenPixelModal,
  onOpenLeadsModal,
  onOpenEmailHub,
}) => {
  const hasPixel = Boolean(sponsor.fbPixelId || sponsor.tiktokPixelId || sponsor.googleTagId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Affiliate Notification Ribbon */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 text-white text-xs sm:text-sm py-1.5 px-3 sm:px-4 text-center flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium shadow-inner">
        <span className="inline-flex items-center gap-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
          <span>เว็บพ่วงสปอนเซอร์</span>
        </span>
        <span className="text-white/90 whitespace-nowrap text-xs sm:text-sm">คุณกำลังเข้าชมเว็บของ:</span>
        <span className="font-bold underline decoration-sky-300 text-white whitespace-nowrap text-xs sm:text-sm">
          {sponsor.sponsorName}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Satellite Tag */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <a href="#hero" className="flex items-center gap-2 group min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                A
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                  SPONSOR <span className="text-sky-600 font-medium text-xs sm:text-sm">ATOMY</span>
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide">
                  ระบบโปรโมท & ขยายสายงาน
                </span>
              </div>
            </a>
          </div>

          {/* Center Navigation Links (Anchor Links) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#video-15min" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              วิดีโอ 20 นาที
            </a>
            <a href="#highlights" className="hover:text-blue-600 transition-colors">
              จุดเด่นธุรกิจ
            </a>
            <a href="#gallery-album" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <span>อัลบั้มภาพ</span>
              <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full font-bold">New</span>
            </a>
            <a href="#line-official" className="hover:text-blue-600 transition-colors">
              ติดต่อ / ฝากข้อมูล
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              คำถามที่พบบ่อย
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 7-Day Training Button (Accessible for everyone: prospects and members) */}
            <a
              id="nav-btn-training-top"
              href="/day1"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer shadow-2xs"
              title="เข้าสู่ระบบบทเรียน 7 วัน (7-Day Leadership Onboarding)"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>บทเรียน 7 วัน</span>
            </a>

            {/* Dedicated Back-Office Admin Portal Button */}
            {isAuthenticated && (
              <button
                id="nav-btn-admin-portal"
                type="button"
                onClick={onNavigateAdmin ? onNavigateAdmin : () => {
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
                title="เข้าระบบจัดการหลังบ้าน (Back-Office: Leads, สคริปต์ 2 นาที, ข้อมูลส่วนตัว, วัดผล)"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>ระบบหลังบ้าน</span>
              </button>
            )}

            {isAuthenticated ? (
              <button onClick={onLogout} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600" title={accountEmail || 'ออกจากระบบ'}>
                <LogOut className="h-3.5 w-3.5" /><span className="hidden lg:inline">{isAdmin ? 'Admin (ออก)' : 'ออกจากระบบ'}</span>
              </button>
            ) : (
              <button onClick={onOpenLogin} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900">
                <LogIn className="h-3.5 w-3.5" /><span className="hidden lg:inline">เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Register / Connect CTA */}
            {onOpenLineModal ? (
              <button
                type="button"
                id="nav-btn-line-cta"
                onClick={onOpenLineModal}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-lg transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0 cursor-pointer"
                title="กรอกแบบฟอร์มเพื่อรับรหัสสมาชิกและคำแนะนำฟรี"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
                <span className="hidden xs:inline">รับรหัสฟรี</span>
              </button>
            ) : (
              <a
                id="nav-btn-line-cta"
                href="#line-official"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-lg transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
                <span className="hidden xs:inline">รับรหัสฟรี</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
