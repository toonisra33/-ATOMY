import React from 'react';
import { SponsorProfile } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { Play, MessageCircle, ShieldCheck, CheckCircle2, Award, Users2, ChevronRight, Phone, Camera } from 'lucide-react';
import { trackContactEvent } from '../lib/pixel';

interface HeroProps {
  sponsor: SponsorProfile;
  onScrollToVideo: () => void;
  onOpenLineModal: () => void;
  onOpenAffiliateModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ sponsor, onScrollToVideo, onOpenLineModal, onOpenAffiliateModal }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-6 pb-12 sm:pt-16 sm:pb-24 border-b border-slate-200">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-sky-300/15 to-blue-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          
          {/* Left Column: Core Value Proposition & Headings */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-100 text-blue-800 text-[11px] sm:text-sm font-medium mb-4 sm:mb-6 shadow-2xs border border-blue-200/70">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
              <span>โอกาสธุรกิจออนไลน์ระดับโลก 26+ ประเทศ • สมัครฟรี 100%</span>
            </div>

            {/* Main Headline with responsive typography and balanced phrasing */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-snug sm:leading-[1.2]">
              <span className="inline-block">เปลี่ยนรายจ่ายในชีวิตประจำวัน</span>{' '}
              <span className="inline-block">
                ให้เป็น <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600">Passive Income ตลอดชีพ</span>
              </span>{' '}
              <span className="inline-block">กับ อะโทมี่ (Atomy)</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed text-pretty">
              สัมผัสสุดยอดธุรกิจเครือข่ายยุคใหม่จากเกาหลีใต้ <strong className="font-semibold text-slate-800">ไม่ต้องสต็อกของ ไม่บังคับรักษายอดรายเดือน</strong> สินค้าพรีเมียมระดับ Masstige ที่ผู้บริโภคซื้อซ้ำอย่างเป็นธรรมชาติ
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button
                id="hero-btn-watch-video"
                onClick={onScrollToVideo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer min-h-[46px]"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white ml-0.5" />
                </div>
                <span>ดูวิดีโอ 15 นาทีเจาะลึกธุรกิจ</span>
              </button>

              <a
                id="hero-btn-line-chat"
                href={sponsor.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactEvent('line', sponsor.sponsorId)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 min-h-[46px]"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                <span>แอด Line เพื่อขอรับรหัสฟรี</span>
              </a>
            </div>

            {/* Key Assurance Bullets */}
            <div className="mt-5 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-left max-w-lg mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 sm:bg-transparent text-xs sm:text-sm text-slate-700 font-medium border border-emerald-100/80 sm:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>ไม่มีค่าแรกเข้า 0 บาท</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 sm:bg-transparent text-xs sm:text-sm text-slate-700 font-medium border border-emerald-100/80 sm:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>ไม่มีรักษายอดรายเดือน</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 sm:bg-transparent text-xs sm:text-sm text-slate-700 font-medium border border-emerald-100/80 sm:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>ส่งต่อเป็นมรดกได้ 3 รุ่น</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sponsor Profile Card & Fast Trust Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-2xl p-4 sm:p-7 shadow-xl shadow-slate-200/70 border border-slate-200/90">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-blue-700 bg-blue-50 px-2 sm:px-2.5 py-1 rounded-full border border-blue-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>ผู้แนะนำทางการ (Official Sponsor)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  VERIFIED
                </span>
              </div>

              {/* Sponsor Profile Section */}
              <div className="mt-4 sm:mt-5 flex items-start gap-3 sm:gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={sponsor.avatarUrl || DEFAULT_SPONSOR.avatarUrl}
                    alt={sponsor.sponsorName}
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md shadow-slate-300"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white" title="พร้อมให้คำปรึกษา" />
                  {onOpenAffiliateModal && (
                    <button
                      type="button"
                      onClick={onOpenAffiliateModal}
                      title="กดเพื่อเปลี่ยนรูปภาพของคุณ / แก้ไขข้อมูลสปอนเซอร์"
                      className="absolute -top-1.5 -right-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md border-2 border-white cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                    >
                      <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {sponsor.sponsorName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-sky-700 font-semibold mt-0.5 truncate">
                    {sponsor.sponsorPosition}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    {sponsor.teamName}
                  </p>
                  
                  {/* Sponsor Code Highlight */}
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-mono text-slate-800 border border-slate-200">
                    <span className="text-slate-500 font-sans font-normal text-[11px]">รหัส:</span>
                    <strong className="text-blue-700 font-bold">{sponsor.sponsorId}</strong>
                  </div>
                </div>
              </div>

              {/* Personalized Welcome Note */}
              <div className="mt-3.5 sm:mt-4 p-3 sm:p-3.5 bg-slate-50/90 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                "{sponsor.welcomeNote}"
              </div>

              {/* Quick Connect Actions */}
              <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-2.5">
                <a
                  href={sponsor.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-2 sm:py-2.5 px-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs truncate"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                  <span className="truncate">ทัก LINE สปอนเซอร์</span>
                </a>

                {sponsor.phoneNumber ? (
                  <a
                    href={`tel:${sponsor.phoneNumber}`}
                    className="flex items-center justify-center gap-1 py-2 sm:py-2.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200 truncate"
                  >
                    <Phone className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">โทร {sponsor.phoneNumber}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenAffiliateModal}
                    className="flex items-center justify-center gap-1 py-2 sm:py-2.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200 truncate"
                  >
                    <span className="truncate">แก้ไขโปรไฟล์</span>
                  </button>
                )}
              </div>

              {/* Satellite Traffic Bridge Indicator */}
              <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  <span className="truncate">เว็บพ่วงส่งต่อสายงาน</span>
                </span>
                <button
                  onClick={onOpenLineModal}
                  className="text-blue-600 font-medium hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                >
                  ข้อมูลสปอนเซอร์ <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
