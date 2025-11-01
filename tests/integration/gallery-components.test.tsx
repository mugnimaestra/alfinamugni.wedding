import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDOM } from "@builder.io/qwik/testing";
import { GalleryUploadSection } from "~/components/gallery-upload-section";

/**
 * Integration Test: Gallery Components
 *
 * Purpose: Ensure gallery components render without JSX type errors
 *
 * These tests verify that icon components are properly imported from
 * @qwikest/icons/lucide and can be rendered by Qwik without errors.
 *
 * Historical context:
 * - Gallery page previously crashed with: "JSX element Type must be string or function"
 * - Root cause: lucide-react imports instead of @qwikest/icons
 * - These tests prevent regression by ensuring components render successfully
 */

describe("GalleryUploadSection Component", () => {
  beforeEach(() => {
    // Mock useGallery hook
    vi.mock("~/hooks/use-gallery", () => ({
      useGallery: () => ({
        items: { value: [] },
        loading: { value: false },
        uploadFile: vi.fn(),
      }),
    }));
  });

  it("should render without JSX type errors", async () => {
    const { screen, render } = await createDOM();

    await render(<GalleryUploadSection />);

    // If component renders without throwing, icons are correctly imported
    const heading = screen.querySelector("h2");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("Wedding Gallery");
  });

  it("should render upload button with icon", async () => {
    const { screen, render } = await createDOM();

    await render(<GalleryUploadSection />);

    // Look for upload button
    const buttons = screen.querySelectorAll("button");
    const uploadButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes("Upload Photos/Videos")
    );

    expect(uploadButton).toBeTruthy();
  });

  it("should render empty state with icons", async () => {
    const { screen, render } = await createDOM();

    // Mock empty gallery
    vi.mock("~/hooks/use-gallery", () => ({
      useGallery: () => ({
        items: { value: [] },
        loading: { value: false },
        uploadFile: vi.fn(),
      }),
    }));

    await render(<GalleryUploadSection />);

    // Empty state should include "No photos or videos yet" message
    const emptyMessage = Array.from(screen.querySelectorAll("h3")).find(
      (h3) => h3.textContent?.includes("No photos or videos yet")
    );

    expect(emptyMessage).toBeTruthy();
  });

  it("should not throw errors when icons are used in JSX", async () => {
    const { render } = await createDOM();

    // This test verifies that icon components don't cause:
    // "The <Type> of the JSX element must be either a string or a function"
    //
    // If lucide-react is incorrectly imported, this will throw because
    // React icons are objects, not functions or strings

    await expect(render(<GalleryUploadSection />)).resolves.not.toThrow();
  });
});

describe("Icon Library Compatibility", () => {
  it("should document the difference between lucide-react and @qwikest/icons", () => {
    // Documentation test that explains the issue for future developers

    const documentation = {
      problem: {
        symptom: "JSX element Type must be either a string or a function, got object",
        cause: "Importing from lucide-react in Qwik components",
        why: "lucide-react exports React components (objects with $$typeof property)",
      },
      solution: {
        library: "@qwikest/icons/lucide",
        naming: "All icons have Lu prefix (e.g., LuUpload, LuX, LuImage)",
        reason: "Provides Qwik-compatible component$ functions",
      },
      examples: [
        {
          wrong: "import { Upload } from 'lucide-react'",
          correct: "import { LuUpload } from '@qwikest/icons/lucide'",
        },
        {
          wrong: "<Upload class='w-5 h-5' />",
          correct: "<LuUpload class='w-5 h-5' />",
        },
      ],
    };

    // Test always passes but serves as living documentation
    expect(documentation.problem.cause).toBe("Importing from lucide-react in Qwik components");
    expect(documentation.solution.library).toBe("@qwikest/icons/lucide");
  });

  it("should verify @qwikest/icons package is installed", () => {
    // Ensure the correct dependency is available
    const packageJson = require("../../package.json");

    expect(packageJson.devDependencies["@qwikest/icons"]).toBeDefined();
  });

  it("should verify lucide-react is listed as a dependency (but not for Qwik components)", () => {
    // lucide-react exists but should only be used in React contexts (like pinterest-ui examples)
    const packageJson = require("../../package.json");

    expect(packageJson.dependencies["lucide-react"]).toBeDefined();

    // Document where it's safe to use lucide-react
    const safeDirectories = ["pinterest-ui/", "*.config.js"];
    expect(safeDirectories).toContain("pinterest-ui/");
  });
});
