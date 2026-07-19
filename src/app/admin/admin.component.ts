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
  // Form fields
  eventName = '';
  eventDate = '';
  eventCategory = '';

  // Upload queue
  uploadQueue: UploadItem[] = [];

  isDragging = false;
  isSaving = false;
  savedCount = 0;

  constructor(
    private cloudinary: CloudinaryService,
    private firestore: FirestoreService
  ) {}

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const files = Array.from(e.dataTransfer?.files || []);
    this.addFiles(files);
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.addFiles(files);
    input.value = '';
  }

  addFiles(files: File[]) {
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;

      const item: UploadItem = {
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: isImage ? 'photo' : 'video',
        preview: isImage ? URL.createObjectURL(file) : '',
        progress: 0,
        status: 'pending'
      };
      this.uploadQueue.push(item);
    }
  }

  removeItem(index: number) {
    this.uploadQueue.splice(index, 1);
  }

  get canUpload(): boolean {
    return this.uploadQueue.length > 0 &&
           !!this.eventName &&
           !!this.eventDate &&
           !!this.eventCategory &&
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
        const result = await this.cloudinary.upload(item.file, (pct) => {
          item.progress = pct;
        });

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

  clearDone() {
    this.uploadQueue = this.uploadQueue.filter(i => i.status !== 'done');
  }

  reset() {
    this.uploadQueue = [];
    this.eventName = '';
    this.eventDate = '';
    this.eventCategory = '';
    this.savedCount = 0;
  }
}
