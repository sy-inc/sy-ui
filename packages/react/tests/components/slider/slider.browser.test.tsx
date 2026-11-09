import {render} from "@sy-inc/testing/browser";
import {I18nProvider} from "react-aria-components/I18nProvider";
import {page, userEvent} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {IndicatorSlider} from "./fixtures";

const cases = (["horizontal", "vertical"] as const).flatMap((orientation) =>
  (["ltr", "rtl"] as const).map((dir) => ({orientation, dir})),
);
const elements = (slot: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-slot="slider-${slot}"]`),
];

describe("Slider (browser)", () => {
  it.each(cases)(
    "supports aligned $orientation $dir marks, dots, thumbs and range fill",
    async ({dir, orientation}) => {
      const vertical = orientation === "vertical";

      await render(
        <I18nProvider locale={dir === "rtl" ? "ar-AE" : "en-US"}>
          <div dir={dir} style={{width: 400, height: 320}}>
            <IndicatorSlider defaultValue={[0.1, 0.2]} orientation={orientation} />
          </div>
        </I18nProvider>,
      );
      const center = (el: Element) => {
        const r = el.getBoundingClientRect();

        return vertical ? r.top + r.height / 2 : r.left + r.width / 2;
      };
      const thumbCenters = elements("thumb")
        .map(center)
        .sort((a, b) => a - b);
      const fill = elements("fill")[0]!.getBoundingClientRect();

      expect(vertical ? fill.top : fill.left).toBeCloseTo(thumbCenters[0]!, 0);
      expect(vertical ? fill.bottom : fill.right).toBeCloseTo(thumbCenters[1]!, 0);
      const dotCenters = elements("step")
        .slice(1, 3)
        .map(center)
        .sort((a, b) => a - b);

      dotCenters.forEach((point, i) => expect(point).toBeCloseTo(thumbCenters[i]!, 0));
      const mark = elements("mark").find((el) => el.dataset["value"] === "0.15")!;

      expect(center(mark)).toBeCloseTo((thumbCenters[0]! + thumbCenters[1]!) / 2, 0);
      expect(elements("mark")[0]!.getBoundingClientRect().width).toBeGreaterThan(0);
    },
  );

  it("supports locale-only RTL fill, end cap, and arrow keys without a dir wrapper", async () => {
    await render(
      <I18nProvider locale="ar-AE">
        <div style={{width: 400}}>
          <IndicatorSlider defaultValue={0.2} />
        </div>
      </I18nProvider>,
    );
    const track = elements("track")[0]!;
    const fill = elements("fill")[0]!;
    const thumb = page.getByRole("slider", {name: /^Level 1/});
    const assertFillFromRight = () => {
      const trackStyle = getComputedStyle(track);
      const fillRect = fill.getBoundingClientRect();
      const thumbRect = elements("thumb")[0]!.getBoundingClientRect();

      expect(fillRect.right).toBeCloseTo(
        track.getBoundingClientRect().right - parseFloat(trackStyle.borderRightWidth),
        0,
      );
      expect(fillRect.left).toBeCloseTo(thumbRect.left + thumbRect.width / 2, 0);
      expect(trackStyle.borderRightColor).toBe(getComputedStyle(fill).backgroundColor);
      expect(trackStyle.borderLeftColor).toBe("rgba(0, 0, 0, 0)");
    };

    expect(getComputedStyle(document.documentElement).direction).toBe("ltr");
    assertFillFromRight();
    await userEvent.tab();
    await expect.element(thumb).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(thumb).toHaveValue("0.1");
    assertFillFromRight();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(thumb).toHaveValue("0.2");
  });
});
