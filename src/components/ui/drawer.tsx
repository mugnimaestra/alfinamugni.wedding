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
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { LuX } from "@qwikest/icons/lucide";

// Drawer Context Store
interface DrawerStore {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

const drawerOverlayVariants = cva(
  "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
);

const drawerContentVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top max-h-[80vh]",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom max-h-[80vh]",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

const drawerHeaderVariants = cva(
  "flex flex-col space-y-2 text-center sm:text-left"
);

const drawerFooterVariants = cva(
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
);

const drawerTitleVariants = cva("text-lg font-semibold text-foreground");

const drawerDescriptionVariants = cva("text-sm text-muted-foreground");

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Drawer = component$<DrawerProps>(
  ({ open, onOpenChange }) => {
    const store = useStore<DrawerStore>({
      isOpen: open ?? false,
      onOpenChange,
    });

    useTask$(({ track }) => {
      track(() => open);
      if (open !== undefined) {
        store.isOpen = open;
      }
    });

    return (
      <div data-drawer-context={JSON.stringify(store)}>
        <Slot />
      </div>
    );
  }
);

export type DrawerTriggerProps = PropsOf<"button">;

export const DrawerTrigger = component$<DrawerTriggerProps>(
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
            const context = element.closest("[data-drawer-context]");
            if (context) {
              const store: DrawerStore = JSON.parse(
                context.getAttribute("data-drawer-context") || "{}"
              );
              const newIsOpen = !store.isOpen;
              store.isOpen = newIsOpen;
              store.onOpenChange?.(newIsOpen);
              context.setAttribute(
                "data-drawer-context",
                JSON.stringify(store)
              );

              // Trigger re-render
              context.dispatchEvent(new CustomEvent("drawer-state-change"));
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

export type DrawerOverlayProps = PropsOf<"div">;

export const DrawerOverlay = component$<DrawerOverlayProps>(
  ({ class: className, onClick$, ...props }) => {
    return (
      <div
        class={cn(drawerOverlayVariants({}), className)}
        onClick$={[
          onClick$,
          $(() => {
            const context = document.querySelector("[data-drawer-context]");
            if (context) {
              const store: DrawerStore = JSON.parse(
                context.getAttribute("data-drawer-context") || "{}"
              );
              store.isOpen = false;
              store.onOpenChange?.(false);
              context.setAttribute(
                "data-drawer-context",
                JSON.stringify(store)
              );
              context.dispatchEvent(new CustomEvent("drawer-state-change"));
            }
          }),
        ]}
        {...props}
      />
    );
  }
);

export interface DrawerContentProps
  extends PropsOf<"div">,
    VariantProps<typeof drawerContentVariants> {
  side?: "top" | "bottom" | "left" | "right";
}

export const DrawerContent = component$<DrawerContentProps>(
  ({ side = "right", class: className, ...props }) => {
    const isOpen = useSignal(false);

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-drawer-context]");
        if (context) {
          const store: DrawerStore = JSON.parse(
            context.getAttribute("data-drawer-context") || "{}"
          );
          isOpen.value = store.isOpen;
        }
      };

      // Listen for state changes
      document.addEventListener("drawer-state-change", handleStateChange);

      // Initial state check
      handleStateChange();

      cleanup(() => {
        document.removeEventListener("drawer-state-change", handleStateChange);
      });
    });

    // Close on escape
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen.value) {
          const context = document.querySelector("[data-drawer-context]");
          if (context) {
            const store: DrawerStore = JSON.parse(
              context.getAttribute("data-drawer-context") || "{}"
            );
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute("data-drawer-context", JSON.stringify(store));
            context.dispatchEvent(new CustomEvent("drawer-state-change"));
          }
        }
      })
    );

    if (!isOpen.value) return null;

    return (
      <div class="fixed inset-0 z-50">
        <DrawerOverlay />
        <div
          class={cn(drawerContentVariants({ side }), className)}
          data-state={isOpen.value ? "open" : "closed"}
          {...props}
        >
          <DrawerClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <LuX class="h-4 w-4" />
            <span class="sr-only">Close</span>
          </DrawerClose>
          <Slot />
        </div>
      </div>
    );
  }
);

export type DrawerCloseProps = PropsOf<"button">;

export const DrawerClose = component$<DrawerCloseProps>(
  ({ onClick$, ...props }) => {
    return (
      <button
        {...props}
        onClick$={[
          onClick$,
          $(() => {
            const context = document.querySelector("[data-drawer-context]");
            if (context) {
              const store: DrawerStore = JSON.parse(
                context.getAttribute("data-drawer-context") || "{}"
              );
              store.isOpen = false;
              store.onOpenChange?.(false);
              context.setAttribute(
                "data-drawer-context",
                JSON.stringify(store)
              );
              context.dispatchEvent(new CustomEvent("drawer-state-change"));
            }
          }),
        ]}
      >
        <Slot />
      </button>
    );
  }
);

export type DrawerHeaderProps = PropsOf<"div">;

export const DrawerHeader = component$<DrawerHeaderProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn(drawerHeaderVariants({}), className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export type DrawerFooterProps = PropsOf<"div">;

export const DrawerFooter = component$<DrawerFooterProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn(drawerFooterVariants({}), className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export type DrawerTitleProps = PropsOf<"h2">;

export const DrawerTitle = component$<DrawerTitleProps>(
  ({ class: className, ...props }) => {
    return (
      <h2 class={cn(drawerTitleVariants({}), className)} {...props}>
        <Slot />
      </h2>
    );
  }
);

export type DrawerDescriptionProps = PropsOf<"p">;

export const DrawerDescription = component$<DrawerDescriptionProps>(
  ({ class: className, ...props }) => {
    return (
      <p class={cn(drawerDescriptionVariants({}), className)} {...props}>
        <Slot />
      </p>
    );
  }
);

// Mobile-specific drawer components
export interface MobileDrawerProps extends DrawerProps {
  side?: "left" | "right" | "top" | "bottom";
}

export const MobileDrawer = component$<MobileDrawerProps>(
  ({ side = "left", ...props }) => {
    return (
      <Drawer {...props}>
        <DrawerContent side={side}>
          <Slot />
        </DrawerContent>
      </Drawer>
    );
  }
);

// Navigation-specific drawer
export interface NavigationDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  side?: "left" | "right";
}

export const NavigationDrawer = component$<NavigationDrawerProps>(
  ({ isOpen, onOpenChange, title = "Navigation", side = "left" }) => {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent side={side}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div class="mt-4">
            <Slot />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
);
