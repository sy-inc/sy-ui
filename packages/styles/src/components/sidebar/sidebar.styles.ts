import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const sidebarVariants = tv({
  defaultVariants: {
    collapsible: "offcanvas",
    side: "left",
    state: "expanded",
    variant: "sidebar",
  },
  slots: {
    base: "sidebar group/sidebar",
    content: "sidebar__content",
    footer: "sidebar__footer",
    gap: "sidebar__gap",
    group: "sidebar__group",
    groupAction: "sidebar__group-action",
    groupContent: "sidebar__group-content",
    groupLabel: "sidebar__group-label",
    header: "sidebar__header",
    input: "sidebar__input",
    inset: "sidebar__inset",
    menu: "sidebar__menu",
    menuAction: "sidebar__menu-action",
    menuBadge: "sidebar__menu-badge",
    menuButton: "sidebar__menu-button",
    menuItem: "sidebar__menu-item",
    menuSkeleton: "sidebar__menu-skeleton",
    menuSkeletonIcon: "sidebar__menu-skeleton-icon",
    menuSkeletonText: "sidebar__menu-skeleton-text",
    menuSub: "sidebar__menu-sub",
    menuSubButton: "sidebar__menu-sub-button",
    menuSubItem: "sidebar__menu-sub-item",
    mobileBackdrop: "sidebar__mobile-backdrop",
    mobileContent: "sidebar__mobile-content",
    mobileDescription: "sidebar__mobile-description",
    mobileDialog: "sidebar__mobile-dialog",
    panel: "sidebar__panel",
    rail: "sidebar__rail",
    separator: "sidebar__separator",
    trigger: "sidebar__trigger",
  },
  variants: {
    collapsible: {
      icon: {base: "sidebar--collapsible-icon"},
      none: {base: "sidebar--collapsible-none"},
      offcanvas: {base: "sidebar--collapsible-offcanvas"},
    },
    side: {
      left: {base: "sidebar--left"},
      right: {base: "sidebar--right"},
    },
    state: {
      collapsed: {base: "sidebar--collapsed"},
      // The expanded state is exposed on the root as `data-state`; no class needed.
      expanded: {base: ""},
    },
    variant: {
      floating: {base: "sidebar--floating"},
      inset: {base: "sidebar--inset"},
      // The default variant is exposed on the root as `data-variant`; no class needed.
      sidebar: {base: ""},
    },
  },
});

export type SidebarVariants = VariantProps<typeof sidebarVariants>;
