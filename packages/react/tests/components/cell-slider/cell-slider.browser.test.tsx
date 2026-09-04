import {render} from "@sy-inc/testing/browser";

import {CellSlider} from "@/components/cell-slider";

import "../../../../styles/dist/sy-inc.min.css";

const thumbIndicator = () =>
  getComputedStyle(document.querySelector('[data-slot="cell-slider-thumb"]')!, "::after");

/* The variant restyles the track surface; the fill tone is shared by both. */
const trackStyle = () =>
  getComputedStyle(document.querySelector('[data-slot="cell-slider-track"]')!);

describe("CellSlider (browser)", () => {
  it("renders the thumb as a hairline indicator, not the base slider pill", async () => {
    await render(<CellSlider defaultValue={0.5} label="Opacity" maxValue={1} step={0.01} />);

    const indicator = thumbIndicator();

    // The base slider thumb is 24x16 with a field shadow; the cell thumb is a 2px bar.
    expect(indicator.width).toBe("2px");
    expect(indicator.height).toBe("16px");
    expect(indicator.boxShadow).toBe("none");
  });

  it("gives the secondary variant its own track surface", async () => {
    const {unmount} = await render(
      <CellSlider defaultValue={0.5} label="Opacity" maxValue={1} step={0.01} />,
    );
    const {backgroundColor: defaultBackground, boxShadow: defaultShadow} = trackStyle();

    unmount();

    await render(
      <CellSlider
        defaultValue={0.5}
        label="Opacity"
        maxValue={1}
        step={0.01}
        variant="secondary"
      />,
    );

    const secondary = trackStyle();

    expect(secondary.backgroundColor).not.toBe(defaultBackground);
    /* `shadow-none` zeroes the shadow chain rather than dropping the property. */
    expect(secondary.boxShadow).not.toBe(defaultShadow);
  });
});
