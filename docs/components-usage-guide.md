# Qwik UI Components Usage Guide

This guide provides comprehensive documentation for the Qwik UI component library used in the wedding website project.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Core Components](#core-components)
- [Form Components](#form-components)
- [Layout Components](#layout-components)
- [Feedback Components](#feedback-components)
- [Interactive Components](#interactive-components)
- [Specialized Components](#specialized-components)
- [Qwik-Specific Patterns](#qwik-specific-patterns)

## 🚀 Quick Start

### Installation

All components are available in the `src/components/ui/` directory and are ready to use.

```tsx
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
```

### Basic Usage

```tsx
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/ui/button";

export default component$(() => {
  return (
    <div class="p-4">
      <Button onClick$={() => console.log("Clicked!")}>
        Click me
      </Button>
    </div>
  );
});
```

## 🧱 Core Components

### Button

Flexible button component with multiple variants and sizes.

```tsx
import { Button } from "~/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// States
<Button disabled>Disabled</Button>

// With click handler
<Button onClick$={() => console.log("Clicked!")}>Click me</Button>

// As child component
<Button asChild>
  <a href="/link">Link Button</a>
</Button>
```

### Input

Accessible input component with proper styling and validation.

```tsx
import { Input } from "~/components/ui/input";

export default component$(() => {
  return (
    <div class="space-y-4">
      {/* Basic input */}
      <Input placeholder="Enter your name" />

      {/* With label */}
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>

      {/* Different input types */}
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Age" />
      <Input type="tel" placeholder="Phone" />
    </div>
  );
});
```

### Label

Accessible label component that works with form elements.

```tsx
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export default component$(() => {
  return (
    <div class="space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <Input id="name" placeholder="Enter your full name" />
    </div>
  );
});
```

### Card

Container component with header, content, and footer sections.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "~/components/ui/card";

export default component$(() => {
  return (
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Wedding Invitation</CardTitle>
        <CardDescription>
          Join us for our special day celebration
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p class="text-sm text-muted-foreground">
          We can't wait to celebrate this special occasion with you!
        </p>
      </CardContent>

      <CardFooter>
        <Button>RSVP Now</Button>
      </CardFooter>
    </Card>
  );
});
```

### Separator

Visual separator component for dividing content sections.

```tsx
import { Separator } from "~/components/ui/separator";

export default component$(() => {
  return (
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium">Section 1</h3>
        <p>Content for section 1</p>
      </div>

      <Separator />

      <div>
        <h3 class="text-lg font-medium">Section 2</h3>
        <p>Content for section 2</p>
      </div>

      <Separator orientation="vertical" class="h-6" />
    </div>
  );
});
```

## 📝 Form Components

### Checkbox

Interactive checkbox with optional label and validation.

```tsx
import { Checkbox, CheckboxWithLabel } from "~/components/ui/checkbox";

export default component$(() => {
  const isChecked = useSignal(false);

  return (
    <div class="space-y-4">
      {/* Basic checkbox */}
      <Checkbox
        checked={isChecked.value}
        onCheckedChange$={(checked) => (isChecked.value = checked)}
      />

      {/* Checkbox with label */}
      <CheckboxWithLabel
        label="I agree to the terms and conditions"
        description="By checking this box, you agree to our terms of service"
        error={!isChecked.value ? "You must agree to continue" : undefined}
        checked={isChecked.value}
        onCheckedChange$={(checked) => (isChecked.value = checked)}
      />

      {/* Wedding RSVP example */}
      <CheckboxWithLabel
        label="I will attend the wedding"
        description="Please RSVP by May 1st"
        checked={isChecked.value}
        onCheckedChange$={(checked) => (isChecked.value = checked)}
      />
    </div>
  );
});
```

### Select

Dropdown selection component with keyboard navigation.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";

export default component$(() => {
  return (
    <div class="space-y-4">
      {/* Basic select */}
      <Select placeholder="Select an option">
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>

      {/* Select with groups */}
      <Select placeholder="Select event type">
        <SelectContent>
          <SelectLabel>Wedding Events</SelectLabel>
          <SelectItem value="ceremony">Ceremony</SelectItem>
          <SelectSeparator />
          <SelectItem value="reception">Reception</SelectItem>
          <SelectItem value="dinner">Dinner</SelectItem>
        </SelectContent>
      </Select>

      {/* Guest count selection */}
      <Select placeholder="Number of guests">
        <SelectContent>
          <SelectItem value="1">1 Guest</SelectItem>
          <SelectItem value="2">2 Guests</SelectItem>
          <SelectItem value="3">3 Guests</SelectItem>
          <SelectItem value="4">4+ Guests</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});
```

## 🏗️ Layout Components

### Dialog

Modal dialog component for important interactions.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "~/components/ui/dialog";

export default component$(() => {
  const isOpen = useSignal(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open RSVP Dialog</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Attendance</DialogTitle>
          <DialogDescription>
            Please confirm your attendance for our wedding celebration.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <p>Will you be joining us for this special occasion?</p>
        </div>

        <DialogFooter>
          <Button variant="outline">Maybe Later</Button>
          <Button>Yes, I'll Attend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
```

### Sheet

Slide-out panel component for mobile navigation.

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "~/components/ui/sheet";

export default component$(() => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Wedding Navigation</SheetTitle>
          <SheetDescription>
            Navigate through our wedding website
          </SheetDescription>
        </SheetHeader>

        <div class="mt-6 space-y-4">
          <a href="#home" class="block">Home</a>
          <a href="#story" class="block">Our Story</a>
          <a href="#details" class="block">Wedding Details</a>
          <a href="#rsvp" class="block">RSVP</a>
          <a href="#gallery" class="block">Photo Gallery</a>
        </div>
      </SheetContent>
    </Sheet>
  );
});
```

### Tabs

Tabbed interface for organizing content.

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "~/components/ui/tabs";

export default component$(() => {
  return (
    <Tabs defaultValue="ceremony" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="ceremony">Ceremony</TabsTrigger>
        <TabsTrigger value="reception">Reception</TabsTrigger>
        <TabsTrigger value="dinner">Dinner</TabsTrigger>
      </TabsList>

      <TabsContent value="ceremony" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Wedding Ceremony</CardTitle>
            <CardDescription>Saturday, June 15th at 4:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Join us for our intimate ceremony at the beautiful garden venue.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reception" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Reception</CardTitle>
            <CardDescription>Following the ceremony</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Celebrate with us at the reception with dinner and dancing.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dinner" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Dinner</CardTitle>
            <CardDescription>7:00 PM onwards</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Enjoy a delicious dinner prepared by our caterers.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
});
```

## 💬 Feedback Components

### Alert

Informational alert component with different variants.

```tsx
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default component$(() => {
  return (
    <div class="space-y-4">
      <Alert>
        <AlertTitle>RSVP Deadline Approaching</AlertTitle>
        <AlertDescription>
          Please RSVP by May 1st to help us with our final headcount.
        </AlertDescription>
      </Alert>

      <Alert variant="success">
        <AlertTitle>RSVP Confirmed!</AlertTitle>
        <AlertDescription>
          Thank you for confirming your attendance. We can't wait to see you!
        </AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertTitle>Venue Update</AlertTitle>
        <AlertDescription>
          Due to weather, the ceremony will be moved indoors if necessary.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Please note our updated COVID-19 safety protocols.
        </AlertDescription>
      </Alert>
    </div>
  );
});
```

### Toast

Temporary notification system.

```tsx
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";

export default component$(() => {
  const { toast } = useToast();

  const showSuccessToast = $(() => {
    toast({
      title: "RSVP Submitted!",
      description: "Thank you for your response. We'll see you at the wedding!",
      variant: "default"
    });
  });

  const showErrorToast = $(() => {
    toast({
      title: "Error",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
  });

  return (
    <div class="space-x-4">
      <Button onClick$={showSuccessToast}>Show Success Toast</Button>
      <Button variant="destructive" onClick$={showErrorToast}>
        Show Error Toast
      </Button>
    </div>
  );
});
```

## 🎯 Interactive Components

### Dropdown Menu

Contextual menu component with keyboard navigation.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";

export default component$(() => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Account Options</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <UserIcon class="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem>
          <SettingsIcon class="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogOutIcon class="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
```

### Popover

Floating content that appears on trigger interaction.

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";

export default component$(() => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Wedding Details</Button>
      </PopoverTrigger>

      <PopoverContent class="w-80">
        <div class="space-y-4">
          <h4 class="font-medium">Ceremony Information</h4>
          <div class="text-sm text-muted-foreground space-y-2">
            <p><strong>Date:</strong> June 15, 2024</p>
            <p><strong>Time:</strong> 4:00 PM</p>
            <p><strong>Location:</strong> Garden Rose Estate</p>
            <p><strong>Dress Code:</strong> Semi-formal</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});
```

## 🎨 Specialized Components

### Badge

Status indicators with wedding-specific variants.

```tsx
import {
  Badge,
  RSVPBadge,
  VendorCategoryBadge,
  StatusBadge
} from "~/components/ui/badge";

export default component$(() => {
  return (
    <div class="space-y-4">
      {/* RSVP Status Badges */}
      <div class="space-x-2">
        <RSVPBadge status="attending" />
        <RSVPBadge status="not-attending" />
        <RSVPBadge status="pending" />
        <RSVPBadge status="maybe" />
      </div>

      {/* Vendor Category Badges */}
      <div class="space-x-2">
        <VendorCategoryBadge category="photography" />
        <VendorCategoryBadge category="venue" />
        <VendorCategoryBadge category="catering" />
        <VendorCategoryBadge category="flowers" />
        <VendorCategoryBadge category="music" />
      </div>

      {/* Status Badges */}
      <div class="space-x-2">
        <StatusBadge status="active" />
        <StatusBadge status="draft" />
        <StatusBadge status="published" />
        <StatusBadge status="archived" />
      </div>

      {/* Custom Badges */}
      <div class="space-x-2">
        <Badge variant="success">Confirmed</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="destructive">Cancelled</Badge>
      </div>
    </div>
  );
});
```

### Carousel

Image slider component for wedding galleries.

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "~/components/ui/carousel";

export default component$(() => {
  const images = [
    "/wedding-photo-1.jpg",
    "/wedding-photo-2.jpg",
    "/wedding-photo-3.jpg",
    "/wedding-photo-4.jpg"
  ];

  return (
    <Carousel class="w-full max-w-lg">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div class="aspect-square">
              <img
                src={image}
                alt={`Wedding photo ${index + 1}`}
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
});
```

## ⚡ Qwik-Specific Patterns

### Signals for State Management

```tsx
import { component$, useSignal } from "@builder.io/qwik";

export default component$(() => {
  const isOpen = useSignal(false);
  const guestCount = useSignal(1);

  return (
    <div>
      <Button onClick$={() => (isOpen.value = !isOpen.value)}>
        Toggle Dialog
      </Button>

      <Select
        value={guestCount.value.toString()}
        onValueChange$={(value) => (guestCount.value = parseInt(value))}
      >
        <SelectContent>
          <SelectItem value="1">1 Guest</SelectItem>
          <SelectItem value="2">2 Guests</SelectItem>
          <SelectItem value="3">3 Guests</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});
```

### Event Handlers with QRL

```tsx
import { component$, $ } from "@builder.io/qwik";

export default component$(() => {
  const handleSubmit = $(async (formData: FormData) => {
    // Handle form submission
    console.log("Form submitted:", Object.fromEntries(formData));

    // API call would go here
    // await submitRSVP(formData);
  });

  const handleGuestCountChange = $((count: number) => {
    console.log("Guest count changed to:", count);
    // Update state or perform calculations
  });

  return (
    <form onSubmit$={handleSubmit}>
      {/* Form content */}
      <Button type="submit">Submit RSVP</Button>
    </form>
  );
});
```

### Context Providers

```tsx
import { component$, createContextId, useContext, useContextProvider } from "@builder.io/qwik";

export const ThemeContext = createContextId<{ theme: string }>("theme-context");

export const ThemeProvider = component$(() => {
  const theme = useSignal("light");

  useContextProvider(ThemeContext, { theme });

  return <Slot />;
});

export const ThemeToggle = component$(() => {
  const context = useContext(ThemeContext);

  return (
    <Button
      onClick$={() => (context.theme.value = context.theme.value === "light" ? "dark" : "light")}
    >
      Toggle to {context.theme.value === "light" ? "Dark" : "Light"} Theme
    </Button>
  );
});
```

### Task$ for Side Effects

```tsx
import { component$, useSignal, useTask$ } from "@builder.io/qwik";

export default component$(() => {
  const searchQuery = useSignal("");
  const searchResults = useSignal([]);

  // Perform search when query changes
  useTask$(({ track }) => {
    track(() => searchQuery.value);

    if (searchQuery.value.length > 2) {
      // Debounced search would go here
      console.log("Searching for:", searchQuery.value);
    }
  });

  return (
    <div>
      <Input
        placeholder="Search wedding photos..."
        value={searchQuery.value}
        onInput$={(event) => (searchQuery.value = (event.target as HTMLInputElement).value)}
      />

      <div class="mt-4">
        {searchResults.value.length > 0 ? (
          <p>Found {searchResults.value.length} results</p>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
});
```

## 🎯 Best Practices

### 1. Use Signals for Local State

```tsx
// ✅ Good - Use signals for local state
const isLoading = useSignal(false);

// ❌ Avoid - Don't use regular variables for reactive state
let isLoading = false;
```

### 2. Use QRL for Event Handlers

```tsx
// ✅ Good - Use $ for event handlers
<Button onClick$={$(() => console.log("clicked"))}>

// ❌ Avoid - Don't use regular functions
<Button onClick={() => console.log("clicked")}>
```

### 3. Leverage Automatic Optimization

```tsx
// ✅ Good - Qwik automatically optimizes
export default component$(() => {
  return <ExpensiveComponent />;
});

// Components are automatically lazy-loaded and resumable
```

### 4. Use Proper TypeScript Types

```tsx
// ✅ Good - Use proper types
interface Guest {
  name: string;
  email: string;
  attending: boolean;
}

export const GuestForm = component$<{ guest: Signal<Guest> }>((props) => {
  // Component implementation
});
```

### 5. Handle Async Operations Properly

```tsx
// ✅ Good - Handle async operations in event handlers
const handleSubmit = $(async (formData: FormData) => {
  try {
    await submitRSVP(formData);
    toast.success("RSVP submitted successfully!");
  } catch (error) {
    toast.error("Failed to submit RSVP");
  }
});
```

This comprehensive guide covers all the components and patterns you'll need for building the wedding website with Qwik. Each component is designed to be accessible, performant, and easy to use.
