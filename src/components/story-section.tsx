import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { animateOnScroll } from "../utils/animations";

export const StorySection = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Animate heading
    animateOnScroll(".story-heading", { delay: 0.2, direction: "up" });

    // Animate paragraphs with stagger
    animateOnScroll(".story-paragraph", { delay: 0.4, direction: "up" });
    animateOnScroll(".story-paragraph-2", { delay: 0.6, direction: "up" });
  });

  return (
    <section
      id="story-section"
      style={{
        minHeight: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <h2
          class="story-heading"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "64px",
            color: "var(--wedding-brown)",
            marginBottom: "48px",
            fontWeight: "300",
            opacity: 0,
          }}
        >
          Our Story
        </h2>

        <div style={{ maxWidth: "768px", margin: "0 auto" }}>
          <p
            class="story-paragraph"
            style={{
              color: "var(--wedding-text-secondary)",
              fontSize: "20px",
              lineHeight: "1.7",
              marginBottom: "32px",
              opacity: 0,
            }}
          >
            We met in university during our final year, both working late nights
            in the library. What started as study sessions over coffee turned
            into long conversations about our dreams and aspirations.
          </p>

          <p
            class="story-paragraph-2"
            style={{
              color: "var(--wedding-text-secondary)",
              fontSize: "20px",
              lineHeight: "1.7",
              opacity: 0,
            }}
          >
            After years of friendship and love, we're ready to begin our next
            chapter together. We can't wait to celebrate this special moment
            with our family and friends.
          </p>
        </div>
      </div>
    </section>
  );
});
