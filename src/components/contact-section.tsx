import { component$ } from "@builder.io/qwik";

export const ContactSection = component$(() => {
  return (
    <section
      id="contact"
      class="min-h-screen bg-wedding-beige flex flex-col items-center justify-center px-4 py-20"
    >
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="font-serif text-4xl md:text-6xl text-wedding-brown mb-16 font-light">
          Hubungi Kami
        </h2>

        <p class="text-wedding-text-secondary text-lg md:text-xl leading-relaxed mb-16 max-w-3xl mx-auto">
          Untuk pertanyaan atau permintaan khusus, jangan ragu untuk
          menghubungi kami.
        </p>

        <div class="grid md:grid-cols-2 gap-x-16 gap-y-12 max-w-4xl mx-auto">
          {/* Bride Contact */}
          <div class="wedding-card bg-white">
            <div class="text-center">
              <h3 class="font-serif text-3xl md:text-4xl text-wedding-brown mb-6 font-medium">
                Alfina
              </h3>

              <div class="space-y-3 text-wedding-text-muted">
                <p class="text-center">
                  Detail kontak akan dibagikan menjelang tanggal pernikahan
                </p>
              </div>
            </div>
          </div>

          {/* Groom Contact */}
          <div class="wedding-card bg-white">
            <div class="text-center">
              <h3 class="font-serif text-3xl md:text-4xl text-wedding-brown mb-6 font-medium">
                Mugni
              </h3>

              <div class="space-y-3 text-wedding-text-muted">
                <p class="text-center">
                  Detail kontak akan dibagikan menjelang tanggal pernikahan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
