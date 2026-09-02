import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const listViewVariants = tv({
  defaultVariants: {
    variant: "primary",
  },
  slots: {
    base: "list-view",
    content: "list-view__content",
    description: "list-view__description",
    item: "list-view__item",
    section: "list-view__section",
    selection: "list-view__selection",
    title: "list-view__title",
  },
  variants: {
    variant: {
      primary: {
        base: "list-view--primary",
      },
      secondary: {
        base: "list-view--secondary",
      },
    },
  },
});

export type ListViewVariants = VariantProps<typeof listViewVariants>;
