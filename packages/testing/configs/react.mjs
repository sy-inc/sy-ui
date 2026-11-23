import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {defineConfig} from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const setupFile = join(__dirname, "../setup/react.ts");

/** jsdom defaults for React UI packages. */
export const uiConfig = defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [setupFile],
  },
});
