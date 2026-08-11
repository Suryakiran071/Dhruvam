import {
  Component, OnInit, OnDestroy, HostListener,
  Inject, PLATFORM_ID, ChangeDetectorRef
} from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'portfolio';

  scrollProgress = 0;
  showBackToTop = false;
  isTransitioning = false;
  showLoader = true;

  private isBrowser: boolean;
  private routerSub?: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) {
      this.showLoader = false;
      return;
    }

    // Page loader: show only on first visit per session
    const hasVisited = sessionStorage.getItem('dhruvam_visited');
    if (!hasVisited) {
      this.showLoader = true;
      setTimeout(() => {
        this.showLoader = false;
        sessionStorage.setItem('dhruvam_visited', '1');
        this.cdr.detectChanges();
      }, 2200);
    } else {
      this.showLoader = false;
    }

    // Smooth page transitions
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationStart || e instanceof NavigationEnd)
    ).subscribe(e => {
      if (e instanceof NavigationStart) {
        this.isTransitioning = true;
        this.cdr.detectChanges();
      } else if (e instanceof NavigationEnd) {
        setTimeout(() => {
          this.isTransitioning = false;
          this.cdr.detectChanges();
        }, 80);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.showBackToTop = scrollTop > 400;
  }

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
