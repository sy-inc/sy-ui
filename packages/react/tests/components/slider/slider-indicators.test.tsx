import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";
import {I18nProvider} from "react-aria-components/I18nProvider";

import {Slider} from "@/components/slider";

import {IndicatorSlider} from "./fixtures";

const steps = () => [...document.querySelectorAll<HTMLElement>('[data-slot="slider-step"]')];
const filled = () =>
  steps()
    .filter((step) => step.dataset["filled"] === "true")
    .map((step) => Number(step.dataset["value"]));

describe("Slider", () => {
  it("renders decimal steps exactly and updates filled state with keyboard input", async () => {
    const user = setupUser();

    render(<IndicatorSlider />);
    expect(steps().map((step) => step.dataset["value"])).toEqual(["0", "0.1", "0.2", "0.3"]);
    expect(filled()).toEqual([0, 0.1, 0.2]);
    expect(document.querySelector('[data-slot="slider-steps"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(document.querySelector('[data-slot="slider-mark"][data-value="0.15"]')).toHaveAttribute(
      "data-filled",
      "true",
    );
    await user.tab();
    expect(screen.getByRole("slider", {name: /^Level 1/})).toHaveFocus();
    await user.keyboard("{End}");
    expect(filled()).toEqual([0, 0.1, 0.2, 0.3]);
    await user.keyboard("{Home}");
    expect(filled()).toEqual([0]);
  });

  it("supports controlled range and changing steps", () => {
    const {rerender} = render(<IndicatorSlider value={[0.1, 0.2]} />);

    expect(filled()).toEqual([0.1, 0.2]);
    rerender(<IndicatorSlider step={0.05} value={[0.15, 0.3]} />);
    expect(filled()).toEqual([0.15, 0.2, 0.25, 0.3]);
    expect(steps()).toHaveLength(7);
  });

  it.each([
    {
      minValue: -0.3,
      maxValue: 0.3,
      step: 0.1,
      expected: ["-0.3", "-0.2", "-0.1", "0", "0.1", "0.2", "0.3"],
    },
    {minValue: 1e-7, maxValue: 4e-7, step: 1e-7, expected: ["1e-7", "2e-7", "3e-7", "4e-7"]},
    {minValue: 0, maxValue: 0.35, step: 0.1, expected: ["0", "0.1", "0.2", "0.3"]},
    {minValue: 2, maxValue: 2, step: 1, expected: ["2"]},
  ])("supports bounded dot generation for $minValue–$maxValue", ({expected, ...props}) => {
    render(<IndicatorSlider defaultValue={props.minValue} {...props} />);
    expect(steps().map((step) => step.dataset["value"])).toEqual(expected);
  });

  it("renders no automatic dots above the 1000 limit while retaining the slider", () => {
    const {rerender} = render(<IndicatorSlider defaultValue={0} maxValue={999} step={1} />);

    expect(steps()).toHaveLength(1000);
    rerender(<IndicatorSlider defaultValue={0} maxValue={1000} step={1} />);
    expect(steps()).toHaveLength(0);
    expect(screen.getByRole("slider", {name: /^Level 1/})).toBeInTheDocument();
  });

  it("supports arbitrary Marks children and custom rendering with localized default labels", () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <I18nProvider locale="de-DE">
        <Slider
          aria-label="Price"
          defaultValue={25}
          formatOptions={{style: "currency", currency: "EUR"}}
        >
          <Slider.Track>
            <Slider.Thumb />
          </Slider.Track>
          <Slider.Marks data-testid="marks">
            <span>Arbitrary content</span>
            <Slider.Mark<"span"> ref={ref} render={(props) => <span {...props} />} value={25} />
            <Slider.Mark value={50}>Custom</Slider.Mark>
            <Slider.Mark value={-1}>Outside</Slider.Mark>
            <Slider.Mark value={Infinity}>Invalid</Slider.Mark>
          </Slider.Marks>
        </Slider>
      </I18nProvider>,
    );
    expect(screen.getByText("Arbitrary content")).toBeInTheDocument();
    expect(ref.current?.tagName).toBe("SPAN");
    expect(ref.current?.textContent).toBe(
      new Intl.NumberFormat("de-DE", {style: "currency", currency: "EUR"}).format(25),
    );
    expect(screen.getByText("Custom")).not.toHaveAttribute("data-filled");
    expect(screen.queryByText("Outside")).not.toBeInTheDocument();
    expect(screen.queryByText("Invalid")).not.toBeInTheDocument();
  });
});
