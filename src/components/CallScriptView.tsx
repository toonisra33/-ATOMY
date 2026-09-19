import React, { useState, useEffect } from 'react';
import {
  Phone,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  Calendar,
  AlertCircle,
  Clock,
  Send,
  Zap,
} from 'lucide-react';
import { LeadSubmission } from '../lib/firebase';
import { SponsorProfile } from '../types';

interface CallScriptViewProps {
  leads: LeadSubmission[];
  sponsor: SponsorProfile;
  selectedLead: LeadSubmission | null;
  onSelectLead: (lead: LeadSubmission | null) => void;
  onStatusChange?: (leadId: string, status: 'new' | 'contacted' | 'completed') => void;
}

export const CallScriptView: React.FC<CallScriptViewProps> = ({
  leads,
  sponsor,
  selectedLead,
  onSelectLead,
  onStatusChange,
}) => {
  // Timer state (120 seconds = 2 minutes)
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(120);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Dynamic placeholders based on selected lead
  const prospectName = selectedLead?.fullName || 'ผู้มุ่งหวัง';
  const sponsorName = sponsor.sponsorName || 'ที่ปรึกษา Atomy';
  const prospectPhone = selectedLead?.phoneNumber || '';
  const prospectAge = selectedLead?.age ? `${selectedLead.age} ปี` : null;
  const prospectOccupation = selectedLead?.occupation || null;

  // Pre-filled LINE follow up message
  const followUpLineMessage = `สวัสดีครับ/ค่ะคุณ ${prospectName} ตามที่คุยสายกันเมื่อสักครู่นะครับ 🙏
เพื่อรับสิทธิ์เปิดรหัสสมาชิก Atomy ฟรี 100% และล็อคตำแหน่งสายงานที่ดีที่สุด:

👉 รบกวนพิมพ์เลข "88" ส่งเข้ามาในช่องแชทนี้ได้เลยครับ ✨
ระบบตอบกลับอัตโนมัติจะแจ้งให้ลงข้อมูลทิ้งไว้:
1️⃣ ชื่อ-นามสกุล
2️⃣ เบอร์โทรศัพท์
3️⃣ อีเมล
4️⃣ ภาพถ่ายบัตรประชาชน หน้า/หลัง 📸

🔒 ทางผม (สปอนเซอร์) จะทำหน้าที่คีย์สมัครสมาชิกและเลือกวางตำแหน่งสายงาน (2 สายงาน) ที่เติบโตเร็วที่สุดให้พี่เองครับ
เมื่อลงข้อมูลเรียบร้อยแล้ว ก็นั่งรอการติดต่อกลับพร้อมส่งรหัสสมาชิกและห้องเรียนรู้งานจากผมได้เลยครับ 🚀`;

  const fullSpokenScript = `สวัสดีครับคุณ ${prospectName} ... ผม ${sponsorName} ที่ปรึกษาจากระบบ Atomy นะครับ ที่คุณ ${prospectName} ได้ฝากข้อมูลสร้างรายได้เสริมไว้ในหน้าเว็บครับ สะดวกคุยสั้นๆ สัก 1-2 นาทีไหมครับ?

พอดีในระบบมีคลิปบรรยายสั้นๆ 15 นาที ไม่แน่ใจว่าคุณ ${prospectName} ได้มีโอกาสกดดูหรือยังครับ?
(ถ้าดูแล้ว) : ยอดเยี่ยมเลยครับ ชอบตรงที่ไม่ต้องสต็อกของ หรือชอบตรงที่สร้างรายได้ต่อเนื่องแบบ Passive ครับ?
(ถ้ายังไม่ได้ดู) : ไม่เป็นไรเลยครับ ดีแล้วที่โทรมาบอกก่อน เพราะคลิปแค่ 15 นาที อธิบายวิธีเปลี่ยนของใช้ในบ้านให้เป็นเงินหลักหมื่นหลักแสนไว้อย่างชัดเจนเลยครับ

ที่ผมรีบติดต่อคุณ ${prospectName} วันนี้ เพราะทีมงานกำลังรันผังองค์กรสายงานรอบใหม่ และมี 3 สิทธิประโยชน์ฟรีพิเศษ ที่ไม่อยากให้เสียโอกาสครับ:
1. สมัครฟรี 100% ไม่มีค่าแรกเข้า ไม่มีต่ออายุรายปี ไม่มีความเสี่ยงแม้แต่บาทเดียว
2. สิทธิ์จองตำแหน่งต้นสายทีมงาน สปอนเซอร์จะเป็นคนเลือกจัดวางสายงานให้พี่เอง เพื่อให้ได้รับคะแนน PV ดันขึ้นมาเต็มที่
3. รับฟรี! ลิงก์ระบบเว็บขยายงานอัตโนมัติ มีคลิปทำงานแทน 24 ชม. พร้อมห้องเทรนนิ่งฟรีตลอดชีพครับ

ขั้นตอนที่ง่ายและไวที่สุดตอนนี้ เพื่อให้ผมคีย์สมัครและเลือกสายงานที่ดีที่สุดให้พี่ทันที:
ให้คุณ ${prospectName} เปิดแอป LINE ของผมนะครับ แล้ว "พิมพ์เลข 88" ส่งเข้ามาในช่องแชทได้เลยครับ
พอกด 88 ปุ๊บ ระบบจะแจ้งให้ส่งข้อมูล 4 อย่างทิ้งไว้ คือ ชื่อ-นามสกุล เบอร์โทร อีเมล และภาพถ่ายบัตรประชาชนหน้า-หลัง
ที่ให้ส่งข้อมูลทิ้งไว้เพื่อให้ผม (สปอนเซอร์) เป็นคนคีย์สมัครสมาชิกให้โดยตรง เพราะผมจะทำหน้าที่วิเคราะห์และเลือกวางตำแหน่งสายงานที่เติบโตเร็วที่สุดให้พี่เองครับ
ส่งข้อมูลครบแล้ว พี่ก็นั่งรอการติดต่อกลับจากผมได้เลยครับ! เมื่อผมลงทะเบียนเสร็จเรียบร้อยแล้ว จะรีบโทรกลับพร้อมส่งรหัสสมาชิกและดึงเข้ากลุ่มเรียนรู้งานทันทีครับ สะดวกเปิด LINE พิมพ์ 88 ส่งมาตอนนี้เลยนะครับ เดี๋ยวผมรอรับข้อมูลครับ!`;

  return (
    <div className="space-y-4">
      {/* Top Banner & Timer Bar */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-950/70 via-slate-950 to-indigo-950/70 rounded-2xl border border-blue-800/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  สคริปต์โทรปิดการสมัครใน 2 นาที
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  เป้าหมาย: พิมพ์ 88 ใน LINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                คุยกระชับ นำเสนอ 3 สิทธิ์ฟรี และปิดให้ผู้มุ่งหวังพิมพ์ "88" ใน LINE เพื่อส่งข้อมูลทิ้งไว้ให้สปอนเซอร์เป็นคนคีย์สมัครและเลือกสายงานที่ดีที่สุดให้
              </p>
            </div>
          </div>

          {/* 2-Minute Stopwatch Control */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 self-start sm:self-auto shrink-0 shadow-inner">
            <Clock className="w-4 h-4 text-slate-400" />
            <span
              className={`font-mono font-bold text-sm sm:text-base ${
                timeLeft > 40
                  ? 'text-emerald-400'
                  : timeLeft > 15
                  ? 'text-amber-400'
                  : 'text-rose-400 animate-pulse'
              }`}
            >
              {formatTimer(timeLeft)}
            </span>
            <div className="h-4 w-px bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={toggleTimer}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isTimerRunning ? 'หยุดชั่วคราว' : 'เริ่มจับเวลา 2 นาที'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer transition-colors"
              title="รีเซ็ตเวลา 2 นาที"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar for 120s */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              timeLeft > 40 ? 'bg-emerald-500' : timeLeft > 15 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${(timeLeft / 120) * 100}%` }}
          />
        </div>
      </div>

      {/* Prospect Selector & Info Card */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>เลือกผู้มุ่งหวังเพื่อแทนที่ชื่อในบทพูดอัตโนมัติ:</span>
          </label>
          {leads.length > 0 && (
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                onSelectLead(found || null);
              }}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs cursor-pointer"
            >
              <option value="">-- บทพูดทั่วไป (ไม่ได้เลือกรายชื่อ) --</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.fullName} {lead.phoneNumber ? `(${lead.phoneNumber})` : ''} {lead.occupation ? `• ${lead.occupation}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected Prospect Details Preview */}
        {selectedLead && (
          <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-slate-400">ชื่อ: </span>
                <strong className="text-white text-sm">{selectedLead.fullName}</strong>
              </div>
              {prospectAge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>อายุ: {prospectAge}</span>
                </span>
              )}
              {prospectOccupation && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 border border-slate-700">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  <span>อาชีพ: {prospectOccupation}</span>
                </span>
              )}
              {selectedLead.lineId && (
                <span className="text-slate-400 font-mono">
                  LINE: <strong className="text-emerald-400">{selectedLead.lineId}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {prospectPhone && (
                <a
                  href={`tel:${prospectPhone}`}
                  onClick={() => {
                    if (!isTimerRunning && timeLeft === 120) setIsTimerRunning(true);
                    if (onStatusChange && selectedLead.id) {
                      onStatusChange(selectedLead.id, 'contacted');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>โทรหาคุณ {selectedLead.fullName.split(' ')[0]}</span>
                </a>
              )}
              {selectedLead.id && onStatusChange && (
                <button
                  type="button"
                  onClick={() => onStatusChange(selectedLead.id!, 'completed')}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="ทำเครื่องหมายว่าปิดการสมัครแล้ว"
                >
                  บันทึกว่าปิดสมัครแล้ว
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Script 4-Step Walkthrough */}
      <div className="space-y-3">
        {/* Step 1 */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 relative hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-white">
                ทักทายสร้างสายสัมพันธ์ + ขอเวลาสั้นๆ
              </h5>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
              ⏱️ 0:00 - 0:25 นาที
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-1.5">
            <p>
              "สวัสดีครับคุณ <span className="font-bold text-emerald-400 underline decoration-emerald-500/50">{prospectName}</span> ... ผม <span className="font-semibold text-blue-400">{sponsorName}</span> ที่ปรึกษาจากระบบ Atomy นะครับ ที่คุณ <span className="font-bold text-emerald-400">{prospectName}</span> ได้ฝากข้อมูลสร้างรายได้เสริมไว้ในหน้าเว็บครับ สะดวกคุยสั้นๆ สัก 1-2 นาทีไหมครับ?"
            </p>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 italic">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>เคล็ดลับ: น้ำเสียงเป็นมิตร สดใส ไม่เร่งรัด ทำให้เขารู้สึกปลอดภัยว่าเราโทรมาให้คำปรึกษา ไม่ใช่ขายตรงทั่วไป</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 relative hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-white">
                เช็คการดูคลิป 15 นาที + ล็อคจุดเด่นที่ชอบ
              </h5>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
              ⏱️ 0:25 - 0:50 นาที
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <p>
              "พอดีในระบบมีคลิปบรรยายสั้นๆ 15 นาที ไม่แน่ใจว่าคุณ <span className="font-bold text-emerald-400">{prospectName}</span> ได้มีโอกาสกดดูหรือยังครับ?"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/80 text-[11px] sm:text-xs">
              <div className="bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/50">
                <strong className="text-emerald-400 block mb-1">✅ กรณี: ดูคลิปแล้ว</strong>
                <p className="text-slate-300">
                  "ยอดเยี่ยมเลยครับ ชอบตรงที่ไม่ต้องสต็อกของ หรือชอบตรงที่สร้างรายได้ต่อเนื่องแบบ Passive ครับ?"
                </p>
              </div>
              <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-900/50">
                <strong className="text-amber-400 block mb-1">⏳ กรณี: ยังไม่ได้ดู / ยังดูไม่จบ</strong>
                <p className="text-slate-300">
                  "ไม่เป็นไรเลยครับ ดีแล้วที่โทรมาบอกก่อน เพราะคลิปแค่ 15 นาที แต่อธิบายวิธีเปลี่ยนของใช้ในบ้านให้เป็นเงินแสนไว้ชัดเจนมากครับ"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950/50 to-slate-950 border border-blue-700/60 relative hover:border-blue-500 transition-colors shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center shrink-0">
                3
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                <span>ข้อเสนอที่ไม่อาจปฏิเสธได้ (3 สิทธิ์ฟรี + ต้นสาย)</span>
              </h5>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
              ⏱️ 0:50 - 1:30 นาที
            </span>
          </div>
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <p>
              "ที่ผมรีบติดต่อคุณ <span className="font-bold text-emerald-400">{prospectName}</span> วันนี้ เพราะทีมงานเรากำลังรันผังองค์กรสายงานรอบใหม่ และมี <strong className="text-amber-300">3 สิทธิประโยชน์ฟรีพิเศษ</strong> ที่ไม่อยากให้เสียโอกาสครับ:"
            </p>
            <ul className="space-y-1.5 pl-2 text-slate-300 text-xs">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">1.</span>
                <span><strong className="text-white">สมัครเปิดรหัสฟรี 100%:</strong> ไม่มีค่าแรกเข้า ไม่มีต่ออายุรายปี ไม่บังคับซื้อของแม้แต่ชิ้นเดียว ความเสี่ยงเป็นศูนย์</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">2.</span>
                <span><strong className="text-white">สิทธิ์จองตำแหน่งต้นสายทีมงาน:</strong> ผัง 2 สายงาน สปอนเซอร์จะเป็นผู้ดูแลคีย์สมัครและเลือกวางตำแหน่งสายงานที่ดีที่สุดให้คุณ {prospectName} เพื่อรับคะแนน PV ดันขึ้นจากทีมงานเต็มที่</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">3.</span>
                <span><strong className="text-white">รับฟรี! ลิงก์ระบบเว็บขยายงานออโต้:</strong> แบบที่คุณเพิ่งเปิดดู มีคลิปทำงานแทน 24 ชม. พร้อมห้องเทรนนิ่งฟรีตลอดชีพครับ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/60 border-2 border-[#06C755]/80 relative shadow-lg shadow-emerald-500/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#06C755] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                4
              </span>
              <h5 className="text-xs sm:text-sm font-extrabold text-[#06C755] flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 fill-[#06C755]" />
                <span>ขั้นตอนปิดการสมัคร: สั่งพิมพ์ "88" ใน LINE &rarr; ส่งข้อมูล &rarr; รอสปอนเซอร์วางสายงานให้</span>
              </h5>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
              ⏱️ 1:30 - 2:00 นาที
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <p>
              "ขั้นตอนที่ง่ายและไวที่สุดตอนนี้ เพื่อให้ผมคีย์สมัครและเลือกสายงานที่ดีที่สุดให้พี่ทันที:
            </p>
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-100 text-xs sm:text-sm font-medium space-y-2">
              <p>
                "ให้คุณ <span className="font-bold text-white underline">{prospectName}</span> เปิดแอป LINE ของผมนะครับ แล้ว <strong className="text-amber-300 text-sm font-extrabold bg-emerald-900/90 px-2 py-0.5 rounded border border-amber-400">พิมพ์เลข '88'</strong> ส่งเข้ามาในช่องแชทได้เลยครับ
              </p>
              <p className="text-slate-200">
                พอกด 88 ปุ๊บ ใน LINE จะมีข้อความตอบกลับอัตโนมัติแจ้งให้คุณ <span className="font-bold text-white">{prospectName}</span> ส่งข้อมูล 4 อย่างทิ้งไว้ คือ:
                <br />
                <span className="text-amber-300 font-semibold">1. ชื่อ-นามสกุล | 2. เบอร์โทรศัพท์ | 3. อีเมล | 4. ภาพถ่ายบัตรประชาชน หน้า/หลัง</span>
              </p>
              <p className="text-emerald-200">
                💡 <strong className="text-white underline">ที่ให้ส่งข้อมูลทิ้งไว้ใน LINE เพื่อให้ผม (สปอนเซอร์) เป็นคนคีย์สมัครให้โดยตรง</strong> เพราะในผัง 2 สายงานของ Atomy ผมจะทำหน้าที่วิเคราะห์และเลือกวางตำแหน่งสายงานที่ดีและเติบโตเร็วที่สุดให้พี่เองครับ พี่จะได้ไม่ต้องยุ่งยากคีย์เอง และได้เปรียบเรื่องคะแนน PV สะสมทันที!
              </p>
              <p className="text-white font-semibold pt-1 border-t border-emerald-700/60">
                ส่งข้อมูลครบแล้ว พี่ก็นั่งรอการติดต่อกลับจากผมได้เลยครับ! เมื่อผมลงทะเบียนเสร็จสิ้น จะรีบโทรกลับพร้อมส่งรหัสสมาชิกและดึงเข้ากลุ่มเรียนรู้งานทันทีครับ สะดวกเปิด LINE พิมพ์ 88 ตอนนี้เลยนะครับ เดี๋ยวผมรอรับข้อมูลเลยครับ!"
              </p>
            </div>
          </div>

          {/* Visual Mockup of LINE Auto-Reply */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/90 border border-emerald-900/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1.5 border-b border-slate-800">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#06C755]" />
                <span>ตัวอย่างข้อความตอบกลับอัตโนมัติใน LINE เมื่อผู้มุ่งหวังพิมพ์ "88" :</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                LINE Auto-Reply
              </span>
            </div>
            
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-sans text-xs text-slate-200 space-y-1.5">
              <p className="font-bold text-white">ลงทะเบียนกับอะโทมี่ง่ายๆ ตามนี้ครับ :</p>
              <div className="pl-1 space-y-1 text-slate-300 font-medium">
                <p>1️⃣ ชื่อ-นามสกุล</p>
                <p>2️⃣ เบอร์โทรศัพท์</p>
                <p>3️⃣ อีเมล</p>
                <p>4️⃣ ภาพถ่ายบัตรประชาชน หน้า/หลัง 📸</p>
              </div>
              <p className="pt-1.5 text-emerald-300 font-medium">
                กรอกข้อมูลครบแล้ว ก็รอการติดต่อกลับจากผมได้เลยครับ 🚀
              </p>
              <p className="text-amber-300 text-[11px]">
                อย่าลืม!!! ถ่ายภาพบัตร ปปช ให้ชัดเจนตามตัวอย่างด้านล่างครับ
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-blue-300 bg-blue-950/50 p-2 rounded-lg border border-blue-900/50">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>หน้าที่ของสปอนเซอร์:</strong> นำข้อมูลไปคีย์สมัครในระบบทางการของ Atomy &rarr; เลือกตำแหน่งผังสายงานที่ดีที่สุด &rarr; ติดต่อกลับแจ้งรหัสสมาชิกให้ผู้มุ่งหวัง
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Actions & Quick Follow Up */}
      <div className="p-3 sm:p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyText(fullSpokenScript, 'full_script')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold cursor-pointer transition-colors border border-slate-700"
          >
            {copiedSection === 'full_script' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">คัดลอกบทพูดทั้งหมดแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอกบทพูดทั้งหมด</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => copyText(followUpLineMessage, 'line_msg')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl font-semibold cursor-pointer transition-colors shadow-xs"
          >
            {copiedSection === 'line_msg' ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>คัดลอกข้อความทัก LINE แล้ว!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>คัดลอกข้อความพิมพ์ 88 ส่งเข้า LINE</span>
              </>
            )}
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          💡 หากผู้มุ่งหวังไม่รับสาย ให้กดคัดลอกข้อความ LINE ส่งไปทักได้ทันที
        </span>
      </div>

      {/* Quick Objection Handling FAQ Accordion */}
      <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>เทคนิคตอบข้อโต้แย้งแบบเร็ว (Quick Objection Handling):</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* FAQ 1 */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
              className="w-full px-3 py-2 text-left text-slate-200 font-semibold flex items-center justify-between hover:bg-slate-800/60 cursor-pointer"
            >
              <span>❓ "ไม่เคยทำธุรกิจแนวนี้ / กลัวทำไม่ได้ / ไม่มีเวลา"</span>
              {expandedFaq === 1 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedFaq === 1 && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] sm:text-xs leading-relaxed border-t border-slate-800/60 pt-2 bg-slate-900/90">
                💬 <strong>ตอบ:</strong> "เข้าใจเลยครับ คนในทีมกว่า 90% ทำงานประจำและเริ่มจากศูนย์เหมือนกัน เพราะที่นี่เราไม่ใช้การตื๊อขายของ แต่เรามีระบบเว็บไซต์และคลิป 15 นาทีทำงานอธิบายแทน 24 ชั่วโมงครับ แค่พิมพ์ 88 ใน LINE แล้วลงข้อมูลทิ้งไว้ สปอนเซอร์จะจัดวางสายงานให้ และดึงเข้าห้องเรียนรู้งานออนไลน์ทันที ไม่มีข้อผูกมัดใดๆ ครับ"
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
              className="w-full px-3 py-2 text-left text-slate-200 font-semibold flex items-center justify-between hover:bg-slate-800/60 cursor-pointer"
            >
              <span>❓ "ต้องซื้อสินค้าหรือมีค่าใช้จ่ายอะไรไหม?"</span>
              {expandedFaq === 2 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedFaq === 2 && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] sm:text-xs leading-relaxed border-t border-slate-800/60 pt-2 bg-slate-900/90">
                💬 <strong>ตอบ:</strong> "สบายใจได้ 100% เลยครับ เพราะ <strong>0 บาท</strong> จริงๆ ครับ ไม่มีค่าสมัคร ไม่มีค่าธรรมเนียม และไม่มีบังคับสต็อกสินค้าแม้แต่ชิ้นเดียว เป็นสิทธิ์ผู้บริโภคในการซื้อของใช้คุณภาพเกาหลีที่ต้องใช้อยู่แล้ว เพื่อสะสมคะแนนรับเงินคืนตลอดชีพครับ แค่พิมพ์ 88 ใน LINE แล้วลงข้อมูลให้สปอนเซอร์คีย์สมัครให้ได้เลยครับ"
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
              className="w-full px-3 py-2 text-left text-slate-200 font-semibold flex items-center justify-between hover:bg-slate-800/60 cursor-pointer"
            >
              <span>❓ "ขอคิดดูก่อน / ขอปรึกษาแฟนก่อน"</span>
              {expandedFaq === 3 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedFaq === 3 && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] sm:text-xs leading-relaxed border-t border-slate-800/60 pt-2 bg-slate-900/90">
                💬 <strong>ตอบ:</strong> "ได้เลยครับ ปรึกษาได้เต็มที่เลยครับ แต่เหตุผลที่ผมแนะนำให้พิมพ์ 88 แล้วลงข้อมูลใน LINE ไว้ก่อนตอนนี้ เพราะการเปิดรหัสไม่มีค่าใช้จ่ายและไม่มีความเสี่ยงใดๆ แต่จะช่วยให้สปอนเซอร์ <strong>ล็อคตำแหน่งต้นสายในผังทีมงาน</strong> ไว้ก่อน หากมีคนใหม่สมัครเข้ามาหลังจากนี้ เขาจะอยู่ใต้ผังของคุณทันทีครับ พิมพ์ 88 ไว้ก่อนเพื่อความได้เปรียบสูงสุดครับ"
              </div>
            )}
          </div>

          {/* FAQ 4: Why sponsor registers & ID card */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <button
              type="button"
              onClick={() => setExpandedFaq(expandedFaq === 4 ? null : 4)}
              className="w-full px-3 py-2 text-left text-slate-200 font-semibold flex items-center justify-between hover:bg-slate-800/60 cursor-pointer"
            >
              <span>❓ "ทำไมต้องให้สปอนเซอร์เป็นคนสมัครให้ และทำไมต้องส่งภาพบัตร ปปช.?"</span>
              {expandedFaq === 4 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expandedFaq === 4 && (
              <div className="px-3 pb-3 text-slate-300 text-[11px] sm:text-xs leading-relaxed border-t border-slate-800/60 pt-2 bg-slate-900/90 space-y-1.5">
                <p>
                  💬 <strong>ตอบ:</strong> "มี 2 เหตุผลสำคัญที่ทำให้พี่ได้ประโยชน์สูงสุดครับ:"
                </p>
                <p>
                  1. <strong>เรื่องบัตรประชาชน:</strong> เพื่อยืนยันตัวตน (KYC) ตาม พ.ร.บ. ขายตรงและตลาดแบบตรงของ สคบ. เพื่อป้องกันการสวมสิทธิ์ และใช้ผูกบัญชีรับเงินโอนปันผลเข้าบัญชีจริงของพี่ครับ ข้อมูลปลอดภัย 100%
                </p>
                <p>
                  2. <strong>เรื่องให้สปอนเซอร์เป็นคนสมัครให้:</strong> เพราะ Atomy เป็นผัง 2 สายงาน (Binary) การวางตำแหน่งสำคัญมาก สปอนเซอร์ผู้มีประสบการณ์จะช่วยวิเคราะห์และเลือกวางตำแหน่งสายงานที่ดีที่สุดให้พี่ เพื่อให้พี่ได้รับคะแนน PV ดันขึ้นมาจากทีมงานเต็มที่ครับ เมื่อส่งข้อมูลเสร็จแล้ว พี่เพียงแค่นั่งรอการติดต่อกลับพร้อมรับรหัสสมาชิกได้เลยครับ"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
