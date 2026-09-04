import type {VariantProps} from "tailwind-variants";
import {tv} from "tailwind-variants";

/**
 * CellColorPicker renders a ColorPicker, so every element carries both the
 * `color-picker__*` and the `cell-color-picker__*` class. The variant only
 * marks the root - the surface delta lives in cell-color-picker.css.
 */
export const cellColorPickerVariants = tv({
  defaultVariants: {variant: "default"},
  slots: {
    base: "cell-color-picker",
    popover: "cell-color-picker__popover",
    swatch: "cell-color-picker__swatch",
    trigger: "cell-color-picker__trigger",
    valueDisplay: "cell-color-picker__value-display",
  },
  variants: {
    variant: {
      default: {},
      secondary: {base: "cell-color-picker--secondary"},
    },
  },
});
export type CellColorPickerVariants = VariantProps<typeof cellColorPickerVariants>;
