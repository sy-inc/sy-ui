import type {VariantProps} from "tailwind-variants";
import {tv} from "tailwind-variants";

export const TimePickerVariants = tv({
  base: "inline-flex items-center justify-center",
  variants: {
    variant: {
      default: "bg-background text-foreground",
      primary: "bg-primary text-primary-foreground",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type TimePickerVariantProps = VariantProps<typeof TimePickerVariants>;
