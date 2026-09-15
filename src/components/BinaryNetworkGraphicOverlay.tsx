import React from 'react';
import { User, Users, GitFork, ArrowDown, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface BinaryNetworkGraphicOverlayProps {
  className?: string;
}

export const BinaryNetworkGraphicOverlay: React.FC<BinaryNetworkGraphicOverlayProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 z-10 flex flex-col justify-between p-3 select-none pointer-events-none ${className}`}>
      {/* Background Dim & Grid Glow */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] -z-10" />
      
      {/* Subtle Matrix / Circuit Line Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-35 -z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leftLegGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="rightLegGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tree Connection Branch Lines */}
        {/* From Root (50%, 26%) to Left Child (26%, 60%) */}
        <path
          d="M 50% 26% Q 38% 30% 26% 56%"
          fill="none"
          stroke="url(#leftLegGrad)"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          filter="url(#glow)"
          className="animate-[dash_20s_linear_infinite]"
        />
        {/* From Root (50%, 26%) to Right Child (74%, 60%) */}
        <path
          d="M 50% 26% Q 62% 30% 74% 56%"
          fill="none"
          stroke="url(#rightLegGrad)"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          filter="url(#glow)"
          className="animate-[dash_20s_linear_infinite]"
        />

        {/* Infinite Depth extension lines */}
        <path
          d="M 26% 66% L 26% 88%"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="2 2"
          opacity="0.75"
        />
        <path
          d="M 74% 66% L 74% 88%"
          fill="none"
          stroke="#818cf8"
          strokeWidth="2"
          strokeDasharray="2 2"
          opacity="0.75"
        />
      </svg>

      {/* Top Bar: Title & Technology Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] sm:text-[11px] font-bold text-sky-200">
          <GitFork className="w-3 h-3 text-sky-400 rotate-180" />
          <span>ระบบไบนารี 2 สายงาน</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] sm:text-[11px] font-bold text-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          คำนวณลึกไม่จำกัด ∞
        </span>
      </div>

      {/* Center Graph Node Layout */}
      <div className="relative flex-1 w-full my-1">
        {/* ROOT NODE: "YOU (ตัวคุณ)" */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <div className="relative">
            {/* Outer Glow Halo */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 opacity-80 blur-xs animate-pulse" />
            <div className="relative px-3 py-1 rounded-full bg-slate-900 border-2 border-amber-300 text-amber-300 shadow-md flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[9px]">
                ★
              </div>
              <span className="text-[11px] font-extrabold tracking-wide text-white">ตัวคุณ (YOU)</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-semibold">100% PV</span>
            </div>
          </div>
        </div>

        {/* LEFT LEG NODE */}
        <div className="absolute top-[52%] left-[8%] sm:left-[12%] flex flex-col items-center z-20">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/95 border-2 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
              L
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">สายงานซ้าย</div>
              <div className="text-[8px] sm:text-[9px] text-emerald-400 font-mono leading-none">Left Team</div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[8px] text-emerald-300/90 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            <span>ส่งต่อช่วยล่าง</span>
            <span>↓</span>
          </div>
        </div>

        {/* RIGHT LEG NODE */}
        <div className="absolute top-[52%] right-[8%] sm:right-[12%] flex flex-col items-center z-20">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/95 border-2 border-sky-400 text-sky-300 shadow-lg shadow-sky-500/20 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center font-bold text-[9px]">
              R
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">สายงานขวา</div>
              <div className="text-[8px] sm:text-[9px] text-sky-300 font-mono leading-none">Right Team</div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[8px] text-sky-300/90 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
            <span>ส่งต่อช่วยล่าง</span>
            <span>↓</span>
          </div>
        </div>

        {/* Center Indicator Badge: Unlimited Depth Connection */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
          <div className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[9px] sm:text-[10px] flex items-center gap-1 shadow-xs">
            <span className="text-amber-400 font-bold">จุดเด่น:</span>
            <span>ติดตัวได้เพียง 2 สายงาน ที่เหลือส่งต่อลงลึก</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Pill */}
      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-300 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 z-10">
        <div className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>คะแนน PV ทุกคนรวมขึ้นหาคุณ 100%</span>
        </div>
        <div className="text-sky-300 font-bold font-mono">
          Global One Server
        </div>
      </div>
    </div>
  );
};
