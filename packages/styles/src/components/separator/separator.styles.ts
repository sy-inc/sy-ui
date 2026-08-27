import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

const separatorVariants = tv({
  base: "separator",
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
  },
  variants: {
    orientation: {
      horizontal: "separator--horizontal",
      vertical: "separator--vertical",
    },
    variant: {
      default: "separator--default",
      secondary: "separator--secondary",
      tertiary: "separator--tertiary",
    },
  },
});

const separatorContentVariants = tv({
  defaultVariants: {
    variant: "default",
  },
  slots: {
    container: "separator__container",
    content: "separator__content",
    line: "separator separator__line",
  },
  variants: {
    variant: {
      default: {
        line: "separator--horizontal separator--default",
      },
      secondary: {
        line: "separator--horizontal separator--secondary",
      },
      tertiary: {
        line: "separator--horizontal separator--tertiary",
      },
    },
  },
});

export {separatorVariants};
export type SeparatorVariants = VariantProps<typeof separatorVariants>;

export {separatorContentVariants};
export type SeparatorContentVariants = VariantProps<typeof separatorContentVariants>;
