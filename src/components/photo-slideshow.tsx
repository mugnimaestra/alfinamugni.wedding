/**
 * Photo Slideshow Component
 * Week 6 Implementation - Photo Slideshow Functionality
 */

import { component$, useSignal, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import {
  LuPlay,
  LuPause,
  LuSkipBack,
  LuSkipForward,
  LuVolume2,
  LuVolumeX,
  LuMaximize2,
  LuMinimize2,
  LuSettings,
  LuShuffle,
  LuRepeat,
  LuShare2,
  LuDownload,
  LuImage as LuImageIcon
} from '@qwikest/icons/lucide';

interface Slide {
  id: string;
  url: string;
  title?: string;
  description?: string;
  duration?: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'flip';
  music?: string;
}

interface SlideshowSettings {
  autoPlay: boolean;
  loop: boolean;
  shuffle: boolean;
  showControls: boolean;
  showProgress: boolean;
  showThumbnails: boolean;
  transitionSpeed: number;
  slideDuration: number;
  volume: number;
  fullscreen: boolean;
  pictureInPicture: boolean;
  theme: 'light' | 'dark' | 'wedding';
}

export interface PhotoSlideshowProps {
  slides: Slide[];
  onSlideChange?: (slideIndex: number, slide: Slide) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  autoStart?: boolean;
  showSettings?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
}

export const PhotoSlideshow = component$<PhotoSlideshowProps>((props) => {
  const {
    slides,
    onSlideChange,
    onPlay,
    onPause,
    onEnd,
    autoStart = false,
    showSettings = true,
    allowDownload = true,
    allowShare = true
  } = props;

  const containerRef = useSignal<HTMLDivElement>();
  const canvasRef = useSignal<HTMLCanvasElement>();
  const audioRef = useSignal<HTMLAudioElement>();
  
  const currentSlideIndex = useSignal(0);
  const isPlaying = useSignal(autoStart);
  const isFullscreen = useSignal(false);
  const isMuted = useSignal(false);
  const showSettingsPanel = useSignal(false);
  const progress = useSignal(0);
  const timeRemaining = useSignal(0);
  
  const settings = useStore<SlideshowSettings>({
    autoPlay: autoStart,
    loop: true,
    shuffle: false,
    showControls: true,
    showProgress: true,
    showThumbnails: false,
    transitionSpeed: 1,
    slideDuration: 5,
    volume: 0.7,
    fullscreen: false,
    pictureInPicture: false,
    theme: 'wedding'
  });

  let intervalId: number | undefined;
  let transitionTimeout: number | undefined;

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => slides.length);
    track(() => currentSlideIndex.value);
    track(() => isPlaying.value);
    track(() => settings.slideDuration);

    if (isPlaying.value && slides.length > 0) {
      startSlideshow();
    } else {
      stopSlideshow();
    }

    cleanup(() => {
      stopSlideshow();
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
      }
    });
  });

  const startSlideshow = () => {
    stopSlideshow();
    
    const slideDuration = settings.slideDuration * 1000;
    const startTime = Date.now();
    
    intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress.value = (elapsed % slideDuration) / slideDuration;
      timeRemaining.value = Math.max(0, slideDuration - (elapsed % slideDuration));
      
      if (elapsed % slideDuration < 100) {
        nextSlide();
      }
    }, 100);
  };

  const stopSlideshow = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  const nextSlide = $(() => {
    if (slides.length === 0) return;

    let nextIndex = currentSlideIndex.value + 1;
    
    if (nextIndex >= slides.length) {
      if (settings.loop) {
        nextIndex = 0;
      } else {
        isPlaying.value = false;
        onEnd?.();
        return;
      }
    }

    if (settings.shuffle) {
      nextIndex = Math.floor(Math.random() * slides.length);
    }

    goToSlide(nextIndex);
  });

  const previousSlide = $(() => {
    if (slides.length === 0) return;

    let prevIndex = currentSlideIndex.value - 1;
    
    if (prevIndex < 0) {
      if (settings.loop) {
        prevIndex = slides.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    goToSlide(prevIndex);
  });

  const goToSlide = $(async (index: number) => {
    if (index < 0 || index >= slides.length) return;

    const currentSlide = slides[currentSlideIndex.value];
    const nextSlide = slides[index];

    // Apply transition
    await applyTransition(currentSlide, nextSlide);
    
    currentSlideIndex.value = index;
    progress.value = 0;
    timeRemaining.value = settings.slideDuration * 1000;

    onSlideChange?.(index, nextSlide);

    // Load background music if specified
    if (nextSlide.music && audioRef.value) {
      audioRef.value.src = nextSlide.music;
      audioRef.value.volume = settings.volume;
      if (!isMuted.value) {
        audioRef.value.play();
      }
    }
  });

  const applyTransition = async (fromSlide: Slide, toSlide: Slide): Promise<void> => {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d')!;
    const transition = toSlide.transition || 'fade';
    const duration = settings.transitionSpeed * 1000;

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply transition effect
        switch (transition) {
          case 'fade':
            applyFadeTransition(ctx, fromSlide, toSlide, progress);
            break;
          case 'slide':
            applySlideTransition(ctx, fromSlide, toSlide, progress);
            break;
          case 'zoom':
            applyZoomTransition(ctx, fromSlide, toSlide, progress);
            break;
          case 'flip':
            applyFlipTransition(ctx, fromSlide, toSlide, progress);
            break;
          default:
            applyFadeTransition(ctx, fromSlide, toSlide, progress);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  };

  const applyFadeTransition = (
    ctx: CanvasRenderingContext2D,
    fromSlide: Slide,
    toSlide: Slide,
    progress: number
  ) => {
    // Draw from slide with decreasing opacity
    ctx.globalAlpha = 1 - progress;
    drawSlideImage(ctx, fromSlide);
    
    // Draw to slide with increasing opacity
    ctx.globalAlpha = progress;
    drawSlideImage(ctx, toSlide);
    
    ctx.globalAlpha = 1;
  };

  const applySlideTransition = (
    ctx: CanvasRenderingContext2D,
    fromSlide: Slide,
    toSlide: Slide,
    progress: number
  ) => {
    const canvas = ctx.canvas;
    
    // Slide from left to right
    ctx.save();
    ctx.translate(-canvas.width * progress, 0);
    drawSlideImage(ctx, fromSlide);
    ctx.restore();
    
    ctx.save();
    ctx.translate(canvas.width * (1 - progress), 0);
    drawSlideImage(ctx, toSlide);
    ctx.restore();
  };

  const applyZoomTransition = (
    ctx: CanvasRenderingContext2D,
    fromSlide: Slide,
    toSlide: Slide,
    progress: number
  ) => {
    const canvas = ctx.canvas;
    const scale = 1 + progress;
    
    // Zoom out from slide
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1 / scale, 1 / scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.globalAlpha = 1 - progress;
    drawSlideImage(ctx, fromSlide);
    ctx.restore();
    
    // Zoom in to slide
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.globalAlpha = progress;
    drawSlideImage(ctx, toSlide);
    ctx.restore();
    
    ctx.globalAlpha = 1;
  };

  const applyFlipTransition = (
    ctx: CanvasRenderingContext2D,
    fromSlide: Slide,
    toSlide: Slide,
    progress: number
  ) => {
    const canvas = ctx.canvas;
    const scaleX = Math.cos(progress * Math.PI);
    
    // Flip from slide
    ctx.save();
    ctx.translate(canvas.width / 2, 0);
    ctx.scale(scaleX, 1);
    ctx.translate(-canvas.width / 2, 0);
    ctx.globalAlpha = scaleX > 0 ? 1 : 0;
    drawSlideImage(ctx, fromSlide);
    ctx.restore();
    
    // Flip to slide
    ctx.save();
    ctx.translate(canvas.width / 2, 0);
    ctx.scale(-scaleX, 1);
    ctx.translate(-canvas.width / 2, 0);
    ctx.globalAlpha = scaleX < 0 ? 1 : 0;
    drawSlideImage(ctx, toSlide);
    ctx.restore();
    
    ctx.globalAlpha = 1;
  };

  const drawSlideImage = (ctx: CanvasRenderingContext2D, slide: Slide) => {
    const canvas = ctx.canvas;
    const img = new Image();
    
    img.onload = () => {
      // Calculate aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let drawX = 0;
      let drawY = 0;
      
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawHeight = canvas.width / imgAspect;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        // Image is taller than canvas
        drawWidth = canvas.height * imgAspect;
        drawX = (canvas.width - drawWidth) / 2;
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };
    
    img.src = slide.url;
  };

  const togglePlayPause = $(() => {
    isPlaying.value = !isPlaying.value;
    
    if (isPlaying.value) {
      onPlay?.();
      if (audioRef.value && !audioRef.value.paused) {
        audioRef.value.play();
      }
    } else {
      onPause?.();
      if (audioRef.value && !audioRef.value.paused) {
        audioRef.value.pause();
      }
    }
  });

  const toggleMute = $(() => {
    isMuted.value = !isMuted.value;
    
    if (audioRef.value) {
      audioRef.value.muted = isMuted.value;
    }
  });

  const toggleFullscreen = $(async () => {
    if (!containerRef.value) return;

    if (!isFullscreen.value) {
      try {
        await containerRef.value.requestFullscreen();
        isFullscreen.value = true;
      } catch (error) {
        console.warn('Fullscreen not supported:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        isFullscreen.value = false;
      } catch (error) {
        console.warn('Error exiting fullscreen:', error);
      }
    }
  });

  const downloadCurrentSlide = $(() => {
    const currentSlide = slides[currentSlideIndex.value];
    if (!currentSlide) return;

    const link = document.createElement('a');
    link.download = `slide-${currentSlideIndex.value + 1}.jpg`;
    link.href = currentSlide.url;
    link.click();
  });

  const shareCurrentSlide = $(async () => {
    const currentSlide = slides[currentSlideIndex.value];
    if (!currentSlide) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSlide.title || 'Wedding Photo',
          text: currentSlide.description || 'Beautiful wedding memory',
          url: currentSlide.url
        });
      } catch (error) {
        console.warn('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentSlide.url);
    }
  });

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSlide = slides[currentSlideIndex.value];

  return (
    <div 
      ref={containerRef}
      class={`
        relative w-full h-full bg-black overflow-hidden
        ${settings.theme === 'dark' ? 'bg-gray-900' : ''}
        ${settings.theme === 'wedding' ? 'bg-gradient-to-br from-wedding-cream to-wedding-brown' : ''}
      `}
    >
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        class="w-full h-full object-contain"
        width={1920}
        height={1080}
      />

      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        class="hidden"
      />

      {/* Top Controls */}
      {settings.showControls && (
        <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div class="flex items-center justify-between text-white">
            <div class="flex items-center gap-4">
              <h3 class="text-lg font-semibold">
                {currentSlide?.title || `Slide ${currentSlideIndex.value + 1}`}
              </h3>
              {currentSlide?.description && (
                <p class="text-sm opacity-80">{currentSlide.description}</p>
              )}
            </div>
            
            <div class="flex items-center gap-2">
              {allowShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick$={shareCurrentSlide}
                  class="text-white hover:bg-white/20"
                >
                  <LuShare2 class="w-4 h-4" />
                </Button>
              )}

              {allowDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick$={downloadCurrentSlide}
                  class="text-white hover:bg-white/20"
                >
                  <LuDownload class="w-4 h-4" />
                </Button>
              )}

              {showSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick$={() => showSettingsPanel.value = !showSettingsPanel.value}
                  class="text-white hover:bg-white/20"
                >
                  <LuSettings class="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick$={toggleFullscreen}
                class="text-white hover:bg-white/20"
              >
                {isFullscreen.value ? (
                  <LuMinimize2 class="w-4 h-4" />
                ) : (
                  <LuMaximize2 class="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      {settings.showControls && (
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div class="flex items-center gap-4 text-white">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick$={previousSlide}
              class="text-white hover:bg-white/20"
            >
              <LuSkipBack class="w-4 h-4" />
            </Button>

            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick$={togglePlayPause}
              class="text-white hover:bg-white/20"
            >
              {isPlaying.value ? (
                <LuPause class="w-4 h-4" />
              ) : (
                <LuPlay class="w-4 h-4" />
              )}
            </Button>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick$={nextSlide}
              class="text-white hover:bg-white/20"
            >
              <LuSkipForward class="w-4 h-4" />
            </Button>

            {/* Progress Bar */}
            {settings.showProgress && (
              <div class="flex-1 flex items-center gap-2">
                <span class="text-xs">{formatTime(timeRemaining.value)}</span>
                <div class="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-white transition-all duration-300"
                    style={{ width: `${progress.value * 100}%` }}
                  />
                </div>
                <span class="text-xs">{formatTime(settings.slideDuration * 1000)}</span>
              </div>
            )}

            {/* Volume Control */}
            <Button
              variant="ghost"
              size="sm"
              onClick$={toggleMute}
              class="text-white hover:bg-white/20"
            >
              {isMuted.value ? (
                <LuVolumeX class="w-4 h-4" />
              ) : (
                <LuVolume2 class="w-4 h-4" />
              )}
            </Button>

            {/* Loop/Shuffle Indicators */}
            <div class="flex items-center gap-1">
              {settings.loop && (
                <Badge variant="secondary" class="text-xs">
                  <LuRepeat class="w-3 h-3" />
                </Badge>
              )}
              {settings.shuffle && (
                <Badge variant="secondary" class="text-xs">
                  <LuShuffle class="w-3 h-3" />
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide Counter */}
      <div class="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-sm bg-black/50 px-2 py-1 rounded">
        {currentSlideIndex.value + 1} / {slides.length}
      </div>

      {/* Settings Panel */}
      {showSettingsPanel.value && (
        <Card class="absolute top-20 right-4 w-80 p-4 bg-white/95 backdrop-blur">
          <h4 class="font-semibold mb-4">Slideshow Settings</h4>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Auto Play</label>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange$={(e) => settings.autoPlay = (e.target as HTMLInputElement).checked}
                class="w-4 h-4"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Loop</label>
              <input
                type="checkbox"
                checked={settings.loop}
                onChange$={(e) => settings.loop = (e.target as HTMLInputElement).checked}
                class="w-4 h-4"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Shuffle</label>
              <input
                type="checkbox"
                checked={settings.shuffle}
                onChange$={(e) => settings.shuffle = (e.target as HTMLInputElement).checked}
                class="w-4 h-4"
              />
            </div>

            <div>
              <label class="text-sm font-medium">Slide Duration: {settings.slideDuration}s</label>
              <Slider
                value={[settings.slideDuration]}
                onValueChange$={([value]) => settings.slideDuration = value}
                min={1}
                max={30}
                step={1}
                class="w-full mt-1"
              />
            </div>

            <div>
              <label class="text-sm font-medium">Transition Speed: {settings.transitionSpeed}s</label>
              <Slider
                value={[settings.transitionSpeed]}
                onValueChange$={([value]) => settings.transitionSpeed = value}
                min={0.5}
                max={3}
                step={0.1}
                class="w-full mt-1"
              />
            </div>

            <div>
              <label class="text-sm font-medium">Volume: {Math.round(settings.volume * 100)}%</label>
              <Slider
                value={[settings.volume * 100]}
                onValueChange$={([value]) => {
                  settings.volume = value / 100;
                  if (audioRef.value) {
                    audioRef.value.volume = settings.volume;
                  }
                }}
                min={0}
                max={100}
                step={1}
                class="w-full mt-1"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Thumbnail Strip */}
      {settings.showThumbnails && slides.length > 1 && (
        <div class="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick$={() => goToSlide(index)}
              class={`
                w-16 h-12 rounded overflow-hidden border-2 transition-all
                ${index === currentSlideIndex.value 
                  ? 'border-wedding-accent scale-110' 
                  : 'border-transparent hover:border-white/50'
                }
              `}
            >
              <img
                src={slide.url}
                alt={`Slide ${index + 1}`}
                width="64"
                height="48"
                class="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {slides.length === 0 && (
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center text-white">
            <LuImageIcon class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 class="text-xl font-semibold mb-2">No slides available</h3>
            <p class="opacity-80">Add photos to start the slideshow</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default PhotoSlideshow;