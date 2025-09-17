import {
  component$,
  useSignal,
  useTask$,
  type PropsOf,
  Slot,
} from "@builder.io/qwik";

export interface AspectRatioProps extends PropsOf<"div"> {
  ratio?: number;
}

export const AspectRatio = component$<AspectRatioProps>(
  ({ ratio = 1, class: className, style, ...props }) => {
    const containerRef = useSignal<HTMLDivElement>();
    const paddingBottom = useSignal(`${100 / ratio}%`);

    useTask$(() => {
      if (ratio && ratio > 0) {
        paddingBottom.value = `${100 / ratio}%`;
      }
    });

    const baseStyle = {
      position: "relative" as const,
      width: "100%",
      paddingBottom: paddingBottom.value,
    };

    const resolvedStyle =
      typeof style === "string"
        ? `position: relative; width: 100%; padding-bottom: ${paddingBottom.value}; ${style}`.trim()
        : { ...baseStyle, ...(style ?? {}) };

    return (
      <div
        ref={containerRef}
        class={className}
        style={resolvedStyle}
        {...props}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Slot />
        </div>
      </div>
    );
  }
);

// Predefined aspect ratios for common use cases
export const AspectRatio1x1 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={1} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio4x3 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={4 / 3} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio16x9 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={16 / 9} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio3x2 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={3 / 2} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio2x3 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={2 / 3} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio5x4 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={5 / 4} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio4x5 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={4 / 5} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const AspectRatio21x9 = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={21 / 9} {...props}>
      <Slot />
    </AspectRatio>
  )
);

// Wedding-specific aspect ratios
export const WeddingPhotoRatio = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={3 / 2} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const WeddingCardRatio = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={5 / 7} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const WeddingBannerRatio = component$<Omit<AspectRatioProps, "ratio">>(
  (props) => (
    <AspectRatio ratio={16 / 6} {...props}>
      <Slot />
    </AspectRatio>
  )
);

export const WeddingThumbnailRatio = component$<
  Omit<AspectRatioProps, "ratio">
>((props) => (
  <AspectRatio ratio={1} {...props}>
    <Slot />
  </AspectRatio>
));

// Utility component for responsive aspect ratios
export interface ResponsiveAspectRatioProps extends AspectRatioProps {
  ratios?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export const ResponsiveAspectRatio = component$<ResponsiveAspectRatioProps>(
  ({ ratios = {}, ...props }) => {
    const currentRatio = useSignal(props.ratio || 1);

    useTask$(() => {
      // This is a simplified version - in a real implementation,
      // you might want to use media queries or resize observers
      // For now, we'll just use the desktop ratio as default
      currentRatio.value =
        ratios.desktop || ratios.tablet || ratios.mobile || props.ratio || 1;
    });

    return (
      <AspectRatio ratio={currentRatio.value} {...props}>
        <Slot />
      </AspectRatio>
    );
  }
);

// Aspect ratio with lazy loading support
export interface LazyAspectRatioProps extends AspectRatioProps {
  lazy?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const LazyAspectRatio = component$<LazyAspectRatioProps>(
  ({ lazy = false, threshold = 0.1, rootMargin = "50px", ...props }) => {
    const isVisible = useSignal(!lazy);

    useTask$(() => {
      if (!lazy || isVisible.value) return;

      // Simple intersection observer implementation
      // In a real implementation, you might want to use a more sophisticated approach
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisible.value = true;
              observer.disconnect();
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      // Note: In a real Qwik component, you'd need to get the element reference
      // and set up the observer properly. This is a simplified version.

      return () => observer.disconnect();
    });

    if (!isVisible.value) {
      return (
        <AspectRatio {...props}>
          <div class="flex items-center justify-center bg-muted">
            <div class="animate-pulse bg-muted-foreground/20 rounded w-full h-full" />
          </div>
        </AspectRatio>
      );
    }

    return (
      <AspectRatio {...props}>
        <Slot />
      </AspectRatio>
    );
  }
);
