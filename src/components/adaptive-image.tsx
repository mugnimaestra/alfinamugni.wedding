/**
 * Adaptive Image Component
 * Network-aware image loading optimized for Indonesian mobile users
 */

import { component$, useSignal, useVisibleTask$, useStore, $ } from '@builder.io/qwik';
import { getNetworkInfo, type NetworkInfo } from '../utils/network-utils';

export interface AdaptiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  class?: string;
  loading?: 'lazy' | 'eager';
  priority?: 'high' | 'medium' | 'low';
  fallbackSrc?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface ImageState {
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  currentSrc: string;
  networkOptimizedSrc: string;
  retryCount: number;
  loadTime: number;
}

export const AdaptiveImage = component$<AdaptiveImageProps>((props) => {
  const {
    src,
    alt,
    width,
    height,
    class: className = '',
    loading = 'lazy',
    fallbackSrc,
    placeholder,
    onLoad,
    onError,
  } = props;

  const imageRef = useSignal<HTMLImageElement>();
  const imageState = useStore<ImageState>({
    isLoaded: false,
    isLoading: false,
    hasError: false,
    currentSrc: src,
    networkOptimizedSrc: src,
    retryCount: 0,
    loadTime: 0,
  });

  const networkInfo = useStore<NetworkInfo>({
    downlink: 26.1,
    effectiveType: '4g',
    rtt: 50,
    saveData: false,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    // Get network information
    const info = await getNetworkInfo();
    Object.assign(networkInfo, info);

    // Generate network-optimized image URL
    imageState.networkOptimizedSrc = generateOptimizedUrl(src, networkInfo);

    // Set up intersection observer for lazy loading
    if (loading === 'lazy' && imageRef.value) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: getLoadingMargin(networkInfo),
          threshold: 0.1,
        }
      );

      observer.observe(imageRef.value);

      cleanup(() => {
        observer.disconnect();
      });
    } else {
      // Eager loading
      loadImage();
    }

    // Listen for network changes
    const handleNetworkChange = async () => {
      const updatedInfo = await getNetworkInfo();
      Object.assign(networkInfo, updatedInfo);

      // Reload image with new network conditions if needed
      if (shouldReloadForNetwork(networkInfo, updatedInfo)) {
        imageState.networkOptimizedSrc = generateOptimizedUrl(src, updatedInfo);
        if (imageState.isLoaded) {
          loadImage(); // Reload with better quality if network improved
        }
      }
    };

    window.addEventListener('online', handleNetworkChange);
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleNetworkChange);
    }

    cleanup(() => {
      window.removeEventListener('online', handleNetworkChange);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleNetworkChange);
      }
    });
  });

  const generateOptimizedUrl = (originalSrc: string, network: NetworkInfo): string => {
    // If it's already an optimized URL or external URL, return as-is
    if (originalSrc.includes('?') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    const params = new URLSearchParams();

    // Quality settings based on network
    if (network.saveData || network.effectiveType === '2g' || network.effectiveType === 'slow-2g') {
      params.set('q', '40');
      params.set('w', '800');
      params.set('f', 'webp');
    } else if (network.effectiveType === '3g' || (network.downlink && network.downlink < 10)) {
      params.set('q', '60');
      params.set('w', '1200');
      params.set('f', 'webp');
    } else {
      params.set('q', '80');
      params.set('w', '1920');
      params.set('f', 'webp');
    }

    // Indonesian carrier optimizations
    if (network.carrier) {
      switch (network.carrier.coverage) {
        case 'poor':
          params.set('q', '30');
          params.set('w', '600');
          break;
        case 'fair':
          params.set('q', '50');
          params.set('w', '800');
          break;
        case 'good':
          params.set('q', '70');
          params.set('w', '1200');
          break;
        case 'excellent':
          // Use high quality settings
          break;
      }
    }

    // Peak hours optimization
    if (network.timeOfDay === 'peak') {
      const currentQ = parseInt(params.get('q') || '80');
      params.set('q', Math.max(30, currentQ * 0.8).toString());
    }

    // Battery optimization
    if (network.batteryLevel && network.batteryLevel < 20) {
      params.set('q', '40');
      params.set('f', 'webp');
    }

    return `${originalSrc}?${params.toString()}`;
  };

  const getLoadingMargin = (network: NetworkInfo): string => {
    // Adjust loading margin based on network speed
    if (network.effectiveType === '2g' || network.effectiveType === 'slow-2g') {
      return '50px'; // Load very close to viewport
    } else if (network.effectiveType === '3g') {
      return '100px'; // Moderate preloading
    } else {
      return '200px'; // Aggressive preloading for fast networks
    }
  };

  const shouldReloadForNetwork = (oldNetwork: NetworkInfo, newNetwork: NetworkInfo): boolean => {
    // Reload if network significantly improved
    const oldType = oldNetwork.effectiveType || '4g';
    const newType = newNetwork.effectiveType || '4g';

    const typeOrder = { 'slow-2g': 1, '2g': 2, '3g': 3, '4g': 4 };
    const oldScore = typeOrder[oldType];
    const newScore = typeOrder[newType];

    return newScore > oldScore + 1; // Significant improvement
  };

  const loadImage = $(() => {
    if (imageState.isLoading) return;

    imageState.isLoading = true;
    imageState.hasError = false;
    const startTime = performance.now();

    const img = new Image();

    img.onload = () => {
      imageState.isLoaded = true;
      imageState.isLoading = false;
      imageState.loadTime = performance.now() - startTime;
      imageState.currentSrc = imageState.networkOptimizedSrc;

      // Update the actual image element
      if (imageRef.value) {
        imageRef.value.src = imageState.networkOptimizedSrc;
      }

      onLoad?.();

      console.log(`[AdaptiveImage] Loaded ${alt} in ${imageState.loadTime.toFixed(1)}ms`, {
        networkType: networkInfo.effectiveType,
        carrier: networkInfo.carrier?.name,
        quality: new URL(`http://example.com?${imageState.networkOptimizedSrc.split('?')[1] || ''}`).searchParams.get('q'),
      });
    };

    img.onerror = () => {
      imageState.isLoading = false;
      imageState.hasError = true;
      imageState.retryCount++;

      // Retry with fallback or original URL
      if (imageState.retryCount < 3) {
        setTimeout(() => {
          if (imageState.retryCount === 1 && fallbackSrc) {
            imageState.networkOptimizedSrc = fallbackSrc;
          } else {
            imageState.networkOptimizedSrc = src; // Use original URL
          }
          loadImage();
        }, 1000 * imageState.retryCount);
      } else {
        onError?.();
        console.warn(`[AdaptiveImage] Failed to load ${alt} after ${imageState.retryCount} retries`);
      }
    };

    img.src = imageState.networkOptimizedSrc;
  });

  const getPlaceholderSrc = (): string => {
    if (placeholder) return placeholder;

    // Generate a simple placeholder based on dimensions
    const w = width || 400;
    const h = height || 300;
    const bgColor = 'f5f5f5';
    const textColor = '999999';

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#${bgColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14"
              fill="#${textColor}" text-anchor="middle" dy=".3em">Loading...</text>
      </svg>
    `)}`;
  };

  return (
    <div
      class={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Placeholder or loading state */}
      {(!imageState.isLoaded || imageState.isLoading) && (
        <img
          src={getPlaceholderSrc()}
          alt=""
          width={width}
          height={height}
          class="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'blur(2px)',
            opacity: imageState.isLoading ? '0.6' : '1',
          }}
        />
      )}

      {/* Loading indicator */}
      {imageState.isLoading && (
        <div class="absolute inset-0 flex items-center justify-center bg-black/10">
          <div class="flex items-center gap-2 px-3 py-1 bg-white/90 rounded-full text-sm">
            <div class="w-3 h-3 border-2 border-wedding-accent border-t-transparent rounded-full animate-spin" />
            <span class="text-gray-600">
              {networkInfo.effectiveType?.toUpperCase()} • {networkInfo.carrier?.name || 'Loading'}
            </span>
          </div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imageRef}
        src={imageState.isLoaded ? imageState.currentSrc : 'data:,'}
        alt={alt}
        width={width}
        height={height}
        class={`
          w-full h-full object-cover transition-opacity duration-300
          ${imageState.isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        loading={loading}
        onLoad$={() => {
          imageState.isLoaded = true;
          imageState.isLoading = false;
        }}
        onError$={() => {
          if (imageState.retryCount === 0) {
            loadImage();
          }
        }}
      />

      {/* Error state */}
      {imageState.hasError && imageState.retryCount >= 3 && (
        <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div class="text-center text-gray-500">
            <div class="text-2xl mb-2">📷</div>
            <div class="text-sm">Gagal memuat gambar</div>
            <button
              onClick$={loadImage}
              class="mt-2 px-3 py-1 bg-wedding-accent text-white text-xs rounded hover:bg-wedding-brown transition-colors"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Network info overlay (development mode) */}
      {import.meta.env.DEV && imageState.isLoaded && (
        <div class="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          {networkInfo.effectiveType?.toUpperCase()} • {networkInfo.carrier?.name} • {imageState.loadTime.toFixed(0)}ms
        </div>
      )}

      {/* Indonesian cultural loading message */}
      {imageState.isLoading && networkInfo.effectiveType === '2g' && (
        <div class="absolute bottom-2 left-2 right-2 px-2 py-1 bg-wedding-cream/90 text-wedding-brown text-xs rounded text-center">
          💝 Sedang mengoptimalkan untuk jaringan Anda...
        </div>
      )}
    </div>
  );
});

export default AdaptiveImage;