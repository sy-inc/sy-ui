import {ssrSmoke} from "@sy-inc/testing/helpers";

import {ImagePreviewFixture} from "./fixtures";

describe("ImagePreview SSR", () => {
  beforeEach(() => {
    // Keep the browser-only decoder pending while verifying server markup hydration.
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: () => new Promise(() => {}),
    });
  });
  afterEach(() => Reflect.deleteProperty(HTMLImageElement.prototype, "decode"));

  it("renders a default-open thumbnail without accessing browser layout during server render", async () => {
    const {html} = await ssrSmoke(<ImagePreviewFixture defaultOpen />);

    expect(html).toContain('alt="Mountain lake"');
    expect(html).toContain('data-slot="image-preview"');
    expect(html).not.toContain("<dialog");
  });
});
