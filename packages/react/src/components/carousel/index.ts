import type {ComponentProps} from "react";

import {
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPrevious,
  CarouselRoot,
} from "./carousel";

export const Carousel = Object.assign(CarouselRoot, {
  Content: CarouselContent,
  Item: CarouselItem,
  Next: CarouselNext,
  Pagination: CarouselPagination,
  Previous: CarouselPrevious,
  Root: CarouselRoot,
});

export type Carousel = {
  ContentProps: ComponentProps<typeof CarouselContent>;
  ItemProps: ComponentProps<typeof CarouselItem>;
  NextProps: ComponentProps<typeof CarouselNext>;
  PaginationProps: ComponentProps<typeof CarouselPagination>;
  PreviousProps: ComponentProps<typeof CarouselPrevious>;
  Props: ComponentProps<typeof CarouselRoot>;
  RootProps: ComponentProps<typeof CarouselRoot>;
};

export {
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPrevious,
  CarouselRoot,
};

export type {
  CarouselContentProps,
  CarouselItemProps,
  CarouselNextProps,
  CarouselPaginationProps,
  CarouselPaginationRenderProps,
  CarouselItemsPerView,
  CarouselGap,
  CarouselOrientation,
  CarouselPreviousProps,
  CarouselRootProps,
  CarouselRootProps as CarouselProps,
  CarouselAutoplayOptions,
  CarouselAutoplayInteraction,
} from "./carousel";

export {carouselVariants} from "@sy-ui/styles";
export type {CarouselVariants} from "@sy-ui/styles";
