/* eslint-disable qwik/use-method-usage */
import {
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  $,
  type QRL,
} from "@builder.io/qwik";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: QRL<() => void>;
  };
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  open: boolean;
  createdAt: Date;
}

export interface ToastState {
  toasts: Toast[];
}

export interface ToastAction {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: QRL<() => void>;
  };
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
}

const ToastContextId = createContextId<ToastState>("toast-context");

export const useToastProvider = () => {
  const toastState = useStore<ToastState>({
    toasts: [],
  });

  useContextProvider(ToastContextId, toastState);

  return toastState;
};

export const useToast = () => {
  const context = useContext(ToastContextId);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const addToast = $((toast: ToastAction) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newToast: Toast = {
      id,
      title: toast.title,
      description: toast.description,
      action: toast.action,
      variant: toast.variant || "default",
      duration: toast.duration ?? 5000,
      open: true,
      createdAt: new Date(),
    };

    context.toasts = [...context.toasts, newToast];

    // Auto-dismiss after duration
    if (newToast.duration !== undefined && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  });

  const dismissToast = $((id: string) => {
    context.toasts = context.toasts.map(toast =>
      toast.id === id ? { ...toast, open: false } : toast
    );

    // Remove from array after animation
    setTimeout(() => {
      context.toasts = context.toasts.filter(toast => toast.id !== id);
    }, 300); // Match animation duration
  });

  const dismissAll = $(() => {
    context.toasts = context.toasts.map(toast => ({ ...toast, open: false }));

    setTimeout(() => {
      context.toasts = [];
    }, 300);
  });

  const updateToast = $((id: string, updates: Partial<ToastAction>) => {
    context.toasts = context.toasts.map(toast =>
      toast.id === id
        ? {
            ...toast,
            ...updates,
            action: updates.action || toast.action,
          }
        : toast
    );
  });

  return {
    toasts: context.toasts,
    addToast,
    dismissToast,
    dismissAll,
    updateToast,
  };
};

// Convenience functions for different toast types
export const toast = {
  default: (props: Omit<ToastAction, "variant">) =>
    useToast().addToast({ ...props, variant: "default" }),

  success: (props: Omit<ToastAction, "variant">) =>
    useToast().addToast({ ...props, variant: "success" }),

  error: (props: Omit<ToastAction, "variant">) =>
    useToast().addToast({ ...props, variant: "destructive" }),

  warning: (props: Omit<ToastAction, "variant">) =>
    useToast().addToast({ ...props, variant: "warning" }),

  dismiss: (id: string) => useToast().dismissToast(id),

  dismissAll: () => useToast().dismissAll(),
};

// Hook for managing toast queue and limits
export const useToastQueue = (maxToasts: number = 3) => {
  const { toasts, addToast, dismissToast } = useToast();

  const addToQueue = $((toast: ToastAction) => {
    // If we have too many toasts, dismiss the oldest one
    if (toasts.length >= maxToasts) {
      const oldestToast = toasts[0];
      if (oldestToast) {
        dismissToast(oldestToast.id);
      }
    }

    return addToast(toast);
  });

  return {
    addToQueue,
    dismissToast,
    toasts,
    maxToasts,
  };
};

// Hook for persistent toasts (that don't auto-dismiss)
export const usePersistentToast = () => {
  const { addToast, dismissToast } = useToast();

  const addPersistentToast = $((toast: Omit<ToastAction, "duration">) => {
    return addToast({ ...toast, duration: 0 });
  });

  return {
    addPersistentToast,
    dismissToast,
  };
};

// Hook for loading toasts
export const useLoadingToast = () => {
  const { addToast, updateToast, dismissToast } = useToast();

  const showLoading = $((message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return addToast({
      id,
      title: "Loading...",
      description: message,
      duration: 0, // Don't auto-dismiss
    });
  });

  const updateLoading = $((id: string, updates: { title?: string; description?: string }) => {
    updateToast(id, updates);
  });

  const hideLoading = $((id: string) => {
    dismissToast(id);
  });

  return {
    showLoading,
    updateLoading,
    hideLoading,
  };
};

// Hook for confirmation toasts
export const useConfirmationToast = () => {
  const { addToast } = useToast();

  const showConfirmation = $((options: {
    title: string;
    description?: string;
    onConfirm: QRL<() => void>;
    confirmText?: string;
  }) => {
    const {
      title,
      description,
      onConfirm,
      confirmText = "Confirm",
    } = options;
    
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return addToast({
      id,
      title,
      description,
      action: {
        label: confirmText,
        onClick: onConfirm,
      },
      duration: 0, // Don't auto-dismiss
    });
  });

  return {
    showConfirmation,
  };
};

// Toast position and animation hooks
export const useToastPosition = () => {
  const position = useSignal<"top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center">("top-right");

  const setPosition = $((newPosition: typeof position.value) => {
    position.value = newPosition;
  });

  return {
    position,
    setPosition,
  };
};

// Hook for toast animation states
export const useToastAnimation = () => {
  const isAnimating = useSignal(false);
  const animationQueue = useSignal<string[]>([]);

  const startAnimation = $((id: string) => {
    animationQueue.value = [...animationQueue.value, id];
    isAnimating.value = true;
  });

  const endAnimation = $((id: string) => {
    animationQueue.value = animationQueue.value.filter(queueId => queueId !== id);
    isAnimating.value = animationQueue.value.length > 0;
  });

  return {
    isAnimating,
    startAnimation,
    endAnimation,
  };
};
