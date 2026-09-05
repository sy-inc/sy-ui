import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const countdownVariants = tv({
  defaultVariants: {animation: "slide", size: "md"},
  slots: {
    base: "countdown",
    accessibleText: "countdown__accessible-text",
    segment: "countdown__segment",
    value: "countdown__value",
    digit: "countdown__digit",
    glyph: "countdown__glyph",
    label: "countdown__label",
  },
  variants: {
    animation: {slide: {base: "countdown--slide"}, none: {base: "countdown--none"}},
    size: {sm: {base: "countdown--sm"}, md: {base: "countdown--md"}, lg: {base: "countdown--lg"}},
  },
});

export type CountdownVariants = VariantProps<typeof countdownVariants>;
