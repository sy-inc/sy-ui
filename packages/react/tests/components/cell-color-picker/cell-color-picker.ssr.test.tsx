import {ssrSmoke} from "@sy-inc/testing/helpers";

import {CellColorPicker} from "@/components/cell-color-picker";

describe("CellColorPicker SSR", () => {
  it("renders the stable root and default value when closed", async () => {
    const {html} = await ssrSmoke(
      <CellColorPicker defaultValue="#3B82F6">
        <CellColorPicker.Trigger>
          <span>Accent</span>
          <CellColorPicker.ValueDisplay />
          <CellColorPicker.Swatch />
        </CellColorPicker.Trigger>
        <CellColorPicker.Popover>
          <span />
        </CellColorPicker.Popover>
      </CellColorPicker>,
    );

    expect(html).toContain('data-slot="cell-color-picker"');
    expect(html).toContain('data-slot="cell-color-picker-trigger"');
    expect(html).toContain("#3B82F6");
  });
});
