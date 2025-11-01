import {
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  $,
  Slot,
  type QRL,
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

// Separate data state from methods to avoid serialization issues
type ToastDataState = {
  toasts: ToastProps[];
};

type ToastMethods = {
  addToast: QRL<(toast: Omit<ToastProps, "id">) => string>;
  removeToast: QRL<(id: string) => void>;
  clearToasts: QRL<() => void>;
};

type ToastState = ToastDataState & ToastMethods;

const ToastContext = createContextId<ToastState>("toast-context");

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = component$(() => {
  // Store only data in the reactive store - no functions!
  const toastData = useStore<ToastDataState>({
    toasts: [],
  });

  // Define methods outside the store using $() for proper serialization
  const addToast = $((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastData.toasts = [...toastData.toasts, { ...props, id }];
    return id;
  });

  const removeToast = $((id: string) => {
    toastData.toasts = toastData.toasts.filter((toast) => toast.id !== id);
  });

  const clearToasts = $(() => {
    toastData.toasts = [];
  });

  // Combine data and methods for context (methods are QRLs, which are serializable)
  const toastState: ToastState = {
    toasts: toastData.toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  useContextProvider(ToastContext, toastState);
  
  // Set global state for backward compatibility
  setGlobalToastState(toastState);

  return (
    <>
      <Slot />
      <Toaster />
    </>
  );
});

// These functions now need to be used within components that have access to the context
// They are kept for backward compatibility but should be used through the context
export const createToastHelpers = (toastState: ToastState) => ({
  toast: (props: Omit<ToastProps, "id">) => toastState.addToast(props),
  dismissToast: (id: string) => toastState.removeToast(id),
  dismissAllToasts: () => toastState.clearToasts(),
});

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

    const toastState = useContext(ToastContext);

    useTask$(() => {
      if (duration > 0) {
        timeoutId.value = setTimeout(() => {
          isVisible.value = false;
          setTimeout(() => {
            if (toastState) {
              toastState.removeToast(id);
            }
          }, 300); // Allow animation to complete
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
      setTimeout(() => {
        if (toastState) {
          toastState.removeToast(id);
        }
      }, 300);
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

// Hook to get toast helpers within components
export const useToastHelpers = () => {
  const toastState = useToast();
  return createToastHelpers(toastState);
};

// Global helper functions that work with window-level toast state
// These are backward-compatible functions for existing usage
let globalToastState: ToastState | null = null;

// Function to set global toast state (called by ToastProvider)
export const setGlobalToastState = (state: ToastState) => {
  globalToastState = state;
};

export const toast = (props: Omit<ToastProps, "id">): string => {
  if (globalToastState) {
    return globalToastState.addToast(props);
  }
  console.warn('Toast called before ToastProvider is mounted');
  return '';
};

export const dismissToast = (id: string) => {
  if (globalToastState) {
    globalToastState.removeToast(id);
  }
};

export const dismissAllToasts = () => {
  if (globalToastState) {
    globalToastState.clearToasts();
  }
};

// Convenience functions that return toast configuration objects
// These should be used with the toast helpers from useToastHelpers()
export const getToastSuccessConfig = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
): Omit<ToastProps, "id"> => ({
  title,
  description,
  variant: "success",
  action,
});

export const getToastErrorConfig = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
): Omit<ToastProps, "id"> => ({
  title,
  description,
  variant: "destructive",
  action,
});

export const getToastInfoConfig = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
): Omit<ToastProps, "id"> => ({
  title,
  description,
  variant: "default",
  action,
});

// Wedding-specific toast configurations
export const getToastRSVPConfirmedConfig = (guestName: string): Omit<ToastProps, "id"> =>
  getToastSuccessConfig(
    "RSVP Confirmed!",
    `${guestName} has confirmed their attendance.`,
    {
      label: "View Details",
      onClick: () => console.log("View RSVP details"),
    }
  );

export const getToastRSVPReminderConfig = (daysLeft: number): Omit<ToastProps, "id"> => ({
  title: "RSVP Reminder",
  description: `Only ${daysLeft} days left until RSVP deadline.`,
  variant: "default",
  action: {
    label: "Send Reminders",
    onClick: () => console.log("Send reminders"),
  },
});

export const getToastVendorBookedConfig = (vendorName: string): Omit<ToastProps, "id"> =>
  getToastSuccessConfig(
    "Vendor Booked!",
    `${vendorName} has been successfully booked.`,
    {
      label: "View Contract",
      onClick: () => console.log("View vendor contract"),
    }
  );

export const getToastBudgetAlertConfig = (category: string, amount: number): Omit<ToastProps, "id"> => ({
  title: "Budget Alert",
  description: `${category} expense of $${amount.toLocaleString()} recorded.`,
  variant: "destructive",
  duration: 7000,
});

// Convenience functions that use the global toast state (backward compatible)
export const toastSuccess = (
  title: string,
  description?: string,
  action?: ToastProps["action"]
): string => {
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
): string => {
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
): string => {
  return toast({
    title,
    description,
    variant: "default",
    action,
  });
};

// Wedding-specific toast functions (backward compatible)
export const toastRSVPConfirmed = (guestName: string): string => {
  return toastSuccess(
    "RSVP Confirmed!",
    `${guestName} has confirmed their attendance.`,
    {
      label: "View Details",
      onClick: () => console.log("View RSVP details"),
    }
  );
};

export const toastRSVPReminder = (daysLeft: number): string => {
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

export const toastVendorBooked = (vendorName: string): string => {
  return toastSuccess(
    "Vendor Booked!",
    `${vendorName} has been successfully booked.`,
    {
      label: "View Contract",
      onClick: () => console.log("View vendor contract"),
    }
  );
};

export const toastBudgetAlert = (category: string, amount: number): string => {
  return toast({
    title: "Budget Alert",
    description: `${category} expense of $${amount.toLocaleString()} recorded.`,
    variant: "destructive",
    duration: 7000,
  });
};
