import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {playwright} from "@vitest/browser-playwright";
import {defineConfig} from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const setupFile = join(__dirname, "../setup/browser.ts");

/**
 * Vitest's Playwright commands that run in the tester frame (keyboard, tab, …) look it up by name
 * in Playwright's frame list. Frame events can reach that list later than a file's first command,
 * so the lookup may still return the previous file's iframe and the command then fails with
 * "Frame was detached". The browser setup file calls this once per file to wait until the list
 * holds the current file's iframe.
 */
const waitForTesterFrame = async ({page}, href) => {
  const deadline = Date.now() + 10_000;

  while (page.frame("vitest-iframe")?.url() !== href) {
    if (Date.now() > deadline) {
      throw new Error(`Playwright did not register the tester iframe for ${href}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

/** Playwright Chromium defaults for `*.browser.test.tsx`. */
export const browserConfig = defineConfig({
  test: {
    browser: {
      commands: {waitForTesterFrame},
      enabled: true,
      headless: true,
      instances: [{browser: "chromium"}],
      // Vitest 5 flipped the default to exact matching; the suites are written against the
      // substring, case-insensitive matching of Vitest 4.
      locators: {exact: false},
      provider: playwright(),
    },
    globals: true,
    setupFiles: [setupFile],
  },
});
