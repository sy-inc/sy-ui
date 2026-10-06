import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const imageFieldVariants = tv({
  slots: {
    actions: "image-field__actions",
    area: "image-field__area",
    base: "image-field",
    divider: "image-field__divider",
    dropOverlay: "image-field__drop-overlay",
    emptyTrigger: "image-field__empty-trigger",
    frame: "image-field__frame",
    handoff: "image-field__handoff",
    image: "image-field__image",
    meta: "image-field__meta",
    overlay: "image-field__overlay",
    placeholder: "image-field__placeholder",
    preview: "image-field__preview",
    progress: "image-field__progress",
    remove: "image-field__remove",
  },
});
export type ImageFieldVariants = VariantProps<typeof imageFieldVariants>;
