import type {ComponentProps} from "react";

import {
  CountdownAccessibleText,
  CountdownLabel,
  CountdownRoot,
  CountdownSegment,
  CountdownValue,
} from "./countdown";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Countdown = Object.assign(CountdownRoot, {
  Root: CountdownRoot,
  AccessibleText: CountdownAccessibleText,
  Segment: CountdownSegment,
  Value: CountdownValue,
  Label: CountdownLabel,
});

export type Countdown = {
  Props: ComponentProps<typeof CountdownRoot>;
  RootProps: ComponentProps<typeof CountdownRoot>;
  AccessibleTextProps: ComponentProps<typeof CountdownAccessibleText>;
  SegmentProps: ComponentProps<typeof CountdownSegment>;
  ValueProps: ComponentProps<typeof CountdownValue>;
  LabelProps: ComponentProps<typeof CountdownLabel>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {CountdownAccessibleText, CountdownLabel, CountdownRoot, CountdownSegment, CountdownValue};

export type {
  CountdownAccessibleTextProps,
  CountdownLabelProps,
  CountdownRootProps,
  CountdownRootProps as CountdownProps,
  CountdownSegmentProps,
  CountdownState,
  CountdownUnit,
  CountdownValueProps,
} from "./countdown";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {countdownVariants} from "@sy-inc/styles";

export type {CountdownVariants} from "@sy-inc/styles";
