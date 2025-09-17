import { component$, useSignal, useStore, useTask$, type PropsOf, Slot, $ } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

// Sheet context store
interface SheetStore {
  isOpen: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
}

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
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

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sheet = component$<SheetProps>(({ open, onOpenChange }) => {
  const store = useStore<SheetStore>({
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
    <div data-sheet-context={JSON.stringify(store)}>
      <Slot />
    </div>
  );
});

export type SheetTriggerProps = PropsOf<"button">;

export const SheetTrigger = component$<SheetTriggerProps>(({ onClick$, ...props }) => {
  return (
    <button
      {...props}
      onClick$={[
        onClick$,
        $((_, element: Element) => {
          const context = element.closest('[data-sheet-context]');
          if (context) {
            const store: SheetStore = JSON.parse(context.getAttribute('data-sheet-context') || '{}');
            const newIsOpen = !store.isOpen;
            store.isOpen = newIsOpen;
            store.onOpenChange?.(newIsOpen);
            context.setAttribute('data-sheet-context', JSON.stringify(store));
            
            // Trigger re-render by dispatching a custom event
            context.dispatchEvent(new CustomEvent('sheet-state-change'));
          }
        }),
      ]}
    >
      <Slot />
    </button>
  );
});

export type SheetOverlayProps = PropsOf<"div">;

export const SheetOverlay = component$<SheetOverlayProps>(({ class: className, onClick$, ...props }) => {
  return (
    <div
      class={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      onClick$={[
        onClick$,
        $((_, element: Element) => {
          const context = element.closest('[data-sheet-context]');
          if (context) {
            const store: SheetStore = JSON.parse(context.getAttribute('data-sheet-context') || '{}');
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute('data-sheet-context', JSON.stringify(store));
            context.dispatchEvent(new CustomEvent('sheet-state-change'));
          }
        }),
      ]}
      {...props}
    />
  );
});

export interface SheetContentProps extends PropsOf<"div">, VariantProps<typeof sheetVariants> {
  side?: "top" | "bottom" | "left" | "right";
}

export const SheetContent = component$<SheetContentProps>(({ side = "right", class: className, ...props }) => {
  const isOpen = useSignal(false);

  useTask$(({ cleanup }) => {
    const handleStateChange = () => {
      const context = document.querySelector('[data-sheet-context]');
      if (context) {
        const store: SheetStore = JSON.parse(context.getAttribute('data-sheet-context') || '{}');
        isOpen.value = store.isOpen;
      }
    };

    // Listen for state changes
    document.addEventListener('sheet-state-change', handleStateChange);
    
    // Initial state check
    handleStateChange();

    cleanup(() => {
      document.removeEventListener('sheet-state-change', handleStateChange);
    });
  });

  return (
    <>
      {isOpen.value && (
        <div class="fixed inset-0 z-50">
          <SheetOverlay />
          <div
            class={cn(sheetVariants({ side }), className)}
            data-state={isOpen.value ? "open" : "closed"}
            {...props}
          >
            <Slot />
            <SheetClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
              <span class="sr-only">Close</span>
            </SheetClose>
          </div>
        </div>
      )}
    </>
  );
});

export type SheetCloseProps = PropsOf<"button">;

export const SheetClose = component$<SheetCloseProps>(({ onClick$, ...props }) => {
  return (
    <button
      {...props}
      onClick$={[
        onClick$,
        $((_, element: Element) => {
          const context = element.closest('[data-sheet-context]');
          if (context) {
            const store: SheetStore = JSON.parse(context.getAttribute('data-sheet-context') || '{}');
            store.isOpen = false;
            store.onOpenChange?.(false);
            context.setAttribute('data-sheet-context', JSON.stringify(store));
            context.dispatchEvent(new CustomEvent('sheet-state-change'));
          }
        }),
      ]}
    >
      <Slot />
    </button>
  );
});

export type SheetHeaderProps = PropsOf<"div">;

export const SheetHeader = component$<SheetHeaderProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type SheetFooterProps = PropsOf<"div">;

export const SheetFooter = component$<SheetFooterProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type SheetTitleProps = PropsOf<"h2">;

export const SheetTitle = component$<SheetTitleProps>(({ class: className, ...props }) => {
  return (
    <h2
      class={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      <Slot />
    </h2>
  );
});

export type SheetDescriptionProps = PropsOf<"p">;

export const SheetDescription = component$<SheetDescriptionProps>(({ class: className, ...props }) => {
  return (
    <p
      class={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      <Slot />
    </p>
  );
});
