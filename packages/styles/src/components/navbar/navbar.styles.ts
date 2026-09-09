import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const navbarVariants = tv({
  defaultVariants: {justify: "start", variant: "solid"},
  slots: {
    base: "navbar",
    brand: "navbar__brand",
    content: "navbar__content",
    item: "navbar__item",
    menu: "navbar__menu",
    menuItem: "navbar__menu-item",
    toggle: "navbar__menu-toggle",
  },
  variants: {
    justify: {
      center: {content: "navbar__content--center"},
      end: {content: "navbar__content--end"},
      start: {content: "navbar__content--start"},
    },
    variant: {
      blur: {base: "navbar--blur"},
      // No classes, the base is already the solid header.
      solid: {},
    },
  },
});

export type NavbarVariants = VariantProps<typeof navbarVariants>;
