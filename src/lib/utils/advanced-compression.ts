/**
 * Advanced Multi-Stage Compression Pipeline
 * Optimized for Indonesian mobile networks and device capabilities
 */

import { getNetworkInfo, type NetworkInfo } from './network-utils';

// Define TypeScript interfaces for experimental browser APIs
interface DeviceMemoryAPI extends Navigator {
  deviceMemory: number;
}

export interface CompressionStage {
  name: string;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'webp' | 'jpeg' | 'png';
  enabled: boolean;
}

export interface CompressionPipeline {
  stages: CompressionStage[];
  finalFormat: 'webp' | 'jpeg';
  fallbackFormat: 'jpeg';
  memoryOptimized: boolean;
  progressiveJpeg: boolean;
}

export interface CompressionResult {
  originalSize: number;
  finalSize: number;
  compressionRatio: number;
  format: string;
  stages: {
    stage: string;
    inputSize: number;
    outputSize: number;
    processingTime: number;
  }[];
  totalProcessingTime: number;
  memoryUsed: number;
  networkOptimized: boolean;
}

export interface DeviceCapabilities {
  maxMemory: number; // MB
  supportedFormats: string[];
  processingPower: 'low' | 'medium' | 'high';
  isLowEndDevice: boolean;
}

export class AdvancedImageCompressor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private deviceCapabilities: DeviceCapabilities;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.deviceCapabilities = this.detectDeviceCapabilities();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const navigator = window.navigator as DeviceMemoryAPI;

    // Estimate device memory (fallback for unsupported browsers)
    const deviceMemory = navigator.deviceMemory || this.estimateMemoryFromUserAgent();

    // Detect supported formats
    const supportedFormats = this.detectSupportedFormats();

    // Estimate processing power based on device characteristics
    const processingPower = this.estimateProcessingPower(deviceMemory);

    return {
      maxMemory: deviceMemory * 1024, // Convert to MB
      supportedFormats,
      processingPower,
      isLowEndDevice: deviceMemory <= 2 || processingPower === 'low',
    };
  }

  private estimateMemoryFromUserAgent(): number {
    const userAgent = navigator.userAgent.toLowerCase();

    // Indonesian popular devices memory estimation
    if (userAgent.includes('android')) {
      // Common Indonesian Android devices
      if (userAgent.includes('sm-a') || userAgent.includes('samsung')) {
        return userAgent.includes('a10') || userAgent.includes('a20') ? 2 : 4;
      }
      if (userAgent.includes('redmi') || userAgent.includes('xiaomi')) {
        return userAgent.includes('redmi 9') || userAgent.includes('redmi 8') ? 3 : 4;
      }
      if (userAgent.includes('oppo')) {
        return userAgent.includes('a3s') || userAgent.includes('a5s') ? 2 : 4;
      }
      if (userAgent.includes('vivo')) {
        return userAgent.includes('y1s') || userAgent.includes('y91') ? 2 : 3;
      }
      // Default for Android
      return 3;
    }

    // iOS devices generally have good memory
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 4;
    }

    // Default fallback
    return 2;
  }

  private detectSupportedFormats(): string[] {
    const formats = ['image/jpeg', 'image/png'];

    // Test WebP support
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;

    try {
      const webpData = webpCanvas.toDataURL('image/webp');
      if (webpData.indexOf('data:image/webp') === 0) {
        formats.push('image/webp');
      }
    } catch {
      // WebP not supported
    }

    // Test AVIF support (newer format)
    try {
      const avifData = webpCanvas.toDataURL('image/avif');
      if (avifData.indexOf('data:image/avif') === 0) {
        formats.push('image/avif');
      }
    } catch {
      // AVIF not supported
    }

    return formats;
  }

  private estimateProcessingPower(memoryGB: number): 'low' | 'medium' | 'high' {
    if (memoryGB <= 2) return 'low';
    if (memoryGB <= 4) return 'medium';
    return 'high';
  }

  async compressImage(
    file: File,
    targetSizeKB?: number,
    customPipeline?: Partial<CompressionPipeline>
  ): Promise<{ blob: Blob; result: CompressionResult }> {
    const startTime = performance.now();
    const originalSize = file.size;

    // Create compression pipeline based on network and device conditions
    const pipeline = await this.createOptimalPipeline(file, targetSizeKB, customPipeline);

    let currentBlob: Blob | File = file;
    const stageResults: CompressionResult['stages'] = [];
    let memoryUsed = 0;

    try {
      // Load image
      const imageUrl = URL.createObjectURL(file);
      const image = await this.loadImage(imageUrl);
      URL.revokeObjectURL(imageUrl);

      // Process through pipeline stages
      for (const stage of pipeline.stages) {
        if (!stage.enabled) continue;

        const stageStartTime = performance.now();
        const inputSize = currentBlob.size;

        // Memory management for low-end devices
        if (this.deviceCapabilities.isLowEndDevice) {
          await this.waitForMemory();
        }

        // Apply compression stage
        const stageBlob = await this.applyCompressionStage(
          image,
          stage,
          pipeline.memoryOptimized
        );

        const stageEndTime = performance.now();
        const processingTime = stageEndTime - stageStartTime;

        // Track memory usage estimate
        memoryUsed += this.estimateMemoryUsage(image.width, image.height);

        stageResults.push({
          stage: stage.name,
          inputSize,
          outputSize: stageBlob.size,
          processingTime,
        });

        currentBlob = stageBlob;

        // Break early if target size reached
        if (targetSizeKB && stageBlob.size <= targetSizeKB * 1024) {
          break;
        }
      }

      // Final format conversion if needed
      if (pipeline.finalFormat !== this.getBlobFormat(currentBlob)) {
        currentBlob = await this.convertFormat(
          image,
          pipeline.finalFormat,
          pipeline.stages[pipeline.stages.length - 1]?.quality || 0.8
        );
      }

      const totalProcessingTime = performance.now() - startTime;

      const result: CompressionResult = {
        originalSize,
        finalSize: currentBlob.size,
        compressionRatio: originalSize / currentBlob.size,
        format: pipeline.finalFormat,
        stages: stageResults,
        totalProcessingTime,
        memoryUsed,
        networkOptimized: this.isNetworkOptimized(pipeline),
      };

      console.log('[AdvancedCompression] Compression complete:', {
        originalSize: (originalSize / 1024).toFixed(1) + 'KB',
        finalSize: (currentBlob.size / 1024).toFixed(1) + 'KB',
        compressionRatio: result.compressionRatio.toFixed(2),
        processingTime: totalProcessingTime.toFixed(1) + 'ms',
        stages: stageResults.length,
      });

      return { blob: currentBlob, result };

    } catch (error) {
      console.error('[AdvancedCompression] Compression failed:', error);
      throw error;
    }
  }

  private async createOptimalPipeline(
    file: File,
    targetSizeKB?: number,
    customPipeline?: Partial<CompressionPipeline>
  ): Promise<CompressionPipeline> {
    const networkInfo = await getNetworkInfo();
    const isSlowNetwork = this.isSlowNetwork(networkInfo);
    const isLowEndDevice = this.deviceCapabilities.isLowEndDevice;

    // Base pipeline for Indonesian mobile optimization
    const basePipeline: CompressionPipeline = {
      stages: [
        {
          name: 'initial-resize',
          quality: 0.9,
          maxWidth: isLowEndDevice ? 1200 : 1920,
          maxHeight: isLowEndDevice ? 900 : 1440,
          format: 'jpeg',
          enabled: true,
        },
        {
          name: 'network-optimization',
          quality: isSlowNetwork ? 0.6 : 0.8,
          maxWidth: isSlowNetwork ? 800 : 1200,
          maxHeight: isSlowNetwork ? 600 : 900,
          format: this.deviceCapabilities.supportedFormats.includes('image/webp') ? 'webp' : 'jpeg',
          enabled: true,
        },
        {
          name: 'final-compression',
          quality: this.getFinalQuality(networkInfo, targetSizeKB),
          maxWidth: this.getFinalMaxWidth(networkInfo),
          maxHeight: this.getFinalMaxHeight(networkInfo),
          format: this.getOptimalFormat(),
          enabled: targetSizeKB ? true : false,
        },
      ],
      finalFormat: this.getOptimalFormat(),
      fallbackFormat: 'jpeg',
      memoryOptimized: isLowEndDevice,
      progressiveJpeg: !isSlowNetwork,
    };

    return { ...basePipeline, ...customPipeline };
  }

  private async applyCompressionStage(
    image: HTMLImageElement,
    stage: CompressionStage,
    memoryOptimized: boolean
  ): Promise<Blob> {
    // Calculate optimal dimensions
    const { width, height } = this.calculateOptimalDimensions(
      image.width,
      image.height,
      stage.maxWidth,
      stage.maxHeight
    );

    // Set canvas size
    this.canvas.width = width;
    this.canvas.height = height;

    // Memory optimization for low-end devices
    if (memoryOptimized) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'low';
    } else {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    // Clear canvas and draw image
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(image, 0, 0, width, height);

    // Convert to blob with specified format and quality
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        `image/${stage.format}`,
        stage.quality
      );
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too large
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Ensure dimensions are even numbers for better compression
    width = Math.round(width / 2) * 2;
    height = Math.round(height / 2) * 2;

    return { width, height };
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    });
  }

  private async convertFormat(
    image: HTMLImageElement,
    format: 'webp' | 'jpeg',
    quality: number
  ): Promise<Blob> {
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.drawImage(image, 0, 0);

    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Format conversion failed')),
        `image/${format}`,
        quality
      );
    });
  }

  private isSlowNetwork(networkInfo: NetworkInfo): boolean {
    return !!(
      networkInfo.saveData ||
      networkInfo.effectiveType === '2g' ||
      networkInfo.effectiveType === 'slow-2g' ||
      (networkInfo.downlink && networkInfo.downlink < 5)
    );
  }

  private getFinalQuality(networkInfo: NetworkInfo, targetSizeKB?: number): number {
    if (targetSizeKB && targetSizeKB < 100) return 0.4;
    if (this.isSlowNetwork(networkInfo)) return 0.5;
    if (networkInfo.effectiveType === '3g') return 0.7;
    return 0.8;
  }

  private getFinalMaxWidth(networkInfo: NetworkInfo): number {
    if (this.isSlowNetwork(networkInfo)) return 600;
    if (networkInfo.effectiveType === '3g') return 800;
    return 1200;
  }

  private getFinalMaxHeight(networkInfo: NetworkInfo): number {
    if (this.isSlowNetwork(networkInfo)) return 450;
    if (networkInfo.effectiveType === '3g') return 600;
    return 900;
  }

  private getOptimalFormat(): 'webp' | 'jpeg' {
    return this.deviceCapabilities.supportedFormats.includes('image/webp') ? 'webp' : 'jpeg';
  }

  private getBlobFormat(blob: Blob): string {
    return blob.type.split('/')[1] as 'webp' | 'jpeg' | 'png';
  }

  private isNetworkOptimized(pipeline: CompressionPipeline): boolean {
    return pipeline.stages.some(stage => stage.name === 'network-optimization');
  }

  private estimateMemoryUsage(width: number, height: number): number {
    // Estimate memory usage in MB (4 bytes per pixel for RGBA)
    return (width * height * 4) / (1024 * 1024);
  }

  private async waitForMemory(): Promise<void> {
    // Simple memory pressure relief for low-end devices
    return new Promise(resolve => {
      if (this.deviceCapabilities.isLowEndDevice) {
        setTimeout(resolve, 50); // Small delay to allow GC
      } else {
        resolve();
      }
    });
  }

  // Utility method for batch compression
  async compressBatch(
    files: File[],
    targetSizeKB?: number,
    progressCallback?: (progress: number, currentFile: string) => void
  ): Promise<{ blob: Blob; result: CompressionResult; originalName: string }[]> {
    const results: { blob: Blob; result: CompressionResult; originalName: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        progressCallback?.(i / files.length * 100, file.name);

        const { blob, result } = await this.compressImage(file, targetSizeKB);

        results.push({
          blob,
          result,
          originalName: file.name,
        });

        // Memory management between files
        if (this.deviceCapabilities.isLowEndDevice && i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`[AdvancedCompression] Failed to compress ${file.name}:`, error);
        // Continue with next file
      }
    }

    progressCallback?.(100, 'completed');
    return results;
  }
}

// Global instance
let compressor: AdvancedImageCompressor;

export function getImageCompressor(): AdvancedImageCompressor {
  if (!compressor) {
    compressor = new AdvancedImageCompressor();
  }
  return compressor;
}

export async function compressImageAdvanced(
  file: File,
  targetSizeKB?: number,
  customPipeline?: Partial<CompressionPipeline>
): Promise<{ blob: Blob; result: CompressionResult }> {
  const compressor = getImageCompressor();
  return compressor.compressImage(file, targetSizeKB, customPipeline);
}

export async function compressImageBatch(
  files: File[],
  targetSizeKB?: number,
  progressCallback?: (progress: number, currentFile: string) => void
): Promise<{ blob: Blob; result: CompressionResult; originalName: string }[]> {
  const compressor = getImageCompressor();
  return compressor.compressBatch(files, targetSizeKB, progressCallback);
}

