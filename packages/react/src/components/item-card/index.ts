import type {ComponentProps} from "react";

import {
  ItemCardAction,
  ItemCardContent,
  ItemCardDescription,
  ItemCardIcon,
  ItemCardRoot,
  ItemCardTitle,
} from "./item-card";

export const ItemCard = Object.assign(ItemCardRoot, {
  Root: ItemCardRoot,
  Icon: ItemCardIcon,
  Content: ItemCardContent,
  Title: ItemCardTitle,
  Description: ItemCardDescription,
  Action: ItemCardAction,
});

export type ItemCard = {
  Props: ComponentProps<typeof ItemCardRoot>;
  RootProps: ComponentProps<typeof ItemCardRoot>;
  IconProps: ComponentProps<typeof ItemCardIcon>;
  ContentProps: ComponentProps<typeof ItemCardContent>;
  TitleProps: ComponentProps<typeof ItemCardTitle>;
  DescriptionProps: ComponentProps<typeof ItemCardDescription>;
  ActionProps: ComponentProps<typeof ItemCardAction>;
};

export {
  ItemCardRoot,
  ItemCardIcon,
  ItemCardContent,
  ItemCardTitle,
  ItemCardDescription,
  ItemCardAction,
};

export type {
  ItemCardRootProps,
  ItemCardRootProps as ItemCardProps,
  ItemCardIconProps,
  ItemCardContentProps,
  ItemCardTitleProps,
  ItemCardDescriptionProps,
  ItemCardActionProps,
} from "./item-card";

export {itemCardVariants} from "@sy-inc/styles";
export type {ItemCardVariants} from "@sy-inc/styles";
