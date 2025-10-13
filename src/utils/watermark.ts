/**
 * Photo Watermarking Utility
 * Week 6 Implementation - Photo Watermarking with Wedding Branding
 */

export interface WatermarkOptions {
  text?: string;
  logo?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
  color: string;
  font?: string;
  style: 'text' | 'logo' | 'combined';
  padding: number;
  rotation?: number;
}

export interface WeddingWatermarkConfig {
  coupleNames: string;
  weddingDate: string;
  logoUrl?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export class WatermarkProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Apply watermark to an image
   */
  async applyWatermark(
    imageUrl: string,
    options: WatermarkOptions,
    weddingConfig?: WeddingWatermarkConfig
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          // Set canvas size to match image
          this.canvas.width = img.width;
          this.canvas.height = img.height;

          // Draw original image
          this.ctx.drawImage(img, 0, 0);

          // Apply watermark based on style
          switch (options.style) {
            case 'text':
              this.drawTextWatermark(options, weddingConfig);
              break;
            case 'logo':
              await this.drawLogoWatermark(imageUrl, options);
              break;
            case 'combined':
              this.drawTextWatermark(options, weddingConfig);
              await this.drawLogoWatermark(imageUrl, options);
              break;
          }

          // Convert to blob
          this.canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to create watermarked image')),
            'image/jpeg',
            0.95
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Draw text watermark
   */
  private drawTextWatermark(
    options: WatermarkOptions,
    weddingConfig?: WeddingWatermarkConfig
  ): void {
    const { position, opacity, size, color, font, padding, rotation = 0 } = options;
    
    // Set text properties
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px ${font || 'Arial'}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Get watermark text
    const text = this.getWatermarkText(options, weddingConfig);
    
    // Calculate position
    const { x, y } = this.calculateTextPosition(text, position, padding);
    
    // Apply rotation if specified
    if (rotation !== 0) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.fillText(text, 0, 0);
      this.ctx.restore();
    } else {
      this.ctx.fillText(text, x, y);
    }
    
    // Reset alpha
    this.ctx.globalAlpha = 1;
  }

  /**
   * Draw logo watermark
   */
  private async drawLogoWatermark(imageUrl: string, options: WatermarkOptions): Promise<void> {
    if (!options.logo) return;
    
    return new Promise((resolve, reject) => {
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      
      logo.onload = () => {
        try {
          const { position, opacity, size, padding, rotation = 0 } = options;
          
          // Calculate logo dimensions
          const logoSize = Math.min(this.canvas.width, this.canvas.height) * (size / 100);
          const aspectRatio = logo.width / logo.height;
          const logoWidth = logoSize;
          const logoHeight = logoSize / aspectRatio;
          
          // Calculate position
          const { x, y } = this.calculateLogoPosition(logoWidth, logoHeight, position, padding);
          
          // Apply watermark
          this.ctx.globalAlpha = opacity;
          
          if (rotation !== 0) {
            this.ctx.save();
            this.ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
            this.ctx.rotate((rotation * Math.PI) / 180);
            this.ctx.drawImage(logo, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
            this.ctx.restore();
          } else {
            this.ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          }
          
          // Reset alpha
          this.ctx.globalAlpha = 1;
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      logo.onerror = () => reject(new Error('Failed to load logo'));
      logo.src = options.logo!;
    });
  }

  /**
   * Get watermark text based on options and wedding config
   */
  private getWatermarkText(
    options: WatermarkOptions,
    weddingConfig?: WeddingWatermarkConfig
  ): string {
    if (options.text) {
      return options.text;
    }
    
    if (weddingConfig) {
      const { coupleNames, weddingDate } = weddingConfig;
      const date = new Date(weddingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `${coupleNames}\n${date}`;
    }
    
    return 'Wedding Photo';
  }

  /**
   * Calculate text position
   */
  private calculateTextPosition(
    text: string,
    position: string,
    padding: number
  ): { x: number; y: number } {
    const lines = text.split('\n');
    const lineHeight = this.ctx.font.split('px')[0] as unknown as number;
    const totalHeight = lines.length * lineHeight;
    
    let x = this.canvas.width / 2;
    let y = this.canvas.height / 2;
    
    switch (position) {
      case 'top-left':
        x = padding + this.ctx.measureText(lines[0]).width / 2;
        y = padding + totalHeight / 2;
        break;
      case 'top-right':
        x = this.canvas.width - padding - this.ctx.measureText(lines[0]).width / 2;
        y = padding + totalHeight / 2;
        break;
      case 'bottom-left':
        x = padding + this.ctx.measureText(lines[0]).width / 2;
        y = this.canvas.height - padding - totalHeight / 2;
        break;
      case 'bottom-right':
        x = this.canvas.width - padding - this.ctx.measureText(lines[0]).width / 2;
        y = this.canvas.height - padding - totalHeight / 2;
        break;
      case 'center':
        // Already set to center
        break;
    }
    
    return { x, y };
  }

  /**
   * Calculate logo position
   */
  private calculateLogoPosition(
    logoWidth: number,
    logoHeight: number,
    position: string,
    padding: number
  ): { x: number; y: number } {
    let x = (this.canvas.width - logoWidth) / 2;
    let y = (this.canvas.height - logoHeight) / 2;
    
    switch (position) {
      case 'top-left':
        x = padding;
        y = padding;
        break;
      case 'top-right':
        x = this.canvas.width - logoWidth - padding;
        y = padding;
        break;
      case 'bottom-left':
        x = padding;
        y = this.canvas.height - logoHeight - padding;
        break;
      case 'bottom-right':
        x = this.canvas.width - logoWidth - padding;
        y = this.canvas.height - logoHeight - padding;
        break;
      case 'center':
        // Already set to center
        break;
    }
    
    return { x, y };
  }

  /**
   * Create wedding-themed watermark
   */
  async createWeddingWatermark(
    imageUrl: string,
    weddingConfig: WeddingWatermarkConfig,
    customOptions?: Partial<WatermarkOptions>
  ): Promise<Blob> {
    const defaultOptions: WatermarkOptions = {
      text: undefined,
      logo: weddingConfig.logoUrl,
      position: 'bottom-right',
      opacity: 0.7,
      size: 3,
      color: weddingConfig.theme.primaryColor,
      font: weddingConfig.theme.fontFamily,
      style: weddingConfig.logoUrl ? 'combined' : 'text',
      padding: 20,
      rotation: -15
    };

    const options = { ...defaultOptions, ...customOptions };
    return this.applyWatermark(imageUrl, options, weddingConfig);
  }

  /**
   * Batch process multiple images with watermark
   */
  async batchWatermark(
    images: { url: string; filename: string }[],
    options: WatermarkOptions,
    weddingConfig?: WeddingWatermarkConfig,
    progressCallback?: (progress: number, currentFile: string) => void
  ): Promise<{ blob: Blob; filename: string }[]> {
    const results: { blob: Blob; filename: string }[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        progressCallback?.((i / images.length) * 100, image.filename);
        
        const blob = await this.applyWatermark(image.url, options, weddingConfig);
        results.push({ blob, filename: image.filename });
        
        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`[WatermarkProcessor] Failed to watermark ${image.filename}:`, error);
        throw new Error(`Failed to watermark ${image.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    progressCallback?.(100, 'completed');
    return results;
  }

  /**
   * Create preview of watermark without applying to image
   */
  createWatermarkPreview(
    options: WatermarkOptions,
    weddingConfig?: WeddingWatermarkConfig,
    width: number = 400,
    height: number = 300
  ): string {
    // Create temporary canvas for preview
    const previewCanvas = document.createElement('canvas');
    const previewCtx = previewCanvas.getContext('2d')!;
    
    previewCanvas.width = width;
    previewCanvas.height = height;
    
    // Draw background
    previewCtx.fillStyle = '#f0f0f0';
    previewCtx.fillRect(0, 0, width, height);
    
    // Draw grid pattern
    previewCtx.strokeStyle = '#e0e0e0';
    previewCtx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      previewCtx.beginPath();
      previewCtx.moveTo(i, 0);
      previewCtx.lineTo(i, height);
      previewCtx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      previewCtx.beginPath();
      previewCtx.moveTo(0, i);
      previewCtx.lineTo(width, i);
      previewCtx.stroke();
    }
    
    // Apply watermark styling
    const tempCtx = this.ctx;
    this.ctx = previewCtx;
    const tempCanvas = this.canvas;
    this.canvas = previewCanvas;
    
    try {
      this.drawTextWatermark(options, weddingConfig);
    } finally {
      // Restore original context
      this.ctx = tempCtx;
      this.canvas = tempCanvas;
    }
    
    return previewCanvas.toDataURL();
  }

  /**
   * Remove watermark (experimental - works best with simple watermarks)
   */
  async removeWatermark(imageUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          
          // Draw image
          this.ctx.drawImage(img, 0, 0);
          
          // Apply image processing to reduce watermark visibility
          const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
          const data = imageData.data;
          
          // Simple watermark reduction algorithm
          for (let i = 0; i < data.length; i += 4) {
            // Reduce contrast slightly to make watermarks less visible
            data[i] = data[i] * 0.95 + 128 * 0.05;     // Red
            data[i + 1] = data[i + 1] * 0.95 + 128 * 0.05; // Green
            data[i + 2] = data[i + 2] * 0.95 + 128 * 0.05; // Blue
            // Alpha channel unchanged
          }
          
          this.ctx.putImageData(imageData, 0, 0);
          
          this.canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to process image')),
            'image/jpeg',
            0.95
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }
}

// Global instance
let watermarkProcessor: WatermarkProcessor;

export function getWatermarkProcessor(): WatermarkProcessor {
  if (!watermarkProcessor) {
    watermarkProcessor = new WatermarkProcessor();
  }
  return watermarkProcessor;
}

// Convenience functions
export async function applyWatermark(
  imageUrl: string,
  options: WatermarkOptions,
  weddingConfig?: WeddingWatermarkConfig
): Promise<Blob> {
  const processor = getWatermarkProcessor();
  return processor.applyWatermark(imageUrl, options, weddingConfig);
}

export async function createWeddingWatermark(
  imageUrl: string,
  weddingConfig: WeddingWatermarkConfig,
  customOptions?: Partial<WatermarkOptions>
): Promise<Blob> {
  const processor = getWatermarkProcessor();
  return processor.createWeddingWatermark(imageUrl, weddingConfig, customOptions);
}

export async function batchWatermark(
  images: { url: string; filename: string }[],
  options: WatermarkOptions,
  weddingConfig?: WeddingWatermarkConfig,
  progressCallback?: (progress: number, currentFile: string) => void
): Promise<{ blob: Blob; filename: string }[]> {
  const processor = getWatermarkProcessor();
  return processor.batchWatermark(images, options, weddingConfig, progressCallback);
}

// Preset watermark configurations
export const WATERMARK_PRESETS = {
  elegant: {
    position: 'bottom-right' as const,
    opacity: 0.6,
    size: 2.5,
    color: '#8B7355',
    font: 'Georgia',
    style: 'text' as const,
    padding: 30,
    rotation: -10
  },
  modern: {
    position: 'center' as const,
    opacity: 0.3,
    size: 4,
    color: '#2C3E50',
    font: 'Helvetica',
    style: 'text' as const,
    padding: 0,
    rotation: 0
  },
  romantic: {
    position: 'bottom-left' as const,
    opacity: 0.7,
    size: 3,
    color: '#E91E63',
    font: 'Brush Script MT',
    style: 'text' as const,
    padding: 25,
    rotation: -5
  },
  traditional: {
    position: 'top-right' as const,
    opacity: 0.8,
    size: 2,
    color: '#8B4513',
    font: 'Times New Roman',
    style: 'text' as const,
    padding: 20,
    rotation: 0
  }
} as const;

export type WatermarkPreset = keyof typeof WATERMARK_PRESETS;