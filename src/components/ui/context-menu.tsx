import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useOnDocument,
  type PropsOf,
  Slot,
  $,
  type JSXChildren,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { Check, ChevronRight } from "lucide-react";

// Context Menu Context Store
interface ContextMenuStore {
  isOpen: boolean;
  position: { x: number; y: number };
  onOpenChange?: (open: boolean) => void;
}

const contextMenuVariants = cva(
  "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
);

const contextMenuItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "text-destructive focus:bg-destructive/10 focus:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const contextMenuSeparatorVariants = cva("-mx-1 my-1 h-px bg-muted");

export interface ContextMenuProps {
  children: JSXChildren;
}

export const ContextMenu = component$<ContextMenuProps>(({ children }) => {
  const store = useStore<ContextMenuStore>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  return (
    <div data-context-menu-context={JSON.stringify(store)}>{children}</div>
  );
});

export type ContextMenuTriggerProps = PropsOf<"div">;

export const ContextMenuTrigger = component$<ContextMenuTriggerProps>(
  ({ class: className, onContextMenu$, ...props }) => {
    return (
      <div
        class={className}
        onContextMenu$={[
          onContextMenu$,
          $((event: MouseEvent) => {
            event.preventDefault();

            const context = document.querySelector(
              "[data-context-menu-context]"
            );
            if (context) {
              const store: ContextMenuStore = JSON.parse(
                context.getAttribute("data-context-menu-context") || "{}"
              );
              store.isOpen = true;
              store.position = { x: event.clientX, y: event.clientY };
              context.setAttribute(
                "data-context-menu-context",
                JSON.stringify(store)
              );

              // Trigger re-render
              context.dispatchEvent(
                new CustomEvent("context-menu-state-change")
              );
            }
          }),
        ]}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ContextMenuContentProps extends PropsOf<"div"> {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
}

export const ContextMenuContent = component$<ContextMenuContentProps>(
  ({ class: className, onEscapeKeyDown, onPointerDownOutside, ...props }) => {
    const isOpen = useSignal(false);
    const position = useSignal({ x: 0, y: 0 });
    const contentRef = useSignal<HTMLDivElement>();

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-context-menu-context]");
        if (context) {
          const store: ContextMenuStore = JSON.parse(
            context.getAttribute("data-context-menu-context") || "{}"
          );
          isOpen.value = store.isOpen;
          position.value = store.position;
        }
      };

      // Listen for state changes
      document.addEventListener("context-menu-state-change", handleStateChange);

      // Initial state check
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "context-menu-state-change",
          handleStateChange
        );
      });
    });

    // Close on click outside
    useOnDocument(
      "click",
      $((event: Event) => {
        if (!isOpen.value) return;

        const target = event.target as Element;
        const content = contentRef.value;

        if (content && !content.contains(target)) {
          const context = document.querySelector("[data-context-menu-context]");
          if (context) {
            const store: ContextMenuStore = JSON.parse(
              context.getAttribute("data-context-menu-context") || "{}"
            );
            store.isOpen = false;
            context.setAttribute(
              "data-context-menu-context",
              JSON.stringify(store)
            );
            context.dispatchEvent(new CustomEvent("context-menu-state-change"));
          }
        }
      })
    );

    // Close on escape
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen.value) {
          if (onEscapeKeyDown) {
            onEscapeKeyDown(event);
          }

          const context = document.querySelector("[data-context-menu-context]");
          if (context) {
            const store: ContextMenuStore = JSON.parse(
              context.getAttribute("data-context-menu-context") || "{}"
            );
            store.isOpen = false;
            context.setAttribute(
              "data-context-menu-context",
              JSON.stringify(store)
            );
            context.dispatchEvent(new CustomEvent("context-menu-state-change"));
          }
        }
      })
    );

    if (!isOpen.value) return null;

    const getAdjustedPosition = () => {
      if (!contentRef.value) return position.value;

      const contentRect = contentRef.value.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position.value;

      // Adjust if content would overflow viewport
      if (x + contentRect.width > viewportWidth) {
        x = viewportWidth - contentRect.width - 8; // 8px padding from edge
      }
      if (y + contentRect.height > viewportHeight) {
        y = viewportHeight - contentRect.height - 8; // 8px padding from edge
      }

      // Ensure minimum distance from edges
      x = Math.max(8, x);
      y = Math.max(8, y);

      return { x, y };
    };

    return (
      <div
        ref={contentRef}
        class={cn(contextMenuVariants({}), className)}
        data-state={isOpen.value ? "open" : "closed"}
        style={{
          position: "fixed",
          left: `${getAdjustedPosition().x}px`,
          top: `${getAdjustedPosition().y}px`,
          zIndex: 50,
        }}
        onPointerDown$={(event: PointerEvent) => {
          if (onPointerDownOutside) {
            onPointerDownOutside(event);
          }
        }}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ContextMenuItemProps extends PropsOf<"div"> {
  onSelect?: () => void;
  disabled?: boolean;
  inset?: boolean;
}

export const ContextMenuItem = component$<ContextMenuItemProps>(
  ({ class: className, onSelect, disabled, inset, onClick$, ...props }) => {
    return (
      <div
        class={cn(contextMenuItemVariants({}), inset && "pl-8", className)}
        data-disabled={disabled}
        onClick$={[
          onClick$,
          $(() => {
            if (!disabled && onSelect) {
              onSelect();

              // Close context menu after selection
              const context = document.querySelector(
                "[data-context-menu-context]"
              );
              if (context) {
                const store: ContextMenuStore = JSON.parse(
                  context.getAttribute("data-context-menu-context") || "{}"
                );
                store.isOpen = false;
                context.setAttribute(
                  "data-context-menu-context",
                  JSON.stringify(store)
                );
                context.dispatchEvent(
                  new CustomEvent("context-menu-state-change")
                );
              }
            }
          }),
        ]}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ContextMenuCheckboxItemProps extends PropsOf<"div"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const ContextMenuCheckboxItem = component$<ContextMenuCheckboxItemProps>(
  ({ class: className, checked, onCheckedChange, disabled, ...props }) => {
    return (
      <div
        class={cn(contextMenuItemVariants({}), className)}
        data-disabled={disabled}
        onClick$={() => {
          if (!disabled && onCheckedChange) {
            onCheckedChange(!checked);
          }
        }}
        {...props}
      >
        <div class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check class="h-4 w-4" />}
        </div>
        <Slot />
      </div>
    );
  }
);

export type ContextMenuSeparatorProps = PropsOf<"div">;

export const ContextMenuSeparator = component$<ContextMenuSeparatorProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn(contextMenuSeparatorVariants({}), className)} {...props} />
    );
  }
);

export interface ContextMenuLabelProps extends PropsOf<"div"> {
  inset?: boolean;
}

export const ContextMenuLabel = component$<ContextMenuLabelProps>(
  ({ class: className, inset, ...props }) => {
    return (
      <div
        class={cn(
          "px-2 py-1.5 text-sm font-semibold",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ContextMenuSubProps {
  children: JSXChildren;
}

export const ContextMenuSub = component$<ContextMenuSubProps>(
  ({ children }) => {
    return <div data-context-menu-sub-context>{children}</div>;
  }
);

export type ContextMenuSubTriggerProps = PropsOf<"div">;

export const ContextMenuSubTrigger = component$<ContextMenuSubTriggerProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn(contextMenuItemVariants({}), "justify-between", className)}
        {...props}
      >
        <Slot />
        <ChevronRight class="h-4 w-4" />
      </div>
    );
  }
);

export type ContextMenuSubContentProps = PropsOf<"div">;

export const ContextMenuSubContent = component$<ContextMenuSubContentProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn(contextMenuVariants({}), "ml-2", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export type ContextMenuShortcutProps = PropsOf<"span">;

export const ContextMenuShortcut = component$<ContextMenuShortcutProps>(
  ({ class: className, ...props }) => {
    return (
      <span
        class={cn("ml-auto text-xs tracking-widest opacity-60", className)}
        {...props}
      >
        <Slot />
      </span>
    );
  }
);

export type ContextMenuGroupProps = PropsOf<"div">;

export const ContextMenuGroup = component$<ContextMenuGroupProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

export type ContextMenuRadioGroupProps = PropsOf<"div">;

export const ContextMenuRadioGroup = component$<ContextMenuRadioGroupProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

export interface ContextMenuRadioItemProps extends PropsOf<"div"> {
  disabled?: boolean;
}

export const ContextMenuRadioItem = component$<ContextMenuRadioItemProps>(
  ({ class: className, disabled, ...props }) => {
    return (
      <div
        class={cn(contextMenuItemVariants({}), className)}
        data-disabled={disabled}
        {...props}
      >
        <div class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <div class="h-2 w-2 rounded-full bg-current" />
        </div>
        <Slot />
      </div>
    );
  }
);
