import { component$, type PropsOf, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ChevronRight, MoreHorizontal } from "lucide-react";

const breadcrumbVariants = cva(
  "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
  {
    variants: {
      variant: {
        default: "",
        ghost: "text-muted-foreground/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const breadcrumbListVariants = cva(
  "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5"
);

const breadcrumbItemVariants = cva("inline-flex items-center gap-1.5");

const breadcrumbLinkVariants = cva(
  "transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground",
        ghost: "text-muted-foreground/60 hover:text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const breadcrumbPageVariants = cva("font-normal text-foreground", {
  variants: {
    variant: {
      default: "",
      ghost: "text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const breadcrumbSeparatorVariants = cva("[&>svg]:h-3.5 [&>svg]:w-3.5", {
  variants: {
    variant: {
      default: "text-muted-foreground/70",
      ghost: "text-muted-foreground/40",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const breadcrumbEllipsisVariants = cva(
  "flex h-9 w-9 items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "",
        ghost: "hover:text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BreadcrumbProps
  extends PropsOf<"nav">,
    VariantProps<typeof breadcrumbVariants> {}

export const Breadcrumb = component$<BreadcrumbProps>(
  ({ class: className, variant, ...props }) => {
    return (
      <nav
        class={cn(breadcrumbVariants({ variant }), className)}
        aria-label="breadcrumb"
        {...props}
      >
        <BreadcrumbList>
          <Slot />
        </BreadcrumbList>
      </nav>
    );
  }
);

export type BreadcrumbListProps = PropsOf<"ol">;

export const BreadcrumbList = component$<BreadcrumbListProps>(
  ({ class: className, ...props }) => {
    return (
      <ol class={cn(breadcrumbListVariants({}), className)} {...props}>
        <Slot />
      </ol>
    );
  }
);

export type BreadcrumbItemProps = PropsOf<"li">;

export const BreadcrumbItem = component$<BreadcrumbItemProps>(
  ({ class: className, ...props }) => {
    return (
      <li class={cn(breadcrumbItemVariants({}), className)} {...props}>
        <Slot />
      </li>
    );
  }
);

export interface BreadcrumbLinkProps
  extends PropsOf<"a">,
    VariantProps<typeof breadcrumbLinkVariants> {}

export const BreadcrumbLink = component$<BreadcrumbLinkProps>(
  ({ class: className, variant, ...props }) => {
    return (
      <a class={cn(breadcrumbLinkVariants({ variant }), className)} {...props}>
        <Slot />
      </a>
    );
  }
);

export interface BreadcrumbPageProps
  extends PropsOf<"span">,
    VariantProps<typeof breadcrumbPageVariants> {}

export const BreadcrumbPage = component$<BreadcrumbPageProps>(
  ({ class: className, variant, ...props }) => {
    return (
      <span
        class={cn(breadcrumbPageVariants({ variant }), className)}
        aria-current="page"
        {...props}
      >
        <Slot />
      </span>
    );
  }
);

export interface BreadcrumbSeparatorProps
  extends PropsOf<"li">,
    VariantProps<typeof breadcrumbSeparatorVariants> {
  children?: any; // Qwik uses JSXOutput instead of React.ReactNode
}

export const BreadcrumbSeparator = component$<BreadcrumbSeparatorProps>(
  ({ class: className, variant, children, ...props }) => {
    return (
      <li
        class={cn(breadcrumbSeparatorVariants({ variant }), className)}
        role="presentation"
        {...props}
      >
        {children ?? <ChevronRight />}
      </li>
    );
  }
);

export interface BreadcrumbEllipsisProps
  extends PropsOf<"span">,
    VariantProps<typeof breadcrumbEllipsisVariants> {}

export const BreadcrumbEllipsis = component$<BreadcrumbEllipsisProps>(
  ({ class: className, variant, ...props }) => {
    return (
      <span
        class={cn(breadcrumbEllipsisVariants({ variant }), className)}
        role="presentation"
        {...props}
      >
        <MoreHorizontal class="h-4 w-4" />
        <span class="sr-only">More</span>
      </span>
    );
  }
);

// Utility component for easy breadcrumb creation
export interface SimpleBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
  separator?: any; // Qwik uses JSXOutput instead of React.ReactNode
  maxItems?: number;
  variant?: "default" | "ghost";
}

export const SimpleBreadcrumb = component$<SimpleBreadcrumbProps>(
  ({ items, separator, maxItems = 5, variant = "default" }) => {
    const shouldShowEllipsis = items.length > maxItems;
    const visibleItems = shouldShowEllipsis
      ? [
          items[0],
          ...(items.length > 2 ? [{ label: "..." }] : []),
          ...items.slice(-2),
        ]
      : items;

    return (
      <Breadcrumb variant={variant}>
        {visibleItems.map((item, index) => (
          <div key={index}>
            {item.label === "..." ? (
              <BreadcrumbEllipsis variant={variant} />
            ) : item.isCurrentPage ? (
              <BreadcrumbPage variant={variant}>{item.label}</BreadcrumbPage>
            ) : item.href ? (
              <BreadcrumbLink variant={variant} href={item.href}>
                {item.label}
              </BreadcrumbLink>
            ) : (
              <span class={cn(breadcrumbLinkVariants({ variant }))}>
                {item.label}
              </span>
            )}

            {index < visibleItems.length - 1 && (
              <BreadcrumbSeparator variant={variant}>
                {separator}
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </Breadcrumb>
    );
  }
);

// Wedding-specific breadcrumb component
export interface WeddingBreadcrumbProps {
  currentSection:
    | "home"
    | "planning"
    | "vendors"
    | "photos"
    | "guests"
    | "timeline"
    | "registry";
  subSection?: string;
}

export const WeddingBreadcrumb = component$<WeddingBreadcrumbProps>(
  ({ currentSection, subSection }) => {
    type BreadcrumbItem = {
      label: string;
      href?: string;
      isCurrentPage?: boolean;
    };

    const getBreadcrumbItems = (
      section: WeddingBreadcrumbProps["currentSection"],
      subSection?: string
    ) => {
      const baseItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

      const sectionMap: Record<string, BreadcrumbItem[]> = {
        home: [],
        planning: [{ label: "Wedding Planning", href: "/planning" }],
        vendors: [{ label: "Vendors", href: "/vendors" }],
        photos: [{ label: "Photos", href: "/photos" }],
        guests: [{ label: "Guest List", href: "/guests" }],
        timeline: [{ label: "Timeline", href: "/timeline" }],
        registry: [{ label: "Registry", href: "/registry" }],
      };

      const sectionItems: BreadcrumbItem[] = sectionMap[section] || [];

      if (subSection) {
        sectionItems.push({
          label: subSection,
          isCurrentPage: true,
        });
      } else if (section !== "home") {
        // Create a new object instead of mutating existing one
        const lastItem = sectionItems[sectionItems.length - 1];
        sectionItems[sectionItems.length - 1] = {
          ...lastItem,
          isCurrentPage: true
        };
      }

      return [...baseItems, ...sectionItems];
    };

    const items = getBreadcrumbItems(currentSection, subSection);

    return <SimpleBreadcrumb items={items} variant="ghost" maxItems={4} />;
  }
);
