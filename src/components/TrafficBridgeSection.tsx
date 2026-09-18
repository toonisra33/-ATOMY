import React from 'react';
import { SponsorProfile } from '../types';
import { ATOMY_OFFICIAL_LINKS } from '../data/atomyData';
import { ExternalLink, Globe, ArrowRight, ShieldCheck, ShoppingBag, Video, Ticket, CheckCircle, Info } from 'lucide-react';

interface TrafficBridgeSectionProps {
  sponsor: SponsorProfile;
}

export const TrafficBridgeSection: React.FC<TrafficBridgeSectionProps> = ({ sponsor }) => {
  return (
    <section id="atomy-portal" className="py-10 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
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

        {/* 3-Step Registration Roadmap */}
        <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-100">
          <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
            <span className="w-2 sm:w-2.5 h-5 sm:h-6 bg-blue-600 rounded-full shrink-0" />
            <span>3 ขั้นตอนการสมัครสมาชิกฟรีสู่เว็บหลัก Atomy</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-100 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-base flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                  1
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  ทัก LINE ติดต่อที่ปรึกษา
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                  ติดต่อที่ปรึกษาผ่าน LINE Official เพื่อรับคำแนะนำการสมัครและสอบถามข้อมูลเบื้องต้น
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-200/60 text-xs sm:text-sm text-blue-900 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>มีที่ปรึกษาคอยดูแลทุกขั้นตอน</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-sky-50/60 border border-sky-100 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-600 text-white font-bold text-sm sm:text-base flex items-center justify-center mb-3 shadow-md shadow-sky-500/20">
                  2
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  เข้าสู่เว็บหลัก Atomy และกด 'สมัครสมาชิก'
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                  เข้าสู่หน้าสมัครของ Atomy Thailand อย่างเป็นทางการ กรอกข้อมูลส่วนตัวเพื่อยืนยันตัวตนอย่างปลอดภัย
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-200/60 text-xs sm:text-sm text-sky-800 font-medium">
                ไม่มีค่าธรรมเนียมสมัครใดๆ (0 บาท)
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-100 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white font-bold text-sm sm:text-base flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
                  3
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  สมัครสมาชิก & รับรหัสส่วนตัว
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                  สมัครสมาชิกเรียบร้อย ระบบจะออกรหัสสมาชิกให้ทันที เริ่มสั่งซื้อสินค้าคุณภาพและสร้างรายได้ได้เลย
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200/60 text-xs sm:text-sm text-emerald-800 font-medium">
                สิทธิ์สมาชิกตลอดชีพทั่วโลก 26+ ประเทศ
              </div>
            </div>
          </div>
        </div>

        {/* Official Atomy Traffic Hub Grid */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>พอร์ทัลหลักอย่างเป็นทางการ (Official Portals)</span>
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">
              ลิงก์ตรงสู่ระบบ Atomy Global
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {ATOMY_OFFICIAL_LINKS.map((link, idx) => {
              const icons = [Globe, Video, ShoppingBag, Ticket];
              const IconComp = icons[idx % icons.length];

              return (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 shrink-0">
                        {link.badge}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {link.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-blue-600">
                    <span>เปิดเว็บไซต์หลัก</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Disclaimer / Transparency Note */}
        <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed text-pretty">
          <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <p>
            <strong className="font-semibold text-slate-800">หมายเหตุ:</strong> เว็บไซต์นี้เป็นเว็บลูกข่ายพ่วงทราฟฟิก (Satellite / Affiliate Funnel) ดำเนินการโดยนักธุรกิจอิสระอะโทมี่ เพื่อเผยแพร่ข้อมูลและส่งต่อผู้มุ่งหวังเข้าสู่ระบบอย่างเป็นทางการ ข้อมูลผลิตภัณฑ์และแผนธุรกิจเป็นไปตามระเบียบบริษัท อะโทมี่ (ประเทศไทย) จำกัด
          </p>
        </div>

      </div>
    </section>
  );
};
