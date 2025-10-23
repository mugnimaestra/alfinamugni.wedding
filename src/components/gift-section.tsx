import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { animateOnScroll, animateCards } from "../utils/animations";

export const GiftSection = component$(() => {
  const showGiftForm = useSignal(false);
  const giftMessage = useSignal("");
  const senderName = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Animate section elements
    animateOnScroll(".gift-heading", { delay: 0.2, direction: "up" });
    animateOnScroll(".gift-intro", { delay: 0.4, direction: "up" });
    animateCards(".gift-card");
  });

  const copyToClipboard = $((text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} account number copied to clipboard!`);
    });
  });

  const handleGiftSubmit = $(() => {
    if (giftMessage.value.trim() && senderName.value.trim()) {
      // In a real implementation, this would send to a backend
      alert(`Thank you ${senderName.value} for your thoughtful message!`);
      giftMessage.value = "";
      senderName.value = "";
      showGiftForm.value = false;
    }
  });

  return (
    <section
      id="gift"
      class="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      style={{ backgroundColor: "var(--wedding-beige)" }}
    >
      <div class="max-w-6xl mx-auto text-center">
        <h2
          class="gift-heading font-serif text-4xl md:text-6xl mb-6 font-light"
          style={{
            color: "var(--wedding-brown)",
            opacity: 0
          }}
        >
          Hadiah Pernikahan
        </h2>

        <div
          class="gift-intro max-w-3xl mx-auto mb-12"
          style={{ opacity: 0 }}
        >
          <p
            class="text-lg md:text-xl mb-4"
            style={{ color: "var(--wedding-text-muted)" }}
          >
            Kehadiran Anda di pernikahan kami adalah hadiah terbesar. Namun, jika Anda ingin memberikan hadiah,
            kami akan sangat berterima kasih atas kontribusi apa pun untuk membantu kami memulai perjalanan baru bersama.
          </p>
          <p
            class="text-base md:text-lg italic"
            style={{ color: "var(--wedding-text-muted)" }}
          >
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri"
            <br />
            <span class="text-sm">- QS. Ar-Rum: 21</span>
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {/* Bank Jago Transfer */}
          <div
            class="gift-card wedding-card p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ backgroundColor: "var(--wedding-cream)" }}
          >
            <div class="mb-4">
              <h3
                class="text-xl font-semibold mb-2"
                style={{ color: "var(--wedding-brown)" }}
              >
                Transfer Bank
              </h3>
              <div class="text-sm text-gray-600 mb-3">Bank Jago</div>
            </div>
            <div
              class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg mb-4"
            >
              <div class="text-xs uppercase tracking-wide mb-1">Nomor Rekening</div>
              <div class="text-lg font-mono">105803971206</div>
              <div class="text-sm mt-2">ALFINA NURMAYATI</div>
            </div>
            <button
              class="wedding-button w-full py-2 px-4 rounded transition-colors"
              style={{
                backgroundColor: "var(--wedding-accent)",
                color: "white"
              }}
              onClick$={() => copyToClipboard("105803971206", "Bank Jago")}
            >
              Salin Nomor Rekening
            </button>
          </div>

          {/* Gift Message Card */}
          <div
            class="gift-card wedding-card p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ backgroundColor: "var(--wedding-sage)" }}
          >
            <div class="mb-4">
              <h3
                class="text-xl font-semibold mb-2"
                style={{ color: "var(--wedding-brown)" }}
              >
                Kirim Pesan
              </h3>
              <div class="text-sm text-gray-600 mb-3">Sertakan catatan pribadi</div>
            </div>
            <div class="flex items-center justify-center h-20 mb-4">
              <svg
                class="w-12 h-12"
                style={{ color: "var(--wedding-accent)" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </div>
            <button
              class="wedding-button w-full py-2 px-4 rounded transition-colors"
              style={{
                backgroundColor: "var(--wedding-accent)",
                color: "white"
              }}
              onClick$={() => showGiftForm.value = true}
            >
              Tulis Pesan
            </button>
          </div>
        </div>

        {/* Gift Message Modal */}
        {showGiftForm.value && (
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              class="wedding-card max-w-md w-full p-6 rounded-lg"
              style={{ backgroundColor: "var(--wedding-cream)" }}
            >
              <h3
                class="text-2xl font-serif mb-4"
                style={{ color: "var(--wedding-brown)" }}
              >
                Pesan Hadiah Pernikahan
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
                    value={senderName.value}
                    onInput$={(e) => senderName.value = (e.target as HTMLInputElement).value}
                    class="w-full p-3 border rounded-md"
                    placeholder="Masukkan nama Anda"
                    style={{ borderColor: "var(--wedding-sage)" }}
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium mb-2"
                    style={{ color: "var(--wedding-brown)" }}
                  >
                    Pesan
                  </label>
                  <textarea
                    value={giftMessage.value}
                    onInput$={(e) => giftMessage.value = (e.target as HTMLTextAreaElement).value}
                    class="w-full p-3 border rounded-md h-24 resize-none"
                    placeholder="Tulis ucapan pernikahan Anda..."
                    style={{ borderColor: "var(--wedding-sage)" }}
                  />
                </div>
                <div class="flex space-x-3">
                  <button
                    class="flex-1 py-2 px-4 rounded border transition-colors"
                    style={{
                      borderColor: "var(--wedding-accent)",
                      color: "var(--wedding-accent)"
                    }}
                    onClick$={() => showGiftForm.value = false}
                  >
                    Batal
                  </button>
                  <button
                    class="flex-1 py-2 px-4 rounded transition-colors"
                    style={{
                      backgroundColor: "var(--wedding-accent)",
                      color: "white"
                    }}
                    onClick$={handleGiftSubmit}
                  >
                    Kirim Pesan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});