import {
  Component, OnInit, OnDestroy, AfterViewInit,
  HostListener, Inject, PLATFORM_ID
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FirestoreService, MediaDoc } from '../services/firestore.service';
import { CloudinaryService } from '../services/cloudinary.service';

export interface FeaturedEvent {
  name: string;
  date: string;
  category: string;
  cover: string;
}

export interface StatItem {
  target: number;
  suffix: string;
  label: string;
  current: number;
  isK: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // ─── Data ───────────────────────────────────────────
  featuredEvents: FeaturedEvent[] = [];
  isLoading = true;

  // ─── Parallax ───────────────────────────────────────
  parallaxOffset = 0;

  // ─── Cursor glow ────────────────────────────────────
  cursorX = -9999;
  cursorY = -9999;

  // ─── Floating particles ─────────────────────────────
  particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left:     Math.random() * 100,
    top:      Math.random() * 100,
    delay:    Math.random() * 6,
    duration: 4 + Math.random() * 7,
    size:     1.5 + Math.random() * 3
  }));

  // ─── Animated counters ──────────────────────────────
  stats: StatItem[] = [
    { target: 50,   suffix: '+', label: 'Live Shows',       current: 0, isK: false },
    { target: 12,   suffix: '',  label: 'Members',          current: 0, isK: false },
    { target: 5000, suffix: '',  label: 'Audience Reached', current: 0, isK: true  },
    { target: 100,  suffix: '%', label: 'Passion',          current: 0, isK: false },
  ];

  private observers: IntersectionObserver[] = [];
  private isBrowser: boolean;

  constructor(
    private firestoreService: FirestoreService,
    private cloudinaryService: CloudinaryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ─── Lifecycle ──────────────────────────────────────
  async ngOnInit() {
    try {
      const allDocs = await this.firestoreService.getMedia();
      this.buildFeaturedEvents(allDocs);
    } catch (err) {
      console.error('Failed to load featured performances:', err);
    } finally {
      this.isLoading = false;
      if (this.isBrowser) {
        // Re-run after dynamic cards render
        setTimeout(() => this.setupObservers(), 300);
      }
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => this.setupObservers(), 100);
    }
  }

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  // ─── Host listeners ─────────────────────────────────
  @HostListener('window:scroll', [])
  onScroll() {
    if (this.isBrowser) {
      this.parallaxOffset = window.scrollY * 0.35;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
  }

  // ─── Intersection observer setup ────────────────────
  private setupObservers() {
    // Fade-up: observe all .fade-up elements not yet visible
    const fadeEls = document.querySelectorAll('.fade-up:not(.visible)');
    if (fadeEls.length) {
      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      fadeEls.forEach(el => fadeObserver.observe(el));
      this.observers.push(fadeObserver);
    }

    // Stats counter
    const statsEl = document.querySelector('#stats-section');
    if (statsEl && this.stats.every(s => s.current === 0)) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      statsObserver.observe(statsEl);
      this.observers.push(statsObserver);
    }
  }

  private animateCounters() {
    const duration = 1800;
    const steps = 60;
    const intervalMs = duration / steps;

    this.stats.forEach(stat => {
      let step = 0;
      const increment = stat.target / steps;
      const timer = setInterval(() => {
        step++;
        const eased = this.easeOutCubic(step / steps);
        stat.current = Math.floor(eased * stat.target);
        if (step >= steps) {
          stat.current = stat.target;
          clearInterval(timer);
        }
      }, intervalMs);
    });
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  // ─── Stat display formatter ─────────────────────────
  displayStat(stat: StatItem): string {
    if (stat.isK) {
      if (stat.current >= 1000) {
        return (stat.current / 1000).toFixed(stat.current % 1000 === 0 ? 0 : 1) + 'K+';
      }
      return stat.current + '+';
    }
    return stat.current + stat.suffix;
  }

  // ─── Card 3D tilt ───────────────────────────────────
  onCardTilt(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -9;
    const rotY = ((x - cx) / cx) * 9;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
  }

  onCardReset(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }

  // ─── Data builders ──────────────────────────────────
  private buildFeaturedEvents(docs: MediaDoc[]) {
    const eventMap = new Map<string, {
      name: string; date: string; category: string;
      coverPhoto: string; coverVideo: string;
    }>();
    for (const doc of docs) {
      if (!eventMap.has(doc.event)) {
        eventMap.set(doc.event, {
          name: doc.event,
          date: doc.eventDate,
          category: doc.category,
          coverPhoto: doc.type === 'photo' ? doc.cloudinaryUrl : '',
          coverVideo: doc.type === 'video' ? doc.cloudinaryUrl : ''
        });
      } else {
        const e = eventMap.get(doc.event)!;
        if (!e.coverPhoto && doc.type === 'photo') e.coverPhoto = doc.cloudinaryUrl;
        if (!e.coverVideo && doc.type === 'video') e.coverVideo = doc.cloudinaryUrl;
      }
    }
    this.featuredEvents = Array.from(eventMap.values()).map(e => ({
      name: e.name,
      date: e.date,
      category: e.category,
      cover: e.coverPhoto || e.coverVideo
    })).slice(0, 3);
  }

  getOptimizedUrl(url: string, width?: number): string {
    return this.cloudinaryService.getOptimizedUrl(url, width);
  }
}
