import { component$, type QwikIntrinsicElements, Slot, type JSXOutput } from "@builder.io/qwik";
import { type FormStore, getValue, getError, type FieldValues } from "@modular-forms/qwik";
import { cn } from "~/lib/utils";

type FormProps<T extends FieldValues = FieldValues> = QwikIntrinsicElements["form"] & {
  store?: FormStore<T>;
  onSubmit$?: (values: T) => void;
};

export const Form = component$<FormProps>(
  ({ store, onSubmit$, class: className, ...props }) => {
    return (
      <form
        class={cn("space-y-6", className)}
        onSubmit$={(event) => {
          event.preventDefault();
          if (store && onSubmit$) {
            // Get form values from store
            const formData = new FormData(event.target as HTMLFormElement);
            const values: FieldValues = {};

            // Extract values from form data
            for (const [key, value] of formData.entries()) {
              // @ts-expect-error: Qwik form value compatibility
              values[key] = value instanceof File ? value : String(value);
            }

            onSubmit$(values);
          }
        }}
        {...props}
      >
        <Slot />
      </form>
    );
  }
);

type FormFieldProps<T extends FieldValues = FieldValues> = {
  store: FormStore<T>;
  name: keyof T;
  class?: string;
  children: (field: {
    value: T[keyof T];
    error: string | undefined;
    name: string;
  }) => JSXOutput;
};

export const FormField = component$<FormFieldProps>(
  ({ store, name, class: className, children }) => {
    const value = getValue(store, name as string);
    const error = getError(store, name as string);

    return (
      <div class={cn("space-y-2", className)}>
        {children({
          value: value ?? "",
          error,
          name: String(name),
        })}
      </div>
    );
  }
);

type FormLabelProps = QwikIntrinsicElements["label"] & {
  required?: boolean;
};

export const FormLabel = component$<FormLabelProps>(
  ({ required, class: className, children, ...props }) => {
    return (
      <label
        class={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      >
        {children}
        {required && <span class="text-destructive ml-1">*</span>}
      </label>
    );
  }
);

type FormControlProps = QwikIntrinsicElements["div"];

export const FormControl = component$<FormControlProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={className} {...props}>
        <Slot />
      </div>
    );
  }
);

type FormDescriptionProps = QwikIntrinsicElements["p"];

export const FormDescription = component$<FormDescriptionProps>(
  ({ class: className, ...props }) => {
    return (
      <p class={cn("text-sm text-muted-foreground", className)} {...props}>
        <Slot />
      </p>
    );
  }
);

type FormMessageProps = QwikIntrinsicElements["p"] & {
  error?: string;
};

export const FormMessage = component$<FormMessageProps>(
  ({ error, class: className, ...props }) => {
    if (!error) return null;

    return (
      <p
        class={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {error}
      </p>
    );
  }
);
