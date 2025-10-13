/**
 * Mobile Optimization for Indonesian Networks
 * Adaptive loading, data saver mode, and touch optimizations
 */

import { getNetworkInfo, type NetworkInfo } from '../utils/network-utils';

export interface MobileOptimizationConfig {
  dataSaverMode: {
    enabled: boolean;
    imageQuality: number;
    videoQuality: 'low' | 'medium' | 'high';
    autoPlayVideos: boolean;
    preloadImages: boolean;
  };
  adaptiveLoading: {
    enabled: boolean;
    lazyLoadThreshold: number;
    progressiveLoading: boolean;
    placeholderQuality: number;
  };
  touchOptimization: {
    enabled: boolean;
    minTouchTargetSize: number;
    gestureSupport: boolean;
    hapticFeedback: boolean;
  };
  indonesianOptimization: {
    enabled: boolean;
    carrierOptimization: boolean;
    timezoneOptimization: boolean;
    culturalContext: boolean;
  };
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  touchSupport: boolean;
  deviceMemory: number;
  hardwareConcurrency: number;
  connectionType: string;
  effectiveType: string;
  screenResolution: string;
  pixelRatio: number;
  batteryLevel?: number;
}

export interface LoadingStrategy {
  priority: 'critical' | 'high' | 'normal' | 'low';
  lazy: boolean;
  progressive: boolean;
  quality: number;
  format: 'webp' | 'jpeg' | 'avif';
  dimensions: { width: number; height: number };
}

// Default mobile optimization configuration
export const defaultMobileConfig: MobileOptimizationConfig = {
  dataSaverMode: {
    enabled: true,
    imageQuality: 0.6,
    videoQuality: 'low',
    autoPlayVideos: false,
    preloadImages: false,
  },
  adaptiveLoading: {
    enabled: true,
    lazyLoadThreshold: 200,
    progressiveLoading: true,
    placeholderQuality: 0.1,
  },
  touchOptimization: {
    enabled: true,
    minTouchTargetSize: 44, // iOS HIG minimum
    gestureSupport: true,
    hapticFeedback: true,
  },
  indonesianOptimization: {
    enabled: true,
    carrierOptimization: true,
    timezoneOptimization: true,
    culturalContext: true,
  },
};

// Mobile optimization manager
export class MobileOptimizer {
  private config: MobileOptimizationConfig;
  private deviceCapabilities: DeviceCapabilities;
  private networkInfo: NetworkInfo | null = null;

  constructor(config: MobileOptimizationConfig = defaultMobileConfig) {
    this.config = config;
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.initializeNetworkMonitoring();
  }

  // Detect device capabilities
  private detectDeviceCapabilities(): DeviceCapabilities {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Get device memory if available
    const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Get screen information
    const screenResolution = `${screen.width}x${screen.height}`;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Get connection information
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.type || 'unknown';
    const effectiveType = connection?.effectiveType || '4g';

    return {
      isMobile,
      isTablet,
      touchSupport,
      deviceMemory,
      hardwareConcurrency,
      connectionType,
      effectiveType,
      screenResolution,
      pixelRatio,
    };
  }

  // Initialize network monitoring
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      this.networkInfo = await getNetworkInfo();
      
      // Listen for network changes
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.addEventListener('change', () => {
          this.updateNetworkInfo();
        });
      }
    } catch (error) {
      console.warn('[MobileOptimizer] Failed to initialize network monitoring:', error);
    }
  }

  // Update network information
  private async updateNetworkInfo(): Promise<void> {
    try {
      this.networkInfo = await getNetworkInfo();
      console.log('[MobileOptimizer] Network updated:', this.networkInfo);
    } catch (error) {
      console.warn('[MobileOptimizer] Failed to update network info:', error);
    }
  }

  // Get optimal loading strategy for content
  getLoadingStrategy(contentType: 'image' | 'video' | 'text' | 'component'): LoadingStrategy {
    const isDataSaver = this.shouldUseDataSaver();
    const isSlowNetwork = this.isSlowNetwork();
    const isLowEndDevice = this.isLowEndDevice();

    let priority: LoadingStrategy['priority'] = 'normal';
    let lazy = true;
    let progressive = true;
    let quality = 0.8;
    let format: LoadingStrategy['format'] = 'webp';
    let dimensions = { width: 1920, height: 1080 };

    // Adjust based on content type
    switch (contentType) {
      case 'image':
        if (isDataSaver || isSlowNetwork) {
          quality = this.config.dataSaverMode.imageQuality;
          dimensions = { width: 800, height: 600 };
        }
        
        if (isLowEndDevice) {
          quality *= 0.8;
          dimensions = { width: 600, height: 450 };
        }
        
        // Use WebP for better compression
        format = 'webp';
        break;

      case 'video':
        if (isDataSaver || isSlowNetwork) {
          quality = 0.4;
          dimensions = { width: 480, height: 360 };
        }
        
        if (!this.config.dataSaverMode.autoPlayVideos) {
          lazy = true;
        }
        break;

      case 'component':
        if (isSlowNetwork || isLowEndDevice) {
          lazy = true;
          priority = 'low';
        }
        break;
    }

    // Indonesian network optimizations
    if (this.config.indonesianOptimization.enabled && this.networkInfo?.carrier) {
      const carrierOptimizations = this.getIndonesianCarrierOptimizations();
      
      if (carrierOptimizations.reduceQuality) {
        quality *= 0.8;
      }
      
      if (carrierOptimizations.reduceDimensions) {
        dimensions.width *= 0.8;
        dimensions.height *= 0.8;
      }
    }

    return {
      priority,
      lazy,
      progressive,
      quality,
      format,
      dimensions,
    };
  }

  // Check if data saver mode should be used
  private shouldUseDataSaver(): boolean {
    if (!this.config.dataSaverMode.enabled) return false;

    // Check browser data saver
    const connection = (navigator as any).connection;
    if (connection?.saveData) return true;

    // Check network conditions
    if (this.networkInfo?.saveData) return true;
    if (this.networkInfo?.effectiveType === '2g' || this.networkInfo?.effectiveType === 'slow-2g') return true;
    if (this.networkInfo?.downlink && this.networkInfo.downlink < 1) return true;

    return false;
  }

  // Check if network is slow
  private isSlowNetwork(): boolean {
    if (!this.networkInfo) return false;

    return (
      this.networkInfo.effectiveType === '2g' ||
      this.networkInfo.effectiveType === 'slow-2g' ||
      (this.networkInfo.downlink !== undefined && this.networkInfo.downlink < 2)
    );
  }

  // Check if device is low-end
  private isLowEndDevice(): boolean {
    return (
      (this.deviceCapabilities.deviceMemory && this.deviceCapabilities.deviceMemory <= 2) ||
      this.deviceCapabilities.hardwareConcurrency <= 2 ||
      this.deviceCapabilities.pixelRatio <= 1
    );
  }

  // Get Indonesian carrier-specific optimizations
  private getIndonesianCarrierOptimizations(): {
    reduceQuality: boolean;
    reduceDimensions: boolean;
    increaseTimeout: boolean;
    useAggressiveCaching: boolean;
  } {
    if (!this.networkInfo?.carrier) {
      return {
        reduceQuality: false,
        reduceDimensions: false,
        increaseTimeout: false,
        useAggressiveCaching: false,
      };
    }

    const carrierName = this.networkInfo.carrier.name.toLowerCase();
    
    // Carrier-specific optimizations based on Indonesian network characteristics
    const optimizations = {
      reduceQuality: false,
      reduceDimensions: false,
      increaseTimeout: false,
      useAggressiveCaching: false,
    };

    switch (carrierName) {
      case 'smartfren':
        // Smartfren often has slower speeds in rural areas
        optimizations.reduceQuality = true;
        optimizations.reduceDimensions = true;
        optimizations.increaseTimeout = true;
        break;
        
      case 'tri':
        // Tri (3) budget carrier - optimize for cost
        optimizations.reduceQuality = true;
        optimizations.useAggressiveCaching = true;
        break;
        
      case 'indosat':
        // Indosat - moderate optimization
        optimizations.reduceQuality = this.networkInfo.effectiveType === '3g';
        break;
        
      case 'xl axiata':
        // XL - generally good but optimize during peak hours
        if (this.networkInfo.timeOfDay === 'peak') {
          optimizations.reduceQuality = true;
          optimizations.useAggressiveCaching = true;
        }
        break;
        
      case 'telkomsel':
        // Telkomsel - best network, minimal optimization needed
        optimizations.useAggressiveCaching = this.networkInfo.timeOfDay === 'peak';
        break;
    }

    return optimizations;
  }

  // Optimize image loading
  optimizeImageLoading(imgElement: HTMLImageElement, src: string): void {
    const strategy = this.getLoadingStrategy('image');
    
    // Set loading attribute
    if (strategy.lazy) {
      imgElement.loading = 'lazy';
    }

    // Create responsive image with multiple sources
    if (strategy.progressive) {
      this.createProgressiveImage(imgElement, src, strategy);
    } else {
      this.setOptimizedImageSrc(imgElement, src, strategy);
    }
  }

  // Create progressive image loading
  private createProgressiveImage(imgElement: HTMLImageElement, src: string, strategy: LoadingStrategy): void {
    // Create low-quality placeholder
    const placeholderSrc = this.generatePlaceholderUrl(src, strategy.dimensions, this.config.adaptiveLoading.placeholderQuality);
    
    // Load placeholder first
    imgElement.src = placeholderSrc;
    imgElement.style.filter = 'blur(5px)';
    imgElement.style.transition = 'filter 0.3s ease-out';

    // Load full image after placeholder
    const fullImage = new Image();
    fullImage.onload = () => {
      imgElement.src = src;
      imgElement.style.filter = 'none';
    };
    
    fullImage.src = this.generateOptimizedImageUrl(src, strategy);
  }

  // Set optimized image source
  private setOptimizedImageSrc(imgElement: HTMLImageElement, src: string, strategy: LoadingStrategy): void {
    const optimizedSrc = this.generateOptimizedImageUrl(src, strategy);
    imgElement.src = optimizedSrc;
    
    // Add srcset for responsive images
    if (strategy.dimensions.width > 400) {
      const srcset = this.generateSrcSet(src, strategy);
      imgElement.srcset = srcset;
      imgElement.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
  }

  // Generate optimized image URL
  private generateOptimizedImageUrl(src: string, strategy: LoadingStrategy): string {
    // In a real implementation, this would use an image optimization service
    // For now, we'll return the original URL with query parameters
    const params = new URLSearchParams({
      w: strategy.dimensions.width.toString(),
      h: strategy.dimensions.height.toString(),
      q: strategy.quality.toString(),
      f: strategy.format,
    });
    
    return `${src}?${params.toString()}`;
  }

  // Generate placeholder URL
  private generatePlaceholderUrl(src: string, dimensions: { width: number; height: number }, quality: number): string {
    const params = new URLSearchParams({
      w: Math.round(dimensions.width * 0.1).toString(),
      h: Math.round(dimensions.height * 0.1).toString(),
      q: quality.toString(),
      f: 'jpeg',
      blur: '10',
    });
    
    return `${src}?${params.toString()}`;
  }

  // Generate srcset for responsive images
  private generateSrcSet(src: string, strategy: LoadingStrategy): string {
    const sizes = [400, 800, 1200, 1600];
    const srcsetEntries = sizes.map(size => {
      const scaledDimensions = {
        width: Math.min(size, strategy.dimensions.width),
        height: Math.round((size / strategy.dimensions.width) * strategy.dimensions.height),
      };
      
      const optimizedUrl = this.generateOptimizedImageUrl(src, {
        ...strategy,
        dimensions: scaledDimensions,
      });
      
      return `${optimizedUrl} ${size}w`;
    });
    
    return srcsetEntries.join(', ');
  }

  // Optimize touch interactions
  optimizeTouchInteractions(element: HTMLElement): void {
    if (!this.config.touchOptimization.enabled || !this.deviceCapabilities.touchSupport) {
      return;
    }

    // Ensure minimum touch target size
    const computedStyle = window.getComputedStyle(element);
    const width = parseInt(computedStyle.width);
    const height = parseInt(computedStyle.height);
    
    if (width < this.config.touchOptimization.minTouchTargetSize || 
        height < this.config.touchOptimization.minTouchTargetSize) {
      const minSize = this.config.touchOptimization.minTouchTargetSize;
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }

    // Add touch feedback
    if (this.config.touchOptimization.hapticFeedback && 'vibrate' in navigator) {
      element.addEventListener('touchstart', () => {
        (navigator as any).vibrate(10); // Light vibration
      });
    }

    // Add gesture support if enabled
    if (this.config.touchOptimization.gestureSupport) {
      this.addGestureSupport(element);
    }
  }

  // Add gesture support
  private addGestureSupport(element: HTMLElement): void {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // Detect swipe gestures
      if (Math.abs(deltaX) > 50 && deltaTime < 300) {
        const direction = deltaX > 0 ? 'right' : 'left';
        element.dispatchEvent(new CustomEvent('swipe', { 
          detail: { direction, deltaX, deltaY, deltaTime } 
        }));
      }
      
      // Detect tap gestures
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
        element.dispatchEvent(new CustomEvent('tap', { 
          detail: { x: endX, y: endY } 
        }));
      }
    }, { passive: true });
  }

  // Get device capabilities
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  // Get network information
  getNetworkInfo(): NetworkInfo | null {
    return this.networkInfo;
  }

  // Check if optimizations are active
  isOptimizationActive(): boolean {
    return this.shouldUseDataSaver() || this.isSlowNetwork() || this.isLowEndDevice();
  }

  // Get optimization summary
  getOptimizationSummary(): {
    dataSaverActive: boolean;
    slowNetwork: boolean;
    lowEndDevice: boolean;
    indonesianOptimizations: boolean;
    carrierOptimizations: string[];
    recommendations: string[];
  } {
    const dataSaverActive = this.shouldUseDataSaver();
    const slowNetwork = this.isSlowNetwork();
    const lowEndDevice = this.isLowEndDevice();
    const indonesianOptimizations = this.config.indonesianOptimization.enabled;
    
    const carrierOptimizations = this.getIndonesianCarrierOptimizations();
    const activeCarrierOptimizations = Object.entries(carrierOptimizations)
      .filter(([_, active]) => active)
      .map(([optimization]) => optimization);

    const recommendations: string[] = [];
    
    if (dataSaverActive) {
      recommendations.push('Data saver mode is active - images and videos are optimized');
    }
    
    if (slowNetwork) {
      recommendations.push('Slow network detected - using aggressive optimization');
    }
    
    if (lowEndDevice) {
      recommendations.push('Low-end device detected - reduced quality and performance');
    }
    
    if (this.networkInfo?.carrier && indonesianOptimizations) {
      recommendations.push(`Indonesian carrier optimizations active for ${this.networkInfo.carrier.name}`);
    }

    return {
      dataSaverActive,
      slowNetwork,
      lowEndDevice,
      indonesianOptimizations,
      carrierOptimizations: activeCarrierOptimizations,
      recommendations,
    };
  }
}

// Global mobile optimizer instance
export const mobileOptimizer = new MobileOptimizer();

// Utility functions
export function optimizeForMobile(element: HTMLElement): void {
  mobileOptimizer.optimizeTouchInteractions(element);
}

export function optimizeImageForMobile(imgElement: HTMLImageElement, src: string): void {
  mobileOptimizer.optimizeImageLoading(imgElement, src);
}

export function getMobileLoadingStrategy(contentType: 'image' | 'video' | 'text' | 'component'): LoadingStrategy {
  return mobileOptimizer.getLoadingStrategy(contentType);
}

export function isMobileOptimized(): boolean {
  return mobileOptimizer.isOptimizationActive();
}