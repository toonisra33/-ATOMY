import React, { useState } from 'react';
import { FAQ_LIST } from '../data/atomyData';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { SponsorProfile } from '../types';

interface FaqSectionProps {
  sponsor: SponsorProfile;
  onOpenLineModal?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ sponsor, onOpenLineModal }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIdx(openIdx === index ? null : index);
  };

  return (
    <section id="faq" className="py-10 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>คำถามที่พบบ่อย</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            ข้อสงสัยทั่วไปก่อนเริ่มต้นกับ Atomy
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 text-pretty">
            รวมคำตอบเคลียร์ทุกข้อกังวล ให้คุณเริ่มต้นด้วยความมั่นใจ 100%
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-6 sm:mt-10 space-y-2.5 sm:space-y-3">
          {FAQ_LIST.map((item, index) => {
            const isOpen = openIdx === index;
            return (
              <div
                key={item.question}
                className="rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-3.5 sm:p-5 flex items-start sm:items-center justify-between gap-3 sm:gap-4 font-semibold text-xs sm:text-base text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      Q{index + 1}
                    </span>
                    <span className="leading-snug text-pretty">{item.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform duration-200 shrink-0 mt-0.5 sm:mt-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    <p className="pt-3 text-slate-700 sm:pl-9 leading-relaxed text-pretty">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Question CTA */}
        <div className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 text-center">
          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            ยังมีคำถามอื่นๆ เพิ่มเติมหรือไม่?
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 text-pretty">
            คุณ {sponsor.sponsorName} พร้อมตอบทุกคำถามและให้ข้อมูลอย่างตรงไปตรงมา
          </p>
          {onOpenLineModal ? (
            <button
              type="button"
              onClick={onOpenLineModal}
              className="mt-3.5 sm:mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>กรอกฟอร์มเพื่อสอบถาม & ทัก LINE</span>
            </button>
          ) : (
            <a
              href="#line-official"
              className="mt-3.5 sm:mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>กรอกฟอร์มเพื่อสอบถาม & ทัก LINE</span>
            </a>
          )}
        </div>

      </div>
    </section>
  );
};
