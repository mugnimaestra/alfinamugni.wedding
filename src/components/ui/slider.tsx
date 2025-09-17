import {
  component$,
  type QwikIntrinsicElements,
  useSignal,
  useTask$,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type SliderProps = QwikIntrinsicElements["div"] & {
  value?: number[];
  onValueChange$?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

export const Slider = component$<SliderProps>(
  ({
    value = [0],
    onValueChange$,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    orientation = "horizontal",
    class: className,
    ...props
  }) => {
    const currentValue = useSignal(value);
    const sliderRef = useSignal<HTMLDivElement>();
    const isDragging = useSignal(false);

    useTask$(({ track }) => {
      track(() => value);
      currentValue.value = [...value];
    });

    const calculateValue = (clientX: number, clientY: number) => {
      if (!sliderRef.value) return currentValue.value[0];

      const rect = sliderRef.value.getBoundingClientRect();
      let percentage: number;

      if (orientation === "horizontal") {
        percentage = (clientX - rect.left) / rect.width;
      } else {
        percentage = 1 - (clientY - rect.top) / rect.height;
      }

      percentage = Math.max(0, Math.min(1, percentage));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;

      return Math.max(min, Math.min(max, steppedValue));
    };

    const handlePointerDown = $((event: PointerEvent) => {
      if (disabled) return;

      isDragging.value = true;
      const newValue = calculateValue(event.clientX, event.clientY);
      currentValue.value = [newValue];
      onValueChange$?.([newValue]);
    });

    const handlePointerMove = $((event: PointerEvent) => {
      if (!isDragging.value || disabled) return;

      const newValue = calculateValue(event.clientX, event.clientY);
      currentValue.value = [newValue];
      onValueChange$?.([newValue]);
    });

    const handlePointerUp = $(() => {
      isDragging.value = false;
    });

    useVisibleTask$(({ cleanup }) => {
      const handleGlobalPointerMove = (event: PointerEvent) => {
        handlePointerMove(event);
      };

      const handleGlobalPointerUp = () => {
        handlePointerUp();
      };

      if (isDragging.value) {
        document.addEventListener("pointermove", handleGlobalPointerMove);
        document.addEventListener("pointerup", handleGlobalPointerUp);

        cleanup(() => {
          document.removeEventListener("pointermove", handleGlobalPointerMove);
          document.removeEventListener("pointerup", handleGlobalPointerUp);
        });
      }
    });

    const percentage = ((currentValue.value[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={sliderRef}
        class={cn(
          "relative flex w-full touch-none select-none items-center",
          orientation === "vertical" && "flex-col h-full",
          className
        )}
        onPointerDown$={handlePointerDown}
        {...props}
      >
        <div
          class={cn(
            "relative bg-secondary rounded-full",
            orientation === "horizontal" ? "h-2 w-full" : "h-full w-2"
          )}
        >
          <div
            class={cn(
              "absolute bg-primary rounded-full",
              orientation === "horizontal"
                ? `h-2 w-[${percentage}%]`
                : `w-2 bottom-0 left-0 h-[${percentage}%]`
            )}
            style={{
              [orientation === "horizontal" ? "width" : "height"]:
                `${percentage}%`,
            }}
          />
        </div>
        <div
          class={cn(
            "absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            orientation === "horizontal"
              ? `left-[${percentage}%] top-1/2 -translate-x-1/2 -translate-y-1/2`
              : `bottom-[${percentage}%] left-1/2 -translate-x-1/2 translate-y-1/2`
          )}
          style={{
            [orientation === "horizontal" ? "left" : "bottom"]:
              `${percentage}%`,
          }}
        />
      </div>
    );
  }
);

type SliderWithLabelProps = SliderProps & {
  label?: string;
  description?: string;
  showValue?: boolean;
};

export const SliderWithLabel = component$<SliderWithLabelProps>(
  ({ label, description, showValue = false, ...sliderProps }) => {
    const currentValue = useSignal(sliderProps.value?.[0] || 0);

    useTask$(({ track }) => {
      track(() => sliderProps.value);
      if (sliderProps.value) {
        currentValue.value = sliderProps.value[0];
      }
    });

    return (
      <div class="space-y-2">
        {(label || showValue) && (
          <div class="flex items-center justify-between">
            {label && (
              <label class="text-sm font-medium leading-none">{label}</label>
            )}
            {showValue && (
              <span class="text-sm text-muted-foreground">
                {currentValue.value}
              </span>
            )}
          </div>
        )}
        <Slider
          {...sliderProps}
          onValueChange$={(value) => {
            currentValue.value = value[0];
            sliderProps.onValueChange$?.(value);
          }}
        />
        {description && (
          <p class="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }
);
