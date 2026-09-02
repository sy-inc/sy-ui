import type {ComponentProps} from "react";

import {
  RadioButtonGroupIndicator,
  RadioButtonGroupItem,
  RadioButtonGroupItemContent,
  RadioButtonGroupItemIcon,
  RadioButtonGroupRoot,
} from "./radio-button-group";

export const RadioButtonGroup = Object.assign(RadioButtonGroupRoot, {
  Root: RadioButtonGroupRoot,
  Item: RadioButtonGroupItem,
  Indicator: RadioButtonGroupIndicator,
  ItemContent: RadioButtonGroupItemContent,
  ItemIcon: RadioButtonGroupItemIcon,
});

export type RadioButtonGroup = {
  Props: ComponentProps<typeof RadioButtonGroupRoot>;
  RootProps: ComponentProps<typeof RadioButtonGroupRoot>;
  ItemProps: ComponentProps<typeof RadioButtonGroupItem>;
  IndicatorProps: ComponentProps<typeof RadioButtonGroupIndicator>;
  ItemContentProps: ComponentProps<typeof RadioButtonGroupItemContent>;
  ItemIconProps: ComponentProps<typeof RadioButtonGroupItemIcon>;
};

export {
  RadioButtonGroupRoot,
  RadioButtonGroupItem,
  RadioButtonGroupIndicator,
  RadioButtonGroupItemContent,
  RadioButtonGroupItemIcon,
};
export type {
  RadioButtonGroupRootProps,
  RadioButtonGroupRootProps as RadioButtonGroupProps,
  RadioButtonGroupItemProps,
  RadioButtonGroupIndicatorProps,
  RadioButtonGroupItemContentProps,
  RadioButtonGroupItemIconProps,
} from "./radio-button-group";
export {radioButtonGroupVariants} from "@sy-inc/styles";
export type {RadioButtonGroupVariants} from "@sy-inc/styles";
