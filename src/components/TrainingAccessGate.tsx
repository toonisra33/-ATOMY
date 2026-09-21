/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TrainingAccessGate.tsx
 * หน้าจอตรวจสอบสิทธิ์เข้าห้องเรียน 7 วัน (Gated Access for 7-Day Training)
 * ป้องกันไม่ให้ผู้มุ่งหวังทั่วไปเข้าถึงบทเรียนจนกว่าจะลงทะเบียนหรือเข้าสู่ระบบ
 */

import React, { useState } from "react";
import {
  Lock,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  LogIn,
  Sparkles,
  Phone,
  Mail,
  Home,
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import {
  saveProspectLearnerSession,
  ProspectLearnerSession
} from "../lib/trainingProgress";
import { SponsorProfile } from "../types";

interface TrainingAccessGateProps {
  sponsor: SponsorProfile;
  onAuthenticated: () => void;
  onOpenSponsorLogin: () => void;
  onBackToHome: () => void;
}

export const TrainingAccessGate: React.FC<TrainingAccessGateProps> = ({
  sponsor,
  onAuthenticated,
  onOpenSponsorLogin,
  onBackToHome,
}) => {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleProspectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = phoneOrEmail.trim();
    if (!identifier) {
      setErrorMessage("กรุณากรอกเบอร์โทรศัพท์หรืออีเมลที่เคยลงทะเบียนไว้");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // Create and save learner session
      const isEmail = identifier.includes("@");
      const session: ProspectLearnerSession = {
        fullName: fullName.trim() || "ผู้มุ่งหวังคนพิเศษ",
        phoneNumber: isEmail ? "" : identifier,
        email: isEmail ? identifier : "",
        registeredAt: Date.now(),
      };

      saveProspectLearnerSession(session);
      setIsVerifying(false);
      onAuthenticated();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand & Back Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
        >
          <Home className="w-3.5 h-3.5" />
          <span>กลับสู่หน้าหลัก</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium">ระบบพัฒนาผู้นำ Onboarding</span>
        </div>
      </div>

      {/* Main Gated Box */}
      <div className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon */}
          <div className="text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30 border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ห้องเรียนเฉพาะสมาชิก & ผู้มุ่งหวังที่ลงทะเบียน</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              ระบบพัฒนาผู้นำ 7 วัน
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              บทเรียนและวิดีโอเจาะลึก 60 นาทีนี้ สงวนสิทธิ์เฉพาะผู้มุ่งหวังที่ลงทะเบียนผ่านแบบฟอร์ม หรือสมาชิกทีมงานของสปอนเซอร์{" "}
              <strong className="text-white font-bold">{sponsor.sponsorName}</strong> เท่านั้น
            </p>
          </div>

          {/* Access Options Form */}
          <div className="mt-8 space-y-6">
            {/* Option 1: Existing registered lead login */}
            <form onSubmit={handleProspectLogin} className="space-y-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>เข้าสู่ระบบด้วยข้อมูลที่คุณเคยลงทะเบียนไว้</span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  เบอร์โทรศัพท์ หรือ อีเมล <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="เช่น 0812345678 หรืออีเมลของคุณ"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อ-นามสกุล (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณสมชาย"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isVerifying ? (
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                ) : (
                  <>
                    <span>เข้าสู่ห้องเรียนบทเรียน 7 วัน</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-slate-900/80 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider rounded-full border border-white/10">
                หรือ
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Option 2: Go to registration form */}
            <div className="text-center space-y-3">
              <div className="text-xs text-slate-300">
                ยังไม่เคยลงทะเบียนรับสิทธิ์เรียนฟรี?
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/#line-official";
                }}
                className="w-full py-3 px-4 bg-emerald-600/90 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>กรอกแบบฟอร์มเพื่อรับสิทธิ์เข้าเรียนฟรี 7 วัน</span>
              </button>
            </div>

            {/* Option 3: Sponsor Login */}
            <div className="pt-2 text-center border-t border-white/10">
              <button
                type="button"
                onClick={onOpenSponsorLogin}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>สำหรับสปอนเซอร์และแอดมิน: เข้าสู่ระบบสมาชิกทีมงาน</span>
              </button>
            </div>
          </div>
        </div>

        {/* Benefits badge */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 text-center">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ฟรี ไม่มีค่าใช้จ่าย 100%</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>ระบบนับถอยหลัง 24 ชม. ส่งตรงเข้าอีเมล</span>
          </span>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-4xl w-full mx-auto text-center py-2 text-[11px] text-slate-500">
        © Atomy Global Team Building Platform • ระบบพัฒนาผู้นำ 7 วัน
      </div>
    </div>
  );
};
