import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { animateOnScroll } from "../utils/animations";

export const CountdownSection = component$(() => {
  const days = useSignal(0);
  const hours = useSignal(0);
  const minutes = useSignal(0);
  const seconds = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Wedding date: November 29, 2025
    const weddingDate = new Date("2025-11-29T09:00:00+07:00").getTime(); // 9 AM Jakarta time (Akad Nikah)

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance > 0) {
        days.value = Math.floor(distance / (1000 * 60 * 60 * 24));
        hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        seconds.value = Math.floor((distance % (1000 * 60)) / 1000);
      } else {
        // Wedding day has arrived!
        days.value = 0;
        hours.value = 0;
        minutes.value = 0;
        seconds.value = 0;
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    // Animate on scroll
    animateOnScroll(".countdown-heading", { delay: 0.2, direction: "up" });
    animateOnScroll(".countdown-grid", { delay: 0.4, direction: "up" });

    // Cleanup
    return () => clearInterval(interval);
  });

  return (
    <section
      id="countdown"
      class="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      style={{ backgroundColor: "var(--wedding-cream)" }}
    >
      <div class="max-w-4xl mx-auto text-center">
        <h2
          class="countdown-heading font-serif text-4xl md:text-6xl mb-4 font-light"
          style={{
            color: "var(--wedding-brown)",
            opacity: 0
          }}
        >
          Simpan Tanggalnya
        </h2>

        <p
          class="countdown-heading text-lg md:text-xl mb-12"
          style={{
            color: "var(--wedding-text-muted)",
            opacity: 0
          }}
        >
          Kami akan menikah dalam
        </p>

        <div
          class="countdown-grid grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          style={{ opacity: 0 }}
        >
          {/* Days */}
          <div class="text-center">
            <div
              class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: "var(--wedding-beige)" }}
            >
              <div
                class="text-3xl md:text-5xl font-bold mb-2"
                style={{ color: "var(--wedding-accent)" }}
              >
                {days.value}
              </div>
              <div
                class="text-sm md:text-base font-medium uppercase tracking-wider"
                style={{ color: "var(--wedding-brown)" }}
              >
                Hari
              </div>
            </div>
          </div>

          {/* Hours */}
          <div class="text-center">
            <div
              class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: "var(--wedding-beige)" }}
            >
              <div
                class="text-3xl md:text-5xl font-bold mb-2"
                style={{ color: "var(--wedding-accent)" }}
              >
                {hours.value}
              </div>
              <div
                class="text-sm md:text-base font-medium uppercase tracking-wider"
                style={{ color: "var(--wedding-brown)" }}
              >
                Jam
              </div>
            </div>
          </div>

          {/* Minutes */}
          <div class="text-center">
            <div
              class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: "var(--wedding-beige)" }}
            >
              <div
                class="text-3xl md:text-5xl font-bold mb-2"
                style={{ color: "var(--wedding-accent)" }}
              >
                {minutes.value}
              </div>
              <div
                class="text-sm md:text-base font-medium uppercase tracking-wider"
                style={{ color: "var(--wedding-brown)" }}
              >
                Menit
              </div>
            </div>
          </div>

          {/* Seconds */}
          <div class="text-center">
            <div
              class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: "var(--wedding-beige)" }}
            >
              <div
                class="text-3xl md:text-5xl font-bold mb-2"
                style={{ color: "var(--wedding-accent)" }}
              >
                {seconds.value}
              </div>
              <div
                class="text-sm md:text-base font-medium uppercase tracking-wider"
                style={{ color: "var(--wedding-brown)" }}
              >
                Detik
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12">
          <div
            class="text-2xl md:text-3xl font-serif mb-2"
            style={{ color: "var(--wedding-brown)" }}
          >
            November 29, 2025
          </div>
          <div
            class="text-lg md:text-xl"
            style={{ color: "var(--wedding-text-muted)" }}
          >
            Jakarta, Indonesia
          </div>
        </div>
      </div>
    </section>
  );
});