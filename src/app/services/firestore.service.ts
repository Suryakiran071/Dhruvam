import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firebaseConfig } from '../config/environment';

export interface MediaDoc {
  id?: string;
  type: 'photo' | 'video';
  label: string;
  event: string;
  eventDate: string;
  category: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  createdAt?: any;
}

export interface YoutubePerformance {
  id?: string;
  title: string;
  youtubeId: string;   // e.g. "dQw4w9WgXcQ"
  date: string;
  description?: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private async getDb() {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    return getFirestore(app);
  }

  // ──────────────────────────────────────────────────
  //  MEDIA (photos + cloudinary videos)
  // ──────────────────────────────────────────────────

  async addMedia(item: Omit<MediaDoc, 'id' | 'createdAt'>): Promise<string> {
    if (!this.isBrowser) throw new Error('Firestore is only available in the browser.');
    const db = await this.getDb();
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'media'), { ...item, createdAt: Timestamp.now() });
    return ref.id;
  }

  async getMedia(): Promise<MediaDoc[]> {
    if (!this.isBrowser) return [];
    const db = await this.getDb();
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MediaDoc));
  }

  async deleteMedia(id: string): Promise<void> {
    if (!this.isBrowser) return;
    const db = await this.getDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'media', id));
  }

  // ──────────────────────────────────────────────────
  //  YOUTUBE PERFORMANCES
  // ──────────────────────────────────────────────────

  async addYoutubePerformance(item: Omit<YoutubePerformance, 'id' | 'createdAt'>): Promise<string> {
    if (!this.isBrowser) throw new Error('Firestore is only available in the browser.');
    const db = await this.getDb();
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'youtube_performances'), { ...item, createdAt: Timestamp.now() });
    return ref.id;
  }

  async getYoutubePerformances(): Promise<YoutubePerformance[]> {
    if (!this.isBrowser) return [];
    const db = await this.getDb();
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const q = query(collection(db, 'youtube_performances'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as YoutubePerformance));
  }

  async deleteYoutubePerformance(id: string): Promise<void> {
    if (!this.isBrowser) return;
    const db = await this.getDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'youtube_performances', id));
  }
}
