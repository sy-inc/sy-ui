import {tv} from "tailwind-variants";

/** Direction and pause states are driven by `data-*` attributes on the content, not by modifiers. */
export const marqueeVariants = tv({
  slots: {
    base: "marquee",
    content: "marquee__content",
    item: "marquee__item",
    prefix: "marquee__prefix",
    sequence: "marquee__sequence",
    suffix: "marquee__suffix",
    track: "marquee__track",
  },
});
