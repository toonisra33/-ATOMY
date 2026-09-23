import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Link,
  Save,
  HelpCircle
} from 'lucide-react';
import { GalleryItem, ATOMY_GALLERY_ITEMS } from './ImageGalleryAlbum';
import {
  saveGalleryItem,
  deleteGalleryItem,
  resetGalleryToDefault
} from '../lib/galleryService';

interface AdminGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  onItemsChange: (items: GalleryItem[]) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'products', label: 'สินค้าและนวัตกรรม', badgeColor: 'bg-blue-600 text-white' },
  { value: 'seminar', label: 'สัมมนา Success Academy', badgeColor: 'bg-emerald-600 text-white' },
  { value: 'company', label: 'สถาบันวิจัย & นวัตกรรม', badgeColor: 'bg-indigo-600 text-white' },
  { value: 'global', label: 'เครือข่าย 26+ ประเทศ', badgeColor: 'bg-amber-600 text-white' },
];

export const AdminGalleryModal: React.FC<AdminGalleryModalProps> = ({
  isOpen,
  onClose,
  items,
  onItemsChange,
}) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'products' | 'seminar' | 'company' | 'global'>('products');
  const [formBadge, setFormBadge] = useState('');
  const [formBadgeColor, setFormBadgeColor] = useState('bg-blue-600 text-white');
  const [formDescription, setFormDescription] = useState('');
  const [formPoints, setFormPoints] = useState<string[]>(['']);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Initialize editing
  const handleStartEdit = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormBadge(item.badge);
    setFormBadgeColor(item.badgeColor || 'bg-blue-600 text-white');
    setFormDescription(item.description);
    setFormPoints(item.highlightPoints.length > 0 ? [...item.highlightPoints] : ['']);
    setFormImageUrl(item.imageUrl);
    setFormCaption(item.caption);
    setImagePreviewError(false);
    setIsEditing(true);
    setErrorMessage('');
    setSaveSuccess(false);
  };

  const handleStartCreate = () => {
    const newId = `item-${Date.now()}`;
    setSelectedItem(null);
    setFormId(newId);
    setFormTitle('');
    setFormCategory('products');
    setFormBadge('Mass Prestige Products');
    setFormBadgeColor('bg-blue-600 text-white');
    setFormDescription('');
    setFormPoints(['', '']);
    setFormImageUrl('');
    setFormCaption('');
    setImagePreviewError(false);
    setIsEditing(true);
    setErrorMessage('');
    setSaveSuccess(false);
  };

  const handleCategoryChange = (cat: 'products' | 'seminar' | 'company' | 'global') => {
    setFormCategory(cat);
    const matched = CATEGORY_OPTIONS.find((c) => c.value === cat);
    if (matched) {
      setFormBadgeColor(matched.badgeColor);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('ไฟล์ภาพมีขนาดใหญ่เกิน 4MB แนะนำให้บีบอัดภาพก่อน');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormImageUrl(dataUrl);
        setImagePreviewError(false);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMessage('กรุณาระบุหัวข้อของภาพ');
      return;
    }
    if (!formImageUrl.trim()) {
      setErrorMessage('กรุณาใส่ลิงก์รูปภาพ หรืออัปโหลดไฟล์รูปภาพ');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const cleanedPoints = formPoints
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const newItem: GalleryItem = {
        id: formId || `item-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        badge: formBadge.trim() || 'Atomy Showcase',
        badgeColor: formBadgeColor,
        description: formDescription.trim(),
        highlightPoints: cleanedPoints.length > 0 ? cleanedPoints : ['จุดเด่นคุณภาพมาตรฐานสากล'],
        imageUrl: formImageUrl.trim(),
        caption: formCaption.trim() || formTitle.trim(),
      };

      await saveGalleryItem(newItem);

      // Update state in UI
      const existingIdx = items.findIndex((i) => i.id === newItem.id);
      let updatedItems: GalleryItem[];
      if (existingIdx >= 0) {
        updatedItems = [...items];
        updatedItems[existingIdx] = newItem;
      } else {
        updatedItems = [newItem, ...items];
      }

      onItemsChange(updatedItems);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้ออกจากอัลบั้ม?')) {
      return;
    }

    try {
      await deleteGalleryItem(itemId);
      const updated = items.filter((i) => i.id !== itemId);
      onItemsChange(updated);
      if (selectedItem?.id === itemId) {
        setIsEditing(false);
        setSelectedItem(null);
      }
    } catch (err: any) {
      alert('ไม่สามารถลบได้: ' + (err?.message || 'เกิดข้อผิดพลาด'));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('คุณต้องการรีเซ็ตอัลบั้มภาพกลับเป็นค่าเริ่มต้นทั้งหมดหรือไม่? (ข้อมูลที่เพิ่มเองจะถูกลบ)')) {
      const defaults = resetGalleryToDefault();
      onItemsChange(defaults);
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                  Admin Exclusive
                </span>
                <span className="text-xs text-slate-400">จัดการอัลบั้มภาพความสำเร็จ</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white">
                {isEditing ? (selectedItem ? 'แก้ไขรูปภาพและข้อมูล' : 'เพิ่มรูปภาพใหม่ในอัลบั้ม') : 'ศูนย์จัดการอัลบั้มภาพ (Admin Gallery Hub)'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {/* View 1: List & Actions */}
          {!isEditing ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    รูปภาพทั้งหมดในอัลบั้ม ({items.length} รูป) สามารถคลิกแก้ไข ลบ หรืออัปโหลดรูปภาพใหม่ได้ทันที
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="คืนค่าอัลบั้มภาพเดิมของระบบ"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>คืนค่าเริ่มต้น</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มรูปภาพใหม่</span>
                  </button>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col group hover:border-blue-500/50 transition-all shadow-md"
                  >
                    <div className="relative h-40 bg-slate-950 flex items-center justify-center overflow-hidden p-2">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mb-1.5">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono">
                          ลำดับที่ {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลรูปภาพนี้"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                            title="ลบรูปภาพนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* View 2: Edit or Create Form */
            <form onSubmit={handleSave} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>บันทึกข้อมูลเรียบร้อยแล้ว! กำลังกลับสู่หน้ารายการ...</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Image Upload & Preview */}
                <div className="md:col-span-5 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    รูปภาพที่ต้องการแสดง (URL หรือ อัปโหลด)
                  </label>

                  {/* Image Preview Box */}
                  <div className="relative min-h-[220px] bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 p-3 flex flex-col items-center justify-center overflow-hidden">
                    {formImageUrl && !imagePreviewError ? (
                      <div className="relative w-full h-full flex flex-col items-center">
                        <img
                          src={formImageUrl}
                          alt="พรีวิวรูปภาพ"
                          className="max-h-48 w-auto object-contain rounded-xl shadow-md"
                          onError={() => setImagePreviewError(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="mt-2 text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
                        >
                          ลบรูปนี้ / เปลี่ยนรูปใหม่
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 mb-1">ยังไม่มีรูปภาพ หรือลิงก์ไม่ถูกต้อง</p>
                        <p className="text-[11px] text-slate-500">ใส่ลิงก์รูป หรือเลือกไฟล์ด้านล่าง</p>
                      </div>
                    )}
                  </div>

                  {/* File Upload Button */}
                  <div>
                    <label
                      htmlFor="gallery-file-input"
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>อัปโหลดรูปจากเครื่อง (PNG, JPG)</span>
                    </label>
                    <input
                      id="gallery-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Direct Image URL Input */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      หรือระบุ URL รูปภาพโดยตรง (Web URL หรือ /images/...):
                    </label>
                    <div className="relative">
                      <Link className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => {
                          setFormImageUrl(e.target.value);
                          setImagePreviewError(false);
                        }}
                        placeholder="https://example.com/image.jpg หรือ /images/..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Title, Category & Details */}
                <div className="md:col-span-7 space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      หมวดหมู่ของภาพ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategoryChange(cat.value as any)}
                          className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                            formCategory === cat.value
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      หัวข้อหลักของภาพ <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="เช่น บรรยากาศงาน Atomy Success Academy ประจำเดือน"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>

                  {/* Badge Text */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        ข้อความป้าย Badge (สั้นๆ)
                      </label>
                      <input
                        type="text"
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        placeholder="เช่น Global Seminar"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                        คำบรรยายใต้รูป (Caption)
                      </label>
                      <input
                        type="text"
                        value={formCaption}
                        onChange={(e) => setFormCaption(e.target.value)}
                        placeholder="เช่น บรรยากาศการอบรมความสำเร็จ"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      รายละเอียดคำอธิบาย
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      placeholder="อธิบายว่าภาพนี้สื่อถึงอะไร ช่วยสร้างความเชื่อมั่นอย่างไร..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Highlight Bullets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        จุดเด่นหรือหลักฐานเชิงประจักษ์ (ข้อๆ)
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormPoints([...formPoints, ''])}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>เพิ่มข้อ</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formPoints.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const updated = [...formPoints];
                              updated[pIdx] = e.target.value;
                              setFormPoints(updated);
                            }}
                            placeholder={`จุดเด่นข้อที่ ${pIdx + 1}`}
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                          {formPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormPoints(formPoints.filter((_, i) => i !== pIdx));
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  ย้อนกลับไปหน้ารายการ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกรูปภาพนี้'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
