import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { Navigation } from "../components/navigation";
import { HeroSection } from "../components/hero-section";
import { StorySection } from "../components/story-section";
import { DetailsSection } from "../components/details-section";
import { RsvpSection } from "../components/rsvp-section";
import { GallerySection } from "../components/gallery-section";
import { ContactSection } from "../components/contact-section";
import { FooterSection } from "../components/footer-section";

export default component$(() => {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <StorySection />
        <DetailsSection />
        <RsvpSection />
        <GallerySection />
        <ContactSection />
        <FooterSection />
      </main>
    </>
  );
});

export const head: DocumentHead = {
  title: "Alfina & Mugni Wedding Invitation",
  meta: [
    {
      name: "description",
      content:
        "Join us for the celebration of love as Alfina and Mugni begin their journey together. November 29, 2025 in Jakarta, Indonesia.",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0",
    },
    {
      property: "og:title",
      content: "Alfina & Mugni Wedding Invitation",
    },
    {
      property: "og:description",
      content:
        "Join us for the celebration of love as Alfina and Mugni begin their journey together.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
};
