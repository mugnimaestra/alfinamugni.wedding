import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { animateHeroEntrance } from "../utils/animations";

export const HeroSection = component$(() => {
  // Initialize animations on client-side
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    animateHeroEntrance();
  });

  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--wedding-beige)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <p
          class="hero-subtitle"
          style={{
            color: "var(--wedding-text-muted)",
            fontSize: "24px",
            marginBottom: "16px",
            fontWeight: "300",
            opacity: 0,
          }}
        >
          We're Getting Married!
        </p>

        <h1
          class="hero-title"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "72px",
            color: "var(--wedding-brown)",
            marginBottom: "24px",
            fontWeight: "300",
            opacity: 0,
          }}
        >
          Alfina & Mugni
        </h1>

        <div
          class="hero-divider"
          style={{
            width: "128px",
            height: "2px",
            backgroundColor: "var(--wedding-accent)",
            margin: "0 auto 24px",
            transformOrigin: "center",
            transform: "scaleX(0)",
            opacity: 0,
          }}
        ></div>

        <p
          class="hero-subtitle"
          style={{
            color: "var(--wedding-text-secondary)",
            fontSize: "32px",
            marginBottom: "32px",
            fontWeight: "400",
            opacity: 0,
          }}
        >
          November 29, 2025
        </p>

        <p
          class="hero-subtitle"
          style={{
            color: "var(--wedding-text-muted)",
            fontSize: "20px",
            marginBottom: "48px",
            maxWidth: "512px",
            margin: "0 auto 48px",
            opacity: 0,
          }}
        >
          Join us for a celebration of love
        </p>

        <div
          class="hero-scroll-indicator"
          style={{
            opacity: 0,
            cursor: "pointer",
          }}
          onClick$={() => {
            // Smooth scroll to next section
            const storySection = document.querySelector("#story-section");
            if (storySection) {
              storySection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <svg
            style={{
              width: "32px",
              height: "32px",
              color: "var(--wedding-accent)",
              margin: "0 auto",
              animation: "bounce 2s infinite",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
});
