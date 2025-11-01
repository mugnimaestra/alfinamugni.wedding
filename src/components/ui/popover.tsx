import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useOnDocument,
  type PropsOf,
  type JSXOutput,
  Slot,
  $,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { LuX } from "@qwikest/icons/lucide";

// Popover Context Store
interface PopoverStore {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

const popoverVariants = cva(
  "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: JSXOutput;
}

export const Popover = component$<PopoverProps>(
  ({ open, onOpenChange, children }) => {
    const store = useStore<PopoverStore>({
      isOpen: open ?? false,
      onOpenChange,
    });

    useTask$(({ track }) => {
      track(() => open);
      if (open !== undefined) {
        store.isOpen = open;
      }
    });

    return <div data-popover-context={JSON.stringify(store)}>{children}</div>;
  }
);

export type PopoverTriggerProps = PropsOf<"button">;

export const PopoverTrigger = component$<PopoverTriggerProps>(
  ({ class: className, onClick$, ...props }) => {
    return (
      <button
        class={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick$={[
          onClick$,
          $((_, element: Element) => {
            const context = element.closest("[data-popover-context]");
            if (context) {
              const store: PopoverStore = JSON.parse(
                context.getAttribute("data-popover-context") || "{}"
              );
              const newIsOpen = !store.isOpen;
              store.isOpen = newIsOpen;
              store.onOpenChange?.(newIsOpen);
              context.setAttribute(
                "data-popover-context",
                JSON.stringify(store)
              );

              // Trigger re-render
              context.dispatchEvent(new CustomEvent("popover-state-change"));
            }
          }),
        ]}
        {...props}
      >
        <Slot />
      </button>
    );
  }
);

export interface PopoverContentProps extends PropsOf<"div"> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
}

export const PopoverContent = component$<PopoverContentProps>(
  ({
    side = "bottom",
    align = "center",
    sideOffset = 4,
    alignOffset = 0,
    avoidCollisions = true,
    class: className,
    ...props
  }) => {
    const isOpen = useSignal(false);
    const contentRef = useSignal<HTMLDivElement>();

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-popover-context]");
        if (context) {
          const store: PopoverStore = JSON.parse(
            context.getAttribute("data-popover-context") || "{}"
          );
          isOpen.value = store.isOpen;
        }
      };

      // Listen for state changes
      document.addEventListener("popover-state-change", handleStateChange);

      // Initial state check
      handleStateChange();

      cleanup(() => {
        document.removeEventListener("popover-state-change", handleStateChange);
      });
    });

    // Close on click outside
    useOnDocument(
      "click",
      $((event: Event) => {
        if (!isOpen.value) return;

        const target = event.target as Element;
        const content = contentRef.value;
        const trigger = document.querySelector(
          '[data-popover-context] button, [data-popover-context] [role="button"]'
        );

        if (
          content &&
          !content.contains(target) &&
          trigger &&
          !trigger.contains(target)
        ) {
          const context = document.querySelector("[data-popover-context]");
          if (context) {
            const store: PopoverStore = JSON.parse(
              context.getAttribute("data-popover-context") || "{}"
            );
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute("data-popover-context", JSON.stringify(store));
            context.dispatchEvent(new CustomEvent("popover-state-change"));
          }
        }
      })
    );

    // Close on escape
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen.value) {
          const context = document.querySelector("[data-popover-context]");
          if (context) {
            const store: PopoverStore = JSON.parse(
              context.getAttribute("data-popover-context") || "{}"
            );
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute("data-popover-context", JSON.stringify(store));
            context.dispatchEvent(new CustomEvent("popover-state-change"));
          }
        }
      })
    );

    if (!isOpen.value) return null;

    const getPopoverPosition = () => {
      const trigger = document.querySelector(
        '[data-popover-context] button, [data-popover-context] [role="button"]'
      );
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

      // Collision detection and adjustment
      if (avoidCollisions) {
        if (left !== undefined) {
          if (left < 0) left = 0;
          if (left + contentRect.width > viewportWidth)
            left = viewportWidth - contentRect.width;
        }
        if (top < 0) top = 0;
        if (top + contentRect.height > viewportHeight)
          top = viewportHeight - contentRect.height;
      }

      return { top, left: left ?? 0 };
    };

    return (
      <div
        ref={contentRef}
        class={cn(popoverVariants({ side }), className)}
        data-state={isOpen.value ? "open" : "closed"}
        data-side={side}
        style={{
          position: "fixed",
          zIndex: 50,
          ...getPopoverPosition(),
        }}
        {...props}
      >
        <Slot />
        <PopoverClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <LuX class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </PopoverClose>
      </div>
    );
  }
);

export type PopoverCloseProps = PropsOf<"button">;

export const PopoverClose = component$<PopoverCloseProps>(
  ({ onClick$, ...props }) => {
    return (
      <button
        {...props}
        onClick$={[
          onClick$,
          $(() => {
            const context = document.querySelector("[data-popover-context]");
            if (context) {
              const store: PopoverStore = JSON.parse(
                context.getAttribute("data-popover-context") || "{}"
              );
              store.isOpen = false;
              store.onOpenChange?.(false);
              context.setAttribute(
                "data-popover-context",
                JSON.stringify(store)
              );
              context.dispatchEvent(new CustomEvent("popover-state-change"));
            }
          }),
        ]}
      >
        <Slot />
      </button>
    );
  }
);

export type PopoverAnchorProps = PropsOf<"div">;

export const PopoverAnchor = component$<PopoverAnchorProps>(({ ...props }) => {
  return (
    <div {...props}>
      <Slot />
    </div>
  );
});
