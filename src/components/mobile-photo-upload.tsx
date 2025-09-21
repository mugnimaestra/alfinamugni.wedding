/**
 * Mobile Photo Upload Component
 * Touch-optimized photo upload with Indonesian mobile device optimization
 */

import { component$, useSignal, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { compressImage, convertHeicToWebFormat, getNetworkInfo } from '../utils/network-utils';

interface UploadState {
  isUploading: boolean;
  progress: number;
  totalFiles: number;
  completedFiles: number;
  error: string | null;
  networkType: string;
  compressionLevel: string;
}

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  compressed?: File;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'error';
  error?: string;
  compressionRatio?: number;
  originalSize: number;
  compressedSize?: number;
}

export interface MobilePhotoUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  showNetworkInfo?: boolean;
}

export const MobilePhotoUpload = component$<MobilePhotoUploadProps>((props) => {
  const {
    onUpload,
    maxFiles = 10,
    maxFileSize = 10,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    showNetworkInfo = true,
  } = props;

  const uploadState = useStore<UploadState>({
    isUploading: false,
    progress: 0,
    totalFiles: 0,
    completedFiles: 0,
    error: null,
    networkType: '4g',
    compressionLevel: 'medium',
  });

  const photos = useStore<PhotoFile[]>([]);
  const isDragging = useSignal(false);
  const fileInputRef = useSignal<HTMLInputElement>();
  const supportsCamera = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Check camera support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      supportsCamera.value = true;
    }

    // Update network info
    const networkInfo = getNetworkInfo();
    uploadState.networkType = networkInfo.effectiveType || '4g';
    uploadState.compressionLevel = getCompressionLevel(networkInfo.effectiveType || '4g');
  });

  const getCompressionLevel = (networkType: string): string => {
    switch (networkType) {
      case 'slow-2g':
      case '2g':
        return 'high';
      case '3g':
        return 'medium';
      case '4g':
      default:
        return 'low';
    }
  };

  const generateId = () => {
    return `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = $(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (photos.length + fileArray.length > maxFiles) {
      uploadState.error = `Maksimal ${maxFiles} foto yang dapat diunggah`;
      return;
    }

    uploadState.error = null;

    for (const file of fileArray) {
      // Validate file
      if (!acceptedFormats.includes(file.type) && !file.name.toLowerCase().match(/\.(heic|heif)$/)) {
        uploadState.error = `Format file ${file.name} tidak didukung`;
        continue;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        uploadState.error = `File ${file.name} terlalu besar (max ${maxFileSize}MB)`;
        continue;
      }

      try {
        const preview = await createPreview(file);
        const photoFile: PhotoFile = {
          id: generateId(),
          file,
          preview,
          status: 'pending',
          originalSize: file.size,
        };

        photos.push(photoFile);

        // Start compression immediately
        compressPhoto(photoFile);
      } catch (error) {
        console.error('Error processing file:', error);
        uploadState.error = `Gagal memproses file ${file.name}`;
      }
    }
  });

  const compressPhoto = $(async (photoFile: PhotoFile) => {
    photoFile.status = 'compressing';

    try {
      let fileToCompress = photoFile.file;

      // Convert HEIC to WebP if necessary
      if (photoFile.file.name.toLowerCase().match(/\.(heic|heif)$/)) {
        try {
          fileToCompress = await convertHeicToWebFormat(photoFile.file);
        } catch (error) {
          console.warn('HEIC conversion failed, using original:', error);
        }
      }

      // Compress based on network conditions
      const compressed = await compressImage(fileToCompress);

      photoFile.compressed = compressed;
      photoFile.compressedSize = compressed.size;
      photoFile.compressionRatio = photoFile.originalSize / compressed.size;
      photoFile.status = 'pending';

      console.log(`[MobilePhotoUpload] Compressed ${photoFile.file.name}:`, {
        original: (photoFile.originalSize / 1024).toFixed(1) + 'KB',
        compressed: (compressed.size / 1024).toFixed(1) + 'KB',
        ratio: photoFile.compressionRatio?.toFixed(2),
      });
    } catch (error) {
      console.error('Compression failed:', error);
      photoFile.status = 'error';
      photoFile.error = 'Gagal mengkompresi foto';
    }
  });

  const handleFileSelect = $(async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await processFiles(input.files);
    }
  });

  const handleDrop = $(async (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;

    if (event.dataTransfer?.files) {
      await processFiles(event.dataTransfer.files);
    }
  });

  const handleDragOver = $((event: DragEvent) => {
    event.preventDefault();
    isDragging.value = true;
  });

  const handleDragLeave = $(() => {
    isDragging.value = false;
  });

  const captureFromCamera = $(async () => {
    if (!supportsCamera.value) {
      uploadState.error = 'Kamera tidak tersedia di perangkat ini';
      return;
    }

    try {
      // For mobile, use file input with camera capture
      if (fileInputRef.value) {
        fileInputRef.value.setAttribute('capture', 'camera');
        fileInputRef.value.click();
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      uploadState.error = 'Gagal mengakses kamera';
    }
  });

  const removePhoto = $((photoId: string) => {
    const index = photos.findIndex(p => p.id === photoId);
    if (index !== -1) {
      photos.splice(index, 1);
    }
  });

  const uploadPhotos = $(async () => {
    if (!onUpload || photos.length === 0) return;

    const readyPhotos = photos.filter(p => p.status === 'pending' && p.compressed);

    if (readyPhotos.length === 0) {
      uploadState.error = 'Tidak ada foto yang siap diunggah';
      return;
    }

    uploadState.isUploading = true;
    uploadState.totalFiles = readyPhotos.length;
    uploadState.completedFiles = 0;
    uploadState.error = null;

    try {
      for (const photo of readyPhotos) {
        photo.status = 'uploading';

        try {
          await onUpload([photo.compressed!]);
          photo.status = 'completed';
          uploadState.completedFiles++;
        } catch (error) {
          photo.status = 'error';
          photo.error = 'Gagal mengunggah';
          console.error('Upload failed for photo:', error);
        }

        uploadState.progress = (uploadState.completedFiles / uploadState.totalFiles) * 100;
      }

      if (uploadState.completedFiles === uploadState.totalFiles) {
        // Clear completed photos after a delay
        setTimeout(() => {
          photos.splice(0, photos.length);
          uploadState.isUploading = false;
        }, 2000);
      } else {
        uploadState.isUploading = false;
      }
    } catch (error) {
      uploadState.isUploading = false;
      uploadState.error = 'Gagal mengunggah foto';
      console.error('Upload error:', error);
    }
  });

  const getStatusIcon = (status: PhotoFile['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'compressing':
        return '🔄';
      case 'uploading':
        return '📤';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📷';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div class="w-full max-w-2xl mx-auto">
      {/* Network Info */}
      {showNetworkInfo && (
        <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="text-blue-600">📶</span>
              <span class="font-medium text-blue-700">
                Jaringan: {uploadState.networkType.toUpperCase()}
              </span>
            </div>
            <span class="text-blue-600">
              Kompresi: {uploadState.compressionLevel}
            </span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        class={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging.value
            ? 'border-wedding-accent bg-wedding-cream'
            : 'border-gray-300 hover:border-wedding-accent hover:bg-gray-50'
          }
        `}
        onDrop$={handleDrop}
        onDragOver$={handleDragOver}
        onDragLeave$={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange$={handleFileSelect}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div class="space-y-4">
          <div class="text-6xl">📷</div>

          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">
              Upload Foto Pernikahan
            </h3>
            <p class="text-gray-500 text-sm mb-4">
              Klik atau drag & drop foto ke sini
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick$={() => fileInputRef.value?.click()}
              class="px-6 py-2 bg-wedding-accent text-white rounded-lg hover:bg-wedding-brown transition-colors"
            >
              📁 Pilih dari Galeri
            </button>

            {supportsCamera.value && (
              <button
                type="button"
                onClick$={captureFromCamera}
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📸 Ambil Foto
              </button>
            )}
          </div>

          <div class="text-xs text-gray-500">
            Maksimal {maxFiles} foto • {maxFileSize}MB per foto<br/>
            Format: JPEG, PNG, WebP, HEIC
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadState.error && (
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center gap-2 text-red-700">
            <span>❌</span>
            <span class="text-sm">{uploadState.error}</span>
          </div>
        </div>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-gray-700">
              Foto Terpilih ({photos.length})
            </h4>
            {photos.some(p => p.status === 'pending' && p.compressed) && (
              <button
                onClick$={uploadPhotos}
                disabled={uploadState.isUploading}
                class="px-4 py-2 bg-wedding-accent text-white rounded-lg hover:bg-wedding-brown
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadState.isUploading ? '📤 Mengunggah...' : '📤 Upload Semua'}
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {uploadState.isUploading && (
            <div class="mb-4 p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-700">
                  Mengunggah {uploadState.completedFiles}/{uploadState.totalFiles} foto
                </span>
                <span class="text-sm text-blue-600">
                  {Math.round(uploadState.progress)}%
                </span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Photo Grid */}
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} class="relative group">
                <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.preview}
                    alt="Preview"
                    width={400}
                    height={400}
                    class="w-full h-full object-cover"
                  />

                  {/* Status Overlay */}
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-white text-2xl">
                      {getStatusIcon(photo.status)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  {photo.status !== 'uploading' && (
                    <button
                      onClick$={() => removePhoto(photo.id)}
                      class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full
                             text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Photo Info */}
                <div class="mt-2 text-xs text-gray-600">
                  <div class="flex justify-between">
                    <span>{formatFileSize(photo.originalSize)}</span>
                    {photo.compressedSize && (
                      <span class="text-green-600">
                        {formatFileSize(photo.compressedSize)}
                      </span>
                    )}
                  </div>
                  {photo.compressionRatio && photo.compressionRatio > 1 && (
                    <div class="text-green-600 text-center">
                      {Math.round((1 - 1/photo.compressionRatio) * 100)}% lebih kecil
                    </div>
                  )}
                  {photo.error && (
                    <div class="text-red-600 text-center">
                      {photo.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indonesian Cultural Note */}
      <div class="mt-6 p-3 bg-wedding-cream rounded-lg border border-wedding-beige">
        <div class="text-sm text-wedding-brown text-center">
          💝 Foto Anda akan dioptimalkan untuk jaringan Indonesia dan disimpan dengan aman
        </div>
      </div>
    </div>
  );
});

export default MobilePhotoUpload;