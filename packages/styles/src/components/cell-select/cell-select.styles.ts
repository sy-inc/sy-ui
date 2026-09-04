import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

/**
 * CellSelect renders a Select, so every element carries both the `select__*` and
 * the `cell-select__*` class. Only the layout deltas live in cell-select.css.
 */
export const cellSelectVariants = tv({
  defaultVariants: {variant: "default"},
  slots: {
    base: "cell-select",
    indicator: "cell-select__indicator",
    label: "cell-select__label",
    trigger: "cell-select__trigger",
    value: "cell-select__value",
  },
  variants: {
    /* Surface treatment comes from the underlying select variant; this only types the public API. */
    variant: {default: {}, secondary: {}},
  },
});

export type CellSelectVariants = VariantProps<typeof cellSelectVariants>;
