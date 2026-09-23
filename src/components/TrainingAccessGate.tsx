/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TrainingAccessGate.tsx
 * ประตูกลั่นกรองและยืนยันตัวตนก่อนเข้าเรียนบทเรียน 7 วัน (Learner Verification Gate)
 * 
 * ข้อกำหนด:
 * 1. ก่อนเข้าเรียนบทเรียน 7 วัน ให้ผู้มุ่งหวังลงทะเบียนก่อนเข้าเรียนเพื่อตรวจสอบความคืบหน้า
 *    โดยลงทะเบียนด้วย email, ชื่อนามสกุล, ชื่อเล่น, และรหัสผ่าน 6 ตัว
 * 2. ปุ่มลงทะเบียนเพื่อเข้าเรียน จะมีเฉพาะอีเมลวันแรกฉบับแรกเท่านั้น
 *    ฉบับที่ 2 เป็นต้นไป จะเป็นการยืนยันตัวตนด้วยการเข้าสู่ระบบเพียงอย่างเดียว จึงจะสามารถเข้าเรียนรู้และดูวิดีโอได้
 */

import React, { useState } from "react";
import {
  Lock,
  GraduationCap,
  ArrowRight,
  UserCheck,
  LogIn,
  Sparkles,
  Mail,
  Home,
  AlertCircle,
  Clock,
  CheckCircle2,
  KeyRound,
  User,
  Smile,
  Eye,
  EyeOff,
  ShieldCheck
} from "lucide-react";
import {
  registerLearnerAccount,
  loginLearnerAccount,
  ProspectLearnerSession
} from "../lib/trainingProgress";
import { SponsorProfile } from "../types";

interface TrainingAccessGateProps {
  sponsor: SponsorProfile;
  targetDay?: number;
  initialMode?: 'register' | 'login';
  onAuthenticated: () => void;
  onOpenSponsorLogin: () => void;
  onBackToHome: () => void;
}

export const TrainingAccessGate: React.FC<TrainingAccessGateProps> = ({
  sponsor,
  targetDay = 1,
  initialMode,
  onAuthenticated,
  onOpenSponsorLogin,
  onBackToHome,
}) => {
  // Determine starting tab based on targetDay or initialMode
  // Day 1 defaults to 'register' (unless explicitly set to login)
  // Day 2+ defaults strictly to 'login' (as requested)
  const isDay2OrAbove = targetDay >= 2;
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(() => {
    if (initialMode) return initialMode;
    if (isDay2OrAbove) return 'login';
    return 'register';
  });

  // Registration Form State (Day 1)
  const [regEmail, setRegEmail] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regNickname, setRegNickname] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login Form State (Day 2+ or returning learners)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Registration (Day 1)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = regEmail.trim();
    const fullName = regFullName.trim();
    const nickname = regNickname.trim();
    const password = regPassword.trim();

    if (!email || !email.includes("@")) {
      setErrorMessage("กรุณาระบุที่อยู่อีเมลที่ถูกต้อง เพื่อรับข่าวสารและบทเรียน");
      return;
    }
    if (!fullName) {
      setErrorMessage("กรุณาระบุชื่อ-นามสกุลของคุณ");
      return;
    }
    if (!nickname) {
      setErrorMessage("กรุณาระบุชื่อเล่นสำหรับให้ระบบเรียกทักทาย");
      return;
    }
    if (!password || password.length !== 6) {
      setErrorMessage("กรุณากำหนดรหัสผ่าน 6 ตัวอักษร/ตัวเลข พอดี สำหรับใช้เข้าสู่ระบบในวันถัดไป");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerLearnerAccount({
        email,
        fullName,
        nickname,
        password,
        sponsorId: sponsor.sponsorId,
      });

      if (res.success) {
        setSuccessMessage("ลงทะเบียนสำเร็จเรียบร้อย! กำลังนำคุณเข้าสู่ห้องเรียน...");
        setTimeout(() => {
          setIsSubmitting(false);
          onAuthenticated();
        }, 600);
      } else {
        setErrorMessage(res.error || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
      setIsSubmitting(false);
    }
  };

  // Handle Login (Day 2+ or returning)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !email.includes("@")) {
      setErrorMessage("กรุณาระบุที่อยู่อีเมลที่คุณใช้ลงทะเบียนไว้");
      return;
    }
    if (!password || password.length !== 6) {
      setErrorMessage("กรุณากรอกรหัสผ่าน 6 ตัวที่คุณได้กำหนดไว้ในวันแรก");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginLearnerAccount({
        email,
        password,
      });

      if (res.success) {
        setSuccessMessage("ยืนยันตัวตนสำเร็จ! กำลังเปิดวิดีโอบทเรียน...");
        setTimeout(() => {
          setIsSubmitting(false);
          onAuthenticated();
        }, 500);
      } else {
        setErrorMessage(res.error || "อีเมลหรือรหัสผ่าน 6 ตัวไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar: Back to Home & Platform Info */}
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
          <span className="text-xs text-slate-300 font-medium">
            สปอนเซอร์: <strong className="text-white">{sponsor.sponsorName}</strong>
          </span>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-lg w-full mx-auto my-auto py-6 sm:py-8">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
          {/* Ambient Decorative Light */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon & Tag */}
          <div className="text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-500/25 border border-white/20">
              <Lock className="w-7 h-7 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ห้องเรียนระบบพัฒนาผู้นำ 7 วัน • บทเรียนวันที่ {targetDay}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {isDay2OrAbove || activeTab === 'login'
                ? `ยืนยันตัวตนเพื่อเข้าเรียนบทเรียนวันที่ ${targetDay}`
                : "ลงทะเบียนเพื่อเข้าเรียนบทเรียนวันที่ 1"}
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {isDay2OrAbove || activeTab === 'login'
                ? "ฉบับที่ 2 เป็นต้นไป เป็นการยืนยันตัวตนด้วยการเข้าสู่ระบบ จึงจะสามารถเข้าเรียนรู้และดูวิดีโอได้"
                : "ลงทะเบียนด้วยอีเมล ชื่อ-นามสกุล ชื่อเล่น และกำหนดรหัสผ่าน 6 ตัว เพื่อบันทึกประวัติการเรียนรู้"}
            </p>
          </div>

          {/* Tab Switcher (Show toggle between Register & Login) */}
          <div className="mt-6 p-1 bg-slate-950/70 rounded-2xl border border-white/10 flex items-center gap-1 relative z-10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ลงทะเบียน (วันแรก)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบยืนยันตัวตน</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 relative z-10 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 relative z-10 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: REGISTRATION (DAY 1) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="mt-5 space-y-3.5 relative z-10">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[11px] text-blue-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>ลงทะเบียนครั้งแรกเพื่อผูกประวัติการเรียน และใช้รหัสผ่านนี้เข้าสู่ระบบในวันถัดไป</span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  อีเมล (Email) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="เช่น yourname@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Full Name & Nickname in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อเล่น <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย"
                      value={regNickname}
                      onChange={(e) => setRegNickname(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <Smile className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 6-character password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    รหัสผ่าน 6 ตัว <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-medium">
                    (กำหนด 6 ตัวอักษร/ตัวเลข พอดี)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    maxLength={6}
                    placeholder="เช่น 123456 หรือ ab1234"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-register-learner-day1"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>กำลังลงทะเบียนและเปิดห้องเรียน...</span>
                ) : (
                  <>
                    <span>ลงทะเบียนเพื่อเข้าเรียนบทเรียนวันที่ 1</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                >
                  เคยลงทะเบียนไว้แล้ว? เข้าสู่ระบบยืนยันตัวตน
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LOGIN (DAY 2+ OR RETURNING LEARNERS) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4 relative z-10">
              {isDay2OrAbove && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>บทเรียนวันที่ {targetDay}:</strong> ยืนยันตัวตนด้วยอีเมลและรหัสผ่าน 6 ตัวที่คุณได้ลงทะเบียนไว้ในวันแรก จึงจะสามารถเข้าเรียนรู้และดูวิดีโอได้
                  </span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  อีเมลของคุณ <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="อีเมลที่ใช้ลงทะเบียนในวันแรก"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Password 6 chars */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  รหัสผ่าน 6 ตัว <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    maxLength={6}
                    placeholder="กรอกรหัสผ่าน 6 ตัวของคุณ"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login-learner-auth"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>กำลังตรวจสอบข้อมูล...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>เข้าสู่ระบบเพื่อเข้าเรียน (บทเรียนวันที่ {targetDay})</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                >
                  ยังไม่ได้ลงทะเบียน? คลิกที่นี่เพื่อลงทะเบียนบทเรียนวันที่ 1
                </button>
              </div>
            </form>
          )}

          {/* Footer note for Sponsor Login */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={onOpenSponsorLogin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>สำหรับสมาชิกเว็บลูก / แอดมิน: เข้าสู่ระบบจัดการหลังบ้าน</span>
            </button>
          </div>
        </div>

        {/* Benefits badge */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 text-center">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ฟรี ไม่มีค่าใช้จ่าย 100%</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>ปลดล็อกวันต่อวัน ละเอียด 60 นาที</span>
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
