import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const actionBarVariants = tv({
  base: "action-bar",
});

export type ActionBarVariants = VariantProps<typeof actionBarVariants>;
