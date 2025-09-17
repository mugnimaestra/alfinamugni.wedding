# Migration Guide: React to Qwik

This guide helps team members understand the migration from React to Qwik and how to work with the new component system.

## 📋 Migration Overview

### What Changed
- **Framework**: React → Qwik
- **Build System**: Next.js → Qwik City + Vite
- **Component Syntax**: React functional components → Qwik components with `component$`
- **State Management**: React hooks → Qwik signals and stores
- **Event Handling**: onClick → onClick$
- **Styling**: Tailwind CSS (unchanged)

### What Stayed the Same
- **Component Structure**: Similar JSX syntax
- **Styling**: Same Tailwind CSS classes and design system
- **Component API**: Maintained compatibility where possible
- **TypeScript**: Same type definitions and patterns

## 🔄 Key Differences

### 1. Component Declaration

```tsx
// React (Before)
import React from 'react';

const Button = ({ children, onClick, variant = 'default' }) => {
  return (
    <button
      className={cn(buttonVariants({ variant }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Qwik (After)
import { component$ } from '@builder.io/qwik';
import { cn } from '~/lib/utils';

export const Button = component$(({ variant = 'default', ...props }) => {
  return (
    <button class={cn(buttonVariants({ variant }))} {...props}>
      {children}
    </button>
  );
});
```

### 2. State Management

```tsx
// React (Before)
import { useState, useEffect } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};

// Qwik (After)
import { component$, useSignal, useTask$ } from '@builder.io/qwik';

export const Counter = component$(() => {
  const count = useSignal(0);

  useTask$(({ track }) => {
    track(() => count.value);
    console.log('Count changed:', count.value);
  });

  return (
    <button onClick$={() => count.value++}>
      Count: {count.value}
    </button>
  );
});
```

### 3. Event Handlers

```tsx
// React (Before)
<button onClick={handleClick}>
  Click me
</button>

// Qwik (After)
<button onClick$={handleClick}>
  Click me
</button>

// Or inline:
<button onClick$={() => console.log('clicked')}>
  Click me
</button>

// Or with QRL:
import { $ } from '@builder.io/qwik';

<button onClick$={$(() => console.log('clicked'))}>
  Click me
</button>
```

### 4. Effects and Lifecycle

```tsx
// React (Before)
import { useEffect, useLayoutEffect } from 'react';

useEffect(() => {
  // Runs after render
  return () => cleanup();
}, [dependencies]);

// Qwik (After)
import { useTask$, useVisibleTask$ } from '@builder.io/qwik';

// For reactive effects
useTask$(({ track }) => {
  track(() => someValue.value);
  // Runs when tracked values change
});

// For DOM effects (like useLayoutEffect)
useVisibleTask$(({ cleanup }) => {
  // Runs when component becomes visible
  return cleanup();
});
```

## 🚀 Getting Started

### Development Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Preview production build:**
   ```bash
   npm run preview
   ```

### File Structure

```
src/
├── components/
│   ├── ui/           # UI components library
│   ├── contact-section.tsx
│   ├── hero-section.tsx
│   └── ...
├── hooks/            # Custom Qwik hooks
├── routes/           # Qwik City routes
└── utils/            # Utility functions
```

## 🛠️ Common Patterns

### 1. Component Props with Signals

```tsx
import { component$, type Signal } from '@builder.io/qwik';

interface CounterProps {
  initialValue?: number;
  onChange$?: (value: number) => void;
}

export const Counter = component$<CounterProps>((props) => {
  const count = useSignal(props.initialValue ?? 0);

  useTask$(({ track }) => {
    track(() => count.value);
    props.onChange$?.(count.value);
  });

  return (
    <div>
      <button onClick$={() => count.value--}>-</button>
      <span>{count.value}</span>
      <button onClick$={() => count.value++}>+</button>
    </div>
  );
});
```

### 2. Form Handling

```tsx
import { component$, useSignal, $ } from '@builder.io/qwik';

export const RSVPForm = component$(() => {
  const formData = useSignal({
    name: '',
    email: '',
    attending: false,
    guestCount: 1
  });

  const handleSubmit = $(async () => {
    try {
      // API call would go here
      console.log('Submitting:', formData.value);
      // await submitRSVP(formData.value);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  });

  return (
    <form onSubmit$={handleSubmit}>
      <Input
        placeholder="Your name"
        value={formData.value.name}
        onInput$={(e) => formData.value.name = (e.target as HTMLInputElement).value}
      />

      <Input
        type="email"
        placeholder="Your email"
        value={formData.value.email}
        onInput$={(e) => formData.value.email = (e.target as HTMLInputElement).value}
      />

      <CheckboxWithLabel
        label="I will attend"
        checked={formData.value.attending}
        onCheckedChange$={(checked) => formData.value.attending = checked}
      />

      <Button type="submit">Submit RSVP</Button>
    </form>
  );
});
```

### 3. Context Usage

```tsx
import { component$, createContextId, useContext, useContextProvider } from '@builder.io/qwik';

// Create context
export const WeddingContext = createContextId<{
  guestCount: Signal<number>;
  isRSVPSubmitted: Signal<boolean>;
}>('wedding-context');

// Context provider
export const WeddingProvider = component$(() => {
  const guestCount = useSignal(0);
  const isRSVPSubmitted = useSignal(false);

  useContextProvider(WeddingContext, {
    guestCount,
    isRSVPSubmitted
  });

  return <Slot />;
});

// Using context
export const GuestCounter = component$(() => {
  const context = useContext(WeddingContext);

  return (
    <div>
      <p>Total guests: {context.guestCount.value}</p>
      <Button onClick$={() => context.guestCount.value++}>
        Add Guest
      </Button>
    </div>
  );
});
```

## 🔧 Development Workflow

### 1. Component Development

1. **Create component file** in `src/components/ui/`
2. **Use `component$`** wrapper
3. **Use signals** for local state
4. **Use `$`** for event handlers
5. **Export types** for TypeScript support

### 2. Adding New Components

```tsx
// src/components/ui/new-component.tsx
import { component$, type QwikIntrinsicElements } from '@builder.io/qwik';
import { cn } from '~/lib/utils';

type NewComponentProps = QwikIntrinsicElements['div'] & {
  variant?: 'primary' | 'secondary';
};

export const NewComponent = component$<NewComponentProps>(
  ({ variant = 'primary', class: className, ...props }) => {
    return (
      <div
        class={cn(
          'base-styles',
          variant === 'secondary' && 'secondary-styles',
          className
        )}
        {...props}
      >
        <Slot />
      </div>
    );
  }
);
```

### 3. Testing Components

```tsx
// tests/unit/new-component.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewComponent } from '~/components/ui/new-component';

describe('NewComponent', () => {
  it('renders with default props', () => {
    render(<NewComponent>Test content</NewComponent>);

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

### 4. Route Creation

```tsx
// src/routes/new-page/index.tsx
import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="container mx-auto p-8">
      <h1 class="text-4xl font-bold">New Page</h1>
      <p>Welcome to our new page!</p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'New Page',
  meta: [
    {
      name: 'description',
      content: 'Description of the new page'
    }
  ]
};
```

## 📚 Available Resources

### Component Library

All UI components are located in `src/components/ui/`:

- **Core**: Button, Input, Label, Card, Separator
- **Forms**: Checkbox, Select, Textarea, Switch, Slider
- **Layout**: Dialog, Sheet, Tabs, Sidebar, Accordion
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Interactive**: DropdownMenu, Popover, Tooltip
- **Specialized**: Badge, Carousel, Table, Calendar

### Hooks

Custom hooks available in `src/hooks/`:

- `use-mobile.tsx` - Mobile device detection
- `use-toast.ts` - Toast notification management
- `theme-provider.tsx` - Theme management

### Utilities

Utility functions in `src/lib/`:

- `utils.ts` - Class name utilities with `cn()`
- Animation utilities in `src/utils/animations.ts`

## 🐛 Troubleshooting

### Common Issues

1. **"ReferenceError: require is not defined"**
   - Solution: Use ES modules (`import` instead of `require`)

2. **"Cannot read properties of undefined (reading 'value')"**
   - Solution: Initialize signals properly: `const signal = useSignal(initialValue)`

3. **"QRL is not a function"**
   - Solution: Wrap event handlers with `$()`: `onClick$={$(handler)}`

4. **Component not reactive**
   - Solution: Use signals for state, not regular variables

### Getting Help

1. **Check the component usage guide**: `docs/components-usage-guide.md`
2. **Look at existing components** for patterns
3. **Test components** using the test page at `/components-test`
4. **Check Qwik documentation**: https://qwik.builder.io/

## 🎯 Best Practices

### Code Organization

1. **Keep components focused** on single responsibilities
2. **Use TypeScript** for type safety
3. **Export component types** for better developer experience
4. **Write tests** for all components
5. **Use semantic HTML** for accessibility

### Performance

1. **Use signals** for reactive state
2. **Leverage Qwik's lazy loading** (automatic)
3. **Avoid unnecessary re-renders** with proper signal usage
4. **Use `useVisibleTask$`** for DOM manipulation
5. **Keep bundle size small** with code splitting

### Accessibility

1. **Use semantic HTML** elements
2. **Provide proper labels** for form elements
3. **Support keyboard navigation**
4. **Add ARIA attributes** when needed
5. **Test with screen readers**

## 🚀 Deployment

### Build Process

1. **Development**: `npm run dev`
2. **Production Build**: `npm run build`
3. **Preview**: `npm run preview`

### CI/CD

GitHub Actions are configured for:
- Automated testing on push/PR
- Performance monitoring
- Accessibility audits
- Deployment to production

### Environment Variables

Create `.env` files for different environments:
- `.env` - Development
- `.env.production` - Production

## 📞 Support

If you encounter issues:

1. Check this migration guide
2. Look at existing component implementations
3. Test your changes using `/components-test`
4. Refer to Qwik documentation
5. Ask team members for help

Remember: Qwik's learning curve is worth it for the performance benefits and developer experience it provides!
