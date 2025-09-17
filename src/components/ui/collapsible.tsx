import {
  component$,
  useSignal,
  useStore,
  useTask$,
  type PropsOf,
  Slot,
  $,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";

// Collapsible Context Store
interface CollapsibleStore {
  isOpen: boolean;
  disabled?: boolean;
}

const collapsibleTriggerVariants = cva(
  "flex items-center justify-between rounded-md px-4 py-2 text-left font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  }
);

const collapsibleContentVariants = cva(
  "overflow-hidden transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "",
        smooth: "transition-all duration-500 ease-out",
        instant: "transition-all duration-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CollapsibleProps extends PropsOf<"div"> {
  open?: boolean;
  disabled?: boolean;
}

export const Collapsible = component$<CollapsibleProps>(
  ({ open, disabled, class: className, ...props }) => {
    const store = useStore<CollapsibleStore>({
      isOpen: open ?? false,
      disabled,
    });

    useTask$(({ track }) => {
      track(() => open);
      if (open !== undefined) {
        store.isOpen = open;
      }
    });

    return (
      <div
        class={className}
        data-collapsible-context={JSON.stringify(store)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface CollapsibleTriggerProps extends PropsOf<"button"> {
  variant?: "default" | "ghost" | "outline";
}

export const CollapsibleTrigger = component$<CollapsibleTriggerProps>(
  ({ class: className, variant, onClick$, ...props }) => {
    const isOpen = useSignal(false);
    const disabled = useSignal(false);

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-collapsible-context]");
        if (context) {
          const store: CollapsibleStore = JSON.parse(
            context.getAttribute("data-collapsible-context") || "{}"
          );
          isOpen.value = store.isOpen;
          disabled.value = store.disabled || false;
        }
      };

      document.addEventListener("collapsible-state-change", handleStateChange);
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "collapsible-state-change",
          handleStateChange
        );
      });
    });

    return (
      <button
        class={cn(collapsibleTriggerVariants({ variant }), className)}
        disabled={disabled.value}
        aria-expanded={isOpen.value}
        onClick$={[
          onClick$,
          $(() => {
            const context = document.querySelector(
              "[data-collapsible-context]"
            );
            if (context && !disabled.value) {
              const store: CollapsibleStore = JSON.parse(
                context.getAttribute("data-collapsible-context") || "{}"
              );
              const newIsOpen = !store.isOpen;
              store.isOpen = newIsOpen;
              context.setAttribute(
                "data-collapsible-context",
                JSON.stringify(store)
              );
              context.dispatchEvent(
                new CustomEvent("collapsible-state-change")
              );
            }
          }),
        ]}
        {...props}
      >
        <Slot />
        <ChevronDown
          class={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen.value && "rotate-180"
          )}
        />
      </button>
    );
  }
);

export interface CollapsibleContentProps extends PropsOf<"div"> {
  variant?: "default" | "smooth" | "instant";
}

export const CollapsibleContent = component$<CollapsibleContentProps>(
  ({ class: className, variant, ...props }) => {
    const isOpen = useSignal(false);
    const contentRef = useSignal<HTMLDivElement>();
    const height = useSignal("0px");

    useTask$(({ cleanup }) => {
      const handleStateChange = () => {
        const context = document.querySelector("[data-collapsible-context]");
        if (context) {
          const store: CollapsibleStore = JSON.parse(
            context.getAttribute("data-collapsible-context") || "{}"
          );
          isOpen.value = store.isOpen;

          // Calculate height when opening
          if (store.isOpen && contentRef.value) {
            const scrollHeight = contentRef.value.scrollHeight;
            height.value = `${scrollHeight}px`;
          } else {
            height.value = "0px";
          }
        }
      };

      document.addEventListener("collapsible-state-change", handleStateChange);
      handleStateChange();

      cleanup(() => {
        document.removeEventListener(
          "collapsible-state-change",
          handleStateChange
        );
      });
    });

    return (
      <div
        ref={contentRef}
        class={cn(collapsibleContentVariants({ variant }), className)}
        style={{
          height: height.value,
        }}
        {...props}
      >
        <div class="pb-4">
          <Slot />
        </div>
      </div>
    );
  }
);

// Simple collapsible component for quick use
export interface SimpleCollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  variant?: "default" | "smooth" | "instant";
  triggerVariant?: "default" | "ghost" | "outline";
}

export const SimpleCollapsible = component$<SimpleCollapsibleProps>(
  ({
    title,
    defaultOpen = false,
    disabled = false,
    variant = "default",
    triggerVariant = "ghost",
  }) => {
    return (
      <Collapsible open={defaultOpen} disabled={disabled}>
        <CollapsibleTrigger variant={triggerVariant}>
          {title}
        </CollapsibleTrigger>
        <CollapsibleContent variant={variant}>
          <Slot />
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

// Wedding-specific collapsible components
export interface WeddingFAQProps {
  question: string;
  answer: string;
  category?: "general" | "rsvp" | "vendors" | "photos" | "timeline";
}

export const WeddingFAQ = component$<WeddingFAQProps>(
  ({ question, answer, category }) => {
    const categoryColor = {
      general: "border-blue-200",
      rsvp: "border-green-200",
      vendors: "border-purple-200",
      photos: "border-pink-200",
      timeline: "border-yellow-200",
    };

    return (
      <div
        class={cn(
          "border rounded-lg mb-4",
          category && categoryColor[category]
        )}
      >
        <SimpleCollapsible
          title={question}
          triggerVariant="ghost"
          variant="smooth"
        >
          <div>
            <div class="text-muted-foreground leading-relaxed">{answer}</div>
            {category && (
              <div class="mt-2">
                <span class="inline-block px-2 py-1 text-xs bg-muted rounded-full capitalize">
                  {category}
                </span>
              </div>
            )}
          </div>
        </SimpleCollapsible>
      </div>
    );
  }
);

export interface WeddingTimelineItemProps {
  date: string;
  title: string;
  description: string;
  time?: string;
  completed?: boolean;
}

export const WeddingTimelineItem = component$<WeddingTimelineItemProps>(
  ({ date, title, description, time, completed = false }) => {
    return (
      <div class="border-l-4 border-primary/20 pl-4 pb-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-medium text-primary">{date}</span>
          {time && <span class="text-sm text-muted-foreground">{time}</span>}
          {completed && <div class="w-2 h-2 bg-green-500 rounded-full" />}
        </div>
        <SimpleCollapsible
          title={title}
          triggerVariant="ghost"
          variant="default"
          defaultOpen={false}
        >
          <div>
            <p class="text-muted-foreground mt-2">{description}</p>
          </div>
        </SimpleCollapsible>
      </div>
    );
  }
);
