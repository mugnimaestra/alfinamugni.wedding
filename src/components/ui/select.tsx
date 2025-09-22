import {
  component$,
  type QwikIntrinsicElements,
  Slot,
  useSignal,
  useTask$,
  useOnDocument,
  $,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type SelectProps = Omit<QwikIntrinsicElements["div"], "onValueChange$"> & {
  value?: string;
  onValueChange$?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const Select = component$<SelectProps>(
  ({
    value,
    // onValueChange$ is defined in props but not implemented yet
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onValueChange$: _onValueChange$,
    placeholder = "Select an option",
    disabled = false,
    class: className,
    ...props
  }) => {
    const selectedValue = useSignal(value || "");
    const isOpen = useSignal(false);

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        selectedValue.value = value;
      }
    });

    useOnDocument(
      "click",
      $((event) => {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-select]")) {
          isOpen.value = false;
        }
      })
    );

    const toggleDropdown = $(() => {
      if (!disabled) {
        isOpen.value = !isOpen.value;
      }
    });

    return (
      <div data-select class={cn("relative", className)} {...props}>
        <button
          type="button"
          disabled={disabled}
          onClick$={toggleDropdown}
          class={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isOpen.value && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <span
            class={cn(
              selectedValue.value ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {selectedValue.value || placeholder}
          </span>
          <svg
            class={cn(
              "h-4 w-4 transition-transform",
              isOpen.value && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen.value && (
          <div class="absolute top-full z-50 mt-1 min-w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <Slot />
          </div>
        )}
      </div>
    );
  }
);

type SelectItemProps = QwikIntrinsicElements["div"] & {
  value: string;
  disabled?: boolean;
};

export const SelectItem = component$<SelectItemProps>(
  ({ value, disabled = false, class: className, children, ...props }) => {
    const selectContext = useSignal<{
      onValueChange?: (value: string) => void;
      isOpen: boolean;
    }>({
      isOpen: false,
    });

    const handleClick = $(() => {
      if (!disabled && selectContext.value.onValueChange) {
        selectContext.value.onValueChange(value);
        selectContext.value.isOpen = false;
      }
    });

    return (
      <div
        role="option"
        onClick$={handleClick}
        class={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

type SelectLabelProps = QwikIntrinsicElements["div"];

export const SelectLabel = component$<SelectLabelProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

type SelectSeparatorProps = QwikIntrinsicElements["div"];

export const SelectSeparator = component$<SelectSeparatorProps>(
  ({ class: className, ...props }) => {
    return <div class={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
  }
);

type SelectTriggerProps = QwikIntrinsicElements["button"] & {
  placeholder?: string;
};

export const SelectTrigger = component$<SelectTriggerProps>(
  ({ class: className, ...props }) => {
    return (
      <button
        type="button"
        class={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <Slot />
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  }
);

type SelectContentProps = QwikIntrinsicElements["div"];

export const SelectContent = component$<SelectContentProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          className
        )}
        {...props}
      >
        <div class="p-1">
          <Slot />
        </div>
      </div>
    );
  }
);

type SelectValueProps = QwikIntrinsicElements["span"] & {
  placeholder?: string;
};

export const SelectValue = component$<SelectValueProps>(
  ({ ...props }) => {
    return (
      <span {...props}>
        <Slot />
      </span>
    );
  }
);
