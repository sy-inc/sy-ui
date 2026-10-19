import {ssrSmoke} from "@sy-inc/testing/helpers";

import {TocFixture} from "./fixtures";

describe("ContentToc SSR", () => {
  it("renders the sidebar outline and hydrates without mismatch", async () => {
    const {html} = await ssrSmoke(<TocFixture />);

    expect(html).toContain('aria-label="On this page"');
    expect(html).toContain('aria-current="location"');
    expect(html).toContain("Next steps");
  });

  it("renders the floating trigger and hydrates without mismatch", async () => {
    const {html} = await ssrSmoke(<TocFixture presentation="floating" />);

    expect(html).toContain('data-slot="content-toc-trigger"');
    expect(html).toContain("Anchors");
  });
});
