/**
 * Photo Collage Creation Component
 * Week 6 Implementation - Photo Collage Creation Features
 */

import { component$, useSignal, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Grid3X3,
  Layout,
  Image as ImageIcon,
  Download,
  Save,
  RotateCw,
  Plus,
  X
} from 'lucide-react';

interface CollageImage {
  id: string;
  url: string;
  file?: File;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  filter?: string;
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

interface CollageTemplate {
  id: string;
  name: string;
  icon: string;
  layout: {
    rows: number;
    cols: number;
    gaps: number;
    aspectRatio: string;
  };
  positions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface CollageSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundOpacity: number;
  template: string;
  spacing: number;
  cornerRadius: number;
  shadow: {
    enabled: boolean;
    blur: number;
    color: string;
    opacity: number;
  };
  text?: {
    content: string;
    position: 'top' | 'bottom' | 'center';
    color: string;
    size: number;
    font: string;
  };
}

export interface PhotoCollageProps {
  images?: string[];
  onSave?: (collageBlob: Blob, settings: CollageSettings) => void;
  maxImages?: number;
  showAdvancedOptions?: boolean;
}

export const PhotoCollage = component$<PhotoCollageProps>((props) => {
  const {
    images = [],
    onSave,
    maxImages = 9,
    showAdvancedOptions = true
  } = props;

  const canvasRef = useSignal<HTMLCanvasElement>();
  const selectedImageId = useSignal<string>();
  const isProcessing = useSignal(false);
  const activeTab = useSignal('templates');
  
  const collageImages = useSignal<CollageImage[]>([]);
  const collageSettings = useStore<CollageSettings>({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    backgroundOpacity: 1,
    template: 'grid-3x3',
    spacing: 10,
    cornerRadius: 0,
    shadow: {
      enabled: true,
      blur: 10,
      color: '#000000',
      opacity: 0.2
    }
  });

  const templates: CollageTemplate[] = [
    {
      id: 'grid-2x2',
      name: 'Grid 2×2',
      icon: '⚏',
      layout: { rows: 2, cols: 2, gaps: 10, aspectRatio: '1:1' },
      positions: [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 50, y: 0, width: 50, height: 50 },
        { x: 0, y: 50, width: 50, height: 50 },
        { x: 50, y: 50, width: 50, height: 50 }
      ]
    },
    {
      id: 'grid-3x3',
      name: 'Grid 3×3',
      icon: '⚋',
      layout: { rows: 3, cols: 3, gaps: 5, aspectRatio: '1:1' },
      positions: Array.from({ length: 9 }, (_, i) => ({
        x: (i % 3) * 33.33,
        y: Math.floor(i / 3) * 33.33,
        width: 33.33,
        height: 33.33
      }))
    },
    {
      id: 'featured',
      name: 'Featured',
      icon: '⬛',
      layout: { rows: 2, cols: 2, gaps: 10, aspectRatio: '4:3' },
      positions: [
        { x: 0, y: 0, width: 66.67, height: 100 },
        { x: 66.67, y: 0, width: 33.33, height: 50 },
        { x: 66.67, y: 50, width: 33.33, height: 50 }
      ]
    },
    {
      id: 'diagonal',
      name: 'Diagonal',
      icon: '⚡',
      layout: { rows: 2, cols: 2, gaps: 15, aspectRatio: '16:9' },
      positions: [
        { x: 0, y: 0, width: 60, height: 60 },
        { x: 60, y: 0, width: 40, height: 40 },
        { x: 0, y: 60, width: 40, height: 40 },
        { x: 40, y: 60, width: 60, height: 40 }
      ]
    },
    {
      id: 'heart',
      name: 'Heart',
      icon: '❤️',
      layout: { rows: 3, cols: 3, gaps: 8, aspectRatio: '1:1' },
      positions: [
        { x: 25, y: 0, width: 50, height: 40 },
        { x: 0, y: 30, width: 40, height: 40 },
        { x: 60, y: 30, width: 40, height: 40 },
        { x: 25, y: 60, width: 50, height: 40 }
      ]
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: '⭕',
      layout: { rows: 3, cols: 3, gaps: 5, aspectRatio: '1:1' },
      positions: [
        { x: 35, y: 10, width: 30, height: 30 },
        { x: 10, y: 35, width: 30, height: 30 },
        { x: 60, y: 35, width: 30, height: 30 },
        { x: 35, y: 60, width: 30, height: 30 }
      ]
    }
  ];

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => images.length);
    
    if (images.length > 0) {
      initializeImages();
    }
  });

  const initializeImages = () => {
    const newImages: CollageImage[] = images.slice(0, maxImages).map((url, index) => ({
      id: `img-${Date.now()}-${index}`,
      url,
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      rotation: 0,
      zIndex: index
    }));
    
    collageImages.value = newImages;
    applyTemplate(collageSettings.template);
  };

  const applyTemplate = $(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    collageSettings.template = templateId;
    collageSettings.width = 800;
    collageSettings.height = 600;

    // Update image positions based on template
    const updatedImages = collageImages.value.map((img, index) => {
      if (index < template.positions.length) {
        const pos = template.positions[index];
        return {
          ...img,
          x: (pos.x / 100) * collageSettings.width,
          y: (pos.y / 100) * collageSettings.height,
          width: (pos.width / 100) * collageSettings.width - template.layout.gaps,
          height: (pos.height / 100) * collageSettings.height - template.layout.gaps
        };
      }
      return img;
    });

    collageImages.value = updatedImages;
    await renderCollage();
  });

  const renderCollage = $(async () => {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = collageSettings.width;
    canvas.height = collageSettings.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = collageSettings.backgroundColor;
    ctx.globalAlpha = collageSettings.backgroundOpacity;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    // Sort images by z-index
    const sortedImages = [...collageImages.value].sort((a, b) => a.zIndex - b.zIndex);

    // Draw each image
    for (const img of sortedImages) {
      await drawImage(ctx, img);
    }

    // Draw text if specified
    if (collageSettings.text) {
      drawText(ctx);
    }
  });

  const drawImage = async (ctx: CanvasRenderingContext2D, img: CollageImage) => {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      image.onload = () => {
        ctx.save();

        // Apply transformations
        ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
        ctx.rotate((img.rotation * Math.PI) / 180);
        ctx.translate(-(img.x + img.width / 2), -(img.y + img.height / 2));

        // Apply shadow
        if (collageSettings.shadow.enabled) {
          ctx.shadowColor = collageSettings.shadow.color;
          ctx.shadowBlur = collageSettings.shadow.blur;
          // Note: shadowOpacity is not supported in Canvas 2D API
          // We'll use alpha in the color instead
          const alpha = Math.round(collageSettings.shadow.opacity * 255).toString(16).padStart(2, '0');
          ctx.shadowColor = collageSettings.shadow.color + alpha;
        }

        // Draw image with corner radius
        if (collageSettings.cornerRadius > 0) {
          roundRect(ctx, img.x, img.y, img.width, img.height, collageSettings.cornerRadius);
          ctx.clip();
        }

        // Apply filter if specified
        if (img.filter) {
          ctx.filter = img.filter;
        }

        ctx.drawImage(image, img.x, img.y, img.width, img.height);

        // Draw border if specified
        if (img.border) {
          ctx.strokeStyle = img.border.color;
          ctx.lineWidth = img.border.width;
          
          if (img.border.style === 'dashed') {
            ctx.setLineDash([5, 5]);
          } else if (img.border.style === 'dotted') {
            ctx.setLineDash([2, 2]);
          }
          
          if (collageSettings.cornerRadius > 0) {
            roundRect(ctx, img.x, img.y, img.width, img.height, collageSettings.cornerRadius);
            ctx.stroke();
          } else {
            ctx.strokeRect(img.x, img.y, img.width, img.height);
          }
          
          ctx.setLineDash([]);
        }

        ctx.restore();
        resolve();
      };

      image.onerror = () => resolve();
      image.src = img.url;
    });
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    if (!collageSettings.text) return;

    const { content, position, color, size, font } = collageSettings.text;
    
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = collageSettings.width / 2;
    let y = collageSettings.height / 2;

    switch (position) {
      case 'top':
        y = size + 20;
        break;
      case 'bottom':
        y = collageSettings.height - size - 20;
        break;
      case 'center':
        // Already centered
        break;
    }

    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(content, x, y);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const removeImage = $((imageId: string) => {
    collageImages.value = collageImages.value.filter(img => img.id !== imageId);
    if (selectedImageId.value === imageId) {
      selectedImageId.value = undefined;
    }
  });

  const updateImage = $((imageId: string, updates: Partial<CollageImage>) => {
    collageImages.value = collageImages.value.map(img =>
      img.id === imageId ? { ...img, ...updates } : img
    );
  });

  const saveCollage = $(async () => {
    if (!canvasRef.value) return;

    isProcessing.value = true;

    try {
      await renderCollage();
      
      canvasRef.value.toBlob(async (blob) => {
        if (blob && onSave) {
          await onSave(blob, { ...collageSettings });
        }
        isProcessing.value = false;
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Failed to save collage:', error);
      isProcessing.value = false;
    }
  });

  const downloadCollage = $(() => {
    if (!canvasRef.value) return;

    const link = document.createElement('a');
    link.download = `wedding-collage-${Date.now()}.jpg`;
    link.href = canvasRef.value.toDataURL('image/jpeg', 0.95);
    link.click();
  });

  const shuffleImages = $(() => {
    const shuffled = [...collageImages.value].sort(() => Math.random() - 0.5);
    collageImages.value = shuffled;
    renderCollage();
  });

  const autoArrange = $(() => {
    applyTemplate(collageSettings.template);
  });

  return (
    <div class="w-full max-w-7xl mx-auto">
      <Card class="overflow-hidden">
        {/* Header */}
        <div class="border-b bg-gray-50 p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Grid3X3 class="w-5 h-5" />
              Photo Collage Creator
            </h3>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick$={shuffleImages}
                disabled={collageImages.value.length === 0}
              >
                <RotateCw class="w-4 h-4 mr-1" />
                Shuffle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick$={autoArrange}
                disabled={collageImages.value.length === 0}
              >
                <Layout class="w-4 h-4 mr-1" />
                Auto Arrange
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick$={downloadCollage}
                disabled={collageImages.value.length === 0}
              >
                <Download class="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                onClick$={saveCollage}
                disabled={isProcessing.value || collageImages.value.length === 0}
                class="bg-wedding-accent hover:bg-wedding-brown text-white"
              >
                {isProcessing.value ? 'Processing...' : (
                  <>
                    <Save class="w-4 h-4 mr-1" />
                    Save Collage
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row">
          {/* Canvas Area */}
          <div class="flex-1 p-6 bg-gray-100 flex items-center justify-center min-h-[600px]">
            <div class="relative">
              <canvas
                ref={canvasRef}
                class="max-w-full max-h-full shadow-2xl rounded-lg bg-white"
                style={{ maxHeight: '600px' }}
              />
              
              {collageImages.value.length === 0 && (
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <ImageIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 class="text-lg font-medium text-gray-600 mb-2">No photos yet</h4>
                    <p class="text-gray-500">Add photos to create your collage</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div class="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-white">
            <Tabs value={activeTab.value} onValueChange$={(value) => activeTab.value = value}>
              <TabsList class="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" class="p-4">
                <div class="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant={collageSettings.template === template.id ? 'default' : 'outline'}
                      onClick$={() => applyTemplate(template.id)}
                      class="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <span class="text-2xl">{template.icon}</span>
                      <span class="text-sm font-medium">{template.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" class="p-4 space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium">Photos ({collageImages.value.length}/{maxImages})</h4>
                  {collageImages.value.length < maxImages && (
                    <Button size="sm" variant="outline">
                      <Plus class="w-4 h-4 mr-1" />
                      Add Photo
                    </Button>
                  )}
                </div>

                <div class="space-y-2 max-h-96 overflow-y-auto">
                  {collageImages.value.map((img, index) => (
                    <div
                      key={img.id}
                      class={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${selectedImageId.value === img.id ? 'border-wedding-accent bg-wedding-cream' : 'border-gray-200 hover:border-gray-300'}
                      `}
                      onClick$={() => selectedImageId.value = img.id}
                    >
                      <img
                        src={img.url}
                        alt={`Photo ${index + 1}`}
                        width="48"
                        height="48"
                        class="w-12 h-12 object-cover rounded"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-sm">Photo {index + 1}</div>
                        <div class="text-xs text-gray-500">
                          {Math.round(img.width)} × {Math.round(img.height)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick$={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        class="text-red-500 hover:text-red-700"
                      >
                        <X class="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {selectedImageId.value && (
                  <Card class="p-4">
                    <h5 class="font-medium mb-3">Selected Image</h5>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium">Rotation</label>
                        <Slider
                          value={[collageImages.value.find(img => img.id === selectedImageId.value)?.rotation || 0]}
                          onValueChange$={([value]) => updateImage(selectedImageId.value!, { rotation: value })}
                          min={-180}
                          max={180}
                          step={1}
                          class="w-full mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" class="p-4 space-y-6">
                <div>
                  <h4 class="font-medium mb-3">Canvas Size</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="text-sm text-gray-600">Width</label>
                      <input
                        type="number"
                        value={collageSettings.width}
                        onInput$={(e) => {
                          collageSettings.width = parseInt((e.target as HTMLInputElement).value) || 800;
                          renderCollage();
                        }}
                        class="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label class="text-sm text-gray-600">Height</label>
                      <input
                        type="number"
                        value={collageSettings.height}
                        onInput$={(e) => {
                          collageSettings.height = parseInt((e.target as HTMLInputElement).value) || 600;
                          renderCollage();
                        }}
                        class="w-full px-2 py-1 border rounded"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium mb-3">Background</h4>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        value={collageSettings.backgroundColor}
                        onInput$={(e) => {
                          collageSettings.backgroundColor = (e.target as HTMLInputElement).value;
                          renderCollage();
                        }}
                        class="w-8 h-8 border rounded"
                      />
                      <input
                        type="text"
                        value={collageSettings.backgroundColor}
                        onInput$={(e) => {
                          collageSettings.backgroundColor = (e.target as HTMLInputElement).value;
                          renderCollage();
                        }}
                        class="flex-1 px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label class="text-sm text-gray-600">Opacity</label>
                      <Slider
                        value={[collageSettings.backgroundOpacity * 100]}
                        onValueChange$={([value]) => {
                          collageSettings.backgroundOpacity = value / 100;
                          renderCollage();
                        }}
                        min={0}
                        max={100}
                        step={1}
                        class="w-full mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium mb-3">Spacing & Corners</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="text-sm text-gray-600">Spacing</label>
                      <Slider
                        value={[collageSettings.spacing]}
                        onValueChange$={([value]) => {
                          collageSettings.spacing = value;
                          renderCollage();
                        }}
                        min={0}
                        max={50}
                        step={1}
                        class="w-full mt-1"
                      />
                    </div>
                    <div>
                      <label class="text-sm text-gray-600">Corner Radius</label>
                      <Slider
                        value={[collageSettings.cornerRadius]}
                        onValueChange$={([value]) => {
                          collageSettings.cornerRadius = value;
                          renderCollage();
                        }}
                        min={0}
                        max={50}
                        step={1}
                        class="w-full mt-1"
                      />
                    </div>
                  </div>
                </div>

                {showAdvancedOptions && (
                  <div>
                    <h4 class="font-medium mb-3">Shadow</h4>
                    <div class="space-y-3">
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={collageSettings.shadow.enabled}
                          onChange$={(e) => {
                            collageSettings.shadow.enabled = (e.target as HTMLInputElement).checked;
                            renderCollage();
                          }}
                          class="w-4 h-4"
                        />
                        <label class="text-sm">Enable shadow</label>
                      </div>
                      
                      {collageSettings.shadow.enabled && (
                        <>
                          <div>
                            <label class="text-sm text-gray-600">Blur</label>
                            <Slider
                              value={[collageSettings.shadow.blur]}
                              onValueChange$={([value]) => {
                                collageSettings.shadow.blur = value;
                                renderCollage();
                              }}
                              min={0}
                              max={50}
                              step={1}
                              class="w-full mt-1"
                            />
                          </div>
                          <div>
                            <label class="text-sm text-gray-600">Opacity</label>
                            <Slider
                              value={[collageSettings.shadow.opacity * 100]}
                              onValueChange$={([value]) => {
                                collageSettings.shadow.opacity = value / 100;
                                renderCollage();
                              }}
                              min={0}
                              max={100}
                              step={1}
                              class="w-full mt-1"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default PhotoCollage;