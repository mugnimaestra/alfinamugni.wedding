/**
 * Network utilities for Indonesian mobile optimization
 * Optimized for 26.1 Mbps average speed with variable quality
 */

export interface NetworkInfo {
  downlink?: number;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  rtt?: number;
  saveData?: boolean;
  carrier?: IndonesianCarrier;
  region?: IndonesianRegion;
  timeOfDay?: 'peak' | 'normal' | 'off-peak';
  batteryLevel?: number;
}

export interface IndonesianCarrier {
  name: string;
  code: string;
  avgSpeed: number;
  coverage: 'excellent' | 'good' | 'fair' | 'poor';
  networkType: '4g' | '3g' | '2g';
  isPostpaid: boolean;
}

export interface IndonesianRegion {
  name: string;
  code: string;
  timezone: string;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface CompressionSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'webp' | 'jpeg';
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id?: number;
    filename?: string;
    original_name?: string;
    file_size?: number;
    category?: string;
    approved?: boolean;
    upload_date?: string;
    preview_url?: string;
    signed_url?: string;
    expires_at?: string;
    content_type?: string;
    size?: number;
  };
}

// Indonesian carrier database
const INDONESIAN_CARRIERS: Record<string, IndonesianCarrier> = {
  telkomsel: {
    name: 'Telkomsel',
    code: 'TSEL',
    avgSpeed: 32.5,
    coverage: 'excellent',
    networkType: '4g',
    isPostpaid: true,
  },
  indosat: {
    name: 'Indosat Ooredoo Hutchison',
    code: 'ISAT',
    avgSpeed: 28.7,
    coverage: 'good',
    networkType: '4g',
    isPostpaid: true,
  },
  xl: {
    name: 'XL Axiata',
    code: 'XL',
    avgSpeed: 25.3,
    coverage: 'good',
    networkType: '4g',
    isPostpaid: true,
  },
  tri: {
    name: 'Tri (3)',
    code: '3',
    avgSpeed: 22.1,
    coverage: 'fair',
    networkType: '4g',
    isPostpaid: false,
  },
  smartfren: {
    name: 'Smartfren',
    code: 'SMART',
    avgSpeed: 18.9,
    coverage: 'fair',
    networkType: '4g',
    isPostpaid: false,
  },
  by_u: {
    name: 'by.U',
    code: 'BYU',
    avgSpeed: 25.1,
    coverage: 'good',
    networkType: '4g',
    isPostpaid: false,
  },
};

// Indonesian regions with network characteristics
const INDONESIAN_REGIONS: Record<string, IndonesianRegion> = {
  jakarta: {
    name: 'Jakarta',
    code: 'JKT',
    timezone: 'Asia/Jakarta',
    networkQuality: 'excellent',
  },
  surabaya: {
    name: 'Surabaya',
    code: 'SBY',
    timezone: 'Asia/Jakarta',
    networkQuality: 'excellent',
  },
  bandung: {
    name: 'Bandung',
    code: 'BDG',
    timezone: 'Asia/Jakarta',
    networkQuality: 'good',
  },
  medan: {
    name: 'Medan',
    code: 'MDN',
    timezone: 'Asia/Jakarta',
    networkQuality: 'good',
  },
  semarang: {
    name: 'Semarang',
    code: 'SMG',
    timezone: 'Asia/Jakarta',
    networkQuality: 'good',
  },
  palembang: {
    name: 'Palembang',
    code: 'PLB',
    timezone: 'Asia/Jakarta',
    networkQuality: 'fair',
  },
  makassar: {
    name: 'Makassar',
    code: 'MKS',
    timezone: 'Asia/Makassar',
    networkQuality: 'fair',
  },
  denpasar: {
    name: 'Denpasar',
    code: 'DPS',
    timezone: 'Asia/Makassar',
    networkQuality: 'good',
  },
};

/**
 * Detect Indonesian carrier based on network characteristics and heuristics
 */
export function detectIndonesianCarrier(downlink: number, rtt: number, userAgent?: string): IndonesianCarrier {
  // Advanced carrier detection using multiple signals
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '');

  // Check for carrier-specific indicators in user agent
  if (ua.includes('telkomsel') || ua.includes('tsel')) {
    return INDONESIAN_CARRIERS.telkomsel;
  }
  if (ua.includes('indosat') || ua.includes('ooredoo')) {
    return INDONESIAN_CARRIERS.indosat;
  }
  if (ua.includes('xl') && ua.includes('axiata')) {
    return INDONESIAN_CARRIERS.xl;
  }
  if (ua.includes('tri') || ua.includes('hutchison')) {
    return INDONESIAN_CARRIERS.tri;
  }
  if (ua.includes('smartfren')) {
    return INDONESIAN_CARRIERS.smartfren;
  }

  // Heuristic detection based on network performance
  if (downlink > 30 && rtt < 40) {
    return INDONESIAN_CARRIERS.telkomsel; // Best performing network
  } else if (downlink > 25 && rtt < 60) {
    return INDONESIAN_CARRIERS.indosat; // Good performance
  } else if (downlink > 20 && rtt < 80) {
    return INDONESIAN_CARRIERS.xl; // Decent performance
  } else if (downlink > 15 && rtt < 100) {
    return INDONESIAN_CARRIERS.tri; // Fair performance
  } else {
    return INDONESIAN_CARRIERS.smartfren; // Lower performance
  }
}

/**
 * Detect Indonesian region based on timezone and network characteristics
 */
export function detectIndonesianRegion(): IndonesianRegion {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone === 'Asia/Jakarta') {
      // Default to Jakarta for WIB timezone
      return INDONESIAN_REGIONS.jakarta;
    } else if (timezone === 'Asia/Makassar') {
      // WITA timezone - could be various eastern regions
      return INDONESIAN_REGIONS.makassar;
    } else if (timezone === 'Asia/Jayapura') {
      // WIT timezone - eastern Indonesia
      return {
        name: 'Papua',
        code: 'PUA',
        timezone: 'Asia/Jayapura',
        networkQuality: 'fair',
      };
    }
  } catch (error) {
    console.warn('Failed to detect timezone:', error);
  }

  // Default to Jakarta
  return INDONESIAN_REGIONS.jakarta;
}

/**
 * Determine time of day based on Indonesian context
 */
export function getIndonesianTimeOfDay(): 'peak' | 'normal' | 'off-peak' {
  const jakartaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  const hour = new Date(jakartaTime).getHours();

  // Peak hours: 7-9 AM (morning commute), 6-8 PM (evening commute)
  if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
    return 'peak';
  }

  // Off-peak hours: 11 PM - 5 AM
  if (hour >= 23 || hour <= 5) {
    return 'off-peak';
  }

  // Normal hours: rest of the day
  return 'normal';
}

// Define TypeScript interfaces for experimental browser APIs
export interface BatteryAPI extends Navigator {
  getBattery(): Promise<BatteryManager>;
}

export interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener: (type: string, listener: EventListener) => void;
}

export interface NetworkConnectionAPI extends Navigator {
  connection: NetworkConnectionInformation;
}

export interface NetworkConnectionInformation {
  downlink?: number;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  rtt?: number;
  saveData?: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
}

/**
 * Get battery level if available
 */
export function getBatteryLevel(): Promise<number | undefined> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      resolve(undefined);
      return;
    }

    (navigator as BatteryAPI).getBattery().then((battery: BatteryManager) => {
      resolve(battery.level * 100);
    }).catch(() => resolve(undefined));
  });
}

/**
 * Enhanced network information with Indonesian context
 */
export async function getNetworkInfo(): Promise<NetworkInfo> {
  const baseInfo = getBasicNetworkInfo();
  const carrier = detectIndonesianCarrier(baseInfo.downlink || 26.1, baseInfo.rtt || 50);
  const region = detectIndonesianRegion();
  const timeOfDay = getIndonesianTimeOfDay();
  const batteryLevel = await getBatteryLevel();

  return {
    ...baseInfo,
    carrier,
    region,
    timeOfDay,
    batteryLevel,
  };
}

/**
 * Synchronous version for immediate use when network info is not critical
 */
export function getNetworkInfoSync(): NetworkInfo {
  const baseInfo = getBasicNetworkInfo();
  const carrier = detectIndonesianCarrier(baseInfo.downlink || 26.1, baseInfo.rtt || 50);
  const region = detectIndonesianRegion();
  const timeOfDay = getIndonesianTimeOfDay();

  return {
    ...baseInfo,
    carrier,
    region,
    timeOfDay,
    batteryLevel: undefined,
  };
}

/**
 * Get basic network information using Navigator Connection API
 */
export function getBasicNetworkInfo(): Omit<NetworkInfo, 'carrier' | 'region' | 'timeOfDay' | 'batteryLevel'> {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {
      downlink: 26.1, // Indonesian average
      effectiveType: '4g',
      rtt: 50,
      saveData: false
    };
  }

  const connection = (navigator as NetworkConnectionAPI).connection;
  return {
    downlink: connection?.downlink || 26.1,
    effectiveType: connection?.effectiveType || '4g',
    rtt: connection?.rtt || 50,
    saveData: connection?.saveData || false
  };
}

/**
 * Get optimal compression settings based on network conditions
 */
export function getOptimalCompressionSettings(networkInfo: NetworkInfo): CompressionSettings {
  const { effectiveType, downlink = 26.1, saveData, carrier, timeOfDay } = networkInfo;

  // Adjust settings based on Indonesian carrier characteristics
  let qualityMultiplier = 1;
  if (carrier) {
    switch (carrier.coverage) {
      case 'poor':
        qualityMultiplier = 0.7;
        break;
      case 'fair':
        qualityMultiplier = 0.8;
        break;
      case 'good':
        qualityMultiplier = 0.9;
        break;
      case 'excellent':
        qualityMultiplier = 1;
        break;
    }
  }

  // Adjust for peak hours in Indonesia
  if (timeOfDay === 'peak') {
    qualityMultiplier *= 0.8; // Reduce quality during peak hours
  }

  // Indonesian mobile network optimization
  if (saveData || effectiveType === '2g' || effectiveType === 'slow-2g') {
    return {
      quality: 0.4 * qualityMultiplier,
      maxWidth: 800,
      maxHeight: 600,
      format: 'webp'
    };
  }

  if (effectiveType === '3g' || downlink < 10) {
    return {
      quality: 0.6 * qualityMultiplier,
      maxWidth: 1200,
      maxHeight: 900,
      format: 'webp'
    };
  }

  // 4G and higher quality networks
  return {
    quality: 0.8 * qualityMultiplier,
    maxWidth: 1920,
    maxHeight: 1440,
    format: 'webp'
  };
}

/**
 * Convert HEIC to JPEG/WebP using Canvas API
 */
export async function convertHeicToWebFormat(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const convertedFile = new File([blob], file.name.replace(/\.heic$/i, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(convertedFile);
        } else {
          reject(new Error('Failed to convert HEIC image'));
        }
      }, 'image/webp', 0.8);
    };

    img.onerror = () => reject(new Error('Failed to load HEIC image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress image using Canvas API with network-aware quality
 */
export async function compressImage(file: File, compressionSettings?: CompressionSettings): Promise<File> {
  const networkInfo = await getNetworkInfo();
  const settings = compressionSettings || getOptimalCompressionSettings(networkInfo);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > settings.maxWidth) {
        width = settings.maxWidth;
        height = width / aspectRatio;
      }

      if (height > settings.maxHeight) {
        height = settings.maxHeight;
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob],
            file.name.replace(/\.(jpg|jpeg|png|heic)$/i, `.${settings.format === 'webp' ? 'webp' : 'jpg'}`), {
            type: `image/${settings.format}`,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, `image/${settings.format}`, settings.quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Progressive upload with retry logic for Indonesian networks
 */
export async function uploadWithRetry(
  file: File,
  uploadFn: (file: File) => Promise<UploadResponse>,
  maxRetries: number = 3
): Promise<UploadResponse> {
  const networkInfo = await getNetworkInfo();
  let retries = 0;

  const attempt = async (): Promise<UploadResponse> => {
    try {
      return await uploadFn(file);
    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        // Return a proper error response instead of throwing
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed after maximum retries'
        };
      }

      // Exponential backoff with network-aware delays
      const baseDelay = networkInfo.effectiveType === '3g' ? 2000 : 1000;
      const delay = baseDelay * Math.pow(2, retries - 1);

      await new Promise(resolve => setTimeout(resolve, delay));
      return attempt();
    }
  };

  return attempt();
}

/**
 * Check if device is likely on mobile data (heuristic)
 */
export async function isLikelyMobileConnection(): Promise<boolean> {
  const networkInfo = await getNetworkInfo();

  // Heuristics for mobile connection
  return !!(
    networkInfo.saveData ||
    (networkInfo.effectiveType && ['2g', '3g'].includes(networkInfo.effectiveType)) ||
    (networkInfo.downlink && networkInfo.downlink < 15) ||
    (networkInfo.rtt && networkInfo.rtt > 100)
  );
}

/**
 * Get recommended chunk size for uploads based on network
 */
export async function getUploadChunkSize(): Promise<number> {
  const networkInfo = await getNetworkInfo();

  if (await isLikelyMobileConnection()) {
    return 64 * 1024; // 64KB chunks for mobile
  }

  if (networkInfo.effectiveType === '4g' && (networkInfo.downlink || 0) > 20) {
    return 512 * 1024; // 512KB chunks for good 4G
  }

  return 256 * 1024; // 256KB default
}

/**
 * Create network-aware image loading strategy
 */
export async function getImageLoadingStrategy(): Promise<{
  loading: 'lazy' | 'eager';
  quality: 'low' | 'high';
  format: string;
  sizes: string;
}> {
  const networkInfo = await getNetworkInfo();

  return {
    loading: (await isLikelyMobileConnection()) ? 'lazy' : 'eager',
    quality: networkInfo.saveData ? 'low' : 'high',
    format: 'webp',
    sizes: networkInfo.saveData ? '(max-width: 768px) 400px, 800px' : '(max-width: 768px) 600px, 1200px'
  };
}

