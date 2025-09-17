import { component$, type QwikIntrinsicElements, Slot } from "@builder.io/qwik";
import { type FormStore, getValue, getError } from "@modular-forms/qwik";
import { cn } from "~/lib/utils";

type FormValues = Record<string, unknown>;

type FormProps = QwikIntrinsicElements["form"] & {
  store?: FormStore<any>;
  onSubmit$?: (values: FormValues) => void;
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
            const values: FormValues = {};

            // Extract values from form data
            for (const [key, value] of formData.entries()) {
              values[key] = value;
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

type FormFieldProps = {
  store: FormStore<any>;
  name: string;
  class?: string;
  children: (field: {
    value: any;
    error: string | undefined;
    name: string;
  }) => any;
};

export const FormField = component$<FormFieldProps>(
  ({ store, name, class: className, children }) => {
    const value = getValue(store as FormStore<any>, name as any);
    const error = getError(store as FormStore<any>, name as any);

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
