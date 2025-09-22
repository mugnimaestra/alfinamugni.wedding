import {
  component$,
  useSignal,
  useStore,
  useTask$,
  useOnDocument,
  type PropsOf,
  Slot,
  $
} from "@builder.io/qwik";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";

// Menubar Context Store
interface MenubarStore {
  activeMenu: string | null;
  onValueChange?: (value: string | null) => void;
}

const menubarVariants = cva(
  "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
);


const menubarTriggerVariants = cva(
  "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
);

const menubarContentVariants = cva(
  "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in slide-in-from-top-1",
);

const menubarItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive: "text-destructive focus:bg-destructive/10 focus:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const menubarSeparatorVariants = cva(
  "-mx-1 my-1 h-px bg-muted"
);

const menubarShortcutVariants = cva(
  "ml-auto text-xs tracking-widest text-muted-foreground"
);

const menubarLabelVariants = cva(
  "px-2 py-1.5 text-sm font-semibold"
);

const menubarCheckboxItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
);

const menubarRadioItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
);

export interface MenubarProps extends PropsOf<"div"> {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
}

export const Menubar = component$<MenubarProps>(({
  class: className,
  value,
  onValueChange,
  ...props
}) => {
  const store = useStore<MenubarStore>({
    activeMenu: value ?? null,
    onValueChange,
  });

  useTask$(({ track }) => {
    track(() => value);
    if (value !== undefined) {
      store.activeMenu = value;
    }
  });

  // Close menubar when clicking outside
  useOnDocument('click', $((event: Event) => {
    const target = event.target as Element;
    const menubar = document.querySelector('[data-menubar-context]');

    if (menubar && !menubar.contains(target)) {
      store.activeMenu = null;
      store.onValueChange?.(null);
      menubar.setAttribute('data-menubar-context', JSON.stringify(store));
      menubar.dispatchEvent(new CustomEvent('menubar-state-change'));
    }
  }));

  // Close menubar on escape
  useOnDocument('keydown', $((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      store.activeMenu = null;
      store.onValueChange?.(null);
      const menubar = document.querySelector('[data-menubar-context]');
      if (menubar) {
        menubar.setAttribute('data-menubar-context', JSON.stringify(store));
        menubar.dispatchEvent(new CustomEvent('menubar-state-change'));
      }
    }
  }));

  return (
    <div
      class={cn(menubarVariants({}), className)}
      data-menubar-context={JSON.stringify(store)}
      {...props}
    >
      <Slot />
    </div>
  );
});

export interface MenubarMenuProps extends PropsOf<"div"> {
  value?: string;
}

export const MenubarMenu = component$<MenubarMenuProps>(({ value, ...props }) => {
  return (
    <div
      data-menubar-menu={value}
      {...props}
    >
      <Slot />
    </div>
  );
});

export interface MenubarTriggerProps extends PropsOf<"button"> {
  disabled?: boolean;
}

export const MenubarTrigger = component$<MenubarTriggerProps>(({
  class: className,
  disabled,
  onClick$,
  ...props
}) => {
  const isOpen = useSignal(false);
  const triggerRef = useSignal<HTMLButtonElement>();

  useTask$(({ cleanup }) => {
    const handleStateChange = () => {
      const menubar = document.querySelector('[data-menubar-context]');
      if (menubar) {
        const store: MenubarStore = JSON.parse(menubar.getAttribute('data-menubar-context') || '{}');
        const menu = triggerRef.value
          ?.closest('[data-menubar-menu]')
          ?.getAttribute('data-menubar-menu');
        isOpen.value = store.activeMenu === menu;
      }
    };

    document.addEventListener('menubar-state-change', handleStateChange);
    handleStateChange();

    cleanup(() => {
      document.removeEventListener('menubar-state-change', handleStateChange);
    });
  });

  return (
    <button
      ref={triggerRef}
      class={cn(
        menubarTriggerVariants({}),
        className
      )}
      data-state={isOpen.value ? "open" : "closed"}
      disabled={disabled}
      onClick$={[
        onClick$,
        $((_, element: Element) => {
          const menubar = document.querySelector('[data-menubar-context]');
          const menu = element.closest('[data-menubar-menu]')?.getAttribute('data-menubar-menu');

          if (menubar && menu) {
            const store: MenubarStore = JSON.parse(menubar.getAttribute('data-menubar-context') || '{}');
            const newActiveMenu = store.activeMenu === menu ? null : menu;
            store.activeMenu = newActiveMenu;
            store.onValueChange?.(newActiveMenu);
            menubar.setAttribute('data-menubar-context', JSON.stringify(store));
            menubar.dispatchEvent(new CustomEvent('menubar-state-change'));
          }
        }),
      ]}
      {...props}
    >
      <Slot />
      <ChevronDown class="ml-1 h-4 w-4" />
    </button>
  );
});

export interface MenubarContentProps extends PropsOf<"div"> {
  align?: "start" | "center" | "end";
}

export const MenubarContent = component$<MenubarContentProps>(({
  class: className,
  align = "start",
  ...props
}) => {
  const isOpen = useSignal(false);
  const contentRef = useSignal<HTMLDivElement>();

  useTask$(({ cleanup }) => {
    const handleStateChange = () => {
      const menubar = document.querySelector('[data-menubar-context]');
      if (menubar) {
        const store: MenubarStore = JSON.parse(menubar.getAttribute('data-menubar-context') || '{}');
        const menu = document.querySelector('[data-menubar-menu]');
        const menuValue = menu?.getAttribute('data-menubar-menu');
        isOpen.value = store.activeMenu === menuValue;
      }
    };

    document.addEventListener('menubar-state-change', handleStateChange);
    handleStateChange();

    cleanup(() => {
      document.removeEventListener('menubar-state-change', handleStateChange);
    });
  });

  if (!isOpen.value) return null;

  const getContentPosition = () => {
    const trigger = document.querySelector('[data-menubar-trigger]');
    if (!trigger || !contentRef.value) return {};

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = contentRef.value.getBoundingClientRect();

    let left: number;

    switch (align) {
      case 'start':
        left = triggerRect.left;
        break;
      case 'center':
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
        break;
      case 'end':
        left = triggerRect.right - contentRect.width;
        break;
    }

    return {
      left: Math.max(0, left),
      top: triggerRect.bottom + 4
    };
  };

  return (
    <div
      ref={contentRef}
      class={cn(
        menubarContentVariants({}),
        className
      )}
      data-state={isOpen.value ? "open" : "closed"}
      style={{
        position: 'fixed',
        zIndex: 50,
        ...getContentPosition(),
      }}
      {...props}
    >
      <Slot />
    </div>
  );
});

export interface MenubarItemProps extends PropsOf<"div"> {
  disabled?: boolean;
  onSelect?: () => void;
  inset?: boolean;
}

export const MenubarItem = component$<MenubarItemProps>(({
  class: className,
  disabled,
  onSelect,
  inset,
  onClick$,
  ...props
}) => {
  return (
    <div
      class={cn(
        menubarItemVariants({}),
        inset && "pl-8",
        className
      )}
      data-disabled={disabled}
      onClick$={[
        onClick$,
        $(() => {
          if (!disabled && onSelect) {
            onSelect();

            // Close menubar after selection
            const menubar = document.querySelector('[data-menubar-context]');
            if (menubar) {
              const store: MenubarStore = JSON.parse(menubar.getAttribute('data-menubar-context') || '{}');
              store.activeMenu = null;
              store.onValueChange?.(null);
              menubar.setAttribute('data-menubar-context', JSON.stringify(store));
              menubar.dispatchEvent(new CustomEvent('menubar-state-change'));
            }
          }
        }),
      ]}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type MenubarSeparatorProps = PropsOf<"div">;

export const MenubarSeparator = component$<MenubarSeparatorProps>(({
  class: className,
  ...props
}) => {
  return (
    <div
      class={cn(menubarSeparatorVariants({}), className)}
      {...props}
    />
  );
});

export type MenubarShortcutProps = PropsOf<"span">;

export const MenubarShortcut = component$<MenubarShortcutProps>(({
  class: className,
  ...props
}) => {
  return (
    <span
      class={cn(menubarShortcutVariants({}), className)}
      {...props}
    >
      <Slot />
    </span>
  );
});

export type MenubarLabelProps = PropsOf<"div">;

export const MenubarLabel = component$<MenubarLabelProps>(({
  class: className,
  ...props
}) => {
  return (
    <div
      class={cn(menubarLabelVariants({}), className)}
      {...props}
    >
      <Slot />
    </div>
  );
});

export interface MenubarCheckboxItemProps extends PropsOf<"div"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const MenubarCheckboxItem = component$<MenubarCheckboxItemProps>(({
  class: className,
  checked,
  onCheckedChange,
  disabled,
  ...props
}) => {
  return (
    <div
      class={cn(
        menubarCheckboxItemVariants({}),
        className
      )}
      data-disabled={disabled}
      onClick$={() => {
        if (!disabled && onCheckedChange) {
          onCheckedChange(!checked);
        }
      }}
      {...props}
    >
      <Slot />
    </div>
  );
});

export interface MenubarRadioItemProps extends PropsOf<"div"> {
  value?: string;
  disabled?: boolean;
}

export const MenubarRadioItem = component$<MenubarRadioItemProps>(({
  class: className,
  disabled,
  ...props
}) => {
  return (
    <div
      class={cn(
        menubarRadioItemVariants({}),
        className
      )}
      data-disabled={disabled}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type MenubarSubProps = PropsOf<"div">;

export const MenubarSub = component$<MenubarSubProps>(({ ...props }) => {
  return <div {...props}><Slot /></div>;
});

export type MenubarSubTriggerProps = PropsOf<"div">;

export const MenubarSubTrigger = component$<MenubarSubTriggerProps>(({
  class: className,
  ...props
}) => {
  return (
    <div
      class={cn(
        menubarItemVariants({}),
        "justify-between",
        className
      )}
      {...props}
    >
      <Slot />
      <ChevronDown class="h-4 w-4 rotate-[-90deg]" />
    </div>
  );
});

export type MenubarSubContentProps = PropsOf<"div">;

export const MenubarSubContent = component$<MenubarSubContentProps>(({
  class: className,
  ...props
}) => {
  return (
    <div
      class={cn(
        menubarContentVariants({}),
        "ml-2",
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});

export type MenubarRadioGroupProps = PropsOf<"div">;

export const MenubarRadioGroup = component$<MenubarRadioGroupProps>(({ ...props }) => {
  return <div {...props}><Slot /></div>;
});
