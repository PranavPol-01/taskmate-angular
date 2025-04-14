import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  private readonly GA_TRACKING_ID = 'G-4N1XCNR6JP';

  constructor(private router: Router) {
    // Initialize Google Analytics
    this.initializeGoogleAnalytics();

    // Track page views
    this.trackPageViews();
  }

  private initializeGoogleAnalytics(): void {
    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.GA_TRACKING_ID}');
    `;
    document.head.appendChild(gtagScript);
  }

  // private trackPageViews(): void {
  //   this.router.events
  //     .pipe(filter((event) => event instanceof NavigationEnd))
  //     .subscribe((event: NavigationEnd) => {
  //       gtag('config', this.GA_TRACKING_ID, {
  //         page_path: event.urlAfterRedirects,
  //       });
  //     });
  // }
  private trackPageViews(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        window.gtag('config', this.GA_TRACKING_ID, {
          page_path: event.urlAfterRedirects,
        });
      });
  }

  trackEvent(
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number
  ): void {
    window.gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue,
    });
  }
}
