import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { Navigation } from "../components/navigation";
import { HeroSection } from "../components/hero-section";
import { CountdownSection } from "../components/countdown-section";
import { StorySection } from "../components/story-section";
import { DetailsSection } from "../components/details-section";
import { GiftSection } from "../components/gift-section";
import { RsvpSection } from "../components/rsvp-section";
import { WishesSection } from "../components/wishes-section";
import { GallerySection } from "../components/gallery-section";
import { QrCodeSection } from "../components/qr-code-section";
import { ContactSection } from "../components/contact-section";
import { FooterSection } from "../components/footer-section";

export default component$(() => {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <CountdownSection />
        <StorySection />
        <DetailsSection />
        <GiftSection />
        <RsvpSection />
        <WishesSection />
        <GallerySection />
        <QrCodeSection />
        <ContactSection />
        <FooterSection />
      </main>
    </>
  );
});

export const head: DocumentHead = {
  title: "Undangan Pernikahan Alfina & Mugni",
  meta: [
    {
      name: "description",
      content:
        "Bergabunglah bersama kami dalam perayaan cinta Alfina dan Mugni yang memulai perjalanan baru mereka. 29 November 2025 di Jakarta, Indonesia.",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0",
    },
    {
      property: "og:title",
      content: "Undangan Pernikahan Alfina & Mugni",
    },
    {
      property: "og:description",
      content:
        "Bergabunglah bersama kami dalam perayaan cinta Alfina dan Mugni yang memulai perjalanan baru mereka.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
};
