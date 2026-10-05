import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const bottomBarVariants = tv({
  defaultVariants: {
    position: "fixed",
    selectionStyle: "indicator",
    variant: "floating",
  },
  slots: {
    base: "bottom-bar",
    icon: "bottom-bar__icon",
    indicator: "bottom-bar__indicator",
    item: "bottom-bar__item",
    label: "bottom-bar__label",
    link: "bottom-bar__link",
    list: "bottom-bar__list",
  },
  variants: {
    position: {
      fixed: {
        base: "bottom-bar--fixed",
      },
      static: {
        base: "bottom-bar--static",
      },
      sticky: {
        base: "bottom-bar--sticky",
      },
    },
    selectionStyle: {
      color: {
        base: "bottom-bar--color",
      },
      indicator: {
        base: "bottom-bar--indicator",
      },
      underline: {
        base: "bottom-bar--underline",
      },
    },
    variant: {
      edge: {
        base: "bottom-bar--edge",
      },
      floating: {
        base: "bottom-bar--floating",
      },
    },
  },
});

export type BottomBarVariants = VariantProps<typeof bottomBarVariants>;
