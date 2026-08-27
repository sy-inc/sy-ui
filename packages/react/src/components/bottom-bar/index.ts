import type {ComponentProps} from "react";

import {BottomBarIcon, BottomBarItem, BottomBarLabel, BottomBarRoot} from "./bottom-bar";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const BottomBar = Object.assign(BottomBarRoot, {
  Icon: BottomBarIcon,
  Item: BottomBarItem,
  Label: BottomBarLabel,
  Root: BottomBarRoot,
});

export type BottomBar = {
  Props: ComponentProps<typeof BottomBarRoot>;
  RootProps: ComponentProps<typeof BottomBarRoot>;
  ItemProps: ComponentProps<typeof BottomBarItem>;
  IconProps: ComponentProps<typeof BottomBarIcon>;
  LabelProps: ComponentProps<typeof BottomBarLabel>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {BottomBarRoot, BottomBarItem, BottomBarIcon, BottomBarLabel};

export type {
  BottomBarRootProps,
  BottomBarRootProps as BottomBarProps,
  BottomBarSelectionStyle,
  BottomBarItemProps,
  BottomBarItemRenderProps,
  BottomBarIconProps,
  BottomBarLabelProps,
} from "./bottom-bar";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {bottomBarVariants} from "@sy-ui/styles";

export type {BottomBarVariants} from "@sy-ui/styles";
