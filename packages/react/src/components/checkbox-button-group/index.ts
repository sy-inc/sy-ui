import type {ComponentProps} from "react";

import {
  CheckboxButtonGroupIndicator,
  CheckboxButtonGroupItem,
  CheckboxButtonGroupItemContent,
  CheckboxButtonGroupItemIcon,
  CheckboxButtonGroupRoot,
} from "./checkbox-button-group";

export const CheckboxButtonGroup = Object.assign(CheckboxButtonGroupRoot, {
  Root: CheckboxButtonGroupRoot,
  Item: CheckboxButtonGroupItem,
  Indicator: CheckboxButtonGroupIndicator,
  ItemContent: CheckboxButtonGroupItemContent,
  ItemIcon: CheckboxButtonGroupItemIcon,
});

export type CheckboxButtonGroup = {
  Props: ComponentProps<typeof CheckboxButtonGroupRoot>;
  RootProps: ComponentProps<typeof CheckboxButtonGroupRoot>;
  ItemProps: ComponentProps<typeof CheckboxButtonGroupItem>;
  IndicatorProps: ComponentProps<typeof CheckboxButtonGroupIndicator>;
  ItemContentProps: ComponentProps<typeof CheckboxButtonGroupItemContent>;
  ItemIconProps: ComponentProps<typeof CheckboxButtonGroupItemIcon>;
};

export {
  CheckboxButtonGroupRoot,
  CheckboxButtonGroupItem,
  CheckboxButtonGroupIndicator,
  CheckboxButtonGroupItemContent,
  CheckboxButtonGroupItemIcon,
};
export type {
  CheckboxButtonGroupRootProps,
  CheckboxButtonGroupRootProps as CheckboxButtonGroupProps,
  CheckboxButtonGroupItemProps,
  CheckboxButtonGroupIndicatorProps,
  CheckboxButtonGroupItemContentProps,
  CheckboxButtonGroupItemIconProps,
} from "./checkbox-button-group";
export {checkboxButtonGroupVariants} from "@sy-inc/styles";
export type {CheckboxButtonGroupVariants} from "@sy-inc/styles";
