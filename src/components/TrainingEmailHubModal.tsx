/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TrainingEmailHubModal.tsx
 * ศูนย์จัดการและดูตัวอย่างจดหมายอีเมลส่งอัตโนมัติ 7 วัน (7-Day Automated Email Hub)
 */

import React, { useState } from "react";
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  ExternalLink,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  UserCheck
} from "lucide-react";
import {
  TRAINING_EMAIL_TEMPLATES,
  generateFormattedEmail,
  TrainingEmailTemplate
} from "../data/trainingEmailTemplates";
import {
  getEmailDispatches,
  recordEmailDispatch,
  getProspectLearnerSession
} from "../lib/trainingProgress";
import { ADMIN_EMAILS } from "../lib/auth";
import { SponsorProfile } from "../types";

interface TrainingEmailHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
  currentDay?: number;
}

export const TrainingEmailHubModal: React.FC<TrainingEmailHubModalProps> = ({
  isOpen,
  onClose,
  sponsor,
  currentDay = 1,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedAll7, setCopiedAll7] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [targetRecipient, setTargetRecipient] = useState<"prospect" | "admin">("admin");

  if (!isOpen) return null;

  const adminEmail = ADMIN_EMAILS[0] || "toonisra33@gmail.com";
  const adminName = "คุณอิสระ (แอดมิน)";

  const learnerSession = getProspectLearnerSession();
  const prospectName = learnerSession?.fullName || "คุณสมชาย (ผู้มุ่งหวัง)";
  const prospectEmail = learnerSession?.email || "prospect@example.com";

  const isTargetAdmin = targetRecipient === "admin";
  const currentRecipientName = isTargetAdmin ? adminName : prospectName;
  const currentRecipientEmail = isTargetAdmin ? adminEmail : prospectEmail;

  const emailData = generateFormattedEmail(
    selectedDay,
    currentRecipientName,
    sponsor.sponsorName,
    sponsor.lineId,
    typeof window !== "undefined" ? window.location.origin : "",
    currentRecipientEmail
  );

  const dispatches = getEmailDispatches();
  const dayDispatches = dispatches.filter((d) => d.dayNumber === selectedDay);

  const handleCopyBody = () => {
    navigator.clipboard.writeText(emailData.textBody);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(emailData.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyAll7 = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const allTexts = [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const data = generateFormattedEmail(
        day,
        currentRecipientName,
        sponsor.sponsorName,
        sponsor.lineId,
        origin,
        currentRecipientEmail
      );
      return `========================================\n[ฉบับที่ ${day}/7] หัวข้อ: ${data.subject}\nPreheader: ${data.preheader}\n========================================\n\n${data.textBody}\n\n`;
    }).join("\n");

    navigator.clipboard.writeText(allTexts);
    setCopiedAll7(true);
    setTimeout(() => setCopiedAll7(false), 2500);
  };

  const handleSimulateSend = () => {
    recordEmailDispatch(
      selectedDay,
      currentRecipientName,
      currentRecipientEmail,
      'manual_resend'
    );
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                  Automated Email Hub
                </span>
                <span className="text-xs text-sky-200 font-medium">ระบบส่งจดหมาย 7 วัน</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                ศูนย์จัดการเนื้อหาอีเมลและลำดับการเรียนรู้ 7 วัน
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Day Selector Tabs */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 sm:p-4 overflow-y-auto shrink-0 flex md:flex-col gap-1.5 scrollbar-thin">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hidden md:block">
              เลือกลำดับบทเรียน (7 วัน)
            </div>
            {Object.values(TRAINING_EMAIL_TEMPLATES).map((template) => {
              const isSelected = selectedDay === template.dayNumber;
              const hasSent = dispatches.some((d) => d.dayNumber === template.dayNumber);

              return (
                <button
                  key={template.dayNumber}
                  type="button"
                  onClick={() => setSelectedDay(template.dayNumber)}
                  className={`flex-1 md:flex-none text-left p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "bg-white hover:bg-blue-50/60 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isSelected ? "text-white" : "text-blue-600"}`}>
                      วันที่ {template.dayNumber}
                    </span>
                    {hasSent && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                        }`}
                        title="ระบบเคยบันทึกการส่งแล้ว"
                      >
                        ✓ ส่งแล้ว
                      </span>
                    )}
                  </div>
                  <div className={`text-xs font-bold truncate mt-0.5 ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {template.phase}
                  </div>
                  <div className={`text-[10px] truncate hidden sm:block ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                    {template.badge.split("(")[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Email Content Preview & Actions */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Header info badge & Recipient Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50 rounded-2xl border border-blue-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-blue-900">
                  {emailData.template.badge}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-blue-200 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetRecipient("admin")}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isTargetAdmin
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  โหมดทดสอบแอดมิน
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRecipient("prospect")}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    !isTargetAdmin
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  โหมดผู้มุ่งหวังจริง
                </button>
              </div>
            </div>

            {/* Admin 7-Day Fast Test Kit Bar */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 rounded-2xl border border-amber-300 text-xs shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white">
                    ADMIN TEST KIT
                  </span>
                  <span className="text-xs font-bold text-amber-950">
                    ทดสอบส่งจริงเข้า Gmail: <strong className="font-mono text-amber-900 underline">{adminEmail}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAll7}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAll7 ? "✓ คัดลอกครบทั้ง 7 ฉบับแล้ว!" : "คัดลอกข้อความทั้ง 7 วัน"}</span>
                </button>
              </div>
              <div className="text-[11px] text-amber-900/80 mb-2">
                คลิกปุ่ม Day 1 - 7 ด้านล่างเพื่อเปิดหน้าต่างส่งใน Gmail จริงได้ทันที:
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const dayData = generateFormattedEmail(
                    day,
                    adminName,
                    sponsor.sponsorName,
                    sponsor.lineId,
                    typeof window !== "undefined" ? window.location.origin : "",
                    adminEmail
                  );
                  return (
                    <a
                      key={day}
                      href={dayData.gmailWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSelectedDay(day)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                        selectedDay === day
                          ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                          : "bg-white/90 hover:bg-white text-amber-950 border-amber-200 hover:border-amber-400"
                      }`}
                      title={`คลิกเปิดส่งบทเรียนวันที่ ${day} เข้า Gmail แอดมิน (${adminEmail})`}
                    >
                      <span>Day {day}</span>
                      <span className="text-[9px] font-normal opacity-85 flex items-center gap-0.5 mt-0.5">
                        ส่ง Gmail <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Email Subject Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  หัวข้ออีเมล (Subject Line):
                </span>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  {copiedSubject ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกหัวข้อ</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-sm font-extrabold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200 select-all">
                {emailData.subject}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500">
                <strong>Preheader:</strong> {emailData.preheader}
              </div>
            </div>

            {/* Simulated Email Client Preview Card */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
              {/* Mail top header */}
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-semibold text-slate-700 ml-1">จดหมายจำลองส่งถึง: {currentRecipientName}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{currentRecipientEmail}</span>
              </div>

              {/* Mail Body Rendering */}
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                <div className="border-b border-slate-100 pb-3">
                  <div className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                    {emailData.template.phase}
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {emailData.template.headline}
                  </h4>
                </div>

                <div className="p-3 bg-amber-50/70 border-l-4 border-amber-400 rounded-r-xl text-amber-900 font-medium text-xs leading-relaxed">
                  💡 {emailData.template.hook}
                </div>

                <div className="whitespace-pre-line text-slate-600">
                  {emailData.template.storyIntro
                    .replace(/{{PROSPECT_NAME}}/g, currentRecipientName)
                    .replace(/{{SPONSOR_NAME}}/g, sponsor.sponsorName)}
                </div>

                {/* Core lessons bullets */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-2">
                    🎯 สิ่งสำคัญที่คุณจะได้ค้นพบในบทเรียนนี้:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {emailData.template.coreLessons.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold shrink-0">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary CTA button inside email */}
                <div className="text-center py-2">
                  <a
                    href={emailData.trainingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <span>{emailData.template.buttonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
                    ลิงก์บทเรียน: {emailData.trainingLink}
                  </div>
                </div>

                {/* PS & Countdown notice */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                  <p className="font-medium">{emailData.template.psNote}</p>
                  <p className="text-[11px] text-blue-700">{emailData.template.countdownNotice}</p>
                </div>

                {/* Sender signature */}
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div>ด้วยความปรารถนาดีและพร้อมสนับสนุนความสำเร็จของคุณ,</div>
                  <div className="font-bold text-slate-900 mt-1">{sponsor.sponsorName}</div>
                  <div className="text-blue-600 font-medium">สปอนเซอร์ผู้ดูแลสายงาน Atomy ({sponsor.sponsorPosition})</div>
                  {sponsor.lineId && (
                    <div className="text-slate-500 text-[11px]">LINE ID: {sponsor.lineId}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBody}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">คัดลอกเนื้อหาทั้งหมดแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>คัดลอกข้อความส่ง LINE</span>
                    </>
                  )}
                </button>

                <a
                  href={emailData.gmailWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="เปิดหน้าต่างเขียนจดหมายส่งเข้า Gmail ทันที"
                >
                  <Mail className="w-4 h-4 text-white" />
                  <span>ส่งใน Gmail ({isTargetAdmin ? "แอดมิน" : "ผู้มุ่งหวัง"})</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <a
                  href={emailData.mailtoUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
                  title="เปิดในแอปเมลเริ่มต้นของเครื่องคุณ"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>เปิดแอปเมล (Mailto)</span>
                </a>
              </div>

              <button
                type="button"
                onClick={handleSimulateSend}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {dispatchSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>บันทึกประวัติการส่งสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>บันทึกการส่งหาผู้มุ่งหวัง</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
