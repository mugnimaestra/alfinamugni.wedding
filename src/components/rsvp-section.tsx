import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  animateOnScroll,
  animateButton,
  animateCards,
} from "../utils/animations";

export const RsvpSection = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Animate section heading
    animateOnScroll(".rsvp-heading", { delay: 0.2, direction: "up" });

    // Animate description paragraphs
    animateOnScroll(".rsvp-description", { delay: 0.4, direction: "up" });
    animateOnScroll(".rsvp-deadline", { delay: 0.6, direction: "up" });

    // Animate RSVP button
    animateOnScroll(".rsvp-button", { delay: 0.8, direction: "up" });
    animateButton(".rsvp-button");

    // Animate info cards
    animateCards(".rsvp-info-card");
  });

  return (
    <section
      id="rsvp"
      class="min-h-screen bg-wedding-cream flex flex-col items-center justify-center px-4 py-20"
    >
      <div class="max-w-4xl mx-auto text-center">
        <h2
          class="rsvp-heading font-serif text-4xl md:text-6xl text-wedding-brown mb-12 font-light"
          style={{ opacity: 0 }}
        >
          RSVP
        </h2>

        <p
          class="rsvp-description text-wedding-text-secondary text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto"
          style={{ opacity: 0 }}
        >
          Please let us know if you'll be joining us for our special day. Your
          presence would mean the world to us!
        </p>

        <p
          class="rsvp-deadline text-wedding-text-primary text-xl md:text-2xl font-medium mb-12"
          style={{ opacity: 0 }}
        >
          Kindly respond by November 15, 2025
        </p>

        <button
          class="rsvp-button wedding-button text-lg md:text-xl px-12 py-5"
          style={{ opacity: 0 }}
          onClick$={() =>
            alert(
              "RSVP functionality coming soon! Please check back closer to the wedding date.",
            )
          }
        >
          RSVP Now
        </button>

        <div class="mt-16 grid md:grid-cols-2 gap-x-16 gap-y-8 max-w-4xl mx-auto">
          <div class="rsvp-info-card text-center" style={{ opacity: 0 }}>
            <h3 class="font-serif text-2xl md:text-3xl text-wedding-brown mb-4 font-medium">
              Dress Code
            </h3>
            <p class="text-wedding-text-secondary text-lg">Formal Attire</p>
            <p class="text-wedding-text-muted text-base mt-2">
              We kindly request no white or cream colors
            </p>
          </div>

          <div class="rsvp-info-card text-center" style={{ opacity: 0 }}>
            <h3 class="font-serif text-2xl md:text-3xl text-wedding-brown mb-4 font-medium">
              Gift Registry
            </h3>
            <p class="text-wedding-text-secondary text-lg">
              Your presence is our present
            </p>
            <p class="text-wedding-text-muted text-base mt-2">
              But if you wish to honor us with a gift, we're registered at...
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
