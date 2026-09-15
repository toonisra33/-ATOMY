import React, { useState, useRef } from 'react';
import { SponsorProfile } from '../types';
import { DEFAULT_SPONSOR } from '../data/atomyData';
import { X, Copy, Check, ExternalLink, QrCode, Share2, Sparkles, AlertCircle, Link as LinkIcon, Target, Activity, ChevronDown, ChevronUp, Upload, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { saveSponsorProfile } from '../lib/firebase';
import { setupAllPixels } from '../lib/pixel';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSponsor: SponsorProfile;
  onApplySponsor: (newSponsor: SponsorProfile) => void;
  onOpenPixelStatus?: () => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({
  isOpen,
  onClose,
  currentSponsor,
  onApplySponsor,
  onOpenPixelStatus,
}) => {
  const [formData, setFormData] = useState<SponsorProfile>({ ...currentSponsor });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPixelSettings, setShowPixelSettings] = useState<boolean>(
    Boolean(currentSponsor.fbPixelId || currentSponsor.tiktokPixelId || currentSponsor.googleTagId)
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compress uploaded photo to fit smoothly in localStorage and Firestore
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to efficient JPEG
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressedDataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData((prev) => ({ ...prev, avatarUrl: compressedBase64 }));
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };

  if (!isOpen) return null;

  // Build the generated affiliate URL based on window.location
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://example.com';
  
  // Create a clean URL with ONLY the ref parameter. Data will be fetched from Firestore.
  const queryParams = new URLSearchParams({
    ref: formData.sponsorId.trim() || 'ATOMY888',
  });

  const generatedAffiliateUrl = `${baseUrl}?${queryParams.toString()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatedAffiliateUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleApplyAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update React state in parent App
      onApplySponsor(formData);

      // 2. Persist to localStorage permanently so page refreshes retain user's photo
      try {
        localStorage.setItem('atomy_custom_sponsor', JSON.stringify(formData));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      // 3. Push state to browser URL without reload (Clean URL)
      window.history.pushState({}, '', generatedAffiliateUrl);

      // 4. Initialize & fire pixels immediately
      setupAllPixels({
        fbPixelId: formData.fbPixelId,
        tiktokPixelId: formData.tiktokPixelId,
        googleTagId: formData.googleTagId,
      });

      // 5. Save to Firebase Firestore
      await saveSponsorProfile(formData);
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
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

        {/* Form Inputs */}
        <form onSubmit={handleApplyAndPreview} className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสสปอนเซอร์ของคุณ (Sponsor ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sponsorId}
                onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                placeholder="เช่น TH3892011"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล หรือชื่อเรียกในสายงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sponsorName}
                onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                placeholder="เช่น คุณสมชาย อะโทมี่ลีดเดอร์"
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
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    lineId: val,
                    lineUrl: val.startsWith('http') ? val : `https://line.me/ti/p/~${val}`,
                  });
                }}
                placeholder="เช่น @atomyteam หรือ somchai_atomy"
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
                placeholder="https://line.me/ti/p/~..."
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="เช่น 089-123-4567"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง / สายงาน
              </label>
              <input
                type="text"
                value={formData.sponsorPosition}
                onChange={(e) => setFormData({ ...formData, sponsorPosition: e.target.value })}
                placeholder="เช่น Sales Master / ที่ปรึกษาธุรกิจ"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                รหัสผ่าน PIN (ดูรายชื่อ Leads) <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                maxLength={6}
                value={formData.pinHash || ''}
                onChange={(e) => setFormData({ ...formData, pinHash: e.target.value })}
                placeholder="ตั้ง PIN 4-6 หลัก เพื่อล็อกอินดู Leads"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อทีม / สายงาน (Team Name)
              </label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                placeholder="Atomy Thailand Team freedomlife"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[42px]"
              />
            </div>

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
                {/* Image Preview */}
                <div className="relative shrink-0">
                  <img
                    src={formData.avatarUrl || DEFAULT_SPONSOR.avatarUrl}
                    alt="Preview"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 border-blue-500 shadow-md shadow-slate-200"
                  />
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow cursor-pointer transition-transform hover:scale-110"
                      title="ลบรูปภาพ"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Upload & URL Input Options */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.jfif,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัพโหลดรูปจากเครื่อง</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      รองรับ JPG, PNG, WebP
                    </span>
                  </div>

                  {/* Or image URL */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">หรือใส่ URL:</span>
                    <input
                      type="url"
                      value={formData.avatarUrl?.startsWith('data:') ? '' : formData.avatarUrl || ''}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Ad & Pixel Tracking Accordion */}
          <div className="border border-purple-200/80 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-blue-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowPixelSettings(!showPixelSettings)}
                className="flex items-center gap-2 text-left cursor-pointer group min-w-0 flex-1"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 flex flex-wrap items-center gap-1">
                    <span>ตั้งค่า Pixel สำหรับยิงแอด</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-200/60 text-purple-800 rounded font-medium">
                      Tracking
                    </span>
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                    ใส่ Pixel ID ยิง Conversion เข้าบัญชีของคุณโดยตรง
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenPixelStatus && (
                  <button
                    type="button"
                    onClick={onOpenPixelStatus}
                    className="text-[10px] sm:text-[11px] text-purple-700 hover:text-purple-900 bg-white border border-purple-300 px-2 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer shadow-2xs hover:bg-purple-50 transition-colors"
                  >
                    <Activity className="w-3 h-3" />
                    <span className="hidden xs:inline">เช็ค Pixel</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPixelSettings(!showPixelSettings)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  {showPixelSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showPixelSettings && (
              <div className="mt-3 pt-3 border-t border-purple-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 animate-in fade-in duration-200">
                {/* Meta Pixel */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Meta Pixel ID</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fbPixelId || ''}
                    onChange={(e) => setFormData({ ...formData, fbPixelId: e.target.value })}
                    placeholder="เช่น 123456789012345"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500 transition-all min-h-[38px]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">ตัวเลข 15-16 หลัก</span>
                </div>

                {/* TikTok Pixel */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-pink-600" />
                    <span>TikTok Pixel ID</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tiktokPixelId || ''}
                    onChange={(e) => setFormData({ ...formData, tiktokPixelId: e.target.value })}
                    placeholder="เช่น C78AB90CDE1234"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500 transition-all min-h-[38px]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">จาก Ads Manager</span>
                </div>

                {/* Google Tag */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Google Tag ID</span>
                  </label>
                  <input
                    type="text"
                    value={formData.googleTagId || ''}
                    onChange={(e) => setFormData({ ...formData, googleTagId: e.target.value })}
                    placeholder="เช่น G-XXXXXXXXXX"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500 transition-all min-h-[38px]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Measurement ID</span>
                </div>
              </div>
            )}
          </div>

          {/* Generated Satellite URL Preview Box */}
          <div className="mt-4 p-3.5 sm:p-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ลิงก์เว็บพ่วงส่วนตัวของคุณ:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md cursor-pointer border border-slate-700 shrink-0"
              >
                <QrCode className="w-3 h-3" />
                <span>{showQr ? 'ซ่อน' : 'QR Code'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] sm:text-xs text-sky-200 break-all select-all">
              {generatedAffiliateUrl}
            </div>

            {/* QR Code Expansion */}
            {showQr && (
              <div className="mt-3 p-3 bg-white rounded-xl text-center inline-block w-full">
                <img
                  src={qrCodeUrl}
                  alt="Generated Satellite QR"
                  className="w-36 h-36 mx-auto rounded-lg"
                />
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-2 font-sans font-medium">
                  สแกนหรือบันทึกภาพ QR Code นี้ไปใส่ในป้ายประชาสัมพันธ์ได้ทันที
                </p>
              </div>
            )}

            {/* Action Bar inside Box */}
            <div className="mt-3">
              <button
                type="button"
                id="btn-copy-affiliate-url"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์เว็บพ่วงนี้'}</span>
              </button>
            </div>
          </div>

          {/* Strategy Tip */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] sm:text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-pretty">
              <strong>แนวทางใช้งานเว็บพ่วง:</strong> นำลิงก์นี้ไปใส่ใน Bio TikTok, Facebook หรือส่งให้ผู้สนใจ เมื่อผู้มุ่งหวังดูวิดีโอจบ จะมีปุ่มทักเข้า LINE Official ของคุณโดยตรงพร้อมระบุรหัสสปอนเซอร์ของคุณ!
            </div>
          </div>

          {/* Modal Actions */}
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
