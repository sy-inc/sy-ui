"use client";

/* Slider indicators adapted from HeroUI v3.2.7 (PR #6965). Modified for SY INC composition.
 * Copyright 2025 NextUI Inc. Licensed under Apache-2.0.
 * https://github.com/heroui-inc/heroui/tree/v3.2.7
 */

import type {DOMRenderProps} from "../../utils/dom";
import type {SliderVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";
import type {SliderRenderProps} from "react-aria-components/Slider";

import {snapValueToStep} from "@react-stately/utils";
import {sliderVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {useLocale} from "react-aria-components/I18nProvider";
import {
  SliderFill as SliderFillPrimitive,
  SliderOutput as SliderOutputPrimitive,
  Slider as SliderPrimitive,
  SliderStateContext,
  SliderThumb as SliderThumbPrimitive,
  SliderTrack as SliderTrackPrimitive,
} from "react-aria-components/Slider";

import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * Slider Context
 * -----------------------------------------------------------------------------------------------*/
interface SliderContext {
  slots?: ReturnType<typeof sliderVariants>;
}

const SliderContext = createContext<SliderContext>({});

/* -------------------------------------------------------------------------------------------------
 * Slider Root
 * -----------------------------------------------------------------------------------------------*/
interface SliderRootProps extends ComponentPropsWithRef<typeof SliderPrimitive>, SliderVariants {}

const SliderRoot = ({children, className, variant, ...props}: SliderRootProps) => {
  const slots = React.useMemo(() => sliderVariants({variant}), [variant]);

  return (
    <SliderContext value={{slots}}>
      <SliderPrimitive
        data-slot="slider"
        {...props}
        className={composeTwRenderProps(className, slots.base())}
      >
        {children}
      </SliderPrimitive>
    </SliderContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Output
 * -----------------------------------------------------------------------------------------------*/
interface SliderOutputProps extends ComponentPropsWithRef<typeof SliderOutputPrimitive> {}

const SliderOutput = ({children, className, ...props}: SliderOutputProps) => {
  const {slots} = use(SliderContext);

  return (
    <SliderOutputPrimitive
      className={composeTwRenderProps(className, slots?.output())}
      data-slot="slider-output"
      {...props}
    >
      {children ??
        (({state}) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(" – "))}
    </SliderOutputPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Track
 * -----------------------------------------------------------------------------------------------*/
interface SliderTrackProps extends ComponentPropsWithRef<typeof SliderTrackPrimitive> {}

const SliderTrack = ({children, className, ...props}: SliderTrackProps) => {
  const {slots} = use(SliderContext);
  const state = use(SliderStateContext)!;
  // React Aria positions thumbs by locale direction; `dir` keeps Fill and the end caps in step.
  const {direction} = useLocale();
  const end = state.getThumbPercent(state.values.length - 1);
  const ranged = state.values.length > 1;

  return (
    <SliderTrackPrimitive
      className={composeTwRenderProps(className, slots?.track())}
      data-fill-end={dataAttr(end === 1)}
      data-fill-start={dataAttr(ranged ? state.getThumbPercent(0) === 0 : end > 0)}
      data-slot="slider-track"
      dir={direction}
      {...props}
    >
      {children}
    </SliderTrackPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Fill
 * -----------------------------------------------------------------------------------------------*/
interface SliderFillProps extends ComponentPropsWithRef<typeof SliderFillPrimitive> {}

const SliderFill = ({className, ...props}: SliderFillProps) => {
  const {slots} = use(SliderContext);

  return (
    <SliderFillPrimitive
      className={composeTwRenderProps(className, slots?.fill())}
      data-slot="slider-fill"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Thumb
 * -----------------------------------------------------------------------------------------------*/
interface SliderThumbProps extends ComponentPropsWithRef<typeof SliderThumbPrimitive> {}

const SliderThumb = ({children, className, ...props}: SliderThumbProps) => {
  const {slots} = use(SliderContext);

  return (
    <SliderThumbPrimitive
      className={composeTwRenderProps(className, slots?.thumb())}
      data-slot="slider-thumb"
      {...props}
    >
      {children}
    </SliderThumbPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Slider Indicators
 * -----------------------------------------------------------------------------------------------*/
function getIndicatorProps(state: SliderRenderProps["state"], value: number) {
  const minValue = state.getThumbMinValue(0);
  const maxValue = state.getThumbMaxValue(state.values.length - 1);
  const startValue = state.values.length > 1 ? state.values[0]! : minValue;
  const endValue = state.values[state.values.length - 1]!;
  const percent = minValue === maxValue ? 0 : state.getValuePercent(value);

  return {
    "data-filled": dataAttr(value >= startValue && value <= endValue),
    "data-value": value,
    style: {
      [state.orientation === "vertical" ? "bottom" : "insetInlineStart"]: `${percent * 100}%`,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Slider Steps
 * -----------------------------------------------------------------------------------------------*/
interface SliderStepsProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

/**
 * Decorative dots at each step, composed inside Slider.Track.
 * Omitted for invalid ranges or more than 1,000 dots to avoid unbounded DOM output.
 * Exposes slider-steps and slider-step data-slot hooks; dots expose data-value and data-filled.
 */
const SliderSteps = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: SliderStepsProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof SliderStepsProps<E> | "children">) => {
  const {slots} = use(SliderContext);
  const state = use(SliderStateContext);

  if (!state) return null;

  const minValue = state.getThumbMinValue(0);
  const maxValue = state.getThumbMaxValue(state.values.length - 1);
  const {step} = state;
  // Non-finite bounds or a non-positive step yield NaN or count <= 0, which the guard rejects.
  const count =
    Math.round((snapValueToStep(maxValue, minValue, maxValue, step) - minValue) / step) + 1;

  if (!(count > 0 && count <= 1000)) return null;

  return (
    <dom.div
      className={composeSlotClassName(slots?.steps, className)}
      data-slot="slider-steps"
      {...(props as any)}
      aria-hidden="true"
    >
      {Array.from({length: count}, (_, index) => (
        <span
          key={index}
          className={slots?.step()}
          data-slot="slider-step"
          {...getIndicatorProps(
            state,
            snapValueToStep(minValue + index * step, minValue, maxValue, step),
          )}
        />
      ))}
    </dom.div>
  );
};

SliderSteps.displayName = "SY INC.Slider.Steps";

/* -------------------------------------------------------------------------------------------------
 * Slider Marks
 * -----------------------------------------------------------------------------------------------*/
interface SliderMarksProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

/** Composed after Slider.Track. Contains Slider.Mark labels and exposes data-slot="slider-marks". */
const SliderMarks = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: SliderMarksProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof SliderMarksProps<E>>) => {
  const {slots} = use(SliderContext);
  const {direction} = useLocale();

  return (
    <dom.div
      className={composeSlotClassName(slots?.marks, className)}
      data-slot="slider-marks"
      dir={direction}
      {...(props as any)}
    />
  );
};

SliderMarks.displayName = "SY INC.Slider.Marks";

/* -------------------------------------------------------------------------------------------------
 * Slider Mark
 * -----------------------------------------------------------------------------------------------*/
interface SliderMarkProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  className?: string;
  /** Value at which to position the label. Values outside the slider bounds are not rendered. */
  value: number;
}

/** Exposes data-slot="slider-mark", data-value, and data-filled. */
const SliderMark = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  style,
  value,
  ...props
}: SliderMarkProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof SliderMarkProps<E>>) => {
  const {slots} = use(SliderContext);
  const state = use(SliderStateContext);

  if (
    !state ||
    !(
      value >= state.getThumbMinValue(0) && value <= state.getThumbMaxValue(state.values.length - 1)
    )
  ) {
    return null;
  }

  const {style: position, ...indicatorProps} = getIndicatorProps(state, value);

  return (
    <dom.div
      className={composeSlotClassName(slots?.mark, className)}
      data-slot="slider-mark"
      {...indicatorProps}
      {...(props as any)}
      style={{...style, ...position}}
    >
      {children ?? state.getFormattedValue(value)}
    </dom.div>
  );
};

SliderMark.displayName = "SY INC.Slider.Mark";

SliderRoot.displayName = "SY INC.Slider";
SliderOutput.displayName = "SY INC.Slider.Output";
SliderTrack.displayName = "SY INC.Slider.Track";
SliderFill.displayName = "SY INC.Slider.Fill";
SliderThumb.displayName = "SY INC.Slider.Thumb";

/* -------------------------------------------------------------------------------------------------
 * Exports
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
  SliderOutputProps,
  SliderTrackProps,
  SliderFillProps,
  SliderThumbProps,
  SliderStepsProps,
  SliderMarksProps,
  SliderMarkProps,
};
