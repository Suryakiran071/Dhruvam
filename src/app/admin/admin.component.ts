import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CloudinaryService } from '../services/cloudinary.service';
import { FirestoreService } from '../services/firestore.service';

interface UploadItem {
  file: File;
  preview: string;
  name: string;
  type: 'photo' | 'video';
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  // ── Active tab ────────────────────────────────────
  activeTab: 'media' | 'youtube' = 'media';

  // ── Media Upload Form ─────────────────────────────
  eventName = '';
  eventDate = '';
  eventCategory = '';
  uploadQueue: UploadItem[] = [];
  isDragging = false;
  isSaving = false;
  savedCount = 0;

  // ── YouTube Performances Form ─────────────────────
  ytTitle = '';
  ytId = '';
  ytDate = '';
  ytDescription = '';
  ytSaving = false;
  ytSaved = false;
  ytError = '';

  constructor(
    private cloudinary: CloudinaryService,
    private firestore: FirestoreService
  ) {}

  // ── Media upload ──────────────────────────────────
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave() { this.isDragging = false; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    this.addFiles(Array.from(e.dataTransfer?.files || []));
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    this.addFiles(Array.from(input.files || []));
    input.value = '';
  }

  addFiles(files: File[]) {
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;
      this.uploadQueue.push({
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: isImage ? 'photo' : 'video',
        preview: isImage ? URL.createObjectURL(file) : '',
        progress: 0,
        status: 'pending'
      });
    }
  }

  removeItem(index: number) { this.uploadQueue.splice(index, 1); }

  get canUpload(): boolean {
    return this.uploadQueue.length > 0 &&
           !!this.eventName && !!this.eventDate && !!this.eventCategory &&
           this.uploadQueue.some(i => i.status === 'pending');
  }

  async uploadAll() {
    if (!this.canUpload) return;
    this.isSaving = true;
    this.savedCount = 0;

    for (const item of this.uploadQueue) {
      if (item.status !== 'pending') continue;
      item.status = 'uploading';
      try {
        const result = await this.cloudinary.upload(item.file, (pct) => { item.progress = pct; });
        await this.firestore.addMedia({
          type: item.type,
          label: item.name,
          event: this.eventName,
          eventDate: this.eventDate,
          category: this.eventCategory,
          cloudinaryUrl: result.secureUrl,
          cloudinaryPublicId: result.publicId
        });
        item.status = 'done';
        item.progress = 100;
        this.savedCount++;
      } catch (err: any) {
        item.status = 'error';
        item.errorMsg = err.message || 'Upload failed';
      }
    }
    this.isSaving = false;
  }

  clearDone() { this.uploadQueue = this.uploadQueue.filter(i => i.status !== 'done'); }

  reset() {
    this.uploadQueue = [];
    this.eventName = '';
    this.eventDate = '';
    this.eventCategory = '';
    this.savedCount = 0;
  }

  // ── YouTube Performances ──────────────────────────
  extractYoutubeId(input: string): string {
    if (!input) return '';
    const match = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : input.trim();
  }

  getYoutubeThumbnail(id: string): string {
    const cleanId = this.extractYoutubeId(id);
    return cleanId ? `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg` : '';
  }

  get ytIdPreview(): string { return this.extractYoutubeId(this.ytId); }

  get canAddYoutube(): boolean {
    const cleanId = this.extractYoutubeId(this.ytId);
    return !!this.ytTitle.trim() && cleanId.length === 11 && !!this.ytDate.trim();
  }

  async addYoutubePerformance() {
    if (!this.canAddYoutube) return;
    this.ytSaving = true;
    this.ytError = '';
    this.ytSaved = false;
    try {
      await this.firestore.addYoutubePerformance({
        title: this.ytTitle.trim(),
        youtubeId: this.extractYoutubeId(this.ytId),
        date: this.ytDate,
        description: this.ytDescription.trim()
      });
      this.ytSaved = true;
      this.ytTitle = '';
      this.ytId = '';
      this.ytDate = '';
      this.ytDescription = '';
      setTimeout(() => this.ytSaved = false, 3000);
    } catch (err: any) {
      this.ytError = err.message || 'Failed to save.';
    } finally {
      this.ytSaving = false;
    }
  }
}
