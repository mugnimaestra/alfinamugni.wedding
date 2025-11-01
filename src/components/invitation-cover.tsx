import { component$, useSignal, useVisibleTask$, $, type QRL } from "@builder.io/qwik";
import { LuHome } from "@qwikest/icons/lucide";
import { animateCoverExit } from "~/utils/animations";

interface InvitationCoverProps {
  guestName?: string;
  onOpen$: QRL<() => void>;
}

export const InvitationCover = component$<InvitationCoverProps>(
  ({ guestName, onOpen$ }) => {
    const coverRef = useSignal<HTMLDivElement>();
    const isAnimating = useSignal(false);

    useVisibleTask$(({ track }) => {
      track(() => coverRef.value);

      // Entrance animation (client-only)
      if (coverRef.value) {
        coverRef.value.style.opacity = "0";
        setTimeout(() => {
          if (coverRef.value) {
            coverRef.value.style.transition = "opacity 0.8s ease-out";
            coverRef.value.style.opacity = "1";
          }
        }, 100);
      }
    }, { strategy: 'document-ready' });

    // Handle "Open Invitation" button click with error handling
    const handleOpen = $(() => {
      console.log("Open Invitation button clicked");

      if (isAnimating.value) {
        console.log("Animation already in progress, ignoring click");
        return;
      }

      if (!coverRef.value) {
        console.error("Cover ref is not available");
        // Fallback: call onOpen$ anyway to ensure button works
        onOpen$();
        return;
      }

      isAnimating.value = true;
      console.log("Starting cover exit animation");

      // Animate cover exit with fallback
      animateCoverExit(coverRef.value)
        .then(() => {
          console.log("Animation completed successfully");
          onOpen$();
        })
        .catch((error) => {
          console.error("Animation failed:", error);
          // Even if animation fails, call onOpen$ to ensure functionality
          onOpen$();
        });
    });

    // Format guest name or use default
    const displayName = guestName
      ? guestName.replace(/\+/g, " ")
      : "Our Beloved Guests";

    return (
      <div
        ref={coverRef}
        class="invitation-cover fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/photos/_DSC5342.jpg)",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div class="absolute inset-0 bg-black/45 z-[1]" />

        {/* Content */}
        <div class="cover-content relative z-[2] text-center text-white max-w-xs sm:max-w-md md:max-w-2xl w-full px-4">
          {/* Dear, Guest Name */}
          <div class="cover-dear text-base sm:text-lg font-light tracking-wider mb-2 opacity-95">
            Dear,
          </div>

          <div class="cover-guest-name text-xl sm:text-2xl md:text-3xl font-medium tracking-wide mb-4 sm:mb-6">
            {displayName}
          </div>

          {/* You Are Invited */}
          <div class="cover-invited text-sm sm:text-base font-light tracking-[0.1em] mb-6 sm:mb-10 uppercase opacity-90">
            You Are Invited!
          </div>

          {/* AM Monogram */}
          <div class="cover-monogram mb-6 sm:mb-8 flex justify-center">
            <svg
              width="100"
              height="100"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 drop-shadow-lg"
            >
              {/* Circular border */}
              <circle
                cx="60"
                cy="60"
                r="55"
                stroke="white"
                stroke-width="1.5"
                fill="none"
                opacity="0.8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="white"
                stroke-width="0.5"
                fill="none"
                opacity="0.6"
              />

              {/* AM Initials - Elegant intertwined design */}
              <text
                x="60"
                y="75"
                text-anchor="middle"
                fill="white"
                font-family="Playfair Display, serif"
                font-size="48"
                font-weight="400"
                font-style="italic"
              >
                A&amp;M
              </text>
            </svg>
          </div>

          {/* Couple Names Title */}
          <div class="cover-title text-xs sm:text-sm font-light tracking-[0.15em] mb-2 sm:mb-3 uppercase opacity-85">
            The Wedding Celebration of
          </div>

          <div class="cover-couple-names text-3xl sm:text-4xl md:text-5xl font-serif font-normal italic mb-8 sm:mb-12 leading-tight">
            Alfina <span class="opacity-70">&amp;</span> Mugni
          </div>

          {/* Open Invitation Button */}
          <button
            onClick$={handleOpen}
            class="open-invitation-button inline-flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 bg-white text-[var(--wedding-brown,#4d3326)] border-none rounded-full text-sm sm:text-base font-medium tracking-wider cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-105 hover:shadow-[0_6px_25px_rgba(0,0,0,0.4)] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isAnimating.value}
          >
            <LuHome class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Open Invitation</span>
          </button>
        </div>
      </div>
    );
  }
);
