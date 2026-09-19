import React from 'react';
import { GitFork, ArrowDown, ChevronDown, Sparkles, Users } from 'lucide-react';

interface BinaryNetworkGraphicOverlayProps {
  className?: string;
}

export const BinaryNetworkGraphicOverlay: React.FC<BinaryNetworkGraphicOverlayProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 z-10 flex flex-col justify-between p-2 sm:p-3 select-none ${className}`}>
      {/* Deep Luxury Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950/95 backdrop-blur-[2px] -z-10" />

      {/* SVG Connecting Branch Lines with glow & animated dash */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="legLeftGrad" x1="50%" y1="20%" x2="25%" y2="52%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="legRightGrad" x1="50%" y1="20%" x2="75%" y2="52%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="deepLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="deepLineGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="branchGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Branch: YOU (50%, 18%) -> Left Tier 1 (25%, 44%) */}
        <path
          d="M 50% 19% C 50% 30%, 25% 30%, 25% 44%"
          fill="none"
          stroke="url(#legLeftGrad)"
          strokeWidth="2.5"
          filter="url(#branchGlow)"
        />

        {/* Branch: YOU (50%, 18%) -> Right Tier 1 (75%, 44%) */}
        <path
          d="M 50% 19% C 50% 30%, 75% 30%, 75% 44%"
          fill="none"
          stroke="url(#legRightGrad)"
          strokeWidth="2.5"
          filter="url(#branchGlow)"
        />

        {/* Tier 1 Left -> Tier 2 A (14%, 72%) */}
        <path
          d="M 25% 54% C 25% 62%, 14% 62%, 14% 72%"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeDasharray="3 2"
          opacity="0.85"
        />

        {/* Tier 1 Left -> Tier 2 B (36%, 72%) */}
        <path
          d="M 25% 54% C 25% 62%, 36% 62%, 36% 72%"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeDasharray="3 2"
          opacity="0.85"
        />

        {/* Tier 1 Right -> Tier 2 C (64%, 72%) */}
        <path
          d="M 75% 54% C 75% 62%, 64% 62%, 64% 72%"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeDasharray="3 2"
          opacity="0.85"
        />

        {/* Tier 1 Right -> Tier 2 D (86%, 72%) */}
        <path
          d="M 75% 54% C 75% 62%, 86% 62%, 86% 72%"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeDasharray="3 2"
          opacity="0.85"
        />

        {/* Infinite Downward Stream Lines */}
        <path d="M 14% 82% L 14% 96%" fill="none" stroke="url(#deepLineGrad)" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M 36% 82% L 36% 96%" fill="none" stroke="url(#deepLineGrad)" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M 64% 82% L 64% 96%" fill="none" stroke="url(#deepLineGradRight)" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M 86% 82% L 86% 96%" fill="none" stroke="url(#deepLineGradRight)" strokeWidth="2" strokeDasharray="2 2" />
      </svg>

      {/* Header Info Tag */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-sky-500/40 text-white text-[10px] sm:text-xs font-bold shadow-md">
          <GitFork className="w-3 h-3 text-sky-400 rotate-180" />
          <span>โครงสร้างไบนารี 2 สายงาน</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] sm:text-xs font-bold shadow-md animate-pulse">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>ลึกไม่จำกัดชั้น (Unlimited Depth)</span>
        </div>
      </div>

      {/* Visual Binary Tree Container */}
      <div className="relative flex-1 w-full mt-1 mb-1 min-h-[170px] sm:min-h-[190px]">
        {/* ================= LEVEL 0: ROOT (ตัวคุณ) ================= */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
          <div className="relative group">
            {/* Outer animated halo */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 opacity-90 blur-[2px] animate-pulse" />
            <div className="relative flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full bg-slate-950 border-2 border-amber-300 shadow-xl">
              {/* Real Person Photo */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-300 shadow-xs shrink-0">
                <img
                  src="/images/avatar_you.jpg"
                  alt="ตัวคุณ"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left leading-none">
                <div className="text-[10px] sm:text-[11px] font-black text-amber-300 tracking-wide">ตัวคุณ (YOU)</div>
                <div className="text-[8px] text-slate-300 font-mono">100% Group PV</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= LEVEL 1: LEFT & RIGHT LEGS ================= */}
        {/* Level 1: Left Leg */}
        <div className="absolute top-[32%] left-[13%] sm:left-[17%] flex flex-col items-center z-30">
          <div className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-slate-950/95 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-emerald-300 shrink-0">
              <img
                src="/images/avatar_left1.jpg"
                alt="ทีมงานซ้าย"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left leading-none">
              <div className="text-[9px] sm:text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <span>สายงานซ้าย</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[7.5px] text-slate-300 font-mono">Left Leg Leader</div>
            </div>
          </div>
        </div>

        {/* Level 1: Right Leg */}
        <div className="absolute top-[32%] right-[13%] sm:right-[17%] flex flex-col items-center z-30">
          <div className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-slate-950/95 border-2 border-sky-400 shadow-lg shadow-sky-500/20">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-sky-300 shrink-0">
              <img
                src="/images/avatar_right1.jpg"
                alt="ทีมงานขวา"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left leading-none">
              <div className="text-[9px] sm:text-[10px] font-bold text-sky-300 flex items-center gap-1">
                <span>สายงานขวา</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              </div>
              <div className="text-[7.5px] text-slate-300 font-mono">Right Leg Leader</div>
            </div>
          </div>
        </div>

        {/* ================= LEVEL 2: 4 MEMBERS ================= */}
        {/* Tier 2: Left 1 */}
        <div className="absolute top-[65%] left-[5%] sm:left-[8%] flex flex-col items-center z-30">
          <div className="p-0.5 rounded-full bg-slate-950 border border-emerald-400/80 shadow-md">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
              <img
                src="/images/avatar_left2_a.jpg"
                alt="สมาชิกชั้นที่ 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[8px] font-semibold text-emerald-300/90 mt-0.5 bg-slate-950/80 px-1 rounded">ชั้นที่ 2</span>
        </div>

        {/* Tier 2: Left 2 */}
        <div className="absolute top-[65%] left-[28%] sm:left-[29%] flex flex-col items-center z-30">
          <div className="p-0.5 rounded-full bg-slate-950 border border-emerald-400/80 shadow-md">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
              <img
                src="/images/avatar_left2_b.jpg"
                alt="สมาชิกชั้นที่ 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[8px] font-semibold text-emerald-300/90 mt-0.5 bg-slate-950/80 px-1 rounded">ชั้นที่ 2</span>
        </div>

        {/* Tier 2: Right 1 */}
        <div className="absolute top-[65%] right-[28%] sm:right-[29%] flex flex-col items-center z-30">
          <div className="p-0.5 rounded-full bg-slate-950 border border-sky-400/80 shadow-md">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
              <img
                src="/images/avatar_right2_c.jpg"
                alt="สมาชิกชั้นที่ 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[8px] font-semibold text-sky-300/90 mt-0.5 bg-slate-950/80 px-1 rounded">ชั้นที่ 2</span>
        </div>

        {/* Tier 2: Right 2 */}
        <div className="absolute top-[65%] right-[5%] sm:right-[8%] flex flex-col items-center z-30">
          <div className="p-0.5 rounded-full bg-slate-950 border border-sky-400/80 shadow-md">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
              <img
                src="/images/avatar_right2_d.jpg"
                alt="สมาชิกชั้นที่ 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[8px] font-semibold text-sky-300/90 mt-0.5 bg-slate-950/80 px-1 rounded">ชั้นที่ 2</span>
        </div>

        {/* ================= DOWNWARD ARROWS: UNLIMITED DEPTH ================= */}
        <div className="absolute -bottom-1 left-0 right-0 flex items-center justify-around px-4 z-30">
          <div className="flex flex-col items-center animate-bounce text-emerald-400">
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </div>
          <div className="flex flex-col items-center animate-bounce text-emerald-400" style={{ animationDelay: '0.15s' }}>
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 border border-amber-400/60 shadow-lg">
            <span className="text-amber-300 font-extrabold text-[9px] sm:text-[10px]">ส่งต่อลึกไม่จำกัดชั้น</span>
            <span className="text-white font-black text-[10px] sm:text-xs">↓↓ ∞</span>
          </div>
          <div className="flex flex-col items-center animate-bounce text-sky-400" style={{ animationDelay: '0.3s' }}>
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </div>
          <div className="flex flex-col items-center animate-bounce text-sky-400" style={{ animationDelay: '0.45s' }}>
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-200 px-2.5 py-1 rounded-lg bg-slate-950/95 border border-slate-800 z-20 shadow-md">
        <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ติดตัวได้เพียง 2 คน • ส่งต่อช่วยสายงานลงลึก</span>
        </div>
        <div className="text-sky-300 font-bold font-mono">
          PV รวมขึ้น 100%
        </div>
      </div>
    </div>
  );
};
