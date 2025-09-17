# Page Template Examples

## Wedding Website Page Structure

_This document provides standardized templates for creating pages in Alfina & Mugni's Wedding Website._

## Basic Page Template

### Qwik Route Structure

```typescript
import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <>
      {/* Page Header */}
      <header class="wedding-page-header">
        {/* Navigation component */}
      </header>

      {/* Main Content */}
      <main class="wedding-page-main">
        {/* Page sections */}
      </main>

      {/* Page Footer */}
      <footer class="wedding-page-footer">
        {/* Footer component */}
      </footer>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Page Title | Alfina & Mugni Wedding',
  meta: [
    {
      name: 'description',
      content: 'Page description for SEO',
    },
    {
      property: 'og:title',
      content: 'Page Title | Alfina & Mugni Wedding',
    },
    {
      property: 'og:description',
      content: 'Page description for social sharing',
    },
    {
      property: 'og:image',
      content: '/wedding-og-image.jpg',
    },
  ],
};
```

## Wedding Homepage Template

### Complete Homepage Structure

```typescript
import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

// Import wedding components
import { Navigation } from '~/components/navigation';
import { HeroSection } from '~/components/hero-section';
import { StorySection } from '~/components/story-section';
import { DetailsSection } from '~/components/details-section';
import { GallerySection } from '~/components/gallery-section';
import { RsvpSection } from '~/components/rsvp-section';
import { ContactSection } from '~/components/contact-section';
import { FooterSection } from '~/components/footer-section';

export default component$(() => {
  return (
    <>
      <Navigation />

      <main>
        <HeroSection
          brideName="Alfina"
          groomName="Mugni"
          weddingDate="November 29, 2025"
          location="Jakarta, Indonesia"
        />

        <StorySection />

        <DetailsSection
          ceremony={{
            date: "November 29, 2025",
            time: "10:00 AM",
            venue: "Venue Name",
            address: "Jakarta, Indonesia"
          }}
          reception={{
            date: "November 29, 2025",
            time: "6:00 PM",
            venue: "Reception Venue",
            address: "Jakarta, Indonesia"
          }}
        />

        <GallerySection />

        <RsvpSection />

        <ContactSection />
      </main>

      <FooterSection />
    </>
  );
});

export const head: DocumentHead = {
  title: 'Alfina & Mugni Wedding | November 29, 2025 | Jakarta',
  meta: [
    {
      name: 'description',
      content: 'Join us in celebrating the wedding of Alfina and Mugni on November 29, 2025 in Jakarta, Indonesia. RSVP and view our photo gallery.',
    },
    {
      name: 'keywords',
      content: 'wedding, Alfina, Mugni, November 2025, Jakarta, Indonesia, RSVP',
    },
    {
      property: 'og:title',
      content: 'Alfina & Mugni Wedding | November 29, 2025',
    },
    {
      property: 'og:description',
      content: 'Join us in celebrating our special day in Jakarta, Indonesia',
    },
    {
      property: 'og:image',
      content: '/alfina-mugni-wedding-og.jpg',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
  links: [
    {
      rel: 'canonical',
      href: 'https://alfinamugni.wedding/',
    },
  ],
};
```

## SEO Best Practices

### Meta Tags for Wedding Pages

- Include couple names in title
- Add wedding date and location
- Use descriptive meta descriptions
- Include Open Graph tags for social sharing
- Add structured data for events

### Performance Considerations

- Optimize images for web
- Implement lazy loading for gallery
- Use progressive enhancement
- Minimize initial bundle size
