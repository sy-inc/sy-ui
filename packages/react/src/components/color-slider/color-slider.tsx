"use client";

import type {ColorSliderVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";
import type {ColorSliderRenderProps, ColorSpace} from "react-aria-components/ColorSlider";

import {colorSliderVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {
  ColorSlider as ColorSliderPrimitive,
  ColorThumb as ColorThumbPrimitive,
  SliderOutput as SliderOutputPrimitive,
  SliderTrack as SliderTrackPrimitive,
} from "react-aria-components/ColorSlider";

import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * ColorSlider Channel Types
 * -----------------------------------------------------------------------------------------------*/

/** Channels available in HSL color space */
type HSLChannel = "hue" | "saturation" | "lightness" | "alpha";

/** Channels available in HSB color space */
type HSBChannel = "hue" | "saturation" | "brightness" | "alpha";

/** Channels available in RGB color space */
type RGBChannel = "red" | "green" | "blue" | "alpha";

/** Channels shared between HSL and HSB (but NOT RGB) */
type HSLHSBSharedChannel = "hue" | "saturation";

/** Alpha channel works across ALL color spaces */
type AlphaChannel = "alpha";

/**
 * Discriminated union type for valid channel/colorSpace combinations.
 * This ensures TypeScript will error on invalid combinations like
 * `channel="red"` with `colorSpace="hsl"` or `channel="saturation"` with `colorSpace="rgb"`.
 */
type ColorSliderChannelProps =
  | {channel: HSLChannel; colorSpace?: "hsl"}
  | {channel: HSBChannel; colorSpace?: "hsb"}
  | {channel: RGBChannel; colorSpace?: "rgb"}
  | {channel: HSLHSBSharedChannel; colorSpace?: "hsl" | "hsb"}
  | {channel: AlphaChannel; colorSpace?: ColorSpace};

/* -------------------------------------------------------------------------------------------------
 * ColorSlider Context
 * -----------------------------------------------------------------------------------------------*/
interface ColorSliderContext {
  channel?: string;
  slots?: ReturnType<typeof colorSliderVariants>;
  state?: ColorSliderRenderProps;
}

const ColorSliderContext = createContext<ColorSliderContext>({});

const colorSliderSlots = colorSliderVariants();

/* -------------------------------------------------------------------------------------------------
 * ColorSlider Root
 * -----------------------------------------------------------------------------------------------*/
interface ColorSliderRootBaseProps
  extends
    Omit<ComponentPropsWithRef<typeof ColorSliderPrimitive>, "channel" | "colorSpace">,
    ColorSliderVariants {}

type ColorSliderRootProps = ColorSliderRootBaseProps & ColorSliderChannelProps;

const ColorSliderRoot = ({
  channel,
  children,
  className,
  colorSpace,
  orientation = "horizontal",
  ...props
}: ColorSliderRootProps) => {
  return (
    <ColorSliderPrimitive
      channel={channel}
      colorSpace={colorSpace}
      data-slot="color-slider"
      orientation={orientation}
      {...props}
      className={composeTwRenderProps(className, colorSliderSlots.base())}
    >
      {(values) => (
        <ColorSliderContext value={{channel, slots: colorSliderSlots, state: values}}>
          {typeof children === "function" ? children(values) : children}
        </ColorSliderContext>
      )}
    </ColorSliderPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ColorSlider Output
 * -----------------------------------------------------------------------------------------------*/
interface ColorSliderOutputProps extends ComponentPropsWithRef<typeof SliderOutputPrimitive> {}

const ColorSliderOutput = ({children, className, ...props}: ColorSliderOutputProps) => {
  const {slots} = use(ColorSliderContext);

  return (
    <SliderOutputPrimitive
      className={composeTwRenderProps(className, slots?.output())}
      data-slot="color-slider-output"
      {...props}
    >
      {children
        ? (values) => <>{typeof children === "function" ? children(values) : children}</>
        : ({state}) => state.getThumbValueLabel(0)}
    </SliderOutputPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ColorSlider Track
 * -----------------------------------------------------------------------------------------------*/
interface ColorSliderTrackProps extends ComponentPropsWithRef<typeof SliderTrackPrimitive> {}

const ColorSliderTrack = ({children, className, style, ...props}: ColorSliderTrackProps) => {
  const {channel, slots, state} = use(ColorSliderContext);
  // Calculate start and end colors for the gradient edge caps
  const displayColor = state?.state?.getDisplayColor();

  const edgeColors = React.useMemo(() => {
    // Access color through state.state.value (ColorSliderState.value)
    if (!displayColor || !channel) {
      return {end: "transparent", start: "transparent"};
    }

    const range = displayColor.getChannelRange(
      channel as Parameters<typeof displayColor.getChannelRange>[0],
    );

    // Get colors at min and max values of the channel
    const startColor = displayColor.withChannelValue(
      channel as Parameters<typeof displayColor.withChannelValue>[0],
      range.minValue,
    );
    const endColor = displayColor.withChannelValue(
      channel as Parameters<typeof displayColor.withChannelValue>[0],
      range.maxValue,
    );

    return {
      end: endColor.toString("css"),
      start: startColor.toString("css"),
    };
  }, [channel, displayColor]);

  return (
    <SliderTrackPrimitive
      className={composeTwRenderProps(className, slots?.track())}
      data-slot="color-slider-track"
      style={({defaultStyle, ...rest}) => ({
        // Add transparency checkerboard pattern for alpha channel
        background: `${defaultStyle.background}, repeating-conic-gradient(#efefef 0% 25%, #f7f7f7 0% 50%) 50% / 16px 16px`,
        // Pass edge colors as CSS custom properties for ::before and ::after
        "--track-end-color": edgeColors.end,
        "--track-start-color": edgeColors.start,
        ...(typeof style === "function" ? style({defaultStyle, ...rest}) : style),
      })}
      {...props}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </SliderTrackPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ColorSlider Thumb
 * -----------------------------------------------------------------------------------------------*/
interface ColorSliderThumbProps extends ComponentPropsWithRef<typeof ColorThumbPrimitive> {}

const ColorSliderThumb = ({children, className, style, ...props}: ColorSliderThumbProps) => {
  const {slots} = use(ColorSliderContext);

  return (
    <ColorThumbPrimitive
      className={composeTwRenderProps(className, slots?.thumb())}
      data-slot="color-slider-thumb"
      style={({defaultStyle, isDisabled, ...rest}) => ({
        ...defaultStyle,
        backgroundColor: isDisabled ? undefined : defaultStyle.backgroundColor,
        ...(typeof style === "function" ? style({defaultStyle, isDisabled, ...rest}) : style),
      })}
      {...props}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </ColorThumbPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ColorSliderRoot, ColorSliderOutput, ColorSliderTrack, ColorSliderThumb};

export type {
  ColorSliderRootProps,
  ColorSliderOutputProps,
  ColorSliderTrackProps,
  ColorSliderThumbProps,
  // Channel types for type-safe usage
  HSLChannel,
  HSBChannel,
  RGBChannel,
  HSLHSBSharedChannel,
  AlphaChannel,
  ColorSliderChannelProps,
};
