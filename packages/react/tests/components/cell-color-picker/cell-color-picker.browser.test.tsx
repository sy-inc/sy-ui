import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {CellColorPicker} from "@/components/cell-color-picker";
import {ColorArea} from "@/components/color-area";
import {ColorSlider} from "@/components/color-slider";

describe("CellColorPicker (browser)", () => {
  it("renders the portal and restores trigger focus on Escape", async () => {
    await render(
      <CellColorPicker defaultValue="#3B82F6">
        <CellColorPicker.Trigger>
          <span>Accent</span>
          <CellColorPicker.ValueDisplay />
          <CellColorPicker.Swatch />
        </CellColorPicker.Trigger>
        <CellColorPicker.Popover>
          <ColorArea
            aria-label="Color area"
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
          >
            <ColorArea.Thumb />
          </ColorArea>
          <ColorSlider aria-label="Hue" channel="hue" colorSpace="hsb">
            <ColorSlider.Track>
              <ColorSlider.Thumb />
            </ColorSlider.Track>
          </ColorSlider>
        </CellColorPicker.Popover>
      </CellColorPicker>,
    );
    const trigger = page.getByRole("button", {name: /Accent/i});

    await trigger.click();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });
});
