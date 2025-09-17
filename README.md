# 💍 Alfina & Mugni's Wedding Website

A beautiful, high-performance wedding website built with **Qwik** and modern web technologies. This project showcases a production-ready wedding website with RSVP functionality, photo galleries, and event information.

![Qwik](https://img.shields.io/badge/Qwik-Framework-0093D0?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDE5SDE2VjE1aDR2NFoiIGZpbGw9IiMwMDkzRDAiLz4KPHBhdGggZD0iTTIwIDlIMTZ2NHY0SDhWMTRIMTZWMnoiIGZpbGw9IiMwMDkzRDAiLz4KPHBhdGggZD0iTTggMTlINHYtNFYxNWg0djRaIiBmaWxsPSIjMDA5M0QwIi8+CjxwYXRoIGQ9Ik04IDlINHY0VjEzSDRWMloiIGZpbGw9IiMwMDkzRDAiLz4KPC9zdmc+)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

## ✨ Features

### 🎨 **Wedding Website Features**
- **RSVP Management**: Guest registration and attendance tracking
- **Photo Gallery**: Beautiful image gallery for wedding memories
- **Event Information**: Detailed schedule and venue information
- **Contact Form**: Easy way for guests to reach out
- **Our Story**: Timeline of the couple's journey

### 🎨 **Modern UI Components**
- **35+ Reusable Components**: Complete component library with Qwik signals
- **Wedding-Themed Design**: Specialized components for RSVP, vendors, and galleries
- **Responsive Design**: Perfect experience on all devices
- **Accessibility First**: WCAG AA compliance with full keyboard navigation

### ⚡ **Performance Excellence**
- **Ultra-fast Loading**: Qwik's resumable architecture for instant page loads
- **Optimized Bundle Size**: Efficient code splitting and lazy loading
- **SEO Friendly**: Server-side rendering for better search engine visibility
- **Progressive Enhancement**: Enhanced user experience across all devices

### 🧪 **Development Experience**
- **Comprehensive Testing**: Vitest framework with component test suites
- **TypeScript Support**: Complete type safety throughout the application
- **Modern Tooling**: Vite for fast development and building
- **Documentation**: Complete usage guides and API reference

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/mugnimaestra/alfinamugni.wedding.git
cd alfinamugni.wedding

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5174 in your browser
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # UI component library (35+ components)
│   ├── contact-section.tsx   # Contact form section
│   ├── details-section.tsx   # Wedding details section
│   ├── footer-section.tsx    # Website footer
│   ├── gallery-section.tsx   # Photo gallery
│   ├── hero-section.tsx      # Main hero section
│   ├── navigation.tsx        # Site navigation
│   ├── rsvp-section.tsx      # RSVP form
│   ├── story-section.tsx     # Couple's story
│   └── theme-provider.tsx    # Theme management
├── hooks/               # Custom Qwik hooks
│   ├── use-mobile.tsx   # Mobile detection hook
│   ├── use-toast.tsx    # Toast notification hook
│   └── index.ts         # Hook exports
├── routes/              # File-based routing
│   ├── index.tsx        # Homepage
│   ├── components-test/ # Component testing page
│   └── ...
├── lib/                 # Utility functions
├── utils/               # Helper functions
├── global.css           # Global styles
└── root.tsx             # App root component

docs/                    # Documentation
├── components-usage-guide.md
├── migration-guide.md
├── qwik-patterns.md
└── deployment-guide.md

tests/                   # Test suites
├── unit/               # Unit tests
└── integration/        # Integration tests

public/                 # Static assets
├── favicon.svg         # Site favicon
├── manifest.json       # PWA manifest
└── robots.txt          # Search engine instructions
```

## 🎯 Components Overview

### Core Components
- **Button**: Flexible button with variants and sizes
- **Input**: Accessible form input with validation
- **Label**: Form label with proper associations
- **Card**: Content container with header/footer
- **Separator**: Visual content divider

### Form Components
- **Checkbox**: Interactive checkbox with labels
- **Select**: Dropdown with keyboard navigation
- **Textarea**: Multi-line text input
- **Switch**: Toggle component
- **Slider**: Range input control

### Layout Components
- **Dialog**: Modal dialogs for important interactions
- **Sheet**: Slide-out panels for mobile navigation
- **Tabs**: Tabbed content organization
- **Sidebar**: Navigation sidebar with responsive behavior
- **Accordion**: Collapsible content sections

### Interactive Components
- **DropdownMenu**: Contextual menus with accessibility
- **Popover**: Floating content with collision detection
- **Tooltip**: Contextual help text
- **HoverCard**: Rich tooltips with hover delays

### Specialized Components
- **Badge**: Status indicators (RSVP, Vendor, Status variants)
- **Carousel**: Image slider for wedding galleries
- **Table**: Data display with sorting
- **Calendar**: Date picker for RSVP management
- **Toast**: Notification system

## 🏗️ Architecture

### Qwik Patterns Used

#### Signals for State Management
```tsx
// Reactive state with automatic updates
const count = useSignal(0);
const isLoading = useSignal(false);

// Reactive effects
useTask$(({ track }) => {
  track(() => count.value);
  console.log('Count changed:', count.value);
});
```

#### Event Handlers with QRL
```tsx
// Optimized event handlers
const handleClick = $(() => {
  count.value++;
});

<button onClick$={handleClick}>Increment</button>
```

#### Context Providers
```tsx
// Shared state management
const WeddingContext = createContextId<{ theme: Signal<string> }>('wedding');

const ThemeProvider = component$(() => {
  const theme = useSignal('light');
  useContextProvider(WeddingContext, { theme });

  return <Slot />;
});
```

## 📊 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Framework | Qwik | ✅ Cutting-edge |
| Language | TypeScript | ✅ Type-safe |
| Styling | Tailwind CSS | ✅ Utility-first |
| Accessibility | WCAG AA | ✅ Compliant |
| Performance | Excellent | ✅ Optimized |

## 🎨 Customization

### Theme Configuration

The website uses Tailwind CSS with custom design tokens:

```css
/* src/global.css */
:root {
  --primary: 222.2 84% 4.9%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 96%;
  /* ... */
}
```

### Component Variants

Most components support multiple variants:

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>

// Badge variants
<Badge variant="success">Confirmed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Cancelled</Badge>
```

## 🚀 Deployment

### Recommended Hosting

1. **Vercel** (Recommended)
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Cloudflare Pages**
   ```bash
   npm i -g wrangler
   wrangler pages deploy dist
   ```

### Environment Variables

Create `.env.production`:

```bash
NODE_ENV=production
VITE_APP_TITLE="Alfina & Mugni's Wedding"
VITE_API_BASE_URL=https://api.your-domain.com
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/               # Component unit tests
│   ├── button.test.tsx
│   ├── input.test.tsx
│   ├── card.test.tsx
│   └── ...
├── integration/        # Feature integration tests
└── __mocks__/         # Test mocks
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:ui

# Coverage
npm run test:coverage
```

## 📚 Documentation

### Guides Available

1. **[Components Usage Guide](docs/components-usage-guide.md)**
   - Complete API reference
   - Usage examples
   - Best practices

2. **[Migration Guide](docs/migration-guide.md)**
   - React to Qwik transition
   - Common patterns
   - Troubleshooting

3. **[Qwik Patterns](docs/qwik-patterns.md)**
   - Advanced Qwik concepts
   - Performance patterns
   - Architecture decisions

4. **[Deployment Guide](docs/deployment-guide.md)**
   - Hosting setup
   - Performance optimization
   - Monitoring

## 🤝 Contributing

This is a private wedding website project. Contributions are currently limited to the wedding party and development team.

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make your changes**
3. **Run tests**: `npm run test`
4. **Commit your changes**: `git commit -am 'Add new feature'`
5. **Push to the branch**: `git push origin feature/your-feature`
6. **Create a Pull Request**

### Code Standards

- Use TypeScript for all new code
- Follow Qwik component patterns
- Write tests for new components
- Update documentation
- Ensure accessibility compliance
- Follow the project's styling guidelines

## 📄 License

This project is private and for personal use only.

## 🙏 Acknowledgments

- **Qwik Team**: For the incredible framework that makes this website lightning fast
- **Builder.io**: For Qwik's innovative architecture
- **Tailwind CSS**: For the utility-first CSS framework
- **Our Families**: For their love and support throughout our journey

## 📞 Support

If you have questions or need help:

1. Check the [documentation](docs/)
2. Review existing [components](src/components/ui/)
3. Look at the [test page](http://localhost:5174/components-test)
4. Open an [issue](https://github.com/mugnimaestra/alfinamugni.wedding/issues)

---

**Made with ❤️ for Alfina & Mugni's special day**

*Built with Qwik for optimal performance and developer experience*