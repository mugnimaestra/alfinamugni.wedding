<!-- 4004113a-f69d-490e-91ab-2c0ce833f8a7 b9d2cf3b-6aec-40be-ab0c-dc3de0b05137 -->
# Wedding Website Animation Enhancement Plan

## Analysis Summary

After analyzing https://andinidika.wedding/invitation/ and your current codebase, I've identified key animation opportunities that will significantly enhance user experience:

### Reference Site Strengths

- Smooth scroll-triggered reveals
- Clean cover-to-content transition
- Live countdown with subtle animations
- Polished micro-interactions
- Good loading states

### Current Site Opportunities

- Basic fade/slide animations exist but lack sophistication
- No scroll-triggered animations
- Missing decorative elements
- No parallax effects
- Limited micro-interactions

## Implementation Strategy

### Phase 1: Core Infrastructure

**1.1 Install Animation Libraries**

```bash
pnpm add motion svelte-inview
pnpm add -D @types/lottie-web
pnpm add lottie-web
```

**Libraries Chosen:**

- **Motion One** (5KB) - Modern, performant scroll/orchestration animations
- **svelte-inview** - Intersection Observer wrapper for Svelte
- **lottie-web** - For decorative Lottie animations

**1.2 Create Animation Utilities**

Create `src/lib/utils/scroll-animations.ts`:

- Reusable animation presets (fadeUp, fadeIn, scaleIn, slideLeft, slideRight)
- Stagger utilities
- Parallax helpers
- Accessibility (respect prefers-reduced-motion)

Create `src/lib/components/animations/ScrollReveal.svelte`:

- Wrapper component using svelte-inview
- Configurable animation variants
- Stagger support for children

Create `src/lib/components/animations/LottiePlayer.svelte`:

- Reusable Lottie component
- Props: src, loop, autoplay, speed, className

### Phase 2: Enhanced Core Animations

**2.1 Invitation Cover Enhancements** (`InvitationCover.svelte`)

- Add backdrop-blur effect to exit transition
- Stagger text animations (dear → name → monogram → couple names → button)
- Add floating hearts/sparkles Lottie in background
- Scale + blur combo for modern feel

**2.2 Hero Section Parallax** (`HeroSection.svelte`)

- Background parallax effect (move at 0.5x scroll speed)
- Staggered text reveal (heading → subtitle → divider → CTA → arrow)
- Add floating decorative elements (Lottie hearts/flowers)
- Enhance bounce animation on scroll arrow

**2.3 Countdown Animations** (`CountdownSection.svelte`)

- Number count-up animation on first view (0 → actual value)
- Smooth number transitions when values change
- Pulse effect on active changing number
- Enhance hover scale with rotation
- Add subtle shadow animation

### Phase 3: Scroll-Triggered Reveals

**3.1 Section-Level Animations**

Apply ScrollReveal to all major sections:

- `DetailsSection` - Fade up with stagger for event cards
- `GiftSection` - Scale in for gift cards
- `GallerySection` - Staggered grid reveal
- `WishesSection` - Fade in form, stagger wishes list
- `PhotoGallerySection` - Masonry reveal with stagger
- `FooterSection` - Fade up

**3.2 Element-Level Animations**

- Gallery photo cards: scale-in with stagger (100ms delay each)
- Wishes cards: slide-in from alternating sides
- Form inputs: subtle glow on focus
- Buttons: ripple effect on click

### Phase 4: Micro-Interactions

**4.1 Button Enhancements** (`app.css`)

- Add ripple effect keyframe
- Scale + shadow on hover
- Active state with slight depression
- Loading spinner for async actions

**4.2 Card Interactions**

- Hover: lift (translateY) + shadow increase
- Focus: outline with glow
- Active: slight scale down

**4.3 Form Enhancements**

- Input focus: border glow animation
- Error shake animation
- Success checkmark animation
- Character count fade-in

### Phase 5: Decorative Elements

**5.1 Floating Decorative Animations**

Create `src/lib/components/animations/FloatingElements.svelte`:

- CSS-based floating hearts (lightweight)
- Randomized positions and animation delays
- Subtle, non-distracting

**5.2 Section Dividers**

- Add SVG wave/curve dividers between sections
- Subtle color transitions
- Animated on scroll into view

**5.3 Lottie Decorations**

Download free Lottie files from LottieFiles.com:

- Hearts floating (for hero/cover)
- Sparkles (for buttons on hover)
- Flowers/floral (for section backgrounds)
- Confetti (for footer/thank you)

Place in `static/animations/`

### Phase 6: Loading & Performance

**6.1 Loading States**

- Skeleton screens for photo gallery
- Shimmer effect for loading cards
- Progress indicators for uploads
- Lazy load Lottie files

**6.2 Performance Optimizations**

- Use CSS transforms (GPU-accelerated)
- IntersectionObserver for scroll (not scroll events)
- Lazy load animations below fold
- Reduce motion media query support
- Will-change hints for animated elements

### Phase 7: Accessibility & Polish

**7.1 Accessibility**

```css
@media (prefers-reduced-motion: reduce) {
 * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**7.2 Polish**

- Smooth scroll with custom easing
- Focus visible states
- Loading indicators
- Error animations

## New CSS Keyframes to Add

```css
/* Scroll reveal animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes blurFade {
  from { opacity: 0; filter: blur(10px); }
  to { opacity: 1; filter: blur(0); }
}

/* Micro-interactions */
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(93, 136, 187, 0.5); }
  50% { box-shadow: 0 0 20px rgba(93, 136, 187, 0.8); }
}

/* Decorative */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes numberChange {
  0% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
```

## File Structure

```
src/lib/
├── components/
│   ├── animations/
│   │   ├── ScrollReveal.svelte        [NEW]
│   │   ├── LottiePlayer.svelte        [NEW]
│   │   ├── FloatingElements.svelte    [NEW]
│   │   └── SectionDivider.svelte      [NEW]
│   ├── InvitationCover.svelte         [MODIFY]
│   ├── HeroSection.svelte             [MODIFY]
│   ├── CountdownSection.svelte        [MODIFY]
│   ├── GallerySection.svelte          [MODIFY]
│   └── PhotoGallerySection.svelte     [MODIFY]
├── utils/
│   └── scroll-animations.ts           [NEW]
└── app.css                            [MODIFY]

static/
└── animations/                         [NEW]
    ├── hearts-floating.json
    ├── sparkles.json
    ├── flowers.json
    └── confetti.json
```

## Expected Improvements

### User Experience

- **Engagement**: Scroll animations guide users through content
- **Polish**: Micro-interactions make site feel responsive
- **Delight**: Decorative elements add personality
- **Performance**: Optimized animations maintain smooth 60fps

### Technical Benefits

- **Reusable**: Animation utilities for future features
- **Accessible**: Respects user preferences
- **Maintainable**: Clean component structure
- **Small Bundle**: Motion One is only 5KB

## Comparison to Reference Site

**What We'll Match:**

✓ Smooth scroll reveals

✓ Clean cover transition

✓ Countdown animations

✓ Micro-interactions

**What We'll Exceed:**

✓ Decorative Lottie animations (they don't have)

✓ Parallax effects (more sophisticated)

✓ Stagger animations (better orchestration)

✓ Loading states (more polished)

## Next Steps

Before implementation, I need clarification:

1. **Animation Intensity**: Do you prefer subtle/elegant or more dynamic/playful animations?

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - a) Subtle and elegant (recommended for wedding site)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - b) More dynamic and playful

2. **Lottie Assets**: Should I create simple CSS-based decorations or download free Lottie files?

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - a) CSS-based (lighter, faster)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - b) Lottie files (more sophisticated, but heavier)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - c) Mix of both (recommended)

3. **Priority**: Which phase should we focus on first?

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - a) Core animations + scroll reveals (Phases 1-3) - recommended
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - b) All phases including decorative elements
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - c) Just quick wins (Phase 2 only)

### To-dos

- [ ] Install animation libraries (motion, svelte-inview, lottie-web)
- [ ] Create animation utility files and base components (scroll-animations.ts, ScrollReveal, LottiePlayer)
- [ ] Enhance InvitationCover with stagger animations, blur effects, and decorative elements
- [ ] Add parallax and stagger animations to HeroSection
- [ ] Implement count-up and transition animations for CountdownSection
- [ ] Add scroll-triggered reveals to all sections (Details, Gift, Gallery, Wishes, Footer)
- [ ] Implement button ripples, card hovers, and form focus animations
- [ ] Add floating elements, section dividers, and Lottie animations
- [ ] Add loading states, skeletons, and performance optimizations
- [ ] Add prefers-reduced-motion support, focus states, and final polish