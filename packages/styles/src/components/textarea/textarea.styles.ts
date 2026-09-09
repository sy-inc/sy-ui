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
      /** No border, background, shadow or focus ring: for a composer shell that owns the chrome. */
      bare: "textarea--bare",
      primary: "textarea--primary",
      secondary: "textarea--secondary",
    },
  },
});

export type TextAreaVariants = VariantProps<typeof textAreaVariants>;
