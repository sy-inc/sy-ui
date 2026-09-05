import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const kpiGroupVariants = tv({
  defaultVariants: {
    orientation: "horizontal",
  },
  slots: {
    base: "kpi-group",
  },
  variants: {
    orientation: {
      horizontal: {base: "kpi-group--horizontal"},
      vertical: {base: "kpi-group--vertical"},
    },
  },
});

export type KPIGroupVariants = VariantProps<typeof kpiGroupVariants>;
