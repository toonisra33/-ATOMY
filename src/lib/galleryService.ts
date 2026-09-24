import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AlbumPhoto {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  uploadedAt?: number;
}

export interface AlbumItem {
  id: string;
  title: string;
  category: 'products' | 'seminar' | 'company' | 'global' | 'team';
  badge: string;
  badgeColor: string;
  description: string;
  coverImageUrl: string;
  photos: AlbumPhoto[];
  highlightPoints?: string[];
  updatedAt?: number;
}

export const DEFAULT_ATOMY_ALBUMS: AlbumItem[] = [
  {
    id: 'album-flagship-products',
    title: 'นวัตกรรมสินค้าขายดีระดับโลก Absolute Quality, Absolute Price',
    category: 'products',
    badge: 'Mass Prestige Products',
    badgeColor: 'bg-blue-600 text-white',
    description: 'สินค้าอุปโภคบริโภคเกรดพรีเมียม มาตรฐานเคาน์เตอร์แบรนด์ แต่จำหน่ายในราคามวลชนที่ทุกคนเข้าถึงได้ ยอดซื้อซ้ำธรรมชาติกว่า 90%',
    coverImageUrl: '/images/atomy-flagship-products.png',
    photos: [
      {
        id: 'p-prod-1',
        url: '/images/atomy-flagship-products.png',
        title: 'Absolute CellActive Skincare & Masstige Line',
        caption: 'ชุดผลิตภัณฑ์บำรุงผิวระดับเคาน์เตอร์แบรนด์ เทคโนโลยีสกัดบริสุทธิ์สูง ยอดนิยมทั่วโลก',
      },
      {
        id: 'p-prod-2',
        url: '/images/atomy-product-showcase.png',
        title: 'คอลเลกชันสินค้าขายดีระดับโลก',
        caption: 'สินค้าจำเป็นในชีวิตประจำวันและผลิตภัณฑ์สุขภาพที่ทุกคนต้องใช้อย่างต่อเนื่อง',
      },
      {
        id: 'p-prod-3',
        url: '/images/atomy-masstige-products.png',
        title: 'สินค้ามาสทิจ (Masstige) เพื่อครอบครัว',
        caption: 'แปรงสีฟันขนทอง ยาสีฟันโพรโพลิส และเครื่องสำอางชั้นเลิศในราคาจับต้องได้',
      },
      {
        id: 'p-prod-4',
        url: '/images/atomy-hemohim-presentation.jpg',
        title: 'ผลิตภัณฑ์เพื่อสุขภาพและความเป็นอยู่ที่ดี',
        caption: 'เสริมเกราะป้องกันร่างกายด้วยนวัตกรรมชีวภาพที่ผ่านการทดสอบระดับสากล',
      },
    ],
    highlightPoints: [
      'กลุ่ม HemoHIM เสริมภูมิต้านทาน ยอดขายอันดับ 1 ในหมวดสุขภาพต่อเนื่องนับสิบปี',
      'Absolute CellActive Skincare เทคโนโลยีส่งสัญญาณฟื้นฟูลึกระดับเซลล์ผิว',
      'สินค้าจำเป็นในชีวิตประจำวัน: ยาสีฟันโพรโพลิส, แปรงสีฟันขนทองคำ, ผงซักฟอกเข้มข้น',
    ],
  },
  {
    id: 'album-success-academy',
    title: 'ระบบการเรียนรู้และสัมมนาความสำเร็จระดับโลก (Success Academy)',
    category: 'seminar',
    badge: 'Global Education System',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'ระบบเดียวที่บริษัทเป็นผู้จัดอบรมฟรี ไม่ผลักภาระให้แม่ทีม มีทั้ง One Day Seminar และ Success Academy ทั่วโลก',
    coverImageUrl: '/images/gallery-success-academy.jpg',
    photos: [
      {
        id: 'p-sem-1',
        url: '/images/gallery-success-academy.jpg',
        title: 'บรรยากาศสัมมนา Success Academy สุดยิ่งใหญ่',
        caption: 'สมาชิกร่วมรับฟังวิสัยทัศน์และการแบ่งปันความสำเร็จจากผู้นำระดับ Imperial Master',
      },
      {
        id: 'p-sem-2',
        url: '/images/gallery-global-presence.jpg',
        title: 'พลังแห่งความร่วมมือจากผู้นำทั่วทุกมุมโลก',
        caption: 'สัมมนาใหญ่ที่จัดพร้อมกันหลายประเทศผ่านระบบถ่ายทอดสดแบบ One Global System',
      },
    ],
    highlightPoints: [
      'จัดขึ้นเป็นประจำทุกเดือนทั้งในไทย เกาหลีใต้ และกว่า 26 ประเทศทั่วโลก',
      'เรียนรู้แนวคิด วิสัยทัศน์ และระบบส่งต่อความสำเร็จ (Duplication) จากผู้นำระดับสูงตัวจริง',
      'ใครก็เริ่มต้นได้ แม้ไม่มีประสบการณ์หรือพูดไม่เก่ง เพราะมีระบบส่วนกลางคอยซัพพอร์ต',
    ],
  },
  {
    id: 'album-kolmar-science',
    title: 'พันธมิตรวิจัยระดับชาติ Kolmar BNH & สถาบัน KAERI',
    category: 'company',
    badge: 'National Bio-Technology',
    badgeColor: 'bg-indigo-600 text-white',
    description: 'เบื้องหลังคุณภาพระดับโลก ร่วมมือกับสถาบันวิจัยพลังงานปรมาณูแห่งเกาหลี (KAERI) ที่รัฐบาลเกาหลีให้การสนับสนุน',
    coverImageUrl: '/images/gallery-kolmar-innovation.jpg',
    photos: [
      {
        id: 'p-kol-1',
        url: '/images/gallery-kolmar-innovation.jpg',
        title: 'ห้องแล็บวิจัยและพัฒนาสารสกัดชีวภาพระดับโลก',
        caption: 'มาตรฐานการผลิตและนวัตกรรมสารสกัดธรรมชาติบริสุทธิ์สูงที่ได้รับการคุ้มครองสิทธิบัตรสากล',
      },
      {
        id: 'p-kol-2',
        url: '/images/atomy-hemohim-presentation.jpg',
        title: 'การวิจัยทางวิทยาศาสตร์และการทดสอบทางคลินิก',
        caption: 'โครงการวิจัยแห่งชาติเกาหลีที่ใช้เวลากว่า 8 ปีเพื่อพัฒนาสารสำคัญในการกระตุ้น NK Cells',
      },
    ],
    highlightPoints: [
      'นวัตกรรมสารสกัดบริสุทธิ์สูง (High Purification Technology) จากสมุนไพรสดธรรมชาติ',
      'สิทธิบัตรคุ้มครองทั้งในเกาหลีใต้ สหรัฐอเมริกา ญี่ปุ่น และสหภาพยุโรป',
      'มาตรฐานการผลิตระดับยาและเวชสำอางค์สากล ปลอดภัย ไร้สารตกค้าง',
    ],
  },
  {
    id: 'album-global-network',
    title: 'แพลตฟอร์มไร้พรมแดน รหัสเดียว ช้อปและขยายทีมได้ 26+ ประเทศ',
    category: 'global',
    badge: 'One Global System',
    badgeColor: 'bg-amber-600 text-white',
    description: 'ระบบ Global Sourcing, Global Sales (GSGS) ที่เชื่อมโยงผู้คนทั่วโลกไว้ด้วยกันโดยไม่ต้องเปิดรหัสซ้ำซ้อน',
    coverImageUrl: '/images/gallery-global-presence.jpg',
    photos: [
      {
        id: 'p-glob-1',
        url: '/images/gallery-global-presence.jpg',
        title: 'เครือข่ายศูนย์ Atomy ในกว่า 26 ทั่วทุกทวีป',
        caption: 'ระบบไอทีเชื่อมต่อคะแนน PV ข้ามทวีปแบบเรียลไทม์ รหัสเดียวทำธุรกิจได้ทุกที่ในโลก',
      },
      {
        id: 'p-glob-2',
        url: '/images/gallery-success-academy.jpg',
        title: 'งานประชุมและเกียรติยศระดับสากล',
        caption: 'เฉลิมฉลองความสำเร็จและส่งต่อระบบบำนาญมรดกให้กับครอบครัวสมาชิก',
      },
    ],
    highlightPoints: [
      'รหัสสมาชิกของคุณใช้แนะนำและมีเครือข่ายผู้บริโภคข้ามประเทศได้ทั่วโลก',
      'คะแนนสะสม (PV) จากทุกทวีปไหลมารวมเป็นผลตอบแทนให้คุณโดยตรง',
      'ฐานสมาชิกผู้บริโภคกว่า 16 ล้านคนทั่วโลก มั่นคง ยั่งยืน ส่งต่อเป็นมรดกได้',
    ],
  },
  {
    id: 'album-hemohim-science',
    title: 'HemoHIM นวัตกรรมสมุนไพรเกาหลีวิจัย 8 ปี เพื่อเสริมสร้างภูมิคุ้มกัน',
    category: 'products',
    badge: 'Patent Immune Supplement',
    badgeColor: 'bg-rose-600 text-white',
    description: 'ผลิตภัณฑ์เสริมอาหารที่ได้รับความไว้วางใจสูงสุด ผ่านการทดสอบทางคลินิกและได้รับการรับรองจาก KFDA และ FDA',
    coverImageUrl: '/images/atomy-hemohim-presentation.jpg',
    photos: [
      {
        id: 'p-hemo-1',
        url: '/images/atomy-hemohim-presentation.jpg',
        title: 'การนำเสนอผลงานวิจัย HemoHIM ต่อแพทย์และนักวิทยาศาสตร์',
        caption: 'สารสกัดจากสมุนไพรเกาหลี 3 ชนิดที่ช่วยฟื้นฟูระบบภูมิคุ้มกันและเม็ดเลือดขาว',
      },
      {
        id: 'p-hemo-2',
        url: '/images/atomy-flagship-products.png',
        title: 'ผลิตภัณฑ์ที่สร้างสถิติยอดจำหน่ายอันดับ 1',
        caption: 'ยืนหนึ่งในหมวดสุขภาพเกาหลีใต้ยาวนานที่สุดกว่า 10 ปีติดต่อกัน',
      },
    ],
    highlightPoints: [
      'สารสกัดจาก Angelica Radix, Cnidium Officinale และ Paeonia Japonica',
      'กระตุ้นการทำงานของ NK Cells (เซลล์เพชฌฆาต) และเสริมการสร้างเม็ดเลือด',
      'ยอดจำหน่ายระดับหมื่นล้านบาทต่อปี เป็นที่ยอมรับในวงการแพทย์และสุขภาพ',
    ],
  },
  {
    id: 'album-daily-essentials',
    title: 'สินค้าจำเป็นในชีวิตประจำวัน เปลี่ยนรายจ่ายเป็นสินทรัพย์ผ่อนแรง',
    category: 'products',
    badge: 'Consumer Goods Ecosystem',
    badgeColor: 'bg-sky-600 text-white',
    description: 'ไม่ว่าสภาวะเศรษฐกิจจะเป็นอย่างไร ทุกคนยังต้องแปรงฟัน สระผม และดูแลสุขภาพ นี่คือรากฐานของ Passive Income',
    coverImageUrl: '/images/atomy-masstige-products.png',
    photos: [
      {
        id: 'p-daily-1',
        url: '/images/atomy-masstige-products.png',
        title: 'ของใช้ประจำวันคุณภาพเทียบเคาท์เตอร์แบรนด์',
        caption: 'ยาสีฟัน แปรงสีฟัน ครีมอาบน้ำ สบู่ และผลิตภัณฑ์ดูแลบ้านเกรดพรีเมียม',
      },
      {
        id: 'p-daily-2',
        url: '/images/atomy-product-showcase.png',
        title: 'ตะกร้าสินค้าที่เกิดการซื้อซ้ำอัตโนมัติ',
        caption: 'คะแนน PV จากการใช้สินค้าประจำวันไม่มีวันหมดอายุ สะสมขึ้นตำแหน่งได้ตลอดชีพ',
      },
    ],
    highlightPoints: [
      'ทุกคนต้องใช้อยู่แล้ว ไม่ต้องสร้างความต้องการเทียม',
      'คุณภาพชนะใจจนเกิดการกลับมาซื้อซ้ำอัตโนมัติ โดยไม่ต้องตื๊อขาย',
      'สะสมคะแนน PV ตลอดชีพ ไม่มีวันตัดทิ้ง',
    ],
  },
];

const ALBUMS_STORAGE_KEY = 'atomy_custom_albums_v2';
const LEGACY_GALLERY_STORAGE_KEY = 'atomy_custom_gallery_items';
const IDB_NAME = 'atomy_gallery_storage_v2';
const IDB_STORE = 'albums_store';

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

let inMemoryAlbumsCache: AlbumItem[] | null = null;

async function getAlbumsFromIDB(): Promise<AlbumItem[] | null> {
  if (inMemoryAlbumsCache && inMemoryAlbumsCache.length > 0) {
    return inMemoryAlbumsCache;
  }
  try {
    const idb = await openIDB();
    if (!idb) return null;
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result) && req.result.length > 0) {
          inMemoryAlbumsCache = req.result as AlbumItem[];
          resolve(req.result as AlbumItem[]);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveAllAlbumsToIDB(albums: AlbumItem[]): Promise<void> {
  inMemoryAlbumsCache = albums;
  try {
    const idb = await openIDB();
    if (!idb) return;
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      for (const a of albums) {
        store.put(a);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('IDB save error:', err);
  }
}

async function clearIDB(): Promise<void> {
  try {
    const idb = await openIDB();
    if (!idb) return;
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
  } catch (e) {
    console.warn('IDB clear error:', e);
  }
}

/**
 * Compresses an image file in the browser to clean, lightweight WebP / JPEG
 * Ensures unlimited uploads won't exceed storage limits or cause memory issues.
 */
export async function compressImageFile(file: File, maxDim = 1024, quality = 0.76): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp.startsWith('data:image/webp') && webp.length > 100) {
            resolve(webp);
            return;
          }
        } catch {
          // fallback to jpeg
        }
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch all albums from IndexedDB, Firestore, or fallback
 */
export async function fetchAlbums(): Promise<AlbumItem[]> {
  // 1. Check IndexedDB first (fastest, full capacity, never quota-limited)
  const idbAlbums = await getAlbumsFromIDB();
  if (idbAlbums && idbAlbums.length > 0) {
    return idbAlbums;
  }

  // 2. Fetch from Firestore
  try {
    if (db) {
      const albumsCol = collection(db, 'albums');
      const snapshot = await getDocs(albumsCol);

      if (!snapshot.empty) {
        const loaded: AlbumItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            title: data.title || '',
            category: data.category || 'products',
            badge: data.badge || '',
            badgeColor: data.badgeColor || 'bg-blue-600 text-white',
            description: data.description || '',
            coverImageUrl: data.coverImageUrl || (Array.isArray(data.photos) && data.photos[0]?.url) || '',
            photos: Array.isArray(data.photos) ? data.photos : [],
            highlightPoints: Array.isArray(data.highlightPoints) ? data.highlightPoints : [],
            updatedAt: data.updatedAt || Date.now(),
          });
        });

        // Merge missing default albums if needed (e.g. Success Academy, Masstige)
        for (const def of DEFAULT_ATOMY_ALBUMS) {
          if (!loaded.some((a) => a.id === def.id)) {
            loaded.push(def);
          }
        }

        // Cache in IndexedDB and localStorage
        await saveAllAlbumsToIDB(loaded);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(loaded));
          } catch {
            // ignore quota error
          }
        }
        return loaded;
      }
    }
  } catch (error) {
    console.warn('Could not fetch albums from Firestore (falling back to local cache):', error);
  }

  // 3. Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(ALBUMS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveAllAlbumsToIDB(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached albums:', e);
    }
  }

  // 4. Initialize built-in default albums in IndexedDB
  await saveAllAlbumsToIDB(DEFAULT_ATOMY_ALBUMS);
  return DEFAULT_ATOMY_ALBUMS;
}

/**
 * Saves or updates an album in IndexedDB, localStorage, and Firestore
 */
export async function saveAlbum(album: AlbumItem): Promise<AlbumItem[]> {
  const allAlbums = await fetchAlbums();
  const existingIdx = allAlbums.findIndex((a) => a.id === album.id);
  const updatedAlbum: AlbumItem = {
    ...album,
    updatedAt: Date.now(),
    coverImageUrl: album.coverImageUrl || album.photos[0]?.url || '/images/atomy-flagship-products.png',
  };

  let newAlbums: AlbumItem[];
  if (existingIdx >= 0) {
    newAlbums = [...allAlbums];
    newAlbums[existingIdx] = updatedAlbum;
  } else {
    newAlbums = [updatedAlbum, ...allAlbums];
  }

  // 1. Save to IndexedDB immediately (reliable, unlimited capacity)
  await saveAllAlbumsToIDB(newAlbums);

  // 2. Save to localStorage (best-effort)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(newAlbums));
    } catch (e) {
      console.warn('LocalStorage save skipped (quota):', e);
    }
  }

  // 3. Save to Firestore
  try {
    if (db) {
      const docRef = doc(db, 'albums', album.id);
      await setDoc(
        docRef,
        {
          ...updatedAlbum,
          serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn('Firestore album sync notice:', error);
  }

  return newAlbums;
}

/**
 * Deletes an entire album
 */
export async function deleteAlbum(albumId: string): Promise<AlbumItem[]> {
  const allAlbums = await fetchAlbums();
  const newAlbums = allAlbums.filter((a) => a.id !== albumId);

  await saveAllAlbumsToIDB(newAlbums);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(newAlbums));
    } catch (e) {
      console.warn('LocalStorage delete notice:', e);
    }
  }

  try {
    if (db) {
      const docRef = doc(db, 'albums', albumId);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn('Firestore delete album notice:', error);
  }

  return newAlbums;
}

/**
 * Adds unlimited photos to an album
 */
export async function addPhotosToAlbum(
  albumId: string,
  newPhotos: AlbumPhoto[]
): Promise<{ albums: AlbumItem[]; updatedAlbum: AlbumItem | null }> {
  const allAlbums = await fetchAlbums();
  let albumIdx = allAlbums.findIndex((a) => a.id === albumId);
  
  // If album not found in list, check default albums
  if (albumIdx === -1) {
    const defaultMatch = DEFAULT_ATOMY_ALBUMS.find((a) => a.id === albumId);
    if (defaultMatch) {
      allAlbums.push({ ...defaultMatch });
      albumIdx = allAlbums.length - 1;
    } else {
      return { albums: allAlbums, updatedAlbum: null };
    }
  }

  const targetAlbum = allAlbums[albumIdx];
  const updatedPhotos = [...(targetAlbum.photos || []), ...newPhotos];
  const updatedAlbum: AlbumItem = {
    ...targetAlbum,
    photos: updatedPhotos,
    coverImageUrl: targetAlbum.coverImageUrl || updatedPhotos[0]?.url || '',
    updatedAt: Date.now(),
  };

  const newAlbums = [...allAlbums];
  newAlbums[albumIdx] = updatedAlbum;

  // 1. Save to IndexedDB (Guaranteed to succeed, handles high-res photos)
  await saveAllAlbumsToIDB(newAlbums);

  // 2. Best-effort localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(newAlbums));
    } catch (e) {
      console.warn('LocalStorage quota notice (safe in IndexedDB):', e);
    }
  }

  // 3. Save to Firestore
  try {
    if (db) {
      const docRef = doc(db, 'albums', albumId);
      await setDoc(docRef, updatedAlbum, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore album photos notice:', error);
  }

  return { albums: newAlbums, updatedAlbum };
}

/**
 * Deletes a specific photo from an album
 */
export async function deletePhotoFromAlbum(
  albumId: string,
  photoId: string
): Promise<{ albums: AlbumItem[]; updatedAlbum: AlbumItem | null }> {
  const allAlbums = await fetchAlbums();
  const albumIdx = allAlbums.findIndex((a) => a.id === albumId);
  if (albumIdx === -1) {
    return { albums: allAlbums, updatedAlbum: null };
  }

  const targetAlbum = allAlbums[albumIdx];
  const updatedPhotos = targetAlbum.photos.filter((p) => p.id !== photoId);
  const updatedAlbum: AlbumItem = {
    ...targetAlbum,
    photos: updatedPhotos,
    coverImageUrl:
      targetAlbum.coverImageUrl && updatedPhotos.some((p) => p.url === targetAlbum.coverImageUrl)
        ? targetAlbum.coverImageUrl
        : updatedPhotos[0]?.url || '',
    updatedAt: Date.now(),
  };

  const newAlbums = [...allAlbums];
  newAlbums[albumIdx] = updatedAlbum;

  await saveAllAlbumsToIDB(newAlbums);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(newAlbums));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }

  try {
    if (db) {
      const docRef = doc(db, 'albums', albumId);
      await setDoc(docRef, updatedAlbum, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore delete photo notice:', error);
  }

  return { albums: newAlbums, updatedAlbum };
}

/**
 * Sets a specific photo as the cover image of an album
 */
export async function setAlbumCover(
  albumId: string,
  photoUrl: string
): Promise<{ albums: AlbumItem[]; updatedAlbum: AlbumItem | null }> {
  const allAlbums = await fetchAlbums();
  const albumIdx = allAlbums.findIndex((a) => a.id === albumId);
  if (albumIdx === -1) {
    return { albums: allAlbums, updatedAlbum: null };
  }

  const updatedAlbum: AlbumItem = {
    ...allAlbums[albumIdx],
    coverImageUrl: photoUrl,
    updatedAt: Date.now(),
  };

  const newAlbums = [...allAlbums];
  newAlbums[albumIdx] = updatedAlbum;

  await saveAllAlbumsToIDB(newAlbums);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(newAlbums));
    } catch (e) {
      console.warn('LocalStorage cover notice:', e);
    }
  }

  try {
    if (db) {
      const docRef = doc(db, 'albums', albumId);
      await setDoc(docRef, { coverImageUrl: photoUrl, updatedAt: Date.now() }, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore cover notice:', error);
  }

  return { albums: newAlbums, updatedAlbum };
}

/**
 * Resets all albums back to built-in defaults
 */
export function resetAlbumsToDefault(): AlbumItem[] {
  clearIDB();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ALBUMS_STORAGE_KEY);
  }
  return DEFAULT_ATOMY_ALBUMS;
}

// -------------------------------------------------------------
// BACKWARD-COMPATIBILITY EXPORTS FOR LEGACY CALLS
// -------------------------------------------------------------
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

export const ATOMY_GALLERY_ITEMS: GalleryItem[] = DEFAULT_ATOMY_ALBUMS.map((a) => ({
  id: a.id,
  title: a.title,
  category: a.category === 'team' ? 'products' : a.category,
  badge: a.badge,
  badgeColor: a.badgeColor,
  description: a.description,
  highlightPoints: a.highlightPoints || [],
  imageUrl: a.coverImageUrl || (a.photos[0]?.url || ''),
  caption: a.photos[0]?.caption || a.title,
}));

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const albums = await fetchAlbums();
  return albums.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category === 'team' ? 'products' : a.category,
    badge: a.badge,
    badgeColor: a.badgeColor,
    description: a.description,
    highlightPoints: a.highlightPoints || [],
    imageUrl: a.coverImageUrl || (a.photos[0]?.url || ''),
    caption: a.photos[0]?.caption || a.title,
  }));
}

export async function saveGalleryItem(item: GalleryItem): Promise<void> {
  const album: AlbumItem = {
    id: item.id,
    title: item.title,
    category: item.category,
    badge: item.badge,
    badgeColor: item.badgeColor,
    description: item.description,
    coverImageUrl: item.imageUrl,
    highlightPoints: item.highlightPoints,
    photos: [
      {
        id: `p-${Date.now()}`,
        url: item.imageUrl,
        title: item.title,
        caption: item.caption,
      },
    ],
  };
  await saveAlbum(album);
}

export async function deleteGalleryItem(itemId: string): Promise<void> {
  await deleteAlbum(itemId);
}

export function resetGalleryToDefault(): GalleryItem[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LEGACY_GALLERY_STORAGE_KEY);
    localStorage.removeItem(ALBUMS_STORAGE_KEY);
  }
  return ATOMY_GALLERY_ITEMS;
}
