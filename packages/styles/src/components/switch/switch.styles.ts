import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const switchVariants = tv({
  defaultVariants: {
    size: "md",
    variant: "default",
  },
  slots: {
    base: "switch",
    content: "switch__content",
    control: "switch__control",
    icon: "switch__icon",
    thumb: "switch__thumb",
  },
  variants: {
    size: {
      lg: {
        base: "switch--lg",
      },
      md: {
        base: "switch--md",
      },
      sm: {
        base: "switch--sm",
      },
    },
    variant: {
      cell: {
        base: "switch--cell",
      },
      "cell-secondary": {
        base: "switch--cell switch--cell-secondary",
      },
      default: {
        // No styles as this is the default variant
      },
    },
  },
});

export type SwitchVariants = VariantProps<typeof switchVariants>;
