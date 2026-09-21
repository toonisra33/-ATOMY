/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  X,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Play,
  RotateCcw,
  FastForward,
} from "lucide-react";
import {
  SEVEN_DAYS_OVERVIEW,
  DayLockInfo,
  simulateFastForwardDay,
  resetAllTrainingProgress,
} from "../lib/trainingProgress";
import { TRAINING_DAYS_DATA } from "../data/trainingDaysData";

interface TrainingDayModalProps {
  selectedDay: number;
  lockInfo: DayLockInfo;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onSelectDay?: (dayNumber: number) => void;
  isAdmin?: boolean;
}

export function TrainingDayModal({
  selectedDay,
  lockInfo,
  isOpen,
  onClose,
  onRefresh,
  onSelectDay,
  isAdmin = false,
}: TrainingDayModalProps) {
  if (!isOpen) return null;

  const dayData = SEVEN_DAYS_OVERVIEW.find((d) => d.dayNumber === selectedDay) || {
    dayNumber: selectedDay,
    title: `บทเรียนวันที่ ${selectedDay}`,
    subtitle: "หลักสูตรพัฒนาผู้นำ 7 วัน",
    duration: "60 นาที",
  };

  const fullLessonData = TRAINING_DAYS_DATA[selectedDay];
  const isDay1 = selectedDay === 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-100 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            วันที่ {dayData.dayNumber} จาก 7 วัน
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {dayData.duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
          {dayData.title}
        </h3>
        <p className="text-xs sm:text-sm text-sky-400 font-medium mb-6">
          "{dayData.subtitle}"
        </p>

        {/* Lock / Unlock / Countdown Condition Card */}
        {lockInfo.status === "UNLOCKED" ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3.5 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/80 text-emerald-300 mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ปลดล็อกเรียบร้อยแล้ว</span>
              </div>
              <h4 className="text-base font-bold text-white">
                พร้อมเข้าสู่บทเรียนวันที่ {selectedDay}
              </h4>
              <p className="text-xs text-emerald-200/80 mt-1">
                {isDay1
                  ? "ครบ 24 ชั่วโมงหลังลงทะเบียนแล้ว สามารถเข้าศึกษาบทเรียนวันที่ 1 ได้ทันที"
                  : "คุณผ่านเกณฑ์และเวลาครบ 24 ชั่วโมงเรียบร้อยแล้ว สามารถเข้าเรียนรู้เนื้อหาบทเรียนได้ทันที"}
              </p>
            </div>
          </div>
        ) : lockInfo.status === "COUNTDOWN_RUNNING" ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-blue-500/50 mb-5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-2">
              <Clock className="w-4 h-4 animate-spin text-sky-400" />
              <span>ระบบกำลังนับถอยหลัง 24 ชั่วโมง</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2">
              บทเรียนจะปลดล็อกอัตโนมัติในอีก:
            </h4>

            {/* Live Big Countdown Clock */}
            <div className="bg-slate-950/90 rounded-2xl p-4 border border-blue-500/30 text-center mb-3">
              <div className="font-mono text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400 tracking-wider">
                {lockInfo.formattedCountdown}
              </div>
              <div className="flex justify-center gap-8 text-[10px] text-slate-400 uppercase font-semibold mt-1">
                <span>ชั่วโมง</span>
                <span>นาที</span>
                <span>วินาที</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              💡 คุณสอบผ่านวันที่ {lockInfo.requiredDayNumber} แล้ว ระบบกำลังจับเวลาระยะห่าง 24 ชั่วโมง เพื่อให้คุณมีเวลาซึมซับและทบทวนเนื้อหาก่อนเข้าสู่บทเรียนถัดไป
            </p>
          </div>
        ) : (
          /* LOCKED_WAITING_PREVIOUS_QUIZ */
          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-900/80 text-amber-300 border border-amber-600/50 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>ระบบยังไม่เริ่มนับถอยหลัง 24 ชม.</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                  ต้องทำข้อสอบวันที่ {lockInfo.requiredDayNumber} ให้ผ่าน 10/10 ก่อน
                </h4>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  หากยังดูวิดีโอไม่จบ หรือยังทำแบบทดสอบไม่ผ่าน 10 ข้อเต็ม ระบบจะไม่เริ่มนับถอยหลัง 24 ชั่วโมงเพื่อปลดล็อกบทเรียนนี้ครับ
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enter Lesson Button if Unlocked */}
        {lockInfo.isUnlocked && onSelectDay && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                onSelectDay(selectedDay);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>เข้าสู่หน้าบทเรียนวันที่ {selectedDay}</span>
            </button>
          </div>
        )}

        {/* Core Lesson Teaser & Key Takeaways Preview */}
        {fullLessonData && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2">
            <div className="text-[11px] font-bold text-sky-400">
              {fullLessonData.leadInTitle}
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{fullLessonData.leadInHook}"
            </p>
            {fullLessonData.keyTakeaways && fullLessonData.keyTakeaways.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  ไฮไลต์เนื้อหาในบทเรียนนี้:
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {fullLessonData.keyTakeaways.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Admin / Web Developer Test Mode Section */}
        {isAdmin && (
          <div className="pt-4 border-t border-slate-800">
            <div className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>เครื่องมือทดสอบระบบ (เฉพาะ Admin / ผู้พัฒนาเว็บ):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  simulateFastForwardDay(lockInfo.requiredDayNumber);
                  onRefresh();
                }}
                className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ ข้ามเวลา 24 ชม. (ปลดล็อกทันที)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetAllTrainingProgress();
                  onRefresh();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🔄 รีเซ็ตสถานะเป็นศูนย์</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Close Button */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
