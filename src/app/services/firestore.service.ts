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

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private async getDb() {
    // Dynamic imports to prevent Firebase evaluation on Deno/Netlify Edge servers
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    return getFirestore(app);
  }

  async addMedia(item: Omit<MediaDoc, 'id' | 'createdAt'>): Promise<string> {
    if (!this.isBrowser) {
      throw new Error('Firestore is only available in the browser.');
    }
    const db = await this.getDb();
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'media'), {
      ...item,
      createdAt: Timestamp.now()
    });
    return ref.id;
  }

  async getMedia(): Promise<MediaDoc[]> {
    if (!this.isBrowser) {
      return [];
    }
    const db = await this.getDb();
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MediaDoc));
  }

  async deleteMedia(id: string): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    const db = await this.getDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'media', id));
  }
}
