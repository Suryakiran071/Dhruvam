import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirestoreService, MediaDoc } from '../services/firestore.service';
import { CloudinaryService } from '../services/cloudinary.service';

export interface BandEvent {
  name: string;
  date: string;
  category: string;
  cover: string;
  itemCount: number;
}

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './media.component.html',
  styleUrl: './media.component.css'
})
export class MediaComponent implements OnInit {
  activeFilter: 'all' | 'events' | 'photos' | 'videos' = 'all';
  isLoading = true;

  // Raw data from Firestore
  allDocs: MediaDoc[] = [];

  // Derived views
  events: BandEvent[] = [];
  allItemsShuffled: MediaDoc[] = [];
  photosShuffled: MediaDoc[] = [];
  videosShuffled: MediaDoc[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private cloudinaryService: CloudinaryService
  ) {}

  async ngOnInit() {
    try {
      this.allDocs = await this.firestoreService.getMedia();
      this.buildViews();
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private buildViews() {
    // Build shuffled flat lists
    this.allItemsShuffled  = this.shuffle([...this.allDocs]);
    this.photosShuffled    = this.shuffle(this.allDocs.filter(i => i.type === 'photo'));
    this.videosShuffled    = this.shuffle(this.allDocs.filter(i => i.type === 'video'));

    // Build events list (one card per unique event, latest item's photo as cover, fallback to video)
    const eventMap = new Map<string, { name: string; date: string; category: string; coverPhoto: string; coverVideo: string; itemCount: number }>();
    for (const doc of this.allDocs) {
      if (!eventMap.has(doc.event)) {
        eventMap.set(doc.event, {
          name: doc.event,
          date: doc.eventDate,
          category: doc.category,
          coverPhoto: doc.type === 'photo' ? doc.cloudinaryUrl : '',
          coverVideo: doc.type === 'video' ? doc.cloudinaryUrl : '',
          itemCount: 1
        });
      } else {
        const e = eventMap.get(doc.event)!;
        e.itemCount++;
        if (!e.coverPhoto && doc.type === 'photo') {
          e.coverPhoto = doc.cloudinaryUrl;
        }
        if (!e.coverVideo && doc.type === 'video') {
          e.coverVideo = doc.cloudinaryUrl;
        }
      }
    }
    this.events = Array.from(eventMap.values()).map(e => ({
      name: e.name,
      date: e.date,
      category: e.category,
      cover: e.coverPhoto || e.coverVideo,
      itemCount: e.itemCount
    }));
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  getOptimizedUrl(url: string, width?: number): string {
    return this.cloudinaryService.getOptimizedUrl(url, width);
  }

  setFilter(f: 'all' | 'events' | 'photos' | 'videos') {
    this.activeFilter = f;
  }
}
