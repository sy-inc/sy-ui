"use client";

import type {ComponentPropsWithRef, KeyboardEvent, RefObject} from "react";

import {overflowTextVariants} from "@sy-inc/styles";
import {useEffect, useRef, useState} from "react";
import {mergeProps, useFocusRing, useHover} from "react-aria";

import {useMediaQuery} from "../../hooks/use-media-query";
import {useSafeLayoutEffect} from "../../hooks/use-safe-layout-effect";
import {useScrollShadow} from "../scroll-shadow/use-scroll-shadow";

const slots = overflowTextVariants();

export interface OverflowTextProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Plain text to display on one line. */
  children: string;
  /** Scroll automatically on hover or focus. @default true */
  autoScroll?: boolean;
  /** Delay before automatic scrolling, in milliseconds. @default 400 */
  delay?: number;
  /** Automatic scrolling speed, in pixels per second. @default 40 */
  speed?: number;
}

export function OverflowText({
  autoScroll = true,
  children,
  className,
  delay = 0,
  speed = 40,
  tabIndex,
  ...props
}: OverflowTextProps) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const {hoverProps, isHovered} = useHover({});
  // `within`: the focusable element is the viewport, so the ring follows focus inside the root.
  const {focusProps, isFocusVisible} = useFocusRing({within: true});
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const active = isHovered || isFocusVisible;
  const isOverflowing = distance > 1;

  // The edge fades are the shared scroll-shadow behaviour; it owns the data attributes and the mask.
  useScrollShadow({
    containerRef: viewportRef as RefObject<HTMLElement>,
    isEnabled: true,
    offset: 0,
    orientation: "horizontal",
    visibility: "auto",
  });

  useSafeLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (!viewport || !content) return;
    const measure = () => setDistance(Math.max(0, viewport.scrollWidth - viewport.clientWidth));

    viewport.scrollLeft = 0;
    measure();
    const observer = new ResizeObserver(measure);

    observer.observe(viewport);
    observer.observe(content);

    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    const el = viewportRef.current;

    if (!el) return;
    if (!active) {
      el.scrollLeft = 0;
      setPaused(false);

      return;
    }
    // A non-positive speed would never reach the end, so it stays still rather than looping forever.
    if (!autoScroll || reduceMotion || isPaused || distance <= 1 || speed <= 0) return;

    const direction = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    const initial = Math.abs(el.scrollLeft);
    let frame = 0;
    let start: number | undefined;
    const step = (now: number) => {
      start ??= now;
      const position = Math.min(distance, initial + ((now - start) * speed) / 1000);

      el.scrollLeft = direction * position;
      if (position < distance) frame = requestAnimationFrame(step);
    };
    const timer = window.setTimeout(
      () => {
        frame = requestAnimationFrame(step);
      },
      Math.max(0, delay),
    );

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [active, autoScroll, children, delay, distance, isPaused, reduceMotion, speed]);

  // Any key press stops the current automatic scroll. Browsers scroll a focused container with the
  // arrow keys already, but Home and End are vertical commands, so both ends are handled here.
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    setPaused(true);

    const el = viewportRef.current;

    if (!el || distance <= 1 || event.defaultPrevented) return;
    if (event.key !== "Home" && event.key !== "End") return;
    const direction = getComputedStyle(el).direction === "rtl" ? -1 : 1;

    el.scrollLeft = event.key === "End" ? direction * distance : 0;
    event.preventDefault();
  };

  return (
    <div
      {...mergeProps(hoverProps, focusProps, props)}
      className={slots.base({className})}
      data-focus-visible={isFocusVisible || undefined}
      data-hovered={isHovered || undefined}
      data-overflowing={isOverflowing}
      data-slot="overflow-text"
    >
      {/* The viewport is the scroll container, so the browser handles the arrow keys and dragging. */}
      <span
        ref={viewportRef}
        className={slots.viewport()}
        data-slot="overflow-text-viewport"
        tabIndex={tabIndex ?? (isOverflowing ? 0 : undefined)}
        onKeyDown={onKeyDown}
        onTouchStart={() => setPaused(true)}
        onWheel={() => setPaused(true)}
      >
        <span ref={contentRef} className={slots.content()} data-slot="overflow-text-content">
          {children}
        </span>
      </span>
    </div>
  );
}
