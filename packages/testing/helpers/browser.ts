import {onTestFinished} from "vitest";
import {page} from "vitest/browser";

export {render} from "vitest-browser-react";

/**
 * Vitest 5 sizes the Playwright page to the phone-sized tester iframe (Vitest 4 kept a 1280x720
 * page around it). Tests whose fixtures or pointer targets need more room call this; the previous
 * size comes back when the test finishes.
 */
export const desktopViewport = async () => {
  const {innerHeight, innerWidth} = window;

  await page.viewport(1280, 720);
  onTestFinished(() => page.viewport(innerWidth, innerHeight));
};
