import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

/** Direction is driven by the `data-direction` attribute on the root, not by a modifier class. */
export const marqueeVariants = tv({
  defaultVariants: {
    pauseOnInteraction: false,
  },
  slots: {
    base: "marquee",
    item: "marquee__item",
    sequence: "marquee__sequence",
    track: "marquee__track",
  },
  variants: {
    pauseOnInteraction: {
      false: {},
      true: {
        base: "marquee--pause-on-interaction",
      },
    },
  },
});

export type MarqueeVariants = VariantProps<typeof marqueeVariants>;
