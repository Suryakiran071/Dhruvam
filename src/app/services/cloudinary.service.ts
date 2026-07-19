import { Injectable } from '@angular/core';
import { cloudinaryConfig } from '../config/environment';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: 'image' | 'video';
  format: string;
  bytes: number;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`;

  async upload(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.uploadUrl);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve({
            publicId: res.public_id,
            url: res.url,
            secureUrl: res.secure_url,
            resourceType: res.resource_type,
            format: res.format,
            bytes: res.bytes
          });
        } else {
          reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed — check network'));
      xhr.send(formData);
    });
  }

  // Builds optimized URL for display (auto format, quality, and optional width)
  getOptimizedUrl(url: string, width?: number): string {
    if (!url || !url.includes('cloudinary.com')) return url || '';
    
    let targetUrl = url;
    // If it's a video, convert extension to .jpg so Cloudinary serves a video frame thumbnail
    if (url.includes('/video/upload/')) {
      targetUrl = url.replace(/\.[^/.]+$/, '.jpg');
    }

    const transform = width
      ? `f_auto,q_auto,w_${width}`
      : 'f_auto,q_auto';
    return targetUrl.replace('/upload/', `/upload/${transform}/`);
  }
}
