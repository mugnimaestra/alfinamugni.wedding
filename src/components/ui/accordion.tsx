import { component$, useSignal, useStore, useContext, createContextId, useContextProvider, $, type PropsOf, Slot, type QRL } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

// Accordion context
interface AccordionContextState {
  type: "single" | "multiple";
  value: string | string[] | undefined;
  onValueChange: QRL<(value: string | string[] | undefined) => void> | undefined;
  collapsible?: boolean;
}

const AccordionContext = createContextId<AccordionContextState>("accordion");

export interface AccordionProps extends PropsOf<"div"> {
  type: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: QRL<(value: string | string[] | undefined) => void>;
  collapsible?: boolean;
}

export const Accordion = component$<AccordionProps>(({
  type,
  value: controlledValue,
  defaultValue,
  onValueChange,
  collapsible = false,
  class: className,
  ...props
}) => {
  const internalValue = useSignal<string | string[] | undefined>(defaultValue);
  const value = controlledValue ?? internalValue.value;

  const accordionStore = useStore<AccordionContextState>({
    type,
    value,
    onValueChange: onValueChange || $((newValue: string | string[] | undefined) => {
      internalValue.value = newValue;
    }),
    collapsible,
  });

  useContextProvider(AccordionContext, accordionStore);

  return (
    <div class={className} {...props}>
      <Slot />
    </div>
  );
});

export interface AccordionItemProps extends PropsOf<"div"> {
  value: string;
}

export const AccordionItem = component$<AccordionItemProps>(({
  value,
  class: className,
  ...props
}) => {
  const accordion = useContext(AccordionContext);
  
  if (!accordion) {
    throw new Error("AccordionItem must be used within an Accordion");
  }

  const isOpen = accordion.type === "single" 
    ? accordion.value === value
    : Array.isArray(accordion.value) && accordion.value.includes(value);

  return (
    <div
      class={cn("border-b", className)}
      data-state={isOpen ? "open" : "closed"}
      data-value={value}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type AccordionTriggerProps = PropsOf<"button">;

export const AccordionTrigger = component$<AccordionTriggerProps>(({
  class: className,
  onClick$,
  ...props
}) => {
  const accordion = useContext(AccordionContext);
  
  if (!accordion) {
    throw new Error("AccordionTrigger must be used within an Accordion");
  }

  const handleClick = $((event: Event) => {
    const target = event.currentTarget as HTMLElement;
    const item = target.closest('[data-value]');
    const itemValue = item?.getAttribute('data-value');
    
    if (!itemValue) return;

    if (accordion.type === "single") {
      const currentValue = accordion.value as string | undefined;
      const newValue = currentValue === itemValue ? 
        (accordion.collapsible ? undefined : itemValue) : 
        itemValue;
      accordion.onValueChange?.(newValue);
    } else {
      const currentValues = (accordion.value as string[]) || [];
      const newValues = currentValues.includes(itemValue)
        ? currentValues.filter(v => v !== itemValue)
        : [...currentValues, itemValue];
      accordion.onValueChange?.(newValues);
    }
  });

  return (
    <div class="flex">
      <button
        class={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick$={[onClick$, handleClick]}
        {...props}
      >
        <Slot />
        <svg 
          class="h-4 w-4 shrink-0 transition-transform duration-200"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
});

export type AccordionContentProps = PropsOf<"div">;

export const AccordionContent = component$<AccordionContentProps>(({
  class: className,
  ...props
}) => {
  const accordion = useContext(AccordionContext);
  
  if (!accordion) {
    throw new Error("AccordionContent must be used within an Accordion");
  }

  return (
    <div
      class="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div class={cn("pb-4 pt-0", className)}>
        <Slot />
      </div>
    </div>
  );
});
