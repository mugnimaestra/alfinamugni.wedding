import { component$, useSignal, useStore, useContext, createContextId, useContextProvider, useTask$, $, type PropsOf, Slot, type QRL } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

// Sidebar context
interface SidebarContextState {
  state: "expanded" | "collapsed";
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
}

const SidebarContext = createContextId<SidebarContextState>("sidebar");

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: QRL<(open: boolean) => void>;
  class?: string;
  style?: Record<string, string | number>;
  children?: any;
}

export const SidebarProvider = component$<SidebarProviderProps>(({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  class: className,
  style,
  ...props
}) => {
  const isMobile = useSignal(false);
  const openMobile = useSignal(false);
  const internalOpen = useSignal(defaultOpen);
  
  const open = openProp ?? internalOpen.value;
  const state = open ? "expanded" : "collapsed";

  const sidebarStore = useStore<SidebarContextState>({
    state,
    open,
    openMobile: openMobile.value,
    isMobile: isMobile.value,
    toggleSidebar: $(() => {
      if (isMobile.value) {
        openMobile.value = !openMobile.value;
      } else {
        const newOpen = !open;
        if (onOpenChange) {
          onOpenChange(newOpen);
        } else {
          internalOpen.value = newOpen;
        }
      }
    }),
    setOpen: $((newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        internalOpen.value = newOpen;
      }
    }),
    setOpenMobile: $((newOpen: boolean) => {
      openMobile.value = newOpen;
    }),
  });

  // Update context when props change
  useTask$(({ track }) => {
    track(() => openProp);
    track(() => open);
    track(() => state);
    sidebarStore.open = open;
    sidebarStore.state = state;
  });

  // Check if mobile on mount
  useTask$(({ cleanup }) => {
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
      sidebarStore.isMobile = isMobile.value;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    cleanup(() => {
      window.removeEventListener('resize', checkMobile);
    });
  });

  useContextProvider(SidebarContext, sidebarStore);

  return (
    <div
      class={cn(
        "group/sidebar-wrapper flex min-h-svh w-full",
        className
      )}
      style={{
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...(style || {}),
      }}
      {...props}
    >
      <Slot />
    </div>
  );
});

export interface SidebarProps extends PropsOf<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export const Sidebar = component$<SidebarProps>(({
  side = "left",
  variant = "sidebar", 
  collapsible = "offcanvas",
  class: className,
  ...props
}) => {
  const sidebar = useContext(SidebarContext);
  
  if (!sidebar) {
    throw new Error("Sidebar must be used within a SidebarProvider");
  }

  if (collapsible === "none") {
    return (
      <div
        class={cn(
          "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        <Slot />
      </div>
    );
  }

  // For mobile, we could integrate with Sheet component
  if (sidebar.isMobile) {
    return (
      <div
        class={cn(
          "fixed inset-y-0 z-50 w-[--sidebar-width] bg-sidebar text-sidebar-foreground transition-transform duration-300",
          side === "left" ? "left-0" : "right-0",
          sidebar.openMobile ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
          className
        )}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
        }}
        {...props}
      >
        <Slot />
      </div>
    );
  }

  return (
    <div
      class="group peer hidden md:block text-sidebar-foreground"
      data-state={sidebar.state}
      data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      <div
        class={cn(
          "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
        )}
      />
      <div
        class={cn(
          "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
        >
          <Slot />
        </div>
      </div>
    </div>
  );
});

export type SidebarTriggerProps = PropsOf<"button">;

export const SidebarTrigger = component$<SidebarTriggerProps>(({ class: className, onClick$, ...props }) => {
  const sidebar = useContext(SidebarContext);
  
  if (!sidebar) {
    throw new Error("SidebarTrigger must be used within a SidebarProvider");
  }

  return (
    <button
      data-sidebar="trigger"
      class={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 w-7",
        className
      )}
      onClick$={[onClick$, sidebar.toggleSidebar]}
      {...props}
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
      <span class="sr-only">Toggle Sidebar</span>
    </button>
  );
});

export type SidebarContentProps = PropsOf<"div">;

export const SidebarContent = component$<SidebarContentProps>(({ class: className, ...props }) => {
  return (
    <div
      data-sidebar="content"
      class={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type SidebarHeaderProps = PropsOf<"div">;

export const SidebarHeader = component$<SidebarHeaderProps>(({ class: className, ...props }) => {
  return (
    <div
      data-sidebar="header"
      class={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type SidebarFooterProps = PropsOf<"div">;

export const SidebarFooter = component$<SidebarFooterProps>(({ class: className, ...props }) => {
  return (
    <div
      data-sidebar="footer"
      class={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type SidebarMenuProps = PropsOf<"ul">;

export const SidebarMenu = component$<SidebarMenuProps>(({ class: className, ...props }) => {
  return (
    <ul
      data-sidebar="menu"
      class={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    >
      <Slot />
    </ul>
  );
});

export type SidebarMenuItemProps = PropsOf<"li">;

export const SidebarMenuItem = component$<SidebarMenuItemProps>(({ class: className, ...props }) => {
  return (
    <li
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", className)}
      {...props}
    >
      <Slot />
    </li>
  );
});

export type SidebarMenuButtonProps = PropsOf<"button"> & {
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
};

export const SidebarMenuButton = component$<SidebarMenuButtonProps>(({ 
  class: className, 
  isActive = false,
  variant = "default", // eslint-disable-line @typescript-eslint/no-unused-vars
  size = "default", // eslint-disable-line @typescript-eslint/no-unused-vars
  ...props 
}) => {
  return (
    <button
      data-sidebar="menu-button"
      data-active={isActive}
      class={cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    >
      <Slot />
    </button>
  );
});

// Export the useSidebar hook
export const useSidebar = () => {
  const sidebar = useContext(SidebarContext);
  if (!sidebar) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return sidebar;
};
