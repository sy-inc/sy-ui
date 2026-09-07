import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const textAreaVariants = tv({
  base: "textarea",
  defaultVariants: {
    autoGrow: false,
    fullWidth: false,
    variant: "primary",
  },
  variants: {
    autoGrow: {
      false: "",
      true: "textarea--auto-grow",
    },
    fullWidth: {
      false: "",
      true: "textarea--full-width",
    },
    variant: {
      primary: "textarea--primary",
      secondary: "textarea--secondary",
    },
  },
});

export type TextAreaVariants = VariantProps<typeof textAreaVariants>;
