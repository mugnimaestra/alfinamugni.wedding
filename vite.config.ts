/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */
export default defineConfig(({ command, mode }): UserConfig => {
  const isProduction = mode === "production";

  return {
    plugins: [
      qwikCity(),
      qwikVite({
        // Enhanced optimization for production builds
        ...(isProduction && {
          // symbolsOutput: false, // Reduce bundle size - commented out as it may not be supported
          // inlineOptimizations: true, // commented out as it may not be supported
        }),
      } as any),
      tsconfigPaths(),
      // PWA plugin disabled temporarily due to TypeScript compatibility issues
      // qwikPWA({}),
    ],
    css: {
      postcss: './postcss.config.js',
    },
    // This tells Vite which dependencies to pre-build in dev mode.
    optimizeDeps: {
      // Put problematic deps that break bundling here, mostly those with binaries.
      // For example ['better-sqlite3'] if you use that in server functions.
    },
    resolve: {
      alias: {
        // Add any path aliases here if needed
      },
    },
    build: {
      target: "es2020",
      minify: "esbuild",
      sourcemap: true,
    },
  };
});

/**
 * This function checks for duplicate dependencies in different package managers.
 * It's helpful for avoiding issues with conflicting dependency versions.
 */
function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep
) {
  const dupDeps = Object.keys(devDependencies).filter((dep) => dependencies[dep]);

  if (dupDeps.length > 0) {
    console.warn(
      ` Duplicate dependencies found: ${dupDeps.join(", ")}. This might cause issues in production builds.`
    );
  }
}