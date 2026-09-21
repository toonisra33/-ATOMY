import React, { useEffect, useState } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  Check,
  Target,
  Sparkles,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { SponsorProfile } from '../types';
import {
  subscribePixelLogs,
  PixelEventLog,
  trackContactEvent,
  trackLeadEvent,
  trackContentEngagement,
  setupAllPixels,
} from '../lib/pixel';
import { saveSponsorProfile } from '../lib/firebase';

interface PixelStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
  ownerUid: string;
  onUpdatePixels?: (pixels: { fbPixelId: string; tiktokPixelId: string; googleTagId: string }) => void;
}

export const PixelStatusModal: React.FC<PixelStatusModalProps> = ({
  isOpen,
  onClose,
  sponsor,
  ownerUid,
  onUpdatePixels,
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'logs' | 'guide'>('install');
  
  // Local form state for installation
  const [fbPixelId, setFbPixelId] = useState<string>(sponsor.fbPixelId || '');
  const [tiktokPixelId, setTiktokPixelId] = useState<string>(sponsor.tiktokPixelId || '');
  const [googleTagId, setGoogleTagId] = useState<string>(sponsor.googleTagId || '');

  const [logs, setLogs] = useState<PixelEventLog[]>([]);
  const [testSent, setTestSent] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync inputs if sponsor changes
  useEffect(() => {
    if (isOpen) {
      setFbPixelId(sponsor.fbPixelId || '');
      setTiktokPixelId(sponsor.tiktokPixelId || '');
      setGoogleTagId(sponsor.googleTagId || '');
    }
  }, [isOpen, sponsor.fbPixelId, sponsor.tiktokPixelId, sponsor.googleTagId]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribePixelLogs((newLogs) => {
      setLogs([...newLogs]);
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const hasFb = Boolean(fbPixelId.trim());
  const hasTikTok = Boolean(tiktokPixelId.trim());
  const hasGoogle = Boolean(googleTagId.trim());
  const anyConfigured = hasFb || hasTikTok || hasGoogle;

  const handleSavePixels = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    const cleanFb = fbPixelId.trim();
    const cleanTikTok = tiktokPixelId.trim();
    const cleanGoogle = googleTagId.trim();

    // 1. Trigger Pixel initialization immediately in the browser
    setupAllPixels({
      fbPixelId: cleanFb,
      tiktokPixelId: cleanTikTok,
      googleTagId: cleanGoogle,
    });

    // 2. Notify parent state (App.tsx)
    if (onUpdatePixels) {
      onUpdatePixels({
        fbPixelId: cleanFb,
        tiktokPixelId: cleanTikTok,
        googleTagId: cleanGoogle,
      });
    }

    // 3. Save to the authenticated sponsor profile.
    try {
      await saveSponsorProfile({
        ...sponsor,
        fbPixelId: cleanFb,
        tiktokPixelId: cleanTikTok,
        googleTagId: cleanGoogle,
      }, ownerUid);
    } catch (err) {
      console.warn('Firebase save warning:', err);
      setSaveError('บันทึก Pixel ไม่สำเร็จ โปรดตรวจสอบสิทธิ์ของบัญชี');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleTestLeadEvent = () => {
    trackLeadEvent({
      fullName: 'ทดสอบระบบพิกเซล (Test Lead)',
      sponsorId: sponsor.sponsorId,
      sponsorName: sponsor.sponsorName,
    });
    setTestSent("ยิง Event 'Lead' สำเร็จ!");
    setTimeout(() => setTestSent(null), 3000);
  };

  const handleTestContactEvent = () => {
    trackContactEvent('line', sponsor.sponsorId);
    setTestSent("ยิง Event 'Contact' (แอด LINE) สำเร็จ!");
    setTimeout(() => setTestSent(null), 3000);
  };

  const handleTestViewContentEvent = () => {
    trackContentEngagement('วิดีโอ 20 นาที โมเดลธุรกิจ', sponsor.sponsorId);
    setTestSent("ยิง Event 'ViewContent' สำเร็จ!");
    setTimeout(() => setTestSent(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-800 relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white flex flex-wrap items-center gap-1.5 leading-snug">
              <span>ติดตั้ง & จัดการ Pixel สำหรับยิงโฆษณา</span>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                anyConfigured
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {anyConfigured ? 'Active' : 'ยังไม่ได้ติดตั้ง'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              รองรับ Meta Pixel (Facebook), TikTok Pixel และ Google Analytics 4 (GA4)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'install'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>กรอกและติดตั้ง Pixel</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ทดสอบ & บันทึกสด</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>วิธีใช้งาน / Event</span>
          </button>
        </div>

        {/* Tab 1: Install Pixel Form */}
        {activeTab === 'install' && (
          <form onSubmit={handleSavePixels} className="mt-4 space-y-4">
            
            {saveSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>บันทึกและเปิดใช้งาน Pixel สำเร็จแล้ว! ระบบเริ่มยิง PageView ทันที</span>
              </div>
            )}
            {saveError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {saveError}
              </div>
            )}

            {/* Meta Pixel Field */}
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition-colors">
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Meta (Facebook) Pixel ID</span>
                </span>
                <span className="text-[10px] text-blue-400 font-mono">ตัวเลข 15-16 หลัก</span>
              </label>
              <input
                type="text"
                value={fbPixelId}
                onChange={(e) => setFbPixelId(e.target.value)}
                placeholder="เช่น 1234567890123456"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[42px]"
              />
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>คัดลอกจาก: Meta Events Manager (ตัวจัดการเหตุการณ์) &gt; Data Sources</span>
              </p>
            </div>

            {/* TikTok Pixel Field */}
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-pink-500/40 transition-colors">
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span>TikTok Pixel ID</span>
                </span>
                <span className="text-[10px] text-pink-400 font-mono">รหัสตัวอักษร/ตัวเลข</span>
              </label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="เช่น C78AB90CDE1234 หรือ C8..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all min-h-[42px]"
              />
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>คัดลอกจาก: TikTok Ads Manager &gt; Assets &gt; Events &gt; Web Events</span>
              </p>
            </div>

            {/* Google GA4 Tag Field */}
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Google Analytics 4 (Measurement ID)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">G-XXXXXXXXXX</span>
              </label>
              <input
                type="text"
                value={googleTagId}
                onChange={(e) => setGoogleTagId(e.target.value)}
                placeholder="เช่น G-ABC123XYZ"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all min-h-[42px]"
              />
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>คัดลอกจาก: Google Analytics &gt; Admin &gt; Data Streams &gt; Measurement ID</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                ปิด
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'กำลังติดตั้ง...' : 'บันทึก & เปิดใช้งานพิกเซลทันที'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Test & Live Logs */}
        {activeTab === 'logs' && (
          <div className="mt-4 space-y-4">
            
            {/* Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              <div className={`p-2.5 rounded-xl border ${hasFb ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' : 'bg-slate-800/30 border-slate-700/50 text-slate-500'}`}>
                <div className="text-xs font-semibold">Meta Pixel</div>
                <div className="text-xs font-mono mt-0.5">{fbPixelId ? 'ติดตั้งแล้ว' : 'ยังไม่ระบุ'}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${hasTikTok ? 'bg-pink-950/40 border-pink-500/40 text-pink-300' : 'bg-slate-800/30 border-slate-700/50 text-slate-500'}`}>
                <div className="text-xs font-semibold">TikTok Pixel</div>
                <div className="text-xs font-mono mt-0.5">{tiktokPixelId ? 'ติดตั้งแล้ว' : 'ยังไม่ระบุ'}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${hasGoogle ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-slate-800/30 border-slate-700/50 text-slate-500'}`}>
                <div className="text-xs font-semibold">Google GA4</div>
                <div className="text-xs font-mono mt-0.5">{googleTagId ? 'ติดตั้งแล้ว' : 'ยังไม่ระบุ'}</div>
              </div>
            </div>

            {/* Test Fire Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                ทดสอบส่ง Conversion Event ไปยัง Pixel:
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleTestContactEvent}
                  className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Event 'Contact'</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestLeadEvent}
                  className="px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Event 'Lead'</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestViewContentEvent}
                  className="px-3 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Event 'ViewContent'</span>
                </button>
              </div>

              {testSent && (
                <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{testSent}</span>
                </p>
              )}
            </div>

            {/* Live Log Stream */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ประวัติการยิง Event สด (Live Event Logs):</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {logs.length} บันทึก
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 text-xs">
                    ยังไม่มี Event บันทึกไว้ กดปุ่มทดสอบด้านบนเพื่อยิง Event
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          log.platform === 'Facebook' ? 'bg-blue-600/30 text-blue-300' :
                          log.platform === 'TikTok' ? 'bg-pink-600/30 text-pink-300' :
                          log.platform === 'Google' ? 'bg-amber-600/30 text-amber-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {log.platform}
                        </span>
                        <span className="text-slate-200 font-bold shrink-0">{log.eventName}</span>
                        {log.details && (
                          <span className="text-slate-400 text-xs break-all font-mono">
                            {JSON.stringify(log.details)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Guide */}
        {activeTab === 'guide' && (
          <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>เหตุการณ์ (Standard Events) ที่ระบบบันทึกให้อัตโนมัติ:</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="font-mono text-purple-400 font-bold shrink-0">1. PageView:</span>
                  <span>บันทึกทันทีเมื่อมีผู้มุ่งหวังคลิกเข้ามาดูหน้าเว็บพ่วงนี้</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-mono text-purple-400 font-bold shrink-0">2. ViewContent:</span>
                  <span>บันทึกเมื่อผู้มุ่งหวังเริ่มดูวิดีโอ 20 นาที หรือเลื่อนอ่านรายละเอียดธุรกิจ</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-mono text-purple-400 font-bold shrink-0">3. Contact:</span>
                  <span>บันทึกเมื่อผู้มุ่งหวังกดปุ่ม "แอด LINE", โทรศัพท์ หรือกดลิ้งก์เว็บหลัก Atomy</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-mono text-purple-400 font-bold shrink-0">4. Lead:</span>
                  <span>บันทึกหลังจากบันทึกข้อมูลเข้าฐานข้อมูลสำเร็จและนำผู้มุ่งหวังเข้าสู่หน้ายินดีต้อนรับ (Welcome View) เรียบร้อยแล้วเท่านั้น เพื่อความแม่นยำสูงสุด</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white mb-1 text-xs">
                การส่ง Pixel ID ผ่านลิงก์ URL สำหรับทีมงาน:
              </h4>
              <p className="text-[11px] text-slate-400 mb-2">
                คุณสามารถส่ง URL ที่มีพารามิเตอร์ Pixel ให้กับทีมงานนำไปยิงแอดได้ โดยไม่ต้องแก้โค้ดเว็บ เช่น:
              </p>
              <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-sky-300 break-all select-all">
                https://เว็บไซต์จริงของคุณ/?ref={sponsor.sponsorId}&fbp=YOUR_FB_PIXEL&ttp=YOUR_TIKTOK_PIXEL
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('install')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors cursor-pointer text-center"
            >
              ไปที่หน้ากรอก Pixel ID เพื่อติดตั้ง
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
