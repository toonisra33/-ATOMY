import React, { useState, useRef, useEffect } from 'react';
import { SponsorProfile } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { X, Copy, Check, QrCode, Share2, Sparkles, Link as LinkIcon, Lock, Activity, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Loader2, Upload } from 'lucide-react';
import { saveSponsorProfile } from '../lib/firebase';
import { setupAllPixels } from '../lib/pixel';
import { registerWithEmail } from '../lib/auth';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSponsor: SponsorProfile;
  ownerUid: string;
  onApplySponsor: (newSponsor: SponsorProfile) => void;
  onOpenPixelStatus?: () => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({
  isOpen,
  onClose,
  currentSponsor,
  ownerUid,
  onApplySponsor,
  onOpenPixelStatus,
}) => {
  const [formData, setFormData] = useState<SponsorProfile>({ ...currentSponsor });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize empty fields for new users
  useEffect(() => {
    if (isOpen) {
      if (!ownerUid) {
        setFormData({
          ...currentSponsor,
          sponsorId: '',
          sponsorName: '',
          lineId: '',
          lineUrl: '',
          phoneNumber: '',
          avatarUrl: '',
          fbPixelId: '',
          tiktokPixelId: '',
          googleTagId: ''
        });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAuthError('');
      } else {
        setFormData({ ...currentSponsor });
      }
    }
  }, [isOpen, currentSponsor, ownerUid]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ใหญ่เกิน 5MB กรุณาเลือกรูปอื่น');
      return;
    }
    try {
      const compressedBase64 = await compressImage(file);
      setFormData({ ...formData, avatarUrl: compressedBase64 });
    } catch (err) {
      console.warn('Image compression failed:', err);
    }
  };

  if (!isOpen) return null;

  const generatedAffiliateUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?ref=${formData.sponsorId}`
    : '';

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(generatedAffiliateUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleApplyAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAuthError('');
    try {
      let finalOwnerUid = ownerUid;
      
      if (!ownerUid && email && password) {
        if (password !== confirmPassword) {
          setAuthError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
          setIsSaving(false);
          return;
        }
        try {
          const session = await registerWithEmail(email, password);
          finalOwnerUid = session.uid;
        } catch (authErr: any) {
          setIsSaving(false);
          setAuthError('Error: ' + (authErr.message || authErr.code));
          return;
        }
      } else if (!ownerUid) {
          setIsSaving(false);
          setAuthError('กรุณาสร้างบัญชี (อีเมลและรหัสผ่าน) เพื่อใช้จัดการหน้าเว็บและรายชื่อของคุณ');
          return;
      }

      onApplySponsor(formData);

      try {
        localStorage.setItem('atomy_custom_sponsor', JSON.stringify(formData));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      window.history.pushState({}, '', generatedAffiliateUrl);

      setupAllPixels({
        fbPixelId: formData.fbPixelId,
        tiktokPixelId: formData.tiktokPixelId,
        googleTagId: formData.googleTagId,
      });

      await saveSponsorProfile(formData, finalOwnerUid);
      onClose();
    } catch (err) {
      console.warn('Sync error:', err);
      setAuthError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
              สร้างเว็บพ่วงของคุณ (Satellite Link)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 text-pretty">
              ระบบขยายสายงาน Atomy: ใส่ข้อมูลเพื่อรับลิงก์เว็บพ่วงในชื่อและรูปภาพของคุณ
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyAndPreview} className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล หรือชื่อเรียกในสายงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sponsorName}
                onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                placeholder="เช่น อิศราวัฒน์ ปวินทกานต์ (คุณทูน)"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LINE Official ID หรือ LINE ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lineId}
                onChange={(e) => setFormData({ ...formData, lineId: e.target.value, lineUrl: `https://lin.ee/${e.target.value.replace('@', '')}` })}
                placeholder="เช่น @atomyth"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ลิงก์ LINE (Auto Link)
              </label>
              <input
                type="url"
                value={formData.lineUrl}
                onChange={(e) => setFormData({ ...formData, lineUrl: e.target.value })}
                placeholder="https://lin.ee/..."
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อทีม / สายงาน (Team Name)
              </label>
              <input
                type="text"
                value={formData.teamName || ''}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                placeholder="เช่น Atomy Thailand Team"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="เช่น 093-XXX-XXXX"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง
              </label>
              <input
                type="text"
                value={formData.sponsorPosition || ''}
                onChange={(e) => setFormData({ ...formData, sponsorPosition: e.target.value })}
                placeholder="เช่น ที่ปรึกษาธุรกิจ"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ข้อความต้อนรับ / สโลแกนที่จะแสดงในพรีวิวการแชร์
              </label>
              <input
                type="text"
                value={formData.welcomeNote || ''}
                onChange={(e) => setFormData({ ...formData, welcomeNote: e.target.value })}
                placeholder="เช่น ยินดีต้อนรับสู่ทีมงาน Atomy ร่วมสร้าง passive income ด้วยกันครับ"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            {/* Account Creation Block */}
            {!ownerUid && (
              <div className="sm:col-span-2 mt-2 bg-blue-50/50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">สร้างบัญชีสำหรับจัดการเว็บไซต์และรายชื่อ Leads</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      อีเมล (Email) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="อีเมลของคุณ"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      ตั้งรหัสผ่าน (Password) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      ยืนยันรหัสผ่าน (Confirm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 transition-all min-h-[42px]"
                    />
                  </div>
                </div>
                {authError && <p className="mt-2 text-[11px] font-semibold text-red-500">{authError}</p>}
              </div>
            )}

            {/* Avatar / Real Photo Upload */}
            <div className="sm:col-span-2 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>รูปภาพจริงของผู้ใช้งาน / สปอนเซอร์ (Profile Photo)</span>
                </span>
                {formData.avatarUrl && (
                  <span className="text-[10px] text-emerald-600 font-medium">
                    ✓ มีรูปแล้ว
                  </span>
                )}
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative group">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: undefined })}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    อัพโหลดรูปจากเครื่อง
                  </button>
                  <p className="text-[10px] text-slate-500">รองรับ JPG, PNG, WebP (บีบอัดให้อัตโนมัติ)</p>
                </div>
              </div>
            </div>

            {/* Social Share Preview Card (LINE / Facebook / TikTok) */}
            <div className="sm:col-span-2 p-3.5 sm:p-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span className="text-xs sm:text-sm font-bold text-white">
                    ตัวอย่างรูปพรีวิวเวลาแชร์ลิงก์ (Social Share Preview)
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  1200 x 630 HD
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-md">
                <div className="relative aspect-video sm:aspect-[1200/630] max-h-[170px] sm:max-h-[220px] w-full bg-slate-900 overflow-hidden">
                  <img
                    src="/og-image.jpg"
                    alt="Atomy Preview Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-400 overflow-hidden bg-white shrink-0">
                        <img
                          src={formData.avatarUrl || '/profile.jpg'}
                          alt="Sponsor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-[11px] font-bold text-white truncate">
                          {formData.sponsorName || 'สปอนเซอร์ผู้ดูแลสายงาน'}
                        </div>
                        <div className="text-[9px] text-slate-300">
                          ที่ปรึกษาธุรกิจ Atomy Global
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border-t border-slate-800 text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    SPONSOR-ATOMY.WEB.APP
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                    {formData.sponsorName ? `${formData.sponsorName} - ที่ปรึกษาธุรกิจ Atomy` : 'Atomy Satellite Funnel - เว็บพ่วงสปอนเซอร์ผู้มุ่งหวัง'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {formData.welcomeNote || 'ระบบเว็บพ่วงส่งต่อสายงานและสปอนเซอร์ผู้มุ่งหวัง ธุรกิจอะโทมี่ พร้อมวิดีโอบรรยาย 15 นาที และช่องทางติดต่อ LINE Official'}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                💡 เวลาคัดลอกลิงก์นี้ไปส่งในแชท LINE, โพสต์บน Facebook หรือปักหมุดใน Bio TikTok ระบบจะดึงรูปแบนเนอร์ Atomy คุณภาพสูงนี้ขึ้นแสดงเป็นการ์ดตัวอย่างอัตโนมัติ
              </p>
            </div>

          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] sm:text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-pretty">
              <strong>แนวทางใช้งานเว็บพ่วง:</strong> นำลิงก์นี้ไปใส่ใน Bio TikTok, Facebook หรือส่งให้ผู้สนใจ เมื่อผู้มุ่งหวังดูวิดีโอจบ จะมีปุ่มทักเข้า LINE Official ของคุณโดยตรงเพื่อขอข้อมูลและเริ่มธุรกิจทันที!
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              ปิด
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก & ทดลองดูหน้าเว็บพ่วงนี้'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
