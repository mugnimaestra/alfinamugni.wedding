/**
 * EXIF Data Extraction Utility
 * Week 6 Implementation - Photo Metadata Extraction
 */

export interface EXIFData {
  // Basic image information
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  
  // Camera information
  make?: string;
  model?: string;
  software?: string;
  
  // Capture settings
  dateTime?: Date;
  dateTimeOriginal?: Date;
  dateTimeDigitized?: Date;
  
  // Technical specifications
  focalLength?: number;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  flash?: boolean;
  whiteBalance?: 'auto' | 'manual' | 'custom';
  
  // GPS information
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  gpsDirection?: number;
  
  // Device and software
  deviceType?: 'mobile' | 'dslr' | 'compact' | 'unknown';
  operatingSystem?: string;
  appVersion?: string;
  
  // Image properties
  orientation?: number;
  colorSpace?: string;
  compression?: string;
  quality?: number;
  
  // Custom wedding metadata
  weddingPhase?: 'preparation' | 'ceremony' | 'reception' | 'after-party';
  location?: string;
  photographer?: string;
  tags?: string[];
}

export interface EXIFExtractionOptions {
  includeGPS?: boolean;
  includeTechnical?: boolean;
  includeDevice?: boolean;
  generateWeddingMetadata?: boolean;
}

/**
 * Extract EXIF data from an image file
 */
export async function extractEXIFData(
  file: File, 
  options: EXIFExtractionOptions = {}
): Promise<EXIFData> {
  const {
    includeGPS = true,
    includeTechnical = true,
    includeDevice = true,
    generateWeddingMetadata = true
  } = options;

  const exifData: EXIFData = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type
  };

  try {
    // Extract basic image dimensions
    const dimensions = await getImageDimensions(file);
    exifData.width = dimensions.width;
    exifData.height = dimensions.height;

    // Extract EXIF data using various methods
    const exif = await extractEXIFFromFile(file);
    
    if (exif) {
      // Camera information
      if (typeof exif.Make === 'string') exifData.make = exif.Make;
      if (typeof exif.Model === 'string') exifData.model = exif.Model;
      if (typeof exif.Software === 'string') exifData.software = exif.Software;

      // Date and time information
      if (typeof exif.DateTime === 'string') exifData.dateTime = parseEXIFDate(exif.DateTime);
      if (typeof exif.DateTimeOriginal === 'string') exifData.dateTimeOriginal = parseEXIFDate(exif.DateTimeOriginal);
      if (typeof exif.DateTimeDigitized === 'string') exifData.dateTimeDigitized = parseEXIFDate(exif.DateTimeDigitized);

      // Technical specifications
      if (includeTechnical) {
        if (typeof exif.FocalLength === 'string') exifData.focalLength = parseFloat(exif.FocalLength);
        if (typeof exif.FNumber === 'string') exifData.fNumber = parseFloat(exif.FNumber);
        if (typeof exif.ExposureTime === 'string') exifData.exposureTime = parseFloat(exif.ExposureTime);
        if (typeof exif.ISOSpeedRatings === 'string') exifData.iso = parseInt(exif.ISOSpeedRatings);
        if (typeof exif.Flash === 'string') exifData.flash = exif.Flash !== '0';
        if (typeof exif.WhiteBalance === 'string') exifData.whiteBalance = parseWhiteBalance(exif.WhiteBalance);
      }

      // GPS information
      if (includeGPS && exif.GPSLatitude && exif.GPSLongitude) {
        exifData.gpsLatitude = parseGPSCoordinate(exif.GPSLatitude as number[] | string);
        exifData.gpsLongitude = parseGPSCoordinate(exif.GPSLongitude as number[] | string);
        if (typeof exif.GPSAltitude === 'string') exifData.gpsAltitude = parseFloat(exif.GPSAltitude);
        if (typeof exif.GPSImgDirection === 'string') exifData.gpsDirection = parseFloat(exif.GPSImgDirection);
      }

      // Image properties
      if (typeof exif.Orientation === 'string') exifData.orientation = parseInt(exif.Orientation);
      if (typeof exif.ColorSpace === 'string') exifData.colorSpace = exif.ColorSpace;
      if (typeof exif.Compression === 'string') exifData.compression = exif.Compression;
    }

    // Device information
    if (includeDevice) {
      exifData.deviceType = detectDeviceType(exifData.make, exifData.model);
      exifData.operatingSystem = detectOperatingSystem();
    }

    // Generate wedding-specific metadata
    if (generateWeddingMetadata) {
      const weddingMetadata = generateWeddingMetadataFromEXIF(exifData);
      Object.assign(exifData, weddingMetadata);
    }

  } catch (error) {
    console.warn('[EXIFExtractor] Failed to extract EXIF data:', error);
  }

  return exifData;
}

/**
 * Extract EXIF data from file using multiple methods
 */
async function extractEXIFFromFile(file: File): Promise<Record<string, unknown> | null> {
  // Method 1: Try using browser's native EXIF support (if available)
  if ('ExifReader' in window) {
    try {
      const ExifReader = (window as unknown as { ExifReader?: { load: (file: File) => Promise<Record<string, unknown>> } }).ExifReader;
      if (ExifReader) {
        const tags = await ExifReader.load(file);
        return tags;
      }
    } catch (error) {
      console.warn('[EXIFExtractor] ExifReader failed:', error);
    }
  }

  // Method 2: Try using piexifjs library (if loaded)
  if (typeof window !== 'undefined' && (window as unknown as { piexif?: { load: (buffer: ArrayBuffer) => Record<string, unknown> } }).piexif) {
    try {
      const piexif = (window as unknown as { piexif?: { load: (buffer: ArrayBuffer) => Record<string, unknown> } }).piexif;
      if (piexif) {
        const buffer = await file.arrayBuffer();
        const exif = piexif.load(buffer);
        return exif;
      }
    } catch (error) {
      console.warn('[EXIFExtractor] piexifjs failed:', error);
    }
  }

  // Method 3: Manual extraction from image metadata
  try {
    return await extractBasicImageMetadata(file);
  } catch (error) {
    console.warn('[EXIFExtractor] Manual extraction failed:', error);
  }

  return null;
}

/**
 * Extract basic image metadata without external libraries
 */
async function extractBasicImageMetadata(file: File): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const metadata: Record<string, unknown> = {
        width: img.width,
        height: img.height,
        // Try to extract some basic info from the image
        Make: 'Unknown',
        Model: 'Unknown',
        DateTime: new Date().toISOString()
      };

      // Try to get creation time from file
      if ('lastModified' in file) {
        metadata.DateTimeOriginal = new Date(file.lastModified).toISOString();
      }

      resolve(metadata);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Parse EXIF date string
 */
function parseEXIFDate(dateString: string): Date {
  // EXIF date format: "YYYY:MM:DD HH:MM:SS"
  const parts = dateString.split(' ');
  const datePart = parts[0]?.replace(/:/g, '-') || '';
  const timePart = parts[1] || '';
  const cleaned = `${datePart} ${timePart}`;
  return new Date(cleaned);
}

/**
 * Parse GPS coordinate from EXIF format
 */
function parseGPSCoordinate(coord: number[] | string): number {
  if (Array.isArray(coord)) {
    const [degrees, minutes, seconds] = coord;
    return degrees + (minutes / 60) + (seconds / 3600);
  }
  return parseFloat(coord);
}

/**
 * Parse white balance value
 */
function parseWhiteBalance(value: string): 'auto' | 'manual' | 'custom' {
  switch (value) {
    case '0': return 'auto';
    case '1': return 'manual';
    default: return 'custom';
  }
}

/**
 * Detect device type from camera information
 */
function detectDeviceType(make?: string, model?: string): 'mobile' | 'dslr' | 'compact' | 'unknown' {
  if (!make || !model) return 'unknown';

  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();

  // Mobile devices
  if (makeLower.includes('apple') || makeLower.includes('samsung') || 
      makeLower.includes('xiaomi') || makeLower.includes('oppo') ||
      makeLower.includes('vivo') || makeLower.includes('huawei')) {
    return 'mobile';
  }

  // DSLR cameras
  if (makeLower.includes('canon') || makeLower.includes('nikon') ||
      makeLower.includes('sony') || makeLower.includes('fujifilm') ||
      makeLower.includes('pentax')) {
    if (modelLower.includes('eos') || modelLower.includes('d') || 
        modelLower.includes('z') || modelLower.includes('α')) {
      return 'dslr';
    }
    return 'compact';
  }

  return 'unknown';
}

/**
 * Detect operating system from filename
 */
function detectOperatingSystem(): string {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  
  return 'Unknown';
}

/**
 * Generate wedding-specific metadata from EXIF data
 */
function generateWeddingMetadataFromEXIF(exifData: EXIFData): Partial<EXIFData> {
  const weddingMetadata: Partial<EXIFData> = {};

  // Determine wedding phase based on time
  if (exifData.dateTimeOriginal) {
    const hour = exifData.dateTimeOriginal.getHours();
    
    if (hour >= 6 && hour < 12) {
      weddingMetadata.weddingPhase = 'preparation';
    } else if (hour >= 12 && hour < 17) {
      weddingMetadata.weddingPhase = 'ceremony';
    } else if (hour >= 17 && hour < 22) {
      weddingMetadata.weddingPhase = 'reception';
    } else {
      weddingMetadata.weddingPhase = 'after-party';
    }
  }

  // Generate tags based on EXIF data
  const tags: string[] = [];

  if (exifData.deviceType === 'mobile') {
    tags.push('mobile', 'guest-photo');
  } else if (exifData.deviceType === 'dslr') {
    tags.push('professional', 'high-quality');
  }

  if (exifData.flash) {
    tags.push('flash', 'indoor');
  } else {
    tags.push('natural-light');
  }

  if (exifData.iso && exifData.iso > 1600) {
    tags.push('low-light');
  }

  if (exifData.focalLength && exifData.focalLength < 35) {
    tags.push('wide-angle');
  } else if (exifData.focalLength && exifData.focalLength > 85) {
    tags.push('telephoto', 'portrait');
  }

  if (exifData.gpsLatitude && exifData.gpsLongitude) {
    tags.push('geotagged');
  }

  weddingMetadata.tags = tags;

  // Estimate location from GPS (simplified)
  if (exifData.gpsLatitude && exifData.gpsLongitude) {
    weddingMetadata.location = estimateLocationFromGPS(
      exifData.gpsLatitude, 
      exifData.gpsLongitude
    );
  }

  return weddingMetadata;
}

/**
 * Estimate location from GPS coordinates (simplified for Indonesian context)
 */
function estimateLocationFromGPS(lat: number, lng: number): string {
  // Simplified location estimation for major Indonesian cities
  const locations = [
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456, radius: 0.5 },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521, radius: 0.5 },
    { name: 'Bandung', lat: -6.9175, lng: 107.6191, radius: 0.5 },
    { name: 'Medan', lat: 3.5952, lng: 98.6722, radius: 0.5 },
    { name: 'Semarang', lat: -6.9667, lng: 110.4167, radius: 0.5 },
    { name: 'Makassar', lat: -5.1477, lng: 119.4327, radius: 0.5 },
    { name: 'Denpasar', lat: -8.6705, lng: 115.2126, radius: 0.5 },
    { name: 'Palembang', lat: -2.9761, lng: 104.7754, radius: 0.5 }
  ];

  for (const location of locations) {
    const distance = calculateDistance(lat, lng, location.lat, location.lng);
    if (distance <= location.radius) {
      return location.name;
    }
  }

  return 'Unknown Location';
}

/**
 * Calculate distance between two GPS coordinates
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Format EXIF data for display
 */
export function formatEXIFDataForDisplay(exifData: EXIFData): Record<string, string> {
  const formatted: Record<string, string> = {};

  if (exifData.make && exifData.model) {
    formatted.Camera = `${exifData.make} ${exifData.model}`;
  }

  if (exifData.dateTimeOriginal) {
    formatted['Date Taken'] = exifData.dateTimeOriginal.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (exifData.width && exifData.height) {
    formatted.Resolution = `${exifData.width} × ${exifData.height}`;
  }

  if (exifData.focalLength) {
    formatted['Focal Length'] = `${exifData.focalLength}mm`;
  }

  if (exifData.fNumber) {
    formatted['Aperture'] = `f/${exifData.fNumber}`;
  }

  if (exifData.exposureTime) {
    formatted['Exposure'] = exifData.exposureTime < 1 
      ? `1/${Math.round(1 / exifData.exposureTime)}s`
      : `${exifData.exposureTime}s`;
  }

  if (exifData.iso) {
    formatted.ISO = `ISO ${exifData.iso}`;
  }

  if (exifData.deviceType) {
    formatted['Device Type'] = exifData.deviceType.charAt(0).toUpperCase() + exifData.deviceType.slice(1);
  }

  if (exifData.gpsLatitude && exifData.gpsLongitude) {
    formatted.Location = `${exifData.gpsLatitude.toFixed(6)}°, ${exifData.gpsLongitude.toFixed(6)}°`;
  }

  if (exifData.tags && exifData.tags.length > 0) {
    formatted.Tags = exifData.tags.join(', ');
  }

  return formatted;
}

/**
 * Validate EXIF data completeness
 */
export function validateEXIFData(exifData: EXIFData): {
  isValid: boolean;
  completeness: number;
  missingFields: string[];
} {
  const requiredFields = ['width', 'height', 'dateTimeOriginal'];
  const optionalFields = ['make', 'model', 'focalLength', 'fNumber', 'exposureTime', 'iso'];
  const allFields = [...requiredFields, ...optionalFields];
  
  const presentFields = allFields.filter(field => exifData[field as keyof EXIFData] !== undefined);
  const missingFields = requiredFields.filter(field => exifData[field as keyof EXIFData] === undefined);
  
  const completeness = (presentFields.length / allFields.length) * 100;
  const isValid = missingFields.length === 0;
  
  return {
    isValid,
    completeness,
    missingFields
  };
}

// Export types for external use