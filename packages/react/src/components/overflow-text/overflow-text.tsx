"use client";

import type {ComponentPropsWithRef, KeyboardEvent, ReactNode, RefObject} from "react";

import {mergeRefs} from "@react-aria/utils";
import {overflowTextVariants} from "@sy-inc/styles";
import {
  Children,
  createContext,
  isValidElement,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {mergeProps, useFocusRing, useHover} from "react-aria";

import {useMediaQuery} from "../../hooks/use-media-query";
import {useSafeLayoutEffect} from "../../hooks/use-safe-layout-effect";
import {composeSlotClassName} from "../../utils/compose";
import {useScrollShadow} from "../scroll-shadow/use-scroll-shadow";

const slots = overflowTextVariants();

interface OverflowTextContextValue {
  contentRef: RefObject<HTMLSpanElement | null>;
  viewportRef: RefObject<HTMLSpanElement | null>;
  /** Scroll wiring the Root owns: the tab stop and the gestures that stop auto-scrolling. */
  viewportProps: Pick<
    ComponentPropsWithRef<"span">,
    "onKeyDown" | "onTouchStart" | "onWheel" | "tabIndex"
  >;
}

const OverflowTextContext = createContext<OverflowTextContextValue | null>(null);

const useOverflowText = (part: string) => {
  const context = use(OverflowTextContext);

  if (!context) throw new Error(`OverflowText.${part} must be rendered inside OverflowText.Root`);

  return context;
};

/* -------------------------------------------------------------------------------------------------
 * OverflowText Root — owns the measurement, the hover/focus state and the scroll animation.
 * -----------------------------------------------------------------------------------------------*/
export interface OverflowTextRootProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** A plain string gets the default Viewport / Content pair. Compose the parts for anything else. */
  children: ReactNode;
  /** Scroll automatically on hover or focus. @default true */
  autoScroll?: boolean;
  /** Delay before automatic scrolling, in milliseconds. @default 400 */
  delay?: number;
  /** Automatic scrolling speed, in pixels per second. @default 40 */
  speed?: number;
}

export function OverflowTextRoot({
  autoScroll = true,
  children,
  className,
  delay = 0,
  speed = 40,
  tabIndex,
  ...props
}: OverflowTextRootProps) {
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

  // Shorthand: plain children get the default Viewport / Content pair.
  const isComposed = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === OverflowTextViewport,
  );

  return (
    <OverflowTextContext
      value={{
        contentRef,
        viewportProps: {
          onKeyDown,
          onTouchStart: () => setPaused(true),
          onWheel: () => setPaused(true),
          tabIndex: tabIndex ?? (isOverflowing ? 0 : undefined),
        },
        viewportRef,
      }}
    >
      <div
        {...mergeProps(hoverProps, focusProps, props)}
        className={slots.base({className})}
        data-focus-visible={isFocusVisible || undefined}
        data-hovered={isHovered || undefined}
        data-overflowing={isOverflowing}
        data-slot="overflow-text"
      >
        {isComposed ? (
          children
        ) : (
          <OverflowTextViewport>
            <OverflowTextContent>{children}</OverflowTextContent>
          </OverflowTextViewport>
        )}
      </div>
    </OverflowTextContext>
  );
}

/* -------------------------------------------------------------------------------------------------
 * OverflowText Viewport — the scroll container and the tab stop.
 * -----------------------------------------------------------------------------------------------*/
export interface OverflowTextViewportProps extends ComponentPropsWithRef<"span"> {}

export function OverflowTextViewport({className, ref, ...props}: OverflowTextViewportProps) {
  const {viewportProps, viewportRef} = useOverflowText("Viewport");
  const mergedRef = useMemo(() => mergeRefs<HTMLSpanElement>(viewportRef, ref), [viewportRef, ref]);

  return (
    <span
      {...mergeProps(viewportProps, props)}
      ref={mergedRef}
      className={composeSlotClassName(slots.viewport, className)}
      data-slot="overflow-text-viewport"
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * OverflowText Content — the measured line. Its width is what decides whether anything overflows.
 * -----------------------------------------------------------------------------------------------*/
export interface OverflowTextContentProps extends ComponentPropsWithRef<"span"> {}

export function OverflowTextContent({className, ref, ...props}: OverflowTextContentProps) {
  const {contentRef} = useOverflowText("Content");
  const mergedRef = useMemo(() => mergeRefs<HTMLSpanElement>(contentRef, ref), [contentRef, ref]);

  return (
    <span
      {...props}
      ref={mergedRef}
      className={composeSlotClassName(slots.content, className)}
      data-slot="overflow-text-content"
    />
  );
}

OverflowTextRoot.displayName = "SY INC.OverflowText";
OverflowTextViewport.displayName = "SY INC.OverflowText.Viewport";
OverflowTextContent.displayName = "SY INC.OverflowText.Content";
