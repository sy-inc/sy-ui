"use client";

import type {SliderRootProps} from "../slider";
import type {CellSliderVariants} from "@sy-inc/styles";
import type {ReactNode} from "react";

import {cellSliderVariants} from "@sy-inc/styles";

import {Label} from "../label";
import {Slider} from "../slider";

/**
 * Both variants are resolved once. The slots are constant per variant, and a
 * controlled slider re-renders on every drag frame, so nothing is rebuilt here.
 */
const slotsByVariant = {
  default: cellSliderVariants({variant: "default"}),
  secondary: cellSliderVariants({variant: "secondary"}),
};

/* -------------------------------------------------------------------------------------------------
 * CellSlider
 * -----------------------------------------------------------------------------------------------*/
interface CellSliderProps
  extends
    Omit<
      SliderRootProps,
      "children" | "defaultValue" | "onChange" | "onChangeEnd" | "orientation" | "value" | "variant"
    >,
    CellSliderVariants {
  defaultValue?: number;
  /**
   * Visible label rendered inside the cell. It also names the slider for
   * assistive technology, so `aria-label` is only needed when there is none.
   */
  label?: ReactNode;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  value?: number;
}

/**
 * Single-value slider styled as a settings cell. For a range, or any other
 * composition, use `<Slider variant="cell">` with the Slider parts directly.
 */
const CellSlider = ({label, variant = "default", ...props}: CellSliderProps) => {
  const slots = slotsByVariant[variant];

  return (
    <Slider
      {...(props as SliderRootProps)}
      data-slot="cell-slider"
      orientation="horizontal"
      variant="cell"
    >
      <Slider.Track className={slots.track()} data-slot="cell-slider-track">
        <Slider.Fill data-slot="cell-slider-fill" />
        <Slider.Thumb data-slot="cell-slider-thumb" />
        {label == null ? null : <Label className={slots.label()}>{label}</Label>}
        <Slider.Output data-slot="cell-slider-output" />
      </Slider.Track>
    </Slider>
  );
};

CellSlider.displayName = "SY INC.CellSlider";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {CellSlider};

export type {CellSliderProps};
