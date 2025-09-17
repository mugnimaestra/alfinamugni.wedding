import {
  component$,
  useSignal,
  useStore,
  useTask$,
  type PropsOf,
  Slot,
  $,
  useOnDocument,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

// Hover Card Context Store
interface HoverCardStore {
  isOpen: boolean;
  openDelay?: number;
  closeDelay?: number;
  side?: "top" | "bottom" | "left" | "right";
}

const hoverCardVariants = cva(
  "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in zoom-in-95 fade-in-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  {
    variants: {
      side: {
        top: "data-[side=top]",
        bottom: "data-[side=bottom]",
        left: "data-[side=left]",
        right: "data-[side=right]",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  }
);

export interface HoverCardProps {
  children: any;
  openDelay?: number;
  closeDelay?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const HoverCard = component$<HoverCardProps>(
  ({
    children,
    openDelay = 700,
    closeDelay = 300,
    defaultOpen,
    open,
    onOpenChange,
  }) => {
    const store = useStore<HoverCardStore>({
      isOpen: open ?? defaultOpen ?? false,
      openDelay,
      closeDelay,
      side: "bottom",
    });

    useTask$(({ track }) => {
      track(() => open);
      if (open !== undefined) {
        store.isOpen = open;
      }
    });

    return (
      <div data-hover-card-context={JSON.stringify(store)}>{children}</div>
    );
  }
);

export interface HoverCardTriggerProps extends PropsOf<"div"> {
  asChild?: boolean;
}

export const HoverCardTrigger = component$<HoverCardTriggerProps>(
  ({
    class: className,
    asChild = false,
    onMouseEnter$,
    onMouseLeave$,
    ...props
  }) => {
    const openTimeoutRef = useSignal<number>();
    const closeTimeoutRef = useSignal<number>();

    const handleMouseEnter = $(() => {
      // Clear any close timeout
      if (closeTimeoutRef.value) {
        clearTimeout(closeTimeoutRef.value);
        closeTimeoutRef.value = undefined;
      }

      const context = document.querySelector("[data-hover-card-context]");
      if (context) {
        const store: HoverCardStore = JSON.parse(
          context.getAttribute("data-hover-card-context") || "{}"
        );

        // Set timeout to show hover card
        openTimeoutRef.value = window.setTimeout(() => {
          store.isOpen = true;
          context.setAttribute(
            "data-hover-card-context",
            JSON.stringify(store)
          );
          context.dispatchEvent(new CustomEvent("hover-card-state-change"));
        }, store.openDelay || 700);
      }
    });

    const handleMouseLeave = $(() => {
      // Clear open timeout
      if (openTimeoutRef.value) {
        clearTimeout(openTimeoutRef.value);
        openTimeoutRef.value = undefined;
      }

      const context = document.querySelector("[data-hover-card-context]");
      if (context) {
        const store: HoverCardStore = JSON.parse(
          context.getAttribute("data-hover-card-context") || "{}"
        );

        // Set timeout to hide hover card
        closeTimeoutRef.value = window.setTimeout(() => {
          store.isOpen = false;
          context.setAttribute(
            "data-hover-card-context",
            JSON.stringify(store)
          );
          context.dispatchEvent(new CustomEvent("hover-card-state-change"));
        }, store.closeDelay || 300);
      }
    });

    if (asChild) {
      return (
        <div
          class={className}
          onMouseEnter$={handleMouseEnter}
          onMouseLeave$={handleMouseLeave}
          {...props}
        >
          <Slot />
        </div>
      );
    }

    return (
      <div
        class={className}
        onMouseEnter$={[onMouseEnter$, handleMouseEnter]}
        onMouseLeave$={[onMouseLeave$, handleMouseLeave]}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface HoverCardContentProps extends PropsOf<"div"> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
}

export const HoverCardContent = component$<HoverCardContentProps>(
  ({
    side = "bottom",
    align = "center",
    sideOffset = 4,
    alignOffset = 0,
    class: className,
    onMouseEnter$,
    onMouseLeave$,
    ...props
  }) => {
    const isOpen = useSignal(false);
    const contentRef = useSignal<HTMLDivElement>();
    const closeTimeoutRef = useSignal<number>();

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-hover-card-context]");
        if (context) {
          const store: HoverCardStore = JSON.parse(
            context.getAttribute("data-hover-card-context") || "{}"
          );
          isOpen.value = store.isOpen;
        }
      };

      // Listen for state changes
      document.addEventListener("hover-card-state-change", handleStateChange);

      // Initial state check
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "hover-card-state-change",
          handleStateChange
        );
      });
    });

    const handleMouseEnter = $(() => {
      // Clear any close timeout when hovering over content
      if (closeTimeoutRef.value) {
        clearTimeout(closeTimeoutRef.value);
        closeTimeoutRef.value = undefined;
      }
    });

    const handleMouseLeave = $(() => {
      // Set timeout to hide hover card when leaving content
      const context = document.querySelector("[data-hover-card-context]");
      if (context) {
        const store: HoverCardStore = JSON.parse(
          context.getAttribute("data-hover-card-context") || "{}"
        );

        closeTimeoutRef.value = window.setTimeout(() => {
          store.isOpen = false;
          context.setAttribute(
            "data-hover-card-context",
            JSON.stringify(store)
          );
          context.dispatchEvent(new CustomEvent("hover-card-state-change"));
        }, store.closeDelay || 300);
      }
    });

    // Close on escape
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen.value) {
          const context = document.querySelector("[data-hover-card-context]");
          if (context) {
            const store: HoverCardStore = JSON.parse(
              context.getAttribute("data-hover-card-context") || "{}"
            );
            store.isOpen = false;
            context.setAttribute(
              "data-hover-card-context",
              JSON.stringify(store)
            );
            context.dispatchEvent(new CustomEvent("hover-card-state-change"));
          }
        }
      })
    );

    if (!isOpen.value) return null;

    const getHoverCardPosition = () => {
      const trigger = document
        .querySelector("[data-hover-card-context]")
        ?.querySelector('div, button, [role="button"]');
      if (!trigger || !contentRef.value) return {};

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = contentRef.value.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top: number;
      let left: number | undefined;

      switch (side) {
        case "top":
          top = triggerRect.top - contentRect.height - sideOffset;
          break;
        case "bottom":
          top = triggerRect.bottom + sideOffset;
          break;
        case "left":
          top =
            triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          left = triggerRect.left - contentRect.width - sideOffset;
          break;
        case "right":
          top =
            triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          left = triggerRect.right + sideOffset;
          break;
      }

      // Handle alignment for top/bottom positioning
      if (side === "top" || side === "bottom") {
        switch (align) {
          case "start":
            left = triggerRect.left + alignOffset;
            break;
          case "center":
            left =
              triggerRect.left +
              triggerRect.width / 2 -
              contentRect.width / 2 +
              alignOffset;
            break;
          case "end":
            left = triggerRect.right - contentRect.width - alignOffset;
            break;
        }
      }

      // Ensure hover card stays within viewport
      if (left !== undefined) {
        if (left < 0) left = 0;
        if (left + contentRect.width > viewportWidth)
          left = viewportWidth - contentRect.width;
      }
      if (top < 0) top = 0;
      if (top + contentRect.height > viewportHeight)
        top = viewportHeight - contentRect.height;

      return { top, left: left ?? 0 };
    };

    return (
      <div
        ref={contentRef}
        class={cn(hoverCardVariants({ side }), className)}
        data-state={isOpen.value ? "open" : "closed"}
        data-side={side}
        style={{
          position: "fixed",
          zIndex: 50,
          ...getHoverCardPosition(),
        }}
        onMouseEnter$={[onMouseEnter$, handleMouseEnter]}
        onMouseLeave$={[onMouseLeave$, handleMouseLeave]}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);
