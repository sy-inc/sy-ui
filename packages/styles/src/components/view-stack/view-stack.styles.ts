import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const viewStackVariants = tv({
  slots: {
    back: "view-stack__back",
    base: "view-stack",
    header: "view-stack__header",
    title: "view-stack__title",
    view: "view-stack__view",
  },
});

export type ViewStackVariants = VariantProps<typeof viewStackVariants>;
