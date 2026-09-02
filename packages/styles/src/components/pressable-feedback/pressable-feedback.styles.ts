import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const pressableFeedbackVariants = tv({
  slots: {
    base: "pressable-feedback",
    highlight: "pressable-feedback__highlight",
    progress: "pressable-feedback__progress",
    ripple: "pressable-feedback__ripple",
    rippleWave: "pressable-feedback__ripple-wave",
    scale: "pressable-feedback__scale",
  },
});

export type PressableFeedbackVariants = VariantProps<typeof pressableFeedbackVariants>;
