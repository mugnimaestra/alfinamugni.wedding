import {
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useVisibleTask$,
  $,
  Slot,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

type ToastState = {
  toasts: ToastProps[];
};

const ToastContext = createContextId<ToastState>("toast-context");

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = component$(() => {
  const toastState = useStore<ToastState>({
    toasts: [],
  });

  useContextProvider(ToastContext, toastState);

  return (
    <>
      <Slot />
      <Toaster />
    </>
  );
});

export const toast = (props: Omit<ToastProps, "id">) => {
  const id = Math.random().toString(36).substring(2, 9);
  const context = useContext(ToastContext);

  if (context) {
    context.toasts = [...context.toasts, { ...props, id }];
  }

  return id;
};

export const dismissToast = (id: string) => {
  const context = useContext(ToastContext);
  if (context) {
    context.toasts = context.toasts.filter((toast) => toast.id !== id);
  }
};

export const dismissAllToasts = () => {
  const context = useContext(ToastContext);
  if (context) {
    context.toasts = [];
  }
};

const Toast = component$<ToastProps>(
  ({
    id,
    title,
    description,
    action,
    variant = "default",
    duration = 5000,
  }) => {
    const isVisible = useSignal(true);
    const timeoutId = useSignal<NodeJS.Timeout>();

    useVisibleTask$(() => {
      if (duration > 0) {
        timeoutId.value = setTimeout(() => {
          isVisible.value = false;
          setTimeout(() => dismissToast(id), 300); // Allow animation to complete
        }, duration);
      }

      return () => {
        if (timeoutId.value) {
          clearTimeout(timeoutId.value);
        }
      };
    });

    const handleDismiss = $(() => {
      isVisible.value = false;
      if (timeoutId.value) {
        clearTimeout(timeoutId.value);
      }
      setTimeout(() => dismissToast(id), 300);
    });

    const getVariantStyles = () => {
      switch (variant) {
        case "destructive":
          return "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive";
        case "success":
          return "border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600";
        default:
          return "border-border";
      }
    };

    const getIcon = () => {
      switch (variant) {
        case "destructive":
          return (
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case "success":
          return (
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        default:
          return (
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
      }
    };

    return (
      <div
        class={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          getVariantStyles(),
          isVisible.value
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        )}
      >
        {getIcon()}
        <div class="grid gap-1">
          {title && <div class="text-sm font-semibold">{title}</div>}
          {description && <div class="text-sm opacity-90">{description}</div>}
        </div>
        {action && (
          <button
            class="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick$={action.onClick}
          >
            {action.label}
          </button>
        )}
        <button
          class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick$={handleDismiss}
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }
);

export const Toaster = component$(() => {
  const toastState = useContext(ToastContext);

  if (!toastState) {
    return null;
  }

  return (
    <div class="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toastState.toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
});

// Convenience functions for different toast types
export const toastSuccess = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
) => {
  return toast({
    title,
    description,
    variant: "success",
    action,
  });
};

export const toastError = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
) => {
  return toast({
    title,
    description,
    variant: "destructive",
    action,
  });
};

export const toastInfo = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
) => {
  return toast({
    title,
    description,
    variant: "default",
    action,
  });
};

// Wedding-specific toast functions
export const toastRSVPConfirmed = (guestName: string) => {
  return toastSuccess(
    "RSVP Confirmed!",
    `${guestName} has confirmed their attendance.`,
    {
      label: "View Details",
      onClick: () => console.log("View RSVP details"),
    }
  );
};

export const toastRSVPReminder = (daysLeft: number) => {
  return toast({
    title: "RSVP Reminder",
    description: `Only ${daysLeft} days left until RSVP deadline.`,
    variant: "default",
    action: {
      label: "Send Reminders",
      onClick: () => console.log("Send reminders"),
    },
  });
};

export const toastVendorBooked = (vendorName: string) => {
  return toastSuccess(
    "Vendor Booked!",
    `${vendorName} has been successfully booked.`,
    {
      label: "View Contract",
      onClick: () => console.log("View vendor contract"),
    }
  );
};

export const toastBudgetAlert = (category: string, amount: number) => {
  return toast({
    title: "Budget Alert",
    description: `${category} expense of $${amount.toLocaleString()} recorded.`,
    variant: "destructive",
    duration: 7000,
  });
};
