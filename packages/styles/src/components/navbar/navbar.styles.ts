import type {VariantProps} from "tailwind-variants";
import {tv} from "tailwind-variants";

export const navbarVariants = tv({
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
    isBlurred: {
      false: {
        base: "navbar--opaque",
        menu: "navbar__menu--opaque",
      },
      true: {
        base: "navbar--blurred",
        menu: "navbar__menu--blurred",
      },
    },
    isBordered: {
      true: {base: "navbar--bordered"},
    },
    justify: {
      start: {content: "navbar__content--start"},
      center: {content: "navbar__content--center"},
      end: {content: "navbar__content--end"},
    },
  },
  defaultVariants: {isBlurred: true, justify: "start"},
});

export type NavbarVariants = VariantProps<typeof navbarVariants>;
