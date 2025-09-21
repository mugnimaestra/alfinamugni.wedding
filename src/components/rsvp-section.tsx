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
  const guestPhone = useSignal("");
  const attendance = useSignal("");
  const plusOne = useSignal("");
  const plusOneName = useSignal("");
  const mealPreference = useSignal("");
  const plusOneMeal = useSignal("");
  const specialRequests = useSignal("");
  const dietaryRestrictions = useSignal("");
  const accommodation = useSignal("");

  const isSubmitting = useSignal(false);
  const submitMessage = useSignal("");
  const submitError = useSignal("");

  // Enhanced validation helper
  const validateIndonesianPhone = $((phone: string): boolean => {
    if (!phone) return true; // Optional field

    // Remove all non-digit characters except + at the beginning
    const cleanPhone = phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

    // Indonesian phone patterns
    const patterns = [
      /^\+628\d{8,11}$/, // Mobile with country code
      /^08\d{8,11}$/, // Mobile without country code
      /^\+6221\d{7,8}$/, // Jakarta landline with country code
      /^021\d{7,8}$/, // Jakarta landline
    ];

    return patterns.some(pattern => pattern.test(cleanPhone));
  });

  const handleRsvpSubmit = $(async () => {
    // Reset messages
    submitError.value = "";
    submitMessage.value = "";

    // Basic validation
    if (!guestName.value.trim() || !guestEmail.value.trim() || !attendance.value) {
      submitError.value = "Mohon isi semua field yang wajib diisi (Nama, Email, Kehadiran).";
      return;
    }

    // Validate name length
    if (guestName.value.trim().length < 2) {
      submitError.value = "Nama harus minimal 2 karakter.";
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.value.trim())) {
      submitError.value = "Format email tidak valid.";
      return;
    }

    // Validate Indonesian phone number if provided
    if (guestPhone.value && !validateIndonesianPhone(guestPhone.value)) {
      submitError.value = "Format nomor telepon Indonesia tidak valid. Contoh: 08123456789 atau +628123456789";
      return;
    }

    // Validate plus one requirements
    if (plusOne.value === "yes" && (!plusOneName.value || plusOneName.value.trim().length < 2)) {
      submitError.value = "Nama pendamping harus diisi jika membawa tamu tambahan.";
      return;
    }

    // Validate meal preferences for attending guests
    if (attendance.value !== "unable" && !mealPreference.value) {
      submitError.value = "Pilihan makanan wajib diisi untuk tamu yang hadir.";
      return;
    }

    // Validate plus one meal if bringing plus one
    if (plusOne.value === "yes" && attendance.value !== "unable" && !plusOneMeal.value) {
      submitError.value = "Pilihan makanan pendamping harus diisi.";
      return;
    }

    isSubmitting.value = true;

    try {
      const rsvpData = {
        guest_name: guestName.value.trim(),
        email: guestEmail.value.trim().toLowerCase(),
        phone: guestPhone.value.trim() || undefined,
        attending: attendance.value,
        plus_one_count: plusOne.value === "yes" ? 1 : 0,
        plus_one_name: plusOneName.value?.trim() || undefined,
        meal_preference: mealPreference.value || undefined,
        plus_one_meal: plusOneMeal.value || undefined,
        special_requests: specialRequests.value?.trim() || undefined,
        dietary_restrictions: dietaryRestrictions.value?.trim() || undefined,
        accommodation_needed: accommodation.value === "yes"
      };

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rsvpData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim RSVP");
      }

      // Success
      submitMessage.value = result.message || "RSVP berhasil dikirim! Email konfirmasi akan segera dikirim.";

      // Reset form after a delay
      setTimeout(() => {
        guestName.value = "";
        guestEmail.value = "";
        guestPhone.value = "";
        attendance.value = "";
        plusOne.value = "";
        plusOneName.value = "";
        mealPreference.value = "";
        plusOneMeal.value = "";
        specialRequests.value = "";
        dietaryRestrictions.value = "";
        accommodation.value = "";
        showRsvpForm.value = false;
        submitMessage.value = "";
      }, 3000);

    } catch (error) {
      console.error("RSVP submission error:", error);
      submitError.value = error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
    } finally {
      isSubmitting.value = false;
    }
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
                  <div>
                    <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                      Nomor Telepon (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={guestPhone.value}
                      onInput$={(e) => guestPhone.value = (e.target as HTMLInputElement).value}
                      class="w-full p-3 border rounded-md focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                      placeholder="08123456789 atau +628123456789"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      Format Indonesia: 08xx atau +628xx
                    </p>
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                      Pantangan/Alergi Makanan
                    </label>
                    <textarea
                      value={dietaryRestrictions.value}
                      onInput$={(e) => dietaryRestrictions.value = (e.target as HTMLTextAreaElement).value}
                      class="w-full p-3 border rounded-md h-20 resize-none focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                      placeholder="Alergi makanan laut, vegetarian, dll..."
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style={{ color: "var(--wedding-brown)" }}>
                      Permintaan Khusus Lainnya
                    </label>
                    <textarea
                      value={specialRequests.value}
                      onInput$={(e) => specialRequests.value = (e.target as HTMLTextAreaElement).value}
                      class="w-full p-3 border rounded-md h-20 resize-none focus:ring-2 focus:ring-wedding-accent focus:border-transparent"
                      placeholder="Kebutuhan aksesibilitas, kursi roda, dll..."
                    />
                  </div>
                </div>

                {/* Success/Error Messages */}
                {submitMessage.value && (
                  <div class="p-4 bg-green-100 border border-green-300 rounded-md text-green-800 text-sm">
                    {submitMessage.value}
                  </div>
                )}

                {submitError.value && (
                  <div class="p-4 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
                    {submitError.value}
                  </div>
                )}

                {/* Buttons */}
                <div class="flex space-x-4 pt-4">
                  <button
                    type="button"
                    class="flex-1 py-3 px-6 rounded border transition-colors disabled:opacity-50"
                    style={{
                      borderColor: "var(--wedding-accent)",
                      color: "var(--wedding-accent)"
                    }}
                    onClick$={() => {
                      showRsvpForm.value = false;
                      submitError.value = "";
                      submitMessage.value = "";
                    }}
                    disabled={isSubmitting.value}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    class="flex-1 py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--wedding-accent)",
                      color: "white"
                    }}
                    onClick$={handleRsvpSubmit}
                    disabled={isSubmitting.value}
                  >
                    {isSubmitting.value ? "Mengirim..." : "Kirim RSVP"}
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
