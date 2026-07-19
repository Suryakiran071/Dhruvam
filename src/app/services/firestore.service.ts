import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore, Firestore,
  collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, Timestamp
} from 'firebase/firestore';
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
  createdAt?: Timestamp;
}

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private app?: FirebaseApp;
  private db?: Firestore;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
    }
  }

  async addMedia(item: Omit<MediaDoc, 'id' | 'createdAt'>): Promise<string> {
    if (!this.isBrowser || !this.db) {
      throw new Error('Firestore is only available in the browser.');
    }
    const ref = await addDoc(collection(this.db, 'media'), {
      ...item,
      createdAt: Timestamp.now()
    });
    return ref.id;
  }

  async getMedia(): Promise<MediaDoc[]> {
    if (!this.isBrowser || !this.db) {
      return [];
    }
    const q = query(collection(this.db, 'media'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MediaDoc));
  }

  async deleteMedia(id: string): Promise<void> {
    if (!this.isBrowser || !this.db) {
      return;
    }
    await deleteDoc(doc(this.db, 'media', id));
  }
}
