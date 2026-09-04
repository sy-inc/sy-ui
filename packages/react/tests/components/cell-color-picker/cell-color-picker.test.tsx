import type {Color} from "@react-types/color";

import {cleanup, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";
import {parseColor} from "react-aria-components";

import {CellColorPicker} from "@/components/cell-color-picker";
import {ColorArea} from "@/components/color-area";
import {ColorSlider} from "@/components/color-slider";
import {ColorSwatchPicker} from "@/components/color-swatch-picker";
import {Label} from "@/components/label";

type FixtureProps = {
  isDisabled?: boolean;
  isInvalid?: boolean;
  onChange?: (color: Color) => void;
  ref?: React.Ref<HTMLDivElement>;
  triggerProps?: React.ComponentProps<typeof CellColorPicker.Trigger>;
  value?: Color;
  variant?: React.ComponentProps<typeof CellColorPicker>["variant"];
};

const Fixture = ({onChange, triggerProps, value, ...props}: FixtureProps) => (
  <CellColorPicker
    {...(value ? {value} : {defaultValue: "#3B82F6"})}
    onChange={onChange}
    {...props}
  >
    <CellColorPicker.Trigger {...triggerProps}>
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
      <ColorSwatchPicker aria-label="Presets" size="xs">
        <ColorSwatchPicker.Item color="#22C55E">
          <ColorSwatchPicker.Swatch />
        </ColorSwatchPicker.Item>
      </ColorSwatchPicker>
    </CellColorPicker.Popover>
  </CellColorPicker>
);

describe("CellColorPicker", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    user = setupUser({advanceTimers: vi.advanceTimersByTime});
  });

  afterEach(() => {
    cleanup();
    runAllTimers();
    vi.useRealTimers();
  });

  it("exposes its root, trigger, value display, and shared swatch", () => {
    const ref = createRef<HTMLDivElement>();

    render(<Fixture ref={ref} />);

    expect(ref.current).toHaveAttribute("data-slot", "cell-color-picker");
    expect(screen.getByRole("button", {name: /Accent.*#3B82F6/i})).toHaveAttribute(
      "data-slot",
      "cell-color-picker-trigger",
    );
    expect(screen.getByText("#3B82F6")).toHaveAttribute(
      "data-slot",
      "cell-color-picker-value-display",
    );
    expect(document.querySelector('[data-slot="color-swatch"]')).toBeInTheDocument();
  });

  it("connects shared Label and descriptions to the actual trigger", () => {
    render(
      <div>
        <Label id="accent-label">Accent color</Label>
        <Fixture
          triggerProps={{
            "aria-describedby": "color-description",
            "aria-labelledby": "accent-label",
          }}
        />
        <p id="color-description">Changes are applied immediately.</p>
      </div>,
    );
    const trigger = screen.getByRole("button", {name: /Accent/i});

    expect(trigger).toHaveAttribute("aria-labelledby", "accent-label");
    expect(trigger).toHaveAttribute("aria-describedby", "color-description");
  });

  it("updates the displayed value and calls onChange when a preset is selected", async () => {
    const onChange = vi.fn();

    render(<Fixture onChange={onChange} />);
    await user.click(screen.getByRole("button", {name: /Accent/i}));
    runAllTimers();
    await user.click(screen.getByRole("option"));

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByText("#22C55E")).toBeInTheDocument();
  });

  it("supports controlled updates", () => {
    const {rerender} = render(<Fixture value={parseColor("#3B82F6")} onChange={vi.fn()} />);

    expect(screen.getByText("#3B82F6")).toBeInTheDocument();
    rerender(<Fixture value={parseColor("#EF4444")} onChange={vi.fn()} />);
    expect(screen.getByText("#EF4444")).toBeInTheDocument();
  });

  it("exposes invalid state on the root and prevents disabled interaction", async () => {
    const onChange = vi.fn();

    render(<Fixture isDisabled isInvalid onChange={onChange} />);
    const trigger = screen.getByRole("button", {name: /Accent/i});

    // Invalid is styled from the root; the trigger is a button, which does not support aria-invalid.
    expect(document.querySelector('[data-slot="cell-color-picker"]')).toHaveAttribute(
      "data-invalid",
      "true",
    );
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("marks the root with the secondary variant class", () => {
    render(<Fixture variant="secondary" />);

    expect(document.querySelector('[data-slot="cell-color-picker"]')).toHaveClass(
      "cell-color-picker--secondary",
    );
  });

  it("opens with keyboard and restores focus after Escape", async () => {
    render(<Fixture />);
    const trigger = screen.getByRole("button", {name: /Accent/i});

    await user.tab();
    await user.keyboard("{Enter}");
    runAllTimers();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    runAllTimers();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
