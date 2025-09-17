# Component Development Workflow Template

## AI-Assisted Component Development Process

_This template provides a structured workflow for developing wedding website components with AI assistance._

## Workflow Steps

### 1. Component Planning

```markdown
## Component Request Template

**Component Name**: [ComponentName]
**Purpose**: [Brief description of component functionality]
**Section**: [Which wedding section: hero, gallery, rsvp, story, details, contact]
**Props Interface**: [Required and optional props]
**Styling Requirements**: [Wedding theme requirements]
**Responsive Behavior**: [Mobile, tablet, desktop considerations]
**Accessibility Needs**: [WCAG compliance requirements]
```

### 2. Context Provision

Provide AI with:

- Current project structure from [`config/ai/context-templates/development-context.md`](context-templates/development-context.md)
- Component template patterns from [`docs/examples/component-templates/`](../../docs/examples/component-templates/)
- Styling guidelines from [`docs/examples/styling-examples/`](../../docs/examples/styling-examples/)
- Existing component files for consistency

### 3. Development Request Format

```markdown
## Development Request

Create a [ComponentName] component for Alfina & Mugni's wedding website with the following requirements:

**Functionality**:

- [List specific features and behaviors]

**Props Interface**:

- [Define TypeScript interface]

**Styling**:

- Use wedding theme colors and typography
- Implement responsive design (mobile-first)
- Follow Tailwind CSS patterns from styling guidelines

**Integration**:

- Compatible with existing [RelatedComponents]
- Follows Qwik component patterns

**Testing**:

- Include basic component test structure
```

### 4. Review Checklist

After AI generates component:

- [ ] TypeScript interfaces properly defined
- [ ] Wedding theme colors and fonts used
- [ ] Responsive design implemented
- [ ] Accessibility attributes included
- [ ] Qwik component patterns followed
- [ ] Props validation included
- [ ] Component exports correctly structured

### 5. Integration Steps

1. Place component in appropriate [`src/components/`](../../../src/components/) directory
2. Update component imports in related files
3. Add component to relevant pages
4. Test component functionality
5. Validate responsive behavior
6. Check accessibility compliance

## Common Component Types

### Wedding Section Components

```typescript
interface WeddingSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  className?: string;
}
```

### Interactive Components

```typescript
interface InteractiveComponentProps {
  onAction$?: QRL<() => void>;
  isLoading?: boolean;
  disabled?: boolean;
}
```

### Media Components

```typescript
interface MediaComponentProps {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
  sizes?: string;
}
```

## Quality Assurance

### Code Quality Checks

- ESLint compliance
- TypeScript strict mode compatibility
- Prettier formatting
- Component prop validation

### Wedding Website Specific Checks

- Theme consistency
- Guest accessibility
- Mobile performance
- Cross-browser compatibility

### Testing Requirements

- Unit tests for component logic
- Visual regression tests
- Accessibility tests
- Integration tests with related components

## Documentation Updates

After component completion:

- Update component documentation
- Add usage examples
- Update architectural documentation
- Include in component library overview
