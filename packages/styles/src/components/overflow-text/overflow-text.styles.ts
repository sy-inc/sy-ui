import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const overflowTextVariants = tv({
  slots: {
    base: "overflow-text",
    content: "overflow-text__content",
    // The edge fades and the hidden scrollbar reuse scroll-shadow; only the fade size differs.
    viewport:
      "overflow-text__viewport scroll-shadow scroll-shadow--horizontal scroll-shadow--fade scroll-shadow--hide-scrollbar",
  },
});

export type OverflowTextVariants = VariantProps<typeof overflowTextVariants>;
