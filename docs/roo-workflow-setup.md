# Roo Workflow Setup & Orchestrator Guide for Alfina & Mugni's Wedding Website

**Alfina & Mugni's Wedding Website - Roo-Assisted Development Workflow Guide**

_This guide provides comprehensive instructions for leveraging Roo's Orchestrator mode in the development of this Qwik-based wedding website project, emphasizing wedding-specific contexts, Qwik patterns, and pragmatic teamwork with Roo's specialized modes (Architect, Code, Debug, Ask)._

## 🎯 Overview

Roo's Orchestrator mode excels at coordinating complex, multi-step projects by breaking down wedding website features into manageable subtasks and delegating them to appropriate specialized modes. This guide focuses on practical workflows for maintaining the project's Qwik-based architecture, ensuring cultural sensitivity for Indonesian wedding traditions, and optimizing for mobile performance while using Bun as the package manager.

### Key Project Characteristics
- **Framework**: Qwik v1.14.1 with resumability for instant interactivity on mobile devices
- **Package Manager**: Bun for fast installation and development server
- **Target**: November 29, 2025 Jakarta wedding celebration
- **Priorities**: Performance, accessibility (WCAG 2.1 AA), Indonesian cultural elements
- **Architecture**: Component-based with Qwik signals, Tailwind CSS theming, static site generation

## 🚀 Project Setup Using Bun

Follow these steps to establish your development environment, leveraging Bun for optimal performance. This setup is based on the detailed [`setup-guide.md`](../development/setup-guide.md).

### Step 1: Prerequisites
Ensure you have:
- Node.js v20+ (or use NVM as documented)
- Git v2.30+
- macOS/Linux/Windows with WSL2 (recommended)

### Step 2: Install Bun
```bash
# Install Bun (follow platform-specific instructions in setup-guide.md)
curl -fsSL https://bun.sh/install | bash
```

### Step 3: Clone and Install
```bash
# Clone repository
git clone https://github.com/mugnihadi/alfinamugni.wedding.git
cd alfinamugni.wedding

# Install dependencies with Bun
bun install

# Verify setup
bun run dev
# Server should start on http://localhost:5173
```

### Step 4: Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Configure wedding-specific variables
# Edit .env.local with wedding date, location, couple names
```

## 🤖 Development Workflow with Roo Orchestrator Mode

### Orchestrator Mode Philosophy
Orchestrator mode coordinates complex features by:
1. **Analyzing wedding requirements** into 5-10 actionable subtasks
2. **Delegating** to Architect (planning), Code (implementation), Debug (optimization), Ask (clarification)
3. **Maintaining dependencies** and monitoring progress
4. **Emphasis on Qwik resumability** and mobile-first wedding experience

### Mode Usage Guidelines

| Mode | Purpose | Wedding Context |
|------|---------|----------------|
| **Architect** | System design, data flows, integrations | Planning RSVP data models with Indonesian guest preferences |
| **Code** | Implementation, refactoring, new features | Adding gallery components with lazy loading for wedding photos |
| **Debug** | Issue resolution, testing, performance profiling | Debugging RSVP submission latency on mobile devices |
| **Ask** | Research, best practices, specifications | Indonesian wedding etiquette for RSVP forms |

### Activation Process
```bash
# Switch to Orchestrator mode when tackling:
# - New wedding sections (RSVP, Gallery)
# - Theme customizations across multiple components
# - Performance optimizations involving multiple files
# - Complex features with cultural considerations
```

## 📋 Step-by-Step Workflow Guides

### 1. Setting Up the Project
**Goal**: Establish working development environment  
**Success Criteria**: Development server running, all dependencies installed

**Subtask Delegation**:
- **Architect**: Review [`system-overview.md`](../architecture/system-overview.md) for architecture alignment
- **Code**: Execute setup commands, configure Tailwind
- **Debug**: Troubleshoot Bun/org setup issues (refer to [`common-issues.md`](../troubleshooting/common-issues.md))
- **Ask**: Clarify Bun vs npm differences if needed

**Qwik Wedding Patterns**:
- Verify Qwik setup with `bun run dev` - look for instant page loads
- Check wedding-specific routes in [`src/routes/`](../../src/routes/)

### 2. Adding/Editing Wedding Components
**Goal**: Create or modify wedding sections (hero, story, RSVP)  
**Success Criteria**: Component renders correctly, follows Qwik resumability

**Step-by-Step Process**:

1. **Analyze Requirements** (Orchestrator)
   ```bash
   # Example: Adding Indonesian RSVP support
   # Identify: Guest name fields, dietary restrictions, attendance confirmation
   ```

2. **Design Architecture** (Architect Mode)
   - Plan Qwik signals for guest state management
   - Design wedding-themed component interfaces
   - Consider mobile-first responsive patterns

3. **Implement Component** (Code Mode)
   ```typescript
   // Qwik pattern: Use component$ with resumability
   export const WeddingRSVP = component$<{ weddingData: WeddingData }>(({ weddingData }) => {
     const guestData = useSignal<GuestData>({});
     
     const handleSubmit = $(() => {
       // Qwik $ function for client-server boundary
       console.log('Indonesian RSVP submitted');
     });

     return (
       <section class="wedding-rsvp" aria-labelledby="rsvp-title">
         {/* Wedding-specific form implementation */}
       </section>
     );
   });
   ```

4. **Integrate & Styling** (Code Mode)
   - Add to [`src/components/`](../../src/components/) directory
   - Apply wedding theme from [`global.css`](../../src/global.css)
   - Import in routes for rendering

5. **Culture Integration**
   - Add Indonesian language support for guest communications
   - Include local datetime formats (Jakarta time zone)
   - Consider Javanese wedding traditions in UI elements

6. **Performance Optimization** (Debug Mode)
   - Enable Qwik lazy loading for component
   - Test resumability on mobile devices
   - Profile rendering performance for wedding day usage

**References**:
- [`component-template.md`](../examples/component-templates/component-template.md)
- [`wedding-theme.md`](../examples/styling-examples/wedding-theme.md)

### 3. Customizing Themes & Styling
**Goal**: Modify wedding color schemes, typography, and responsive design  
**Success Criteria**: WCAG 2.1 AA compliant, mobile-optimized

**Workflow Approach**:
1. **Architect**: Audit current theme structure in [`global.css`](../../src/global.css)
2. **Code**: Update Tailwind classes with wedding color variables
3. **Debug**: Cross-browser testing and accessibility audits
4. **Ask**: Indonesian color symbolism significance

**Wedding Theme Patterns**:
```css
:root {
  --wedding-cream: #faf7f5;
  --wedding-brown: #4d3326;
  --wedding-accent: #b2804d;
}

/* Mobile-first responsive design */
.wedding-section {
  padding: clamp(3rem, 8vw, 5rem) 1rem;
}
```

**Key Considerations**:
- Maintain 4:1 contrast ratio for wedding text
- Optimize font loading for Indonesian characters
- Ensure touch targets meet 44px minimum

### 4. Creating Tests
**Goal**: Comprehensive test coverage for wedding features  
**Success Criteria**: All tests passing, including E2E wedding flows

**Testing Strategy**:
1. **Architect**: Design test structure following [`system-overview.md`](../architecture/system-overview.md#testing-architecture)
2. **Code**: Write unit tests with Vitest, integration tests
3. **Debug**: E2E tests with Playwright for RSVP flows
4. **Ask**: Wedding-specific test scenarios (guest authentication, etc.)

**Qwik Testing Pattern**:
```typescript
// Unit test with Qwik testing dom
import { createDOM } from '@builder.io/qwik/testing';

test('Wedding RSVP form validation', async () => {
  const { screen, userEvent } = await createDOM();
  // Test Indonesian guest name validation
});
```

**Test Categories**:
- **Unit**: Individual Qwik components (`tests/unit/`)
- **Integration**: Component interactions (`tests/integration/`)
- **E2E**: Complete wedding user flows (`tests/e2e/`)
- **Visual**: Theme consistency (`tests/visual/`)

### 5. Debugging Issues
**Goal**: Resolve performance, functionality, and compatibility problems  
**Success Criteria**: Lighthouse score >90, zero accessibility violations

**Debugging Workflow**:
1. **Debug Mode**: Identify root causes using Roo's systematic approach
2. **Architect**: Review problematic system relationships
3. **Code**: Apply fixes with Qwik patterns
4. **Ask**: Consult Qwik documentation for complex resumability issues

**Common Wedding Site Issues**:

| Issue | Qwik Pattern Solution | Mode Approach |
|-------|----------------------|---------------|
| Slow first load | Enable lazy loading, optimize bundles | Debug → Code |
| RSV page errors | Check Qwik signal usage, event handlers | Debug → Architect |
| Mobile layout breaks | Test viewport units, responsive design | Code → Debug |
| Indonesian text rendering | Font loading strategy, fallback fonts | Code → Ask |

**Performance Profiling**:
```bash
# Use Qwik's build analyzer
bun run build:analyze

# Debug specific routes
bun run dev:debug
```

### 6. Preparing for Deployment
**Goal**: Production-ready build, including cultural optimizations  
**Success Criteria**: Static site generated, ready for CDN deployment

**Deployment Workflow**:
1. **Architect**: Review deployment config in [`deployment/production.config.js`](../../config/deployment/production.config.js)
2. **Code**: Configure environment variables for production
3. **Debug**: Performance testing, accessibility audits
4. **Ask**: Cultural considerations for production (Indonesian time zones)

**Key Deployment Steps**:
```bash
# Build for production
bun run build

# Preview build locally
bun run preview

# Optimize for wedding day traffic
# - Enable service worker caching
# - Configure static asset optimization
# - Test RSVP functionality at scale
```

## 🔗 Related Documentation Links

- **System Architecture**: [`../architecture/system-overview.md`](../architecture/system-overview.md)
- **Setup Instructions**: [`../development/setup-guide.md`](../development/setup-guide.md)
- **Component Examples**: [`../examples/component-templates/component-template.md`](../examples/component-templates/component-template.md)
- **Styling Guide**: [`../examples/styling-examples/wedding-theme.md`](../examples/styling-examples/wedding-theme.md)
- **Troubleshooting**: [`../troubleshooting/common-issues.md`](../troubleshooting/common-issues.md)
- **API Documentation**: [`../api/components-api.md`](../api/components-api.md)
- **Orchestrator Instructions**: [`roo-orchestrator-instructions.md`](../roo/orchestrator-instructions.md)

## 🎉 Best Practices Summary

**Qwik Wedding Patterns**:
- Always use `component$` for resumability
- Leverage `useSignal` for wedding state management
- Implement lazy loading for gallery components
- Prioritize mobile experience for guest accessibility

**Cultural Considerations**:
- Support Indonesian language throughout interface
- Consider Javanese wedding timeline (akad, resepsi)
- Respect different religious guest requirements
- Optimize for Indonesian timezone display

**Performance Targets**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3.0s
- Lighthouse score >90
- Zero accessibility blocking issues

**Roo Orchestrator Workflow**:
- Break complex wedding features into 5-10 subtasks
- Delegate to Architect for planning, Code for implementation
- Use Debug for optimization, Ask for research
- Communicate progress and dependencies clearly

---

_This guide is tailored for the Qwik wedding website project structure and should be referenced alongside [`CLAUDE.md`](../../CLAUDE.md) for optimal development workflow._