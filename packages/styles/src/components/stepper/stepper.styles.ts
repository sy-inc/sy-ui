import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const stepperVariants = tv({
  defaultVariants: {
    color: "accent",
    isDisabled: false,
    orientation: "horizontal",
    separatorMode: "spaced",
    size: "md",
    variant: "primary",
  },
  slots: {
    base: "stepper",
    content: "stepper__content",
    description: "stepper__description",
    indicator: "stepper__indicator",
    item: "stepper__item",
    list: "stepper__list",
    separator: "stepper__separator",
    separatorFill: "stepper__separator-fill",
    spinner: "stepper__spinner",
    statusLabel: "stepper__status-label",
    title: "stepper__title",
    trigger: "stepper__trigger",
  },
  variants: {
    color: {
      accent: {base: "stepper--accent"},
      danger: {base: "stepper--danger"},
      default: {base: "stepper--default"},
      success: {base: "stepper--success"},
      warning: {base: "stepper--warning"},
    },
    isDisabled: {
      true: {base: "stepper--disabled"},
    },
    orientation: {
      horizontal: {base: "stepper--horizontal"},
      vertical: {base: "stepper--vertical"},
    },
    separatorMode: {
      connected: {base: "stepper--connected"},
      spaced: {base: "stepper--spaced"},
    },
    size: {
      lg: {base: "stepper--lg"},
      md: {base: "stepper--md"},
      sm: {base: "stepper--sm"},
    },
    variant: {
      dot: {base: "stepper--dot"},
      primary: {base: "stepper--primary"},
      secondary: {base: "stepper--secondary"},
      soft: {base: "stepper--soft"},
    },
  },
});

export type StepperVariants = VariantProps<typeof stepperVariants>;
