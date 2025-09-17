import { component$, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type SkeletonProps = QwikIntrinsicElements["div"] & {
  class?: string;
};

export const Skeleton = component$<SkeletonProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
});

// Specific skeleton components for common patterns
type SkeletonTextProps = {
  lines?: number;
  class?: string;
};

export const SkeletonText = component$<SkeletonTextProps>(
  ({ lines = 3, class: className }) => {
    return (
      <div class={cn("space-y-2", className)}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            class={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
          />
        ))}
      </div>
    );
  }
);

type SkeletonCardProps = {
  showAvatar?: boolean;
  showActions?: boolean;
  class?: string;
};

export const SkeletonCard = component$<SkeletonCardProps>(
  ({ showAvatar = false, showActions = false, class: className }) => {
    return (
      <div class={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
        <div class="flex items-start space-x-4">
          {showAvatar && <Skeleton class="h-12 w-12 rounded-full" />}
          <div class="flex-1 space-y-3">
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-1/3" />
              <Skeleton class="h-4 w-1/6" />
            </div>
            <SkeletonText lines={2} />
            {showActions && (
              <div class="flex space-x-2 pt-2">
                <Skeleton class="h-8 w-16" />
                <Skeleton class="h-8 w-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

type SkeletonTableProps = {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  class?: string;
};

export const SkeletonTable = component$<SkeletonTableProps>(
  ({ rows = 5, columns = 4, showHeader = true, class: className }) => {
    return (
      <div class={cn("space-y-3", className)}>
        {showHeader && (
          <div class="flex space-x-4">
            {Array.from({ length: columns }, (_, i) => (
              <Skeleton key={i} class="h-4 flex-1" />
            ))}
          </div>
        )}
        <div class="space-y-3">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} class="flex space-x-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  class={cn(
                    "h-4 flex-1",
                    colIndex === columns - 1 ? "w-1/4" : "w-full"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

type SkeletonListProps = {
  items?: number;
  showAvatar?: boolean;
  class?: string;
};

export const SkeletonList = component$<SkeletonListProps>(
  ({ items = 5, showAvatar = false, class: className }) => {
    return (
      <div class={cn("space-y-4", className)}>
        {Array.from({ length: items }, (_, i) => (
          <div key={i} class="flex items-center space-x-4">
            {showAvatar && <Skeleton class="h-10 w-10 rounded-full" />}
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

type SkeletonFormProps = {
  fields?: number;
  showButtons?: boolean;
  class?: string;
};

export const SkeletonForm = component$<SkeletonFormProps>(
  ({ fields = 4, showButtons = true, class: className }) => {
    return (
      <div class={cn("space-y-6", className)}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} class="space-y-2">
            <Skeleton class="h-4 w-1/4" />
            <Skeleton class="h-10 w-full" />
          </div>
        ))}

        {showButtons && (
          <div class="flex space-x-4 pt-4">
            <Skeleton class="h-10 w-24" />
            <Skeleton class="h-10 w-20" />
          </div>
        )}
      </div>
    );
  }
);

type SkeletonAvatarProps = {
  size?: "sm" | "default" | "lg";
  shape?: "circle" | "square";
  class?: string;
};

export const SkeletonAvatar = component$<SkeletonAvatarProps>(
  ({ size = "default", shape = "circle", class: className }) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
    };

    return (
      <Skeleton
        class={cn(
          sizeClasses[size],
          shape === "circle" ? "rounded-full" : "rounded-md",
          className
        )}
      />
    );
  }
);

type SkeletonButtonProps = {
  size?: "sm" | "default" | "lg";
  variant?: "solid" | "outline";
  class?: string;
};

export const SkeletonButton = component$<SkeletonButtonProps>(
  ({ size = "default", variant = "solid", class: className }) => {
    const sizeClasses = {
      sm: "h-8 px-3",
      default: "h-10 px-4",
      lg: "h-12 px-6",
    };

    return (
      <Skeleton
        class={cn(
          sizeClasses[size],
          "rounded-md",
          variant === "outline" &&
            "bg-transparent border border-muted-foreground/20",
          className
        )}
      />
    );
  }
);

// Wedding-specific skeleton components
type SkeletonGuestCardProps = {
  class?: string;
};

export const SkeletonGuestCard = component$<SkeletonGuestCardProps>(
  ({ class: className }) => {
    return (
      <div class={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <SkeletonAvatar size="sm" />
            <div class="space-y-1">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-24" />
            </div>
          </div>
          <Skeleton class="h-6 w-16 rounded-full" />
        </div>

        <div class="space-y-2">
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-3/4" />
        </div>

        <div class="flex justify-between items-center mt-4">
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-8 w-24" />
        </div>
      </div>
    );
  }
);

type SkeletonVendorCardProps = {
  class?: string;
};

export const SkeletonVendorCard = component$<SkeletonVendorCardProps>(
  ({ class: className }) => {
    return (
      <div class={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-4">
            <SkeletonAvatar size="lg" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-5 w-40" />
              <Skeleton class="h-4 w-24" />
              <div class="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} class="h-3 w-3 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <Skeleton class="h-6 w-20 rounded-full" />
        </div>

        <div class="space-y-3">
          <div class="flex justify-between">
            <Skeleton class="h-4 w-16" />
            <Skeleton class="h-4 w-12" />
          </div>
          <Skeleton class="h-2 w-full" />
        </div>

        <div class="flex space-x-3 mt-4">
          <Skeleton class="h-9 w-24" />
          <Skeleton class="h-9 w-20" />
        </div>
      </div>
    );
  }
);

type SkeletonPhotoGridProps = {
  count?: number;
  class?: string;
};

export const SkeletonPhotoGrid = component$<SkeletonPhotoGridProps>(
  ({ count = 6, class: className }) => {
    return (
      <div class={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} class="aspect-square">
            <Skeleton class="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }
);

type SkeletonRSVPFormProps = {
  class?: string;
};

export const SkeletonRSVPForm = component$<SkeletonRSVPFormProps>(
  ({ class: className }) => {
    return (
      <div class={cn("space-y-6", className)}>
        <div class="space-y-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-10 w-full" />
        </div>

        <div class="space-y-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-10 w-full" />
        </div>

        <div class="space-y-2">
          <Skeleton class="h-4 w-40" />
          <div class="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} class="h-20 rounded-lg" />
            ))}
          </div>
        </div>

        <div class="space-y-2">
          <Skeleton class="h-4 w-36" />
          <Skeleton class="h-24 w-full" />
        </div>

        <div class="flex space-x-4">
          <Skeleton class="h-10 w-24" />
          <Skeleton class="h-10 w-32" />
        </div>
      </div>
    );
  }
);
