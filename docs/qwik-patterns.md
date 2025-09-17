# Qwik Patterns & Best Practices

This document outlines the Qwik-specific patterns and architectural decisions used in the wedding website migration.

## 🏗️ Architecture Overview

### Component Architecture

The application follows Qwik's component-driven architecture with the following structure:

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── sections/        # Page sections (Hero, Contact, etc.)
│   └── router-head/     # SEO and meta components
├── hooks/               # Custom Qwik hooks
├── routes/              # File-based routing
├── lib/                 # Utility functions
└── utils/               # Helper functions
```

### Key Architectural Decisions

1. **Component Composition**: All components use `component$()` wrapper
2. **Signal-based State**: Reactive state management with signals
3. **QRL Event Handlers**: Optimized event handling with `$()` syntax
4. **Context Providers**: Shared state with Qwik context API
5. **Lazy Loading**: Automatic code splitting by default

## 🎯 Core Patterns

### 1. Component Declaration Pattern

```tsx
// Standard component declaration
export const MyComponent = component$<ComponentProps>((props) => {
  // Component logic
  return <div>{/* JSX */}</div>;
});

// With proper TypeScript types
export interface MyComponentProps {
  variant?: 'primary' | 'secondary';
  onAction$?: (data: any) => void;
}

export const MyComponent = component$<MyComponentProps>((props) => {
  // Implementation
});
```

### 2. Signal State Management

```tsx
// Basic signal usage
const isOpen = useSignal(false);
const count = useSignal(0);
const userData = useSignal({ name: '', email: '' });

// Signal updates
isOpen.value = true;
count.value++;
userData.value = { name: 'John', email: 'john@example.com' };

// Reactive effects
useTask$(({ track }) => {
  track(() => count.value);
  console.log('Count changed:', count.value);
});
```

### 3. Event Handler Patterns

```tsx
// Inline handlers
<button onClick$={() => count.value++}>Increment</button>

// QRL handlers for complex logic
const handleSubmit = $(async (formData: FormData) => {
  try {
    await submitForm(formData);
    toast.success('Success!');
  } catch (error) {
    toast.error('Failed!');
  }
});

// Event handler with parameters
const handleSelect = $((value: string) => {
  selectedValue.value = value;
});

<select onChange$={(e) => handleSelect((e.target as HTMLSelectElement).value)}>
```

### 4. Context Provider Pattern

```tsx
// Context definition
export const WeddingContext = createContextId<{
  theme: Signal<string>;
  user: Signal<User | null>;
  isAuthenticated: Signal<boolean>;
}>('wedding-context');

// Provider component
export const WeddingProvider = component$(() => {
  const theme = useSignal('light');
  const user = useSignal<User | null>(null);
  const isAuthenticated = useSignal(false);

  useContextProvider(WeddingContext, {
    theme,
    user,
    isAuthenticated
  });

  return <Slot />;
});

// Consumer component
export const ThemeToggle = component$(() => {
  const context = useContext(WeddingContext);

  return (
    <button
      onClick$={() => {
        context.theme.value = context.theme.value === 'light' ? 'dark' : 'light';
      }}
    >
      Toggle Theme
    </button>
  );
});
```

## 🔄 Migration Patterns

### React Hook → Qwik Pattern Conversion

| React Pattern | Qwik Pattern | Example |
|---------------|--------------|---------|
| `useState` | `useSignal` | `const count = useSignal(0)` |
| `useEffect` | `useTask$` | `useTask$(({ track }) => { track(signal) })` |
| `useLayoutEffect` | `useVisibleTask$` | `useVisibleTask$(() => { /* DOM manipulation */ })` |
| `useContext` | `useContext` | Same API, different context creation |
| `onClick` | `onClick$` | `<button onClick$={handler}>` |
| `useRef` | Direct element reference | `<input ref={inputRef}>` |

### Component Props Pattern

```tsx
// Before (React)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// After (Qwik)
interface ButtonProps extends QwikIntrinsicElements['button'] {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

## 🎨 Advanced Patterns

### 1. Complex State Management

```tsx
// Store pattern for complex state
export const useWeddingStore = () => {
  const store = useStore({
    rsvp: {
      attending: false,
      guestCount: 1,
      dietaryRestrictions: [] as string[],
      songRequests: [] as string[]
    },
    photos: {
      uploaded: [] as string[],
      approved: [] as string[]
    }
  });

  return store;
};

// Usage in component
export const RSVPForm = component$(() => {
  const store = useWeddingStore();

  return (
    <form>
      <CheckboxWithLabel
        label="I will attend"
        checked={store.rsvp.attending}
        onCheckedChange$={(checked) => store.rsvp.attending = checked}
      />

      <Select
        value={store.rsvp.guestCount.toString()}
        onValueChange$={(value) => store.rsvp.guestCount = parseInt(value)}
      >
        <SelectContent>
          <SelectItem value="1">1 Guest</SelectItem>
          <SelectItem value="2">2 Guests</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
});
```

### 2. Form Validation Pattern

```tsx
// Form validation with signals
export const ContactForm = component$(() => {
  const formData = useSignal({
    name: '',
    email: '',
    message: ''
  });

  const errors = useSignal({
    name: '',
    email: '',
    message: ''
  });

  const validateForm = $(() => {
    errors.value = { name: '', email: '', message: '' };

    if (!formData.value.name) {
      errors.value.name = 'Name is required';
    }

    if (!formData.value.email) {
      errors.value.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      errors.value.email = 'Invalid email format';
    }

    if (!formData.value.message) {
      errors.value.message = 'Message is required';
    }

    return !Object.values(errors.value).some(error => error);
  });

  const handleSubmit = $(async () => {
    if (!validateForm()) return;

    try {
      await submitContactForm(formData.value);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message');
    }
  });

  return (
    <form onSubmit$={handleSubmit} class="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.value.name}
          onInput$={(e) => formData.value.name = (e.target as HTMLInputElement).value}
        />
        {errors.value.name && (
          <p class="text-sm text-destructive">{errors.value.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.value.email}
          onInput$={(e) => formData.value.email = (e.target as HTMLInputElement).value}
        />
        {errors.value.email && (
          <p class="text-sm text-destructive">{errors.value.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.value.message}
          onInput$={(e) => formData.value.message = (e.target as HTMLInputElement).value}
        />
        {errors.value.message && (
          <p class="text-sm text-destructive">{errors.value.message}</p>
        )}
      </div>

      <Button type="submit">Send Message</Button>
    </form>
  );
});
```

### 3. Async Data Loading Pattern

```tsx
// Async data loading with error handling
export const PhotoGallery = component$(() => {
  const photos = useSignal<Photo[]>([]);
  const isLoading = useSignal(true);
  const error = useSignal<string | null>(null);

  useVisibleTask$(async () => {
    try {
      const response = await fetch('/api/photos');
      if (!response.ok) throw new Error('Failed to load photos');

      photos.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  });

  if (isLoading.value) {
    return <Skeleton class="h-64 w-full" />;
  }

  if (error.value) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading photos</AlertTitle>
        <AlertDescription>{error.value}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {photos.value.map((photo) => (
        <Card key={photo.id}>
          <img
            src={photo.url}
            alt={photo.alt}
            class="w-full h-48 object-cover rounded-t-lg"
          />
          <CardContent class="p-4">
            <p class="text-sm text-muted-foreground">{photo.caption}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
```

### 4. Component Communication Pattern

```tsx
// Parent-child communication with signals
export const RSVPManager = component$(() => {
  const rsvpData = useSignal({
    attending: false,
    guestCount: 1,
    specialRequests: ''
  });

  const updateRSVP = $((updates: Partial<typeof rsvpData.value>) => {
    rsvpData.value = { ...rsvpData.value, ...updates };
  });

  return (
    <div class="space-y-6">
      <RSVPStatusSelector
        attending={rsvpData.value.attending}
        onUpdate$={updateRSVP}
      />

      <GuestCountSelector
        guestCount={rsvpData.value.guestCount}
        onUpdate$={updateRSVP}
      />

      <SpecialRequests
        specialRequests={rsvpData.value.specialRequests}
        onUpdate$={updateRSVP}
      />

      <RSVPPreview data={rsvpData.value} />
    </div>
  );
});

interface RSVPStatusSelectorProps {
  attending: boolean;
  onUpdate$: (updates: { attending: boolean }) => void;
}

export const RSVPStatusSelector = component$<RSVPStatusSelectorProps>((props) => {
  return (
    <div>
      <h3 class="text-lg font-medium mb-4">Will you attend?</h3>
      <div class="space-x-4">
        <Button
          variant={props.attending ? 'default' : 'outline'}
          onClick$={() => props.onUpdate$({ attending: true })}
        >
          Yes, I'll attend
        </Button>
        <Button
          variant={!props.attending ? 'default' : 'outline'}
          onClick$={() => props.onUpdate$({ attending: false })}
        >
          Sorry, I can't attend
        </Button>
      </div>
    </div>
  );
});
```

## 🚀 Performance Patterns

### 1. Lazy Loading Components

```tsx
// Automatic lazy loading (Qwik default)
export const HeavyComponent = component$(() => {
  // This component is automatically lazy-loaded
  return <div>Heavy component content</div>;
});

// Manual lazy loading for specific cases
import { lazy } from '@builder.io/qwik';

const LazyPhotoGallery = lazy(() => import('./photo-gallery'));

export const WeddingPage = component$(() => {
  const showGallery = useSignal(false);

  return (
    <div>
      <Button onClick$={() => showGallery.value = true}>
        Load Photo Gallery
      </Button>

      {showGallery.value && <LazyPhotoGallery />}
    </div>
  );
});
```

### 2. Memoization with Signals

```tsx
// Computed values with signals
export const ShoppingCart = component$(() => {
  const items = useSignal<CartItem[]>([]);
  const total = useSignal(0);

  // Automatically recalculate total when items change
  useTask$(({ track }) => {
    track(() => items.value);
    total.value = items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  const addItem = $((item: CartItem) => {
    items.value = [...items.value, item];
  });

  return (
    <div>
      <div class="space-y-2">
        {items.value.map((item, index) => (
          <div key={index} class="flex justify-between">
            <span>{item.name}</span>
            <span>${item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div class="mt-4 pt-4 border-t">
        <div class="flex justify-between font-bold">
          <span>Total:</span>
          <span>${total.value.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
});
```

### 3. Resource Optimization

```tsx
// Image optimization with lazy loading
export const OptimizedImage = component$<{ src: string; alt: string }>((props) => {
  const imageRef = useSignal<HTMLImageElement>();
  const isLoaded = useSignal(false);
  const hasError = useSignal(false);

  useVisibleTask$(({ cleanup }) => {
    const img = imageRef.value;
    if (!img) return;

    const handleLoad = () => isLoaded.value = true;
    const handleError = () => hasError.value = true;

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  });

  return (
    <div class="relative">
      {!isLoaded.value && !hasError.value && (
        <Skeleton class="absolute inset-0" />
      )}

      {hasError.value ? (
        <div class="flex items-center justify-center h-48 bg-muted rounded-lg">
          <span class="text-muted-foreground">Failed to load image</span>
        </div>
      ) : (
        <img
          ref={imageRef}
          src={props.src}
          alt={props.alt}
          class="w-full h-auto rounded-lg transition-opacity duration-300"
          style={{ opacity: isLoaded.value ? 1 : 0 }}
          loading="lazy"
        />
      )}
    </div>
  );
});
```

## 🧪 Testing Patterns

### 1. Component Testing

```tsx
// tests/unit/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '~/components/ui/button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick$={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Signal Testing

```tsx
// Testing components with signals
it('updates signal value on interaction', () => {
  render(<Counter />);

  const incrementButton = screen.getByRole('button', { name: /increment/i });
  const countDisplay = screen.getByText('0');

  fireEvent.click(incrementButton);

  expect(countDisplay).toHaveTextContent('1');
});
```

## 📚 Advanced Qwik Concepts Used

### 1. Resumability

Qwik components are resumable by default, meaning:
- No hydration required for static content
- Interactive parts hydrate only when needed
- State is preserved across navigation
- Performance is optimized automatically

### 2. QRL (Qwik Resource Locator)

QRLs are used for:
- Lazy loading of event handlers
- Code splitting at function level
- Optimized bundle sizes
- Tree-shaking friendly

### 3. Container Architecture

The application uses:
- File-based routing with Qwik City
- Automatic code splitting
- Progressive enhancement
- Server-side rendering support

### 4. State Serialization

Signals are automatically serialized for:
- Server-side rendering
- Client-side hydration
- Navigation state preservation
- Browser history management

## 🎯 Best Practices Implemented

### 1. Component Design
- ✅ Single responsibility principle
- ✅ Proper TypeScript typing
- ✅ Accessibility built-in
- ✅ Responsive design
- ✅ Performance optimized

### 2. State Management
- ✅ Signals for local state
- ✅ Context for shared state
- ✅ Reactive updates
- ✅ Proper cleanup

### 3. Event Handling
- ✅ QRL syntax for events
- ✅ Async operation support
- ✅ Error handling
- ✅ User feedback

### 4. Performance
- ✅ Lazy loading by default
- ✅ Code splitting
- ✅ Bundle optimization
- ✅ Image optimization

### 5. Developer Experience
- ✅ TypeScript support
- ✅ Comprehensive documentation
- ✅ Testing infrastructure
- ✅ Development tools

This document serves as a comprehensive reference for the Qwik patterns and architectural decisions used in the wedding website migration. These patterns ensure optimal performance, maintainability, and developer experience.
