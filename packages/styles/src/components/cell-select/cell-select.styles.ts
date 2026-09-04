import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

/**
 * CellSelect renders a Select, so every element carries both the `select__*` and
 * the `cell-select__*` class. Only the layout deltas live in cell-select.css.
 *
 * There is no `variants` block: the surface treatment is owned by the underlying
 * `select` variant, so no cell class ever changes with it.
 */
export const cellSelectVariants = tv({
  slots: {
    base: "cell-select",
    indicator: "cell-select__indicator",
    label: "cell-select__label",
    trigger: "cell-select__trigger",
    value: "cell-select__value",
  },
});

export type CellSelectVariants = VariantProps<typeof cellSelectVariants> & {
  /** Surface treatment, forwarded to the underlying `Select`. */
  variant?: "default" | "secondary";
};
