import {render} from "@sy-inc/testing/browser";

import {CellSlider} from "@/components/cell-slider";

import "../../../../styles/dist/sy-inc.min.css";

const thumbIndicator = () =>
  getComputedStyle(document.querySelector('[data-slot="cell-slider-thumb"]')!, "::after");

const fillBackground = () =>
  getComputedStyle(document.querySelector('[data-slot="cell-slider-fill"]')!).backgroundColor;

describe("CellSlider (browser)", () => {
  it("renders the thumb as a hairline indicator, not the base slider pill", async () => {
    await render(<CellSlider defaultValue={0.5} label="Opacity" maxValue={1} step={0.01} />);

    const indicator = thumbIndicator();

    // The base slider thumb is 24x16 with a field shadow; the cell thumb is a 2px bar.
    expect(indicator.width).toBe("2px");
    expect(indicator.height).toBe("16px");
    expect(indicator.boxShadow).toBe("none");
  });

  it("gives the secondary variant its own fill colour", async () => {
    const {unmount} = await render(
      <CellSlider defaultValue={0.5} label="Opacity" maxValue={1} step={0.01} />,
    );
    const defaultFill = fillBackground();

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

    expect(fillBackground()).not.toBe(defaultFill);
  });
});
