import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const timelineVariants = tv({
  defaultVariants: {
    axis: "start",
    density: "comfortable",
    placement: "end",
    size: "md",
  },
  slots: {
    base: "timeline",
    connector: "timeline__connector",
    content: "timeline__content",
    item: "timeline__item",
    marker: "timeline__marker",
    rail: "timeline__rail",
  },
  variants: {
    axis: {
      center: {base: "timeline--axis-center"},
      start: {base: "timeline--axis-start"},
    },
    density: {
      comfortable: {base: "timeline--comfortable"},
      compact: {base: "timeline--compact"},
    },
    placement: {
      alternate: {base: "timeline--alternate"},
      end: {base: "timeline--end"},
      start: {base: "timeline--start"},
    },
    size: {
      lg: {base: "timeline--lg"},
      md: {base: "timeline--md"},
      sm: {base: "timeline--sm"},
    },
  },
});

export type TimelineVariants = VariantProps<typeof timelineVariants>;
