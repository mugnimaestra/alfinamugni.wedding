import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useOnDocument,
  type PropsOf,
  Slot,
  $,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ChevronRight, Check } from "lucide-react";

// Dropdown Menu Context Store
interface DropdownMenuStore {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

const dropdownMenuVariants = cva(
  "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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

const dropdownMenuItemVariants = cva(
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

const dropdownMenuSeparatorVariants = cva("-mx-1 my-1 h-px bg-muted");

export interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: any;
}

export const DropdownMenu = component$<DropdownMenuProps>(
  ({ open, onOpenChange, children }) => {
    const store = useStore<DropdownMenuStore>({
      isOpen: open ?? false,
      onOpenChange,
    });

    useTask$(({ track }) => {
      track(() => open);
      if (open !== undefined) {
        store.isOpen = open;
      }
    });

    return <div data-dropdown-context={JSON.stringify(store)}>{children}</div>;
  }
);

export type DropdownMenuTriggerProps = PropsOf<"button">;

export const DropdownMenuTrigger = component$<DropdownMenuTriggerProps>(
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
            const context = element.closest("[data-dropdown-context]");
            if (context) {
              const store: DropdownMenuStore = JSON.parse(
                context.getAttribute("data-dropdown-context") || "{}"
              );
              const newIsOpen = !store.isOpen;
              store.isOpen = newIsOpen;
              store.onOpenChange?.(newIsOpen);
              context.setAttribute(
                "data-dropdown-context",
                JSON.stringify(store)
              );

              // Trigger re-render
              context.dispatchEvent(new CustomEvent("dropdown-state-change"));
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

export interface DropdownMenuContentProps extends PropsOf<"div"> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const DropdownMenuContent = component$<DropdownMenuContentProps>(
  ({ side = "bottom", align = "start", class: className, ...props }) => {
    const isOpen = useSignal(false);
    const contentRef = useSignal<HTMLDivElement>();

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-dropdown-context]");
        if (context) {
          const store: DropdownMenuStore = JSON.parse(
            context.getAttribute("data-dropdown-context") || "{}"
          );
          isOpen.value = store.isOpen;
        }
      };

      // Listen for state changes
      document.addEventListener("dropdown-state-change", handleStateChange);

      // Initial state check
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "dropdown-state-change",
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
        const context = document.querySelector("[data-dropdown-context]");

        if (content && !content.contains(target)) {
          if (context) {
            const store: DropdownMenuStore = JSON.parse(
              context.getAttribute("data-dropdown-context") || "{}"
            );
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute(
              "data-dropdown-context",
              JSON.stringify(store)
            );
            context.dispatchEvent(new CustomEvent("dropdown-state-change"));
          }
        }
      })
    );

    // Close on escape
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen.value) {
          const context = document.querySelector("[data-dropdown-context]");
          if (context) {
            const store: DropdownMenuStore = JSON.parse(
              context.getAttribute("data-dropdown-context") || "{}"
            );
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute(
              "data-dropdown-context",
              JSON.stringify(store)
            );
            context.dispatchEvent(new CustomEvent("dropdown-state-change"));
          }
        }
      })
    );

    if (!isOpen.value) return null;

    return (
      <div
        ref={contentRef}
        class={cn(dropdownMenuVariants({ side }), className)}
        data-side={side}
        style={{
          position: "absolute",
          top: side === "bottom" ? "100%" : side === "top" ? "auto" : "50%",
          bottom: side === "top" ? "100%" : "auto",
          left: align === "center" ? "50%" : align === "end" ? "auto" : "0",
          right: align === "end" ? "0" : "auto",
          transform: align === "center" ? "translateX(-50%)" : "none",
          zIndex: 50,
        }}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface DropdownMenuItemProps extends PropsOf<"div"> {
  onSelect?: () => void;
  disabled?: boolean;
}

export const DropdownMenuItem = component$<DropdownMenuItemProps>(
  ({ class: className, onSelect, disabled, onClick$, ...props }) => {
    return (
      <div
        class={cn(dropdownMenuItemVariants({}), className)}
        data-disabled={disabled}
        onClick$={[
          onClick$,
          $(() => {
            if (!disabled && onSelect) {
              onSelect();

              // Close dropdown after selection
              const context = document.querySelector("[data-dropdown-context]");
              if (context) {
                const store: DropdownMenuStore = JSON.parse(
                  context.getAttribute("data-dropdown-context") || "{}"
                );
                store.isOpen = false;
                store.onOpenChange?.(false);
                context.setAttribute(
                  "data-dropdown-context",
                  JSON.stringify(store)
                );
                context.dispatchEvent(new CustomEvent("dropdown-state-change"));
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

export interface DropdownMenuCheckboxItemProps extends PropsOf<"div"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const DropdownMenuCheckboxItem =
  component$<DropdownMenuCheckboxItemProps>(
    ({ class: className, checked, onCheckedChange, disabled, ...props }) => {
      return (
        <div
          class={cn(dropdownMenuItemVariants({}), className)}
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

export interface DropdownMenuRadioItemProps extends PropsOf<"div"> {
  disabled?: boolean;
}

export const DropdownMenuRadioItem = component$<DropdownMenuRadioItemProps>(
  ({ class: className, disabled, ...props }) => {
    return (
      <div
        class={cn(dropdownMenuItemVariants({}), className)}
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

export interface DropdownMenuLabelProps extends PropsOf<"div"> {
  inset?: boolean;
}

export const DropdownMenuLabel = component$<DropdownMenuLabelProps>(
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

export type DropdownMenuSeparatorProps = PropsOf<"div">;

export const DropdownMenuSeparator = component$<DropdownMenuSeparatorProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn(dropdownMenuSeparatorVariants({}), className)}
        {...props}
      />
    );
  }
);

export interface DropdownMenuSubProps {
  children: any;
}

export const DropdownMenuSub = component$<DropdownMenuSubProps>(
  ({ children }) => {
    return <div data-dropdown-sub-context>{children}</div>;
  }
);

export type DropdownMenuSubTriggerProps = PropsOf<"div">;

export const DropdownMenuSubTrigger = component$<DropdownMenuSubTriggerProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn(dropdownMenuItemVariants({}), "justify-between", className)}
        {...props}
      >
        <Slot />
        <ChevronRight class="h-4 w-4" />
      </div>
    );
  }
);

export type DropdownMenuSubContentProps = PropsOf<"div">;

export const DropdownMenuSubContent = component$<DropdownMenuSubContentProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn(dropdownMenuVariants({}), "ml-2", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export type DropdownMenuShortcutProps = PropsOf<"span">;

export const DropdownMenuShortcut = component$<DropdownMenuShortcutProps>(
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

export type DropdownMenuGroupProps = PropsOf<"div">;

export const DropdownMenuGroup = component$<DropdownMenuGroupProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

export type DropdownMenuPortalProps = PropsOf<"div">;

export const DropdownMenuPortal = component$<DropdownMenuPortalProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

export type DropdownMenuRadioGroupProps = PropsOf<"div">;

export const DropdownMenuRadioGroup = component$<DropdownMenuRadioGroupProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);
