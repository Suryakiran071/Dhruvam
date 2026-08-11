import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isScrolled = false;
  isMobileMenuOpen = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      this.isScrolled = window.scrollY > 40;
    }
  }

  toggleMobileMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMobileMenu()  { this.isMobileMenuOpen = false; }

  // Magnetic pull toward cursor
  onMagnetic(event: MouseEvent) {
    if (!this.isBrowser) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width  - 0.5) * 9;
    const y = ((event.clientY - rect.top)  / rect.height - 0.5) * 6;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }

  onMagneticReset(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    el.style.transform = 'translate(0, 0)';
  }
}
