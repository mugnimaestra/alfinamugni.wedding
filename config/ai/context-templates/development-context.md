# AI Development Context Templates

**Alfina & Mugni's Wedding Website - AI Assistant Context & Workflow Templates**

_This document provides comprehensive context templates and workflow patterns for AI-assisted development on the wedding website project._

## 🎯 Project Context Quick Reference

### Wedding Project Overview

```markdown
**Project**: Alfina & Mugni's Wedding Website
**Wedding Date**: December 15, 2024
**Location**: Jakarta, Indonesia
**Tech Stack**: Qwik + TypeScript + Tailwind CSS
**Build Tool**: Vite + Bun
**Deployment**: Static Site Generation

**Design Philosophy**:

- Romantic elegance with Indonesian cultural touches
- Mobile-first responsive design
- Accessibility-compliant (WCAG 2.1 AA)
- Performance-optimized for instant loading

**Color Palette**:

- Primary: Wedding Brown (#4d3326), Wedding Accent (#b2804d)
- Backgrounds: Wedding Cream (#faf7f5), Wedding Beige (#f0e3d9)
- Accents: Wedding Sage (#d9e5e0), Wedding Lavender (#e0d9e5)
```

## 🧠 Context Templates for Common Tasks

### 1. Component Development Context

````markdown
**Task**: Creating/Modifying Wedding Components

**Context Required**:

- Component follows Qwik patterns with component$() and $() for event handlers
- TypeScript interfaces for all props
- Wedding design system colors and spacing
- Mobile-first responsive design
- Accessibility attributes (ARIA labels, semantic HTML)
- Indonesian wedding cultural context where relevant

**Pattern Example**:

```typescript
interface WeddingComponentProps {
  title: string;
  variant?: "primary" | "secondary" | "accent";
  onInteraction$?: QRL<(data: any) => void>;
}

export const WeddingComponent = component$<WeddingComponentProps>(
  ({ title, variant = "primary", onInteraction$ }) => {
    const isVisible = useSignal(false);

    return (
      <section class={`wedding-section wedding-section--${variant}`}>
        <h2 class="wedding-heading">{title}</h2>
        <Slot />
      </section>
    );
  }
);
```
````

**Styling Requirements**:

- Use CSS custom properties from wedding theme
- Follow wedding-\* class naming convention
- Implement smooth animations with cubic-bezier easing
- Ensure 4.5:1 color contrast minimum
- Support reduced motion preferences

````

### 2. RSVP System Development Context

```markdown
**Task**: RSVP System Implementation

**Wedding-Specific Requirements**:
- Guest name and email (required)
- Attendance confirmation (yes/no/maybe)
- Guest count selection (max 5 per invitation)
- Dietary restrictions and special requests
- Personal message for the couple
- Indonesian and English language support

**Technical Implementation**:
- Form validation with Qwik signals
- Optimistic UI updates
- Email confirmation system
- Local storage for draft responses
- Analytics tracking for RSVP completion rates

**Cultural Considerations**:
- Indonesian naming conventions (may include titles)
- Dietary options including halal requirements
- Respectful language for "cannot attend" options
- Family-oriented guest counting (children considerations)

**Accessibility Requirements**:
- Screen reader compatible form labels
- Keyboard navigation support
- Error message announcements
- High contrast mode support
````

### 3. Gallery Component Context

```markdown
**Task**: Wedding Photo Gallery Development

**Content Requirements**:

- Engagement photos (8-12 images)
- Pre-wedding photoshoot (15-20 images)
- Venue photos (5-8 images)
- Family photos (6-10 images)

**Technical Implementation**:

- Lazy loading with intersection observer
- Progressive image loading (blur-up effect)
- Lightbox functionality with keyboard navigation
- Touch/swipe gestures for mobile
- Category filtering with smooth transitions

**Performance Optimization**:

- WebP format with JPEG fallbacks
- Responsive image sizes (srcset)
- Image compression for web delivery
- Preload critical above-the-fold images
- Virtual scrolling for large galleries

**Cultural Context**:

- Indonesian wedding photography traditions
- Family hierarchy in photo organization
- Modesty considerations in image selection
- Traditional wedding attire showcase
```

### 4. Styling & Theme Context

````markdown
**Task**: Styling Implementation

**Design System Reference**:

```css
:root {
  --wedding-cream: #faf7f5;
  --wedding-beige: #f0e3d9;
  --wedding-sage: #d9e5e0;
  --wedding-lavender: #e0d9e5;
  --wedding-brown: #4d3326;
  --wedding-accent: #b2804d;
  --wedding-text-primary: #4d3326;
  --wedding-text-secondary: #80664d;
  --wedding-text-muted: #998066;
}
```
````

**Typography Scale**:

- Headings: 'Playfair Display' serif, elegant script styling
- Body: 'Inter' sans-serif, clean readability
- Responsive sizing with clamp() functions

**Component Patterns**:

- .wedding-section for page sections
- .wedding-button for interactive elements
- .wedding-card for content containers
- .wedding-form for input elements

**Animation Guidelines**:

- Subtle fade-in-up animations on scroll
- 0.3s cubic-bezier(0.4, 0, 0.2, 1) transitions
- Respect prefers-reduced-motion
- Stagger animations for group elements

````

## 🔄 AI Workflow Templates

### Development Workflow Template

```markdown
**Step 1: Context Gathering**
- [ ] Read current CLAUDE.md for project overview
- [ ] Check existing component structure in src/components/
- [ ] Review current styling in src/global.css
- [ ] Understand requirements and wedding context

**Step 2: Planning**
- [ ] Define component/feature interfaces
- [ ] Plan responsive breakpoints
- [ ] Consider accessibility requirements
- [ ] Map user interaction flows

**Step 3: Implementation**
- [ ] Create TypeScript interfaces first
- [ ] Implement core functionality with Qwik patterns
- [ ] Apply wedding design system styling
- [ ] Add responsive design considerations
- [ ] Implement accessibility features

**Step 4: Testing & Validation**
- [ ] Test component in isolation
- [ ] Verify responsive behavior
- [ ] Check accessibility with screen readers
- [ ] Validate cultural appropriateness
- [ ] Performance check (bundle size, load time)

**Step 5: Integration & Documentation**
- [ ] Integrate with existing components
- [ ] Update relevant documentation
- [ ] Add usage examples
- [ ] Test full user journey
````

### Bug Fix Workflow Template

```markdown
**Issue Analysis Template**:

1. **Problem Description**:

   - What is the expected behavior?
   - What is the actual behavior?
   - Which browsers/devices are affected?

2. **Context Investigation**:

   - Is this a Qwik-specific issue?
   - Is this related to the wedding theme styling?
   - Does this affect accessibility?
   - Is this a responsive design issue?

3. **Root Cause Analysis**:

   - Check component prop types
   - Verify Qwik signal usage
   - Validate CSS specificity issues
   - Review mobile-specific considerations

4. **Solution Implementation**:

   - Apply minimal necessary changes
   - Maintain wedding design consistency
   - Preserve accessibility features
   - Test across target devices

5. **Prevention Measures**:
   - Add relevant unit tests
   - Update documentation
   - Consider linting rules
   - Review code patterns
```

### Code Review Context Template

```markdown
**Code Review Focus Areas**:

**Wedding Website Specific**:

- [ ] Follows wedding design system
- [ ] Maintains romantic/elegant aesthetic
- [ ] Respects Indonesian cultural elements
- [ ] Optimized for guest user experience

**Qwik Framework Compliance**:

- [ ] Proper use of component$() pattern
- [ ] Event handlers use $ syntax
- [ ] Signals used correctly for state
- [ ] No serialization issues

**Technical Excellence**:

- [ ] TypeScript interfaces defined
- [ ] Responsive design implemented
- [ ] Accessibility features included
- [ ] Performance optimizations applied
- [ ] Error handling present

**Code Quality**:

- [ ] Clear, descriptive naming
- [ ] Appropriate comments
- [ ] Consistent formatting
- [ ] Test coverage adequate
```

## 📝 Prompt Templates for AI Assistance

### Component Creation Prompt

```markdown
Create a wedding website component with the following requirements:

**Component Details**:

- Name: [ComponentName]
- Purpose: [Brief description]
- Props: [List required and optional props]

**Wedding Context**:

- This is for Alfina & Mugni's December 15, 2024 Jakarta wedding
- Should reflect romantic elegance with Indonesian cultural sensitivity
- Mobile-first design for wedding guests

**Technical Requirements**:

- Use Qwik component$() pattern with TypeScript
- Follow wedding design system (cream/beige/sage/lavender colors)
- Include accessibility attributes
- Implement responsive design
- Add smooth animations

**Styling**:

- Use wedding CSS variables from global.css
- Follow .wedding-\* class naming convention
- Ensure 4.5:1 color contrast
- Support reduced motion preferences

Please provide the complete component with TypeScript interfaces, styling, and usage example.
```

### Bug Fix Request Prompt

```markdown
Fix the following issue in the wedding website:

**Problem Description**:
[Detailed description of the issue]

**Current Behavior**:
[What's happening now]

**Expected Behavior**:
[What should happen]

**Context**:

- This is Alfina & Mugni's wedding website (December 15, 2024, Jakarta)
- Built with Qwik + TypeScript + Tailwind CSS
- Must maintain wedding design consistency
- Should work on mobile devices (primary user base)

**Constraints**:

- Preserve existing wedding styling
- Maintain accessibility features
- Don't break other components
- Follow Qwik best practices

Please provide the fix with explanation of the root cause and any preventive measures.
```

### Styling Enhancement Prompt

```markdown
Enhance the styling for the wedding website with the following requirements:

**Target Element/Component**:
[Specify what needs styling]

**Wedding Design Context**:

- Romantic elegance for Alfina & Mugni's wedding
- Indonesian cultural elements where appropriate
- Color palette: cream (#faf7f5), beige (#f0e3d9), sage (#d9e5e0), lavender (#e0d9e5)
- Accent colors: brown (#4d3326), gold accent (#b2804d)

**Technical Requirements**:

- Mobile-first responsive design
- Smooth animations (0.3s cubic-bezier transitions)
- Accessibility compliant (WCAG 2.1 AA)
- High contrast mode support
- Reduced motion support

**Style Goals**:
[Specific styling objectives]

Please provide CSS using the wedding design system variables and following the established patterns.
```

### Performance Optimization Prompt

```markdown
Optimize performance for the wedding website component/feature:

**Target**: [Component or feature name]

**Current Performance Issues**:
[Describe performance problems]

**Wedding Website Context**:

- Guest users primarily on mobile devices
- Indonesian network conditions (potentially slower)
- Critical user journey: RSVP submission
- Important for wedding day access

**Optimization Goals**:

- Improve load times
- Reduce bundle size
- Enhance mobile performance
- Maintain visual quality

**Constraints**:

- Preserve wedding design aesthetics
- Maintain accessibility features
- Keep Qwik's resumability benefits
- Don't break existing functionality

Please provide optimization strategy with code changes and performance metrics.
```

## 🎨 Cultural Context Guidelines

### Indonesian Wedding Traditions

```markdown
**Cultural Considerations for AI Development**:

**Language & Communication**:

- Respectful, formal tone in Indonesian context
- Family-oriented messaging (not just couple-focused)
- Consideration for multi-generational guests
- Bilingual support (Indonesian/English) where needed

**Visual Design Elements**:

- Warm, earthy color palette reflecting Indonesian aesthetics
- Gold accents for ceremonial significance
- Elegant typography respecting traditional calligraphy
- Subtle pattern integration (batik-inspired, not literal)

**Content Structure**:

- Family introduction before couple's story
- Traditional ceremony explanation for international guests
- Venue significance and cultural context
- Gift-giving customs and registry etiquette

**User Experience Considerations**:

- Mobile-first (WhatsApp sharing common)
- Simple navigation for all age groups
- Clear Indonesian date/time formats
- Cultural dress code guidance
- Accessibility for visually impaired relatives
```

### User Persona Context

```markdown
**Primary Users - Wedding Guests**:

**Demographics**:

- Age range: 25-65 years
- Mix of Indonesian and international guests
- Varying tech literacy levels
- Primarily mobile device users

**Needs & Goals**:

- Quick access to wedding details
- Easy RSVP submission
- Photo viewing and sharing
- Contact information access
- Gift registry information

**Pain Points**:

- Slow mobile networks
- Small screen sizes
- Language barriers
- Accessibility needs
- Time zone confusion

**Design Implications**:

- Large, touch-friendly buttons
- Clear, high-contrast text
- Minimal data usage
- Offline capability where possible
- Simple, intuitive navigation
```

## 🔗 Integration Patterns

### Component Integration Template

```typescript
// Pattern for integrating new components into wedding website

// 1. Import with proper typing
import { WeddingNewComponent } from './wedding-new-component';
import type { WeddingNewComponentProps } from './wedding-new-component';

// 2. Define component data
const componentData: WeddingNewComponentProps = {
  title: "Section Title",
  variant: "primary",
  backgroundStyle: "cream",
  // ... other props
};

// 3. Integration with proper section styling
export default component$(() => {
  return (
    <main>
      {/* Previous sections */}

      <WeddingNewComponent
        {...componentData}
        onInteraction$={$((data) => {
          // Handle interactions
          console.log('Wedding component interaction:', data);
        })}
      >
        <div class="wedding-content">
          {/* Slot content */}
        </div>
      </WeddingNewComponent>

      {/* Next sections */}
    </main>
  );
});
```

### State Management Pattern

```typescript
// Pattern for wedding-specific state management

export const useWeddingState = () => {
  // RSVP state
  const rsvpData = useSignal<RSVPData[]>([]);
  const rsvpCount = useComputed$(() =>
    rsvpData.value.reduce((sum, rsvp) => sum + rsvp.guestCount, 0),
  );

  // Gallery state
  const currentPhoto = useSignal<number>(0);
  const galleryCategory = useSignal<string>("all");

  // Navigation state
  const activeSection = useSignal<string>("hero");
  const mobileMenuOpen = useSignal<boolean>(false);

  // Actions
  const addRSVP = $((newRSVP: RSVPData) => {
    rsvpData.value = [...rsvpData.value, newRSVP];
  });

  const setActiveSection = $((section: string) => {
    activeSection.value = section;
  });

  return {
    rsvp: { rsvpData, rsvpCount, addRSVP },
    gallery: { currentPhoto, galleryCategory },
    navigation: { activeSection, mobileMenuOpen, setActiveSection },
  };
};
```

## 📚 Reference Links & Resources

### Quick Access Documentation

- **Main Context**: [`../../../CLAUDE.md`](../../../CLAUDE.md)
- **System Architecture**: [`../../../docs/architecture/system-overview.md`](../../../docs/architecture/system-overview.md)
- **Setup Guide**: [`../../../docs/development/setup-guide.md`](../../../docs/development/setup-guide.md)
- **Component Templates**: [`../../../docs/examples/component-templates/component-template.md`](../../../docs/examples/component-templates/component-template.md)
- **Styling Guide**: [`../../../docs/examples/styling-examples/wedding-theme.md`](../../../docs/examples/styling-examples/wedding-theme.md)
- **Troubleshooting**: [`../../../docs/troubleshooting/common-issues.md`](../../../docs/troubleshooting/common-issues.md)

### External Resources

- [Qwik Documentation](https://qwik.builder.io/)
- [Qwik City Guide](https://qwik.builder.io/qwikcity/overview/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🤖 AI Assistant Guidelines

### Best Practices for AI Assistance

1. **Always Consider Wedding Context**: Remember this is for a real couple's special day
2. **Cultural Sensitivity**: Respect Indonesian wedding traditions and customs
3. **Mobile-First Thinking**: Primary users will be on mobile devices
4. **Accessibility Priority**: Ensure inclusive design for all wedding guests
5. **Performance Focus**: Optimize for potentially slower network conditions
6. **Elegant Simplicity**: Maintain romantic, sophisticated aesthetic
7. **Family-Friendly**: Consider multi-generational user base

### Response Structure Template

```markdown
**Understanding**: [Confirm understanding of the request]

**Wedding Context**: [Acknowledge specific wedding requirements]

**Solution**: [Provide implementation with explanation]

**Considerations**: [Highlight important considerations]

- Cultural sensitivity
- Mobile optimization
- Accessibility
- Performance
- Wedding aesthetic

**Testing**: [Suggest testing approach]

**Related**: [Reference related documentation or patterns]
```

---

_This context file should be referenced for all AI-assisted development work on Alfina & Mugni's wedding website to ensure consistency, quality, and cultural appropriateness._
