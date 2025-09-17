import {
  component$,
  type QwikIntrinsicElements,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type TextareaProps = QwikIntrinsicElements["textarea"] & {
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
};

export const Textarea = component$<TextareaProps>(
  ({
    autoResize = false,
    minRows = 3,
    maxRows = 10,
    class: className,
    value,
    onInput$: externalOnInput$,
    ...props
  }) => {
    const textareaRef = useSignal<HTMLTextAreaElement>();
    const currentValue = useSignal(value || "");

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        currentValue.value = value as string;
      }
    });

    useVisibleTask$(({ track }) => {
      track(() => currentValue.value);
      if (autoResize && textareaRef.value) {
        adjustHeight();
      }
    });

    const adjustHeight = () => {
      if (!textareaRef.value || !autoResize) return;

      const textarea = textareaRef.value;
      const minHeight = minRows * 24; // Approximate line height
      const maxHeight = maxRows * 24;

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight < minHeight) {
        textarea.style.height = `${minHeight}px`;
      } else if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = "hidden";
      }
    };

    const runExternalHandlers = (
      handlers: typeof externalOnInput$ | undefined,
      event: Event,
      element: HTMLTextAreaElement
    ) => {
      if (!handlers) return;
      const list = Array.isArray(handlers) ? handlers : [handlers];
      list.forEach((handler) => {
        if (!handler) return;
        (handler as (event: Event, element: HTMLTextAreaElement) => void)(
          event,
          element,
        );
      });
    };

    const handleInput = (event: Event, element?: Element) => {
      const target = (element as HTMLTextAreaElement) ??
        (event.target as HTMLTextAreaElement);
      currentValue.value = target.value;

      if (autoResize) {
        adjustHeight();
      }

      runExternalHandlers(externalOnInput$, event, target);
    };

    return (
      <textarea
        ref={textareaRef}
        value={currentValue.value}
        onInput$={(event, element) => handleInput(event, element)}
        class={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          autoResize && "resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
