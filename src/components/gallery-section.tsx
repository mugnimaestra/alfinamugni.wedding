import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
  animateOnScroll,
  animateCards,
  animateGalleryImages,
} from "../utils/animations";

const galleryPins = [
  {
    id: "pin-bali-sunset",
    title: "Sunset Promises",
    description:
      "We closed the evening barefoot on the sand, planning the future while the sky blushed for us.",
    location: "Canggu, Bali",
    date: "July 2024",
    category: "Proposal",
    image: {
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      alt: "Couple holding each other on a beach at sunset",
      width: 900,
      height: 1200,
    },
    tags: ["Sunset", "Travel", "Promise"],
    badgeClass: "bg-white/85 text-wedding-text-secondary",
    avatarGradient: "from-wedding-sage/80 via-white to-wedding-cream",
  },
  {
    id: "pin-forest-run",
    title: "Morning Trail Laughs",
    description:
      "Our engagement shoot turned into a playful sprint through the pine forest and a reminder to keep things light.",
    location: "Bandung Highlands",
    date: "October 2024",
    category: "Engagement",
    image: {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      alt: "Couple running down a hillside trail while smiling",
      width: 900,
      height: 1200,
    },
    tags: ["Outdoor", "Laugh", "Adventure"],
    badgeClass: "bg-wedding-cream/90 text-wedding-text-secondary",
    avatarGradient: "from-wedding-lavender/70 via-white to-wedding-cream",
  },
  {
    id: "pin-sea-breeze",
    title: "Salty Hair & Sweet Secrets",
    description:
      "That quiet stretch of the shoreline is where we wrote our vows for the very first time.",
    location: "Belitung Island",
    date: "August 2024",
    category: "Vows",
    image: {
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      alt: "Couple embracing on the beach with ocean waves behind them",
      width: 900,
      height: 1350,
    },
    tags: ["Ocean", "Notes", "Quiet"],
    badgeClass: "bg-white/80 text-wedding-text-secondary",
    avatarGradient: "from-wedding-sage/80 via-wedding-cream to-white",
  },
  {
    id: "pin-waterfall",
    title: "Waterfall Retreat",
    description:
      "We promised to chase every waterfall together and soaked in the mist like it was confetti.",
    location: "Ubud, Bali",
    date: "April 2024",
    category: "Weekend Escape",
    image: {
      src: "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?auto=format&fit=crop&w=900&q=80",
      alt: "Couple hugging in front of a waterfall",
      width: 900,
      height: 1350,
    },
    tags: ["Waterfall", "Retreat", "Adventure"],
    badgeClass: "bg-wedding-beige/90 text-wedding-text-primary",
    avatarGradient: "from-wedding-beige/80 via-white to-wedding-cream",
  },
  {
    id: "pin-greenhouse",
    title: "Greenhouse Quiet",
    description:
      "A rainy afternoon spent among blooms inspired our reception palette and our new plant obsession.",
    location: "Bogor Botanical Garden",
    date: "November 2024",
    category: "Inspiration",
    image: {
      src: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&w=900&q=80",
      alt: "Couple standing together in a lush greenhouse",
      width: 900,
      height: 1200,
    },
    tags: ["Plants", "Color Story", "Rainy Day"],
    badgeClass: "bg-white/85 text-wedding-text-secondary",
    avatarGradient: "from-wedding-lavender/70 via-white to-wedding-cream",
  },
  {
    id: "pin-picnic",
    title: "Fieldside Picnic Playlist",
    description:
      "We packed the car with vinyls, sweets, and the playlist that will welcome guests to dinner.",
    location: "Puncak Meadow",
    date: "June 2024",
    category: "Planning",
    image: {
      src: "https://images.unsplash.com/photo-1528784351875-d797d86873a1?auto=format&fit=crop&w=900&q=80",
      alt: "Couple laying on a picnic blanket in a field",
      width: 1200,
      height: 900,
    },
    tags: ["Picnic", "Playlist", "Details"],
    badgeClass: "bg-white/85 text-wedding-text-secondary",
    avatarGradient: "from-wedding-cream via-white to-wedding-sage/70",
  },
  {
    id: "pin-roadtrip",
    title: "Roadtrip Ring Reveal",
    description:
      "A coffee stop along the coastal road turned into a ring reveal and tears in the passenger seat.",
    location: "Makassar Coast",
    date: "May 2024",
    category: "Proposal",
    image: {
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
      alt: "Couple standing together on an empty road at sunset",
      width: 900,
      height: 1350,
    },
    tags: ["Roadtrip", "Surprise", "Story"],
    badgeClass: "bg-wedding-cream/85 text-wedding-text-primary",
    avatarGradient: "from-wedding-sage/70 via-wedding-cream to-white",
  },
  {
    id: "pin-alpine",
    title: "Foggy Mountain First Look",
    description:
      "We practiced our first look at dawn, wrapped in the alpine fog that made everything feel cinematic.",
    location: "Mount Bromo",
    date: "February 2025",
    category: "Rehearsal",
    image: {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
      alt: "Couple embracing on a mountain ridge surrounded by fog",
      width: 900,
      height: 1350,
    },
    tags: ["Sunrise", "First Look", "Travel"],
    badgeClass: "bg-white/80 text-wedding-text-secondary",
    avatarGradient: "from-wedding-lavender/70 via-white to-wedding-cream",
  },
  {
    id: "pin-highland",
    title: "Heights & Heartbeats",
    description:
      "We hiked until we could watch the city wake up together — and locked in our ceremony song on the trail back.",
    location: "Bukit Pelangi",
    date: "March 2025",
    category: "Adventure",
    image: {
      src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80",
      alt: "Couple holding hands at a mountain overlook",
      width: 900,
      height: 1200,
    },
    tags: ["Hike", "Playlist", "Morning"],
    badgeClass: "bg-wedding-beige/85 text-wedding-text-primary",
    avatarGradient: "from-wedding-cream via-white to-wedding-sage/80",
  },
];

export const GallerySection = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    animateOnScroll(".gallery-heading", { delay: 0.2, direction: "up" });
    animateOnScroll(".gallery-subheading", { delay: 0.3, direction: "up" });
    animateCards(".gallery-pin");
    animateGalleryImages(".gallery-media");
    animateOnScroll(".gallery-description", { delay: 0.6, direction: "up" });
  });

  return (
    <section
      id="gallery"
      class="bg-gradient-to-b from-white via-wedding-cream/40 to-white px-4 py-24"
    >
      <div class="mx-auto max-w-6xl">
        <div class="text-center">
          <p
            class="gallery-subheading text-xs uppercase tracking-[0.45em] text-wedding-text-muted"
            style={{ opacity: 0 }}
          >
            Photo memories
          </p>
          <h2
            class="gallery-heading mt-4 font-serif text-4xl font-light text-wedding-brown md:text-6xl"
            style={{ opacity: 0 }}
          >
            Pinterest Moments We Love
          </h2>
          <p
            class="gallery-description mx-auto mt-6 max-w-2xl text-lg text-wedding-text-muted"
            style={{ opacity: 0 }}
          >
            A Pinterest-inspired wall of the little stories shaping our wedding —
            from sunrise road trips to rainy-day planning sessions. Tap any pin to
            feel the textures, tones, and tunes guiding our celebration.
          </p>
        </div>

        <div class="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          {galleryPins.map((pin) => (
            <article
              key={pin.id}
              class="gallery-pin mb-6 break-inside-avoid overflow-hidden rounded-[1.75rem] border border-wedding-beige/70 bg-white/90 shadow-[0_20px_60px_rgba(77,51,38,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(77,51,38,0.12)]"
              style={{ opacity: 0 }}
            >
              <div class="group">
                <div class="gallery-media relative overflow-hidden">
                  <img
                    src={pin.image.src}
                    alt={pin.image.alt}
                    width={pin.image.width}
                    height={pin.image.height}
                    loading="lazy"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                  <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15 opacity-0 transition duration-500 group-hover:opacity-100" />
                  <div class="absolute left-4 top-4">
                    <span
                      class={`inline-flex items-center rounded-full px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.22em] ${pin.badgeClass} backdrop-blur`}
                    >
                      {pin.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="absolute right-4 top-4 hidden items-center gap-1 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-wedding-text-primary shadow-sm backdrop-blur transition hover:bg-white sm:flex"
                  >
                    <svg
                      class="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 21l-3.5-3.5a5 5 0 01-1.5-3.54V6.5A2.5 2.5 0 019.5 4h5a2.5 2.5 0 012.5 2.5v7.46a5 5 0 01-1.5 3.54L12 21z" />
                    </svg>
                    Save
                  </button>
                </div>

                <div class="space-y-4 px-6 py-6">
                  <div>
                    <h3 class="text-lg font-semibold text-wedding-text-primary">
                      {pin.title}
                    </h3>
                    <p class="mt-2 text-sm leading-relaxed text-wedding-text-muted">
                      {pin.description}
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <div
                      class={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${pin.avatarGradient} text-sm font-semibold text-wedding-text-primary shadow-sm`}
                    >
                      AM
                    </div>
                    <div>
                      <p class="text-sm font-medium text-wedding-text-primary">
                        Alfina & Mugni
                      </p>
                      <p class="text-xs text-wedding-text-muted">
                        {pin.location} · {pin.date}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    {pin.tags.map((tag) => (
                      <span
                        key={tag}
                        class="rounded-full bg-wedding-beige/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-wedding-text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
