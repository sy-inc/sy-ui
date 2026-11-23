/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />
/// <reference types="@vitest/browser-playwright" />

import "vitest";

declare module "vitest/internal/browser" {
  interface BrowserCommands {
    /** Registered in configs/browser.mjs; called once per file by setup/browser.ts. */
    waitForTesterFrame: (href: string) => Promise<void>;
  }
}

// jest-dom (jsdom suites) and @vitest/browser (browser suites) both extend `Assertion` with
// same-named matchers. Under Vitest 5 the narrower browser signatures win and reject what the
// jest-dom runtime accepts in jsdom: CSS custom properties in `toHaveStyle` and a RegExp in
// `toHaveTextContent`. Widen the two signatures that differ.
declare module "vitest" {
  // The type parameters must repeat Vitest's own declaration to merge with it.
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface Assertion<R extends void | Promise<void> = void, T = unknown> {
    toHaveStyle(css: string | Partial<CSSStyleDeclaration> | Record<string, unknown>): R;
    toHaveTextContent(text?: string | number | RegExp, options?: {normalizeWhitespace: boolean}): R;
  }
}
