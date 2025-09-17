# Development Setup Guide

**Alfina & Mugni's Wedding Website - Complete Development Environment Setup**

_This guide provides comprehensive instructions for setting up the development environment for the wedding website project._

## 🎯 Prerequisites & Environment Requirements

### System Requirements

#### Operating System Support

- **macOS**: 12.0+ (Monterey or later)
- **Windows**: 10/11 with WSL2 recommended
- **Linux**: Ubuntu 20.04+, Debian 11+, or equivalent

#### Required Software Versions

```bash
# Core Requirements
Node.js: v18.17.0+ (recommended: v20.x LTS)
Bun: v1.0.0+ (latest stable)
Git: v2.30.0+
VS Code: Latest version (recommended IDE)

# Optional but Recommended
Docker: v20.0+ (for containerized development)
```

### Hardware Recommendations

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for development
- **CPU**: Multi-core processor recommended for build performance

## 🚀 Installation Process

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/mugnihadi/alfinamugni.wedding.git
cd alfinamugni.wedding

# Verify the project structure
ls -la
# Should show: src/, docs/, config/, tests/, package.json, etc.
```

### Step 2: Install Node.js & Bun

#### Option A: Using Node Version Manager (Recommended)

```bash
# Install NVM (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# For Windows, use nvm-windows
# Download from: https://github.com/coreybutler/nvm-windows

# Restart terminal, then install Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show compatible npm version
```

#### Option B: Direct Installation

```bash
# Download from https://nodejs.org/
# Choose LTS version (v20.x)

# Verify installation
node --version
npm --version
```

#### Install Bun Package Manager

```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash

# For Windows, use PowerShell as Administrator:
# irm bun.sh/install.ps1 | iex

# Verify Bun installation
bun --version  # Should show v1.x.x
```

### Step 3: Project Dependencies Installation

```bash
# Install all project dependencies
bun install

# This will install:
# - Qwik framework and tools
# - TypeScript and type definitions
# - Tailwind CSS and plugins
# - Development tools (ESLint, Prettier, Vitest)
# - Testing frameworks (Playwright)
# - Build tools and utilities

# Verify installation success
bun run --help  # Should show available scripts
```

### Step 4: Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or use your preferred editor
```

#### Environment Variables Configuration

```bash
# .env.local
# Development Configuration
NODE_ENV=development
PORT=5173

# Wedding Website Configuration
WEDDING_DATE=2025-11-29
WEDDING_LOCATION=Jakarta, Indonesia
COUPLE_NAMES=Alfina & Mugni

# RSVP Configuration (if using external service)
RSVP_EMAIL_SERVICE=your-email-service
RSVP_API_KEY=your-api-key

# Analytics (optional)
GOOGLE_ANALYTICS_ID=your-ga-id
FACEBOOK_PIXEL_ID=your-pixel-id

# Development Tools
VITE_DEV_TOOLS=true
ESLINT_NO_DEV_ERRORS=true
```

## 🛠️ Development Server Setup

### Starting the Development Server

```bash
# Start development server
bun run dev

# Alternative with auto-browser opening
bun run start

# The server will start on http://localhost:5173
# Hot reload is enabled for instant updates
```

### Development Server Features

- **Hot Module Replacement**: Instant updates without page refresh
- **TypeScript Checking**: Real-time type validation
- **CSS Hot Reload**: Instant style updates
- **Error Overlay**: Clear error reporting in browser
- **Network Access**: Available on local network for mobile testing

### Accessing the Development Site

```bash
# Local access
http://localhost:5173

# Network access (for mobile testing)
# Check terminal output for network URL, typically:
http://192.168.1.x:5173
```

## 🎨 IDE Setup & Configuration

### VS Code Setup (Recommended)

#### Required Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "qwikdev.qwik-snippets",
    "ms-playwright.playwright"
  ]
}
```

#### VS Code Settings Configuration

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["class\\s*=\\s*[\"']([^\"']*)[\"']", "([^\"'\\s]*)"]
  ]
}
```

#### VS Code Tasks Configuration

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev Server",
      "type": "shell",
      "command": "bun run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "bun run test",
      "group": "test"
    },
    {
      "label": "Build Production",
      "type": "shell",
      "command": "bun run build",
      "group": "build"
    }
  ]
}
```

### Alternative IDE Setup

#### WebStorm Configuration

```javascript
// .idea/codeStyleSettings.xml
// Prettier integration and TypeScript support
// ESLint integration for code quality
```

#### Vim/Neovim Setup

```lua
-- LSP configuration for TypeScript
-- Tailwind CSS language server
-- ESLint integration
```

## 📋 Available Scripts & Commands

### Development Commands

```bash
# Start development server
bun run dev                 # Hot reload development server
bun run start              # Dev server with auto-browser opening

# Development utilities
bun run dev:host           # Expose server to network
bun run dev:debug          # Development server with debugging
```

### Build Commands

```bash
# Production builds
bun run build              # Create production build
bun run build.types        # TypeScript compilation check
bun run preview            # Preview production build locally

# Build analysis
bun run build:analyze      # Bundle analyzer
bun run build:stats        # Build statistics
```

### Code Quality Commands

```bash
# Linting
bun run lint               # ESLint check
bun run lint:fix           # Auto-fix ESLint issues

# Formatting
bun run fmt                # Format with Prettier
bun run fmt.check          # Check Prettier formatting

# Type checking
bun run typecheck          # TypeScript type checking
```

### Testing Commands

```bash
# Unit & Integration tests
bun run test               # Run all tests
bun run test:watch         # Watch mode for tests
bun run test:coverage      # Test coverage report

# E2E tests
bun run test:e2e           # Playwright E2E tests
bun run test:e2e:ui        # E2E tests with UI mode

# Visual regression tests
bun run test:visual        # Visual regression testing
```

### Utility Commands

```bash
# Clean up
bun run clean              # Clean build artifacts
bun run clean:cache        # Clear all caches
bun run clean:deps         # Remove node_modules

# Project maintenance
bun run update:deps        # Update dependencies
bun run check:deps         # Check for dependency issues
```

## 🔧 Git Workflow & Branch Strategy

### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/rsvp-form-validation
git checkout -b feature/gallery-lightbox

# Bug fixes
git checkout -b fix/mobile-navigation-issue
git checkout -b fix/rsvp-email-validation

# Hotfixes
git checkout -b hotfix/critical-rsvp-bug

# Documentation
git checkout -b docs/setup-guide-update
```

### Commit Message Convention

```bash
# Format: type(scope): description

# Examples:
git commit -m "feat(rsvp): add guest count validation"
git commit -m "fix(gallery): resolve image loading issue"
git commit -m "docs(setup): update development guide"
git commit -m "style(hero): improve mobile responsiveness"
git commit -m "test(rsvp): add form validation tests"
```

### Pre-commit Hooks Setup

```bash
# Install pre-commit hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "bun run lint && bun run typecheck"

# Add commit message hook
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

### Development Workflow

```bash
# 1. Start new feature
git checkout main
git pull origin main
git checkout -b feature/new-wedding-component

# 2. Development cycle
# Make changes...
bun run dev          # Test locally
bun run test         # Run tests
bun run lint         # Check code quality

# 3. Commit changes
git add .
git commit -m "feat(component): add new wedding component"

# 4. Push and create PR
git push origin feature/new-wedding-component
# Create Pull Request on GitHub
```

## 🧪 Testing Environment Setup

### Unit Testing Configuration

```typescript
// vitest.config.ts - Already configured
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
```

### E2E Testing Setup

```bash
# Install Playwright browsers
bunx playwright install

# Run E2E tests
bun run test:e2e

# Debug E2E tests
bun run test:e2e:debug
```

### Visual Regression Testing

```bash
# Generate baseline screenshots
bun run test:visual:baseline

# Run visual regression tests
bun run test:visual

# Update screenshots
bun run test:visual:update
```

## 🚨 Troubleshooting Common Setup Issues

### Node.js Version Issues

```bash
# Problem: Wrong Node.js version
# Solution: Use NVM to switch versions
nvm use 20
nvm alias default 20

# Verify version
node --version  # Should be v20.x.x
```

### Bun Installation Issues

```bash
# Problem: Bun command not found
# Solution: Add to PATH or reinstall
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Alternative: Reinstall Bun
curl -fsSL https://bun.sh/install | bash
```

### Port Conflicts

```bash
# Problem: Port 5173 already in use
# Solution: Kill process or use different port
lsof -ti:5173 | xargs kill
# or
PORT=3000 bun run dev
```

### Dependency Installation Issues

```bash
# Problem: Installation fails
# Solution: Clear cache and reinstall
bun run clean:deps
rm -rf node_modules
rm bun.lockb
bun install
```

### TypeScript Compilation Errors

```bash
# Problem: Type errors during development
# Solution: Check tsconfig.json and update types
bun run typecheck
bun update @types/*
```

### ESLint Configuration Issues

```bash
# Problem: ESLint rules conflicting
# Solution: Check .eslintrc.js configuration
bun run lint --debug
# Update rules in eslint.config.js
```

## 🔒 Security Considerations

### Environment Variables Security

```bash
# Never commit sensitive data
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use different configs for different environments
.env.local          # Local development
.env.staging        # Staging environment
.env.production     # Production environment
```

### Dependency Security

```bash
# Regular security audits
bun audit
bun update

# Check for vulnerabilities
bunx audit-ci --config audit-ci.json
```

## 📱 Mobile Development Setup

### Mobile Testing

```bash
# Start dev server with network access
bun run dev:host

# Access from mobile device
# Use the network URL shown in terminal
http://192.168.1.x:5173
```

### Browser DevTools Setup

```bash
# Chrome DevTools for mobile debugging
# Enable device simulation
# Test responsive breakpoints
```

## 📊 Performance Monitoring Setup

### Development Performance Tools

```bash
# Bundle analyzer
bun run build:analyze

# Performance profiling
bun run dev --profile

# Lighthouse CI setup
bunx lighthouse-ci --config lighthouse-ci.json
```

### Build Performance Optimization

```typescript
// vite.config.ts optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["@builder.io/qwik"],
          components: ["./src/components/index.ts"],
        },
      },
    },
  },
});
```

## 🤝 Team Collaboration Setup

### Code Review Process

1. Create feature branch
2. Implement changes with tests
3. Run quality checks locally
4. Create Pull Request
5. Code review by team member
6. Merge after approval

### Documentation Updates

```bash
# Update documentation alongside code changes
# Keep CLAUDE.md updated with new patterns
# Update relevant README files
```

## 🔗 Next Steps

After completing the setup:

1. **Explore the codebase**: Start with [`src/routes/index.tsx`](../../src/routes/index.tsx)
2. **Review components**: Check [`src/components/`](../../src/components/) directory
3. **Study the styling**: Examine [`src/global.css`](../../src/global.css)
4. **Read architecture docs**: See [`../architecture/system-overview.md`](../architecture/system-overview.md)
5. **Check examples**: Browse [`../examples/`](../examples/) directory
6. **Run tests**: Execute `bun run test` to ensure everything works

## 📚 Related Documentation

- **System Architecture**: [`../architecture/system-overview.md`](../architecture/system-overview.md)
- **Component Templates**: [`../examples/component-templates/component-template.md`](../examples/component-templates/component-template.md)
- **Styling Guide**: [`../examples/styling-examples/wedding-theme.md`](../examples/styling-examples/wedding-theme.md)
- **Troubleshooting**: [`../troubleshooting/common-issues.md`](../troubleshooting/common-issues.md)
- **AI Development Context**: [`../../config/ai/context-templates/development-context.md`](../../config/ai/context-templates/development-context.md)

---

_For additional setup questions, refer to [`CLAUDE.md`](../../CLAUDE.md) or contact the development team._
