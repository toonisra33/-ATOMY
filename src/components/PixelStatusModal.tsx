import React, { useEffect, useState } from 'react';
import { X, Activity, CheckCircle2, AlertCircle, Play, Shield, RefreshCw } from 'lucide-react';
import { SponsorProfile } from '../types';
import { subscribePixelLogs, PixelEventLog, trackContactEvent, trackLeadEvent } from '../lib/pixel';

interface PixelStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
}

export const PixelStatusModal: React.FC<PixelStatusModalProps> = ({
  isOpen,
  onClose,
  sponsor,
}) => {
  const [logs, setLogs] = useState<PixelEventLog[]>([]);
  const [testSent, setTestSent] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribePixelLogs((newLogs) => {
      setLogs([...newLogs]);
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const hasFb = Boolean(sponsor.fbPixelId?.trim());
  const hasTikTok = Boolean(sponsor.tiktokPixelId?.trim());
  const hasGoogle = Boolean(sponsor.googleTagId?.trim());
  const anyConfigured = hasFb || hasTikTok || hasGoogle;

  const handleTestLeadEvent = () => {
    trackLeadEvent({
      fullName: 'ทดสอบระบบพิกเซล (Test Lead)',
      sponsorId: sponsor.sponsorId,
      sponsorName: sponsor.sponsorName,
    });
    setTestSent('Lead Event Fired!');
    setTimeout(() => setTestSent(null), 3000);
  };

  const handleTestContactEvent = () => {
    trackContactEvent('line', sponsor.sponsorId);
    setTestSent('Contact Event Fired!');
    setTimeout(() => setTestSent(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-800 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>สถานะการเก็บข้อมูล Pixel & Conversion</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Status
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              ตรวจสอบการทำงานของ Meta Pixel, TikTok Pixel และ Google Analytics
            </p>
          </div>
        </div>

        {/* Pixel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {/* Meta Pixel */}
          <div className={`p-3.5 rounded-2xl border ${hasFb ? 'bg-blue-950/40 border-blue-500/40' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-blue-400">Meta (Facebook)</span>
              {hasFb ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-slate-500">ไม่ได้ระบุ</span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate">
              {sponsor.fbPixelId || 'ยังไม่มี Pixel ID'}
            </p>
          </div>

          {/* TikTok Pixel */}
          <div className={`p-3.5 rounded-2xl border ${hasTikTok ? 'bg-pink-950/40 border-pink-500/40' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-pink-400">TikTok Pixel</span>
              {hasTikTok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-slate-500">ไม่ได้ระบุ</span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate">
              {sponsor.tiktokPixelId || 'ยังไม่มี Pixel ID'}
            </p>
          </div>

          {/* Google Analytics */}
          <div className={`p-3.5 rounded-2xl border ${hasGoogle ? 'bg-amber-950/40 border-amber-500/40' : 'bg-slate-800/40 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-amber-400">Google GA4</span>
              {hasGoogle ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-slate-500">ไม่ได้ระบุ</span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate">
              {sponsor.googleTagId || 'ยังไม่มี Tag ID'}
            </p>
          </div>
        </div>

        {/* Warning if none configured */}
        {!anyConfigured && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              ยังไม่ได้ระบุ Pixel ID ในสปอนเซอร์นี้ สามารถกด <strong>"สร้างเว็บพ่วง"</strong> เพื่อกรอก Pixel ID ของคุณได้ทันที หรือส่งผ่าน URL เช่น <code>?fbp=123456789</code>
            </div>
          </div>
        )}

        {/* Live Event Stream */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>บันทึก Event ที่ถูกส่งออกไปล่าสุด (Live Event Log):</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {logs.length} events
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center py-6 text-slate-600">
                ยังไม่มีประวัติ Event ถูกยิงออกไป (ลองกดปุ่มทดสอบด้านล่าง)
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      log.platform === 'Facebook' ? 'bg-blue-600/30 text-blue-300' :
                      log.platform === 'TikTok' ? 'bg-pink-600/30 text-pink-300' :
                      log.platform === 'Google' ? 'bg-amber-600/30 text-amber-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {log.platform}
                    </span>
                    <span className="text-slate-200 font-bold">{log.eventName}</span>
                    {log.details && (
                      <span className="text-slate-500 text-[10px] truncate max-w-[150px]">
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

        {/* Action Testing Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestLeadEvent}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>ทดสอบยิง Event 'Lead'</span>
            </button>
            <button
              type="button"
              onClick={handleTestContactEvent}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>ทดสอบ 'Contact'</span>
            </button>
          </div>

          {testSent && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{testSent}</span>
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer ml-auto"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
