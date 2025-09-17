import { component$, type QwikIntrinsicElements, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600",
        info: "border-blue-500/50 text-blue-700 dark:border-blue-500 dark:text-blue-400 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type AlertProps = QwikIntrinsicElements["div"] &
  VariantProps<typeof alertVariants> & {
    dismissible?: boolean;
    onDismiss$?: () => void;
  };

const Alert = component$<AlertProps>(
  ({
    class: className,
    variant,
    dismissible = false,
    onDismiss$,
    ...props
  }) => {
    return (
      <div
        role="alert"
        class={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Slot />
        {dismissible && (
          <button
            type="button"
            class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick$={onDismiss$}
            aria-label="Dismiss"
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
        )}
      </div>
    );
  }
);

type AlertTitleProps = QwikIntrinsicElements["h5"];

const AlertTitle = component$<AlertTitleProps>(
  ({ class: className, ...props }) => {
    return (
      <h5
        class={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
      >
        <Slot />
      </h5>
    );
  }
);

type AlertDescriptionProps = QwikIntrinsicElements["div"];

const AlertDescription = component$<AlertDescriptionProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

type AlertActionProps = QwikIntrinsicElements["div"];

const AlertAction = component$<AlertActionProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn("mt-3 flex items-center gap-2", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

// Wedding-specific alert components
type RSVPAlertProps = {
  type: "success" | "warning" | "error";
  guestName: string;
  action?: "confirmed" | "declined" | "pending";
  class?: string;
};

const RSVPAlert = component$<RSVPAlertProps>(
  ({ type, guestName, action = "confirmed", class: className }) => {
    const getIcon = () => {
      switch (type) {
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
        case "warning":
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          );
        case "error":
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
        default:
          return null;
      }
    };

    const getMessage = () => {
      switch (action) {
        case "confirmed":
          return `Great! ${guestName} has confirmed their attendance.`;
        case "declined":
          return `${guestName} has regretfully declined the invitation.`;
        case "pending":
          return `${guestName} is still considering their response.`;
        default:
          return `RSVP update for ${guestName}.`;
      }
    };

    return (
      <Alert
        variant={
          type === "success"
            ? "success"
            : type === "warning"
              ? "warning"
              : "destructive"
        }
        class={className}
      >
        {getIcon()}
        <AlertTitle>RSVP Update</AlertTitle>
        <AlertDescription>{getMessage()}</AlertDescription>
      </Alert>
    );
  }
);

type BudgetAlertProps = {
  type: "warning" | "error";
  category: string;
  amount: number;
  budget: number;
  class?: string;
};

const BudgetAlert = component$<BudgetAlertProps>(
  ({ type, category, amount, budget, class: className }) => {
    const percentage = (amount / budget) * 100;
    const isOverBudget = amount > budget;

    return (
      <Alert
        variant={type === "warning" ? "warning" : "destructive"}
        class={className}
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
        <AlertTitle>Budget Alert</AlertTitle>
        <AlertDescription>
          {isOverBudget
            ? `${category} has exceeded budget by $${(amount - budget).toLocaleString()} (${percentage.toFixed(1)}% of budget)`
            : `${category} is at ${percentage.toFixed(1)}% of budget ($${amount.toLocaleString()} of $${budget.toLocaleString()})`}
        </AlertDescription>
      </Alert>
    );
  }
);

type TimelineAlertProps = {
  type: "info" | "warning";
  event: string;
  daysUntil: number;
  class?: string;
};

const TimelineAlert = component$<TimelineAlertProps>(
  ({ type, event, daysUntil, class: className }) => {
    const isUrgent = daysUntil <= 7;

    return (
      <Alert
        variant={type === "warning" ? "warning" : "info"}
        class={className}
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <AlertTitle>Timeline Reminder</AlertTitle>
        <AlertDescription>
          {isUrgent
            ? `URGENT: ${event} is in ${daysUntil} days!`
            : `${event} is scheduled for ${daysUntil} days from now.`}
        </AlertDescription>
        {isUrgent && (
          <AlertAction>
            <button class="text-sm underline hover:no-underline">
              View details
            </button>
          </AlertAction>
        )}
      </Alert>
    );
  }
);

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
  RSVPAlert,
  BudgetAlert,
  TimelineAlert,
};
