# Common Issues & Troubleshooting Guide

**Alfina & Mugni's Wedding Website - Comprehensive Problem-Solving Reference**

_This guide provides solutions to common development issues, build problems, and deployment challenges encountered while working on the wedding website._

## 🚨 Quick Issue Resolution

### Emergency Checklist

If you're experiencing critical issues, try these steps first:

```bash
# 1. Clear all caches and restart
bun run clean:cache
rm -rf node_modules .qwik dist
bun install
bun run dev

# 2. Check Node.js and Bun versions
node --version    # Should be v18.17.0+ or v20.x
bun --version     # Should be v1.0.0+

# 3. Verify environment setup
echo $NODE_ENV
cat .env.local

# 4. Run health checks
bun run typecheck
bun run lint
bun run test
```

## 🔧 Development Server Issues

### Port Already in Use Error

**Problem**: `EADDRINUSE: address already in use :::5173`

**Solution**:

```bash
# Option 1: Kill the process using the port
lsof -ti:5173 | xargs kill

# Option 2: Use a different port
PORT=3000 bun run dev

# Option 3: Kill all Node processes (careful!)
killall node

# Option 4: Find and kill specific process
ps aux | grep node
kill -9 [PID]

# Verify port is free
lsof -i :5173
```

**Prevention**:

```bash
# Add to your shell profile (.zshrc or .bashrc)
alias killdev="lsof -ti:5173 | xargs kill"
alias checkport="lsof -i :5173"
```

### Development Server Won't Start

**Problem**: Server fails to start or crashes immediately

**Symptoms**:

- Server exits without error message
- Module resolution errors
- Permission denied errors

**Solution**:

```bash
# 1. Check Node.js version compatibility
node --version
# If not v18.17.0+, update Node.js

# 2. Clear Qwik cache
rm -rf .qwik

# 3. Clear Vite cache
rm -rf node_modules/.vite

# 4. Reinstall dependencies
rm -rf node_modules bun.lockb
bun install

# 5. Check file permissions
ls -la
# Ensure you have read/write permissions

# 6. Try verbose startup
DEBUG=vite:* bun run dev

# 7. Check for conflicting global packages
npm list -g --depth=0
bun pm ls
```

### Hot Reload Not Working

**Problem**: Changes not reflected in browser

**Solution**:

```bash
# 1. Check if HMR is enabled in vite.config.ts
# Ensure no conflicting browser extensions

# 2. Clear browser cache
# Chrome: Ctrl+Shift+R (hard refresh)
# Firefox: Ctrl+F5

# 3. Check file watching limits (Linux/WSL)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 4. Restart with clean cache
bun run dev --force

# 5. Check network configuration
# Ensure no proxy or VPN blocking connections
```

### Module Resolution Errors

**Problem**: `Cannot resolve module` or import errors

**Symptoms**:

```
Error: Cannot resolve module './components/hero-section'
Module not found: Can't resolve '@/components'
```

**Solution**:

```bash
# 1. Check tsconfig.json paths configuration
cat tsconfig.json | grep -A 10 "paths"

# 2. Ensure correct file extensions
# Use .tsx for JSX components, .ts for utilities

# 3. Check import paths
# ✅ Correct
import { HeroSection } from './hero-section';
import { HeroSection } from '../components/hero-section';

# ❌ Incorrect
import { HeroSection } from './hero-section.tsx';
import { HeroSection } from '@/components/hero-section';

# 4. Verify file exists and has correct export
ls -la src/components/hero-section.tsx
grep "export" src/components/hero-section.tsx

# 5. Clear TypeScript cache
rm -rf node_modules/.cache
```

## 🏗️ Build & Compilation Issues

### TypeScript Compilation Errors

**Problem**: Type errors preventing build

**Common Errors & Solutions**:

#### 1. Property Does Not Exist on Type

```typescript
// ❌ Error: Property 'value' does not exist on type 'Signal<string>'
const name = useSignal("");
console.log(name.value);

// ✅ Solution: Proper signal usage
const name = useSignal("");
console.log(name.value); // This should work - check import

// Check import
import { useSignal } from "@builder.io/qwik";
```

#### 2. JSX Element Type Issues

```typescript
// ❌ Error: JSX element type does not exist
export const Component = component$(() => {
  return <div>Content</div>;
});

// ✅ Solution: Ensure proper component$ usage
import { component$ } from "@builder.io/qwik";

export const Component = component$(() => {
  return <div>Content</div>;
});
```

#### 3. Event Handler Type Errors

```typescript
// ❌ Error: Type 'QRL<>' is not assignable
const handleClick = (event: Event) => {
  // handler logic
};

// ✅ Solution: Use $ syntax for handlers
import { $ } from "@builder.io/qwik";

const handleClick = $((event: Event) => {
  // handler logic
});
```

**Debug Commands**:

```bash
# Check specific type errors
bun run typecheck

# Verbose TypeScript checking
tsc --noEmit --listFiles

# Check tsconfig configuration
cat tsconfig.json

# Verify @types packages
ls node_modules/@types/
```

### Qwik-Specific Build Errors

**Problem**: Qwik serialization or hydration errors

#### 1. Serialization Errors

```typescript
// ❌ Error: Cannot serialize function
const Component = component$(() => {
  const nonSerializableFunction = () => {
    // This won't work in Qwik
  };

  return <button onClick={nonSerializableFunction}>Click</button>;
});

// ✅ Solution: Use $ for serializable functions
const Component = component$(() => {
  const serializableFunction = $(() => {
    // This works in Qwik
  });

  return <button onClick$={serializableFunction}>Click</button>;
});
```

#### 2. Hydration Mismatches

```typescript
// ❌ Problem: Client-server mismatch
const Component = component$(() => {
  const randomValue = Math.random(); // Different on server/client
  return <div>{randomValue}</div>;
});

// ✅ Solution: Use useTask$ for client-only logic
const Component = component$(() => {
  const value = useSignal(0);

  useTask$(() => {
    // This runs only on client
    value.value = Math.random();
  });

  return <div>{value.value}</div>;
});
```

**Debug Steps**:

```bash
# Enable Qwik development debugging
DEBUG=qwik* bun run dev

# Check for serialization issues
grep -r "onClick=" src/ --include="*.tsx"
# Should be onClick$= not onClick=

# Validate component patterns
grep -r "component\$" src/ --include="*.tsx"
```

### Tailwind CSS Compilation Issues

**Problem**: Styles not applying or build errors

**Symptoms**:

- Tailwind classes not working
- CSS not generated
- PostCSS errors

**Solution**:

```bash
# 1. Verify Tailwind configuration
cat tailwind.config.js

# Ensure content paths are correct
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  // ...
};

# 2. Check PostCSS configuration
cat postcss.config.js

# Should include Tailwind
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

# 3. Verify CSS imports
grep -r "@tailwind" src/
# Should have @tailwind directives in global.css

# 4. Clear Tailwind cache
rm -rf node_modules/.cache

# 5. Rebuild CSS
bun run build:css

# 6. Check for conflicting CSS
grep -r "!important" src/ --include="*.css"
```

**Tailwind Debug Mode**:

```bash
# Add to tailwind.config.js for debugging
module.exports = {
  // ...
  safelist: [
    'wedding-button',
    'wedding-section',
    // Add classes that aren't being detected
  ],
};
```

## 🧪 Testing Issues

### Unit Test Failures

**Problem**: Tests failing unexpectedly

**Common Issues & Solutions**:

#### 1. DOM Testing Environment

```bash
# ❌ Error: document is not defined
# Solution: Ensure jsdom environment

# Check vitest.config.ts
cat vitest.config.ts | grep environment
# Should have: environment: 'jsdom'

# Install jsdom if missing
bun add -D jsdom
```

#### 2. Qwik Testing Setup

```typescript
// ❌ Error: createDOM is not a function
import { createDOM } from '@builder.io/qwik/testing';

// ✅ Solution: Proper Qwik test setup
import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';

test('component renders', async () => {
  const { screen, render } = await createDOM();
  await render(<Component />);
  // assertions
});
```

#### 3. Async Component Testing

```typescript
// ❌ Problem: Testing async operations
test('async operation', () => {
  // This might not wait for async operations
});

// ✅ Solution: Proper async testing
test('async operation', async () => {
  const { screen, render } = await createDOM();
  await render(<AsyncComponent />);

  // Wait for async operations
  await screen.findByText('Expected text');
});
```

**Debug Commands**:

```bash
# Run tests with verbose output
bun run test --reporter=verbose

# Run specific test file
bun run test hero-section.test.tsx

# Debug test with node inspector
bun run test --inspect-brk

# Check test coverage
bun run test:coverage
```

### E2E Test Issues (Playwright)

**Problem**: End-to-end tests failing

**Solutions**:

```bash
# 1. Install Playwright browsers
bunx playwright install

# 2. Check browser installation
bunx playwright install --dry-run

# 3. Run tests with debug mode
bunx playwright test --debug

# 4. Run tests with UI mode
bunx playwright test --ui

# 5. Check test configuration
cat playwright.config.ts

# 6. Update browser binaries
bunx playwright install --force

# 7. Run specific test
bunx playwright test wedding-flow.spec.ts
```

**Common E2E Issues**:

```typescript
// ❌ Problem: Element not found
await page.click(".wedding-button");

// ✅ Solution: Wait for element
await page.waitForSelector(".wedding-button");
await page.click(".wedding-button");

// ❌ Problem: Timing issues
await page.goto("/");
await page.click("nav a");

// ✅ Solution: Wait for navigation
await page.goto("/");
await page.waitForLoadState("networkidle");
await page.click("nav a");
```

## 🚀 Deployment Issues

### Build Failures in Production

**Problem**: Production build fails

**Common Errors & Solutions**:

#### 1. Memory Issues

```bash
# ❌ Error: JavaScript heap out of memory
# Solution: Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Permanent solution - add to package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' qwik build"
  }
}
```

#### 2. Missing Environment Variables

```bash
# ❌ Error: Environment variable not defined
# Solution: Check .env.production

# Verify environment variables
printenv | grep WEDDING

# Check build environment
NODE_ENV=production bun run build
```

#### 3. Import/Export Issues

```typescript
// ❌ Problem: Default export issues
export default component$(() => {
  // component
});

// ✅ Solution: Named exports for better tree-shaking
export const ComponentName = component$(() => {
  // component
});
```

**Build Debug Steps**:

```bash
# 1. Clean build
rm -rf dist .qwik
bun run build

# 2. Analyze bundle size
bun run build:analyze

# 3. Check build output
ls -la dist/

# 4. Test production build locally
bun run preview

# 5. Check for build warnings
bun run build 2>&1 | grep -i warning
```

### Static Site Generation Issues

**Problem**: SSG not working correctly

**Solutions**:

```bash
# 1. Check Qwik City configuration
cat vite.config.ts | grep -A 5 qwikCity

# 2. Verify SSG routes
# Check that all routes are included in SSG config

# 3. Debug SSG build
DEBUG=qwik:build bun run build

# 4. Check for dynamic imports
grep -r "import(" src/ --include="*.tsx"

# 5. Verify static assets
ls -la dist/
ls -la public/
```

## 📱 Mobile & Browser Issues

### Mobile Responsiveness Problems

**Problem**: Layout issues on mobile devices

**Debug Steps**:

```bash
# 1. Test responsive design
# Use browser dev tools device simulation

# 2. Check viewport meta tag
grep viewport public/index.html
# Should have: <meta name="viewport" content="width=device-width, initial-scale=1.0">

# 3. Test on actual devices
# Use ngrok or similar for local testing
npx ngrok http 5173

# 4. Check CSS media queries
grep -r "@media" src/ --include="*.css"

# 5. Validate responsive classes
grep -r "md:" src/ --include="*.tsx"
grep -r "lg:" src/ --include="*.tsx"
```

### Browser Compatibility Issues

**Problem**: Features not working in certain browsers

**Solutions**:

```bash
# 1. Check browser support
# Use caniuse.com for feature support

# 2. Add polyfills if needed
bun add core-js

# 3. Update browserslist
cat package.json | grep browserslist

# 4. Check JavaScript features
# Avoid cutting-edge features for wider support

# 5. Test in multiple browsers
# Chrome, Firefox, Safari, Edge
```

## 🔍 Performance Issues

### Slow Page Load Times

**Problem**: Website loading slowly

**Diagnostic Steps**:

```bash
# 1. Analyze bundle size
bun run build:analyze

# 2. Check image optimization
ls -la public/images/
# Ensure images are optimized (WebP, proper sizes)

# 3. Audit with Lighthouse
npx lighthouse http://localhost:5173

# 4. Check for unused code
npx webpack-bundle-analyzer dist/

# 5. Profile network requests
# Use browser dev tools Network tab
```

**Optimization Solutions**:

```typescript
// 1. Lazy load images
<img
  src={imageSrc}
  loading="lazy"
  alt={imageAlt}
/>

// 2. Code splitting
const LazyComponent = lazy(() => import('./heavy-component'));

// 3. Optimize images
// Use next-gen formats (WebP, AVIF)
// Implement responsive images

// 4. Minimize JavaScript
// Remove unused dependencies
// Use tree shaking
```

### Memory Leaks

**Problem**: Browser tab consuming excessive memory

**Debug Steps**:

```typescript
// 1. Check for event listener cleanup
useTask$(({ cleanup }) => {
  const handler = () => {
    /* logic */
  };
  window.addEventListener("scroll", handler);

  cleanup(() => {
    window.removeEventListener("scroll", handler);
  });
});

// 2. Check for unclosed intervals
useTask$(({ cleanup }) => {
  const interval = setInterval(() => {
    // logic
  }, 1000);

  cleanup(() => {
    clearInterval(interval);
  });
});

// 3. Profile memory usage
// Use browser dev tools Memory tab
```

## 🔧 Environment & Configuration Issues

### Node.js Version Problems

**Problem**: Compatibility issues with Node.js versions

**Solution**:

```bash
# 1. Check current version
node --version

# 2. Check required version
cat package.json | grep engines

# 3. Use Node Version Manager
nvm install 20
nvm use 20
nvm alias default 20

# 4. Verify version is correct
which node
node --version

# 5. Clear npm/bun cache after version change
npm cache clean --force
rm -rf node_modules
bun install
```

### Package Manager Issues

**Problem**: Bun vs npm vs yarn conflicts

**Solution**:

```bash
# 1. Stick to one package manager (Bun for this project)
rm -f package-lock.json yarn.lock
# Keep only bun.lockb

# 2. Clear conflicting cache
rm -rf node_modules
bun install

# 3. Check for global package conflicts
bun pm ls
npm list -g --depth=0

# 4. Use correct scripts
# Always use `bun run` not `npm run`
bun run dev
bun run build
bun run test
```

### Environment Variable Issues

**Problem**: Environment variables not loading

**Solution**:

```bash
# 1. Check .env file location and name
ls -la .env*

# 2. Verify file format
cat .env.local
# Should not have spaces around =
# VARIABLE=value (not VARIABLE = value)

# 3. Check if variables are loaded
echo $NODE_ENV
printenv | grep WEDDING

# 4. Restart development server
# Environment variables require restart
```

## 📊 Monitoring & Debugging Tools

### Development Debugging

```bash
# 1. Enable verbose logging
DEBUG=qwik* bun run dev
DEBUG=vite* bun run dev

# 2. Use React DevTools (compatible with Qwik)
# Install React DevTools browser extension

# 3. Profile bundle size
bun run build:analyze

# 4. Check network requests
# Use browser Network tab

# 5. Monitor performance
# Use browser Performance tab
```

### Production Monitoring

```bash
# 1. Error tracking
# Implement error boundary components

# 2. Performance monitoring
# Use Lighthouse CI for continuous monitoring

# 3. Real User Monitoring
# Implement analytics and performance tracking

# 4. Log aggregation
# Set up proper logging for server-side errors
```

## 🆘 Getting Help

### Self-Help Resources

1. **Check Documentation First**:

   - [`CLAUDE.md`](../CLAUDE.md) - Main project context
   - [`docs/architecture/system-overview.md`](../architecture/system-overview.md)
   - [`docs/development/setup-guide.md`](../development/setup-guide.md)

2. **Search Existing Issues**:

   - Project GitHub issues
   - Qwik GitHub repository
   - Stack Overflow

3. **Community Resources**:
   - [Qwik Discord](https://qwik.builder.io/chat)
   - [Qwik GitHub Discussions](https://github.com/BuilderIO/qwik/discussions)

### Creating Issue Reports

When creating an issue report, include:

````markdown
## Issue Description

Brief description of the problem

## Environment

- Node.js version:
- Bun version:
- OS:
- Browser:

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Code Sample

```typescript
// Minimal code to reproduce issue
```
````

## Additional Context

- Error messages
- Screenshots
- Browser console logs

```

### Emergency Contacts

For critical production issues:
1. Check [`CLAUDE.md`](../CLAUDE.md) for project maintainer contact
2. Review deployment logs
3. Implement rollback if necessary

---

## 📚 Related Documentation

- **System Architecture**: [`../architecture/system-overview.md`](../architecture/system-overview.md)
- **Development Setup**: [`../development/setup-guide.md`](../development/setup-guide.md)
- **Component Templates**: [`../examples/component-templates/component-template.md`](../examples/component-templates/component-template.md)
- **Styling Guide**: [`../examples/styling-examples/wedding-theme.md`](../examples/styling-examples/wedding-theme.md)
- **AI Development Context**: [`../../config/ai/context-templates/development-context.md`](../../config/ai/context-templates/development-context.md)

---

*For additional troubleshooting assistance, refer to [`CLAUDE.md`](../CLAUDE.md) or contact the development team.*
```
