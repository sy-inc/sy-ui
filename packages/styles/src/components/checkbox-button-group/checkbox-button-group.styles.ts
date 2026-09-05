import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const checkboxButtonGroupVariants = tv({
  slots: {
    base: "checkbox-button-group",
    item: "checkbox-button-group__item",
    indicator: "checkbox-button-group__indicator",
    itemContent: "checkbox-button-group__item-content",
    itemIcon: "checkbox-button-group__item-icon",
  },
  defaultVariants: {layout: "flex"},
  variants: {layout: {flex: {}, grid: {base: "checkbox-button-group--grid"}}},
});

export type CheckboxButtonGroupVariants = VariantProps<typeof checkboxButtonGroupVariants>;
