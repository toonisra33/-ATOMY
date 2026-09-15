import React from 'react';
import { BUSINESS_BENEFITS } from '../data/atomyData';
import { ShieldCheck, TrendingUp, Globe2, Sparkles, Users, Award } from 'lucide-react';

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
    <section id="highlights" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold mb-3 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>ทำไมต้องเป็น อะโทมี่ (Atomy)?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            6 จุดเด่นปฏิวัติวงการ ที่ทำให้ใครก็ <span className="text-blue-600">สำเร็จได้ง่าย</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            หมดยุคธุรกิจเครือข่ายแบบเดิมที่ต้องแบกรับสต็อกหรือถูกบังคับซื้อทุกเดือน สัมผัสธุรกิจคุณธรรมที่ยึดความสำเร็จของสมาชิกเป็นเป้าหมายสูงสุด
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUSINESS_BENEFITS.map((item) => {
            const IconComp = iconMap[item.iconName] || Sparkles;

            return (
              <div
                key={item.title}
                className="p-6 sm:p-7 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-full font-mono">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>มาตรฐานสากล 26+ ประเทศ</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
