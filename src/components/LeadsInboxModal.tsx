import React, { useEffect, useState } from 'react';
import {
  X,
  Users,
  Phone,
  MessageCircle,
  Clock,
  RefreshCw,
  CheckCircle2,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Search,
  Database,
  Lock,
  Loader2,
  Unlock
} from 'lucide-react';
import { LeadSubmission, fetchLeads, updateLeadStatus, verifySponsorPin } from '../lib/firebase';
import { SponsorProfile } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';

interface LeadsInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
}

export const LeadsInboxModal: React.FC<LeadsInboxModalProps> = ({
  isOpen,
  onClose,
  sponsor,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'completed'>('all');
  const [scopeFilter, setScopeFilter] = useState<'current' | 'all'>('current');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    
    setIsVerifying(true);
    setAuthError('');
    try {
      const isValid = await verifySponsorPin(sponsor.sponsorId, pinInput.trim());
      if (isValid) {
        setIsAuthenticated(true);
        loadData();
      } else {
        setAuthError('รหัส PIN ไม่ถูกต้อง หากยังไม่ได้ตั้งค่า กรุณาไปตั้งค่าที่เมนู "เว็บพ่วงสปอนเซอร์" ก่อน');
      }
    } catch (err) {
      setAuthError('ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset auth when modal closes or sponsor changes
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setPinInput('');
      setAuthError('');
    }
  }, [isOpen, sponsor.sponsorId]);

  if (!isOpen) return null;

  const handleStatusChange = async (leadId: string | undefined, newStatus: 'new' | 'contacted' | 'completed') => {
    if (!leadId) return;
    setLeads((prev) =>
      prev.map((item) => (item.id === leadId ? { ...item, status: newStatus } : item))
    );
    await updateLeadStatus(leadId, newStatus);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const myLeadsCount = leads.filter(
    (l) => l.sponsorId === sponsor.sponsorId || (sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId && (!l.sponsorId || l.sponsorId === DEFAULT_SPONSOR.sponsorId))
  ).length;

  const filteredLeads = leads.filter((item) => {
    // Filter by satellite owner (scope)
    if (scopeFilter === 'current') {
      const isMine =
        item.sponsorId === sponsor.sponsorId ||
        (sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId && (!item.sponsorId || item.sponsorId === DEFAULT_SPONSOR.sponsorId));
      if (!isMine) return false;
    }

    if (statusFilter !== 'all' && (item.status || 'new') !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = item.fullName.toLowerCase().includes(term);
      const matchPhone = item.phoneNumber.includes(term);
      const matchLine = item.lineId ? item.lineId.toLowerCase().includes(term) : false;
      const matchSponsor =
        (item.sponsorName && item.sponsorName.toLowerCase().includes(term)) ||
        (item.sponsorId && item.sponsorId.toLowerCase().includes(term));
      return matchName || matchPhone || matchLine || matchSponsor;
    }
    return true;
  });

  const newCount = filteredLeads.filter((l) => (l.status || 'new') === 'new').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-800 relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAuthenticated ? (
          // --- PIN Authentication Gate ---
          <div className="py-8 px-4 sm:px-10 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">เข้าสู่ระบบหลังบ้าน</h3>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">
              กรุณายืนยันรหัส PIN เพื่อดูรายชื่อผู้มุ่งหวังของสปอนเซอร์ <strong className="text-slate-200">{sponsor.sponsorId}</strong>
            </p>
            
            <form onSubmit={handleVerifyPin} className="w-full max-w-xs space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="กรอก PIN 4-6 หลัก"
                  maxLength={6}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-lg px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              {authError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-left">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={isVerifying || !pinInput}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>กำลังตรวจสอบ...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    <span>เข้าสู่ระบบ</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          // --- Leads Inbox Content ---
          <>
            {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white flex flex-wrap items-center gap-2 leading-snug">
              <span>กล่องรายชื่อผู้มุ่งหวัง (Leads Inbox)</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {leads.length} รายการ
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              รายชื่อผู้สนใจที่กรอกข้อมูลผ่านแบบฟอร์มบนหน้าเว็บ (บันทึกใน Cloud Firestore)
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'new' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              รอติดต่อ ({newCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('contacted')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'contacted' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ติดต่อแล้ว
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'completed' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ปิดการสมัคร
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Satellite / Scope Switcher (ONLY FOR MASTER ADMIN) */}
        {sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId && (
        <div className="mt-3 p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">สถานะแอดมิน:</span>
            <span className="font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Master Admin
            </span>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setScopeFilter('current')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                scopeFilter === 'current'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              เฉพาะของฉัน ({myLeadsCount})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              เว็บพ่วงทั้งหมด ({leads.length})
            </button>
          </div>
        </div>
        )}

        {/* Search Bar */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ, เบอร์โทรศัพท์, LINE หรือชื่อสปอนเซอร์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Leads List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span>กำลังดึงข้อมูลจาก Cloud Firestore...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <Database className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-400">ยังไม่พบรายชื่อในหมวดนี้</p>
              <p className="text-[11px] text-slate-500 mt-1">
                เมื่อมีผู้มุ่งหวังกรอกแบบฟอร์ม "ฝากข้อมูลติดต่อกลับ" รายชื่อจะปรากฏที่นี่ทันที
              </p>
            </div>
          ) : (
            filteredLeads.map((item) => {
              const status = item.status || 'new';
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleString('th-TH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : '-';

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Person Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white">
                          {item.fullName}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          status === 'new'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : status === 'contacted'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {status === 'new' ? 'รอติดต่อ' : status === 'contacted' ? 'ติดต่อแล้ว' : 'ปิดการสมัคร'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formattedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                          <span>สปอนเซอร์: {item.sponsorName} ({item.sponsorId})</span>
                          {(item.sponsorId === sponsor.sponsorId || (sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId && (!item.sponsorId || item.sponsorId === DEFAULT_SPONSOR.sponsorId))) && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/25 text-blue-300 font-sans font-medium rounded border border-blue-500/30">
                              เว็บลูกนี้
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Quick Call & Line Actions */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <a
                        href={`tel:${item.phoneNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>โทรออก</span>
                      </a>
                      {item.lineId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.lineId!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                          title="คัดลอก LINE ID"
                        >
                          {copiedText === item.lineId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>LINE: {item.lineId}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone & Detail Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 font-mono">
                        เบอร์: <strong>{item.phoneNumber}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.phoneNumber)}
                        className="text-[11px] text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedText === item.phoneNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedText === item.phoneNumber ? 'คัดลอกแล้ว' : 'คัดลอกเบอร์'}</span>
                      </button>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 mr-1">เปลี่ยนสถานะ:</span>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'new')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${status === 'new' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        รอติดต่อ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'contacted')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${status === 'contacted' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        ติดต่อแล้ว
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${status === 'completed' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        ปิดการสมัคร
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Firestore Architecture Note in Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px]">
              เก็บข้อมูลที่: <strong>Firebase Firestore &gt; leads</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            ปิดหน้าต่าง
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
