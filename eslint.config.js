import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import { qwikEslint9Plugin } from "eslint-plugin-qwik";

const ignores = [
  "**/*.log",
  "**/.DS_Store",
  "**/*.",
  ".vscode/settings.json",
  "**/.history",
  "**/.yarn",
  "**/bazel-*",
  "**/bazel-bin",
  "**/bazel-out",
  "**/bazel-qwik",
  "**/bazel-testlogs",
  "**/dist",
  "**/dist-dev",
  "**/lib",
  "**/lib-types",
  "**/etc",
  "**/external",
  "**/node_modules",
  "**/temp",
  "**/tsc-out",
  "**/tsdoc-metadata.json",
  "**/target",
  "**/output",
  "**/rollup.config.js",
  "**/build",
  "**/.cache",
  "**/.vscode",
  "**/.rollup.cache",
  "**/dist",
  "**/tsconfig.tsbuildinfo",
  "**/vite.config.ts",
  "**/*.spec.tsx",
  "**/*.spec.ts",
  "src/routes/components-test/**",
  "**/.netlify",
  "**/pnpm-lock.yaml",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/server",
  "eslint.config.js",
];

export default tseslint.config(
  globalIgnores(ignores),
  js.configs.recommended,
  tseslint.configs.recommended,
  qwikEslint9Plugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.serviceworker,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Temporarily disable due to plugin bug
      "qwik/valid-lexical-scope": "off",
    },
  },
  // Prevent lucide-react imports in Qwik components (use @qwikest/icons instead)
  {
    files: ["src/**/*.tsx", "src/**/*.ts"],
    ignores: ["pinterest-ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message:
                "❌ Do not import from 'lucide-react' in Qwik components.\n" +
                "Use '@qwikest/icons/lucide' instead with Lu prefix:\n" +
                "  ✅ import { LuUpload, LuX, LuImage } from '@qwikest/icons/lucide'\n" +
                "  ❌ import { Upload, X, Image } from 'lucide-react'\n\n" +
                "Why: lucide-react provides React components which cause runtime errors in Qwik.\n" +
                "Error: 'JSX element Type must be either a string or a function, got object'",
            },
          ],
        },
      ],
    },
  },
  // Temporary fix for command.tsx file
  {
    files: ["src/components/ui/command.tsx"],
    rules: {
      "qwik/valid-lexical-scope": "off",
    },
  }
);
