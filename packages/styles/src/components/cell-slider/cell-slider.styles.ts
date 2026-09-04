import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

/**
 * Only the parts CellSlider adds on top of `sliderVariants({variant: "cell"})`:
 * the in-track label and the track tone modifier.
 */
export const cellSliderVariants = tv({
  defaultVariants: {
    variant: "default",
  },
  slots: {
    label: "cell-slider__label",
    track: "",
  },
  variants: {
    variant: {
      default: {},
      secondary: {
        track: "cell-slider__track--secondary",
      },
    },
  },
});

export type CellSliderVariants = VariantProps<typeof cellSliderVariants>;
