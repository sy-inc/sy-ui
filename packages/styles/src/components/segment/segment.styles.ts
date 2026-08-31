import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const segmentVariants = tv({
  defaultVariants: {separators: false, size: "md", variant: "default"},
  slots: {
    base: "segment",
    indicator: "segment__indicator",
    item: "segment__item",
  },
  variants: {
    separators: {
      false: {},
      true: {base: "segment--separators"},
    },
    size: {
      sm: {base: "segment--sm", item: "segment__item--sm"},
      md: {base: "segment--md", item: "segment__item--md"},
      lg: {base: "segment--lg", item: "segment__item--lg"},
    },
    variant: {
      default: {},
      ghost: {
        base: "segment--ghost",
        indicator: "segment__indicator--ghost",
        item: "segment__item--ghost",
      },
    },
  },
});

export type SegmentVariants = VariantProps<typeof segmentVariants>;
