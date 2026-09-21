import React from 'react';
import { SponsorProfile } from '../types';
import { ATOMY_OFFICIAL_LINKS } from '../data/atomyData';
import { ExternalLink, Globe, ShieldCheck, ShoppingBag, Video, Ticket, MessageCircle, CheckCircle, Info, UserCheck } from 'lucide-react';

interface TrafficBridgeSectionProps {
  sponsor: SponsorProfile;
  onOpenLineModal?: () => void;
}

export const TrafficBridgeSection: React.FC<TrafficBridgeSectionProps> = ({ sponsor, onOpenLineModal }) => {
  return (
    <section id="atomy-portal" className="py-10 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold mb-3">
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>พอร์ทัลเชื่อมต่อสู่เว็บไซต์หลักทางการ</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug">
            <span className="inline-block">เชื่อมต่อสู่</span>{' '}
            <span className="text-blue-600 inline-block">เว็บหลัก Atomy ประเทศไทย</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-slate-600 text-xs sm:text-base leading-relaxed text-pretty">
            เว็บพ่วงนี้ทำหน้าที่เป็นสะพานส่งต่อผู้มุ่งหวังเข้าสู่ระบบทางการของ อะโทมี่ (Atomy) อย่างถูกต้อง ปลอดภัย และโปร่งใส 100%
          </p>
        </div>

        {/* Section 1: 3 ขั้นตอนการสมัครสมาชิกฟรีสู่เว็บหลัก Atomy (เรียงซ้ายไปขวา Step 1 -> 2 -> 3) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-blue-600 rounded-full shrink-0" />
                <span>3 ขั้นตอนการสมัครสมาชิกฟรีสู่เว็บหลัก Atomy</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                ทำตาม 3 ขั้นตอนนี้เพื่อเปิดรหัสสมาชิกทางการได้อย่างถูกต้องและรวดเร็ว
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                สมัครฟรี 100% (ไม่มีค่าแรกเข้า)
              </span>
            </div>
          </div>

          {/* 3 Steps: เรียงเป็นกล่องจากซ้ายไปขวา (Horizontal Slider บนมือถือ / Grid 3 คอลัมน์บนจอใหญ่) */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory">
            {/* Step 1 */}
            <div className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start p-5 sm:p-6 rounded-2xl bg-blue-50/70 border border-blue-100/90 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                    1
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    ขั้นตอนแรก
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  กรอกแบบฟอร์มเพื่อรับคำแนะนำ
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                  กรอกข้อมูลติดต่อในแบบฟอร์มด้านล่างเพื่อรับรหัสสปอนเซอร์ และทำตามขั้นตอนพิมพ์เลข 88 ใน LINE เพื่อรับสิทธิ์พี่เลี้ยงดูแลฟรี
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-blue-200/60 flex items-center justify-between">
                <div className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>มีที่ปรึกษาดูแลทุกขั้นตอน</span>
                </div>
                {onOpenLineModal && (
                  <button
                    type="button"
                    onClick={onOpenLineModal}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>กรอกแบบฟอร์ม</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start p-5 sm:p-6 rounded-2xl bg-sky-50/70 border border-sky-100/90 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
                    2
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                    เข้าสู่เว็บหลัก
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  เข้าสู่เว็บหลัก Atomy และกด 'สมัครสมาชิก'
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                  เข้าสู่หน้าสมัครของ Atomy Thailand อย่างเป็นทางการ กรอกข้อมูลส่วนตัวเพื่อยืนยันตัวตนอย่างปลอดภัย 100%
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-sky-200/60 text-xs text-sky-900 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                <span>ไม่มีค่าธรรมเนียมสมัครใดๆ (0 บาท)</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start p-5 sm:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                    3
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    รับรหัสสมาชิก
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  สมัครสมาชิก & รับรหัสส่วนตัว
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                  สมัครสมาชิกเรียบร้อย ระบบจะออกรหัสสมาชิกให้ทันที เริ่มสั่งซื้อสินค้าคุณภาพระดับเคาน์เตอร์แบรนด์และสร้างรายได้ได้เลย
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-200/60 text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>สิทธิ์สมาชิกตลอดชีพทั่วโลก 26+ ประเทศ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: พอร์ทัลหลักอย่างเป็นทางการ (Official Portals) เรียงเป็นกล่องจากซ้ายไปขวา */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-sky-600 rounded-full shrink-0" />
                <span>พอร์ทัลหลักอย่างเป็นทางการ (Official Portals)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                เข้าสู่เว็บไซต์และแพลตฟอร์มบริการทางการของ อะโทมี่ (ประเทศไทย) และระดับสากล ลิงก์ตรงปลอดภัย 100%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>โดเมนแท้ atomy.com</span>
              </span>
            </div>
          </div>

          {/* 4 Official Portals: เรียงเป็นกล่องจากซ้ายไปขวา (2 คอลัมน์บนมือถือ / 4 คอลัมน์บนจอใหญ่) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {ATOMY_OFFICIAL_LINKS.map((link, idx) => {
              const icons = [Globe, Video, ShoppingBag, Ticket];
              const IconComp = icons[idx % icons.length];

              return (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 sm:p-5 bg-slate-50/70 hover:bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 sm:mb-3.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shrink-0 self-start sm:self-auto">
                        {link.badge}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {link.title}
                    </h4>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed font-normal text-pretty line-clamp-3 sm:line-clamp-none">
                      {link.description}
                    </p>
                  </div>

                  <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] sm:text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    <span>เปิดเว็บหลัก</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* Security & Authenticity Trust Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ทุกพอร์ทัลเชื่อมต่อตรงสู่เซิร์ฟเวอร์หลักของบริษัท อะโทมี่ ปลอดภัยด้วยการเข้ารหัส SSL 256-bit</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Official Atomy Global Hub</span>
          </div>
        </div>

        {/* Disclaimer / Transparency Note */}
        <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed text-pretty shadow-sm">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="font-semibold text-slate-800">หมายเหตุ:</strong> เว็บไซต์นี้เป็นเว็บลูกข่ายพ่วงทราฟฟิก (Satellite / Affiliate Funnel) ดำเนินการโดยนักธุรกิจอิสระอะโทมี่ เพื่อเผยแพร่ข้อมูลและส่งต่อผู้มุ่งหวังเข้าสู่ระบบอย่างเป็นทางการ ข้อมูลผลิตภัณฑ์และแผนธุรกิจเป็นไปตามระเบียบบริษัท อะโทมี่ (ประเทศไทย) จำกัด
          </p>
        </div>

      </div>
    </section>
  );
};

