import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

/**
 * CellSwitch renders a `Switch` with `variant="cell"`, so every element already
 * carries the `switch__*` classes. Only the settings-cell deltas live here; the
 * row surface, hover, focus and secondary track tokens come from switch.css.
 */
export const cellSwitchVariants = tv({
  defaultVariants: {
    compact: true,
    variant: "default",
  },
  slots: {
    badge: "cell-switch__badge",
    base: "cell-switch",
    copy: "cell-switch__copy",
  },
  variants: {
    /* A description adds a second line, so the row grows instead of the fixed compact height. */
    compact: {
      false: {},
      true: {base: "switch--cell-compact"},
    },
    variant: {
      default: {},
      feature: {base: "cell-switch--feature switch--cell-flat"},
      secondary: {},
    },
  },
});

/* `compact` is derived from `description`, so it is not a public prop. */
export type CellSwitchVariants = Omit<VariantProps<typeof cellSwitchVariants>, "compact">;

/** Maps a cell variant onto the `Switch` variant that paints the row surface. */
export const cellSwitchSurface = {
  default: "cell",
  feature: "cell",
  secondary: "cell-secondary",
} as const;
