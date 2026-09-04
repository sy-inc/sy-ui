import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const sliderVariants = tv({
  defaultVariants: {
    variant: "default",
  },
  slots: {
    base: "",
    fill: "",
    marks: "",
    output: "",
    thumb: "",
    track: "",
  },
  variants: {
    /**
     * Swaps the whole BEM namespace instead of appending to it, so a preset
     * never carries two stylesheets' classes on the same node. Appending would
     * force every preset to out-specify `.slider .slider__*` by hand.
     */
    variant: {
      cell: {
        base: "cell-slider",
        fill: "cell-slider__fill",
        output: "cell-slider__output",
        thumb: "cell-slider__thumb",
        track: "cell-slider__track",
      },
      default: {
        base: "slider",
        fill: "slider__fill",
        marks: "slider__marks",
        output: "slider__output",
        thumb: "slider__thumb",
        track: "slider__track",
      },
    },
  },
});

export type SliderVariants = VariantProps<typeof sliderVariants>;
