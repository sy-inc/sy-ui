import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const imagePreviewVariants = tv({
  slots: {
    base: "image-preview",
    closeButton: "image-preview__close-button",
    crop: "image-preview__crop",
    dialog: "image-preview__dialog",
  },
});

export type ImagePreviewVariants = VariantProps<typeof imagePreviewVariants>;
