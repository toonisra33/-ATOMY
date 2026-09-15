import React from 'react';
import { BUSINESS_BENEFITS } from '../data/atomyData';
import { ShieldCheck, TrendingUp, Globe2, Sparkles, Users, Award, CheckCircle2, ArrowRight, BadgeCheck } from 'lucide-react';
import { BinaryNetworkGraphicOverlay } from './BinaryNetworkGraphicOverlay';

export const BusinessHighlights: React.FC = () => {
  const iconMap: Record<string, React.ElementType> = {
    ShieldCheck,
    TrendingUp,
    Globe2,
    Sparkles,
    Users,
    Award,
  };

  return (
    <section id="highlights" className="py-20 sm:py-28 bg-gradient-to-b from-white via-slate-50/60 to-white border-b border-slate-200 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 border border-blue-200/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 animate-pulse" />
            <span>ทำไมต้องเป็น อะโทมี่ (Atomy)?</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-[1.2]">
            <span className="inline-block">6 จุดเด่นปฏิวัติวงการ</span>{' '}
            <span className="inline-block">
              ที่ทำให้ทุกคน <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600">สำเร็จได้จริงและยั่งยืน</span>
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed text-pretty">
            หมดยุคธุรกิจเครือข่ายแบบเดิมที่ต้องแบกรับสต็อกหรือถูกบังคับซื้อทุกเดือน สัมผัสโมเดลธุรกิจคุณธรรมที่เปลี่ยนรายจ่ายปกติในชีวิตประจำวัน ให้กลายเป็นรายได้สืบทอดตลอดชีพ
          </p>
        </div>

        {/* 6 Rich Visual Benefit Cards Grid */}
        <div className="mt-8 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {BUSINESS_BENEFITS.map((item, index) => {
            const IconComp = iconMap[item.iconName] || Sparkles;

            return (
              <div
                key={item.title}
                className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-md hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Photo Header with Badge Overlay */}
                <div className={`relative ${item.title.includes('Binary') ? 'h-52 sm:h-60' : 'h-44 sm:h-52'} w-full overflow-hidden bg-slate-900`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  {/* Subtle Gradient Over Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* If Binary Card: Render Professional 2-Leg Binary Network Graphic Overlay */}
                  {item.title.includes('Binary') && (
                    <BinaryNetworkGraphicOverlay />
                  )}

                  {/* If NOT Binary: Render Standard Floating Badges */}
                  {!item.title.includes('Binary') && (
                    <>
                      {/* Top Floating Badges */}
                      <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between z-10">
                        <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/20 shadow-xs">
                          #{index + 1} {item.tag}
                        </span>

                        {item.statLabel && (
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 backdrop-blur-md px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-500/40 shadow-xs">
                            {item.statLabel}
                          </span>
                        )}
                      </div>

                      {/* Floating Icon in Corner */}
                      <div className="absolute bottom-3 left-3 sm:bottom-3.5 sm:left-4 z-10 flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-blue-400/40">
                          <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold text-white/90 drop-shadow-sm font-mono tracking-wide">
                          ATOMY VALUE
                        </span>
                      </div>

                      {/* Masstige Authentic Product Seal Badge */}
                      {item.title.includes('Masstige') && (
                        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 text-[10px] sm:text-[11px] font-bold backdrop-blur-md shadow-md">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>สินค้าจริง 100%</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal text-pretty">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlight Pill & Quality Guarantee */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 space-y-2">
                    {item.keyHighlight && (
                      <div className="flex items-start gap-2 text-xs font-medium text-blue-900 bg-blue-50/80 p-2 sm:p-2.5 rounded-xl border border-blue-100/80">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug text-pretty">{item.keyHighlight}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Action Prompt */}
        <div className="mt-10 sm:mt-14 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900 via-sky-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 border border-blue-700/50">
          <div className="text-center md:text-left">
            <h4 className="text-base sm:text-xl font-bold leading-snug">
              พร้อมเริ่มต้นสร้างธุรกิจไร้ความเสี่ยงกับ Atomy แล้วหรือยัง?
            </h4>
            <p className="text-sky-200 text-xs sm:text-sm mt-1 sm:mt-1.5 text-pretty">
              สมัครสมาชิกฟรีวันนี้ ไม่มีค่าใช้จ่าย พร้อมรับการดูแลอย่างใกล้ชิดจากทีม Atomy Thailand Team freedomlife
            </p>
          </div>
          <a
            href="#line-official"
            className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            <span>แอด LINE ขอรับรหัสสปอนเซอร์ฟรี</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>

      </div>
    </section>
  );
};
