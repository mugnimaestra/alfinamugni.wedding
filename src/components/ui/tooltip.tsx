import {
  component$,
  useSignal,
  useStore,
  useTask$,
  type PropsOf,
  type JSXOutput,
  Slot,
  $,
  useOnDocument,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

// Tooltip Context Store
interface TooltipStore {
  isOpen: boolean;
  content: string;
  delayDuration?: number;
  side?: "top" | "bottom" | "left" | "right";
}

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
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
      side: "top",
    },
  }
);

export interface TooltipProps {
  children: JSXOutput;
  delayDuration?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip = component$<TooltipProps>(
  ({ children, delayDuration = 700, defaultOpen, open }) => {
    const store = useStore<TooltipStore>({
      isOpen: open ?? defaultOpen ?? false,
      content: "",
      delayDuration,
      side: "top",
    });

    useTask$(({ track }) => {
      track(() => open);
      if (open !== undefined) {
        store.isOpen = open;
      }
    });

    return <div data-tooltip-context={JSON.stringify(store)}>{children}</div>;
  }
);

export interface TooltipTriggerProps extends PropsOf<"button"> {
  asChild?: boolean;
}

export const TooltipTrigger = component$<TooltipTriggerProps>(
  ({
    class: className,
    asChild = false,
    onMouseEnter$,
    onMouseLeave$,
    ...props
  }) => {
    const timeoutRef = useSignal<number>();

    const handleMouseEnter = $(() => {
      // Clear any existing timeout
      if (timeoutRef.value) {
        clearTimeout(timeoutRef.value);
      }

      const context = document.querySelector("[data-tooltip-context]");
      if (context) {
        const store: TooltipStore = JSON.parse(
          context.getAttribute("data-tooltip-context") || "{}"
        );

        // Set timeout to show tooltip
        timeoutRef.value = window.setTimeout(() => {
          store.isOpen = true;
          context.setAttribute("data-tooltip-context", JSON.stringify(store));
          context.dispatchEvent(new CustomEvent("tooltip-state-change"));
        }, store.delayDuration || 700);
      }
    });

    const handleMouseLeave = $(() => {
      // Clear timeout
      if (timeoutRef.value) {
        clearTimeout(timeoutRef.value);
        timeoutRef.value = undefined;
      }

      const context = document.querySelector("[data-tooltip-context]");
      if (context) {
        const store: TooltipStore = JSON.parse(
          context.getAttribute("data-tooltip-context") || "{}"
        );
        store.isOpen = false;
        context.setAttribute("data-tooltip-context", JSON.stringify(store));
        context.dispatchEvent(new CustomEvent("tooltip-state-change"));
      }
    });

    if (asChild) {
      return (
        <div onMouseEnter$={handleMouseEnter} onMouseLeave$={handleMouseLeave}>
          <Slot />
        </div>
      );
    }

    return (
      <button
        class={className}
        onMouseEnter$={[onMouseEnter$, handleMouseEnter]}
        onMouseLeave$={[onMouseLeave$, handleMouseLeave]}
        {...props}
      >
        <Slot />
      </button>
    );
  }
);

export interface TooltipContentProps extends PropsOf<"div"> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export const TooltipContent = component$<TooltipContentProps>(
  ({ side = "top", sideOffset = 4, class: className, ...props }) => {
    const isOpen = useSignal(false);
    const contentRef = useSignal<HTMLDivElement>();

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-tooltip-context]");
        if (context) {
          const store: TooltipStore = JSON.parse(
            context.getAttribute("data-tooltip-context") || "{}"
          );
          isOpen.value = store.isOpen;
        }
      };

      // Listen for state changes
      document.addEventListener("tooltip-state-change", handleStateChange);

      // Initial state check
      handleStateChange();

      cleanup(() => {
        document.removeEventListener("tooltip-state-change", handleStateChange);
      });
    });

    // Close on escape
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen.value) {
          const context = document.querySelector("[data-tooltip-context]");
          if (context) {
            const store: TooltipStore = JSON.parse(
              context.getAttribute("data-tooltip-context") || "{}"
            );
            store.isOpen = false;
            context.setAttribute("data-tooltip-context", JSON.stringify(store));
            context.dispatchEvent(new CustomEvent("tooltip-state-change"));
          }
        }
      })
    );

    if (!isOpen.value) return null;

    const getTooltipPosition = () => {
      const trigger = document
        .querySelector("[data-tooltip-context]")
        ?.querySelector('button, [role="button"], div');
      if (!trigger || !contentRef.value) return {};

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = contentRef.value.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top: number;
      let left: number;

      switch (side) {
        case "top":
          top = triggerRect.top - contentRect.height - sideOffset;
          left =
            triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + sideOffset;
          left =
            triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
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

      // Ensure tooltip stays within viewport
      if (left < 0) left = 0;
      if (left + contentRect.width > viewportWidth)
        left = viewportWidth - contentRect.width;
      if (top < 0) top = 0;
      if (top + contentRect.height > viewportHeight)
        top = viewportHeight - contentRect.height;

      return { top, left };
    };

    return (
      <div
        ref={contentRef}
        class={cn(tooltipVariants({ side }), className)}
        data-state={isOpen.value ? "open" : "closed"}
        data-side={side}
        style={{
          position: "fixed",
          zIndex: 50,
          ...getTooltipPosition(),
        }}
        role="tooltip"
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export type TooltipProviderProps = PropsOf<"div">;

export const TooltipProvider = component$<TooltipProviderProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);
