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
  Unlock,
  Zap,
  Calendar,
  Briefcase,
  PhoneCall,
  Sparkles,
  Mail,
  Eye,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { LeadSubmission, fetchLeads, updateLeadStatus, seedSampleLeads, getLocalLeads, exportLeadsToExcelCSV } from '../lib/firebase';
import { SponsorProfile, AuthSession } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { CallScriptView } from './CallScriptView';

interface LeadsInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
  session: AuthSession | null;
  onOpenLogin?: () => void;
  onOpenWelcomePreview?: () => void;
}

export const LeadsInboxModal: React.FC<LeadsInboxModalProps> = ({
  isOpen,
  onClose,
  sponsor,
  session,
  onOpenLogin,
  onOpenWelcomePreview,
}) => {
  const [leads, setLeads] = useState<LeadSubmission[]>(() => getLocalLeads());
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'completed'>('all');
  const [scopeFilter, setScopeFilter] = useState<'current' | 'all'>('current');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'leads' | 'script'>('leads');
  const [selectedLeadForScript, setSelectedLeadForScript] = useState<LeadSubmission | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);
  const [bypassAuthForDemo, setBypassAuthForDemo] = useState<boolean>(false);

  const isMasterAdmin = session?.isAdmin || sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId || bypassAuthForDemo;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads(session?.isAdmin || isMasterAdmin);
      if (data && data.length > 0) {
        setLeads(data);
      } else {
        const local = getLocalLeads();
        if (local.length > 0) setLeads(local);
      }
    } catch (err: any) {
      console.warn('Notice while loading leads:', err?.message || err);
      const local = getLocalLeads();
      if (local.length > 0) setLeads(local);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSampleLeads = async () => {
    setIsSeeding(true);
    setSeedSuccessMsg(null);
    try {
      const created = await seedSampleLeads(sponsor.sponsorId, sponsor.sponsorName);
      setSeedSuccessMsg(`สร้างรายชื่อทดสอบสำเร็จ ${created.length} รายชื่อ!`);
      // Update UI immediately (Instant optimistic UI)
      setLeads((prev) => {
        const remaining = prev.filter(p => !created.some(c => c.phoneNumber === p.phoneNumber));
        return [...created, ...remaining];
      });
      setTimeout(() => setSeedSuccessMsg(null), 3500);
    } catch (error: any) {
      console.error('Error generating sample leads:', error);
      alert('ไม่สามารถสร้างรายชื่อทดสอบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, session]);

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
        !item.sponsorId ||
        item.sponsorId === sponsor.sponsorId ||
        sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId;
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
      const matchAge = item.age ? item.age.toLowerCase().includes(term) : false;
      const matchOccupation = item.occupation ? item.occupation.toLowerCase().includes(term) : false;
      const matchSponsor =
        (item.sponsorName && item.sponsorName.toLowerCase().includes(term)) ||
        (item.sponsorId && item.sponsorId.toLowerCase().includes(term));
      return matchName || matchPhone || matchLine || matchAge || matchOccupation || matchSponsor;
    }
    return true;
  });

  const uncontactedLeads = leads.filter((l) => (l.status || 'new') === 'new');
  const newCount = filteredLeads.filter((l) => (l.status || 'new') === 'new').length;

  const handleExportUncontactedExcel = () => {
    if (uncontactedLeads.length === 0) {
      alert('ขณะนี้ไม่มีรายชื่อผู้มุ่งหวังในสถานะ "ยังไม่ได้รับการติดต่อ (รอติดต่อ)" สำหรับส่งออก');
      return;
    }
    exportLeadsToExcelCSV(
      uncontactedLeads,
      `รายชื่อผู้มุ่งหวังรอติดต่อ_${sponsor.sponsorName.replace(/\s+/g, '_')}`
    );
  };

  const handleExportAllExcel = () => {
    if (leads.length === 0) {
      alert('ไม่มีรายชื่อสำหรับส่งออก');
      return;
    }
    exportLeadsToExcelCSV(
      leads,
      `รายชื่อผู้มุ่งหวังทั้งหมด_${sponsor.sponsorName.replace(/\s+/g, '_')}`
    );
  };

  const handleResetAllToNew = async () => {
    if (!confirm('ต้องการปรับสถานะรายชื่อผู้มุ่งหวังทั้งหมดกลับเป็น "ยังไม่ได้รับการติดต่อ (รอติดต่อ)" ใช่หรือไม่?')) {
      return;
    }
    const updated = leads.map(l => ({ ...l, status: 'new' as const }));
    setLeads(updated);
    for (const item of leads) {
      if (item.id) {
        await updateLeadStatus(item.id, 'new');
      }
    }
    setSeedSuccessMsg('ปรับสถานะรายชื่อทั้งหมดเป็น "ยังไม่ได้รับการติดต่อ" เรียบร้อยแล้ว');
    setTimeout(() => setSeedSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-3xl w-full shadow-2xl border border-slate-800 relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!session && !bypassAuthForDemo ? (
          // --- Auth Gate ---
          <div className="py-8 px-4 sm:px-10 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-rose-900/40 border border-rose-500/30 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">ระบบจัดการรายชื่อผู้มุ่งหวัง (Leads Hub)</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              เพื่อความปลอดภัยของข้อมูลผู้มุ่งหวัง คุณสามารถลงชื่อเข้าใช้ด้วยบัญชีแอดมิน/สปอนเซอร์ หรือทดลองเปิดดูในโหมดทดสอบได้ทันที
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setBypassAuthForDemo(true);
                  loadData();
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>เปิดดูในโหมดทดสอบทันที</span>
              </button>
              {onOpenLogin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วยอีเมล</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
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
                  <span>ศูนย์จัดการผู้มุ่งหวัง (Leads Hub)</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {leads.length} รายการ
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  รายชื่อผู้สนใจจากแบบฟอร์ม พร้อมสคริปต์โทรปิดการสมัคร 2 นาที (พิมพ์ 88 ให้สปอนเซอร์คีย์สมัครและเลือกสายงานให้)
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'leads'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>กล่องรายชื่อผู้มุ่งหวัง</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-white font-mono">
                  {leads.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('script')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'script'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>สคริปต์โทรปิดการสมัคร (&lt; 2 นาที)</span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-normal border border-emerald-700">
                  พิมพ์ 88 ใน LINE
                </span>
              </button>
            </div>

            {activeTab === 'script' ? (
              /* TAB 2: CALL SCRIPT VIEW */
              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <CallScriptView
                  leads={filteredLeads.length > 0 ? filteredLeads : leads}
                  sponsor={sponsor}
                  selectedLead={selectedLeadForScript}
                  onSelectLead={setSelectedLeadForScript}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : (
              /* TAB 1: LEADS LIST VIEW */
              <>
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

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Seed Sample Leads Button */}
                    <button
                      type="button"
                      onClick={handleSeedSampleLeads}
                      disabled={isSeeding}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-950/70 hover:bg-blue-900 text-blue-300 hover:text-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-700/80 shadow-2xs"
                      title="เพิ่มรายชื่อตัวอย่าง 6 รายชื่อ สำหรับทดสอบระบบกล่องรับหลีดและสคริปต์โทร"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-blue-400 ${isSeeding ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isSeeding ? 'กำลังสร้าง...' : 'สร้าง 6 หลีดทดสอบ'}</span>
                      <span className="sm:hidden">{isSeeding ? '...' : '+ หลีดทดสอบ'}</span>
                    </button>

                    {/* Welcome Screen Preview Shortcut */}
                    {onOpenWelcomePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenWelcomePreview();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-emerald-700/80 shadow-2xs"
                        title="ดูตัวอย่างหน้ายินดีต้อนรับและขั้นตอนส่งเลข 88 ที่ผู้มุ่งหวังจะได้รับ"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">ตัวอย่างหน้าต้อนรับ (กด 88)</span>
                        <span className="sm:hidden">หน้าต้อนรับ</span>
                      </button>
                    )}

                    {/* Refresh Button */}
                    <button
                      type="button"
                      onClick={loadData}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>รีเฟรช</span>
                    </button>
                  </div>
                </div>

                {/* Seed Success Banner */}
                {seedSuccessMsg && (
                  <div className="mt-2.5 p-2.5 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{seedSuccessMsg}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400">พร้อมทดสอบสคริปต์โทรได้ทันที!</span>
                  </div>
                )}

                {/* Satellite / Scope Switcher (ONLY FOR MASTER ADMIN) */}
                {isMasterAdmin && (
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
                    placeholder="ค้นหาตามชื่อ, เบอร์โทรศัพท์, LINE, อายุ, อาชีพ, ความสนใจ หรือสปอนเซอร์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Export Excel & Quick Management Toolbar */}
                <div className="mt-2.5 p-2 sm:p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportUncontactedExcel}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      title="ดาวน์โหลดไฟล์ Excel (.csv ภาษาไทย UTF-8) เฉพาะรายชื่อที่ยังไม่ได้รับการติดต่อ เปิดได้ทันที"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                      <span>ดาวน์โหลด Excel รอติดต่อ ({uncontactedLeads.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportAllExcel}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700 whitespace-nowrap"
                      title="ดาวน์โหลดไฟล์ Excel รายชื่อผู้มุ่งหวังทั้งหมดทุกสถานะ"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>ดาวน์โหลดทั้งหมด ({leads.length})</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetAllToNew}
                    className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer underline decoration-slate-700 hover:decoration-amber-400 ml-auto whitespace-nowrap"
                    title="ปรับทุกรายชื่อเป็นสถานะ 'ยังไม่ได้รับการติดต่อ' เพื่อให้คุณสามารถเริ่มปรับสถานะและคัดกรองเองได้"
                  >
                    ปรับสถานะทั้งหมดเป็นรอติดต่อ
                  </button>
                </div>

                {/* Leads List */}
                <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 max-h-[48vh]">
                  {loading ? (
                    <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                      <span>กำลังดึงข้อมูลจาก Cloud Firestore...</span>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
                      <Database className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-300 text-sm">ยังไม่พบรายชื่อในหมวดนี้</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        เมื่อมีผู้มุ่งหวังกรอกแบบฟอร์ม "ฝากข้อมูลติดต่อกลับ" รายชื่อจะปรากฏที่นี่ทันที หรือคุณสามารถกดสร้างรายชื่อจำลองเพื่อทดสอบระบบได้เลย
                      </p>
                      <button
                        type="button"
                        onClick={handleSeedSampleLeads}
                        disabled={isSeeding}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
                      >
                        <Sparkles className={`w-4 h-4 text-amber-300 ${isSeeding ? 'animate-spin' : ''}`} />
                        <span>{isSeeding ? 'กำลังสร้างรายชื่อทดสอบ...' : 'สร้าง 6 รายชื่อจำลองสำหรับทดสอบทันที'}</span>
                      </button>
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
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                            {/* Person Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
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

                              {/* Age & Occupation Badges */}
                              {(item.age || item.occupation) && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {item.age && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700 font-medium">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <span>อายุ {item.age} ปี</span>
                                    </span>
                                  )}
                                  {item.occupation && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-[11px] border border-emerald-800/60 font-medium">
                                      <Briefcase className="w-3 h-3 text-emerald-400" />
                                      <span>อาชีพ: {item.occupation}</span>
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
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

                            {/* Quick Actions: Script, Call, LINE */}
                            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLeadForScript(item);
                                  setActiveTab('script');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                                title="เปิดสคริปต์โทร 2 นาที เพื่อนำสมัครสมาชิก"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                <span>สคริปต์โทร 2 นาที</span>
                              </button>

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

                          {/* Notes/Interests from prospect */}
                          {(item.interest || item.notes) && (
                            <div className="mt-2.5 space-y-1.5">
                              {item.interest && (
                                <div className="text-xs bg-sky-950/70 text-sky-200 p-2 rounded-xl border border-sky-800/60 flex items-start gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="text-sky-300 font-semibold mr-1">ความสนใจที่ปรึกษา:</strong>
                                    <span>{item.interest}</span>
                                  </div>
                                </div>
                              )}
                              {item.notes && (
                                <div className="text-xs bg-slate-900/90 text-slate-300 p-2 rounded-xl border border-slate-800/90 flex items-start gap-2">
                                  <MessageCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="text-amber-300 font-medium mr-1">หมายเหตุเพิ่มเติม/เวลาสะดวก:</strong>
                                    <span>{item.notes}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Phone & Detail Bar */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
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

                              {item.email && (
                                <>
                                  <span className="text-slate-600">|</span>
                                  <span className="text-slate-300 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-sky-400" />
                                    <span>{item.email}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.email!)}
                                    className="text-[11px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                                  >
                                    {copiedText === item.email ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedText === item.email ? 'คัดลอกแล้ว' : 'คัดลอกอีเมล'}</span>
                                  </button>
                                </>
                              )}
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
              </>
            )}

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
