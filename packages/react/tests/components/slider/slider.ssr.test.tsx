import {ssrSmoke} from "@sy-inc/testing/helpers";
import {I18nProvider} from "react-aria-components/I18nProvider";

import {Label} from "@/components/label";
import {Slider} from "@/components/slider";

import {IndicatorSlider} from "./fixtures";

describe("Slider SSR", () => {
  it("renders without hydration mismatch with a default value", async () => {
    const {html} = await ssrSmoke(
      <Slider data-testid="slider" defaultValue={30}>
        <Label>Volume</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>,
    );

    expect(html).toContain('data-slot="slider"');
    expect(html).toContain('data-slot="slider-thumb"');
  });

  it("renders range indicators in RTL without hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <I18nProvider locale="ar-AE">
        <IndicatorSlider defaultValue={[0.1, 0.2]} />
      </I18nProvider>,
    );

    expect(html).toContain('data-slot="slider-step"');
    expect(html).toContain('dir="rtl"');
  });
});
