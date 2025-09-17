# Roo Orchestrator Mode Instructions for Qwik Wedding Website Project

## Overview

Roo's Orchestrator mode is designed for handling complex, multi-step projects that require coordination across different specialties. In the context of this Qwik-based wedding website project (`/Users/mugnihadi/personal/alfinamugni.wedding`), Orchestrator mode helps break down wedding-specific features and optimizations into logical subtasks, delegating them to appropriate modes (Architect, Code, Debug, Ask) for efficient execution. These instructions supersede general mode guidelines when working on Qwik wedding projects, emphasizing Qwik's unique patterns, wedding cultural sensitivity, performance, and accessibility.

## Core Principles

### Task Decomposition
- Analyze complex wedding features (e.g., RSVP system, photo gallery, theme customization) into discrete subtasks.
- Identify dependencies between subtasks to maintain logical order.
- Estimate effort and priority for each subtask based on wedding timeline and complexity.

### Mode Delegation
- **Architect**: Use for planning system architecture, data flows, and integration strategies.
- **Code**: Use for implementing features, refactoring components, and writing new code.
- **Debug**: Use for resolving issues, testing, and optimizing performance bottlenecks.
- **Ask**: Use for clarification on Qwik patterns, wedding best practices, or technical specifications.

### Qwik-Specific Considerations
- Prioritize resumability (client-hiding) for better performance on mobile devices.
- Use Qwik's lazy-loading and signal-based reactivity for wedding site interactions.
- Optimize for first-party resources to reduce JavaScript bundle size.
- Ensure cultural sensitivity in wedding content (different traditions, languages).

## Workflow Process

1. **Activate Orchestrator Mode**: Switch using `/switch_mode orchestrator` or by requesting task breakdown.
2. **Task Analysis**: Break down the request into 5-10 actionable subtasks with clear success criteria.
3. **Subtask Delegation**: Assign each subtask to the most appropriate mode with specific instructions.
4. **Monitor Progress**: Track completion and update dependencies; resolve blockers immediately.
5. **Integration Testing**: After all subtasks complete, run end-to-end tests for wedding user flows.

## Wedding-Specific Task Examples

### Example 1: Implement RSVP Feature with Multi-language Support

**Primary Task**: "Add an RSVP system supporting Indonesian and English for the wedding website."

**Subtasks Breakdown**:
1. **Architect**: Design RSVP data model and API integration (`/new_task mode=architect message="Design RSVP system architecture with international phone support and cultural preferences"`).
2. **Code**: Implement RSVP form component with validation (`/new_task mode=code message="Create RSVP form component with Qwik onInput$ and multi-language i18n"`).
3. **Debug**: Add performance monitoring for RSVP submissions (`/new_task mode=debug message="Debug and optimize RSVP network requests using Qwik's fetch$"`).
4. **Ask**: Research wedding RSVP best practices for Indonesian ceremonies (`/new_task mode=ask message="Research Indonesian wedding RSVP etiquette and privacy considerations"`).

### Example 2: Customize Wedding Theme with Accessibility

**Primary Task**: "Make the wedding theme responsive and accessible for all guests."

**Subtasks Breakdown**:
1. **Architect**: Audit current theme structure and plan responsive design (`/new_task mode=architect message="Plan theme updates with WCAG 2.1 AA compliance in mind"`).
2. **Code**: Update Tailwind CSS classes for mobile-first design (`/new_task mode=code message="Refactor hero section for full responsiveness and add ARIA labels"`).
3. **Debug**: Test theme across devices and accessibility tools (`/new_task mode=debug message="Run axe-core tests and Lighthouse audits for wedding pages"`).
4. **Ask**: Get recommendations for culturally inclusive color schemes (`/new_task mode=ask message="Suggest wedding color palettes considering Indonesian cultural significance"`).

### Example 3: Add Gallery Functionality with Performance Optimization

**Primary Task**: "Integrate a photo gallery with lazy loading and image optimization."

**Subtasks Breakdown**:
1. **Architect**: Define gallery data structure and integration points (`/new_task mode=architect message="Design gallery component with upload and display flows"`).
2. **Code**: Implement gallery component using Qwik's Intersection Observer API (`/new_task mode=code message="Create gallery component with Qwik's visible$ for lazy loading"`).
3. **Debug**: Optimize image loading and cache strategies (`/new_task mode=debug message="Debug image preload and WebP conversion for performance"`).
4. **Ask**: Evaluate third-party image hosting security for wedding photos (`/new_task mode=ask message="Recommend secure image hosting solutions for wedding galleries"`).

## Performance Optimization Guidelines

- Minimize initial bundle size by lazy-loading wedding-specific routes.
- Use Qwik's `useResource$` for fetching guest data on-demand.
- Optimize font loading and reduce layout shifts for smoother wedding site navigation.
- Implement service worker caching for offline wedding program access.

## Accessibility Considerations

- Ensure color contrast ratios meet WCAG AA for wedding text readability.
- Add semantic HTML and ARIA labels for screen reader compatibility.
- Support keyboard navigation for RSVPing and navigation menus.
- Test with VoiceOver/Screen Reader for Indonesian language support.
- Consider motor accessibility for folder guests (touch targets, reduced motion preferences).

## Success Metrics

- All subtasks completed within specified wedding timeline.
- Lighthouse performance score >90 for core wedding pages.
- Zero accessibility blocking issues on axe-core scans.
- Successful user acceptance testing for RSVP and gallery flows.

## Troubleshooting

If a subtask fails:
1. Switch to Debug mode for root cause analysis.
2. Consult Ask mode for Qwik-specific guidance.
3. Re-delegate failing subtask with refined requirements.
4. Update overall workflow if dependencies are affected.

These instructions are tailored to the Qwik wedding project structure in `/src/` and should be referenced for all complex features requiring cross-mode coordination.