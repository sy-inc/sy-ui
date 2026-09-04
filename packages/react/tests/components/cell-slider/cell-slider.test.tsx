import type {CellSliderProps} from "@/components/cell-slider";

import {act, render, screen, setupUser} from "@sy-inc/testing/helpers";

import {CellSlider} from "@/components/cell-slider";

const renderCellSlider = (props: Partial<CellSliderProps> = {}) =>
  render(
    <CellSlider
      data-testid="cell-slider"
      defaultValue={0.5}
      label="Opacity"
      maxValue={1}
      minValue={0}
      step={0.1}
      {...props}
    />,
  );

describe("CellSlider", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  describe("structure", () => {
    it("renders every public part behind its data-slot hook", () => {
      renderCellSlider();

      const root = screen.getByTestId("cell-slider");

      expect(root).toHaveAttribute("data-slot", "cell-slider");
      expect(root).toHaveAttribute("data-orientation", "horizontal");

      for (const slot of [
        "cell-slider-track",
        "cell-slider-fill",
        "cell-slider-thumb",
        "cell-slider-output",
      ]) {
        expect(document.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
      }
    });

    it("renders only the cell namespace, never the base slider classes", () => {
      renderCellSlider();

      expect(screen.getByTestId("cell-slider").className).not.toMatch(/(^|\s)slider(__|\s|$)/);
      expect(document.querySelector('[data-slot="cell-slider-thumb"]')).not.toHaveClass(
        "slider__thumb",
      );
    });
  });

  describe("labelling", () => {
    it("names the slider with the visible label, without aria-label", () => {
      renderCellSlider();

      expect(screen.getByRole("slider", {name: "Opacity"})).toBeInTheDocument();
      expect(screen.getByText("Opacity")).toBeInTheDocument();
    });

    it("supports aria-label when no visible label is rendered", () => {
      renderCellSlider({"aria-label": "Opacity", label: undefined});

      expect(screen.getByRole("slider", {name: "Opacity"})).toBeInTheDocument();
      expect(screen.queryByText("Opacity")).toBeNull();
    });
  });

  describe("value", () => {
    it("exposes the default value through the thumb and output", () => {
      renderCellSlider();

      expect(screen.getByRole("slider", {name: "Opacity"})).toHaveValue("0.5");
      expect(document.querySelector('[data-slot="cell-slider-output"]')).toHaveTextContent("0.5");
    });

    it("supports controlled values and updates the output", () => {
      const {rerender} = renderCellSlider({step: 0.01, value: 0.25});

      expect(screen.getByRole("slider", {name: "Opacity"})).toHaveValue("0.25");
      expect(document.querySelector('[data-slot="cell-slider-output"]')).toHaveTextContent("0.25");

      rerender(
        <CellSlider
          data-testid="cell-slider"
          label="Opacity"
          maxValue={1}
          minValue={0}
          step={0.01}
          value={0.75}
        />,
      );

      expect(screen.getByRole("slider", {name: "Opacity"})).toHaveValue("0.75");
      expect(document.querySelector('[data-slot="cell-slider-output"]')).toHaveTextContent("0.75");
    });

    it("calls onChange when keyboard input follows the configured step", async () => {
      const onChange = vi.fn();

      renderCellSlider({onChange});
      const slider = screen.getByRole("slider", {name: "Opacity"});

      await act(async () => {
        slider.focus();
      });
      await user.keyboard("{ArrowRight}");

      expect(onChange).toHaveBeenLastCalledWith(0.6);
      expect(slider).toHaveValue("0.6");

      await user.keyboard("{ArrowLeft}");
      expect(onChange).toHaveBeenLastCalledWith(0.5);
      expect(slider).toHaveValue("0.5");
    });

    it("supports integer values and step changes", async () => {
      const onChange = vi.fn();

      renderCellSlider({defaultValue: 75, label: "Volume", maxValue: 100, onChange, step: 1});
      const slider = screen.getByRole("slider", {name: "Volume"});

      expect(slider).toHaveValue("75");
      expect(document.querySelector('[data-slot="cell-slider-output"]')).toHaveTextContent("75");

      await act(async () => {
        slider.focus();
      });
      await user.keyboard("{ArrowRight}");

      expect(onChange).toHaveBeenLastCalledWith(76);
      expect(slider).toHaveValue("76");
    });

    it("keeps disabled sliders unchanged", async () => {
      const onChange = vi.fn();

      renderCellSlider({isDisabled: true, onChange});
      const slider = screen.getByRole("slider", {name: "Opacity"});

      expect(slider).toBeDisabled();
      expect(document.querySelector('[data-slot="cell-slider-track"]')).toHaveAttribute(
        "data-disabled",
        "true",
      );

      await act(async () => {
        slider.focus();
      });
      await user.keyboard("{ArrowRight}");

      expect(onChange).not.toHaveBeenCalled();
      expect(slider).toHaveValue("0.5");
    });
  });

  describe("variants", () => {
    it("applies the secondary track modifier only when requested", () => {
      const {rerender} = renderCellSlider();

      expect(document.querySelector('[data-slot="cell-slider-track"]')).not.toHaveClass(
        "cell-slider__track--secondary",
      );

      rerender(
        <CellSlider
          data-testid="cell-slider"
          defaultValue={0.5}
          label="Opacity"
          maxValue={1}
          minValue={0}
          step={0.1}
          variant="secondary"
        />,
      );

      expect(document.querySelector('[data-slot="cell-slider-track"]')).toHaveClass(
        "cell-slider__track--secondary",
      );
    });
  });
});
