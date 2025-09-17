import { component$, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type CheckboxProps = QwikIntrinsicElements["input"] & {
  checked?: boolean;
  onCheckedChange$?: (checked: boolean) => void;
};

export const Checkbox = component$<CheckboxProps>(
  ({
    checked,
    onCheckedChange$,
    class: className,
    onChange$: externalOnChange$,
    ...props
  }) => {
    const runExternalHandlers = (
      handlers:
        | typeof externalOnChange$
        | undefined,
      event: Event,
      element: HTMLInputElement
    ) => {
      if (!handlers) return;
      const list = Array.isArray(handlers) ? handlers : [handlers];
      list.forEach((handler) => {
        if (!handler) return;
        (handler as (event: Event, element: HTMLInputElement) => void)(
          event,
          element,
        );
      });
    };

    return (
      <input
        type="checkbox"
        class={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        checked={checked}
        onChange$={(event, element) => {
          const target = (element as HTMLInputElement) ??
            (event.target as HTMLInputElement);
          onCheckedChange$?.(target.checked);
          runExternalHandlers(externalOnChange$, event, target);
        }}
        {...props}
      />
    );
  }
);

type CheckboxWithLabelProps = CheckboxProps & {
  label?: string;
  description?: string;
  error?: string;
};

export const CheckboxWithLabel = component$<CheckboxWithLabelProps>(
  ({ label, description, error, ...checkboxProps }) => {
    return (
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Checkbox {...checkboxProps} />
          {label && (
            <label
              class={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                checkboxProps.disabled && "cursor-not-allowed opacity-70"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {description && (
          <p class="text-sm text-muted-foreground ml-6">{description}</p>
        )}
        {error && <p class="text-sm text-destructive ml-6">{error}</p>}
      </div>
    );
  }
);
