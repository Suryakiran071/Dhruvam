import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirestoreService, MediaDoc, YoutubePerformance } from '../services/firestore.service';
import { CloudinaryService } from '../services/cloudinary.service';

export interface BandEvent {
  name: string;
  date: string;
  category: string;
  cover: string;
  itemCount: number;
}

type FilterType = 'all' | 'events' | 'photos' | 'videos' | 'performances';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './media.component.html',
  styleUrl: './media.component.css'
})
export class MediaComponent implements OnInit, OnDestroy {
  activeFilter: FilterType = 'all';
  isLoading = true;

  // Raw data from Firestore
  allDocs: MediaDoc[] = [];

  // Derived views
  events: BandEvent[] = [];
  allItemsShuffled: MediaDoc[] = [];
  photosShuffled: MediaDoc[] = [];
  videosShuffled: MediaDoc[] = [];

  // YouTube Performances
  performances: YoutubePerformance[] = [];
  performancesLoading = false;

  // ── Lightbox ──────────────────────────────────────
  lightboxOpen = false;
  lightboxIndex = 0;
  lightboxItems: MediaDoc[] = [];

  private isBrowser: boolean;

  constructor(
    private firestoreService: FirestoreService,
    private cloudinaryService: CloudinaryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    try {
      const [media, performances] = await Promise.all([
        this.firestoreService.getMedia(),
        this.firestoreService.getYoutubePerformances()
      ]);
      this.allDocs = media;
      this.performances = performances;
      this.buildViews();
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  // ── Keyboard navigation for lightbox ──────────────
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.lightboxOpen) return;
    if (e.key === 'ArrowRight') this.lightboxNext();
    if (e.key === 'ArrowLeft')  this.lightboxPrev();
    if (e.key === 'Escape')     this.closeLightbox();
  }

  // ── Lightbox controls ─────────────────────────────
  openLightbox(items: MediaDoc[], clickedItem: MediaDoc) {
    const photos = items.filter(i => i.type === 'photo');
    const idx = photos.findIndex(i => i.cloudinaryUrl === clickedItem.cloudinaryUrl);
    if (idx === -1 || photos.length === 0) return;
    this.lightboxItems = photos;
    this.lightboxIndex = idx;
    this.lightboxOpen = true;
    if (this.isBrowser) document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    if (this.isBrowser) document.body.style.overflow = '';
  }

  lightboxNext() {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxItems.length;
  }

  lightboxPrev() {
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxItems.length) % this.lightboxItems.length;
  }

  get currentLightboxItem(): MediaDoc | null {
    return this.lightboxItems[this.lightboxIndex] ?? null;
  }

  // ── YouTube helpers ───────────────────────────────
  getYoutubeThumbnail(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }

  onThumbnailError(event: Event, youtubeId: string) {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('hqdefault.jpg')) {
      target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
  }

  openYoutubeVideo(youtubeId: string) {
    if (this.isBrowser) {
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank', 'noopener,noreferrer');
    }
  }

  // ── Data helpers ──────────────────────────────────
  private buildViews() {
    this.allItemsShuffled = this.shuffle([...this.allDocs]);
    this.photosShuffled   = this.shuffle(this.allDocs.filter(i => i.type === 'photo'));
    this.videosShuffled   = this.shuffle(this.allDocs.filter(i => i.type === 'video'));

    const eventMap = new Map<string, {
      name: string; date: string; category: string;
      coverPhoto: string; coverVideo: string; itemCount: number
    }>();
    for (const doc of this.allDocs) {
      if (!eventMap.has(doc.event)) {
        eventMap.set(doc.event, {
          name: doc.event, date: doc.eventDate, category: doc.category,
          coverPhoto: doc.type === 'photo' ? doc.cloudinaryUrl : '',
          coverVideo: doc.type === 'video' ? doc.cloudinaryUrl : '',
          itemCount: 1
        });
      } else {
        const e = eventMap.get(doc.event)!;
        e.itemCount++;
        if (!e.coverPhoto && doc.type === 'photo') e.coverPhoto = doc.cloudinaryUrl;
        if (!e.coverVideo && doc.type === 'video') e.coverVideo = doc.cloudinaryUrl;
      }
    }
    this.events = Array.from(eventMap.values()).map(e => ({
      name: e.name, date: e.date, category: e.category,
      cover: e.coverPhoto || e.coverVideo, itemCount: e.itemCount
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

  getVideoUrl(url: string): string {
    return this.cloudinaryService.getVideoUrl(url);
  }

  getVideoPosterUrl(url: string): string {
    return this.cloudinaryService.getVideoPosterUrl(url);
  }

  setFilter(f: FilterType) {
    this.activeFilter = f;
  }
}
