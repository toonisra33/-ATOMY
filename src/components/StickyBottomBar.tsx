import React from 'react';
import { SponsorProfile } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { MessageCircle, Phone, Play } from 'lucide-react';
import { trackContactEvent } from '../lib/pixel';

interface StickyBottomBarProps {
  sponsor: SponsorProfile;
  onScrollToVideo: () => void;
  onOpenLineModal: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  sponsor,
  onScrollToVideo,
  onOpenLineModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] px-3.5 sm:px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center justify-between gap-2.5">
        {/* Sponsor Avatar & Name snippet */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={sponsor.avatarUrl || DEFAULT_SPONSOR.avatarUrl}
            alt={sponsor.sponsorName}
            className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shrink-0 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 font-medium block leading-none mb-0.5">ผู้แนะนำ:</span>
            <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight break-words line-clamp-2">
              {sponsor.sponsorName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onScrollToVideo}
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 cursor-pointer shrink-0"
            title="ไปที่วิดีโอ 20 นาที"
          >
            <Play className="w-3.5 h-3.5 fill-blue-600 ml-0.5" />
          </button>

          {sponsor.phoneNumber && (
            <a
              href={`tel:${sponsor.phoneNumber}`}
              onClick={() => trackContactEvent('call', sponsor.sponsorId)}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer shrink-0"
              title="โทรติดต่อ"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={onOpenLineModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>กรอกฟอร์มรับสิทธิ์</span>
          </button>
        </div>
      </div>
    </div>
  );
};
