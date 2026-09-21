import React, { useEffect, useState } from 'react';
import {
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
  Zap,
  Calendar,
  Briefcase,
  Sparkles,
  Mail,
  FileSpreadsheet,
  Download,
  ArrowLeft,
  Home,
  RotateCcw,
} from 'lucide-react';
import { LeadSubmission, fetchLeads, updateLeadStatus, seedSampleLeads, getLocalLeads, exportLeadsToExcelCSV } from '../lib/firebase';
import { SponsorProfile, AuthSession } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { CallScriptView } from './CallScriptView';

interface LeadsPageProps {
  sponsor: SponsorProfile;
  session: AuthSession | null;
  onOpenLogin?: () => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({
  sponsor,
  session,
  onOpenLogin,
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

  useEffect(() => {
    loadData();
  }, [sponsor.sponsorId, session?.isAdmin, bypassAuthForDemo]);

  const handleSeedSampleLeads = async () => {
    setIsSeeding(true);
    setSeedSuccessMsg(null);
    try {
      const created = await seedSampleLeads(sponsor.sponsorId, sponsor.sponsorName);
      setSeedSuccessMsg(`สร้างรายชื่อทดสอบสำเร็จ ${created.length} รายชื่อ!`);
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

  const handleStatusChange = async (leadId: string, newStatus: 'new' | 'contacted' | 'completed') => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLeadForScript?.id === leadId) {
      setSelectedLeadForScript((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const scopedLeads = leads.filter((item) => {
    if (scopeFilter === 'all') return true;
    return (
      item.sponsorId === sponsor.sponsorId ||
      !item.sponsorId ||
      (sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId && item.sponsorId === DEFAULT_SPONSOR.sponsorId)
    );
  });

  const filteredLeads = scopedLeads.filter((item) => {
    if (statusFilter !== 'all' && (item.status || 'new') !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.fullName.toLowerCase().includes(term);
      const matchPhone = item.phoneNumber.includes(term);
      const matchLine = item.lineId && item.lineId.toLowerCase().includes(term);
      const matchAge = item.age && item.age.toLowerCase().includes(term);
      const matchOccupation = item.occupation && item.occupation.toLowerCase().includes(term);
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าเว็บหลัก</span>
            </a>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                  ระบบจัดการรายชื่อผู้มุ่งหวัง (Leads Management)
                </h1>
                <p className="text-[10.5px] text-slate-400 leading-none">
                  Atomy Global Satellite • แท็บเฉพาะทางเต็มจอ
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span>สปอนเซอร์:</span>
              <strong className="text-slate-200">{sponsor.sponsorName}</strong>
              <span className="font-mono text-slate-500">({sponsor.sponsorId})</span>
            </div>
            <button
              type="button"
              onClick={() => window.close()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors hidden sm:block"
            >
              ปิดแท็บนี้
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!session && !bypassAuthForDemo ? (
          <div className="py-16 px-4 text-center max-w-lg mx-auto flex flex-col items-center justify-center bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl mt-8">
            <div className="w-16 h-16 rounded-full bg-rose-900/40 border border-rose-500/30 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">เข้าสู่ระบบจัดการรายชื่อผู้มุ่งหวัง</h2>
            <p className="text-sm text-slate-400 mb-6">
              เพื่อความปลอดภัยของข้อมูลส่วนบุคคล (PDPA) คุณสามารถเข้าสู่ระบบด้วยบัญชีสปอนเซอร์ หรือเปิดดูในโหมดทดสอบได้ทันที
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
                  type="button"
                  onClick={onOpenLogin}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วยอีเมล</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Top Stat Ribbon & Navigation Tabs */}
            <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white">
                    ศูนย์รับรายชื่อ & จัดการสายงาน (Leads Hub)
                  </h2>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                    {leads.length} รายชื่อทั้งหมด
                  </span>
                  {uncontactedLeads.length > 0 && (
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      {uncontactedLeads.length} รอติดต่อ
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  รายชื่อผู้มุ่งหวังจากแบบฟอร์ม พร้อมเครื่องมือโทรปิดการสมัคร 2 นาที และดาวน์โหลดไฟล์ Excel ภาษาไทย
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'leads'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>ตารางรายชื่อ</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                    {leads.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('script')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'script'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>สคริปต์โทร 2 นาที</span>
                </button>
              </div>
            </div>

            {/* Success Notification */}
            {seedSuccessMsg && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-xs sm:text-sm text-emerald-300 flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{seedSuccessMsg}</span>
              </div>
            )}

            {activeTab === 'script' ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl">
                <CallScriptView
                  leads={filteredLeads.length > 0 ? filteredLeads : leads}
                  sponsor={sponsor}
                  selectedLead={selectedLeadForScript}
                  onSelectLead={setSelectedLeadForScript}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
                {/* Action Bar & Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        statusFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ทั้งหมด ({leads.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('new')}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        statusFilter === 'new' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      รอติดต่อ ({newCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('contacted')}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        statusFilter === 'contacted' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ติดต่อแล้ว
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('completed')}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        statusFilter === 'completed' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ปิดการสมัคร
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ, เบอร์โทร, LINE ID, อาชีพ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Toolbar: Export Excel & Reset Status */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportUncontactedExcel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                      title="ดาวน์โหลดเฉพาะรายชื่อที่ยังไม่ได้รับการติดต่อเป็นไฟล์ Excel (.csv ภาษาไทย)"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                      <span>ดาวน์โหลด Excel รอติดต่อ ({uncontactedLeads.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportAllExcel}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title="ดาวน์โหลดรายชื่อทั้งหมดเป็นไฟล์ Excel (.csv ภาษาไทย)"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>ดาวน์โหลดทั้งหมด ({leads.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetAllToNew}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title="รีเซ็ตสถานะทุกรายชื่อกลับเป็นยังไม่ได้รับการติดต่อ เพื่อเริ่มต้นจัดการใหม่"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>ปรับสถานะทั้งหมดเป็นรอติดต่อ</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSeedSampleLeads}
                      disabled={isSeeding}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isSeeding ? 'animate-spin' : ''}`} />
                      <span>{isSeeding ? 'กำลังสร้าง...' : 'สร้างรายชื่อทดสอบ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={loadData}
                      disabled={loading}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="รีเฟรชข้อมูลจาก Cloud"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Leads List Cards */}
                <div className="space-y-3 pt-1">
                  {loading ? (
                    <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span>กำลังดึงข้อมูลจาก Cloud Firestore...</span>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-14 px-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <Database className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-300 text-base">ยังไม่พบรายชื่อในหมวดนี้</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        เมื่อมีผู้มุ่งหวังกรอกแบบฟอร์ม รายชื่อจะปรากฏที่นี่ทันที หรือคุณสามารถกดสร้างรายชื่อจำลองเพื่อทดสอบระบบได้เลย
                      </p>
                      <button
                        type="button"
                        onClick={handleSeedSampleLeads}
                        disabled={isSeeding}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
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
                          className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            {/* Person Core Info */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-bold text-base sm:text-lg text-white">
                                  {item.fullName}
                                </span>
                                <span
                                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                                    status === 'new'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : status === 'contacted'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  }`}
                                >
                                  {status === 'new'
                                    ? '● รอติดต่อ'
                                    : status === 'contacted'
                                    ? '● ติดต่อแล้ว'
                                    : '✓ ปิดการสมัคร'}
                                </span>
                              </div>

                              {/* Badges: Age & Occupation */}
                              {(item.age || item.occupation) && (
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                  {item.age && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700 font-medium">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <span>อายุ {item.age} ปี</span>
                                    </span>
                                  )}
                                  {item.occupation && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-xs border border-emerald-800/60 font-medium">
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
                                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                                  <span>สปอนเซอร์: {item.sponsorName} ({item.sponsorId})</span>
                                  {(item.sponsorId === sponsor.sponsorId ||
                                    (sponsor.sponsorId === DEFAULT_SPONSOR.sponsorId &&
                                      (!item.sponsorId || item.sponsorId === DEFAULT_SPONSOR.sponsorId))) && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/25 text-blue-300 font-sans font-medium rounded border border-blue-500/30">
                                      เว็บลูกนี้
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons: 2-min Script, Call, LINE */}
                            <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLeadForScript(item);
                                  setActiveTab('script');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                                title="เปิดสคริปต์โทร 2 นาที เพื่อนำสมัครสมาชิก"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                <span>สคริปต์โทร 2 นาที</span>
                              </button>

                              <a
                                href={`tel:${item.phoneNumber}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>โทรออก</span>
                              </a>

                              {item.lineId && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(item.lineId!)}
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                                  title="คัดลอก LINE ID"
                                >
                                  {copiedText === item.lineId ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>LINE: {item.lineId}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Interest & Notes from Prospect */}
                          {(item.interest || item.notes) && (
                            <div className="mt-3 space-y-2">
                              {item.interest && (
                                <div className="text-xs bg-sky-950/70 text-sky-200 p-2.5 rounded-xl border border-sky-800/60 flex items-start gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="text-sky-300 font-semibold mr-1">
                                      ความสนใจที่ปรึกษา:
                                    </strong>
                                    <span>{item.interest}</span>
                                  </div>
                                </div>
                              )}
                              {item.notes && (
                                <div className="text-xs bg-slate-900 text-slate-300 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                                  <MessageCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="text-amber-300 font-medium mr-1">
                                      หมายเหตุเพิ่มเติม/เวลาสะดวก:
                                    </strong>
                                    <span>{item.notes}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Contact Details & Status Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-slate-300 font-mono">
                                เบอร์: <strong>{item.phoneNumber}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.phoneNumber)}
                                className="text-xs text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                              >
                                {copiedText === item.phoneNumber ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedText === item.phoneNumber ? 'คัดลอกแล้ว' : 'คัดลอกเบอร์'}</span>
                              </button>

                              {item.email && (
                                <>
                                  <span className="text-slate-700">|</span>
                                  <span className="text-slate-300 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-sky-400" />
                                    <span>{item.email}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.email!)}
                                    className="text-xs text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                                  >
                                    {copiedText === item.email ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>{copiedText === item.email ? 'คัดลอกแล้ว' : 'คัดลอกอีเมล'}</span>
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Status Changer */}
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-500 mr-1 font-medium">ปรับสถานะ:</span>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'new')}
                                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                                  status === 'new'
                                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                รอติดต่อ
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'contacted')}
                                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                                  status === 'contacted'
                                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                ติดต่อแล้ว
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'completed')}
                                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                                  status === 'completed'
                                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
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
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ระบบฐานข้อมูล: Cloud Firestore &gt; คอลเลกชัน <code className="text-sky-400">leads</code>
          </span>
          <span>© 2026 Atomy Global Satellite Funnel • ระบบบริหารจัดการผู้มุ่งหวัง</span>
        </div>
      </footer>
    </div>
  );
};
