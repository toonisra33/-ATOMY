import React, { useState } from 'react';
import { SponsorProfile } from '../types';
import { MessageCircle, Copy, Check, QrCode, ArrowRight, ShieldCheck, Sparkles, Send, PhoneCall } from 'lucide-react';

interface LineCtaSectionProps {
  sponsor: SponsorProfile;
}

export const LineCtaSection: React.FC<LineCtaSectionProps> = ({ sponsor }) => {
  const [copiedLineId, setCopiedLineId] = useState<boolean>(false);
  const [copiedSponsorId, setCopiedSponsorId] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const prefilledMessage = `สวัสดีครับ/ค่ะ สนใจสมัครสมาชิก Atomy รับรหัสสปอนเซอร์ ${sponsor.sponsorId} ดูคลิปบรรยาย 15 นาทีเรียบร้อยแล้ว ต้องการคำแนะนำเปิดรหัสสมาชิกฟรีครับ/ค่ะ`;

  const copyToClipboard = (text: string, type: 'line' | 'sponsor' | 'message') => {
    navigator.clipboard.writeText(text);
    if (type === 'line') {
      setCopiedLineId(true);
      setTimeout(() => setCopiedLineId(false), 2000);
    } else if (type === 'sponsor') {
      setCopiedSponsorId(true);
      setTimeout(() => setCopiedSponsorId(false), 2000);
    } else if (type === 'message') {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const lineQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(sponsor.lineUrl)}`;

  return (
    <section id="line-official" className="py-16 sm:py-24 bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl shadow-emerald-500/10 border-2 border-emerald-500/30 relative overflow-hidden">
          {/* Top Decorative Banner */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06C755]/10 text-[#05963f] text-xs sm:text-sm font-semibold mb-4">
              <MessageCircle className="w-4 h-4 fill-[#06C755]" />
              <span>ช่องทางติดต่อหลักผ่าน LINE Official</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              เริ่มต้นก้าวแรก: <span className="text-[#06C755]">แอด LINE สปอนเซอร์</span> เพื่อรับรหัสสมาชิกฟรี
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              การเปิดรหัสสมาชิก Atomy จำเป็นต้องใช้ <strong>รหัสสปอนเซอร์</strong> เพื่อรับสิทธิ์ทีมงานและพี่เลี้ยงดูแลตลอดเส้นทางธุรกิจ
            </p>
          </div>

          {/* Sponsor Profile & Quick Contact Summary */}
          <div className="mt-8 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <img
                src={sponsor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={sponsor.sponsorName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/20"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {sponsor.sponsorName}
                </h4>
                <p className="text-xs text-emerald-700 font-semibold">
                  {sponsor.sponsorPosition} • {sponsor.teamName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  ยินดีให้คำปรึกษา แนะนำการสมัคร และส่งต่อเครื่องมือการทำงานฟรี
                </p>
              </div>
            </div>

            {/* Sponsor ID copy badge */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono">รหัสสปอนเซอร์สำหรับสมัคร:</span>
                <span className="text-sm font-bold text-blue-700 font-mono">{sponsor.sponsorId}</span>
              </div>
              <button
                id="btn-copy-sponsor-id"
                onClick={() => copyToClipboard(sponsor.sponsorId, 'sponsor')}
                className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="คัดลอกรหัสสปอนเซอร์"
              >
                {copiedSponsorId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button Grid */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-3.5">
            {/* Direct LINE Link Button */}
            <a
              id="btn-main-line-cta"
              href={sponsor.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#06C755] hover:bg-[#05b34c] text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 text-center"
            >
              <MessageCircle className="w-6 h-6 fill-white shrink-0" />
              <span>คลิกเพื่อแอด LINE Official ทันที</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </a>

            {/* Open QR Code Button (For desktop users) */}
            <button
              id="btn-show-qr-code"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm sm:text-base font-semibold rounded-2xl transition-colors border border-slate-200 cursor-pointer shadow-2xs"
            >
              <QrCode className="w-5 h-5 text-slate-700" />
              <span>สแกน QR Code</span>
            </button>
          </div>

          {/* Copy LINE ID quick bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <span>LINE ID:</span>
              <strong className="text-slate-900 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
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
                <span>• หรือติดต่อทางโทรศัพท์:</span>
                <a href={`tel:${sponsor.phoneNumber}`} className="text-blue-600 font-semibold hover:underline">
                  {sponsor.phoneNumber}
                </a>
              </span>
            )}
          </div>

          {/* Pre-composed Message Box for Convenience */}
          <div className="mt-8 p-4 sm:p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-left">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-700" />
                <span>ข้อความแนะนำส่งหาสปอนเซอร์ใน LINE:</span>
              </span>
              <button
                onClick={() => copyToClipboard(prefilledMessage, 'message')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs"
              >
                {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 bg-white/90 p-3 rounded-xl border border-emerald-200/60 font-mono">
              "{prefilledMessage}"
            </p>
          </div>

          {/* Guarantees */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              การันตีไม่มีการบังคับซื้อสินค้า
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              รับสิทธิ์เข้าห้องเรียนออนไลน์และคู่มือทำงานฟรี
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
