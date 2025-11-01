import { animate, inView, stagger, scroll } from "motion";

// Animation duration constants for consistency
export const ANIMATION_DURATIONS = {
  fast: 0.3,
  medium: 0.6,
  slow: 1.0,
  extraSlow: 1.5,
} as const;

// Easing presets matching wedding theme
export const WEDDING_EASINGS = {
  gentle: "easeOut",
  elegant: "easeInOut",
  spring: { type: "spring", stiffness: 300, damping: 25 },
  bounce: { type: "spring", bounce: 0.3, duration: 0.8 },
} as const;

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Hero section animations
export const animateHeroEntrance = () => {
  if (prefersReducedMotion()) return;

  // Animate main heading
  animate(
    ".hero-title",
    { opacity: [0, 1], y: [30, 0] },
    { duration: ANIMATION_DURATIONS.slow, ease: WEDDING_EASINGS.elegant },
  );

  // Stagger subtitle elements
  animate(
    ".hero-subtitle",
    { opacity: [0, 1], y: [20, 0] },
    {
      duration: ANIMATION_DURATIONS.medium,
      ease: WEDDING_EASINGS.gentle,
      delay: stagger(0.2, { startDelay: 0.3 }),
    },
  );

  // Animate divider line
  animate(
    ".hero-divider",
    { scaleX: [0, 1], opacity: [0, 1] },
    {
      duration: ANIMATION_DURATIONS.medium,
      ease: WEDDING_EASINGS.elegant,
      delay: 0.8,
    },
  );

  // Enhanced bounce for scroll indicator
  animate(
    ".hero-scroll-indicator",
    { opacity: [0, 1], y: [10, 0] },
    {
      duration: ANIMATION_DURATIONS.medium,
      ease: WEDDING_EASINGS.elegant,
      delay: 1.2,
    },
  );
};

// Scroll-triggered fade-in animations
export const animateOnScroll = (
  selector: string,
  options?: {
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    distance?: number;
  },
) => {
  if (prefersReducedMotion()) return;

  const { delay = 0, direction = "up", distance = 30 } = options || {};

  let transform: Record<string, number[]>;

  switch (direction) {
    case "down":
      transform = { y: [-distance, 0] };
      break;
    case "left":
      transform = { x: [distance, 0] };
      break;
    case "right":
      transform = { x: [-distance, 0] };
      break;
    default: // 'up'
      transform = { y: [distance, 0] };
  }

  inView(selector, (element) => {
    animate(
      element,
      { opacity: [0, 1], ...transform },
      {
        duration: ANIMATION_DURATIONS.medium,
        ease: WEDDING_EASINGS.gentle,
        delay,
      },
    );
  });
};

// Staggered card animations
export const animateCards = (selector: string) => {
  if (prefersReducedMotion()) return;

  inView(selector, (elements) => {
    animate(
      elements,
      { opacity: [0, 1], y: [40, 0], scale: [0.95, 1] },
      {
        duration: ANIMATION_DURATIONS.medium,
        ease: WEDDING_EASINGS.elegant,
        delay: stagger(0.15),
      },
    );
  });
};

// Button hover animations
export const animateButton = (selector: string) => {
  if (prefersReducedMotion()) return;

  const elements = document.querySelectorAll(selector);

  elements.forEach((button) => {
    const element = button as HTMLElement;

    element.addEventListener("mouseenter", () => {
      animate(
        element,
        { scale: 1.05, y: -2 },
        { duration: ANIMATION_DURATIONS.fast, ease: WEDDING_EASINGS.gentle },
      );
    });

    element.addEventListener("mouseleave", () => {
      animate(
        element,
        { scale: 1, y: 0 },
        { duration: ANIMATION_DURATIONS.fast, ease: WEDDING_EASINGS.gentle },
      );
    });

    element.addEventListener("mousedown", () => {
      animate(
        element,
        { scale: 0.98 },
        { duration: 0.1, ease: WEDDING_EASINGS.gentle },
      );
    });

    element.addEventListener("mouseup", () => {
      animate(
        element,
        { scale: 1.05 },
        { duration: 0.1, ease: WEDDING_EASINGS.gentle },
      );
    });
  });
};

// Form field focus animations
export const animateFormFields = () => {
  if (prefersReducedMotion()) return;

  const inputs = document.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    const element = input as HTMLElement;

    element.addEventListener("focus", () => {
      animate(
        element,
        { scale: 1.02, boxShadow: "0 8px 25px rgba(178, 128, 77, 0.15)" },
        { duration: ANIMATION_DURATIONS.fast, ease: WEDDING_EASINGS.gentle },
      );
    });

    element.addEventListener("blur", () => {
      animate(
        element,
        { scale: 1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" },
        { duration: ANIMATION_DURATIONS.fast, ease: WEDDING_EASINGS.gentle },
      );
    });
  });
};

// Gallery image hover effects
export const animateGalleryImages = (selector: string) => {
  if (prefersReducedMotion()) return;

  const images = document.querySelectorAll(selector);

  images.forEach((img) => {
    const element = img as HTMLElement;

    element.addEventListener("mouseenter", () => {
      animate(
        element,
        { scale: 1.08, filter: "brightness(1.1)" },
        { duration: ANIMATION_DURATIONS.medium, ease: WEDDING_EASINGS.elegant },
      );
    });

    element.addEventListener("mouseleave", () => {
      animate(
        element,
        { scale: 1, filter: "brightness(1)" },
        { duration: ANIMATION_DURATIONS.medium, ease: WEDDING_EASINGS.elegant },
      );
    });
  });
};

// Navigation scroll effects
export const animateNavigation = () => {
  if (prefersReducedMotion()) return;

  const nav = document.querySelector("#main-navigation");
  if (!nav) return;

  scroll((progress: number) => {
    const opacity = progress > 0.1 ? 0.98 : 0.95;
    const shadow =
      progress > 0.1
        ? "0 4px 25px rgba(77, 51, 38, 0.15)"
        : "0 2px 10px rgba(77, 51, 38, 0.1)";

    animate(
      nav,
      {
        backgroundColor: `rgba(250, 247, 245, ${opacity})`,
        boxShadow: shadow,
        backdropFilter: "blur(12px)",
      },
      { duration: ANIMATION_DURATIONS.fast, ease: WEDDING_EASINGS.gentle },
    );
  });
};

// Text reveal animation with character stagger
export const animateTextReveal = (
  selector: string,
  options?: {
    delay?: number;
    staggerDelay?: number;
  },
) => {
  if (prefersReducedMotion()) return;

  const { delay = 0, staggerDelay = 0.03 } = options || {};

  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    const text = element.textContent || "";
    const chars = text
      .split("")
      .map((char) => (char === " " ? "&nbsp;" : char));

    element.innerHTML = chars
      .map(
        (char) =>
          `<span style="opacity: 0; display: inline-block;">${char}</span>`,
      )
      .join("");

    const spans = element.querySelectorAll("span");

    inView(element, () => {
      animate(
        spans,
        { opacity: [0, 1], y: [20, 0] },
        {
          duration: ANIMATION_DURATIONS.medium,
          ease: WEDDING_EASINGS.gentle,
          delay: stagger(staggerDelay, { startDelay: delay }),
        },
      );
    });
  });
};

// Invitation cover exit animation with error handling and timeout fallback
export const animateCoverExit = (element: HTMLElement): Promise<void> => {
  if (prefersReducedMotion()) {
    // Skip animation, just hide immediately
    element.style.display = "none";
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    // Set timeout fallback to ensure promise resolves even if animation fails
    const timeoutId = setTimeout(() => {
      console.warn("Animation timeout - forcing cover exit");
      element.style.display = "none";
      resolve();
    }, 2000); // 2 second fallback

    try {
      // Animate content fade out and scale down
      const content = element.querySelector(".cover-content") as HTMLElement;
      if (content) {
        animate(
          content,
          { opacity: [1, 0], scale: [1, 0.95], y: [0, -30] },
          {
            duration: ANIMATION_DURATIONS.medium,
            ease: WEDDING_EASINGS.elegant,
          },
        );
      }

      // Animate main cover fade out
      const animation = animate(
        element,
        { opacity: [1, 0] },
        {
          duration: ANIMATION_DURATIONS.slow,
          ease: WEDDING_EASINGS.elegant,
        },
      );

      // Wait for animation to finish
      animation.finished.then(
        () => {
          clearTimeout(timeoutId);
          element.style.display = "none";
          resolve();
        },
        (error: unknown) => {
          console.error("Cover animation failed:", error);
          clearTimeout(timeoutId);
          element.style.display = "none";
          resolve();
        }
      );
    } catch (error) {
      console.error("Animation setup failed:", error);
      clearTimeout(timeoutId);
      element.style.display = "none";
      resolve();
    }
  });
};

// Music bars animation keyframes (used in audio player)
export const animateMusicBars = () => {
  // This is handled via CSS keyframes in global.css
  // The animation is: transform scaleY from 0.3 to 1
};
