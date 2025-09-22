import { component$ } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type ProgressProps = {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "default" | "lg";
  showValue?: boolean;
  animated?: boolean;
  class?: string;
};

export const Progress = component$<ProgressProps>(
  ({
    value = 0,
    max = 100,
    variant = "default",
    size = "default",
    showValue = false,
    animated = true,
    class: className,
  }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantStyles = () => {
      switch (variant) {
        case "success":
          return "bg-green-500";
        case "warning":
          return "bg-yellow-500";
        case "error":
          return "bg-red-500";
        default:
          return "bg-primary";
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return "h-1";
        case "lg":
          return "h-4";
        default:
          return "h-2";
      }
    };

    return (
      <div class={cn("relative", className)}>
        <div
          class={cn(
            "w-full bg-secondary rounded-full overflow-hidden",
            getSizeStyles()
          )}
        >
          <div
            class={cn(
              "h-full rounded-full transition-all duration-300 ease-in-out",
              getVariantStyles(),
              animated && "transition-all duration-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
            <span class="text-xs text-muted-foreground">
              {value}/{max}
            </span>
          </div>
        )}
      </div>
    );
  }
);

type CircularProgressProps = {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  animated?: boolean;
  class?: string;
};

export const CircularProgress = component$<CircularProgressProps>(
  ({
    value = 0,
    max = 100,
    size = 60,
    strokeWidth = 4,
    showValue = false,
    variant = "default",
    animated = true,
    class: className,
  }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getVariantColor = () => {
      switch (variant) {
        case "success":
          return "#10B981";
        case "warning":
          return "#F59E0B";
        case "error":
          return "#EF4444";
        default:
          return "#3B82F6";
      }
    };

    return (
      <div
        class={cn(
          "relative inline-flex items-center justify-center",
          className
        )}
      >
        <svg width={size} height={size} class="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            stroke-width={strokeWidth}
            fill="none"
            class="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getVariantColor()}
            stroke-width={strokeWidth}
            fill="none"
            stroke-linecap="round"
            stroke-dasharray={strokeDasharray}
            stroke-dashoffset={strokeDashoffset}
            class={cn(
              "transition-all duration-300 ease-in-out",
              animated && "transition-all duration-500"
            )}
          />
        </svg>
        {showValue && (
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs font-medium">{percentage.toFixed(0)}%</span>
          </div>
        )}
      </div>
    );
  }
);

type IndeterminateProgressProps = {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  class?: string;
};

export const IndeterminateProgress = component$<IndeterminateProgressProps>(
  ({ size = "default", variant = "default", class: className }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "success":
          return "bg-green-500";
        case "warning":
          return "bg-yellow-500";
        case "error":
          return "bg-red-500";
        default:
          return "bg-primary";
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return "h-1";
        case "lg":
          return "h-4";
        default:
          return "h-2";
      }
    };

    return (
      <div class={cn("relative", className)}>
        <div
          class={cn(
            "w-full bg-secondary rounded-full overflow-hidden",
            getSizeStyles()
          )}
        >
          <div
            class={cn("h-full rounded-full animate-pulse", getVariantStyles())}
            style={{
              animation: "indeterminate-progress 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <style>
          {`
            @keyframes indeterminate-progress {
              0% { width: 0%; margin-left: 0%; }
              50% { width: 50%; margin-left: 25%; }
              100% { width: 0%; margin-left: 100%; }
            }
          `}
        </style>
      </div>
    );
  }
);

type ProgressWithStepsProps = {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  class?: string;
};

export const ProgressWithSteps = component$<ProgressWithStepsProps>(
  ({ currentStep, totalSteps, steps = [], class: className }) => {
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
      <div class={cn("space-y-4", className)}>
        {/* Progress bar */}
        <div class="w-full bg-secondary rounded-full h-2">
          <div
            class="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div class="flex justify-between text-xs">
            {steps.map((step, index) => (
              <div
                key={index}
                class={cn(
                  "flex flex-col items-center",
                  index <= currentStep - 1
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  class={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1",
                    index < currentStep - 1
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStep - 1
                        ? "border-primary text-primary"
                        : "border-muted-foreground"
                  )}
                >
                  {index < currentStep - 1 ? (
                    <svg
                      class="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span class="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span class="text-center max-w-20">{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step counter */}
        <div class="text-center text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    );
  }
);

// Wedding-specific progress components
type UploadProgressProps = {
  fileName: string;
  progress: number;
  class?: string;
};

export const UploadProgress = component$<UploadProgressProps>(
  ({ fileName, progress, class: className }) => {
    return (
      <div class={cn("space-y-2", className)}>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium truncate">{fileName}</span>
          <span class="text-xs text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} size="sm" />
      </div>
    );
  }
);

type RSVPProgressProps = {
  confirmed: number;
  pending: number;
  declined: number;
  total: number;
  class?: string;
};

export const RSVPProgress = component$<RSVPProgressProps>(
  ({ confirmed, pending, declined, total, class: className }) => {
    const confirmedPercentage = (confirmed / total) * 100;
    const pendingPercentage = (pending / total) * 100;
    const declinedPercentage = (declined / total) * 100;

    return (
      <div class={cn("space-y-4", className)}>
        <div class="flex justify-between items-center">
          <h4 class="text-sm font-medium">RSVP Progress</h4>
          <span class="text-sm text-muted-foreground">
            {confirmed + pending}/{total} responses
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-green-600">Confirmed ({confirmed})</span>
            <span>{confirmedPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={confirmedPercentage} variant="success" size="sm" />

          <div class="flex justify-between text-xs">
            <span class="text-yellow-600">Pending ({pending})</span>
            <span>{pendingPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={pendingPercentage} variant="warning" size="sm" />

          <div class="flex justify-between text-xs">
            <span class="text-red-600">Declined ({declined})</span>
            <span>{declinedPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={declinedPercentage} variant="error" size="sm" />
        </div>
      </div>
    );
  }
);
