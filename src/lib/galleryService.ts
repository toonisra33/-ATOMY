import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { GalleryItem, ATOMY_GALLERY_ITEMS } from '../components/ImageGalleryAlbum';

const LOCAL_STORAGE_KEY = 'atomy_custom_gallery_items';

/**
 * Loads gallery items from Firestore if available, otherwise from localStorage,
 * falling back to default built-in items.
 */
export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  try {
    const galleryCol = collection(db, 'gallery');
    const snapshot = await getDocs(galleryCol);

    if (!snapshot.empty) {
      const items: GalleryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || '',
          category: data.category || 'products',
          badge: data.badge || '',
          badgeColor: data.badgeColor || 'bg-blue-600 text-white',
          description: data.description || '',
          highlightPoints: Array.isArray(data.highlightPoints) ? data.highlightPoints : [],
          imageUrl: data.imageUrl || '',
          caption: data.caption || '',
        });
      });

      // Cache locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return items;
    }
  } catch (error) {
    console.warn('Could not fetch gallery items from Firestore (falling back to local cache):', error);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read cached gallery items:', e);
  }

  // Fallback to built-in items
  return ATOMY_GALLERY_ITEMS;
}

/**
 * Saves or updates a gallery item in Firestore and updates localStorage.
 */
export async function saveGalleryItem(item: GalleryItem): Promise<void> {
  // Update local storage first for snappy UI
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    let items: GalleryItem[] = cached ? JSON.parse(cached) : [...ATOMY_GALLERY_ITEMS];
    const existingIndex = items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Local storage cache update failed:', e);
  }

  // Save to Firestore
  try {
    const docRef = doc(db, 'gallery', item.id);
    await setDoc(docRef, {
      ...item,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving gallery item to Firestore:', error);
    // Keep local change even if Firestore failed
  }
}

/**
 * Deletes a gallery item from Firestore and localStorage.
 */
export async function deleteGalleryItem(itemId: string): Promise<void> {
  // Update local storage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      let items: GalleryItem[] = JSON.parse(cached);
      items = items.filter((i) => i.id !== itemId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.warn('Local storage delete failed:', e);
  }

  // Delete from Firestore
  try {
    const docRef = doc(db, 'gallery', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting gallery item from Firestore:', error);
  }
}

/**
 * Resets gallery items back to default built-in items.
 */
export function resetGalleryToDefault(): GalleryItem[] {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return ATOMY_GALLERY_ITEMS;
}
