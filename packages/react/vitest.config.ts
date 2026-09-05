import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {browserConfig} from "@sy-inc/testing/configs/browser";
import {uiConfig} from "@sy-inc/testing/configs/react";
import react from "@vitejs/plugin-react";
import {defineConfig, mergeConfig} from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "src");

/** Dual-project: jsdom (`*.test` / `*.ssr.test`) + Playwright (`*.browser.test`). */
export default defineConfig({
  // Keep React Aria subpath imports in the initial dependency graph. Without this, Vite can
  // discover them while browser tests are already running and reload a test with a second React
  // instance, which surfaces as an invalid-hook-call failure in PromptInput.
  optimizeDeps: {
    include: [
      "react-aria-components/Form",
      "react-aria-components/GridList",
      "react-aria-components/Label",
      "react-aria-components/RadioGroup",
      "react-aria-components/Slider",
      "react-aria-components/useDragAndDrop",
    ],
  },
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  test: {
    // Coverage is root-only + jsdom-only. Thresholds are CI floors, not suite depth.
    coverage: {
      provider: "v8",
      include: ["src/components/**/*.{ts,tsx}"],
      exclude: ["**/index.ts", "**/*.stories.*"],
      thresholds: {
        statements: 80,
        branches: 56,
        functions: 83,
        lines: 80,
      },
      reporter: [
        "text",
        "html",
        [
          "json",
          {
            file: "coverage-final.json",
          },
        ],
      ],
      reportsDirectory: "./coverage",
    },
    projects: [
      mergeConfig(
        uiConfig,
        defineConfig({
          plugins: [react()],
          resolve: {
            alias: {
              "@": srcDir,
            },
          },
          test: {
            name: "react-jsdom",
            passWithNoTests: false,
            include: ["tests/**/*.{test,ssr.test}.{ts,tsx}"],
            exclude: ["**/node_modules/**", "**/dist/**", "**/*.browser.test.{ts,tsx}"],
          },
        }),
      ),
      mergeConfig(
        browserConfig,
        defineConfig({
          plugins: [react()],
          resolve: {
            alias: {
              "@": srcDir,
            },
          },
          test: {
            name: "react-browser",
            passWithNoTests: false,
            include: ["tests/**/*.browser.test.{ts,tsx}"],
            exclude: ["**/node_modules/**", "**/dist/**"],
          },
        }),
      ),
    ],
  },
});
