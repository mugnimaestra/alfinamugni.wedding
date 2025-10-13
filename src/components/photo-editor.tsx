/**
 * Advanced Photo Editor Component
 * Week 6 Implementation - Photo Preview and Editing Capabilities
 */

import { component$, useSignal, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  Sparkles,
  Sun,
  Contrast,
  Droplets,
  Palette,
  Wand2,
  Undo,
  Redo,
  Download,
  Save,
  X,
} from 'lucide-react';

interface EditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
  hue: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface FilterPreset {
  name: string;
  icon: string;
  settings: Partial<EditSettings>;
}

export interface PhotoEditorProps {
  imageUrl: string;
  originalFile?: File;
  onSave?: (editedImage: Blob, settings: EditSettings) => void;
  onCancel?: () => void;
  showAdvancedOptions?: boolean;
}

export const PhotoEditor = component$<PhotoEditorProps>((props) => {
  const {
    imageUrl,
    onSave,
    onCancel,
    showAdvancedOptions = true
  } = props;

  const canvasRef = useSignal<HTMLCanvasElement>();
  const previewCanvasRef = useSignal<HTMLCanvasElement>();
  const originalImage = useSignal<HTMLImageElement>();
  const isProcessing = useSignal(false);
  const activeTab = useSignal('adjust');
  
  const editSettings = useStore<EditSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hue: 0,
    rotation: 0,
    flipH: false,
    flipV: false
  });

  const history = useSignal<EditSettings[]>([JSON.parse(JSON.stringify(editSettings))]);
  const historyIndex = useSignal(0);

  const filterPresets: FilterPreset[] = [
    {
      name: 'Original',
      icon: '📷',
      settings: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        hue: 0
      }
    },
    {
      name: 'Vintage',
      icon: '📜',
      settings: {
        brightness: 10,
        contrast: 20,
        saturation: -20,
        sepia: 30
      }
    },
    {
      name: 'Black & White',
      icon: '⚫',
      settings: {
        grayscale: 100,
        contrast: 10
      }
    },
    {
      name: 'Warm',
      icon: '🌅',
      settings: {
        brightness: 5,
        saturation: 20,
        hue: 10
      }
    },
    {
      name: 'Cool',
      icon: '❄️',
      settings: {
        brightness: -5,
        saturation: -10,
        hue: -10
      }
    },
    {
      name: 'Dramatic',
      icon: '🎭',
      settings: {
        contrast: 40,
        saturation: 20,
        brightness: -10
      }
    },
    {
      name: 'Soft',
      icon: '☁️',
      settings: {
        brightness: 10,
        contrast: -10,
        saturation: -10,
        blur: 1
      }
    },
    {
      name: 'Vivid',
      icon: '🌈',
      settings: {
        saturation: 40,
        contrast: 20,
        brightness: 5
      }
    }
  ];

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => imageUrl);
    
    if (imageUrl && canvasRef.value) {
      loadImage();
    }
  });

  const loadImage = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImage.value = img;
      applyEdits();
    };
    img.src = imageUrl;
  };

  const applyEdits = () => {
    if (!originalImage.value || !canvasRef.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d')!;
    const img = originalImage.value;

    // Calculate canvas dimensions with rotation
    const angle = (editSettings.rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    
    canvas.width = img.width * cos + img.height * sin;
    canvas.height = img.width * sin + img.height * cos;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.scale(
      editSettings.flipH ? -1 : 1,
      editSettings.flipV ? -1 : 1
    );

    // Apply CSS filters
    const filters = [];
    
    if (editSettings.brightness !== 0) {
      filters.push(`brightness(${100 + editSettings.brightness}%)`);
    }
    if (editSettings.contrast !== 0) {
      filters.push(`contrast(${100 + editSettings.contrast}%)`);
    }
    if (editSettings.saturation !== 0) {
      filters.push(`saturate(${100 + editSettings.saturation}%)`);
    }
    if (editSettings.blur > 0) {
      filters.push(`blur(${editSettings.blur}px)`);
    }
    if (editSettings.sepia > 0) {
      filters.push(`sepia(${editSettings.sepia}%)`);
    }
    if (editSettings.grayscale > 0) {
      filters.push(`grayscale(${editSettings.grayscale}%)`);
    }
    if (editSettings.hue !== 0) {
      filters.push(`hue-rotate(${editSettings.hue}deg)`);
    }

    ctx.filter = filters.join(' ');

    // Draw image
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Restore context state
    ctx.restore();

    // Update preview if available
    if (previewCanvasRef.value) {
      const previewCtx = previewCanvasRef.value.getContext('2d')!;
      previewCanvasRef.value.width = 200;
      previewCanvasRef.value.height = (200 * canvas.height) / canvas.width;
      previewCtx.drawImage(canvas, 0, 0, 200, previewCanvasRef.value.height);
    }
  };

  const updateSetting = $((key: keyof EditSettings, value: number | boolean) => {
    editSettings[key] = value as never;
    applyEdits();
    
    // Add to history
    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push(JSON.parse(JSON.stringify(editSettings)));
    history.value = newHistory;
    historyIndex.value = newHistory.length - 1;
  });

  const applyPreset = $((preset: FilterPreset) => {
    Object.assign(editSettings, preset.settings);
    applyEdits();
    
    // Add to history
    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push(JSON.parse(JSON.stringify(editSettings)));
    history.value = newHistory;
    historyIndex.value = newHistory.length - 1;
  });

  const undo = $(() => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      Object.assign(editSettings, history.value[historyIndex.value]);
      applyEdits();
    }
  });

  const redo = $(() => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      Object.assign(editSettings, history.value[historyIndex.value]);
      applyEdits();
    }
  });

  const reset = $(() => {
    Object.assign(editSettings, {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      hue: 0,
      rotation: 0,
      flipH: false,
      flipV: false
    });
    applyEdits();
    
    // Add to history
    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push(JSON.parse(JSON.stringify(editSettings)));
    history.value = newHistory;
    historyIndex.value = newHistory.length - 1;
  });

  const rotate = $((direction: 'left' | 'right') => {
    const rotation = direction === 'right' ? 90 : -90;
    editSettings.rotation = (editSettings.rotation + rotation) % 360;
    applyEdits();
    
    // Add to history
    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push(JSON.parse(JSON.stringify(editSettings)));
    history.value = newHistory;
    historyIndex.value = newHistory.length - 1;
  });

  const flip = $((direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      editSettings.flipH = !editSettings.flipH;
    } else {
      editSettings.flipV = !editSettings.flipV;
    }
    applyEdits();
    
    // Add to history
    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push(JSON.parse(JSON.stringify(editSettings)));
    history.value = newHistory;
    historyIndex.value = newHistory.length - 1;
  });

  const saveImage = $(async () => {
    if (!canvasRef.value) return;

    isProcessing.value = true;

    try {
      canvasRef.value.toBlob(async (blob) => {
        if (blob && onSave) {
          await onSave(blob, JSON.parse(JSON.stringify(editSettings)));
        }
        isProcessing.value = false;
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Failed to save image:', error);
      isProcessing.value = false;
    }
  });

  const downloadImage = $(() => {
    if (!canvasRef.value) return;

    const link = document.createElement('a');
    link.download = `edited-photo-${Date.now()}.jpg`;
    link.href = canvasRef.value.toDataURL('image/jpeg', 0.95);
    link.click();
  });

  return (
    <div class="w-full max-w-6xl mx-auto">
      <Card class="overflow-hidden">
        {/* Header */}
        <div class="border-b bg-gray-50 p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Photo Editor</h3>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick$={undo}
                disabled={historyIndex.value <= 0}
              >
                <Undo class="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick$={redo}
                disabled={historyIndex.value >= history.value.length - 1}
              >
                <Redo class="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick$={reset}
              >
                <X class="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick$={downloadImage}
              >
                <Download class="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                onClick$={saveImage}
                disabled={isProcessing.value}
                class="bg-wedding-accent hover:bg-wedding-brown text-white"
              >
                {isProcessing.value ? (
                  'Processing...'
                ) : (
                  <>
                    <Save class="w-4 h-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick$={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row">
          {/* Main Canvas */}
          <div class="flex-1 p-6 bg-gray-900 flex items-center justify-center min-h-[500px]">
            <canvas
              ref={canvasRef}
              class="max-w-full max-h-full shadow-2xl rounded-lg"
            />
          </div>

          {/* Controls Panel */}
          <div class="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-white">
            <Tabs value={activeTab.value} onValueChange$={(value) => activeTab.value = value}>
              <TabsList class="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="adjust">Adjust</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="transform">Transform</TabsTrigger>
              </TabsList>

              {/* Adjustments Tab */}
              <TabsContent value="adjust" class="p-4 space-y-6">
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium flex items-center gap-2">
                        <Sun class="w-4 h-4" />
                        Brightness
                      </label>
                      <Badge variant="outline" class="text-xs">
                        {editSettings.brightness > 0 ? '+' : ''}{editSettings.brightness}%
                      </Badge>
                    </div>
                    <Slider
                      value={[editSettings.brightness]}
                      onValueChange$={([value]) => updateSetting('brightness', value)}
                      min={-100}
                      max={100}
                      step={1}
                      class="w-full"
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium flex items-center gap-2">
                        <Contrast class="w-4 h-4" />
                        Contrast
                      </label>
                      <Badge variant="outline" class="text-xs">
                        {editSettings.contrast > 0 ? '+' : ''}{editSettings.contrast}%
                      </Badge>
                    </div>
                    <Slider
                      value={[editSettings.contrast]}
                      onValueChange$={([value]) => updateSetting('contrast', value)}
                      min={-100}
                      max={100}
                      step={1}
                      class="w-full"
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium flex items-center gap-2">
                        <Droplets class="w-4 h-4" />
                        Saturation
                      </label>
                      <Badge variant="outline" class="text-xs">
                        {editSettings.saturation > 0 ? '+' : ''}{editSettings.saturation}%
                      </Badge>
                    </div>
                    <Slider
                      value={[editSettings.saturation]}
                      onValueChange$={([value]) => updateSetting('saturation', value)}
                      min={-100}
                      max={100}
                      step={1}
                      class="w-full"
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium flex items-center gap-2">
                        <Palette class="w-4 h-4" />
                        Hue
                      </label>
                      <Badge variant="outline" class="text-xs">
                        {editSettings.hue}°
                      </Badge>
                    </div>
                    <Slider
                      value={[editSettings.hue]}
                      onValueChange$={([value]) => updateSetting('hue', value)}
                      min={-180}
                      max={180}
                      step={1}
                      class="w-full"
                    />
                  </div>

                  {showAdvancedOptions && (
                    <>
                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <label class="text-sm font-medium">Blur</label>
                          <Badge variant="outline" class="text-xs">
                            {editSettings.blur}px
                          </Badge>
                        </div>
                        <Slider
                          value={[editSettings.blur]}
                          onValueChange$={([value]) => updateSetting('blur', value)}
                          min={0}
                          max={10}
                          step={0.1}
                          class="w-full"
                        />
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <label class="text-sm font-medium">Sepia</label>
                          <Badge variant="outline" class="text-xs">
                            {editSettings.sepia}%
                          </Badge>
                        </div>
                        <Slider
                          value={[editSettings.sepia]}
                          onValueChange$={([value]) => updateSetting('sepia', value)}
                          min={0}
                          max={100}
                          step={1}
                          class="w-full"
                        />
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <label class="text-sm font-medium">Grayscale</label>
                          <Badge variant="outline" class="text-xs">
                            {editSettings.grayscale}%
                          </Badge>
                        </div>
                        <Slider
                          value={[editSettings.grayscale]}
                          onValueChange$={([value]) => updateSetting('grayscale', value)}
                          min={0}
                          max={100}
                          step={1}
                          class="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Filters Tab */}
              <TabsContent value="filters" class="p-4">
                <div class="grid grid-cols-2 gap-3">
                  {filterPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      onClick$={() => applyPreset(preset)}
                      class="h-auto p-4 flex flex-col items-center gap-2 hover:bg-wedding-cream"
                    >
                      <span class="text-2xl">{preset.icon}</span>
                      <span class="text-sm font-medium">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Transform Tab */}
              <TabsContent value="transform" class="p-4 space-y-6">
                <div>
                  <h4 class="text-sm font-medium mb-3">Rotation</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick$={() => rotate('left')}
                      class="flex items-center gap-2"
                    >
                      <RotateCcw class="w-4 h-4" />
                      Rotate Left
                    </Button>
                    <Button
                      variant="outline"
                      onClick$={() => rotate('right')}
                      class="flex items-center gap-2"
                    >
                      <RotateCw class="w-4 h-4" />
                      Rotate Right
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-medium mb-3">Flip</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick$={() => flip('horizontal')}
                      class="flex items-center gap-2"
                    >
                      <FlipHorizontal class="w-4 h-4" />
                      Flip Horizontal
                    </Button>
                    <Button
                      variant="outline"
                      onClick$={() => flip('vertical')}
                      class="flex items-center gap-2"
                    >
                      <FlipVertical class="w-4 h-4" />
                      Flip Vertical
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-medium mb-3">Quick Actions</h4>
                  <div class="space-y-2">
                    <Button
                      variant="outline"
                      onClick$={reset}
                      class="w-full flex items-center gap-2"
                    >
                      <Wand2 class="w-4 h-4" />
                      Auto Enhance
                    </Button>
                    <Button
                      variant="outline"
                      onClick$={() => applyPreset(filterPresets[1])}
                      class="w-full flex items-center gap-2"
                    >
                      <Sparkles class="w-4 h-4" />
                      Apply Vintage Filter
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default PhotoEditor;