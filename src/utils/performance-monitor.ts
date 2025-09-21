/**
 * Performance Monitor for Core Web Vitals
 * Optimized for Indonesian mobile networks and devices
 */

import { getNetworkInfo, type NetworkInfo } from './network-utils';

export interface CoreWebVitals {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

export interface PerformanceMetrics extends CoreWebVitals {
  // Page Load Metrics
  domContentLoaded: number | null;
  loadComplete: number | null;

  // Network Metrics
  networkInfo: NetworkInfo | null;
  connectionType: string;
  effectiveType: string;

  // Device Metrics
  deviceMemory: number | null;
  hardwareConcurrency: number;

  // Indonesian-specific Metrics
  jakartaTimezone: boolean;
  peakHours: boolean;
  estimatedCost: number; // Data usage cost in Rupiah

  // User Experience Metrics
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  orientation: string;

  // Custom Wedding App Metrics
  rsvpLoadTime: number | null;
  galleryLoadTime: number | null;
  imageCompressionRatio: number | null;
  offlineQueueSize: number;

  // Session Information
  sessionId: string;
  timestamp: number;
  pageUrl: string;
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
}

// Indonesian mobile-optimized thresholds
const INDONESIAN_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 1500, needsImprovement: 2500 }, // Adjusted for 3G networks
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1000, needsImprovement: 1800 }, // Adjusted for mobile
  ttfb: { good: 600, needsImprovement: 1200 }, // Adjusted for Indonesian networks
  inp: { good: 200, needsImprovement: 500 },
};

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.init();
  }

  private generateSessionId(): string {
    return `wedding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async init(): Promise<void> {
    this.metrics = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      orientation: screen.orientation?.type || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      offlineQueueSize: 0,
    };

    // Get device memory if available
    if ('deviceMemory' in navigator) {
      this.metrics.deviceMemory = (navigator as any).deviceMemory;
    }

    // Get network information
    try {
      this.metrics.networkInfo = await getNetworkInfo();
      this.metrics.connectionType = this.metrics.networkInfo.effectiveType || 'unknown';
      this.metrics.effectiveType = this.metrics.networkInfo.effectiveType || 'unknown';
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to get network info:', error);
    }

    // Check if in Jakarta timezone and peak hours
    this.metrics.jakartaTimezone = this.isJakartaTimezone();
    this.metrics.peakHours = this.isPeakHours();

    this.startMonitoring();
  }

  private isJakartaTimezone(): boolean {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezone === 'Asia/Jakarta';
    } catch {
      return false;
    }
  }

  private isPeakHours(): boolean {
    const jakartaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    const hour = new Date(jakartaTime).getHours();

    // Peak hours: 7-9 AM and 6-8 PM Jakarta time
    return (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20);
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Core Web Vitals monitoring
    this.observeCoreWebVitals();

    // Navigation timing
    this.observeNavigationTiming();

    // Resource timing
    this.observeResourceTiming();

    // Long tasks
    this.observeLongTasks();

    // Custom wedding app metrics
    this.observeCustomMetrics();

    console.log('[PerformanceMonitor] Started monitoring for Indonesian mobile optimization');
  }

  private observeCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = Math.round(lastEntry.startTime);
          this.reportMetric('lcp', this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('[PerformanceMonitor] LCP observation failed:', error);
      }

      // First Input Delay (FID) and Interaction to Next Paint (INP)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.name === 'first-input') {
              this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
              this.reportMetric('fid', this.metrics.fid);
            }

            // INP (simplified approximation)
            if (entry.duration) {
              this.metrics.inp = Math.round(entry.duration);
              this.reportMetric('inp', this.metrics.inp);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input', 'event'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('[PerformanceMonitor] FID observation failed:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.metrics.cls = Math.round(clsValue * 10000) / 10000; // Round to 4 decimal places
          this.reportMetric('cls', this.metrics.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('[PerformanceMonitor] CLS observation failed:', error);
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = Math.round(entry.startTime);
              this.reportMetric('fcp', this.metrics.fcp);
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('[PerformanceMonitor] FCP observation failed:', error);
      }
    }
  }

  private observeNavigationTiming(): void {
    // Wait for page load to complete
    if (document.readyState === 'complete') {
      this.captureNavigationTiming();
    } else {
      window.addEventListener('load', () => {
        this.captureNavigationTiming();
      });
    }
  }

  private captureNavigationTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      this.metrics.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
      this.metrics.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart);
      this.metrics.loadComplete = Math.round(navigation.loadEventEnd - navigation.navigationStart);

      this.reportMetric('ttfb', this.metrics.ttfb);
      this.reportMetric('domContentLoaded', this.metrics.domContentLoaded);
      this.reportMetric('loadComplete', this.metrics.loadComplete);
    }
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('[PerformanceMonitor] Resource timing observation failed:', error);
      }
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    // Track image loading performance
    if (entry.initiatorType === 'img') {
      const loadTime = entry.responseEnd - entry.startTime;

      // Estimate data usage cost for Indonesian networks
      if (entry.transferSize && this.metrics.networkInfo?.carrier) {
        const costPerMB = this.getCarrierCostPerMB(this.metrics.networkInfo.carrier.name);
        const sizeMB = entry.transferSize / (1024 * 1024);
        const cost = sizeMB * costPerMB;

        this.metrics.estimatedCost = (this.metrics.estimatedCost || 0) + cost;
      }

      console.log(`[PerformanceMonitor] Image loaded: ${entry.name} in ${Math.round(loadTime)}ms`);
    }
  }

  private getCarrierCostPerMB(carrierName: string): number {
    // Simplified cost estimation (Rupiah per MB)
    const costs: Record<string, number> = {
      'Telkomsel': 50,
      'Indosat': 60,
      'XL Axiata': 70,
      'Tri': 55,
      'Smartfren': 80,
    };

    return costs[carrierName] || 65; // Default cost
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn(`[PerformanceMonitor] Long task detected: ${Math.round(entry.duration)}ms`);

            // Long tasks are particularly problematic on low-end Indonesian devices
            if (this.metrics.deviceMemory && this.metrics.deviceMemory <= 2) {
              console.warn('[PerformanceMonitor] Long task on low-memory device - consider optimization');
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('[PerformanceMonitor] Long task observation failed:', error);
      }
    }
  }

  private observeCustomMetrics(): void {
    // Monitor RSVP form performance
    this.monitorRSVPPerformance();

    // Monitor gallery performance
    this.monitorGalleryPerformance();

    // Monitor offline queue
    this.monitorOfflineQueue();
  }

  private monitorRSVPPerformance(): void {
    // Track RSVP form loading time
    const rsvpSection = document.querySelector('#rsvp');
    if (rsvpSection) {
      const startTime = performance.now();

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.metrics.rsvpLoadTime = Math.round(performance.now() - startTime);
            this.reportMetric('rsvpLoadTime', this.metrics.rsvpLoadTime);
            observer.disconnect();
          }
        });
      });

      observer.observe(rsvpSection);
    }
  }

  private monitorGalleryPerformance(): void {
    // Track gallery loading time
    const gallerySection = document.querySelector('#gallery');
    if (gallerySection) {
      const startTime = performance.now();

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.metrics.galleryLoadTime = Math.round(performance.now() - startTime);
            this.reportMetric('galleryLoadTime', this.metrics.galleryLoadTime);
            observer.disconnect();
          }
        });
      });

      observer.observe(gallerySection);
    }
  }

  private monitorOfflineQueue(): void {
    // Monitor offline queue size (would integrate with actual offline queue)
    try {
      // This would integrate with the actual offline queue implementation
      const checkQueueSize = async () => {
        try {
          // Placeholder for actual offline queue integration
          this.metrics.offlineQueueSize = 0;
        } catch (error) {
          console.warn('[PerformanceMonitor] Failed to check offline queue:', error);
        }
      };

      // Check queue size periodically
      setInterval(checkQueueSize, 30000); // Every 30 seconds
      checkQueueSize(); // Initial check
    } catch (error) {
      console.warn('[PerformanceMonitor] Offline queue monitoring failed:', error);
    }
  }

  private reportMetric(name: string, value: number | null): void {
    if (value === null) return;

    const threshold = INDONESIAN_THRESHOLDS[name as keyof PerformanceThresholds];

    if (threshold) {
      let status = 'good';
      if (value > threshold.needsImprovement) {
        status = 'poor';
      } else if (value > threshold.good) {
        status = 'needs-improvement';
      }

      console.log(`[PerformanceMonitor] ${name}: ${value}ms (${status})`);

      // Special handling for Indonesian mobile conditions
      if (status === 'poor' && this.metrics.effectiveType === '3g') {
        console.warn(`[PerformanceMonitor] Poor ${name} on 3G network - consider optimization for Indonesian mobile users`);
      }

      if (status === 'poor' && this.metrics.deviceMemory && this.metrics.deviceMemory <= 2) {
        console.warn(`[PerformanceMonitor] Poor ${name} on low-memory device - optimize for Indonesian budget phones`);
      }
    }

    // Send to analytics (would integrate with actual analytics service)
    this.sendToAnalytics(name, value);
  }

  private sendToAnalytics(metric: string, value: number): void {
    // Placeholder for analytics integration
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${metric}: ${value}`);
    }

    // In production, this would send to your analytics service
    // Example: Google Analytics, Cloudflare Analytics, etc.
  }

  // Public methods for getting metrics
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getCoreWebVitals(): CoreWebVitals {
    return {
      lcp: this.metrics.lcp || null,
      fid: this.metrics.fid || null,
      cls: this.metrics.cls || null,
      fcp: this.metrics.fcp || null,
      ttfb: this.metrics.ttfb || null,
      inp: this.metrics.inp || null,
    };
  }

  getPerformanceScore(): number {
    const vitals = this.getCoreWebVitals();
    let score = 0;
    let count = 0;

    Object.entries(vitals).forEach(([key, value]) => {
      if (value !== null) {
        const threshold = INDONESIAN_THRESHOLDS[key as keyof PerformanceThresholds];
        if (threshold) {
          if (value <= threshold.good) {
            score += 100;
          } else if (value <= threshold.needsImprovement) {
            score += 50;
          } else {
            score += 0;
          }
          count++;
        }
      }
    });

    return count > 0 ? Math.round(score / count) : 0;
  }

  // Method to track custom wedding app events
  trackCustomEvent(name: string, value: number, metadata?: Record<string, any>): void {
    console.log(`[PerformanceMonitor] Custom event: ${name} = ${value}`, metadata);

    // Store custom metrics
    (this.metrics as any)[name] = value;

    this.sendToAnalytics(name, value);
  }

  // Method to get Indonesian-specific recommendations
  getIndonesianOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const vitals = this.getCoreWebVitals();

    // LCP recommendations
    if (vitals.lcp && vitals.lcp > INDONESIAN_THRESHOLDS.lcp.needsImprovement) {
      recommendations.push('Optimize image loading for Indonesian 3G networks');
      recommendations.push('Enable aggressive image compression for mobile data plans');
    }

    // Network-specific recommendations
    if (this.metrics.effectiveType === '3g' || this.metrics.effectiveType === '2g') {
      recommendations.push('Enable data saver mode for slow connections');
      recommendations.push('Implement progressive image loading');
    }

    // Device-specific recommendations
    if (this.metrics.deviceMemory && this.metrics.deviceMemory <= 2) {
      recommendations.push('Reduce memory usage for budget Android devices');
      recommendations.push('Implement memory-efficient image handling');
    }

    // Peak hours recommendations
    if (this.metrics.peakHours) {
      recommendations.push('Cache static assets during Jakarta peak hours');
      recommendations.push('Reduce server requests during high traffic periods');
    }

    // Cost optimization
    if (this.metrics.estimatedCost && this.metrics.estimatedCost > 5000) { // 5000 Rupiah
      recommendations.push('Enable aggressive data compression to reduce costs');
      recommendations.push('Implement smart preloading based on data plan');
    }

    return recommendations;
  }

  // Cleanup method
  destroy(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('[PerformanceMonitor] Failed to disconnect observer:', error);
      }
    });

    this.observers = [];
    this.isMonitoring = false;

    console.log('[PerformanceMonitor] Monitoring stopped');
  }
}

// Global instance
let performanceMonitor: PerformanceMonitor;

export function initPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return performanceMonitor || null;
}

export function trackCustomEvent(name: string, value: number, metadata?: Record<string, any>): void {
  if (performanceMonitor) {
    performanceMonitor.trackCustomEvent(name, value, metadata);
  }
}

// Initialize monitoring when script loads
if (typeof window !== 'undefined') {
  // Wait for page to be interactive before starting monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => initPerformanceMonitor(), 100);
    });
  } else {
    setTimeout(() => initPerformanceMonitor(), 100);
  }
}