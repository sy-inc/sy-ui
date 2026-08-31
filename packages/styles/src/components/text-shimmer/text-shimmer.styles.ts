import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const textShimmerVariants = tv(
  {
    base: "text-shimmer",
  },
  // tailwind-merge parses the `text-shimmer` block name as a `text-{color}` utility,
  // so a caller passing `text-accent` would drop it. There are no Tailwind utilities
  // in `base` for it to merge anyway.
  {twMerge: false},
);

export type TextShimmerVariants = VariantProps<typeof textShimmerVariants>;
