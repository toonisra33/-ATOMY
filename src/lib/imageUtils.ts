/**
 * Utility functions for client-side image processing, compression, and banner management
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Resizes and compresses an image file in the browser using HTML5 Canvas.
 * Supports large mobile phone photos (up to 25MB+) without server roundtrips.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('ไฟล์ที่เลือกไม่ใช่ไฟล์รูปภาพที่ถูกต้อง'));
    }

    // Safety check: 30MB limit
    if (file.size > 30 * 1024 * 1024) {
      return reject(new Error('ขนาดไฟล์ใหญ่เกินไป (กรุณาใช้ภาพขนาดไม่เกิน 30MB)'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพจากอุปกรณ์ได้'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('เบราว์เซอร์ไม่สามารถประมวลผลไฟล์รูปภาพนี้ได้'));
      };

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            return reject(new Error('ไม่พบขนาดความกว้าง/ความสูงของรูปภาพ'));
          }

          // Calculate aspect ratio preserving dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('ไม่สามารถสร้างกราฟิกสำหรับย่อขนาดรูปภาพได้'));
          }

          // Image smoothing for highest quality downscaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // White background for transparent PNG converted to JPEG
          if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL(mimeType, quality);
          if (!dataUrl || dataUrl === 'data:,') {
            return reject(new Error('เกิดข้อผิดพลาดในการแปลงรูปภาพ'));
          }

          resolve(dataUrl);
        } catch (err: any) {
          reject(new Error('เกิดข้อผิดพลาดในการประมวลผลภาพ: ' + (err.message || 'Unknown error')));
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

const LOCAL_STORAGE_DESKTOP_BANNER = 'atomy_custom_banner_desktop';
const LOCAL_STORAGE_MOBILE_BANNER = 'atomy_custom_banner_mobile';

/**
 * Retrieves a custom banner from localStorage if the user has uploaded one.
 */
export function getCustomBanner(type: 'desktop' | 'mobile'): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = type === 'mobile' ? LOCAL_STORAGE_MOBILE_BANNER : LOCAL_STORAGE_DESKTOP_BANNER;
    const val = localStorage.getItem(key);
    if (!val || val.length < 50 || (!val.startsWith('data:image/') && !val.startsWith('http') && !val.startsWith('/'))) {
      if (val) localStorage.removeItem(key);
      return null;
    }
    return val;
  } catch {
    return null;
  }
}

/**
 * Saves a custom banner to localStorage and dispatches an event for live preview updates.
 */
export function setCustomBanner(type: 'desktop' | 'mobile', dataUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = type === 'mobile' ? LOCAL_STORAGE_MOBILE_BANNER : LOCAL_STORAGE_DESKTOP_BANNER;
    localStorage.setItem(key, dataUrl);
    window.dispatchEvent(new CustomEvent('atomy-banner-updated', { detail: { type, dataUrl } }));
  } catch (err) {
    console.warn('Could not save banner to localStorage:', err);
  }
}

/**
 * Clears custom banner and restores default.
 */
export function clearCustomBanner(type: 'desktop' | 'mobile'): void {
  if (typeof window === 'undefined') return;
  try {
    const key = type === 'mobile' ? LOCAL_STORAGE_MOBILE_BANNER : LOCAL_STORAGE_DESKTOP_BANNER;
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('atomy-banner-updated', { detail: { type, dataUrl: null } }));
  } catch (err) {
    console.warn('Could not remove banner from localStorage:', err);
  }
}

/**
 * Unified Banner Upload:
 * 1. Compresses client-side to target aspect ratio (Desktop 1200x630, Mobile 1080x720)
 * 2. Saves to localStorage so preview & download are instantaneous and persistent on static hosting
 * 3. Tries backend /api/admin/upload-banner if available (in Dev or Node container)
 */
export async function uploadBanner(
  file: File,
  type: 'desktop' | 'mobile'
): Promise<{ success: boolean; dataUrl: string; message: string }> {
  // 1. Optimize banner dimensions
  const maxWidth = type === 'mobile' ? 1080 : 1200;
  const maxHeight = type === 'mobile' ? 720 : 630;

  const compressedDataUrl = await compressImage(file, {
    maxWidth,
    maxHeight,
    quality: 0.86,
    mimeType: 'image/jpeg',
  });

  // 2. Persist locally first for immediate preview on any environment (Firebase Hosting / local)
  setCustomBanner(type, compressedDataUrl);

  // 3. Opportunistically sync to server if running with custom Express backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/admin/upload-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: compressedDataUrl, bannerType: type }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          dataUrl: compressedDataUrl,
          message: `อัปโหลดภาพแบนเนอร์ ${type === 'mobile' ? 'Mobile' : 'Desktop'} เรียบร้อยและบันทึกลงระบบแล้ว`,
        };
      }
    }
  } catch (syncErr) {
    // Expected on static Firebase Hosting where Express API is not mounted
    console.info('Backend upload-banner endpoint not available, using local persistence.');
  }

  return {
    success: true,
    dataUrl: compressedDataUrl,
    message: `อัปโหลดภาพแบนเนอร์ ${type === 'mobile' ? 'Mobile' : 'Desktop'} สำเร็จ! แสดงผลตัวอย่างทันที`,
  };
}
