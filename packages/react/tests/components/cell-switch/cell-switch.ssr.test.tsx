import {ssrSmoke} from "@sy-inc/testing/helpers";

import {CellSwitch} from "@/components/cell-switch";

describe("CellSwitch SSR", () => {
  it("renders selected feature content without a hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <CellSwitch
        badge="New"
        defaultSelected
        description="Keep your pages within reach."
        variant="feature"
      >
        Try the new sidebar
      </CellSwitch>,
    );

    expect(html).toContain('data-slot="switch"');
    expect(html).toContain('data-selected="true"');
    expect(html).toContain('data-slot="cell-switch-description"');
  });
});
