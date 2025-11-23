/**
 * Image Processing Utility for R2 Upload Workflow
 * Integrates with advanced compression for wedding photo uploads
 */

import { compressImageAdvanced, type CompressionResult } from './advanced-compression';
import { getNetworkInfo, type NetworkInfo } from './network-utils';

export interface ProcessedImage {
  id: string;
  originalFile: File;
  compressedBlob: Blob;
  thumbnailBlob: Blob;
  compressionResult: CompressionResult;
  metadata: ImageMetadata;
  uploadKey: string;
  thumbnailKey: string;
}

export interface ImageMetadata {
  filename: string;
  originalFilename: string;
  fileSize: number;
  compressedSize: number;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  uploadedAt: Date;
  deviceInfo: string;
  networkInfo: string;
}

export interface ProcessingOptions {
  maxFileSizeMB?: number;
  targetQuality?: number;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
  optimizeForMobile?: boolean;
  preserveOriginal?: boolean;
}

export class ImageProcessor {
  private readonly DEFAULT_OPTIONS: Required<ProcessingOptions> = {
    maxFileSizeMB: 10,
    targetQuality: 0.8,
    generateThumbnail: true,
    thumbnailSize: 300,
    optimizeForMobile: true,
    preserveOriginal: false,
  };

  async processImageForUpload(
    file: File,
    options: ProcessingOptions = {}
  ): Promise<ProcessedImage> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Validate file
    this.validateImageFile(file, opts.maxFileSizeMB);

    // Generate unique ID
    const imageId = this.generateImageId(file);

    // Get network and device info
    const networkInfo = await getNetworkInfo();
    const deviceInfo = this.getDeviceInfo();

    // Compress main image
    const { blob: compressedBlob, result: compressionResult } = await this.compressImage(
      file,
      networkInfo,
      opts
    );

    // Generate thumbnail if requested
    let thumbnailBlob: Blob;
    if (opts.generateThumbnail) {
      thumbnailBlob = await this.generateThumbnail(compressedBlob, opts.thumbnailSize);
    } else {
      thumbnailBlob = compressedBlob;
    }

    // Extract image dimensions
    const dimensions = await this.getImageDimensions(compressedBlob);

    // Create metadata
    const metadata: ImageMetadata = {
      filename: this.generateFilename(file, imageId),
      originalFilename: file.name,
      fileSize: file.size,
      compressedSize: compressedBlob.size,
      mimeType: compressedBlob.type,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.width / dimensions.height,
      uploadedAt: new Date(),
      deviceInfo,
      networkInfo: `${networkInfo.effectiveType} (${networkInfo.downlink}Mbps)`,
    };

    // Generate R2 upload keys
    const uploadKey = this.generateR2Key(metadata, 'main');
    const thumbnailKey = this.generateR2Key(metadata, 'thumbnail');

    console.log('[ImageProcessor] Image processed successfully:', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      compressedSize: (compressedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
      compressionRatio: compressionResult.compressionRatio.toFixed(2),
      dimensions: `${dimensions.width}x${dimensions.height}`,
      processingTime: compressionResult.totalProcessingTime.toFixed(0) + 'ms',
    });

    return {
      id: imageId,
      originalFile: file,
      compressedBlob,
      thumbnailBlob,
      compressionResult,
      metadata,
      uploadKey,
      thumbnailKey,
    };
  }

  async processBatchForUpload(
    files: File[],
    options: ProcessingOptions = {},
    progressCallback?: (progress: number, currentFile: string) => void
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        progressCallback?.((i / files.length) * 100, file.name);

        const processedImage = await this.processImageForUpload(file, opts);
        results.push(processedImage);

        // Add delay for mobile devices to prevent memory issues
        if (opts.optimizeForMobile && i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error(`[ImageProcessor] Failed to process ${file.name}:`, error);
        throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    progressCallback?.(100, 'completed');
    return results;
  }

  private validateImageFile(file: File, maxSizeMB: number): void {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${maxSizeMB}MB`);
    }

    // Check file name
    if (!file.name || file.name.length > 255) {
      throw new Error('Invalid filename');
    }
  }

  private async compressImage(
    file: File,
    networkInfo: NetworkInfo,
    options: Required<ProcessingOptions>
  ): Promise<{ blob: Blob; result: CompressionResult }> {
    // Determine target size based on network conditions
    let targetSizeKB: number | undefined;

    if (networkInfo.saveData || networkInfo.effectiveType === '2g') {
      targetSizeKB = 200; // Very aggressive compression for slow networks
    } else if (networkInfo.effectiveType === '3g') {
      targetSizeKB = 500; // Moderate compression for 3G
    } else if (options.optimizeForMobile) {
      targetSizeKB = 800; // Light compression for good mobile networks
    }

    // Use advanced compression
    return compressImageAdvanced(file, targetSizeKB, {
      memoryOptimized: options.optimizeForMobile,
      finalFormat: 'webp', // Prefer WebP for better compression
    });
  }

  private async generateThumbnail(imageBlob: Blob, size: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions maintaining aspect ratio
        const { width, height } = this.calculateThumbnailDimensions(img.width, img.height, size);

        canvas.width = width;
        canvas.height = height;

        // Draw and compress thumbnail
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Thumbnail generation failed')),
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(imageBlob);
    });
  }

  private calculateThumbnailDimensions(
    originalWidth: number,
    originalHeight: number,
    maxSize: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        width = maxSize;
        height = width / aspectRatio;
      } else {
        height = maxSize;
        width = height * aspectRatio;
      }
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  private async getImageDimensions(imageBlob: Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Failed to load image for dimensions'));
      img.src = URL.createObjectURL(imageBlob);
    });
  }

  private generateImageId(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const name = file.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${timestamp}-${random}-${name}`;
  }

  private generateFilename(file: File, imageId: string): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    return `${imageId}.${extension}`;
  }

  private generateR2Key(metadata: ImageMetadata, type: 'main' | 'thumbnail'): string {
    const date = metadata.uploadedAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const prefix = type === 'thumbnail' ? 'thumbnails' : 'photos';
    return `${prefix}/${date}/${metadata.filename}`;
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    if (isMobile) {
      if (/Android/i.test(ua)) return 'Android';
      if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
      return 'Mobile';
    }

    return 'Desktop';
  }

  // Utility method to estimate upload time
  estimateUploadTime(fileSize: number, networkInfo: NetworkInfo): number {
    const speedMbps = networkInfo.downlink || 1; // Default to 1 Mbps
    const speedBytesPerSec = (speedMbps * 1024 * 1024) / 8; // Convert to bytes per second
    return fileSize / speedBytesPerSec; // Return seconds
  }

  // Utility method to check if image should be processed
  shouldProcessImage(file: File): boolean {
    // Don't process very small images
    if (file.size < 50 * 1024) return false; // Less than 50KB

    // Don't process already compressed images
    if (file.size < 500 * 1024) return false; // Less than 500KB

    return true;
  }
}

// Global instance
let processor: ImageProcessor;

export function getImageProcessor(): ImageProcessor {
  if (!processor) {
    processor = new ImageProcessor();
  }
  return processor;
}

// Convenience functions
export async function processImageForUpload(
  file: File,
  options?: ProcessingOptions
): Promise<ProcessedImage> {
  const processor = getImageProcessor();
  return processor.processImageForUpload(file, options);
}

export async function processBatchForUpload(
  files: File[],
  options?: ProcessingOptions,
  progressCallback?: (progress: number, currentFile: string) => void
): Promise<ProcessedImage[]> {
  const processor = getImageProcessor();
  return processor.processBatchForUpload(files, options, progressCallback);
}

/**
 * Video Thumbnail Extractor
 * Extracts first frame from video files for thumbnail generation
 */
export class VideoThumbnailExtractor {
  /**
   * Extract thumbnail from video file at specified time
   * @param videoFile Video file to extract thumbnail from
   * @param timeInSeconds Time in video to capture (default: 1.5s)
   * @param thumbnailSize Maximum dimension for thumbnail (default: 800)
   * @param quality JPEG quality (default: 0.85)
   * @returns Promise resolving to thumbnail blob, or null if generation fails
   */
  static async extractThumbnail(
    videoFile: File,
    timeInSeconds: number = 1.5,
    thumbnailSize: number = 800,
    quality: number = 0.85
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('[VideoThumbnailExtractor] Failed to get canvas context');
        resolve(null);
        return;
      }

      // Set up video element properties
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous'; // Support for cross-origin videos (R2 public URLs, etc.)

      let objectUrl: string | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let isResolved = false;

      // Cleanup function to remove event listeners and free resources
      const cleanup = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('error', handleError);
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };

      // Safe resolution wrapper to prevent race conditions
      const resolveSafely = (value: Blob | null, errorMessage?: string) => {
        if (isResolved) return;
        isResolved = true;
        if (errorMessage) {
          console.error(`[VideoThumbnailExtractor] ${errorMessage}`, {
            fileName: videoFile.name,
            fileSize: videoFile.size,
            fileType: videoFile.type,
          });
        }
        cleanup();
        resolve(value);
      };

      const handleError = (event?: Event) => {
        const errorMessage = event
          ? `Video load error: ${video.error?.message || 'Unknown error'}`
          : 'Failed to load video file';
        resolveSafely(null, errorMessage);
      };

      const captureFrame = () => {
        try {
          // Validate video dimensions before canvas operations
          if (!video.videoWidth || !video.videoHeight) {
            resolveSafely(null, 'Video dimensions are invalid or not available');
            return;
          }

          // Calculate thumbnail dimensions maintaining aspect ratio
          const { width, height } = this.calculateThumbnailDimensions(
            video.videoWidth,
            video.videoHeight,
            thumbnailSize
          );

          canvas.width = width;
          canvas.height = height;

          // Draw video frame to canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(video, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolveSafely(blob);
              } else {
                resolveSafely(null, 'Failed to generate thumbnail blob from canvas');
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during frame capture';
          resolveSafely(null, `Frame capture error: ${errorMessage}`);
        }
      };

      const handleSeeked = () => {
        // Add a small delay to ensure frame is rendered on all devices (especially iOS)
        timeoutId = setTimeout(() => {
          captureFrame();
        }, 200);
      };

      const handleLoadedMetadata = () => {
        try {
          // Smart seek logic with safe duration handling
          let seekTime = timeInSeconds;
          const duration = Number.isFinite(video.duration) ? video.duration : 0;

          if (duration > 0) {
            // For short videos (< 3s), take the middle frame to avoid black start/end
            if (duration < 3.0) {
              seekTime = duration / 2;
            } else {
              // For longer videos, ensure we don't exceed duration
              seekTime = Math.min(timeInSeconds, duration - 0.5);
              // Ensure we're not too close to start if possible
              seekTime = Math.max(seekTime, 0.5);
            }
          }

          // Ensure seek time is within valid bounds
          const safeSeekTime = Math.min(duration || seekTime, Math.max(0, seekTime));
          video.currentTime = safeSeekTime;
        } catch (error) {
          // If seeking fails, try to capture current frame
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during seek';
          console.warn(`[VideoThumbnailExtractor] Seek failed, attempting to capture current frame: ${errorMessage}`);
          captureFrame();
        }
      };

      // Set up event listeners
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('error', handleError);

      // Start loading video
      try {
        objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;
        video.load();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error creating object URL';
        resolveSafely(null, `Failed to create object URL: ${errorMessage}`);
      }
    });
  }

  /**
   * Check if file is a video
   */
  static isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  /**
   * Calculate thumbnail dimensions maintaining aspect ratio
   */
  private static calculateThumbnailDimensions(
    originalWidth: number,
    originalHeight: number,
    maxSize: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        width = maxSize;
        height = Math.round(width / aspectRatio);
      } else {
        height = maxSize;
        width = Math.round(height * aspectRatio);
      }
    }

    return { width, height };
  }

  /**
   * Get video dimensions without extracting thumbnail
   */
  static async getVideoDimensions(videoFile: File): Promise<{ width: number; height: number; duration: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const dimensions = {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
        };
        URL.revokeObjectURL(video.src);
        resolve(dimensions);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(videoFile);
    });
  }
}

