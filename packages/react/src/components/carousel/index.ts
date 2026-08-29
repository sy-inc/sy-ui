import type {ComponentProps} from "react";

import {
  CarouselAutoplayControl,
  CarouselAutoplayProgress,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPrevious,
  CarouselRoot,
} from "./carousel";

export const Carousel = Object.assign(CarouselRoot, {
  AutoplayControl: CarouselAutoplayControl,
  AutoplayProgress: CarouselAutoplayProgress,
  Content: CarouselContent,
  Item: CarouselItem,
  Next: CarouselNext,
  Pagination: CarouselPagination,
  Previous: CarouselPrevious,
  Root: CarouselRoot,
});

export type Carousel = {
  AutoplayControlProps: ComponentProps<typeof CarouselAutoplayControl>;
  AutoplayProgressProps: ComponentProps<typeof CarouselAutoplayProgress>;
  ContentProps: ComponentProps<typeof CarouselContent>;
  ItemProps: ComponentProps<typeof CarouselItem>;
  NextProps: ComponentProps<typeof CarouselNext>;
  PaginationProps: ComponentProps<typeof CarouselPagination>;
  PreviousProps: ComponentProps<typeof CarouselPrevious>;
  Props: ComponentProps<typeof CarouselRoot>;
  RootProps: ComponentProps<typeof CarouselRoot>;
};

export {
  CarouselAutoplayControl,
  CarouselAutoplayProgress,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPrevious,
  CarouselRoot,
};

export type {
  CarouselAutoplayControlProps,
  CarouselAutoplayProgressProps,
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

export {carouselVariants} from "@sy-inc/styles";
export type {CarouselVariants} from "@sy-inc/styles";
