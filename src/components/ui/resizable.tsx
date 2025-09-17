import {
  component$,
  useSignal,
  useStore,
  useTask$,
  type PropsOf,
  Slot,
  $,
  useOnDocument,
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { GripVertical } from "lucide-react";

// Resizable Context Store
interface ResizableStore {
  sizes: number[];
  minSizes: number[];
  maxSizes: number[];
  onSizesChange?: (sizes: number[]) => void;
  direction: "horizontal" | "vertical";
}

const resizableVariants = cva("flex", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    direction: "horizontal",
  },
});

const resizablePanelVariants = cva("flex-shrink-0 overflow-hidden", {
  variants: {
    direction: {
      horizontal: "min-w-0",
      vertical: "min-h-0",
    },
  },
});

const resizableHandleVariants = cva(
  "relative flex items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:top-1/2 data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:flex-col",
  {
    variants: {
      direction: {
        horizontal:
          "h-full w-2 cursor-col-resize data-[direction=horizontal]:after:left-1/2 data-[direction=horizontal]:after:w-1",
        vertical:
          "h-2 w-full cursor-row-resize data-[direction=vertical]:after:top-1/2 data-[direction=vertical]:after:h-1",
      },
    },
    defaultVariants: {
      direction: "horizontal",
    },
  }
);

export interface ResizableProps extends PropsOf<"div"> {
  direction?: "horizontal" | "vertical";
  sizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  onSizesChange?: (sizes: number[]) => void;
}

export const Resizable = component$<ResizableProps>(
  ({
    direction = "horizontal",
    sizes = [50, 50],
    minSizes = [10, 10],
    maxSizes = [90, 90],
    onSizesChange,
    class: className,
    ...props
  }) => {
    const store = useStore<ResizableStore>({
      sizes,
      minSizes,
      maxSizes,
      onSizesChange,
      direction,
    });

    useTask$(({ track }) => {
      track(() => sizes);
      if (sizes !== undefined) {
        store.sizes = sizes;
      }
    });

    return (
      <div
        class={cn(resizableVariants({ direction }), className)}
        data-resizable-context={JSON.stringify(store)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ResizablePanelProps extends PropsOf<"div"> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

export const ResizablePanel = component$<ResizablePanelProps>(
  ({
    defaultSize,
    minSize = 10,
    maxSize = 90,
    class: className,
    style,
    ...props
  }) => {
    const panelRef = useSignal<HTMLDivElement>();
    const store = useSignal<ResizableStore | null>(null);
    const currentSize = useSignal(50);

    useTask$(({ cleanup }) => {
      const context = document.querySelector("[data-resizable-context]");
      if (context) {
        store.value = JSON.parse(
          context.getAttribute("data-resizable-context") || "{}"
        );
        if (defaultSize) {
          currentSize.value = defaultSize;
        }
      }

      const handleStateChange = () => {
        const context = document.querySelector("[data-resizable-context]");
        if (context) {
          store.value = JSON.parse(
            context.getAttribute("data-resizable-context") || "{}"
          );
        }
      };

      document.addEventListener("resizable-state-change", handleStateChange);

      cleanup(() => {
        document.removeEventListener(
          "resizable-state-change",
          handleStateChange
        );
      });
    });

    const getSizeStyle = () => {
      if (!store.value) return {} as Record<string, string>;

      const direction = store.value.direction;
      const size = currentSize.value;

      if (direction === "horizontal") {
        return { width: `${size}%` } as Record<string, string>;
      } else {
        return { height: `${size}%` } as Record<string, string>;
      }
    };

    const cssStringFromObject = (styleRecord: Record<string, string>) =>
      Object.entries(styleRecord)
        .map(([key, value]) =>
          `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`
        )
        .join(" ");

    const baseStyle = getSizeStyle();

    const resolvedStyle =
      typeof style === "string"
        ? `${cssStringFromObject(baseStyle)} ${style}`.trim()
        : { ...baseStyle, ...(style ?? {}) };

    return (
      <div
        ref={panelRef}
        class={cn(
          resizablePanelVariants({ direction: store.value?.direction }),
          className
        )}
        style={resolvedStyle}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

export interface ResizableHandleProps extends PropsOf<"div"> {
  disabled?: boolean;
  withHandle?: boolean;
}

export const ResizableHandle = component$<ResizableHandleProps>(
  ({ disabled = false, withHandle = false, class: className, ...props }) => {
    const handleRef = useSignal<HTMLDivElement>();
    const store = useSignal<ResizableStore | null>(null);
    const isDragging = useSignal(false);
    const startPos = useSignal({ x: 0, y: 0 });
    const startSizes = useSignal<number[]>([]);

    useTask$(({ cleanup }) => {
      const context = document.querySelector("[data-resizable-context]");
      if (context) {
        store.value = JSON.parse(
          context.getAttribute("data-resizable-context") || "{}"
        );
      }

      const handleStateChange = () => {
        const context = document.querySelector("[data-resizable-context]");
        if (context) {
          store.value = JSON.parse(
            context.getAttribute("data-resizable-context") || "{}"
          );
        }
      };

      document.addEventListener("resizable-state-change", handleStateChange);

      cleanup(() => {
        document.removeEventListener(
          "resizable-state-change",
          handleStateChange
        );
      });
    });

    const handleMouseDown = $((event: MouseEvent) => {
      if (disabled || !store.value) return;

      event.preventDefault();
      isDragging.value = true;
      startPos.value = { x: event.clientX, y: event.clientY };
      startSizes.value = [...store.value.sizes];

      document.body.style.cursor =
        store.value.direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    });

    const handleMouseMove = $((event: MouseEvent) => {
      if (!isDragging.value || !store.value || !handleRef.value) return;

      const rect = handleRef.value.getBoundingClientRect();
      const parentRect = handleRef.value.parentElement?.getBoundingClientRect();

      if (!parentRect) return;

      const delta =
        store.value.direction === "horizontal"
          ? event.clientX - startPos.value.x
          : event.clientY - startPos.value.y;

      const parentSize =
        store.value.direction === "horizontal"
          ? parentRect.width
          : parentRect.height;

      const deltaPercent = (delta / parentSize) * 100;

      const newSizes = [...startSizes.value];
      newSizes[0] = Math.max(
        store.value.minSizes[0],
        Math.min(store.value.maxSizes[0], startSizes.value[0] + deltaPercent)
      );
      newSizes[1] = Math.max(
        store.value.minSizes[1],
        Math.min(store.value.maxSizes[1], startSizes.value[1] - deltaPercent)
      );

      store.value.sizes = newSizes;
      store.value.onSizesChange?.(newSizes);

      // Update context
      const context = document.querySelector("[data-resizable-context]");
      if (context) {
        context.setAttribute(
          "data-resizable-context",
          JSON.stringify(store.value)
        );
        context.dispatchEvent(new CustomEvent("resizable-state-change"));
      }
    });

    const handleMouseUp = $(() => {
      if (!isDragging.value) return;

      isDragging.value = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    });

    // Global mouse event listeners
    useOnDocument("mousemove", handleMouseMove);
    useOnDocument("mouseup", handleMouseUp);

    return (
      <div
        ref={handleRef}
        class={cn(
          resizableHandleVariants({ direction: store.value?.direction }),
          className
        )}
        data-direction={store.value?.direction}
        onMouseDown$={handleMouseDown}
        {...props}
      >
        {withHandle && (
          <div class="flex items-center justify-center">
            <GripVertical class="h-4 w-4" />
          </div>
        )}
      </div>
    );
  }
);

// Utility component for two-panel layout
export interface ResizablePanelGroupProps
  extends Omit<ResizableProps, "sizes" | "minSizes" | "maxSizes"> {
  panel1Props?: ResizablePanelProps;
  panel2Props?: ResizablePanelProps;
  defaultSizes?: [number, number];
  minSizes?: [number, number];
  maxSizes?: [number, number];
}

export const ResizablePanelGroup = component$<ResizablePanelGroupProps>(
  ({
    direction = "horizontal",
    defaultSizes = [50, 50],
    minSizes = [20, 20],
    maxSizes = [80, 80],
    panel1Props = {},
    panel2Props = {},
    onSizesChange,
    ...props
  }) => {
    return (
      <Resizable
        direction={direction}
        sizes={defaultSizes}
        minSizes={minSizes}
        maxSizes={maxSizes}
        onSizesChange={onSizesChange}
        {...props}
      >
        <ResizablePanel {...panel1Props}>
          <Slot name="panel1" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel {...panel2Props}>
          <Slot name="panel2" />
        </ResizablePanel>
      </Resizable>
    );
  }
);

// Three-panel layout
export interface ResizableThreePanelGroupProps
  extends Omit<ResizableProps, "sizes" | "minSizes" | "maxSizes"> {
  panel1Props?: ResizablePanelProps;
  panel2Props?: ResizablePanelProps;
  panel3Props?: ResizablePanelProps;
  defaultSizes?: [number, number, number];
  minSizes?: [number, number, number];
  maxSizes?: [number, number, number];
}

export const ResizableThreePanelGroup =
  component$<ResizableThreePanelGroupProps>(
    ({
      direction = "horizontal",
      defaultSizes = [33.33, 33.33, 33.34],
      minSizes = [20, 20, 20],
      maxSizes = [60, 60, 60],
      panel1Props = {},
      panel2Props = {},
      panel3Props = {},
      onSizesChange,
      ...props
    }) => {
      return (
        <Resizable
          direction={direction}
          sizes={defaultSizes}
          minSizes={minSizes}
          maxSizes={maxSizes}
          onSizesChange={onSizesChange}
          {...props}
        >
          <ResizablePanel {...panel1Props}>
            <Slot name="panel1" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel {...panel2Props}>
            <Slot name="panel2" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel {...panel3Props}>
            <Slot name="panel3" />
          </ResizablePanel>
        </Resizable>
      );
    }
  );
