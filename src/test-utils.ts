import { createDOM as qwikCreateDOM } from "@builder.io/qwik/testing";

type CreateDOMOptions = {
  html?: string;
};

type DOMFixture = Awaited<ReturnType<typeof qwikCreateDOM>>;

type ExtendedDOM = DOMFixture & {
  cleanup: () => void;
};

export const createDOM = async (
  options: CreateDOMOptions = {},
): Promise<ExtendedDOM> => {
  const fixture = await qwikCreateDOM(options);

  const cleanup = () => {
    // Remove the host element to avoid leaking DOM between tests
    if (fixture.screen?.parentElement) {
      fixture.screen.parentElement.removeChild(fixture.screen);
    }
    const win = fixture.screen?.ownerDocument?.defaultView;
    win?.close?.();
  };

  return {
    ...fixture,
    cleanup,
  };
};

export const qwikUserEvent = {
  async click(target: string | Element, userEvent: DOMFixture["userEvent"]) {
    if (typeof target === "string") {
      const element = document.querySelector(target);
      if (!element)
        throw new Error(`Element not found for selector: ${target}`);
      await userEvent(element, "click");
      return;
    }

    await userEvent(target, "click");
  },

  async type(
    target: string | Element,
    text: string,
    userEvent: DOMFixture["userEvent"],
  ) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) throw new Error(`Element not found for selector: ${target}`);

    const input = element as HTMLInputElement | HTMLTextAreaElement;
    for (const char of text.split("")) {
      const nextValue = `${input.value ?? ""}${char}`;
      input.value = nextValue;
      await userEvent(element, "keydown", { key: char });
      await userEvent(element, "input", { value: nextValue, data: char });
    }

    await userEvent(element, "keyup", { key: text.at(-1) });
  },
};

type MatcherResult = {
  pass: boolean;
  message: () => string;
};

const nullElementResult = (matcher: string): MatcherResult => ({
  pass: false,
  message: () => `Expected element for ${matcher}, but received null`,
});

export const qwikMatchers = {
  toHaveQwikClass(element: Element | null, className: string): MatcherResult {
    if (!element) return nullElementResult(`class "${className}"`);
    const hasClass = element.classList.contains(className);
    return {
      pass: hasClass,
      message: () => `Expected element to have class "${className}"`,
    };
  },

  toHaveTextContent(element: Element | null, text: string): MatcherResult {
    if (!element) return nullElementResult(`text "${text}"`);
    const hasText = element.textContent?.includes(text) ?? false;
    return {
      pass: hasText,
      message: () => `Expected element to contain text "${text}"`,
    };
  },

  toHaveAttribute(
    element: Element | null,
    name: string,
    value?: string,
  ): MatcherResult {
    if (!element) return nullElementResult(`attribute "${name}"`);
    const attr = element.getAttribute(name);
    const hasAttr = attr !== null;
    const matchesValue = value === undefined || attr === value;
    return {
      pass: hasAttr && matchesValue,
      message: () =>
        `Expected element to have attribute "${name}"${
          value ? ` with value "${value}"` : ""
        }`,
    };
  },
};

export const qwikTestHelpers = {
  waitForComponent: async (
    selector: string,
    timeout = 1_000,
  ): Promise<Element> => {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    throw new Error(
      `Component with selector "${selector}" not found within ${timeout}ms`,
    );
  },

  getByComponentName: (name: string): Element | null => {
    return document.querySelector(`[data-qwik-component="${name}"]`);
  },

  isHydrated: (element: Element): boolean => {
    return (
      element.hasAttribute("data-qwik-hydrated") ||
      element.querySelector("[data-qwik-hydrated]") !== null
    );
  },

  getQwikElements: (): NodeListOf<Element> => {
    return document.querySelectorAll("[data-qwik-component]");
  },
};

export const qrlTestUtils = {
  mockQRL(implementation?: (...args: unknown[]) => unknown) {
    const fn = implementation ?? (() => undefined);
    return Object.assign(() => undefined, {
      $: fn,
      __brand__: "QRL" as const,
    });
  },

  createTestQRL<T extends (...args: unknown[]) => unknown>(fn: T) {
    const qrl = (...args: Parameters<T>) => fn(...args);
    return Object.assign(qrl, {
      $: fn,
      __brand__: "QRL" as const,
    });
  },
};

export const signalTestUtils = {
  createMockSignal<T>(initialValue: T) {
    let current = initialValue;
    return {
      get value() {
        return current;
      },
      set value(next: T) {
        current = next;
      },
    };
  },

  createMockStore<T extends object>(initialState: T) {
    return {
      ...initialState,
      __brand__: "STORE" as const,
    } as T & { __brand__: "STORE" };
  },
};

export async function setupQwikTestEnvironment() {
  await qwikCreateDOM();
}

export function cleanupQwikTestEnvironment() {
  if (typeof document === "undefined") return;
  const root = document.querySelector("super-parent");
  root?.remove();
}

export default {
  createDOM,
  qwikUserEvent,
  qwikMatchers,
  qwikTestHelpers,
  qrlTestUtils,
  signalTestUtils,
  setupQwikTestEnvironment,
  cleanupQwikTestEnvironment,
};
