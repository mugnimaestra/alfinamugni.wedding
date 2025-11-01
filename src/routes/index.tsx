import {
  component$,
  useSignal,
  useVisibleTask$,
  useContextProvider,
  $,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";

import { Navigation } from "../components/navigation";
import { HeroSection } from "../components/hero-section";
import { CountdownSection } from "../components/countdown-section";
import { StorySection } from "../components/story-section";
import { DetailsSection } from "../components/details-section";
import { GiftSection } from "../components/gift-section";
import { RsvpSection } from "../components/rsvp-section";
import { WishesSection } from "../components/wishes-section";
import { GallerySection } from "../components/gallery-section";
import { ContactSection } from "../components/contact-section";
import { FooterSection } from "../components/footer-section";
import { InvitationCover } from "../components/invitation-cover";
import { AudioPlayer } from "../components/audio-player";
import { AudioContext, useAudioStore } from "../stores/audio-store";

export default component$(() => {
  const location = useLocation();
  const showCover = useSignal(true);

  // Extract guest name from URL parameter (?to=John+Doe)
  const guestName = location.url.searchParams.get("to") || undefined;

  // Initialize audio store and provide context (always, even during SSR)
  const audioStore = useAudioStore();
  useContextProvider(AudioContext, audioStore);

  // Initialize audio element on client only
  useVisibleTask$(() => {
    if (typeof window !== "undefined") {
      audioStore.init();
    }
  }, { strategy: 'document-ready' });

  // Lock body scroll when cover is visible
  useVisibleTask$(({ track }) => {
    track(() => showCover.value);

    if (typeof window !== "undefined") {
      if (showCover.value) {
        // Lock scroll when cover is visible
        document.body.style.overflow = "hidden";
        console.log("Body scroll locked");
      } else {
        // Unlock scroll when cover is hidden
        document.body.style.overflow = "";
        console.log("Body scroll unlocked");
      }
    }

    // Cleanup function to ensure scroll is restored
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, { strategy: 'document-ready' });

  // Handle "Open Invitation" button click
  const handleOpenInvitation = $(() => {
    console.log("handleOpenInvitation called");
    showCover.value = false;
    // Play audio when invitation is opened
    audioStore.play();
  });

  return (
    <>
      {/* Invitation Cover (shows first, hides after clicking "Open Invitation") */}
      {showCover.value && (
        <InvitationCover
          guestName={guestName}
          onOpen$={handleOpenInvitation}
        />
      )}

      {/* Main Website Content - Only render after cover is dismissed for better performance */}
      {!showCover.value && (
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
            <ContactSection />
            <FooterSection />
          </main>

          {/* Floating Audio Player (always visible after opening invitation) */}
          <AudioPlayer />
        </>
      )}
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
