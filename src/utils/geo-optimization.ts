/**
 * Geographic Optimization for Jakarta and Indonesian Networks
 * CDN routing and location-based optimizations
 */

import { getNetworkInfo, detectIndonesianRegion, type NetworkInfo, type IndonesianRegion } from './network-utils';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface JakartaArea {
  name: string;
  code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  trafficLevel: 'low' | 'medium' | 'high' | 'severe';
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  cdnEndpoint: string;
  proximityTolerance: number; // km
}

export interface CDNConfiguration {
  primaryEndpoint: string;
  fallbackEndpoints: string[];
  region: string;
  latency: number;
  bandwidth: number;
  priority: number;
}

export interface OptimizationSettings {
  enableGeolocation: boolean;
  enableCDNRouting: boolean;
  enableTrafficOptimization: boolean;
  cacheDuration: number;
  retryAttempts: number;
  timeoutMs: number;
}

// Jakarta area definitions with network characteristics
const JAKARTA_AREAS: JakartaArea[] = [
  {
    name: 'Jakarta Pusat',
    code: 'JAKPUS',
    coordinates: { lat: -6.1834, lng: 106.8226 },
    trafficLevel: 'high',
    networkQuality: 'excellent',
    cdnEndpoint: 'https://cdn-jakarta-central.example.com',
    proximityTolerance: 5,
  },
  {
    name: 'Jakarta Selatan',
    code: 'JAKSEL',
    coordinates: { lat: -6.2615, lng: 106.8106 },
    trafficLevel: 'high',
    networkQuality: 'excellent',
    cdnEndpoint: 'https://cdn-jakarta-south.example.com',
    proximityTolerance: 8,
  },
  {
    name: 'Jakarta Utara',
    code: 'JAKUT',
    coordinates: { lat: -6.1185, lng: 106.9089 },
    trafficLevel: 'medium',
    networkQuality: 'good',
    cdnEndpoint: 'https://cdn-jakarta-north.example.com',
    proximityTolerance: 10,
  },
  {
    name: 'Jakarta Barat',
    code: 'JAKBAR',
    coordinates: { lat: -6.1753, lng: 106.7638 },
    trafficLevel: 'medium',
    networkQuality: 'good',
    cdnEndpoint: 'https://cdn-jakarta-west.example.com',
    proximityTolerance: 12,
  },
  {
    name: 'Jakarta Timur',
    code: 'JAKTIM',
    coordinates: { lat: -6.2250, lng: 106.9004 },
    trafficLevel: 'medium',
    networkQuality: 'good',
    cdnEndpoint: 'https://cdn-jakarta-east.example.com',
    proximityTolerance: 15,
  },
  {
    name: 'Tangerang',
    code: 'TANG',
    coordinates: { lat: -6.1783, lng: 106.6319 },
    trafficLevel: 'high',
    networkQuality: 'fair',
    cdnEndpoint: 'https://cdn-tangerang.example.com',
    proximityTolerance: 20,
  },
  {
    name: 'Bekasi',
    code: 'BEKASI',
    coordinates: { lat: -6.2349, lng: 106.9896 },
    trafficLevel: 'high',
    networkQuality: 'fair',
    cdnEndpoint: 'https://cdn-bekasi.example.com',
    proximityTolerance: 25,
  },
  {
    name: 'Depok',
    code: 'DEPOK',
    coordinates: { lat: -6.4058, lng: 106.8186 },
    trafficLevel: 'medium',
    networkQuality: 'good',
    cdnEndpoint: 'https://cdn-depok.example.com',
    proximityTolerance: 18,
  },
  {
    name: 'Bogor',
    code: 'BOGOR',
    coordinates: { lat: -6.5971, lng: 106.8060 },
    trafficLevel: 'low',
    networkQuality: 'fair',
    cdnEndpoint: 'https://cdn-bogor.example.com',
    proximityTolerance: 30,
  },
];

// Indonesian CDN configuration
const CDN_CONFIGURATIONS: Record<string, CDNConfiguration> = {
  jakarta: {
    primaryEndpoint: 'https://cdn-jakarta.cloudflare.com',
    fallbackEndpoints: [
      'https://cdn-singapore.cloudflare.com',
      'https://cdn-asia.cloudflare.com',
    ],
    region: 'Jakarta',
    latency: 20,
    bandwidth: 100,
    priority: 1,
  },
  singapore: {
    primaryEndpoint: 'https://cdn-singapore.cloudflare.com',
    fallbackEndpoints: [
      'https://cdn-jakarta.cloudflare.com',
      'https://cdn-hongkong.cloudflare.com',
    ],
    region: 'Singapore',
    latency: 45,
    bandwidth: 150,
    priority: 2,
  },
  surabaya: {
    primaryEndpoint: 'https://cdn-surabaya.example.com',
    fallbackEndpoints: [
      'https://cdn-jakarta.cloudflare.com',
      'https://cdn-singapore.cloudflare.com',
    ],
    region: 'Surabaya',
    latency: 35,
    bandwidth: 80,
    priority: 3,
  },
};

export class GeoOptimizer {
  private currentLocation: GeoLocation | null = null;
  private jakartaArea: JakartaArea | null = null;
  private region: IndonesianRegion | null = null;
  private networkInfo: NetworkInfo | null = null;
  private settings: OptimizationSettings;
  private cdnConfig: CDNConfiguration | null = null;

  constructor(settings: Partial<OptimizationSettings> = {}) {
    this.settings = {
      enableGeolocation: true,
      enableCDNRouting: true,
      enableTrafficOptimization: true,
      cacheDuration: 30 * 60 * 1000, // 30 minutes
      retryAttempts: 3,
      timeoutMs: 10000, // 10 seconds
      ...settings,
    };

    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Get network and region information
      this.networkInfo = await getNetworkInfo();
      this.region = detectIndonesianRegion();

      // Get geolocation if enabled
      if (this.settings.enableGeolocation) {
        await this.getCurrentLocation();
      }

      // Determine optimal CDN configuration
      if (this.settings.enableCDNRouting) {
        this.cdnConfig = this.selectOptimalCDN();
      }

      console.log('[GeoOptimizer] Initialized for Indonesian optimization:', {
        location: this.currentLocation ? 'detected' : 'not available',
        area: this.jakartaArea?.name || 'unknown',
        region: this.region?.name || 'unknown',
        cdn: this.cdnConfig?.region || 'default',
      });
    } catch (error) {
      console.warn('[GeoOptimizer] Initialization failed:', error);
    }
  }

  private async getCurrentLocation(): Promise<void> {
    if (!navigator.geolocation) {
      console.warn('[GeoOptimizer] Geolocation not supported');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // Save battery on mobile
            timeout: this.settings.timeoutMs,
            maximumAge: this.settings.cacheDuration,
          }
        );
      });

      this.currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
      };

      // Determine Jakarta area if within Jakarta metropolitan area
      this.jakartaArea = this.findNearestJakartaArea(this.currentLocation);

      console.log('[GeoOptimizer] Location detected:', {
        lat: this.currentLocation.latitude.toFixed(4),
        lng: this.currentLocation.longitude.toFixed(4),
        area: this.jakartaArea?.name || 'outside Jakarta',
      });
    } catch (error) {
      console.warn('[GeoOptimizer] Failed to get location:', error);
    }
  }

  private findNearestJakartaArea(location: GeoLocation): JakartaArea | null {
    let nearestArea: JakartaArea | null = null;
    let minDistance = Infinity;

    for (const area of JAKARTA_AREAS) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        area.coordinates.lat,
        area.coordinates.lng
      );

      if (distance <= area.proximityTolerance && distance < minDistance) {
        minDistance = distance;
        nearestArea = area;
      }
    }

    return nearestArea;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private selectOptimalCDN(): CDNConfiguration {
    // Priority order for Indonesian users
    if (this.jakartaArea || (this.region && this.region.name === 'Jakarta')) {
      return CDN_CONFIGURATIONS.jakarta;
    }

    if (this.region) {
      switch (this.region.name) {
        case 'Surabaya':
        case 'Semarang':
          return CDN_CONFIGURATIONS.surabaya;
        default:
          return CDN_CONFIGURATIONS.jakarta; // Default for other Indonesian cities
      }
    }

    // Fallback to Singapore for other regions
    return CDN_CONFIGURATIONS.singapore;
  }

  // Public methods

  getOptimalImageURL(baseUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'avif';
  } = {}): string {
    if (!this.cdnConfig) {
      return baseUrl;
    }

    // Build optimized URL with CDN
    const url = new URL(baseUrl, this.cdnConfig.primaryEndpoint);
    const params = new URLSearchParams();

    // Network-based optimization
    if (this.networkInfo) {
      if (this.networkInfo.saveData || this.networkInfo.effectiveType === '2g') {
        params.set('q', '40');
        params.set('w', '600');
        params.set('f', 'webp');
      } else if (this.networkInfo.effectiveType === '3g') {
        params.set('q', options.quality?.toString() || '60');
        params.set('w', options.width?.toString() || '800');
        params.set('f', options.format || 'webp');
      } else {
        params.set('q', options.quality?.toString() || '80');
        params.set('w', options.width?.toString() || '1200');
        params.set('f', options.format || 'webp');
      }
    }

    // Location-based optimization
    if (this.jakartaArea) {
      // Adjust quality based on network quality in the area
      switch (this.jakartaArea.networkQuality) {
        case 'poor':
          params.set('q', '30');
          break;
        case 'fair':
          params.set('q', '50');
          break;
        case 'good':
          params.set('q', '70');
          break;
        case 'excellent':
          // Keep high quality
          break;
      }

      // Traffic-based optimization
      if (this.jakartaArea.trafficLevel === 'severe' || this.jakartaArea.trafficLevel === 'high') {
        const currentQ = parseInt(params.get('q') || '80');
        params.set('q', Math.max(30, currentQ * 0.8).toString());
      }
    }

    if (options.height) {
      params.set('h', options.height.toString());
    }

    // Add geo-specific parameters
    if (this.jakartaArea) {
      params.set('area', this.jakartaArea.code);
    }

    if (this.region) {
      params.set('region', this.region.code);
    }

    return `${url.origin}${url.pathname}?${params.toString()}`;
  }

  getOptimalAPIEndpoint(service: string): string {
    if (!this.cdnConfig) {
      return `/api/${service}`;
    }

    // Route API calls through optimal CDN
    const baseEndpoint = this.cdnConfig.primaryEndpoint.replace('cdn-', 'api-');
    return `${baseEndpoint}/api/${service}`;
  }

  getCurrentTrafficLevel(): 'low' | 'medium' | 'high' | 'severe' {
    if (this.jakartaArea) {
      return this.jakartaArea.trafficLevel;
    }

    // Estimate based on time of day and region
    const hour = new Date().getHours();
    const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;

    if (isWeekday && ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))) {
      return 'high'; // Rush hours
    } else if (hour >= 10 && hour <= 16) {
      return 'medium'; // Work hours
    } else {
      return 'low'; // Off-peak
    }
  }

  getNetworkOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.jakartaArea) {
      switch (this.jakartaArea.trafficLevel) {
        case 'severe':
        case 'high':
          recommendations.push('Enable aggressive caching during peak traffic');
          recommendations.push('Use compressed image formats');
          recommendations.push('Defer non-critical resource loading');
          break;
        case 'medium':
          recommendations.push('Moderate compression for balanced performance');
          break;
        case 'low':
          recommendations.push('Optimal time for high-quality content delivery');
          break;
      }

      switch (this.jakartaArea.networkQuality) {
        case 'poor':
          recommendations.push('Enable data saver mode');
          recommendations.push('Use minimal image quality');
          break;
        case 'fair':
          recommendations.push('Use moderate compression');
          break;
        case 'good':
        case 'excellent':
          recommendations.push('Can deliver high-quality content');
          break;
      }
    }

    if (this.networkInfo) {
      if (this.networkInfo.saveData) {
        recommendations.push('User has data saver enabled - minimize data usage');
      }

      if (this.networkInfo.batteryLevel && this.networkInfo.batteryLevel < 20) {
        recommendations.push('Low battery - reduce CPU-intensive operations');
      }
    }

    return recommendations;
  }

  // Performance testing methods
  async testCDNLatency(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    for (const [region, config] of Object.entries(CDN_CONFIGURATIONS)) {
      try {
        const startTime = performance.now();

        // Simple ping test to CDN endpoint
        const response = await fetch(`${config.primaryEndpoint}/ping`, {
          method: 'HEAD',
          cache: 'no-cache',
        });

        if (response.ok) {
          results[region] = Math.round(performance.now() - startTime);
        } else {
          results[region] = Infinity;
        }
      } catch (error) {
        results[region] = Infinity;
        console.warn(`[GeoOptimizer] Failed to test CDN latency for ${region}:`, error);
      }
    }

    return results;
  }

  // Preload critical resources based on location
  preloadCriticalResources(): void {
    if (!this.jakartaArea || !this.settings.enableTrafficOptimization) {
      return;
    }

    // Preload wedding venue images if in Jakarta area
    const venuesToPreload = [
      '/images/venue-jakarta-central.webp',
      '/images/venue-jakarta-south.webp',
    ];

    venuesToPreload.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getOptimalImageURL(url, { width: 800, quality: 70 });
      document.head.appendChild(link);
    });

    console.log('[GeoOptimizer] Preloaded critical resources for Jakarta area');
  }

  // Update location and recalculate optimizations
  async updateLocation(): Promise<void> {
    if (this.settings.enableGeolocation) {
      await this.getCurrentLocation();

      if (this.settings.enableCDNRouting) {
        this.cdnConfig = this.selectOptimalCDN();
      }
    }
  }

  // Get current optimization status
  getOptimizationStatus(): {
    location: GeoLocation | null;
    area: JakartaArea | null;
    region: IndonesianRegion | null;
    cdn: CDNConfiguration | null;
    trafficLevel: string;
    recommendations: string[];
  } {
    return {
      location: this.currentLocation,
      area: this.jakartaArea,
      region: this.region,
      cdn: this.cdnConfig,
      trafficLevel: this.getCurrentTrafficLevel(),
      recommendations: this.getNetworkOptimizationRecommendations(),
    };
  }
}

// Global instance
let geoOptimizer: GeoOptimizer;

export function initGeoOptimizer(settings?: Partial<OptimizationSettings>): GeoOptimizer {
  if (!geoOptimizer) {
    geoOptimizer = new GeoOptimizer(settings);
  }
  return geoOptimizer;
}

export function getGeoOptimizer(): GeoOptimizer | null {
  return geoOptimizer || null;
}

// Utility functions
export function getOptimalImageURL(baseUrl: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'avif';
}): string {
  const optimizer = getGeoOptimizer();
  return optimizer ? optimizer.getOptimalImageURL(baseUrl, options) : baseUrl;
}

export function getOptimalAPIEndpoint(service: string): string {
  const optimizer = getGeoOptimizer();
  return optimizer ? optimizer.getOptimalAPIEndpoint(service) : `/api/${service}`;
}

export function getCurrentTrafficLevel(): 'low' | 'medium' | 'high' | 'severe' {
  const optimizer = getGeoOptimizer();
  return optimizer ? optimizer.getCurrentTrafficLevel() : 'medium';
}

// Initialize on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initGeoOptimizer();
  });
}