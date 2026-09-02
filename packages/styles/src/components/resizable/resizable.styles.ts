import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const resizableVariants = tv({
  base: "resizable",
  defaultVariants: {
    orientation: "horizontal",
  },
  variants: {
    orientation: {
      horizontal: "resizable--horizontal",
      vertical: "resizable--vertical",
    },
  },
});

export type ResizableVariants = VariantProps<typeof resizableVariants>;

export const resizablePanelVariants = tv({
  base: "resizable__panel",
});

export type ResizablePanelVariants = VariantProps<typeof resizablePanelVariants>;

export const resizableHandleVariants = tv({
  defaultVariants: {
    type: "line",
  },
  slots: {
    base: "resizable__handle",
    indicator: "resizable__handle-indicator",
  },
  variants: {
    // Only the indicator differs; the divider itself is identical for every type.
    type: {
      drag: {indicator: "resizable__handle-indicator--drag"},
      line: {},
      pill: {indicator: "resizable__handle-indicator--pill"},
    },
  },
});

export type ResizableHandleVariants = VariantProps<typeof resizableHandleVariants>;
