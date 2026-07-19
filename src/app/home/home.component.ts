import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirestoreService, MediaDoc } from '../services/firestore.service';
import { CloudinaryService } from '../services/cloudinary.service';

export interface FeaturedEvent {
  name: string;
  date: string;
  category: string;
  cover: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredEvents: FeaturedEvent[] = [];
  isLoading = true;

  constructor(
    private firestoreService: FirestoreService,
    private cloudinaryService: CloudinaryService
  ) {}

  async ngOnInit() {
    try {
      const allDocs = await this.firestoreService.getMedia();
      this.buildFeaturedEvents(allDocs);
    } catch (err) {
      console.error('Failed to load featured performances:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private buildFeaturedEvents(docs: MediaDoc[]) {
    // Build events list (one card per unique event, latest item's photo as cover, fallback to video)
    const eventMap = new Map<string, { name: string; date: string; category: string; coverPhoto: string; coverVideo: string }>();
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
        if (!e.coverPhoto && doc.type === 'photo') {
          e.coverPhoto = doc.cloudinaryUrl;
        }
        if (!e.coverVideo && doc.type === 'video') {
          e.coverVideo = doc.cloudinaryUrl;
        }
      }
    }
    // Take the top 3 latest events for the home page
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
