"use client";

import type {MarqueeVariants} from "@sy-inc/styles";
import type {CSSProperties, ComponentPropsWithRef, ReactNode} from "react";

import {mergeRefs, useResizeObserver} from "@react-aria/utils";
import {marqueeVariants} from "@sy-inc/styles";
import React from "react";

import {dataAttr} from "../../utils/assertion";

type MarqueeDirection = "left" | "right" | "up" | "down";

/** Accepts the `--marquee-*` custom properties alongside regular styles. */
type MarqueeStyle = CSSProperties & Partial<Record<`--marquee-${string}`, string | number>>;

interface MarqueeProps
  extends Omit<ComponentPropsWithRef<"div">, "children" | "style">, MarqueeVariants {
  children?: ReactNode;
  /** Repeats the content until it fills the marquee. @default false */
  autoFill?: boolean;
  /** Scroll direction. @default "left" */
  direction?: MarqueeDirection;
  /** Starts or pauses the animation. @default true */
  play?: boolean;
  /** Speed in pixels per second. @default 50 */
  speed?: number;
  /** Delay before the animation starts, in seconds. @default 0 */
  delay?: number;
  /** Shows a fading overlay at both edges. @default false */
  gradient?: boolean;
  /** Space between repeated content in pixels. @default 16 */
  gap?: number;
  /** Regular styles plus any `--marquee-*` override. */
  style?: MarqueeStyle;
}

const getAxisSize = (element: HTMLElement, direction: MarqueeDirection) => {
  const rect = element.getBoundingClientRect();

  return direction === "up" || direction === "down" ? rect.height : rect.width;
};

const Marquee = ({
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
  speed = 50,
  style,
  ...props
}: MarqueeProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sequenceRef = React.useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = React.useState({container: 0, sequence: 0});
  const slots = React.useMemo(() => marqueeVariants({pauseOnInteraction}), [pauseOnInteraction]);

  const measure = React.useCallback(() => {
    if (!rootRef.current || !sequenceRef.current) return;

    const nextMeasurement = {
      container: getAxisSize(rootRef.current, direction),
      sequence: getAxisSize(sequenceRef.current, direction),
    };

    setMeasurement((current) =>
      current.container === nextMeasurement.container &&
      current.sequence === nextMeasurement.sequence
        ? current
        : nextMeasurement,
    );
  }, [direction]);

  useResizeObserver({ref: rootRef, onResize: measure});
  useResizeObserver({ref: sequenceRef, onResize: measure});
  // Covers the initial pass and axis changes; ResizeObserver only reports subsequent resizes.
  React.useEffect(() => measure(), [measure]);

  const multiplier =
    autoFill && measurement.container > 0 && measurement.sequence > 0
      ? Math.max(1, Math.ceil(measurement.container / measurement.sequence))
      : 1;
  const distance = autoFill
    ? measurement.sequence * multiplier
    : Math.max(measurement.sequence, measurement.container);
  const duration = distance > 0 && speed > 0 ? distance / speed : 1;
  const paused = !play;
  const renderSequence = (copy: number, hidden: boolean) => (
    <div
      key={copy}
      ref={copy === 0 && !hidden ? sequenceRef : undefined}
      aria-hidden={hidden ? "true" : undefined}
      className={slots.sequence()}
      data-slot="marquee-sequence"
      inert={hidden ? true : undefined}
    >
      {React.Children.map(children, (child) => (
        <div className={slots.item()} data-slot="marquee-item">
          {child}
        </div>
      ))}
    </div>
  );
  const marqueeStyle: MarqueeStyle = {
    "--marquee-delay": `${Math.max(0, delay)}s`,
    "--marquee-duration": `${Math.max(0.001, duration)}s`,
    "--marquee-gap": `${Math.max(0, gap)}px`,
    ...style,
  };

  return (
    <div
      {...props}
      ref={mergeRefs(rootRef, ref)}
      className={slots.base({className})}
      data-auto-fill={dataAttr(autoFill)}
      data-direction={direction}
      data-gradient={dataAttr(gradient)}
      data-paused={dataAttr(paused)}
      data-ready={dataAttr(distance > 0)}
      data-slot="marquee"
      style={marqueeStyle}
    >
      <div className={slots.track()} data-slot="marquee-track">
        {renderSequence(0, false)}
        {Array.from({length: multiplier - 1}, (_, index) => renderSequence(index + 1, true))}
      </div>
      <div inert aria-hidden="true" className={slots.track()} data-slot="marquee-track">
        {Array.from({length: multiplier}, (_, index) => renderSequence(index, true))}
      </div>
    </div>
  );
};

Marquee.displayName = "SY INC.Marquee";

export {Marquee};

export type {MarqueeDirection, MarqueeProps, MarqueeStyle};
