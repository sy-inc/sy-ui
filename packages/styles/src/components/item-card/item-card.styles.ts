import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

const itemCardVariants = tv({
  defaultVariants: {variant: "default"},
  slots: {
    action: "item-card__action",
    base: "item-card",
    content: "item-card__content",
    description: "item-card__description",
    icon: "item-card__icon",
    title: "item-card__title",
  },
  variants: {
    variant: {
      default: {base: "item-card--default"},
      secondary: {base: "item-card--secondary"},
      tertiary: {base: "item-card--tertiary"},
      outline: {base: "item-card--outline"},
      transparent: {base: "item-card--transparent"},
    },
  },
});

export {itemCardVariants};
export type ItemCardVariants = VariantProps<typeof itemCardVariants>;
