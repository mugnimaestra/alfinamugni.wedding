import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { animateOnScroll, animateCards } from "../utils/animations";

export const DetailsSection = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Animate section heading
    animateOnScroll(".details-heading", { delay: 0.2, direction: "up" });

    // Animate cards with stagger
    animateCards(".details-card");
  });

  return (
    <section
      id="details"
      class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20"
    >
      <div class="max-w-6xl mx-auto text-center">
        <h2
          class="details-heading font-serif text-4xl md:text-6xl text-wedding-brown mb-16 font-light"
          style={{ opacity: 0 }}
        >
          Wedding Details
        </h2>

        <div class="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
          {/* Ceremony Details */}
          <div
            class="details-card wedding-card bg-wedding-beige border-0 transition-all duration-300 hover:shadow-lg"
            style={{ opacity: 0 }}
          >
            <div class="text-center">
              <h3 class="font-serif text-3xl md:text-4xl text-wedding-brown mb-6 font-medium">
                Ceremony
              </h3>

              <p class="text-wedding-text-secondary text-xl md:text-2xl mb-6 font-medium">
                4:00 PM
              </p>

              <div class="text-wedding-text-muted text-base md:text-lg space-y-1">
                <p class="font-medium">St. Mary's Cathedral</p>
                <p>123 Wedding Avenue</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          {/* Reception Details */}
          <div
            class="details-card wedding-card bg-wedding-sage border-0 transition-all duration-300 hover:shadow-lg"
            style={{ opacity: 0 }}
          >
            <div class="text-center">
              <h3 class="font-serif text-3xl md:text-4xl text-wedding-brown mb-6 font-medium">
                Reception
              </h3>

              <p class="text-wedding-text-secondary text-xl md:text-2xl mb-6 font-medium">
                7:00 PM - 11:00 PM
              </p>

              <div class="text-wedding-text-muted text-base md:text-lg space-y-1">
                <p class="font-medium">Grand Ballroom Hotel Indonesia</p>
                <p>456 Celebration Street</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
