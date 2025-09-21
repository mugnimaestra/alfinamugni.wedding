import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import {
  animateOnScroll,
  animateButton,
  animateCards,
} from "../utils/animations";

export const RsvpSection = component$(() => {
  const showRsvpForm = useSignal(false);
  const guestName = useSignal("");
  const guestEmail = useSignal("");
  const attendance = useSignal("");
  const plusOne = useSignal("");
  const plusOneName = useSignal("");
  const mealPreference = useSignal("");
  const plusOneMeal = useSignal("");
  const specialRequests = useSignal("");
  const accommodation = useSignal("");

  const handleRsvpSubmit = $(() => {
    if (!guestName.value || !guestEmail.value || !attendance.value) {
      alert("Please fill in all required fields.");
      return;
    }

    // In a real implementation, this would send to a backend
    const rsvpData = {
      name: guestName.value,
      email: guestEmail.value,
      attendance: attendance.value,
      plusOne: plusOne.value,
      plusOneName: plusOneName.value,
      mealPreference: mealPreference.value,
      plusOneMeal: plusOneMeal.value,
      specialRequests: specialRequests.value,
      accommodation: accommodation.value
    };

    console.log("RSVP Data:", rsvpData);
    alert(`Thank you ${guestName.value}! Your RSVP has been received.`);

    // Reset form
    guestName.value = "";
    guestEmail.value = "";
    attendance.value = "";
    plusOne.value = "";
    plusOneName.value = "";
    mealPreference.value = "";
    plusOneMeal.value = "";
    specialRequests.value = "";
    accommodation.value = "";
    showRsvpForm.value = false;
  });
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
          Mohon beri tahu kami jika Anda akan bergabung dengan kami di hari istimewa kami. Kehadiran
          Anda sangat berarti bagi kami!
        </p>

        <p
          class="rsvp-deadline text-wedding-text-primary text-xl md:text-2xl font-medium mb-12"
          style={{ opacity: 0 }}
        >
          Mohon balas sebelum 15 November 2025
        </p>

        <button
          class="rsvp-button wedding-button text-lg md:text-xl px-12 py-5"
          style={{ opacity: 0 }}
          onClick$={() => showRsvpForm.value = true}
        >
          RSVP Sekarang
        </button>

        {/* RSVP Form Modal */}
        {showRsvpForm.value && (
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div
              class="wedding-card max-w-2xl w-full p-8 rounded-lg my-8"
              style={{ backgroundColor: "var(--wedding-cream)" }}
            >
              <h3
                class="text-3xl font-serif mb-6 text-center"
                style={{ color: "var(--wedding-brown)" }}
              >
                RSVP Pernikahan
              </h3>

              <form class="space-y-6">
                {/* Guest Information */}
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={guestName.value}
                      onInput$={(e) => guestName.value = (e.target as HTMLInputElement).value}
                      class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      value={guestEmail.value}
                      onInput$={(e) => guestEmail.value = (e.target as HTMLInputElement).value}
                      class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                      placeholder="Masukkan email Anda"
                      required
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <label class="block text-sm font-medium mb-3" style={{ color: "var(--wedding-brown)" }}>
                    Apakah Anda akan hadir? *
                  </label>
                  <div class="grid grid-cols-3 gap-3">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attendance"
                        value="both"
                        checked={attendance.value === "both"}
                        onChange$={() => attendance.value = "both"}
                        class="text-wedding-accent focus:ring-wedding-accent"
                      />
                      <span class="text-sm">Kedua Acara</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attendance"
                        value="akad"
                        checked={attendance.value === "akad"}
                        onChange$={() => attendance.value = "akad"}
                        class="text-wedding-accent focus:ring-wedding-accent"
                      />
                      <span class="text-sm">Akad Saja</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attendance"
                        value="reception"
                        checked={attendance.value === "reception"}
                        onChange$={() => attendance.value = "reception"}
                        class="text-wedding-accent focus:ring-wedding-accent"
                      />
                      <span class="text-sm">Resepsi Saja</span>
                    </label>
                  </div>
                  <div class="mt-2">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attendance"
                        value="unable"
                        checked={attendance.value === "unable"}
                        onChange$={() => attendance.value = "unable"}
                        class="text-wedding-accent focus:ring-wedding-accent"
                      />
                      <span class="text-sm">Tidak Dapat Hadir</span>
                    </label>
                  </div>
                </div>

                {/* Plus One */}
                {attendance.value && attendance.value !== "unable" && (
                  <div>
                    <label class="block text-sm font-medium mb-3" style={{ color: "var(--wedding-brown)" }}>
                      Apakah Anda akan membawa pendamping?
                    </label>
                    <div class="flex space-x-4">
                      <label class="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="plusone"
                          value="yes"
                          checked={plusOne.value === "yes"}
                          onChange$={() => plusOne.value = "yes"}
                          class="text-wedding-accent focus:ring-wedding-accent"
                        />
                        <span class="text-sm">Ya</span>
                      </label>
                      <label class="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="plusone"
                          value="no"
                          checked={plusOne.value === "no"}
                          onChange$={() => plusOne.value = "no"}
                          class="text-wedding-accent focus:ring-wedding-accent"
                        />
                        <span class="text-sm">Tidak</span>
                      </label>
                    </div>

                    {plusOne.value === "yes" && (
                      <div class="mt-4">
                        <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                          Nama Pendamping
                        </label>
                        <input
                          type="text"
                          value={plusOneName.value}
                          onInput$={(e) => plusOneName.value = (e.target as HTMLInputElement).value}
                          class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                          placeholder="Masukkan nama pendamping"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Meal Preferences */}
                {attendance.value && attendance.value !== "unable" && (attendance.value === "both" || attendance.value === "reception") && (
                  <div>
                    <label class="block text-sm font-medium mb-3" style={{ color: "var(--wedding-brown)" }}>
                      Pilihan Makanan (Resepsi)
                    </label>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                          Makanan Anda
                        </label>
                        <select
                          value={mealPreference.value}
                          onChange$={(e) => mealPreference.value = (e.target as HTMLSelectElement).value}
                          class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                        >
                          <option value="">Pilih preferensi makanan</option>
                          <option value="chicken">Ayam (Ayam Betutu)</option>
                          <option value="beef">Daging Sapi (Rendang)</option>
                          <option value="fish">Ikan (Ikan Bakar)</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                        </select>
                      </div>

                      {plusOne.value === "yes" && (
                        <div>
                          <label class="block text-xs font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                            Makanan Pendamping
                          </label>
                          <select
                            value={plusOneMeal.value}
                            onChange$={(e) => plusOneMeal.value = (e.target as HTMLSelectElement).value}
                            class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                          >
                            <option value="">Pilih preferensi makanan</option>
                            <option value="chicken">Ayam (Ayam Betutu)</option>
                            <option value="beef">Daging Sapi (Rendang)</option>
                            <option value="fish">Ikan (Ikan Bakar)</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Accommodation */}
                {attendance.value && attendance.value !== "unable" && (
                  <div>
                    <label class="block text-sm font-medium mb-3" style={{ color: "var(--wedding-brown)" }}>
                      Apakah Anda memerlukan bantuan akomodasi?
                    </label>
                    <div class="flex space-x-4">
                      <label class="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accommodation"
                          value="yes"
                          checked={accommodation.value === "yes"}
                          onChange$={() => accommodation.value = "yes"}
                          class="text-wedding-accent focus:ring-wedding-accent"
                        />
                        <span class="text-sm">Ya, tolong</span>
                      </label>
                      <label class="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accommodation"
                          value="no"
                          checked={accommodation.value === "no"}
                          onChange$={() => accommodation.value = "no"}
                          class="text-wedding-accent focus:ring-wedding-accent"
                        />
                        <span class="text-sm">Tidak, terima kasih</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                    Permintaan Khusus atau Pantangan Makanan
                  </label>
                  <textarea
                    value={specialRequests.value}
                    onInput$={(e) => specialRequests.value = (e.target as HTMLTextAreaElement).value}
                    class="w-full p-3 border rounded-md h-24 resize-none focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                    placeholder="Alergi, kebutuhan aksesibilitas, atau permintaan khusus..."
                  />
                </div>

                {/* Buttons */}
                <div class="flex space-x-4 pt-4">
                  <button
                    type="button"
                    class="flex-1 py-3 px-6 rounded border transition-colors"
                    style={{
                      borderColor: "var(--wedding-accent)",
                      color: "var(--wedding-accent)"
                    }}
                    onClick$={() => showRsvpForm.value = false}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    class="flex-1 py-3 px-6 rounded transition-colors"
                    style={{
                      backgroundColor: "var(--wedding-accent)",
                      color: "white"
                    }}
                    onClick$={handleRsvpSubmit}
                  >
                    Kirim RSVP
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div class="mt-16 grid md:grid-cols-2 gap-x-16 gap-y-8 max-w-4xl mx-auto">
          <div class="rsvp-info-card text-center" style={{ opacity: 0 }}>
            <h3 class="font-serif text-2xl md:text-3xl text-wedding-brown mb-4 font-medium">
              Kode Berpakaian
            </h3>
            <p class="text-wedding-text-secondary text-lg">Pakaian Formal</p>
            <p class="text-wedding-text-muted text-base mt-2">
              Kami mohon tidak memakai warna putih atau krem
            </p>
          </div>

          <div class="rsvp-info-card text-center" style={{ opacity: 0 }}>
            <h3 class="font-serif text-2xl md:text-3xl text-wedding-brown mb-4 font-medium">
              Daftar Hadiah
            </h3>
            <p class="text-wedding-text-secondary text-lg">
              Kehadiran Anda adalah hadiah kami
            </p>
            <p class="text-wedding-text-muted text-base mt-2">
              Namun jika Anda ingin memberikan hadiah, kami terdaftar di...
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
