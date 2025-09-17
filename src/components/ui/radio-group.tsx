import {
  component$,
  type QwikIntrinsicElements,
  Slot,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type RadioGroupProps = QwikIntrinsicElements["div"] & {
  value?: string;
  onValueChange$?: (value: string) => void;
  disabled?: boolean;
  name?: string;
};

export const RadioGroup = component$<RadioGroupProps>(
  ({
    value,
    onValueChange$,
    disabled = false,
    name,
    class: className,
    ...props
  }) => {
    const selectedValue = useSignal(value || "");

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        selectedValue.value = value;
      }
    });

    return (
      <div role="radiogroup" class={cn("grid gap-2", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

type RadioGroupItemProps = QwikIntrinsicElements["input"] & {
  value: string;
  disabled?: boolean;
};

export const RadioGroupItem = component$<RadioGroupItemProps>(
  ({ value, disabled = false, class: className, onChange$, ...props }) => {
    return (
      <input
        type="radio"
        value={value}
        disabled={disabled}
        class={cn(
          "peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

type RadioGroupOptionProps = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export const RadioGroupOption = component$<RadioGroupOptionProps>(
  ({ value, label, description, disabled = false }) => {
    return (
      <div class="flex items-center space-x-2">
        <RadioGroupItem value={value} disabled={disabled} />
        <div class="grid gap-1.5 leading-none">
          <label
            class={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              disabled && "cursor-not-allowed opacity-70"
            )}
          >
            {label}
          </label>
          {description && (
            <p class="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }
);
