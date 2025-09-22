import {
  component$,
  useSignal,
  useStore,
  useTask$,
  type PropsOf,
  $,
  Slot,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

const inputOtpVariants = cva("flex items-center gap-2", {
  variants: {
    size: {
      sm: "gap-1",
      default: "gap-2",
      lg: "gap-3",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const inputOtpGroupVariants = cva("flex items-center");

const inputOtpSlotVariants = cva(
  "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-transparent",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive focus-within:ring-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const inputOtpInputVariants = cva(
  "flex h-full w-full items-center justify-center bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10",
        lg: "h-12 w-12 text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);


// OTP Input Context Store
interface OTPInputStore {
  value: string;
  length: number;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

export interface InputOTPProps extends Omit<PropsOf<"div">, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
}

export const InputOTP = component$<InputOTPProps>(
  ({
    value = "",
    onChange,
    onComplete,
    maxLength = 6,
    size = "default",
    class: className,
    ...props
  }) => {
    const store = useStore<OTPInputStore>({
      value,
      length: maxLength,
      onChange,
      onComplete,
    });

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        store.value = value;
      }
    });

    return (
      <div
        class={cn(inputOtpVariants({ size }), className)}
        data-otp-input-context={JSON.stringify(store)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export type InputOTPGroupProps = PropsOf<"div">

export const InputOTPGroup = component$<InputOTPGroupProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn(inputOtpGroupVariants({}), className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export interface InputOTPSlotProps extends Omit<PropsOf<"div">, "onChange"> {
  index: number;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export const InputOTPSlot = component$<InputOTPSlotProps>(
  ({ index, variant, disabled = false, class: className, ...props }) => {
    const inputRef = useSignal<HTMLInputElement>();
    const store = useSignal<OTPInputStore | null>(null);

    useTask$(({ cleanup }) => {
      const context = document.querySelector("[data-otp-input-context]");
      if (context) {
        store.value = JSON.parse(
          context.getAttribute("data-otp-input-context") || "{}"
        );
      }

      const handleStateChange = () => {
        const context = document.querySelector("[data-otp-input-context]");
        if (context) {
          store.value = JSON.parse(
            context.getAttribute("data-otp-input-context") || "{}"
          );
        }
      };

      document.addEventListener("otp-input-change", handleStateChange);

      cleanup(() => {
        document.removeEventListener("otp-input-change", handleStateChange);
      });
    });

    const handleInput = $((event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;

      if (!store.value || store.value.length <= index) return;

      // Only allow single character
      if (value.length > 1) {
        target.value = value.charAt(0);
        return;
      }

      // Update the OTP value
      const newValue = store.value.value.split("");
      newValue[index] = value;
      const finalValue = newValue.join("");

      store.value.value = finalValue;
      store.value.onChange?.(finalValue);

      // Auto-focus next input
      if (value && index < store.value.length - 1) {
        const nextInput = document.querySelector(
          `[data-otp-slot="${index + 1}"] input`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }

      // Check if OTP is complete
      if (
        finalValue.length === store.value.length &&
        !finalValue.includes("")
      ) {
        store.value.onComplete?.(finalValue);
      }

      // Update context
      const context = document.querySelector("[data-otp-input-context]");
      if (context) {
        context.setAttribute(
          "data-otp-input-context",
          JSON.stringify(store.value)
        );
        context.dispatchEvent(new CustomEvent("otp-input-change"));
      }
    });

    const handleKeyDown = $((event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement;

      if (event.key === "Backspace" && !target.value && index > 0) {
        // Move to previous input on backspace if current is empty
        const prevInput = document.querySelector(
          `[data-otp-slot="${index - 1}"] input`
        ) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      } else if (event.key === "ArrowLeft" && index > 0) {
        // Move to previous input on left arrow
        const prevInput = document.querySelector(
          `[data-otp-slot="${index - 1}"] input`
        ) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      } else if (
        event.key === "ArrowRight" &&
        index < (store.value?.length || 0) - 1
      ) {
        // Move to next input on right arrow
        const nextInput = document.querySelector(
          `[data-otp-slot="${index + 1}"] input`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    });

    const handlePaste = $((event: ClipboardEvent) => {
      event.preventDefault();
      const pasteData = event.clipboardData?.getData("text");

      if (pasteData && store.value) {
        const pasteArray = pasteData
          .split("")
          .slice(0, store.value.length - index);
        const newValue = store.value.value.split("");

        pasteArray.forEach((char, i) => {
          if (index + i < store.value!.length) {
            newValue[index + i] = char;
          }
        });

        const finalValue = newValue.join("");
        store.value.value = finalValue;
        store.value.onChange?.(finalValue);

        // Focus the next empty input or the last filled input
        const nextEmptyIndex = newValue.findIndex(
          (char, i) => !char && i >= index
        );
        const focusIndex =
          nextEmptyIndex === -1 ? store.value.length - 1 : nextEmptyIndex;

        const focusInput = document.querySelector(
          `[data-otp-slot="${focusIndex}"] input`
        ) as HTMLInputElement;
        if (focusInput) {
          focusInput.focus();
        }

        // Check if OTP is complete
        if (
          finalValue.length === store.value.length &&
          !finalValue.includes("")
        ) {
          store.value.onComplete?.(finalValue);
        }

        // Update context
        const context = document.querySelector("[data-otp-input-context]");
        if (context) {
          context.setAttribute(
            "data-otp-input-context",
            JSON.stringify(store.value)
          );
          context.dispatchEvent(new CustomEvent("otp-input-change"));
        }
      }
    });

    return (
      <div
        class={cn(inputOtpSlotVariants({ variant }), className)}
        data-otp-slot={index}
        {...props}
      >
        <input
          ref={inputRef}
          class={cn(
            inputOtpInputVariants({
              size:
                store.value?.length === 4
                  ? "sm"
                  : store.value?.length === 8
                    ? "lg"
                    : "default",
            })
          )}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={store.value?.length ? disabled : false}
          value={store.value?.value.charAt(index) || ""}
          onInput$={handleInput}
          onKeyDown$={handleKeyDown}
          onPaste$={handlePaste}
          aria-label={`Digit ${index + 1}`}
        />
      </div>
    );
  }
);

export type InputOTPSeparatorProps = PropsOf<"div">

export const InputOTPSeparator = component$<InputOTPSeparatorProps>(
  ({ ...props }) => {
    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

// Simple OTP input component for common use cases
export interface SimpleInputOTPProps {
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  separator?: string;
}

export const SimpleInputOTP = component$<SimpleInputOTPProps>(
  ({
    value = "",
    onChange,
    onComplete,
    length = 6,
    disabled = false,
    separator = "-",
  }) => {
    const slots = Array.from({ length }, (_, i) => i);

    return (
      <InputOTP
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        maxLength={length}
        disabled={disabled}
      >
        <InputOTPGroup>
          {slots.map((index) => (
            <div key={index}>
              <InputOTPSlot index={index} />
              {index < slots.length - 1 && separator && (
                <InputOTPSeparator>{separator}</InputOTPSeparator>
              )}
            </div>
          ))}
        </InputOTPGroup>
      </InputOTP>
    );
  }
);

// Pre-configured OTP components for common lengths
export const InputOTP4 = component$<Omit<SimpleInputOTPProps, "length">>(
  (props) => <SimpleInputOTP length={4} {...props} />
);

export const InputOTP6 = component$<Omit<SimpleInputOTPProps, "length">>(
  (props) => <SimpleInputOTP length={6} {...props} />
);

export const InputOTP8 = component$<Omit<SimpleInputOTPProps, "length">>(
  (props) => <SimpleInputOTP length={8} {...props} />
);
