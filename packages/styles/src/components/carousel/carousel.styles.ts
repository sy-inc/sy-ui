import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const carouselVariants = tv({
  defaultVariants: {
    orientation: "horizontal",
  },
  slots: {
    base: "carousel",
    content: "carousel__content",
    autoplay: "carousel__control carousel__autoplay",
    item: "carousel__item",
    next: "carousel__control carousel__next",
    pagination: "carousel__pagination",
    paginationItem: "carousel__pagination-item",
    previous: "carousel__control carousel__previous",
    viewport: "carousel__viewport",
  },
  variants: {
    orientation: {
      horizontal: {
        base: "carousel--horizontal",
      },
      vertical: {
        base: "carousel--vertical",
      },
    },
  },
});

export type CarouselVariants = VariantProps<typeof carouselVariants>;
