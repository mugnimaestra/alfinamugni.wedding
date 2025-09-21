import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { animateNavigation } from "../utils/animations";

export const Navigation = component$(() => {
  const isMenuOpen = useSignal(false);

  const scrollToSection = $((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      isMenuOpen.value = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Initialize navigation scroll effects
    animateNavigation();
  });

  const navItems = [
    { id: "countdown", label: "Hitung Mundur" },
    { id: "story-section", label: "Kisah Kami" },
    { id: "details", label: "Detail Acara" },
    { id: "gift", label: "Hadiah" },
    { id: "rsvp", label: "RSVP" },
    { id: "wishes", label: "Ucapan" },
    { id: "gallery", label: "Galeri" },
    { id: "contact", label: "Kontak" },
  ];

  return (
    <nav
      id="main-navigation"
      class="fixed top-0 left-0 right-0 z-50 bg-wedding-cream bg-opacity-95 backdrop-blur-sm shadow-sm transition-all duration-300"
    >
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <button
            onClick$={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            class="nav-logo font-serif text-xl md:text-2xl text-wedding-brown font-medium hover:text-wedding-accent transition-all duration-300 transform hover:scale-105"
          >
            A & M
          </button>

          {/* Desktop Navigation */}
          <div class="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick$={() => scrollToSection(item.id)}
                class="nav-item text-wedding-text-secondary hover:text-wedding-accent transition-all duration-300 font-medium relative group"
              >
                {item.label}
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-wedding-accent transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick$={() => (isMenuOpen.value = !isMenuOpen.value)}
            class="md:hidden text-wedding-brown transition-all duration-300 hover:text-wedding-accent transform hover:scale-110"
          >
            <svg
              class="w-6 h-6 transition-transform duration-300"
              style={{
                transform: isMenuOpen.value ? "rotate(90deg)" : "rotate(0deg)",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d={
                  isMenuOpen.value
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen.value && (
          <div
            class="md:hidden bg-white border-t border-gray-100 animate-fadeIn"
            style={{
              animation: "slideDown 0.3s ease-out",
            }}
          >
            <div class="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick$={() => scrollToSection(item.id)}
                  class="block w-full text-left px-3 py-2 text-wedding-text-secondary hover:text-wedding-accent transition-all duration-300 font-medium transform hover:translate-x-2"
                  style={{
                    animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});
