import { useSignal, useTask$ } from "@builder.io/qwik";

export interface UseMobileOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

export const useMobile = (options: UseMobileOptions = {}) => {
  const { defaultValue = false, initializeWithValue = true } = options;

  const isMobile = useSignal(defaultValue);
  const hasBeenInitialized = useSignal(false);

  useTask$(({ track }) => {
    track(() => hasBeenInitialized.value);

    if (!hasBeenInitialized.value && initializeWithValue) {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        const checkIsMobile = () => {
          const userAgent = navigator.userAgent;
          const mobileRegex =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

          // Check user agent
          const isMobileUA = mobileRegex.test(userAgent);

          // Check screen width (common mobile breakpoint)
          const isMobileScreen = window.innerWidth < 768;

          // Check touch capability
          const hasTouch =
            "ontouchstart" in window || navigator.maxTouchPoints > 0;

          // Consider it mobile if it matches UA or (small screen + touch)
          isMobile.value = isMobileUA || (isMobileScreen && hasTouch);
        };

        checkIsMobile();

        // Listen for window resize to update mobile status
        const handleResize = () => {
          checkIsMobile();
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }

      hasBeenInitialized.value = true;
    }
  });

  // Method to manually check mobile status
  const checkMobile = () => {
    if (typeof window === "undefined") return false;

    const userAgent = navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    const isMobileUA = mobileRegex.test(userAgent);
    const isMobileScreen = window.innerWidth < 768;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    return isMobileUA || (isMobileScreen && hasTouch);
  };

  // Method to update mobile status
  const updateMobile = () => {
    isMobile.value = checkMobile();
  };

  return {
    isMobile,
    checkMobile,
    updateMobile,
  };
};

// Hook for more detailed device detection
export const useDevice = () => {
  const device = useSignal({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    screenWidth: 0,
    screenHeight: 0,
    userAgent: "",
  });

  useTask$(() => {
    if (typeof window !== "undefined") {
      const updateDevice = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent;
        const hasTouch =
          "ontouchstart" in window || navigator.maxTouchPoints > 0;

        // Determine device type
        let isMobile = false;
        let isTablet = false;
        let isDesktop = false;

        if (width < 768) {
          isMobile = true;
        } else if (width < 1024) {
          isTablet = true;
        } else {
          isDesktop = true;
        }

        // Override based on user agent for better accuracy
        const mobileRegex =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const tabletRegex =
          /iPad|Android(?=.*\bMobile\b)|Tablet|PlayBook|Kindle/i;

        if (mobileRegex.test(userAgent) && !tabletRegex.test(userAgent)) {
          isMobile = true;
          isTablet = false;
          isDesktop = false;
        } else if (tabletRegex.test(userAgent)) {
          isMobile = false;
          isTablet = true;
          isDesktop = false;
        }

        device.value = {
          isMobile,
          isTablet,
          isDesktop,
          isTouch: hasTouch,
          screenWidth: width,
          screenHeight: height,
          userAgent,
        };
      };

      updateDevice();

      const handleResize = () => updateDevice();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  return device;
};

// Hook for responsive breakpoints
export const useBreakpoint = (breakpoint: number = 768) => {
  const isAbove = useSignal(false);
  const isBelow = useSignal(true);
  const currentWidth = useSignal(0);

  useTask$(() => {
    if (typeof window !== "undefined") {
      const updateBreakpoint = () => {
        const width = window.innerWidth;
        currentWidth.value = width;
        isAbove.value = width >= breakpoint;
        isBelow.value = width < breakpoint;
      };

      updateBreakpoint();

      const handleResize = () => updateBreakpoint();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  return {
    isAbove,
    isBelow,
    currentWidth,
  };
};

// Predefined breakpoint hooks
export const useIsMobile = () => useBreakpoint(768).isBelow;
export const useIsTablet = () => {
  const { isAbove: isAboveMobile } = useBreakpoint(768);
  const { isBelow: isBelowDesktop } = useBreakpoint(1024);
  return useSignal(isAboveMobile.value && isBelowDesktop.value);
};
export const useIsDesktop = () => useBreakpoint(1024).isAbove;
