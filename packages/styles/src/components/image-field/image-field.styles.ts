import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const imageFieldVariants = tv({
  slots: {
    base: "image-field",
    area: "image-field__area",
    heading: "image-field__heading",
    frame: "image-field__frame",
    preview: "image-field__preview",
    image: "image-field__image",
    handoff: "image-field__handoff",
    placeholder: "image-field__placeholder",
    actions: "image-field__actions",
    emptyTrigger: "image-field__empty-trigger",
    replaceTrigger: "image-field__replace-trigger",
    divider: "image-field__divider",
    remove: "image-field__remove",
    overlay: "image-field__overlay",
    dropOverlay: "image-field__drop-overlay",
    progress: "image-field__progress",
    meta: "image-field__meta",
  },
  variants: {
    layout: {
      banner: {},
      tile: {base: "image-field--tile"},
      inline: {base: "image-field--inline"},
    },
  },
  defaultVariants: {layout: "banner"},
});
export type ImageFieldVariants = VariantProps<typeof imageFieldVariants>;
