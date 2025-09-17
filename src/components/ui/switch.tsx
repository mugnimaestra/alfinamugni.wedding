import {
  component$,
  type QwikIntrinsicElements,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type SwitchProps = Omit<QwikIntrinsicElements["button"], "type"> & {
  checked?: boolean;
  onCheckedChange$?: (checked: boolean) => void;
  disabled?: boolean;
};

export const Switch = component$<SwitchProps>(
  ({
    checked = false,
    onCheckedChange$,
    disabled = false,
    class: className,
    onClick$: externalOnClick$,
    ...props
  }) => {
    const isChecked = useSignal(checked);

    useTask$(({ track }) => {
      track(() => checked);
      isChecked.value = checked;
    });

    const runExternalHandlers = (
      handlers: typeof externalOnClick$ | undefined,
      event: Event,
      element: HTMLButtonElement
    ) => {
      if (!handlers) return;
      const list = Array.isArray(handlers) ? handlers : [handlers];
      list.forEach((handler) => {
        if (!handler) return;
        (handler as (event: Event, element: HTMLButtonElement) => void)(
          event,
          element,
        );
      });
    };

    const handleClick = (event: Event, element?: Element) => {
      if (disabled) return;

      isChecked.value = !isChecked.value;
      onCheckedChange$?.(isChecked.value);
      const target = (element as HTMLButtonElement) ??
        (event.currentTarget as HTMLButtonElement);
      runExternalHandlers(externalOnClick$, event, target);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked.value}
        disabled={disabled}
        onClick$={(event, element) => handleClick(event, element)}
        class={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          isChecked.value ? "bg-primary" : "bg-input",
          className
        )}
        {...props}
      >
        <span
          class={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            isChecked.value ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

type SwitchWithLabelProps = SwitchProps & {
  label?: string;
  description?: string;
  error?: string;
};

export const SwitchWithLabel = component$<SwitchWithLabelProps>(
  ({ label, description, error, ...switchProps }) => {
    return (
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Switch {...switchProps} />
          {label && (
            <label
              class={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                switchProps.disabled && "cursor-not-allowed opacity-70"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {description && (
          <p class="text-sm text-muted-foreground ml-14">{description}</p>
        )}
        {error && <p class="text-sm text-destructive ml-14">{error}</p>}
      </div>
    );
  }
);
