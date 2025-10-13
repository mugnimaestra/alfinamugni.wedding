/**
 * Analytics Implementation for Wedding Website
 * Cloudflare Web Analytics with custom event tracking
 */

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface WeddingAnalyticsConfig {
  cloudflareAnalyticsId?: string;
  enableCustomEvents: boolean;
  enablePerformanceTracking: boolean;
  enableUserBehaviorTracking: boolean;
  enableErrorTracking: boolean;
  enableIndonesianOptimization: boolean;
}

export interface UserBehaviorData {
  sessionId: string;
  userId?: string;
  pageViews: number;
  timeOnPage: number;
  scrollDepth: number;
  interactions: string[];
  deviceInfo: DeviceInfo;
  networkInfo: NetworkInfo;
  locationInfo: LocationInfo;
}

export interface DeviceInfo {
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isTouchDevice: boolean;
  batteryLevel?: number;
}

export interface NetworkInfo {
  effectiveType: string;
  downlink?: number;
  rtt?: number;
  saveData: boolean;
  carrier?: string;
  isIndonesianNetwork: boolean;
}

export interface LocationInfo {
  timezone: string;
  isJakartaTimezone: boolean;
  country?: string;
  region?: string;
  city?: string;
}

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  inp: number; // Interaction to Next Paint
  pageLoadTime: number;
  resourceLoadTimes: Record<string, number>;
}

class WeddingAnalytics {
  private config: WeddingAnalyticsConfig;
  private sessionId: string;
  private startTime: number;
  private pageViewCount = 0;
  private lastPageViewTime = 0;
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private userBehavior: UserBehaviorData;

  constructor(config: WeddingAnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.userBehavior = this.initializeUserBehavior();
  }

  private generateSessionId(): string {
    return `wedding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeUserBehavior(): UserBehaviorData {
    return {
      sessionId: this.sessionId,
      pageViews: 0,
      timeOnPage: 0,
      scrollDepth: 0,
      interactions: [],
      deviceInfo: this.getDeviceInfo(),
      networkInfo: this.getNetworkInfo(),
      locationInfo: this.getLocationInfo(),
    };
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;
    
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    
    return {
      userAgent,
      screenResolution,
      viewportSize,
      deviceType,
      isTouchDevice: 'ontouchstart' in window,
    };
  }

  private getNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    let effectiveType = '4g';
    let downlink: number | undefined;
    let rtt: number | undefined;
    let saveData = false;
    let carrier: string | undefined;
    let isIndonesianNetwork = false;

    if (connection) {
      effectiveType = connection.effectiveType || '4g';
      downlink = connection.downlink;
      rtt = connection.rtt;
      saveData = connection.saveData || false;
    }

    // Detect Indonesian network
    if (this.config.enableIndonesianOptimization) {
      carrier = this.detectIndonesianCarrier();
      isIndonesianNetwork = !!carrier;
    }

    return {
      effectiveType,
      downlink,
      rtt,
      saveData,
      carrier,
      isIndonesianNetwork,
    };
  }

  private detectIndonesianCarrier(): string | undefined {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check for carrier indicators in user agent
    if (userAgent.includes('telkomsel') || userAgent.includes('tsel')) {
      return 'Telkomsel';
    }
    if (userAgent.includes('indosat') || userAgent.includes('ooredoo')) {
      return 'Indosat';
    }
    if (userAgent.includes('xl') && userAgent.includes('axiata')) {
      return 'XL Axiata';
    }
    if (userAgent.includes('tri') || userAgent.includes('hutchison')) {
      return 'Tri';
    }
    if (userAgent.includes('smartfren')) {
      return 'Smartfren';
    }

    return undefined;
  }

  private getLocationInfo(): LocationInfo {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isJakartaTimezone = timezone === 'Asia/Jakarta';

    return {
      timezone,
      isJakartaTimezone,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Cloudflare Web Analytics
      if (this.config.cloudflareAnalyticsId) {
        this.initializeCloudflareAnalytics();
      }

      // Initialize performance tracking
      if (this.config.enablePerformanceTracking) {
        this.initializePerformanceTracking();
      }

      // Initialize user behavior tracking
      if (this.config.enableUserBehaviorTracking) {
        this.initializeUserBehaviorTracking();
      }

      // Initialize error tracking
      if (this.config.enableErrorTracking) {
        this.initializeErrorTracking();
      }

      this.isInitialized = true;
      console.log('[WeddingAnalytics] Initialized successfully');
    } catch (error) {
      console.error('[WeddingAnalytics] Initialization failed:', error);
    }
  }

  private initializeCloudflareAnalytics(): void {
    // Cloudflare Web Analytics script would be loaded via the head
    // This is a placeholder for any additional Cloudflare-specific setup
    console.log('[WeddingAnalytics] Cloudflare Web Analytics initialized');
  }

  private initializePerformanceTracking(): void {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.trackCoreWebVitals();
    }

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPageLoadTime();
      }, 0);
    });
  }

  private trackCoreWebVitals(): void {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackEvent('performance', 'lcp', 'core_web_vital', Math.round(lastEntry.startTime));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('[WeddingAnalytics] LCP tracking failed:', error);
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-input') {
            const fid = Math.round((entry as any).processingStart - entry.startTime);
            this.trackEvent('performance', 'fid', 'core_web_vital', fid);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('[WeddingAnalytics] FID tracking failed:', error);
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.trackEvent('performance', 'cls', 'core_web_vital', Math.round(clsValue * 10000) / 10000);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('[WeddingAnalytics] CLS tracking failed:', error);
    }
  }

  private trackPageLoadTime(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart);
      this.trackEvent('performance', 'page_load_time', 'page_metrics', loadTime);
    }
  }

  private initializeUserBehaviorTracking(): void {
    // Track page views
    this.trackPageView();

    // Track scroll depth
    this.trackScrollDepth();

    // Track interactions
    this.trackInteractions();

    // Track time on page
    this.trackTimeOnPage();
  }

  private trackPageView(): void {
    this.pageViewCount++;
    this.lastPageViewTime = Date.now();
    this.userBehavior.pageViews = this.pageViewCount;

    this.trackEvent('engagement', 'page_view', 'user_behavior', this.pageViewCount, {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    });
  }

  private trackScrollDepth(): void {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.userBehavior.scrollDepth = maxScroll;

        // Track milestone scroll depths
        thresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !this.userBehavior.interactions.includes(`scroll_${threshold}`)) {
            this.userBehavior.interactions.push(`scroll_${threshold}`);
            this.trackEvent('engagement', 'scroll_depth', 'user_behavior', threshold, {
              max_depth: maxScroll,
            });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private trackInteractions(): void {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      const link = target.closest('a');
      
      if (button) {
        const buttonText = button.textContent?.trim() || 'unknown';
        this.userBehavior.interactions.push(`button_click_${buttonText}`);
        this.trackEvent('engagement', 'button_click', 'user_interaction', undefined, {
          button_text: buttonText,
          button_id: button.id,
          button_class: button.className,
        });
      }

      if (link) {
        const linkText = link.textContent?.trim() || 'unknown';
        const linkHref = link.href;
        this.userBehavior.interactions.push(`link_click_${linkText}`);
        this.trackEvent('engagement', 'link_click', 'user_interaction', undefined, {
          link_text: linkText,
          link_href: linkHref,
        });
      }
    });

    // Track form interactions
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (target.form) {
        const formId = target.form.id || 'unknown';
        const fieldName = target.name || target.id || 'unknown';
        this.userBehavior.interactions.push(`form_focus_${fieldName}`);
        this.trackEvent('engagement', 'form_focus', 'user_interaction', undefined, {
          form_id: formId,
          field_name: fieldName,
          field_type: target.type,
        });
      }
    }, true);
  }

  private trackTimeOnPage(): void {
    // Send time on page data when user leaves
    const sendTimeOnPage = () => {
      const timeOnPage = Date.now() - this.lastPageViewTime;
      this.userBehavior.timeOnPage = timeOnPage;
      
      this.trackEvent('engagement', 'time_on_page', 'user_behavior', Math.round(timeOnPage / 1000), {
        page_views: this.pageViewCount,
        scroll_depth: this.userBehavior.scrollDepth,
        interactions: this.userBehavior.interactions.length,
      });
    };

    // Track when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendTimeOnPage();
      }
    });

    // Track when user leaves
    window.addEventListener('beforeunload', sendTimeOnPage);
  }

  private initializeErrorTracking(): void {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript_error', 'error_tracking', undefined, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'promise_rejection', 'error_tracking', undefined, {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  trackEvent(category: string, action: string, label?: string, value?: number, metadata?: Record<string, unknown>): void {
    if (!this.config.enableCustomEvents) return;

    const event: AnalyticsEvent = {
      name: `${category}_${action}`,
      category,
      action,
      label,
      value,
      metadata: {
        ...metadata,
        session_id: this.sessionId,
        timestamp: Date.now(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        ...this.getDeviceInfo(),
        ...this.getNetworkInfo(),
        ...this.getLocationInfo(),
      },
    };

    // Add to queue
    this.eventQueue.push(event);

    // Send immediately or batch based on configuration
    this.sendEvent(event);
  }

  private sendEvent(event: AnalyticsEvent): void {
    try {
      // Send to Cloudflare Analytics
      if (this.config.cloudflareAnalyticsId && (window as any)._cf) {
        // Cloudflare Analytics specific implementation
        console.log('[WeddingAnalytics] Event sent to Cloudflare:', event);
      }

      // Send to custom analytics endpoint
      this.sendToCustomEndpoint(event);
    } catch (error) {
      console.error('[WeddingAnalytics] Failed to send event:', error);
    }
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('[WeddingAnalytics] Failed to send event to custom endpoint:', error);
    }
  }

  // Wedding-specific tracking methods
  trackRSVPSubmission(guestName: string, attendance: boolean, plusOnes: number): void {
    this.trackEvent('wedding', 'rsvp_submission', 'conversion', plusOnes, {
      guest_name: guestName,
      attendance,
      plus_ones: plusOnes,
    });
  }

  trackPhotoUpload(photoCount: number, totalSize: number): void {
    this.trackEvent('wedding', 'photo_upload', 'engagement', photoCount, {
      total_size: totalSize,
      average_size: Math.round(totalSize / photoCount),
    });
  }

  trackWishSubmission(wishLength: number, guestName: string): void {
    this.trackEvent('wedding', 'wish_submission', 'engagement', wishLength, {
      guest_name: guestName,
      wish_length: wishLength,
    });
  }

  trackSectionView(sectionName: string): void {
    this.trackEvent('engagement', 'section_view', 'content', undefined, {
      section_name: sectionName,
    });
  }

  trackSocialShare(platform: string, content: string): void {
    this.trackEvent('social', 'share', 'engagement', undefined, {
      platform,
      content,
    });
  }

  trackContactMethod(method: string, destination: string): void {
    this.trackEvent('contact', 'method_click', 'engagement', undefined, {
      method,
      destination,
    });
  }

  // Indonesian-specific tracking
  trackIndonesianOptimization(carrier: string, networkType: string, dataSaver: boolean): void {
    if (this.config.enableIndonesianOptimization) {
      this.trackEvent('optimization', 'indonesian_network', 'performance', undefined, {
        carrier,
        network_type: networkType,
        data_saver: dataSaver,
        timezone: this.userBehavior.locationInfo.timezone,
      });
    }
  }

  // Analytics data retrieval
  getUserBehaviorData(): UserBehaviorData {
    return { ...this.userBehavior };
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getEventQueue(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  clearEventQueue(): void {
    this.eventQueue = [];
  }
}

// Global analytics instance
let weddingAnalytics: WeddingAnalytics;

export function initWeddingAnalytics(config: WeddingAnalyticsConfig): WeddingAnalytics {
  if (!weddingAnalytics) {
    weddingAnalytics = new WeddingAnalytics(config);
    weddingAnalytics.initialize();
  }
  return weddingAnalytics;
}

export function getWeddingAnalytics(): WeddingAnalytics | null {
  return weddingAnalytics || null;
}

// Convenience functions for common tracking
export function trackRSVP(guestName: string, attendance: boolean, plusOnes: number): void {
  const analytics = getWeddingAnalytics();
  if (analytics) {
    analytics.trackRSVPSubmission(guestName, attendance, plusOnes);
  }
}

export function trackPhotoUpload(photoCount: number, totalSize: number): void {
  const analytics = getWeddingAnalytics();
  if (analytics) {
    analytics.trackPhotoUpload(photoCount, totalSize);
  }
}

export function trackWish(wishLength: number, guestName: string): void {
  const analytics = getWeddingAnalytics();
  if (analytics) {
    analytics.trackWishSubmission(wishLength, guestName);
  }
}

export function trackSectionView(sectionName: string): void {
  const analytics = getWeddingAnalytics();
  if (analytics) {
    analytics.trackSectionView(sectionName);
  }
}

export function trackSocialShare(platform: string, content: string): void {
  const analytics = getWeddingAnalytics();
  if (analytics) {
    analytics.trackSocialShare(platform, content);
  }
}