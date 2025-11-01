import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

/**
 * Static Analysis Test: Icon Library Hygiene
 *
 * Purpose: Prevent React-specific lucide-react imports in Qwik components
 *
 * This test ensures that all Qwik components use the correct icon library:
 * - ✅ CORRECT: @qwikest/icons/lucide (Qwik-compatible)
 * - ❌ WRONG: lucide-react (React-only, causes runtime errors)
 *
 * Root cause of gallery page error:
 * When Qwik components import from lucide-react, they receive React component
 * objects instead of Qwik components, causing:
 * "The <Type> of the JSX element must be either a string or a function.
 *  Instead, it's a 'object': [object Object]."
 */

describe("Icon Library Import Hygiene", () => {
  /**
   * Recursively finds all .tsx and .ts files in a directory
   */
  function findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, dist, and other build directories
        if (
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules" &&
          entry.name !== "dist" &&
          entry.name !== "build" &&
          entry.name !== "pinterest-ui" // Skip React example directory
        ) {
          files.push(...findTypeScriptFiles(fullPath));
        }
      } else if (
        (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) &&
        !entry.name.endsWith(".test.tsx") &&
        !entry.name.endsWith(".test.ts") &&
        !entry.name.endsWith(".spec.tsx") &&
        !entry.name.endsWith(".spec.ts")
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Check if a file contains lucide-react imports
   */
  function checkForLucideReactImports(filePath: string): {
    hasImport: boolean;
    lineNumber?: number;
    importStatement?: string;
  } {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match: import { ... } from 'lucide-react'
      // Match: import { ... } from "lucide-react"
      const lucideReactImportRegex =
        /import\s+{[^}]*}\s+from\s+['"]lucide-react['"]/;

      if (lucideReactImportRegex.test(line)) {
        return {
          hasImport: true,
          lineNumber: i + 1,
          importStatement: line.trim(),
        };
      }
    }

    return { hasImport: false };
  }

  it("should not import icons from lucide-react in src/components", () => {
    const componentsDir = join(process.cwd(), "src/components");
    const files = findTypeScriptFiles(componentsDir);

    const violations: Array<{
      file: string;
      line: number;
      statement: string;
    }> = [];

    for (const file of files) {
      const result = checkForLucideReactImports(file);
      if (result.hasImport) {
        violations.push({
          file: relative(process.cwd(), file),
          line: result.lineNumber!,
          statement: result.importStatement!,
        });
      }
    }

    if (violations.length > 0) {
      const errorMessage = [
        "\n❌ Found lucide-react imports in Qwik components:",
        "",
        ...violations.map(
          (v) =>
            `  ${v.file}:${v.line}\n    ${v.statement}\n    ❌ Use: import { Lu... } from "@qwikest/icons/lucide" instead`
        ),
        "",
        "Why this is a problem:",
        "  - lucide-react provides React components",
        "  - Qwik cannot render React components",
        "  - Results in runtime error: 'JSX element Type must be string or function'",
        "",
        "Fix:",
        "  1. Replace: import { Upload } from 'lucide-react'",
        "  2. With: import { LuUpload } from '@qwikest/icons/lucide'",
        "  3. Update JSX: <Upload /> → <LuUpload />",
      ].join("\n");

      throw new Error(errorMessage);
    }

    // Test passes if no violations found
    expect(violations).toHaveLength(0);
  });

  it("should not import icons from lucide-react in src/routes", () => {
    const routesDir = join(process.cwd(), "src/routes");
    const files = findTypeScriptFiles(routesDir);

    const violations: Array<{
      file: string;
      line: number;
      statement: string;
    }> = [];

    for (const file of files) {
      const result = checkForLucideReactImports(file);
      if (result.hasImport) {
        violations.push({
          file: relative(process.cwd(), file),
          line: result.lineNumber!,
          statement: result.importStatement!,
        });
      }
    }

    if (violations.length > 0) {
      const errorMessage = [
        "\n❌ Found lucide-react imports in route components:",
        "",
        ...violations.map(
          (v) =>
            `  ${v.file}:${v.line}\n    ${v.statement}\n    ❌ Use: import { Lu... } from "@qwikest/icons/lucide" instead`
        ),
        "",
        "Icons must use @qwikest/icons in Qwik routes.",
      ].join("\n");

      throw new Error(errorMessage);
    }

    expect(violations).toHaveLength(0);
  });

  it("should provide helpful examples of correct icon imports", () => {
    // This test documents the correct pattern for developers
    const examples = [
      {
        wrong: "import { Upload, X, Image } from 'lucide-react'",
        correct: "import { LuUpload, LuX, LuImage } from '@qwikest/icons/lucide'",
      },
      {
        wrong: "<Upload class='w-5 h-5' />",
        correct: "<LuUpload class='w-5 h-5' />",
      },
    ];

    // This test always passes but serves as documentation
    expect(examples).toBeDefined();
  });
});
