"use client";

import type {ScrollShadowVariants} from "@sy-inc/styles";
import type {RefObject} from "react";

import {mergeRefs} from "@react-aria/utils";
import {scrollShadowVariants} from "@sy-inc/styles";
import {useMemo, useRef} from "react";

import {useSafeLayoutEffect} from "../../hooks/use-safe-layout-effect";

import {useScrollShadow, writeScrollState} from "./use-scroll-shadow";

export type ScrollShadowVisibility = "auto" | "both" | "top" | "bottom" | "left" | "right" | "none";

export interface ScrollShadowRootProps
  extends Omit<React.ComponentProps<"div">, "size">, ScrollShadowVariants {
  /**
   * The shadow size in pixels. When omitted, `--scroll-shadow-size` comes from CSS (40px by default).
   */
  size?: number;

  /**
   * The scroll offset before showing shadows (in pixels)
   * @default 0
   */
  offset?: number;

  /**
   * Controlled shadow visibility state
   * @default "auto"
   */
  visibility?: ScrollShadowVisibility;

  /**
   * Whether scroll shadow detection is enabled
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Callback invoked when shadow visibility changes
   */
  onVisibilityChange?: (visibility: ScrollShadowVisibility) => void;
}

export const ScrollShadowRoot = ({
  children,
  className,
  hideScrollBar = false,
  isEnabled = true,
  offset = 0,
  onVisibilityChange,
  orientation = "vertical",
  ref,
  size,
  style: styleProp,
  variant = "fade",
  visibility = "auto",
  ...props
}: ScrollShadowRootProps) => {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMemo(() => mergeRefs(internalRef, ref), [ref]);

  useScrollShadow({
    containerRef: internalRef as RefObject<HTMLElement>,
    isEnabled,
    offset,
    onVisibilityChange,
    orientation,
    visibility,
  });

  // Handle controlled visibility mode
  useSafeLayoutEffect(() => {
    const el = internalRef.current;

    if (!el || visibility === "auto") return;

    const before = visibility === "both" || visibility === "top" || visibility === "left";
    const after = visibility === "both" || visibility === "bottom" || visibility === "right";

    writeScrollState(el, orientation, before, after);
  }, [visibility, orientation]);

  const slots = useMemo(
    () =>
      scrollShadowVariants({
        hideScrollBar,
        orientation,
        variant,
      }),
    [orientation, hideScrollBar, variant],
  );

  // Only an explicit `size` is written inline, so CSS can set `--scroll-shadow-size` otherwise.
  const style = {
    ...(size !== undefined && {"--scroll-shadow-size": `${size}px`}),
    ...styleProp,
  } as React.CSSProperties;

  return (
    <div
      ref={mergedRef}
      className={slots.base({className})}
      data-orientation={orientation}
      data-scroll-shadow-size={size}
      data-slot="scroll-shadow"
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

ScrollShadowRoot.displayName = "SY INC.ScrollShadow";
