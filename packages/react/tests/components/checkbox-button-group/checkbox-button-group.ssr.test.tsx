import {ssrSmoke} from "@sy-inc/testing/helpers";

import {CheckboxButtonGroup} from "@/components/checkbox-button-group";

describe("CheckboxButtonGroup SSR", () => {
  it("renders the selected compound tree", async () => {
    const {html} = await ssrSmoke(
      <CheckboxButtonGroup aria-label="Features" defaultValue={["security"]}>
        <CheckboxButtonGroup.Item value="security">
          <CheckboxButtonGroup.Indicator />
          <CheckboxButtonGroup.ItemContent>Security</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>,
    );

    expect(html).toContain('data-slot="checkbox-button-group"');
    expect(html).toContain('data-slot="checkbox-button-group-item"');
  });
});
