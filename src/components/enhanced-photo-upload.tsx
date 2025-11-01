/**
 * Enhanced Photo Upload Component with Advanced Features
 * Week 6 Implementation - Enhanced Photo Upload System
 */

import { 
  component$, 
  useSignal, 
  useStore, 
  $, 
  useVisibleTask$,
} from '@builder.io/qwik';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  LuUpload,
  LuX,
  LuCamera,
  LuFolderOpen,
  LuSparkles,
  LuSearch,
  LuGrid3x3,
  LuList,
} from '@qwikest/icons/lucide';
import { processImageForUpload, type ProcessedImage } from '../utils/image-processor';
import { getNetworkInfo, type NetworkInfo } from '../utils/network-utils';
import { useGallery } from '../hooks/use-gallery';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  processed?: ProcessedImage;
  status: 'pending' | 'processing' | 'compressing' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    compressedSize?: number;
    format: string;
    deviceInfo: string;
    networkInfo: string;
  };
  edits?: {
    brightness: number;
    contrast: number;
    saturation: number;
    rotation: number;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    filter?: string;
  };
}

interface UploadState {
  isUploading: boolean;
  totalProgress: number;
  activeTab: string;
  selectedFiles: UploadFile[];
  networkInfo: NetworkInfo | null;
  uploadSettings: {
    autoCompress: boolean;
    autoEnhance: boolean;
    addWatermark: boolean;
    createAlbum: boolean;
    albumName: string;
    category: 'ceremony' | 'reception' | 'prewedding' | 'family' | 'friends' | 'candid' | 'traditional';
  };
  viewMode: 'grid' | 'list';
  searchQuery: string;
  sortBy: 'date' | 'name' | 'size';
  filterBy: 'all' | 'image' | 'video' | 'pending' | 'completed';
}

export interface EnhancedPhotoUploadProps {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFormats?: string[];
  showAdvancedOptions?: boolean;
  enableRealTimeUpdates?: boolean;
  onUploadComplete?: (files: UploadFile[]) => void;
  onError?: (error: string) => void;
}

export const EnhancedPhotoUpload = component$<EnhancedPhotoUploadProps>((props) => {
  const {
    maxFiles = 50,
    maxFileSize = 20,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime'],
  } = props;

  const uploadState = useStore<UploadState>({
    isUploading: false,
    totalProgress: 0,
    activeTab: 'upload',
    selectedFiles: [],
    networkInfo: null,
    uploadSettings: {
      autoCompress: true,
      autoEnhance: true,
      addWatermark: false,
      createAlbum: false,
      albumName: '',
      category: 'candid'
    },
    viewMode: 'grid',
    searchQuery: '',
    sortBy: 'date',
    filterBy: 'all'
  });

  const isDragging = useSignal(false);
  const fileInputRef = useSignal<HTMLInputElement>();
  const cameraInputRef = useSignal<HTMLInputElement>();
  const supportsCamera = useSignal(false);
  const supportsAdvancedFeatures = useSignal(false);
  const { uploadFile } = useGallery();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Check device capabilities
    supportsCamera.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    supportsAdvancedFeatures.value = checkAdvancedFeatures();
    
    // Get network information
    const networkInfo = await getNetworkInfo();
    uploadState.networkInfo = networkInfo;
    
    // Adjust settings based on network
    if (networkInfo.effectiveType === '2g' || networkInfo.saveData) {
      uploadState.uploadSettings.autoCompress = true;
      uploadState.uploadSettings.autoEnhance = false;
    }
  });

  const checkAdvancedFeatures = (): boolean => {
    // Check for advanced browser features
    return !!(
      window.OffscreenCanvas ||
      window.createImageBitmap ||
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency > 2
    );
  };

  const generateId = () => `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadeddata = () => {
          video.currentTime = 1; // Seek to 1 second for thumbnail
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        video.onerror = reject;
        video.src = URL.createObjectURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    });
  };

  const extractMetadata = async (file: File): Promise<UploadFile['metadata']> => {
    const metadata: UploadFile['metadata'] = {
      width: 0,
      height: 0,
      size: file.size,
      format: file.type,
      deviceInfo: getDeviceInfo(),
      networkInfo: uploadState.networkInfo ? 
        `${uploadState.networkInfo.effectiveType} (${uploadState.networkInfo.downlink}Mbps)` : 
        'Unknown'
    };

    if (file.type.startsWith('image/')) {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
        metadata.width = img.width;
        metadata.height = img.height;
        URL.revokeObjectURL(img.src);
      } catch (error) {
        console.warn('Failed to extract image dimensions:', error);
      }
    } else if (file.type.startsWith('video/')) {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
          video.src = URL.createObjectURL(file);
        });
        metadata.width = video.videoWidth;
        metadata.height = video.videoHeight;
        URL.revokeObjectURL(video.src);
      } catch (error) {
        console.warn('Failed to extract video dimensions:', error);
      }
    }

    return metadata;
  };

  const getDeviceInfo = (): string => {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    if (isMobile) {
      if (/Android/i.test(ua)) return 'Android';
      if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
      return 'Mobile';
    }
    
    return 'Desktop';
  };

  const processFiles = $(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (uploadState.selectedFiles.length + fileArray.length > maxFiles) {
      props.onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of fileArray) {
      // Validate file
      if (!acceptedFormats.includes(file.type)) {
        props.onError?.(`Unsupported file type: ${file.type}`);
        continue;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        props.onError?.(`File too large: ${file.name} (max ${maxFileSize}MB)`);
        continue;
      }

      try {
        const preview = await createPreview(file);
        const metadata = await extractMetadata(file);
        
        const uploadFile: UploadFile = {
          id: generateId(),
          file,
          preview,
          status: 'pending',
          progress: 0,
          metadata,
          edits: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            rotation: 0
          }
        };

        uploadState.selectedFiles.push(uploadFile);

        // Auto-process if enabled
        if (uploadState.uploadSettings.autoCompress && file.type.startsWith('image/')) {
          await processUploadFile(uploadFile);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        props.onError?.(`Failed to process ${file.name}`);
      }
    }
  });

  const processUploadFile = async (uploadFile: UploadFile) => {
    if (!uploadFile.file.type.startsWith('image/')) return;

    uploadFile.status = 'processing';
    
    try {
      // Process image with advanced compression
      const processed = await processImageForUpload(uploadFile.file, {
        maxFileSizeMB: maxFileSize,
        targetQuality: uploadState.uploadSettings.autoEnhance ? 0.85 : 0.75,
        generateThumbnail: true,
        optimizeForMobile: true,
        preserveOriginal: false
      });

      uploadFile.processed = processed;
      uploadFile.metadata!.compressedSize = processed.compressedBlob.size;
      uploadFile.status = 'pending';
      
      console.log(`[EnhancedPhotoUpload] Processed ${uploadFile.file.name}:`, {
        original: (uploadFile.file.size / 1024 / 1024).toFixed(2) + 'MB',
        compressed: (processed.compressedBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        compression: ((1 - processed.compressedBlob.size / uploadFile.file.size) * 100).toFixed(1) + '%'
      });
    } catch (error) {
      console.error('Processing failed:', error);
      uploadFile.status = 'error';
      uploadFile.error = 'Processing failed';
    }
  };

  const handleFileSelect = $(async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
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
      props.onError?.('Camera not available');
      return;
    }

    if (cameraInputRef.value) {
      cameraInputRef.value.click();
    }
  });

  const removeFile = $((fileId: string) => {
    const index = uploadState.selectedFiles.findIndex(f => f.id === fileId);
    if (index !== -1) {
      uploadState.selectedFiles.splice(index, 1);
    }
  });

  const uploadAllFiles = $(async () => {
    const readyFiles = uploadState.selectedFiles.filter(f => f.status === 'pending');
    
    if (readyFiles.length === 0) {
      props.onError?.('No files ready to upload');
      return;
    }

    uploadState.isUploading = true;
    uploadState.totalProgress = 0;

    try {
      for (let i = 0; i < readyFiles.length; i++) {
        const file = readyFiles[i];
        file.status = 'uploading';
        
        try {
          const fileToUpload = file.processed?.compressedBlob || file.file;
          
          const uploadFileObj = new File([fileToUpload], file.file.name, {
            type: fileToUpload.type,
            lastModified: Date.now()
          });
          await uploadFile(uploadFileObj, {
            title: file.file.name,
            description: `Uploaded from ${file.metadata?.deviceInfo}`,
            author: 'Guest'
          });
          
          file.status = 'completed';
          file.progress = 100;
        } catch (error) {
          file.status = 'error';
          file.error = 'Upload failed';
          console.error('Upload failed:', error);
        }

        uploadState.totalProgress = ((i + 1) / readyFiles.length) * 100;
      }

      props.onUploadComplete?.(readyFiles.filter(f => f.status === 'completed'));
      
      // Clear completed files after delay
      setTimeout(() => {
        uploadState.selectedFiles = uploadState.selectedFiles.filter(f => f.status !== 'completed');
        uploadState.isUploading = false;
        uploadState.totalProgress = 0;
      }, 3000);
      
    } catch (error) {
      console.error('Batch upload error:', error);
      props.onError?.('Upload failed');
      uploadState.isUploading = false;
    }
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'compressing': return '🗜️';
      case 'uploading': return '📤';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📷';
    }
  };

  const filteredFiles = uploadState.selectedFiles.filter(file => {
    const matchesSearch = file.file.name.toLowerCase().includes(uploadState.searchQuery.toLowerCase());
    const matchesFilter = 
      uploadState.filterBy === 'all' ||
      (uploadState.filterBy === 'image' && file.file.type.startsWith('image/')) ||
      (uploadState.filterBy === 'video' && file.file.type.startsWith('video/')) ||
      (uploadState.filterBy === 'pending' && file.status === 'pending') ||
      (uploadState.filterBy === 'completed' && file.status === 'completed');
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div class="w-full max-w-6xl mx-auto space-y-6">
      {/* Network Status */}
      {uploadState.networkInfo && (
        <Card class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-2xl">📶</span>
                <div>
                  <div class="font-medium text-blue-900">
                    {uploadState.networkInfo.carrier?.name || 'Unknown Network'}
                  </div>
                  <div class="text-sm text-blue-700">
                    {uploadState.networkInfo.effectiveType?.toUpperCase()} • {uploadState.networkInfo.downlink} Mbps
                  </div>
                </div>
              </div>
              <Badge variant="outline" class="text-blue-700 border-blue-300">
                {uploadState.networkInfo.region?.name}
              </Badge>
            </div>
            <div class="text-sm text-blue-600">
              {uploadState.networkInfo.timeOfDay === 'peak' ? '🔴 Peak Hours' : 
               uploadState.networkInfo.timeOfDay === 'off-peak' ? '🟢 Off-Peak' : '🟡 Normal'}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={uploadState.activeTab} onValueChange$={(value) => uploadState.activeTab = value}>
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="upload">📤 Upload</TabsTrigger>
          <TabsTrigger value="edit">✏️ Edit</TabsTrigger>
          <TabsTrigger value="organize">📁 Organize</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" class="space-y-6">
          {/* Drag & Drop Area */}
          <div
            class={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging.value
                ? 'border-wedding-accent bg-wedding-cream scale-105'
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
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange$={handleFileSelect}
              class="hidden"
            />

            <div class="space-y-6">
              <div class="text-6xl animate-bounce">📸</div>
              
              <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                  Enhanced Photo Upload
                </h3>
                <p class="text-gray-600 max-w-md mx-auto">
                  Drag & drop your wedding photos here, or click to browse. 
                  Advanced compression and optimization included!
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick$={() => fileInputRef.value?.click()}
                  class="bg-wedding-accent hover:bg-wedding-brown text-white px-6 py-3"
                >
                  <LuFolderOpen class="w-5 h-5 mr-2" />
                  Browse Files
                </Button>

                {supportsCamera.value && (
                  <Button
                    onClick$={captureFromCamera}
                    variant="outline"
                    class="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3"
                  >
                    <LuCamera class="w-5 h-5 mr-2" />
                    Take Photo
                  </Button>
                )}
              </div>

              <div class="text-sm text-gray-500 space-y-1">
                <div>Maximum {maxFiles} files • {maxFileSize}MB per file</div>
                <div>Supported: JPEG, PNG, WebP, HEIC, MP4, MOV</div>
                <div class="flex items-center justify-center gap-4">
                  <span>✨ Auto-compression</span>
                  <span>🎨 Auto-enhancement</span>
                  <span>📱 Mobile optimized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadState.isUploading && (
            <Card class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold">Uploading Files...</h4>
                  <span class="text-sm text-gray-600">
                    {Math.round(uploadState.totalProgress)}%
                  </span>
                </div>
                <Progress value={uploadState.totalProgress} class="h-3" />
                <div class="text-sm text-gray-600">
                  {uploadState.selectedFiles.filter(f => f.status === 'completed').length} / 
                  {uploadState.selectedFiles.filter(f => f.status !== 'error').length} completed
                </div>
              </div>
            </Card>
          )}

          {/* File List */}
          {uploadState.selectedFiles.length > 0 && (
            <Card class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold">
                  Selected Files ({uploadState.selectedFiles.length})
                </h3>
                <div class="flex gap-2">
                  <Button
                    onClick$={uploadAllFiles}
                    disabled={uploadState.isUploading || uploadState.selectedFiles.every(f => f.status !== 'pending')}
                    class="bg-wedding-accent hover:bg-wedding-brown text-white"
                  >
                    <LuUpload class="w-4 h-4 mr-2" />
                    Upload All
                  </Button>
                </div>
              </div>

              {/* Search and Filter */}
              <div class="flex flex-col sm:flex-row gap-4 mb-6">
                <div class="flex-1 relative">
                  <LuSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={uploadState.searchQuery}
                    onInput$={(e) => uploadState.searchQuery = (e.target as HTMLInputElement).value}
                    class="pl-10"
                  />
                </div>
                <select
                  value={uploadState.filterBy}
                  onChange$={(e) => uploadState.filterBy = (e.target as HTMLSelectElement).value as UploadState['filterBy']}
                  class="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Files</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <div class="flex gap-1">
                  <Button
                    variant={uploadState.viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick$={() => uploadState.viewMode = 'grid'}
                  >
                    <LuGrid3x3 class="w-4 h-4" />
                  </Button>
                  <Button
                    variant={uploadState.viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick$={() => uploadState.viewMode = 'list'}
                  >
                    <LuList class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Files Grid/List */}
              <div class={uploadState.viewMode === 'grid' ? 
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 
                'space-y-4'
              }>
                {filteredFiles.map((file) => (
                  <div key={file.id} class={`
                    ${uploadState.viewMode === 'grid' ? '' : 'flex items-center gap-4'}
                    border rounded-lg p-4 hover:shadow-md transition-shadow
                  `}>
                    {/* Preview */}
                    <div class={uploadState.viewMode === 'grid' ?
                      'aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3' :
                      'w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'
                    }>
                      <img
                        src={file.preview}
                        alt="Preview"
                        width="200"
                        height="200"
                        class="w-full h-full object-cover"
                      />
                      
                      {/* Status Overlay */}
                      <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span class="text-white text-2xl">
                          {getStatusIcon(file.status)}
                        </span>
                      </div>
                    </div>

                    {/* File Info */}
                    <div class={uploadState.viewMode === 'grid' ? 'space-y-2' : 'flex-1'}>
                      <div class="flex items-start justify-between">
                        <div class="min-w-0 flex-1">
                          <h4 class="font-medium text-sm truncate">{file.file.name}</h4>
                          <div class="text-xs text-gray-500 space-y-1">
                            <div>{formatFileSize(file.file.size)}</div>
                            {file.metadata?.compressedSize && (
                              <div class="text-green-600">
                                {formatFileSize(file.metadata.compressedSize)} compressed
                              </div>
                            )}
                            {file.metadata?.width && file.metadata?.height && (
                              <div>{file.metadata.width} × {file.metadata.height}</div>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick$={() => removeFile(file.id)}
                          disabled={file.status === 'uploading'}
                          class="text-red-500 hover:text-red-700"
                        >
                          <LuX class="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Progress */}
                      {file.status === 'uploading' && (
                        <div class="mt-2">
                          <Progress value={file.progress} class="h-1" />
                        </div>
                      )}

                      {/* Status */}
                      <div class="flex items-center gap-2 mt-2">
                        <Badge variant={
                          file.status === 'completed' ? 'default' :
                          file.status === 'error' ? 'destructive' :
                          file.status === 'uploading' ? 'secondary' : 'outline'
                        } class="text-xs">
                          {file.status}
                        </Badge>
                        {file.error && (
                          <span class="text-xs text-red-600">{file.error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" class="space-y-6">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Photo Editing Tools</h3>
            <div class="text-center py-12 text-gray-500">
              <LuSparkles class="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Advanced editing features coming soon!</p>
              <p class="text-sm mt-2">Filters, crops, adjustments, and more</p>
            </div>
          </Card>
        </TabsContent>

        {/* Organize Tab */}
        <TabsContent value="organize" class="space-y-6">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Album Organization</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={uploadState.uploadSettings.createAlbum}
                  onChange$={(e) => uploadState.uploadSettings.createAlbum = (e.target as HTMLInputElement).checked}
                  class="w-4 h-4"
                />
                <label class="text-sm font-medium">Create album from uploads</label>
              </div>
              
              {uploadState.uploadSettings.createAlbum && (
                <div class="ml-7 space-y-3">
                  <Input
                    placeholder="Album name..."
                    value={uploadState.uploadSettings.albumName}
                    onInput$={(e) => uploadState.uploadSettings.albumName = (e.target as HTMLInputElement).value}
                  />
                  <select
                    value={uploadState.uploadSettings.category}
                    onChange$={(e) => uploadState.uploadSettings.category = (e.target as HTMLSelectElement).value as UploadState['uploadSettings']['category']}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="ceremony">Ceremony</option>
                    <option value="reception">Reception</option>
                    <option value="prewedding">Pre-wedding</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                    <option value="candid">Candid</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" class="space-y-6">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Upload Settings</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={uploadState.uploadSettings.autoCompress}
                  onChange$={(e) => uploadState.uploadSettings.autoCompress = (e.target as HTMLInputElement).checked}
                  class="w-4 h-4"
                />
                <label class="text-sm font-medium">Auto-compress images</label>
              </div>
              
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={uploadState.uploadSettings.autoEnhance}
                  onChange$={(e) => uploadState.uploadSettings.autoEnhance = (e.target as HTMLInputElement).checked}
                  class="w-4 h-4"
                />
                <label class="text-sm font-medium">Auto-enhance photos</label>
              </div>
              
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={uploadState.uploadSettings.addWatermark}
                  onChange$={(e) => uploadState.uploadSettings.addWatermark = (e.target as HTMLInputElement).checked}
                  class="w-4 h-4"
                />
                <label class="text-sm font-medium">Add wedding watermark</label>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default EnhancedPhotoUpload;