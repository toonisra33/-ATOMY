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
          {/* Brand Logo - English Only (Sponsor Atomy) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <a href="#hero" className="flex items-center gap-2 group min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                A
              </div>
              <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                SPONSOR <span className="text-sky-600 font-extrabold">ATOMY</span>
              </span>
            </a>
          </div>

          {/* Action Buttons - Clean Minimal Header: 7-Day Training + Portal */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 7-Day Training Button */}
            <a
              id="nav-btn-training-top"
              href="/day1"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200/90 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
              title="เข้าสู่ระบบบทเรียน 7 วัน (7-Day Leadership Onboarding)"
            >
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              <span>บทเรียน 7 วัน</span>
            </a>

            {/* Back-Office Admin Portal Button (Logged in) */}
            {isAuthenticated && (
              <button
                id="nav-btn-admin-portal"
                type="button"
                onClick={onNavigateAdmin ? onNavigateAdmin : () => {
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                title="เข้าระบบจัดการหลังบ้าน (Back-Office)"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="hidden sm:inline">ระบบหลังบ้าน</span>
              </button>
            )}

            {/* Login / Logout Button */}
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 p-2 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title={accountEmail || 'ออกจากระบบ'}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                title="เข้าสู่ระบบสปอนเซอร์ / แอดมิน"
              >
                <LogIn className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
