import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const radioButtonGroupVariants = tv({
  slots: {
    base: "radio-button-group",
    item: "radio-button-group__item border-border bg-surface",
    indicator: "radio-button-group__indicator",
    itemContent: "radio-button-group__item-content",
    itemIcon: "radio-button-group__item-icon",
  },
  defaultVariants: {layout: "flex"},
  variants: {
    // The default lives in the base class; `flex` is intentionally empty.
    layout: {flex: {}, grid: {base: "radio-button-group--grid"}},
  },
});

export type RadioButtonGroupVariants = VariantProps<typeof radioButtonGroupVariants>;
