import {
  component$,
  type QwikIntrinsicElements,
  type JSXOutput,
  Slot,
  useSignal,
  useTask$,
  useOnDocument,
  $,
} from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type CommandProps = QwikIntrinsicElements["div"] & {
  class?: string;
  value?: string;
};

export const Command = component$<CommandProps>(
  ({ class: className, value, ...props }) => {
    const searchValue = useSignal(value || "");

    useTask$(({ track }) => {
      track(() => value);
      if (value !== undefined) {
        searchValue.value = value;
      }
    });

    return (
      <div
        class={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className
        )}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

type CommandInputProps = QwikIntrinsicElements["input"] & {
  placeholder?: string;
  value?: string;
  onValueChange$?: (value: string) => void;
};

export const CommandInput = component$<CommandInputProps>(
  ({
    class: className,
    placeholder = "Type a command or search...",
    value,
    onValueChange$,
    ...props
  }) => {
    const inputValue = useSignal(value || "");

    const handleInput = $((event: Event) => {
      const target = event.target as HTMLInputElement;
      inputValue.value = target.value;
      onValueChange$?.(target.value);
    });

    return (
      <div class="flex items-center border-b px-3" cmdk-input-wrapper="">
        <svg
          class="mr-2 h-4 w-4 shrink-0 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          class={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder={placeholder}
          value={inputValue.value}
          onInput$={handleInput}
          {...props}
        />
      </div>
    );
  }
);

type CommandListProps = QwikIntrinsicElements["div"] & {
  class?: string;
};

export const CommandList = component$<CommandListProps>(
  ({ class: className, ...props }) => {
    return (
      <div
        class={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

type CommandEmptyProps = QwikIntrinsicElements["div"];

export const CommandEmpty = component$<CommandEmptyProps>(
  ({ class: className, ...props }) => {
    return (
      <div class={cn("py-6 text-center text-sm", className)} {...props}>
        <Slot />
      </div>
    );
  }
);

type CommandGroupProps = QwikIntrinsicElements["div"] & {
  heading?: string;
  class?: string;
};

export const CommandGroup = component$<CommandGroupProps>(
  ({ class: className, heading, ...props }) => {
    return (
      <div
        class={cn(
          "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {heading && (
          <div
            class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
            cmdk-group-heading=""
          >
            {heading}
          </div>
        )}
        <Slot />
      </div>
    );
  }
);

type CommandItemProps = QwikIntrinsicElements["div"] & {
  value?: string;
  onSelect$?: (value: string) => void;
  disabled?: boolean;
  class?: string;
};

export const CommandItem = component$<CommandItemProps>(
  ({ class: className, value, onSelect$, disabled = false, ...props }) => {
    const handleSelect = $(() => {
      if (!disabled && onSelect$ && value) {
        onSelect$(value);
      }
    });

    return (
      <div
        class={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        onClick$={handleSelect}
        data-disabled={disabled}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);

type CommandSeparatorProps = QwikIntrinsicElements["div"] & {
  class?: string;
};

export const CommandSeparator = component$<CommandSeparatorProps>(
  ({ class: className, ...props }) => {
    return <div class={cn("-mx-1 h-px bg-border", className)} {...props} />;
  }
);

type CommandShortcutProps = QwikIntrinsicElements["span"] & {
  class?: string;
};

export const CommandShortcut = component$<CommandShortcutProps>(
  ({ class: className, ...props }) => {
    return (
      <span
        class={cn(
          "ml-auto text-xs tracking-widest text-muted-foreground",
          className
        )}
        {...props}
      >
        <Slot />
      </span>
    );
  }
);

// Enhanced Command Dialog
type CommandDialogProps = {
  open?: boolean;
  onOpenChange$?: (open: boolean) => void;
  children: JSXOutput; // Qwik JSX output type
  class?: string;
};

export const CommandDialog = component$<CommandDialogProps>(
  ({ open = false, onOpenChange$, children, class: className }) => {
    const isOpen = useSignal(open);

    useTask$(({ track }) => {
      track(() => open);
      isOpen.value = open;
    });

    const closeDialog = $(() => {
      isOpen.value = false;
      onOpenChange$?.(false);
    });

    // Handle keyboard shortcuts
    useOnDocument(
      "keydown",
      $((event: KeyboardEvent) => {
        if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          isOpen.value = !isOpen.value;
          onOpenChange$?.(isOpen.value);
        }

        if (event.key === "Escape" && isOpen.value) {
          closeDialog();
        }
      })
    );

    if (!isOpen.value) return null;

    return (
      <div class="fixed inset-0 z-50 flex items-start justify-center">
        {/* Backdrop */}
        <div class="fixed inset-0 bg-black/50" onClick$={closeDialog} />

        {/* Dialog */}
        <div
          class={cn(
            "relative mt-24 w-full max-w-lg rounded-lg border bg-background p-0 shadow-lg",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

// Wedding-specific Command Actions
type Guest = { name: string; status: string; id: string };
type Vendor = { name: string; service: string; id: string };

type WeddingCommandActions = {
  guests: Array<Guest>;
  vendors: Array<Vendor>;
  onGuestSelect$?: (guest: Guest) => void;
  onVendorSelect$?: (vendor: Vendor) => void;
  onQuickAction$?: (action: string) => void;
};

export const WeddingCommandPalette = component$<WeddingCommandActions>(
  ({ guests, vendors, onGuestSelect$, onVendorSelect$, onQuickAction$ }) => {
    const searchValue = useSignal("");
    const filteredGuests = guests.filter((guest) =>
      guest.name.toLowerCase().includes(searchValue.value.toLowerCase())
    );
    const filteredVendors = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        vendor.service.toLowerCase().includes(searchValue.value.toLowerCase())
    );

    return (
      <Command>
        <CommandInput
          placeholder="Search guests, vendors, or quick actions..."
          value={searchValue.value}
          onValueChange$={(value) => (searchValue.value = value)}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect$={() => onQuickAction$?.("add-guest")}>
              <div class="flex items-center">
                <span class="mr-2">👥</span>
                Add New Guest
              </div>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect$={() => onQuickAction$?.("send-reminders")}>
              <div class="flex items-center">
                <span class="mr-2">📧</span>
                Send RSVP Reminders
              </div>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect$={() => onQuickAction$?.("export-guests")}>
              <div class="flex items-center">
                <span class="mr-2">📋</span>
                Export Guest List
              </div>
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {/* Guests */}
          {filteredGuests.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Guests">
                {filteredGuests.slice(0, 5).map((guest) => (
                  <CommandItem
                    key={guest.id}
                    onSelect$={() => onGuestSelect$?.(guest)}
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="flex items-center">
                        <span class="mr-2">👤</span>
                        <span>{guest.name}</span>
                      </div>
                      <span
                        class={cn("px-2 py-1 rounded-full text-xs", {
                          "bg-green-100 text-green-800":
                            guest.status === "Attending",
                          "bg-yellow-100 text-yellow-800":
                            guest.status === "Pending",
                          "bg-red-100 text-red-800":
                            guest.status === "Declined",
                        })}
                      >
                        {guest.status}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Vendors */}
          {filteredVendors.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Vendors">
                {filteredVendors.slice(0, 5).map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    onSelect$={() => onVendorSelect$?.(vendor)}
                  >
                    <div class="flex items-center">
                      <span class="mr-2">🏢</span>
                      <div>
                        <div class="font-medium">{vendor.name}</div>
                        <div class="text-xs text-muted-foreground">
                          {vendor.service}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    );
  }
);
