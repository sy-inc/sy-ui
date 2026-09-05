import type {ComponentProps} from "react";

import {RatingItem, RatingRoot} from "./rating";

export const Rating = Object.assign(RatingRoot, {
  Item: RatingItem,
  Root: RatingRoot,
});

export type Rating = {
  ItemProps: ComponentProps<typeof RatingItem>;
  Props: ComponentProps<typeof RatingRoot>;
  RootProps: ComponentProps<typeof RatingRoot>;
};

export {RatingItem, RatingRoot};

export type {RatingItemProps, RatingRootProps, RatingRootProps as RatingProps} from "./rating";

export {ratingVariants} from "@sy-inc/styles";

export type {RatingVariants} from "@sy-inc/styles";
