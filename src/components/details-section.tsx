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
          Detail Pernikahan
        </h2>

        <div class="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
          {/* Akad Nikah */}
          <div
            class="details-card wedding-card bg-wedding-beige border-0 transition-all duration-300 hover:shadow-lg"
            style={{ opacity: 0 }}
          >
            <div class="text-center p-8">
              <div class="mb-4">
                <svg
                  class="w-12 h-12 mx-auto mb-4"
                  style={{ color: "var(--wedding-accent)" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2L3 7v11a2 2 0 002 2h4v-6h2v6h4a2 2 0 002-2V7l-7-5z"/>
                </svg>
              </div>

              <h3 class="font-serif text-3xl md:text-4xl text-wedding-brown mb-4 font-medium">
                Akad Nikah
              </h3>

              <div class="text-wedding-accent text-lg mb-4 italic">
                Upacara Akad Nikah
              </div>

              <div class="mb-6">
                <p class="text-wedding-text-secondary text-xl md:text-2xl font-medium mb-2">
                  9:00 AM - 11:30 AM
                </p>
                <p class="text-wedding-text-muted text-lg">
                  Sabtu, 29 November 2025
                </p>
              </div>

              <div class="text-wedding-text-muted text-base md:text-lg space-y-2 mb-6">
                <p class="font-medium">Tamarin Hotel Jakarta</p>
                <p>Jl. K.H. Wahid Hasyim No.77, RT.1/RW.4</p>
                <p>Gondangdia, Kec. Menteng, Jakarta 10340</p>
              </div>
            </div>
          </div>

          {/* Resepsi (Reception) */}
          <div
            class="details-card wedding-card bg-wedding-sage border-0 transition-all duration-300 hover:shadow-lg"
            style={{ opacity: 0 }}
          >
            <div class="text-center p-8">
              <div class="mb-4">
                <svg
                  class="w-12 h-12 mx-auto mb-4"
                  style={{ color: "var(--wedding-accent)" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
                </svg>
              </div>

              <h3 class="font-serif text-3xl md:text-4xl text-wedding-brown mb-4 font-medium">
                Resepsi
              </h3>

              <div class="text-wedding-accent text-lg mb-4 italic">
                Resepsi & Perayaan Pernikahan
              </div>

              <div class="mb-6">
                <p class="text-wedding-text-secondary text-xl md:text-2xl font-medium mb-2">
                  12:00 PM - 3:00 PM
                </p>
                <p class="text-wedding-text-muted text-lg">
                  Sabtu, 29 November 2025
                </p>
              </div>

              <div class="text-wedding-text-muted text-base md:text-lg space-y-2 mb-6">
                <p class="font-medium">Tamarin Hotel Jakarta</p>
                <p>Jl. K.H. Wahid Hasyim No.77, RT.1/RW.4</p>
                <p>Gondangdia, Kec. Menteng, Jakarta 10340</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div class="mt-16 max-w-4xl mx-auto">
          <div
            class="details-card wedding-card bg-wedding-lavender p-8 rounded-lg"
            style={{ opacity: 0 }}
          >
            <h3 class="font-serif text-2xl md:text-3xl text-wedding-brown mb-6 text-center">
              Informasi Penting
            </h3>

            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h4 class="font-semibold text-wedding-brown mb-3">Parkir</h4>
                <p class="text-wedding-text-muted text-sm">
                  Area parkir tersedia di gedung Tamarin Hotel Jakarta untuk kenyamanan tamu.
                </p>
              </div>

              <div>
                <h4 class="font-semibold text-wedding-brown mb-3">Transportasi Umum</h4>
                <p class="text-wedding-text-muted text-sm">
                  <strong>MRT:</strong> Stasiun Bundaran HI (10 menit jalan kaki, 654m)
                  <br />
                  <strong>TransJakarta:</strong> Halte Sarinah (433m)
                  <br />
                  <strong>Bus:</strong> Jalur 1, 1H, 9D, AC52, JAK.10A
                  <br />
                  <strong>Kereta:</strong> Stasiun Gondangdia (6 menit jalan kaki)
                </p>
              </div>

              <div>
                <h4 class="font-semibold text-wedding-brown mb-3">Lokasi</h4>
                <p class="text-wedding-text-muted text-sm">
                  Hotel terletak di pusat kota Jakarta dengan akses mudah dari berbagai arah.
                  Area Menteng sangat terhubung dengan jaringan transportasi umum.
                </p>
              </div>

              <div>
                <h4 class="font-semibold text-wedding-brown mb-3">Akomodasi</h4>
                <p class="text-wedding-text-muted text-sm">
                  Untuk tamu luar kota, Tamarin Hotel Jakarta menyediakan kamar.
                  Hubungi kami untuk informasi lebih lanjut.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
