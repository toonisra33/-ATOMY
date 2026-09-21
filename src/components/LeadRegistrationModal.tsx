import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MessageCircle,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Phone,
  UserCheck,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { SponsorProfile } from '../types';
import { submitLead } from '../lib/firebase';
import { trackLeadEvent, trackContactEvent } from '../lib/pixel';

interface LeadRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
  initialSource?: string;
}

export const LeadRegistrationModal: React.FC<LeadRegistrationModalProps> = ({
  isOpen,
  onClose,
  sponsor,
  initialSource = 'General Lead Form',
}) => {
  // Step 1: Form, Step 2: Welcome & Next Steps (กด 88 & Add LINE)
  const [step, setStep] = useState<'form' | 'welcome'>('form');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lineId, setLineId] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasConsent, setHasConsent] = useState(true);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLineId, setCopiedLineId] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage('');
    setShowQrCode(false);
    onClose();
  };

  const getAttributionParams = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      ttclid: params.get('ttclid') || undefined,
      fbclid: params.get('fbclid') || undefined,
      gclid: params.get('gclid') || undefined,
      source: initialSource,
      landing_page: window.location.pathname,
      referrer: document.referrer || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุล และเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (!hasConsent) {
      setErrorMessage('กรุณายินยอมให้ทีมงานติดต่อกลับตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Save data securely to Cloud Firestore FIRST
      await submitLead({
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        email: email.trim() || undefined,
        lineId: lineId.trim() || '',
        age: age.trim() || undefined,
        occupation: occupation.trim() || undefined,
        sponsorId: sponsor.sponsorId,
        sponsorName: sponsor.sponsorName,
        ownerUid: sponsor.ownerUid || '',
        attribution: getAttributionParams(),
        hasConsent: true,
      });

      // 2. CRITICAL REQUIREMENT: Fire Pixel Lead event ONLY AFTER successful save & reaching Welcome view
      trackLeadEvent({
        fullName: fullName.trim(),
        sponsorId: sponsor.sponsorId,
        sponsorName: sponsor.sponsorName,
      });

      // 3. Navigate to Welcome View
      setStep('welcome');
    } catch (err: any) {
      console.error('Lead submission error:', err);
      if (err.message === 'DUPLICATE_LEAD') {
        // Even for duplicate phone, still guide them to the welcome page
        setStep('welcome');
      } else {
        setErrorMessage('ไม่สามารถบันทึกข้อมูลได้ชั่วคราว กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode88 = () => {
    navigator.clipboard.writeText('88');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLineId = () => {
    navigator.clipboard.writeText(sponsor.lineId);
    setCopiedLineId(true);
    setTimeout(() => setCopiedLineId(false), 2000);
  };

  const lineQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(sponsor.lineUrl)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* VIEW 1: LEAD CAPTURE FORM */}
        {step === 'form' && (
          <div className="p-5 sm:p-8">
            {/* Header */}
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5 border border-blue-200/80">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>ลงทะเบียนรับสิทธิ์ & คำแนะนำฟรี</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                กรอกข้อมูลติดต่อเพื่อรับคำแนะนำ
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                ฝากข้อมูลติดต่อเพื่อให้ <strong className="text-slate-900 font-bold">{sponsor.sponsorName}</strong> และทีมงานส่งคู่มือ ลิงก์สมัครสมาชิกฟรี และสิทธิ์เข้าเรียนรู้ระบบ
              </p>
            </div>

              {/* Sponsor mini ribbon */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <img
                  src={sponsor.avatarUrl}
                  alt={sponsor.sponsorName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shrink-0 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">ผู้แนะนำประจำสายงาน:</span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug break-words">
                    {sponsor.sponsorName}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 break-words">
                    {sponsor.sponsorPosition} • {sponsor.teamName}
                  </p>
                </div>
              </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น สมชาย ใจดี"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-colors"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-colors"
                  />
                </div>
              </div>

              {/* Email & LINE ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมล (สำหรับรับรหัสสมาชิก)
                  </label>
                  <input
                    type="email"
                    placeholder="เช่น somchai@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    LINE ID (สะดวกตอบกลับ)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น somchai.line"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อาชีพปัจจุบัน
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น พนักงานประจำ / ค้าขาย"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-colors"
                  />
                </div>
              </div>

              {/* PDPA Consent */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="modal-lead-consent"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="modal-lead-consent"
                  className="text-[11px] sm:text-xs text-slate-500 leading-relaxed cursor-pointer select-none"
                >
                  ข้าพเจ้ายินยอมให้เก็บรวบรวมข้อมูลส่วนบุคคลเพื่อการติดต่อแนะนำเปิดรหัสสมาชิก Atomy และรับข้อมูลสนับสนุนทางธุรกิจ (ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล PDPA)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>กำลังบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <span>ยืนยันข้อมูล & ไปยังขั้นตอนถัดไป</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ข้อมูลปลอดภัย 100%</span>
                </span>
                <span>•</span>
                <span>ไม่มีค่าใช้จ่ายแอบแฝง</span>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 2: WELCOME & LINE STEP-BY-STEP (ขั้นตอนกด 88) */}
        {step === 'welcome' && (
          <div className="p-5 sm:p-8">
            {/* Header: Congratulations / Welcome */}
            <div className="text-center max-w-lg mx-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1.5">
                บันทึกข้อมูลเรียบร้อยแล้ว
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                ยินดีต้อนรับสู่ครอบครัว Atomy Global!
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                ขอบคุณที่คุณให้ความสนใจร่วมสร้างรายได้กับเรา ข้อมูลของคุณถูกส่งถึง <strong className="text-slate-900 font-bold">{sponsor.sponsorName}</strong> เรียบร้อยแล้ว เพื่อความสะดวกรวดเร็วในการรับลิงก์สมัครสมาชิก กรุณาทำตามขั้นตอนด้านล่างนี้ได้เลยครับ
              </p>
            </div>

            {/* MOCKUP: LINE CHAT PREVIEW (แสดงตัวอย่างการกด 88) */}
            <div className="mt-5 bg-gradient-to-b from-[#7ECEF4]/20 to-[#6BB7E2]/15 p-3.5 sm:p-4 rounded-2xl border border-sky-200">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    L
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    ตัวอย่างหน้าแชท LINE Official
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-sky-800 bg-white/80 px-2 py-0.5 rounded-full">
                  ขั้นตอนง่ายใน 3 วินาที
                </span>
              </div>

              {/* Chat Bubble Simulation */}
              <div className="space-y-2.5 text-xs font-sans">
                {/* Sponsor Greeting Bubble */}
                <div className="flex items-start gap-2">
                  <img
                    src={sponsor.avatarUrl}
                    alt={sponsor.sponsorName}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500 shrink-0"
                  />
                  <div className="bg-white p-2.5 rounded-2xl rounded-tl-none shadow-xs border border-slate-200 max-w-[85%] text-slate-800">
                    <p className="leading-relaxed">
                      สวัสดีครับ ยินดีต้อนรับครับ! พิมพ์ <strong className="text-blue-600 font-black text-sm">88</strong> ส่งเข้ามาในแชทนี้ได้เลย เพื่อรับลิงก์สมัครสมาชิกฟรีและคู่มือเริ่มต้นทันทีครับ
                    </p>
                  </div>
                </div>

                {/* User Response Bubble (Typing 88) */}
                <div className="flex items-end justify-end gap-1.5">
                  <span className="text-[9px] text-slate-400">อ่านแล้ว</span>
                  <div className="bg-[#06C755] text-white font-black text-base px-3.5 py-1.5 rounded-2xl rounded-tr-none shadow-xs flex items-center gap-1.5 animate-pulse">
                    <span>88</span>
                    <Send className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>
              </div>

              {/* Step Guide Callout */}
              <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">
                  เพียงกดแอดไลน์ แล้วพิมพ์เลข <strong className="text-blue-700 font-bold">88</strong>
                </span>
                <button
                  type="button"
                  onClick={copyCode88}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-lg border border-blue-300 shadow-2xs cursor-pointer text-[11px]"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'คัดลอก 88 แล้ว' : 'คัดลอกเลข 88'}</span>
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS: Add LINE & Scan QR Code */}
            <div className="mt-5 space-y-2.5">
              {/* Button 1: Click to Add LINE */}
              <a
                id="btn-welcome-add-line"
                href={sponsor.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactEvent('line', sponsor.sponsorId)}
                className="w-full py-3.5 px-5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 text-center min-h-[48px] active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>คลิกแอด LINE สปอนเซอร์ทันที</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>

              {/* Button 2: QR Code Scan Toggle */}
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-slate-300 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <QrCode className="w-4 h-4 text-slate-700" />
                <span>{showQrCode ? 'ซ่อน QR Code' : 'หรือ สแกน QR Code เพื่อแอด LINE'}</span>
              </button>

              {/* QR Code Container */}
              {showQrCode && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-xs text-slate-600 mb-3">
                    ใช้กล้องมือถือหรือแอป LINE สแกน QR Code ด้านล่างนี้:
                  </p>
                  <img
                    src={lineQrUrl}
                    alt="LINE QR Code"
                    className="w-48 h-48 mx-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                  />
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600">
                    <span>LINE ID: <strong className="font-mono text-slate-900">{sponsor.lineId}</strong></span>
                    <button
                      type="button"
                      onClick={copyLineId}
                      className="text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                    >
                      {copiedLineId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLineId ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Finish */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับไปหน้าฟอร์ม</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-700 hover:text-slate-900 font-semibold underline cursor-pointer"
              >
                เสร็จสิ้น / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
