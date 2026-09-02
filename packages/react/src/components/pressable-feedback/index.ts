import type {ComponentProps} from "react";

import {
  PressableFeedbackHighlight,
  PressableFeedbackProgress,
  PressableFeedbackRipple,
  PressableFeedbackRoot,
  PressableFeedbackScale,
} from "./pressable-feedback";

export const PressableFeedback = Object.assign(PressableFeedbackRoot, {
  Highlight: PressableFeedbackHighlight,
  Progress: PressableFeedbackProgress,
  Ripple: PressableFeedbackRipple,
  Root: PressableFeedbackRoot,
  Scale: PressableFeedbackScale,
});

export default PressableFeedback;

export type PressableFeedback = {
  HighlightProps: ComponentProps<typeof PressableFeedbackHighlight>;
  ProgressProps: ComponentProps<typeof PressableFeedbackProgress>;
  Props: ComponentProps<typeof PressableFeedbackRoot>;
  RippleProps: ComponentProps<typeof PressableFeedbackRipple>;
  RootProps: ComponentProps<typeof PressableFeedbackRoot>;
  ScaleProps: ComponentProps<typeof PressableFeedbackScale>;
};

export {
  PressableFeedbackRoot,
  PressableFeedbackHighlight,
  PressableFeedbackScale,
  PressableFeedbackRipple,
  PressableFeedbackProgress,
};

export type {
  PressableFeedbackRootProps,
  PressableFeedbackRootProps as PressableFeedbackProps,
  PressableFeedbackHighlightProps,
  PressableFeedbackScaleProps,
  PressableFeedbackRippleProps,
  PressableFeedbackProgressProps,
  PressableFeedbackSweep,
} from "./pressable-feedback";

export {pressableFeedbackVariants} from "@sy-inc/styles";
export type {PressableFeedbackVariants} from "@sy-inc/styles";
