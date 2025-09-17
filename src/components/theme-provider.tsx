import {
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  Slot,
  $,
  type QRL,
  type Signal,
} from "@builder.io/qwik";

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Signal<Theme>;
  resolvedTheme: Signal<"light" | "dark">;
  setTheme: QRL<(theme: Theme) => void>;
  toggleTheme: QRL<() => void>;
}

const ThemeContextId = createContextId<ThemeState>("theme-context");

export interface ThemeProviderProps {
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  children: any;
}

export const ThemeProvider = component$<ThemeProviderProps>(
  ({
    defaultTheme = "system",
    storageKey = "theme",
    attribute = "data-theme",
    enableSystem = true,
    disableTransitionOnChange = false,
    children,
  }) => {
    const theme = useSignal<Theme>(defaultTheme);
    const resolvedTheme = useSignal<"light" | "dark">("light");

    // Initialize theme from localStorage or system preference
    useTask$(() => {
      if (typeof window !== "undefined") {
        const storedTheme = localStorage.getItem(storageKey) as Theme;
        if (storedTheme) {
          theme.value = storedTheme;
        } else if (enableSystem) {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          theme.value = systemTheme;
        }

        updateResolvedTheme();
        applyTheme();
      }
    });

    const updateResolvedTheme = $(() => {
      if (theme.value === "system" && enableSystem) {
        resolvedTheme.value = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      } else {
        resolvedTheme.value = theme.value as "light" | "dark";
      }
    });

    const applyTheme = $(() => {
      if (typeof document === "undefined") return;

      const root = document.documentElement;

      // Remove existing theme attribute
      root.removeAttribute(attribute);

      // Apply new theme
      root.setAttribute(attribute, resolvedTheme.value);

      // Handle transition disabling
      if (disableTransitionOnChange) {
        root.style.setProperty("color-scheme", "none");
        setTimeout(() => {
          root.style.removeProperty("color-scheme");
        }, 0);
      }
    });

    const setTheme = $((newTheme: Theme) => {
      theme.value = newTheme;
      updateResolvedTheme();
      applyTheme();

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newTheme);
      }
    });

    const toggleTheme = $(() => {
      const currentTheme = resolvedTheme.value;
      const newTheme: Theme = currentTheme === "light" ? "dark" : "light";
      setTheme(newTheme);
    });

    // Listen for system theme changes
    useTask$(() => {
      if (typeof window !== "undefined" && enableSystem) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = $(() => {
          if (theme.value === "system") {
            updateResolvedTheme();
            applyTheme();
          }
        });

        mediaQuery.addEventListener("change", handleChange);

        return () => {
          mediaQuery.removeEventListener("change", handleChange);
        };
      }
    });

    const themeState: ThemeState = {
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    };

    useContextProvider(ThemeContextId, themeState);

    return <Slot>{children}</Slot>;
  }
);

export const useTheme = () => {
  const context = useContext(ThemeContextId);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Theme toggle button component
export interface ThemeToggleProps {
  class?: string;
  size?: "sm" | "default" | "lg";
}

export const ThemeToggle = component$<ThemeToggleProps>(
  ({ class: className = "", size = "default" }) => {
    const { theme, toggleTheme } = useTheme();

    const sizeClasses = {
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
    };

    return (
      <button
        class={`inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${sizeClasses[size]} ${className}`}
        onClick$={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme.value === "light" ? (
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>
    );
  }
);

// Theme selector dropdown
export interface ThemeSelectorProps {
  class?: string;
}

export const ThemeSelector = component$<ThemeSelectorProps>(
  ({ class: className = "" }) => {
    const { theme, setTheme } = useTheme();

    const themes: { value: Theme; label: string; icon: string }[] = [
      { value: "light", label: "Light", icon: "☀️" },
      { value: "dark", label: "Dark", icon: "🌙" },
      { value: "system", label: "System", icon: "💻" },
    ];

    return (
      <select
        class={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        value={theme.value}
        onChange$={$((event: Event) => {
          const target = event.target as HTMLSelectElement;
          setTheme(target.value as Theme);
        })}
      >
        {themes.map((themeOption) => (
          <option key={themeOption.value} value={themeOption.value}>
            {`${themeOption.icon} ${themeOption.label}`}
          </option>
        ))}
      </select>
    );
  }
);

// Hook for theme-aware styling
export const useThemeClass = (lightClass: string, darkClass: string) => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme.value === "dark" ? darkClass : lightClass;
};

// Hook for conditional rendering based on theme
export const useThemeConditional = () => {
  const { resolvedTheme } = useTheme();

  return {
    isLight: resolvedTheme.value === "light",
    isDark: resolvedTheme.value === "dark",
    theme: resolvedTheme,
  };
};

// Advanced theme configuration hook
export const useAdvancedTheme = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes = useSignal({
    light: {
      background: "bg-white",
      foreground: "text-gray-900",
      primary: "bg-blue-600",
      secondary: "bg-gray-100",
    },
    dark: {
      background: "bg-gray-900",
      foreground: "text-white",
      primary: "bg-blue-400",
      secondary: "bg-gray-800",
    },
  });

  const currentThemeClasses =
    resolvedTheme.value === "dark" ? themes.value.dark : themes.value.light;

  const updateThemeColors = $(
    (
      newColors: Partial<typeof themes.value.light | typeof themes.value.dark>
    ) => {
      const currentTheme = resolvedTheme.value;
      themes.value = {
        ...themes.value,
        [currentTheme]: {
          ...themes.value[currentTheme as keyof typeof themes.value],
          ...newColors,
        },
      };
    }
  );

  return {
    theme,
    resolvedTheme,
    setTheme,
    themes: themes.value,
    currentThemeClasses,
    updateThemeColors,
  };
};
