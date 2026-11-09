import type {ComponentProps} from "react";

import {
  SliderFill,
  SliderMark,
  SliderMarks,
  SliderOutput,
  SliderRoot,
  SliderSteps,
  SliderThumb,
  SliderTrack,
} from "./slider";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  Output: SliderOutput,
  Track: SliderTrack,
  Fill: SliderFill,
  Thumb: SliderThumb,
  Steps: SliderSteps,
  Marks: SliderMarks,
  Mark: SliderMark,
});

export type Slider = {
  Props: ComponentProps<typeof SliderRoot>;
  RootProps: ComponentProps<typeof SliderRoot>;
  OutputProps: ComponentProps<typeof SliderOutput>;
  TrackProps: ComponentProps<typeof SliderTrack>;
  FillProps: ComponentProps<typeof SliderFill>;
  ThumbProps: ComponentProps<typeof SliderThumb>;
  StepsProps: ComponentProps<typeof SliderSteps>;
  MarksProps: ComponentProps<typeof SliderMarks>;
  MarkProps: ComponentProps<typeof SliderMark>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  SliderRoot,
  SliderOutput,
  SliderTrack,
  SliderFill,
  SliderThumb,
  SliderSteps,
  SliderMarks,
  SliderMark,
};

export type {
  SliderRootProps,
  SliderRootProps as SliderProps,
  SliderOutputProps,
  SliderTrackProps,
  SliderFillProps,
  SliderThumbProps,
  SliderStepsProps,
  SliderMarksProps,
  SliderMarkProps,
} from "./slider";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {sliderVariants} from "@sy-inc/styles";

export type {SliderVariants} from "@sy-inc/styles";
