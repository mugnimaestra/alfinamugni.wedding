# 💕 Alfina & Mugni's Wedding Website

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/alfinamugni/wedding)
[![Qwik](https://img.shields.io/badge/Qwik-v1.14.1-blue)](https://qwik.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.1.8-06B6D4)](https://tailwindcss.com/)
[![Documentation](https://img.shields.io/badge/docs-comprehensive-green)](./docs/README.md)

> **Celebrating Love Through Code** ✨  
> A beautiful, modern wedding website built with performance, accessibility, and love in mind.

**Wedding Date**: November 29, 2025 | **Location**: Jakarta, Indonesia

---

## 🌟 Project Overview

Welcome to the digital celebration of **Alfina & Mugni's wedding**! This project is more than just a website—it's a carefully crafted digital experience that brings together modern web technologies with the timeless beauty of love and commitment.

### 💝 About This Wedding Website

This website serves as the central hub for our wedding celebration, providing guests and family with:

- **Wedding Information**: Date, venue, and event details
- **Our Love Story**: The journey that brought us together
- **RSVP System**: Seamless guest response management
- **Photo Gallery**: Capturing precious moments
- **Contact Information**: Easy communication with the couple

### 🎯 Built for Wedding Guests

Designed with our guests' experience in mind:

- **Mobile-First**: Optimized for smartphones and tablets
- **Fast Loading**: Quick access even on slower Indonesian mobile networks
- **Accessible**: WCAG compliant for all users
- **Cultural Sensitivity**: Respectful of Indonesian wedding traditions

### ⚡ Technology Stack

Built with cutting-edge technologies for optimal performance:

```typescript
Framework: Qwik v1.14.1 + TypeScript 5.4.5
Styling: Tailwind CSS v4.1.8 + Custom Wedding Theme
Build: Vite 5.3.5 + ESLint + Prettier
Package Manager: Bun (recommended) or npm
Deployment: Static Site Generation + CDN
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have:

- **Node.js**: v18.17.0+ (v20+ recommended)
- **Bun**: Latest version (recommended) or npm
- **Git**: For version control
- **VS Code**: Recommended IDE with Qwik extensions

### Installation & Setup

```bash
# 1. Clone the repository
git clone [repository-url]
cd alfinamugni.wedding

# 2. Install dependencies (using Bun - faster)
bun install
# or with npm
npm install

# 3. Start development server
bun run dev
# or with npm
npm run dev

# 4. Open your browser
# Navigate to http://localhost:5173
```

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run start        # Start with auto-open browser

# Building & Production
bun run build        # Create production build
bun run build.types  # TypeScript compilation check
bun run preview      # Preview production build locally

# Code Quality
bun run lint         # ESLint validation
bun run fmt          # Format code with Prettier
bun run fmt.check    # Check code formatting
```

### Project Structure Overview

```
alfinamugni.wedding/
├── 📁 src/                    # Source code
│   ├── components/            # Wedding UI components
│   │   ├── hero-section.tsx   # Wedding announcement
│   │   ├── story-section.tsx  # Love story
│   │   ├── details-section.tsx # Event details
│   │   ├── rsvp-section.tsx   # RSVP functionality
│   │   ├── gallery-section.tsx # Photo gallery
│   │   └── navigation.tsx     # Site navigation
│   ├── routes/                # Page routing
│   │   └── index.tsx          # Main wedding page
│   └── global.css             # Wedding theme styles
├── 📁 docs/                   # Comprehensive documentation
├── 📁 config/                 # Configuration files
├── 📁 tests/                  # Testing suite
└── 📁 scripts/                # Automation scripts
```

---

## 📚 Documentation Navigation

### 🎯 AI Context Hub

- **[CLAUDE.md](./CLAUDE.md)** - Master AI context file for optimal AI assistance
- **[AI Context Templates](./config/ai/context-templates/)** - Development context for AI tools
- **[AI Workflow Templates](./config/ai/workflow-templates/)** - AI-assisted development workflows

### 🏗️ Architecture & Development

- **[System Overview](./docs/architecture/system-overview.md)** - Technical architecture deep dive
- **[Development Setup](./docs/development/setup-guide.md)** - Comprehensive setup guide
- **[API Documentation](./docs/api/)** - Component APIs and utilities
  - [Components API](./docs/api/components-api.md)
  - [Utilities API](./docs/api/utilities-api.md)
  - [Types API](./docs/api/types-api.md)

### 📖 Examples & Templates

- **[Component Templates](./docs/examples/component-templates/)** - Reusable component patterns
- **[Page Templates](./docs/examples/page-templates/)** - Page structure templates
- **[Styling Examples](./docs/examples/styling-examples/)** - Wedding theme implementation
- **[Integration Examples](./docs/examples/integration-examples/)** - Third-party integrations

### 🔧 Operations & Maintenance

- **[Testing Guide](./tests/README.md)** - Testing strategy and implementation
- **[Deployment Guide](./docs/deployment/deployment-guide.md)** - Production deployment
- **[Troubleshooting](./docs/troubleshooting/common-issues.md)** - Common issues and solutions
- **[Scripts Documentation](./scripts/README.md)** - Automation and build scripts

---

## ✨ Features Overview

### 💒 Wedding Website Features

**Guest Experience**

- **Elegant Hero Section** - Beautiful wedding announcement with couple's photo
- **Love Story Timeline** - Interactive journey of the couple's relationship
- **Event Details** - Comprehensive wedding day information and schedule
- **RSVP System** - User-friendly guest response with meal preferences
- **Photo Gallery** - Curated collection of engagement and couple photos
- **Contact Information** - Easy communication with wedding party

**Technical Excellence**

- **Lightning Fast** - Optimized for < 2s load time on mobile networks
- **Responsive Design** - Perfect experience across all devices
- **SEO Optimized** - Enhanced social media sharing and discoverability
- **Accessibility** - WCAG 2.1 AA compliance for inclusive access
- **Progressive Enhancement** - Works beautifully even on older browsers

### 🎨 Design & User Experience

**Wedding Theme**

- **Elegant Color Palette** - Gold (#d4af37), cream, and sophisticated grays
- **Typography** - Playfair Display for headings, Inter for body text
- **Cultural Elements** - Subtle Indonesian design influences
- **Mobile-First** - Optimized for guests accessing via smartphones

**Performance Features**

- **Image Optimization** - WebP format with lazy loading
- **Code Splitting** - Automatic optimization via Qwik
- **CDN Ready** - Optimized for global content delivery
- **Analytics** - Integrated tracking for RSVP optimization

---

## 🛠️ Development Workflow

### Component Development Process

```typescript
// 1. Plan component purpose and interface
interface WeddingComponentProps {
  title: string;
  subtitle?: string;
  variant?: "primary" | "secondary";
}

// 2. Create component using wedding theme
export const WeddingComponent = component$<WeddingComponentProps>(
  ({ title, subtitle, variant = "primary" }) => {
    return (
      <section class={`wedding-section ${variant}`}>
        <h2 class="wedding-heading">{title}</h2>
        {subtitle && <p class="wedding-subtitle">{subtitle}</p>}
      </section>
    );
  }
);
```

### Code Quality Standards

```bash
# Pre-commit checklist
bun run build.types  # ✅ TypeScript validation
bun run lint         # ✅ ESLint code quality
bun run fmt.check    # ✅ Prettier formatting
bun run test         # ✅ Test suite execution
```

### Testing Approach

- **Unit Tests** - Component logic and rendering validation
- **Integration Tests** - Feature workflow testing (RSVP, navigation)
- **E2E Tests** - Complete user journey validation
- **Visual Regression** - Style consistency across updates
- **Accessibility Tests** - WCAG compliance verification

### Build & Deployment

```bash
# Production deployment pipeline
bun run build.types  # Verify TypeScript compilation
bun run lint         # Ensure code quality
bun run test         # Run complete test suite
bun run build        # Create optimized production build

# Output: dist/ directory ready for deployment
```

---

## 📂 Repository Structure

```
📁 alfinamugni.wedding/
├── 📄 README.md                 # This file - project overview
├── 📄 CLAUDE.md                 # AI context hub
├── 📄 CHANGELOG.md              # Version history
├── 📄 package.json              # Dependencies and scripts
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 tailwind.config.js        # Wedding theme configuration
├── 📄 vite.config.ts            # Build configuration
│
├── 📁 src/                      # Source code
│   ├── 📁 components/           # Wedding UI components
│   │   ├── 📄 hero-section.tsx  # Wedding announcement hero
│   │   ├── 📄 story-section.tsx # Couple's love story
│   │   ├── 📄 details-section.tsx # Event details
│   │   ├── 📄 rsvp-section.tsx  # RSVP functionality
│   │   ├── 📄 gallery-section.tsx # Photo gallery
│   │   ├── 📄 contact-section.tsx # Contact information
│   │   ├── 📄 footer-section.tsx # Site footer
│   │   └── 📄 navigation.tsx    # Site navigation
│   ├── 📁 routes/               # Page routing (Qwik City)
│   │   ├── 📄 index.tsx         # Main wedding page
│   │   └── 📄 test.tsx          # Testing page
│   ├── 📄 global.css            # Global styles + wedding theme
│   ├── 📄 root.tsx              # App root component
│   └── 📄 entry.*.tsx           # Entry points for different modes
│
├── 📁 docs/                     # Comprehensive documentation
│   ├── 📄 README.md             # Documentation index
│   ├── 📁 architecture/         # System design documentation
│   ├── 📁 development/          # Development guides
│   ├── 📁 deployment/           # Deployment guides
│   ├── 📁 api/                  # API documentation
│   ├── 📁 examples/             # Templates and examples
│   └── 📁 troubleshooting/      # Problem-solving guides
│
├── 📁 config/                   # Configuration files
│   ├── 📄 README.md             # Configuration overview
│   ├── 📁 ai/                   # AI assistance configuration
│   │   ├── 📁 context-templates/ # AI context templates
│   │   └── 📁 workflow-templates/ # AI workflow templates
│   ├── 📁 development/          # Development configuration
│   └── 📁 deployment/           # Deployment configuration
│
├── 📁 tests/                    # Testing suite
│   ├── 📄 README.md             # Testing strategy
│   ├── 📁 unit/                 # Unit tests
│   ├── 📁 integration/          # Integration tests
│   ├── 📁 e2e/                  # End-to-end tests
│   └── 📁 visual/               # Visual regression tests
│
├── 📁 scripts/                  # Automation scripts
│   ├── 📄 README.md             # Scripts documentation
│   ├── 📄 setup.sh              # Project setup script
│   ├── 📄 build-docs.js         # Documentation builder
│   └── 📄 ai-context-generator.js # AI context generator
│
├── 📁 public/                   # Static assets
│   ├── 📄 favicon.svg           # Site favicon
│   ├── 📄 manifest.json         # PWA manifest
│   └── 📄 robots.txt            # SEO directives
│
└── 📁 .github/                  # GitHub workflows and templates
    └── 📄 README.md             # CI/CD documentation
```

---

## 🤖 AI-Assisted Development

### Master AI Context

This repository includes a comprehensive AI assistance system:

- **[CLAUDE.md](./CLAUDE.md)** - Complete AI context with all project information
- **Context Templates** - Structured templates for different development scenarios
- **Workflow Templates** - AI-assisted development patterns
- **Documentation Integration** - Seamless AI context across all docs

### AI Development Workflow

```markdown
# AI Context Usage

1. Reference CLAUDE.md for complete project context
2. Use context templates for specific development tasks
3. Follow workflow templates for consistent AI assistance
4. Update documentation as project evolves
```

### Quick AI Context Access

For optimal AI assistance, always reference:

- **[CLAUDE.md](./CLAUDE.md)** for complete project context
- **[Development Context](./config/ai/context-templates/development-context.md)** for coding tasks
- **[Component Workflow](./config/ai/workflow-templates/component-development.md)** for component development

---

## 💍 Wedding-Specific Considerations

### Indonesian Wedding Traditions

**Cultural Elements**

- **Color Significance** - Gold represents prosperity and happiness
- **Family Involvement** - Extended family and community celebration
- **Traditional Elements** - Subtle integration of Indonesian design motifs
- **Bilingual Support** - Indonesian and English content where appropriate

### Guest Experience Priority

**Mobile-First Design**

- **Smartphone Optimization** - Primary access method for guests
- **Touch-Friendly Interface** - Large buttons and easy navigation
- **Offline Capability** - Core information accessible without internet
- **Social Sharing** - Easy sharing of wedding details and photos

**Accessibility for All Guests**

- **Age-Inclusive Design** - Clear text and intuitive navigation
- **Vision Accessibility** - High contrast and screen reader support
- **Motor Accessibility** - Large touch targets and keyboard navigation
- **Cognitive Accessibility** - Clear information hierarchy

### RSVP Management

**Guest Communication**

- **Simple RSVP Form** - Minimal friction for guest responses
- **Confirmation System** - Immediate feedback and email confirmation
- **Guest Management** - Backend system for wedding planning
- **Cultural Preferences** - Meal options reflecting Indonesian cuisine

---

## 🌟 Getting Started for Contributors

### For Wedding Website Development

1. **Read the Documentation** - Start with [CLAUDE.md](./CLAUDE.md) and [docs/README.md](./docs/README.md)
2. **Set Up Development Environment** - Follow [Development Setup Guide](./docs/development/setup-guide.md)
3. **Explore Components** - Review existing components in `src/components/`
4. **Understand Wedding Context** - Familiarize yourself with Alfina & Mugni's story
5. **Follow Code Standards** - Use provided templates and style guides

### For Technical Contributors

1. **Architecture Overview** - Read [System Overview](./docs/architecture/system-overview.md)
2. **API Documentation** - Review [API docs](./docs/api/) for component interfaces
3. **Testing Strategy** - Understand [testing approach](./tests/README.md)
4. **Deployment Process** - Learn [deployment workflow](./docs/deployment/deployment-guide.md)

### For AI-Assisted Development

1. **AI Context** - Always reference [CLAUDE.md](./CLAUDE.md) for complete context
2. **Context Templates** - Use [AI context templates](./config/ai/context-templates/) for specific tasks
3. **Workflow Templates** - Follow [AI workflow templates](./config/ai/workflow-templates/) for consistency

---

## 💝 About Alfina & Mugni

This website celebrates the love story of **Alfina and Mugni**, who will be united in marriage on **November 29, 2025**, in the beautiful city of **Jakarta, Indonesia**.

The website reflects their journey together and serves as a digital invitation to family and friends to join in their celebration of love, commitment, and the beginning of their new life together.

**Built with love, code, and the finest web technologies** ✨

---

## 📞 Contact & Support

- **Documentation Issues**: See [Troubleshooting Guide](./docs/troubleshooting/common-issues.md)
- **Development Questions**: Check [CLAUDE.md](./CLAUDE.md) for AI context
- **Wedding Inquiries**: Use contact form on the website
- **Technical Support**: Create an issue in this repository

---

_Made with 💕 for Alfina & Mugni's Special Day_  
_November 29, 2025 | Jakarta, Indonesia_
