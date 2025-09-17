import { component$, type PropsOf, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends PropsOf<"div">,
    VariantProps<typeof badgeVariants> {}

export const Badge = component$<BadgeProps>(
  ({ class: className, variant, size, ...props }) => {
    return (
      <div class={cn(badgeVariants({ variant, size }), className)} {...props}>
        <Slot />
      </div>
    );
  }
);

// Specialized badge components for common wedding-related statuses
export interface RSVPBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "attending" | "not-attending" | "pending" | "maybe";
}

export const RSVPBadge = component$<RSVPBadgeProps>(({ status, ...props }) => {
  const getVariant = (status: RSVPBadgeProps["status"]) => {
    switch (status) {
      case "attending":
        return "success";
      case "not-attending":
        return "destructive";
      case "pending":
        return "warning";
      case "maybe":
        return "info";
      default:
        return "default";
    }
  };

  const getText = (status: RSVPBadgeProps["status"]) => {
    switch (status) {
      case "attending":
        return "Attending";
      case "not-attending":
        return "Not Attending";
      case "pending":
        return "Pending";
      case "maybe":
        return "Maybe";
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant(status)} {...props}>
      {getText(status)}
    </Badge>
  );
});

export interface VendorCategoryBadgeProps extends Omit<BadgeProps, "variant"> {
  category:
    | "photography"
    | "catering"
    | "venue"
    | "flowers"
    | "music"
    | "other";
}

export const VendorCategoryBadge = component$<VendorCategoryBadgeProps>(
  ({ category, ...props }) => {
    const getText = (category: VendorCategoryBadgeProps["category"]) => {
      switch (category) {
        case "photography":
          return "📸 Photography";
        case "catering":
          return "🍽️ Catering";
        case "venue":
          return "🏛️ Venue";
        case "flowers":
          return "💐 Flowers";
        case "music":
          return "🎵 Music";
        case "other":
          return "Other";
        default:
          return category;
      }
    };

    return (
      <Badge variant="secondary" {...props}>
        {getText(category)}
      </Badge>
    );
  }
);

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "active" | "inactive" | "draft" | "published" | "archived";
}

export const StatusBadge = component$<StatusBadgeProps>(
  ({ status, ...props }) => {
    const getVariant = (status: StatusBadgeProps["status"]) => {
      switch (status) {
        case "active":
        case "published":
          return "success";
        case "inactive":
        case "archived":
          return "secondary";
        case "draft":
          return "warning";
        default:
          return "default";
      }
    };

    const getText = (status: StatusBadgeProps["status"]) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
      <Badge variant={getVariant(status)} {...props}>
        {getText(status)}
      </Badge>
    );
  }
);

// Badge with dot indicator
export interface DotBadgeProps extends Omit<BadgeProps, "children"> {
  color?: "green" | "yellow" | "red" | "blue" | "gray";
  showDot?: boolean;
}

export const DotBadge = component$<DotBadgeProps>(
  ({ class: className, color = "gray", showDot = true, ...props }) => {
    const dotColorClasses = {
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      blue: "bg-blue-500",
      gray: "bg-gray-500",
    };

    return (
      <Badge class={cn("gap-1.5", className)} {...props}>
        {showDot && (
          <div class={cn("h-2 w-2 rounded-full", dotColorClasses[color])} />
        )}
        <Slot />
      </Badge>
    );
  }
);

// Badge with close button
export interface DismissibleBadgeProps extends BadgeProps {
  onDismiss?: () => void;
}

export const DismissibleBadge = component$<DismissibleBadgeProps>(
  ({ class: className, onDismiss, children, ...props }) => {
    return (
      <Badge class={cn("pr-1", className)} {...props}>
        {children}
        <button
          class="ml-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-current"
          onClick$={onDismiss}
          aria-label="Remove"
        >
          <svg
            class="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </Badge>
    );
  }
);
