"use client";

import type {CSSProperties, ComponentPropsWithRef, ReactNode, RefObject} from "react";

import {mergeRefs, useLayoutEffect} from "@react-aria/utils";
import {marqueeVariants} from "@sy-inc/styles";
import React from "react";

import {dataAttr} from "../../utils/assertion";

type MarqueeDirection = "left" | "right" | "up" | "down";

type MarqueeScroll = "always" | "overflow";

/** Accepts the `--marquee-*` custom properties alongside regular styles. */
type MarqueeStyle = CSSProperties & Partial<Record<`--marquee-${string}`, string | number>>;

/* Every state is driven by a data attribute, so no slot carries a variant. */
const slots = marqueeVariants();
const itemClass = slots.item();
const sequenceClass = slots.sequence();
const trackClass = slots.track();

/* -------------------------------------------------------------------------------------------------
 * Marquee Root
 * -----------------------------------------------------------------------------------------------*/
interface MarqueeRootProps extends ComponentPropsWithRef<"div"> {}

const MarqueeRoot = ({children, className, ...props}: MarqueeRootProps) => (
  <div {...props} className={slots.base({className})} data-slot="marquee">
    {children}
  </div>
);

/* -------------------------------------------------------------------------------------------------
 * Marquee Prefix
 * -----------------------------------------------------------------------------------------------*/
interface MarqueePrefixProps extends ComponentPropsWithRef<"div"> {}

const MarqueePrefix = ({children, className, ...props}: MarqueePrefixProps) => (
  <div {...props} className={slots.prefix({className})} data-slot="marquee-prefix">
    {children}
  </div>
);

/* -------------------------------------------------------------------------------------------------
 * Marquee Suffix
 * -----------------------------------------------------------------------------------------------*/
interface MarqueeSuffixProps extends ComponentPropsWithRef<"div"> {}

const MarqueeSuffix = ({children, className, ...props}: MarqueeSuffixProps) => (
  <div {...props} className={slots.suffix({className})} data-slot="marquee-suffix">
    {children}
  </div>
);

/* -------------------------------------------------------------------------------------------------
 * Marquee Content
 * -----------------------------------------------------------------------------------------------*/
interface MarqueeContentProps extends Omit<ComponentPropsWithRef<"div">, "children" | "style"> {
  children?: ReactNode;
  /** Repeats the content until it fills the marquee. @default false */
  autoFill?: boolean;
  /** Scroll direction. @default "left" */
  direction?: MarqueeDirection;
  /** Pauses the animation while the content is hovered or holds focus. @default false */
  pauseOnInteraction?: boolean;
  /** Starts or pauses the animation. @default true */
  play?: boolean;
  /** Speed in pixels per second. @default 50 */
  speed?: number;
  /** Delay before the animation starts, in seconds. @default 0 */
  delay?: number;
  /** Shows a fading overlay at both edges. @default false */
  gradient?: boolean;
  /**
   * Space between repeated content in pixels. `"container"` spaces it one content box apart along
   * the scroll axis and leads with that space, so the content enters from beyond the edge and
   * scrolls fully out before it comes back. It needs a definite size on that axis. @default 16
   */
  gap?: number | "container";
  /**
   * `"overflow"` only scrolls when the content is longer than the content box; content that fits
   * sits still at the start edge, with no copy and no fades. @default "always"
   */
  scroll?: MarqueeScroll;
  /** Regular styles plus any `--marquee-*` override. */
  style?: MarqueeStyle;
}

/* The offset sizes report the layout box, so an ancestor `scale()` cannot skew the measured speed. */
const getAxisSize = (element: HTMLElement, direction: MarqueeDirection) =>
  direction === "up" || direction === "down" ? element.offsetHeight : element.offsetWidth;

const MarqueeContent = ({
  autoFill = false,
  children,
  className,
  delay = 0,
  direction = "left",
  gap = 16,
  gradient = false,
  pauseOnInteraction = false,
  play = true,
  ref,
  scroll = "always",
  speed = 50,
  style,
  ...props
}: MarqueeContentProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const sequenceRef = React.useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = React.useState({container: 0, sequence: 0});

  const measure = React.useCallback(() => {
    if (!contentRef.current || !sequenceRef.current) return;

    const nextMeasurement = {
      container: getAxisSize(contentRef.current, direction),
      sequence: getAxisSize(sequenceRef.current, direction),
    };

    setMeasurement((current) =>
      current.container === nextMeasurement.container &&
      current.sequence === nextMeasurement.sequence
        ? current
        : nextMeasurement,
    );
  }, [direction]);

  // One observer for both boxes; re-running on an axis change covers `direction`.
  useLayoutEffect(() => {
    const container = contentRef.current;
    const sequence = sequenceRef.current;

    if (!container || !sequence) return;

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(container);
    observer.observe(sequence);

    return () => observer.disconnect();
  }, [measure]);

  const multiplier =
    autoFill && measurement.container > 0 && measurement.sequence > 0
      ? Math.max(1, Math.ceil(measurement.container / measurement.sequence))
      : 1;
  const distance = autoFill
    ? measurement.sequence * multiplier
    : Math.max(measurement.sequence, measurement.container);
  const duration = distance > 0 && speed > 0 ? distance / speed : 1;
  // The measured sequence includes its trailing gap. Until it is measured, an overflow marquee
  // renders still, so the server and first paint show plain content instead of a masked track.
  const gapSize = gap === "container" ? measurement.container : Math.max(0, gap);
  const still =
    scroll === "overflow" &&
    (measurement.container === 0 || measurement.sequence - gapSize <= measurement.container);
  const paused = !play;
  // Wrapped once and shared by every copy: the identical element references let React skip
  // re-rendering the children when a resize updates the measurement.
  const items = React.useMemo(
    () =>
      React.Children.map(children, (child) => (
        <div className={itemClass} data-slot="marquee-item">
          {child}
        </div>
      )),
    [children],
  );
  const renderSequence = (
    copy: number,
    hidden: boolean,
    sequence?: RefObject<HTMLDivElement | null>,
  ) => (
    <div
      key={copy}
      ref={sequence}
      aria-hidden={hidden || undefined}
      className={sequenceClass}
      data-slot="marquee-sequence"
      inert={hidden || undefined}
    >
      {items}
    </div>
  );
  const marqueeStyle: MarqueeStyle = {
    "--marquee-delay": `${Math.max(0, delay)}s`,
    "--marquee-duration": `${Math.max(0.001, duration)}s`,
    "--marquee-gap": `${gapSize}px`,
    ...style,
  };

  return (
    <div
      {...props}
      ref={mergeRefs(contentRef, ref)}
      className={slots.content({className})}
      data-auto-fill={dataAttr(autoFill)}
      data-direction={direction}
      data-gap={gap === "container" ? gap : undefined}
      data-gradient={dataAttr(gradient && !still)}
      data-pause-on-interaction={dataAttr(pauseOnInteraction)}
      data-paused={dataAttr(paused)}
      data-ready={dataAttr(distance > 0)}
      data-slot="marquee-content"
      data-static={dataAttr(still)}
      style={marqueeStyle}
    >
      <div className={trackClass} data-slot="marquee-track">
        {renderSequence(0, false, sequenceRef)}
        {!still &&
          Array.from({length: multiplier - 1}, (_, index) => renderSequence(index + 1, true))}
      </div>
      {/* The whole track is hidden, so its sequences need no attributes of their own. */}
      {!still && (
        <div inert aria-hidden="true" className={trackClass} data-slot="marquee-track">
          {Array.from({length: multiplier}, (_, index) => renderSequence(index, false))}
        </div>
      )}
    </div>
  );
};

MarqueeRoot.displayName = "SY INC.Marquee";
MarqueeContent.displayName = "SY INC.Marquee.Content";
MarqueePrefix.displayName = "SY INC.Marquee.Prefix";
MarqueeSuffix.displayName = "SY INC.Marquee.Suffix";

export {MarqueeContent, MarqueePrefix, MarqueeRoot, MarqueeSuffix};

export type {
  MarqueeContentProps,
  MarqueeDirection,
  MarqueePrefixProps,
  MarqueeRootProps,
  MarqueeScroll,
  MarqueeStyle,
  MarqueeSuffixProps,
};
