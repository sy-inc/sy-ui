import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

const splitViewVariants = tv({
  defaultVariants: {
    variant: "transparent",
  },
  slots: {
    back: "split-view__back",
    base: "split-view",
    content: "split-view__content",
    layout: "split-view__layout",
    pane: "split-view__pane",
  },
  variants: {
    variant: {
      surface: {
        content: "split-view__content--surface",
        pane: "split-view__pane--surface",
      },
      transparent: {},
    },
  },
});

export {splitViewVariants};
export type SplitViewVariants = VariantProps<typeof splitViewVariants>;
