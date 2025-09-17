import { component$ } from "@builder.io/qwik";

export const FooterSection = component$(() => {
  return (
    <footer class="bg-wedding-brown text-center px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <h2 class="font-serif text-2xl md:text-3xl text-wedding-cream mb-6 font-light">
          Thank you for being part of our special day
        </h2>

        <div class="text-wedding-cream opacity-80 mb-6">
          <p class="text-lg md:text-xl mb-2 font-medium">With love,</p>
          <p class="text-lg md:text-xl">Alfina & Mugni</p>
        </div>

        <div class="text-wedding-cream opacity-60 text-sm md:text-base">
          November 29, 2025 • Jakarta, Indonesia
        </div>

        <div class="mt-12 pt-8 border-t border-wedding-cream border-opacity-20">
          <p class="text-wedding-cream opacity-50 text-sm">
            Made with ❤️ for our special day
          </p>
        </div>
      </div>
    </footer>
  );
});
