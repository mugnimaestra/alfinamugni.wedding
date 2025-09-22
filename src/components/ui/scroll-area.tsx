import {
  component$,
  useSignal,
  useTask$,
  type PropsOf,
  Slot,
  $,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

const scrollAreaVariants = cva("relative overflow-hidden", {
  variants: {
    type: {
      auto: "",
      always: "",
      scroll: "",
      hover: "",
    },
    orientation: {
      vertical: "overflow-y-auto",
      horizontal: "overflow-x-auto",
      both: "overflow-auto",
    },
  },
  defaultVariants: {
    type: "auto",
    orientation: "vertical",
  },
});

const scrollBarVariants = cva("flex touch-none select-none transition-colors", {
  variants: {
    orientation: {
      vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
      horizontal: "h-2.5 flex-col border-t border-t-transparent p-[1px]",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const scrollThumbVariants = cva("relative flex-1 rounded-full bg-border", {
  variants: {
    variant: {
      default: "bg-border",
      visible: "bg-muted-foreground/50",
      hover: "bg-muted-foreground/30 hover:bg-muted-foreground/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const scrollCornerVariants = cva("absolute bottom-0 right-0 h-2.5 w-2.5");

export interface ScrollAreaProps extends PropsOf<"div"> {
  type?: "auto" | "always" | "scroll" | "hover";
  orientation?: "vertical" | "horizontal" | "both";
  scrollHideDelay?: number;
}

export const ScrollArea = component$<ScrollAreaProps>(
  ({
    type = "auto",
    orientation = "vertical",
    scrollHideDelay = 1000,
    class: className,
    ...props
  }) => {
    const viewportRef = useSignal<HTMLDivElement>();
    const contentRef = useSignal<HTMLDivElement>();

    return (
      <div
        class={cn(scrollAreaVariants({ type, orientation }), className)}
        {...props}
      >
        <ScrollViewport ref={viewportRef}>
          <div ref={contentRef}>
            <Slot />
          </div>
        </ScrollViewport>
        <ScrollBar
          orientation={orientation === "both" ? "vertical" : orientation}
          type={type}
          scrollHideDelay={scrollHideDelay}
        />
        {orientation === "both" && (
          <ScrollBar
            orientation="horizontal"
            type={type}
            scrollHideDelay={scrollHideDelay}
          />
        )}
        {orientation === "both" && <ScrollCorner />}
      </div>
    );
  }
);

export type ScrollViewportProps = PropsOf<"div">

export const ScrollViewport = component$<ScrollViewportProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn("h-full w-full rounded-[inherit]", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export interface ScrollBarProps extends PropsOf<"div"> {
  orientation?: "vertical" | "horizontal";
  type?: "auto" | "always" | "scroll" | "hover";
  scrollHideDelay?: number;
}

export const ScrollBar = component$<ScrollBarProps>(
  ({
    orientation = "vertical",
    type = "auto",
    scrollHideDelay = 1000,
    class: className,
    ...props
  }) => {
    const scrollbarRef = useSignal<HTMLDivElement>();
    const thumbRef = useSignal<HTMLDivElement>();
    const isVisible = useSignal(type === "always");
    const hideTimeoutRef = useSignal<number>();

    useTask$(() => {
      const updateThumb = () => {
        if (!scrollbarRef.value || !thumbRef.value) return;

        const scrollbar = scrollbarRef.value;
        const thumb = thumbRef.value;
        const viewport = scrollbar.parentElement?.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;

        if (!viewport) return;

        const isVertical = orientation === "vertical";
        const scrollSize = isVertical
          ? viewport.scrollHeight
          : viewport.scrollWidth;
        const clientSize = isVertical
          ? viewport.clientHeight
          : viewport.clientWidth;
        const scrollPos = isVertical ? viewport.scrollTop : viewport.scrollLeft;

        if (scrollSize <= clientSize) {
          thumb.style.display = "none";
          return;
        }

        thumb.style.display = "block";
        const thumbSize = (clientSize / scrollSize) * 100;
        const thumbPos =
          (scrollPos / (scrollSize - clientSize)) * (100 - thumbSize);

        if (isVertical) {
          thumb.style.height = `${thumbSize}%`;
          thumb.style.transform = `translateY(${thumbPos}%)`;
        } else {
          thumb.style.width = `${thumbSize}%`;
          thumb.style.transform = `translateX(${thumbPos}%)`;
        }
      };

      const handleScroll = () => {
        if (type === "hover") {
          isVisible.value = true;

          if (hideTimeoutRef.value) {
            clearTimeout(hideTimeoutRef.value);
          }

          hideTimeoutRef.value = window.setTimeout(() => {
            isVisible.value = false;
          }, scrollHideDelay);
        }

        updateThumb();
      };

      const viewport = scrollbarRef.value?.parentElement?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;

      if (viewport) {
        viewport.addEventListener("scroll", handleScroll);
        updateThumb();

        return () => {
          viewport.removeEventListener("scroll", handleScroll);
          if (hideTimeoutRef.value) {
            clearTimeout(hideTimeoutRef.value);
          }
        };
      }
    });

    const handleMouseEnter = $(() => {
      if (type === "hover") {
        isVisible.value = true;

        if (hideTimeoutRef.value) {
          clearTimeout(hideTimeoutRef.value);
        }
      }
    });

    const handleMouseLeave = $(() => {
      if (type === "hover") {
        hideTimeoutRef.value = window.setTimeout(() => {
          isVisible.value = false;
        }, scrollHideDelay);
      }
    });

    return (
      <div
        ref={scrollbarRef}
        class={cn(
          scrollBarVariants({ orientation }),
          !isVisible.value && type === "hover" && "opacity-0",
          className
        )}
        onMouseEnter$={handleMouseEnter}
        onMouseLeave$={handleMouseLeave}
        {...props}
      >
        <ScrollThumb
          ref={thumbRef}
          orientation={orientation}
          variant={type === "hover" ? "hover" : "default"}
        />
      </div>
    );
  }
);

export interface ScrollThumbProps extends PropsOf<"div"> {
  orientation?: "vertical" | "horizontal";
  variant?: "default" | "visible" | "hover";
}

export const ScrollThumb = component$<ScrollThumbProps>(
  ({
    orientation = "vertical",
    variant = "default",
    class: className,
    ...props
  }) => {
    return (
      <div
        class={cn(
          scrollThumbVariants({ variant }),
          orientation === "horizontal" && "flex-row",
          className
        )}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export type ScrollCornerProps = PropsOf<"div">;

export const ScrollCorner = component$<ScrollCornerProps>(
  ({ class: className, ...props }) => {
    return <div class={cn(scrollCornerVariants({}), className)} {...props} />;
  }
);

// Utility components for common scroll area patterns

export type AutoScrollAreaProps = Omit<ScrollAreaProps, "type">

export const AutoScrollArea = component$<AutoScrollAreaProps>((props) => (
  <ScrollArea type="auto" {...props}>
    <Slot />
  </ScrollArea>
));

export type AlwaysScrollAreaProps = Omit<ScrollAreaProps, "type">

export const AlwaysScrollArea = component$<AlwaysScrollAreaProps>((props) => (
  <ScrollArea type="always" {...props}>
    <Slot />
  </ScrollArea>
));

export type HoverScrollAreaProps = Omit<ScrollAreaProps, "type">

export const HoverScrollArea = component$<HoverScrollAreaProps>((props) => (
  <ScrollArea type="hover" {...props}>
    <Slot />
  </ScrollArea>
));

// Vertical scroll area (most common)
export type VerticalScrollAreaProps = Omit<ScrollAreaProps, "orientation">

export const VerticalScrollArea = component$<VerticalScrollAreaProps>(
  (props) => (
    <ScrollArea orientation="vertical" {...props}>
      <Slot />
    </ScrollArea>
  )
);

// Horizontal scroll area
export type HorizontalScrollAreaProps = Omit<ScrollAreaProps, "orientation">

export const HorizontalScrollArea = component$<HorizontalScrollAreaProps>(
  (props) => (
    <ScrollArea orientation="horizontal" {...props}>
      <Slot />
    </ScrollArea>
  )
);

// Both directions scroll area
export type BothScrollAreaProps = Omit<ScrollAreaProps, "orientation">

export const BothScrollArea = component$<BothScrollAreaProps>((props) => (
  <ScrollArea orientation="both" {...props}>
    <Slot />
  </ScrollArea>
));
