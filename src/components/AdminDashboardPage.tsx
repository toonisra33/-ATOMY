import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  UserCheck,
  Share2,
  Target,
  Mail,
  CloudUpload,
  Globe,
  LogOut,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Phone,
  MessageCircle,
  ShieldCheck,
  Lock,
  ChevronRight,
  Monitor,
  Smartphone,
  Upload,
  Link as LinkIcon,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { SponsorProfile, AuthSession } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import {
  saveSponsorProfile,
  fetchLeads,
  updateLeadStatus,
  getLocalLeads,
  exportLeadsToExcelCSV,
  LeadSubmission,
} from '../lib/firebase';
import {
  GalleryItem,
  ATOMY_GALLERY_ITEMS,
} from './ImageGalleryAlbum';
import {
  fetchGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  resetGalleryToDefault,
} from '../lib/galleryService';
import { setupAllPixels } from '../lib/pixel';
import { detectDeviceType } from '../lib/device';
import {
  uploadBanner,
  getCustomBanner,
  clearCustomBanner,
  compressImage,
} from '../lib/imageUtils';
import { CallScriptView } from './CallScriptView';
import { TrainingEmailHubModal } from './TrainingEmailHubModal';
import {
  TRAINING_EMAIL_TEMPLATES,
  generateFormattedEmail,
} from '../data/trainingEmailTemplates';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AdminDashboardPageProps {
  sponsor: SponsorProfile;
  session: AuthSession | null;
  onUpdateSponsor: (updated: SponsorProfile) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

type AdminTab =
  | 'overview'
  | 'leads'
  | 'script'
  | 'sponsor'
  | 'gallery'
  | 'banners'
  | 'pixels'
  | 'emails'
  | 'deploy';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  sponsor,
  session,
  onUpdateSponsor,
  onLogout,
  onNavigateHome,
}) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Check admin authorization
  const [devBypass, setDevBypass] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('atomy_admin_dev_mode') === 'true' ||
        new URLSearchParams(window.location.search).get('admin') === '1' ||
        new URLSearchParams(window.location.search).get('dev') === '1'
      );
    }
    return false;
  });

  // Login form state (if not authenticated)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Primary Super Admin check vs Satellite Member check
  const isSuperAdmin =
    (session?.email ? session.email.toLowerCase() === 'toonisra33@gmail.com' : false) ||
    session?.isAdmin === true ||
    devBypass;

  // Any authenticated user or dev bypass has access to the back-office
  const isAuthorized = !!session || devBypass;

  // ------------------------------
  // OVERVIEW & COMMON STATE
  // ------------------------------
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const affiliateUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${sponsor.sponsorId}`
    : `/?ref=${sponsor.sponsorId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(affiliateUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedAffiliate(true);
    setTimeout(() => setCopiedAffiliate(false), 2000);
  };

  // ------------------------------
  // LEADS STATE
  // ------------------------------
  const [leads, setLeads] = useState<LeadSubmission[]>(() => getLocalLeads());
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsStatusFilter, setLeadsStatusFilter] = useState<'all' | 'new' | 'contacted' | 'completed'>('all');
  const [selectedLeadForScript, setSelectedLeadForScript] = useState<LeadSubmission | null>(null);

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const data = await fetchLeads(true);
      if (data && data.length > 0) {
        setLeads(data);
      } else {
        setLeads(getLocalLeads());
      }
    } catch (e) {
      console.warn('Leads load error:', e);
      setLeads(getLocalLeads());
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadLeads();
    }
  }, [isAuthorized]);

  const handleUpdateStatus = async (leadId: string, newStatus: 'new' | 'contacted' | 'completed') => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((item) => (item.id === leadId ? { ...item, status: newStatus } : item))
      );
    } catch (e: any) {
      alert('ไม่สามารถอัพเดตสถานะได้: ' + (e?.message || 'ข้อผิดพลาด'));
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (leadsStatusFilter !== 'all' && l.status !== leadsStatusFilter) return false;
    if (leadsSearch.trim()) {
      const q = leadsSearch.toLowerCase();
      const matchName = l.fullName?.toLowerCase().includes(q);
      const matchPhone = l.phoneNumber?.includes(q);
      const matchLine = l.lineId?.toLowerCase().includes(q);
      const matchOcc = l.occupation?.toLowerCase().includes(q);
      return matchName || matchPhone || matchLine || matchOcc;
    }
    return true;
  });

  // ------------------------------
  // GALLERY STATE
  // ------------------------------
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(ATOMY_GALLERY_ITEMS);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [gallerySaveLoading, setGallerySaveLoading] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState<string | null>(null);

  // Gallery form fields
  const [gTitle, setGTitle] = useState('');
  const [gCategory, setGCategory] = useState<'products' | 'seminar' | 'company' | 'global'>('products');
  const [gBadge, setGBadge] = useState('');
  const [gBadgeColor, setGBadgeColor] = useState('bg-blue-600 text-white');
  const [gDescription, setGDescription] = useState('');
  const [gImageUrl, setGImageUrl] = useState('');
  const [gCaption, setGCaption] = useState('');
  const [gPoints, setGPoints] = useState<string[]>(['']);

  const loadGallery = async () => {
    const items = await fetchGalleryItems();
    if (items && items.length > 0) {
      setGalleryItems(items);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadGallery();
    }
  }, [isAuthorized]);

  const handleStartEditGallery = (item: GalleryItem) => {
    setEditingItem(item);
    setGTitle(item.title);
    setGCategory(item.category);
    setGBadge(item.badge);
    setGBadgeColor(item.badgeColor || 'bg-blue-600 text-white');
    setGDescription(item.description);
    setGImageUrl(item.imageUrl);
    setGCaption(item.caption);
    setGPoints(item.highlightPoints.length > 0 ? [...item.highlightPoints] : ['']);
    setIsGalleryFormOpen(true);
    setGalleryMessage(null);
  };

  const handleStartCreateGallery = () => {
    setEditingItem(null);
    setGTitle('');
    setGCategory('products');
    setGBadge('Mass Prestige Products');
    setGBadgeColor('bg-blue-600 text-white');
    setGDescription('');
    setGImageUrl('');
    setGCaption('');
    setGPoints(['', '']);
    setIsGalleryFormOpen(true);
    setGalleryMessage(null);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle.trim() || !gImageUrl.trim()) {
      alert('กรุณาระบุหัวข้อและรูปภาพ');
      return;
    }
    setGallerySaveLoading(true);
    try {
      const newItem: GalleryItem = {
        id: editingItem?.id || `item-${Date.now()}`,
        title: gTitle.trim(),
        category: gCategory,
        badge: gBadge.trim() || 'Atomy Showcase',
        badgeColor: gBadgeColor,
        description: gDescription.trim(),
        highlightPoints: gPoints.filter((p) => p.trim().length > 0),
        imageUrl: gImageUrl.trim(),
        caption: gCaption.trim() || gTitle.trim(),
      };
      await saveGalleryItem(newItem);
      await loadGallery();
      setGalleryMessage('บันทึกรูปภาพเรียบร้อยแล้ว!');
      setTimeout(() => {
        setIsGalleryFormOpen(false);
        setGalleryMessage(null);
      }, 1000);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err?.message || ''));
    } finally {
      setGallerySaveLoading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('คุณต้องการลบรูปภาพนี้ออกจากอัลบั้มหน้าเว็บใช่หรือไม่?')) return;
    try {
      await deleteGalleryItem(id);
      await loadGallery();
    } catch (err: any) {
      alert('ไม่สามารถลบได้: ' + (err?.message || ''));
    }
  };

  const handleResetGalleryDefaults = () => {
    if (window.confirm('ต้องการคืนค่าอัลบั้มภาพหน้าเว็บเป็นค่าเริ่มต้นทั้งหมดหรือไม่?')) {
      const defaults = resetGalleryToDefault();
      setGalleryItems(defaults);
      setIsGalleryFormOpen(false);
    }
  };

  // ------------------------------
  // SPONSOR EDIT STATE
  // ------------------------------
  const [sponsorForm, setSponsorForm] = useState<SponsorProfile>({ ...sponsor });
  const [sponsorSaveLoading, setSponsorSaveLoading] = useState(false);
  const [sponsorSaveSuccess, setSponsorSaveSuccess] = useState(false);

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSponsorSaveLoading(true);
    setSponsorSaveSuccess(false);
    try {
      await saveSponsorProfile(sponsorForm, session?.uid || 'admin');
      onUpdateSponsor(sponsorForm);
      setSponsorSaveSuccess(true);
      setTimeout(() => setSponsorSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setSponsorSaveLoading(false);
    }
  };

  // ------------------------------
  // BANNERS STATE
  // ------------------------------
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const handleUploadBannerFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingBanner(true);
    setBannerNotice(null);
    try {
      const result = await uploadBanner(file, type);
      setBannerNotice(result.message);
      window.dispatchEvent(new CustomEvent('atomy-banner-updated'));
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + (err?.message || ''));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // ------------------------------
  // PIXELS STATE
  // ------------------------------
  const [pixelForm, setPixelForm] = useState({
    fbPixelId: sponsor.fbPixelId || '',
    tiktokPixelId: sponsor.tiktokPixelId || '',
    googleTagId: sponsor.googleTagId || '',
  });
  const [pixelSaveSuccess, setPixelSaveSuccess] = useState(false);

  const handleSavePixels = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedSponsor: SponsorProfile = {
        ...sponsor,
        ...sponsorForm,
        fbPixelId: pixelForm.fbPixelId.trim(),
        tiktokPixelId: pixelForm.tiktokPixelId.trim(),
        googleTagId: pixelForm.googleTagId.trim(),
      };
      await saveSponsorProfile(updatedSponsor, session?.uid || 'custom-sponsor');
      onUpdateSponsor(updatedSponsor);
      setSponsorForm(updatedSponsor);
      setupAllPixels({
        fbPixelId: pixelForm.fbPixelId.trim(),
        tiktokPixelId: pixelForm.tiktokPixelId.trim(),
        googleTagId: pixelForm.googleTagId.trim(),
      });
      setPixelSaveSuccess(true);
      setTimeout(() => setPixelSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('บันทึก Pixel ไม่สำเร็จ: ' + (err?.message || ''));
    }
  };

  // ------------------------------
  // EMAIL TEMPLATES PREVIEW STATE
  // ------------------------------
  const [selectedEmailDay, setSelectedEmailDay] = useState(1);
  const [isEmailHubModalOpen, setIsEmailHubModalOpen] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [copiedEmailSubject, setCopiedEmailSubject] = useState(false);
  const [copiedAll7Emails, setCopiedAll7Emails] = useState(false);
  const emailTemplatesList = Object.values(TRAINING_EMAIL_TEMPLATES);
  const currentEmailTemplate = TRAINING_EMAIL_TEMPLATES[selectedEmailDay] || emailTemplatesList[0];

  const handleCopyCurrentEmailBody = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const formatted = generateFormattedEmail(
      selectedEmailDay,
      'คุณสมชาย (ผู้มุ่งหวัง)',
      sponsor.sponsorName,
      sponsor.lineId,
      origin,
      'prospect@example.com'
    );
    navigator.clipboard.writeText(formatted.textBody);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2000);
  };

  const handleCopyCurrentEmailSubject = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const formatted = generateFormattedEmail(
      selectedEmailDay,
      'คุณสมชาย (ผู้มุ่งหวัง)',
      sponsor.sponsorName,
      sponsor.lineId,
      origin,
      'prospect@example.com'
    );
    navigator.clipboard.writeText(formatted.subject);
    setCopiedEmailSubject(true);
    setTimeout(() => setCopiedEmailSubject(false), 2000);
  };

  const handleCopyAll7EmailTemplates = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const allTexts = [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const data = generateFormattedEmail(
        day,
        'คุณสมชาย (ผู้มุ่งหวัง)',
        sponsor.sponsorName,
        sponsor.lineId,
        origin,
        'prospect@example.com'
      );
      return `========================================\n[ฉบับที่ ${day}/7] หัวข้อ: ${data.subject}\nPreheader: ${data.preheader}\n========================================\n\n${data.textBody}\n\n`;
    }).join('\n');
    navigator.clipboard.writeText(allTexts);
    setCopiedAll7Emails(true);
    setTimeout(() => setCopiedAll7Emails(false), 2500);
  };

  // ------------------------------
  // LOGIN FORM HANDLER (Unauthenticated)
  // ------------------------------
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
    } catch (err: any) {
      setLoginError(err?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoginLoading(false);
    }
  };

  // If NOT authorized, show secure admin login screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              Sponsor Atomy Back-Office
            </div>
            <h1 className="text-2xl font-black text-white">ระบบจัดการหลังบ้าน</h1>
            <p className="text-xs text-slate-400 mt-1">
              Sponsor Atomy - ระบบสปอนเซอร์และนำเสนอโอกาสทางธุรกิจ
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                อีเมลผู้ดูแลระบบ (Admin Email)
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="เช่น toonisra33@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loginLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบหลังบ้าน'}</span>
            </button>
          </form>

          {/* Dev Bypass for AI Studio preview */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center relative z-10 space-y-2">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('atomy_admin_dev_mode', 'true');
                setDevBypass(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>เปิดโหมดพัฒนา (Dev Preview Mode)</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline cursor-pointer block mx-auto pt-1"
            >
              ← กลับไปยังหน้าเว็บหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED BACK-OFFICE DASHBOARD LAYOUT
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Mode */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">Sponsor Atomy</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {isSuperAdmin ? '👑 Admin หลัก (สิทธิ์เต็ม)' : '👤 สมาชิกเว็บลูก (ข้อมูลส่วนตัว)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ระบบจัดการผู้มุ่งหวัง, สคริปต์โทร 2 นาที, ข้อมูลสปอนเซอร์ และการวัดผล
              </p>
            </div>
          </div>

          {/* Quick Actions (Switch to Public Web, Logout) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="เปิดดูหน้าเว็บหลักของผู้มุ่งหวัง"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>ดูหน้าเว็บหลัก</span>
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('atomy_admin_dev_mode');
                onLogout();
                onNavigateHome();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ออกจากระบบหลังบ้าน"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออก</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-thin border-t border-slate-800/80 py-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>ภาพรวม</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>กล่องรับ Lead ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-emerald-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>สคริปต์โทร 2 นาที</span>
          </button>

          <button
            onClick={() => setActiveTab('sponsor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sponsor'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isSuperAdmin ? 'ข้อมูลสปอนเซอร์หลัก' : 'ข้อมูลส่วนตัวของคุณ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>อัลบั้มภาพ ({galleryItems.length})</span>
            {!isSuperAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>แบนเนอร์แชร์โซเชียล</span>
            {!isSuperAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
          </button>

          <button
            onClick={() => setActiveTab('pixels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pixels'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>พิกเซลการตลาด</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'emails'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>อีเมล 7 วัน</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'deploy'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>คู่มือขึ้นระบบ</span>
            {!isSuperAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Role & Permissions Banner */}
            {isSuperAdmin ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/25 shrink-0">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">คุณกำลังเข้าสู่ระบบในสิทธิ์: Admin หลัก (Super Admin)</h3>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40">
                        FULL ACCESS
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      คุณมีสิทธิ์จัดการแก้ไขข้อมูลระบบทั้งหมด ทั้งสปอนเซอร์หลัก, อัลบั้มภาพ, ภาพแชร์โซเชียล, รหัสพิกเซลการตลาด และรายชื่อผู้สนใจทั้งหมด
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono text-amber-300/80 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                  {session?.email || 'admin-mode'}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-500/15 via-slate-900 to-blue-500/10 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-sky-500/25 shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">คุณกำลังเข้าสู่ระบบในสิทธิ์: สมาชิกเว็บลูก (Satellite Member)</h3>
                      <span className="bg-sky-500/20 text-sky-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/40">
                        SATELLITE PROFILE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      คุณสามารถแก้ไขเฉพาะข้อมูลส่วนตัวของคุณ (ชื่อ, เบอร์โทร, LINE, รหัสสปอนเซอร์) เพื่อแสดงในลิงก์เว็บพ่วง และเข้าใช้งานสคริปต์โทร 2 นาที เพื่อปิดการสมัคร
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono text-sky-300/80 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                  {session?.email || 'satellite-user'}
                </div>
              </div>
            )}

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('script')}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm mb-1">
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>สคริปต์โทร 2 นาที</span>
                </div>
                <p className="text-xs text-slate-400">
                  เครื่องมือโทรเปิดใจ จับเวลา 120s และเชิญเข้า LINE พิมพ์ 88
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-700/10 border border-blue-500/30 hover:border-blue-400 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-blue-400 font-black text-sm mb-1">
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>กล่องรับ Lead ({leads.length})</span>
                </div>
                <p className="text-xs text-slate-400">
                  รายชื่อผู้มุ่งหวังที่ลงทะเบียนจากหน้าเว็บ ค้นหา กรอง และส่งออก Excel
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sponsor')}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/20 to-amber-700/10 border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm mb-1">
                  <UserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{isSuperAdmin ? 'ตั้งค่าสปอนเซอร์หลัก' : 'แก้ไขข้อมูลส่วนตัวของคุณ'}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {isSuperAdmin ? 'ตั้งค่าสปอนเซอร์ส่วนกลางของระบบ' : 'ปรับเปลี่ยนชื่อ, เบอร์โทร, LINE ID ในเว็บพ่วง'}
                </p>
              </button>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">ผู้สนใจทั้งหมด (Leads)</p>
                  <h3 className="text-2xl font-black text-white mt-1">{leads.length} ราย</h3>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>อัปเดตแบบเรียลไทม์</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">รูปภาพในอัลบั้มหน้าเว็บ</p>
                  <h3 className="text-2xl font-black text-white mt-1">{galleryItems.length} ภาพ</h3>
                  <p className="text-[11px] text-sky-400 mt-1">แสดงผลในหน้าแรก</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">สปอนเซอร์หลักประจำเว็บ</p>
                  <h3 className="text-base font-bold text-white mt-1 truncate max-w-[140px]">
                    {sponsor.sponsorName}
                  </h3>
                  <p className="text-[11px] text-amber-400 mt-1">{sponsor.sponsorPosition}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">สถานะพิกเซลการตลาด</p>
                  <h3 className="text-base font-bold text-white mt-1">
                    {sponsor.fbPixelId || sponsor.tiktokPixelId || sponsor.googleTagId ? 'พร้อมใช้งาน' : 'ยังไม่ระบุ'}
                  </h3>
                  <p className="text-[11px] text-purple-400 mt-1">Meta / TikTok / Google</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Share Link Box */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-white">ลิงก์และ QR Code หน้าเว็บของคุณ</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    นำลิงก์นี้ไปทำการตลาด โพสต์ลง Facebook, TikTok, ยิงโฆษณา หรือส่งให้ผู้มุ่งหวัง
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{showQrCode ? 'ซ่อน QR Code' : 'แสดง QR Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/25"
                  >
                    {copiedAffiliate ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAffiliate ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                  </button>
                </div>
              </div>

              {/* URL Box */}
              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-sky-300 break-all select-all flex items-center justify-between gap-2">
                <span>{affiliateUrl}</span>
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white"
                  title="เปิดหน้าเว็บในแท็บใหม่"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* QR Code Container */}
              {showQrCode && (
                <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                    <img src={qrCodeUrl} alt="Atomy QR Code" className="w-32 h-32 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">QR Code ประจำเว็บไซต์</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      สามารถคลิกขวาที่ภาพเพื่อบันทึกรูป QR Code นำไปพิมพ์ลงโปสเตอร์ ป้ายไวนิล หรือโพสต์ลงในโซเชียลมีเดียได้ทันที
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('leads')}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  จัดการรายชื่อผู้มุ่งหวัง
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  ดูข้อมูลติดต่อ โทรหา ส่ง LINE หรือส่งออกไฟล์ Excel/CSV
                </p>
              </div>

              <div
                onClick={() => setActiveTab('gallery')}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  จัดการอัลบั้มภาพหน้าเว็บ
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  อัปโหลดภาพสินค้า สัมมนา และสถาบันวิจัยที่แสดงในหน้าแรก
                </p>
              </div>

              <div
                onClick={() => setActiveTab('sponsor')}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  ตั้งค่าข้อมูลสปอนเซอร์
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  แก้ไขชื่อ ตำแหน่ง เบอร์โทร และลิงก์ LINE Official
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LEADS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>กล่องรับรายชื่อผู้มุ่งหวัง (Leads Inbox)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  พบข้อมูลผู้ลงทะเบียนทั้งหมด {leads.length} รายการ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadLeads}
                  disabled={leadsLoading}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`} />
                  <span>รีเฟรช</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportLeadsToExcelCSV(leads)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="ดาวน์โหลดรายชื่อเป็นไฟล์ Excel/CSV"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ส่งออก Excel</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={leadsSearch}
                  onChange={(e) => setLeadsSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, เบอร์โทร, LINE ID หรืออาชีพ..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                {(['all', 'new', 'contacted', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadsStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      leadsStatusFilter === st
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'all' && `ทั้งหมด (${leads.length})`}
                    {st === 'new' && `รอติดต่อ (${leads.filter((l) => l.status === 'new').length})`}
                    {st === 'contacted' && `ติดต่อแล้ว (${leads.filter((l) => l.status === 'contacted').length})`}
                    {st === 'completed' && `ปิดการขาย (${leads.filter((l) => l.status === 'completed').length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">วันที่ / เวลา</th>
                      <th className="py-3 px-4">ชื่อผู้มุ่งหวัง</th>
                      <th className="py-3 px-4">ช่องทางติดต่อ</th>
                      <th className="py-3 px-4">อาชีพ / เป้าหมาย</th>
                      <th className="py-3 px-4">สถานะ</th>
                      <th className="py-3 px-4 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          ไม่พบข้อมูลผู้ลงทะเบียนตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-850 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('th-TH') : '-'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div>{lead.fullName}</div>
                            {lead.age && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                อายุ: {lead.age} ปี
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {lead.phoneNumber && (
                                <a
                                  href={`tel:${lead.phoneNumber}`}
                                  className="text-sky-400 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phoneNumber}</span>
                                </a>
                              )}
                              {lead.lineId && (
                                <a
                                  href={`https://line.me/ti/p/~${lead.lineId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:underline flex items-center gap-1 ml-2"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{lead.lineId}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {lead.occupation || lead.interest || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={lead.status || 'new'}
                              onChange={(e) => lead.id && handleUpdateStatus(lead.id, e.target.value as any)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                lead.status === 'new'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : lead.status === 'contacted'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              <option value="new" className="bg-slate-900 text-white">รอติดต่อ</option>
                              <option value="contacted" className="bg-slate-900 text-white">ติดต่อแล้ว</option>
                              <option value="completed" className="bg-slate-900 text-white">ปิดการขาย</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadForScript(lead);
                                setActiveTab('script');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <Phone className="w-3 h-3" />
                              <span>สคริปต์ 2 นาที</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Call Script Modal Overlay if selected directly from leads */}
            {selectedLeadForScript && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        บทสนทนาโทรคุยสำหรับ: {selectedLeadForScript.fullName}
                      </h4>
                      <p className="text-xs text-slate-400">เบอร์โทร: {selectedLeadForScript.phoneNumber || '-'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLeadForScript(null)}
                      className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <CallScriptView
                    leads={leads}
                    sponsor={sponsor}
                    selectedLead={selectedLeadForScript}
                    onSelectLead={setSelectedLeadForScript}
                    onStatusChange={handleUpdateStatus}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: 2-MINUTE CALL SCRIPT (FIRST-CLASS TAB) */}
        {/* ========================================================= */}
        {activeTab === 'script' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>สคริปต์โทรปิดการสมัครใน 2 นาที (Prospect Call Script)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  เครื่องมือประจำตัวสปอนเซอร์และเว็บลูก ใช้โทรคุย 1-2 นาที เชิญพิมพ์ 88 เข้า LINE เพื่อจองตำแหน่งและคีย์สมัครสมาชิก
                </p>
              </div>

              {selectedLeadForScript && (
                <button
                  type="button"
                  onClick={() => setSelectedLeadForScript(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 cursor-pointer self-start sm:self-auto"
                >
                  สลับเป็นโหมดซ้อมทั่วไป
                </button>
              )}
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <CallScriptView
                leads={leads}
                sponsor={sponsor}
                selectedLead={selectedLeadForScript}
                onSelectLead={setSelectedLeadForScript}
                onStatusChange={handleUpdateStatus}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: GALLERY & MEDIA HUB */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  <span>จัดการอัลบั้มภาพหน้าเว็บ (Interactive Album Hub)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  รูปภาพที่ปรากฏใน Carousel อัลบั้มความสำเร็จหน้าหลัก ({galleryItems.length} ภาพ)
                </p>
              </div>

              {isSuperAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetGalleryDefaults}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>คืนค่าเริ่มต้น</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateHome();
                      setTimeout(() => {
                        const el = document.getElementById('gallery-album');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }, 150);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                    title="ไปที่แถบอัลบั้มภาพบนหน้าแรกเพื่ออัปโหลดภาพไม่จำกัด"
                  >
                    <Upload className="w-4 h-4" />
                    <span>แถบอัลบั้มหน้าแรก & อัปโหลดไม่จำกัด</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartCreateGallery}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มรูปภาพใหม่</span>
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>โหมดดูอย่างเดียว (Admin หลักเป็นผู้ดูแล)</span>
                </div>
              )}
            </div>

            {/* Lock Notice for Satellite User */}
            {!isSuperAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">สิทธิ์เฉพาะ Admin หลักเท่านั้น (เว็บลูกดูตัวอย่างได้เท่านั้น)</p>
                  <p className="text-amber-300/80 text-xs mt-0.5">
                    อัลบั้มภาพหน้าเว็บเป็นสื่อกลางของระบบเพื่อรักษามาตรฐานเดียวกันของเว็บไซต์ สมาชิกเว็บลูกสามารถเปิดดูได้ แต่ไม่สามารถเพิ่ม ลบ หรือแก้ไขได้
                  </p>
                </div>
              </div>
            )}

            {/* Gallery Item Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group hover:border-blue-500/50 transition-all shadow-md"
                >
                  <div className="relative h-44 bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        ลำดับ {idx + 1}
                      </span>
                      {isSuperAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditGallery(item)}
                            className="p-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลรูปภาพ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            title="ลบรูปภาพนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">คงที่ตามระบบ</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Edit/Create Modal */}
            {isGalleryFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                      <span>{editingItem ? 'แก้ไขรูปภาพอัลบั้ม' : 'เพิ่มรูปภาพใหม่ในอัลบั้ม'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsGalleryFormOpen(false)}
                      className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {galleryMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{galleryMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveGallery} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          หมวดหมู่
                        </label>
                        <select
                          value={gCategory}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setGCategory(val);
                            if (val === 'products') setGBadgeColor('bg-blue-600 text-white');
                            if (val === 'seminar') setGBadgeColor('bg-emerald-600 text-white');
                            if (val === 'company') setGBadgeColor('bg-indigo-600 text-white');
                            if (val === 'global') setGBadgeColor('bg-amber-600 text-white');
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        >
                          <option value="products">สินค้าและนวัตกรรม (Products)</option>
                          <option value="seminar">สัมมนา Success Academy</option>
                          <option value="company">สถาบันวิจัย & นวัตกรรม</option>
                          <option value="global">เครือข่าย 26+ ประเทศ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          ข้อความ Badge ป้ายกำกับ
                        </label>
                        <input
                          type="text"
                          value={gBadge}
                          onChange={(e) => setGBadge(e.target.value)}
                          placeholder="เช่น Mass Prestige Products"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        หัวข้อรูปภาพ <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={gTitle}
                        onChange={(e) => setGTitle(e.target.value)}
                        placeholder="ระบุหัวข้อเด่นที่ดึงดูดใจ..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        URL รูปภาพ (ลิงก์เว็บ หรือ /images/...) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={gImageUrl}
                        onChange={(e) => setGImageUrl(e.target.value)}
                        placeholder="https://... หรือ /images/gallery-success-academy.jpg"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        รายละเอียดคำอธิบาย
                      </label>
                      <textarea
                        rows={2}
                        value={gDescription}
                        onChange={(e) => setGDescription(e.target.value)}
                        placeholder="คำอธิบายสรุปสั้นๆ..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                      />
                    </div>

                    {/* Highlight Points */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          จุดเด่น / หลักฐานเชิงประจักษ์
                        </label>
                        <button
                          type="button"
                          onClick={() => setGPoints([...gPoints, ''])}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>เพิ่มจุดเด่น</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {gPoints.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => {
                                const up = [...gPoints];
                                up[pIdx] = e.target.value;
                                setGPoints(up);
                              }}
                              placeholder={`จุดเด่นข้อที่ ${pIdx + 1}`}
                              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                            />
                            {gPoints.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setGPoints(gPoints.filter((_, i) => i !== pIdx))}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsGalleryFormOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={gallerySaveLoading}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{gallerySaveLoading ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SPONSOR PROFILE */}
        {/* ========================================================= */}
        {activeTab === 'sponsor' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white">
                  {isSuperAdmin
                    ? 'ตั้งค่าข้อมูลสปอนเซอร์หลักประจำเว็บไซต์ (Admin หลัก)'
                    : 'ตั้งค่าข้อมูลโปรไฟล์ส่วนตัวของคุณ (สำหรับเว็บพ่วงสปอนเซอร์)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isSuperAdmin
                  ? 'ข้อมูลนี้เป็นข้อมูลเริ่มต้นของระบบกลาง จะแสดงผลเมื่อผู้มุ่งหวังเข้าชมผ่านหน้าแรกโดยไม่มีรหัสผู้แนะนำ'
                  : 'สิทธิสมาชิกเว็บลูก: คุณสามารถแก้ไขเฉพาะข้อมูลติดต่อและข้อมูลโปรไฟล์ส่วนตัวของคุณได้ ซึ่งจะแสดงผลให้ผู้มุ่งหวังเห็นเมื่อเข้าสู่เว็บผ่านลิงก์พ่วงของคุณ'}
              </p>
            </div>

            {/* Satellite member info callout */}
            {!isSuperAdmin && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs sm:text-sm flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">สิทธิเว็บลูก: แก้ไขเฉพาะข้อมูลส่วนตัวของคุณ</p>
                  <p className="text-sky-300/80 text-xs mt-0.5">
                    เมื่อคุณบันทึกข้อมูลส่วนตัว (ชื่อ, เบอร์โทร, LINE ID, รหัสสปอนเซอร์) ข้อมูลนี้จะถูกผูกกับลิงก์เว็บพ่วงของคุณ <span className="font-mono text-white underline select-all">{affiliateUrl}</span> โดยอัตโนมัติ
                  </p>
                </div>
              </div>
            )}

            {sponsorSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>บันทึกข้อมูลสปอนเซอร์สำเร็จเรียบร้อยแล้ว! ข้อมูลหน้าเว็บหลักจะอัปเดตทันที</span>
              </div>
            )}

            <form onSubmit={handleSaveSponsor} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ชื่อ-นามสกุล สปอนเซอร์
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorForm.sponsorName}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ตำแหน่งทางธุรกิจ
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorForm.sponsorPosition}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorPosition: e.target.value })}
                    placeholder="เช่น Star Master, Sales Master"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    รหัสสมาชิก Atomy (Sponsor ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorForm.sponsorId}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.phoneNumber || ''}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, phoneNumber: e.target.value })}
                    placeholder="เช่น 081-234-5678"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    LINE ID
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.lineId}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, lineId: e.target.value })}
                    placeholder="เช่น @atomyteam"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ลิงก์ติดต่อ LINE (LINE URL)
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.lineUrl}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, lineUrl: e.target.value })}
                    placeholder="เช่น https://line.me/ti/p/..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  URL รูปโปรไฟล์สปอนเซอร์
                </label>
                <input
                  type="text"
                  value={sponsorForm.avatarUrl || ''}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, avatarUrl: e.target.value })}
                  placeholder="/profile.jpg หรือ https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ลิงก์คลิปวิดีโอ 20 นาที หน้าหลัก (YouTube Video URL)
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.customVideoUrl || ''}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, customVideoUrl: e.target.value })}
                    placeholder="https://youtu.be/xY6IqUkCljk?si=..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    คลิปวิดีโอเจาะลึก 20 นาทีที่แสดงผลบนหน้าแรก (รองรับทุกลิงก์ YouTube เช่น youtu.be/... หรือ watch?v=...)
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={sponsorSaveLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25"
                >
                  <Save className="w-4 h-4" />
                  <span>{sponsorSaveLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสปอนเซอร์'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SOCIAL SHARE BANNERS */}
        {/* ========================================================= */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>ภาพแบนเนอร์สำหรับแชร์โซเชียล (Social Media Share Card)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ภาพที่จะปรากฏเมื่อคุณนำลิงก์ไปแชร์ลง LINE, Facebook, TikTok หรือข้อความแชต
              </p>
            </div>

            {/* Lock Notice for Satellite Member */}
            {!isSuperAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">สิทธิ์เฉพาะ Admin หลักเท่านั้น (เว็บลูกดูตัวอย่างได้เท่านั้น)</p>
                  <p className="text-amber-300/80 text-xs mt-0.5">
                    ภาพแบนเนอร์แชร์โซเชียลส่วนกลางถูกกำหนดโดย Admin หลัก สมาชิกเว็บลูกสามารถดูตัวอย่างภาพแชร์ได้ แต่ไม่สามารถเปลี่ยนภาพของระบบกลางได้
                  </p>
                </div>
              </div>
            )}

            {bannerNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{bannerNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Banner Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span>Desktop Share Banner (16:9 / 1200x630)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">og-image.jpg</span>
                  </div>

                  <div className="aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 mb-4 flex items-center justify-center">
                    <img
                      src="/og-image.jpg"
                      alt="Desktop Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {isSuperAdmin ? (
                  <div>
                    <label
                      htmlFor="upload-desktop-banner"
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>อัปโหลดแบนเนอร์ Desktop ใหม่</span>
                    </label>
                    <input
                      id="upload-desktop-banner"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadBannerFile(e, 'desktop')}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-500">
                    กำหนดโดย Admin หลัก
                  </div>
                )}
              </div>

              {/* Mobile Banner Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>Mobile Share Banner (เซฟโซน / 1080x1080)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">og-image-mobile.jpg</span>
                  </div>

                  <div className="aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 mb-4 flex items-center justify-center">
                    <img
                      src="/og-image-mobile.jpg"
                      alt="Mobile Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {isSuperAdmin ? (
                  <div>
                    <label
                      htmlFor="upload-mobile-banner"
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-purple-400" />
                      <span>อัปโหลดแบนเนอร์ Mobile ใหม่</span>
                    </label>
                    <input
                      id="upload-mobile-banner"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadBannerFile(e, 'mobile')}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-500">
                    กำหนดโดย Admin หลัก
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: TRACKING PIXELS */}
        {/* ========================================================= */}
        {activeTab === 'pixels' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>ระบบติดตามการตลาด (Tracking Pixels ประจำเว็บไซต์ของคุณ)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ติดตั้งรหัส Pixel เพื่อวัดผลและยิงโฆษณา Retargeting บน Facebook, TikTok และ Google
              </p>
            </div>

            {/* Satellite Notice: Pixels are per-user/per-satellite site */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs sm:text-sm flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">ระบบพิกเซลอิสระประจำแต่ละเว็บ (เว็บของใครของคนนั้น)</p>
                <p className="text-purple-300/90 text-xs mt-1 leading-relaxed">
                  สมาชิกทุกท่านและผู้ดูแลเว็บลูกสามารถใส่รหัส Meta Pixel, TikTok Pixel และ Google Tag เพื่อวัดผลและยิงโฆษณาในลิงก์เว็บพ่วงของตนเองได้ เมื่อเปิดเว็บลูกขึ้นมาใหม่สามารถกรอกรหัสพิกเซลของคุณที่นี่ได้ทันที ระบบจะบันทึกและยิงพิกเซลตามรหัสที่คุณกำหนดไว้
                </p>
              </div>
            </div>

            {pixelSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>บันทึกรหัส Tracking Pixels สำหรับเว็บของคุณเรียบร้อยแล้ว! สคริปต์หน้าเว็บพ่วงจะทำงานตามรหัสนี้ทันที</span>
              </div>
            )}

            <form onSubmit={handleSavePixels} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Meta (Facebook) Pixel ID
                </label>
                <input
                  type="text"
                  value={pixelForm.fbPixelId}
                  onChange={(e) => setPixelForm({ ...pixelForm, fbPixelId: e.target.value })}
                  placeholder="เช่น 123456789012345"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">รหัสพิกเซล Facebook สำหรับติดตามการลงทะเบียนและส่งต่อโฆษณา</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  value={pixelForm.tiktokPixelId}
                  onChange={(e) => setPixelForm({ ...pixelForm, tiktokPixelId: e.target.value })}
                  placeholder="เช่น C1234567890ABCDEF"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">รหัสพิกเซล TikTok สำหรับวัดผลแคมเปญวิดีโอ</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Google Tag Manager ID / GA4 Measurement ID
                </label>
                <input
                  type="text"
                  value={pixelForm.googleTagId}
                  onChange={(e) => setPixelForm({ ...pixelForm, googleTagId: e.target.value })}
                  placeholder="เช่น GTM-XXXXXX หรือ G-XXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">รหัส Google Analytics หรือ Google Tag Manager</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/25 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกรหัสพิกเซลสำหรับเว็บของฉัน</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: 7-DAY EMAIL AUTOMATION HUB */}
        {/* ========================================================= */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span>ระบบส่งอีเมลติดตามผล 7 วัน (7-Day Automated Email Hub)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ต้นแบบเนื้อหาอีเมลที่จะส่งหาผู้มุ่งหวังในแต่ละวัน เพื่อเสริมความมั่นใจและนำเข้าสู่ระบบ Atomy
                </p>
              </div>

              {/* Button to open Full Interactive Email Hub Modal */}
              <button
                type="button"
                onClick={() => setIsEmailHubModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer shrink-0 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>เปิดศูนย์ควบคุมอีเมลฉบับเต็ม (Admin Console)</span>
              </button>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCurrentEmailBody}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedEmailText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedEmailText ? 'คัดลอกเนื้อหาแล้ว!' : `คัดลอกเนื้อหา (วันที่ ${selectedEmailDay})`}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCurrentEmailSubject}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedEmailSubject ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedEmailSubject ? 'คัดลอกหัวข้อแล้ว!' : 'คัดลอกหัวข้ออีเมล'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAll7EmailTemplates}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-colors cursor-pointer"
              >
                {copiedAll7Emails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                <span>{copiedAll7Emails ? 'คัดลอกครบ 7 วันแล้ว!' : 'คัดลอกครบทั้ง 7 วัน'}</span>
              </button>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {emailTemplatesList.map((tmpl) => (
                <button
                  key={tmpl.dayNumber}
                  onClick={() => setSelectedEmailDay(tmpl.dayNumber)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedEmailDay === tmpl.dayNumber
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  วันที่ {tmpl.dayNumber} : {tmpl.phase}
                </button>
              ))}
            </div>

            {/* Email Preview Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="font-bold text-amber-400">หัวข้ออีเมล (Subject):</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {currentEmailTemplate.badge}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {currentEmailTemplate.subject.replace('{name}', 'คุณสมชาย (ผู้มุ่งหวัง)')}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Preheader: {currentEmailTemplate.preheader}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 mb-2">เนื้อหาจดหมาย (Preview):</p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {currentEmailTemplate.storyIntro.replace('{{PROSPECT_NAME}}', 'คุณสมชาย')}
                  {'\n\n'}
                  <strong className="text-white">ประเด็นการเรียนรู้หลัก:</strong>
                  {'\n'}
                  {currentEmailTemplate.coreLessons.map((lesson) => `• ${lesson}`).join('\n')}
                  {'\n\n'}
                  {currentEmailTemplate.psNote}
                  {'\n\n'}
                  <span className="text-slate-400">
                    ด้วยความปรารถนาดี,{'\n'}
                    {sponsor.sponsorName}{'\n'}
                    LINE ID: {sponsor.lineId}
                  </span>
                </div>
              </div>
            </div>

            {/* Embed/Modal for TrainingEmailHubModal */}
            <TrainingEmailHubModal
              isOpen={isEmailHubModalOpen}
              onClose={() => setIsEmailHubModalOpen(false)}
              sponsor={sponsor}
              currentDay={selectedEmailDay}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: HOSTING & CI/CD GUIDE */}
        {/* ========================================================= */}
        {activeTab === 'deploy' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-amber-400" />
                <span>คู่มือและสถานะการขึ้นระบบ (Hosting & CI/CD Deployment)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                โครงสร้างการส่งโค้ดขึ้น Firebase Hosting อัตโนมัติผ่าน GitHub Actions
              </p>
            </div>

            {/* Role Notice for Satellite User */}
            {!isSuperAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">ข้อมูลระบบสำหรับ Admin หลัก</p>
                  <p className="text-amber-300/80 text-xs mt-0.5">
                    คู่มือการขึ้นระบบและการตั้งค่าเซิร์ฟเวอร์เป็นข้อมูลทางเทคนิคสำหรับ Admin หลักของโครงการ Sponsor Atomy
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <h5 className="font-bold">ระบบอัตโนมัติ GitHub Actions เปิดใช้งานอยู่</h5>
                  <p className="mt-0.5 text-slate-300">
                    ทุกครั้งที่คุณกด Save / Share / Sync ใน AI Studio โค้ดจะถูกส่งต่อไปยัง GitHub และทำการ build ขึ้น Firebase Hosting ให้โดยอัตโนมัติ ไม่ต้องรันคำสั่งด้วยมือ
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ขั้นตอนการอัพเดตแบบย่อ:
                </h4>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-amber-400">1. การบันทึกและซิงค์โค้ด:</div>
                  <p className="text-slate-400">
                    เพียงทำการแก้ไขใน AI Studio ระบบจะคอมไพล์และทดสอบอัตโนมัติ
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-amber-400">2. การตรวจสอบการทำงาน:</div>
                  <p className="text-slate-400">
                    สามารถเปิดดูหน้าเว็บจริงได้ตลอดเวลาผ่านลิงก์โดเมนที่คุณผูกไว้กับ Firebase Hosting
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
