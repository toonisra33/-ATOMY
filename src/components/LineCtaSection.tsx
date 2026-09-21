import React, { useState } from "react";
import { SponsorProfile } from "../types";
import { DEFAULT_SPONSOR } from "../data/atomyData";
import {
  MessageCircle,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Send,
  UserCheck,
  Loader2,
  Users,
  CheckCircle2,
  Lock,
  Eye,
  ArrowLeft,
  FileText,
  ExternalLink,
  GraduationCap,
  Play,
} from "lucide-react";
import { submitLead } from "../lib/firebase";
import { trackLeadEvent, trackContactEvent } from "../lib/pixel";

interface LineCtaSectionProps {
  sponsor: SponsorProfile;
  isAuthenticated?: boolean;
  onOpenLeadsModal?: () => void;
  externalStep?: 'form' | 'welcome';
  onStepChange?: (step: 'form' | 'welcome') => void;
}

interface SubmittedLeadData {
  fullName: string;
  phone: string;
  email?: string;
  lineId?: string;
  age?: string;
  occupation?: string;
  interest?: string;
  notes?: string;
}

export const LineCtaSection: React.FC<LineCtaSectionProps> = ({
  sponsor,
  isAuthenticated = false,
  onOpenLeadsModal,
  externalStep,
  onStepChange,
}) => {
  // Step in CTA section: 'form' | 'welcome'
  const [internalStep, setInternalStep] = useState<'form' | 'welcome'>('form');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const currentStep = externalStep !== undefined ? externalStep : internalStep;

  const setCurrentStep = (step: 'form' | 'welcome') => {
    setInternalStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [prospectLineId, setProspectLineId] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [interest, setInterest] = useState("สนใจสร้างรายได้เสริมควบคู่กับงานประจำ (ธุรกิจ)");
  const [notes, setNotes] = useState("");
  const [hasConsent, setHasConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Post-submission / Welcome view states
  const [submittedData, setSubmittedData] = useState<SubmittedLeadData | null>(null);
  const [copiedApplication, setCopiedApplication] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [copiedCode88, setCopiedCode88] = useState<boolean>(false);
  const [copiedLineId, setCopiedLineId] = useState<boolean>(false);

  const getAttributionParams = () => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      ttclid: params.get("ttclid") || undefined,
      fbclid: params.get("fbclid") || undefined,
      gclid: params.get("gclid") || undefined,
      landing_page: window.location.pathname,
      referrer: document.referrer || undefined,
    };
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage("กรุณาระบุชื่อ-นามสกุล และเบอร์โทรศัพท์ติดต่อ");
      return;
    }
    if (!hasConsent) {
      setErrorMessage("กรุณายินยอมให้ทีมงานติดต่อกลับตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload: SubmittedLeadData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        lineId: prospectLineId.trim() || undefined,
        age: age.trim() || undefined,
        occupation: occupation.trim() || undefined,
        interest: interest.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      setSubmittedData(payload);

      // 1. บันทึกข้อมูลเข้า Cloud Firestore ให้เรียบร้อยก่อน
      await submitLead({
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        email: email.trim() || undefined,
        lineId: prospectLineId.trim() || "",
        age: age.trim() || undefined,
        occupation: occupation.trim() || undefined,
        interest: interest.trim() || undefined,
        notes: notes.trim() || undefined,
        sponsorId: sponsor.sponsorId,
        sponsorName: sponsor.sponsorName,
        ownerUid: sponsor.ownerUid || "",
        attribution: getAttributionParams(),
        hasConsent: true,
      });

      // 2. สำคัญที่สุด: ยิง Pixel Lead Event หลังบันทึกข้อมูลสำเร็จและกำลังเข้าสู่หน้ายินดีต้อนรับเท่านั้น
      trackLeadEvent({
        fullName: fullName.trim(),
        sponsorId: sponsor.sponsorId,
        sponsorName: sponsor.sponsorName,
      });

      // 3. เปลี่ยนหน้าไปที่หน้ายินดีต้อนรับ (Welcome View สำหรับผู้มุ่งหวังจริง)
      setIsPreviewMode(false);
      setCurrentStep('welcome');
    } catch (err: any) {
      console.error('Lead error:', err);
      if (err.message === "DUPLICATE_LEAD") {
        // แม้เคยฝากเบอร์ไว้แล้ว ก็พาไปหน้ายินดีต้อนรับเพื่อรับคำแนะนำกด 88 ได้เลย
        setIsPreviewMode(false);
        setCurrentStep('welcome');
      } else {
        setErrorMessage(
          "ไม่สามารถบันทึกข้อมูลได้ชั่วคราว กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getApplicationText = () => {
    const data = submittedData || {
      fullName: fullName.trim(),
      phone: phone.trim(),
      lineId: prospectLineId.trim(),
      email: email.trim(),
      age: age.trim(),
      occupation: occupation.trim(),
      interest: interest.trim(),
      notes: notes.trim(),
    };

    const val = (v?: string) => (v && v.trim() ? v.trim() : "-");

    const lines = [
      "📋 ข้อมูลลงทะเบียนสมัครสมาชิก Atomy (รหัส 88)",
      "━━━━━━━━━━━━━━━━",
      `👤 ชื่อ-นามสกุล: ${val(data.fullName || fullName)}`,
      `📞 เบอร์โทรศัพท์: ${val(data.phone || phone)}`,
      `📧 อีเมล: ${val(data.email || email)}`,
      `💬 LINE ID: ${val(data.lineId || prospectLineId)}`,
      `🎂 อายุ: ${data.age || age ? `${data.age || age} ปี` : "-"}`,
      `💼 อาชีพ: ${val(data.occupation || occupation)}`,
      `🎯 ความสนใจ: ${val(data.interest || interest)}`,
      `📝 หมายเหตุ/เวลาสะดวก: ${val(data.notes || notes)}`,
      "━━━━━━━━━━━━━━━━",
      `🤝 สปอนเซอร์ผู้ดูแล: ${sponsor.sponsorName} (${sponsor.sponsorId})`,
    ];

    return lines.join("\n");
  };

  const copyApplicationData = () => {
    const text = getApplicationText();
    navigator.clipboard.writeText(text);
    setCopiedApplication(true);
    setTimeout(() => setCopiedApplication(false), 2500);
  };

  const copy88 = () => {
    navigator.clipboard.writeText('88');
    setCopiedCode88(true);
    setTimeout(() => setCopiedCode88(false), 2000);
  };

  const copySponsorLine = () => {
    navigator.clipboard.writeText(sponsor.lineId);
    setCopiedLineId(true);
    trackContactEvent("line", sponsor.sponsorId);
    setTimeout(() => setCopiedLineId(false), 2000);
  };

  const lineQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(sponsor.lineUrl)}`;

  return (
    <section
      id="line-official"
      className="py-10 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-blue-50/30 relative"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-12 shadow-2xl shadow-blue-500/5 border-2 border-blue-500/20 relative overflow-hidden">
          {/* Subtle Glow Accents */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* VIEW 1: LEAD REGISTRATION FORM */}
          {currentStep === 'form' && (
            <div>
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold mb-3 border border-blue-200">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>แบบฟอร์มขอรับคำแนะนำเปิดรหัสสมาชิกฟรี</span>
                </div>

                <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  <span>กรอกแบบฟอร์มเพื่อรับ</span>{" "}
                  <span className="text-blue-600 inline-block">ลิงก์สมัครสมาชิก Atomy</span>
                </h2>
                <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-base leading-relaxed text-pretty">
                  กรุณากรอกข้อมูลติดต่อด้านล่างนี้ให้ครบถ้วน เพื่อให้สปอนเซอร์{" "}
                  <strong className="font-bold text-slate-800">{sponsor.sponsorName}</strong>{" "}
                  และทีมงานส่งต่อรหัสผู้แนะนำ ลิงก์สมัครตรง และวิธีรับสิทธิ์พี่เลี้ยงดูแลฟรีตลอดชีพ
                </p>
              </div>

              {/* Sponsor Mini Banner & Member-Only Tools */}
              <div className="mt-6 p-3.5 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Sponsor Identity Card */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={sponsor.avatarUrl || DEFAULT_SPONSOR.avatarUrl}
                        alt={sponsor.sponsorName}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-blue-500/90 shadow-md shadow-blue-500/15"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ring-1 ring-emerald-400"
                        title="พร้อมให้คำแนะนำและดูแลตลอดชีพ"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <span>ผู้แนะนำประจำสายงาน</span>
                        </span>
                      </div>

                      {/* Full Sponsor Name - Strictly Single Line */}
                      <h4 className="text-[13px] xs:text-sm sm:text-base md:text-lg font-extrabold text-slate-900 leading-tight whitespace-nowrap tracking-tight">
                        {sponsor.sponsorName}
                      </h4>

                      {/* Position & Team Credentials */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-slate-600 mt-1 leading-normal">
                        <span className="font-semibold text-slate-800">{sponsor.sponsorPosition}</span>
                        {sponsor.teamName && (
                          <>
                            <span className="text-slate-300 hidden xs:inline">•</span>
                            <span className="text-blue-700 font-medium">{sponsor.teamName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Member-Only Toolbar: Preview & Leads Box (Hidden from general public prospects) */}
                  {isAuthenticated && (
                    <div className="flex items-center gap-2 flex-wrap pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/80 shrink-0">
                      {/* Shortcut to preview Welcome View (Members only) */}
                      <button
                        type="button"
                        id="btn-shortcut-preview-welcome"
                        onClick={() => {
                          setIsPreviewMode(true);
                          setCurrentStep('welcome');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                        title="คลิกเพื่อดูตัวอย่างหน้ายินดีต้อนรับและขั้นตอนส่งเลข 88 ที่ผู้มุ่งหวังจะเห็นหลังส่งฟอร์ม (แสดงเฉพาะสมาชิกในระบบ)"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ตัวอย่างหน้าต้อนรับ</span>
                      </button>

                      <a
                        href="/leads"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                        title="เปิดหน้าจัดการรายชื่อผู้มุ่งหวังในแท็บใหม่เต็มจอ"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>กล่องรายชื่อ (Leads)</span>
                        <ExternalLink className="w-3 h-3 text-blue-500 opacity-80" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Card */}
              <div className="mt-6 max-w-2xl mx-auto">
                {errorMessage && (
                  <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLeadSubmit} className="space-y-3.5 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อ-นามสกุลของคุณ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น สมชาย ใจดี"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="เช่น 0812345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & LINE ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        อีเมล (สำหรับส่งข้อมูลและรหัสสมาชิก)
                      </label>
                      <input
                        type="email"
                        placeholder="เช่น somchai@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        LINE ID (แนะนำเพื่อความสะดวกรวดเร็ว)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น somchai.line"
                        value={prospectLineId}
                        onChange={(e) => setProspectLineId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        อายุ (ปี)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="เช่น 35"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        อาชีพปัจจุบัน
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น พนักงานประจำ, ค้าขาย"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors"
                      />
                    </div>
                  </div>

                  {/* ความสนใจที่ต้องการปรึกษา */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ความสนใจเบื้องต้นที่คุณต้องการปรึกษา <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px] transition-colors cursor-pointer"
                    >
                      <option value="สนใจสร้างรายได้เสริมควบคู่กับงานประจำ (ธุรกิจ)">💼 สนใจสร้างรายได้เสริมควบคู่กับงานประจำ (ธุรกิจ)</option>
                      <option value="สนใจทดลองใช้สินค้าเกาหลีระดับพรีเมียม (ผู้บริโภค)">✨ สนใจทดลองใช้สินค้าเกาหลีระดับพรีเมียม (ผู้บริโภค)</option>
                      <option value="สนใจระบบการตลาดออนไลน์และเว็บไซต์ขยายสายงาน">🌐 สนใจระบบการตลาดออนไลน์และเว็บไซต์ขยายสายงาน</option>
                      <option value="สนใจศึกษาแผนการตลาดและสร้าง Passive Income">📈 สนใจศึกษาแผนการตลาดและสร้าง Passive Income</option>
                      <option value="อื่นๆ / ต้องการคำแนะนำจากที่ปรึกษา">💬 อื่นๆ / ต้องการคำแนะนำจากที่ปรึกษา</option>
                    </select>
                  </div>

                  {/* หมายเหตุเพิ่มเติม */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมายเหตุเพิ่มเติม / ช่วงเวลาที่สะดวกรับสาย (ถ้ามี)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น สะดวกคุยช่วงค่ำหลัง 18:00 น. หรือวันเสาร์-อาทิตย์ / มีคำถามเรื่องการเปิดรหัส"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                    />
                  </div>

                  {/* PDPA Consent Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1.5">
                    <input
                      type="checkbox"
                      id="section-pdpa-consent"
                      checked={hasConsent}
                      onChange={(e) => setHasConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor="section-pdpa-consent"
                      className="text-[11px] sm:text-xs text-slate-500 leading-relaxed cursor-pointer select-none"
                    >
                      ข้าพเจ้ายินยอมให้ทีมงานจัดเก็บข้อมูลส่วนบุคคลเพื่อการติดต่อกลับ แนะนำวิธีการสมัครสมาชิก Atomy และส่งคู่มือการสร้างรายได้ (ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล PDPA)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-xl shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2.5 min-h-[48px] active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>กำลังบันทึกข้อมูลเข้าระบบ...</span>
                        </>
                      ) : (
                        <>
                          <span>กดยืนยันข้อมูล & รับขั้นตอนแอด LINE สปอนเซอร์</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Guarantees */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 text-center">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ไม่มีค่าแรกเข้า 0 บาท สมัครฟรี 100%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>รับสิทธิ์เข้าห้องเรียนออนไลน์และเครื่องมือฟรี</span>
                </span>
              </div>
            </div>
          )}

          {/* VIEW 2: WELCOME & LINE STEP-BY-STEP (ขั้นตอนกด 88) */}
          {currentStep === 'welcome' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              {/* Preview Mode Alert Bar & Switch Back Button (ONLY shown when in preview mode) */}
              {isPreviewMode && (
                <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2.5 text-emerald-950 font-medium text-center sm:text-left">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700 shrink-0">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-800">โหมดแสดงตัวอย่างหน้ายินดีต้อนรับ (Welcome Screen):</span>{' '}
                      <span className="text-slate-600">นี่คือหน้าที่ผู้มุ่งหวังจะเห็นทันทีหลังกดส่งฟอร์ม เพื่อรับขั้นตอนแอด LINE & ส่งเลข 88</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="btn-welcome-back-to-form"
                    onClick={() => {
                      setIsPreviewMode(false);
                      setCurrentStep('form');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 font-bold rounded-xl border border-slate-300 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>กลับไปดูหน้าแบบฟอร์ม</span>
                  </button>
                </div>
              )}

              {/* For authenticated members testing real submission: allow quick switch back */}
              {!isPreviewMode && isAuthenticated && (
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewMode(false);
                      setCurrentStep('form');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>กลับไปหน้าแบบฟอร์ม (โหมดทดสอบสมาชิก)</span>
                  </button>
                </div>
              )}

              {/* Header: Congratulations / Welcome */}
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3.5 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                  ✓ บันทึกข้อมูลของคุณเข้าสู่ระบบเรียบร้อยแล้ว
                </span>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  ยินดีต้อนรับสู่ครอบครัว Atomy Global!
                </h2>

                <p className="mt-2.5 text-xs sm:text-base text-slate-600 leading-relaxed text-pretty">
                  ขอแสดงความยินดีกับการเริ่มต้นก้าวสำคัญ! ข้อมูลของคุณถูกส่งถึงสปอนเซอร์{" "}
                  <strong className="text-slate-900 font-bold">{sponsor.sponsorName}</strong>{" "}
                  เรียบร้อยแล้ว คัดลอกข้อมูลด้านล่าง แล้วกดแอด LINE สปอนเซอร์เพื่อรับรหัสสมาชิกได้ทันที:
                </p>
              </div>

              {/* CARD 1: DYNAMIC FORM DATA EXTRACTION & ONE-CLICK COPY BOX */}
              <div className="mt-6 max-w-2xl mx-auto bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/90 p-4 sm:p-6 rounded-2xl border-2 border-blue-400/60 shadow-lg relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        ข้อมูลใบสมัครของคุณ (ดึงจากแบบฟอร์มอัตโนมัติ)
                      </h3>
                      <p className="text-[11px] text-blue-700 font-medium">
                        คัดลอกเพื่อนำไปกด "วาง (Paste)" ใน LINE สปอนเซอร์ได้ทันที ไม่ต้องเสียเวลาพิมพ์ใหม่
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center text-[10.5px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300 shrink-0">
                    ✓ ดึงข้อมูลสำเร็จ
                  </span>
                </div>

                {/* Structured Data Preview Grid */}
                <div className="bg-white/95 rounded-xl p-3.5 sm:p-4 border border-blue-200 shadow-inner text-xs sm:text-sm text-slate-700 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
                      <span className="text-slate-500 shrink-0">ชื่อ-นามสกุล:</span>
                      <strong className="text-slate-900 font-bold">{submittedData?.fullName || fullName || "-"}</strong>
                    </div>
                    <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
                      <span className="text-slate-500 shrink-0">เบอร์โทรศัพท์:</span>
                      <strong className="text-blue-700 font-bold font-mono">{submittedData?.phone || phone || "-"}</strong>
                    </div>
                    <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
                      <span className="text-slate-500 shrink-0">อีเมล:</span>
                      <span className="text-slate-800 font-medium">{submittedData?.email || email || "-"}</span>
                    </div>
                    <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
                      <span className="text-slate-500 shrink-0">LINE ID:</span>
                      <strong className="text-emerald-700 font-mono font-semibold">{submittedData?.lineId || prospectLineId || "-"}</strong>
                    </div>
                    <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
                      <span className="text-slate-500 shrink-0">อายุ:</span>
                      <span className="text-slate-800">{submittedData?.age ? `${submittedData.age} ปี` : age ? `${age} ปี` : "-"}</span>
                    </div>
                    <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
                      <span className="text-slate-500 shrink-0">อาชีพ:</span>
                      <span className="text-slate-800">{submittedData?.occupation || occupation || "-"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">ความสนใจ:</span>{" "}
                    <span className="text-blue-900 font-semibold">{submittedData?.interest || interest || "-"}</span>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 font-medium">หมายเหตุ / เวลาที่สะดวก:</span>{" "}
                    <span className="text-slate-700">{submittedData?.notes || notes || "-"}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>ผู้แนะนำ: <strong className="text-slate-700">{sponsor.sponsorName}</strong> ({sponsor.sponsorId})</span>
                    <span className="text-slate-500 font-medium bg-blue-50 px-2 py-0.5 rounded text-blue-700">รหัสสมัคร: 88</span>
                  </div>
                </div>

                {/* Big Copy Button */}
                <div className="mt-3.5">
                  <button
                    type="button"
                    onClick={copyApplicationData}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                      copiedApplication
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
                    }`}
                  >
                    {copiedApplication ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>✓ คัดลอกข้อมูลใบสมัครแล้ว! พร้อมนำไปกด "วาง (Paste)" ใน LINE</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>คัดลอกข้อมูลใบสมัครทั้งหมด (นำไปวางใน LINE สปอนเซอร์)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MOCKUP: LINE CHAT PREVIEW (แสดงตัวอย่างการกด 88) */}
              <div className="mt-6 max-w-2xl mx-auto bg-gradient-to-b from-[#7ECEF4]/20 to-[#6BB7E2]/15 p-4 sm:p-5 rounded-2xl border border-sky-200">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      L
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      ตัวอย่างหน้าแชท LINE Official สปอนเซอร์
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-sky-800 bg-white/80 px-2.5 py-0.5 rounded-full">
                    เปิดระบบง่ายใน 3 วินาที
                  </span>
                </div>

                {/* Chat Bubble Simulation */}
                <div className="space-y-3 text-xs sm:text-sm font-sans">
                  {/* Sponsor Greeting Bubble */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <img
                      src={sponsor.avatarUrl || DEFAULT_SPONSOR.avatarUrl}
                      alt={sponsor.sponsorName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                    />
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs border border-slate-200 max-w-[85%] text-slate-800">
                      <p className="leading-relaxed">
                        สวัสดีครับ ยินดีต้อนรับสู่ Atomy! เมื่อแอดไลน์แล้ว พิมพ์ตัวเลข <strong className="text-blue-600 font-black text-base">88</strong> ส่งเข้ามาในแชทนี้ได้เลย เพื่อรับสิทธิ์เปิดรหัสสมาชิกและรับคำแนะนำเริ่มต้นฟรีทันทีครับ
                      </p>
                    </div>
                  </div>

                  {/* User Response Bubble (Typing 88) */}
                  <div className="flex items-end justify-end gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">อ่านแล้ว</span>
                    <div className="bg-[#06C755] text-white font-black text-lg px-4 py-1.5 rounded-2xl rounded-tr-none shadow-xs flex items-center gap-2 animate-pulse">
                      <span>88</span>
                      <Send className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                </div>

                {/* Step Guide Callout & Copy 88 */}
                <div className="mt-3.5 pt-3 border-t border-sky-200/60 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium">
                    เพียงแอด LINE แล้วส่งรหัส <strong className="text-blue-700 font-bold">88</strong>
                  </span>
                  <button
                    type="button"
                    onClick={copy88}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-lg border border-blue-300 shadow-2xs cursor-pointer text-xs"
                  >
                    {copiedCode88 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode88 ? 'คัดลอกเลข 88 แล้ว' : 'คัดลอกเลข 88'}</span>
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS: Add LINE & Scan QR Code */}
              <div className="mt-6 max-w-2xl mx-auto space-y-3">
                {/* Button 1: Click to Add LINE */}
                <a
                  id="btn-welcome-add-line-main"
                  href={sponsor.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContactEvent('line', sponsor.sponsorId)}
                  className="w-full py-4 px-6 bg-[#06C755] hover:bg-[#05b34c] text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 text-center min-h-[52px] active:scale-[0.99]"
                >
                  <MessageCircle className="w-6 h-6 fill-white shrink-0" />
                  <span>คลิกแอด LINE สปอนเซอร์ทันที</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </a>

                {/* Button 2: QR Code Scan Toggle */}
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-slate-300 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <QrCode className="w-4 h-4 text-slate-700" />
                  <span>{showQrCode ? 'ซ่อน QR Code สำหรับแอดไลน์' : 'หรือ สแกน QR Code จากหน้าจอคอมพิวเตอร์'}</span>
                </button>

                {/* QR Code Container */}
                {showQrCode && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 font-medium">
                      ใช้กล้องมือถือหรือแอป LINE สแกน QR Code เพื่อแอดสปอนเซอร์:
                    </p>
                    <img
                      src={lineQrUrl}
                      alt="LINE QR Code"
                      className="w-52 h-52 mx-auto rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
                    />
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600">
                      <span>LINE ID: <strong className="font-mono text-slate-900">{sponsor.lineId}</strong></span>
                      <button
                        type="button"
                        onClick={copySponsorLine}
                        className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        {copiedLineId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLineId ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 7-DAY TRAINING FUNNEL BANNER (DAY 1) */}
              <div className="mt-6 max-w-2xl mx-auto p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white border border-blue-500/40 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-1">
                      <span>หลักสูตรพัฒนาผู้นำ 7 วัน • Day 1 / 7</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      บทเรียนวันที่ 1: Work Hard กับ Work Smart
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      "ผมเจอทางแล้วว่าผมควรจะไปทางไหน" — เรียนรู้แนวคิดการสร้างท่อส่งน้ำถาวร (60 นาที) พร้อมทำแบบทดสอบ 10 ข้อเพื่อผ่านเกณฑ์
                    </p>
                  </div>
                  <a
                    href="/day1"
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>เข้าเรียน Day 1</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Reset to edit form if needed */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>มีข้อสงสัยสอบถามโทร: <strong className="text-slate-700">{sponsor.phoneNumber || '081-234-5678'}</strong></span>
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับไปดูหน้ากรอกแบบฟอร์ม</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
