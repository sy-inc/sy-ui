import type {ComponentProps} from "react";

import {
  ItemCardGroupDescription,
  ItemCardGroupHeader,
  ItemCardGroupRoot,
  ItemCardGroupTitle,
} from "./item-card-group";

export const ItemCardGroup = Object.assign(ItemCardGroupRoot, {
  Root: ItemCardGroupRoot,
  Header: ItemCardGroupHeader,
  Title: ItemCardGroupTitle,
  Description: ItemCardGroupDescription,
});

export type ItemCardGroup = {
  Props: ComponentProps<typeof ItemCardGroupRoot>;
  RootProps: ComponentProps<typeof ItemCardGroupRoot>;
  HeaderProps: ComponentProps<typeof ItemCardGroupHeader>;
  TitleProps: ComponentProps<typeof ItemCardGroupTitle>;
  DescriptionProps: ComponentProps<typeof ItemCardGroupDescription>;
};

export {ItemCardGroupRoot, ItemCardGroupHeader, ItemCardGroupTitle, ItemCardGroupDescription};

export type {
  ItemCardGroupRootProps,
  ItemCardGroupRootProps as ItemCardGroupProps,
  ItemCardGroupHeaderProps,
  ItemCardGroupTitleProps,
  ItemCardGroupDescriptionProps,
} from "./item-card-group";

export {itemCardGroupVariants} from "@sy-inc/styles";
export type {ItemCardGroupVariants} from "@sy-inc/styles";
