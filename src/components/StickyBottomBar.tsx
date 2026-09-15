import React from 'react';
import { SponsorProfile } from '../types';
import { MessageCircle, Phone, Play } from 'lucide-react';
import { trackContactEvent } from '../lib/pixel';

interface StickyBottomBarProps {
  sponsor: SponsorProfile;
  onScrollToVideo: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  sponsor,
  onScrollToVideo,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center justify-between gap-3">
        {/* Sponsor Avatar & Name snippet */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={sponsor.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
            alt={sponsor.sponsorName}
            className="w-9 h-9 rounded-full object-cover border border-emerald-500 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block truncate">สปอนเซอร์:</span>
            <p className="text-xs font-bold text-slate-900 truncate">
              {sponsor.sponsorName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onScrollToVideo}
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            title="ไปที่วิดีโอ 15 นาที"
          >
            <Play className="w-4 h-4 fill-blue-600 ml-0.5" />
          </button>

          {sponsor.phoneNumber && (
            <a
              href={`tel:${sponsor.phoneNumber}`}
              onClick={() => trackContactEvent('call', sponsor.sponsorId)}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="โทรติดต่อ"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          <a
            href={sponsor.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContactEvent('line', sponsor.sponsorId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>แอด LINE</span>
          </a>
        </div>
      </div>
    </div>
  );
};
