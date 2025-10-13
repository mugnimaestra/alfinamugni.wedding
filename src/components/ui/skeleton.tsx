/**
 * Skeleton Loading Components
 * Provides loading states for better user experience
 */

import { component$, type JSXChildren } from '@builder.io/qwik';

export interface SkeletonProps {
  class?: string;
  width?: string;
  height?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = component$((props: SkeletonProps) => {
  const variantClass = {
    default: 'rounded-md',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  }[props.variant || 'default'];

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }[props.animation || 'pulse'];

  const style = {
    width: props.width || '100%',
    height: props.height || '1rem'
  };

  return (
    <div
      class={`bg-gray-200 ${variantClass} ${animationClass} ${props.class || ''}`}
      style={style}
    />
  );
});

// Text skeleton with multiple lines
export interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lineSpacing?: string;
}

export const TextSkeleton = component$((props: TextSkeletonProps) => {
  const lines = props.lines || 3;
  const lineSpacing = props.lineSpacing || '0.5rem';

  return (
    <div class={`space-y-2 ${props.className || ''}`} style={{ gap: lineSpacing }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1rem"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
});

// Card skeleton
export interface CardSkeletonProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showText?: boolean;
  showActions?: boolean;
  textLines?: number;
  className?: string;
}

export const CardSkeleton = component$((props: CardSkeletonProps) => {
  return (
    <div class={`bg-white rounded-lg shadow-sm p-6 space-y-4 ${props.className || ''}`}>
      {props.showAvatar && (
        <Skeleton variant="circular" width="3rem" height="3rem" />
      )}

      {props.showTitle && (
        <Skeleton height="1.5rem" width="60%" />
      )}

      {props.showSubtitle && (
        <Skeleton height="1rem" width="40%" />
      )}

      {props.showText && (
        <TextSkeleton lines={props.textLines || 3} />
      )}

      {props.showActions && (
        <div class="flex gap-2 justify-end">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      )}
    </div>
  );
});

// RSVP Form skeleton
export const RsvpFormSkeleton = component$(() => {
  return (
    <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div class="space-y-2">
        <Skeleton height="1.5rem" width="40%" />
        <Skeleton height="0.875rem" width="80%" />
      </div>
      
      <div class="space-y-4">
        <div class="space-y-2">
          <Skeleton height="1rem" width="25%" />
          <Skeleton height="2.5rem" width="100%" />
        </div>
        
        <div class="space-y-2">
          <Skeleton height="1rem" width="20%" />
          <Skeleton height="2.5rem" width="100%" />
        </div>
        
        <div class="space-y-2">
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="2.5rem" width="100%" />
        </div>
        
        <div class="space-y-2">
          <Skeleton height="1rem" width="35%" />
          <div class="grid grid-cols-2 gap-4">
            <Skeleton height="2.5rem" width="100%" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
        </div>
      </div>
      
      <Skeleton height="3rem" width="100%" />
    </div>
  );
});

// Gallery skeleton
export const GallerySkeleton = component$(() => {
  return (
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} class="aspect-square">
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
      ))}
    </div>
  );
});

// Wishes section skeleton
export const WishesSkeleton = component$(() => {
  return (
    <div class="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <CardSkeleton
          key={i}
          showAvatar
          showTitle
          showSubtitle
          showText
          textLines={2}
        />
      ))}
    </div>
  );
});

// Wedding details skeleton
export const WeddingDetailsSkeleton = component$(() => {
  return (
    <div class="grid md:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="space-y-4">
          <Skeleton height="2rem" width="60%" />
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="70%" />
        </div>
        
        <div class="space-y-4">
          <Skeleton height="2rem" width="50%" />
          <Skeleton height="1rem" width="85%" />
          <Skeleton height="1rem" width="75%" />
        </div>
      </div>
      
      <div class="space-y-6">
        <div class="space-y-4">
          <Skeleton height="2rem" width="55%" />
          <Skeleton height="1rem" width="90%" />
          <Skeleton height="1rem" width="65%" />
        </div>
        
        <div class="space-y-4">
          <Skeleton height="2rem" width="45%" />
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="70%" />
        </div>
      </div>
    </div>
  );
});

// Loading spinner component
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  class?: string;
}

export const LoadingSpinner = component$((props: LoadingSpinnerProps) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[props.size || 'md'];

  return (
    <div
      class={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClass} ${props.class || ''}`}
      style={{ borderTopColor: props.color || 'currentColor' }}
    />
  );
});

// Loading overlay component
export interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export const LoadingOverlay = component$((props: LoadingOverlayProps) => {
  if (!props.show) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size={props.spinnerSize || 'lg'} />
        {props.message && (
          <p class="text-gray-600 text-center">{props.message}</p>
        )}
      </div>
    </div>
  );
});

// Button loading state
export interface LoadingButtonProps {
  loading?: boolean;
  children?: JSXChildren;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
}

export const LoadingButton = component$((props: LoadingButtonProps) => {
  return (
    <button
      type="button"
      disabled={props.loading || props.disabled}
      class={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-wedding-brown hover:bg-wedding-brown-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wedding-brown disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ''}`}
    >
      {props.loading && (
        <LoadingSpinner size="sm" class="mr-2" />
      )}
      {props.loading ? (props.loadingText || 'Loading...') : props.children}
    </button>
  );
});

// Page loading skeleton
export const PageLoadingSkeleton = component$(() => {
  return (
    <div class="min-h-screen bg-wedding-beige">
      {/* Header skeleton */}
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <Skeleton width="8rem" height="2rem" />
            <div class="hidden md:flex space-x-8">
              <Skeleton width="4rem" height="1rem" />
              <Skeleton width="4rem" height="1rem" />
              <Skeleton width="4rem" height="1rem" />
              <Skeleton width="4rem" height="1rem" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div class="relative h-96">
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center space-y-4">
            <Skeleton width="20rem" height="3rem" />
            <Skeleton width="16rem" height="1.5rem" />
            <Skeleton width="12rem" height="2.5rem" />
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div class="grid md:grid-cols-2 gap-8">
          <WeddingDetailsSkeleton />
        </div>

        <div class="space-y-8">
          <Skeleton height="2rem" width="12rem" />
          <RsvpFormSkeleton />
        </div>

        <div class="space-y-8">
          <Skeleton height="2rem" width="10rem" />
          <GallerySkeleton />
        </div>

        <div class="space-y-8">
          <Skeleton height="2rem" width="8rem" />
          <WishesSkeleton />
        </div>
      </div>

      {/* Footer skeleton */}
      <div class="bg-wedding-brown text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid md:grid-cols-3 gap-8">
            <div class="space-y-4">
              <Skeleton width="6rem" height="1.5rem" />
              <TextSkeleton lines={2} />
            </div>
            <div class="space-y-4">
              <Skeleton width="5rem" height="1.5rem" />
              <TextSkeleton lines={3} />
            </div>
            <div class="space-y-4">
              <Skeleton width="4rem" height="1.5rem" />
              <TextSkeleton lines={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Avatar skeleton
export interface SkeletonAvatarProps {
  size?: 'sm' | 'default' | 'lg';
  shape?: 'circle' | 'square';
  className?: string;
}

export const SkeletonAvatar = component$((props: SkeletonAvatarProps) => {
  const sizeMap = {
    sm: '2rem',
    default: '3rem',
    lg: '4rem'
  };

  const size = sizeMap[props.size || 'default'];
  const variant = props.shape === 'square' ? 'rectangular' : 'circular';

  return (
    <Skeleton
      variant={variant}
      width={size}
      height={size}
      class={props.className}
    />
  );
});

// Button skeleton
export interface SkeletonButtonProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

export const SkeletonButton = component$((props: SkeletonButtonProps) => {
  const sizeMap = {
    sm: { width: '4rem', height: '2rem' },
    default: { width: '6rem', height: '2.5rem' },
    lg: { width: '8rem', height: '3rem' }
  };

  const dimensions = sizeMap[props.size || 'default'];

  return (
    <Skeleton
      width={dimensions.width}
      height={dimensions.height}
      class={props.className}
    />
  );
});

// Table skeleton
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const SkeletonTable = component$((props: SkeletonTableProps) => {
  const rows = props.rows || 5;
  const columns = props.columns || 4;

  return (
    <div class={`space-y-4 ${props.className || ''}`}>
      {props.showHeader && (
        <div class="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={`header-${i}`} height="2rem" width="100%" />
          ))}
        </div>
      )}

      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          class="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="1.5rem" width="100%" />
          ))}
        </div>
      ))}
    </div>
  );
});

// List skeleton
export interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonList = component$((props: SkeletonListProps) => {
  const items = props.items || 4;

  return (
    <div class={`space-y-4 ${props.className || ''}`}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} class="flex items-center space-x-4">
          {props.showAvatar && (
            <SkeletonAvatar size="default" />
          )}
          <div class="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" />
            <Skeleton height="0.875rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
});

// Form skeleton
export interface SkeletonFormProps {
  fields?: number;
  showButtons?: boolean;
  className?: string;
}

export const SkeletonForm = component$((props: SkeletonFormProps) => {
  const fields = props.fields || 4;

  return (
    <div class={`space-y-6 ${props.className || ''}`}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} class="space-y-2">
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="2.5rem" width="100%" />
        </div>
      ))}

      {props.showButtons && (
        <div class="flex gap-4 justify-end">
          <SkeletonButton size="default" />
          <SkeletonButton size="default" />
        </div>
      )}
    </div>
  );
});

// Guest card skeleton (wedding-specific)
export interface SkeletonGuestCardProps {
  className?: string;
}

export const SkeletonGuestCard = component$((props: SkeletonGuestCardProps) => {
  return (
    <div class={`bg-white rounded-lg shadow-sm p-6 space-y-4 ${props.className || ''}`}>
      <div class="flex items-center space-x-4">
        <SkeletonAvatar size="lg" />
        <div class="flex-1 space-y-2">
          <Skeleton height="1.5rem" width="70%" />
          <Skeleton height="1rem" width="50%" />
        </div>
      </div>

      <div class="space-y-2">
        <Skeleton height="1rem" width="40%" />
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="1rem" width="30%" />
      </div>

      <div class="flex gap-2 justify-end">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
});

// Vendor card skeleton (wedding-specific)
export interface SkeletonVendorCardProps {
  className?: string;
}

export const SkeletonVendorCard = component$((props: SkeletonVendorCardProps) => {
  return (
    <div class={`bg-white rounded-lg shadow-sm overflow-hidden ${props.className || ''}`}>
      <Skeleton variant="rectangular" width="100%" height="12rem" />

      <div class="p-6 space-y-4">
        <div class="space-y-2">
          <Skeleton height="1.5rem" width="80%" />
          <Skeleton height="1rem" width="50%" />
        </div>

        <TextSkeleton lines={2} />

        <div class="flex items-center justify-between">
          <Skeleton height="1rem" width="40%" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  );
});

// Photo grid skeleton
export interface SkeletonPhotoGridProps {
  count?: number;
  columns?: number;
  className?: string;
}

export const SkeletonPhotoGrid = component$((props: SkeletonPhotoGridProps) => {
  const count = props.count || 8;
  const columns = props.columns || 4;

  return (
    <div
      class={`grid gap-4 ${props.className || ''}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} class="aspect-square">
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
      ))}
    </div>
  );
});

// Component aliases for backward compatibility
export const SkeletonText = TextSkeleton;
export const SkeletonCard = CardSkeleton;
export const SkeletonRSVPForm = RsvpFormSkeleton;
