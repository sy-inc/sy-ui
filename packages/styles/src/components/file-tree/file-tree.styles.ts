import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const fileTreeVariants = tv({
  defaultVariants: {
    showGuideLines: true,
    size: "md",
  },
  slots: {
    base: "file-tree",
    chevron: "file-tree__chevron",
    dragHandle: "file-tree__drag-handle",
    header: "file-tree__header",
    icon: "file-tree__icon",
    indicator: "file-tree__indicator",
    item: "file-tree__item",
    itemContent: "file-tree__item-content",
    label: "file-tree__label",
    section: "file-tree__section",
  },
  variants: {
    showGuideLines: {
      false: {base: "file-tree--no-guides"},
      hover: {base: "file-tree--guides-hover"},
      true: {},
    },
    size: {
      lg: {base: "file-tree--lg"},
      md: {base: "file-tree--md"},
      sm: {base: "file-tree--sm"},
    },
  },
});

export type FileTreeVariants = VariantProps<typeof fileTreeVariants>;
