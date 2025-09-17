import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useOnDocument,
  type PropsOf,
  Slot,
  $,
  type PropFunction,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";

// Navigation Menu Context Store
interface NavigationMenuStore {
  value: string;
  onValueChange?: (value: string) => void;
}

const navigationMenuVariants = cva(
  "relative z-10 flex max-w-max flex-1 items-center justify-center"
);

const navigationMenuListVariants = cva(
  "group flex flex-1 list-none items-center justify-center space-x-1"
);

const navigationMenuItemVariants = cva("relative");

const navigationMenuTriggerVariants = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

const navigationMenuContentVariants = cva(
  "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
  {
    variants: {
      variant: {
        default:
          "data-[motion^=from-]:slide-in-from-top-4 data-[motion^=to-]:slide-out-to-top-4",
        mega: "data-[motion^=from-]:slide-in-from-top-2 data-[motion^=to-]:slide-out-to-top-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const navigationMenuLinkVariants = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

const navigationMenuIndicatorVariants = cva(
  "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in"
);

const navigationMenuViewportVariants = cva(
  "relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
  {
    variants: {
      position: {
        default:
          "data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4",
        mega: "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
      },
    },
    defaultVariants: {
      position: "default",
    },
  }
);

export interface NavigationMenuProps extends PropsOf<"nav"> {
  value?: string;
  onValueChange?: (value: string) => void;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export const NavigationMenu = component$<NavigationMenuProps>(
  ({
    class: className,
    value,
    onValueChange,
    delayDuration = 200,
    skipDelayDuration = 300,
    ...props
  }) => {
    const store = useStore<NavigationMenuStore>({
      value: value ?? "",
      onValueChange,
    });

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        store.value = value;
      }
    });

    return (
      <nav
        class={cn(navigationMenuVariants({}), className)}
        data-navigation-menu-context={JSON.stringify(store)}
        {...props}
      >
        <Slot />
      </nav>
    );
  }
);

export type NavigationMenuListProps = PropsOf<"ul">;

export const NavigationMenuList = component$<NavigationMenuListProps>(
  ({ class: className, ...props }) => {
    return (
      <ul class={cn(navigationMenuListVariants({}), className)} {...props}>
        <Slot />
      </ul>
    );
  }
);

export type NavigationMenuItemProps = PropsOf<"li">;

export const NavigationMenuItem = component$<NavigationMenuItemProps>(
  ({ value, ...props }) => {
    return (
      <li data-navigation-menu-item={value} {...props}>
        <Slot />
      </li>
    );
  }
);

export interface NavigationMenuTriggerProps extends PropsOf<"button"> {
  disabled?: boolean;
}

export const NavigationMenuTrigger = component$<NavigationMenuTriggerProps>(
  ({ class: className, disabled, onClick$, ...props }) => {
    const isActive = useSignal(false);

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const nav = document.querySelector("[data-navigation-menu-context]");
        if (nav) {
          const store: NavigationMenuStore = JSON.parse(
            nav.getAttribute("data-navigation-menu-context") || "{}"
          );
          const item = document.querySelector("[data-navigation-menu-item]");
          const itemValue = item?.getAttribute("data-navigation-menu-item");
          isActive.value = store.value === itemValue;
        }
      };

      document.addEventListener(
        "navigation-menu-state-change",
        handleStateChange
      );
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "navigation-menu-state-change",
          handleStateChange
        );
      });
    });

    return (
      <button
        class={cn(navigationMenuTriggerVariants({}), className)}
        data-state={isActive.value ? "open" : "closed"}
        disabled={disabled}
        onClick$={[
          onClick$,
          $((_, element: Element) => {
            const nav = document.querySelector(
              "[data-navigation-menu-context]"
            );
            const item = element.closest("[data-navigation-menu-item]");
            const itemValue = item?.getAttribute("data-navigation-menu-item");

            if (nav && itemValue) {
              const store: NavigationMenuStore = JSON.parse(
                nav.getAttribute("data-navigation-menu-context") || "{}"
              );
              const newValue = store.value === itemValue ? "" : itemValue;
              store.value = newValue;
              store.onValueChange?.(newValue);
              nav.setAttribute(
                "data-navigation-menu-context",
                JSON.stringify(store)
              );
              nav.dispatchEvent(
                new CustomEvent("navigation-menu-state-change")
              );
            }
          }),
        ]}
        {...props}
      >
        <Slot />
        <ChevronDown class="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
      </button>
    );
  }
);

export interface NavigationMenuContentProps extends PropsOf<"div"> {
  variant?: "default" | "mega";
}

export const NavigationMenuContent = component$<NavigationMenuContentProps>(
  ({ class: className, variant = "default", ...props }) => {
    const isVisible = useSignal(false);

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const nav = document.querySelector("[data-navigation-menu-context]");
        if (nav) {
          const store: NavigationMenuStore = JSON.parse(
            nav.getAttribute("data-navigation-menu-context") || "{}"
          );
          const item = document.querySelector("[data-navigation-menu-item]");
          const itemValue = item?.getAttribute("data-navigation-menu-item");
          isVisible.value = store.value === itemValue;
        }
      };

      document.addEventListener(
        "navigation-menu-state-change",
        handleStateChange
      );
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "navigation-menu-state-change",
          handleStateChange
        );
      });
    });

    // Close on click outside
    useOnDocument(
      "click",
      $((event: Event) => {
        if (!isVisible.value) return;

        const target = event.target as Element;
        const nav = document.querySelector("[data-navigation-menu-context]");

        if (nav && !nav.contains(target)) {
          const store: NavigationMenuStore = JSON.parse(
            nav.getAttribute("data-navigation-menu-context") || "{}"
          );
          store.value = "";
          store.onValueChange?.("");
          nav.setAttribute(
            "data-navigation-menu-context",
            JSON.stringify(store)
          );
          nav.dispatchEvent(new CustomEvent("navigation-menu-state-change"));
        }
      })
    );

    if (!isVisible.value) return null;

    return (
      <div
        class={cn(navigationMenuContentVariants({ variant }), className)}
        data-state={isVisible.value ? "open" : "closed"}
        data-motion="from-start"
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export type NavigationMenuLinkProps = PropsOf<"a">;

export const NavigationMenuLink = component$<NavigationMenuLinkProps>(
  ({ class: className, ...props }) => {
    return (
      <a class={cn(navigationMenuLinkVariants({}), className)} {...props}>
        <Slot />
      </a>
    );
  }
);

export interface NavigationMenuViewportProps extends PropsOf<"div"> {
  position?: "default" | "mega";
}

export const NavigationMenuViewport = component$<NavigationMenuViewportProps>(
  ({ class: className, position = "default", ...props }) => {
    return (
      <div
        class={cn(navigationMenuViewportVariants({ position }), className)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export type NavigationMenuIndicatorProps = PropsOf<"div">;

export const NavigationMenuIndicator = component$<NavigationMenuIndicatorProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn(navigationMenuIndicatorVariants({}), className)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

// Sub-components for content organization
export type NavigationMenuSubProps = PropsOf<"div">;

export const NavigationMenuSub = component$<NavigationMenuSubProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

export type NavigationMenuSubListProps = PropsOf<"ul">;

export const NavigationMenuSubList = component$<NavigationMenuSubListProps>(
  ({ class: className, ...props }) => {
    return (
      <ul
        class={cn(
          "grid gap-1 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]",
          className
        )}
        {...props}
      >
        <Slot />
      </ul>
    );
  }
);

export type NavigationMenuSubItemProps = PropsOf<"li">;

export const NavigationMenuSubItem = component$<NavigationMenuSubItemProps>(
  ({ ...props }) => {
    return (
      <li {...props}>
        <Slot />
      </li>
    );
  }
);

export type NavigationMenuSubTriggerProps = PropsOf<"button">;

export const NavigationMenuSubTrigger =
  component$<NavigationMenuSubTriggerProps>(
    ({ class: className, ...props }) => {
      return (
        <button
          class={cn(
            "flex select-none items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent hover:bg-accent",
            className
          )}
          {...props}
        >
          <Slot />
          <ChevronDown class="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
        </button>
      );
    }
  );

export type NavigationMenuSubContentProps = PropsOf<"div">;

export const NavigationMenuSubContent =
  component$<NavigationMenuSubContentProps>(
    ({ class: className, ...props }) => {
      return (
        <div class={cn("px-2 py-1.5", className)} {...props}>
          <Slot />
        </div>
      );
    }
  );
