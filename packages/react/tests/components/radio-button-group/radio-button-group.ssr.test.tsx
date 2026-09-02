import {ssrSmoke} from "@sy-inc/testing/helpers";
import {RadioButtonGroup} from "@/components/radio-button-group";
describe("RadioButtonGroup SSR", () => {
  it("renders the default selected compound tree", async () => {
    const {html} = await ssrSmoke(
      <RadioButtonGroup aria-label="Plan" defaultValue="basic">
        <RadioButtonGroup.Item value="basic">
          <RadioButtonGroup.Indicator />
          <RadioButtonGroup.ItemContent>Basic</RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      </RadioButtonGroup>,
    );
    expect(html).toContain('data-slot="radio-button-group"');
    expect(html).toContain('data-slot="radio-button-group-item"');
  });
});
