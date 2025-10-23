/**
 * Client-side device metadata collection utilities
 * Collects anonymous device information for upload analytics
 */

export interface DeviceMetadata {
  screen_resolution?: string;
  device_orientation?: string;
  connection_type?: string;
}

/**
 * Get screen resolution in format "widthxheight"
 */
export function getScreenResolution(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    return `${window.screen.width}x${window.screen.height}`;
  } catch (error) {
    console.warn('Failed to get screen resolution:', error);
    return undefined;
  }
}

/**
 * Get device orientation (portrait/landscape)
 */
export function getDeviceOrientation(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    // Check if orientation API is available
    if (window.screen.orientation) {
      return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
    }

    // Fallback to window dimensions
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  } catch (error) {
    console.warn('Failed to get device orientation:', error);
    return undefined;
  }
}

/**
 * Get connection type (4g, 3g, wifi, etc.)
 */
export function getConnectionType(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;

  try {
    // @ts-expect-error - NetworkInformation API not in standard types
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection && connection.effectiveType) {
      return connection.effectiveType;
    }

    return undefined;
  } catch (error) {
    console.warn('Failed to get connection type:', error);
    return undefined;
  }
}

/**
 * Extract camera model from photo EXIF data
 * Note: This requires the file to be read and EXIF data extracted
 */
export async function extractCameraModel(file: File): Promise<string | undefined> {
  try {
    // Read basic EXIF from file (simplified extraction)
    // For production, consider using a library like 'exif-js' or 'exifr'
    const arrayBuffer = await file.arrayBuffer();
    const view = new DataView(arrayBuffer);

    // Check for JPEG marker
    if (view.getUint16(0) !== 0xFFD8) {
      return undefined; // Not a JPEG
    }

    // This is a simplified version - full EXIF parsing would be more complex
    // For now, return undefined and implement full EXIF parsing if needed
    return undefined;
  } catch (error) {
    console.warn('Failed to extract camera model:', error);
    return undefined;
  }
}

/**
 * Collect all available device metadata
 */
export function collectDeviceMetadata(): DeviceMetadata {
  return {
    screen_resolution: getScreenResolution(),
    device_orientation: getDeviceOrientation(),
    connection_type: getConnectionType(),
  };
}

/**
 * Append device metadata to FormData for upload
 */
export function appendMetadataToFormData(formData: FormData, metadata?: DeviceMetadata): void {
  const data = metadata || collectDeviceMetadata();

  if (data.screen_resolution) {
    formData.append('screen_resolution', data.screen_resolution);
  }

  if (data.device_orientation) {
    formData.append('device_orientation', data.device_orientation);
  }

  if (data.connection_type) {
    formData.append('connection_type', data.connection_type);
  }
}

/**
 * Get device type based on screen width
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | undefined {
  if (typeof window === 'undefined') return undefined;

  const width = window.screen.width;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get browser name from user agent (client-side approximation)
 */
export function getBrowserName(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;

  const ua = navigator.userAgent;

  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';

  return 'Other';
}

/**
 * Get OS name from user agent (client-side approximation)
 */
export function getOSName(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;

  const ua = navigator.userAgent;

  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';

  return 'Other';
}
