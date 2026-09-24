import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Building2,
  Globe,
  Award,
  Package,
  RotateCcw,
  Star,
  Check,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { SponsorProfile } from '../types';
import {
  AlbumItem,
  AlbumPhoto,
  DEFAULT_ATOMY_ALBUMS,
  fetchAlbums,
  saveAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  deletePhotoFromAlbum,
  setAlbumCover,
  resetAlbumsToDefault,
  compressImageFile,
  GalleryItem,
  ATOMY_GALLERY_ITEMS
} from '../lib/galleryService';

// Re-export for backward compatibility
export type { GalleryItem };
export { ATOMY_GALLERY_ITEMS };

interface ImageGalleryAlbumProps {
  sponsor: SponsorProfile;
  onOpenLineModal: () => void;
  isAdmin?: boolean;
}

export const ImageGalleryAlbum: React.FC<ImageGalleryAlbumProps> = ({
  sponsor,
  onOpenLineModal,
  isAdmin = false,
}) => {
  const [albums, setAlbums] = useState<AlbumItem[]>(DEFAULT_ATOMY_ALBUMS);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(DEFAULT_ATOMY_ALBUMS[0].id);
  const [activeCategory, setActiveCategory] = useState<'all' | 'products' | 'seminar' | 'company' | 'global'>('all');
  
  // Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Developer Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [isEditAlbumModalOpen, setIsEditAlbumModalOpen] = useState(false);

  // Upload modal local state
  const [uploadFiles, setUploadFiles] = useState<{ file: File; preview: string; caption: string }[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Create / Edit Album local state
  const [albumFormTitle, setAlbumFormTitle] = useState('');
  const [albumFormCategory, setAlbumFormCategory] = useState<'products' | 'seminar' | 'company' | 'global'>('products');
  const [albumFormBadge, setAlbumFormBadge] = useState('');
  const [albumFormBadgeColor, setAlbumFormBadgeColor] = useState('bg-blue-600 text-white');
  const [albumFormDescription, setAlbumFormDescription] = useState('');
  const [albumFormCoverUrl, setAlbumFormCoverUrl] = useState('');
  const [albumFormPoints, setAlbumFormPoints] = useState<string[]>(['', '']);
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);

  // Horizontal Strip Scroll Ref
  const stripScrollRef = useRef<HTMLDivElement | null>(null);

  // Load albums from Firestore / LocalStorage
  useEffect(() => {
    let isMounted = true;
    fetchAlbums().then((loaded) => {
      if (isMounted && loaded && loaded.length > 0) {
        setAlbums(loaded);
        if (!loaded.some((a) => a.id === selectedAlbumId)) {
          setSelectedAlbumId(loaded[0].id);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter albums by category
  const filteredAlbums = activeCategory === 'all'
    ? albums
    : albums.filter((a) => a.category === activeCategory);

  // Active Selected Album
  const activeAlbum = albums.find((a) => a.id === selectedAlbumId) || filteredAlbums[0] || albums[0];

  // Handle horizontal strip scrolling
  const scrollStrip = (direction: 'left' | 'right') => {
    if (stripScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      stripScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null || !activeAlbum) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % activeAlbum.photos.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + activeAlbum.photos.length) % activeAlbum.photos.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, activeAlbum]);

  // -------------------------------------------------------------------
  // UPLOAD HANDLERS (Developer / Admin Unlimited Uploads)
  // -------------------------------------------------------------------
  const handleOpenUploadModal = (albumId?: string) => {
    if (albumId) setSelectedAlbumId(albumId);
    setUploadFiles([]);
    setUrlInput('');
    setUploadError('');
    setUploadProgress('');
    setUploadSuccess(false);
    setIsUploadModalOpen(true);
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = Array.from(e.target.files);
    const newItems = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: file.name.replace(/\.[^/.]+$/, ''),
    }));
    setUploadFiles((prev) => [...prev, ...newItems]);
    setUploadError('');
  };

  const handleAddUrl = () => {
    const raw = urlInput.trim();
    if (!raw) return;

    // Support comma or newline separated URLs
    const urls = raw
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && u.startsWith('http'));

    if (urls.length === 0) {
      setUploadError('กรุณาระบุ URL รูปภาพที่ถูกต้อง (ขึ้นต้นด้วย http:// หรือ https://)');
      return;
    }

    const dummyFiles = urls.map((url, i) => {
      // Create a virtual file entry
      const blob = new Blob([''], { type: 'image/jpeg' });
      const file = new File([blob], `image-url-${i}.jpg`, { type: 'image/jpeg' });
      return {
        file,
        preview: url,
        caption: activeAlbum?.title ? `${activeAlbum.title} (ภาพที่ ${i + 1})` : 'รูปภาพ Atomy',
      };
    });

    setUploadFiles((prev) => [...prev, ...dummyFiles]);
    setUrlInput('');
    setUploadError('');
  };

  const handleRemoveQueuedFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteUpload = async () => {
    if (uploadFiles.length === 0) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพหรือกรอก URL ก่อนทำการอัปโหลด');
      return;
    }

    if (!activeAlbum) return;

    setIsUploading(true);
    setUploadError('');
    setUploadProgress('กำลังเริ่มต้นการประมวลผลรูปภาพ...');

    try {
      const processedPhotos: AlbumPhoto[] = [];

      for (let i = 0; i < uploadFiles.length; i++) {
        const item = uploadFiles[i];
        setUploadProgress(`กำลังปรับขนาดและประมวลผลรูปภาพ ${i + 1} จาก ${uploadFiles.length}...`);

        let finalUrl = item.preview;

        // If it's a real file (not a direct http url), compress it
        if (!item.preview.startsWith('http')) {
          try {
            finalUrl = await compressImageFile(item.file, 1400, 0.85);
          } catch (err) {
            console.warn('Could not compress image, using original read:', err);
          }
        }

        processedPhotos.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          url: finalUrl,
          title: item.caption || `ภาพประกอบ ${activeAlbum.title}`,
          caption: item.caption || '',
          uploadedAt: Date.now(),
        });
      }

      setUploadProgress('กำลังบันทึกลงระบบคลาวด์และฐานข้อมูล...');
      const { albums: updatedAlbums } = await addPhotosToAlbum(activeAlbum.id, processedPhotos);
      setAlbums(updatedAlbums);

      setUploadSuccess(true);
      setUploadProgress(`อัปโหลดสำเร็จแล้ว ${processedPhotos.length} รูปภาพ!`);

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setIsUploading(false);
        setUploadFiles([]);
      }, 1200);
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setUploadError('เกิดข้อผิดพลาดในการอัปโหลด: ' + (err?.message || ''));
      setIsUploading(false);
    }
  };

  // -------------------------------------------------------------------
  // ALBUM MANAGEMENT HANDLERS (Create / Edit / Delete)
  // -------------------------------------------------------------------
  const handleOpenCreateAlbum = () => {
    setAlbumFormTitle('');
    setAlbumFormCategory('products');
    setAlbumFormBadge('Mass Prestige Products');
    setAlbumFormBadgeColor('bg-blue-600 text-white');
    setAlbumFormDescription('');
    setAlbumFormCoverUrl('');
    setAlbumFormPoints(['', '']);
    setIsCreateAlbumModalOpen(true);
  };

  const handleOpenEditAlbum = () => {
    if (!activeAlbum) return;
    setAlbumFormTitle(activeAlbum.title);
    setAlbumFormCategory(activeAlbum.category as any);
    setAlbumFormBadge(activeAlbum.badge);
    setAlbumFormBadgeColor(activeAlbum.badgeColor);
    setAlbumFormDescription(activeAlbum.description);
    setAlbumFormCoverUrl(activeAlbum.coverImageUrl);
    setAlbumFormPoints(activeAlbum.highlightPoints && activeAlbum.highlightPoints.length > 0 ? [...activeAlbum.highlightPoints] : ['', '']);
    setIsEditAlbumModalOpen(true);
  };

  const handleSaveNewAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumFormTitle.trim()) {
      alert('กรุณาระบุชื่ออัลบั้ม');
      return;
    }

    setIsSavingAlbum(true);
    try {
      const newAlbumId = `album-${Date.now()}`;
      const newAlbum: AlbumItem = {
        id: newAlbumId,
        title: albumFormTitle.trim(),
        category: albumFormCategory,
        badge: albumFormBadge.trim() || 'Atomy Showcase',
        badgeColor: albumFormBadgeColor,
        description: albumFormDescription.trim(),
        coverImageUrl: albumFormCoverUrl.trim() || '/images/atomy-flagship-products.png',
        photos: albumFormCoverUrl.trim()
          ? [
              {
                id: `p-${Date.now()}`,
                url: albumFormCoverUrl.trim(),
                title: albumFormTitle.trim(),
                caption: albumFormDescription.trim(),
              },
            ]
          : [],
        highlightPoints: albumFormPoints.filter((p) => p.trim().length > 0),
        updatedAt: Date.now(),
      };

      const updated = await saveAlbum(newAlbum);
      setAlbums(updated);
      setSelectedAlbumId(newAlbumId);
      setIsCreateAlbumModalOpen(false);
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err?.message);
    } finally {
      setIsSavingAlbum(false);
    }
  };

  const handleSaveEditAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlbum || !albumFormTitle.trim()) return;

    setIsSavingAlbum(true);
    try {
      const updated: AlbumItem = {
        ...activeAlbum,
        title: albumFormTitle.trim(),
        category: albumFormCategory,
        badge: albumFormBadge.trim() || activeAlbum.badge,
        badgeColor: albumFormBadgeColor,
        description: albumFormDescription.trim(),
        coverImageUrl: albumFormCoverUrl.trim() || activeAlbum.coverImageUrl,
        highlightPoints: albumFormPoints.filter((p) => p.trim().length > 0),
        updatedAt: Date.now(),
      };

      const newAlbums = await saveAlbum(updated);
      setAlbums(newAlbums);
      setIsEditAlbumModalOpen(false);
    } catch (err: any) {
      alert('แก้ไขไม่สำเร็จ: ' + err?.message);
    } finally {
      setIsSavingAlbum(false);
    }
  };

  const handleDeleteActiveAlbum = async () => {
    if (!activeAlbum) return;
    if (!window.confirm(`คุณต้องการลบอัลบั้ม "${activeAlbum.title}" พร้อมรูปภาพทั้งหมดใช่หรือไม่?`)) return;

    try {
      const remaining = await deleteAlbum(activeAlbum.id);
      setAlbums(remaining);
      if (remaining.length > 0) {
        setSelectedAlbumId(remaining[0].id);
      }
    } catch (err: any) {
      alert('ลบอัลบั้มไม่สำเร็จ: ' + err?.message);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!activeAlbum) return;
    if (!window.confirm('คุณต้องการลบรูปภาพนี้ออกจากอัลบั้มใช่หรือไม่?')) return;

    try {
      const { albums: newAlbums } = await deletePhotoFromAlbum(activeAlbum.id, photoId);
      setAlbums(newAlbums);
    } catch (err: any) {
      alert('ลบรูปภาพไม่สำเร็จ: ' + err?.message);
    }
  };

  const handleSetAsCover = async (photoUrl: string) => {
    if (!activeAlbum) return;
    try {
      const { albums: newAlbums } = await setAlbumCover(activeAlbum.id, photoUrl);
      setAlbums(newAlbums);
    } catch (err: any) {
      alert('ไม่สามารถตั้งเป็นภาพหน้าปกได้: ' + err?.message);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('คุณต้องการคืนค่าอัลบั้มและรูปภาพทั้งหมดให้เป็นค่าเริ่มต้นของระบบใช่หรือไม่?')) {
      const defaults = resetAlbumsToDefault();
      setAlbums(defaults);
      setSelectedAlbumId(defaults[0].id);
    }
  };

  return (
    <section id="gallery-album" className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>อัลบั้มภาพความสำเร็จ & ศูนย์รวมความน่าเชื่อถือระดับโลก</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            พิสูจน์ความสำเร็จด้วยตาคุณเอง <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
              มาตรฐานระดับโลกที่สร้างความมั่นใจให้ผู้คนนับล้าน
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
            เลือกดูอัลบั้มภาพความสำเร็จจากแถบด้านล่าง เพื่อเข้าชมภาพสินค้าจริง บรรยากาศสัมมนาระดับนานาชาติ และห้องปฏิบัติการวิจัยระดับชาติ
          </p>

          {/* Category Filter Pills & Developer Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              ทั้งหมด ({albums.length} อัลบั้ม)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('products')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'products'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              สินค้าและนวัตกรรม
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('seminar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'seminar'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              สัมมนา Success Academy
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('company')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'company'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              สถาบันวิจัย & นวัตกรรม
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('global')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'global'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              เครือข่าย 26+ ประเทศ
            </button>

            {/* Developer Fast-Actions (Admin Only) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={handleOpenCreateAlbum}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-md flex items-center gap-1 transition-all cursor-pointer"
                  title="สร้างอัลบั้มภาพใหม่"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>สร้างอัลบั้มใหม่</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUploadModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-md flex items-center gap-1 transition-all cursor-pointer"
                  title="อัปโหลดภาพเข้าอัลบั้มปัจจุบัน (ไม่จำกัดภาพ)"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>อัปโหลดภาพ (ไม่จำกัด)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* REQUIREMENT: อัลบั้มภาพเรียงเป็นแถบแถวเดียว สามารถกดดูแต่ละอัลบั้มได้ */}
        {/* ==================================================================== */}
        <div className="relative mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>แถบรายการอัลบั้มภาพ (กดเลือกอัลบั้มเพื่อดูภาพด้านล่าง):</span>
            </div>
            
            {/* Scroll Navigation Arrows for Single Row */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollStrip('left')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="เลื่อนไปทางซ้าย"
                aria-label="เลื่อนอัลบั้มไปทางซ้าย"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollStrip('right')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="เลื่อนไปทางขวา"
                aria-label="เลื่อนอัลบั้มไปทางขวา"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Single Row Horizontal Strip */}
          <div
            ref={stripScrollRef}
            className="flex flex-nowrap overflow-x-auto gap-3.5 sm:gap-4.5 pb-4 pt-1 px-1 scroll-smooth snap-x scrollbar-none items-stretch"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredAlbums.map((album) => {
              const isSelected = album.id === activeAlbum?.id;
              const photoCount = album.photos?.length || 0;
              const coverImg = album.coverImageUrl || album.photos[0]?.url || '/images/atomy-flagship-products.png';

              return (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className={`w-64 sm:w-72 shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 relative group flex flex-col justify-between border-2 ${
                    isSelected
                      ? 'border-blue-500 ring-4 ring-blue-500/40 bg-slate-900 shadow-xl shadow-blue-500/25 scale-[1.02]'
                      : 'border-slate-800/90 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/80 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Cover Image */}
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-950">
                    <img
                      src={coverImg}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-md ${album.badgeColor || 'bg-blue-600 text-white'}`}>
                        {album.badge || 'Atomy'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs border border-white/20 shadow-md flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-sky-400" />
                        <span>{photoCount} ภาพ</span>
                      </span>
                    </div>

                    {/* Active Pip on Image */}
                    {isSelected && (
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>กำลังเลือก</span>
                        </span>
                        <span className="text-[10px] text-sky-300 font-semibold drop-shadow">
                          คลิกดูภาพด้านล่าง ▼
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Information */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${isSelected ? 'text-blue-200' : 'text-slate-200 group-hover:text-white'}`}>
                        {album.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${isSelected ? 'text-sky-400' : 'text-slate-500'}`}>
                        {isSelected ? '★ อัลบั้มเปิดอยู่' : 'แตะเพื่อเปิดดู'}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-sky-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* ACTIVE ALBUM VIEWER (แสดงเนื้อหาและรูปภาพของอัลบั้มที่เลือก) */}
        {/* ==================================================================== */}
        {activeAlbum && (
          <div className="relative bg-slate-900/90 rounded-3xl border-2 border-slate-800 shadow-2xl p-4 sm:p-8 backdrop-blur-md">
            
            {/* Active Album Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${activeAlbum.badgeColor}`}>
                    {activeAlbum.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-500/30">
                    📷 คอลเลกชัน {activeAlbum.photos?.length || 0} รูปภาพ
                  </span>
                  {activeAlbum.photos && activeAlbum.photos.length > 0 && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      (คลิกรูปภาพใดก็ได้เพื่อดูขนาดเต็มและสไลด์โชว์)
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  {activeAlbum.title}
                </h3>
                
                <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  {activeAlbum.description}
                </p>

                {/* Highlight points if available */}
                {activeAlbum.highlightPoints && activeAlbum.highlightPoints.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                    {activeAlbum.highlightPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons for this Album */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {activeAlbum.photos && activeAlbum.photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(0)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>เปิดสไลด์โชว์</span>
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(activeAlbum.id)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="ผู้พัฒนาสามารถอัปโหลดภาพได้ไม่จำกัดในอัลบั้มนี้"
                    >
                      <Upload className="w-4 h-4" />
                      <span>อัปโหลดภาพเพิ่ม (ไม่จำกัด)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenEditAlbum}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="แก้ไขข้อมูลอัลบั้มนี้"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteActiveAlbum}
                      className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition-colors cursor-pointer"
                      title="ลบอัลบั้มนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Photos Grid Inside Active Album */}
            {activeAlbum.photos && activeAlbum.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4.5">
                {activeAlbum.photos.map((photo, pIdx) => {
                  const isCover = photo.url === activeAlbum.coverImageUrl;

                  return (
                    <div
                      key={photo.id || pIdx}
                      className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-blue-500/70 shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Photo Clickable Thumbnail */}
                      <div
                        onClick={() => setLightboxIndex(pIdx)}
                        className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title || activeAlbum.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 shadow-lg">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Top indicators */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-mono text-slate-200 backdrop-blur-xs border border-white/10">
                            #{pIdx + 1}
                          </span>
                          {isCover && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>ปก</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Photo Caption / Admin Controls */}
                      <div className="p-2.5 sm:p-3 bg-slate-950/90 flex flex-col justify-between border-t border-slate-800/80">
                        <p className="text-[11px] sm:text-xs text-slate-200 font-medium line-clamp-1 group-hover:text-blue-300 transition-colors">
                          {photo.title || photo.caption || `ภาพที่ ${pIdx + 1}`}
                        </p>

                        {/* Admin Inline Actions */}
                        {isAdmin && (
                          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(photo.url)}
                                className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                                title="ตั้งเป็นภาพหน้าปกของอัลบั้มนี้"
                              >
                                <Star className="w-3 h-3" />
                                <span>ตั้งเป็นปก</span>
                              </button>
                            ) : (
                              <span className="text-amber-400 font-bold">★ ภาพปกอัลบั้ม</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                              title="ลบรูปภาพนี้ออกจากอัลบั้ม"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>ลบ</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State for Album with 0 photos */
              <div className="text-center py-16 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-8">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">ยังไม่มีรูปภาพในอัลบั้มนี้</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  {isAdmin
                    ? 'คุณในฐานะผู้พัฒนาสามารถอัปโหลดรูปภาพได้ไม่จำกัดจำนวน เข้าสู่อัลบั้มนี้ได้ทันที'
                    : 'กำลังจัดเตรียมรูปภาพความละเอียดสูงสำหรับอัลบั้มนี้ เร็วๆ นี้'}
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleOpenUploadModal(activeAlbum.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    <Upload className="w-4 h-4" />
                    <span>อัปโหลดรูปภาพเข้าอัลบั้มนี้เลย</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Call to Action banner */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs font-bold text-white">ต้องการร่วมเป็นส่วนหนึ่งของระบบความสำเร็จระดับโลก?</div>
                <div className="text-[11px] text-slate-400">
                  ที่ปรึกษาสายงาน: <strong className="text-sky-300">{sponsor.sponsorName}</strong> ({sponsor.sponsorPosition})
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenLineModal}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-500 hover:to-sky-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>รับสิทธิ์ร่วมทีมกับเราทันที</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* FULLSCREEN LIGHTBOX MODAL (ดูภาพขนาดเต็ม + สไลด์โชว์ + ฟิล์มสตริป) */}
      {/* ==================================================================== */}
      {lightboxIndex !== null && activeAlbum && activeAlbum.photos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between">
          {/* Top Bar */}
          <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 text-white">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${activeAlbum.badgeColor}`}>
                {activeAlbum.badge}
              </span>
              <span className="text-sm font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
                {activeAlbum.photos[lightboxIndex].title || activeAlbum.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                {lightboxIndex + 1} / {activeAlbum.photos.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="ปิดหน้าต่าง (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Main High-Res Image View with Left/Right Nav */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
            <button
              type="button"
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null ? (prev - 1 + activeAlbum.photos.length) % activeAlbum.photos.length : 0
                )
              }
              className="absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700/80 transition-all cursor-pointer shadow-xl"
              aria-label="รูปภาพก่อนหน้า"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={activeAlbum.photos[lightboxIndex].url}
              alt={activeAlbum.photos[lightboxIndex].title || activeAlbum.title}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-all duration-300"
            />

            <button
              type="button"
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % activeAlbum.photos.length : 0))
              }
              className="absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700/80 transition-all cursor-pointer shadow-xl"
              aria-label="รูปภาพถัดไป"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails Filmstrip & Caption */}
          <div className="bg-slate-950 border-t border-slate-800/80 p-3 sm:p-4">
            {activeAlbum.photos[lightboxIndex].caption && (
              <p className="text-center text-xs text-slate-300 mb-3 max-w-2xl mx-auto">
                {activeAlbum.photos[lightboxIndex].caption}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-3xl mx-auto pb-1 scrollbar-thin">
              {activeAlbum.photos.map((thumb, tIdx) => {
                const isCurrent = tIdx === lightboxIndex;
                return (
                  <button
                    key={thumb.id || tIdx}
                    type="button"
                    onClick={() => setLightboxIndex(tIdx)}
                    className={`w-14 h-10 sm:w-16 sm:h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-blue-500 scale-105 ring-2 ring-blue-500/50'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <img src={thumb.url} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DEVELOPER UNLIMITED UPLOADS MODAL (อัปโหลดภาพได้ไม่จำกัดในแต่ละอัลบั้ม) */}
      {/* ==================================================================== */}
      {isUploadModalOpen && activeAlbum && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span>อัปโหลดรูปภาพเข้าอัลบั้ม (ไม่จำกัดจำนวน)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  อัลบั้มเป้าหมาย: <strong className="text-sky-300">{activeAlbum.title}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => !isUploading && setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Album Selector Dropdown (Strictly Separated By Album) */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Layers className="w-4 h-4" />
                  <span>เลือกอัลบั้มปลายทาง (รูปภาพจะถูกจัดเก็บแยกเฉพาะอัลบั้มนี้ ไม่ปะปนกับอัลบั้มอื่น):</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  แยกตามอัลบั้ม
                </span>
              </label>

              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    📁 {a.title} ({a.photos?.length || 0} รูปภาพ)
                  </option>
                ))}
              </select>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>กำลังบันทึกภาพเข้าสู่:</span>
                <strong className="text-sky-300">{activeAlbum.title}</strong>
              </div>
            </div>

            {/* Notice info banner */}
            <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <div>
                <strong>สิทธิ์ Admin หลัก (Developer Unlimited Upload):</strong> คุณสามารถเลือกไฟล์พร้อมกันได้หลายไฟล์ (Batch Upload) หรือใส่ URL ของรูปภาพ ระบบจะทำการจัดเก็บลงในอัลบั้มที่เลือกไว้โดยเฉพาะ ไม่ปะปนกับอัลบั้มอื่น
              </div>
            </div>

            {/* Error and Progress Status */}
            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadProgress && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                {isUploading && <Loader2 className="w-4 h-4 shrink-0 animate-spin text-emerald-400" />}
                {uploadSuccess && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                <span>{uploadProgress}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Option 1: File Browse & Drag Drop */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  1. เลือกไฟล์รูปภาพจากอุปกรณ์ (เลือกได้หลายไฟล์พร้อมกัน)
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/70 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleSelectFiles}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <div className="text-xs sm:text-sm font-bold text-white mb-1">
                    คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากรูปมาวางที่นี่
                  </div>
                  <div className="text-[11px] text-slate-400">
                    รองรับไฟล์ JPG, PNG, WebP (เลือกพร้อมกันได้ไม่จำกัด)
                  </div>
                </div>
              </div>

              {/* Option 2: Image URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. หรือใส่ลิงก์รูปภาพ (Image URLs)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/photo.jpg (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่ได้)"
                    disabled={isUploading}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={isUploading || !urlInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 disabled:opacity-50 cursor-pointer"
                  >
                    เพิ่มลิงก์
                  </button>
                </div>
              </div>

              {/* Queued Photos List */}
              {uploadFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>รายการรูปภาพที่รออัปโหลด ({uploadFiles.length} รูป):</span>
                    <button
                      type="button"
                      onClick={() => setUploadFiles([])}
                      disabled={isUploading}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {uploadFiles.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                      >
                        <img
                          src={item.preview}
                          alt=""
                          className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.caption}
                            disabled={isUploading}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUploadFiles((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, caption: val } : f))
                              );
                            }}
                            placeholder="ระบุคำอธิบายรูปภาพ..."
                            className="w-full bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQueuedFile(idx)}
                          disabled={isUploading}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleExecuteUpload}
                disabled={isUploading || uploadFiles.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>บันทึกรูปภาพทั้งหมด ({uploadFiles.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CREATE NEW ALBUM MODAL */}
      {/* ==================================================================== */}
      {isCreateAlbumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>สร้างอัลบั้มภาพใหม่</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateAlbumModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ชื่ออัลบั้มภาพ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={albumFormTitle}
                  onChange={(e) => setAlbumFormTitle(e.target.value)}
                  placeholder="เช่น อัลบั้มทริปท่องเที่ยวและสัมมนาเกาหลี..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={albumFormCategory}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setAlbumFormCategory(val);
                      if (val === 'products') setAlbumFormBadgeColor('bg-blue-600 text-white');
                      if (val === 'seminar') setAlbumFormBadgeColor('bg-emerald-600 text-white');
                      if (val === 'company') setAlbumFormBadgeColor('bg-indigo-600 text-white');
                      if (val === 'global') setAlbumFormBadgeColor('bg-amber-600 text-white');
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={albumFormBadge}
                    onChange={(e) => setAlbumFormBadge(e.target.value)}
                    placeholder="เช่น Global Academy"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">คำอธิบายอัลบั้ม</label>
                <textarea
                  rows={2}
                  value={albumFormDescription}
                  onChange={(e) => setAlbumFormDescription(e.target.value)}
                  placeholder="บอกเล่าเรื่องราวความประทับใจ จุดเด่นของอัลบั้มนี้..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ลิงก์ภาพหน้าปก (Cover Image URL)</label>
                <input
                  type="text"
                  value={albumFormCoverUrl}
                  onChange={(e) => setAlbumFormCoverUrl(e.target.value)}
                  placeholder="/images/atomy-flagship-products.png หรือ https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingAlbum}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isSavingAlbum ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>สร้างอัลบั้ม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EDIT ACTIVE ALBUM MODAL */}
      {/* ==================================================================== */}
      {isEditAlbumModalOpen && activeAlbum && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>แก้ไขข้อมูลอัลบั้ม</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditAlbumModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ชื่ออัลบั้มภาพ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={albumFormTitle}
                  onChange={(e) => setAlbumFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={albumFormCategory}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setAlbumFormCategory(val);
                      if (val === 'products') setAlbumFormBadgeColor('bg-blue-600 text-white');
                      if (val === 'seminar') setAlbumFormBadgeColor('bg-emerald-600 text-white');
                      if (val === 'company') setAlbumFormBadgeColor('bg-indigo-600 text-white');
                      if (val === 'global') setAlbumFormBadgeColor('bg-amber-600 text-white');
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={albumFormBadge}
                    onChange={(e) => setAlbumFormBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">คำอธิบายอัลบั้ม</label>
                <textarea
                  rows={3}
                  value={albumFormDescription}
                  onChange={(e) => setAlbumFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ลิงก์ภาพหน้าปก (Cover Image URL)</label>
                <input
                  type="text"
                  value={albumFormCoverUrl}
                  onChange={(e) => setAlbumFormCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingAlbum}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isSavingAlbum ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credibility Guarantee Bar */}
      <div className="mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <ShieldCheck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="font-bold text-xs sm:text-sm text-white">Absolute Quality</div>
            <div className="text-[11px] text-slate-400 mt-0.5">สินค้าเคาน์เตอร์แบรนด์ มาตรฐานระดับโลก</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="font-bold text-xs sm:text-sm text-white">KAERI & Kolmar BNH</div>
            <div className="text-[11px] text-slate-400 mt-0.5">สถาบันวิจัยแห่งชาติเกาหลีใต้สนับสนุน</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <Globe className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="font-bold text-xs sm:text-sm text-white">26+ ประเทศทั่วโลก</div>
            <div className="text-[11px] text-slate-400 mt-0.5">รหัสเดียว ช้อปและขยายทีมได้ไร้พรมแดน</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <Award className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <div className="font-bold text-xs sm:text-sm text-white">ยอดซื้อซ้ำกว่า 90%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">ผู้บริโภคติดใจ ไม่ต้องตื๊อขาย</div>
          </div>
        </div>
      </div>
    </section>
  );
};
