import {
  component$,
  useSignal,
  useTask$,
  type PropsOf,
  Slot,
  $,
  type QRL,
} from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const avatarVariants = cva(
  "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-6 w-6",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarImageVariants = cva("aspect-square h-full w-full");

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface AvatarProps
  extends PropsOf<"div">,
    VariantProps<typeof avatarVariants> {}

export const Avatar = component$<AvatarProps>(
  ({ class: className, size, ...props }) => {
    return (
      <div class={cn(avatarVariants({ size }), className)} {...props}>
        <Slot />
      </div>
    );
  }
);

export interface AvatarImageProps extends PropsOf<"img"> {
  onLoadingStatusChange$?: QRL<(status: "loading" | "loaded" | "error") => void>;
}

export const AvatarImage = component$<AvatarImageProps>(
  ({ class: className, onLoadingStatusChange$, onLoad$, onError$, ...imgProps }) => {
    const loadingStatus = useSignal<"loading" | "loaded" | "error">("loading");

    useTask$(({ track }) => {
      track(() => loadingStatus.value);
      onLoadingStatusChange$?.(loadingStatus.value);
    });

    return (
      <img
        class={cn(avatarImageVariants({}), className)}
        onLoad$={[
          onLoad$,
          $(() => {
            loadingStatus.value = "loaded";
          }),
        ]}
        onError$={[
          onError$,
          $(() => {
            loadingStatus.value = "error";
          }),
        ]}
        {...imgProps}
      />
    );
  }
);

export interface AvatarFallbackProps extends PropsOf<"div"> {
  delayMs?: number;
}

export interface AvatarFallbackProps
  extends PropsOf<"div">,
    VariantProps<typeof avatarFallbackVariants> {
  delayMs?: number;
}

export const AvatarFallback = component$<AvatarFallbackProps>(
  ({ class: className, delayMs, size, ...props }) => {
    const canRender = useSignal(!delayMs);

    useTask$(() => {
      if (delayMs) {
        const timer = setTimeout(() => {
          canRender.value = true;
        }, delayMs);

        return () => clearTimeout(timer);
      }
    });

    if (!canRender.value) return null;

    return (
      <div class={cn(avatarFallbackVariants({ size }), className)} {...props}>
        <Slot />
      </div>
    );
  }
);

// Utility component for generating initials from a name
export interface AvatarInitialsProps {
  name: string;
  size?: "sm" | "default" | "lg" | "xl" | null | undefined;
}

export const AvatarInitials = component$<AvatarInitialsProps>(
  ({ name, size = "default" }) => {
    const initials = useSignal("");

    useTask$(() => {
      const nameParts = name.trim().split(/\s+/);
      if (nameParts.length === 1) {
        initials.value = nameParts[0].charAt(0).toUpperCase();
      } else if (nameParts.length >= 2) {
        initials.value = (
          nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
        ).toUpperCase();
      }
    });

    return <AvatarFallback size={size}>{initials.value}</AvatarFallback>;
  }
);

// Complete avatar with image and fallback
export interface CompleteAvatarProps extends AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  delayMs?: number;
}

export const CompleteAvatar = component$<CompleteAvatarProps>(
  ({ src, alt = "", name, delayMs, ...props }) => {
    return (
      <Avatar {...props}>
        {src && (
          <AvatarImage
            src={src}
            alt={alt}
            onLoadingStatusChange$={(status) => {
              if (status === "error") {
                console.warn("Avatar image failed to load:", src);
              }
            }}
          />
        )}
        <AvatarFallback delayMs={delayMs}>
          {name ? <AvatarInitials name={name} size={props.size} /> : "?"}
        </AvatarFallback>
      </Avatar>
    );
  }
);
