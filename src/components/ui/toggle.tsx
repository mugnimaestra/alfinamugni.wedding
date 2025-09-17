import {
  component$,
  useSignal,
  useStore,
  useTask$,
  type PropsOf,
  Slot,
  $,
  type PropFunction,
} from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ToggleProps
  extends PropsOf<"button">,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  defaultPressed?: boolean;
  disabled?: boolean;
}

export const Toggle = component$<ToggleProps>(
  ({
    class: className,
    variant,
    size,
    pressed,
    onPressedChange,
    defaultPressed = false,
    disabled = false,
    onClick$,
    ...props
  }) => {
    const isPressed = useSignal(pressed ?? defaultPressed);

    useTask$(({ track }) => {
      track(() => pressed);
      if (pressed !== undefined) {
        isPressed.value = pressed;
      }
    });

    const handleClick = $(() => {
      if (disabled) return;

      const newPressed = !isPressed.value;
      isPressed.value = newPressed;
      onPressedChange?.(newPressed);
    });

    return (
      <button
        class={cn(toggleVariants({ variant, size }), className)}
        data-state={isPressed.value ? "on" : "off"}
        disabled={disabled}
        onClick$={[handleClick, onClick$]}
        {...props}
      >
        <Slot />
      </button>
    );
  }
);

// Toggle Group Context Store
interface ToggleGroupStore {
  value: string | string[] | undefined;
  type: "single" | "multiple";
  disabled?: boolean;
  onValueChange?: (value: string | string[] | undefined) => void;
  rovingFocus?: boolean;
}

const toggleGroupVariants = cva("flex items-center justify-center gap-1", {
  variants: {
    variant: {
      default: "",
      outline: "border border-input rounded-md p-1",
    },
    size: {
      default: "",
      sm: "gap-0.5",
      lg: "gap-2",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ToggleGroupProps
  extends PropsOf<"div">,
    VariantProps<typeof toggleGroupVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[] | undefined) => void;
  disabled?: boolean;
  rovingFocus?: boolean;
}

export const ToggleGroup = component$<ToggleGroupProps>(
  ({
    class: className,
    variant,
    size,
    type = "single",
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    rovingFocus = true,
    ...props
  }) => {
    const store = useStore<ToggleGroupStore>({
      value: value ?? defaultValue,
      type,
      disabled,
      onValueChange,
      rovingFocus,
    });

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        store.value = value;
      }
    });

    return (
      <div
        class={cn(toggleGroupVariants({ variant, size }), className)}
        data-toggle-group-context={JSON.stringify(store)}
        role={type === "single" ? "radiogroup" : "group"}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ToggleGroupItemProps
  extends Omit<ToggleProps, "pressed" | "onPressedChange" | "defaultPressed"> {
  value: string;
}

export const ToggleGroupItem = component$<ToggleGroupItemProps>(
  ({ class: className, value, disabled, variant, size, ...props }) => {
    const store = useSignal<ToggleGroupStore | null>(null);
    const isPressed = useSignal(false);

    useTask$(({ cleanup }) => {
      const context = document.querySelector("[data-toggle-group-context]");
      if (context) {
        store.value = JSON.parse(
          context.getAttribute("data-toggle-group-context") || "{}"
        );
        updatePressedState();
      }

      const handleStateChange = () => {
        const context = document.querySelector("[data-toggle-group-context]");
        if (context) {
          store.value = JSON.parse(
            context.getAttribute("data-toggle-group-context") || "{}"
          );
          updatePressedState();
        }
      };

      document.addEventListener("toggle-group-state-change", handleStateChange);

      cleanup(() => {
        document.removeEventListener(
          "toggle-group-state-change",
          handleStateChange
        );
      });
    });

    const updatePressedState = () => {
      if (!store.value) return;

      if (store.value.type === "single") {
        isPressed.value = store.value.value === value;
      } else {
        isPressed.value =
          Array.isArray(store.value.value) && store.value.value.includes(value);
      }
    };

    const handleClick = $(() => {
      if (!store.value || disabled || store.value.disabled) return;

      let newValue: string | string[] | undefined;

      if (store.value.type === "single") {
        newValue = store.value.value === value ? undefined : value;
      } else {
        const currentValues = Array.isArray(store.value.value)
          ? store.value.value
          : [];
        if (currentValues.includes(value)) {
          newValue = currentValues.filter((v) => v !== value);
        } else {
          newValue = [...currentValues, value];
        }
      }

      store.value.value = newValue;
      store.value.onValueChange?.(newValue);

      // Update context
      const context = document.querySelector("[data-toggle-group-context]");
      if (context) {
        context.setAttribute(
          "data-toggle-group-context",
          JSON.stringify(store.value)
        );
        context.dispatchEvent(new CustomEvent("toggle-group-state-change"));
      }
    });

    return (
      <Toggle
        class={className}
        variant={variant}
        size={size}
        pressed={isPressed.value}
        onClick$={handleClick}
        disabled={disabled || store.value?.disabled}
        {...props}
      >
        <Slot />
      </Toggle>
    );
  }
);

// Pre-styled toggle variants for common use cases

export interface IconToggleProps extends Omit<ToggleProps, "children"> {
  icon: any;
  label?: string;
}

export const IconToggle = component$<IconToggleProps>(
  ({ icon: Icon, label, ...props }) => (
    <Toggle {...props}>
      <Icon class="h-4 w-4" />
      {label && <span class="sr-only">{label}</span>}
    </Toggle>
  )
);

// Toggle for text formatting (bold, italic, underline)
export interface TextFormatToggleProps extends Omit<ToggleProps, "children"> {
  format: "bold" | "italic" | "underline" | "strikethrough";
}

export const TextFormatToggle = component$<TextFormatToggleProps>(
  ({ format, ...props }) => {
    const icons = {
      bold: "B",
      italic: "I",
      underline: "U",
      strikethrough: "S",
    };

    return (
      <Toggle {...props}>
        <span class="font-bold text-xs">{icons[format]}</span>
      </Toggle>
    );
  }
);

// Toggle for list views (grid, list)
export interface ViewToggleProps extends Omit<ToggleProps, "children"> {
  view: "grid" | "list";
}

export const ViewToggle = component$<ViewToggleProps>(({ view, ...props }) => {
  const icons = {
    grid: (
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
    list: (
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  };

  return <Toggle {...props}>{icons[view]}</Toggle>;
});

// Settings toggle group
export interface SettingsToggleGroupProps
  extends Omit<ToggleGroupProps, "children"> {
  options: Array<{
    value: string;
    label: string;
    icon?: any;
  }>;
}

export const SettingsToggleGroup = component$<SettingsToggleGroupProps>(
  ({ options, ...props }) => (
    <ToggleGroup {...props}>
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.icon && <option.icon class="h-4 w-4 mr-2" />}
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
);
