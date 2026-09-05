import {ssrSmoke} from "@sy-inc/testing/helpers";

import {OverflowText} from "@/components/overflow-text";

describe("OverflowText SSR", () => {
  it("renders full text without hydration mismatch", async () => {
    const {html} = await ssrSmoke(<OverflowText>Quarterly revenue report</OverflowText>);

    expect(html).toContain("Quarterly revenue report");
    expect(html).toContain('data-slot="overflow-text"');
  });
});
