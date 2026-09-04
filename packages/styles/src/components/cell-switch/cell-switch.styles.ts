import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

/**
 * CellSwitch renders a `Switch` with `variant="cell"`, so every element already
 * carries the `switch__*` classes. Only the settings-cell deltas live here; the
 * row surface, hover, focus and secondary track tokens come from switch.css.
 */
export const cellSwitchVariants = tv({
  defaultVariants: {
    variant: "default",
  },
  slots: {
    badge: "cell-switch__badge",
    base: "cell-switch",
    copy: "cell-switch__copy",
  },
  variants: {
    variant: {
      default: {},
      feature: {base: "cell-switch--feature"},
      secondary: {},
    },
  },
});

export type CellSwitchVariants = VariantProps<typeof cellSwitchVariants>;

/** Maps a cell variant onto the `Switch` variant that paints the row surface. */
export const cellSwitchSurface = {
  default: "cell",
  feature: "cell",
  secondary: "cell-secondary",
} as const;
