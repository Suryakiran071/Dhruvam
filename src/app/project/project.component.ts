import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Release {
  title: string;
  type: string;
  year: string;
  genre: string;
  description: string;
  youtubeUrl: string;
  spotifyUrl: string;
  comingSoon: boolean;
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent {

  releases: Release[] = [
    {
      title: 'Yathra',
      type: 'Original',
      year: '2025',
      genre: 'Original · Indie',
      description: 'Our debut original composition — a journey of sound and soul, crafted from the ground up by the DHRUVAM collective.',
      youtubeUrl: 'https://www.youtube.com/@Dhruvamband',
      spotifyUrl: 'https://spotify.com',
      comingSoon: false
    },
    {
      title: 'Coming Soon',
      type: 'Coming Soon',
      year: '2025',
      genre: 'Stay Tuned',
      description: 'Something new is in the making. Follow us on Instagram and YouTube to be the first to know when the next release drops.',
      youtubeUrl: 'https://www.youtube.com/@Dhruvamband',
      spotifyUrl: 'https://spotify.com',
      comingSoon: true
    }
  ];

  getBadgeClass(type: string): string {
    switch (type) {
      case 'Original': return 'bg-white text-black';
      case 'Coming Soon': return 'bg-zinc-700 text-gray-300 border border-zinc-600';
      default: return 'bg-zinc-800 text-gray-300';
    }
  }
}
