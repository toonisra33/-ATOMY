import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  ShieldCheck,
  Building2,
  Globe,
  Award,
  Package,
  Layers,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { SponsorProfile } from '../types';
import { fetchGalleryItems } from '../lib/galleryService';
import { AdminGalleryModal } from './AdminGalleryModal';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'products' | 'seminar' | 'company' | 'global';
  badge: string;
  badgeColor: string;
  description: string;
  highlightPoints: string[];
  imageUrl: string;
  caption: string;
}

export const ATOMY_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'flagship-products',
    title: 'นวัตกรรมสินค้าขายดีระดับโลก Absolute Quality, Absolute Price',
    category: 'products',
    badge: 'Mass Prestige Products',
    badgeColor: 'bg-blue-600 text-white',
    description: 'สินค้าอุปโภคบริโภคเกรดพรีเมียม มาตรฐานเคาน์เตอร์แบรนด์ แต่จำหน่ายในราคามวลชนที่ทุกคนเข้าถึงได้',
    highlightPoints: [
      'กลุ่ม HemoHIM เสริมภูมิต้านทาน ยอดขายอันดับ 1 ในหมวดสุขภาพต่อเนื่องนับสิบปี',
      'Absolute CellActive Skincare เทคโนโลยีส่งสัญญาณฟื้นฟูลึกระดับเซลล์ผิว',
      'สินค้าจำเป็นในชีวิตประจำวัน: ยาสีฟันโพรโพลิส, แปรงสีฟันขนทองคำ, ผงซักฟอกเข้มข้น'
    ],
    imageUrl: '/images/atomy-flagship-products.png',
    caption: 'ชุดผลิตภัณฑ์ระดับมาสทิจ (Masstige) ที่สร้างยอดซื้อซ้ำธรรมชาติกว่า 90%'
  },
  {
    id: 'success-academy',
    title: 'ระบบการเรียนรู้และสัมมนาความสำเร็จระดับโลก (Success Academy)',
    category: 'seminar',
    badge: 'Global Education System',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'ระบบเดียวที่บริษัทเป็นผู้จัดอบรมฟรี ไม่ผลักภาระให้แม่ทีม มีทั้ง One Day Seminar และ Success Academy ทั่วโลก',
    highlightPoints: [
      'จัดขึ้นเป็นประจำทุกเดือนทั้งในไทย เกาหลีใต้ และกว่า 26 ประเทศทั่วโลก',
      'เรียนรู้แนวคิด วิสัยทัศน์ และระบบส่งต่อความสำเร็จ (Duplication) จากผู้นำระดับสูงตัวจริง',
      'ใครก็เริ่มต้นได้ แม้ไม่มีประสบการณ์หรือพูดไม่เก่ง เพราะมีระบบส่วนกลางคอยซัพพอร์ต'
    ],
    imageUrl: '/images/gallery-success-academy.jpg',
    caption: 'บรรยากาศงานสัมมนาส่งต่อความสำเร็จของสมาชิก Atomy จากทุกสายงาน'
  },
  {
    id: 'kolmar-science',
    title: 'พันธมิตรวิจัยระดับชาติ Kolmar BNH & สถาบัน KAERI',
    category: 'company',
    badge: 'National Bio-Technology',
    badgeColor: 'bg-indigo-600 text-white',
    description: 'เบื้องหลังคุณภาพระดับโลกที่ร่วมมือกับสถาบันวิจัยพลังงานปรมาณูแห่งเกาหลี (KAERI) ที่รัฐบาลเกาหลีสนับสนุน',
    highlightPoints: [
      'นวัตกรรมสารสกัดบริสุทธิ์สูง (High Purification Technology) จากสมุนไพรสดธรรมชาติ',
      'สิทธิบัตรคุ้มครองทั้งในเกาหลีใต้ สหรัฐอเมริกา ญี่ปุ่น และสหภาพยุโรป',
      'มาตรฐานการผลิตระดับยาและเวชสำอางค์สากล ปลอดภัย ไร้สารตกค้าง'
    ],
    imageUrl: '/images/gallery-kolmar-innovation.jpg',
    caption: 'นวัตกรรมเทคโนโลยีชีวภาพขั้นสูงที่ได้รับทุนวิจัยและการสนับสนุนจากรัฐบาลเกาหลี'
  },
  {
    id: 'global-network',
    title: 'แพลตฟอร์มไร้พรมแดน รหัสเดียว ช้อปและขยายทีมได้ 26+ ประเทศ',
    category: 'global',
    badge: 'One Global System',
    badgeColor: 'bg-amber-600 text-white',
    description: 'ระบบ Global Sourcing, Global Sales (GSGS) ที่เชื่อมโยงผู้คนทั่วโลกไว้ด้วยกันโดยไม่ต้องเปิดรหัสซ้ำซ้อน',
    highlightPoints: [
      'รหัสสมาชิกของคุณใช้แนะนำและมีเครือข่ายผู้บริโภคข้ามประเทศได้ทั่วโลก',
      'คะแนนสะสม (PV) จากทุกทวีปไหลมารวมเป็นผลตอบแทนให้คุณโดยตรง',
      'ฐานสมาชิกผู้บริโภคกว่า 16 ล้านคนทั่วโลก มั่นคง ยั่งยืน ส่งต่อเป็นมรดกได้'
    ],
    imageUrl: '/images/gallery-global-presence.jpg',
    caption: 'ระบบเครือข่ายสากลที่เปิดโอกาสให้คุณสร้างธุรกิจระดับ Global จากที่บ้าน'
  },
  {
    id: 'hemohim-science',
    title: 'HemoHIM นวัตกรรมสมุนไพรเกาหลีวิจัย 8 ปี เพื่อเสริมสร้างภูมิคุ้มกัน',
    category: 'products',
    badge: 'Patent Immune Supplement',
    badgeColor: 'bg-rose-600 text-white',
    description: 'ผลิตภัณฑ์เสริมอาหารที่ได้รับความไว้วางใจสูงสุด ผ่านการทดสอบทางคลินิกและได้รับการรับรองจาก KFDA',
    highlightPoints: [
      'สารสกัดจาก Angelica Radix, Cnidium Officinale และ Paeonia Japonica',
      'กระตุ้นการทำงานของ NK Cells (เซลล์เพชฌฆาต) และเสริมการสร้างเม็ดเลือด',
      'ยอดจำหน่ายระดับหมื่นล้านบาทต่อปี เป็นที่ยอมรับในวงการแพทย์และสุขภาพ'
    ],
    imageUrl: '/images/atomy-hemohim-presentation.jpg',
    caption: 'ผลิตภัณฑ์เสริมสร้างภูมิคุ้มกันอันดับ 1 ของ Atomy ที่ผู้คนทั่วโลกไว้วางใจ'
  },
  {
    id: 'daily-essentials',
    title: 'สินค้าจำเป็นในชีวิตประจำวัน เปลี่ยนรายจ่ายเป็นสินทรัพย์ผ่อนแรง',
    category: 'products',
    badge: 'Consumer Goods Ecosystem',
    badgeColor: 'bg-sky-600 text-white',
    description: 'ไม่ว่าสภาวะเศรษฐกิจจะเป็นอย่างไร ทุกคนยังต้องแปรงฟัน สระผม และดูแลสุขภาพ นี่คือรากฐานของ Passive Income',
    highlightPoints: [
      'ทุกคนต้องใช้อยู่แล้ว ไม่ต้องสร้างความต้องการเทียม',
      'คุณภาพชนะใจจนเกิดการกลับมาซื้อซ้ำอัตโนมัติ โดยไม่ต้องตื๊อขาย',
      'สะสมคะแนน PV ตลอดชีพ ไม่มีวันตัดทิ้ง'
    ],
    imageUrl: '/images/atomy-masstige-products.png',
    caption: 'กลุ่มสินค้าจำเป็นในชีวิตประจำวันที่มีอัตราการซื้อซ้ำสูงสุด'
  }
];

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
  const [items, setItems] = useState<GalleryItem[]>(ATOMY_GALLERY_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'seminar' | 'company' | 'global'>('all');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch persisted gallery items from Firestore / LocalStorage
  useEffect(() => {
    let isMounted = true;
    fetchGalleryItems().then((loaded) => {
      if (isMounted && loaded && loaded.length > 0) {
        setItems(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter((item) => item.category === activeFilter);

  // Keep index within bounds when filter changes or items change
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter, items.length]);

  // Autoplay functionality
  useEffect(() => {
    if (!isAutoPlay || fullscreenImage) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlay, filteredItems.length, fullscreenImage]);

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const currentItem = filteredItems[currentIndex] || filteredItems[0];

  return (
    <section id="gallery-album" className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>อัลบั้มภาพความสำเร็จ & ความน่าเชื่อถือระดับสากล</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            พิสูจน์ความสำเร็จด้วยตาคุณเอง <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
              มาตรฐานระดับโลกที่สร้างความมั่นใจให้ผู้คนนับล้าน
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
            ภาพจริงจากผลิตภัณฑ์คุณภาพสูง สัมมนาความสำเร็จระดับโลก และพันธมิตรวิจัยระดับชาติ ที่ทำให้มั่นใจได้ว่า Atomy คือยานพาหนะสร้างชีวิตที่คุณฝากอนาคตไว้ได้อย่างแท้จริง
          </p>

          {/* Category Filter Pills & Admin Manage Button */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              ทั้งหมด ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('products')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'products'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              สินค้าและนวัตกรรม
            </button>
            <button
              onClick={() => setActiveFilter('seminar')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'seminar'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              สัมมนา Success Academy
            </button>
            <button
              onClick={() => setActiveFilter('company')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'company'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              สถาบันวิจัย & นวัตกรรม
            </button>
            <button
              onClick={() => setActiveFilter('global')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'global'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              เครือข่าย 26+ ประเทศ
            </button>

            {/* Admin Upload & Manage Button (Visible ONLY to Admin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-md flex items-center gap-1.5 transition-all cursor-pointer scale-105"
                title="จัดการรูปภาพและอัปโหลดรูปภาพใหม่ (สิทธิ์ Admin เท่านั้น)"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>จัดการ/อัปโหลดภาพ (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Interactive Carousel Showcase */}
        {currentItem && (
          <div className="relative bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Left/Top: High-Res Image Display */}
              <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[420px] lg:min-h-[500px] bg-slate-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden group">
                {/* Subtle Backdrop Gradient */}
                <div className="absolute inset-0 bg-radial from-blue-900/20 via-slate-950/70 to-slate-950 pointer-events-none" />

                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="w-full h-auto max-h-[440px] object-contain rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-[1.02]"
                />

                {/* Fullscreen Zoom Trigger */}
                <button
                  type="button"
                  onClick={() => setFullscreenImage(currentItem)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-blue-600 text-slate-300 hover:text-white backdrop-blur-md transition-all border border-slate-700 hover:border-blue-500 shadow-md cursor-pointer"
                  title="ดูรูปขนาดเต็ม"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Badge Overlay */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${currentItem.badgeColor}`}>
                    {currentItem.badge}
                  </span>
                </div>

                {/* Navigation Arrows for Image Box */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700/80 transition-all opacity-80 hover:opacity-100 shadow-lg cursor-pointer"
                  aria-label="รูปภาพก่อนหน้า"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700/80 transition-all opacity-80 hover:opacity-100 shadow-lg cursor-pointer"
                  aria-label="รูปภาพถัดไป"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Right/Bottom: Story, Highlights & CTA */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-mono">
                      ภาพที่ {currentIndex + 1} จาก {filteredItems.length}
                    </span>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setIsAdminModalOpen(true)}
                          className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                          title="แก้ไขรูปภาพนี้หรือรูปอื่นๆ ในอัลบั้ม"
                        >
                          ✏️ แก้ไขอัลบั้ม
                        </button>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[11px]">
                        {isAutoPlay ? '▶ เลื่อนอัตโนมัติ' : '⏸ หยุดเลื่อน'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight mb-3">
                    {currentItem.title}
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                    {currentItem.description}
                  </p>

                  {/* Highlight Bullets */}
                  <div className="space-y-2.5 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      จุดเด่นและหลักฐานเชิงประจักษ์:
                    </h4>
                    {currentItem.highlightPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Action & Sponsor Note */}
                <div className="pt-6 border-t border-slate-800/80">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenLineModal}
                      className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-500 hover:to-sky-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>เริ่มต้นและรับสิทธิ์ร่วมทีม</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                    >
                      {isAutoPlay ? 'พักการเลื่อน' : 'เล่นต่อ'}
                    </button>
                  </div>

                  <div className="mt-3 text-center sm:text-left text-[11px] text-slate-400">
                    ที่ปรึกษาสายงานของคุณ: <strong className="text-slate-200 font-semibold">{sponsor.sponsorName}</strong> ({sponsor.sponsorPosition})
                  </div>
                </div>

              </div>

            </div>

            {/* Thumbnail Strip for Fast Navigation */}
            <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              {filteredItems.map((item, index) => {
                const isSelected = index === currentIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsAutoPlay(false);
                      setCurrentIndex(index);
                    }}
                    className={`relative shrink-0 rounded-xl overflow-hidden transition-all cursor-pointer border-2 ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-12 sm:w-20 sm:h-14 object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Credibility Guarantee Bar */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-blue-400 mb-1.5" />
            <div className="text-xs sm:text-sm font-bold text-white">มาตรฐานสากล KFDA & GMP</div>
            <div className="text-[11px] text-slate-400">ปลอดภัย ไร้สารเคมีอันตราย</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center">
            <Building2 className="w-5 h-5 text-emerald-400 mb-1.5" />
            <div className="text-xs sm:text-sm font-bold text-white">Kolmar Korea & KAERI</div>
            <div className="text-[11px] text-slate-400">สถาบันวิจัยพลังงานปรมาณู</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center">
            <Globe className="w-5 h-5 text-amber-400 mb-1.5" />
            <div className="text-xs sm:text-sm font-bold text-white">26+ ประเทศทั่วโลก</div>
            <div className="text-[11px] text-slate-400">รหัสสมาชิกเดียว ขยายได้ไร้พรมแดน</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col items-center">
            <Award className="w-5 h-5 text-purple-400 mb-1.5" />
            <div className="text-xs sm:text-sm font-bold text-white">16+ ล้านผู้บริโภค</div>
            <div className="text-[11px] text-slate-400">ยอดซื้อซ้ำธรรมชาติกว่า 90%</div>
          </div>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
              aria-label="ปิดหน้าต่างรูปภาพ"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={fullscreenImage.imageUrl}
              alt={fullscreenImage.title}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
            />

            <div className="mt-4 text-center max-w-2xl px-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-2 ${fullscreenImage.badgeColor}`}>
                {fullscreenImage.badge}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">
                {fullscreenImage.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {fullscreenImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Gallery Management & Upload Modal */}
      {isAdmin && (
        <AdminGalleryModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          items={items}
          onItemsChange={(updated) => {
            setItems(updated);
          }}
        />
      )}
    </section>
  );
};
