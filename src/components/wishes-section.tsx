import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { animateOnScroll, animateCards } from "../utils/animations";

interface WeddingWish {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export const WishesSection = component$(() => {
  const showWishForm = useSignal(false);
  const wishName = useSignal("");
  const wishMessage = useSignal("");
  const wishes = useSignal<WeddingWish[]>([
    {
      id: "1",
      name: "Sarah & Ahmad",
      message: "Selamat untuk hari istimewa kalian! Semoga kisah cinta kalian dipenuhi dengan kebahagiaan tanpa batas, tawa, dan kenangan indah. Barakallahu laka wa baraka alaika!",
      timestamp: "2 jam yang lalu"
    },
    {
      id: "2",
      name: "Keluarga Budi",
      message: "Semoga pernikahan kalian diberkahi Allah SWT, dipenuhi kebahagiaan, dan menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin!",
      timestamp: "5 jam yang lalu"
    },
    {
      id: "3",
      name: "Maya & Keluarga",
      message: "Semoga kalian berdua hidup penuh cinta dan kebahagiaan! Tidak sabar untuk merayakan hari istimewa kalian. Sayang kalian berdua! 💕",
      timestamp: "1 hari yang lalu"
    },
    {
      id: "4",
      name: "Paman Hasan",
      message: "Melihat kalian berdua bersama selalu membuat hati senang. Semoga Allah senantiasa menjaga dan memberkahi rumah tangga kalian. Selamat!",
      timestamp: "2 hari yang lalu"
    },
    {
      id: "5",
      name: "Teman-teman Kuliah",
      message: "Dari teman-teman kuliah kalian - kami telah menyaksikan kisah cinta kalian berkembang dan sangat indah! Semoga kalian bahagia bertahun-tahun ke depan!",
      timestamp: "3 hari yang lalu"
    }
  ]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Animate section elements
    animateOnScroll(".wishes-heading", { delay: 0.2, direction: "up" });
    animateOnScroll(".wishes-intro", { delay: 0.4, direction: "up" });
    animateOnScroll(".wishes-button", { delay: 0.6, direction: "up" });
    animateCards(".wish-card");
  });

  const handleWishSubmit = $(() => {
    if (!wishName.value.trim() || !wishMessage.value.trim()) {
      alert("Please fill in both your name and message.");
      return;
    }

    const newWish: WeddingWish = {
      id: Date.now().toString(),
      name: wishName.value,
      message: wishMessage.value,
      timestamp: "Just now"
    };

    // Add to beginning of wishes array
    wishes.value = [newWish, ...wishes.value];

    // Reset form
    wishName.value = "";
    wishMessage.value = "";
    showWishForm.value = false;

    alert("Thank you for your beautiful wishes! 💕");
  });

  return (
    <section
      id="wishes"
      class="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      style={{ backgroundColor: "var(--wedding-lavender)" }}
    >
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2
            class="wishes-heading font-serif text-4xl md:text-6xl mb-6 font-light"
            style={{
              color: "var(--wedding-brown)",
              opacity: 0
            }}
          >
            Ucapan Pernikahan
          </h2>

          <p
            class="wishes-intro text-lg md:text-xl mb-8 max-w-3xl mx-auto"
            style={{
              color: "var(--wedding-text-muted)",
              opacity: 0
            }}
          >
            Bagikan cinta, doa, dan ucapan baik Anda untuk perjalanan baru kami bersama.
            Kata-kata Anda sangat berarti bagi kami! 💕
          </p>

          <button
            class="wishes-button wedding-button text-lg px-8 py-3"
            style={{ opacity: 0 }}
            onClick$={() => showWishForm.value = true}
          >
            ✨ Tulis Ucapan
          </button>
        </div>

        {/* Wedding Wishes Feed */}
        <div class="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {wishes.value.map((wish, index) => (
            <div
              key={wish.id}
              class="wish-card wedding-card p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "var(--wedding-cream)",
                opacity: 0,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div class="flex items-start space-x-4">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: "var(--wedding-accent)" }}
                >
                  {wish.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <h4
                      class="font-semibold text-lg"
                      style={{ color: "var(--wedding-brown)" }}
                    >
                      {wish.name}
                    </h4>
                    <span class="text-sm text-gray-500">{wish.timestamp}</span>
                  </div>
                  <p
                    class="text-base leading-relaxed"
                    style={{ color: "var(--wedding-text-muted)" }}
                  >
                    {wish.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wish Form Modal */}
        {showWishForm.value && (
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              class="wedding-card max-w-md w-full p-8 rounded-lg"
              style={{ backgroundColor: "var(--wedding-cream)" }}
            >
              <h3
                class="text-2xl font-serif mb-6 text-center"
                style={{ color: "var(--wedding-brown)" }}
              >
                ✨ Bagikan Ucapan Anda
              </h3>

              <div class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium mb-2"
                    style={{ color: "var(--wedding-brown)" }}
                  >
                    Nama Anda
                  </label>
                  <input
                    type="text"
                    value={wishName.value}
                    onInput$={(e) => wishName.value = (e.target as HTMLInputElement).value}
                    class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                    placeholder="Masukkan nama Anda"
                    style={{ borderColor: "var(--wedding-sage)" }}
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium mb-2"
                    style={{ color: "var(--wedding-brown)" }}
                  >
                    Ucapan Pernikahan
                  </label>
                  <textarea
                    value={wishMessage.value}
                    onInput$={(e) => wishMessage.value = (e.target as HTMLTextAreaElement).value}
                    class="w-full p-3 border rounded-md h-32 resize-none focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                    placeholder="Bagikan cinta, doa, dan ucapan baik Anda untuk Alfina & Mugni..."
                    style={{ borderColor: "var(--wedding-sage)" }}
                  />
                </div>

                <div class="text-xs text-gray-500 mb-4">
                  💡 Pesan Anda akan dibagikan secara publik di halaman ini untuk dilihat semua tamu.
                </div>

                <div class="flex space-x-3">
                  <button
                    class="flex-1 py-2 px-4 rounded border transition-colors"
                    style={{
                      borderColor: "var(--wedding-accent)",
                      color: "var(--wedding-accent)"
                    }}
                    onClick$={() => showWishForm.value = false}
                  >
                    Batal
                  </button>
                  <button
                    class="flex-1 py-2 px-4 rounded transition-colors"
                    style={{
                      backgroundColor: "var(--wedding-accent)",
                      color: "white"
                    }}
                    onClick$={handleWishSubmit}
                  >
                    Bagikan Ucapan ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div class="text-center mt-12">
          <p
            class="text-base md:text-lg italic"
            style={{ color: "var(--wedding-text-muted)" }}
          >
            "Hal terbaik untuk dipegang dalam hidup adalah saling berpegangan." - Audrey Hepburn
          </p>
        </div>
      </div>
    </section>
  );
});