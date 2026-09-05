import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const ratingVariants = tv({
  slots: {
    base: "rating",
    icon: "rating__icon",
    item: "rating__item",
    partial: "rating__icon-partial",
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: {base: "rating--lg", item: "rating__item--lg"},
      md: {base: "rating--md", item: "rating__item--md"},
      sm: {base: "rating--sm", item: "rating__item--sm"},
    },
  },
});

export type RatingVariants = VariantProps<typeof ratingVariants>;
