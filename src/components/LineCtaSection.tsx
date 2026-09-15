import React, { useState } from 'react';
import { SponsorProfile } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { MessageCircle, Copy, Check, QrCode, ArrowRight, ShieldCheck, Sparkles, Send, UserCheck, Loader2, Users } from 'lucide-react';
import { submitLead } from '../lib/firebase';
import { trackLeadEvent, trackContactEvent } from '../lib/pixel';

interface LineCtaSectionProps {
  sponsor: SponsorProfile;
  onOpenLeadsModal?: () => void;
}

export const LineCtaSection: React.FC<LineCtaSectionProps> = ({ sponsor, onOpenLeadsModal }) => {
  const [copiedLineId, setCopiedLineId] = useState<boolean>(false);
  const [copiedSponsorId, setCopiedSponsorId] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Firestore Lead Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [prospectLineId, setProspectLineId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const prefilledMessage = `สวัสดีครับ/ค่ะ สนใจสมัครสมาชิก Atomy รับรหัสสปอนเซอร์ ${sponsor.sponsorId} ดูคลิปบรรยาย 15 นาทีเรียบร้อยแล้ว ต้องการคำแนะนำเปิดรหัสสมาชิกฟรีครับ/ค่ะ`;

  const copyToClipboard = (text: string, type: 'line' | 'sponsor' | 'message') => {
    navigator.clipboard.writeText(text);
    if (type === 'line') {
      setCopiedLineId(true);
      trackContactEvent('line', sponsor.sponsorId);
      setTimeout(() => setCopiedLineId(false), 2000);
    } else if (type === 'sponsor') {
      setCopiedSponsorId(true);
      trackContactEvent('line', sponsor.sponsorId);
      setTimeout(() => setCopiedSponsorId(false), 2000);
    } else if (type === 'message') {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('กรุณาระบุชื่อและเบอร์โทรศัพท์');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await submitLead({
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        lineId: prospectLineId.trim() || '',
        sponsorId: sponsor.sponsorId,
        sponsorName: sponsor.sponsorName,
      });

      // Fire Pixel Lead Conversion Event across Meta, TikTok, and Google
      trackLeadEvent({
        fullName: fullName.trim(),
        sponsorId: sponsor.sponsorId,
        sponsorName: sponsor.sponsorName,
      });

      setSubmitSuccess(true);
      setFullName('');
      setPhone('');
      setProspectLineId('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อทาง LINE โดยตรง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lineQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(sponsor.lineUrl)}`;

  return (
    <section id="line-official" className="py-10 sm:py-24 bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 md:p-12 shadow-2xl shadow-emerald-500/10 border-2 border-emerald-500/30 relative overflow-hidden">
          {/* Top Decorative Banner */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06C755]/10 text-[#05963f] text-xs sm:text-sm font-semibold mb-3">
              <MessageCircle className="w-3.5 h-3.5 fill-[#06C755] shrink-0" />
              <span>ช่องทางติดต่อหลักผ่าน LINE Official</span>
            </div>

            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              <span className="inline-block">เริ่มต้นก้าวแรก:</span>{' '}
              <span className="text-[#06C755] inline-block">แอด LINE สปอนเซอร์</span>{' '}
              <span className="inline-block">เพื่อรับรหัสฟรี</span>
            </h2>
            <p className="mt-2.5 sm:mt-3 text-slate-600 text-xs sm:text-base leading-relaxed text-pretty">
              การเปิดรหัสสมาชิก Atomy จำเป็นต้องใช้ <strong className="font-semibold text-slate-800">รหัสสปอนเซอร์</strong> เพื่อรับสิทธิ์ทีมงานและพี่เลี้ยงดูแลตลอดเส้นทางธุรกิจ
            </p>
          </div>

          {/* Sponsor Profile & Quick Contact Summary */}
          <div className="mt-6 sm:mt-8 p-3.5 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <img
                src={sponsor.avatarUrl || DEFAULT_SPONSOR.avatarUrl}
                alt={sponsor.sponsorName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {sponsor.sponsorName}
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-700 font-semibold truncate">
                  {sponsor.sponsorPosition} • {sponsor.teamName}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate hidden xs:block">
                  ยินดีให้คำปรึกษา แนะนำการสมัคร และส่งต่อเครื่องมือการทำงานฟรี
                </p>
              </div>
            </div>

            {/* Sponsor ID copy badge */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto shrink-0">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono">รหัสสปอนเซอร์:</span>
                <span className="text-xs sm:text-sm font-bold text-blue-700 font-mono">{sponsor.sponsorId}</span>
              </div>
              <button
                id="btn-copy-sponsor-id"
                onClick={() => copyToClipboard(sponsor.sponsorId, 'sponsor')}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="คัดลอกรหัสสปอนเซอร์"
              >
                {copiedSponsorId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button Grid */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-3.5">
            {/* Direct LINE Link Button */}
            <a
              id="btn-main-line-cta"
              href={sponsor.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContactEvent('line', sponsor.sponsorId)}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#06C755] hover:bg-[#05b34c] text-white text-sm sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-95 text-center min-h-[48px]"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white shrink-0" />
              <span>คลิกเพื่อแอด LINE Official ทันที</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 shrink-0" />
            </a>

            {/* Open QR Code Button (For desktop users) */}
            <button
              id="btn-show-qr-code"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-base font-semibold rounded-xl sm:rounded-2xl transition-colors border border-slate-200 cursor-pointer shadow-2xs min-h-[44px]"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 shrink-0" />
              <span>สแกน QR Code</span>
            </button>
          </div>

          {/* Copy LINE ID quick bar */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <span>LINE ID:</span>
              <strong className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200">
                {sponsor.lineId}
              </strong>
            </span>
            <button
              onClick={() => copyToClipboard(sponsor.lineId, 'line')}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
            >
              {copiedLineId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>คัดลอกแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก LINE ID</span>
                </>
              )}
            </button>

            {sponsor.phoneNumber && (
              <span className="flex items-center gap-1 text-slate-500">
                <span>• โทร:</span>
                <a href={`tel:${sponsor.phoneNumber}`} className="text-blue-600 font-semibold hover:underline">
                  {sponsor.phoneNumber}
                </a>
              </span>
            )}
          </div>

          {/* Pre-composed Message Box for Convenience */}
          <div className="mt-6 sm:mt-8 p-3.5 sm:p-5 bg-emerald-50/60 rounded-xl sm:rounded-2xl border border-emerald-200/80 text-left">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>ข้อความแนะนำส่งหาสปอนเซอร์ใน LINE:</span>
              </span>
              <button
                onClick={() => copyToClipboard(prefilledMessage, 'message')}
                className="text-[11px] sm:text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-emerald-300 shadow-2xs shrink-0"
              >
                {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 bg-white/90 p-2.5 sm:p-3 rounded-xl border border-emerald-200/60 font-mono leading-relaxed">
              "{prefilledMessage}"
            </p>
          </div>

          {/* Quick Consultation Request Form (Firebase Firestore Integration) */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-slate-50/90 rounded-xl sm:rounded-2xl border border-slate-200 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  หรือฝากข้อมูลให้ {sponsor.sponsorName} ติดต่อกลับ
                </h3>
              </div>
              {onOpenLeadsModal && (
                <button
                  type="button"
                  onClick={onOpenLeadsModal}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                  title="ดูรายชื่อที่กรอกเข้ามาในระบบ"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>เปิดดูกล่องรายชื่อ (Leads Inbox)</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed text-pretty">
              ข้อมูลจะถูกบันทึกเข้า Cloud Firestore และส่งสัญญาณ Pixel ทันที เพื่อให้ที่ปรึกษาติดต่อแนะนำการสมัครสมาชิกฟรี
            </p>

            {submitSuccess ? (
              <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">ส่งข้อมูลสำเร็จเรียบร้อยแล้ว!</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    {sponsor.sponsorName} จะติดต่อกลับเพื่อให้ข้อมูลและแนะนำการเปิดรหัสสมาชิกโดยเร็วที่สุด
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                {errorMessage && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อ-นามสกุล *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 0812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      LINE ID (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น somchai.line"
                      value={prospectLineId}
                      onChange={(e) => setProspectLineId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <span>ส่งข้อมูลเพื่อขอคำแนะนำ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Guarantees */}
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-500 text-center">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span>การันตีไม่มีการบังคับซื้อสินค้า</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span>รับสิทธิ์เข้าห้องเรียนออนไลน์ฟรี</span>
            </span>
          </div>

        </div>

      </div>

      {/* QR Code Modal for Mobile Scanning */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900">
              สแกน QR Code ด้วยมือถือ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              เปิดแอป LINE บนมือถือ แล้วสแกนเพื่อเพิ่มเพื่อนกับ {sponsor.sponsorName}
            </p>

            <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={lineQrUrl}
                alt="LINE QR Code"
                className="w-52 h-52 mx-auto rounded-lg"
              />
            </div>

            <div className="mt-4 text-xs font-mono text-slate-600">
              LINE ID: <strong className="text-slate-900 font-bold">{sponsor.lineId}</strong>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
