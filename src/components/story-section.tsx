import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { animateOnScroll, animateCards } from "../utils/animations";

interface StoryMilestone {
  year: string;
  title: string;
  description: string;
  icon: string;
  side: "left" | "right";
}

export const StorySection = component$(() => {
  const storyMilestones: StoryMilestone[] = [
    {
      year: "2019",
      title: "Pertemuan Pertama",
      description: "Kami bertemu selama tahun terakhir di Universitas Indonesia, sama-sama belajar hingga larut malam di perpustakaan. Yang dimulai sebagai pertanyaan sederhana tentang tugas kalkulus menjadi percakapan pertama kami.",
      icon: "📚",
      side: "left"
    },
    {
      year: "2020",
      title: "Semakin Dekat",
      description: "Kencan minum kopi berubah menjadi jalan-jalan panjang di sekitar kampus. Kami menemukan kecintaan yang sama terhadap sastra Indonesia, musik tradisional, dan impian kami untuk membuat perbedaan di dunia.",
      icon: "☕",
      side: "right"
    },
    {
      year: "2021",
      title: "Kencan Pertama",
      description: "Kencan resmi pertama kami di Taman Suropati, di mana Mugni dengan gugup meminta Alfina menjadi pacarnya di bawah pohon beringin tua. Dia berkata ya, dan kami tak terpisahkan sejak saat itu.",
      icon: "🌳",
      side: "left"
    },
    {
      year: "2023",
      title: "Tinggal Bersama",
      description: "Kami menemukan apartemen kecil kami di Kemang dan mulai membangun hidup bersama. Belajar memasak masakan tradisional Indonesia dan menciptakan tradisi keluarga kami sendiri.",
      icon: "🏠",
      side: "right"
    },
    {
      year: "2024",
      title: "Lamaran",
      description: "Selama perjalanan akhir pekan ke Yogyakarta, di Taman Sari yang indah, Mugni berlutut. Dengan air mata kebahagiaan, Alfina berkata ya untuk selamanya.",
      icon: "💍",
      side: "left"
    },
    {
      year: "2025",
      title: "Hari Pernikahan Kami",
      description: "Dan sekarang, kami siap memulai babak baru sebagai suami istri, dikelilingi oleh keluarga dan teman-teman tercinta. Alhamdulillah untuk perjalanan indah ini!",
      icon: "👰‍♀️🤵‍♂️",
      side: "right"
    }
  ];

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Animate heading
    animateOnScroll(".story-heading", { delay: 0.2, direction: "up" });
    animateOnScroll(".story-intro", { delay: 0.4, direction: "up" });

    // Animate timeline items
    animateCards(".timeline-item");
  });

  return (
    <section
      id="story-section"
      class="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      style={{ backgroundColor: "var(--wedding-cream)" }}
    >
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2
            class="story-heading font-serif text-4xl md:text-6xl mb-6 font-light"
            style={{
              color: "var(--wedding-brown)",
              opacity: 0
            }}
          >
            Kisah Cinta Kami
          </h2>

          <p
            class="story-intro text-lg md:text-xl max-w-3xl mx-auto"
            style={{
              color: "var(--wedding-text-muted)",
              opacity: 0
            }}
          >
            Dari teman kuliah hingga pasangan hidup - perjalanan cinta, pertumbuhan, dan momen-momen indah yang tak terhitung
          </p>
        </div>

        {/* Timeline */}
        <div class="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div
            class="absolute left-1/2 transform -translate-x-1/2 w-1 h-full hidden md:block"
            style={{ backgroundColor: "var(--wedding-accent)" }}
          ></div>

          {storyMilestones.map((milestone) => (
            <div
              key={milestone.year}
              class={`timeline-item relative flex items-center mb-12 md:mb-16 ${
                milestone.side === "left" ? "md:flex-row-reverse" : ""
              }`}
              style={{ opacity: 0 }}
            >
              {/* Desktop Layout */}
              <div class="hidden md:flex md:w-1/2 md:px-8">
                <div
                  class={`wedding-card p-6 rounded-lg shadow-md w-full transition-all duration-300 hover:shadow-lg ${
                    milestone.side === "left" ? "md:text-right" : ""
                  }`}
                  style={{ backgroundColor: "var(--wedding-beige)" }}
                >
                  <div class="text-3xl mb-3">{milestone.icon}</div>
                  <div
                    class="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--wedding-accent)" }}
                  >
                    {milestone.year}
                  </div>
                  <h3
                    class="text-xl font-semibold mb-3"
                    style={{ color: "var(--wedding-brown)" }}
                  >
                    {milestone.title}
                  </h3>
                  <p
                    class="text-base leading-relaxed"
                    style={{ color: "var(--wedding-text-muted)" }}
                  >
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Timeline Node */}
              <div class="hidden md:flex md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:z-10">
                <div
                  class="w-4 h-4 rounded-full border-4 border-white"
                  style={{ backgroundColor: "var(--wedding-accent)" }}
                ></div>
              </div>

              {/* Mobile Layout */}
              <div class="md:hidden w-full">
                <div
                  class="wedding-card p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: "var(--wedding-beige)" }}
                >
                  <div class="flex items-center mb-4">
                    <div class="text-3xl mr-4">{milestone.icon}</div>
                    <div>
                      <div
                        class="text-xl font-serif font-semibold"
                        style={{ color: "var(--wedding-accent)" }}
                      >
                        {milestone.year}
                      </div>
                      <h3
                        class="text-lg font-semibold"
                        style={{ color: "var(--wedding-brown)" }}
                      >
                        {milestone.title}
                      </h3>
                    </div>
                  </div>
                  <p
                    class="text-base leading-relaxed"
                    style={{ color: "var(--wedding-text-muted)" }}
                  >
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Spacer for desktop */}
              <div class="hidden md:block md:w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div class="text-center mt-16">
          <div
            class="max-w-2xl mx-auto p-8 rounded-lg"
            style={{ backgroundColor: "var(--wedding-sage)" }}
          >
            <h3
              class="text-2xl md:text-3xl font-serif mb-4"
              style={{ color: "var(--wedding-brown)" }}
            >
              Bergabung dalam Babak Baru Kami
            </h3>
            <p
              class="text-lg mb-6"
              style={{ color: "var(--wedding-text-muted)" }}
            >
              Kami tidak sabar untuk merayakan momen istimewa ini bersama Anda dan memulai perjalanan kami sebagai suami istri.
            </p>
            <div
              class="text-base italic"
              style={{ color: "var(--wedding-accent)" }}
            >
              "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu"
              <br />
              <span class="text-sm">- QS. Ar-Rum: 21</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
